# Настройка Telegram интеграции

Этот документ описывает настройку стабильной интеграции Telethon в hr_hf_helper согласно плану действий.

## Предварительные требования

1. **Redis** - должен быть запущен
2. **Python 3.8+** с установленными зависимостями
3. **Telegram API ключи** - получить на https://my.telegram.org/auth

## Быстрый старт

### 1. Настройка переменных окружения

Создайте файл `.env` в корне проекта или экспортируйте переменные:

```bash
export TG_API_ID=your_api_id_here
export TG_API_HASH=your_api_hash_here
```

### 2. Запуск всех сервисов

```bash
./start_telegram_services.sh
```

Этот скрипт:
- Проверит подключение к Redis
- Применит миграции
- Запустит обработчик очереди
- Запустит Telethon сервис
- Запустит Django сервер

### 3. Мониторинг

Откройте http://localhost:8000/telegram/ для мониторинга событий в реальном времени.

## Ручной запуск сервисов

### Запуск обработчика очереди

```bash
python3 manage.py process_telegram_queue
```

### Запуск Telethon сервиса

```bash
python3 manage.py run_telethon
```

### Запуск Django сервера

```bash
python3 manage.py runserver
```

## Архитектура системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telethon      │───▶│   Redis Queue   │───▶│  Queue Consumer │
│   Service       │    │   (Streams)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Events)      │
                                               └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   Django API    │
                                               │   (Frontend)    │
                                               └─────────────────┘
```

## Компоненты системы

### 1. Telethon Service (`run_telethon.py`)
- Подключается к Telegram API
- Слушает новые сообщения и редактирования
- Публикует события в Redis Stream

### 2. Queue Consumer (`process_telegram_queue.py`)
- Читает события из Redis Stream
- Сохраняет их в базу данных
- Работает в фоновом режиме

### 3. Django API
- Предоставляет REST API для фронтенда
- Возвращает статистику системы
- Отмечает события как обработанные

### 4. Frontend
- Отображает события в реальном времени
- Показывает статус системы
- Автообновление каждые 2 секунды

## API Endpoints

### GET /telegram/api/events/
Возвращает список необработанных событий и отмечает их как обработанные.

### GET /telegram/api/status/
Возвращает статус системы:
```json
{
    "status": "active",
    "total_events": 150,
    "unprocessed_events": 5,
    "queue_length": 2,
    "redis_connected": true,
    "queue_info": {
        "length": 2,
        "first_entry": "...",
        "last_entry": "...",
        "groups": 0
    }
}
```

## Мониторинг и отладка

### Логи
- Django логи: `logs/django.log`
- Telegram логи: `telegram.log`
- Celery логи: `logs/celery.log`

### Проверка Redis
```bash
redis-cli
> XINFO STREAM telegram:events
> XREAD STREAMS telegram:events $
```

### Проверка базы данных
```bash
python3 manage.py shell
>>> from apps.telegram.models import TelegramEvent
>>> TelegramEvent.objects.count()
>>> TelegramEvent.objects.filter(processed=False).count()
```

## Устранение неполадок

### Telethon не подключается
1. Проверьте API ключи
2. Убедитесь, что сессия не заблокирована
3. Проверьте интернет-соединение

### Redis недоступен
```bash
# Запуск Redis
brew services start redis  # macOS
sudo systemctl start redis # Linux

# Проверка
redis-cli ping
```

### События не обрабатываются
1. Проверьте, что обработчик очереди запущен
2. Проверьте логи обработчика
3. Убедитесь, что Redis работает

## Продакшн деплой

### Docker Compose
```bash
docker-compose -f docker-compose.telegram.yml up -d
```

### Systemd сервисы
Создайте systemd сервисы для:
- `run_telethon.service`
- `process_telegram_queue.service`

### Мониторинг
- Настройте Sentry для отслеживания ошибок
- Используйте Prometheus для метрик
- Настройте алерты для критических ошибок

## Безопасность

1. **Никогда не коммитьте API ключи** в репозиторий
2. **Используйте переменные окружения** для всех секретов
3. **Ограничьте доступ** к Redis и базе данных
4. **Регулярно обновляйте** зависимости

## Поддержка

При возникновении проблем:
1. Проверьте логи всех сервисов
2. Убедитесь, что все зависимости установлены
3. Проверьте подключение к внешним сервисам
4. Обратитесь к документации Telethon и Django
