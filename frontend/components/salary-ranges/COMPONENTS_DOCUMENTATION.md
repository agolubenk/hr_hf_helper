# Документация компонентов: salary-ranges

## Общее описание

Директория `components/salary-ranges` содержит компоненты для управления зарплатными вилками (salary ranges). Компоненты обеспечивают отображение статистики, поиск и фильтрацию, отображение вилок в разных режимах (карточки, список), создание новых вилок, детальное отображение и редактирование.

**Расположение**: `@/components/salary-ranges`

## Компоненты

### 1. SalaryRangesStats
- **Файл**: `SalaryRangesStats.tsx`
- **Назначение**: Компонент статистики по зарплатным вилкам
- **Пропсы**:
  - `total`: общее количество зарплатных вилок (number)
  - `active`: количество активных вилок (number)
  - `inactive`: количество неактивных вилок (number)
  - `activeTab`: активная вкладка фильтра ('active' | 'inactive' | 'all')
  - `onTabChange`: обработчик изменения активной вкладки ((tab: 'active' | 'inactive' | 'all') => void)
  - `onListViewClick`: обработчик клика на иконку списка (() => void, опционально)
- **Функциональность**: 
  - Отображение общего количества вилок
  - Иконка списка: переключение режима отображения (если передана onListViewClick)
  - SegmentedControl: фильтрация по статусу (Активных, Неактивных, Все)
  - Адаптивный текст: разные тексты для десктопа и мобильных
- **Особенности**: 
  - Адаптивные тексты для мобильных устройств (сокращенные версии: "Акт.", "Неакт.")
  - SVG иконка списка для переключения режима отображения
  - Иконка галочки для активных вилок
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: используется на странице управления зарплатными вилками

### 2. SalaryRangesSearchFilters
- **Файл**: `SalaryRangesSearchFilters.tsx`
- **Назначение**: Компонент поиска и фильтров для зарплатных вилок
- **Пропсы**:
  - `searchQuery`: текущий поисковый запрос (string)
  - `onSearchChange`: обработчик изменения поискового запроса ((value: string) => void)
  - `selectedVacancy`: выбранная вакансия (string, 'all' - все вакансии)
  - `onVacancyChange`: обработчик изменения выбранной вакансии ((value: string) => void)
  - `selectedGrade`: выбранный грейд (string, 'all' - все грейды)
  - `onGradeChange`: обработчик изменения выбранного грейда ((value: string) => void)
  - `onReset`: обработчик сброса всех фильтров (() => void)
- **Функциональность**: 
  - Поле поиска: поиск по вакансии, грейду, ID или значению зарплаты
  - Фильтр по вакансии: выбор вакансии из списка (или "Все вакансии")
  - Фильтр по грейду: выбор грейда из списка (или "Все грейды")
  - Кнопка "Поиск": выполнение поиска с применением фильтров (TODO: реализовать функциональность)
  - Кнопка "Сбросить": сброс всех фильтров и поискового запроса
- **Особенности**: 
  - Иконка поиска в поле ввода
  - Адаптивная верстка (wrap="wrap" для мобильных)
  - TODO: Загружать список вакансий из API
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: используется на странице управления зарплатными вилками

### 3. SalaryRangeCard
- **Файл**: `SalaryRangeCard.tsx`
- **Назначение**: Компонент карточки зарплатной вилки (режим "Карточки")
- **Пропсы**:
  - `salaryRange`: данные зарплатной вилки для отображения (SalaryRange)
  - `onClick`: обработчик клика на карточку (() => void, опционально)
  - `onToggleActive`: обработчик переключения активности вилки ((id: number) => void, опционально)
- **Функциональность**: 
  - Заголовок карточки: название вакансии и грейд (на цветном фоне)
  - Детали: зарплатные вилки в разных валютах (USD, BYN, PLN, EUR)
  - Дата обновления
  - Кнопка активации/деактивации вилки
- **Особенности**: 
  - Карточка с цветным заголовком (teal фон)
  - Белый фон для деталей
  - Форматирование чисел через Intl.NumberFormat
  - Визуальная индикация статуса (активна/неактивна) через иконку кнопки
  - USD и BYN отображаются как net (чистая зарплата)
  - PLN и EUR отображаются как gross (грязная зарплата)
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: используется в режиме отображения "Карточки"

