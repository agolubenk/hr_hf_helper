# Документация компонентов: profile

## Общее описание

Директория `components/profile` содержит компоненты для управления профилем пользователя. Компоненты обеспечивают просмотр и редактирование информации профиля, настройку интеграций, управление быстрыми кнопками и настройку акцентного цвета.

**Расположение**: `@/components/profile`

## Файлы документации

### Индивидуальная документация компонентов

Каждый компонент имеет свой файл `COMPONENT_NAME.DOCUMENTATION.md` с подробным описанием:
- `ProfileEditForm.DOCUMENTATION.md` - подробная документация формы редактирования профиля
- `IntegrationsPage.DOCUMENTATION.md` - подробная документация страницы интеграций и API
- `QuickButtonsPage.DOCUMENTATION.md` - подробная документация страницы управления быстрыми кнопками
- `AccentColorSettings.DOCUMENTATION.md` - подробная документация компонента настройки акцентного цвета

### Содержание файлов документации

Каждый файл документации содержит:
- Общее описание компонента
- Описание функциональности
- Описание состояния и hooks
- Описание всех функций и обработчиков
- Описание интерфейсов и типов
- Описание особенностей и логики
- TODO для интеграции с API
- Описание стилей
- Связи с другими компонентами

## Компоненты

### 1. ProfileNavigation
- **Файл**: `ProfileNavigation.tsx`
- **Назначение**: Компонент навигации по разделам профиля
- **Пропсы**:
  - `activeTab`: активная вкладка ('profile' | 'edit' | 'integrations' | 'quick-buttons')
  - `onTabChange`: обработчик изменения вкладки ((tab: TabType) => void)
- **Функциональность**: 
  - Отображение меню навигации с вкладками
  - Выделение активной вкладки
  - Иконки для каждой вкладки
- **Вкладки**:
  - `profile`: Профиль (PersonIcon)
  - `edit`: Редактировать (Pencil1Icon)
  - `integrations`: Интеграции и API (LightningBoltIcon)
  - `quick-buttons`: Быстрые кнопки (LightningBoltIcon)
- **Особенности**: 
  - Кликабельные элементы меню
  - Визуальное выделение активной вкладки
- **Используется в**: 
  - `/app/account/profile/page.tsx`: навигация по разделам профиля

### 2. ProfileInfo
- **Файл**: `ProfileInfo.tsx`
- **Назначение**: Компонент отображения информации о профиле пользователя
- **Пропсы**:
  - `userData`: данные пользователя (объект с полями профиля)
- **Функциональность**: 
  - Отображение информации о пользователе в двух колонках
  - Поля: фамилия, имя, email, Telegram, LinkedIn
  - Поля: дата регистрации, дата последнего входа, рабочий график, время между встречами, активная среда
  - Иконки для некоторых полей
- **Интерфейс userData**:
  - `firstName`: имя (string)
  - `lastName`: фамилия (string)
  - `email`: email (string)
  - `telegram`: Telegram username (string, опционально)
  - `linkedin`: LinkedIn профиль (string, опционально)
  - `registrationDate`: дата регистрации (string)
  - `lastLoginDate`: дата последнего входа (string)
  - `workSchedule`: рабочий график (string)
  - `meetingInterval`: время между встречами (string)
  - `activeEnvironment`: активная среда (string)
- **Особенности**: 
  - Двухколоночная сетка (Grid columns="2")
  - Компонент InfoRow для отображения строк информации
  - Специальный Badge для активной среды
  - SVG иконка LinkedIn (кастомная)
- **Используется в**: 
  - `/app/account/profile/page.tsx`: вкладка "Профиль"

### 3. ProfileEditForm
- **Файл**: `ProfileEditForm.tsx`
- **Назначение**: Форма редактирования профиля пользователя
- **Пропсы**:
  - `initialData`: начальные данные профиля (объект с полями)
  - `onCancel`: обработчик отмены (() => void)
  - `onSave`: обработчик сохранения ((data: ProfileEditFormProps['initialData']) => void)
