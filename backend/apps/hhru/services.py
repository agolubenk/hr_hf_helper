"""
Сервис для работы с HeadHunter.ru API

ВХОДЯЩИЕ ДАННЫЕ: OAuth токены, параметры запросов
ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru API
ОБРАБОТКА: Авторизация, выполнение запросов, обновление токенов
ВЫХОДЯЩИЕ ДАННЫЕ: Данные из HH.ru API
СВЯЗИ: HHRUAccount, HHRUConfiguration
ФОРМАТ: Класс HHRUService
"""
import requests
import logging
from typing import Dict, Any, Optional, List, Tuple
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import HHRUAccount, HHRUAPILog, HHRUConfiguration

logger = logging.getLogger(__name__)


class HHRUService:
    """
    Сервис для работы с HeadHunter.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: user (пользователь с подключенным HH.ru аккаунтом)
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru API
    ОБРАБОТКА: Выполнение запросов к API, управление токенами
    ВЫХОДЯЩИЕ ДАННЫЕ: Данные из HH.ru API
    СВЯЗИ: HHRUAccount, HHRUAPILog
    ФОРМАТ: Экземпляр HHRUService
    """
    
    BASE_URL = "https://api.hh.ru"
    OAUTH_URL = "https://hh.ru/oauth"
    
    def __init__(self, user):
        """
        Инициализация сервиса
        
        Args:
            user: Пользователь с подключенным HH.ru аккаунтом
        """
        self.user = user
        self.account = None
        try:
            self.account = HHRUAccount.objects.get(user=user)
        except HHRUAccount.DoesNotExist:
            logger.warning(f"HH.ru аккаунт не найден для пользователя {user.username}")
    
    def _get_headers(self) -> Dict[str, str]:
        """
        Получает заголовки для API запросов с валидным токеном
        
        Returns:
            Словарь с заголовками HTTP запроса
        """
        if not self.account:
            raise Exception("HH.ru аккаунт не подключен")
        
        # Проверяем и обновляем токен при необходимости
        access_token = self.ensure_valid_token()
        if not access_token:
            raise Exception("Не удалось получить валидный токен доступа")
        
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'User-Agent': 'HR-Helper/1.0'
        }
    
    def ensure_valid_token(self) -> Optional[str]:
        """
        Обеспечивает наличие валидного токена доступа
        
        Returns:
            Валидный токен доступа или None
        """
        if not self.account:
            return None
        
        # Если токен валиден, возвращаем его
        if self.account.is_token_valid():
            return self.account.access_token
        
        # Если токен истек, пытаемся обновить
        if self.account.needs_refresh() and self.account.refresh_token:
            return self.refresh_access_token()
        
        return None
    
    def refresh_access_token(self) -> Optional[str]:
        """
        Обновляет токен доступа используя refresh_token
        
        Returns:
            Новый токен доступа или None
        """
        if not self.account or not self.account.refresh_token:
            return None
        
        # Получаем конфигурацию
        config = HHRUConfiguration.get_default(self.user)
        if not config:
            logger.error("Конфигурация HH.ru не найдена")
            return None
        
        try:
            # Запрос на обновление токена
            response = requests.post(
                f"{self.OAUTH_URL}/token",
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token': self.account.refresh_token,
                    'client_id': config.client_id,
                    'client_secret': config.client_secret
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Обновляем токены в базе данных
                self.account.access_token = data.get('access_token')
                if 'refresh_token' in data:
                    self.account.refresh_token = data.get('refresh_token')
                
                # Вычисляем время истечения токена
                expires_in = data.get('expires_in', 3600)  # По умолчанию 1 час
                self.account.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
                self.account.save()
                
                logger.info(f"Токен доступа обновлен для пользователя {self.user.username}")
                return self.account.access_token
            else:
                logger.error(f"Ошибка обновления токена: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Исключение при обновлении токена: {str(e)}")
            return None
    
    def _log_request(
        self,
        method: str,
        endpoint: str,
        status_code: Optional[int] = None,
        request_data: Optional[Dict] = None,
        response_data: Optional[Dict] = None,
        error_message: Optional[str] = None
    ):
        """
        Логирует запрос к API
        
        Args:
            method: HTTP метод
            endpoint: Эндпоинт API
            status_code: Код ответа
            request_data: Данные запроса
            response_data: Данные ответа
            error_message: Сообщение об ошибке
        """
        log_type = 'ERROR' if error_message or (status_code and status_code >= 400) else method
        
        HHRUAPILog.objects.create(
            log_type=log_type,
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            request_data=request_data or {},
            response_data=response_data or {},
            error_message=error_message or '',
            user=self.user,
            account=self.account
        )
    
    def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Выполняет запрос к HeadHunter.ru API
        
        Args:
            method: HTTP метод (GET, POST, PUT, PATCH, DELETE)
            endpoint: Эндпоинт API (без базового URL)
            data: Данные для отправки в теле запроса
            params: Параметры запроса (query string)
            **kwargs: Дополнительные параметры для requests
            
        Returns:
            Словарь с результатом запроса
        """
        if not self.account:
            return {
                'success': False,
                'error': 'HH.ru аккаунт не подключен'
            }
        
        url = f"{self.BASE_URL}{endpoint}"
        headers = self._get_headers()
        
        try:
            # Выполняем запрос
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data if data else None,
                params=params,
                timeout=kwargs.get('timeout', 30),
                **{k: v for k, v in kwargs.items() if k != 'timeout'}
            )
            
            # Парсим ответ
            try:
                response_data = response.json() if response.content else {}
            except ValueError:
                response_data = {'raw': response.text}
            
            # Логируем запрос
            self._log_request(
                method=method,
                endpoint=endpoint,
                status_code=response.status_code,
                request_data=data,
                response_data=response_data
            )
            
            # Возвращаем результат
            if 200 <= response.status_code < 300:
                return {
                    'success': True,
                    'data': response_data,
                    'status_code': response.status_code
                }
            else:
                error_message = response_data.get('description', response_data.get('errors', 'Unknown error'))
                return {
                    'success': False,
                    'error': error_message,
                    'status_code': response.status_code,
                    'data': response_data
                }
                
        except requests.exceptions.RequestException as e:
            error_message = str(e)
            logger.error(f"Ошибка запроса к HH.ru API: {error_message}")
            
            # Логируем ошибку
            self._log_request(
                method=method,
                endpoint=endpoint,
                error_message=error_message
            )
            
            return {
                'success': False,
                'error': error_message
            }
    
    def get(self, endpoint: str, params: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """GET запрос к API"""
        return self.make_request('GET', endpoint, params=params, **kwargs)
    
    def post(self, endpoint: str, data: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """POST запрос к API"""
        return self.make_request('POST', endpoint, data=data, **kwargs)
    
    def put(self, endpoint: str, data: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """PUT запрос к API"""
        return self.make_request('PUT', endpoint, data=data, **kwargs)
    
    def patch(self, endpoint: str, data: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """PATCH запрос к API"""
        return self.make_request('PATCH', endpoint, data=data, **kwargs)
    
    def delete(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        """DELETE запрос к API"""
        return self.make_request('DELETE', endpoint, **kwargs)
    
    # ==================== МЕТОДЫ ДЛЯ РАБОТЫ С ПРОФИЛЕМ ====================
    
    def get_me(self) -> Dict[str, Any]:
        """
        Получает информацию о текущем пользователе
        
        Returns:
            Данные профиля пользователя
        """
        return self.get('/me')
    
    def update_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Обновляет профиль пользователя
        
        Args:
            data: Данные для обновления профиля
            
        Returns:
            Результат обновления
        """
        return self.put('/me', data=data)
    
    # ==================== МЕТОДЫ ДЛЯ РАБОТЫ С ВАКАНСИЯМИ ====================
    
    def get_vacancies(self, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Получает список вакансий работодателя
        
        Args:
            params: Параметры фильтрации (page, per_page, etc.)
            
        Returns:
            Список вакансий
        """
        return self.get('/employers/me/vacancies', params=params)
    
    def get_vacancy(self, vacancy_id: str) -> Dict[str, Any]:
        """
        Получает информацию о вакансии
        
        Args:
            vacancy_id: ID вакансии
            
        Returns:
            Данные вакансии
        """
        return self.get(f'/vacancies/{vacancy_id}')
    
    # ==================== МЕТОДЫ ДЛЯ РАБОТЫ С ОТКЛИКАМИ ====================
    
    def get_responses(self, vacancy_id: Optional[str] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Получает список откликов
        
        Args:
            vacancy_id: ID вакансии (опционально)
            params: Параметры фильтрации
            
        Returns:
            Список откликов
        """
        if vacancy_id:
            endpoint = f'/employers/me/vacancies/{vacancy_id}/responses'
        else:
            endpoint = '/employers/me/responses'
        
        return self.get(endpoint, params=params)
    
    def get_response(self, response_id: str) -> Dict[str, Any]:
        """
        Получает информацию об отклике
        
        Args:
            response_id: ID отклика
            
        Returns:
            Данные отклика
        """
        return self.get(f'/employers/me/responses/{response_id}')
    
    def update_response_status(
        self,
        response_id: str,
        status: str,
        comment: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Обновляет статус отклика
        
        Args:
            response_id: ID отклика
            status: Новый статус (invitation, rejection, etc.)
            comment: Комментарий (опционально)
            
        Returns:
            Результат обновления
        """
        data = {'status': status}
        if comment:
            data['comment'] = comment
        
        return self.put(f'/employers/me/responses/{response_id}', data=data)
    
    # ==================== МЕТОДЫ ДЛЯ РАБОТЫ С РЕЗЮМЕ ====================
    
    def get_resume(self, resume_id: str) -> Dict[str, Any]:
        """
        Получает информацию о резюме
        
        Args:
            resume_id: ID резюме
            
        Returns:
            Данные резюме
        """
        return self.get(f'/resumes/{resume_id}')
    
    # ==================== МЕТОДЫ ДЛЯ РАБОТЫ С РАБОТОДАТЕЛЯМИ ====================
    
    def get_employer_info(self, employer_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Получает информацию о работодателе
        
        Args:
            employer_id: ID работодателя (если не указан, используется текущий)
            
        Returns:
            Данные работодателя
        """
        if employer_id:
            endpoint = f'/employers/{employer_id}'
        else:
            endpoint = '/employers/me'
        
        return self.get(endpoint)
    
    def test_connection(self) -> Tuple[bool, str]:
        """
        Тестирует подключение к HH.ru API
        
        Returns:
            Кортеж (успешно ли подключение, сообщение)
        """
        try:
            result = self.get_me()
            if result.get('success'):
                return True, "Подключение к HH.ru API успешно"
            else:
                return False, result.get('error', 'Неизвестная ошибка')
        except Exception as e:
            return False, f"Ошибка подключения: {str(e)}"


class HHRUOAuthService:
    """
    Сервис для работы с OAuth авторизацией HeadHunter.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: authorization_code, user
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru OAuth API
    ОБРАБОТКА: Обмен кода авторизации на токены, создание/обновление аккаунта
    ВЫХОДЯЩИЕ ДАННЫЕ: HHRUAccount с токенами
    СВЯЗИ: HHRUAccount, HHRUConfiguration
    ФОРМАТ: Статические методы класса
    """
    
    OAUTH_URL = "https://hh.ru/oauth"
    
    @staticmethod
    def get_authorization_url(user, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
        """
        Получает URL для авторизации пользователя
        
        Args:
            user: Пользователь
            redirect_uri: URI для перенаправления после авторизации
            
        Returns:
            Словарь с URL авторизации и параметрами
        """
        config = HHRUConfiguration.get_default(user)
        if not config:
            return {
                'success': False,
                'error': 'Конфигурация HH.ru не найдена'
            }
        
        if not redirect_uri:
            redirect_uri = config.redirect_uri
        
        # Параметры для авторизации
        params = {
            'response_type': 'code',
            'client_id': config.client_id,
            'redirect_uri': redirect_uri,
            'state': str(user.id)  # Используем ID пользователя как state для безопасности
        }
        
        auth_url = f"{HHRUOAuthService.OAUTH_URL}/authorize?" + "&".join(
            [f"{k}={v}" for k, v in params.items()]
        )
        
        return {
            'success': True,
            'auth_url': auth_url,
            'params': params
        }
    
    @staticmethod
    def exchange_code_for_tokens(
        user,
        authorization_code: str,
        redirect_uri: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Обменивает код авторизации на токены доступа
        
        Args:
            user: Пользователь
            authorization_code: Код авторизации из callback
            redirect_uri: URI для перенаправления (должен совпадать с использованным)
            
        Returns:
            Результат обмена токенов
        """
        config = HHRUConfiguration.get_default(user)
        if not config:
            return {
                'success': False,
                'error': 'Конфигурация HH.ru не найдена'
            }
        
        if not redirect_uri:
            redirect_uri = config.redirect_uri
        
        try:
            # Запрос на обмен кода на токены
            response = requests.post(
                f"{HHRUOAuthService.OAUTH_URL}/token",
                data={
                    'grant_type': 'authorization_code',
                    'code': authorization_code,
                    'client_id': config.client_id,
                    'client_secret': config.client_secret,
                    'redirect_uri': redirect_uri
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Получаем информацию о пользователе
                access_token = token_data.get('access_token')
                if not access_token:
                    return {
                        'success': False,
                        'error': 'Токен доступа не получен'
                    }
                
                # Временно создаем сервис для получения данных профиля
                temp_account = HHRUAccount(
                    user=user,
                    access_token=access_token,
                    refresh_token=token_data.get('refresh_token'),
                    token_expires_at=timezone.now() + timedelta(
                        seconds=token_data.get('expires_in', 3600)
                    )
                )
                
                service = HHRUService(user)
                service.account = temp_account
                
                # Получаем данные профиля
                profile_result = service.get_me()
                if not profile_result.get('success'):
                    return {
                        'success': False,
                        'error': 'Не удалось получить данные профиля'
                    }
                
                profile_data = profile_result.get('data', {})
                
                # Создаем или обновляем аккаунт
                account, created = HHRUAccount.objects.update_or_create(
                    user=user,
                    defaults={
                        'access_token': access_token,
                        'refresh_token': token_data.get('refresh_token'),
                        'token_expires_at': timezone.now() + timedelta(
                            seconds=token_data.get('expires_in', 3600)
                        ),
                        'hh_user_id': str(profile_data.get('id', '')),
                        'email': profile_data.get('email', ''),
                        'first_name': profile_data.get('first_name', ''),
                        'last_name': profile_data.get('last_name', ''),
                        'middle_name': profile_data.get('middle_name', ''),
                        'is_employer': profile_data.get('is_employer', False),
                        'is_admin': profile_data.get('is_admin', False),
                        'profile_data': profile_data,
                        'last_sync_at': timezone.now()
                    }
                )
                
                return {
                    'success': True,
                    'account': account,
                    'created': created
                }
            else:
                error_data = response.json() if response.content else {}
                error_message = error_data.get('error_description', error_data.get('error', 'Unknown error'))
                return {
                    'success': False,
                    'error': error_message,
                    'status_code': response.status_code
                }
                
        except Exception as e:
            logger.error(f"Ошибка обмена кода на токены: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

