from django.contrib import admin
from .models import HHRUAccount, HHRUConfiguration, HHRUAPILog


@admin.register(HHRUAccount)
class HHRUAccountAdmin(admin.ModelAdmin):
    """Админ-панель для HH.ru аккаунтов"""
    list_display = [
        'user', 'hh_user_id', 'email', 'first_name', 'last_name',
        'is_employer', 'is_admin', 'is_token_valid', 'created_at'
    ]
    list_filter = ['is_employer', 'is_admin', 'created_at']
    search_fields = ['user__username', 'email', 'hh_user_id', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at', 'last_sync_at']
    
    fieldsets = (
        ('Пользователь', {
            'fields': ('user',)
        }),
        ('OAuth данные', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at'),
            'classes': ('collapse',)
        }),
        ('Данные профиля', {
            'fields': (
                'hh_user_id', 'email', 'first_name', 'last_name', 'middle_name',
                'is_employer', 'is_admin', 'profile_data'
            )
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at', 'last_sync_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(HHRUConfiguration)
class HHRUConfigurationAdmin(admin.ModelAdmin):
    """Админ-панель для конфигураций HH.ru"""
    list_display = [
        'name', 'client_id', 'user', 'is_active', 'is_default', 'created_at'
    ]
    list_filter = ['is_active', 'is_default', 'created_at']
    search_fields = ['name', 'client_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'user', 'is_active', 'is_default')
        }),
        ('OAuth настройки', {
            'fields': ('client_id', 'client_secret', 'redirect_uri')
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(HHRUAPILog)
class HHRUAPILogAdmin(admin.ModelAdmin):
    """Админ-панель для логов HH.ru API"""
    list_display = [
        'method', 'endpoint', 'status_code', 'log_type',
        'user', 'created_at', 'is_success'
    ]
    list_filter = ['log_type', 'method', 'status_code', 'created_at']
    search_fields = ['endpoint', 'error_message', 'user__username']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('log_type', 'method', 'endpoint', 'status_code')
        }),
        ('Данные запроса/ответа', {
            'fields': ('request_data', 'response_data', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Связи', {
            'fields': ('user', 'account')
        }),
        ('Временные метки', {
            'fields': ('created_at',)
        }),
    )
    
    def is_success(self, obj):
        """Отображает статус успешности запроса"""
        return obj.is_success
    is_success.boolean = True
    is_success.short_description = 'Успешно'

