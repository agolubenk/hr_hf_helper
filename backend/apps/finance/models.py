from __future__ import annotations
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class Grade(models.Model):
    name = models.CharField(_("Название грейда"), max_length=64, unique=True)

    class Meta:
        verbose_name = _("Грейд")
        verbose_name_plural = _("Грейды")
        ordering = ("name",)

    def __str__(self):
        return self.name


class Currency(models.TextChoices):
    BYN = "BYN", "BYN"
    USD = "USD", "USD"
    PLN = "PLN", "PLN"


class CurrencyRate(models.Model):
    """
    Храним официальный курс НБРБ (BYN против иностранной валюты).
    rate = сколько BYN за единицу валюты (например, 3.25 BYN за 1 USD)
    scale — если НБРБ возвращает курс за 100 единиц (как для некоторых валют), нормализуем.
    """
    code = models.CharField(_("Код валюты"), max_length=3, choices=Currency.choices, unique=True)
    rate = models.DecimalField(_("Курс BYN за 1 единицу"), max_digits=12, decimal_places=6)
    scale = models.PositiveIntegerField(_("Масштаб"), default=1)
    fetched_at = models.DateTimeField(_("Получено"), default=timezone.now)

    class Meta:
        verbose_name = _("Курс валюты")
        verbose_name_plural = _("Курсы валют")

    def __str__(self):
        return f"{self.code}: {self.rate} BYN"
    
    @property
    def status_info(self):
        """Возвращает информацию о статусе курса для отображения в админке"""
        if self.code == "BYN":
            return "Базовая валюта"
        
        # Проверяем, насколько свежий курс
        now = timezone.now()
        age_hours = (now - self.fetched_at).total_seconds() / 3600
        
        if age_hours < 24:
            return "Сегодня"
        elif age_hours < 48:
            return "Вчера"
        elif age_hours < 168:  # неделя
            days = int(age_hours / 24)
            return f"{days} дн. назад"
        else:
            return "Устарел"
    
    @property
    def display_rate(self):
        """Возвращает отформатированный курс для отображения"""
        return f"{self.rate} BYN"


