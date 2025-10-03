#!/usr/bin/env python3
"""
Скрипт для тестирования исправленного добавления меток
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
        
        # Создаем сервис Huntflow
        huntflow_service = HuntflowService(user)
        
        account_id = 291341
        
        # Моделируем данные задачи ClickUp
        mock_task_data = {
            'id': 'test_task_fixed_tags',
            'name': 'Тестовая задача с исправленными метками',
            'description': 'Описание тестовой задачи для проверки исправления меток',
            'status': 'new',
            'assignees': [{'username': 'Yauheni Lebedzeu'}],
            'attachments': [],
            'comments': [],
            'custom_fields': []
        }
        
        # Моделируем распарсенные данные (обычно из резюме)
        mock_parsed_data = {
            'fields': {
                'name': {'first': 'Тест', 'last': 'Метки'}
            },
            'text': 'Тестовое резюме для проверки исправления меток'
        }
        
        print("\n🧪 Тестируем создание кандидата с исправленными метками...")
        
        # Вызываем метод создания кандидата
        applicant_result = huntflow_service.create_applicant_from_parsed_data(
            account_id=account_id,
            parsed_data=mock_parsed_data,
            vacancy_id=None, # Для теста без привязки к вакансии
            task_name=mock_task_data['name'],
            task_description=mock_task_data['description'],
            task_comments=mock_task_data['comments'],
            assignees=mock_task_data['assignees'],
            task_status=mock_task_data['status'],
            task_data=mock_task_data # Передаем полные данные задачи
        )
        
        if applicant_result:
            print("✅ Кандидат успешно создан!")
            applicant_id = applicant_result.get('id')
            print(f"📊 ID кандидата: {applicant_id}")
            print(f"📊 Имя: {applicant_result.get('first_name')} {applicant_result.get('last_name')}")
            
            # Проверяем метки через несколько секунд (чтобы кэш обновился)
            import time
            print(f"\n⏳ Ждем 2 секунды для обновления кэша...")
            time.sleep(2)
            
            # Проверяем метки кандидата
            print(f"\n🔍 Проверяем метки кандидата {applicant_id}...")
            applicant_check = huntflow_service.get_applicant(account_id, applicant_id)
            
            if applicant_check:
                tags = applicant_check.get('tags', [])
                print(f"📋 Метки кандидата ({len(tags)}):")
                
                # Получаем все теги для сопоставления
                all_tags = huntflow_service.get_tags(account_id)
                tag_names = {}
                if all_tags and 'items' in all_tags:
                    for tag_info in all_tags['items']:
                        tag_names[tag_info['id']] = tag_info
                
                has_clickup_tag = False
                has_executor_tag = False
                
                for tag in tags:
                    tag_id = tag.get('tag')
                    tag_info = tag_names.get(tag_id, {})
                    tag_name = tag_info.get('name', f'Unknown (ID: {tag_id})')
                    tag_color = tag_info.get('color', 'default')
                    print(f"   - ID: {tag_id}, Название: '{tag_name}', Цвет: {tag_color}")
                    
                    if tag_name == 'clickup-new':
                        has_clickup_tag = True
                        print(f"     ✅ НАЙДЕНА МЕТКА CLICKUP-NEW!")
                    elif tag_name == 'Yauheni Lebedzeu':
                        has_executor_tag = True
                        print(f"     ✅ НАЙДЕНА МЕТКА ИСПОЛНИТЕЛЯ!")
                
                print(f"\n📊 Результат теста:")
                print(f"   - Метка clickup-new: {'✅' if has_clickup_tag else '❌'}")
                print(f"   - Метка исполнителя: {'✅' if has_executor_tag else '❌'}")
                
                if has_clickup_tag and has_executor_tag:
                    print(f"\n🎉 УСПЕХ! Обе метки добавлены правильно!")
                elif has_clickup_tag:
                    print(f"\n⚠️ ЧАСТИЧНЫЙ УСПЕХ! Метка clickup-new добавлена, но нет метки исполнителя")
                elif has_executor_tag:
                    print(f"\n⚠️ ЧАСТИЧНЫЙ УСПЕХ! Метка исполнителя добавлена, но нет метки clickup-new")
                else:
                    print(f"\n❌ ПРОБЛЕМА! Ни одна из меток не добавлена")
            else:
                print(f"❌ Не удалось получить данные кандидата для проверки")
        else:
            print("❌ Ошибка при создании кандидата.")
        
    except User.DoesNotExist:
        print("❌ Пользователь andrei.golubenko не найден")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
