#!/bin/bash

# 🚀 Скрипт автоматического развертывания миграции
# Автор: AI Assistant
# Дата: $(date)

set -e  # Остановка при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Переменные
BACKUP_DIR="../backups"
DEPLOYMENT_LOG="deployment_$(date +%Y%m%d_%H%M%S).log"
MAINTENANCE_FILE=".env.maintenance"

# Функция создания backup
create_backup() {
    log_info "Создание backup перед развертыванием..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup кода
    BACKUP_NAME="backend_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r . "$BACKUP_DIR/$BACKUP_NAME"
    log_success "Backup кода создан: $BACKUP_DIR/$BACKUP_NAME"
    
    # Backup базы данных
    if [ -f "db.sqlite3" ]; then
        cp db.sqlite3 "db.sqlite3.backup_$(date +%Y%m%d_%H%M%S)"
        log_success "Backup базы данных создан"
    fi
    
    # Backup конфигурации
    if [ -f "config/settings.py" ]; then
        cp config/settings.py "config/settings.py.backup_$(date +%Y%m%d_%H%M%S)"
        log_success "Backup конфигурации создан"
    fi
}

# Функция включения maintenance mode
enable_maintenance() {
    log_info "Включение maintenance mode..."
    echo "SYSTEM_MAINTENANCE=true" > "$MAINTENANCE_FILE"
    log_success "Maintenance mode включен"
}

# Функция выключения maintenance mode
disable_maintenance() {
    log_info "Выключение maintenance mode..."
    if [ -f "$MAINTENANCE_FILE" ]; then
        rm "$MAINTENANCE_FILE"
        log_success "Maintenance mode выключен"
    fi
}

# Функция остановки сервисов
stop_services() {
    log_info "Остановка сервисов..."
    
    # Остановка Django сервера
    pkill -f "python.*manage.py runserver" || true
    
    # Остановка Celery (если есть)
    pkill -f "celery" || true
    
    # Остановка Redis (если есть)
    pkill -f "redis-server" || true
    
    log_success "Сервисы остановлены"
}

# Функция запуска сервисов
start_services() {
    log_info "Запуск сервисов..."
    
    # Запуск Django сервера в фоне
    python3 manage.py runserver 8000 > server.log 2>&1 &
    SERVER_PID=$!
    
    # Ждем запуска сервера
    sleep 5
    
    # Проверяем что сервер запустился
    if curl -s http://127.0.0.1:8000/ > /dev/null; then
        log_success "Django сервер запущен (PID: $SERVER_PID)"
    else
        log_error "Не удалось запустить Django сервер"
        exit 1
    fi
}

# Функция проверки здоровья системы
health_check() {
    log_info "Проверка здоровья системы..."
    
    # Проверка Django
    if python3 manage.py check --deploy; then
        log_success "Django check прошел успешно"
    else
        log_error "Django check провален"
        return 1
    fi
    
    # Проверка импортов
    if python3 -c "from logic.base.api_client import BaseAPIClient; print('✅ Импорты работают')"; then
        log_success "Импорты работают корректно"
    else
        log_error "Ошибка импортов"
        return 1
    fi
    
    # Проверка API endpoints
    log_info "Проверка API endpoints..."
    
    ENDPOINTS=(
        "/api/v1/finance/grades/"
        "/api/v1/vacancies/vacancies/"
        "/api/v1/huntflow/cache/"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8000$endpoint" | grep -q "40[13]"; then
            log_success "Endpoint $endpoint доступен"
        else
            log_warning "Endpoint $endpoint недоступен или возвращает неожиданный код"
        fi
    done
    
    log_success "Проверка здоровья системы завершена"
}

# Функция rollback
rollback() {
    log_warning "Выполнение rollback..."
    
    # Остановка сервисов
    stop_services
    
    # Восстановление из последнего backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backend_backup_* | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Восстановление из backup: $LATEST_BACKUP"
        
        # Удаление текущего кода
        find . -maxdepth 1 -type f -delete
        find . -maxdepth 1 -type d ! -name . ! -name .. -exec rm -rf {} +
        
        # Восстановление из backup
        cp -r "$LATEST_BACKUP"/* ./
        cp -r "$LATEST_BACKUP"/.* ./
        
        log_success "Rollback выполнен успешно"
    else
        log_error "Backup не найден для rollback"
        exit 1
    fi
    
    # Запуск сервисов
    start_services
    
    # Выключение maintenance mode
    disable_maintenance
    
    log_success "Rollback завершен"
}

# Основная функция развертывания
deploy() {
    log_info "Начало развертывания миграции..."
    
    # Создание backup
    create_backup
    
    # Включение maintenance mode
    enable_maintenance
    
    # Остановка сервисов
    stop_services
    
    # Выполнение миграций БД (если есть)
    log_info "Проверка миграций БД..."
    if python3 manage.py showmigrations --plan | grep -q "\[ \]"; then
        log_info "Выполнение миграций БД..."
        python3 manage.py migrate
        log_success "Миграции БД выполнены"
    else
        log_success "Миграции БД не требуются"
    fi
    
    # Запуск сервисов
    start_services
    
    # Проверка здоровья системы
    if health_check; then
        log_success "Проверка здоровья прошла успешно"
    else
        log_error "Проверка здоровья провалена, выполняем rollback"
        rollback
        exit 1
    fi
    
    # Выключение maintenance mode
    disable_maintenance
    
    log_success "Развертывание завершено успешно!"
}

# Функция проверки статуса
status() {
    log_info "Проверка статуса системы..."
    
    # Проверка Django
    if python3 manage.py check --deploy > /dev/null 2>&1; then
        log_success "Django: ✅ Здоров"
    else
        log_error "Django: ❌ Ошибки"
    fi
    
    # Проверка сервера
    if curl -s http://127.0.0.1:8000/ > /dev/null; then
        log_success "Сервер: ✅ Работает"
    else
        log_error "Сервер: ❌ Недоступен"
    fi
    
    # Проверка maintenance mode
    if [ -f "$MAINTENANCE_FILE" ]; then
        log_warning "Maintenance mode: ⚠️ Включен"
    else
        log_success "Maintenance mode: ✅ Выключен"
    fi
}

# Обработка аргументов командной строки
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "status")
        status
        ;;
    "backup")
        create_backup
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Использование: $0 {deploy|rollback|status|backup|health}"
        echo ""
        echo "Команды:"
        echo "  deploy   - Выполнить развертывание"
        echo "  rollback - Выполнить rollback"
        echo "  status   - Проверить статус системы"
        echo "  backup   - Создать backup"
        echo "  health   - Проверить здоровье системы"
        exit 1
        ;;
esac
