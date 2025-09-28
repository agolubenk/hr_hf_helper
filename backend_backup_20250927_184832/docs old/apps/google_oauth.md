# Google OAuth App Documentation

## Обзор

Приложение `google_oauth` является критически важным компонентом системы HR Helper, обеспечивающим интеграцию с Google сервисами через OAuth2. Это приложение служит основой для работы с Google Calendar, Google Drive, Google Sheets и другими сервисами Google.

## Основные функции

- **OAuth2 авторизация** с Google аккаунтами
- **Интеграция с Google Calendar** для управления событиями и календарем
- **Интеграция с Google Drive** для работы с файлами и папками
- **Интеграция с Google Sheets** для работы с таблицами
- **Кэширование API данных** в Redis для оптимизации производительности
- **Автоматизация HR процессов** через создание инвайтов и scorecard
- **AI-интеграция** с Gemini для анализа времени и HR-скрининга
- **Управление настройками** структуры папок и слотов времени

## Модели данных

### GoogleOAuthAccount (OAuth аккаунт Google)
Основная модель для хранения OAuth данных пользователей.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (OneToOneField)
- `google_id` - Google ID пользователя (CharField, max_length=100, unique=True)
- `email` - Email Google аккаунта (EmailField)
- `name` - Имя пользователя (CharField, max_length=200)
- `picture_url` - URL фото профиля (URLField, blank=True, null=True)
- `access_token` - Токен доступа (TextField)
- `refresh_token` - Токен обновления (TextField, blank=True, null=True)
- `token_expires_at` - Время истечения токена (DateTimeField)
- `scopes` - Разрешения API (JSONField, default=list)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)
- `last_sync_at` - Время последней синхронизации (DateTimeField, blank=True, null=True)

**Методы:**
- `is_token_valid()` - Проверяет действительность токена
- `needs_refresh()` - Проверяет необходимость обновления токена
- `has_scope(scope)` - Проверяет наличие разрешения
- `get_available_services()` - Возвращает список доступных сервисов

### SyncSettings (Настройки синхронизации)
Модель для управления настройками автоматической синхронизации.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (OneToOneField)
- `auto_sync_calendar` - Автосинхронизация календаря (BooleanField, default=True)
- `auto_sync_drive` - Автосинхронизация Drive (BooleanField, default=True)
- `sync_interval` - Интервал синхронизации в минутах (IntegerField, default=60)
- `max_events` - Максимум событий для синхронизации (IntegerField, default=100)
- `max_files` - Максимум файлов для синхронизации (IntegerField, default=100)

### Invite (Инвайт на интервью)
Модель для создания и управления инвайтами на интервью с автоматизацией HR процессов.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (ForeignKey)
- `candidate_url` - Ссылка на кандидата в Huntflow (URLField)
- `candidate_name` - Имя кандидата (CharField, max_length=200, blank=True)
- `candidate_email` - Email кандидата (EmailField, blank=True)
- `vacancy_title` - Название вакансии (CharField, max_length=200, blank=True)
- `interview_datetime` - Дата и время интервью (DateTimeField)
- `status` - Статус инвайта (CharField, choices=STATUS_CHOICES, default='pending')
- `google_drive_folder_id` - ID папки в Google Drive (CharField, max_length=200, blank=True)
- `google_drive_file_id` - ID файла scorecard в Google Drive (CharField, max_length=200, blank=True)
- `google_drive_file_url` - URL файла scorecard (URLField, blank=True)
- `calendar_event_id` - ID события в Google Calendar (CharField, max_length=200, blank=True)
- `calendar_event_url` - URL события в Google Calendar (URLField, blank=True)
- `google_meet_url` - URL Google Meet (URLField, blank=True)
- `gemini_suggested_datetime` - Предложенное Gemini время (DateTimeField, blank=True, null=True)
- `gemini_analysis` - Анализ от Gemini (TextField, blank=True)
- `original_form_data` - Исходные данные формы (JSONField, blank=True, null=True)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)

