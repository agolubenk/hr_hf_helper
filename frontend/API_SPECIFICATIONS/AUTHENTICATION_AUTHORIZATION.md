# Authentication & Authorization Specification

## Общее описание

Документ описывает систему аутентификации и авторизации в HR Helper, включая методы аутентификации, хранение токенов, жизненный цикл токенов, матрицу ролей и прав доступа.

## 1. Authentication (Аутентификация)

### 1.1 Метод аутентификации

**Используется:** JWT (JSON Web Tokens) + Refresh Tokens

**Причины выбора:**
- Stateless (не требует хранения сессий на сервере)
- Масштабируемость
- Безопасность (подпись токенов)
- Поддержка микросервисной архитектуры

### 1.2 Хранение токенов

**Access Token:**
- Хранится в **Memory** (JavaScript переменная)
- НЕ хранится в localStorage (защита от XSS)
- НЕ хранится в sessionStorage
- Автоматически удаляется при закрытии вкладки

**Refresh Token:**
- Хранится в **HttpOnly Cookie**
- Флаг `Secure`: true (только HTTPS)
- Флаг `SameSite`: Strict
- `Max-Age`: 30 дней
- `Path`: `/api/auth/refresh`

**Реализация:**

```typescript
// Сохранение токенов после логина
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  credentials: 'include' // Для cookies
});

const { access_token } = await response.json();

// Access token в memory
let accessToken = access_token;

// Refresh token автоматически в HttpOnly cookie
```

### 1.3 Жизненный цикл токенов

**Access Token:**
- **TTL (Time To Live):** 15 минут
- **Формат:** JWT
- **Payload:**
  ```json
  {
    "user_id": "user_123",
    "email": "user@example.com",
    "role": "recruiter",
    "company_id": "comp_456",
    "permissions": ["read:vacancies", "write:candidates"],
    "iat": 1706457600,
    "exp": 1706458500
  }
  ```

**Refresh Token:**
- **TTL:** 30 дней
- **Формат:** Random string (UUID)
- **Хранение:** Database (таблица `refresh_tokens`)
- **Структура:**
  ```sql
  CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP NULL,
    device_info TEXT,
    ip_address VARCHAR(45)
  );
  ```

**Процесс обновления токена:**

```typescript
// 1. Access token истек
if (isTokenExpired(accessToken)) {
  // 2. Запрос нового access token используя refresh token
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Refresh token в HttpOnly cookie
  });
  
  const { access_token } = await response.json();
  accessToken = access_token;
}
```

**Ротация Refresh Token:**
- При каждом использовании refresh token создается новый
- Старый refresh token помечается как использованный
- Максимум 5 активных refresh tokens на пользователя
- При превышении лимита - удаляются самые старые

### 1.4 Процесс логина

**Шаги:**

1. **Пользователь вводит email и password**
2. **Валидация на клиенте:**
   - Email формат
   - Password не пустой
3. **Запрос на сервер:**
   ```http
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "secure_password"
   }
   ```
4. **Сервер проверяет:**
   - Email существует
   - Password корректен (bcrypt)
   - Пользователь активен
   - 2FA (если включена)
