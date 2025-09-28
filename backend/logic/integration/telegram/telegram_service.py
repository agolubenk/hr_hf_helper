"""Основной сервис для работы с Telegram"""
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

from logic.utilities.context_helpers import ContextHelper
from logic.base.response_handler import UnifiedResponseHandler
from apps.telegram.models import TelegramUser, AuthAttempt
from apps.telegram.demo_telegram_client import run_telegram_auth_sync

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
                # Пользователь уже авторизован в базе данных
                is_authorized = True
                user_info = {
                    'id': telegram_user.telegram_id,
                    'username': telegram_user.username,
                    'first_name': telegram_user.first_name,
                    'last_name': telegram_user.last_name,
                    'phone': telegram_user.phone,
                }
            
            context = ContextHelper.get_base_context(
                request,
                'Авторизация Telegram',
                {
                    'telegram_user': telegram_user,
                    'is_authorized': is_authorized,
                    'user_info': user_info,
                    'created': created
                }
            )
            
            return render(request, 'telegram/auth.html', context)
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке страницы авторизации Telegram: {e}")
            messages.error(request, f'Ошибка при загрузке страницы: {str(e)}')
            
            context = ContextHelper.get_base_context(
                request,
                'Авторизация Telegram',
                {
                    'error': str(e)
                }
            )
            
            return render(request, 'telegram/auth.html', context)


@login_required
def telegram_dashboard(request):
    """Главная страница интеграции с Telegram"""
    user = request.user
    
    try:
        # Получаем данные пользователя Telegram
        telegram_user = TelegramUser.objects.filter(user=user).first()
        
        context = ContextHelper.get_base_context(
            request,
            'Интеграция с Telegram',
            {
                'telegram_user': telegram_user,
                'is_configured': telegram_user is not None and telegram_user.is_authorized
            }
        )
        
        return render(request, 'telegram/dashboard.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка при загрузке dashboard Telegram: {e}")
        messages.error(request, f'Ошибка при загрузке dashboard: {str(e)}')
        
        context = ContextHelper.get_base_context(
            request,
            'Интеграция с Telegram',
            {
                'error': str(e)
            }
        )
        
        return render(request, 'telegram/dashboard.html', context)


@csrf_exempt
@login_required
def telegram_auth_sync(request):
    """Синхронизация авторизации Telegram"""
    try:
        if request.method != 'POST':
            return JsonResponse({'error': 'Только POST запросы'}, status=405)
        
        user = request.user
        
        # Получаем или создаем TelegramUser
        telegram_user, created = TelegramUser.objects.get_or_create(
            user=user,
            defaults={'session_name': f"user_{user.id}"}
        )
        
        # Запускаем синхронизацию авторизации
        auth_result = run_telegram_auth_sync(telegram_user)
        
        if auth_result.get('success'):
            return JsonResponse({
                'success': True,
                'message': 'Авторизация Telegram успешно синхронизирована',
                'user_info': auth_result.get('user_info', {})
            })
        else:
            return JsonResponse({
                'success': False,
                'message': auth_result.get('message', 'Ошибка синхронизации авторизации'),
                'error_code': auth_result.get('error_code')
            })
            
    except Exception as e:
        logger.error(f"Ошибка синхронизации авторизации Telegram: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка синхронизации: {str(e)}'
        })


@login_required
def telegram_logout(request):
    """Выход из Telegram"""
    try:
        user = request.user
        
        # Получаем TelegramUser
        telegram_user = TelegramUser.objects.filter(user=user).first()
        
        if telegram_user:
            # Сбрасываем данные авторизации
            telegram_user.telegram_id = None
            telegram_user.username = None
            telegram_user.first_name = None
            telegram_user.last_name = None
            telegram_user.phone = None
            telegram_user.is_authorized = False
            telegram_user.save()
            
            messages.success(request, 'Вы успешно вышли из Telegram')
        else:
            messages.warning(request, 'Вы не авторизованы в Telegram')
        
        return redirect('telegram:auth')
        
    except Exception as e:
        logger.error(f"Ошибка выхода из Telegram: {e}")
        messages.error(request, f'Ошибка при выходе: {str(e)}')
        return redirect('telegram:auth')