### 4. SalaryRangeListItem
- **Файл**: `SalaryRangeListItem.tsx`
- **Назначение**: Компонент элемента списка зарплатной вилки (режим "Список")
- **Пропсы**:
  - `salaryRange`: данные зарплатной вилки для отображения (SalaryRange)
  - `onClick`: обработчик клика на элемент списка (() => void, опционально)
  - `onToggleActive`: обработчик переключения активности вилки ((id: number) => void, опционально)
- **Функциональность**: 
  - Название вакансии, статус, грейд и дата в первой строке
  - Зарплатные вилки в разных валютах во второй строке
  - Кнопка активации/деактивации вилки
  - Адаптивная верстка: разные layout для десктопа и мобильных
- **Особенности**: 
  - Десктопная версия: горизонтальное расположение информации
  - Мобильная версия: вертикальное расположение информации
  - CSS классы desktopLayout и mobileLayout управляют видимостью версий
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: используется в режиме отображения "Список"

### 5. CreateSalaryRangeModal
- **Файл**: `CreateSalaryRangeModal.tsx`
- **Назначение**: Модальное окно создания зарплатной вилки
- **Пропсы**:
  - `open`: флаг открытости модального окна (boolean)
  - `onOpenChange`: обработчик изменения открытости ((open: boolean) => void)
  - `onSave`: обработчик успешного сохранения ((data: {...}) => void, опционально)
- **Функциональность**: 
  - Выбор вакансии и грейда
  - Ввод зарплатной вилки в USD (min, max)
  - Автоматический расчет других валют (BYN, PLN, EUR) на основе USD
  - Валидация обязательных полей
  - Валидация значений зарплаты (минимум не может быть больше максимума)
- **Моковые данные**:
  - `mockCurrencyRates`: курсы валют (USD, PLN, EUR)
  - `mockTaxRate`: ставка налога (25%)
  - `mockVacancies`: список вакансий
  - `mockGrades`: список грейдов
- **Особенности**: 
  - Автоматический расчет других валют на основе USD
  - Формула расчета:
    - BYN (net) = USD * курс USD
    - PLN (gross): USD -> BYN -> PLN (net) -> PLN (gross) = PLN net / (1 - налог)
    - EUR (gross): аналогично PLN
  - Только USD редактируемое, остальные валюты только для отображения
  - Информационное сообщение о курсах валют
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: открывается при клике на "Создать вилку"

### 6. SalaryRangeDetailModal
- **Файл**: `SalaryRangeDetailModal.tsx`
- **Назначение**: Модальное окно детального просмотра и редактирования зарплатной вилки
- **Пропсы**:
  - `open`: флаг открытости модального окна (boolean)
  - `onOpenChange`: обработчик изменения открытости ((open: boolean) => void)
  - `salaryRange`: данные зарплатной вилки для отображения (SalaryRangeForDetail | null)
  - `onToggleActive`: обработчик переключения активности вилки ((id: number) => void, опционально)
  - `onSave`: обработчик сохранения изменений ((id: number, data: {...}) => void, опционально)
  - `onDelete`: обработчик удаления вилки ((id: number) => void, опционально)
- **Функциональность**: 
  - Режим просмотра: отображение всех данных вилки
  - Режим редактирования: редактирование вакансии, грейда и зарплатной вилки в USD
  - Автоматический расчет других валют при редактировании USD
  - Кнопка активации/деактивации вилки (в режиме просмотра)
  - Кнопка редактирования (в режиме просмотра)
  - Кнопка удаления (в режиме редактирования)
  - Валидация значений зарплаты
- **Особенности**: 
  - Два режима: просмотр и редактирование
  - Переключение режимов через кнопку "Редактировать"
  - Автоматический расчет других валют при изменении USD
  - Подтверждение удаления через Toast
  - Отображение даты обновления и ID вакансии в режиме просмотра
- **Используется в**: 
  - `/app/vacancies/salary-ranges/page.tsx`: открывается при клике на вилку

## Интерфейсы и типы

### SalaryRange
```typescript
interface SalaryRange {
  id: number                                    // Уникальный идентификатор вилки
  vacancyId: number                             // ID вакансии в Huntflow
  vacancyName: string                           // Название вакансии
  grade: string                                 // Грейд (Junior, Middle, Senior и т.д.)
  salaryUsd: { min: number; max: number }      // Зарплатная вилка в USD (net)
  salaryByn: { min: number; max: number }      // Зарплатная вилка в BYN (net)
  salaryPln: { min: number; max: number }       // Зарплатная вилка в PLN (gross)
  salaryEur: { min: number; max: number }      // Зарплатная вилка в EUR (gross)
  isActive: boolean                             // Флаг активности вилки
  updatedAt: string                             // Дата последнего обновления (ISO format)
}
```

