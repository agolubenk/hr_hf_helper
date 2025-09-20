import json
import base64
import logging
from typing import Dict, Any

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views import View
from django.core.exceptions import ValidationError

from .models import TelegramUser, AuthAttempt
from .telegram_client import run_telegram_auth_sync

logger = logging.getLogger('apps.telegram')
User = get_user_model()


class TelegramAuthView(View):
    """Основное представление для авторизации Telegram"""
    
    @method_decorator(login_required)
    def get(self, request):
        """Отображение страницы авторизации"""
        try:
            # Получаем или создаем TelegramUser
            telegram_user, created = TelegramUser.objects.get_or_create(
                user=request.user,
                defaults={'session_name': f"user_{request.user.id}"}
            )
            
            # Проверяем авторизацию
            is_authorized = False
            user_info = None
            
            if telegram_user.is_authorized:
                # Проверяем актуальную авторизацию
                result = run_telegram_auth_sync(telegram_user.id, "check_auth")
                if isinstance(result, bool):
                    is_authorized = result
                    if is_authorized:
                        user_info = run_telegram_auth_sync(telegram_user.id, "get_me")
            
            context = {
                'telegram_user': telegram_user,
                'is_authorized': is_authorized,
                'user_info': user_info,
                'auth_attempts': telegram_user.auth_attempts.all()[:10]  # Последние 10 попыток
            }
            
            return render(request, 'telegram/auth.html', context)
            
        except Exception as e:
            logger.error(f"Ошибка в TelegramAuthView.get: {e}")
            messages.error(request, f"Ошибка загрузки страницы: {e}")
            return render(request, 'telegram/auth.html', {'error': str(e)})


class GenerateQRView(View):
    """Генерация QR-кода для авторизации"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Генерация QR-кода"""
        try:
            # Получаем TelegramUser
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            logger.info(f"Запрос генерации QR для пользователя {request.user.username}")
            
            # Генерируем QR-код
            qr_data, qr_url, status = run_telegram_auth_sync(telegram_user.id, "generate_qr")
            
            if status == "success":
                # Кодируем изображение в base64
                qr_base64 = base64.b64encode(qr_data).decode()
                
                return JsonResponse({
                    'success': True,
                    'qr_image': f"data:image/png;base64,{qr_base64}",
                    'qr_url': qr_url,
                    'session_name': telegram_user.session_name
                })
                
            elif status == "already_authorized":
                return JsonResponse({
                    'success': False,
                    'error': 'Пользователь уже авторизован',
                    'redirect': True
                })
                
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Ошибка генерации QR-кода: {status}'
                })
                
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка генерации QR: {e}")
            return JsonResponse({
                'success': False,
                'error': f'Внутренняя ошибка: {str(e)}'
            })


class CheckAuthStatusView(View):
    """Проверка статуса авторизации"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Проверка статуса авторизации"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            # ИСПРАВЛЕНИЕ: Уменьшаем таймаут до 3 секунд для быстрой проверки
            status, user_data, error_message = run_telegram_auth_sync(
                telegram_user.id, 
                "wait_auth", 
                timeout=3  # ИЗМЕНЕНО С 30 НА 3!
            )
            
            # Дополнительно проверяем состояние в базе данных
            telegram_user.refresh_from_db()
            
            if status == "success":
                # Обновляем статус в базе данных если еще не обновлен
                if not telegram_user.is_authorized and user_data:
                    telegram_user.is_authorized = True
                    telegram_user.telegram_id = user_data.get('id')
                    telegram_user.username = user_data.get('username')
                    telegram_user.first_name = user_data.get('first_name')
                    telegram_user.last_name = user_data.get('last_name')
                    telegram_user.phone = user_data.get('phone')
                    telegram_user.save()
                
                return JsonResponse({
                    'status': 'success',
                    'user': user_data
                })
                
            elif status == "2fa_required":
                return JsonResponse({
                    'status': '2fa_required',
                    'message': 'Требуется двухфакторная аутентификация'
                })
                
            elif status == "timeout" or status == "waiting":
                # Проверяем, может быть пользователь уже авторизован в базе
                if telegram_user.is_authorized:
                    user_info = run_telegram_auth_sync(telegram_user.id, "get_me")
                    if user_info:
                        return JsonResponse({
                            'status': 'success',
                            'user': user_info
                        })
                
                return JsonResponse({
                    'status': 'waiting',
                    'message': 'Ожидание сканирования QR-кода'
                })
                
            else:
                return JsonResponse({
                    'status': 'error',
                    'error': error_message or 'Неизвестная ошибка'
                })
                
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка проверки статуса: {e}")
            return JsonResponse({
                'status': 'error',
                'error': str(e)
            })


class Handle2FAView(View):
    """Обработка двухфакторной аутентификации"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Обработка 2FA пароля"""
        try:
            data = json.loads(request.body)
            password = data.get('password', '').strip()
            
            if not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Пароль обязателен'
                })
            
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            logger.info(f"Обработка 2FA для пользователя {request.user.username}")
            
            # Обрабатываем 2FA
            status, user_data, error_message = run_telegram_auth_sync(
                telegram_user.id, 
                "handle_2fa", 
                password=password
            )
            
            if status == "success":
                return JsonResponse({
                    'success': True,
                    'user': user_data
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': error_message or 'Ошибка 2FA'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Неверный формат JSON'
            })
            
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка 2FA: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })


class RecreateQRView(View):
    """Пересоздание QR-кода"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Пересоздание QR-кода"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            logger.info(f"Пересоздание QR для пользователя {request.user.username}")
            
            # Пересоздаем QR-код
            qr_data, qr_url, status = run_telegram_auth_sync(telegram_user.id, "recreate_qr")
            
            if status == "success":
                qr_base64 = base64.b64encode(qr_data).decode()
                
                return JsonResponse({
                    'success': True,
                    'qr_image': f"data:image/png;base64,{qr_base64}",
                    'qr_url': qr_url
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Ошибка пересоздания QR: {status}'
                })
                
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка пересоздания QR: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })


class TelegramDashboardView(View):
    """Панель управления для авторизованных пользователей"""
    
    @method_decorator(login_required)
    def get(self, request):
        """Отображение панели управления"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            if not telegram_user.is_authorized:
                return redirect('telegram:auth')
            
            # Получаем актуальную информацию о пользователе
            user_info = run_telegram_auth_sync(telegram_user.id, "get_me")
            
            context = {
                'telegram_user': telegram_user,
                'user_info': user_info,
                'recent_attempts': telegram_user.auth_attempts.all()[:10]
            }
            
            return render(request, 'telegram/dashboard.html', context)
            
        except TelegramUser.DoesNotExist:
            messages.error(request, 'Telegram аккаунт не найден')
            return redirect('telegram:auth')
            
        except Exception as e:
            logger.error(f"Ошибка в TelegramDashboardView: {e}")
            messages.error(request, f"Ошибка загрузки панели: {e}")
            return redirect('telegram:auth')


# Дополнительные API views для AJAX запросов
@csrf_exempt
@login_required
def get_auth_attempts(request):
    """Получение попыток авторизации"""
    if request.method == 'GET':
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            attempts = AuthAttempt.objects.filter(telegram_user=telegram_user)[:20]
            
            attempts_data = [{
                'id': attempt.id,
                'attempt_type': attempt.get_attempt_type_display(),
                'status': attempt.get_status_display(),
                'error_message': attempt.error_message,
                'created_at': attempt.created_at.isoformat()
            } for attempt in attempts]
            
            return JsonResponse({
                'success': True,
                'attempts': attempts_data
            })
            
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка получения попыток: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Метод не поддерживается'})


@csrf_exempt
@login_required  
def reset_telegram_auth(request):
    """Сброс авторизации Telegram"""
    if request.method == 'POST':
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            # Сбрасываем данные авторизации
            telegram_user.telegram_id = None
            telegram_user.username = None
            telegram_user.first_name = None
            telegram_user.last_name = None
            telegram_user.phone = None
            telegram_user.is_authorized = False
            telegram_user.auth_date = None
            telegram_user.save()
            
            logger.info(f"Сброс авторизации для пользователя {request.user.username}")
            
            return JsonResponse({
                'success': True,
                'message': 'Авторизация сброшена'
            })
            
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка сброса авторизации: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Метод не поддерживается'})


class TelegramDashboardView(View):
    """Дашборд Telegram"""
    
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get(self, request):
        """Отображение дашборда"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            context = {
                'telegram_user': telegram_user,
                'user_info': {
                    'id': telegram_user.telegram_id,
                    'username': telegram_user.username,
                    'first_name': telegram_user.first_name,
                    'last_name': telegram_user.last_name,
                    'phone': telegram_user.phone,
                } if telegram_user.is_authorized else None
            }
            
            return render(request, 'telegram/dashboard.html', context)
            
        except TelegramUser.DoesNotExist:
            return redirect('telegram:auth')


class ChatsListView(View):
    """Получение списка чатов"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get(self, request):
        """Получение списка чатов"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            if not telegram_user.is_authorized:
                return JsonResponse({
                    'success': False,
                    'error': 'Telegram не авторизован'
                })
            
            # Получаем чаты через Telegram API
            status, chats_data, error_message = run_telegram_auth_sync(
                telegram_user.id, 
                "get_chats"
            )
            
            if status == "success":
                return JsonResponse({
                    'success': True,
                    'chats': chats_data
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': error_message or 'Ошибка получения чатов'
                })
                
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка получения чатов: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })


class MessagesListView(View):
    """Получение сообщений чата"""
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get(self, request, chat_id):
        """Получение сообщений чата"""
        try:
            telegram_user = TelegramUser.objects.get(user=request.user)
            
            if not telegram_user.is_authorized:
                return JsonResponse({
                    'success': False,
                    'error': 'Telegram не авторизован'
                })
            
            # Получаем сообщения через Telegram API
            status, messages_data, error_message = run_telegram_auth_sync(
                telegram_user.id, 
                "get_messages",
                chat_id=chat_id
            )
            
            if status == "success":
                return JsonResponse({
                    'success': True,
                    'messages': messages_data.get('messages', []),
                    'chat_title': messages_data.get('chat_title', 'Неизвестный чат')
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': error_message or 'Ошибка получения сообщений'
                })
                
        except TelegramUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Telegram пользователь не найден'
            })
            
        except Exception as e:
            logger.error(f"Ошибка получения сообщений: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            })