**Методы:**
- `get_invitation_text()` - Генерирует текст приглашения
- `create_google_drive_structure()` - Создает структуру папок в Google Drive
- `process_scorecard()` - Обрабатывает scorecard
- `create_calendar_event()` - Создает событие в календаре
- `delete_calendar_event()` - Удаляет событие из календаря
- `analyze_time_with_gemini()` - Анализирует время с помощью Gemini

### HRScreening (HR-скрининг)
Модель для проведения HR-скрининга с использованием AI.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (ForeignKey)
- `candidate_name` - Имя кандидата (CharField, max_length=200)
- `candidate_email` - Email кандидата (EmailField, blank=True)
- `position` - Позиция (CharField, max_length=200)
- `screening_questions` - Вопросы скрининга (TextField)
- `candidate_responses` - Ответы кандидата (TextField)
- `gemini_analysis` - Анализ от Gemini (TextField, blank=True)
- `gemini_score` - Оценка от Gemini (DecimalField, max_digits=3, decimal_places=2, blank=True, null=True)
- `gemini_recommendation` - Рекомендация от Gemini (TextField, blank=True)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)

**Методы:**
- `analyze_with_gemini()` - Анализирует скрининг с помощью Gemini
- `get_parsed_analysis()` - Парсит анализ от Gemini

### ScorecardPathSettings (Настройки структуры папок)
Модель для настройки структуры папок в Google Drive для scorecard.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (OneToOneField)
- `folder_structure` - Структура папок (JSONField, default=list)

**Методы:**
- `get_default_structure()` - Возвращает структуру по умолчанию
- `get_available_patterns()` - Возвращает доступные паттерны
- `generate_path_preview()` - Генерирует предварительный просмотр пути

### SlotsSettings (Настройки слотов)
Модель для настройки отображения слотов времени.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (OneToOneField)
- `current_week_prefix` - Префикс для текущей недели (CharField, max_length=50, default='Эта неделя')
- `next_week_prefix` - Префикс для следующей недели (CharField, max_length=50, default='Следующая неделя')
- `all_slots_prefix` - Префикс для всех слотов (CharField, max_length=50, default='Все слоты')
- `separator_text` - Текст разделителя (CharField, max_length=20, default='---')

**Методы:**
- `to_dict()` - Возвращает настройки в виде словаря

### QuestionTemplate (Шаблоны вопросов)
Модель для хранения шаблонов вопросов HR-скрининга.

**Поля:**
- `id` - Уникальный идентификатор
- `name` - Название шаблона (CharField, max_length=200)
- `description` - Описание шаблона (TextField, blank=True)
- `questions` - Вопросы (JSONField)
- `is_active` - Активен ли шаблон (BooleanField, default=True)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)

## Сервисы

### GoogleOAuthService
Основной сервис для работы с Google OAuth2.

**Методы:**
- `get_oauth_account()` - Получить OAuth аккаунт пользователя
- `create_oauth_flow()` - Создать OAuth flow для авторизации
- `get_authorization_url()` - Получить URL для авторизации
- `handle_callback(authorization_response, state)` - Обработать callback от Google OAuth
- `get_credentials()` - Получить действительные credentials
- `_refresh_token(oauth_account)` - Обновить токен доступа
- `revoke_access()` - Отозвать доступ к Google аккаунту

### GoogleCalendarService
Сервис для работы с Google Calendar API.

**Методы:**
- `get_calendars()` - Получить список календарей
- `get_calendar_public_link(calendar_id)` - Получить публичную ссылку на календарь
- `get_calendar_by_email(email)` - Найти календарь по email адресу
- `get_events(calendar_id, max_results, days_ahead)` - Получить события календаря
- `create_event(title, start_time, end_time, description, location, attendees, calendar_id)` - Создать событие
- `delete_event(event_id, calendar_id)` - Удалить событие
- `sync_events(oauth_account, days_ahead)` - Синхронизировать события календаря

### GoogleDriveService
Сервис для работы с Google Drive API.

**Методы:**
- `get_files(max_results)` - Получить список файлов
- `sync_files(oauth_account)` - Синхронизировать файлы Google Drive
- `create_folder_structure(folder_path)` - Создать структуру папок
- `copy_file(file_id, new_name, parent_folder_id)` - Копировать файл

