# Error Handling Standards

## Общее описание

Документ описывает единый стандарт обработки ошибок в API HR Helper, включая формат ошибок, коды ошибок и обработку на клиенте.

## 1. Единый формат ошибок

### 1.1 Стандартная структура ответа об ошибке

**Формат:**
```json
{
  "status": 404,
  "error_code": "VACANCY_NOT_FOUND",
  "message": "Vacancy with id 'abc123' does not exist",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "details": {
    "vacancy_id": "abc123",
    "company_id": "comp-456"
  },
  "path": "/api/vacancies/abc123/",
  "method": "GET"
}
```

**Поля:**

- `status` (number, обязательное) - HTTP статус код
- `error_code` (string, обязательное) - Уникальный код ошибки
- `message` (string, обязательное) - Человекочитаемое сообщение
- `timestamp` (string, обязательное) - ISO 8601 timestamp
- `request_id` (string, обязательное) - Уникальный ID запроса для трейсинга
- `details` (object, опциональное) - Дополнительные детали ошибки
- `path` (string, опциональное) - Путь запроса
- `method` (string, опциональное) - HTTP метод

### 1.2 Валидационные ошибки

**Формат для 422 (Validation Error):**
```json
{
  "status": 422,
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_EMAIL",
      "message": "Email must be a valid email address"
    },
    {
      "field": "salary_range_min",
      "code": "INVALID_RANGE",
      "message": "salary_range_min must be less than salary_range_max"
    }
  ]
}
```

## 2. Коды ошибок

### 2.1 Общие коды ошибок

| HTTP Status | Error Code | Описание | Пример использования |
|-------------|------------|----------|---------------------|
| 400 | `INVALID_REQUEST` | Некорректный запрос | Неверный формат JSON |
| 400 | `MISSING_REQUIRED_FIELD` | Отсутствует обязательное поле | Не указан `title` при создании вакансии |
| 400 | `INVALID_PARAMETER` | Некорректный параметр | `page_size` больше 100 |
| 401 | `UNAUTHORIZED` | Не авторизован | Отсутствует токен |
| 401 | `TOKEN_EXPIRED` | Токен истек | Access token истек |
| 401 | `TOKEN_INVALID` | Невалидный токен | Токен поврежден |
| 401 | `INVALID_CREDENTIALS` | Неверные учетные данные | Неверный email/password |
| 401 | `TWO_FA_REQUIRED` | Требуется 2FA | Нужна верификация 2FA |
| 401 | `TWO_FA_INVALID` | Неверный код 2FA | Неверный код подтверждения |
| 403 | `FORBIDDEN` | Доступ запрещен | Недостаточно прав |
| 403 | `PERMISSION_DENIED` | Отказано в доступе | Нет права `write:vacancies` |
| 404 | `NOT_FOUND` | Ресурс не найден | Общий случай |
| 404 | `VACANCY_NOT_FOUND` | Вакансия не найдена | Вакансия с указанным ID не существует |
| 404 | `CANDIDATE_NOT_FOUND` | Кандидат не найден | Кандидат с указанным ID не существует |
| 404 | `USER_NOT_FOUND` | Пользователь не найден | Пользователь с указанным ID не существует |
| 404 | `FILE_NOT_FOUND` | Файл не найден | Файл с указанным ID не существует |
| 409 | `CONFLICT` | Конфликт | Общий случай |
| 409 | `CANDIDATE_ALREADY_EXISTS` | Кандидат уже существует | Кандидат уже подал заявку на эту вакансию |
| 409 | `EMAIL_ALREADY_EXISTS` | Email уже используется | Email уже зарегистрирован |
| 422 | `VALIDATION_ERROR` | Ошибка валидации | Общий случай валидации |
| 422 | `INVALID_EMAIL` | Невалидный email | Неверный формат email |
| 422 | `INVALID_PHONE` | Невалидный телефон | Неверный формат телефона |
| 422 | `INVALID_DATE` | Невалидная дата | Дата в прошлом |
| 422 | `INVALID_RANGE` | Невалидный диапазон | min > max |
| 422 | `INVALID_ENUM` | Невалидное значение enum | Неизвестный статус |
| 429 | `RATE_LIMITED` | Превышен лимит запросов | Слишком много запросов |
| 402 | `PAYMENT_REQUIRED` | Требуется оплата/подписка | Страница `/errors/402` |
| 500 | `INTERNAL_ERROR` | Внутренняя ошибка сервера | Неожиданная ошибка |
| 500 | `DATABASE_ERROR` | Ошибка базы данных | Ошибка подключения к БД |
| 503 | `SERVICE_UNAVAILABLE` | Сервис недоступен | Внешний сервис недоступен |
| 503 | `MAINTENANCE` | Сервис на обслуживании | Плановое обслуживание |

