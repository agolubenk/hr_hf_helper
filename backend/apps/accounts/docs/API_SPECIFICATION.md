# API Спецификация приложения Accounts

## 🎯 Обзор

Данный документ содержит полную спецификацию API приложения `accounts`, включая REST API endpoints, JSON API, веб-интерфейс и взаимодействие с другими приложениями.

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
2. [JSON API Endpoints](#json-api-endpoints)
3. [Веб-интерфейс](#веб-интерфейс)
4. [Аутентификация](#аутентификация)
5. [Модели данных](#модели-данных)
6. [Сериализаторы](#сериализаторы)
7. [Обработка ошибок](#обработка-ошибок)
8. [Примеры использования](#примеры-использования)

---

## 🔌 REST API Endpoints

### Базовый URL
```
http://localhost:8000/api/
```

### UserViewSet (`/api/users/`)

#### Базовые операции CRUD

##### 1. Список пользователей
```http
GET /api/users/
Authorization: SessionAuthentication
```

**Параметры запроса:**
- `search` - поиск по username, email, first_name, last_name, full_name
- `ordering` - сортировка по username, email, date_joined, last_login
- `page` - номер страницы (пагинация)

**Ответ:**
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
            "first_name": "Админ",
            "last_name": "Админов",
            "full_name": "Админов Админ",
            "telegram_username": "@admin",
            "groups": [
                {
                    "id": 1,
                    "name": "Администраторы",
                    "permissions": [...]
                }
            ],
            "groups_display": ["Администраторы"],
            "is_admin": true,
            "is_recruiter": false,
            "is_interviewer": false,
            "is_observer": false,
            "active_system": "sandbox",
            "is_observer_active": false,
            "is_active": true,
            "is_staff": true,
            "is_superuser": true,
            "date_joined": "2024-01-15T10:30:00Z",
            "last_login": "2024-01-20T15:45:00Z"
        }
    ]
}
```

##### 2. Создание пользователя
```http
POST /api/users/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "username": "new_user",
    "email": "new@example.com",
    "first_name": "Новый",
    "last_name": "Пользователь",
    "password": "secure_password",
    "password_confirm": "secure_password",
    "telegram_username": "@new_user",
    "active_system": "sandbox",
    "is_observer_active": true
}
```

**Ответ:**
```json
{
    "id": 26,
    "username": "new_user",
    "email": "new@example.com",
    "first_name": "Новый",
    "last_name": "Пользователь",
    "full_name": "Пользователь Новый",
    "telegram_username": "@new_user",
    "groups": [
        {
            "id": 2,
            "name": "Наблюдатели",
            "permissions": [...]
        }
    ],
    "groups_display": ["Наблюдатели"],
    "is_admin": false,
    "is_recruiter": false,
    "is_interviewer": false,
    "is_observer": true,
    "active_system": "sandbox",
    "is_observer_active": true,
    "is_active": true,
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2024-01-20T16:00:00Z",
    "last_login": null
}
```

##### 3. Получение пользователя
```http
GET /api/users/{id}/
Authorization: SessionAuthentication
```

##### 4. Обновление пользователя
```http
PUT /api/users/{id}/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "first_name": "Обновленное",
    "last_name": "Имя",
    "telegram_username": "@updated_user"
}
```

##### 5. Удаление пользователя
```http
DELETE /api/users/{id}/
Authorization: SessionAuthentication
```

#### Кастомные действия

##### 1. Профиль текущего пользователя
```http
GET /api/users/profile/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "id": 1,
    "username": "current_user",
    "email": "user@example.com",
    "first_name": "Текущий",
    "last_name": "Пользователь",
    "full_name": "Пользователь Текущий",
    "telegram_username": "@current_user",
    "groups_display": ["Рекрутеры"],
    "is_admin": false,
    "is_recruiter": true,
    "is_interviewer": false,
    "is_observer": false,
    "active_system": "prod",
    "is_observer_active": false,
    "is_active": true,
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-20T15:45:00Z"
}
```

##### 2. Обновление профиля
```http
PUT /api/users/profile/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "first_name": "Новое",
    "last_name": "Имя",
    "telegram_username": "@new_username"
}
```

##### 3. Смена пароля
```http
POST /api/users/change-password/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "old_password": "old_password",
    "new_password": "new_secure_password",
    "new_password_confirm": "new_secure_password"
}
```

**Ответ:**
```json
{
    "message": "Пароль успешно изменен"
}
```

##### 4. Настройки пользователя
```http
GET /api/users/settings/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "gemini_api_key": "***",
    "clickup_api_key": "***",
    "notion_integration_token": "***",
    "huntflow_prod_url": "https://api.huntflow.ru",
    "huntflow_prod_api_key": "***",
    "huntflow_sandbox_url": "https://sandbox-api.huntflow.dev",
    "huntflow_sandbox_api_key": "***",
    "active_system": "sandbox",
    "interviewer_calendar_url": "https://calendar.google.com/...",
    "is_observer_active": true
}
```

##### 5. Обновление настроек
```http
PUT /api/users/settings/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "gemini_api_key": "AIzaSy...",
    "active_system": "prod",
    "is_observer_active": false
}
```

##### 6. Назначение групп
```http
POST /api/users/{id}/assign-groups/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "group_ids": [1, 2, 3]
}
```

**Ответ:**
```json
{
    "message": "Группы успешно назначены"
}
```

##### 7. Статистика пользователей
```http
GET /api/users/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_users": 25,
    "active_users": 23,
    "staff_users": 3,
    "groups_stats": {
        "Администраторы": 2,
        "Рекрутеры": 5,
        "Интервьюеры": 8,
        "Наблюдатели": 10
    }
}
```

### GroupViewSet (`/api/groups/`)

##### 1. Список групп
```http
GET /api/groups/
Authorization: SessionAuthentication
```

**Ответ:**
```json
[
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
]
```

##### 2. Получение группы
```http
GET /api/groups/{id}/
Authorization: SessionAuthentication
```

---

## 🔗 JSON API Endpoints

### Базовый URL
```
http://localhost:8000/accounts/api/
```

### Аутентификация

#### 1. Вход в систему
```http
POST /accounts/api/login/
Content-Type: application/json

