from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_("Интеграции"), {
            "fields": (
                "gemini_api_key",
                "clickup_api_key",
                "huntflow_prod_url", "huntflow_prod_api_key",
                "huntflow_sandbox_url", "huntflow_sandbox_api_key",
                "active_system", "telegram_username",
            )
        }),
        (_("Роли/Профиль"), {
            "fields": ("full_name", "interviewer_calendar_url", "is_observer_active",)
        }),
    )
    list_display = ("username", "full_name", "email", "active_system", "get_clickup_status", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "active_system", "date_joined")
    search_fields = ("username", "full_name", "email", "telegram_username")
    
    def get_clickup_status(self, obj):
        """Отображение статуса ClickUp API ключа"""
        if obj.clickup_api_key:
            return "✅ Настроен"
        else:
            return "❌ Не настроен"
    get_clickup_status.short_description = "ClickUp API"
    get_clickup_status.admin_order_field = "clickup_api_key"
