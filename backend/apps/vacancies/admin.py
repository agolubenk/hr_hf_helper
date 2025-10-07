from django.contrib import admin
from django.utils.html import format_html
from .models import Vacancy, SalaryRange


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'external_id',
        'recruiter',
        'get_interviewers_count_display',
        'is_active_display',
        'created_at'
    ]
    
    list_filter = [
        'is_active',
        'recruiter',
        'created_at',
        'updated_at'
    ]
    
    search_fields = [
        'name',
        'external_id',
        'recruiter__first_name',
        'recruiter__last_name',
        'recruiter__email'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'external_id', 'recruiter', 'is_active')
        }),
        ('Инвайты', {
            'fields': ('invite_title', 'invite_text', 'invite_prompt'),
            'classes': ('collapse',)
        }),
        ('Scorecard', {
            'fields': ('scorecard_title', 'scorecard_link'),
            'classes': ('collapse',)
        }),
        ('Вопросы для интервью', {
            'fields': ('questions_belarus', 'questions_poland'),
            'classes': ('collapse',)
        }),
        ('Ссылки на вакансии по странам', {
            'fields': (
                'vacancy_link_belarus', 'vacancy_link_poland'
            ),
            'classes': ('collapse',),
            'description': 'Ссылки на вакансии в Беларуси и Польше'
        }),
        ('Промпты', {
            'fields': ('candidate_update_prompt',),
            'classes': ('collapse',)
        }),
        ('Настройки скринингов', {
            'fields': ('screening_duration',),
            'description': 'Настройки длительности скринингов для данной вакансии'
        }),
        ('Интервьюеры', {
            'fields': ('interviewers',),
            'description': 'Выберите интервьюеров для этой вакансии. Каждый интервьюер может быть привязан только к одной вакансии.'
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ['interviewers']
    
    ordering = ['-created_at']
    
    def get_interviewers_count_display(self, obj):
        """Отображение количества интервьюеров"""
        count = obj.get_interviewers_count()
        if count > 0:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">{} интервьюеров</span>',
                count
            )
        else:
            return format_html(
                '<span style="color: #6c757d;">Нет интервьюеров</span>'
            )
    get_interviewers_count_display.short_description = 'Интервьюеры'
    get_interviewers_count_display.admin_order_field = 'interviewers__count'
    
    def is_active_display(self, obj):
        """Отображение статуса активности"""
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✅ Активна</span>'
            )
        else:
            return format_html(
                '<span style="color: #6c757d;">❌ Неактивна</span>'
            )
    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('recruiter').prefetch_related('interviewers')
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """Ограничиваем выбор интервьюеров только активными"""
        if db_field.name == "interviewers":
            kwargs["queryset"] = db_field.related_model.objects.filter(is_active=True)
        return super().formfield_for_manytomany(db_field, request, **kwargs)


@admin.register(SalaryRange)
class SalaryRangeAdmin(admin.ModelAdmin):
    list_display = [
        'vacancy',
        'grade',
        'salary_display_usd',
        'salary_display_byn',
        'salary_display_pln',
        'salary_display_eur',
        'is_active_display',
        'updated_at'
    ]
    
    list_filter = [
        'is_active',
        'vacancy',
        'grade',
        'created_at',
        'updated_at'
    ]
    
    search_fields = [
        'vacancy__name',
        'grade__name'
    ]
    
    readonly_fields = [
        'salary_min_byn', 'salary_max_byn',
        'salary_min_pln', 'salary_max_pln',
        'salary_min_eur', 'salary_max_eur',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('vacancy', 'grade', 'is_active')
        }),
        ('Зарплата в USD (редактируемая)', {
            'fields': ('salary_min_usd', 'salary_max_usd'),
            'description': 'Введите зарплатную вилку в долларах США. Остальные валюты рассчитаются автоматически.'
        }),
        ('Зарплата в BYN (автоматически рассчитанная)', {
            'fields': ('salary_min_byn', 'salary_max_byn'),
            'classes': ('collapse',)
        }),
        ('Зарплата в PLN (автоматически рассчитанная)', {
            'fields': ('salary_min_pln', 'salary_max_pln'),
            'classes': ('collapse',)
        }),
        ('Зарплата в EUR (автоматически рассчитанная)', {
            'fields': ('salary_min_eur', 'salary_max_eur'),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['vacancy__name', 'grade__name']
    
    def salary_display_usd(self, obj):
        """Отображение зарплаты в USD"""
        return f"${obj.salary_min_usd} - ${obj.salary_max_usd}"
    salary_display_usd.short_description = 'Зарплата (USD)'
    
    def salary_display_byn(self, obj):
        """Отображение зарплаты в BYN"""
        if obj.salary_min_byn and obj.salary_max_byn:
            return f"{obj.salary_min_byn} - {obj.salary_max_byn} BYN"
        return "Не рассчитано"
    salary_display_byn.short_description = 'Зарплата (BYN)'
    
    def salary_display_pln(self, obj):
        """Отображение зарплаты в PLN"""
        if obj.salary_min_pln and obj.salary_max_pln:
            return f"{obj.salary_min_pln} - {obj.salary_max_pln} PLN"
        return "Не рассчитано"
    salary_display_pln.short_description = 'Зарплата (PLN)'
    
    def salary_display_eur(self, obj):
        """Отображение зарплаты в EUR"""
        if obj.salary_min_eur and obj.salary_max_eur:
            return f"{obj.salary_min_eur} - {obj.salary_max_eur} EUR"
        return "Не рассчитано"
    salary_display_eur.short_description = 'Зарплата (EUR)'
    
    
    def is_active_display(self, obj):
        """Отображение статуса активности"""
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✅ Активна</span>'
            )
        else:
            return format_html(
                '<span style="color: #6c757d;">❌ Неактивна</span>'
            )
    is_active_display.short_description = 'Статус'
    is_active_display.admin_order_field = 'is_active'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('vacancy', 'grade')
