# Переделка таблицы списка событий календаря

## Требования пользователя

Пользователь запросил изменить структуру таблицы списка событий:

1. **Название встречи:** Только название и статус, без описания
2. **Время:** Отдельные столбцы для начала и окончания
3. **Google Meet:** Вместо столбца "Место" - ссылка на Google Meet
4. **Описание:** Отдельный столбец для описания встречи
5. **Участники:** Количество участников

## Изменения в шаблоне

### 1. Заголовки таблицы

**Файл:** `backend/templates/google_oauth/calendar_events.html`

```html
<!-- БЫЛО: -->
<thead>
    <tr>
        <th>Название</th>
        <th>Время</th>
        <th>Место</th>
        <th>Статус</th>
        <th>Календарь</th>
        <th>Участники</th>
    </tr>
</thead>

<!-- СТАЛО: -->
<thead>
    <tr>
        <th>Название встречи</th>
        <th>Начало</th>
        <th>Окончание</th>
        <th>Google Meet</th>
        <th>Описание</th>
        <th>Участники</th>
    </tr>
</thead>
```

### 2. Содержимое строк таблицы

#### Название встречи + Статус
```html
<td>
    <div class="d-flex align-items-center">
        <strong>{{ event.title }}</strong>
        <div class="ms-2">
            {% if event.status == 'confirmed' %}
                <span class="badge bg-success">Подтверждено</span>
            {% elif event.status == 'tentative' %}
                <span class="badge bg-warning">Предварительно</span>
            {% elif event.status == 'cancelled' %}
                <span class="badge bg-danger">Отменено</span>
            {% else %}
                <span class="badge bg-secondary">{{ event.status }}</span>
            {% endif %}
        </div>
    </div>
</td>
```

#### Время начала
```html
<td>
    <div class="small">
        {{ event.start_datetime|date:"d.m.Y H:i" }}
        {% if event.is_all_day %}
            <br><span class="badge bg-info">Весь день</span>
        {% endif %}
    </div>
</td>
```

#### Время окончания
```html
<td>
    <div class="small">
        {{ event.end_datetime|date:"d.m.Y H:i" }}
    </div>
</td>
```

#### Google Meet
```html
<td>
    {% if event.meet_link %}
        <a href="{{ event.meet_link }}" target="_blank" class="btn btn-sm btn-outline-success">
            <i class="fab fa-google-meet me-1"></i>
            Google Meet
        </a>
    {% else %}
        <span class="text-muted">-</span>
    {% endif %}
</td>
```

#### Описание
```html
<td>
    {% if event.description %}
        <div class="small text-muted" style="max-width: 200px;">
            {{ event.description|truncatechars:100 }}
        </div>
    {% else %}
        <span class="text-muted">-</span>
    {% endif %}
</td>
```

#### Участники
```html
<td>
    {% if event.attendees %}
        <span class="badge bg-info">{{ event.attendees|length }}</span>
    {% else %}
        <span class="text-muted">-</span>
    {% endif %}
</td>
```

## Изменения в view

### Улучшение извлечения Google Meet ссылок

**Файл:** `backend/apps/google_oauth/views.py`

```python
# БЫЛО:
meet_link = None
if 'conferenceData' in event_data:
    if 'entryPoints' in event_data['conferenceData']:
        for entry_point in event_data['conferenceData']['entryPoints']:
            if entry_point.get('entryPointType') == 'video':
                meet_link = entry_point.get('uri')
                break

# СТАЛО:
meet_link = None
# Сначала проверяем hangoutLink (более простой способ)
if 'hangoutLink' in event_data and event_data['hangoutLink']:
    meet_link = event_data['hangoutLink']
# Если нет hangoutLink, проверяем conferenceData
elif 'conferenceData' in event_data:
    if 'entryPoints' in event_data['conferenceData']:
        for entry_point in event_data['conferenceData']['entryPoints']:
            if entry_point.get('entryPointType') == 'video':
                meet_link = entry_point.get('uri')
                break
```

## Результаты изменений

### ✅ Новая структура таблицы

| Название встречи | Начало | Окончание | Google Meet | Описание | Участники |
|------------------|--------|-----------|-------------|-----------|-----------|
| JS Tech Screening | 09.09.2025 11:00 | 09.09.2025 12:00 | [Google Meet] | Техническое интервью... | 3 |
| Обед | 09.09.2025 12:00 | 09.09.2025 13:00 | - | - | - |

### ✅ Улучшения

1. **Чистое название:** Только название встречи и статус
2. **Отдельные столбцы времени:** Начало и окончание в разных столбцах
3. **Google Meet ссылки:** Кнопки для быстрого перехода в видеоконференцию
4. **Описание:** Отдельный столбец с ограниченной шириной
5. **Участники:** Количество участников в виде бейджа

### ✅ Google Meet интеграция

- **hangoutLink:** Приоритетный способ получения ссылки
- **conferenceData:** Резервный способ через entryPoints
- **Кнопка:** Стилизованная кнопка с иконкой Google Meet
- **Новая вкладка:** Ссылки открываются в новой вкладке

## Тестирование

### 1. Проверка view
```bash
python manage.py test_views
```

**Результат:**
```
📅 Тестируем calendar:
  Status: 200
  ✅ Calendar загружен успешно
```

### 2. Проверка данных Google Meet
```python
from apps.google_oauth.cache_service import GoogleAPICache
events = GoogleAPICache.get_calendar_events(3, 'primary', 100)
event = events[0] if events else None
print('HangoutLink:', event.get('hangoutLink', 'None'))
print('ConferenceData:', event.get('conferenceData', 'None'))
```

**Результат:**
```
HangoutLink: https://meet.google.com/yiq-buab-zyz
ConferenceData: {'entryPoints': [...], 'conferenceSolution': {...}}
```

### 3. Проверка страницы
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/google-oauth/calendar/
# Результат: 302 (требует авторизации - нормально)
```

## Архитектура решения

### Поток данных
```
Google Calendar API → Cache → View (обработка meet_link) → Template (отображение)
```

### Структура данных события
```python
event_obj = {
    'title': 'Название встречи',
    'status': 'confirmed',           # Статус в названии
    'start_datetime': datetime,      # Отдельный столбец
    'end_datetime': datetime,        # Отдельный столбец
    'meet_link': 'https://meet...',  # Google Meet ссылка
    'description': 'Описание...',    # Отдельный столбец
    'attendees': [...],              # Количество участников
}
```

### Отображение в таблице
1. **Название + Статус:** В одной ячейке с бейджем
2. **Время:** Два отдельных столбца
3. **Google Meet:** Кнопка или прочерк
4. **Описание:** Ограниченная ширина с обрезкой
5. **Участники:** Бейдж с количеством

## Заключение

Таблица списка событий календаря успешно переделана согласно требованиям:

- ✅ **Название встречи:** Только название и статус
- ✅ **Время:** Отдельные столбцы для начала и окончания
- ✅ **Google Meet:** Ссылки на видеоконференции
- ✅ **Описание:** Отдельный столбец с ограниченной шириной
- ✅ **Участники:** Количество в виде бейджа
- ✅ **Улучшенная читаемость:** Более структурированное отображение

Теперь таблица событий более информативна и удобна для использования! 🎉
