# Импорты из новых модулей
from logic.integration.notion.notion_service import (
    settings, dashboard, pages_list, page_detail,
    test_connection, sync_pages, sync_logs, bulk_import, bulk_import_status
)
from logic.base.response_handler import UnifiedResponseHandler

# Старые импорты (для совместимости)
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.core.paginator import Paginator
from django.utils import timezone
from django.db.models import Q
import json
import logging

logger = logging.getLogger(__name__)

from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport
from .forms import NotionSettingsForm, NotionTestConnectionForm
from .services import NotionService, NotionCacheService, NotionAPIError

# Условный импорт Celery задач
try:
    from .tasks import bulk_import_notion_pages, retry_failed_pages
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    bulk_import_notion_pages = None
    retry_failed_pages = None


@login_required
def settings(request):
    """
    Страница настроек Notion
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - NotionSettings.objects: настройки пользователя
    - NotionSettingsForm: форма настроек
    
    ОБРАБОТКА:
    - Получение или создание настроек пользователя
    - Проверка очистки настроек из-за изменения integration токена
    - Создание формы настроек
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с формой настроек
    - render: HTML страница 'notion_int/settings.html'
    
    СВЯЗИ:
    - Использует: NotionSettings модель, NotionSettingsForm
    - Передает данные в: notion_int/settings.html
    - Может вызываться из: notion_int/ URL patterns
    """
    user = request.user
    
    try:
        settings_obj = NotionSettings.objects.get(user=user)
    except NotionSettings.DoesNotExist:
        settings_obj = None
    
    # Проверяем, очищены ли настройки из-за изменения integration токена
    settings_cleared = False
    if (settings_obj and user.notion_integration_token and 
        not settings_obj.database_id):
        settings_cleared = True
        messages.warning(request, 
            'Настройки базы данных Notion были очищены из-за изменения integration токена. '
            'Пожалуйста, выберите новую базу данных.')
    
    if request.method == 'POST':
        form = NotionSettingsForm(request.POST, instance=settings_obj, user=user)
        if form.is_valid():
            settings_obj = form.save(commit=False)
            settings_obj.user = user
            settings_obj.save()
            
            messages.success(request, 'Настройки Notion сохранены успешно!')
            return redirect('notion_int:settings')
    else:
        form = NotionSettingsForm(instance=settings_obj, user=user)
    
    context = {
        'form': form,
        'settings': settings_obj,
        'settings_cleared': settings_cleared,
        'user': user,
    }
    
    return render(request, 'notion_int/settings.html', context)


@login_required
@require_POST
def save_settings(request):
    """API для сохранения настроек Notion"""
    user = request.user
    
    try:
        # Получаем или создаем настройки
        try:
            settings_obj = NotionSettings.objects.get(user=user)
        except NotionSettings.DoesNotExist:
            settings_obj = NotionSettings.objects.create(user=user)
        
        # Создаем форму с данными
        form = NotionSettingsForm(request.POST, instance=settings_obj, user=user)
        
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True,
                'message': 'Настройки сохранены успешно'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Ошибка валидации формы',
                'errors': form.errors
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка сохранения настроек: {str(e)}'
        })


@login_required
@require_POST
def test_connection(request):
    """API для тестирования подключения к Notion"""
    user = request.user
    
    try:
        if not user.notion_integration_token:
            return JsonResponse({
                'success': False,
                'message': 'Integration токен Notion не настроен в профиле пользователя'
            })
        
        service = NotionService(user.notion_integration_token)
        
        # Тестируем подключение
        is_connected = service.test_connection()
        
        if is_connected:
            return JsonResponse({
                'success': True,
                'message': 'Подключение к Notion успешно установлено'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Не удалось подключиться к Notion. Проверьте токен и настройки.'
            })
            
    except NotionAPIError as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
@require_POST
def get_databases(request):
    """API для получения списка баз данных Notion"""
    user = request.user
    
    try:
        if not user.notion_integration_token:
            return JsonResponse({
                'success': False,
                'message': 'Integration токен Notion не настроен в профиле пользователя'
            })
        
        service = NotionService(user.notion_integration_token)
        
        # Получаем базы данных
        databases = service.get_databases()
        
        return JsonResponse({
            'success': True,
            'databases': databases
        })
        
    except NotionAPIError as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
