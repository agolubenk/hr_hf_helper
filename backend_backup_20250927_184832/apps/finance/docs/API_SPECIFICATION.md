# API Спецификация приложения Finance

## 🎯 Обзор

Данный документ содержит полную спецификацию API приложения `finance`, включая REST API endpoints, JSON API, веб-интерфейс и взаимодействие с другими приложениями.

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
2. [JSON API Endpoints](#json-api-endpoints)
3. [Веб-интерфейс](#веб-интерфейс)
4. [Модели данных](#модели-данных)
5. [Сериализаторы](#сериализаторы)
6. [Обработка ошибок](#обработка-ошибок)
7. [Примеры использования](#примеры-использования)

---

## 🔌 REST API Endpoints

### Базовый URL
```
http://localhost:8000/api/v1/finance/
```

### GradeViewSet (`/api/v1/finance/grades/`)

#### Базовые операции CRUD

##### 1. Список грейдов
```http
GET /api/v1/finance/grades/
Authorization: SessionAuthentication
```

**Параметры запроса:**
- `search` - поиск по названию грейда
- `ordering` - сортировка по name
- `page` - номер страницы (пагинация)

**Ответ:**
```json
{
    "count": 4,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Junior"
        },
        {
            "id": 2,
            "name": "Middle"
        },
        {
            "id": 3,
            "name": "Senior"
        },
        {
            "id": 4,
            "name": "Lead"
        }
    ]
}
```

##### 2. Создание грейда
```http
POST /api/v1/finance/grades/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "name": "Principal"
}
```

**Ответ:**
```json
{
    "id": 5,
    "name": "Principal"
}
```

##### 3. Получение грейда
```http
GET /api/v1/finance/grades/{id}/
Authorization: SessionAuthentication
```

##### 4. Обновление грейда
```http
PUT /api/v1/finance/grades/{id}/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "name": "Senior+"
}
```

##### 5. Удаление грейда
```http
DELETE /api/v1/finance/grades/{id}/
Authorization: SessionAuthentication
```

#### Кастомные действия

##### 1. Статистика по грейдам
```http
GET /api/v1/finance/grades/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_grades": 4,
    "grades_stats": [
        {
            "id": 1,
            "name": "Junior",
            "vacancies_count": 15,
            "salary_ranges_count": 12,
            "benchmarks_count": 8
        },
        {
            "id": 2,
            "name": "Middle",
            "vacancies_count": 25,
            "salary_ranges_count": 20,
            "benchmarks_count": 15
        }
    ]
}
```

### CurrencyRateViewSet (`/api/v1/finance/currency-rates/`)

#### Базовые операции CRUD

##### 1. Список курсов валют
```http
GET /api/v1/finance/currency-rates/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "code": "USD",
            "rate": "3.250000",
            "scale": 1,
            "fetched_at": "2024-01-20T15:30:00Z"
        },
        {
            "id": 2,
            "code": "PLN",
            "rate": "0.278500",
            "scale": 1,
            "fetched_at": "2024-01-20T15:30:00Z"
        },
        {
            "id": 3,
            "code": "BYN",
            "rate": "1.000000",
            "scale": 1,
            "fetched_at": "2024-01-20T15:30:00Z"
        }
    ]
}
```

##### 2. Создание курса валюты
```http
POST /api/v1/finance/currency-rates/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "code": "EUR",
    "rate": "3.500000",
    "scale": 1
}
```

#### Кастомные действия

##### 1. Обновление курсов валют
```http
POST /api/v1/finance/currency-rates/update/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "success": true,
    "message": "Курсы валют успешно обновлены",
    "updated_rates": [
        {
            "code": "USD",
            "rate": "3.251000",
            "fetched_at": "2024-01-20T16:00:00Z"
        },
        {
            "code": "PLN",
            "rate": "0.278800",
            "fetched_at": "2024-01-20T16:00:00Z"
        }
    ]
}
```

##### 2. Конвертация валют
```http
POST /api/v1/finance/currency-rates/convert/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "amount": "1000.00",
    "from_currency": "USD",
    "to_currency": "BYN"
}
```

**Ответ:**
```json
{
    "success": true,
    "original_amount": "1000.00",
    "converted_amount": "3251.00",
    "from_currency": "USD",
    "to_currency": "BYN",
    "rate": "3.251000",
    "conversion_date": "2024-01-20T16:00:00Z"
}
```

### PLNTaxViewSet (`/api/v1/finance/pln-taxes/`)

#### Базовые операции CRUD

##### 1. Список налогов PLN
```http
GET /api/v1/finance/pln-taxes/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Подоходный налог",
            "rate": "17.00",
            "is_active": true
        },
        {
            "id": 2,
            "name": "Социальное страхование",
            "rate": "13.71",
            "is_active": true
        },
        {
            "id": 3,
            "name": "Медицинское страхование",
            "rate": "9.00",
            "is_active": true
        }
    ]
}
```

##### 2. Создание налога PLN
```http
POST /api/v1/finance/pln-taxes/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "name": "Дополнительный налог",
    "rate": "5.00",
    "is_active": true
}
```

#### Кастомные действия

##### 1. Расчет налогов PLN
```http
POST /api/v1/finance/pln-taxes/calculate/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "gross_amount": "10000.00",
    "currency": "PLN"
}
```

**Ответ:**
```json
{
    "success": true,
    "gross_amount": "10000.00",
    "net_amount": "6030.00",
    "total_tax_amount": "3970.00",
    "total_tax_rate": "39.70",
    "tax_breakdown": [
        {
            "name": "Подоходный налог",
            "rate": "17.00",
            "amount": "1700.00"
        },
        {
            "name": "Социальное страхование",
            "rate": "13.71",
            "amount": "1371.00"
        },
        {
            "name": "Медицинское страхование",
            "rate": "9.00",
            "amount": "900.00"
        }
    ]
}
```

##### 2. Сводка по налогам
```http
GET /api/v1/finance/pln-taxes/summary/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "active_taxes_count": 3,
    "inactive_taxes_count": 0,
    "total_tax_rate": "39.70",
    "taxes": [
        {
            "id": 1,
            "name": "Подоходный налог",
            "rate": "17.00",
            "is_active": true
        }
    ]
}
```

### SalaryRangeViewSet (`/api/v1/finance/salary-ranges/`)

#### Базовые операции CRUD

##### 1. Список зарплатных вилок
```http
GET /api/v1/finance/salary-ranges/
Authorization: SessionAuthentication
```

**Параметры запроса:**
- `vacancy` - фильтр по ID вакансии
- `grade` - фильтр по ID грейда
- `ordering` - сортировка по полям
- `page` - номер страницы

**Ответ:**
```json
{
    "count": 25,
    "next": "http://localhost:8000/api/v1/finance/salary-ranges/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "vacancy": {
                "id": 1,
                "title": "Python Developer",
                "company": "Tech Corp"
            },
            "grade": {
                "id": 2,
                "name": "Middle"
            },
            "salary_min_usd": "2000.00",
            "salary_max_usd": "3500.00",
            "salary_min_byn": "6500.00",
            "salary_max_byn": "11375.00",
            "salary_min_pln": "1200.00",
            "salary_max_pln": "2100.00",
            "is_active": true,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T15:45:00Z"
        }
    ]
}
```

##### 2. Создание зарплатной вилки
```http
POST /api/v1/finance/salary-ranges/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "vacancy": 1,
    "grade": 2,
    "salary_min_usd": "2500.00",
    "salary_max_usd": "4000.00",
    "is_active": true
}
```

##### 3. Получение зарплатной вилки
```http
GET /api/v1/finance/salary-ranges/{id}/
Authorization: SessionAuthentication
```

##### 4. Обновление зарплатной вилки
```http
PUT /api/v1/finance/salary-ranges/{id}/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "salary_min_usd": "3000.00",
    "salary_max_usd": "4500.00"
}
```

##### 5. Удаление зарплатной вилки
```http
DELETE /api/v1/finance/salary-ranges/{id}/
Authorization: SessionAuthentication
```

#### Кастомные действия

##### 1. Статистика по зарплатным вилкам
```http
GET /api/v1/finance/salary-ranges/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_ranges": 25,
    "active_ranges": 23,
    "inactive_ranges": 2,
    "average_salary_usd": "2750.00",
    "min_salary_usd": "1500.00",
    "max_salary_usd": "8000.00",
    "ranges_by_grade": [
        {
            "grade": "Junior",
            "count": 8,
            "avg_min": "1500.00",
            "avg_max": "2500.00"
        },
        {
            "grade": "Middle",
            "count": 12,
            "avg_min": "2500.00",
            "avg_max": "4000.00"
        }
    ]
}
```

##### 2. Обновление валютных сумм
```http
POST /api/v1/finance/salary-ranges/update-currency/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "success": true,
    "message": "Валютные суммы успешно обновлены",
    "updated_count": 25
}
```

### BenchmarkViewSet (`/api/v1/finance/benchmarks/`)

#### Базовые операции CRUD

##### 1. Список бенчмарков
```http
GET /api/v1/finance/benchmarks/
Authorization: SessionAuthentication
```

**Параметры запроса:**
- `type` - фильтр по типу (vacancy/candidate)
- `vacancy` - фильтр по ID вакансии
- `grade` - фильтр по ID грейда
- `domain` - фильтр по домену
- `work_format` - фильтр по формату работы
- `ordering` - сортировка
- `page` - номер страницы

**Ответ:**
```json
{
    "count": 150,
    "next": "http://localhost:8000/api/v1/finance/benchmarks/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "type": "vacancy",
            "vacancy": {
                "id": 1,
                "title": "Python Developer",
                "company": "Tech Corp"
            },
            "grade": {
                "id": 2,
                "name": "Middle"
            },
            "salary_from": "2500.00",
            "salary_to": "4000.00",
            "location": "Минск, Беларусь",
            "work_format": "remote",
            "domain": "fintech",
            "technologies": "Python, Django, PostgreSQL",
            "benefits": "Медицинская страховка, гибкий график",
            "compensation": "Бонусы за результат",
            "development": "Конференции, курсы",
            "notes": "Опыт работы с микросервисами",
            "date_added": "2024-01-15T10:30:00Z"
        }
    ]
}
```

##### 2. Создание бенчмарка
```http
POST /api/v1/finance/benchmarks/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "type": "vacancy",
    "vacancy": 1,
    "grade": 2,
    "salary_from": "3000.00",
    "salary_to": "5000.00",
    "location": "Варшава, Польша",
    "work_format": "hybrid",
    "domain": "gaming",
    "technologies": "Python, FastAPI, Redis",
    "benefits": "Спортзал, питание",
    "compensation": "Акции компании",
    "development": "Менторство, обучение",
    "notes": "Опыт с высоконагруженными системами"
}
```

##### 3. Получение бенчмарка
```http
GET /api/v1/finance/benchmarks/{id}/
Authorization: SessionAuthentication
```

##### 4. Обновление бенчмарка
```http
PUT /api/v1/finance/benchmarks/{id}/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "salary_from": "3500.00",
    "salary_to": "5500.00",
    "notes": "Обновленная информация о вакансии"
}
```

##### 5. Удаление бенчмарка
```http
DELETE /api/v1/finance/benchmarks/{id}/
Authorization: SessionAuthentication
```

#### Кастомные действия

##### 1. Статистика по бенчмаркам
```http
GET /api/v1/finance/benchmarks/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_benchmarks": 150,
    "vacancy_benchmarks": 120,
    "candidate_benchmarks": 30,
    "average_salary": "2750.00",
    "salary_by_grade": [
        {
            "grade": "Junior",
            "count": 45,
            "avg_salary": "1800.00"
        },
        {
            "grade": "Middle",
            "count": 75,
            "avg_salary": "2750.00"
        }
    ],
    "salary_by_domain": [
        {
            "domain": "fintech",
            "count": 35,
            "avg_salary": "3200.00"
        },
        {
            "domain": "gaming",
            "count": 25,
            "avg_salary": "2800.00"
        }
    ]
}
```

##### 2. Анализ рынка
```http
POST /api/v1/finance/benchmarks/market-analysis/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "grade": 2,
    "domain": "fintech",
    "work_format": "remote"
}
```

**Ответ:**
```json
{
    "success": true,
    "analysis": {
        "sample_size": 25,
        "average_salary": "3200.00",
        "median_salary": "3100.00",
        "min_salary": "2500.00",
        "max_salary": "4500.00",
        "salary_range": {
            "25th_percentile": "2800.00",
            "75th_percentile": "3600.00"
        },
        "popular_technologies": [
            "Python", "Django", "PostgreSQL", "Redis", "Docker"
        ],
        "common_benefits": [
            "Медицинская страховка", "Гибкий график", "Удаленная работа"
        ]
    }
}
```

### BenchmarkSettingsViewSet (`/api/v1/finance/benchmark-settings/`)

#### Базовые операции

##### 1. Получение настроек
```http
GET /api/v1/finance/benchmark-settings/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "id": 1,
    "average_calculation_period_days": 90,
    "belarus_tax_rate": "13.00",
    "ai_analysis_prompt": "Анализируй следующие данные о зарплатах...",
    "data_sources": ["hh.ru", "linkedin", "glassdoor"],
    "max_daily_tasks": 100,
    "vacancy_fields": ["title", "salary", "location", "requirements"],
    "hh_channel_active": true,
    "max_daily_hh_tasks": 100,
    "hh_ai_prompt": "Специальный промпт для анализа hh.ru..."
}
```

##### 2. Обновление настроек
```http
PUT /api/v1/finance/benchmark-settings/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "average_calculation_period_days": 120,
    "max_daily_tasks": 150,
    "hh_channel_active": false
}
```

---

## 🔗 JSON API Endpoints

### Базовый URL
```
http://localhost:8000/finance/api/
```

### Расчеты и конвертации

#### 1. Расчет налогов PLN
```http
POST /finance/api/calculate-pln-taxes/
Content-Type: application/json

{
    "net_amount": "6000.00",
    "currency": "PLN"
}
```

**Ответ:**
```json
{
    "success": true,
    "net_amount": "6000.00",
    "gross_amount": "9950.25",
    "total_tax_amount": "3950.25",
    "total_tax_rate": "39.70",
    "currency": "PLN",
    "tax_breakdown": [
        {
            "name": "Подоходный налог",
            "rate": "17.00",
            "amount": "1691.54"
        }
    ]
}
```

#### 2. Конвертация валют
```http
POST /finance/api/convert-currency/
Content-Type: application/json

{
    "amount": "1000.00",
    "from_currency": "USD",
    "to_currency": "PLN"
}
```

**Ответ:**
```json
{
    "success": true,
    "original_amount": "1000.00",
    "converted_amount": "3589.23",
    "from_currency": "USD",
    "to_currency": "PLN",
    "rate": "3.589230",
    "conversion_date": "2024-01-20T16:00:00Z"
}
```

#### 3. Расчет зарплаты с налогами
```http
POST /finance/api/calculate-salary/
Content-Type: application/json

{
    "net_amount": "2000.00",
    "currency_from": "USD",
    "currency_to": "PLN"
}
```

**Ответ:**
```json
{
    "success": true,
    "original": {
        "amount": "2000.00",
        "currency": "USD"
    },
    "converted": {
        "amount": "7178.46",
        "currency": "PLN"
    },
    "tax_calculation": {
        "gross_amount": "11890.12",
        "net_amount": "7178.46",
        "total_tax_amount": "4711.66",
        "total_tax_rate": "39.70"
    }
}
```

---

## 🌐 Веб-интерфейс

### Базовый URL
```
http://localhost:8000/finance/
```

### URL маршруты

#### 1. Главная панель
```http
GET /finance/
```
- **Описание:** Главная панель Finance приложения
- **Обработчик:** `dashboard`

#### 2. Курсы валют
```http
GET /finance/update-rates/
POST /finance/update-rates/
```
- **Описание:** Обновление курсов валют
- **Обработчик:** `update_currency_rates`

#### 3. Грейды
```http
GET /finance/grades/add/
POST /finance/grades/add/
GET /finance/grades/{grade_id}/delete/
POST /finance/grades/{grade_id}/delete/
```
- **Описание:** Управление грейдами
- **Обработчики:** `add_grade`, `delete_grade`

#### 4. Налоги PLN
```http
GET /finance/pln-taxes/
GET /finance/pln-taxes/add/
POST /finance/pln-taxes/add/
GET /finance/pln-taxes/{tax_id}/update/
POST /finance/pln-taxes/{tax_id}/update/
GET /finance/pln-taxes/{tax_id}/delete/
POST /finance/pln-taxes/{tax_id}/delete/
GET /finance/pln-taxes/calculate/
POST /finance/pln-taxes/calculate/
```
- **Описание:** Управление налогами PLN
- **Обработчики:** `pln_taxes_dashboard`, `add_pln_tax`, `update_pln_tax`, `delete_pln_tax`, `calculate_pln_taxes`

#### 5. Зарплатные вилки
```http
GET /finance/salary-ranges/
GET /finance/salary-ranges/create/
POST /finance/salary-ranges/create/
GET /finance/salary-ranges/{pk}/
GET /finance/salary-ranges/{pk}/update/
POST /finance/salary-ranges/{pk}/update/
GET /finance/salary-ranges/{pk}/delete/
POST /finance/salary-ranges/{pk}/delete/
POST /finance/salary-ranges/update-currency/
```
- **Описание:** Управление зарплатными вилками
- **Обработчики:** `salary_ranges_list`, `salary_range_create`, `salary_range_detail`, `salary_range_update`, `salary_range_delete`, `update_salary_currency_amounts`

#### 6. Бенчмарки
```http
GET /finance/benchmarks/
GET /finance/benchmarks/list/
GET /finance/benchmarks/create/
POST /finance/benchmarks/create/
GET /finance/benchmarks/{pk}/
GET /finance/benchmarks/{pk}/edit/
POST /finance/benchmarks/{pk}/update/
GET /finance/benchmarks/{pk}/delete/
POST /finance/benchmarks/{pk}/delete/
GET /finance/benchmarks/settings/
POST /finance/benchmarks/settings/
```
- **Описание:** Управление бенчмарками
- **Обработчики:** `benchmarks_dashboard`, `benchmarks_list`, `benchmark_create`, `benchmark_detail`, `benchmark_edit`, `benchmark_update`, `benchmark_delete`, `benchmark_settings`

#### 7. HH.ru Анализ
```http
GET /finance/hh-analysis/
POST /finance/hh-analysis/start/
POST /finance/hh-analysis/batch/
```
- **Описание:** Анализ вакансий с HH.ru
- **Обработчики:** `hh_analysis_dashboard`, `start_hh_analysis`, `start_batch_hh_analysis`

#### 8. AI Анализ
```http
GET /finance/ai-analysis/
POST /finance/ai-analysis/run/
POST /finance/ai-analysis/update-prompt/
```
- **Описание:** AI анализ данных
- **Обработчики:** `ai_analysis_dashboard`, `run_ai_analysis`, `update_ai_prompt`

#### 9. Статус задач
```http
GET /finance/task-status/{task_id}/
```
- **Описание:** Проверка статуса Celery задач
- **Обработчик:** `task_status`

---

## 📊 Модели данных

### Grade (Грейды)
```python
class Grade(models.Model):
    name = models.CharField(max_length=64, unique=True)
```

### CurrencyRate (Курсы валют)
```python
class CurrencyRate(models.Model):
    code = models.CharField(max_length=3, choices=Currency.choices, unique=True)
    rate = models.DecimalField(max_digits=12, decimal_places=6)
    scale = models.PositiveIntegerField(default=1)
    fetched_at = models.DateTimeField(default=timezone.now)
```

### PLNTax (Налоги PLN)
```python
class PLNTax(models.Model):
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
```

### SalaryRange (Зарплатные вилки)
```python
class SalaryRange(models.Model):
    vacancy = models.ForeignKey('vacancies.Vacancy', on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    salary_min_usd = models.DecimalField(max_digits=10, decimal_places=2)
    salary_max_usd = models.DecimalField(max_digits=10, decimal_places=2)
    salary_min_byn = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_max_byn = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_min_pln = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_max_pln = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Benchmark (Бенчмарки)
```python
class Benchmark(models.Model):
    type = models.CharField(max_length=20, choices=BenchmarkType.choices)
    vacancy = models.ForeignKey('vacancies.Vacancy', on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    salary_from = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salary_to = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=200)
    work_format = models.CharField(max_length=20, choices=WorkFormat.choices, blank=True, null=True)
    domain = models.CharField(max_length=20, choices=Domain.choices, blank=True, null=True)
    technologies = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    compensation = models.TextField(blank=True)
    development = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
```

### BenchmarkSettings (Настройки бенчмарков)
```python
class BenchmarkSettings(models.Model):
    average_calculation_period_days = models.PositiveIntegerField(default=90)
    belarus_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('13.00'))
    ai_analysis_prompt = models.TextField(default="...")
    data_sources = models.JSONField(default=list)
    max_daily_tasks = models.PositiveIntegerField(default=100)
    vacancy_fields = models.JSONField(default=list)
    hh_channel_active = models.BooleanField(default=True)
    max_daily_hh_tasks = models.IntegerField(default=100)
    hh_ai_prompt = models.TextField(default="")
```

---

## 🔄 Сериализаторы

### GradeSerializer
```python
class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name']
```

### CurrencyRateSerializer
```python
class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        fields = ['id', 'code', 'rate', 'scale', 'fetched_at']
```

### PLNTaxSerializer
```python
class PLNTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = PLNTax
        fields = ['id', 'name', 'rate', 'is_active']
```

### SalaryRangeSerializer
```python
class SalaryRangeSerializer(serializers.ModelSerializer):
    vacancy = VacancySerializer(read_only=True)
    grade = GradeSerializer(read_only=True)
    
    class Meta:
        model = SalaryRange
        fields = [
            'id', 'vacancy', 'grade', 'salary_min_usd', 'salary_max_usd',
            'salary_min_byn', 'salary_max_byn', 'salary_min_pln', 'salary_max_pln',
            'is_active', 'created_at', 'updated_at'
        ]
```

### BenchmarkSerializer
```python
class BenchmarkSerializer(serializers.ModelSerializer):
    vacancy = VacancySerializer(read_only=True)
    grade = GradeSerializer(read_only=True)
    
    class Meta:
        model = Benchmark
        fields = [
            'id', 'type', 'vacancy', 'grade', 'salary_from', 'salary_to',
            'location', 'work_format', 'domain', 'technologies', 'benefits',
            'compensation', 'development', 'notes', 'date_added'
        ]
```

### SalaryCalculationSerializer
```python
class SalaryCalculationSerializer(serializers.Serializer):
    net_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency_from = serializers.CharField(max_length=3)
    currency_to = serializers.CharField(max_length=3)
```

### TaxCalculationSerializer
```python
class TaxCalculationSerializer(serializers.Serializer):
    gross_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='PLN')
```

---

## ⚠️ Обработка ошибок

### HTTP статус коды

#### 200 OK
- Успешный запрос
- Возврат данных

#### 201 Created
- Успешное создание ресурса
- Возврат созданного объекта

#### 400 Bad Request
- Неверные данные запроса
- Ошибки валидации

#### 401 Unauthorized
- Неавторизованный доступ
- Неверные учетные данные

#### 403 Forbidden
- Недостаточно прав доступа
- Запрещенная операция

#### 404 Not Found
- Ресурс не найден
- Неверный URL

#### 500 Internal Server Error
- Внутренняя ошибка сервера
- Неожиданная ошибка

### Формат ошибок

#### Ошибки валидации
```json
{
    "field_name": [
        "Это поле обязательно для заполнения."
    ],
    "non_field_errors": [
        "Минимальная зарплата не может быть больше максимальной."
    ]
}
```

#### Ошибки API
```json
{
    "error": "Курс валюты не найден"
}
```

#### Ошибки JSON API
```json
{
    "success": false,
    "error": "Неверная сумма для конвертации"
}
```

---

## 📝 Примеры использования

### 1. Создание зарплатной вилки через REST API

```bash
curl -X POST http://localhost:8000/api/v1/finance/salary-ranges/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "vacancy": 1,
    "grade": 2,
    "salary_min_usd": "2500.00",
    "salary_max_usd": "4000.00",
    "is_active": true
  }'
```

### 2. Расчет налогов PLN через JSON API

```bash
curl -X POST http://localhost:8000/finance/api/calculate-pln-taxes/ \
  -H "Content-Type: application/json" \
  -d '{
    "gross_amount": "10000.00",
    "currency": "PLN"
  }'
```

### 3. Конвертация валют

```bash
curl -X POST http://localhost:8000/finance/api/convert-currency/ \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000.00",
    "from_currency": "USD",
    "to_currency": "BYN"
  }'
```

### 4. Получение статистики по грейдам

```bash
curl -X GET http://localhost:8000/api/v1/finance/grades/stats/ \
  -H "Authorization: Session YOUR_SESSION_ID"
```

### 5. Обновление курсов валют

```bash
curl -X POST http://localhost:8000/api/v1/finance/currency-rates/update/ \
  -H "Authorization: Session YOUR_SESSION_ID"
```

---

## 🔗 Интеграция с другими приложениями

### 1. Vacancies
- **Связь:** ForeignKey в `SalaryRange.vacancy` и `Benchmark.vacancy`
- **Использование:** Связь зарплатных вилок и бенчмарков с вакансиями
- **Критичность:** Высокая (без Vacancies Finance не работает)

### 2. Interviewers
- **Связь:** ForeignKey на `Grade` в `InterviewRule`
- **Использование:** Использование грейдов для правил интервью
- **Критичность:** Средняя

### 3. Google OAuth
- **Связь:** ForeignKey на `Grade` и `CurrencyRate`
- **Использование:** Хранение предпочтений пользователей
- **Критичность:** Низкая

### 4. Huntflow
- **Связь:** ForeignKey на `Grade` и `CurrencyRate`
- **Использование:** Интеграция с системой рекрутинга
- **Критичность:** Низкая

### 5. Внешние API
- **НБРБ API:** Получение официальных курсов валют
- **HH.ru API:** Сбор данных о вакансиях
- **Gemini AI:** Анализ данных о зарплатах

---

## 🚀 Заключение

API приложения `finance` предоставляет:

1. **Полный CRUD** для управления финансовыми данными
2. **REST API** с DRF ViewSets
3. **JSON API** для расчетов и конвертаций
4. **Веб-интерфейс** для пользователей
5. **Систему расчетов** налогов и валют
6. **Бенчмарки зарплат** с AI анализом
7. **Интеграцию** с внешними сервисами
8. **Безопасность** и валидацию

Система легко интегрируется с другими приложениями и предоставляет мощные инструменты для анализа рынка труда и управления финансовыми данными.

---

**Дата обновления:** 2024-01-20  
**Версия:** 1.0.0  
**Статус:** Production Ready ✅
