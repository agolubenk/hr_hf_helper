# Отчет о связях приложения Vacancies с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Vacancies` с другими приложениями в рамках проекта. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.finance**
- **Тип связи**: Прямая зависимость через модели и сервисы.
- **Детали**: 
  - Модель `Vacancy` имеет `ManyToManyField` к модели `Grade` из `apps.finance`
  - Модель `SalaryRange` в `apps.vacancies` дублирует функциональность `SalaryRange` в `apps.finance`
  - Используется `SalaryService` для расчета валютных курсов
- **Файлы, где обнаружена связь**:
  - `apps/vacancies/models.py`:
    ```python
    class Vacancy(models.Model):
        # ...
        available_grades = models.ManyToManyField(
            Grade,
            related_name='available_vacancies',
            verbose_name='Доступные грейды',
            help_text='Грейды, доступные для данной вакансии',
            blank=True
        )
    ```
  - `apps/vacancies/models.py`:
    ```python
    class SalaryRange(models.Model):
        grade = models.ForeignKey(
            Grade,
            on_delete=models.CASCADE,
            related_name='salary_ranges',
            verbose_name='Грейд',
            help_text='Грейд для которого устанавливается зарплатная вилка'
        )
    ```
  - `apps/finance/models.py`: Дублированная модель `SalaryRange`
- **Влияние**: Изменения в модели `Grade` или `SalaryRange` в `apps.finance` могут повлиять на `apps.vacancies`. Существует дублирование моделей, что может привести к конфликтам.

### 2. **apps.interviewers**
- **Тип связи**: Прямая зависимость через `ManyToManyField`.
- **Детали**: Модель `Vacancy` имеет `ManyToManyField` к модели `Interviewer`. Это позволяет привязывать нескольких интервьюеров к одной вакансии.
- **Файлы, где обнаружена связь**:
  - `apps/vacancies/models.py`:
    ```python
    class Vacancy(models.Model):
        # ...
        interviewers = models.ManyToManyField(
            'interviewers.Interviewer',
            related_name='vacancies',
            verbose_name='Интервьюеры',
            help_text='Интервьюеры, привязанные к вакансии',
            blank=True
        )
    ```
- **Влияние**: Удаление или значительные изменения в модели `Interviewer` повлияют на приложение `Vacancies`.

### 3. **apps.accounts**
- **Тип связи**: Прямая зависимость через `ForeignKey`.
- **Детали**: Модель `Vacancy` имеет `ForeignKey` к модели `User` (обычно `apps.accounts.models.User`) с ограничением на группу 'Рекрутер'.
- **Файлы, где обнаружена связь**:
  - `apps/vacancies/models.py`:
    ```python
    class Vacancy(models.Model):
        recruiter = models.ForeignKey(
            User,
            on_delete=models.CASCADE,
            related_name='vacancies',
            verbose_name='Ответственный рекрутер',
            help_text='Рекрутер, ответственный за вакансию',
            limit_choices_to={'groups__name': 'Рекрутер'}
        )
    ```
- **Влияние**: Функциональность приложения `Vacancies` зависит от системы пользователей и групп Django.

### 4. **apps.google_oauth**
- **Тип связи**: Интеграционная зависимость через импорты.
- **Детали**: Приложение `GoogleOAuth` использует модели `Vacancy` и `SalaryRange` из `apps.vacancies` для создания инвайтов и работы с HR данными.
- **Файлы, где обнаружена связь**:
  - `apps/google_oauth/models.py`: Множественные импорты
    ```python
    from apps.vacancies.models import Vacancy
    from apps.vacancies.models import SalaryRange, Vacancy
    ```
  - Используется в моделях: `Invite`, `HRScreening`, и других
- **Влияние**: Изменения в моделях `Vacancy` или `SalaryRange` повлияют на функциональность `GoogleOAuth`.

### 5. **apps.finance (tasks)**
- **Тип связи**: Интеграционная зависимость через Celery задачи.
- **Детали**: Задачи в `apps.finance.tasks` используют модели `Vacancy` для анализа данных с HeadHunter.
- **Файлы, где обнаружена связь**:
  - `apps/finance/tasks.py`:
    ```python
    from apps.vacancies.models import Vacancy
    ```
  - Используется в задачах: `analyze_hh_vacancies`, `analyze_hh_vacancies_batch`
