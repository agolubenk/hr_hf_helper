"""
Демо Telegram клиент для стабильной работы
"""
import qrcode
import logging
import base64
from io import BytesIO
from typing import Optional, Tuple, Dict, Any
from datetime import datetime
from django.utils import timezone

from django.conf import settings
from django.contrib.auth import get_user_model

from .models import TelegramUser, AuthAttempt

logger = logging.getLogger('apps.telegram')
User = get_user_model()


def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Демо-версия для стабильной работы"""
    
    try:
        # Получаем пользователя
        telegram_user = TelegramUser.objects.get(id=telegram_user_id)
        
        if action == "generate_qr":
            return _generate_demo_qr(telegram_user)
        elif action == "wait_auth":
            timeout = kwargs.get('timeout', 3)
            return _wait_demo_auth(telegram_user, timeout)
        elif action == "handle_2fa":
            password = kwargs.get('password')
            if not password:
                return "error", None, "Пароль обязателен"
            return _handle_demo_2fa(telegram_user, password)
        elif action == "get_chats":
            return _get_demo_chats(telegram_user)
        elif action == "get_messages":
            chat_id = kwargs.get('chat_id')
            if not chat_id:
                return "error", None, "ID чата обязателен"
            return _get_demo_messages(telegram_user, chat_id)
        else:
            return "error", None, f"Неизвестное действие: {action}"
            
    except TelegramUser.DoesNotExist:
        return "error", None, "Пользователь Telegram не найден"
    except Exception as e:
        logger.error(f"Ошибка выполнения действия {action}: {e}")
        return "error", None, str(e)


def _generate_demo_qr(telegram_user: TelegramUser):
    """Генерация демо QR-кода"""
    try:
        logger.info(f"🎯 ДЕМО: Создание QR-кода для {telegram_user.user.username}")
        
        # Создаем демо URL
        demo_url = f"https://t.me/demo_auth?user={telegram_user.user.username}&session={telegram_user.session_name}"
        
        # Генерируем QR-код
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(demo_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Конвертируем в bytes
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_data = buffer.getvalue()
        
        # Конвертируем в base64 для передачи в JSON
        qr_base64 = base64.b64encode(qr_data).decode('utf-8')
        qr_data_url = f"data:image/png;base64,{qr_base64}"
        
        logger.info(f"🎯 ДЕМО: QR-код создан для {telegram_user.user.username}")
        return qr_data_url, demo_url, "success"
        
    except Exception as e:
        logger.error(f"Ошибка создания демо QR: {e}")
        return None, None, str(e)


def _wait_demo_auth(telegram_user: TelegramUser, timeout: int = 3):
    """Демо ожидание авторизации"""
    try:
        # Сначала проверяем состояние в базе данных
        telegram_user.refresh_from_db()
        
        # Если пользователь уже авторизован в базе, сразу возвращаем успех
        if telegram_user.is_authorized:
            logger.info(f"🎯 ДЕМО: Пользователь {telegram_user.user.username} уже авторизован")
            user_data = {
                'id': telegram_user.telegram_id,
                'username': telegram_user.username,
                'first_name': telegram_user.first_name,
                'last_name': telegram_user.last_name,
                'phone': telegram_user.phone,
            }
            return "success", user_data, None
        
        # В демо-режиме всегда возвращаем waiting
        logger.info(f"🎯 ДЕМО: Ожидание авторизации для {telegram_user.user.username}")
        return "waiting", None, "Ожидание сканирования QR-кода"
        
    except Exception as e:
        logger.error(f"Ошибка демо ожидания: {e}")
        return "error", None, str(e)


def _handle_demo_2fa(telegram_user: TelegramUser, password: str):
    """Демо обработка 2FA"""
    try:
        logger.info(f"🎯 ДЕМО: 2FA запрос для {telegram_user.user.username}")
        
        # В демо-режиме принимаем любой пароль
        if password == "demo123":
            # Имитируем успешную авторизацию с уникальным ID
            user_data = {
                'id': 1000000000 + telegram_user.id,  # Уникальный ID для каждого пользователя
                'username': f'demo_user_{telegram_user.id}',
                'first_name': 'Demo',
                'last_name': 'User',
                'phone': f'+123456789{telegram_user.id}'
            }
            
            # Сохраняем данные пользователя
            telegram_user.is_authorized = True
            telegram_user.telegram_id = user_data['id']
            telegram_user.username = user_data['username']
            telegram_user.first_name = user_data['first_name']
            telegram_user.last_name = user_data['last_name']
            telegram_user.phone = user_data['phone']
            telegram_user.auth_date = timezone.now()
            telegram_user.last_activity = timezone.now()
            telegram_user.save()
            
            logger.info(f"🎯 ДЕМО: 2FA успешно для {telegram_user.user.username}")
            return "success", user_data, None
        else:
            return "error", None, "Неверный пароль. Используйте 'demo123' для демо-режима"
        
    except Exception as e:
        logger.error(f"Ошибка демо 2FA: {e}")
        return "error", None, str(e)


def _get_demo_chats(telegram_user: TelegramUser):
    """Демо получение чатов"""
    try:
        if not telegram_user.is_authorized:
            return "error", None, "Пользователь не авторизован"
        
        logger.info(f"🎯 ДЕМО: Запрос чатов для {telegram_user.user.username}")
        
        # Создаем демо чаты
        demo_chats = [
            {
                'id': '123456789',
                'title': 'Demo Chat 1',
                'type': 'private',
                'last_message': 'Привет! Это демо сообщение.',
                'last_message_date': datetime.now().isoformat(),
                'unread_count': 2,
            },
            {
                'id': '987654321',
                'title': 'Demo Group',
                'type': 'group',
                'last_message': 'Демо сообщение в группе',
                'last_message_date': datetime.now().isoformat(),
                'unread_count': 0,
            },
            {
                'id': '555666777',
                'title': 'Demo Channel',
                'type': 'channel',
                'last_message': 'Новости из демо канала',
                'last_message_date': datetime.now().isoformat(),
                'unread_count': 5,
            }
        ]
        
        logger.info(f"🎯 ДЕМО: Возвращаем {len(demo_chats)} демо чатов")
        return "success", demo_chats, None
        
    except Exception as e:
        logger.error(f"Ошибка получения демо чатов: {e}")
        return "error", None, str(e)


def _get_demo_messages(telegram_user: TelegramUser, chat_id: str):
    """Демо получение сообщений"""
    try:
        if not telegram_user.is_authorized:
            return "error", None, "Пользователь не авторизован"
        
        logger.info(f"🎯 ДЕМО: Запрос сообщений для чата {chat_id} от {telegram_user.user.username}")
        
        # Создаем демо сообщения
        demo_messages = [
            {
                'id': 1,
                'text': 'Привет! Это первое демо сообщение.',
                'date': datetime.now().isoformat(),
                'is_outgoing': False,
                'sender_id': 123456789,
                'reply_to': None,
            },
            {
                'id': 2,
                'text': 'Привет! Это ответ на демо сообщение.',
                'date': datetime.now().isoformat(),
                'is_outgoing': True,
                'sender_id': telegram_user.telegram_id,
                'reply_to': 1,
            },
            {
                'id': 3,
                'text': 'Как дела? Все работает отлично!',
                'date': datetime.now().isoformat(),
                'is_outgoing': False,
                'sender_id': 123456789,
                'reply_to': None,
            }
        ]
        
        result = {
            'messages': demo_messages,
            'chat_title': f'Demo Chat {chat_id}',
            'chat_id': chat_id
        }
        
        logger.info(f"🎯 ДЕМО: Возвращаем {len(demo_messages)} демо сообщений")
        return "success", result, None
        
    except Exception as e:
        logger.error(f"Ошибка получения демо сообщений: {e}")
        return "error", None, str(e)
