#!/usr/bin/env python3
"""
Скрипт для проверки тестового кандидата
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
        
        # ID тестового кандидата
        applicant_id = 1140
        
        print(f"\n🔍 Проверяем тестового кандидата {applicant_id}")
        
        # Получаем информацию о кандидате
        applicant = huntflow_service.get_applicant(account_id, applicant_id)
        if not applicant:
            print(f"❌ Кандидат {applicant_id} не найден")
            return
        
        print(f"✅ Кандидат найден: {applicant.get('first_name')} {applicant.get('last_name')}")
        
        # Проверяем метки
        tags = applicant.get('tags', [])
        print(f"\n🏷️ Метки кандидата ({len(tags)}):")
        
        if tags:
            for tag in tags:
                tag_id = tag.get('id')
                tag_tag = tag.get('tag')  # Это ID тега
                print(f"   - ID связи: {tag_id}, ID тега: {tag_tag}")
                
                # Получаем информацию о теге
                all_tags = huntflow_service.get_tags(account_id)
                if all_tags and 'items' in all_tags:
                    for tag_info in all_tags['items']:
                        if tag_info['id'] == tag_tag:
                            print(f"     └─ Название: '{tag_info['name']}', Цвет: {tag_info.get('color', 'default')}")
                            break
        else:
            print("   ❌ Метки не найдены")
        
        # Проверяем все доступные теги
        print(f"\n🔍 Все доступные теги в аккаунте:")
        all_tags = huntflow_service.get_tags(account_id)
        if all_tags and 'items' in all_tags:
            for tag_info in all_tags['items']:
                tag_id = tag_info['id']
                tag_name = tag_info['name']
                tag_color = tag_info.get('color', 'default')
                print(f"   - ID: {tag_id}, Название: '{tag_name}', Цвет: {tag_color}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
