from django.contrib import admin
from .models import HuntflowCandidateUpdate, HuntflowSyncLog


@admin.register(HuntflowCandidateUpdate)
class HuntflowCandidateUpdateAdmin(admin.ModelAdmin):
    list_display = (
        'huntflow_candidate_id', 
        'last_name', 
        'first_name', 
        'email', 
        'phone', 
        'last_synced_at',
        'user'
    )
    list_filter = ('last_synced_at', 'created_at', 'user', 'level')
    search_fields = (
        'huntflow_candidate_id',
        'last_name', 
        'first_name', 
        'middle_name',
        'email', 
        'phone',
        'telegram'
    )
    readonly_fields = ('created_at', 'updated_at', 'last_synced_at', 'raw_data')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'huntflow_candidate_id')
        }),
        ('Персональные данные', {
            'fields': ('last_name', 'first_name', 'middle_name', 'birth_date')
        }),
        ('Контактная информация', {
            'fields': ('phone', 'email', 'telegram')
        }),
        ('Профессиональная информация', {
            'fields': (
                'source',
                'level',
                'salary_expectations',
                'resume',
                'scorecard'
            )
        }),
        ('Условия работы', {
            'fields': (
                'office_format',
                'office',
                'full_time',
                'distribution',
                'relocation',
                'pl_contract_type'
            )
        }),
        ('Дополнительная информация', {
            'fields': (
                'army',
                'job_change_reason',
                'start_date',
                'communication_channel'
            )
        }),
        ('Системная информация', {
            'fields': ('raw_data', 'last_synced_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(HuntflowSyncLog)
class HuntflowSyncLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'status',
        'started_at',
        'completed_at',
        'candidates_processed',
        'candidates_created',
        'candidates_updated',
        'errors_count'
    )
    list_filter = ('status', 'started_at', 'user')
    search_fields = ('user__username', 'error_message')
    readonly_fields = (
        'started_at',
        'completed_at',
        'candidates_processed',
        'candidates_created',
        'candidates_updated',
        'errors_count'
    )
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'status')
        }),
        ('Статистика', {
            'fields': (
                'candidates_processed',
                'candidates_created',
                'candidates_updated',
                'errors_count',
                'last_processed_candidate_id'
            )
        }),
        ('Ошибки', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Временные метки', {
            'fields': ('started_at', 'completed_at')
        }),
    )
