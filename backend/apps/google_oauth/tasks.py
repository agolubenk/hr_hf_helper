"""
Задачи Celery для Google OAuth
"""
from celery import shared_task
from django.utils import timezone
from django.db import models
from datetime import timedelta
import logging

from .models import GoogleOAuthAccount
from .services import GoogleOAuthService

logger = logging.getLogger(__name__)


@shared_task
def refresh_google_oauth_tokens():
    """
    Автоматическое обновление истекших токенов Google OAuth
    
    Запускается каждые 30 минут для проверки и обновления токенов,
    которые истекают в ближайшие 10 минут
    """
    try:
        # Находим токены, которые истекают в ближайшие 10 минут
        expiry_threshold = timezone.now() + timedelta(minutes=10)
        
        accounts_to_refresh = GoogleOAuthAccount.objects.filter(
            token_expires_at__lte=expiry_threshold,
            refresh_token__isnull=False
        ).exclude(refresh_token='')
        
        refreshed_count = 0
        failed_count = 0
        
        for account in accounts_to_refresh:
            try:
                oauth_service = GoogleOAuthService(account.user)
                
                # Пытаемся обновить токен
                if oauth_service.refresh_token():
                    refreshed_count += 1
                    logger.info(f"✅ Токен обновлен для пользователя: {account.user.username}")
                else:
                    failed_count += 1
                    logger.warning(f"❌ Не удалось обновить токен для пользователя: {account.user.username}")
                    
            except Exception as e:
                failed_count += 1
                logger.error(f"❌ Ошибка при обновлении токена для {account.user.username}: {e}")
        
        logger.info(f"🔄 Обновление токенов завершено. Обновлено: {refreshed_count}, Ошибок: {failed_count}")
        
        return {
            'success': True,
            'refreshed_count': refreshed_count,
            'failed_count': failed_count,
            'total_checked': len(accounts_to_refresh)
        }
        
    except Exception as e:
        logger.error(f"❌ Критическая ошибка при обновлении токенов: {e}")
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def cleanup_expired_oauth_accounts():
    """
    ОТКЛЮЧЕНО: Очистка истекших OAuth аккаунтов
    
    Эта функция отключена, так как удаление OAuth аккаунтов может привести
    к потере доступа пользователей после отпусков или длительного отсутствия.
    Токены должны обновляться автоматически, а не удаляться.
    """
    logger.info("⚠️ Очистка OAuth аккаунтов отключена для безопасности пользователей")
    
    return {
        'success': True,
        'message': 'Очистка OAuth аккаунтов отключена для безопасности',
        'deleted_count': 0
    }


@shared_task
def validate_oauth_tokens():
    """
    Валидация всех OAuth токенов
    
    Проверяет валидность всех токенов и обновляет статистику
    """
    try:
        total_accounts = GoogleOAuthAccount.objects.count()
        valid_tokens = 0
        expired_tokens = 0
        needs_refresh = 0
        
        for account in GoogleOAuthAccount.objects.all():
            if account.is_token_valid():
                valid_tokens += 1
            else:
                expired_tokens += 1
                if account.needs_refresh():
                    needs_refresh += 1
        
        logger.info(f"📊 Статистика OAuth токенов: Всего: {total_accounts}, Валидных: {valid_tokens}, Истекших: {expired_tokens}, Требуют обновления: {needs_refresh}")
        
        return {
            'success': True,
            'total_accounts': total_accounts,
            'valid_tokens': valid_tokens,
            'expired_tokens': expired_tokens,
            'needs_refresh': needs_refresh
        }
        
    except Exception as e:
        logger.error(f"❌ Ошибка при валидации токенов: {e}")
        return {
            'success': False,
            'error': str(e)
        }
