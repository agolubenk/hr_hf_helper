# Vacancies App - Локальные данные по вакансиям

## 📋 Описание
Приложение для управления локальными данными по вакансиям. Включает настройки для инвайтов, scorecard, вопросы для интервью, промпты для AI, привязку интервьюеров и грейдов к вакансиям.

## 🏗️ Архитектура

### Структура приложения
```
apps/vacancies/
├── logic/                    # Бизнес-логика (новая архитектура)
│   ├── vacancy_handlers.py   # Обработчики для вакансий
│   ├── salary_range_handlers.py # Обработчики для зарплатных вилок
│   ├── response_handlers.py  # Универсальные обработчики ответов
│   ├── serializers.py        # DRF сериализаторы
│   └── __init__.py
├── docs/                     # Документация
│   └── INTER_APP_CONNECTIONS_REPORT.md
├── management/               # Management команды
│   └── commands/
│       └── update_salary_ranges.py
├── migrations/              # Миграции БД
├── models.py               # Модели данных
├── forms.py                # Django формы
├── views.py                # Web представления
├── views_api.py            # API представления
├── admin.py                # Админ-панель
├── urls.py                 # URL маршруты
└── README.md               # Документация
```

### Новая архитектура с обработчиками
Приложение использует современную архитектуру с вынесением бизнес-логики в отдельные обработчики:

- **VacancyHandler** - логика работы с вакансиями
- **SalaryRangeHandler** - логика работы с зарплатными вилками  
- **ResponseHandler** - универсальные обработчики ответов
- **VacancyApiHandler** - API-специфичные обработчики

## 🔗 Зависимости
- Django 4.2.16+
- apps.accounts (для рекрутеров)
- apps.interviewers (для интервьюеров)
- apps.finance (для грейдов)

## 📦 Requirements
```python
# В requirements.txt
Django>=4.2.16
djangorestframework>=3.14.0
```

## 🔄 Связи с другими приложениями
- **apps.accounts**: Связь через `recruiter` (ForeignKey на User, ограничение на группу 'Рекрутер')
- **apps.interviewers**: Связь через `interviewers` (ManyToManyField)
- **apps.finance**: Связь через `available_grades` (ManyToManyField на Grade)
- **apps.google_oauth**: Интеграция для создания инвайтов
- **apps.huntflow**: Потенциальная связь через `external_id`

## 📊 Модели

### Vacancy
**Назначение**: Локальные данные по вакансиям

**Поля:**
- `name` - название вакансии (CharField, max_length=200)
- `external_id` - ID для связи с внешними системами (CharField, max_length=100, unique=True)
- `recruiter` - ответственный рекрутер (ForeignKey на User, limit_choices_to={'groups__name': 'Рекрутер'})
- `invite_title` - заголовок инвайтов (CharField, max_length=200)
- `invite_text` - сопровождающий текст для инвайтов (TextField)
- `scorecard_title` - заголовок Scorecard (CharField, max_length=200)
- `scorecard_link` - ссылка на Scorecard (URLField, blank=True)
- `questions_belarus` - вопросы для интервью в Беларуси (TextField, blank=True)
- `questions_poland` - вопросы для интервью в Польше (TextField, blank=True)
- `vacancy_link_belarus` - ссылка на вакансию в Беларуси (URLField, blank=True)
- `vacancy_link_poland` - ссылка на вакансию в Польше (URLField, blank=True)
- `candidate_update_prompt` - промпт для обновления информации о кандидате (TextField, blank=True)
- `invite_prompt` - промпт для создания приглашения кандидату (TextField, blank=True)
- `screening_duration` - длительность скринингов в минутах (PositiveIntegerField, default=45)
- `available_grades` - доступные грейды (ManyToManyField на Grade, blank=True) **[НОВОЕ]**
- `interviewers` - интервьюеры (ManyToManyField на Interviewer, blank=True)
- `is_active` - активна ли вакансия (BooleanField, default=True)
- `created_at`, `updated_at` - временные метки

