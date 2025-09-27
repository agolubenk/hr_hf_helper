# Gemini App Documentation

## Обзор

Приложение `gemini` обеспечивает интеграцию с Google Gemini AI для предоставления интеллектуальных возможностей в системе HR Helper. Оно позволяет пользователям взаимодействовать с AI через чат-интерфейс, получать AI-анализ и рекомендации для различных HR процессов.

## Основные функции

- **Чат-интерфейс** с Google Gemini AI
- **Управление сессиями чата** с историей сообщений
- **Настройка API ключей** для каждого пользователя
- **AI-анализ** для HR процессов (время интервью, скрининги)
- **Метрики и статистика** использования AI
- **Безопасность** и обработка ошибок API

## Модели данных

### ChatSession (Сессия чата)
Модель для хранения сессий чата с Gemini AI.

**Поля:**
- `id` - Уникальный идентификатор
- `user` - Связь с пользователем (ForeignKey)
- `title` - Название сессии (CharField, max_length=200)
- `created_at` - Дата создания (DateTimeField, auto_now_add=True)
- `updated_at` - Дата обновления (DateTimeField, auto_now=True)
- `is_active` - Активна ли сессия (BooleanField, default=True)

**Методы:**
- `__str__()` - Возвращает строковое представление сессии

### ChatMessage (Сообщение чата)
Модель для хранения сообщений в чате.

**Поля:**
- `id` - Уникальный идентификатор
- `session` - Связь с сессией чата (ForeignKey)
- `role` - Роль отправителя (CharField, choices=ROLE_CHOICES)
- `content` - Содержание сообщения (TextField)
- `timestamp` - Время отправки (DateTimeField, auto_now_add=True)
- `tokens_used` - Количество использованных токенов (IntegerField, null=True, blank=True)
- `response_time` - Время ответа в секундах (FloatField, null=True, blank=True)

**Константы:**
- `ROLE_CHOICES` - Выбор ролей: 'user', 'assistant', 'system'

**Методы:**
- `__str__()` - Возвращает краткое представление сообщения

## Сервисы

### GeminiService
Основной сервис для работы с Google Gemini API.

**Константы:**
- `BASE_URL` - Базовый URL API: "https://generativelanguage.googleapis.com/v1beta"
- `MODEL` - Используемая модель: "gemini-2.0-flash"

**Методы:**

#### `__init__(api_key: str)`
Инициализация сервиса с API ключом.

**Параметры:**
- `api_key` - API ключ для доступа к Gemini API

**Исключения:**
- `ValidationError` - Если API ключ пустой

#### `_make_request(endpoint: str, data: Dict, max_retries: int = 2) -> Tuple[bool, Dict, Optional[str]]`
Выполняет запрос к Gemini API с повторными попытками.

**Параметры:**
- `endpoint` - Конечная точка API
- `data` - Данные для отправки
- `max_retries` - Максимальное количество повторных попыток

**Возвращает:**
- `Tuple[bool, Dict, Optional[str]]` - (успех, ответ, ошибка)

**Обработка ошибок:**
- 503 - Модель перегружена, повторные попытки с задержкой
- 429 - Превышен лимит запросов, повторные попытки с задержкой
- 400 - Неверный запрос
- Timeout - Превышено время ожидания
- ConnectionError - Ошибка подключения

#### `generate_content(prompt: str, history: List[Dict] = None) -> Tuple[bool, str, Dict]`
Генерирует контент с помощью Gemini API.

**Параметры:**
- `prompt` - Текст запроса пользователя
- `history` - История предыдущих сообщений

**Возвращает:**
- `Tuple[bool, str, Dict]` - (успех, ответ, метаданные)

**Конфигурация:**
- `temperature: 0.7` - Креативность ответов
- `topK: 40` - Ограничение словаря
- `topP: 0.95` - Накопительная вероятность
- `maxOutputTokens: 2048` - Максимальная длина ответа

