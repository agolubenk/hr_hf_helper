#!/usr/bin/env python3
"""
Скрипт для тестирования обработки статуса reject
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
        print(f"🏢 Аккаунт ID: {account_id}")
        
        # Получаем статусы
        statuses = huntflow_service.get_vacancy_statuses(account_id)
        if not statuses or 'items' not in statuses:
            print("❌ Статусы не найдены")
            return
        
        print(f"\n🧪 Тестируем логику поиска статуса для task_status='reject'")
        print("="*60)
        
        # Симулируем логику из _bind_applicant_to_vacancy
        task_status = 'reject'
        target_status = None
        
        if task_status and task_status.lower() == 'reject':
            print(f"🔍 Статус задачи ClickUp: {task_status}, ищем статус 'Отказ' в Huntflow")
            for status in statuses['items']:
                status_name = status.get('name', '').lower()
                status_type = status.get('type', '').lower()
                
                # Ищем статус отказа (может быть типа 'trash' или содержать 'отказ'/'reject')
                if ('отказ' in status_name or 'reject' in status_name) or status_type == 'trash':
                    print(f"   🔍 Проверяем статус: '{status['name']}' (тип: {status_type})")
                    
                    # Проверяем подстатусы (reject_reasons)
                    if 'reject_reasons' in status and status['reject_reasons']:
                        print(f"      └─ Найдены подстатусы: {len(status['reject_reasons'])}")
                        for reason in status['reject_reasons']:
                            reason_name = reason.get('name', '').lower()
                            print(f"         - '{reason['name']}'")
                            if 'по другой причине' in reason_name or 'other reason' in reason_name:
                                target_status = reason['id']
                                print(f"         ✅ Найден подстатус отказа: {reason['name']} (ID: {reason['id']})")
                                break
                    else:
                        # Если нет подстатусов, используем основной статус отказа
                        target_status = status['id']
                        print(f"   ✅ Найден статус отказа: {status['name']} (ID: {status['id']}) типа '{status_type}'")
                        break
        
        if not target_status:
            print("❌ Статус отказа не найден")
            # Ищем статус по умолчанию
            for status in statuses['items']:
                if status.get('order', 0) == 1 or status.get('name', '').lower() in ['новая', 'new', 'отклик', 'response']:
                    target_status = status['id']
                    print(f"✅ Используем статус по умолчанию: {status['name']} (ID: {status['id']})")
                    break
        else:
            print(f"\n🎯 Итоговый статус: {target_status}")
            
            # Найдем название статуса
            for status in statuses['items']:
                if status['id'] == target_status:
                    print(f"   Название: '{status['name']}'")
                    break
                # Проверяем подстатусы
                if 'reject_reasons' in status:
                    for reason in status['reject_reasons']:
                        if reason['id'] == target_status:
                            print(f"   Название: '{reason['name']}' (подстатус)")
                            break
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
