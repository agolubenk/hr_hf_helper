# Документация Google OAuth Chat

## Обзор

Страница `http://localhost:8000/google-oauth/chat/` представляет собой интерактивный чат-интерфейс для HR-скрининга и отправки инвайтов кандидатам. Система позволяет HR-менеджерам автоматизировать процесс оценки кандидатов через интеллектуальный чат с поддержкой различных команд и действий.

## Архитектура системы

### Модели данных

#### ChatSession
```python
class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=200, blank=True, verbose_name="Название чата")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")
```

#### ChatMessage
```python
class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('user', 'Пользователь'),
        ('system', 'Система'),
        ('hr_screening', 'HR-скрининг'),
        ('invite', 'Инвайт'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField(verbose_name="Содержимое")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Связи с созданными объектами
    hr_screening = models.ForeignKey('HRScreening', on_delete=models.SET_NULL, null=True, blank=True)
    invite = models.ForeignKey('Invite', on_delete=models.SET_NULL, null=True, blank=True)
```

### URL-маршруты

```python
# Основной чат
path('chat/', views.chat_workflow, name='chat_workflow'),

# Чат с конкретной сессией
path('chat/<int:session_id>/', views.chat_workflow, name='chat_workflow_session'),

# AJAX обработчик
path('chat/<int:session_id>/ajax/', views.chat_ajax_handler, name='chat_ajax_handler'),
```

## Логика работы

### 1. Инициализация чата

#### Получение или создание сессии
```python
def chat_workflow(request, session_id=None):
    if session_id:
        try:
            chat_session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            # Если указанная сессия не найдена, берем последнюю сессию пользователя
            chat_session = ChatSession.objects.filter(user=request.user).order_by('-updated_at').first()
            if not chat_session:
                chat_session = ChatSession.objects.create(user=request.user)
    else:
        # Если session_id не указан, берем последнюю сессию пользователя
        chat_session = ChatSession.objects.filter(user=request.user).order_by('-updated_at').first()
        if not chat_session:
            chat_session = ChatSession.objects.create(user=request.user)
```

### 2. Обработка сообщений

#### AJAX обработчик
```python
def chat_ajax_handler(request, session_id):
    """Обработка AJAX запросов для чата"""
    
    # Валидация запроса
    if request.method != 'POST' or request.content_type != 'application/json':
        return JsonResponse({'success': False, 'error': 'Неверный тип запроса'})
    
    # Парсинг данных
    data = json.loads(request.body)
    message_text = data.get('text', '').strip()
    action_type_from_js = data.get('action_type', '')
    
    # Сохранение пользовательского сообщения
    user_message = ChatMessage.objects.create(
        session=chat_session,
        message_type='user',
        content=message_text
    )
```

### 3. Система команд и приоритеты

#### Иерархия приоритетов определения типа действия:

1. **Команды (высший приоритет)** - обрабатываются первыми
2. **JavaScript определение** - если команды нет, используется тип из JS
3. **Автоматическое определение** - если JS не определил тип

#### Команды чата

##### `/s` - Принудительный HR-скрининг
```python
elif message_text.strip().lower().startswith('/s'):
    action_type = 'hrscreening'
    print(f"🔍 CHAT AJAX: Команда /s обнаружена - принудительный HR-скрининг")
    message_text = message_text[2:].strip()  # Убираем команду из текста
```

**Логика обработки:**
- Принудительно устанавливает тип действия как `hrscreening`
- Удаляет команду `/s` из текста сообщения
- Остальной текст обрабатывается как данные для HR-скрининга
- Игнорирует все другие индикаторы (время, даты, ключевые слова)

**Примеры использования:**
- `/s https://huntflow.ru/applicants/12345` → HR-скрининг кандидата
- `/s Оценить кандидата Иванова` → HR-скрининг с дополнительной информацией

##### `/in` - Принудительный инвайт
```python
elif message_text.strip().lower().startswith('/in'):
    action_type = 'invite'
    print(f"🔍 CHAT AJAX: Команда /in обнаружена - принудительный инвайт")
    message_text = message_text[3:].strip()  # Убираем команду из текста
```