### SalaryRangeForDetail (SalaryRangeDetailModal)
```typescript
export interface SalaryRangeForDetail {
  id: number
  vacancyId: number
  vacancyName: string
  grade: string
  salaryUsd: { min: number; max: number }
  salaryByn: { min: number; max: number }
  salaryPln: { min: number; max: number }
  salaryEur: { min: number; max: number }
  isActive: boolean
  updatedAt: string
}
```

### SalaryRangesStatsProps
```typescript
interface SalaryRangesStatsProps {
  total: number
  active: number
  inactive: number
  activeTab: 'active' | 'inactive' | 'all'
  onTabChange: (tab: 'active' | 'inactive' | 'all') => void
  onListViewClick?: () => void
}
```

### SalaryRangesSearchFiltersProps
```typescript
interface SalaryRangesSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedVacancy: string
  onVacancyChange: (value: string) => void
  selectedGrade: string
  onGradeChange: (value: string) => void
  onReset: () => void
}
```

### SalaryRangeCardProps
```typescript
interface SalaryRangeCardProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}
```

### SalaryRangeListItemProps
```typescript
interface SalaryRangeListItemProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}
```

### CreateSalaryRangeModalProps
```typescript
interface CreateSalaryRangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: {
    vacancy: string
    grade: string
    salaryMinUsd: number
    salaryMaxUsd: number
  }) => void
}
```

### SalaryRangeDetailModalProps
```typescript
interface SalaryRangeDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryRange: SalaryRangeForDetail | null
  onToggleActive?: (id: number) => void
  onSave?: (id: number, data: {
    vacancyName: string
    grade: string
    salaryUsd: { min: number; max: number }
    salaryByn: { min: number; max: number }
    salaryPln: { min: number; max: number }
    salaryEur: { min: number; max: number }
    updatedAt: string
  }) => void
  onDelete?: (id: number) => void
}
```

## Константы

### mockCurrencyRates (CreateSalaryRangeModal, SalaryRangeDetailModal)
```typescript
const mockCurrencyRates = {
  USD: { rate: 3.25, scale: 1 },
  PLN: { rate: 0.82, scale: 100 },  // 82 BYN за 100 PLN
  EUR: { rate: 3.55, scale: 1 },
}
```
- **Назначение**: Моковые данные для курсов валют
- **TODO**: Загружать из API или использовать реальные курсы

### mockTaxRate (CreateSalaryRangeModal, SalaryRangeDetailModal)
```typescript
const mockTaxRate = 0.25  // 25% общий налог
```
- **Назначение**: Моковые данные для налогов (для расчета gross)
- **TODO**: Загружать из API или использовать реальные ставки налогов

### mockVacancies (CreateSalaryRangeModal, SalaryRangeDetailModal)
```typescript
const mockVacancies = [
  'DevOps Engineer',
  'Frontend Engineer (React)',
  'Backend Engineer (Java)',
  // ... и т.д.
]
```
- **Назначение**: Моковые данные для вакансий
- **TODO**: Загружать из API

### mockGrades (CreateSalaryRangeModal, SalaryRangeDetailModal)
```typescript
const mockGrades = [
  'Junior',
  'Junior+',
  'Middle',
  'Middle+',
  'Senior',
  'Senior+',
  'Lead',
]
```
- **Назначение**: Моковые данные для грейдов
- **TODO**: Загружать из API

## Функции и обработчики

### SalaryRangeCard / SalaryRangeListItem

#### formatNumber
- **Назначение**: Форматирование числа для отображения
- **Параметры**: `num: number`
- **Возвращает**: отформатированная строка (например, "1 000 000")
- **Логика**: Использует Intl.NumberFormat с русской локалью

#### formatDate
- **Назначение**: Форматирование даты для отображения
- **Параметры**: `dateString: string` - дата в формате ISO строки
- **Возвращает**: отформатированная дата в формате DD.MM.YYYY
- **Логика**: Использует toLocaleDateString с русской локалью

### CreateSalaryRangeModal

#### calculateOtherCurrencies
- **Назначение**: Автоматический расчет других валют на основе USD
- **Параметры**: `minUsd: number`, `maxUsd: number`
- **Возвращает**: объект с вилками в BYN, PLN, EUR
- **Логика**: 
  - BYN (net) = USD * курс USD
  - PLN (gross): USD -> BYN -> PLN (net) -> PLN (gross) = PLN net / (1 - налог)
  - EUR (gross): аналогично PLN
  - Нормализация PLN rate: если scale=100, то rate/scale дает курс за 1 PLN

