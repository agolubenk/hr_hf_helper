# HR Helper Complete API Specification

## 📋 **Обзор**

Полная спецификация API системы HR Helper - комплексной платформы для управления HR процессами, включающей управление пользователями, финансами, вакансиями, интервьюерами, AI сервисы и интеграции с внешними системами.

**Версия:** 2.0.0  
**OpenAPI:** 3.0.3  
**Базовая ссылка:** `http://localhost:8000` (Development) / `https://api.hrhelper.com` (Production)

## 🔐 **Аутентификация**

Система поддерживает два типа аутентификации:
- **Session Authentication** - Стандартная Django сессия (Cookie)
- **Bearer Token Authentication** - JWT токены

## 📚 **API Endpoints**

### 🏥 **Common - Системные функции**

#### `GET /api/health/`
**Health Check** - Проверка состояния системы и всех сервисов

**Параметры:** Нет  
**Аутентификация:** Не требуется

**Ответ:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "cache": "healthy"
  }
}
```

---

### 🔐 **Authentication - Аутентификация**

#### `POST /api/auth/login/`
**Вход в систему** - Аутентификация пользователя

**Параметры:**
```json
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
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "Иван",
    "last_name": "Иванов"
  }
}
```

#### `POST /api/auth/logout/`
**Выход из системы** - Завершение сессии пользователя

**Ответ:**
```json
{
  "success": true,
  "message": "Выход выполнен успешно"
}
```

---

### 👥 **Users - Управление пользователями**

#### `GET /api/users/`
**Список пользователей** - Получение списка всех пользователей системы

**Параметры запроса:**
- `page` (integer, default: 1) - Номер страницы
- `search` (string) - Поиск по имени, email

**Ответ:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "first_name": "Иван",
      "last_name": "Иванов",
      "is_active": true,
      "date_joined": "2024-01-01T00:00:00Z",
      "groups": [
        {"id": 1, "name": "Рекрутер"}
      ]
    }
  ]
}
```

#### `POST /api/users/`
**Создание пользователя** - Создание нового пользователя в системе

**Параметры:**
```json
{
  "username": "newuser@example.com",
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Петр",
  "last_name": "Петров",
  "is_active": true
}
```

#### `GET /api/users/{id}/`
**Детали пользователя** - Получение информации о конкретном пользователе

#### `PUT /api/users/{id}/`
**Обновление пользователя** - Полное обновление информации о пользователе

#### `PATCH /api/users/{id}/`
**Частичное обновление пользователя** - Частичное обновление информации о пользователе

**Параметры:**
```json
{
  "first_name": "Петр",
  "last_name": "Петров",
  "huntflow_api_key": "hf_key_123",
  "gemini_api_key": "gemini_key_456"
}
```

---

### 💰 **Finance - Финансовая логика**

#### `GET /api/v1/finance/grades/`
**Список грейдов** - Получение списка всех грейдов в системе

**Параметры запроса:**
- `page` (integer, default: 1) - Номер страницы
- `is_active` (boolean) - Фильтр по активности

