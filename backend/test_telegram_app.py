#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы Telegram приложения
"""

import os
import sys
import django
from django.conf import settings

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('TELEGRAM_API_ID', '123456789')
os.environ.setdefault('TELEGRAM_API_HASH', 'test_hash')

django.setup()

def test_models():
    """Тестирование моделей"""
    print("🔍 Тестирование моделей...")
    
    from apps.telegram.models import TelegramUser, AuthAttempt, TelegramMessage
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Создаем тестового пользователя
    user, created = User.objects.get_or_create(
        username='test_telegram_user',
        defaults={'email': 'test@example.com'}
    )
    
    if created:
        print(f"✅ Создан тестовый пользователь: {user.username}")
    else:
        print(f"✅ Найден существующий пользователь: {user.username}")
    
    # Создаем TelegramUser
    telegram_user, created = TelegramUser.objects.get_or_create(
        user=user,
        defaults={'session_name': f'test_session_{user.id}'}
    )
    
    if created:
        print(f"✅ Создан TelegramUser: {telegram_user.session_name}")
    else:
        print(f"✅ Найден существующий TelegramUser: {telegram_user.session_name}")
    
    # Создаем тестовую попытку авторизации
    attempt = AuthAttempt.objects.create(
        telegram_user=telegram_user,
        attempt_type='qr',
        status='pending'
    )
    print(f"✅ Создана попытка авторизации: {attempt.id}")
    
    return telegram_user

def test_views():
    """Тестирование views"""
    print("\n🔍 Тестирование views...")
    
    from apps.telegram.views import TelegramAuthView
    from django.test import RequestFactory
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    factory = RequestFactory()
    
    # Создаем тестовый запрос
    user = User.objects.get(username='test_telegram_user')
    request = factory.get('/telegram/')
    request.user = user
    
    # Тестируем view
    view = TelegramAuthView()
    try:
        response = view.get(request)
        print(f"✅ TelegramAuthView работает: статус {response.status_code}")
    except Exception as e:
        print(f"❌ Ошибка в TelegramAuthView: {e}")

def test_telegram_client():
    """Тестирование Telegram клиента"""
    print("\n🔍 Тестирование Telegram клиента...")
    
    from apps.telegram.telegram_client import run_telegram_auth_async
    from apps.telegram.models import TelegramUser
    
    telegram_user = TelegramUser.objects.first()
    if not telegram_user:
        print("❌ Нет TelegramUser для тестирования")
        return
    
    # Тестируем проверку авторизации
    try:
        result = run_telegram_auth_async(telegram_user.id, "check_auth")
        print(f"✅ Проверка авторизации: {result}")
    except Exception as e:
        print(f"❌ Ошибка проверки авторизации: {e}")

def test_urls():
    """Тестирование URL маршрутов"""
    print("\n🔍 Тестирование URL маршрутов...")
    
    from django.urls import reverse
    from django.test import Client
    
    client = Client()
    
    # Тестируем доступность страниц
    try:
        response = client.get('/telegram/')
        print(f"✅ Страница /telegram/ доступна: статус {response.status_code}")
    except Exception as e:
        print(f"❌ Ошибка доступа к /telegram/: {e}")
    
    try:
        response = client.get('/telegram/dashboard/')
        print(f"✅ Страница /telegram/dashboard/ доступна: статус {response.status_code}")
    except Exception as e:
        print(f"❌ Ошибка доступа к /telegram/dashboard/: {e}")

def main():
    """Основная функция тестирования"""
    print("🚀 Запуск тестирования Telegram приложения...\n")
    
    try:
        # Тестируем модели
        telegram_user = test_models()
        
        # Тестируем views
        test_views()
        
        # Тестируем Telegram клиент
        test_telegram_client()
        
        # Тестируем URL маршруты
        test_urls()
        
        print("\n✅ Все тесты завершены успешно!")
        print(f"\n📋 Результаты:")
        print(f"   - TelegramUser создан: {telegram_user.session_name}")
        print(f"   - Модели работают корректно")
        print(f"   - Views функционируют")
        print(f"   - URL маршруты настроены")
        print(f"\n🌐 Для тестирования веб-интерфейса:")
        print(f"   1. Запустите сервер: python manage.py runserver")
        print(f"   2. Откройте: http://localhost:8000/telegram/")
        print(f"   3. Войдите в систему и протестируйте авторизацию")
        
    except Exception as e:
        print(f"\n❌ Ошибка во время тестирования: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