### GoogleSheetsService
Сервис для работы с Google Sheets API.

**Методы:**
- `get_spreadsheets(max_results)` - Получить список таблиц
- `sync_spreadsheets(oauth_account)` - Синхронизировать Google Sheets
- `get_sheets(spreadsheet_id)` - Получить список листов в таблице
- `delete_sheet(spreadsheet_id, sheet_id)` - Удалить лист из таблицы

### GoogleAPICache
Сервис для кэширования данных Google API в Redis.

**Методы:**
- `get_calendar_events(user_id, calendar_id, days_ahead)` - Получить события календаря из кэша
- `set_calendar_events(user_id, events, calendar_id, days_ahead)` - Сохранить события календаря в кэш
- `get_drive_files(user_id, max_results)` - Получить файлы Drive из кэша
- `set_drive_files(user_id, files, max_results)` - Сохранить файлы Drive в кэш
- `get_sheets(user_id, max_results)` - Получить таблицы из кэша
- `set_sheets(user_id, sheets, max_results)` - Сохранить таблицы в кэш
- `invalidate_user_cache(user_id)` - Инвалидировать кэш пользователя
- `clear_all_cache()` - Очистить весь кэш

## API Endpoints

### OAuth и авторизация
- `GET /oauth/start/` - Начало OAuth процесса
- `GET /oauth/callback/` - Callback от Google OAuth
- `POST /disconnect/` - Отключить Google аккаунт

### Календарь и Drive
- `GET /calendar/` - Просмотр событий календаря
- `GET /drive/` - Просмотр файлов Google Drive
- `POST /sync/calendar/` - Синхронизация календаря
- `POST /sync/drive/` - Синхронизация Google Drive

### Инвайты и автоматизация
- `GET /invites/` - Дашборд инвайтов
- `GET /invites/list/` - Список всех инвайтов
- `GET /invites/create/` - Создание нового инвайта
- `GET /invites/create/combined/` - Создание инвайта (объединенная форма)
- `GET /invites/<id>/` - Детальная информация об инвайте
- `POST /invites/<id>/edit/` - Обновление инвайта
- `POST /invites/<id>/delete/` - Удаление инвайта
- `POST /invites/<id>/regenerate-scorecard/` - Пересоздание scorecard
- `POST /invites/<id>/invitation-text/` - Получение текста приглашения
- `POST /invites/<id>/gemini-time-analysis/` - Анализ времени от Gemini

### Настройки
- `GET /invites/settings/` - Настройки структуры папок для scorecard
- `POST /api/scorecard-path-settings/` - API для сохранения настроек структуры папок
- `GET /api/slots-settings/` - Получение настроек слотов
- `POST /api/slots-settings/` - Сохранение настроек слотов

### HR-скрининг
- `GET /hr-screening/` - Список HR-скринингов
- `GET /hr-screening/create/` - Создание нового HR-скрининга
- `GET /hr-screening/<id>/` - Детали HR-скрининга
- `POST /hr-screening/<id>/delete/` - Удаление HR-скрининга
- `POST /hr-screening/<id>/retry-analysis/` - Повторный анализ с помощью Gemini

### G-данные и автоматизация
- `GET /gdata-automation/` - Страница G-данных и автоматизации
- `GET /api/calendar-events/` - API для получения событий календаря в JSON формате

### API endpoints
- `GET /api/event/<event_id>/` - Получение детальной информации о событии календаря
- `POST /api/meetings-count/` - Получение количества встреч для указанных дат из Redis кэша
- `GET /debug/cache/` - Отладочный endpoint для проверки кэша

## Формы

### SyncSettingsForm
Форма для настройки автоматической синхронизации.

**Поля:**
- `auto_sync_calendar` - Автоматическая синхронизация календаря (CheckboxInput)
- `auto_sync_drive` - Автоматическая синхронизация Drive (CheckboxInput)
- `sync_interval` - Интервал синхронизации (Select)
- `max_events` - Максимум событий (NumberInput)
- `max_files` - Максимум файлов (NumberInput)

