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

from .models import ClickUpSettings, ClickUpTask, ClickUpSyncLog, ClickUpBulkImport
from .forms import ClickUpSettingsForm, ClickUpTestConnectionForm, ClickUpPathForm
from .services import ClickUpService, ClickUpCacheService, ClickUpAPIError

# Условный импорт Celery задач
try:
    from .tasks import bulk_import_clickup_tasks, retry_failed_tasks
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    bulk_import_clickup_tasks = None
    retry_failed_tasks = None


@login_required
def dashboard(request):
    """Главная страница интеграции с ClickUp"""
    user = request.user
    
    # Получаем настройки пользователя
    try:
        settings = ClickUpSettings.objects.get(user=user)
        is_configured = bool(user.clickup_api_key and settings.team_id and settings.space_id and settings.list_id)
    except ClickUpSettings.DoesNotExist:
        settings = None
        is_configured = False
    
    # Получаем статистику
    tasks_count = ClickUpTask.objects.filter(user=user).count()
    recent_tasks = ClickUpTask.objects.filter(user=user).order_by('-date_updated')[:5]
    
    # Получаем последние логи синхронизации
    recent_syncs = ClickUpSyncLog.objects.filter(user=user).order_by('-created_at')[:5]
    
    context = {
        'settings': settings,
        'is_configured': is_configured,
        'tasks_count': tasks_count,
        'recent_tasks': recent_tasks,
        'recent_syncs': recent_syncs,
    }
    
    return render(request, 'clickup_int/dashboard.html', context)


@login_required
def settings_view(request):
    """Страница настроек ClickUp"""
    user = request.user
    
    try:
        settings = ClickUpSettings.objects.get(user=user)
    except ClickUpSettings.DoesNotExist:
        settings = None
    
    # Проверяем, очищены ли настройки из-за изменения API ключа
    settings_cleared = False
    if (settings and user.clickup_api_key and 
        not settings.team_id and not settings.space_id and not settings.list_id):
        settings_cleared = True
        messages.warning(request, 
            'Настройки пути ClickUp были очищены из-за изменения API ключа. '
            'Пожалуйста, выберите новые значения для команды, пространства и списка.')
    
    if request.method == 'POST':
        form = ClickUpSettingsForm(request.POST, instance=settings, user=user)
        if form.is_valid():
            settings = form.save(commit=False)
            settings.user = user
            settings.save()
            
            messages.success(request, 'Настройки ClickUp сохранены успешно!')
            return redirect('clickup_int:settings')
    else:
        form = ClickUpSettingsForm(instance=settings, user=user)
    
    context = {
        'form': form,
        'settings': settings,
        'settings_cleared': settings_cleared,
    }
    
    return render(request, 'clickup_int/settings.html', context)


