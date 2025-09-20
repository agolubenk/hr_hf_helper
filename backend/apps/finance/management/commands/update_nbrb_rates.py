from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.finance.models import CurrencyRate, Currency
from apps.finance.services import CurrencyRateService


class Command(BaseCommand):
    help = "Обновляет курсы валют (BYN, USD, PLN) из НБРБ"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Принудительное обновление даже при ошибках',
        )

    def handle(self, *args, **options):
        self.stdout.write("🔄 Начинаю обновление курсов валют из НБРБ...")
        
        try:
            # Получаем последние курсы из НБРБ
            rates_info = CurrencyRateService.get_latest_rates()
            
            if not rates_info:
                self.stdout.write(self.style.ERROR("❌ Не удалось получить курсы"))
                if not options['force']:
                    return
                rates_info = CurrencyRateService._get_fallback_rates_with_info()
            
            # Обновляем курсы для каждой валюты
            for code in [Currency.BYN, Currency.USD, Currency.PLN]:
                try:
                    if code not in rates_info or not rates_info[code]:
                        self.stdout.write(self.style.ERROR(f"❌ Нет данных для {code}"))
                        continue
                    
                    currency_data = rates_info[code]
                    rate = currency_data["rate"]
                    scale = currency_data["scale"]
                    source = currency_data["source"]
                    status = currency_data["status"]
                    
                    # Формируем информативное сообщение
                    if status == "base":
                        self.stdout.write(f"✅ {code}: {rate} (базовая валюта)")
                    elif status == "official":
                        self.stdout.write(f"✅ {code}: {rate} (официальный курс НБРБ)")
                    elif status == "nbrb_not_available":
                        note = currency_data.get("note", "")
                        market_info = currency_data.get("market_rate")
                        
                        if market_info:
                            market_rate = market_info.get("rate", "N/A")
                            market_source = market_info.get("source", "N/A")
                            self.stdout.write(self.style.WARNING(f"⚠️  {code}: {rate} (fallback) - {note}"))
                            self.stdout.write(f"   💡 Рыночный курс для сравнения: {market_rate} BYN (источник: {market_source})")
                        else:
                            self.stdout.write(self.style.WARNING(f"⚠️  {code}: {rate} (fallback) - {note}"))
                    else:
                        self.stdout.write(f"✅ {code}: {rate} (статус: {status})")

                    # Обновляем или создаем запись
                    obj, created = CurrencyRate.objects.update_or_create(
                        code=code,
                        defaults={
                            "rate": rate,
                            "scale": scale,
                            "fetched_at": timezone.now(),
                        },
                    )
                    
                    if created:
                        self.stdout.write(f"📝 Создана новая запись для {code}")
                    else:
                        self.stdout.write(f"🔄 Обновлена существующая запись для {code}")
                        
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Ошибка при обновлении {code}: {e}"))
                    if not options['force']:
                        raise

            self.stdout.write(self.style.SUCCESS("🎉 Обновление курсов завершено!"))
            
            # Дополнительная информация
            if any(rate.get("status") == "nbrb_not_available" for rate in rates_info.values() if rate):
                self.stdout.write(self.style.WARNING("\n⚠️  Важно:"))
                self.stdout.write("   - Официальные курсы НБРБ еще не опубликованы за сегодня")
                self.stdout.write("   - Используются fallback значения")
                self.stdout.write("   - Курсы будут обновлены автоматически когда НБРБ их опубликует")
                self.stdout.write("   - Рекомендуется повторить обновление позже")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"💥 Критическая ошибка: {e}"))
            if not options['force']:
                raise
