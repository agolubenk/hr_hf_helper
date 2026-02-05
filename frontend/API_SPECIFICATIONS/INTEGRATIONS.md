# Integration Specifications

## Общее описание

Документ описывает интеграции HR Helper с внешними системами: Huntflow, Telegram, AI/LLM, Google Calendar. Правила синхронизации и приоритеты согласованы с [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (разд. 7); при расхождении приоритет у BUSINESS_LOGIC.

## 1. Huntflow Integration

### 1.1 Общее описание

**Назначение:** Синхронизация кандидатов, вакансий и этапов найма между HR Helper и Huntflow.

**Тип синхронизации:** Two-way sync (двусторонняя)

**Приоритет:** HR Helper является master системой (источником истины)

### 1.2 Эндпоинты Huntflow API

**Базовый URL:** `https://api.huntflow.ru/v2`

**Аутентификация:**
- Метод: API Key
- Заголовок: `Authorization: Bearer {api_key}`
- Хранение: В настройках компании (зашифровано)

**Основные эндпоинты:**

#### Кандидаты

```http
GET /accounts/{account_id}/applicants
POST /accounts/{account_id}/applicants
GET /accounts/{account_id}/applicants/{applicant_id}
PUT /accounts/{account_id}/applicants/{applicant_id}
```

#### Вакансии

```http
GET /accounts/{account_id}/vacancies
POST /accounts/{account_id}/vacancies
GET /accounts/{account_id}/vacancies/{vacancy_id}
PUT /accounts/{account_id}/vacancies/{vacancy_id}
```

#### Этапы найма

```http
GET /accounts/{account_id}/vacancies/{vacancy_id}/workflow
POST /accounts/{account_id}/vacancies/{vacancy_id}/workflow
```

### 1.3 Процесс синхронизации

#### Направление синхронизации

**HR Helper → Huntflow:**
- Создание/изменение кандидата
- Создание/изменение вакансии
- Изменение этапа кандидата
- Добавление комментариев

**Huntflow → HR Helper:**
- Изменения из Huntflow применяются в HR Helper **только если** запись в HR Helper не менялась после последней синхронизации (приоритет у HR Helper — см. обработка конфликтов ниже).
- Импорт существующих данных при первой настройке — отдельный сценарий.

#### Частота синхронизации

**Real-time (мгновенно):**
- Изменение этапа кандидата
- Создание/изменение оффера
- Критичные изменения статусов

**Scheduled (по расписанию):**
- Полная синхронизация: каждые 5 минут
- Проверка изменений: каждую минуту

#### Обработка конфликтов

**Стратегия:** HR Helper — master (источник истины). См. детали в [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md), разд. **7.1**.

**Правила:**
1. Если изменение в HR Helper новее или одновременное изменение в обеих системах → приоритет у HR Helper, обновить Huntflow.
2. Изменения из Huntflow применяются в HR Helper **только если** запись в HR Helper не менялась после последней синхронизации (по `updated_at` или версии).
3. При конфликте (одновременное изменение одной и той же сущности) → логировать событие, уведомить администратора, запись помечается для ручной сверки или повторной синхронизации.

**Пример обработки:**
```python
def sync_candidate(candidate_id):
    hh_candidate = get_candidate_from_hh(candidate_id)
    hf_candidate = get_candidate_from_huntflow(candidate_id)
    last_sync = get_last_sync_time(candidate_id)

    # Приоритет у HR Helper: если в HR Helper меняли после last_sync — выигрывает HR Helper
    if hh_candidate.updated_at > last_sync:
        update_huntflow_candidate(hh_candidate)
    elif hf_candidate.updated_at > last_sync and hh_candidate.updated_at <= last_sync:
        # В Huntflow изменили, в HR Helper не трогали — применяем из Huntflow
        update_hh_candidate(hf_candidate)
    else:
        log_conflict(candidate_id)
        notify_admin(candidate_id)
```

### 1.4 Обработка ошибок синхронизации

**Типы ошибок:**

1. **Сетевая ошибка:**
   - Retry с exponential backoff (3 попытки)
   - Если все попытки неудачны → добавить в очередь для повторной попытки

2. **Ошибка аутентификации:**
   - Уведомить администратора
   - Отключить синхронизацию до исправления

3. **Ошибка валидации:**
   - Логировать ошибку
   - Пропустить эту запись, продолжить синхронизацию остальных

**Очередь синхронизации:**

```sql
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'candidate', 'vacancy'
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
    direction VARCHAR(10) NOT NULL, -- 'to_huntflow', 'from_huntflow'
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);
```

### 1.5 Маппинг данных

**Важно:** Не все поля HR Helper и Huntflow имеют маппинг или покрыты спецификацией. Поля без маппинга **не синхронизируются**; сущности без описания в спецификации не участвуют в синхронизации. Полный перечень синхронизируемых сущностей и оговорки — в [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md), разд. **7.1** («Поля и сущности без синхронизации или без спецификации»).

**Кандидаты:**

| HR Helper | Huntflow | Примечание |
|-----------|----------|------------|
| `id` | `id` | Маппинг через `external_id` |
| `first_name` | `first_name` | Прямое соответствие |
| `last_name` | `last_name` | Прямое соответствие |
| `email` | `email` | Прямое соответствие |
| `phone` | `phone` | Прямое соответствие |
| `current_stage_id` | `status` | Маппинг через таблицу соответствий |
| `resume_url` | `photo` | Конвертация формата |

**Вакансии:**

| HR Helper | Huntflow | Примечание |
|-----------|----------|------------|
| `id` | `id` | Маппинг через `external_id` |
| `title` | `position` | Прямое соответствие |
| `description` | `body` | Прямое соответствие |
| `status` | `state` | Маппинг: active→opened, closed→closed |

## 2. Telegram Integration

### 2.1 Общее описание

**Назначение:** Интеграция с Telegram для уведомлений, 2FA и общения с кандидатами.

**Тип интеграции:** Webhook + Polling (fallback)

### 2.2 Получение входящих сообщений

#### Webhook (основной метод)

**URL:** `https://api.hrhelper.com/webhooks/telegram/{company_id}`

**Настройка webhook:**
```http
POST https://api.telegram.org/bot{token}/setWebhook
{
  "url": "https://api.hrhelper.com/webhooks/telegram/comp_123",
  "allowed_updates": ["message", "callback_query"]
}
```

**Формат входящего webhook:**
```json
{
  "update_id": 123456,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "username": "john_doe"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1640995200,
    "text": "Hello"
  }
}
```

**Обработка:**
1. Валидация подписи (если настроена)
2. Поиск чата в базе по `chat_id`
3. Сохранение сообщения в `telegram_messages`
4. Обработка команд (если есть)
5. Отправка ответа (если требуется)

#### Polling (fallback метод)

**Используется если:**
- Webhook недоступен
- Ошибка при получении webhook
- Ручной запуск синхронизации

**Процесс:**
```python
def poll_telegram_updates():
    last_update_id = get_last_update_id()
    
    updates = telegram_api.get_updates(
        offset=last_update_id + 1,
        timeout=30
    )
    
    for update in updates:
        process_update(update)
        last_update_id = update.update_id
    
    save_last_update_id(last_update_id)
```

**Частота:** Каждые 5 секунд (если webhook недоступен)

### 2.3 Обработка входящих команд

**Поддерживаемые команды:**

| Команда | Описание | Доступ |
|---------|----------|--------|
| `/start` | Начало работы с ботом | Все |
| `/help` | Справка по командам | Все |
| `/status` | Статус кандидатуры | Candidate |
| `/interview` | Информация об интервью | Candidate |
| `/offer` | Информация об оффере | Candidate |
| `/2fa` | Настройка 2FA | Все пользователи |

**Пример обработки:**

```python
def handle_command(message):
    command = message.text.split()[0]
    
    if command == '/start':
        return handle_start_command(message)
    elif command == '/status':
        return handle_status_command(message)
    # ...
```

### 2.4 Хранение истории сообщений

**Таблица:** `telegram_messages`

**Структура:**
- Все входящие сообщения сохраняются
- Все исходящие сообщения сохраняются
- Индексация по `chat_id` и `created_at`
- Период хранения: 1 год

**Оптимизация:**
- Старые сообщения (>1 года) архивируются
- Частые запросы к истории кэшируются

### 2.5 Поддержка медиа

**Типы медиа:**
- Фото (`photo`)
- Документы (`document`)
- Голосовые сообщения (`voice`)
- Видео (`video`)

**Обработка:**
1. Получение файла через Telegram API
2. Сохранение в `files` таблицу
3. Связывание с сообщением через `file_id`

**Ограничения:**
- Максимальный размер файла: 20 MB
- Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG

## 3. AI/LLM Integration

### 3.1 Провайдер

**Основной:** OpenAI GPT-4

**Резервный:** Anthropic Claude 3 (если OpenAI недоступен)

**Self-hosted:** Планируется поддержка локальных моделей

### 3.2 Конфигурация

```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "api_key": "sk-...",
  "fallback_provider": "anthropic",
  "fallback_model": "claude-3-opus-20240229",
  "max_tokens": 2000,
  "temperature": 0.7
}
```

### 3.3 Промпты

#### Скрининг резюме

```python
SCREENING_PROMPT = """
Ты - опытный HR специалист. Проанализируй резюме кандидата и вакансию.

Резюме:
{resume_text}

Требования вакансии:
{job_requirements}

Оцени:
1. Соответствие навыков (0-100)
2. Соответствие опыта (0-100)
3. Рекомендация (hire/maybe/reject)
4. Комментарий (2-3 предложения)

Верни ответ в формате JSON.
"""
```

#### Генерация описания вакансии

```python
VACANCY_DESCRIPTION_PROMPT = """
Создай описание вакансии на основе следующих данных:

Название: {title}
Отдел: {department}
Требования: {requirements}
Зарплата: {salary_range}

Создай профессиональное описание вакансии на русском языке.
"""
```

#### Генерация ответов кандидатам

```python
CANDIDATE_RESPONSE_PROMPT = """
Напиши вежливый ответ кандидату на основе контекста:

Контекст: {context}
Тип ответа: {response_type}  # 'interview_invitation', 'rejection', 'offer'

Тон: профессиональный, дружелюбный
Язык: русский
"""
```

### 3.4 Кэширование ответов

**Стратегия:** Кэширование по хешу промпта

**Реализация:**
```python
def get_cached_response(prompt_hash):
    cache_key = f"ai_response:{prompt_hash}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    return None

def cache_response(prompt_hash, response, ttl=3600):
    cache_key = f"ai_response:{prompt_hash}"
    redis.setex(cache_key, ttl, json.dumps(response))
```

**TTL:** 1 час для скрининга, 24 часа для описаний вакансий

### 3.5 Стоимость и лимиты

**Лимиты:**
- Максимум 1000 запросов в день на компанию
- Максимум 100 запросов в минуту на пользователя
- Максимальная длина промпта: 8000 токенов

**Стоимость (примерная):**
- GPT-4: $0.03 за 1K токенов (input), $0.06 за 1K токенов (output)
- Claude 3: $0.015 за 1K токенов (input), $0.075 за 1K токенов (output)

**Мониторинг:**
- Отслеживание использования токенов
- Уведомления при приближении к лимитам
- Автоматическое переключение на более дешевую модель при превышении бюджета

### 3.6 Fallback если AI недоступен

**Стратегия:**

1. **Попытка основного провайдера** (OpenAI)
2. **Если недоступен → попытка резервного** (Claude)
3. **Если оба недоступны:**
   - Для скрининга: ручная оценка рекрутером
   - Для генерации текста: использование шаблонов
   - Уведомление администратора

**Реализация:**
```python
def call_ai_with_fallback(prompt):
    try:
        return openai_client.complete(prompt)
    except OpenAIError:
        try:
            return anthropic_client.complete(prompt)
        except AnthropicError:
            log_error("Both AI providers unavailable")
            return get_fallback_response(prompt)
```

## 4. Интеграция с Google (включение Google-сервисов)

В приложении нет выбора режима или набора сервисов Google: выполняется **единственное действие — включение Google-сервисов**. Подключение всегда индивидуальное (у каждого пользователя своё).

**По определению включение даёт доступ к:**
- **Google Calendar** — просмотр, изменение и безвозвратное удаление всех календарей, с которыми пользователь может работать, а также предоставление доступа к ним
- **Google Drive** — просмотр, создание, изменение и удаление всех файлов на Google Диске
- **Google Sheets** — создание, просмотр, изменение и удаление таблиц Google
- **Личные данные** — просмотр личных данных, в том числе общедоступных; просмотр основного адреса электронной почты аккаунта Google; установление связи с личными данными в Google

(Объём прав соответствует экрану согласия OAuth при подключении.)

**Где включается:** страница профиля (вкладка «Интеграции и API», `/account/profile`) или поток авторизации Google. Отдельной страницы «настройка на `/company-settings/integrations` или `/google-oauth`» для выбора режима нет.

### 4.1 Синхронизация событий (календарь)

**Направление:** Two-way sync

**Синхронизируются:**
- События интервью
- Свободные слоты интервьюеров
- Автоматическое создание встреч

**Частота:**
- Real-time при создании/изменении интервью
- Каждые 2 минуты для проверки изменений в календаре

### 4.2 OAuth 2.0

**Процесс авторизации:**
1. Пользователь включает Google-сервисы (например, «Подключить Google» на вкладке «Интеграции и API»)
2. Перенаправление на Google OAuth с запросом всех необходимых областей доступа (календарь, Drive, Sheets, личные данные, email и т.д.)
3. Получение access token и refresh token
4. Сохранение токенов (зашифровано)
5. Использование токенов для API запросов (календарь, Drive, таблицы и др.)

**Области доступа (Scopes)** — в объёме экрана согласия Google, в т.ч. календарь, Drive, таблицы, личные данные, email, связь с личными данными. Отдельного «режима только календарь» в приложении нет.

## 5. Интеграции в профиле пользователя

На странице профиля (`/account/profile`, вкладка «Интеграции и API») пользователь настраивает персональные ключи и подключения для внешних сервисов. Эти настройки хранятся на уровне пользователя (не компании) и используются в приложении для операций от имени пользователя.

**Список интеграций в профиле:**

| Интеграция | Назначение | Типичные поля настроек |
|------------|------------|-------------------------|
| **Gemini AI** | AI-функции (чат, генерация текста) | API ключ |
| **Huntflow** | Синхронизация с Huntflow | Токен, выбор системы (песочница/продакшн) |
| **ClickUp** | Задачи и проекты | API ключ |
| **Notion** | Документация и базы знаний | API ключ |
| **Telegram** | Уведомления, 2FA, чат с кандидатами | Подключение бота |
| **Google** | Включение Google-сервисов (календарь, Drive, таблицы, личные данные, email — по определению один набор, без выбора режима; подключение у каждого пользователя своё) | OAuth |
| **hh.ru / rabota.by** | Публикация вакансий | API ключи |
| **OpenAI** | AI-функции (резервный провайдер) | API ключ |
| **Cloud AI** | Облачные AI-сервисы | Настройки подключения |
| **n8n** | Автоматизация (workflow) | URL, ключ доступа |

**API профиля для интеграций:**

- `GET /api/user/integrations/status` — статус всех интеграций пользователя (настроена/не настроена).
- `PUT /api/user/integrations/{name}` — сохранение настроек интеграции (ключи хранятся зашифрованно).
- `POST /api/user/integrations/{name}/test` — проверка подключения.

**Безопасность:**

- Ключи и токены хранятся зашифрованно; в ответах API не возвращаются сырые значения.
- Доступ к настройкам интеграций имеет только владелец профиля (RLS по `user_id`).

**Связь с другими документами:**

- Детальная логика страницы профиля, вкладок и API — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (раздел 10.26).
- Аутентификация и права доступа к профилю — [AUTHENTICATION_AUTHORIZATION.md](./AUTHENTICATION_AUTHORIZATION.md).

## Обновления (версия 1.1.0)

### Новые интеграционные требования:

**Workflow процессы:**
- Загрузка этапов найма с настройками встреч (`is_meeting`, `show_offices`, `show_interviewers`)
- API endpoint: `GET /api/company-settings/recruiting/stages/` должен возвращать этапы с полными настройками встреч
- Используется на страницах `/workflow` и `/recr-chat` для формирования динамических тогглеров
- Формат ответа должен включать:
  ```json
  {
    "id": "stage_123",
    "name": "Техническое интервью",
    "is_meeting": true,
    "show_offices": true,
    "show_interviewers": true,
    "color": "#3B82F6",
    "description": "..."
  }
  ```

**Команды рекрутинга:**
- API endpoints для управления командами должны поддерживать новые поля: `command_type`, `allow_any_layout`, обязательный `stage_id`
- Проверка уникальности команд с учетом раскладки клавиатуры
- Endpoints:
  - `GET /api/company-settings/recruiting/commands/` - список команд с полями `stage_id`, `command_type`, `allow_any_layout`
  - `POST /api/company-settings/recruiting/commands/` - создание команды (обязательный `stage_id`)
  - `PUT /api/company-settings/recruiting/commands/{id}/` - обновление команды
  - `DELETE /api/company-settings/recruiting/commands/{id}/` - удаление команды

**Настройки вакансии по странам:**
- API endpoints для управления настройками вакансии по странам:
  - `GET /api/vacancies/{id}/country-settings/` - получение всех настроек по странам
  - `GET /api/vacancies/{id}/country-settings/{country_code}/` - настройки для конкретной страны
  - `PUT /api/vacancies/{id}/country-settings/{country_code}/` - обновление настроек для страны
  - `GET /api/vacancies/{id}/office-settings/` - получение настроек "Вопросы и ссылки" по офисам
  - `PUT /api/vacancies/{id}/office-settings/{office_id}/` - обновление настроек для офиса
- Синхронизация активности: при изменении `is_active` в `vacancy_activity_by_country` автоматически обновляется активность полей в `vacancy_questions_by_office`

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