**Логика обработки:**
- Принудительно устанавливает тип действия как `invite`
- Удаляет команду `/in` из текста сообщения
- Остальной текст обрабатывается как данные для создания инвайта
- Игнорирует все другие индикаторы

**Примеры использования:**
- `/in Встреча с кандидатом завтра в 14:00` → Создание инвайта
- `/in Пригласить на интервью в пятницу` → Создание инвайта

##### `/del` - Удаление последнего действия
```python
if message_text.strip().lower().startswith('/del'):
    action_type = 'delete_last'
    print(f"🔍 CHAT AJAX: Команда /del обнаружена - удаление последнего действия")
```

**Логика обработки:**
- Находит последнее действие в чате (HR-скрининг или инвайт)
- Выполняет полную очистку данных:
  - Удаляет объект из базы данных
  - Отменяет календарные события
  - Удаляет файлы из Google Drive
  - Возвращает статус кандидата в Huntflow
- Создает системное сообщение с отчетом об удалении

**Ограничения:**
- Команда может быть использована только один раз подряд
- Нельзя удалить команду удаления
- Требует наличия предыдущего действия для удаления

**Примеры использования:**
- `/del` → Удаление последнего HR-скрининга или инвайта

##### `/t` - Команда времени (планируется)
```python
# Планируемая команда для работы с временными слотами
elif message_text.strip().lower().startswith('/t'):
    action_type = 'time_management'
    # Логика будет реализована в будущем
```

**Планируемая функциональность:**
- Просмотр доступных временных слотов
- Бронирование времени для встреч
- Управление календарем

### 4. Автоматическое определение типа действия

#### Алгоритм определения (функция `determine_action_type_from_text`)

```python
def determine_action_type_from_text(text):
    # 1. HR-индикаторы (высший приоритет)
    if has_hr_indicators:
        return "hrscreening"
    
    # 2. Ключевые слова уровней
    elif any(keyword in text.lower() for keyword in ['senior', 'junior', 'middle', 'lead', 'head', 'trainee']):
        return "hrscreening"
    
    # 3. Временные указания
    elif (has_date or has_time or has_weekday or has_relative_date or has_time_period):
        return "invite"
    
    # 4. Индикаторы встреч без HR
    elif has_meeting_indicators and not has_hr_indicators:
        return "invite"
    
    # 5. Короткий текст
    elif text_length < 100:
        return "hrscreening"
    
    # 6. По умолчанию
    else:
        return "hrscreening"
```

#### Паттерны для анализа

##### Временные паттерны
```python
# Даты
date_patterns = [
    r'(\d{4}-\d{1,2}-\d{1,2})',  # 2025-09-15
    r'(\d{2}\.\d{2}\.\d{4})',    # 15.09.2025
    r'(\d{2}\d{2}\d{4})'         # 15092025
]

# Время
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

# Относительные даты
relative_dates = [
    'сегодня', 'завтра', 'послезавтра', 'вчера', 'позавчера',
    'сёдня', 'зафтра', 'послезавтра', 'вчира', 'позавчира'
]

# Времена суток
time_periods = [
    'утром', 'днем', 'вечером', 'ночью',
    'morning', 'afternoon', 'evening', 'night'
]
```

##### HR-индикаторы
```python
hr_indicators = [
    'скрининг', 'оценка', 'кандидат', 'резюме', 'cv',
    'screening', 'evaluation', 'candidate', 'resume'
]
```

##### Индикаторы встреч
```python
meeting_indicators = [
    'встреча', 'интервью', 'собеседование', 'инвайт', 'приглашение',
    'meeting', 'interview', 'invite', 'invitation'
]
```

### 5. Обработка исключительных случаев

#### Ошибки валидации
```python
# Пустое сообщение
if not message_text:
    return JsonResponse({'success': False, 'error': 'Пустое сообщение'})

# Неверный тип запроса
if request.method != 'POST' or request.content_type != 'application/json':
    return JsonResponse({'success': False, 'error': 'Неверный тип запроса'})
```

#### Ошибки сессии
```python
try:
    chat_session = ChatSession.objects.get(id=session_id, user=request.user)
except ChatSession.DoesNotExist:
    return JsonResponse({'success': False, 'error': 'Сессия чата не найдена'})
```

