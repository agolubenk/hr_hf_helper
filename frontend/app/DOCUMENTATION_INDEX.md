# Индекс документации страниц приложения HR Helper

## Общая статистика

- **Всего страниц**: 54
- **Всего документов**: 58 (включая layout и дополнительные документы)
- **Покрытие**: 100%

## Структура документации

Каждый документ `PAGE_DOCUMENTATION.md` содержит:

1. **Общее описание** - назначение и основная функциональность страницы
2. **Компоненты страницы** - описание всех компонентов с их назначением и логикой
3. **Состояние компонента** - все state переменные
4. **Функции и обработчики** - описание всех функций с их логикой
5. **Фильтрация и поиск** - если применимо
6. **Моковые данные** - структура данных с описанием
7. **TODO: Замена моковых данных на API** - список задач для интеграции с API
8. **Стили** - используемые CSS модули
9. **Связи с другими страницами** - навигация и связи
10. **Особенности** - уникальные особенности страницы

## Список всех документов

### Основные страницы
- `/PAGE_DOCUMENTATION.md` - Главная страница
- `/LAYOUT_DOCUMENTATION.md` - Корневой layout
- `/account/login/PAGE_DOCUMENTATION.md` - Вход
- `/account/forgot-password/PAGE_DOCUMENTATION.md` - Восстановление пароля
- `/account/reset-password/PAGE_DOCUMENTATION.md` - Сброс пароля
- `/account/profile/PAGE_DOCUMENTATION.md` - Профиль
- `/search/PAGE_DOCUMENTATION.md` - Поиск

### Рабочие страницы
- `/workflow/PAGE_DOCUMENTATION.md` - Workflow
- `/recr-chat/PAGE_DOCUMENTATION.md` - Чат рекрутера
- `/aichat/PAGE_DOCUMENTATION.md` - ИИ Чат
- `/calendar/PAGE_DOCUMENTATION.md` - Календарь
- `/wiki/PAGE_DOCUMENTATION.md` - Вики
- `/wiki/[id]/PAGE_DOCUMENTATION.md` - Детальный просмотр статьи вики
- `/wiki/[id]/edit/PAGE_DOCUMENTATION.md` - Редактирование статьи вики

### Управление данными
- `/invites/PAGE_DOCUMENTATION.md` - Инвайты
- `/invites/[id]/PAGE_DOCUMENTATION.md` - Детальный просмотр инвайта
- `/invites/[id]/edit/PAGE_DOCUMENTATION.md` - Редактирование инвайта
- `/vacancies/PAGE_DOCUMENTATION.md` - Вакансии
- `/vacancies/[id]/PAGE_DOCUMENTATION.md` - Детальный просмотр вакансии
- `/vacancies/[id]/edit/PAGE_DOCUMENTATION.md` - Редактирование вакансии
- `/vacancies/salary-ranges/PAGE_DOCUMENTATION.md` - Зарплатные вилки
- `/vacancies/salary-ranges/[id]/PAGE_DOCUMENTATION.md` - Детальный просмотр зарплатной вилки
- `/hiring-requests/PAGE_DOCUMENTATION.md` - Заявки на подбор
- `/hiring-requests/[id]/PAGE_DOCUMENTATION.md` - Детальный просмотр заявки
- `/hiring-requests/[id]/edit/PAGE_DOCUMENTATION.md` - Редактирование заявки
- `/interviewers/PAGE_DOCUMENTATION.md` - Интервьюеры

### Настройки компании
- `/company-settings/PAGE_DOCUMENTATION.md` - Общие настройки
- `/company-settings/users/PAGE_DOCUMENTATION.md` - Пользователи
- `/company-settings/user-groups/PAGE_DOCUMENTATION.md` - Группы пользователей
- `/company-settings/grades/PAGE_DOCUMENTATION.md` - Грейды
- `/company-settings/finance/PAGE_DOCUMENTATION.md` - Финансовые настройки
- `/company-settings/integrations/PAGE_DOCUMENTATION.md` - Интеграции
- `/company-settings/org-structure/PAGE_DOCUMENTATION.md` - Оргструктура
- `/company-settings/candidate-fields/PAGE_DOCUMENTATION.md` - Поля кандидатов
- `/company-settings/scorecard/PAGE_DOCUMENTATION.md` - Scorecard
- `/company-settings/employee-lifecycle/PAGE_DOCUMENTATION.md` - Жизненный цикл сотрудника
- `/company-settings/vacancy-prompt/PAGE_DOCUMENTATION.md` - Промпты вакансий
- `/company-settings/sla/PAGE_DOCUMENTATION.md` - SLA
- `/company-settings/recruiting/stages/PAGE_DOCUMENTATION.md` - Этапы найма
- `/company-settings/recruiting/offer-template/PAGE_DOCUMENTATION.md` - Шаблон оффера
- `/company-settings/recruiting/rules/PAGE_DOCUMENTATION.md` - Правила рекрутинга

### Финансы и отчетность
- `/finance/PAGE_DOCUMENTATION.md` - Финансы
- `/finance/benchmarks/PAGE_DOCUMENTATION.md` - Бенчмарки
- `/reporting/PAGE_DOCUMENTATION.md` - Отчетность
- `/reporting/company/PAGE_DOCUMENTATION.md` - Отчет по компании
- `/reporting/hiring-plan/PAGE_DOCUMENTATION.md` - План найма
- `/reporting/hiring-plan/yearly/PAGE_DOCUMENTATION.md` - Годовой план найма

### Другие страницы
- `/candidate-responses/PAGE_DOCUMENTATION.md` - Ответы кандидатам
- `/huntflow/PAGE_DOCUMENTATION.md` - Настройка Huntflow
- `/telegram/PAGE_DOCUMENTATION.md` - Telegram вход
- `/telegram/2fa/PAGE_DOCUMENTATION.md` - Telegram 2FA
- `/telegram/chats/PAGE_DOCUMENTATION.md` - Telegram чаты

### Страницы ошибок
- `/error-401/PAGE_DOCUMENTATION.md` - Ошибка 401
- `/error-402/PAGE_DOCUMENTATION.md` - Ошибка 402
- `/error-500/PAGE_DOCUMENTATION.md` - Ошибка 500
- `/forbidden/PAGE_DOCUMENTATION.md` - Запрещено
- `/not-found/PAGE_DOCUMENTATION.md` - Не найдено

## Как использовать документацию

1. **Для разработчиков**: Используйте документы для понимания структуры и логики страниц
2. **Для интеграции API**: Смотрите раздел "TODO: Замена моковых данных на API" в каждом документе
3. **Для навигации**: Используйте раздел "Связи с другими страницами" для понимания связей
4. **Для компонентов**: Смотрите раздел "Компоненты страницы" для понимания используемых компонентов

## Общие TODO для всех страниц

Основные задачи для замены моковых данных на API:

1. ❌ Загрузка данных - реализовать через API вместо моковых данных
2. ❌ CRUD операции - реализовать создание, чтение, обновление, удаление через API
3. ❌ Фильтрация и поиск - реализовать на сервере через API
4. ❌ Пагинация - реализовать через API с поддержкой пагинации на сервере
5. ❌ Валидация - реализовать детальную валидацию на клиенте и сервере
6. ❌ Обработка ошибок - реализовать детальную обработку ошибок API

## Дата создания

Документация создана: 26 января 2026

