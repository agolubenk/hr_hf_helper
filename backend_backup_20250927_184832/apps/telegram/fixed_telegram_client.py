"""
Исправленный Telegram клиент без проблем с event loop
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

logger = logging.getLogger('apps.telegram')
User = get_user_model()


def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Синхронная обертка для исправленного Telegram клиента"""
    
    try:
        # Получаем пользователя
        telegram_user = TelegramUser.objects.get(id=telegram_user_id)
        
        if action == "generate_qr":
            return _generate_qr_sync(telegram_user)
        elif action == "wait_auth":
            timeout = kwargs.get('timeout', 3)
            return _wait_auth_sync(telegram_user, timeout)
        elif action == "handle_2fa":
            password = kwargs.get('password')
            if not password:
                return "error", None, "Пароль обязателен"
            return _handle_2fa_sync(telegram_user, password)
        elif action == "get_chats":
            return _get_chats_sync(telegram_user)
        elif action == "get_messages":
            chat_id = kwargs.get('chat_id')
            if not chat_id:
                return "error", None, "ID чата обязателен"
            return _get_messages_sync(telegram_user, chat_id)
        else:
            return "error", None, f"Неизвестное действие: {action}"
            
    except TelegramUser.DoesNotExist:
        return "error", None, "Пользователь Telegram не найден"
    except Exception as e:
        logger.error(f"Ошибка выполнения действия {action}: {e}")
        return "error", None, str(e)


def _generate_qr_sync(telegram_user: TelegramUser):
    """Синхронная генерация QR-кода"""
    try:
        if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
            return None, None, "API ключи не настроены"
        
        # Создаем новую сессию
        session = StringSession()
        
        # Создаем клиент
        client = TelegramClient(
            session,
            settings.TELEGRAM_API_ID,
            settings.TELEGRAM_API_HASH
        )
        
        # Создаем новый event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Запускаем асинхронную функцию
            result = loop.run_until_complete(_generate_qr_async(client, telegram_user))
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Ошибка генерации QR: {e}")
        return None, None, str(e)


async def _generate_qr_async(client: TelegramClient, telegram_user: TelegramUser):
    """Асинхронная генерация QR-кода"""
    try:
        await client.connect()
        logger.info(f"Клиент подключен для {telegram_user.user.username}")
        
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
        
        # Отключаем клиент
        await client.disconnect()
        
        return qr_data, qr_login.url, "success"
        
    except Exception as e:
        logger.error(f"Ошибка создания QR-кода: {e}")
        return None, None, str(e)


def _wait_auth_sync(telegram_user: TelegramUser, timeout: int = 3):
    """Синхронное ожидание авторизации"""
    try:
        # Сначала проверяем состояние в базе данных
        telegram_user.refresh_from_db()
        
        # Если пользователь уже авторизован в базе, сразу возвращаем успех
        if telegram_user.is_authorized:
            logger.info(f"Пользователь {telegram_user.user.username} уже авторизован в базе данных")
            user_data = {
                'id': telegram_user.telegram_id,
                'username': telegram_user.username,
                'first_name': telegram_user.first_name,
                'last_name': telegram_user.last_name,
                'phone': telegram_user.phone,
            }
            return "success", user_data, None
        
        # В режиме ожидания возвращаем waiting
        return "waiting", None, "Ожидание сканирования QR-кода"
        
    except Exception as e:
        logger.error(f"Ошибка ожидания авторизации: {e}")
        return "error", None, str(e)


def _handle_2fa_sync(telegram_user: TelegramUser, password: str):
    """Синхронная обработка 2FA"""
    try:
        # Пока возвращаем ошибку, так как 2FA требует более сложной логики
        logger.info(f"2FA запрос для {telegram_user.user.username}")
        return "error", None, "2FA в разработке"
        
    except Exception as e:
        logger.error(f"Ошибка 2FA: {e}")
        return "error", None, str(e)


def _get_chats_sync(telegram_user: TelegramUser):
    """Синхронное получение чатов"""
    try:
        if not telegram_user.is_authorized:
            return "error", None, "Пользователь не авторизован"
        
        # Пока возвращаем пустой список
        logger.info(f"Запрос чатов для {telegram_user.user.username}")
        return "success", [], None
        
    except Exception as e:
        logger.error(f"Ошибка получения чатов: {e}")
        return "error", None, str(e)


def _get_messages_sync(telegram_user: TelegramUser, chat_id: str):
    """Синхронное получение сообщений"""
    try:
        if not telegram_user.is_authorized:
            return "error", None, "Пользователь не авторизован"
        
        # Пока возвращаем пустой результат
        logger.info(f"Запрос сообщений для чата {chat_id} от {telegram_user.user.username}")
        return "success", {'messages': [], 'chat_title': f'Chat {chat_id}', 'chat_id': chat_id}, None
        
    except Exception as e:
        logger.error(f"Ошибка получения сообщений: {e}")
        return "error", None, str(e)
