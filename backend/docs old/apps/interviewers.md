# Interviewers App Documentation

## Обзор

Приложение `interviewers` отвечает за управление интервьюерами и правилами их привлечения в системе HR Helper. Включает управление профилями интервьюеров, их календарями и настройку правил привлечения по грейдам.

## Основные функции

- Управление интервьюерами (создание, редактирование, удаление)
- Настройка правил привлечения интервьюеров по грейдам
- Управление лимитами интервью (дневные и недельные)
- Связь с календарями интервьюеров
- Валидация email адресов
- Автоматическая деактивация конкурирующих правил

## Модели данных

### Interviewer (Интервьюер)
Модель для хранения информации об интервьюерах.

**Поля:**
- `id` - Уникальный идентификатор
- `first_name` - Имя (CharField, max_length=100)
- `last_name` - Фамилия (CharField, max_length=100)
- `middle_name` - Отчество (CharField, max_length=100, blank=True)
- `email` - Email адрес (EmailField, unique=True)
- `calendar_link` - Ссылка на календарь (URLField, blank=True)
- `is_active` - Активен ли интервьюер (BooleanField, default=True)
- `created_at`, `updated_at` - Временные метки

**Методы:**
- `get_full_name()` - Получить полное имя интервьюера
- `get_short_name()` - Получить краткое имя интервьюера
- `clean()` - Валидация модели (проверка уникальности email)
- `save()` - Сохранение с валидацией

### InterviewRule (Правило привлечения интервьюеров)
Модель для настройки правил привлечения интервьюеров.

**Поля:**
- `id` - Уникальный идентификатор
- `name` - Название правила (CharField, max_length=200)
- `description` - Описание (TextField, blank=True)
- `daily_limit` - Лимит в день (PositiveIntegerField, default=5, validators=[1-50])
- `weekly_limit` - Лимит в неделю (PositiveIntegerField, default=20, validators=[1-200])
- `min_grade` - Минимальный грейд (ForeignKey на Grade)
- `max_grade` - Максимальный грейд (ForeignKey на Grade)
- `is_active` - Активно ли правило (BooleanField, default=True)
- `created_at`, `updated_at` - Временные метки

**Методы:**
- `get_grade_range()` - Получить диапазон грейдов в читаемом виде
- `is_grade_in_range(grade)` - Проверить, входит ли грейд в диапазон правила
- `save()` - Сохранение с автоматической деактивацией других правил

**Методы класса:**
- `get_active_rule()` - Получить активное правило
- `activate_rule(rule_id)` - Активировать правило и деактивировать все остальные

## API Endpoints

### Базовый URL
`/api/v1/interviewers/`

### Интервьюеры

#### GET /api/v1/interviewers/
Получение списка интервьюеров.

**Параметры запроса:**
- `is_active` - Фильтр по активности
- `search` - Поиск по имени, фамилии, email
- `ordering` - Сортировка (last_name, first_name, email, created_at)

