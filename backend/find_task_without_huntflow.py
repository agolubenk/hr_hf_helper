#!/usr/bin/env python3
"""
Скрипт для поиска задачи без тега huntflow для тестирования
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.services import ClickUpService
from apps.clickup_int.models import ClickUpSettings

User = get_user_model()

def main():
    try:
        # Получаем пользователя с настройками ClickUp
        user = User.objects.filter(clickup_api_key__isnull=False).exclude(clickup_api_key='').first()
        if not user:
            print("❌ Пользователи с настройками ClickUp не найдены")
            return
        
        print(f"👤 Пользователь: {user.username}")
        
        # Получаем настройки ClickUp
        try:
            clickup_settings = ClickUpSettings.objects.get(user=user)
            list_id = clickup_settings.list_id
            if not list_id:
                print(f"❌ Не настроен list_id в ClickUpSettings для пользователя")
                return
        except ClickUpSettings.DoesNotExist:
            print(f"❌ Не найдены настройки ClickUp для пользователя")
            return
        
        print(f"📋 Используем list_id: {list_id}")
        
        # Создаем сервис ClickUp
        clickup_service = ClickUpService(user.clickup_api_key)
        
        # Получаем список задач
        print(f"\n🔍 Ищем задачи без тега huntflow...")
        tasks = clickup_service.get_tasks(list_id)
        
        if not tasks:
            print(f"❌ Не удалось получить задачи из списка {list_id}")
            return
        
        print(f"📋 Найдено задач: {len(tasks)}")
        
        tasks_without_huntflow = []
        for task in tasks:
            task_id = task.get('id')
            task_name = task.get('name', 'Без названия')
            tags = task.get('tags', [])
            
            has_huntflow_tag = any(
                tag.get('name', '').lower() == 'huntflow' 
                for tag in tags if isinstance(tag, dict)
            )
            
            if not has_huntflow_tag:
                tasks_without_huntflow.append({
                    'id': task_id,
                    'name': task_name,
                    'tags': tags
                })
        
        print(f"\n📋 Задач без тега huntflow: {len(tasks_without_huntflow)}")
        
        if tasks_without_huntflow:
            print(f"\n🎯 Задачи без тега huntflow:")
            for i, task in enumerate(tasks_without_huntflow[:5]):  # Показываем первые 5
                print(f"   {i+1}. ID: {task['id']}, Название: {task['name']}")
                if task['tags']:
                    tag_names = [tag.get('name', 'Unknown') for tag in task['tags'] if isinstance(tag, dict)]
                    print(f"      Теги: {', '.join(tag_names) if tag_names else 'Нет тегов'}")
                else:
                    print(f"      Теги: Нет тегов")
            
            print(f"\n💡 Используйте один из этих task_id для тестирования переноса")
        else:
            print(f"✅ Все задачи уже имеют тег huntflow")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
