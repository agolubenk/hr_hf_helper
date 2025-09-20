from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer, ChatSessionDetailSerializer, 
    ChatSessionCreateSerializer, ChatMessageSerializer,
    ChatMessageCreateSerializer, GeminiApiRequestSerializer,
    GeminiStatsSerializer
)
from .services import GeminiService

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
                gemini_service = GeminiService()
                
                # Создаем сообщение пользователя
                user_message = ChatMessage.objects.create(
                    session=session,
                    role='user',
                    content=serializer.validated_data['content']
                )
                
                # Получаем ответ от Gemini
                response = gemini_service.send_message(
                    session, serializer.validated_data['content']
                )
                
                # Создаем сообщение ассистента
                assistant_message = ChatMessage.objects.create(
                    session=session,
                    role='assistant',
                    content=response['content'],
                    tokens_used=response.get('tokens_used', 0),
                    response_time=response.get('response_time', 0)
                )
                
                return Response({
                    'user_message': ChatMessageSerializer(user_message).data,
                    'assistant_message': ChatMessageSerializer(assistant_message).data
                })
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
            sessions = self.get_queryset()
            total_sessions = sessions.count()
            total_messages = ChatMessage.objects.filter(session__in=sessions).count()
            total_tokens = sum(
                ChatMessage.objects.filter(session__in=sessions)
                .values_list('tokens_used', flat=True)
            )
            
            stats = {
                'total_sessions': total_sessions,
                'total_messages': total_messages,
                'total_tokens': total_tokens,
                'average_messages_per_session': total_messages / total_sessions if total_sessions > 0 else 0,
                'average_tokens_per_session': total_tokens / total_sessions if total_sessions > 0 else 0,
            }
            
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
            sessions = ChatSession.objects.filter(user=request.user)
            total_sessions = sessions.count()
            total_messages = ChatMessage.objects.filter(session__in=sessions).count()
            total_tokens = sum(
                ChatMessage.objects.filter(session__in=sessions)
                .values_list('tokens_used', flat=True)
            )
            
            stats = {
                'total_sessions': total_sessions,
                'total_messages': total_messages,
                'total_tokens': total_tokens,
                'average_messages_per_session': total_messages / total_sessions if total_sessions > 0 else 0,
                'average_tokens_per_message': total_tokens / total_messages if total_messages > 0 else 0,
                'recent_sessions': ChatSessionSerializer(
                    sessions.order_by('-created_at')[:5], many=True
                ).data
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
