from __future__ import annotations
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta


class SystemChoice(models.TextChoices):
    PROD = "prod", _("Прод")
    SANDBOX = "sandbox", _("Песочница")


class User(AbstractUser):
    """
    Минимально расширяем AbstractUser, чтобы не плодить профиль.
    Роли управляются через стандартные Group.
    Поля, о которых просили: Gemini API, Huntflow prod/sandbox (url+api), telegram, выбор системы.
    Для интервьюеров и наблюдателей используем группы + дополнительные поля.
    """
    # Общие доп.поля
    full_name = models.CharField(_("ФИО"), max_length=255, blank=True)
    telegram_username = models.CharField(_("Никнейм Telegram"), max_length=64, blank=True)

    # Интеграции
    gemini_api_key = models.CharField(_("API ключ Gemini"), max_length=256, blank=True)
    clickup_api_key = models.CharField(_("API ключ ClickUp"), max_length=256, blank=True)
    notion_integration_token = models.CharField(_("Integration токен Notion"), max_length=256, blank=True)

    huntflow_prod_url = models.URLField(_("Huntflow прод: ссылка"), blank=True)
    huntflow_prod_api_key = models.CharField(_("Huntflow прод: API ключ"), max_length=256, blank=True)

    huntflow_sandbox_url = models.URLField(_("Huntflow песочница: ссылка"), blank=True)
    huntflow_sandbox_api_key = models.CharField(_("Huntflow песочница: API ключ"), max_length=256, blank=True)

    active_system = models.CharField(
        _("Активная система"),
        max_length=16,
        choices=SystemChoice.choices,
        default=SystemChoice.SANDBOX,
    )

    # Поля для ролей
    interviewer_calendar_url = models.URLField(_("Ссылка на календарь интервьюера"), blank=True)
    # email для интервьюера используем стандартное поле `email`

    is_observer_active = models.BooleanField(_("Статус наблюдателя"), default=False)

    # Настройки рабочего времени для интервью
    interview_start_time = models.TimeField(
        _("Начало рабочего времени для интервью"), 
        default="09:00",
        help_text="Время начала рабочего дня для планирования интервью"
    )
    interview_end_time = models.TimeField(
        _("Конец рабочего времени для интервью"), 
        default="18:00",
        help_text="Время окончания рабочего дня для планирования интервью"
    )

    # Новые поля для токенной системы Huntflow
    huntflow_access_token = models.TextField(_("Access token для Huntflow API"), blank=True, help_text="Access token для Huntflow API")
    huntflow_refresh_token = models.TextField(_("Refresh token для Huntflow API"), blank=True, help_text="Refresh token для Huntflow API")
    huntflow_token_expires_at = models.DateTimeField(_("Время истечения access token"), null=True, blank=True, help_text="Время истечения access token")
    huntflow_refresh_expires_at = models.DateTimeField(_("Время истечения refresh token"), null=True, blank=True, help_text="Время истечения refresh token")

    class Meta(AbstractUser.Meta):
        swappable = "AUTH_USER_MODEL"

    def save(self, *args, **kwargs):
        # Автозаполнение ФИО, если пусто, из first_name/last_name
        if not self.full_name:
            self.full_name = " ".join(filter(None, [self.last_name, self.first_name])).strip()
        super().save(*args, **kwargs)

    @property
    def is_admin(self) -> bool:
        return self.is_superuser or self.groups.filter(name="Администраторы").exists()

    @property
    def is_recruiter(self) -> bool:
        return self.groups.filter(name="Рекрутеры").exists()

    @property
    def is_interviewer(self) -> bool:
        return self.groups.filter(name="Интервьюеры").exists()

    @property
    def is_observer(self) -> bool:
        return self.groups.filter(name="Наблюдатели").exists()

    @property
    def is_huntflow_token_valid(self):
        """Проверяет валидность access token"""
        if not self.huntflow_access_token or not self.huntflow_token_expires_at:
            return False
        return timezone.now() < self.huntflow_token_expires_at
    
    @property
    def is_huntflow_refresh_valid(self):
        """Проверяет валидность refresh token"""
        if not self.huntflow_refresh_token or not self.huntflow_refresh_expires_at:
            return False
        return timezone.now() < self.huntflow_refresh_expires_at
    
    def set_huntflow_tokens(self, access_token, refresh_token, expires_in=604800, refresh_expires_in=1209600):
        """
        Устанавливает токены Huntflow
        
        Args:
            access_token: Access token
            refresh_token: Refresh token
            expires_in: Время жизни access token в секундах (по умолчанию 7 дней)
            refresh_expires_in: Время жизни refresh token в секундах (по умолчанию 14 дней)
        """
        self.huntflow_access_token = access_token
        self.huntflow_refresh_token = refresh_token
        self.huntflow_token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        self.huntflow_refresh_expires_at = timezone.now() + timedelta(seconds=refresh_expires_in)
        self.save(update_fields=[
            'huntflow_access_token', 
            'huntflow_refresh_token', 
            'huntflow_token_expires_at', 
            'huntflow_refresh_expires_at'
        ])
