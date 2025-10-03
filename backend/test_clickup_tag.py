#!/usr/bin/env python3
"""
Скрипт для тестирования добавления тега huntflow в ClickUp
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.services import ClickUpService

User = get_user_model()

def main():
    try:
        # Получаем первого пользователя с настройками ClickUp
        user = User.objects.filter(clickup_api_key__isnull=False).exclude(clickup_api_key='').first()
        if not user:
            print("❌ Пользователи с настройками ClickUp не найдены")
            return
        
        print(f"👤 Пользователь: {user.username}")
        
        # Создаем сервис ClickUp
        clickup_service = ClickUpService(user.clickup_api_key)
        
        # Тестовый task_id (замените на реальный ID задачи)
        test_task_id = "86c0fuxan"  # Замените на реальный ID задачи из ClickUp
        
        print(f"🧪 Тестируем добавление тега 'huntflow' к задаче {test_task_id}")
        
        # Проверяем текущие теги задачи
        print(f"\n🔍 Проверяем текущие теги задачи...")
        task_data = clickup_service.get_task(test_task_id)
        if task_data:
            current_tags = task_data.get('tags', [])
            print(f"📋 Текущие теги задачи ({len(current_tags)}):")
            for tag in current_tags:
                if isinstance(tag, dict):
                    tag_name = tag.get('name', 'Unknown')
                    tag_color = tag.get('tag_bg', 'default')
                    print(f"   - {tag_name} (цвет: {tag_color})")
                else:
                    print(f"   - {tag}")
        else:
            print(f"❌ Не удалось получить данные задачи {test_task_id}")
            return
        
        # Проверяем, есть ли уже тег huntflow
        has_huntflow_tag = any(
            tag.get('name', '').lower() == 'huntflow' 
            for tag in current_tags if isinstance(tag, dict)
        )
        
        if has_huntflow_tag:
            print(f"✅ Тег 'huntflow' уже есть у задачи")
        else:
            print(f"❌ Тег 'huntflow' отсутствует у задачи")
            
            # Пробуем добавить тег
            print(f"\n🏷️ Добавляем тег 'huntflow' к задаче...")
            success = clickup_service.add_tag_to_task(test_task_id, 'huntflow')
            
            if success:
                print(f"✅ Тег 'huntflow' успешно добавлен!")
                
                # Проверяем результат
                print(f"\n🔍 Проверяем результат...")
                updated_task_data = clickup_service.get_task(test_task_id)
                if updated_task_data:
                    updated_tags = updated_task_data.get('tags', [])
                    print(f"📋 Теги после добавления ({len(updated_tags)}):")
                    
                    has_huntflow_after = False
                    for tag in updated_tags:
                        if isinstance(tag, dict):
                            tag_name = tag.get('name', 'Unknown')
                            tag_color = tag.get('tag_bg', 'default')
                            print(f"   - {tag_name} (цвет: {tag_color})")
                            if tag_name.lower() == 'huntflow':
                                has_huntflow_after = True
                        else:
                            print(f"   - {tag}")
                    
                    if has_huntflow_after:
                        print(f"\n🎉 УСПЕХ! Тег 'huntflow' теперь есть у задачи!")
                    else:
                        print(f"\n❌ ПРОБЛЕМА! Тег 'huntflow' все еще отсутствует")
                else:
                    print(f"❌ Не удалось получить обновленные данные задачи")
            else:
                print(f"❌ Не удалось добавить тег 'huntflow' к задаче")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
