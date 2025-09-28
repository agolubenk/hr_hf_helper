"""
Унифицированный сервис для налоговых расчетов
Объединяет логику из models.py, pln_tax_services.py и SalaryRange
"""
from decimal import Decimal
from typing import Dict, Any, List
# from django.db import transaction  # Не используется в данном файле


class TaxService:
    """Унифицированный сервис для всех налоговых расчетов"""
    
    @staticmethod
    def calculate_gross_from_net(net_amount: Decimal, currency: str = "PLN") -> Decimal:
        """
        Рассчитывает gross сумму из net суммы с учетом всех активных налогов.
        
        Args:
            net_amount: Net сумма
            currency: Валюта (PLN, BYN, USD)
            
        Returns:
            Gross сумма
        """
        from ..models import PLNTax
        
        if currency != "PLN":
            # Для других валют пока возвращаем net сумму
            return net_amount
        
        active_taxes = PLNTax.objects.filter(is_active=True)
        
        if not active_taxes.exists():
            return net_amount
        
        # Суммируем все налоговые ставки
        total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        # Gross = Net / (1 - общая_налоговая_ставка)
        if total_tax_rate >= 1:
            # Если общая ставка >= 100%, возвращаем net сумму
            return net_amount
        
        gross_amount = net_amount / (1 - total_tax_rate)
        return gross_amount.quantize(Decimal('0.01'))
    
    @staticmethod
    def calculate_net_from_gross(gross_amount: Decimal, currency: str = "PLN") -> Decimal:
        """
        Рассчитывает net сумму из gross суммы с учетом всех активных налогов.
        
        Args:
            gross_amount: Gross сумма
            currency: Валюта (PLN, BYN, USD)
            
        Returns:
            Net сумма
        """
        from ..models import PLNTax
        
        if currency != "PLN":
            # Для других валют пока возвращаем gross сумму
            return gross_amount
        
        active_taxes = PLNTax.objects.filter(is_active=True)
        
        if not active_taxes.exists():
            return gross_amount
        
        # Суммируем все налоговые ставки
        total_tax_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        # Net = Gross * (1 - общая_налоговая_ставка)
        net_amount = gross_amount * (1 - total_tax_rate)
        return net_amount.quantize(Decimal('0.01'))
    
    @staticmethod
    def get_tax_breakdown(gross_amount: Decimal, currency: str = "PLN") -> Dict[str, Any]:
        """
        Получает детализацию налогов для gross суммы.
        
        Args:
            gross_amount: Gross сумма
            currency: Валюта (PLN, BYN, USD)
            
        Returns:
            Словарь с детализацией налогов
        """
        from ..models import PLNTax
        
        if currency != "PLN":
            return {
                'total_tax_amount': Decimal('0'),
                'net_amount': gross_amount,
                'gross_amount': gross_amount,
                'taxes': [],
                'total_tax_rate_percent': 0
            }
        
        active_taxes = PLNTax.objects.filter(is_active=True)
        
        if not active_taxes.exists():
            return {
                'total_tax_amount': Decimal('0'),
                'net_amount': gross_amount,
                'gross_amount': gross_amount,
                'taxes': [],
                'total_tax_rate_percent': 0
            }
        
        taxes = []
        total_tax_amount = Decimal('0')
        
        for tax in active_taxes:
            tax_amount = gross_amount * tax.rate_decimal
            taxes.append({
                'name': tax.name,
                'rate': tax.rate,
                'rate_decimal': tax.rate_decimal,
                'amount': tax_amount.quantize(Decimal('0.01'))
            })
            total_tax_amount += tax_amount
        
        net_amount = gross_amount - total_tax_amount
        total_tax_rate_percent = sum(tax.rate for tax in active_taxes)
        
        return {
            'total_tax_amount': total_tax_amount.quantize(Decimal('0.01')),
            'net_amount': net_amount.quantize(Decimal('0.01')),
            'gross_amount': gross_amount,
            'taxes': taxes,
            'total_tax_rate_percent': total_tax_rate_percent
        }
    
    @staticmethod
    def calculate_salary_with_taxes(
        net_amount: Decimal,
        currency_from: str = "PLN",
        currency_to: str = "BYN"
    ) -> Dict[str, Any]:
        """
        Рассчитывает зарплату с налогами и конвертацией валют.
        
        Args:
            net_amount: Net сумма в исходной валюте
            currency_from: Исходная валюта
            currency_to: Целевая валюта
            
        Returns:
            Словарь с детальным расчетом
        """
        from .currency_service import CurrencyService
        
        result = {
            'net_amount_original': net_amount,
            'gross_amount_original': Decimal('0'),
            'total_tax_amount_original': Decimal('0'),
            'tax_breakdown': [],
            'currency_conversion': {},
            'final_amounts': {}
        }
        
        # Рассчитываем gross сумму в исходной валюте
        gross_amount = TaxService.calculate_gross_from_net(net_amount, currency_from)
        result['gross_amount_original'] = gross_amount
        
        # Получаем детализацию налогов
        breakdown = TaxService.get_tax_breakdown(gross_amount, currency_from)
        result['total_tax_amount_original'] = breakdown['total_tax_amount']
        result['tax_breakdown'] = breakdown['taxes']
        
        # Конвертируем валюты если нужно
        if currency_from != currency_to:
            conversion_result = CurrencyService.convert_amount(
                gross_amount, currency_from, currency_to
            )
            result['currency_conversion'] = conversion_result
            result['final_amounts'] = {
                'gross': conversion_result['converted_amount'],
                'net': conversion_result['converted_amount'] - breakdown['total_tax_amount'],
                'currency': currency_to
            }
        else:
            result['final_amounts'] = {
                'gross': gross_amount,
                'net': net_amount,
                'currency': currency_from
            }
        
        return result
    
    @staticmethod
    def get_tax_summary() -> Dict[str, Any]:
        """
        Получает сводку по налогам.
        
        Returns:
            Информацию об активных налогах и общей ставке
        """
        from ..models import PLNTax
        
        active_taxes = PLNTax.objects.filter(is_active=True)
        inactive_taxes = PLNTax.objects.filter(is_active=False)
        
        total_tax_rate = sum(tax.rate for tax in active_taxes)
        
        return {
            'active_taxes_count': active_taxes.count(),
            'inactive_taxes_count': inactive_taxes.count(),
            'total_tax_rate_percent': total_tax_rate,
            'active_taxes': [
                {
                    'name': tax.name,
                    'rate': tax.rate,
                    'rate_decimal': tax.rate_decimal
                }
                for tax in active_taxes
            ],
            'inactive_taxes': [
                {
                    'name': tax.name,
                    'rate': tax.rate,
                    'rate_decimal': tax.rate_decimal
                }
                for tax in inactive_taxes
            ]
        }
    
    @staticmethod
    def calculate_multiple_salaries(salaries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Рассчитывает налоги для нескольких зарплат.
        
        Args:
            salaries: Список словарей с данными зарплат
            
        Returns:
            Результаты расчетов с итоговой сводкой
        """
        results = []
        total_gross = Decimal('0')
        total_net = Decimal('0')
        total_tax = Decimal('0')
        
        for salary_data in salaries:
            net_amount = Decimal(str(salary_data.get('net_amount', 0)))
            currency = salary_data.get('currency', 'PLN')
            
            calculation = TaxService.calculate_salary_with_taxes(
                net_amount, currency, currency
            )
            
            results.append({
                'input': salary_data,
                'calculation': calculation
            })
            
            total_gross += calculation['final_amounts']['gross']
            total_net += calculation['final_amounts']['net']
            total_tax += calculation['total_tax_amount_original']
        
        return {
            'individual_calculations': results,
            'summary': {
                'total_gross': total_gross,
                'total_net': total_net,
                'total_tax': total_tax,
                'count': len(salaries),
                'average_gross': total_gross / len(salaries) if salaries else Decimal('0'),
                'average_net': total_net / len(salaries) if salaries else Decimal('0'),
                'average_tax': total_tax / len(salaries) if salaries else Decimal('0')
            }
        }
