"""
Универсальные обработчики ответов
Содержит общую логику для формирования ответов в views.py и views_api.py
"""

from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status


class ResponseHandler:
    """Универсальный обработчик ответов"""
    
    @staticmethod
    def success_response(data=None, message=None, status_code=200):
        """
        Универсальный успешный ответ для Django views
        
        Args:
            data: Данные для ответа
            message: Сообщение
            status_code: HTTP статус код
            
        Returns:
            JsonResponse: Успешный ответ
        """
        response_data = {'success': True}
        
        if data is not None:
            response_data.update(data)
        
        if message:
            response_data['message'] = message
        
        return JsonResponse(response_data, status=status_code)
    
    @staticmethod
    def error_response(message, status_code=400, data=None):
        """
        Универсальный ответ об ошибке для Django views
        
        Args:
            message: Сообщение об ошибке
            status_code: HTTP статус код
            data: Дополнительные данные
            
        Returns:
            JsonResponse: Ответ об ошибке
        """
        response_data = {
            'success': False,
            'message': message
        }
        
        if data:
            response_data.update(data)
        
        return JsonResponse(response_data, status=status_code)
    
    @staticmethod
    def api_success_response(data=None, message=None, status_code=status.HTTP_200_OK):
        """
        Универсальный успешный ответ для DRF API
        
        Args:
            data: Данные для ответа
            message: Сообщение
            status_code: HTTP статус код
            
        Returns:
            Response: Успешный ответ DRF
        """
        response_data = {'success': True}
        
        if data is not None:
            response_data.update(data)
        
        if message:
            response_data['message'] = message
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def api_error_response(message, status_code=status.HTTP_400_BAD_REQUEST, data=None):
        """
        Универсальный ответ об ошибке для DRF API
        
        Args:
            message: Сообщение об ошибке
            status_code: HTTP статус код
            data: Дополнительные данные
            
        Returns:
            Response: Ответ об ошибке DRF
        """
        response_data = {
            'success': False,
            'error': message
        }
        
        if data:
            response_data.update(data)
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def toggle_response(is_active, entity_name, entity_id=None):
        """
        Стандартный ответ для операций переключения статуса
        
        Args:
            is_active: Новый статус активности
            entity_name: Название сущности
            entity_id: ID сущности (опционально)
            
        Returns:
            dict: Стандартный ответ для toggle операций
        """
        status_text = 'активирована' if is_active else 'деактивирована'
        
        response = {
            'success': True,
            'is_active': is_active,
            'message': f'{entity_name} {status_text}'
        }
        
        if entity_id:
            response['id'] = entity_id
        
        return response
    
    @staticmethod
    def pagination_context(page_obj, search_form=None, original_queryset=None, **filters):
        """
        Стандартный контекст для пагинации
        
        Args:
            page_obj: Объект страницы пагинации
            search_form: Форма поиска
            original_queryset: Оригинальный queryset до пагинации
            **filters: Дополнительные фильтры
            
        Returns:
            dict: Контекст для пагинации
        """
        context = {
            'page_obj': page_obj,
            'total_count': page_obj.paginator.count,
        }
        
        if search_form:
            context['search_form'] = search_form
        
        # Добавляем фильтры в контекст
        context.update(filters)
        
        # Добавляем статистику по активности из оригинального queryset
        if original_queryset is not None and hasattr(original_queryset, 'model'):
            context['active_count'] = original_queryset.filter(is_active=True).count()
            context['inactive_count'] = original_queryset.filter(is_active=False).count()
        
        return context
