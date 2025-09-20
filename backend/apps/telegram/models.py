from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class TelegramUser(models.Model):
    """Модель для хранения пользователей Telegram"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='telegram_user',
        verbose_name='Пользователь'
    )
    telegram_id = models.BigIntegerField(
        unique=True, 
        null=True, 
        blank=True,
        verbose_name='Telegram ID'
    )
    username = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        verbose_name='Username'
    )
    first_name = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        verbose_name='Имя'
    )
    last_name = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        verbose_name='Фамилия'
    )
    phone = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        verbose_name='Телефон'
    )
    session_name = models.CharField(
        max_length=100, 
        unique=True,
        verbose_name='Имя сессии'
    )
    is_authorized = models.BooleanField(
        default=False,
        verbose_name='Авторизован'
    )
    auth_date = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name='Дата авторизации'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создан'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Обновлен'
    )
    
    # Поля для состояния клиента
    client_initialized = models.BooleanField(
        default=False,
        verbose_name='Клиент инициализирован'
    )
    qr_login_active = models.BooleanField(
        default=False,
        verbose_name='QR логин активен'
    )
    last_activity = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Последняя активность'
    )

    class Meta:
        verbose_name = 'Telegram пользователь'
        verbose_name_plural = 'Telegram пользователи'
        ordering = ['-created_at']

    def __str__(self):
        if self.telegram_id:
            return f"{self.user.username} - {self.telegram_id}"
        return f"{self.user.username} - не авторизован"

    def save(self, *args, **kwargs):
        if not self.session_name:
            self.session_name = f"user_{self.user.id}_{timezone.now().timestamp()}"
        super().save(*args, **kwargs)


class AuthAttempt(models.Model):
    """Модель для отслеживания попыток авторизации"""
    ATTEMPT_TYPES = [
        ('qr', 'QR Code'),
        ('phone', 'Phone'),
        ('2fa', 'Two Factor Auth')
    ]
    
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('success', 'Успешно'),
        ('failed', 'Ошибка'),
        ('timeout', 'Таймаут')
    ]
    
    telegram_user = models.ForeignKey(
        TelegramUser, 
        on_delete=models.CASCADE, 
        related_name='auth_attempts',
        verbose_name='Telegram пользователь'
    )
    attempt_type = models.CharField(
        max_length=20, 
        choices=ATTEMPT_TYPES,
        verbose_name='Тип попытки'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        verbose_name='Статус'
    )
    error_message = models.TextField(
        null=True, 
        blank=True,
        verbose_name='Сообщение об ошибке'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создана'
    )

    class Meta:
        verbose_name = 'Попытка авторизации'
        verbose_name_plural = 'Попытки авторизации'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.telegram_user} - {self.get_attempt_type_display()} - {self.get_status_display()}"


# TelegramMessage временно отключена из-за конфликта с существующей таблицей
# class TelegramMessage(models.Model):
#     """Модель для хранения сообщений (опционально)"""
#     telegram_user = models.ForeignKey(
#         TelegramUser, 
#         on_delete=models.CASCADE, 
#         related_name='messages',
#         verbose_name='Telegram пользователь'
#     )
#     message_id = models.BigIntegerField(verbose_name='ID сообщения')
#     chat_id = models.BigIntegerField(verbose_name='ID чата')
#     text = models.TextField(
#         null=True, 
#         blank=True,
#         verbose_name='Текст сообщения'
#     )
#     date = models.DateTimeField(verbose_name='Дата сообщения')
#     is_outgoing = models.BooleanField(
#         default=False,
#         verbose_name='Исходящее'
#     )
#     created_at = models.DateTimeField(
#         auto_now_add=True,
#         verbose_name='Создано'
#     )
# 
#     class Meta:
#         verbose_name = 'Telegram сообщение'
#         verbose_name_plural = 'Telegram сообщения'
#         unique_together = ['telegram_user', 'message_id', 'chat_id']
#         ordering = ['-date']
# 
#     def __str__(self):
#         return f"Message {self.message_id} from {self.telegram_user}"
