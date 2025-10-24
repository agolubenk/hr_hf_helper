from django.db.models import Avg, Count, Q, F, Sum
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import (
    HiringRequest, RecruitmentMetrics, DemandForecast, RecruiterCapacity,
    VacancySLA
)
from django.contrib.auth import get_user_model

User = get_user_model()


class MetricsService:
    """Сервис для расчета всех метрик"""
    
    @staticmethod
    def calculate_recruitment_metrics(period_start, period_end, 
                                      vacancy=None, grade=None, project=None):
        """Рассчитать метрики найма за период"""
        
        # Фильтруем заявки
        requests = HiringRequest.objects.filter(
            opening_date__range=[period_start, period_end]
        )
        
        if vacancy:
            requests = requests.filter(vacancy=vacancy)
        if grade:
            requests = requests.filter(grade=grade)
        if project:
            requests = requests.filter(project=project)
        
        # Закрытые заявки
        closed_requests = requests.filter(status='closed', closed_date__isnull=False)
        
        # === TIME-TO-FILL ===
        if closed_requests.exists():
            time_to_fill_values = []
            for req in closed_requests:
                days = (req.closed_date - req.opening_date).days
                time_to_fill_values.append(days)
            
            avg_time_to_fill = sum(time_to_fill_values) / len(time_to_fill_values)
            median_time_to_fill = sorted(time_to_fill_values)[len(time_to_fill_values) // 2]
        else:
            avg_time_to_fill = 0
            median_time_to_fill = 0
        
        # === HIRING VELOCITY ===
        weeks = (period_end - period_start).days / 7
        hiring_velocity = closed_requests.count() / weeks if weeks > 0 else 0
        
        # === DAYS BEHIND SCHEDULE ===
        overdue_closed = closed_requests.filter(closed_date__gt=F('deadline'))
        if overdue_closed.exists():
            delays = []
            for req in overdue_closed:
                delay = (req.closed_date - req.deadline).days
                delays.append(delay)
            avg_days_behind = sum(delays) / len(delays)
        else:
            avg_days_behind = 0
        
        # === SLA COMPLIANCE ===
        if closed_requests.exists():
            on_time = closed_requests.filter(closed_date__lte=F('deadline')).count()
            sla_compliance = (on_time / closed_requests.count()) * 100
        else:
            sla_compliance = 0
        
        # Создаем/обновляем метрики
        metrics, created = RecruitmentMetrics.objects.update_or_create(
            period_type='custom',
            period_start=period_start,
            period_end=period_end,
            vacancy=vacancy,
            grade=grade,
            project=project or '',
            defaults={
                'avg_time_to_fill': round(avg_time_to_fill, 2),
                'median_time_to_fill': round(median_time_to_fill, 2),
                'hires_count': closed_requests.count(),
                'hiring_velocity_weekly': round(hiring_velocity, 2),
                'avg_days_behind_schedule': round(avg_days_behind, 2),
                'overdue_requests_count': overdue_closed.count(),
                'sla_compliance_rate': round(sla_compliance, 2),
                'total_requests': requests.count(),
                'closed_requests': closed_requests.count(),
                'in_progress_requests': requests.filter(status='in_progress').count(),
                'cancelled_requests': requests.filter(status='cancelled').count(),
            }
        )
        
        return metrics
    
    @staticmethod
    def forecast_demand(vacancy, grade=None, forecast_period='next_month'):
        """Прогнозирование потребности на основе истории"""
        
        # Определяем период прогноза
        today = timezone.now().date()
        if forecast_period == 'next_month':
            forecast_start = today + timedelta(days=30)
            forecast_end = forecast_start + timedelta(days=30)
            lookback_days = 90  # анализируем последние 3 месяца
        elif forecast_period == 'next_quarter':
            forecast_start = today + timedelta(days=90)
            forecast_end = forecast_start + timedelta(days=90)
            lookback_days = 365  # анализируем год
        else:  # next_year
            forecast_start = today + timedelta(days=365)
            forecast_end = forecast_start + timedelta(days=365)
            lookback_days = 730  # 2 года
        
        # Исторические данные
        history_start = today - timedelta(days=lookback_days)
        historical_requests = HiringRequest.objects.filter(
            vacancy=vacancy,
            opening_date__range=[history_start, today]
        )
        
        if grade:
            historical_requests = historical_requests.filter(grade=grade)
        
        # Средняя потребность за период
        if lookback_days >= 365:
            periods_count = lookback_days / 365
        elif lookback_days >= 90:
            periods_count = lookback_days / 90
        else:
            periods_count = lookback_days / 30
        
        avg_demand_per_period = historical_requests.count() / periods_count if periods_count > 0 else 0
        
        # Сезонность (упрощенно - можно улучшить)
        current_month = today.month
        if current_month in [1, 2, 8, 9]:  # Активные месяцы найма
            seasonality = 1.2
        elif current_month in [12, 7]:  # Праздники
            seasonality = 0.7
        else:
            seasonality = 1.0
        
        # Прогноз
        forecasted_demand = int(avg_demand_per_period * seasonality)
        confidence = 70 if historical_requests.count() > 10 else 50
        
        # Создаем прогноз
        forecast = DemandForecast.objects.create(
            forecast_period=forecast_period,
            forecast_start=forecast_start,
            forecast_end=forecast_end,
            vacancy=vacancy,
            grade=grade,
            forecasted_demand=forecasted_demand,
            confidence_level=confidence,
            seasonality_factor=seasonality,
            created_by=None,  # Можно передать пользователя из контекста
        )
        
        return forecast
    
    @staticmethod
    def calculate_recruiter_capacity(recruiter, period_start, period_end):
        """Рассчитать мощность рекрутера"""
        
        # Активные заявки
        active = HiringRequest.objects.filter(
            created_by=recruiter,
            status__in=['planned', 'in_progress'],
            opening_date__lte=period_end
        ).count()
        
        # Запланированные (будущие)
        planned = HiringRequest.objects.filter(
            created_by=recruiter,
            status='planned',
            opening_date__gt=period_end
        ).count()
        
        # Закрытые за период
        closed = HiringRequest.objects.filter(
            created_by=recruiter,
            status='closed',
            closed_date__range=[period_start, period_end]
        ).count()
        
        # Среднее время на заявку
        closed_requests = HiringRequest.objects.filter(
            created_by=recruiter,
            status='closed',
            closed_date__range=[period_start, period_end]
        )
        
        if closed_requests.exists():
            time_values = []
            for req in closed_requests:
                days = (req.closed_date - req.opening_date).days
                time_values.append(days)
            avg_time = sum(time_values) / len(time_values)
            success_rate = (closed / (closed + active)) * 100 if (closed + active) > 0 else 0
        else:
            avg_time = 0
            success_rate = 0
        
        # Создаем/обновляем capacity
        capacity, created = RecruiterCapacity.objects.update_or_create(
            recruiter=recruiter,
            period_start=period_start,
            period_end=period_end,
            defaults={
                'active_requests_count': active,
                'planned_requests_count': planned,
                'closed_requests_count': closed,
                'avg_time_per_request': round(avg_time, 2),
                'success_rate': round(success_rate, 2),
            }
        )
        
        capacity.calculate_capacity()
        return capacity
    
    @staticmethod
    def get_team_capacity_summary():
        """Общая статистика по команде рекрутеров"""
        
        # Получаем всех пользователей (в реальной системе нужно фильтровать по группе рекрутеров)
        recruiters = User.objects.all()[:5]  # Ограничиваем для демо
        today = timezone.now().date()
        period_start = today - timedelta(days=30)
        
        summary = {
            'total_recruiters': recruiters.count(),
            'overloaded_count': 0,
            'avg_capacity_utilization': 0,
            'total_active_requests': 0,
            'recruiters': []
        }
        
        utilizations = []
        for recruiter in recruiters:
            capacity = MetricsService.calculate_recruiter_capacity(
                recruiter, period_start, today
            )
            
            if capacity.is_overloaded:
                summary['overloaded_count'] += 1
            
            utilizations.append(float(capacity.capacity_utilization))
            summary['total_active_requests'] += capacity.active_requests_count
            
            summary['recruiters'].append({
                'recruiter': recruiter,
                'capacity': capacity,
            })
        
        if utilizations:
            summary['avg_capacity_utilization'] = round(
                sum(utilizations) / len(utilizations), 2
            )
        
        return summary
    
    @staticmethod
    def get_monthly_metrics():
        """Получить метрики за текущий месяц"""
        today = timezone.now().date()
        period_start = today.replace(day=1)
        next_month = period_start + timedelta(days=32)
        period_end = next_month.replace(day=1) - timedelta(days=1)
        
        return MetricsService.calculate_recruitment_metrics(period_start, period_end)
    
    @staticmethod
    def get_quarterly_metrics():
        """Получить метрики за текущий квартал"""
        today = timezone.now().date()
        
        # Определяем квартал
        quarter = (today.month - 1) // 3 + 1
        quarter_start_month = (quarter - 1) * 3 + 1
        
        period_start = today.replace(month=quarter_start_month, day=1)
        
        # Конец квартала
        if quarter == 4:
            period_end = today.replace(month=12, day=31)
        else:
            next_quarter_month = quarter_start_month + 3
            period_end = today.replace(month=next_quarter_month, day=1) - timedelta(days=1)
        
        return MetricsService.calculate_recruitment_metrics(period_start, period_end)