#### Ошибки команды удаления
```python
# Проверка на повторное использование команды /del
if last_message and last_message.message_type == 'delete':
    ChatMessage.objects.create(
        session=chat_session,
        message_type='system',
        content="⚠️ **Команда удаления уже была выполнена**\n\nКоманда `/del` может быть использована только один раз подряд."
    )
```

#### Ошибки интеграций
```python
try:
    # Операции с внешними сервисами
    calendar_service.delete_event(event_id)
except Exception as e:
    print(f"⚠️ Ошибка удаления календарного события: {e}")
    result['changes'].append(f"Ошибка удаления календарного события: {str(e)}")
```

### 6. Обработка действий

#### HR-скрининг (`action_type == 'hrscreening'`)

**Последовательность обработки:**

1. **Извлечение данных кандидата**
   ```python
   # Парсинг ссылки на кандидата из Huntflow
   candidate_url = extract_huntflow_url(message_text)
   candidate_id = extract_candidate_id(candidate_url)
   
   # Получение данных кандидата через Huntflow API
   candidate_data = huntflow_service.get_candidate(candidate_id)
   ```

2. **Создание HR-скрининга**
   ```python
   hr_screening = HRScreening.objects.create(
       user=request.user,
       candidate_id=candidate_id,
       candidate_name=candidate_data.get('name'),
       candidate_email=candidate_data.get('email'),
       vacancy_id=selected_vacancy.id,
       status='pending',
       raw_data=message_text
   )
   ```

3. **Анализ кандидата через Gemini AI**
   ```python
   # Отправка данных в Gemini для анализа
   analysis_result = gemini_service.analyze_candidate(
       candidate_data=candidate_data,
       vacancy_requirements=selected_vacancy.requirements,
       questions=selected_vacancy.questions
   )
   
   # Обновление HR-скрининга результатами анализа
   hr_screening.analysis_result = analysis_result
   hr_screening.status = 'completed'
   hr_screening.save()
   ```

4. **Создание системного сообщения**
   ```python
   ChatMessage.objects.create(
       session=chat_session,
       message_type='hr_screening',
       content=f"✅ **HR-скрининг завершен**\n\n**Кандидат:** {candidate_name}\n**Вакансия:** {vacancy_name}\n**Оценка:** {analysis_result.score}/10",
       hr_screening=hr_screening,
       metadata={
           'candidate_name': candidate_name,
           'vacancy_name': vacancy_name,
           'score': analysis_result.score
       }
   )
   ```

**Исключительные случаи:**
- Неверная ссылка на кандидата → Ошибка валидации
- Кандидат не найден в Huntflow → Ошибка API
- Ошибка анализа Gemini → Повторная попытка или ручная обработка

#### Отправка инвайтов (`action_type == 'invite'`)

**Последовательность обработки:**

1. **Извлечение временных данных**
   ```python
   # Парсинг даты и времени из текста
   parsed_datetime = parse_datetime_from_text(message_text)
   
   # Извлечение информации о кандидате
   candidate_info = extract_candidate_info(message_text)
   ```

2. **Создание календарного события**
   ```python
   # Создание события в Google Calendar
   calendar_event = calendar_service.create_event(
       title=f"Интервью с {candidate_name}",
       start_time=parsed_datetime,
       duration=60,  # 1 час по умолчанию
       description=generate_interview_description(candidate_info, vacancy_info)
   )
   ```

3. **Создание инвайта**
   ```python
   invite = Invite.objects.create(
       user=request.user,
       candidate_id=candidate_id,
       candidate_name=candidate_name,
       candidate_email=candidate_email,
       vacancy_id=selected_vacancy.id,
       interview_datetime=parsed_datetime,
       google_calendar_event_id=calendar_event['id'],
       status='pending'
   )
   ```

4. **Генерация и отправка scorecard**
   ```python
   # Создание scorecard в Google Drive
   scorecard_file = drive_service.create_scorecard(
       candidate_name=candidate_name,
       vacancy_name=vacancy_name,
       interview_datetime=parsed_datetime
   )
   
   invite.scorecard_file_id = scorecard_file['id']
   invite.save()
   ```

