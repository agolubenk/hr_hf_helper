# Telegram App Documentation

## Обзор

Приложение `telegram` обеспечивает интеграцию с Telegram API через библиотеку Telethon для управления чатами, сообщениями, контактами и автоматизацией. Включает обработку событий, логирование операций и веб-интерфейс для управления Telegram интеграцией.

## Основные функции

- Интеграция с Telegram API через Telethon
- Управление чатами, сообщениями и контактами
- Автоматические ответы на основе ключевых слов
- Логирование всех операций и событий
- Веб-интерфейс для управления чатами и автоматизацией
- API endpoints для интеграции с другими модулями
- Управление сессиями и ботами
- Обработка различных типов сообщений (текст, фото, видео, документы)

## Модели данных

### TelegramChat (Telegram чат)
Модель для хранения информации о Telegram чатах.

**Поля:**
- `chat_id` (BigIntegerField): Уникальный ID чата в Telegram.
- `title` (CharField): Название чата.
- `chat_type` (CharField): Тип чата (private, group, supergroup, channel).
- `username` (CharField): Username чата (если есть).
- `is_active` (BooleanField): Активен ли чат.
- `created_at` (DateTimeField): Дата создания записи.
- `updated_at` (DateTimeField): Дата обновления записи.

### TelegramMessage (Telegram сообщение)
Модель для хранения Telegram сообщений.

**Поля:**
- `message_id` (BigIntegerField): ID сообщения в Telegram.
- `chat` (ForeignKey к `TelegramChat`): Чат, в котором отправлено сообщение.
- `sender_id` (BigIntegerField): ID отправителя.
- `sender_username` (CharField): Username отправителя.
- `sender_first_name` (CharField): Имя отправителя.
- `sender_last_name` (CharField): Фамилия отправителя.
- `text` (TextField): Текст сообщения.
- `message_type` (CharField): Тип сообщения (text, photo, video, document, voice, sticker, other).
- `is_reply` (BooleanField): Является ли сообщение ответом.
- `reply_to_message_id` (BigIntegerField): ID сообщения, на которое отвечает.
- `date` (DateTimeField): Дата отправки сообщения.
- `is_read` (BooleanField): Прочитано ли сообщение.
- `created_at` (DateTimeField): Дата создания записи.

### TelegramContact (Telegram контакт)
Модель для хранения контактов Telegram.

**Поля:**
- `user_id` (BigIntegerField): Уникальный ID пользователя в Telegram.
- `username` (CharField): Username пользователя.
- `first_name` (CharField): Имя пользователя.
- `last_name` (CharField): Фамилия пользователя.
- `phone` (CharField): Номер телефона пользователя.
- `is_bot` (BooleanField): Является ли пользователь ботом.
- `is_verified` (BooleanField): Верифицирован ли пользователь.
- `is_premium` (BooleanField): Имеет ли пользователь Premium подписку.
- `created_at` (DateTimeField): Дата создания записи.
- `updated_at` (DateTimeField): Дата обновления записи.

### TelegramSession (Telegram сессия)
Модель для хранения информации о Telegram сессиях.

**Поля:**
- `name` (CharField): Название сессии.
- `phone_number` (CharField): Номер телефона для сессии.
- `is_active` (BooleanField): Активна ли сессия.
- `is_authorized` (BooleanField): Авторизована ли сессия.
- `last_activity` (DateTimeField): Время последней активности.
- `created_at` (DateTimeField): Дата создания сессии.
- `updated_at` (DateTimeField): Дата обновления сессии.

### TelegramBot (Telegram бот)
Модель для хранения настроек Telegram ботов.

**Поля:**
- `name` (CharField): Название бота.
- `token` (CharField): Токен бота.
- `username` (CharField): Username бота.
- `is_active` (BooleanField): Активен ли бот.
- `webhook_url` (URLField): URL webhook для бота.
- `created_at` (DateTimeField): Дата создания бота.
- `updated_at` (DateTimeField): Дата обновления бота.

### TelegramAutomation (Telegram автоматизация)
Модель для хранения правил автоматизации Telegram.

**Поля:**
- `name` (CharField): Название правила автоматизации.
- `description` (TextField): Описание правила.
- `trigger_keywords` (JSONField): Ключевые слова для срабатывания.
- `response_text` (TextField): Текст автоматического ответа.
- `target_chats` (ManyToManyField к `TelegramChat`): Целевые чаты для автоматизации.
- `is_active` (BooleanField): Активно ли правило.
- `created_by` (ForeignKey к `User`): Пользователь, создавший правило.
- `created_at` (DateTimeField): Дата создания правила.
- `updated_at` (DateTimeField): Дата обновления правила.

### TelegramLog (Telegram лог)
Модель для логирования действий Telegram.

**Поля:**
- `action` (CharField): Действие, которое было выполнено.
- `details` (JSONField): Детали действия в формате JSON.
- `status` (CharField): Статус выполнения (success, error, warning).
- `error_message` (TextField): Сообщение об ошибке (если есть).
- `created_at` (DateTimeField): Время выполнения действия.

## API Endpoints

API для приложения `telegram` предоставляет следующие конечные точки:

### Чаты
- `GET /telegram/chats/`: Список чатов с фильтрацией и поиском.
- `GET /telegram/chats/<int:chat_id>/`: Детальная информация о чате.

### Контакты
- `GET /telegram/contacts/`: Список контактов с поиском.

### Автоматизация
- `GET /telegram/automation/`: Список правил автоматизации.
- `GET /telegram/automation/create/`: Создание нового правила автоматизации.
- `GET /telegram/automation/<int:automation_id>/edit/`: Редактирование правила автоматизации.
- `POST /telegram/automation/<int:automation_id>/delete/`: Удаление правила автоматизации.

