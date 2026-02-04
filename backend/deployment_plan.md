# 🚀 План развертывания миграции

## 📥 Забрать кодовую базу из GitLab в локальную папку

**Источник:** https://gitlab.netx.dev/BobrD/hr.git  
Код просто клонируется в папку, одноимённую репозиторию (`hr`). Никаких серверов и размещения.

```bash
# Из корня проекта (fullstack или hrhelper) — забрать код в папку hr

# По HTTPS (для приватного репо понадобится токен при запросе пароля)
git clone https://gitlab.netx.dev/BobrD/hr.git

# По SSH (удобно для приватных репо — не спрашивает пароль, если ключ добавлен в GitLab)
git clone git@gitlab.netx.dev:BobrD/hr.git

cd hr
git checkout main   # или master / develop — при необходимости
```

**Клонирование по SSH:** один раз добавь SSH-ключ в GitLab (Settings → SSH Keys), затем используй URL `git@gitlab.netx.dev:BobrD/hr.git`. Ключ проверить: `ls -la ~/.ssh/id_*.pub`; если нет — создать: `ssh-keygen -t ed25519 -C "твой@email"`.

## 📋 Pre-deployment (до развертывания)

### ✅ Подготовительные работы:
- [x] Создать полный backup продакшена
- [x] Протестировать миграцию на development
- [x] Подготовить rollback план
- [x] Уведомить команду о развертывании

### 📦 Backup стратегия:
```bash
# 1. Создать backup текущего состояния
cd /Users/agolubenko/hrhelper/fullstack/backend
cp -r . ../backend_backup_$(date +%Y%m%d_%H%M%S)

# 2. Backup базы данных
cp db.sqlite3 db.sqlite3.backup_$(date +%Y%m%d_%H%M%S)

# 3. Backup конфигурационных файлов
cp config/settings.py config/settings.py.backup_$(date +%Y%m%d_%H%M%S)
```

### 🧪 Staging тестирование:
```bash
# 1. Проверка Django
python3 manage.py check --deploy

# 2. Проверка импортов
python3 -c "from logic.base.api_client import BaseAPIClient; print('✅ Импорты работают')"

# 3. Проверка API endpoints
python3 manage.py runserver 8000 &
curl -s http://127.0.0.1:8000/api/v1/finance/grades/ | head -5
```

## 🔄 Deployment (развертывание)

### 📋 Пошаговый план развертывания:

#### 1. Подготовка к развертыванию:
- [ ] Включить maintenance mode
- [ ] Остановить все сервисы
- [ ] Создать финальный backup

#### 2. Развертывание кода:
- [ ] Обновить код (уже выполнено в development)
- [ ] Запустить миграции БД (если есть)
- [ ] Проверить конфигурацию

#### 3. Запуск сервисов:
- [ ] Запустить сервисы
- [ ] Проверить health endpoints
- [ ] Выключить maintenance mode

### 🛠️ Команды развертывания:

```bash
# 1. Включить maintenance mode
echo "SYSTEM_MAINTENANCE=true" > .env.maintenance

# 2. Остановить сервисы
./stop_services.sh

# 3. Backup перед развертыванием
cp -r . ../backend_backup_pre_deployment_$(date +%Y%m%d_%H%M%S)

# 4. Запустить миграции (если есть)
python3 manage.py migrate

# 5. Запустить сервисы
./start_services.sh

# 6. Проверить health endpoints
curl -s http://127.0.0.1:8000/api/v1/health/ || echo "Health check failed"

# 7. Выключить maintenance mode
rm .env.maintenance
```

## 📊 Post-deployment (после развертывания)

### 🔍 Мониторинг и проверки:

#### Первые 30 минут:
- [ ] Мониторить логи в реальном времени
- [ ] Проверить ключевые функции
- [ ] Проверить производительность
- [ ] Проверить все API endpoints

#### Ключевые функции для проверки:
- [ ] Finance: создание/обновление salary ranges, benchmarks
- [ ] Vacancies: создание/обновление вакансий
- [ ] Huntflow: синхронизация кандидатов
- [ ] Gemini: AI анализ данных
- [ ] Google OAuth: интеграция с Google сервисами

#### Производительность:
- [ ] Время отклика API < 500ms
- [ ] Время загрузки страниц < 2s
- [ ] Память < 512MB
- [ ] CPU < 50%