- **Функциональность**: 
  - Поля формы:
    - Имя (TextField, disabled)
    - Фамилия (TextField, disabled)
    - Email (TextField, disabled)
    - Telegram (TextField с префиксом @)
    - LinkedIn (TextField)
    - Время начала работы (TextField, type="time")
    - Время окончания работы (TextField, type="time")
    - Интервал между встречами (TextField)
  - Использует FloatingLabelInput для полей
  - Кастомная реализация полей Telegram и LinkedIn
- **Интерфейс initialData**:
  - `firstName`: имя (string)
  - `lastName`: фамилия (string)
  - `email`: email (string)
  - `telegram`: Telegram username (string, опционально)
  - `linkedin`: LinkedIn профиль (string, опционально)
  - `workStartTime`: время начала работы (string, опционально)
  - `workEndTime`: время окончания работы (string, опционально)
  - `meetingInterval`: интервал между встречами (string, опционально)
- **Особенности**: 
  - Имя, фамилия и email отключены (disabled)
  - Кастомная реализация полей Telegram и LinkedIn с анимацией label
  - SVG иконка LinkedIn (кастомная)
  - Кнопка "Назад" для возврата к просмотру
- **Используется в**: 
  - `/app/account/profile/page.tsx`: вкладка "Редактировать"

### 4. UserCard
- **Файл**: `UserCard.tsx`
- **Назначение**: Карточка пользователя с аватаром и основной информацией
- **Пропсы**:
  - `firstName`: имя пользователя (string)
  - `lastName`: фамилия пользователя (string)
  - `email`: email пользователя (string)
  - `telegram`: Telegram username (string, опционально)
  - `avatarUrl`: URL аватара (string, опционально)
- **Функциональность**: 
  - Отображение аватара (изображение или инициалы)
  - Отображение имени и фамилии
  - Отображение email с иконкой
  - Отображение Telegram с иконкой (если указан)
- **Особенности**: 
  - Генерация инициалов из имени и фамилии
  - Placeholder аватар с инициалами, если нет avatarUrl
- **Используется в**: 
  - `/app/account/profile/page.tsx`: отображается в различных разделах профиля

### 5. IntegrationsPage
- **Файл**: `IntegrationsPage.tsx`
- **Назначение**: Компонент страницы интеграций и API
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение сетки интеграций (3 колонки)
  - Карточки интеграций с логотипами и статусами
  - Кнопка настройки для каждой интеграции
  - Отображение статуса интеграции (настроен/не настроен)
  - Модальное окно настроек интеграции
- **Поддерживаемые интеграции**:
  - Gemini AI
  - Huntflow (с поддержкой песочницы и продакшн)
  - ClickUp
  - Notion
  - Telegram
  - Google
  - hh.ru / rabota.by
  - OpenAI
  - Cloud AI
  - n8n
- **Особенности**: 
  - Использует IntegrationSettingsModal для настройки
  - Специальная обработка Huntflow (локальные настройки пользователя)
  - Информационная секция с инструкцией
- **Используется в**: 
  - `/app/account/profile/page.tsx`: вкладка "Интеграции и API"

### 6. IntegrationSettingsModal
- **Файл**: `IntegrationSettingsModal.tsx`
- **Назначение**: Модальное окно настройки интеграции
- **Пропсы**:
  - `integrationName`: название интеграции (string)
  - `isOpen`: флаг открытости (boolean)
  - `onClose`: обработчик закрытия (() => void)
  - `onSave`: обработчик сохранения ((data: any) => void)
  - `initialActiveSystem`: начальная активная система для Huntflow ('prod' | 'sandbox', опционально)
