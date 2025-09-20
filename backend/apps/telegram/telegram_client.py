import asyncio
import qrcode
import logging
import traceback
from io import BytesIO
from typing import Optional, Tuple, Dict, Any, List
from datetime import datetime, timedelta

from telethon import TelegramClient, events
from telethon.errors import (
    SessionPasswordNeededError, 
    TimeoutError as TelethonTimeoutError,
    FloodWaitError,
    PhoneCodeInvalidError,
    PasswordHashInvalidError,
    AuthRestartError
)
from telethon.sessions import StringSession
from django.conf import settings
from django.utils import timezone
from asgiref.sync import sync_to_async

from .models import TelegramUser, AuthAttempt

logger = logging.getLogger('apps.telegram')

# Глобальный кэш для клиентов Telegram
_telegram_clients = {}

# Асинхронные обертки для Django ORM
async def create_auth_attempt(telegram_user, attempt_type, status='pending'):
    """Создание попытки авторизации"""
    return await sync_to_async(AuthAttempt.objects.create)(
        telegram_user=telegram_user,
        attempt_type=attempt_type,
        status=status
    )

async def update_auth_attempt(auth_attempt, status, error_message=None):
    """Обновление попытки авторизации"""
    auth_attempt.status = status
    if error_message:
        auth_attempt.error_message = error_message
    await sync_to_async(auth_attempt.save)()

async def get_auth_attempt(telegram_user, attempt_type, status='pending'):
    """Получение попытки авторизации"""
    return await sync_to_async(AuthAttempt.objects.filter)(
        telegram_user=telegram_user,
        attempt_type=attempt_type,
        status=status
    ).first()