**Методы:**
- `clean()` - валидация данных
- `save()` - сохранение с валидацией
- `get_interviewers_count()` - количество интервьюеров
- `get_interviewers_list()` - список интервьюеров
- `has_interviewers()` - есть ли интервьюеры
- `get_vacancy_links()` - получить все ссылки на вакансии по странам
- `has_vacancy_links()` - есть ли ссылки на вакансии
- `get_vacancy_links_count()` - количество ссылок на вакансии
- `get_vacancy_link_by_country(country)` - получить ссылку для конкретной страны

### SalaryRange
**Назначение**: Зарплатные вилки по грейдам с поддержкой множественных валют

**Поля:**
- `vacancy` - вакансия (ForeignKey на Vacancy)
- `grade` - грейд (ForeignKey на Grade)
- `salary_min_usd` - минимальная зарплата в USD (DecimalField)
- `salary_max_usd` - максимальная зарплата в USD (DecimalField)
- `salary_min_byn` - минимальная зарплата в BYN (DecimalField, автоматически рассчитывается)
- `salary_max_byn` - максимальная зарплата в BYN (DecimalField, автоматически рассчитывается)
- `salary_min_pln` - минимальная зарплата в PLN (DecimalField, автоматически рассчитывается)
- `salary_max_pln` - максимальная зарплата в PLN (DecimalField, автоматически рассчитывается)
- `is_active` - активна ли зарплатная вилка (BooleanField, default=True)
- `created_at`, `updated_at` - временные метки

**Методы:**
- `clean()` - валидация данных (проверка min <= max)
- `save()` - сохранение с автоматическим расчетом валют
- `salary_range_usd` - отформатированная зарплатная вилка в USD
- `salary_range_byn` - отформатированная зарплатная вилка в BYN
- `salary_range_pln` - отформатированная зарплатная вилка в PLN

## ⚙️ Логика работы

### Управление вакансиями
1. **Создание**: Добавление новой вакансии с настройками
2. **Редактирование**: Обновление данных вакансии
3. **Активация/деактивация**: Управление статусом через обработчики
4. **Удаление**: Удаление вакансии
5. **Поиск и фильтрация**: Расширенные возможности поиска

### Управление грейдами **[НОВОЕ]**
1. **Привязка грейдов**: Выбор доступных грейдов для вакансии
2. **Фильтрация по грейдам**: Поиск вакансий по конкретным грейдам
3. **Статистика**: Анализ распределения вакансий по грейдам

### Настройки инвайтов
1. **Заголовок**: Настройка заголовка для приглашений
2. **Текст**: Сопровождающий текст для инвайтов
3. **Промпт**: AI промпт для создания приглашений

### Scorecard
1. **Заголовок**: Настройка заголовка Scorecard
2. **Ссылка**: Ссылка на Scorecard для оценки

### Вопросы для интервью
1. **Беларусь**: Вопросы для интервью в Беларуси
2. **Польша**: Вопросы для интервью в Польше
3. **Разделение**: Разные наборы вопросов для разных стран

### Ссылки на вакансии по странам
1. **Беларусь**: Ссылки на rabota.by, jobs.tut.by и другие локальные площадки
2. **Польша**: Ссылки на pracuj.pl, nofluffjobs.com и другие польские площадки
3. **Управление**: Централизованное управление ссылками для каждой вакансии

### Настройки скринингов
1. **Длительность**: Настройка длительности скринингов в минутах
2. **По умолчанию**: 45 минут для всех новых вакансий
3. **Гибкость**: Возможность настройки индивидуальной длительности для каждой вакансии

### Привязка интервьюеров
1. **Выбор**: Выбор интервьюеров для вакансии
2. **Управление**: Добавление/удаление интервьюеров
3. **Статистика**: Подсчет количества привязанных интервьюеров

### Управление зарплатными вилками
1. **Создание**: Добавление зарплатной вилки для грейда
2. **Редактирование**: Обновление зарплатных вилок в USD
3. **Автоматический расчет**: Пересчет в BYN и PLN на основе курсов валют
4. **Активация/деактивация**: Управление статусом вилок
5. **Удаление**: Удаление зарплатных вилок

## 🌐 Эндпоинты

