import datetime
import requests
from typing import Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal

# Основной API НБРБ - исправленный на правильный
NBRB_BASE_URL = "https://api.nbrb.by/exrates/rates/{currency}?parammode=2"

# Альтернативные API (только для информации, не для подмены)
EXCHANGERATE_API = "https://api.exchangerate-api.com/v4/latest/BYN"
OPEN_ER_API = "https://open.er-api.com/v6/latest/BYN"


class CurrencyRateService:
    """Сервис для получения курсов валют из различных источников"""
    
    @staticmethod
    def get_latest_rates() -> dict[str, Any]:
        """
        Получает последние курсы валют.
        Приоритет: только НБРБ (официальные курсы)
        Альтернативные источники используются только для информации.
        """
        # Пробуем получить курсы из НБРБ
        nbrb_rates = CurrencyRateService._get_nbrb_rates()
        
        # Если НБРБ дал курсы - возвращаем их
        if nbrb_rates and any(rate and rate.get("rate") for rate in nbrb_rates.values() if rate and rate.get("rate") != 1.0):
            return nbrb_rates
        
        # Если НБРБ не дал курсов - возвращаем fallback с информацией о статусе
        print("⚠️  НБРБ не дал актуальных курсов за сегодня")
        print("💡 Курсы будут обновлены автоматически когда НБРБ их опубликует")
        
        return CurrencyRateService._get_fallback_rates_with_info()

    @staticmethod
    def _get_nbrb_rates() -> dict[str, Any] | None:
        """Получает курсы из НБРБ используя правильный API"""
        try:
            result = {}
            
            # Получаем курсы для каждой валюты отдельно
            for currency in ["USD", "PLN"]:
                url = NBRB_BASE_URL.format(currency=currency)
                print(f"🔍 Получаю курс {currency} из НБРБ: {url}")
                
                response = requests.get(url, timeout=15)
                if response.status_code != 200:
                    print(f"❌ HTTP {response.status_code} для {currency}")
                    result[currency] = None
                    continue
                
                data = response.json()
                print(f"📊 {currency}: получен ответ от НБРБ")
                
                # Проверяем структуру ответа
                if "Cur_OfficialRate" in data and data["Cur_OfficialRate"] is not None:
                    rate = float(data["Cur_OfficialRate"])
                    scale = int(data.get("Cur_Scale", 1))
                    normalized_rate = rate / scale
                    
                    result[currency] = {
                        "rate": normalized_rate,
                        "scale": scale,
                        "source": "nbrb",
                        "date": data.get("Date", ""),
                        "status": "official"
                    }
                    print(f"✅ {currency}: {normalized_rate} BYN (scale: {scale})")
                else:
                    print(f"❌ {currency}: Cur_OfficialRate не найден или None")
                    result[currency] = None
            
            # BYN всегда базовая валюта
            result["BYN"] = {
                "rate": 1.0,
                "scale": 1,
                "source": "nbrb",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "base"
            }
            
            # Проверяем, получили ли мы хотя бы один курс
            if any(rate and rate.get("rate") for rate in result.values() if rate and rate.get("rate") != 1.0):
                print("🎯 Успешно получены курсы НБРБ!")
                return result
            else:
                print("❌ НБРБ не дал валидных курсов")
                return None
            
        except Exception as e:
            print(f"❌ Ошибка НБРБ: {e}")
            return None

    @staticmethod
    def _get_fallback_rates_with_info() -> dict[str, Any]:
        """Возвращает fallback курсы с информацией о статусе"""
        # Получаем информацию о рыночных курсах для сравнения
        market_info = CurrencyRateService._get_market_info()
        
        return {
            "BYN": {
                "rate": 1.0,
                "scale": 1,
                "source": "nbrb",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "base"
            },
            "USD": {
                "rate": 2.85,  # Более реалистичный курс USD (меньше 3)
                "scale": 1,
                "source": "fallback",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "nbrb_not_available",
                "market_rate": market_info.get("USD"),
                "note": "Официальный курс НБРБ еще не опубликован (используется примерный)"
            },
            "PLN": {
                "rate": 0.72,  # Более реалистичный курс PLN (меньше 0.8)
                "scale": 1,
                "source": "fallback",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "nbrb_not_available",
                "market_rate": market_info.get("PLN"),
                "note": "Официальный курс НБРБ еще не опубликован (используется примерный)"
            }
        }

    @staticmethod
    def _get_market_info() -> dict[str, Any]:
        """Получает информацию о рыночных курсах для сравнения (только для информации)"""
        market_info = {}
        
        try:
            # Пробуем exchangerate-api
            response = requests.get(EXCHANGERATE_API, timeout=10)
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                
                if "USD" in rates:
                    market_info["USD"] = {
                        "rate": 1.0 / float(rates["USD"]),
                        "source": "exchangerate-api",
                        "note": "Рыночный курс (не официальный НБРБ)"
                    }
                
                if "PLN" in rates:
                    market_info["PLN"] = {
                        "rate": 1.0 / float(rates["PLN"]),
                        "source": "exchangerate-api", 
                        "note": "Рыночный курс (не официальный НБРБ)"
                    }
        except:
            pass
        
        return market_info

    @staticmethod
    def get_currency_info() -> dict[str, Any]:
        """Получает информацию о доступных валютах и их курсах"""
        try:
            data = NBRBClient.fetch_all()
            result = {}
            
            for item in data:
                code = item.get("Cur_Abbreviation")
                if code in ["USD", "PLN", "BYN"]:
                    result[code] = {
                        "name": item.get("Cur_Name", ""),
                        "official_rate": item.get("Cur_OfficialRate"),
                        "scale": item.get("Cur_Scale", 1),
                        "date": item.get("Date", "")
                    }
            
            return result
        except Exception as e:
            return {"error": str(e)}


