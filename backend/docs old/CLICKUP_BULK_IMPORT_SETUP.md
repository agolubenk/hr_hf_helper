# Быстрая настройка массового импорта ClickUp

## Установка зависимостей

```bash
# Установка Python зависимостей
pip install -r requirements.txt

# Установка Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Запуск Redis
sudo systemctl start redis-server
```

## Проверка установки

```bash
# Проверка подключения
python3 test_celery_connection.py
```

## Запуск Celery Worker

```bash
# В отдельном терминале
cd backend
celery -A hrhelper worker --loglevel=info
```

## Запуск Django сервера

```bash
# В другом терминале
cd backend
python3 manage.py runserver 8000
```

## Тестирование массового импорта

1. Откройте http://127.0.0.1:8000/clickup/
2. Настройте интеграцию с ClickUp
3. Перейдите на страницу массового импорта
4. Запустите массовый импорт
5. Отслеживайте прогресс

## Мониторинг

- **Логи Celery**: В терминале с worker'ом
- **Прогресс**: На странице массового импорта
- **Статистика**: В админке Django

## Устранение проблем

### Redis не запускается
```bash
sudo systemctl status redis-server
sudo systemctl restart redis-server
```

### Celery не подключается
```bash
# Проверьте Redis
redis-cli ping

# Проверьте настройки
python3 test_celery_connection.py
```

### Задачи не выполняются
1. Убедитесь, что Celery worker запущен
2. Проверьте логи worker'а
3. Проверьте настройки ClickUp API

