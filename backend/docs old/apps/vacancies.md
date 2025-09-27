# Vacancies App Documentation

## Обзор

Приложение `vacancies` отвечает за управление локальными данными по вакансиям в системе HR Helper. Включает настройки для инвайтов, scorecard, вопросы для интервью, промпты для AI и привязку интервьюеров к вакансиям.

## Основные функции

- Управление вакансиями (создание, редактирование, удаление)
- Настройки инвайтов и Scorecard
- Вопросы для интервью по странам (Беларусь, Польша)
- Управление зарплатными вилками по грейдам
- Привязка интервьюеров к вакансиям
- Промпты для AI генерации контента
- Ссылки на вакансии по странам

## Модели данных

### Vacancy (Вакансия)
Модель для локальных данных по вакансиям.

**Поля:**
- `id` - Уникальный идентификатор
- `name` - Название вакансии (CharField, max_length=200)
- `external_id` - ID для связи с внешними системами (CharField, max_length=100, unique=True)
- `recruiter` - Ответственный рекрутер (ForeignKey на User, limit_choices_to={'groups__name': 'Рекрутер'})
- `invite_title` - Заголовок инвайтов (CharField, max_length=200)
- `invite_text` - Сопровождающий текст для инвайтов (TextField)
- `scorecard_title` - Заголовок Scorecard (CharField, max_length=200)
- `scorecard_link` - Ссылка на Scorecard (URLField, blank=True)
- `questions_belarus` - Вопросы для интервью в Беларуси (TextField, blank=True)
- `questions_poland` - Вопросы для интервью в Польше (TextField, blank=True)
- `vacancy_link_belarus` - Ссылка на вакансию в Беларуси (URLField, blank=True)
- `vacancy_link_poland` - Ссылка на вакансию в Польше (URLField, blank=True)
- `candidate_update_prompt` - Промпт для обновления информации о кандидате (TextField, blank=True)
- `invite_prompt` - Промпт для создания приглашения кандидату (TextField, blank=True)
- `screening_duration` - Длительность скринингов в минутах (PositiveIntegerField, default=45)
- `interviewers` - Интервьюеры (ManyToManyField на Interviewer, blank=True)
- `is_active` - Активна ли вакансия (BooleanField, default=True)
- `created_at`, `updated_at` - Временные метки

**Методы:**
- `clean()` - Валидация данных
- `save()` - Сохранение с валидацией
- `get_interviewers_count()` - Количество интервьюеров
- `get_interviewers_list()` - Список интервьюеров
- `has_interviewers()` - Есть ли интервьюеры
- `get_vacancy_links()` - Получить все ссылки на вакансии по странам
- `has_vacancy_links()` - Есть ли ссылки на вакансии
- `get_vacancy_links_count()` - Количество ссылок на вакансии
- `get_vacancy_link_by_country(country)` - Получить ссылку для конкретной страны

### SalaryRange (Зарплатная вилка)
Модель для зарплатных вилок по вакансиям с поддержкой множественных валют.

**Поля:**
- `id` - Уникальный идентификатор
- `vacancy` - Вакансия (ForeignKey на Vacancy)
- `grade` - Грейд (ForeignKey на Grade)
- `salary_min_usd` - Минимальная зарплата в USD (DecimalField)
- `salary_max_usd` - Максимальная зарплата в USD (DecimalField)
- `salary_min_byn` - Минимальная зарплата в BYN (DecimalField, автоматически рассчитывается)
- `salary_max_byn` - Максимальная зарплата в BYN (DecimalField, автоматически рассчитывается)
- `salary_min_pln` - Минимальная зарплата в PLN (DecimalField, автоматически рассчитывается)
- `salary_max_pln` - Максимальная зарплата в PLN (DecimalField, автоматически рассчитывается)
- `is_active` - Активна ли зарплатная вилка (BooleanField, default=True)
- `created_at`, `updated_at` - Временные метки

**Методы:**
- `clean()` - Валидация данных (проверка min <= max)
- `save()` - Сохранение с автоматическим расчетом валют
- `_calculate_other_currencies()` - Расчет зарплат в других валютах
- `get_salary_display(currency)` - Отформатированная зарплатная вилка для указанной валюты
- `get_salary_min(currency)` - Минимальная зарплата в указанной валюте
- `get_salary_max(currency)` - Максимальная зарплата в указанной валюте

## API Endpoints

### Базовый URL
`/api/v1/vacancies/`

