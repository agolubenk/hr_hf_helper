
# ИСПРАВЛЕНИЕ для forms.py - метод determine_action_type класса CombinedForm

def determine_action_type(self, combined_data=None):
    """Определение типа действия: инвайт или HR-скрининг"""
    if combined_data is None:
        combined_data = self.cleaned_data.get('combined_data', '')

    # Очистка данных от URL Huntflow
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
    has_hr_indicators = any(re.search(r'\b' + re.escape(indicator.lower()) + r'\b', combined_data.lower()) for indicator in hr_indicators)

    # Убираем URL из подсчета длины текста
    lines = combined_data.split('\n')
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
    elif any(re.search(r'\b' + re.escape(keyword.lower()) + r'\b', combined_data.lower()) 
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
