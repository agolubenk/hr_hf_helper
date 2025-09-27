# HR Helper Backend Documentation

Документация для backend части системы HR Helper - комплексной системы для управления HR процессами.

## Структура проекта

Проект построен на Django 4.2+ с использованием Django REST Framework для API endpoints.

### Основные приложения (Apps)

1. **[accounts](./apps/accounts/)** - Управление пользователями и аутентификация
2. **[finance](./apps/finance/)** - Финансы, грейды, зарплатные вилки и бенчмарки
3. **[vacancies](./apps/vacancies/)** - Управление вакансиями
4. **[interviewers](./apps/interviewers/)** - Управление интервьюерами и правилами
5. **[huntflow](./apps/huntflow/)** - Интеграция с Huntflow API
6. **[google_oauth](./apps/google_oauth/)** - Google OAuth и интеграция с Google сервисами
7. **[gemini](./apps/gemini/)** - Интеграция с Google Gemini AI
8. **[notion_int](./apps/notion_int/)** - Интеграция с Notion API
9. **[telegram](./apps/telegram/)** - Интеграция с Telegram
10. **[clickup_int](./apps/clickup_int/)** - Интеграция с ClickUp API
11. **[common](./apps/common/)** - Общие компоненты и утилиты

## API Endpoints

### Базовый URL
- **Development**: `http://localhost:8000/api/v1/`
- **Production**: `https://yourdomain.com/api/v1/`

### Аутентификация
- Session Authentication
- Basic Authentication

### Формат ответов
Все API endpoints возвращают данные в формате JSON с пагинацией.

## Структура документации

Каждое приложение имеет свою документацию в папке `apps/[app_name]/`:

- **README.md** - Общее описание приложения
- **API.md** - API endpoints и их спецификация
- **models.md** - Описание моделей данных
- **api.json** - OpenAPI/Swagger спецификация в JSON формате

## Технологический стек

- **Django 4.2+** - Основной фреймворк
- **Django REST Framework** - API framework
- **Celery** - Асинхронные задачи
- **Redis** - Кэширование и брокер сообщений
- **SQLite** - База данных (development)
- **PostgreSQL** - База данных (production)

## Интеграции

### Внешние API
- **Huntflow** - ATS система
- **Google APIs** - Calendar, Drive, Sheets, Gemini
- **Notion** - Документация и база знаний
- **ClickUp** - Управление задачами
- **Telegram** - Уведомления и боты

### Внутренние сервисы
- **Celery** - Фоновая обработка задач
- **Redis** - Кэширование и очереди
- **Django Admin** - Административный интерфейс

## Разработка

### Требования
- Python 3.11+
- Node.js 18+ (для frontend)
- Redis
- PostgreSQL (для production)

### Установка
```bash
cd fullstack/backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Запуск сервисов
```bash
# Django сервер
python manage.py runserver 8000

# Celery worker
celery -A config worker -l info

# Celery beat (планировщик)
celery -A config beat -l info

# Redis
redis-server
```

## Безопасность

- CSRF защита для веб-форм
- CORS настройки для API
- Аутентификация через Django sessions
- Разрешения на уровне пользователей и групп

## Мониторинг

- Django Admin для администрирования
- Логирование всех API запросов
- Кэширование для оптимизации производительности
- Health check endpoints

## Контакты

Для вопросов по документации или разработке обращайтесь к команде разработки.