@login_required
@require_POST
def test_connection(request):
    """API для тестирования подключения к ClickUp"""
    try:
        user = request.user
        
        if not user.clickup_api_key:
            return JsonResponse({
                'success': False,
                'message': 'API токен ClickUp не настроен в профиле пользователя'
            })
        
        # Тестируем подключение
        service = ClickUpService(user.clickup_api_key)
        
        if service.test_connection():
            # Получаем информацию о пользователе
            user_info = service.get_user_info()
            username = user_info.get('user', {}).get('username', 'Неизвестно')
            
            return JsonResponse({
                'success': True,
                'message': f'Подключение успешно! Пользователь: {username}',
                'user_info': user_info
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Не удалось подключиться к ClickUp API'
            })
            
    except ClickUpAPIError as e:
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
def get_path_options(request):
    """API для получения вариантов пути в ClickUp"""
    try:
        user = request.user
        
        if not user.clickup_api_key:
            return JsonResponse({
                'success': False,
                'message': 'API токен ClickUp не настроен в профиле пользователя'
            })
        
        service = ClickUpService(user.clickup_api_key)
        
        # Получаем команды
        teams = service.get_teams()
        
        return JsonResponse({
            'success': True,
            'teams': teams
        })
        
    except ClickUpAPIError as e:
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
def get_spaces(request):
    """API для получения пространств команды"""
    try:
        user = request.user
        team_id = request.GET.get('team_id')
        
        if not user.clickup_api_key:
            return JsonResponse({
                'success': False,
                'message': 'API токен ClickUp не настроен в профиле пользователя'
            })
        
        if not team_id:
            return JsonResponse({
                'success': False,
                'message': 'ID команды обязателен'
            })
        
        service = ClickUpService(user.clickup_api_key)
        spaces = service.get_spaces(team_id)
        
        return JsonResponse({
            'success': True,
            'spaces': spaces
        })
        
    except ClickUpAPIError as e:
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
def get_folders(request):
    """API для получения папок пространства"""
    try:
        user = request.user
        space_id = request.GET.get('space_id')
        
        if not user.clickup_api_key:
            return JsonResponse({
                'success': False,
                'message': 'API токен ClickUp не настроен в профиле пользователя'
            })
        
        if not space_id:
            return JsonResponse({
                'success': False,
                'message': 'ID пространства обязателен'
            })
        
        service = ClickUpService(user.clickup_api_key)
        folders = service.get_folders(space_id)
        
        return JsonResponse({
            'success': True,
            'folders': folders
        })
        
    except ClickUpAPIError as e:
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
def get_lists(request):
    """API для получения списков задач"""
    try:
        user = request.user
        folder_id = request.GET.get('folder_id')
        space_id = request.GET.get('space_id')
        
        if not user.clickup_api_key:
            return JsonResponse({
                'success': False,
                'message': 'API токен ClickUp не настроен в профиле пользователя'
            })
        
        if not folder_id and not space_id:
            return JsonResponse({
                'success': False,
                'message': 'ID папки или пространства обязательны'
            })
        
        service = ClickUpService(user.clickup_api_key)
        
        if folder_id:
            lists = service.get_lists(folder_id=folder_id)
        else:
            lists = service.get_lists(space_id=space_id)
        
        return JsonResponse({
            'success': True,
            'lists': lists
        })
        
    except ClickUpAPIError as e:
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
def tasks_list(request):
    """Список задач ClickUp"""
    user = request.user
    
    # Проверяем настройки
    try:
        settings = ClickUpSettings.objects.get(user=user)
        if not user.clickup_api_key or not settings.list_id:
            messages.warning(request, 'Необходимо настроить интеграцию с ClickUp')
            return redirect('clickup_int:settings')
    except ClickUpSettings.DoesNotExist:
        messages.warning(request, 'Необходимо настроить интеграцию с ClickUp')
        return redirect('clickup_int:settings')
    
    # Получаем задачи
    tasks = ClickUpTask.objects.filter(user=user)
    
    # Поиск
    search_query = request.GET.get('search')
    if search_query:
        tasks = tasks.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(status__icontains=search_query)
        )
    
    # Фильтрация по статусу
    status_filter = request.GET.get('status')
    if status_filter:
        tasks = tasks.filter(status=status_filter)
    
    # Фильтрация по приоритету
    priority_filter = request.GET.get('priority')
    if priority_filter:
        tasks = tasks.filter(priority=priority_filter)
    
    # Сортировка
    sort_by = request.GET.get('sort', '-date_updated')
    tasks = tasks.order_by(sort_by)
    
    # Пагинация
    paginator = Paginator(tasks, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Получаем уникальные статусы и приоритеты для фильтров
    statuses = ClickUpTask.objects.filter(user=user).values_list('status', flat=True).distinct()
    priorities = ClickUpTask.objects.filter(user=user).values_list('priority', flat=True).distinct()
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'status_filter': status_filter,
        'priority_filter': priority_filter,
        'sort_by': sort_by,
        'statuses': statuses,
        'priorities': priorities,
        'settings': settings,
    }
    
    return render(request, 'clickup_int/tasks_list.html', context)