def dashboard(request):
    """
    Главная страница интеграции с Notion
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - NotionSettings.objects: настройки пользователя
    - NotionPage.objects: страницы пользователя
    - NotionSyncLog.objects: логи синхронизации
    
    ОБРАБОТКА:
    - Получение настроек пользователя
    - Проверка конфигурации интеграции
    - Подсчет статистики (количество страниц, логов)
    - Получение последних логов синхронизации
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с настройками, статистикой и логами
    - render: HTML страница 'notion_int/dashboard.html'
    
    СВЯЗИ:
    - Использует: NotionSettings, NotionPage, NotionSyncLog модели
    - Передает данные в: notion_int/dashboard.html
    - Может вызываться из: notion_int/ URL patterns
    """
    user = request.user
    
    # Получаем настройки пользователя
    try:
        settings = NotionSettings.objects.get(user=user)
        is_configured = bool(user.notion_integration_token and settings.database_id)
    except NotionSettings.DoesNotExist:
        settings = None
        is_configured = False
    
    # Получаем статистику
    pages_count = NotionPage.objects.filter(user=user).count()
    recent_pages = NotionPage.objects.filter(user=user).order_by('-date_updated')[:5]
    
    # Получаем последние логи синхронизации
    recent_syncs = NotionSyncLog.objects.filter(user=user).order_by('-created_at')[:5]
    
    context = {
        'settings': settings,
        'is_configured': is_configured,
        'pages_count': pages_count,
        'recent_pages': recent_pages,
        'recent_syncs': recent_syncs,
    }
    
    return render(request, 'notion_int/dashboard.html', context)






