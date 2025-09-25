# Создадим полный код для исправления проблем

# Создаем исправленные файлы
fixes_code = {
    'forms_py_determine_action_type_fix.py': '''
# ИСПРАВЛЕНИЕ для forms.py - метод determine_action_type класса CombinedForm

def determine_action_type(self, combined_data=None):
    """Определение типа действия: инвайт или HR-скрининг"""
    if combined_data is None:
        combined_data = self.cleaned_data.get('combined_data', '')
    
    # Очистка данных от URL Huntflow
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
        'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс',
        'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
        'понедел', 'вторн', 'среди', 'четверг', 'пятни', 'субботу', 'воскрес',
        'MN', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'
    ]
    
    # НОВОЕ: Относительные даты
    relative_dates = [
        'сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера',
        'сёдня', 'зафтра', 'послезафтра', 'вчира', 'позавчира'
    ]
    
    # НОВОЕ: Времена суток
    time_periods = [
        'утром', 'днем', 'днём', 'вечером', 'ночью', 
        'утра', 'дня', 'вечера', 'ночи',
        'с утра', 'в обед', 'обед'
    ]
    
    # Индикаторы встреч и интервью
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
        'senior', 'junior', 'middle', 'lead', 'head',
        'навыки', 'skills', 'технологии', 'technologies',
        'образование', 'education', 'университет', 'институт',
        'резюме', 'cv', 'resume'
    ]
    
    # Проверка условий
    has_date = any(re.search(pattern, combined_data, re.IGNORECASE) for pattern in date_patterns)
    has_time = any(re.search(pattern, combined_data, re.IGNORECASE) for pattern in time_patterns)
    has_weekday = any(day.lower() in combined_data.lower() for day in weekdays)
    # НОВОЕ: Проверка относительных дат и времен суток
    has_relative_date = any(rel_date in combined_data.lower() for rel_date in relative_dates)
    has_time_period = any(period in combined_data.lower() for period in time_periods)
    has_meeting_indicators = any(indicator.lower() in combined_data.lower() for indicator in meeting_indicators)
    has_hr_indicators = any(re.search(r'\\b' + re.escape(indicator.lower()) + r'\\b', combined_data.lower()) for indicator in hr_indicators)
    
    # Убираем URL из подсчета длины текста
    lines = combined_data.split('\\n')
    non_url_lines = [line.strip() for line in lines if line.strip() and 'huntflow' not in line.lower() and 'vacancy' not in line]
    text_length = sum(len(line) for line in non_url_lines)
    
    print(f"[DETERMINE_ACTION_TYPE] Анализируем текст длиной {text_length}")
    print(f"[DETERMINE_ACTION_TYPE] has_date: {has_date}")
    print(f"[DETERMINE_ACTION_TYPE] has_time: {has_time}")
    print(f"[DETERMINE_ACTION_TYPE] has_weekday: {has_weekday}")
    print(f"[DETERMINE_ACTION_TYPE] has_relative_date: {has_relative_date}")  # НОВОЕ
    print(f"[DETERMINE_ACTION_TYPE] has_time_period: {has_time_period}")      # НОВОЕ
    print(f"[DETERMINE_ACTION_TYPE] has_meeting_indicators: {has_meeting_indicators}")
    print(f"[DETERMINE_ACTION_TYPE] has_hr_indicators: {has_hr_indicators}")
    print(f"[DETERMINE_ACTION_TYPE] text_length: {text_length}")
    print(f"[DETERMINE_ACTION_TYPE] non_url_lines: {non_url_lines}")
    
    # ОБНОВЛЕННАЯ ЛОГИКА определения типа действия
    
    # 1. Если есть явные HR-индикаторы - это HR-скрининг
    if has_hr_indicators:
        print("[DETERMINE_ACTION_TYPE] Результат: hrscreening (HR-индикаторы)")
        return "hrscreening"
    
    # 2. Если есть ключевые слова уровней - это HR-скрининг  
    elif any(re.search(r'\\b' + re.escape(keyword.lower()) + r'\\b', combined_data.lower()) 
             for keyword in ['senior', 'junior', 'middle', 'lead', 'head', 'trainee']):
        print("[DETERMINE_ACTION_TYPE] Результат: hrscreening (ключевые слова уровней)")
        return "hrscreening"
        
    # 3. ОБНОВЛЕНО: Если есть указания на время (включая относительные даты и времена суток) - это инвайт
    elif (has_date or has_time or has_weekday or has_relative_date or has_time_period) and text_length < 200:
        print("[DETERMINE_ACTION_TYPE] Результат: invite (временные указания)")
        return "invite"
        
    # 4. Если есть индикаторы встреч без HR-индикаторов - это инвайт
    elif has_meeting_indicators and not has_hr_indicators:
        print("[DETERMINE_ACTION_TYPE] Результат: invite (индикаторы встреч)")
        return "invite"
        
    # 5. Если короткий текст - это HR-скрининг
    elif text_length < 100:
        print("[DETERMINE_ACTION_TYPE] Результат: hrscreening (короткий текст)")
        return "hrscreening"
        
    # 6. По умолчанию - HR-скрининг
    else:
        print("[DETERMINE_ACTION_TYPE] Результат: hrscreening (по умолчанию)")
        return "hrscreening"
''',

    'views_py_determine_action_type_fix.py': '''
# ИСПРАВЛЕНИЕ для views.py - функция determine_action_type_from_text

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
    
    # НОВОЕ: Относительные даты
    relative_dates = [
        'сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера',
        'сёдня', 'зафтра', 'послезафтра', 'вчира', 'позавчира'
    ]
    
    # НОВОЕ: Времена суток  
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
    # НОВОЕ: Проверка относительных дат и времен суток
    has_relative_date = any(rel_date in text.lower() for rel_date in relative_dates)
    has_time_period = any(period in text.lower() for period in time_periods)
    has_meeting_indicators = any(indicator.lower() in text.lower() for indicator in meeting_indicators)
    has_hr_indicators = any(re.search(r'\\b' + re.escape(indicator.lower()) + r'\\b', text.lower()) for indicator in hr_indicators)
    
    text_length = len(text.strip())
    
    # ОБНОВЛЕННАЯ ЛОГИКА определения (такая же как в forms.py)
    if has_hr_indicators:
        return "hrscreening"  # 1. HR-индикаторы - HR-скрининг
    elif any(re.search(r'\\b' + re.escape(keyword.lower()) + r'\\b', text.lower()) 
             for keyword in ['senior', 'junior', 'middle', 'lead', 'head', 'trainee']):
        return "hrscreening"  # 2. Ключевые слова уровней - HR-скрининг
    # ОБНОВЛЕНО: добавлены has_relative_date и has_time_period
    elif (has_date or has_time or has_weekday or has_relative_date or has_time_period):
        return "invite"       # 3. Временные указания - инвайт
    elif has_meeting_indicators and not has_hr_indicators:
        return "invite"       # 4. Индикаторы встреч без HR - инвайт
    elif text_length < 100:
        return "hrscreening"  # 5. Короткий текст - HR-скрининг
    else:
        return "hrscreening"  # 6. По умолчанию - HR-скрининг
''',

    'models_py_tech_screening_fix.py': '''
# ДОБАВЛЕНИЕ в models.py в класс Invite

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
        
        # ID статуса Tech Screening (нужно получить через Huntflow API или настройки)
        # TODO: Получить актуальный ID статуса Tech Screening через API
        tech_screening_status_id = 3459  # Замените на актуальный ID
        
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

# ИЗМЕНЕНИЕ в методе create_google_drive_structure:
# После строки:
# calendar_success = self.create_calendar_event()
# print(f"[CALENDAR_SUCCESS] {calendar_success}")

# ДОБАВИТЬ:
if calendar_success:
    # Обновляем статус на Tech Screening при создании инвайта со scorecard
    tech_screening_success = self.update_candidate_status_to_tech_screening()
    print(f"[TECH_SCREENING_UPDATE] Статус обновлен: {tech_screening_success}")

# self.update_candidate_status_to_tech_screening()
return True, f"Создана структура: {folder_path}. Scorecard и событие созданы."
'''
}

