# JSON API Спецификация приложения Interviewers

## 🎯 Обзор

Данный документ содержит детальную JSON API спецификацию для приложения `interviewers` с примерами запросов, ответов и обработки ошибок.

**Версия API:** 1.0  
**Формат:** JSON  
**Дата обновления:** 2024-01-20

---

## 🔗 **БАЗОВЫЕ ENDPOINTS**

### Base URL: `/api/interviewers/`
### Authentication: `Token your_token_here`

---

## 📋 **INTERVIEWERS API**

### 1. **GET /api/interviewers/** - Список интервьюеров

**Запрос:**
```bash
GET /api/interviewers/
Authorization: Token your_token_here
Accept: application/json
```

**Параметры запроса:**
- `page` (int, optional) - Номер страницы для пагинации
- `page_size` (int, optional) - Размер страницы (по умолчанию 20)
- `search` (string, optional) - Поиск по имени, фамилии, email
- `is_active` (boolean, optional) - Фильтр по активности
- `ordering` (string, optional) - Сортировка (например: `last_name`, `-created_at`)

**Пример запроса:**
```bash
GET /api/interviewers/?search=Иван&is_active=true&ordering=last_name
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "count": 25,
    "next": "http://example.com/api/interviewers/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "first_name": "Иван",
            "last_name": "Иванов",
            "middle_name": "Иванович",
            "email": "ivan.ivanov@example.com",
            "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
            "is_active": true,
            "full_name": "Иванов Иван Иванович",
            "short_name": "И.И. Иванов",
            "created_at": "2024-01-20T10:00:00Z",
            "updated_at": "2024-01-20T10:00:00Z"
        },
        {
            "id": 2,
            "first_name": "Петр",
            "last_name": "Петров",
            "middle_name": "Петрович",
            "email": "petr.petrov@example.com",
            "calendar_link": "",
            "is_active": true,
            "full_name": "Петров Петр Петрович",
            "short_name": "П.П. Петров",
            "created_at": "2024-01-19T15:30:00Z",
            "updated_at": "2024-01-19T15:30:00Z"
        }
    ]
}
```

### 2. **POST /api/interviewers/** - Создание интервьюера

**Запрос:**
```bash
POST /api/interviewers/
Authorization: Token your_token_here
Content-Type: application/json

{
    "first_name": "Алексей",
    "last_name": "Алексеев",
    "middle_name": "Алексеевич",
    "email": "alexey.alexeev@example.com",
    "calendar_link": "",
    "is_active": true
}
```

**Ответ (201 Created):**
```json
{
    "id": 3,
    "first_name": "Алексей",
    "last_name": "Алексеев",
    "middle_name": "Алексеевич",
    "email": "alexey.alexeev@example.com",
    "calendar_link": "",
    "is_active": true,
    "full_name": "Алексеев Алексей Алексеевич",
    "short_name": "А.А. Алексеев",
    "created_at": "2024-01-20T12:00:00Z",
    "updated_at": "2024-01-20T12:00:00Z"
}
```

**Ошибка (400 Bad Request):**
```json
{
    "email": [
        "Интервьюер с таким email уже существует"
    ],
    "first_name": [
        "Это поле обязательно для заполнения."
    ]
}
```

### 3. **GET /api/interviewers/{id}/** - Детали интервьюера

**Запрос:**
```bash
GET /api/interviewers/1/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "id": 1,
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "email": "ivan.ivanov@example.com",
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": true,
    "full_name": "Иванов Иван Иванович",
    "short_name": "И.И. Иванов",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z"
}
```

**Ошибка (404 Not Found):**
```json
{
    "detail": "Не найдено."
}
```

### 4. **PUT /api/interviewers/{id}/** - Полное обновление

**Запрос:**
```bash
PUT /api/interviewers/1/
Authorization: Token your_token_here
Content-Type: application/json

{
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "email": "ivan.ivanov@example.com",
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": false
}
```

**Ответ (200 OK):**
```json
{
    "id": 1,
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "email": "ivan.ivanov@example.com",
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": false,
    "full_name": "Иванов Иван Иванович",
    "short_name": "И.И. Иванов",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T12:30:00Z"
}
```

