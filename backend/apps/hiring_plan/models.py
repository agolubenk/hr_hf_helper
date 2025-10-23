from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

User = get_user_model()


class HiringPlan(models.Model):
    """Модель плана найма"""
    
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('active', 'Активен'),
        ('paused', 'На паузе'),
        ('completed', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]
    
    # Основная информация
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
    
    # Временные рамки
    start_date = models.DateField(
        verbose_name='Дата начала',
        help_text='Дата начала плана найма'
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дата окончания',
        help_text='Планируемая дата окончания плана'
    )
    
    # Статус
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Статус',
        help_text='Текущий статус плана найма'
    )
    
    # Владение
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_hiring_plans',
        verbose_name='Владелец',
        help_text='Пользователь, создавший план'
    )
    responsible_recruiter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='responsible_hiring_plans',
        verbose_name='Ответственный рекрутер',
        help_text='Рекрутер, ответственный за выполнение плана',
        limit_choices_to={'groups__name': 'Рекрутер'}
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    class Meta:
        verbose_name = 'План найма'
        verbose_name_plural = 'Планы найма'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
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
    def total_headcount_in_progress(self):
        """Общее количество в процессе найма"""
        result = self.positions.aggregate(
            total=Sum('headcount_in_progress')
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
    
    def update_metrics(self):
        """Обновление метрик плана"""
        metrics, created = PlanMetrics.objects.get_or_create(
            hiring_plan=self
        )
        metrics.total_positions = self.total_positions
        metrics.total_headcount_needed = self.total_headcount_needed
        metrics.total_headcount_hired = self.total_headcount_hired
        metrics.completion_rate = self.completion_rate
        metrics.save()


class HiringPlanPosition(models.Model):
    """Позиция в плане найма"""
    
    PRIORITY_CHOICES = [
        (1, 'Критический'),
        (2, 'Высокий'),
        (3, 'Средний'),
        (4, 'Низкий'),
    ]
    
    # Связи
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
    
    # Количество специалистов
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
    
    # Приоритизация
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES,
        default=3,
        verbose_name='Приоритет',
        help_text='Приоритет позиции в плане'
    )
    
    # Срочность
    urgency_deadline = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дедлайн',
        help_text='Критический дедлайн для закрытия позиции'
    )
    
    # Грейды (M2M к существующим)
    grades = models.ManyToManyField(
        'finance.Grade',
        blank=True,
        verbose_name='Грейды',
        help_text='Требуемые грейды специалистов'
    )
    
    # Специфика
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
    
    # Проект
    project = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Проект',
        help_text='Название проекта, для которого нужна позиция'
    )
    
    # Активность
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна',
        help_text='Активна ли позиция в плане'
    )
    
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
    
    def save(self, *args, **kwargs):
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