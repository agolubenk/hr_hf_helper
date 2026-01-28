# Документация страницы: Настройки компании (company-settings/)

## Общее описание

Раздел настроек компании - это комплексная система управления всеми параметрами и конфигурациями компании в HR Helper. Включает общие настройки, управление пользователями, грейдами, финансами, интеграциями, настройками рекрутинга и другими аспектами работы системы.

**Базовый путь**: `/company-settings`

## Структура раздела

Раздел настроек компании организован в виде иерархической структуры страниц:

```
/company-settings/                    # Главная страница (общие настройки)
├── /org-structure                    # Оргструктура
├── /grades                          # Грейды
├── /employee-lifecycle              # Жизненный цикл сотрудников
├── /finance                         # Финансы
├── /integrations                    # Интеграции
├── /user-groups                     # Группы пользователей
├── /users                           # Пользователи
└── /recruiting                      # Настройки рекрутинга
    ├── /rules                       # Правила привлечения
    ├── /stages                      # Этапы найма и причины отказа
    ├── /commands                    # Команды workflow
    ├── /offer-template              # Шаблон оффера
    └── (связанные страницы)
        ├── /candidate-fields        # Дополнительные поля кандидатов
        ├── /scorecard               # Scorecard
        ├── /sla                     # SLA
        └── /vacancy-prompt          # Единый промпт для вакансий
```

## Главная страница (page.tsx)

### Назначение
Главная страница настроек компании. Отображает общие настройки компании, включая логотип, офисы, календарь и базовые параметры.

**Путь**: `/company-settings`

### Компоненты страницы

#### 1. CompanySettingsPage
- **Расположение**: `@/app/company-settings/page.tsx`
- **Назначение**: Главный компонент страницы настроек компании
- **Функциональность**: 
  - Отображает заголовок "Общие настройки"
  - Рендерит компонент GeneralSettings с формой настроек
  - Использует data-tour="company-settings-page" для приветственного тура
- **Связи**: 
  - AppLayout: оборачивает страницу в общий layout
  - GeneralSettings: компонент с формой общих настроек

#### 2. GeneralSettings
- **Расположение**: `@/components/company-settings/GeneralSettings.tsx`
- **Назначение**: Компонент общих настроек компании
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Форма редактирования общих настроек компании
  - Логотип компании (загрузка и отображение)
  - Офисы и локации (добавление, редактирование, удаление)
  - Календарь (рабочие дни, праздники)
  - Базовые параметры компании (название, описание и т.д.)
- **Связи**: 
  - API: сохранение настроек через API (TODO)
  - После сохранения обновляет данные компании

### Состояние компонента

#### CompanySettingsPage
- **State переменные**: Нет (все состояние управляется внутри `GeneralSettings`)

#### GeneralSettings
- **State переменные**:
  - `companyName`: название компании
  - `calendarLink`: ссылка на календарь
  - `logo`: URL логотипа или null
  - `offices`: массив офисов компании
  - `editingOfficeId`: ID редактируемого офиса (null если не редактируется)
  - `isAddingOffice`: флаг добавления нового офиса
  - `newOffice`: данные нового офиса для формы

### Интерфейсы

#### Office
```typescript
interface Office {
  id: number                    // Уникальный идентификатор офиса
  address: string              // Адрес офиса
  mapLink: string              // Ссылка на карту
  country: string              // Страна
  directions: string           // Инструкции по проезду
  isMain: boolean              // Флаг главного офиса
}
```

## Подстраницы настроек компании

