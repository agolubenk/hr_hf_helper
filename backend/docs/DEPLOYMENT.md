# Инструкции по развертыванию

## Настройка автоматического обновления курсов валют

### Вариант 1: Системный cron

1. Откройте crontab для редактирования:
```bash
crontab -e
```

2. Добавьте строку для ежедневного обновления в 18:05 по минскому времени:
```bash
# Обновление курсов валют НБРБ каждый день в 18:05
5 18 * * * /absolute/path/to/backend/cron_update_rates.sh
```

3. Проверьте, что cron работает:
```bash
crontab -l
```

### Вариант 2: Celery Beat (для продакшена)

1. Установите Celery:
```bash
pip install celery redis
```

2. Создайте файл `celery.py` в папке `config/`:
```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('hrhelper')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-nbrb-rates': {
        'task': 'apps.finance.tasks.update_rates',
        'schedule': crontab(hour=18, minute=5),
    },
}
```

3. Создайте файл `tasks.py` в папке `apps/finance/`:
```python
from celery import shared_task
from django.core.management import call_command

@shared_task
def update_rates():
    call_command('update_nbrb_rates')
```

## Проверка работы

### Проверка команд
```bash
# Проверка seed_roles
python manage.py seed_roles

# Проверка update_nbrb_rates
python manage.py update_nbrb_rates

# Проверка системы
python manage.py check
```

### Проверка админки
1. Запустите сервер: `python manage.py runserver 8000`
2. Откройте http://localhost:8000/admin/
3. Войдите с учетными данными суперпользователя
4. Проверьте разделы "Пользователи", "Грейды", "Курсы валют"

### Проверка групп и прав
В админке Django проверьте:
- Группы: Администраторы, Наблюдатели, Рекрутеры, Интервьюеры
- Права доступа для каждой группы
- Пользователей и их членство в группах

## Мониторинг

### Логи обновления курсов
Логи сохраняются в `logs/nbrb_update.log`:
```bash
tail -f logs/nbrb_update.log
```

### Проверка последнего обновления
```bash
python manage.py shell
```
```python
from apps.finance.models import CurrencyRate
for rate in CurrencyRate.objects.all():
    print(f"{rate.code}: {rate.rate} (обновлено: {rate.fetched_at})")
```

## Устранение неполадок

### Ошибка "Rate for USD not found"
- Проверьте доступность API НБРБ
- Проверьте интернет-соединение
- В случае недоступности API используются значения по умолчанию

### Ошибки миграций
```bash
python manage.py showmigrations
python manage.py migrate --plan
```

### Проблемы с правами доступа
```bash
python manage.py seed_roles
```