class PLNTax(models.Model):
    """
    Модель для хранения налоговых ставок PLN.
    Используется для расчета gross сумм из net сумм.
    """
    name = models.CharField(
        _("Название налога"), 
        max_length=100, 
        help_text=_("Например: Подоходный налог, Социальные взносы")
    )
    rate = models.DecimalField(
        _("Налоговая ставка (%)"), 
        max_digits=5, 
        decimal_places=2,
        help_text=_("Процент от 0 до 100")
    )
    is_active = models.BooleanField(
        _("Активен"), 
        default=True,
        help_text=_("Используется ли налог в расчетах")
    )
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)

    class Meta:
        verbose_name = _("Налог PLN")
        verbose_name_plural = _("Налоги PLN")
        ordering = ("name",)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"

    def clean(self):
        """Валидация налоговой ставки"""
        from django.core.exceptions import ValidationError
        
        if self.rate < 0 or self.rate > 100:
            raise ValidationError(_("Налоговая ставка должна быть от 0 до 100%"))

    @property
    def rate_decimal(self):
        """Возвращает ставку как десятичное число (например, 0.20 для 20%)"""
        return self.rate / 100

    @classmethod
    def calculate_gross_from_net(cls, net_amount: Decimal) -> Decimal:
        """
        Рассчитывает gross сумму из net суммы с учетом всех активных налогов.
        
        Args:
            net_amount: Net сумма в PLN
            
        Returns:
            Gross сумма в PLN
        """
        active_taxes = cls.objects.filter(is_active=True)
        
        if not active_taxes.exists():
            return net_amount
        
        # Суммируем все налоговые ставки
        total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        # Gross = Net / (1 - общая_налоговая_ставка)
        if total_tax_rate >= 1:
            # Если общая ставка >= 100%, возвращаем net сумму
            return net_amount
        
        gross_amount = net_amount / (1 - total_tax_rate)
        return gross_amount.quantize(Decimal('0.01'))

    @classmethod
    def calculate_net_from_gross(cls, gross_amount: Decimal) -> Decimal:
        """
        Рассчитывает net сумму из gross суммы с учетом всех активных налогов.
        
        Args:
            gross_amount: Gross сумма в PLN
            
        Returns:
            Net сумма в PLN
        """
        active_taxes = cls.objects.filter(is_active=True)
        
        if not active_taxes.exists():
            return gross_amount
        
        # Суммируем все налоговые ставки
        total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        # Net = Gross * (1 - общая_налоговая_ставка)
        net_amount = gross_amount * (1 - total_tax_rate)
        return net_amount.quantize(Decimal('0.01'))


    @classmethod
    def get_tax_breakdown(cls, gross_amount: Decimal) -> dict:
        """
        Возвращает детализацию налогов по gross сумме.
        
        Args:
            gross_amount: Gross сумма в PLN
            
        Returns:
            Словарь с детализацией налогов
        """
        active_taxes = cls.objects.filter(is_active=True)
        breakdown = {
            'gross_amount': gross_amount,
            'net_amount': Decimal('0'),
            'total_tax_amount': Decimal('0'),
            'taxes': []
        }
        
        if not active_taxes.exists():
            breakdown['net_amount'] = gross_amount
            return breakdown
        
        total_tax_amount = Decimal('0')
        
        for tax in active_taxes:
            tax_amount = gross_amount * tax.rate_decimal
            total_tax_amount += tax_amount
            
            breakdown['taxes'].append({
                'name': tax.name,
                'rate': tax.rate,
                'amount': tax_amount.quantize(Decimal('0.01'))
            })
        
        breakdown['total_tax_amount'] = total_tax_amount.quantize(Decimal('0.01'))
        breakdown['net_amount'] = (gross_amount - total_tax_amount).quantize(Decimal('0.01'))
        
        return breakdown


