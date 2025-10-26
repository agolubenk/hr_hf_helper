# Резервная копия Vacancies SalaryRange модели

## ⚠️ ВНИМАНИЕ: Документация для восстановления

Этот файл содержит полную документацию логики `apps.vacancies.models.SalaryRange`, которая будет удалена для устранения дублирования с `apps.finance.models.SalaryRange`.

**Дата создания резервной копии**: 26 октября 2025

## 📋 Полная модель SalaryRange из vacancies

### Файл: `apps/vacancies/models.py` (строки 363-588)

```python
class SalaryRange(models.Model):
    """Модель для зарплатных вилок по вакансиям"""
    
    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        related_name='salary_ranges',
        verbose_name='Вакансия',
        help_text='Вакансия для которой устанавливается зарплатная вилка'
    )
    
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='salary_ranges',
        verbose_name='Грейд',
        help_text='Грейд для которого устанавливается зарплатная вилка'
    )
    
    # Зарплата в USD (базовая валюта для редактирования)
    salary_min_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Минимальная зарплата (USD)',
        help_text='Минимальная зарплата в долларах США'
    )
    
    salary_max_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Максимальная зарплата (USD)',
        help_text='Максимальная зарплата в долларах США'
    )
    
    # Зарплата в BYN (автоматически рассчитывается)
    salary_min_byn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (BYN)',
        help_text='Минимальная зарплата в белорусских рублях',
        blank=True,
        null=True
    )
    
    salary_max_byn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (BYN)',
        help_text='Минимальная зарплата в белорусских рублях',
        blank=True,
        null=True
    )
    
    # Зарплата в PLN (автоматически рассчитывается)
    salary_min_pln = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (PLN)',
        help_text='Минимальная зарплата в польских злотых',
        blank=True,
        null=True
    )
    
    salary_max_pln = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (PLN)',
        help_text='Максимальная зарплата в польских злотых',
        blank=True,
        null=True
    )
    
    # Зарплата в EUR (автоматически рассчитывается)
    salary_min_eur = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Минимальная зарплата (EUR)',
        help_text='Минимальная зарплата в евро',
        blank=True,
        null=True
    )
    
    salary_max_eur = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Максимальная зарплата (EUR)',
        help_text='Максимальная зарплата в евро',
        blank=True,
        null=True
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна',
        help_text='Активна ли зарплатная вилка'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Зарплатная вилка'
        verbose_name_plural = 'Зарплатные вилки'
        ordering = ['grade__name', 'salary_min_usd']
        unique_together = ['vacancy', 'grade']  # Одна зарплатная вилка на вакансию и грейд
    
    def __str__(self):
        return f"{self.vacancy.name} - {self.grade.name}: ${self.salary_min_usd} - ${self.salary_max_usd}"
    
    def clean(self):
        """Валидация модели"""
        super().clean()
        
        # Проверяем, что минимальная зарплата не больше максимальной
        if self.salary_min_usd and self.salary_max_usd and self.salary_min_usd > self.salary_max_usd:
            raise ValidationError({
                'salary_min_usd': 'Минимальная зарплата не может быть больше максимальной'
            })
    
    def save(self, *args, **kwargs):
        self.clean()
        
        # Автоматически рассчитываем зарплаты в других валютах
        self._calculate_other_currencies()
        
        super().save(*args, **kwargs)
    
    def _calculate_other_currencies(self):
        """Рассчитывает зарплаты в других валютах на основе курсов и налогов"""
        try:
            from apps.finance.models import CurrencyRate, PLNTax
            from decimal import Decimal
            
            # Получаем курсы валют
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            eur_rate = CurrencyRate.objects.get(code='EUR')
            
            # Получаем налоговые ставки для PLN/EUR
            active_taxes = PLNTax.objects.filter(is_active=True)
            total_tax_rate = sum(tax.rate_decimal for tax in active_taxes) if active_taxes.exists() else Decimal('0')
            
            # Рассчитываем BYN (net - как есть по курсу)
            if self.salary_min_usd:
                self.salary_min_byn = Decimal(str(self.salary_min_usd)) * usd_rate.rate
            if self.salary_max_usd:
                self.salary_max_byn = Decimal(str(self.salary_max_usd)) * usd_rate.rate
            
            # Рассчитываем PLN (gross - с налогами)
            if self.salary_min_usd:
                # USD -> BYN -> PLN (net) с учетом scale
                byn_amount = Decimal(str(self.salary_min_usd)) * usd_rate.rate
                pln_net = byn_amount / (pln_rate.rate / pln_rate.scale)
                # PLN net -> PLN gross = net / (1 - налоги)
                self.salary_min_pln = pln_net / (1 - total_tax_rate) if total_tax_rate < 1 else pln_net
            if self.salary_max_usd:
                byn_amount = Decimal(str(self.salary_max_usd)) * usd_rate.rate
                pln_net = byn_amount / (pln_rate.rate / pln_rate.scale)
                self.salary_max_pln = pln_net / (1 - total_tax_rate) if total_tax_rate < 1 else pln_net
            
            # Рассчитываем EUR (gross - с налогами)
            if self.salary_min_usd:
                # USD -> BYN -> EUR (net) с учетом scale
                byn_amount = Decimal(str(self.salary_min_usd)) * usd_rate.rate
                eur_net = byn_amount / (eur_rate.rate / eur_rate.scale)
                # EUR net -> EUR gross = net / (1 - налоги)
                self.salary_min_eur = eur_net / (1 - total_tax_rate) if total_tax_rate < 1 else eur_net
            if self.salary_max_usd:
                byn_amount = Decimal(str(self.salary_max_usd)) * usd_rate.rate
                eur_net = byn_amount / (eur_rate.rate / eur_rate.scale)
                self.salary_max_eur = eur_net / (1 - total_tax_rate) if total_tax_rate < 1 else eur_net
                
        except CurrencyRate.DoesNotExist:
            # Если курсы не найдены, оставляем поля пустыми
            pass
        except Exception as e:
            # Логируем ошибку, но не прерываем сохранение
            print(f"Ошибка при расчете валют для {self.grade.name}: {e}")
    
    def get_salary_display(self, currency='USD'):
        """Возвращает отформатированную зарплатную вилку для указанной валюты"""
        if currency == 'USD':
            return f"{self.salary_min_usd} - {self.salary_max_usd} USD"
        elif currency == 'BYN':
            if self.salary_min_byn and self.salary_max_byn:
                return f"{self.salary_min_byn} - {self.salary_max_byn} BYN"
        elif currency == 'PLN':
            if self.salary_min_pln and self.salary_max_pln:
                return f"{self.salary_min_pln} - {self.salary_max_pln} PLN"
        elif currency == 'EUR':
            if self.salary_min_eur and self.salary_max_eur:
                return f"{self.salary_min_eur} - {self.salary_max_eur} EUR"
        
        return f"{self.salary_min_usd} - {self.salary_max_usd} USD"
    
    def get_salary_min(self, currency='USD'):
        """Возвращает минимальную зарплату в указанной валюте"""
        if currency == 'USD':
            return self.salary_min_usd
        elif currency == 'BYN':
            return self.salary_min_byn
        elif currency == 'PLN':
            return self.salary_min_pln
        elif currency == 'EUR':
            return self.salary_min_eur
        return self.salary_min_usd
    
    def get_salary_max(self, currency='USD'):
        """Возвращает максимальную зарплату в указанной валюте"""
        if currency == 'USD':
            return self.salary_max_usd
        elif currency == 'BYN':
            return self.salary_max_byn
        elif currency == 'PLN':
            return self.salary_max_pln
        elif currency == 'EUR':
            return self.salary_max_eur
        return self.salary_max_usd
```

