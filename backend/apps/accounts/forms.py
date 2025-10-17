from django import forms
from django.contrib.auth.forms import UserChangeForm
from .models import User, SystemChoice


class ProfileEditForm(UserChangeForm):
    """
    Форма редактирования профиля пользователя
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - first_name: имя пользователя
    - last_name: фамилия пользователя
    - email: электронная почта
    - telegram_username: имя пользователя в Telegram
    
    ИСТОЧНИКИ ДАННЫЕ:
    - User модель из apps.accounts.models
    
    ОБРАБОТКА:
    - Настройка полей для редактирования профиля
    - Удаление поля пароля из формы
    - Настройка виджетов для UI
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для редактирования профиля
    
    СВЯЗИ:
    - Использует: User модель
    - Передает: Django форма
    - Может вызываться из: Account views
    """
    
    class Meta:
        model = User
        fields = [
            'first_name', 
            'last_name', 
            'email', 
            'telegram_username',
            'interview_start_time',
            'interview_end_time'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Имя'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Фамилия'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email'
            }),
            'telegram_username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '@username'
            }),
            'interview_start_time': forms.TimeInput(attrs={
                'class': 'form-control',
                'type': 'time',
                'placeholder': '09:00'
            }),
            'interview_end_time': forms.TimeInput(attrs={
                'class': 'form-control',
                'type': 'time',
                'placeholder': '18:00'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Убираем поле пароля из формы
        if 'password' in self.fields:
            del self.fields['password']
    
    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('interview_start_time')
        end_time = cleaned_data.get('interview_end_time')
        
        if start_time and end_time:
            # Проверяем, что время находится в диапазоне 07:00 - 21:00
            from datetime import time
            
            if start_time < time(7, 0) or start_time > time(21, 0):
                raise forms.ValidationError("Время начала должно быть в диапазоне 07:00 - 21:00")
            
            if end_time < time(7, 0) or end_time > time(21, 0):
                raise forms.ValidationError("Время окончания должно быть в диапазоне 07:00 - 21:00")
            
            # Проверяем, что время начала раньше времени окончания
            if start_time >= end_time:
                raise forms.ValidationError("Время начала должно быть раньше времени окончания")
        
        return cleaned_data


class ApiKeysForm(forms.ModelForm):
    """Форма для управления API ключами"""
    
    class Meta:
        model = User
        fields = [
            'gemini_api_key',
            'clickup_api_key',
            'notion_integration_token',
            'huntflow_sandbox_api_key',
            'huntflow_sandbox_url',
            'huntflow_prod_url',
            'active_system'
        ]
        widgets = {
            'gemini_api_key': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите API ключ Gemini'
            }),
            'clickup_api_key': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите API ключ ClickUp'
            }),
            'notion_integration_token': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите Integration Token Notion'
            }),
            'huntflow_sandbox_api_key': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите API ключ Huntflow (песочница)'
            }),
            'huntflow_sandbox_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://sandbox-api.huntflow.dev'
            }),
            'huntflow_prod_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://api.huntflow.ru'
            }),
            'active_system': forms.Select(attrs={
                'class': 'form-select'
            }),
        }
