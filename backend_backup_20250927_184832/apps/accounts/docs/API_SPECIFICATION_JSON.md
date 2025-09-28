# Accounts App - JSON API Specification

## 🎯 Обзор

Полная JSON спецификация API для приложения `accounts` с детальным описанием всех endpoints, моделей данных, примеров запросов и ответов.

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
2. [JSON API Endpoints](#json-api-endpoints)
3. [Модели данных](#модели-данных)
4. [Примеры запросов и ответов](#примеры-запросов-и-ответов)
5. [Коды ошибок](#коды-ошибок)
6. [Аутентификация](#аутентификация)

---

## 🔌 REST API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### UserViewSet (`/api/users/`)

#### 1. Список пользователей
```http
GET /api/users/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "full_name": "Admin User",
      "telegram_username": "@admin_user",
      "groups": [
        {
          "id": 1,
          "name": "Администраторы",
          "permissions": [...]
        }
      ],
      "groups_display": ["Администраторы"],
      "gemini_api_key": "AIzaSy...",
      "clickup_api_key": "pk_...",
      "notion_integration_token": "secret_...",
      "huntflow_prod_url": "https://api.huntflow.ru",
      "huntflow_prod_api_key": "hf_...",
      "huntflow_sandbox_url": "https://api-sandbox.huntflow.ru",
      "huntflow_sandbox_api_key": "hf_sandbox_...",
      "active_system": "prod",
      "interviewer_calendar_url": "https://calendar.google.com/...",
      "is_observer_active": true,
      "is_active": true,
      "is_staff": true,
      "is_superuser": true,
      "is_admin": true,
      "is_recruiter": false,
      "is_interviewer": false,
      "is_observer": false,
      "date_joined": "2024-01-15T10:30:00Z",
      "last_login": "2024-01-20T14:25:00Z"
    }
  ]
}
```

#### 2. Создание пользователя
```http
POST /api/users/
Content-Type: application/json
Authorization: Session <session_id>

{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "telegram_username": "@newuser",
  "active_system": "sandbox"
}
```

**Response (201 Created):**
```json
{
  "id": 26,
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "full_name": "New User",
  "telegram_username": "@newuser",
  "groups": [],
  "groups_display": [],
  "gemini_api_key": "",
  "clickup_api_key": "",
  "notion_integration_token": "",
  "huntflow_prod_url": "",
  "huntflow_prod_api_key": "",
  "huntflow_sandbox_url": "",
  "huntflow_sandbox_api_key": "",
  "active_system": "sandbox",
  "interviewer_calendar_url": "",
  "is_observer_active": false,
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "is_admin": false,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-20T15:30:00Z",
  "last_login": null
}
```

#### 3. Получение пользователя
```http
GET /api/users/1/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "full_name": "Admin User",
  "telegram_username": "@admin_user",
  "groups": [...],
  "groups_display": ["Администраторы"],
  "gemini_api_key": "AIzaSy...",
  "clickup_api_key": "pk_...",
  "notion_integration_token": "secret_...",
  "huntflow_prod_url": "https://api.huntflow.ru",
  "huntflow_prod_api_key": "hf_...",
  "huntflow_sandbox_url": "https://api-sandbox.huntflow.ru",
  "huntflow_sandbox_api_key": "hf_sandbox_...",
  "active_system": "prod",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": true,
  "is_active": true,
  "is_staff": true,
  "is_superuser": true,
  "is_admin": true,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-20T14:25:00Z"
}
```

#### 4. Обновление пользователя
```http
PUT /api/users/1/
Content-Type: application/json
Authorization: Session <session_id>

{
  "first_name": "Updated",
  "last_name": "Name",
  "telegram_username": "@updated_user",
  "active_system": "prod"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Updated",
  "last_name": "Name",
  "full_name": "Updated Name",
  "telegram_username": "@updated_user",
  "groups": [...],
  "groups_display": ["Администраторы"],
  "gemini_api_key": "AIzaSy...",
  "clickup_api_key": "pk_...",
  "notion_integration_token": "secret_...",
  "huntflow_prod_url": "https://api.huntflow.ru",
  "huntflow_prod_api_key": "hf_...",
  "huntflow_sandbox_url": "https://api-sandbox.huntflow.ru",
  "huntflow_sandbox_api_key": "hf_sandbox_...",
  "active_system": "prod",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": true,
  "is_active": true,
  "is_staff": true,
  "is_superuser": true,
  "is_admin": true,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-20T14:25:00Z"
}
```

#### 5. Удаление пользователя
```http
DELETE /api/users/1/
Authorization: Session <session_id>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Кастомные действия UserViewSet

#### 1. Профиль текущего пользователя
```http
GET /api/users/profile/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "full_name": "Admin User",
  "telegram_username": "@admin_user",
  "groups_display": ["Администраторы"],
  "active_system": "prod",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": true,
  "is_active": true,
  "is_staff": true,
  "is_admin": true,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-20T14:25:00Z"
}
```

#### 2. Обновление профиля
```http
PUT /api/users/profile/
Content-Type: application/json
Authorization: Session <session_id>

{
  "first_name": "Updated",
  "last_name": "Name",
  "telegram_username": "@updated_user"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Updated",
  "last_name": "Name",
  "full_name": "Updated Name",
  "telegram_username": "@updated_user",
  "groups_display": ["Администраторы"],
  "active_system": "prod",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": true,
  "is_active": true,
  "is_staff": true,
  "is_admin": true,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-20T14:25:00Z"
}
```

#### 3. Смена пароля
```http
POST /api/users/change-password/
Content-Type: application/json
Authorization: Session <session_id>

{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Пароль успешно изменен"
}
```

#### 4. Настройки пользователя
```http
GET /api/users/settings/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "gemini_api_key": "AIzaSy...",
  "clickup_api_key": "pk_...",
  "notion_integration_token": "secret_...",
  "huntflow_prod_url": "https://api.huntflow.ru",
  "huntflow_prod_api_key": "hf_...",
  "huntflow_sandbox_url": "https://api-sandbox.huntflow.ru",
  "huntflow_sandbox_api_key": "hf_sandbox_...",
  "active_system": "prod",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": true
}
```

#### 5. Обновление настроек
```http
PUT /api/users/settings/
Content-Type: application/json
Authorization: Session <session_id>

{
  "gemini_api_key": "AIzaSy_new_key...",
  "active_system": "sandbox",
  "is_observer_active": false
}
```

**Response:**
```json
{
  "gemini_api_key": "AIzaSy_new_key...",
  "clickup_api_key": "pk_...",
  "notion_integration_token": "secret_...",
  "huntflow_prod_url": "https://api.huntflow.ru",
  "huntflow_prod_api_key": "hf_...",
  "huntflow_sandbox_url": "https://api-sandbox.huntflow.ru",
  "huntflow_sandbox_api_key": "hf_sandbox_...",
  "active_system": "sandbox",
  "interviewer_calendar_url": "https://calendar.google.com/...",
  "is_observer_active": false
}
```

#### 6. Назначение групп
```http
POST /api/users/1/assign-groups/
Content-Type: application/json
Authorization: Session <session_id>

{
  "group_ids": [1, 2]
}
```

**Response:**
```json
{
  "message": "Группы успешно назначены",
  "user": {
    "id": 1,
    "username": "admin",
    "groups_display": ["Администраторы", "Рекрутеры"]
  }
}
```

#### 7. Статистика пользователей
```http
GET /api/users/stats/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "total_users": 25,
  "active_users": 23,
  "staff_users": 5,
  "groups_stats": {
    "Администраторы": 3,
    "Рекрутеры": 8,
    "Интервьюеры": 6,
    "Наблюдатели": 8
  }
}
```

### GroupViewSet (`/api/groups/`)

#### 1. Список групп
```http
GET /api/groups/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Администраторы",
      "permissions": [
        {
          "id": 1,
          "name": "Can add user",
          "codename": "add_user",
          "content_type": {
            "id": 1,
            "app_label": "accounts",
            "model": "user"
          }
        }
      ]
    },
    {
      "id": 2,
      "name": "Рекрутеры",
      "permissions": [...]
    }
  ]
}
```

#### 2. Получение группы
```http
GET /api/groups/1/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Администраторы",
  "permissions": [
    {
      "id": 1,
      "name": "Can add user",
      "codename": "add_user",
      "content_type": {
        "id": 1,
        "app_label": "accounts",
        "model": "user"
      }
    }
  ]
}
```

---

## 🔌 JSON API Endpoints

### Base URL
```
http://localhost:8000/accounts/api/
```

### 1. Аутентификация

#### Вход в систему
```http
POST /accounts/api/login/
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Успешный вход в систему",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "full_name": "Admin User",
    "is_admin": true,
    "is_recruiter": false,
    "is_interviewer": false,
    "is_observer": false
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неверное имя пользователя или пароль"
}
```

#### Выход из системы
```http
POST /accounts/api/logout/
Content-Type: application/json
Authorization: Session <session_id>
```

**Response:**
```json
{
  "success": true,
  "message": "Успешный выход из системы"
}
```

### 2. Тестирование API ключей

#### Тестирование Gemini API
```http
POST /accounts/api/test-gemini/
Content-Type: application/json
Authorization: Session <session_id>

