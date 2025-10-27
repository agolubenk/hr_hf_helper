from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
)
from django.urls import reverse_lazy, reverse
from django.db import models
from django.db.models import Q, Count, Sum, Avg
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta, date
import json

from .forms import HiringRequestForm, HiringRequestUpdateForm, VacancySLAForm

from .models import (
    HiringPlan, HiringPlanPosition, PositionType, PlanPeriodType,
    PositionKPIOKR, PlanKPIOKRBlock, PlanMetrics,
    VacancySLA, HiringRequest, RecruitmentMetrics, DemandForecast, RecruiterCapacity
)
from .services import HiringPlanServiceExtended
from .metrics_service import MetricsService


class HiringPlanListView(LoginRequiredMixin, ListView):
    """Список планов найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_list.html'
    context_object_name = 'plans'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = HiringPlan.objects.select_related('period_type', 'owner').prefetch_related('positions')
        
        # Фильтрация
        search = self.request.GET.get('search')
        period_type = self.request.GET.get('period_type')
        is_completed = self.request.GET.get('is_completed')
        owner = self.request.GET.get('owner')
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        if period_type:
            queryset = queryset.filter(period_type_id=period_type)
        
        if is_completed == 'active':
            queryset = queryset.filter(is_completed=False)
        elif is_completed == 'completed':
            queryset = queryset.filter(is_completed=True)
        
        if owner:
            queryset = queryset.filter(owner_id=owner)
        
        return queryset.order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filter_form'] = HiringPlanFilterForm(self.request.GET)
        context['total_plans'] = HiringPlan.objects.count()
        context['active_plans'] = HiringPlan.objects.filter(is_completed=False).count()
        context['completed_plans'] = HiringPlan.objects.filter(is_completed=True).count()
        return context


class HiringPlanDetailView(LoginRequiredMixin, DetailView):
    """Детальный просмотр плана найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_detail.html'
    context_object_name = 'plan'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        plan = self.get_object()
        
        # Позиции плана
        positions = plan.positions.select_related('vacancy', 'position_type').prefetch_related('grades')
        context['positions'] = positions
        
        # Статистика
        context['total_positions'] = positions.count()
        context['total_headcount_needed'] = positions.aggregate(
            total=Sum('headcount_needed'))['total'] or 0
        context['total_headcount_hired'] = positions.aggregate(
            total=Sum('headcount_hired'))['total'] or 0
        
        # Статистика по типам позиций
        position_type_stats = positions.values('position_type__name').annotate(
            count=Count('id'),
            headcount_needed=Sum('headcount_needed'),
            headcount_hired=Sum('headcount_hired')
        )
        context['position_type_stats'] = position_type_stats
        
        # Статистика по грейдам
        grade_stats = positions.values('grades__name').annotate(
            count=Count('id'),
            headcount_needed=Sum('headcount_needed'),
            headcount_hired=Sum('headcount_hired')
        ).filter(grades__isnull=False)
        context['grade_stats'] = grade_stats
        
        # SLA compliance
        sla_compliance = HiringPlanServiceExtended.get_plan_sla_compliance(plan)
        context['sla_compliance'] = sla_compliance
        
        # KPI/OKR summary
        kpi_okr_summary = HiringPlanServiceExtended.get_kpi_okr_summary(plan)
        context['kpi_okr_summary'] = kpi_okr_summary
        
        return context


class HiringPlanCreateView(LoginRequiredMixin, CreateView):
    """Создание плана найма"""
    model = HiringPlan
    # form_class = HiringPlanFormExtended  # Удалено - форма не существует
    template_name = 'hiring_plan/plan_form.html'
    success_url = reverse_lazy('hiring_plan:plan_list')
    
    def form_valid(self, form):
        form.instance.owner = self.request.user
        response = super().form_valid(form)
        messages.success(self.request, f'План "{form.instance.title}" успешно создан!')
        return response


class HiringPlanUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование плана найма"""
    model = HiringPlan
    # form_class = HiringPlanFormExtended  # Удалено - форма не существует
    template_name = 'hiring_plan/plan_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'План "{form.instance.title}" успешно обновлен!')
        return response


class HiringPlanDeleteView(LoginRequiredMixin, DeleteView):
    """Удаление плана найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_confirm_delete.html'
    success_url = reverse_lazy('hiring_plan:plan_list')
    
    def delete(self, request, *args, **kwargs):
        plan = self.get_object()
        messages.success(request, f'План "{plan.title}" успешно удален!')
        return super().delete(request, *args, **kwargs)


class PeriodicPlanCreateView(LoginRequiredMixin, CreateView):
    """Создание периодического плана"""
    template_name = 'hiring_plan/periodic_plan_create.html'
    # form_class = PeriodPlanCreationForm  # Удалено - форма не существует
    success_url = reverse_lazy('hiring_plan:plan_list')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['period_types'] = PlanPeriodType.objects.filter(is_active=True)
        return context
    
    def form_valid(self, form):
        # Создаем план с помощью сервиса
        plan = HiringPlanServiceExtended.create_periodic_plan(
            title=form.cleaned_data['title'],
            period_type=form.cleaned_data['period_type'],
            description=form.cleaned_data.get('description', ''),
            owner=self.request.user
        )
        
        messages.success(self.request, f'Периодический план "{plan.title}" успешно создан!')
        return redirect('hiring_plan:plan_detail', pk=plan.pk)


    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['plan_pk'] = self.kwargs['plan_pk']
        return kwargs
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'SLA для "{form.instance.vacancy.name}" успешно создано!')
        return response


