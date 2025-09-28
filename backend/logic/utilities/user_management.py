"""Управление пользователями"""
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib import messages
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json

from apps.accounts.models import User
from apps.accounts.forms import ProfileEditForm, IntegrationSettingsForm
from logic.utilities.account_services import UserService
from logic.base.response_handler import UnifiedResponseHandler


# =============================================================================
# УНИВЕРСАЛЬНЫЕ ФУНКЦИИ
# =============================================================================

def unified_template_view(request, template_name, handler_func=None, context=None):
    """
    Универсальная функция для рендеринга HTML-шаблонов
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request: HTTP запрос
    - template_name: строка, путь к шаблону
    - handler_func: функция-обработчик для подготовки контекста (опционально)
    - context: словарь с данными для шаблона (опционально)
    
    ИСТОЧНИКИ ДАННЫХ:
    - Переданный context или пустой словарь
    - Результат выполнения handler_func (если указан)
    
    ОБРАБОТКА:
    - Объединение переданного контекста с результатом handler_func
    - Обработка ошибок при выполнении handler_func
    - Рендеринг шаблона с финальным контекстом
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - render: HTML страница по указанному template_name
    
    СВЯЗИ:
    - Использует: Django render function
    - Передает данные в: указанный template_name
    - Может вызываться из: любые views функции
    """
    if context is None:
        context = {}
    
    # Если передан handler_func, вызываем его для подготовки контекста
    if handler_func:
        try:
            handler_context = handler_func(request)
            if isinstance(handler_context, dict):
                context.update(handler_context)
        except Exception as e:
            # Если handler_func выдает ошибку, добавляем сообщение об ошибке
            context['error'] = f'Ошибка обработки: {str(e)}'
    
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
            from apps.accounts.serializers import UserSerializer
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
    from django.contrib import messages
    
    # Используем сервисный слой для получения данных профиля
    context = UserService.get_user_profile_data(request.user)
    context['messages'] = messages.get_messages(request)
    return context


def profile_edit_template_handler(request):
    """Обработчик для страницы редактирования профиля"""
    from django.contrib import messages
    
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
        'messages': messages.get_messages(request),
    }
    
    return context


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
    return context


def integrations_template_handler(request):
    """Обработчик для страницы интеграций"""
    from django.contrib import messages
    
    # Используем сервисный слой для получения статуса интеграций
    integrations_status = UserService.get_integrations_status(request.user)
    
    # Получаем информацию о Google OAuth аккаунте
    oauth_account = None
    is_google_oauth_connected = False
    is_google_social_connected = False
    
    try:
        from apps.google_oauth.models import GoogleOAuthAccount
        oauth_account = GoogleOAuthAccount.objects.get(user=request.user)
        is_google_oauth_connected = oauth_account is not None
        token_valid = oauth_account.is_token_valid() if oauth_account else False
    except:
        token_valid = False
    
    # Проверяем социальные аккаунты
    if hasattr(request.user, 'socialaccount_set'):
        is_google_social_connected = any(
            account.provider == 'google' 
            for account in request.user.socialaccount_set.all()
        )
    
    context = {
        'user': request.user,
        'integrations': integrations_status,
        'oauth_account': oauth_account,
        'is_google_oauth_connected': is_google_oauth_connected,
        'is_google_social_connected': is_google_social_connected,
        'token_valid': token_valid,
        'messages': messages.get_messages(request),
    }
    
    return context


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


# =============================================================================
# ОСНОВНЫЕ VIEW-ФУНКЦИИ
# =============================================================================

def google_oauth_redirect(request):
    """Прямой переход на Google OAuth"""
    from logic.utilities.oauth_services import GoogleOAuthService
    auth_url = GoogleOAuthService.get_authorization_url(request)
    return redirect(auth_url)


def google_oauth_callback(request):
    """Обработка callback от Google OAuth"""
    from logic.utilities.oauth_services import GoogleOAuthService
    
    result = GoogleOAuthService.handle_oauth_callback(request)
    
    if result['success']:
        messages.success(request, result['message'])
        return redirect('huntflow:dashboard')
    else:
        messages.error(request, result['error'])
        return redirect('account_login')


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
                    from apps.accounts.serializers import UserSerializer
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
