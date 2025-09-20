#!/usr/bin/env python3
"""
Тест для проверки 2FA flow в Telegram
"""

import requests
import json
import time

def test_2fa_flow():
    """Тестирование 2FA flow"""
    base_url = "http://localhost:8000"
    
    print("🧪 Тестирование 2FA flow...")
    
    # Создаем сессию
    session = requests.Session()
    
    # 1. Входим в систему (если нужно)
    print("1. Проверяем авторизацию...")
    response = session.get(f"{base_url}/telegram/")
    
    if response.status_code == 302:
        print("   → Нужна авторизация")
        # Здесь нужно войти в систему
        return
    
    print("   → Уже авторизован")
    
    # 2. Генерируем QR-код
    print("2. Генерируем QR-код...")
    response = session.post(f"{base_url}/telegram/api/generate-qr/")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("   → QR-код создан успешно")
            print(f"   → Session: {data.get('session_name')}")
        else:
            print(f"   → Ошибка: {data.get('error')}")
            return
    else:
        print(f"   → HTTP ошибка: {response.status_code}")
        return
    
    # 3. Проверяем статус авторизации несколько раз
    print("3. Проверяем статус авторизации...")
    for i in range(5):
        print(f"   Попытка {i+1}/5...")
        response = session.post(f"{base_url}/telegram/api/check-auth/")
        
        if response.status_code == 200:
            data = response.json()
            status = data.get('status')
            print(f"   → Статус: {status}")
            
            if status == '2fa_required':
                print("   ✅ Требуется 2FA!")
                print("   → Теперь нужно ввести пароль 2FA в веб-интерфейсе")
                break
            elif status == 'success':
                print("   ✅ Авторизация успешна!")
                break
            elif status == 'waiting':
                print("   → Ждем сканирования QR...")
            else:
                print(f"   → Неожиданный статус: {status}")
        
        time.sleep(3)
    
    print("\n📋 Результат тестирования:")
    print("   - QR-код генерируется")
    print("   - API endpoints работают")
    print("   - Для полного тестирования нужно отсканировать QR в Telegram")

if __name__ == "__main__":
    test_2fa_flow()