# Сохраняем исправления в файлы
for filename, content in fixes_code.items():
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("📁 Созданы файлы с исправлениями:")
for filename in fixes_code.keys():
    print(f"   • {filename}")

print("\n✅ КРАТКОЕ РЕЗЮМЕ ИСПРАВЛЕНИЙ:")
print("\n🔧 ПРОБЛЕМА 1: Неправильное определение типа действия")
print("   ❌ 'сегодня вечером' определялось как HR-скрининг")
print("   ✅ Добавлена поддержка относительных дат и времен суток")
print("   ✅ Теперь 'сегодня вечером' корректно определяется как инвайт")

print("\n🔧 ПРОБЛЕМА 2: Отсутствие обновления статуса на Tech Screening")
print("   ❌ При создании инвайта статус оставался прежним")
print("   ✅ Добавлен метод update_candidate_status_to_tech_screening()")
print("   ✅ Автоматическое обновление статуса после создания scorecard")

print("\n📋 ИНСТРУКЦИИ ПО ВНЕДРЕНИЮ:")
print("   1. Скопировать исправленный код determine_action_type в forms.py")
print("   2. Скопировать исправленный код determine_action_type_from_text в views.py")
print("   3. Добавить метод update_candidate_status_to_tech_screening в models.py")
print("   4. Добавить вызов обновления статуса в create_google_drive_structure")
print("   5. Проверить и настроить ID статуса Tech Screening в Huntflow")