- **Влияние**: Изменения в модели `Vacancy` могут повлиять на выполнение задач анализа данных.

### 6. **config (URLs)**
- **Тип связи**: Конфигурационная зависимость.
- **Детали**: URL-маршруты для `Vacancies` API интегрированы в основной файл `config/api_urls.py`.
- **Файлы, где обнаружена связь**:
  - `config/api_urls.py`:
    ```python
    from apps.vacancies.views_api import VacancyViewSet
    # ...
    router.register(r'vacancies', VacancyViewSet)
    ```
- **Влияние**: Изменения в структуре API или удаление регистрации приведут к недоступности API.

## ⚠️ **Критические проблемы**

### 1. **Дублирование модели SalaryRange**
- **Проблема**: Модель `SalaryRange` существует как в `apps.finance.models`, так и в `apps.vacancies.models`
- **Риск**: Конфликты при миграциях, дублирование логики, неконсистентность данных
- **Рекомендация**: Объединить модели или четко разделить ответственность

### 2. **Циклические зависимости**
- **Проблема**: `apps.finance` импортирует `apps.vacancies`, а `apps.vacancies` импортирует `apps.finance`
- **Риск**: Потенциальные проблемы при запуске приложения
- **Рекомендация**: Пересмотреть архитектуру и убрать циклические зависимости

### 3. **Слабая связанность с Google OAuth**
- **Проблема**: Множественные импорты в `apps.google_oauth` создают сильную связанность
- **Риск**: Изменения в `Vacancies` могут сломать `Google OAuth`
- **Рекомендация**: Использовать сигналы Django или события для ослабления связанности

## 📊 **Статистика связей**

- **Прямые зависимости**: 5 приложений
- **Косвенные зависимости**: 3 приложения (через импорты)
- **Критические связи**: 3
- **Потенциальные проблемы**: 3

## 🔧 **Рекомендации по улучшению**

### 1. **Устранить дублирование SalaryRange**
```python
# Вариант 1: Объединить в apps.finance
# Удалить SalaryRange из apps.vacancies
# Обновить все импорты

# Вариант 2: Четко разделить ответственность
# apps.vacancies.SalaryRange - для локальных данных
# apps.finance.SalaryRange - для финансовых расчетов
```

### 2. **Убрать циклические зависимости**
```python
# Использовать сигналы Django вместо прямых импортов
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Vacancy)
def update_finance_data(sender, instance, created, **kwargs):
    # Логика обновления финансовых данных
    pass
```

### 3. **Создать API для межприложенческого взаимодействия**
```python
# apps/vacancies/services.py
class VacancyService:
    @staticmethod
    def get_vacancy_for_google_oauth(vacancy_id):
        """Безопасный способ получения данных вакансии"""
        pass
    
    @staticmethod
    def notify_vacancy_updated(vacancy):
        """Уведомление других приложений об изменении"""
        pass
```

### 4. **Добавить интерфейсы для взаимодействия**
```python
# apps/vacancies/interfaces.py
class VacancyInterface:
    """Интерфейс для взаимодействия с вакансиями"""
    
    @staticmethod
    def get_active_vacancies():
        """Получение активных вакансий"""
        pass
    
    @staticmethod
    def get_vacancy_by_external_id(external_id):
        """Получение вакансии по внешнему ID"""
        pass
```

## 📝 **Выводы**

Приложение `Vacancies` имеет множество связей с другими приложениями, что создает сложную архитектуру с потенциальными проблемами. Основные риски:

1. **Дублирование моделей** может привести к конфликтам
2. **Циклические зависимости** могут вызвать проблемы при запуске
3. **Сильная связанность** усложняет тестирование и поддержку

Рекомендуется провести рефакторинг для устранения выявленных проблем и улучшения архитектуры системы.

## 🔄 **План действий**

1. **Немедленно**: Устранить дублирование модели `SalaryRange`
2. **Краткосрочно**: Убрать циклические зависимости
3. **Среднесрочно**: Создать API для межприложенческого взаимодействия
4. **Долгосрочно**: Пересмотреть общую архитектуру системы
