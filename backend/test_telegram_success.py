#!/usr/bin/env python3
"""
Тест успешной авторизации Telegram
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

from apps.telegram.telegram_client import run_telegram_auth_async
from apps.telegram.models import TelegramUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

User = get_user_model()

async def test_successful_auth():
    """Тест успешной авторизации"""
    try:
        # Получаем пользователя
        user = await sync_to_async(User.objects.get)(username='andrei.golubenko')
        telegram_user = await sync_to_async(TelegramUser.objects.get)(user=user)
        
        logger.info(f"Тестируем авторизацию для {user.username}")
        
        # Генерируем QR-код
        logger.info("Генерируем QR-код...")
        qr_data, qr_url, status = await run_telegram_auth_async(
            user.id, 'generate_qr'
        )
        
        if status != "success":
            logger.error(f"Ошибка генерации QR: {status}")
            return
        
        logger.info(f"QR-код создан: {qr_url}")
        
        # Ждем авторизации
        logger.info("Ждем авторизации...")
        for i in range(10):  # Ждем до 50 секунд
            auth_status, user_data, error = await run_telegram_auth_async(
                user.id, 'wait_auth'
            )
            
            logger.info(f"Попытка {i+1}: статус={auth_status}, данные={user_data}, ошибка={error}")
            
            if auth_status == "success":
                logger.info("✅ Авторизация успешна!")
                logger.info(f"Данные пользователя: {user_data}")
                break
            elif auth_status == "2fa_required":
                logger.info("🔐 Требуется 2FA")
                break
            elif auth_status == "error":
                logger.error(f"❌ Ошибка: {error}")
                break
            elif auth_status == "timeout":
                logger.info("⏰ Таймаут, продолжаем...")
                continue
            else:
                logger.info(f"⏳ Ожидание... ({auth_status})")
                await asyncio.sleep(5)
        
        # Проверяем финальное состояние
        await sync_to_async(telegram_user.refresh_from_db)()
        logger.info(f"Финальное состояние: авторизован={telegram_user.is_authorized}, telegram_id={telegram_user.telegram_id}")
        
    except Exception as e:
        logger.error(f"Ошибка теста: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_successful_auth())