#### formatNumber
- **Назначение**: Форматирование числа для отображения
- **Параметры**: `num: number`
- **Возвращает**: отформатированная строка без дробной части

#### handleSave
- **Назначение**: Обработка сохранения зарплатной вилки
- **Логика**: 
  - Валидация обязательных полей
  - Валидация значений зарплаты (минимум не может быть больше максимума)
  - Вызов onSave с данными
  - Сброс формы и закрытие модального окна

#### handleCancel
- **Назначение**: Обработка отмены создания вилки
- **Логика**: Сброс формы и закрытие модального окна

### SalaryRangeDetailModal

#### calculateOtherCurrencies
- **Назначение**: Автоматический расчет других валют на основе USD
- **Логика**: Аналогична функции в `CreateSalaryRangeModal`

#### formatNumber
- **Назначение**: Форматирование числа для отображения
- **Логика**: Аналогична функции в `CreateSalaryRangeCard`

#### formatDate
- **Назначение**: Форматирование даты для отображения
- **Параметры**: `d: string` - дата в формате ISO строки
- **Возвращает**: отформатированная дата в формате DD.MM.YYYY HH:MM
- **Логика**: Использует toLocaleDateString с русской локалью и временем

#### handleSave
- **Назначение**: Обработка сохранения изменений вилки
- **Логика**: 
  - Валидация значений зарплаты
  - Вызов onSave с обновленными данными
  - Переключение в режим просмотра

#### handleCancel
- **Назначение**: Обработка отмены редактирования
- **Логика**: Восстановление исходных значений и переключение в режим просмотра

#### handleToggleActive
- **Назначение**: Обработка переключения активности вилки
- **Логика**: Вызывает onToggleActive с id вилки

#### handleDelete
- **Назначение**: Обработка удаления вилки
- **Логика**: Показывает Toast с подтверждением, при подтверждении вызывает onDelete и закрывает модальное окно

#### useEffect: инициализация формы
- **Назначение**: Инициализация формы при открытии модального окна
- **Логика**: Заполняет форму данными из salaryRange и переключает в режим просмотра
- **Зависимости**: `open`, `salaryRange`

## Вычисляемые значения

### CreateSalaryRangeModal / SalaryRangeDetailModal

#### calculated
- **Назначение**: Рассчитанные вилки в других валютах
- **Вычисление**: `calculateOtherCurrencies(minUsd, maxUsd)`
- **Логика**: Автоматически пересчитывается при изменении USD вилки

## Стили

### SalaryRangesStats.module.css
- `.statsContainer`: контейнер статистики
- `.statsLeft`: левая часть (количество вилок и иконка списка)
- `.statsRight`: правая часть (SegmentedControl)
- `.listIcon`: иконка списка для переключения режима
- `.textDesktop`: текст для десктопа
- `.textMobile`: текст для мобильных

### SalaryRangesSearchFilters.module.css
- `.searchFiltersContainer`: контейнер поиска и фильтров
- `.filtersRow`: строка с полем поиска и фильтрами
- `.searchInput`: поле поиска
- `.filterSelect`: выпадающий список фильтра
- `.searchButton`: кнопка поиска

### SalaryRangeCard.module.css
- `.salaryRangeCard`: карточка зарплатной вилки
- `.cardHeader`: заголовок карточки (teal фон)
- `.cardDetails`: детали карточки (белый фон)
- `.actionButton`: кнопка действия

### SalaryRangeListItem.module.css
- `.salaryRangeListItem`: элемент списка зарплатной вилки
- `.desktopLayout`: layout для десктопа
- `.mobileLayout`: layout для мобильных
- `.statusTag`: тег статуса
- `.statusActive`, `.statusInactive`: классы для разных статусов
- `.actionButtons`: контейнер кнопок действий
- `.actionButton`: кнопка действия
- `.mobileActionsRow`: строка действий для мобильных

### CreateSalaryRangeModal.module.css
- `.dialogContent`: содержимое модального окна
- `.infoBox`: информационное сообщение
- `.formContent`: содержимое формы

### SalaryRangeDetailModal.module.css
- `.dialogContent`: содержимое модального окна
- `.infoBox`: информационное сообщение
- `.formContent`: содержимое формы

## Использование

