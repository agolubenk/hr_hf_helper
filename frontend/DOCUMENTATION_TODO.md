# TODO: Документация и комментарии в коде

## Статус выполнения

### ✅ Завершено
- ✅ Все страницы имеют базовую документацию (PAGE_DOCUMENTATION.md)
- ✅ Добавлены подробные комментарии в `account/*` страницах
- ✅ Добавлены подробные комментарии в `calendar/page.tsx`
- ✅ Добавлены подробные комментарии в `invites/page.tsx` (частично)

### 🔄 В процессе
- 🔄 Добавление подробных комментариев в `invites/[id]/page.tsx`
- 🔄 Добавление подробных комментариев в `invites/[id]/edit/page.tsx`

### 📋 Осталось сделать

## 1. Страницы, требующие подробных inline комментариев

### Приоритет 1 (Основные рабочие страницы)
- [ ] `workflow/page.tsx` - Workflow страница
- [ ] `recr-chat/page.tsx` - Чат рекрутера
- [ ] `aichat/page.tsx` - ИИ Чат
- [ ] `vacancies/page.tsx` - Список вакансий
- [ ] `vacancies/[id]/page.tsx` - Детальный просмотр вакансии
- [ ] `vacancies/[id]/edit/page.tsx` - Редактирование вакансии
- [ ] `hiring-requests/page.tsx` - Список заявок на подбор
- [ ] `hiring-requests/[id]/page.tsx` - Детальный просмотр заявки

### Приоритет 2 (Управление данными)
- [ ] `candidate-responses/page.tsx` - Ответы кандидатов
- [ ] `interviewers/page.tsx` - Интервьюеры
- [ ] `wiki/page.tsx` - Вики (список)
- [ ] `wiki/[id]/page.tsx` - Вики (детальный просмотр)
- [ ] `wiki/[id]/edit/page.tsx` - Вики (редактирование)
- [ ] `telegram/page.tsx` - Telegram интеграция
- [ ] `telegram/chats/page.tsx` - Telegram чаты
- [ ] `telegram/2fa/page.tsx` - Telegram 2FA

### Приоритет 3 (Настройки компании)
- [ ] `company-settings/page.tsx` - Главная страница настроек
- [ ] `company-settings/users/page.tsx` - Управление пользователями
- [ ] `company-settings/user-groups/page.tsx` - Группы пользователей
- [ ] `company-settings/integrations/page.tsx` - Интеграции
- [ ] `company-settings/finance/page.tsx` - Финансовые настройки
- [ ] `company-settings/grades/page.tsx` - Грейды
- [ ] `company-settings/org-structure/page.tsx` - Оргструктура
- [ ] `company-settings/candidate-fields/page.tsx` - Поля кандидатов
- [ ] `company-settings/recruiting/stages/page.tsx` - Этапы рекрутинга
- [ ] `company-settings/recruiting/rules/page.tsx` - Правила рекрутинга
- [ ] `company-settings/recruiting/commands/page.tsx` - Команды рекрутинга
- [ ] `company-settings/recruiting/offer-template/page.tsx` - Шаблон оффера
- [ ] `company-settings/sla/page.tsx` - SLA настройки
- [ ] `company-settings/scorecard/page.tsx` - Scorecard настройки
- [ ] `company-settings/employee-lifecycle/page.tsx` - Жизненный цикл сотрудника
- [ ] `company-settings/vacancy-prompt/page.tsx` - Промпты для вакансий

### Приоритет 4 (Отчеты и аналитика)
- [ ] `reporting/page.tsx` - Главная страница отчетов
- [ ] `reporting/company/page.tsx` - Отчеты по компании
- [ ] `reporting/hiring-plan/page.tsx` - План найма
- [ ] `reporting/hiring-plan/yearly/page.tsx` - Годовой план найма
- [ ] `finance/page.tsx` - Финансы
- [ ] `finance/benchmarks/page.tsx` - Бенчмарки
- [ ] `vacancies/salary-ranges/page.tsx` - Диапазоны зарплат
- [ ] `vacancies/salary-ranges/[id]/page.tsx` - Детальный просмотр диапазона

### Приоритет 5 (Вспомогательные страницы)
- [ ] `search/page.tsx` - Поиск
- [ ] `huntflow/page.tsx` - Huntflow интеграция
- [ ] `errors/401/page.tsx` - Ошибка 401
- [ ] `errors/402/page.tsx` - Ошибка 402
- [ ] `errors/404/page.tsx` - Ошибка 404
- [ ] `errors/500/page.tsx` - Ошибка 500
- [ ] `errors/forbidden/page.tsx` - Запрещено

