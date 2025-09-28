import os
from celery import Celery

# Устанавливаем переменную окружения для настроек Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('hrhelper')

# Используем строку конфигурации Django для загрузки настроек Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# Дополнительные настройки
app.conf.update(
    # Максимальное время выполнения задачи (30 минут)
    task_time_limit=1800,
    # Мягкий лимит времени (25 минут)
    task_soft_time_limit=1500,
    # Ограничиваем параллелизм для задач Gemini (1 запрос в минуту)
    worker_concurrency=1,
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

# Автоматическое обнаружение задач в установленных приложениях
app.autodiscover_tasks(['apps.finance', 'apps.clickup_int', 'apps.notion_int'])

# Принудительно регистрируем задачи finance после настройки Django
@app.task
def save_hh_analysis_result(ai_response: dict, vacancy_data: dict):
    """Сохраняет результат AI анализа в Benchmark"""
    from apps.finance.tasks import save_hh_analysis_result as original_task
    return original_task(ai_response, vacancy_data)

# Настройки для периодических задач
app.conf.beat_schedule = {
        # Finance задачи
        'fetch-hh-vacancies': {
            'task': 'apps.finance.tasks.fetch_hh_vacancies_task',
            'schedule': 1200.0,  # Каждые 20 минут
        },
    'process-hh-queue': {
        'task': 'apps.finance.tasks.process_hh_queue_with_limit',
        'schedule': 300.0,   # Каждые 5 минут
    },
    'cleanup-old-benchmarks': {
        'task': 'apps.finance.tasks.cleanup_old_benchmarks',
        'schedule': 86400.0,  # Каждый день
    },
    'generate-benchmark-statistics': {
        'task': 'apps.finance.tasks.generate_benchmark_statistics',
        'schedule': 3600.0,  # Каждый час
    },
    
    # Notion задачи
    'auto-sync-notion-pages': {
        'task': 'apps.notion_int.tasks.auto_sync_notion_pages',
        'schedule': 1800.0,  # Каждые 30 минут
        'kwargs': {'user_id': 1},  # TODO: Настроить для всех пользователей
    },
    
    # Google OAuth задачи
    'refresh-google-oauth-tokens': {
        'task': 'apps.google_oauth.tasks.refresh_google_oauth_tokens',
        'schedule': 1800.0,  # Каждые 30 минут
    },
    # ОТКЛЮЧЕНО: Автоматическое удаление OAuth аккаунтов
    # 'cleanup-expired-oauth-accounts': {
    #     'task': 'apps.google_oauth.tasks.cleanup_expired_oauth_accounts',
    #     'schedule': 86400.0,  # Каждый день
    # },
    'validate-oauth-tokens': {
        'task': 'apps.google_oauth.tasks.validate_oauth_tokens',
        'schedule': 3600.0,  # Каждый час
    },
    
    # ClickUp задачи (работают по требованию через веб-интерфейс)
    # Массовый импорт и синхронизация запускаются вручную через UI
    # Это правильно, так как эти операции требуют пользовательского вмешательства
}

# Настройки маршрутизации задач для ClickUp
app.conf.task_routes = {
    'apps.clickup_int.tasks.bulk_import_clickup_tasks': {'queue': 'clickup_import'},
    'apps.clickup_int.tasks.import_single_task': {'queue': 'clickup_import'},
    'apps.clickup_int.tasks.retry_failed_tasks': {'queue': 'clickup_import'},
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
