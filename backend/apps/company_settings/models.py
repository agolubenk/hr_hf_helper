"""
Модели для настроек компании
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxLengthValidator
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class CompanySettings(models.Model):
    """Настройки компании - синглтон модель"""
    
    # Название компании
    company_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Название компании',
        help_text='Название вашей компании'
    )
    
    # Главный календарь компании (ID календаря Google Calendar)
    main_calendar_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='ID главного календаря',
        help_text='ID календаря Google Calendar для компании'
    )
    
    # Оргструктура организации (JSON)
    org_structure = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Оргструктура',
        help_text='Организационная структура компании в формате JSON'
    )
    
    # Цветовая тема компании
    THEME_CHOICES = [
        ('light', _('Светлая')),
        ('dark', _('Тёмная')),
        ('auto', _('Автоматическая (по системе)')),
    ]
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='auto',
        verbose_name='Тема оформления',
        help_text='Цветовая тема интерфейса'
    )
    
    # Активные грейды компании
    active_grades = models.ManyToManyField(
        'finance.Grade',
        blank=True,
        verbose_name='Активные грейды компании',
        help_text='Грейды, которые используются в вашей компании',
        related_name='company_settings'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Настройки компании'
        verbose_name_plural = 'Настройки компании'
    
    def __str__(self):
        return f"Настройки компании: {self.company_name or 'Без названия'}"
    
    def save(self, *args, **kwargs):
        # Принудительно устанавливаем ID=1 для синглтона
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Получает или создает настройки компании (синглтон)"""
        settings, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'company_name': '',
                'main_calendar_id': '',
                'org_structure': {},
                'theme': 'auto'
            }
        )
        return settings
    
    def get_active_grades_list(self):
        """Возвращает список активных грейдов компании"""
        return list(self.active_grades.all().values_list('name', flat=True))
    
    def get_active_grades_display(self):
        """Возвращает строку с активными грейдами для отображения"""
        grades = self.active_grades.all()
        if grades:
            return ', '.join([grade.name for grade in grades])
        return 'Не выбрано'
    
    @classmethod
    def get_active_grades(cls):
        """Получает активные грейды компании"""
        settings = cls.get_settings()
        return settings.active_grades.all()
    
    @classmethod
    def is_grade_active(cls, grade):
        """
        Проверяет, является ли грейд активным для компании
        
        Args:
            grade: Объект Grade или название грейда (str)
        
        Returns:
            bool
        """
        settings = cls.get_settings()
        
        if isinstance(grade, str):
            # Если передан строковый идентификатор, ищем по имени
            return settings.active_grades.filter(name=grade).exists()
        else:
            # Если передан объект Grade
            return settings.active_grades.filter(id=grade.id).exists()


class RejectionTemplate(models.Model):
    """Шаблоны стандартных ответов для отказа специалистам"""
    
    REJECTION_TYPE_CHOICES = [
        ('office_format', _('Офисный формат')),
        ('finance', _('Финансы')),
        ('finance_more', _('Финансы - больше')),
        ('finance_less', _('Финансы - меньше')),
        ('grade', _('Грейд')),
        ('general', _('Общий отказ')),
    ]
    
    rejection_type = models.CharField(
        max_length=20,
        choices=REJECTION_TYPE_CHOICES,
        verbose_name='Тип отказа',
        help_text='Тип причины отказа'
    )
    
    grade = models.ForeignKey(
        'finance.Grade',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Грейд',
        help_text='Грейд (заполняется только для типа "Грейд")',
        related_name='rejection_templates'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Название шаблона',
        help_text='Краткое название шаблона для идентификации'
    )
    
    message = models.TextField(
        verbose_name='Текст ответа',
        help_text='Текст стандартного ответа для отказа',
        validators=[MaxLengthValidator(5000)]
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Используется ли этот шаблон'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Шаблон отказа'
        verbose_name_plural = 'Шаблоны отказов'
        ordering = ['rejection_type', 'grade__name', 'title']
    
    def __str__(self):
        if self.rejection_type == 'grade' and self.grade:
            return f"{self.get_rejection_type_display()} - {self.grade.name}: {self.title}"
        return f"{self.get_rejection_type_display()}: {self.title}"
    
    def clean(self):
        """Валидация модели"""
        from django.core.exceptions import ValidationError
        
        # Для типа "grade" обязательно должно быть указано поле grade
        if self.rejection_type == 'grade' and not self.grade:
            raise ValidationError({
                'grade': _('Для типа отказа "Грейд" обязательно укажите грейд')
            })
        
        # Для других типов grade должен быть пустым
        if self.rejection_type != 'grade' and self.grade:
            raise ValidationError({
                'grade': _('Поле "Грейд" заполняется только для типа отказа "Грейд"')
            })
    
    @classmethod
    def get_template(cls, rejection_type, grade=None):
        """
        Получает шаблон отказа по типу и грейду
        
        Args:
            rejection_type: Тип отказа ('office_format', 'finance', 'grade', 'general')
            grade: Объект Grade (обязательно для типа 'grade')
        
        Returns:
            RejectionTemplate или None
        """
        queryset = cls.objects.filter(is_active=True, rejection_type=rejection_type)
        
        if rejection_type == 'grade':
            if not grade:
                return None
            queryset = queryset.filter(grade=grade)
        else:
            queryset = queryset.filter(grade__isnull=True)
        
        return queryset.first()
    
    @classmethod
    def get_templates_by_type(cls, rejection_type):
        """
        Получает все активные шаблоны указанного типа
        
        Args:
            rejection_type: Тип отказа
        
        Returns:
            QuerySet шаблонов
        """
        queryset = cls.objects.filter(is_active=True, rejection_type=rejection_type)
        
        if rejection_type != 'grade':
            queryset = queryset.filter(grade__isnull=True)
        
        return queryset.order_by('title')

