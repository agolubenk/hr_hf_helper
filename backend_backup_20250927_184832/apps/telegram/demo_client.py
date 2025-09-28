"""
Демо-версия Telegram клиента для тестирования
"""
import qrcode
import logging
from io import BytesIO
from datetime import datetime

from .models import TelegramUser

logger = logging.getLogger(__name__)


def run_telegram_auth_sync(telegram_user_id: int, action: str, **kwargs):
    """Демо-версия для тестирования авторизации"""
    
    logger.info(f"🎯 ДЕМО-КЛИЕНТ: Вызов {action} для пользователя {telegram_user_id}")
    
    try:
        # Получаем пользователя
        telegram_user = TelegramUser.objects.get(id=telegram_user_id)
        
        if action == "generate_qr":
            # Создаем демо QR-код
            demo_url = "https://telegram.me/login_code?token=demo_token_123"
            
            # Генерируем QR-код
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(demo_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Конвертируем в bytes
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_data = buffer.getvalue()
            
            logger.info(f"Демо QR-код создан для {telegram_user.user.username}")
            return qr_data, demo_url, "success"
            
        elif action == "wait_auth":
            # В демо-режиме ждем 5 секунд, потом возвращаем 2FA
            import time
            time.sleep(5)
            logger.info(f"Демо: требование 2FA для {telegram_user.user.username}")
            return "2fa_required", None, "Требуется двухфакторная аутентификация"
            
        elif action == "handle_2fa":
            password = kwargs.get('password')
            if not password:
                return "error", None, "Пароль обязателен"
            
            # В демо-режиме принимаем любой пароль
            if password == "demo123":
                logger.info(f"Демо 2FA успешно для {telegram_user.user.username}")
                
                user_data = {
                    'id': 123456789,
                    'username': 'demo_user',
                    'first_name': 'Демо',
                    'last_name': 'Пользователь',
                    'phone': '+1234567890',
                }
                
                # Сохраняем данные пользователя
                telegram_user.is_authorized = True
                telegram_user.telegram_id = user_data['id']
                telegram_user.username = user_data['username']
                telegram_user.first_name = user_data['first_name']
                telegram_user.last_name = user_data['last_name']
                telegram_user.phone = user_data['phone']
                telegram_user.auth_date = datetime.now()
                telegram_user.last_activity = datetime.now()
                telegram_user.save()
                
                return "success", user_data, None
            else:
                return "error", None, "Неверный пароль 2FA"
                
        else:
            return "error", None, f"Неизвестное действие: {action}"
            
    except TelegramUser.DoesNotExist:
        return "error", None, "Пользователь Telegram не найден"
    except Exception as e:
        logger.error(f"Ошибка выполнения действия {action}: {e}")
        return "error", None, str(e)