class PlanSLAComplianceView(LoginRequiredMixin, DetailView):
    """SLA compliance для плана"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_sla_compliance.html'
    context_object_name = 'plan'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        plan = self.get_object()
        
        # SLA compliance summary
        sla_compliance = HiringPlanServiceExtended.get_plan_sla_compliance(plan)
        context['sla_compliance'] = sla_compliance
        
        # Position type statistics
        position_type_stats = HiringPlanServiceExtended.get_position_type_statistics(plan)
        context['position_type_stats'] = position_type_stats
        
        # Replacement reasons statistics
        replacement_stats = HiringPlanServiceExtended.get_replacement_reasons_stats(plan)
        context['replacement_stats'] = replacement_stats
        
        return context


class PlanKPIOKRDashboardView(LoginRequiredMixin, DetailView):
    """KPI/OKR dashboard для плана"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_kpi_okr_dashboard.html'
    context_object_name = 'plan'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        plan = self.get_object()
        
        # KPI/OKR summary
        kpi_okr_summary = HiringPlanServiceExtended.get_kpi_okr_summary(plan)
        context['kpi_okr_summary'] = kpi_okr_summary
        
        # KPI/OKR vs SLA comparison
        kpi_okr_vs_sla = HiringPlanServiceExtended.compare_plan_with_kpi_okr(plan)
        context['kpi_okr_vs_sla'] = kpi_okr_vs_sla
        
        return context


class PlanKPIOKRBlockListView(LoginRequiredMixin, ListView):
    """Список блоков KPI/OKR"""
    model = PlanKPIOKRBlock
    template_name = 'hiring_plan/kpi_okr_block_list.html'
    context_object_name = 'blocks'
    paginate_by = 20
    
    def get_queryset(self):
        return PlanKPIOKRBlock.objects.prefetch_related('position_types', 'grades').order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['hiring_plans'] = HiringPlan.objects.filter(is_completed=False).order_by('-created_at')
        return context


