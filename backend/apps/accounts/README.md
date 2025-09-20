# Accounts App - Управление пользователями и ролями

## Описание
Приложение для управления пользователями, ролями и интеграциями. Расширяет стандартную модель пользователя Django дополнительными полями для интеграций с внешними сервисами.

## Зависимости
- Django 5.2.6+
- django.contrib.auth
- django.contrib.sites
- allauth (для социальной авторизации)

## Requirements
```python
# В requirements.txt
Django>=5.2.6
django-allauth>=0.57.0
requests>=2.31.0
```

## Связи с другими приложениями
- **apps.google_oauth**: Связь через `GoogleOAuthAccount` (OneToOne)
- **apps.huntflow**: Использует API ключи пользователя
- **apps.gemini**: Использует API ключ Gemini
- **apps.interviewers**: Связь через группы пользователей
- **apps.vacancies**: Связь через поле `recruiter`

## Модели

### User (расширенная модель AbstractUser)
**Запрашиваемые поля:**
- `username` - имя пользователя (обязательное)
- `email` - email адрес
- `first_name`, `last_name` - имя и фамилия
- `full_name` - полное имя (автозаполняется)
- `telegram_username` - никнейм в Telegram

**Поля интеграций:**
- `gemini_api_key` - API ключ для Gemini AI
- `clickup_api_key` - API ключ для ClickUp
- `huntflow_prod_url`, `huntflow_prod_api_key` - настройки Huntflow (прод)
- `huntflow_sandbox_url`, `huntflow_sandbox_api_key` - настройки Huntflow (песочница)
- `active_system` - выбор активной системы (prod/sandbox)

**Поля ролей:**
- `interviewer_calendar_url` - ссылка на календарь интервьюера
- `is_observer_active` - статус наблюдателя

## Логика работы

### Роли и группы
- **Администраторы**: полные права доступа
- **Рекрутеры**: полные права доступа
- **Наблюдатели**: только просмотр данных
- **Интервьюеры**: просмотр + редактирование своих данных

### Авторизация
1. **Стандартная авторизация**: username/password
2. **Google OAuth**: через allauth
3. **Прямой Google OAuth**: кастомная реализация

### API ключи
- Хранятся в зашифрованном виде
- Валидация через тестовые запросы
- Автоматическое переключение между prod/sandbox

## Эндпоинты

### Основные URL
```python
# apps/accounts/urls.py
urlpatterns = [
    path('', views.profile_view, name='profile'),
    path('edit/', views.profile_edit, name='profile_edit'),
    path('settings/', views.profile_settings, name='profile_settings'),
    path('integrations/', views.integrations_view, name='integrations'),
    path('api-keys/', views.api_keys_view, name='api_keys'),
    path('login/', views.account_login, name='account_login'),
    path('logout/', views.account_logout, name='account_logout'),
]
```

### API эндпоинты
- `POST /accounts/test-gemini-api/` - тестирование Gemini API
- `POST /accounts/test-clickup-api/` - тестирование ClickUp API
- `POST /accounts/test-huntflow-api/` - тестирование Huntflow API

## Особенности подключения

### Настройка в settings.py
```python
INSTALLED_APPS = [
    'apps.accounts',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

AUTH_USER_MODEL = 'accounts.User'

# Google OAuth настройки
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}
```

### Миграции
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### Создание групп ролей
```bash
python manage.py seed_roles
```

## Админка
- Расширенная админка с группировкой полей
- Отображение статуса API ключей
- Фильтрация по ролям и системам

## Безопасность
- API ключи хранятся в зашифрованном виде
- CSRF защита для всех форм
- Валидация входных данных
- Логирование операций авторизации

## Тестирование
```bash
# Тест API ключей
python manage.py shell
>>> from apps.accounts.models import User
>>> user = User.objects.get(username='testuser')
>>> # Тестирование API ключей через views
```

## Troubleshooting
1. **Ошибка авторизации Google**: проверьте настройки OAuth в Google Console
2. **API ключи не работают**: проверьте валидность ключей и сетевые настройки
3. **Роли не применяются**: выполните `python manage.py seed_roles`
