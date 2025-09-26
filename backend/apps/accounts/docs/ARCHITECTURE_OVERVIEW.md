# Архитектура приложения Accounts и связанных приложений

## 🎯 Обзор

Данный документ описывает текущую архитектуру приложения `accounts` и связанных с ним приложений, включая URL маршруты, представления (views) и шаблоны.

---

## 📁 Структура приложения Accounts

### Основные файлы:
```
apps/accounts/
├── models.py              # Модель User (расширенная AbstractUser)
├── views.py               # Веб-интерфейс (HTML + JSON)
├── views_api.py           # REST API (DRF ViewSets)
├── forms.py               # Django формы
├── admin.py               # Админ-панель
├── urls.py                # URL маршруты
├── apps.py                # Конфигурация приложения
├── logic/                 # Сервисный слой
│   ├── user_service.py    # Бизнес-логика пользователей
│   ├── role_service.py    # Управление ролями
│   ├── oauth_service.py   # Google OAuth
│   ├── auth_adapters.py   # Адаптеры аутентификации
│   ├── serializers.py     # API сериализаторы
│   └── signals.py         # Django сигналы
├── management/commands/   # CLI команды
│   ├── create_user.py     # Создание пользователей
│   ├── assign_role.py     # Назначение ролей
│   ├── user_stats.py      # Статистика
│   └── seed_roles.py      # Создание ролей
└── migrations/            # Миграции БД
```

---

## 🔗 URL Маршруты (urls.py)

### Основные маршруты:
```python
urlpatterns = [
    # Универсальные шаблоны (HTML)
    path('', views.profile_template_handler, name='profile'),
    path('edit/', views.profile_edit_template_handler, name='profile_edit'),
    path('settings/', views.profile_settings_template_handler, name='profile_settings'),
    path('integrations/', views.integrations_template_handler, name='integrations'),
    path('api-keys/', views.api_keys_template_handler, name='api_keys'),
    path('components/', views.components_template_handler, name='components'),
    
    # Универсальные API (JSON)
    path('api/test-gemini/', lambda r: views.unified_api_view(r, views.test_gemini_api_handler), name='api_test_gemini'),
    path('api/test-clickup/', lambda r: views.unified_api_view(r, views.test_clickup_api_handler), name='api_test_clickup'),
    path('api/test-notion/', lambda r: views.unified_api_view(r, views.test_notion_api_handler), name='api_test_notion'),
    path('api/test-huntflow/', lambda r: views.unified_api_view(r, views.test_huntflow_api_handler), name='api_test_huntflow'),
    
    # API аутентификация (JSON)
    path('api/login/', lambda r: views.unified_api_view(r, views.login_api_handler), name='api_login'),
    path('api/logout/', lambda r: views.unified_api_view(r, views.logout_api_handler), name='api_logout'),
    
    # Google OAuth (специальные функции)
    path('google-oauth/', views.google_oauth_redirect, name='google_oauth_redirect'),
    path('google-oauth-callback/', views.google_oauth_callback, name='google_oauth_callback'),
    path('google-oauth-demo/', views.google_oauth_demo, name='google_oauth_demo'),
    path('google-oauth-test/', views.google_oauth_test, name='google_oauth_test'),
    path('oauth-debug/', views.oauth_debug, name='oauth_debug'),
    
    # Универсальная аутентификация (HTML + JSON)
    path('login/', views.unified_login, name='account_login'),
    path('logout/', views.unified_logout, name='account_logout'),
    path('unified-login/', views.unified_login, name='unified_login'),
    path('unified-logout/', views.unified_logout, name='unified_logout'),
]
```

---

## 🎭 Представления (views.py)