**Ответ:**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Junior",
      "description": "Начинающий специалист",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/finance/grades/`
**Создание грейда** - Создание нового грейда в системе

**Параметры:**
```json
{
  "name": "Senior+",
  "description": "Опытный старший специалист",
  "is_active": true
}
```

#### `GET /api/v1/finance/grades/{id}/`
**Детали грейда** - Получение информации о конкретном грейде

#### `PUT /api/v1/finance/grades/{id}/`
**Обновление грейда** - Полное обновление информации о грейде

#### `DELETE /api/v1/finance/grades/{id}/`
**Удаление грейда** - Удаление грейда из системы

#### `GET /api/v1/finance/currency-rates/`
**Список валютных курсов** - Получение актуальных валютных курсов

**Параметры запроса:**
- `currency` (string) - Фильтр по валюте
- `is_active` (boolean) - Фильтр по активности

**Ответ:**
```json
[
  {
    "id": 1,
    "currency": "USD",
    "rate": 3.25,
    "date": "2024-01-15",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 💼 **Vacancies - Управление вакансиями**

#### `GET /api/vacancies/`
**Список вакансий** - Получение списка вакансий с фильтрацией и пагинацией

**Параметры запроса:**
- `page` (integer, default: 1) - Номер страницы
- `page_size` (integer, default: 20) - Количество элементов на странице
- `search` (string) - Поиск по названию, ID, заголовкам
- `recruiter` (integer) - Фильтр по рекрутеру
- `is_active` (boolean) - Фильтр по активности

**Ответ:**
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/vacancies/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Python Developer",
      "external_id": "EXT001",
      "recruiter": 1,
      "recruiter_name": "Иван Иванов",
      "invite_title": "Приглашение на собеседование",
      "invite_text": "Приглашаем вас на собеседование",
      "scorecard_title": "Оценка кандидата",
      "scorecard_text": "Критерии оценки",
      "available_grades": [1, 2, 3],
      "available_grades_names": ["Junior", "Middle", "Senior"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/vacancies/`
**Создание вакансии** - Создание новой вакансии

**Параметры:**
```json
{
  "name": "Frontend Developer",
  "external_id": "EXT002",
  "recruiter": 1,
  "invite_title": "Приглашение на собеседование",
  "invite_text": "Приглашаем вас на собеседование",
  "scorecard_title": "Оценка кандидата",
  "scorecard_text": "Критерии оценки",
  "available_grades": [2, 3],
  "is_active": true
}
```

#### `GET /api/vacancies/{id}/`
**Детали вакансии** - Получение информации о конкретной вакансии

#### `PUT /api/vacancies/{id}/`
**Обновление вакансии** - Полное обновление информации о вакансии

#### `DELETE /api/vacancies/{id}/`
**Удаление вакансии** - Удаление вакансии из системы

#### `POST /api/vacancies/{id}/toggle-active/`
**Переключение активности вакансии** - Активация или деактивация вакансии

#### `POST /api/vacancies/{id}/assign-grades/`
**Назначение грейдов вакансии** - Назначение грейдов для вакансии

**Параметры:**
```json
{
  "grade_ids": [1, 2, 3]
}
```

#### `GET /api/vacancies/stats/`
**Статистика вакансий** - Получение статистики по вакансиям

**Ответ:**
```json
{
  "total_vacancies": 45,
  "active_vacancies": 38,
  "inactive_vacancies": 7,
  "vacancies_by_recruiter": {
    "1": 15,
    "2": 12,
    "3": 18
  },
  "vacancies_by_grade": {
    "Junior": 5,
    "Middle": 20,
    "Senior": 20
  },
  "recent_vacancies": [...]
}
```

---

### 👥 **Interviewers - Управление интервьюерами**

#### `GET /api/interviewers/`
**Список интервьюеров** - Получение списка интервьюеров с фильтрацией

**Параметры запроса:**
- `page` (integer, default: 1) - Номер страницы
- `search` (string) - Поиск по специализации
- `is_active` (boolean) - Фильтр по активности

**Ответ:**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 5,
      "user_name": "Мария Петрова",
      "specialization": "Python Development",
      "experience_years": 5,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/interviewers/`
**Создание интервьюера** - Создание нового интервьюера

**Параметры:**
```json
{
  "user": 5,
  "specialization": "Python Development",
  "experience_years": 5,
  "is_active": true
}
```

#### `GET /api/interviewers/{id}/`
**Детали интервьюера** - Получение информации о конкретном интервьюере

---

### 🔍 **Huntflow - HR интеграция**

#### `POST /api/huntflow/test-connection/`
**Тест соединения с Huntflow** - Проверка подключения к Huntflow API

**Ответ:**
```json
{
  "success": true,
  "message": "Подключение успешно",
  "accounts": [
    {
      "id": 123,
      "name": "IT Company"
    }
  ]
}
```

#### `GET /api/huntflow/accounts/`
**Список организаций Huntflow** - Получение списка организаций из Huntflow

**Ответ:**
```json
{
  "items": [
    {
      "id": 123,
      "name": "IT Company",
      "type": "company"
    }
  ]
}
```

#### `GET /api/huntflow/accounts/{account_id}/vacancies/`
**Вакансии организации** - Получение вакансий конкретной организации из Huntflow

**Ответ:**
```json
{
  "items": [
    {
      "id": 456,
      "position": "Python Developer",
      "state": "OPEN"
    }
  ]
}
```

---

### 🤖 **Gemini - AI сервисы**

#### `POST /api/gemini/chat/`
**AI чат с Gemini** - Отправка сообщения в AI чат Gemini

**Параметры:**
```json
{
  "message": "Расскажи о Python разработке",
  "session_id": 1
}
```

**Ответ:**
```json
{
  "success": true,
  "response": "Python - это высокоуровневый язык программирования...",
  "session_id": 1
}
```

#### `GET /api/gemini/sessions/`
**Список сессий чата** - Получение списка сессий AI чата

**Ответ:**
```json
[
  {
    "id": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "message_count": 5
  }
]
```

---

### 🔗 **Google OAuth - Google интеграция**

#### `GET /api/google-oauth/calendar/`
**События календаря Google** - Получение событий из Google Calendar

**Параметры запроса:**
- `start_date` (date) - Дата начала
- `end_date` (date) - Дата окончания

**Ответ:**
```json
[
  {
    "id": "event123",
    "summary": "Собеседование с кандидатом",
    "description": "Интервью на позицию Python Developer",
    "start": {
      "dateTime": "2024-01-20T14:00:00Z"
    },
    "end": {
      "dateTime": "2024-01-20T15:00:00Z"
    },
    "attendees": [
      {
        "email": "candidate@example.com",
        "displayName": "Кандидат"
      }
    ]
  }
]
```

#### `POST /api/google-oauth/sync/`
**Синхронизация с Google** - Запуск синхронизации данных с Google сервисами

**Ответ:**
```json
{
  "success": true,
  "message": "Синхронизация запущена"
}
```

---

### 📋 **ClickUp - Интеграция с ClickUp**

#### `GET /api/clickup/tasks/`
**Список задач ClickUp** - Получение списка задач из ClickUp

**Ответ:**
```json
[
  {
    "id": "task123",
    "name": "Провести интервью",
    "description": "Интервью с кандидатом на позицию Developer",
    "status": {
      "status": "in progress",
      "color": "#ff6b6b"
    },
    "assignees": [
      {
        "id": 1,
        "username": "recruiter1"
      }
    ],
    "date_created": "2024-01-15T10:00:00Z",
    "date_updated": "2024-01-15T11:00:00Z"
  }
]
```

#### `POST /api/clickup/sync/`
**Синхронизация с ClickUp** - Запуск синхронизации задач с ClickUp

---

### 📝 **Notion - Интеграция с Notion**

#### `GET /api/notion/pages/`
**Список страниц Notion** - Получение списка страниц из Notion

**Ответ:**
```json
[
  {
    "id": "page123",
    "title": "Описание вакансии Python Developer",
    "url": "https://notion.so/page123",
    "created_time": "2024-01-15T10:00:00Z",
    "last_edited_time": "2024-01-15T12:00:00Z",
    "properties": {}
  }
]
```

#### `POST /api/notion/sync/`
**Синхронизация с Notion** - Запуск синхронизации данных с Notion

---

### 💬 **Telegram - Telegram интеграция**

#### `GET /api/v1/telegram/chats/`
**Список Telegram чатов** - Получение списка Telegram чатов с фильтрацией

**Параметры запроса:**
- `search` (string) - Поиск по названию чата
- `chat_type` (string) - Тип чата
- `is_active` (boolean) - Фильтр по активности

#### `GET /api/v1/telegram/chats/{id}/`
**Детали Telegram чата** - Получение информации о конкретном чате

#### `GET /api/v1/telegram/messages/`
**Список сообщений Telegram** - Получение списка сообщений с фильтрацией

**Параметры запроса:**
- `chat` (integer) - ID чата
- `search` (string) - Поиск по тексту сообщения
- `message_type` (string) - Тип сообщения
- `date_from` (date) - Дата начала
- `date_to` (date) - Дата окончания

#### `GET /api/v1/telegram/messages/{id}/`
**Детали сообщения Telegram** - Получение детальной информации о сообщении

#### `POST /api/v1/telegram/send-message/`
**Отправка сообщения в Telegram** - Отправка сообщения в Telegram чат

**Параметры:**
```json
{
  "chat_id": "user123",
  "message": "Новый кандидат на рассмотрение",
  "parse_mode": "HTML",
  "reply_to_message_id": 123
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Сообщение отправлено",
  "message_id": 456
}
```

#### `POST /api/v1/telegram/sync/`
**Синхронизация Telegram** - Запуск синхронизации данных с Telegram

**Параметры:**
```json
{
  "sync_chats": true,
  "sync_messages": true,
  "days_back": 7
}
```

---

### 📋 **ClickUp - Интеграция с ClickUp**

#### `GET /api/v1/clickup-int/settings/`
**Настройки ClickUp** - Получение настроек интеграции ClickUp для пользователя

#### `POST /api/v1/clickup-int/settings/`
**Обновление настроек ClickUp** - Обновление настроек интеграции

#### `POST /api/v1/clickup-int/settings/test-connection/`
**Тест соединения ClickUp** - Проверка подключения к ClickUp API

#### `GET /api/v1/clickup-int/path-options/`
**Опции пути ClickUp** - Получение доступных команд для настройки пути

#### `GET /api/v1/clickup-int/spaces/`
**Пространства команды ClickUp** - Получение пространств для конкретной команды

**Параметры запроса:**
- `team_id` (string, required) - ID команды

#### `GET /api/v1/clickup-int/folders/`
**Папки пространства ClickUp** - Получение папок для конкретного пространства

**Параметры запроса:**
- `space_id` (string, required) - ID пространства

#### `GET /api/v1/clickup-int/lists/`
**Списки задач ClickUp** - Получение списков задач для папки или пространства

**Параметры запроса:**
- `folder_id` (string) - ID папки
- `space_id` (string) - ID пространства

#### `GET /api/v1/clickup-int/tasks/`
**Список задач ClickUp** - Получение кэшированных задач ClickUp с фильтрацией

**Параметры запроса:**
- `search` (string) - Поиск по названию задачи
- `status` (string) - Фильтр по статусу
- `priority` (string) - Фильтр по приоритету
- `sort` (string, default: "-date_updated") - Сортировка
- `page` (integer, default: 1) - Номер страницы

#### `GET /api/v1/clickup-int/tasks/{task_id}/`
**Детали задачи ClickUp** - Получение детальной информации о задаче

#### `POST /api/v1/clickup-int/tasks/{task_id}/transfer-to-huntflow/`
**Перенос задачи ClickUp в Huntflow** - Перенос данных задачи в Huntflow как кандидата

**Параметры:**
```json
{
  "account_id": 123,
  "vacancy_id": 456
}
```

#### `POST /api/v1/clickup-int/sync-tasks/`
**Синхронизация задач ClickUp** - Запуск синхронизации задач из настроенного списка

#### `POST /api/v1/clickup-int/clear-cache/`
**Очистка кэша ClickUp** - Очистка всех кэшированных задач ClickUp для пользователя

#### `GET /api/v1/clickup-int/bulk-import/`
**Список массовых импортов** - Получение списка операций массового импорта

#### `POST /api/v1/clickup-int/bulk-import/`
**Запуск массового импорта** - Запуск операции массового импорта задач ClickUp

**Параметры:**
```json
{
  "sync_settings": true,
  "delay_between_tasks": 8,
  "max_tasks": 100
}
```

#### `GET /api/v1/clickup-int/bulk-import/{id}/`
**Детали массового импорта** - Получение деталей операции массового импорта

#### `POST /api/v1/clickup-int/bulk-import/{id}/`
**Остановка массового импорта** - Остановка выполняющегося массового импорта

#### `GET /api/v1/clickup-int/bulk-import/{id}/progress/`
**Прогресс массового импорта** - Получение прогресса операции массового импорта

#### `POST /api/v1/clickup-int/bulk-import/{id}/retry-failed/`
**Повтор неудачных задач** - Повторный импорт неудачных задач из массового импорта

#### `GET /api/v1/clickup-int/sync-logs/`
**Логи синхронизации ClickUp** - Получение списка логов синхронизации с пагинацией

---

### 🔗 **Google OAuth - Google интеграция**

#### `GET /api/v1/google-oauth/oauth-accounts/`
**Список Google OAuth аккаунтов** - Получение списка Google OAuth аккаунтов с фильтрацией

**Параметры запроса:**
- `user` (integer) - ID пользователя
- `email` (string) - Email аккаунта
- `is_active` (boolean) - Фильтр по активности

#### `GET /api/v1/google-oauth/oauth-accounts/{id}/`
**Детали Google OAuth аккаунта** - Получение информации о Google OAuth аккаунте

#### `GET /api/v1/google-oauth/calendar-events/`
**События Google Calendar** - Получение событий Google Calendar с фильтрацией

**Параметры запроса:**
- `oauth_account` (integer) - ID OAuth аккаунта
- `start_date` (date) - Дата начала
- `end_date` (date) - Дата окончания
- `search` (string) - Поиск по названию события

#### `GET /api/v1/google-oauth/calendar-events/{id}/`
**Детали события Google Calendar** - Получение детальной информации о событии

#### `GET /api/v1/google-oauth/drive-files/`
**Файлы Google Drive** - Получение файлов Google Drive с фильтрацией

**Параметры запроса:**
- `oauth_account` (integer) - ID OAuth аккаунта
- `search` (string) - Поиск по названию файла
- `mime_type` (string) - MIME тип файла

#### `GET /api/v1/google-oauth/drive-files/{id}/`
**Детали файла Google Drive** - Получение детальной информации о файле

#### `POST /api/v1/google-oauth/sync/`
**Синхронизация Google сервисов** - Запуск синхронизации данных с Google сервисами

**Параметры:**
```json
{
  "sync_calendar": true,
  "sync_drive": false,
  "oauth_account_id": 123
}
```

---

### 📝 **Notion - Интеграция с Notion**

#### `GET /api/v1/notion-int/settings/`
**Настройки Notion** - Получение настроек интеграции Notion для пользователя

#### `POST /api/v1/notion-int/settings/`
**Обновление настроек Notion** - Обновление настроек интеграции

#### `POST /api/v1/notion-int/settings/test-connection/`
**Тест соединения Notion** - Проверка подключения к Notion API

#### `GET /api/v1/notion-int/pages/`
**Список страниц Notion** - Получение кэшированных страниц Notion с фильтрацией

**Параметры запроса:**
- `search` (string) - Поиск по названию страницы
- `parent_id` (string) - ID родительской страницы
- `sort` (string, default: "-last_edited_time") - Сортировка
- `page` (integer, default: 1) - Номер страницы

#### `GET /api/v1/notion-int/pages/{id}/`
**Детали страницы Notion** - Получение детальной информации о странице Notion

#### `POST /api/v1/notion-int/pages/{id}/transfer-to-huntflow/`
**Перенос страницы Notion в Huntflow** - Перенос данных страницы Notion в Huntflow как кандидата

**Параметры:**
```json
{
  "account_id": 123,
  "vacancy_id": 456
}
```

#### `POST /api/v1/notion-int/sync-pages/`
**Синхронизация страниц Notion** - Запуск синхронизации страниц из настроенной базы данных

#### `POST /api/v1/notion-int/clear-cache/`
**Очистка кэша Notion** - Очистка всех кэшированных страниц Notion для пользователя

#### `GET /api/v1/notion-int/bulk-import/`
**Список массовых импортов Notion** - Получение списка операций массового импорта страниц

#### `POST /api/v1/notion-int/bulk-import/`
**Запуск массового импорта Notion** - Запуск операции массового импорта страниц Notion

**Параметры:**
```json
{
  "sync_settings": true,
  "delay_between_pages": 5,
  "max_pages": 100
}
```

#### `GET /api/v1/notion-int/sync-logs/`
**Логи синхронизации Notion** - Получение списка логов синхронизации с пагинацией

---

## 📊 **Модели данных**

### User (Пользователь)
```json
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "Иван",
  "last_name": "Иванов",
  "is_active": true,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:00:00Z",
  "huntflow_api_key": "hf_key_123",
  "huntflow_prod_url": "https://prod.huntflow.ru",
  "huntflow_sandbox_url": "https://sandbox.huntflow.ru",
  "gemini_api_key": "gemini_key_456",
  "clickup_api_key": "clickup_key_789",
  "notion_integration_token": "notion_token_abc",
  "groups": [
    {"id": 1, "name": "Рекрутер"}
  ]
}
```

### Grade (Грейд)
```json
{
  "id": 1,
  "name": "Senior",
  "description": "Опытный специалист",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Vacancy (Вакансия)
```json
{
  "id": 1,
  "name": "Python Developer",
  "external_id": "EXT001",
  "recruiter": 1,
  "recruiter_name": "Иван Иванов",
  "invite_title": "Приглашение на собеседование",
  "invite_text": "Приглашаем вас на собеседование",
  "scorecard_title": "Оценка кандидата",
  "scorecard_text": "Критерии оценки",
  "available_grades": [1, 2, 3],
  "available_grades_names": ["Junior", "Middle", "Senior"],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Interviewer (Интервьюер)
```json
{
  "id": 1,
  "user": 5,
  "user_name": "Мария Петрова",
  "specialization": "Python Development",
  "experience_years": 5,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GoogleOAuthAccount (Google OAuth аккаунт)
```json
{
  "id": 1,
  "user": 1,
  "email": "user@gmail.com",
  "access_token": "access_token_123",
  "refresh_token": "refresh_token_123",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### TelegramUser (Telegram пользователь)
```json
{
  "id": 1,
  "user": 1,
  "telegram_id": "123456789",
  "username": "hr_manager_tg",
  "first_name": "Иван",
  "last_name": "Иванов",
  "is_active": true
}
```

### TelegramChat (Telegram чат)
```json
{
  "id": 1,
  "chat_id": "chat_123",
  "title": "HR Notifications",
  "chat_type": "group",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### TelegramMessage (Telegram сообщение)
```json
{
  "id": 1,
  "chat": 1,
  "message_id": "msg_456",
  "text": "Новый кандидат на рассмотрение",
  "message_type": "text",
  "date": "2024-01-01T00:00:00Z"
}
```

### ChatSession (Сессия чата)
```json
{
  "id": 1,
  "user": 1,
  "title": "Анализ резюме",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### ChatMessage (Сообщение чата)
```json
{
  "id": 1,
  "session": 1,
  "role": "user",
  "content": "Проанализируй это резюме",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### ClickUpTask (Задача ClickUp)
```json
{
  "id": 1,
  "user": 1,
  "task_id": "clickup_task_123",
  "name": "Найти Python разработчика",
  "description": "Поиск кандидата на позицию Python Developer",
  "status": "open",
  "priority": "high",
  "date_created": "2024-01-01T00:00:00Z",
  "date_updated": "2024-01-01T00:00:00Z"
}
```

### NotionPage (Страница Notion)
```json
{
  "id": 1,
  "user": 1,
  "page_id": "notion_page_456",
  "title": "Кандидат: Анна Петрова",
  "content": "Резюме и контактная информация",
  "parent_id": "notion_parent_789",
  "last_edited_time": "2024-01-01T00:00:00Z"
}
```

---

## 🔒 **Коды ошибок**

### HTTP Status Codes
- `200` - OK - Успешный запрос
- `201` - Created - Ресурс создан
- `204` - No Content - Ресурс удален
- `400` - Bad Request - Ошибка валидации
- `401` - Unauthorized - Не авторизован
- `403` - Forbidden - Доступ запрещен
- `404` - Not Found - Ресурс не найден
- `500` - Internal Server Error - Внутренняя ошибка сервера
- `503` - Service Unavailable - Сервис недоступен

### Формат ошибок
```json
{
  "error": "ValidationError",
  "message": "Ошибка валидации данных",
  "details": {
    "field_name": ["Это поле обязательно для заполнения"]
  }
}
```

---

## 📝 **Примеры использования**

### Получение списка активных вакансий с поиском
```bash
GET /api/vacancies/?search=Python&is_active=true&page=1&page_size=10
```

### Создание новой вакансии с назначением грейдов
```bash
POST /api/vacancies/
Content-Type: application/json

{
  "name": "Senior Python Developer",
  "external_id": "EXT003",
  "recruiter": 1,
  "invite_title": "Приглашение на собеседование",
  "invite_text": "Приглашаем вас на собеседование на позицию Senior Python Developer",
  "scorecard_title": "Оценка Senior кандидата",
  "scorecard_text": "Критерии оценки для Senior позиции",
  "available_grades": [3, 4],
  "is_active": true
}
```

### Получение статистики по вакансиям
```bash
GET /api/vacancies/stats/
```

### Отправка сообщения в AI чат
```bash
POST /api/gemini/chat/
Content-Type: application/json

{
  "message": "Помоги составить вопросы для собеседования Python разработчика",
  "session_id": 1
}
```

---

## 🔧 **Настройка и развертывание**

### Переменные окружения
```bash
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/hrhelper

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0

# Секретный ключ Django
SECRET_KEY=your-secret-key-here

# Настройки внешних API
HUNTFLOW_API_URL=https://api.huntflow.ru/v2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Установка и запуск
```bash
# Установка зависимостей
pip install -r requirements.txt

# Применение миграций
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver 0.0.0.0:8000

# Запуск Celery worker
celery -A config worker -l info

# Запуск Celery beat
celery -A config beat -l info
```

---

## 📈 **Мониторинг и логирование**

### Health Check
Система предоставляет endpoint `/api/health/` для мониторинга состояния всех компонентов.

### Логирование
Все API запросы логируются с указанием:
- Времени запроса
- Пользователя
- Endpoint
- Статуса ответа
- Времени выполнения

### Метрики
- Количество запросов по endpoint
- Время ответа API
- Количество ошибок
- Активность пользователей

---

## 🔄 **Версионирование API**

Текущая версия: **2.0.0**

### Политика версионирования
- **Major** (X.0.0) - Breaking changes
- **Minor** (X.Y.0) - Новые функции, обратно совместимые
- **Patch** (X.Y.Z) - Исправления ошибок

### Поддержка версий
- Версия 2.0.0 - Текущая (поддерживается)
- Версия 1.x.x - Deprecated (поддержка до 2025-01-01)

---

## 📞 **Поддержка**

**Email:** support@hrhelper.com  
**Документация:** https://docs.hrhelper.com  
**GitHub:** https://github.com/hrhelper/api

---

*Документация обновлена: 2024-01-15*  
*Версия API: 2.0.0*
