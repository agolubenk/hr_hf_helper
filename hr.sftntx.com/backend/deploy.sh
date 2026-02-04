#!/bin/bash
set -e

# =============================================================================
# HR Helper Deploy Script
# Деплой через SCP (без git pull на сервере)
# Сервер: hr.sftntx.com за Cloudflare
# =============================================================================

# Конфигурация
SERVER_USER="root"
SERVER_HOST="89.167.20.136"
SERVER_DIR="/opt/hrhelper"
IMAGE_NAME="hrhelper"
IMAGE_TAG="latest"
IMAGE_FILE="hrhelper-image.tar.gz"
DOMAIN="hr.sftntx.com"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Проверка SSH подключения
check_ssh() {
    log_info "Проверка SSH подключения к $SERVER_HOST..."
    if ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'ok'" > /dev/null 2>&1; then
        log_success "SSH подключение работает"
    else
        log_error "Не удалось подключиться к серверу"
        exit 1
    fi
}

# Сборка Docker образа
build_image() {
    log_info "Сборка Docker образа..."
    docker build -f Dockerfile.production -t "$IMAGE_NAME:$IMAGE_TAG" .
    log_success "Образ собран: $IMAGE_NAME:$IMAGE_TAG"
}

# Сохранение образа в tar.gz
save_image() {
    log_info "Сохранение образа в $IMAGE_FILE..."
    docker save "$IMAGE_NAME:$IMAGE_TAG" | gzip > "$IMAGE_FILE"
    SIZE=$(du -h "$IMAGE_FILE" | cut -f1)
    log_success "Образ сохранён: $IMAGE_FILE ($SIZE)"
}

# Передача файлов на сервер
upload_files() {
    log_info "Создание директории на сервере..."
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_DIR/{logs,media,staticfiles}"

    log_info "Передача Docker образа на сервер (это может занять время)..."
    scp "$IMAGE_FILE" "$SERVER_USER@$SERVER_HOST:$SERVER_DIR/"
    log_success "Образ передан"

    log_info "Передача конфигурационных файлов..."
    scp docker-compose.server.yml "$SERVER_USER@$SERVER_HOST:$SERVER_DIR/docker-compose.yml"
    scp nginx.server.conf "$SERVER_USER@$SERVER_HOST:$SERVER_DIR/nginx.conf"
    log_success "Конфиги переданы"

    # Передача .env
    if [ -f ".env.production" ]; then
        scp .env.production "$SERVER_USER@$SERVER_HOST:$SERVER_DIR/.env"
        log_success ".env.production передан"
    else
        log_warn ".env.production не найден!"
        log_warn "Создайте .env на сервере: $SERVER_DIR/.env"
    fi
}

# Деплой на сервере
deploy_on_server() {
    log_info "Деплой на сервере..."

    ssh "$SERVER_USER@$SERVER_HOST" bash -s << ENDSSH
set -e
cd $SERVER_DIR

echo ">>> Загрузка Docker образа..."
gunzip -c $IMAGE_FILE | docker load

echo ">>> Остановка старых контейнеров..."
docker compose down --remove-orphans 2>/dev/null || true

echo ">>> Запуск контейнеров..."
docker compose up -d

echo ">>> Ожидание запуска БД..."
sleep 15

echo ">>> Выполнение миграций..."
docker compose exec -T web python manage.py migrate --noinput

echo ">>> Сборка статики..."
docker compose exec -T web python manage.py collectstatic --noinput

echo ">>> Статус контейнеров:"
docker compose ps

echo ">>> Очистка..."
rm -f $IMAGE_FILE
docker image prune -f
ENDSSH

    log_success "Деплой завершён!"
}

# Проверка статуса
check_status() {
    log_info "Проверка статуса..."

    echo ""
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose ps"
    echo ""

    log_info "Проверка health endpoint..."
    if ssh "$SERVER_USER@$SERVER_HOST" "curl -sf http://localhost:8000/health/" > /dev/null 2>&1; then
        log_success "Приложение работает!"
        log_info "Доступно по адресу: https://$DOMAIN"
    else
        log_warn "Health check не прошёл"
        log_info "Проверьте логи: ./deploy.sh logs"
    fi
}

# Очистка локальных файлов
cleanup() {
    log_info "Очистка временных файлов..."
    rm -f "$IMAGE_FILE"
    log_success "Очистка завершена"
}

