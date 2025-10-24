from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum

from .models import (
    HiringPlan, HiringPlanPosition, PositionType, PlanPeriodType,
    PositionKPIOKR, PlanKPIOKRBlock, PlanMetrics,
    VacancySLA, HiringRequest
)


@admin.register(PositionType)
class PositionTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'priority_boost', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['priority_boost', 'name']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'type', 'description')
        }),
        ('Настройки', {
            'fields': ('priority_boost', 'is_active')
        }),
    )


@admin.register(PlanPeriodType)
class PlanPeriodTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'period_type', 'days', 'is_active']
    list_filter = ['period_type', 'is_active']
    search_fields = ['name']
    ordering = ['days']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'period_type', 'days')
        }),
        ('Настройки', {
            'fields': ('is_active',)
        }),
    )


@admin.register(PlanKPIOKRBlock)
class PlanKPIOKRBlockAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'is_template', 'position_types_count', 'grades_count', 'created_at']
    list_filter = ['is_active', 'is_template']
    search_fields = ['name', 'description']
    filter_horizontal = ['position_types', 'grades']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description')
        }),
        ('Применение', {
            'fields': ('position_types', 'grades'),
            'description': 'Если поля пустые - применяется ко всем типам позиций/грейдам'
        }),
        ('Настройки', {
            'fields': ('is_active', 'is_template')
        }),
    )
    
    def position_types_count(self, obj):
        return obj.position_types.count()
    position_types_count.short_description = 'Типов позиций'
    
    def grades_count(self, obj):
        return obj.grades.count()
    grades_count.short_description = 'Грейдов'




@admin.register(PositionKPIOKR)
class PositionKPIOKRAdmin(admin.ModelAdmin):
    list_display = ['name', 'scope', 'vacancy', 'grade', 'metric_type', 'target_value', 'status', 'achievement_rate_display']
    list_filter = ['scope', 'metric_type', 'status', 'period_start']
    search_fields = ['name', 'vacancy__name']
    ordering = ['-period_start', 'metric_type', 'name']
    
    fieldsets = (
        ('Основное', {
            'fields': ('name', 'metric_type', 'scope', 'description')
        }),
        ('Применение', {
            'fields': ('vacancy', 'grade', 'plan_kpi_okr_block', 'hiring_plan'),
            'description': 'Поля зависят от выбранного scope'
        }),
        ('Значения', {
            'fields': ('target_value', 'unit', 'sla_value', 'actual_value', 'status')
        }),
        ('Период', {
            'fields': ('period_start', 'period_end')
        }),
    )
    
    def achievement_rate_display(self, obj):
        rate = obj.achievement_rate
        if rate >= 100:
            color = 'green'
        elif rate >= 80:
            color = 'orange'
        else:
            color = 'red'
        return format_html('<span style="color: {};">{:.1f}%</span>', color, rate)
    achievement_rate_display.short_description = 'Достижение'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vacancy', 'grade', 'plan_kpi_okr_block', 'hiring_plan')


@admin.register(HiringPlan)
class HiringPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'period_type', 'completion_rate_display', 'total_positions', 'is_completed', 'created_at']
    list_filter = ['period_type', 'is_completed', 'is_auto_generated', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'total_positions', 'total_headcount_needed', 'total_headcount_hired', 'completion_rate']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'period_type', 'is_completed')
        }),
        ('История периодов', {
            'fields': ('previous_plan', 'is_auto_generated', 'owner'),
            'classes': ('collapse',)
        }),
        ('Метрики', {
            'fields': ('total_positions', 'total_headcount_needed', 'total_headcount_hired', 'completion_rate'),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def completion_rate_display(self, obj):
        rate = obj.completion_rate
        if rate >= 100:
            color = 'green'
        elif rate >= 80:
            color = 'orange'
        else:
            color = 'red'
        return format_html('<span style="color: {};">{:.1f}%</span>', color, rate)
    completion_rate_display.short_description = 'Выполнение'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('period_type', 'owner', 'previous_plan')


@admin.register(HiringPlanPosition)
class HiringPlanPositionAdmin(admin.ModelAdmin):
    list_display = ['vacancy', 'hiring_plan', 'position_type', 'headcount_needed', 'headcount_hired', 'fulfillment_rate_display', 'sla_status_display', 'priority', 'is_active']
    list_filter = ['position_type', 'priority', 'is_active', 'hiring_plan']
    search_fields = ['vacancy__name', 'hiring_plan__title', 'project']
    readonly_fields = ['sla_status_display', 'sla_compliance', 'time_to_fill', 'is_fulfilled', 'is_overdue', 'remaining_headcount']
    ordering = ['hiring_plan', 'priority', 'urgency_deadline']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('hiring_plan', 'vacancy', 'position_type', 'project')
        }),
        ('Замена', {
            'fields': ('replacement_reason', 'replaced_employee_id'),
            'classes': ('collapse',)
        }),
        ('Количество', {
            'fields': ('headcount_needed', 'headcount_hired', 'headcount_in_progress')
        }),
        ('Приоритет и дедлайны', {
            'fields': ('priority', 'urgency_deadline')
        }),
        ('Требования', {
            'fields': ('grades', 'specifics', 'notes'),
            'classes': ('collapse',)
        }),
        ('SLA', {
            'fields': ('sla_status_display', 'sla_compliance', 'time_to_fill'),
            'classes': ('collapse',)
        }),
        ('Статус', {
            'fields': ('is_fulfilled', 'is_overdue', 'remaining_headcount', 'filled_date', 'is_active')
        }),
        ('KPI/OKR', {
            'fields': ('applied_kpi_okr_blocks',),
            'classes': ('collapse',)
        }),
    )
    
    def fulfillment_rate_display(self, obj):
        rate = obj.fulfillment_rate
        if rate >= 100:
            color = 'green'
        elif rate >= 80:
            color = 'orange'
        else:
            color = 'red'
        return format_html('<span style="color: {};">{:.1f}%</span>', color, rate)
    fulfillment_rate_display.short_description = 'Выполнение'
    
    def sla_status_display(self, obj):
        status = obj.sla_status
        status_colors = {
            'on_time': 'green',
            'warning': 'orange',
            'critical': 'red',
            'overdue': 'darkred',
            'no_sla': 'gray'
        }
        status_names = {
            'on_time': 'В срок',
            'warning': 'Предупреждение',
            'critical': 'Критично',
            'overdue': 'Просрочено',
            'no_sla': 'Нет SLA'
        }
        color = status_colors.get(status, 'gray')
        name = status_names.get(status, status)
        return format_html('<span style="color: {};">{}</span>', color, name)
    sla_status_display.short_description = 'SLA статус'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('hiring_plan', 'vacancy', 'position_type').prefetch_related('grades', 'applied_kpi_okr_blocks')