### 5. **PATCH /api/interviewers/{id}/** - Частичное обновление

**Запрос:**
```bash
PATCH /api/interviewers/1/
Authorization: Token your_token_here
Content-Type: application/json

{
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": true
}
```

**Ответ (200 OK):**
```json
{
    "id": 1,
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "email": "ivan.ivanov@example.com",
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": true,
    "full_name": "Иванов Иван Иванович",
    "short_name": "И.И. Иванов",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T13:00:00Z"
}
```

### 6. **DELETE /api/interviewers/{id}/** - Удаление

**Запрос:**
```bash
DELETE /api/interviewers/1/
Authorization: Token your_token_here
```

**Ответ (204 No Content):**
```
(пустое тело ответа)
```

---

## 🔧 **КАСТОМНЫЕ ДЕЙСТВИЯ**

### 1. **POST /api/interviewers/{id}/toggle-active/** - Переключение активности

**Запрос:**
```bash
POST /api/interviewers/1/toggle-active/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "id": 1,
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "email": "ivan.ivanov@example.com",
    "calendar_link": "https://calendar.google.com/calendar/embed?src=ivan.ivanov%40example.com",
    "is_active": false,
    "full_name": "Иванов Иван Иванович",
    "short_name": "И.И. Иванов",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T13:15:00Z"
}
```

**Ошибка (400 Bad Request):**
```json
{
    "error": "Ошибка: Не удалось изменить статус активности"
}
```

### 2. **GET /api/interviewers/active/** - Активные интервьюеры

**Запрос:**
```bash
GET /api/interviewers/active/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
[
    {
        "id": 1,
        "full_name": "Иванов Иван Иванович",
        "email": "ivan.ivanov@example.com",
        "is_active": true
    },
    {
        "id": 2,
        "full_name": "Петров Петр Петрович",
        "email": "petr.petrov@example.com",
        "is_active": true
    }
]
```

### 3. **GET /api/interviewers/with-calendar/** - Интервьюеры с календарем

**Запрос:**
```bash
GET /api/interviewers/with-calendar/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
[
    {
        "id": 1,
        "full_name": "Иванов Иван Иванович",
        "email": "ivan.ivanov@example.com",
        "is_active": true
    }
]
```

### 4. **GET /api/interviewers/stats/** - Статистика

**Запрос:**
```bash
GET /api/interviewers/stats/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "total_interviewers": 25,
    "active_interviewers": 20,
    "inactive_interviewers": 5,
    "interviewers_with_calendar": 15,
    "recent_interviewers": [
        {
            "id": 3,
            "full_name": "Алексеев Алексей Алексеевич",
            "email": "alexey.alexeev@example.com",
            "is_active": true
        },
        {
            "id": 2,
            "full_name": "Петров Петр Петрович",
            "email": "petr.petrov@example.com",
            "is_active": true
        }
    ]
}
```

### 5. **GET /api/interviewers/search/** - Поиск

**Запрос:**
```bash
GET /api/interviewers/search/?q=Иван&is_active=true&has_calendar=true
Authorization: Token your_token_here
```

**Параметры запроса:**
- `q` (string, optional) - Поисковый запрос
- `is_active` (boolean, optional) - Фильтр по активности
- `has_calendar` (boolean, optional) - Фильтр по наличию календаря

**Ответ (200 OK):**
```json
[
    {
        "id": 1,
        "full_name": "Иванов Иван Иванович",
        "email": "ivan.ivanov@example.com",
        "is_active": true
    }
]
```

---

## 📋 **RULES API**

### 1. **GET /api/interview-rules/** - Список правил

**Запрос:**
```bash
GET /api/interview-rules/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Правило для Junior разработчиков",
            "description": "Привлечение интервьюеров для Junior позиций",
            "daily_limit": 5,
            "weekly_limit": 20,
            "min_grade": 1,
            "min_grade_name": "Junior",
            "max_grade": 2,
            "max_grade_name": "Junior+",
            "grade_range": "Junior - Junior+",
            "is_active": true,
            "created_at": "2024-01-20T10:00:00Z",
            "updated_at": "2024-01-20T10:00:00Z"
        }
    ]
}
```

