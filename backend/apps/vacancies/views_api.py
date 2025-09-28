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
from logic.candidate.vacancy_api import VacancyViewSet as LogicVacancyViewSet
from logic.base.response_handler import UnifiedResponseHandler

User = get_user_model()


class VacancyViewSet(LogicVacancyViewSet):
    """
    ViewSet для управления вакансиями - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫЕ:
    - Vacancy.objects: все вакансии из базы данных
    - VacancySerializer, VacancyCreateSerializer, VacancyListSerializer, VacancyStatsSerializer
    
    ОБРАБОТКА:
    - Наследование от LogicVacancyViewSet
    - Настройка фильтрации, поиска и сортировки
    - Выбор сериализатора в зависимости от действия
    - Расширенные методы для работы с вакансиями
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с данными вакансий
    - JSON ответы через UnifiedResponseHandler
    
    СВЯЗИ:
    - Использует: LogicVacancyViewSet, VacancySerializer, UnifiedResponseHandler
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['recruiter', 'is_active', 'available_grades']
    search_fields = ['name', 'external_id', 'invite_title', 'scorecard_title']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """
        Выбор сериализатора в зависимости от действия
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - self.action: текущее действие ViewSet (create, list, retrieve, update, destroy)
        
        ИСТОЧНИКИ ДАННЫЕ:
        - self.action: действие ViewSet
        
        ОБРАБОТКА:
        - Проверка текущего действия
        - Возврат соответствующего сериализатора
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - Класс сериализатора (VacancyCreateSerializer, VacancyListSerializer, VacancySerializer)
        
        СВЯЗИ:
        - Использует: self.action
        - Передает: класс сериализатора
        - Может вызываться из: DRF ViewSet методы
        """
        if self.action == 'create':
            return VacancyCreateSerializer
        elif self.action == 'list':
            return VacancyListSerializer
        return VacancySerializer
    
    @action(detail=False, methods=['get'], url_path='my-vacancies')
    def my_vacancies(self, request):
        """
        Получение вакансий текущего пользователя
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - request.user: аутентифицированный пользователь
        
        ИСТОЧНИКИ ДАННЫЕ:
        - request.user: текущий пользователь
        - Vacancy.objects: вакансии пользователя
        
        ОБРАБОТКА:
        - Получение вакансий текущего пользователя
        - Фильтрация по recruiter=user
        - Сериализация данных
        - Формирование ответа через UnifiedResponseHandler
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - DRF Response с данными вакансий пользователя
        
        СВЯЗИ:
        - Использует: VacancyListSerializer, UnifiedResponseHandler
        - Передает: DRF Response
        - Может вызываться из: DRF API endpoints
        """
        try:
            user = request.user
            queryset = self.get_queryset().filter(recruiter=user)
            
            serializer = VacancyListSerializer(queryset, many=True)
            response_data = UnifiedResponseHandler.success_response(
                serializer.data,
                f"Найдено {len(serializer.data)} вакансий"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """
        Переключение активности вакансии
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - pk: ID вакансии для переключения статуса
        - request.user: аутентифицированный пользователь
        
        ИСТОЧНИКИ ДАННЫЕ:
        - URL параметр pk
        - Vacancy.objects: конкретная вакансия
        
        ОБРАБОТКА:
        - Получение вакансии по ID
        - Переключение статуса is_active
        - Сохранение изменений
        - Формирование ответа через UnifiedResponseHandler
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - DRF Response с результатом операции
        
        СВЯЗИ:
        - Использует: Vacancy.objects.get(), Vacancy.save(), UnifiedResponseHandler
        - Передает: DRF Response
        - Может вызываться из: DRF API endpoints
        """
        try:
            vacancy = self.get_object()
            
            # Проверяем права доступа
            from logic.utilities.context_helpers import PermissionHelper
            if not PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter'):
                response_data = UnifiedResponseHandler.error_response(
                    "У вас нет прав для изменения этой вакансии",
                    403
                )
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)
            
            # Переключаем активность
            vacancy.is_active = not vacancy.is_active
            vacancy.save()
            
            serializer = VacancySerializer(vacancy)
            response_data = UnifiedResponseHandler.success_response(
                serializer.data,
                f"Вакансия {'активирована' if vacancy.is_active else 'деактивирована'}"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='assign-grades')
    def assign_grades(self, request, pk=None):
        """
        Назначение грейдов вакансии
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - pk: ID вакансии для назначения грейдов
        - request.data: данные с грейдами для назначения
        - request.user: аутентифицированный пользователь
        
        ИСТОЧНИКИ ДАННЫЕ:
        - URL параметр pk
        - request.data: данные с грейдами
        - Vacancy.objects: конкретная вакансия
        - Grade.objects: доступные грейды
        
        ОБРАБОТКА:
        - Получение вакансии по ID
        - Валидация прав доступа
        - Назначение грейдов вакансии
        - Сохранение изменений
        - Формирование ответа через UnifiedResponseHandler
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - DRF Response с результатом операции
        
        СВЯЗИ:
        - Использует: Vacancy.objects.get(), Grade.objects, UnifiedResponseHandler
        - Передает: DRF Response
        - Может вызываться из: DRF API endpoints
        """
        try:
            vacancy = self.get_object()
            
            # Проверяем права доступа
            from logic.utilities.context_helpers import PermissionHelper
            if not PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter'):
                response_data = UnifiedResponseHandler.error_response(
                    "У вас нет прав для изменения этой вакансии",
                    403
                )
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)
            
            grade_ids = request.data.get('grade_ids', [])
            if not grade_ids:
                response_data = UnifiedResponseHandler.error_response(
                    "Не указаны ID грейдов",
                    400
                )
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем существование грейдов
            from apps.finance.models import Grade
            grades = Grade.objects.filter(id__in=grade_ids)
            if len(grades) != len(grade_ids):
                response_data = UnifiedResponseHandler.error_response(
                    "Некоторые грейды не найдены",
                    400
                )
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
            # Назначаем грейды
            vacancy.available_grades.set(grades)
            
            serializer = VacancySerializer(vacancy)
            response_data = UnifiedResponseHandler.success_response(
                serializer.data,
                f"Назначено {len(grades)} грейдов"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Статистика по вакансиям
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - request.user: аутентифицированный пользователь
        
        ИСТОЧНИКИ ДАННЫЕ:
        - Vacancy.objects: все вакансии
        - Django ORM агрегации: Count, Q
        
        ОБРАБОТКА:
        - Получение статистики по вакансиям
        - Подсчет активных/неактивных вакансий
        - Статистика по рекрутерам
        - Формирование ответа через UnifiedResponseHandler
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - DRF Response со статистикой вакансий
        
        СВЯЗИ:
        - Использует: Vacancy.objects, Django ORM агрегации, UnifiedResponseHandler
        - Передает: DRF Response
        - Может вызываться из: DRF API endpoints
        """
        try:
            queryset = self.get_queryset()
            
            # Основная статистика
            total_vacancies = queryset.count()
            active_vacancies = queryset.filter(is_active=True).count()
            inactive_vacancies = total_vacancies - active_vacancies
            
            # Статистика по рекрутерам
            vacancies_by_recruiter = dict(
                queryset.values('recruiter__username')
                .annotate(count=Count('id'))
                .values_list('recruiter__username', 'count')
            )
            
            # Статистика по грейдам
            vacancies_by_grade = dict(
                queryset.values('available_grades__name')
                .annotate(count=Count('id'))
                .values_list('available_grades__name', 'count')
            )
            
            # Последние вакансии
            recent_vacancies = queryset.order_by('-created_at')[:5]
            recent_serializer = VacancyListSerializer(recent_vacancies, many=True)
            
            stats_data = {
                'total_vacancies': total_vacancies,
                'active_vacancies': active_vacancies,
                'inactive_vacancies': inactive_vacancies,
                'vacancies_by_recruiter': vacancies_by_recruiter,
                'vacancies_by_grade': vacancies_by_grade,
                'recent_vacancies': recent_serializer.data
            }
            
            response_data = UnifiedResponseHandler.success_response(
                stats_data,
                "Статистика получена"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Поиск вакансий с расширенными параметрами
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - request.GET: параметры поиска (q, recruiter, is_active)
        - request.user: аутентифицированный пользователь
        
        ИСТОЧНИКИ ДАННЫЕ:
        - GET параметры поиска
        - Vacancy.objects: все вакансии
        
        ОБРАБОТКА:
        - Получение параметров поиска
        - Применение фильтров по поисковому запросу
        - Фильтрация по рекрутеру и статусу
        - Сериализация результатов
        - Формирование ответа через UnifiedResponseHandler
        
        ВЫХОДЯЩИЕ ДАННЫЕ:
        - DRF Response с результатами поиска
        
        СВЯЗИ:
        - Использует: VacancyListSerializer, UnifiedResponseHandler
        - Передает: DRF Response
        - Может вызываться из: DRF API endpoints
        """
        try:
            queryset = self.get_queryset()
            
            # Параметры поиска
            q = request.query_params.get('q', '')
            grade_id = request.query_params.get('grade_id')
            recruiter_id = request.query_params.get('recruiter_id')
            is_active = request.query_params.get('is_active')
            
            # Поиск по тексту
            if q:
                queryset = queryset.filter(
                    Q(name__icontains=q) |
                    Q(invite_title__icontains=q) |
                    Q(invite_text__icontains=q) |
                    Q(scorecard_title__icontains=q)
                )
            
            # Фильтрация по грейду
            if grade_id:
                queryset = queryset.filter(available_grades__id=grade_id)
            
            # Фильтрация по рекрутеру
            if recruiter_id:
                queryset = queryset.filter(recruiter__id=recruiter_id)
            
            # Фильтрация по активности
            if is_active is not None:
                is_active_bool = is_active.lower() == 'true'
                queryset = queryset.filter(is_active=is_active_bool)
            
            # Пагинация
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = VacancyListSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = VacancyListSerializer(queryset, many=True)
            response_data = UnifiedResponseHandler.success_response(
                serializer.data,
                f"Найдено {len(serializer.data)} вакансий"
            )
            return Response(response_data)
            
        except Exception as e:
            response_data = UnifiedResponseHandler.error_response(str(e))
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)