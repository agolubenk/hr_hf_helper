from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import ChatSession, ChatMessage
from .logic.serializers import (
    ChatSessionSerializer, ChatSessionDetailSerializer, 
    ChatSessionCreateSerializer, ChatMessageSerializer,
    ChatMessageCreateSerializer, GeminiApiRequestSerializer,
    GeminiStatsSerializer
)
from .logic.services import GeminiService
from .logic.message_handlers import MessageApiHandler
from .logic.api_handlers import ApiKeyApiHandler
from .logic.stats_handlers import StatsApiHandler

User = get_user_model()


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сессиями чата с Gemini"""
    
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatSessionDetailSerializer
        elif self.action == 'create':
            return ChatSessionCreateSerializer
        return ChatSessionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Отправить сообщение в сессию чата"""
        session = self.get_object()
        serializer = ChatMessageCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Используем общий обработчик для отправки сообщения
                result = MessageApiHandler.send_message_viewset_handler(
                    session, 
                    serializer.validated_data['content'], 
                    request.user
                )
                
                if result['success']:
                    # Получаем созданные сообщения для сериализации
                    user_message = ChatMessage.objects.get(id=result['user_message_id'])
                    assistant_message = ChatMessage.objects.get(id=result['assistant_message_id'])
                    
                    return Response({
                        'user_message': ChatMessageSerializer(user_message).data,
                        'assistant_message': ChatMessageSerializer(assistant_message).data
                    })
                else:
                    return Response(
                        {'error': result['error']}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Получить все сообщения сессии"""
        session = self.get_object()
        messages = session.messages.all().order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def clear_history(self, request, pk=None):
        """Очистить историю сообщений сессии"""
        session = self.get_object()
        session.messages.all().delete()
        return Response({'status': 'history_cleared'})
    
    @action(detail=False, methods=['get'])
    def my_sessions(self, request):
        """Получить сессии текущего пользователя"""
        sessions = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Получить статистику чатов"""
        try:
            # Используем общий обработчик для получения статистики
            stats = StatsApiHandler.get_stats_handler({}, request)
            
            if 'error' in stats:
                return Response(
                    {'error': stats['error']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра сообщений чата"""
    
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatMessage.objects.filter(session__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Получить последние сообщения"""
        messages = self.get_queryset().order_by('-timestamp')[:20]
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class GeminiApiViewSet(viewsets.ViewSet):
    """ViewSet для работы с Gemini API"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def analyze_text(self, request):
        """Анализ текста с помощью Gemini"""
        serializer = GeminiApiRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                gemini_service = GeminiService()
                result = gemini_service.analyze_text(
                    serializer.validated_data['text'],
                    serializer.validated_data.get('prompt', ''),
                    serializer.validated_data.get('max_tokens', 1000)
                )
                return Response(result)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def generate_response(self, request):
        """Генерация ответа с помощью Gemini"""
        serializer = GeminiApiRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                gemini_service = GeminiService()
                result = gemini_service.generate_response(
                    serializer.validated_data['text'],
                    serializer.validated_data.get('prompt', ''),
                    serializer.validated_data.get('max_tokens', 1000)
                )
                return Response(result)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Получить статистику использования Gemini API"""
        try:
            # Используем общий обработчик для получения статистики
            stats = StatsApiHandler.get_stats_handler({}, request)
            
            if 'error' in stats:
                return Response(
                    {'error': stats['error']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
