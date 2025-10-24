from django import forms
from django.contrib.auth import get_user_model
from .models import (
    HiringPlan, HiringPlanPosition, PositionType, PlanPeriodType,
    PositionSLA, PositionKPIOKR, PlanKPIOKRBlock
)

User = get_user_model()


class HiringPlanFormExtended(forms.ModelForm):
    """Расширенная форма для создания/редактирования плана найма"""
    
    class Meta:
        model = HiringPlan
        fields = [
            'title', 'description', 'period_type', 'is_completed',
            'previous_plan', 'is_auto_generated', 'owner'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название плана найма'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Описание плана найма...'
            }),
            'period_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_completed': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'previous_plan': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_auto_generated': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'owner': forms.Select(attrs={
                'class': 'form-control'
            }),
        }
        labels = {
            'title': 'Название плана *',
            'description': 'Описание',
            'period_type': 'Тип периода',
            'is_completed': 'Завершен',
            'previous_plan': 'Предыдущий план',
            'is_auto_generated': 'Автоматически созданный',
            'owner': 'Владелец',
        }
        help_texts = {
            'period_type': 'Выберите тип периода для плана',
            'previous_plan': 'Связь с предыдущим планом (для периодических планов)',
            'is_auto_generated': 'План создан автоматически системой',
            'owner': 'Владелец плана (опционально)',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['title'].required = True
        self.fields['period_type'].queryset = PlanPeriodType.objects.filter(is_active=True)
        self.fields['previous_plan'].queryset = HiringPlan.objects.filter(is_completed=True)
        self.fields['owner'].queryset = User.objects.filter(is_active=True)
        
        # Делаем некоторые поля необязательными
        self.fields['description'].required = False
        self.fields['period_type'].required = False
        self.fields['previous_plan'].required = False
        self.fields['owner'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get('title')
        period_type = cleaned_data.get('period_type')
        
        if title and len(title.strip()) < 3:
            raise forms.ValidationError('Название плана должно содержать минимум 3 символа')
        
        return cleaned_data


class HiringPlanPositionFormExtended(forms.ModelForm):
    """Расширенная форма для создания/редактирования позиции в плане"""
    
    class Meta:
        model = HiringPlanPosition
        fields = [
            'vacancy', 'position_type', 'project', 'headcount_needed',
            'headcount_hired', 'headcount_in_progress', 'priority', 
            'urgency_deadline', 'grades', 'replacement_reason', 
            'replaced_employee_id', 'specifics', 'notes', 'is_active', 
            'applied_kpi_okr_blocks'
        ]
        widgets = {
            'vacancy': forms.Select(attrs={
                'class': 'form-control'
            }),
            'position_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'project': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название проекта'
            }),
            'headcount_needed': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1'
            }),
            'headcount_hired': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0'
            }),
            'headcount_in_progress': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-control'
            }),
            'urgency_deadline': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'grades': forms.SelectMultiple(attrs={
                'class': 'form-control'
            }),
            'replacement_reason': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Например: Увольнение, Отпуск, Расширение'
            }),
            'replaced_employee_id': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'ID сотрудника (опционально)'
            }),
            'specifics': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Особые требования к позиции...'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Дополнительные заметки...'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'grades': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
            'applied_kpi_okr_blocks': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'vacancy': 'Вакансия *',
            'position_type': 'Тип позиции',
            'project': 'Проект',
            'headcount_needed': 'Требуется специалистов *',
            'headcount_hired': 'Нанято специалистов',
            'headcount_in_progress': 'В процессе найма',
            'priority': 'Приоритет',
            'urgency_deadline': 'Дедлайн',
            'grades': 'Грейды',
            'replacement_reason': 'Причина замены',
            'replaced_employee_id': 'ID заменяемого сотрудника',
            'specifics': 'Специфика позиции',
            'notes': 'Заметки',
            'is_active': 'Активна',
            'applied_kpi_okr_blocks': 'Примененные блоки KPI/OKR',
        }
        help_texts = {
            'position_type': 'Тип позиции влияет на приоритет и SLA',
            'headcount_needed': 'Количество специалистов, которое нужно нанять',
            'headcount_hired': 'Количество уже нанятых специалистов',
            'headcount_in_progress': 'Количество специалистов, найм которых в процессе',
            'urgency_deadline': 'Критический дедлайн для закрытия позиции',
            'replacement_reason': 'Указывается для позиций типа "Замена сотрудника"',
            'applied_kpi_okr_blocks': 'Блоки KPI/OKR, применяемые к позиции',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['vacancy'].required = True
        self.fields['headcount_needed'].required = True
        self.fields['position_type'].queryset = PositionType.objects.filter(is_active=True)
        self.fields['applied_kpi_okr_blocks'].queryset = PlanKPIOKRBlock.objects.filter(is_active=True)
        
        # Делаем некоторые поля необязательными
        self.fields['project'].required = False
        self.fields['urgency_deadline'].required = False
        self.fields['replacement_reason'].required = False
        self.fields['replaced_employee_id'].required = False
        self.fields['specifics'].required = False
        self.fields['notes'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        position_type = cleaned_data.get('position_type')
        replacement_reason = cleaned_data.get('replacement_reason')
        replaced_employee_id = cleaned_data.get('replaced_employee_id')
        headcount_needed = cleaned_data.get('headcount_needed')
        
        # Проверка для позиций типа "замена"
        if position_type and position_type.type == 'replacement':
            if not replacement_reason:
                raise forms.ValidationError(
                    'Для позиций типа "Замена сотрудника" необходимо указать причину замены'
                )
        
        # Проверка количества
        if headcount_needed and headcount_needed <= 0:
            raise forms.ValidationError('Количество требуемых специалистов должно быть больше 0')
        
        return cleaned_data


class PositionSLAForm(forms.ModelForm):
    """Форма для создания/редактирования SLA позиции"""
    
    def __init__(self, *args, **kwargs):
        plan_pk = kwargs.pop('plan_pk', None)
        super().__init__(*args, **kwargs)
        
        # Если передан plan_pk, фильтруем вакансии по плану
        if plan_pk:
            from apps.hiring_plan.models import HiringPlan
            plan = HiringPlan.objects.get(pk=plan_pk)
            plan_vacancies = plan.positions.values_list('vacancy', flat=True)
            self.fields['vacancy'].queryset = self.fields['vacancy'].queryset.filter(
                id__in=plan_vacancies
            )
        
        # Настройка полей
        self.fields['vacancy'].required = True
        self.fields['target_time_to_fill'].required = True
        self.fields['target_time_to_hire'].required = True
        
        # Делаем некоторые поля необязательными
        self.fields['grade'].required = False
        self.fields['median_time_to_fill'].required = False
        self.fields['warning_threshold_percent'].required = False
        self.fields['critical_threshold_percent'].required = False
    
    class Meta:
        model = PositionSLA
        fields = [
            'vacancy', 'grade', 'target_time_to_fill',
            'target_time_to_hire', 'median_time_to_fill',
            'warning_threshold_percent', 'critical_threshold_percent',
            'is_active'
        ]
        widgets = {
            'vacancy': forms.Select(attrs={
                'class': 'form-control'
            }),
            'grade': forms.Select(attrs={
                'class': 'form-control'
            }),
            'target_time_to_fill': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'help_text': 'Целевое время закрытия вакансии в днях'
            }),
            'target_time_to_hire': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'help_text': 'Целевое время найма в днях'
            }),
            'median_time_to_fill': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'help_text': 'Медианное время закрытия вакансии'
            }),
            'warning_threshold_percent': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '200'
            }),
            'critical_threshold_percent': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '300'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'vacancy': 'Вакансия *',
            'grade': 'Грейд',
            'target_time_to_fill': 'Целевой Time-to-Fill (дни) *',
            'target_time_to_hire': 'Целевой Time-to-Hire (дни) *',
            'median_time_to_fill': 'Медианный Time-to-Fill',
            'warning_threshold_percent': 'Порог предупреждения (%)',
            'critical_threshold_percent': 'Критический порог (%)',
            'is_active': 'Активен',
        }
        help_texts = {
            'grade': 'Если не указан - SLA для всех грейдов вакансии',
            'target_time_to_fill': 'Целевое время закрытия вакансии в днях',
            'target_time_to_hire': 'Целевое время найма в днях',
            'median_time_to_fill': 'Медианное время закрытия вакансии',
            'warning_threshold_percent': 'Процент от SLA для предупреждения',
            'critical_threshold_percent': 'Процент от SLA для критического статуса',
        }
    
    def clean(self):
        cleaned_data = super().clean()
        target_time_to_fill = cleaned_data.get('target_time_to_fill')
        target_time_to_hire = cleaned_data.get('target_time_to_hire')
        warning_threshold = cleaned_data.get('warning_threshold_percent')
        critical_threshold = cleaned_data.get('critical_threshold_percent')
        
        # Проверка логики порогов
        if warning_threshold and critical_threshold:
            if warning_threshold >= critical_threshold:
                raise forms.ValidationError(
                    'Порог предупреждения должен быть меньше критического порога'
                )
        
        # Проверка времени
        if target_time_to_fill and target_time_to_hire:
            if target_time_to_hire > target_time_to_fill:
                raise forms.ValidationError(
                    'Time-to-Hire не может быть больше Time-to-Fill'
                )
        
        return cleaned_data


