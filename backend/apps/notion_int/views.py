# Импорты из новых модулей
from logic.integration.notion.notion_service import (
    settings, dashboard, pages_list, page_detail,
    test_connection, sync_pages, sync_logs, bulk_import_view, bulk_import, bulk_import_status
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

from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport, NotionHuntflowMapping
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
    
    # Получаем данные для связок
    notion_languages = []
    notion_nuances = []
    notion_statuses = []
    huntflow_vacancies = []
    huntflow_fields = []
    huntflow_statuses = []
    
    # Получаем данные из Notion, если база данных настроена
    if settings_obj and settings_obj.database_id and user.notion_integration_token:
        try:
            notion_service = NotionService(user.notion_integration_token)
            
            # Получаем опции для Language
            notion_languages = notion_service.get_database_property_options(
                settings_obj.database_id, 
                'Language'
            )
            
            # Получаем опции для Нюансы (пробуем разные названия)
            notion_nuances = notion_service.get_database_property_options(
                settings_obj.database_id, 
                'Нюансы'
            ) or notion_service.get_database_property_options(
                settings_obj.database_id, 
                'Nuances'
            )
            
            # Получаем опции для Status
            notion_statuses = notion_service.get_database_property_options(
                settings_obj.database_id, 
                'Status'
            ) or notion_service.get_database_property_options(
                settings_obj.database_id, 
                'Статус'
            )
        except Exception as e:
            logger.error(f"Ошибка получения данных из Notion: {e}")
    
    # Получаем данные из Huntflow
    try:
        from apps.huntflow.services import HuntflowService
        huntflow_service = HuntflowService(user)
        accounts = huntflow_service.get_accounts()
        
        if accounts and accounts.get('items'):
            # Берем первый аккаунт
            account_id = accounts['items'][0]['id']
            
            # Получаем вакансии
            vacancies_data = huntflow_service.get_vacancies(account_id, count=100)
            if vacancies_data and vacancies_data.get('items'):
                huntflow_vacancies = [
                    {'id': v.get('id'), 'name': v.get('position', f'Вакансия {v.get("id")}')}
                    for v in vacancies_data['items']
                ]
            
            # Получаем схему анкеты кандидата для дополнительных полей
            questionary_schema = huntflow_service.get_applicant_questionary_schema(account_id)
            logger.info(f"🔍 Questionary schema structure: {list(questionary_schema.keys()) if questionary_schema else 'None'}")
            
            if questionary_schema:
                # Схема может быть словарем, где ключи - это ID полей
                if isinstance(questionary_schema, dict):
                    # Если это словарь с полями (не списком)
                    if 'fields' in questionary_schema:
                        # Если есть ключ 'fields'
                        fields_list = questionary_schema.get('fields', [])
                    else:
                        # Если сам словарь содержит поля (ключи - это ID полей)
                        fields_list = []
                        for field_id, field_data in questionary_schema.items():
                            if isinstance(field_data, dict):
                                field_data['id'] = field_id
                                fields_list.append(field_data)
                            else:
                                fields_list.append({'id': field_id, 'name': str(field_data)})
                    
                    huntflow_fields = []
                    for idx, f in enumerate(fields_list):
                        if isinstance(f, dict):
                            # Пытаемся получить название поля из разных возможных ключей
                            field_name = f.get('name') or f.get('title') or f.get('label') or f'Поле {f.get("id", idx)}'
                            
                            # Получаем ID поля
                            field_id = f.get('id')
                            if not field_id:
                                # Если ID нет в поле, но это словарь с ключами как ID
                                if 'fields' not in questionary_schema:
                                    # Значит ключи словаря и есть ID полей
                                    field_id = list(questionary_schema.keys())[idx] if idx < len(questionary_schema) else str(idx)
                                else:
                                    field_id = str(idx)
                            
                            field_type = f.get('type', 'text')
                            
                            # Включаем все типы полей, которые можно заполнить
                            huntflow_fields.append({
                                'id': str(field_id),
                                'name': field_name,
                                'type': field_type
                            })
                        elif isinstance(f, str):
                            # Если это просто строка (название поля)
                            huntflow_fields.append({
                                'id': str(idx),
                                'name': f,
                                'type': 'text'
                            })
                    
                    logger.info(f"✅ Получено {len(huntflow_fields)} дополнительных полей из Huntflow: {[(f['id'], f['name']) for f in huntflow_fields[:5]]}")
                else:
                    logger.warning(f"⚠️ Неожиданная структура questionary_schema: {type(questionary_schema)}")
            
            # Получаем статусы кандидатов
            statuses_data = huntflow_service.get_vacancy_statuses(account_id)
            if statuses_data and statuses_data.get('items'):
                huntflow_statuses = [
                    {'id': s.get('id'), 'name': s.get('name', f'Статус {s.get("id")}')}
                    for s in statuses_data['items']
                ]
    except Exception as e:
        logger.error(f"Ошибка получения данных из Huntflow: {e}")
    
    # Получаем существующие связки
    language_mappings = NotionHuntflowMapping.objects.filter(
        user=user,
        mapping_type='language_vacancy'
    ).order_by('notion_value')
    
    nuances_mappings = NotionHuntflowMapping.objects.filter(
        user=user,
        mapping_type='nuances_field'
    ).order_by('notion_value')
    
    status_mappings = NotionHuntflowMapping.objects.filter(
        user=user,
        mapping_type='status_status'
    ).order_by('notion_value')
    
    context = {
        'form': form,
        'settings': settings_obj,
        'settings_cleared': settings_cleared,
        'user': user,
        # Notion данные
        'notion_languages': notion_languages,
        'notion_nuances': notion_nuances,
        'notion_statuses': notion_statuses,
        # Huntflow данные
        'huntflow_vacancies': huntflow_vacancies,
        'huntflow_fields': huntflow_fields,
        'huntflow_statuses': huntflow_statuses,
        # Существующие связки
        'language_mappings': language_mappings,
        'nuances_mappings': nuances_mappings,
        'status_mappings': status_mappings,
    }
    
    return render(request, 'notion_int/settings.html', context)


@login_required
@require_POST
def save_mapping(request):
    """Сохранение связки Notion-Huntflow"""
    try:
        mapping_type = request.POST.get('mapping_type')
        notion_value = request.POST.get('notion_value')
        huntflow_value = request.POST.get('huntflow_value')
        account_id = request.POST.get('account_id')
        
        if not all([mapping_type, notion_value, huntflow_value]):
            return JsonResponse({'success': False, 'error': 'Не все поля заполнены'})
        
        # Создаем или обновляем связку
        mapping, created = NotionHuntflowMapping.objects.update_or_create(
            user=request.user,
            mapping_type=mapping_type,
            notion_value=notion_value,
            defaults={
                'huntflow_value': huntflow_value,
                'huntflow_account_id': account_id if account_id else None,
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Связка сохранена успешно',
            'created': created,
            'mapping_id': mapping.id
        })
    except Exception as e:
        logger.error(f"Ошибка сохранения связки: {e}")
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_POST
def delete_mapping(request, mapping_id):
    """Удаление связки Notion-Huntflow"""
    try:
        mapping = NotionHuntflowMapping.objects.get(id=mapping_id, user=request.user)
        mapping.delete()
        return JsonResponse({'success': True, 'message': 'Связка удалена'})
    except NotionHuntflowMapping.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Связка не найдена'})
    except Exception as e:
        logger.error(f"Ошибка удаления связки: {e}")
        return JsonResponse({'success': False, 'error': str(e)})


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
                logger.info(f"📊 NOTION UPDATE: Получены данные из parse_page_data. Ключи: {list(parsed_data.keys())}")
                logger.info(f"📊 NOTION UPDATE: Статус в parsed_data: '{parsed_data.get('status', 'НЕ НАЙДЕН')}'")
                
                for field, value in parsed_data.items():
                    if hasattr(page, field):
                        old_value = getattr(page, field, None)
                        setattr(page, field, value)
                        if field == 'status':
                            logger.info(f"📝 NOTION UPDATE: Обновлено поле {field}: '{old_value}' -> '{value}'")
                        else:
                            logger.debug(f"📝 NOTION UPDATE: Обновлено поле {field} = {value}")
                    else:
                        logger.warning(f"⚠️ NOTION UPDATE: Поле {field} отсутствует в модели NotionPage")
                
                page.save()
                logger.info(f"✅ NOTION UPDATE: Страница сохранена в БД")
                logger.info(f"📊 NOTION UPDATE: Status={page.status}, Interviewer={page.interviewer}, Interview Date={page.interview_date}, Comments count={len(page.comments) if page.comments else 0}")
                
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


def _extract_notion_field_value(page, field_name, alternative_names=None):
    """Извлекает значение поля из Notion страницы"""
    if not alternative_names:
        alternative_names = []
    
    # Пробуем разные названия поля
    for name in [field_name] + alternative_names:
        # Проверяем custom_properties
        if page.custom_properties:
            custom_props = page.custom_properties if isinstance(page.custom_properties, dict) else json.loads(page.custom_properties)
            for prop_id, prop_data in custom_props.items():
                if isinstance(prop_data, dict):
                    prop_title = prop_data.get('name', '').lower()
                    if prop_title == name.lower():
                        return prop_data.get('value', '')
    
    return None


def _split_task_name_to_name_parts(task_name):
    """Разбивает название задачи на Фамилию и Имя (игнорируя 3-е слово)"""
    if not task_name:
        return {'first_name': '', 'last_name': ''}
    
    import re
    cleaned_name = re.sub(r'[^\w\s\-\.]', ' ', task_name)
    cleaned_name = re.sub(r'\s+', ' ', cleaned_name).strip()
    words = cleaned_name.split()
    
    if len(words) == 0:
        return {'first_name': '', 'last_name': ''}
    elif len(words) == 1:
        return {'first_name': '', 'last_name': words[0]}
    elif len(words) >= 2:
        # Берем первые два слова, игнорируя третье и последующие
        return {'first_name': words[1], 'last_name': words[0]}
    
    return {'first_name': '', 'last_name': ''}


@login_required
@require_POST
def transfer_to_huntflow(request):
    """API для переноса данных Notion страницы в Huntflow с учетом всех требований"""
    user = request.user
    
    logger.info(f"🚀 transfer_to_huntflow вызвана для пользователя {user.id}")
    
    try:
        # Получаем данные из JSON запроса
        import json
        data = json.loads(request.body)
        page_id = data.get('page_id')
        account_id = data.get('account_id')
        vacancy_id = data.get('vacancy_id')
        
        logger.info(f"Получены данные: page_id={page_id}, account_id={account_id}, vacancy_id={vacancy_id}")
        
        if not page_id:
            return JsonResponse({'success': False, 'error': 'ID страницы не указан'})
        
        if not account_id:
            return JsonResponse({'success': False, 'error': 'Не указан account_id'})
        
        # Получаем страницу из базы данных
        try:
            page = NotionPage.objects.get(page_id=page_id, user=user)
            logger.info(f"✅ Найдена страница: {page.title}")
        except NotionPage.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Страница не найдена'})
        
        # Импортируем необходимые сервисы
        from apps.huntflow.services import HuntflowService
        from apps.notion_int.services import NotionService
        
        huntflow_service = HuntflowService(user)
        
        # Инициализируем переменные для полей Notion
        email = None
        phone = None
        salary = None
        level = None
        language = None
        nuances = []
        screening_owner = None
        
        # Получаем актуальные данные страницы из Notion API
        notion_service = None
        properties = {}
        
        if not user.notion_integration_token:
            logger.warning(f"⚠️ У пользователя {user.id} не настроен Notion integration token")
        else:
            try:
                notion_service = NotionService(user.notion_integration_token)
                logger.info(f"✅ NotionService инициализирован")
                
                page_data_api = notion_service.get_page(page_id)
                if not page_data_api:
                    logger.error(f"❌ Не удалось получить данные страницы из Notion API")
                else:
                    properties = page_data_api.get('properties', {})
                    logger.info(f"✅ Получены свойства страницы из Notion API: {len(properties)} свойств")
                    logger.info(f"🔍 Ключи свойств: {list(properties.keys())}")
                
                # Извлекаем все нужные поля
                email = notion_service._extract_property_value(properties, 'Email') or notion_service._extract_property_value(properties, 'email')
                phone = notion_service._extract_property_value(properties, 'Phone') or notion_service._extract_property_value(properties, 'phone') or notion_service._extract_property_value(properties, 'Телефон')
                salary = notion_service._extract_property_value(properties, 'Salary Requested') or notion_service._extract_property_value(properties, 'Salary') or notion_service._extract_property_value(properties, 'Зарплата')
                level = notion_service._extract_property_value(properties, 'Level') or notion_service._extract_property_value(properties, 'level') or notion_service._extract_property_value(properties, 'Уровень')
                language = notion_service._extract_property_value(properties, 'Language') or notion_service._extract_property_value(properties, 'language') or notion_service._extract_property_value(properties, 'Язык')
                
                # Нюансы (multi_select)
                nuances = notion_service._extract_multi_select_property(properties, 'Нюансы')
                if not nuances:
                    nuances = notion_service._extract_multi_select_property(properties, 'Nuances')
                if not nuances:
                    nuances = notion_service._extract_multi_select_property(properties, 'нюансы')
                
                # Screening Owner
                screening_owner = notion_service._extract_property_value(properties, 'Screening Owner')
                if not screening_owner:
                    screening_owner_list = notion_service._extract_people_property(properties, 'Screening Owner')
                    if screening_owner_list and len(screening_owner_list) > 0:
                        screening_owner = screening_owner_list[0]
                
                logger.info(f"📋 Извлечены поля из Notion: Email={email}, Phone={phone}, Salary={salary}, Level={level}, Language={language}, Nuances={nuances}, Screening Owner={screening_owner}")
                
            except Exception as e:
                logger.error(f"❌ Ошибка получения данных из Notion API: {e}", exc_info=True)
                logger.warning(f"⚠️ Продолжаем работу без актуальных данных из Notion API, используем данные из базы")
                
                # Пытаемся использовать данные из базы данных
                if page.custom_properties:
                    try:
                        custom_props = page.custom_properties if isinstance(page.custom_properties, dict) else json.loads(page.custom_properties)
                        logger.info(f"📋 Используем custom_properties из базы данных: {len(custom_props)} свойств")
                    except:
                        logger.warning(f"⚠️ Не удалось разобрать custom_properties из базы данных")
        
        # 1. Определяем способ импорта (CV -> LinkedIn -> Rabota.by)
        cv_file = None
        linkedin_url = None
        rabota_url = None
        
        logger.info(f"🔍 Начинаем поиск источника данных (CV/LinkedIn/Rabota.by)")
        logger.info(f"🔍 notion_service доступен: {notion_service is not None}")
        logger.info(f"🔍 properties из API доступны: {len(properties) > 0 if properties else False}")
        
        # Также проверяем custom_properties из базы данных как fallback
        custom_props_db = {}
        if page.custom_properties:
            try:
                if isinstance(page.custom_properties, str):
                    custom_props_db = json.loads(page.custom_properties)
                else:
                    custom_props_db = page.custom_properties
                logger.info(f"📋 custom_properties из базы данных: {len(custom_props_db)} свойств")
            except Exception as e:
                logger.warning(f"⚠️ Не удалось разобрать custom_properties: {e}")
        
        if properties:
            logger.info(f"🔍 Количество свойств в Notion API: {len(properties)}")
            logger.info(f"🔍 Список всех свойств из API: {list(properties.keys())}")
            
            # Логируем типы свойств для отладки
            for prop_name, prop_data in list(properties.items())[:15]:
                prop_type = prop_data.get('type', 'unknown')
                logger.info(f"  - '{prop_name}': тип={prop_type}")
        
        if custom_props_db:
            logger.info(f"📋 Список свойств из базы данных: {list(custom_props_db.keys())}")
        
        # Сначала проверяем attachments в базе данных
        attachments = page.get_attachments_display()
        logger.info(f"📎 Найдено вложений в базе данных: {len(attachments)}")
        if attachments:
            for att in attachments:
                att_name = att.get('name', '')
                att_url = att.get('url', '')
                att_type = att.get('type', '')
                logger.info(f"  - Вложение: {att_name}, тип: {att_type}, URL: {att_url[:50] if att_url else 'нет'}")
                
                # Ищем PDF файлы
                if att_type == 'pdf' or att_name.lower().endswith('.pdf') or '.pdf' in att_name.lower():
                    if att_url:
                        cv_file = att
                        logger.info(f"✅ Найден CV файл в attachments базы данных: {att_name}")
                        break
        
        # Ищем CV в полях Notion (через API)
        if not cv_file and notion_service and properties:
            logger.info(f"🔍 Ищем CV в полях Notion через API...")
            # Пробуем разные варианты названия поля CV
            cv_field_names = ['CV', 'cv', 'Резюме', 'Резюме (CV)', 'Resume', 'resume', 'Файл резюме', 'Резюме файл']
            for field_name in cv_field_names:
                if field_name not in properties:
                    continue
                
                prop_data = properties[field_name]
                prop_type = prop_data.get('type', 'unknown')
                logger.info(f"  Поле '{field_name}': тип={prop_type}")
                
                # Если это файловое поле - извлекаем файлы напрямую
                if prop_type == 'files':
                    files = notion_service._extract_files_property(properties, field_name)
                    logger.info(f"    Найдено файлов в поле '{field_name}': {len(files)}")
                    if files:
                        for file_item in files:
                            file_name = file_item.get('name', '')
                            file_url = file_item.get('url', '')
                            logger.info(f"    Файл: {file_name}, URL: {file_url[:80] if file_url else 'нет'}")
                            if file_url and ('.pdf' in file_url.lower() or file_name.lower().endswith('.pdf')):
                                cv_file = file_item
                                logger.info(f"✅ Найден CV файл в файловом поле '{field_name}': {file_name}")
                                break
                        if cv_file:
                            break
                else:
                    # Для других типов полей используем стандартное извлечение
                    cv_value = notion_service._extract_property_value(properties, field_name)
                    if cv_value:
                        logger.info(f"✅ Найдено поле CV '{field_name}': тип значения={type(cv_value)}, значение={str(cv_value)[:100] if not isinstance(cv_value, dict) else 'dict'}")
                        # Если это словарь (файловое поле)
                        if isinstance(cv_value, dict) and cv_value.get('url'):
                            cv_file = {'url': cv_value['url'], 'name': cv_value.get('name', 'CV.pdf'), 'type': cv_value.get('type', 'pdf')}
                            logger.info(f"✅ Найден CV файл из поля '{field_name}' (dict): {cv_value.get('name', 'CV.pdf')}, URL={cv_value['url'][:50]}")
                            break
                        # Проверяем, это ссылка или URL (строка)
                        elif isinstance(cv_value, str) and ('http' in cv_value or cv_value.startswith('https://') or '.pdf' in cv_value.lower()):
                            cv_file = {'url': cv_value, 'name': f'CV_{field_name}.pdf', 'type': 'pdf'}
                            logger.info(f"✅ Найден CV файл по ссылке из поля '{field_name}': {cv_value[:50]}")
                            break
            
            # Если не нашли по точным названиям, ищем в любом поле типа files
            if not cv_file:
                logger.info(f"🔍 Ищем CV в файловых полях API...")
                for prop_name, prop_data in properties.items():
                    prop_type = prop_data.get('type')
                    logger.info(f"  Проверяем поле '{prop_name}': тип={prop_type}")
                    if prop_type == 'files':
                        files = notion_service._extract_files_property(properties, prop_name)
                        logger.info(f"    Найдено файлов в поле '{prop_name}': {len(files)}")
                        if files:
                            for file_item in files:
                                file_name = file_item.get('name', '')
                                file_url = file_item.get('url', '')
                                logger.info(f"    Файл: {file_name}, URL: {file_url[:50] if file_url else 'нет'}")
                                if file_name.lower().endswith('.pdf') or '.pdf' in file_url.lower():
                                    cv_file = file_item
                                    logger.info(f"✅ Найден CV файл в файловом поле '{prop_name}': {file_name}")
                                    break
                        if cv_file:
                            break
        
        # Также ищем в custom_properties из базы данных
        if not cv_file and custom_props_db:
            logger.info(f"🔍 Ищем CV в custom_properties из базы данных...")
            cv_field_names = ['CV', 'cv', 'Резюме', 'Резюме (CV)', 'Resume', 'resume', 'Файл резюме']
            for prop_id, prop_data in custom_props_db.items():
                if isinstance(prop_data, dict):
                    prop_name = prop_data.get('name', '').lower()
                    prop_type = prop_data.get('type', '')
                    prop_value = prop_data.get('value', '')
                    
                    # Проверяем, соответствует ли название поля CV
                    if any(field_name.lower() in prop_name for field_name in cv_field_names):
                        logger.info(f"✅ Найдено поле CV в базе: '{prop_data.get('name')}', тип={prop_type}, значение={str(prop_value)[:50]}")
                        
                        # Если это файловое поле или URL
                        if prop_type == 'files' and isinstance(prop_value, list) and len(prop_value) > 0:
                            for file_item in prop_value:
                                if isinstance(file_item, dict):
                                    file_url = file_item.get('url', '')
                                    file_name = file_item.get('name', '')
                                    if file_url and ('.pdf' in file_url.lower() or file_name.lower().endswith('.pdf')):
                                        cv_file = {'url': file_url, 'name': file_name, 'type': 'pdf'}
                                        logger.info(f"✅ Найден CV файл в базе данных: {file_name}")
                                        break
                        elif isinstance(prop_value, str) and ('http' in prop_value or '.pdf' in prop_value.lower()):
                            cv_file = {'url': prop_value, 'name': 'CV.pdf', 'type': 'pdf'}
                            logger.info(f"✅ Найден CV по ссылке в базе данных: {prop_value[:50]}")
                        
                        if cv_file:
                            break
        
        # Если CV не найден, ищем LinkedIn и Rabota.by в API
        if not cv_file and notion_service and properties:
            logger.info(f"🔍 Ищем LinkedIn и Rabota.by ссылки...")
            
            # Ищем LinkedIn
            linkedin_field_names = ['LinkedIn', 'linkedin', 'LinkedIn URL', 'LinkedIn ссылка']
            for field_name in linkedin_field_names:
                if field_name not in properties:
                    continue
                
                prop_data = properties[field_name]
                prop_type = prop_data.get('type', 'unknown')
                logger.info(f"  Поле '{field_name}' (LinkedIn): тип={prop_type}")
                
                linkedin_value = notion_service._extract_property_value(properties, field_name)
                logger.info(f"    Значение из поля '{field_name}': тип={type(linkedin_value)}, значение={str(linkedin_value)[:100] if linkedin_value else 'пусто'}")
                
                if linkedin_value and isinstance(linkedin_value, str):
                    # Если в значении есть linkedin.com - берем его
                    if 'linkedin.com' in linkedin_value.lower():
                        linkedin_url = linkedin_value
                        logger.info(f"✅ Найдена LinkedIn ссылка в поле '{field_name}': {linkedin_url[:50]}")
                        break
                    # Если поле называется LinkedIn, но в значении нет linkedin.com, все равно берем
                    # (может быть короткая ссылка или без домена)
                    elif 'linkedin' in field_name.lower() and (linkedin_value.startswith('http') or linkedin_value.startswith('www.')):
                        linkedin_url = linkedin_value
                        logger.info(f"✅ Найдена LinkedIn ссылка в поле '{field_name}' (по названию поля): {linkedin_url[:50]}")
                        break
            
            # Если не нашли по точным названиям, ищем в любом поле
            if not linkedin_url:
                for prop_name, prop_data in properties.items():
                    prop_value = notion_service._extract_property_value(properties, prop_name)
                    if prop_value and isinstance(prop_value, str):
                        if 'linkedin' in prop_name.lower() or 'linkedin.com' in prop_value.lower():
                            linkedin_url = prop_value
                            logger.info(f"✅ Найдена LinkedIn ссылка в поле '{prop_name}': {linkedin_url[:50]}")
                            break
            
            # Ищем Rabota.by
            if not linkedin_url:
                logger.info(f"🔍 Ищем Rabota.by ссылку...")
                rabota_field_names = ['Rabota.by', 'Rabota', 'rabota', 'Rabota URL', 'Работа.by']
                for field_name in rabota_field_names:
                    if field_name not in properties:
                        continue
                    
                    prop_data = properties[field_name]
                    prop_type = prop_data.get('type', 'unknown')
                    logger.info(f"  Поле '{field_name}' (Rabota.by): тип={prop_type}")
                    
                    rabota_value = notion_service._extract_property_value(properties, field_name)
                    logger.info(f"    Значение из поля '{field_name}': тип={type(rabota_value)}, значение={str(rabota_value)[:100] if rabota_value else 'пусто'}")
                    
                    if rabota_value and isinstance(rabota_value, str):
                        # Если в значении есть rabota.by - берем его
                        if 'rabota.by' in rabota_value.lower():
                            rabota_url = rabota_value
                            logger.info(f"✅ Найдена Rabota.by ссылка в поле '{field_name}': {rabota_url[:50]}")
                            break
                        # Если поле называется Rabota.by, но в значении нет rabota.by, все равно берем
                        # (может быть короткая ссылка или без домена)
                        elif 'rabota' in field_name.lower() and (rabota_value.startswith('http') or rabota_value.startswith('www.')):
                            rabota_url = rabota_value
                            logger.info(f"✅ Найдена Rabota.by ссылка в поле '{field_name}' (по названию поля): {rabota_url[:50]}")
                            break
                
                # Если не нашли по точным названиям, ищем в любом поле
                if not rabota_url:
                    for prop_name, prop_data in properties.items():
                        prop_value = notion_service._extract_property_value(properties, prop_name)
                        if prop_value and isinstance(prop_value, str):
                            if 'rabota' in prop_name.lower() or 'rabota.by' in prop_value.lower():
                                rabota_url = prop_value
                                logger.info(f"✅ Найдена Rabota.by ссылка в поле '{prop_name}': {rabota_url[:50]}")
                                break
        
        # Также ищем LinkedIn и Rabota.by в custom_properties из базы данных
        if (not cv_file and not linkedin_url and not rabota_url) and custom_props_db:
            logger.info(f"🔍 Ищем LinkedIn и Rabota.by в custom_properties из базы данных...")
            
            for prop_id, prop_data in custom_props_db.items():
                if isinstance(prop_data, dict):
                    prop_name = prop_data.get('name', '').lower()
                    prop_value = prop_data.get('value', '')
                    
                    if isinstance(prop_value, str):
                        # Ищем LinkedIn
                        if not linkedin_url and ('linkedin' in prop_name or 'linkedin.com' in prop_value.lower()):
                            linkedin_url = prop_value
                            logger.info(f"✅ Найдена LinkedIn ссылка в базе данных (поле '{prop_data.get('name')}'): {linkedin_url[:50]}")
                        
                        # Ищем Rabota.by
                        elif not rabota_url and ('rabota' in prop_name or 'rabota.by' in prop_value.lower()):
                            rabota_url = prop_value
                            logger.info(f"✅ Найдена Rabota.by ссылка в базе данных (поле '{prop_data.get('name')}'): {rabota_url[:50]}")
        
        # Логируем итоговый результат поиска
        logger.info(f"📊 Результат поиска источников:")
        logger.info(f"  - CV файл: {'найден' if cv_file else 'не найден'}")
        logger.info(f"  - LinkedIn: {'найден' if linkedin_url else 'не найден'}")
        logger.info(f"  - Rabota.by: {'найден' if rabota_url else 'не найден'}")
        
        # 2. Создаем кандидата через парсинг
        parsed_data = None
        if cv_file:
            # Загружаем и парсим CV файл
            cv_url = cv_file.get('url')
            cv_name = cv_file.get('name', 'resume.pdf')
            logger.info(f"📤 Загружаем CV файл для парсинга: {cv_name}, URL: {cv_url[:50] if cv_url else 'нет URL'}")
            
            if not cv_url:
                logger.error(f"❌ У CV файла отсутствует URL")
            else:
                try:
                    import requests
                    file_response = requests.get(cv_url, timeout=30, allow_redirects=True)
                    logger.info(f"📥 Ответ при загрузке CV: {file_response.status_code}")
                    
                    if file_response.status_code == 200:
                        file_data = file_response.content
                        logger.info(f"📦 Размер CV файла: {len(file_data)} байт")
                        
                        parsed_data = huntflow_service.upload_file(
                            account_id=account_id,
                            file_data=file_data,
                            file_name=cv_name,
                            parse_file=True
                        )
                        
                        if parsed_data:
                            logger.info(f"✅ CV файл успешно обработан и распарсен")
                        else:
                            logger.error(f"❌ CV файл загружен, но не удалось его распарсить")
                    elif file_response.status_code == 403:
                        # Если 403, пробуем использовать авторизацию Notion или альтернативный подход
                        logger.warning(f"⚠️ CV файл недоступен напрямую (HTTP 403), пробуем альтернативные методы")
                        # Для Notion файлов нужна авторизация через API токен
                        # Попробуем получить файл через Notion API с авторизацией
                        try:
                            # Получаем токен из настроек
                            notion_settings = page.notion_settings
                            if notion_settings and notion_settings.integration_token:
                                import requests as req
                                headers = {
                                    'Authorization': f'Bearer {notion_settings.integration_token}',
                                    'Notion-Version': '2022-06-28'
                                }
                                # Пытаемся загрузить файл с авторизацией
                                auth_response = req.get(cv_url, headers=headers, timeout=30, allow_redirects=True)
                                logger.info(f"📥 Ответ при загрузке CV с авторизацией: {auth_response.status_code}")
                                
                                if auth_response.status_code == 200:
                                    file_data = auth_response.content
                                    logger.info(f"📦 Размер CV файла (с авторизацией): {len(file_data)} байт")
                                    parsed_data = huntflow_service.upload_file(
                                        account_id=account_id,
                                        file_data=file_data,
                                        file_name=cv_name,
                                        parse_file=True
                                    )
                                    if parsed_data:
                                        logger.info(f"✅ CV файл успешно обработан и распарсен (с авторизацией)")
                                else:
                                    logger.error(f"❌ Не удалось загрузить CV файл даже с авторизацией: HTTP {auth_response.status_code}")
                                    # Создаем минимальный parsed_data для продолжения работы
                                    parsed_data = {
                                        'fields': {
                                            'name': {'first': '', 'last': ''},
                                        }
                                    }
                                    logger.info(f"✅ Создан пустой parsed_data для продолжения обработки")
                            else:
                                logger.error(f"❌ Не найден integration_token для авторизации Notion")
                                parsed_data = {
                                    'fields': {
                                        'name': {'first': '', 'last': ''},
                                    }
                                }
                        except Exception as auth_error:
                            logger.error(f"❌ Ошибка при попытке авторизации: {auth_error}", exc_info=True)
                            # Создаем минимальный parsed_data для продолжения работы
                            parsed_data = {
                                'fields': {
                                    'name': {'first': '', 'last': ''},
                                }
                            }
                    else:
                        logger.error(f"❌ Не удалось загрузить CV файл: HTTP {file_response.status_code}")
                except Exception as e:
                    logger.error(f"❌ Ошибка обработки CV файла: {e}", exc_info=True)
        
        elif linkedin_url:
            # Создаем данные LinkedIn профиля
            logger.info(f"💼 Создаем данные LinkedIn профиля для: {linkedin_url[:50]}")
            parsed_data = huntflow_service.create_linkedin_profile_data(
                linkedin_url=linkedin_url,
                task_name=page.title
            )
            if parsed_data:
                logger.info(f"✅ Данные LinkedIn профиля успешно созданы")
            else:
                logger.error(f"❌ Не удалось создать данные LinkedIn профиля")
        
        elif rabota_url:
            # Создаем данные Rabota.by профиля
            logger.info(f"📋 Создаем данные Rabota.by профиля для: {rabota_url[:50]}")
            parsed_data = huntflow_service.create_rabota_by_profile_data(
                rabota_url=rabota_url,
                task_name=page.title
            )
            if parsed_data:
                logger.info(f"✅ Данные Rabota.by профиля успешно созданы")
            else:
                logger.error(f"❌ Не удалось создать данные Rabota.by профиля")
        
        # Проверяем, что parsed_data получен и имеет правильную структуру
        if not parsed_data:
            logger.error(f"❌ parsed_data равен None после обработки источника")
            
            # Формируем детальное сообщение об ошибке
            error_details = []
            attachments_count = len(attachments) if 'attachments' in locals() else 0
            error_details.append(f"Проверены attachments в базе данных: {attachments_count} файлов")
            
            if notion_service:
                error_details.append(f"Проверены свойства из Notion API: {len(properties)} свойств")
            else:
                error_details.append("Notion API недоступен (нет integration token)")
                
            if custom_props_db:
                error_details.append(f"Проверены custom_properties из базы: {len(custom_props_db)} свойств")
            else:
                error_details.append("custom_properties из базы данных недоступны или пусты")
            
            # Логируем все найденные свойства для отладки
            if properties:
                logger.error(f"❌ Доступные свойства из API: {list(properties.keys())}")
            if custom_props_db:
                logger.error(f"❌ Доступные свойства из базы: {list(custom_props_db.keys())}")
            
            error_message = (
                'Не найден CV файл, LinkedIn или Rabota.by ссылка для создания кандидата. '
                f'Проверено: {"; ".join(error_details)}. '
                'Убедитесь, что на странице Notion заполнено поле CV (файл PDF), LinkedIn или Rabota.by ссылка. '
                'Проверьте логи сервера для детальной информации.'
            )
            
            logger.error(f"❌ Детали ошибки: {error_message}")
            return JsonResponse({
                'success': False,
                'error': error_message
            })
        
        if not isinstance(parsed_data, dict):
            logger.error(f"❌ parsed_data имеет неожиданный тип: {type(parsed_data)}")
            return JsonResponse({
                'success': False,
                'error': 'Неверный формат данных для создания кандидата'
            })
        
        logger.info(f"🔍 Структура parsed_data: {list(parsed_data.keys()) if isinstance(parsed_data, dict) else 'не словарь'}")
        
        # Нормализуем структуру parsed_data
        # upload_file может вернуть структуру с 'result' или напрямую, нужно привести к единому формату
        if 'result' in parsed_data:
            parsed_data = parsed_data['result']
        
        # Убеждаемся, что структура fields существует
        if 'fields' not in parsed_data or not isinstance(parsed_data.get('fields'), dict):
            parsed_data['fields'] = {}
        
        # 3. Разбиваем название задачи на Фамилию/Имя (игнорируя 3-е слово)
        name_parts = _split_task_name_to_name_parts(page.title)
        logger.info(f"👤 Извлечено имя из '{page.title}': {name_parts}")
        
        # Перезаписываем имя в parsed_data принудительно
        # Убеждаемся, что структура name существует
        if 'name' not in parsed_data['fields'] or not isinstance(parsed_data['fields'].get('name'), dict):
            parsed_data['fields']['name'] = {}
        
        parsed_data['fields']['name']['first'] = name_parts['first_name']
        parsed_data['fields']['name']['last'] = name_parts['last_name']
        
        # 4. Заполняем извлеченные поля в parsed_data
        if email:
            parsed_data['fields']['email'] = email
        
        if phone:
            if not isinstance(parsed_data['fields'].get('phones'), list):
                parsed_data['fields']['phones'] = []
            parsed_data['fields']['phones'] = [phone]
        
        if salary:
            parsed_data['fields']['salary'] = salary
        
        # 5. Создаем кандидата в Huntflow
        applicant = huntflow_service.create_applicant_from_parsed_data(
            account_id=account_id,
            parsed_data=parsed_data,
            task_name=page.title,
            notion_data={
                'title': page.title,
                'url': page.url,
                'status': page.status,
                'comments': page.get_comments_display(),
            }
        )
        
        if not applicant:
            return JsonResponse({
                'success': False,
                'error': 'Не удалось создать кандидата в Huntflow'
            })
        
        applicant_id = applicant.get('id')
        if not applicant_id:
            return JsonResponse({
                'success': False,
                'error': 'Кандидат создан, но ID не получен'
            })
        
        logger.info(f"✅ Кандидат создан в Huntflow с ID: {applicant_id}")
        
        # 6. Обновляем поля кандидата (Email, Phone, Salary уже должны быть в parsed_data)
        # Но если их нет, обновляем отдельно
        update_data = {}
        
        if email and not applicant.get('email'):
            update_data['email'] = email
        
        if phone and not applicant.get('phone'):
            update_data['phone'] = phone
        
        if salary:
            update_data['money'] = salary
        
        if update_data:
            huntflow_service.update_applicant(account_id, applicant_id, update_data)
            logger.info(f"✅ Обновлены базовые поля: {list(update_data.keys())}")
        
        # 7. Заполняем Level в дополнительное поле "Уровень"
        if level:
            # Получаем схему анкеты для поиска поля "Уровень"
            questionary_schema = huntflow_service.get_applicant_questionary_schema(account_id)
            if questionary_schema:
                # Ищем поле "Уровень"
                level_field_id = None
                for field_id, field_info in questionary_schema.items():
                    if isinstance(field_info, dict):
                        field_title = field_info.get('title', '').lower()
                        if 'уровень' in field_title or 'level' in field_title:
                            level_field_id = field_id
                            break
                
                if level_field_id:
                    questionary_data = {level_field_id: level}
                    huntflow_service.update_applicant_questionary(account_id, applicant_id, questionary_data)
                    logger.info(f"✅ Заполнено поле 'Уровень': {level}")
        
        # 8. Заполняем Нюансы -> дополнительные поля по связкам
        if nuances:
            # Получаем связки для Нюансы
            nuances_mappings = NotionHuntflowMapping.objects.filter(
                user=user,
                mapping_type='nuances_field'
            )
            
            if nuances_mappings:
                questionary_schema = huntflow_service.get_applicant_questionary_schema(account_id)
                questionary_data = {}
                
                # Группируем значения Нюансы по полям Huntflow
                field_values = {}  # {field_id: [values]}
                for nuance in nuances:
                    mapping = nuances_mappings.filter(notion_value=nuance).first()
                    if mapping:
                        field_id = mapping.huntflow_value
                        if field_id not in field_values:
                            field_values[field_id] = []
                        field_values[field_id].append(nuance)
                
                # Заполняем поля (несколько значений через запятую)
                for field_id, values in field_values.items():
                    questionary_data[field_id] = ', '.join(values)
                
                if questionary_data:
                    huntflow_service.update_applicant_questionary(account_id, applicant_id, questionary_data)
                    logger.info(f"✅ Заполнены дополнительные поля из Нюансы: {list(questionary_data.keys())}")
        
        # 9. Привязываем к вакансии по Language через связку Notion ↔ Huntflow
        target_vacancy_id = vacancy_id  # Используем переданную вакансию или определяем по Language
        
        # Нормализуем language (убираем пробелы, приводим к строке)
        if language:
            language = str(language).strip()
            if not language:  # Если после strip осталась пустая строка
                language = None
        
        # Логируем значение language для отладки
        logger.info(f"🌐 Значение Language из Notion: '{language}' (тип: {type(language)})")
        
        if language and not vacancy_id:
            # Ищем связку Language → Вакансия (с учетом регистра)
            language_mapping = NotionHuntflowMapping.objects.filter(
                user=user,
                mapping_type='language_vacancy',
                notion_value__iexact=language  # Поиск без учета регистра
            ).first()
            
            # Если не найдено с учетом регистра, пробуем точное совпадение
            if not language_mapping:
                language_mapping = NotionHuntflowMapping.objects.filter(
                    user=user,
                    mapping_type='language_vacancy',
                    notion_value=language
                ).first()
            
            if language_mapping:
                target_vacancy_id = int(language_mapping.huntflow_value)
                logger.info(f"✅ Найдена связка Language → Вакансия: '{language}' → {target_vacancy_id}")
                
                # Используем метод _bind_applicant_to_vacancy для правильной привязки
                try:
                    binding_success = huntflow_service._bind_applicant_to_vacancy(
                        account_id=account_id,
                        applicant_id=applicant_id,
                        vacancy_id=target_vacancy_id,
                        task_status=page.status  # Передаем статус страницы для обработки reject
                    )
                    
                    if binding_success:
                        logger.info(f"✅ Кандидат успешно привязан к вакансии {target_vacancy_id} по Language: {language}")
                    else:
                        logger.error(f"❌ Не удалось привязать кандидата к вакансии {target_vacancy_id}")
                except Exception as e:
                    logger.error(f"❌ Ошибка при привязке к вакансии: {e}", exc_info=True)
            else:
                logger.warning(f"⚠️ Не найдена связка Language → Вакансия для значения '{language}'. Проверьте настройки Notion ↔ Huntflow.")
        elif not language:
            logger.warning(f"⚠️ Поле Language не заполнено в Notion странице. Вакансия не будет привязана автоматически.")
        elif vacancy_id:
            logger.info(f"ℹ️ Вакансия {vacancy_id} была передана явно, привязка по Language не требуется.")
        
        # 10. Добавляем комментарий со ссылкой на Notion задачу
        notion_comment = f"📋 Задача в Notion: {page.url}\n\n"
        huntflow_service.add_applicant_comment(
            account_id=account_id,
            applicant_id=applicant_id,
            comment=notion_comment,
            vacancy_id=target_vacancy_id
        )
        
        # 11. Добавляем все комментарии из Notion
        comments = page.get_comments_display()
        for comment in comments:
            comment_text = comment.get('text', '')
            author_name = comment.get('author_name', comment.get('author', 'Неизвестно'))
            formatted_time = comment.get('formatted_time', comment.get('created_time', ''))
            
            comment_full = f"{comment_text}\n\n— {author_name}"
            if formatted_time:
                comment_full += f" ({formatted_time})"
            
            huntflow_service.add_applicant_comment(
                account_id=account_id,
                applicant_id=applicant_id,
                comment=comment_full,
                vacancy_id=target_vacancy_id
            )
        
        logger.info(f"✅ Добавлены комментарии из Notion: {len(comments)} шт.")
        
        # 12. Добавляем метки
        tags_to_add = []
        
        # Метка "notion"
        notion_tag_id = huntflow_service._find_tag_by_name(account_id, "notion")
        if notion_tag_id:
            tags_to_add.append(notion_tag_id)
        
        # Метка по Screening Owner
        if screening_owner:
            owner_tag_id = huntflow_service._find_tag_by_name(account_id, screening_owner)
            if owner_tag_id:
                tags_to_add.append(owner_tag_id)
        
        if tags_to_add:
            tag_data = {'tags': tags_to_add}
            huntflow_service._make_request('POST', f"/accounts/{account_id}/applicants/{applicant_id}/tags", json=tag_data)
            logger.info(f"✅ Добавлены метки: {tags_to_add}")
        
        # 13. Изменяем статус по связке Status Notion -> Status Huntflow
        if page.status:
            status_mapping = NotionHuntflowMapping.objects.filter(
                user=user,
                mapping_type='status_status',
                notion_value=page.status
            ).first()
            
            if status_mapping:
                target_status_id = int(status_mapping.huntflow_value)
                # Проверяем, является ли статус отказом
                status_name_lower = page.status.lower()
                is_rejection = 'отказ' in status_name_lower or 'no' in status_name_lower or 'rejected' in status_name_lower
                
                # Получаем текущую вакансию кандидата
                applicant_data = huntflow_service.get_applicant(account_id, applicant_id)
                current_vacancy_id = None
                if applicant_data and applicant_data.get('links'):
                    current_vacancy_id = applicant_data['links'][0].get('vacancy') if applicant_data['links'] else None
                
                # Обновляем статус
                huntflow_service.update_applicant_status(
                    account_id=account_id,
                    applicant_id=applicant_id,
                    status_id=target_status_id,
                    vacancy_id=current_vacancy_id or target_vacancy_id,
                    comment='Другая причина' if is_rejection else None
                )
                logger.info(f"✅ Статус изменен на {target_status_id} (Notion статус: {page.status})")
        
        return JsonResponse({
            'success': True,
            'message': f'Кандидат успешно перенесен в Huntflow (ID: {applicant_id})',
            'applicant_id': applicant_id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Неверный формат JSON'})
    except Exception as e:
        logger.error(f"❌ Ошибка переноса в Huntflow: {e}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': f'Ошибка переноса: {str(e)}'
        })

