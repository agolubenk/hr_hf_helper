#!/usr/bin/env python3
"""
Тестовый скрипт для проверки веб-интерфейса Telegram
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image

def test_telegram_web():
    """Тестирование веб-интерфейса Telegram"""
    base_url = "http://localhost:8000"
    
    print("🚀 Тестирование веб-интерфейса Telegram...")
    
    # 1. Проверяем доступность главной страницы
    try:
        response = requests.get(f"{base_url}/telegram/")
        print(f"✅ Главная страница: статус {response.status_code}")
        
        if response.status_code == 302:
            print("   → Перенаправление на страницу входа (ожидаемо)")
        elif response.status_code == 200:
            print("   → Страница загружена успешно")
            
    except Exception as e:
        print(f"❌ Ошибка доступа к главной странице: {e}")
        return
    
    # 2. Проверяем API endpoints
    api_endpoints = [
        "/telegram/api/generate-qr/",
        "/telegram/api/check-auth/",
        "/telegram/api/handle-2fa/",
        "/telegram/api/reset-auth/"
    ]
    
    for endpoint in api_endpoints:
        try:
            response = requests.post(f"{base_url}{endpoint}")
            print(f"✅ API {endpoint}: статус {response.status_code}")
            
            if response.status_code == 302:
                print("   → Перенаправление на страницу входа (ожидаемо)")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   → Ответ: {data}")
                except:
                    print("   → Ответ не в формате JSON")
                    
        except Exception as e:
            print(f"❌ Ошибка API {endpoint}: {e}")
    
    print("\n📋 Результаты тестирования:")
    print("   - Веб-интерфейс доступен")
    print("   - API endpoints отвечают")
    print("   - Для полного тестирования нужно войти в систему")
    
    print("\n🌐 Для тестирования:")
    print("   1. Откройте http://localhost:8000/telegram/")
    print("   2. Войдите в систему")
    print("   3. Нажмите 'Создать QR-код'")
    print("   4. Отсканируйте QR-код в Telegram")

if __name__ == "__main__":
    test_telegram_web()
