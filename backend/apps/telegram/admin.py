from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import TelegramUser, AuthAttempt


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'telegram_id', 'username', 'first_name', 
        'is_authorized', 'auth_date', 'session_name'
    ]
    list_filter = ['is_authorized', 'auth_date', 'created_at']
    search_fields = ['user__username', 'telegram_id', 'username', 'first_name', 'session_name']
    readonly_fields = ['created_at', 'updated_at', 'telegram_id', 'auth_date']
    raw_id_fields = ['user']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'session_name', 'is_authorized')
        }),
        ('Данные Telegram', {
            'fields': (
                'telegram_id', 'username', 'first_name', 
                'last_name', 'phone', 'auth_date'
            )
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        # Запрещаем удаление авторизованных пользователей
        if obj and obj.is_authorized:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(AuthAttempt)
class AuthAttemptAdmin(admin.ModelAdmin):
    list_display = [
        'telegram_user', 'attempt_type', 'status', 
        'created_at', 'has_error'
    ]
    list_filter = ['attempt_type', 'status', 'created_at']
    search_fields = [
        'telegram_user__user__username', 
        'telegram_user__username',
        'error_message'
    ]
    readonly_fields = ['created_at']
    raw_id_fields = ['telegram_user']
    
    def has_error(self, obj):
        return bool(obj.error_message)
    has_error.boolean = True
    has_error.short_description = 'Есть ошибка'
    
    def has_add_permission(self, request):
        # Запрещаем ручное создание попыток
        return False


# TelegramMessage временно отключена из-за конфликта с существующей таблицей
# @admin.register(TelegramMessage)
# class TelegramMessageAdmin(admin.ModelAdmin):
#     list_display = [
#         'telegram_user', 'message_id', 'chat_id', 
#         'text_preview', 'is_outgoing', 'date'
#     ]
#     list_filter = ['is_outgoing', 'date', 'created_at']
#     search_fields = [
#         'telegram_user__user__username',
#         'telegram_user__username', 
#         'text', 'message_id', 'chat_id'
#     ]
#     readonly_fields = ['created_at', 'message_id', 'chat_id', 'date']
#     raw_id_fields = ['telegram_user']
#     
#     def text_preview(self, obj):
#         if obj.text:
#             preview = obj.text[:50] + "..." if len(obj.text) > 50 else obj.text
#             return preview
#         return "—"
#     text_preview.short_description = 'Текст сообщения'
#     
#     def has_add_permission(self, request):
#         # Запрещаем ручное создание сообщений
#         return False


# Настройка админ-панели
admin.site.site_header = "HR Helper Administration"
admin.site.site_title = "HR Helper Admin"
admin.site.index_title = "Управление HR Helper"
