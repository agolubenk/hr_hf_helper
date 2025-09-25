
# ИСПРАВЛЕНИЕ для views.py - функция determine_action_type_from_text

def determine_action_type_from_text(text):
    """Определение типа действия из текста"""
    if not text:
        return "hrscreening"

    import re

    # Паттерны для дат
    date_patterns = [
        r'(\d{4}-\d{1,2}-\d{1,2})',  # 2025-09-15
        r'(\d{2}\.\d{2}\.\d{4})',    # 15.09.2025
        r'(\d{2}\d{2}\d{4})'         # 15092025
    ]

    # Паттерны для времени
    time_patterns = [
        r'(\d{1,2}:\d{2})',          # 14:00, 9:30
        r'(\d{1,2}\d{2}\d{4})',      # 140000
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
    has_hr_indicators = any(re.search(r'\b' + re.escape(indicator.lower()) + r'\b', text.lower()) for indicator in hr_indicators)

    text_length = len(text.strip())

    # ОБНОВЛЕННАЯ ЛОГИКА определения (такая же как в forms.py)
    if has_hr_indicators:
        return "hrscreening"  # 1. HR-индикаторы - HR-скрининг
    elif any(re.search(r'\b' + re.escape(keyword.lower()) + r'\b', text.lower()) 
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
