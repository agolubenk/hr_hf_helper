from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import HiringPlan, HiringPlanPosition, PlanMetrics


@admin.register(HiringPlan)
class HiringPlanAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'status', 'responsible_recruiter', 'start_date', 
        'end_date', 'total_positions', 'completion_rate', 'created_at'
    ]
    list_filter = ['status', 'responsible_recruiter', 'start_date', 'created_at']
    search_fields = ['title', 'description', 'responsible_recruiter__username']
    readonly_fields = ['created_at', 'updated_at', 'completion_rate_display']
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'status')
        }),
        ('Временные рамки', {
            'fields': ('start_date', 'end_date')
        }),
        ('Ответственные', {
            'fields': ('owner', 'responsible_recruiter')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at', 'completion_rate_display'),
            'classes': ('collapse',)
        }),
    )
    
    def completion_rate_display(self, obj):
        """Отображение процента выполнения с цветовой индикацией"""
        rate = obj.completion_rate
        color = 'success' if rate >= 80 else 'warning' if rate >= 50 else 'danger'
        return format_html(
            '<span class="badge bg-{}">{:.1f}%</span>',
            color, rate
        )
    completion_rate_display.short_description = 'Прогресс выполнения'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner', 'responsible_recruiter')


@admin.register(HiringPlanPosition)
class HiringPlanPositionAdmin(admin.ModelAdmin):
    list_display = [
        'vacancy', 'project', 'hiring_plan', 'priority', 'headcount_needed', 
        'headcount_hired', 'fulfillment_rate_display', 'urgency_deadline', 'is_active'
    ]
    list_filter = [
        'priority', 'is_active', 'hiring_plan__status', 
        'urgency_deadline', 'hiring_plan'
    ]
    search_fields = [
        'vacancy__name', 'project', 'hiring_plan__title', 'specifics', 'notes'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'fulfillment_rate_display', 
        'remaining_headcount_display', 'is_overdue_display'
    ]
    fieldsets = (
        ('Основная информация', {
            'fields': ('hiring_plan', 'vacancy', 'project', 'is_active')
        }),
        ('Количество специалистов', {
            'fields': ('headcount_needed', 'headcount_hired', 'headcount_in_progress')
        }),
        ('Приоритизация', {
            'fields': ('priority', 'urgency_deadline')
        }),
        ('Требования', {
            'fields': ('grades', 'specifics', 'notes')
        }),
        ('Статистика', {
            'fields': ('fulfillment_rate_display', 'remaining_headcount_display', 'is_overdue_display'),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    filter_horizontal = ['grades']
    
    def fulfillment_rate_display(self, obj):
        """Отображение процента закрытия позиции"""
        rate = obj.fulfillment_rate
        color = 'success' if rate >= 80 else 'warning' if rate >= 50 else 'danger'
        return format_html(
            '<span class="badge bg-{}">{:.1f}%</span>',
            color, rate
        )
    fulfillment_rate_display.short_description = 'Процент закрытия'
    
    def remaining_headcount_display(self, obj):
        """Отображение оставшегося количества"""
        remaining = obj.remaining_headcount
        if remaining == 0:
            return format_html('<span class="badge bg-success">Закрыто</span>')
        return format_html('<span class="badge bg-warning">{}</span>', remaining)
    remaining_headcount_display.short_description = 'Осталось нанять'
    
    def is_overdue_display(self, obj):
        """Отображение статуса просрочки"""
        if obj.is_overdue:
            return format_html('<span class="badge bg-danger">Просрочено</span>')
        elif obj.urgency_deadline:
            return format_html('<span class="badge bg-success">В срок</span>')
        else:
            return format_html('<span class="badge bg-secondary">Дедлайн не указан</span>')
    is_overdue_display.short_description = 'Статус дедлайна'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'hiring_plan', 'vacancy'
        ).prefetch_related('grades')


@admin.register(PlanMetrics)
class PlanMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'hiring_plan', 'total_positions', 'total_headcount_needed', 
        'total_headcount_hired', 'completion_rate', 'last_updated'
    ]
    list_filter = ['last_updated']
    search_fields = ['hiring_plan__title']
    readonly_fields = [
        'hiring_plan', 'total_positions', 'total_headcount_needed',
        'total_headcount_hired', 'completion_rate', 'last_updated'
    ]
    
    def has_add_permission(self, request):
        """Запрещаем ручное создание метрик"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Запрещаем ручное редактирование метрик"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление метрик"""
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('hiring_plan')