### InviteForm
Форма для создания инвайта на интервью.

**Поля:**
- `candidate_url` - Ссылка на кандидата в Huntflow (URLInput)
- `interview_datetime` - Дата и время интервью (DateTimeInput)

**Валидация:**
- URL должен содержать `/vacancy/` и быть ссылкой на кандидата из Huntflow
- Дата интервью не может быть в прошлом

### InviteCombinedForm
Объединенная форма для создания инвайта с расширенными полями.

**Поля:**
- `candidate_url` - Ссылка на кандидата в Huntflow
- `candidate_name` - Имя кандидата
- `candidate_email` - Email кандидата
- `vacancy_title` - Название вакансии
- `interview_datetime` - Дата и время интервью

### HRScreeningForm
Форма для создания HR-скрининга.

**Поля:**
- `candidate_name` - Имя кандидата
- `candidate_email` - Email кандидата
- `position` - Позиция
- `screening_questions` - Вопросы скрининга
- `candidate_responses` - Ответы кандидата

### CalendarEventSearchForm
Форма для поиска событий календаря.

**Поля:**
- `search` - Поисковый запрос
- `date_from` - Дата начала
- `date_to` - Дата окончания

### DriveFileSearchForm
Форма для поиска файлов Google Drive.

**Поля:**
- `search` - Поисковый запрос
- `is_shared` - Фильтр по общему доступу
- `shared_with_me` - Фильтр по "поделились со мной"

## Management Commands

### cache_stats
Показать статистику кэша API данных.

**Использование:**
```bash
python manage.py cache_stats
```

### clear_cache
Очистить кэш API данных.

**Использование:**
```bash
python manage.py clear_cache
```

### test_cache
Тестирование функций кэширования.

**Использование:**
```bash
python manage.py test_cache
```

### test_views
Тестирование представлений Google OAuth.

**Использование:**
```bash
python manage.py test_views
```

## Интеграции

### С приложением accounts
- Использует модель `User` для связи OAuth аккаунтов с пользователями системы
- Автоматическое создание пользователей при OAuth авторизации

### С приложением huntflow
- Парсинг URL кандидатов из Huntflow для создания инвайтов
- Интеграция данных кандидатов и вакансий

### С приложением gemini
- AI-анализ времени для инвайтов
- AI-анализ HR-скринингов
- Генерация рекомендаций и оценок

### С приложением vacancies
- Использование данных вакансий для создания структуры папок
- Интеграция с процессами найма

### С приложением interviewers
- Создание событий календаря для интервьюеров
- Управление расписанием интервьюеров

## Настройки

### Обязательные настройки в settings.py
```python
# Google OAuth2 настройки
GOOGLE_OAUTH2_CLIENT_ID = 'your-client-id'
GOOGLE_OAUTH2_CLIENT_SECRET = 'your-client-secret'
GOOGLE_OAUTH_REDIRECT_URI = 'http://127.0.0.1:8000/google-oauth/oauth/callback/'
GOOGLE_OAUTH_REDIRECT_URIS = [
    'http://127.0.0.1:8000/google-oauth/oauth/callback/',
    'http://localhost:8000/google-oauth/oauth/callback/',
]

# Настройки кэширования API
API_CACHE_TIMEOUT = {
    'calendar': 300,  # 5 минут
    'drive': 600,     # 10 минут
    'sheets': 600,    # 10 минут
}
```

### Scopes (разрешения)
```python
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
]
```

## Примеры использования

### Создание инвайта на интервью
```python
from apps.google_oauth.models import Invite
from apps.google_oauth.services import GoogleOAuthService

# Получаем OAuth сервис
oauth_service = GoogleOAuthService(user)
oauth_account = oauth_service.get_oauth_account()

if oauth_account and oauth_account.is_token_valid():
    # Создаем инвайт
    invite = Invite.objects.create(
        user=user,
        candidate_url='https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789',
        interview_datetime=datetime(2024, 1, 15, 14, 0)
    )
    
    # Создаем структуру в Google Drive
    success, message = invite.create_google_drive_structure()
    
    # Обрабатываем scorecard
    success, message = invite.process_scorecard()
    
    # Создаем событие в календаре
    success, message = invite.create_calendar_event()
```

