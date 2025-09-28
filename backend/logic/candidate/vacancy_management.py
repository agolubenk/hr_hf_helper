"""Управление вакансиями"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from logic.base.response_handler import UnifiedResponseHandler
from logic.utilities.context_helpers import ContextHelper, DataHelper, PermissionHelper
from apps.vacancies.models import Vacancy
from apps.finance.models import Grade, SalaryRange
# from apps.vacancies.forms import VacancyForm  # Формы не используются

@login_required
def vacancy_dashboard(request):
    """
    Дашборд локальных данных по вакансиям
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - Vacancy.objects: все вакансии из базы данных
    - SalaryRange.objects: зарплатные вилки
    - Grade.objects: грейды
    
    ОБРАБОТКА:
    - Получение вакансий доступных пользователю через PermissionHelper
    - Расчет статистики: общие, активные, неактивные вакансии
    - Получение статистики по зарплатным вилкам и грейдам
    - Создание контекста через ContextHelper
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь со статистикой вакансий
    - render: HTML страница 'vacancies/dashboard.html'
    
    СВЯЗИ:
    - Использует: PermissionHelper, ContextHelper, UnifiedResponseHandler
    - Передает данные в: vacancies/dashboard.html
    - Может вызываться из: apps/vacancies/views.py
    """
    try:
        # Получаем статистику по вакансиям
        user_vacancies = PermissionHelper.get_user_accessible_objects(
            Vacancy.objects.all(), 
            request.user, 
            'recruiter'
        )
        
        total_vacancies = user_vacancies.count()
        active_vacancies = user_vacancies.filter(is_active=True).count()
        inactive_vacancies = total_vacancies - active_vacancies
        
        # Получаем статистику по зарплатным вилкам
        total_salary_ranges = SalaryRange.objects.count()
        active_salary_ranges = SalaryRange.objects.filter(is_active=True).count()
        inactive_salary_ranges = total_salary_ranges - active_salary_ranges
        
        # Общее количество грейдов
        total_grades = Grade.objects.count()
        
        # Получаем последние вакансии с зарплатными вилками (приоритет вакансиям с вилками)
        recent_vacancies_with_salary = user_vacancies.filter(salary_ranges__isnull=False).select_related('recruiter').prefetch_related('salary_ranges__grade').distinct().order_by('-created_at')[:3]
        recent_vacancies_without_salary = user_vacancies.filter(salary_ranges__isnull=True).select_related('recruiter').prefetch_related('salary_ranges__grade').order_by('-created_at')[:2]
        recent_vacancies = list(recent_vacancies_with_salary) + list(recent_vacancies_without_salary)
        
        # Получаем последние зарплатные вилки
        recent_salary_ranges = SalaryRange.objects.select_related('vacancy', 'grade').order_by('-updated_at')[:6]
        
        context = ContextHelper.get_base_context(
            request,
            'Дашборд вакансий',
            {
                'total_vacancies': total_vacancies,
                'active_vacancies': active_vacancies,
                'inactive_vacancies': inactive_vacancies,
                'total_salary_ranges': total_salary_ranges,
                'active_salary_ranges': active_salary_ranges,
                'inactive_salary_ranges': inactive_salary_ranges,
                'total_grades': total_grades,
                'recent_vacancies': recent_vacancies,
                'recent_salary_ranges': recent_salary_ranges,
            }
        )
        
        return render(request, 'vacancies/dashboard.html', context)
    except Exception as e:
        return UnifiedResponseHandler.json_response(
            UnifiedResponseHandler.error_response(str(e)),
            status_code=500
        )

@login_required
def vacancy_list(request):
    """
    Список вакансий
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.GET: search, recruiter, is_active (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - Vacancy.objects: все вакансии из базы данных
    - VacancySearchForm: для валидации параметров поиска
    
    ОБРАБОТКА:
    - Получение параметров фильтрации из GET запроса
    - Фильтрация вакансий по пользователю через PermissionHelper
    - Поиск по названию, описанию, компании
    - Фильтрация по статусу активности и рекрутеру
    - Пагинация результатов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с отфильтрованными вакансиями и пагинацией
    - render: HTML страница 'vacancies/vacancy_list.html'
    
    СВЯЗИ:
    - Использует: PermissionHelper, SearchHelper, ContextHelper, UnifiedResponseHandler
    - Передает данные в: vacancies/vacancy_list.html
    - Может вызываться из: apps/vacancies/views.py
    """
    try:
        # Импортируем формы
        from apps.vacancies.forms import VacancySearchForm
        
        # Получаем параметры поиска
        search_form = VacancySearchForm(request.GET)
        search_query = request.GET.get('search', '')
        recruiter_filter = request.GET.get('recruiter', '')
        status_filter = request.GET.get('is_active', '')
        
        # Получаем вакансии с фильтрацией по пользователю и загружаем связанные данные
        vacancies = PermissionHelper.get_user_accessible_objects(
            Vacancy.objects.select_related('recruiter').prefetch_related('salary_ranges__grade').order_by('-created_at'), 
            request.user, 
            'recruiter'
        )
        
        # Поиск по вакансиям
        if search_query:
            from logic.utilities.context_helpers import SearchHelper
            search_fields = ['name', 'description', 'company_name']
            vacancies = SearchHelper.filter_queryset_search(vacancies, search_query, search_fields)
        
        # Фильтрация по статусу
        if status_filter:
            if status_filter == 'active':
                vacancies = vacancies.filter(is_active=True)
            elif status_filter == 'inactive':
                vacancies = vacancies.filter(is_active=False)
        
        # Фильтрация по рекрутеру
        if recruiter_filter:
            vacancies = vacancies.filter(recruiter_id=recruiter_filter)
        
        # Пагинация
        pagination_context = ContextHelper.get_pagination_context(vacancies, request.GET.get('page', 1))
        
        context = ContextHelper.get_base_context(
            request, 
            'Список вакансий',
            {
                'vacancies': pagination_context.get('page_obj'),
                'search_form': search_form,
                'search_term': search_query,
                'recruiter_filter': recruiter_filter,
                'status_filter': status_filter,
                **pagination_context
            }
        )
        
        return render(request, 'vacancies/vacancy_list.html', context)
    except Exception as e:
        return UnifiedResponseHandler.json_response(
            UnifiedResponseHandler.error_response(str(e)),
            status_code=500
        )

@login_required
def vacancy_detail(request, pk):
    """Детали вакансии"""
    try:
        vacancy = get_object_or_404(Vacancy, pk=pk)
        
        # Проверяем права доступа
        if not PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter'):
            messages.warning(request, 'У вас нет прав для просмотра этой вакансии')
            return redirect('vacancy_list')
        
        # Получаем зарплатные вилки для данной вакансии
        salary_ranges = SalaryRange.objects.filter(
            vacancy=vacancy,
            is_active=True
        ).order_by('-created_at')
        
        context = ContextHelper.get_base_context(
            request,
            f'Вакансия: {vacancy.name}',
            {
                'vacancy': vacancy,
                'salary_ranges': salary_ranges,
                'can_edit': PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter')
            }
        )
        
        return render(request, 'vacancies/vacancy_detail.html', context)
    except Exception as e:
        return UnifiedResponseHandler.json_response(
            UnifiedResponseHandler.error_response(str(e)),
            status_code=500
        )

@login_required
def vacancy_create(request):
    """Создание вакансии"""
    if request.method == 'POST':
        try:
            # Простая обработка POST данных без форм
            name = request.POST.get('name', '')
            external_id = request.POST.get('external_id', '')
            invite_title = request.POST.get('invite_title', '')
            invite_text = request.POST.get('invite_text', '')
            scorecard_title = request.POST.get('scorecard_title', '')
            
            vacancy = Vacancy.objects.create(
                name=name,
                external_id=external_id,
                recruiter=request.user,  # Используем текущего пользователя как рекрутера
                invite_title=invite_title,
                invite_text=invite_text,
                scorecard_title=scorecard_title
            )
            
            messages.success(request, 'Вакансия успешно создана')
            return redirect('vacancy_detail', pk=vacancy.pk)
                
        except Exception as e:
            messages.error(request, f'Ошибка при создании: {str(e)}')
    
    context = ContextHelper.get_base_context(
        request,
        'Создание вакансии'
    )
    return render(request, 'vacancies/vacancy_form.html', context)

@login_required
def vacancy_update(request, pk):
    """Обновление вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    # Проверяем права доступа
    if not PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter'):
        messages.error(request, 'У вас нет прав для редактирования этой вакансии')
        return redirect('vacancy_detail', pk=pk)
    
    if request.method == 'POST':
        try:
            # Простая обработка POST данных без форм
            name = request.POST.get('name', vacancy.name)
            external_id = request.POST.get('external_id', vacancy.external_id)
            invite_title = request.POST.get('invite_title', vacancy.invite_title)
            invite_text = request.POST.get('invite_text', vacancy.invite_text)
            scorecard_title = request.POST.get('scorecard_title', vacancy.scorecard_title)
            
            vacancy.name = name
            vacancy.external_id = external_id
            vacancy.invite_title = invite_title
            vacancy.invite_text = invite_text
            vacancy.scorecard_title = scorecard_title
            vacancy.save()
            
            messages.success(request, 'Вакансия успешно обновлена')
            return redirect('vacancy_detail', pk=vacancy.pk)
                
        except Exception as e:
            messages.error(request, f'Ошибка при обновлении: {str(e)}')
    
    context = ContextHelper.get_base_context(
        request,
        f'Редактирование: {vacancy.name}',
        {
            'vacancy': vacancy
        }
    )
    return render(request, 'vacancies/vacancy_form.html', context)

@login_required
def vacancy_delete(request, pk):
    """Удаление вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    # Проверяем права доступа
    if not PermissionHelper.can_user_edit_object(request.user, vacancy, 'recruiter'):
        messages.error(request, 'У вас нет прав для удаления этой вакансии')
        return redirect('vacancy_detail', pk=pk)
    
    if request.method == 'POST':
        try:
            name = vacancy.name
            vacancy.delete()
            messages.success(request, f'Вакансия "{name}" удалена')
            return redirect('vacancy_list')
        except Exception as e:
            messages.error(request, f'Ошибка при удалении: {str(e)}')
            return redirect('vacancy_detail', pk=pk)
    
    context = ContextHelper.get_base_context(
        request,
        f'Удаление: {vacancy.name}',
        {'vacancy': vacancy}
    )
    return render(request, 'vacancies/vacancy_confirm_delete.html', context)

@login_required
def vacancy_duplicate(request, pk):
    """Дублирование вакансии"""
    original_vacancy = get_object_or_404(Vacancy, pk=pk)
    
    # Проверяем права доступа
    if not PermissionHelper.can_user_edit_object(request.user, original_vacancy, 'recruiter'):
        messages.error(request, 'У вас нет прав для копирования этой вакансии')
        return redirect('vacancy_list')
    
    try:
        # Создаем копию вакансии
        vacancy = Vacancy.objects.create(
            name=f"{original_vacancy.name} (копия)",
            external_id=f"{original_vacancy.external_id}_copy",
            recruiter=original_vacancy.recruiter,
            invite_title=original_vacancy.invite_title,
            invite_text=original_vacancy.invite_text,
            scorecard_title=original_vacancy.scorecard_title
        )
        
        messages.success(request, 'Вакансия успешно скопирована')
        return redirect('vacancy_detail', pk=vacancy.pk)
        
    except Exception as e:
        messages.error(request, f'Ошибка при копировании: {str(e)}')
        return redirect('vacancy_detail', pk=original_vacancy.pk)