class PositionKPIOKRForm(forms.ModelForm):
    """Форма для создания/редактирования KPI/OKR"""
    
    class Meta:
        model = PositionKPIOKR
        fields = [
            'name', 'metric_type', 'scope', 'description',
            'target_value', 'unit', 'sla_value', 'actual_value',
            'status', 'period_start', 'period_end',
            'vacancy', 'grade', 'plan_kpi_okr_block', 'hiring_plan'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название KPI/OKR'
            }),
            'metric_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'scope': forms.Select(attrs={
                'class': 'form-control'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Описание метрики...'
            }),
            'target_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'unit': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '%'
            }),
            'sla_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'actual_value': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01'
            }),
            'status': forms.Select(attrs={
                'class': 'form-control'
            }),
            'period_start': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'period_end': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'vacancy': forms.Select(attrs={
                'class': 'form-control'
            }),
            'grade': forms.Select(attrs={
                'class': 'form-control'
            }),
            'plan_kpi_okr_block': forms.Select(attrs={
                'class': 'form-control'
            }),
            'hiring_plan': forms.Select(attrs={
                'class': 'form-control'
            }),
        }
        labels = {
            'name': 'Название *',
            'metric_type': 'Тип метрики *',
            'scope': 'Область применения *',
            'description': 'Описание',
            'target_value': 'Целевое значение *',
            'unit': 'Единица измерения',
            'sla_value': 'SLA значение',
            'actual_value': 'Фактическое значение',
            'status': 'Статус',
            'period_start': 'Начало периода *',
            'period_end': 'Конец периода *',
            'vacancy': 'Вакансия',
            'grade': 'Грейд',
            'plan_kpi_okr_block': 'Блок KPI/OKR',
            'hiring_plan': 'План найма',
        }
        help_texts = {
            'scope': 'Определяет, как применяется метрика',
            'target_value': 'Целевое значение метрики',
            'unit': 'Единица измерения (%, дни, руб. и т.д.)',
            'sla_value': 'Значение по SLA для сравнения',
            'actual_value': 'Фактическое значение метрики',
            'period_start': 'Начало периода для метрики',
            'period_end': 'Конец периода для метрики',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].required = True
        self.fields['metric_type'].required = True
        self.fields['scope'].required = True
        self.fields['target_value'].required = True
        self.fields['period_start'].required = True
        self.fields['period_end'].required = True
        
        # Делаем некоторые поля необязательными
        self.fields['description'].required = False
        self.fields['unit'].required = False
        self.fields['sla_value'].required = False
        self.fields['actual_value'].required = False
        self.fields['vacancy'].required = False
        self.fields['grade'].required = False
        self.fields['plan_kpi_okr_block'].required = False
        self.fields['hiring_plan'].required = False
        
        # Фильтруем queryset'ы
        self.fields['plan_kpi_okr_block'].queryset = PlanKPIOKRBlock.objects.filter(is_active=True)
    
    def clean(self):
        cleaned_data = super().clean()
        scope = cleaned_data.get('scope')
        vacancy = cleaned_data.get('vacancy')
        grade = cleaned_data.get('grade')
        plan_kpi_okr_block = cleaned_data.get('plan_kpi_okr_block')
        period_start = cleaned_data.get('period_start')
        period_end = cleaned_data.get('period_end')
        
        # Проверка scope и связанных полей
        if scope in ['vacancy', 'vacancy_grade'] and not vacancy:
            raise forms.ValidationError(
                f'Для scope "{scope}" необходимо указать вакансию'
            )
        
        if scope in ['grade', 'vacancy_grade'] and not grade:
            raise forms.ValidationError(
                f'Для scope "{scope}" необходимо указать грейд'
            )
        
        if scope == 'plan_block' and not plan_kpi_okr_block:
            raise forms.ValidationError(
                'Для scope "plan_block" необходимо указать блок KPI/OKR'
            )
        
        # Проверка периода
        if period_start and period_end:
            if period_start >= period_end:
                raise forms.ValidationError(
                    'Дата начала периода должна быть раньше даты окончания'
                )
        
        return cleaned_data


