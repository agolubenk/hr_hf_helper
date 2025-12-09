# Модели данных для HH.ru интеграции

## Добавление моделей в `apps/huntflow/models.py`

```python
# -*- coding: utf-8 -*-
"""
Модели для интеграции с HH.ru
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class HHResponse(models.Model):
    """
    Модель для сохранения откликов из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: ID отклика из HH.ru, данные резюме, статус
    ИСТОЧНИКИ ДАННЫХ: HH.ru API
    ОБРАБОТКА: Сохранение и отслеживание откликов из HH.ru
    ВЫХОДЯЩИЕ ДАННЫЕ: Информация об отклике в базе данных
    СВЯЗИ: User, HuntflowApplicant
    ФОРМАТ: Django модель
    """
    
    RESPONSE_STATE_CHOICES = [
        ('invitation', 'Приглашение'),
        ('applied', 'Отклик'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
        ('ignored', 'Проигнорировано'),
    ]
    
    IMPORT_STATUS_CHOICES = [
        ('pending', 'Ожидание'),
        ('imported', 'Импортирован'),
        ('filtered', 'Отфильтрован'),
        ('error', 'Ошибка'),
        ('skipped', 'Пропущен'),
    ]
    
    # Основные поля
    hh_response_id = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Уникальный ID отклика на HH.ru"
    )
    hh_vacancy_id = models.CharField(
        max_length=50,
        help_text="ID вакансии на HH.ru"
    )
    
    # Данные кандидата
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Дополнительная информация
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    location = models.CharField(max_length=100, blank=True)
    location_id = models.CharField(max_length=10, blank=True)
    
    # Опыт работы (JSON)
    experience_json = models.JSONField(
        default=list,
        help_text="История опыта работы в формате JSON"
    )
    
    # Навыки (JSON)
    skills_json = models.JSONField(
        default=list,
        help_text="Список навыков в формате JSON"
    )
    
    # Полный текст резюме
    resume_text = models.TextField(blank=True)
    
    # Ссылки
    hh_resume_url = models.URLField(blank=True)
    hh_applicant_url = models.URLField(blank=True)
    
    # Статусы
    response_state = models.CharField(
        max_length=20,
        choices=RESPONSE_STATE_CHOICES,
        default='applied'
    )
    import_status = models.CharField(
        max_length=20,
        choices=IMPORT_STATUS_CHOICES,
        default='pending'
    )
    
    # Данные о фильтрации
    filter_reasons = models.JSONField(
        default=list,
        help_text="Причины отфильтрации кандидата"
    )
    filter_score = models.FloatField(
        default=0.0,
        help_text="Оценка совпадения с фильтрами (0-100)"
    )
    
    # Связь с Huntflow
    account_id = models.IntegerField(null=True, blank=True)
    vacancy_id = models.IntegerField(null=True, blank=True)
    applicant_id = models.IntegerField(null=True, blank=True)
    
    # Пользователь, который импортировал
    imported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imported_hh_responses'
    )
    
    # Метаинформация
    raw_data = models.JSONField(
        default=dict,
        help_text="Полные данные из HH.ru API"
    )
    
    # Временные метки
    hh_created_at = models.DateTimeField(
        help_text="Когда был создан отклик на HH.ru"
    )
    hh_updated_at = models.DateTimeField(
        help_text="Когда отклик был обновлен на HH.ru"
    )
    imported_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Когда отклик был импортирован в нашу систему"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Когда отклик был обработан"
    )
    
    class Meta:
        db_table = 'hh_responses'
        ordering = ['-hh_updated_at']
        indexes = [
            models.Index(fields=['account_id', 'vacancy_id']),
            models.Index(fields=['import_status']),
            models.Index(fields=['hh_vacancy_id']),
            models.Index(fields=['email']),
            models.Index(fields=['hh_response_id']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.import_status}"
    
    def calculate_age(self):
        """Рассчитывает возраст кандидата"""
        from datetime import date
        if self.birth_date:
            today = date.today()
            return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
            )
        return None
    
    def calculate_experience_years(self):
        """Рассчитывает общий стаж работы в годах"""
        from datetime import datetime, date
        
        experience_list = self.experience_json or []
        total_days = 0
        today = date.today()
        
        for exp in experience_list:
            try:
                start = datetime.fromisoformat(exp.get('start', '')).date()
                end_str = exp.get('end')
                end = datetime.fromisoformat(end_str).date() if end_str else today
                total_days += (end - start).days
            except (ValueError, TypeError):
                continue
        
        return total_days / 365.25 if total_days > 0 else 0
    
    def get_filter_summary(self):
        """Получает резюме фильтрации"""
        return {
            'reasons': self.filter_reasons,
            'score': self.filter_score,
            'status': self.get_import_status_display()
        }


class HHSyncConfiguration(models.Model):
    """
    Конфигурация синхронизации откликов из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: user, account_id, vacancy_id, фильтры
    ИСТОЧНИКИ ДАННЫХ: Конфигурация пользователя
    ОБРАБОТКА: Сохранение и управление конфигурациями синхронизации
    ВЫХОДЯЩИЕ ДАННЫЕ: Сохраненные конфигурации в базе данных
    СВЯЗИ: User, HHResponse
    ФОРМАТ: Django модель
    """
    
    SYNC_FREQUENCY_CHOICES = [
        ('hourly', 'Каждый час'),
        ('every_6_hours', 'Каждые 6 часов'),
        ('daily', 'Ежедневно'),
        ('weekly', 'Еженедельно'),
        ('manual', 'Ручная синхронизация'),
    ]
    
    # Идентификация
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='hh_sync_configurations'
    )
    account_id = models.IntegerField()
    vacancy_id = models.IntegerField()
    hh_vacancy_id = models.CharField(max_length=50)
    
    # Фильтры (JSON)
    filters = models.JSONField(
        default=dict,
        help_text="""
        {
            "allowed_locations": ["1", "2"],
            "allowed_genders": ["any"],
            "min_age": 18,
            "max_age": 65,
            "check_existing": true,
            "min_experience_years": 1,
            "max_experience_years": 50
        }
        """
    )
    
    # Настройки синхронизации
    enabled = models.BooleanField(default=True)
    sync_frequency = models.CharField(
        max_length=20,
        choices=SYNC_FREQUENCY_CHOICES,
        default='daily'
    )
    
    # Статистика
    total_responses_found = models.IntegerField(default=0)
    total_responses_imported = models.IntegerField(default=0)
    total_responses_filtered = models.IntegerField(default=0)
    total_responses_errors = models.IntegerField(default=0)
    
    # Дополнительные опции
    auto_add_to_project = models.BooleanField(
        default=False,
        help_text="Автоматически добавлять импортированных кандидатов в проект"
    )
    project_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID проекта для автоматического добавления"
    )
    
    # Временные метки
    created_at = models.DateTimeField(auto_now_add=True)
    last_sync = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Дата последней успешной синхронизации"
    )
    next_scheduled_sync = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Дата следующей запланированной синхронизации"
    )
    
    class Meta:
        db_table = 'hh_sync_configurations'
        unique_together = ('user', 'account_id', 'vacancy_id')
        indexes = [
            models.Index(fields=['user', 'enabled']),
            models.Index(fields=['sync_frequency']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Синхронизация вакансии {self.vacancy_id}"
    
    def get_filters(self):
        """Получает фильтры в виде словаря с значениями по умолчанию"""
        default_filters = {
            'allowed_locations': ['1', '2', '3'],
            'allowed_genders': ['male', 'female', 'any'],
            'min_age': 18,
            'max_age': 65,
            'check_existing': True,
            'min_experience_years': 1,
            'max_experience_years': 50
        }
        
        if self.filters:
            default_filters.update(self.filters)
        
        return default_filters
    
    def set_filters(self, filters):
        """Устанавливает фильтры"""
        self.filters = filters
        self.save()
    
    def update_statistics(self, import_result):
        """Обновляет статистику на основе результатов импорта"""
        self.total_responses_found += import_result.get('total_responses', 0)
        self.total_responses_imported += import_result.get('imported', 0)
        self.total_responses_filtered += import_result.get('filtered_out', 0)
        self.total_responses_errors += import_result.get('errors', 0)
        self.last_sync = timezone.now()
        self.save()
    
    def schedule_next_sync(self):
        """Планирует следующую синхронизацию в зависимости от частоты"""
        from datetime import timedelta
        
        frequency_map = {
            'hourly': timedelta(hours=1),
            'every_6_hours': timedelta(hours=6),
            'daily': timedelta(days=1),
            'weekly': timedelta(weeks=1),
            'manual': None,  # Не планировать автоматически
        }
        
        delta = frequency_map.get(self.sync_frequency)
        if delta:
            self.next_scheduled_sync = timezone.now() + delta
            self.save()


class HHSyncLog(models.Model):
    """
    Логирование синхронизаций из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: configuration, результаты синхронизации
    ИСТОЧНИКИ ДАННЫЕ: HH.ru API, процесс импорта
    ОБРАБОТКА: Ведение логов синхронизации
    ВЫХОДЯЩИЕ ДАННЫЕ: История синхронизаций в базе данных
    СВЯЗИ: HHSyncConfiguration
    ФОРМАТ: Django модель
    """
    
    STATUS_CHOICES = [
        ('started', 'Начато'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершено'),
        ('failed', 'Ошибка'),
        ('partial', 'Частичное завершение'),
    ]
    
    configuration = models.ForeignKey(
        HHSyncConfiguration,
        on_delete=models.CASCADE,
        related_name='sync_logs'
    )
    
    # Статус
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='started'
    )
    
    # Результаты
    total_responses = models.IntegerField(default=0)
    imported_count = models.IntegerField(default=0)
    filtered_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    
    # Ошибки
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict)
    
    # Статистика
    sync_duration_seconds = models.IntegerField(
        null=True,
        blank=True,
        help_text="Длительность синхронизации в секундах"
    )
    
    # Метаинформация
    filter_summary = models.JSONField(
        default=dict,
        help_text="Резюме фильтрации (reason: count)"
    )
    
    # Временные метки
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'hh_sync_logs'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['configuration', '-started_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Синхронизация {self.configuration} - {self.get_status_display()}"
    
    def mark_completed(self):
        """Отмечает синхронизацию как завершенную"""
        self.completed_at = timezone.now()
        if self.started_at:
            delta = self.completed_at - self.started_at
            self.sync_duration_seconds = int(delta.total_seconds())
        self.save()
    
    def mark_failed(self, error_message, error_details=None):
        """Отмечает синхронизацию как ошибку"""
        self.status = 'failed'
        self.error_message = error_message
        self.error_details = error_details or {}
        self.completed_at = timezone.now()
        if self.started_at:
            delta = self.completed_at - self.started_at
            self.sync_duration_seconds = int(delta.total_seconds())
        self.save()


class HHFilterStatistics(models.Model):
    """
    Статистика фильтрации откликов из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: configuration, результаты фильтрации
    ИСТОЧНИКИ ДАННЫЕ: HH.ru API отклики
    ОБРАБОТКА: Агрегирование статистики фильтрации
    ВЫХОДЯЩИЕ ДАННЫЕ: Аналитика фильтрации в базе данных
    СВЯЗИ: HHSyncConfiguration
    ФОРМАТ: Django модель
    """
    
    configuration = models.OneToOneField(
        HHSyncConfiguration,
        on_delete=models.CASCADE,
        related_name='filter_statistics'
    )
    
    # Счетчики по причинам отклонения
    location_mismatch_count = models.IntegerField(default=0)
    gender_mismatch_count = models.IntegerField(default=0)
    age_mismatch_count = models.IntegerField(default=0)
    experience_mismatch_count = models.IntegerField(default=0)
    already_in_db_count = models.IntegerField(default=0)
    other_count = models.IntegerField(default=0)
    
    # Процентное распределение
    location_mismatch_percent = models.FloatField(default=0)
    gender_mismatch_percent = models.FloatField(default=0)
    age_mismatch_percent = models.FloatField(default=0)
    experience_mismatch_percent = models.FloatField(default=0)
    already_in_db_percent = models.FloatField(default=0)
    other_percent = models.FloatField(default=0)
    
    # Общая статистика
    total_responses = models.IntegerField(default=0)
    accepted_count = models.IntegerField(default=0)
    rejection_rate = models.FloatField(default=0.0)
    
    # Временные метки
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hh_filter_statistics'
    
    def __str__(self):
        return f"Статистика фильтрации для {self.configuration}"
    
    def update_from_filter_results(self, filter_results):
        """Обновляет статистику на основе результатов фильтрации"""
        
        rejected = filter_results.get('rejected', {})
        
        self.location_mismatch_count = len(rejected.get('location_mismatch', []))
        self.gender_mismatch_count = len(rejected.get('gender_mismatch', []))
        self.age_mismatch_count = len(rejected.get('age_mismatch', []))
        self.experience_mismatch_count = len(rejected.get('experience_mismatch', []))
        self.already_in_db_count = len(rejected.get('already_in_db', []))
        self.other_count = len(rejected.get('other', []))
        
        self.accepted_count = filter_results.get('passed_filter', 0)
        self.total_responses = filter_results.get('total_responses', 0)
        
        if self.total_responses > 0:
            self.location_mismatch_percent = (self.location_mismatch_count / self.total_responses) * 100
            self.gender_mismatch_percent = (self.gender_mismatch_count / self.total_responses) * 100
            self.age_mismatch_percent = (self.age_mismatch_count / self.total_responses) * 100
            self.experience_mismatch_percent = (self.experience_mismatch_count / self.total_responses) * 100
            self.already_in_db_percent = (self.already_in_db_count / self.total_responses) * 100
            self.other_percent = (self.other_count / self.total_responses) * 100
            
            self.rejection_rate = (1 - (self.accepted_count / self.total_responses)) * 100
        
        self.save()


# Миграция для добавления моделей
"""
Команда для создания миграции:
python manage.py makemigrations huntflow --name add_hh_models

Команда для применения миграции:
python manage.py migrate huntflow
"""
```

