from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

from .models import NotionSettings, NotionBulkImport, NotionSyncLog
from .services import NotionService, NotionAPIError

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task(bind=True)
def bulk_import_notion_pages(self, user_id, database_id, max_pages=100):
    """
    Массовый импорт страниц из Notion
    
    Args:
        user_id: ID пользователя
        database_id: ID базы данных Notion
        max_pages: Максимальное количество страниц для импорта
    """
    try:
        user = User.objects.get(id=user_id)
        settings = NotionSettings.objects.get(user=user)
        
        # Создаем запись о массовом импорте
        bulk_import = NotionBulkImport.objects.create(
            user=user,
            status='running',
            total_pages=0,  # Будет обновлено позже
            celery_task_id=self.request.id
        )
        
        logger.info(f"Начинаем массовый импорт для пользователя {user.username}")
        
        # Инициализируем сервис
        service = NotionService(user.notion_integration_token)
        
        # Получаем все страницы из базы данных
        all_pages = service.get_pages_from_database(database_id)
        
        if not all_pages:
            bulk_import.status = 'completed'
            bulk_import.completed_at = timezone.now()
            bulk_import.save()
            return {
                'status': 'completed',
                'message': 'Нет страниц для импорта',
                'total_pages': 0
            }
        
        # Ограничиваем количество страниц
        if len(all_pages) > max_pages:
            all_pages = all_pages[:max_pages]
        
        # Обновляем общее количество страниц
        bulk_import.total_pages = len(all_pages)
        bulk_import.save()
        
        pages_processed = 0
        pages_created = 0
        pages_updated = 0
        failed_pages = []
        
        # Обрабатываем каждую страницу
        for page_data in all_pages:
            try:
                # Проверяем, не отменена ли задача
                if self.is_aborted():
                    bulk_import.status = 'cancelled'
                    bulk_import.completed_at = timezone.now()
                    bulk_import.save()
                    return {
                        'status': 'cancelled',
                        'message': 'Задача отменена пользователем'
                    }
                
                # Парсим данные страницы
                parsed_data = service.parse_page_data(page_data)
                
                # Создаем или обновляем страницу
                from .models import NotionPage
                page, created = NotionPage.objects.get_or_create(
                    page_id=parsed_data['page_id'],
                    user=user,
                    defaults=parsed_data
                )
                
                if created:
                    pages_created += 1
                else:
                    # Обновляем существующую страницу
                    for field, value in parsed_data.items():
                        if hasattr(page, field):
                            setattr(page, field, value)
                    page.save()
                    pages_updated += 1
                
                pages_processed += 1
                
                # Обновляем прогресс
                bulk_import.processed_pages = pages_processed
                bulk_import.successful_pages = pages_created + pages_updated
                bulk_import.save()
                
                # Обновляем статус задачи
                self.update_state(
                    state='PROGRESS',
                    meta={
                        'current': pages_processed,
                        'total': len(all_pages),
                        'pages_created': pages_created,
                        'pages_updated': pages_updated
                    }
                )
                
            except Exception as e:
                logger.error(f"Ошибка обработки страницы {page_data.get('id', 'unknown')}: {e}")
                failed_pages.append(page_data.get('id', 'unknown'))
                bulk_import.failed_pages += 1
                bulk_import.failed_page_ids.append(page_data.get('id', 'unknown'))
                bulk_import.save()
                continue
        
        # Завершаем массовый импорт
        if failed_pages:
            bulk_import.status = 'partial'
            bulk_import.error_message = f"Не удалось обработать {len(failed_pages)} страниц"
        else:
            bulk_import.status = 'completed'
        
        bulk_import.completed_at = timezone.now()
        bulk_import.save()
        
        # Создаем лог синхронизации
        NotionSyncLog.objects.create(
            user=user,
            status='success' if not failed_pages else 'partial',
            pages_processed=pages_processed,
            pages_created=pages_created,
            pages_updated=pages_updated,
            error_message=bulk_import.error_message if failed_pages else None
        )
        
        # Обновляем время последней синхронизации
        settings.last_sync_at = timezone.now()
        settings.save()
        
        logger.info(f"Массовый импорт завершен для пользователя {user.username}: {pages_processed} страниц")
        
        return {
            'status': 'completed',
            'message': f'Импорт завершен: {pages_processed} страниц обработано',
            'total_pages': pages_processed,
            'pages_created': pages_created,
            'pages_updated': pages_updated,
            'failed_pages': len(failed_pages)
        }
        
    except User.DoesNotExist:
        logger.error(f"Пользователь с ID {user_id} не найден")
        return {
            'status': 'failed',
            'message': 'Пользователь не найден'
        }
    except NotionSettings.DoesNotExist:
        logger.error(f"Настройки Notion не найдены для пользователя {user_id}")
        return {
            'status': 'failed',
            'message': 'Настройки Notion не найдены'
        }
    except NotionAPIError as e:
        logger.error(f"Ошибка Notion API: {e}")
        return {
            'status': 'failed',
            'message': f'Ошибка Notion API: {str(e)}'
        }
    except Exception as e:
        logger.error(f"Неожиданная ошибка при массовом импорте: {e}")
        return {
            'status': 'failed',
            'message': f'Неожиданная ошибка: {str(e)}'
        }


