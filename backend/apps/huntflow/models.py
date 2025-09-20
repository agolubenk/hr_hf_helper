from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class HuntflowCache(models.Model):
    """
    Кэш для данных Huntflow API
    """
    cache_key = models.CharField(_("Ключ кэша"), max_length=255, unique=True)
    data = models.JSONField(_("Данные"), default=dict)
    created_at = models.DateTimeField(_("Создано"), default=timezone.now)
    updated_at = models.DateTimeField(_("Обновлено"), default=timezone.now)
    expires_at = models.DateTimeField(_("Истекает"), null=True, blank=True)
    
    class Meta:
        verbose_name = _("Кэш Huntflow")
        verbose_name_plural = _("Кэш Huntflow")
        ordering = ("-updated_at",)
    
    def __str__(self):
        return f"{self.cache_key} ({self.updated_at.strftime('%d.%m.%Y %H:%M')})"
    
    @property
    def is_expired(self):
        """Проверяет, истек ли кэш"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
    
    @property
    def age_minutes(self):
        """Возвращает возраст кэша в минутах"""
        return int((timezone.now() - self.updated_at).total_seconds() / 60)


class HuntflowLog(models.Model):
    """
    Лог операций с Huntflow API
    """
    LOG_TYPES = [
        ('GET', 'Получение данных'),
        ('POST', 'Создание'),
        ('PATCH', 'Обновление'),
        ('DELETE', 'Удаление'),
        ('ERROR', 'Ошибка'),
    ]
    
    log_type = models.CharField(_("Тип операции"), max_length=10, choices=LOG_TYPES)
    endpoint = models.CharField(_("Эндпоинт"), max_length=500)
    method = models.CharField(_("HTTP метод"), max_length=10)
    status_code = models.IntegerField(_("Код ответа"), null=True, blank=True)
    request_data = models.JSONField(_("Данные запроса"), default=dict, blank=True)
    response_data = models.JSONField(_("Данные ответа"), default=dict, blank=True)
    error_message = models.TextField(_("Сообщение об ошибке"), blank=True)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, verbose_name=_("Пользователь"))
    created_at = models.DateTimeField(_("Создано"), default=timezone.now)
    
    class Meta:
        verbose_name = _("Лог Huntflow")
        verbose_name_plural = _("Логи Huntflow")
        ordering = ("-created_at",)
    
    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.status_code or 'ERROR'} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"
    
    @property
    def is_success(self):
        """Проверяет, был ли запрос успешным"""
        return self.status_code and 200 <= self.status_code < 300
    
    @property
    def is_error(self):
        """Проверяет, была ли ошибка"""
        return self.log_type == 'ERROR' or (self.status_code and self.status_code >= 400)
