from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import re

User = get_user_model()


class HuntflowCandidateUpdate(models.Model):
    """
    Модель для хранения обновленных данных кандидатов из Huntflow
    """
    # Основная информация
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='huntflow_candidate_updates',
        verbose_name=_("Пользователь"),
        help_text="Пользователь, которому принадлежат данные"
    )
    huntflow_candidate_id = models.IntegerField(
        _("ID кандидата в Huntflow"),
        unique=True,
        db_index=True,
        help_text="Уникальный ID кандидата в системе Huntflow"
    )
    
    # Персональные данные
    last_name = models.CharField(
        _("Фамилия"),
        max_length=255,
        blank=True,
        null=True
    )
    first_name = models.CharField(
        _("Имя"),
        max_length=255,
        blank=True,
        null=True
    )
    middle_name = models.CharField(
        _("Отчество"),
        max_length=255,
        blank=True,
        null=True
    )
    
    # Контактная информация
    phone = models.CharField(
        _("Телефон"),
        max_length=50,
        blank=True,
        null=True
    )
    email = models.EmailField(
        _("Email"),
        blank=True,
        null=True
    )
    telegram = models.CharField(
        _("Telegram"),
        max_length=255,
        blank=True,
        null=True
    )
    
    # Дополнительная информация
    source = models.CharField(
        _("Источник"),
        max_length=255,
        blank=True,
        null=True,
        help_text="Источник кандидата"
    )
    salary_expectations = models.CharField(
        _("Зарплатные ожидания"),
        max_length=255,
        blank=True,
        null=True
    )
    birth_date = models.DateField(
        _("Дата рождения"),
        blank=True,
        null=True
    )
    resume = models.TextField(
        _("Резюме"),
        blank=True,
        null=True,
        help_text="Текст резюме или ссылка на резюме"
    )
    level = models.CharField(
        _("Уровень"),
        max_length=100,
        blank=True,
        null=True,
        help_text="Уровень кандидата (Junior, Middle, Senior и т.д.)"
    )
    scorecard = models.TextField(
        _("Scorecard"),
        blank=True,
        null=True,
        help_text="Данные scorecard"
    )
    
    # Обработанные поля (с логикой преобразования)
    office_format = models.CharField(
        _("Офисный формат"),
        max_length=255,
        blank=True,
        null=True,
        help_text="Формат работы (офис/удаленно/гибрид)"
    )
    office = models.CharField(
        _("Офис"),
        max_length=255,
        blank=True,
        null=True,
        help_text="Название офиса"
    )
    full_time = models.CharField(
        _("Полный рабочий день"),
        max_length=255,
        blank=True,
        null=True,
        help_text="Информация о полном рабочем дне"
    )
    
    # Дополнительные поля
    distribution = models.CharField(
        _("Распределение"),
        max_length=255,
        blank=True,
        null=True
    )
    army = models.CharField(
        _("Армия"),
        max_length=255,
        blank=True,
        null=True
    )
    relocation = models.CharField(
        _("Релокация"),
        max_length=255,
        blank=True,
        null=True
    )
    job_change_reason = models.CharField(
        _("Причина смены работы"),
        max_length=500,
        blank=True,
        null=True
    )
    start_date = models.CharField(
        _("Сроки выхода"),
        max_length=255,
        blank=True,
        null=True,
        help_text="Сроки выхода на работу"
    )
    communication_channel = models.CharField(
        _("Где ведется коммуникация"),
        max_length=255,
        blank=True,
        null=True
    )
    pl_contract_type = models.CharField(
        _("Для PL - UoP/B2B?"),
        max_length=50,
        blank=True,
        null=True,
        help_text="Тип контракта для Польши (UoP/B2B)"
    )
    
    # Системные поля
    raw_data = models.JSONField(
        _("Исходные данные"),
        default=dict,
        blank=True,
        help_text="Исходные данные из Huntflow API"
    )
    last_synced_at = models.DateTimeField(
        _("Последняя синхронизация"),
        auto_now=True,
        help_text="Время последней синхронизации с Huntflow"
    )
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)
    
    class Meta:
        verbose_name = _("Обновление кандидата из Huntflow")
        verbose_name_plural = _("Обновления кандидатов из Huntflow")
        ordering = ['-last_synced_at']
        indexes = [
            models.Index(fields=['user', 'huntflow_candidate_id']),
            models.Index(fields=['last_synced_at']),
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
        ]
    
    def __str__(self):
        name_parts = [self.last_name, self.first_name, self.middle_name]
        name = ' '.join([part for part in name_parts if part])
        return f"{name or 'Без имени'} (ID: {self.huntflow_candidate_id})"
    
    def process_office_fields(self):
        """
        Обработка полей "Офисный формат" и "Полный рабочий день"
        согласно бизнес-логике:
        - Если в поле "Полный рабочий день" есть "| Офис:", 
          то в поле "Офисный формат" переносим значение из поля "Офис" (да/нет),
          затем разделяя знаком | переносим текст между "Офис:" и "Полный рабочий день".
        - Содержимое поля "Полный рабочий день" сокращаем, 
          оставляя только текст после "Полный рабочий день:"
        """
        if not self.full_time:
            return
        
        # Проверяем наличие паттерна "| Офис:" в поле "Полный рабочий день"
        if '| Офис:' in self.full_time:
            # Разделяем по "| Офис:"
            parts = self.full_time.split('| Офис:')
            
            if len(parts) >= 2:
                # Первая часть - до "| Офис:"
                before_office = parts[0].strip()
                
                # Вторая часть - после "| Офис:"
                after_office = parts[1].strip()
                
                # Ищем паттерн "Полный рабочий день:" во второй части
                if 'Полный рабочий день:' in after_office:
                    # Разделяем по "Полный рабочий день:"
                    office_and_fulltime = after_office.split('Полный рабочий день:')
                    
                    if len(office_and_fulltime) >= 2:
                        # Часть между "Офис:" и "Полный рабочий день:"
                        office_value = office_and_fulltime[0].strip()
                        
                        # Часть после "Полный рабочий день:"
                        fulltime_value = office_and_fulltime[1].strip()
                        
                        # Формируем значение для "Офисный формат"
                        # Берем значение из поля "Офис" (да/нет), затем добавляем через | значение между "Офис:" и "Полный рабочий день:"
                        office_format_parts = []
                        
                        # Добавляем значение из поля "Офис" если оно есть
                        if self.office:
                            office_format_parts.append(self.office)
                        
                        # Добавляем значение между "Офис:" и "Полный рабочий день:"
                        if office_value:
                            office_format_parts.append(office_value)
                        
                        # Объединяем через |
                        if office_format_parts:
                            self.office_format = ' | '.join(office_format_parts)
                        
                        # Обновляем поле "Полный рабочий день" - оставляем только текст после "Полный рабочий день:"
                        self.full_time = fulltime_value
                else:
                    # Если нет "Полный рабочий день:" во второй части, 
                    # просто переносим значение между "Офис:" и концом строки
                    office_format_parts = []
                    
                    if self.office:
                        office_format_parts.append(self.office)
                    
                    if after_office:
                        office_format_parts.append(after_office)
                    
                    if office_format_parts:
                        self.office_format = ' | '.join(office_format_parts)
                    
                    # Оставляем первую часть в "Полный рабочий день"
                    self.full_time = before_office
    
    def save(self, *args, **kwargs):
        """
        Переопределяем save для автоматической обработки полей
        """
        # Обрабатываем поля перед сохранением
        self.process_office_fields()
        super().save(*args, **kwargs)