### Основные URL
```python
# apps/vacancies/urls.py
urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('list/', views.vacancy_list, name='list'),
    path('<int:pk>/', views.vacancy_detail, name='detail'),
    path('create/', views.vacancy_create, name='create'),
    path('<int:pk>/edit/', views.vacancy_edit, name='edit'),
    path('<int:pk>/delete/', views.vacancy_delete, name='delete'),
    path('<int:pk>/toggle-active/', views.vacancy_toggle_active, name='toggle_active'),
    
    # Зарплатные вилки
    path('salary-ranges/', views.salary_ranges_list, name='salary_ranges_list'),
    path('salary-ranges/create/', views.salary_range_create, name='salary_range_create'),
    path('salary-ranges/<int:pk>/', views.salary_range_detail, name='salary_range_detail'),
    path('salary-ranges/<int:pk>/edit/', views.salary_range_edit, name='salary_range_edit'),
    path('salary-ranges/<int:pk>/delete/', views.salary_range_delete, name='salary_range_delete'),
    path('salary-ranges/<int:pk>/toggle-active/', views.salary_range_toggle_active, name='salary_range_toggle_active'),
]
```

### API эндпоинты
```python
# config/api_urls.py
router.register(r'vacancies', VacancyViewSet)

# Доступные API действия:
# GET /api/vacancies/ - список вакансий
# POST /api/vacancies/ - создание вакансии
# GET /api/vacancies/{id}/ - детали вакансии
# PUT /api/vacancies/{id}/ - обновление вакансии
# DELETE /api/vacancies/{id}/ - удаление вакансии
# POST /api/vacancies/{id}/toggle-active/ - переключение активности
# POST /api/vacancies/{id}/assign-grades/ - назначение грейдов
# GET /api/vacancies/my-vacancies/ - мои вакансии
# GET /api/vacancies/stats/ - статистика
# GET /api/vacancies/search/ - поиск
```

## 📝 Формы

### VacancyForm
**Назначение**: Форма для создания/редактирования вакансии
**Поля:**
- `name` - название вакансии
- `external_id` - ID для связи
- `recruiter` - ответственный рекрутер
- `invite_title` - заголовок инвайтов
- `invite_text` - сопровождающий текст для инвайтов
- `scorecard_title` - заголовок Scorecard
- `scorecard_link` - ссылка на Scorecard
- `questions_belarus` - вопросы Беларусь
- `questions_poland` - вопросы Польша
- `vacancy_link_belarus` - ссылка на вакансию (Беларусь)
- `vacancy_link_poland` - ссылка на вакансию (Польша)
- `candidate_update_prompt` - промпт для обновления кандидата
- `invite_prompt` - промпт для инвайта
- `screening_duration` - длительность скринингов
- `available_grades` - доступные грейды **[НОВОЕ]**
- `interviewers` - интервьюеры
- `is_active` - активна ли вакансия

**Особенности:**
- Ограничение выбора рекрутеров только группой 'Рекрутер'
- Ограничение выбора только активными грейдами
- Ограничение выбора только активными интервьюерами
- Валидация обязательных полей

### SalaryRangeForm
**Назначение**: Форма для создания/редактирования зарплатных вилок
**Поля:**
- `vacancy` - вакансия
- `grade` - грейд
- `salary_min_usd` - минимальная зарплата в USD
- `salary_max_usd` - максимальная зарплата в USD
- `is_active` - активна ли зарплатная вилка

### SalaryRangeSearchForm
**Назначение**: Форма поиска зарплатных вилок
**Поля:**
- `search` - поиск по грейду
- `vacancy` - фильтр по вакансии
- `grade` - фильтр по грейду
- `is_active` - фильтр по активности

### VacancySearchForm
**Назначение**: Форма поиска вакансий
**Поля:**
- `search` - поиск по названию или ID
- `recruiter` - фильтр по рекрутеру
- `is_active` - фильтр по активности

## 🛠️ Обработчики (Новая архитектура)

### VacancyHandler
**Назначение**: Основная логика работы с вакансиями

**Методы:**
- `toggle_active_logic(pk, request=None)` - переключение статуса активности
- `search_logic(search_params)` - поиск и фильтрация вакансий
- `calculate_stats(user=None)` - расчет статистики по вакансиям
- `assign_grades_logic(vacancy_pk, grade_ids, user=None)` - назначение грейдов
- `get_my_vacancies_logic(user)` - получение вакансий пользователя

### VacancyApiHandler
**Назначение**: API-специфичные обработчики

