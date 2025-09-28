# Finance App - JSON API Specification

## 🎯 Обзор

Полная JSON спецификация API для приложения `finance` с детальным описанием всех endpoints, моделей данных, примеров запросов и ответов.

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
2. [JSON API Endpoints](#json-api-endpoints)
3. [Модели данных](#модели-данных)
4. [Примеры запросов и ответов](#примеры-запросов-и-ответов)
5. [Коды ошибок](#коды-ошибок)
6. [Аутентификация](#аутентификация)

---

## 🔌 REST API Endpoints

### Base URL
```
http://localhost:8000/api/v1/finance/
```

### GradeViewSet (`/api/v1/finance/grades/`)

#### 1. Список грейдов
```http
GET /api/v1/finance/grades/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Создание грейда
```http
POST /api/v1/finance/grades/
Content-Type: application/json
Authorization: Session <session_id>

{
  "name": "Principal"
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "Principal"
}
```

#### 3. Получение грейда
```http
GET /api/v1/finance/grades/1/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Junior"
}
```

#### 4. Обновление грейда
```http
PUT /api/v1/finance/grades/1/
Content-Type: application/json
Authorization: Session <session_id>

{
  "name": "Junior+"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Junior+"
}
```

#### 5. Удаление грейда
```http
DELETE /api/v1/finance/grades/1/
Authorization: Session <session_id>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Кастомные действия GradeViewSet

#### 1. Статистика по грейдам
```http
GET /api/v1/finance/grades/stats/
Authorization: Session <session_id>
```

**Response:**
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
    },
    {
      "id": 3,
      "name": "Senior",
      "vacancies_count": 18,
      "salary_ranges_count": 15,
      "benchmarks_count": 12
    },
    {
      "id": 4,
      "name": "Lead",
      "vacancies_count": 8,
      "salary_ranges_count": 6,
      "benchmarks_count": 5
    }
  ]
}
```

### CurrencyRateViewSet (`/api/v1/finance/currency-rates/`)

#### 1. Список курсов валют
```http
GET /api/v1/finance/currency-rates/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Создание курса валюты
```http
POST /api/v1/finance/currency-rates/
Content-Type: application/json
Authorization: Session <session_id>

{
  "code": "EUR",
  "rate": "3.500000",
  "scale": 1
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "code": "EUR",
  "rate": "3.500000",
  "scale": 1,
  "fetched_at": "2024-01-20T16:00:00Z"
}
```

#### 3. Получение курса валюты
```http
GET /api/v1/finance/currency-rates/1/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "code": "USD",
  "rate": "3.250000",
  "scale": 1,
  "fetched_at": "2024-01-20T15:30:00Z"
}
```

### Кастомные действия CurrencyRateViewSet

#### 1. Обновление курсов валют
```http
POST /api/v1/finance/currency-rates/update/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Конвертация валют
```http
POST /api/v1/finance/currency-rates/convert/
Content-Type: application/json
Authorization: Session <session_id>

{
  "amount": "1000.00",
  "from_currency": "USD",
  "to_currency": "BYN"
}
```

**Response:**
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

#### 1. Список налогов PLN
```http
GET /api/v1/finance/pln-taxes/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Создание налога PLN
```http
POST /api/v1/finance/pln-taxes/
Content-Type: application/json
Authorization: Session <session_id>

{
  "name": "Дополнительный налог",
  "rate": "5.00",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "Дополнительный налог",
  "rate": "5.00",
  "is_active": true
}
```

#### 3. Получение налога PLN
```http
GET /api/v1/finance/pln-taxes/1/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Подоходный налог",
  "rate": "17.00",
  "is_active": true
}
```

### Кастомные действия PLNTaxViewSet

#### 1. Расчет налогов PLN
```http
POST /api/v1/finance/pln-taxes/calculate/
Content-Type: application/json
Authorization: Session <session_id>

{
  "gross_amount": "10000.00",
  "currency": "PLN"
}
```

**Response:**
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

#### 2. Сводка по налогам
```http
GET /api/v1/finance/pln-taxes/summary/
Authorization: Session <session_id>
```

**Response:**
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

### SalaryRangeViewSet (`/api/v1/finance/salary-ranges/`)

#### 1. Список зарплатных вилок
```http
GET /api/v1/finance/salary-ranges/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Создание зарплатной вилки
```http
POST /api/v1/finance/salary-ranges/
Content-Type: application/json
Authorization: Session <session_id>

{
  "vacancy": 1,
  "grade": 2,
  "salary_min_usd": "2500.00",
  "salary_max_usd": "4000.00",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": 26,
  "vacancy": {
    "id": 1,
    "title": "Python Developer",
    "company": "Tech Corp"
  },
  "grade": {
    "id": 2,
    "name": "Middle"
  },
  "salary_min_usd": "2500.00",
  "salary_max_usd": "4000.00",
  "salary_min_byn": "8125.00",
  "salary_max_byn": "13000.00",
  "salary_min_pln": "1500.00",
  "salary_max_pln": "2400.00",
  "is_active": true,
  "created_at": "2024-01-20T16:00:00Z",
  "updated_at": "2024-01-20T16:00:00Z"
}
```

#### 3. Получение зарплатной вилки
```http
GET /api/v1/finance/salary-ranges/1/
Authorization: Session <session_id>
```

**Response:**
```json
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
```

#### 4. Обновление зарплатной вилки
```http
PUT /api/v1/finance/salary-ranges/1/
Content-Type: application/json
Authorization: Session <session_id>

{
  "salary_min_usd": "3000.00",
  "salary_max_usd": "4500.00"
}
```

**Response:**
```json
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
  "salary_min_usd": "3000.00",
  "salary_max_usd": "4500.00",
  "salary_min_byn": "9750.00",
  "salary_max_byn": "14625.00",
  "salary_min_pln": "1800.00",
  "salary_max_pln": "2700.00",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T16:00:00Z"
}
```

#### 5. Удаление зарплатной вилки
```http
DELETE /api/v1/finance/salary-ranges/1/
Authorization: Session <session_id>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Кастомные действия SalaryRangeViewSet

