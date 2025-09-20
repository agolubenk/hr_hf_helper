from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.core.exceptions import ValidationError
import json
import logging

from .models import ChatSession, ChatMessage
from .services import GeminiService

logger = logging.getLogger(__name__)


@login_required
def gemini_dashboard(request):
    """
    Главная страница Gemini AI
    """
    try:
        # Получаем API ключ пользователя
        has_api_key = bool(request.user.gemini_api_key)
        
        # Получаем активные сессии чата
        chat_sessions = ChatSession.objects.filter(
            user=request.user, 
            is_active=True
        ).order_by('-updated_at')[:10]
        
        context = {
            'has_api_key': has_api_key,
            'chat_sessions': chat_sessions,
            'api_key_configured': has_api_key,
        }
        
        return render(request, 'gemini/dashboard.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка в gemini_dashboard: {str(e)}")
        messages.error(request, f'Ошибка при загрузке страницы: {str(e)}')
        return render(request, 'gemini/dashboard.html', {'has_api_key': False})


@login_required
def chat_session(request, session_id=None):
    """
    Страница чата с Gemini
    """
    try:
        logger.info(f"chat_session вызван с session_id: {session_id}")
        
        # Получаем API ключ пользователя
        if not request.user.gemini_api_key:
            logger.warning(f"API ключ не настроен для пользователя {request.user.username}")
            messages.warning(request, 'Сначала настройте API ключ Gemini')
            return redirect('gemini:settings')
        
        # Получаем или создаем сессию чата
        if session_id:
            logger.info(f"Ищем сессию с ID: {session_id} для пользователя {request.user.username}")
            chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
            logger.info(f"Найдена сессия: {chat_session.title}")
        else:
            # Создаем новую сессию
            logger.info("Создаем новую сессию чата")
            chat_session = ChatSession.objects.create(
                user=request.user,
                title=f"Чат {timezone.now().strftime('%d.%m.%Y %H:%M')}"
            )
            logger.info(f"Создана новая сессия с ID: {chat_session.id}")
            # Временно убираем редирект для отладки
            # return redirect('gemini:chat_session', session_id=chat_session.id)
        
        # Получаем сообщения сессии
        messages_list = ChatMessage.objects.filter(session=chat_session).order_by('timestamp')
        logger.info(f"Найдено сообщений: {messages_list.count()}")
        
        # Получаем все сессии пользователя для сайдбара
        all_sessions = ChatSession.objects.filter(
            user=request.user, 
            is_active=True
        ).order_by('-updated_at')
        logger.info(f"Найдено сессий для сайдбара: {all_sessions.count()}")
        
        context = {
            'chat_session': chat_session,
            'messages': messages_list,
            'all_sessions': all_sessions,
            'api_key_configured': True,
        }
        
        logger.info("Рендерим шаблон chat.html")
        return render(request, 'gemini/chat.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка в chat_session: {str(e)}", exc_info=True)
        messages.error(request, f'Ошибка при загрузке чата: {str(e)}')
        return redirect('gemini:dashboard')


@login_required
def settings(request):
    """
    Страница настроек API ключа
    """
    try:
        if request.method == 'POST':
            api_key = request.POST.get('api_key', '').strip()
            
            if not api_key:
                messages.error(request, 'API ключ не может быть пустым')
                return render(request, 'gemini/settings.html', {'has_api_key': bool(request.user.gemini_api_key)})
            
            # Тестируем API ключ
            try:
                gemini_service = GeminiService(api_key)
                success, message = gemini_service.test_connection()
                
                if success:
                    # Сохраняем API ключ в профиль пользователя
                    request.user.gemini_api_key = api_key
                    request.user.save()
                    
                    messages.success(request, 'API ключ успешно сохранен и протестирован!')
                    return redirect('gemini:dashboard')
                else:
                    messages.error(request, f'Ошибка тестирования API ключа: {message}')
                    
            except ValidationError as e:
                messages.error(request, f'Ошибка валидации: {str(e)}')
            except Exception as e:
                messages.error(request, f'Ошибка при тестировании API ключа: {str(e)}')
        
        context = {
            'has_api_key': bool(request.user.gemini_api_key),
            'current_api_key': request.user.gemini_api_key,
        }
        
        return render(request, 'gemini/settings.html', context)
        
    except Exception as e:
        logger.error(f"Ошибка в settings: {str(e)}")
        messages.error(request, f'Ошибка при загрузке настроек: {str(e)}')
        return render(request, 'gemini/settings.html', {})


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    """
    AJAX endpoint для отправки сообщения в чат
    """
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        message = data.get('message', '').strip()
        
        if not session_id or not message:
            return JsonResponse({
                'success': False,
                'error': 'Неверные параметры запроса'
            })
        
        # Получаем сессию
        chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        # Получаем API ключ
        if not request.user.gemini_api_key:
            return JsonResponse({
                'success': False,
                'error': 'API ключ не настроен'
            })
        
        # Сохраняем сообщение пользователя
        user_message = ChatMessage.objects.create(
            session=chat_session,
            role='user',
            content=message
        )
        
        # Получаем историю сообщений для контекста
        history_messages = ChatMessage.objects.filter(
            session=chat_session
        ).order_by('timestamp')[:20]  # Последние 20 сообщений
        
        history = []
        for msg in history_messages:
            history.append({
                'role': msg.role,
                'content': msg.content
            })
        
        # Отправляем запрос к Gemini
        gemini_service = GeminiService(request.user.gemini_api_key)
        success, response, metadata = gemini_service.generate_content(message, history)
        
        if success:
            # Сохраняем ответ ассистента
            assistant_message = ChatMessage.objects.create(
                session=chat_session,
                role='assistant',
                content=response,
                tokens_used=metadata.get('usage_metadata', {}).get('totalTokenCount'),
                response_time=metadata.get('response_time')
            )
            
            # Обновляем время последнего обновления сессии
            chat_session.updated_at = timezone.now()
            chat_session.save()
            
            return JsonResponse({
                'success': True,
                'response': response,
                'user_message_id': user_message.id,
                'assistant_message_id': assistant_message.id,
                'metadata': metadata
            })
        else:
            return JsonResponse({
                'success': False,
                'error': response
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный JSON в запросе'
        })
    except Exception as e:
        logger.error(f"Ошибка в send_message: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Внутренняя ошибка сервера: {str(e)}'
        })


@login_required
def delete_session(request, session_id):
    """
    Удаление сессии чата
    """
    try:
        chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        chat_session.is_active = False
        chat_session.save()
        
        messages.success(request, 'Сессия чата удалена')
        return redirect('gemini:dashboard')
        
    except Exception as e:
        logger.error(f"Ошибка в delete_session: {str(e)}")
        messages.error(request, f'Ошибка при удалении сессии: {str(e)}')
        return redirect('gemini:dashboard')


@login_required
def test_api_key(request):
    """
    AJAX endpoint для тестирования API ключа
    """
    try:
        data = json.loads(request.body)
        api_key = data.get('api_key', '').strip()
        
        if not api_key:
            return JsonResponse({
                'success': False,
                'error': 'API ключ не может быть пустым'
            })
        
        gemini_service = GeminiService(api_key)
        success, message = gemini_service.test_connection()
        
        return JsonResponse({
            'success': success,
            'message': message
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный JSON в запросе'
        })
    except Exception as e:
        logger.error(f"Ошибка в test_api_key: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при тестировании API ключа: {str(e)}'
        })


@login_required
@require_http_methods(["POST"])
def update_session_title(request, session_id):
    """
    Обновление названия сессии чата
    """
    try:
        # Получаем сессию
        chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        # Получаем данные из запроса
        data = json.loads(request.body)
        new_title = data.get('title', '').strip()
        
        if not new_title:
            return JsonResponse({
                'success': False,
                'error': 'Название не может быть пустым'
            })
        
        # Обновляем название
        chat_session.title = new_title
        chat_session.save()
        
        return JsonResponse({
            'success': True,
            'title': new_title
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный формат данных'
        })
    except Exception as e:
        logger.error(f"Ошибка при обновлении названия сессии: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при обновлении названия: {str(e)}'
        })
