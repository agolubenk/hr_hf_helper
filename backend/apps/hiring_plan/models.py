from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Sum, F, Q, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

User = get_user_model()


class PositionType(models.Model):
    """Тип позиции в плане (текущая, замена, плановая)"""
    
    TYPE_CHOICES = [
        ('current', 'Текущая работа'),
        ('replacement', 'Замена сотрудника'),
        ('planned', 'Плановая позиция'),
        ('urgent', 'Срочная позиция'),
        ('potential', 'Потенциальная позиция'),
    ]
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        unique=True,
        verbose_name='Тип позиции',
        help_text='Тип позиции в плане найма'
    )
    name = models.CharField(
        max_length=100,
        verbose_name='Название',
        help_text='Название типа позиции'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Описание типа позиции'
    )
    priority_boost = models.IntegerField(
        default=0,
        verbose_name='Бонус приоритета',
        help_text='Добавляет приоритет к позиции'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Активен ли тип позиции'
    )
    
    class Meta:
        verbose_name = 'Тип позиции'
        verbose_name_plural = 'Типы позиций'
        ordering = ['priority_boost', 'name']
    
    def __str__(self):
        return self.name


class PlanPeriodType(models.Model):
    """Тип периода плана (месячный, квартальный, годовой)"""
    
    PERIOD_CHOICES = [
        ('monthly', 'Месячный план'),
        ('quarterly', 'Квартальный план'),
        ('yearly', 'Годовой план'),
        ('custom', 'Кастомный период'),
    ]
    
    period_type = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        unique=True,
        verbose_name='Тип периода',
        help_text='Тип периода плана'
    )
    name = models.CharField(
        max_length=100,
        verbose_name='Название',
        help_text='Название типа периода'
    )
    days = models.IntegerField(
        verbose_name='Количество дней',
        help_text='Количество дней в периоде'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Активен ли тип периода'
    )
    
    class Meta:
        verbose_name = 'Тип периода'
        verbose_name_plural = 'Типы периодов'
        ordering = ['days']
    
    def __str__(self):
        return self.name


