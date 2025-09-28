# ⚡ Быстрый запуск HR Helper

## 🚀 Автоматический запуск (рекомендуется)

```bash
# 1. Переходим в папку backend
cd backend

# 2. Активируем виртуальное окружение
source venv/bin/activate

# 3. Запускаем все сервисы одной командой
./start_services.sh
```

## 🔍 Проверка статуса

```bash
# Проверяем, что все работает
./check_services.sh
```

## 🛑 Остановка сервисов

```bash
# Останавливаем все сервисы
./stop_services.sh
```

## 📱 Доступ к приложению

После успешного запуска:
- **Веб-интерфейс**: http://127.0.0.1:8000/
- **Админка**: http://127.0.0.1:8000/admin/
- **ClickUp импорт**: http://127.0.0.1:8000/clickup/bulk-import/

## 🔧 Ручной запуск (если автоматический не работает)

### Терминал 1 - Redis
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server
```

### Терминал 2 - Celery
```bash
cd backend
source venv/bin/activate
PYTHONPATH=$(pwd) celery -A hrhelper worker --loglevel=info
```

### Терминал 3 - Django
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

## ❗ Важные требования

1. **Python 3.11+** должен быть установлен
2. **Redis** должен быть установлен и запущен
3. **Виртуальное окружение** должно быть создано и активировано
4. **Зависимости** должны быть установлены (`pip install -r requirements.txt`)

## 🆘 Если что-то не работает

1. Проверьте статус: `./check_services.sh`
2. Посмотрите логи: `tail -f logs/django.log` и `tail -f logs/celery.log`
3. Перезапустите: `./stop_services.sh && ./start_services.sh`

## 📚 Подробная документация

Для детальной информации см. [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)


