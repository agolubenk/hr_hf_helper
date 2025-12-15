# Интеграция с HeadHunter.ru API

## 📋 Описание

Приложение `hhru` предоставляет интеграцию с HeadHunter.ru API для работы с профилем работодателя, вакансиями, откликами и резюме кандидатов.

## 🏗️ Архитектура

### Структура приложения

```
apps/hhru/
├── models.py              # Модели данных (HHRUAccount, HHRUConfiguration, HHRUAPILog)
├── services.py            # Сервисы для работы с HH.ru API (HHRUService, HHRUOAuthService)
├── views_api.py           # API представления (DRF ViewSets)
├── serializers.py         # Сериализаторы для API
├── urls.py                # URL маршруты
├── admin.py               # Админ-панель
├── apps.py                # Конфигурация приложения
└── README.md              # Документация
```

## 📊 Модели

### HHRUAccount
Модель для хранения подключения к HeadHunter.ru через OAuth.

**Основные поля:**
- `user` - связь с пользователем (OneToOne)
- `access_token` - токен доступа для API
- `refresh_token` - токен для обновления access_token
- `token_expires_at` - время истечения токена
- `hh_user_id` - уникальный ID пользователя на HH.ru
- `email`, `first_name`, `last_name`, `middle_name` - данные профиля
- `is_employer` - является ли пользователь работодателем
- `is_admin` - является ли пользователь администратором аккаунта
- `profile_data` - дополнительные данные профиля (JSON)

**Методы:**
- `is_token_valid()` - проверяет действительность токена
- `needs_refresh()` - проверяет, нужно ли обновить токен

### HHRUConfiguration
Модель для хранения настроек OAuth приложения.

**Основные поля:**
- `client_id` - идентификатор клиента OAuth
- `client_secret` - секретный ключ OAuth
- `redirect_uri` - URI для перенаправления после авторизации
- `user` - пользователь (опционально, для персональных настроек)
- `is_active` - активна ли конфигурация
- `is_default` - конфигурация по умолчанию

**Методы:**
- `get_default(user)` - получает конфигурацию по умолчанию

### HHRUAPILog
Модель для логирования запросов к HH.ru API.

**Основные поля:**
- `log_type` - тип операции (GET, POST, PUT, DELETE, ERROR)
- `endpoint` - эндпоинт API
- `method` - HTTP метод
- `status_code` - код ответа
- `request_data` - данные запроса (JSON)
- `response_data` - данные ответа (JSON)
- `error_message` - сообщение об ошибке
- `user` - пользователь, выполнивший запрос
- `account` - связанный HH.ru аккаунт

## 🔧 Сервисы

### HHRUService
Основной сервис для работы с HeadHunter.ru API.

**Инициализация:**
```python
from apps.hhru.services import HHRUService

service = HHRUService(user)
```

**Основные методы:**
- `get_me()` - получает информацию о текущем пользователе
- `get_vacancies(params)` - получает список вакансий работодателя
- `get_vacancy(vacancy_id)` - получает информацию о вакансии
- `get_responses(vacancy_id, params)` - получает список откликов
- `get_response(response_id)` - получает информацию об отклике
- `update_response_status(response_id, status, comment)` - обновляет статус отклика
- `get_resume(resume_id)` - получает информацию о резюме
- `get_employer_info(employer_id)` - получает информацию о работодателе
- `test_connection()` - тестирует подключение к API
- `ensure_valid_token()` - обеспечивает наличие валидного токена
- `refresh_access_token()` - обновляет токен доступа

### HHRUOAuthService
Сервис для работы с OAuth авторизацией.

**Статические методы:**
- `get_authorization_url(user, redirect_uri)` - получает URL для авторизации
- `exchange_code_for_tokens(user, authorization_code, redirect_uri)` - обменивает код на токены

## 🔐 Авторизация и подключение

### Шаг 1: Регистрация приложения на HH.ru