**Настройки безопасности:**
- `HARM_CATEGORY_HARASSMENT: BLOCK_MEDIUM_AND_ABOVE`
- `HARM_CATEGORY_HATE_SPEECH: BLOCK_MEDIUM_AND_ABOVE`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_MEDIUM_AND_ABOVE`
- `HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_MEDIUM_AND_ABOVE`

#### `test_connection() -> Tuple[bool, str]`
Тестирует подключение к Gemini API.

**Возвращает:**
- `Tuple[bool, str]` - (успех, сообщение)

#### `get_available_models() -> Tuple[bool, List[str], Optional[str]]`
Получает список доступных моделей.

**Возвращает:**
- `Tuple[bool, List[str], Optional[str]]` - (успех, модели, ошибка)

## API Endpoints

### Основные страницы
- `GET /` - Главная страница Gemini AI (dashboard)
- `GET /chat/` - Создание новой сессии чата
- `GET /chat/<int:session_id>/` - Страница чата с существующей сессией
- `GET /settings/` - Страница настроек API ключа

### AJAX endpoints
- `POST /api/send-message/` - Отправка сообщения в чат
- `POST /api/test-api-key/` - Тестирование API ключа

### Управление сессиями
- `POST /session/<int:session_id>/delete/` - Удаление сессии чата
- `POST /session/<int:session_id>/update-title/` - Обновление названия сессии

## Представления (Views)

### gemini_dashboard
Главная страница Gemini AI с обзором активных сессий чата.

**Функциональность:**
- Проверка наличия API ключа у пользователя
- Получение активных сессий чата (последние 10)
- Отображение статистики использования

### chat_session
Страница чата с Gemini AI.

**Функциональность:**
- Проверка API ключа пользователя
- Получение или создание сессии чата
- Загрузка истории сообщений
- Отображение всех сессий пользователя в сайдбаре

**Параметры:**
- `session_id` (опционально) - ID существующей сессии

### settings
Страница настроек API ключа.

**Функциональность:**
- Отображение текущего API ключа
- Сохранение нового API ключа
- Тестирование API ключа перед сохранением

### send_message
AJAX endpoint для отправки сообщения в чат.

**Функциональность:**
- Валидация параметров запроса
- Сохранение сообщения пользователя
- Получение истории сообщений для контекста
- Отправка запроса к Gemini API
- Сохранение ответа ассистента
- Обновление времени последнего обновления сессии

**Параметры запроса:**
- `session_id` - ID сессии чата
- `message` - Текст сообщения

**Возвращает:**
- JSON с результатом обработки сообщения

### delete_session
Удаление сессии чата (мягкое удаление).

**Функциональность:**
- Установка флага `is_active = False`
- Перенаправление на главную страницу

### test_api_key
AJAX endpoint для тестирования API ключа.

**Функциональность:**
- Валидация API ключа
- Тестирование подключения к Gemini API
- Возврат результата тестирования

### update_session_title
Обновление названия сессии чата.

**Функциональность:**
- Валидация нового названия
- Обновление названия сессии
- Возврат обновленного названия

## Сериализаторы

### ChatMessageSerializer
Сериализатор для сообщений чата.

**Поля:**
- `id` - Уникальный идентификатор (read-only)
- `session` - ID сессии
- `role` - Роль отправителя
- `content` - Содержание сообщения
- `timestamp` - Время отправки (read-only)
- `tokens_used` - Количество токенов
- `response_time` - Время ответа

### ChatSessionSerializer
Сериализатор для сессий чата.

**Поля:**
- `id` - Уникальный идентификатор (read-only)
- `user` - ID пользователя
- `user_username` - Имя пользователя (read-only)
- `title` - Название сессии
- `is_active` - Активна ли сессия
- `messages_count` - Количество сообщений (read-only)
- `last_message` - Последнее сообщение (read-only)
- `created_at` - Дата создания (read-only)
- `updated_at` - Дата обновления (read-only)

**Методы:**
- `get_messages_count()` - Возвращает количество сообщений
- `get_last_message()` - Возвращает последнее сообщение

### ChatSessionDetailSerializer
Детальный сериализатор для сессий чата с сообщениями.

**Поля:**
- Все поля из `ChatSessionSerializer`
- `messages` - Список сообщений (read-only)

### ChatMessageCreateSerializer
Сериализатор для создания сообщений чата.

**Поля:**
- `session` - ID сессии
- `role` - Роль отправителя
- `content` - Содержание сообщения

**Валидация:**
- `validate_role()` - Проверка корректности роли

### ChatSessionCreateSerializer
Сериализатор для создания сессий чата.

**Поля:**
- `title` - Название сессии

**Методы:**
- `create()` - Создание сессии с автоматическим назначением пользователя

### GeminiApiRequestSerializer
Сериализатор для запросов к Gemini API.

**Поля:**
- `prompt` - Текст запроса (max_length=4000)
- `session_id` - ID сессии (опционально)
- `max_tokens` - Максимум токенов (default=1000, min=1, max=4000)
- `temperature` - Температура (default=0.7, min=0.0, max=1.0)
- `save_to_session` - Сохранить в сессию (default=True)

**Валидация:**
- Проверка диапазонов для `max_tokens` и `temperature`

### GeminiStatsSerializer
Сериализатор для статистики Gemini.

**Поля:**
- `total_sessions` - Общее количество сессий
- `active_sessions` - Количество активных сессий
- `total_messages` - Общее количество сообщений
- `total_tokens_used` - Общее количество использованных токенов
- `average_response_time` - Среднее время ответа
- `sessions_by_user` - Сессии по пользователям
- `recent_sessions` - Последние сессии
- `top_prompts` - Популярные запросы

## Интеграции

### С приложением accounts
- Использует модель `User` для связи сессий с пользователями
- API ключ Gemini хранится в профиле пользователя (`user.gemini_api_key`)

### С приложением google_oauth
- AI-анализ времени для инвайтов (`invite.analyze_time_with_gemini()`)
- AI-анализ HR-скринингов (`hr_screening.analyze_with_gemini()`)

### С приложением vacancies
- AI-анализ вакансий и кандидатов
- Генерация описаний и рекомендаций

### С приложением huntflow
- Анализ данных кандидатов
- Генерация отчетов и выводов

## Настройки

### Обязательные настройки в settings.py
```python
# Google Gemini API настройки (опционально, можно настроить на уровне пользователя)
GEMINI_API_KEY = 'your-gemini-api-key'  # Глобальный API ключ (опционально)