{
  "api_key": "AIzaSy..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Gemini API ключ работает корректно",
  "details": {
    "model": "gemini-pro",
    "version": "1.0",
    "status": "active"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неверный API ключ или превышен лимит запросов"
}
```

#### Тестирование Huntflow API
```http
POST /accounts/api/test-huntflow/
Content-Type: application/json
Authorization: Session <session_id>

{
  "api_key": "hf_...",
  "api_url": "https://api.huntflow.ru",
  "system": "prod"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Huntflow API ключ работает корректно",
  "details": {
    "account_id": 12345,
    "account_name": "Company Name",
    "system": "prod",
    "status": "active"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неверный API ключ или недоступен сервер"
}
```

#### Тестирование ClickUp API
```http
POST /accounts/api/test-clickup/
Content-Type: application/json
Authorization: Session <session_id>

{
  "api_key": "pk_..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "ClickUp API ключ работает корректно",
  "details": {
    "user_id": "12345",
    "username": "user@example.com",
    "status": "active"
  }
}
```

#### Тестирование Notion API
```http
POST /accounts/api/test-notion/
Content-Type: application/json
Authorization: Session <session_id>

{
  "api_key": "secret_..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Notion Integration Token работает корректно",
  "details": {
    "bot_id": "12345678-1234-1234-1234-123456789012",
    "workspace_name": "My Workspace",
    "status": "active"
  }
}
```

---

## 📊 Модели данных

### User Model

```json
{
  "id": "integer (read-only)",
  "username": "string (required, unique)",
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "full_name": "string (auto-generated)",
  "telegram_username": "string (optional, max 64 chars)",
  "groups": "array of Group objects (read-only)",
  "groups_display": "array of strings (read-only)",
  "gemini_api_key": "string (optional, max 256 chars)",
  "clickup_api_key": "string (optional, max 256 chars)",
  "notion_integration_token": "string (optional, max 256 chars)",
  "huntflow_prod_url": "string (optional, URL format)",
  "huntflow_prod_api_key": "string (optional, max 256 chars)",
  "huntflow_sandbox_url": "string (optional, URL format)",
  "huntflow_sandbox_api_key": "string (optional, max 256 chars)",
  "active_system": "string (choices: 'prod', 'sandbox', default: 'sandbox')",
  "interviewer_calendar_url": "string (optional, URL format)",
  "is_observer_active": "boolean (default: false)",
  "is_active": "boolean (read-only)",
  "is_staff": "boolean (read-only)",
  "is_superuser": "boolean (read-only)",
  "is_admin": "boolean (read-only, computed)",
  "is_recruiter": "boolean (read-only, computed)",
  "is_interviewer": "boolean (read-only, computed)",
  "is_observer": "boolean (read-only, computed)",
  "date_joined": "datetime (read-only)",
  "last_login": "datetime (read-only, nullable)"
}
```

### Group Model

```json
{
  "id": "integer (read-only)",
  "name": "string (required, unique)",
  "permissions": "array of Permission objects (read-only)"
}
```

### Permission Model

```json
{
  "id": "integer (read-only)",
  "name": "string (read-only)",
  "codename": "string (read-only)",
  "content_type": "ContentType object (read-only)"
}
```

---

## 📝 Примеры запросов и ответов

### Создание пользователя с ролью

```http
POST /api/users/
Content-Type: application/json
Authorization: Session <session_id>

{
  "username": "recruiter1",
  "email": "recruiter1@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "telegram_username": "@john_doe",
  "active_system": "prod"
}
```

**Response:**
```json
{
  "id": 27,
  "username": "recruiter1",
  "email": "recruiter1@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "telegram_username": "@john_doe",
  "groups": [],
  "groups_display": [],
  "gemini_api_key": "",
  "clickup_api_key": "",
  "notion_integration_token": "",
  "huntflow_prod_url": "",
  "huntflow_prod_api_key": "",
  "huntflow_sandbox_url": "",
  "huntflow_sandbox_api_key": "",
  "active_system": "prod",
  "interviewer_calendar_url": "",
  "is_observer_active": false,
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "is_admin": false,
  "is_recruiter": false,
  "is_interviewer": false,
  "is_observer": false,
  "date_joined": "2024-01-20T16:00:00Z",
  "last_login": null
}
```

### Назначение роли пользователю

```http
POST /api/users/27/assign-groups/
Content-Type: application/json
Authorization: Session <session_id>

{
  "group_ids": [2]
}
```

**Response:**
```json
{
  "message": "Группы успешно назначены",
  "user": {
    "id": 27,
    "username": "recruiter1",
    "groups_display": ["Рекрутеры"]
  }
}
```

### Обновление API ключей

```http
PUT /api/users/settings/
Content-Type: application/json
Authorization: Session <session_id>

{
  "gemini_api_key": "AIzaSy_new_gemini_key...",
  "huntflow_prod_api_key": "hf_new_prod_key...",
  "clickup_api_key": "pk_new_clickup_key...",
  "active_system": "prod"
}
```

**Response:**
```json
{
  "gemini_api_key": "AIzaSy_new_gemini_key...",
  "clickup_api_key": "pk_new_clickup_key...",
  "notion_integration_token": "",
  "huntflow_prod_url": "",
  "huntflow_prod_api_key": "hf_new_prod_key...",
  "huntflow_sandbox_url": "",
  "huntflow_sandbox_api_key": "",
  "active_system": "prod",
  "interviewer_calendar_url": "",
  "is_observer_active": false
}
```

---

## ❌ Коды ошибок

### HTTP Status Codes

| Код | Описание | Пример использования |
|-----|----------|---------------------|
| 200 | OK | Успешный GET, PUT запрос |
| 201 | Created | Успешное создание ресурса |
| 204 | No Content | Успешное удаление ресурса |
| 400 | Bad Request | Неверные данные запроса |
| 401 | Unauthorized | Не авторизован |
| 403 | Forbidden | Недостаточно прав |
| 404 | Not Found | Ресурс не найден |
| 405 | Method Not Allowed | Неподдерживаемый HTTP метод |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

### Примеры ошибок

#### 400 Bad Request
```json
{
  "username": ["Это поле обязательно."],
  "email": ["Введите корректный email адрес."],
  "password": ["Пароль должен содержать минимум 8 символов."]
}
```

#### 401 Unauthorized
```json
{
  "detail": "Учетные данные не были предоставлены."
}
```

#### 403 Forbidden
```json
{
  "detail": "У вас нет прав для выполнения данного действия."
}
```

#### 404 Not Found
```json
{
  "detail": "Не найдено."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Внутренняя ошибка сервера",
  "message": "Произошла непредвиденная ошибка. Попробуйте позже."
}
```

---

## 🔐 Аутентификация

### Методы аутентификации

#### 1. Session Authentication (по умолчанию)
```http
# Вход в систему
POST /accounts/api/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

# Последующие запросы с cookie
GET /api/users/profile/
Cookie: sessionid=abc123...
```

#### 2. Google OAuth 2.0
```http
# Перенаправление на Google OAuth
GET /accounts/google-oauth/

# Callback обработка
GET /accounts/google-oauth-callback/?code=4/0AX4XfWh...

# Автоматическая авторизация в системе
```

### Заголовки запросов

#### Обязательные заголовки
```http
Content-Type: application/json
Authorization: Session <session_id>
```

#### Опциональные заголовки
```http
X-Requested-With: XMLHttpRequest
Accept: application/json
```

### Примеры использования

#### JavaScript (Fetch API)
```javascript
// Вход в систему
const loginResponse = await fetch('/accounts/api/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();

// Получение профиля (с автоматическими cookies)
const profileResponse = await fetch('/api/users/profile/', {
  credentials: 'include'
});

const profileData = await profileResponse.json();
```

#### Python (requests)
```python
import requests

# Создание сессии
session = requests.Session()

# Вход в систему
login_data = {
    'username': 'user@example.com',
    'password': 'password123'
}
response = session.post('http://localhost:8000/accounts/api/login/', json=login_data)

# Получение профиля (с автоматическими cookies)
profile_response = session.get('http://localhost:8000/api/users/profile/')
profile_data = profile_response.json()
```

#### cURL
```bash
# Вход в систему
curl -X POST http://localhost:8000/accounts/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Получение профиля
curl -X GET http://localhost:8000/api/users/profile/ \
  -b cookies.txt
```

---

## 🎉 Заключение

Данная JSON спецификация API предоставляет:

- ✅ **Полное описание** всех REST и JSON endpoints
- ✅ **Детальные примеры** запросов и ответов
- ✅ **Модели данных** с типами и ограничениями
- ✅ **Коды ошибок** с примерами
- ✅ **Методы аутентификации** с примерами использования
- ✅ **Практические примеры** для разных языков программирования

**Статус:** Complete ✅  
**Версия:** 1.0.0  
**Дата обновления:** 2024-01-20  
**Формат:** JSON API Specification
