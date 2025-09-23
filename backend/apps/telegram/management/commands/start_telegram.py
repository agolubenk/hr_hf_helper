import asyncio
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.telegram.models import TelegramUser
from apps.telegram.telegram_client import TelegramAuthClient

logger = logging.getLogger('apps.telegram')


class Command(BaseCommand):
    help = 'Запуск Telegram клиентов для всех авторизованных пользователей'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='ID конкретного TelegramUser для запуска'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Запустить для всех авторизованных пользователей'
        )

    def handle(self, *args, **options):
        if options['user_id']:
            self.start_single_user(options['user_id'])
        elif options['all']:
            self.start_all_users()
        else:
            self.stdout.write(
                self.style.ERROR('Укажите --user-id или --all')
            )

    def start_single_user(self, user_id):
        try:
            telegram_user = TelegramUser.objects.get(id=user_id)
            
            if not telegram_user.is_authorized:
                self.stdout.write(
                    self.style.ERROR(f'Пользователь {telegram_user} не авторизован')
                )
                return
            
            self.stdout.write(f'Запуск клиента для {telegram_user}...')
            asyncio.run(self.run_client(telegram_user))
            
        except TelegramUser.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'TelegramUser с ID {user_id} не найден')
            )

    def start_all_users(self):
        authorized_users = TelegramUser.objects.filter(is_authorized=True)
        
        if not authorized_users.exists():
            self.stdout.write(
                self.style.WARNING('Нет авторизованных пользователей')
            )
            return
        
        self.stdout.write(f'Найдено {authorized_users.count()} авторизованных пользователей')
        
        # Запускаем всех клиентов параллельно
        asyncio.run(self.run_multiple_clients(authorized_users))

    async def run_client(self, telegram_user):
        auth_client = TelegramAuthClient(telegram_user)
        
        try:
            if not await auth_client.init_client():
                self.stdout.write(
                    self.style.ERROR(f'Не удалось инициализировать клиент для {telegram_user}')
                )
                return
            
            if not await auth_client.is_authorized():
                self.stdout.write(
                    self.style.ERROR(f'Клиент {telegram_user} не авторизован')
                )
                return
            
            # Добавляем обработчики сообщений
            await self.setup_handlers(auth_client)
            
            self.stdout.write(
                self.style.SUCCESS(f'Клиент {telegram_user} запущен успешно')
            )
            
            # Держим клиент активным
            await auth_client.client.run_until_disconnected()
            
        except Exception as e:
            logger.error(f'Ошибка запуска клиента {telegram_user}: {e}')
            self.stdout.write(
                self.style.ERROR(f'Ошибка: {e}')
            )
        finally:
            await auth_client.disconnect()

    async def run_multiple_clients(self, telegram_users):
        tasks = []
        
        for telegram_user in telegram_users:
            task = asyncio.create_task(self.run_client(telegram_user))
            tasks.append(task)
        
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING('\nОстановка всех клиентов...')
            )
            for task in tasks:
                task.cancel()

    async def setup_handlers(self, auth_client):
        """Настройка обработчиков сообщений"""
        from telethon import events
        
        @auth_client.client.on(events.NewMessage)
        async def handle_new_message(event):
            # Логируем новые сообщения
            logger.info(
                f'Новое сообщение от {event.sender_id}: {event.raw_text[:50]}...'
            )
            
            # Здесь можно добавить логику обработки сообщений
            # Например, сохранение в базу данных
            
        self.stdout.write(
            f'Обработчики настроены для {auth_client.telegram_user}'
        )


