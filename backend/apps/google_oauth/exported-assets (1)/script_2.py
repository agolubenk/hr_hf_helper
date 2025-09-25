# Создадим также исправленный код для views.py
views_py_fix = '''
def determine_action_type_from_text(text):
    """Определение типа действия из текста"""
    if not text:
        return "hrscreening"
    
    import re
    
    # Паттерны для дат
    date_patterns = [
        r'(\\d{4}-\\d{1,2}-\\d{1,2})',  # 2025-09-15
        r'(\\d{2}\\.\\d{2}\\.\\d{4})',    # 15.09.2025
        r'(\\d{2}\\d{2}\\d{4})'         # 15092025
    ]
    
    # Паттерны для времени
    time_patterns = [
        r'(\\d{1,2}:\\d{2})',          # 14:00, 9:30
        r'(\\d{1,2}\\d{2}\\d{4})',      # 140000
    ]
    
    # Дни недели
    weekdays = [
        'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'
    ]
    
    # Относительные даты
    relative_dates = [
        'сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера',
        'сёдня', 'зафтра', 'послезафтра', 'вчира', 'позавчира'
    ]
    
    # Времена суток  
    time_periods = [
        'утром', 'днем', 'днём', 'вечером', 'ночью',
        'утра', 'дня', 'вечера', 'ночи', 
        'с утра', 'в обед', 'обед'
    ]
    
    # Индикаторы встреч
    meeting_indicators = [
        'встреча', 'интервью', 'собеседование', 'созвон', 'звонок',
        'техническое', 'technical', 'скрининг', 'screening',
        'инвайт', 'invite', 'приглашение',
        'meeting', 'interview', 'call', 'schedule', 'time', 'date'
    ]
    
    # HR индикаторы
    hr_indicators = [
        'зарплата', 'заработная', 'оклад', 'salary', 'wage', 'pay',
        'byn', 'usd', '$', 'руб', 'рублей', 'долларов',
        'опыт', 'стаж', 'experience', 'работал', 'работала',
        'senior', 'junior', 'middle', 'lead', 'head', 'trainee',
        'навыки', 'skills', 'технологии', 'technologies',
        'образование', 'education', 'университет', 'институт',
        'резюме', 'cv', 'resume'
    ]
    
    # Проверка условий
    has_date = any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)
    has_time = any(re.search(pattern, text, re.IGNORECASE) for pattern in time_patterns)  
    has_weekday = any(day.lower() in text.lower() for day in weekdays)
    has_relative_date = any(rel_date in text.lower() for rel_date in relative_dates)
    has_time_period = any(period in text.lower() for period in time_periods)
    has_meeting_indicators = any(indicator.lower() in text.lower() for indicator in meeting_indicators)
    has_hr_indicators = any(re.search(r'\\b' + re.escape(indicator.lower()) + r'\\b', text.lower()) for indicator in hr_indicators)
    
    text_length = len(text.strip())
    
    # Логика определения (такая же как в forms.py)
    if has_hr_indicators:
        return "hrscreening"  # 1. HR-индикаторы - HR-скрининг
    elif any(re.search(r'\\b' + re.escape(keyword.lower()) + r'\\b', text.lower()) 
             for keyword in ['senior', 'junior', 'middle', 'lead', 'head', 'trainee']):
        return "hrscreening"  # 2. Ключевые слова уровней - HR-скрининг
    elif (has_date or has_time or has_weekday or has_relative_date or has_time_period):
        return "invite"       # 3. Временные указания - инвайт
    elif has_meeting_indicators and not has_hr_indicators:
        return "invite"       # 4. Индикаторы встреч без HR - инвайт
    elif text_length < 100:
        return "hrscreening"  # 5. Короткий текст - HR-скрининг
    else:
        return "hrscreening"  # 6. По умолчанию - HR-скрининг
'''

print("📝 Создан исправленный код для views.py")

# Теперь создадим код для добавления функции обновления статуса на Tech Screening
tech_screening_update = '''
# В models.py в классе Invite добавить метод:

def update_candidate_status_to_tech_screening(self):
    """Обновление статуса кандидата на Tech Screening в Huntflow"""
    try:
        from apps.huntflow.services import HuntflowService
        from apps.vacancies.models import Vacancy
        from datetime import datetime, timezone, timedelta
        import re
        
        print(f"[TECH_SCREENING] Обновляем статус кандидата {self.candidate_id}")
        
        # Получаем account_id пользователя
        account_id = self.get_user_account_id()
        if not account_id:
            print("[TECH_SCREENING] Не удалось получить account_id")
            return False
        
        # ID статуса Tech Screening (получить через API или настройки)
        tech_screening_status_id = 3459  # Замените на актуальный ID Tech Screening
        
        # Формируем комментарий в формате "Четверг, 25 сентября⋅11:00–11:45"
        comment = self.get_formatted_interview_datetime()
        print(f"[TECH_SCREENING] Кандидат: {self.candidate_id} -> Tech Screening")
        print(f"[TECH_SCREENING] Комментарий: {comment}")
        
        service = HuntflowService(self.user)
        result = service.update_applicant_status(
            account_id=account_id,
            applicant_id=int(self.candidate_id),
            status_id=tech_screening_status_id,
            comment=comment,
            vacancy_id=int(self.vacancy_id) if self.vacancy_id else None
        )
        
        if result:
            print(f"[TECH_SCREENING] Успешно обновлен статус на Tech Screening")
            return True
        else:
            print(f"[TECH_SCREENING] Ошибка при обновлении статуса")
            return False
            
    except Exception as e:
        print(f"[TECH_SCREENING] Исключение: {str(e)}")
        return False

# В методе create_google_drive_structure добавить вызов:
# После успешного создания scorecard и календарного события:

if calendar_success:
    # Обновляем статус на Tech Screening
    tech_screening_success = self.update_candidate_status_to_tech_screening()
    print(f"[TECH_SCREENING] Статус обновлен: {tech_screening_success}")

return True, f"Создана структура: {folder_path}. Scorecard и событие созданы."
'''

print("📝 Создан код для обновления статуса на Tech Screening")
print("\n🎯 Что нужно сделать:")
print("   1. Заменить функцию determine_action_type в forms.py")
print("   2. Заменить функцию determine_action_type_from_text в views.py")
print("   3. Добавить метод update_candidate_status_to_tech_screening в models.py")
print("   4. Добавить вызов обновления статуса после создания scorecard")
print("   5. Проверить ID статуса Tech Screening через Huntflow API")

# Создадим тест исправленной функции
print(f"\n🧪 ТЕСТ ИСПРАВЛЕННОЙ ФУНКЦИИ:")
def test_determine_action_type(text):
    # Относительные даты
    relative_dates = [
        'сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера',
        'сёдня', 'зафтра', 'послезафтра', 'вчира', 'позавчира'
    ]
    
    # Времена суток  
    time_periods = [
        'утром', 'днем', 'днём', 'вечером', 'ночью',
        'утра', 'дня', 'вечера', 'ночи', 
        'с утра', 'в обед', 'обед'
    ]
    
    has_relative_date = any(rel_date in text.lower() for rel_date in relative_dates)
    has_time_period = any(period in text.lower() for period in time_periods)
    
    if has_relative_date or has_time_period:
        return "invite"
    else:
        return "hrscreening"

test_cases = [
    "сегодня вечером",
    "завтра утром", 
    "ПТ 18",
    "понедельник в 14:00",
    "зарплата 800 долларов",
    "опыт работы 3 года"
]

for test in test_cases:
    result = test_determine_action_type(test)
    print(f"   '{test}' -> {result}")