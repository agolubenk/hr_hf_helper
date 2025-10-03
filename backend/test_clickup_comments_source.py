import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clickup_int.services import ClickUpService
from apps.clickup_int.models import ClickUpTask

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
        
        print(f"🔍 Проверяем источники комментариев для задачи {task_id}...")
        
        # 1. Проверяем комментарии через API
        print("\n1️⃣ Комментарии через API:")
        try:
            comments_api = clickup_service.get_task_comments(task_id)
            print(f"   Комментариев через API: {len(comments_api)}")
            for i, comment in enumerate(comments_api):
                print(f"   {i+1}. {comment}")
        except Exception as e:
            print(f"   ❌ Ошибка получения комментариев через API: {e}")
        
        # 2. Проверяем комментарии в детальной информации о задаче
        print("\n2️⃣ Комментарии в детальной информации:")
        try:
            task_details = clickup_service.get_task(task_id)
            comments_details = task_details.get('comments', [])
            print(f"   Комментариев в деталях: {len(comments_details)}")
            for i, comment in enumerate(comments_details):
                print(f"   {i+1}. {comment}")
        except Exception as e:
            print(f"   ❌ Ошибка получения детальной информации: {e}")
        
        # 3. Проверяем комментарии в базе данных
        print("\n3️⃣ Комментарии в базе данных:")
        try:
            task_db = ClickUpTask.objects.filter(task_id=task_id, user=user).first()
            if task_db:
                print(f"   Задача найдена в БД: {task_db.name}")
                # Проверяем, есть ли комментарии в custom fields
                custom_fields = task_db.custom_fields
                if isinstance(custom_fields, str):
                    import json
                    custom_fields = json.loads(custom_fields)
                
                print(f"   Custom fields: {custom_fields}")
                
                # Ищем поле "Комментарии"
                for field in custom_fields:
                    if field.get('name') == 'Комментарии' and field.get('value'):
                        print(f"   🎯 НАЙДЕНЫ КОММЕНТАРИИ В CUSTOM FIELDS: {field.get('value')}")
                        break
            else:
                print("   ❌ Задача не найдена в базе данных")
        except Exception as e:
            print(f"   ❌ Ошибка работы с БД: {e}")
        
        # 4. Проверяем, как получаются комментарии в transfer_to_huntflow
        print("\n4️⃣ Симуляция transfer_to_huntflow:")
        try:
            task_db = ClickUpTask.objects.filter(task_id=task_id, user=user).first()
            if task_db:
                attachments = clickup_service.get_task_attachments(task_id)
                comments = clickup_service.get_task_comments(task_id)
                
                print(f"   Вложения: {len(attachments)}")
                print(f"   Комментарии через API: {len(comments)}")
                
                # Подготавливаем данные задачи как в transfer_to_huntflow
                task_data = {
                    'id': task_id,  # Добавляем ID задачи
                    'name': task_db.name,
                    'description': task_db.description,
                    'status': task_db.status,
                    'attachments': attachments,
                    'comments': comments,
                    'assignees': json.loads(task_db.assignees) if isinstance(task_db.assignees, str) else task_db.assignees,
                    'custom_fields': task_db.custom_fields
                }
                
                print(f"   📋 Подготовленные данные задачи:")
                print(f"      - ID: {task_data.get('id')}")
                print(f"      - Название: {task_data.get('name')}")
                print(f"      - Комментарии: {len(task_data.get('comments', []))}")
                print(f"      - Custom fields: {len(task_data.get('custom_fields', []))}")
                
                # Проверяем, есть ли комментарии в custom fields
                custom_fields = task_data.get('custom_fields', [])
                for field in custom_fields:
                    if field.get('name') == 'Комментарии' and field.get('value'):
                        print(f"   🎯 КОММЕНТАРИИ В CUSTOM FIELDS: {field.get('value')[:100]}...")
                        
                        # Если комментарии есть в custom fields, но нет в API, добавляем их
                        if not comments:
                            print(f"   💡 Добавляем комментарии из custom fields к API комментариям")
                            # Можно добавить логику для извлечения комментариев из custom fields
                        break
            else:
                print("   ❌ Задача не найдена в базе данных")
        except Exception as e:
            print(f"   ❌ Ошибка симуляции: {e}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