## 📁 Миграции для восстановления

### 1. Основная миграция создания модели

**Файл**: `apps/vacancies/migrations/0002_salaryrange.py`

```python
# Generated by Django 5.2.5 on 2025-09-11 22:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0002_seed_grades'),
        ('vacancies', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalaryRange',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('salary_min_usd', models.DecimalField(decimal_places=2, help_text='Минимальная зарплата в долларах США', max_digits=10, verbose_name='Минимальная зарплата (USD)')),
                ('salary_max_usd', models.DecimalField(decimal_places=2, help_text='Максимальная зарплата в долларах США', max_digits=10, verbose_name='Максимальная зарплата (USD)')),
                ('salary_min_byn', models.DecimalField(blank=True, decimal_places=2, help_text='Минимальная зарплата в белорусских рублях', max_digits=12, null=True, verbose_name='Минимальная зарплата (BYN)')),
                ('salary_max_byn', models.DecimalField(blank=True, decimal_places=2, help_text='Минимальная зарплата в белорусских рублях', max_digits=12, null=True, verbose_name='Максимальная зарплата (BYN)')),
                ('salary_min_pln', models.DecimalField(blank=True, decimal_places=2, help_text='Минимальная зарплата в польских злотых', max_digits=12, null=True, verbose_name='Минимальная зарплата (PLN)')),
                ('salary_max_pln', models.DecimalField(blank=True, decimal_places=2, help_text='Максимальная зарплата в польских злотых', max_digits=12, null=True, verbose_name='Максимальная зарплата (PLN)')),
                ('is_active', models.BooleanField(default=True, help_text='Активна ли зарплатная вилка', verbose_name='Активна')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('grade', models.ForeignKey(help_text='Грейд для которого устанавливается зарплатная вилка', on_delete=django.db.models.deletion.CASCADE, related_name='salary_ranges', to='finance.grade', verbose_name='Грейд')),
            ],
            options={
                'verbose_name': 'Зарплатная вилка',
                'verbose_name_plural': 'Зарплатные вилки',
                'ordering': ['grade__name', 'salary_min_usd'],
                'unique_together': {('grade',)},
            },
        ),
    ]
```

### 2. Миграция добавления связи с вакансией

