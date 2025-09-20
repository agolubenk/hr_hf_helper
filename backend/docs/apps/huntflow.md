# Huntflow App Documentation

## Обзор

Приложение `huntflow` отвечает за интеграцию с Huntflow ATS (Applicant Tracking System). Включает кэширование данных, логирование операций и веб-интерфейс для работы с кандидатами и вакансиями.

## Основные функции

- Интеграция с Huntflow API
- Кэширование данных для оптимизации производительности
- Логирование всех операций с API
- Веб-интерфейс для просмотра и управления кандидатами
- Веб-интерфейс для просмотра и управления вакансиями
- Создание кандидатов из внешних источников (ClickUp, Notion)
- Управление статусами кандидатов
- Работа с комментариями и метками
- Загрузка и парсинг файлов резюме

## Модели данных

### HuntflowCache (Кэш Huntflow)
Модель для кэширования данных API запросов.

**Поля:**
- `id` - Уникальный идентификатор
- `cache_key` - Ключ кэша (CharField, max_length=255, unique=True)
- `data` - Данные кэша (JSONField, default=dict)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)
- `expires_at` - Дата истечения кэша (DateTimeField, null=True, blank=True)

**Методы:**
- `is_expired` - Проверяет, истек ли кэш
- `age_minutes` - Возвращает возраст кэша в минутах

### HuntflowLog (Лог Huntflow)
Модель для логирования операций с Huntflow API.

**Поля:**
- `id` - Уникальный идентификатор
- `log_type` - Тип операции (CharField, choices=LOG_TYPES)
- `endpoint` - Эндпоинт API (CharField, max_length=500)
- `method` - HTTP метод (CharField, max_length=10)
- `status_code` - Код ответа (IntegerField, null=True, blank=True)
- `request_data` - Данные запроса (JSONField, default=dict, blank=True)
- `response_data` - Данные ответа (JSONField, default=dict, blank=True)
- `error_message` - Сообщение об ошибке (TextField, blank=True)
- `user` - Пользователь (ForeignKey на User)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)

**Типы логов:**
- `GET` - Получение данных
- `POST` - Создание
- `PATCH` - Обновление
- `DELETE` - Удаление
- `ERROR` - Ошибка

**Методы:**
- `is_success` - Проверяет, был ли запрос успешным
- `is_error` - Проверяет, была ли ошибка

## API Endpoints

### Базовый URL
`/api/v1/huntflow/`

### Кэш

#### GET /api/v1/huntflow/cache/
Получение списка записей кэша.

**Параметры запроса:**
- `cache_key` - Фильтр по ключу кэша
- `search` - Поиск по ключу кэша
- `ordering` - Сортировка (created_at, updated_at, expires_at)

**Ответ:**
```json
[
  {
    "id": 1,
    "cache_key": "vacancy_123_456",
    "data": {...},
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-01-15T11:00:00Z",
    "is_expired": false,
    "age_minutes": 30
  }
]
```

#### GET /api/v1/huntflow/cache/{id}/
Получение записи кэша по ID.

#### GET /api/v1/huntflow/cache/expired/
Получение истекших записей кэша.

#### POST /api/v1/huntflow/cache/clear-cache/
Очистка всего кэша.

**Ответ:**
```json
{
  "message": "Кэш успешно очищен"
}
```

### Логи

#### GET /api/v1/huntflow/logs/
Получение списка логов.

**Параметры запроса:**
- `log_type` - Фильтр по типу лога
- `method` - Фильтр по HTTP методу
- `status_code` - Фильтр по коду ответа
- `user` - Фильтр по пользователю
- `search` - Поиск по эндпоинту или сообщению об ошибке
- `ordering` - Сортировка (created_at, status_code)

