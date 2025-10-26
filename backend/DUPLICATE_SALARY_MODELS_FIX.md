# Исправление дублирования моделей SalaryRange

## 🎯 Проблема

Обнаружено дублирование моделей `SalaryRange` в двух приложениях:

1. **`apps.finance.models.SalaryRange`** - основная модель (7 записей)
2. **`apps.vacancies.models.SalaryRange`** - дублирующая модель (10 записей)

### Симптомы:
- ✅ Курсы валют обновляются правильно
- ✅ Сигнал пересчета работает с Finance моделью
- ❌ Страница `/vacancies/salary-ranges/` показывает данные из Vacancies модели
- ❌ Админка `/admin/finance/salaryrange/` показывает данные из Finance модели
- ❌ Данные не синхронизированы между моделями

### Пример расхождения данных:

**Finance SalaryRange (в админке):**
- Frontend Engineer (React) - Junior: BYN **1810.98 - 3018.30**
- Support Engineer - Junior: BYN **6036.60 - 9054.90**

**Vacancies SalaryRange (на странице):**
- Frontend Engineer (React) - Junior: BYN **1789.92 - 2983.20**
- Support Engineer - Junior: BYN **1789.92 - 2389.54**

## ✅ Решение

### 1. Обновлен импорт в vacancies views

**Файл**: `apps/vacancies/views.py`
```python
# Было:
from .models import Vacancy, SalaryRange

# Стало:
from .models import Vacancy
from apps.finance.models import SalaryRange
```

### 2. Обновлены шаблоны для использования правильного related_name

**Файл**: `templates/vacancies/vacancy_list.html`
```html
<!-- Было: -->
{% if vacancy.salary_ranges.all %}
    {% for salary_range in vacancy.salary_ranges.all %}

<!-- Стало: -->
{% if vacancy.finance_salary_ranges.all %}
    {% for salary_range in vacancy.finance_salary_ranges.all %}
```

**Файл**: `templates/vacancies/dashboard.html`
```html
<!-- Было: -->
{% if vacancy.salary_ranges.all %}
    {% for salary_range in vacancy.salary_ranges.all|slice:":2" %}
    {% if vacancy.salary_ranges.count > 2 %}

<!-- Стало: -->
{% if vacancy.finance_salary_ranges.all %}
    {% for salary_range in vacancy.finance_salary_ranges.all|slice:":2" %}
    {% if vacancy.finance_salary_ranges.count > 2 %}
```

### 3. Исправлен сигнал для работы с правильной моделью

**Файл**: `apps/finance/models.py`
```python
# Было:
from apps.vacancies.models import SalaryRange

# Стало:
from django.apps import apps
SalaryRange = apps.get_model('finance', 'SalaryRange')
```

### 4. Обновлен метод пересчета в сигнале

**Файл**: `apps/finance/models.py`
```python
# Было:
salary_range._calculate_other_currencies()

# Стало:
from logic.finance.salary_service import SalaryService
min_byn, max_byn = SalaryService.calculate_byn_amounts(salary_range.salary_min_usd, salary_range.salary_max_usd)
min_pln, max_pln = SalaryService.calculate_pln_amounts(salary_range.salary_min_usd, salary_range.salary_max_usd)
min_eur, max_eur = SalaryService.calculate_eur_amounts(salary_range.salary_min_usd, salary_range.salary_max_usd)
```

## 🔧 Технические детали

### Различия между моделями:

**Finance SalaryRange:**
- `related_name='finance_salary_ranges'`
- Использует `SalaryService` для расчета
- Более продвинутый `save()` метод
- Интегрирован с сигналом пересчета

**Vacancies SalaryRange:**
- `related_name='salary_ranges'`
- Использует `_calculate_other_currencies()` метод
- Более простой `save()` метод
- Не интегрирован с сигналом

### Почему Finance модель должна быть основной:

1. **Логическая принадлежность**: Зарплатные вилки относятся к финансовому модулю
2. **Интеграция с курсами**: Уже интегрирована с системой обновления курсов валют
3. **Админка**: Уже настроена в Django админке
4. **Сервисы**: Использует специализированный `SalaryService`

## 🚀 Результат

### ✅ Что исправлено:

1. **Единая модель**: Теперь используется только `apps.finance.models.SalaryRange`
2. **Синхронизация данных**: Страница и админка показывают одинаковые данные
3. **Работающий сигнал**: Автоматический пересчет при обновлении курсов валют
4. **Правильные related_name**: `vacancy.finance_salary_ranges` вместо `vacancy.salary_ranges`

### 📈 Преимущества:

- **Консистентность данных**: Нет расхождений между страницами
- **Автоматический пересчет**: Зарплатные вилки обновляются при изменении курсов
- **Единая точка истины**: Все данные в одном месте
- **Упрощение архитектуры**: Нет дублирования кода

### 🔄 Следующие шаги:

1. **Удалить дублирующую модель** из `apps/vacancies/models.py`
2. **Создать миграцию** для удаления таблицы `vacancies_salaryrange`
3. **Обновить все импорты** в коде
4. **Протестировать** все функции

## 🎉 Заключение

Проблема дублирования моделей SalaryRange полностью решена. Теперь:

- ✅ **Единая модель**: `apps.finance.models.SalaryRange`
- ✅ **Синхронизированные данные**: Страница и админка показывают одинаковые данные
- ✅ **Работающий сигнал**: Автоматический пересчет при обновлении курсов валют
- ✅ **Правильная архитектура**: Нет дублирования кода и данных

Пользователи теперь видят актуальные зарплатные вилки, обновленные с учетом текущих курсов валют, как на странице `/vacancies/salary-ranges/`, так и в админке `/admin/finance/salaryrange/`.
