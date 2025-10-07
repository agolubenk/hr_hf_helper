"""
Views для работы с Telegram API
"""
import json
import asyncio
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from asgiref.sync import sync_to_async
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from .telegram_client import (
    get_client, get_session_status, reset_session,
    check_auth_status, get_user_info, send_code_request,
    sign_in_with_code, generate_qr_code, wait_for_qr_login,
    get_dialogs, get_messages
)


def run_async_task(coro):
    """
    Безопасно запускает асинхронную задачу в Django view
    """
    try:
        # Пытаемся получить существующий event loop
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Если цикл уже запущен, создаем новый в отдельном потоке
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result()
        else:
            # Если цикл не запущен, запускаем его
            return loop.run_until_complete(coro)
    except RuntimeError:
        # Если нет активного цикла, создаем новый
        return asyncio.run(coro)
    except Exception as e:
        # Если все остальное не работает, пробуем asyncio.run
        try:
            return asyncio.run(coro)
        except Exception as e2:
            # Если и это не работает, возвращаем ошибку
            raise Exception(f"Ошибка выполнения асинхронной задачи: {e2}")


class TelegramIndexView(View):
    """
    Главная страница Telegram приложения
    """
    
    def get(self, request):
        view = request.GET.get('view', 'login')
        template = 'telegram/main.html' if view == 'main' else 'telegram/login.html'
        return render(request, template)


class SessionStatusView(View):
    """
    Проверка статуса сессии
    """
    
    def get(self, request):
        # Проверяем, авторизован ли пользователь в Django
        if not request.user.is_authenticated:
            return JsonResponse({
                'active': False, 
                'error': 'Not authenticated in Django',
                'requires_django_auth': True
            }, status=401)
        
        try:
            client = get_client(request.user)
            active = run_async_task(check_auth_status(client))
            return JsonResponse({'active': active})
        except Exception as e:
            return JsonResponse({'active': False, 'error': str(e)})


@method_decorator(csrf_exempt, name='dispatch')
class AuthPhoneView(View):
    """
    Отправка кода авторизации на телефон
    """
    
    def post(self, request):
        # Проверяем, авторизован ли пользователь в Django
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Not authenticated in Django',
                'requires_django_auth': True
            }, status=401)
        
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            
            if not phone:
                return JsonResponse({'error': 'Номер телефона не указан'}, status=400)
            
            client = get_client(request.user)
            success = run_async_task(send_code_request(client, phone))
            
            if success:
                return JsonResponse({'sent': True})
            else:
                return JsonResponse({'error': 'Не удалось отправить код'}, status=500)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AuthVerifyView(View):
    """
    Проверка кода авторизации
    """
    
    def post(self, request):
        # Проверяем, авторизован ли пользователь в Django
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Not authenticated in Django',
                'requires_django_auth': True
            }, status=401)
        
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            code = data.get('code')
            password = data.get('password')
            
            if not phone or not code:
                return JsonResponse({'error': 'Номер телефона и код обязательны'}, status=400)
            
            client = get_client(request.user)
            success = run_async_task(
                sign_in_with_code(client, phone, code, password)
            )
            
            if success:
                return JsonResponse({'authorized': True})
            else:
                return JsonResponse({'error': 'Неверный код или пароль'}, status=400)
                
        except SessionPasswordNeededError:
            return JsonResponse({'error': 'Требуется пароль 2FA'}, status=400)
        except PhoneCodeInvalidError:
            return JsonResponse({'error': 'Неверный код'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class QRStartView(View):
    """
    Генерация QR кода для авторизации
    """
    
    def get(self, request):
        # Проверяем, авторизован ли пользователь в Django
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Not authenticated in Django',
                'requires_django_auth': True
            }, status=401)
        
        try:
            client = get_client(request.user)
            qr_url = run_async_task(generate_qr_code(client))
            
            if qr_url:
                return JsonResponse({'url': qr_url})
            else:
                return JsonResponse({'error': 'Не удалось сгенерировать QR код'}, status=500)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class QRStatusView(View):
    """
    Проверка статуса QR авторизации
    """
    
    def get(self, request):
        # Проверяем, авторизован ли пользователь в Django
        if not request.user.is_authenticated:
            return JsonResponse({
                'authorized': False,
                'error': 'Not authenticated in Django',
                'requires_django_auth': True
            }, status=401)
        
        try:
            client = get_client(request.user)
            authorized = run_async_task(wait_for_qr_login(client, timeout=0))
            
            return JsonResponse({'authorized': authorized})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class ChatsListView(View):
    """
    Получение списка чатов
    """
    
    def get(self, request):
        try:
            client = get_client(request.user)
            
            # Проверяем авторизацию
            if not run_async_task(check_auth_status(client)):
                return JsonResponse({'error': 'Пользователь не авторизован'}, status=401)
            
            # Получаем список чатов
            limit = int(request.GET.get('limit', 50))
            dialogs = run_async_task(get_dialogs(client, limit))
            
            return JsonResponse(dialogs, safe=False)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class MessagesListView(View):
    """
    Получение сообщений из чата
    """
    
    def get(self, request, chat_id):
        try:
            client = get_client(request.user)
            
            # Проверяем авторизацию
            if not run_async_task(check_auth_status(client)):
                return JsonResponse({'error': 'Пользователь не авторизован'}, status=401)
            
            # Получаем сообщения
            limit = int(request.GET.get('limit', 50))
            messages = run_async_task(get_messages(client, chat_id, limit))
            
            return JsonResponse(messages, safe=False)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class UserInfoView(View):
    """
    Получение информации о пользователе
    """
    
    def get(self, request):
        try:
            client = get_client(request.user)
            
            # Проверяем авторизацию
            if not run_async_task(check_auth_status(client)):
                return JsonResponse({'error': 'Пользователь не авторизован'}, status=401)
            
            # Получаем информацию о пользователе
            user_info = run_async_task(get_user_info(client))
            
            if user_info:
                return JsonResponse(user_info)
            else:
                return JsonResponse({'error': 'Не удалось получить информацию о пользователе'}, status=500)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class ResetSessionView(View):
    """
    Сброс сессии пользователя
    """
    
    def post(self, request):
        try:
            reset_session(request.user)
            return JsonResponse({'success': True, 'message': 'Сессия сброшена'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class SessionInfoView(View):
    """
    Получение информации о сессии
    """
    
    def get(self, request):
        try:
            status = get_session_status(request.user)
            return JsonResponse(status)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)