5. **Сервер возвращает:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "Bearer",
     "expires_in": 900,
     "user": {
       "id": "user_123",
       "email": "user@example.com",
       "role": "recruiter",
       "company_id": "comp_456"
     }
   }
   ```
6. **Refresh token устанавливается в HttpOnly cookie автоматически**

### 1.5 2FA (Two-Factor Authentication)

**Методы:**
- Telegram Bot (основной)
- Email код (резервный)
- TOTP (Time-based One-Time Password) - планируется

**Процесс:**

1. После успешного ввода email/password
2. Если 2FA включена для пользователя:
   ```json
   {
     "requires_2fa": true,
     "methods": ["telegram", "email"],
     "session_token": "temp_session_123"
   }
   ```
3. Пользователь выбирает метод
4. Код отправляется через выбранный метод
5. Пользователь вводит код:
   ```http
   POST /api/auth/verify-2fa
   {
     "session_token": "temp_session_123",
     "code": "123456",
     "method": "telegram"
   }
   ```
6. При успешной верификации - выдается access token

**Настройки 2FA:**
- Можно включить/выключить в профиле
- Можно выбрать методы
- Backup codes для восстановления доступа

## 2. Authorization (Авторизация)

### 2.1 Матрица ролей и прав доступа (RBAC)

**Роли:**

1. **Admin** (Супер-администратор)
2. **HR Manager** (HR менеджер компании)
3. **Recruiter** (Рекрутер)
4. **Interviewer** (Интервьюер)
5. **Candidate** (Кандидат)

**Таблица прав доступа:**

| Ресурс | Action | Admin | HR Manager | Recruiter | Interviewer | Candidate |
|--------|--------|-------|------------|-----------|-------------|-----------|
| **Users** | | | | | | |
| | Create | ✅ | ✅ (только своей компании) | ❌ | ❌ | ❌ |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только себя) | ✅ (только себя) | ✅ (только себя) |
| | Update | ✅ | ✅ (своей компании) | ✅ (только себя) | ✅ (только себя) | ✅ (только себя) |
| | Delete | ✅ | ✅ (своей компании) | ❌ | ❌ | ❌ |
| **Companies** | | | | | | |
| | Create | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Read | ✅ (все) | ✅ (только свою) | ✅ (только свою) | ✅ (только свою) | ✅ (только свою) |
| | Update | ✅ | ✅ (только свою) | ❌ | ❌ | ❌ |
| | Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vacancies** | | | | | | |
| | Create | ✅ | ✅ (своей компании) | ✅ (своей компании) | ❌ | ❌ |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только свои) | ✅ (назначенные) | ✅ (публичные) |
| | Update | ✅ | ✅ (своей компании) | ✅ (только свои) | ❌ | ❌ |
| | Delete | ✅ | ✅ (своей компании) | ✅ (только свои) | ❌ | ❌ |
| | Publish | ✅ | ✅ (своей компании) | ✅ (только свои) | ❌ | ❌ |
| **Candidates** | | | | | | |
| | Create | ✅ | ✅ (своей компании) | ✅ (своей компании) | ❌ | ✅ (только себя) |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только свои вакансии) | ✅ (назначенные) | ✅ (только себя) |
| | Update | ✅ | ✅ (своей компании) | ✅ (только свои вакансии) | ✅ (только оценки) | ✅ (только себя) |
| | Delete | ✅ | ✅ (своей компании) | ✅ (только свои вакансии) | ❌ | ❌ |
| **Interviews** | | | | | | |
| | Create | ✅ | ✅ (своей компании) | ✅ (своей компании) | ❌ | ❌ |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (свои вакансии) | ✅ (назначенные) | ✅ (только свои) |
| | Update | ✅ | ✅ (своей компании) | ✅ (свои вакансии) | ✅ (только свои) | ❌ |
| | Delete | ✅ | ✅ (своей компании) | ✅ (свои вакансии) | ❌ | ❌ |
| **Workflow Stages** | | | | | | |
| | Change | ✅ | ✅ (своей компании) | ✅ (только свои вакансии) | ✅ (только Interview→Interview) | ❌ |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (свои вакансии) | ✅ (назначенные) | ✅ (только себя) |
| **Salary Ranges** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (свои вакансии) | ❌ | ✅ (публичные) |
| | Update | ✅ | ✅ (своей компании) | ✅ (только свои) | ❌ | ❌ |
| **Reports** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только свои) | ❌ | ❌ |
| **Settings** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только свои) | ✅ (только свои) | ✅ (только свои) |
| | Update | ✅ | ✅ (своей компании) | ✅ (только свои) | ✅ (только свои) | ✅ (только свои) |

### 2.2 API Scopes (Области доступа)

**Формат scope:** `{action}:{resource}`

**Примеры:**
- `read:vacancies` - чтение вакансий
- `write:vacancies` - создание/изменение вакансий
- `delete:vacancies` - удаление вакансий
- `read:candidates` - чтение кандидатов
- `write:candidates` - создание/изменение кандидатов
- `change:workflow` - изменение этапов workflow
- `read:reports` - чтение отчетов
- `admin:users` - управление пользователями

**Scopes по ролям:**

**Admin:**
```
*:* (все права)
```

**HR Manager:**
```
read:*, write:*, delete:* (для своей компании)
admin:users (только своей компании)
```

**Recruiter:**
```
read:vacancies, write:vacancies, delete:vacancies (только свои)
read:candidates, write:candidates, delete:candidates (только свои вакансии)
read:interviews, write:interviews, delete:interviews (только свои вакансии)
change:workflow (только свои вакансии)
read:reports (только свои)
```

**Interviewer:**
```
read:vacancies (назначенные)
read:candidates (назначенные)
read:interviews, write:interviews (только свои)
change:workflow (только Interview→Interview)
```

**Candidate:**
```
read:vacancies (публичные)
write:candidates (только себя)
read:interviews (только свои)
read:workflow (только себя)
```

### 2.3 Row-Level Security (RLS)

**Принцип:** Пользователь видит только данные, к которым имеет доступ

**Реализация на уровне запросов:**

**Пример: GET /api/vacancies/{id}/**

```python
def get_vacancy(vacancy_id, user):
    # 1. Получить вакансию
    vacancy = Vacancy.objects.get(id=vacancy_id)
    
    # 2. Проверить доступ
    if user.role == 'admin':
        return vacancy  # Видит все
    
    if user.role == 'hr_manager':
        if vacancy.company_id != user.company_id:
            raise PermissionDenied("Недостаточно прав")
        return vacancy
    
    if user.role == 'recruiter':
        if vacancy.company_id != user.company_id:
            raise PermissionDenied("Недостаточно прав")
        if vacancy.owner_id != user.id and user.id not in vacancy.assigned_recruiters:
            raise PermissionDenied("Недостаточно прав")
        return vacancy
    
    if user.role == 'interviewer':
        if vacancy.id not in user.assigned_vacancies:
            raise PermissionDenied("Недостаточно прав")
        # Ограниченный набор полей
        return {
            'id': vacancy.id,
            'title': vacancy.title,
            'description': vacancy.description,
            # Без salary_range, без внутренних комментариев
        }
    
    if user.role == 'candidate':
        if vacancy.status != 'active':
            raise PermissionDenied("Вакансия неактивна")
        # Только публичные данные
        return {
            'id': vacancy.id,
            'title': vacancy.title,
            'description': vacancy.description,
            'locations': vacancy.locations,
            'required_skills': vacancy.required_skills,
            # Без salary_range, без внутренних данных
        }