5. **Отправка уведомлений**
   ```python
   # Уведомление в Telegram
   telegram_service.send_invite_notification(
       candidate_name=candidate_name,
       interview_datetime=parsed_datetime,
       scorecard_link=scorecard_file['webViewLink']
   )
   
   # Email уведомление (если настроено)
   email_service.send_invite_email(
       candidate_email=candidate_email,
       interview_datetime=parsed_datetime,
       meeting_link=calendar_event['hangoutLink']
   )
   ```

6. **Обновление статуса в Huntflow**
   ```python
   # Изменение статуса кандидата на "Interview"
   huntflow_service.update_candidate_status(
       candidate_id=candidate_id,
       status='interview'
   )
   ```

**Исключительные случаи:**
- Неверный формат даты/времени → Запрос уточнения
- Конфликт времени в календаре → Предложение альтернативных слотов
- Ошибка создания scorecard → Повторная попытка
- Ошибка отправки уведомлений → Логирование и ручная отправка

#### Удаление последнего действия (`action_type == 'delete_last'`)

**Последовательность обработки:**

1. **Поиск последнего действия**
   ```python
   last_action = ChatMessage.objects.filter(
       session=chat_session,
       message_type__in=['hrscreening', 'invite']
   ).order_by('-created_at').first()
   ```

2. **Определение типа действия и выполнение отката**
   
   **Для HR-скрининга:**
   ```python
   if last_action.message_type == 'hrscreening':
       hr_screening = last_action.hr_screening
       
       # Удаление из базы данных
       hr_screening.delete()
       
       # Откат статуса в Huntflow (если был изменен)
       if hr_screening.huntflow_status_changed:
           huntflow_service.revert_candidate_status(
               candidate_id=hr_screening.candidate_id,
               previous_status=hr_screening.previous_status
           )
   ```

   **Для инвайта:**
   ```python
   if last_action.message_type == 'invite':
       invite = last_action.invite
       
       # Удаление календарного события
       if invite.google_calendar_event_id:
           calendar_service.delete_event(invite.google_calendar_event_id)
       
       # Удаление scorecard из Google Drive
       if invite.scorecard_file_id:
           drive_service.delete_file(invite.scorecard_file_id)
       
       # Откат статуса в Huntflow
       huntflow_service.update_candidate_status(
           candidate_id=invite.candidate_id,
           status='contact'  # Возврат к предыдущему статусу
       )
       
       # Удаление из базы данных
       invite.delete()
   ```

3. **Создание отчета об удалении**
   ```python
   ChatMessage.objects.create(
       session=chat_session,
       message_type='system',
       content=f"🗑️ **Действие удалено**\n\n**Тип:** {action_type}\n**Кандидат:** {candidate_name}\n**Изменения:**\n{format_changes(changes)}",
       metadata={
           'action_type': action_type,
           'candidate_name': candidate_name,
           'changes': changes
       }
   )
   ```

**Исключительные случаи:**
- Нет действий для удаления → Информационное сообщение
- Ошибка удаления календарного события → Частичный откат
- Ошибка отката статуса в Huntflow → Уведомление о необходимости ручного исправления

### 7. Приоритеты и логика принятия решений

#### Иерархия приоритетов системы

**1. Команды (Приоритет 1 - Высший)**
```
/s → Принудительный HR-скрининг
/in → Принудительный инвайт  
/del → Удаление последнего действия
/t → Управление временем (планируется)
```

**Логика обработки команд:**
- Команды обрабатываются **до** любого другого анализа
- Команда удаляется из текста перед дальнейшей обработкой
- Игнорируются все автоматические определения и JavaScript типы

**2. JavaScript определение (Приоритет 2)**
```javascript
// Если команды нет, используется тип из JavaScript
if (action_type_from_js) {
    action_type = action_type_from_js
}
```

**Логика JavaScript определения:**
- Анализирует текст в реальном времени
- Использует эвристические алгоритмы
- Может быть переопределен командами

**3. Автоматическое определение (Приоритет 3 - Низший)**
```python
# Только если нет команд и JavaScript определения
action_type = determine_action_type_from_text(message_text)
```

#### Алгоритм принятия решений

**Шаг 1: Проверка команд**
```python
if message_text.strip().lower().startswith('/del'):
    return 'delete_last'
elif message_text.strip().lower().startswith('/s'):
    return 'hrscreening'  
elif message_text.strip().lower().startswith('/in'):
    return 'invite'
elif message_text.strip().lower().startswith('/t'):
    return 'time_management'
```