{
    "username": "user@example.com",
    "password": "password123"
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "Вход выполнен успешно",
    "user": {
        "id": 1,
        "username": "user",
        "email": "user@example.com",
        "first_name": "Иван",
        "last_name": "Иванов",
        "full_name": "Иванов Иван",
        "groups_display": ["Рекрутеры"],
        "is_admin": false,
        "is_recruiter": true,
        "is_interviewer": false,
        "is_observer": false,
        "active_system": "sandbox",
        "is_observer_active": false,
        "is_active": true,
        "is_staff": false,
        "is_superuser": false,
        "date_joined": "2024-01-15T10:30:00Z",
        "last_login": "2024-01-20T15:45:00Z"
    }
}
```

#### 2. Выход из системы
```http
POST /accounts/api/logout/
Content-Type: application/json
```

**Ответ:**
```json
{
    "success": true,
    "message": "Выход выполнен успешно"
}
```

### Тестирование API ключей

#### 1. Тестирование Gemini API
```http
POST /accounts/api/test-gemini/
Content-Type: application/json

{
    "api_key": "AIzaSy..."
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "API ключ валиден"
}
```

#### 2. Тестирование Huntflow API
```http
POST /accounts/api/test-huntflow/
Content-Type: application/json

{
    "api_key": "hf_...",
    "api_url": "https://api.huntflow.ru",
    "system": "prod"
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "Huntflow prod API ключ валиден"
}
```

#### 3. Тестирование ClickUp API
```http
POST /accounts/api/test-clickup/
Content-Type: application/json

{
    "api_key": "pk_..."
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "ClickUp API ключ валиден"
}
```

#### 4. Тестирование Notion API
```http
POST /accounts/api/test-notion/
Content-Type: application/json