### 2.2 Специфичные коды ошибок

#### Вакансии

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `VACANCY_NOT_FOUND` | 404 | Вакансия не найдена |
| `VACANCY_CLOSED` | 409 | Вакансия закрыта |
| `VACANCY_PUBLISH_FORBIDDEN` | 403 | Публикация вакансии запрещена (не все поля заполнены) |

#### Кандидаты

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `CANDIDATE_NOT_FOUND` | 404 | Кандидат не найден |
| `CANDIDATE_ALREADY_EXISTS` | 409 | Кандидат уже существует |
| `CANDIDATE_STAGE_TRANSITION_FORBIDDEN` | 403 | Переход между этапами запрещен |
| `CANDIDATE_DELETE_FORBIDDEN` | 403 | Удаление кандидата запрещено |

#### Интервью

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `INTERVIEW_NOT_FOUND` | 404 | Интервью не найдено |
| `INTERVIEWER_UNAVAILABLE` | 409 | Интервьюер недоступен в указанное время |
| `INTERVIEW_CANCEL_FORBIDDEN` | 403 | Отмена интервью запрещена (менее чем за 2 часа) |

#### Workflow

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `STAGE_TRANSITION_FORBIDDEN` | 403 | Переход между этапами запрещен |
| `STAGE_TRANSITION_REQUIRES_COMMENT` | 422 | Требуется комментарий для перехода |
| `STAGE_TRANSITION_INVALID` | 422 | Недопустимый переход между этапами |
| `WORKFLOW_RULE_NOT_FOUND` | 404 | Правило workflow не найдено |

#### Команды рекрутинга

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `COMMAND_NOT_FOUND` | 404 | Команда не найдена |
| `COMMAND_DUPLICATE` | 409 | Команда уже существует (с учетом раскладки, если `allow_any_layout = true`) |
| `COMMAND_INVALID_FORMAT` | 422 | Команда должна начинаться с "/" |
| `COMMAND_STAGE_REQUIRED` | 422 | Команда должна быть связана с этапом найма (`stage_id` обязателен) |
| `COMMAND_TYPE_INVALID` | 422 | Неверный тип команды (должен быть "analysis" или "event") |
| `COMMAND_STAGE_NOT_FOUND` | 404 | Этап найма, связанный с командой, не найден |

#### Вакансии по странам и офисам

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `VACANCY_COUNTRY_NOT_FOUND` | 404 | Настройки вакансии для указанной страны не найдены |
| `VACANCY_COUNTRY_INACTIVE` | 409 | Вакансия неактивна для указанной страны |
| `VACANCY_FIELD_INACTIVE` | 409 | Поле вакансии неактивно для указанной страны |
| `VACANCY_OFFICE_NOT_FOUND` | 404 | Настройки вакансии для указанного офиса не найдены |
| `VACANCY_OFFICE_INACTIVE` | 409 | Вакансия неактивна для указанного офиса (синхронизируется с активностью страны) |

#### Этапы найма с настройками встреч

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `RECRUITING_STAGE_NOT_FOUND` | 404 | Этап найма не найден |
| `RECRUITING_STAGE_MEETING_SETTINGS_INVALID` | 422 | Некорректные настройки встречи (например, `show_offices = true` при `is_meeting = false`) |

#### Аутентификация и аккаунт

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `UNAUTHORIZED` | 401 | Не авторизован |
| `TOKEN_EXPIRED` | 401 | Токен истек |
| `TOKEN_INVALID` | 401 | Невалидный токен |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token истек |
| `REFRESH_TOKEN_REVOKED` | 401 | Refresh token отозван |
| `INVALID_CREDENTIALS` | 401 | Неверные учетные данные |
| `ACCOUNT_LOCKED` | 403 | Аккаунт заблокирован (слишком много неудачных попыток) |
| `ACCOUNT_INACTIVE` | 403 | Аккаунт неактивен |

#### Файлы

| Error Code | HTTP Status | Описание |
|------------|-------------|----------|
| `FILE_NOT_FOUND` | 404 | Файл не найден |
| `FILE_TOO_LARGE` | 413 | Файл слишком большой |
| `FILE_TYPE_NOT_ALLOWED` | 415 | Тип файла не разрешен |
| `FILE_UPLOAD_FAILED` | 500 | Ошибка загрузки файла |

## 3. Обработка ошибок на клиенте

### 3.1 Типы ошибок

