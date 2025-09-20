from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import TelegramUser, AuthAttempt

User = get_user_model()


class TelegramChatViewSet(viewsets.ModelViewSet):
    """ViewSet для управления чатами Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_chats(self, request):
        """Получение чатов текущего пользователя"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            return Response({
                'success': True,
                'message': 'Функция в разработке'
            })
        except TelegramUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Telegram пользователь не найден'
            }, status=status.HTTP_404_NOT_FOUND)


# TelegramMessageViewSet временно отключен из-за конфликта с существующей таблицей
# class TelegramMessageViewSet(viewsets.ModelViewSet):
#     """ViewSet для управления сообщениями Telegram"""
#     queryset = TelegramMessage.objects.all()
#     
#     @action(detail=False, methods=['get'])
#     def my_messages(self, request):
#         """Получение сообщений текущего пользователя"""
#         try:
#             telegram_user = TelegramUser.objects.get(user=request.user)
#             messages = TelegramMessage.objects.filter(telegram_user=telegram_user)[:50]
#             return Response({
#                 'success': True,
#                 'messages': [{
#                     'id': msg.id,
#                     'text': msg.text,
#                     'date': msg.date,
#                     'is_outgoing': msg.is_outgoing
#                 } for msg in messages]
#             })
#         except TelegramUser.DoesNotExist:
#             return Response({
#                 'success': False,
#                 'error': 'Telegram пользователь не найден'
#             }, status=status.HTTP_404_NOT_FOUND)


class TelegramContactViewSet(viewsets.ModelViewSet):
    """ViewSet для управления контактами Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_contacts(self, request):
        """Получение контактов текущего пользователя"""
        return Response({
            'success': True,
            'message': 'Функция в разработке'
        })


class TelegramSessionViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сессиями Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_session(self, request):
        """Получение информации о сессии текущего пользователя"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            return Response({
                'success': True,
                'session': {
                    'is_authorized': telegram_user.is_authorized,
                    'session_name': telegram_user.session_name,
                    'auth_date': telegram_user.auth_date,
                    'telegram_id': telegram_user.telegram_id,
                    'username': telegram_user.username
                }
            })
        except TelegramUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Telegram пользователь не найден'
            }, status=status.HTTP_404_NOT_FOUND)


class TelegramBotViewSet(viewsets.ModelViewSet):
    """ViewSet для управления ботами Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['get'])
    def bot_info(self, request):
        """Получение информации о боте"""
        return Response({
            'success': True,
            'message': 'Функция в разработке'
        })


class TelegramAutomationViewSet(viewsets.ModelViewSet):
    """ViewSet для управления автоматизацией Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_automations(self, request):
        """Получение автоматизаций текущего пользователя"""
        return Response({
            'success': True,
            'message': 'Функция в разработке'
        })


class TelegramLogViewSet(viewsets.ModelViewSet):
    """ViewSet для управления логами Telegram"""
    queryset = AuthAttempt.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_logs(self, request):
        """Получение логов текущего пользователя"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            attempts = AuthAttempt.objects.filter(telegram_user=telegram_user)[:20]
            return Response({
                'success': True,
                'logs': [{
                    'id': attempt.id,
                    'attempt_type': attempt.attempt_type,
                    'status': attempt.status,
                    'error_message': attempt.error_message,
                    'created_at': attempt.created_at
                } for attempt in attempts]
            })
        except TelegramUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Telegram пользователь не найден'
            }, status=status.HTTP_404_NOT_FOUND)


class TelegramApiViewSet(viewsets.ModelViewSet):
    """ViewSet для API операций Telegram"""
    queryset = TelegramUser.objects.all()
    
    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        """Тестирование подключения к Telegram"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            from .telegram_client import run_telegram_auth_async
            
            result = run_telegram_auth_async(telegram_user.id, "check_auth")
            
            return Response({
                'success': True,
                'connected': result,
                'message': 'Подключение проверено'
            })
        except TelegramUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Telegram пользователь не найден'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)