1. Перейдите на [HeadHunter API](https://dev.hh.ru/)
2. Зарегистрируйте новое приложение
3. Получите `client_id` и `client_secret`
4. Укажите `redirect_uri` для вашего приложения

### Шаг 2: Создание конфигурации

Создайте конфигурацию через админ-панель или API:

```python
from apps.hhru.models import HHRUConfiguration

config = HHRUConfiguration.objects.create(
    name='Основная конфигурация',
    client_id='ваш_client_id',
    client_secret='ваш_client_secret',
    redirect_uri='https://ваш-домен.com/hhru/oauth/callback/',
    is_default=True,
    is_active=True
)
```

### Шаг 3: Получение URL авторизации

**Через API:**
```http
GET /api/v1/hhru/oauth/
Authorization: Bearer YOUR_TOKEN
```

**Ответ:**
```json
{
    "success": true,
    "auth_url": "https://hh.ru/oauth/authorize?response_type=code&client_id=...",
    "params": {
        "response_type": "code",
        "client_id": "...",
        "redirect_uri": "...",
        "state": "123"
    }
}
```

### Шаг 4: Авторизация пользователя

1. Перенаправьте пользователя на `auth_url` из предыдущего шага
2. Пользователь авторизуется на HH.ru
3. HH.ru перенаправит пользователя на ваш `redirect_uri` с параметром `code`
4. Отправьте POST запрос для обмена кода на токены:

```http
POST /api/v1/hhru/oauth/callback/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "code": "полученный_код_авторизации",
    "state": "123"
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "Авторизация успешна",
    "account": {
        "id": 1,
        "user": 1,
        "hh_user_id": "12345678",
        "email": "user@example.com",
        "first_name": "Иван",
        "last_name": "Иванов",
        "is_employer": true,
        "is_admin": true,
        ...
    }
}
```

### Шаг 5: Использование API

После успешной авторизации вы можете использовать API для работы с данными:

```python
from apps.hhru.services import HHRUService

service = HHRUService(user)

# Получить информацию о профиле
result = service.get_me()

# Получить список вакансий
vacancies = service.get_vacancies()

# Получить отклики по вакансии
responses = service.get_responses(vacancy_id='123456')
```

## 📡 API Endpoints

### Аккаунты

- `GET /api/v1/hhru/accounts/` - список аккаунтов текущего пользователя
- `GET /api/v1/hhru/accounts/{id}/` - информация об аккаунте
- `POST /api/v1/hhru/accounts/{id}/test_connection/` - тестирование подключения
- `POST /api/v1/hhru/accounts/{id}/refresh_token/` - обновление токена
- `GET /api/v1/hhru/accounts/{id}/get_profile/` - получение профиля из HH.ru
- `GET /api/v1/hhru/accounts/{id}/get_vacancies/` - получение списка вакансий
- `GET /api/v1/hhru/accounts/{id}/get_responses/` - получение списка откликов

### Конфигурации

- `GET /api/v1/hhru/configurations/` - список конфигураций
- `POST /api/v1/hhru/configurations/` - создание конфигурации
- `GET /api/v1/hhru/configurations/{id}/` - информация о конфигурации
- `PUT /api/v1/hhru/configurations/{id}/` - обновление конфигурации
- `DELETE /api/v1/hhru/configurations/{id}/` - удаление конфигурации
- `GET /api/v1/hhru/configurations/get_default/` - получение конфигурации по умолчанию

### Логи

- `GET /api/v1/hhru/logs/` - список логов API запросов
- `GET /api/v1/hhru/logs/{id}/` - информация о логе

### OAuth

- `GET /api/v1/hhru/oauth/` - получение URL авторизации
- `POST /api/v1/hhru/oauth/callback/` - обработка OAuth callback

### Тестирование

- `GET /api/v1/hhru/test-connection/` - тестирование подключения к API

## 🔄 Автоматическое обновление токенов

Сервис автоматически обновляет токены доступа при их истечении. Токен обновляется за 5 минут до истечения срока действия.

## 📝 Примеры использования

### Получение вакансий с фильтрацией

```python
service = HHRUService(user)

# Получить все вакансии
result = service.get_vacancies()

# Получить вакансии с пагинацией
result = service.get_vacancies(params={
    'page': 1,
    'per_page': 20
})
```

### Работа с откликами

```python
# Получить все отклики
all_responses = service.get_responses()

# Получить отклики по конкретной вакансии
vacancy_responses = service.get_responses(
    vacancy_id='123456',
    params={'page': 1, 'per_page': 50}
)

# Обновить статус отклика
service.update_response_status(
    response_id='789012',
    status='invitation',
    comment='Приглашаем на собеседование'
)
```

### Получение информации о резюме

```python
resume = service.get_resume(resume_id='345678')
```

## 🔒 Безопасность

1. **Токены хранятся в зашифрованном виде** в базе данных
2. **Refresh токены** используются для автоматического обновления access токенов
3. **Логирование всех запросов** для аудита и отладки
4. **Валидация токенов** перед каждым запросом
5. **Обработка ошибок** с подробным логированием

## ⚠️ Важные замечания

1. **Токены деактивируются** при изменении пароля учетной записи работодателя
2. **Для получения всех откликов** вход должен быть выполнен администратором учетной записи работодателя
3. **Авторизация под менеджером** без прав администратора может ограничить доступ к некоторым данным
4. **Redirect URI** должен точно совпадать с указанным при регистрации приложения

## 🐛 Отладка

Все запросы к API логируются в модель `HHRUAPILog`. Вы можете просмотреть логи через админ-панель или API:

```http
GET /api/v1/hhru/logs/
```

Логи содержат:
- Метод и эндпоинт запроса
- Данные запроса и ответа
- Код статуса ответа
- Сообщения об ошибках
- Временные метки

## 📚 Дополнительные ресурсы

- [Документация HeadHunter API](https://dev.hh.ru/)
- [OAuth 2.0 спецификация](https://oauth.net/2/)
- [HeadHunter API Reference](https://github.com/hhru/api)

