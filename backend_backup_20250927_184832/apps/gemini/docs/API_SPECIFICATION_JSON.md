# API Спецификация Gemini App - JSON Примеры

## 🎯 Обзор

Данный документ содержит подробные JSON примеры для всех API endpoints приложения Gemini, включая запросы, ответы и обработку ошибок.

---

## 📋 Содержание

1. [REST API Examples](#rest-api-examples)
2. [JSON API Examples](#json-api-examples)
3. [Error Handling Examples](#error-handling-examples)
4. [Authentication Examples](#authentication-examples)
5. [Data Models Examples](#data-models-examples)

---

## 🔌 REST API Examples

### ChatSessionViewSet

#### 1. Получение списка сессий

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/
Authorization: Session YOUR_SESSION_ID
```

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
        },
        {
            "id": 2,
            "user": 1,
            "user_username": "admin",
            "title": "JavaScript основы",
            "is_active": true,
            "messages_count": 8,
            "last_message": {
                "id": 20,
                "role": "user",
                "content": "Спасибо за объяснение!",
                "timestamp": "2024-01-19T14:20:00Z"
            },
            "created_at": "2024-01-18T09:15:00Z",
            "updated_at": "2024-01-19T14:20:00Z"
        }
    ]
}
```

#### 2. Создание новой сессии

**Запрос:**
```http
POST /api/v1/gemini/chat-sessions/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "title": "Обсуждение машинного обучения"
}
```

**Ответ:**
```json
{
    "id": 16,
    "user": 1,
    "user_username": "admin",
    "title": "Обсуждение машинного обучения",
    "is_active": true,
    "messages_count": 0,
    "last_message": null,
    "created_at": "2024-01-20T16:00:00Z",
    "updated_at": "2024-01-20T16:00:00Z"
}
```

#### 3. Получение детальной информации о сессии

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/1/
Authorization: Session YOUR_SESSION_ID
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
            "response_time": null
        },
        {
            "id": 2,
            "session": 1,
            "role": "assistant",
            "content": "Python - это высокоуровневый язык программирования общего назначения. Он был создан Гвидо ван Россумом и впервые выпущен в 1991 году. Python известен своим простым и читаемым синтаксисом, что делает его отличным выбором как для начинающих, так и для опытных программистов.\n\nОсновные особенности Python:\n- Простой и интуитивный синтаксис\n- Кроссплатформенность\n- Большая стандартная библиотека\n- Активное сообщество\n- Поддержка различных парадигм программирования",
            "timestamp": "2024-01-15T10:30:01Z",
            "tokens_used": 150,
            "response_time": 1.2
        },
        {
            "id": 3,
            "session": 1,
            "role": "user",
            "content": "Какие области применения у Python?",
            "timestamp": "2024-01-15T10:35:00Z",
            "tokens_used": 12,
            "response_time": null
        },
        {
            "id": 4,
            "session": 1,
            "role": "assistant",
            "content": "Python находит применение в самых разных областях:\n\n1. **Веб-разработка**: Django, Flask, FastAPI\n2. **Наука о данных**: NumPy, Pandas, Matplotlib\n3. **Машинное обучение**: TensorFlow, PyTorch, Scikit-learn\n4. **Автоматизация**: Скрипты для автоматизации задач\n5. **Разработка игр**: Pygame, Panda3D\n6. **Мобильная разработка**: Kivy, BeeWare\n7. **Системное администрирование**: Ansible, SaltStack\n8. **Финансовые технологии**: QuantLib, Zipline",
            "timestamp": "2024-01-15T10:35:02Z",
            "tokens_used": 180,
            "response_time": 2.1
        }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T15:30:00Z"
}
```

#### 4. Отправка сообщения в сессию

**Запрос:**
```http
POST /api/v1/gemini/chat-sessions/1/send_message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "content": "Как начать изучение Python?"
}
```

**Ответ:**
```json
{
    "user_message": {
        "id": 26,
        "session": 1,
        "role": "user",
        "content": "Как начать изучение Python?",
        "timestamp": "2024-01-20T16:05:00Z",
        "tokens_used": 8,
        "response_time": null
    },
    "assistant_message": {
        "id": 27,
        "session": 1,
        "role": "assistant",
        "content": "Отличный вопрос! Вот пошаговый план изучения Python:\n\n**1. Основы языка:**\n- Установка Python и настройка среды разработки\n- Переменные, типы данных, операторы\n- Условия (if/elif/else) и циклы (for/while)\n- Функции и модули\n\n**2. Структуры данных:**\n- Списки, словари, кортежи, множества\n- Работа с файлами\n\n**3. Объектно-ориентированное программирование:**\n- Классы и объекты\n- Наследование и полиморфизм\n\n**4. Практические проекты:**\n- Создание простых программ\n- Работа с API\n- Создание веб-приложений\n\n**Рекомендуемые ресурсы:**\n- Официальная документация Python\n- Codecademy, Coursera\n- Практические задачи на LeetCode, HackerRank",
        "timestamp": "2024-01-20T16:05:03Z",
        "tokens_used": 220,
        "response_time": 2.8
    }
}
```

#### 5. Статистика сессий

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/stats/
Authorization: Session YOUR_SESSION_ID
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
            "id": 15,
            "user": 1,
            "user_username": "admin",
            "title": "Машинное обучение",
            "is_active": true,
            "messages_count": 8,
            "last_message": {
                "id": 245,
                "role": "assistant",
                "content": "Машинное обучение - это область искусственного интеллекта...",
                "timestamp": "2024-01-20T16:00:00Z"
            },
            "created_at": "2024-01-19T14:00:00Z",
            "updated_at": "2024-01-20T16:00:00Z"
        },
        {
            "id": 14,
            "user": 1,
            "user_username": "admin",
            "title": "Веб-разработка",
            "is_active": true,
            "messages_count": 15,
            "last_message": {
                "id": 240,
                "role": "user",
                "content": "Спасибо за подробный ответ!",
                "timestamp": "2024-01-20T15:45:00Z"
            },
            "created_at": "2024-01-19T10:30:00Z",
            "updated_at": "2024-01-20T15:45:00Z"
        }
    ]
}
```

### ChatMessageViewSet

#### 1. Получение списка сообщений

**Запрос:**
```http
GET /api/v1/gemini/chat-messages/
Authorization: Session YOUR_SESSION_ID
```

**Ответ:**
```json
{
    "count": 245,
    "next": "http://localhost:8000/api/v1/gemini/chat-messages/?page=2",
    "previous": null,
    "results": [
        {
            "id": 245,
            "session": 15,
            "role": "assistant",
            "content": "Машинное обучение - это область искусственного интеллекта...",
            "timestamp": "2024-01-20T16:00:00Z",
            "tokens_used": 180,
            "response_time": 2.8
        },
        {
            "id": 244,
            "session": 15,
            "role": "user",
            "content": "Как работает машинное обучение?",
            "timestamp": "2024-01-20T15:58:00Z",
            "tokens_used": 8,
            "response_time": null
        },
        {
            "id": 243,
            "session": 14,
            "role": "user",
            "content": "Спасибо за подробный ответ!",
            "timestamp": "2024-01-20T15:45:00Z",
            "tokens_used": 6,
            "response_time": null
        }
    ]
}
```

#### 2. Получение последних сообщений

**Запрос:**
```http
GET /api/v1/gemini/chat-messages/recent/
Authorization: Session YOUR_SESSION_ID
```

**Ответ:**
```json
[
    {
        "id": 245,
        "session": 15,
        "role": "assistant",
        "content": "Машинное обучение - это область искусственного интеллекта...",
        "timestamp": "2024-01-20T16:00:00Z",
        "tokens_used": 180,
        "response_time": 2.8
    },
    {
        "id": 244,
        "session": 15,
        "role": "user",
        "content": "Как работает машинное обучение?",
        "timestamp": "2024-01-20T15:58:00Z",
        "tokens_used": 8,
        "response_time": null
    },
    {
        "id": 243,
        "session": 14,
        "role": "user",
        "content": "Спасибо за подробный ответ!",
        "timestamp": "2024-01-20T15:45:00Z",
        "tokens_used": 6,
        "response_time": null
    },
    {
        "id": 242,
        "session": 14,
        "role": "assistant",
        "content": "Веб-разработка включает в себя создание веб-сайтов и веб-приложений...",
        "timestamp": "2024-01-20T15:44:30Z",
        "tokens_used": 200,
        "response_time": 3.2
    },
    {
        "id": 241,
        "session": 14,
        "role": "user",
        "content": "Расскажи о веб-разработке",
        "timestamp": "2024-01-20T15:44:00Z",
        "tokens_used": 7,
        "response_time": null
    }
]
```

### GeminiApiViewSet

#### 1. Анализ текста

**Запрос:**
```http
POST /api/v1/gemini/api/analyze_text/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "prompt": "Анализируй следующий текст и выдели основные темы",
    "max_tokens": 1000,
    "temperature": 0.7,
    "save_to_session": true,
    "session_id": 1
}
```

**Ответ:**
```json
{
    "success": true,
    "analysis": "Анализ текста выполнен успешно. Выявлены следующие основные темы:\n1. Технологии\n2. Программирование\n3. Образование\n4. Карьера",
    "tokens_used": 85,
    "response_time": 1.5
}
```

#### 2. Генерация ответа

**Запрос:**
```http
POST /api/v1/gemini/api/generate_response/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "prompt": "Создай краткое резюме о преимуществах Python",
    "max_tokens": 500,
    "temperature": 0.5
}
```

**Ответ:**
```json
{
    "success": true,
    "response": "**Преимущества Python:**\n\n1. **Простота изучения** - интуитивный синтаксис\n2. **Универсальность** - подходит для разных задач\n3. **Богатая экосистема** - множество библиотек\n4. **Активное сообщество** - поддержка и развитие\n5. **Кроссплатформенность** - работает везде\n6. **Высокая производительность** - оптимизированные библиотеки",
    "tokens_used": 120,
    "response_time": 2.1
}
```

---

## 🔗 JSON API Examples

### 1. Отправка сообщения (AJAX)

**Запрос:**
```http
POST /gemini/send-message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "session_id": 1,
    "message": "Привет, как дела?"
}
```

**Ответ:**
```json
{
    "success": true,
    "response": "Привет! У меня всё отлично, спасибо! Как дела у тебя? Чем могу помочь?",
    "user_message_id": 26,
    "assistant_message_id": 27,
    "metadata": {
        "response_time": 2.1,
        "usage_metadata": {
            "totalTokenCount": 25,
            "promptTokenCount": 8,
            "candidatesTokenCount": 17
        },
        "finish_reason": "STOP",
        "safety_ratings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "probability": "NEGLIGIBLE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "probability": "NEGLIGIBLE"
            }
        ]
    }
}
```

### 2. Тестирование API ключа

**Запрос:**
```http
POST /gemini/test-api-key/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "api_key": "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Ответ (успех):**
```json
{
    "success": true,
    "message": "Подключение к Gemini API успешно установлено"
}
```

**Ответ (ошибка):**
```json
{
    "success": false,
    "error": "API ключ не может быть пустым"
}
```

### 3. Обновление названия сессии

**Запрос:**
```http
POST /gemini/sessions/1/update-title/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "title": "Обновленное название сессии"
}
```

**Ответ:**
```json
{
    "success": true,
    "title": "Обновленное название сессии"
}
```

---

## ⚠️ Error Handling Examples

### 1. Ошибки валидации

**Запрос:**
```http
POST /api/v1/gemini/chat-sessions/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "title": ""
}
```

**Ответ:**
```json
{
    "title": [
        "Это поле не может быть пустым."
    ]
}
```

### 2. Ошибки API ключа

**Запрос:**
```http
POST /gemini/send-message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "session_id": 1,
    "message": "Привет"
}
```

**Ответ:**
```json
{
    "success": false,
    "error": "API ключ не настроен"
}
```

### 3. Ошибки Gemini API

**Запрос:**
```http
POST /gemini/send-message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "session_id": 1,
    "message": "Привет"
}
```

**Ответ:**
```json
{
    "success": false,
    "error": "Модель Gemini перегружена. Пожалуйста, попробуйте позже."
}
```

### 4. Ошибки сессии

**Запрос:**
```http
POST /gemini/send-message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "session_id": 999,
    "message": "Привет"
}
```

**Ответ:**
```json
{
    "success": false,
    "error": "Неверные параметры запроса: отсутствует session_id"
}
```

### 5. Ошибки валидации сообщений

**Запрос:**
```http
POST /api/v1/gemini/chat-sessions/1/send_message/
Content-Type: application/json
Authorization: Session YOUR_SESSION_ID

