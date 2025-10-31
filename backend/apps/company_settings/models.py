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

