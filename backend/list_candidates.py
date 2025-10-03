#!/usr/bin/env python3
"""
Скрипт для просмотра кандидатов в Huntflow
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
        
        # Получаем кандидатов
        print(f"\n🔍 Получаем кандидатов...")
        applicants = huntflow_service.get_applicants(account_id, count=10)
        
        if not applicants or 'items' not in applicants:
            print("❌ Кандидаты не найдены")
            return
        
        print(f"✅ Найдено кандидатов: {len(applicants['items'])}")
        print("\n" + "="*80)
        
        for applicant in applicants['items'][:5]:  # Показываем первых 5
            applicant_id = applicant.get('id')
            first_name = applicant.get('first_name', '')
            last_name = applicant.get('last_name', '')
            created = applicant.get('created', '')
            
            print(f"ID: {applicant_id:8} | Имя: {first_name} {last_name} | Создан: {created}")
            
            # Проверяем статус
            if applicant.get('links'):
                for link in applicant['links']:
                    status_id = link.get('status')
                    vacancy_id = link.get('vacancy')
                    print(f"      └─ Статус: {status_id}, Вакансия: {vacancy_id}")
        
        print("\n" + "="*80)
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