# Настройки модели
GEMINI_MODEL = 'gemini-2.0-flash'
GEMINI_MAX_TOKENS = 2048
GEMINI_TEMPERATURE = 0.7
```

### Настройки безопасности
```python
# Настройки безопасности для Gemini API
GEMINI_SAFETY_SETTINGS = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH", 
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
]
```

## Примеры использования

### Создание новой сессии чата
```python
from apps.gemini.models import ChatSession
from django.utils import timezone

# Создание новой сессии
session = ChatSession.objects.create(
    user=request.user,
    title=f"Чат {timezone.now().strftime('%d.%m.%Y %H:%M')}"
)
```

### Отправка сообщения в чат
```python
from apps.gemini.services import GeminiService
from apps.gemini.models import ChatMessage

# Получение API ключа пользователя
api_key = request.user.gemini_api_key

if api_key:
    # Создание сервиса
    gemini_service = GeminiService(api_key)
    
    # Получение истории сообщений
    history_messages = ChatMessage.objects.filter(
        session=chat_session
    ).order_by('timestamp')[:20]
    
    history = []
    for msg in history_messages:
        history.append({
            'role': msg.role,
            'content': msg.content
        })
    
    # Отправка запроса к Gemini
    success, response, metadata = gemini_service.generate_content(
        message, 
        history
    )
    
    if success:
        # Сохранение ответа
        ChatMessage.objects.create(
            session=chat_session,
            role='assistant',
            content=response,
            tokens_used=metadata.get('usage_metadata', {}).get('totalTokenCount'),
            response_time=metadata.get('response_time')
        )
