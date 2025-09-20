from django import forms
from django.contrib.auth import get_user_model
from .models import NotionSettings

User = get_user_model()


class NotionSettingsForm(forms.ModelForm):
    """Форма для настроек Notion"""
    
    # Явно определяем поля как ChoiceField
    database_id = forms.ChoiceField(choices=[], required=False, widget=forms.Select(attrs={'class': 'form-select', 'id': 'id_database_id'}))
    
    class Meta:
        model = NotionSettings
        fields = [
            'database_id',
            'auto_sync',
            'sync_interval'
        ]
        widgets = {
            'auto_sync': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'sync_interval': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '1440'
            })
        }
        labels = {
            'database_id': 'База данных',
            'auto_sync': 'Автоматическая синхронизация',
            'sync_interval': 'Интервал синхронизации (минуты)'
        }
        help_texts = {
            'database_id': 'Выберите базу данных для синхронизации страниц.',
            'auto_sync': 'Автоматически синхронизировать страницы с указанным интервалом.',
            'sync_interval': 'Интервал автоматической синхронизации в минутах (от 1 до 1440).'
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Устанавливаем значения по умолчанию
        if self.user and not self.instance.pk:
            self.fields['auto_sync'].initial = True
            self.fields['sync_interval'].initial = 30
        
        # Загружаем базы данных, если у пользователя есть integration токен
        if self.user and self.user.notion_integration_token:
            self._load_choices()
        else:
            self.fields['database_id'].choices = [('', 'Integration токен не настроен')]
        
        # Проверяем, очищены ли настройки из-за изменения integration токена
        if self.user and self.instance and self.instance.pk:
            if (not self.instance.database_id and self.user.notion_integration_token):
                # Настройки очищены, но integration токен есть - показываем предупреждение
                self.fields['database_id'].help_text = (
                    'Настройки базы данных были очищены из-за изменения integration токена. '
                    'Пожалуйста, выберите новую базу данных.'
                )
    
    def _load_choices(self):
        """Загружает choices для базы данных"""
        try:
            from .services import NotionService
            service = NotionService(self.user.notion_integration_token)
            
            # Получаем доступные базы данных
            databases = service.get_databases()
            
            if databases:
                database_choices = [('', 'Выберите базу данных...')]
                for database in databases:
                    title = database.get('title', [{}])
                    if title and len(title) > 0:
                        database_name = title[0].get('plain_text', 'Без названия')
                    else:
                        database_name = 'Без названия'
                    
                    database_choices.append((database['id'], database_name))
                self.fields['database_id'].choices = database_choices
            else:
                self.fields['database_id'].choices = [('', 'Нет доступных баз данных')]
            
        except Exception as e:
            # В случае ошибки, показываем сообщение об ошибке
            error_msg = f'Ошибка загрузки: {str(e)}'
            self.fields['database_id'].choices = [('', error_msg)]
    
    def clean(self):
        """Общая валидация формы"""
        cleaned_data = super().clean()
        
        # Проверяем, что у пользователя настроен integration токен
        if self.user and not self.user.notion_integration_token:
            raise forms.ValidationError('Integration токен Notion не настроен в профиле пользователя. Перейдите в профиль для настройки.')
        
        # Проверяем, что указаны все обязательные поля только если токен настроен
        if self.user and self.user.notion_integration_token:
            required_fields = ['database_id']
            for field in required_fields:
                if not cleaned_data.get(field):
                    raise forms.ValidationError(f'Поле "{self.fields[field].label}" обязательно для заполнения')
        
        return cleaned_data
    
    def clean_database_id(self):
        """Валидация database_id"""
        database_id = self.cleaned_data.get('database_id')
        if database_id and database_id != '':
            # Простая валидация - проверяем, что это не пустая строка
            # Детальную валидацию против API оставляем для тестирования подключения
            pass
        return database_id
    
    def clean_sync_interval(self):
        """Валидация интервала синхронизации"""
        sync_interval = self.cleaned_data.get('sync_interval')
        
        if sync_interval is not None:
            if sync_interval < 1:
                raise forms.ValidationError('Интервал синхронизации должен быть не менее 1 минуты')
            if sync_interval > 1440:
                raise forms.ValidationError('Интервал синхронизации должен быть не более 1440 минут (24 часа)')
        
        return sync_interval


class NotionTestConnectionForm(forms.Form):
    """Форма для тестирования подключения к Notion"""
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
    
    def clean(self):
        """Валидация формы"""
        cleaned_data = super().clean()
        
        if self.user and not self.user.notion_integration_token:
            raise forms.ValidationError('Integration токен Notion не настроен в профиле пользователя')
        
        return cleaned_data