**Шаг 2: Проверка JavaScript определения**
```python
if action_type_from_js:
    return action_type_from_js
```

**Шаг 3: Автоматическое определение**
```python
# Анализ текста по паттернам
if has_hr_indicators:
    return 'hrscreening'
elif has_time_indicators:
    return 'invite'
else:
    return 'hrscreening'  # По умолчанию
```

#### Логика обработки конфликтов

**Конфликт: Команда vs JavaScript**
```
Решение: Команда имеет приоритет
Пример: /s встреча завтра → HR-скрининг (не инвайт)
```

**Конфликт: Команда vs Автоматическое определение**
```
Решение: Команда имеет приоритет  
Пример: /in ссылка на кандидата → Инвайт (не HR-скрининг)
```

**Конфликт: JavaScript vs Автоматическое определение**
```
Решение: JavaScript имеет приоритет
Пример: JS определил "invite", но текст содержит HR-слова → Инвайт
```

#### Специальные случаи обработки

**Пустое сообщение:**
```python
if not message_text:
    return JsonResponse({'success': False, 'error': 'Пустое сообщение'})
```

**Только команда без параметров:**
```python
# /s без текста
if message_text.strip().lower() == '/s':
    return JsonResponse({'success': False, 'error': 'Укажите данные для HR-скрининга'})

# /in без текста  
if message_text.strip().lower() == '/in':
    return JsonResponse({'success': False, 'error': 'Укажите данные для инвайта'})
```

**Команда удаления без действий:**
```python
if action_type == 'delete_last' and not last_action:
    return JsonResponse({'success': False, 'error': 'В чате нет действий для удаления'})
```

#### Логика обработки ошибок

**Ошибки валидации (Приоритет 1):**
- Пустое сообщение
- Неверный формат запроса
- Отсутствие сессии чата

**Ошибки команд (Приоритет 2):**
- Команда без параметров
- Неверная команда
- Повторное использование /del

**Ошибки интеграций (Приоритет 3):**
- Ошибки API внешних сервисов
- Проблемы с календарем
- Ошибки отправки уведомлений

**Ошибки данных (Приоритет 4):**
- Неверная ссылка на кандидата
- Неверный формат даты/времени
- Отсутствие обязательных полей

#### Стратегии восстановления после ошибок

**Критические ошибки (требуют остановки):**
```python
# Ошибки безопасности
if not request.user.has_perm('google_oauth.view_hrscreening'):
    raise PermissionDenied

# Ошибки сессии
if not chat_session:
    return JsonResponse({'success': False, 'error': 'Сессия чата не найдена'})
```

**Восстанавливаемые ошибки (повторная попытка):**
```python
# Ошибки API
try:
    result = external_api.call()
except APIError as e:
    if e.retryable:
        return retry_with_backoff()
    else:
        return handle_permanent_error(e)
```

**Частичные ошибки (продолжение с уведомлением):**
```python
# Ошибка отправки уведомления
try:
    send_notification()
except NotificationError:
    log_error("Уведомление не отправлено")
    # Продолжаем выполнение основного действия
```

#### Логика логирования и мониторинга

**Уровни логирования:**
```python
# DEBUG - Детальная информация
print(f"🔍 CHAT AJAX: Анализируем сообщение: '{message_text}'")

# INFO - Важные события  
print(f"✅ HR-скрининг завершен для кандидата {candidate_name}")

# WARNING - Потенциальные проблемы
print(f"⚠️ Ошибка удаления календарного события: {e}")

# ERROR - Критические ошибки
print(f"❌ Критическая ошибка: {critical_error}")
```

**Метрики для мониторинга:**
- Количество обработанных команд
- Время выполнения операций
- Частота ошибок по типам
- Успешность интеграций

### 8. Планируемая функциональность

#### Команда `/t` - Управление временем

