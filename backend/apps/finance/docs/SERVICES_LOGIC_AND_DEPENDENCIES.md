# Finance App - Логика расчетов и зависимости сервисов

## 🎯 Обзор

Данный документ детально описывает логику расчетов и зависимости для трех основных сервисов приложения Finance:
- **TaxService** - налоговая логика
- **CurrencyService** - валютная логика  
- **SalaryService** - зарплатная логика

---

## 🧮 **1. TAX SERVICE - Налоговая логика**

### 📋 **Назначение**
Унифицированный сервис для всех налоговых расчетов, объединяющий логику из `models.py`, `pln_tax_services.py` и `SalaryRange`.

### 🔧 **Основные методы и логика**

#### 1.1 `calculate_gross_from_net(net_amount, currency="PLN")`
**Логика расчета:**
```python
# Формула: Gross = Net / (1 - общая_налоговая_ставка)
total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
gross_amount = net_amount / (1 - total_tax_rate)
```

**Зависимости:**
- `PLNTax` модель (финансы) - получение активных налогов
- Только для валюты PLN (другие валюты возвращают net сумму)

**Использование:**
- Расчет gross зарплаты из net
- Конвертация PLN с учетом налогов
- Обновление зарплатных вилок

#### 1.2 `calculate_net_from_gross(gross_amount, currency="PLN")`
**Логика расчета:**
```python
# Формула: Net = Gross * (1 - общая_налоговая_ставка)
total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
net_amount = gross_amount * (1 - total_tax_rate)
```

**Зависимости:**
- `PLNTax` модель (финансы) - получение активных налогов
- Только для валюты PLN

**Использование:**
- Обратный расчет net из gross
- Валидация налоговых расчетов

#### 1.3 `get_tax_breakdown(gross_amount, currency="PLN")`
**Логика расчета:**
```python
# Для каждого активного налога:
tax_amount = gross_amount * tax.rate_decimal
total_tax_amount += tax_amount
net_amount = gross_amount - total_tax_amount
```

**Возвращает:**
- Детализацию по каждому налогу
- Общую сумму налогов
- Net и gross суммы
- Общий процент налогов

**Зависимости:**
- `PLNTax` модель (финансы) - получение активных налогов

#### 1.4 `calculate_salary_with_taxes(net_amount, currency_from, currency_to)`
**Логика расчета:**
1. Рассчитывает gross в исходной валюте
2. Получает детализацию налогов
3. Конвертирует валюты через `CurrencyService`
4. Применяет налоговые расчеты

**Зависимости:**
- `CurrencyService` - конвертация валют
- `PLNTax` модель (финансы) - налоговые ставки

#### 1.5 `get_tax_summary()`
**Логика:**
- Подсчет активных/неактивных налогов
- Расчет общей налоговой ставки
- Список всех налогов с деталями

**Зависимости:**
- `PLNTax` модель (финансы) - все налоги

#### 1.6 `calculate_multiple_salaries(salaries)`
**Логика:**
- Обработка списка зарплат
- Агрегация результатов
- Расчет средних значений

**Зависимости:**
- Внутренние методы `TaxService`

### 🔗 **Зависимости с другими приложениями**
- ❌ **Нет внешних зависимостей** - использует только модели Finance

---

## 💱 **2. CURRENCY SERVICE - Валютная логика**

### 📋 **Назначение**
Сервис для работы с валютами и курсами, объединяющий логику из `services.py` и `CurrencyRateService`.

### 🔧 **Основные методы и логика**

#### 2.1 `get_latest_rates()`
**Логика получения курсов:**
1. **Приоритет:** API НБРБ (официальные курсы)
2. **Fallback:** Рыночные курсы при недоступности НБРБ
3. **Валидация:** Проверка актуальности данных

**Источники данных:**
- **Основной:** `https://api.nbrb.by/exrates/rates/{currency}?parammode=2`
- **Альтернативные:** exchangerate-api.com, open.er-api.com (только для информации)

**Зависимости:**
- `requests` библиотека - HTTP запросы
- Внешние API НБРБ

#### 2.2 `_get_nbrb_rates()`
**Логика:**
1. Получение курсов USD и PLN из НБРБ
2. Обработка JSON ответа
3. Валидация данных

**Структура ответа НБРБ:**
```json
{
  "Cur_ID": 145,
  "Date": "2024-01-15T00:00:00",
  "Cur_Abbreviation": "USD",
  "Cur_Scale": 1,
  "Cur_Name": "Доллар США",
  "Cur_OfficialRate": 3.25
}
```

