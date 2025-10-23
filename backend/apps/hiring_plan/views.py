from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy, reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse

from .models import HiringPlan, HiringPlanPosition, PlanMetrics
from .forms import HiringPlanForm, HiringPlanPositionForm, HiringPlanFilterForm
from .services import HiringPlanService


class PlanListView(LoginRequiredMixin, ListView):
    """Список планов найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_list.html'
    context_object_name = 'plans'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = HiringPlan.objects.select_related('owner', 'responsible_recruiter').prefetch_related('positions')
        
        # Применяем фильтры
        form = HiringPlanFilterForm(self.request.GET)
        if form.is_valid():
            search = form.cleaned_data.get('search')
            status = form.cleaned_data.get('status')
            responsible_recruiter = form.cleaned_data.get('responsible_recruiter')
            start_date_from = form.cleaned_data.get('start_date_from')
            start_date_to = form.cleaned_data.get('start_date_to')
            
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )
            
            if status:
                queryset = queryset.filter(status=status)
            
            if responsible_recruiter:
                queryset = queryset.filter(responsible_recruiter=responsible_recruiter)
            
            if start_date_from:
                queryset = queryset.filter(start_date__gte=start_date_from)
            
            if start_date_to:
                queryset = queryset.filter(start_date__lte=start_date_to)
        
        return queryset.order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filter_form'] = HiringPlanFilterForm(self.request.GET)
        context['summary'] = HiringPlanService.get_plans_summary()
        return context


class PlanDetailView(LoginRequiredMixin, DetailView):
    """Детальный просмотр плана найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_detail.html'
    context_object_name = 'plan'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        plan = self.get_object()
        context['positions'] = plan.positions.select_related('vacancy').prefetch_related('grades').order_by('priority', 'urgency_deadline')
        context['dashboard_data'] = HiringPlanService.get_dashboard_data(plan)
        return context


class PlanCreateView(LoginRequiredMixin, CreateView):
    """Создание плана найма"""
    model = HiringPlan
    form_class = HiringPlanForm
    template_name = 'hiring_plan/plan_form.html'
    success_url = reverse_lazy('hiring_plan:plan_list')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'План найма успешно создан!')
        return super().form_valid(form)


class PlanUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование плана найма"""
    model = HiringPlan
    form_class = HiringPlanForm
    template_name = 'hiring_plan/plan_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.pk})
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'План найма успешно обновлен!')
        return super().form_valid(form)


class PlanDeleteView(LoginRequiredMixin, DeleteView):
    """Удаление плана найма"""
    model = HiringPlan
    template_name = 'hiring_plan/plan_confirm_delete.html'
    success_url = reverse_lazy('hiring_plan:plan_list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'План найма успешно удален!')
        return super().delete(request, *args, **kwargs)


class PositionCreateView(LoginRequiredMixin, CreateView):
    """Добавление позиции в план найма"""
    model = HiringPlanPosition
    form_class = HiringPlanPositionForm
    template_name = 'hiring_plan/position_form.html'
    
    def dispatch(self, request, *args, **kwargs):
        self.hiring_plan = get_object_or_404(HiringPlan, pk=kwargs['plan_pk'])
        return super().dispatch(request, *args, **kwargs)
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['hiring_plan'] = self.hiring_plan
        return kwargs
    
    def form_valid(self, form):
        form.instance.hiring_plan = self.hiring_plan
        messages.success(self.request, 'Позиция успешно добавлена в план!')
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.hiring_plan.pk})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['hiring_plan'] = self.hiring_plan
        return context


class PositionUpdateView(LoginRequiredMixin, UpdateView):
    """Редактирование позиции в плане найма"""
    model = HiringPlanPosition
    form_class = HiringPlanPositionForm
    template_name = 'hiring_plan/position_form.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.hiring_plan.pk})
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['hiring_plan'] = self.object.hiring_plan
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'Позиция успешно обновлена!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['hiring_plan'] = self.object.hiring_plan
        return context


class PositionDeleteView(LoginRequiredMixin, DeleteView):
    """Удаление позиции из плана найма"""
    model = HiringPlanPosition
    template_name = 'hiring_plan/position_confirm_delete.html'
    
    def get_success_url(self):
        return reverse('hiring_plan:plan_detail', kwargs={'pk': self.object.hiring_plan.pk})
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Позиция успешно удалена из плана!')
        return super().delete(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['hiring_plan'] = self.object.hiring_plan
        return context


@login_required
def update_position_headcount(request, pk):
    """AJAX обновление количества нанятых/в процессе для позиции"""
    if request.method == 'POST':
        position = get_object_or_404(HiringPlanPosition, pk=pk)
        
        headcount_hired = request.POST.get('headcount_hired', 0)
        headcount_in_progress = request.POST.get('headcount_in_progress', 0)
        
        try:
            headcount_hired = int(headcount_hired)
            headcount_in_progress = int(headcount_in_progress)
            
            # Валидация
            if headcount_hired > position.headcount_needed:
                return JsonResponse({
                    'success': False,
                    'error': 'Количество нанятых не может превышать требуемое'
                })
            
            if headcount_in_progress > (position.headcount_needed - headcount_hired):
                return JsonResponse({
                    'success': False,
                    'error': 'Количество в процессе не может превышать оставшееся'
                })
            
            # Обновляем
            position.headcount_hired = headcount_hired
            position.headcount_in_progress = headcount_in_progress
            position.save()
            
            return JsonResponse({
                'success': True,
                'fulfillment_rate': position.fulfillment_rate,
                'remaining_headcount': position.remaining_headcount,
                'is_fulfilled': position.is_fulfilled,
                'completion_rate': position.hiring_plan.completion_rate
            })
            
        except ValueError:
            return JsonResponse({
                'success': False,
                'error': 'Некорректные данные'
            })
    
    return JsonResponse({'success': False, 'error': 'Метод не поддерживается'})


@login_required
def plan_dashboard(request, pk):
    """Дашборд плана найма с метриками"""
    plan = get_object_or_404(HiringPlan, pk=pk)
    dashboard_data = HiringPlanService.get_dashboard_data(plan)
    
    context = {
        'plan': plan,
        'dashboard_data': dashboard_data,
    }
    
    return render(request, 'hiring_plan/plan_dashboard.html', context)