class PlanKPIOKRBlockForm(forms.ModelForm):
    """Форма для создания/редактирования блока KPI/OKR"""
    
    class Meta:
        model = PlanKPIOKRBlock
        fields = [
            'name', 'description', 'position_types', 'grades',
            'is_active', 'is_template'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название блока KPI/OKR'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Описание блока...'
            }),
            'position_types': forms.SelectMultiple(attrs={
                'class': 'form-control'
            }),
            'grades': forms.SelectMultiple(attrs={
                'class': 'form-control'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_template': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'name': 'Название блока *',
            'description': 'Описание',
            'position_types': 'Типы позиций',
            'grades': 'Грейды',
            'is_active': 'Активен',
            'is_template': 'Шаблон',
        }
        help_texts = {
            'name': 'Название блока KPI/OKR',
            'description': 'Описание блока и его назначения',
            'position_types': 'Типы позиций (если пусто - все)',
            'grades': 'Грейды (если пусто - все)',
            'is_template': 'Шаблон для переиспользования',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].required = True
        self.fields['position_types'].queryset = PositionType.objects.filter(is_active=True)
        
        # Делаем некоторые поля необязательными
        self.fields['description'].required = False
        self.fields['position_types'].required = False
        self.fields['grades'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        
        if name and len(name.strip()) < 3:
            raise forms.ValidationError('Название блока должно содержать минимум 3 символа')
        
        return cleaned_data


class PeriodPlanCreationForm(forms.Form):
    """Форма для создания периодического плана"""
    
    title = forms.CharField(
        max_length=255,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Название плана'
        }),
        label='Название плана *'
    )
    
    period_type = forms.ModelChoiceField(
        queryset=PlanPeriodType.objects.filter(is_active=True),
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Тип периода *',
        help_text='Выберите период плана'
    )
    
    auto_fill_dates = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        }),
        label='Автоматически рассчитать дату окончания',
        help_text='Автоматически рассчитать дату окончания'
    )
    
    description = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Описание плана...'
        }),
        label='Описание'
    )
    
    def __init__(self, *args, **kwargs):
        # Удаляем instance из kwargs, так как это Form, а не ModelForm
        kwargs.pop('instance', None)
        super().__init__(*args, **kwargs)
        self.fields['title'].required = True
        self.fields['period_type'].required = True


class HiringPlanFilterForm(forms.Form):
    """Форма для фильтрации планов найма"""
    
    STATUS_CHOICES = [
        ('', 'Все статусы'),
        ('active', 'Активные'),
        ('completed', 'Завершенные'),
    ]
    
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию...'
        }),
        label='Поиск'
    )
    
    period_type = forms.ModelChoiceField(
        queryset=PlanPeriodType.objects.filter(is_active=True),
        required=False,
        empty_label='Все типы периодов',
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Тип периода'
    )
    
    is_completed = forms.ChoiceField(
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Статус'
    )
    
    owner = forms.ModelChoiceField(
        queryset=User.objects.filter(is_active=True),
        required=False,
        empty_label='Все владельцы',
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Владелец'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Все поля необязательные для фильтрации
        for field in self.fields.values():
            field.required = False