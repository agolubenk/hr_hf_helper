from django import forms
from django.contrib.auth import get_user_model
from .models import Vacancy, SalaryRange
from apps.interviewers.models import Interviewer

User = get_user_model()


class VacancyForm(forms.ModelForm):
    """
    Форма для создания и редактирования вакансий
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - name: название вакансии (обязательно)
    - external_id: внешний ID вакансии (обязательно)
    - recruiter: ответственный рекрутер (обязательно)
    - invite_title: заголовок приглашений (обязательно)
    - invite_text: текст приглашений (обязательно)
    - scorecard_title: заголовок скоркарда (обязательно)
    - scorecard_link: ссылка на скоркард
    - questions_belarus, questions_poland: вопросы для интервью
    - vacancy_link_belarus, vacancy_link_poland: ссылки на вакансии
    - candidate_update_prompt, invite_prompt: промпты для AI
    - screening_duration: длительность скринингов
    - available_grades: доступные грейды
    - interviewers: интервьюеры
    - is_active: статус активности
    
    ИСТОЧНИКИ ДАННЫХ:
    - Vacancy модель из apps.vacancies.models
    - User.objects: рекрутеры из группы 'Рекрутер'
    - Grade.objects: все грейды
    - Interviewer.objects: активные интервьюеры
    
    ОБРАБОТКА:
    - Валидация обязательных полей
    - Настройка виджетов для UI
    - Ограничение выбора рекрутеров и интервьюеров
    - Настройка лейблов и подсказок
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для создания/редактирования вакансий
    
    СВЯЗИ:
    - Использует: Vacancy модель, User.objects, Grade.objects, Interviewer.objects
    - Передает: Django форма
    - Может вызываться из: Vacancy views
    """
    
    class Meta:
        model = Vacancy
        fields = [
            'name', 'external_id', 'recruiter', 'invite_title', 'invite_text',
            'scorecard_title', 'scorecard_link', 'questions_belarus', 'questions_poland',
            'vacancy_link_belarus', 'vacancy_link_poland',
            'candidate_update_prompt', 'invite_prompt', 'screening_duration', 
            'available_grades', 'interviewers', 'is_active'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название вакансии'
            }),
            'external_id': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите ID для связи'
            }),
            'recruiter': forms.Select(attrs={
                'class': 'form-select'
            }),
            'invite_title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Заголовок для приглашений'
            }),
            'invite_text': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Сопровождающий текст для приглашений'
            }),
            'scorecard_title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Заголовок Scorecard'
            }),
            'scorecard_link': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://example.com/scorecard'
            }),
            'questions_belarus': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Вопросы для интервью в Беларуси'
            }),
            'questions_poland': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Вопросы для интервью в Польше'
            }),
            'vacancy_link_belarus': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://rabota.by/vacancy/123'
            }),
            'vacancy_link_poland': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://pracuj.pl/job/456'
            }),
            'candidate_update_prompt': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Промпт для обновления информации о кандидате'
            }),
            'invite_prompt': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Промпт для создания приглашения кандидату'
            }),
            'screening_duration': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'max': '480',
                'placeholder': 'Длительность в минутах'
            }),
            'available_grades': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
            'interviewers': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        labels = {
            'name': 'Название вакансии',
            'external_id': 'ID для связи',
            'recruiter': 'Ответственный рекрутер',
            'invite_title': 'Заголовок инвайтов',
            'invite_text': 'Сопровождающий текст для инвайтов',
            'scorecard_title': 'Заголовок Scorecard',
            'scorecard_link': 'Ссылка на Scorecard',
            'questions_belarus': 'Вопросы Беларусь',
            'questions_poland': 'Вопросы Польша',
            'vacancy_link_belarus': 'Ссылка на вакансию (Беларусь)',
            'vacancy_link_poland': 'Ссылка на вакансию (Польша)',
            'candidate_update_prompt': 'Промпт для обновления кандидата',
            'invite_prompt': 'Промпт для инвайта',
            'screening_duration': 'Длительность скринингов',
            'available_grades': 'Доступные грейды',
            'interviewers': 'Интервьюеры',
            'is_active': 'Активна'
        }
        help_texts = {
            'name': 'Название вакансии',
            'external_id': 'Внешний идентификатор для связи с внешними системами',
            'recruiter': 'Рекрутер, ответственный за вакансию',
            'invite_title': 'Заголовок для приглашений кандидатов',
            'invite_text': 'Текст сопроводительного письма для приглашений',
            'scorecard_title': 'Заголовок для Scorecard',
            'scorecard_link': 'Ссылка на Scorecard для оценки кандидатов',
            'questions_belarus': 'Вопросы для интервью в Беларуси',
            'questions_poland': 'Вопросы для интервью в Польше',
            'vacancy_link_belarus': 'Ссылка на вакансию в Беларуси (например, rabota.by, jobs.tut.by)',
            'vacancy_link_poland': 'Ссылка на вакансию в Польше (например, pracuj.pl, nofluffjobs.com)',
            'candidate_update_prompt': 'Промпт для обновления информации о кандидате',
            'invite_prompt': 'Промпт для создания приглашения кандидату',
            'screening_duration': 'Длительность скринингов в минутах (по умолчанию 45 минут)',
            'available_grades': 'Грейды, доступные для данной вакансии',
            'interviewers': 'Интервьюеры, привязанные к вакансии',
            'is_active': 'Активна ли вакансия'
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Ограничиваем выбор рекрутеров только группой "Рекрутер"
        self.fields['recruiter'].queryset = User.objects.filter(groups__name='Рекрутер')
        
        # Ограничиваем выбор только активными грейдами (все грейды активны по умолчанию)
        from apps.finance.models import Grade
        self.fields['available_grades'].queryset = Grade.objects.all()
        
        # Ограничиваем выбор только активными интервьюерами
        self.fields['interviewers'].queryset = Interviewer.objects.filter(is_active=True)
        
        # Делаем обязательные поля
        self.fields['name'].required = True
        self.fields['external_id'].required = True
        self.fields['recruiter'].required = True
        self.fields['invite_title'].required = True
        self.fields['invite_text'].required = True
        self.fields['scorecard_title'].required = True


class VacancySearchForm(forms.Form):
    """
    Форма для поиска вакансий
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - search: поисковый запрос (опционально)
    - recruiter: фильтр по рекрутеру (опционально)
    - is_active: фильтр по статусу активности (опционально)
    
    ИСТОЧНИКИ ДАННЫХ:
    - User.objects: рекрутеры из группы 'Рекрутер'
    
    ОБРАБОТКА:
    - Настройка полей поиска и фильтрации
    - Ограничение выбора рекрутеров
    - Настройка виджетов для UI
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для поиска вакансий
    
    СВЯЗИ:
    - Использует: User.objects
    - Передает: Django форма
    - Может вызываться из: Vacancy views
    """
    
    search = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию или ID...'
        }),
        label='Поиск'
    )
    
    recruiter = forms.ModelChoiceField(
        queryset=None,
        required=False,
        empty_label="Все рекрутеры",
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Рекрутер'
    )
    
    is_active = forms.ChoiceField(
        choices=[
            ('', 'Все'),
            ('true', 'Активные'),
            ('false', 'Неактивные')
        ],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Статус'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['recruiter'].queryset = User.objects.filter(groups__name='Рекрутер')


class SalaryRangeForm(forms.ModelForm):
    """
    Форма для создания и редактирования зарплатных вилок
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - vacancy: вакансия (обязательно)
    - grade: грейд (обязательно)
    - salary_min_usd: минимальная зарплата в USD (обязательно)
    - salary_max_usd: максимальная зарплата в USD (обязательно)
    - is_active: статус активности
    
    ИСТОЧНИКИ ДАННЫХ:
    - SalaryRange модель из apps.vacancies.models
    - Vacancy.objects: активные вакансии
    
    ОБРАБОТКА:
    - Валидация обязательных полей
    - Проверка корректности зарплатной вилки (min <= max)
    - Настройка виджетов для UI
    - Ограничение выбора активными вакансиями
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для создания/редактирования зарплатных вилок
    
    СВЯЗИ:
    - Использует: SalaryRange модель, Vacancy.objects
    - Передает: Django форма
    - Может вызываться из: SalaryRange views
    """
    
    class Meta:
        model = SalaryRange
        fields = ['vacancy', 'grade', 'salary_min_usd', 'salary_max_usd', 'is_active']
        widgets = {
            'vacancy': forms.Select(attrs={
                'class': 'form-select'
            }),
            'grade': forms.Select(attrs={
                'class': 'form-select'
            }),
            'salary_min_usd': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': 'Минимальная зарплата в USD'
            }),
            'salary_max_usd': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': 'Максимальная зарплата в USD'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        labels = {
            'vacancy': 'Вакансия',
            'grade': 'Грейд',
            'salary_min_usd': 'Минимальная зарплата (USD)',
            'salary_max_usd': 'Максимальная зарплата (USD)',
            'is_active': 'Активна'
        }
        help_texts = {
            'vacancy': 'Выберите вакансию для которой устанавливается зарплатная вилка',
            'grade': 'Выберите грейд для которого устанавливается зарплатная вилка',
            'salary_min_usd': 'Минимальная зарплата в долларах США',
            'salary_max_usd': 'Максимальная зарплата в долларах США',
            'is_active': 'Активна ли зарплатная вилка'
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Ограничиваем выбор только активными вакансиями
        self.fields['vacancy'].queryset = Vacancy.objects.filter(is_active=True)
        
        # Делаем обязательные поля
        self.fields['vacancy'].required = True  # Поле vacancy теперь обязательное
        self.fields['grade'].required = True
        self.fields['salary_min_usd'].required = True
        self.fields['salary_max_usd'].required = True
    
    def clean(self):
        cleaned_data = super().clean()
        salary_min = cleaned_data.get('salary_min_usd')
        salary_max = cleaned_data.get('salary_max_usd')
        
        if salary_min and salary_max and salary_min > salary_max:
            raise forms.ValidationError(
                'Минимальная зарплата не может быть больше максимальной'
            )
        
        return cleaned_data


class SalaryRangeSearchForm(forms.Form):
    """
    Форма для поиска зарплатных вилок
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - search: поисковый запрос (опционально)
    - vacancy: фильтр по вакансии (опционально)
    - grade: фильтр по грейду (опционально)
    - is_active: фильтр по статусу активности (опционально)
    
    ИСТОЧНИКИ ДАННЫХ:
    - Vacancy.objects: активные вакансии
    - Grade.objects: все грейды
    
    ОБРАБОТКА:
    - Настройка полей поиска и фильтрации
    - Ограничение выбора активными вакансиями
    - Настройка виджетов для UI
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Django форма для поиска зарплатных вилок
    
    СВЯЗИ:
    - Использует: Vacancy.objects, Grade.objects
    - Передает: Django форма
    - Может вызываться из: SalaryRange views
    """
    
    search = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по вакансии или грейду...'
        }),
        label='Поиск'
    )
    
    vacancy = forms.ModelChoiceField(
        queryset=None,
        required=False,
        empty_label="Все вакансии",
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Вакансия'
    )
    
    grade = forms.ModelChoiceField(
        queryset=None,
        required=False,
        empty_label="Все грейды",
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Грейд'
    )
    
    is_active = forms.ChoiceField(
        choices=[
            ('', 'Все'),
            ('true', 'Активные'),
            ('false', 'Неактивные')
        ],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        label='Статус'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from apps.finance.models import Grade
        
        # Ограничиваем выбор только активными вакансиями
        self.fields['vacancy'].queryset = Vacancy.objects.filter(is_active=True).order_by('name')
        self.fields['grade'].queryset = Grade.objects.all().order_by('name')

