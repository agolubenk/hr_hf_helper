import os
from celery import Celery

# Устанавливаем переменную окружения для Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('hrhelper')

# Настройки для ClickUp API
app.conf.update(
    # Настройки Redis
    broker_url='redis://127.0.0.1:6379/0',
    result_backend='redis://127.0.0.1:6379/0',
    # Максимальное время выполнения задачи (30 минут)
    task_time_limit=1800,
    # Мягкий лимит времени (25 минут)
    task_soft_time_limit=1500,
    # Настройки для ClickUp API
    clickup_task_delay_min=10,  # Минимальная задержка между запросами (секунды)
    clickup_task_delay_max=45,  # Максимальная задержка между запросами (секунды)
    # Настройки сериализации
    accept_content=['json'],
    task_serializer='json',
    result_serializer='json',
    # Настройки времени
    timezone='Europe/Moscow',
    enable_utc=True,
)

# Автоматически находим задачи в приложениях Django
app.autodiscover_tasks()