### 1. Оргструктура (`/org-structure`)
- **Путь**: `/company-settings/org-structure`
- **Назначение**: Управление организационной структурой компании
- **Компонент**: `@/app/company-settings/org-structure/page.tsx`
- **Функциональность**: 
  - Отображение иерархии подразделений
  - Управление департаментами и отделами
  - Назначение руководителей
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 2. Грейды (`/grades`)
- **Путь**: `/company-settings/grades`
- **Назначение**: Управление грейдами и уровнями сотрудников компании
- **Компонент**: `@/app/company-settings/grades/page.tsx`
- **Компонент настроек**: `@/components/company-settings/GradesSettings.tsx`
- **Функциональность**: 
  - Список грейдов компании
  - Создание нового грейда
  - Редактирование существующего грейда
  - Удаление грейда
  - Управление уровнями и порядком грейдов
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 3. Жизненный цикл сотрудников (`/employee-lifecycle`)
- **Путь**: `/company-settings/employee-lifecycle`
- **Назначение**: Настройка этапов жизненного цикла сотрудников
- **Компонент**: `@/app/company-settings/employee-lifecycle/page.tsx`
- **Компонент настроек**: `@/components/company-settings/EmployeeLifecycleSettings.tsx`
- **Функциональность**: 
  - Управление этапами жизненного цикла (прием, адаптация, развитие, увольнение)
  - Настройка автоматических действий на каждом этапе
  - Управление триггерами и уведомлениями
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 4. Финансы (`/finance`)
- **Путь**: `/company-settings/finance`
- **Назначение**: Финансовые настройки компании
- **Компонент**: `@/app/company-settings/finance/page.tsx`
- **Функциональность**: 
  - Управление бюджетами на найм
  - Настройка зарплатных вилок по грейдам
  - Управление финансовыми метриками
  - Настройка бонусов и компенсаций
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 5. Интеграции (`/integrations`)
- **Путь**: `/company-settings/integrations`
- **Назначение**: Управление интеграциями с внешними сервисами
- **Компонент**: `@/app/company-settings/integrations/page.tsx`
- **Компонент модального окна**: `@/app/company-settings/integrations/IntegrationScopeModal.tsx`
- **Функциональность**: 
  - Список доступных интеграций (Google, Telegram, hh.ru, Huntflow, AI сервисы, ClickUp, Notion, n8n)
  - Включение/выключение интеграций
  - Настройка интеграций
  - Выбор области действия (общий/индивидуальный/оба)
  - Группировка интеграций по категориям (ИИ, Вход, Мессенджеры, Job-сайты, HRM&ATS, Task Tracker's)
- **Группы интеграций**:
  - `all`: Все интеграции
  - `ai`: ИИ (Gemini, OpenAI, Cloud AI, n8n)
  - `auth`: Вход (Google)
  - `messengers`: Мессенджеры (Telegram)
  - `job-sites`: Job-сайты (hh.ru / rabota.by)
  - `hrm-ats`: HRM&ATS (Huntflow)
  - `task-trackers`: Task Tracker's (ClickUp, Notion)
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 6. Группы пользователей (`/user-groups`)
- **Путь**: `/company-settings/user-groups`
- **Назначение**: Управление группами пользователей и правами доступа
- **Компонент**: `@/app/company-settings/user-groups/page.tsx`
- **Компонент модального окна**: `@/components/company-settings/GroupAccessModal.tsx`
- **Функциональность**: 
  - Создание и управление группами пользователей
  - Настройка прав доступа для групп
  - Привязка пользователей к группам
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### 7. Пользователи (`/users`)
- **Путь**: `/company-settings/users`
- **Назначение**: Управление пользователями системы
- **Компонент**: `@/app/company-settings/users/page.tsx`
- **Компонент модального окна**: `@/components/company-settings/UserAccessModal.tsx`
- **Функциональность**: 
  - Список всех пользователей компании
  - Поиск пользователей по email, имени, фамилии, должности
  - Форма добавления нового пользователя
  - Форма редактирования пользователя (inline)
  - Управление группами пользователя
  - Управление правами доступа через UserAccessModal
  - Активация/деактивация пользователей
  - Отображение информации о последнем входе
  - Удаление пользователей с подтверждением
- **Интерфейс User**:
  ```typescript
  interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    position: string
    groups: string[]
    is_active: boolean
    last_login: string | null
    created_at: string
    access?: AccessRights
  }
  ```
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

## Настройки рекрутинга (`/recruiting`)

### Общее описание
Подраздел настроек рекрутинга содержит все настройки, связанные с процессом найма и управления кандидатами.

### Подстраницы

#### 1. Правила привлечения (`/recruiting/rules`)
- **Путь**: `/company-settings/recruiting/rules`
- **Назначение**: Настройка правил привлечения кандидатов
- **Компонент**: `@/app/company-settings/recruiting/rules/page.tsx`
- **Функциональность**: 
  - Управление правилами привлечения кандидатов
  - Настройка источников найма
  - Правила распределения кандидатов
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 2. Этапы найма и причины отказа (`/recruiting/stages`)
- **Путь**: `/company-settings/recruiting/stages`
- **Назначение**: Управление этапами найма и причинами отказа
- **Компонент**: `@/app/company-settings/recruiting/stages/page.tsx`
- **Компонент настроек**: `@/components/company-settings/RecruitingStagesSettings.tsx`
- **Функциональность**: 
  - Создание и редактирование этапов найма
  - Управление причинами отказа на каждом этапе
  - Настройка порядка этапов
  - Привязка этапов к вакансиям
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 3. Команды workflow (`/recruiting/commands`)
- **Путь**: `/company-settings/recruiting/commands`
- **Назначение**: Управление командами для workflow чата
- **Компонент**: `@/app/company-settings/recruiting/commands/page.tsx`
- **Компонент настроек**: `@/components/company-settings/RecruitingCommandsSettings.tsx`
- **Функциональность**: 
  - Создание и редактирование команд для workflow
  - Привязка команд к этапам найма и действиям
  - Настройка цветов и описаний команд
  - Управление порядком команд
  - Фиксированные команды `/add` и `/del` (не настраиваются)
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 4. Шаблон оффера (`/recruiting/offer-template`)
- **Путь**: `/company-settings/recruiting/offer-template`
- **Назначение**: Управление шаблоном оффера (предложения о работе)
- **Компонент**: `@/app/company-settings/recruiting/offer-template/page.tsx`
- **Функциональность**: 
  - Создание и редактирование шаблона оффера
  - Использование переменных в шаблоне
  - Предпросмотр оффера
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

### Связанные страницы (не в поддиректории `/recruiting`)

#### 1. Дополнительные поля кандидатов (`/candidate-fields`)
- **Путь**: `/company-settings/candidate-fields`
- **Назначение**: Управление дополнительными полями для кандидатов
- **Компонент**: `@/app/company-settings/candidate-fields/page.tsx`
- **Компонент настроек**: `@/components/company-settings/CandidateFieldsSettings.tsx`
- **Функциональность**: 
  - Создание и редактирование дополнительных полей
  - Настройка типов полей (текст, число, дата, выбор и т.д.)
  - Управление обязательностью полей
  - Привязка полей к вакансиям или грейдам
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 2. Scorecard (`/scorecard`)
- **Путь**: `/company-settings/scorecard`
- **Назначение**: Управление шаблонами Scorecard для оценки кандидатов
- **Компонент**: `@/app/company-settings/scorecard/page.tsx`
- **Компонент настроек**: `@/components/company-settings/ScorecardSettings.tsx`
- **Функциональность**: 
  - Создание и редактирование шаблонов Scorecard
  - Настройка критериев оценки и вопросов
  - Привязка шаблонов к вакансиям/грейдам
  - Управление весами критериев
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 3. SLA (`/sla`)
- **Путь**: `/company-settings/sla`
- **Назначение**: Управление SLA (Service Level Agreement) для процесса найма
- **Компонент**: `@/app/company-settings/sla/page.tsx`
- **Компонент настроек**: `@/components/company-settings/SLASettings.tsx`
- **Компонент модального окна**: `@/components/company-settings/SLAEditModal.tsx`
- **Функциональность**: 
  - Создание и редактирование SLA правил
  - Настройка временных рамок для этапов найма
  - Управление эскалациями при нарушении SLA
  - Привязка SLA к вакансиям или грейдам
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

#### 4. Единый промпт для вакансий (`/vacancy-prompt`)
- **Путь**: `/company-settings/vacancy-prompt`
- **Назначение**: Управление единым промптом для генерации описаний вакансий
- **Компонент**: `@/app/company-settings/vacancy-prompt/page.tsx`
- **Компонент настроек**: `@/components/company-settings/VacancyPromptSettings.tsx`
- **Функциональность**: 
  - Создание и редактирование промпта для вакансий
  - Использование переменных в промпте
  - Предпросмотр результата генерации
- **Документация**: `PAGE_DOCUMENTATION.md` в директории

## Навигация

### Sidebar
Все страницы настроек компании доступны через боковое меню (Sidebar) в разделе "Настройки компании":

```typescript
{
  id: 'company-settings',
  label: 'Настройки компании',
  href: '/company-settings',
  children: [
    { id: 'company-settings-general', label: 'Общие', href: '/company-settings' },
    { id: 'company-settings-org-structure', label: 'Оргструктура', href: '/company-settings/org-structure' },
    { id: 'company-settings-grades', label: 'Грейды', href: '/company-settings/grades' },
    { id: 'company-settings-lifecycle', label: 'Жизненный цикл сотрудников', href: '/company-settings/employee-lifecycle' },
    { id: 'company-settings-finance', label: 'Финансы', href: '/company-settings/finance' },
    { id: 'company-settings-integrations', label: 'Интеграции', href: '/company-settings/integrations' },
    { id: 'company-settings-user-groups', label: 'Группы пользователей', href: '/company-settings/user-groups' },
    { id: 'company-settings-users', label: 'Пользователи', href: '/company-settings/users' },
    {
      id: 'recruiting-settings',
      label: 'Настройки рекрутинга',
      href: '/company-settings/recruiting',
      children: [
        { id: 'recruiting-settings-rules', label: 'Правила привлечения', href: '/company-settings/recruiting/rules' },
        { id: 'recruiting-settings-stages', label: 'Этапы найма и причины отказа', href: '/company-settings/recruiting/stages' },
        { id: 'recruiting-settings-commands', label: 'Команды workflow', href: '/company-settings/recruiting/commands' },
        { id: 'recruiting-settings-candidate-fields', label: 'Дополнительные поля кандидатов', href: '/company-settings/candidate-fields' },
        { id: 'recruiting-settings-scorecard', label: 'Scorecard', href: '/company-settings/scorecard' },
        { id: 'recruiting-settings-sla', label: 'SLA', href: '/company-settings/sla' },
        { id: 'recruiting-settings-vacancy-prompt', label: 'Единый промпт для вакансий', href: '/company-settings/vacancy-prompt' },
        { id: 'recruiting-settings-offer-template', label: 'Шаблон оффера', href: '/company-settings/recruiting/offer-template' },
        { id: 'recruiting-settings-candidate-responses', label: 'Ответы кандидатам', href: '/candidate-responses' },
      ],
    },
  ],
}
```

### Определение активности
В Sidebar используется функция `isItemOrChildrenActive` для определения активной страницы:

```typescript
// 'company-settings' активен на всех страницах настроек компании
if (item.id === 'company-settings' && pathname.startsWith('/company-settings')) {
  return true
}
```

## Общие компоненты

### Компоненты настроек
Все компоненты настроек расположены в `@/components/company-settings/`:

- `GeneralSettings.tsx` - общие настройки компании
- `GradesSettings.tsx` - настройки грейдов
- `GradeForm.tsx` - форма создания/редактирования грейда
- `EmployeeLifecycleSettings.tsx` - настройки жизненного цикла сотрудников
- `RecruitingStagesSettings.tsx` - настройки этапов найма
- `RecruitingCommandsSettings.tsx` - настройки команд workflow
- `CandidateFieldsSettings.tsx` - настройки дополнительных полей кандидатов
- `ScorecardSettings.tsx` - настройки Scorecard
- `SLASettings.tsx` - настройки SLA
- `SLAEditModal.tsx` - модальное окно редактирования SLA
- `VacancyPromptSettings.tsx` - настройки промпта для вакансий
- `UserAccessModal.tsx` - модальное окно управления правами доступа пользователя
- `GroupAccessModal.tsx` - модальное окно управления правами доступа группы

### Модальные окна
- `IntegrationScopeModal.tsx` - выбор области действия интеграции (общий/индивидуальный/оба)
- `UserAccessModal.tsx` - управление правами доступа пользователя
- `GroupAccessModal.tsx` - управление правами доступа группы
- `SLAEditModal.tsx` - редактирование SLA правила

## Структура данных

### Настройки компании (GeneralSettings)
- **Логотип**: URL или файл изображения
- **Офисы**: массив объектов Office
- **Календарь**: 
  - Рабочие дни недели
  - Праздничные дни
- **Базовые параметры**:
  - Название компании
  - Описание
  - Контактная информация
  - Ссылка на календарь

### Грейды
- **Структура**: массив объектов Grade
- **Поля**: id, name, level, order

### Пользователи
- **Структура**: массив объектов User
- **Поля**: id, email, first_name, last_name, position, groups, is_active, last_login, created_at, access

### Интеграции
- **Структура**: массив объектов Integration
- **Поля**: id, name, shortName, active, href, group, allowsScopeChoice

## TODO: Интеграция с API

### Общие настройки
1. ❌ Загрузка текущих настроек компании - реализовать API вызов
2. ❌ Сохранение логотипа - реализовать загрузку файла через API
3. ❌ Управление офисами - реализовать CRUD операции через API
4. ❌ Управление календарем - реализовать сохранение через API
5. ❌ Сохранение базовых параметров - реализовать через API

### Грейды
1. ❌ Загрузка списка грейдов - GET `/api/company-settings/grades/`
2. ❌ Создание грейда - POST `/api/company-settings/grades/`
3. ❌ Редактирование грейда - PUT `/api/company-settings/grades/{id}/`
4. ❌ Удаление грейда - DELETE `/api/company-settings/grades/{id}/`

### Пользователи
1. ❌ Загрузка списка пользователей - GET `/api/company-settings/users/`
2. ❌ Создание пользователя - POST `/api/company-settings/users/`
3. ❌ Редактирование пользователя - PUT `/api/company-settings/users/{id}/`
4. ❌ Удаление пользователя - DELETE `/api/company-settings/users/{id}/`
5. ❌ Управление правами доступа - PUT `/api/company-settings/users/{id}/access/`

### Интеграции
1. ❌ Загрузка списка интеграций - GET `/api/company-settings/integrations/`
2. ❌ Включение/выключение интеграции - PUT `/api/company-settings/integrations/{id}/active/`
3. ❌ Настройка области действия - PUT `/api/company-settings/integrations/{id}/scope/`
4. ❌ Подключение интеграции - POST `/api/company-settings/integrations/{id}/connect/`

### Настройки рекрутинга
1. ❌ Загрузка этапов найма - GET `/api/company-settings/recruiting/stages/`
2. ❌ Создание/редактирование этапа - POST/PUT `/api/company-settings/recruiting/stages/`
3. ❌ Загрузка команд workflow - GET `/api/company-settings/recruiting/commands/`
4. ❌ Создание/редактирование команды - POST/PUT `/api/company-settings/recruiting/commands/`
5. ❌ Загрузка SLA правил - GET `/api/company-settings/sla/`
6. ❌ Создание/редактирование SLA - POST/PUT `/api/company-settings/sla/`
7. ❌ Загрузка дополнительных полей - GET `/api/company-settings/candidate-fields/`
8. ❌ Создание/редактирование поля - POST/PUT `/api/company-settings/candidate-fields/`

## Стили

### company-settings.module.css
- **Файл**: `@/app/company-settings/company-settings.module.css`
- **Основной контейнер**: `.container`
  - `padding: 0 24px`
  - `max-width: 1200px`
  - `margin: 0 auto`

### Модульные стили компонентов
Каждый компонент настроек имеет свой CSS модуль:
- `GeneralSettings.module.css`
- `GradesSettings.module.css`
- `EmployeeLifecycleSettings.module.css`
- `RecruitingStagesSettings.module.css`
- `RecruitingCommandsSettings.module.css`
- `CandidateFieldsSettings.module.css`
- `ScorecardSettings.module.css`
- `SLASettings.module.css`
- `SLAEditModal.module.css`
- `VacancyPromptSettings.module.css`

## Связи с другими страницами

### Внутренние связи
- Все подстраницы настроек связаны через Sidebar
- Некоторые страницы используют данные из других (например, грейды используются в шаблонах ответов кандидатам)

### Внешние связи
- `/workflow` - использует команды workflow, этапы найма, SLA
- `/recr-chat` - использует шаблоны ответов, этапы найма
- `/invites` - использует этапы найма, шаблоны офферов
- `/vacancies` - использует грейды, дополнительные поля, Scorecard
- `/candidate-responses` - использует грейды для привязки шаблонов
- `/calendar` - использует настройки календаря из общих настроек

## Особенности

### Единая структура страниц
Все страницы настроек следуют единой структуре:
1. Заголовок страницы (Text size="6" weight="bold")
2. Компонент настроек (специфичный для каждой страницы)
3. Обертка в AppLayout с соответствующим pageTitle

### Использование модальных окон
Многие страницы используют модальные окна для:
- Редактирования записей (SLA, интеграции)
- Управления правами доступа (пользователи, группы)
- Выбора параметров (область действия интеграций)

### Inline редактирование
Некоторые страницы поддерживают inline редактирование:
- Пользователи: редактирование прямо в таблице
- Грейды: редактирование в списке

### Подтверждение удаления
Все операции удаления требуют подтверждения через toast с кнопками "Отмена" и "Удалить".

### Поиск и фильтрация
Многие страницы поддерживают поиск:
- Пользователи: поиск по email, имени, фамилии, должности
- Интеграции: фильтрация по группам

## Безопасность

- Валидация данных на клиенте (обязательные поля, форматы)
- TODO: Валидация данных на сервере
- TODO: Проверка прав доступа к настройкам (только администраторы могут изменять)
- TODO: Защита от XSS в пользовательском вводе (санитизация HTML)
- TODO: Rate limiting для операций создания/редактирования

## Производительность

- Локальное состояние для управления данными (для моковых данных)
- TODO: Оптимизация загрузки данных (пагинация при большом количестве)
- TODO: Кэширование настроек для быстрого доступа
- TODO: Виртуализация списков (для больших списков пользователей, грейдов и т.д.)
- TODO: Debounce для поиска (если реализован)

## Приветственный тур

Главная страница настроек компании (`/company-settings`) использует атрибут `data-tour="company-settings-page"` для интеграции с приветственным туром. Это позволяет выделить раздел настроек компании в туре для новых пользователей.
