from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView
)
from django.urls import reverse_lazy, reverse
from django.db.models import Q, Count, Sum, Avg
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta, date
import json

from .models import (
    HiringPlan, HiringPlanPosition, PositionType, PlanPeriodType,
    PositionSLA, PositionKPIOKR, PlanKPIOKRBlock, PlanMetrics
)
from .forms import (
    HiringPlanFormExtended, HiringPlanPositionFormExtended,
    HiringPlanFilterForm, PositionSLAForm, PositionKPIOKRForm,
    PlanKPIOKRBlockForm, PeriodPlanCreationForm
)
from .services import HiringPlanServiceExtended


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
    form_class = HiringPlanFormExtended
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
    form_class = HiringPlanFormExtended
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
    form_class = PeriodPlanCreationForm
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


class PositionSLAListView(LoginRequiredMixin, ListView):
    """Список SLA позиций"""
    model = PositionSLA
    template_name = 'hiring_plan/sla_list.html'
    context_object_name = 'sla_list'
    paginate_by = 20
    
    def get_queryset(self):
        return PositionSLA.objects.select_related('vacancy', 'grade').filter(is_active=True).order_by('vacancy__name', 'grade__name')


class PositionSLACreateView(LoginRequiredMixin, CreateView):
    """Создание SLA позиции"""
    model = PositionSLA
    form_class = PositionSLAForm
    template_name = 'hiring_plan/sla_form.html'
    success_url = reverse_lazy('hiring_plan:sla_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'SLA для "{form.instance.vacancy.name}" успешно создано!')
        return response


class PositionSLAUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование SLA позиции"""
    model = PositionSLA
    form_class = PositionSLAForm
    template_name = 'hiring_plan/sla_form.html'
    success_url = reverse_lazy('hiring_plan:sla_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'SLA для "{form.instance.vacancy.name}" успешно обновлено!')
        return response


class PlanSLACreateView(LoginRequiredMixin, CreateView):
    """Создание SLA для вакансии в плане"""
    model = PositionSLA
    form_class = PositionSLAForm
    template_name = 'hiring_plan/plan_sla_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_sla_compliance', kwargs={'pk': self.kwargs['plan_pk']})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['plan'] = get_object_or_404(HiringPlan, pk=self.kwargs['plan_pk'])
        return context
    
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
    form_class = PlanKPIOKRBlockForm
    template_name = 'hiring_plan/kpi_okr_block_form.html'
    success_url = reverse_lazy('hiring_plan:kpi_okr_block_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'Блок KPI/OKR "{form.instance.name}" успешно создан!')
        return response


class PlanKPIOKRBlockUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование блока KPI/OKR"""
    model = PlanKPIOKRBlock
    form_class = PlanKPIOKRBlockForm
    template_name = 'hiring_plan/kpi_okr_block_form.html'
    success_url = reverse_lazy('hiring_plan:kpi_okr_block_list')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'Блок KPI/OKR "{form.instance.name}" успешно обновлен!')
        return response


class PositionKPIOKRCreateView(LoginRequiredMixin, CreateView):
    """Создание KPI/OKR"""
    model = PositionKPIOKR
    form_class = PositionKPIOKRForm
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
    form_class = PositionKPIOKRForm
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
    form_class = HiringPlanPositionFormExtended
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
    form_class = HiringPlanPositionFormExtended
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