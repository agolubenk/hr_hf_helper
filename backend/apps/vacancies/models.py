from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from apps.finance.models import Grade, Currency

User = get_user_model()


class Vacancy(models.Model):
    """Модель для локальных данных по вакансиям"""
    
    name = models.CharField(
        max_length=200, 
        verbose_name='Название вакансии',
        help_text='Название вакансии'
    )
    
    external_id = models.CharField(
        max_length=100,
        verbose_name='ID для связи',
        help_text='Внешний идентификатор для связи с внешними системами',
        unique=True
    )
    
    recruiter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vacancies',
        verbose_name='Ответственный рекрутер',
        help_text='Рекрутер, ответственный за вакансию',
        limit_choices_to={'groups__name': 'Рекрутер'}  # Ограничиваем выбор только рекрутерами
    )
    
    invite_title = models.CharField(
        max_length=200,
        verbose_name='Заголовок инвайтов',
        help_text='Заголовок для приглашений кандидатов'
    )
    
    invite_text = models.TextField(
        verbose_name='Сопровождающий текст для инвайтов',
        help_text='Текст сопроводительного письма для приглашений'
    )
    
    scorecard_title = models.CharField(
        max_length=200,
        verbose_name='Заголовок Scorecard',
        help_text='Заголовок для Scorecard'
    )
    
    scorecard_link = models.URLField(
        verbose_name='Ссылка на Scorecard',
        help_text='Ссылка на Scorecard для оценки кандидатов',
        blank=True
    )
    
    questions_belarus = models.TextField(
        verbose_name='Вопросы Беларусь',
        help_text='Вопросы для интервью в Беларуси',
        blank=True
    )
    
    questions_poland = models.TextField(
        verbose_name='Вопросы Польша',
        help_text='Вопросы для интервью в Польше',
        blank=True
    )
    
    # Ссылки на вакансии в разных странах
    vacancy_link_belarus = models.URLField(
        verbose_name='Ссылка на вакансию (Беларусь)',
        help_text='Ссылка на вакансию в Беларуси (например, rabota.by, jobs.tut.by)',
        blank=True
    )
    
    vacancy_link_poland = models.URLField(
        verbose_name='Ссылка на вакансию (Польша)',
        help_text='Ссылка на вакансию в Польше (например, pracuj.pl, nofluffjobs.com)',
        blank=True
    )
    
    candidate_update_prompt = models.TextField(
        verbose_name='Промпт для обновления кандидата',
        help_text='Промпт для обновления информации о кандидате',
        blank=True
    )
    
    # Этапы для перевода кандидатов
    hr_screening_stage = models.CharField(
        max_length=100,
        verbose_name='Этап после HR-скрининга',
        help_text='Этап в Huntflow, на который переводить кандидата после HR-скрининга',
        blank=True
    )
    
    tech_screening_stage = models.CharField(
        max_length=100,
        verbose_name='Этап после Tech-скрининга',
        help_text='Этап в Huntflow, на который переводить кандидата после Tech-скрининга',
        blank=True
    )
    
    tech_interview_stage = models.CharField(
        max_length=100,
        verbose_name='Этап после Tech-интервью',
        help_text='Этап в Huntflow, на который переводить кандидата после Tech-интервью',
        blank=True
    )
    
    screening_duration = models.PositiveIntegerField(
        verbose_name='Длительность скринингов (минуты)',
        help_text='Длительность скринингов в минутах',
        default=45
    )
    
    available_grades = models.ManyToManyField(
        Grade,
        related_name='available_vacancies',
        verbose_name='Доступные грейды',
        help_text='Грейды, доступные для данной вакансии',
        blank=True
    )
    
    interviewers = models.ManyToManyField(
        'interviewers.Interviewer',
        related_name='vacancies',
        verbose_name='Интервьюеры',
        help_text='Интервьюеры, привязанные к вакансии',
        blank=True
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна',
        help_text='Активна ли вакансия'
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
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.external_id})"
    
    def clean(self):
        """Валидация модели"""
        super().clean()
        
        # Проверяем, что рекрутер действительно в группе "Рекрутер"
        if self.recruiter and not self.recruiter.groups.filter(name='Рекрутер').exists():
            raise ValidationError({
                'recruiter': 'Выбранный пользователь не является рекрутером'
            })
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def get_interviewers_count(self):
        """Получить количество привязанных интервьюеров"""
        return self.interviewers.count()
    
    def get_interviewers_list(self):
        """Получить список привязанных интервьюеров"""
        return self.interviewers.all()
    
    def has_interviewers(self):
        """Проверить, есть ли привязанные интервьюеры"""
        return self.interviewers.exists()
    
    def get_vacancy_links(self):
        """Получить все ссылки на вакансии по странам"""
        links = {}
        if self.vacancy_link_belarus:
            links['Беларусь'] = self.vacancy_link_belarus
        if self.vacancy_link_poland:
            links['Польша'] = self.vacancy_link_poland
        return links
    
    def has_vacancy_links(self):
        """Проверить, есть ли ссылки на вакансии"""
        return any([
            self.vacancy_link_belarus,
            self.vacancy_link_poland
        ])
    
    def get_vacancy_links_count(self):
        """Получить количество ссылок на вакансии"""
        return len(self.get_vacancy_links())
    
    def get_vacancy_link_by_country(self, country):
        """Получить ссылку на вакансию для конкретной страны"""
        country_mapping = {
            'belarus': self.vacancy_link_belarus,
            'poland': self.vacancy_link_poland
        }
        return country_mapping.get(country.lower())
    
    def get_stage_by_type(self, stage_type):
        """Получить этап по типу"""
        stage_mapping = {
            'hr_screening': self.hr_screening_stage,
            'tech_screening': self.tech_screening_stage,
            'tech_interview': self.tech_interview_stage
        }
        return stage_mapping.get(stage_type)
    
    def has_stages_configured(self):
        """Проверить, настроены ли этапы"""
        return any([
            self.hr_screening_stage,
            self.tech_screening_stage,
            self.tech_interview_stage
        ])
    
    def get_configured_stages(self):
        """Получить список настроенных этапов"""
        stages = {}
        if self.hr_screening_stage:
            stages['hr_screening'] = self.hr_screening_stage
        if self.tech_screening_stage:
            stages['tech_screening'] = self.tech_screening_stage
        if self.tech_interview_stage:
            stages['tech_interview'] = self.tech_interview_stage
        return stages


