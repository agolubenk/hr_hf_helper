#!/usr/bin/env python3
"""
Скрипт для проверки задач ClickUp со статусом reject
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.models import ClickUpTask

User = get_user_model()

def main():
    try:
        # Получаем первого пользователя
        user = User.objects.first()
        if not user:
            print("❌ Пользователи не найдены")
            return
        
        print(f"👤 Пользователь: {user.username}")
        
        # Получаем задачи ClickUp
        tasks = ClickUpTask.objects.filter(user=user).order_by('-date_created')[:10]
        
        print(f"✅ Найдено задач: {tasks.count()}")
        print("\n" + "="*80)
        
        for task in tasks:
            print(f"ID: {task.task_id:12} | Название: {task.name[:50]}...")
            print(f"      └─ Статус: '{task.status}' | Создана: {task.date_created}")
            
            # Проверяем custom fields
            custom_fields = task.get_custom_fields_display()
            if custom_fields:
                print(f"      └─ Custom fields: {len(custom_fields)} полей")
                for field in custom_fields[:3]:  # Показываем первые 3
                    print(f"         - {field['name']}: {field['value'][:30]}...")
            
            print()
        
        print("\n" + "="*80)
        print("🔍 Поиск задач со статусом 'reject':")
        
        reject_tasks = ClickUpTask.objects.filter(user=user, status__icontains='reject')
        print(f"✅ Найдено задач со статусом reject: {reject_tasks.count()}")
        
        for task in reject_tasks:
            print(f"   - {task.task_id}: {task.name[:50]}... (статус: '{task.status}')")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
