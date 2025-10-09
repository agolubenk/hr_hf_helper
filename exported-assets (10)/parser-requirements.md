# Техническое задание для analyze_time_with_parser

## 1. Общие требования

### 1.1 Цель
Создать единственный метод `analyze_time_with_parser` для анализа, валидации и коррекции даты и времени из пользовательского ввода с учетом всех возможных форматов, опечаток и ошибок раскладки клавиатуры.

### 1.2 Входные данные
- Строка с произвольным текстом, содержащим дату/время
- Контекст существующих бронирований (для поиска свободных слотов)
- Текущая дата и время

### 1.3 Выходные данные
```python
{
    "parsed_datetime": "DD.MM.YYYY HH:MM",
    "confidence": 0.95,
    "alternatives": [...],
    "corrections": [...],
    "validation": {...},
    "metadata": {...}
}
```

## 2. Конфигурация системы

### 2.1 Бизнес-часы и временные слоты
```python
# Рабочее время: 11:00 - 18:00
BUSINESS_HOURS = {'start': 11, 'end': 18}

# Разрешенные минуты: 00, 15, 30, 45
TIME_SLOTS = [0, 15, 30, 45]

# Валидные временные слоты
VALID_TIME_SLOTS = [
    "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45", 
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45",
    "17:00", "17:15", "17:30", "17:45"
]
```

### 2.2 Правила автокоррекции
- Округление минут до ближайшего разрешенного слота (00, 15, 30, 45)
- Приведение времени к бизнес-часам (11:00-17:45)
- Перенос на следующий доступный день при конфликте
- Исключение прошедших дат и текущего дня

## 3. Этапы обработки текста

### 3.1 Нормализация текста
```python
def normalize_input_text(text):
    """
    1. Приведение к нижнему регистру
    2. Исправление раскладки клавиатуры
    3. Удаление лишних пробелов и символов
    4. Коррекция частых опечаток
    """
    
    # Исправление раскладки
    corrected_text = fix_keyboard_layout(text)
    
    # Исправление опечаток в днях недели и месяцах
    corrected_text = fix_common_typos(corrected_text)
    
    return corrected_text
```

### 3.2 Извлечение компонентов
```python
def extract_date_time_components(text):
    """
    Извлечение компонентов даты и времени из текста
    """
    components = {
        'date': None,      # дата в различных форматах
        'time': None,      # время  
        'weekday': None,   # день недели
        'relative': None,  # относительная дата (завтра, etc)
        'month': None,     # месяц (текстовый)
        'day': None,       # число месяца
        'year': None       # год
    }
    
    # Поиск по регулярным выражениям
    # Использование словарей соответствий
    # Обработка различных форматов
    
    return components
```

### 3.3 Логика парсинга дат

#### 3.3.1 Числовые форматы дат
```python
# Поддерживаемые форматы (НЕ время!)
DATE_FORMATS = [
    r'(\d{1,2})\.(\d{1,2})\.(\d{2,4})',  # DD.MM.YYYY
    r'(\d{1,2})\.(\d{1,2})',             # DD.MM (текущий год)
    r'(\d{1,2})/(\d{1,2})/(\d{2,4})',   # DD/MM/YYYY
    r'(\d{1,2})/(\d{1,2})',             # DD/MM
    r'(\d{1,2})\s*(\d{1,2})',           # DD MM (с пробелом)
    r'(\d{2,4})',                       # DDMM или DDMMYY
]

# ВАЖНО: Отличать от времени!
# 15.30 может быть 15 октября или 15:30
# Контекст определяется по:
# - наличию других временных маркеров
# - диапазону чисел (месяц 1-12, час 0-23)
# - формату (10.10 скорее дата, 15.30 скорее время)
```

#### 3.3.2 Дни недели
```python
def parse_weekday(text):
    """
    Парсинг дней недели с учетом:
    - Полных названий и сокращений
    - Ошибок раскладки клавиатуры  
    - Опечаток
    """
    
    # Примеры обработки
    weekday_mappings = {
        # Стандартные
        'понедельник': 0, 'пн': 0,
        'вторник': 1, 'вт': 1,
        
        # С ошибками раскладки
        'GY': 0,  # ПН на английской раскладке
        'ds': 1,  # вт на английской раскладке
        
        # Английские
        'monday': 0, 'mon': 0,
        'tuesday': 1, 'tue': 1,
        
        # Опечатки
        'пенедельник': 0,
        'втоник': 1,
    }
```

