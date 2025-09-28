# Отчет о связях приложения Finance с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Finance` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.vacancies (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модели `SalaryRange` и `Benchmark`.
- **Детали**: 
  - Модель `SalaryRange` имеет `ForeignKey` к модели `Vacancy` из приложения `apps.vacancies`
  - Модель `Benchmark` имеет `ForeignKey` к модели `Vacancy`
  - Модель `Vacancy` имеет `ManyToManyField` к модели `Grade` через поле `available_grades`
- **Файлы, где обнаружена связь**:
    - `apps/finance/models.py`:
        ```python
        class SalaryRange(models.Model):
            vacancy = models.ForeignKey(
                'vacancies.Vacancy',
                on_delete=models.CASCADE,
                related_name='salary_ranges',
                verbose_name='Вакансия'
            )
            grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.CASCADE,
                related_name='salary_ranges',
                verbose_name='Грейд'
            )
        
        class Benchmark(models.Model):
            vacancy = models.ForeignKey(
                'vacancies.Vacancy',
                on_delete=models.CASCADE,
                related_name='benchmarks',
                verbose_name='Вакансия'
            )
        ```
    - `apps/vacancies/models.py`:
        ```python
        class Vacancy(models.Model):
            available_grades = models.ManyToManyField(
                Grade,
                related_name='available_vacancies',
                verbose_name='Доступные грейды',
                blank=True
            )
        ```
    - `apps/finance/logic/salary_service.py`: Использует модель `Vacancy`
    - `apps/finance/tasks.py`: Работа с вакансиями для обновления зарплатных вилок
- **Влияние**: Без приложения `apps.vacancies` функциональность зарплатных вилок и бенчмарков полностью неработоспособна.

### 2. **apps.interviewers (ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модель `InterviewRule`.
- **Детали**: Модель `InterviewRule` в приложении `apps.interviewers` имеет `ForeignKey` к модели `Grade` из приложения `apps.finance`.
- **Файлы, где обнаружена связь**:
    - `apps/interviewers/models.py`:
        ```python
        class InterviewRule(models.Model):
            grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.CASCADE,
                related_name='interview_rules',
                verbose_name='Грейд'
            )
        ```
    - `apps/interviewers/logic/interview_rule_handlers.py`: Использует модель `Grade`
- **Влияние**: Система правил интервью зависит от наличия грейдов в финансовом приложении.

### 3. **apps.google_oauth (ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модели `GoogleOAuthAccount` и `GoogleCalendarEvent`.
- **Детали**: Модели в `apps.google_oauth` ссылаются на `Grade` и `CurrencyRate` для интеграции с Google Calendar и создания событий с финансовой информацией.
- **Файлы, где обнаружена связь**:
    - `apps/google_oauth/models.py`:
        ```python
        class GoogleCalendarEvent(models.Model):
            grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Грейд'
            )
            currency_rate = models.ForeignKey(
                'finance.CurrencyRate',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Курс валюты'
            )
        ```
    - `apps/google_oauth/services.py`: Использует `Grade` и `CurrencyRate` для создания событий
- **Влияние**: Google Calendar интеграция использует финансовые данные для создания событий с информацией о зарплатах.

### 4. **apps.huntflow (ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модели `HuntflowVacancy` и `HuntflowApplicant`.
- **Детали**: Модели в `apps.huntflow` ссылаются на `Grade` и `CurrencyRate` для синхронизации данных с системой Huntflow.
- **Файлы, где обнаружена связь**:
    - `apps/huntflow/models.py`:
        ```python
        class HuntflowVacancy(models.Model):
            grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Грейд'
            )
        
        class HuntflowApplicant(models.Model):
            expected_grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Ожидаемый грейд'
            )
            currency_rate = models.ForeignKey(
                'finance.CurrencyRate',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Курс валюты'
            )
        ```
    - `apps/huntflow/services.py`: Использует `Grade` и `CurrencyRate` для синхронизации
- **Влияние**: Интеграция с Huntflow использует финансовые данные для синхронизации вакансий и кандидатов.

### 5. **apps.accounts (КОСВЕННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через систему ролей и прав доступа.
- **Детали**: Пользователи из `apps.accounts` могут иметь различные роли для доступа к финансовой информации (например, HR, бухгалтер, администратор).
- **Файлы, где обнаружена связь**:
    - `apps/finance/views.py`: Проверка прав доступа пользователей
    - `apps/finance/logic/response_handlers.py`: Обработка прав доступа
    - `apps/accounts/models.py`: Модель `User` с системой ролей
