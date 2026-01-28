"""
Веб-представления для HeadHunter.ru интеграции

ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы
ИСТОЧНИКИ ДАННЫХ: Django views, HHRUService, модели
ОБРАБОТКА: Веб-интерфейс для работы с HH.ru
ВЫХОДЯЩИЕ ДАННЫЕ: HTML страницы
СВЯЗИ: Модели, сервисы
ФОРМАТ: Django views
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.safestring import mark_safe
from .models import HHRUAccount, HHRUConfiguration, HHRUAPILog
from .services import HHRUService, HHRUOAuthService
from .forms import HHRUConfigurationForm
import json
import logging

logger = logging.getLogger(__name__)


@login_required
def dashboard(request):
    """
    Главная страница интеграции с HeadHunter.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUAccount, HHRUService
    ОБРАБОТКА: Отображение дашборда с информацией о подключении
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница dashboard.html
    СВЯЗИ: HHRUAccount, HHRUService
    ФОРМАТ: Django view
    """
    try:
        # Получаем аккаунт пользователя
        account = None
        connection_status = None
        connection_message = None
        
        try:
            account = HHRUAccount.objects.get(user=request.user)
            
            # Проверяем подключение
            service = HHRUService(request.user)
            service.account = account
            success, message = service.test_connection()
            connection_status = 'success' if success else 'error'
            connection_message = message
            
        except HHRUAccount.DoesNotExist:
            connection_status = 'not_connected'
            connection_message = 'Аккаунт не подключен'
        
        # Проверяем наличие конфигурации
        config = HHRUConfiguration.get_default(request.user)
        has_config = config is not None
        
        # Получаем статистику
        stats = {
            'total_logs': HHRUAPILog.objects.filter(user=request.user).count(),
            'successful_requests': HHRUAPILog.objects.filter(
                user=request.user,
                status_code__gte=200,
                status_code__lt=300
            ).count(),
            'failed_requests': HHRUAPILog.objects.filter(
                user=request.user,
                status_code__gte=400
            ).count(),
        }
        
        # Последние логи
        recent_logs = HHRUAPILog.objects.filter(user=request.user)[:10]
        
        context = {
            'account': account,
            'connection_status': connection_status,
            'connection_message': connection_message,
            'stats': stats,
            'recent_logs': recent_logs,
            'has_config': has_config,
            'config': config,
        }
        
        return render(request, 'hhru/dashboard.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка в dashboard: {str(e)}")
        messages.error(request, f'Ошибка загрузки дашборда: {str(e)}')
        return render(request, 'hhru/dashboard.html', {
            'error': str(e)
        })


@login_required
def accounts_list(request):
    """
    Список подключенных аккаунтов HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUAccount
    ОБРАБОТКА: Отображение списка аккаунтов пользователя
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница accounts_list.html
    СВЯЗИ: HHRUAccount
    ФОРМАТ: Django view
    """
    accounts = HHRUAccount.objects.filter(user=request.user)
    
    # Добавляем информацию о статусе токена для каждого аккаунта
    accounts_with_status = []
    for account in accounts:
        accounts_with_status.append({
            'account': account,
            'token_valid': account.is_token_valid(),
            'needs_refresh': account.needs_refresh(),
        })
    
    context = {
        'accounts': accounts_with_status,
    }
    
    return render(request, 'hhru/accounts_list.html', context)


@login_required
def account_detail(request, account_id):
    """
    Детальная информация об аккаунте
    
    ВХОДЯЩИЕ ДАННЫЕ: account_id
    ИСТОЧНИКИ ДАННЫХ: HHRUAccount, HHRUService
    ОБРАБОТКА: Отображение детальной информации об аккаунте
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница account_detail.html
    СВЯЗИ: HHRUAccount, HHRUService
    ФОРМАТ: Django view
    """
    try:
        account = HHRUAccount.objects.get(id=account_id, user=request.user)
        
        # Получаем данные профиля из HH.ru
        profile_data = None
        vacancies = None
        
        try:
            service = HHRUService(request.user)
            service.account = account
            
            # Получаем профиль
            profile_result = service.get_me()
            if profile_result.get('success'):
                profile_data = profile_result.get('data')
            
            # Получаем вакансии
            vacancies_result = service.get_vacancies()
            if vacancies_result.get('success'):
                vacancies = vacancies_result.get('data', {}).get('items', [])
                
        except Exception as e:
            logger.error(f"Ошибка получения данных из HH.ru: {str(e)}")
            messages.warning(request, f'Не удалось получить данные из HH.ru: {str(e)}')
        
        # Форматируем profile_data для отображения в шаблоне
        profile_data_formatted = None
        if profile_data:
            profile_data_formatted = mark_safe(json.dumps(profile_data, indent=2, ensure_ascii=False))
        
        context = {
            'account': account,
            'profile_data': profile_data_formatted,
            'vacancies': vacancies,
            'token_valid': account.is_token_valid(),
        }
        
        return render(request, 'hhru/account_detail.html', context)
        
    except HHRUAccount.DoesNotExist:
        messages.error(request, 'Аккаунт не найден')
        return redirect('hhru:accounts_list')


@login_required
def configurations_list(request):
    """
    Список конфигураций OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUConfiguration
    ОБРАБОТКА: Отображение списка конфигураций
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница configurations_list.html
    СВЯЗИ: HHRUConfiguration
    ФОРМАТ: Django view
    """
    # Показываем только конфигурации текущего пользователя
    configurations = HHRUConfiguration.objects.filter(user=request.user)
    
    context = {
        'configurations': configurations,
    }
    
    return render(request, 'hhru/configurations_list.html', context)


@login_required
def configuration_create(request):
    """
    Создание новой конфигурации OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user, POST данные формы
    ИСТОЧНИКИ ДАННЫХ: HHRUConfigurationForm
    ОБРАБОТКА: Создание новой конфигурации для пользователя
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница configuration_form.html или редирект
    СВЯЗИ: HHRUConfigurationForm
    ФОРМАТ: Django view
    """
    if request.method == 'POST':
        form = HHRUConfigurationForm(request.POST, user=request.user)
        if form.is_valid():
            config = form.save()
            messages.success(request, f'Конфигурация "{config.name}" успешно создана!')
            return redirect('hhru:oauth_authorize')
    else:
        form = HHRUConfigurationForm(user=request.user)
    
    context = {
        'form': form,
        'title': 'Создание конфигурации OAuth',
        'submit_text': 'Создать конфигурацию',
    }
    
    return render(request, 'hhru/configuration_form.html', context)


@login_required
def configuration_edit(request, config_id):
    """
    Редактирование конфигурации OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: config_id, request.user, POST данные формы
    ИСТОЧНИКИ ДАННЫХ: HHRUConfigurationForm
    ОБРАБОТКА: Редактирование конфигурации пользователя
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница configuration_form.html или редирект
    СВЯЗИ: HHRUConfigurationForm
    ФОРМАТ: Django view
    """
    config = get_object_or_404(HHRUConfiguration, id=config_id, user=request.user)
    
    if request.method == 'POST':
        form = HHRUConfigurationForm(request.POST, instance=config, user=request.user)
        if form.is_valid():
            config = form.save()
            messages.success(request, f'Конфигурация "{config.name}" успешно обновлена!')
            return redirect('hhru:configurations_list')
    else:
        form = HHRUConfigurationForm(instance=config, user=request.user)
    
    context = {
        'form': form,
        'config': config,
        'title': 'Редактирование конфигурации OAuth',
        'submit_text': 'Сохранить изменения',
    }
    
    return render(request, 'hhru/configuration_form.html', context)


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def configuration_delete(request, config_id):
    """
    Удаление конфигурации OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: config_id, request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUConfiguration
    ОБРАБОТКА: Удаление конфигурации пользователя
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON ответ или редирект
    СВЯЗИ: HHRUConfiguration
    ФОРМАТ: Django view
    """
    config = get_object_or_404(HHRUConfiguration, id=config_id, user=request.user)
    config_name = config.name
    config.delete()
    
    messages.success(request, f'Конфигурация "{config_name}" удалена')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True})
    
    return redirect('hhru:configurations_list')


@login_required
def oauth_authorize(request):
    """
    Страница авторизации через OAuth
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUOAuthService, HHRUConfiguration
    ОБРАБОТКА: Получение URL авторизации и перенаправление пользователя
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница oauth_authorize.html или редирект
    СВЯЗИ: HHRUOAuthService
    ФОРМАТ: Django view
    """
    # Проверяем, есть ли уже подключенный аккаунт
    try:
        account = HHRUAccount.objects.filter(user=request.user).first()
        if account:
            messages.info(request, 'У вас уже подключен аккаунт HH.ru')
            return redirect('hhru:dashboard')
    except Exception as e:
        logger.warning(f"Ошибка проверки аккаунта: {str(e)}")
        # Продолжаем выполнение, если возникла ошибка
    
    # Проверяем наличие конфигурации
    config = HHRUConfiguration.get_default(request.user)
    if not config:
        # Если конфигурации нет, перенаправляем на создание
        messages.warning(request, 'Для подключения к HH.ru необходимо создать конфигурацию OAuth')
        return redirect('hhru:configuration_create')
    
    # Получаем URL авторизации
    result = HHRUOAuthService.get_authorization_url(request.user)
    
    if not result.get('success'):
        messages.error(request, result.get('error', 'Ошибка получения URL авторизации'))
        return redirect('hhru:configuration_create')
    
    auth_url = result.get('auth_url')
    
    # Если это POST запрос, перенаправляем на авторизацию
    if request.method == 'POST':
        return redirect(auth_url)
    
    context = {
        'auth_url': auth_url,
        'config': config,
    }
    
    return render(request, 'hhru/oauth_authorize.html', context)


@login_required
def oauth_callback(request):
    """
    Обработка OAuth callback
    
    ВХОДЯЩИЕ ДАННЫЕ: code, state из query параметров
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru OAuth callback
    ОБРАБОТКА: Обмен кода на токены и создание аккаунта
    ВЫХОДЯЩИЕ ДАННЫЕ: Редирект на dashboard
    СВЯЗИ: HHRUOAuthService
    ФОРМАТ: Django view
    """
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    if error:
        messages.error(request, f'Ошибка авторизации: {error}')
        return redirect('hhru:oauth_authorize')
    
    if not code:
        messages.error(request, 'Код авторизации не получен')
        return redirect('hhru:oauth_authorize')
    
    # Обмениваем код на токены
    result = HHRUOAuthService.exchange_code_for_tokens(
        request.user,
        code
    )
    
    if result.get('success'):
        messages.success(request, 'Авторизация успешна! Аккаунт подключен.')
        return redirect('hhru:dashboard')
    else:
        messages.error(request, result.get('error', 'Ошибка обмена токенов'))
        return redirect('hhru:oauth_authorize')


@login_required
def logs_list(request):
    """
    Список логов API запросов
    
    ВХОДЯЩИЕ ДАННЫЕ: request.user
    ИСТОЧНИКИ ДАННЫХ: HHRUAPILog
    ОБРАБОТКА: Отображение списка логов с фильтрацией
    ВЫХОДЯЩИЕ ДАННЫЕ: HTML страница logs_list.html
    СВЯЗИ: HHRUAPILog
    ФОРМАТ: Django view
    """
    logs = HHRUAPILog.objects.filter(user=request.user)
    
    # Фильтрация
    log_type = request.GET.get('log_type')
    if log_type:
        logs = logs.filter(log_type=log_type)
    
    method = request.GET.get('method')
    if method:
        logs = logs.filter(method=method)
    
    # Сортировка
    logs = logs.order_by('-created_at')
    
    context = {
        'logs': logs,
        'log_types': HHRUAPILog.LOG_TYPES,
    }
    
    return render(request, 'hhru/logs_list.html', context)


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def test_connection_ajax(request):
    """
    AJAX endpoint для тестирования подключения
    
    ВХОДЯЩИЕ ДАННЫЕ: account_id (опционально)
    ИСТОЧНИКИ ДАННЫХ: HHRUService
    ОБРАБОТКА: Тестирование подключения к HH.ru API
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON ответ
    СВЯЗИ: HHRUService
    ФОРМАТ: JSON response
    """
    try:
        account_id = request.POST.get('account_id')
        
        if account_id:
            account = HHRUAccount.objects.get(id=account_id, user=request.user)
        else:
            account = HHRUAccount.objects.get(user=request.user)
        
        service = HHRUService(request.user)
        service.account = account
        
        success, message = service.test_connection()
        
        return JsonResponse({
            'success': success,
            'message': message
        })
        
    except HHRUAccount.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Аккаунт не найден'
        }, status=404)
    except Exception as e:
        logger.error(f"Ошибка тестирования подключения: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def refresh_token_ajax(request):
    """
    AJAX endpoint для обновления токена
    
    ВХОДЯЩИЕ ДАННЫЕ: account_id (опционально)
    ИСТОЧНИКИ ДАННЫХ: HHRUService
    ОБРАБОТКА: Обновление токена доступа
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON ответ
    СВЯЗИ: HHRUService
    ФОРМАТ: JSON response
    """
    try:
        account_id = request.POST.get('account_id')
        
        if account_id:
            account = HHRUAccount.objects.get(id=account_id, user=request.user)
        else:
            account = HHRUAccount.objects.get(user=request.user)
        
        service = HHRUService(request.user)
        service.account = account
        
        new_token = service.refresh_access_token()
        
        if new_token:
            account.refresh_from_db()
            return JsonResponse({
                'success': True,
                'message': 'Токен успешно обновлен'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Не удалось обновить токен'
            }, status=400)
        
    except HHRUAccount.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Аккаунт не найден'
        }, status=404)
    except Exception as e:
        logger.error(f"Ошибка обновления токена: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