@shared_task
def retry_failed_pages(user_id, failed_page_ids):
    """
    Повторная попытка импорта неудачных страниц
    
    Args:
        user_id: ID пользователя
        failed_page_ids: Список ID неудачных страниц
    """
    try:
        user = User.objects.get(id=user_id)
        service = NotionService(user.notion_integration_token)
        
        logger.info(f"Повторный импорт {len(failed_page_ids)} страниц для пользователя {user.username}")
        
        pages_processed = 0
        pages_created = 0
        pages_updated = 0
        still_failed = []
        
        for page_id in failed_page_ids:
            try:
                # Получаем данные страницы
                page_data = service.get_page_data(page_id)
                
                if not page_data:
                    still_failed.append(page_id)
                    continue
                
                # Парсим данные страницы
                parsed_data = service.parse_page_data(page_data)
                
                # Создаем или обновляем страницу
                from .models import NotionPage
                page, created = NotionPage.objects.get_or_create(
                    page_id=parsed_data['page_id'],
                    user=user,
                    defaults=parsed_data
                )
                
                if created:
                    pages_created += 1
                else:
                    # Обновляем существующую страницу
                    for field, value in parsed_data.items():
                        if hasattr(page, field):
                            setattr(page, field, value)
                    page.save()
                    pages_updated += 1
                
                pages_processed += 1
                
            except Exception as e:
                logger.error(f"Ошибка повторного импорта страницы {page_id}: {e}")
                still_failed.append(page_id)
                continue
        
        logger.info(f"Повторный импорт завершен: {pages_processed} страниц обработано, {len(still_failed)} все еще неудачных")
        
        return {
            'status': 'completed',
            'message': f'Повторный импорт завершен: {pages_processed} страниц обработано',
            'pages_processed': pages_processed,
            'pages_created': pages_created,
            'pages_updated': pages_updated,
            'still_failed': still_failed
        }
        
    except User.DoesNotExist:
        logger.error(f"Пользователь с ID {user_id} не найден")
        return {
            'status': 'failed',
            'message': 'Пользователь не найден'
        }
    except Exception as e:
        logger.error(f"Неожиданная ошибка при повторном импорте: {e}")
        return {
            'status': 'failed',
            'message': f'Неожиданная ошибка: {str(e)}'
        }


@shared_task
def auto_sync_notion_pages(user_id):
    """
    Автоматическая синхронизация страниц Notion
    
    Args:
        user_id: ID пользователя
    """
    try:
        user = User.objects.get(id=user_id)
        settings = NotionSettings.objects.get(user=user)
        
        if not settings.auto_sync or not settings.database_id:
            logger.info(f"Автосинхронизация отключена для пользователя {user.username}")
            return {
                'status': 'skipped',
                'message': 'Автосинхронизация отключена'
            }
        
        logger.info(f"Запуск автосинхронизации для пользователя {user.username}")
        
        # Инициализируем сервис
        service = NotionService(user.notion_integration_token)
        
        # Синхронизируем страницы
        pages_processed, pages_created, pages_updated = service.sync_pages(
            settings.database_id, 
            user, 
            max_pages=50  # Ограничиваем для автосинхронизации
        )
        
        logger.info(f"Автосинхронизация завершена для пользователя {user.username}: {pages_processed} страниц")
        
        return {
            'status': 'completed',
            'message': f'Автосинхронизация завершена: {pages_processed} страниц',
            'pages_processed': pages_processed,
            'pages_created': pages_created,
            'pages_updated': pages_updated
        }
        
    except User.DoesNotExist:
        logger.error(f"Пользователь с ID {user_id} не найден")
        return {
            'status': 'failed',
            'message': 'Пользователь не найден'
        }
    except NotionSettings.DoesNotExist:
        logger.error(f"Настройки Notion не найдены для пользователя {user_id}")
        return {
            'status': 'failed',
            'message': 'Настройки Notion не найдены'
        }
    except Exception as e:
        logger.error(f"Неожиданная ошибка при автосинхронизации: {e}")
        return {
            'status': 'failed',
            'message': f'Неожиданная ошибка: {str(e)}'
        }