## 2. Компоненты, требующие подробных комментариев

### Компоненты профиля
- [x] `components/profile/QuickButtonsPage.tsx` - ✅ Завершено
- [x] `components/profile/ProfileEditForm.tsx` - ✅ Завершено
- [x] `components/profile/IntegrationsPage.tsx` - ✅ Завершено
- [x] `components/profile/AccentColorSettings.tsx` - ✅ Завершено
- [x] `components/profile/ProfileInfo.tsx` - ✅ Завершено

### Компоненты инвайтов
- [ ] `components/invites/InvitesStats.tsx` - Статистика инвайтов
- [ ] `components/invites/CreateInviteModal.tsx` - Модальное окно создания инвайта

### Компоненты вакансий
- [ ] `components/vacancies/VacancyCard.tsx` - Карточка вакансии
- [ ] `components/vacancies/VacancyFilters.tsx` - Фильтры вакансий

### Компоненты workflow
- [ ] `components/workflow/WorkflowSidebar.tsx` - Боковая панель workflow
- [ ] `components/workflow/SlotsPanel.tsx` - Панель слотов

### Компоненты чата
- [ ] `components/aichat/ChatMessages.tsx` - Сообщения чата
- [ ] `components/aichat/FormattedText.tsx` - Форматированный текст
- [ ] `components/telegram/RichTextInput.tsx` - Богатый текстовый ввод

### Компоненты настроек компании
- [ ] `components/company-settings/RecruitingCommandsSettings.tsx` - Настройки команд рекрутинга
- [ ] `components/company-settings/IntegrationScopeModal.tsx` - Модальное окно области интеграции

### Общие компоненты
- [ ] `components/Header.tsx` - Заголовок приложения
- [ ] `components/Sidebar.tsx` - Боковая панель
- [ ] `components/FloatingActions.tsx` - Плавающие действия
- [ ] `components/GlobalSearch/GlobalSearch.tsx` - Глобальный поиск
- [ ] `components/Toast/ToastContext.tsx` - Контекст уведомлений

## 3. Типы комментариев, которые нужно добавить

### Для каждой страницы/компонента:

1. **Заголовочные комментарии (JSDoc)**
   - ✅ Описание назначения компонента
   - ✅ Описание состояния (state переменные)
   - ✅ Описание связей с другими компонентами

2. **Inline комментарии к функциям**
   - [ ] Описание параметров функции
   - [ ] Описание возвращаемого значения
   - [ ] Описание логики работы
   - [ ] Описание обработки ошибок
   - [ ] TODO комментарии для будущих улучшений

3. **Комментарии к константам и данным**
   - [ ] Описание назначения константы
   - [ ] Описание структуры моковых данных
   - [ ] Описание маппингов и конфигураций

4. **JSX комментарии**
   - [ ] Описание назначения секций JSX
   - [ ] Описание условного рендеринга
   - [ ] Описание обработчиков событий

## 4. Структура комментариев

### Пример хорошего комментария:

```typescript
/**
 * handleSave - обработчик сохранения данных
 * 
 * Функциональность:
 * - Валидирует данные формы
 * - Отправляет запрос на сервер
 * - Обрабатывает ответ и ошибки
 * 
 * Поведение:
 * - Показывает индикатор загрузки во время сохранения
 * - Показывает toast-уведомление об успехе или ошибке
 * - Перенаправляет на страницу детального просмотра после успеха
 * 
 * TODO: Добавить валидацию на клиенте перед отправкой
 * 
 * @param data - данные формы для сохранения
 * @returns Promise<void>
 */
const handleSave = async (data: FormData) => {
  // ... код
}
```

## 5. Приоритеты выполнения

1. **Высокий приоритет**: Основные рабочие страницы (workflow, recr-chat, vacancies)
2. **Средний приоритет**: Управление данными и настройки компании
3. **Низкий приоритет**: Отчеты и вспомогательные страницы

## 6. Метрики прогресса

- **Всего страниц**: 55
- **Страниц с подробными комментариями**: ~5
- **Прогресс**: ~9%
- **Осталось**: ~50 страниц

## 7. Рекомендации

1. Начинать с наиболее используемых страниц
2. Добавлять комментарии постепенно, при работе над страницей
3. Использовать единый стиль комментариев
4. Обновлять этот документ по мере выполнения задач

## Дата создания

Документ создан: 28 января 2026

## Последнее обновление

Обновлено: 28 января 2026
