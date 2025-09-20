from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
import json
from .serializers import UserSerializer


@csrf_exempt
@never_cache
def simple_api_login(request):
    """Простой API endpoint для входа в систему"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный JSON'}, status=400)
    
    if not username or not password:
        return JsonResponse(
            {'error': 'Имя пользователя и пароль обязательны'}, 
            status=400
        )
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.is_active:
            login(request, user)
            serializer = UserSerializer(user)
            return JsonResponse({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': serializer.data
            }, status=200)
        else:
            return JsonResponse(
                {'error': 'Аккаунт деактивирован'}, 
                status=400
            )
    else:
        return JsonResponse(
            {'error': 'Неверное имя пользователя или пароль'}, 
            status=401
        )


@csrf_exempt
@require_http_methods(["POST"])
def simple_api_logout(request):
    """Простой API endpoint для выхода из системы"""
    
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Выход выполнен успешно'
    }, status=200)
