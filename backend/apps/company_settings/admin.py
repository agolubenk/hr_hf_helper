from django.contrib import admin
from .models import CompanySettings


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'theme', 'main_calendar_id', 'updated_at']
    list_filter = ['theme', 'created_at', 'updated_at']
    search_fields = ['company_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('company_name', 'theme')
        }),
        ('Интеграции', {
            'fields': ('main_calendar_id',)
        }),
        ('Оргструктура', {
            'fields': ('org_structure',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Разрешаем создание только если нет записей
        return CompanySettings.objects.count() == 0
    
    def has_delete_permission(self, request, obj=None):
        # Запрещаем удаление синглтона
        return False