@login_required
def task_detail(request, task_id):
    """Детальная информация о задаче"""
    user = request.user
    
    # Сначала получаем задачу из кэша (для fallback)
    task = get_object_or_404(ClickUpTask, task_id=task_id, user=user)
    
    # Загружаем актуальные данные из ClickUp API
    attachments = []
    comments = []
    
    try:
        if user.clickup_api_key:
            service = ClickUpService(user.clickup_api_key)
            
            # Получаем актуальные данные задачи
            try:
                task_data = service.get_task(task_id)
                parsed_data = service.parse_task_data(task_data)
                
                # Обновляем задачу в базе данных актуальными данными
                for field, value in parsed_data.items():
                    if hasattr(task, field):
                        setattr(task, field, value)
                task.save()
                
                logger.info(f"Данные задачи {task_id} обновлены через API")
                
            except ClickUpAPIError as e:
                logger.warning(f"Не удалось получить данные задачи {task_id}: {e}")
            except Exception as e:
                logger.error(f"Ошибка обновления данных задачи {task_id}: {e}")
            
            # Получаем актуальные вложения
            try:
                attachments = service.get_task_attachments(task_id)
            except ClickUpAPIError as e:
                logger.warning(f"Не удалось получить вложения для задачи {task_id}: {e}")
            
            # Получаем комментарии
            try:
                comments = service.get_task_comments(task_id)
            except ClickUpAPIError as e:
                logger.warning(f"Не удалось получить комментарии для задачи {task_id}: {e}")
                
    except Exception as e:
        logger.error(f"Ошибка загрузки дополнительных данных для задачи {task_id}: {e}")
    
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
        'task': task,
        'attachments': attachments,
        'comments': comments,
        'huntflow_accounts': huntflow_accounts,
    }
    
    return render(request, 'clickup_int/task_detail.html', context)


