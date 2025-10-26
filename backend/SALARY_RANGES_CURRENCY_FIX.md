# Исправление пересчета зарплатных вилок при обновлении курсов валют

## 🎯 Проблема

Курсы валют обновлялись автоматически, но зарплатные вилки не пересчитывались с учетом новых курсов. Это приводило к тому, что:

- Курсы USD, PLN, EUR обновлялись из НБРБ API
- Зарплатные вилки оставались с устаревшими значениями в BYN, PLN, EUR
- Пользователи видели неактуальные зарплатные данные

## ✅ Решение

### 1. Добавлен Django Signal

**Файл**: `apps/finance/models.py`

```python
@receiver(post_save, sender=CurrencyRate)
def recalculate_salary_ranges_on_currency_update(sender, instance, created, **kwargs):
    """
    Автоматически пересчитывает зарплатные вилки при обновлении курсов валют
    """
    # Пересчитываем только при обновлении существующего курса, не при создании
    if not created:
        try:
            from apps.vacancies.models import SalaryRange
            
            logger.info(f"🔄 Пересчитываем зарплатные вилки после обновления курса {instance.code}")
            
            # Получаем все активные зарплатные вилки
            salary_ranges = SalaryRange.objects.filter(is_active=True)
            updated_count = 0
            
            for salary_range in salary_ranges:
                try:
                    # Пересчитываем зарплаты в других валютах
                    salary_range._calculate_other_currencies()
                    salary_range.save(update_fields=[
                        'salary_min_byn', 'salary_max_byn',
                        'salary_min_pln', 'salary_max_pln', 
                        'salary_min_eur', 'salary_max_eur',
                        'updated_at'
                    ])
                    updated_count += 1
                except Exception as e:
                    logger.error(f"❌ Ошибка при пересчете вилки {salary_range}: {e}")
                    continue
            
            logger.info(f"✅ Пересчитано {updated_count} зарплатных вилок после обновления курса {instance.code}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка при пересчете зарплатных вилок: {e}")
```

### 2. Обновлен apps.py для загрузки сигналов

**Файл**: `apps/finance/apps.py`

```python
def ready(self):
    # Импортируем сигналы для автоматического пересчета зарплатных вилок
    import apps.finance.models  # Это загрузит сигналы из models.py
```

### 3. Добавлена команда управления

**Файл**: `apps/finance/management/commands/recalculate_salary_ranges.py`

Команда для ручного пересчета всех зарплатных вилок:

```bash
# Просмотр без изменений
python3 manage.py recalculate_salary_ranges --dry-run

# Применение изменений
python3 manage.py recalculate_salary_ranges

# Пересчет для конкретной валюты
python3 manage.py recalculate_salary_ranges --currency USD
```

## 🔧 Как это работает

### Автоматический пересчет

1. **Обновление курса валюты** → `CurrencyRate.save()`
2. **Срабатывает сигнал** → `recalculate_salary_ranges_on_currency_update()`
3. **Получение всех активных вилок** → `SalaryRange.objects.filter(is_active=True)`
4. **Пересчет для каждой вилки** → `salary_range._calculate_other_currencies()`
5. **Сохранение обновленных значений** → `salary_range.save()`

### Логика пересчета

Метод `_calculate_other_currencies()` в модели `SalaryRange`:

```python
def _calculate_other_currencies(self):
    """Рассчитывает зарплаты в других валютах на основе курсов и налогов"""
    # Получаем курсы валют
    usd_rate = CurrencyRate.objects.get(code='USD')
    pln_rate = CurrencyRate.objects.get(code='PLN')
    eur_rate = CurrencyRate.objects.get(code='EUR')
    
    # Рассчитываем BYN (net - как есть по курсу)
    if self.salary_min_usd:
        self.salary_min_byn = Decimal(str(self.salary_min_usd)) * usd_rate.rate
    
    # Рассчитываем PLN (gross - с налогами)
    if self.salary_min_usd:
        byn_amount = Decimal(str(self.salary_min_usd)) * usd_rate.rate
        pln_net = byn_amount / (pln_rate.rate / pln_rate.scale)
        self.salary_min_pln = pln_net / (1 - total_tax_rate)
    
    # Аналогично для EUR
```

## 📊 Тестирование

### Тест сигнала

```bash
python3 manage.py test_signal_direct
```

**Ожидаемый результат**:
```
INFO:apps.finance.models:🔄 Пересчитываем зарплатные вилки после обновления курса USD
INFO:apps.finance.models:✅ Пересчитано 10 зарплатных вилок после обновления курса USD
```

### Тест команды

```bash
python3 manage.py recalculate_salary_ranges --dry-run
```

**Ожидаемый результат**:
```
📊 Текущие курсы валют:
  USD: 2.983200 BYN (обновлен: 2025-10-24 13:04:21.876410+00:00)
  PLN: 8.166200 BYN (обновлен: 2025-10-24 13:04:21.886051+00:00)
  EUR: 3.459600 BYN (обновлен: 2025-10-24 13:04:21.887315+00:00)

📋 Найдено зарплатных вилок для пересчета: 10
```

## 🚀 Результат

### ✅ Что исправлено

1. **Автоматический пересчет**: Зарплатные вилки теперь автоматически пересчитываются при обновлении курсов валют
2. **Синхронизация данных**: Все валютные значения всегда актуальны
3. **Логирование**: Подробные логи процесса пересчета
4. **Ручное управление**: Команда для принудительного пересчета

### 📈 Преимущества

- **Актуальность данных**: Зарплатные вилки всегда соответствуют текущим курсам
- **Автоматизация**: Не требует ручного вмешательства
- **Надежность**: Обработка ошибок и логирование
- **Гибкость**: Возможность ручного пересчета при необходимости

### 🔄 Триггеры пересчета

1. **Автоматическое обновление курсов** (11:00 и 16:00 в будние дни)
2. **Ручное обновление курсов** через веб-интерфейс
3. **Ручной пересчет** через команду управления
4. **Любое изменение курса** в админке Django

## 📝 Логи

Сигнал записывает подробные логи:

```
INFO:apps.finance.models:🔄 Пересчитываем зарплатные вилки после обновления курса USD
INFO:apps.finance.models:✅ Пересчитано 10 зарплатных вилок после обновления курса USD
```

При ошибках:
```
ERROR:apps.finance.models:❌ Ошибка при пересчете вилки Frontend Engineer (React) - Junior: ...
```

## 🎉 Заключение

Проблема с устаревшими зарплатными вилками полностью решена. Теперь система автоматически поддерживает актуальность всех валютных значений при любых изменениях курсов валют.
