from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.finance.models import CurrencyRate
from apps.finance.services import CurrencyRateService
import requests
from decimal import Decimal


class Command(BaseCommand):
    help = "Принудительно обновляет курсы валют из различных источников"

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            choices=['nbrb', 'market', 'manual'],
            default='nbrb',
            help='Источник курсов: nbrb (НБРБ), market (рыночные), manual (ручные)',
        )
        parser.add_argument(
            '--usd-rate',
            type=float,
            help='Ручной курс USD (только с --source=manual)',
        )
        parser.add_argument(
            '--pln-rate',
            type=float,
            help='Ручной курс PLN (только с --source=manual)',
        )

    def handle(self, *args, **options):
        source = options['source']
        
        self.stdout.write(f"🔄 Принудительное обновление курсов из источника: {source}")
        
        if source == 'nbrb':
            self._update_from_nbrb()
        elif source == 'market':
            self._update_from_market()
        elif source == 'manual':
            self._update_manual(options)
        else:
            self.stdout.write(self.style.ERROR(f"❌ Неизвестный источник: {source}"))

    def _update_from_nbrb(self):
        """Обновляет курсы из НБРБ"""
        self.stdout.write("🌐 Получаю курсы из НБРБ...")
        
        try:
            # Пробуем получить курсы из НБРБ
            nbrb_rates = CurrencyRateService._get_nbrb_rates()
            
            if nbrb_rates:
                self.stdout.write("✅ Получены курсы из НБРБ!")
                self._save_rates(nbrb_rates, "НБРБ")
            else:
                self.stdout.write(self.style.WARNING("⚠️ НБРБ не дал курсов, пробую альтернативные источники..."))
                self._update_from_market()
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Ошибка НБРБ: {e}"))
            self.stdout.write("🔄 Пробую альтернативные источники...")
            self._update_from_market()

    def _update_from_market(self):
        """Обновляет курсы из рыночных источников"""
        self.stdout.write("📈 Получаю курсы из рыночных источников...")
        
        try:
            # Пробуем exchangerate-api
            response = requests.get("https://api.exchangerate-api.com/v4/latest/BYN", timeout=10)
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                
                market_rates = {
                    "BYN": {
                        "rate": 1.0,
                        "scale": 1,
                        "source": "market",
                        "status": "base"
                    }
                }
                
                if "USD" in rates:
                    usd_rate = 1.0 / float(rates["USD"])
                    market_rates["USD"] = {
                        "rate": usd_rate,
                        "scale": 1,
                        "source": "market",
                        "status": "market_rate"
                    }
                    self.stdout.write(f"✅ USD: {usd_rate} BYN (рыночный)")
                
                if "PLN" in rates:
                    pln_rate = 1.0 / float(rates["PLN"])
                    market_rates["PLN"] = {
                        "rate": pln_rate,
                        "scale": 1,
                        "source": "market",
                        "status": "market_rate"
                    }
                    self.stdout.write(f"✅ PLN: {pln_rate} BYN (рыночный)")
                
                self._save_rates(market_rates, "рыночные")
            else:
                self.stdout.write(self.style.ERROR("❌ Не удалось получить рыночные курсы"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Ошибка рыночных курсов: {e}"))

    def _update_manual(self, options):
        """Обновляет курсы вручную"""
        usd_rate = options.get('usd_rate')
        pln_rate = options.get('pln_rate')
        
        if not usd_rate or not pln_rate:
            self.stdout.write(self.style.ERROR("❌ Для ручного обновления нужны --usd-rate и --pln-rate"))
            return
        
        manual_rates = {
            "BYN": {
                "rate": 1.0,
                "scale": 1,
                "source": "manual",
                "status": "base"
            },
            "USD": {
                "rate": usd_rate,
                "scale": 1,
                "source": "manual",
                "status": "manual"
            },
            "PLN": {
                "rate": pln_rate,
                "scale": 1,
                "source": "manual",
                "status": "manual"
            }
        }
        
        self.stdout.write(f"✅ USD: {usd_rate} BYN (ручной)")
        self.stdout.write(f"✅ PLN: {pln_rate} BYN (ручной)")
        
        self._save_rates(manual_rates, "ручные")

    def _save_rates(self, rates_data, source_name):
        """Сохраняет курсы в базу данных"""
        self.stdout.write(f"\n💾 Сохраняю курсы в базу данных...")
        
        for code, rate_data in rates_data.items():
            try:
                rate = Decimal(str(rate_data['rate']))
                scale = rate_data['scale']
                
                obj, created = CurrencyRate.objects.update_or_create(
                    code=code,
                    defaults={
                        "rate": rate,
                        "scale": scale,
                        "fetched_at": timezone.now(),
                    },
                )
                
                if created:
                    self.stdout.write(f"📝 Создана запись для {code}: {rate} BYN")
                else:
                    self.stdout.write(f"🔄 Обновлена запись для {code}: {rate} BYN")
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Ошибка при сохранении {code}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(f"🎉 Курсы из {source_name} источника сохранены!"))
        
        # Показываем итоговые курсы
        self.stdout.write("\n📊 ИТОГОВЫЕ КУРСЫ:")
        for rate in CurrencyRate.objects.all().order_by('code'):
            self.stdout.write(f"   {rate.code}: {rate.rate} BYN ({rate.fetched_at.strftime('%d.%m.%Y %H:%M')})")

