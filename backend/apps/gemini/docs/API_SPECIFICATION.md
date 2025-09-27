# API Спецификация приложения Gemini

## 🎯 Обзор

Данный документ содержит полную спецификацию API приложения `gemini`, включая REST API endpoints, JSON API, веб-интерфейс и взаимодействие с другими приложениями.

---

## 📋 Содержание

1. [REST API Endpoints](#rest-api-endpoints)
2. [JSON API Endpoints](#json-api-endpoints)
3. [Веб-интерфейс](#веб-интерфейс)
4. [Модели данных](#модели-данных)
5. [Сериализаторы](#сериализаторы)
6. [Обработка ошибок](#обработка-ошибок)
7. [Примеры использования](#примеры-использования)

---

## 🔌 REST API Endpoints

### Базовый URL
```
http://localhost:8000/api/v1/gemini/
```

### ChatSessionViewSet (`/api/v1/gemini/chat-sessions/`)

#### Базовые операции CRUD

##### 1. Список сессий чата
```http
GET /api/v1/gemini/chat-sessions/
Authorization: SessionAuthentication
```

**Параметры запроса:**
- `search` - поиск по названию сессии
- `ordering` - сортировка по полям
- `page` - номер страницы (пагинация)

**Ответ:**
```json
{
    "count": 15,
    "next": "http://localhost:8000/api/v1/gemini/chat-sessions/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": 1,
            "user_username": "admin",
            "title": "Python разработка",
            "is_active": true,
            "messages_count": 12,
            "last_message": {
                "id": 25,
                "role": "assistant",
                "content": "Python - отличный язык для веб-разработки...",
                "timestamp": "2024-01-20T15:30:00Z"
            },
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T15:30:00Z"
        }
    ]
}
```

##### 2. Создание сессии чата
```http
POST /api/v1/gemini/chat-sessions/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "title": "Новая сессия"
}
```

**Ответ:**
```json
{
    "id": 16,
    "user": 1,
    "user_username": "admin",
    "title": "Новая сессия",
    "is_active": true,
    "messages_count": 0,
    "last_message": null,
    "created_at": "2024-01-20T16:00:00Z",
    "updated_at": "2024-01-20T16:00:00Z"
}
```

##### 3. Получение сессии чата
```http
GET /api/v1/gemini/chat-sessions/{id}/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "id": 1,
    "user": 1,
    "user_username": "admin",
    "title": "Python разработка",
    "is_active": true,
    "messages": [
        {
            "id": 1,
            "session": 1,
            "role": "user",
            "content": "Расскажи о Python",
            "timestamp": "2024-01-15T10:30:00Z",
            "tokens_used": 5,
            "response_time": 1.2
        },
        {
            "id": 2,
            "session": 1,
            "role": "assistant",
            "content": "Python - это высокоуровневый язык программирования...",
            "timestamp": "2024-01-15T10:30:01Z",
            "tokens_used": 150,
            "response_time": 1.2
        }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T15:30:00Z"
}
```

##### 4. Обновление сессии чата
```http
PUT /api/v1/gemini/chat-sessions/{id}/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "title": "Обновленное название"
}
```

##### 5. Удаление сессии чата
```http
DELETE /api/v1/gemini/chat-sessions/{id}/
Authorization: SessionAuthentication
```

#### Кастомные действия

##### 1. Отправка сообщения
```http
POST /api/v1/gemini/chat-sessions/{id}/send_message/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "content": "Привет, как дела?"
}
```

**Ответ:**
```json
{
    "user_message": {
        "id": 26,
        "session": 1,
        "role": "user",
        "content": "Привет, как дела?",
        "timestamp": "2024-01-20T16:05:00Z",
        "tokens_used": 6,
        "response_time": null
    },
    "assistant_message": {
        "id": 27,
        "session": 1,
        "role": "assistant",
        "content": "Привет! У меня всё отлично, спасибо! Как дела у тебя?",
        "timestamp": "2024-01-20T16:05:02Z",
        "tokens_used": 25,
        "response_time": 2.1
    }
}
```

##### 2. Получение сообщений сессии
```http
GET /api/v1/gemini/chat-sessions/{id}/messages/
Authorization: SessionAuthentication
```

##### 3. Очистка истории сообщений
```http
POST /api/v1/gemini/chat-sessions/{id}/clear_history/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "status": "history_cleared"
}
```

##### 4. Мои сессии
```http
GET /api/v1/gemini/chat-sessions/my_sessions/
Authorization: SessionAuthentication
```

##### 5. Статистика сессий
```http
GET /api/v1/gemini/chat-sessions/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_sessions": 15,
    "active_sessions": 12,
    "total_messages": 245,
    "total_tokens": 15230,
    "average_messages_per_session": 16.33,
    "average_tokens_per_message": 62.16,
    "recent_sessions": [
        {
            "id": 1,
            "title": "Python разработка",
            "messages_count": 12,
            "updated_at": "2024-01-20T15:30:00Z"
        }
    ]
}
```

### ChatMessageViewSet (`/api/v1/gemini/chat-messages/`)

#### Базовые операции

##### 1. Список сообщений
```http
GET /api/v1/gemini/chat-messages/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "count": 245,
    "next": "http://localhost:8000/api/v1/gemini/chat-messages/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "session": 1,
            "role": "user",
            "content": "Расскажи о Python",
            "timestamp": "2024-01-15T10:30:00Z",
            "tokens_used": 5,
            "response_time": 1.2
        }
    ]
}
```

##### 2. Получение сообщения
```http
GET /api/v1/gemini/chat-messages/{id}/
Authorization: SessionAuthentication
```

##### 3. Последние сообщения
```http
GET /api/v1/gemini/chat-messages/recent/
Authorization: SessionAuthentication
```

**Ответ:**
```json
[
    {
        "id": 245,
        "session": 15,
        "role": "user",
        "content": "Как работает машинное обучение?",
        "timestamp": "2024-01-20T16:00:00Z",
        "tokens_used": 8,
        "response_time": null
    },
    {
        "id": 246,
        "session": 15,
        "role": "assistant",
        "content": "Машинное обучение - это область искусственного интеллекта...",
        "timestamp": "2024-01-20T16:00:03Z",
        "tokens_used": 180,
        "response_time": 2.8
    }
]
```

### GeminiApiViewSet (`/api/v1/gemini/api/`)

#### Кастомные действия

##### 1. Анализ текста
```http
POST /api/v1/gemini/api/analyze_text/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "prompt": "Анализируй следующий текст",
    "max_tokens": 1000,
    "temperature": 0.7,
    "save_to_session": true
}
```

##### 2. Генерация ответа
```http
POST /api/v1/gemini/api/generate_response/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "prompt": "Создай краткое резюме о Python",
    "max_tokens": 500,
    "temperature": 0.5
}
```

##### 3. Статистика API
```http
GET /api/v1/gemini/api/stats/
Authorization: SessionAuthentication
```

**Ответ:**
```json
{
    "total_sessions": 15,
    "total_messages": 245,
    "total_tokens": 15230,
    "average_messages_per_session": 16.33,
    "average_tokens_per_message": 62.16,
    "recent_sessions": [
        {
            "id": 15,
            "title": "Машинное обучение",
            "messages_count": 8,
            "updated_at": "2024-01-20T16:00:00Z"
        }
    ]
}
```

---

## 🔗 JSON API Endpoints

### Базовый URL
```
http://localhost:8000/gemini/api/
```

### Операции с сообщениями

#### 1. Отправка сообщения (AJAX)
```http
POST /gemini/send-message/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "session_id": 1,
    "message": "Привет, как дела?"
}
```

**Ответ:**
```json
{
    "success": true,
    "response": "Привет! У меня всё отлично, спасибо! Как дела у тебя?",
    "user_message_id": 26,
    "assistant_message_id": 27,
    "metadata": {
        "response_time": 2.1,
        "usage_metadata": {
            "totalTokenCount": 25
        },
        "finish_reason": "STOP",
        "safety_ratings": []
    }
}
```

#### 2. Тестирование API ключа
```http
POST /gemini/test-api-key/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "api_key": "your-gemini-api-key"
}
```

**Ответ:**
```json
{
    "success": true,
    "message": "Подключение к Gemini API успешно установлено"
}
```

**Ошибка:**
```json
{
    "success": false,
    "error": "API ключ не может быть пустым"
}
```

#### 3. Обновление названия сессии
```http
POST /gemini/sessions/{session_id}/update-title/
Content-Type: application/json
Authorization: SessionAuthentication

{
    "title": "Новое название сессии"
}
```

**Ответ:**
```json
{
    "success": true,
    "title": "Новое название сессии"
}
```

---

## 🌐 Веб-интерфейс

### Базовый URL
```
http://localhost:8000/gemini/
```

### URL маршруты

#### 1. Главная панель
```http
GET /gemini/
```
- **Описание:** Главная панель Gemini AI
- **Обработчик:** `gemini_dashboard`
- **Контекст:** Список активных сессий, статус API ключа

#### 2. Сессия чата
```http
GET /gemini/chat/{session_id}/
```
- **Описание:** Страница чата с конкретной сессией
- **Обработчик:** `chat_session`

#### 3. Новая сессия
```http
GET /gemini/chat/
POST /gemini/chat/
```
- **Описание:** Создание новой сессии чата
- **Обработчик:** `chat_session`

#### 4. Настройки
```http
GET /gemini/settings/
POST /gemini/settings/
```
- **Описание:** Настройки Gemini API
- **Обработчик:** `settings`

#### 5. Удаление сессии
```http
GET /gemini/sessions/{session_id}/delete/
POST /gemini/sessions/{session_id}/delete/
```
- **Описание:** Удаление сессии чата
- **Обработчик:** `delete_session`

#### 6. AJAX Endpoints

##### Отправка сообщения
```http
POST /gemini/send-message/
Content-Type: application/json

{
    "session_id": 1,
    "message": "Текст сообщения"
}
```

##### Тестирование API ключа
```http
POST /gemini/test-api-key/
Content-Type: application/json

{
    "api_key": "your-api-key"
}
```

##### Обновление названия сессии
```http
POST /gemini/sessions/{session_id}/update-title/
Content-Type: application/json

{
    "title": "Новое название"
}
```

---

## 📊 Модели данных

### ChatSession (Сессии чата)
```python
class ChatSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='gemini_chat_sessions'
    )
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

**Поля:**
- `user` - пользователь, владелец сессии
- `title` - название сессии чата
- `created_at` - время создания
- `updated_at` - время последнего обновления
- `is_active` - активна ли сессия

### ChatMessage (Сообщения чата)
```python
class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'Пользователь'),
        ('assistant', 'Ассистент'),
        ('system', 'Система'),
    ]

    session = models.ForeignKey(
        ChatSession, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    tokens_used = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(null=True, blank=True)
```

**Поля:**
- `session` - сессия чата
- `role` - роль отправителя (user/assistant/system)
- `content` - содержимое сообщения
- `timestamp` - время отправки
- `tokens_used` - количество использованных токенов
- `response_time` - время ответа в секундах

---

## 🔄 Сериализаторы

### ChatSessionSerializer
```python
class ChatSessionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'user_username', 'title', 'is_active',
            'messages_count', 'last_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'messages_count', 'last_message']
```

### ChatSessionDetailSerializer
```python
class ChatSessionDetailSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'user_username', 'title', 'is_active',
            'messages', 'created_at', 'updated_at'
        ]
```

### ChatMessageSerializer
```python
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'role', 'content', 'timestamp',
            'tokens_used', 'response_time'
        ]
        read_only_fields = ['id', 'timestamp']
```

### ChatMessageCreateSerializer
```python
class ChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['session', 'role', 'content']
    
    def validate_role(self, value):
        if value not in ['user', 'assistant', 'system']:
            raise serializers.ValidationError("Неверная роль сообщения")
        return value
```

### ChatSessionCreateSerializer
```python
class ChatSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ['title']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return ChatSession.objects.create(**validated_data)
```

### GeminiApiRequestSerializer
```python
class GeminiApiRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=4000)
    session_id = serializers.IntegerField(required=False)
    max_tokens = serializers.IntegerField(default=1000, min_value=1, max_value=4000)
    temperature = serializers.FloatField(default=0.7, min_value=0.0, max_value=1.0)
    save_to_session = serializers.BooleanField(default=True)
```

### GeminiStatsSerializer
```python
class GeminiStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    total_tokens_used = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    sessions_by_user = serializers.DictField()
    recent_sessions = ChatSessionSerializer(many=True)
    top_prompts = serializers.ListField(child=serializers.DictField())
```

---

## ⚠️ Обработка ошибок

### HTTP статус коды

#### 200 OK
- Успешный запрос
- Возврат данных

#### 201 Created
- Успешное создание ресурса
- Возврат созданного объекта

#### 400 Bad Request
- Неверные данные запроса
- Ошибки валидации
- API ключ не настроен

#### 401 Unauthorized
- Неавторизованный доступ
- Неверные учетные данные

#### 403 Forbidden
- Недостаточно прав доступа
- Запрещенная операция

#### 404 Not Found
- Сессия чата не найдена
- Сообщение не найдено
- Неверный URL

#### 500 Internal Server Error
- Внутренняя ошибка сервера
- Ошибка Gemini API
- Неожиданная ошибка

### Формат ошибок

#### Ошибки валидации
```json
{
    "content": [
        "Это поле обязательно для заполнения."
    ],
    "role": [
        "Неверная роль сообщения"
    ]
}
```

#### Ошибки API
```json
{
    "error": "API ключ не настроен"
}
```

#### Ошибки JSON API
```json
{
    "success": false,
    "error": "Неверные параметры запроса: отсутствует session_id"
}
```

#### Ошибки Gemini API
```json
{
    "success": false,
    "error": "Модель Gemini перегружена. Пожалуйста, попробуйте позже."
}
```

---

## 📝 Примеры использования

### 1. Создание новой сессии чата через REST API

```bash
curl -X POST http://localhost:8000/api/v1/gemini/chat-sessions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "title": "Обсуждение Python"
  }'
```

### 2. Отправка сообщения через REST API

```bash
curl -X POST http://localhost:8000/api/v1/gemini/chat-sessions/1/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "content": "Расскажи о Python"
  }'
```

### 3. Отправка сообщения через JSON API

```bash
curl -X POST http://localhost:8000/gemini/send-message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "session_id": 1,
    "message": "Привет, как дела?"
  }'