**Ответ:**
```json
[
  {
    "id": 1,
    "log_type": "GET",
    "endpoint": "/accounts/123/vacancies",
    "method": "GET",
    "status_code": 200,
    "request_data": {},
    "response_data": {...},
    "error_message": "",
    "user": 1,
    "user_username": "admin",
    "created_at": "2024-01-15T10:00:00Z",
    "is_success": true,
    "is_error": false
  }
]
```

#### GET /api/v1/huntflow/logs/{id}/
Получение лога по ID.

#### POST /api/v1/huntflow/logs/create-log/
Создание нового лога.

**Тело запроса:**
```json
{
  "log_type": "GET",
  "endpoint": "/accounts/123/vacancies",
  "method": "GET",
  "status_code": 200,
  "request_data": {},
  "response_data": {...},
  "error_message": ""
}
```

#### GET /api/v1/huntflow/logs/errors/
Получение только логов с ошибками.

#### GET /api/v1/huntflow/logs/stats/
Статистика по логам.

**Ответ:**
```json
{
  "total_logs": 1500,
  "success_logs": 1200,
  "error_logs": 300,
  "logs_by_type": {
    "GET": 800,
    "POST": 400,
    "PATCH": 250,
    "DELETE": 50
  },
  "logs_by_user": {
    "admin": 1000,
    "user1": 500
  },
  "recent_logs": [...],
  "cache_stats": {
    "total_cache_entries": 50,
    "expired_cache_entries": 5
  }
}
```

### API запросы

#### POST /api/v1/huntflow/request/
Выполнение API запроса к Huntflow.

**Тело запроса:**
```json
{
  "endpoint": "/accounts/123/vacancies",
  "method": "GET",
  "data": {},
  "params": {},
  "use_cache": true,
  "cache_timeout": 300
}
```

## Веб-интерфейс

### Главная страница
`/huntflow/` - Dashboard с информацией о подключении и списком организаций.

### Вакансии
- `/huntflow/accounts/{account_id}/vacancies/` - Список вакансий
- `/huntflow/accounts/{account_id}/vacancies/{vacancy_id}/` - Детали вакансии

### Кандидаты
- `/huntflow/accounts/{account_id}/applicants/` - Список кандидатов
- `/huntflow/accounts/{account_id}/applicants/{applicant_id}/` - Детали кандидата
- `/huntflow/accounts/{account_id}/applicants/{applicant_id}/edit/` - Редактирование кандидата

### AJAX Endpoints
- `/huntflow/test-connection/` - Тестирование подключения
- `/huntflow/accounts/{account_id}/vacancies/ajax/` - AJAX получение вакансий
- `/huntflow/accounts/{account_id}/applicants/ajax/` - AJAX получение кандидатов
- `/huntflow/accounts/{account_id}/applicants/{applicant_id}/comment/` - Создание комментария

## Сервисы

### HuntflowService
Основной сервис для работы с Huntflow API.

**Основные методы:**

#### Управление организациями
- `get_accounts()` - Получение списка организаций
- `test_connection()` - Тестирование подключения

#### Управление вакансиями
- `get_vacancies(account_id, **params)` - Получение списка вакансий
- `get_vacancy(account_id, vacancy_id)` - Получение вакансии по ID
- `get_vacancy_statuses(account_id)` - Получение статусов вакансий
- `get_vacancy_additional_fields(account_id)` - Получение дополнительных полей
- `update_vacancy(account_id, vacancy_id, data)` - Обновление вакансии

#### Управление кандидатами
- `get_applicants(account_id, **params)` - Получение списка кандидатов
- `get_applicant(account_id, applicant_id)` - Получение кандидата по ID
- `get_applicant_questionary(account_id, applicant_id)` - Получение анкеты
- `get_applicant_logs(account_id, applicant_id)` - Получение логов кандидата
- `update_applicant(account_id, applicant_id, data)` - Обновление кандидата
- `update_applicant_status(account_id, applicant_id, status_id, comment, vacancy_id)` - Обновление статуса
- `update_applicant_tags(account_id, applicant_id, tag_ids)` - Обновление меток
- `update_applicant_questionary(account_id, applicant_id, questionary_data)` - Обновление анкеты
- `create_applicant_comment(account_id, applicant_id, comment, vacancy_id, status_id)` - Создание комментария

