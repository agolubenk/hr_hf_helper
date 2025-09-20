from django.contrib import admin
from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport


@admin.register(NotionSettings)
class NotionSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'database_id', 'auto_sync', 'sync_interval', 'last_sync_at', 'created_at']
    list_filter = ['auto_sync', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'database_id']
    readonly_fields = ['created_at', 'updated_at', 'last_sync_at']
    
    fieldsets = (
        ('Основные настройки', {
            'fields': ('user', 'database_id')
        }),
        ('Синхронизация', {
            'fields': ('auto_sync', 'sync_interval', 'last_sync_at')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotionPage)
class NotionPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'priority', 'date_updated', 'created_at']
    list_filter = ['status', 'priority', 'date_created', 'date_updated', 'created_at']
    search_fields = ['title', 'content', 'user__username', 'page_id']
    readonly_fields = ['page_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('page_id', 'title', 'content', 'user')
        }),
        ('Свойства', {
            'fields': ('status', 'priority', 'date_created', 'date_updated', 'due_date')
        }),
        ('Ссылки и файлы', {
            'fields': ('url', 'attachments', 'assignees', 'tags'),
            'classes': ('collapse',)
        }),
        ('Дополнительные свойства', {
            'fields': ('custom_properties',),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotionSyncLog)
class NotionSyncLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'pages_processed', 'pages_created', 'pages_updated', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'error_message']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'status', 'created_at')
        }),
        ('Статистика', {
            'fields': ('pages_processed', 'pages_created', 'pages_updated', 'sync_duration')
        }),
        ('Ошибки', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotionBulkImport)
class NotionBulkImportAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'total_pages', 'processed_pages', 'successful_pages', 'progress_percentage', 'created_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['user__username', 'error_message', 'celery_task_id']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'progress_percentage', 'success_rate']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'status', 'celery_task_id')
        }),
        ('Прогресс', {
            'fields': ('total_pages', 'processed_pages', 'successful_pages', 'failed_pages', 'progress_percentage', 'success_rate')
        }),
        ('Ошибки', {
            'fields': ('failed_page_ids', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )