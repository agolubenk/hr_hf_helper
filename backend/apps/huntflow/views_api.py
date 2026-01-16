from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import HuntflowCache, HuntflowLog, LinkedInHuntflowLink, LinkedInThreadProfile
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
    
    def _extract_huntflow_ids(self, url: str) -> dict:
        """
        Извлекает account_name и applicant_id из Huntflow URL.
        
        Поддерживаемые форматы:
        - https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
        - https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
        
        Возвращает: {"account_name": "softnetix", "applicant_id": 79149055, "vacancy_id": 3936868 или None}
        """
        result = {"account_name": None, "applicant_id": None, "vacancy_id": None}
        
        # Формат 1: /my/{account}#/applicants/filter/all/{applicant_id}
        m1 = re.search(r'/my/([^/#]+)#/applicants/filter/[^/]+/(\d+)', url)
        if m1:
            result["account_name"] = m1.group(1)
            result["applicant_id"] = int(m1.group(2))
            return result
        
        # Формат 2: /my/{account}#/vacancy/{vacancy_id}/filter/{status}/id/{applicant_id}
        m2 = re.search(r'/my/([^/#]+)#/vacancy/(\d+)/filter/[^/]+/id/(\d+)', url)
        if m2:
            result["account_name"] = m2.group(1)
            result["vacancy_id"] = int(m2.group(2))
            result["applicant_id"] = int(m2.group(3))
            return result
        
        return result
    
    def _get_latest_vacancy_for_applicant(self, account_name: str, applicant_id: int) -> tuple[int | None, int | None]:
        """
        Получает ID последней вакансии кандидата в работе через Huntflow API.
        
        Логика:
        1. Получаем все вакансии кандидата (applicant statuses)
        2. Фильтруем по статусу "в работе" (workon)
        3. Берём последнюю по дате
        
        Возвращает: (account_id, vacancy_id) или (None, None)
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            from apps.huntflow.services import HuntflowService
            
            logger.info(f"Getting vacancy for account={account_name}, applicant={applicant_id}")
            
            api = HuntflowService(user=self.request.user)
            
            # Получаем account_id по имени
            accounts_response = api.get_accounts()
            
            # Проверяем формат ответа (может быть dict с 'items' или list)
            if isinstance(accounts_response, dict) and 'items' in accounts_response:
                accounts = accounts_response['items']
            elif isinstance(accounts_response, list):
                accounts = accounts_response
            else:
                logger.warning(f"Unexpected accounts response format: {type(accounts_response)}")
                return (None, None)
            
            logger.info(f"Found {len(accounts)} accounts")
            
            # Ищем аккаунт (сравниваем по name и nick, игнорируя регистр)
            account = None
            for a in accounts:
                if (a.get('name', '').lower() == account_name.lower() or 
                    a.get('nick', '').lower() == account_name.lower()):
                    account = a
                    break
            
            if not account:
                logger.warning(f"Account '{account_name}' not found")
                return (None, None)
            
            account_id = account['id']
            logger.info(f"Account ID: {account_id}")
            
            # Получаем статусы кандидата по всем вакансиям
            applicant_data = api.get_applicant(account_id, applicant_id)
            if not applicant_data:
                logger.warning(f"Applicant {applicant_id} not found in Huntflow (404). Возможно, это ID из production, а используется sandbox.")
                return (None, None)
            
            # Ищем последнюю вакансию со статусом "в работе"
            vacancies = applicant_data.get('vacancy_statuses', [])
            logger.info(f"Found {len(vacancies)} vacancies for applicant")
            
            if not vacancies:
                logger.warning("No vacancies found")
                return (None, None)
            
            # Сортируем по дате изменения статуса (последняя = самая свежая)
            vacancies_in_work = [
                v for v in vacancies 
                if v.get('status', {}).get('type') == 'workon'
            ]
            logger.info(f"Found {len(vacancies_in_work)} vacancies with status 'workon'")
            
            if vacancies_in_work:
                # Берём последнюю
                latest = sorted(
                    vacancies_in_work, 
                    key=lambda x: x.get('changed', ''),
                    reverse=True
                )[0]
                vacancy_id = latest.get('vacancy')
                logger.info(f"Latest vacancy (workon): {vacancy_id}")
                return (account_id, vacancy_id)
            
            # Если нет "в работе", берём просто последнюю вакансию
            latest = sorted(
                vacancies, 
                key=lambda x: x.get('changed', ''),
                reverse=True
            )[0]
            vacancy_id = latest.get('vacancy')
            logger.info(f"Latest vacancy (any status): {vacancy_id}")
            return (account_id, vacancy_id)
            
        except Exception as e:
            # Логируем ошибку, но не падаем
            logger.error(f"Error getting vacancy for applicant {applicant_id}: {e}", exc_info=True)
            return (None, None)

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
                # Кандидат не найден в БД — показываем инпут
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
        
        Поддерживает Huntflow URL:
        - https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
          → автоматически определяет последнюю вакансию и возвращает
          → https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
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

            # Пытаемся извлечь данные из Huntflow URL
            huntflow_ids = self._extract_huntflow_ids(target_url)
            
            account_id = None
            applicant_id = None
            final_url = target_url
            
            # Если это Huntflow URL — извлекаем applicant_id
            if huntflow_ids["applicant_id"]:
                applicant_id = huntflow_ids["applicant_id"]
                
                # Если нет vacancy_id — определяем вакансию автоматически
                if huntflow_ids["account_name"] and not huntflow_ids["vacancy_id"]:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"Huntflow URL detected: account={huntflow_ids['account_name']}, applicant={huntflow_ids['applicant_id']}")
                    
                    try:
                        determined_account_id, vacancy_id = self._get_latest_vacancy_for_applicant(
                            huntflow_ids["account_name"], 
                            huntflow_ids["applicant_id"]
                        )
                        
                        logger.info(f"Account ID: {determined_account_id}, Vacancy ID: {vacancy_id}")
                        
                        if vacancy_id:
                            # Сохраняем account_id
                            if determined_account_id:
                                account_id = determined_account_id
                            
                            # Формируем правильный URL с вакансией
                            final_url = (
                                f"https://huntflow.ru/my/{huntflow_ids['account_name']}#/"
                                f"vacancy/{vacancy_id}/filter/workon/id/{huntflow_ids['applicant_id']}"
                            )
                            logger.info(f"Final URL: {final_url}")
                        else:
                            logger.warning(f"Vacancy ID is None (кандидат не найден или нет вакансий), using original URL")
                            final_url = target_url
                    except Exception as e:
                        # Если не удалось определить вакансию — используем исходный URL
                        logger.error(f"Could not determine vacancy for applicant {huntflow_ids['applicant_id']}: {e}", exc_info=True)
                        logger.warning(f"Возможно, кандидат {huntflow_ids['applicant_id']} существует только в production, а используется sandbox API")
                        final_url = target_url
            else:
                # Извлекаем account/applicant из URL нашего веб-интерфейса (если это не Huntflow)
                m = re.search(r"/huntflow/accounts/(?P<acc>\d+)/applicants/(?P<app>\d+)/", target_url)
                if m:
                    account_id = int(m.group("acc"))
                    applicant_id = int(m.group("app"))

            obj, _ = LinkedInHuntflowLink.objects.update_or_create(
                user=request.user,
                linkedin_url=linkedin_url,
                defaults={
                    "target_url": final_url,
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

class LinkedInThreadMappingViewSet(viewsets.ViewSet):
    """
    API для маппинга LinkedIn thread_id → profile_url.
    
    Используется Chrome-расширением для работы на страницах /messaging/:
    - POST: сохранить маппинг thread_id → profile_url (автоматически при посещении профиля)
    - GET: получить profile_url по thread_id (на странице сообщений)
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request):
        """
        POST /api/v1/linkedin/thread-mapping/
        Body: { "thread_id": "2-ABC...", "profile_url": "https://linkedin.com/in/..." }
        """
        try:
            thread_id = (request.data or {}).get("thread_id", "").strip()
            raw_profile = (request.data or {}).get("profile_url", "").strip()
            
            if not thread_id:
                return Response(
                    {"success": False, "message": "Нужен thread_id"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            profile_url = _normalize_linkedin_profile_url(raw_profile)
            if not profile_url:
                return Response(
                    {"success": False, "message": "Нужен корректный LinkedIn profile URL"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            obj, created = LinkedInThreadProfile.objects.update_or_create(
                user=request.user,
                thread_id=thread_id,
                defaults={
                    "profile_url": profile_url,
                    "last_accessed_at": timezone.now(),
                },
            )
            
            return Response(
                {
                    "success": True,
                    "created": created,
                    "thread_id": obj.thread_id,
                    "profile_url": obj.profile_url,
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
    def list(self, request):
        """
        GET /api/v1/linkedin/thread-mapping/?thread_id=...
        """
        try:
            thread_id = request.query_params.get("thread_id", "").strip()
            
            if not thread_id:
                return Response(
                    {"success": False, "message": "Нужен параметр thread_id"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            obj = LinkedInThreadProfile.objects.filter(
                user=request.user,
                thread_id=thread_id
            ).first()
            
            if not obj:
                return Response(
                    {"success": False, "message": "Маппинг не найден"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            # Обновляем last_accessed_at
            obj.last_accessed_at = timezone.now()
            obj.save(update_fields=['last_accessed_at'])
            
            return Response(
                {
                    "success": True,
                    "thread_id": obj.thread_id,
                    "profile_url": obj.profile_url,
                },
                status=status.HTTP_200_OK,
            )
        
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
