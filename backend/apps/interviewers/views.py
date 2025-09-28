# Импорты из новых модулей
from logic.candidate.interviewer_management import (
    interviewer_list, interviewer_detail, interviewer_create,
    interviewer_edit, interviewer_delete, interviewer_toggle_active,
    interview_rule_list, interview_rule_detail, interview_rule_create,
    interview_rule_edit, interview_rule_delete
)
from logic.base.response_handler import UnifiedResponseHandler

# Старые импорты (для совместимости)
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Interviewer, InterviewRule
from .forms import InterviewerForm, InterviewerSearchForm, InterviewRuleForm, InterviewRuleSearchForm
from .logic.interviewers_handlers import InterviewerHandler
from .logic.rules_handlers import RuleHandler


@login_required
def interviewer_list(request):
    """
    Список интервьюеров
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.GET: search, is_active (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - Interviewer.objects: все интервьюеры из базы данных
    - InterviewerSearchForm: для валидации параметров поиска
    - InterviewerHandler: для логики поиска и фильтрации
    
    ОБРАБОТКА:
    - Получение параметров поиска из GET запроса
    - Применение фильтров через InterviewerHandler
    - Пагинация результатов (10 интервьюеров на страницу)
    - Подсчет статистики (общее количество, активные, неактивные)
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с отфильтрованными интервьюерами и пагинацией
    - render: HTML страница 'interviewers/interviewer_list.html'
    
    СВЯЗИ:
    - Использует: Interviewer.objects, InterviewerSearchForm, InterviewerHandler
    - Передает данные в: interviewers/interviewer_list.html
    - Может вызываться из: interviewers/ URL patterns
    """
    # Получаем параметры поиска
    search_form = InterviewerSearchForm(request.GET)
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('is_active', '')
    
    # Базовый queryset
    interviewers = Interviewer.objects.all()
    
    # Применяем фильтры через общий обработчик
    filter_q = InterviewerHandler.search_interviewers_logic(search_query, status_filter)
    interviewers = interviewers.filter(filter_q)
    
    # Пагинация
    paginator = Paginator(interviewers, 10)  # 10 интервьюеров на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'search_query': search_query,
        'status_filter': status_filter,
        'total_count': interviewers.count(),
        'active_count': interviewers.filter(is_active=True).count(),
        'inactive_count': interviewers.filter(is_active=False).count(),
    }
    
    return render(request, 'interviewers/interviewer_list.html', context)


@login_required
def interviewer_detail(request, pk):
    """
    Детальная информация об интервьюере
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - pk: ID интервьюера
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - Interviewer.objects: конкретный интервьюер по ID
    
    ОБРАБОТКА:
    - Получение интервьюера по ID (404 если не найден)
    - Создание контекста для детального просмотра
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с данными интервьюера
    - render: HTML страница 'interviewers/interviewer_detail.html'
    
    СВЯЗИ:
    - Использует: Interviewer.objects.get(), get_object_or_404()
    - Передает данные в: interviewers/interviewer_detail.html
    - Может вызываться из: interviewers/ URL patterns
    """
    interviewer = get_object_or_404(Interviewer, pk=pk)
    
    context = {
        'interviewer': interviewer,
    }
    
    return render(request, 'interviewers/interviewer_detail.html', context)


@login_required
def interviewer_create(request):
    """Создание нового интервьюера"""
    if request.method == 'POST':
        form = InterviewerForm(request.POST)
        if form.is_valid():
            interviewer = form.save()
            messages.success(request, f'Интервьюер {interviewer.get_full_name()} успешно создан!')
            return redirect('interviewers:interviewer_detail', pk=interviewer.pk)
    else:
        form = InterviewerForm()
    
    context = {
        'form': form,
        'title': 'Создание интервьюера',
        'submit_text': 'Создать интервьюера',
    }
    
    return render(request, 'interviewers/interviewer_form.html', context)


@login_required
def interviewer_edit(request, pk):
    """Редактирование интервьюера"""
    interviewer = get_object_or_404(Interviewer, pk=pk)
    
    if request.method == 'POST':
        form = InterviewerForm(request.POST, instance=interviewer)
        if form.is_valid():
            interviewer = form.save()
            messages.success(request, f'Интервьюер {interviewer.get_full_name()} успешно обновлен!')
            return redirect('interviewers:interviewer_detail', pk=interviewer.pk)
    else:
        form = InterviewerForm(instance=interviewer)
    
    context = {
        'form': form,
        'interviewer': interviewer,
        'title': f'Редактирование интервьюера {interviewer.get_full_name()}',
        'submit_text': 'Сохранить изменения',
    }
    
    return render(request, 'interviewers/interviewer_form.html', context)


@login_required
@require_POST
def interviewer_delete(request, pk):
    """Удаление интервьюера"""
    interviewer = get_object_or_404(Interviewer, pk=pk)
    full_name = interviewer.get_full_name()
    
    try:
        interviewer.delete()
        messages.success(request, f'Интервьюер {full_name} успешно удален!')
        return redirect('interviewers:interviewer_list')
    except Exception as e:
        messages.error(request, f'Ошибка при удалении интервьюера: {str(e)}')
        return redirect('interviewers:interviewer_detail', pk=pk)


