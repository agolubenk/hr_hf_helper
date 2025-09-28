# 📚 Индекс документации HR Helper

## 📋 Полный список документации

### 🚀 Основные файлы
- **[README.md](../README.md)** - Главная документация проекта
- **[QUICK_START.md](QUICK_START.md)** - Быстрый старт для опытных пользователей
- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Полное руководство по установке
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Примеры использования и команды

### 🛠️ Автоматические скрипты
- **[start_services.sh](start_services.sh)** - Автоматический запуск всех сервисов
- **[stop_services.sh](stop_services.sh)** - Остановка всех сервисов
- **[check_services.sh](check_services.sh)** - Проверка статуса всех сервисов

### 📖 Специализированная документация
- **[CLICKUP_BULK_IMPORT_GUIDE.md](CLICKUP_BULK_IMPORT_GUIDE.md)** - Руководство по массовому импорту
- **[CLICKUP_BULK_IMPORT_SETUP.md](CLICKUP_BULK_IMPORT_SETUP.md)** - Настройка массового импорта

## 🎯 Для кого какая документация

### 👶 Новичок (первый раз запускает)
1. **[README.md](../README.md)** - общее понимание проекта
2. **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - пошаговая установка
3. **[QUICK_START.md](QUICK_START.md)** - быстрый запуск

### 👨‍💻 Опытный пользователь
1. **[QUICK_START.md](QUICK_START.md)** - быстрый запуск
2. **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - примеры использования
3. **[check_services.sh](check_services.sh)** - мониторинг

### 🔧 Администратор системы
1. **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - полная настройка
2. **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - администрирование
3. **[start_services.sh](start_services.sh)** - автоматизация

### 🐛 Решение проблем
1. **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - раздел "Устранение неполадок"
2. **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - раздел "Устранение неполадок"
3. **[check_services.sh](check_services.sh)** - диагностика

## 📁 Структура документации

```
hrhelper/
├── README.md                           # 🏠 Главная страница
├── backend/
│   ├── QUICK_START.md                  # ⚡ Быстрый старт
│   ├── COMPLETE_SETUP_GUIDE.md         # 📖 Полное руководство
│   ├── USAGE_EXAMPLES.md               # 📋 Примеры использования
│   ├── DOCUMENTATION_INDEX.md          # 📚 Этот файл
│   ├── CLICKUP_BULK_IMPORT_GUIDE.md    # 📥 Руководство по импорту
│   ├── CLICKUP_BULK_IMPORT_SETUP.md    # ⚙️ Настройка импорта
│   ├── start_services.sh               # 🚀 Запуск сервисов
│   ├── stop_services.sh                # 🛑 Остановка сервисов
│   └── check_services.sh               # 🔍 Проверка статуса
```

## 🎯 Быстрая навигация

### Нужно запустить приложение?
- **Впервые**: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)
- **Уже настраивал**: [QUICK_START.md](QUICK_START.md)
- **Автоматически**: `./start_services.sh`

### Что-то не работает?
- **Проверить статус**: `./check_services.sh`
- **Посмотреть логи**: `tail -f logs/*.log`
- **Решения проблем**: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#устранение-неполадок)

### Нужно настроить массовый импорт?
- **Общее понимание**: [CLICKUP_BULK_IMPORT_GUIDE.md](CLICKUP_BULK_IMPORT_GUIDE.md)
- **Быстрая настройка**: [CLICKUP_BULK_IMPORT_SETUP.md](CLICKUP_BULK_IMPORT_SETUP.md)

### Нужны примеры команд?
- **Все примеры**: [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

## 🔗 Полезные ссылки

### Веб-интерфейс (после запуска)
- **Главная**: http://127.0.0.1:8000/
- **Админка**: http://127.0.0.1:8000/admin/
- **ClickUp импорт**: http://127.0.0.1:8000/clickup/bulk-import/

### Команды для быстрого доступа
```bash
# Запуск всех сервисов
./start_services.sh

# Проверка статуса
./check_services.sh

# Остановка всех сервисов
./stop_services.sh

# Просмотр логов
tail -f logs/*.log
```

## 📞 Поддержка

Если документация не помогла:

1. **Проверьте статус**: `./check_services.sh`
2. **Посмотрите логи**: `tail -f logs/*.log`
3. **Перезапустите**: `./stop_services.sh && ./start_services.sh`
4. **Создайте Issue** в репозитории с описанием проблемы

---

**Удачной работы с HR Helper! 🚀**

