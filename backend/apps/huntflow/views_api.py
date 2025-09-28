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