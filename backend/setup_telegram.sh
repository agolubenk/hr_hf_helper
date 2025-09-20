#!/bin/bash

# Скрипт для настройки Telegram интеграции

echo "=== Настройка Telegram интеграции для HRHelper ==="

# Проверяем, что мы в правильной директории
if [ ! -f "manage.py" ]; then
    echo "Ошибка: Запустите скрипт из корневой директории Django проекта"
    exit 1
fi

# Устанавливаем зависимости
echo "1. Установка зависимостей..."
pip install django-telethon==1.4.0 telethon==1.34.0 django-telethon-session==1.0.0

# Выполняем миграции
echo "2. Выполнение миграций..."
python manage.py migrate

# Проверяем настройки
echo "3. Проверка настроек..."

if [ -z "$TELEGRAM_API_ID" ] || [ -z "$TELEGRAM_API_HASH" ]; then
    echo "⚠️  Внимание: Переменные окружения TELEGRAM_API_ID и TELEGRAM_API_HASH не установлены"
    echo ""
    echo "Для получения API данных:"
    echo "1. Перейдите на https://my.telegram.org/auth"
    echo "2. Войдите с номером телефона вашего Telegram аккаунта"
    echo "3. Нажмите 'API development tools'"
    echo "4. Создайте новое приложение или используйте существующее"
    echo "5. Скопируйте API ID и API Hash"
    echo ""
    echo "Установите переменные окружения:"
    echo "export TELEGRAM_API_ID='ваш_api_id'"
    echo "export TELEGRAM_API_HASH='ваш_api_hash'"
    echo ""
    echo "Или используйте команду:"
    echo "python manage.py setup_telegram --api-id YOUR_API_ID --api-hash YOUR_API_HASH"
    echo ""
else
    echo "✅ Переменные окружения настроены"
    
    # Настраиваем API
    echo "4. Настройка API..."
    python manage.py setup_telegram --api-id "$TELEGRAM_API_ID" --api-hash "$TELEGRAM_API_HASH"
fi

echo ""
echo "=== Следующие шаги ==="
echo "1. Авторизация в Telegram:"
echo "   python manage.py runtelegram --phone +375291234567"
echo ""
echo "2. Синхронизация чатов:"
echo "   python manage.py sync_telegram_chats"
echo ""
echo "3. Запуск обработчика событий (в отдельном терминале):"
echo "   python manage.py run_telegram_handler"
echo ""
echo "4. Отправка тестового сообщения:"
echo "   python manage.py send_telegram_message @username 'Привет!'"
echo ""
echo "=== Настройка завершена ==="