### Пример использования SalaryRangesStats:
```tsx
<SalaryRangesStats 
  total={totalRanges}
  active={activeRanges}
  inactive={inactiveRanges}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onListViewClick={() => setViewMode('list')}
/>
```

### Пример использования SalaryRangesSearchFilters:
```tsx
<SalaryRangesSearchFilters 
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  selectedVacancy={selectedVacancy}
  onVacancyChange={setSelectedVacancy}
  selectedGrade={selectedGrade}
  onGradeChange={setSelectedGrade}
  onReset={() => {
    setSearchQuery('')
    setSelectedVacancy('all')
    setSelectedGrade('all')
  }}
/>
```

### Пример использования SalaryRangeCard:
```tsx
<SalaryRangeCard 
  salaryRange={salaryRange}
  onClick={() => setDetailModalOpen(true)}
  onToggleActive={(id) => toggleActive(id)}
/>
```

### Пример использования SalaryRangeListItem:
```tsx
<SalaryRangeListItem 
  salaryRange={salaryRange}
  onClick={() => setDetailModalOpen(true)}
  onToggleActive={(id) => toggleActive(id)}
/>
```

### Пример использования CreateSalaryRangeModal:
```tsx
<CreateSalaryRangeModal 
  open={isCreateModalOpen}
  onOpenChange={setIsCreateModalOpen}
  onSave={(data) => {
    // Создание вилки через API
  }}
/>
```

### Пример использования SalaryRangeDetailModal:
```tsx
<SalaryRangeDetailModal 
  open={isDetailModalOpen}
  onOpenChange={setIsDetailModalOpen}
  salaryRange={selectedSalaryRange}
  onToggleActive={(id) => toggleActive(id)}
  onSave={(id, data) => {
    // Обновление вилки через API
  }}
  onDelete={(id) => {
    // Удаление вилки через API
  }}
/>
```

## TODO: Интеграция с API

1. ❌ Загрузка статистики из API
   - GET `/api/salary-ranges/stats/`
   - Возвращает: объект с количеством вилок (total, active, inactive)

2. ❌ Загрузка списка вакансий из API
   - GET `/api/vacancies/`
   - Возвращает: массив вакансий
   - Используется в `SalaryRangesSearchFilters` и модальных окнах

3. ❌ Загрузка списка грейдов из API
   - GET `/api/grades/`
   - Возвращает: массив грейдов
   - Используется в модальных окнах

4. ❌ Поиск и фильтрация вилок через API
   - GET `/api/salary-ranges/?q={query}&vacancy={vacancy}&grade={grade}&status={status}`
   - Параметры: поисковый запрос, вакансия, грейд, статус (active/inactive)
   - Возвращает: массив зарплатных вилок

5. ❌ Создание вилки через API
   - POST `/api/salary-ranges/`
   - Параметры: вакансия, грейд, зарплатные вилки в USD
   - Backend рассчитывает другие валюты на основе курсов
   - Возвращает: созданную вилку

6. ❌ Обновление вилки через API
   - PUT/PATCH `/api/salary-ranges/{id}/`
   - Параметры: обновленные поля вилки
   - Backend пересчитывает другие валюты при изменении USD
   - Возвращает: обновленную вилку

7. ❌ Удаление вилки через API
   - DELETE `/api/salary-ranges/{id}/`
   - Возвращает: статус удаления

8. ❌ Переключение активности вилки через API
   - PATCH `/api/salary-ranges/{id}/toggle-active/`
   - Возвращает: обновленную вилку

9. ❌ Загрузка курсов валют из API
   - GET `/api/currency-rates/`
   - Возвращает: актуальные курсы валют
   - Используется для расчета других валют

10. ❌ Загрузка ставок налогов из API
    - GET `/api/taxes/pln/`
    - Возвращает: актуальные ставки налогов
    - Используется для расчета gross зарплат

11. ❌ Навигация к детальной странице вилки
    - Реализовать переход на `/vacancies/salary-ranges/{id}` при клике на вилку
    - Отобразить детальную информацию на странице

## Связи с другими компонентами

- Используется в `/app/vacancies/salary-ranges/page.tsx` - основная страница управления зарплатными вилками
- Используется в `/app/vacancies/salary-ranges/[id]/page.tsx` - детальная страница вилки
- Использует `useToast` из `@/components/Toast/ToastContext` для уведомлений (в `SalaryRangeDetailModal`)
- Связан с компонентами `finance` для получения курсов валют и налогов (TODO: реализовать интеграцию)
