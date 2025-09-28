"""API для работы с Telegram"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from logic.base.api_views import BaseAPIViewSet
from logic.base.response_handler import UnifiedResponseHandler
from logic.utilities.context_helpers import PermissionHelper
from apps.telegram.models import TelegramUser, AuthAttempt
from apps.telegram.serializers import (
    TelegramUserSerializer, AuthAttemptSerializer, TelegramStatsSerializer
)


class TelegramUserViewSet(BaseAPIViewSet):
    """ViewSet для управления пользователями Telegram"""
    queryset = TelegramUser.objects.all()
    serializer_class = TelegramUserSerializer
    
    def get_queryset(self):
        """Фильтрация queryset по пользователю"""
        queryset = super().get_queryset()
        return PermissionHelper.get_user_accessible_objects(queryset, self.request.user, 'user')
    
    def create(self, request, *args, **kwargs):
        """Создание пользователя Telegram"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                # Привязываем к текущему пользователю
                serializer.save(user=request.user)
                
                response_data = UnifiedResponseHandler.success_response(
                    serializer.data, 
                    "Пользователь Telegram успешно создан"
                )
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                response_data = UnifiedResponseHandler.error_response(
                    "Ошибка валидации данных", 
                    400
                )
                response_data['errors'] = serializer.errors
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='sync-auth')
    def sync_auth(self, request, pk=None):
        """Синхронизация авторизации Telegram"""
        try:
            telegram_user = self.get_object()
            
            # Запускаем синхронизацию авторизации
            from apps.telegram.demo_telegram_client import run_telegram_auth_sync
            auth_result = run_telegram_auth_sync(telegram_user)
            
            if auth_result.get('success'):
                # Обновляем данные пользователя
                telegram_user.refresh_from_db()
                serializer = self.get_serializer(telegram_user)
                
                response_data = UnifiedResponseHandler.success_response(
                    serializer.data,
                    "Авторизация Telegram успешно синхронизирована"
                )
                return Response(response_data)
            else:
                response_data = UnifiedResponseHandler.error_response(
                    auth_result.get('message', 'Ошибка синхронизации авторизации'),
                    400
                )
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='logout')
    def logout(self, request, pk=None):
        """Выход из Telegram"""
        try:
            telegram_user = self.get_object()
            
            # Сбрасываем данные авторизации
            telegram_user.telegram_id = None
            telegram_user.username = None
            telegram_user.first_name = None
            telegram_user.last_name = None
            telegram_user.phone = None
            telegram_user.is_authorized = False
            telegram_user.save()
            
            serializer = self.get_serializer(telegram_user)
            response_data = UnifiedResponseHandler.success_response(
                serializer.data,
                "Вы успешно вышли из Telegram"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='test-connection')
    def test_connection(self, request):
        """Тестирование подключения к Telegram"""
        try:
            user = request.user
            
            # Получаем TelegramUser
            telegram_user = TelegramUser.objects.filter(user=user).first()
            
            if not telegram_user or not telegram_user.is_authorized:
                response_data = UnifiedResponseHandler.error_response(
                    "Пользователь не авторизован в Telegram",
                    400
                )
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
            # Здесь должна быть логика тестирования подключения
            # Пока возвращаем заглушку
            user_info = {
                'id': telegram_user.telegram_id,
                'username': telegram_user.username,
                'first_name': telegram_user.first_name,
                'last_name': telegram_user.last_name
            }
            
            response_data = UnifiedResponseHandler.success_response(
                user_info,
                "Подключение к Telegram успешно"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AuthAttemptViewSet(BaseAPIViewSet):
    """ViewSet для просмотра попыток авторизации Telegram"""
    queryset = AuthAttempt.objects.all()
    serializer_class = AuthAttemptSerializer
    
    def get_queryset(self):
        """Фильтрация queryset по пользователю"""
        queryset = super().get_queryset()
        return PermissionHelper.get_user_accessible_objects(queryset, self.request.user, 'user')
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по попыткам авторизации"""
        try:
            queryset = self.get_queryset()
            
            # Основная статистика
            total_attempts = queryset.count()
            
            # Статистика по статусам
            from django.db.models import Count
            by_status = dict(
                queryset.values('status')
                .annotate(count=Count('id'))
                .values_list('status', 'count')
            )
            
            # Последние попытки
            recent_attempts = queryset.order_by('-created_at')[:10]
            recent_serializer = AuthAttemptSerializer(recent_attempts, many=True)
            
            stats_data = {
                'total_attempts': total_attempts,
                'by_status': by_status,
                'recent_attempts': recent_serializer.data
            }
            
            response_data = UnifiedResponseHandler.success_response(
                stats_data,
                "Статистика попыток авторизации получена"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TelegramWebhookViewSet(BaseAPIViewSet):
    """ViewSet для обработки webhook Telegram"""
    serializer_class = None  # Webhook не использует сериализаторы
    
    def get_queryset(self):
        """Webhook не использует queryset"""
        return AuthAttempt.objects.none()
    
    @action(detail=False, methods=['post'], url_path='webhook')
    def webhook(self, request):
        """Обработка webhook от Telegram"""
        try:
            import json
            
            # Получаем данные из webhook
            webhook_data = request.data
            
            # Здесь должна быть логика обработки webhook
            # Пока просто логируем полученные данные
            import logging
            logger = logging.getLogger('apps.telegram')
            logger.info(f"Получен webhook от Telegram: {webhook_data}")
            
            response_data = UnifiedResponseHandler.success_response(
                {'webhook_data': webhook_data},
                "Webhook обработан успешно"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