@login_required
def pages_list(request):
    """
    Список страниц Notion
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь
    - request.GET: параметры фильтрации и поиска
    
    ИСТОЧНИКИ ДАННЫХ:
    - NotionPage.objects: страницы пользователя
    - NotionSettings.objects: настройки пользователя
    
    ОБРАБОТКА:
    - Получение страниц пользователя
    - Применение фильтров и поиска
    - Пагинация результатов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь со страницами и пагинацией
    - render: HTML страница 'notion_int/pages_list.html'
    
    СВЯЗИ:
    - Использует: NotionPage, NotionSettings модели
    - Передает данные в: notion_int/pages_list.html
    - Может вызываться из: notion_int/ URL patterns
    """
    user = request.user
    
    # Проверяем настройки
    try:
        settings = NotionSettings.objects.get(user=user)
        if not user.notion_integration_token or not settings.database_id:
            messages.warning(request, 'Необходимо настроить интеграцию с Notion')
            return redirect('notion_int:settings')
    except NotionSettings.DoesNotExist:
        messages.warning(request, 'Необходимо настроить интеграцию с Notion')
        return redirect('notion_int:settings')
    
    # Получаем страницы
    pages = NotionPage.objects.filter(user=user)
    
    # Поиск
    search_query = request.GET.get('search')
    if search_query:
        pages = pages.filter(
            Q(title__icontains=search_query) |
            Q(content__icontains=search_query) |
            Q(status__icontains=search_query)
        )
    
    # Фильтрация по статусу
    status_filter = request.GET.get('status')
    if status_filter:
        pages = pages.filter(status=status_filter)
    
    # Фильтрация по приоритету
    priority_filter = request.GET.get('priority')
    if priority_filter:
        pages = pages.filter(priority=priority_filter)
    
    # Фильтрация по исполнителю
    assignee_filter = request.GET.get('assignee')
    if assignee_filter:
        pages = pages.filter(assignees__icontains=assignee_filter)
    
    # Сортировка
    sort_by = request.GET.get('sort', '-date_updated')
    pages = pages.order_by(sort_by)
    
    # Пагинация
    paginator = Paginator(pages, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Получаем уникальные статусы и приоритеты для фильтров
    statuses = NotionPage.objects.filter(user=user).values_list('status', flat=True).distinct()
    priorities = NotionPage.objects.filter(user=user).values_list('priority', flat=True).distinct()
    
    # Получаем уникальные исполнители для фильтров
    assignees = []
    for page in NotionPage.objects.filter(user=user):
        if page.assignees:
            try:
                if isinstance(page.assignees, str):
                    assignees_data = json.loads(page.assignees)
                else:
                    assignees_data = page.assignees
                
                for assignee in assignees_data:
                    if isinstance(assignee, dict):
                        name = assignee.get('name', assignee.get('email', 'Неизвестно'))
                    else:
                        name = str(assignee)
                    if name not in assignees:
                        assignees.append(name)
            except (json.JSONDecodeError, TypeError):
                continue
    
    context = {
        'page_obj': page_obj,
        'pages': page_obj,  # Добавляем для совместимости
        'search_query': search_query,
        'selected_status': status_filter,
        'selected_priority': priority_filter,
        'selected_assignee': request.GET.get('assignee'),
        'sort_by': sort_by,
        'statuses': statuses,
        'priorities': priorities,
        'assignees': assignees,
        'settings': settings,
        'is_configured': True,
    }
    
    return render(request, 'notion_int/pages_list.html', context)


@login_required
def page_detail(request, page_id):
    """Детальная информация о странице"""
    user = request.user
    
    # Сначала получаем страницу из кэша (для fallback)
    page = get_object_or_404(NotionPage, page_id=page_id, user=user)
    
    # Загружаем актуальные данные из Notion API
    page_content = []
    
    try:
        if user.notion_integration_token:
            service = NotionService(user.notion_integration_token)
            
            # Получаем актуальные данные страницы
            try:
                page_data = service.get_page(page_id)
                parsed_data = service.parse_page_data(page_data)
                
                # Обновляем страницу в базе данных актуальными данными
                for field, value in parsed_data.items():
                    if hasattr(page, field):
                        setattr(page, field, value)
                page.save()
                
                logger.info(f"Данные страницы {page_id} обновлены через API")
                
            except NotionAPIError as e:
                logger.warning(f"Не удалось получить данные страницы {page_id}: {e}")
            except Exception as e:
                logger.error(f"Ошибка обновления данных страницы {page_id}: {e}")
            
            # Получаем содержимое страницы
            page_content = []
            parsed_content = ''
            try:
                page_content = service.get_page_content(page_id)
                if page_content:
                    parsed_content = service.parse_page_content(page_content)
            except NotionAPIError as e:
                logger.warning(f"Не удалось получить содержимое страницы {page_id}: {e}")
            except Exception as e:
                logger.error(f"Ошибка получения содержимого страницы {page_id}: {e}")
                
    except Exception as e:
        logger.error(f"Ошибка загрузки дополнительных данных для страницы {page_id}: {e}")
        page_content = []
    
    # Получаем данные о Huntflow аккаунтах для модального окна
    huntflow_accounts = []
    try:
        from apps.huntflow.services import HuntflowService
        huntflow_service = HuntflowService(user)
        accounts_data = huntflow_service.get_accounts()
        if accounts_data and 'items' in accounts_data:
            huntflow_accounts = accounts_data['items']
    except Exception as e:
        logger.warning(f"Не удалось получить данные Huntflow аккаунтов: {e}")
    
    context = {
        'page': page,
        'page_content': page_content,
        'parsed_content': parsed_content,
        'huntflow_accounts': huntflow_accounts,
    }
    
    return render(request, 'notion_int/page_detail.html', context)


@login_required
@require_POST
def sync_pages(request):
    """API для синхронизации страниц"""
    user = request.user
    
    try:
        # Получаем настройки
        settings = NotionSettings.objects.get(user=user)
        
        if not user.notion_integration_token or not settings.database_id:
            return JsonResponse({
                'success': False,
                'message': 'Настройки Notion неполные'
            })
        
        # Синхронизируем страницы
        service = NotionService(user.notion_integration_token)
        pages_processed, pages_created, pages_updated = service.sync_pages(settings.database_id, user)
        
        return JsonResponse({
            'success': True,
            'message': f'Синхронизация завершена! Обработано: {pages_processed}, создано: {pages_created}, обновлено: {pages_updated}',
            'pages_processed': pages_processed,
            'pages_created': pages_created,
            'pages_updated': pages_updated
        })
        
    except NotionSettings.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Настройки Notion не найдены'
        })
    except NotionAPIError as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка синхронизации: {str(e)}'
        })


