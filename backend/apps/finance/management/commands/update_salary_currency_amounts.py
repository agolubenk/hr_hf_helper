from django.core.management.base import BaseCommand
from apps.finance.models import SalaryRange, CurrencyRate


class Command(BaseCommand):
    help = "Обновляет курсы валют для всех зарплатных вилок"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Принудительное обновление всех вилок',
        )
        parser.add_argument(
            '--active-only',
            action='store_true',
            help='Обновлять только активные вилки',
        )

    def handle(self, *args, **options):
        self.stdout.write("🔄 Обновляю курсы валют для зарплатных вилок...")
        
        # Проверяем наличие курсов валют
        try:
            usd_rate = CurrencyRate.objects.get(code='USD')
            pln_rate = CurrencyRate.objects.get(code='PLN')
            
            self.stdout.write(f"📊 Текущие курсы:")
            self.stdout.write(f"   USD: {usd_rate.rate} BYN")
            self.stdout.write(f"   PLN: {pln_rate.rate} BYN")
            
        except CurrencyRate.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f"❌ Отсутствуют курсы валют: {e}"))
            self.stdout.write("💡 Запустите: python manage.py migrate finance 0006_seed_currency_rates")
            return
        
        # Получаем вилки для обновления
        if options['active_only']:
            salary_ranges = SalaryRange.objects.filter(is_active=True)
            self.stdout.write(f"📋 Обновляю только активные вилки...")
        else:
            salary_ranges = SalaryRange.objects.all()
            self.stdout.write(f"📋 Обновляю все вилки...")
        
        if not salary_ranges.exists():
            self.stdout.write(self.style.WARNING("⚠️ Нет зарплатных вилок для обновления"))
            return
        
        # Обновляем вилки
        updated_count = 0
        error_count = 0
        
        for salary_range in salary_ranges:
            try:
                # Сохраняем старые значения для сравнения
                old_byn_min = salary_range.salary_min_byn
                old_byn_max = salary_range.salary_max_byn
                old_pln_min = salary_range.salary_min_pln
                old_pln_max = salary_range.salary_max_pln
                
                # Обновляем курсы
                salary_range.update_currency_amounts()
                
                # Проверяем, изменились ли значения
                changed = (
                    old_byn_min != salary_range.salary_min_byn or
                    old_byn_max != salary_range.salary_max_byn or
                    old_pln_min != salary_range.salary_min_pln or
                    old_pln_max != salary_range.salary_max_pln
                )
                
                if changed or options['force']:
                    updated_count += 1
                    self.stdout.write(
                        f"✅ {salary_range.vacancy.name} - {salary_range.grade.name}: "
                        f"USD {salary_range.salary_min_usd}-{salary_range.salary_max_usd} → "
                        f"BYN {salary_range.salary_min_byn}-{salary_range.salary_max_byn}, "
                        f"PLN {salary_range.salary_min_pln}-{salary_range.salary_max_pln}"
                    )
                else:
                    self.stdout.write(
                        f"⏭️  {salary_range.vacancy.name} - {salary_range.grade.name}: "
                        f"курсы уже актуальны"
                    )
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ Ошибка при обновлении {salary_range.vacancy.name} - {salary_range.grade.name}: {e}"
                    )
                )
        
        # Итоговая статистика
        self.stdout.write(f"\n📊 ИТОГИ:")
        self.stdout.write(f"   ✅ Обновлено: {updated_count}")
        self.stdout.write(f"   ❌ Ошибок: {error_count}")
        self.stdout.write(f"   📋 Всего обработано: {salary_ranges.count()}")
        
        if updated_count > 0:
            self.stdout.write(self.style.SUCCESS("🎉 Обновление курсов завершено успешно!"))
        elif error_count == 0:
            self.stdout.write(self.style.SUCCESS("✅ Все курсы уже актуальны!"))
        else:
            self.stdout.write(self.style.WARNING("⚠️ Обновление завершено с ошибками"))
        
        # Рекомендации
        if error_count > 0:
            self.stdout.write(f"\n💡 РЕКОМЕНДАЦИИ:")
            self.stdout.write(f"   - Проверьте курсы валют: python manage.py check_currency_rates")
            self.stdout.write(f"   - Обновите курсы: python manage.py update_nbrb_rates")
            self.stdout.write(f"   - Принудительное обновление: python manage.py update_salary_currency_amounts --force")