- **Влияние**: Доступ к финансовой информации контролируется через систему ролей пользователей.

### 6. **apps.gemini (КОСВЕННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через API интеграцию.
- **Детали**: Приложение `apps.gemini` может использовать финансовые данные для AI анализа и генерации контента, связанного с зарплатами и грейдами.
- **Файлы, где обнаружена связь**:
    - `apps/gemini/services.py`: Потенциальное использование финансовых данных
    - `apps/gemini/logic/gemini_service.py`: AI анализ финансовых данных
- **Влияние**: AI функциональность может использовать финансовые данные для анализа и рекомендаций.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                    Finance Application                     │
├─────────────────────────────────────────────────────────────┤
│  Core Models                                               │
│  ├── Grade (Центральная модель)                            │
│  │   ├── → apps.vacancies.Vacancy.available_grades         │
│  │   ├── → apps.interviewers.InterviewRule.grade           │
│  │   ├── → apps.google_oauth.GoogleCalendarEvent.grade     │
│  │   └── → apps.huntflow.HuntflowVacancy.grade             │
│  ├── CurrencyRate (Курсы валют)                            │
│  │   ├── → apps.google_oauth.GoogleCalendarEvent           │
│  │   └── → apps.huntflow.HuntflowApplicant                 │
│  ├── SalaryRange (Зарплатные вилки)                        │
│  │   └── → apps.vacancies.Vacancy (ForeignKey)             │
│  └── Benchmark (Бенчмарки)                                 │
│      └── → apps.vacancies.Vacancy (ForeignKey)             │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── TaxService (Налоговые расчеты)                        │
│  ├── CurrencyService (Валютные операции)                   │
│  ├── SalaryService (Зарплатные расчеты)                    │
│  └── ResponseHandler (Обработка ответов)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (Foreign Key / ManyToMany)**
- `SalaryRange.vacancy` ← ForeignKey → `Vacancy`
- `Benchmark.vacancy` ← ForeignKey → `Vacancy`
- `Vacancy.available_grades` ← ManyToMany → `Grade`
- `InterviewRule.grade` ← ForeignKey → `Grade`
- `GoogleCalendarEvent.grade` ← ForeignKey → `Grade`
- `HuntflowVacancy.grade` ← ForeignKey → `Grade`

### 2. **Косвенные связи (API интеграции)**
- `CurrencyRate` → Google Calendar события
- `Grade` → Huntflow синхронизация
- `SalaryRange` → AI анализ (Gemini)

### 3. **Системные связи (Права доступа)**
- Django Groups → Финансовый доступ
- User roles → Финансовые операции

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.vacancies**: Критически важно для `SalaryRange` и `Benchmark`
- **apps.interviewers**: Важно для системы правил интервью

### 2. **Опциональные зависимости**
- **apps.google_oauth**: Опциональная интеграция с Google Calendar
- **apps.huntflow**: Опциональная интеграция с Huntflow
- **apps.gemini**: Опциональная AI интеграция

### 3. **Системные зависимости**
- **apps.accounts**: Система ролей и прав доступа

## 🔧 **Рекомендации по управлению связями**

### 1. **Миграции и изменения**
- При изменении модели `Grade` проверить все связанные приложения
- Обновить миграции во всех зависимых приложениях
- Протестировать все интеграции после изменений

### 2. **Модель Grade как центральная**
- `Grade` является центральной моделью для всей системы
- Изменения в `Grade` влияют на множество приложений
- Рекомендуется версионирование изменений в `Grade`

### 3. **Валютные курсы**
- `CurrencyRate` используется для конвертации валют
- Автоматическое обновление курсов критически важно
- Необходим мониторинг доступности внешних API

### 4. **Зарплатные вилки**
- `SalaryRange` напрямую связана с `Vacancy`
- При удалении вакансии удаляются все связанные зарплатные вилки
- Необходима каскадная обработка удалений

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_grade_vacancy_relationship(self):
    """Тест связи грейда с вакансиями"""
    grade = Grade.objects.create(name='Senior')
    vacancy = Vacancy.objects.create(
        name='Test Vacancy',
        external_id='TEST001',
        recruiter=self.user,
        invite_title='Test Invite',
        invite_text='Test Text',
        scorecard_title='Test Scorecard'
    )
    
    vacancy.available_grades.add(grade)
    
    self.assertIn(grade, vacancy.available_grades.all())
    self.assertIn(vacancy, grade.available_vacancies.all())

