from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Vacancy, SalaryRange
from .forms import VacancyForm, VacancySearchForm, SalaryRangeForm, SalaryRangeSearchForm
from apps.finance.models import Grade
from .logic.vacancy_handlers import VacancyHandler
from .logic.salary_range_handlers import SalaryRangeHandler
from .logic.response_handlers import ResponseHandler


@login_required
def dashboard(request):
    """Дашборд локальных данных по вакансиям"""
    # Получаем статистику по вакансиям
    vacancy_stats = VacancyHandler.calculate_stats(request.user)
    
    # Получаем статистику по зарплатным вилкам
    salary_range_stats = SalaryRangeHandler.calculate_stats()
    
    # Общее количество грейдов
    total_grades = Grade.objects.count()
    
    context = {
        **vacancy_stats,
        **salary_range_stats,
        'total_grades': total_grades,
    }
    
    return render(request, 'vacancies/dashboard.html', context)


@login_required
def vacancy_list(request):
    """Список вакансий"""
    # Получаем параметры поиска
    search_form = VacancySearchForm(request.GET)
    search_query = request.GET.get('search', '')
    recruiter_filter = request.GET.get('recruiter', '')
    status_filter = request.GET.get('is_active', '')
    
    # Используем обработчик поиска
    search_params = {
        'query': search_query,
        'recruiter_id': recruiter_filter,
        'is_active': status_filter,
        'user': request.user
    }
    vacancies = VacancyHandler.search_logic(search_params)
    
    # Пагинация
    paginator = Paginator(vacancies, 10)  # 10 вакансий на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = ResponseHandler.pagination_context(
        page_obj,
        search_form,
        original_queryset=vacancies,
        search_query=search_query,
        recruiter_filter=recruiter_filter,
        status_filter=status_filter
    )
    
    return render(request, 'vacancies/vacancy_list.html', context)


@login_required
def vacancy_detail(request, pk):
    """Детальная информация о вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    # Получаем все активные зарплатные вилки для данной вакансии
    salary_ranges = SalaryRangeHandler.get_salary_ranges_for_vacancy(pk)
    
    context = {
        'vacancy': vacancy,
        'salary_ranges': salary_ranges,
    }
    
    return render(request, 'vacancies/vacancy_detail.html', context)


@login_required
def vacancy_create(request):
    """Создание новой вакансии"""
    if request.method == 'POST':
        form = VacancyForm(request.POST)
        if form.is_valid():
            vacancy = form.save()
            messages.success(request, f'Вакансия "{vacancy.name}" успешно создана!')
            return redirect('vacancies:vacancy_detail', pk=vacancy.pk)
    else:
        form = VacancyForm()
    
    # Получаем все активные зарплатные вилки
    salary_ranges = SalaryRangeHandler.get_active_salary_ranges()
    
    context = {
        'form': form,
        'title': 'Создание вакансии',
        'submit_text': 'Создать вакансию',
        'salary_ranges': salary_ranges,
    }
    
    return render(request, 'vacancies/vacancy_form.html', context)


@login_required
def vacancy_edit(request, pk):
    """Редактирование вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    if request.method == 'POST':
        form = VacancyForm(request.POST, instance=vacancy)
        if form.is_valid():
            vacancy = form.save()
            messages.success(request, f'Вакансия "{vacancy.name}" успешно обновлена!')
            return redirect('vacancies:vacancy_detail', pk=vacancy.pk)
    else:
        form = VacancyForm(instance=vacancy)
    
    # Получаем все активные зарплатные вилки
    salary_ranges = SalaryRangeHandler.get_active_salary_ranges()
    
    context = {
        'form': form,
        'vacancy': vacancy,
        'title': f'Редактирование вакансии "{vacancy.name}"',
        'submit_text': 'Сохранить изменения',
        'salary_ranges': salary_ranges,
    }
    
    return render(request, 'vacancies/vacancy_form.html', context)