- **Функциональность**: 
  - Настройка API ключей и токенов для различных интеграций
  - Показ/скрытие паролей (иконки EyeOpenIcon/EyeClosedIcon)
  - Тестирование подключения
  - Инструкции по настройке для каждого сервиса
  - Раскрывающаяся секция инструкций (для мобильных)
- **Специальная обработка Huntflow**:
  - Источник ключей: мои / компании / выключено
  - Активная система: песочница / продакшн
  - Настройки для песочницы: URL, API ключ
  - Настройки для продакшн: URL, Access Token, Refresh Token
  - Кнопка обновления токена
  - Кнопка теста подключения
  - Локальное сохранение настроек пользователя (localStorage)
- **Особенности**: 
  - Разные поля для разных интеграций
  - Подробные инструкции по настройке для каждого сервиса
  - Адаптивный дизайн (раскрывающаяся секция инструкций на мобильных)
  - Поддержка темной темы
- **Используется в**: 
  - IntegrationsPage: для настройки каждой интеграции

### 7. IntegrationSettingsForm
- **Файл**: `IntegrationSettingsForm.tsx`
- **Назначение**: Форма настроек интеграции (используется в IntegrationSettingsModal)
- **Пропсы**: (определяются в IntegrationSettingsModal)
- **Функциональность**: 
  - Рендеринг полей формы в зависимости от типа интеграции
  - Управление видимостью паролей
  - Тестирование подключения
- **Используется в**: 
  - IntegrationSettingsModal: для отображения полей формы

### 8. GoogleIntegration
- **Файл**: `GoogleIntegration.tsx`
- **Назначение**: Компонент отображения статуса Google интеграции
- **Пропсы**:
  - `isConnected`: подключен ли Google (boolean)
  - `tokenStatus`: статус токена (string)
  - `email`: email Google аккаунта (string)
  - `name`: имя пользователя (string)
- **Функциональность**: 
  - Отображение статуса подключения Google API
  - Отображение статуса токена
  - Отображение email и имени
  - Кнопка переподключения Google
- **Особенности**: 
  - Кастомная SVG иконка для переподключения (ReloadIcon)
  - Большой логотип Google
- **Используется в**: 
  - `/app/account/profile/page.tsx`: может использоваться в разделе интеграций

### 9. AccentColorSettings
- **Файл**: `AccentColorSettings.tsx`
- **Назначение**: Компонент настройки акцентного цвета для светлой и темной темы
- **Пропсы**:
  - `lightThemeColor`: акцентный цвет для светлой темы (AccentColorValue)
  - `darkThemeColor`: акцентный цвет для темной темы (AccentColorValue)
  - `onLightThemeColorChange`: обработчик изменения цвета светлой темы ((color: AccentColorValue) => void)
  - `onDarkThemeColorChange`: обработчик изменения цвета темной темы ((color: AccentColorValue) => void)
- **Функциональность**: 
  - Выбор акцентного цвета для светлой темы
  - Выбор акцентного цвета для темной темы
  - Превью цветов в выпадающем списке
  - 21 доступный цвет из Radix UI
- **Доступные цвета** (ACCENT_COLORS):
  - blue, tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, cyan, teal, jade, green, grass, lime, yellow, amber, orange, brown
- **Особенности**: 
  - Цветовые превью в Select
  - Двухколоночная сетка для светлой и темной темы
  - Экспорт списка цветов для использования в других компонентах
- **Используется в**: 
  - `/app/account/profile/page.tsx`: настройка акцентного цвета

### 10. QuickButtonsPage
- **Файл**: `QuickButtonsPage.tsx`
- **Назначение**: Компонент управления быстрыми кнопками
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение списка быстрых кнопок в таблице
  - Создание новой быстрой кнопки
  - Редактирование существующей кнопки
  - Удаление кнопки
  - Изменение порядка кнопок (перемещение вверх/вниз)
  - Переключение активности кнопки
  - Управление настройками быстрых кнопок (включение/отключение)
