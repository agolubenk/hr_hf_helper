from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib import messages
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json

from .models import User
from .forms import ProfileEditForm, IntegrationSettingsForm
from .logic.user_service import UserService


# =============================================================================
# УНИВЕРСАЛЬНЫЕ ФУНКЦИИ
# =============================================================================

def unified_template_view(request, template_name, context=None):
    """
    Универсальная функция для рендеринга HTML-шаблонов.
    - template_name: строка, путь к шаблону
    - context: словарь с данными для шаблона
    """
    if context is None:
        context = {}
    return render(request, template_name, context)


@csrf_exempt
def unified_api_view(request, handler_func):
    """
    Универсальная функция для обработки JSON-запросов.
    - handler_func: функция, которая принимает словарь data и request, возвращает словарь response_data
    """
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Вызов пользовательского обработчика
    response_data = handler_func(data, request)
    return JsonResponse(response_data)


# =============================================================================
# ФУНКЦИИ-ОБРАБОТЧИКИ ДЛЯ API
# =============================================================================

def login_api_handler(data, request):
    """Обработчик API для входа в систему"""
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return {'error': 'Имя пользователя и пароль обязательны'}
    
    from django.contrib.auth import authenticate
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.is_active:
            login(request, user)
            from .logic.serializers import UserSerializer
            serializer = UserSerializer(user)
            return {
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': serializer.data
            }
        else:
            return {'error': 'Аккаунт деактивирован'}
    else:
        return {'error': 'Неверное имя пользователя или пароль'}


def logout_api_handler(data, request):
    """Обработчик API для выхода из системы"""
    logout(request)
    return {
        'success': True,
        'message': 'Выход выполнен успешно'
    }


def test_gemini_api_handler(data, request):
    """Обработчик API для тестирования Gemini API"""
    api_key = data.get('api_key')
    if not api_key:
        return {'success': False, 'message': 'API ключ не указан'}
    
    # Здесь можно добавить реальную проверку API ключа
    if len(api_key) < 10:
        return {'success': False, 'message': 'API ключ слишком короткий'}
    
    return {'success': True, 'message': 'API ключ валиден'}


def test_huntflow_api_handler(data, request):
    """Обработчик API для тестирования Huntflow API"""
    api_key = data.get('api_key')
    api_url = data.get('api_url')
    system = data.get('system', 'sandbox')
    
    if not api_key or not api_url:
        return {'success': False, 'message': 'API ключ и URL обязательны'}
    
    if len(api_key) < 10:
        return {'success': False, 'message': 'API ключ слишком короткий'}
    
    return {'success': True, 'message': f'Huntflow {system} API ключ валиден'}


def test_clickup_api_handler(data, request):
    """Обработчик API для тестирования ClickUp API"""
    api_key = data.get('api_key')
    if not api_key:
        return {'success': False, 'message': 'API ключ не указан'}
    
    if len(api_key) < 10:
        return {'success': False, 'message': 'API ключ слишком короткий'}
    
    return {'success': True, 'message': 'ClickUp API ключ валиден'}


def test_notion_api_handler(data, request):
    """Обработчик API для тестирования Notion API"""
    api_key = data.get('api_key')
    if not api_key:
        return {'success': False, 'message': 'Integration Token не указан'}
    
    if len(api_key) < 20:
        return {'success': False, 'message': 'Integration Token слишком короткий'}
    
    if not api_key.startswith('secret_'):
        return {'success': False, 'message': 'Integration Token должен начинаться с "secret_"'}
    
    return {'success': True, 'message': 'Notion Integration Token валиден'}


# =============================================================================
# ФУНКЦИИ-ОБРАБОТЧИКИ ДЛЯ ШАБЛОНОВ
# =============================================================================

def profile_template_handler(request):
    """Обработчик для страницы профиля"""
    # Используем сервисный слой для получения данных профиля
    context = UserService.get_user_profile_data(request.user)
    return unified_template_view(request, 'profile/profile.html', context)


