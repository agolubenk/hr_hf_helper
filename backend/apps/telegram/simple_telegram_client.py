"""
Простой стабильный Telegram клиент без кэширования
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
from asgiref.sync import sync_to_async

from .models import TelegramUser, AuthAttempt

logger = logging.getLogger('apps.telegram')
User = get_user_model()


def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Синхронная обертка для простого Telegram клиента"""
    import asyncio
    
    async def _run():
        try:
            # Получаем пользователя
            telegram_user = await sync_to_async(TelegramUser.objects.get)(id=telegram_user_id)
            
            # Создаем новый клиент для каждого запроса
            client = SimpleTelegramClient(telegram_user)
            
            try:
                if action == "generate_qr":
                    return await client.generate_qr_code()
                elif action == "wait_auth":
                    timeout = kwargs.get('timeout', 3)
                    return await client.wait_for_auth(timeout)
                elif action == "handle_2fa":
                    password = kwargs.get('password')
                    if not password:
                        return "error", None, "Пароль обязателен"
                    return await client.handle_2fa(password)
                elif action == "get_chats":
                    return await client.get_chats()
                elif action == "get_messages":
                    chat_id = kwargs.get('chat_id')
                    if not chat_id:
                        return "error", None, "ID чата обязателен"
                    return await client.get_messages(chat_id)
                else:
                    return "error", None, f"Неизвестное действие: {action}"
            finally:
                # Всегда отключаем клиент
                await client.disconnect()
                
        except TelegramUser.DoesNotExist:
            return "error", None, "Пользователь Telegram не найден"
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