### Вакансии

#### GET /api/v1/vacancies/
Получение списка вакансий.

**Параметры запроса:**
- `recruiter` - Фильтр по рекрутеру
- `is_active` - Фильтр по активности
- `available_grades` - Фильтр по доступным грейдам
- `search` - Поиск по названию, external_id, invite_title, scorecard_title
- `ordering` - Сортировка (name, created_at, updated_at)

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Python Developer",
    "external_id": "PYTHON_DEV_001",
    "recruiter_name": "Иван Иванов",
    "available_grades_count": 3,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/v1/vacancies/
Создание новой вакансии.

**Тело запроса:**
```json
{
  "name": "Python Developer",
  "external_id": "14",
  "recruiter": 1,
  "invite_title": "Приглашение на позицию Python Developer",
  "invite_text": "Приглашаем вас на собеседование...",
  "scorecard_title": "Scorecard для Python Developer",
  "scorecard_text": "Критерии оценки кандидата...",
  "available_grades": [1, 2, 3],
  "is_active": true
}
```

#### GET /api/v1/vacancies/{id}/
Получение вакансии по ID.

**Ответ:**
```json
{
  "id": 1,
  "name": "Python Developer",
  "external_id": "PYTHON_DEV_001",
  "recruiter": 1,
  "recruiter_name": "Иван Иванов",
  "recruiter_username": "ivan.ivanov",
  "invite_title": "Приглашение на позицию Python Developer",
  "invite_text": "Приглашаем вас на собеседование...",
  "scorecard_title": "Scorecard для Python Developer",
  "scorecard_text": "Критерии оценки кандидата...",
  "available_grades": [1, 2, 3],
  "available_grades_names": ["Junior", "Middle", "Senior"],
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### PUT/PATCH /api/v1/vacancies/{id}/
Обновление вакансии.

#### DELETE /api/v1/vacancies/{id}/
Удаление вакансии.

#### POST /api/v1/vacancies/{id}/toggle-active/
Переключение активности вакансии.

**Ответ:**
```json
{
  "id": 1,
  "name": "Python Developer",
  "external_id": "PYTHON_DEV_001",
  "is_active": false,
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### GET /api/v1/vacancies/my-vacancies/
Получение вакансий текущего пользователя.

#### POST /api/v1/vacancies/{id}/assign-grades/
Назначение грейдов вакансии.

**Тело запроса:**
```json
{
  "grade_ids": [1, 2, 3]
}
```

#### GET /api/v1/vacancies/stats/
Статистика по вакансиям.

**Ответ:**
```json
{
  "total_vacancies": 50,
  "active_vacancies": 35,
  "inactive_vacancies": 15,
  "vacancies_by_recruiter": {
    "ivan.ivanov": {
      "total": 10,
      "active": 8
    }
  },
  "vacancies_by_grade": {
    "Junior": 15,
    "Middle": 25,
    "Senior": 10
  },
  "recent_vacancies": [
    {
      "id": 1,
      "name": "Python Developer",
      "external_id": "PYTHON_DEV_001",
      "recruiter_name": "Иван Иванов",
      "available_grades_count": 3,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### GET /api/v1/vacancies/search/
Поиск вакансий с расширенными параметрами.

**Параметры запроса:**
- `q` - Поисковый запрос
- `grade_id` - Фильтр по грейду
- `recruiter_id` - Фильтр по рекрутеру
- `is_active` - Фильтр по активности

## Команды управления

### Обновление зарплатных вилок

#### update_salary_ranges
Обновление зарплатных вилок при изменении курсов валют.

```bash
python manage.py update_salary_ranges
python manage.py update_salary_ranges --force  # Принудительное обновление
```

**Функциональность:**
- Обновляет все активные зарплатные вилки
- Пересчитывает валюты на основе текущих курсов
- Информативный вывод результатов

**Вывод:**
- ✅ Успешное обновление
- ❌ Ошибки при обновлении
- 📊 Статистика обновления

## Формы

### VacancyForm
Форма для создания/редактирования вакансий.

**Поля:**
- `name` - Название вакансии
- `external_id` - ID для связи
- `recruiter` - Ответственный рекрутер
- `invite_title` - Заголовок инвайтов
- `invite_text` - Сопровождающий текст для инвайтов
- `scorecard_title` - Заголовок Scorecard
- `scorecard_link` - Ссылка на Scorecard
- `questions_belarus` - Вопросы Беларусь
- `questions_poland` - Вопросы Польша
- `vacancy_link_belarus` - Ссылка на вакансию (Беларусь)
- `vacancy_link_poland` - Ссылка на вакансию (Польша)
- `candidate_update_prompt` - Промпт для обновления кандидата
- `invite_prompt` - Промпт для инвайта
- `screening_duration` - Длительность скринингов
- `interviewers` - Интервьюеры
- `is_active` - Активна ли вакансия

### SalaryRangeForm
Форма для создания/редактирования зарплатных вилок.

**Поля:**
- `vacancy` - Вакансия
- `grade` - Грейд
- `salary_min_usd` - Минимальная зарплата в USD
- `salary_max_usd` - Максимальная зарплата в USD
- `is_active` - Активна ли зарплатная вилка

### VacancySearchForm
Форма для поиска вакансий.

**Поля:**
- `search` - Поиск по названию или ID
- `recruiter` - Фильтр по рекрутеру
- `is_active` - Фильтр по активности

### SalaryRangeSearchForm
Форма для поиска зарплатных вилок.

**Поля:**
- `search` - Поиск по вакансии или грейду
- `vacancy` - Фильтр по вакансии
- `grade` - Фильтр по грейду
- `is_active` - Фильтр по активности

## Связи с другими приложениями

### apps.accounts
Связь через `recruiter` (ForeignKey на User, ограничение на группу 'Рекрутер')

### apps.interviewers
Связь через `interviewers` (ManyToManyField)

### apps.finance
Связь через `SalaryRange.grade` (ForeignKey на Grade)

### apps.huntflow
Потенциальная связь через `external_id`

## Разрешения

- **IsAuthenticated** - для всех endpoints
- Ограничения по ролям: только рекрутеры могут создавать/редактировать вакансии
- Пользователи видят только свои вакансии (если не админ)

## Логирование

Все операции с вакансиями логируются:
- Создание/изменение вакансий
- Переключение активности
- Создание/изменение зарплатных вилок
- Обновление валютных курсов

## Примеры использования

### Создание вакансии

```python
import requests

data = {
    "name": "Python Developer",
    "external_id": "PYTHON_DEV_001",
    "recruiter": 1,
    "invite_title": "Приглашение на позицию Python Developer",
    "invite_text": "Приглашаем вас на собеседование на позицию Python Developer...",
    "scorecard_title": "Scorecard для Python Developer",
    "scorecard_text": "Критерии оценки кандидата на позицию Python Developer...",
    "available_grades": [1, 2, 3],
    "is_active": True
}

response = requests.post(
    "http://localhost:8000/api/v1/vacancies/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Создана вакансия: {result['name']} (ID: {result['id']})")
```

### Получение списка вакансий

```python
response = requests.get(
    "http://localhost:8000/api/v1/vacancies/",
    headers={"Authorization": "Token your_token_here"}
)

vacancies = response.json()
for vacancy in vacancies:
    print(f"Вакансия: {vacancy['name']}, Рекрутер: {vacancy['recruiter_name']}")
```

### Переключение активности вакансии

```python
response = requests.post(
    "http://localhost:8000/api/v1/vacancies/1/toggle-active/",
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Статус активности: {result['is_active']}")
```

### Назначение грейдов вакансии

```python
data = {"grade_ids": [1, 2, 3]}

response = requests.post(
    "http://localhost:8000/api/v1/vacancies/1/assign-grades/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Назначены грейды: {result['available_grades_names']}")
```

### Получение статистики

```python
response = requests.get(
    "http://localhost:8000/api/v1/vacancies/stats/",
    headers={"Authorization": "Token your_token_here"}
)

stats = response.json()
print(f"Всего вакансий: {stats['total_vacancies']}")
print(f"Активных: {stats['active_vacancies']}")
print(f"Неактивных: {stats['inactive_vacancies']}")
```

### Поиск вакансий

```python
response = requests.get(
    "http://localhost:8000/api/v1/vacancies/search/?q=Python&is_active=true",
    headers={"Authorization": "Token your_token_here"}
)

results = response.json()
print(f"Найдено вакансий: {len(results)}")
```

### Получение вакансий текущего пользователя

```python
response = requests.get(
    "http://localhost:8000/api/v1/vacancies/my-vacancies/",
    headers={"Authorization": "Token your_token_here"}
)

my_vacancies = response.json()
print(f"Мои вакансии: {len(my_vacancies)}")
```
