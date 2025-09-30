import requests
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class HuntflowTokenService:
    """Сервис для управления токенами Huntflow"""
    
    def __init__(self, user):
        self.user = user
    
    def _get_base_url(self):
        """Получает базовый URL для API запросов"""
        if self.user.active_system == 'prod':
            return self.user.huntflow_prod_url
        else:
            return self.user.huntflow_sandbox_url
    
    def refresh_access_token(self):
        """
        Обновляет access token используя refresh token
        
        Returns:
            bool: True если обновление успешно, False иначе
        """
        if not self.user.huntflow_refresh_token:
            logger.error(f"Нет refresh token для пользователя {self.user.username}")
            return False
        
        if not self.user.is_huntflow_refresh_valid:
            logger.error(f"Refresh token истек для пользователя {self.user.username}")
            return False
        
        try:
            # Формируем URL для обновления токена
            base_url = self._get_base_url()
            if base_url.endswith('/v2'):
                url = f"{base_url}/token/refresh"
            else:
                url = f"{base_url}/v2/token/refresh"
            
            data = {
                'refresh_token': self.user.huntflow_refresh_token
            }
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Обновляем токен для пользователя {self.user.username}")
            
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Обновляем токены пользователя
                self.user.set_huntflow_tokens(
                    access_token=token_data['access_token'],
                    refresh_token=token_data['refresh_token'],
                    expires_in=token_data.get('expires_in', 604800),
                    refresh_expires_in=token_data.get('refresh_token_expires_in', 1209600)
                )
                
                logger.info(f"Токен успешно обновлен для пользователя {self.user.username}")
                return True
            else:
                logger.error(f"Ошибка обновления токена: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Исключение при обновлении токена: {e}")
            return False
    
    def ensure_valid_token(self):
        """
        Проверяет валидность токена и обновляет при необходимости
        
        Returns:
            str: Валидный access token или None
        """
        # Если токен валиден, возвращаем его
        if self.user.is_huntflow_token_valid:
            return self.user.huntflow_access_token
        
        # Если токен истек, пытаемся обновить
        if self.refresh_access_token():
            return self.user.huntflow_access_token
        
        # Если обновить не удалось, возвращаем None
        logger.error(f"Не удалось получить валидный токен для пользователя {self.user.username}")
        return None
    
    def validate_token_setup(self):
        """
        Проверяет корректность настройки токенов
        
        Returns:
            dict: Статус проверки
        """
        issues = []
        
        if not self.user.huntflow_access_token:
            issues.append("Отсутствует access token")
        
        if not self.user.huntflow_refresh_token:
            issues.append("Отсутствует refresh token")
        
        if not self.user.is_huntflow_token_valid:
            issues.append("Access token истек")
        
        if not self.user.is_huntflow_refresh_valid:
            issues.append("Refresh token истек")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'access_expires_at': self.user.huntflow_token_expires_at,
            'refresh_expires_at': self.user.huntflow_refresh_expires_at
        }
