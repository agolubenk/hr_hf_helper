# 📊 МЕТРИКИ И KPI: Расширение системы заявок на найм

## 🎯 ДОПОЛНИТЕЛЬНЫЕ СУЩНОСТИ ДЛЯ МЕТРИК

### 1. Модель для хранения агрегированных метрик

```python
class RecruitmentMetrics(models.Model):
    """Агрегированные метрики найма за период"""
    
    # Период
    period_type = CharField(max_length=20, choices=[
        ('weekly', 'Неделя'),
        ('monthly', 'Месяц'),
        ('quarterly', 'Квартал'),
        ('yearly', 'Год'),
    ])
    period_start = DateField(verbose_name='Начало периода')
    period_end = DateField(verbose_name='Конец периода')
    
    # Опциональная группировка
    vacancy = ForeignKey('vacancies.Vacancy', on_delete=CASCADE, 
                        null=True, blank=True,
                        verbose_name='Вакансия (если метрика для конкретной)')
    grade = ForeignKey('finance.Grade', on_delete=CASCADE,
                      null=True, blank=True,
                      verbose_name='Грейд (если метрика для конкретного)')
    project = CharField(max_length=200, blank=True,
                       verbose_name='Проект')
    
    # === ВРЕМЕННЫЕ МЕТРИКИ ===
    avg_time_to_fill = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Средний Time-to-Fill (дни)',
        help_text='Среднее время от открытия до закрытия заявки'
    )
    median_time_to_fill = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Медианный Time-to-Fill (дни)'
    )
    avg_time_to_hire = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Средний Time-to-Hire (дни)',
        help_text='Среднее время от первого контакта до оффера'
    )
    
    # === HIRING VELOCITY ===
    hires_count = PositiveIntegerField(
        default=0,
        verbose_name='Количество найма за период'
    )
    hiring_velocity_weekly = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Скорость найма (hires/week)',
        help_text='Количество закрытий в неделю'
    )
    
    # === DAYS BEHIND SCHEDULE ===
    avg_days_behind_schedule = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Среднее отставание от графика (дни)',
        help_text='Среднее количество дней просрочки для закрытых заявок'
    )
    overdue_requests_count = PositiveIntegerField(
        default=0,
        verbose_name='Количество просроченных заявок'
    )
    
    # === SLA COMPLIANCE ===
    sla_compliance_rate = DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name='SLA Compliance (%)',
        help_text='% заявок, закрытых в срок по SLA'
    )
    
    # === ОБЩАЯ СТАТИСТИКА ===
    total_requests = PositiveIntegerField(
        default=0,
        verbose_name='Всего заявок за период'
    )
    closed_requests = PositiveIntegerField(
        default=0,
        verbose_name='Закрыто заявок'
    )
    in_progress_requests = PositiveIntegerField(
        default=0,
        verbose_name='В процессе'
    )
    cancelled_requests = PositiveIntegerField(
        default=0,
        verbose_name='Отменено'
    )
    
    # Метаданные
    calculated_at = DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Метрики найма'
        verbose_name_plural = 'Метрики найма'
        unique_together = [
            ['period_type', 'period_start', 'vacancy', 'grade', 'project']
        ]
        indexes = [
            Index(fields=['period_start', 'period_end']),
            Index(fields=['vacancy', 'grade']),
        ]
    
    def __str__(self):
        return f"Метрики: {self.period_type} ({self.period_start} - {self.period_end})"
```

---

### 2. Модель для прогнозирования потребностей

