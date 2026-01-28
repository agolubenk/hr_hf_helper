from django.apps import AppConfig


class N8NIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.n8n_integration'
    verbose_name = 'Интеграция с n8n'
    
    def ready(self):
        """Импортируем сигналы при запуске приложения (если будут)"""
        pass