class PlanKPIOKRBlock(models.Model):
    """Блок KPI/OKR для применения к позициям группово (massively)"""
    
    name = models.CharField(
        max_length=255,
        verbose_name='Название блока',
        help_text='Например: "Backend найм Q4" или "Замены срочные"'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Описание блока KPI/OKR'
    )
    
    # Какие позиции попадают в блок
    position_types = models.ManyToManyField(
        PositionType,
        blank=True,
        verbose_name='Типы позиций',
        help_text='Типы позиций (если пусто - все)'
    )
    grades = models.ManyToManyField(
        'finance.Grade',
        blank=True,
        verbose_name='Грейды',
        help_text='Грейды (если пусто - все)'
    )
    
    # Статус
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Активен ли блок'
    )
    is_template = models.BooleanField(
        default=False,
        verbose_name='Шаблон',
        help_text='Шаблон для переиспользования'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'Блок KPI/OKR для плана'
        verbose_name_plural = 'Блоки KPI/OKR'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def get_applicable_positions(self):
        """Получить позиции, к которым применяется блок"""
        queryset = HiringPlanPosition.objects.all()
        
        if self.position_types.exists():
            queryset = queryset.filter(position_type__in=self.position_types.all())
        
        if self.grades.exists():
            queryset = queryset.filter(grades__in=self.grades.all()).distinct()
        
        return queryset
    
    def apply_to_plan(self, hiring_plan):
        """Применить блок KPI/OKR к конкретному плану"""
        # Копируем все KPI/OKR этого блока
        kpi_okr_list = PositionKPIOKR.objects.filter(plan_kpi_okr_block=self)
        
        for kpi_okr in kpi_okr_list:
            # Создаем копии для каждой применимой позиции
            applicable_positions = self.get_applicable_positions().filter(
                hiring_plan=hiring_plan
            )
            
            for position in applicable_positions:
                PositionKPIOKR.objects.create(
                    vacancy=position.vacancy,
                    grade=position.grades.first() if position.grades.exists() else None,
                    hiring_plan=hiring_plan,
                    scope='vacancy_grade',
                    name=kpi_okr.name,
                    metric_type=kpi_okr.metric_type,
                    target_value=kpi_okr.target_value,
                    unit=kpi_okr.unit,
                    period_start=kpi_okr.period_start,
                    period_end=kpi_okr.period_end,
                )


class PositionSLA(models.Model):
    """SLA связана с конкретной вакансией (Vacancy) и грейдом"""
    
    # Связь с Vacancy (обязательна)
    vacancy = models.ForeignKey(
        'vacancies.Vacancy',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Вакансия',
        help_text='SLA для конкретной вакансии'
    )
    
    # Связь с Grade (опционально)
    grade = models.ForeignKey(
        'finance.Grade',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Грейд',
        help_text='Если NULL - SLA для всех грейдов этой вакансии'
    )
    
    # SLA параметры
    target_time_to_fill = models.IntegerField(
        verbose_name='Целевой Time-to-Fill (дни)',
        help_text='Целевое время закрытия вакансии в днях'
    )
    target_time_to_hire = models.IntegerField(
        verbose_name='Целевой Time-to-Hire (дни)',
        help_text='Целевое время найма в днях'
    )
    median_time_to_fill = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        verbose_name='Медианный Time-to-Fill',
        help_text='Медианное время закрытия вакансии'
    )
    
    # Пороги
    warning_threshold_percent = models.IntegerField(
        default=80,
        verbose_name='Порог предупреждения (%)',
        help_text='Процент от SLA для предупреждения'
    )
    critical_threshold_percent = models.IntegerField(
        default=120,
        verbose_name='Критический порог (%)',
        help_text='Процент от SLA для критического статуса'
    )
    
    # Статус
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Активен ли SLA'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'SLA вакансии'
        verbose_name_plural = 'SLA вакансий'
        unique_together = [['vacancy', 'grade']]
        ordering = ['vacancy', 'grade']
    
    def __str__(self):
        grade_str = f" - {self.grade.name}" if self.grade else " - все грейды"
        return f"SLA: {self.vacancy.name}{grade_str}"
    
    @property
    def warning_time(self):
        """Время для warning'а (% от SLA)"""
        return int(self.target_time_to_fill * self.warning_threshold_percent / 100)
    
    @property
    def critical_time(self):
        """Критическое время (% от SLA)"""
        return int(self.target_time_to_fill * self.critical_threshold_percent / 100)