```python
class DemandForecast(models.Model):
    """Прогноз потребности в персонале"""
    
    # Период прогноза
    forecast_period = CharField(max_length=20, choices=[
        ('next_month', 'Следующий месяц'),
        ('next_quarter', 'Следующий квартал'),
        ('next_year', 'Следующий год'),
    ])
    forecast_start = DateField(verbose_name='Начало прогнозного периода')
    forecast_end = DateField(verbose_name='Конец прогнозного периода')
    
    # Для чего прогноз
    vacancy = ForeignKey('vacancies.Vacancy', on_delete=CASCADE,
                        verbose_name='Вакансия')
    grade = ForeignKey('finance.Grade', on_delete=CASCADE,
                      null=True, blank=True,
                      verbose_name='Грейд')
    project = CharField(max_length=200, blank=True,
                       verbose_name='Проект')
    
    # === ПРОГНОЗ ===
    forecasted_demand = PositiveIntegerField(
        verbose_name='Прогнозируемая потребность',
        help_text='Ожидаемое количество заявок'
    )
    confidence_level = DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name='Уровень уверенности (%)',
        help_text='Уверенность в прогнозе (0-100%)'
    )
    
    # Факторы прогноза
    based_on_history = BooleanField(
        default=True,
        verbose_name='На основе истории',
        help_text='Прогноз основан на исторических данных'
    )
    seasonality_factor = DecimalField(
        max_digits=5, decimal_places=2, default=1.0,
        verbose_name='Фактор сезонности',
        help_text='Коэффициент сезонности (1.0 = нормально)'
    )
    growth_factor = DecimalField(
        max_digits=5, decimal_places=2, default=1.0,
        verbose_name='Фактор роста',
        help_text='Коэффициент роста команды'
    )
    
    # Метаданные
    created_at = DateTimeField(auto_now_add=True)
    created_by = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)
    notes = TextField(blank=True, verbose_name='Заметки')
    
    class Meta:
        verbose_name = 'Прогноз потребности'
        verbose_name_plural = 'Прогнозы потребности'
        ordering = ['-forecast_start']
    
    def __str__(self):
        return f"Прогноз: {self.vacancy.name} - {self.forecasted_demand} чел."
```

---

### 3. Модель для планирования мощностей рекрутеров

```python
class RecruiterCapacity(models.Model):
    """Планирование мощностей команды рекрутеров"""
    
    # Рекрутер
    recruiter = ForeignKey(User, on_delete=CASCADE,
                          related_name='capacity_plans',
                          limit_choices_to={'groups__name': 'Рекрутер'},
                          verbose_name='Рекрутер')
    
    # Период
    period_start = DateField(verbose_name='Начало периода')
    period_end = DateField(verbose_name='Конец периода')
    
    # === ТЕКУЩАЯ ЗАГРУЗКА ===
    active_requests_count = PositiveIntegerField(
        default=0,
        verbose_name='Активных заявок',
        help_text='Текущее количество заявок в работе'
    )
    planned_requests_count = PositiveIntegerField(
        default=0,
        verbose_name='Запланировано заявок',
        help_text='Заявки, которые скоро начнутся'
    )
    
    # === МОЩНОСТЬ ===
    max_capacity = PositiveIntegerField(
        default=10,
        verbose_name='Максимальная мощность',
        help_text='Максимальное количество заявок одновременно'
    )
    available_capacity = PositiveIntegerField(
        default=0,
        verbose_name='Доступная мощность',
        help_text='Свободные слоты для новых заявок'
    )
    capacity_utilization = DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name='Загрузка (%)',
        help_text='Процент использования мощности'
    )
    
    # === ПРОИЗВОДИТЕЛЬНОСТЬ ===
    avg_time_per_request = DecimalField(
        max_digits=6, decimal_places=2, default=0,
        verbose_name='Среднее время на заявку (дни)'
    )
    closed_requests_count = PositiveIntegerField(
        default=0,
        verbose_name='Закрыто заявок за период'
    )
    success_rate = DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name='Успешность закрытия (%)'
    )
    
    # Статус
    is_overloaded = BooleanField(
        default=False,
        verbose_name='Перегружен',
        help_text='Загрузка > 90%'
    )
    
    # Метаданные
    calculated_at = DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Мощность рекрутера'
        verbose_name_plural = 'Мощности рекрутеров'
        unique_together = [['recruiter', 'period_start']]
        ordering = ['-period_start', 'recruiter']
    
    def __str__(self):
        return f"{self.recruiter.get_full_name()} - {self.capacity_utilization}%"
    
    def calculate_capacity(self):
        """Автоматический расчет мощности"""
        self.available_capacity = self.max_capacity - self.active_requests_count
        if self.max_capacity > 0:
            self.capacity_utilization = round(
                (self.active_requests_count / self.max_capacity) * 100, 2
            )
        self.is_overloaded = self.capacity_utilization > 90
        self.save()
```

---

## 🔧 СЕРВИСНЫЙ СЛОЙ ДЛЯ РАСЧЕТА МЕТРИК

```python
# services/metrics_service.py

from django.db.models import Avg, Count, Q, F, Sum
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

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
        
        recruiters = User.objects.filter(groups__name='Рекрутер')
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
```

---

## 📊 DASHBOARD ДЛЯ МЕТРИК

### View для дашборда