**Планируемые подкоманды:**
```python
# /t show - Показать доступные слоты
elif message_text.strip().lower().startswith('/t show'):
    action_type = 'show_time_slots'
    
# /t book - Забронировать время
elif message_text.strip().lower().startswith('/t book'):
    action_type = 'book_time_slot'
    
# /t free - Освободить время
elif message_text.strip().lower().startswith('/t free'):
    action_type = 'free_time_slot'
    
# /t sync - Синхронизировать с календарем
elif message_text.strip().lower().startswith('/t sync'):
    action_type = 'sync_calendar'
```

**Функциональность:**

**1. Просмотр доступных слотов (`/t show`)**
```python
def show_available_slots(user, date_range=None):
    """
    Показывает доступные временные слоты для интервью
    
    Args:
        user: Пользователь
        date_range: Диапазон дат (по умолчанию - следующие 7 дней)
    
    Returns:
        list: Список доступных слотов
    """
    # Получение занятых слотов из Google Calendar
    busy_slots = calendar_service.get_busy_times(user, date_range)
    
    # Генерация свободных слотов
    available_slots = generate_free_slots(busy_slots, user.working_hours)
    
    return available_slots
```

**2. Бронирование времени (`/t book`)**
```python
def book_time_slot(user, datetime, duration=60):
    """
    Бронирует временной слот для интервью
    
    Args:
        user: Пользователь
        datetime: Дата и время
        duration: Продолжительность в минутах
    
    Returns:
        dict: Результат бронирования
    """
    # Проверка доступности слота
    if not is_slot_available(datetime, duration):
        return {'success': False, 'error': 'Слот недоступен'}
    
    # Создание временного события
    temp_event = calendar_service.create_temporary_event(
        title="Зарезервировано для интервью",
        start_time=datetime,
        duration=duration
    )
    
    return {'success': True, 'event_id': temp_event['id']}
```

**3. Освобождение времени (`/t free`)**
```python
def free_time_slot(user, datetime):
    """
    Освобождает забронированный временной слот
    
    Args:
        user: Пользователь
        datetime: Дата и время для освобождения
    
    Returns:
        dict: Результат операции
    """
    # Поиск временного события
    temp_event = find_temporary_event(user, datetime)
    
    if temp_event:
        # Удаление события
        calendar_service.delete_event(temp_event['id'])
        return {'success': True, 'message': 'Слот освобожден'}
    else:
        return {'success': False, 'error': 'Слот не найден'}
```

**4. Синхронизация календаря (`/t sync`)**
```python
def sync_calendar(user):
    """
    Синхронизирует локальные данные с Google Calendar
    
    Args:
        user: Пользователь
    
    Returns:
        dict: Результат синхронизации
    """
    try:
        # Получение всех событий из календаря
        calendar_events = calendar_service.get_all_events(user)
        
        # Обновление локальной базы данных
        update_local_calendar_data(user, calendar_events)
        
        return {'success': True, 'synced_events': len(calendar_events)}
    except Exception as e:
        return {'success': False, 'error': str(e)}
```

**Интеграция с существующими командами:**

**Связь с `/in` (инвайты):**
```python
# При создании инвайта автоматически проверяется доступность времени
if action_type == 'invite':
    # Проверка доступности через /t функциональность
    if not is_slot_available(parsed_datetime, 60):
        return JsonResponse({
            'success': False, 
            'error': 'Время недоступно. Используйте /t show для просмотра свободных слотов'
        })
```

**Связь с `/del` (удаление):**
```python
# При удалении инвайта автоматически освобождается время
if action_type == 'delete_last' and last_action.message_type == 'invite':
    # Освобождение временного слота
    free_time_slot(user, invite.interview_datetime)
```

#### Расширенные возможности планирования

**1. Автоматическое предложение времени**
```python
def suggest_optimal_time(candidate_preferences, interviewer_schedule):
    """
    Предлагает оптимальное время для интервью на основе предпочтений
    
    Args:
        candidate_preferences: Предпочтения кандидата
        interviewer_schedule: Расписание интервьюера
    
    Returns:
        list: Рекомендуемые временные слоты
    """
    # Анализ предпочтений кандидата
    preferred_times = analyze_candidate_preferences(candidate_preferences)
    
    # Поиск пересечений с доступным временем
    optimal_slots = find_intersections(preferred_times, interviewer_schedule)
    
    # Ранжирование по приоритету
    ranked_slots = rank_slots_by_priority(optimal_slots)
    
    return ranked_slots[:3]  # Топ-3 варианта
```