### Универсальные функции:
```python
# Универсальные функции для обработки запросов
def unified_template_view(request, template_name, context=None)
def unified_api_view(request, handler_func)

# API handlers
def login_api_handler(data, request)
def logout_api_handler(data, request)
def test_gemini_api_handler(data, request)
def test_huntflow_api_handler(data, request)
def test_clickup_api_handler(data, request)
def test_notion_api_handler(data, request)

# Template handlers
def profile_template_handler(request)
def profile_edit_template_handler(request)
def profile_settings_template_handler(request)
def integrations_template_handler(request)
def api_keys_template_handler(request)
def components_template_handler(request)

# OAuth функции
def google_oauth_redirect(request)
def google_oauth_callback(request)
def google_oauth_demo(request)
def google_oauth_test(request)
def oauth_debug(request)

# Универсальная аутентификация
def unified_login(request)
def unified_logout(request)
```

---

## 🔌 REST API (views_api.py)

### UserViewSet:
```python
class UserViewSet(viewsets.ModelViewSet):
    # Базовые операции
    - list()           # GET /api/users/
    - create()         # POST /api/users/
    - retrieve()       # GET /api/users/{id}/
    - update()         # PUT /api/users/{id}/
    - destroy()        # DELETE /api/users/{id}/
    
    # Кастомные действия
    - profile()        # GET /api/users/profile/
    - update_profile() # PUT /api/users/profile/
    - change_password() # POST /api/users/change-password/
    - settings()       # GET /api/users/settings/
    - update_settings() # PUT /api/users/settings/
    - assign_groups()  # POST /api/users/{id}/assign-groups/
    - stats()          # GET /api/users/stats/
```

### GroupViewSet:
```python
class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    # Только чтение
    - list()           # GET /api/groups/
    - retrieve()       # GET /api/groups/{id}/
```

---

## 🎨 Шаблоны (templates)

### Структура шаблонов:
```
templates/
├── account/                    # Django allauth шаблоны
│   ├── login.html
│   ├── logout.html
│   ├── signup.html
│   └── ...
├── accounts/                   # Кастомные шаблоны accounts
│   └── (если есть)
├── profile/                    # Шаблоны профиля
│   ├── profile.html
│   ├── profile_edit.html
│   ├── profile_settings.html
│   ├── integrations.html
│   ├── api_keys.html
│   └── components.html
└── socialaccount/              # Социальные аккаунты
    └── ...
```

### Основные шаблоны:
- **profile.html** - главная страница профиля
- **profile_edit.html** - редактирование профиля
- **profile_settings.html** - настройки профиля
- **integrations.html** - страница интеграций
- **api_keys.html** - управление API ключами
- **components.html** - компоненты интерфейса

---

## 🔗 Связанные приложения

### 1. Google OAuth (apps.google_oauth)

#### URL маршруты:
```python
# apps/google_oauth/urls.py
urlpatterns = [
    path('google-oauth/', views.google_oauth_redirect, name='google_oauth_redirect'),
    path('google-oauth-callback/', views.google_oauth_callback, name='google_oauth_callback'),
    path('google-oauth-demo/', views.google_oauth_demo, name='google_oauth_demo'),
    path('google-oauth-test/', views.google_oauth_test, name='google_oauth_test'),
    path('oauth-debug/', views.oauth_debug, name='oauth_debug'),
]
```

#### Представления:
```python
# apps/google_oauth/views.py
def google_oauth_redirect(request)
def google_oauth_callback(request)
def google_oauth_demo(request)
def google_oauth_test(request)
def oauth_debug(request)
```

#### Шаблоны:
```
templates/google_oauth/
├── oauth_demo.html
├── oauth_test.html
└── oauth_debug.html
```

### 2. Huntflow (apps.huntflow)

#### URL маршруты:
```python
# apps/huntflow/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('candidates/', views.candidates, name='candidates'),
    path('vacancies/', views.vacancies, name='vacancies'),
    path('api/candidates/', views.api_candidates, name='api_candidates'),
    path('api/vacancies/', views.api_vacancies, name='api_vacancies'),
]
```

