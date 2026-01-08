"""
Сервис для работы с n8n API
"""
import requests
import logging
from typing import Dict, Any, Optional
from django.contrib.auth import get_user_model
from .models import N8NWebhook, N8NRequest

User = get_user_model()
logger = logging.getLogger(__name__)


class N8NService:
    """
    Сервис для отправки и получения данных из n8n
    """
    
    def __init__(self, user: User):
        """
        Инициализация сервиса
        
        Args:
            user: Пользователь Django
        """
        self.user = user
    
    def send_webhook(
        self,
        webhook: N8NWebhook,
        data: Dict[str, Any],
        method: str = 'POST',
        timeout: int = 30
    ) -> Optional[N8NRequest]:
        """
        Отправка данных в n8n webhook
        
        Args:
            webhook: Объект N8NWebhook
            data: Данные для отправки
            method: HTTP метод (POST, GET, PUT, DELETE)
            timeout: Таймаут запроса в секундах
            
        Returns:
            N8NRequest объект с результатом запроса
        """
        if not webhook.is_active:
            logger.warning(f"Webhook {webhook.name} неактивен")
            return None
        
        # Создаем запись о запросе
        n8n_request = N8NRequest.objects.create(
            webhook=webhook,
            user=self.user,
            request_type='webhook',
            status='pending',
            url=webhook.webhook_url,
            method=method,
            request_data=data
        )
        
        try:
            # Отправляем запрос
            if method.upper() == 'GET':
                response = requests.get(
                    webhook.webhook_url,
                    params=data,
                    timeout=timeout
                )
            elif method.upper() == 'POST':
                response = requests.post(
                    webhook.webhook_url,
                    json=data,
                    timeout=timeout
                )
            elif method.upper() == 'PUT':
                response = requests.put(
                    webhook.webhook_url,
                    json=data,
                    timeout=timeout
                )
            elif method.upper() == 'DELETE':
                response = requests.delete(
                    webhook.webhook_url,
                    timeout=timeout
                )
            else:
                raise ValueError(f"Неподдерживаемый метод: {method}")
            
            # Обновляем запись о запросе
            n8n_request.response_status_code = response.status_code
            n8n_request.status = 'success' if response.status_code < 400 else 'error'
            
            # Пытаемся распарсить JSON ответ
            try:
                n8n_request.response_data = response.json()
            except ValueError:
                n8n_request.response_data = {'text': response.text}
            
            if response.status_code >= 400:
                n8n_request.error_message = f"HTTP {response.status_code}: {response.text[:500]}"
            
            n8n_request.save()
            
            logger.info(
                f"Запрос к n8n webhook {webhook.name} выполнен: "
                f"статус {response.status_code}"
            )
            
            return n8n_request
            
        except requests.exceptions.RequestException as e:
            # Обработка ошибок сети
            n8n_request.status = 'error'
            n8n_request.error_message = str(e)
            n8n_request.save()
            
            logger.error(
                f"Ошибка при отправке запроса к n8n webhook {webhook.name}: {e}"
            )
            
            return n8n_request
    
    def send_to_webhook_by_name(
        self,
        webhook_name: str,
        data: Dict[str, Any],
        method: str = 'POST'
    ) -> Optional[N8NRequest]:
        """
        Отправка данных в webhook по имени
        
        Args:
            webhook_name: Название webhook
            data: Данные для отправки
            method: HTTP метод
            
        Returns:
            N8NRequest объект с результатом запроса или None
        """
        try:
            webhook = N8NWebhook.objects.get(
                name=webhook_name,
                user=self.user,
                is_active=True
            )
            return self.send_webhook(webhook, data, method)
        except N8NWebhook.DoesNotExist:
            logger.error(f"Webhook '{webhook_name}' не найден для пользователя {self.user.username}")
            return None
    
    def get_webhook_requests(
        self,
        webhook: Optional[N8NWebhook] = None,
        status: Optional[str] = None,
        limit: int = 100
    ):
        """
        Получение истории запросов
        
        Args:
            webhook: Фильтр по webhook (опционально)
            status: Фильтр по статусу (опционально)
            limit: Лимит записей
            
        Returns:
            QuerySet запросов
        """
        queryset = N8NRequest.objects.filter(user=self.user)
        
        if webhook:
            queryset = queryset.filter(webhook=webhook)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')[:limit]