#### Работа с файлами
- `upload_file(account_id, file_data, file_name, parse_file)` - Загрузка файла с парсингом

#### Создание кандидатов
- `create_applicant_from_parsed_data(...)` - Создание кандидата из распарсенных данных
- `create_applicant_from_clickup_task(clickup_task)` - Создание кандидата из задачи ClickUp
- `create_linkedin_profile_data(linkedin_url, task_name, task_description)` - Создание данных LinkedIn профиля
- `create_rabota_by_profile_data(rabota_url, task_name, task_description)` - Создание данных rabota.by профиля

#### Работа с тегами
- `get_tags(account_id)` - Получение списка меток
- `_get_or_create_tag(account_id, tag_name)` - Получение или создание тега
- `_find_tag_by_name(account_id, assignee_name)` - Поиск тега по имени
- `_add_tag_to_applicant(account_id, applicant_id, assignee_name)` - Добавление тега к кандидату

#### Утилиты
- `_make_request(method, endpoint, **kwargs)` - Выполнение HTTP запроса
- `_log_request(...)` - Логирование запроса
- `_extract_name_from_task_title(task_name)` - Извлечение ФИО из названия задачи
- `_create_clickup_comment(...)` - Создание комментария из данных ClickUp
- `_create_notion_comment(...)` - Создание комментария из данных Notion

## Кэширование

### HuntflowAPICache
Сервис кэширования данных Huntflow API (из `apps.google_oauth.cache_service`).

**Методы:**
- `get_vacancy(user_id, account_id, vacancy_id)` - Получение вакансии из кэша
- `set_vacancy(user_id, data, account_id, vacancy_id)` - Сохранение вакансии в кэш
- `clear_vacancy(user_id, account_id, vacancy_id)` - Очистка кэша вакансии
- `get_candidate(user_id, account_id, applicant_id)` - Получение кандидата из кэша
- `set_candidate(user_id, data, account_id, applicant_id)` - Сохранение кандидата в кэш
- `clear_candidate(user_id, account_id, applicant_id)` - Очистка кэша кандидата

## Логирование

Все операции с Huntflow API автоматически логируются в модель `HuntflowLog`:

- **Успешные запросы** - сохраняются с кодом ответа 200-299
- **Ошибки** - сохраняются с кодом ответа 400+ или типом 'ERROR'
- **Данные запроса** - сохраняются в `request_data`
- **Данные ответа** - сохраняются в `response_data`
- **Сообщения об ошибках** - сохраняются в `error_message`

## Связи с другими приложениями

### apps.accounts
- Связь через `user` (ForeignKey на User)
- Использование настроек Huntflow пользователя (`huntflow_prod_url`, `huntflow_sandbox_url`, `huntflow_prod_api_key`, `huntflow_sandbox_api_key`, `active_system`)

### apps.clickup_int
- Интеграция для создания кандидатов из задач ClickUp
- Использование `ClickUpService` для получения вложений и комментариев

### apps.notion_int
- Потенциальная интеграция для создания кандидатов из данных Notion

### apps.google_oauth
- Использование `HuntflowAPICache` для кэширования данных

## Разрешения

- **IsAuthenticated** - для всех endpoints
- Доступ к данным только для авторизованных пользователей
- Логирование всех операций с привязкой к пользователю

## Конфигурация

### Настройки пользователя
Каждый пользователь должен иметь настроенные поля:
- `huntflow_prod_url` - URL продакшн системы Huntflow
- `huntflow_sandbox_url` - URL песочницы Huntflow
- `huntflow_prod_api_key` - API ключ для продакшн
- `huntflow_sandbox_api_key` - API ключ для песочницы
- `active_system` - Активная система ('PROD' или 'SANDBOX')

