"""
Обработчики для работы с вакансиями
Содержит общую логику, используемую в views.py и views_api.py
"""

from django.shortcuts import get_object_or_404
from django.contrib import messages
from django.db.models import Count, Q
from django.http import JsonResponse

from ..models import Vacancy


class VacancyHandler:
    """Обработчик для работы с вакансиями"""
    
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """
        Логика переключения статуса активности вакансии
        
        Args:
            pk: ID вакансии
            request: HTTP запрос (опционально, для messages)
            
        Returns:
            dict: Результат операции с success, is_active, message
        """
        vacancy = get_object_or_404(Vacancy, pk=pk)
        
        try:
            vacancy.is_active = not vacancy.is_active
            vacancy.save()
            
            status = 'активирована' if vacancy.is_active else 'деактивирована'
            
            # Добавляем сообщение, если передан request
            if request:
                messages.success(request, f'Вакансия "{vacancy.name}" {status}!')
            
            return {
                'success': True,
                'is_active': vacancy.is_active,
                'message': f'Вакансия {status}',
                'vacancy': vacancy
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Ошибка: {str(e)}',
                'vacancy': None
            }
    
    @staticmethod
    def search_logic(search_params):
        """
        Логика поиска и фильтрации вакансий
        
        Args:
            search_params: dict с параметрами поиска
                - query: поисковый запрос
                - recruiter_id: ID рекрутера
                - grade_id: ID грейда
                - is_active: статус активности
                - user: пользователь (для фильтрации прав)
                
        Returns:
            QuerySet: Отфильтрованный queryset вакансий
        """
        queryset = Vacancy.objects.select_related('recruiter').prefetch_related(
            'available_grades', 'interviewers'
        ).all()
        
        # Фильтрация по правам пользователя
        user = search_params.get('user')
        if user and not user.is_superuser and not getattr(user, 'is_admin', False) and not getattr(user, 'is_recruiter', False):
            queryset = queryset.filter(recruiter=user)
        
        # Поисковый запрос
        query = search_params.get('query', '')
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(external_id__icontains=query) |
                Q(invite_title__icontains=query) |
                Q(scorecard_title__icontains=query)
            )
        
        # Фильтр по рекрутеру
        recruiter_id = search_params.get('recruiter_id')
        if recruiter_id:
            queryset = queryset.filter(recruiter_id=recruiter_id)
        
        # Фильтр по грейду
        grade_id = search_params.get('grade_id')
        if grade_id:
            queryset = queryset.filter(available_grades__id=grade_id)
        
        # Фильтр по статусу активности
        is_active = search_params.get('is_active')
        if is_active is not None:
            if isinstance(is_active, str):
                if is_active.lower() == 'true':
                    queryset = queryset.filter(is_active=True)
                elif is_active.lower() == 'false':
                    queryset = queryset.filter(is_active=False)
            else:
                queryset = queryset.filter(is_active=is_active)
        
        return queryset.order_by('-created_at')
    
    @staticmethod
    def calculate_stats(user=None):
        """
        Логика расчета статистики по вакансиям
        
        Args:
            user: Пользователь (для фильтрации по правам)
            
        Returns:
            dict: Статистика по вакансиям
        """
        base_queryset = Vacancy.objects.all()
        
        # Фильтрация по правам пользователя
        if user and not user.is_superuser and not getattr(user, 'is_admin', False) and not getattr(user, 'is_recruiter', False):
            base_queryset = base_queryset.filter(recruiter=user)
        
        total_vacancies = base_queryset.count()
        active_vacancies = base_queryset.filter(is_active=True).count()
        inactive_vacancies = total_vacancies - active_vacancies
        
        # Статистика по рекрутерам
        recruiter_stats = base_queryset.values('recruiter__username').annotate(
            count=Count('id'),
            active_count=Count('id', filter=Q(is_active=True))
        )
        
        # Статистика по грейдам
        grade_stats = base_queryset.values('available_grades__name').annotate(
            count=Count('id', distinct=True)
        ).exclude(available_grades__name__isnull=True)
        
        # Последние вакансии
        recent_vacancies = base_queryset.select_related('recruiter').prefetch_related(
            'available_grades', 'interviewers'
        ).order_by('-created_at')[:5]
        
        return {
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
            'recent_vacancies': recent_vacancies
        }
    
    @staticmethod
    def assign_grades_logic(vacancy_pk, grade_ids, user=None):
        """
        Логика назначения грейдов вакансии
        
        Args:
            vacancy_pk: ID вакансии
            grade_ids: Список ID грейдов
            user: Пользователь (для проверки прав)
            
        Returns:
            dict: Результат операции
        """
        try:
            vacancy = get_object_or_404(Vacancy, pk=vacancy_pk)
            
            # Проверка прав доступа
            if user and not user.is_superuser and not getattr(user, 'is_admin', False):
                if vacancy.recruiter != user:
                    return {
                        'success': False,
                        'message': 'У вас нет прав для изменения этой вакансии',
                        'vacancy': None
                    }
            
            from apps.finance.models import Grade
            grades = Grade.objects.filter(id__in=grade_ids)
            vacancy.available_grades.set(grades)
            
            return {
                'success': True,
                'message': f'Грейды успешно назначены вакансии "{vacancy.name}"',
                'vacancy': vacancy
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Ошибка при назначении грейдов: {str(e)}',
                'vacancy': None
            }
    
    @staticmethod
    def get_my_vacancies_logic(user):
        """
        Логика получения вакансий текущего пользователя
        
        Args:
            user: Пользователь
            
        Returns:
            QuerySet: Вакансии пользователя
        """
        return Vacancy.objects.select_related('recruiter').prefetch_related(
            'available_grades', 'interviewers'
        ).filter(recruiter=user).order_by('-created_at')


class VacancyApiHandler:
    """API обработчик для работы с вакансиями"""
    
    @staticmethod
    def toggle_active_handler(params, request):
        """API обработчик переключения активности"""
        result = VacancyHandler.toggle_active_logic(params['pk'], None)
        return result
    
    @staticmethod
    def search_handler(params, request):
        """API обработчик поиска"""
        search_params = {
            'query': params.get('q', ''),
            'recruiter_id': params.get('recruiter_id'),
            'grade_id': params.get('grade_id'),
            'is_active': params.get('is_active'),
            'user': request.user
        }
        
        queryset = VacancyHandler.search_logic(search_params)
        
        return {
            'success': True,
            'vacancies': queryset,
            'message': 'Поиск выполнен успешно'
        }
    
    @staticmethod
    def stats_handler(params, request):
        """API обработчик статистики"""
        stats = VacancyHandler.calculate_stats(request.user)
        
        return {
            'success': True,
            'stats': stats,
            'message': 'Статистика получена успешно'
        }
    
    @staticmethod
    def assign_grades_handler(params, request):
        """API обработчик назначения грейдов"""
        result = VacancyHandler.assign_grades_logic(
            params['pk'], 
            params.get('grade_ids', []),
            request.user
        )
        return result
    
    @staticmethod
    def my_vacancies_handler(params, request):
        """API обработчик получения моих вакансий"""
        vacancies = VacancyHandler.get_my_vacancies_logic(request.user)
        
        return {
            'success': True,
            'vacancies': vacancies,
            'message': 'Вакансии пользователя получены успешно'
        }