**2. Умное планирование встреч**
```python
def smart_scheduling(candidate_data, vacancy_requirements):
    """
    Автоматически планирует встречу на основе данных кандидата
    
    Args:
        candidate_data: Данные кандидата
        vacancy_requirements: Требования вакансии
    
    Returns:
        dict: Планируемая встреча
    """
    # Определение типа интервью
    interview_type = determine_interview_type(candidate_data, vacancy_requirements)
    
    # Расчет необходимого времени
    duration = calculate_interview_duration(interview_type)
    
    # Поиск оптимального времени
    optimal_time = find_optimal_time_slot(duration, candidate_data.timezone)
    
    return {
        'datetime': optimal_time,
        'duration': duration,
        'type': interview_type,
        'participants': get_required_participants(interview_type)
    }
```

**3. Интеграция с внешними календарями**
```python
def sync_external_calendars(user):
    """
    Синхронизирует данные с внешними календарными системами
    
    Args:
        user: Пользователь
    
    Returns:
        dict: Результат синхронизации
    """
    external_calendars = [
        'outlook',
        'apple_calendar', 
        'calendly',
        'when2meet'
    ]
    
    sync_results = {}
    for calendar_type in external_calendars:
        try:
            result = sync_calendar_type(user, calendar_type)
            sync_results[calendar_type] = result
        except Exception as e:
            sync_results[calendar_type] = {'error': str(e)}
    
    return sync_results
```

## Интерфейс пользователя

### Основные компоненты

#### 1. Селектор вакансии
- Выбор активной вакансии для работы
- Отображение информации о выбранной вакансии
- Кнопки копирования ссылок и вопросов для разных стран

#### 2. Чат-интерфейс
- Область отображения сообщений
- Поле ввода сообщения
- Кнопка отправки
- Индикаторы загрузки

#### 3. Управление сессиями
- Список доступных сессий чата
- Возможность создания новых сессий
- Переименование сессий

### JavaScript функциональность

#### Обработка отправки сообщений
```javascript
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const actionType = actionTypeInput.value;
    const text = textarea.value.trim();
    
    // Показываем индикатор загрузки
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    sendButton.disabled = true;
    textarea.disabled = true;
    
    // Отправляем AJAX запрос
    fetch(`/google-oauth/chat/${sessionId}/ajax/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ 
            action_type: actionType, 
            text: text,
            session_id: sessionId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Очистка поля и перезагрузка чата
            textarea.value = '';
            reloadChat();
        } else {
            alert(`Ошибка: ${data.error || 'Неизвестная ошибка'}`);
        }
    });
});
```

#### Автоматическое определение типа действия
```javascript
function detectActionType(text) {
    const lowerText = text.toLowerCase();
    
    // Команды HR-скрининга
    if (lowerText.includes('скрининг') || 
        lowerText.includes('оценка') || 
        lowerText.includes('кандидат') ||
        containsCandidateLink(text)) {
        return 'hr_screening';
    }
    
    // Команды инвайтов
    if (lowerText.includes('инвайт') || 
        lowerText.includes('приглашение') || 
        lowerText.includes('встреча')) {
        return 'invite';
    }
    
    return 'general';
}
```

## Интеграции

### Google OAuth
- Авторизация пользователя через Google
- Доступ к Google Calendar для планирования встреч
- Синхронизация данных пользователя

### Huntflow API
- Получение данных кандидатов
- Создание записей о HR-скринингах
- Обновление статусов кандидатов

### Telegram Bot
- Отправка уведомлений о новых инвайтах
- Интеграция с календарем для напоминаний
- Уведомления о статусах процессов

## Безопасность

### Аутентификация и авторизация
```python
@login_required
@permission_required('google_oauth.view_hrscreening', raise_exception=True)
def chat_workflow(request, session_id=None):
    # Проверка прав доступа
    if not request.user.has_perm('google_oauth.view_hrscreening'):
        raise PermissionDenied
