from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import HuntflowCache, HuntflowLog
from .serializers import (
    HuntflowCacheSerializer, HuntflowLogSerializer, HuntflowLogCreateSerializer,
    HuntflowStatsSerializer, HuntflowApiRequestSerializer
)
from logic.integration.huntflow.huntflow_api import (
    HuntflowCacheViewSet as LogicHuntflowCacheViewSet,
    HuntflowLogViewSet as LogicHuntflowLogViewSet,
    HuntflowApiRequestViewSet as LogicHuntflowApiRequestViewSet
)


class HuntflowCacheViewSet(LogicHuntflowCacheViewSet):
    """
    ViewSet для просмотра кэша Huntflow - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowCache.objects: кэш Huntflow
    - HuntflowCacheSerializer
    
    ОБРАБОТКА:
    - Наследование от LogicHuntflowCacheViewSet
    - Фильтрация по cache_key
    - Поиск по cache_key
    - Сортировка по дате обновления
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с данными кэша
    
    СВЯЗИ:
    - Использует: LogicHuntflowCacheViewSet, HuntflowCacheSerializer
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['cache_key']
    search_fields = ['cache_key']
    ordering_fields = ['created_at', 'updated_at', 'expires_at']
    ordering = ['-updated_at']


class HuntflowLogViewSet(LogicHuntflowLogViewSet):
    """
    ViewSet для просмотра логов Huntflow - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowLog.objects: логи Huntflow
    - HuntflowLogSerializer, HuntflowLogCreateSerializer
    
    ОБРАБОТКА:
    - Наследование от LogicHuntflowLogViewSet
    - Фильтрация по log_type, method, status_code, user
    - Поиск по endpoint, error_message
    - Сортировка по дате создания
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с данными логов
    
    СВЯЗИ:
    - Использует: LogicHuntflowLogViewSet, HuntflowLogSerializer
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['log_type', 'method', 'status_code', 'user']
    search_fields = ['endpoint', 'error_message']
    ordering_fields = ['created_at', 'status_code']
    ordering = ['-created_at']


class HuntflowApiRequestViewSet(LogicHuntflowApiRequestViewSet):
    """
    ViewSet для выполнения API запросов к Huntflow - расширенная версия
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    - request.user: аутентифицированный пользователь
    - request.data: параметры API запроса (endpoint, method, data, params, use_cache, cache_timeout)
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowApiRequestSerializer
    - HuntflowService для выполнения API запросов
    
    ОБРАБОТКА:
    - Наследование от LogicHuntflowApiRequestViewSet
    - Валидация параметров API запроса
    - Выполнение запросов к Huntflow API
    - Кэширование результатов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с результатами API запросов
    
    СВЯЗИ:
    - Использует: LogicHuntflowApiRequestViewSet, HuntflowApiRequestSerializer
    - Передает: DRF API responses
    - Может вызываться из: DRF API endpoints
    """
    permission_classes = [permissions.IsAuthenticated]


class HHResponsesViewSet(viewsets.ViewSet):
    """
    ViewSet для работы с откликами из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - HTTP запросы (POST)
    - request.user: аутентифицированный пользователь
    - request.data: параметры импорта (account_id, vacancy_id, hh_vacancy_id, filters)
    
    ИСТОЧНИКИ ДАННЫХ:
    - HH.ru API
    - HuntflowOperations для импорта
    
    ОБРАБОТКА:
    - Получение откликов из HH.ru
    - Фильтрация по критериям
    - Импорт в Huntflow
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - DRF Response с результатами импорта
    
    СВЯЗИ:
    - Использует: HuntflowOperations, HH.ru API
    - Передает: DRF API responses
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'], url_path='import-hh-responses')
    def import_hh_responses(self, request):
        """
        Импорт откликов из HH.ru в Huntflow
        
        POST /api/v1/huntflow/hh-responses/import-hh-responses/
        
        Входящие данные (JSON):
        {
            "account_id": 123,
            "vacancy_id": 456,
            "hh_vacancy_id": "789",
            "filters": {
                "allowed_locations": ["1", "2"],
                "allowed_genders": ["any"],
                "min_age": 18,
                "max_age": 65,
                "check_existing": true,
                "min_experience_years": 1,
                "max_experience_years": 50
            }
        }
        
        Выходящие данные:
        {
            "success": true,
            "imported": 5,
            "filtered_out": 3,
            "errors": 0,
            "imported_candidates": [...],
            "filter_results": {...}
        }
        """
        
        try:
            from logic.integration.shared.huntflow_operations import HuntflowOperations
            from logic.base.response_handler import UnifiedResponseHandler
            
            account_id = request.data.get('account_id')
            vacancy_id = request.data.get('vacancy_id')
            hh_vacancy_id = request.data.get('hh_vacancy_id')
            filters = request.data.get('filters')
            
            if not all([account_id, vacancy_id, hh_vacancy_id]):
                return Response(
                    UnifiedResponseHandler.error_response(
                        "Требуются account_id, vacancy_id и hh_vacancy_id"
                    ),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            operations = HuntflowOperations(request.user)
            result = operations.get_and_import_hh_responses(
                account_id, vacancy_id, hh_vacancy_id, filters
            )
            
            if result.get('success'):
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response(
                    UnifiedResponseHandler.error_response(result.get('message', 'Ошибка импорта')),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            return Response(
                UnifiedResponseHandler.error_response(str(e)),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )