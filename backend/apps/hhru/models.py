"""
Модели для интеграции с HeadHunter.ru API

ВХОДЯЩИЕ ДАННЫЕ: OAuth токены, настройки подключения, данные профиля
ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru OAuth API, пользовательские настройки
ОБРАБОТКА: Хранение токенов доступа, настроек подключения, данных профиля
ВЫХОДЯЩИЕ ДАННЫЕ: Модели для работы с HH.ru API
СВЯЗИ: User (accounts.User)
ФОРМАТ: Django модели
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta

User = get_user_model()


class HHRUAccount(models.Model):
    """
    Модель для хранения подключения к HeadHunter.ru через OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: user, OAuth токены, данные профиля
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru OAuth API
    ОБРАБОТКА: Хранение токенов доступа и обновления, данных профиля
    ВЫХОДЯЩИЕ ДАННЫЕ: Модель подключения к HH.ru
    СВЯЗИ: User (OneToOne)
    ФОРМАТ: Django модель
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='hhru_account',
        verbose_name=_("Пользователь")
    )
    
    # OAuth данные
    access_token = models.TextField(
        verbose_name=_("Access Token"),
        help_text=_("Токен доступа для работы с API")
    )
    refresh_token = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Refresh Token"),
        help_text=_("Токен для обновления access_token")
    )
    token_expires_at = models.DateTimeField(
        verbose_name=_("Токен истекает"),
        help_text=_("Время истечения токена доступа")
    )
    
    # Данные профиля HH.ru
    hh_user_id = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("HH User ID"),
        help_text=_("Уникальный идентификатор пользователя на HH.ru")
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("Email")
    )
    first_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Имя")
    )
    last_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Фамилия")
    )
    middle_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Отчество")
    )
    
    # Метаданные
    is_employer = models.BooleanField(
        default=False,
        verbose_name=_("Работодатель"),
        help_text=_("Является ли пользователь работодателем")
    )
    is_admin = models.BooleanField(
        default=False,
        verbose_name=_("Администратор"),
        help_text=_("Является ли пользователь администратором аккаунта работодателя")
    )
    
    # Дополнительные данные профиля (JSON)
    profile_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Данные профиля"),
        help_text=_("Дополнительные данные профиля из HH.ru API")
    )
    
    # Временные метки
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Создано")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Обновлено")
    )
    last_sync_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_("Последняя синхронизация")
    )
    
    class Meta:
        verbose_name = _("HH.ru аккаунт")
        verbose_name_plural = _("HH.ru аккаунты")
        ordering = ['-created_at']
    
    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip() or self.email or self.hh_user_id
        return f"{name} ({self.hh_user_id})"
    
    def is_token_valid(self):
        """Проверяет, действителен ли токен доступа"""
        if not self.token_expires_at:
            return False
        
        # Если token_expires_at - строка, конвертируем в datetime
        if isinstance(self.token_expires_at, str):
            try:
                parsed_time = timezone.datetime.fromisoformat(
                    self.token_expires_at.replace('Z', '+00:00')
                )
                self.token_expires_at = parsed_time
                self.save(update_fields=['token_expires_at'])
            except (ValueError, TypeError):
                return False
        
        return timezone.now() < self.token_expires_at
    
    def needs_refresh(self):
        """Проверяет, нужно ли обновить токен"""
        if not self.token_expires_at:
            return True
        
        # Если token_expires_at - строка, конвертируем в datetime
        if isinstance(self.token_expires_at, str):
            try:
                self.token_expires_at = timezone.datetime.fromisoformat(
                    self.token_expires_at.replace('Z', '+00:00')
                )
            except (ValueError, TypeError):
                return True
        
        # Обновляем токен за 5 минут до истечения
        return timezone.now() > (self.token_expires_at - timedelta(minutes=5))


