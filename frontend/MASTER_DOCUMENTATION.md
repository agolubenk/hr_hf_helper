# Мастер-документация Frontend приложения HR Helper

## Обзор

Этот документ является центральным индексом всей документации frontend приложения HR Helper. Он объединяет архитектурные принципы, документацию компонентов и страниц, обеспечивая полное понимание структуры и работы приложения.

**Версия документа:** 2.0.0  
**Последнее обновление:** 2026-01-27  
**Покрытие документации:** 100% (все компоненты и страницы задокументированы)

---

## Оглавление

1. [Архитектурные принципы](#архитектурные-принципы)
2. [Структура проекта](#структура-проекта)
3. [Базовые компоненты](#базовые-компоненты)
4. [Компоненты по функциональным областям](#компоненты-по-функциональным-областям)
5. [Страницы приложения](#страницы-приложения)
6. [Архитектурные паттерны](#архитектурные-паттерны)
7. [Интеграция с API](#интеграция-с-api)
8. [Руководство по разработке](#руководство-по-разработке)

---

## Архитектурные принципы

### Микросервисная архитектура

**Важно:** Весь проект разбит по микросервисам. Каждый микросервис отвечает за свою область функциональности и может быть разработан, развернут и масштабирован независимо.

**Принципы организации:**
- Каждый микросервис имеет четко определенную область ответственности
- Микросервисы взаимодействуют через четко определенные API
- Изоляция данных и состояния между микросервисами
- Возможность независимого развертывания и масштабирования

**Применение в frontend:**
- Модули приложения организованы по доменам (telegram, aichat, recr-chat и т.д.)
- Каждый модуль может быть выделен в отдельный микросервис при необходимости
- Компоненты и логика изолированы по функциональным областям
- API клиенты организованы по микросервисам

**Документация модулей:**
- **Telegram**: `app/telegram/PAGE_DOCUMENTATION.md`, `components/telegram/COMPONENTS_DOCUMENTATION.md`
- **AI Chat**: `app/aichat/PAGE_DOCUMENTATION.md`, `components/aichat/COMPONENTS_DOCUMENTATION.md`
- **Workflow**: `app/workflow/PAGE_DOCUMENTATION.md`, `components/workflow/COMPONENTS_DOCUMENTATION.md`
- **Vacancies**: `app/vacancies/PAGE_DOCUMENTATION.md`, `components/vacancies/COMPONENTS_DOCUMENTATION.md`
- **Wiki**: `app/wiki/PAGE_DOCUMENTATION.md`, `components/wiki/COMPONENTS_DOCUMENTATION.md`
- И другие...

### SOLID принципы

#### S - Single Responsibility Principle (Принцип единственной ответственности)

**Каждый класс, компонент или модуль должен иметь только одну причину для изменения.**

**Применение в компонентах:**

**Примеры из кодовой базы:**
- `FormattedText` (`components/aichat/FormattedText.tsx`) - отвечает только за форматирование и отображение текста
- `useToast` (`components/Toast/ToastContext.tsx`) - отвечает только за управление уведомлениями
- `ThemeProvider` (`components/ThemeProvider.tsx`) - отвечает только за управление темой
- `GlobalSearch` (`components/GlobalSearch/GlobalSearch.tsx`) - отвечает только за глобальный поиск

**Документация:**
- См. `components/aichat/COMPONENTS_DOCUMENTATION.md` для FormattedText
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для useToast
- См. `components/COMPONENTS_DOCUMENTATION.md` для ThemeProvider
- См. `components/GlobalSearch/COMPONENTS_DOCUMENTATION.md` для GlobalSearch

#### O - Open/Closed Principle (Принцип открытости/закрытости)

**Программные сущности должны быть открыты для расширения, но закрыты для модификации.**

**Применение в компонентах:**

**Примеры из кодовой базы:**
- Компоненты принимают props для настройки поведения вместо жестко закодированной логики
- `VacancyCard` и `VacancyListItem` - разные представления одних данных через props
- `Toast` - настраивается через props (type, actions, duration)
- `FloatingActions` - принимает кастомные actions через props

**Документация:**
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md` для VacancyCard/VacancyListItem
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для Toast
- См. `components/COMPONENTS_DOCUMENTATION.md` для FloatingActions

#### L - Liskov Substitution Principle (Принцип подстановки Барбары Лисков)

**Объекты в программе должны заменяться экземплярами их подтипов без изменения корректности программы.**

**Применение в компонентах:**

**Примеры из кодовой базы:**
- Все компоненты, реализующие интерфейс `Vacancy`, могут использоваться взаимозаменяемо
- `RequestCard`, `RequestListItem`, `RequestTableRow` - разные представления одного интерфейса `Request`
- `SalaryRangeCard` и `SalaryRangeListItem` - взаимозаменяемые представления `SalaryRange`

**Документация:**
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md` для интерфейса Vacancy
- См. `components/requests/COMPONENTS_DOCUMENTATION.md` для интерфейса Request
- См. `components/salary-ranges/COMPONENTS_DOCUMENTATION.md` для интерфейса SalaryRange

#### I - Interface Segregation Principle (Принцип разделения интерфейса)

**Клиенты не должны зависеть от интерфейсов, которые они не используют.**

**Применение в компонентах:**

**Примеры из кодовой базы:**
- Разделение интерфейсов для разных типов сообщений (TelegramMessage, AIChatMessage)
- Компоненты получают только необходимые props
- API клиенты разделены по микросервисам, а не объединены в один большой клиент
- `ToastAction` - отдельный интерфейс для действий в уведомлениях

**Документация:**
- См. `components/telegram/COMPONENTS_DOCUMENTATION.md` для TelegramMessage
- См. `components/aichat/COMPONENTS_DOCUMENTATION.md` для AIChatMessage
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для ToastAction

#### D - Dependency Inversion Principle (Принцип инверсии зависимостей)

**Модули высокого уровня не должны зависеть от модулей низкого уровня. Оба должны зависеть от абстракций.**

**Применение в компонентах:**

**Примеры из кодовой базы:**
- Компоненты зависят от интерфейсов данных, а не от конкретных структур
- API клиенты инжектируются через контексты или props
- `ThemeProvider` - инжектирует тему через контекст
- `ToastProvider` - инжектирует функции уведомлений через контекст
- `QuickButtonsContext` - инжектирует быстрые кнопки через контекст

**Документация:**
- См. `components/COMPONENTS_DOCUMENTATION.md` для ThemeProvider и ToastProvider
- См. `components/COMPONENTS_DOCUMENTATION.md` для QuickButtonsContext

### DRY принцип (Don't Repeat Yourself)

**Избегаем дублирования кода, логики и данных. Каждая часть знания должна иметь единственное, однозначное представление в системе.**

#### 1. Переиспользование компонентов

**Примеры из кодовой базы:**
- `FormattedText` используется в `/aichat` и `/telegram/chats`
- `ToastProvider` используется во всем приложении
- `AppLayout` оборачивает все страницы
- `GlobalSearch` используется в Header на всех страницах
- `VacancyCard` и `VacancyListItem` - разные представления одних данных

**Документация:**
- См. `components/aichat/COMPONENTS_DOCUMENTATION.md` для FormattedText
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для ToastProvider
- См. `components/COMPONENTS_DOCUMENTATION.md` для AppLayout
- См. `components/GlobalSearch/COMPONENTS_DOCUMENTATION.md` для GlobalSearch
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md` для VacancyCard/VacancyListItem

#### 2. Переиспользование логики

**Примеры из кодовой базы:**
- `useToast` - общий хук для уведомлений
- `useTheme` - общий хук для темы
- `useQuickButtons` - общий хук для быстрых кнопок
- Логика форматирования текста централизована в `FormattedText`
- Логика конвертации markdown централизована в `RichTextInput`

**Документация:**
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для useToast
- См. `components/COMPONENTS_DOCUMENTATION.md` для useTheme
- См. `components/COMPONENTS_DOCUMENTATION.md` для useQuickButtons
- См. `components/aichat/COMPONENTS_DOCUMENTATION.md` для FormattedText
- См. `components/telegram/COMPONENTS_DOCUMENTATION.md` для RichTextInput

#### 3. Переиспользование типов и интерфейсов

**Примеры из кодовой базы:**
- Интерфейсы определены один раз и переиспользуются
- `Vacancy` интерфейс используется в VacancyCard, VacancyListItem, VacancyEditModal
- `Request` интерфейс используется в RequestCard, RequestListItem, RequestsTable
- `SalaryRange` интерфейс используется в SalaryRangeCard, SalaryRangeListItem

**Документация:**
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md` для интерфейса Vacancy
- См. `components/requests/COMPONENTS_DOCUMENTATION.md` для интерфейса Request
- См. `components/salary-ranges/COMPONENTS_DOCUMENTATION.md` для интерфейса SalaryRange

#### 4. Избегание дублирования стилей

**Примеры из кодовой базы:**
- CSS модули для изоляции стилей
- Переиспользование классов стилей
- CSS переменные Radix UI для темизации
- Общие стили в `telegram.module.css` для всех страниц Telegram

**Документация:**
- См. `app/telegram/PAGE_DOCUMENTATION.md` для telegram.module.css
- См. `components/COMPONENTS_DOCUMENTATION.md` для использования CSS модулей

#### 5. Единая точка истины для данных

**Примеры из кодовой базы:**
- `ToastContext` - единая точка управления уведомлениями
- `ThemeProvider` - единая точка управления темой
- `QuickButtonsContext` - единая точка управления быстрыми кнопками
- Состояние меню в AppLayout - единая точка управления меню

**Документация:**
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для ToastContext
- См. `components/COMPONENTS_DOCUMENTATION.md` для ThemeProvider
- См. `components/COMPONENTS_DOCUMENTATION.md` для QuickButtonsContext и AppLayout

---

## Структура проекта

### Директории

```
frontend/
├── app/                          # Next.js App Router страницы
│   ├── account/                  # Страницы аккаунта (вход, профиль, восстановление пароля)
│   ├── aichat/                   # Страница AI чата
│   ├── calendar/                 # Страница календаря
│   ├── candidate-responses/      # Страница ответов кандидатам
│   ├── company-settings/          # Страницы настроек компании
│   ├── finance/                  # Страницы финансов
│   ├── hiring-requests/          # Страницы заявок на найм
│   ├── huntflow/                 # Страница интеграции Huntflow
│   ├── invites/                  # Страницы инвайтов
│   ├── recr-chat/                # Страница чата рекрутера
│   ├── reporting/                # Страницы отчетности
│   ├── telegram/                 # Страницы Telegram интеграции
│   ├── vacancies/                # Страницы вакансий
│   ├── wiki/                     # Страницы вики
│   ├── workflow/                 # Страница workflow
│   └── [другие страницы]/
│
├── components/                   # React компоненты
│   ├── account/                  # Компоненты аккаунта
│   ├── aichat/                   # Компоненты AI чата
│   ├── candidate-responses/      # Компоненты ответов кандидатам
│   ├── company-settings/         # Компоненты настроек компании
│   ├── finance/                  # Компоненты финансов
│   ├── GlobalSearch/             # Компонент глобального поиска
│   ├── invites/                  # Компоненты инвайтов
│   ├── profile/                  # Компоненты профиля
│   ├── requests/                 # Компоненты заявок
│   ├── salary-ranges/            # Компоненты зарплатных вилок
│   ├── telegram/                 # Компоненты Telegram
│   ├── Toast/                    # Компоненты уведомлений
│   ├── vacancies/                # Компоненты вакансий
│   ├── wiki/                     # Компоненты вики
│   ├── workflow/                 # Компоненты workflow
│   ├── AppLayout.tsx             # Основной layout
│   ├── FloatingActions.tsx       # Плавающие кнопки
│   ├── FloatingLabelInput.tsx    # Поле ввода с плавающей меткой
│   ├── Header.tsx                # Верхняя панель
│   ├── QuickButtonsContext.tsx   # Контекст быстрых кнопок
│   ├── Sidebar.tsx               # Боковое меню
│   ├── StatusBar.tsx             # Статусная панель
│   └── ThemeProvider.tsx         # Провайдер темы
│
├── lib/                          # Утилиты и библиотеки
│   ├── api.ts                    # API клиент
│   └── huntflowUserSettings.ts   # Настройки пользователя Huntflow
│
└── public/                       # Статические файлы
    └── avatars/                  # Аватары пользователей
```

### Документация по директориям

**Страницы (app/):**
- Всего страниц: 54
- Всего документов: 61 (включая layout и дополнительные документы)
- Покрытие: 100%
- Индекс: `app/DOCUMENTATION_INDEX.md`
- Сводка: `app/SUMMARY.md`

**Компоненты (components/):**
- Всего директорий компонентов: 15
- Всего документов: 15
- Покрытие: 100%
- Главный документ: `components/COMPONENTS_DOCUMENTATION.md`

---

## Базовые компоненты

### AppLayout

**Файл:** `components/AppLayout.tsx`, `components/AppLayout.module.css`  
**Документация:** `components/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за структуру layout и управление меню
- ✅ **Open/Closed**: Расширяется через children и props без модификации
- ✅ **DRY**: Единая точка управления структурой всех страниц

**Функциональность:**
- Оборачивает все страницы приложения единым layout
- Управляет структурой страницы (Header, Sidebar, контент)
- Управляет состоянием бокового меню (открыто/закрыто)
- Адаптивная верстка для мобильных и десктопных устройств
- Сохранение состояния меню в localStorage
- Условный рендеринг StatusBar для страницы recr-chat

**Связи:**
- Использует: Header, Sidebar, FloatingActions, StatusBar, ThemeProvider
- Используется в: Всех страницах приложения через layout

**Масштабируемость:**
- ✅ Адаптивность для разных размеров экрана
- ✅ Сохранение состояния в localStorage
- ✅ Оптимизация рендеринга через условный рендеринг

### Header

**Файл:** `components/Header.tsx`, `components/Header.module.css`  
**Документация:** `components/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за верхнюю панель навигации
- ✅ **Open/Closed**: Расширяется через props без модификации
- ✅ **DRY**: Единая точка для глобального поиска и управления темой

**Функциональность:**
- Отображение заголовка текущей страницы
- Глобальный поиск по приложению (GlobalSearch)
- Управление темой (светлая/темная)
- Уведомления (в разработке)
- Информация о пользователе и выход из системы
- Кнопка открытия/закрытия бокового меню
- Горячие клавиши Cmd+S (Mac) / Ctrl+S (Windows/Linux) для фокуса на поиск

**Связи:**
- Использует: GlobalSearch, useRouter, useToast, ThemeProvider
- Используется в: AppLayout

**Масштабируемость:**
- ✅ Адаптивная верстка для мобильных устройств
- ✅ Горячие клавиши для быстрого доступа
- ✅ Поддержка разных платформ (Mac/Windows)

### Sidebar

**Файл:** `components/Sidebar.tsx`, `components/Sidebar.module.css`  
**Документация:** `components/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за навигацию
- ✅ **Open/Closed**: Структура меню может быть расширена без модификации кода
- ✅ **DRY**: Единая точка навигации для всего приложения

**Функциональность:**
- Навигация по разделам приложения
- Иерархическая структура меню с вложенными пунктами
- Подсветка активного пункта меню
- Автоматическое раскрытие активных разделов
- Закрытие меню на мобильных устройствах при навигации
- Обработка пунктов "в разработке" (показ toast вместо навигации)
- Синхронизация активной вкладки профиля через localStorage и CustomEvent

**Связи:**
- Использует: useRouter, usePathname, useToast, ThemeProvider
- Используется в: AppLayout

**Масштабируемость:**
- ⚠️ TODO: Загружать структуру меню из API
- ✅ Адаптивное поведение для мобильных устройств
- ✅ Автоматическое раскрытие активных разделов

### FloatingActions

**Файл:** `components/FloatingActions.tsx`  
**Документация:** `components/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за плавающие кнопки быстрых действий
- ✅ **Open/Closed**: Расширяется через props (actions) без модификации
- ✅ **DRY**: Единая точка для быстрых действий

**Функциональность:**
- Быстрый доступ к часто используемым функциям
- Настраиваемые быстрые кнопки (ссылки, текст, дата/время)
- Кнопка прокрутки страницы вверх
- Кнопка настроек быстрых кнопок
- Закрепление/открепление панели
- Невидимая зона срабатывания: показ панели при наведении на левый край экрана
- Сохранение состояния в localStorage (закрепление, видимость кнопок)
- Синхронизация состояния между вкладками браузера

**Связи:**
- Использует: useRouter, usePathname, useTheme, localStorage, CustomEvent
- Используется в: AppLayout

**Масштабируемость:**
- ⚠️ TODO: Загружать настройки быстрых кнопок из API
- ✅ Синхронизация между вкладками
- ✅ Плавная прокрутка с easing функцией

### ThemeProvider

**Файл:** `components/ThemeProvider.tsx`  
**Документация:** `components/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за управление темой
- ✅ **Open/Closed**: Расширяется через контекст без модификации
- ✅ **DRY**: Единая точка управления темой для всего приложения

**Функциональность:**
- Управление темой приложения (светлая/темная)
- Управление акцентными цветами для светлой и темной темы
- Сохранение настроек темы в localStorage
- Определение системной темы при первой загрузке
- Применение темы к HTML и body элементам
- Предотвращение hydration mismatch (mounted флаг)

**Связи:**
- Использует: Radix UI Theme, localStorage, window.matchMedia
- Используется в: `/app/layout.tsx` (оборачивает все страницы)

**Масштабируемость:**
- ⚠️ TODO: Синхронизация темы с сервером
- ✅ Сохранение предпочтений пользователя
- ✅ Поддержка системной темы

### ToastProvider

**Файл:** `components/Toast/ToastContext.tsx`  
**Документация:** `components/Toast/COMPONENTS_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за управление уведомлениями
- ✅ **Open/Closed**: Расширяется через контекст без модификации
- ✅ **DRY**: Единая точка управления уведомлениями для всего приложения

**Функциональность:**
- Централизованное управление уведомлениями
- Отображение различных типов уведомлений (info, warning, error, success, system)
- Управление жизненным циклом уведомлений (показ, удаление)
- Поддержка действий в уведомлениях (кнопки)
- Рендеринг уведомлений через React Portal в body
- Применение темы к уведомлениям

**Связи:**
- Использует: React Portal, ThemeProvider, Radix UI Theme
- Используется в: `/app/layout.tsx` (оборачивает все страницы)

**Масштабируемость:**
- ⚠️ TODO: Логирование уведомлений на сервер
- ⚠️ TODO: Персистентность критических уведомлений
- ⚠️ TODO: Группировка похожих уведомлений
- ✅ Автоматическое закрытие через заданное время
- ✅ Поддержка действий (кнопок)

---

## Компоненты по функциональным областям

### AI Chat (`components/aichat/`)

**Документация:** `components/aichat/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `ChatHeader` - заголовок чата
- `ChatHistory` - история чатов
- `ChatMessages` - список сообщений
- `ChatInput` - поле ввода сообщения
- `AnimatedAIInput` - анимированное поле ввода AI
- `FormattedText` - форматированный текст (Markdown-подобный)

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть UI
- ✅ **DRY**: FormattedText переиспользуется в других модулях
- ✅ **Open/Closed**: Компоненты настраиваются через props

**Связи:**
- Используется в: `/app/aichat/page.tsx`
- Переиспользуется: FormattedText используется в `/telegram/chats`

**Масштабируемость:**
- ⚠️ TODO: Пагинация истории сообщений
- ⚠️ TODO: Виртуализация для больших списков сообщений
- ⚠️ TODO: Debounce для поиска в истории

### Telegram (`components/telegram/`)

**Документация:** `components/telegram/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `RichTextInput` - поле ввода с визуальным форматированием

**Архитектурные принципы:**
- ✅ **Single Responsibility**: RichTextInput отвечает только за ввод форматированного текста
- ✅ **DRY**: Логика конвертации markdown централизована
- ✅ **Open/Closed**: Расширяется через props без модификации

**Связи:**
- Используется в: `/app/telegram/chats/page.tsx`
- Использует: FormattedText из aichat для отображения сообщений

**Масштабируемость:**
- ⚠️ TODO: Поддержка дополнительных форматов (код блоки, списки, заголовки)
- ⚠️ TODO: Поддержка вставки изображений
- ⚠️ TODO: История форматирования (Undo/Redo)
- ✅ Двусторонняя конвертация Markdown ↔ HTML
- ✅ Сохранение позиции курсора

### Vacancies (`components/vacancies/`)

**Документация:** `components/vacancies/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `VacanciesStats` - статистика по вакансиям
- `VacanciesSearchFilters` - поиск и фильтры
- `VacancyCard` - карточка вакансии (режим "Карточки")
- `VacancyListItem` - элемент списка вакансии (режим "Список")
- `AddVacancyModal` - модальное окно добавления вакансии
- `VacancyEditModal` - модальное окно редактирования/просмотра
- `VacancyDetailHeader` - заголовок детального просмотра
- `BasicInfoSection` - секция основной информации
- И другие секции и компоненты редактирования...

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть функциональности
- ✅ **Open/Closed**: Разные представления (Card/ListItem) через props
- ✅ **Liskov Substitution**: VacancyCard и VacancyListItem взаимозаменяемы
- ✅ **DRY**: Общий интерфейс Vacancy для всех компонентов

**Связи:**
- Используется в: `/app/vacancies/page.tsx`, `/app/vacancies/[id]/page.tsx`, `/app/vacancies/[id]/edit/page.tsx`
- Использует: Toast для уведомлений, Huntflow API для синхронизации

**Масштабируемость:**
- ⚠️ TODO: Пагинация списка вакансий
- ⚠️ TODO: Виртуализация для больших списков
- ⚠️ TODO: Debounce для поиска
- ✅ Два режима отображения (Карточки/Список)
- ✅ Многошаговая форма с 12 вкладками

### Wiki (`components/wiki/`)

**Документация:** `components/wiki/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `WikiHeader` - заголовок страницы списка вики
- `WikiFilters` - поиск и фильтры
- `WikiCategory` - категория страниц вики
- `WikiCard` - карточка страницы вики
- `WikiDetailHeader` - заголовок детального просмотра
- `WikiDetailContent` - содержимое страницы
- `WikiDetailSidebar` - боковая панель с содержанием
- `WikiEditForm` - форма редактирования/создания
- И другие...

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть вики
- ✅ **DRY**: Общие интерфейсы WikiPage, WikiPageData
- ✅ **Open/Closed**: Компоненты настраиваются через props

**Связи:**
- Используется в: `/app/wiki/page.tsx`, `/app/wiki/[id]/page.tsx`, `/app/wiki/[id]/edit/page.tsx`
- Использует: useRouter для навигации

**Масштабируемость:**
- ⚠️ TODO: Пагинация списка страниц
- ⚠️ TODO: Полнотекстовый поиск на сервере
- ⚠️ TODO: Кэширование страниц
- ✅ Структурированное содержимое (секции, подсекции)
- ✅ Навигация по секциям

### Workflow (`components/workflow/`)

**Документация:** `components/workflow/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `WorkflowHeader` - заголовок страницы workflow
- `WorkflowChat` - чат workflow (скрининг/интервью)
- `WorkflowSidebar` - боковая панель
- `SlotsPanel` - панель свободных слотов

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть workflow
- ✅ **DRY**: Общие интерфейсы для команд и данных
- ✅ **Open/Closed**: Команды расширяются через конфигурацию

**Связи:**
- Используется в: `/app/workflow/page.tsx`
- Использует: Huntflow API, Google Calendar для синхронизации слотов

**Масштабируемость:**
- ⚠️ TODO: Обработка команд на сервере
- ⚠️ TODO: Синхронизация слотов с Google Calendar
- ⚠️ TODO: Загрузка отчетов из API
- ✅ Чат-интерфейс для управления процессом
- ✅ Обработка команд через теги

### Requests (`components/requests/`)

**Документация:** `components/requests/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `RequestsStats` - статистика заявок
- `RequestsSearchFilters` - поиск и фильтры
- `RequestCard` - карточка заявки
- `RequestListItem` - элемент списка заявки
- `RequestsTable` - таблица заявок
- `RequestTableRow` - строка таблицы
- `RequestTableRowExpanded` - развернутая строка
- `CreateRequestModal` - модальное окно создания заявки

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свое представление
- ✅ **Liskov Substitution**: RequestCard, RequestListItem, RequestTableRow взаимозаменяемы
- ✅ **DRY**: Общий интерфейс Request для всех компонентов

**Связи:**
- Используется в: `/app/hiring-requests/page.tsx`
- Использует: Toast для уведомлений

**Масштабируемость:**
- ⚠️ TODO: Пагинация списка заявок
- ⚠️ TODO: Виртуализация для больших таблиц
- ⚠️ TODO: Группировка заявок на сервере
- ✅ Три режима отображения (Карточки/Список/Таблица)
- ✅ Группировка заявок по вакансиям

### Salary Ranges (`components/salary-ranges/`)

**Документация:** `components/salary-ranges/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `SalaryRangesStats` - статистика зарплатных вилок
- `SalaryRangesSearchFilters` - поиск и фильтры
- `SalaryRangeCard` - карточка зарплатной вилки
- `SalaryRangeListItem` - элемент списка
- `CreateSalaryRangeModal` - модальное окно создания
- `SalaryRangeDetailModal` - модальное окно детального просмотра/редактирования

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть
- ✅ **DRY**: Общий интерфейс SalaryRange
- ✅ **Open/Closed**: Разные представления через props

**Связи:**
- Используется в: `/app/vacancies/salary-ranges/page.tsx`
- Использует: Mock данные для валютных курсов и налогов

**Масштабируемость:**
- ⚠️ TODO: Загрузка валютных курсов из API
- ⚠️ TODO: Автоматическое обновление курсов
- ⚠️ TODO: Расчет налогов на сервере
- ✅ Автоматическая конвертация валют
- ✅ Расчет налогов

### Profile (`components/profile/`)

**Документация:** `components/profile/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `ProfileNavigation` - навигация по разделам профиля
- `ProfileInfo` - информация о профиле
- `ProfileEditForm` - форма редактирования профиля
- `UserCard` - карточка пользователя
- `IntegrationsPage` - страница интеграций
- `IntegrationSettingsModal` - модальное окно настроек интеграции
- `GoogleIntegration` - компонент интеграции Google
- `AccentColorSettings` - настройки акцентных цветов
- `QuickButtonsPage` - страница быстрых кнопок
- `QuickButtonModal` - модальное окно создания/редактирования быстрой кнопки

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть профиля
- ✅ **DRY**: Общие интерфейсы для интеграций и быстрых кнопок
- ✅ **Open/Closed**: Компоненты настраиваются через props

**Связи:**
- Используется в: `/app/account/profile/page.tsx`
- Использует: ThemeProvider для акцентных цветов, localStorage для синхронизации

**Масштабируемость:**
- ⚠️ TODO: Загрузка настроек из API
- ⚠️ TODO: Синхронизация с сервером
- ✅ Сохранение в localStorage
- ✅ Синхронизация между вкладками

### Finance (`components/finance/`)

**Документация:** `components/finance/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `GradesSection` - секция грейдов сотрудников
- `CurrencyRatesSection` - секция валютных курсов
- `TaxesSection` - секция налогов PLN

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая секция отвечает за свою область
- ✅ **DRY**: Общие интерфейсы Grade, CurrencyRate, PLNTax

**Связи:**
- Используется в: `/app/company-settings/finance/page.tsx`
- Использует: Mock данные для курсов и налогов

**Масштабируемость:**
- ⚠️ TODO: Загрузка грейдов из API
- ⚠️ TODO: Обновление курсов из NBRB API
- ⚠️ TODO: Расчет налогов на сервере
- ✅ Автоматический расчет налогов
- ✅ Форматирование дат и чисел

### Invites (`components/invites/`)

**Документация:** `components/invites/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `InvitesStats` - статистика инвайтов
- `CreateInviteModal` - модальное окно создания инвайта

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждый компонент отвечает за свою часть
- ✅ **DRY**: Общие интерфейсы для инвайтов

**Связи:**
- Используется в: `/app/invites/page.tsx`
- Использует: CSRF токен для безопасности

**Масштабируемость:**
- ⚠️ TODO: Загрузка статистики из API
- ⚠️ TODO: Создание инвайтов через API
- ✅ Парсинг комбинированного ввода (ссылка + дата-время)
- ✅ Валидация формата

### Company Settings (`components/company-settings/`)

**Документация:** `components/company-settings/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `GeneralSettings` - общие настройки
- `GradesSettings` - настройки грейдов
- `RecruitingCommandsSettings` - настройки команд рекрутинга
- `SLASettings` - настройки SLA
- `CandidateFieldsSettings` - настройки полей кандидатов
- `VacancyPromptSettings` - настройки промпта вакансий
- `ScorecardSettings` - настройки scorecard
- `EmployeeLifecycleSettings` - настройки жизненного цикла сотрудников
- И другие...

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая секция отвечает за свою область настроек
- ✅ **DRY**: Общие интерфейсы для настроек
- ✅ **Open/Closed**: Секции расширяются без модификации

**Связи:**
- Используется в: `/app/company-settings/*/page.tsx`
- Использует: Drag-and-drop для переупорядочивания

**Масштабируемость:**
- ⚠️ TODO: Сохранение настроек через API
- ⚠️ TODO: Загрузка настроек из API
- ✅ Drag-and-drop для переупорядочивания
- ✅ Валидация настроек

### Candidate Responses (`components/candidate-responses/`)

**Документация:** `components/candidate-responses/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `GeneralTemplatesTab` - вкладка общих шаблонов
- `GradeTemplatesTab` - вкладка шаблонов по грейдам
- `RejectionTemplateForm` - форма шаблона отказа
- `SlotsTab` - вкладка слотов

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая вкладка отвечает за свой тип шаблонов
- ✅ **DRY**: Общие интерфейсы для шаблонов

**Связи:**
- Используется в: `/app/candidate-responses/page.tsx`

**Масштабируемость:**
- ⚠️ TODO: Загрузка шаблонов из API
- ⚠️ TODO: Сохранение шаблонов через API
- ✅ Управление шаблонами по грейдам
- ✅ Управление слотами

### GlobalSearch (`components/GlobalSearch/`)

**Документация:** `components/GlobalSearch/COMPONENTS_DOCUMENTATION.md`

**Компоненты:**
- `GlobalSearch` - компонент глобального поиска

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за глобальный поиск
- ✅ **DRY**: Единая точка поиска для всего приложения

**Функциональность:**
- Глобальный поиск с автодополнением
- Предложения сущностей (кандидаты, вакансии, заявки)
- Предложения скоупов (все, кандидаты, вакансии)
- История поиска
- Популярные запросы
- Клавиатурная навигация
- Подсветка префиксов

**Связи:**
- Используется в: Header (на всех страницах)
- Использует: Горячие клавиши Cmd+S / Ctrl+S

**Масштабируемость:**
- ⚠️ TODO: Реализовать поиск через API
- ⚠️ TODO: Debounce для запросов
- ⚠️ TODO: Кэширование результатов поиска
- ✅ Автодополнение на клиенте
- ✅ История поиска в localStorage

---

## Страницы приложения

### Основные страницы

#### Главная страница
**Файл:** `app/page.tsx`  
**Документация:** `app/page/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за главную страницу
- ✅ **DRY**: Использует общие компоненты (AppLayout, Header, Sidebar)

**Функциональность:**
- Редирект на `/workflow` или отображение приветствия
- Использование AppLayout для структуры

#### Layout
**Файл:** `app/layout.tsx`  
**Документация:** `app/LAYOUT_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за обертку всех страниц
- ✅ **DRY**: Единая точка для глобальных провайдеров

**Функциональность:**
- Оборачивает все страницы ThemeProvider и ToastProvider
- Метаданные для SEO
- Глобальные стили

### Страницы аккаунта

#### Вход
**Файл:** `app/account/login/page.tsx`  
**Документация:** `app/account/login/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за аутентификацию
- ✅ **DRY**: Использует FloatingLabelInput для полей ввода

**Функциональность:**
- Форма входа (email, пароль)
- Валидация полей
- Обработка ошибок
- Переход на главную страницу после успешного входа

#### Профиль
**Файл:** `app/account/profile/page.tsx`  
**Документация:** `app/account/profile/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за профиль пользователя
- ✅ **DRY**: Использует компоненты из `components/profile/`

**Функциональность:**
- Просмотр и редактирование профиля
- Управление интеграциями
- Настройка быстрых кнопок
- Настройка акцентных цветов
- Сохранение в localStorage

**Связи:**
- Использует: ProfileNavigation, ProfileInfo, ProfileEditForm, IntegrationsPage, QuickButtonsPage, AccentColorSettings
- См. `components/profile/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

### Рабочие страницы

#### Workflow
**Файл:** `app/workflow/page.tsx`  
**Документация:** `app/workflow/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за workflow процесс
- ✅ **DRY**: Использует компоненты из `components/workflow/`

**Функциональность:**
- Управление процессом скрининга и интервью
- Чат-интерфейс для обработки команд
- Управление расписанием интервьюеров
- Отображение свободных слотов

**Связи:**
- Использует: WorkflowHeader, WorkflowChat, WorkflowSidebar, SlotsPanel
- См. `components/workflow/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### AI Chat
**Файл:** `app/aichat/page.tsx`  
**Документация:** `app/aichat/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за AI чат
- ✅ **DRY**: Использует компоненты из `components/aichat/`

**Функциональность:**
- Чат с AI ассистентом
- История чатов
- Форматирование сообщений (Markdown)
- Управление моделями AI

**Связи:**
- Использует: ChatHeader, ChatHistory, ChatMessages, ChatInput, AnimatedAIInput, FormattedText
- См. `components/aichat/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### Telegram
**Файл:** `app/telegram/page.tsx`, `app/telegram/chats/page.tsx`, `app/telegram/2fa/page.tsx`  
**Документация:** `app/telegram/PAGE_DOCUMENTATION.md`, `app/telegram/chats/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая страница отвечает за свою часть Telegram интеграции
- ✅ **DRY**: Использует RichTextInput для ввода сообщений

**Функциональность:**
- Вход в Telegram
- 2FA аутентификация
- Управление чатами
- Отправка сообщений с форматированием

**Связи:**
- Использует: RichTextInput, FormattedText
- См. `components/telegram/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### Vacancies
**Файл:** `app/vacancies/page.tsx`, `app/vacancies/[id]/page.tsx`, `app/vacancies/[id]/edit/page.tsx`  
**Документация:** `app/vacancies/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая страница отвечает за свою часть управления вакансиями
- ✅ **DRY**: Использует компоненты из `components/vacancies/`

**Функциональность:**
- Список вакансий (карточки/список)
- Детальный просмотр вакансии
- Редактирование вакансии
- Создание новой вакансии
- Фильтрация и поиск

**Связи:**
- Использует: VacanciesStats, VacanciesSearchFilters, VacancyCard, VacancyListItem, AddVacancyModal, VacancyEditModal
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### Wiki
**Файл:** `app/wiki/page.tsx`, `app/wiki/[id]/page.tsx`, `app/wiki/[id]/edit/page.tsx`  
**Документация:** `app/wiki/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая страница отвечает за свою часть вики
- ✅ **DRY**: Использует компоненты из `components/wiki/`

**Функциональность:**
- Список страниц вики
- Детальный просмотр страницы
- Редактирование страницы
- Создание новой страницы
- Фильтрация по тегам и категориям

**Связи:**
- Использует: WikiHeader, WikiFilters, WikiCategory, WikiCard, WikiDetailHeader, WikiDetailContent, WikiEditForm
- См. `components/wiki/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### Hiring Requests
**Файл:** `app/hiring-requests/page.tsx`, `app/hiring-requests/[id]/page.tsx`, `app/hiring-requests/[id]/edit/page.tsx`  
**Документация:** `app/hiring-requests/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Каждая страница отвечает за свою часть заявок
- ✅ **DRY**: Использует компоненты из `components/requests/`

**Функциональность:**
- Список заявок на найм (карточки/список/таблица)
- Детальный просмотр заявки
- Редактирование заявки
- Создание новой заявки
- Фильтрация и поиск

**Связи:**
- Использует: RequestsStats, RequestsSearchFilters, RequestCard, RequestListItem, RequestsTable, CreateRequestModal
- См. `components/requests/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

#### Salary Ranges
**Файл:** `app/vacancies/salary-ranges/page.tsx`, `app/vacancies/salary-ranges/[id]/page.tsx`  
**Документация:** `app/vacancies/salary-ranges/PAGE_DOCUMENTATION.md`

**Архитектурные принципы:**
- ✅ **Single Responsibility**: Отвечает только за зарплатные вилки
- ✅ **DRY**: Использует компоненты из `components/salary-ranges/`

**Функциональность:**
- Список зарплатных вилок
- Детальный просмотр зарплатной вилки
- Создание новой зарплатной вилки
- Автоматическая конвертация валют
- Расчет налогов

**Связи:**
- Использует: SalaryRangesStats, SalaryRangesSearchFilters, SalaryRangeCard, SalaryRangeListItem, CreateSalaryRangeModal, SalaryRangeDetailModal
- См. `components/salary-ranges/COMPONENTS_DOCUMENTATION.md` для деталей компонентов

---

## Архитектурные паттерны

### Паттерн Provider (Context API)

**Применение:**
- `ThemeProvider` - управление темой
- `ToastProvider` - управление уведомлениями
- `QuickButtonsContext` - управление быстрыми кнопками

**Преимущества:**
- Единая точка истины для данных
- Избежание prop drilling
- Централизованное управление состоянием

**Документация:**
- См. `components/COMPONENTS_DOCUMENTATION.md` для ThemeProvider и ToastProvider
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для ToastProvider
- См. `components/COMPONENTS_DOCUMENTATION.md` для QuickButtonsContext

### Паттерн Portal

**Применение:**
- `ToastProvider` - рендерит уведомления в body через Portal
- Обеспечивает отображение поверх модальных окон

**Документация:**
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для деталей

### Паттерн Compound Components

**Применение:**
- `VacancyCard` и `VacancyListItem` - разные представления одних данных
- `RequestCard`, `RequestListItem`, `RequestTableRow` - разные представления Request
- `SalaryRangeCard` и `SalaryRangeListItem` - разные представления SalaryRange

**Преимущества:**
- Гибкость в выборе представления
- Переиспользование логики
- Следование принципу Liskov Substitution

**Документация:**
- См. `components/vacancies/COMPONENTS_DOCUMENTATION.md`
- См. `components/requests/COMPONENTS_DOCUMENTATION.md`
- См. `components/salary-ranges/COMPONENTS_DOCUMENTATION.md`

### Паттерн Controlled Components

**Применение:**
- Все формы используют controlled components
- `FloatingLabelInput` - контролируемое поле ввода
- `RichTextInput` - контролируемый редактор текста

**Преимущества:**
- Полный контроль над состоянием
- Легкая валидация
- Предсказуемое поведение

**Документация:**
- См. `components/COMPONENTS_DOCUMENTATION.md` для FloatingLabelInput
- См. `components/telegram/COMPONENTS_DOCUMENTATION.md` для RichTextInput

### Паттерн Custom Hooks

**Применение:**
- `useToast` - управление уведомлениями
- `useTheme` - управление темой
- `useQuickButtons` - управление быстрыми кнопками

**Преимущества:**
- Переиспользование логики
- Изоляция side-эффектов
- Упрощение компонентов

**Документация:**
- См. `components/Toast/COMPONENTS_DOCUMENTATION.md` для useToast
- См. `components/COMPONENTS_DOCUMENTATION.md` для useTheme и useQuickButtons

---

## Интеграция с API

### Текущее состояние

**Моковые данные:**
- Большинство компонентов используют моковые данные
- Данные определены в компонентах или передаются через props
- TODO комментарии указывают на необходимость замены на API

**Готовность к интеграции:**
- ✅ Структура данных определена через TypeScript интерфейсы
- ✅ Компоненты готовы к замене моковых данных на API вызовы
- ✅ Обработка ошибок частично реализована
- ⚠️ TODO: Реализовать API клиенты для всех модулей

### План интеграции

#### Приоритет 1: Базовые данные
1. **Аутентификация**
   - POST `/api/auth/login/`
   - POST `/api/auth/logout/`
   - GET `/api/auth/user/`

2. **Пользователь**
   - GET `/api/user/profile/`
   - PUT `/api/user/profile/`
   - GET `/api/user/settings/`
   - PUT `/api/user/settings/`

3. **Тема и настройки**
   - GET `/api/user/theme/`
   - PUT `/api/user/theme/`
   - GET `/api/user/quick-buttons/`
   - PUT `/api/user/quick-buttons/`

#### Приоритет 2: Основные модули
1. **Вакансии**
   - GET `/api/vacancies/`
   - POST `/api/vacancies/`
   - GET `/api/vacancies/{id}/`
   - PUT `/api/vacancies/{id}/`
   - DELETE `/api/vacancies/{id}/`

2. **Заявки на найм**
   - GET `/api/hiring-requests/`
   - POST `/api/hiring-requests/`
   - GET `/api/hiring-requests/{id}/`
   - PUT `/api/hiring-requests/{id}/`

3. **Инвайты**
   - GET `/api/invites/`
   - POST `/api/invites/`
   - GET `/api/invites/{id}/`

#### Приоритет 3: Интеграции
1. **Telegram**
   - POST `/api/telegram/login/`
   - POST `/api/telegram/2fa/`
   - GET `/api/telegram/chats/`
   - POST `/api/telegram/send-message/`

2. **AI Chat**
   - POST `/api/aichat/message/`
   - GET `/api/aichat/history/`

3. **Workflow**
   - POST `/api/workflow/commands/`
   - GET `/api/workflow/slots/`
   - GET `/api/workflow/reports/`

### Рекомендации по реализации

1. **Использование React Query или SWR**
   - Кэширование запросов
   - Автоматическая инвалидация кэша
   - Оптимистичные обновления
   - Retry логика

2. **Обработка ошибок**
   - Централизованная обработка ошибок
   - Показ уведомлений через Toast
   - Retry для сетевых ошибок

3. **Оптимизация производительности**
   - Debounce для поиска
   - Пагинация для больших списков
   - Виртуализация для длинных списков
   - Lazy loading для изображений

---

## Руководство по разработке

### При добавлении нового функционала

1. **Проверка на дублирование:**
   - Есть ли уже похожий компонент/логика?
   - Можно ли переиспользовать существующий код?
   - Нужно ли создать общий компонент/утилиту?
   - **См. соответствующие COMPONENTS_DOCUMENTATION.md для поиска похожих компонентов**

2. **Следование SOLID:**
   - Компонент/функция имеет одну ответственность?
   - Можно ли расширить без модификации?
   - Зависимости инжектируются, а не создаются напрямую?
   - **См. ARCHITECTURE_PRINCIPLES.md для деталей SOLID**

3. **Учет масштабируемости:**
   - Как поведет себя при росте данных?
   - Нужна ли пагинация/виртуализация?
   - Как оптимизировать производительность?
   - **См. ARCHITECTURE_PRINCIPLES.md раздел "Масштабируемость данных"**

4. **Микросервисная архитектура:**
   - К какому микросервису относится функционал?
   - Как изолировать данные и логику?
   - Можно ли развернуть независимо?
   - **См. ARCHITECTURE_PRINCIPLES.md раздел "Микросервисная архитектура"**

5. **Документация:**
   - Создать PAGE_DOCUMENTATION.md для новой страницы
   - Создать COMPONENTS_DOCUMENTATION.md для новых компонентов
   - Обновить этот документ (MASTER_DOCUMENTATION.md)

### При рефакторинге

1. **Выявление дублирования:**
   - Поиск повторяющихся паттернов
   - Выделение общей логики
   - Создание переиспользуемых компонентов
   - **См. соответствующие COMPONENTS_DOCUMENTATION.md для поиска дублирования**

2. **Улучшение архитектуры:**
   - Применение SOLID принципов
   - Улучшение разделения ответственности
   - Оптимизация зависимостей
   - **См. ARCHITECTURE_PRINCIPLES.md для деталей**

3. **Оптимизация производительности:**
   - Добавление кэширования
   - Реализация пагинации/виртуализации
   - Оптимизация рендеринга
   - **См. ARCHITECTURE_PRINCIPLES.md раздел "Масштабируемость данных"**

### Чеклист для code review

#### SOLID принципы
- [ ] Компонент/класс имеет одну ответственность
- [ ] Функциональность расширяется без модификации
- [ ] Интерфейсы разделены по функциональности
- [ ] Зависимости инжектируются, а не создаются напрямую
- **См. ARCHITECTURE_PRINCIPLES.md раздел "SOLID принципы"**

#### DRY принцип
- [ ] Нет дублирования кода
- [ ] Общая логика вынесена в утилиты/хуки
- [ ] Компоненты переиспользуются
- [ ] Стили не дублируются
- **См. ARCHITECTURE_PRINCIPLES.md раздел "DRY принцип"**

#### Масштабируемость
- [ ] Учтена возможность роста данных
- [ ] Реализована пагинация для больших списков (если необходимо)
- [ ] Оптимизированы запросы к API
- [ ] Добавлено кэширование где необходимо
- **См. ARCHITECTURE_PRINCIPLES.md раздел "Масштабируемость данных"**

#### Микросервисная архитектура
- [ ] Функционал изолирован по доменам
- [ ] API клиенты организованы по микросервисам
- [ ] Нет жестких зависимостей между модулями
- **См. ARCHITECTURE_PRINCIPLES.md раздел "Микросервисная архитектура"**

#### Документация
- [ ] Создана/обновлена PAGE_DOCUMENTATION.md для страницы
- [ ] Создана/обновлена COMPONENTS_DOCUMENTATION.md для компонентов
- [ ] Добавлены комментарии в код
- [ ] Обновлен этот документ (MASTER_DOCUMENTATION.md)

---

## Индекс документации

### Документация компонентов

**Корневая директория:**
- `components/COMPONENTS_DOCUMENTATION.md` - базовые компоненты (AppLayout, Header, Sidebar, FloatingActions, ThemeProvider, ToastProvider и т.д.)

**По функциональным областям:**
- `components/aichat/COMPONENTS_DOCUMENTATION.md` - компоненты AI чата
- `components/telegram/COMPONENTS_DOCUMENTATION.md` - компоненты Telegram
- `components/vacancies/COMPONENTS_DOCUMENTATION.md` - компоненты вакансий
- `components/wiki/COMPONENTS_DOCUMENTATION.md` - компоненты вики
- `components/workflow/COMPONENTS_DOCUMENTATION.md` - компоненты workflow
- `components/requests/COMPONENTS_DOCUMENTATION.md` - компоненты заявок
- `components/salary-ranges/COMPONENTS_DOCUMENTATION.md` - компоненты зарплатных вилок
- `components/profile/COMPONENTS_DOCUMENTATION.md` - компоненты профиля
- `components/finance/COMPONENTS_DOCUMENTATION.md` - компоненты финансов
- `components/invites/COMPONENTS_DOCUMENTATION.md` - компоненты инвайтов
- `components/company-settings/COMPONENTS_DOCUMENTATION.md` - компоненты настроек компании
- `components/candidate-responses/COMPONENTS_DOCUMENTATION.md` - компоненты ответов кандидатам
- `components/GlobalSearch/COMPONENTS_DOCUMENTATION.md` - компонент глобального поиска
- `components/Toast/COMPONENTS_DOCUMENTATION.md` - компоненты уведомлений

### Документация страниц

**Основные страницы:**
- `app/LAYOUT_DOCUMENTATION.md` - корневой layout
- `app/page/PAGE_DOCUMENTATION.md` - главная страница
- `app/account/login/PAGE_DOCUMENTATION.md` - вход
- `app/account/forgot-password/PAGE_DOCUMENTATION.md` - восстановление пароля
- `app/account/reset-password/PAGE_DOCUMENTATION.md` - сброс пароля
- `app/account/profile/PAGE_DOCUMENTATION.md` - профиль
- `app/search/PAGE_DOCUMENTATION.md` - поиск

**Рабочие страницы:**
- `app/workflow/PAGE_DOCUMENTATION.md` - workflow
- `app/recr-chat/PAGE_DOCUMENTATION.md` - чат рекрутера
- `app/aichat/PAGE_DOCUMENTATION.md` - AI чат
- `app/calendar/PAGE_DOCUMENTATION.md` - календарь
- `app/wiki/PAGE_DOCUMENTATION.md` - вики (список)
- `app/wiki/[id]/PAGE_DOCUMENTATION.md` - вики (детальный просмотр)
- `app/wiki/[id]/edit/PAGE_DOCUMENTATION.md` - вики (редактирование)

**Управление данными:**
- `app/vacancies/PAGE_DOCUMENTATION.md` - вакансии (список)
- `app/vacancies/[id]/PAGE_DOCUMENTATION.md` - вакансии (детальный просмотр)
- `app/vacancies/[id]/edit/PAGE_DOCUMENTATION.md` - вакансии (редактирование)
- `app/vacancies/salary-ranges/PAGE_DOCUMENTATION.md` - зарплатные вилки
- `app/hiring-requests/PAGE_DOCUMENTATION.md` - заявки на найм
- `app/invites/PAGE_DOCUMENTATION.md` - инвайты
- `app/interviewers/PAGE_DOCUMENTATION.md` - интервьюеры
- `app/candidate-responses/PAGE_DOCUMENTATION.md` - ответы кандидатам
- `app/finance/benchmarks/PAGE_DOCUMENTATION.md` - бенчмарки

**Интеграции:**
- `app/telegram/PAGE_DOCUMENTATION.md` - Telegram (вход)
- `app/telegram/2fa/PAGE_DOCUMENTATION.md` - Telegram (2FA)
- `app/telegram/chats/PAGE_DOCUMENTATION.md` - Telegram (чаты)
- `app/huntflow/PAGE_DOCUMENTATION.md` - Huntflow
- И другие...

**Настройки:**
- `app/company-settings/*/PAGE_DOCUMENTATION.md` - различные страницы настроек компании
- И другие...

**Отчетность:**
- `app/reporting/PAGE_DOCUMENTATION.md` - отчетность (главная)
- `app/reporting/hiring-plan/PAGE_DOCUMENTATION.md` - план найма
- И другие...

**Ошибки:**
- `app/errors/PAGE_DOCUMENTATION.md` - общая страница ошибок
- `app/errors/401/PAGE_DOCUMENTATION.md` - ошибка 401
- `app/errors/404/PAGE_DOCUMENTATION.md` - ошибка 404
- И другие...

**Полный список:** См. `app/DOCUMENTATION_INDEX.md` и `app/SUMMARY.md`

---

## Связи между компонентами

### Иерархия компонентов

```
app/layout.tsx
├── ThemeProvider
│   └── ToastProvider
│       └── AppLayout (на каждой странице)
│           ├── Header
│           │   └── GlobalSearch
│           ├── Sidebar
│           ├── StatusBar (только на /recr-chat)
│           ├── FloatingActions
│           └── children (контент страницы)
```

### Переиспользование компонентов

**FormattedText:**
- Используется в: `/app/aichat/page.tsx`, `/app/telegram/chats/page.tsx`
- Документация: `components/aichat/COMPONENTS_DOCUMENTATION.md`

**RichTextInput:**
- Используется в: `/app/telegram/chats/page.tsx`
- Документация: `components/telegram/COMPONENTS_DOCUMENTATION.md`

**ToastProvider:**
- Используется в: `/app/layout.tsx` (все страницы)
- Используется через: `useToast()` во всех компонентах
- Документация: `components/Toast/COMPONENTS_DOCUMENTATION.md`

**ThemeProvider:**
- Используется в: `/app/layout.tsx` (все страницы)
- Используется через: `useTheme()` во всех компонентах
- Документация: `components/COMPONENTS_DOCUMENTATION.md`

**AppLayout:**
- Используется на: всех страницах приложения
- Документация: `components/COMPONENTS_DOCUMENTATION.md`

**GlobalSearch:**
- Используется в: Header (на всех страницах)
- Документация: `components/GlobalSearch/COMPONENTS_DOCUMENTATION.md`

### Зависимости между модулями

**Telegram → AI Chat:**
- `FormattedText` из aichat используется в telegram/chats для отображения сообщений

**Vacancies → Salary Ranges:**
- Страница зарплатных вилок находится в `/app/vacancies/salary-ranges/`
- Использует компоненты из `components/salary-ranges/`

**Profile → Theme:**
- `AccentColorSettings` использует `ThemeProvider` для управления акцентными цветами

**Profile → QuickButtons:**
- `QuickButtonsPage` использует `QuickButtonsContext` для управления быстрыми кнопками
- `FloatingActions` использует те же данные через контекст

---

## Масштабируемость данных

### Текущее состояние

**Реализовано:**
- ✅ Фильтрация списков (готово к пагинации)
- ✅ Нормализация данных (каждая сущность имеет уникальный ID)
- ✅ Оптимистичные обновления (частично в отправке сообщений)
- ✅ Lazy loading (Next.js автоматически поддерживает code splitting)

**TODO:**
- ⚠️ Пагинация для больших списков
- ⚠️ Виртуализация для длинных списков
- ⚠️ Кэширование ответов API
- ⚠️ Debounce для поиска
- ⚠️ Полнотекстовый поиск на сервере

**Документация:**
- См. `ARCHITECTURE_PRINCIPLES.md` раздел "Масштабируемость данных" для деталей

### Рекомендации по масштабированию

1. **Для списков:**
   - Использовать React Window или React Virtual для виртуализации
   - Реализовать пагинацию через API
   - Добавить infinite scroll где необходимо

2. **Для поиска:**
   - Добавить debounce (300-500ms)
   - Перенести поиск на сервер
   - Добавить индексацию для быстрого поиска

3. **Для кэширования:**
   - Использовать React Query или SWR
   - Кэшировать часто используемые данные
   - Реализовать стратегию инвалидации кэша

4. **Для производительности:**
   - Оптимизировать рендеринг через useMemo и useCallback
   - Использовать React.memo для компонентов
   - Оптимизировать изображения (lazy loading, WebP)

---

## Заключение

Эта документация объединяет все аспекты frontend приложения HR Helper:
- Архитектурные принципы (SOLID, DRY, микросервисная архитектура)
- Структуру проекта и организацию кода
- Документацию всех компонентов (15 директорий)
- Документацию всех страниц (54 страницы)
- Связи между компонентами и модулями
- План интеграции с API
- Руководство по разработке

**Для получения детальной информации:**
- О компонентах: см. соответствующие `COMPONENTS_DOCUMENTATION.md`
- О страницах: см. соответствующие `PAGE_DOCUMENTATION.md`
- Об архитектуре: см. `ARCHITECTURE_PRINCIPLES.md`
- Об общем обзоре: см. `COMPONENTS_AND_PAGES_DOCUMENTATION.md`

**Версия документа:** 2.0.0  
**Последнее обновление:** 2026-01-27  
**Покрытие:** 100%
