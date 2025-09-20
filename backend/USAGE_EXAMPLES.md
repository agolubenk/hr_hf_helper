# 📖 Примеры использования HR Helper

## 🚀 Запуск приложения

### Автоматический запуск (рекомендуется)
```bash
cd backend
./start_services.sh
```

### Ручной запуск
```bash
# Терминал 1 - Redis
brew services start redis

# Терминал 2 - Celery
cd backend && source venv/bin/activate
PYTHONPATH=$(pwd) celery -A hrhelper worker --loglevel=info

# Терминал 3 - Django
cd backend && source venv/bin/activate
python manage.py runserver 8000
```

## 📋 Массовый импорт ClickUp → Huntflow

### 1. Настройка ClickUp
1. Перейдите на страницу настроек ClickUp
2. Введите ваш API ключ ClickUp
3. Выберите Team ID, Space ID и List ID
4. Сохраните настройки

### 2. Запуск массового импорта
1. Откройте http://127.0.0.1:8000/clickup/bulk-import/
2. Нажмите кнопку "Запустить массовый импорт"
3. Следите за прогрессом на странице

### 3. Мониторинг процесса
```bash
# Проверка статуса сервисов
./check_services.sh

# Просмотр логов Celery
tail -f logs/celery.log

# Просмотр активных задач
celery -A hrhelper inspect active
```

## 📅 Работа с Google Calendar

### 1. Настройка OAuth
1. Перейдите в настройки Google OAuth
2. Авторизуйтесь через Google
3. Разрешите доступ к календарю

### 2. Синхронизация событий
1. Откройте страницу календаря
2. Нажмите "Синхронизировать"
3. События автоматически загрузятся

## 🔍 Мониторинг и отладка

### Проверка статуса всех сервисов
```bash
./check_services.sh
```

### Просмотр логов
```bash
# Django логи
tail -f logs/django.log

# Celery логи
tail -f logs/celery.log

# Все логи одновременно
tail -f logs/*.log
```

### Проверка Celery задач
```bash
# Активные задачи
celery -A hrhelper inspect active

# Запланированные задачи
celery -A hrhelper inspect scheduled

# Статистика
celery -A hrhelper inspect stats
```

### Проверка базы данных
```bash
# Подключение к SQLite
sqlite3 db.sqlite3

# Просмотр таблиц
.tables

# Просмотр записей массового импорта
SELECT * FROM clickup_int_clickupbulkimport ORDER BY created_at DESC LIMIT 5;
```

## 🛠️ Администрирование

### Создание суперпользователя
```bash
python manage.py createsuperuser
```

### Применение миграций
```bash
python manage.py makemigrations
python manage.py migrate
```

### Очистка базы данных
```bash
# Очистка старых записей массового импорта
python manage.py shell
>>> from apps.clickup_int.models import ClickUpBulkImport
>>> ClickUpBulkImport.objects.filter(created_at__lt=timezone.now()-timedelta(days=30)).delete()
```

## 🔧 Устранение неполадок

### Проблема: Redis не запускается
```bash
# Проверяем, занят ли порт
lsof -i :6379

# Убиваем процесс, если нужно
sudo kill -9 <PID>

# Перезапускаем Redis
brew services restart redis  # macOS
sudo systemctl restart redis-server  # Linux
```

### Проблема: Celery не обрабатывает задачи
```bash
# Проверяем подключение к Redis
redis-cli ping

# Перезапускаем Celery
pkill -f celery
./start_services.sh
```

### Проблема: Django не запускается
```bash
# Проверяем порт
lsof -i :8000

# Проверяем миграции
python manage.py migrate

# Запускаем в режиме отладки
python manage.py runserver 8000 --verbosity=2
```

### Проблема: "database is locked"
```bash
# Останавливаем все процессы
./stop_services.sh

# Ждем 5 секунд
sleep 5

# Запускаем заново
./start_services.sh
```

## 📊 Анализ производительности

### Мониторинг использования ресурсов
```bash
# Использование CPU и памяти
top -p $(pgrep -f "celery\|manage.py")

# Использование диска
du -sh db.sqlite3 logs/

# Сетевые соединения
netstat -an | grep -E "(8000|6379)"
```

### Оптимизация производительности
```bash
# Очистка старых логов
find logs/ -name "*.log" -mtime +7 -delete

# Очистка Celery задач
celery -A hrhelper purge

# Оптимизация базы данных
sqlite3 db.sqlite3 "VACUUM;"
```

## 🔐 Безопасность

### Ротация логов
```bash
# Создаем скрипт ротации логов
cat > rotate_logs.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
mv logs/django.log logs/django.log.$DATE
mv logs/celery.log logs/celery.log.$DATE
touch logs/django.log logs/celery.log
chmod 644 logs/*.log
EOF

chmod +x rotate_logs.sh
```

### Резервное копирование
```bash
# Создаем бэкап базы данных
cp db.sqlite3 backups/db_$(date +%Y%m%d_%H%M%S).sqlite3

# Создаем бэкап логов
tar -czf backups/logs_$(date +%Y%m%d_%H%M%S).tar.gz logs/
```

## 📈 Масштабирование

### Запуск нескольких Celery Worker
```bash
# Запуск с большим количеством процессов
celery -A hrhelper worker --loglevel=info --concurrency=10

# Запуск на разных машинах
celery -A hrhelper worker --loglevel=info --hostname=worker1@%h
celery -A hrhelper worker --loglevel=info --hostname=worker2@%h
```

### Настройка Redis для продакшена
```bash
# Настройка Redis конфигурации
sudo nano /etc/redis/redis.conf

# Изменяем настройки:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000
```

## 🎯 Полезные команды

### Быстрые проверки
```bash
# Статус всех сервисов
./check_services.sh

# Количество активных задач
celery -A hrhelper inspect active | grep -c "celery@"

# Размер базы данных
ls -lh db.sqlite3

# Последние ошибки в логах
grep -i error logs/*.log | tail -10
```

### Очистка системы
```bash
# Остановка всех сервисов
./stop_services.sh

# Очистка временных файлов
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Перезапуск
./start_services.sh
```

---

## 💡 Советы по использованию

1. **Всегда проверяйте статус** перед началом работы: `./check_services.sh`
2. **Мониторьте логи** во время массового импорта: `tail -f logs/celery.log`
3. **Делайте бэкапы** базы данных перед важными операциями
4. **Используйте автоматические скрипты** для запуска/остановки сервисов
5. **Проверяйте порты** если что-то не работает: `lsof -i :8000 :6379`

Удачной работы! 🚀


