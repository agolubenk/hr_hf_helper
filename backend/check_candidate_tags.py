#!/usr/bin/env python3
"""
Скрипт для проверки меток у кандидата в Huntflow
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
        
        # ID кандидата из логов (74647598)
        applicant_id = 74647598
        
        print(f"\n🔍 Проверяем кандидата {applicant_id}")
        
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
                tag_name = tag.get('name')
                tag_color = tag.get('color', 'default')
                print(f"   - ID: {tag_id}, Название: '{tag_name}', Цвет: {tag_color}")
        else:
            print("   ❌ Метки не найдены")
        
        # Проверяем статус
        if applicant.get('links'):
            for link in applicant['links']:
                status_id = link.get('status')
                vacancy_id = link.get('vacancy')
                print(f"\n📊 Статус: {status_id}, Вакансия: {vacancy_id}")
                
                # Получаем название статуса
                statuses = huntflow_service.get_vacancy_statuses(account_id)
                if statuses and 'items' in statuses:
                    for status in statuses['items']:
                        if status['id'] == status_id:
                            print(f"   📋 Название статуса: '{status['name']}'")
                            break
        
        # Проверяем комментарии
        logs = huntflow_service.get_applicant_logs(account_id, applicant_id)
        if logs and 'items' in logs:
            comments = [log for log in logs['items'] if log.get('type') == 'COMMENT']
            print(f"\n💬 Комментарии: {len(comments)}")
            
            for comment in comments[:3]:  # Показываем первые 3
                comment_text = comment.get('comment', '')[:100]
                created = comment.get('created', '')
                print(f"   - {created}: {comment_text}...")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
