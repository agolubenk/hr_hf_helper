import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.services import ClickUpService
from apps.huntflow.services import HuntflowService

User = get_user_model()

def main():
    try:
        user = User.objects.filter(username='andrei.golubenko').first()
        if not user:
            print("❌ Пользователь 'andrei.golubenko' не найден")
            return
        
        clickup_service = ClickUpService(user.clickup_api_key)
        huntflow_service = HuntflowService(user)
        
        # ID задачи из логов
        task_id = '86c0hhu35'
        
        print(f"🔍 Тестируем исправления для задачи {task_id}...")
        
        # 1. Проверяем парсинг дат в комментариях
        print("\n1️⃣ Тестируем парсинг дат в комментариях:")
        try:
            comments = clickup_service.get_task_comments(task_id)
            print(f"   Комментариев: {len(comments)}")
            for i, comment in enumerate(comments[:2]):  # Показываем первые 2
                print(f"   {i+1}. Дата: {comment.get('date')}")
                print(f"      Текст: {comment.get('comment', '')[:50]}...")
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
        
        # 2. Проверяем создание комментария с ссылкой на задачу
        print("\n2️⃣ Тестируем создание комментария с ссылкой:")
        try:
            task_details = clickup_service.get_task(task_id)
            task_description = task_details.get('description', '')
            task_status = task_details.get('status', '')
            
            # Получаем комментарии
            comments = clickup_service.get_task_comments(task_id)
            
            # Тестируем создание комментария
            clickup_comment = huntflow_service._create_clickup_comment(
                task_description=task_description,
                task_comments=comments,
                task_status=task_status,
                task_id=task_id
            )
            
            print(f"   📝 Созданный комментарий:")
            print(f"   {clickup_comment}")
            
            # Проверяем наличие ссылки
            if f'https://app.clickup.com/t/{task_id}' in clickup_comment:
                print("   ✅ Ссылка на задачу ClickUp найдена!")
            else:
                print("   ❌ Ссылка на задачу ClickUp НЕ найдена")
                
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            import traceback
            traceback.print_exc()
        
        # 3. Проверяем извлечение ссылок на Google Sheets
        print("\n3️⃣ Тестируем извлечение ссылок на Google Sheets:")
        try:
            google_sheets_links = huntflow_service._extract_google_sheets_links_from_comments(comments)
            print(f"   📊 Найденные ссылки: {google_sheets_links}")
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
