# Finance App Documentation

## Обзор

Приложение `finance` отвечает за управление финансовыми данными, включая грейды, курсы валют, налоговые расчеты, зарплатные вилки и бенчмарки рынка.

## Основные функции

- Управление грейдами сотрудников
- Отслеживание курсов валют (BYN, USD, PLN)
- Расчет налогов для PLN (gross/net)
- Управление зарплатными вилками по вакансиям
- Сбор и анализ бенчмарков зарплат
- Автоматическое обновление валютных курсов

## Модели данных

### Grade (Грейд)
Модель для хранения уровней/грейдов сотрудников.

**Поля:**
- `id` - Уникальный идентификатор
- `name` - Название грейда (уникальное)

### CurrencyRate (Курс валюты)
Модель для хранения курсов валют от НБРБ.

**Поля:**
- `id` - Уникальный идентификатор
- `code` - Код валюты (BYN, USD, PLN)
- `rate` - Курс BYN за 1 единицу валюты
- `scale` - Масштаб (для валют с курсом за 100 единиц)
- `fetched_at` - Время получения курса

**Свойства:**
- `status_info` - Информация о статусе курса
- `display_rate` - Отформатированный курс для отображения

### PLNTax (Налог PLN)
Модель для хранения налоговых ставок Польши.

**Поля:**
- `id` - Уникальный идентификатор
- `name` - Название налога
- `rate` - Налоговая ставка в процентах
- `is_active` - Активен ли налог
- `created_at`, `updated_at` - Временные метки

**Методы класса:**
- `calculate_gross_from_net()` - Расчет gross из net
- `calculate_net_from_gross()` - Расчет net из gross
- `get_tax_breakdown()` - Детализация налогов

### SalaryRange (Зарплатная вилка)
Модель для хранения зарплатных вилок по вакансиям и грейдам.

**Поля:**
- `id` - Уникальный идентификатор
- `vacancy` - Связанная вакансия (ForeignKey)
- `grade` - Связанный грейд (ForeignKey)
- `salary_min_usd`, `salary_max_usd` - Вилка в USD (базовая)
- `salary_min_byn`, `salary_max_byn` - Вилка в BYN (автоматически)
- `salary_min_pln`, `salary_max_pln` - Вилка в PLN (автоматически)
- `is_active` - Активна ли вилка
- `created_at`, `updated_at` - Временные метки

**Свойства:**
- `salary_range_usd` - Отформатированная вилка в USD
- `salary_range_byn` - Отформатированная вилка в BYN
- `salary_range_pln` - Отформатированная вилка в PLN

**Методы:**
- `update_currency_amounts()` - Обновление валютных сумм
- `update_all_currency_amounts()` - Обновление всех вилок

### Benchmark (Бенчмарк)
Модель для хранения данных о зарплатах на рынке.

**Поля:**
- `id` - Уникальный идентификатор
- `type` - Тип бенчмарка (candidate/vacancy)
- `date_added` - Дата добавления
- `vacancy` - Связанная вакансия
- `grade` - Связанный грейд
- `salary_from`, `salary_to` - Вилка зарплаты в USD
- `location` - Локация
- `notes` - Примечания
- `work_format` - Формат работы (офис/гибрид/удаленка/all world)
- `compensation` - Компенсации
- `benefits` - Бенефиты
- `development` - Развитие/обучение
- `technologies` - Технологии
- `domain` - Домен деятельности
- `is_active` - Активен ли бенчмарк
- `created_at`, `updated_at` - Временные метки

**Свойства:**
- `type_icon` - Иконка типа бенчмарка
- `type_color` - Цвет типа бенчмарка

**Методы:**
- `get_salary_display()` - Отформатированное отображение зарплаты
- `get_salary_from_display()` - Отформатированная зарплата "от"
- `get_salary_to_display()` - Отформатированная зарплата "до"

### BenchmarkSettings (Настройки бенчмарков)
Синглтон модель для глобальных настроек системы бенчмарков.

**Поля:**
- `average_calculation_period_days` - Период расчета среднего (дни)
- `belarus_tax_rate` - Налоговая ставка в Беларуси (%)
- `ai_analysis_prompt` - Промпт для AI анализа
- `data_sources` - Источники данных (JSON)
- `max_daily_tasks` - Максимум задач в день
- `vacancy_fields` - Поля для сохранения вакансий (JSON)
- `created_at`, `updated_at` - Временные метки

