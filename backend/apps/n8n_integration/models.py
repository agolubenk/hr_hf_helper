from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class N8NWebhook(models.Model):
    """
    Модель для хранения настроек n8n webhook'ов
    """
    name = models.CharField(
        _("Название"),
        max_length=255,
        help_text="Название webhook для идентификации"
    )
    webhook_url = models.URLField(
        _("URL webhook"),
        max_length=500,
        help_text="Полный URL webhook в n8n"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='n8n_webhooks',
        verbose_name=_("Пользователь"),
        help_text="Пользователь, которому принадлежит webhook"
    )
    is_active = models.BooleanField(
        _("Активен"),
        default=True,
        help_text="Включен ли webhook"
    )
    description = models.TextField(
        _("Описание"),
        blank=True,
        null=True,
        help_text="Описание назначения webhook"
    )
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)
    
    class Meta:
        verbose_name = _("n8n Webhook")
        verbose_name_plural = _("n8n Webhooks")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"


class N8NRequest(models.Model):
    """
    Модель для логирования запросов к n8n
    """
    REQUEST_TYPES = [
        ('webhook', 'Webhook'),
        ('api', 'API'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('success', 'Успешно'),
        ('error', 'Ошибка'),
    ]
    
    webhook = models.ForeignKey(
        N8NWebhook,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests',
        verbose_name=_("Webhook"),
        help_text="Связанный webhook (если применимо)"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='n8n_requests',
        verbose_name=_("Пользователь")
    )
    request_type = models.CharField(
        _("Тип запроса"),
        max_length=20,
        choices=REQUEST_TYPES,
        default='webhook'
    )
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    url = models.URLField(
        _("URL"),
        max_length=500,
        help_text="URL запроса"
    )
    method = models.CharField(
        _("Метод"),
        max_length=10,
        default='POST',
        help_text="HTTP метод (GET, POST, PUT, DELETE)"
    )
    request_data = models.JSONField(
        _("Данные запроса"),
        default=dict,
        blank=True,
        null=True,
        help_text="Данные, отправленные в n8n"
    )
    response_data = models.JSONField(
        _("Данные ответа"),
        default=dict,
        blank=True,
        null=True,
        help_text="Данные, полученные от n8n"
    )
    response_status_code = models.IntegerField(
        _("HTTP статус код"),
        null=True,
        blank=True,
        help_text="HTTP статус код ответа"
    )
    error_message = models.TextField(
        _("Сообщение об ошибке"),
        blank=True,
        null=True,
        help_text="Текст ошибки, если запрос не удался"
    )
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)
    
    class Meta:
        verbose_name = _("n8n Запрос")
        verbose_name_plural = _("n8n Запросы")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['webhook', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.request_type} - {self.status} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"


class N8NIncomingData(models.Model):
    """
    Модель для хранения данных, полученных от n8n
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='n8n_incoming_data',
        verbose_name=_("Пользователь")
    )
    source = models.CharField(
        _("Источник"),
        max_length=255,
        help_text="Источник данных (webhook URL или идентификатор)"
    )
    data = models.JSONField(
        _("Данные"),
        default=dict,
        help_text="Данные, полученные от n8n"
    )
    headers = models.JSONField(
        _("Заголовки"),
        default=dict,
        blank=True,
        null=True,
        help_text="HTTP заголовки запроса"
    )
    processed = models.BooleanField(
        _("Обработано"),
        default=False,
        help_text="Обработаны ли данные"
    )
    processed_at = models.DateTimeField(
        _("Обработано в"),
        null=True,
        blank=True,
        help_text="Время обработки данных"
    )
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    
    class Meta:
        verbose_name = _("Входящие данные n8n")
        verbose_name_plural = _("Входящие данные n8n")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'processed']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Данные от {self.source} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"