#### 2.3 `_fetch_nbrb_rate(currency)`
**Логика:**
- HTTP GET запрос к НБРБ API
- Парсинг JSON ответа
- Обработка ошибок сети

**Зависимости:**
- `requests` библиотека
- Внешний API НБРБ

#### 2.4 `convert_amount(amount, from_currency, to_currency)`
**Логика конвертации:**
```python
# Конвертация через BYN как базовую валюту:
if from_currency == "BYN":
    converted_amount = amount / target_rate
elif to_currency == "BYN":
    converted_amount = amount * source_rate
else:
    # другая валюта -> другая валюта (через BYN)
    byn_amount = amount * source_rate
    converted_amount = byn_amount / target_rate
```

**Зависимости:**
- `get_latest_rates()` - получение актуальных курсов

#### 2.5 `update_currency_rates()`
**Логика обновления:**
1. Получение актуальных курсов
2. Обновление/создание записей в БД
3. Обработка ошибок

**Зависимости:**
- `CurrencyRate` модель (финансы) - сохранение в БД
- `get_latest_rates()` - получение курсов

### 🔗 **Зависимости с другими приложениями**
- ❌ **Нет внешних зависимостей** - использует только модели Finance
- 🌐 **Внешние API:** НБРБ, exchangerate-api.com

---

## 💰 **3. SALARY SERVICE - Зарплатная логика**

### 📋 **Назначение**
Сервис для работы с зарплатными вилками, объединяющий логику из `SalaryRange` модели.

### 🔧 **Основные методы и логика**

#### 3.1 `calculate_byn_amounts(salary_min_usd, salary_max_usd)`
**Логика расчета:**
```python
# Формула: BYN = USD * курс_USD_к_BYN
usd_rate = CurrencyRate.objects.get(code='USD').rate
min_byn = salary_min_usd * usd_rate
max_byn = salary_max_usd * usd_rate
```

**Зависимости:**
- `CurrencyRate` модель (финансы) - курс USD
- Только для конвертации USD → BYN

#### 3.2 `calculate_pln_amounts(salary_min_usd, salary_max_usd)`
**Логика расчета:**
```python
# Многоэтапная конвертация:
# 1. USD -> BYN
byn_amount = salary_usd * usd_rate

# 2. BYN -> PLN (Gross)
pln_gross = byn_amount / pln_to_byn_rate

# 3. PLN Gross -> PLN Net (с учетом налогов)
pln_net = TaxService.calculate_gross_from_net(pln_gross, "PLN")
```

**Зависимости:**
- `CurrencyRate` модель (финансы) - курсы USD и PLN
- `TaxService` - расчет налогов PLN

#### 3.3 `create_salary_range(vacancy_id, grade_id, salary_min_usd, salary_max_usd)`
**Логика создания:**
1. Валидация существования вакансии и грейда
2. Проверка уникальности (vacancy + grade)
3. Создание записи в БД
4. Автоматический расчет в других валютах

**Зависимости:**
- `SalaryRange` модель (финансы) - основная модель
- `Vacancy` модель (вакансии) - внешняя зависимость
- `Grade` модель (финансы) - грейды
- `_calculate_currency_amounts()` - расчет валют

#### 3.4 `update_salary_range(salary_range_id, ...)`
**Логика обновления:**
1. Поиск существующей записи
2. Обновление переданных полей
3. Пересчет валютных сумм
4. Сохранение в БД

**Зависимости:**
- `SalaryRange` модель (финансы)
- `_calculate_currency_amounts()` - пересчет валют

#### 3.5 `_calculate_currency_amounts(salary_range)`
**Логика расчета валют:**
```python
# Получение курсов через CurrencyService
usd_rate = CurrencyService.convert_amount(Decimal('1'), 'USD', 'BYN')
pln_rate = CurrencyService.convert_amount(Decimal('1'), 'PLN', 'BYN')

# Расчет BYN
salary_range.salary_min_byn = salary_min_usd * usd_rate['converted_amount']

# Расчет PLN с налогами
byn_amount = salary_min_usd * usd_rate['converted_amount']
pln_gross = byn_amount / pln_rate['converted_amount']
salary_range.salary_min_pln = TaxService.calculate_gross_from_net(pln_gross, "PLN")
```

**Зависимости:**
- `CurrencyService` - получение курсов валют
- `TaxService` - расчет налогов PLN

#### 3.6 `get_salary_range_stats()`
**Логика статистики:**
- Подсчет общих/активных/неактивных вилок
- Статистика по вакансиям и грейдам
- Средние зарплаты

**Зависимости:**
- `SalaryRange` модель (финансы)
- `Vacancy` модель (вакансии) - внешняя зависимость
- `Grade` модель (финансы)

