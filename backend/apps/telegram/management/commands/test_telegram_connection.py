import asyncio
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.telegram.models import TelegramUser
from apps.telegram.telegram_client import TelegramAuthClient

logger = logging.getLogger('apps.telegram')


class Command(BaseCommand):
    help = 'Тестирование подключения к Telegram API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='ID конкретного TelegramUser для тестирования'
        )

    def handle(self, *args, **options):
        if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
            self.stdout.write(
                self.style.ERROR('TELEGRAM_API_ID и TELEGRAM_API_HASH не настроены')
            )
            return

        if options['user_id']:
            self.test_single_user(options['user_id'])
        else:
            self.test_connection()

    def test_single_user(self, user_id):
        try:
            telegram_user = TelegramUser.objects.get(id=user_id)
            asyncio.run(self.run_test_for_user(telegram_user))
        except TelegramUser.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'TelegramUser с ID {user_id} не найден')
            )

    def test_connection(self):
        """Тестирование базового подключения к Telegram"""
        self.stdout.write('Тестирование подключения к Telegram API...')
        try:
            # Простая проверка настроек
            if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
                self.stdout.write(
                    self.style.ERROR('❌ TELEGRAM_API_ID и TELEGRAM_API_HASH не настроены')
                )
                return
            
            self.stdout.write(
                self.style.SUCCESS('✅ API ключи настроены')
            )
            self.stdout.write(f'API_ID: {settings.TELEGRAM_API_ID}')
            self.stdout.write(f'API_HASH: {settings.TELEGRAM_API_HASH[:10]}...')
            
            # Проверяем модели
            from apps.telegram.models import TelegramUser
            user_count = TelegramUser.objects.count()
            self.stdout.write(f'Telegram пользователей в базе: {user_count}')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Ошибка: {e}')
            )

    async def run_basic_test(self):
        """Базовый тест подключения"""
        from telethon import TelegramClient
        from django_telethon_session.sessions import DjangoSession
        
        session = DjangoSession("test_connection")
        client = TelegramClient(
            session,
            int(settings.TELEGRAM_API_ID),
            settings.TELEGRAM_API_HASH
        )
        
        try:
            await client.connect()
            self.stdout.write(
                self.style.SUCCESS('✅ Подключение к Telegram API успешно')
            )
            
            if await client.is_user_authorized():
                me = await client.get_me()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Пользователь авторизован: {me.first_name} (@{me.username})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('⚠️ Пользователь не авторизован')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Ошибка подключения: {e}')
            )
        finally:
            await client.disconnect()

    async def run_test_for_user(self, telegram_user):
        """Тест для конкретного пользователя"""
        auth_client = TelegramAuthClient(telegram_user)
        
        try:
            self.stdout.write(f'Тестирование для пользователя: {telegram_user.user.username}')
            
            if not await auth_client.init_client():
                self.stdout.write(
                    self.style.ERROR('❌ Не удалось инициализировать клиент')
                )
                return
            
            if not await auth_client.is_authorized():
                self.stdout.write(
                    self.style.WARNING('⚠️ Пользователь не авторизован')
                )
                return
            
            user_info = await auth_client.get_me()
            if user_info:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Пользователь авторизован: {user_info["first_name"]} (@{user_info["username"]})')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Не удалось получить информацию о пользователе')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Ошибка тестирования: {e}')
            )
        finally:
            await auth_client.disconnect()
