#!/bin/bash

# Скрипт для запуска всех сервисов Telegram интеграции

echo "🚀 Запуск сервисов Telegram интеграции..."

# Проверяем наличие переменных окружения
if [ -z "$TG_API_ID" ] || [ -z "$TG_API_HASH" ]; then
    echo "❌ Ошибка: Не установлены переменные окружения TG_API_ID и TG_API_HASH"
    echo "   Установите их в .env файле или экспортируйте в shell:"
    echo "   export TG_API_ID=your_api_id"
    echo "   export TG_API_HASH=your_api_hash"
    exit 1
fi

# Создаем папку для сессий
mkdir -p sessions

# Проверяем подключение к Redis
echo "🔍 Проверка Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis не запущен. Запустите Redis:"
    echo "   brew services start redis  # на macOS"
    echo "   sudo systemctl start redis # на Linux"
    exit 1
fi
echo "✅ Redis работает"

# Применяем миграции
echo "📦 Применение миграций..."
python3 manage.py migrate

# Запускаем обработчик очереди в фоне
echo "🔄 Запуск обработчика очереди..."
python3 manage.py process_telegram_queue &
QUEUE_PID=$!

# Ждем немного для инициализации
sleep 2

# Запускаем Telethon сервис в фоне
echo "📱 Запуск Telethon сервиса..."
python3 manage.py run_telethon &
TELETHON_PID=$!

# Запускаем Django сервер
echo "🌐 Запуск Django сервера..."
echo "   Откройте http://localhost:8000/telegram/ для мониторинга"
echo "   Нажмите Ctrl+C для остановки всех сервисов"

# Функция для остановки всех процессов
cleanup() {
    echo ""
    echo "⏹️ Остановка сервисов..."
    kill $QUEUE_PID 2>/dev/null
    kill $TELETHON_PID 2>/dev/null
    echo "✅ Все сервисы остановлены"
    exit 0
}

# Устанавливаем обработчик сигналов
trap cleanup SIGINT SIGTERM

# Запускаем Django сервер в foreground
python3 manage.py runserver 0.0.0.0:8000
