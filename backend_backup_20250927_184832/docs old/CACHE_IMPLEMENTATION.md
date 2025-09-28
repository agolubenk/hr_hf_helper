# Кэширование API данных в Redis

## Обзор

В приложении `@google_oauth/` реализовано кэширование всех API данных в Redis. Это значительно улучшает производительность и снижает нагрузку на внешние API.

## Архитектура

### 1. Redis как кэш-хранилище
- **Локальный Redis**: `redis://127.0.0.1:6379/1`
- **Таймауты кэша**:
  - Google Calendar Events: 5 минут
  - Google Drive Files: 10 минут
  - Google Sheets: 10 минут
  - Huntflow Candidates: 30 минут
  - Huntflow Vacancies: 1 час
  - Huntflow Accounts: 2 часа

### 2. Сервисы кэширования

#### `CacheService` - базовый сервис
```python
# Получить данные из кэша
data = CacheService.get_cached_data('google_calendar_events', user_id, calendar_id='primary')

# Сохранить данные в кэш
CacheService.set_cached_data('google_calendar_events', user_id, events_data, calendar_id='primary')

# Инвалидировать кэш
CacheService.invalidate_cache('google_calendar_events', user_id)
```

#### `GoogleAPICache` - специализированный кэш для Google API
```python
# События календаря
events = GoogleAPICache.get_calendar_events(user_id, calendar_id='primary', days_ahead=100)
GoogleAPICache.set_calendar_events(user_id, events, calendar_id='primary', days_ahead=100)

# Файлы Drive
files = GoogleAPICache.get_drive_files(user_id, max_results=100)
GoogleAPICache.set_drive_files(user_id, files, max_results=100)

# Таблицы
sheets = GoogleAPICache.get_sheets(user_id, max_results=100)
GoogleAPICache.set_sheets(user_id, sheets, max_results=100)
```

#### `HuntflowAPICache` - специализированный кэш для Huntflow API
```python
# Кандидаты
candidate = HuntflowAPICache.get_candidate(user_id, account_id, candidate_id)
HuntflowAPICache.set_candidate(user_id, candidate_data, account_id, candidate_id)

# Вакансии
vacancy = HuntflowAPICache.get_vacancy(user_id, account_id, vacancy_id)
HuntflowAPICache.set_vacancy(user_id, vacancy_data, account_id, vacancy_id)

# Аккаунты
accounts = HuntflowAPICache.get_accounts(user_id)
HuntflowAPICache.set_accounts(user_id, accounts_data)
```

## Изменения в коде

### 1. Удаленные модели
Следующие модели больше не используются для хранения API данных:
- `GoogleCalendarEvent`
- `GoogleDriveFile` 
- `GoogleSheet`

### 2. Обновленные сервисы

#### GoogleCalendarService
```python
def get_events(self, calendar_id='primary', max_results=100, days_ahead=100):
    # Сначала проверяем кэш
    user_id = self.oauth_service.user.id
    cached_events = GoogleAPICache.get_calendar_events(user_id, calendar_id, days_ahead)
    
    if cached_events is not None:
        return cached_events
    
    # Если в кэше нет, получаем из API
    events = self._fetch_events_from_api(...)
    
    # Сохраняем в кэш
    GoogleAPICache.set_calendar_events(user_id, events, calendar_id, days_ahead)
    
    return events
```

#### GoogleDriveService
```python
def get_files(self, max_results=100):
    # Сначала проверяем кэш
    user_id = self.oauth_service.user.id
    cached_files = GoogleAPICache.get_drive_files(user_id, max_results)
    
    if cached_files is not None:
        return cached_files
    
    # Если в кэше нет, получаем из API
    files = self._fetch_files_from_api(...)
    
    # Сохраняем в кэш
    GoogleAPICache.set_drive_files(user_id, files, max_results)
    
    return files
```

