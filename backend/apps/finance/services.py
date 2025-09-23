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


class HHVacancyService:
    """Сервис для работы с вакансиями hh.ru"""
    
    def __init__(self):
        self.api_url = "https://api.hh.ru/vacancies"
        self.headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    
    def fetch_vacancies(self, search_params: dict) -> dict:
        """Получает вакансии с hh.ru API"""
        try:
            response = requests.get(
                self.api_url, 
                params=search_params, 
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"❌ Ошибка API hh.ru: {e}")
            return {"items": [], "found": 0}
    
    def get_our_vacancies_list(self) -> list:
        """Получает список наших внутренних вакансий для унификации"""
        from apps.vacancies.models import Vacancy
        return list(Vacancy.objects.values_list('name', flat=True))
    
    def format_for_ai_analysis_with_vacancies(self, vacancy_data: dict) -> str:
        """Форматирует данные вакансии для AI анализа с предобработкой зарплаты"""
        snippet = vacancy_data.get('snippet', {})
        
        # Предобрабатываем зарплату (уже в USD)
        processed_salary = self.preprocess_salary(vacancy_data)
        
        # Извлекаем работу из schedule и work_format
        schedule = vacancy_data.get('schedule', {}).get('name', 'Не указано')
        work_formats = vacancy_data.get('work_format', [])
        work_format_str = ', '.join([wf.get('name', '') for wf in work_formats if wf.get('name')])
        
        return f"""ID вакансии: {vacancy_data.get('id', '')}

Название вакансии: {vacancy_data.get('name', '')}

Компания: {vacancy_data.get('employer', {}).get('name', '')}

Локация: {vacancy_data.get('area', {}).get('name', '')}

Опыт работы: {vacancy_data.get('experience', {}).get('name', '')}

Тип занятости: {vacancy_data.get('employment', {}).get('name', '')}

График работы: {schedule}

Формат работы: {work_format_str or 'Не указано'}

Зарплата (обработанная в USD):
- От: {processed_salary.get('salary_usd_from', 'не указано')} USD
- До: {processed_salary.get('salary_usd_to', 'не указано')} USD

Описание/требования: {snippet.get('requirement', '')}

Обязанности: {snippet.get('responsibility', '')}

Полное описание: {vacancy_data.get('description', '')}"""
    
    def preprocess_salary(self, vacancy_data: dict) -> dict:
        """Предобработка зарплаты с конвертацией в USD"""
        from .models import CurrencyRate, PLNTax, BenchmarkSettings
        
        settings = BenchmarkSettings.load() # Загружаем настройки для доступа к belarus_tax_rate
        
        salary_info = vacancy_data.get('salary', {})
        if not salary_info:
            return {"salary_usd_from": None, "salary_usd_to": None}
        
        original_currency = salary_info.get('currency', 'RUB')
        gross_from = salary_info.get('from')
        gross_to = salary_info.get('to')
        
        result = {}
        
        # Конвертируем зарплату в USD
        for amount, field in [(gross_from, 'salary_usd_from'), (gross_to, 'salary_usd_to')]:
            if not amount:
                result[field] = None
                continue
                
            try:
                gross_amount = Decimal(str(amount))
                
                if original_currency == 'PLN':
                    # PLN: gross -> net (с учетом польских налогов), потом в USD
                    net_amount = PLNTax.calculate_net_from_gross(gross_amount)
                    pln_rate = CurrencyRate.objects.get(code='PLN')
                    usd_amount = net_amount / pln_rate.rate
                    
                elif original_currency == 'BYN':
                    # BYN: gross -> net (с учетом белорусских налогов), потом в USD
                    # Используем настройку belarus_tax_rate
                    net_amount = gross_amount * (1 - settings.belarus_tax_rate / 100)
                    byn_rate = CurrencyRate.objects.get(code='BYN')
                    usd_amount = net_amount / byn_rate.rate
                    
                elif original_currency == 'USD':
                    # USD: считаем что это уже net сумма
                    usd_amount = gross_amount
                    
                elif original_currency == 'EUR':
                    # EUR: прямая конвертация в USD (курс примерно 1.1)
                    usd_amount = gross_amount * Decimal('1.1')
                    
                elif original_currency == 'BYR':
                    # BYR = BYN (1:1) - приравниваем как указано пользователем
                    byn_amount = gross_amount
                    # BYN gross -> net (с учетом белорусских налогов)
                    net_amount = byn_amount * (1 - settings.belarus_tax_rate / 100)
                    byn_rate = CurrencyRate.objects.get(code='BYN')
                    usd_amount = net_amount / byn_rate.rate
                    
                else:
                    # Для других валют - прямая конвертация, считаем что это net
                    try:
                        currency_rate = CurrencyRate.objects.get(code=original_currency)
                        usd_amount = gross_amount / currency_rate.rate
                    except CurrencyRate.DoesNotExist:
                        # Если курс не найден, возвращаем None
                        result[field] = None
                        continue
                        
                result[field] = usd_amount.quantize(Decimal('0.01'))
            except (CurrencyRate.DoesNotExist, ValueError, TypeError):
                result[field] = None
        
        return result


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
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    result.append(data)
            
            return result
        except Exception as e:
            print(f"Ошибка получения курсов НБРБ: {e}")
            return []