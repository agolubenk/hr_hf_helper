#!/usr/bin/env python3
"""
Скрипт для проверки всех аккаунтов Huntflow
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
        
        print(f"🏢 Доступные аккаунты:")
        for account in accounts['items']:
            account_id = account['id']
            account_name = account['name']
            account_nick = account.get('nick', '')
            
            print(f"   - ID: {account_id}, Название: '{account_name}' (nick: {account_nick})")
            
            # Проверяем кандидатов в каждом аккаунте
            applicants = huntflow_service.get_applicants(account_id, count=5)
            if applicants and 'items' in applicants:
                print(f"     └─ Кандидатов: {len(applicants['items'])}")
                
                # Ищем кандидата с меткой clickup-new
                for applicant in applicants['items']:
                    tags = applicant.get('tags', [])
                    clickup_tag = None
                    for tag in tags:
                        if tag.get('name') == 'clickup-new':
                            clickup_tag = tag
                            break
                    
                    if clickup_tag:
                        print(f"       ✅ Найден кандидат с меткой clickup-new: ID {applicant['id']} - {applicant.get('first_name')} {applicant.get('last_name')}")
            else:
                print(f"     └─ Кандидатов: 0")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
