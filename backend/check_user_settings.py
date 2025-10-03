#!/usr/bin/env python3
"""
Скрипт для проверки настроек пользователя
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def main():
    try:
        # Получаем всех пользователей
        users = User.objects.all()
        
        print(f"👥 Найдено пользователей: {users.count()}")
        
        for user in users:
            print(f"\n👤 Пользователь: {user.username}")
            print(f"   - active_system: {user.active_system}")
            print(f"   - huntflow_prod_url: {user.huntflow_prod_url}")
            print(f"   - huntflow_sandbox_url: {user.huntflow_sandbox_url}")
            print(f"   - huntflow_prod_api_key: {'***' if user.huntflow_prod_api_key else 'Нет'}")
            print(f"   - huntflow_sandbox_api_key: {'***' if user.huntflow_sandbox_api_key else 'Нет'}")
            print(f"   - huntflow_access_token: {'***' if user.huntflow_access_token else 'Нет'}")
            print(f"   - huntflow_refresh_token: {'***' if user.huntflow_refresh_token else 'Нет'}")
            print(f"   - is_huntflow_refresh_valid: {user.is_huntflow_refresh_valid}")
            
            # Проверяем, какая система будет использоваться
            if user.active_system == 'prod':
                print(f"   🔥 АКТИВНАЯ СИСТЕМА: PRODUCTION")
                if user.huntflow_access_token:
                    print(f"   ✅ Будет использоваться OAuth токен")
                elif user.huntflow_prod_api_key:
                    print(f"   ✅ Будет использоваться API ключ production")
                else:
                    print(f"   ❌ Нет аутентификации для production")
            else:
                print(f"   🧪 АКТИВНАЯ СИСТЕМА: SANDBOX")
                if user.huntflow_sandbox_api_key:
                    print(f"   ✅ Будет использоваться API ключ sandbox")
                else:
                    print(f"   ❌ Нет аутентификации для sandbox")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
