from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import HuntflowCache, HuntflowLog


@admin.register(HuntflowCache)
class HuntflowCacheAdmin(admin.ModelAdmin):
    list_display = ("cache_key", "age_display", "status_display", "updated_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("cache_key",)
    readonly_fields = ("created_at", "updated_at", "age_display", "status_display")
    
    def age_display(self, obj):
        """Отображает возраст кэша"""
        age = obj.age_minutes
        if age < 60:
            return f"{age} мин"
        elif age < 1440:  # 24 часа
            hours = age // 60
            return f"{hours} ч"
        else:
            days = age // 1440
            return f"{days} дн"
    age_display.short_description = "Возраст"
    
    def status_display(self, obj):
        """Отображает статус кэша с цветовой индикацией"""
        if obj.is_expired:
            return format_html('<span style="color: #dc3545; font-weight: bold;">Истек</span>')
        elif obj.age_minutes < 30:
            return format_html('<span style="color: #28a745; font-weight: bold;">Свежий</span>')
        elif obj.age_minutes < 120:
            return format_html('<span style="color: #ffc107; font-weight: bold;">Устаревает</span>')
        else:
            return format_html('<span style="color: #fd7e14; font-weight: bold;">Устарел</span>')
    status_display.short_description = "Статус"


@admin.register(HuntflowLog)
class HuntflowLogAdmin(admin.ModelAdmin):
    list_display = ("method", "endpoint_short", "status_display", "user", "created_at")
    list_filter = ("log_type", "method", "status_code", "created_at", "user")
    search_fields = ("endpoint", "error_message")
    readonly_fields = ("created_at", "status_display", "request_data_display", "response_data_display")
    date_hierarchy = "created_at"
    
    def endpoint_short(self, obj):
        """Сокращенное отображение эндпоинта"""
        if len(obj.endpoint) > 50:
            return obj.endpoint[:47] + "..."
        return obj.endpoint
    endpoint_short.short_description = "Эндпоинт"
    
    def status_display(self, obj):
        """Отображает статус запроса с цветовой индикацией"""
        if obj.is_success:
            return format_html('<span style="color: #28a745; font-weight: bold;">✅ {}</span>', obj.status_code)
        elif obj.is_error:
            return format_html('<span style="color: #dc3545; font-weight: bold;">❌ {}</span>', obj.status_code or "ERROR")
        else:
            return format_html('<span style="color: #6c757d;">{}</span>', obj.status_code or "N/A")
    status_display.short_description = "Статус"
    
    def request_data_display(self, obj):
        """Отображает данные запроса в читаемом формате"""
        if obj.request_data:
            import json
            return format_html('<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">{}</pre>', 
                             json.dumps(obj.request_data, indent=2, ensure_ascii=False))
        return "Нет данных"
    request_data_display.short_description = "Данные запроса"
    
    def response_data_display(self, obj):
        """Отображает данные ответа в читаемом формате"""
        if obj.response_data:
            import json
            return format_html('<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">{}</pre>', 
                             json.dumps(obj.response_data, indent=2, ensure_ascii=False))
        return "Нет данных"
    response_data_display.short_description = "Данные ответа"
    
    def has_add_permission(self, request):
        """Запрещаем добавление логов через админку"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Запрещаем изменение логов через админку"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Разрешаем удаление только суперпользователям"""
        return request.user.is_superuser