#!/usr/bin/env python3
"""
Скрипт для проверки статусов в Huntflow
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.huntflow.services import HuntflowService

User = get_user_model()

def main():
    try:
        # Получаем первого пользователя
        user = User.objects.first()
        if not user:
            print("❌ Пользователи не найдены")
            return
        
        print(f"👤 Пользователь: {user.username}")
        
        # Создаем сервис Huntflow
        huntflow_service = HuntflowService(user)
        
        # Получаем аккаунты
        accounts = huntflow_service.get_accounts()
        if not accounts or 'items' not in accounts:
            print("❌ Аккаунты Huntflow не найдены")
            return
        
        account_id = accounts['items'][0]['id']
        account_name = accounts['items'][0]['name']
        
        print(f"🏢 Аккаунт: {account_name} (ID: {account_id})")
        
        # Получаем статусы
        statuses = huntflow_service.get_vacancy_statuses(account_id)
        if not statuses or 'items' not in statuses:
            print("❌ Статусы не найдены")
            return
        
        print(f"\n📊 Найдено статусов: {len(statuses['items'])}")
        print("\n" + "="*80)
        
        for status in statuses['items']:
            status_id = status.get('id')
            status_name = status.get('name')
            status_type = status.get('type', 'unknown')
            status_order = status.get('order', 0)
            
            print(f"ID: {status_id:6} | Порядок: {status_order:2} | Тип: {status_type:8} | Название: '{status_name}'")
            
            # Проверяем подстатусы (reject_reasons)
            if 'reject_reasons' in status and status['reject_reasons']:
                print(f"      └─ Подстатусы отказа:")
                for reason in status['reject_reasons']:
                    reason_id = reason.get('id')
                    reason_name = reason.get('name')
                    print(f"         ID: {reason_id:6} | Название: '{reason_name}'")
        
        print("\n" + "="*80)
        print("🔍 Поиск статусов с 'отказ' или 'reject':")
        
        found_reject_statuses = []
        for status in statuses['items']:
            status_name = status.get('name', '').lower()
            if 'отказ' in status_name or 'reject' in status_name:
                found_reject_statuses.append(status)
                print(f"✅ Найден статус отказа: ID {status['id']} - '{status['name']}'")
                
                # Проверяем подстатусы
                if 'reject_reasons' in status and status['reject_reasons']:
                    for reason in status['reject_reasons']:
                        reason_name = reason.get('name', '').lower()
                        if 'по другой причине' in reason_name or 'other reason' in reason_name:
                            print(f"   ✅ Найден подстатус: ID {reason['id']} - '{reason['name']}'")
        
        if not found_reject_statuses:
            print("❌ Статусы отказа не найдены")
            print("\n💡 Рекомендации:")
            print("1. Создайте статус 'Отказ' в Huntflow")
            print("2. Добавьте подстатус 'По другой причине' к статусу отказа")
            print("3. Или обновите логику поиска статуса отказа в коде")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