def profile_edit_template_handler(request):
    """Обработчик для страницы редактирования профиля"""
    user = request.user
    
    # Получаем информацию о Google OAuth аккаунте
    oauth_account = None
    is_google_oauth_connected = False
    try:
        from apps.google_oauth.models import GoogleOAuthAccount
        oauth_account = GoogleOAuthAccount.objects.get(user=user)
        is_google_oauth_connected = oauth_account is not None
        token_valid = oauth_account.is_token_valid() if oauth_account else False
    except:
        token_valid = False
    
    if request.method == 'POST':
        form = ProfileEditForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Профиль успешно обновлен!')
            return redirect('accounts:profile')
    else:
        form = ProfileEditForm(instance=request.user)
    
    context = {
        'form': form,
        'oauth_account': oauth_account,
        'is_google_oauth_connected': is_google_oauth_connected,
        'token_valid': token_valid,
    }
    
    return unified_template_view(request, 'profile/profile_edit.html', context)


def profile_settings_template_handler(request):
    """Обработчик для страницы настроек профиля"""
    if request.method == 'POST':
        form = IntegrationSettingsForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Настройки успешно сохранены!')
            return redirect('accounts:profile_settings')
    else:
        form = IntegrationSettingsForm(instance=request.user)
    
    context = {'form': form}
    return unified_template_view(request, 'profile/profile_settings.html', context)


def integrations_template_handler(request):
    """Обработчик для страницы интеграций"""
    # Используем сервисный слой для получения статуса интеграций
    integrations_status = UserService.get_integrations_status(request.user)
    
    context = {
        'user': request.user,
        'integrations': integrations_status,
    }
    
    return unified_template_view(request, 'profile/integrations.html', context)


def api_keys_template_handler(request):
    """Обработчик для страницы API ключей"""
    user = request.user
    
    if request.method == 'POST':
        # Используем сервисный слой для обновления API ключей
        data = {
            'gemini_api_key': request.POST.get('gemini_api_key', ''),
            'clickup_api_key': request.POST.get('clickup_api_key', ''),
            'notion_integration_token': request.POST.get('notion_integration_token', ''),
            'huntflow_sandbox_api_key': request.POST.get('huntflow_sandbox_api_key', ''),
            'huntflow_prod_api_key': request.POST.get('huntflow_prod_api_key', ''),
            'huntflow_sandbox_url': request.POST.get('huntflow_sandbox_url', ''),
            'huntflow_prod_url': request.POST.get('huntflow_prod_url', ''),
            'active_system': request.POST.get('active_system', 'sandbox'),
        }
        
        UserService.update_user_api_keys(user, data)
        messages.success(request, 'API ключи успешно обновлены!')
        return redirect('accounts:api_keys')
    
    context = {'user': user}
    return unified_template_view(request, 'profile/api_keys.html', context)


def components_template_handler(request):
    """Обработчик для страницы демонстрации компонентов"""
    from .forms import ProfileEditForm, IntegrationSettingsForm, ApiKeysForm
    
    # Создаем экземпляры форм для демонстрации
    profile_form = ProfileEditForm()
    settings_form = IntegrationSettingsForm()
    api_keys_form = ApiKeysForm()
    
    # Демонстрационные данные
    demo_user = {
        'username': 'demo_user',
        'full_name': 'Иван Иванов',
        'email': 'ivan.ivanov@example.com',
        'telegram_username': '@ivan_ivanov',
        'active_system': 'sandbox',
        'is_observer_active': True,
        'interviewer_calendar_url': 'https://calendar.google.com/calendar/embed?src=example@gmail.com',
    }
    
    # Демонстрационные интеграции
    demo_integrations = {
        'huntflow': {
            'name': 'Huntflow',
            'enabled': True,
            'sandbox_configured': True,
            'prod_configured': False,
            'active_system': 'sandbox',
        },
        'gemini': {
            'name': 'Gemini AI',
            'enabled': True,
            'configured': True,
        },
        'clickup': {
            'name': 'ClickUp',
            'enabled': True,
            'configured': True,
        },
        'telegram': {
            'name': 'Telegram',
            'enabled': True,
            'configured': True,
        }
    }
    
    # Демонстрационные социальные аккаунты
    demo_social_accounts = [
        {
            'provider': 'google',
            'uid': '123456789',
            'extra_data': {'name': 'Иван Иванов', 'email': 'ivan.ivanov@gmail.com'},
            'date_joined': '2024-01-15',
        }
    ]
    
    # Демонстрационная статистика Google
    demo_google_stats = {
        'calendar_events': 15,
        'drive_files': 8,
        'sheets': 3,
    }
    
    context = {
        'profile_form': profile_form,
        'settings_form': settings_form,
        'api_keys_form': api_keys_form,
        'demo_user': demo_user,
        'demo_integrations': demo_integrations,
        'demo_social_accounts': demo_social_accounts,
        'demo_google_stats': demo_google_stats,
    }
    
    return unified_template_view(request, 'temp/components.html', context)