**Методы класса:**
- `load()` - Загрузка единственного экземпляра настроек

**Свойства:**
- `data_sources_display` - Отображение источников данных
- `vacancy_fields_display` - Отображение полей вакансий

## API Endpoints

### Базовый URL
`/api/v1/finance/`

### Грейды

#### GET /api/v1/grades/
Получение списка грейдов.

**Параметры запроса:**
- `search` - Поиск по названию
- `ordering` - Сортировка (name, -name)

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Junior"
  },
  {
    "id": 2,
    "name": "Middle"
  }
]
```

#### POST /api/v1/grades/
Создание нового грейда.

**Тело запроса:**
```json
{
  "name": "Senior"
}
```

#### GET /api/v1/grades/{id}/
Получение грейда по ID.

#### PUT/PATCH /api/v1/grades/{id}/
Обновление грейда.

#### DELETE /api/v1/grades/{id}/
Удаление грейда.

#### GET /api/v1/grades/stats/
Статистика по грейдам.

### Курсы валют

#### GET /api/v1/currency-rates/
Получение списка курсов валют.

**Параметры запроса:**
- `code` - Фильтр по коду валюты
- `ordering` - Сортировка (code, -fetched_at)

**Ответ:**
```json
[
  {
    "id": 1,
    "code": "USD",
    "rate": "3.250000",
    "scale": 1,
    "fetched_at": "2024-01-15T10:00:00Z",
    "status_info": "Актуален",
    "display_rate": "3.25 BYN за 1 USD"
  }
]
```

#### POST /api/v1/currency-rates/update-rates/
Принудительное обновление курсов валют.

**Ответ:**
```json
{
  "detail": "Курсы валют обновлены успешно"
}
```

#### GET /api/v1/currency-rates/latest/
Получение последних курсов валют.

### Налоги PLN

#### GET /api/v1/pln-taxes/
Получение списка налогов PLN.

**Параметры запроса:**
- `is_active` - Фильтр по активности
- `search` - Поиск по названию
- `ordering` - Сортировка (name, rate, -created_at)

#### POST /api/v1/pln-taxes/
Создание нового налога PLN.

**Тело запроса:**
```json
{
  "name": "Подоходный налог",
  "rate": "18.00",
  "is_active": true
}
```

#### GET /api/v1/pln-taxes/{id}/
Получение налога по ID.

#### PUT/PATCH /api/v1/pln-taxes/{id}/
Обновление налога.

#### DELETE /api/v1/pln-taxes/{id}/
Удаление налога.

#### POST /api/v1/pln-taxes/calculate-gross/
Расчет gross зарплаты из net.

**Тело запроса:**
```json
{
  "net_salary": 5000.00
}
```

**Ответ:**
```json
{
  "net_salary": 5000.00,
  "gross_salary": 6250.00,
  "year": 2024
}
```

#### POST /api/v1/pln-taxes/calculate-net/
Расчет net зарплаты из gross.

**Тело запроса:**
```json
{
  "gross_salary": 6250.00
}
```

**Ответ:**
```json
{
  "gross_salary": 6250.00,
  "net_salary": 5000.00,
  "year": 2024
}
```

### Зарплатные вилки

#### GET /api/v1/salary-ranges/
Получение списка зарплатных вилок.

**Параметры запроса:**
- `vacancy` - Фильтр по вакансии
- `grade` - Фильтр по грейду
- `is_active` - Фильтр по активности
- `search` - Поиск по названию вакансии/грейда
- `ordering` - Сортировка (salary_min_usd, -created_at)

**Ответ:**
```json
[
  {
    "id": 1,
    "vacancy": 1,
    "vacancy_name": "Python Developer",
    "grade": 2,
    "grade_name": "Middle",
    "salary_min_usd": 2000.00,
    "salary_max_usd": 3500.00,
    "salary_min_byn": 6500.00,
    "salary_max_byn": 11375.00,
    "salary_min_pln": 8000.00,
    "salary_max_pln": 14000.00,
    "is_active": true,
    "salary_range_usd": "$2,000 - $3,500",
    "salary_range_byn": "6,500 - 11,375 BYN",
    "salary_range_pln": "8,000 - 14,000 PLN",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/v1/salary-ranges/
Создание новой зарплатной вилки.

**Тело запроса:**
```json
{
  "vacancy": 1,
  "grade": 2,
  "salary_min_usd": 2000.00,
  "salary_max_usd": 3500.00,
  "is_active": true
}
```

#### GET /api/v1/salary-ranges/{id}/
Получение зарплатной вилки по ID.

#### PUT/PATCH /api/v1/salary-ranges/{id}/
Обновление зарплатной вилки.

#### DELETE /api/v1/salary-ranges/{id}/
Удаление зарплатной вилки.

#### POST /api/v1/salary-ranges/update-currency-amounts/
Обновление валютных сумм для всех вилок.

**Ответ:**
```json
{
  "detail": "Валютные суммы обновлены успешно"
}
```

#### GET /api/v1/salary-ranges/stats/
Статистика по зарплатным вилкам.

### Бенчмарки

#### GET /api/v1/benchmarks/
Получение списка бенчмарков.

**Параметры запроса:**
- `type` - Фильтр по типу (candidate/vacancy)
- `vacancy` - Фильтр по вакансии
- `grade` - Фильтр по грейду
- `is_active` - Фильтр по активности
- `search` - Поиск по вакансии, грейду, локации, домену
- `ordering` - Сортировка (salary_from, -date_added)

**Ответ:**
```json
[
  {
    "id": 1,
    "type": "candidate",
    "vacancy": 1,
    "vacancy_name": "Python Developer",
    "grade": 2,
    "grade_name": "Middle",
    "salary_from": 2500.00,
    "salary_to": null,
    "salary_display": "$2,500",
    "location": "Минск",
    "work_format": "удаленка",
    "compensation": "Бонусы, опционы",
    "benefits": "Медицинское страхование",
    "development": "Конференции, курсы",
    "technologies": "Python, Django, PostgreSQL",
    "domain": "FinTech",
    "notes": "Опытный разработчик",
    "is_active": true,
    "type_icon": "👤",
    "type_color": "primary",
    "date_added": "2024-01-15T10:00:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### POST /api/v1/benchmarks/
Создание нового бенчмарка.

**Тело запроса:**
```json
{
  "type": "vacancy",
  "vacancy": 1,
  "grade": 2,
  "salary_from": 2000.00,
  "salary_to": 3500.00,
  "location": "Минск",
  "work_format": "офис",
  "technologies": "Python, Django",
  "domain": "FinTech",
  "notes": "Вакансия с hh.ru"
}
```

#### GET /api/v1/benchmarks/{id}/
Получение бенчмарка по ID.

#### PUT/PATCH /api/v1/benchmarks/{id}/
Обновление бенчмарка.

#### DELETE /api/v1/benchmarks/{id}/
Удаление бенчмарка.

#### GET /api/v1/benchmarks/stats/
Статистика по бенчмаркам.

### Настройки бенчмарков

#### GET /api/v1/benchmark-settings/
Получение настроек бенчмарков (единственный экземпляр).

**Ответ:**
```json
{
  "id": 1,
  "average_calculation_period_days": 90,
  "belarus_tax_rate": "13.00",
  "ai_analysis_prompt": "Проанализируй данные о зарплатах...",
  "data_sources": ["hh_ru", "telegram", "habr_career"],
  "data_sources_display": "HH.ru, Telegram, Habr Career",
  "max_daily_tasks": 100,
  "vacancy_fields": ["vacancy", "salary_range", "location"],
  "vacancy_fields_display": "Вакансия, Вилка от-до, Локация",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### PUT /api/v1/benchmark-settings/{id}/
Обновление настроек бенчмарков.

**Тело запроса:**
```json
{
  "average_calculation_period_days": 60,
  "belarus_tax_rate": "13.00",
  "max_daily_tasks": 150,
  "data_sources": ["hh_ru", "telegram"],
  "vacancy_fields": ["vacancy", "salary_range", "location", "work_format"]
}
```

### Расчет зарплат

#### POST /api/v1/salary-calculations/convert/
Конвертация зарплат между валютами.

**Тело запроса:**
```json
{
  "amount": 3000.00,
  "from_currency": "USD",
  "to_currency": "BYN",
  "include_taxes": false
}
```

**Ответ:**
```json
{
  "amount": 3000.00,
  "from_currency": "USD",
  "to_currency": "BYN",
  "converted_amount": 9750.00,
  "exchange_rate": 3.25,
  "include_taxes": false,
  "tax_amount": 0.00,
  "final_amount": 9750.00
}
```

## Команды управления

### Обновление курсов валют

#### update_nbrb_rates
Обновление курсов валют из НБРБ.

```bash
python manage.py update_nbrb_rates
```

#### force_update_rates
Принудительное обновление курсов из различных источников.

```bash
python manage.py force_update_rates --source nbrb --source market
```

### Работа с зарплатными вилками

#### update_salary_currency_amounts
Обновление валютных сумм для всех зарплатных вилок.

```bash
python manage.py update_salary_currency_amounts
```

### Работа с налогами PLN

#### demo_pln_calculation
Демонстрация расчета PLN с учетом налогов.

```bash
python manage.py demo_pln_calculation --net-salary 5000 --year 2024
```

### Тестирование

#### check_currency_rates
Проверка текущих курсов валют.

```bash
python manage.py check_currency_rates
```

#### test_salary_recalculation
Тестирование пересчета зарплатных вилок.

```bash
python manage.py test_salary_recalculation
```

## Сервисы

### CurrencyRateService
Сервис для получения курсов валют из различных источников.

**Методы:**
- `get_latest_rates()` - Получение последних курсов
- `_get_nbrb_rates()` - Получение курсов из НБРБ
- `_get_fallback_rates_with_info()` - Резервные курсы
- `_get_market_info()` - Информация о рынке
- `get_currency_info()` - Информация о валютах

### PLNTaxCalculationService
Сервис для расчета налогов PLN и конвертации валют.

**Методы:**
- `calculate_salary_with_taxes()` - Расчет зарплаты с налогами
- `get_tax_summary()` - Сводка по налогам
- `calculate_multiple_salaries()` - Расчет для нескольких зарплат

### NBRBClient
Клиент для работы с API НБРБ.

**Методы:**
- `fetch_all()` - Получение всех курсов
- `get_latest_available_rates()` - Последние доступные курсы
- `extract_rate()` - Извлечение курса для валюты
- `get_currency_info()` - Информация о валютах

## Сигналы

### update_salary_ranges_on_currency_change
Автоматическое обновление зарплатных вилок при изменении курсов валют.

### update_salary_ranges_on_tax_change
Автоматическое обновление зарплатных вилок при изменении налогов.

## Разрешения

- **IsAuthenticated** - для всех endpoints
- **IsAdminUser** - для создания/удаления грейдов и налогов
- **IsOwnerOrAdmin** - для редактирования бенчмарков

## Кэширование

- Курсы валют кэшируются на 1 час
- Статистика кэшируется на 5 минут
- Настройки бенчмарков кэшируются на 30 минут

## Логирование

Все операции с финансовыми данными логируются:
- Обновление курсов валют
- Создание/изменение зарплатных вилок
- Добавление бенчмарков
- Расчеты налогов

## Мониторинг

- Отслеживание актуальности курсов валют
- Мониторинг количества бенчмарков
- Статистика по зарплатным вилкам
- Контроль целостности данных

## Примеры использования

### Получение курсов валют

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/currency-rates/latest/",
    headers={"Authorization": "Token your_token_here"}
)

rates = response.json()
```

### Создание зарплатной вилки

```python
data = {
    "vacancy": 1,
    "grade": 2,
    "salary_min_usd": 2000.00,
    "salary_max_usd": 3500.00,
    "is_active": True
}

response = requests.post(
    "http://localhost:8000/api/v1/salary-ranges/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)
```

### Расчет PLN налогов

```python
data = {"net_salary": 5000.00}

response = requests.post(
    "http://localhost:8000/api/v1/pln-taxes/calculate-gross/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)

result = response.json()
print(f"Gross зарплата: {result['gross_salary']}")
```

### Добавление бенчмарка

```python
data = {
    "type": "candidate",
    "vacancy": 1,
    "grade": 2,
    "salary_from": 2500.00,
    "location": "Минск",
    "work_format": "удаленка",
    "technologies": "Python, Django",
    "domain": "FinTech"
}

response = requests.post(
    "http://localhost:8000/api/v1/benchmarks/",
    json=data,
    headers={"Authorization": "Token your_token_here"}
)
```