#### 3.3.3 Месяцы
```python
def parse_month(text):
    """
    Парсинг месяцев с поддержкой:
    - Полных названий и всех сокращений
    - Русских и английских вариантов
    - Ошибок раскладки (jrn = окт)
    """
    
    month_mappings = {
        # Русские
        'октябрь': 10, 'окт': 10, 'октября': 10,
        'ноябрь': 11, 'ноя': 11, 'нояб': 11,
        'декабрь': 12, 'дек': 12, 'декабря': 12,
        
        # Английские  
        'october': 10, 'oct': 10,
        'november': 11, 'nov': 11,
        'december': 12, 'dec': 12,
        
        # С ошибками раскладки
        'jrn': 10,      # окт
        'yjz': 11,      # ноя  
        'ltrf,hm': 12   # декабрь
    }
```

### 3.4 Логика парсинга времени
```python
def parse_time(text):
    """
    Парсинг времени с поддержкой различных форматов
    """
    
    time_patterns = [
        r'(\d{1,2})[:\.\-](\d{2})',        # HH:MM, HH.MM, HH-MM
        r'(\d{1,2})\s*(?:ч|час|h)',       # HH час
        r'(\d{1,2})',                      # просто число (час)
        r'(\d{3,4})',                      # HHMM без разделителя
    ]
    
    # Автокоррекция времени
    def round_to_valid_slot(hour, minute):
        """Округление до ближайшего валидного слота"""
        
        # Округление минут до 00, 15, 30, 45
        if minute < 8:
            minute = 0
        elif minute < 23:
            minute = 15
        elif minute < 38:
            minute = 30
        elif minute < 53:
            minute = 45
        else:
            minute = 0
            hour += 1
            
        # Проверка бизнес-часов
        if hour < 11:
            hour = 11
        elif hour > 17:
            hour = 17
            
        return hour, minute
```

## 4. Поиск доступных слотов

### 4.1 Основная логика
```python
def find_available_slot(target_datetime, existing_bookings):
    """
    Поиск ближайшего доступного слота
    
    Алгоритм:
    1. Проверить целевую дату/время
    2. Если занято - найти следующий слот в тот же день недели
    3. Исключить прошедшие даты и текущий день
    4. Предложить альтернативы
    """
    
    # Пример: пользователь написал "ПН 15"
    # Если ближайший понедельник 14.10 в 15:00 занят
    # Предложить понедельник 21.10 в 15:00
    
    if is_slot_available(target_datetime):
        return target_datetime
    else:
        # Поиск следующего доступного слота
        return find_next_available_slot(
            weekday=target_datetime.weekday(),
            time=target_datetime.time(),
            existing_bookings=existing_bookings
        )
```

### 4.2 Примеры поиска слотов
```python
SLOT_SEARCH_EXAMPLES = {
    # Входной текст → результат
    "ПН 15": {
        "target": "понедельник 15:00",
        "result": "14.10.2024 15:00",  # ближайший понедельник
        "alternative": "21.10.2024 15:00"  # если занят
    },
    
    "завтра в 15:30": {
        "target": "09.10.2024 15:30", 
        "result": "09.10.2024 15:30",
        "note": "округлено до валидного слота"
    },
    
    "10.10 16": {
        "target": "10.10.2024 16:00",
        "result": "10.10.2024 16:00",
        "validation": "дата определена как дата, не время"
    }
}
```

## 5. Система валидации

### 5.1 Многоуровневая проверка
```python
def validate_datetime(parsed_datetime):
    """
    Проверка корректности распознанной даты/времени
    """
    
    validation_result = {
        'is_valid': True,
        'errors': [],
        'warnings': [],
        'corrections': []
    }
    
    # Проверки:
    validators = [
        validate_business_hours,    # 11:00-17:45
        validate_time_slots,       # минуты 00,15,30,45
        validate_future_date,      # не прошедшая дата
        validate_not_today,        # не сегодня
        validate_slot_available,   # слот свободен
        validate_date_range        # в пределах 90 дней
    ]
    
    for validator in validators:
        result = validator(parsed_datetime)
        if not result.is_valid:
            validation_result['errors'].extend(result.errors)
            validation_result['is_valid'] = False
            
    return validation_result
```

### 5.2 Автокоррекция ошибок
```python
def auto_correct_datetime(parsed_datetime, validation_result):
    """
    Автоматическое исправление обнаруженных ошибок
    """
    
    corrected_datetime = parsed_datetime
    corrections = []
    
    for error in validation_result['errors']:
        if error['type'] == 'invalid_minutes':
            # Округление минут до валидного слота
            corrected_datetime = round_minutes_to_slot(corrected_datetime)
            corrections.append({
                'type': 'time_rounding',
                'original': str(parsed_datetime),
                'corrected': str(corrected_datetime),
                'reason': 'округление до валидного слота'
            })
            
        elif error['type'] == 'outside_business_hours':
            # Перенос на бизнес-часы
            corrected_datetime = move_to_business_hours(corrected_datetime)
            corrections.append({
                'type': 'business_hours_adjustment', 
                'original': str(parsed_datetime),
                'corrected': str(corrected_datetime),
                'reason': 'перенос в рабочие часы'
            })
            
        elif error['type'] == 'slot_occupied':
            # Поиск следующего свободного слота
            corrected_datetime = find_next_available_slot(corrected_datetime)
            corrections.append({
                'type': 'slot_conflict_resolution',
                'original': str(parsed_datetime),
                'corrected': str(corrected_datetime), 
                'reason': 'слот занят, найден следующий доступный'
            })
    
    return corrected_datetime, corrections
```