#### 1. Статистика по зарплатным вилкам
```http
GET /api/v1/finance/salary-ranges/stats/
Authorization: Session <session_id>
```

**Response:**
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
    },
    {
      "grade": "Senior",
      "count": 4,
      "avg_min": "4000.00",
      "avg_max": "6000.00"
    },
    {
      "grade": "Lead",
      "count": 1,
      "avg_min": "6000.00",
      "avg_max": "8000.00"
    }
  ]
}
```

#### 2. Обновление валютных сумм
```http
POST /api/v1/finance/salary-ranges/update-currency/
Authorization: Session <session_id>
```

**Response:**
```json
{
  "success": true,
  "message": "Валютные суммы успешно обновлены",
  "updated_count": 25
}
```

### BenchmarkViewSet (`/api/v1/finance/benchmarks/`)

#### 1. Список бенчмарков
```http
GET /api/v1/finance/benchmarks/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Создание бенчмарка
```http
POST /api/v1/finance/benchmarks/
Content-Type: application/json
Authorization: Session <session_id>

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

**Response (201 Created):**
```json
{
  "id": 151,
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
  "salary_from": "3000.00",
  "salary_to": "5000.00",
  "location": "Варшава, Польша",
  "work_format": "hybrid",
  "domain": "gaming",
  "technologies": "Python, FastAPI, Redis",
  "benefits": "Спортзал, питание",
  "compensation": "Акции компании",
  "development": "Менторство, обучение",
  "notes": "Опыт с высоконагруженными системами",
  "date_added": "2024-01-20T16:00:00Z"
}
```

#### 3. Получение бенчмарка
```http
GET /api/v1/finance/benchmarks/1/
Authorization: Session <session_id>
```

**Response:**
```json
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
```

### Кастомные действия BenchmarkViewSet

#### 1. Статистика по бенчмаркам
```http
GET /api/v1/finance/benchmarks/stats/
Authorization: Session <session_id>
```

**Response:**
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
    },
    {
      "grade": "Senior",
      "count": 25,
      "avg_salary": "4200.00"
    },
    {
      "grade": "Lead",
      "count": 5,
      "avg_salary": "6500.00"
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
    },
    {
      "domain": "retail",
      "count": 20,
      "avg_salary": "2400.00"
    }
  ]
}
```