{
    "api_key": "secret_..."
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "Notion Integration Token валиден"
}
```

---

## 🌐 Веб-интерфейс

### Базовый URL
```
http://localhost:8000/accounts/
```

### URL маршруты

#### 1. Профиль пользователя
```http
GET /accounts/
```
- **Описание:** Главная страница профиля
- **Шаблон:** `profile/profile.html`
- **Обработчик:** `profile_template_handler`

#### 2. Редактирование профиля
```http
GET /accounts/edit/
POST /accounts/edit/
```
- **Описание:** Редактирование данных профиля
- **Шаблон:** `profile/profile_edit.html`
- **Обработчик:** `profile_edit_template_handler`

#### 3. Настройки профиля
```http
GET /accounts/settings/
POST /accounts/settings/
```
- **Описание:** Настройки интеграций
- **Шаблон:** `profile/profile_settings.html`
- **Обработчик:** `profile_settings_template_handler`

#### 4. Интеграции
```http
GET /accounts/integrations/
```
- **Описание:** Статус интеграций
- **Шаблон:** `profile/integrations.html`
- **Обработчик:** `integrations_template_handler`

#### 5. API ключи
```http
GET /accounts/api-keys/
POST /accounts/api-keys/
```
- **Описание:** Управление API ключами
- **Шаблон:** `profile/api_keys.html`
- **Обработчик:** `api_keys_template_handler`

#### 6. Компоненты
```http
GET /accounts/components/
```
- **Описание:** Демонстрация компонентов
- **Шаблон:** `temp/components.html`
- **Обработчик:** `components_template_handler`

### Google OAuth

#### 1. Инициация OAuth
```http
GET /accounts/google-oauth/
```
- **Описание:** Перенаправление на Google OAuth
- **Обработчик:** `google_oauth_redirect`

#### 2. OAuth Callback
```http
GET /accounts/google-oauth-callback/
```
- **Описание:** Обработка callback от Google
- **Обработчик:** `google_oauth_callback`

#### 3. Демо OAuth
```http
GET /accounts/google-oauth-demo/
```
- **Описание:** Демонстрация OAuth
- **Шаблон:** `account/google_oauth_demo.html`
- **Обработчик:** `google_oauth_demo`

#### 4. Тест OAuth
```http
GET /accounts/google-oauth-test/
```
- **Описание:** Тестирование OAuth
- **Шаблон:** `account/google_oauth_test.html`
- **Обработчик:** `google_oauth_test`

#### 5. Диагностика OAuth
```http
GET /accounts/oauth-debug/
```
- **Описание:** Диагностика OAuth
- **Шаблон:** `account/oauth_debug.html`
- **Обработчик:** `oauth_debug`

### Аутентификация

#### 1. Вход в систему
```http
GET /accounts/login/
POST /accounts/login/
```
- **Описание:** Универсальная форма входа (HTML + JSON)
- **Шаблон:** `accounts/login.html`
- **Обработчик:** `unified_login`

#### 2. Выход из системы
```http
GET /accounts/logout/
POST /accounts/logout/
```
- **Описание:** Универсальный выход (HTML + JSON)
- **Обработчик:** `unified_logout`

---

## 🔐 Аутентификация

### Типы аутентификации

#### 1. Session Authentication (по умолчанию)
- **Использование:** Веб-интерфейс и REST API
- **Механизм:** Django сессии
- **Безопасность:** CSRF токены

#### 2. Google OAuth 2.0
- **Использование:** Социальная авторизация
- **Механизм:** OAuth 2.0 flow
- **Безопасность:** State parameter

#### 3. JSON API Authentication
- **Использование:** API запросы
- **Механизм:** JSON payload
- **Безопасность:** CSRF exempt

### Права доступа

#### 1. Администраторы
- **Права:** Все операции (CRUD)
- **Доступ:** Полный доступ ко всем функциям
- **Создание:** `is_superuser=True` или группа "Администраторы"

#### 2. Рекрутеры
- **Права:** Все операции (CRUD)
- **Доступ:** Управление вакансиями, кандидатами
- **Назначение:** Через группы или CLI команды

#### 3. Интервьюеры
- **Права:** Только просмотр
- **Доступ:** Просмотр назначенных интервью
- **Ограничения:** Могут редактировать только свои данные

#### 4. Наблюдатели
- **Права:** Только просмотр
- **Доступ:** Просмотр данных без редактирования
- **Назначение:** Автоматически новым пользователям

---

## 📊 Модели данных

### User (расширенная AbstractUser)

```python
class User(AbstractUser):
    # Основные поля
    full_name = models.CharField(max_length=255, blank=True)
    telegram_username = models.CharField(max_length=64, blank=True)
    
    # API ключи интеграций
    gemini_api_key = models.CharField(max_length=256, blank=True)
    clickup_api_key = models.CharField(max_length=256, blank=True)
    notion_integration_token = models.CharField(max_length=256, blank=True)
    
    # Huntflow настройки
    huntflow_prod_url = models.URLField(blank=True)
    huntflow_prod_api_key = models.CharField(max_length=256, blank=True)
    huntflow_sandbox_url = models.URLField(blank=True)
    huntflow_sandbox_api_key = models.CharField(max_length=256, blank=True)
    active_system = models.CharField(choices=SystemChoice.choices, default=SystemChoice.SANDBOX)
    
    # Роли и права
    interviewer_calendar_url = models.URLField(blank=True)
    is_observer_active = models.BooleanField(default=False)
