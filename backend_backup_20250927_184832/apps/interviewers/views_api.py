from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Interviewer, InterviewRule
from .logic.serializers import (
    InterviewerSerializer, InterviewerCreateSerializer, InterviewerListSerializer,
    InterviewRuleSerializer, InterviewRuleCreateSerializer, InterviewerStatsSerializer
)
from .logic.interviewers_handlers import InterviewerApiHandler
from .logic.rules_handlers import RuleApiHandler


class InterviewerViewSet(viewsets.ModelViewSet):
    """ViewSet для управления интервьюерами"""
    queryset = Interviewer.objects.all()
    serializer_class = InterviewerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['first_name', 'last_name', 'middle_name', 'email']
    ordering_fields = ['first_name', 'last_name', 'email', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return InterviewerCreateSerializer
        elif self.action == 'list':
            return InterviewerListSerializer
        return InterviewerSerializer
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Переключение активности интервьюера"""
        # Используем общий обработчик для переключения активности
        result = InterviewerApiHandler.toggle_active_handler({'pk': pk}, request)
        
        if result['success']:
            interviewer = self.get_object()
            serializer = InterviewerSerializer(interviewer)
            return Response(serializer.data)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """Получение только активных интервьюеров"""
        # Используем общий обработчик для получения активных интервьюеров
        result = InterviewerApiHandler.get_active_handler({}, request)
        
        if result['success']:
            serializer = InterviewerListSerializer(result['interviewers'], many=True)
            return Response(serializer.data)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='with-calendar')
    def with_calendar(self, request):
        """Получение интервьюеров с настроенным календарем"""
        # Используем общий обработчик для получения интервьюеров с календарем
        result = InterviewerApiHandler.get_with_calendar_handler({}, request)
        
        if result['success']:
            serializer = InterviewerListSerializer(result['interviewers'], many=True)
            return Response(serializer.data)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по интервьюерам"""
        # Используем общий обработчик для получения статистики
        result = InterviewerApiHandler.get_stats_handler({}, request)
        
        if result['success']:
            recent_serializer = InterviewerListSerializer(result['recent_interviewers'], many=True)
            return Response({
                'total_interviewers': result['total_interviewers'],
                'active_interviewers': result['active_interviewers'],
                'inactive_interviewers': result['inactive_interviewers'],
                'interviewers_with_calendar': result['interviewers_with_calendar'],
                'recent_interviewers': recent_serializer.data
            })
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """Поиск интервьюеров"""
        # Используем общий обработчик для поиска интервьюеров
        result = InterviewerApiHandler.search_handler({
            'q': request.query_params.get('q', ''),
            'is_active': request.query_params.get('is_active'),
            'has_calendar': request.query_params.get('has_calendar')
        }, request)
        
        if result['success']:
            serializer = InterviewerListSerializer(result['interviewers'], many=True)
            return Response(serializer.data)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )


class InterviewRuleViewSet(viewsets.ModelViewSet):
    """ViewSet для управления правилами привлечения интервьюеров"""
    queryset = InterviewRule.objects.all()
    serializer_class = InterviewRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return InterviewRuleCreateSerializer
        return InterviewRuleSerializer
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """Активация правила (деактивация всех остальных)"""
        # Используем общий обработчик для активации правила
        result = RuleApiHandler.activate_handler({'pk': pk}, request)
        
        if result['success']:
            rule = self.get_object()
            serializer = InterviewRuleSerializer(rule)
            return Response(serializer.data)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """Получение активного правила"""
        # Используем общий обработчик для получения активного правила
        result = RuleApiHandler.get_active_handler({}, request)
        
        if result['success']:
            serializer = InterviewRuleSerializer(result['rule'])
            return Response(serializer.data)
        else:
            return Response(
                {'message': result['message']},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='check-grade')
    def check_grade(self, request, pk=None):
        """Проверка, подходит ли грейд для правила"""
        # Используем общий обработчик для проверки грейда
        result = RuleApiHandler.check_grade_handler({
            'pk': pk,
            'grade_id': request.data.get('grade_id')
        }, request)
        
        if result['success']:
            return Response(result)
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST if 'grade_id' in result['message'] else status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по правилам"""
        # Используем общий обработчик для получения статистики
        result = RuleApiHandler.get_stats_handler({}, request)
        
        if result['success']:
            return Response({
                'total_rules': result['total_rules'],
                'active_rules': result['active_rules'],
                'inactive_rules': result['inactive_rules']
            })
        else:
            return Response(
                {'error': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