@login_required
@require_POST
def vacancy_delete(request, pk):
    """Удаление вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    vacancy_name = vacancy.name
    
    try:
        vacancy.delete()
        messages.success(request, f'Вакансия "{vacancy_name}" успешно удалена!')
        return redirect('vacancies:vacancy_list')
    except Exception as e:
        messages.error(request, f'Ошибка при удалении вакансии: {str(e)}')
        return redirect('vacancies:vacancy_detail', pk=pk)


@login_required
@require_POST
def vacancy_toggle_active(request, pk):
    """Переключение статуса активности вакансии"""
    result = VacancyHandler.toggle_active_logic(pk, request)
    
    if result['success']:
        return ResponseHandler.success_response(
            {'is_active': result['is_active']},
            result['message']
        )
    else:
        return ResponseHandler.error_response(result['message'])


# Представления для зарплатных вилок

@login_required
def salary_ranges_list(request):
    """Список зарплатных вилок"""
    # Получаем параметры поиска
    search_form = SalaryRangeSearchForm(request.GET)
    search_query = request.GET.get('search', '')
    vacancy_filter = request.GET.get('vacancy', '')
    grade_filter = request.GET.get('grade', '')
    status_filter = request.GET.get('is_active', '')
    
    # Используем обработчик поиска
    search_params = {
        'query': search_query,
        'vacancy_id': vacancy_filter,
        'grade_id': grade_filter,
        'is_active': status_filter
    }
    salary_ranges = SalaryRangeHandler.search_logic(search_params)
    
    # Пагинация
    paginator = Paginator(salary_ranges, 10)  # 10 вилок на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = ResponseHandler.pagination_context(
        page_obj,
        search_form,
        original_queryset=salary_ranges,
        search_query=search_query,
        vacancy_filter=vacancy_filter,
        grade_filter=grade_filter,
        status_filter=status_filter
    )
    
    return render(request, 'vacancies/salary_ranges_list.html', context)


@login_required
def salary_range_detail(request, pk):
    """Детальная информация о зарплатной вилке"""
    salary_range = get_object_or_404(SalaryRange, pk=pk)
    
    context = {
        'salary_range': salary_range,
    }
    
    return render(request, 'vacancies/salary_range_detail.html', context)


@login_required
def salary_range_create(request):
    """Создание новой зарплатной вилки"""
    if request.method == 'POST':
        form = SalaryRangeForm(request.POST)
        if form.is_valid():
            salary_range = form.save()
            messages.success(request, f'Зарплатная вилка для грейда "{salary_range.grade.name}" успешно создана!')
            return redirect('vacancies:salary_range_detail', pk=salary_range.pk)
    else:
        form = SalaryRangeForm()
    
    context = {
        'form': form,
        'title': 'Создание зарплатной вилки',
        'submit_text': 'Создать зарплатную вилку',
    }
    
    return render(request, 'vacancies/salary_range_form.html', context)


@login_required
def salary_range_edit(request, pk):
    """Редактирование зарплатной вилки"""
    salary_range = get_object_or_404(SalaryRange, pk=pk)
    
    if request.method == 'POST':
        form = SalaryRangeForm(request.POST, instance=salary_range)
        if form.is_valid():
            salary_range = form.save()
            messages.success(request, f'Зарплатная вилка для грейда "{salary_range.grade.name}" успешно обновлена!')
            return redirect('vacancies:salary_range_detail', pk=salary_range.pk)
    else:
        form = SalaryRangeForm(instance=salary_range)
    
    context = {
        'form': form,
        'salary_range': salary_range,
        'title': f'Редактирование зарплатной вилки для грейда "{salary_range.grade.name}"',
        'submit_text': 'Сохранить изменения',
    }
    
    return render(request, 'vacancies/salary_range_form.html', context)


@login_required
@require_POST
def salary_range_delete(request, pk):
    """Удаление зарплатной вилки"""
    salary_range = get_object_or_404(SalaryRange, pk=pk)
    grade_name = salary_range.grade.name
    
    try:
        salary_range.delete()
        messages.success(request, f'Зарплатная вилка для грейда "{grade_name}" успешно удалена!')
        return redirect('vacancies:salary_ranges_list')
    except Exception as e:
        messages.error(request, f'Ошибка при удалении зарплатной вилки: {str(e)}')
        return redirect('vacancies:salary_range_detail', pk=pk)


@login_required
@require_POST
def salary_range_toggle_active(request, pk):
    """Переключение статуса активности зарплатной вилки"""
    result = SalaryRangeHandler.toggle_active_logic(pk, request)
    
    if result['success']:
        return ResponseHandler.success_response(
            {'is_active': result['is_active']},
            result['message']
        )
    else:
        return ResponseHandler.error_response(result['message'])
