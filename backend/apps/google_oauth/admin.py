from django.contrib import admin
from django.utils.html import format_html
from .models import GoogleOAuthAccount, SyncSettings, Invite, ScorecardPathSettings, SlotsSettings, HRScreening, QuestionTemplate


@admin.register(GoogleOAuthAccount)
class GoogleOAuthAccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'user', 'is_token_valid', 'last_sync_at', 'created_at']
    list_filter = ['created_at', 'updated_at', 'last_sync_at']
    search_fields = ['name', 'email', 'user__username', 'user__email']
    readonly_fields = ['google_id', 'created_at', 'updated_at', 'last_sync_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'google_id', 'email', 'name', 'picture_url')
        }),
        ('Токены', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at'),
            'classes': ('collapse',)
        }),
        ('Разрешения', {
            'fields': ('scopes',),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at', 'last_sync_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_token_valid(self, obj):
        if obj.is_token_valid():
            return format_html('<span style="color: green;">✅ Действителен</span>')
        else:
            return format_html('<span style="color: red;">❌ Истек</span>')
    is_token_valid.short_description = 'Статус токена'


@admin.register(ScorecardPathSettings)
class ScorecardPathSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user',)
        }),
        ('Структура папок', {
            'fields': ('folder_structure',),
            'description': 'JSON структура для определения пути сохранения scorecard файлов'
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(SlotsSettings)
class SlotsSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_week_prefix', 'next_week_prefix', 'all_slots_prefix', 'separator_text', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user',)
        }),
        ('Настройки текста', {
            'fields': ('current_week_prefix', 'next_week_prefix', 'all_slots_prefix', 'separator_text'),
            'description': 'Настройки дополнительного текста для слотов при копировании'
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'candidate_name', 'vacancy_title', 'interview_datetime', 
        'status', 'has_gemini_data', 'created_at'
    ]
    list_filter = [
        'status', 'created_at', 'updated_at', 'interview_datetime'
    ]
    search_fields = [
        'candidate_name', 'vacancy_title', 'candidate_id', 'vacancy_id',
        'user__username', 'user__email'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'candidate_id', 'vacancy_id',
        'google_drive_folder_id', 'google_drive_file_id', 'calendar_event_id'
    ]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'status', 'candidate_url', 'interview_datetime')
        }),
        ('Информация о кандидате', {
            'fields': ('candidate_id', 'candidate_name', 'candidate_grade')
        }),
        ('Информация о вакансии', {
            'fields': ('vacancy_id', 'vacancy_title', 'scorecard_template_url')
        }),
        ('Исходные данные', {
            'fields': ('original_form_data',),
            'description': 'Весь текст, введенный пользователем в комбинированную форму'
        }),
        ('Анализ времени от Gemini AI', {
            'fields': ('gemini_suggested_datetime',),
            'classes': ('collapse',),
            'description': 'Время интервью, определенное Gemini AI на основе анализа исходного текста и слотов'
        }),
        ('Google Drive', {
            'fields': ('google_drive_folder_id', 'google_drive_file_id', 'google_drive_file_url'),
            'classes': ('collapse',)
        }),
        ('Google Calendar', {
            'fields': ('calendar_event_id', 'calendar_event_url', 'google_meet_url'),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_gemini_data(self, obj):
        """Показывает, есть ли анализ времени от Gemini AI"""
        if obj.gemini_suggested_datetime:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✅ Есть</span>'
            )
        else:
            return format_html(
                '<span style="color: #6c757d;">❌ Нет</span>'
            )
    has_gemini_data.short_description = 'Анализ времени'
    has_gemini_data.admin_order_field = 'gemini_suggested_datetime'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('user')
    
    def get_readonly_fields(self, request, obj=None):
        """Делаем некоторые поля только для чтения при редактировании"""
        readonly = list(self.readonly_fields)
        if obj:  # Редактирование существующего объекта
            readonly.extend([
                'candidate_url', 'candidate_id', 'candidate_name', 'candidate_grade',
                'vacancy_id', 'vacancy_title', 'original_form_data'
            ])
        return readonly


# Админки для API моделей удалены - данные теперь кэшируются в Redis


@admin.register(HRScreening)
class HRScreeningAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'candidate_name', 'vacancy_title', 
        'has_gemini_analysis', 'extracted_salary_display', 'determined_grade', 'created_at'
    ]
    list_filter = [
        'created_at', 'updated_at'
    ]
    search_fields = [
        'candidate_name', 'vacancy_title', 'candidate_id', 'vacancy_id',
        'user__username', 'user__email', 'input_data'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'candidate_id', 'vacancy_id',
        'candidate_url', 'gemini_analysis', 'extracted_salary', 'salary_currency',
        'determined_grade', 'huntflow_grade_id'
    ]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'input_data')
        }),
        ('Информация о кандидате', {
            'fields': ('candidate_id', 'candidate_name', 'candidate_grade')
        }),
        ('Информация о вакансии', {
            'fields': ('vacancy_id', 'vacancy_title')
        }),
        ('Ссылки', {
            'fields': ('candidate_url',),
            'classes': ('collapse',)
        }),
        ('Анализ от Gemini AI', {
            'fields': ('gemini_analysis',),
            'classes': ('collapse',),
            'description': 'JSON ответ от Gemini AI с данными для обновления кандидата'
        }),
        ('Извлеченная информация о зарплате', {
            'fields': ('extracted_salary', 'salary_currency'),
            'description': 'Автоматически извлеченная информация о зарплате'
        }),
        ('Определенный грейд', {
            'fields': ('determined_grade', 'huntflow_grade_id'),
            'description': 'Грейд, определенный на основе зарплатных вилок из @vacancies/'
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_gemini_analysis(self, obj):
        """Показывает, есть ли анализ от Gemini AI"""
        if obj.gemini_analysis:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✅ Есть</span>'
            )
        else:
            return format_html(
                '<span style="color: #6c757d;">❌ Нет</span>'
            )
    has_gemini_analysis.short_description = 'Анализ Gemini'
    has_gemini_analysis.admin_order_field = 'gemini_analysis'
    
    def extracted_salary_display(self, obj):
        """Отображает извлеченную зарплату с валютой"""
        if obj.extracted_salary:
            return f"{obj.extracted_salary} {obj.salary_currency}"
        return "-"
    extracted_salary_display.short_description = 'Зарплата'
    extracted_salary_display.admin_order_field = 'extracted_salary'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('user')
    
    def get_readonly_fields(self, request, obj=None):
        """Делаем некоторые поля только для чтения при редактировании"""
        readonly = list(self.readonly_fields)
        if obj:  # Редактирование существующего объекта
            readonly.extend([
                'candidate_url', 'candidate_id', 'candidate_name', 'candidate_grade',
                'vacancy_id', 'vacancy_title', 'input_data'
            ])
        return readonly


@admin.register(QuestionTemplate)
class QuestionTemplateAdmin(admin.ModelAdmin):
    list_display = ['country', 'created_at', 'updated_at']
    list_filter = ['country', 'created_at', 'updated_at']
    search_fields = ['country', 'questions']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('country',)
        }),
        ('Вопросы', {
            'fields': ('questions',),
            'description': 'Вопросы для данной страны, разделенные переносами строк'
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request)