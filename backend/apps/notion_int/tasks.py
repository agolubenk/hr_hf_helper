from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

from .models import NotionSettings, NotionBulkImport, NotionSyncLog, NotionPage, NotionHuntflowMapping
from .services import NotionService, NotionAPIError

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task(bind=True)
def bulk_import_notion_pages(self, user_id, database_id, bulk_import_id=None, max_pages=100):
    """
    Массовый импорт страниц из Notion
    
    Args:
        user_id: ID пользователя
        database_id: ID базы данных Notion
        bulk_import_id: ID существующей записи массового импорта (если None, создается новая)
        max_pages: Максимальное количество страниц для импорта
    """
    logger.info(f"🚀 [CELERY TASK] Начало массового импорта: user_id={user_id}, database_id={database_id}, bulk_import_id={bulk_import_id}, max_pages={max_pages}")
    
    try:
        user = User.objects.get(id=user_id)
        logger.info(f"✅ [CELERY TASK] Пользователь найден: {user.username} (ID: {user.id})")
        
        settings = NotionSettings.objects.get(user=user)
        logger.info(f"✅ [CELERY TASK] Настройки Notion найдены, database_id={settings.database_id}")
        
        # Используем существующую запись или создаем новую
        if bulk_import_id:
            try:
                bulk_import = NotionBulkImport.objects.get(id=bulk_import_id, user=user)
                # Обновляем celery_task_id
                bulk_import.celery_task_id = self.request.id
                bulk_import.status = 'running'
                bulk_import.save()
                logger.info(f"✅ [CELERY TASK] Используем существующую запись массового импорта #{bulk_import_id}, статус обновлен на 'running'")
            except NotionBulkImport.DoesNotExist:
                logger.warning(f"Запись массового импорта #{bulk_import_id} не найдена, создаем новую")
                bulk_import = NotionBulkImport.objects.create(
                    user=user,
                    status='running',
                    total_pages=0,
                    celery_task_id=self.request.id
                )
        else:
            # Создаем новую запись (для обратной совместимости)
            bulk_import = NotionBulkImport.objects.create(
                user=user,
                status='running',
                total_pages=0,
                celery_task_id=self.request.id
            )
        
        logger.info(f"📋 [CELERY TASK] Начинаем массовый импорт для пользователя {user.username} (bulk_import_id={bulk_import.id})")
        
        # Инициализируем сервис
        if not user.notion_integration_token:
            logger.error(f"❌ [CELERY TASK] У пользователя {user.username} отсутствует notion_integration_token")
            bulk_import.status = 'failed'
            bulk_import.error_message = 'Integration токен Notion не настроен'
            bulk_import.completed_at = timezone.now()
            bulk_import.save()
            return {'status': 'failed', 'message': 'Integration токен Notion не настроен'}
        
        service = NotionService(user.notion_integration_token)
        logger.info(f"✅ [CELERY TASK] NotionService инициализирован")
        
        # Получаем все страницы из базы данных (используем ту же логику, что и в sync_pages)
        logger.info(f"🔍 [CELERY TASK] Получаем страницы из базы данных Notion: {database_id}")
        all_pages = []
        has_more = True
        start_cursor = None
        page_count = 0
        
        while has_more and len(all_pages) < max_pages:
            data = {'page_size': 100}
            if start_cursor:
                data['start_cursor'] = start_cursor
            
            try:
                response = service._make_request('POST', f'/databases/{database_id}/query', data=data)
                pages = response.get('results', [])
                all_pages.extend(pages)
                page_count += 1
                logger.info(f"Получена страница {page_count}, найдено {len(pages)} страниц, всего: {len(all_pages)}")
                
                has_more = response.get('has_more', False)
                start_cursor = response.get('next_cursor')
            except Exception as e:
                logger.error(f"Ошибка получения страниц из Notion API: {e}")
                bulk_import.status = 'failed'
                bulk_import.error_message = f'Ошибка получения страниц: {str(e)}'
                bulk_import.completed_at = timezone.now()
                bulk_import.save()
                return {
                    'status': 'failed',
                    'message': f'Ошибка получения страниц: {str(e)}'
                }
        
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
        logger.info(f"📊 [CELERY TASK] Всего страниц для обработки: {len(all_pages)}, обновлено bulk_import.total_pages={bulk_import.total_pages}")
        
        pages_processed = 0
        pages_created = 0
        pages_updated = 0
        failed_pages = []
        
        # Обрабатываем каждую страницу
        for page_data in all_pages:
            try:
                # Проверяем, не отменена ли задача (читаем актуальное состояние из БД)
                bulk_import.refresh_from_db()
                if bulk_import.status in ['stopped', 'cancelled', 'completed', 'failed']:
                    logger.info(f"⚠️ [CELERY TASK] Массовый импорт {bulk_import_id} остановлен со статусом: {bulk_import.status}")
                    return {
                        'status': bulk_import.status,
                        'message': f'Задача прервана со статусом: {bulk_import.status}'
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
                
                # Обновляем прогресс (каждые 5 страниц или на последней странице)
                if pages_processed % 5 == 0 or pages_processed == len(all_pages):
                    bulk_import.processed_pages = pages_processed
                    bulk_import.successful_pages = pages_created + pages_updated
                    bulk_import.save()
                    logger.info(f"📊 Прогресс обновлен: обработано {pages_processed}/{len(all_pages)}, успешно: {pages_created + pages_updated}, ошибок: {len(failed_pages)}")
                
                # Обновляем статус задачи Celery (каждые 10 страниц)
                if pages_processed % 10 == 0:
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
        
        # Обновляем финальные значения перед завершением
        bulk_import.processed_pages = pages_processed
        bulk_import.successful_pages = pages_created + pages_updated
        bulk_import.failed_pages = len(failed_pages)
        if failed_pages:
            bulk_import.failed_page_ids = failed_pages
        
        # Завершаем массовый импорт
        if failed_pages:
            bulk_import.status = 'partial'
            bulk_import.error_message = f"Не удалось обработать {len(failed_pages)} страниц из {pages_processed}"
        else:
            bulk_import.status = 'completed'
        
        bulk_import.completed_at = timezone.now()
        bulk_import.save()
        
        logger.info(f"✅ Массовый импорт завершен (ID: {bulk_import.id}): обработано {pages_processed}/{bulk_import.total_pages}, успешно: {pages_created + pages_updated}, ошибок: {len(failed_pages)}")
        
        # Создаем лог синхронизации
        NotionSyncLog.objects.create(
            user=user,
            status='success' if not failed_pages else 'partial',
            pages_processed=pages_processed,
            pages_created=pages_created,
            pages_updated=pages_updated,
            error_message=bulk_import.error_message if failed_pages else ''
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