@login_required
@require_POST
def sync_tasks(request):
    """API для синхронизации задач"""
    user = request.user
    
    try:
        # Получаем настройки
        settings = ClickUpSettings.objects.get(user=user)
        
        if not user.clickup_api_key or not settings.list_id:
            return JsonResponse({
                'success': False,
                'message': 'Настройки ClickUp неполные'
            })
        
        # Синхронизируем задачи
        service = ClickUpService(user.clickup_api_key)
        tasks_processed, tasks_created, tasks_updated = service.sync_tasks(settings.list_id, user)
        
        return JsonResponse({
            'success': True,
            'message': f'Синхронизация завершена! Обработано: {tasks_processed}, создано: {tasks_created}, обновлено: {tasks_updated}',
            'tasks_processed': tasks_processed,
            'tasks_created': tasks_created,
            'tasks_updated': tasks_updated
        })
        
    except ClickUpSettings.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Настройки ClickUp не найдены'
        })
    except ClickUpAPIError as e:
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
    """API для очистки кэша задач"""
    user = request.user
    
    try:
        ClickUpCacheService.clear_user_cache(user)
        
        return JsonResponse({
            'success': True,
            'message': 'Кэш задач очищен успешно'
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
    
    logs = ClickUpSyncLog.objects.filter(user=user).order_by('-created_at')
    
    # Пагинация
    paginator = Paginator(logs, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
    }
    
    return render(request, 'clickup_int/sync_logs.html', context)


@login_required
@require_POST
def transfer_to_huntflow(request, task_id):
    """Перенос кандидата из ClickUp в Huntflow"""
    user = request.user
    
    try:
        # Получаем данные из запроса
        data = json.loads(request.body)
        account_id = data.get('account_id')
        vacancy_id = data.get('vacancy_id')
        
        print(f"🔍 Получены данные из запроса: account_id={account_id}, vacancy_id={vacancy_id}")
        
        if not account_id:
            return JsonResponse({
                'success': False,
                'error': 'Не указан account_id'
            })
        
        # Получаем задачу
        task = get_object_or_404(ClickUpTask, task_id=task_id, user=user)
        
        # Получаем вложения и комментарии
        from .services import ClickUpService
        clickup_service = ClickUpService(user.clickup_api_key)
        attachments = clickup_service.get_task_attachments(task_id)
        comments = clickup_service.get_task_comments(task_id)
        
        print(f"🔍 Данные задачи для переноса:")
        print(f"  - Название: {task.name}")
        print(f"  - Описание: {task.description[:100] if task.description else 'Нет описания'}...")
        print(f"  - Комментарии: {len(comments) if comments else 0}")
        if comments:
            for i, comment in enumerate(comments[:2]):
                print(f"    {i+1}. {comment.get('date', 'Нет даты')}: {comment.get('comment', 'Нет текста')[:50]}...")
        
        # Проверяем, есть ли PDF файлы для парсинга
        pdf_attachments = [att for att in attachments if att.get('extension', '').lower() == 'pdf']
        linkedin_url = None
        rabota_url = None
        
        if not pdf_attachments:
            # Если нет PDF файлов, ищем LinkedIn ссылку в custom fields
            custom_fields = task.get_custom_fields_display()
            for field in custom_fields:
                field_name = field.get('name', '').lower()
                field_value = field.get('value', '')
                
                # Ищем LinkedIn ссылки
                if field_name in ['linkedin', 'linkedin profile', 'linkedin url']:
                    linkedin_url = field_value
                    break
                
                # Ищем rabota.by ссылки
                if field_name in ['rabota', 'rabota.by', 'rabota url', 'resume', 'резюме'] or 'rabota.by' in field_value.lower():
                    rabota_url = field_value
                    break
            
            # Если не нашли ни LinkedIn, ни rabota.by
            if not linkedin_url and not rabota_url:
                return JsonResponse({
                    'success': False,
                    'error': 'У задачи нет PDF файлов, LinkedIn или rabota.by ссылок для переноса'
                })
        
        # Переносим в Huntflow
        from apps.huntflow.services import HuntflowService
        huntflow_service = HuntflowService(user)
        
        parsed_data = None
        
        if pdf_attachments:
            # Обрабатываем PDF файлы
            # Сортируем по дате (самый старый первый)
            oldest_attachment = min(pdf_attachments, key=lambda x: x.get('date', 0))
            
            # Скачиваем файл
            import requests
            file_response = requests.get(oldest_attachment['url'], timeout=30)
            if file_response.status_code != 200:
                return JsonResponse({
                    'success': False,
                    'error': 'Не удалось скачать файл из ClickUp'
                })
            
            # Загружаем файл в Huntflow с парсингом
            parsed_data = huntflow_service.upload_file(
                account_id=account_id,
                file_data=file_response.content,
                file_name=oldest_attachment.get('title', 'resume.pdf'),
                parse_file=True
            )
            
            if not parsed_data:
                return JsonResponse({
                    'success': False,
                    'error': 'Не удалось загрузить файл в Huntflow'
                })
        
        elif linkedin_url:
            # Обрабатываем LinkedIn ссылку
            print(f"🔍 Обрабатываем LinkedIn ссылку: {linkedin_url}")
            
            # Создаем данные для LinkedIn профиля
            parsed_data = huntflow_service.create_linkedin_profile_data(
                linkedin_url=linkedin_url,
                task_name=task.name,
                task_description=task.description
            )
            
            if not parsed_data:
                return JsonResponse({
                    'success': False,
                    'error': 'Не удалось обработать LinkedIn профиль'
                })
        
        elif rabota_url:
            # Обрабатываем rabota.by ссылку
            print(f"🔍 Обрабатываем rabota.by ссылку: {rabota_url}")
            
            # Создаем данные для rabota.by профиля
            parsed_data = huntflow_service.create_rabota_by_profile_data(
                rabota_url=rabota_url,
                task_name=task.name,
                task_description=task.description
            )
            
            if not parsed_data:
                return JsonResponse({
                    'success': False,
                    'error': 'Не удалось обработать rabota.by профиль'
                })
        
        # Создаем кандидата на основе распарсенных данных
        print(f"🔍 Создаем кандидата с данными: account_id={account_id}, vacancy_id={vacancy_id}, task_name='{task.name}'")
        applicant = huntflow_service.create_applicant_from_parsed_data(
            account_id=account_id,
            parsed_data=parsed_data,
            vacancy_id=vacancy_id,
            task_name=task.name,
            task_description=task.description,
            task_comments=comments,
            assignees=task.assignees,
            task_status=task.status
        )
        print(f"🔍 Результат создания кандидата: {applicant}")
        
        if not applicant:
            return JsonResponse({
                'success': False,
                'error': 'Не удалось создать кандидата в Huntflow'
            })
        
        # Проверяем, что applicant содержит данные
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


@login_required
def bulk_import_view(request):
    """Страница массового импорта задач"""
    user = request.user
    
    # Получаем настройки пользователя
    try:
        settings = ClickUpSettings.objects.get(user=user)
        is_configured = bool(user.clickup_api_key and settings.team_id and settings.space_id and settings.list_id)
    except ClickUpSettings.DoesNotExist:
        settings = None
        is_configured = False
    
    # Получаем последние массовые импорты
    recent_imports = ClickUpBulkImport.objects.filter(user=user).order_by('-created_at')[:10]
    
    context = {
        'settings': settings,
        'is_configured': is_configured,
        'recent_imports': recent_imports,
    }
    
    return render(request, 'clickup_int/bulk_import.html', context)


@login_required
def bulk_import_progress(request, import_id):
    """Страница отслеживания прогресса массового импорта"""
    user = request.user
    
    try:
        bulk_import = ClickUpBulkImport.objects.get(id=import_id, user=user)
    except ClickUpBulkImport.DoesNotExist:
        messages.error(request, 'Массовый импорт не найден')
        return redirect('clickup_int:bulk_import')
    
    context = {
        'bulk_import': bulk_import,
    }
    
    return render(request, 'clickup_int/bulk_import_progress.html', context)


@login_required
@require_POST
def start_bulk_import(request):
    """API для запуска массового импорта"""
    print("🎯 [START] Начинаем массовый импорт")
    print("🎯 [START] Начинаем массовый импорт", flush=True)
    logger.info("🎯 [START] Начинаем массовый импорт")
    
    user = request.user
    print(f"👤 [START] Пользователь: {user.username}")
    print(f"👤 [START] Пользователь: {user.username}", flush=True)
    logger.info(f"Запуск массового импорта для пользователя {user.username}")
    
    if not CELERY_AVAILABLE:
        print("❌ [START] Celery не доступен")
        print("❌ [START] Celery не доступен", flush=True)
        logger.warning("Celery не доступен")
        return JsonResponse({
            'success': False,
            'error': 'Celery не настроен. Обратитесь к администратору.'
        })
    
    try:
        # Проверяем настройки
        settings = ClickUpSettings.objects.get(user=user)
        print(f"⚙️ [START] Настройки найдены: team_id={settings.team_id}, space_id={settings.space_id}, list_id={settings.list_id}")
        print(f"⚙️ [START] Настройки найдены: team_id={settings.team_id}, space_id={settings.space_id}, list_id={settings.list_id}", flush=True)
        logger.info(f"Настройки найдены: team_id={settings.team_id}, space_id={settings.space_id}, list_id={settings.list_id}")
        
        if not user.clickup_api_key or not settings.list_id:
            print(f"❌ [START] Неполные настройки: api_key={bool(user.clickup_api_key)}, list_id={settings.list_id}")
            print(f"❌ [START] Неполные настройки: api_key={bool(user.clickup_api_key)}, list_id={settings.list_id}", flush=True)
            logger.warning(f"Неполные настройки: api_key={bool(user.clickup_api_key)}, list_id={settings.list_id}")
            return JsonResponse({
                'success': False,
                'error': 'Настройки ClickUp неполные'
            })
        
        # Создаем запись массового импорта
        bulk_import = ClickUpBulkImport.objects.create(
            user=user,
            status='running'
        )
        print(f"📝 [START] Создана запись массового импорта с ID {bulk_import.id}")
        print(f"📝 [START] Создана запись массового импорта с ID {bulk_import.id}", flush=True)
        logger.info(f"Создана запись массового импорта с ID {bulk_import.id}")
        
        # Запускаем задачу - сначала пробуем Celery, затем синхронно
        try:
            if CELERY_AVAILABLE:
                # Пробуем асинхронный импорт через Celery
                print(f"🚀 [QUEUE] Отправляем задачу в очередь Celery: user_id={user.id}, bulk_import_id={bulk_import.id}")
                print(f"🚀 [QUEUE] Отправляем задачу в очередь Celery: user_id={user.id}, bulk_import_id={bulk_import.id}", flush=True)
                logger.info(f"🚀 [QUEUE] Отправляем задачу в очередь Celery: user_id={user.id}, bulk_import_id={bulk_import.id}")
                
                task = bulk_import_clickup_tasks.apply_async(args=[user.id, bulk_import.id])
                print(f"✅ [QUEUE] Задача отправлена в очередь с ID: {task.id}")
                print(f"✅ [QUEUE] Задача отправлена в очередь с ID: {task.id}", flush=True)
                logger.info(f"✅ [QUEUE] Задача отправлена в очередь с ID: {task.id}")
                
                # Сохраняем ID задачи Celery
                bulk_import.celery_task_id = task.id
                bulk_import.save()
                print(f"💾 [QUEUE] Сохранен celery_task_id: {task.id}")
                print(f"💾 [QUEUE] Сохранен celery_task_id: {task.id}", flush=True)
                logger.info(f"💾 [QUEUE] Сохранен celery_task_id: {task.id}")
            else:
                # Fallback: синхронный импорт
                print("⚠️ [FALLBACK] Celery недоступен, запускаем синхронный импорт")
                print("⚠️ [FALLBACK] Celery недоступен, запускаем синхронный импорт", flush=True)
                logger.warning("⚠️ [FALLBACK] Celery недоступен, запускаем синхронный импорт")
                bulk_import_clickup_tasks(user.id, bulk_import.id)
                
        except Exception as celery_error:
            print(f"❌ [ERROR] Ошибка запуска задачи Celery: {celery_error}")
            logger.error(f"❌ [ERROR] Ошибка запуска задачи Celery: {celery_error}")
            # Fallback: синхронный импорт
            print("🔄 [FALLBACK] Переключаемся на синхронный импорт")
            logger.info("🔄 [FALLBACK] Переключаемся на синхронный импорт")
            try:
                bulk_import_clickup_tasks(user.id, bulk_import.id)
                print("✅ [FALLBACK] Синхронный импорт завершен успешно")
                logger.info("✅ [FALLBACK] Синхронный импорт завершен успешно")
            except Exception as sync_error:
                print(f"❌ [ERROR] Ошибка синхронного импорта: {sync_error}")
                logger.error(f"❌ [ERROR] Ошибка синхронного импорта: {sync_error}")
                return JsonResponse({
                    'success': False,
                    'error': f'Ошибка импорта: {str(sync_error)}'
                })
        
        print(f"🎉 [START] Массовый импорт успешно запущен с ID {bulk_import.id}")
        print(f"🎉 [START] Массовый импорт успешно запущен с ID {bulk_import.id}", flush=True)
        logger.info(f"🎉 [START] Массовый импорт успешно запущен с ID {bulk_import.id}")
        
        return JsonResponse({
            'success': True,
            'import_id': bulk_import.id,
            'message': 'Массовый импорт запущен'
        })
        
    except ClickUpSettings.DoesNotExist:
        logger.warning(f"Настройки ClickUp не найдены для пользователя {user.username}")
        return JsonResponse({
            'success': False,
            'error': 'Настройки ClickUp не найдены'
        })
    except Exception as e:
        logger.error(f"Ошибка запуска массового импорта: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка запуска: {str(e)}'
        })


@login_required
@require_POST
def stop_bulk_import(request, import_id):
    """API для остановки массового импорта"""
    try:
        bulk_import = ClickUpBulkImport.objects.get(id=import_id, user=request.user)
        
        print(f"🛑 [STOP] Останавливаем массовый импорт {import_id}")
        logger.info(f"🛑 [STOP] Останавливаем массовый импорт {import_id}")
        
        # Обновляем статус
        bulk_import.status = 'stopped'
        bulk_import.completed_at = timezone.now()
        bulk_import.save()
        
        # Пытаемся отменить задачу Celery, если она есть
        if bulk_import.celery_task_id and CELERY_AVAILABLE:
            try:
                from celery import current_app
                current_app.control.revoke(bulk_import.celery_task_id, terminate=True)
                print(f"🛑 [STOP] Задача Celery {bulk_import.celery_task_id} отменена")
                logger.info(f"🛑 [STOP] Задача Celery {bulk_import.celery_task_id} отменена")
            except Exception as e:
                print(f"⚠️ [STOP] Не удалось отменить задачу Celery: {e}")
                logger.warning(f"⚠️ [STOP] Не удалось отменить задачу Celery: {e}")
        
        return JsonResponse({
            'success': True,
            'message': 'Массовый импорт остановлен'
        })
        
    except ClickUpBulkImport.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Массовый импорт не найден'
        })
    except Exception as e:
        logger.error(f"Ошибка остановки массового импорта: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка остановки: {str(e)}'
        })


