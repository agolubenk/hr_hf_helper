# 🚀 Huntflow Integration - Интеграция с HR-системой

## 📋 Описание

Приложение `huntflow` предоставляет интеграцию с API Huntflow для получения и отображения информации о:
- **Вакансиях** - список, детали, статусы
- **Кандидатах** - список, профили, анкеты
- **Статусах** - этапы рекрутинга
- **Дополнительных полях** - кастомные поля вакансий и кандидатов

## 🏗️ Архитектура

### Структура приложения
```
apps/huntflow/
├── services.py          # Сервис для работы с Huntflow API
├── views.py            # Views для отображения данных
├── urls.py             # URL маршруты
├── apps.py             # Конфигурация приложения
└── templates/          # HTML шаблоны
    ├── base.html       # Базовый шаблон
    ├── dashboard.html  # Главная страница
    ├── vacancies_list.html    # Список вакансий
    ├── vacancy_detail.html    # Детали вакансии
    ├── applicants_list.html   # Список кандидатов
    └── applicant_detail.html  # Профиль кандидата
```

### Ключевые компоненты

#### 1. HuntflowService (`services.py`)
- **Аутентификация**: Bearer token из настроек пользователя
- **Выбор системы**: PROD/SANDBOX на основе `active_system`
- **API endpoints**: Полный набор методов для работы с Huntflow API
- **Обработка ошибок**: Graceful handling API ошибок

#### 2. Views (`views.py`)
- **Dashboard**: Главная страница с подключением и организациями
- **Vacancies**: Список и детали вакансий с фильтрацией
- **Applicants**: Список и профили кандидатов
- **AJAX endpoints**: Для динамического обновления данных

#### 3. Templates
- **Responsive design**: Bootstrap 5 + Font Awesome
- **Sidebar navigation**: Удобная навигация по организациям
- **Filters**: Фильтрация по статусам, вакансиям, пагинация
- **Interactive**: JavaScript для тестирования подключения

## 🔧 Настройка

### 1. Настройка пользователя
В админ панели Django (`/admin/accounts/user/`) для каждого пользователя необходимо указать:

```python
# PROD система
huntflow_prod_url = "https://your-company.huntflow.ru"
huntflow_prod_api_key = "your_prod_api_key"

# SANDBOX система  
huntflow_sandbox_url = "https://sandbox.huntflow.dev"
huntflow_sandbox_api_key = "your_sandbox_api_key"

# Активная система
active_system = "PROD"  # или "SANDBOX"
```

### 2. Получение API ключей Huntflow
1. Войдите в Huntflow под своим аккаунтом
2. Перейдите в **Настройки** → **API**
3. Создайте новый токен
4. Скопируйте `access_token` и `refresh_token`

### 3. URL конфигурация
Приложение доступно по адресу: `/huntflow/`

## 🚀 Использование

### 1. Доступ к приложению
```
http://localhost:8000/huntflow/
```

### 2. Основные функции

#### Дашборд
- Тестирование подключения к Huntflow API
- Список доступных организаций
- Быстрые действия и настройки

#### Вакансии
- Просмотр всех вакансий организации
- Фильтрация по статусу (OPEN, CLOSED, HOLD)
- Пагинация и поиск
- Детальная информация о вакансии

#### Кандидаты
- Список кандидатов с фильтрацией
- Фильтр по статусу и вакансии
- Детальные профили кандидатов
- Просмотр анкет и дополнительных полей

### 3. Фильтрация и поиск

#### Вакансии
```python
# Фильтры
state: OPEN, CLOSED, HOLD
count: 10, 30, 50, 100
page: номер страницы
```

#### Кандидаты
```python
# Фильтры
status: ID статуса рекрутинга
vacancy: ID вакансии
count: количество на странице
page: номер страницы
```

## 🔌 API Endpoints

### Основные endpoints Huntflow
```python
# Организации
GET /v2/accounts                    # Список организаций

# Вакансии
GET /v2/accounts/{id}/vacancies    # Список вакансий
GET /v2/accounts/{id}/vacancies/{vacancy_id}  # Детали вакансии
GET /v2/accounts/{id}/vacancies/statuses      # Статусы вакансий
GET /v2/accounts/{id}/vacancies/additional_fields  # Доп. поля

# Кандидаты
GET /v2/accounts/{id}/applicants   # Список кандидатов
GET /v2/accounts/{id}/applicants/{applicant_id}    # Профиль кандидата
GET /v2/accounts/{id}/applicants/questionary       # Схема анкеты
```