class HuntflowSyncLog(models.Model):
    """
    Модель для логирования синхронизаций с Huntflow
    """
    STATUS_CHOICES = [
        ('started', 'Начата'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершена'),
        ('error', 'Ошибка'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='huntflow_sync_logs',
        verbose_name=_("Пользователь")
    )
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=STATUS_CHOICES,
        default='started'
    )
    started_at = models.DateTimeField(
        _("Начата в"),
        auto_now_add=True
    )
    completed_at = models.DateTimeField(
        _("Завершена в"),
        null=True,
        blank=True
    )
    candidates_processed = models.IntegerField(
        _("Обработано кандидатов"),
        default=0
    )
    candidates_created = models.IntegerField(
        _("Создано кандидатов"),
        default=0
    )
    candidates_updated = models.IntegerField(
        _("Обновлено кандидатов"),
        default=0
    )
    errors_count = models.IntegerField(
        _("Количество ошибок"),
        default=0
    )
    error_message = models.TextField(
        _("Сообщение об ошибке"),
        blank=True,
        null=True
    )
    last_processed_candidate_id = models.IntegerField(
        _("Последний обработанный ID кандидата"),
        null=True,
        blank=True,
        help_text="ID последнего обработанного кандидата для продолжения синхронизации"
    )
    
    class Meta:
        verbose_name = _("Лог синхронизации Huntflow")
        verbose_name_plural = _("Логи синхронизации Huntflow")
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['started_at']),
        ]
    
    def __str__(self):
        return f"Синхронизация {self.user.username} - {self.get_status_display()} ({self.started_at.strftime('%d.%m.%Y %H:%M')})"
