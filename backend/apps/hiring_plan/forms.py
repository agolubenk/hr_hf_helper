from django import forms
from django.contrib.auth import get_user_model
from .models import VacancySLA, HiringRequest
from apps.vacancies.models import Vacancy
from apps.finance.models import Grade

User = get_user_model()


class DateInput(forms.DateInput):
    """Кастомный виджет для правильного формата даты в HTML5"""
    input_type = 'date'
    
    def format_value(self, value):
        if value is None:
            return ''
        if hasattr(value, 'strftime'):
            return value.strftime('%Y-%m-%d')
        return str(value)


class HiringRequestForm(forms.ModelForm):
    class Meta:
        model = HiringRequest
        fields = [
            'vacancy', 'grade', 'project', 'priority',
            'opening_reason', 'opening_date', 'recruiter', 'notes'
        ]
        widgets = {
            'vacancy': forms.Select(attrs={'class': 'form-select'}),
            'grade': forms.Select(attrs={'class': 'form-select'}),
            'project': forms.TextInput(attrs={'class': 'form-control'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'opening_reason': forms.Select(attrs={'class': 'form-select'}),
            'opening_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'recruiter': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'vacancy': 'Вакансия',
            'grade': 'Грейд',
            'project': 'Проект',
            'priority': 'Приоритет',
            'opening_reason': 'Причина открытия',
            'opening_date': 'Дата открытия вакансии',
            'recruiter': 'Рекрутер',
            'notes': 'Заметки',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Фильтруем только активных пользователей для выбора рекрутера
        self.fields['recruiter'].queryset = User.objects.filter(is_active=True).order_by('first_name', 'last_name')
        self.fields['recruiter'].empty_label = "Выберите рекрутера..."


class HiringRequestUpdateForm(forms.ModelForm):
    class Meta:
        model = HiringRequest
        fields = [
            'opening_date', 'candidate_id', 'candidate_name', 'closed_date', 'hire_date', 'recruiter', 'notes'
        ]
        widgets = {
            'opening_date': DateInput(attrs={'class': 'form-control'}),
            'candidate_id': forms.TextInput(attrs={'class': 'form-control'}),
            'candidate_name': forms.TextInput(attrs={'class': 'form-control'}),
            'closed_date': DateInput(attrs={'class': 'form-control'}),
            'hire_date': DateInput(attrs={'class': 'form-control'}),
            'recruiter': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'opening_date': 'Дата открытия',
            'candidate_id': 'ID кандидата',
            'candidate_name': 'Имя кандидата',
            'closed_date': 'Дата закрытия',
            'hire_date': 'Дата выхода специалиста',
            'recruiter': 'Рекрутер',
            'notes': 'Заметки',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Фильтруем только активных пользователей для выбора рекрутера
        self.fields['recruiter'].queryset = User.objects.filter(is_active=True).order_by('first_name', 'last_name')
        self.fields['recruiter'].empty_label = "Выберите рекрутера..."

        # Показываем поле opening_date только для планируемых заявок
        if self.instance and self.instance.status != 'planned':
            # Для незапланированных заявок делаем поле только для чтения
            self.fields['opening_date'].widget = forms.DateInput(attrs={'class': 'form-control', 'readonly': True})
            self.fields['opening_date'].required = False
            # Устанавливаем текущее значение
            if self.instance.opening_date:
                self.fields['opening_date'].initial = self.instance.opening_date


class VacancySLAForm(forms.ModelForm):
    class Meta:
        model = VacancySLA
        fields = ['vacancy', 'grade', 'time_to_offer', 'time_to_hire', 'is_active']
        widgets = {
            'vacancy': forms.Select(attrs={'class': 'form-select'}),
            'grade': forms.Select(attrs={'class': 'form-select'}),
            'time_to_offer': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'time_to_hire': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
        labels = {
            'vacancy': 'Вакансия',
            'grade': 'Грейд',
            'time_to_offer': 'Time-to-Offer (дни)',
            'time_to_hire': 'Time-to-Hire (дни)',
            'is_active': 'Активен',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Получаем все грейды
        from apps.finance.models import Grade
        all_grades = Grade.objects.all()
        
        # Получаем все вакансии
        from apps.vacancies.models import Vacancy
        all_vacancies = Vacancy.objects.filter(is_active=True)
        
        # Для создания нового SLA
        if not self.instance.pk:
            # Исключаем вакансии, для которых уже созданы SLA для всех грейдов
            available_vacancies = []
            for vacancy in all_vacancies:
                existing_grades = VacancySLA.objects.filter(vacancy=vacancy).values_list('grade', flat=True)
                if len(existing_grades) < all_grades.count():
                    available_vacancies.append(vacancy)
            
            self.fields['vacancy'].queryset = Vacancy.objects.filter(
                id__in=[v.id for v in available_vacancies]
            )
        else:
            # Для редактирования - показываем все активные вакансии + текущую вакансию
            current_vacancy = self.instance.vacancy
            available_vacancies = list(all_vacancies)
            if current_vacancy not in available_vacancies:
                available_vacancies.append(current_vacancy)
            
            self.fields['vacancy'].queryset = Vacancy.objects.filter(
                id__in=[v.id for v in available_vacancies]
            )
        
        # Настройка грейдов в зависимости от режима
        if not self.instance.pk:
            # Для создания - исключаем грейды, для которых уже есть SLA
            # (логика будет в JavaScript)
            self.fields['grade'].queryset = all_grades
        else:
            # Для редактирования - показываем только текущий грейд
            current_grade = self.instance.grade
            self.fields['grade'].queryset = Grade.objects.filter(id=current_grade.id)
    
    def clean(self):
        cleaned_data = super().clean()
        vacancy = cleaned_data.get('vacancy')
        grade = cleaned_data.get('grade')
        
        if vacancy and grade:
            # Проверяем, не существует ли уже SLA для этой пары
            existing_sla = VacancySLA.objects.filter(
                vacancy=vacancy, 
                grade=grade
            ).exclude(pk=self.instance.pk if self.instance.pk else None)
            
            if existing_sla.exists():
                raise forms.ValidationError(
                    f'SLA для вакансии "{vacancy.name}" и грейда "{grade.name}" уже существует.'
                )
        
        return cleaned_data