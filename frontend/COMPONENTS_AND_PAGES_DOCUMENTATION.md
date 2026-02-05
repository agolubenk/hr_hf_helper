# Документация компонентов и страниц приложения HR Helper

Полное и детализированное описание всех компонентов и страниц фронтенд-приложения.

---

## Оглавление

1. [Структура приложения](#1-структура-приложения)
2. [Layout и провайдеры](#2-layout-и-провайдеры)
3. [Все страницы (маршруты)](#3-все-страницы-маршруты)
4. [Все компоненты](#4-все-компоненты)

---

## 1. Структура приложения

- **Фреймворк:** Next.js (App Router).
- **UI:** Radix UI Themes.
- **Язык:** TypeScript, React.
- **Стили:** CSS Modules, глобальные стили (`globals.css`, `@radix-ui/themes/styles.css`).
- **Корневой layout:** `app/layout.tsx` — оборачивает всё приложение в `ThemeProvider` и `ToastProvider`.
- **Основной layout страниц:** `AppLayout` (Header, Sidebar, контент, FloatingActions, опционально StatusBar).
- **Специальный layout:** `app/admin/layout.tsx` — обёртка для раздела админки с левым AdminSidebar и бургер-кнопкой в Header.

---

## 2. Layout и провайдеры

### 2.1. Root Layout — `app/layout.tsx`

**Назначение:** Корневой layout Next.js. Оборачивает все страницы, подключает глобальные стили и провайдеры.

**Содержимое:**
- `html` с `lang="ru"`.
- Импорт `@radix-ui/themes/styles.css` и `./globals.css`.
- **ThemeProvider** — управление темой (light/dark), сохранение в localStorage, применение к DOM.
- **ToastProvider** — контекст уведомлений; дочерние компоненты вызывают `useToast()` для показа toast.

**Метаданные:**
- `title: 'HR Helper'`
- `description: 'HR Helper Application'`

**Поведение:** Применяется ко всем маршрутам автоматически. Провайдеры инициализируются при загрузке приложения.

---

### 2.2. AppLayout — `components/AppLayout.tsx`

**Назначение:** Единый layout для всех основных страниц: шапка, сайдбар, контент, плавающие действия, при необходимости статусная панель.

**Пропсы:**
| Проп | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `children` | `ReactNode` | — | Контент страницы |
| `pageTitle` | `string` | `"HR Helper"` | Заголовок в Header |
| `userName` | `string` | `"Голубенко Андрей"` | Имя пользователя в Header |
| `onLogout` | `() => void` | — | Обработчик выхода |
| `leftHeaderContent` | `ReactNode` | — | Контент слева от заголовка (например, бургер в админке) |

**Внутреннее состояние:**
- `menuOpen` — открыто/закрыто правое боковое меню (Sidebar). На десктопе сохраняется в `localStorage` (ключ `sidebarMenuOpen`), на мобильных (< 768px) всегда закрыто при загрузке.

**Структура рендера:**
1. **Header** — фиксированный сверху, высота 64px; заголовок, поиск, тема, меню, профиль, выход; опционально `leftContent`.
2. **StatusBar** — показывается только если `pathname` начинается с `/recr-chat`; фиксирован под Header, высота 48px.
3. **Sidebar** — фиксированный справа, ширина 280px; открытие/закрытие по `menuOpen` и `onClose`.
4. **FloatingActions** — плавающие кнопки быстрых действий.
5. **Контент** — `Flex` с `marginTop: 64px` или `112px` (если есть StatusBar); внутри `Box` с отступами, `marginRight` в зависимости от `menuOpen`, `marginLeft: 24px`.

**Поведение:**
- При `window.innerWidth < 768` меню закрывается и не восстанавливается из localStorage.
- При ресайзе окна при переходе на мобильную ширину меню закрывается.
- `handleMenuToggle` переключает `menuOpen`; `handleLogout` вызывает `onLogout` или `console.log`.

**Связи:** Header, Sidebar, FloatingActions, StatusBar, usePathname, useTheme.

---

### 2.3. Admin Layout — `app/admin/layout.tsx`

**Назначение:** Layout раздела админки. Использует тот же AppLayout, но добавляет левый AdminSidebar и кнопку-бургер в Header.

**Содержимое:**
- Состояние `adminSidebarOpen` (инициализация из `localStorage`, ключ `adminSidebarOpen`; на мобильных — `false`).
- Кнопка-бургер (`HamburgerMenuIcon`) в `leftHeaderContent` AppLayout; по клику переключает `adminSidebarOpen`.
- **AppLayout** с `pageTitle="Admin CRM"` и `leftHeaderContent={burgerButton}`.
- **AdminSidebar** с `isOpen={adminSidebarOpen}`, `onClose={() => setAdminSidebarOpen(false)}`.
- Контент в `Box` с `marginLeft: adminSidebarOpen ? 280 : 0` и классом `styles.adminWrap` / `styles.content`.

**Поведение:** Состояние сайдбара админки сохраняется в localStorage на десктопе; бургер открывает/закрывает левую панель.

---

### 2.4. ThemeProvider — `components/ThemeProvider.tsx`

**Назначение:** Провайдер темы (светлая/тёмная) и акцентных цветов.

**Контекст:**
- `theme: 'light' | 'dark'`
- `toggleTheme: () => void`
- `lightThemeAccentColor`, `darkThemeAccentColor` — акцентные цвета для каждой темы.
- `setLightThemeAccentColor`, `setDarkThemeAccentColor` — установка акцентных цветов.

**Поведение:** Тема и акценты сохраняются в localStorage; при первой загрузке при отсутствии сохранённой темы используется `prefers-color-scheme`. Применяет атрибуты к `document.documentElement` и `document.body`. Использует флаг `mounted` для избежания hydration mismatch.

**Использование:** `const { theme, toggleTheme, ... } = useTheme()`.

---

### 2.5. ToastProvider и Toast — `components/Toast/ToastContext.tsx`, `components/Toast/Toast.tsx`

**Назначение:** Глобальная система уведомлений (toast).

**ToastContext:**
- `showToast(options)` — базовый показ.
- `showInfo(title, message?, options?)`
- `showSuccess(title, message?, options?)`
- `showError(title, message?, options?)`
- `showWarning(title, message?, options?)`
- `showSystem(title, message?, options?)`
- `removeToast(id)`

**Поведение:** Тосты рендерятся через Portal в `body`, автоматически скрываются по `duration`, поддерживают действия (кнопки). Типы влияют на иконку и стиль.

**Использование:** `const toast = useToast(); toast.showInfo('Заголовок', 'Текст');`

---

## 3. Все страницы (маршруты)

Ниже перечислены все маршруты приложения с путём, назначением и основными компонентами.

### 3.1. Корень и главная

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/` | `app/page.tsx` | Главная (хаб): приветствие, карточки разделов, приветственный тур | AppLayout, карточки BLOCKS (Link + Card), кнопка «Приветственный тур» (driver.js), сохранение шага тура в localStorage (TOUR_STORAGE_KEY_STEP, TOUR_STORAGE_KEY_URL) |

---

### 3.2. Workflow и рекрутинг

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/workflow` | `app/workflow/page.tsx` | Рабочая страница чата/воркфлоу: кандидаты, слоты, выбор вакансии | AppLayout, WorkflowHeader, WorkflowChat, WorkflowSidebar, SlotsPanel (модальная панель слотов) |
| `/recr-chat` | `app/recr-chat/page.tsx` | ATS \| Talent Pool: чат рекрутеров, кандидаты | AppLayout (с StatusBar), контент recr-chat |
| `/invites` | `app/invites/page.tsx` | Интервью (инвайты): список инвайтов, статистика, создание | AppLayout, InvitesStats, CreateInviteModal, список инвайтов |
| `/invites/[id]` | `app/invites/[id]/page.tsx` | Детальная страница инвайта | AppLayout, контент инвайта по id |
| `/invites/[id]/edit` | `app/invites/[id]/edit/page.tsx` | Редактирование инвайта | AppLayout, форма редактирования |
| `/interviewers` | `app/interviewers/page.tsx` | Интервьюеры: список, фильтры, добавление | AppLayout, список/карточки интервьюеров |
| `/hiring-requests` | `app/hiring-requests/page.tsx` | Заявки на подбор: список, фильтры, создание | AppLayout, RequestsSearchFilters, RequestsStats, RequestsTable (или карточки), CreateRequestModal |

---

### 3.3. Вакансии и зарплатные вилки

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/vacancies` | `app/vacancies/page.tsx` | Список вакансий: карточки/список, фильтры, статистика, добавление | AppLayout, VacanciesSearchFilters, VacanciesStats, VacancyCard / VacancyListItem, AddVacancyModal |
| `/vacancies/[id]` | `app/vacancies/[id]/page.tsx` | Детальная страница вакансии | AppLayout, VacancyDetailHeader, BasicInfoSection, AnalysisPromptSection, InterviewersSection, SalaryRangesSection, TransferStagesSection, RelatedSections |
| `/vacancies/[id]/edit` | `app/vacancies/[id]/edit/page.tsx` | Редактирование вакансии | AppLayout, секции редактирования: BasicInfoEditSection, AnalysisPromptEditSection, InterviewersEditSection, SalaryRangesEditSection, ScorecardEditSection, TransferStagesEditSection, VacancyLinksEditSection |
| `/vacancies/salary-ranges` | `app/vacancies/salary-ranges/page.tsx` | Зарплатные вилки: список, фильтры, создание | AppLayout, SalaryRangesSearchFilters, SalaryRangesStats, SalaryRangeCard / SalaryRangeListItem, CreateSalaryRangeModal |
| `/vacancies/salary-ranges/[id]` | `app/vacancies/salary-ranges/[id]/page.tsx` | Детальная страница зарплатной вилки | AppLayout, контент вилки, SalaryRangeDetailModal при необходимости |

---

### 3.4. Финансы

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/finance` | `app/finance/page.tsx` | Раздел финансов: навигация к вилкам и бенчмаркам | AppLayout, ссылки/карточки на salary-ranges и benchmarks |
| `/finance/benchmarks` | `app/finance/benchmarks/page.tsx` | Бенчмарки: аналитика, сравнение с рынком | AppLayout, контент бенчмарков |

---

### 3.5. Календарь, интеграции, вики

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/calendar` | `app/calendar/page.tsx` | Календарь: события, слоты | AppLayout, контент календаря |
| `/huntflow` | `app/huntflow/page.tsx` | Интеграция Huntflow | AppLayout, контент Huntflow |
| `/aichat` | `app/aichat/page.tsx` | ИИ-чат: ассистент для HR | AppLayout, ChatHeader, ChatMessages, ChatInput, ChatHistory, AnimatedAIInput, FormattedText |
| `/telegram` | `app/telegram/page.tsx` | Telegram: настройки, ссылки | AppLayout, навигация по подразделам |
| `/telegram/chats` | `app/telegram/chats/page.tsx` | Чаты Telegram | AppLayout, контент чатов |
| `/telegram/2fa` | `app/telegram/2fa/page.tsx` | 2FA для Telegram | AppLayout, форма/инфо 2FA |
| `/wiki` | `app/wiki/page.tsx` | Вики: список статей, фильтры по категориям/тегам | AppLayout, WikiHeader, WikiFilters, WikiCategory, WikiCard |
| `/wiki/[id]` | `app/wiki/[id]/page.tsx` | Детальная страница статьи вики | AppLayout, WikiDetailHeader, WikiDetailContent, WikiDetailSidebar, WikiDetailHistory, WikiFileUploadModal, WikiEditForm, WikiTagSelector, WikiDeleteConfirmDialog |
| `/wiki/[id]/edit` | `app/wiki/[id]/edit/page.tsx` | Редактирование статьи вики | AppLayout, форма редактирования вики |

---

### 3.6. Отчётность

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/reporting` | `app/reporting/page.tsx` | Главная отчётности: обзор, ссылки на отчёты | AppLayout, карточки/ссылки отчётов |
| `/reporting/hiring-plan` | `app/reporting/hiring-plan/page.tsx` | План найма | AppLayout, контент плана найма |
| `/reporting/hiring-plan/yearly` | `app/reporting/hiring-plan/yearly/page.tsx` | План найма по годам | AppLayout, контент годового плана |
| `/reporting/company` | `app/reporting/company/page.tsx` | Отчёт по компании | AppLayout, контент отчёта по компании |

---

### 3.7. Ответы кандидатам и поиск

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/candidate-responses` | `app/candidate-responses/page.tsx` | Шаблоны ответов кандидатам: общие, по грейдам, слоты | AppLayout, GeneralTemplatesTab, GradeTemplatesTab, SlotsTab, RejectionTemplateForm |
| `/search` | `app/search/page.tsx` | Глобальный поиск (страница поиска) | AppLayout, контент поиска (связь с GlobalSearch) |

---

### 3.8. Аккаунт и авторизация

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/account/login` | `app/account/login/page.tsx` | Вход: email, пароль, восстановление пароля | Форма входа, ссылка на forgot-password, редирект при успехе |
| `/account/forgot-password` | `app/account/forgot-password/page.tsx` | Восстановление пароля: ввод email | Форма, отправка запроса, сообщение об успехе |
| `/account/reset-password` | `app/account/reset-password/page.tsx` | Сброс пароля по токену из URL | Форма нового пароля и подтверждения, валидация |
| `/account/profile` | `app/account/profile/page.tsx` | Профиль пользователя: вкладки Профиль, Интеграции, Быстрые кнопки | AppLayout, ProfileNavigation, ProfileInfo, ProfileEditForm, IntegrationSettingsModal, QuickButtonsPage, AccentColorSettings, UserCard, GoogleIntegration, QuickButtonModal, IntegrationSettingsForm |

---

### 3.9. Настройки компании

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/company-settings` | `app/company-settings/page.tsx` | Общие настройки компании | AppLayout, GeneralSettings, левое меню подразделов |
| `/company-settings/org-structure` | `app/company-settings/org-structure/page.tsx` | Оргструктура | AppLayout, контент оргструктуры |
| `/company-settings/grades` | `app/company-settings/grades/page.tsx` | Грейды | AppLayout, GradesSettings, GradeForm |
| `/company-settings/finance` | `app/company-settings/finance/page.tsx` | Финансовые настройки | AppLayout, CurrencyRatesSection, GradesSection, TaxesSection |
| `/company-settings/employee-lifecycle` | `app/company-settings/employee-lifecycle/page.tsx` | Жизненный цикл сотрудников | AppLayout, EmployeeLifecycleSettings |
| `/company-settings/integrations` | `app/company-settings/integrations/page.tsx` | Интеграции компании | AppLayout, IntegrationScopeModal |
| `/company-settings/user-groups` | `app/company-settings/user-groups/page.tsx` | Группы пользователей | AppLayout, GroupAccessModal |
| `/company-settings/users` | `app/company-settings/users/page.tsx` | Пользователи компании | AppLayout, UserAccessModal |
| `/company-settings/recruiting/stages` | `app/company-settings/recruiting/stages/page.tsx` | Этапы найма | AppLayout, RecruitingStagesSettings |
| `/company-settings/recruiting/commands` | `app/company-settings/recruiting/commands/page.tsx` | Команды рекрутинга | AppLayout, RecruitingCommandsSettings |
| `/company-settings/recruiting/rules` | `app/company-settings/recruiting/rules/page.tsx` | Правила рекрутинга | AppLayout, контент правил |
| `/company-settings/recruiting/offer-template` | `app/company-settings/recruiting/offer-template/page.tsx` | Шаблон оффера | AppLayout, контент шаблона оффера |
| `/company-settings/scorecard` | `app/company-settings/scorecard/page.tsx` | Scorecard | AppLayout, ScorecardSettings |
| `/company-settings/sla` | `app/company-settings/sla/page.tsx` | SLA | AppLayout, SLASettings, SLAEditModal |
| `/company-settings/vacancy-prompt` | `app/company-settings/vacancy-prompt/page.tsx` | Единый промпт для вакансий | AppLayout, VacancyPromptSettings |
| `/company-settings/candidate-fields` | `app/company-settings/candidate-fields/page.tsx` | Дополнительные поля кандидатов | AppLayout, CandidateFieldsSettings |

---

### 3.10. Admin CRM

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `/admin` | `app/admin/page.tsx` | Главная админки: модули и ссылки на подразделы | AppLayout (через admin layout), AdminSidebar, карточки по ADMIN_MODULES из config.ts |
| `/admin/users` | `app/admin/users/page.tsx` | Пользователи (список из API) | AppLayout, таблица пользователей, загрузка/ошибка/пустое состояние |
| `/admin/groups` | `app/admin/groups/page.tsx` | Группы (список из API) | AppLayout, таблица групп, загрузка/ошибка/пустое состояние |

**Конфиг админки:** `app/admin/config.ts` — `ADMIN_MODULES`: Учётные записи (users, groups), Вакансии, Рекрутинг, Отчётность, Настройки компании, Интеграции.

---

### 3.11. Ошибки и 404

| Путь | Файл | Назначение | Основные компоненты / поведение |
|------|------|------------|----------------------------------|
| `errors/401` | `app/errors/401/page.tsx` | Ошибка 401 (не авторизован) | AppLayout, текст и кнопки перехода |
| `errors/402` | `app/errors/402/page.tsx` | Ошибка 402 (требуется оплата) | AppLayout, контент 402 |
| `errors/404` | `app/errors/404/page.tsx` | Ошибка 404 (страница не найдена) | AppLayout, контент 404 |
| `errors/500` | `app/errors/500/page.tsx` | Ошибка 500 (сервер) | AppLayout, контент 500 |
| `errors/forbidden` | `app/errors/forbidden/page.tsx` | Доступ запрещён | AppLayout, контент 403 |
| (любой неизвестный путь) | `app/not-found.tsx` | Глобальная 404: анимированный фон, код 404, кнопки «На главную» и «Назад» | AppLayout, FloatingIcon (40 иконок), driver.js не используется |

---

## 4. Все компоненты

Описание компонентов по папкам и назначению.

---

### 4.1. Базовые компоненты (корень `components/`)

#### AppLayout — `components/AppLayout.tsx`

Описание см. в разделе [2.2](#22-applayout--componentsapplayouttsx).

---

#### Header — `components/Header.tsx`

**Назначение:** Верхняя панель: заголовок страницы, поиск, меню, тема, профиль, выход.

**Пропсы:**
| Проп | Тип | Описание |
|------|-----|----------|
| `pageTitle` | `string` | Заголовок страницы |
| `userName` | `string` | Имя пользователя |
| `onMenuToggle` | `() => void` | Открыть/закрыть Sidebar |
| `onThemeToggle` | `() => void` | Переключить тему |
| `currentTheme` | `'light' \| 'dark'` | Текущая тема |
| `menuOpen` | `boolean` | Состояние Sidebar |
| `onLogout` | `() => void` | Выход |
| `leftContent` | `ReactNode` | Контент слева от заголовка (бургер админки и т.п.) |

**Элементы:** Заголовок (Slot), GlobalSearch (горячая клавиша Cmd+S / Ctrl+S), кнопка меню (data-tour="header-menu"), кнопка темы (data-tour="header-theme"), область профиля (data-tour="header-profile"), кнопка выхода (data-tour="header-logout"). Определение shortcutKey для Mac/Windows.

**Стили:** `Header.module.css`.

---

#### Sidebar — `components/Sidebar.tsx`

**Назначение:** Правое боковое меню навигации: иерархия пунктов, «Главная» с выбором главной страницы, «Admin CRM» с выбором главной страницы админки.

**Пропсы:** `isOpen: boolean`, `onClose: () => void`.

**Состояние/логика:**
- Тема из `useTheme()`.
- `pathname` для подсветки активного пункта.
- «Главная»: `homeHref` из localStorage (`sidebarHomeHref`), DropdownMenu с выбором главной по блокам (mainPagesByBlock), GearIcon 16×16, `pr="3"`.
- «Admin CRM»: `adminHomeHref` из localStorage (`sidebarAdminHomeHref`), DropdownMenu со списком из `ADMIN_MODULES` (adminMainPages), GearIcon, `pr="3"`.
- Пункты «в разработке» из `IN_DEVELOPMENT_IDS` — при клике toast «В разработке».
- На мобильных при навигации вызывается `onClose`.

**Структура меню:** menuItems (Главная, Календарь, Рекрутинг с детьми, Финансы, Интеграции, Вики, Отчётность), Separator, settingsItems (Профиль, Интеграции и API, Настройки компании, Admin CRM). Иконки 16×16, стили `Sidebar.module.css` (menuItem, menuItemActive).

---

#### FloatingActions — `components/FloatingActions.tsx`

**Назначение:** Плавающая панель быстрых действий (ссылки, копирование текста/даты, прокрутка вверх, настройки).

**Поведение:** По умолчанию скрыта; показ при наведении на левый край экрана или при закреплении. Состояние закрепления и включения кнопок хранится в localStorage и синхронизируется между вкладками (CustomEvent). Учитывается pathname для отступа сверху (recr-chat — 112px). Кнопка «Вверх» — плавная прокрутка вверх; кнопка настроек — переход на страницу настроек быстрых кнопок. Использует QuickButtonsContext (или настройки из профиля).

**Иконки:** PinUnpinnedIcon / PinLeftIcon для закрепления, GearIcon, ArrowUpIcon и иконки быстрых кнопок.

---

#### StatusBar — `components/StatusBar.tsx`

**Назначение:** Горизонтальная панель под Header на странице recr-chat: выбор вакансии, статусы кандидатов, группировка неактивных этапов.

**Пропсы:**
- `vacancies`, `myVacancyIds`, `statuses`, `onGeneralSettingsClick`, `onAddVacancy`.

**Поведение:** Выпадающий список вакансий (Мои / Все / список), горизонтальный скролл статусов, группа «N этапов без кандидатов» с раскрытием. AddVacancyModal при добавлении вакансии. Стили `StatusBar.module.css`.

---

#### ThemeProvider — `components/ThemeProvider.tsx`

Описание см. в разделе [2.4](#24-themeprovider--componentsthemeprovidertsx).

---

#### Toast и ToastContext — `components/Toast/ToastContext.tsx`, `components/Toast/Toast.tsx`

Описание см. в разделе [2.5](#25-toastprovider-и-toast--componentstoasttoastcontexttsx-componentstoasttoasttsx).

**Toast.tsx:** Рендер одного уведомления (иконка, заголовок, описание, кнопки действий). Типы: info, success, error, warning, system. Стили `Toast.module.css`.

---

#### GlobalSearch — `components/GlobalSearch/GlobalSearch.tsx`

**Назначение:** Глобальный поиск (горячая клавиша Cmd+S / Ctrl+S в Header).

**Пропсы:** `placeholder`, `shortcutHint`, `dark`, `onSearch`, `onEntityClick` (и др. при необходимости). Статус: в разработке; при активации может показываться toast. Стили `GlobalSearch.module.css`.

---

#### FloatingLabelInput — `components/FloatingLabelInput.tsx`

**Назначение:** Поле ввода с плавающим лейблом (для форм логина, восстановления пароля и т.д.).

**Пропсы:** стандартные для input + label, возможно `error`, `required`. Используется в формах аккаунта.

---

#### QuickButtonsContext — `components/QuickButtonsContext.tsx`

**Назначение:** Контекст быстрых кнопок для FloatingActions: список кнопок, включение/выключение, синхронизация с localStorage/профилем.

**Использование:** Обеспечивает данные для FloatingActions и страницы настроек быстрых кнопок.

---

### 4.2. Workflow — `components/workflow/`

| Компонент | Назначение | Основное |
|-----------|------------|----------|
| **WorkflowHeader** | Шапка страницы workflow: быстрые ссылки, выбор вакансии, кнопки Календарь, Вакансия, слоты, Обновить | data-tour атрибуты для тура, тогглер этапа (Скрининг/Интервью) |
| **WorkflowChat** | Чат с данными по кандидатам | Сообщения, ввод, отображение структурированных данных |
| **WorkflowSidebar** | Боковая панель: отчёты по этапам, вики, быстрые действия | data-tour="workflow-sidebar" |
| **SlotsPanel** | Панель слотов (модальная или выдвижная): копирование слотов, назначение | Открывается из WorkflowHeader |

Стили: `WorkflowHeader.module.css`, `WorkflowChat.module.css`, `WorkflowSidebar.module.css`, `SlotsPanel.module.css`.

---

### 4.3. Вакансии — `components/vacancies/`

| Компонент | Назначение |
|-----------|------------|
| **VacanciesSearchFilters** | Поиск и фильтры списка вакансий (рекрутер, статус: все/активные/неактивные) |
| **VacanciesStats** | Счётчики: всего, активные, неактивные |
| **VacancyCard** | Карточка вакансии (вид сетки) |
| **VacancyListItem** | Элемент списка вакансии (вид списка) |
| **AddVacancyModal** | Модальное окно создания вакансии; форма с полями; используется также из StatusBar |
| **VacancyEditModal** | Модальное окно редактирования вакансии |
| **VacancyDetailHeader** | Заголовок детальной страницы вакансии с действиями |
| **BasicInfoSection** | Блок основной информации на детальной странице |
| **AnalysisPromptSection** | Блок промпта для анализа |
| **InterviewersSection** | Блок интервьюеров |
| **SalaryRangesSection** | Блок зарплатных вилок |
| **TransferStagesSection** | Блок этапов переноса |
| **RelatedSections** | Связанные разделы |

**Редактирование вакансии** (`components/vacancies/edit/`): BasicInfoEditSection, AnalysisPromptEditSection, InterviewersEditSection, SalaryRangesEditSection, ScorecardEditSection, TransferStagesEditSection, VacancyLinksEditSection, InterviewQuestionsEditSection — секции формы редактирования на странице `/vacancies/[id]/edit`.

Соответствующие `.module.css` для каждого компонента.

---

### 4.4. Зарплатные вилки — `components/salary-ranges/`

| Компонент | Назначение |
|-----------|------------|
| **SalaryRangesSearchFilters** | Фильтры списка зарплатных вилок |
| **SalaryRangesStats** | Статистика по вилкам |
| **SalaryRangeCard** | Карточка вилки |
| **SalaryRangeListItem** | Элемент списка вилки |
| **CreateSalaryRangeModal** | Создание новой вилки |
| **SalaryRangeDetailModal** | Детальный просмотр/редактирование вилки в модалке |

---

### 4.5. Заявки (requests) — `components/requests/`

| Компонент | Назначение |
|-----------|------------|
| **RequestsSearchFilters** | Фильтры заявок на подбор |
| **RequestsStats** | Статистика по заявкам |
| **RequestCard** | Карточка заявки |
| **RequestListItem** | Элемент списка заявки |
| **RequestTableRow** | Строка таблицы заявки |
| **RequestTableRowExpanded** | Развёрнутая строка (детали) |
| **RequestsTable** | Таблица заявок |
| **CreateRequestModal** | Создание заявки |

---

### 4.6. Инвайты — `components/invites/`

| Компонент | Назначение |
|-----------|------------|
| **InvitesStats** | Статистика по инвайтам |
| **CreateInviteModal** | Создание нового инвайта |

---

### 4.7. AI Chat — `components/aichat/`

| Компонент | Назначение |
|-----------|------------|
| **ChatHeader** | Заголовок чата ИИ-ассистента |
| **ChatMessages** | Контейнер сообщений чата |
| **ChatInput** | Поле ввода сообщения |
| **ChatHistory** | История чата (боковая панель или список) |
| **AnimatedAIInput** | Анимированный инпут для ИИ |
| **FormattedText** | Форматирование текста ответов (markdown и т.д.) |

---

### 4.8. Профиль — `components/profile/`

| Компонент | Назначение |
|-----------|------------|
| **ProfileNavigation** | Вкладки: Профиль, Интеграции, Быстрые кнопки |
| **ProfileInfo** | Отображение информации о пользователе |
| **ProfileEditForm** | Форма редактирования профиля |
| **UserCard** | Карточка пользователя |
| **IntegrationSettingsModal** | Модальное окно настроек интеграций |
| **IntegrationSettingsForm** | Форма настроек интеграций |
| **IntegrationsPage** | Страница/блок интеграций (в профиле) |
| **AccentColorSettings** | Выбор акцентного цвета темы |
| **QuickButtonsPage** | Страница настройки быстрых кнопок |
| **QuickButtonModal** | Модальное окно добавления/редактирования быстрой кнопки |
| **GoogleIntegration** | Блок интеграции с Google |

---

### 4.9. Настройки компании — `components/company-settings/`

| Компонент | Назначение |
|-----------|------------|
| **GeneralSettings** | Общие настройки компании (логотип, офисы и т.д.) |
| **GradesSettings** | Настройки грейдов |
| **GradeForm** | Форма грейда |
| **RecruitingStagesSettings** | Этапы найма и причины отказа |
| **RecruitingCommandsSettings** | Команды рекрутинга |
| **EmployeeLifecycleSettings** | Жизненный цикл сотрудников |
| **CandidateFieldsSettings** | Дополнительные поля кандидатов |
| **ScorecardSettings** | Настройки scorecard |
| **SLASettings** | Настройки SLA |
| **SLAEditModal** | Редактирование SLA в модалке |
| **VacancyPromptSettings** | Единый промпт для вакансий |
| **GroupAccessModal** | Модальное окно доступа группы |
| **UserAccessModal** | Модальное окно доступа пользователя |
| **IntegrationScopeModal** | Модальное окно области интеграции (в integrations) |

---

### 4.10. Финансы — `components/finance/`

| Компонент | Назначение |
|-----------|------------|
| **CurrencyRatesSection** | Блок курсов валют |
| **GradesSection** | Блок грейдов в финансовом контексте |
| **TaxesSection** | Блок налогов |

---

### 4.11. Ответы кандидатам — `components/candidate-responses/`

| Компонент | Назначение |
|-----------|------------|
| **GeneralTemplatesTab** | Вкладка общих шаблонов ответов |
| **GradeTemplatesTab** | Вкладка шаблонов по грейдам |
| **SlotsTab** | Вкладка слотов (шаблоны слотов) |
| **RejectionTemplateForm** | Форма шаблона отказа |

---

### 4.12. Вики — `components/wiki/`

| Компонент | Назначение |
|-----------|------------|
| **WikiHeader** | Заголовок списка статей, кнопки действий |
| **WikiFilters** | Фильтры по категориям/тегам |
| **WikiCategory** | Группа статей по категории |
| **WikiCard** | Карточка статьи в списке |
| **WikiDetailHeader** | Заголовок детальной страницы статьи |
| **WikiDetailContent** | Контент статьи |
| **WikiDetailSidebar** | Боковая панель на детальной странице |
| **WikiDetailHistory** | История изменений статьи |
| **WikiEditForm** | Форма редактирования статьи |
| **WikiFileUploadModal** | Загрузка файлов к статье |
| **WikiTagSelector** | Выбор тегов |
| **WikiDeleteConfirmDialog** | Подтверждение удаления статьи |

---

### 4.13. Telegram — `components/telegram/`

| Компонент | Назначение |
|-----------|------------|
| **RichTextInput** | Поле ввода с форматированием текста |

---

### 4.14. Admin — `app/admin/`

| Компонент | Назначение |
|-----------|------------|
| **AdminSidebar** | Левое боковое меню админки: Главная, модули из ADMIN_MODULES; фиксированная ширина 280px; открытие/закрытие по `isOpen` (transform translateX) |
| **config.ts** | `ADMIN_MODULES` — массив модулей с id, label, description, items (href, label). Используется в Sidebar для adminMainPages и в AdminSidebar для навигации. |

Стили: `app/admin/admin.module.css` (adminSidebar, adminWrap, content, cardLink, dashboardCard, sidebarModuleLabel).

---

## Сводная таблица маршрутов (все page.tsx)

| Маршрут | Файл |
|---------|------|
| `/` | app/page.tsx |
| `/workflow` | app/workflow/page.tsx |
| `/recr-chat` | app/recr-chat/page.tsx |
| `/invites` | app/invites/page.tsx |
| `/invites/[id]` | app/invites/[id]/page.tsx |
| `/invites/[id]/edit` | app/invites/[id]/edit/page.tsx |
| `/interviewers` | app/interviewers/page.tsx |
| `/hiring-requests` | app/hiring-requests/page.tsx |
| `/vacancies` | app/vacancies/page.tsx |
| `/vacancies/[id]` | app/vacancies/[id]/page.tsx |
| `/vacancies/[id]/edit` | app/vacancies/[id]/edit/page.tsx |
| `/vacancies/salary-ranges` | app/vacancies/salary-ranges/page.tsx |
| `/vacancies/salary-ranges/[id]` | app/vacancies/salary-ranges/[id]/page.tsx |
| `/finance` | app/finance/page.tsx |
| `/finance/benchmarks` | app/finance/benchmarks/page.tsx |
| `/calendar` | app/calendar/page.tsx |
| `/huntflow` | app/huntflow/page.tsx |
| `/aichat` | app/aichat/page.tsx |
| `/telegram` | app/telegram/page.tsx |
| `/telegram/chats` | app/telegram/chats/page.tsx |
| `/telegram/2fa` | app/telegram/2fa/page.tsx |
| `/wiki` | app/wiki/page.tsx |
| `/wiki/[id]` | app/wiki/[id]/page.tsx |
| `/wiki/[id]/edit` | app/wiki/[id]/edit/page.tsx |
| `/reporting` | app/reporting/page.tsx |
| `/reporting/hiring-plan` | app/reporting/hiring-plan/page.tsx |
| `/reporting/hiring-plan/yearly` | app/reporting/hiring-plan/yearly/page.tsx |
| `/reporting/company` | app/reporting/company/page.tsx |
| `/candidate-responses` | app/candidate-responses/page.tsx |
| `/search` | app/search/page.tsx |
| `/account/login` | app/account/login/page.tsx |
| `/account/forgot-password` | app/account/forgot-password/page.tsx |
| `/account/reset-password` | app/account/reset-password/page.tsx |
| `/account/profile` | app/account/profile/page.tsx |
| `/company-settings` | app/company-settings/page.tsx |
| + все подразделы company-settings (org-structure, grades, finance, employee-lifecycle, integrations, user-groups, users, recruiting/*, scorecard, sla, vacancy-prompt, candidate-fields) | app/company-settings/.../page.tsx |
| `/admin` | app/admin/page.tsx |
| `/admin/users` | app/admin/users/page.tsx |
| `/admin/groups` | app/admin/groups/page.tsx |
| `/errors/401` | app/errors/401/page.tsx |
| `/errors/402` | app/errors/402/page.tsx |
| `/errors/404` | app/errors/404/page.tsx |
| `/errors/500` | app/errors/500/page.tsx |
| `/errors/forbidden` | app/errors/forbidden/page.tsx |
| (not found) | app/not-found.tsx |

---

*Документ актуален на момент описания структуры приложения. При добавлении новых страниц или компонентов разделы 3 и 4 следует дополнять по той же схеме.*
