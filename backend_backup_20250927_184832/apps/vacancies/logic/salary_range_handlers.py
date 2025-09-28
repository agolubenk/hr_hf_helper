"""
Обработчики для работы с зарплатными вилками
Содержит общую логику, используемую в views.py и views_api.py
"""

from django.shortcuts import get_object_or_404
from django.contrib import messages
from django.db.models import Q

from ..models import SalaryRange


class SalaryRangeHandler:
    """Обработчик для работы с зарплатными вилками"""
    
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """
        Логика переключения статуса активности зарплатной вилки
        
        Args:
            pk: ID зарплатной вилки
            request: HTTP запрос (опционально, для messages)
            
        Returns:
            dict: Результат операции с success, is_active, message
        """
        salary_range = get_object_or_404(SalaryRange, pk=pk)
        
        try:
            salary_range.is_active = not salary_range.is_active
            salary_range.save()
            
            status = 'активирована' if salary_range.is_active else 'деактивирована'
            
            # Добавляем сообщение, если передан request
            if request:
                messages.success(request, f'Зарплатная вилка для грейда "{salary_range.grade.name}" {status}!')
            
            return {
                'success': True,
                'is_active': salary_range.is_active,
                'message': f'Зарплатная вилка {status}',
                'salary_range': salary_range
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Ошибка: {str(e)}',
                'salary_range': None
            }
    
    @staticmethod
    def search_logic(search_params):
        """
        Логика поиска и фильтрации зарплатных вилок
        
        Args:
            search_params: dict с параметрами поиска
                - query: поисковый запрос
                - vacancy_id: ID вакансии
                - grade_id: ID грейда
                - is_active: статус активности
                
        Returns:
            QuerySet: Отфильтрованный queryset зарплатных вилок
        """
        queryset = SalaryRange.objects.select_related('grade', 'vacancy').all()
        
        # Поисковый запрос
        query = search_params.get('query', '')
        if query:
            queryset = queryset.filter(
                Q(grade__name__icontains=query) |
                Q(vacancy__name__icontains=query)
            )
        
        # Фильтр по вакансии
        vacancy_id = search_params.get('vacancy_id')
        if vacancy_id:
            queryset = queryset.filter(vacancy_id=vacancy_id)
        
        # Фильтр по грейду
        grade_id = search_params.get('grade_id')
        if grade_id:
            queryset = queryset.filter(grade_id=grade_id)
        
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
    def calculate_stats():
        """
        Логика расчета статистики по зарплатным вилкам
        
        Returns:
            dict: Статистика по зарплатным вилкам
        """
        total_salary_ranges = SalaryRange.objects.count()
        active_salary_ranges = SalaryRange.objects.filter(is_active=True).count()
        inactive_salary_ranges = total_salary_ranges - active_salary_ranges
        
        # Последние добавленные зарплатные вилки
        recent_salary_ranges = SalaryRange.objects.select_related(
            'grade', 'vacancy'
        ).order_by('-created_at')[:5]
        
        return {
            'total_salary_ranges': total_salary_ranges,
            'active_salary_ranges': active_salary_ranges,
            'inactive_salary_ranges': inactive_salary_ranges,
            'recent_salary_ranges': recent_salary_ranges
        }
    
    @staticmethod
    def get_active_salary_ranges():
        """
        Получение всех активных зарплатных вилок
        
        Returns:
            QuerySet: Активные зарплатные вилки
        """
        return SalaryRange.objects.filter(
            is_active=True
        ).select_related('grade', 'vacancy').order_by('grade__name')
    
    @staticmethod
    def get_salary_ranges_for_vacancy(vacancy_pk):
        """
        Получение зарплатных вилок для конкретной вакансии
        
        Args:
            vacancy_pk: ID вакансии
            
        Returns:
            QuerySet: Зарплатные вилки для вакансии
        """
        return SalaryRange.objects.filter(
            vacancy_id=vacancy_pk, 
            is_active=True
        ).select_related('grade', 'vacancy').order_by('grade__name')
