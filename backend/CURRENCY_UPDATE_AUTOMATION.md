# Автоматическое обновление курсов валют НБРБ

## Обзор

Система автоматически обновляет курсы валют НБРБ (USD и PLN) в будние дни в 11:00 и 16:00 через Celery Beat.

## Компоненты

### 1. Django команда
- **Файл**: `apps/finance/management/commands/update_nbrb_rates.py`
- **Использование**: `python manage.py update_nbrb_rates`
- **Функция**: Ручное обновление курсов валют

### 2. Celery задача
- **Файл**: `apps/finance/tasks.py` → `update_currency_rates()`
- **Регистрация**: `config.celery.py` → `config.celery.update_currency_rates`
- **Функция**: Автоматическое обновление курсов валют

### 3. Расписание Celery Beat
- **Утреннее обновление**: 11:00 ПН-ПТ
- **Вечернее обновление**: 16:00 ПН-ПТ
- **Конфигурация**: `config/celery.py`

### 4. Тестовая команда
- **Файл**: `apps/finance/management/commands/test_currency_update.py`
- **Использование**: `python manage.py test_currency_update`
- **Функция**: Тестирование Celery задачи

## Технические детали

### Источник данных
- **API**: НБРБ (api.nbrb.by)
- **Валюты**: USD, PLN, EUR
- **Сервис**: `logic/base/currency_service.py`

### Модель данных
- **Таблица**: `finance_currencyrate`
- **Поля**: `code`, `rate`, `scale`, `fetched_at`
- **Модель**: `apps/finance/models.py` → `CurrencyRate`

### Логирование
- **Celery логи**: `logs/celery.log`
- **Формат**: Подробные логи с эмодзи и статусами
- **Уровень**: INFO для успешных операций, ERROR для ошибок

## Мониторинг

### Проверка статуса
```bash
# Проверить текущие курсы
python manage.py shell -c "
from apps.finance.models import CurrencyRate
for rate in CurrencyRate.objects.all():
    print(f'{rate.code}: {rate.rate} BYN ({rate.fetched_at})')
"

# Проверить расписание Celery Beat
python manage.py shell -c "
from config.celery import app
for name, config in app.conf.beat_schedule.items():
    if 'currency' in name.lower():
        print(f'{name}: {config}')
"
```

### Ручное обновление
```bash
# Обновить курсы вручную
python manage.py update_nbrb_rates

# Протестировать Celery задачу
python manage.py test_currency_update
```

## Расписание

| Время | Дни | Задача | Описание |
|-------|-----|--------|----------|
| 11:00 | ПН-ПТ | `update-currency-rates-morning` | Утреннее обновление курсов |
| 16:00 | ПН-ПТ | `update-currency-rates-afternoon` | Вечернее обновление курсов |

## Логи

### Успешное обновление
```
🔄 Запуск автоматического обновления курсов валют НБРБ...
🔍 Проверяем подключение к НБРБ API...
✅ Подключение к НБРБ API успешно
💱 Обновляем курсы валют в базе данных...
✅ Успешно обновлено 2 курсов валют
  💰 USD: 3.039 BYN (обновлен)
  💰 PLN: 8.3291 BYN (обновлен)
```

### Ошибка подключения
```
❌ Ошибка подключения к НБРБ API: Connection timeout
```

## Зависимости

- **Celery**: Асинхронные задачи
- **Celery Beat**: Периодические задачи
- **Redis**: Брокер сообщений
- **Django**: ORM и команды
- **requests**: HTTP запросы к НБРБ API

## Настройка

### Переменные окружения
- Не требуются (НБРБ API публичный)

### Конфигурация Celery
- **Файл**: `config/celery.py`
- **Автодискавери**: `apps.finance`
- **Регистрация**: Принудительная в `config.celery`

## Устранение неполадок

### Задача не выполняется
1. Проверить статус Celery Worker: `./start_services.sh`
2. Проверить логи: `tail -f logs/celery.log`
3. Проверить регистрацию задачи: `python manage.py shell -c "from config.celery import app; print(app.tasks.keys())"`

### Ошибки API
1. Проверить доступность НБРБ API: `curl https://api.nbrb.by/exrates/rates/USD?parammode=2`
2. Проверить логи подключения в `logs/celery.log`

### Проблемы с расписанием
1. Проверить конфигурацию Beat: `python manage.py shell -c "from config.celery import app; print(app.conf.beat_schedule)"`
2. Перезапустить сервисы: `./stop_services.sh && ./start_services.sh`
