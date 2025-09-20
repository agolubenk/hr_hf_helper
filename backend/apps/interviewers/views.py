from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Interviewer, InterviewRule
from .forms import InterviewerForm, InterviewerSearchForm, InterviewRuleForm, InterviewRuleSearchForm
from .services import InterviewerCalendarService


@login_required
def interviewer_list(request):
    """Список интервьюеров"""
    # Получаем параметры поиска
    search_form = InterviewerSearchForm(request.GET)
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('is_active', '')
    
    # Базовый queryset
    interviewers = Interviewer.objects.all()
    
    # Применяем фильтры
    if search_query:
        interviewers = interviewers.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(middle_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
    
    if status_filter == 'true':
        interviewers = interviewers.filter(is_active=True)
    elif status_filter == 'false':
        interviewers = interviewers.filter(is_active=False)
    
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
    """Детальная информация об интервьюере"""
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
    interviewer = get_object_or_404(Interviewer, pk=pk)
    
    try:
        interviewer.is_active = not interviewer.is_active
        interviewer.save()
        
        status = 'активирован' if interviewer.is_active else 'деактивирован'
        messages.success(request, f'Интервьюер {interviewer.get_full_name()} {status}!')
        
        return JsonResponse({
            'success': True,
            'is_active': interviewer.is_active,
            'message': f'Интервьюер {status}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
def interviewer_dashboard(request):
    """Дашборд интервьюеров"""
    total_interviewers = Interviewer.objects.count()
    active_interviewers = Interviewer.objects.filter(is_active=True).count()
    inactive_interviewers = Interviewer.objects.filter(is_active=False).count()
    
    # Статистика по правилам
    total_rules = InterviewRule.objects.count()
    active_rules = InterviewRule.objects.filter(is_active=True).count()
    inactive_rules = InterviewRule.objects.filter(is_active=False).count()
    active_rule = InterviewRule.get_active_rule()
    
    # Последние добавленные интервьюеры
    recent_interviewers = Interviewer.objects.order_by('-created_at')[:5]
    
    # Последние добавленные правила
    recent_rules = InterviewRule.objects.select_related('min_grade', 'max_grade').order_by('-created_at')[:5]
    
    context = {
        'total_interviewers': total_interviewers,
        'active_interviewers': active_interviewers,
        'inactive_interviewers': inactive_interviewers,
        'recent_interviewers': recent_interviewers,
        'total_rules': total_rules,
        'active_rules': active_rules,
        'inactive_rules': inactive_rules,
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
    
    # Применяем фильтры
    if search_query:
        rules = rules.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    if status_filter == 'true':
        rules = rules.filter(is_active=True)
    elif status_filter == 'false':
        rules = rules.filter(is_active=False)
    
    if min_grade_filter:
        rules = rules.filter(min_grade_id=min_grade_filter)
    
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
    rule = get_object_or_404(InterviewRule, pk=pk)
    
    try:
        rule.is_active = not rule.is_active
        rule.save()  # Автоматически деактивирует другие правила
        
        status = 'активировано' if rule.is_active else 'деактивировано'
        messages.success(request, f'Правило "{rule.name}" {status}!')
        
        return JsonResponse({
            'success': True,
            'is_active': rule.is_active,
            'message': f'Правило {status}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


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
        
        calendar_service = InterviewerCalendarService(request.user)
        
        if interviewer_id:
            # Поиск по ID интервьюера (для существующих интервьюеров)
            interviewer = get_object_or_404(Interviewer, pk=interviewer_id)
            email = interviewer.email
            
            # Получаем ссылку на календарь
            calendar_link = calendar_service.get_calendar_link_for_interviewer(email)
            
            if calendar_link:
                interviewer.calendar_link = calendar_link
                interviewer.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Календарь для {interviewer.get_full_name()} успешно обновлен',
                    'calendar_link': calendar_link
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Не удалось найти календарь для {email}'
                })
                
        elif interviewer_email:
            # Поиск по email (для форм создания/редактирования)
            calendar_link = calendar_service.get_calendar_link_for_interviewer(interviewer_email)
            
            if calendar_link:
                return JsonResponse({
                    'success': True,
                    'message': f'Календарь для {interviewer_email} найден',
                    'calendar_link': calendar_link
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Не удалось найти календарь для {interviewer_email}'
                })
        else:
            return JsonResponse({
                'success': False,
                'error': 'ID интервьюера или email не указан'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при автозаполнении календаря: {str(e)}'
        })


@login_required
@require_POST
def auto_fill_all_calendars(request):
    """Автозаполнение календарей для всех интервьюеров"""
    try:
        calendar_service = InterviewerCalendarService(request.user)
        updated_count = calendar_service.auto_fill_calendar_links()
        
        return JsonResponse({
            'success': True,
            'message': f'Обновлено {updated_count} интервьюеров',
            'updated_count': updated_count
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при автозаполнении календарей: {str(e)}'
        })