#### 2. Анализ рынка
```http
POST /api/v1/finance/benchmarks/market-analysis/
Content-Type: application/json
Authorization: Session <session_id>

{
  "grade": 2,
  "domain": "fintech",
  "work_format": "remote"
}
```

**Response:**
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

#### 1. Получение настроек
```http
GET /api/v1/finance/benchmark-settings/
Authorization: Session <session_id>
```

**Response:**
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

#### 2. Обновление настроек
```http
PUT /api/v1/finance/benchmark-settings/
Content-Type: application/json
Authorization: Session <session_id>

{
  "average_calculation_period_days": 120,
  "max_daily_tasks": 150,
  "hh_channel_active": false
}
```

**Response:**
```json
{
  "id": 1,
  "average_calculation_period_days": 120,
  "belarus_tax_rate": "13.00",
  "ai_analysis_prompt": "Анализируй следующие данные о зарплатах...",
  "data_sources": ["hh.ru", "linkedin", "glassdoor"],
  "max_daily_tasks": 150,
  "vacancy_fields": ["title", "salary", "location", "requirements"],
  "hh_channel_active": false,
  "max_daily_hh_tasks": 100,
  "hh_ai_prompt": "Специальный промпт для анализа hh.ru..."
}
```

---

## 🔌 JSON API Endpoints

### Base URL
```
http://localhost:8000/finance/api/
```

### 1. Расчеты и конвертации

#### Расчет налогов PLN
```http
POST /finance/api/calculate-pln-taxes/
Content-Type: application/json

{
  "net_amount": "6000.00",
  "currency": "PLN"
}
```

**Response (Success):**
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
    },
    {
      "name": "Социальное страхование",
      "rate": "13.71",
      "amount": "1364.18"
    },
    {
      "name": "Медицинское страхование",
      "rate": "9.00",
      "amount": "894.53"
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неверная сумма для расчета"
}
```

#### Конвертация валют
```http
POST /finance/api/convert-currency/
Content-Type: application/json

{
  "amount": "1000.00",
  "from_currency": "USD",
  "to_currency": "PLN"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "Курс валюты не найден"
}
```

#### Расчет зарплаты с налогами
```http
POST /finance/api/calculate-salary/
Content-Type: application/json

