"""
Сервис для работы с валютами и курсами
Объединяет логику из services.py и CurrencyRateService
"""
from decimal import Decimal
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import requests


class CurrencyService:
    """Сервис для работы с валютами и курсами"""
    
    # Основной API НБРБ
    NBRB_BASE_URL = "https://api.nbrb.by/exrates/rates/{currency}?parammode=2"
    
    # Альтернативные API (только для информации)
    EXCHANGERATE_API = "https://api.exchangerate-api.com/v4/latest/BYN"
    OPEN_ER_API = "https://open.er-api.com/v6/latest/BYN"
    
    @staticmethod
    def get_latest_rates() -> Dict[str, Any]:
        """
        Получает последние курсы валют.
        Приоритет: только НБРБ (официальные курсы)
        Альтернативные источники используются только для информации.
        """
        # Пробуем получить курсы из НБРБ
        nbrb_rates = CurrencyService._get_nbrb_rates()
        
        # Если НБРБ дал курсы - возвращаем их
        if nbrb_rates and any(rate and rate.get("rate") for rate in nbrb_rates.values() if rate and rate.get("rate") != 1.0):
            return nbrb_rates
        
        # Если НБРБ не дал курсов - возвращаем fallback с информацией о статусе
        print("⚠️  НБРБ не дал актуальных курсов за сегодня")
        print("💡 Курсы будут обновлены автоматически когда НБРБ их опубликует")
        
        return CurrencyService._get_fallback_rates_with_info()
    
    @staticmethod
    def _get_nbrb_rates() -> Optional[Dict[str, Any]]:
        """
        Получает курсы валют из API НБРБ.
        
        Returns:
            Словарь с курсами валют или None при ошибке
        """
        try:
            # Получаем курсы для USD и PLN
            usd_rate = CurrencyService._fetch_nbrb_rate("USD")
            pln_rate = CurrencyService._fetch_nbrb_rate("PLN")
            
            if usd_rate and pln_rate:
                return {
                    "USD": usd_rate,
                    "PLN": pln_rate,
                    "BYN": {"rate": 1.0, "scale": 1, "source": "base_currency"}
                }
            
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения курсов НБРБ: {e}")
            return None
    
    @staticmethod
    def _fetch_nbrb_rate(currency: str) -> Optional[Dict[str, Any]]:
        """
        Получает курс конкретной валюты из НБРБ.
        
        Args:
            currency: Код валюты (USD, PLN)
            
        Returns:
            Словарь с данными курса или None
        """
        try:
            url = CurrencyService.NBRB_BASE_URL.format(currency=currency)
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "rate": Decimal(str(data.get("Cur_OfficialRate", 0))),
                "scale": data.get("Cur_Scale", 1),
                "source": "nbrb",
                "fetched_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Ошибка получения курса {currency}: {e}")
            return None
    
    @staticmethod
    def _get_fallback_rates_with_info() -> Dict[str, Any]:
        """
        Возвращает fallback курсы при недоступности НБРБ.
        
        Returns:
            Словарь с fallback курсами
        """
        return {
            "USD": {
                "rate": Decimal("3.25"),  # Примерный курс
                "scale": 1,
                "source": "fallback",
                "status": "nbrb_not_available",
                "fetched_at": datetime.now().isoformat()
            },
            "PLN": {
                "rate": Decimal("0.85"),  # Примерный курс
                "scale": 1,
                "source": "fallback",
                "status": "nbrb_not_available",
                "fetched_at": datetime.now().isoformat()
            },
            "BYN": {
                "rate": Decimal("1.0"),
                "scale": 1,
                "source": "base_currency",
                "fetched_at": datetime.now().isoformat()
            }
        }
    
    @staticmethod
    def convert_amount(amount: Decimal, from_currency: str, to_currency: str) -> Dict[str, Any]:
        """
        Конвертирует сумму из одной валюты в другую.
        
        Args:
            amount: Сумма для конвертации
            from_currency: Исходная валюта
            to_currency: Целевая валюта
            
        Returns:
            Словарь с результатом конвертации
        """
        if from_currency == to_currency:
            return {
                "original_amount": amount,
                "converted_amount": amount,
                "from_currency": from_currency,
                "to_currency": to_currency,
                "rate": Decimal("1.0"),
                "conversion_type": "same_currency"
            }
        
        # Получаем актуальные курсы
        rates = CurrencyService.get_latest_rates()
        
        if not rates:
            raise ValueError("Не удалось получить курсы валют")
        
        # Конвертируем через BYN как базовую валюту
        if from_currency == "BYN":
            # BYN -> другая валюта
            target_rate = rates.get(to_currency, {}).get("rate", Decimal("1.0"))
            converted_amount = amount / target_rate
            rate = Decimal("1.0") / target_rate
        elif to_currency == "BYN":
            # другая валюта -> BYN
            source_rate = rates.get(from_currency, {}).get("rate", Decimal("1.0"))
            converted_amount = amount * source_rate
            rate = source_rate
        else:
            # другая валюта -> другая валюта (через BYN)
            source_rate = rates.get(from_currency, {}).get("rate", Decimal("1.0"))
            target_rate = rates.get(to_currency, {}).get("rate", Decimal("1.0"))
            
            # Сначала в BYN, потом в целевую валюту
            byn_amount = amount * source_rate
            converted_amount = byn_amount / target_rate
            rate = source_rate / target_rate
        
        return {
            "original_amount": amount,
            "converted_amount": converted_amount.quantize(Decimal('0.01')),
            "from_currency": from_currency,
            "to_currency": to_currency,
            "rate": rate.quantize(Decimal('0.000001')),
            "conversion_type": "currency_conversion",
            "rates_used": {
                "source_rate": rates.get(from_currency, {}).get("rate"),
                "target_rate": rates.get(to_currency, {}).get("rate")
            }
        }
    
    @staticmethod
    def get_currency_info() -> Dict[str, Any]:
        """
        Получает информацию о валютах и их статусе.
        
        Returns:
            Словарь с информацией о валютах
        """
        rates = CurrencyService.get_latest_rates()
        
        info = {
            "currencies": {},
            "last_update": datetime.now().isoformat(),
            "status": "success"
        }
        
        for currency, rate_data in rates.items():
            info["currencies"][currency] = {
                "rate": float(rate_data.get("rate", 0)),
                "scale": rate_data.get("scale", 1),
                "source": rate_data.get("source", "unknown"),
                "status": rate_data.get("status", "active"),
                "fetched_at": rate_data.get("fetched_at")
            }
        
        return info
    
    @staticmethod
    def update_currency_rates() -> Dict[str, Any]:
        """
        Обновляет курсы валют в базе данных.
        
        Returns:
            Результат обновления
        """
        from ..models import CurrencyRate
        
        try:
            rates = CurrencyService.get_latest_rates()
            
            if not rates:
                return {
                    "success": False,
                    "message": "Не удалось получить курсы валют",
                    "updated_count": 0
                }
            
            updated_count = 0
            
            for currency, rate_data in rates.items():
                if currency == "BYN":
                    continue  # Пропускаем базовую валюту
                
                rate_obj, created = CurrencyRate.objects.get_or_create(
                    code=currency,
                    defaults={
                        "rate": rate_data.get("rate", Decimal("0")),
                        "scale": rate_data.get("scale", 1),
                        "fetched_at": datetime.now()
                    }
                )
                
                if not created:
                    rate_obj.rate = rate_data.get("rate", Decimal("0"))
                    rate_obj.scale = rate_data.get("scale", 1)
                    rate_obj.fetched_at = datetime.now()
                    rate_obj.save()
                
                updated_count += 1
            
            return {
                "success": True,
                "message": f"Курсы валют успешно обновлены",
                "updated_count": updated_count,
                "rates": rates
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Ошибка при обновлении курсов: {str(e)}",
                "updated_count": 0
            }