class PlanKPIOKRBlockCreateView(LoginRequiredMixin, CreateView):
    """Создание блока KPI/OKR"""
    model = PlanKPIOKRBlock
    # form_class = PlanKPIOKRBlockForm  # Удалено - форма не существует
    template_name = 'hiring_plan/kpi_okr_block_form.html'
    success_url = reverse_lazy('hiring_plan:kpi_okr_block_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'Блок KPI/OKR "{form.instance.name}" успешно создан!')
        return response


class PlanKPIOKRBlockUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование блока KPI/OKR"""
    model = PlanKPIOKRBlock
    # form_class = PlanKPIOKRBlockForm  # Удалено - форма не существует
    template_name = 'hiring_plan/kpi_okr_block_form.html'
    success_url = reverse_lazy('hiring_plan:kpi_okr_block_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'Блок KPI/OKR "{form.instance.name}" успешно обновлен!')
        return response


class PositionKPIOKRCreateView(LoginRequiredMixin, CreateView):
    """Создание KPI/OKR"""
    model = PositionKPIOKR
    # form_class = PositionKPIOKRForm  # Удалено - форма не существует
    template_name = 'hiring_plan/kpi_okr_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.kwargs['plan_pk']})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['plan'] = get_object_or_404(HiringPlan, pk=self.kwargs['plan_pk'])
        return context
    
    def form_valid(self, form):
        form.instance.hiring_plan = get_object_or_404(HiringPlan, pk=self.kwargs['plan_pk'])
        response = super().form_valid(form)
        messages.success(self.request, f'KPI/OKR "{form.instance.name}" успешно создан!')
        return response


class PositionKPIOKRUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование KPI/OKR"""
    model = PositionKPIOKR
    # form_class = PositionKPIOKRForm  # Удалено - форма не существует
    template_name = 'hiring_plan/kpi_okr_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.hiring_plan.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'KPI/OKR "{form.instance.name}" успешно обновлен!')
        return response


class HiringPlanPositionCreateView(LoginRequiredMixin, CreateView):
    """Создание позиции в плане"""
    model = HiringPlanPosition
    # form_class = HiringPlanPositionFormExtended  # Удалено - форма не существует
    template_name = 'hiring_plan/position_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.kwargs['plan_pk']})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['plan'] = get_object_or_404(HiringPlan, pk=self.kwargs['plan_pk'])
        return context
    
    def form_valid(self, form):
        form.instance.hiring_plan = get_object_or_404(HiringPlan, pk=self.kwargs['plan_pk'])
        response = super().form_valid(form)
        messages.success(self.request, f'Позиция "{form.instance.vacancy.name}" успешно добавлена в план!')
        return response


class HiringPlanPositionUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование позиции в плане"""
    model = HiringPlanPosition
    # form_class = HiringPlanPositionFormExtended  # Удалено - форма не существует
    template_name = 'hiring_plan/position_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.hiring_plan.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'Позиция "{form.instance.vacancy.name}" успешно обновлена!')
        return response


class HiringPlanPositionDeleteView(LoginRequiredMixin, DeleteView):
    """Удаление позиции из плана"""
    model = HiringPlanPosition
    template_name = 'hiring_plan/position_confirm_delete.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.hiring_plan.pk})
    
    def delete(self, request, *args, **kwargs):
        position = self.get_object()
        messages.success(request, f'Позиция "{position.vacancy.name}" успешно удалена из плана!')
        return super().delete(request, *args, **kwargs)


@login_required
@require_http_methods(["POST"])
def auto_move_unfilled_positions(request, pk):
    """Автоматическое перемещение незакрытых позиций в следующий период"""
    plan = get_object_or_404(HiringPlan, pk=pk)
    
    try:
        moved_count = HiringPlanServiceExtended.auto_move_unfilled_positions(plan)
        return JsonResponse({
            'success': True,
            'message': f'Успешно перемещено {moved_count} позиций в следующий период'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })


@login_required
def plan_ajax_data(request, pk):
    """AJAX данные для плана (для графиков и статистики)"""
    plan = get_object_or_404(HiringPlan, pk=pk)
    
    # Данные для графиков
    data = {
        'completion_rate': plan.completion_rate,
        'total_positions': plan.total_positions,
        'total_headcount_needed': plan.total_headcount_needed,
        'total_headcount_hired': plan.total_headcount_hired,
        'position_type_stats': list(plan.positions.values('position_type__name').annotate(
            count=Count('id'),
            headcount_needed=Sum('headcount_needed'),
            headcount_hired=Sum('headcount_hired')
        )),
        'grade_stats': list(plan.positions.values('grades__name').annotate(
            count=Count('id'),
            headcount_needed=Sum('headcount_needed'),
            headcount_hired=Sum('headcount_hired')
        ).filter(grades__isnull=False)),
    }
    
    return JsonResponse(data)


@login_required
@require_http_methods(["POST"])
def update_position_headcount(request, pk):
    """Обновление количества нанятых для позиции"""
    position = get_object_or_404(HiringPlanPosition, pk=pk)
    
    try:
        data = json.loads(request.body)
        headcount_hired = int(data.get('headcount_hired', 0))
        
        if headcount_hired < 0:
            return JsonResponse({'success': False, 'error': 'Количество не может быть отрицательным'})
        
        if headcount_hired > position.headcount_needed:
            return JsonResponse({'success': False, 'error': 'Количество нанятых не может превышать требуемое'})
        
        position.headcount_hired = headcount_hired
        position.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Количество нанятых успешно обновлено',
            'fulfillment_rate': position.fulfillment_rate,
            'is_fulfilled': position.is_fulfilled
        })
        
    except (ValueError, KeyError) as e:
        return JsonResponse({'success': False, 'error': 'Неверные данные'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def apply_kpi_okr_block_to_plan(request, plan_pk, block_pk):
    """Применение блока KPI/OKR к плану"""
    plan = get_object_or_404(HiringPlan, pk=plan_pk)
    block = get_object_or_404(PlanKPIOKRBlock, pk=block_pk)
    
    try:
        HiringPlanServiceExtended.apply_kpi_okr_block_to_plan(block, plan)
        messages.success(request, f'Блок KPI/OKR "{block.name}" успешно применен к плану!')
        return redirect('hiring_plan:plan_detail', pk=plan.pk)
    except Exception as e:
        messages.error(request, f'Ошибка при применении блока: {str(e)}')
        return redirect('hiring_plan:plan_detail', pk=plan.pk)


class HiringRequestsListView(LoginRequiredMixin, ListView):
    """Единый список всех заявок на найм"""
    model = HiringRequest
    template_name = 'hiring_plan/hiring_requests_list.html'
    context_object_name = 'requests'
    paginate_by = 50
    
    def get_queryset(self):
        queryset = HiringRequest.objects.select_related(
            'vacancy', 'grade', 'sla', 'created_by', 'closed_by'
        ).order_by('-opening_date', 'priority')
        
        # Фильтры
        status = self.request.GET.get('status')
        period = self.request.GET.get('period')
        grade = self.request.GET.get('grade')
        vacancy = self.request.GET.get('vacancy')
        priority = self.request.GET.get('priority')
        opening_reason = self.request.GET.get('opening_reason')
        recruiter = self.request.GET.get('recruiter')
        search = self.request.GET.get('search')
        
        if status:
            queryset = queryset.filter(status=status)
        
        if period:
            # Фильтрация по месяцу
            try:
                year, month = period.split('-')
                queryset = queryset.filter(opening_date__year=year, opening_date__month=month)
            except ValueError:
                pass
        
        if grade:
            queryset = queryset.filter(grade_id=grade)
        
        if vacancy:
            queryset = queryset.filter(vacancy_id=vacancy)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        if opening_reason:
            queryset = queryset.filter(opening_reason=opening_reason)
        
        if recruiter:
            queryset = queryset.filter(closed_by_id=recruiter)
        
        if search:
            queryset = queryset.filter(
                Q(vacancy__name__icontains=search) |
                Q(candidate_name__icontains=search) |
                Q(candidate_id__icontains=search) |
                Q(notes__icontains=search) |
                Q(project__icontains=search)
            )
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Статистика
        requests = self.get_queryset()
        context['total_requests'] = requests.count()
        context['planned_requests'] = requests.filter(status='planned').count()
        context['in_progress_requests'] = requests.filter(status='in_progress').count()
        context['closed_requests'] = requests.filter(status='closed').count()
        context['cancelled_requests'] = requests.filter(status='cancelled').count()
        
        # Опции для фильтров
        context['status_choices'] = HiringRequest.STATUS_CHOICES
        context['priority_choices'] = HiringRequest.PRIORITY_CHOICES
        context['reason_choices'] = HiringRequest.REASON_CHOICES
        context['grade_choices'] = HiringRequest.objects.values_list('grade__id', 'grade__name').distinct()
        context['vacancy_choices'] = HiringRequest.objects.values_list('vacancy__id', 'vacancy__name').distinct()
        context['recruiter_choices'] = HiringRequest.objects.filter(
            closed_by__isnull=False
        ).values_list('closed_by__id', 'closed_by__username').distinct().order_by('closed_by__username')
        
        return context


class HiringRequestDetailView(LoginRequiredMixin, DetailView):
    """Детальный просмотр заявки"""
    model = HiringRequest
    template_name = 'hiring_plan/hiring_request_detail.html'
    context_object_name = 'request'


class HiringRequestCreateView(LoginRequiredMixin, CreateView):
    """Создание заявки"""
    model = HiringRequest
    form_class = HiringRequestForm
    template_name = 'hiring_plan/hiring_request_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:hiring_requests_list')
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        
        # Если назначен рекрутер, создаем запись в истории назначений
        if form.instance.recruiter:
            form.instance.assign_recruiter(form.instance.recruiter, self.request.user)
        
        messages.success(self.request, f'Заявка "{self.object}" успешно создана!')
        return response


class HiringRequestUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование заявки"""
    model = HiringRequest
    form_class = HiringRequestUpdateForm
    template_name = 'hiring_plan/hiring_request_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:hiring_requests_list')
    
    def form_valid(self, form):
        # Сохраняем старые значения для сравнения
        old_opening_date = self.object.opening_date
        old_recruiter = self.object.recruiter
        
        # Если поле opening_date скрыто (для незапланированных заявок), 
        # сохраняем текущее значение
        if self.object.status != 'planned':
            if self.object.opening_date:
                form.instance.opening_date = self.object.opening_date
            else:
                # Если по какой-то причине opening_date отсутствует, устанавливаем текущую дату
                from django.utils import timezone
                form.instance.opening_date = timezone.now().date()
        
        response = super().form_valid(form)
        
        # Если изменилась дата открытия, пересчитываем статус
        if old_opening_date != self.object.opening_date:
            self.object.save()  # Это вызовет post_save сигнал, который пересчитает статус
        
        # Если изменился рекрутер, обновляем назначение
        if old_recruiter != self.object.recruiter:
            if self.object.recruiter:
                self.object.assign_recruiter(self.object.recruiter, self.request.user)
            else:
                self.object.unassign_recruiter(self.request.user)
        
        messages.success(self.request, f'Заявка "{self.object}" успешно обновлена!')
        return response