#### Представления:
```python
# apps/huntflow/views.py
def dashboard(request)
def candidates(request)
def vacancies(request)
def api_candidates(request)
def api_vacancies(request)
```

#### Шаблоны:
```
templates/huntflow/
├── dashboard.html
├── candidates.html
├── vacancies.html
└── api/
    ├── candidates.html
    └── vacancies.html
```

### 3. Gemini AI (apps.gemini)

#### URL маршруты:
```python
# apps/gemini/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('chat/', views.chat, name='chat'),
    path('api/chat/', views.api_chat, name='api_chat'),
    path('api/analyze/', views.api_analyze, name='api_analyze'),
]
```

#### Представления:
```python
# apps/gemini/views.py
def dashboard(request)
def chat(request)
def api_chat(request)
def api_analyze(request)
```

#### Шаблоны:
```
templates/gemini/
├── dashboard.html
├── chat.html
└── api/
    ├── chat.html
    └── analyze.html
```

### 4. Telegram (apps.telegram)

#### URL маршруты:
```python
# apps/telegram/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('bot/', views.bot_management, name='bot_management'),
    path('api/send/', views.api_send_message, name='api_send_message'),
    path('api/webhook/', views.api_webhook, name='api_webhook'),
]
```

#### Представления:
```python
# apps/telegram/views.py
def dashboard(request)
def bot_management(request)
def api_send_message(request)
def api_webhook(request)
```

#### Шаблоны:
```
templates/telegram/
├── dashboard.html
├── bot_management.html
└── api/
    ├── send_message.html
    └── webhook.html
```

### 5. Notion Integration (apps.notion_int)

#### URL маршруты:
```python
# apps/notion_int/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('pages/', views.pages, name='pages'),
    path('api/pages/', views.api_pages, name='api_pages'),
    path('api/sync/', views.api_sync, name='api_sync'),
]
```

#### Представления:
```python
# apps/notion_int/views.py
def dashboard(request)
def pages(request)
def api_pages(request)
def api_sync(request)
```

#### Шаблоны:
```
templates/notion_int/
├── dashboard.html
├── pages.html
└── api/
    ├── pages.html
    └── sync.html
```

### 6. ClickUp Integration (apps.clickup_int)

#### URL маршруты:
```python
# apps/clickup_int/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('tasks/', views.tasks, name='tasks'),
    path('api/tasks/', views.api_tasks, name='api_tasks'),
    path('api/sync/', views.api_sync, name='api_sync'),
]
```

#### Представления:
```python
# apps/clickup_int/views.py
def dashboard(request)
def tasks(request)
def api_tasks(request)
def api_sync(request)
```

#### Шаблоны:
```
templates/clickup_int/
├── dashboard.html
├── tasks.html
└── api/
    ├── tasks.html
    └── sync.html
```

### 7. Interviewers (apps.interviewers)

#### URL маршруты:
```python
# apps/interviewers/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('calendar/', views.calendar, name='calendar'),
    path('interviews/', views.interviews, name='interviews'),
    path('api/calendar/', views.api_calendar, name='api_calendar'),
    path('api/interviews/', views.api_interviews, name='api_interviews'),
]
```

#### Представления:
```python
# apps/interviewers/views.py
def dashboard(request)
def calendar(request)
def interviews(request)
def api_calendar(request)
def api_interviews(request)
```

#### Шаблоны:
```
templates/interviewers/
├── dashboard.html
├── calendar.html
├── interviews.html
└── api/
    ├── calendar.html
    └── interviews.html
```

### 8. Vacancies (apps.vacancies)

#### URL маршруты:
```python
# apps/vacancies/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('list/', views.vacancy_list, name='vacancy_list'),
    path('create/', views.vacancy_create, name='vacancy_create'),
    path('api/vacancies/', views.api_vacancies, name='api_vacancies'),
    path('api/analyze/', views.api_analyze, name='api_analyze'),
]
```