**Методы:**
- `toggle_active_handler(params, request)` - API переключение активности
- `search_handler(params, request)` - API поиск
- `stats_handler(params, request)` - API статистика
- `assign_grades_handler(params, request)` - API назначение грейдов
- `my_vacancies_handler(params, request)` - API получение моих вакансий

### SalaryRangeHandler
**Назначение**: Логика работы с зарплатными вилками

**Методы:**
- `toggle_active_logic(pk, request=None)` - переключение статуса активности
- `search_logic(search_params)` - поиск и фильтрация зарплатных вилок
- `calculate_stats()` - расчет статистики по зарплатным вилкам
- `get_active_salary_ranges()` - получение активных зарплатных вилок
- `get_salary_ranges_for_vacancy(vacancy_pk)` - получение вилок для вакансии

### ResponseHandler
**Назначение**: Универсальные обработчики ответов

**Методы:**
- `success_response(data=None, message=None, status_code=200)` - успешный ответ
- `error_response(message, status_code=400, data=None)` - ответ об ошибке
- `api_success_response(data=None, message=None, status_code=200)` - API успешный ответ
- `api_error_response(message, status_code=400, data=None)` - API ответ об ошибке
- `toggle_response(is_active, entity_name, entity_id=None)` - ответ для toggle операций
- `pagination_context(page_obj, search_form=None, original_queryset=None, **filters)` - контекст пагинации

## 🔧 Особенности подключения

### Настройка в settings.py
```python
INSTALLED_APPS = [
    'apps.vacancies',
]
```

### Миграции
```bash
python manage.py makemigrations vacancies
python manage.py migrate
```

### Настройка ролей
1. **Рекрутеры**: Пользователи должны быть в группе 'Рекрутер'
2. **Интервьюеры**: Должны быть созданы в apps.interviewers
3. **Грейды**: Должны быть созданы в apps.finance
4. **Права доступа**: Настройка через Django группы

## 🎯 Management Commands

### update_salary_ranges
**Файл**: `management/commands/update_salary_ranges.py`

**Использование:**
```bash
python manage.py update_salary_ranges
python manage.py update_salary_ranges --force  # Принудительное обновление
```

**Функциональность:**
1. Обновляет все активные зарплатные вилки
2. Пересчитывает валюты на основе текущих курсов
3. Информативный вывод результатов

**Вывод:**
- ✅ Успешное обновление
- ❌ Ошибки при обновлении
- 📊 Статистика обновления

## 👨‍💼 Админка

### VacancyAdmin
**Особенности:**
- Отображение количества интервьюеров
- Фильтрация по активности, рекрутеру, дате
- Поиск по названию, ID, рекрутеру
- Горизонтальный выбор интервьюеров и грейдов
- Группировка полей по категориям
- Ограничение выбора рекрутеров только группой 'Рекрутер'

**Действия:**
- Массовое редактирование
- Экспорт данных
- Фильтрация по статусу

### SalaryRangeAdmin
**Особенности:**
- Отображение зарплатных вилок во всех валютах
- Цветовая индикация статуса активности
- Группировка полей по категориям
- Автоматический расчет валют
- Фильтрация по грейдам и активности

**Действия:**
- Массовое редактирование
- Экспорт данных
- Фильтрация по статусу

## 🎨 Шаблоны

### dashboard.html
**Назначение**: Главная страница вакансий
**Функциональность:**
- Статистика по вакансиям (общая, активные, неактивные)
- Статистика по зарплатным вилкам
- Последние добавленные вакансии
- Последние добавленные зарплатные вилки
- Быстрые действия и ссылки на управление

### vacancy_list.html
**Назначение**: Список вакансий
**Функциональность:**
- Список вакансий с фильтрацией
- Поиск по вакансиям (название, ID, заголовки)
- Фильтрация по рекрутеру и статусу
- Сортировка по дате создания
- Пагинация (10 вакансий на страницу)
- Действия с вакансиями (просмотр, редактирование, удаление, переключение активности)

### vacancy_detail.html
**Назначение**: Детали вакансии
**Функциональность:**
- Полная информация о вакансии
- Настройки инвайтов (заголовок, текст, промпт)
- Scorecard (заголовок, ссылка)
- Вопросы для интервью по странам
- Промпты для AI
- Привязанные грейды
- Привязанные интервьюеры
- Зарплатные вилки для данной вакансии
- Действия (редактирование, удаление, переключение активности)