### 2. **POST /api/interview-rules/** - Создание правила

**Запрос:**
```bash
POST /api/interview-rules/
Authorization: Token your_token_here
Content-Type: application/json

{
    "name": "Правило для Middle разработчиков",
    "description": "Привлечение интервьюеров для Middle позиций",
    "daily_limit": 3,
    "weekly_limit": 15,
    "min_grade": 3,
    "max_grade": 4,
    "is_active": false
}
```

**Ответ (201 Created):**
```json
{
    "id": 2,
    "name": "Правило для Middle разработчиков",
    "description": "Привлечение интервьюеров для Middle позиций",
    "daily_limit": 3,
    "weekly_limit": 15,
    "min_grade": 3,
    "min_grade_name": "Middle",
    "max_grade": 4,
    "max_grade_name": "Middle+",
    "grade_range": "Middle - Middle+",
    "is_active": false,
    "created_at": "2024-01-20T14:00:00Z",
    "updated_at": "2024-01-20T14:00:00Z"
}
```

### 3. **POST /api/interview-rules/{id}/activate/** - Активация правила

**Запрос:**
```bash
POST /api/interview-rules/2/activate/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "id": 2,
    "name": "Правило для Middle разработчиков",
    "description": "Привлечение интервьюеров для Middle позиций",
    "daily_limit": 3,
    "weekly_limit": 15,
    "min_grade": 3,
    "min_grade_name": "Middle",
    "max_grade": 4,
    "max_grade_name": "Middle+",
    "grade_range": "Middle - Middle+",
    "is_active": true,
    "created_at": "2024-01-20T14:00:00Z",
    "updated_at": "2024-01-20T14:05:00Z"
}
```

### 4. **GET /api/interview-rules/active/** - Активное правило

**Запрос:**
```bash
GET /api/interview-rules/active/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "id": 2,
    "name": "Правило для Middle разработчиков",
    "description": "Привлечение интервьюеров для Middle позиций",
    "daily_limit": 3,
    "weekly_limit": 15,
    "min_grade": 3,
    "min_grade_name": "Middle",
    "max_grade": 4,
    "max_grade_name": "Middle+",
    "grade_range": "Middle - Middle+",
    "is_active": true,
    "created_at": "2024-01-20T14:00:00Z",
    "updated_at": "2024-01-20T14:05:00Z"
}
```

**Ответ (404 Not Found):**
```json
{
    "message": "Нет активного правила"
}
```

### 5. **POST /api/interview-rules/{id}/check-grade/** - Проверка грейда

**Запрос:**
```bash
POST /api/interview-rules/2/check-grade/
Authorization: Token your_token_here
Content-Type: application/json

{
    "grade_id": 3
}
```

**Ответ (200 OK):**
```json
{
    "success": true,
    "grade_name": "Middle",
    "rule_name": "Правило для Middle разработчиков",
    "is_in_range": true,
    "grade_range": "Middle - Middle+"
}
```

**Ошибка (400 Bad Request):**
```json
{
    "error": "grade_id обязателен"
}
```

**Ошибка (404 Not Found):**
```json
{
    "error": "Грейд не найден"
}
```

### 6. **GET /api/interview-rules/stats/** - Статистика правил

**Запрос:**
```bash
GET /api/interview-rules/stats/
Authorization: Token your_token_here
```

**Ответ (200 OK):**
```json
{
    "total_rules": 3,
    "active_rules": 1,
    "inactive_rules": 2
}
```

---

## ⚠️ **ОБРАБОТКА ОШИБОК**

### Стандартные коды ошибок:

#### 400 Bad Request - Неверный запрос
```json
{
    "field_name": [
        "Это поле обязательно для заполнения.",
        "Введите корректный email адрес."
    ]
}
```

#### 401 Unauthorized - Не авторизован
```json
{
    "detail": "Учетные данные не были предоставлены."
}
```

#### 403 Forbidden - Доступ запрещен
```json
{
    "detail": "У вас нет прав для выполнения данного действия."
}
```

#### 404 Not Found - Ресурс не найден
```json
{
    "detail": "Не найдено."
}
```

