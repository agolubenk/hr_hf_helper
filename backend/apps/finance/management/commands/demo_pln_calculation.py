from django.core.management.base import BaseCommand
from apps.finance.models import CurrencyRate, PLNTax
from decimal import Decimal


class Command(BaseCommand):
    help = "Демонстрирует расчет PLN с учетом налогов"

    def add_arguments(self, parser):
        parser.add_argument(
            '--usd-amount',
            type=float,
            default=3000.0,
            help='Сумма в USD для расчета (по умолчанию 3000)',
        )

    def handle(self, *args, **options):
        usd_amount = Decimal(str(options['usd_amount']))
        
        self.stdout.write("🧮 ДЕМОНСТРАЦИЯ РАСЧЕТА PLN С УЧЕТОМ НАЛОГОВ")
        self.stdout.write("=" * 50)
        
        # Получаем курсы валют
        try:
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            
            self.stdout.write(f"\n📊 КУРСЫ ВАЛЮТ:")
            self.stdout.write(f"   USD: {usd_rate.rate} BYN")
            self.stdout.write(f"   PLN: {pln_rate.rate} BYN")
            
        except CurrencyRate.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f"❌ Отсутствуют курсы валют: {e}"))
            return
        
        # Получаем налоги
        active_taxes = PLNTax.objects.filter(is_active=True)
        total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        self.stdout.write(f"\n💰 НАЛОГИ PLN:")
        if active_taxes.exists():
            for tax in active_taxes:
                self.stdout.write(f"   - {tax.name}: {tax.rate}%")
            self.stdout.write(f"   📊 Суммарная ставка: {total_tax_rate * 100:.2f}%")
        else:
            self.stdout.write("   ⚠️ Нет активных налогов")
        
        # Расчет
        self.stdout.write(f"\n🧮 РАСЧЕТ ДЛЯ {usd_amount} USD:")
        
        # Шаг 1: USD -> BYN
        byn_amount = usd_amount * usd_rate.rate
        self.stdout.write(f"\n1️⃣ USD → BYN:")
        self.stdout.write(f"   {usd_amount} USD × {usd_rate.rate} BYN = {byn_amount} BYN")
        
        # Шаг 2: BYN -> PLN (базовый курс)
        pln_gross = byn_amount / pln_rate.rate
        self.stdout.write(f"\n2️⃣ BYN → PLN (базовый курс):")
        self.stdout.write(f"   {byn_amount} BYN ÷ {pln_rate.rate} BYN = {pln_gross} PLN")
        
        # Шаг 3: Применение налогов
        if total_tax_rate > 0 and total_tax_rate < 1:
            pln_final = pln_gross / (1 - total_tax_rate)
            self.stdout.write(f"\n3️⃣ Применение налогов:")
            self.stdout.write(f"   {pln_gross} PLN ÷ (1 - {total_tax_rate}) = {pln_final} PLN")
            
            # Детализация налогов
            self.stdout.write(f"\n📋 ДЕТАЛИЗАЦИЯ НАЛОГОВ:")
            breakdown = PLNTax.get_tax_breakdown(pln_final)
            
            for tax_detail in breakdown['taxes']:
                self.stdout.write(f"   - {tax_detail['name']}: {tax_detail['rate']}% = {tax_detail['amount']} PLN")
            
            self.stdout.write(f"   📊 Итого налогов: {breakdown['total_tax_amount']} PLN")
            self.stdout.write(f"   💰 Net сумма: {breakdown['net_amount']} PLN")
            
            # Проверка
            self.stdout.write(f"\n✅ ПРОВЕРКА:")
            self.stdout.write(f"   Gross: {pln_final} PLN")
            self.stdout.write(f"   Налоги: {breakdown['total_tax_amount']} PLN")
            self.stdout.write(f"   Net: {breakdown['net_amount']} PLN")
            self.stdout.write(f"   Проверка: {pln_final} - {breakdown['total_tax_amount']} = {breakdown['net_amount']} PLN")
            
        else:
            pln_final = pln_gross
            self.stdout.write(f"\n3️⃣ Без налогов:")
            self.stdout.write(f"   {pln_gross} PLN (налоги не применяются)")
        
        # Итоговая формула
        self.stdout.write(f"\n🎯 ИТОГОВАЯ ФОРМУЛА:")
        if total_tax_rate > 0 and total_tax_rate < 1:
            self.stdout.write(f"   PLN = (USD × курс_USD) ÷ курс_PLN ÷ (1 - {total_tax_rate})")
            self.stdout.write(f"   PLN = ({usd_amount} × {usd_rate.rate}) ÷ {pln_rate.rate} ÷ (1 - {total_tax_rate})")
            self.stdout.write(f"   PLN = {pln_final} PLN")
        else:
            self.stdout.write(f"   PLN = (USD × курс_USD) ÷ курс_PLN")
            self.stdout.write(f"   PLN = ({usd_amount} × {usd_rate.rate}) ÷ {pln_rate.rate}")
            self.stdout.write(f"   PLN = {pln_final} PLN")
        
        # Сравнение с простым расчетом
        simple_pln = byn_amount / pln_rate.rate
        difference = pln_final - simple_pln
        difference_percent = (difference / simple_pln) * 100
        
        self.stdout.write(f"\n📈 СРАВНЕНИЕ:")
        self.stdout.write(f"   Простой расчет: {simple_pln} PLN")
        self.stdout.write(f"   С налогами: {pln_final} PLN")
        self.stdout.write(f"   Разница: {difference} PLN ({difference_percent:+.2f}%)")
        
        self.stdout.write(f"\n💡 ВЫВОД:")
        if total_tax_rate > 0:
            self.stdout.write(f"   Налоги увеличивают итоговую сумму на {difference_percent:.2f}%")
            self.stdout.write(f"   Это означает, что работодатель должен платить больше, чтобы")
            self.stdout.write(f"   работник получил эквивалент {simple_pln} PLN на руки")
        else:
            self.stdout.write(f"   Налоги не применяются, расчет простой")
        
        self.stdout.write(f"\n🔧 КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ:")
        self.stdout.write(f"   python manage.py demo_pln_calculation --usd-amount=5000")
        self.stdout.write(f"   python manage.py test_salary_recalculation")
        self.stdout.write(f"   python manage.py update_salary_currency_amounts")

