from django import forms
from django.utils.translation import gettext_lazy as _
from .models import CompanySettings
from apps.finance.models import Grade


class CompanySettingsForm(forms.ModelForm):
    """Форма для редактирования настроек компании"""
    
    class Meta:
        model = CompanySettings
        fields = ['company_name', 'theme', 'main_calendar_id', 'org_structure', 'active_grades']
        widgets = {
            'company_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название компании'
            }),
            'theme': forms.Select(attrs={
                'class': 'form-select'
            }),
            'main_calendar_id': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'ID календаря Google Calendar'
            }),
            'org_structure': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 10,
                'placeholder': '{"departments": [], "employees": []}'
            }),
            'active_grades': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'company_name': 'Название компании',
            'theme': 'Тема оформления',
            'main_calendar_id': 'ID главного календаря',
            'org_structure': 'Оргструктура (JSON)',
            'active_grades': 'Активные грейды компании',
        }
        help_texts = {
            'company_name': 'Название вашей компании',
            'theme': 'Цветовая тема интерфейса приложения',
            'main_calendar_id': 'ID календаря Google Calendar для компании',
            'org_structure': 'Организационная структура в формате JSON',
            'active_grades': 'Выберите грейды, которые используются в вашей компании',
        }
    
    def clean_org_structure(self):
        """Валидация JSON структуры оргструктуры"""
        import json
        org_structure = self.cleaned_data.get('org_structure')
        
        if isinstance(org_structure, str):
            try:
                org_structure = json.loads(org_structure)
            except json.JSONDecodeError:
                raise forms.ValidationError('Неверный формат JSON для оргструктуры')
        
        return org_structure