@admin.register(PlanMetrics)
class PlanMetricsAdmin(admin.ModelAdmin):
    list_display = ['hiring_plan', 'total_positions', 'total_headcount_needed', 'total_headcount_hired', 'completion_rate', 'last_updated']
    list_filter = ['last_updated']
    search_fields = ['hiring_plan__title']
    readonly_fields = ['last_updated']
    ordering = ['-last_updated']
    
    fieldsets = (
        ('План найма', {
            'fields': ('hiring_plan',)
        }),
        ('Счетчики', {
            'fields': ('total_positions', 'total_headcount_needed', 'total_headcount_hired')
        }),
        ('Прогресс', {
            'fields': ('completion_rate',)
        }),
        ('Метаданные', {
            'fields': ('last_updated',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('hiring_plan')


# Inline админы для удобства
class HiringPlanPositionInline(admin.TabularInline):
    model = HiringPlanPosition
    extra = 0
    fields = ['vacancy', 'position_type', 'headcount_needed', 'headcount_hired', 'priority', 'is_active']
    readonly_fields = ['fulfillment_rate']
    
    def fulfillment_rate(self, obj):
        if obj.pk:
            return f"{obj.fulfillment_rate:.1f}%"
        return "-"
    fulfillment_rate.short_description = 'Выполнение'


class PositionKPIOKRInline(admin.TabularInline):
    model = PositionKPIOKR
    extra = 0
    fields = ['name', 'metric_type', 'scope', 'target_value', 'actual_value', 'status']
    readonly_fields = ['achievement_rate']
    
    def achievement_rate(self, obj):
        if obj.pk:
            return f"{obj.achievement_rate:.1f}%"
        return "-"
    achievement_rate.short_description = 'Достижение'


# Добавляем inline'ы к HiringPlan
HiringPlanAdmin.inlines = [HiringPlanPositionInline, PositionKPIOKRInline]


@admin.register(VacancySLA)
class VacancySLAAdmin(admin.ModelAdmin):
    list_display = ['vacancy', 'grade', 'time_to_fill', 'time_to_hire', 'is_active', 'created_at']
    list_filter = ['vacancy', 'grade', 'is_active']
    search_fields = ['vacancy__name', 'grade__name']
    ordering = ['vacancy__name', 'grade__name']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('vacancy', 'grade')
        }),
        ('Целевые показатели', {
            'fields': ('time_to_fill', 'time_to_hire')
        }),
        ('Настройки', {
            'fields': ('is_active',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vacancy', 'grade')


@admin.register(HiringRequest)
class HiringRequestAdmin(admin.ModelAdmin):
    list_display = ['vacancy', 'grade', 'project', 'status', 'priority', 'opening_date', 'deadline', 'sla_status_display', 'days_in_progress']
    list_filter = ['status', 'priority', 'opening_reason', 'grade', 'vacancy', 'opening_date']
    search_fields = ['vacancy__name', 'candidate_name', 'candidate_id', 'notes', 'project']
    readonly_fields = ['sla_status_display', 'sla_compliance', 'days_in_progress', 'is_overdue', 'created_at', 'updated_at']
    ordering = ['-opening_date', 'priority']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('vacancy', 'grade', 'project', 'priority', 'opening_reason')
        }),
        ('Статус и даты', {
            'fields': ('status', 'opening_date', 'deadline', 'closed_date', 'sla_status_display', 'sla_compliance', 'days_in_progress', 'is_overdue')
        }),
        ('SLA', {
            'fields': ('sla',),
            'classes': ('collapse',)
        }),
        ('Кандидат', {
            'fields': ('candidate_id', 'candidate_name'),
            'classes': ('collapse',)
        }),
        ('Дополнительно', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sla_status_display(self, obj):
        status = obj.sla_status_display
        status_colors = {
            'В срок': 'green',
            'С задержкой': 'orange',
            'Просрочено': 'red',
            'Нормально': 'blue',
            'Риск просрочки': 'orange',
            'Нет SLA': 'gray'
        }
        color = status_colors.get(status, 'gray')
        return format_html('<span style="color: {};">{}</span>', color, status)
    sla_status_display.short_description = 'SLA статус'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'vacancy', 'grade', 'sla', 'created_by'
        )


# Настройка админки
admin.site.site_header = "HR Helper - Администрирование"
admin.site.site_title = "HR Helper Admin"
admin.site.index_title = "Управление системой HR Helper"