# Логи
show_logs() {
    SERVICE="${2:-}"
    if [ -n "$SERVICE" ]; then
        ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose logs -f --tail=100 $SERVICE"
    else
        ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose logs -f --tail=100"
    fi
}

# Первоначальная настройка сервера
setup_server() {
    log_info "Первоначальная настройка сервера..."

    ssh "$SERVER_USER@$SERVER_HOST" bash -s << 'ENDSSH'
set -e

echo ">>> Создание структуры директорий..."
mkdir -p /opt/hrhelper/{logs,media,staticfiles}

echo ">>> Настройка firewall..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

echo ""
echo "=========================================="
echo "Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Создайте .env файл на сервере"
echo "2. Настройте DNS: $DOMAIN -> этот сервер"
echo "3. Включите Cloudflare Proxy (оранжевое облако)"
echo "4. В Cloudflare SSL/TLS выберите 'Full'"
echo "=========================================="
ENDSSH
}

# Создание .env на сервере
create_env() {
    log_info "Создание .env файла на сервере..."

    ssh "$SERVER_USER@$SERVER_HOST" bash -s << 'ENDSSH'
cat > /opt/hrhelper/.env << 'EOF'
# Django
SECRET_KEY=change-me-to-a-very-long-random-string-minimum-50-chars
DEBUG=False
ALLOWED_HOSTS=hr.sftntx.com,localhost,127.0.0.1

# Database
DB_NAME=hrhelper
DB_USER=hrhelper
DB_PASSWORD=change-me-secure-password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Google OAuth (заполните свои данные)
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=https://hr.sftntx.com/google-oauth/callback/

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
EOF

echo ">>> .env создан в /opt/hrhelper/.env"
echo ">>> ВАЖНО: Отредактируйте файл и заполните секреты!"
ENDSSH

    log_success ".env шаблон создан на сервере"
    log_warn "Отредактируйте /opt/hrhelper/.env на сервере!"
}

# Выполнение команды в контейнере
exec_cmd() {
    shift
    CMD="$*"
    if [ -z "$CMD" ]; then
        log_error "Укажите команду"
        exit 1
    fi
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose exec -T web $CMD"
}

# Помощь
show_help() {
    cat << EOF
HR Helper Deploy Script
=======================

Использование: ./deploy.sh [команда]

Команды:
  full        Полный деплой (build + upload + deploy + cleanup)
  build       Только сборка образа
  upload      Только загрузка файлов на сервер
  deploy      Только деплой на сервере (образ уже загружен)
  status      Проверка статуса контейнеров
  logs [svc]  Показать логи (опционально: web, celery, db, redis, nginx)
  setup       Первоначальная настройка сервера
  create-env  Создать шаблон .env на сервере
  exec <cmd>  Выполнить команду в web контейнере
  restart     Перезапустить контейнеры
  stop        Остановить контейнеры
  help        Показать эту справку

Примеры:
  ./deploy.sh full              # Полный деплой
  ./deploy.sh status            # Статус
  ./deploy.sh logs web          # Логи Django
  ./deploy.sh exec python manage.py createsuperuser

Сервер: $SERVER_USER@$SERVER_HOST
Домен:  https://$DOMAIN
EOF
}

# Перезапуск
restart() {
    log_info "Перезапуск контейнеров..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose restart"
    log_success "Контейнеры перезапущены"
}

# Остановка
stop() {
    log_info "Остановка контейнеров..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_DIR && docker compose down"
    log_success "Контейнеры остановлены"
}

# Основная логика
case "${1:-help}" in
    full)
        check_ssh
        build_image
        save_image
        upload_files
        deploy_on_server
        check_status
        cleanup
        ;;
    build)
        build_image
        save_image
        ;;
    upload)
        check_ssh
        upload_files
        ;;
    deploy)
        check_ssh
        deploy_on_server
        check_status
        ;;
    status)
        check_ssh
        check_status
        ;;
    logs)
        show_logs "$@"
        ;;
    setup)
        check_ssh
        setup_server
        ;;
    create-env)
        check_ssh
        create_env
        ;;
    exec)
        check_ssh
        exec_cmd "$@"
        ;;
    restart)
        check_ssh
        restart
        ;;
    stop)
        check_ssh
        stop
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Неизвестная команда: $1"
        show_help
        exit 1
        ;;
esac
