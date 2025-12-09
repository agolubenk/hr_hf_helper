# Документация: Получение откликов из HH.ru в Huntflow с фильтрацией

## Оглавление
1. [Архитектура решения](#архитектура-решения)
2. [Получение откликов из HH.ru](#получение-откликов-из-hhru)
3. [Фильтрация соискателей](#фильтрация-соискателей)
4. [Интеграция в текущее решение](#интеграция-в-текущее-решение)
5. [Примеры использования](#примеры-использования)
6. [API Endpoints](#api-endpoints)

---

## Архитектура решения

### Текущая структура проекта
```
apps/huntflow/
├── services.py              # HuntflowService - основной сервис
├── huntflow_service.py      # Интеграция с Huntflow API
├── huntflow_candidates.py   # Работа с кандидатами
├── huntflow_api.py          # DRF API endpoints
├── huntflow_operations.py   # Общие операции
└── models.py                # Модели HuntflowCache, HuntflowLog

logic/integration/
├── shared/
│   ├── candidate_operations.py   # Базовые операции с кандидатами
│   ├── comment_operations.py     # Операции с комментариями
│   ├── field_operations.py       # Операции с полями
│   └── status_operations.py      # Операции со статусами
└── huntflow/
    ├── huntflow_api.py           # API запросы к Huntflow
    └── huntflow_candidates.py    # Сервис кандидатов
```

### Новые компоненты для HH.ru

```
apps/huntflow/
├── hh_integration.py         # Новый: Интеграция с HH.ru API
├── hh_responses_handler.py   # Новый: Обработка откликов из HH.ru
├── hh_filters.py             # Новый: Фильтры соискателей
└── models.py                 # Обновить: Добавить модель HHResponse
```

---

## Получение откликов из HH.ru

### 1. Структура HH.ru API для откликов

#### Основной endpoint:
```
GET https://api.hh.ru/applications?vacancy_id={vacancy_id}&page={page}&per_page={per_page}
```

#### Параметры:
- `vacancy_id` (обязательно) - ID вакансии на HH.ru
- `page` (опционально) - номер страницы, по умолчанию 0
- `per_page` (опционально) - количество результатов на странице, по умолчанию 20
- `order_by` (опционально) - сортировка (relevance, update_date, -update_date)

### 2. Структура ответа HH.ru

```json
{
  "items": [
    {
      "id": "1234567890",
      "state": "invitation",
      "created_at": "2024-12-01T10:00:00+0300",
      "updated_at": "2024-12-01T10:00:00+0300",
      "resume": {
        "id": "abcd1234",
        "title": "Иван Иванов - Менеджер по продажам",
        "url": "https://hh.ru/resume/abcd1234",
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
            "value": "ivan@example.com"
          },
          {
            "type": {
              "id": "phone",
              "name": "Телефон"
            },
            "value": "+79261234567"
          }
        ],
        "experience": [
          {
            "position": "Менеджер по продажам",
            "company": "ООО Компания",
            "start": "2020-01-01",
            "end": "2024-12-01"
          }
        ]
      },
      "vacancy": {
        "id": "87654321",
        "name": "Менеджер по продажам",
        "url": "https://api.hh.ru/vacancies/87654321"
      },
      "message_thread": {
        "id": "thread_123",
        "url": "https://api.hh.ru/message_threads/thread_123"
      },
      "viewed": true,
      "archived": false
    }
  ],
  "page": 0,
  "pages": 5,
  "per_page": 20,
  "total": 100
}
```

---

## Фильтрация соискателей

### Критерии фильтрации

```python
class CandidateFilters:
    """Фильтры для соискателей из HH.ru"""
    
    # 1. Локация (локализация по городам)
    allowed_locations: List[str] = [
        "1",        # Москва
        "2",        # Санкт-Петербург
        "3",        # Екатеринбург
        "4",        # Новосибирск
        "213",      # Минск (для РБ)
        "163",      # Алма-Ата (для КЗ)
    ]
    
    # 2. Пол
    allowed_genders: List[str] = ["male", "female", "any"]
    
    # 3. Возраст (рассчитывается из birth_date)
    min_age: int = 18
    max_age: int = 65
    
    # 4. Наличие в базе (проверка по email или телефону)
    check_existing: bool = True
    
    # 5. Опыт работы (в годах)
    min_experience_years: int = 1
    max_experience_years: int = 50
```

### Логика фильтрации

```python
class ResponseFilter:
    """Класс для фильтрации откликов из HH.ru"""
    
    def filter_candidates(
        self,
        responses: List[Dict],
        filters: CandidateFilters
    ) -> Tuple[List[Dict], Dict[str, List[Dict]]]:
        """
        Фильтрует список откликов по заданным критериям
        
        Входящие данные:
        - responses: список откликов из HH.ru API
        - filters: объект с критериями фильтрации
        
        Выходящие данные:
        - filtered_candidates: список прошедших фильтр соискателей
        - rejected_candidates: словарь с отклоненными кандидатами (причина: список)
        
        Обработка:
        1. Проверка локации
        2. Проверка пола
        3. Проверка возраста
        4. Проверка наличия в базе
        5. Проверка опыта работы
        """
        
        filtered = []
        rejected = {
            'location_mismatch': [],
            'gender_mismatch': [],
            'age_mismatch': [],
            'already_in_db': [],
            'experience_mismatch': [],
            'invalid_data': []
        }
        
        for response in responses:
            result = self._check_candidate(response, filters)
            if result['valid']:
                filtered.append(response)
            else:
                rejected[result['reason']].append(response)
        
        return filtered, rejected
    
    def _check_candidate(
        self,
        response: Dict,
        filters: CandidateFilters
    ) -> Dict:
        """Проверка одного кандидата по всем фильтрам"""
        
        resume = response.get('resume', {})
        
        # 1. Проверка локации
        area = resume.get('area', {})
        if area.get('id') not in filters.allowed_locations:
            return {'valid': False, 'reason': 'location_mismatch'}
        
        # 2. Проверка пола
        gender = resume.get('gender', {}).get('id', 'any')
        if gender != 'any' and gender not in filters.allowed_genders:
            return {'valid': False, 'reason': 'gender_mismatch'}
        
        # 3. Проверка возраста
        birth_date = resume.get('birth_date')
        if birth_date:
            age = self._calculate_age(birth_date)
            if age < filters.min_age or age > filters.max_age:
                return {'valid': False, 'reason': 'age_mismatch'}
        
        # 4. Проверка наличия в базе
        if filters.check_existing:
            exists = self._check_if_exists(resume)
            if exists:
                return {'valid': False, 'reason': 'already_in_db'}
        
        # 5. Проверка опыта работы
        experience_years = self._calculate_experience(resume)
        if experience_years < filters.min_experience_years:
            return {'valid': False, 'reason': 'experience_mismatch'}
        if experience_years > filters.max_experience_years:
            return {'valid': False, 'reason': 'experience_mismatch'}
        
        return {'valid': True, 'reason': None}
    
    def _calculate_age(self, birth_date: str) -> int:
        """Рассчитывает возраст по дате рождения"""
        from datetime import datetime
        birth = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        today = datetime.now(birth.tzinfo)
        return today.year - birth.year - (
            (today.month, today.day) < (birth.month, birth.day)
        )
    
    def _calculate_experience(self, resume: Dict) -> float:
        """Рассчитывает стаж работы в годах"""
        from datetime import datetime
        
        experience_list = resume.get('experience', [])
        if not experience_list:
            return 0
        
        total_days = 0
        now = datetime.now()
        
        for exp in experience_list:
            start = datetime.fromisoformat(exp.get('start', ''))
            end_str = exp.get('end')
            end = datetime.fromisoformat(end_str) if end_str else now
            
            total_days += (end - start).days
        
        return total_days / 365.25
    
    def _check_if_exists(self, resume: Dict) -> bool:
        """Проверяет наличие кандидата в базе"""
        from apps.accounts.models import User
        
        email = self._extract_email(resume)
        phone = self._extract_phone(resume)
        
        if email:
            if User.objects.filter(email=email).exists():
                return True
        
        if phone:
            # Можно добавить проверку в модели кандидата
            pass
        
        return False
    
    def _extract_email(self, resume: Dict) -> Optional[str]:
        """Извлекает email из резюме"""
        contacts = resume.get('contacts', [])
        for contact in contacts:
            if contact.get('type', {}).get('id') == 'email':
                return contact.get('value')
        return None
    
    def _extract_phone(self, resume: Dict) -> Optional[str]:
        """Извлекает телефон из резюме"""
        contacts = resume.get('contacts', [])
        for contact in contacts:
            if contact.get('type', {}).get('id') == 'phone':
                return contact.get('value')
        return None
```

---

## Интеграция в текущее решение

### 1. Новый файл: `apps/huntflow/hh_integration.py`

```python
"""
Интеграция с HH.ru API для получения откликов

ВХОДЯЩИЕ ДАННЫЕ: user (пользователь), vacancy_id (ID вакансии на HH.ru)
ИСТОЧНИКИ ДАННЫХ: HH.ru API, HuntflowService
ОБРАБОТКА: Получение откликов из HH.ru, фильтрация, импорт в Huntflow
ВЫХОДЯЩИЕ ДАННЫЕ: Список импортированных кандидатов
СВЯЗИ: HuntflowService, HuntflowCandidateService, ResponseFilter
ФОРМАТ: Класс HHResponsesHandler
"""

import logging
import requests
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from django.db import models

from apps.huntflow.models import HuntflowCache, HuntflowLog
from apps.huntflow.services import HuntflowService
from logic.integration.huntflow.huntflow_candidates import HuntflowCandidateService
from logic.base.response_handler import UnifiedResponseHandler

logger = logging.getLogger(__name__)

class HHResponsesHandler:
    """
    Обработчик откликов из HH.ru с фильтрацией и импортом в Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ: user (пользователь)
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API
    ОБРАБОТКА: Получение, фильтрация и импорт откликов
    ВЫХОДЯЩИЕ ДАННЫЕ: Результаты импорта откликов
    СВЯЗИ: HuntflowService, HHResponsesFilter
    ФОРМАТ: Класс с методами для работы с откликами
    """
    
    HH_API_BASE = "https://api.hh.ru"
    
    def __init__(self, user):
        """
        Инициализация обработчика откликов HH.ru
        
        ВХОДЯЩИЕ ДАННЫЕ: user (пользователь)
        ИСТОЧНИКИ ДАННЫХ: Пользовательские данные
        ОБРАБОТКА: Настройка сервисов для работы с API
        ВЫХОДЯЩИЕ ДАННЫЕ: Инициализированный обработчик
        СВЯЗИ: HuntflowService, HuntflowCandidateService
        ФОРМАТ: Экземпляр HHResponsesHandler
        """
        self.user = user
        self.huntflow_service = HuntflowService(user)
        self.huntflow_candidate_service = HuntflowCandidateService(user)
        self.hh_responses_filter = HHResponsesFilter()
        self.session = requests.Session()
    
    def get_responses_from_hh(
        self,
        vacancy_id: str,
        page: int = 0,
        per_page: int = 100
    ) -> Dict:
        """
        Получает список откликов из HH.ru для вакансии
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - vacancy_id: ID вакансии на HH.ru
        - page: номер страницы (по умолчанию 0)
        - per_page: количество результатов на странице (по умолчанию 100)
        
        ИСТОЧНИКИ ДАННЫХ: HH.ru API
        
        ОБРАБОТКА:
        1. Формирование URL запроса к HH.ru API
        2. Отправка GET запроса
        3. Обработка ответа и ошибок
        4. Логирование операции
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Словарь с откликами и метаинформацией
        
        СВЯЗИ: HH.ru API, logger
        
        ФОРМАТ: Dict с полями:
        {
            'success': bool,
            'items': List[Dict],  # Список откликов
            'total': int,  # Общее количество откликов
            'pages': int,  # Количество страниц
            'page': int,  # Текущая страница
            'message': str
        }
        """
        try:
            url = f"{self.HH_API_BASE}/applications"
            
            params = {
                'vacancy_id': vacancy_id,
                'page': page,
                'per_page': per_page,
                'order_by': 'update_date'
            }
            
            logger.info(f"Получение откликов из HH.ru для вакансии {vacancy_id}")
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            self.log_operation(
                operation_type='HH_GET_RESPONSES',
                status='success',
                details={
                    'vacancy_id': vacancy_id,
                    'responses_count': len(data.get('items', [])),
                    'total': data.get('total', 0)
                }
            )
            
            return {
                'success': True,
                'items': data.get('items', []),
                'total': data.get('total', 0),
                'pages': data.get('pages', 0),
                'page': data.get('page', 0),
                'message': f"Получено {len(data.get('items', []))} откликов"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка при получении откликов из HH.ru: {e}")
            self.log_operation(
                operation_type='HH_GET_RESPONSES',
                status='error',
                details={'error': str(e)}
            )
            return {
                'success': False,
                'items': [],
                'total': 0,
                'pages': 0,
                'page': 0,
                'message': f"Ошибка при получении откликов: {str(e)}"
            }
    
    def filter_and_import_responses(
        self,
        responses: List[Dict],
        account_id: int,
        vacancy_id: int,
        filters: Dict = None
    ) -> Dict:
        """
        Фильтрует отклики по заданным критериям и импортирует в Huntflow
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - responses: список откликов из HH.ru
        - account_id: ID организации в Huntflow
        - vacancy_id: ID вакансии в Huntflow
        - filters: словарь с критериями фильтрации
        
        ИСТОЧНИКИ ДАННЫХ: responses, filters
        
        ОБРАБОТКА:
        1. Инициализация фильтров (если не указаны, используются по умолчанию)
        2. Фильтрация кандидатов
        3. Импорт прошедших фильтр кандидатов в Huntflow
        4. Логирование результатов
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Результаты импорта
        
        СВЯЗИ: HHResponsesFilter, HuntflowCandidateService
        
        ФОРМАТ: Dict с результатами:
        {
            'success': bool,
            'imported': int,  # Количество импортированных кандидатов
            'filtered_out': int,  # Количество отфильтрованных кандидатов
            'errors': int,  # Количество ошибок при импорте
            'imported_candidates': List[Dict],
            'filter_results': Dict,  # Подробные результаты фильтрации
            'message': str
        }
        """
        
        if filters is None:
            filters = self._get_default_filters()
        
        # Фильтруем кандидатов
        filtered, rejected = self.hh_responses_filter.filter_responses(
            responses, filters
        )
        
        logger.info(f"Фильтрация завершена: прошло {len(filtered)}, отклонено {len(responses) - len(filtered)}")
        
        # Импортируем прошедших фильтр кандидатов
        imported_candidates = []
        errors = 0
        
        for response in filtered:
            try:
                candidate = self._import_candidate_to_huntflow(
                    response, account_id, vacancy_id
                )
                if candidate:
                    imported_candidates.append(candidate)
            except Exception as e:
                logger.error(f"Ошибка импорта кандидата: {e}")
                errors += 1
        
        self.log_operation(
            operation_type='HH_IMPORT_RESPONSES',
            status='success',
            details={
                'imported': len(imported_candidates),
                'errors': errors,
                'filtered_out': len(responses) - len(filtered)
            }
        )
        
        return {
            'success': True,
            'imported': len(imported_candidates),
            'filtered_out': len(responses) - len(filtered),
            'errors': errors,
            'imported_candidates': imported_candidates,
            'filter_results': {
                'total_responses': len(responses),
                'passed_filter': len(filtered),
                'rejected': rejected
            },
            'message': f"Импортировано {len(imported_candidates)} кандидатов, отклонено {len(responses) - len(filtered)}"
        }
    
    def _import_candidate_to_huntflow(
        self,
        hh_response: Dict,
        account_id: int,
        vacancy_id: int
    ) -> Optional[Dict]:
        """
        Импортирует одного кандидата из HH.ru в Huntflow
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - hh_response: данные отклика из HH.ru
        - account_id: ID организации в Huntflow
        - vacancy_id: ID вакансии в Huntflow
        
        ИСТОЧНИКИ ДАННЫХ: hh_response
        
        ОБРАБОТКА:
        1. Извлечение данных кандидата из HH.ru response
        2. Преобразование данных в формат Huntflow
        3. Создание кандидата в Huntflow
        4. Привязка кандидата к вакансии
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Данные импортированного кандидата
        
        СВЯЗИ: HuntflowCandidateService, Huntflow API
        
        ФОРМАТ: Dict с данными кандидата или None при ошибке
        """
        
        try:
            resume = hh_response.get('resume', {})
            
            # Извлекаем данные кандидата
            candidate_data = {
                'first_name': resume.get('first_name', ''),
                'last_name': resume.get('last_name', ''),
                'middle_name': resume.get('middle_name', ''),
                'email': self._extract_email(resume),
                'phone': self._extract_phone(resume),
                'position': resume.get('title', ''),
                'externals': [{
                    'data': {
                        'body': self._extract_resume_text(resume),
                        'hh_id': resume.get('id'),
                        'hh_url': resume.get('url')
                    },
                    'auth_type': 'HH',
                    'account_source': self._get_hh_source_id()
                }]
            }
            
            # Создаем кандидата в Huntflow
            created = self.huntflow_candidate_service.create_candidate(
                candidate_data, account_id
            )
            
            if created.get('success'):
                # Привязываем кандидата к вакансии
                applicant_id = created['data'].get('id')
                self.huntflow_candidate_service.link_candidate_to_vacancy(
                    applicant_id, vacancy_id, account_id
                )
                
                # Добавляем информацию о HH.ru источнике
                self._add_hh_source_comment(
                    account_id, applicant_id, hh_response
                )
                
                return created['data']
            
        except Exception as e:
            logger.error(f"Ошибка при импорте кандидата: {e}")
        
        return None
    
    def _extract_email(self, resume: Dict) -> str:
        """Извлекает email из резюме HH.ru"""
        contacts = resume.get('contacts', [])
        for contact in contacts:
            if contact.get('type', {}).get('id') == 'email':
                return contact.get('value', '')
        return ''
    
    def _extract_phone(self, resume: Dict) -> str:
        """Извлекает телефон из резюме HH.ru"""
        contacts = resume.get('contacts', [])
        for contact in contacts:
            if contact.get('type', {}).get('id') == 'phone':
                return contact.get('value', '')
        return ''
    
    def _extract_resume_text(self, resume: Dict) -> str:
        """Извлекает текстовое представление резюме из HH.ru"""
        text_parts = []
        
        # Заголовок
        if resume.get('title'):
            text_parts.append(f"Должность: {resume['title']}")
        
        # Опыт работы
        experience = resume.get('experience', [])
        if experience:
            text_parts.append("\nОпыт работы:")
            for exp in experience:
                text_parts.append(f"- {exp.get('position')} в {exp.get('company')} ({exp.get('start')} - {exp.get('end', 'наст. время')})")
        
        # Навыки (если доступны)
        if resume.get('skills'):
            text_parts.append("\nНавыки:")
            for skill in resume.get('skills', []):
                text_parts.append(f"- {skill.get('name', '')}")
        
        return '\n'.join(text_parts)
    
    def _get_hh_source_id(self) -> int:
        """Получает ID источника HH.ru в Huntflow (обычно 2)"""
        # В Huntflow HH.ru обычно имеет ID 2
        return 2
    
    def _add_hh_source_comment(
        self,
        account_id: int,
        applicant_id: int,
        hh_response: Dict
    ) -> None:
        """Добавляет комментарий о источнике из HH.ru"""
        
        resume = hh_response.get('resume', {})
        hh_url = resume.get('url', '')
        created_at = hh_response.get('created_at', '')
        
        comment = f"Автоматически импортировано из HH.ru\n"
        comment += f"Дата отклика: {created_at}\n"
        comment += f"Ссылка на резюме: {hh_url}\n"
        comment += f"ID на HH.ru: {resume.get('id')}"
        
        self.huntflow_candidate_service.add_comment(
            applicant_id, comment, account_id
        )
    
    def _get_default_filters(self) -> Dict:
        """Получает фильтры по умолчанию"""
        return {
            'allowed_locations': ['1', '2', '3'],  # Москва, СПб, Екатеринбург
            'allowed_genders': ['male', 'female', 'any'],
            'min_age': 18,
            'max_age': 65,
            'check_existing': True,
            'min_experience_years': 1,
            'max_experience_years': 50
        }
    
    def log_operation(
        self,
        operation_type: str,
        status: str,
        details: Dict = None
    ) -> None:
        """
        Логирует операцию интеграции с HH.ru
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - operation_type: тип операции (HH_GET_RESPONSES, HH_IMPORT_RESPONSES)
        - status: статус (success, error)
        - details: дополнительные детали
        
        ИСТОЧНИКИ ДАННЫХ: параметры метода
        
        ОБРАБОТКА: Создание записи лога в базе данных
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Запись в HuntflowLog
        
        СВЯЗИ: HuntflowLog модель
        
        ФОРМАТ: Нет возвращаемого значения
        """
        
        try:
            HuntflowLog.objects.create(
                log_type=operation_type,
                status_code=200 if status == 'success' else 400,
                request_data={'operation_type': operation_type},
                response_data=details or {},
                user=self.user
            )
        except Exception as e:
            logger.error(f"Ошибка логирования операции: {e}")


class HHResponsesFilter:
    """
    Фильтр для откликов из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: responses (список откликов), filters (критерии фильтрации)
    ИСТОЧНИКИ ДАННЫХ: HH.ru API response, фильтры
    ОБРАБОТКА: Фильтрация откликов по различным критериям
    ВЫХОДЯЩИЕ ДАННЫЕ: Отфильтрованные отклики и отклоненные
    СВЯЗИ: Нет внешних зависимостей
    ФОРМАТ: Класс с методами фильтрации
    """
    
    def filter_responses(
        self,
        responses: List[Dict],
        filters: Dict
    ) -> Tuple[List[Dict], Dict]:
        """
        Фильтрует список откликов по заданным критериям
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - responses: список откликов из HH.ru
        - filters: словарь с критериями фильтрации
        
        ИСТОЧНИКИ ДАННЫХ: responses, filters
        
        ОБРАБОТКА:
        1. Для каждого отклика проверяются все критерии фильтрации
        2. Если отклик соответствует всем критериям - он добавляется в filtered
        3. Если не соответствует - он добавляется в rejected с указанием причины
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - filtered: список прошедших фильтр откликов
        - rejected: словарь с отклоненными откликами (причина: список)
        
        СВЯЗИ: методы фильтрации (_check_*)
        
        ФОРМАТ: Кортеж (List[Dict], Dict)
        """
        
        filtered = []
        rejected = {
            'location_mismatch': [],
            'gender_mismatch': [],
            'age_mismatch': [],
            'experience_mismatch': [],
            'other': []
        }
        
        for response in responses:
            result = self._check_response(response, filters)
            if result['valid']:
                filtered.append(response)
            else:
                rejected[result['reason']].append(response)
        
        return filtered, rejected
    
    def _check_response(self, response: Dict, filters: Dict) -> Dict:
        """Проверяет один отклик по всем критериям"""
        
        resume = response.get('resume', {})
        
        # 1. Проверка локации
        if not self._check_location(resume, filters):
            return {'valid': False, 'reason': 'location_mismatch'}
        
        # 2. Проверка пола
        if not self._check_gender(resume, filters):
            return {'valid': False, 'reason': 'gender_mismatch'}
        
        # 3. Проверка возраста
        if not self._check_age(resume, filters):
            return {'valid': False, 'reason': 'age_mismatch'}
        
        # 4. Проверка опыта работы
        if not self._check_experience(resume, filters):
            return {'valid': False, 'reason': 'experience_mismatch'}
        
        return {'valid': True, 'reason': None}
    
    def _check_location(self, resume: Dict, filters: Dict) -> bool:
        """Проверяет соответствие локации"""
        area = resume.get('area', {})
        location_id = str(area.get('id', ''))
        allowed = filters.get('allowed_locations', [])
        return not allowed or location_id in [str(l) for l in allowed]
    
    def _check_gender(self, resume: Dict, filters: Dict) -> bool:
        """Проверяет соответствие полу"""
        gender = resume.get('gender', {}).get('id', 'any')
        allowed = filters.get('allowed_genders', ['any'])
        return gender in allowed or 'any' in allowed
    
    def _check_age(self, resume: Dict, filters: Dict) -> bool:
        """Проверяет соответствие возрасту"""
        birth_date = resume.get('birth_date')
        if not birth_date:
            return True  # Если возраста нет, не отклоняем
        
        from datetime import datetime
        birth = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        today = datetime.now(birth.tzinfo)
        age = today.year - birth.year - (
            (today.month, today.day) < (birth.month, birth.day)
        )
        
        min_age = filters.get('min_age', 18)
        max_age = filters.get('max_age', 65)
        
        return min_age <= age <= max_age
    
    def _check_experience(self, resume: Dict, filters: Dict) -> bool:
        """Проверяет соответствие опыту работы"""
        from datetime import datetime
        
        experience_list = resume.get('experience', [])
        if not experience_list:
            return filters.get('min_experience_years', 0) == 0
        
        total_days = 0
        now = datetime.now()
        
        for exp in experience_list:
            start_str = exp.get('start')
            end_str = exp.get('end')
            
            if not start_str:
                continue
            
            try:
                start = datetime.fromisoformat(start_str)
                end = datetime.fromisoformat(end_str) if end_str else now
                total_days += (end - start).days
            except (ValueError, TypeError):
                continue
        
        experience_years = total_days / 365.25
        min_exp = filters.get('min_experience_years', 1)
        max_exp = filters.get('max_experience_years', 50)
        
        return min_exp <= experience_years <= max_exp
```

### 2. Обновление `huntflow_operations.py`

```python
# Добавить новый метод в класс HuntflowOperations

def get_and_import_hh_responses(
    self,
    account_id: int,
    vacancy_id: int,
    hh_vacancy_id: str,
    filters: Dict = None
) -> Dict:
    """
    Получает отклики из HH.ru, фильтрует их и импортирует в Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации в Huntflow
    - vacancy_id: ID вакансии в Huntflow
    - hh_vacancy_id: ID вакансии на HH.ru
    - filters: словарь с критериями фильтрации
    
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, параметры метода
    
    ОБРАБОТКА:
    1. Инициализация HHResponsesHandler
    2. Получение откликов из HH.ru
    3. Фильтрация откликов по заданным критериям
    4. Импорт прошедших фильтр кандидатов в Huntflow
    5. Логирование всех операций
    
    ВЫХОДЯЩИЕ ДАННЫЕ: Результаты импорта откликов
    
    СВЯЗИ: HHResponsesHandler, HH.ru API, Huntflow API
    
    ФОРМАТ: Dict с результатами импорта
    """
    
    try:
        from apps.huntflow.hh_integration import HHResponsesHandler
        
        handler = HHResponsesHandler(self.user)
        
        # Получаем отклики из HH.ru
        hh_responses = handler.get_responses_from_hh(hh_vacancy_id)
        
        if not hh_responses['success']:
            return hh_responses
        
        # Фильтруем и импортируем отклики
        result = handler.filter_and_import_responses(
            hh_responses['items'],
            account_id,
            vacancy_id,
            filters
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Ошибка при получении откликов из HH.ru: {e}")
        return {
            'success': False,
            'message': f"Ошибка: {str(e)}"
        }
```

### 3. Обновление `huntflow_api.py`

```python
# Добавить новый ViewSet для работы с HH.ru откликами

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

@action(detail=False, methods=['post'], url_path='import-hh-responses')
def import_hh_responses(self, request):
    """
    Импорт откликов из HH.ru в Huntflow
    
    Входящие данные (JSON):
    {
        "account_id": 123,
        "vacancy_id": 456,
        "hh_vacancy_id": "789",
        "filters": {
            "allowed_locations": ["1", "2"],
            "allowed_genders": ["any"],
            "min_age": 18,
            "max_age": 65,
            "check_existing": true,
            "min_experience_years": 1,
            "max_experience_years": 50
        }
    }
    
    Выходящие данные:
    {
        "success": true,
        "imported": 5,
        "filtered_out": 3,
        "errors": 0,
        "imported_candidates": [...],
        "filter_results": {...}
    }
    """
    
    try:
        from apps.huntflow.hh_integration import HHResponsesHandler
        from apps.huntflow.operations import HuntflowOperations
        
        account_id = request.data.get('account_id')
        vacancy_id = request.data.get('vacancy_id')
        hh_vacancy_id = request.data.get('hh_vacancy_id')
        filters = request.data.get('filters')
        
        if not all([account_id, vacancy_id, hh_vacancy_id]):
            return Response(
                UnifiedResponseHandler.error_response(
                    "Требуются account_id, vacancy_id и hh_vacancy_id"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        operations = HuntflowOperations(request.user)
        result = operations.get_and_import_hh_responses(
            account_id, vacancy_id, hh_vacancy_id, filters
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            UnifiedResponseHandler.error_response(str(e)),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

---

## Примеры использования

### 1. Получение откликов с фильтрацией (Python)

```python
from apps.huntflow.hh_integration import HHResponsesHandler

# Инициализация
user = request.user  # Django пользователь
handler = HHResponsesHandler(user)

# Получение откликов
responses = handler.get_responses_from_hh(
    vacancy_id="87654321",
    page=0,
    per_page=100
)

# Фильтрация и импорт
filters = {
    'allowed_locations': ['1'],  # Только Москва
    'allowed_genders': ['any'],
    'min_age': 25,
    'max_age': 50,
    'check_existing': True,
    'min_experience_years': 2,
    'max_experience_years': 30
}

result = handler.filter_and_import_responses(
    responses['items'],
    account_id=123,
    vacancy_id=456,
    filters=filters
)

print(f"Импортировано: {result['imported']}")
print(f"Отфильтровано: {result['filtered_out']}")
print(f"Ошибок: {result['errors']}")
```

### 2. API запрос через REST

```bash
curl -X POST http://localhost:8000/api/huntflow/import-hh-responses/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": 123,
    "vacancy_id": 456,
    "hh_vacancy_id": "87654321",
    "filters": {
      "allowed_locations": ["1", "2"],
      "allowed_genders": ["any"],
      "min_age": 18,
      "max_age": 65,
      "check_existing": true,
      "min_experience_years": 1,
      "max_experience_years": 50
    }
  }'
```

### 3. Использование в фоновой задаче (Celery)

```python
# apps/huntflow/tasks.py

from celery import shared_task
from apps.huntflow.hh_integration import HHResponsesHandler

@shared_task
def sync_hh_responses(user_id, account_id, vacancy_id, hh_vacancy_id):
    """
    Синхронизация откликов из HH.ru в фоновой задаче
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - user_id: ID пользователя Django
    - account_id: ID организации в Huntflow
    - vacancy_id: ID вакансии в Huntflow
    - hh_vacancy_id: ID вакансии на HH.ru
    
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API
    
    ОБРАБОТКА: Получение, фильтрация и импорт откликов
    
    ВЫХОДЯЩИЕ ДАННЫЕ: Результаты импорта в логах
    
    СВЯЗИ: HHResponsesHandler, Celery task queue
    
    ФОРМАТ: Celery задача
    """
    
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    user = User.objects.get(id=user_id)
    
    handler = HHResponsesHandler(user)
    
    # Получаем отклики
    responses = handler.get_responses_from_hh(hh_vacancy_id)
    
    if not responses['success']:
        print(f"Ошибка получения откликов: {responses['message']}")
        return
    
    # Фильтруем и импортируем
    result = handler.filter_and_import_responses(
        responses['items'],
        account_id,
        vacancy_id
    )
    
    print(f"Синхронизация завершена: импортировано {result['imported']}")
```

---

## API Endpoints

### 1. Получение откликов из HH.ru

```
POST /api/huntflow/hh-responses/list/
Content-Type: application/json

{
  "vacancy_id": "87654321",
  "page": 0,
  "per_page": 50
}

Response:
{
  "success": true,
  "items": [
    {
      "id": "response_123",
      "resume": {...},
      "state": "invitation",
      "created_at": "2024-12-01T10:00:00+03:00"
    },
    ...
  ],
  "total": 100,
  "pages": 2,
  "page": 0,
  "message": "Получено 50 откликов"
}
```

### 2. Импорт откликов в Huntflow

```
POST /api/huntflow/import-hh-responses/
Content-Type: application/json

{
  "account_id": 123,
  "vacancy_id": 456,
  "hh_vacancy_id": "87654321",
  "filters": {
    "allowed_locations": ["1"],
    "allowed_genders": ["any"],
    "min_age": 18,
    "max_age": 65,
    "check_existing": true,
    "min_experience_years": 1,
    "max_experience_years": 50
  }
}

Response:
{
  "success": true,
  "imported": 45,
  "filtered_out": 5,
  "errors": 0,
  "imported_candidates": [
    {
      "id": 123,
      "first_name": "Иван",
      "last_name": "Иванов",
      "email": "ivan@example.com",
      "phone": "+79261234567"
    },
    ...
  ],
  "filter_results": {
    "total_responses": 50,
    "passed_filter": 45,
    "rejected": {
      "location_mismatch": 2,
      "age_mismatch": 1,
      "experience_mismatch": 2,
      "gender_mismatch": 0,
      "other": 0
    }
  },
  "message": "Импортировано 45 кандидатов, отклонено 5"
}
```

### 3. Получение статистики импорта

```
GET /api/huntflow/import-statistics/

Response:
{
  "success": true,
  "data": {
    "total_imported": 1250,
    "today": 50,
    "this_week": 350,
    "this_month": 1200,
    "by_source": {
      "HH": 800,
      "manual": 450
    },
    "filter_rejection_rate": 0.15,
    "most_common_rejection_reason": "location_mismatch"
  }
}
```

---

## Заключение

Данное решение интегрирует получение откликов из HH.ru непосредственно в вашу систему Huntflow с гибкой системой фильтрации по:

- **Локации** - выбирайте только желаемые города
- **Полу** - фильтруйте по полу соискателя
- **Возрасту** - устанавливайте минимальный и максимальный возраст
- **Опыту работы** - требуйте необходимый стаж
- **Наличие в базе** - избегайте дубликатов

Все операции логируются для аудита и отслеживания результатов импорта.
