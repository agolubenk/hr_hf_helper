"""
Класс для хранения сессий Telegram в базе данных Django
"""
from telethon.sessions import StringSession
from .models import TelegramSession
from asgiref.sync import sync_to_async


class DBSessions(StringSession):
    """
    Класс для хранения сессий Telegram в базе данных Django
    
    Наследует от StringSession и сохраняет данные сессии в модели TelegramSession
    """
    
    def __init__(self, user):
        """
        Инициализация сессии для пользователя
        
        Args:
            user: Пользователь Django
        """
        # Получаем или создаем запись сессии в БД
        tg_sess, created = TelegramSession.objects.get_or_create(
            user=user,
            defaults={'name': f'tg_{user.id}'}
        )
        
        # Инициализируем StringSession с данными из БД
        super().__init__(self._load_data(tg_sess))
        self.name = tg_sess.name
        self._tg_session = tg_sess
        self._auto_save = False  # Отключаем автоматическое сохранение

    def _load_data(self, tg_sess):
        """
        Загружает данные сессии из модели
        
        Args:
            tg_sess: Объект TelegramSession
            
        Returns:
            str: Данные сессии или пустая строка
        """
        return tg_sess.session_data or ''

    def save(self):
        """
        Сохраняет данные сессии в базу данных
        """
        try:
            # Получаем данные сессии в виде строки
            data = super().save()
            
            # Сохраняем только если включено автоматическое сохранение
            if self._auto_save:
                self._save_to_db(data)
            
            return data
            
        except Exception as e:
            # Логируем ошибку, но не прерываем выполнение
            import logging
            logger = logging.getLogger('apps.telegram')
            logger.error(f"Ошибка сохранения сессии {self.name}: {e}")
            return super().save()
    
    def save_async(self):
        """
        Асинхронно сохраняет данные сессии в базу данных
        """
        try:
            # Получаем данные сессии в виде строки
            data = super().save()
            
            # Обновляем запись в БД асинхронно
            import asyncio
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Если цикл уже запущен, создаем задачу
                loop.create_task(self._save_to_db_async(data))
            else:
                # Если цикл не запущен, запускаем его
                loop.run_until_complete(self._save_to_db_async(data))
            
        except Exception as e:
            # Логируем ошибку, но не прерываем выполнение
            import logging
            logger = logging.getLogger('apps.telegram')
            logger.error(f"Ошибка асинхронного сохранения сессии {self.name}: {e}")
    
    async def _save_to_db_async(self, data):
        """
        Асинхронно сохраняет данные в базу данных
        """
        try:
            # Обновляем запись в БД
            tg_sess = await sync_to_async(TelegramSession.objects.get)(name=self.name)
            tg_sess.session_data = data
            tg_sess.is_authorized = bool(data)  # Авторизован, если есть данные сессии
            await sync_to_async(tg_sess.save)()
            
        except TelegramSession.DoesNotExist:
            # Если запись не найдена, создаем новую
            await sync_to_async(TelegramSession.objects.create)(
                user=self._tg_session.user,
                name=self.name,
                session_data=data,
                is_authorized=bool(data)
            )
    
    def _save_to_db(self, data):
        """
        Синхронно сохраняет данные в базу данных
        """
        try:
            # Обновляем запись в БД
            tg_sess = TelegramSession.objects.get(name=self.name)
            tg_sess.session_data = data
            tg_sess.is_authorized = bool(data)  # Авторизован, если есть данные сессии
            tg_sess.save()
            
        except TelegramSession.DoesNotExist:
            # Если запись не найдена, создаем новую
            TelegramSession.objects.create(
                user=self._tg_session.user,
                name=self.name,
                session_data=data,
                is_authorized=bool(data)
            )
    
    def save_to_string(self):
        """
        Возвращает данные сессии в виде строки
        """
        return super().save()

    def delete(self):
        """
        Удаляет сессию из базы данных
        """
        try:
            TelegramSession.objects.filter(name=self.name).update(
                session_data='',
                is_authorized=False
            )
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.telegram')
            logger.error(f"Ошибка удаления сессии {self.name}: {e}")

    @classmethod
    def get_session_status(cls, user):
        """
        Получает статус сессии пользователя
        
        Args:
            user: Пользователь Django
            
        Returns:
            dict: Статус сессии
        """
        try:
            tg_sess = TelegramSession.objects.get(user=user)
            return {
                'exists': True,
                'authorized': tg_sess.is_authorized,
                'has_data': bool(tg_sess.session_data),
                'created_at': tg_sess.created_at,
                'updated_at': tg_sess.updated_at
            }
        except TelegramSession.DoesNotExist:
            return {
                'exists': False,
                'authorized': False,
                'has_data': False,
                'created_at': None,
                'updated_at': None
            }

    @classmethod
    def reset_session(cls, user):
        """
        Сбрасывает сессию пользователя
        
        Args:
            user: Пользователь Django
        """
        try:
            tg_sess = TelegramSession.objects.get(user=user)
            tg_sess.session_data = ''
            tg_sess.is_authorized = False
            tg_sess.save()
        except TelegramSession.DoesNotExist:
            pass