---

## Индексы базы данных

```sql
-- Индексы для оптимизации поиска
CREATE INDEX idx_hh_responses_status ON hh_responses(import_status);
CREATE INDEX idx_hh_responses_vacancy ON hh_responses(account_id, vacancy_id);
CREATE INDEX idx_hh_responses_hh_id ON hh_responses(hh_vacancy_id);
CREATE INDEX idx_hh_responses_email ON hh_responses(email);
CREATE INDEX idx_hh_responses_hh_response_id ON hh_responses(hh_response_id);
CREATE INDEX idx_hh_responses_created ON hh_responses(hh_created_at DESC);

CREATE INDEX idx_hh_sync_config_user ON hh_sync_configurations(user_id, enabled);
CREATE INDEX idx_hh_sync_config_frequency ON hh_sync_configurations(sync_frequency);

CREATE INDEX idx_hh_sync_logs_config ON hh_sync_logs(configuration_id, started_at DESC);
CREATE INDEX idx_hh_sync_logs_status ON hh_sync_logs(status);
```

---

## Использование моделей

### Пример 1: Сохранение отклика из HH.ru

```python
from apps.huntflow.models import HHResponse
from datetime import datetime

# Данные из HH.ru API
hh_data = {
    'id': 'response_123',
    'resume': {
        'id': 'resume_456',
        'first_name': 'Иван',
        'last_name': 'Иванов',
        'middle_name': 'Иванович',
        'birth_date': '1990-05-15',
        'gender': {'id': 'male'},
        'area': {'id': '1', 'name': 'Москва'},
        'contacts': [
            {'type': {'id': 'email'}, 'value': 'ivan@example.com'},
            {'type': {'id': 'phone'}, 'value': '+79261234567'}
        ],
        'experience': [...],
        'skills': [...],
        'url': 'https://hh.ru/resume/456'
    },
    'created_at': '2024-12-01T10:00:00+0300',
    'updated_at': '2024-12-01T10:00:00+0300',
    'state': 'applied'
}

# Создаем отклик в БД
response = HHResponse.objects.create(
    hh_response_id=hh_data['id'],
    hh_vacancy_id='87654321',
    first_name=hh_data['resume']['first_name'],
    last_name=hh_data['resume']['last_name'],
    email=hh_data['resume']['contacts'][0]['value'],
    phone=hh_data['resume']['contacts'][1]['value'],
    birth_date=hh_data['resume']['birth_date'],
    gender=hh_data['resume']['gender']['id'],
    location=hh_data['resume']['area']['name'],
    location_id=hh_data['resume']['area']['id'],
    experience_json=hh_data['resume'].get('experience', []),
    skills_json=hh_data['resume'].get('skills', []),
    hh_resume_url=hh_data['resume']['url'],
    response_state=hh_data['state'],
    import_status='pending',
    raw_data=hh_data,
    hh_created_at=datetime.fromisoformat(hh_data['created_at']),
    hh_updated_at=datetime.fromisoformat(hh_data['updated_at']),
    imported_by=request.user
)

# Рассчитываем возраст
age = response.calculate_age()
experience_years = response.calculate_experience_years()
```

