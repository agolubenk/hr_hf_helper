"""Совместимость для Telegram приложения"""
import warnings
from apps.telegram.views import * as old_telegram_views
from logic.integration.telegram.telegram_service import * as new_telegram_views

def get_telegram_views():
    """Получить views для Telegram (новые или старые)"""
    warnings.warn(
        "Old telegram views are deprecated. Use logic.integration.telegram.telegram_service",
        DeprecationWarning,
        stacklevel=2
    )
    return new_telegram_views

# Экспорт основных функций для совместимости
TelegramAuthView = new_telegram_views.TelegramAuthView
telegram_dashboard = new_telegram_views.telegram_dashboard
telegram_auth_sync = new_telegram_views.telegram_auth_sync
telegram_logout = new_telegram_views.telegram_logout
telegram_settings = new_telegram_views.telegram_settings
telegram_auth_attempts = new_telegram_views.telegram_auth_attempts
telegram_webhook = new_telegram_views.telegram_webhook
telegram_test_connection = new_telegram_views.telegram_test_connection