class TelegramAuthClient:
    """Класс для управления авторизацией Telegram пользователей"""
    
    def __init__(self, telegram_user: TelegramUser):
        self.telegram_user = telegram_user
        self.client = None
        self.qr_login = None
        self._is_initialized = False
        # Кэшируем данные пользователя для использования в async контексте
        # Получаем данные в синхронном контексте
        self.username = telegram_user.user.username
        self.session_name = telegram_user.session_name
        
    async def init_client(self) -> bool:
        """Инициализация клиента Telegram"""
        try:
            if self._is_initialized and self.client and self.client.is_connected():
                return True
                
            logger.info(f"Инициализация клиента для пользователя {self.username}")
            
            # Проверяем демо-режим
            if settings.TELEGRAM_DEMO_MODE:
                logger.info(f"Демо-режим: имитируем инициализацию клиента для {self.username}")
                self._is_initialized = True
                await sync_to_async(lambda: setattr(self.telegram_user, 'client_initialized', True))()
                await sync_to_async(lambda: setattr(self.telegram_user, 'last_activity', timezone.now()))()
                await sync_to_async(self.telegram_user.save)()
                return True
            
            # Создаем сессию (используем StringSession для простоты)
            session = StringSession()
            
            # Создаем клиента
            self.client = TelegramClient(
                session,
                int(settings.TELEGRAM_API_ID),
                settings.TELEGRAM_API_HASH,
                device_model="HR Helper Django Application",
                system_version="1.0",
                app_version="1.0",
                lang_code="ru",
                system_lang_code="ru"
            )
            
            # Подключаемся
            if not self.client.is_connected():
                await self.client.connect()
            
            # Обновляем состояние в базе данных
            await sync_to_async(lambda: setattr(self.telegram_user, 'client_initialized', True))()
            await sync_to_async(lambda: setattr(self.telegram_user, 'last_activity', timezone.now()))()
            await sync_to_async(self.telegram_user.save)()
                
            self._is_initialized = True
            logger.info(f"Клиент инициализирован для {self.username}")
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка инициализации клиента: {e}")
            logger.error(traceback.format_exc())
            return False
    
    async def is_authorized(self) -> bool:
        """Проверка авторизации"""
        try:
            if not self.client:
                return False
            return await self.client.is_user_authorized()
        except Exception as e:
            logger.error(f"Ошибка проверки авторизации: {e}")
            return False
    
    async def generate_qr_code(self) -> Tuple[Optional[bytes], Optional[str], str]:
        """
        Генерация QR-кода для авторизации
        
        Returns:
            Tuple[qr_image_bytes, qr_url, status]
        """
        try:
            if not await self.init_client():
                return None, None, "error_init"
            
            # Проверяем авторизацию
            if await self.is_authorized():
                return None, None, "already_authorized"
            
            # Создаем новую попытку авторизации
            auth_attempt = await create_auth_attempt(
                self.telegram_user,
                'qr',
                'pending'
            )
            
            logger.info(f"Создание QR-логина для {self.session_name}")
            
            # Проверяем демо-режим
            if settings.TELEGRAM_DEMO_MODE:
                logger.info(f"Демо-режим: создаем тестовый QR-код для {self.session_name}")
                
                # Создаем тестовый QR-код
                demo_url = "https://t.me/demo_qr_auth"
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(demo_url)
                qr.make(fit=True)
                
                # Создаем изображение
                img = qr.make_image(fill_color="black", back_color="white")
                
                # Сохраняем в BytesIO
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                buffer.seek(0)
                
                # Сохраняем состояние QR логина в базе данных
                await sync_to_async(lambda: setattr(self.telegram_user, 'qr_login_active', True))()
                await sync_to_async(lambda: setattr(self.telegram_user, 'last_activity', timezone.now()))()
                await sync_to_async(self.telegram_user.save)()
                
                logger.info(f"Демо QR-код создан для {self.session_name}")
                return buffer.getvalue(), demo_url, "success"
            
            # Создаем QR логин
            self.qr_login = await self.client.qr_login()
            
            if not self.qr_login or not self.qr_login.url:
                await update_auth_attempt(auth_attempt, 'failed', "Не удалось создать QR логин")
                return None, None, "error_qr_creation"
            
            # Генерируем QR-код
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.qr_login.url)
            qr.make(fit=True)
            
            # Создаем изображение
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Сохраняем в BytesIO
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Сохраняем состояние QR логина в базе данных
            await sync_to_async(lambda: setattr(self.telegram_user, 'qr_login_active', True))()
            await sync_to_async(lambda: setattr(self.telegram_user, 'last_activity', timezone.now()))()
            await sync_to_async(self.telegram_user.save)()
            
            logger.info(f"QR-код создан для {self.session_name}")
            return buffer.getvalue(), self.qr_login.url, "success"
            
        except Exception as e:
            logger.error(f"Ошибка создания QR-кода: {e}")
            logger.error(traceback.format_exc())
            
            # Обновляем статус попытки
            try:
                await update_auth_attempt(auth_attempt, 'failed', str(e))
            except:
                pass
                
            return None, None, "error"
    
    async def wait_for_auth(self, timeout: int = 30) -> Tuple[str, Optional[Dict], Optional[str]]:
        """
        Ожидание авторизации по QR-коду
        
        Returns:
            Tuple[status, user_data, error_message]
            
        Статусы:
            - "success": авторизация успешна
            - "2fa_required": требуется 2FA
            - "waiting": еще ожидаем
            - "timeout": истекло время
            - "error": ошибка
        """
        
        # ДОБАВЛЯЕМ: Сначала проверяем состояние в базе данных
        await sync_to_async(self.telegram_user.refresh_from_db)()
        
        # Если пользователь уже авторизован в базе, сразу возвращаем успех
        if self.telegram_user.is_authorized:
            logger.info(f"Пользователь {self.session_name} уже авторизован в базе данных")
            user_data = {
                'id': self.telegram_user.telegram_id,
                'username': self.telegram_user.username,
                'first_name': self.telegram_user.first_name,
                'last_name': self.telegram_user.last_name,
                'phone': self.telegram_user.phone,
            }
            return "success", user_data, None
        
        # Проверяем демо-режим
        if settings.TELEGRAM_DEMO_MODE:
            logger.info(f"Демо-режим: имитируем ожидание авторизации для {self.session_name}")
            # В демо-режиме всегда возвращаем 2FA для тестирования
            await asyncio.sleep(2)  # Имитируем задержку
            return "2fa_required", None, None
        
        # Проверяем состояние из базы данных
        if not self.telegram_user.qr_login_active:
            return "error", None, "QR логин не активен"
            
        if not self.qr_login:
            # Если QR логин не инициализирован, но в базе данных он активен,
            # значит сервер перезагрузился. Нужно пересоздать QR логин
            logger.info(f"QR логин не инициализирован для {self.session_name}, пересоздаем...")
            qr_data, qr_url, status = await self.generate_qr_code()
            if status != "success":
                return "error", None, "Не удалось пересоздать QR логин"
        
        try:
            logger.info(f"Ожидание авторизации для {self.session_name} (timeout: {timeout}s)")
            
            # Проверка авторизации уже сделана в начале метода через базу данных
            
            # Ждем авторизации
            user = await asyncio.wait_for(self.qr_login.wait(), timeout=timeout)
            
            if user:
                logger.info(f"Получен пользователь через QR: {user.first_name} (@{user.username})")
                
                # Проверяем, требуется ли 2FA
                if hasattr(user, 'two_factor_enabled') and user.two_factor_enabled:
                    logger.info(f"Требуется 2FA для {user.first_name} (@{user.username})")
                    
                    # Обновляем статус попытки
                    auth_attempt = await get_auth_attempt(
                        self.telegram_user,
                        'qr',
                        'pending'
                    )
                    
                    if auth_attempt:
                        await update_auth_attempt(auth_attempt, 'success')
                    
                    return "2fa_required", None, None
                else:
                    # Сохраняем данные пользователя
                    user_data = await self._save_user_data(user)
                    
                    # Обновляем статус попытки
                    auth_attempt = await get_auth_attempt(
                        self.telegram_user,
                        'qr',
                        'pending'
                    )
                    
                    if auth_attempt:
                        await update_auth_attempt(auth_attempt, 'success')
                    
                    logger.info(f"Авторизация успешна для {user.first_name} (@{user.username})")
                    return "success", user_data, None
            
            return "waiting", None, None
            
        except asyncio.TimeoutError:
            logger.info(f"Таймаут авторизации для {self.session_name}")
            return "timeout", None, "Время ожидания истекло"
            
        except SessionPasswordNeededError:
            logger.info(f"Требуется 2FA для {self.session_name}")
            return "2fa_required", None, "Требуется двухфакторная аутентификация"
            
        except Exception as e:
            logger.error(f"Ошибка ожидания авторизации: {e}")
            logger.error(traceback.format_exc())
            
            # Обновляем статус попытки
            auth_attempt = await get_auth_attempt(
                self.telegram_user,
                'qr',
                'pending'
            )
            
            if auth_attempt:
                await update_auth_attempt(auth_attempt, 'failed', str(e))
            
            return "error", None, str(e)
    
    async def handle_2fa(self, password: str) -> Tuple[str, Optional[Dict], Optional[str]]:
        """
        Обработка двухфакторной аутентификации
        
        Returns:
            Tuple[status, user_data, error_message]
        """
        try:
            logger.info(f"Обработка 2FA для {self.session_name}")
            
            # Проверяем демо-режим
            if settings.TELEGRAM_DEMO_MODE:
                logger.info(f"Демо-режим: имитируем обработку 2FA для {self.session_name}")
                
                # Создаем попытку 2FA
                auth_attempt = await create_auth_attempt(
                    self.telegram_user,
                    '2fa',
                    'pending'
                )
                
                # В демо-режиме принимаем любой пароль
                if password == "demo123":
                    # Имитируем успешную авторизацию
                    user_data = {
                        'id': 12345,
                        'username': 'demo_user',
                        'first_name': 'Demo',
                        'last_name': 'User',
                        'phone': '+1234567890'
                    }
                    
                    # Сохраняем данные пользователя
                    await sync_to_async(lambda: setattr(self.telegram_user, 'telegram_id', user_data['id']))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'username', user_data['username']))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'first_name', user_data['first_name']))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'last_name', user_data['last_name']))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'phone', user_data['phone']))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'is_authorized', True))()
                    await sync_to_async(lambda: setattr(self.telegram_user, 'auth_date', timezone.now()))()
                    await sync_to_async(self.telegram_user.save)()
                    
                    # Обновляем статус попытки
                    await update_auth_attempt(auth_attempt, 'success')
                    
                    logger.info(f"Демо 2FA успешно для {self.session_name}")
                    return "success", user_data, None
                else:
                    # Неверный пароль в демо-режиме
                    await update_auth_attempt(auth_attempt, 'failed', "Неверный демо-пароль")
                    return "error", None, "Неверный пароль. Используйте 'demo123' для демо-режима"
            
            # Создаем попытку 2FA
            auth_attempt = await create_auth_attempt(
                self.telegram_user,
                '2fa',
                'pending'
            )
            
            # Проверяем, что клиент подключен и в правильном состоянии
            if not self.client or not self.client.is_connected():
                logger.error(f"Клиент не подключен для {self.session_name}")
                await update_auth_attempt(auth_attempt, 'failed', "Клиент не подключен")
                return "error", None, "Клиент не подключен. Попробуйте пересоздать QR-код"
            
            # Проверяем, что клиент в правильном состоянии для 2FA
            try:
                # Вводим пароль
                await self.client.sign_in(password=password)
            except RuntimeError as e:
                if "event loop" in str(e):
                    logger.error(f"Ошибка event loop для {self.session_name}")
                    await update_auth_attempt(auth_attempt, 'failed', "Ошибка event loop. Попробуйте пересоздать QR-код")
                    return "error", None, "Ошибка event loop. Попробуйте пересоздать QR-код"
                else:
                    raise
            
            # Получаем данные пользователя
            user = await self.client.get_me()
            user_data = await self._save_user_data(user)
            
            # Обновляем статус попытки
            await update_auth_attempt(auth_attempt, 'success')
            
            logger.info(f"2FA успешно для {user.first_name}")
            return "success", user_data, None
            
        except PasswordHashInvalidError:
            error_msg = "Неверный пароль 2FA"
            logger.warning(f"Неверный пароль 2FA для {self.session_name}")
            
            await update_auth_attempt(auth_attempt, 'failed', error_msg)
            
            return "error", None, error_msg
            
        except Exception as e:
            error_msg = f"Ошибка 2FA: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            
            await update_auth_attempt(auth_attempt, 'failed', str(e))
            
            return "error", None, error_msg
    
    async def recreate_qr(self) -> Tuple[Optional[bytes], Optional[str], str]:
        """Пересоздание QR-кода при истечении времени"""
        try:
            logger.info(f"Пересоздание QR-кода для {self.session_name}")
            
            # Отключаем старый клиент
            if self.client and self.client.is_connected():
                await self.client.disconnect()
            
            # Очищаем состояние
            self.client = None
            self.qr_login = None
            self._is_initialized = False
            
            # Создаем новый QR-код
            return await self.generate_qr_code()
            
        except Exception as e:
            logger.error(f"Ошибка пересоздания QR: {e}")
            return None, None, "error"
    
    async def _save_user_data(self, user) -> Dict[str, Any]:
        """Сохранение данных авторизованного пользователя"""
        try:
            # Обновляем модель TelegramUser
            self.telegram_user.telegram_id = user.id
            self.telegram_user.username = user.username
            self.telegram_user.first_name = user.first_name
            self.telegram_user.last_name = user.last_name
            self.telegram_user.phone = user.phone
            self.telegram_user.is_authorized = True
            self.telegram_user.auth_date = timezone.now()
            await sync_to_async(self.telegram_user.save)()
            
            return {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone
            }
            
        except Exception as e:
            logger.error(f"Ошибка сохранения данных пользователя: {e}")
            raise
    
    async def get_me(self) -> Optional[Dict]:
        """Получение информации о текущем пользователе"""
        try:
            if not await self.init_client():
                return None
                
            if not await self.is_authorized():
                return None
                
            user = await self.client.get_me()
            return {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения данных пользователя: {e}")
            return None
    
    async def send_message(self, entity, message: str) -> bool:
        """Отправка сообщения"""
        try:
            if not await self.init_client():
                return False
                
            if not await self.is_authorized():
                return False
                
            await self.client.send_message(entity, message)
            logger.info(f"Сообщение отправлено от {self.session_name}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка отправки сообщения: {e}")
            return False
    
    async def get_chats(self) -> Tuple[str, Optional[List[Dict]], Optional[str]]:
        """Получение списка чатов"""
        try:
            if not await self.init_client():
                return "error", None, "Клиент не инициализирован"
                
            if not await self.is_authorized():
                return "error", None, "Пользователь не авторизован"
            
            logger.info(f"Получение чатов для {self.session_name}")
            
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
            
            logger.info(f"Получено {len(chats)} чатов для {self.session_name}")
            return "success", chats, None
            
        except Exception as e:
            logger.error(f"Ошибка получения чатов: {e}")
            return "error", None, str(e)
    
    async def get_messages(self, chat_id: str) -> Tuple[str, Optional[Dict], Optional[str]]:
        """Получение сообщений чата"""
        try:
            if not await self.init_client():
                return "error", None, "Клиент не инициализирован"
                
            if not await self.is_authorized():
                return "error", None, "Пользователь не авторизован"
            
            logger.info(f"Получение сообщений для чата {chat_id} от {self.session_name}")
            
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
    
    async def disconnect(self):
        """Отключение клиента"""
        try:
            if self.client and self.client.is_connected():
                await self.client.disconnect()
                logger.info(f"Клиент отключен для {self.session_name}")
            
            # Очищаем состояние в базе данных
            await sync_to_async(lambda: setattr(self.telegram_user, 'client_initialized', False))()
            await sync_to_async(lambda: setattr(self.telegram_user, 'qr_login_active', False))()
            await sync_to_async(self.telegram_user.save)()
                
            self._is_initialized = False
            
        except Exception as e:
            logger.error(f"Ошибка отключения клиента: {e}")


# Синхронная обёртка для использования в Django views
def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Синхронная обёртка для асинхронных операций Telegram"""
    import asyncio
    from asgiref.sync import sync_to_async
    
    # Создаем новый event loop для каждого вызова
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(run_telegram_auth_async(telegram_user_id, action, **kwargs))
    finally:
        loop.close()

async def run_telegram_auth_async(telegram_user_id: int, action: str, **kwargs):
    """
    Синхронная обёртка для асинхронных операций Telegram
    
    Args:
        telegram_user_id: ID модели TelegramUser
        action: действие ('generate_qr', 'wait_auth', 'handle_2fa', 'check_auth', 'get_me')
        **kwargs: дополнительные параметры
    """
    try:
        # Используем sync_to_async для получения пользователя
        telegram_user = await sync_to_async(TelegramUser.objects.get)(id=telegram_user_id)
        # Получаем данные пользователя в async контексте
        username = await sync_to_async(lambda: telegram_user.user.username)()
        session_name = await sync_to_async(lambda: telegram_user.session_name)()
        
        async def _execute():
            # Используем кэш для сохранения состояния клиента
            client_key = f"{telegram_user.id}_{session_name}"
            
            # Проверяем, нужно ли пересоздать клиент
            if (client_key not in _telegram_clients or 
                not telegram_user.client_initialized or
                action in ["generate_qr", "recreate_qr"] or
                (action == "wait_auth" and telegram_user.qr_login_active and client_key not in _telegram_clients)):
                
                # Очищаем старый клиент если есть
                if client_key in _telegram_clients:
                    try:
                        await _telegram_clients[client_key].disconnect()
                    except:
                        pass
                    del _telegram_clients[client_key]
                
                # Создаем новый клиент
                _telegram_clients[client_key] = TelegramAuthClient(telegram_user)
            
            auth_client = _telegram_clients[client_key]
            
            try:
                if action == "generate_qr":
                    return await auth_client.generate_qr_code()
                    
                elif action == "wait_auth":
                    timeout = kwargs.get('timeout', 30)
                    return await auth_client.wait_for_auth(timeout)
                    
                elif action == "handle_2fa":
                    password = kwargs.get('password')
                    if not password:
                        return "error", None, "Пароль обязателен"
                    return await auth_client.handle_2fa(password)
                    
                elif action == "check_auth":
                    return await auth_client.is_authorized()
                    
                elif action == "get_me":
                    return await auth_client.get_me()
                    
                elif action == "recreate_qr":
                    result = await auth_client.recreate_qr()
                    # Очищаем кэш после пересоздания
                    if client_key in _telegram_clients:
                        del _telegram_clients[client_key]
                    return result
                    
                elif action == "get_chats":
                    return await auth_client.get_chats()
                    
                elif action == "get_messages":
                    chat_id = kwargs.get('chat_id')
                    if not chat_id:
                        return "error", None, "ID чата обязателен"
                    return await auth_client.get_messages(chat_id)
                    
                elif action == "disconnect":
                    await auth_client.disconnect()
                    if client_key in _telegram_clients:
                        del _telegram_clients[client_key]
                    return "success", None, None
                    
                else:
                    return "error", None, f"Неизвестное действие: {action}"
                    
            except Exception as e:
                logger.error(f"Ошибка выполнения {action}: {e}")
                # При ошибке отключаем клиент
                try:
                    await auth_client.disconnect()
                    if client_key in _telegram_clients:
                        del _telegram_clients[client_key]
                except:
                    pass
                raise
        
        return await _execute()
        
    except TelegramUser.DoesNotExist:
        return "error", None, "Пользователь Telegram не найден"
        
    except Exception as e:
        logger.error(f"Ошибка выполнения действия {action}: {e}")
        logger.error(traceback.format_exc())
        return "error", None, str(e)