- **Интерфейс QuickButton**:
  - `id`: уникальный идентификатор (string)
  - `name`: название кнопки (string)
  - `icon`: имя иконки (string)
  - `customIcon`: кастомная иконка (string, опционально)
  - `type`: тип кнопки ('link' | 'text' | 'datetime')
  - `value`: значение кнопки (string)
  - `color`: цвет кнопки (string, hex)
  - `order`: порядок отображения (number)
  - `isActive`: активна ли кнопка (boolean)
- **Типы кнопок**:
  - `link`: ссылка (открывается в новой вкладке)
  - `text`: текст (вставляется в поле ввода)
  - `datetime`: дата-время (вставляется текущая дата-время)
- **Особенности**: 
  - Использует QuickButtonModal для создания/редактирования
  - Кнопки перемещения вверх/вниз
  - Переключение активности через Switch
  - Настройки: включение/отключение быстрых кнопок, кнопки прокрутки вверх, кнопки настроек
  - Сохранение настроек в localStorage
- **Используется в**: 
  - `/app/account/profile/page.tsx`: вкладка "Быстрые кнопки"

### 11. QuickButtonModal
- **Файл**: `QuickButtonModal.tsx`
- **Назначение**: Модальное окно создания/редактирования быстрой кнопки
- **Пропсы**:
  - `isOpen`: флаг открытости (boolean)
  - `onClose`: обработчик закрытия (() => void)
  - `onSave`: обработчик сохранения ((data: QuickButtonData) => void)
  - `initialData`: начальные данные кнопки (QuickButtonData | null, опционально)
- **Функциональность**: 
  - Поля формы:
    - Название кнопки (TextField)
    - Иконка (Select с предустановленными иконками или кастомная)
    - Тип кнопки (Select: link, text, datetime)
    - Значение (TextField или TextArea в зависимости от типа)
    - Цвет (ColorPicker или Select)
  - Выбор иконки из предустановленных (более 60 иконок)
  - Кастомная иконка (эмодзи или текст)
  - Превью кнопки в реальном времени
- **Интерфейс QuickButtonData**:
  - `id`: уникальный идентификатор (string, опционально)
  - `name`: название кнопки (string)
  - `icon`: имя иконки (string)
  - `customIcon`: кастомная иконка (string, опционально)
  - `type`: тип кнопки ('link' | 'text' | 'datetime')
  - `value`: значение кнопки (string)
  - `color`: цвет кнопки (string, hex)
  - `order`: порядок отображения (number)
- **Предустановленные иконки** (PRESET_ICONS):
  - Более 60 иконок из @radix-ui/react-icons
  - Категории: навигация, действия, форматирование, социальные сети, и т.д.
- **Особенности**: 
  - Превью кнопки в реальном времени
  - Выбор цвета через ColorPicker или Select
  - Валидация полей
  - Поддержка кастомных иконок (эмодзи)
- **Используется в**: 
  - QuickButtonsPage: для создания/редактирования кнопок

## Интерфейсы и типы

### ProfileNavigationProps
```typescript
interface ProfileNavigationProps {
  activeTab: TabType     // 'profile' | 'edit' | 'integrations' | 'quick-buttons'
  onTabChange: (tab: TabType) => void
}
```

### TabType
```typescript
type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'
```

### ProfileInfoProps
```typescript
interface ProfileInfoProps {
  userData: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    registrationDate: string
    lastLoginDate: string
    workSchedule: string
    meetingInterval: string
    activeEnvironment: string
  }
}
```

### ProfileEditFormProps
```typescript
interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    workStartTime?: string
    workEndTime?: string
    meetingInterval?: string
  }
  onCancel: () => void
  onSave: (data: ProfileEditFormProps['initialData']) => void
}
```

### UserCardProps
```typescript
interface UserCardProps {
  firstName: string
  lastName: string
  email: string
  telegram?: string
  avatarUrl?: string
}
```

