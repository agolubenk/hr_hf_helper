#!/usr/bin/env python
"""
Тест исправленной логики комбинированной формы
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

from apps.google_oauth.forms import InviteCombinedForm
from django.contrib.auth import get_user_model
from apps.vacancies.models import Vacancy

User = get_user_model()

def test_fixed_logic():
    """Тестирует исправленную логику комбинированной формы"""
    print("🔧 Тестирование исправленной логики комбинированной формы...")
    
    # Создаем тестового пользователя
    user, created = User.objects.get_or_create(
        username='test_fixed_user',
        defaults={
            'email': 'test_fixed@example.com', 
            'is_active': True,
            'gemini_api_key': 'test-api-key'  # Тестовый ключ
        }
    )
    
    # Создаем группу "Рекрутер" и добавляем пользователя
    from django.contrib.auth.models import Group
    recruiter_group, created = Group.objects.get_or_create(name='Рекрутер')
    user.groups.add(recruiter_group)
    print(f"👤 Пользователь добавлен в группу 'Рекрутер'")
    
    # Создаем тестовую вакансию с промптом
    vacancy, created = Vacancy.objects.get_or_create(
        external_id='123',
        defaults={
            'name': 'Тестовая вакансия',
            'recruiter': user,
            'invite_title': 'Тестовое приглашение',
            'invite_text': 'Тестовый текст приглашения',
            'scorecard_title': 'Тестовый scorecard',
            'invite_prompt': 'Создай приглашение на интервью для кандидата {candidate_name} на позицию {vacancy_title}. Время интервью: {interview_datetime}.'
        }
    )
    
    print(f"📝 Создана тестовая вакансия: {vacancy.name}")
    
    # Тестовые данные с относительным временем
    test_data = {
        'combined_data': 'https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789\nзавтра 15'
    }
    
    # Создаем форму
    form = InviteCombinedForm(data=test_data, user=user)
    
    print(f"📝 Тестовые данные: {test_data}")
    
    # Проверяем валидность
    is_valid = form.is_valid()
    print(f"🔍 Форма валидна: {is_valid}")
    
    if not is_valid:
        print(f"❌ Ошибки формы: {form.errors}")
        return False
    
    print("✅ Форма прошла валидацию! URL извлечен, дата будет обработана Gemini.")
    print("✅ Логика исправлена: форма не требует точного формата даты на этапе валидации.")
    
    return True

if __name__ == '__main__':
    try:
        success = test_fixed_logic()
        if success:
            print("\n🎉 Тест исправленной логики прошел успешно!")
            print("🎉 Теперь форма принимает относительные даты типа 'завтра 15'!")
        else:
            print("\n💥 Тест не прошел!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Ошибка при выполнении теста: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

