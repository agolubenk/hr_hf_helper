from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Interviewer, InterviewRule
from .serializers import (
    InterviewerSerializer, InterviewerCreateSerializer, InterviewerListSerializer,
    InterviewRuleSerializer, InterviewRuleCreateSerializer, InterviewerStatsSerializer
)


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
        interviewer = self.get_object()
        interviewer.is_active = not interviewer.is_active
        interviewer.save()
        
        serializer = InterviewerSerializer(interviewer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """Получение только активных интервьюеров"""
        active_interviewers = self.get_queryset().filter(is_active=True)
        serializer = InterviewerListSerializer(active_interviewers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='with-calendar')
    def with_calendar(self, request):
        """Получение интервьюеров с настроенным календарем"""
        interviewers_with_calendar = self.get_queryset().filter(
            is_active=True,
            calendar_link__isnull=False
        ).exclude(calendar_link='')
        
        serializer = InterviewerListSerializer(interviewers_with_calendar, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по интервьюерам"""
        total_interviewers = Interviewer.objects.count()
        active_interviewers = Interviewer.objects.filter(is_active=True).count()
        inactive_interviewers = total_interviewers - active_interviewers
        interviewers_with_calendar = Interviewer.objects.filter(
            is_active=True,
            calendar_link__isnull=False
        ).exclude(calendar_link='').count()
        
        # Последние добавленные интервьюеры
        recent_interviewers = Interviewer.objects.order_by('-created_at')[:5]
        recent_serializer = InterviewerListSerializer(recent_interviewers, many=True)
        
        return Response({
            'total_interviewers': total_interviewers,
            'active_interviewers': active_interviewers,
            'inactive_interviewers': inactive_interviewers,
            'interviewers_with_calendar': interviewers_with_calendar,
            'recent_interviewers': recent_serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """Поиск интервьюеров"""
        query = request.query_params.get('q', '')
        is_active = request.query_params.get('is_active')
        has_calendar = request.query_params.get('has_calendar')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(middle_name__icontains=query) |
                Q(email__icontains=query)
            )
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if has_calendar is not None:
            if has_calendar.lower() == 'true':
                queryset = queryset.filter(
                    calendar_link__isnull=False
                ).exclude(calendar_link='')
            else:
                queryset = queryset.filter(
                    Q(calendar_link__isnull=True) | Q(calendar_link='')
                )
        
        serializer = InterviewerListSerializer(queryset, many=True)
        return Response(serializer.data)


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
        rule = self.get_object()
        InterviewRule.activate_rule(rule.id)
        
        serializer = InterviewRuleSerializer(rule)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """Получение активного правила"""
        active_rule = InterviewRule.get_active_rule()
        if active_rule:
            serializer = InterviewRuleSerializer(active_rule)
            return Response(serializer.data)
        return Response({'message': 'Нет активного правила'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='check-grade')
    def check_grade(self, request, pk=None):
        """Проверка, подходит ли грейд для правила"""
        rule = self.get_object()
        grade_id = request.data.get('grade_id')
        
        if not grade_id:
            return Response({'error': 'grade_id обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from apps.finance.models import Grade
            grade = Grade.objects.get(id=grade_id)
            is_in_range = rule.is_grade_in_range(grade)
            
            return Response({
                'grade_name': grade.name,
                'rule_name': rule.name,
                'is_in_range': is_in_range,
                'grade_range': rule.get_grade_range()
            })
        except Grade.DoesNotExist:
            return Response({'error': 'Грейд не найден'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по правилам"""
        total_rules = InterviewRule.objects.count()
        active_rules = InterviewRule.objects.filter(is_active=True).count()
        inactive_rules = total_rules - active_rules
        
        return Response({
            'total_rules': total_rules,
            'active_rules': active_rules,
            'inactive_rules': inactive_rules
        })
