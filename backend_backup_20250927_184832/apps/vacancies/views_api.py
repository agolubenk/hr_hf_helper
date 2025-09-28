from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from .models import Vacancy
from .logic.serializers import (
    VacancySerializer, VacancyCreateSerializer, VacancyListSerializer,
    VacancyStatsSerializer
)
from .logic.vacancy_handlers import VacancyApiHandler
from .logic.response_handlers import ResponseHandler

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
        result = VacancyApiHandler.my_vacancies_handler({}, request)
        
        if result['success']:
            serializer = VacancyListSerializer(result['vacancies'], many=True)
            return Response(serializer.data)
        else:
            return ResponseHandler.api_error_response(result['message'])
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Переключение активности вакансии"""
        result = VacancyApiHandler.toggle_active_handler({'pk': pk}, request)
        
        if result['success']:
            vacancy = result['vacancy']
            serializer = VacancySerializer(vacancy)
            return Response(serializer.data)
        else:
            return ResponseHandler.api_error_response(result['message'])
    
    @action(detail=True, methods=['post'], url_path='assign-grades')
    def assign_grades(self, request, pk=None):
        """Назначение грейдов вакансии"""
        result = VacancyApiHandler.assign_grades_handler({
            'pk': pk,
            'grade_ids': request.data.get('grade_ids', [])
        }, request)
        
        if result['success']:
            vacancy = result['vacancy']
            serializer = VacancySerializer(vacancy)
            return Response(serializer.data)
        else:
            return ResponseHandler.api_error_response(result['message'])
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по вакансиям"""
        result = VacancyApiHandler.stats_handler({}, request)
        
        if result['success']:
            stats = result['stats']
            recent_serializer = VacancyListSerializer(stats['recent_vacancies'], many=True)
            
            return Response({
                'total_vacancies': stats['total_vacancies'],
                'active_vacancies': stats['active_vacancies'],
                'inactive_vacancies': stats['inactive_vacancies'],
                'vacancies_by_recruiter': stats['vacancies_by_recruiter'],
                'vacancies_by_grade': stats['vacancies_by_grade'],
                'recent_vacancies': recent_serializer.data
            })
        else:
            return ResponseHandler.api_error_response(result['message'])
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """Поиск вакансий с расширенными параметрами"""
        result = VacancyApiHandler.search_handler({
            'q': request.query_params.get('q', ''),
            'grade_id': request.query_params.get('grade_id'),
            'recruiter_id': request.query_params.get('recruiter_id'),
            'is_active': request.query_params.get('is_active')
        }, request)
        
        if result['success']:
            queryset = result['vacancies']
            
            # Пагинация
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = VacancyListSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = VacancyListSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return ResponseHandler.api_error_response(result['message'])