### Пример 2: Создание конфигурации синхронизации

```python
from apps.huntflow.models import HHSyncConfiguration

config = HHSyncConfiguration.objects.create(
    user=request.user,
    account_id=123,
    vacancy_id=456,
    hh_vacancy_id='87654321',
    filters={
        'allowed_locations': ['1', '2'],
        'allowed_genders': ['any'],
        'min_age': 25,
        'max_age': 50,
        'check_existing': True,
        'min_experience_years': 2,
        'max_experience_years': 30
    },
    sync_frequency='daily',
    enabled=True,
    auto_add_to_project=True,
    project_id=789
)

# Получить фильтры
filters = config.get_filters()

# Обновить фильтры
config.set_filters({...})

# Спланировать следующую синхронизацию
config.schedule_next_sync()
```

### Пример 3: Логирование синхронизации

```python
from apps.huntflow.models import HHSyncLog, HHFilterStatistics
from datetime import datetime, timedelta

# Создаем логирование
log = HHSyncLog.objects.create(
    configuration=config,
    status='in_progress',
    total_responses=50
)

# ... процесс импорта ...

# Завершаем логирование
log.imported_count = 45
log.filtered_count = 5
log.error_count = 0
log.filter_summary = {
    'location_mismatch': 2,
    'age_mismatch': 1,
    'experience_mismatch': 2
}
log.status = 'completed'
log.mark_completed()

# Обновляем статистику конфигурации
config.update_statistics({
    'total_responses': 50,
    'imported': 45,
    'filtered_out': 5,
    'errors': 0
})

# Обновляем статистику фильтрации
filter_stats, created = HHFilterStatistics.objects.get_or_create(
    configuration=config
)
filter_stats.update_from_filter_results({
    'total_responses': 50,
    'passed_filter': 45,
    'rejected': {
        'location_mismatch': [...],
        'age_mismatch': [...],
        'experience_mismatch': [...]
    }
})
```

