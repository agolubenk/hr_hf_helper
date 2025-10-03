import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.services import ClickUpService

User = get_user_model()

def main():
    try:
        user = User.objects.filter(username='andrei.golubenko').first()
        if not user:
            print("❌ Пользователь 'andrei.golubenko' не найден")
            return
        
        clickup_service = ClickUpService(user.clickup_api_key)
        
        # ID задачи из логов
        task_id = '86c0hhu35'
        
        print(f"🔍 Проверяем структуру комментариев от ClickUp API для задачи {task_id}...")
        
        # Получаем сырые комментарии
        response = clickup_service._make_request('GET', f'/task/{task_id}/comment')
        comments = response.get('comments', [])
        
        print(f"📋 Найдено комментариев: {len(comments)}")
        
        for i, comment in enumerate(comments[:2]):  # Показываем первые 2
            print(f"\n--- Комментарий {i+1} ---")
            print(f"Полная структура: {comment}")
            
            # Проверяем все возможные поля даты
            date_fields = ['date', 'date_created', 'created', 'datetime', 'timestamp', 'date_added']
            for field in date_fields:
                if field in comment:
                    print(f"  📅 Поле '{field}': {comment[field]} (тип: {type(comment[field])})")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