### AJAX endpoints
```python
POST /huntflow/test-connection/           # Тест подключения
GET  /huntflow/accounts/{id}/vacancies/ajax/    # Вакансии (AJAX)
GET  /huntflow/accounts/{id}/applicants/ajax/   # Кандидаты (AJAX)
```

## 🎨 UI/UX особенности

### Дизайн
- **Цветовая схема**: Градиентный sidebar (синий-фиолетовый)
- **Иконки**: Font Awesome для интуитивного понимания
- **Карточки**: Hover эффекты и тени
- **Responsive**: Адаптация под мобильные устройства

### Интерактивность
- **Тест подключения**: Кнопка для проверки API
- **Автообновление**: Данные обновляются каждые 5 минут
- **Фильтры**: Динамическая фильтрация без перезагрузки
- **Пагинация**: Навигация по страницам

### Навигация
- **Sidebar**: Быстрый доступ к организациям
- **Breadcrumbs**: Понятная структура страниц
- **Кнопки действий**: Быстрые действия для каждой сущности

## 🐛 Отладка

### Включение debug режима
В `settings.py` установите:
```python
DEBUG = True
```

### Отладочная информация
В шаблонах доступны блоки с отладочной информацией:
```html
{% if debug %}
<div class="debug-info">
    <pre>{{ data|pprint }}</pre>
</div>
{% endif %}
```

### Логирование
Все API запросы логируются в консоль Django:
```python
print(f"❌ Ошибка Huntflow API {response.status_code}: {response.text}")
```

## 🔒 Безопасность

### Аутентификация
- **Login required**: Все views требуют авторизации
- **User-specific**: Каждый пользователь видит только свои данные
- **API keys**: Безопасное хранение токенов в базе данных

### CSRF защита
- **CSRF tokens**: Для всех форм и AJAX запросов
- **Middleware**: Django CSRF middleware включен

## 📱 Мобильная поддержка

### Responsive design
- **Bootstrap 5**: Адаптивная сетка
- **Mobile-first**: Оптимизация для мобильных устройств
- **Touch-friendly**: Увеличенные кнопки для touch устройств

## 🚀 Развертывание

### Требования
```python
# requirements.txt
Django>=4.2.0
requests>=2.28.0
```

### Настройка production
1. Установите `DEBUG = False`
2. Настройте `ALLOWED_HOSTS`
3. Используйте HTTPS для API запросов
4. Настройте логирование

### Cron задачи
Для автоматического обновления данных можно настроить cron:
```bash
# Обновление каждые 15 минут
*/15 * * * * cd /path/to/project && python manage.py shell -c "from apps.huntflow.services import HuntflowService; service = HuntflowService(user); service.get_vacancies(account_id)"
```

## 🔧 Расширение функциональности

### Добавление новых полей
1. Обновите `HuntflowService` новыми методами
2. Добавьте соответствующие views
3. Создайте шаблоны для отображения
4. Обновите URLs

### Интеграция с другими системами
```python
# Пример интеграции с Telegram
def send_vacancy_notification(vacancy, chat_id):
    message = f"Новая вакансия: {vacancy.position}"
    # Отправка в Telegram
```

### Кастомные фильтры
```python
# В views.py
def custom_filter_applicants(request, account_id):
    # Логика кастомной фильтрации
    pass
```

## 📚 Документация Huntflow API

- **Официальная документация**: [Huntflow API Docs](https://api.huntflow.dev/)
- **Sandbox**: [Huntflow Sandbox](https://sandbox.huntflow.dev/)
- **Аутентификация**: Bearer token с refresh механизмом
- **Rate limits**: Ограничения на количество запросов

## 🤝 Поддержка

### Частые проблемы
1. **Ошибка 401**: Проверьте API ключи и их срок действия
2. **Пустые данные**: Убедитесь, что в организации есть вакансии/кандидаты
3. **Медленная загрузка**: Проверьте сетевое подключение к Huntflow

### Логи и отладка
```python
# В консоли Django будут видны все API запросы
# Используйте debug режим для детальной информации
```

---

**Версия**: 1.0.0  
**Автор**: HR Helper Team  
**Дата**: 2025  
**Лицензия**: MIT