```

### SystemChoice

```python
class SystemChoice(models.TextChoices):
    PROD = "prod", _("Прод")
    SANDBOX = "sandbox", _("Песочница")
```

### Свойства ролей

```python
@property
def is_admin(self) -> bool:
    return self.is_superuser or self.groups.filter(name="Администраторы").exists()

@property
def is_recruiter(self) -> bool:
    return self.groups.filter(name="Рекрутеры").exists()

@property
def is_interviewer(self) -> bool:
    return self.groups.filter(name="Интервьюеры").exists()

@property
def is_observer(self) -> bool:
    return self.groups.filter(name="Наблюдатели").exists()
```

---

## 🔄 Сериализаторы

### UserSerializer
```python
class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    groups_display = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    is_recruiter = serializers.SerializerMethodField()
    is_interviewer = serializers.SerializerMethodField()
    is_observer = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'telegram_username', 'groups', 'groups_display',
            'gemini_api_key', 'clickup_api_key', 'notion_integration_token',
            'huntflow_prod_url', 'huntflow_prod_api_key',
            'huntflow_sandbox_url', 'huntflow_sandbox_api_key',
            'active_system', 'interviewer_calendar_url',
            'is_observer_active', 'is_active', 'is_staff', 'is_superuser',
            'is_admin', 'is_recruiter', 'is_interviewer', 'is_observer',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_admin', 'is_recruiter', 'is_interviewer', 'is_observer']
        extra_kwargs = {
            'password': {'write_only': True},
            'gemini_api_key': {'write_only': True},
            'clickup_api_key': {'write_only': True},
            'notion_integration_token': {'write_only': True},
            'huntflow_prod_api_key': {'write_only': True},
            'huntflow_sandbox_api_key': {'write_only': True},
        }
```

### UserCreateSerializer
```python
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'full_name',
            'telegram_username', 'password', 'password_confirm',
            'gemini_api_key', 'clickup_api_key', 'notion_integration_token',
            'huntflow_prod_url', 'huntflow_prod_api_key',
            'huntflow_sandbox_url', 'huntflow_sandbox_api_key',
            'active_system', 'interviewer_calendar_url',
            'is_observer_active', 'is_active', 'is_staff'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return attrs
```

### UserSettingsSerializer
```python
class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'gemini_api_key', 'clickup_api_key', 'notion_integration_token',
            'huntflow_prod_url', 'huntflow_prod_api_key',
            'huntflow_sandbox_url', 'huntflow_sandbox_api_key',
            'active_system', 'interviewer_calendar_url',
            'is_observer_active'
        ]
