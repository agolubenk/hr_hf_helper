# Accounts App Documentation

## Обзор

Приложение `accounts` отвечает за управление пользователями, аутентификацию, авторизацию и профили пользователей в системе HR Helper.

## Основные функции

- Управление пользователями и их профилями
- Система ролей и разрешений
- Интеграция с внешними сервисами (API ключи)
- Аутентификация и авторизация
- Настройки пользователей

## Модели данных

### User (Пользователь)
Расширенная модель пользователя на основе Django AbstractUser.

**Основные поля:**
- `username` - Имя пользователя (уникальное)
- `email` - Email адрес
- `first_name`, `last_name` - Имя и фамилия
- `full_name` - Полное имя
- `telegram_username` - Никнейм в Telegram
- `is_active`, `is_staff`, `is_superuser` - Статусы пользователя

**API ключи и интеграции:**
- `gemini_api_key` - API ключ для Google Gemini
- `clickup_api_key` - API ключ для ClickUp
- `notion_integration_token` - Токен для Notion
- `huntflow_prod_url`, `huntflow_prod_api_key` - Huntflow Production
- `huntflow_sandbox_url`, `huntflow_sandbox_api_key` - Huntflow Sandbox
- `active_system` - Активная система (prod/sandbox)

**Роли и настройки:**
- `interviewer_calendar_url` - Ссылка на календарь интервьюера
- `is_observer_active` - Статус наблюдателя

**Свойства (Properties):**
- `is_admin` - Проверка административных прав
- `is_recruiter` - Проверка роли рекрутера
- `is_interviewer` - Проверка роли интервьюера
- `is_observer` - Проверка роли наблюдателя

### Group (Группа)
Стандартная Django модель для группировки пользователей и назначения разрешений.

## API Endpoints

### Базовый URL
`/api/v1/users/`

### Основные endpoints

#### GET /api/v1/users/
Получение списка пользователей с пагинацией.

**Параметры запроса:**
- `page` - Номер страницы
- `page_size` - Размер страницы (по умолчанию 20)
- `search` - Поиск по username, email, first_name, last_name, full_name
- `is_active` - Фильтр по статусу активности
- `is_staff` - Фильтр по статусу персонала
- `groups` - Фильтр по группам

**Ответ:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "full_name": "Admin User",
      "telegram_username": "admin_user",
      "groups": [{"id": 1, "name": "Администраторы"}],
      "groups_display": ["Администраторы"],
      "is_active": true,
      "is_staff": true,
      "is_admin": true,
      "is_recruiter": false,
      "is_interviewer": false,
      "is_observer": false,
      "date_joined": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/v1/users/{id}/
Получение детальной информации о пользователе.

#### POST /api/v1/users/
Создание нового пользователя.

**Тело запроса:**
```json
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "secure_password",
  "password_confirm": "secure_password",
  "first_name": "New",
  "last_name": "User",
  "full_name": "New User",
  "telegram_username": "new_user_tg"
}
```

#### PUT/PATCH /api/v1/users/{id}/
Обновление пользователя.

#### DELETE /api/v1/users/{id}/
Удаление пользователя.

### Профиль пользователя

#### GET /api/v1/users/profile/
Получение профиля текущего пользователя.

#### PUT /api/v1/users/profile/
Обновление профиля текущего пользователя.

### Смена пароля

#### POST /api/v1/users/change-password/
Смена пароля пользователя.

**Тело запроса:**
```json
{
  "old_password": "current_password",
  "new_password": "new_secure_password"
}
```

### Настройки

#### GET /api/v1/users/settings/
Получение настроек пользователя.

#### PUT /api/v1/users/settings/
Обновление настроек пользователя.

### Группы

#### GET /api/v1/groups/
Получение списка групп пользователей.

#### POST /api/v1/users/{id}/assign-groups/
Назначение групп пользователю.

**Тело запроса:**
```json
{
  "group_ids": [1, 2, 3]
}
```

### Статистика

#### GET /api/v1/users/stats/
Получение статистики пользователей.

**Ответ:**
```json
{
  "total_users": 25,
  "active_users": 20,
  "admin_users": 3
}
```

## Разрешения

### Аутентификация
- Все endpoints требуют аутентификации (кроме health check)
- Поддерживается Session Authentication и Basic Authentication

### Авторизация
- **IsAuthenticated** - для всех endpoints
- **IsAdminUser** - для создания/удаления пользователей
- **IsOwnerOrAdmin** - для редактирования профиля

## Сериализаторы

### UserSerializer
Основной сериализатор для пользователей с полной информацией.

### UserCreateSerializer
Сериализатор для создания пользователей с валидацией пароля.

### UserProfileSerializer
Сериализатор для профиля пользователя без чувствительных данных.

### UserChangePasswordSerializer
Сериализатор для смены пароля с валидацией.

### UserSettingsSerializer
Сериализатор для настроек пользователя.

### GroupSerializer
Сериализатор для групп пользователей.

## Формы

### ProfileEditForm
Форма редактирования профиля пользователя.

### IntegrationSettingsForm
Форма настроек интеграций.

### ApiKeysForm
Форма для управления API ключами.

## Команды управления

### seed_roles
Создание групп ролей и назначение прав доступа.

```bash
python manage.py seed_roles
```

## Сигналы

### create_user_profile
Автоматическое создание профиля при создании пользователя.

## Интеграции

### Telegram
- Хранение Telegram username
- Интеграция с Telegram ботом

### Google Gemini
- Хранение API ключа
- Тестирование подключения

### Huntflow
- Настройки для Production и Sandbox
- Переключение между системами

### ClickUp
- API ключ для интеграции
- Тестирование подключения

### Notion
- Integration токен
- Синхронизация данных

## Безопасность

- Пароли хэшируются с использованием Django стандартных методов
- API ключи хранятся в зашифрованном виде
- CSRF защита для веб-форм
- Валидация входных данных

## Кэширование

- Профили пользователей кэшируются
- Статистика кэшируется на 5 минут
- Группы кэшируются на 1 час

## Логирование

Все операции с пользователями логируются:
- Создание пользователей
- Изменение профилей
- Смена паролей
- Назначение групп

## Тестирование

### Unit тесты
- Тестирование моделей
- Тестирование сериализаторов
- Тестирование views

### Integration тесты
- Тестирование API endpoints
- Тестирование аутентификации
- Тестирование разрешений

## Мониторинг

- Отслеживание активных пользователей
- Мониторинг неудачных попыток входа
- Статистика использования API

## Примеры использования

### Создание пользователя через API

```python
import requests

data = {
    "username": "new_user",
    "email": "user@example.com",
    "password": "secure_password",
    "password_confirm": "secure_password",
    "first_name": "New",
    "last_name": "User"
}

response = requests.post(
    "http://localhost:8000/api/v1/users/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)
```

### Получение профиля пользователя

```python
response = requests.get(
    "http://localhost:8000/api/v1/users/profile/",
    headers={"Authorization": "Token your_token_here"}
)

profile = response.json()
```

### Назначение групп пользователю

```python
data = {"group_ids": [1, 2]}
response = requests.post(
    "http://localhost:8000/api/v1/users/1/assign-groups/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)
```
