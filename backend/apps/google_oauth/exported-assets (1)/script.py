# Анализ проблемы с определением типа действия

# Пример из чата: "сегодня вечером"
test_text = "сегодня вечером"

print("🧪 АНАЛИЗ ПРОБЛЕМЫ: определение типа действия")
print(f"Текст для анализа: '{test_text}'")

import re

# Паттерны из кода
date_patterns = [
    r'(\d{4}-\d{1,2}-\d{1,2})',  # 2025-09-15
    r'(\d{2}\.\d{2}\.\d{4})',    # 15.09.2025
    r'(\d{2}\d{2}\d{4})'         # 15092025
]

time_patterns = [
    r'(\d{1,2}:\d{2})',          # 14:00, 9:30
    r'(\d{1,2}\d{2}\d{4})',      # 140000
]

weekdays = [
    'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс',
    'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    'понедел', 'вторн', 'среди', 'четверг', 'пятни', 'субботу', 'воскрес',
    'MN', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'
]

# Проверяем каждое условие
has_date = any(re.search(pattern, test_text, re.IGNORECASE) for pattern in date_patterns)
has_time = any(re.search(pattern, test_text, re.IGNORECASE) for pattern in time_patterns)
has_weekday = any(day in test_text.lower() for day in weekdays)

print(f"\n📊 Результаты проверки:")
print(f"   has_date: {has_date}")
print(f"   has_time: {has_time}")
print(f"   has_weekday: {has_weekday}")

# Проверяем относительные даты
relative_dates = ['сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера']
has_relative_date = any(rel_date in test_text.lower() for rel_date in relative_dates)
print(f"   has_relative_date: {has_relative_date}")

# Проверяем времена суток
time_periods = ['утром', 'днем', 'днём', 'вечером', 'ночью', 'утра', 'дня', 'вечера', 'ночи']
has_time_period = any(period in test_text.lower() for period in time_periods)
print(f"   has_time_period: {has_time_period}")

text_length = len(test_text.strip())
print(f"   text_length: {text_length}")

# Логика определения из кода
if has_date or has_time or has_weekday and text_length < 200:
    action_type = "invite"
elif text_length < 100:
    action_type = "hrscreening"  
else:
    action_type = "hrscreening"

print(f"\n🎯 Определенный тип: {action_type}")

print("\n❌ ПРОБЛЕМА:")
print("   Логика не учитывает относительные даты ('сегодня') и времена суток ('вечером')")
print("   Только проверяет конкретные форматы дат и времени")
print("   'сегодня вечером' должно быть invite, но определяется как hrscreening")

print("\n💡 РЕШЕНИЕ:")
print("   Добавить проверку на относительные даты и времена суток в условие для invite")