### GoogleIntegrationProps
```typescript
interface GoogleIntegrationProps {
  isConnected: boolean
  tokenStatus: string
  email: string
  name: string
}
```

### IntegrationSettingsModalProps
```typescript
interface IntegrationSettingsModalProps {
  integrationName: string
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialActiveSystem?: 'prod' | 'sandbox'
}
```

### SettingsData (в IntegrationSettingsModal)
```typescript
interface SettingsData {
  apiKey?: string
  integrationToken?: string
  credentialSource?: HuntflowCredentialSource  // 'mine' | 'company' | 'disabled'
  sandboxUrl?: string
  sandboxApiKey?: string
  prodUrl?: string
  activeSystem?: 'prod' | 'sandbox'
  accessToken?: string
  refreshToken?: string
  username?: string
  oauthConnected?: boolean
  tokenValid?: boolean
}
```

### AccentColorSettingsProps
```typescript
interface AccentColorSettingsProps {
  lightThemeColor: AccentColorValue
  darkThemeColor: AccentColorValue
  onLightThemeColorChange: (color: AccentColorValue) => void
  onDarkThemeColorChange: (color: AccentColorValue) => void
}
```

### AccentColorValue
```typescript
type AccentColorValue = typeof ACCENT_COLORS[number]['value']
// 'blue' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris' | 'indigo' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime' | 'yellow' | 'amber' | 'orange' | 'brown'
```

### QuickButtonData (QuickButtonModal)
```typescript
interface QuickButtonData {
  id?: string
  name: string
  icon: string
  customIcon?: string
  type: 'link' | 'text' | 'datetime'
  value: string
  color: string
  order: number
}
```

## Функции и обработчики

### ProfileEditForm

#### handleChange
- **Назначение**: Обработка изменения полей формы
- **Параметры**: `field: keyof typeof formData`
- **Возвращает**: обработчик события изменения
- **Логика**: Обновляет formData при изменении поля

#### handleSubmit
- **Назначение**: Обработка отправки формы
- **Параметры**: `e: React.FormEvent`
- **Логика**: 
  - Предотвращает стандартную отправку формы
  - Вызывает onSave с данными формы

### IntegrationSettingsModal

#### getInitialActiveSystem
- **Назначение**: Получение начальной активной системы для Huntflow
- **Возвращает**: 'prod' | 'sandbox'
- **Логика**: 
  1. Проверяет initialActiveSystem
  2. Проверяет локальные настройки пользователя (getHuntflowUserSettings)
  3. Проверяет старое значение в localStorage ('huntflowActiveSystem')
  4. По умолчанию возвращает 'prod'

#### handleTest
- **Назначение**: Тестирование подключения/валидности ключа
- **Параметры**: `field: string`
- **Логика**: 
  - Устанавливает testStatus[field] в true
  - TODO: Реализовать реальное тестирование
  - Через 2 секунды устанавливает в false

#### handleSaveClick
- **Назначение**: Сохранение настроек интеграции
- **Логика**: 
  - Для Huntflow: сохраняет настройки локально (saveHuntflowUserSettings)
  - Вызывает onSave с настройками
  - Закрывает модальное окно

#### handleToggleVisibility
- **Назначение**: Переключение видимости пароля/токена
- **Параметры**: `e: React.MouseEvent`, `currentState: boolean`, `setter: (value: boolean) => void`
- **Логика**: 
  - Предотвращает всплытие события
  - Инвертирует состояние видимости

#### renderInstructions
- **Назначение**: Рендеринг инструкций по настройке для каждого сервиса
- **Возвращает**: JSX с инструкциями
- **Логика**: 
  - Switch по integrationName
  - Для каждого сервиса: ссылки, пошаговые инструкции, примечания
  - Поддерживаемые сервисы: Gemini AI, Huntflow, ClickUp, Notion, Telegram, Google, и др.

