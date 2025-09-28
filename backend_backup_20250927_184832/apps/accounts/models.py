from __future__ import annotations
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


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