# SLA Views
class VacancySLAListView(LoginRequiredMixin, ListView):
    """Список SLA для вакансий"""
    model = VacancySLA
    template_name = 'hiring_plan/sla_list.html'
    context_object_name = 'slas'
    paginate_by = 50
    
    def get_queryset(self):
        queryset = VacancySLA.objects.select_related('vacancy', 'grade').order_by('vacancy__name', 'grade__name')
        
        # Фильтр по вакансии
        vacancy_id = self.request.GET.get('vacancy')
        if vacancy_id:
            queryset = queryset.filter(vacancy_id=vacancy_id)
        
        # Фильтр по грейду
        grade_id = self.request.GET.get('grade')
        if grade_id:
            queryset = queryset.filter(grade_id=grade_id)
        
        # Фильтр по активности
        is_active = self.request.GET.get('is_active')
        if is_active in ['true', 'false']:
            queryset = queryset.filter(is_active=is_active == 'true')
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Добавляем списки для фильтров
        from apps.vacancies.models import Vacancy
        from apps.finance.models import Grade
        
        context['vacancies'] = Vacancy.objects.filter(is_active=True).order_by('name')
        context['grades'] = Grade.objects.all().order_by('name')
        
        # Добавляем текущие значения фильтров
        context['current_vacancy'] = self.request.GET.get('vacancy', '')
        context['current_grade'] = self.request.GET.get('grade', '')
        context['current_is_active'] = self.request.GET.get('is_active', '')
        
        # Проверяем, можно ли создавать новые SLA (только для активных вакансий)
        active_vacancies = Vacancy.objects.filter(is_active=True)
        all_grades = Grade.objects.all()
        total_possible_slas = active_vacancies.count() * all_grades.count()
        existing_slas_for_active = VacancySLA.objects.filter(vacancy__in=active_vacancies).count()
        
        context['can_create_sla'] = existing_slas_for_active < total_possible_slas
        context['sla_coverage'] = {
            'existing': existing_slas_for_active,
            'total': total_possible_slas,
            'percentage': round((existing_slas_for_active / total_possible_slas * 100), 1) if total_possible_slas > 0 else 0
        }
        
        return context