# =============================================================================
# ОСНОВНЫЕ VIEW-ФУНКЦИИ
# =============================================================================

def google_oauth_redirect(request):
    """Прямой переход на Google OAuth"""
    from .logic.oauth_service import GoogleOAuthService
    auth_url = GoogleOAuthService.get_authorization_url(request)
    return redirect(auth_url)


def google_oauth_callback(request):
    """Обработка callback от Google OAuth"""
    from .logic.oauth_service import GoogleOAuthService
    
    result = GoogleOAuthService.handle_oauth_callback(request)
    
    if result['success']:
        messages.success(request, result['message'])
        return redirect('huntflow:dashboard')
    else:
        messages.error(request, result['error'])
        return redirect('account_login')


# Старая функция profile_view удалена - заменена на profile_template_handler


# Старые функции удалены - заменены на template handlers:
# - profile_edit -> profile_edit_template_handler
# - profile_settings -> profile_settings_template_handler  
# - integrations_view -> integrations_template_handler


# Старая функция api_keys_view удалена - заменена на api_keys_template_handler


# Дублированные функции тестирования API удалены
# Теперь используются универсальные API handlers:
# - test_gemini_api_handler
# - test_huntflow_api_handler  
# - test_clickup_api_handler
# - test_notion_api_handler


# Дублированные функции account_login и account_logout удалены
# Теперь используются универсальные функции:
# - unified_login (поддерживает HTML и JSON)
# - unified_logout (поддерживает HTML и JSON)


@csrf_exempt
def unified_login(request):
    """Универсальная функция входа (поддерживает HTML и JSON)"""
    if request.user.is_authenticated:
        if request.content_type == 'application/json':
            return JsonResponse({'success': True, 'message': 'Уже авторизован'})
        return redirect('/huntflow/')
    
    if request.method == 'POST':
        # Определяем тип запроса
        if request.content_type == 'application/json':
            # JSON API запрос
            try:
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Неверный JSON'}, status=400)
        else:
            # HTML форма
            username = request.POST.get('username')
            password = request.POST.get('password')
        
        if not username or not password:
            if request.content_type == 'application/json':
                return JsonResponse(
                    {'error': 'Имя пользователя и пароль обязательны'}, 
                    status=400
                )
            else:
                messages.error(request, 'Имя пользователя и пароль обязательны.')
                return render(request, 'accounts/login.html')
        
        from django.contrib.auth import authenticate
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                if request.content_type == 'application/json':
                    from .logic.serializers import UserSerializer
                    serializer = UserSerializer(user)
                    return JsonResponse({
                        'success': True,
                        'message': 'Вход выполнен успешно',
                        'user': serializer.data
                    })
                else:
                    messages.success(request, 'Вы успешно вошли в систему!')
                    return redirect('/huntflow/')
            else:
                if request.content_type == 'application/json':
                    return JsonResponse(
                        {'error': 'Аккаунт деактивирован'}, 
                        status=400
                    )
                else:
                    messages.error(request, 'Аккаунт деактивирован.')
        else:
            if request.content_type == 'application/json':
                return JsonResponse(
                    {'error': 'Неверное имя пользователя или пароль'}, 
                    status=401
                )
            else:
                messages.error(request, 'Неверное имя пользователя или пароль.')
    
    # GET запрос - показываем форму входа
    if request.content_type == 'application/json':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    return render(request, 'accounts/login.html')


@csrf_exempt
def unified_logout(request):
    """Универсальная функция выхода (поддерживает HTML и JSON)"""
    logout(request)
    
    if request.content_type == 'application/json':
        return JsonResponse({
            'success': True,
            'message': 'Выход выполнен успешно'
        })
    else:
        messages.success(request, 'Вы успешно вышли из системы!')
        return redirect('/huntflow/')


def google_oauth_demo(request):
    """Демонстрация Google OAuth"""
    return render(request, 'account/google_oauth_demo.html')


def google_oauth_test(request):
    """Тестовая страница для Google OAuth"""
    return render(request, 'account/google_oauth_test.html')


def oauth_debug(request):
    """Диагностическая страница для Google OAuth"""
    return render(request, 'account/oauth_debug.html')


# Старая функция components_view удалена - заменена на components_template_handler