class PositionKPIOKR(models.Model):
    """KPI/OKR связаны с вакансией/грейдом или применяются блоками к планам"""
    
    METRIC_TYPE_CHOICES = [
        ('kpi', 'KPI'),
        ('okr', 'OKR'),
        ('custom', 'Custom'),
    ]
    
    SCOPE_CHOICES = [
        ('vacancy', 'Для конкретной вакансии'),
        ('grade', 'Для конкретного грейда'),
        ('vacancy_grade', 'Для вакансии + грейда'),
        ('plan_block', 'Блок для плана (массово)'),
        ('global', 'Глобальная метрика'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Ожидается'),
        ('in_progress', 'В процессе'),
        ('achieved', 'Достигнуто'),
        ('failed', 'Не достигнуто'),
    ]
    
    # Scope - определяет применение
    scope = models.CharField(
        max_length=20,
        choices=SCOPE_CHOICES,
        default='vacancy',
        verbose_name='Область применения',
        help_text='Определяет, как применяется метрика'
    )
    
    # Связи (зависят от scope)
    vacancy = models.ForeignKey(
        'vacancies.Vacancy',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Вакансия',
        help_text='Если scope = vacancy/vacancy_grade'
    )
    grade = models.ForeignKey(
        'finance.Grade',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Грейд',
        help_text='Если scope = grade/vacancy_grade'
    )
    
    # Блок для применения к плану
    plan_kpi_okr_block = models.ForeignKey(
        PlanKPIOKRBlock,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Блок KPI/OKR',
        help_text='Блок KPI/OKR для группового применения'
    )
    
    # Связь с планом найма (опционально)
    hiring_plan = models.ForeignKey(
        'HiringPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='План найма',
        help_text='План найма для KPI/OKR'
    )
    
    # Основные параметры
    name = models.CharField(
        max_length=255,
        verbose_name='Название',
        help_text='Название KPI/OKR'
    )
    metric_type = models.CharField(
        max_length=20,
        choices=METRIC_TYPE_CHOICES,
        verbose_name='Тип метрики',
        help_text='Тип метрики'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Описание метрики'
    )
    
    # Целевые значения
    target_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Целевое значение',
        help_text='Целевое значение метрики'
    )
    unit = models.CharField(
        max_length=50,
        default='%',
        verbose_name='Единица измерения',
        help_text='Единица измерения'
    )
    sla_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='SLA значение',
        help_text='Значение по SLA для сравнения'
    )
    
    # Результаты
    actual_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Фактическое значение',
        help_text='Фактическое значение метрики'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Статус',
        help_text='Статус достижения метрики'
    )
    
    # Период
    period_start = models.DateField(
        verbose_name='Начало периода',
        help_text='Начало периода для метрики'
    )
    period_end = models.DateField(
        verbose_name='Конец периода',
        help_text='Конец периода для метрики'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'KPI/OKR'
        verbose_name_plural = 'KPI/OKR'
        unique_together = [
            ['vacancy', 'grade', 'metric_type', 'period_start'],
            ['vacancy', 'metric_type', 'period_start'],  # Если без грейда
            ['plan_kpi_okr_block', 'period_start'],  # Для блоков
        ]
        ordering = ['-period_start', 'metric_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_metric_type_display()})"
    
    @property
    def achievement_rate(self):
        """% достижения целевого значения"""
        if not self.actual_value or self.target_value == 0:
            return 0
        return round((self.actual_value / self.target_value) * 100, 2)
    
    @property
    def sla_achievement_rate(self):
        """% достижения SLA (если задано)"""
        if not self.actual_value or not self.sla_value or self.sla_value == 0:
            return None
        return round((self.actual_value / self.sla_value) * 100, 2)


class HiringPlan(models.Model):
    """Простой план найма - только основная информация"""
    
    # Основное
    title = models.CharField(
        max_length=255,
        verbose_name='Название плана',
        help_text='Название плана найма'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Подробное описание плана найма'
    )
    
    # Период (вместо start_date/end_date)
    period_type = models.ForeignKey(
        PlanPeriodType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Тип периода',
        help_text='Месячный/Квартальный/Годовой'
    )
    
    # История периодов
    previous_plan = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='next_plans',
        verbose_name='Предыдущий план',
        help_text='Предыдущий план'
    )
    is_auto_generated = models.BooleanField(
        default=False,
        verbose_name='Автоматически созданный',
        help_text='Автоматически созданный план'
    )
    
    # Автоматические поля (опционально)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_hiring_plans',
        verbose_name='Владелец',
        help_text='Опционально - подтягивается автоматически'
    )
    
    # Статус УБИРАЕМ! Теперь только для отслеживания завершенных периодов
    # Если нужен статус - добавляем is_completed вместо status
    is_completed = models.BooleanField(
        default=False,
        verbose_name='Завершен',
        help_text='План завершен'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'План найма'
        verbose_name_plural = 'Планы найма'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({'Завершен' if self.is_completed else 'Активен'})"
    
    @property
    def total_positions(self):
        """Общее количество позиций"""
        return self.positions.count()
    
    @property
    def total_headcount_needed(self):
        """Общее количество требуемых специалистов"""
        result = self.positions.aggregate(
            total=Sum('headcount_needed')
        )
        return result['total'] or 0
    
    @property
    def total_headcount_hired(self):
        """Общее количество нанятых"""
        result = self.positions.aggregate(
            total=Sum('headcount_hired')
        )
        return result['total'] or 0
    
    @property
    def completion_rate(self):
        """Процент выполнения плана"""
        needed = self.total_headcount_needed
        if needed == 0:
            return 0
        hired = self.total_headcount_hired
        return round((hired / needed) * 100, 2)
    
    def get_sla_for_vacancy(self, vacancy, grade=None):
        """Получить SLA для вакансии в этом плане"""
        if grade:
            sla = PositionSLA.objects.filter(
                vacancy=vacancy, grade=grade, is_active=True
            ).first()
            if not sla:
                # Fallback на общую SLA без грейда
                sla = PositionSLA.objects.filter(
                    vacancy=vacancy, grade__isnull=True, is_active=True
                ).first()
        else:
            sla = PositionSLA.objects.filter(
                vacancy=vacancy, grade__isnull=True, is_active=True
            ).first()
        
        return sla
    
    def get_kpi_okr_for_vacancy(self, vacancy, grade=None):
        """Получить KPI/OKR для вакансии"""
        kpi_okr = PositionKPIOKR.objects.filter(
            vacancy=vacancy, hiring_plan=self
        )
        
        if grade:
            kpi_okr = kpi_okr.filter(
                Q(grade=grade) | Q(grade__isnull=True)
            )
        
        return kpi_okr


class HiringPlanPosition(models.Model):
    """Позиция в плане"""
    
    PRIORITY_CHOICES = [
        (1, 'Критический'),
        (2, 'Высокий'),
        (3, 'Средний'),
        (4, 'Низкий'),
    ]
    
    # Основные связи
    hiring_plan = models.ForeignKey(
        HiringPlan,
        on_delete=models.CASCADE,
        related_name='positions',
        verbose_name='План найма',
        help_text='План найма, к которому относится позиция'
    )
    vacancy = models.ForeignKey(
        'vacancies.Vacancy',
        on_delete=models.CASCADE,
        verbose_name='Вакансия',
        help_text='Вакансия для данной позиции'
    )
    
    # Тип позиции
    position_type = models.ForeignKey(
        PositionType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Тип позиции',
        help_text='Тип позиции (текущая/замена/плановая)'
    )
    replacement_reason = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Причина замены',
        help_text='Причина замены сотрудника'
    )
    replaced_employee_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='ID заменяемого сотрудника',
        help_text='ID заменяемого сотрудника (из системы)'
    )
    
    # Количество
    headcount_needed = models.PositiveIntegerField(
        verbose_name='Требуется специалистов',
        help_text='Количество специалистов, которое нужно нанять'
    )
    headcount_hired = models.PositiveIntegerField(
        default=0,
        verbose_name='Нанято специалистов',
        help_text='Количество уже нанятых специалистов'
    )
    headcount_in_progress = models.PositiveIntegerField(
        default=0,
        verbose_name='В процессе найма',
        help_text='Количество специалистов, найм которых в процессе'
    )
    
    # Приоритет и дедлайны
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES,
        default=3,
        verbose_name='Приоритет',
        help_text='Приоритет позиции в плане'
    )
    urgency_deadline = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дедлайн',
        help_text='Критический дедлайн для закрытия позиции'
    )
    
    # Грейды и требования
    grades = models.ManyToManyField(
        'finance.Grade',
        blank=True,
        verbose_name='Грейды',
        help_text='Требуемые грейды специалистов'
    )
    specifics = models.TextField(
        blank=True,
        verbose_name='Специфика позиции',
        help_text='Особые требования и специфика позиции'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='Заметки',
        help_text='Дополнительные заметки по позиции'
    )
    project = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Проект',
        help_text='Название проекта, для которого нужна позиция'
    )
    
    # Дата закрытия
    filled_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дата закрытия позиции',
        help_text='Дата закрытия позиции'
    )
    
    # Активность
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна',
        help_text='Активна ли позиция в плане'
    )
    
    # НОВОЕ: связь с блоком KPI/OKR (если применен)
    applied_kpi_okr_blocks = models.ManyToManyField(
        PlanKPIOKRBlock,
        blank=True,
        related_name='positions',
        verbose_name='Примененные блоки KPI/OKR',
        help_text='Блоки KPI/OKR, примененные к позиции'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'Позиция в плане найма'
        verbose_name_plural = 'Позиции в планах найма'
        ordering = ['priority', 'urgency_deadline']
    
    def __str__(self):
        return f"{self.vacancy.name} в {self.hiring_plan.title}"
    
    @property
    def fulfillment_rate(self):
        """Процент закрытия позиции"""
        if self.headcount_needed == 0:
            return 0
        return round((self.headcount_hired / self.headcount_needed) * 100, 2)
    
    @property
    def is_fulfilled(self):
        """Позиция полностью закрыта?"""
        return self.headcount_hired >= self.headcount_needed
    
    @property
    def remaining_headcount(self):
        """Сколько еще нужно нанять"""
        return max(0, self.headcount_needed - self.headcount_hired)
    
    @property
    def is_overdue(self):
        """Проверка просрочки дедлайна"""
        if not self.urgency_deadline:
            return False
        return timezone.now().date() > self.urgency_deadline and not self.is_fulfilled
    
    @property
    def time_to_fill(self):
        """Время от открытия до закрытия (в днях)"""
        if not self.is_fulfilled or not self.filled_date:
            return None
        return (self.filled_date - self.created_at.date()).days
    
    def get_applicable_sla(self):
        """Получить применимую SLA"""
        # Для каждого грейда вакансии
        for grade in self.grades.all():
            sla = PositionSLA.objects.filter(
                vacancy=self.vacancy,
                grade=grade,
                is_active=True
            ).first()
            if sla:
                return sla
        
        # Fallback - общая SLA
        return self.hiring_plan.get_sla_for_vacancy(self.vacancy)
    
    def get_applicable_kpi_okr(self):
        """Получить применимые KPI/OKR"""
        kpi_okr_list = []
        
        # Из блоков
        for block in self.applied_kpi_okr_blocks.all():
            block_metrics = PositionKPIOKR.objects.filter(
                plan_kpi_okr_block=block
            )
            kpi_okr_list.extend(block_metrics)
        
        # Напрямую для вакансии
        direct_metrics = PositionKPIOKR.objects.filter(
            vacancy=self.vacancy,
            hiring_plan=self.hiring_plan,
            plan_kpi_okr_block__isnull=True  # Не из блока
        )
        kpi_okr_list.extend(direct_metrics)
        
        return kpi_okr_list
    
    @property
    def sla_status(self):
        """Статус по SLA"""
        sla = self.get_applicable_sla()
        if not sla or not self.filled_date:
            return 'no_sla'
        
        time_to_fill = (self.filled_date - self.created_at.date()).days
        
        if time_to_fill <= sla.target_time_to_fill:
            return 'on_time'
        elif time_to_fill <= sla.warning_time:
            return 'warning'
        elif time_to_fill <= sla.critical_time:
            return 'critical'
        else:
            return 'overdue'
    
    @property
    def sla_compliance(self):
        """% соответствия SLA"""
        sla = self.get_applicable_sla()
        if not sla or not self.time_to_fill:
            return None
        
        return round((sla.target_time_to_fill / self.time_to_fill) * 100, 2)
    
    def save(self, *args, **kwargs):
        # Автоматически устанавливаем дату закрытия при полном закрытии
        if self.is_fulfilled and not self.filled_date:
            self.filled_date = timezone.now().date()
        elif not self.is_fulfilled and self.filled_date:
            self.filled_date = None
            
        super().save(*args, **kwargs)
        # Обновляем метрики плана после сохранения позиции
        self.hiring_plan.update_metrics()


class PlanMetrics(models.Model):
    """Метрики плана найма"""
    
    hiring_plan = models.OneToOneField(
        HiringPlan,
        on_delete=models.CASCADE,
        related_name='metrics',
        verbose_name='План найма',
        help_text='План найма, для которого рассчитываются метрики'
    )
    
    # Простые счетчики
    total_positions = models.PositiveIntegerField(
        default=0,
        verbose_name='Всего позиций',
        help_text='Общее количество позиций в плане'
    )
    total_headcount_needed = models.PositiveIntegerField(
        default=0,
        verbose_name='Всего требуется',
        help_text='Общее количество требуемых специалистов'
    )
    total_headcount_hired = models.PositiveIntegerField(
        default=0,
        verbose_name='Всего нанято',
        help_text='Общее количество нанятых специалистов'
    )
    
    # Прогресс (в процентах)
    completion_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Процент выполнения',
        help_text='Процент выполнения плана найма'
    )
    
    # Дата последнего обновления
    last_updated = models.DateTimeField(
        auto_now=True,
        verbose_name='Последнее обновление',
        help_text='Дата последнего обновления метрик'
    )
    
    class Meta:
        verbose_name = 'Метрики плана найма'
        verbose_name_plural = 'Метрики планов найма'
    
    def __str__(self):
        return f"Метрики для {self.hiring_plan.title}"