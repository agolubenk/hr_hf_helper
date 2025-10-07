# Telegram Integration App

Приложение для интеграции с Telegram API через библиотеку Telethon.

## Структура проекта

```
apps/telegram/
├── models.py              # Модели Django
├── db_sessions.py         # Класс для хранения сессий в БД
├── telegram_client.py     # Основной клиент Telegram
├── views.py               # API endpoints
├── urls.py                # URL маршруты
├── admin.py               # Админ-панель
├── templates/telegram/    # HTML шаблоны
│   ├── base.html          # Базовый шаблон
│   ├── login.html         # Страница авторизации
│   └── main.html          # Главная страница с чатами
└── README.md              # Документация
```

## Установка и настройка

### 1. Установка зависимостей

```bash
pip install telethon
```

### 2. Настройка API ключей

Получите API ID и API Hash на https://my.telegram.org/auth и добавьте их в `settings.py`:

```python
# Telegram API настройки
TELEGRAM_API_ID = 11383291  # Замените на ваш API ID
TELEGRAM_API_HASH = 'cb4a2adc6b83e9f0cca5b659f407a01c'  # Замените на ваш API Hash
```

### 3. Применение миграций

```bash
python manage.py makemigrations telegram
python manage.py migrate telegram
```

## Модели

### TelegramSession
Основная модель для хранения сессий авторизации:
- `user` - связь с пользователем Django
- `name` - уникальное имя сессии
- `session_data` - данные сессии Telethon
- `is_authorized` - статус авторизации
- `created_at`, `updated_at` - временные метки

### TelegramUser
Дополнительная модель для хранения информации о пользователе Telegram:
- `user` - связь с пользователем Django
- `telegram_id` - ID в Telegram
- `username`, `first_name`, `last_name` - данные профиля
- `phone` - номер телефона
- `auth_date` - дата авторизации

### AuthAttempt
Модель для отслеживания попыток авторизации:
- `telegram_user` - связь с пользователем
- `attempt_type` - тип попытки (qr, phone, 2fa)
- `status` - статус (pending, success, failed, timeout)
- `error_message` - сообщение об ошибке

## API Endpoints

### Основные страницы
- `GET /telegram/` - главная страница (авторизация или чаты)

### API для авторизации
- `GET /telegram/session/status/` - проверка статуса сессии
- `POST /telegram/auth/phone/` - отправка кода на телефон
- `POST /telegram/auth/verify/` - проверка кода авторизации
- `GET /telegram/auth/qr/` - генерация QR кода
- `GET /telegram/auth/qr/status/` - проверка статуса QR авторизации

### API для работы с чатами
- `GET /telegram/chats/` - список чатов
- `GET /telegram/chats/<chat_id>/messages/` - сообщения чата
- `GET /telegram/user/info/` - информация о пользователе

### API для управления сессией
- `POST /telegram/session/reset/` - сброс сессии
- `GET /telegram/session/info/` - информация о сессии

## Использование

### 1. Авторизация по телефону

```javascript
// Отправка кода
await fetch('/telegram/auth/phone/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({phone: '+7XXXXXXXXXX'})
});

// Проверка кода
await fetch('/telegram/auth/verify/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        phone: '+7XXXXXXXXXX',
        code: '12345',
        password: '2fa_password' // опционально
    })
});
```

### 2. Авторизация по QR коду

```javascript
// Генерация QR кода
const response = await fetch('/telegram/auth/qr/');
const data = await response.json();
const qrUrl = data.url;

// Проверка статуса авторизации
const statusResponse = await fetch('/telegram/auth/qr/status/');
const status = await statusResponse.json();
```

### 3. Получение чатов и сообщений

```javascript
// Список чатов
const chats = await fetch('/telegram/chats/').then(r => r.json());

// Сообщения чата
const messages = await fetch('/telegram/chats/123456789/messages/').then(r => r.json());
```

## Безопасность

- Все API endpoints требуют авторизации пользователя
- Сессии хранятся в зашифрованном виде в базе данных
- API ключи должны храниться в переменных окружения в продакшене
- Реализованы ограничения на количество попыток авторизации

## Логирование

Все операции логируются через стандартный Django logger с именем `apps.telegram`:

```python
import logging
logger = logging.getLogger('apps.telegram')
logger.info("Операция выполнена успешно")
logger.error("Произошла ошибка")
```

## Развертывание

### Переменные окружения для продакшена

```bash
export TELEGRAM_API_ID="12345678"
export TELEGRAM_API_HASH="your_api_hash_here"
```

### Настройки в settings.py

```python
# Для продакшена используйте переменные окружения
TELEGRAM_API_ID = os.getenv('TELEGRAM_API_ID')
TELEGRAM_API_HASH = os.getenv('TELEGRAM_API_HASH')
```

## Troubleshooting

### Проблемы с авторизацией
1. Проверьте правильность API ID и API Hash
2. Убедитесь, что номер телефона указан в международном формате
3. Для 2FA введите пароль при авторизации

### Проблемы с подключением
1. Проверьте интернет-соединение
2. Убедитесь, что серверы Telegram доступны
3. Проверьте логи Django для детальной информации об ошибках

### Очистка сессий
```python
from apps.telegram.models import TelegramSession
TelegramSession.objects.filter(is_authorized=False).delete()
```
