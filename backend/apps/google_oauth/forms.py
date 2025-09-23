from django import forms
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .models import SyncSettings, Invite, HRScreening


class SyncSettingsForm(forms.ModelForm):
    """Форма для настройки синхронизации"""
    
    class Meta:
        model = SyncSettings
        fields = ['auto_sync_calendar', 'auto_sync_drive', 'sync_interval', 'max_events', 'max_files']
        widgets = {
            'auto_sync_calendar': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'auto_sync_drive': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'sync_interval': forms.Select(attrs={
                'class': 'form-select'
            }),
            'max_events': forms.NumberInput(attrs={
                'class': 'form-control'
            }),
            'max_files': forms.NumberInput(attrs={
                'class': 'form-control'
            }),
        }
        labels = {
            'auto_sync_calendar': 'Автоматическая синхронизация календаря',
            'auto_sync_drive': 'Автоматическая синхронизация Drive',
            'sync_interval': 'Интервал синхронизации',
            'max_events': 'Максимум событий',
            'max_files': 'Максимум файлов',
        }
        help_texts = {
            'auto_sync_calendar': 'Автоматически синхронизировать события календаря',
            'auto_sync_drive': 'Автоматически синхронизировать файлы Drive',
            'sync_interval': 'Как часто синхронизировать данные',
            'max_events': 'Максимальное количество событий для синхронизации',
            'max_files': 'Максимальное количество файлов для синхронизации',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Изменяем поле sync_interval на ChoiceField для выбора интервалов
        self.fields['sync_interval'] = forms.ChoiceField(
            choices=[
                (15, '15 минут'),
                (30, '30 минут'),
                (60, '1 час'),
                (180, '3 часа'),
                (360, '6 часов'),
                (720, '12 часов'),
                (1440, '24 часа'),
            ],
            widget=forms.Select(attrs={
                'class': 'form-select'
            }),
            label='Интервал синхронизации',
            help_text='Как часто синхронизировать данные'
        )


class InviteForm(forms.ModelForm):
    """Форма для создания инвайта"""
    
    class Meta:
        model = Invite
        fields = ['candidate_url', 'interview_datetime']
        widgets = {
            'candidate_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789',
                'required': True
            }),
            'interview_datetime': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local',
                'required': True
            })
        }
        labels = {
            'candidate_url': _('Ссылка на кандидата'),
            'interview_datetime': _('Дата и время интервью')
        }
        help_texts = {
            'candidate_url': _('Вставьте ссылку на кандидата из веб-интерфейса Huntflow. Формат: https://huntflow.ru/my/org#/vacancy/[id]/filter/[status]/id/[candidate_id]'),
            'interview_datetime': _('Выберите дату и время проведения интервью')
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Устанавливаем минимальную дату на сегодня
        now = timezone.now()
        self.fields['interview_datetime'].widget.attrs['min'] = now.strftime('%Y-%m-%dT%H:%M')
    
    def clean_candidate_url(self):
        """Валидация URL кандидата"""
        candidate_url = self.cleaned_data.get('candidate_url')
        
        if not candidate_url:
            raise forms.ValidationError(_('Ссылка на кандидата обязательна'))
        
        # Проверяем, что URL содержит /vacancy/
        if '/vacancy/' not in candidate_url:
            raise forms.ValidationError(
                _('URL должен содержать /vacancy/ и быть ссылкой на кандидата из Huntflow')
            )
        
        # Валидация ID аккаунта убрана - система сама определит доступность через API
        
        return candidate_url
    
    def clean_interview_datetime(self):
        """Валидация даты и времени интервью"""
        interview_datetime = self.cleaned_data.get('interview_datetime')
        
        if not interview_datetime:
            raise forms.ValidationError(_('Дата и время интервью обязательны'))
        
        # Если время без timezone (что происходит с datetime-local input),
        # считаем его в часовом поясе Minsk
        if interview_datetime.tzinfo is None:
            import pytz
            minsk_tz = pytz.timezone('Europe/Minsk')
            interview_datetime = minsk_tz.localize(interview_datetime)
            print(f"🔍 FORM: Время без timezone, локализовано в Minsk: {interview_datetime}")
        
        # Проверяем, что дата не в прошлом
        now = timezone.now()
        if interview_datetime < now:
            raise forms.ValidationError(_('Дата и время интервью не могут быть в прошлом'))
        
        return interview_datetime
    
    def save(self, commit=True):
        """Сохраняет инвайт с автоматической обработкой"""
        print(f"🔍 FORM_SAVE: Начинаем сохранение инвайта...")
        invite = super().save(commit=False)
        invite.user = self.user
        print(f"🔍 FORM_SAVE: Инвайт создан, user: {invite.user}")
        
        if commit:
            try:
                # Парсим URL и получаем информацию
                print(f"🔍 FORM_SAVE: Парсим URL...")
                success, message = invite.parse_candidate_url()
                if not success:
                    print(f"❌ FORM_SAVE: Ошибка парсинга URL: {message}")
                    raise forms.ValidationError(f'Ошибка парсинга URL: {message}')
                print(f"✅ FORM_SAVE: URL распарсен успешно")
                
                # Получаем информацию о кандидате и вакансии
                print(f"🔍 FORM_SAVE: Получаем информацию о кандидате...")
                success, message = invite.get_candidate_info()
                if not success:
                    print(f"❌ FORM_SAVE: Ошибка получения информации о кандидате: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о кандидате: {message}')
                print(f"✅ FORM_SAVE: Информация о кандидате получена")
                
                print(f"🔍 FORM_SAVE: Получаем информацию о вакансии...")
                success, message = invite.get_vacancy_info()
                if not success:
                    print(f"❌ FORM_SAVE: Ошибка получения информации о вакансии: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о вакансии: {message}')
                print(f"✅ FORM_SAVE: Информация о вакансии получена")
                
                # Создаем структуру в Google Drive
                print(f"🔍 FORM_SAVE: Создаем структуру Google Drive...")
                success, message = invite.create_google_drive_structure()
                if not success:
                    print(f"❌ FORM_SAVE: Ошибка создания структуры Google Drive: {message}")
                    raise forms.ValidationError(f'Ошибка создания структуры Google Drive: {message}')
                print(f"✅ FORM_SAVE: Структура Google Drive создана")
                
                # Обрабатываем scorecard
                print(f"🔍 FORM_SAVE: Обрабатываем scorecard...")
                success, message = invite.process_scorecard()
                if not success:
                    print(f"❌ FORM_SAVE: Ошибка обработки scorecard: {message}")
                    raise forms.ValidationError(f'Ошибка обработки scorecard: {message}')
                print(f"✅ FORM_SAVE: Scorecard обработан")
                
                invite.status = 'sent'
                invite.save()
                print(f"✅ FORM_SAVE: Инвайт сохранен с ID: {invite.id}")
                
            except Exception as e:
                print(f"❌ FORM_SAVE: Исключение в save(): {e}")
                import traceback
                traceback.print_exc()
                raise
        
        return invite


class InviteCombinedForm(forms.ModelForm):
    """Форма для создания инвайта с объединенным полем для ссылки и даты-времени"""
    
    combined_data = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 5,
            'placeholder': 'Вставьте ссылку и дату-время в одном поле...\n\nПример:\nhttps://huntflow.ru/my/org#/vacancy/123/filter/456/id/789\n2025-09-15 14:00',
            'required': True
        }),
        label=_('Ссылка на кандидата и дата-время интервью'),
        help_text=_('Вставьте ссылку на кандидата и дату-время интервью в одном поле. Система автоматически извлечет ссылку и дату.')
    )
    
    class Meta:
        model = Invite
        fields = ['candidate_url', 'interview_datetime']
        widgets = {
            'candidate_url': forms.HiddenInput(attrs={'required': False}),
            'interview_datetime': forms.HiddenInput(attrs={'required': False})
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Делаем скрытые поля необязательными
        self.fields['candidate_url'].required = False
        self.fields['interview_datetime'].required = False
        
        # Устанавливаем минимальную дату на сегодня
        now = timezone.now()
        if 'interview_datetime' in self.fields:
            self.fields['interview_datetime'].widget.attrs['min'] = now.strftime('%Y-%m-%dT%H:%M')
    
    def clean_combined_data(self):
        """Извлекает ссылку и дату-время из объединенного поля"""
        import re
        import pytz
        
        combined_data = self.cleaned_data.get('combined_data', '').strip()
        
        print(f"🔍 CLEAN_COMBINED_DATA: combined_data = '{combined_data}'")
        
        if not combined_data:
            raise forms.ValidationError(_('Поле не может быть пустым'))
        
        # Ищем URL в тексте
        url_pattern = r'https?://[^\s]+'
        urls = re.findall(url_pattern, combined_data)
        
        print(f"🔍 CLEAN_COMBINED_DATA: Найдено URLs: {urls}")
        
        if not urls:
            raise forms.ValidationError(_('Не найдена ссылка на кандидата в тексте'))
        
        candidate_url = urls[0]  # Берем первую найденную ссылку
        
        # Валидация URL
        if '/vacancy/' not in candidate_url:
            raise forms.ValidationError(
                _('URL должен содержать /vacancy/ и быть ссылкой на кандидата из Huntflow')
            )
        
        print(f"✅ CLEAN_COMBINED_DATA: URL извлечен: {candidate_url}")
        print(f"✅ CLEAN_COMBINED_DATA: Весь текст сохранен для Gemini: '{combined_data}'")

        # Сохраняем только URL в скрытое поле, весь текст остается для Gemini
        self.cleaned_data['candidate_url'] = candidate_url

        return combined_data
    
    def clean(self):
        """Очистка формы - только извлекаем URL, дату обрабатывает Gemini"""
        cleaned_data = super().clean()
        
        print(f"🔍 COMBINED_FORM_CLEAN: Начинаем очистку формы")
        print(f"🔍 COMBINED_FORM_CLEAN: cleaned_data keys: {list(cleaned_data.keys())}")
        print(f"🔍 COMBINED_FORM_CLEAN: combined_data: {cleaned_data.get('combined_data', 'НЕТ')}")
        
        # URL уже извлечен в clean_combined_data, дату обработает Gemini
        print(f"🔍 COMBINED_FORM_CLEAN: URL извлечен, дату обработает Gemini AI")
        print(f"🔍 COMBINED_FORM_CLEAN: Финальные cleaned_data: {cleaned_data}")
        return cleaned_data
    
    def save(self, commit=True):
        """Сохраняет инвайт с автоматической обработкой"""
        print(f"🔍 COMBINED_FORM_SAVE: Начинаем сохранение инвайта...")
        invite = super().save(commit=False)
        invite.user = self.user
        
        # Сохраняем исходные данные из формы
        if 'combined_data' in self.cleaned_data:
            invite.original_form_data = self.cleaned_data['combined_data']
            print(f"🔍 COMBINED_FORM_SAVE: Сохранены исходные данные: {invite.original_form_data[:100]}...")
        
        print(f"🔍 COMBINED_FORM_SAVE: Инвайт создан, user: {invite.user}")
        
        if commit:
            try:
                # Парсим URL и получаем информацию
                print(f"🔍 COMBINED_FORM_SAVE: Парсим URL...")
                success, message = invite.parse_candidate_url()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка парсинга URL: {message}")
                    raise forms.ValidationError(f'Ошибка парсинга URL: {message}')
                print(f"✅ COMBINED_FORM_SAVE: URL распарсен успешно")
                
                # Получаем информацию о кандидате и вакансии
                print(f"🔍 COMBINED_FORM_SAVE: Получаем информацию о кандидате...")
                success, message = invite.get_candidate_info()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка получения информации о кандидате: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о кандидате: {message}')
                print(f"✅ COMBINED_FORM_SAVE: Информация о кандидате получена")
                
                print(f"🔍 COMBINED_FORM_SAVE: Получаем информацию о вакансии...")
                success, message = invite.get_vacancy_info()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка получения информации о вакансии: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о вакансии: {message}')
                print(f"✅ COMBINED_FORM_SAVE: Информация о вакансии получена")
                
                # Анализируем время с помощью Gemini AI (это определит дату интервью)
                print(f"🤖 COMBINED_FORM_SAVE: Анализируем время с помощью Gemini AI...")
                success, message = invite.analyze_time_with_gemini()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка при анализе времени с Gemini: {message}")
                    raise forms.ValidationError(f'Ошибка анализа времени с Gemini: {message}')
                else:
                    print(f"✅ COMBINED_FORM_SAVE: Время проанализировано с помощью Gemini AI")
                    # Парсим дату из ответа Gemini
                    if invite.gemini_suggested_datetime:
                        try:
                            from datetime import datetime
                            import pytz
                            minsk_tz = pytz.timezone('Europe/Minsk')
                            # Парсим дату в формате DD.MM.YYYY HH:MM
                            parsed_datetime = datetime.strptime(invite.gemini_suggested_datetime, '%d.%m.%Y %H:%M')
                            invite.interview_datetime = minsk_tz.localize(parsed_datetime)
                            print(f"✅ COMBINED_FORM_SAVE: Дата интервью установлена из Gemini: {invite.interview_datetime}")
                        except Exception as e:
                            print(f"❌ COMBINED_FORM_SAVE: Ошибка парсинга даты от Gemini: {e}")
                            raise forms.ValidationError(f'Ошибка парсинга даты от Gemini: {e}')
                    else:
                        print(f"❌ COMBINED_FORM_SAVE: Gemini не вернул время")
                        raise forms.ValidationError('Gemini не вернул время для интервью')
                
                # Создаем структуру в Google Drive
                print(f"🔍 COMBINED_FORM_SAVE: Создаем структуру Google Drive...")
                success, message = invite.create_google_drive_structure()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка создания структуры Google Drive: {message}")
                    raise forms.ValidationError(f'Ошибка создания структуры Google Drive: {message}')
                print(f"✅ COMBINED_FORM_SAVE: Структура Google Drive создана")
                
                # Обрабатываем scorecard
                print(f"🔍 COMBINED_FORM_SAVE: Обрабатываем scorecard...")
                success, message = invite.process_scorecard()
                if not success:
                    print(f"❌ COMBINED_FORM_SAVE: Ошибка обработки scorecard: {message}")
                    raise forms.ValidationError(f'Ошибка обработки scorecard: {message}')
                print(f"✅ COMBINED_FORM_SAVE: Scorecard обработан")
                
                invite.status = 'sent'
                invite.save()
                print(f"✅ COMBINED_FORM_SAVE: Инвайт сохранен с ID: {invite.id}")
                
            except Exception as e:
                print(f"❌ COMBINED_FORM_SAVE: Исключение в save(): {e}")
                import traceback
                traceback.print_exc()
                raise
        
        return invite


class InviteUpdateForm(forms.ModelForm):
    """Форма для обновления инвайта"""
    
    class Meta:
        model = Invite
        fields = ['status', 'interview_datetime']
        widgets = {
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'interview_datetime': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            })
        }
        labels = {
            'status': _('Статус'),
            'interview_datetime': _('Дата и время интервью')
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Устанавливаем минимальную дату на сегодня
        now = timezone.now()
        self.fields['interview_datetime'].widget.attrs['min'] = now.strftime('%Y-%m-%dT%H:%M')
    
    def clean_interview_datetime(self):
        """Валидация даты и времени интервью"""
        interview_datetime = self.cleaned_data.get('interview_datetime')
        
        if not interview_datetime:
            raise forms.ValidationError(_('Дата и время интервью обязательны'))
        
        # Если время без timezone (что происходит с datetime-local input),
        # считаем его в часовом поясе Minsk
        if interview_datetime.tzinfo is None:
            import pytz
            minsk_tz = pytz.timezone('Europe/Minsk')
            interview_datetime = minsk_tz.localize(interview_datetime)
            print(f"🔍 FORM_UPDATE: Время без timezone, локализовано в Minsk: {interview_datetime}")
        
        # Проверяем, что дата не в прошлом
        now = timezone.now()
        if interview_datetime < now:
            raise forms.ValidationError(_('Дата и время интервью не могут быть в прошлом'))
        
        return interview_datetime


class CalendarEventSearchForm(forms.Form):
    """Форма для поиска событий календаря"""
    
    search = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию или описанию...'
        }),
        label='Поиск'
    )
    
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        label='Дата от'
    )
    
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        label='Дата до'
    )
    
    