class HHRUAPILog(models.Model):
    """
    Лог операций с HeadHunter.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: endpoint, method, request_data, response_data
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru API запросы
    ОБРАБОТКА: Логирование всех запросов к API
    ВЫХОДЯЩИЕ ДАННЫЕ: История запросов в базе данных
    СВЯЗИ: User, HHRUAccount
    ФОРМАТ: Django модель
    """
    
    LOG_TYPES = [
        ('GET', 'Получение данных'),
        ('POST', 'Создание'),
        ('PUT', 'Обновление'),
        ('PATCH', 'Частичное обновление'),
        ('DELETE', 'Удаление'),
        ('ERROR', 'Ошибка'),
    ]
    
    log_type = models.CharField(
        _("Тип операции"),
        max_length=10,
        choices=LOG_TYPES
    )
    endpoint = models.CharField(
        _("Эндпоинт"),
        max_length=500
    )
    method = models.CharField(
        _("HTTP метод"),
        max_length=10
    )
    status_code = models.IntegerField(
        _("Код ответа"),
        null=True,
        blank=True
    )
    request_data = models.JSONField(
        _("Данные запроса"),
        default=dict,
        blank=True
    )
    response_data = models.JSONField(
        _("Данные ответа"),
        default=dict,
        blank=True
    )
    error_message = models.TextField(
        _("Сообщение об ошибке"),
        blank=True
    )
    
    # Связи
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name=_("Пользователь"),
        related_name='hhru_api_logs'
    )
    account = models.ForeignKey(
        HHRUAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("HH.ru аккаунт"),
        related_name='api_logs'
    )
    
    # Временные метки
    created_at = models.DateTimeField(
        _("Создано"),
        default=timezone.now
    )
    
    class Meta:
        verbose_name = _("Лог HH.ru API")
        verbose_name_plural = _("Логи HH.ru API")
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['account', '-created_at']),
            models.Index(fields=['log_type', '-created_at']),
        ]
    
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


class HHRUConfiguration(models.Model):
    """
    Конфигурация подключения к HeadHunter.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: client_id, client_secret, redirect_uri
    ИСТОЧНИКИ ДАННЫХ: Настройки приложения на HH.ru
    ОБРАБОТКА: Хранение настроек OAuth приложения
    ВЫХОДЯЩИЕ ДАННЫЕ: Конфигурация для авторизации
    СВЯЗИ: User (опционально, для персональных настроек)
    ФОРМАТ: Django модель
    """
    
    # OAuth настройки приложения
    client_id = models.CharField(
        max_length=200,
        verbose_name=_("Client ID"),
        help_text=_("Идентификатор клиента OAuth приложения")
    )
    client_secret = models.CharField(
        max_length=200,
        verbose_name=_("Client Secret"),
        help_text=_("Секретный ключ OAuth приложения")
    )
    redirect_uri = models.URLField(
        verbose_name=_("Redirect URI"),
        help_text=_("URI для перенаправления после авторизации")
    )
    
    # Пользователь (опционально, для персональных настроек)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_("Пользователь"),
        related_name='hhru_configurations',
        help_text=_("Если указан, настройки применяются только для этого пользователя")
    )
    
    # Метаданные
    name = models.CharField(
        max_length=200,
        verbose_name=_("Название"),
        help_text=_("Название конфигурации")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Активна"),
        help_text=_("Использовать ли эту конфигурацию")
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("По умолчанию"),
        help_text=_("Конфигурация по умолчанию")
    )
    
    # Временные метки
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Создано")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Обновлено")
    )
    
    class Meta:
        verbose_name = _("Конфигурация HH.ru")
        verbose_name_plural = _("Конфигурации HH.ru")
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.client_id})"
    
    @classmethod
    def get_default(cls, user=None):
        """
        Получает конфигурацию по умолчанию для пользователя
        
        Приоритет:
        1. Персональная конфигурация пользователя (is_default=True)
        2. Персональная конфигурация пользователя (любая активная)
        3. Глобальная конфигурация (is_default=True)
        4. Глобальная конфигурация (любая активная)
        """
        if user:
            # Сначала ищем персональную конфигурацию пользователя по умолчанию
            user_default_config = cls.objects.filter(
                user=user,
                is_active=True,
                is_default=True
            ).first()
            if user_default_config:
                return user_default_config
            
            # Затем ищем любую активную персональную конфигурацию пользователя
            user_config = cls.objects.filter(user=user, is_active=True).first()
            if user_config:
                return user_config
        
        # Ищем глобальную конфигурацию по умолчанию
        global_default_config = cls.objects.filter(
            user__isnull=True,
            is_active=True,
            is_default=True
        ).first()
        if global_default_config:
            return global_default_config
        
        # Ищем любую активную глобальную конфигурацию
        return cls.objects.filter(
            user__isnull=True,
            is_active=True
        ).first()