@login_required
def get_bulk_import_progress(request, import_id):
    """API для получения прогресса массового импорта"""
    user = request.user
    
    try:
        bulk_import = ClickUpBulkImport.objects.get(id=import_id, user=user)
        
        return JsonResponse({
            'success': True,
            'data': {
                'id': bulk_import.id,
                'status': bulk_import.status,
                'total_tasks': bulk_import.total_tasks,
                'processed_tasks': bulk_import.processed_tasks,
                'successful_tasks': bulk_import.successful_tasks,
                'failed_tasks': bulk_import.failed_tasks,
                'progress_percentage': bulk_import.progress_percentage,
                'success_rate': bulk_import.success_rate,
                'failed_task_ids': bulk_import.failed_task_ids,
                'error_message': bulk_import.error_message,
                'created_at': bulk_import.created_at.isoformat(),
                'updated_at': bulk_import.updated_at.isoformat(),
                'completed_at': bulk_import.completed_at.isoformat() if bulk_import.completed_at else None,
            }
        })
        
    except ClickUpBulkImport.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Массовый импорт не найден'
        })


@login_required
@require_POST
def retry_failed_tasks_view(request, import_id):
    """API для повторного импорта неудачных задач"""
    user = request.user
    
    if not CELERY_AVAILABLE:
        return JsonResponse({
            'success': False,
            'error': 'Celery не настроен. Обратитесь к администратору.'
        })
    
    try:
        bulk_import = ClickUpBulkImport.objects.get(id=import_id, user=user)
        
        if not bulk_import.failed_task_ids:
            return JsonResponse({
                'success': False,
                'error': 'Нет неудачных задач для повтора'
            })
        
        # Запускаем задачу повторного импорта
        task = retry_failed_tasks.apply_async(args=[user.id, import_id])
        
        return JsonResponse({
            'success': True,
            'message': 'Повторный импорт неудачных задач запущен'
        })
        
    except ClickUpBulkImport.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Массовый импорт не найден'
        })
    except Exception as e:
        logger.error(f"Ошибка повторного импорта: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка повтора: {str(e)}'
        })
