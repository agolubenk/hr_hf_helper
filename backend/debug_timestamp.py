import os
from datetime import datetime

# Тестируем timestamp из логов
timestamps = [1727956665844, 1727956640278, 1727954950435, 1727774187957]

print("🔍 Тестируем парсинг timestamp'ов:")
for ts in timestamps:
    print(f"\nTimestamp: {ts}")
    print(f"Тип: {type(ts)}")
    
    # Проверяем, больше ли 1e12
    if ts > 1e12:
        print(f"Больше 1e12: Да")
        converted = ts / 1000
        print(f"После деления на 1000: {converted}")
        
        try:
            dt = datetime.fromtimestamp(converted)
            print(f"Результат: {dt}")
        except Exception as e:
            print(f"Ошибка: {e}")
    else:
        print(f"Больше 1e12: Нет")
        try:
            dt = datetime.fromtimestamp(ts)
            print(f"Результат: {dt}")
        except Exception as e:
            print(f"Ошибка: {e}")
