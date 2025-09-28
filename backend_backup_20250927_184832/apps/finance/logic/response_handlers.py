"""
Универсальные обработчики ответов для Finance приложения
Объединяет логику обработки JSON и HTML ответов
"""
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.contrib import messages
from typing import Dict, Any, Optional, Callable
import json


class APIResponseHandler:
    """Обработчик API ответов"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Success") -> JsonResponse:
        """
        Создает успешный JSON ответ.
        
        Args:
            data: Данные для возврата
            message: Сообщение об успехе
            
        Returns:
            JsonResponse с успешным ответом
        """
        response_data = {
            'success': True,
            'message': message
        }
        
        if data is not None:
            response_data['data'] = data
        
        return JsonResponse(response_data)
    
    @staticmethod
    def error(message: str = "Error", code: Optional[str] = None, data: Any = None) -> JsonResponse:
        """
        Создает ошибочный JSON ответ.
        
        Args:
            message: Сообщение об ошибке
            code: Код ошибки
            data: Дополнительные данные
            
        Returns:
            JsonResponse с ошибочным ответом
        """
        response_data = {
            'success': False,
            'message': message
        }
        
        if code:
            response_data['code'] = code
        
        if data is not None:
            response_data['data'] = data
        
        return JsonResponse(response_data)
    
    @staticmethod
    def validation_error(errors: Dict[str, Any]) -> JsonResponse:
        """
        Создает ответ с ошибками валидации.
        
        Args:
            errors: Словарь с ошибками валидации
            
        Returns:
            JsonResponse с ошибками валидации
        """
        return JsonResponse({
            'success': False,
            'message': 'Ошибки валидации',
            'errors': errors
        })


class TemplateResponseHandler:
    """Обработчик HTML ответов"""
    
    @staticmethod
    def render_template(
        request,
        template_name: str,
        context: Optional[Dict[str, Any]] = None,
        success_message: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> HttpResponse:
        """
        Рендерит HTML шаблон с контекстом.
        
        Args:
            request: HTTP запрос
            template_name: Имя шаблона
            context: Контекст для шаблона
            success_message: Сообщение об успехе
            error_message: Сообщение об ошибке
            
        Returns:
            HttpResponse с отрендеренным шаблоном
        """
        if context is None:
            context = {}
        
        if success_message:
            messages.success(request, success_message)
        
        if error_message:
            messages.error(request, error_message)
        
        return render(request, template_name, context)


class UniversalViewHandler:
    """Универсальный обработчик для views"""
    
    @staticmethod
    def handle_request(
        request,
        handler_func: Callable,
        template_name: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        success_message: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> HttpResponse:
        """
        Универсальная функция для обработки запросов.
        
        Args:
            request: HTTP запрос
            handler_func: Функция-обработчик
            template_name: Имя шаблона (для HTML ответов)
            context: Контекст для шаблона
            success_message: Сообщение об успехе
            error_message: Сообщение об ошибке
            
        Returns:
            HttpResponse (JSON или HTML)
        """
        try:
            # Вызываем функцию-обработчик
            result = handler_func(request)
            
            # Если результат - словарь, это API ответ
            if isinstance(result, dict):
                if result.get('success', False):
                    return APIResponseHandler.success(
                        data=result.get('data'),
                        message=result.get('message', success_message or 'Success')
                    )
                else:
                    return APIResponseHandler.error(
                        message=result.get('message', error_message or 'Error'),
                        code=result.get('code'),
                        data=result.get('data')
                    )
            
            # Если результат - HttpResponse, возвращаем как есть
            elif isinstance(result, HttpResponse):
                return result
            
            # Иначе возвращаем как данные
            else:
                return APIResponseHandler.success(data=result)
                
        except Exception as e:
            # Обработка исключений
            error_msg = error_message or f'Ошибка: {str(e)}'
            
            if template_name:
                # Для HTML ответов показываем ошибку в шаблоне
                return TemplateResponseHandler.render_template(
                    request, template_name, context, error_message=error_msg
                )
            else:
                # Для API ответов возвращаем JSON
                return APIResponseHandler.error(message=error_msg)
    
    @staticmethod
    def handle_api_request(
        request,
        handler_func: Callable,
        success_message: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> JsonResponse:
        """
        Обработчик для API запросов.
        
        Args:
            request: HTTP запрос
            handler_func: Функция-обработчик
            success_message: Сообщение об успехе
            error_message: Сообщение об ошибке
            
        Returns:
            JsonResponse
        """
        try:
            result = handler_func(request)
            
            if isinstance(result, dict):
                if result.get('success', False):
                    return APIResponseHandler.success(
                        data=result.get('data'),
                        message=result.get('message', success_message or 'Success')
                    )
                else:
                    return APIResponseHandler.error(
                        message=result.get('message', error_message or 'Error'),
                        code=result.get('code'),
                        data=result.get('data')
                    )
            else:
                return APIResponseHandler.success(data=result)
                
        except Exception as e:
            error_msg = error_message or f'Ошибка: {str(e)}'
            return APIResponseHandler.error(message=error_msg)
    
    @staticmethod
    def handle_template_request(
        request,
        handler_func: Callable,
        template_name: str,
        context: Optional[Dict[str, Any]] = None,
        success_message: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> HttpResponse:
        """
        Обработчик для HTML запросов.
        
        Args:
            request: HTTP запрос
            handler_func: Функция-обработчик
            template_name: Имя шаблона
            context: Контекст для шаблона
            success_message: Сообщение об успехе
            error_message: Сообщение об ошибке
            
        Returns:
            HttpResponse
        """
        try:
            result = handler_func(request)
            
            # Если результат - словарь с данными для контекста
            if isinstance(result, dict):
                if context is None:
                    context = {}
                context.update(result)
            
            return TemplateResponseHandler.render_template(
                request, template_name, context, success_message, error_message
            )
            
        except Exception as e:
            error_msg = error_message or f'Ошибка: {str(e)}'
            return TemplateResponseHandler.render_template(
                request, template_name, context, error_message=error_msg
            )


class ValidationHandler:
    """Обработчик валидации"""
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: list) -> Optional[Dict[str, Any]]:
        """
        Проверяет наличие обязательных полей.
        
        Args:
            data: Данные для проверки
            required_fields: Список обязательных полей
            
        Returns:
            Словарь с ошибками или None если все ОК
        """
        errors = {}
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = f'Поле {field} обязательно'
        
        return errors if errors else None
    
    @staticmethod
    def validate_numeric_field(value: Any, field_name: str, min_value: Optional[float] = None, max_value: Optional[float] = None) -> Optional[str]:
        """
        Проверяет числовое поле.
        
        Args:
            value: Значение для проверки
            field_name: Имя поля
            min_value: Минимальное значение
            max_value: Максимальное значение
            
        Returns:
            Сообщение об ошибке или None если все ОК
        """
        try:
            numeric_value = float(value)
            
            if min_value is not None and numeric_value < min_value:
                return f'{field_name} должно быть не менее {min_value}'
            
            if max_value is not None and numeric_value > max_value:
                return f'{field_name} должно быть не более {max_value}'
            
            return None
            
        except (ValueError, TypeError):
            return f'{field_name} должно быть числом'
    
    @staticmethod
    def validate_decimal_field(value: Any, field_name: str, min_value: Optional[float] = None, max_value: Optional[float] = None) -> Optional[str]:
        """
        Проверяет поле с десятичным числом.
        
        Args:
            value: Значение для проверки
            field_name: Имя поля
            min_value: Минимальное значение
            max_value: Максимальное значение
            
        Returns:
            Сообщение об ошибке или None если все ОК
        """
        from decimal import Decimal, InvalidOperation
        
        try:
            decimal_value = Decimal(str(value))
            
            if min_value is not None and decimal_value < Decimal(str(min_value)):
                return f'{field_name} должно быть не менее {min_value}'
            
            if max_value is not None and decimal_value > Decimal(str(max_value)):
                return f'{field_name} должно быть не более {max_value}'
            
            return None
            
        except (InvalidOperation, ValueError, TypeError):
            return f'{field_name} должно быть десятичным числом'