```

### 4. Тестирование API ключа

```bash
curl -X POST http://localhost:8000/gemini/test-api-key/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Session YOUR_SESSION_ID" \
  -d '{
    "api_key": "your-gemini-api-key"
  }'
```

### 5. Получение статистики

```bash
curl -X GET http://localhost:8000/api/v1/gemini/chat-sessions/stats/ \
  -H "Authorization: Session YOUR_SESSION_ID"
```

### 6. Получение детальной информации о сессии

```bash
curl -X GET http://localhost:8000/api/v1/gemini/chat-sessions/1/ \
  -H "Authorization: Session YOUR_SESSION_ID"
```

---

## 🔗 Интеграция с другими приложениями

### 1. Accounts
- **Связь:** ForeignKey на `User` в `ChatSession`
- **Использование:** Пользователи создают и управляют сессиями чата
- **Критичность:** Высокая (без пользователей Gemini не работает)

### 2. Finance
- **Связь:** Использование `GeminiService` для анализа данных
- **Использование:** AI-анализ финансовых данных и зарплат
- **Критичность:** Средняя

### 3. Google OAuth
- **Связь:** Использование `GeminiService` для анализа встреч
- **Использование:** AI-анализ календарных событий
- **Критичность:** Средняя

### 4. Внешние API
- **Google Gemini API:** Основной сервис для генерации контента
- **NBRB API:** Получение курсов валют для контекста
- **HH.ru API:** Анализ вакансий через AI

---

## 🚀 Заключение

API приложения `gemini` предоставляет:

1. **Полный CRUD** для управления сессиями чата и сообщениями
2. **REST API** с DRF ViewSets
3. **JSON API** для AJAX операций
4. **Веб-интерфейс** для пользователей
5. **Интеграцию с Gemini AI** для генерации контента
6. **Систему статистики** использования AI
7. **Безопасность** и валидацию
8. **Обработку ошибок** с детальными сообщениями

Система легко интегрируется с другими приложениями и предоставляет мощные инструменты для работы с AI, включая чат-ботов, анализ текста и генерацию контента.

---

**Дата обновления:** 2024-01-20  
**Версия:** 1.0.0  
**Статус:** Production Ready ✅
