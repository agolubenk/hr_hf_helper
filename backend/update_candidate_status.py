#!/usr/bin/env python3
"""
Скрипт для обновления статуса кандидата на "Отказ"
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
        
        # ID кандидата из логов (74644273)
        applicant_id = 74644273
        
        print(f"\n🔍 Проверяем кандидата {applicant_id}")
        
        # Получаем информацию о кандидате
        applicant = huntflow_service.get_applicant(account_id, applicant_id)
        if not applicant:
            print(f"❌ Кандидат {applicant_id} не найден")
            return
        
        print(f"✅ Кандидат найден: {applicant.get('first_name')} {applicant.get('last_name')}")
        
        # Получаем текущий статус
        if applicant.get('links'):
            current_vacancy = applicant['links'][0].get('vacancy')
            current_status = applicant['links'][0].get('status')
            print(f"📊 Текущий статус: {current_status}, вакансия: {current_vacancy}")
        
        # Получаем статусы
        statuses = huntflow_service.get_vacancy_statuses(account_id)
        if not statuses or 'items' not in statuses:
            print("❌ Статусы не найдены")
            return
        
        # Находим статус "Отказ"
        reject_status_id = None
        for status in statuses['items']:
            if status.get('name', '').lower() == 'отказ':
                reject_status_id = status['id']
                print(f"✅ Найден статус отказа: {status['name']} (ID: {status['id']})")
                break
        
        if not reject_status_id:
            print("❌ Статус отказа не найден")
            return
        
        # Обновляем статус кандидата
        if current_vacancy:
            print(f"\n🔄 Обновляем статус кандидата {applicant_id} на статус {reject_status_id}")
            
            result = huntflow_service.update_applicant_status(
                account_id=account_id,
                applicant_id=applicant_id,
                status_id=reject_status_id,
                comment="Статус обновлен автоматически из ClickUp (reject)",
                vacancy_id=current_vacancy
            )
            
            if result:
                print("✅ Статус успешно обновлен!")
                print(f"📊 Новый статус: {reject_status_id}")
            else:
                print("❌ Не удалось обновить статус")
        else:
            print("❌ У кандидата нет привязанной вакансии")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