### Сессии и боты
- `GET /telegram/sessions/`: Управление Telegram сессиями.
- `GET /telegram/settings/`: Настройки Telegram модуля.

### Логи
- `GET /telegram/logs/`: Список логов с фильтрацией.

### AJAX endpoints
- `POST /telegram/send-message/`: Отправка сообщения через Telegram.

### API endpoints
- `POST /telegram/api/send-message/`: API для отправки сообщений.
- `GET /telegram/api/chats/`: API для получения списка чатов.

## Веб-интерфейс (Views)

Приложение предоставляет следующие веб-страницы:

- `/telegram/`: Дашборд Telegram интеграции.
- `/telegram/chats/`: Список чатов с поиском и фильтрацией по типу.
- `/telegram/chats/<chat_id>/`: Детальная информация о чате с сообщениями.
- `/telegram/contacts/`: Список контактов с поиском.
- `/telegram/automation/`: Список правил автоматизации.
- `/telegram/automation/create/`: Создание нового правила автоматизации.
- `/telegram/automation/<automation_id>/edit/`: Редактирование правила автоматизации.
- `/telegram/automation/<automation_id>/delete/`: Удаление правила автоматизации.
- `/telegram/sessions/`: Управление Telegram сессиями.
- `/telegram/logs/`: Список логов с фильтрацией по действию и статусу.
- `/telegram/settings/`: Настройки Telegram модуля.

## Обработчики событий (Receivers)

### event_handler
Основной обработчик событий Telegram, который:
- Сохраняет информацию о чатах и контактах
- Обрабатывает входящие сообщения
- Логирует все события
- Проверяет правила автоматизации

### check_automation_rules
Проверяет активные правила автоматизации и отправляет автоматические ответы при совпадении ключевых слов.

### Дополнительные обработчики
- `handle_new_participant`: Обработка новых участников в чате
- `handle_left_participant`: Обработка покинувших участников

## Типы сообщений

Поддерживаются следующие типы сообщений:
- `text`: Текстовые сообщения
- `photo`: Фотографии
- `video`: Видео
- `document`: Документы
- `voice`: Голосовые сообщения
- `sticker`: Стикеры
- `other`: Другие типы

## Типы чатов

Поддерживаются следующие типы чатов:
- `private`: Приватные чаты
- `group`: Группы
- `supergroup`: Супергруппы
- `channel`: Каналы

## Формы

### Формы автоматизации
- Форма создания правила автоматизации
- Форма редактирования правила автоматизации
- Форма подтверждения удаления правила

**Поля форм:**
- `name`: Название правила
- `description`: Описание правила
- `trigger_keywords`: Ключевые слова (через запятую)
- `response_text`: Текст ответа
- `target_chats`: Выбор целевых чатов
- `is_active`: Включить/выключить правило

## Интеграция с другими приложениями

### Accounts
- Использует модель `User` для привязки правил автоматизации к пользователям.

### Django-Telethon
- Интегрируется с `django-telethon` для управления Telegram клиентами
- Использует `DjangoSession` для хранения сессий
- Регистрирует обработчики событий через сигналы

## Безопасность и производительность

- **Токены ботов**: Безопасное хранение токенов ботов в базе данных
- **Валидация данных**: Валидация всех входящих данных
- **Логирование**: Детальное логирование всех операций для отладки
- **Обработка ошибок**: Обработка исключений в асинхронных функциях
- **Фильтрация**: Фильтрация сообщений по типу и содержимому

## Примеры использования

### Создание правила автоматизации
```python
from apps.telegram.models import TelegramAutomation, TelegramChat

# Получаем целевые чаты
chats = TelegramChat.objects.filter(is_active=True)

# Создаем правило автоматизации
automation = TelegramAutomation.objects.create(
    name='Приветствие новых пользователей',
    description='Автоматическое приветствие при упоминании ключевых слов',
    trigger_keywords=['привет', 'hello', 'hi'],
    response_text='Привет! Как дела?',
    created_by=request.user
)

# Добавляем целевые чаты
automation.target_chats.set(chats)
```

### Отправка сообщения через API
```python
import requests

# Отправка сообщения через API
response = requests.post('/telegram/api/send-message/', json={
    'chat_id': '123456789',
    'message': 'Привет из HR Helper!'
})
```

### Получение списка чатов
```python
# Получение списка активных чатов
chats = TelegramChat.objects.filter(is_active=True).values(
    'chat_id', 'title', 'chat_type', 'username'
)
```

## Обработка ошибок

### TelegramLog
Все ошибки логируются в модель `TelegramLog` с указанием:
- Действия, которое вызвало ошибку
- Деталей ошибки
- Статуса (success, error, warning)
- Сообщения об ошибке

### Исключения
- Обработка исключений Telethon
- Валидация токенов ботов
- Проверка существования чатов и контактов

## Настройки и конфигурация

### Переменные окружения
- `TELEGRAM_API_ID`: API ID для Telegram
- `TELEGRAM_API_HASH`: API Hash для Telegram
- `TELEGRAM_SESSION_NAME`: Название сессии по умолчанию

### Настройки Django
- `django_telethon` в `INSTALLED_APPS`
- Настройки для `django_telethon` в `settings.py`

## Администрирование

### Django Admin
Все модели имеют настройки для Django Admin с:
- Списками отображения
- Фильтрами
- Поиском
- Группировкой по датам
- Readonly полями для системных данных

### Логирование
- Все действия логируются в `TelegramLog`
- Логи доступны через веб-интерфейс
- Фильтрация по действию и статусу
- Пагинация для больших объемов данных