## 6. Различение дат и времени

### 6.1 Контекстный анализ
```python
def distinguish_date_from_time(text, numbers):
    """
    Различение форматов даты и времени
    
    Примеры неоднозначности:
    - "15.30" может быть 15 октября или 15:30
    - "10.10" может быть 10 октября или 10:10
    """
    
    # Факторы для определения:
    factors = {
        'has_time_keywords': 'в', 'время', 'часов' in text,
        'has_date_keywords': 'число', 'день', 'дата' in text,
        'number_range': check_number_range(numbers),
        'context_clues': analyze_context(text),
        'format_pattern': analyze_format_pattern(numbers)
    }
    
    # Логика принятия решения
    if factors['number_range']['month_like']:
        return 'date'
    elif factors['number_range']['hour_like']:
        return 'time'  
    elif factors['has_time_keywords']:
        return 'time'
    elif factors['has_date_keywords']:
        return 'date'
    else:
        # Эвристика по умолчанию
        return 'date' if numbers[0] <= 31 else 'time'
```

### 6.2 Примеры различения
```python
DISAMBIGUATION_EXAMPLES = {
    # Четкие случаи
    "10.10": "date",        # день.месяц
    "15:30": "time",        # час:минута
    "в 15.30": "time",      # ключевое слово "в"
    "10 октября": "date",   # месяц указан
    
    # Неоднозначные случаи  
    "15.30": "time",        # скорее время (15 > 12)
    "10.11": "date",        # скорее дата (оба <= 12) 
    "встреча 15.30": "time", # контекст встречи
    "15.30 приходи": "time", # контекст действия
}
```

## 7. Формат выходных данных

### 7.1 Структура ответа
```python
def format_response(parsed_datetime, confidence, alternatives, corrections, validation, metadata):
    """
    Формирование итогового ответа метода
    """
    
    return {
        # Основной результат
        "parsed_datetime": parsed_datetime.strftime("%d.%m.%Y %H:%M"),
        "confidence": confidence,  # 0.0 - 1.0
        
        # Исходные данные
        "original_text": metadata['original_text'],
        "normalized_text": metadata['normalized_text'],
        
        # Альтернативные варианты
        "alternatives": [
            {
                "datetime": alt.strftime("%d.%m.%Y %H:%M"),
                "confidence": alt_confidence,
                "reason": alt_reason
            } for alt in alternatives
        ],
        
        # Примененные исправления
        "corrections": [
            {
                "type": correction_type,  # keyboard_layout, typo, time_rounding
                "original": original_value,
                "corrected": corrected_value,
                "reason": correction_reason
            } for correction in corrections
        ],
        
        # Результаты валидации
        "validation": {
            "is_valid": validation['is_valid'],
            "business_hours": True/False,
            "valid_slot": True/False,
            "future_date": True/False,
            "available": True/False,
            "errors": validation['errors'],
            "warnings": validation['warnings']
        },
        
        # Метаданные обработки
        "metadata": {
            "detected_language": "ru/en/mixed",
            "keyboard_layout": "correct/mixed/wrong", 
            "has_typos": True/False,
            "parsing_method": "regex/nlp/hybrid",
            "processing_time": processing_time_ms,
            "components_found": {
                "date": True/False,
                "time": True/False, 
                "weekday": True/False,
                "relative_date": True/False
            }
        }
    }
```