**Ответ:**
```json
[
  {
    "id": 1,
    "first_name": "Иван",
    "last_name": "Петров",
    "middle_name": "Сергеевич",
    "email": "ivan.petrov@example.com",
    "calendar_link": "https://calendly.com/ivan-petrov",
    "is_active": true,
    "full_name": "Петров Иван Сергеевич",
    "short_name": "Иван С.",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/v1/interviewers/
Создание нового интервьюера.

**Тело запроса:**
```json
{
  "first_name": "Иван",
  "last_name": "Петров",
  "middle_name": "Сергеевич",
  "email": "ivan.petrov@example.com",
  "calendar_link": "https://calendly.com/ivan-petrov",
  "is_active": true
}
```

#### GET /api/v1/interviewers/{id}/
Получение интервьюера по ID.

#### PUT/PATCH /api/v1/interviewers/{id}/
Обновление интервьюера.

#### DELETE /api/v1/interviewers/{id}/
Удаление интервьюера.

#### POST /api/v1/interviewers/{id}/toggle-active/
Переключение активности интервьюера.

### Правила привлечения

#### GET /api/v1/interview-rules/
Получение списка правил привлечения.

**Параметры запроса:**
- `is_active` - Фильтр по активности
- `min_grade` - Фильтр по минимальному грейду
- `max_grade` - Фильтр по максимальному грейду
- `ordering` - Сортировка (name, min_grade, daily_limit)

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Стандартное правило",
    "description": "Стандартные лимиты для интервьюеров",
    "daily_limit": 5,
    "weekly_limit": 20,
    "min_grade": 1,
    "min_grade_name": "Junior",
    "max_grade": 3,
    "max_grade_name": "Senior",
    "is_active": true,
    "grade_range": "Junior - Senior",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/v1/interview-rules/
Создание нового правила привлечения.

**Тело запроса:**
```json
{
  "name": "Стандартное правило",
  "description": "Стандартные лимиты для интервьюеров",
  "daily_limit": 5,
  "weekly_limit": 20,
  "min_grade": 1,
  "max_grade": 3,
  "is_active": true
}
```

#### GET /api/v1/interview-rules/{id}/
Получение правила по ID.

#### PUT/PATCH /api/v1/interview-rules/{id}/
Обновление правила.

#### DELETE /api/v1/interview-rules/{id}/
Удаление правила.

#### POST /api/v1/interview-rules/{id}/activate/
Активация правила и деактивация всех остальных.

**Ответ:**
```json
{
  "detail": "Правило активировано",
  "rule": {
    "id": 1,
    "name": "Стандартное правило",
    "is_active": true
  }
}
```

#### GET /api/v1/interview-rules/active/
Получение активного правила.

**Ответ:**
```json
{
  "id": 1,
  "name": "Стандартное правило",
  "description": "Стандартные лимиты для интервьюеров",
  "daily_limit": 5,
  "weekly_limit": 20,
  "min_grade": 1,
  "min_grade_name": "Junior",
  "max_grade": 3,
  "max_grade_name": "Senior",
  "is_active": true,
  "grade_range": "Junior - Senior"
}
```

#### GET /api/v1/interview-rules/{id}/check-grade/
Проверка, входит ли грейд в диапазон правила.

**Параметры запроса:**
- `grade_id` - ID грейда для проверки

**Ответ:**
```json
{
  "rule_id": 1,
  "grade_id": 2,
  "grade_name": "Middle",
  "in_range": true,
  "grade_range": "Junior - Senior"
}
```

### Статистика

#### GET /api/v1/interviewers/stats/
Статистика по интервьюерам.

**Ответ:**
```json
{
  "total_interviewers": 25,
  "active_interviewers": 20,
  "inactive_interviewers": 5,
  "interviewers_with_calendar": 18,
  "interviewers_without_calendar": 7,
  "recent_interviewers": [
    {
      "id": 1,
      "full_name": "Петров Иван Сергеевич",
      "email": "ivan.petrov@example.com",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Связи с другими приложениями

### apps.finance
Связь через `InterviewRule.min_grade` и `InterviewRule.max_grade` (ForeignKey на Grade)

### apps.vacancies
Связь через `Vacancy.interviewers` (ManyToManyField на Interviewer)

## Разрешения

- **IsAuthenticated** - для всех endpoints
- **IsAdminUser** - для создания/удаления правил привлечения
- **IsOwnerOrAdmin** - для редактирования интервьюеров

## Валидация данных

### Interviewer
- Уникальность email адреса
- Валидация email формата
- Обязательные поля: first_name, last_name, email

### InterviewRule
- Валидация лимитов (1-50 для дневного, 1-200 для недельного)
- Проверка корректности диапазона грейдов (min_grade <= max_grade)
- Автоматическая деактивация конкурирующих правил

## Логирование

Все операции с интервьюерами и правилами логируются:
- Создание/изменение интервьюеров
- Переключение активности
- Создание/изменение правил привлечения
- Активация правил

## Примеры использования

### Создание интервьюера

```python
import requests

data = {
    "first_name": "Иван",
    "last_name": "Петров",
    "middle_name": "Сергеевич",
    "email": "ivan.petrov@example.com",
    "calendar_link": "https://calendly.com/ivan-petrov",
    "is_active": True
}

response = requests.post(
    "http://localhost:8000/api/v1/interviewers/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Создан интервьюер: {result['full_name']}")
```

### Получение списка интервьюеров

```python
response = requests.get(
    "http://localhost:8000/api/v1/interviewers/",
    headers={"Authorization": "Token your_token_here"}
)

interviewers = response.json()
for interviewer in interviewers:
    print(f"Интервьюер: {interviewer['full_name']}, Email: {interviewer['email']}")
```

### Создание правила привлечения

```python
data = {
    "name": "Стандартное правило",
    "description": "Стандартные лимиты для интервьюеров",
    "daily_limit": 5,
    "weekly_limit": 20,
    "min_grade": 1,
    "max_grade": 3,
    "is_active": True
}

response = requests.post(
    "http://localhost:8000/api/v1/interview-rules/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Создано правило: {result['name']}, Диапазон: {result['grade_range']}")
```

### Активация правила

```python
response = requests.post(
    "http://localhost:8000/api/v1/interview-rules/1/activate/",
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Активировано правило: {result['rule']['name']}")
```

### Проверка грейда в диапазоне

```python
response = requests.get(
    "http://localhost:8000/api/v1/interview-rules/1/check-grade/?grade_id=2",
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
if result['in_range']:
    print(f"Грейд {result['grade_name']} входит в диапазон {result['grade_range']}")
else:
    print(f"Грейд {result['grade_name']} не входит в диапазон {result['grade_range']}")
```

### Получение активного правила

```python
response = requests.get(
    "http://localhost:8000/api/v1/interview-rules/active/",
    headers={"Authorization": "Token your_token_here"}
)

rule = response.json()
print(f"Активное правило: {rule['name']}")
print(f"Дневной лимит: {rule['daily_limit']}")
print(f"Недельный лимит: {rule['weekly_limit']}")
print(f"Диапазон грейдов: {rule['grade_range']}")
```

### Получение статистики

```python
response = requests.get(
    "http://localhost:8000/api/v1/interviewers/stats/",
    headers={"Authorization": "Token your_token_here"}
)

stats = response.json()
print(f"Всего интервьюеров: {stats['total_interviewers']}")
print(f"Активных: {stats['active_interviewers']}")
print(f"С календарями: {stats['interviewers_with_calendar']}")
```