class SalaryRange(models.Model):
    """Модель для зарплатных вилок по вакансиям"""
    
    vacancy = models.ForeignKey(
        'vacancies.Vacancy',
        on_delete=models.CASCADE,
        related_name='finance_salary_ranges',
        verbose_name='Вакансия',
        help_text='Вакансия для которой устанавливается зарплатная вилка'
    )
    
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='finance_salary_ranges',
        verbose_name='Грейд',
        help_text='Грейд для которого устанавливается зарплатная вилка'
    )
    
    # Зарплата в USD (базовая валюта для редактирования)
    salary_min_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Минимальная зарплата (USD)',
        help_text='Минимальная зарплата в долларах США'
    )
    
    salary_max_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Максимальная зарплата (USD)',
        help_text='Максимальная зарплата в долларах США'
    )
    
    # Зарплата в BYN (автоматически рассчитывается)
    salary_min_byn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (BYN)',
        help_text='Минимальная зарплата в белорусских рублях',
        blank=True,
        null=True
    )
    
    salary_max_byn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (BYN)',
        help_text='Максимальная зарплата в белорусских рублях',
        blank=True,
        null=True
    )
    
    # Зарплата в PLN (автоматически рассчитывается)
    salary_min_pln = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (PLN)',
        help_text='Минимальная зарплата в польских злотых',
        blank=True,
        null=True
    )
    
    salary_max_pln = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (PLN)',
        help_text='Максимальная зарплата в польских злотых',
        blank=True,
        null=True
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна',
        help_text='Активна ли зарплатная вилка'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Зарплатная вилка'
        verbose_name_plural = 'Зарплатные вилки'
        ordering = ['grade__name', 'salary_min_usd']
        unique_together = ['vacancy', 'grade']  # Одна зарплатная вилка на вакансию и грейд
    
    def __str__(self):
        return f"{self.vacancy.name} - {self.grade.name}: ${self.salary_min_usd} - ${self.salary_max_usd}"
    
    def clean(self):
        """Валидация модели"""
        super().clean()
        
        # Проверяем, что минимальная зарплата не больше максимальной
        if self.salary_min_usd and self.salary_max_usd:
            if self.salary_min_usd > self.salary_max_usd:
                from django.core.exceptions import ValidationError
                raise ValidationError({
                    'salary_min_usd': _('Минимальная зарплата не может быть больше максимальной'),
                    'salary_max_usd': _('Максимальная зарплата не может быть меньше минимальной')
                })
    
    def save(self, *args, **kwargs):
        """Переопределяем save для автоматического расчета курсов валют"""
        # Вызываем clean для валидации
        self.clean()
        
        # Всегда пересчитываем курсы валют при сохранении
        self._calculate_byn_amounts()
        self._calculate_pln_amounts()
        
        super().save(*args, **kwargs)
    
    def _calculate_byn_amounts(self):
        """Рассчитывает суммы в BYN на основе USD и курса валют"""
        try:
            usd_rate = CurrencyRate.objects.get(code='USD')
            
            if self.salary_min_usd:
                self.salary_min_byn = self.salary_min_usd * usd_rate.rate
            
            if self.salary_max_usd:
                self.salary_max_byn = self.salary_max_usd * usd_rate.rate
                
        except CurrencyRate.DoesNotExist:
            # Если курс USD не найден, оставляем поля пустыми
            pass
    
    def _calculate_pln_amounts(self):
        """Рассчитывает суммы в PLN на основе USD и курса валют с учетом налогов"""
        try:
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            
            # Получаем суммарную налоговую ставку
            active_taxes = PLNTax.objects.filter(is_active=True)
            total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
            
            if self.salary_min_usd:
                # USD -> BYN -> PLN (с учетом налогов)
                byn_amount = self.salary_min_usd * usd_rate.rate
                pln_gross = byn_amount / pln_rate.rate
                
                # Применяем налоговую формулу: PLN = Gross / (1 - суммарные_налоги)
                if total_tax_rate > 0 and total_tax_rate < 1:
                    self.salary_min_pln = pln_gross / (1 - total_tax_rate)
                else:
                    self.salary_min_pln = pln_gross
            
            if self.salary_max_usd:
                # USD -> BYN -> PLN (с учетом налогов)
                byn_amount = self.salary_max_usd * usd_rate.rate
                pln_gross = byn_amount / pln_rate.rate
                
                # Применяем налоговую формулу: PLN = Gross / (1 - суммарные_налоги)
                if total_tax_rate > 0 and total_tax_rate < 1:
                    self.salary_max_pln = pln_gross / (1 - total_tax_rate)
                else:
                    self.salary_max_pln = pln_gross
                
        except CurrencyRate.DoesNotExist:
            # Если курсы валют не найдены, оставляем поля пустыми
            pass
    
    def update_currency_amounts(self):
        """Обновляет суммы в других валютах на основе текущих курсов"""
        self._calculate_byn_amounts()
        self._calculate_pln_amounts()
        self.save(update_fields=['salary_min_byn', 'salary_max_byn', 'salary_min_pln', 'salary_max_pln'])
    
    @property
    def salary_range_usd(self):
        """Возвращает строку с диапазоном зарплаты в USD"""
        return f"${self.salary_min_usd} - ${self.salary_max_usd}"
    
    @property
    def salary_range_byn(self):
        """Возвращает строку с диапазоном зарплаты в BYN"""
        if self.salary_min_byn and self.salary_max_byn:
            return f"{self.salary_min_byn} - {self.salary_max_byn} BYN"
        return "Не рассчитано"
    
    @property
    def salary_range_pln(self):
        """Возвращает строку с диапазоном зарплаты в PLN"""
        if self.salary_min_pln and self.salary_max_pln:
            return f"{self.salary_min_pln} - {self.salary_max_pln} PLN"
        return "Не рассчитано"
    
    @classmethod
    def update_all_currency_amounts(cls):
        """Обновляет суммы в других валютах для всех зарплатных вилок"""
        for salary_range in cls.objects.all():
            salary_range.update_currency_amounts()