@login_required
@require_POST
def interviewer_toggle_active(request, pk):
    """Переключение статуса активности интервьюера"""
    # Используем общий обработчик для переключения активности
    result = InterviewerHandler.toggle_active_logic(pk, request)
    
    return JsonResponse(result)


@login_required
def interviewer_dashboard(request):
    """Дашборд интервьюеров"""
    # Получаем статистику через общие обработчики
    interviewer_stats = InterviewerHandler.calculate_interviewer_stats()
    rule_stats = RuleHandler.calculate_rule_stats()
    
    # Получаем последние записи
    recent_interviewers = InterviewerHandler.get_recent_interviewers()
    recent_rules = RuleHandler.get_recent_rules()
    active_rule = RuleHandler.get_active_rule()

    context = {
        **interviewer_stats,
        **rule_stats,
        'recent_interviewers': recent_interviewers,
        'active_rule': active_rule,
        'recent_rules': recent_rules,
    }

    return render(request, 'interviewers/interviewer_dashboard.html', context)


# Views для правил привлечения интервьюеров

@login_required
def rule_list(request):
    """Список правил привлечения"""
    # Получаем параметры поиска
    search_form = InterviewRuleSearchForm(request.GET)
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('is_active', '')
    min_grade_filter = request.GET.get('min_grade', '')
    
    # Базовый queryset
    rules = InterviewRule.objects.select_related('min_grade', 'max_grade').all()
    
    # Применяем фильтры через общий обработчик
    filter_q = RuleHandler.search_rules_logic(search_query, status_filter, min_grade_filter)
    rules = rules.filter(filter_q)
    
    # Пагинация
    paginator = Paginator(rules, 10)  # 10 правил на страницу
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'search_query': search_query,
        'status_filter': status_filter,
        'min_grade_filter': min_grade_filter,
        'total_count': rules.count(),
        'active_count': rules.filter(is_active=True).count(),
        'inactive_count': rules.filter(is_active=False).count(),
    }
    
    return render(request, 'interviewers/rule_list.html', context)


@login_required
def rule_detail(request, pk):
    """Детальная информация о правиле"""
    rule = get_object_or_404(InterviewRule, pk=pk)
    
    context = {
        'rule': rule,
    }
    
    return render(request, 'interviewers/rule_detail.html', context)


@login_required
def rule_create(request):
    """Создание нового правила"""
    if request.method == 'POST':
        form = InterviewRuleForm(request.POST)
        if form.is_valid():
            rule = form.save()
            messages.success(request, f'Правило "{rule.name}" успешно создано!')
            return redirect('interviewers:rule_detail', pk=rule.pk)
    else:
        form = InterviewRuleForm()
    
    context = {
        'form': form,
        'title': 'Создание правила привлечения',
        'submit_text': 'Создать правило',
    }
    
    return render(request, 'interviewers/rule_form.html', context)


@login_required
def rule_edit(request, pk):
    """Редактирование правила"""
    rule = get_object_or_404(InterviewRule, pk=pk)
    
    if request.method == 'POST':
        form = InterviewRuleForm(request.POST, instance=rule)
        if form.is_valid():
            rule = form.save()
            messages.success(request, f'Правило "{rule.name}" успешно обновлено!')
            return redirect('interviewers:rule_detail', pk=rule.pk)
    else:
        form = InterviewRuleForm(instance=rule)
    
    context = {
        'form': form,
        'rule': rule,
        'title': f'Редактирование правила "{rule.name}"',
        'submit_text': 'Сохранить изменения',
    }
    
    return render(request, 'interviewers/rule_form.html', context)


@login_required
@require_POST
def rule_delete(request, pk):
    """Удаление правила"""
    rule = get_object_or_404(InterviewRule, pk=pk)
    rule_name = rule.name
    
    try:
        rule.delete()
        messages.success(request, f'Правило "{rule_name}" успешно удалено!')
        return redirect('interviewers:rule_list')
    except Exception as e:
        messages.error(request, f'Ошибка при удалении правила: {str(e)}')
        return redirect('interviewers:rule_detail', pk=pk)


@login_required
@require_POST
def rule_toggle_active(request, pk):
    """Переключение статуса активности правила"""
    # Используем общий обработчик для переключения активности
    result = RuleHandler.toggle_active_logic(pk, request)
    
    return JsonResponse(result)


# Views для автозаполнения календарей

@login_required
@require_POST
def auto_fill_calendar(request):
    """Автозаполнение календаря для конкретного интервьюера"""
    try:
        import json
        data = json.loads(request.body)
        interviewer_id = data.get('interviewer_id')
        interviewer_email = data.get('interviewer_email')

        # Используем общий обработчик для автозаполнения календаря
        result = CalendarHandler.auto_fill_calendar_logic(
            interviewer_id, interviewer_email, request.user
        )

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при автозаполнении календаря: {str(e)}'
        })


@login_required
@require_POST
def auto_fill_all_calendars(request):
    """Автозаполнение календарей для всех интервьюеров"""
    # Используем общий обработчик для автозаполнения всех календарей
    result = CalendarHandler.auto_fill_all_calendars_logic(request.user)
    
    return JsonResponse(result)
