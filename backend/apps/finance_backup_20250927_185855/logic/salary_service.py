"""
Сервис для работы с зарплатными вилками
Объединяет логику из SalaryRange модели
"""
from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db import transaction


class SalaryService:
    """Сервис для работы с зарплатными вилками"""
    
    @staticmethod
    def calculate_byn_amounts(salary_min_usd: Decimal, salary_max_usd: Decimal) -> tuple[Optional[Decimal], Optional[Decimal]]:
        """Рассчитывает суммы в BYN на основе USD и курса валют"""
        try:
            from ..models import CurrencyRate
            usd_rate_obj = CurrencyRate.objects.get(code='USD')
            usd_rate = usd_rate_obj.rate
            
            min_byn = salary_min_usd * usd_rate if salary_min_usd is not None else None
            max_byn = salary_max_usd * usd_rate if salary_max_usd is not None else None
            
            return min_byn.quantize(Decimal('0.01')) if min_byn else None, \
                   max_byn.quantize(Decimal('0.01')) if max_byn else None
            
        except CurrencyRate.DoesNotExist:
            return None, None
        except Exception as e:
            print(f"Ошибка при расчете BYN сумм: {e}")
            return None, None
    
    @staticmethod
    def calculate_pln_amounts(salary_min_usd: Decimal, salary_max_usd: Decimal) -> tuple[Optional[Decimal], Optional[Decimal]]:
        """Рассчитывает суммы в PLN на основе USD и курса валют с учетом налогов"""
        try:
            from ..models import CurrencyRate
            from .tax_service import TaxService
            
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
            
        except CurrencyRate.DoesNotExist:
            return None, None
        except Exception as e:
            print(f"Ошибка при расчете PLN сумм: {e}")
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
        from ..models import SalaryRange
        updated_count = 0
        for salary_range in SalaryRange.objects.all():
            try:
                SalaryService.update_salary_range_currency_amounts(salary_range)
                updated_count += 1
            except Exception as e:
                print(f"Ошибка при обновлении вилки {salary_range.id}: {e}")
        
        return {"updated_count": updated_count}
    
    @staticmethod
    def create_salary_range(
        vacancy_id: int,
        grade_id: int,
        salary_min_usd: Decimal,
        salary_max_usd: Decimal,
        is_active: bool = True
    ) -> Dict[str, Any]:
        """
        Создает новую зарплатную вилку.
        
        Args:
            vacancy_id: ID вакансии
            grade_id: ID грейда
            salary_min_usd: Минимальная зарплата в USD
            salary_max_usd: Максимальная зарплата в USD
            is_active: Активна ли вилка
            
        Returns:
            Результат создания
        """
        from ..models import SalaryRange, Vacancy, Grade
        from .tax_service import TaxService
        from .currency_service import CurrencyService
        
        try:
            # Проверяем существование вакансии и грейда
            vacancy = Vacancy.objects.get(id=vacancy_id)
            grade = Grade.objects.get(id=grade_id)
            
            # Проверяем уникальность
            if SalaryRange.objects.filter(vacancy=vacancy, grade=grade).exists():
                return {
                    "success": False,
                    "message": f"Зарплатная вилка для {vacancy.name} ({grade.name}) уже существует"
                }
            
            with transaction.atomic():
                # Создаем зарплатную вилку
                salary_range = SalaryRange.objects.create(
                    vacancy=vacancy,
                    grade=grade,
                    salary_min_usd=salary_min_usd,
                    salary_max_usd=salary_max_usd,
                    is_active=is_active
                )
                
                # Автоматически рассчитываем суммы в других валютах
                SalaryService._calculate_currency_amounts(salary_range)
                
                return {
                    "success": True,
                    "message": "Зарплатная вилка успешно создана",
                    "salary_range": {
                        "id": salary_range.id,
                        "vacancy": vacancy.name,
                        "grade": grade.name,
                        "salary_range_usd": salary_range.salary_range_usd,
                        "salary_range_byn": salary_range.salary_range_byn,
                        "salary_range_pln": salary_range.salary_range_pln
                    }
                }
                
        except Vacancy.DoesNotExist:
            return {
                "success": False,
                "message": f"Вакансия с ID {vacancy_id} не найдена"
            }
        except Grade.DoesNotExist:
            return {
                "success": False,
                "message": f"Грейд с ID {grade_id} не найден"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Ошибка при создании зарплатной вилки: {str(e)}"
            }
    
    @staticmethod
    def update_salary_range(
        salary_range_id: int,
        salary_min_usd: Optional[Decimal] = None,
        salary_max_usd: Optional[Decimal] = None,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Обновляет зарплатную вилку.
        
        Args:
            salary_range_id: ID зарплатной вилки
            salary_min_usd: Новая минимальная зарплата в USD
            salary_max_usd: Новая максимальная зарплата в USD
            is_active: Новый статус активности
            
        Returns:
            Результат обновления
        """
        from ..models import SalaryRange
        
        try:
            salary_range = SalaryRange.objects.get(id=salary_range_id)
            
            with transaction.atomic():
                # Обновляем поля если они переданы
                if salary_min_usd is not None:
                    salary_range.salary_min_usd = salary_min_usd
                if salary_max_usd is not None:
                    salary_range.salary_max_usd = salary_max_usd
                if is_active is not None:
                    salary_range.is_active = is_active
                
                salary_range.save()
                
                # Пересчитываем суммы в других валютах
                SalaryService._calculate_currency_amounts(salary_range)
                
                return {
                    "success": True,
                    "message": "Зарплатная вилка успешно обновлена",
                    "salary_range": {
                        "id": salary_range.id,
                        "vacancy": salary_range.vacancy.name,
                        "grade": salary_range.grade.name,
                        "salary_range_usd": salary_range.salary_range_usd,
                        "salary_range_byn": salary_range.salary_range_byn,
                        "salary_range_pln": salary_range.salary_range_pln
                    }
                }
                
        except SalaryRange.DoesNotExist:
            return {
                "success": False,
                "message": f"Зарплатная вилка с ID {salary_range_id} не найдена"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Ошибка при обновлении зарплатной вилки: {str(e)}"
            }
    
    @staticmethod
    def delete_salary_range(salary_range_id: int) -> Dict[str, Any]:
        """
        Удаляет зарплатную вилку.
        
        Args:
            salary_range_id: ID зарплатной вилки
            
        Returns:
            Результат удаления
        """
        from ..models import SalaryRange
        
        try:
            salary_range = SalaryRange.objects.get(id=salary_range_id)
            vacancy_name = salary_range.vacancy.name
            grade_name = salary_range.grade.name
            
            salary_range.delete()
            
            return {
                "success": True,
                "message": f"Зарплатная вилка для {vacancy_name} ({grade_name}) успешно удалена"
            }
            
        except SalaryRange.DoesNotExist:
            return {
                "success": False,
                "message": f"Зарплатная вилка с ID {salary_range_id} не найдена"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Ошибка при удалении зарплатной вилки: {str(e)}"
            }
    
    @staticmethod
    def get_salary_range_stats() -> Dict[str, Any]:
        """
        Получает статистику по зарплатным вилкам.
        
        Returns:
            Статистика по зарплатным вилкам
        """
        from ..models import SalaryRange, Vacancy, Grade
        
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
    
    @staticmethod
    def update_all_currency_amounts() -> Dict[str, Any]:
        """
        Обновляет курсы валют для всех зарплатных вилок.
        
        Returns:
            Результат обновления
        """
        from ..models import SalaryRange
        
        try:
            salary_ranges = SalaryRange.objects.all()
            updated_count = 0
            
            for salary_range in salary_ranges:
                SalaryService._calculate_currency_amounts(salary_range)
                updated_count += 1
            
            return {
                "success": True,
                "message": f"Курсы валют для {updated_count} зарплатных вилок успешно обновлены",
                "updated_count": updated_count
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Ошибка при обновлении курсов: {str(e)}",
                "updated_count": 0
            }
    
    @staticmethod
    def _calculate_currency_amounts(salary_range) -> None:
        """
        Рассчитывает суммы в других валютах для зарплатной вилки.
        
        Args:
            salary_range: Объект SalaryRange
        """
        from .currency_service import CurrencyService
        from .tax_service import TaxService
        
        try:
            # Получаем курсы валют
            usd_rate = CurrencyService.convert_amount(Decimal('1'), 'USD', 'BYN')
            pln_rate = CurrencyService.convert_amount(Decimal('1'), 'PLN', 'BYN')
            
            # Рассчитываем суммы в BYN
            if salary_range.salary_min_usd:
                salary_range.salary_min_byn = (
                    salary_range.salary_min_usd * usd_rate['converted_amount']
                ).quantize(Decimal('0.01'))
            
            if salary_range.salary_max_usd:
                salary_range.salary_max_byn = (
                    salary_range.salary_max_usd * usd_rate['converted_amount']
                ).quantize(Decimal('0.01'))
            
            # Рассчитываем суммы в PLN с учетом налогов
            if salary_range.salary_min_usd:
                # USD -> BYN -> PLN (с учетом налогов)
                byn_amount = salary_range.salary_min_usd * usd_rate['converted_amount']
                pln_gross = byn_amount / pln_rate['converted_amount']
                
                # Применяем налоговую формулу
                salary_range.salary_min_pln = TaxService.calculate_gross_from_net(
                    pln_gross, "PLN"
                ).quantize(Decimal('0.01'))
            
            if salary_range.salary_max_usd:
                # USD -> BYN -> PLN (с учетом налогов)
                byn_amount = salary_range.salary_max_usd * usd_rate['converted_amount']
                pln_gross = byn_amount / pln_rate['converted_amount']
                
                # Применяем налоговую формулу
                salary_range.salary_max_pln = TaxService.calculate_gross_from_net(
                    pln_gross, "PLN"
                ).quantize(Decimal('0.01'))
            
            salary_range.save(update_fields=[
                'salary_min_byn', 'salary_max_byn', 
                'salary_min_pln', 'salary_max_pln'
            ])
            
        except Exception as e:
            print(f"Ошибка при расчете валют для зарплатной вилки {salary_range.id}: {e}")
    
    @staticmethod
    def get_salary_ranges_by_vacancy(vacancy_id: int) -> List[Dict[str, Any]]:
        """
        Получает все зарплатные вилки для вакансии.
        
        Args:
            vacancy_id: ID вакансии
            
        Returns:
            Список зарплатных вилок
        """
        from ..models import SalaryRange
        
        salary_ranges = SalaryRange.objects.filter(
            vacancy_id=vacancy_id, is_active=True
        ).select_related('grade').order_by('grade__name')
        
        return [
            {
                "id": sr.id,
                "grade": sr.grade.name,
                "salary_range_usd": sr.salary_range_usd,
                "salary_range_byn": sr.salary_range_byn,
                "salary_range_pln": sr.salary_range_pln
            }
            for sr in salary_ranges
        ]
    
    @staticmethod
    def get_salary_ranges_by_grade(grade_id: int) -> List[Dict[str, Any]]:
        """
        Получает все зарплатные вилки для грейда.
        
        Args:
            grade_id: ID грейда
            
        Returns:
            Список зарплатных вилок
        """
        from ..models import SalaryRange
        
        salary_ranges = SalaryRange.objects.filter(
            grade_id=grade_id, is_active=True
        ).select_related('vacancy').order_by('vacancy__name')
        
        return [
            {
                "id": sr.id,
                "vacancy": sr.vacancy.name,
                "salary_range_usd": sr.salary_range_usd,
                "salary_range_byn": sr.salary_range_byn,
                "salary_range_pln": sr.salary_range_pln
            }
            for sr in salary_ranges
        ]
