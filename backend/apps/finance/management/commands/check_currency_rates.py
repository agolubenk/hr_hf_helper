from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.finance.models import CurrencyRate
from apps.finance.services import CurrencyRateService


class Command(BaseCommand):
    help = "Проверяет текущие курсы валют в базе данных и сравнивает с НБРБ"

    def handle(self, *args, **options):
        self.stdout.write("🔍 Проверяю текущие курсы валют...")
        
        # Проверяем курсы в базе данных
        self.stdout.write("\n📊 КУРСЫ В БАЗЕ ДАННЫХ:")
        db_rates = CurrencyRate.objects.all().order_by('code')
        
        if not db_rates.exists():
            self.stdout.write(self.style.ERROR("❌ В базе данных нет курсов валют!"))
            self.stdout.write("💡 Запустите: python manage.py migrate finance 0006_seed_currency_rates")
            return
        
        for rate in db_rates:
            status = rate.status_info
            if status == "Базовая валюта":
                color = self.style.SUCCESS
            elif status == "Сегодня":
                color = self.style.SUCCESS
            elif status == "Вчера":
                color = self.style.WARNING
            else:
                color = self.style.ERROR
            
            self.stdout.write(
                f"   {rate.code}: {rate.rate} BYN "
                f"({rate.fetched_at.strftime('%d.%m.%Y %H:%M')}) - "
                f"{color(status)}"
            )
        
        # Проверяем курсы из НБРБ
        self.stdout.write("\n🌐 КУРСЫ ИЗ НБРБ:")
        try:
            nbrb_rates = CurrencyRateService.get_latest_rates()
            
            if nbrb_rates:
                for code, rate_data in nbrb_rates.items():
                    if rate_data:
                        rate = rate_data['rate']
                        source = rate_data['source']
                        status = rate_data['status']
                        
                        if status == "official":
                            color = self.style.SUCCESS
                            icon = "✅"
                        elif status == "nbrb_not_available":
                            color = self.style.WARNING
                            icon = "⚠️"
                        else:
                            color = self.style.SUCCESS
                            icon = "✅"
                        
                        self.stdout.write(
                            f"   {icon} {code}: {rate} BYN "
                            f"({color(source)}) - {color(status)}"
                        )
                        
                        # Сравниваем с базой данных
                        try:
                            db_rate = CurrencyRate.objects.get(code=code)
                            if abs(float(db_rate.rate) - float(rate)) > 0.01:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"      ⚠️  Разница с БД: {db_rate.rate} BYN "
                                        f"(разница: {abs(float(db_rate.rate) - float(rate)):.4f})"
                                    )
                                )
                            else:
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f"      ✅ Совпадает с БД: {db_rate.rate} BYN"
                                    )
                                )
                        except CurrencyRate.DoesNotExist:
                            self.stdout.write(
                                self.style.ERROR(f"      ❌ Нет в БД: {code}")
                            )
            else:
                self.stdout.write(self.style.ERROR("❌ Не удалось получить курсы из НБРБ"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Ошибка при получении курсов из НБРБ: {e}"))
        
        # Рекомендации
        self.stdout.write("\n💡 РЕКОМЕНДАЦИИ:")
        
        # Проверяем, есть ли устаревшие курсы
        outdated_rates = db_rates.exclude(code='BYN').filter(
            fetched_at__lt=timezone.now() - timezone.timedelta(days=1)
        )
        
        if outdated_rates.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Найдено {outdated_rates.count()} устаревших курсов"
                )
            )
            self.stdout.write("   Запустите: python manage.py update_nbrb_rates")
        else:
            self.stdout.write(self.style.SUCCESS("✅ Все курсы актуальны"))
        
        # Проверяем, есть ли fallback курсы
        fallback_rates = db_rates.filter(
            rate__in=[2.85, 0.72]  # Fallback значения
        )
        
        if fallback_rates.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Найдено {fallback_rates.count()} fallback курсов"
                )
            )
            self.stdout.write("   Запустите: python manage.py update_nbrb_rates --force")
        
        self.stdout.write("\n🎯 КОМАНДЫ ДЛЯ ОБНОВЛЕНИЯ:")
        self.stdout.write("   python manage.py update_nbrb_rates          # Обновить из НБРБ")
        self.stdout.write("   python manage.py update_nbrb_rates --force  # Принудительное обновление")
        self.stdout.write("   python manage.py migrate finance 0006_seed_currency_rates  # Создать начальные курсы")
