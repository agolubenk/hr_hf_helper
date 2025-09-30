"""
Сервис для работы с зарплатными вилками
Переиспользуемый компонент для всех приложений
"""
from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db import transaction


class SalaryService:
    """Сервис для работы с зарплатными вилками
    
    Этот сервис предназначен для переиспользования в различных приложениях
    для расчета зарплатных вилок в разных валютах.
    """
    
    @staticmethod
    def calculate_byn_amounts(salary_min_usd: Decimal, salary_max_usd: Decimal) -> tuple[Optional[Decimal], Optional[Decimal]]:
        """Рассчитывает суммы в BYN на основе USD и курса валют"""
        try:
            # Импортируем модель только при необходимости
            from apps.finance.models import CurrencyRate
            
            usd_rate_obj = CurrencyRate.objects.get(code='USD')
            usd_rate = usd_rate_obj.rate
            
            min_byn = salary_min_usd * usd_rate if salary_min_usd is not None else None
            max_byn = salary_max_usd * usd_rate if salary_max_usd is not None else None
            
            return min_byn.quantize(Decimal('0.01')) if min_byn else None, \
                   max_byn.quantize(Decimal('0.01')) if max_byn else None
            
        except Exception:
            return None, None
    
    @staticmethod
    def calculate_pln_amounts(salary_min_usd: Decimal, salary_max_usd: Decimal) -> tuple[Optional[Decimal], Optional[Decimal]]:
        """Рассчитывает суммы в PLN на основе USD и курса валют с учетом налогов"""
        try:
            # Импортируем модели только при необходимости
            from apps.finance.models import CurrencyRate
            from logic.finance.tax_service import TaxService
            
            usd_rate_obj = CurrencyRate.objects.get(code='USD')
            pln_rate_obj = CurrencyRate.objects.get(code='PLN')
            
            usd_rate = usd_rate_obj.rate
            pln_to_byn_rate = pln_rate_obj.rate # Сколько BYN за 1 PLN
            
            min_pln = None
            max_pln = None
            
            if salary_min_usd is not None:
                # USD -> BYN
                byn_amount = salary_min_usd * usd_rate
                # BYN -> PLN (Gross)
                pln_gross = byn_amount / pln_to_byn_rate
                # PLN Gross -> PLN Net (с учетом польских налогов)
                min_pln = TaxService.calculate_gross_from_net(pln_gross, currency="PLN")
                
            if salary_max_usd is not None:
                # USD -> BYN
                byn_amount = salary_max_usd * usd_rate
                # BYN -> PLN (Gross)
                pln_gross = byn_amount / pln_to_byn_rate
                # PLN Gross -> PLN Net (с учетом польских налогов)
                max_pln = TaxService.calculate_gross_from_net(pln_gross, currency="PLN")
            
            return min_pln.quantize(Decimal('0.01')) if min_pln else None, \
                   max_pln.quantize(Decimal('0.01')) if max_pln else None
            
        except Exception:
            return None, None
    
    @staticmethod
    def update_salary_range_currency_amounts(salary_range):
        """Обновляет суммы в других валютах для одной зарплатной вилки"""
        min_byn, max_byn = SalaryService.calculate_byn_amounts(
            salary_range.salary_min_usd, salary_range.salary_max_usd
        )
        min_pln, max_pln = SalaryService.calculate_pln_amounts(
            salary_range.salary_min_usd, salary_range.salary_max_usd
        )
        
        salary_range.salary_min_byn = min_byn
        salary_range.salary_max_byn = max_byn
        salary_range.salary_min_pln = min_pln
        salary_range.salary_max_pln = max_pln
        
        salary_range.save(update_fields=['salary_min_byn', 'salary_max_byn', 'salary_min_pln', 'salary_max_pln'])
    
    @staticmethod
    def update_all_salary_currency_amounts():
        """Обновляет суммы в других валютах для всех зарплатных вилок"""
        try:
            # Импортируем модель только при необходимости
            from apps.finance.models import SalaryRange
            
            updated_count = 0
            for salary_range in SalaryRange.objects.all():
                try:
                    SalaryService.update_salary_range_currency_amounts(salary_range)
                    updated_count += 1
                except Exception as e:
                    print(f"Ошибка при обновлении вилки {salary_range.id}: {e}")
            
            return {"updated_count": updated_count}
            
        except Exception:
            return {"updated_count": 0}
    
    @staticmethod
    def get_salary_range_stats() -> Dict[str, Any]:
        """
        Получает статистику по зарплатным вилкам.
        
        Returns:
            Статистика по зарплатным вилкам
        """
        try:
            # Импортируем модели только при необходимости
            from apps.finance.models import SalaryRange, Vacancy, Grade
            
            total_ranges = SalaryRange.objects.count()
            active_ranges = SalaryRange.objects.filter(is_active=True).count()
            inactive_ranges = SalaryRange.objects.filter(is_active=False).count()
            
            # Статистика по вакансиям
            vacancy_stats = {}
            for vacancy in Vacancy.objects.all():
                ranges_count = SalaryRange.objects.filter(vacancy=vacancy).count()
                if ranges_count > 0:
                    vacancy_stats[vacancy.name] = ranges_count
            
            # Статистика по грейдам
            grade_stats = {}
            for grade in Grade.objects.all():
                ranges_count = SalaryRange.objects.filter(grade=grade).count()
                if ranges_count > 0:
                    grade_stats[grade.name] = ranges_count
            
            # Средние зарплаты
            from django.db import models
            avg_min_salary = SalaryRange.objects.filter(is_active=True).aggregate(
                avg_min=models.Avg('salary_min_usd')
            )['avg_min'] or Decimal('0')
            
            avg_max_salary = SalaryRange.objects.filter(is_active=True).aggregate(
                avg_max=models.Avg('salary_max_usd')
            )['avg_max'] or Decimal('0')
            
            return {
                "total_ranges": total_ranges,
                "active_ranges": active_ranges,
                "inactive_ranges": inactive_ranges,
                "vacancy_stats": vacancy_stats,
                "grade_stats": grade_stats,
                "average_salaries": {
                    "min_usd": float(avg_min_salary),
                    "max_usd": float(avg_max_salary)
                }
            }
            
        except Exception:
            return {
                "total_ranges": 0,
                "active_ranges": 0,
                "inactive_ranges": 0,
                "vacancy_stats": {},
                "grade_stats": {},
                "average_salaries": {
                    "min_usd": 0,
                    "max_usd": 0
                }
            }

