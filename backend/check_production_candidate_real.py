#!/usr/bin/env python3
"""
Скрипт для проверки кандидата в продакшене с правильным пользователем
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
        # Получаем пользователя andrei.golubenko (production)
        user = User.objects.get(username='andrei.golubenko')
        
        print(f"👤 Пользователь: {user.username}")
        print(f"🔥 Система: {user.active_system}")
        
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
            print(f"   - ID: {account_id}, Название: '{account_name}'")
            
            # Проверяем последних кандидатов
            applicants = huntflow_service.get_applicants(account_id, count=10)
            if applicants and 'items' in applicants:
                print(f"     └─ Последние кандидаты:")
                
                for applicant in applicants['items'][:5]:  # Показываем первых 5
                    applicant_id = applicant['id']
                    first_name = applicant.get('first_name', '')
                    last_name = applicant.get('last_name', '')
                    created = applicant.get('created', '')
                    
                    # Проверяем метки
                    tags = applicant.get('tags', [])
                    has_clickup_tag = False
                    has_executor_tag = False
                    
                    if tags:
                        # Получаем все теги для сопоставления
                        all_tags = huntflow_service.get_tags(account_id)
                        tag_names = {}
                        if all_tags and 'items' in all_tags:
                            for tag_info in all_tags['items']:
                                tag_names[tag_info['id']] = tag_info
                        
                        for tag in tags:
                            tag_tag = tag.get('tag')  # Это ID тега
                            tag_info = tag_names.get(tag_tag, {})
                            tag_name = tag_info.get('name', '')
                            
                            if tag_name == 'clickup-new':
                                has_clickup_tag = True
                            elif tag_name and not tag_name in ['clickup-new', 'notion-new']:
                                has_executor_tag = True
                    
                    clickup_status = "✅" if has_clickup_tag else "❌"
                    executor_status = "✅" if has_executor_tag else "❌"
                    
                    print(f"       - ID: {applicant_id}, Имя: {first_name} {last_name}")
                    print(f"         Создан: {created}")
                    print(f"         Метка clickup-new: {clickup_status}")
                    print(f"         Метка исполнителя: {executor_status}")
                    
                    # Показываем детали меток
                    if tags:
                        print(f"         Метки:")
                        for tag in tags:
                            tag_tag = tag.get('tag')
                            tag_info = tag_names.get(tag_tag, {})
                            tag_name = tag_info.get('name', f'Unknown (ID: {tag_tag})')
                            tag_color = tag_info.get('color', 'default')
                            print(f"           - '{tag_name}' (цвет: {tag_color})")
        
    except User.DoesNotExist:
        print("❌ Пользователь andrei.golubenko не найден")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