{
  "net_amount": "2000.00",
  "currency_from": "USD",
  "currency_to": "PLN"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "Ошибка при расчете налогов"
}
```

---

## 📊 Модели данных

### Grade Model

```json
{
  "id": "integer (read-only)",
  "name": "string (required, unique, max 64 chars)"
}
```

### CurrencyRate Model

```json
{
  "id": "integer (read-only)",
  "code": "string (required, choices: USD, PLN, BYN, EUR)",
  "rate": "decimal (required, max 12 digits, 6 decimal places)",
  "scale": "integer (default: 1)",
  "fetched_at": "datetime (auto-generated)"
}
```

### PLNTax Model

```json
{
  "id": "integer (read-only)",
  "name": "string (required, max 100 chars)",
  "rate": "decimal (required, max 5 digits, 2 decimal places)",
  "is_active": "boolean (default: true)"
}
```

### SalaryRange Model

```json
{
  "id": "integer (read-only)",
  "vacancy": "integer (required, foreign key to vacancies.Vacancy)",
  "grade": "integer (required, foreign key to Grade)",
  "salary_min_usd": "decimal (required, max 10 digits, 2 decimal places)",
  "salary_max_usd": "decimal (required, max 10 digits, 2 decimal places)",
  "salary_min_byn": "decimal (auto-calculated, max 12 digits, 2 decimal places)",
  "salary_max_byn": "decimal (auto-calculated, max 12 digits, 2 decimal places)",
  "salary_min_pln": "decimal (auto-calculated, max 12 digits, 2 decimal places)",
  "salary_max_pln": "decimal (auto-calculated, max 12 digits, 2 decimal places)",
  "is_active": "boolean (default: true)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

### Benchmark Model

```json
{
  "id": "integer (read-only)",
  "type": "string (required, choices: vacancy, candidate)",
  "vacancy": "integer (required, foreign key to vacancies.Vacancy)",
  "grade": "integer (required, foreign key to Grade)",
  "salary_from": "decimal (required, max 12 digits, 2 decimal places)",
  "salary_to": "decimal (optional, max 12 digits, 2 decimal places)",
  "location": "string (required, max 200 chars)",
  "work_format": "string (optional, choices: office, hybrid, remote, all_world)",
  "domain": "string (optional, choices: retail, fintech, gaming, etc.)",
  "technologies": "text (optional)",
  "benefits": "text (optional)",
  "compensation": "text (optional)",
  "development": "text (optional)",
  "notes": "text (optional)",
  "date_added": "datetime (auto-generated)"
}
```

### BenchmarkSettings Model

```json
{
  "id": "integer (read-only)",
  "average_calculation_period_days": "integer (default: 90)",
  "belarus_tax_rate": "decimal (default: 13.00, max 5 digits, 2 decimal places)",
  "ai_analysis_prompt": "text (default: AI analysis prompt)",
  "data_sources": "json (default: [])",
  "max_daily_tasks": "integer (default: 100)",
  "vacancy_fields": "json (default: [])",
  "hh_channel_active": "boolean (default: true)",
  "max_daily_hh_tasks": "integer (default: 100)",
  "hh_ai_prompt": "text (default: '')"
}
```

---

## 📝 Примеры запросов и ответов

### Создание зарплатной вилки с автоматическим расчетом валют

```http
POST /api/v1/finance/salary-ranges/
Content-Type: application/json
Authorization: Session <session_id>

{
  "vacancy": 1,
  "grade": 2,
  "salary_min_usd": "2500.00",
  "salary_max_usd": "4000.00",
  "is_active": true
}
```

**Response:**
```json
{
  "id": 26,
  "vacancy": {
    "id": 1,
    "title": "Python Developer",
    "company": "Tech Corp"
  },
  "grade": {
    "id": 2,
    "name": "Middle"
  },
  "salary_min_usd": "2500.00",
  "salary_max_usd": "4000.00",
  "salary_min_byn": "8125.00",
  "salary_max_byn": "13000.00",
  "salary_min_pln": "1500.00",
  "salary_max_pln": "2400.00",
  "is_active": true,
  "created_at": "2024-01-20T16:00:00Z",
  "updated_at": "2024-01-20T16:00:00Z"
}
```

### Расчет налогов с детализацией

```http
POST /finance/api/calculate-pln-taxes/
Content-Type: application/json

{
  "gross_amount": "10000.00",
  "currency": "PLN"
}
```

**Response:**
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

### Анализ рынка по критериям

```http
POST /api/v1/finance/benchmarks/market-analysis/
Content-Type: application/json
Authorization: Session <session_id>

{
  "grade": 2,
  "domain": "fintech",
  "work_format": "remote"
}
```

**Response:**
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

---

## ❌ Коды ошибок

### HTTP Status Codes

| Код | Описание | Пример использования |
|-----|----------|---------------------|
| 200 | OK | Успешный GET, PUT запрос |
| 201 | Created | Успешное создание ресурса |
| 204 | No Content | Успешное удаление ресурса |
| 400 | Bad Request | Неверные данные запроса |
| 401 | Unauthorized | Не авторизован |
| 403 | Forbidden | Недостаточно прав |
| 404 | Not Found | Ресурс не найден |
| 405 | Method Not Allowed | Неподдерживаемый HTTP метод |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

### Примеры ошибок

#### 400 Bad Request
```json
{
  "name": ["Это поле обязательно."],
  "rate": ["Налоговая ставка должна быть от 0 до 100%."],
  "non_field_errors": ["Минимальная зарплата не может быть больше максимальной."]
}
```

#### 401 Unauthorized
```json
{
  "detail": "Учетные данные не были предоставлены."
}
```

#### 403 Forbidden
```json
{
  "detail": "У вас нет прав для выполнения данного действия."
}
```

#### 404 Not Found
```json
{
  "detail": "Не найдено."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Внутренняя ошибка сервера",
  "message": "Произошла непредвиденная ошибка. Попробуйте позже."
}
```

---

## 🔐 Аутентификация

### Методы аутентификации

#### 1. Session Authentication (по умолчанию)
```http
# Вход в систему
POST /accounts/api/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

# Последующие запросы с cookie
GET /api/v1/finance/grades/
Cookie: sessionid=abc123...
```

### Заголовки запросов

#### Обязательные заголовки
```http
Content-Type: application/json
Authorization: Session <session_id>
```

#### Опциональные заголовки
```http
X-Requested-With: XMLHttpRequest
Accept: application/json
```

### Примеры использования

#### JavaScript (Fetch API)
```javascript
// Получение списка грейдов
const gradesResponse = await fetch('/api/v1/finance/grades/', {
  credentials: 'include'
});

const gradesData = await gradesResponse.json();

// Создание зарплатной вилки
const salaryRangeResponse = await fetch('/api/v1/finance/salary-ranges/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    vacancy: 1,
    grade: 2,
    salary_min_usd: '2500.00',
    salary_max_usd: '4000.00',
    is_active: true
  })
});

const salaryRangeData = await salaryRangeResponse.json();
```

#### Python (requests)
```python
import requests

# Создание сессии
session = requests.Session()

# Вход в систему
login_data = {
    'username': 'user@example.com',
    'password': 'password123'
}
response = session.post('http://localhost:8000/accounts/api/login/', json=login_data)

# Получение курсов валют
currency_response = session.get('http://localhost:8000/api/v1/finance/currency-rates/')
currency_data = currency_response.json()

# Расчет налогов
tax_data = {
    'gross_amount': '10000.00',
    'currency': 'PLN'
}
tax_response = session.post('http://localhost:8000/finance/api/calculate-pln-taxes/', json=tax_data)
tax_result = tax_response.json()
```

#### cURL
```bash
# Получение статистики по грейдам
curl -X GET http://localhost:8000/api/v1/finance/grades/stats/ \
  -b cookies.txt

# Обновление курсов валют
curl -X POST http://localhost:8000/api/v1/finance/currency-rates/update/ \
  -b cookies.txt

# Конвертация валют
curl -X POST http://localhost:8000/finance/api/convert-currency/ \
  -H "Content-Type: application/json" \
  -d '{"amount": "1000.00", "from_currency": "USD", "to_currency": "BYN"}'
```

---

## 🎉 Заключение

Данная JSON спецификация API предоставляет:

- ✅ **Полное описание** всех REST и JSON endpoints
- ✅ **Детальные примеры** запросов и ответов
- ✅ **Модели данных** с типами и ограничениями
- ✅ **Коды ошибок** с примерами
- ✅ **Методы аутентификации** с примерами использования
- ✅ **Практические примеры** для разных языков программирования

**Статус:** Complete ✅  
**Версия:** 1.0.0  
**Дата обновления:** 2024-01-20  
**Формат:** JSON API Specification