### vacancy_form.html
**Назначение**: Форма создания/редактирования вакансии
**Функциональность:**
- Форма с валидацией
- Выбор рекрутера (только из группы 'Рекрутер')
- Настройка инвайтов
- Настройка Scorecard
- Вопросы для интервью
- Промпты для AI
- Выбор доступных грейдов
- Выбор интервьюеров
- Настройка активности

### salary_ranges_list.html
**Назначение**: Список зарплатных вилок
**Функциональность:**
- Список зарплатных вилок с фильтрацией
- Поиск по грейдам и вакансиям
- Фильтрация по вакансии, грейду и статусу
- Сортировка по дате создания
- Пагинация (10 вилок на страницу)
- Действия с зарплатными вилками
- Отображение во всех валютах (USD, BYN, PLN)

### salary_range_detail.html
**Назначение**: Детали зарплатной вилки
**Функциональность:**
- Полная информация о зарплатной вилке
- Отображение во всех валютах
- Информация о связанной вакансии и грейде
- Действия (редактирование, удаление, переключение активности)

### salary_range_form.html
**Назначение**: Форма создания/редактирования зарплатной вилки
**Функциональность:**
- Форма с валидацией
- Выбор вакансии
- Выбор грейда
- Ввод зарплаты в USD
- Автоматический расчет валют
- Отображение рассчитанных значений
- Настройка активности

## 💻 JavaScript функциональность

### Переключение активности
```javascript
// Переключение активности вакансии
function toggleActive(vacancyId) {
    fetch(`/vacancies/${vacancyId}/toggle-active/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            location.reload();
        } else {
            showError(data.error);
        }
    });
}

// Переключение активности зарплатной вилки
function toggleSalaryRangeActive(rangeId) {
    fetch(`/vacancies/salary-ranges/${rangeId}/toggle-active/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            location.reload();
        } else {
            showError(data.error);
        }
    });
}
```

### Удаление
```javascript
// Удаление вакансии
function deleteVacancy(vacancyId) {
    if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
        fetch(`/vacancies/${vacancyId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message);
                location.href = '/vacancies/list/';
            } else {
                showError(data.error);
            }
        });
    }
}

