"""
Формы для HeadHunter.ru интеграции

ВХОДЯЩИЕ ДАННЫЕ: POST данные формы
ИСТОЧНИКИ ДАННЫХ: Пользовательский ввод
ОБРАБОТКА: Валидация и сохранение конфигурации OAuth
ВЫХОДЯЩИЕ ДАННЫЕ: Валидированные данные формы
СВЯЗИ: HHRUConfiguration модель
ФОРМАТ: Django формы
"""
from django import forms
from django.utils.translation import gettext_lazy as _
from .models import HHRUConfiguration


class HHRUConfigurationForm(forms.ModelForm):
    """
    Форма для создания/редактирования конфигурации OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: POST данные формы
    ИСТОЧНИКИ ДАННЫХ: Пользовательский ввод
    ОБРАБОТКА: Валидация данных конфигурации OAuth
    ВЫХОДЯЩИЕ ДАННЫЕ: Валидированная форма
    СВЯЗИ: HHRUConfiguration модель
    ФОРМАТ: Django ModelForm
    """
    
    class Meta:
        model = HHRUConfiguration
        fields = ['name', 'client_id', 'client_secret', 'redirect_uri', 'is_active', 'is_default']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Моя конфигурация HH.ru'
            }),
            'client_id': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ваш Client ID из dev.hh.ru'
            }),
            'client_secret': forms.TextInput(attrs={
                'class': 'form-control',
                'type': 'password',
                'placeholder': 'Ваш Client Secret из dev.hh.ru'
            }),
            'redirect_uri': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://ваш-домен.com/hhru/oauth/callback/'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_default': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
        labels = {
            'name': _('Название конфигурации'),
            'client_id': _('Client ID'),
            'client_secret': _('Client Secret'),
            'redirect_uri': _('Redirect URI'),
            'is_active': _('Активна'),
            'is_default': _('Использовать по умолчанию'),
        }
        help_texts = {
            'name': _('Название для идентификации вашей конфигурации'),
            'client_id': _('Идентификатор клиента из вашего приложения на dev.hh.ru'),
            'client_secret': _('Секретный ключ из вашего приложения на dev.hh.ru'),
            'redirect_uri': _('URI для перенаправления после авторизации (должен совпадать с указанным в приложении)'),
            'is_active': _('Использовать ли эту конфигурацию'),
            'is_default': _('Использовать эту конфигурацию по умолчанию'),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Если это создание новой конфигурации, скрываем is_default
        if not self.instance.pk:
            self.fields['is_default'].widget = forms.HiddenInput()
            self.fields['is_default'].initial = True
    
    def clean_redirect_uri(self):
        """Валидация redirect_uri"""
        redirect_uri = self.cleaned_data.get('redirect_uri')
        if redirect_uri and not redirect_uri.startswith(('http://', 'https://')):
            raise forms.ValidationError(_('Redirect URI должен начинаться с http:// или https://'))
        return redirect_uri
    
    def save(self, commit=True):
        """Сохранение конфигурации с привязкой к пользователю"""
        instance = super().save(commit=False)
        
        # Если пользователь указан, привязываем конфигурацию к нему
        if self.user:
            instance.user = self.user
        
        # Если это конфигурация по умолчанию, снимаем флаг с других конфигураций пользователя
        if instance.is_default and self.user:
            HHRUConfiguration.objects.filter(
                user=self.user,
                is_default=True
            ).exclude(pk=instance.pk if instance.pk else None).update(is_default=False)
        
        if commit:
            instance.save()
        
        return instance