def test_salary_range_vacancy_relationship(self):
    """Тест связи зарплатной вилки с вакансией"""
    vacancy = Vacancy.objects.create(
        name='Test Vacancy',
        external_id='TEST001',
        recruiter=self.user,
        invite_title='Test Invite',
        invite_text='Test Text',
        scorecard_title='Test Scorecard'
    )
    grade = Grade.objects.create(name='Senior')
    
    salary_range = SalaryRange.objects.create(
        vacancy=vacancy,
        grade=grade,
        salary_min_usd=1000,
        salary_max_usd=2000
    )
    
    self.assertEqual(salary_range.vacancy, vacancy)
    self.assertIn(salary_range, vacancy.salary_ranges.all())
```

### 2. **Integration тесты**
```python
def test_full_financial_workflow(self):
    """Тест полного финансового рабочего процесса"""
    # Создание грейда
    grade = Grade.objects.create(name='Senior')
    
    # Создание вакансии
    vacancy = Vacancy.objects.create(
        name='Test Vacancy',
        external_id='TEST001',
        recruiter=self.user,
        invite_title='Test Invite',
        invite_text='Test Text',
        scorecard_title='Test Scorecard'
    )
    
    # Привязка грейда к вакансии
    vacancy.available_grades.add(grade)
    
    # Создание зарплатной вилки
    salary_range = SalaryRange.objects.create(
        vacancy=vacancy,
        grade=grade,
        salary_min_usd=1000,
        salary_max_usd=2000
    )
    
    # Проверка связей
    self.assertIn(grade, vacancy.available_grades.all())
    self.assertEqual(salary_range.vacancy, vacancy)
    self.assertEqual(salary_range.grade, grade)
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики связей**
- Количество грейдов, используемых в вакансиях
- Количество зарплатных вилок на вакансию
- Активность валютных курсов
- Использование финансовых данных в интеграциях

### 2. **Алерты**
- Ошибки в обновлении валютных курсов
- Проблемы с синхронизацией данных
- Нарушения целостности связей
- Сбои в финансовых расчетах

## 🔄 **Сервисный слой и изоляция**

### 1. **Изоляция сервисов**
- Все бизнес-логика вынесена в `logic/` папку
- Сервисы не импортируются другими приложениями
- Только модели доступны для внешнего использования

### 2. **Сервисы Finance**
- `TaxService` - налоговая логика
- `CurrencyService` - валютные операции
- `SalaryService` - зарплатные расчеты
- `ResponseHandler` - обработка ответов

### 3. **Зависимости сервисов**
```python
SalaryService
    ├── TaxService (для PLN расчетов)
    ├── CurrencyService (для конвертации валют)
    ├── Vacancy (внешняя зависимость)
    └── Grade (внутренняя модель)

TaxService
    ├── PLNTax (внутренняя модель)
    └── CurrencyService (для конвертации)

CurrencyService
    ├── CurrencyRate (внутренняя модель)
    └── Внешние API (НБРБ)
```

## 📝 **Выводы**

Приложение `Finance` является критически важным компонентом системы HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Критические связи**: Vacancies (SalaryRange, Benchmark)
2. **Важные связи**: Interviewers (InterviewRule)
3. **Интеграционные связи**: Google OAuth, Huntflow
4. **Системные связи**: Accounts (роли и права)

### **Критические моменты:**
- Модель `Grade` является центральной для всей системы
- `SalaryRange` и `Benchmark` полностью зависят от `Vacancy`
- Валютные курсы критически важны для расчетов
- Сервисный слой изолирован от других приложений

### **Рекомендации:**
- Регулярно тестировать все финансовые связи
- Мониторить обновление валютных курсов
- Документировать все изменения в финансовых моделях
- Создать систему резервного копирования финансовых данных

Все связи архитектурно обоснованы и обеспечивают необходимую функциональность системы HR Helper. Приложение `Finance` служит центральным узлом для финансовых данных, используемых во всей системе.