// Удаление зарплатной вилки
function deleteSalaryRange(rangeId) {
    if (confirm('Вы уверены, что хотите удалить эту зарплатную вилку?')) {
        fetch(`/vacancies/salary-ranges/${rangeId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message);
                location.href = '/vacancies/salary-ranges/';
            } else {
                showError(data.error);
            }
        });
    }
}
```

### Поиск и фильтрация
```javascript
// Поиск вакансий
function searchVacancies() {
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    
    fetch('/vacancies/list/', {
        method: 'GET',
        body: formData
    })
    .then(response => response.text())
    .then(html => {
        document.getElementById('vacanciesList').innerHTML = html;
    });
}

// Поиск зарплатных вилок
function searchSalaryRanges() {
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    
    fetch('/vacancies/salary-ranges/', {
        method: 'GET',
        body: formData
    })
    .then(response => response.text())
    .then(html => {
        document.getElementById('salaryRangesList').innerHTML = html;
    });
}
```

### API взаимодействие
```javascript
// Получение статистики через API
function getVacancyStats() {
    fetch('/api/vacancies/stats/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        updateStatsDisplay(data);
    });
}

// Назначение грейдов через API
function assignGrades(vacancyId, gradeIds) {
    fetch(`/api/vacancies/${vacancyId}/assign-grades/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify({
            grade_ids: gradeIds
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('Грейды успешно назначены');
            location.reload();
        } else {
            showError(data.error);
        }
    });
}
```

## 🔒 Безопасность

### Валидация данных
- Проверка уникальности external_id
- Валидация URL для scorecard_link
- Проверка прав доступа к рекрутерам
- Ограничение выбора интервьюеров и грейдов
- Валидация зарплатных диапазонов (min <= max)

### CSRF защита
- Все POST запросы защищены CSRF токенами
- Валидация на сервере
- Проверка в обработчиках

### Права доступа
- Проверка авторизации пользователя
- Ограничение доступа по ролям
- Проверка прав на редактирование
- Фильтрация данных по правам пользователя

### API безопасность
- Аутентификация через токены
- Проверка прав доступа в API обработчиках
- Валидация входных данных
- Ограничение доступа к данным других пользователей

## 🐛 Отладка

### Логирование
```python
# В обработчиках
import logging
logger = logging.getLogger(__name__)

def toggle_active_logic(pk, request=None):
    try:
        # ... логика ...
        logger.info(f"Вакансия {pk} переключена на активность: {vacancy.is_active}")
        return {'success': True, ...}
    except Exception as e:
        logger.error(f"Ошибка переключения активности вакансии {pk}: {str(e)}")
        return {'success': False, 'message': f'Ошибка: {str(e)}'}
```

### Тестирование
```bash
# Тест создания вакансии
python manage.py shell
>>> from apps.vacancies.models import Vacancy
>>> from apps.accounts.models import User
>>> from apps.finance.models import Grade
>>> recruiter = User.objects.filter(groups__name='Рекрутер').first()
>>> grade = Grade.objects.filter(is_active=True).first()
>>> vacancy = Vacancy.objects.create(
...     name='Test Vacancy',
...     external_id='TEST001',
...     recruiter=recruiter,
...     invite_title='Test Invite'
... )
>>> vacancy.available_grades.add(grade)
>>> print(f"Создана вакансия: {vacancy.name} с грейдом: {grade.name}")
```

### Тестирование обработчиков
```python
# Тест обработчиков
from apps.vacancies.logic.vacancy_handlers import VacancyHandler

# Тест поиска
search_params = {
    'query': 'Test',
    'user': request.user
}
vacancies = VacancyHandler.search_logic(search_params)
print(f"Найдено вакансий: {vacancies.count()}")

# Тест статистики
stats = VacancyHandler.calculate_stats(request.user)
print(f"Статистика: {stats}")
```

## 🚨 Troubleshooting

### Проблемы с рекрутерами
1. **Нет рекрутеров**: Проверьте создание группы 'Рекрутер'
2. **Неправильные права**: Проверьте назначение пользователей в группу
3. **Ограничения доступа**: Проверьте limit_choices_to в модели

### Проблемы с интервьюерами
1. **Нет интервьюеров**: Проверьте создание в apps.interviewers
2. **Неправильная привязка**: Проверьте логику выбора
3. **Неактивные интервьюеры**: Проверьте фильтрацию в формах

### Проблемы с грейдами
1. **Нет грейдов**: Проверьте создание в apps.finance
2. **Неактивные грейды**: Проверьте фильтрацию в формах
3. **Неправильная привязка**: Проверьте логику ManyToMany

### Проблемы с данными
1. **Дублирование external_id**: Проверьте уникальность
2. **Неправильные URL**: Проверьте валидацию scorecard_link
3. **Отсутствие данных**: Проверьте обязательные поля
4. **Ошибки валют**: Проверьте курсы валют в apps.finance

### Проблемы с формами
1. **Ошибки валидации**: Проверьте clean() методы
2. **Неправильные данные**: Проверьте типы полей
3. **Отсутствие полей**: Проверьте настройки форм

### Проблемы с обработчиками
1. **Ошибки в обработчиках**: Проверьте логи и исключения
2. **Неправильные параметры**: Проверьте передачу параметров
3. **Ошибки БД**: Проверьте запросы и связи

### Проблемы с API
1. **Ошибки аутентификации**: Проверьте токены
2. **Ошибки авторизации**: Проверьте права доступа
3. **Ошибки валидации**: Проверьте входные данные

## ⚡ Производительность

### Оптимизация запросов
- Использование `select_related` для ForeignKey
- Использование `prefetch_related` для ManyToMany
- Оптимизированные запросы в обработчиках
- Кэширование часто используемых данных

### Пагинация
- Пагинация больших списков (10 элементов на страницу)
- Оптимизированная пагинация в обработчиках
- Правильная передача original_queryset для статистики

### AJAX
- AJAX для динамических обновлений
- Асинхронные запросы для переключения активности
- Оптимизированные ответы через обработчики

### Индексы БД
- Индексы для быстрого поиска
- Составные индексы для фильтрации
- Индексы для внешних ключей

## 🔗 Интеграция с другими приложениями

### apps.huntflow
- `external_id` может использоваться для связи с вакансиями Huntflow
- Потенциальная синхронизация данных
- Интеграция через API обработчики

### apps.gemini
- `candidate_update_prompt` и `invite_prompt` используются для AI
- Интеграция с Gemini API для генерации контента
- Обработчики для работы с промптами

### apps.interviewers
- Привязка интервьюеров к вакансиям
- Управление интервьюерами через ManyToManyField
- Синхронизация статусов интервьюеров

### apps.finance
- Связь через `available_grades` (ManyToManyField)
- Интеграция с системой грейдов
- Использование валютных курсов для зарплатных вилок

### apps.google_oauth
- Интеграция для создания инвайтов
- Использование данных вакансий для HR процессов
- Автоматическое заполнение форм инвайтов

## 📈 Статистика и аналитика

### Дашборд
- Общая статистика по вакансиям
- Статистика по зарплатным вилкам
- Распределение по рекрутерам
- Распределение по грейдам
- Последние добавленные элементы

### API статистика
- REST API для получения статистики
- Детализированная статистика через обработчики
- Статистика с учетом прав доступа пользователя

### Отчеты
- Отчеты по активности вакансий
- Отчеты по зарплатным вилкам
- Анализ распределения по грейдам
- Статистика по рекрутерам

## 🔄 Миграции

### История миграций
1. `0001_initial.py` - первоначальная структура
2. `0002_salaryrange.py` - добавление зарплатных вилок
3. `0003_auto_20250912_1207.py` - автоматические изменения
4. `0004_add_screening_duration.py` - добавление длительности скринингов
5. `0005_salaryrange_vacancy.py` - связь зарплатных вилок с вакансиями
6. `0006_alter_salaryrange_unique_together.py` - уникальность вилок
7. `0007_alter_salaryrange_vacancy.py` - изменения в связи с вакансиями
8. `0008_vacancy_vacancy_link_belarus_and_more.py` - ссылки на вакансии по странам
9. `0009_remove_vacancy_vacancy_link_remote_and_more.py` - удаление удаленных ссылок
10. `0010_vacancy_available_grades.py` - добавление поля available_grades

### Текущее состояние
- Все миграции применены
- Модель полностью актуальна
- Поддержка всех функций

## 📚 Документация

### Основные документы
- `README.md` - основная документация (этот файл)
- `docs/INTER_APP_CONNECTIONS_REPORT.md` - отчет о связях с другими приложениями
- `DUPLICATE_CODE_REFACTORING_REPORT.md` - отчет о рефакторинге
- `DUPLICATE_LOGIC_ANALYSIS.md` - анализ дублирующегося кода
- `VACANCIES_FIXES_REPORT.md` - отчет об исправлениях

### API документация
- REST API эндпоинты
- Примеры запросов и ответов
- Коды ошибок и их обработка
- Аутентификация и авторизация

### Архитектурная документация
- Структура обработчиков
- Принципы работы новой архитектуры
- Связи между компонентами
- Рекомендации по развитию

## 🚀 Развитие и планы

### Завершенные улучшения
- ✅ Рефакторинг дублирующегося кода
- ✅ Вынос логики в обработчики
- ✅ Добавление поля available_grades
- ✅ Исправление ошибок пагинации
- ✅ Обновление форм и валидации
- ✅ Создание API обработчиков
- ✅ Универсальные обработчики ответов

### Планы на будущее
- 🔄 Добавление unit-тестов для обработчиков
- 🔄 Создание документации по использованию обработчиков
- 🔄 Добавление логирования в обработчики
- 🔄 Создание валидаторов для входных параметров
- 🔄 Оптимизация производительности
- 🔄 Расширение API функциональности
- 🔄 Добавление веб-хуков для интеграций
- 🔄 Улучшение аналитики и отчетности

### Рекомендации
1. **Тестирование**: Создать comprehensive test suite
2. **Мониторинг**: Добавить метрики и алерты
3. **Документация**: Расширить API документацию
4. **Производительность**: Оптимизировать запросы к БД
5. **Безопасность**: Усилить валидацию и авторизацию
6. **Интеграции**: Расширить возможности интеграции с внешними системами