### 7.2 Примеры ответов
```python
# Пример 1: Успешный парсинг
{
    "parsed_datetime": "14.10.2024 15:00",
    "confidence": 0.95,
    "original_text": "GY 15",
    "normalized_text": "понедельник 15:00",
    "alternatives": [
        {
            "datetime": "21.10.2024 15:00", 
            "confidence": 0.90,
            "reason": "следующий понедельник если текущий занят"
        }
    ],
    "corrections": [
        {
            "type": "keyboard_layout",
            "original": "GY", 
            "corrected": "ПН",
            "reason": "исправление английской раскладки"
        }
    ],
    "validation": {
        "is_valid": True,
        "business_hours": True,
        "valid_slot": True, 
        "future_date": True,
        "available": True,
        "errors": [],
        "warnings": []
    },
    "metadata": {
        "detected_language": "mixed",
        "keyboard_layout": "wrong",
        "has_typos": False,
        "parsing_method": "regex",
        "processing_time": 45,
        "components_found": {
            "date": False,
            "time": True,
            "weekday": True, 
            "relative_date": False
        }
    }
}

# Пример 2: С автокоррекцией времени  
{
    "parsed_datetime": "15.10.2024 15:15",
    "confidence": 0.88,
    "original_text": "завтро 15:12",
    "normalized_text": "завтра 15:12", 
    "alternatives": [],
    "corrections": [
        {
            "type": "typo",
            "original": "завтро",
            "corrected": "завтра", 
            "reason": "исправление опечатки"
        },
        {
            "type": "time_rounding",
            "original": "15:12",
            "corrected": "15:15",
            "reason": "округление до валидного слота"
        }
    ],
    "validation": {
        "is_valid": True,
        "business_hours": True,
        "valid_slot": True,
        "future_date": True, 
        "available": True,
        "errors": [],
        "warnings": ["время округлено до ближайшего слота"]
    },
    "metadata": {
        "detected_language": "ru",
        "keyboard_layout": "correct",
        "has_typos": True,
        "parsing_method": "hybrid",
        "processing_time": 78,
        "components_found": {
            "date": False,
            "time": True,
            "weekday": False,
            "relative_date": True
        }
    }
}
```

## 8. Тестовые случаи

### 8.1 Базовые тесты
```python
TEST_CASES = [
    # Стандартные форматы
    {
        "input": "14.10.2024 15:00",
        "expected": "14.10.2024 15:00",
        "confidence": 1.0
    },
    
    # Дни недели
    {
        "input": "пн 15",
        "expected": "14.10.2024 15:00", # ближайший понедельник
        "confidence": 0.95
    },
    
    # Ошибки раскладки
    {
        "input": "GY 15",  # ПН 15
        "expected": "14.10.2024 15:00",
        "confidence": 0.90,
        "corrections": ["keyboard_layout"]
    },
    
    # Относительные даты
    {
        "input": "завтра в 16:30", 
        "expected": "09.10.2024 16:30",
        "confidence": 0.95
    },
    
    # Автокоррекция времени
    {
        "input": "пн 15:12",
        "expected": "14.10.2024 15:15", # округлено до слота
        "confidence": 0.88,
        "corrections": ["time_rounding"]
    },
    
    # Только дата
    {
        "input": "10.10",
        "expected": "10.10.2024 15:00", # время по умолчанию 
        "confidence": 0.80
    },
    
    # Сложные случаи
    {
        "input": "pfdnhf d 16", # завтра в 16
        "expected": "09.10.2024 16:00",
        "confidence": 0.85,
        "corrections": ["keyboard_layout"]
    }
]
```

### 8.2 Негативные тесты
```python
NEGATIVE_TEST_CASES = [
    # Некорректное время
    {
        "input": "пн 25:00", # час > 23
        "expected_error": "invalid_time",
        "suggested_correction": "пн 17:00"
    },
    
    # Прошедшая дата
    {
        "input": "01.01.2020 15:00",
        "expected_error": "past_date", 
        "suggested_correction": "01.01.2025 15:00"
    },
    
    # Нерабочие часы
    {
        "input": "пн 09:00", # до 11:00
        "expected_error": "outside_business_hours",
        "suggested_correction": "пн 11:00"
    }
]
```

## 9. Производительность и оптимизация

### 9.1 Требования к производительности
- Время обработки: < 100ms для простых случаев
- Время обработки: < 200ms для сложных случаев с коррекцией
- Потребление памяти: < 10MB на запрос
- Поддержка многопоточности

### 9.2 Оптимизации
```python
# Кэширование частых запросов
@lru_cache(maxsize=1000)
def parse_common_patterns(text):
    """Кэширование результатов для частых паттернов"""
    pass

# Предкомпилированные регулярные выражения
COMPILED_PATTERNS = {
    'date': re.compile(r'(\d{1,2})\.(\d{1,2})\.(\d{2,4})'),
    'time': re.compile(r'(\d{1,2})[:\.](\d{2})'),
    'weekday': re.compile(r'(пн|вт|ср|чт|пт|сб|вс|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)')
}

# Быстрый поиск в словарях
FAST_LOOKUPS = {
    'weekdays': dict(WEEKDAYS),
    'months': dict(MONTHS), 
    'keyboard_fixes': dict(KEYBOARD_MAPPING)
}
```

Этот метод `analyze_time_with_parser` станет единственной точкой входа для анализа всех форматов даты и времени, обеспечивая высокую точность, гибкость и производительность.