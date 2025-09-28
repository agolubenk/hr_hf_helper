from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import CurrencyRate, SalaryRange, PLNTax
from .salary_service import SalaryService


@receiver(post_save, sender=CurrencyRate)
def update_salary_ranges_on_currency_change(sender, instance, **kwargs):
    """
    Автоматически пересчитывает все зарплатные вилки при изменении курсов валют
    """
    if instance.code in ['USD', 'PLN']:
        # Пересчитываем все активные зарплатные вилки
        salary_ranges = SalaryRange.objects.filter(is_active=True)
        
        for salary_range in salary_ranges:
            try:
                SalaryService.update_salary_range_currency_amounts(salary_range)
            except Exception as e:
                # Логируем ошибку, но не прерываем процесс
                print(f"Ошибка при пересчете зарплатной вилки {salary_range.id}: {e}")


@receiver(post_save, sender=PLNTax)
def update_salary_ranges_on_tax_change(sender, instance, **kwargs):
    """
    Автоматически пересчитывает все зарплатные вилки при изменении налогов PLN
    """
    # Пересчитываем все активные зарплатные вилки
    salary_ranges = SalaryRange.objects.filter(is_active=True)
    
    for salary_range in salary_ranges:
        try:
            SalaryService.update_salary_range_currency_amounts(salary_range)
        except Exception as e:
            # Логируем ошибку, но не прерываем процесс
            print(f"Ошибка при пересчете зарплатной вилки {salary_range.id} после изменения налогов: {e}")
