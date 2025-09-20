#!/usr/bin/env python
"""
Тест для отладки интеграции с Gemini AI
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

def test_debug_gemini():
    """Тестирует отладку интеграции с Gemini AI"""
    print("🔧 Тестирование отладки интеграции с Gemini AI...")
    
    # Используем существующего авторизованного пользователя
    user = User.objects.filter(google_oauth_account__isnull=False).first()
    if not user:
        print("❌ Нет пользователей с Google авторизацией!")
        return False
    
    print(f"👤 Используем пользователя: {user.username} (email: {user.email})")
    
    # Создаем группу "Рекрутер" и добавляем пользователя
    from django.contrib.auth.models import Group
    recruiter_group, created = Group.objects.get_or_create(name='Рекрутер')
    user.groups.add(recruiter_group)
    print(f"👤 Пользователь добавлен в группу 'Рекрутер'")
    
    # Создаем тестовую вакансию с кастомным промптом
    custom_prompt = """Ты — система для анализа и нормализации данных о дате и времени встреч.

ЗАПРЕЩЕНО: НЕ ПИШИ КОД! НЕ ПИШИ ФУНКЦИИ! НЕ ПИШИ ПРОГРАММЫ!

Твоя задача: проанализировать данные и вернуть ТОЛЬКО JSON с временем встречи.

Правила анализа:
1. Найди первое совпадение между временем пользователя и слотами специалиста
2. Минимальная длительность встречи: 45 минут
3. Старт только по целым часам (11:00, 12:00, 13:00...)
4. Игнорируй прошедшие даты

Формат ответа:
- Если найдено совпадение: {"suggested_datetime": "DD.MM.YYYY HH:MM"}
- Если не найдено: {"suggested_datetime": ""}

ВАЖНО: Верни ТОЛЬКО JSON! Никакого кода, объяснений или дополнительного текста!"""
    
    vacancy, created = Vacancy.objects.get_or_create(
        external_id='999',
        defaults={
            'name': 'Тестовая вакансия для отладки',
            'recruiter': user,
            'invite_title': 'Тестовое приглашение',
            'invite_text': 'Тестовый текст приглашения',
            'invite_prompt': custom_prompt,  # Кастомный промпт
            'scorecard_title': 'Тестовый scorecard'
        }
    )
    
    print(f"📝 Создана тестовая вакансия: {vacancy.name}")
    print(f"📝 Промпт из вакансии: {vacancy.invite_prompt[:100]}...")
    
    # Создаем тестовый инвайт с реальными данными
    from datetime import datetime
    import pytz
    minsk_tz = pytz.timezone('Europe/Minsk')
    test_datetime = minsk_tz.localize(datetime.now().replace(hour=15, minute=0, second=0, microsecond=0))
    
    # Реальные данные, которые отправил пользователь
    real_form_data = """https://sandbox.huntflow.dev/my/org499#/vacancy/3/filter/workon/id/17
ПН 10-13
ВТ 15-17
Ср весь день"""
    
    invite = Invite.objects.create(
        user=user,
        candidate_url='https://sandbox.huntflow.dev/my/org499#/vacancy/3/filter/workon/id/17',
        candidate_id='17',
        candidate_name='Тестовый кандидат',
        candidate_grade='Middle',
        vacancy_id='999',
        vacancy_title='Тестовая вакансия',
        interview_datetime=test_datetime,
        original_form_data=real_form_data
    )
    
    print(f"📝 Создан тестовый инвайт: {invite.id}")
    print(f"📝 Исходные данные: {invite.original_form_data}")
    
    # Тестируем метод анализа времени
    try:
        print(f"🤖 Тестируем метод analyze_time_with_gemini()...")
        print(f"🤖 Это покажет полный промпт и ответ от Gemini")
        
        # Вызываем метод (он покажет полный промпт в логах)
        success, message = invite.analyze_time_with_gemini()
        
        if success:
            print(f"✅ Анализ времени прошел успешно: {message}")
            print(f"✅ Предложенное время: {invite.gemini_suggested_datetime}")
        else:
            print(f"❌ Анализ времени не прошел: {message}")
        
    except Exception as e:
        print(f"❌ Ошибка при тестировании: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    try:
        success = test_debug_gemini()
        if success:
            print("\n🎉 Тест отладки завершен!")
            print("🎉 Проверьте логи выше для анализа промпта и ответа от Gemini!")
        else:
            print("\n💥 Тест не прошел!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Ошибка при выполнении теста: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