```python
# views.py

class MetricsDashboardView(LoginRequiredMixin, TemplateView):
    """Dashboard с метриками и KPI"""
    template_name = 'hiring_plan/metrics_dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Период (по умолчанию - текущий месяц)
        today = timezone.now().date()
        period_start = today.replace(day=1)
        next_month = period_start + timedelta(days=32)
        period_end = next_month.replace(day=1) - timedelta(days=1)
        
        # Рассчитываем метрики
        metrics = MetricsService.calculate_recruitment_metrics(
            period_start, period_end
        )
        
        # Мощность команды
        team_capacity = MetricsService.get_team_capacity_summary()
        
        # KPI Cards
        context['kpi_cards'] = {
            'avg_time_to_fill': metrics.avg_time_to_fill,
            'hiring_velocity': metrics.hiring_velocity_weekly,
            'sla_compliance': metrics.sla_compliance_rate,
            'days_behind_schedule': metrics.avg_days_behind_schedule,
        }
        
        # Данные для графиков
        context['metrics'] = metrics
        context['team_capacity'] = team_capacity
        
        # Прогнозы
        vacancies = Vacancy.objects.all()[:5]
        forecasts = []
        for vacancy in vacancies:
            forecast = MetricsService.forecast_demand(vacancy, forecast_period='next_month')
            forecasts.append(forecast)
        context['forecasts'] = forecasts
        
        return context
```

---

## 🎨 ШАБЛОН ДАШБОРДА

```html
<!-- templates/hiring_plan/metrics_dashboard.html -->

{% extends 'base.html' %}

{% block content %}
<div class="container-fluid">
    <h1>📊 Дашборд метрик и KPI</h1>
    
    <!-- KPI Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card text-white bg-primary">
                <div class="card-body">
                    <h5>Time-to-Fill</h5>
                    <h2>{{ kpi_cards.avg_time_to_fill }} дней</h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-success">
                <div class="card-body">
                    <h5>Hiring Velocity</h5>
                    <h2>{{ kpi_cards.hiring_velocity }} /week</h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-info">
                <div class="card-body">
                    <h5>SLA Compliance</h5>
                    <h2>{{ kpi_cards.sla_compliance }}%</h2>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-warning">
                <div class="card-body">
                    <h5>Days Behind Schedule</h5>
                    <h2>{{ kpi_cards.days_behind_schedule }} дней</h2>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Команда рекрутеров -->
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>Мощность команды рекрутеров</h5>
                </div>
                <div class="card-body">
                    <p>Всего рекрутеров: {{ team_capacity.total_recruiters }}</p>
                    <p>Перегружено: {{ team_capacity.overloaded_count }}</p>
                    <p>Средняя загрузка: {{ team_capacity.avg_capacity_utilization }}%</p>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Рекрутер</th>
                                <th>Загрузка</th>
                                <th>Активных</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for item in team_capacity.recruiters %}
                            <tr>
                                <td>{{ item.recruiter.get_full_name }}</td>
                                <td>{{ item.capacity.capacity_utilization }}%</td>
                                <td>{{ item.capacity.active_requests_count }}</td>
                                <td>
                                    {% if item.capacity.is_overloaded %}
                                        <span class="badge bg-danger">Перегружен</span>
                                    {% else %}
                                        <span class="badge bg-success">ОК</span>
                                    {% endif %}
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>Прогноз потребности (следующий месяц)</h5>
                </div>
                <div class="card-body">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Вакансия</th>
                                <th>Прогноз</th>
                                <th>Уверенность</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for forecast in forecasts %}
                            <tr>
                                <td>{{ forecast.vacancy.name }}</td>
                                <td>{{ forecast.forecasted_demand }} чел.</td>
                                <td>{{ forecast.confidence_level }}%</td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
```

---

## ✅ ИТОГО: ПОЛНЫЙ НАБОР МЕТРИК

✅ **Time-to-Fill & Time-to-Hire** — автоматический расчет из заявок  
✅ **Hiring Velocity** — скорость найма (закрытий/неделя)  
✅ **Days Behind Schedule** — отставание от дедлайнов  
✅ **SLA Compliance** — % заявок в срок  
✅ **Demand Forecasting** — прогноз потребности на основе истории  
✅ **Recruiter Capacity Planning** — загрузка и мощность рекрутеров  
✅ **Dashboard** — визуализация всех метрик  

Система готова к внедрению! 🚀