#### Представления:
```python
# apps/vacancies/views.py
def dashboard(request)
def vacancy_list(request)
def vacancy_create(request)
def api_vacancies(request)
def api_analyze(request)
```

#### Шаблоны:
```
templates/vacancies/
├── dashboard.html
├── vacancy_list.html
├── vacancy_create.html
└── api/
    ├── vacancies.html
    └── analyze.html
```

---

## 🔄 Взаимодействие между приложениями

### 1. Accounts → Google OAuth
- **Связь:** OneToOne через `GoogleOAuthAccount`
- **Использование:** OAuth авторизация, получение данных Google
- **API ключи:** Хранятся в `User.gemini_api_key`

### 2. Accounts → Huntflow
- **Связь:** API ключи в `User` модели
- **Использование:** Управление кандидатами и вакансиями
- **API ключи:** `huntflow_prod_api_key`, `huntflow_sandbox_api_key`

### 3. Accounts → Gemini
- **Связь:** API ключ в `User.gemini_api_key`
- **Использование:** AI анализ и чат
- **Интеграция:** Через REST API

### 4. Accounts → Telegram
- **Связь:** OneToOne через `TelegramUser`
- **Использование:** Уведомления и бот
- **Поле:** `User.telegram_username`

### 5. Accounts → Notion
- **Связь:** Integration Token в `User.notion_integration_token`
- **Использование:** Синхронизация данных
- **Интеграция:** Через Notion API

### 6. Accounts → ClickUp
- **Связь:** API ключ в `User.clickup_api_key`
- **Использование:** Управление задачами
- **Интеграция:** Через ClickUp API

### 7. Accounts → Interviewers
- **Связь:** Через группы пользователей
- **Использование:** Управление интервью
- **Поле:** `User.interviewer_calendar_url`

### 8. Accounts → Vacancies
- **Связь:** Через поле `recruiter` в модели `Vacancy`
- **Использование:** Управление вакансиями
- **Роли:** Рекрутеры и администраторы

---

## 🎯 Паттерны архитектуры

### 1. Универсальные функции
- **unified_template_view()** - для HTML шаблонов
- **unified_api_view()** - для JSON API
- **unified_login()** - для аутентификации

### 2. Сервисный слой
- **UserService** - бизнес-логика пользователей
- **RoleService** - управление ролями
- **GoogleOAuthService** - OAuth операции

### 3. API Handlers
- **login_api_handler()** - обработка входа
- **test_*_api_handler()** - тестирование API ключей
- **profile_*_handler()** - управление профилем

### 4. Template Handlers
- **profile_template_handler()** - страница профиля
- **integrations_template_handler()** - интеграции
- **api_keys_template_handler()** - API ключи

---

## 📊 Метрики архитектуры

### Количество файлов:
- **Accounts:** 25 файлов
- **Google OAuth:** 20 файлов
- **Huntflow:** 19 файлов
- **Gemini:** 9 файлов
- **Telegram:** 17 файлов
- **Notion:** 13 файлов
- **ClickUp:** 20 файлов
- **Interviewers:** 14 файлов
- **Vacancies:** 22 файла

### Общее количество:
- **Всего файлов:** 159
- **URL маршрутов:** ~80
- **Представлений:** ~120
- **Шаблонов:** ~60

---

## 🚀 Заключение

Архитектура приложения `accounts` и связанных приложений построена на принципах:

1. **Модульности** - каждое приложение имеет четкую ответственность
2. **Переиспользования** - универсальные функции для общих задач
3. **Сервисного слоя** - централизованная бизнес-логика
4. **API-first** - REST API для всех интеграций
5. **Безопасности** - OAuth, CSRF защита, валидация

Система легко масштабируется и поддерживается благодаря четкому разделению ответственности и использованию современных паттернов Django.

---

**Дата обновления:** 2024-01-20  
**Версия:** 1.0.0  
**Статус:** Production Ready ✅
