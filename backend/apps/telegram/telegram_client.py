"""
Модуль для работы с Telegram клиентом
"""
from telethon import TelegramClient
from django.conf import settings
from .db_sessions import DBSessions
import logging

logger = logging.getLogger('apps.telegram')


def get_client(user):
    """
    Получает Telegram клиент для пользователя
    
    Args:
        user: Пользователь Django
        
    Returns:
        TelegramClient: Клиент Telegram
    """
    try:
        # Создаем сессию для пользователя
        session = DBSessions(user)
        
        # Получаем API ID и API Hash из настроек
        api_id = getattr(settings, 'TELEGRAM_API_ID', None)
        api_hash = getattr(settings, 'TELEGRAM_API_HASH', None)
        
        if not api_id or not api_hash:
            raise ValueError("TELEGRAM_API_ID и TELEGRAM_API_HASH должны быть настроены в settings.py")
        
        # Создаем клиент
        client = TelegramClient(
            session,
            api_id,
            api_hash
        )
        
        logger.info(f"Создан Telegram клиент для пользователя {user.username}")
        return client
        
    except Exception as e:
        logger.error(f"Ошибка создания Telegram клиента для {user.username}: {e}")
        raise


def get_session_status(user):
    """
    Получает статус сессии пользователя
    
    Args:
        user: Пользователь Django
        
    Returns:
        dict: Статус сессии
    """
    try:
        return DBSessions.get_session_status(user)
    except Exception as e:
        logger.error(f"Ошибка получения статуса сессии для {user.username}: {e}")
        return {
            'exists': False,
            'authorized': False,
            'has_data': False,
            'error': str(e)
        }


def reset_session(user):
    """
    Сбрасывает сессию пользователя
    
    Args:
        user: Пользователь Django
    """
    try:
        DBSessions.reset_session(user)
        logger.info(f"Сессия сброшена для пользователя {user.username}")
    except Exception as e:
        logger.error(f"Ошибка сброса сессии для {user.username}: {e}")
        raise


async def check_auth_status(client):
    """
    Проверяет статус авторизации клиента
    
    Args:
        client: TelegramClient
        
    Returns:
        bool: True если авторизован, False в противном случае
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        return await client.is_user_authorized()
    except Exception as e:
        logger.error(f"Ошибка проверки авторизации: {e}")
        return False


async def get_user_info(client):
    """
    Получает информацию о пользователе
    
    Args:
        client: TelegramClient
        
    Returns:
        dict: Информация о пользователе
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        me = await client.get_me()
        return {
            'id': me.id,
            'username': me.username,
            'first_name': me.first_name,
            'last_name': me.last_name,
            'phone': me.phone
        }
    except Exception as e:
        logger.error(f"Ошибка получения информации о пользователе: {e}")
        return None


async def send_code_request(client, phone):
    """
    Отправляет запрос на получение кода авторизации
    
    Args:
        client: TelegramClient
        phone: Номер телефона
        
    Returns:
        bool: True если запрос отправлен успешно
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        await client.send_code_request(phone)
        logger.info(f"Код отправлен на номер {phone}")
        return True
    except Exception as e:
        logger.error(f"Ошибка отправки кода на {phone}: {e}")
        return False


async def sign_in_with_code(client, phone, code, password=None):
    """
    Авторизация по коду
    
    Args:
        client: TelegramClient
        phone: Номер телефона
        code: Код авторизации
        password: Пароль 2FA (опционально)
        
    Returns:
        bool: True если авторизация успешна
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        await client.sign_in(phone, code)
        
        # Если требуется пароль 2FA
        if password:
            await client.sign_in(password=password)
        
        logger.info(f"Пользователь {phone} успешно авторизован")
        return True
    except Exception as e:
        logger.error(f"Ошибка авторизации для {phone}: {e}")
        return False


async def generate_qr_code(client):
    """
    Генерирует QR код для авторизации
    
    Args:
        client: TelegramClient
        
    Returns:
        str: URL QR кода
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        # Временно возвращаем None, так как QR-авторизация не реализована
        logger.warning("QR-авторизация временно недоступна")
        return None
    except Exception as e:
        logger.error(f"Ошибка генерации QR кода: {e}")
        return None


async def wait_for_qr_login(client, timeout=60):
    """
    Ожидает авторизации по QR коду
    
    Args:
        client: TelegramClient
        timeout: Таймаут в секундах
        
    Returns:
        bool: True если авторизация успешна
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        qr_login = await client.qr_login()
        result = await qr_login.wait(timeout=timeout)
        logger.info(f"QR авторизация: {'успешна' if result else 'не завершена'}")
        return result
    except Exception as e:
        logger.error(f"Ошибка ожидания QR авторизации: {e}")
        return False


async def get_dialogs(client, limit=50):
    """
    Получает список диалогов
    
    Args:
        client: TelegramClient
        limit: Максимальное количество диалогов
        
    Returns:
        list: Список диалогов
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        dialogs = await client.get_dialogs(limit=limit)
        return [
            {
                'id': d.id,
                'title': d.title or str(d.entity),
                'type': type(d.entity).__name__
            }
            for d in dialogs
        ]
    except Exception as e:
        logger.error(f"Ошибка получения диалогов: {e}")
        return []


async def get_messages(client, chat_id, limit=50):
    """
    Получает сообщения из чата
    
    Args:
        client: TelegramClient
        chat_id: ID чата
        limit: Максимальное количество сообщений
        
    Returns:
        list: Список сообщений
    """
    try:
        if not client.is_connected():
            await client.connect()
        
        messages = await client.get_messages(chat_id, limit=limit)
        return [
            {
                'id': m.id,
                'sender_id': m.sender_id,
                'text': m.text or '',
                'date': m.date.isoformat() if m.date else None,
                'is_outgoing': m.out
            }
            for m in messages if m
        ]
    except Exception as e:
        logger.error(f"Ошибка получения сообщений из чата {chat_id}: {e}")
        return []
