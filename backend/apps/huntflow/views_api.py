from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import HuntflowCache, HuntflowLog, LinkedInHuntflowLink
from .serializers import (
    HuntflowCacheSerializer, HuntflowLogSerializer, HuntflowLogCreateSerializer,
    HuntflowStatsSerializer, HuntflowApiRequestSerializer
)
from logic.integration.huntflow.huntflow_api import (
    HuntflowCacheViewSet as LogicHuntflowCacheViewSet,
    HuntflowLogViewSet as LogicHuntflowLogViewSet,
    HuntflowApiRequestViewSet as LogicHuntflowApiRequestViewSet
)
from urllib.parse import urlparse
import re


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


def _normalize_linkedin_profile_url(raw_url: str) -> str | None:
    """
    Приводит LinkedIn URL к каноничному виду: https://www.linkedin.com/in/<slug>/
    Возвращает None, если URL не похож на ссылку профиля LinkedIn.
    """
    if not raw_url:
        return None

    raw_url = raw_url.strip()

    # Иногда прилетает без схемы
    if raw_url.startswith("www.linkedin.com/") or raw_url.startswith("linkedin.com/"):
        raw_url = "https://" + raw_url

    parsed = urlparse(raw_url)
    if not parsed.netloc:
        return None

    netloc = parsed.netloc.lower()
    if not netloc.endswith("linkedin.com"):
        return None

    # Ищем /in/<slug>
    parts = [p for p in parsed.path.split("/") if p]
    if "in" not in parts:
        return None

    try:
        idx = parts.index("in")
        slug = parts[idx + 1]
    except Exception:
        return None

    if not slug:
        return None

    return f"https://www.linkedin.com/in/{slug}/"


class LinkedInApplicantsViewSet(viewsets.ViewSet):
    """
    API под Chrome-расширение:
    - Проверка, есть ли кандидат в Huntflow по LinkedIn URL
    
    ВАЖНО: создание/сохранение из расширения отключено. Расширение ориентируется
    только на связи, сохранённые в нашей БД (LinkedInHuntflowLink).
    """

    permission_classes = [permissions.IsAuthenticated]

    def _build_app_url(self, request, account_id: int, applicant_id: int) -> str:
        # Веб-интерфейс приложения hrhelper (не Huntflow ATS)
        return request.build_absolute_uri(f"/huntflow/accounts/{account_id}/applicants/{applicant_id}/")

    def _get_link(self, request, linkedin_url: str) -> LinkedInHuntflowLink | None:
        return LinkedInHuntflowLink.objects.filter(user=request.user, linkedin_url=linkedin_url).first()

    def _normalize_target_url(self, request, raw_url: str) -> str | None:
        if not raw_url:
            return None
        u = raw_url.strip()
        if u.startswith("/"):
            return request.build_absolute_uri(u)
        # если вставили без схемы
        if u.startswith("www.") or u.startswith("localhost") or u.startswith("127.0.0.1"):
            u = "http://" + u
        parsed = urlparse(u)
        if not parsed.scheme or not parsed.netloc:
            return None
        return u

    @action(detail=False, methods=["get"], url_path="status")
    def status(self, request):
        """
        GET /api/v1/huntflow/linkedin-applicants/status/?linkedin_url=...
        """
        try:
            raw_url = request.query_params.get("linkedin_url") or request.query_params.get("url") or ""
            linkedin_url = _normalize_linkedin_profile_url(raw_url)
            if not linkedin_url:
                return Response(
                    {"success": False, "message": "Нужен корректный LinkedIn URL профиля (/in/<slug>/)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            link = self._get_link(request, linkedin_url)
            if not link:
                return Response(
                    {"success": True, "exists": False, "linkedin_url": linkedin_url},
                    status=status.HTTP_200_OK,
                )

            if link.target_url:
                app_url = link.target_url
            elif link.account_id is not None and link.applicant_id is not None:
                app_url = self._build_app_url(request, int(link.account_id), int(link.applicant_id))
            else:
                app_url = None

            return Response(
                {
                    "success": True,
                    "exists": True,
                    "linkedin_url": linkedin_url,
                    "account_id": int(link.account_id) if link.account_id is not None else None,
                    "applicant_id": int(link.applicant_id) if link.applicant_id is not None else None,
                    "app_url": app_url,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], url_path="set-link")
    def set_link(self, request):
        """
        POST /api/v1/huntflow/linkedin-applicants/set-link/
        Body: { "linkedin_url": "...", "target_url": "..." }
        Сохраняет связку LinkedIn -> URL кандидата в Huntflow/HRHelper в нашей БД.
        """
        try:
            raw_li = (request.data or {}).get("linkedin_url") or ""
            linkedin_url = _normalize_linkedin_profile_url(raw_li)
            if not linkedin_url:
                return Response(
                    {"success": False, "message": "Нужен корректный LinkedIn URL профиля (/in/<slug>/)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            raw_target = (request.data or {}).get("target_url") or (request.data or {}).get("huntflow_url") or ""
            target_url = self._normalize_target_url(request, raw_target)
            if not target_url:
                return Response(
                    {"success": False, "message": "Нужна корректная ссылка на кандидата (полный URL или относительный /huntflow/... )."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Пытаемся извлечь account/applicant из URL нашего веб-интерфейса
            account_id = None
            applicant_id = None
            m = re.search(r"/huntflow/accounts/(?P<acc>\\d+)/applicants/(?P<app>\\d+)/", target_url)
            if m:
                account_id = int(m.group("acc"))
                applicant_id = int(m.group("app"))

            obj, _ = LinkedInHuntflowLink.objects.update_or_create(
                user=request.user,
                linkedin_url=linkedin_url,
                defaults={
                    "target_url": target_url,
                    "account_id": account_id,
                    "applicant_id": applicant_id,
                },
            )

            return Response(
                {
                    "success": True,
                    "exists": True,
                    "linkedin_url": linkedin_url,
                    "target_url": obj.target_url,
                    "account_id": obj.account_id,
                    "applicant_id": obj.applicant_id,
                    "app_url": obj.target_url or (
                        self._build_app_url(request, int(obj.account_id), int(obj.applicant_id))
                        if obj.account_id is not None and obj.applicant_id is not None
                        else None
                    ),
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )