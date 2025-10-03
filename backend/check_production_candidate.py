#!/usr/bin/env python3
"""
Скрипт для проверки кандидата в продакшене
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
        
        # Ищем продакшен аккаунт (ID: 291341)
        production_account = None
        for account in accounts['items']:
            if account['id'] == 291341:
                production_account = account
                break
        
        if not production_account:
            print("❌ Продакшен аккаунт (ID: 291341) не найден")
            print("Доступные аккаунты:")
            for account in accounts['items']:
                print(f"   - ID: {account['id']}, Название: '{account['name']}'")
            return
        
        account_id = production_account['id']
        print(f"🏢 Продакшен аккаунт: {production_account['name']} (ID: {account_id})")
        
        # ID кандидата из логов (74647940)
        applicant_id = 74647940
        
        print(f"\n🔍 Проверяем кандидата {applicant_id}")
        
        # Получаем информацию о кандидате
        applicant = huntflow_service.get_applicant(account_id, applicant_id)
        if not applicant:
            print(f"❌ Кандидат {applicant_id} не найден")
            return
        
        print(f"✅ Кандидат найден: {applicant.get('first_name')} {applicant.get('last_name')}")
        print(f"📧 Email: {applicant.get('email')}")
        print(f"📱 Телефон: {applicant.get('phone')}")
        
        # Проверяем метки
        tags = applicant.get('tags', [])
        print(f"\n🏷️ Метки кандидата ({len(tags)}):")
        
        if tags:
            # Получаем все теги для сопоставления
            all_tags = huntflow_service.get_tags(account_id)
            tag_names = {}
            if all_tags and 'items' in all_tags:
                for tag_info in all_tags['items']:
                    tag_names[tag_info['id']] = tag_info
            
            for tag in tags:
                tag_id = tag.get('id')
                tag_tag = tag.get('tag')  # Это ID тега
                
                tag_info = tag_names.get(tag_tag, {})
                tag_name = tag_info.get('name', f'Unknown (ID: {tag_tag})')
                tag_color = tag_info.get('color', 'default')
                
                print(f"   - ID связи: {tag_id}, ID тега: {tag_tag}")
                print(f"     └─ Название: '{tag_name}', Цвет: {tag_color}")
                
                # Проверяем, есть ли метка clickup-new
                if tag_name == 'clickup-new':
                    print(f"     ✅ НАЙДЕНА МЕТКА CLICKUP-NEW!")
        else:
            print("   ❌ Метки не найдены")
        
        # Проверяем статус и вакансию
        if applicant.get('links'):
            print(f"\n📊 Связи с вакансиями:")
            for link in applicant['links']:
                status_id = link.get('status')
                vacancy_id = link.get('vacancy')
                print(f"   - Вакансия: {vacancy_id}, Статус: {status_id}")
                
                # Получаем название статуса
                statuses = huntflow_service.get_vacancy_statuses(account_id)
                if statuses and 'items' in statuses:
                    for status in statuses['items']:
                        if status['id'] == status_id:
                            print(f"     └─ Название статуса: '{status['name']}'")
                            break
        
        # Проверяем социальные сети (Telegram)
        social = applicant.get('social', [])
        if social:
            print(f"\n📱 Социальные сети:")
            for soc in social:
                soc_type = soc.get('social_type')
                soc_value = soc.get('value')
                print(f"   - {soc_type}: {soc_value}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