# Оставляем старый класс для обратной совместимости
class NBRBClient:
    @staticmethod
    def fetch_all() -> list[dict[str, Any]]:
        """Получает все курсы валют от НБРБ"""
        try:
            # Используем новый API для каждой валюты
            result = []
            for currency in ["USD", "PLN"]:
                url = NBRB_BASE_URL.format(currency=currency)
                resp = requests.get(url, timeout=20)
                if resp.status_code == 200:
                    result.append(resp.json())
            return result
        except requests.RequestException as e:
            raise Exception(f"Ошибка при запросе к НБРБ: {e}")

    @staticmethod
    def get_latest_available_rates() -> dict[str, Any]:
        """Получает последние доступные курсы валют (использует новый сервис)"""
        return CurrencyRateService.get_latest_rates()

    @staticmethod
    def extract_rate(items: list[dict[str, Any]], code: str) -> tuple[float, int]:
        """
        Возвращает (rate_normalized, scale) по коду валюты (USD/PLN/BYN).
        Для BYN возвращаем 1.0 (база), scale=1.
        Для USD/PLN ищем элементы с Cur_Abbreviation == code,
        используем Cur_OfficialRate и Cur_Scale для нормализации до 1 единицы.
        """
        if code == "BYN":
            return 1.0, 1
        
        for it in items:
            if it.get("Cur_Abbreviation") == code:
                # Проверяем, что Cur_OfficialRate не None и является числом
                official_rate = it.get("Cur_OfficialRate")
                if official_rate is None:
                    continue
                
                try:
                    scale = int(it.get("Cur_Scale", 1))
                    rate = float(official_rate) / scale
                    return rate, scale
                except (ValueError, TypeError):
                    continue
        
        # Если не нашли курс, возвращаем значения по умолчанию
        if code == "USD":
            return 2.85, 1  # Более реалистичный курс USD
        elif code == "PLN":
            return 0.72, 1  # Более реалистичный курс PLN
        
        raise ValueError(f"Rate for {code} not found in NBRB response")

    @staticmethod
    def get_currency_info() -> dict[str, Any]:
        """Получает информацию о доступных валютах и их курсах"""
        try:
            data = NBRBClient.fetch_all()
            result = {}
            
            for item in data:
                code = item.get("Cur_Abbreviation")
                if code in ["USD", "PLN", "BYN"]:
                    result[code] = {
                        "name": item.get("Cur_Name", ""),
                        "official_rate": item.get("Cur_OfficialRate"),
                        "scale": item.get("Cur_Scale", 1),
                        "date": item.get("Date", "")
                    }
            
            return result
        except Exception as e:
            return {"error": str(e)}