```

**Правила RLS:**

1. **Recruiter видит только:**
   - Вакансии, где он owner или assigned recruiter
   - Кандидатов только своих вакансий
   - Не видит кандидатов других рекрутеров (даже в той же компании)

2. **Interviewer видит только:**
   - Вакансии, на которые он назначен
   - Кандидатов, с которыми у него назначены интервью
   - Не видит зарплатные вилки
   - Не видит внутренние комментарии

3. **Candidate видит только:**
   - Публичные вакансии (status = 'active')
   - Только свою кандидатуру
   - Только свои интервью
   - Не видит зарплатные вилки (до оффера)
   - Не видит комментарии рекрутеров

4. **HR Manager видит:**
   - Все данные своей компании
   - Не видит данные других компаний

5. **Admin видит:**
   - Все данные всех компаний

### 2.4 Проверка прав в API

**Middleware для проверки прав:**

```python
@require_permission('read:vacancies')
def get_vacancy(request, vacancy_id):
    # Проверка прав уже выполнена в middleware
    vacancy = Vacancy.objects.get(id=vacancy_id)
    
    # Дополнительная проверка RLS
    if not can_user_access_vacancy(request.user, vacancy):
        raise PermissionDenied()
    
    return vacancy
```

**Декоратор для проверки прав:**

```python
def require_permission(permission):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_permission(permission):
                raise PermissionDenied(f"Требуется право: {permission}")
            return func(request, *args, **kwargs)
        return wrapper
    return decorator
