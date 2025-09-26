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
    
    def has_delete_permission(self, request, obj=None):
        """Проверка прав на удаление пользователя"""
        # Если это суперпользователь, разрешаем удаление
        if request.user.is_superuser:
            return True
        
        # Если это обычный пользователь, запрещаем удаление
        if obj and obj.is_superuser:
            return False
            
        # Проверяем, есть ли связанные авторизованные TelegramUser
        if obj:
            try:
                from apps.telegram.models import TelegramUser
                telegram_user = TelegramUser.objects.get(user=obj)
                if telegram_user.is_authorized:
                    # Если есть авторизованный TelegramUser, разрешаем удаление
                    # но сначала деавторизуем TelegramUser
                    return True
            except:
                pass
        
        return super().has_delete_permission(request, obj)
    
    def delete_model(self, request, obj):
        """Удаление пользователя с предварительной очисткой связанных объектов"""
        # Деавторизуем TelegramUser перед удалением
        try:
            from apps.telegram.models import TelegramUser
            telegram_user = TelegramUser.objects.get(user=obj)
            if telegram_user.is_authorized:
                telegram_user.is_authorized = False
                telegram_user.save()
        except:
            pass
        
        # Удаляем пользователя
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Массовое удаление пользователей с предварительной очисткой"""
        # Деавторизуем всех связанных TelegramUser
        try:
            from apps.telegram.models import TelegramUser
            for user in queryset:
                try:
                    telegram_user = TelegramUser.objects.get(user=user)
                    if telegram_user.is_authorized:
                        telegram_user.is_authorized = False
                        telegram_user.save()
                except:
                    pass
        except:
            pass
        
        # Удаляем пользователей
        super().delete_queryset(request, queryset)