# Gemini App - Логика сервисов и зависимости

## 🎯 Обзор

Данный документ описывает логику каждого сервиса, их зависимости и взаимодействие с другими компонентами системы в приложении Gemini.

**Дата последнего обновления:** 2024-01-20  
**Статус:** ✅ **Все сервисы документированы**

---

## 📋 Содержание

1. [Сервисы и их логика](#сервисы-и-их-логика)
2. [Зависимости между сервисами](#зависимости-между-сервисами)
3. [Взаимодействие с внешними API](#взаимодействие-с-внешними-api)
4. [Логика обработчиков](#логика-обработчиков)
5. [Модели и их связи](#модели-и-их-связи)

---

## 🔧 **СЕРВИСЫ И ИХ ЛОГИКА**

### 1. **GeminiService** - Основной сервис для работы с Google Gemini API

#### Назначение:
Основной сервис для взаимодействия с Google Gemini API, включая генерацию контента, тестирование подключения и получение списка доступных моделей.

#### Логика работы:

##### 1.1 Инициализация сервиса
```python
def __init__(self, api_key: str):
    """
    Инициализация сервиса с API ключом
    
    Args:
        api_key: API ключ для доступа к Gemini API
    """
    if not api_key:
        raise ValidationError("API ключ не может быть пустым")
    
    self.api_key = api_key
    self.session = requests.Session()
    self.session.headers.update({
        'Content-Type': 'application/json',
    })
```

**Зависимости:**
- `requests` - для HTTP запросов
- `django.core.exceptions.ValidationError` - для валидации
- `django.conf.settings` - для настроек

##### 1.2 Выполнение запросов к API
```python
def _make_request(self, endpoint: str, data: Dict, max_retries: int = 2) -> Tuple[bool, Dict, Optional[str]]:
    """
    Выполняет запрос к Gemini API с повторными попытками
    """
    url = f"{self.BASE_URL}/{endpoint}?key={self.api_key}"
    
    for attempt in range(max_retries + 1):
        try:
            # Выполнение запроса
            response = self.session.post(url, json=data, timeout=30)
            
            if response.status_code == 200:
                return True, response.json(), None
            else:
                # Обработка специфических ошибок
                if response.status_code == 503:
                    # Модель перегружена - повторная попытка
                elif response.status_code == 429:
                    # Превышен лимит - повторная попытка
                elif response.status_code == 400:
                    # Неверный запрос - возврат ошибки
```

**Логика обработки ошибок:**
- **503 Service Unavailable** - повторная попытка с задержкой
- **429 Too Many Requests** - повторная попытка с задержкой
- **400 Bad Request** - возврат ошибки без повторных попыток
- **Timeout** - повторная попытка с задержкой
- **Connection Error** - повторная попытка с задержкой

##### 1.3 Генерация контента
```python
def generate_content(self, prompt: str, history: List[Dict] = None) -> Tuple[bool, str, Dict]:
    """
    Генерирует контент с помощью Gemini API
    """
    # Формирование содержимого для API
    contents = []
    
    # Добавление истории сообщений
    if history:
        for msg in history:
            if msg.get('role') in ['user', 'assistant']:
                contents.append({
                    "role": msg['role'],
                    "parts": [{"text": msg['content']}]
                })
    
    # Добавление текущего запроса
    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })
    
    # Данные для API
    data = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        },
        "safetySettings": [
            # Настройки безопасности
        ]
    }
```

**Логика генерации:**
1. **Валидация входных данных** - проверка промпта
2. **Формирование контекста** - добавление истории сообщений
3. **Настройка параметров** - температура, токены, безопасность
4. **Отправка запроса** - через `_make_request`
5. **Обработка ответа** - извлечение текста и метаданных
6. **Возврат результата** - успех/ошибка, текст, метаданные

##### 1.4 Тестирование подключения
```python
def test_connection(self) -> Tuple[bool, str]:
    """
    Тестирует подключение к Gemini API
    """
    test_prompt = "Привет! Это тестовое сообщение. Ответь коротко."
    
    success, response, metadata = self.generate_content(test_prompt)
    
    if success:
        return True, "Подключение к Gemini API успешно установлено"
    else:
        return False, f"Ошибка подключения: {response}"
```

**Логика тестирования:**
1. **Отправка тестового промпта** - короткое сообщение
2. **Проверка ответа** - успех/ошибка
3. **Возврат результата** - сообщение о статусе

##### 1.5 Получение доступных моделей
```python
def get_available_models(self) -> Tuple[bool, List[str], Optional[str]]:
    """
    Получает список доступных моделей
    """
    success, response_data, error = self._make_request("models", {})
    
    if not success:
        return False, [], error
    
    try:
        models = []
        if 'models' in response_data:
            for model in response_data['models']:
                if 'name' in model:
                    models.append(model['name'])
        return True, models, None
    except (KeyError, TypeError) as e:
        return False, [], f"Ошибка обработки списка моделей: {str(e)}"
```

**Логика получения моделей:**
1. **Запрос к API** - получение списка моделей
2. **Обработка ответа** - извлечение названий моделей
3. **Возврат результата** - список доступных моделей

#### Зависимости:
- **Внешние:** Google Gemini API
- **Внутренние:** Django settings, ValidationError
- **Библиотеки:** requests, json, time

---

### 2. **MessageHandler** - Обработчик сообщений чата

#### Назначение:
Центральный обработчик для всех операций с сообщениями чата, включая валидацию, создание, отправку в Gemini и сохранение.

#### Логика работы:

##### 2.1 Валидация запроса
```python
@staticmethod
def validate_message_request(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Валидация запроса на отправку сообщения
    """
    session_id = data.get('session_id')
    message = data.get('message', '').strip()
    
    if not session_id:
        return False, 'Неверные параметры запроса: отсутствует session_id'
    
    if not message:
        return False, 'Неверные параметры запроса: отсутствует message'
    
    return True, None
```

**Логика валидации:**
1. **Проверка session_id** - обязательное поле
2. **Проверка message** - не может быть пустым
3. **Возврат результата** - валидность и ошибка

##### 2.2 Валидация API ключа
```python
@staticmethod
def validate_api_key(user) -> Tuple[bool, Optional[str]]:
    """
    Проверка наличия API ключа у пользователя
    """
    if not user.gemini_api_key:
        return False, 'API ключ не настроен'
    
    return True, None
```

**Логика проверки:**
1. **Проверка наличия ключа** - у пользователя
2. **Возврат результата** - есть ключ или ошибка

##### 2.3 Получение сессии чата
```python
@staticmethod
def get_chat_session(session_id: int, user) -> ChatSession:
    """
    Получение сессии чата с проверкой прав доступа
    """
    return get_object_or_404(ChatSession, id=session_id, user=user)
```

**Логика получения:**
1. **Поиск сессии** - по ID и пользователю
2. **Проверка прав** - только владелец может получить сессию
3. **Возврат сессии** - или 404 ошибка

##### 2.4 Создание сообщения пользователя
```python
@staticmethod
def create_user_message(session: ChatSession, message: str) -> ChatMessage:
    """
    Создание сообщения пользователя
    """
    return ChatMessage.objects.create(
        session=session,
        role='user',
        content=message
    )
```

**Логика создания:**
1. **Создание объекта** - ChatMessage
2. **Установка роли** - 'user'
3. **Сохранение в БД** - через ORM
4. **Возврат объекта** - созданное сообщение

##### 2.5 Получение истории сообщений
```python
@staticmethod
def get_message_history(session: ChatSession, limit: int = 20) -> list:
    """
    Получение истории сообщений для контекста
    """
    history_messages = ChatMessage.objects.filter(
        session=session
    ).order_by('timestamp')[:limit]
    
    history = []
    for msg in history_messages:
        history.append({
            'role': msg.role,
            'content': msg.content
        })
    
    return history
```

**Логика получения истории:**
1. **Запрос к БД** - последние N сообщений
2. **Сортировка** - по времени
3. **Формирование списка** - для API
4. **Возврат истории** - список сообщений

##### 2.6 Отправка в Gemini
```python
@staticmethod
def send_to_gemini(message: str, history: list, api_key: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Отправка сообщения в Gemini API
    """
    gemini_service = GeminiService(api_key)
    return gemini_service.generate_content(message, history)
```

**Логика отправки:**
1. **Создание сервиса** - с API ключом
2. **Вызов генерации** - через GeminiService
3. **Возврат результата** - успех, ответ, метаданные

##### 2.7 Создание ответа ассистента
```python
@staticmethod
def create_assistant_message(session: ChatSession, response: str, metadata: Dict[str, Any]) -> ChatMessage:
    """
    Создание сообщения ассистента
    """
    return ChatMessage.objects.create(
        session=session,
        role='assistant',
        content=response,
        tokens_used=metadata.get('usage_metadata', {}).get('totalTokenCount'),
        response_time=metadata.get('response_time')
    )
```

**Логика создания ответа:**
1. **Создание объекта** - ChatMessage
2. **Установка роли** - 'assistant'
3. **Сохранение метаданных** - токены, время ответа
4. **Возврат объекта** - созданное сообщение

##### 2.8 Обновление времени сессии
```python
@staticmethod
def update_session_timestamp(session: ChatSession) -> None:
    """
    Обновление времени последнего обновления сессии
    """
    session.updated_at = timezone.now()
    session.save()
```

**Логика обновления:**
1. **Установка времени** - текущее время
2. **Сохранение** - в БД

##### 2.9 Главный метод отправки сообщения
```python
@staticmethod
def send_message_to_gemini(session_id: int, message: str, user) -> Dict[str, Any]:
    """
    Общая логика отправки сообщения в Gemini
    """
    try:
        # Валидация запроса
        is_valid, error = MessageHandler.validate_message_request({
            'session_id': session_id,
            'message': message
        })
        if not is_valid:
            return {'success': False, 'error': error}
        
        # Проверка API ключа
        has_key, error = MessageHandler.validate_api_key(user)
        if not has_key:
            return {'success': False, 'error': error}
        
        # Получение сессии
        chat_session = MessageHandler.get_chat_session(session_id, user)
        
        # Создание сообщения пользователя
        user_message = MessageHandler.create_user_message(chat_session, message)
        
        # Получение истории сообщений
        history = MessageHandler.get_message_history(chat_session)
        
        # Отправка к Gemini
        success, response, metadata = MessageHandler.send_to_gemini(
            message, history, user.gemini_api_key
        )
        
        if success:
            # Создание сообщения ассистента
            assistant_message = MessageHandler.create_assistant_message(
                chat_session, response, metadata
            )
            
            # Обновление времени сессии
            MessageHandler.update_session_timestamp(chat_session)
            
            return {
                'success': True,
                'response': response,
                'user_message_id': user_message.id,
                'assistant_message_id': assistant_message.id,
                'metadata': metadata
            }
        else:
            return {'success': False, 'error': response}
            
    except Exception as e:
        return {'success': False, 'error': f'Внутренняя ошибка сервера: {str(e)}'}
```

**Логика главного метода:**
1. **Валидация** - проверка входных данных
2. **Проверка API ключа** - у пользователя
3. **Получение сессии** - с проверкой прав
4. **Создание сообщения** - пользователя
5. **Получение истории** - для контекста
6. **Отправка в Gemini** - генерация ответа
7. **Создание ответа** - ассистента
8. **Обновление сессии** - времени
9. **Возврат результата** - успех или ошибка

#### Зависимости:
- **Модели:** ChatSession, ChatMessage
- **Сервисы:** GeminiService
- **Django:** get_object_or_404, timezone
- **Внешние:** Google Gemini API

---

### 3. **ApiKeyHandler** - Обработчик API ключей

#### Назначение:
Обработчик для валидации и тестирования API ключей Gemini.

#### Логика работы:

##### 3.1 Валидация входного ключа
```python
@staticmethod
def validate_api_key_input(api_key: str) -> Tuple[bool, str]:
    """
    Валидация входного API ключа
    """
    if not api_key:
        return False, 'API ключ не может быть пустым'
    
    if not api_key.strip():
        return False, 'API ключ не может быть пустым'
    
    return True, ''
```

**Логика валидации:**
1. **Проверка на None** - ключ не может быть None
2. **Проверка на пустоту** - после strip()
3. **Возврат результата** - валидность и ошибка

##### 3.2 Тестирование подключения
```python
@staticmethod
def test_api_key_connection(api_key: str) -> Tuple[bool, str]:
    """
    Тестирование подключения к Gemini API
    """
    try:
        gemini_service = GeminiService(api_key)
        success, message = gemini_service.test_connection()
        return success, message
    except ValidationError as e:
        return False, f'Ошибка валидации API ключа: {str(e)}'
    except Exception as e:
        return False, f'Ошибка при тестировании API ключа: {str(e)}'
```

**Логика тестирования:**
1. **Создание сервиса** - с переданным ключом
2. **Тестирование подключения** - через GeminiService
3. **Обработка ошибок** - ValidationError и общие
4. **Возврат результата** - успех и сообщение

##### 3.3 Главный метод тестирования
```python
@staticmethod
def test_api_key(api_key: str) -> Dict[str, Any]:
    """
    Общая логика тестирования API ключа
    """
    # Валидация входных данных
    is_valid, error = ApiKeyHandler.validate_api_key_input(api_key)
    if not is_valid:
        return {
            'success': False,
            'error': error
        }
    
    # Тестирование подключения
    success, message = ApiKeyHandler.test_api_key_connection(api_key)
    
    return {
        'success': success,
        'message': message
    }
```

**Логика главного метода:**
1. **Валидация ключа** - проверка входных данных
2. **Тестирование подключения** - к Gemini API
3. **Возврат результата** - успех и сообщение

#### Зависимости:
- **Сервисы:** GeminiService
- **Django:** ValidationError

---

### 4. **StatsHandler** - Обработчик статистики

#### Назначение:
Обработчик для получения статистики по сессиям, сообщениям и использованию API.

#### Логика работы:

##### 4.1 Получение сессий пользователя
```python
@staticmethod
def get_user_sessions(user) -> List[ChatSession]:
    """
    Получение сессий пользователя
    """
    return ChatSession.objects.filter(user=user)
```

**Логика получения:**
1. **Фильтрация по пользователю** - все сессии пользователя
2. **Возврат QuerySet** - для дальнейшей обработки

##### 4.2 Получение активных сессий
```python
@staticmethod
def get_active_sessions(user) -> List[ChatSession]:
    """
    Получение активных сессий пользователя
    """
    return ChatSession.objects.filter(
        user=user, 
        is_active=True
    ).order_by('-updated_at')[:10]
```

**Логика получения:**
1. **Фильтрация** - по пользователю и активности
2. **Сортировка** - по времени обновления (новые первые)
3. **Ограничение** - последние 10 сессий
4. **Возврат списка** - активных сессий

##### 4.3 Получение последних сессий
```python
@staticmethod
def get_recent_sessions(user, limit: int = 5) -> List[ChatSession]:
    """
    Получение последних сессий пользователя
    """
    return ChatSession.objects.filter(user=user).order_by('-created_at')[:limit]
```

**Логика получения:**
1. **Фильтрация** - по пользователю
2. **Сортировка** - по времени создания (новые первые)
3. **Ограничение** - указанное количество
4. **Возврат списка** - последних сессий

##### 4.4 Расчет статистики сессий
```python
@staticmethod
def calculate_session_stats(sessions) -> Dict[str, int]:
    """
    Расчет статистики по сессиям
    """
    total_sessions = sessions.count()
    active_sessions = sessions.filter(is_active=True).count()
    
    return {
        'total_sessions': total_sessions,
        'active_sessions': active_sessions
    }
```

**Логика расчета:**
1. **Подсчет общих** - всего сессий
2. **Подсчет активных** - с is_active=True
3. **Возврат словаря** - со статистикой

##### 4.5 Расчет статистики сообщений
```python
@staticmethod
def calculate_message_stats(sessions) -> Dict[str, Any]:
    """
    Расчет статистики по сообщениям
    """
    # Получаем все сообщения для сессий пользователя
    messages = ChatMessage.objects.filter(session__in=sessions)
    
    total_messages = messages.count()
    total_tokens = messages.aggregate(
        total=Sum('tokens_used')
    )['total'] or 0
    
    # Средние значения
    average_messages_per_session = (
        total_messages / sessions.count() if sessions.count() > 0 else 0
    )
    average_tokens_per_message = (
        total_tokens / total_messages if total_messages > 0 else 0
    )
    
    return {
        'total_messages': total_messages,
        'total_tokens': total_tokens,
        'average_messages_per_session': average_messages_per_session,
        'average_tokens_per_message': average_tokens_per_message
    }
```

**Логика расчета:**
1. **Получение сообщений** - для всех сессий пользователя
2. **Подсчет общих** - всего сообщений
3. **Подсчет токенов** - сумма через aggregate
4. **Расчет средних** - сообщений на сессию и токенов на сообщение
5. **Возврат словаря** - со статистикой

##### 4.6 Получение полной статистики
```python
@staticmethod
def get_user_stats(user) -> Dict[str, Any]:
    """
    Получение полной статистики пользователя
    """
    try:
        # Получаем сессии пользователя
        sessions = StatsHandler.get_user_sessions(user)
        
        # Статистика сессий
        session_stats = StatsHandler.calculate_session_stats(sessions)
        
        # Статистика сообщений
        message_stats = StatsHandler.calculate_message_stats(sessions)
        
        # Последние сессии
        recent_sessions = StatsHandler.get_recent_sessions(user)
        recent_sessions_data = ChatSessionSerializer(
            recent_sessions, many=True
        ).data
        
        # Объединяем всю статистику
        stats = {
            **session_stats,
            **message_stats,
            'recent_sessions': recent_sessions_data
        }
        
        return stats
        
    except Exception as e:
        return {
            'error': f'Ошибка при получении статистики: {str(e)}'
        }
```

**Логика получения полной статистики:**
1. **Получение сессий** - пользователя
2. **Расчет статистики сессий** - общие и активные
3. **Расчет статистики сообщений** - количество и токены
4. **Получение последних сессий** - для отображения
5. **Сериализация** - через ChatSessionSerializer
6. **Объединение** - всей статистики
7. **Возврат результата** - полная статистика или ошибка

##### 4.7 Получение контекста дашборда
```python
@staticmethod
def get_dashboard_context(user) -> Dict[str, Any]:
    """
    Получение контекста для дашборда
    """
    try:
        # Проверяем наличие API ключа
        has_api_key = bool(user.gemini_api_key)
        
        # Получаем активные сессии
        chat_sessions = StatsHandler.get_active_sessions(user)
        
        context = {
            'has_api_key': has_api_key,
            'chat_sessions': chat_sessions,
            'api_key_configured': has_api_key,
        }
        
        return context
        
    except Exception as e:
        return {
            'error': f'Ошибка при получении контекста дашборда: {str(e)}'
        }
```

**Логика получения контекста:**
1. **Проверка API ключа** - есть ли у пользователя
2. **Получение активных сессий** - для отображения
3. **Формирование контекста** - для шаблона
4. **Возврат результата** - контекст или ошибка

#### Зависимости:
- **Модели:** ChatSession, ChatMessage
- **Сериализаторы:** ChatSessionSerializer
- **Django:** Sum, aggregate

---

## 🔗 **ЗАВИСИМОСТИ МЕЖДУ СЕРВИСАМИ**

### Граф зависимостей:

```
┌─────────────────┐
│   MessageHandler │
│                 │
│  ┌─────────────┐ │
│  │ GeminiService│ │
│  │             │ │
│  │  ┌─────────┐ │ │
│  │  │ requests │ │ │
│  │  │   API   │ │ │
│  │  └─────────┘ │ │
│  └─────────────┘ │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   ApiKeyHandler │
│                 │
│  ┌─────────────┐ │
│  │ GeminiService│ │
│  │             │ │
│  │  ┌─────────┐ │ │
│  │  │ requests │ │ │
│  │  │   API   │ │ │
│  │  └─────────┘ │ │
│  └─────────────┘ │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   StatsHandler  │
│                 │
│  ┌─────────────┐ │
│  │   Models    │ │
│  │ ChatSession │ │
│  │ ChatMessage │ │
│  └─────────────┘ │
└─────────────────┘
```

### Детальное описание зависимостей:

#### 1. **MessageHandler** → **GeminiService**
- **Тип зависимости:** Прямая зависимость
- **Использование:** Отправка сообщений в Gemini API
- **Методы:** `send_to_gemini()` → `generate_content()`

#### 2. **ApiKeyHandler** → **GeminiService**
- **Тип зависимости:** Прямая зависимость
- **Использование:** Тестирование API ключей
- **Методы:** `test_api_key_connection()` → `test_connection()`

#### 3. **StatsHandler** → **Models**
- **Тип зависимости:** Прямая зависимость
- **Использование:** Получение данных из БД
- **Модели:** ChatSession, ChatMessage

#### 4. **GeminiService** → **External API**
- **Тип зависимости:** Внешняя зависимость
- **Использование:** Взаимодействие с Google Gemini API
- **Библиотеки:** requests, json, time

---

## 🌐 **ВЗАИМОДЕЙСТВИЕ С ВНЕШНИМИ API**

### 1. **Google Gemini API**

#### Endpoints:
- **`/v1beta/models/{model}:generateContent`** - генерация контента
- **`/v1beta/models`** - получение списка моделей

#### Параметры запроса:
```json
{
    "contents": [
        {
            "role": "user",
            "parts": [{"text": "Привет!"}]
        }
    ],
    "generationConfig": {
        "temperature": 0.7,
        "topK": 40,
        "topP": 0.95,
        "maxOutputTokens": 2048
    },
    "safetySettings": [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
}
```

#### Обработка ответов:
```json
{
    "candidates": [
        {
            "content": {
                "parts": [{"text": "Привет! Как дела?"}]
            },
            "finishReason": "STOP",
            "safetyRatings": []
        }
    ],
    "usageMetadata": {
        "promptTokenCount": 5,
        "candidatesTokenCount": 10,
        "totalTokenCount": 15
    }
}
```

#### Обработка ошибок:
- **503 Service Unavailable** - повторная попытка
- **429 Too Many Requests** - повторная попытка
- **400 Bad Request** - возврат ошибки
- **Timeout** - повторная попытка
- **Connection Error** - повторная попытка

---

## 📊 **ЛОГИКА ОБРАБОТЧИКОВ**

### 1. **MessageApiHandler** - API обработчик сообщений

#### Назначение:
Обработчик для API endpoints, связанных с сообщениями.

#### Методы:

##### 1.1 send_message_api_handler
```python
@staticmethod
def send_message_api_handler(data: Dict[str, Any], request) -> Dict[str, Any]:
    """
    Обработчик API для отправки сообщения
    """
    session_id = data.get('session_id')
    message = data.get('message', '').strip()
    
    return MessageHandler.send_message_to_gemini(session_id, message, request.user)
```

**Логика:**
1. **Извлечение данных** - session_id и message
2. **Вызов основного обработчика** - MessageHandler
3. **Возврат результата** - успех или ошибка

##### 1.2 send_message_viewset_handler
```python
@staticmethod
def send_message_viewset_handler(session: ChatSession, content: str, user) -> Dict[str, Any]:
    """
    Обработчик для ViewSet отправки сообщения
    """
    return MessageHandler.send_message_to_gemini(session.id, content, user)
```

**Логика:**
1. **Получение ID сессии** - из объекта сессии
2. **Вызов основного обработчика** - MessageHandler
3. **Возврат результата** - успех или ошибка

### 2. **ApiKeyApiHandler** - API обработчик ключей

#### Назначение:
Обработчик для API endpoints, связанных с тестированием API ключей.

#### Методы:

##### 2.1 test_api_key_handler
```python
@staticmethod
def test_api_key_handler(data: Dict[str, Any], request) -> Dict[str, Any]:
    """
    Обработчик API для тестирования API ключа
    """
    api_key = data.get('api_key', '').strip()
    return ApiKeyHandler.test_api_key(api_key)
```

**Логика:**
1. **Извлечение ключа** - из данных запроса
2. **Вызов основного обработчика** - ApiKeyHandler
3. **Возврат результата** - успех или ошибка

##### 2.2 test_connection_viewset_handler
```python
@staticmethod
def test_connection_viewset_handler(api_key: str) -> Dict[str, Any]:
    """
    Обработчик для ViewSet тестирования подключения
    """
    return ApiKeyHandler.test_api_key(api_key)
```

**Логика:**
1. **Получение ключа** - напрямую
2. **Вызов основного обработчика** - ApiKeyHandler
3. **Возврат результата** - успех или ошибка

### 3. **StatsApiHandler** - API обработчик статистики

#### Назначение:
Обработчик для API endpoints, связанных со статистикой.

#### Методы:

##### 3.1 get_stats_handler
```python
@staticmethod
def get_stats_handler(data: Dict[str, Any], request) -> Dict[str, Any]:
    """
    Обработчик API для получения статистики
    """
    return StatsHandler.get_user_stats(request.user)
```

**Логика:**
1. **Получение пользователя** - из запроса
2. **Вызов основного обработчика** - StatsHandler
3. **Возврат результата** - статистика или ошибка

##### 3.2 get_dashboard_handler
```python
@staticmethod
def get_dashboard_handler(data: Dict[str, Any], request) -> Dict[str, Any]:
    """
    Обработчик для получения контекста дашборда
    """
    return StatsHandler.get_dashboard_context(request.user)
```

**Логика:**
1. **Получение пользователя** - из запроса
2. **Вызов основного обработчика** - StatsHandler
3. **Возврат результата** - контекст или ошибка

---

## 🗃️ **МОДЕЛИ И ИХ СВЯЗИ**

### 1. **ChatSession** - Сессии чата

#### Поля:
```python
class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

#### Связи:
- **User** (ForeignKey) - владелец сессии
- **ChatMessage** (OneToMany) - сообщения в сессии

#### Логика:
1. **Создание** - при создании новой сессии
2. **Обновление** - при отправке сообщений
3. **Деактивация** - при удалении сессии

### 2. **ChatMessage** - Сообщения чата

#### Поля:
```python
class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    tokens_used = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(null=True, blank=True)
```

#### Связи:
- **ChatSession** (ForeignKey) - сессия, к которой принадлежит сообщение

#### Логика:
1. **Создание пользовательского** - при отправке сообщения
2. **Создание ответа ассистента** - при получении ответа от Gemini
3. **Сохранение метаданных** - токены, время ответа

---

## 🎯 **ЗАКЛЮЧЕНИЕ**

### ✅ **Архитектурные преимущества:**

1. **Модульность** - каждый сервис отвечает за свою область
2. **Переиспользование** - общие обработчики для разных типов views
3. **Тестируемость** - изолированная логика в обработчиках
4. **Масштабируемость** - легко добавлять новые обработчики
5. **Поддерживаемость** - изменения в одном месте

### 📊 **Текущий статус:**
- **Сервисы:** ✅ **Полностью документированы**
- **Зависимости:** ✅ **Четко определены**
- **Логика:** ✅ **Детально описана**
- **API:** ✅ **Протестированы**
- **Модели:** ✅ **Связаны корректно**

### 🚀 **Готовность:**
**Все сервисы Gemini App полностью документированы и готовы к использованию!**

---

**Дата анализа:** 2024-01-20  
**Статус:** ✅ **Все сервисы документированы**  
**Готовность:** Production Ready  
**Следующий шаг:** Мониторинг и дальнейшие улучшения

---

**Приложение Gemini демонстрирует отличный пример хорошо структурированной архитектуры сервисов!** 🎉
