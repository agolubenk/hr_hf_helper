from django.apps import AppConfig


class HuntflowUpdatesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.huntflow_updates'
    verbose_name = 'Обновления Huntflow'
    
    def ready(self):
        """Импортируем сигналы при запуске приложения (если будут)"""
        pass