class VacancySLACreateView(LoginRequiredMixin, CreateView):
    """Создание SLA для вакансии"""
    model = VacancySLA
    form_class = VacancySLAForm
    template_name = 'hiring_plan/sla_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:sla_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'SLA для "{self.object}" успешно создан!')
        return response


class VacancySLAUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование SLA для вакансии"""
    model = VacancySLA
    form_class = VacancySLAForm
    template_name = 'hiring_plan/sla_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:sla_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'SLA для "{self.object}" успешно обновлен!')
        return response


# Metrics Views
class MetricsDashboardView(LoginRequiredMixin, TemplateView):
    """Dashboard с метриками и KPI"""
    template_name = 'hiring_plan/metrics_dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Получаем период из параметров запроса
        period_type = self.request.GET.get('period', 'current_quarter')
        
        # Получаем даты периода
        period_start, period_end = MetricsService.get_period_dates(period_type)
        
        # Рассчитываем метрики
        metrics = MetricsService.calculate_recruitment_metrics(
            period_start, period_end
        )
        
        # Мощность команды (также для выбранного периода)
        team_capacity = MetricsService.get_team_capacity_summary(period_start, period_end)
        
        # KPI Cards
        context['kpi_cards'] = {
            'avg_time_to_offer': metrics.avg_time_to_offer,
            'hiring_velocity': metrics.hiring_velocity_weekly,
            'sla_compliance': metrics.sla_compliance_rate,
            'days_behind_schedule': metrics.avg_days_behind_schedule,
        }
        
        # Данные для графиков
        context['metrics'] = metrics
        context['team_capacity'] = team_capacity
        # Варианты периодов
        period_choices = [
            ('current_month', 'Текущий месяц'),
            ('current_quarter', 'Текущий квартал'),
            ('last_month', 'Прошлый месяц'),
            ('last_quarter', 'Прошлый квартал'),
            ('last_6_months', 'Последние 6 месяцев'),
            ('last_year', 'Прошлый год'),
            ('current_year', 'Текущий год'),
            ('all_time', 'Все время'),
            ('custom', 'Выбрать период вручную'),
        ]
        
        # Описание периода
        period_descriptions = {
            'current_month': 'Текущий месяц',
            'current_quarter': 'Текущий квартал',
            'last_month': 'Прошлый месяц',
            'last_quarter': 'Прошлый квартал',
            'last_6_months': 'Последние 6 месяцев',
            'last_year': 'Прошлый год',
            'current_year': 'Текущий год',
            'all_time': 'Все время',
            'custom': 'Выбрать период вручную',
        }
        
        context['period_info'] = {
            'start': period_start,
            'end': period_end,
            'type': period_type,
            'description': period_descriptions.get(period_type, 'Текущий квартал'),
            'full_description': f'{period_descriptions.get(period_type, "Текущий квартал")} ({period_start.strftime("%d.%m.%Y")} - {period_end.strftime("%d.%m.%Y")})'
        }
        context['period_choices'] = period_choices
        context['current_period'] = period_type
        
        # Прогнозы (для следующего периода того же типа)
        from apps.vacancies.models import Vacancy
        vacancies = Vacancy.objects.all()[:5]
        forecasts = []
        
        # Определяем период для прогноза на основе выбранного периода
        forecast_period = 'next_month'
        if period_type in ['current_quarter', 'last_quarter']:
            forecast_period = 'next_quarter'
        elif period_type in ['current_year', 'last_year']:
            forecast_period = 'next_year'
            
        for vacancy in vacancies:
            try:
                forecast = MetricsService.forecast_demand(vacancy, forecast_period=forecast_period)
                forecasts.append(forecast)
            except:
                pass  # Игнорируем ошибки прогнозирования
        context['forecasts'] = forecasts
        
        return context


class MetricsListView(LoginRequiredMixin, ListView):
    """Список всех метрик"""
    model = RecruitmentMetrics
    template_name = 'hiring_plan/metrics_list.html'
    context_object_name = 'metrics_list'
    paginate_by = 20
    
    def get_queryset(self):
        return RecruitmentMetrics.objects.select_related('vacancy', 'grade').order_by('-period_start')


class ForecastsListView(LoginRequiredMixin, ListView):
    """Список прогнозов"""
    model = DemandForecast
    template_name = 'hiring_plan/forecasts_list.html'
    context_object_name = 'forecasts'
    paginate_by = 20
    
    def get_queryset(self):
        return DemandForecast.objects.select_related('vacancy', 'grade', 'created_by').order_by('-forecast_start')


class RecruiterCapacityListView(LoginRequiredMixin, ListView):
    """Список мощностей рекрутеров"""
    model = RecruiterCapacity
    template_name = 'hiring_plan/recruiter_capacity_list.html'
    context_object_name = 'capacities'
    paginate_by = 20
    
    def get_queryset(self):
        return RecruiterCapacity.objects.select_related('recruiter').order_by('-period_start', 'recruiter')


@login_required
def get_available_grades(request):
    """AJAX endpoint для получения доступных грейдов для вакансии"""
    vacancy_id = request.GET.get('vacancy_id')
    
    if not vacancy_id:
        return JsonResponse({'error': 'vacancy_id is required'}, status=400)
    
    try:
        from apps.vacancies.models import Vacancy
        from apps.finance.models import Grade
        
        # Получаем вакансию
        vacancy = Vacancy.objects.get(id=vacancy_id)
        
        # Получаем все грейды
        all_grades = Grade.objects.all()
        
        # Получаем грейды, для которых уже созданы SLA
        existing_grades = VacancySLA.objects.filter(vacancy=vacancy).values_list('grade', flat=True)
        
        # Находим доступные грейды
        available_grades = all_grades.exclude(id__in=existing_grades)
        
        # Формируем ответ
        data = {
            'available_grades': [
                {'id': grade.id, 'name': grade.name}
                for grade in available_grades
            ],
            'total_grades': all_grades.count(),
            'existing_grades': len(existing_grades),
            'available_count': available_grades.count()
        }
        
        return JsonResponse(data)
        
    except Vacancy.DoesNotExist:
        return JsonResponse({'error': 'Vacancy not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


class YearlyHiringPlanView(LoginRequiredMixin, TemplateView):
    """Годовая таблица заявок с цветными ячейками по месяцам"""
    template_name = 'hiring_plan/yearly_hiring_plan.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Получаем год из параметров (по умолчанию текущий год)
        year = int(self.request.GET.get('year', timezone.now().year))
        context['year'] = year
        
        # Получаем все заявки за год + переходящие (открытые до года, но не закрытые)
        requests = HiringRequest.objects.filter(
            models.Q(opening_date__year=year) |  # Заявки, открытые в этом году
            models.Q(
                opening_date__year__lt=year,  # Открытые до этого года
                status__in=['in_progress', 'planned']  # Но не закрытые
            )
        ).select_related('vacancy', 'grade', 'sla', 'closed_by', 'recruiter').order_by('vacancy__name', 'grade__name')
        
        # Создаем данные для таблицы
        table_data = []
        for request in requests:
            # Считаем общее количество дней работы (включая предыдущие годы)
            days_in_year = 0
            if request.status in ['in_progress', 'closed', 'cancelled']:
                from datetime import datetime
                start_date = request.opening_date
                
                # Для закрытых и отмененных заявок используем дату закрытия, для остальных - текущую дату
                if request.status in ['closed', 'cancelled'] and request.closed_date:
                    end_date = request.closed_date
                else:
                    end_date = timezone.now().date()
                
                # Ограничиваем только конец периода выбранным годом
                year_end = datetime(year, 12, 31).date()
                if end_date > year_end:
                    end_date = year_end
                
                # Если это текущий год, ограничиваем текущей датой (только для активных заявок)
                if year == timezone.now().year and request.status not in ['closed', 'cancelled']:
                    today = timezone.now().date()
                    if end_date > today:
                        end_date = today
                
                # Считаем общее количество дней работы
                days_in_year = (end_date - start_date).days + 1
                
                if days_in_year < 0:
                    days_in_year = 0
            
            row_data = {
                'request': request,
                'request_id': request.id,
                'vacancy': request.vacancy.name,
                'grade': request.grade.name,
                'project': request.project or '-',
                'sla_days': request.sla.time_to_offer if request.sla else '-',
                'sla_time2hire': request.sla.time_to_hire if request.sla else '-',
                'opening_date': request.opening_date,
                'deadline': request.deadline,
                'status': request.status,
                'days_in_year': days_in_year,
                'months': self._get_monthly_data(request, year),
                'closed_by': request.closed_by,
                'recruiter': request.recruiter,
                'time2hire': request.time2hire
            }
            table_data.append(row_data)
        
        context['table_data'] = table_data
        context['months'] = [
            'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ]
        
        # Доступные годы для фильтра
        years = HiringRequest.objects.values_list('opening_date__year', flat=True).distinct().order_by('-opening_date__year')
        context['available_years'] = years
        
        # Рассчитываем медианы
        context['medians'] = self._calculate_medians(requests, year)
        
        return context
    
    def _calculate_medians(self, requests, year):
        """Рассчитать медианы согласно алгоритму"""
        import statistics
        from datetime import datetime, timedelta
        
        medians = {}
        
        # 1. Медианный грейд специалистов (по id грейда)
        grade_ids = [request.grade.id for request in requests]
        if grade_ids:
            grade_ids.sort()
            if len(grade_ids) % 2 == 1:
                median_grade_id = grade_ids[len(grade_ids) // 2]
            else:
                mid1 = grade_ids[len(grade_ids) // 2 - 1]
                mid2 = grade_ids[len(grade_ids) // 2]
                median_grade_id = (mid1 + mid2) / 2
            
            # Находим название грейда по ID
            try:
                median_grade = next((request.grade.name for request in requests if request.grade.id == int(median_grade_id)), 
                                  f"ID: {median_grade_id}")
            except ValueError:
                median_grade = f"ID: {median_grade_id}"
            
            medians['grade'] = median_grade
        else:
            medians['grade'] = "—"
        
        # 2. Медиана дней в месяце для вакансий (все переходящие вакансии дробим)
        # Алгоритм: Для каждой вакансии считаем полный срок работы к моменту каждого месяца
        monthly_days = {i: [] for i in range(1, 13)}  # 1-12 месяцы
        
        for request in requests:
            original_start_date = request.opening_date
            end_date = request.closed_date or timezone.now().date()
            
            # Для каждого месяца в выбранном году считаем полный срок работы с заявкой
            for month in range(1, 13):
                # Определяем конец месяца для расчета
                if month == 12:
                    month_end = datetime(year, 12, 31).date()
                else:
                    month_end = datetime(year, month + 1, 1).date() - timedelta(days=1)
                
                # Если заявка еще не началась к концу этого месяца, пропускаем
                if original_start_date > month_end:
                    continue
                
                # Если заявка уже закрыта к началу этого месяца, пропускаем
                if request.closed_date and request.closed_date < datetime(year, month, 1).date():
                    continue
                
                # Определяем дату окончания для расчета (конец месяца или дата закрытия)
                calculation_end = min(month_end, end_date)
                
                # Считаем полный срок работы с заявкой к концу этого месяца
                total_days = (calculation_end - original_start_date).days + 1
                
                if total_days > 0:
                    monthly_days[month].append(total_days)
        
        # Рассчитываем медиану для каждого месяца
        monthly_medians = {}
        for month, days_list in monthly_days.items():
            if days_list:
                days_list.sort()
                if len(days_list) % 2 == 1:
                    # Нечетное число - берем средний элемент
                    median_days = days_list[len(days_list) // 2]
                else:
                    # Четное число - среднее из двух средних
                    mid1 = days_list[len(days_list) // 2 - 1]
                    mid2 = days_list[len(days_list) // 2]
                    median_days = (mid1 + mid2) / 2
                monthly_medians[month] = median_days
            else:
                monthly_medians[month] = 0
        
        medians['monthly_days'] = monthly_medians
        
        # 3. Медиана SLA (все значения в днях)
        sla_days = [request.sla.time_to_offer for request in requests if request.sla]
        if sla_days:
            sla_days.sort()
            if len(sla_days) % 2 == 1:
                median_sla = sla_days[len(sla_days) // 2]
            else:
                mid1 = sla_days[len(sla_days) // 2 - 1]
                mid2 = sla_days[len(sla_days) // 2]
                median_sla = (mid1 + mid2) / 2
            medians['sla'] = f"{median_sla:.0f}д"
        else:
            medians['sla'] = "—"
        
        # 4. Медиана "в работе (дней)" - полное количество дней работы с заявкой
        work_days = []
        for request in requests:
            if request.status in ['in_progress', 'closed', 'cancelled']:  # Включаем отмененные
                # Считаем полное количество дней работы с заявкой (включая все предыдущие периоды)
                start_date = request.opening_date
                
                # Для закрытых и отмененных заявок используем дату закрытия, для остальных - текущую дату
                if request.status in ['closed', 'cancelled'] and request.closed_date:
                    end_date = request.closed_date
                else:
                    end_date = timezone.now().date()
                
                # Считаем полное количество дней работы (без ограничений по годам)
                total_days = (end_date - start_date).days + 1
                
                if total_days > 0:
                    work_days.append(total_days)
        
        if work_days:
            work_days.sort()
            if len(work_days) % 2 == 1:
                median_work_days = work_days[len(work_days) // 2]
            else:
                mid1 = work_days[len(work_days) // 2 - 1]
                mid2 = work_days[len(work_days) // 2]
                median_work_days = (mid1 + mid2) / 2
            medians['work_days'] = f"{median_work_days:.0f}д"
        else:
            medians['work_days'] = "—"
        
        # 5. Средние значения (аналогично медианам)
        averages = {}
        
        # 5.1. Средний грейд специалистов (по id грейда)
        if grade_ids:
            average_grade_id = sum(grade_ids) / len(grade_ids)
            try:
                average_grade = next((request.grade.name for request in requests if request.grade.id == int(average_grade_id)), 
                                  f"ID: {average_grade_id:.1f}")
            except ValueError:
                average_grade = f"ID: {average_grade_id:.1f}"
            averages['grade'] = average_grade
        else:
            averages['grade'] = "—"
        
        # 5.2. Среднее дней в месяце для вакансий (используем те же данные что и для медианы)
        monthly_averages = {}
        for month, days_list in monthly_days.items():
            if days_list:
                average_days = sum(days_list) / len(days_list)
                monthly_averages[month] = average_days
            else:
                monthly_averages[month] = 0
        averages['monthly_days'] = monthly_averages
        
        # 5.3. Среднее SLA (все значения в днях)
        if sla_days:
            average_sla = sum(sla_days) / len(sla_days)
            averages['sla'] = f"{average_sla:.0f}д"
        else:
            averages['sla'] = "—"
        
        # 5.4. Среднее "в работе (дней)" - общее количество дней работы
        if work_days:
            average_work_days = sum(work_days) / len(work_days)
            averages['work_days'] = f"{average_work_days:.0f}д"
        else:
            averages['work_days'] = "—"
        
        # 5.5. Среднее для T2H
        time2hire_values = [request.time2hire for request in requests if request.time2hire is not None]
        if time2hire_values:
            average_time2hire = sum(time2hire_values) / len(time2hire_values)
            averages['time2hire'] = f"{average_time2hire:.0f}д"
        else:
            averages['time2hire'] = "—"
        
        # 5.6. Среднее для SLA T2H
        sla_time2hire_values = [request.sla.time_to_hire for request in requests if request.sla and request.sla.time_to_hire]
        if sla_time2hire_values:
            average_sla_time2hire = sum(sla_time2hire_values) / len(sla_time2hire_values)
            averages['sla_time2hire'] = f"{average_sla_time2hire:.0f}д"
        else:
            averages['sla_time2hire'] = "—"
        
        # 6. Медиана для T2H
        if time2hire_values:
            time2hire_values.sort()
            if len(time2hire_values) % 2 == 1:
                median_time2hire = time2hire_values[len(time2hire_values) // 2]
            else:
                mid1 = time2hire_values[len(time2hire_values) // 2 - 1]
                mid2 = time2hire_values[len(time2hire_values) // 2]
                median_time2hire = (mid1 + mid2) / 2
            medians['time2hire'] = f"{median_time2hire:.0f}д"
        else:
            medians['time2hire'] = "—"
        
        # 7. Медиана для SLA T2H
        if sla_time2hire_values:
            sla_time2hire_values.sort()
            if len(sla_time2hire_values) % 2 == 1:
                median_sla_time2hire = sla_time2hire_values[len(sla_time2hire_values) // 2]
            else:
                mid1 = sla_time2hire_values[len(sla_time2hire_values) // 2 - 1]
                mid2 = sla_time2hire_values[len(sla_time2hire_values) // 2]
                median_sla_time2hire = (mid1 + mid2) / 2
            medians['sla_time2hire'] = f"{median_sla_time2hire:.0f}д"
        else:
            medians['sla_time2hire'] = "—"
        
        # 8. Процент закрытых вакансий
        total_requests = len(requests)
        closed_requests = len([r for r in requests if r.status == 'closed'])
        if total_requests > 0:
            closed_percentage = (closed_requests / total_requests) * 100
            medians['closed_percentage'] = f"{closed_percentage:.1f}%"
        else:
            medians['closed_percentage'] = "0%"
        
        # Добавляем средние значения в результат
        medians['averages'] = averages
        
        return medians
    
    def _get_monthly_data(self, request, year):
        """Получить данные по месяцам для заявки"""
        months = {}
        
        # Определяем период работы над заявкой
        start_date = request.opening_date
        end_date = request.closed_date or timezone.now().date()
        
        # Для планируемых заявок показываем только месяц планируемого открытия
        if request.status == 'planned':
            planned_month = start_date.month
            if start_date.year == year:
                for month in range(1, 13):
                    if month == planned_month:
                        months[month] = {
                            'color': 'lightblue',
                            'active': True
                        }
                    else:
                        months[month] = {
                            'color': 'transparent',
                            'active': False
                        }
            else:
                # Если планируемая заявка не в этом году, не показываем
                for month in range(1, 13):
                    months[month] = {
                        'color': 'transparent',
                        'active': False
                    }
            return months
        
        # Если заявка открыта в другом году, начинаем с января (переходящие заявки)
        if start_date.year < year:
            start_date = timezone.datetime(year, 1, 1).date()
        
        # Если заявка закрыта в другом году, заканчиваем в декабре
        if end_date.year > year:
            end_date = timezone.datetime(year, 12, 31).date()
        
        # Заполняем месяцы
        for month in range(1, 13):
            month_start = timezone.datetime(year, month, 1).date()
            if month == 12:
                month_end = timezone.datetime(year, 12, 31).date()
            else:
                month_end = timezone.datetime(year, month + 1, 1).date() - timezone.timedelta(days=1)
            
            # Проверяем, пересекается ли заявка с этим месяцем
            if start_date <= month_end and end_date >= month_start:
                # Определяем цвет ячейки
                color = self._get_cell_color(request, month_start, month_end)
                months[month] = {
                    'color': color,
                    'active': True
                }
            else:
                months[month] = {
                    'color': 'transparent',
                    'active': False
                }
        
        return months
    
    def _get_cell_color(self, request, month_start, month_end):
        """Определить цвет ячейки на основе статуса заявки"""
        if request.status == 'cancelled':
            return 'gray'
        elif request.status == 'closed':
            if request.closed_date and request.deadline:
                if request.closed_date <= request.deadline:
                    return 'green'  # Закрыто в срок
                else:
                    return 'red'    # Закрыто с просрочкой
            else:
                return 'green'  # Закрыто (нет дедлайна)
        elif request.status == 'in_progress':
            # Проверяем, просрочена ли заявка
            if request.deadline and timezone.now().date() > request.deadline:
                return 'yellow'  # Просрочена в работе
            else:
                return 'blue'  # В работе
        elif request.status == 'planned':
            return 'lightblue'  # Планируется
        else:
            return 'lightgray'  # Остальные статусы