#### HuntflowService
```python
def get_applicant(self, account_id: int, applicant_id: int):
    # Сначала проверяем кэш
    user_id = self.user.id
    cached_candidate = HuntflowAPICache.get_candidate(user_id, account_id, applicant_id)
    
    if cached_candidate is not None:
        return cached_candidate
    
    # Если в кэше нет, получаем из API
    candidate_data = self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}")
    
    if candidate_data:
        # Сохраняем в кэш
        HuntflowAPICache.set_candidate(user_id, candidate_data, account_id, applicant_id)
    
    return candidate_data
```

### 3. Обновленные views

#### calendar_events
```python
def calendar_events(request):
    # Получаем события из кэша через API
    calendar_service = GoogleCalendarService(oauth_service)
    events_data = calendar_service.get_events(days_ahead=100)
    
    # Преобразуем данные API в формат для шаблона
    events = []
    for event_data in events_data:
        # Парсим и преобразуем данные...
        event_obj = {
            'id': event_data['id'],
            'title': event_data.get('summary', 'Без названия'),
            'start_time': start_time,
            'end_time': end_time,
            # ... другие поля
        }
        events.append(event_obj)
    
    # Фильтрация в памяти
    # Пагинация
    # Рендеринг
```

## Команды управления кэшем

### Показать статистику кэша
```bash
python manage.py cache_stats
```

### Очистить весь кэш
```bash
python manage.py clear_cache --confirm
```

## Преимущества

### 1. Производительность
- **Быстрый доступ**: Данные из кэша загружаются мгновенно
- **Снижение нагрузки**: Меньше запросов к внешним API
- **Масштабируемость**: Redis может обрабатывать множество одновременных запросов

### 2. Надежность
- **Отказоустойчивость**: Если API недоступен, данные берутся из кэша
- **Консистентность**: Данные кэшируются с учетом пользователя и параметров
- **Автоматическое обновление**: Кэш обновляется при истечении таймаута

### 3. Экономия ресурсов
- **API квоты**: Снижение потребления квот внешних API
- **База данных**: Меньше нагрузки на SQLite
- **Сеть**: Меньше сетевых запросов

## Мониторинг

### Логи кэширования
```
📦 Получены события календаря из кэша: 15 событий
💾 Сохранены события календаря в кэш: 15 событий
🔄 Синхронизация событий календаря: 15 событий (кэшированы)
```

### Статистика кэша
```bash
$ python manage.py cache_stats
📊 Статистика кэша API данных:
Всего ключей: 3

📋 По сервисам:
  google_calendar_events: 1 ключей
  google_drive_files: 1 ключей
  huntflow_candidates: 1 ключей

⏰ Самый старый кэш: 2025-09-08T14:51:03.947361+00:00
🆕 Самый новый кэш: 2025-09-08T14:51:03.947361+00:00
```

## Настройка

### Redis
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Настройки кэширования API данных
API_CACHE_TIMEOUT = {
    'google_calendar_events': 300,  # 5 минут
    'google_drive_files': 600,      # 10 минут
    'google_sheets': 600,           # 10 минут
    'huntflow_candidates': 1800,    # 30 минут
    'huntflow_vacancies': 3600,     # 1 час
    'huntflow_accounts': 7200,      # 2 часа
}
```

### Запуск Redis
```bash
# Запуск Redis сервера
redis-server --daemonize yes

# Проверка статуса
redis-cli ping
```

## Миграция

### Удаление старых моделей
```bash
# Создание миграции
python manage.py makemigrations google_oauth --empty

# Применение миграции
python manage.py migrate google_oauth
```

### Очистка данных
После миграции старые данные API (события, файлы, таблицы) будут удалены из базы данных, так как теперь они кэшируются в Redis.

## Заключение

Реализация кэширования в Redis значительно улучшила производительность приложения:

- ✅ **Быстрый доступ к данным**: Мгновенная загрузка из кэша
- ✅ **Снижение нагрузки на API**: Меньше запросов к внешним сервисам
- ✅ **Улучшенная масштабируемость**: Redis может обрабатывать множество запросов
- ✅ **Автоматическое управление**: Кэш обновляется автоматически
- ✅ **Мониторинг**: Команды для отслеживания состояния кэша

Теперь приложение работает значительно быстрее и эффективнее использует ресурсы!
