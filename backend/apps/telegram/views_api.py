from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import TelegramUser, AuthAttempt
from .serializers import (
    TelegramUserSerializer, AuthAttemptSerializer, TelegramStatsSerializer
)
from logic.integration.telegram.telegram_api import (
    TelegramUserViewSet as LogicTelegramUserViewSet,
    AuthAttemptViewSet as LogicAuthAttemptViewSet,
    TelegramWebhookViewSet as LogicTelegramWebhookViewSet
)

User = get_user_model()


class TelegramUserViewSet(LogicTelegramUserViewSet):
    """
    ViewSet для управления пользователями Telegram - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - TelegramUser.objects: пользователи Telegram
    - TelegramUserSerializer: сериализатор для пользователей Telegram
    
    ОБРАБОТКА:
    - Наследование от LogicTelegramUserViewSet
    - Фильтрация по статусу авторизации
    - Поиск по username, first_name, last_name
    - Сортировка по дате обновления
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с данными пользователей Telegram
    
    СВЯЗИ:
    - Использует: LogicTelegramUserViewSet, TelegramUserSerializer
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_authorized']
    search_fields = ['username', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']


class AuthAttemptViewSet(LogicAuthAttemptViewSet):
    """
    ViewSet для просмотра попыток авторизации Telegram - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - AuthAttempt.objects: попытки авторизации Telegram
    - AuthAttemptSerializer: сериализатор для попыток авторизации
    
    ОБРАБОТКА:
    - Наследование от LogicAuthAttemptViewSet
    - Фильтрация по статусу авторизации
    - Поиск по phone, code
    - Сортировка по дате создания
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с данными попыток авторизации
    
    СВЯЗИ:
    - Использует: LogicAuthAttemptViewSet, AuthAttemptSerializer
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['phone', 'code']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class TelegramWebhookViewSet(LogicTelegramWebhookViewSet):
    """
    ViewSet для обработки webhook Telegram - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP POST запросы с данными webhook
    - Telegram webhook данные
    
    ИСТОЧНИКИ ДАННЫХ:
    - Telegram webhook API
    - TelegramUser.objects: пользователи Telegram
    
    ОБРАБОТКА:
    - Наследование от LogicTelegramWebhookViewSet
    - Обработка входящих webhook от Telegram
    - Обновление данных пользователей Telegram
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с результатом обработки webhook
    
    СВЯЗИ:
    - Использует: LogicTelegramWebhookViewSet, Telegram webhook API
    - Передает: DRF API responses
    - Может вызываться из: Telegram webhook endpoints
    """
    permission_classes = []  # Webhook не требует аутентификации