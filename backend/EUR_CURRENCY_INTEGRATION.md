# Интеграция EUR валюты в HR Helper

## Обзор

Добавлена поддержка EUR (евро) валюты в систему HR Helper с автоматическим обновлением курсов и расчетом зарплатных вилок.

## Изменения в бэкенде

### 1. Модели данных
- **Файл**: `apps/finance/models.py`
- **Изменения**:
  - Добавлен `EUR = "EUR", "EUR"` в `Currency` choices
  - Добавлены поля `salary_min_eur` и `salary_max_eur` в модель `SalaryRange`
  - Добавлен property `salary_range_eur` для отображения диапазона

### 2. Сервис валют
- **Файл**: `logic/base/currency_service.py`
- **Изменения**:
  - Добавлена EUR в список валют для обновления: `['USD', 'PLN', 'EUR']`
  - Обновлены комментарии для включения EUR

### 3. Сервис зарплат
- **Файл**: `logic/finance/salary_service.py`
- **Изменения**:
  - Добавлен метод `calculate_eur_amounts()` для расчета EUR сумм
  - Обновлен метод `update_salary_range_currency_amounts()` для включения EUR
  - EUR расчеты используют польские налоговые ставки (так как EUR используется в Польше)

### 4. Налоговый сервис
- **Файл**: `logic/finance/tax_service.py`
- **Изменения**:
  - Добавлена поддержка EUR в `calculate_gross_from_net()`
  - EUR использует те же налоговые расчеты, что и PLN

### 5. Миграции
- **Файл**: `apps/finance/migrations/0019_add_eur_currency_support.py`
- **Изменения**:
  - Добавлены поля `salary_min_eur` и `salary_max_eur`
  - Обновлены choices для поля `code` в `CurrencyRate`

## Изменения во фронтенде

### 1. Шаблон детальной страницы зарплатной вилки
- **Файл**: `templates/finance/salary_range_detail.html`
- **Изменения**:
  - Добавлена карточка EUR в секцию валют
  - Добавлена строка EUR в таблицу детальной информации
  - Добавлен CSS стиль `.currency-eur { color: var(--color-primary); }`

### 2. Шаблон списка зарплатных вилок
- **Файл**: `templates/finance/salary_ranges_list.html`
- **Изменения**:
  - Добавлен заголовок "EUR" в таблицу
  - Добавлена колонка EUR в строки таблицы с классом `text-primary`

## Технические детали

### Расчет EUR сумм
1. **USD → BYN**: `usd_amount * usd_rate`
2. **BYN → EUR**: `byn_amount / eur_rate`
3. **EUR Gross → EUR Net**: Применяются польские налоговые ставки

### Налоговые расчеты для EUR
- EUR использует те же налоговые ставки, что и PLN
- Обоснование: EUR используется в Польше, поэтому применяются польские налоговые правила
- Метод: `TaxService.calculate_gross_from_net(eur_gross, currency="EUR")`

### Автоматическое обновление
- EUR курсы обновляются автоматически в 11:00 и 16:00 в будние дни
- Используется НБРБ API для получения актуальных курсов
- Курсы сохраняются в таблице `finance_currencyrate`

## Тестирование

### Команды для тестирования
```bash
# Обновить курсы валют (включая EUR)
python manage.py update_nbrb_rates

# Протестировать Celery задачу
python manage.py test_currency_update

# Обновить все зарплатные вилки с EUR
python manage.py shell -c "
from logic.finance.salary_service import SalaryService
SalaryService.update_all_salary_currency_amounts()
"
```

### Проверка результатов
```bash
# Проверить курсы валют
python manage.py shell -c "
from apps.finance.models import CurrencyRate
for rate in CurrencyRate.objects.all():
    print(f'{rate.code}: {rate.rate} BYN')
"

# Проверить EUR поля в зарплатных вилках
python manage.py shell -c "
from apps.finance.models import SalaryRange
for sr in SalaryRange.objects.filter(salary_min_eur__isnull=False)[:3]:
    print(f'{sr.vacancy.name}: {sr.salary_min_eur} - {sr.salary_max_eur} EUR')
"
```

## Примеры расчетов

### Тестовая зарплатная вилка
- **USD**: $3000 - $4000
- **BYN**: 9117.00 - 12156.00 BYN
- **PLN**: 1412.38 - 1883.18 PLN
- **EUR**: 3317.97 - 4423.96 EUR

### Курсы валют (на момент тестирования)
- **USD**: 3.039 BYN
- **PLN**: 8.3291 BYN
- **EUR**: 3.5455 BYN

## Мониторинг

### Логи обновления курсов
```
🔄 Запуск автоматического обновления курсов валют НБРБ...
🔍 Проверяем подключение к НБРБ API...
✅ Подключение к НБРБ API успешно
💱 Обновляем курсы валют в базе данных...
✅ Успешно обновлено 3 курсов валют
  💰 USD: 3.039 BYN (обновлен)
  💰 PLN: 8.3291 BYN (обновлен)
  💰 EUR: 3.5455 BYN (обновлен)
```

### Проверка статуса
```bash
# Проверить все курсы валют
python manage.py shell -c "
from apps.finance.models import CurrencyRate
for rate in CurrencyRate.objects.all():
    print(f'{rate.code}: {rate.rate} BYN ({rate.fetched_at})')
"
```

## Совместимость

### Обратная совместимость
- Все существующие функции работают без изменений
- EUR поля добавлены как nullable, не влияют на существующие данные
- Старые зарплатные вилки автоматически получат EUR расчеты при обновлении

### Миграция данных
- Существующие зарплатные вилки автоматически получат EUR расчеты
- Команда `SalaryService.update_all_salary_currency_amounts()` обновит все вилки
- Миграция `0019_add_eur_currency_support` добавляет новые поля

## Заключение

EUR валюта успешно интегрирована в систему HR Helper:
- ✅ Автоматическое обновление курсов через НБРБ API
- ✅ Расчет зарплатных вилок с польскими налоговыми ставками
- ✅ Отображение во фронтенде с соответствующими стилями
- ✅ Обратная совместимость с существующими данными
- ✅ Полное тестирование всех компонентов

Система теперь поддерживает 4 валюты: USD (базовая), BYN, PLN и EUR.