class SimpleTelegramClient:
    """Простой Telegram клиент для авторизации"""
    
    def __init__(self, telegram_user: TelegramUser):
        self.telegram_user = telegram_user
        self.client = None
        self.qr_login = None
        
    async def init_client(self) -> bool:
        """Инициализация клиента"""
        try:
            if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
                logger.error("TELEGRAM_API_ID и TELEGRAM_API_HASH не настроены")
                return False
            
            # Создаем новую сессию для каждого запроса
            session = StringSession()
            
            # Создаем клиент в sync контексте
            self.client = await sync_to_async(lambda: TelegramClient(
                session,
                settings.TELEGRAM_API_ID,
                settings.TELEGRAM_API_HASH
            ))()
            
            await self.client.connect()
            logger.info(f"Клиент подключен для {self.telegram_user.user.username}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка инициализации клиента: {e}")
            return False
    
    async def generate_qr_code(self) -> Tuple[Optional[bytes], Optional[str], str]:
        """Генерация QR-кода"""
        try:
            if not await self.init_client():
                return None, None, "Ошибка инициализации клиента"
            
            # Создаем QR логин
            self.qr_login = await self.client.qr_login()
            
            # Генерируем QR-код
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(self.qr_login.url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Конвертируем в bytes
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_data = buffer.getvalue()
            
            logger.info(f"QR-код создан для {self.telegram_user.user.username}")
            return qr_data, self.qr_login.url, "success"
            
        except Exception as e:
            logger.error(f"Ошибка генерации QR: {e}")
            return None, None, str(e)
    
    async def wait_for_auth(self, timeout: int = 3) -> Tuple[str, Optional[Dict], Optional[str]]:
        """Ожидание авторизации"""
        try:
            # Сначала проверяем состояние в базе данных
            await sync_to_async(self.telegram_user.refresh_from_db)()
            
            # Если пользователь уже авторизован в базе, сразу возвращаем успех
            if self.telegram_user.is_authorized:
                logger.info(f"Пользователь {self.telegram_user.user.username} уже авторизован в базе данных")
                user_data = {
                    'id': self.telegram_user.telegram_id,
                    'username': self.telegram_user.username,
                    'first_name': self.telegram_user.first_name,
                    'last_name': self.telegram_user.last_name,
                    'phone': self.telegram_user.phone,
                }
                return "success", user_data, None
            
            if not self.qr_login:
                return "error", None, "QR логин не инициализирован"
            
            logger.info(f"Ожидание авторизации (timeout: {timeout}s)")
            
            # Ждем авторизации
            user = await asyncio.wait_for(self.qr_login.wait(), timeout=timeout)
            
            if user:
                logger.info(f"Пользователь авторизован: {user.first_name} (@{user.username})")
                
                # Сохраняем данные пользователя
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                }
                
                # Обновляем базу данных
                await self._save_user_data(user)
                
                return "success", user_data, None
            else:
                return "timeout", None, "Таймаут авторизации"
                
        except asyncio.TimeoutError:
            logger.info("Таймаут авторизации")
            return "timeout", None, "Таймаут авторизации"
        except SessionPasswordNeededError:
            logger.info("Требуется 2FA")
            return "2fa_required", None, "Требуется двухфакторная аутентификация"
        except Exception as e:
            logger.error(f"Ошибка ожидания авторизации: {e}")
            return "error", None, str(e)
    
    async def handle_2fa(self, password: str) -> Tuple[str, Optional[Dict], Optional[str]]:
        """Обработка 2FA"""
        try:
            if not self.client:
                return "error", None, "Клиент не инициализирован"
            
            logger.info("Обработка 2FA")
            
            # Вводим пароль
            user = await self.client.sign_in(password=password)
            
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
                await self._save_user_data(user)
                
                return "success", user_data, None
            else:
                return "error", None, "Ошибка 2FA"
                
        except PasswordHashInvalidError:
            return "error", None, "Неверный пароль 2FA"
        except Exception as e:
            logger.error(f"Ошибка 2FA: {e}")
            return "error", None, str(e)
    
    async def get_chats(self) -> Tuple[str, Optional[list], Optional[str]]:
        """Получение списка чатов"""
        try:
            if not await self.init_client():
                return "error", None, "Клиент не инициализирован"
                
            if not await self.client.is_user_authorized():
                return "error", None, "Пользователь не авторизован"
            
            logger.info(f"Получение чатов для {self.telegram_user.user.username}")
            
            # Получаем диалоги
            dialogs = await self.client.get_dialogs(limit=50)
            
            chats = []
            for dialog in dialogs:
                chat_data = {
                    'id': str(dialog.id),
                    'title': dialog.title or dialog.name or f"Chat {dialog.id}",
                    'type': 'private' if dialog.is_user else 'group' if dialog.is_group else 'channel',
                    'last_message': dialog.message.text[:100] if dialog.message and dialog.message.text else None,
                    'last_message_date': dialog.message.date.isoformat() if dialog.message and dialog.message.date else None,
                    'unread_count': dialog.unread_count or 0,
                }
                chats.append(chat_data)
            
            logger.info(f"Получено {len(chats)} чатов для {self.telegram_user.user.username}")
            return "success", chats, None
            
        except Exception as e:
            logger.error(f"Ошибка получения чатов: {e}")
            return "error", None, str(e)
    
    async def get_messages(self, chat_id: str) -> Tuple[str, Optional[Dict], Optional[str]]:
        """Получение сообщений чата"""
        try:
            if not await self.init_client():
                return "error", None, "Клиент не инициализирован"
                
            if not await self.client.is_user_authorized():
                return "error", None, "Пользователь не авторизован"
            
            logger.info(f"Получение сообщений для чата {chat_id} от {self.telegram_user.user.username}")
            
            # Получаем entity чата
            try:
                entity = await self.client.get_entity(int(chat_id))
            except ValueError:
                # Если не число, пробуем как username
                entity = await self.client.get_entity(chat_id)
            
            # Получаем сообщения
            messages = []
            async for message in self.client.iter_messages(entity, limit=50):
                message_data = {
                    'id': message.id,
                    'text': message.text or '',
                    'date': message.date.isoformat() if message.date else None,
                    'is_outgoing': message.out,
                    'sender_id': message.sender_id,
                    'reply_to': message.reply_to_msg_id,
                }
                messages.append(message_data)
            
            # Получаем название чата
            chat_title = getattr(entity, 'title', None) or getattr(entity, 'first_name', None) or f"Chat {chat_id}"
            
            result = {
                'messages': messages,
                'chat_title': chat_title,
                'chat_id': chat_id
            }
            
            logger.info(f"Получено {len(messages)} сообщений для чата {chat_id}")
            return "success", result, None
            
        except Exception as e:
            logger.error(f"Ошибка получения сообщений: {e}")
            return "error", None, str(e)
    
    async def _save_user_data(self, user):
        """Сохранение данных пользователя"""
        try:
            # Обновляем данные в базе
            self.telegram_user.is_authorized = True
            self.telegram_user.telegram_id = user.id
            self.telegram_user.username = user.username
            self.telegram_user.first_name = user.first_name
            self.telegram_user.last_name = user.last_name
            self.telegram_user.phone = user.phone
            self.telegram_user.auth_date = datetime.now()
            self.telegram_user.last_activity = datetime.now()
            self.telegram_user.client_initialized = False
            self.telegram_user.qr_login_active = False
            
            await sync_to_async(self.telegram_user.save)()
            
            logger.info(f"Данные пользователя сохранены: {user.first_name}")
            
        except Exception as e:
            logger.error(f"Ошибка сохранения данных пользователя: {e}")
    
    async def disconnect(self):
        """Отключение клиента"""
        try:
            if self.client and self.client.is_connected():
                await self.client.disconnect()
                logger.info("Клиент отключен")
        except Exception as e:
            logger.error(f"Ошибка отключения клиента: {e}")