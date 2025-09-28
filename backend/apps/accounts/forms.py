from django import forms
from django.contrib.auth.forms import UserChangeForm
from .models import User, SystemChoice


class ProfileEditForm(UserChangeForm):
    """
    Форма редактирования профиля пользователя
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - first_name: имя пользователя
    - last_name: фамилия пользователя
    - full_name: полное имя пользователя
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
            'full_name', 
            'email', 
            'telegram_username'
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
            'full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Полное имя'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email'
            }),
            'telegram_username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '@username'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Убираем поле пароля из формы
        if 'password' in self.fields:
            del self.fields['password']


class IntegrationSettingsForm(forms.ModelForm):
    """
    Форма настроек интеграций
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - gemini_api_key: API ключ для Gemini
    - huntflow_prod_url: URL продакшн Huntflow
    - huntflow_sandbox_url: URL сэндбокс Huntflow
    - clickup_api_key: API ключ для ClickUp
    - notion_api_key: API ключ для Notion
    - telegram_bot_token: токен Telegram бота
    
    ИСТОЧНИКИ ДАННЫЕ:
    - User модель из apps.accounts.models
    
    ОБРАБОТКА:
    - Настройка полей для интеграций
    - Валидация API ключей
    - Настройка виджетов для UI
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для настроек интеграций
    
    СВЯЗИ:
    - Использует: User модель
    - Передает: Django форма
    - Может вызываться из: Account views
    """
    
    class Meta:
        model = User
        fields = [
            'active_system',
            'interviewer_calendar_url',
            'is_observer_active'
        ]
        widgets = {
            'active_system': forms.Select(attrs={
                'class': 'form-select'
            }),
            'interviewer_calendar_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://calendar.google.com/...'
            }),
            'is_observer_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }


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
            'huntflow_prod_api_key',
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
            'huntflow_prod_api_key': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите API ключ Huntflow (прод)'
            }),
            'huntflow_prod_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://api.huntflow.ru'
            }),
            'active_system': forms.Select(attrs={
                'class': 'form-select'
            }),
        }
