# 🚀 Полное руководство по запуску HR Helper

Этот документ содержит пошаговые инструкции для запуска всего приложения HR Helper, включая Django, Celery, Redis и все связанные сервисы.

## 📋 Содержание

1. [Системные требования](#системные-требования)
2. [Установка зависимостей](#установка-зависимостей)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Установка и настройка Redis](#установка-и-настройка-redis)
5. [Запуск всех сервисов](#запуск-всех-сервисов)
6. [Проверка работоспособности](#проверка-работоспособности)
7. [Устранение неполадок](#устранение-неполадок)
8. [Полезные команды](#полезные-команды)

---

## 🖥️ Системные требования

### Операционная система
- **macOS** (рекомендуется)
- **Linux** (Ubuntu/Debian)
- **Windows** (с WSL2)

### Программное обеспечение
- **Python 3.11+** (рекомендуется 3.13)
- **Git**
- **Redis Server**
- **SQLite** (встроен в Python)

### Порты
Приложение использует следующие порты:
- **8000** - Django веб-сервер
- **3000** - Frontend (если используется)
- **6379** - Redis (по умолчанию)

---

## 📦 Установка зависимостей

### 1. Клонирование репозитория

```bash
# Переходим в рабочую директорию
cd ~/Desktop  # или любая другая папка

# Клонируем репозиторий
git clone <URL_РЕПОЗИТОРИЯ> hrhelper
cd hrhelper
```

### 2. Установка Python зависимостей

```bash
# Переходим в папку backend
cd backend

# Создаем виртуальное окружение
python3 -m venv venv

# Активируем виртуальное окружение
# На macOS/Linux:
source venv/bin/activate

# На Windows:
# venv\Scripts\activate

# Устанавливаем зависимости
pip install -r requirements.txt
```

### 3. Проверка установки

```bash
# Проверяем версию Python
python --version

# Проверяем установленные пакеты
pip list | grep -E "(django|celery|redis)"
```

---

## 🗄️ Настройка базы данных

### 1. Применение миграций

```bash
# Убедитесь, что вы в папке backend и виртуальное окружение активировано
cd backend
source venv/bin/activate

# Применяем миграции
python manage.py migrate

# Создаем суперпользователя (опционально)
python manage.py createsuperuser
```

### 2. Проверка базы данных

```bash
# Проверяем статус миграций
python manage.py showmigrations

# Создаем тестовые данные (если нужно)
python manage.py loaddata fixtures/initial_data.json
```

---

## 🔴 Установка и настройка Redis

### macOS (с Homebrew)

```bash
# Устанавливаем Redis
brew install redis

# Запускаем Redis
brew services start redis

# Проверяем статус
brew services list | grep redis
```

### Ubuntu/Debian

```bash
# Обновляем пакеты
sudo apt update

# Устанавливаем Redis
sudo apt install redis-server

# Запускаем Redis
sudo systemctl start redis-server

# Включаем автозапуск
sudo systemctl enable redis-server

# Проверяем статус
sudo systemctl status redis-server
```

### Windows (с WSL2)

```bash
# В WSL2 Ubuntu
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Проверка Redis

```bash
# Подключаемся к Redis CLI
redis-cli

# В Redis CLI выполняем:
ping
# Должен вернуть: PONG

# Выходим из Redis CLI
exit
```

---

## 🚀 Запуск всех сервисов

### Важно! Порядок запуска имеет значение:

1. **Redis** (должен быть запущен первым)
2. **Celery Worker** (зависит от Redis)
3. **Django Server** (зависит от Celery)

### 1. Запуск Redis

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Проверяем, что Redis работает
redis-cli ping
```

### 2. Запуск Celery Worker

Откройте **новый терминал** и выполните:

```bash
# Переходим в папку backend
cd /path/to/hrhelper/backend

# Активируем виртуальное окружение
source venv/bin/activate

# Запускаем Celery Worker
PYTHONPATH=/path/to/hrhelper/backend celery -A hrhelper worker --loglevel=info
```

**Важно:** Замените `/path/to/hrhelper/backend` на реальный путь к вашей папке backend.

### 3. Запуск Django Server

Откройте **еще один новый терминал** и выполните:

```bash
# Переходим в папку backend
cd /path/to/hrhelper/backend

# Активируем виртуальное окружение
source venv/bin/activate

# Запускаем Django сервер
python manage.py runserver 8000
```

### 4. Проверка всех сервисов

Откройте **четвертый терминал** и выполните:

```bash
# Проверяем все запущенные процессы
ps aux | grep -E "(redis|celery|manage.py)" | grep -v grep

# Должны увидеть:
# - redis-server
# - celery worker
# - python manage.py runserver
```

---

## ✅ Проверка работоспособности

### 1. Проверка веб-интерфейса

Откройте браузер и перейдите по адресу:
```
http://127.0.0.1:8000/
```

### 2. Проверка Celery

В терминале с Celery Worker вы должны видеть логи:
```
[2025-09-16 10:00:00,000: INFO/MainProcess] Connected to redis://localhost:6379/0
[2025-09-16 10:00:00,000: INFO/MainProcess] mingle: searching for neighbors
[2025-09-16 10:00:00,000: INFO/MainProcess] mingle: all alone
[2025-09-16 10:00:00,000: INFO/MainProcess] celery@hostname ready.
```

### 3. Проверка массового импорта ClickUp

1. Перейдите на страницу: `http://127.0.0.1:8000/clickup/bulk-import/`
2. Нажмите кнопку "Запустить массовый импорт"
3. В логах Celery должны появиться сообщения о обработке задач

---

## 🔧 Устранение неполадок

### Проблема: Redis не запускается

**Решение:**
```bash
# Проверяем, не занят ли порт 6379
lsof -i :6379

# Если порт занят, убиваем процесс
sudo kill -9 <PID>

# Перезапускаем Redis
brew services restart redis  # macOS
sudo systemctl restart redis-server  # Linux
```

### Проблема: Celery не подключается к Redis

**Решение:**
```bash
# Проверяем подключение к Redis
redis-cli ping

# Если Redis не отвечает, перезапускаем
brew services restart redis  # macOS
sudo systemctl restart redis-server  # Linux

# Перезапускаем Celery Worker
# (Ctrl+C в терминале с Celery, затем запускаем заново)
```

### Проблема: Django не запускается

**Решение:**
```bash
# Проверяем, не занят ли порт 8000
lsof -i :8000

# Если порт занят, убиваем процесс
sudo kill -9 <PID>

# Проверяем миграции
python manage.py showmigrations

# Применяем миграции если нужно
python manage.py migrate
```

### Проблема: "ModuleNotFoundError"

**Решение:**
```bash
# Убедитесь, что виртуальное окружение активировано
source venv/bin/activate

# Переустановите зависимости
pip install -r requirements.txt

# Проверьте PYTHONPATH
export PYTHONPATH=/path/to/hrhelper/backend
```

### Проблема: "database is locked"

**Решение:**
```bash
# Останавливаем все процессы Django/Celery
pkill -f "manage.py"
pkill -f "celery"

# Ждем 5 секунд
sleep 5

# Запускаем заново в правильном порядке
```

---

## 📚 Полезные команды

### Управление сервисами

```bash
# Остановить все процессы
pkill -f "manage.py"
pkill -f "celery"
pkill -f "redis"

# Проверить статус всех сервисов
ps aux | grep -E "(redis|celery|manage.py)" | grep -v grep

# Проверить порты
lsof -i :8000  # Django
lsof -i :6379  # Redis
```

### Управление базой данных

```bash
# Создать миграции
python manage.py makemigrations

# Применить миграции
python manage.py migrate

# Откатить миграции
python manage.py migrate app_name 0001

# Создать суперпользователя
python manage.py createsuperuser
```

### Управление Celery

```bash
# Проверить активные задачи
celery -A hrhelper inspect active

# Проверить запланированные задачи
celery -A hrhelper inspect scheduled

# Очистить все задачи
celery -A hrhelper purge

# Проверить статистику
celery -A hrhelper inspect stats
```

### Логи и отладка

```bash
# Просмотр логов Django
tail -f logs/django.log

# Просмотр логов Celery
tail -f logs/celery.log

# Запуск Django в режиме отладки
python manage.py runserver 8000 --verbosity=2

# Запуск Celery с подробными логами
celery -A hrhelper worker --loglevel=debug
```

---

## 🎯 Быстрый старт (для опытных пользователей)

Если вы уже знакомы с Django и Celery, вот краткая последовательность команд:

```bash
# 1. Активируем окружение
cd backend && source venv/bin/activate

# 2. Запускаем Redis
brew services start redis  # macOS
# или
sudo systemctl start redis-server  # Linux

# 3. Запускаем Celery (в новом терминале)
cd backend && source venv/bin/activate
PYTHONPATH=$(pwd) celery -A hrhelper worker --loglevel=info

# 4. Запускаем Django (в третьем терминале)
cd backend && source venv/bin/activate
python manage.py runserver 8000
```

---

## 📞 Поддержка

Если у вас возникли проблемы:

1. **Проверьте логи** - они содержат подробную информацию об ошибках
2. **Убедитесь в правильном порядке запуска** - Redis → Celery → Django
3. **Проверьте порты** - убедитесь, что 8000 и 6379 не заняты
4. **Перезапустите все сервисы** - иногда помогает полный перезапуск

### Полезные файлы для диагностики:
- `backend/logs/` - папка с логами
- `backend/db.sqlite3` - база данных
- `backend/requirements.txt` - список зависимостей

---

## 🎉 Готово!

Теперь ваше приложение HR Helper должно работать полностью! 

- **Веб-интерфейс**: http://127.0.0.1:8000/
- **Админка**: http://127.0.0.1:8000/admin/
- **Массовый импорт ClickUp**: http://127.0.0.1:8000/clickup/bulk-import/

Удачной работы! 🚀

