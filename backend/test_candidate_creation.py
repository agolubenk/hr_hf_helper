#!/usr/bin/env python3
"""
Скрипт для тестирования создания кандидата
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
        
        # Тестовые данные для создания кандидата
        parsed_data = {
            'fields': {
                'name': {
                    'first': 'Тест',
                    'last': 'Кандидат'
                }
            },
            'text': 'Тестовое резюме кандидата'
        }
        
        # Тестовые данные задачи ClickUp
        task_data = {
            'name': 'Тестовая задача',
            'description': 'Описание тестовой задачи',
            'status': 'reject',
            'custom_fields': [
                {
                    'name': 'Телефон',
                    'value': '+375 29 123-45-67',
                    'type': 'text'
                },
                {
                    'name': 'Email',
                    'value': 'test@example.com',
                    'type': 'text'
                },
                {
                    'name': 'Telegram',
                    'value': '@testuser',
                    'type': 'text'
                }
            ]
        }
        
        print(f"\n🧪 Тестируем создание кандидата...")
        print(f"📊 Статус задачи: {task_data['status']}")
        print(f"📋 Custom fields: {len(task_data['custom_fields'])} полей")
        
        # Создаем кандидата
        applicant = huntflow_service.create_applicant_from_parsed_data(
            account_id=account_id,
            parsed_data=parsed_data,
            vacancy_id=None,
            task_name=task_data['name'],
            task_description=task_data['description'],
            task_comments=[],
            assignees=[],
            task_status=task_data['status'],
            task_data=task_data
        )
        
        if applicant:
            print(f"✅ Кандидат успешно создан!")
            print(f"📊 ID кандидата: {applicant.get('id')}")
            print(f"📊 Имя: {applicant.get('first_name')} {applicant.get('last_name')}")
            print(f"📊 Email: {applicant.get('email', 'Не указан')}")
            print(f"📊 Телефон: {applicant.get('phone', 'Не указан')}")
            if applicant.get('social'):
                print(f"📊 Telegram: {applicant['social'][0].get('value', 'Не указан')}")
        else:
            print(f"❌ Не удалось создать кандидата")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