@login_required
@require_POST
def clear_cache(request):
    """API для очистки кэша страниц"""
    user = request.user
    
    try:
        NotionCacheService.clear_user_cache(user)
        
        return JsonResponse({
            'success': True,
            'message': 'Кэш страниц очищен успешно'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка очистки кэша: {str(e)}'
        })


@login_required
def sync_logs(request):
    """Страница логов синхронизации"""
    user = request.user
    
    logs = NotionSyncLog.objects.filter(user=user).order_by('-created_at')
    
    # Пагинация
    paginator = Paginator(logs, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
    }
    
    return render(request, 'notion_int/sync_logs.html', context)


@login_required
@require_POST
def transfer_to_huntflow(request):
    """API для переноса данных Notion страницы в Huntflow с использованием общей логики"""
    user = request.user
    
    logger.info(f"transfer_to_huntflow вызвана для пользователя {user.id}")
    
    try:
        # Получаем данные из JSON запроса
        import json
        data = json.loads(request.body)
        page_id = data.get('page_id')
        account_id = data.get('account_id')
        vacancy_id = data.get('vacancy_id')
        
        logger.info(f"Получены данные: page_id={page_id}, account_id={account_id}, vacancy_id={vacancy_id}")
        
        if not page_id:
            logger.error("page_id не указан")
            return JsonResponse({
                'success': False,
                'error': 'ID страницы не указан'
            })
        
        if not account_id:
            logger.error("account_id не указан")
            return JsonResponse({
                'success': False,
                'error': 'Не указан account_id'
            })
        
        # Получаем страницу из базы данных
        try:
            page = NotionPage.objects.get(page_id=page_id, user=user)
            logger.info(f"Найдена страница: {page.title}")
        except NotionPage.DoesNotExist:
            logger.error(f"Страница с ID {page_id} не найдена для пользователя {user.id}")
            return JsonResponse({
                'success': False,
                'error': 'Страница не найдена'
            })
        
        # Подготавливаем данные страницы для общей логики
        page_data = {
            'title': page.title,
            'name': page.title,  # Alias для совместимости с ClickUp
            'content': page.content,
            'description': page.content,  # Alias для совместимости
            'status': page.status,
            'attachments': page.get_attachments_display(),
            'comments': page.get_comments_display(),
            'assignees': page.get_assignees_display(),
            'custom_properties': page.custom_properties,
            'tags': page.get_tags_display(),
            'due_date': page.due_date.strftime('%d.%m.%Y %H:%M') if page.due_date else None
        }
        
        logger.info(f"Данные Notion для передачи: title='{page.title}', content_length={len(page.content) if page.content else 0}")
        
        # ИСПОЛЬЗУЕМ ОБЩУЮ ЛОГИКУ вместо дублированного кода
        from logic.integration.shared.huntflow_operations import HuntflowOperations
        
        huntflow_ops = HuntflowOperations(user)
        applicant = huntflow_ops.create_candidate_from_task_data(
            task_data=page_data,
            account_id=account_id,
            vacancy_id=vacancy_id,
            source_type='notion'
        )
        
        logger.info(f"Результат создания кандидата: {applicant}")
        
        if not applicant:
            return JsonResponse({
                'success': False,
                'error': 'Не удалось создать кандидата в Huntflow'
            })
        
        # Проверяем результат
        if not isinstance(applicant, dict):
            return JsonResponse({
                'success': False,
                'error': f'Неожиданный формат ответа от Huntflow: {type(applicant)}'
            })
        
        # Формируем сообщение в зависимости от того, была ли выбрана вакансия
        applicant_id = applicant.get("id", "неизвестно")
        if vacancy_id:
            message = f'Кандидат успешно перенесен в Huntflow и привязан к вакансии (ID: {applicant_id})'
        else:
            message = f'Кандидат успешно перенесен в Huntflow без привязки к вакансии (ID: {applicant_id})'
        
        return JsonResponse({
            'success': True,
            'message': message,
            'applicant_id': applicant_id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный формат JSON'
        })
    except Exception as e:
        logger.error(f"Ошибка переноса в Huntflow: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка переноса: {str(e)}'
        })