class BenchmarkType(models.TextChoices):
    """Типы бенчмарков"""
    CANDIDATE = "candidate", _("Кандидат")
    VACANCY = "vacancy", _("Вакансия")


class WorkFormat(models.TextChoices):
    """Форматы работы"""
    OFFICE = "офис", _("Офис")
    HYBRID = "гибрид", _("Гибрид")
    REMOTE = "удаленка", _("Удаленка")
    ALL_WORLD = "all world", _("All World")


class Benchmark(models.Model):
    """
    Модель для хранения бенчмарков зарплат.
    Содержит информацию о зарплатах кандидатов или вакансий для анализа рынка.
    """
    
    type = models.CharField(
        _("Тип бенчмарка"),
        max_length=20,
        choices=BenchmarkType.choices,
        help_text=_("Тип бенчмарка: кандидат или вакансия")
    )
    
    date_added = models.DateTimeField(
        _("Дата добавления"),
        auto_now_add=True,
        help_text=_("Дата и время добавления бенчмарка")
    )
    
    vacancy = models.ForeignKey(
        'vacancies.Vacancy',
        on_delete=models.CASCADE,
        related_name='benchmarks',
        verbose_name=_('Вакансия'),
        help_text=_('Связанная вакансия')
    )
    
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='benchmarks',
        verbose_name=_('Грейд'),
        help_text=_('Связанный грейд')
    )
    
    salary_from = models.DecimalField(
        _("Зарплата от"),
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text=_("Минимальная зарплата в USD (для кандидатов - их зарплата)")
    )
    
    salary_to = models.DecimalField(
        _("Зарплата до"),
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Максимальная зарплата в USD (только для вакансий)")
    )
    
    location = models.CharField(
        _("Локация"),
        max_length=200,
        help_text=_("Географическое расположение (город, страна)")
    )
    
    notes = models.TextField(
        _("Примечания"),
        blank=True,
        null=True,
        help_text=_("Дополнительные заметки о бенчмарке")
    )
    
    # Дополнительные поля для вакансий
    work_format = models.CharField(
        _("Формат работы"),
        max_length=20,
        choices=WorkFormat.choices,
        blank=True,
        null=True,
        help_text=_("Формат работы")
    )
    
    compensation = models.TextField(
        _("Компенсации"),
        blank=True,
        null=True,
        help_text=_("Дополнительные компенсации и бонусы")
    )
    
    benefits = models.TextField(
        _("Бенефиты"),
        blank=True,
        null=True,
        help_text=_("Социальные льготы и бенефиты")
    )
    
    development = models.TextField(
        _("Развитие/обучение"),
        blank=True,
        null=True,
        help_text=_("Возможности для развития и обучения")
    )
    
    technologies = models.TextField(
        _("Технологии"),
        blank=True,
        null=True,
        help_text=_("Используемые технологии и стеки")
    )
    
    domain = models.CharField(
        _("Домен"),
        max_length=200,
        blank=True,
        null=True,
        help_text=_("Домен деятельности компании")
    )
    
    is_active = models.BooleanField(
        _("Активен"),
        default=True,
        help_text=_("Активен ли бенчмарк для использования в анализе")
    )
    
    created_at = models.DateTimeField(
        _("Создано"),
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        _("Обновлено"),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _("Бенчмарк")
        verbose_name_plural = _("Бенчмарки")
        ordering = ['-date_added', 'vacancy__name', 'grade__name']
        indexes = [
            models.Index(fields=['type', 'is_active']),
            models.Index(fields=['vacancy', 'grade']),
            models.Index(fields=['date_added']),
        ]
    
    def __str__(self):
        salary_str = self.get_salary_display()
        return f"{self.get_type_display()} - {self.vacancy.name} ({self.grade.name}): {salary_str}"
    
    def clean(self):
        """Валидация модели"""
        super().clean()
        
        from django.core.exceptions import ValidationError
        
        # Проверяем, что salary_from положительная
        if self.salary_from and self.salary_from <= 0:
            raise ValidationError({
                'salary_from': _('Зарплата "от" должна быть положительной')
            })
        
        # Проверяем, что salary_to положительная
        if self.salary_to and self.salary_to <= 0:
            raise ValidationError({
                'salary_to': _('Зарплата "до" должна быть положительной')
            })
        
        # Проверяем, что salary_to больше salary_from
        if self.salary_from and self.salary_to and self.salary_to <= self.salary_from:
            raise ValidationError({
                'salary_to': _('Зарплата "до" должна быть больше зарплаты "от"')
            })
    
    @property
    def amount_formatted(self):
        """Возвращает отформатированную сумму (для обратной совместимости)"""
        return self.get_salary_display()
    
    def get_salary_display(self):
        """Возвращает отформатированное отображение зарплаты"""
        if self.salary_to:
            return f"${self.salary_from:,.0f}–${self.salary_to:,.0f}"
        else:
            return f"${self.salary_from:,.0f}"
    
    def get_salary_from_display(self):
        """Возвращает отформатированную зарплату 'от'"""
        return f"${self.salary_from:,.2f}"
    
    def get_salary_to_display(self):
        """Возвращает отформатированную зарплату 'до'"""
        if self.salary_to:
            return f"${self.salary_to:,.2f}"
        return None
    
    @property
    def type_icon(self):
        """Возвращает иконку для типа бенчмарка"""
        if self.type == BenchmarkType.CANDIDATE:
            return "fas fa-user"
        else:
            return "fas fa-briefcase"
    
    @property
    def type_color(self):
        """Возвращает цвет для типа бенчмарка"""
        if self.type == BenchmarkType.CANDIDATE:
            return "success"  # Зеленый для кандидатов
        else:
            return "primary"  # Синий для вакансий


class DataSource(models.TextChoices):
    """Источники данных о вакансиях"""
    HH_RU = "hh_ru", _("HH.ru")
    TELEGRAM = "telegram", _("Telegram")
    HABR_CAREER = "habr_career", _("Habr Career")
    LINKEDIN = "linkedin", _("LinkedIn")


class VacancyField(models.TextChoices):
    """Поля для сохранения вакансий"""
    # Обязательные поля (всегда включены)
    VACANCY = "vacancy", _("Вакансия")
    DATE_ADDED = "date_added", _("Дата добавления")
    AVAILABLE_GRADES = "available_grades", _("Доступные грейды")
    SALARY_RANGE = "salary_range", _("Вилка от-до")
    LOCATION = "location", _("Локация")
    
    # Дополнительные поля
    WORK_FORMAT = "work_format", _("Формат работы")
    COMPENSATION = "compensation", _("Компенсации")
    BENEFITS = "benefits", _("Бенефиты")
    DEVELOPMENT = "development", _("Развитие/обучение")
    TECHNOLOGIES = "technologies", _("Технологии")
    DOMAIN = "domain", _("Домен")


class BenchmarkSettings(models.Model):
    """
    Настройки для системы бенчмарков.
    Синглтон модель для хранения глобальных настроек.
    """
    
    # Период расчета среднего
    average_calculation_period_days = models.PositiveIntegerField(
        _("Период расчета среднего (дни)"),
        default=90,
        help_text=_("Количество дней для расчета средних значений бенчмарков")
    )
    
    # Налог в РБ для пересчета
    belarus_tax_rate = models.DecimalField(
        _("Налог в РБ (%)"),
        max_digits=5,
        decimal_places=2,
        default=Decimal('13.00'),
        help_text=_("Налоговая ставка в Беларуси для пересчета net/gross")
    )
    
    # Промпт для анализа данных через ИИ
    ai_analysis_prompt = models.TextField(
        _("Промпт для анализа данных через ИИ"),
        default="Проанализируй данные о зарплатах и предоставь статистику по рынку труда.",
        help_text=_("Промпт для анализа данных о зарплатах через ИИ")
    )
    
    # Источники данных о вакансиях (JSON поле для множественного выбора)
    data_sources = models.JSONField(
        _("Источники данных о вакансиях"),
        default=list,
        help_text=_("Список активных источников данных о вакансиях")
    )
    
    # Максимальное количество задач для обработки в день
    max_daily_tasks = models.PositiveIntegerField(
        _("Максимальное количество задач в день"),
        default=100,
        help_text=_("Максимальное количество задач для обработки в день")
    )
    
    # Поля для сохранения вакансий (JSON поле для множественного выбора)
    vacancy_fields = models.JSONField(
        _("Поля для сохранения вакансий"),
        default=list,
        help_text=_("Список полей для сохранения информации о вакансиях")
    )
    
    # Временные метки
    created_at = models.DateTimeField(_("Создано"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Обновлено"), auto_now=True)
    
    class Meta:
        verbose_name = _("Настройки бенчмарков")
        verbose_name_plural = _("Настройки бенчмарков")
    
    def __str__(self):
        return "Настройки бенчмарков"
    
    def save(self, *args, **kwargs):
        """Переопределяем save для обеспечения единственности записи"""
        self.pk = 1
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Запрещаем удаление настроек"""
        pass
    
    @classmethod
    def load(cls):
        """Загружает настройки, создавая их при необходимости"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
    
    @property
    def data_sources_display(self):
        """Возвращает отформатированный список источников данных"""
        if not self.data_sources:
            return "Не выбрано"
        
        source_names = []
        for source in self.data_sources:
            for choice in DataSource.choices:
                if choice[0] == source:
                    source_names.append(str(choice[1]))
                    break
        
        return ", ".join(source_names)
    
    @property
    def vacancy_fields_display(self):
        """Возвращает отформатированный список полей вакансий"""
        if not self.vacancy_fields:
            return "Только обязательные поля"
        
        field_names = []
        for field in self.vacancy_fields:
            for choice in VacancyField.choices:
                if choice[0] == field:
                    field_names.append(str(choice[1]))
                    break
        
        return ", ".join(field_names)
    
    def get_available_data_sources(self):
        """Возвращает список доступных источников данных"""
        return DataSource.choices
    
    def get_available_vacancy_fields(self):
        """Возвращает список доступных полей вакансий"""
        return VacancyField.choices
    
    def get_required_vacancy_fields(self):
        """Возвращает список обязательных полей вакансий"""
        return [
            ('vacancy', 'Вакансия'),
            ('date_added', 'Дата добавления'),
            ('available_grades', 'Доступные грейды'),
            ('salary_range', 'Вилка от-до'),
            ('location', 'Локация'),
        ]
    
    def get_optional_vacancy_fields(self):
        """Возвращает список дополнительных полей вакансий"""
        return [
            ('work_format', 'Формат работы'),
            ('compensation', 'Компенсации'),
            ('benefits', 'Бенефиты'),
            ('development', 'Развитие/обучение'),
            ('technologies', 'Технологии'),
            ('domain', 'Домен'),
        ]
    
    def clean(self):
        """Валидация модели"""
        super().clean()
        
        # Проверяем, что налоговая ставка в разумных пределах
        if self.belarus_tax_rate < 0 or self.belarus_tax_rate > 50:
            from django.core.exceptions import ValidationError
            raise ValidationError({
                'belarus_tax_rate': _('Налоговая ставка должна быть от 0 до 50%')
            })
        
        # Проверяем, что период расчета в разумных пределах
        if self.average_calculation_period_days < 1 or self.average_calculation_period_days > 365:
            from django.core.exceptions import ValidationError
            raise ValidationError({
                'average_calculation_period_days': _('Период расчета должен быть от 1 до 365 дней')
            })
        
        # Проверяем, что максимальное количество задач в разумных пределах
        if self.max_daily_tasks < 1 or self.max_daily_tasks > 10000:
            from django.core.exceptions import ValidationError
            raise ValidationError({
                'max_daily_tasks': _('Максимальное количество задач должно быть от 1 до 10000')
            })
