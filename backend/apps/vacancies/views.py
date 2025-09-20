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


@login_required
def dashboard(request):
    """Дашборд локальных данных по вакансиям"""
    total_vacancies = Vacancy.objects.count()
    active_vacancies = Vacancy.objects.filter(is_active=True).count()
    inactive_vacancies = Vacancy.objects.filter(is_active=False).count()
    total_grades = Grade.objects.count()
    
    # Статистика по зарплатным вилкам
    total_salary_ranges = SalaryRange.objects.count()
    active_salary_ranges = SalaryRange.objects.filter(is_active=True).count()
    inactive_salary_ranges = SalaryRange.objects.filter(is_active=False).count()
    
    # Последние добавленные вакансии
    recent_vacancies = Vacancy.objects.select_related('recruiter').prefetch_related('interviewers').order_by('-created_at')[:5]
    
    # Последние добавленные зарплатные вилки
    recent_salary_ranges = SalaryRange.objects.select_related('grade', 'vacancy').order_by('-created_at')[:5]
    
    context = {
        'total_vacancies': total_vacancies,
        'active_vacancies': active_vacancies,
        'inactive_vacancies': inactive_vacancies,
        'total_grades': total_grades,
        'total_salary_ranges': total_salary_ranges,
        'active_salary_ranges': active_salary_ranges,
        'inactive_salary_ranges': inactive_salary_ranges,
        'recent_vacancies': recent_vacancies,
        'recent_salary_ranges': recent_salary_ranges,
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
    
    # Базовый queryset
    vacancies = Vacancy.objects.select_related('recruiter').prefetch_related('interviewers').all()
    
    # Применяем фильтры
    if search_query:
        vacancies = vacancies.filter(
            Q(name__icontains=search_query) |
            Q(external_id__icontains=search_query)
        )
    
    if recruiter_filter:
        vacancies = vacancies.filter(recruiter_id=recruiter_filter)
    
    if status_filter == 'true':
        vacancies = vacancies.filter(is_active=True)
    elif status_filter == 'false':
        vacancies = vacancies.filter(is_active=False)
    
    # Пагинация
    paginator = Paginator(vacancies, 10)  # 10 вакансий на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'search_query': search_query,
        'recruiter_filter': recruiter_filter,
        'status_filter': status_filter,
        'total_count': vacancies.count(),
        'active_count': vacancies.filter(is_active=True).count(),
        'inactive_count': vacancies.filter(is_active=False).count(),
    }
    
    return render(request, 'vacancies/vacancy_list.html', context)


@login_required
def vacancy_detail(request, pk):
    """Детальная информация о вакансии"""
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    # Получаем все активные зарплатные вилки для данной вакансии
    salary_ranges = SalaryRange.objects.filter(vacancy=vacancy, is_active=True).select_related('grade', 'vacancy').order_by('grade__name')
    
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
    salary_ranges = SalaryRange.objects.filter(is_active=True).select_related('grade', 'vacancy').order_by('grade__name')
    
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
    salary_ranges = SalaryRange.objects.filter(is_active=True).select_related('grade', 'vacancy').order_by('grade__name')
    
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
    vacancy = get_object_or_404(Vacancy, pk=pk)
    
    try:
        vacancy.is_active = not vacancy.is_active
        vacancy.save()
        
        status = 'активирована' if vacancy.is_active else 'деактивирована'
        messages.success(request, f'Вакансия "{vacancy.name}" {status}!')
        
        return JsonResponse({
            'success': True,
            'is_active': vacancy.is_active,
            'message': f'Вакансия {status}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


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
    
    # Базовый queryset
    salary_ranges = SalaryRange.objects.select_related('grade', 'vacancy').all()
    
    # Применяем фильтры
    if search_query:
        salary_ranges = salary_ranges.filter(
            Q(grade__name__icontains=search_query) |
            Q(vacancy__name__icontains=search_query)
        )
    
    if vacancy_filter:
        salary_ranges = salary_ranges.filter(vacancy_id=vacancy_filter)
    
    if grade_filter:
        salary_ranges = salary_ranges.filter(grade_id=grade_filter)
    
    if status_filter == 'true':
        salary_ranges = salary_ranges.filter(is_active=True)
    elif status_filter == 'false':
        salary_ranges = salary_ranges.filter(is_active=False)
    
    # Пагинация
    paginator = Paginator(salary_ranges, 10)  # 10 вилок на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'search_query': search_query,
        'vacancy_filter': vacancy_filter,
        'grade_filter': grade_filter,
        'status_filter': status_filter,
        'total_count': salary_ranges.count(),
        'active_count': salary_ranges.filter(is_active=True).count(),
        'inactive_count': salary_ranges.filter(is_active=False).count(),
    }
    
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
    salary_range = get_object_or_404(SalaryRange, pk=pk)
    
    try:
        salary_range.is_active = not salary_range.is_active
        salary_range.save()
        
        status = 'активирована' if salary_range.is_active else 'деактивирована'
        messages.success(request, f'Зарплатная вилка для грейда "{salary_range.grade.name}" {status}!')
        
        return JsonResponse({
            'success': True,
            'is_active': salary_range.is_active,
            'message': f'Зарплатная вилка {status}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })
