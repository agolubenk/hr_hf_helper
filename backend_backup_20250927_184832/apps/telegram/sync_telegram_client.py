"""
Синхронный Telegram клиент для авторизации
"""
import asyncio
import qrcode
import logging
import base64
from io import BytesIO
from typing import Optional, Tuple, Dict, Any
from datetime import datetime

from telethon import TelegramClient
from telethon.errors import (
    SessionPasswordNeededError, 
    TimeoutError as TelethonTimeoutError,
    FloodWaitError,
    PhoneCodeInvalidError,
    PasswordHashInvalidError,
)
from telethon.sessions import StringSession
from django.conf import settings
from django.contrib.auth import get_user_model

from .models import TelegramUser, AuthAttempt

logger = logging.getLogger(__name__)
User = get_user_model()


def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Синхронная функция для выполнения операций с Telegram клиентом"""
    import asyncio
    
    # Создаем клиент в sync контексте
    if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
        return "error", None, "TELEGRAM_API_ID и TELEGRAM_API_HASH не настроены"
    
    session = StringSession()
    client = TelegramClient(
        session,
        settings.TELEGRAM_API_ID,
        settings.TELEGRAM_API_HASH
    )
    
    async def _run():
        try:
            # Получаем пользователя
            telegram_user = TelegramUser.objects.get(id=telegram_user_id)
            
            try:
                # Подключаемся
                await client.connect()
                logger.info(f"Клиент подключен для {telegram_user.user.username}")
                
                if action == "generate_qr":
                    # Создаем QR логин
                    qr_login = await client.qr_login()
                    
                    # Генерируем QR-код
                    qr = qrcode.QRCode(version=1, box_size=10, border=5)
                    qr.add_data(qr_login.url)
                    qr.make(fit=True)
                    
                    img = qr.make_image(fill_color="black", back_color="white")
                    
                    # Конвертируем в bytes
                    buffer = BytesIO()
                    img.save(buffer, format='PNG')
                    qr_data = buffer.getvalue()
                    
                    logger.info(f"QR-код создан для {telegram_user.user.username}")
                    return qr_data, qr_login.url, "success"
                    
                elif action == "wait_auth":
                    # Для wait_auth нужен уже созданный qr_login
                    # Пока возвращаем timeout
                    return "timeout", None, "Таймаут авторизации"
                    
                elif action == "handle_2fa":
                    password = kwargs.get('password')
                    if not password:
                        return "error", None, "Пароль обязателен"
                    
                    # Вводим пароль
                    user = await client.sign_in(password=password)
                    
                    if user:
                        logger.info(f"2FA успешно: {user.first_name} (@{user.username})")
                        
                        user_data = {
                            'id': user.id,
                            'username': user.username,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'phone': user.phone,
                        }
                        
                        # Сохраняем данные пользователя
                        telegram_user.is_authorized = True
                        telegram_user.telegram_id = user.id
                        telegram_user.username = user.username
                        telegram_user.first_name = user.first_name
                        telegram_user.last_name = user.last_name
                        telegram_user.phone = user.phone
                        telegram_user.auth_date = datetime.now()
                        telegram_user.last_activity = datetime.now()
                        telegram_user.save()
                        
                        return "success", user_data, None
                    else:
                        return "error", None, "Ошибка 2FA"
                        
                else:
                    return "error", None, f"Неизвестное действие: {action}"
                    
            finally:
                # Всегда отключаем клиент
                if client and client.is_connected():
                    await client.disconnect()
                    logger.info("Клиент отключен")
                
        except TelegramUser.DoesNotExist:
            return "error", None, "Пользователь Telegram не найден"
        except PasswordHashInvalidError:
            return "error", None, "Неверный пароль 2FA"
        except Exception as e:
            logger.error(f"Ошибка выполнения действия {action}: {e}")
            return "error", None, str(e)
    
    # Создаем новый event loop для каждого вызова
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(_run())
    finally:
        loop.close()