### 🔗 **Зависимости с другими приложениями**

#### 3.1 **apps.vacancies (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
**Использование:**
- `Vacancy` модель - для связи зарплатных вилок с вакансиями
- ForeignKey в `SalaryRange.vacancy`
- ForeignKey в `Benchmark.vacancy`

**Файлы с зависимостями:**
- `models.py` - ForeignKey связи
- `logic/salary_service.py` - импорт Vacancy
- `tasks.py` - работа с вакансиями
- `views.py` - отображение вакансий

**Тип связи:**
- **Направление:** Finance → Vacancies
- **Тип:** ForeignKey (многие к одному)
- **Критичность:** Высокая (без Vacancies Finance не работает)

#### 3.2 **apps.interviewers (ЗАВИСИМОСТЬ)**
**Использование:**
- `Grade` модель используется в `InterviewRule`

**Тип связи:**
- **Направление:** Interviewers → Finance
- **Тип:** ForeignKey на Grade
- **Критичность:** Средняя

#### 3.3 **apps.google_oauth (ЗАВИСИМОСТЬ)**
**Использование:**
- `Grade` и `CurrencyRate` модели

**Тип связи:**
- **Направление:** Google OAuth → Finance
- **Тип:** ForeignKey на Grade и CurrencyRate
- **Критичность:** Низкая

#### 3.4 **apps.huntflow (ЗАВИСИМОСТЬ)**
**Использование:**
- `Grade` и `CurrencyRate` модели

**Тип связи:**
- **Направление:** Huntflow → Finance
- **Тип:** ForeignKey на Grade и CurrencyRate
- **Критичность:** Низкая

---

## 🔄 **ВЗАИМОДЕЙСТВИЕ СЕРВИСОВ**

### Схема зависимостей:
```
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

### Порядок выполнения расчетов:
1. **CurrencyService** - получение актуальных курсов
2. **TaxService** - расчет налоговых ставок
3. **SalaryService** - комплексные расчеты зарплат

---

## 📊 **МОДЕЛИ И ИХ РОЛЬ**

### Внутренние модели Finance:
- **`Grade`** - грейды сотрудников
- **`CurrencyRate`** - курсы валют
- **`PLNTax`** - налоговые ставки PLN
- **`SalaryRange`** - зарплатные вилки
- **`Benchmark`** - бенчмарки зарплат
- **`BenchmarkSettings`** - настройки бенчмарков

### Внешние зависимости:
- **`Vacancy`** (apps.vacancies) - вакансии
- **`InterviewRule`** (apps.interviewers) - правила интервью
- **`GoogleOAuthAccount`** (apps.google_oauth) - OAuth аккаунты
- **`HuntflowCache`** (apps.huntflow) - кэш Huntflow

---

## ⚠️ **КРИТИЧЕСКИЕ ЗАВИСИМОСТИ**

### 1. **apps.vacancies - КРИТИЧЕСКАЯ**
- **Причина:** SalaryRange и Benchmark имеют ForeignKey на Vacancy
- **Последствия:** Без Vacancies невозможно создавать зарплатные вилки
- **Решение:** Обеспечить стабильность модели Vacancy

### 2. **Внешние API НБРБ**
- **Причина:** CurrencyService зависит от API НБРБ
- **Последствия:** При недоступности API курсы не обновляются
- **Решение:** Fallback курсы и retry логика

### 3. **База данных**
- **Причина:** Все сервисы работают с БД
- **Последствия:** Проблемы с БД ломают все расчеты
- **Решение:** Транзакции и обработка ошибок

---

## 🎯 **ЗАКЛЮЧЕНИЕ**

### Архитектурные принципы:
- ✅ **Единый источник истины** - каждый сервис отвечает за свою область
- ✅ **Слабая связанность** - сервисы взаимодействуют через четкие интерфейсы
- ✅ **Высокая когезия** - каждый сервис содержит связанную функциональность
- ✅ **Обработка ошибок** - все сервисы имеют fallback механизмы

### Готовность к продакшену:
- ✅ **Стабильность** - все критические зависимости учтены
- ✅ **Масштабируемость** - сервисы можно развивать независимо
- ✅ **Тестируемость** - каждый сервис можно тестировать изолированно
- ✅ **Документированность** - вся логика описана и понятна

**Приложение Finance имеет отличную архитектуру с четким разделением ответственности и минимальными критическими зависимостями!** 🎉

---

**Дата создания:** 2024-01-20  
**Статус:** ✅ **Актуально**  
**Версия:** 1.0.0