```

### Валидация данных
- Проверка CSRF токенов
- Валидация JSON запросов
- Санитизация пользовательского ввода
- Проверка прав доступа к сессиям чата

## Мониторинг и логирование

### Логирование действий
```python
print(f"🔍 CHAT AJAX HANDLER: Получен запрос на session_id={session_id}")
print(f"🔍 CHAT AJAX: Анализируем сообщение: '{message_text}'")
print(f"🔍 CHAT AJAX: action_type_from_js: '{action_type_from_js}'")
```

### Отслеживание ошибок
- Логирование ошибок AJAX запросов
- Отслеживание проблем с интеграциями
- Мониторинг производительности

## Расширяемость

### Добавление новых типов действий
1. Расширение `MESSAGE_TYPES` в модели `ChatMessage`
2. Добавление логики определения типа действия
3. Реализация обработчика для нового типа
4. Обновление JavaScript для поддержки нового типа

### Кастомизация интерфейса
- Настройка стилей через CSS переменные
- Адаптация под различные устройства
- Поддержка темной/светлой темы

## Производительность

### Оптимизация запросов
- Использование `select_related` и `prefetch_related`
- Кэширование часто используемых данных
- Пагинация сообщений чата

### Асинхронная обработка
- AJAX запросы для отправки сообщений
- Фоновая обработка тяжелых операций
- Неблокирующие операции с внешними API

## Заключение

Google OAuth Chat представляет собой комплексную интеллектуальную систему для автоматизации HR-процессов через интерактивный чат-интерфейс. Система обеспечивает:

### Ключевые преимущества

**🎯 Интеллектуальное управление командами:**
- Иерархическая система приоритетов (команды → JavaScript → автоматическое определение)
- Поддержка принудительных команд (`/s`, `/in`, `/del`) для точного контроля
- Планируемая команда `/t` для управления временными слотами
- Автоматическое определение намерений пользователя на основе анализа текста

**🔄 Полная автоматизация процессов:**
- HR-скрининг с интеграцией Gemini AI для анализа кандидатов
- Автоматическое создание инвайтов с календарными событиями
- Генерация и отправка scorecard через Google Drive
- Уведомления через Telegram и email
- Синхронизация статусов с Huntflow

**🛡️ Надежность и безопасность:**
- Многоуровневая система обработки ошибок
- Полный откат операций через команду `/del`
- Валидация данных на всех уровнях
- Логирование и мониторинг всех операций
- Защита от повторного использования команд

**🔗 Интеграционная экосистема:**
- Google OAuth для авторизации и календаря
- Huntflow API для работы с кандидатами
- Gemini AI для анализа и оценки
- Telegram Bot для уведомлений
- Google Drive для документооборота

### Архитектурные решения

**Модульная архитектура:**
- Разделение логики команд, обработки и интеграций
- Независимые сервисы для каждого внешнего API
- Единая точка входа через AJAX обработчик
- Расширяемая система команд

**Обработка исключений:**
- Критические ошибки (остановка выполнения)
- Восстанавливаемые ошибки (повторные попытки)
- Частичные ошибки (продолжение с уведомлениями)
- Детальное логирование для диагностики

**Производительность:**
- Асинхронная обработка через AJAX
- Кэширование часто используемых данных
- Оптимизированные запросы к базе данных
- Фоновая обработка тяжелых операций

### Планы развития

**Ближайшие улучшения:**
- Реализация команды `/t` для управления временем
- Интеграция с внешними календарными системами
- Умное планирование встреч на основе ИИ
- Расширенная аналитика и отчетность

**Долгосрочные цели:**
- Машинное обучение для улучшения определения намерений
- Интеграция с дополнительными HR-системами
- Мобильное приложение для чата
- Голосовые команды и распознавание речи

### Техническая документация

Система полностью документирована с детальным описанием:
- Архитектуры и моделей данных
- Алгоритмов обработки команд
- Логики принятия решений и приоритетов
- Обработки исключительных случаев
- Интеграций с внешними сервисами
- Планов развития и расширения

Документация служит основой для:
- Обучения новых разработчиков
- Поддержки и обслуживания системы
- Планирования новых функций
- Устранения неполадок и оптимизации

Google OAuth Chat продолжает эволюционировать, адаптируясь под растущие потребности HR-команды и обеспечивая максимальную эффективность процессов найма и оценки кандидатов через интуитивный и мощный чат-интерфейс.
