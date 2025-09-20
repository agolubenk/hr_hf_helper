from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from .models import Vacancy
from .serializers import (
    VacancySerializer, VacancyCreateSerializer, VacancyListSerializer,
    VacancyStatsSerializer
)

User = get_user_model()


class VacancyViewSet(viewsets.ModelViewSet):
    """ViewSet для управления вакансиями"""
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['recruiter', 'is_active', 'available_grades']
    search_fields = ['name', 'external_id', 'invite_title', 'scorecard_title']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return VacancyCreateSerializer
        elif self.action == 'list':
            return VacancyListSerializer
        return VacancySerializer
    
    def get_queryset(self):
        """Фильтрация queryset в зависимости от прав пользователя"""
        user = self.request.user
        queryset = super().get_queryset()
        
        # Если пользователь не админ и не рекрутер, показываем только связанные вакансии
        if not user.is_superuser and not user.is_admin and not user.is_recruiter:
            queryset = queryset.filter(recruiter=user)
        
        return queryset
    
    def perform_create(self, serializer):
        """Создание вакансии с назначением текущего пользователя как рекрутера"""
        user = self.request.user
        if not user.is_superuser and not user.is_admin:
            serializer.save(recruiter=user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'], url_path='my-vacancies')
    def my_vacancies(self, request):
        """Получение вакансий текущего пользователя"""
        user = request.user
        vacancies = self.get_queryset().filter(recruiter=user)
        serializer = VacancyListSerializer(vacancies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Переключение активности вакансии"""
        vacancy = self.get_object()
        vacancy.is_active = not vacancy.is_active
        vacancy.save()
        
        serializer = VacancySerializer(vacancy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='assign-grades')
    def assign_grades(self, request, pk=None):
        """Назначение грейдов вакансии"""
        vacancy = self.get_object()
        grade_ids = request.data.get('grade_ids', [])
        
        try:
            from apps.finance.models import Grade
            grades = Grade.objects.filter(id__in=grade_ids)
            vacancy.available_grades.set(grades)
            
            serializer = VacancySerializer(vacancy)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по вакансиям"""
        total_vacancies = Vacancy.objects.count()
        active_vacancies = Vacancy.objects.filter(is_active=True).count()
        inactive_vacancies = total_vacancies - active_vacancies
        
        # Статистика по рекрутерам
        recruiter_stats = Vacancy.objects.values('recruiter__username').annotate(
            count=Count('id'),
            active_count=Count('id', filter=Q(is_active=True))
        )
        
        # Статистика по грейдам
        grade_stats = Vacancy.objects.values('available_grades__name').annotate(
            count=Count('id', distinct=True)
        ).exclude(available_grades__name__isnull=True)
        
        # Последние вакансии
        recent_vacancies = Vacancy.objects.order_by('-created_at')[:5]
        recent_serializer = VacancyListSerializer(recent_vacancies, many=True)
        
        return Response({
            'total_vacancies': total_vacancies,
            'active_vacancies': active_vacancies,
            'inactive_vacancies': inactive_vacancies,
            'vacancies_by_recruiter': {
                item['recruiter__username']: {
                    'total': item['count'],
                    'active': item['active_count']
                }
                for item in recruiter_stats
            },
            'vacancies_by_grade': {
                item['available_grades__name']: item['count']
                for item in grade_stats
            },
            'recent_vacancies': recent_serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """Поиск вакансий с расширенными параметрами"""
        query = request.query_params.get('q', '')
        grade_id = request.query_params.get('grade_id')
        recruiter_id = request.query_params.get('recruiter_id')
        is_active = request.query_params.get('is_active')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(invite_title__icontains=query) |
                Q(scorecard_title__icontains=query) |
                Q(external_id__icontains=query)
            )
        
        if grade_id:
            queryset = queryset.filter(available_grades__id=grade_id)
        
        if recruiter_id:
            queryset = queryset.filter(recruiter__id=recruiter_id)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Пагинация
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = VacancyListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = VacancyListSerializer(queryset, many=True)
        return Response(serializer.data)
