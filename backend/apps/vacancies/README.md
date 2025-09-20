# Vacancies App - Локальные данные по вакансиям

## Описание
Приложение для управления локальными данными по вакансиям. Включает настройки для инвайтов, scorecard, вопросы для интервью, промпты для AI и привязку интервьюеров к вакансиям.

## Зависимости
- Django 5.2.6+
- apps.accounts (для рекрутеров)
- apps.interviewers (для интервьюеров)

## Requirements
```python
# В requirements.txt
Django>=5.2.6
```

## Связи с другими приложениями
- **apps.accounts**: Связь через `recruiter` (ForeignKey на User, ограничение на группу 'Рекрутер')
- **apps.interviewers**: Связь через `interviewers` (ManyToManyField)
- **apps.huntflow**: Потенциальная связь через `external_id`

## Модели

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
- `_calculate_other_currencies()` - расчет зарплат в других валютах
- `get_salary_display(currency)` - отформатированная зарплатная вилка для указанной валюты
- `get_salary_min(currency)` - минимальная зарплата в указанной валюте
- `get_salary_max(currency)` - максимальная зарплата в указанной валюте

## Логика работы

### Управление вакансиями
1. **Создание**: Добавление новой вакансии с настройками
2. **Редактирование**: Обновление данных вакансии
3. **Активация/деактивация**: Управление статусом
4. **Удаление**: Удаление вакансии

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
2. **Ограничения**: Каждый интервьюер может быть привязан только к одной вакансии
3. **Управление**: Добавление/удаление интервьюеров

### Управление зарплатными вилками
1. **Создание**: Добавление зарплатной вилки для грейда
2. **Редактирование**: Обновление зарплатных вилок в USD
3. **Автоматический расчет**: Пересчет в BYN и PLN на основе курсов валют
4. **Активация/деактивация**: Управление статусом вилок
5. **Удаление**: Удаление зарплатных вилок

## Эндпоинты

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
Приложение не предоставляет собственных API эндпоинтов, но данные используются в других приложениях.

## Формы

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
- `interviewers` - интервьюеры
- `is_active` - активна ли вакансия

### SalaryRangeForm
**Назначение**: Форма для создания/редактирования зарплатных вилок
**Поля:**
- `grade` - грейд
- `salary_min_usd` - минимальная зарплата в USD
- `salary_max_usd` - максимальная зарплата в USD
- `is_active` - активна ли зарплатная вилка

### SalaryRangeSearchForm
**Назначение**: Форма поиска зарплатных вилок
**Поля:**
- `search` - поиск по грейду
- `grade` - фильтр по грейду
- `is_active` - фильтр по активности

### VacancySearchForm
**Назначение**: Форма поиска вакансий
**Поля:**
- `search` - поиск по названию или ID
- `recruiter` - фильтр по рекрутеру
- `is_active` - фильтр по активности

## Особенности подключения

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
3. **Права доступа**: Настройка через Django группы

## Management Commands

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

## Админка

### VacancyAdmin
**Особенности:**
- Отображение количества интервьюеров
- Фильтрация по активности, рекрутеру, дате
- Поиск по названию, ID, рекрутеру
- Горизонтальный выбор интервьюеров
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

## Шаблоны

### dashboard.html
**Назначение**: Главная страница вакансий
**Функциональность:**
- Статистика по вакансиям
- Активные вакансии
- Быстрые действия
- Ссылки на управление

### vacancy_list.html
**Назначение**: Список вакансий
**Функциональность:**
- Список вакансий с фильтрацией
- Поиск по вакансиям
- Сортировка
- Пагинация
- Действия с вакансиями

### vacancy_detail.html
**Назначение**: Детали вакансии
**Функциональность:**
- Полная информация о вакансии
- Настройки инвайтов
- Scorecard
- Вопросы для интервью
- Промпты
- Привязанные интервьюеры

### vacancy_form.html
**Назначение**: Форма создания/редактирования вакансии
**Функциональность:**
- Форма с валидацией
- Выбор рекрутера
- Настройка инвайтов
- Настройка Scorecard
- Вопросы для интервью
- Промпты
- Выбор интервьюеров

### salary_ranges_list.html
**Назначение**: Список зарплатных вилок
**Функциональность:**
- Список зарплатных вилок с фильтрацией
- Поиск по грейдам
- Сортировка
- Пагинация
- Действия с зарплатными вилками
- Отображение во всех валютах

### salary_range_detail.html
**Назначение**: Детали зарплатной вилки
**Функциональность:**
- Полная информация о зарплатной вилке
- Отображение во всех валютах
- Действия с зарплатной вилкой

### salary_range_form.html
**Назначение**: Форма создания/редактирования зарплатной вилки
**Функциональность:**
- Форма с валидацией
- Выбор грейда
- Ввод зарплаты в USD
- Автоматический расчет валют
- Отображение рассчитанных значений

## JavaScript функциональность

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
```

### Удаление вакансии
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
```

## Безопасность

### Валидация данных
- Проверка уникальности external_id
- Валидация URL для scorecard_link
- Проверка прав доступа к рекрутерам
- Ограничение выбора интервьюеров

### CSRF защита
- Все POST запросы защищены CSRF токенами
- Валидация на сервере

### Права доступа
- Проверка авторизации пользователя
- Ограничение доступа по ролям
- Проверка прав на редактирование

## Отладка

### Логирование
```python
# В views.py
print(f"Создание вакансии: {vacancy.name}")
print(f"Привязка интервьюеров: {interviewers_count}")
print(f"Ошибка валидации: {error}")
```

### Тестирование
```bash
# Тест создания вакансии
python manage.py shell
>>> from apps.vacancies.models import Vacancy
>>> from apps.accounts.models import User
>>> recruiter = User.objects.filter(groups__name='Рекрутер').first()
>>> vacancy = Vacancy.objects.create(
...     name='Test Vacancy',
...     external_id='TEST001',
...     recruiter=recruiter,
...     invite_title='Test Invite'
... )
>>> print(f"Создана вакансия: {vacancy.name}")
```

## Troubleshooting

### Проблемы с рекрутерами
1. **Нет рекрутеров**: Проверьте создание группы 'Рекрутер'
2. **Неправильные права**: Проверьте назначение пользователей в группу
3. **Ограничения доступа**: Проверьте limit_choices_to в модели

### Проблемы с интервьюерами
1. **Нет интервьюеров**: Проверьте создание в apps.interviewers
2. **Дублирование**: Проверьте ограничения ManyToMany
3. **Неправильная привязка**: Проверьте логику выбора

### Проблемы с данными
1. **Дублирование external_id**: Проверьте уникальность
2. **Неправильные URL**: Проверьте валидацию scorecard_link
3. **Отсутствие данных**: Проверьте обязательные поля

### Проблемы с формами
1. **Ошибки валидации**: Проверьте clean() методы
2. **Неправильные данные**: Проверьте типы полей
3. **Отсутствие полей**: Проверьте настройки форм

## Производительность
- Оптимизация запросов к БД
- Пагинация больших списков
- Кэширование данных
- AJAX для динамических обновлений
- Индексы в БД для быстрого поиска

## Интеграция с другими приложениями

### apps.huntflow
- `external_id` может использоваться для связи с вакансиями Huntflow
- Потенциальная синхронизация данных

### apps.gemini
- `candidate_update_prompt` и `invite_prompt` используются для AI
- Интеграция с Gemini API для генерации контента

### apps.interviewers
- Привязка интервьюеров к вакансиям
- Управление интервьюерами через ManyToManyField
