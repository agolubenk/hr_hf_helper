# Это обеспечит загрузку приложения при запуске Django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from .celery import app as celery_app

__all__ = ('celery_app',)