#### 500 Internal Server Error - Внутренняя ошибка
```json
{
    "error": "Внутренняя ошибка сервера",
    "details": "Дополнительная информация об ошибке"
}
```

---

## 🔒 **АУТЕНТИФИКАЦИЯ**

### Token Authentication

**Получение токена:**
```bash
POST /api/auth/login/
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

**Ответ:**
```json
{
    "token": "your_token_here",
    "user": {
        "id": 1,
        "username": "your_username",
        "email": "user@example.com"
    }
}
```

**Использование токена:**
```bash
Authorization: Token your_token_here
```

### Session Authentication (для веб-интерфейса)

**Логин:**
```bash
POST /accounts/login/
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

**Ответ:** Устанавливает session cookie

---

## 📊 **ПАГИНАЦИЯ**

### Стандартная пагинация:

**Запрос:**
```bash
GET /api/interviewers/?page=2&page_size=10
```

**Ответ:**
```json
{
    "count": 25,
    "next": "http://example.com/api/interviewers/?page=3",
    "previous": "http://example.com/api/interviewers/?page=1",
    "results": [...]
}
```

### Параметры пагинации:
- `page` - Номер страницы (начиная с 1)
- `page_size` - Размер страницы (максимум 100)

---

## 🔍 **ФИЛЬТРАЦИЯ И ПОИСК**

### Параметры фильтрации:

#### Interviewers:
- `search` - Поиск по имени, фамилии, email
- `is_active` - Фильтр по активности (true/false)
- `ordering` - Сортировка (last_name, -created_at, email)

#### Rules:
- `search` - Поиск по названию, описанию
- `is_active` - Фильтр по активности (true/false)
- `min_grade` - Фильтр по минимальному грейду
- `ordering` - Сортировка (name, -created_at)

### Примеры:

```bash
# Поиск активных интервьюеров с именем "Иван"
GET /api/interviewers/?search=Иван&is_active=true

# Сортировка по фамилии
GET /api/interviewers/?ordering=last_name

# Обратная сортировка по дате создания
GET /api/interviewers/?ordering=-created_at
```

---

## 📈 **ПРОИЗВОДИТЕЛЬНОСТЬ**

### Рекомендации:

1. **Используйте пагинацию** для больших списков
2. **Применяйте фильтры** для ограничения результатов
3. **Используйте select_related** для связанных объектов
4. **Кэшируйте** часто запрашиваемые данные

### Примеры оптимизированных запросов:

```bash
# Получение только необходимых полей
GET /api/interviewers/?page_size=50

# Фильтрация активных интервьюеров
GET /api/interviewers/?is_active=true

# Поиск с ограничением
GET /api/interviewers/search/?q=Иван&limit=10
```

---

## 🧪 **ТЕСТИРОВАНИЕ API**

### Примеры тестов:

```python
import requests

# Тест создания интервьюера
def test_create_interviewer():
    url = "http://localhost:8000/api/interviewers/"
    headers = {"Authorization": "Token your_token_here"}
    data = {
        "first_name": "Тест",
        "last_name": "Тестов",
        "email": "test@example.com"
    }
    response = requests.post(url, json=data, headers=headers)
    assert response.status_code == 201

# Тест получения списка
def test_get_interviewers():
    url = "http://localhost:8000/api/interviewers/"
    headers = {"Authorization": "Token your_token_here"}
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    assert "results" in response.json()
```

---

## 🎯 **ЗАКЛЮЧЕНИЕ**

### Ключевые особенности JSON API:
- ✅ **RESTful архитектура** - стандартные HTTP методы и коды
- ✅ **JSON формат** - структурированные данные
- ✅ **Полная документация** - все endpoints с примерами
- ✅ **Обработка ошибок** - стандартизированные ответы
- ✅ **Аутентификация** - Token и Session authentication
- ✅ **Фильтрация и поиск** - гибкие параметры запросов
- ✅ **Пагинация** - для больших объемов данных

### Готовность к использованию:
- **API полностью функционален** и протестирован
- **Документация актуальна** и содержит примеры
- **Интеграции работают** с другими приложениями
- **Производительность оптимизирована** для продакшена

**JSON API готов к интеграции с фронтенд приложениями!** 🚀