#### renderSettings
- **Назначение**: Рендеринг полей формы настроек для каждого сервиса
- **Возвращает**: JSX с полями формы
- **Логика**: 
  - Switch по integrationName
  - Разные поля для разных интеграций
  - Специальная обработка Huntflow (множество полей)

### QuickButtonsPage

#### handleAdd, handleEdit, handleDelete
- **Логика**: Управление быстрыми кнопками (аналогично другим компонентам управления списками)

#### handleMoveUp, handleMoveDown
- **Назначение**: Изменение порядка кнопок
- **Логика**: Перемещает кнопку вверх/вниз и обновляет order

#### handleToggleActive
- **Назначение**: Переключение активности кнопки
- **Логика**: Инвертирует isActive

#### handleSettingsChange
- **Назначение**: Изменение настроек быстрых кнопок
- **Логика**: 
  - Обновляет настройки
  - Сохраняет в localStorage

## Константы

### ACCENT_COLORS (AccentColorSettings)
```typescript
const ACCENT_COLORS = [
  { value: 'blue', label: 'Синий' },
  { value: 'tomato', label: 'Томатный' },
  // ... и т.д. (21 цвет)
]
```

### COLOR_PREVIEWS (AccentColorSettings)
```typescript
const COLOR_PREVIEWS: Record<string, string> = {
  blue: '#3e63dd',
  tomato: '#f23d3d',
  // ... и т.д. (hex коды для превью)
}
```

### PRESET_ICONS (QuickButtonModal)
```typescript
const PRESET_ICONS = [
  { value: 'Link2Icon', label: 'Ссылка', icon: Link2Icon },
  { value: 'HomeIcon', label: 'Дом', icon: HomeIcon },
  // ... и т.д. (более 60 иконок)
]
```

## Стили

### ProfileNavigation.module.css
- `.navigation`: контейнер навигации
- `.menuItem`: элемент меню
- `.active`: активный элемент меню

### ProfileInfo.module.css
- `.profileInfoBlock`: контейнер блока информации
- `.header`: заголовок
- `.content`: содержимое
- `.grid`: сетка двух колонок
- `.infoRow`: строка информации
- `.environmentRow`: строка активной среды
- `.environmentBadge`: бейдж активной среды

### ProfileEditForm.module.css
- `.editBlock`: контейнер блока редактирования
- `.header`: заголовок
- `.form`: форма
- `.content`: содержимое
- `.grid`: сетка двух колонок

### UserCard.module.css
- `.userCard`: карточка пользователя
- `.avatarContainer`: контейнер аватара
- `.avatar`: аватар (изображение)
- `.avatarPlaceholder`: placeholder аватара (инициалы)
- `.userName`: имя пользователя
- `.emailRow`: строка email
- `.telegramRow`: строка Telegram

### IntegrationsPage.module.css
- `.integrationsBlock`: контейнер блока интеграций
- `.header`: заголовок
- `.content`: содержимое
- `.grid`: сетка интеграций (3 колонки)
- `.integrationCard`: карточка интеграции
- `.cardHeader`: заголовок карточки
- `.cardContent`: содержимое карточки
- `.gearButton`: кнопка настроек
- `.logoContainer`: контейнер логотипа

### IntegrationSettingsModal.module.css
- `.modalOverlay`: оверлей модального окна
- `.modal`: модальное окно
- `.modalHeader`: заголовок модального окна
- `.modalContentWrapper`: обертка содержимого
- `.settingsContent`: содержимое настроек
- `.instructionsWrapper`: обертка инструкций
- `.instructions`: инструкции
- `.instructionsToggle`: кнопка разворачивания инструкций
- `.instructionsCollapsed`: свернутые инструкции
- `.instructionsExpanded`: развернутые инструкции
- `.modalFooter`: футер модального окна