```

### Тестирование API ключа
```python
from apps.gemini.services import GeminiService

# Тестирование подключения
gemini_service = GeminiService(api_key)
success, message = gemini_service.test_connection()

if success:
    print("API ключ работает корректно")
else:
    print(f"Ошибка: {message}")
```

### Получение доступных моделей
```python
from apps.gemini.services import GeminiService

# Получение списка моделей
gemini_service = GeminiService(api_key)
success, models, error = gemini_service.get_available_models()

if success:
    print(f"Доступные модели: {models}")
else:
    print(f"Ошибка: {error}")
```

### AI-анализ времени для инвайта
```python
from apps.gemini.services import GeminiService
from apps.google_oauth.models import Invite

# Получение инвайта
invite = Invite.objects.get(id=invite_id)

# Анализ времени с помощью Gemini
if request.user.gemini_api_key:
    gemini_service = GeminiService(request.user.gemini_api_key)
    
    prompt = f"""
    Проанализируй оптимальное время для интервью с кандидатом:
    Кандидат: {invite.candidate_name}
    Позиция: {invite.vacancy_title}
    Предложенное время: {invite.interview_datetime}
    
    Учти рабочие часы, часовой пояс и другие факторы.
    """
    
    success, response, metadata = gemini_service.generate_content(prompt)
    
    if success:
        # Сохранение анализа
        invite.gemini_analysis = response
        invite.save()
```

## Обработка ошибок

### Ошибки API
- **503** - Модель перегружена, повторные попытки с задержкой
- **429** - Превышен лимит запросов, повторные попытки с задержкой
- **400** - Неверный запрос, проверка параметров
- **Timeout** - Превышено время ожидания
- **ConnectionError** - Ошибка подключения к API

### Ошибки валидации
- Пустой API ключ
- Неверный формат JSON
- Отсутствующие параметры запроса
- Некорректные значения параметров

### Обработка ошибок в коде
```python
try:
    gemini_service = GeminiService(api_key)
    success, response, metadata = gemini_service.generate_content(prompt)
    
    if not success:
        logger.error(f"Ошибка Gemini API: {response}")
        # Обработка ошибки
        
except ValidationError as e:
    logger.error(f"Ошибка валидации: {e}")
    # Обработка ошибки валидации
    
except Exception as e:
    logger.error(f"Неожиданная ошибка: {e}")
    # Обработка неожиданной ошибки
```

## Безопасность

### API ключи
- API ключи хранятся в профиле пользователя
- Тестирование ключей перед сохранением
- Валидация ключей при каждом запросе

### Настройки безопасности Gemini
- Блокировка контента с высоким уровнем вреда
- Настройки безопасности для всех категорий контента
- Обработка safety ratings в ответах

### Защита данных
- Ограничение доступа к сессиям по пользователям
- Мягкое удаление сессий
- Логирование всех операций

## Производительность

### Кэширование
- Кэширование истории сообщений для контекста
- Ограничение истории до последних 20 сообщений
- Оптимизация запросов к базе данных

### Ограничения API
- Максимальная длина запроса: 4000 символов
- Максимальная длина ответа: 2048 токенов
- Таймаут запросов: 30 секунд
- Повторные попытки при ошибках

### Метрики
- Отслеживание времени ответа
- Подсчет использованных токенов
- Статистика использования по пользователям

## Мониторинг и логирование

### Логирование
- Логирование всех API запросов
- Логирование ошибок и исключений
- Отладочная информация для диагностики

### Метрики
- Количество сессий и сообщений
- Использование токенов
- Время ответа API
- Статистика по пользователям

### Мониторинг
- Отслеживание ошибок API
- Мониторинг производительности
- Контроль лимитов API

## Заключение

Приложение `gemini` предоставляет мощные возможности для интеграции с Google Gemini AI в системе HR Helper. Оно обеспечивает интуитивный чат-интерфейс, надежную обработку ошибок и интеграцию с другими компонентами системы для AI-анализа HR процессов. Архитектура приложения построена на принципах безопасности, производительности и масштабируемости.
