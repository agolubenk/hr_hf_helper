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
    
    def _get_latest_vacancy_for_applicant(self, account_name: str, applicant_id: int, user=None) -> tuple[int | None, int | None]:
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
            
            # Используем переданного пользователя или self.request.user
            api_user = user or self.request.user
            api = HuntflowService(user=api_user)
            
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
        Параметры:
        - linkedin_url: URL профиля LinkedIn
        - force_refresh: если true, инвалидирует кэш кандидата в Huntflow
        """
        try:
            raw_url = request.query_params.get("linkedin_url") or request.query_params.get("url") or ""
            linkedin_url = _normalize_linkedin_profile_url(raw_url)
            if not linkedin_url:
                return Response(
                    {"success": False, "message": "Нужен корректный LinkedIn URL профиля (/in/<slug>/)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Проверяем параметр принудительного обновления
            force_refresh = request.query_params.get("force_refresh", "").lower() == "true"
            
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

            # Получаем название вакансии из ссылки или через applicant_id
            vacancy_name = None
            vacancy_id = None
            account_id = None
            status_name = None
            status_id = None
            
            # Сначала пробуем извлечь vacancy_id из target_url или app_url
            url_to_check = link.target_url or app_url
            if url_to_check:
                huntflow_ids = self._extract_huntflow_ids(url_to_check)
                if huntflow_ids.get('vacancy_id'):
                    vacancy_id = huntflow_ids['vacancy_id']
                    # Если есть account_name, получаем account_id
                    if huntflow_ids.get('account_name'):
                        try:
                            from apps.huntflow.services import HuntflowService
                            api = HuntflowService(user=request.user)
                            accounts_response = api.get_accounts()
                            if isinstance(accounts_response, dict) and 'items' in accounts_response:
                                accounts = accounts_response['items']
                            elif isinstance(accounts_response, list):
                                accounts = accounts_response
                            else:
                                accounts = []
                            
                            for a in accounts:
                                if (a.get('name', '').lower() == huntflow_ids['account_name'].lower() or 
                                    a.get('nick', '').lower() == huntflow_ids['account_name'].lower()):
                                    account_id = a.get('id')
                                    break
                        except Exception as e:
                            import logging
                            logger = logging.getLogger(__name__)
                            logger.warning(f"Error getting account_id from account_name: {e}")
                    # Если account_id уже есть в link, используем его
                    elif link.account_id is not None:
                        account_id = int(link.account_id)
            
            # Если vacancy_id не найден в ссылке, но есть сохраненный vacancy_id в связи
            if not vacancy_id and link.vacancy_id is not None:
                vacancy_id = int(link.vacancy_id)
                account_id = int(link.account_id) if link.account_id is not None else account_id
                logger.info(f"Using saved vacancy_id from link: {vacancy_id}")
            
            # Если vacancy_id или status_id еще не найдены, но есть account_id и applicant_id, получаем через applicant_data
            if (not vacancy_id or not status_id) and link.account_id is not None and link.applicant_id is not None:
                try:
                    import logging
                    logger = logging.getLogger(__name__)
                    from apps.huntflow.services import HuntflowService
                    from apps.google_oauth.cache_service import HuntflowAPICache
                    api = HuntflowService(user=request.user)
                    
                    account_id = int(link.account_id)
                    applicant_id = int(link.applicant_id)
                    
                    # Если требуется принудительное обновление, очищаем кэш кандидата
                    if force_refresh:
                        logger.info(f"Force refresh requested, clearing cache for applicant_id={applicant_id}")
                        HuntflowAPICache.clear_candidate(request.user.id, account_id, applicant_id)
                    
                    logger.info(f"Getting vacancy name for account_id={account_id}, applicant_id={applicant_id}")
                    
                    # Получаем данные кандидата
                    applicant_data = api.get_applicant(account_id, applicant_id)
                    if applicant_data:
                        # Сначала пробуем получить vacancy_id из links (для новых вакансий)
                        links = applicant_data.get('links', [])
                        if links and len(links) > 0:
                            vacancy_id_from_links = links[0].get('vacancy')
                            if vacancy_id_from_links:
                                vacancy_id = vacancy_id_from_links
                                logger.info(f"Found vacancy_id from links: {vacancy_id}")
                            
                            # Получаем статус ID из links
                            status_id_from_links = links[0].get('status')
                            if status_id_from_links:
                                status_id = status_id_from_links
                                logger.info(f"Found status_id from links: {status_id}")
                        
                        # Если не нашли vacancy_id или status_id в links, ищем в vacancy_statuses
                        if not vacancy_id or not status_id:
                            vacancies = applicant_data.get('vacancy_statuses', [])
                            logger.info(f"Found {len(vacancies)} vacancies for applicant")
                            
                            if vacancies:
                                # Сортируем по дате изменения статуса (последняя = самая свежая)
                                vacancies_in_work = [
                                    v for v in vacancies 
                                    if v.get('status', {}).get('type') == 'workon'
                                ]
                                
                                if vacancies_in_work:
                                    # Берём последнюю
                                    latest = sorted(
                                        vacancies_in_work, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    if not vacancy_id:
                                        vacancy_id = latest.get('vacancy')
                                    # Получаем статус ID из vacancy_statuses, если еще не получен
                                    if not status_id:
                                        status_obj = latest.get('status', {})
                                        if isinstance(status_obj, dict):
                                            status_id = status_obj.get('id')
                                        elif status_obj:
                                            status_id = status_obj
                                else:
                                    # Если нет "в работе", берём просто последнюю вакансию
                                    latest = sorted(
                                        vacancies, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    if not vacancy_id:
                                        vacancy_id = latest.get('vacancy')
                                    # Получаем статус ID из vacancy_statuses, если еще не получен
                                    if not status_id:
                                        status_obj = latest.get('status', {})
                                        if isinstance(status_obj, dict):
                                            status_id = status_obj.get('id')
                                        elif status_obj:
                                            status_id = status_obj
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error getting vacancy_id from applicant: {e}", exc_info=True)
            
            # Если нашли vacancy_id, получаем название вакансии
            if vacancy_id and account_id:
                try:
                    import logging
                    logger = logging.getLogger(__name__)
                    from apps.huntflow.services import HuntflowService
                    api = HuntflowService(user=request.user)
                    
                    logger.info(f"Getting vacancy name for vacancy_id={vacancy_id}, account_id={account_id}")
                    vacancy_data = api.get_vacancy(account_id, vacancy_id)
                    if vacancy_data:
                        vacancy_name = vacancy_data.get('position')
                        logger.info(f"Vacancy name: {vacancy_name}")
                    else:
                        logger.warning(f"Vacancy data not found for vacancy_id={vacancy_id}")
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error getting vacancy name: {e}", exc_info=True)
            
            # Если нашли status_id, получаем название статуса
            # Убеждаемся, что account_id определен (используем из link, если не был получен ранее)
            if status_id:
                # Если account_id еще не определен, но есть в link, используем его
                if not account_id and link.account_id is not None:
                    account_id = int(link.account_id)
                
                if account_id:
                    try:
                        import logging
                        logger = logging.getLogger(__name__)
                        from apps.huntflow.services import HuntflowService
                        api = HuntflowService(user=request.user)
                        
                        logger.info(f"Getting status name for status_id={status_id}, account_id={account_id}")
                        statuses_data = api.get_vacancy_statuses(account_id)
                        if statuses_data:
                            # Ищем статус по ID
                            statuses_list = statuses_data.get('items', [])
                            if isinstance(statuses_list, list):
                                for status_item in statuses_list:
                                    if status_item.get('id') == status_id:
                                        status_name = status_item.get('name')
                                        logger.info(f"Status name: {status_name}")
                                        break
                            else:
                                logger.warning(f"Statuses list is not a list: {type(statuses_list)}")
                        else:
                            logger.warning(f"Statuses data is None for account_id={account_id}")
                    except Exception as e:
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.error(f"Error getting status name: {e}", exc_info=True)
                else:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Cannot get status name: status_id={status_id} but account_id is None")

            return Response(
                {
                    "success": True,
                    "exists": True,
                    "linkedin_url": linkedin_url,
                    "account_id": int(link.account_id) if link.account_id is not None else None,
                    "applicant_id": int(link.applicant_id) if link.applicant_id is not None else None,
                    "app_url": app_url,
                    "vacancy_name": vacancy_name,
                    "status_name": status_name,
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
            vacancy_id = None
            final_url = target_url
            
            # Если это Huntflow URL — извлекаем applicant_id
            if huntflow_ids["applicant_id"]:
                applicant_id = huntflow_ids["applicant_id"]
                vacancy_id = huntflow_ids.get("vacancy_id")
                
                # Если нет vacancy_id — определяем вакансию автоматически
                if huntflow_ids["account_name"] and not vacancy_id:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"Huntflow URL detected: account={huntflow_ids['account_name']}, applicant={huntflow_ids['applicant_id']}")
                    
                    try:
                        determined_account_id, vacancy_id = self._get_latest_vacancy_for_applicant(
                            huntflow_ids["account_name"], 
                            huntflow_ids["applicant_id"],
                            user=request.user
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
                elif huntflow_ids["account_name"]:
                    # Если vacancy_id уже есть в URL, получаем account_id
                    try:
                        from apps.huntflow.services import HuntflowService
                        api = HuntflowService(user=request.user)
                        accounts_response = api.get_accounts()
                        if isinstance(accounts_response, dict) and 'items' in accounts_response:
                            accounts = accounts_response['items']
                        elif isinstance(accounts_response, list):
                            accounts = accounts_response
                        else:
                            accounts = []
                        
                        for a in accounts:
                            if (a.get('name', '').lower() == huntflow_ids['account_name'].lower() or 
                                a.get('nick', '').lower() == huntflow_ids['account_name'].lower()):
                                account_id = a.get('id')
                                break
                    except Exception as e:
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.warning(f"Error getting account_id from account_name: {e}")
            else:
                # Извлекаем account/applicant из URL нашего веб-интерфейса (если это не Huntflow)
                m = re.search(r"/huntflow/accounts/(?P<acc>\d+)/applicants/(?P<app>\d+)/", target_url)
                if m:
                    account_id = int(m.group("acc"))
                    applicant_id = int(m.group("app"))

            # Если vacancy_id не определен, но есть account_id и applicant_id, пытаемся получить его
            if not vacancy_id and account_id and applicant_id:
                try:
                    from apps.huntflow.services import HuntflowService
                    api = HuntflowService(user=request.user)
                    applicant_data = api.get_applicant(account_id, applicant_id)
                    if applicant_data:
                        # Сначала пробуем получить vacancy_id из links (для новых вакансий)
                        links = applicant_data.get('links', [])
                        if links and len(links) > 0:
                            vacancy_id_from_links = links[0].get('vacancy')
                            if vacancy_id_from_links:
                                vacancy_id = vacancy_id_from_links
                        # Если не нашли в links, ищем в vacancy_statuses
                        if not vacancy_id:
                            vacancies = applicant_data.get('vacancy_statuses', [])
                            if vacancies:
                                vacancies_in_work = [
                                    v for v in vacancies 
                                    if v.get('status', {}).get('type') == 'workon'
                                ]
                                if vacancies_in_work:
                                    latest = sorted(
                                        vacancies_in_work, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    vacancy_id = latest.get('vacancy')
                                else:
                                    latest = sorted(
                                        vacancies, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    vacancy_id = latest.get('vacancy')
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Error getting vacancy_id when saving link: {e}")
            
            # Формируем defaults для сохранения
            defaults = {
                "target_url": final_url,
                "account_id": account_id,
                "applicant_id": applicant_id,
            }
            # Добавляем vacancy_id только если он определен
            if vacancy_id is not None:
                defaults["vacancy_id"] = vacancy_id
            
            try:
                obj, _ = LinkedInHuntflowLink.objects.update_or_create(
                    user=request.user,
                    linkedin_url=linkedin_url,
                    defaults=defaults,
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error saving LinkedInHuntflowLink: {e}", exc_info=True)
                # Пробуем сохранить без vacancy_id, если была ошибка
                if "vacancy_id" in defaults:
                    del defaults["vacancy_id"]
                    obj, _ = LinkedInHuntflowLink.objects.update_or_create(
                        user=request.user,
                        linkedin_url=linkedin_url,
                        defaults=defaults,
                    )
                else:
                    raise

            # Получаем название вакансии для ответа
            vacancy_name = None
            status_name = None
            if obj.vacancy_id and obj.account_id:
                try:
                    from apps.huntflow.services import HuntflowService
                    api = HuntflowService(user=request.user)
                    vacancy_data = api.get_vacancy(int(obj.account_id), int(obj.vacancy_id))
                    if vacancy_data:
                        vacancy_name = vacancy_data.get('position')
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Error getting vacancy name in set_link: {e}")
            
            # Получаем статус кандидата для ответа
            if obj.account_id and obj.applicant_id:
                try:
                    from apps.huntflow.services import HuntflowService
                    api = HuntflowService(user=request.user)
                    applicant_data = api.get_applicant(int(obj.account_id), int(obj.applicant_id))
                    if applicant_data:
                        # Получаем статус ID из links
                        links = applicant_data.get('links', [])
                        status_id = None
                        if links and len(links) > 0:
                            status_id = links[0].get('status')
                        
                        # Если не нашли в links, ищем в vacancy_statuses
                        if not status_id:
                            vacancies = applicant_data.get('vacancy_statuses', [])
                            if vacancies:
                                # Сортируем по дате изменения статуса (последняя = самая свежая)
                                vacancies_in_work = [
                                    v for v in vacancies 
                                    if v.get('status', {}).get('type') == 'workon'
                                ]
                                
                                if vacancies_in_work:
                                    latest = sorted(
                                        vacancies_in_work, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    status_obj = latest.get('status', {})
                                    if isinstance(status_obj, dict):
                                        status_id = status_obj.get('id')
                                    elif status_obj:
                                        status_id = status_obj
                                else:
                                    latest = sorted(
                                        vacancies, 
                                        key=lambda x: x.get('changed', ''),
                                        reverse=True
                                    )[0]
                                    status_obj = latest.get('status', {})
                                    if isinstance(status_obj, dict):
                                        status_id = status_obj.get('id')
                                    elif status_obj:
                                        status_id = status_obj
                        
                        # Получаем название статуса
                        if status_id:
                            import logging
                            logger = logging.getLogger(__name__)
                            logger.info(f"Getting status name for status_id={status_id}, account_id={obj.account_id}")
                            statuses_data = api.get_vacancy_statuses(int(obj.account_id))
                            if statuses_data:
                                statuses_list = statuses_data.get('items', [])
                                if isinstance(statuses_list, list):
                                    for status_item in statuses_list:
                                        if status_item.get('id') == status_id:
                                            status_name = status_item.get('name')
                                            logger.info(f"Status name found: {status_name}")
                                            break
                                    if not status_name:
                                        logger.warning(f"Status with id={status_id} not found in statuses list")
                                else:
                                    logger.warning(f"Statuses list is not a list: {type(statuses_list)}")
                            else:
                                logger.warning(f"Statuses data is None for account_id={obj.account_id}")
                        else:
                            import logging
                            logger = logging.getLogger(__name__)
                            logger.warning(f"Status ID is None, cannot get status name")
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error getting status name in set_link: {e}", exc_info=True)
            
            app_url = obj.target_url or (
                self._build_app_url(request, int(obj.account_id), int(obj.applicant_id))
                if obj.account_id is not None and obj.applicant_id is not None
                else None
            )
            
            return Response(
                {
                    "success": True,
                    "exists": True,
                    "linkedin_url": linkedin_url,
                    "target_url": obj.target_url,
                    "account_id": obj.account_id,
                    "applicant_id": obj.applicant_id,
                    "vacancy_id": obj.vacancy_id,
                    "app_url": app_url,
                    "vacancy_name": vacancy_name,
                    "status_name": status_name,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"], url_path="status-options")
    def status_options(self, request):
        """
        GET /api/v1/huntflow/linkedin-applicants/status-options/?linkedin_url=...
        Возвращает список доступных статусов и причин отказа для кандидата
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
            if not link or not link.account_id:
                return Response(
                    {"success": False, "message": "Кандидат не найден или не привязан к организации."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            from apps.huntflow.services import HuntflowService
            api = HuntflowService(user=request.user)
            account_id = int(link.account_id)

            # Получаем список статусов
            statuses_data = api.get_vacancy_statuses(account_id)
            statuses = []
            if statuses_data and 'items' in statuses_data:
                statuses = statuses_data['items']

            # Получаем список причин отказа
            rejection_reasons_data = api.get_rejection_reasons(account_id)
            rejection_reasons = []
            if rejection_reasons_data:
                if 'items' in rejection_reasons_data:
                    rejection_reasons = rejection_reasons_data['items']
                elif isinstance(rejection_reasons_data, list):
                    rejection_reasons = rejection_reasons_data
            
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Status options: {len(statuses)} statuses, {len(rejection_reasons)} rejection reasons")

            return Response(
                {
                    "success": True,
                    "statuses": statuses,
                    "rejection_reasons": rejection_reasons,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting status options: {e}", exc_info=True)
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], url_path="update-status")
    def update_status(self, request):
        """
        POST /api/v1/huntflow/linkedin-applicants/update-status/
        Body: { "linkedin_url": "...", "status_id": 123, "rejection_reason_id": 456 (опционально), "comment": "..." (опционально) }
        Обновляет статус кандидата
        """
        try:
            raw_li = (request.data or {}).get("linkedin_url") or ""
            linkedin_url = _normalize_linkedin_profile_url(raw_li)
            if not linkedin_url:
                return Response(
                    {"success": False, "message": "Нужен корректный LinkedIn URL профиля (/in/<slug>/)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            link = self._get_link(request, linkedin_url)
            if not link or not link.account_id or not link.applicant_id:
                return Response(
                    {"success": False, "message": "Кандидат не найден или не привязан к организации."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            status_id = (request.data or {}).get("status_id")
            if not status_id:
                return Response(
                    {"success": False, "message": "Нужен status_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            rejection_reason_id = (request.data or {}).get("rejection_reason_id")
            comment = (request.data or {}).get("comment", "")

            from apps.huntflow.services import HuntflowService
            from apps.google_oauth.cache_service import HuntflowAPICache
            api = HuntflowService(user=request.user)
            account_id = int(link.account_id)
            applicant_id = int(link.applicant_id)

            # Формируем комментарий, если указан
            final_comment = comment if comment else None

            # Обновляем статус с передачей rejection_reason_id отдельным параметром
            result = api.update_applicant_status(
                account_id=account_id,
                applicant_id=applicant_id,
                status_id=int(status_id),
                comment=final_comment,
                vacancy_id=int(link.vacancy_id) if link.vacancy_id else None,
                rejection_reason_id=int(rejection_reason_id) if rejection_reason_id else None
            )

            if result:
                # Очищаем кэш кандидата
                HuntflowAPICache.clear_candidate(request.user.id, account_id, applicant_id)
                
                return Response(
                    {
                        "success": True,
                        "message": "Статус успешно обновлен",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"success": False, "message": "Не удалось обновить статус"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating status: {e}", exc_info=True)
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