@login_required
def telegram_settings(request):
    """Настройки интеграции с Telegram"""
    user = request.user
    
    try:
        # Получаем данные пользователя Telegram
        telegram_user = TelegramUser.objects.filter(user=user).first()
        
        if request.method == 'POST':
            # Обновляем настройки
            session_name = request.POST.get('session_name', f"user_{user.id}")
            
            if telegram_user:
                telegram_user.session_name = session_name
                telegram_user.save()
                messages.success(request, 'Настройки Telegram успешно обновлены')
            else:
                # Создаем нового пользователя Telegram
                telegram_user = TelegramUser.objects.create(
                    user=user,
                    session_name=session_name
                )
                messages.success(request, 'Настройки Telegram успешно созданы')
            
            return redirect('telegram:settings')
        
        context = ContextHelper.get_base_context(
            request,
            'Настройки Telegram',
            {
                'telegram_user': telegram_user
            }
        )
        
        return render(request, 'telegram/settings.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка при загрузке настроек Telegram: {e}")
        messages.error(request, f'Ошибка при загрузке настроек: {str(e)}')
        
        context = ContextHelper.get_base_context(
            request,
            'Настройки Telegram',
            {
                'error': str(e)
            }
        )
        
        return render(request, 'telegram/settings.html', context)


@login_required
def telegram_auth_attempts(request):
    """История попыток авторизации Telegram"""
    user = request.user
    
    try:
        # Получаем попытки авторизации пользователя
        auth_attempts = AuthAttempt.objects.filter(user=user).order_by('-created_at')
        
        context = ContextHelper.get_base_context(
            request,
            'История авторизации Telegram',
            {
                'auth_attempts': auth_attempts
            }
        )
        
        return render(request, 'telegram/auth_attempts.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка при загрузке истории авторизации Telegram: {e}")
        messages.error(request, f'Ошибка при загрузке истории: {str(e)}')
        
        context = ContextHelper.get_base_context(
            request,
            'История авторизации Telegram',
            {
                'error': str(e)
            }
        )
        
        return render(request, 'telegram/auth_attempts.html', context)


@csrf_exempt
def telegram_webhook(request):
    """Webhook для получения обновлений от Telegram"""
    try:
        if request.method != 'POST':
            return JsonResponse({'error': 'Только POST запросы'}, status=405)
        
        # Получаем данные из webhook
        webhook_data = json.loads(request.body)
        
        # Здесь должна быть логика обработки webhook
        # Пока просто логируем полученные данные
        logger.info(f"Получен webhook от Telegram: {webhook_data}")
        
        return JsonResponse({'success': True, 'message': 'Webhook обработан'})
        
    except Exception as e:
        logger.error(f"Ошибка обработки webhook Telegram: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка обработки webhook: {str(e)}'
        })


@login_required
def telegram_test_connection(request):
    """Тестирование подключения к Telegram"""
    try:
        user = request.user
        
        # Получаем TelegramUser
        telegram_user = TelegramUser.objects.filter(user=user).first()
        
        if not telegram_user or not telegram_user.is_authorized:
            return JsonResponse({
                'success': False,
                'message': 'Пользователь не авторизован в Telegram'
            })
        
        # Здесь должна быть логика тестирования подключения
        # Пока возвращаем заглушку
        return JsonResponse({
            'success': True,
            'message': 'Подключение к Telegram успешно',
            'user_info': {
                'id': telegram_user.telegram_id,
                'username': telegram_user.username,
                'first_name': telegram_user.first_name,
                'last_name': telegram_user.last_name
            }
        })
        
    except Exception as e:
        logger.error(f"Ошибка тестирования подключения Telegram: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка тестирования подключения: {str(e)}'
        })