class DriveFileSearchForm(forms.Form):
    """Форма для поиска файлов Google Drive"""
    
    search = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию файла...'
        }),
        label='Поиск'
    )
    
    
    
    is_shared = forms.ChoiceField(
        choices=[
            ('', 'Все'),
            ('true', 'С общим доступом'),
            ('false', 'Без общего доступа'),
        ],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Общий доступ'
    )
    
    shared_with_me = forms.ChoiceField(
        choices=[
            ('', 'Все'),
            ('true', 'Поделились со мной'),
            ('false', 'Мои файлы'),
        ],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Владелец'
    )


class HRScreeningForm(forms.ModelForm):
    """Форма для создания HR-скрининга"""
    
    class Meta:
        model = HRScreening
        fields = ['input_data']
        widgets = {
            'input_data': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 10,
                'placeholder': 'Вставьте данные для HR-скрининга...\n\nПример:\nhttps://sandbox.huntflow.dev/my/org[ваш_org_id]#/vacancy/3/filter/workon/id/17\n\nКандидат: Иван Петров\nОжидания по зарплате: 150,000 - 200,000 руб\nОпыт работы: 3 года в разработке\nТехнологии: Python, Django, PostgreSQL\nДополнительная информация: ...',
                'required': True
            })
        }
        labels = {
            'input_data': _('Данные для HR-скрининга')
        }
        help_texts = {
            'input_data': _('Вставьте ссылку на кандидата и любые дополнительные данные для анализа. Система автоматически извлечет ссылку и проанализирует данные с помощью AI.')
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
    
    def clean_input_data(self):
        """Валидация входных данных"""
        input_data = self.cleaned_data.get('input_data', '').strip()
        
        if not input_data:
            raise forms.ValidationError(_('Поле не может быть пустым'))
        
        # Проверяем, что в тексте есть ссылка на Huntflow
        if 'huntflow' not in input_data.lower() and '/vacancy/' not in input_data:
            raise forms.ValidationError(
                _('В тексте должна быть ссылка на кандидата в Huntflow (содержащая /vacancy/)')
            )
        
        return input_data
    
    def save(self, commit=True):
        """Сохраняет HR-скрининг с автоматической обработкой"""
        print(f"🔍 HR_SCREENING_FORM_SAVE: Начинаем сохранение HR-скрининга...")
        hr_screening = super().save(commit=False)
        hr_screening.user = self.user
        print(f"🔍 HR_SCREENING_FORM_SAVE: HR-скрининг создан, user: {hr_screening.user}")
        
        if commit:
            try:
                # Извлекаем URL из текста
                print(f"🔍 HR_SCREENING_FORM_SAVE: Извлекаем URL...")
                success, message = hr_screening._extract_url_from_text()
                if not success:
                    print(f"❌ HR_SCREENING_FORM_SAVE: Ошибка извлечения URL: {message}")
                    raise forms.ValidationError(f'Ошибка извлечения URL: {message}')
                print(f"✅ HR_SCREENING_FORM_SAVE: URL извлечен: {hr_screening.candidate_url}")
                
                # Парсим URL и получаем информацию
                print(f"🔍 HR_SCREENING_FORM_SAVE: Парсим URL...")
                success, message = hr_screening.parse_candidate_url()
                if not success:
                    print(f"❌ HR_SCREENING_FORM_SAVE: Ошибка парсинга URL: {message}")
                    raise forms.ValidationError(f'Ошибка парсинга URL: {message}')
                print(f"✅ HR_SCREENING_FORM_SAVE: URL распарсен успешно")
                
                # Получаем информацию о кандидате и вакансии
                print(f"🔍 HR_SCREENING_FORM_SAVE: Получаем информацию о кандидате...")
                success, message = hr_screening.get_candidate_info()
                if not success:
                    print(f"❌ HR_SCREENING_FORM_SAVE: Ошибка получения информации о кандидате: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о кандидате: {message}')
                print(f"✅ HR_SCREENING_FORM_SAVE: Информация о кандидате получена")
                hr_screening.save()  # Сохраняем промежуточные данные
                
                print(f"🔍 HR_SCREENING_FORM_SAVE: Получаем информацию о вакансии...")
                success, message = hr_screening.get_vacancy_info()
                if not success:
                    print(f"❌ HR_SCREENING_FORM_SAVE: Ошибка получения информации о вакансии: {message}")
                    raise forms.ValidationError(f'Ошибка получения информации о вакансии: {message}')
                print(f"✅ HR_SCREENING_FORM_SAVE: Информация о вакансии получена")
                hr_screening.save()  # Сохраняем промежуточные данные
                
                # Анализируем данные с помощью Gemini AI
                print(f"🤖 HR_SCREENING_FORM_SAVE: Анализируем данные с помощью Gemini AI...")
                
                success, message = hr_screening.analyze_with_gemini()
                if not success:
                    print(f"❌ HR_SCREENING_FORM_SAVE: Ошибка при анализе с Gemini: {message}")
                    raise forms.ValidationError(f'Ошибка анализа с Gemini: {message}')
                else:
                    print(f"✅ HR_SCREENING_FORM_SAVE: Анализ завершен с помощью Gemini AI")
                
                hr_screening.save()
                print(f"✅ HR_SCREENING_FORM_SAVE: HR-скрининг сохранен с ID: {hr_screening.id}")
                print(f"🔍 HR_SCREENING_FORM_SAVE: Данные кандидата: {hr_screening.candidate_name}")
                print(f"🔍 HR_SCREENING_FORM_SAVE: Данные вакансии: {hr_screening.vacancy_title}")
                print(f"🔍 HR_SCREENING_FORM_SAVE: Анализ Gemini: {hr_screening.gemini_analysis[:100] if hr_screening.gemini_analysis else 'Нет анализа'}...")
                
                # Автоматически обновляем кандидата в Huntflow
                print(f"🔄 HR_SCREENING_FORM_SAVE: Автоматически обновляем кандидата в Huntflow...")
                success, message = hr_screening.update_candidate_in_huntflow()
                if success:
                    print(f"✅ HR_SCREENING_FORM_SAVE: Кандидат успешно обновлен в Huntflow: {message}")
                else:
                    print(f"⚠️ HR_SCREENING_FORM_SAVE: Предупреждение при обновлении кандидата: {message}")
                    # Не прерываем процесс, так как HR-скрининг уже создан и проанализирован
                
            except Exception as e:
                print(f"❌ HR_SCREENING_FORM_SAVE: Исключение в save(): {e}")
                import traceback
                traceback.print_exc()
                raise
        
        return hr_screening


class CombinedForm(forms.Form):
    """
    Упрощенная форма для автоматического определения типа действия
    """
    
    combined_data = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 8,
            'placeholder': 'Вставьте ссылку на кандидата и любые дополнительные данные...\n\nПримеры:\n\nДля HR-скрининга (много текста):\nhttps://sandbox.huntflow.dev/my/org[ваш_org_id]#/vacancy/3/filter/workon/id/17\n\nКандидат: Иван Петров\nОжидания по зарплате: 150,000 - 200,000 руб\nОпыт работы: 3 года в разработке\nТехнологии: Python, Django, PostgreSQL\nДополнительная информация: ...\n\nДля инвайта (дата + время):\nhttps://sandbox.huntflow.dev/my/org[ваш_org_id]#/vacancy/3/filter/workon/id/17\n2025-09-15 14:00',
            'required': True
        }),
        label=_('Ссылка на кандидата и данные'),
        help_text=_('Вставьте ссылку на кандидата и любые дополнительные данные. Система автоматически определит тип действия: если есть дата/время - создаст инвайт, если много текста - проведет HR-скрининг.')
    )
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
    
    def clean_combined_data(self):
        """Валидация объединенных данных"""
        combined_data = self.cleaned_data.get('combined_data', '').strip()
        
        if not combined_data:
            raise forms.ValidationError(_('Поле не может быть пустым'))
        
        # Проверяем, что в тексте есть ссылка на Huntflow
        if 'huntflow' not in combined_data.lower() and '/vacancy/' not in combined_data:
            raise forms.ValidationError(
                _('В тексте должна быть ссылка на кандидата в Huntflow (содержащая /vacancy/)')
            )
        
        return combined_data
    
    def determine_action_type(self):
        """Автоматическое определение типа действия на основе содержимого"""
        combined_data = self.cleaned_data.get('combined_data', '')
        
        # Паттерны для поиска дат, дней недели и времени
        import re
        
        # Паттерны дат
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # 2025-09-15
            r'\d{2}\.\d{2}\.\d{4}',  # 15.09.2025
            r'\d{2}/\d{2}/\d{4}',   # 15/09/2025
        ]
        
        # Паттерны времени
        time_patterns = [
            r'\d{1,2}:\d{2}',  # 14:00, 9:30
            r'\d{1,2}:\d{2}:\d{2}',  # 14:00:00
        ]
        
        # Дни недели
        weekdays = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
                   'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                   'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс', 
                   'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 
                   'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт', 'всн',
                   'MN', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
        
        # Проверяем наличие дат
        has_date = any(re.search(pattern, combined_data, re.IGNORECASE) for pattern in date_patterns)
        
        # Проверяем наличие времени
        has_time = any(re.search(pattern, combined_data) for pattern in time_patterns)
        
        # Проверяем наличие дней недели
        has_weekday = any(day in combined_data.lower() for day in weekdays)
        
        # Проверяем количество текста (исключая ссылку)
        lines = combined_data.split('\n')
        non_url_lines = [line.strip() for line in lines if line.strip() and 'huntflow' not in line.lower() and '/vacancy/' not in line]
        text_length = sum(len(line) for line in non_url_lines)
        
        # Добавляем отладочную информацию
        print(f"🔍 DETERMINE_ACTION_TYPE: Анализируем данные:")
        print(f"🔍 DETERMINE_ACTION_TYPE: has_date = {has_date}")
        print(f"🔍 DETERMINE_ACTION_TYPE: has_time = {has_time}")
        print(f"🔍 DETERMINE_ACTION_TYPE: has_weekday = {has_weekday}")
        print(f"🔍 DETERMINE_ACTION_TYPE: text_length = {text_length}")
        print(f"🔍 DETERMINE_ACTION_TYPE: non_url_lines = {non_url_lines}")
        
        # Логика определения:
        # Если есть дата/время/день недели И мало текста - это инвайт
        # Если много текста - это HR-скрининг
        if (has_date or has_time or has_weekday) and text_length < 200:
            print(f"🔍 DETERMINE_ACTION_TYPE: Определен тип: invite")
            return 'invite'
        elif text_length > 100:
            print(f"🔍 DETERMINE_ACTION_TYPE: Определен тип: hr_screening")
            return 'hr_screening'
        else:
            # По умолчанию HR-скрининг
            print(f"🔍 DETERMINE_ACTION_TYPE: Определен тип по умолчанию: hr_screening")
            return 'hr_screening'
