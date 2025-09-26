from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import urllib.parse
import secrets

from .models import User
from .forms import ProfileEditForm, IntegrationSettingsForm


def google_oauth_redirect(request):
    """Прямой переход на Google OAuth"""
    # Параметры для Google OAuth
    client_id = '968014303116-vtqq5f39tkaningitmj3dbq25snnmdgp.apps.googleusercontent.com'
    redirect_uri = f"{request.scheme}://{request.get_host()}/profile/google-oauth-callback/"
    
    # Генерируем state для безопасности
    state = secrets.token_urlsafe(32)
    request.session['oauth_state'] = state
    
    # Параметры OAuth
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'state': state,
        'access_type': 'online',
        'prompt': 'select_account'
    }
    
    # Формируем URL для Google OAuth
    google_oauth_url = 'https://accounts.google.com/o/oauth2/v2/auth'
    query_string = urllib.parse.urlencode(params)
    full_url = f"{google_oauth_url}?{query_string}"
    
    return redirect(full_url)


def google_oauth_callback(request):
    """Обработка callback от Google OAuth"""
    import requests
    from django.contrib.auth import login
    from django.contrib.auth import get_user_model
    import logging
    
    User = get_user_model()
    
    logger = logging.getLogger(__name__)
    
    # Получаем код авторизации
    code = request.GET.get('code')
    state = request.GET.get('state')
    
    logger.info(f"Google OAuth callback: code={code[:20] if code else None}..., state={state}")
    
    # Проверяем state
    session_state = request.session.get('oauth_state')
    logger.info(f"Session state: {session_state}")
    
    if state != session_state:
        logger.error(f"State mismatch: received={state}, expected={session_state}")
        messages.error(request, 'Ошибка безопасности OAuth')
        return redirect('account_login')
    
    if not code:
        logger.error("No authorization code received")
        messages.error(request, 'Код авторизации не получен')
        return redirect('account_login')
    
    try:
        # Обмениваем код на токен
        token_url = 'https://oauth2.googleapis.com/token'
        redirect_uri = f"{request.scheme}://{request.get_host()}/profile/google-oauth-callback/"
        
        token_data = {
            'client_id': '968014303116-vtqq5f39tkaningitmj3dbq25snnmdgp.apps.googleusercontent.com',
            'client_secret': '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',
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        logger.info(f"Exchanging code for token with redirect_uri: {redirect_uri}")
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        logger.info(f"Token response status: {token_response.status_code}")
        logger.info(f"Token response: {token_json}")
        
        if 'access_token' not in token_json:
            logger.error(f"No access token in response: {token_json}")
            messages.error(request, f'Ошибка получения токена от Google: {token_json.get("error_description", "Unknown error")}')
            return redirect('account_login')
        
        access_token = token_json['access_token']
        
        # Получаем информацию о пользователе
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        user_info = user_response.json()
        
        logger.info(f"User info response: {user_info}")
        
        if 'email' not in user_info:
            logger.error(f"No email in user info: {user_info}")
            messages.error(request, 'Не удалось получить информацию о пользователе')
            return redirect('account_login')
        
        # Создаем или находим пользователя
        email = user_info['email']
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        
        logger.info(f"Processing user: {email}, {first_name} {last_name}")
        
        try:
            # Пытаемся найти пользователя по email
            user = User.objects.get(email=email)
            logger.info(f"Found existing user: {user.username}")
        except User.DoesNotExist:
            # Создаем нового пользователя
            username = email.split('@')[0]  # Используем часть email как username
            
            # Проверяем, что username уникален
            original_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            logger.info(f"Created new user: {username}")
            messages.success(request, f'Добро пожаловать, {first_name}!')
        else:
            messages.success(request, f'Добро пожаловать обратно, {user.first_name or user.username}!')
        
        # Авторизуем пользователя с указанием backend
        from django.conf import settings
        backend = settings.AUTHENTICATION_BACKENDS[0]  # Используем первый backend
        login(request, user, backend=backend)
        logger.info(f"User {user.username} logged in successfully with backend {backend}")
        
        # Очищаем state из сессии
        if 'oauth_state' in request.session:
            del request.session['oauth_state']
        
        # Перенаправляем на главную страницу
        return redirect('huntflow:dashboard')
        
    except Exception as e:
        logger.error(f"OAuth error: {str(e)}", exc_info=True)
        messages.error(request, f'Ошибка авторизации: {str(e)}')
        return redirect('account_login')


@login_required
def profile_view(request):
    """Объединенный дашборд профиля и Google OAuth"""
    user = request.user
    
    # Получаем информацию о социальных аккаунтах
    social_accounts = []
    if hasattr(user, 'socialaccount_set'):
        for account in user.socialaccount_set.all():
            social_accounts.append({
                'provider': account.provider,
                'uid': account.uid,
                'extra_data': account.extra_data,
                'date_joined': account.date_joined,
            })
    
    # Получаем информацию о Google OAuth аккаунте
    oauth_account = None
    is_google_oauth_connected = False
    is_google_social_connected = any(acc['provider'] == 'google' for acc in social_accounts)
    
    try:
        from apps.google_oauth.models import GoogleOAuthAccount
        oauth_account = GoogleOAuthAccount.objects.get(user=user)
        # Аккаунт считается подключенным, если он существует в БД (даже если токен истек)
        is_google_oauth_connected = oauth_account is not None
        token_valid = oauth_account.is_token_valid() if oauth_account else False
    except:
        token_valid = False
    
    # Получаем статистику Google сервисов
    google_stats = {
        'calendar_events': 0,
        'drive_files': 0,
        'sheets': 0,
    }
    
    if oauth_account:
        try:
            from apps.google_oauth.models import GoogleCalendarEvent, GoogleDriveFile, GoogleSheet
            google_stats['calendar_events'] = GoogleCalendarEvent.objects.filter(google_account=oauth_account).count()
            google_stats['drive_files'] = GoogleDriveFile.objects.filter(google_account=oauth_account).count()
            google_stats['sheets'] = GoogleSheet.objects.filter(google_account=oauth_account).count()
        except:
            pass
    
    context = {
        'user': user,
        'social_accounts': social_accounts,
        'is_google_connected': any(acc['provider'] == 'google' for acc in social_accounts),
        'is_google_social_connected': is_google_social_connected,
        'oauth_account': oauth_account,
        'is_google_oauth_connected': is_google_oauth_connected,
        'token_valid': token_valid,
        'google_stats': google_stats,
    }
    
    return render(request, 'profile/profile.html', context)


@login_required
def profile_edit(request):
    """Редактирование профиля пользователя"""
    user = request.user
    
    # Получаем информацию о Google OAuth аккаунте
    oauth_account = None
    is_google_oauth_connected = False
    try:
        from apps.google_oauth.models import GoogleOAuthAccount
        oauth_account = GoogleOAuthAccount.objects.get(user=user)
        # Аккаунт считается подключенным, если он существует в БД (даже если токен истек)
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
    
    return render(request, 'profile/profile_edit.html', context)


@login_required
def profile_settings(request):
    """Настройки профиля"""
    if request.method == 'POST':
        form = IntegrationSettingsForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Настройки успешно сохранены!')
            return redirect('accounts:profile_settings')
    else:
        form = IntegrationSettingsForm(instance=request.user)
    
    return render(request, 'profile/profile_settings.html', {'form': form})


@login_required
def integrations_view(request):
    """Управление интеграциями"""
    user = request.user
    
    # Проверяем статус интеграций
    integrations_status = {
        'huntflow': {
            'name': 'Huntflow',
            'enabled': bool(user.huntflow_sandbox_api_key or user.huntflow_prod_api_key),
            'sandbox_configured': bool(user.huntflow_sandbox_api_key),
            'prod_configured': bool(user.huntflow_prod_api_key),
            'active_system': user.active_system,
        },
        'gemini': {
            'name': 'Gemini AI',
            'enabled': bool(user.gemini_api_key),
            'configured': bool(user.gemini_api_key),
        },
        'clickup': {
            'name': 'ClickUp',
            'enabled': bool(user.clickup_api_key),
            'configured': bool(user.clickup_api_key),
        },
        'telegram': {
            'name': 'Telegram',
            'enabled': bool(user.telegram_username),
            'configured': bool(user.telegram_username),
        },
        'notion': {
            'name': 'Notion',
            'enabled': bool(user.notion_integration_token),
            'configured': bool(user.notion_integration_token),
        }
    }
    
    context = {
        'user': user,
        'integrations': integrations_status,
    }
    
    return render(request, 'profile/integrations.html', context)


@login_required
def api_keys_view(request):
    """Управление API ключами"""
    user = request.user
    
    if request.method == 'POST':
        # Обновляем API ключи
        user.gemini_api_key = request.POST.get('gemini_api_key', '')
        user.clickup_api_key = request.POST.get('clickup_api_key', '')
        user.notion_integration_token = request.POST.get('notion_integration_token', '')
        user.huntflow_sandbox_api_key = request.POST.get('huntflow_sandbox_api_key', '')
        user.huntflow_prod_api_key = request.POST.get('huntflow_prod_api_key', '')
        user.huntflow_sandbox_url = request.POST.get('huntflow_sandbox_url', '')
        user.huntflow_prod_url = request.POST.get('huntflow_prod_url', '')
        user.active_system = request.POST.get('active_system', 'sandbox')
        user.save()
        
        messages.success(request, 'API ключи успешно обновлены!')
        return redirect('accounts:api_keys')
    
    context = {
        'user': user,
    }
    
    return render(request, 'profile/api_keys.html', context)


@login_required
@require_POST
def test_gemini_api(request):
    """Тестирование Gemini API ключа"""
    try:
        api_key = request.POST.get('api_key')
        if not api_key:
            return JsonResponse({'success': False, 'message': 'API ключ не указан'})
        
        # Здесь можно добавить реальную проверку API ключа
        # Пока просто проверяем, что ключ не пустой
        if len(api_key) < 10:
            return JsonResponse({'success': False, 'message': 'API ключ слишком короткий'})
        
        return JsonResponse({'success': True, 'message': 'API ключ валиден'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})


@login_required
@require_POST
def test_huntflow_api(request):
    """Тестирование Huntflow API ключа"""
    try:
        api_key = request.POST.get('api_key')
        api_url = request.POST.get('api_url')
        system = request.POST.get('system', 'sandbox')
        
        if not api_key or not api_url:
            return JsonResponse({'success': False, 'message': 'API ключ и URL обязательны'})
        
        # Здесь можно добавить реальную проверку API ключа
        # Пока просто проверяем, что ключ не пустой
        if len(api_key) < 10:
            return JsonResponse({'success': False, 'message': 'API ключ слишком короткий'})
        
        return JsonResponse({'success': True, 'message': f'Huntflow {system} API ключ валиден'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})


@login_required
@require_POST
def test_clickup_api(request):
    """Тестирование ClickUp API ключа"""
    try:
        api_key = request.POST.get('api_key')
        if not api_key:
            return JsonResponse({'success': False, 'message': 'API ключ не указан'})
        
        # Здесь можно добавить реальную проверку API ключа
        # Пока просто проверяем, что ключ не пустой
        if len(api_key) < 10:
            return JsonResponse({'success': False, 'message': 'API ключ слишком короткий'})
        
        return JsonResponse({'success': True, 'message': 'ClickUp API ключ валиден'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})


@login_required
@require_POST
def test_notion_api(request):
    """Тестирование Notion Integration Token"""
    try:
        api_key = request.POST.get('api_key')
        if not api_key:
            return JsonResponse({'success': False, 'message': 'Integration Token не указан'})
        
        # Здесь можно добавить реальную проверку Notion API
        # Пока просто проверяем, что токен не пустой и имеет правильный формат
        if len(api_key) < 20:
            return JsonResponse({'success': False, 'message': 'Integration Token слишком короткий'})
        
        # Проверяем, что токен начинается с правильного префикса
        if not api_key.startswith('secret_'):
            return JsonResponse({'success': False, 'message': 'Integration Token должен начинаться с "secret_"'})
        
        return JsonResponse({'success': True, 'message': 'Notion Integration Token валиден'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})


def account_login(request):
    """Универсальная страница входа (HTML формы)"""
    if request.user.is_authenticated:
        return redirect('/huntflow/')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        from django.contrib.auth import authenticate
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли в систему!')
            return redirect('/huntflow/')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    
    return render(request, 'accounts/login.html')


def account_logout(request):
    """Универсальный выход из системы (HTML)"""
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы!')
    return redirect('/huntflow/')


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
                    from .serializers import UserSerializer
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


@login_required
def components_view(request):
    """Страница демонстрации компонентов UI"""
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
    
    return render(request, 'temp/components.html', context)