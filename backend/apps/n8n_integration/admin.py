from django.contrib import admin
from .models import N8NWebhook, N8NRequest, N8NIncomingData


@admin.register(N8NWebhook)
class N8NWebhookAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'user')
    search_fields = ('name', 'webhook_url', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'user', 'is_active', 'description')
        }),
        ('Настройки', {
            'fields': ('webhook_url',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(N8NRequest)
class N8NRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'webhook', 'user', 'request_type', 'status', 'method', 'response_status_code', 'created_at')
    list_filter = ('status', 'request_type', 'method', 'created_at', 'user')
    search_fields = ('url', 'user__username', 'error_message')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('webhook', 'user', 'request_type', 'status')
        }),
        ('Детали запроса', {
            'fields': ('url', 'method', 'request_data')
        }),
        ('Ответ', {
            'fields': ('response_status_code', 'response_data', 'error_message')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(N8NIncomingData)
class N8NIncomingDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'source', 'processed', 'created_at', 'processed_at')
    list_filter = ('processed', 'created_at', 'user')
    search_fields = ('source', 'user__username')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'source', 'processed', 'processed_at')
        }),
        ('Данные', {
            'fields': ('data', 'headers')
        }),
        ('Системная информация', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