class SalaryRange(models.Model):
    """Модель для зарплатных вилок по вакансиям"""
    
    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        related_name='salary_ranges',
        verbose_name='Вакансия',
        help_text='Вакансия для которой устанавливается зарплатная вилка'
    )
    
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='salary_ranges',
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
    
    # Зарплата в EUR (автоматически рассчитывается)
    salary_min_eur = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (EUR)',
        help_text='Минимальная зарплата в евро',
        blank=True,
        null=True
    )
    
    salary_max_eur = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (EUR)',
        help_text='Максимальная зарплата в евро',
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
        if self.salary_min_usd and self.salary_max_usd and self.salary_min_usd > self.salary_max_usd:
            raise ValidationError({
                'salary_min_usd': 'Минимальная зарплата не может быть больше максимальной'
            })
    
    def save(self, *args, **kwargs):
        self.clean()
        
        # Автоматически рассчитываем зарплаты в других валютах
        self._calculate_other_currencies()
        
        super().save(*args, **kwargs)
    
    def _calculate_other_currencies(self):
        """Рассчитывает зарплаты в других валютах на основе курсов и налогов"""
        try:
            from apps.finance.models import CurrencyRate, PLNTax
            from decimal import Decimal
            
            # Получаем курсы валют
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            eur_rate = CurrencyRate.objects.get(code='EUR')
            
            # Получаем налоговые ставки для PLN/EUR
            active_taxes = PLNTax.objects.filter(is_active=True)
            total_tax_rate = sum(tax.rate_decimal for tax in active_taxes) if active_taxes.exists() else Decimal('0')
            
            # Рассчитываем BYN (net - как есть по курсу)
            if self.salary_min_usd:
                self.salary_min_byn = Decimal(str(self.salary_min_usd)) * usd_rate.rate
            if self.salary_max_usd:
                self.salary_max_byn = Decimal(str(self.salary_max_usd)) * usd_rate.rate
            
            # Рассчитываем PLN (gross - с налогами)
            if self.salary_min_usd:
                # USD -> BYN -> PLN (net) с учетом scale
                byn_amount = Decimal(str(self.salary_min_usd)) * usd_rate.rate
                pln_net = byn_amount / (pln_rate.rate / pln_rate.scale)
                # PLN net -> PLN gross = net / (1 - налоги)
                self.salary_min_pln = pln_net / (1 - total_tax_rate) if total_tax_rate < 1 else pln_net
            if self.salary_max_usd:
                byn_amount = Decimal(str(self.salary_max_usd)) * usd_rate.rate
                pln_net = byn_amount / (pln_rate.rate / pln_rate.scale)
                self.salary_max_pln = pln_net / (1 - total_tax_rate) if total_tax_rate < 1 else pln_net
            
            # Рассчитываем EUR (gross - с налогами)
            if self.salary_min_usd:
                # USD -> BYN -> EUR (net) с учетом scale
                byn_amount = Decimal(str(self.salary_min_usd)) * usd_rate.rate
                eur_net = byn_amount / (eur_rate.rate / eur_rate.scale)
                # EUR net -> EUR gross = net / (1 - налоги)
                self.salary_min_eur = eur_net / (1 - total_tax_rate) if total_tax_rate < 1 else eur_net
            if self.salary_max_usd:
                byn_amount = Decimal(str(self.salary_max_usd)) * usd_rate.rate
                eur_net = byn_amount / (eur_rate.rate / eur_rate.scale)
                self.salary_max_eur = eur_net / (1 - total_tax_rate) if total_tax_rate < 1 else eur_net
                
        except CurrencyRate.DoesNotExist:
            # Если курсы не найдены, оставляем поля пустыми
            pass
        except Exception as e:
            # Логируем ошибку, но не прерываем сохранение
            print(f"Ошибка при расчете валют для {self.grade.name}: {e}")
    
    def get_salary_display(self, currency='USD'):
        """Возвращает отформатированную зарплатную вилку для указанной валюты"""
        if currency == 'USD':
            return f"{self.salary_min_usd} - {self.salary_max_usd} USD"
        elif currency == 'BYN':
            if self.salary_min_byn and self.salary_max_byn:
                return f"{self.salary_min_byn} - {self.salary_max_byn} BYN"
        elif currency == 'PLN':
            if self.salary_min_pln and self.salary_max_pln:
                return f"{self.salary_min_pln} - {self.salary_max_pln} PLN"
        elif currency == 'EUR':
            if self.salary_min_eur and self.salary_max_eur:
                return f"{self.salary_min_eur} - {self.salary_max_eur} EUR"
        
        return f"{self.salary_min_usd} - {self.salary_max_usd} USD"
    
    def get_salary_min(self, currency='USD'):
        """Возвращает минимальную зарплату в указанной валюте"""
        if currency == 'USD':
            return self.salary_min_usd
        elif currency == 'BYN':
            return self.salary_min_byn
        elif currency == 'PLN':
            return self.salary_min_pln
        elif currency == 'EUR':
            return self.salary_min_eur
        return self.salary_min_usd
    
    def get_salary_max(self, currency='USD'):
        """Возвращает максимальную зарплату в указанной валюте"""
        if currency == 'USD':
            return self.salary_max_usd
        elif currency == 'BYN':
            return self.salary_max_byn
        elif currency == 'PLN':
            return self.salary_max_pln
        elif currency == 'EUR':
            return self.salary_max_eur
        return self.salary_max_usd