---

## Запросы к базе данных

```python
from apps.huntflow.models import HHResponse, HHSyncConfiguration, HHSyncLog
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta

# Получить все импортированные отклики для вакансии
imported_responses = HHResponse.objects.filter(
    vacancy_id=456,
    import_status='imported'
)

# Получить отклики, которые прошли фильтр и почти прошли (score > 80)
good_candidates = HHResponse.objects.filter(
    vacancy_id=456,
    filter_score__gte=80
)

# Получить статистику по причинам отклонения
rejection_stats = HHResponse.objects.filter(
    account_id=123,
    import_status='filtered'
).values('filter_reasons').annotate(count=Count('id'))

# Получить среднее количество импортированных кандидатов за день
from datetime import timedelta
last_week = datetime.now() - timedelta(days=7)

weekly_stats = HHSyncLog.objects.filter(
    completed_at__gte=last_week,
    status='completed'
).aggregate(
    avg_imported=Avg('imported_count'),
    avg_filtered=Avg('filtered_count'),
    total_syncs=Count('id')
)

# Получить конфигурации, которые не синхронизировались более суток
overdue_configs = HHSyncConfiguration.objects.filter(
    enabled=True,
    last_sync__lt=datetime.now() - timedelta(days=1)
)

# Получить рейтинг кандидатов по совпадению с фильтрами
top_candidates = HHResponse.objects.filter(
    vacancy_id=456,
    import_status='imported'
).order_by('-filter_score')[:10]

# Получить кандидатов с определенным опытом
experienced = HHResponse.objects.filter(
    vacancy_id=456
).extra(
    select={'experience': 'JSON_EXTRACT(experience_json, "$.total_years")'}
).filter(experience__gte=5)
```

---

## Заключение

Данные модели обеспечивают:

1. **Полное отслеживание** откликов из HH.ru
2. **Гибкую фильтрацию** с сохранением конфигураций
3. **Аудит синхронизаций** с логированием всех операций
4. **Аналитику** по причинам отклонения кандидатов
5. **Автоматизацию** синхронизации по расписанию

Все модели оптимизированы для быстрого поиска и аналитики.