### 📈 Метрики для отслеживания:

```bash
# 1. Проверка логов на ошибки
grep -i "error\|exception\|traceback" logs/django.log | tail -20

# 2. Проверка производительности API
curl -w "@curl-format.txt" -s http://127.0.0.1:8000/api/v1/finance/grades/

# 3. Проверка использования ресурсов
top -p $(pgrep -f "python.*manage.py")

# 4. Проверка доступности базы данных
python3 manage.py dbshell -c "SELECT COUNT(*) FROM django_migrations;"
```

## 🔄 Rollback план

### 🚨 Если что-то пошло не так:

#### 1. Немедленный rollback:
```bash
# 1. Включить maintenance mode
echo "SYSTEM_MAINTENANCE=true" > .env.maintenance

# 2. Остановить сервисы
./stop_services.sh

# 3. Восстановить из backup
rm -rf ./*
cp -r ../backend_backup_pre_deployment_*/.* ./
cp -r ../backend_backup_pre_deployment_*/* ./

# 4. Запустить сервисы
./start_services.sh

# 5. Проверить работоспособность
python3 manage.py check
```

#### 2. Частичный rollback:
```bash
# Если проблема только в одном модуле
# Восстановить конкретный модуль из backup
cp ../backend_backup_pre_deployment_*/logic/problematic_module.py logic/
```

## 📞 Уведомления команды

### 📧 Email уведомления:
- **Pre-deployment**: "Начинаем развертывание миграции в 10:00"
- **Deployment start**: "Развертывание началось"
- **Deployment success**: "Развертывание завершено успешно"
- **Deployment failure**: "Развертывание провалено, выполняем rollback"

### 📱 Slack уведомления:
- **#deployments**: Уведомления о статусе развертывания
- **#alerts**: Критические ошибки и rollback

## 🎯 Критерии успешного развертывания

### ✅ Все эти проверки должны пройти:

1. **Django check**: `python3 manage.py check --deploy` - 0 ошибок
2. **API endpoints**: Все endpoints возвращают корректные ответы
3. **Производительность**: Время отклика < 500ms
4. **Логи**: Нет критических ошибок в логах
5. **Функциональность**: Все ключевые функции работают
6. **Мониторинг**: Система мониторинга активна

### 🚨 Критерии для rollback:

1. **Django не запускается**
2. **API endpoints недоступны**
3. **Критические ошибки в логах**
4. **Производительность деградировала > 50%**
5. **Функциональность сломана**

## 📅 Временные рамки

### ⏰ Планируемое время развертывания:
- **Pre-deployment**: 30 минут
- **Deployment**: 15 минут
- **Post-deployment monitoring**: 30 минут
- **Общее время**: 75 минут

### 🕐 Окно развертывания:
- **Рекомендуемое время**: 02:00 - 04:00 (низкая нагрузка)
- **Резервное время**: 14:00 - 16:00 (если нужно)
- **Избегать**: 09:00 - 17:00 (рабочие часы)

## 🔐 Безопасность

### 🛡️ Меры безопасности:
- [ ] Все backup'ы зашифрованы
- [ ] Доступ к серверам ограничен
- [ ] Логи развертывания сохраняются
- [ ] Rollback план протестирован

### 🔑 Доступы:
- **Production сервер**: Только DevOps команда
- **Staging сервер**: DevOps + Lead Developer
- **Development**: Вся команда разработки

## 📋 Checklist развертывания

### Pre-deployment:
- [ ] Backup создан
- [ ] Staging протестирован
- [ ] Rollback план готов
- [ ] Команда уведомлена

### Deployment:
- [ ] Maintenance mode включен
- [ ] Сервисы остановлены
- [ ] Код обновлен
- [ ] Миграции выполнены
- [ ] Сервисы запущены
- [ ] Health checks пройдены
- [ ] Maintenance mode выключен

### Post-deployment:
- [ ] Логи проверены
- [ ] Производительность проверена
- [ ] Функциональность проверена
- [ ] Команда уведомлена об успехе

## 🎉 Успешное завершение

После успешного развертывания:
1. ✅ Отправить уведомление команде
2. ✅ Обновить документацию
3. ✅ Запланировать мониторинг на 24 часа
4. ✅ Подготовить отчет о развертывании
5. ✅ Планировать следующие улучшения