### Получение событий календаря
```python
from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService

# Получаем OAuth сервис
oauth_service = GoogleOAuthService(user)
oauth_account = oauth_service.get_oauth_account()

if oauth_account:
    # Получаем сервис календаря
    calendar_service = GoogleCalendarService(oauth_service)
    
    # Получаем события (данные берутся из кэша)
    events = calendar_service.get_events(days_ahead=30)
    
    for event in events:
        print(f"Событие: {event['summary']}")
        print(f"Время: {event['start']['dateTime']}")
```

### Создание события в календаре
```python
from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
from datetime import datetime, timedelta

# Получаем OAuth сервис
oauth_service = GoogleOAuthService(user)
calendar_service = GoogleCalendarService(oauth_service)

# Создаем событие
start_time = datetime(2024, 1, 15, 14, 0)
end_time = start_time + timedelta(hours=1)

event = calendar_service.create_event(
    title='Интервью с кандидатом',
    start_time=start_time,
    end_time=end_time,
    description='Техническое интервью',
    location='Офис',
    attendees=['candidate@example.com'],
    calendar_id='primary'
)
```

### HR-скрининг с AI
```python
from apps.google_oauth.models import HRScreening

# Создаем HR-скрининг
screening = HRScreening.objects.create(
    user=user,
    candidate_name='Иван Иванов',
    candidate_email='ivan@example.com',
    position='Python Developer',
    screening_questions='Опыт работы с Python?',
    candidate_responses='3 года опыта работы с Python, Django, FastAPI'
)

# Анализируем с помощью Gemini
success, message = screening.analyze_with_gemini()

if success:
    print(f"Оценка: {screening.gemini_score}")
    print(f"Рекомендация: {screening.gemini_recommendation}")
```

## Обработка ошибок

### OAuth ошибки
- Неверный state в callback
- Истекший токен доступа
- Отсутствие refresh token
- Ошибки авторизации Google

### API ошибки
- Превышение лимитов API
- Ошибки доступа к ресурсам
- Проблемы с кэшированием
- Ошибки синхронизации

### Обработка ошибок в коде
```python
try:
    # OAuth операции
    oauth_service = GoogleOAuthService(user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account:
        raise Exception('Google аккаунт не подключен')
    
    if not oauth_account.is_token_valid():
        raise Exception('Токен Google истек')
    
except Exception as e:
    print(f"Ошибка Google OAuth: {e}")
    # Обработка ошибки
```

## Безопасность

### OAuth безопасность
- Использование state параметра для защиты от CSRF
- Безопасное хранение токенов в базе данных
- Автоматическое обновление токенов
- Отзыв доступа при необходимости

### API безопасность
- Кэширование данных для снижения нагрузки на API
- Обработка ошибок и исключений
- Валидация входных данных
- Логирование операций

## Производительность

### Кэширование
- Redis кэш для API данных
- Настраиваемые таймауты кэша
- Инвалидация кэша при изменениях
- Статистика использования кэша

### Оптимизация API
- Батчинг запросов где возможно
- Использование полей (fields) для минимизации данных
- Пагинация для больших наборов данных
- Асинхронная обработка где применимо

## Мониторинг и логирование

### Логирование
- Логирование OAuth операций
- Логирование API запросов
- Логирование ошибок синхронизации
- Отладочная информация

### Мониторинг
- Статистика использования кэша
- Мониторинг токенов OAuth
- Отслеживание ошибок API
- Метрики производительности

## Заключение

Приложение `google_oauth` является центральным компонентом системы HR Helper, обеспечивающим интеграцию с Google экосистемой. Оно предоставляет мощные возможности для автоматизации HR процессов, управления календарем, работы с документами и проведения AI-анализа. Архитектура приложения построена на принципах модульности, безопасности и производительности, что делает его надежным и масштабируемым решением для HR автоматизации.
