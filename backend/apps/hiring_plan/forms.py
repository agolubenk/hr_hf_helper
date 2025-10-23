from django import forms
from django.contrib.auth import get_user_model
from .models import HiringPlan, HiringPlanPosition

User = get_user_model()


class HiringPlanForm(forms.ModelForm):
    """Форма для создания и редактирования плана найма"""
    
    class Meta:
        model = HiringPlan
        fields = [
            'title', 'description', 'start_date', 'end_date', 
            'status', 'owner', 'responsible_recruiter'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название плана найма...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Описание плана найма...'
            }),
            'start_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'end_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'status': forms.Select(attrs={
                'class': 'form-control'
            }),
            'owner': forms.Select(attrs={
                'class': 'form-control'
            }),
            'responsible_recruiter': forms.Select(attrs={
                'class': 'form-control'
            }),
        }
        labels = {
            'title': 'Название плана *',
            'description': 'Описание',
            'start_date': 'Дата начала *',
            'end_date': 'Дата окончания',
            'status': 'Статус *',
            'owner': 'Владелец',
            'responsible_recruiter': 'Ответственный рекрутер *',
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Фильтруем рекрутеров
        self.fields['responsible_recruiter'].queryset = User.objects.filter(
            groups__name='Рекрутер'
        ).order_by('first_name', 'last_name')
        
        # Если пользователь передан, устанавливаем его как владельца
        if user and not self.instance.pk:
            self.fields['owner'].initial = user
            self.fields['owner'].widget = forms.HiddenInput()
        
        # Делаем поля обязательными
        self.fields['title'].required = True
        self.fields['start_date'].required = True
        self.fields['status'].required = True
        self.fields['responsible_recruiter'].required = True
    
    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise forms.ValidationError(
                'Дата начала не может быть позже даты окончания.'
            )
        
        return cleaned_data


class HiringPlanPositionForm(forms.ModelForm):
    """Форма для создания и редактирования позиции в плане найма"""
    
    class Meta:
        model = HiringPlanPosition
        fields = [
            'vacancy', 'project', 'headcount_needed', 'headcount_hired', 
            'headcount_in_progress', 'priority', 'urgency_deadline',
            'grades', 'specifics', 'notes', 'is_active'
        ]
        widgets = {
            'vacancy': forms.Select(attrs={
                'class': 'form-control'
            }),
            'project': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название проекта'
            }),
            'headcount_needed': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'placeholder': 'Количество требуемых специалистов'
            }),
            'headcount_hired': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Уже нанято'
            }),
            'headcount_in_progress': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'В процессе найма'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-control'
            }),
            'urgency_deadline': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'grades': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
            'specifics': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Особые требования и специфика позиции...'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Дополнительные заметки...'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'vacancy': 'Вакансия *',
            'project': 'Проект',
            'headcount_needed': 'Требуется специалистов *',
            'headcount_hired': 'Нанято специалистов',
            'headcount_in_progress': 'В процессе найма',
            'priority': 'Приоритет *',
            'urgency_deadline': 'Дедлайн',
            'grades': 'Грейды',
            'specifics': 'Специфика позиции',
            'notes': 'Заметки',
            'is_active': 'Активна',
        }
    
    def __init__(self, *args, **kwargs):
        hiring_plan = kwargs.pop('hiring_plan', None)
        super().__init__(*args, **kwargs)
        
        # Показываем все вакансии (можно добавлять любые вакансии в план)
        self.fields['vacancy'].queryset = self.fields['vacancy'].queryset.order_by('name')
        
        # Делаем поля обязательными
        self.fields['vacancy'].required = True
        self.fields['headcount_needed'].required = True
        self.fields['priority'].required = True
    
    def clean(self):
        cleaned_data = super().clean()
        headcount_needed = cleaned_data.get('headcount_needed', 0)
        headcount_hired = cleaned_data.get('headcount_hired', 0)
        headcount_in_progress = cleaned_data.get('headcount_in_progress', 0)
        
        # Проверяем логику количества
        if headcount_hired > headcount_needed:
            raise forms.ValidationError(
                'Количество нанятых не может превышать требуемое количество.'
            )
        
        if headcount_in_progress > (headcount_needed - headcount_hired):
            raise forms.ValidationError(
                'Количество в процессе не может превышать оставшееся количество.'
            )
        
        return cleaned_data


class HiringPlanFilterForm(forms.Form):
    """Форма для фильтрации планов найма"""
    
    STATUS_CHOICES = [('', 'Все статусы')] + HiringPlan.STATUS_CHOICES
    
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию...'
        }),
        label='Поиск'
    )
    
    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Статус'
    )
    
    responsible_recruiter = forms.ModelChoiceField(
        queryset=User.objects.filter(groups__name='Рекрутер').order_by('first_name', 'last_name'),
        required=False,
        empty_label='Все рекрутеры',
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label='Рекрутер'
    )
    
    start_date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        label='Дата начала от'
    )
    
    start_date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        label='Дата начала до'
    )
