#!/usr/bin/env python3
"""
Тест Telegram авторизации
"""
import os
import sys
import django
import asyncio
import logging

# Настройка Django
sys.path.append('/Users/agolubenko/hrhelper/fullstack/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.telegram.models import TelegramUser
from apps.telegram.telegram_client import run_telegram_auth_async
from asgiref.sync import sync_to_async

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

User = get_user_model()

async def test_telegram_auth():
    """Тест Telegram авторизации"""
    try:
        # Получаем пользователя
        user = await sync_to_async(User.objects.get)(username='andrei.golubenko')
        telegram_user = await sync_to_async(TelegramUser.objects.get)(user=user)
        
        logger.info(f"Тестируем авторизацию для {user.username}")
        logger.info(f"Telegram пользователь: {telegram_user}")
        logger.info(f"Авторизован: {telegram_user.is_authorized}")
        logger.info(f"QR активен: {telegram_user.qr_login_active}")
        logger.info(f"Клиент инициализирован: {telegram_user.client_initialized}")
        
        # Проверяем статус авторизации
        logger.info("Проверяем статус авторизации...")
        status, user_data, error = await run_telegram_auth_async(
            telegram_user.id, 'wait_auth', timeout=30
        )
        
        logger.info(f"Статус: {status}")
        logger.info(f"Данные пользователя: {user_data}")
        logger.info(f"Ошибка: {error}")
        
        # Обновляем данные из базы
        await sync_to_async(telegram_user.refresh_from_db)()
        logger.info(f"Обновленный статус авторизации: {telegram_user.is_authorized}")
        
    except Exception as e:
        logger.error(f"Ошибка теста: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_telegram_auth())
