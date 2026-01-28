# Быстрый старт: Интеграция с HeadHunter.ru

## 🚀 Быстрая настройка

### 1. Регистрация приложения на HH.ru

1. Перейдите на https://dev.hh.ru/
2. Войдите в свой аккаунт работодателя
3. Создайте новое приложение
4. Сохраните `client_id` и `client_secret`
5. Укажите `redirect_uri`: `https://ваш-домен.com/api/v1/hhru/oauth/callback/`

### 2. Создание конфигурации

**Через админ-панель Django:**
1. Войдите в админ-панель: `/admin/`
2. Перейдите в раздел "HH.ru конфигурации"
3. Нажмите "Добавить конфигурацию"
4. Заполните поля:
   - **Название**: Основная конфигурация
   - **Client ID**: ваш_client_id
   - **Client Secret**: ваш_client_secret
   - **Redirect URI**: https://ваш-домен.com/api/v1/hhru/oauth/callback/
   - **По умолчанию**: ✓
   - **Активна**: ✓
5. Сохраните

**Через API:**
```http
POST /api/v1/hhru/configurations/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "name": "Основная конфигурация",
    "client_id": "ваш_client_id",
    "client_secret": "ваш_client_secret",
    "redirect_uri": "https://ваш-домен.com/api/v1/hhru/oauth/callback/",
    "is_default": true,
    "is_active": true
}
```

### 3. Авторизация пользователя

**Шаг 1: Получение URL авторизации**

```http
GET /api/v1/hhru/oauth/
Authorization: Bearer YOUR_TOKEN
```

**Ответ:**
```json
{
    "success": true,
    "auth_url": "https://hh.ru/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&state=123"
}
```

**Шаг 2: Перенаправление пользователя**

Перенаправьте пользователя на `auth_url` из ответа. Пользователь должен авторизоваться на HH.ru.

**Шаг 3: Обработка callback**

После авторизации HH.ru перенаправит пользователя на ваш `redirect_uri` с параметром `code`. Обработайте этот callback:

```http
POST /api/v1/hhru/oauth/callback/
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "code": "полученный_код_из_callback",
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
        "hh_user_id": "12345678",
        "email": "user@example.com",
        "is_employer": true,
        "is_admin": true
    }
}
```

### 4. Использование API

После успешной авторизации вы можете использовать API:

**Получить профиль:**
```http
GET /api/v1/hhru/accounts/{account_id}/get_profile/
Authorization: Bearer YOUR_TOKEN
```

**Получить вакансии:**
```http
GET /api/v1/hhru/accounts/{account_id}/get_vacancies/
Authorization: Bearer YOUR_TOKEN
```

**Получить отклики:**
```http
GET /api/v1/hhru/accounts/{account_id}/get_responses/?vacancy_id=123456
Authorization: Bearer YOUR_TOKEN
```

**Тестирование подключения:**
```http
GET /api/v1/hhru/test-connection/
Authorization: Bearer YOUR_TOKEN
```

## 📝 Примеры кода

### Python (Django)

```python
from apps.hhru.services import HHRUService, HHRUOAuthService
from apps.hhru.models import HHRUAccount

# Получить URL авторизации
result = HHRUOAuthService.get_authorization_url(user)
auth_url = result['auth_url']

# После получения кода авторизации
result = HHRUOAuthService.exchange_code_for_tokens(
    user=user,
    authorization_code=code
)

# Использование API
service = HHRUService(user)
profile = service.get_me()
vacancies = service.get_vacancies()
responses = service.get_responses(vacancy_id='123456')
```

### JavaScript (Fetch API)

```javascript
// Получение URL авторизации
const response = await fetch('/api/v1/hhru/oauth/', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
const { auth_url } = await response.json();

// Перенаправление пользователя
window.location.href = auth_url;

// После callback - обмен кода на токены
const callbackResponse = await fetch('/api/v1/hhru/oauth/callback/', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        code: urlParams.get('code'),
        state: urlParams.get('state')
    })
});

// Использование API
const accountId = 1;
const profileResponse = await fetch(`/api/v1/hhru/accounts/${accountId}/get_profile/`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## ⚠️ Важные замечания

1. **Токены автоматически обновляются** при истечении срока действия
2. **Для получения всех откликов** требуется авторизация администратора аккаунта работодателя
3. **Redirect URI** должен точно совпадать с указанным при регистрации приложения
4. **Токены деактивируются** при изменении пароля учетной записи работодателя

## 🔍 Отладка

Все запросы логируются. Просмотреть логи можно через:

```http
GET /api/v1/hhru/logs/
Authorization: Bearer YOUR_TOKEN
```

Или через админ-панель: `/admin/hhru/hhruapilog/`

## 📚 Дополнительная документация

Подробная документация доступна в файле [README.md](README.md)