### GoogleIntegration.module.css
- `.integrationBlock`: контейнер блока интеграции
- `.header`: заголовок
- `.content`: содержимое
- `.googleIcon`: иконка Google
- `.googleLogo`: логотип Google

### AccentColorSettings.module.css
- `.accentColorBlock`: контейнер блока настроек цвета
- `.header`: заголовок
- `.content`: содержимое
- `.grid`: сетка двух колонок
- `.colorPreview`: превью цвета

### QuickButtonsPage.module.css
- Стили для таблицы кнопок, кнопок перемещения, настроек

### QuickButtonModal.module.css
- Стили для модального окна, формы, превью кнопки

## Использование

### Пример использования ProfileNavigation:
```tsx
<ProfileNavigation 
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Пример использования ProfileInfo:
```tsx
<ProfileInfo userData={userData} />
```

### Пример использования ProfileEditForm:
```tsx
<ProfileEditForm 
  initialData={userData}
  onCancel={() => setActiveTab('profile')}
  onSave={(data) => {
    // Сохранение данных профиля
  }}
/>
```

### Пример использования UserCard:
```tsx
<UserCard 
  firstName="Иван"
  lastName="Иванов"
  email="ivan@example.com"
  telegram="ivan_ivanov"
  avatarUrl="/avatars/ivan.jpg"
/>
```

### Пример использования IntegrationsPage:
```tsx
<IntegrationsPage />
```

### Пример использования AccentColorSettings:
```tsx
<AccentColorSettings 
  lightThemeColor={lightColor}
  darkThemeColor={darkColor}
  onLightThemeColorChange={setLightColor}
  onDarkThemeColorChange={setDarkColor}
/>
```

### Пример использования QuickButtonsPage:
```tsx
<QuickButtonsPage />
```

## TODO: Интеграция с API

1. ❌ Загрузка данных профиля из API
   - GET `/api/user/profile/`
   - Возвращает: данные профиля пользователя

2. ❌ Сохранение данных профиля через API
   - PUT/PATCH `/api/user/profile/`
   - Параметры: все поля профиля

3. ❌ Загрузка статуса интеграций из API
   - GET `/api/user/integrations/status/`
   - Возвращает: статус всех интеграций

4. ❌ Сохранение настроек интеграций через API
   - PUT `/api/user/integrations/{integrationName}/`
   - Параметры: API ключи, токены, настройки

5. ❌ Тестирование подключения интеграций
   - POST `/api/user/integrations/{integrationName}/test/`
   - Параметры: API ключ/токен
   - Возвращает: результат теста

6. ❌ Загрузка быстрых кнопок из API
   - GET `/api/user/quick-buttons/`
   - Возвращает: массив быстрых кнопок

7. ❌ Сохранение быстрых кнопок через API
   - POST `/api/user/quick-buttons/` - создание
   - PUT/PATCH `/api/user/quick-buttons/{id}/` - обновление
   - DELETE `/api/user/quick-buttons/{id}/` - удаление

8. ❌ Сохранение настроек акцентного цвета
   - PUT `/api/user/settings/accent-color/`
   - Параметры: lightThemeColor, darkThemeColor

9. ❌ Загрузка аватара пользователя
   - GET `/api/user/avatar/`
   - Возвращает: URL аватара

10. ❌ Загрузка аватара на сервер
    - POST `/api/user/avatar/upload/`
    - Параметры: файл изображения

## Связи с другими компонентами

- Используется в `/app/account/profile/page.tsx` - основная страница профиля
- Использует `useToast` из `@/components/Toast/ToastContext` для уведомлений
- Использует `useTheme` из `@/components/ThemeProvider` для темы
- Использует `FloatingLabelInput` из `@/components/FloatingLabelInput` для полей формы
- Использует `getHuntflowUserSettings`, `saveHuntflowUserSettings` из `@/lib/huntflowUserSettings` для локальных настроек Huntflow
- QuickButtonsPage связан с `FloatingActions` через localStorage ключи
