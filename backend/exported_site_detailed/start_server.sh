#!/bin/bash

echo "🚀 Запуск сервера для HR Helper статического сайта"
echo "📁 Директория: $(pwd)"
echo "🌐 Порт: 8000"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "index.html" ]; then
    echo "❌ Ошибка: index.html не найден в текущей директории"
    echo "Убедитесь, что вы находитесь в папке exported_site_detailed"
    exit 1
fi

echo "✅ index.html найден"
echo "🚀 Запускаем сервер..."
echo ""
echo "Откройте в браузере: http://localhost:8000"
echo "Для остановки нажмите Ctrl+C"
echo ""

python3 -m http.server 8000

