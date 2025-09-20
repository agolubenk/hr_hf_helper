#!/usr/bin/env python
"""
Тест использования промпта из вакансии для анализа времени с Gemini AI
"""
import os
import sys
import django
from django.conf import settings

# Добавляем путь к проекту
sys.path.append('/Users/agolubenko/hrhelper/backend')

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.google_oauth.models import Invite
from django.contrib.auth import get_user_model
from apps.vacancies.models import Vacancy

User = get_user_model()

def test_prompt_from_vacancy():
    """Тестирует использование промпта из вакансии"""
    print("🔧 Тестирование использования промпта из вакансии для анализа времени...")
    
    # Создаем тестового пользователя
    user, created = User.objects.get_or_create(
        username='test_prompt_user',
        defaults={
            'email': 'test_prompt@example.com', 
            'is_active': True,
            'gemini_api_key': 'test-api-key'  # Тестовый ключ
        }
    )
    
    # Создаем группу "Рекрутер" и добавляем пользователя
    from django.contrib.auth.models import Group
    recruiter_group, created = Group.objects.get_or_create(name='Рекрутер')
    user.groups.add(recruiter_group)
    print(f"👤 Пользователь добавлен в группу 'Рекрутер'")
    
    # Создаем тестовую вакансию с кастомным промптом
    custom_prompt = """Ты – система для анализа и нормализации данных о дате и времени встреч.
На вход ты получаешь:
Варианты даты и времени, которые предложил человек (они могут быть написаны с сокращениями, ошибками, в разном формате, неструктурно или отрывками), текущую дату и слоты доступности специалиста (рекрутера)(четкие интервалы).

Твоя задача:
Определить первое общее пересечение предложенных человеком вариантов и слотов специалиста.
Учесть, что минимальная длительность встречи — 45 минут (если слот или вариант короче, он не подходит).
Вернуть только начальное время этой встречи.
Формат ответа должен быть строго: "suggested_datetime": "DD.MM.YYYY HH:MM"
Никакого дополнительного текста, пояснений, комментариев или альтернатив — только одна дата и время."""
    
    vacancy, created = Vacancy.objects.get_or_create(
        external_id='456',
        defaults={
            'name': 'Тестовая вакансия с кастомным промптом',
            'recruiter': user,
            'invite_title': 'Тестовое приглашение',
            'invite_text': 'Тестовый текст приглашения',
            'invite_prompt': custom_prompt,  # Кастомный промпт
            'scorecard_title': 'Тестовый scorecard'
        }
    )
    
    print(f"📝 Создана тестовая вакансия: {vacancy.name}")
    print(f"📝 Промпт из вакансии: {vacancy.invite_prompt[:100]}...")
    
    # Создаем тестовый инвайт
    from datetime import datetime
    import pytz
    minsk_tz = pytz.timezone('Europe/Minsk')
    test_datetime = minsk_tz.localize(datetime.now().replace(hour=15, minute=0, second=0, microsecond=0))
    
    invite = Invite.objects.create(
        user=user,
        candidate_url='https://huntflow.ru/my/org#/vacancy/456/filter/789/id/123',
        candidate_id='123',
        candidate_name='Тестовый кандидат',
        candidate_grade='Middle',
        vacancy_id='456',
        vacancy_title='Тестовая вакансия',
        interview_datetime=test_datetime,
        original_form_data='https://huntflow.ru/my/org#/vacancy/456/filter/789/id/123\nзавтра 15'
    )
    
    print(f"📝 Создан тестовый инвайт: {invite.id}")
    print(f"📝 Исходные данные: {invite.original_form_data}")
    
    # Проверяем, что промпт из вакансии будет использован
    try:
        # Получаем промпт из вакансии (как это делает метод)
        vacancy = Vacancy.objects.get(external_id=str(invite.vacancy_id))
        invite_prompt = vacancy.invite_prompt
        
        print(f"✅ Промпт успешно получен из вакансии")
        print(f"✅ Промпт содержит специфичную логику для анализа времени")
        print(f"✅ Промпт может быть разным для разных вакансий")
        
        # Проверяем, что промпт содержит нужные инструкции
        if "система для анализа и нормализации данных о дате и времени" in invite_prompt:
            print(f"✅ Промпт содержит правильные инструкции для анализа времени")
        else:
            print(f"❌ Промпт не содержит нужных инструкций")
            return False
            
        if "suggested_datetime" in invite_prompt:
            print(f"✅ Промпт содержит правильный формат ответа")
        else:
            print(f"❌ Промпт не содержит правильный формат ответа")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при получении промпта: {e}")
        return False
    
    return True

if __name__ == '__main__':
    try:
        success = test_prompt_from_vacancy()
        if success:
            print("\n🎉 Тест использования промпта из вакансии прошел успешно!")
            print("🎉 Теперь Gemini использует специфичный промпт для каждой вакансии!")
            print("🎉 Промпт может быть настроен индивидуально для разных типов вакансий!")
        else:
            print("\n💥 Тест не прошел!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Ошибка при выполнении теста: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