```

---

## ⚠️ Обработка ошибок

### HTTP статус коды

#### 200 OK
- Успешный запрос
- Возврат данных

#### 201 Created
- Успешное создание ресурса
- Возврат созданного объекта

#### 400 Bad Request
- Неверные данные запроса
- Ошибки валидации

#### 401 Unauthorized
- Неавторизованный доступ
- Неверные учетные данные

#### 403 Forbidden
- Недостаточно прав доступа
- Запрещенная операция

#### 404 Not Found
- Ресурс не найден
- Неверный URL

#### 405 Method Not Allowed
- Неподдерживаемый HTTP метод
- Неверный тип запроса

#### 500 Internal Server Error
- Внутренняя ошибка сервера
- Неожиданная ошибка

### Формат ошибок

#### Ошибки валидации
```json
{
    "field_name": [
        "Это поле обязательно для заполнения."
    ],
    "non_field_errors": [
        "Пароли не совпадают."
    ]
}
```

#### Ошибки API
```json
{
    "error": "Неверное имя пользователя или пароль"
}
```

#### Ошибки JSON API
```json
{
    "success": false,
    "message": "API ключ не указан"
}
```

---

## 📝 Примеры использования

### 1. Создание пользователя через REST API

```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "username": "new_user",
    "email": "new@example.com",
    "first_name": "Новый",
    "last_name": "Пользователь",
    "password": "secure_password",
    "password_confirm": "secure_password"
  }'
```

### 2. Вход через JSON API

```bash
curl -X POST http://localhost:8000/accounts/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

### 3. Тестирование API ключа

```bash
curl -X POST http://localhost:8000/accounts/api/test-gemini/ \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "AIzaSy..."
  }'
```

### 4. Получение статистики

```bash
curl -X GET http://localhost:8000/api/users/stats/ \
  -H "Authorization: Session YOUR_SESSION_ID"
```

### 5. Обновление настроек

```bash
curl -X PUT http://localhost:8000/api/users/settings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "active_system": "prod",
    "is_observer_active": false
  }'
```

---

## 🔗 Интеграция с другими приложениями

### 1. Google OAuth
- **Связь:** OneToOne через `GoogleOAuthAccount`
- **Использование:** OAuth авторизация, получение данных Google
- **API ключи:** Хранятся в `User.gemini_api_key`

### 2. Huntflow
- **Связь:** API ключи в `User` модели
- **Использование:** Управление кандидатами и вакансиями
- **API ключи:** `huntflow_prod_api_key`, `huntflow_sandbox_api_key`

### 3. Gemini AI
- **Связь:** API ключ в `User.gemini_api_key`
- **Использование:** AI анализ и чат
- **Интеграция:** Через REST API

### 4. Telegram
- **Связь:** OneToOne через `TelegramUser`
- **Использование:** Уведомления и бот
- **Поле:** `User.telegram_username`

### 5. Notion
- **Связь:** Integration Token в `User.notion_integration_token`
- **Использование:** Синхронизация данных
- **Интеграция:** Через Notion API

### 6. ClickUp
- **Связь:** API ключ в `User.clickup_api_key`
- **Использование:** Управление задачами
- **Интеграция:** Через ClickUp API

---

## 🚀 Заключение

API приложения `accounts` предоставляет:

1. **Полный CRUD** для управления пользователями
2. **REST API** с DRF ViewSets
3. **JSON API** для простых операций
4. **Веб-интерфейс** для пользователей
5. **OAuth интеграцию** с Google
6. **Систему ролей** с гибкими правами
7. **API ключи** для внешних сервисов
8. **Безопасность** и валидацию

Система легко интегрируется с другими приложениями и предоставляет единую точку входа для управления пользователями и их настройками.

---

**Дата обновления:** 2024-01-20  
**Версия:** 1.0.0  
**Статус:** Production Ready ✅
