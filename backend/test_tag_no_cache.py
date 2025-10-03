#!/usr/bin/env python3
"""
Скрипт для тестирования добавления меток без кэша
"""
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.huntflow.services import HuntflowService
from apps.google_oauth.cache_service import HuntflowAPICache

User = get_user_model()

def main():
    try:
        # Получаем пользователя andrei.golubenko (production)
        user = User.objects.get(username='andrei.golubenko')
        
        print(f"👤 Пользователь: {user.username}")
        
        # Создаем сервис Huntflow
        huntflow_service = HuntflowService(user)
        
        account_id = 291341
        applicant_id = 74647940  # Кандидат Nastassia PL
        
        print(f"🏢 Аккаунт: {account_id}")
        print(f"👤 Кандидат: {applicant_id}")
        
        # Очищаем кэш для этого кандидата
        print(f"🗑️ Очищаем кэш для кандидата {applicant_id}")
        HuntflowAPICache.clear_candidate(user.id, account_id, applicant_id)
        
        # Проверяем текущие метки БЕЗ кэша
        print(f"\n🔍 Проверяем текущие метки кандидата (без кэша)...")
        applicant = huntflow_service.get_applicant(account_id, applicant_id)
        if not applicant:
            print(f"❌ Кандидат {applicant_id} не найден")
            return
        
        current_tags = applicant.get('tags', [])
        print(f"📋 Текущие метки ({len(current_tags)}):")
        
        # Получаем все теги для сопоставления
        all_tags = huntflow_service.get_tags(account_id)
        tag_names = {}
        if all_tags and 'items' in all_tags:
            for tag_info in all_tags['items']:
                tag_names[tag_info['id']] = tag_info
        
        current_tag_ids = []
        for tag in current_tags:
            tag_id = tag.get('tag')
            tag_info = tag_names.get(tag_id, {})
            tag_name = tag_info.get('name', f'Unknown (ID: {tag_id})')
            tag_color = tag_info.get('color', 'default')
            print(f"   - ID: {tag_id}, Название: '{tag_name}', Цвет: {tag_color}")
            current_tag_ids.append(tag_id)
        
        # Ищем метку clickup-new
        clickup_tag_id = None
        for tag_info in all_tags['items']:
            if tag_info['name'] == 'clickup-new':
                clickup_tag_id = tag_info['id']
                break
        
        if not clickup_tag_id:
            print(f"❌ Метка 'clickup-new' не найдена в системе")
            return
        
        print(f"\n🏷️ Найдена метка 'clickup-new' с ID: {clickup_tag_id}")
        
        # Проверяем, есть ли уже эта метка
        if clickup_tag_id in current_tag_ids:
            print(f"✅ Метка 'clickup-new' уже есть у кандидата")
        else:
            print(f"❌ Метка 'clickup-new' отсутствует у кандидата")
            
            # Пробуем добавить метку
            print(f"\n🧪 Тестируем добавление метки 'clickup-new'...")
            
            # Добавляем все метки (включая существующие + clickup-new)
            print(f"📤 Добавляем все метки (существующие + clickup-new)")
            all_tag_ids = current_tag_ids + [clickup_tag_id]
            tag_data = {'tags': all_tag_ids}
            print(f"📤 Отправляем данные: {tag_data}")
            
            result = huntflow_service._make_request('POST', f"/accounts/{account_id}/applicants/{applicant_id}/tags", json=tag_data)
            
            if result:
                print(f"✅ Метки добавлены, ответ API: {result}")
            else:
                print(f"❌ Не удалось добавить метки")
        
        # Очищаем кэш и проверяем результат
        print(f"\n🗑️ Очищаем кэш и проверяем результат...")
        HuntflowAPICache.clear_candidate(user.id, account_id, applicant_id)
        
        applicant_after = huntflow_service.get_applicant(account_id, applicant_id)
        tags_after = applicant_after.get('tags', [])
        
        print(f"📋 Метки после теста ({len(tags_after)}):")
        has_clickup_tag = False
        for tag in tags_after:
            tag_id = tag.get('tag')
            tag_info = tag_names.get(tag_id, {})
            tag_name = tag_info.get('name', f'Unknown (ID: {tag_id})')
            tag_color = tag_info.get('color', 'default')
            print(f"   - ID: {tag_id}, Название: '{tag_name}', Цвет: {tag_color}")
            
            if tag_name == 'clickup-new':
                has_clickup_tag = True
        
        if has_clickup_tag:
            print(f"\n🎉 УСПЕХ! Метка 'clickup-new' теперь есть у кандидата!")
        else:
            print(f"\n❌ ПРОБЛЕМА! Метка 'clickup-new' все еще отсутствует")
            print(f"🔍 Возможно, API Huntflow работает не так, как ожидается")
        
    except User.DoesNotExist:
        print("❌ Пользователь andrei.golubenko не найден")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
