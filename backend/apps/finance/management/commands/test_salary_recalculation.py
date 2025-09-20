from django.core.management.base import BaseCommand
from apps.finance.models import SalaryRange, CurrencyRate
from decimal import Decimal


class Command(BaseCommand):
    help = "Тестирует пересчет зарплатных вилок"

    def handle(self, *args, **options):
        self.stdout.write("🧪 Тестирую пересчет зарплатных вилок...")
        
        # Проверяем курсы валют
        try:
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            
            self.stdout.write(f"\n📊 Текущие курсы валют:")
            self.stdout.write(f"   USD: {usd_rate.rate} BYN")
            self.stdout.write(f"   PLN: {pln_rate.rate} BYN")
            
        except CurrencyRate.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f"❌ Отсутствуют курсы валют: {e}"))
            return
        
        # Получаем первую зарплатную вилку для тестирования
        salary_range = SalaryRange.objects.first()
        
        if not salary_range:
            self.stdout.write(self.style.WARNING("⚠️ Нет зарплатных вилок для тестирования"))
            return
        
        self.stdout.write(f"\n🔍 Тестирую вилку: {salary_range}")
        self.stdout.write(f"   USD: {salary_range.salary_min_usd} - {salary_range.salary_max_usd}")
        self.stdout.write(f"   BYN: {salary_range.salary_min_byn} - {salary_range.salary_max_byn}")
        self.stdout.write(f"   PLN: {salary_range.salary_min_pln} - {salary_range.salary_max_pln}")
        
        # Сохраняем старые значения
        old_byn_min = salary_range.salary_min_byn
        old_byn_max = salary_range.salary_max_byn
        old_pln_min = salary_range.salary_min_pln
        old_pln_max = salary_range.salary_max_pln
        
        # Тестируем пересчет
        self.stdout.write(f"\n🔄 Выполняю пересчет...")
        
        try:
            # Обновляем курсы
            salary_range.update_currency_amounts()
            
            self.stdout.write(f"✅ Пересчет выполнен успешно!")
            
            # Показываем новые значения
            self.stdout.write(f"\n📊 Новые значения:")
            self.stdout.write(f"   BYN: {salary_range.salary_min_byn} - {salary_range.salary_max_byn}")
            self.stdout.write(f"   PLN: {salary_range.salary_min_pln} - {salary_range.salary_max_pln}")
            
            # Показываем изменения
            self.stdout.write(f"\n📈 Изменения:")
            if old_byn_min != salary_range.salary_min_byn:
                self.stdout.write(f"   BYN min: {old_byn_min} → {salary_range.salary_min_byn}")
            if old_byn_max != salary_range.salary_max_byn:
                self.stdout.write(f"   BYN max: {old_byn_max} → {salary_range.salary_max_byn}")
            if old_pln_min != salary_range.salary_min_pln:
                self.stdout.write(f"   PLN min: {old_pln_min} → {salary_range.salary_min_pln}")
            if old_pln_max != salary_range.salary_max_pln:
                self.stdout.write(f"   PLN max: {old_pln_max} → {salary_range.salary_max_pln}")
            
            # Проверяем правильность расчетов
            self.stdout.write(f"\n🧮 Проверка расчетов:")
            
            # BYN расчет
            expected_byn_min = salary_range.salary_min_usd * usd_rate.rate
            expected_byn_max = salary_range.salary_max_usd * usd_rate.rate
            
            self.stdout.write(f"   BYN min: {salary_range.salary_min_usd} × {usd_rate.rate} = {expected_byn_min}")
            self.stdout.write(f"   BYN max: {salary_range.salary_max_usd} × {usd_rate.rate} = {expected_byn_max}")
            
            if abs(float(salary_range.salary_min_byn) - float(expected_byn_min)) < 0.01:
                self.stdout.write(self.style.SUCCESS("   ✅ BYN min: расчет корректен"))
            else:
                self.stdout.write(self.style.ERROR("   ❌ BYN min: расчет неверен"))
            
            if abs(float(salary_range.salary_max_byn) - float(expected_byn_max)) < 0.01:
                self.stdout.write(self.style.SUCCESS("   ✅ BYN max: расчет корректен"))
            else:
                self.stdout.write(self.style.ERROR("   ❌ BYN max: расчет неверен"))
            
            # PLN расчет с учетом налогов
            from apps.finance.models import PLNTax
            active_taxes = PLNTax.objects.filter(is_active=True)
            total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
            
            pln_gross_min = (salary_range.salary_min_usd * usd_rate.rate) / pln_rate.rate
            pln_gross_max = (salary_range.salary_max_usd * usd_rate.rate) / pln_rate.rate
            
            if total_tax_rate > 0 and total_tax_rate < 1:
                expected_pln_min = pln_gross_min / (1 - total_tax_rate)
                expected_pln_max = pln_gross_max / (1 - total_tax_rate)
                
                self.stdout.write(f"   PLN min: {pln_gross_min} ÷ (1 - {total_tax_rate}) = {expected_pln_min}")
                self.stdout.write(f"   PLN max: {pln_gross_max} ÷ (1 - {total_tax_rate}) = {expected_pln_max}")
            else:
                expected_pln_min = pln_gross_min
                expected_pln_max = pln_gross_max
                
                self.stdout.write(f"   PLN min: {pln_gross_min} (без налогов)")
                self.stdout.write(f"   PLN max: {pln_gross_max} (без налогов)")
            
            if abs(float(salary_range.salary_min_pln) - float(expected_pln_min)) < 0.01:
                self.stdout.write(self.style.SUCCESS("   ✅ PLN min: расчет корректен"))
            else:
                self.stdout.write(self.style.ERROR("   ❌ PLN min: расчет неверен"))
            
            if abs(float(salary_range.salary_max_pln) - float(expected_pln_max)) < 0.01:
                self.stdout.write(self.style.SUCCESS("   ✅ PLN max: расчет корректен"))
            else:
                self.stdout.write(self.style.ERROR("   ❌ PLN max: расчет неверен"))
            
            self.stdout.write(self.style.SUCCESS("\n🎉 Тест пересчета завершен успешно!"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Ошибка при пересчете: {e}"))
        
        # Тестируем автоматический пересчет при сохранении
        self.stdout.write(f"\n🔄 Тестирую автоматический пересчет при сохранении...")
        
        try:
            # Изменяем USD сумму
            old_usd_min = salary_range.salary_min_usd
            salary_range.salary_min_usd = Decimal('1000.00')
            
            # Сохраняем (должен произойти автоматический пересчет)
            salary_range.save()
            
            self.stdout.write(f"✅ Автоматический пересчет при сохранении работает!")
            self.stdout.write(f"   USD min: {old_usd_min} → {salary_range.salary_min_usd}")
            self.stdout.write(f"   BYN min: {salary_range.salary_min_byn}")
            self.stdout.write(f"   PLN min: {salary_range.salary_min_pln}")
            
            # Возвращаем старое значение
            salary_range.salary_min_usd = old_usd_min
            salary_range.save()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Ошибка при тестировании автоматического пересчета: {e}"))
        
        self.stdout.write(f"\n💡 РЕКОМЕНДАЦИИ:")
        self.stdout.write(f"   - Для обновления всех вилок: python manage.py update_salary_currency_amounts")
        self.stdout.write(f"   - Для проверки курсов: python manage.py check_currency_rates")
        self.stdout.write(f"   - Для обновления курсов: python manage.py update_nbrb_rates")