```typescript
interface ApiError {
  status: number;
  error_code: string;
  message: string;
  timestamp: string;
  request_id: string;
  details?: Record<string, any>;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
}
```

### 3.2 Обработчик ошибок

```typescript
class ApiErrorHandler {
  static handle(error: ApiError): void {
    // Логирование
    console.error('API Error:', {
      code: error.error_code,
      message: error.message,
      request_id: error.request_id
    });
    
    // Обработка по типу ошибки
    switch (error.status) {
      case 401:
        this.handleUnauthorized(error);
        break;
      case 403:
        this.handleForbidden(error);
        break;
      case 404:
        this.handleNotFound(error);
        break;
      case 422:
        this.handleValidationError(error);
        break;
      case 429:
        this.handleRateLimit(error);
        break;
      case 500:
      case 503:
        this.handleServerError(error);
        break;
      default:
        this.handleGenericError(error);
    }
  }
  
  static handleUnauthorized(error: ApiError): void {
    // Токен истек - попытка обновить
    if (error.error_code === 'TOKEN_EXPIRED') {
      refreshToken();
    } else {
      // Перенаправление на страницу логина
      router.push('/account/login');
    }
  }
  
  static handleForbidden(error: ApiError): void {
    // Показать сообщение об отсутствии прав
    toast.error(`Доступ запрещен: ${error.message}`);
  }
  
  static handleNotFound(error: ApiError): void {
    // Показать сообщение о том, что ресурс не найден
    toast.error(`Не найдено: ${error.message}`);
  }
  
  static handleValidationError(error: ApiError): void {
    // Показать ошибки валидации в форме
    if (error.errors) {
      error.errors.forEach(err => {
        showFieldError(err.field, err.message);
      });
    }
  }
  
  static handleRateLimit(error: ApiError): void {
    // Показать сообщение о превышении лимита
    toast.error('Превышен лимит запросов. Попробуйте позже.');
  }
  
  static handleServerError(error: ApiError): void {
    // Показать общее сообщение об ошибке сервера
    toast.error('Ошибка сервера. Попробуйте позже.');
  }
}
```

### 3.3 Retry логика

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Если успех или клиентская ошибка (4xx) - не повторяем
      if (response.status < 500) {
        return response;
      }
      
      // Если серверная ошибка (5xx) - повторяем
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      
      return response;
    } catch (error) {
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## 4. Примеры использования

### 4.1 Успешный ответ

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "vac_123",
  "title": "Senior Frontend Developer",
  "status": "active"
}
```

### 4.2 Ошибка 404

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "status": 404,
  "error_code": "VACANCY_NOT_FOUND",
  "message": "Vacancy with id 'vac_123' does not exist",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "details": {
    "vacancy_id": "vac_123"
  },
  "path": "/api/vacancies/vac_123/",
  "method": "GET"
}
```

### 4.3 Ошибка валидации 422

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "status": 422,
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_EMAIL",
      "message": "Email must be a valid email address"
    },
    {
      "field": "salary_range_min",
      "code": "INVALID_RANGE",
      "message": "salary_range_min must be less than salary_range_max"
    }
  ]
}
```

### 4.4 Ошибка доступа 403

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "status": 403,
  "error_code": "PERMISSION_DENIED",
  "message": "You do not have permission to perform this action",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "details": {
    "required_permission": "write:vacancies",
    "user_permissions": ["read:vacancies", "read:candidates"]
  },
  "path": "/api/vacancies/vac_123/",
  "method": "PUT"
}
```

## 5. Логирование ошибок

### 5.1 Формат лога

```json
{
  "level": "error",
  "timestamp": "2026-01-28T18:00:00Z",
  "request_id": "req-12345",
  "error_code": "VACANCY_NOT_FOUND",
  "message": "Vacancy with id 'vac_123' does not exist",
  "user_id": "user_456",
  "path": "/api/vacancies/vac_123/",
  "method": "GET",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "stack_trace": "..."
}
```

### 5.2 Уровни логирования

- **ERROR**: Все ошибки API (4xx, 5xx)
- **WARN**: Предупреждения (например, превышение лимита)
- **INFO**: Информационные сообщения (успешные операции)
- **DEBUG**: Детальная информация для отладки

## 6. Связь с другими спецификациями

- **Аутентификация и аккаунт:** потоки логина, восстановления пароля, сброса пароля, профиля — [AUTHENTICATION_AUTHORIZATION.md](./AUTHENTICATION_AUTHORIZATION.md); детальная логика страниц аккаунта и коды ответов API — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (раздел 10.26).
- **Коды ошибок по доменам:** соответствие бизнес-правилам и сценариям — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md).

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
