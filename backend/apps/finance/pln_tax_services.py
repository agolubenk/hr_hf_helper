from decimal import Decimal
from typing import Dict, Any


class PLNTaxCalculationService:
    """Сервис для расчета налогов PLN и конвертации валют"""
    
    @staticmethod
    def calculate_salary_with_taxes(
        net_amount_pln: Decimal,
        currency_from: str = "PLN",
        currency_to: str = "BYN"
    ) -> Dict[str, Any]:
        """
        Рассчитывает зарплату с налогами и конвертацией валют.
        
        Args:
            net_amount_pln: Net сумма в PLN
            currency_from: Исходная валюта (по умолчанию PLN)
            currency_to: Целевая валюта (по умолчанию BYN)
            
        Returns:
            Словарь с детальным расчетом
        """
        from .models import PLNTax, CurrencyRate
        
        result = {
            'net_amount_pln': net_amount_pln,
            'gross_amount_pln': Decimal('0'),
            'total_tax_amount_pln': Decimal('0'),
            'tax_breakdown': [],
            'currency_conversion': {},
            'final_amounts': {}
        }
        
        # Рассчитываем gross сумму в PLN
        gross_amount_pln = PLNTax.calculate_gross_from_net(net_amount_pln)
        result['gross_amount_pln'] = gross_amount_pln
        
        # Получаем детализацию налогов
        breakdown = PLNTax.get_tax_breakdown(gross_amount_pln)
        result['total_tax_amount_pln'] = breakdown['total_tax_amount']
        result['tax_breakdown'] = breakdown['taxes']
        
        # Конвертируем валюты если нужно
        if currency_from != currency_to:
            try:
                # Получаем курсы валют
                from_rate = CurrencyRate.objects.get(code=currency_from)
                to_rate = CurrencyRate.objects.get(code=currency_to)
                
                # Конвертируем gross сумму
                gross_in_base = gross_amount_pln * from_rate.rate
                gross_converted = gross_in_base / to_rate.rate
                
                # Конвертируем net сумму
                net_in_base = net_amount_pln * from_rate.rate
                net_converted = net_in_base / to_rate.rate
                
                result['currency_conversion'] = {
                    'from_currency': currency_from,
                    'to_currency': currency_to,
                    'from_rate': float(from_rate.rate),
                    'to_rate': float(to_rate.rate),
                    'gross_converted': float(gross_converted.quantize(Decimal('0.01'))),
                    'net_converted': float(net_converted.quantize(Decimal('0.01')))
                }
                
                result['final_amounts'] = {
                    'gross': float(gross_converted.quantize(Decimal('0.01'))),
                    'net': float(net_converted.quantize(Decimal('0.01'))),
                    'currency': currency_to
                }
                
            except CurrencyRate.DoesNotExist:
                result['currency_conversion'] = {'error': 'Курс валюты не найден'}
                result['final_amounts'] = {
                    'gross': float(gross_amount_pln),
                    'net': float(net_amount_pln),
                    'currency': currency_from
                }
        else:
            result['final_amounts'] = {
                'gross': float(gross_amount_pln),
                'net': float(net_amount_pln),
                'currency': currency_from
            }
        
        return result
    
    @staticmethod
    def get_tax_summary() -> Dict[str, Any]:
        """Возвращает сводку по налогам PLN"""
        from .models import PLNTax
        
        active_taxes = PLNTax.objects.filter(is_active=True)
        total_rate = sum(tax.rate_decimal for tax in active_taxes)
        
        return {
            'active_taxes_count': active_taxes.count(),
            'total_tax_rate': float(total_rate),
            'total_tax_rate_percent': float(total_rate * 100),
            'taxes': [
                {
                    'id': tax.id,
                    'name': tax.name,
                    'rate': float(tax.rate),
                    'rate_decimal': float(tax.rate_decimal)
                }
                for tax in active_taxes
            ]
        }
    
    @staticmethod
    def calculate_multiple_salaries(
        salaries: list[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Рассчитывает налоги для нескольких зарплат.
        
        Args:
            salaries: Список словарей с данными зарплат
                     [{'net_amount': Decimal, 'currency_from': str, 'currency_to': str}, ...]
        
        Returns:
            Словарь с результатами расчетов
        """
        results = []
        total_gross = Decimal('0')
        total_net = Decimal('0')
        
        for salary_data in salaries:
            net_amount = Decimal(str(salary_data.get('net_amount', 0)))
            currency_from = salary_data.get('currency_from', 'PLN')
            currency_to = salary_data.get('currency_to', 'BYN')
            
            calculation = PLNTaxCalculationService.calculate_salary_with_taxes(
                net_amount, currency_from, currency_to
            )
            
            results.append(calculation)
            total_gross += Decimal(str(calculation['final_amounts']['gross']))
            total_net += Decimal(str(calculation['final_amounts']['net']))
        
        return {
            'calculations': results,
            'summary': {
                'total_gross': float(total_gross.quantize(Decimal('0.01'))),
                'total_net': float(total_net.quantize(Decimal('0.01'))),
                'total_tax': float((total_gross - total_net).quantize(Decimal('0.01'))),
                'count': len(salaries)
            }
        }