### API Endpoints
Базовые endpoints Huntflow API:
- `/v2/accounts` - Управление организациями
- `/v2/accounts/{account_id}/vacancies` - Управление вакансиями
- `/v2/accounts/{account_id}/applicants` - Управление кандидатами
- `/v2/accounts/{account_id}/tags` - Управление метками
- `/v2/accounts/{account_id}/upload` - Загрузка файлов

## Примеры использования

### Получение списка организаций

```python
from apps.huntflow.services import HuntflowService

# Создаем сервис для пользователя
service = HuntflowService(request.user)

# Получаем список организаций
accounts = service.get_accounts()
if accounts:
    for account in accounts.get('items', []):
        print(f"Организация: {account['name']} (ID: {account['id']})")
```

### Создание кандидата из задачи ClickUp

```python
# Получаем задачу ClickUp
clickup_task = ClickUpTask.objects.get(id=task_id)

# Создаем сервис Huntflow
huntflow_service = HuntflowService(request.user)

# Создаем кандидата
result = huntflow_service.create_applicant_from_clickup_task(clickup_task)

if result['success']:
    print(f"Кандидат создан: {result['applicant_id']}")
else:
    print(f"Ошибка: {result['error']}")
```

### Обновление статуса кандидата

```python
# Обновляем статус с комментарием
result = huntflow_service.update_applicant_status(
    account_id=123,
    applicant_id=456,
    status_id=789,
    comment="Прошел техническое интервью",
    vacancy_id=101
)

if result:
    print("Статус обновлен успешно")
```

### Загрузка и парсинг файла резюме

```python
# Читаем файл
with open('resume.pdf', 'rb') as f:
    file_data = f.read()

# Загружаем и парсим
parsed_data = huntflow_service.upload_file(
    account_id=123,
    file_data=file_data,
    file_name='resume.pdf',
    parse_file=True
)

if parsed_data:
    print("Файл загружен и распарсен")
    # Создаем кандидата из распарсенных данных
    applicant = huntflow_service.create_applicant_from_parsed_data(
        account_id=123,
        parsed_data=parsed_data
    )
```

### Получение статистики логов

```python
from apps.huntflow.views_api import HuntflowLogViewSet

# Получаем статистику
viewset = HuntflowLogViewSet()
stats = viewset.stats(None)

print(f"Всего логов: {stats.data['total_logs']}")
print(f"Успешных: {stats.data['success_logs']}")
print(f"С ошибками: {stats.data['error_logs']}")
```

### Очистка кэша

```python
from apps.huntflow.models import HuntflowCache

# Очищаем весь кэш
HuntflowCache.objects.all().delete()
print("Кэш очищен")
```

## Обработка ошибок

### Типы ошибок
1. **Ошибки аутентификации** (401) - неверный API ключ
2. **Ошибки авторизации** (403) - нет доступа к ресурсу
3. **Ошибки валидации** (400) - некорректные данные
4. **Ошибки сети** - проблемы с подключением
5. **Ошибки парсинга** - проблемы с обработкой данных

### Логирование ошибок
Все ошибки автоматически логируются в `HuntflowLog` с типом 'ERROR' и содержат:
- Сообщение об ошибке
- Данные запроса
- Код ответа (если есть)
- Пользователя, выполнившего операцию

### Обработка в веб-интерфейсе
- Показ сообщений об ошибках пользователю
- Перенаправление на предыдущую страницу при критических ошибках
- Сохранение контекста для повторных попыток

## Производительность

### Кэширование
- Автоматическое кэширование часто запрашиваемых данных
- Настраиваемое время жизни кэша
- Очистка истекших записей

### Оптимизация запросов
- Пакетная обработка операций
- Минимизация количества API вызовов
- Использование параметров пагинации

### Мониторинг
- Статистика по логам
- Отслеживание производительности API
- Анализ ошибок и их причин