{
    "role": "invalid_role",
    "content": "Тест"
}
```

**Ответ:**
```json
{
    "role": [
        "Неверная роль сообщения"
    ],
    "content": [
        "Это поле обязательно для заполнения."
    ]
}
```

---

## 🔐 Authentication Examples

### 1. Успешная аутентификация

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/
Authorization: Session abc123def456ghi789
Cookie: sessionid=abc123def456ghi789; csrftoken=xyz789uvw456rst123
```

**Ответ:**
```json
{
    "count": 15,
    "results": [...]
}
```

### 2. Неавторизованный доступ

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/
```

**Ответ:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "detail": "Authentication credentials were not provided."
}
```

### 3. Неверные учетные данные

**Запрос:**
```http
GET /api/v1/gemini/chat-sessions/
Authorization: Session invalid_session_id
```

**Ответ:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "detail": "Invalid session."
}
```

---

## 📊 Data Models Examples

### 1. ChatSession Model

```json
{
    "id": 1,
    "user": 1,
    "title": "Python разработка",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T15:30:00Z",
    "is_active": true
}
```

### 2. ChatMessage Model

```json
{
    "id": 1,
    "session": 1,
    "role": "user",
    "content": "Расскажи о Python",
    "timestamp": "2024-01-15T10:30:00Z",
    "tokens_used": 5,
    "response_time": null
}
```

```json
{
    "id": 2,
    "session": 1,
    "role": "assistant",
    "content": "Python - это высокоуровневый язык программирования...",
    "timestamp": "2024-01-15T10:30:01Z",
    "tokens_used": 150,
    "response_time": 1.2
}
```

### 3. Полная структура сессии с сообщениями

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
            "response_time": null
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

### 4. Статистика пользователя

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
            "id": 15,
            "title": "Машинное обучение",
            "messages_count": 8,
            "updated_at": "2024-01-20T16:00:00Z"
        }
    ]
}
```

### 5. Метаданные Gemini API

```json
{
    "response_time": 2.1,
    "usage_metadata": {
        "totalTokenCount": 25,
        "promptTokenCount": 8,
        "candidatesTokenCount": 17
    },
    "finish_reason": "STOP",
    "safety_ratings": [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "probability": "NEGLIGIBLE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "probability": "NEGLIGIBLE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "probability": "NEGLIGIBLE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "probability": "NEGLIGIBLE"
        }
    ]
}
```

---

## 🚀 Заключение

Данные примеры демонстрируют полную функциональность API приложения Gemini:

1. **REST API** - полный CRUD для сессий и сообщений
2. **JSON API** - AJAX операции для веб-интерфейса
3. **Обработка ошибок** - детальные сообщения об ошибках
4. **Аутентификация** - безопасный доступ к API
5. **Модели данных** - структурированная информация

Все примеры готовы к использованию в реальных приложениях и тестировании API.

---

**Дата обновления:** 2024-01-20  
**Версия:** 1.0.0  
**Статус:** Production Ready ✅