```

## 3. Безопасность

### 3.1 Защита от атак

**XSS (Cross-Site Scripting):**
- HttpOnly cookies для refresh tokens
- Content Security Policy (CSP)
- Валидация и санитизация всех входных данных

**CSRF (Cross-Site Request Forgery):**
- SameSite cookies
- CSRF tokens для state-changing операций

**SQL Injection:**
- Использование ORM (параметризованные запросы)
- Валидация всех входных данных

**Brute Force:**
- Rate limiting: максимум 5 попыток входа в минуту
- Блокировка после 10 неудачных попыток на 30 минут
- CAPTCHA после 3 неудачных попыток

### 3.2 Логирование безопасности

**Логируются:**
- Все попытки входа (успешные и неудачные)
- Все изменения прав доступа
- Все попытки доступа к запрещенным ресурсам
- Все изменения критичных данных (пароли, роли)

**Формат лога:**
```json
{
  "event": "login_failed",
  "user_id": null,
  "email": "user@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-01-28T18:00:00Z",
  "reason": "invalid_password"
}
```

## 4. Связь с другими спецификациями

- **Страницы аккаунта и потоки:** детальная логика входа (email/пароль, Google OAuth), восстановления пароля, сброса пароля и страницы профиля (вкладки, API профиля/интеграций/быстрых кнопок/темы) — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (раздел 10.26).
- **Коды ошибок аутентификации:** формат ответов и обработка на клиенте — [ERROR_HANDLING.md](./ERROR_HANDLING.md).
- **Хранение refresh token и профиля:** схема таблиц — [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## 5. Примеры использования

### 5.1 Получение вакансии

**Запрос:**
```http
GET /api/vacancies/vac_123/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Проверка:**
1. Валидация JWT токена
2. Извлечение user_id и role из токена
3. Проверка scope: `read:vacancies`
4. Проверка RLS: может ли пользователь видеть эту вакансию
5. Возврат данных (с учетом прав доступа)

**Ответы:**

**Успех (Recruiter):**
```json
{
  "id": "vac_123",
  "title": "Senior Frontend Developer",
  "description": "...",
  "salary_range_min": 5000,
  "salary_range_max": 8000,
  "status": "active",
  "candidates_count": 15
}
```

**Ошибка (недостаточно прав):**
```json
{
  "status": 403,
  "error_code": "FORBIDDEN",
  "message": "Недостаточно прав для просмотра этой вакансии",
  "required_permission": "read:vacancies"
}
```

**Ошибка (токен истек):**
```json
{
  "status": 401,
  "error_code": "TOKEN_EXPIRED",
  "message": "Access token истек. Используйте refresh token для получения нового."
}
```

## Обновления (версия 1.1.0)

### Новые права доступа:

**Этапы найма с настройками встреч:**
- `read:recruiting_stages` - чтение этапов найма и их настроек (включая `is_meeting`, `show_offices`, `show_interviewers`)
- `write:recruiting_stages` - изменение настроек этапов найма (цвет, описание, настройки встреч)
- Требуется для настройки динамических тогглеров на страницах `/workflow` и `/recr-chat`

**Команды рекрутинга:**
- `read:recruiting_commands` - чтение команд рекрутинга
- `write:recruiting_commands` - создание/изменение команд рекрутинга (требуется обязательный `stage_id`)
- `delete:recruiting_commands` - удаление команд рекрутинга
- Требуется для управления командами workflow чата с поддержкой раскладки клавиатуры

**Настройки вакансии по странам:**
- `read:vacancy_country_settings` - чтение настроек вакансии по странам (текст, активность, вопросы и ссылки)
- `write:vacancy_country_settings` - изменение настроек вакансии по странам
- Требуется для управления многоязычными и мультистрановыми настройками вакансий

### Обновленная матрица прав доступа:

| Ресурс | Action | Admin | HR Manager | Recruiter | Interviewer | Candidate |
|--------|--------|-------|------------|-----------|-------------|-----------|
| **Recruiting Stages** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (своей компании) | ✅ (назначенные) | ❌ |
| | Update | ✅ | ✅ (своей компании) | ❌ | ❌ | ❌ |
| **Recruiting Commands** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (своей компании) | ✅ (своей компании) | ❌ |
| | Create/Update | ✅ | ✅ (своей компании) | ❌ | ❌ | ❌ |
| | Delete | ✅ | ✅ (своей компании) | ❌ | ❌ | ❌ |
| **Vacancy Country Settings** | | | | | | |
| | Read | ✅ (все) | ✅ (своей компании) | ✅ (только свои вакансии) | ❌ | ❌ |
| | Update | ✅ | ✅ (своей компании) | ✅ (только свои вакансии) | ❌ | ❌ |

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
