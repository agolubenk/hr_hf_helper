# Полная документация: Получение и фильтрация откликов из HH.ru с интеграцией в Huntflow

## Оглавление
1. [Архитектура решения](#архитектура-решения)
2. [API HH.ru](#api-hhru)
3. [Система фильтрации](#система-фильтрации)
4. [Процесс импорта](#процесс-импорта)
5. [Обработка ошибок](#обработка-ошибок)
6. [Примеры использования](#примеры-использования)

---

## Архитектура решения

### Структура приложения

```
apps/huntflow/
├── hh_integration.py          # Основной класс интеграции с HH.ru
├── hh_auto_process.py         # Автоматическая обработка откликов
├── models.py                  # Модели БД (HHResponse, HHSyncConfiguration и т.д.)
├── huntflow_operations.py     # Методы для работы с Huntflow API
├── huntflow_api.py            # REST endpoints
├── tasks.py                   # Celery задачи для фоновой обработки
└── tests/
    └── test_hh_integration.py # Unit тесты
```

### Поток данных

```
┌─────────────────┐
│  HH.ru API      │
│  (Отклики)      │
└────────┬────────┘
         │ GET /vacancies/{id}/negotiations
         │
         ▼
┌─────────────────────────────────────┐
│  HHResponsesHandler                 │
│  .get_responses_from_hh()          │
│  (Получение откликов)              │
└────────┬────────────────────────────┘
         │ List[Dict] responses
         │
         ▼
┌─────────────────────────────────────┐
│  HHResponsesFilter                  │
│  .filter_responses()                │
│  (Фильтрация по критериям)         │
└────────┬────────────────────────────┘
         │ filtered[], rejected[]
         │
         ▼
┌─────────────────────────────────────┐
│  HHResponsesHandler                 │
│  .import_to_huntflow()             │
│  (Импорт в Huntflow API)           │
└────────┬────────────────────────────┘
         │ imported_candidates[]
         │
         ▼
┌─────────────────────────────────────┐
│  Huntflow API                       │
│  (Кандидаты в системе)              │
└─────────────────────────────────────┘
```

---

## API HH.ru

### Основные endpoints

#### 1. Получение откликов на вакансию

```http
GET https://api.hh.ru/vacancies/{vacancy_id}/negotiations
```

**Параметры**:
- `vacancy_id` - ID вакансии на HH.ru
- `page` - номер страницы (для пагинации)
- `per_page` - количество откликов на странице (макс 50)
- `state` - фильтр по статусу отклика

**Ответ**:
```json
{
  "page": 0,
  "per_page": 20,
  "pages": 1,
  "total": 5,
  "items": [
    {
      "id": "1234567890",
      "created_at": "2024-12-01T10:00:00+0300",
      "updated_at": "2024-12-01T10:00:00+0300",
      "state": "applied",
      "resume": {
        "id": "resume_id",
        "first_name": "Иван",
        "last_name": "Иванов",
        "middle_name": "Иванович",
        "birth_date": "1990-05-15",
        "gender": {
          "id": "male",
          "name": "Мужской"
        },
        "area": {
          "id": "1",
          "name": "Москва",
          "url": "https://api.hh.ru/areas/1"
        },
        "contacts": [
          {
            "type": {
              "id": "email",
              "name": "Электронная почта"
            },
            "value": "ivan@example.com",
            "preferred": true
          },
          {
            "type": {
              "id": "phone",
              "name": "Телефон"
            },
            "value": "+79261234567",
            "preferred": false
          }
        ],
        "experience": [
          {
            "company": "ООО Компания",
            "position": "Менеджер по продажам",
            "start": "2020-01-01",
            "end": "2024-11-30",
            "area": {
              "id": "1",
              "name": "Москва"
            },
            "industries": [
              {
                "id": "7.1",
                "name": "IT"
              }
            ]
          }
        ],
        "skills": [
          {
            "name": "Python",
            "level": {
              "id": "middle",
              "name": "Middle"
            }
          },
          {
            "name": "Django",
            "level": {
              "id": "middle",
              "name": "Middle"
            }
          }
        ],
        "url": "https://hh.ru/resume/12345678",
        "employment": {
          "id": "full_time",
          "name": "Полная занятость"
        },
        "metro": [
          {
            "id": "6.340",
            "name": "Тверская"
          }
        ]
      }
    }
  ]
}
```

### Обработка ошибок API

```python
def safe_api_call(url, params=None, headers=None):
    """
    Безопасный вызов API с обработкой ошибок
    
    ВХОДЯЩИЕ ДАННЫЕ: url, params, headers
    ИСТОЧНИКИ ДАННЫХ: HH.ru API
    ОБРАБОТКА: HTTP запрос с обработкой ошибок
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON ответ или ошибка
    СВЯЗИ: requests библиотека
    ФОРМАТ: Функция обработки
    """
    
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    # Настройка повторных попыток
    session = requests.Session()
    retry = Retry(
        total=3,                    # Всего 3 попытки
        read=3,
        connect=3,
        backoff_factor=0.3,         # Ждем 0.3, 0.6, 1.2 сек
        status_forcelist=(500, 502, 504)  # Повторяем при этих кодах
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('https://', adapter)
    
    try:
        response = session.get(
            url,
            params=params,
            headers=headers or {},
            timeout=30
        )
        response.raise_for_status()
        return {'success': True, 'data': response.json()}
    
    except requests.exceptions.Timeout:
        return {'success': False, 'error': 'API timeout', 'code': 'TIMEOUT'}
    
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': 'Connection error', 'code': 'CONNECTION_ERROR'}
    
    except requests.exceptions.HTTPError as e:
        if response.status_code == 429:  # Rate limit
            return {'success': False, 'error': 'Rate limited', 'code': 'RATE_LIMIT', 'retry_after': response.headers.get('Retry-After')}
        elif response.status_code == 401:  # Unauthorized
            return {'success': False, 'error': 'Unauthorized', 'code': 'UNAUTHORIZED'}
        elif response.status_code == 404:  # Not found
            return {'success': False, 'error': 'Not found', 'code': 'NOT_FOUND'}
        else:
            return {'success': False, 'error': str(e), 'code': 'HTTP_ERROR'}
    
    except Exception as e:
        return {'success': False, 'error': str(e), 'code': 'UNKNOWN_ERROR'}
```

---

## Система фильтрации

### Фильтры по локации

```python
def _check_location(self, resume, filters):
    """
    Проверяет соответствие локации
    
    ВХОДЯЩИЕ ДАННЫЕ: resume из HH.ru, filters с allowed_locations
    ИСТОЧНИКИ ДАННЫЕ: resume['area']
    ОБРАБОТКА: Сравнение ID локации с разрешенными
    ВЫХОДЯЩИЕ ДАННЫЕ: True если локация подходит, False если нет
    СВЯЗИ: логирование отклонений
    ФОРМАТ: Метод с return True/False
    
    Примеры фильтров:
    - Только Москва: {'allowed_locations': ['1']}
    - Москва или СПб: {'allowed_locations': ['1', '2']}
    - Все РФ: {'allowed_locations': [None]}  # None = не проверять локацию
    """
    
    if 'allowed_locations' not in filters or filters['allowed_locations'] is None:
        return True  # Локация не проверяется
    
    resume_location_id = resume.get('area', {}).get('id')
    allowed_locations = filters['allowed_locations']
    
    # Если allowed_locations содержит None, пропускаем проверку
    if None in allowed_locations:
        return True
    
    if resume_location_id in allowed_locations:
        return True
    else:
        # Также проверяем метро (может быть полезно для Москвы)
        metro_stations = resume.get('metro', [])
        for station in metro_stations:
            if station.get('id') in allowed_locations:
                return True
        
        return False
```

### Фильтры по полу

```python
def _check_gender(self, resume, filters):
    """
    Проверяет соответствие полу
    
    ВХОДЯЩИЕ ДАННЫЕ: resume из HH.ru, filters с allowed_genders
    ИСТОЧНИКИ ДАННЫЕ: resume['gender']
    ОБРАБОТКА: Сравнение пола с разрешенными
    ВЫХОДЯЩИЕ ДАННЫЕ: True если пол подходит, False если нет
    СВЯЗИ: логирование
    ФОРМАТ: Метод с return True/False
    
    Возможные значения:
    - 'male' - мужчина
    - 'female' - женщина
    - 'any' - не важно (пропускаем проверку)
    """
    
    if 'allowed_genders' not in filters or filters['allowed_genders'] is None:
        return True  # Пол не проверяется
    
    resume_gender = resume.get('gender', {}).get('id', 'any')
    allowed_genders = filters['allowed_genders']
    
    # Если 'any' в списке разрешенных, пропускаем проверку
    if 'any' in allowed_genders:
        return True
    
    return resume_gender in allowed_genders
```

### Фильтры по возрасту

```python
def _check_age(self, resume, filters):
    """
    Проверяет соответствие возрасту
    
    ВХОДЯЩИЕ ДАННЫЕ: resume из HH.ru, filters с min_age/max_age
    ИСТОЧНИКИ ДАННЫЕ: resume['birth_date']
    ОБРАБОТКА: Расчет возраста и сравнение с диапазоном
    ВЫХОДЯЩИЕ ДАННЫЕ: True если возраст подходит, False если нет
    СВЯЗИ: datetime для расчета
    ФОРМАТ: Метод с return True/False
    """
    
    birth_date_str = resume.get('birth_date')
    if not birth_date_str:
        return True  # Если даты нет, не отклоняем
    
    from datetime import datetime, date
    
    try:
        birth_date = datetime.fromisoformat(birth_date_str).date()
    except (ValueError, TypeError):
        return True  # Если дата в неправильном формате, не отклоняем
    
    # Расчет текущего возраста
    today = date.today()
    age = today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )
    
    min_age = filters.get('min_age', 18)
    max_age = filters.get('max_age', 65)
    
    return min_age <= age <= max_age
```

### Фильтры по опыту работы

```python
def _check_experience(self, resume, filters):
    """
    Проверяет соответствие опыту работы
    
    ВХОДЯЩИЕ ДАННЫЕ: resume из HH.ru, filters с min_experience_years/max_experience_years
    ИСТОЧНИКИ ДАННЫЕ: resume['experience']
    ОБРАБОТКА: Расчет общего стажа и сравнение с диапазоном
    ВЫХОДЯЩИЕ ДАННЫЕ: True если опыт подходит, False если нет
    СВЯЗИ: datetime для расчета
    ФОРМАТ: Метод с return True/False
    """
    
    experience_list = resume.get('experience', [])
    
    from datetime import datetime, date
    
    total_days = 0
    today = date.today()
    
    for exp in experience_list:
        try:
            start_str = exp.get('start')
            end_str = exp.get('end')
            
            if not start_str:
                continue
            
            start = datetime.fromisoformat(start_str).date()
            end = datetime.fromisoformat(end_str).date() if end_str else today
            
            total_days += (end - start).days
        
        except (ValueError, TypeError):
            continue
    
    experience_years = total_days / 365.25
    
    min_years = filters.get('min_experience_years', 0)
    max_years = filters.get('max_experience_years', 100)
    
    return min_years <= experience_years <= max_years
```

### Проверка наличия в базе

```python
def _check_already_in_db(self, resume, email, user):
    """
    Проверяет, есть ли кандидат уже в Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ: resume из HH.ru, email кандидата, user
    ИСТОЧНИКИ ДАННЫЕ: Django БД (Huntflow кандидаты)
    ОБРАБОТКА: Поиск кандидата по email или ФИ
    ВЫХОДЯЩИЕ ДАННЫЕ: True если кандидат уже в БД, False если новый
    СВЯЗИ: HuntflowApplicant модель
    ФОРМАТ: Метод с return True/False
    """
    
    from apps.huntflow.models import HuntflowApplicant
    from apps.huntflow.models import HHResponse
    
    email = email or ''
    first_name = resume.get('first_name', '').strip()
    last_name = resume.get('last_name', '').strip()
    
    # Проверка 1: по email (самый надежный способ)
    if email:
        if HuntflowApplicant.objects.filter(
            user=user,
            email__iexact=email
        ).exists():
            return True
        
        # Проверка в таблице HH откликов
        if HHResponse.objects.filter(
            imported_by=user,
            email__iexact=email
        ).exists():
            return True
    
    # Проверка 2: по ФИ (менее надежно, есть риск ложных положительных)
    if first_name and last_name:
        if HuntflowApplicant.objects.filter(
            user=user,
            first_name__iexact=first_name,
            last_name__iexact=last_name
        ).exists():
            return True
    
    return False
```

---

## Процесс импорта

### Создание кандидата в Huntflow

```python
def create_candidate_in_huntflow(self, response_data, account_id, vacancy_id):
    """
    Создает кандидата в Huntflow на основе отклика HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - response_data: данные из HH.ru API
    - account_id: ID организации в Huntflow
    - vacancy_id: ID вакансии в Huntflow
    
    ИСТОЧНИКИ ДАННЫЕ: HH.ru API response
    
    ОБРАБОТКА:
    1. Извлечение данных кандидата
    2. Форматирование для Huntflow API
    3. Отправка POST запроса на создание кандидата
    4. Обработка ответа и ошибок
    
    ВЫХОДЯЩИЕ ДАННЫЕ: ID созданного кандидата или ошибка
    
    СВЯЗИ: Huntflow API, HHResponse модель
    
    ФОРМАТ: Метод с return Dict
    """
    
    resume = response_data.get('resume', {})
    
    # Форматируем данные для Huntflow
    candidate_data = {
        'first_name': resume.get('first_name', ''),
        'last_name': resume.get('last_name', ''),
        'middle_name': resume.get('middle_name', ''),
        'email': '',
        'phone': '',
        'position': self._get_last_position(resume),
        'company': self._get_last_company(resume),
        'area': resume.get('area', {}).get('name', ''),
        'birthday': resume.get('birth_date', ''),
    }
    
    # Извлекаем email и телефон
    contacts = resume.get('contacts', [])
    for contact in contacts:
        contact_type = contact.get('type', {}).get('id')
        if contact_type == 'email':
            candidate_data['email'] = contact.get('value', '')
        elif contact_type == 'phone':
            candidate_data['phone'] = contact.get('value', '')
    
    # Отправляем на создание в Huntflow
    import requests
    
    url = f"{self.huntflow_base_url}/applicants"
    headers = {
        'Authorization': f'Bearer {self.huntflow_api_key}',
        'Content-Type': 'application/json'
    }
    
    params = {
        'account_id': account_id
    }
    
    try:
        response = requests.post(
            url,
            json=candidate_data,
            headers=headers,
            params=params,
            timeout=10
        )
        
        if response.status_code == 201:
            created_candidate = response.json()
            return {
                'success': True,
                'candidate_id': created_candidate['id'],
                'candidate': created_candidate
            }
        else:
            return {
                'success': False,
                'error': f'Failed to create candidate: {response.status_code}',
                'response': response.text
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def _get_last_position(self, resume):
    """Получает последнюю должность кандидата"""
    experience = resume.get('experience', [])
    if experience:
        return experience[0].get('position', '')
    return ''

def _get_last_company(self, resume):
    """Получает последнюю компанию, где работал кандидат"""
    experience = resume.get('experience', [])
    if experience:
        return experience[0].get('company', '')
    return ''
```

### Добавление кандидата на вакансию

```python
def add_candidate_to_vacancy(self, candidate_id, account_id, vacancy_id, source='HH.ru'):
    """
    Добавляет кандидата на вакансию в Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - candidate_id: ID кандидата в Huntflow
    - account_id: ID организации
    - vacancy_id: ID вакансии
    - source: источник кандидата ('HH.ru', 'SuperJob', и т.д.)
    
    ИСТОЧНИКИ ДАННЫЕ: Huntflow API
    
    ОБРАБОТКА:
    1. Подготовка данных для добавления на вакансию
    2. Отправка запроса в Huntflow
    3. Обработка ответа
    
    ВЫХОДЯЩИЕ ДАННЫЕ: ID заявки (applicant_on_vacancy) или ошибка
    
    СВЯЗИ: Huntflow API
    
    ФОРМАТ: Метод с return Dict
    """
    
    import requests
    
    url = f"{self.huntflow_base_url}/applicants/{candidate_id}/vacancy/{vacancy_id}"
    
    headers = {
        'Authorization': f'Bearer {self.huntflow_api_key}',
        'Content-Type': 'application/json'
    }
    
    params = {
        'account_id': account_id
    }
    
    data = {
        'vacancy': vacancy_id,
        'comment': f'Импортирован из {source}'
    }
    
    try:
        response = requests.post(
            url,
            json=data,
            headers=headers,
            params=params,
            timeout=10
        )
        
        if response.status_code == 201:
            vacancy_relation = response.json()
            return {
                'success': True,
                'applicant_on_vacancy_id': vacancy_relation['id'],
                'data': vacancy_relation
            }
        else:
            return {
                'success': False,
                'error': f'Failed to add candidate to vacancy: {response.status_code}',
                'response': response.text
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
```

### Добавление комментария к кандидату

```python
def add_comment_to_candidate(self, candidate_id, account_id, comment_text, hh_response_data):
    """
    Добавляет комментарий к кандидату в Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - candidate_id: ID кандидата в Huntflow
    - account_id: ID организации
    - comment_text: текст комментария
    - hh_response_data: данные отклика из HH.ru для справки
    
    ИСТОЧНИКИ ДАННЫЕ: Huntflow API, HH.ru данные
    
    ОБРАБОТКА:
    1. Форматирование комментария с информацией из HH.ru
    2. Отправка комментария в Huntflow
    3. Обработка ответа
    
    ВЫХОДЯЩИЕ ДАННЫЕ: ID комментария или ошибка
    
    СВЯЗИ: Huntflow API, comment_operations
    
    ФОРМАТ: Метод с return Dict
    """
    
    import requests
    from datetime import datetime
    
    resume = hh_response_data.get('resume', {})
    
    # Форматируем комментарий
    formatted_comment = f"""Импортирован из HH.ru

**Информация из отклика:**
- Дата отклика: {hh_response_data.get('created_at', 'N/A')}
- Статус отклика: {hh_response_data.get('state', 'N/A')}
- Опыт: {self._calculate_experience_string(resume)}
- Статус занятости: {resume.get('employment', {}).get('name', 'N/A')}

**Исходный комментарий:** {comment_text}

Ссылка на резюме: {resume.get('url', 'N/A')}
"""
    
    url = f"{self.huntflow_base_url}/applicants/{candidate_id}/comments"
    
    headers = {
        'Authorization': f'Bearer {self.huntflow_api_key}',
        'Content-Type': 'application/json'
    }
    
    params = {
        'account_id': account_id
    }
    
    data = {
        'text': formatted_comment
    }
    
    try:
        response = requests.post(
            url,
            json=data,
            headers=headers,
            params=params,
            timeout=10
        )
        
        if response.status_code == 201:
            comment = response.json()
            return {
                'success': True,
                'comment_id': comment['id'],
                'data': comment
            }
        else:
            return {
                'success': False,
                'error': f'Failed to add comment: {response.status_code}',
                'response': response.text
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def _calculate_experience_string(self, resume):
    """Вычисляет строку опыта работы"""
    from datetime import datetime, date
    
    experience = resume.get('experience', [])
    if not experience:
        return 'Не указан'
    
    total_days = 0
    today = date.today()
    
    for exp in experience:
        try:
            start = datetime.fromisoformat(exp.get('start', '')).date()
            end_str = exp.get('end')
            end = datetime.fromisoformat(end_str).date() if end_str else today
            total_days += (end - start).days
        except:
            continue
    
    years = total_days // 365
    months = (total_days % 365) // 30
    
    if years > 0:
        return f'{years} лет{" и " + str(months) + " месяцев" if months > 0 else ""}'
    else:
        return f'{months} месяцев'
```

---

## Обработка ошибок

### Стратегия обработки ошибок

```python
class ErrorHandler:
    """
    Централизованная обработка ошибок
    
    ВХОДЯЩИЕ ДАННЫЕ: error, context
    ИСТОЧНИКИ ДАННЫЕ: исключения из API
    ОБРАБОТКА: классификация и логирование ошибок
    ВЫХОДЯЩИЕ ДАННЫЕ: структурированное сообщение об ошибке
    СВЯЗИ: logging, models
    ФОРМАТ: Класс с методами обработки
    """
    
    ERROR_CODES = {
        'NETWORK_ERROR': 'Ошибка сети. Проверьте интернет соединение.',
        'API_ERROR': 'Ошибка API HH.ru или Huntflow. Попробуйте позже.',
        'AUTH_ERROR': 'Ошибка аутентификации. Проверьте API ключи.',
        'VALIDATION_ERROR': 'Некорректные данные. Проверьте входящие параметры.',
        'RATE_LIMIT': 'Превышен лимит запросов. Подождите и попробуйте позже.',
        'DUPLICATE_ERROR': 'Кандидат уже в системе.',
        'NOT_FOUND_ERROR': 'Ресурс не найден.',
        'UNKNOWN_ERROR': 'Неизвестная ошибка.'
    }
    
    @staticmethod
    def handle_http_error(status_code, response_text):
        """Обработка HTTP ошибок"""
        
        error_map = {
            400: 'VALIDATION_ERROR',
            401: 'AUTH_ERROR',
            403: 'AUTH_ERROR',
            404: 'NOT_FOUND_ERROR',
            429: 'RATE_LIMIT',
            500: 'API_ERROR',
            502: 'API_ERROR',
            503: 'API_ERROR',
            504: 'API_ERROR',
        }
        
        error_code = error_map.get(status_code, 'API_ERROR')
        
        return {
            'success': False,
            'error_code': error_code,
            'error_message': ErrorHandler.ERROR_CODES[error_code],
            'status_code': status_code,
            'details': response_text[:200]  # Первые 200 символов ответа
        }
    
    @staticmethod
    def handle_timeout():
        """Обработка timeout ошибок"""
        return {
            'success': False,
            'error_code': 'NETWORK_ERROR',
            'error_message': ErrorHandler.ERROR_CODES['NETWORK_ERROR'],
            'details': 'API запрос истек по времени'
        }
    
    @staticmethod
    def handle_connection_error():
        """Обработка ошибок соединения"""
        return {
            'success': False,
            'error_code': 'NETWORK_ERROR',
            'error_message': ErrorHandler.ERROR_CODES['NETWORK_ERROR'],
            'details': 'Не удается подключиться к API'
        }
```

### Логирование ошибок

```python
import logging

logger = logging.getLogger('huntflow_hh_integration')

def log_import_error(user_id, account_id, vacancy_id, error, error_details=None):
    """
    Логирует ошибку при импорте откликов
    
    ВХОДЯЩИЕ ДАННЫЕ: user_id, account_id, vacancy_id, error, error_details
    ИСТОЧНИКИ ДАННЫЕ: обработчик ошибок
    ОБРАБОТКА: форматирование и сохранение логов
    ВЫХОДЯЩИЕ ДАННЫЕ: логи в файл и БД
    СВЯЗИ: logging, models
    ФОРМАТ: Функция логирования
    """
    
    logger.error(
        f"Import error for user {user_id}, account {account_id}, vacancy {vacancy_id}",
        exc_info=True,
        extra={
            'user_id': user_id,
            'account_id': account_id,
            'vacancy_id': vacancy_id,
            'error': str(error),
            'details': str(error_details)
        }
    )
    
    # Сохраняем в БД для истории
    from apps.huntflow.models import HHSyncLog
    
    log = HHSyncLog.objects.create(
        configuration_id=None,  # Если нет конфигурации
        status='failed',
        error_message=str(error),
        error_details=error_details or {}
    )
    
    return log
```

---

## Примеры использования

### Пример 1: Простой импорт откликов

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.huntflow.hh_integration import HHResponsesHandler

@api_view(['POST'])
def import_hh_responses(request):
    """
    Импортирует отклики из HH.ru
    
    POST /api/huntflow/import-hh-responses/
    {
        "account_id": 123,
        "vacancy_id": 456,
        "hh_vacancy_id": "87654321",
        "filters": {
            "allowed_locations": ["1"],
            "min_age": 25,
            "max_age": 50
        }
    }
    """
    
    try:
        handler = HHResponsesHandler(request.user)
        
        # Получаем параметры
        account_id = request.data.get('account_id')
        vacancy_id = request.data.get('vacancy_id')
        hh_vacancy_id = request.data.get('hh_vacancy_id')
        filters = request.data.get('filters', {})
        
        # Получаем и импортируем отклики
        result = handler.get_and_import_responses(
            hh_vacancy_id=hh_vacancy_id,
            account_id=account_id,
            vacancy_id=vacancy_id,
            filters=filters
        )
        
        return Response(result)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)
```

### Пример 2: С автоматической синхронизацией

```python
# tasks.py
from celery import shared_task
from apps.huntflow.hh_integration import HHResponsesHandler
from apps.huntflow.models import HHSyncConfiguration

@shared_task
def sync_hh_responses_hourly():
    """Синхронизирует отклики из HH.ru каждый час"""
    
    # Получаем все активные конфигурации синхронизации
    configs = HHSyncConfiguration.objects.filter(
        enabled=True,
        sync_frequency__in=['hourly', 'daily', 'weekly']
    )
    
    results = []
    
    for config in configs:
        try:
            handler = HHResponsesHandler(config.user)
            
            result = handler.get_and_import_responses(
                hh_vacancy_id=config.hh_vacancy_id,
                account_id=config.account_id,
                vacancy_id=config.vacancy_id,
                filters=config.get_filters()
            )
            
            # Обновляем конфигурацию
            config.update_statistics(result)
            
            results.append({
                'config_id': config.id,
                'success': result['success'],
                'imported': result.get('imported', 0)
            })
        
        except Exception as e:
            results.append({
                'config_id': config.id,
                'success': False,
                'error': str(e)
            })
    
    return results
```

---

## Заключение

Данная документация охватывает:

✅ **Архитектуру** - полное понимание потока данных
✅ **API HH.ru** - все необходимые endpoints и обработка ошибок
✅ **Систему фильтрации** - множество критериев для фильтрации
✅ **Процесс импорта** - пошаговое создание кандидатов в Huntflow
✅ **Обработку ошибок** - надежная обработка исключений
✅ **Примеры** - готовые к использованию коды

Для имплементации используйте три документа:
- **HH_responses_integration.md** - полный исходный код
- **HH_integration_examples.md** - примеры использования и расширения
- **HH_models_and_queries.md** - модели БД и запросы
- **Implementation_checklist.md** - пошаговый план реализации