**Файл**: `apps/vacancies/migrations/0005_salaryrange_vacancy.py`

```python
# Generated by Django 5.2.6 on 2025-09-16 08:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0004_add_screening_duration'),
    ]

    operations = [
        migrations.AddField(
            model_name='salaryrange',
            name='vacancy',
            field=models.ForeignKey(blank=True, help_text='Вакансия для которой устанавливается зарплатная вилка', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='salary_ranges', to='vacancies.vacancy', verbose_name='Вакансия'),
        ),
    ]
```

### 3. Миграция изменения unique_together

**Файл**: `apps/vacancies/migrations/0006_alter_salaryrange_unique_together.py`

```python
# Generated by Django 5.2.6 on 2025-09-16 08:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0005_salaryrange_vacancy'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='salaryrange',
            unique_together={('vacancy', 'grade')},
        ),
    ]
```

### 4. Миграция изменения ForeignKey

**Файл**: `apps/vacancies/migrations/0007_alter_salaryrange_vacancy.py`

```python
# Generated by Django 5.2.6 on 2025-09-16 08:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0006_alter_salaryrange_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salaryrange',
            name='vacancy',
            field=models.ForeignKey(help_text='Вакансия для которой устанавливается зарплатная вилка', on_delete=django.db.models.deletion.CASCADE, related_name='salary_ranges', to='vacancies.vacancy', verbose_name='Вакансия'),
        ),
    ]
```

## 🔗 Импорты для восстановления

### Файлы, которые импортируют Vacancies SalaryRange:

1. **`apps/finance/management/commands/recalculate_salary_ranges.py`**
```python
from apps.vacancies.models import SalaryRange
```

2. **`apps/google_oauth/models.py`** (строка 3539)
```python
from apps.vacancies.models import SalaryRange, Vacancy
```

3. **`logic/candidate/vacancy_management.py`** (строка 7)
```python
from apps.vacancies.models import Vacancy, SalaryRange
```

4. **`apps/common/management/commands/export_static_site.py`** (строка 495)
```python
from apps.vacancies.models import Vacancy, SalaryRange
```

5. **`apps/vacancies/management/commands/update_salary_ranges.py`**
```python
from apps.vacancies.models import SalaryRange
```

## 📊 Данные для восстановления

### Количество записей на момент удаления:
- **Vacancies SalaryRange**: 10 записей
- **Finance SalaryRange**: 7 записей

### Примеры данных Vacancies SalaryRange:
```
Frontend Engineer (React) - Junior: BYN 1789.92 - 2983.20
Support Engineer (Service Manager/Sport Analyst) - Junior: BYN 1789.92 - 2389.54
Frontend Engineer (React) - Junior+: BYN 2983.20 - 4474.80
```

## 🔄 Шаги для полного восстановления

### 1. Восстановить модель в `apps/vacancies/models.py`
```python
# Добавить полную модель SalaryRange (см. выше)
```

### 2. Восстановить миграции
```bash
# Скопировать файлы миграций:
# - 0002_salaryrange.py
# - 0005_salaryrange_vacancy.py  
# - 0006_alter_salaryrange_unique_together.py
# - 0007_alter_salaryrange_vacancy.py
```

### 3. Восстановить импорты
```python
# Во всех файлах заменить:
from apps.finance.models import SalaryRange
# На:
from apps.vacancies.models import SalaryRange
```

### 4. Восстановить related_name в шаблонах
```html
<!-- Заменить: -->
{% if vacancy.finance_salary_ranges.all %}
    {% for salary_range in vacancy.finance_salary_ranges.all %}

<!-- На: -->
{% if vacancy.salary_ranges.all %}
    {% for salary_range in vacancy.salary_ranges.all %}
```

### 5. Применить миграции
```bash
python3 manage.py migrate vacancies
```

### 6. Восстановить данные (если нужно)
```python
# Создать записи SalaryRange в таблице vacancies_salaryrange
```

## ⚠️ Важные отличия от Finance модели

### Vacancies SalaryRange:
- `related_name='salary_ranges'`
- Использует `_calculate_other_currencies()` метод
- Прямой расчет курсов валют в модели
- Более детальная обработка налогов

### Finance SalaryRange:
- `related_name='finance_salary_ranges'`
- Использует `SalaryService` для расчета
- Интегрирован с сигналом пересчета
- Более простая архитектура

## 🎯 Причина удаления

Дублирование моделей SalaryRange создавало:
- **Расхождение данных** между страницами
- **Сложность синхронизации** курсов валют
- **Дублирование кода** и логики
- **Путаницу** в архитектуре приложения

## 📝 Заключение

Эта документация позволяет полностью восстановить логику Vacancies SalaryRange модели в случае необходимости. Все компоненты (модель, миграции, импорты, данные) задокументированы для быстрого восстановления без использования git.

**Дата создания**: 26 октября 2025  
**Статус**: Готово к удалению  
**Причина**: Устранение дублирования с Finance SalaryRange
