# Документация компонентов: requests

## Общее описание

Директория `components/requests` содержит компоненты для управления заявками на найм (hiring requests). Компоненты обеспечивают отображение статистики, поиск и фильтрацию, отображение заявок в разных режимах (карточки, список, таблица), создание новых заявок и детальное отображение.

**Расположение**: `@/components/requests`

## Компоненты

### 1. RequestsStats
- **Файл**: `RequestsStats.tsx`
- **Назначение**: Компонент статистики по заявкам на найм
- **Пропсы**:
  - `total`: общее количество заявок (number)
  - `planned`: количество заявок со статусом "planned" (number)
  - `inProcess`: количество заявок со статусом "in_process" (number)
  - `cancelled`: количество заявок со статусом "cancelled" (number)
  - `closed`: количество заявок со статусом "closed" (number)
- **Функциональность**: 
  - Отображение 5 карточек со статистикой
  - Каждая карточка содержит число и иконку
  - Цветовые индикации для разных статусов
- **Цветовые схемы**:
  - "Всего заявок": ClipboardIcon (без цвета)
  - "Планируется": CalendarIcon (синий #3b82f6)
  - "В процессе": ClockIcon (оранжевый #f59e0b)
  - "Отменена": CrossCircledIcon (красный #ef4444)
  - "Закрыта": CheckIcon (зеленый #12a594)
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: отображается на странице управления заявками

### 2. RequestsSearchFilters
- **Файл**: `RequestsSearchFilters.tsx`
- **Назначение**: Компонент поиска и фильтров для заявок на найм
- **Пропсы**:
  - `searchQuery`: текущий поисковый запрос (string)
  - `onSearchChange`: обработчик изменения поискового запроса ((value: string) => void)
  - `selectedRecruiter`: выбранный рекрутер (string, 'all' - все рекрутеры)
  - `onRecruiterChange`: обработчик изменения выбранного рекрутера ((value: string) => void)
  - `selectedStatus`: выбранный статус (string, 'all' - все, 'planned' - планируется, и т.д.)
  - `onStatusChange`: обработчик изменения выбранного статуса ((value: string) => void)
  - `selectedPriority`: выбранный приоритет (string, 'all' - все, 'high' - высокий, и т.д.)
  - `onPriorityChange`: обработчик изменения выбранного приоритета ((value: string) => void)
- **Функциональность**: 
  - Поле поиска: поиск по названию заявки, ID или отделу
  - Фильтр по рекрутеру: выбор рекрутера из списка (или "Все рекрутеры")
  - Фильтр по статусу: выбор статуса (Все, Планируется, В процессе, Отменена, Закрыта)
  - Фильтр по приоритету: выбор приоритета (Все, Высокий, Средний, Низкий)
  - Кнопка поиска: выполнение поиска с применением фильтров (TODO: реализовать функциональность)
- **Особенности**: 
  - Иконка поиска в поле ввода
  - Адаптивная верстка (wrap="wrap" для мобильных)
  - TODO: Загружать список рекрутеров из API
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: используется на странице управления заявками

### 3. RequestCard
- **Файл**: `RequestCard.tsx`
- **Назначение**: Компонент карточки заявки на найм (режим "Карточки")
- **Пропсы**:
  - `request`: данные заявки для отображения (Request)
  - `onClick`: обработчик клика на карточку (() => void, опционально)
- **Функциональность**: 
  - Заголовок и ID заявки
  - Статус заявки с цветовой индикацией
  - Приоритет заявки с цветовой индикацией
  - Информация об отделе
  - Информация о рекрутере
  - Список технологий
  - Количество кандидатов
  - Дата заявки
  - Предупреждения (если есть)
  - Кнопки действий: просмотр и редактирование
- **Особенности**: 
  - Цветовая индикация статуса и приоритета
  - Иконки для визуального различия информации
  - Технологии отображаются в виде тегов
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: используется в режиме отображения "Карточки"

### 4. RequestListItem
- **Файл**: `RequestListItem.tsx`
- **Назначение**: Компонент элемента списка заявки на найм (режим "Список")
- **Пропсы**:
  - `request`: данные заявки для отображения (основная заявка) (Request)
  - `onClick`: обработчик клика на элемент списка (() => void, опционально)
  - `requestsCount`: количество заявок в группе (number, опционально)
  - `requests`: массив заявок для группировки (Request[], опционально, если передано - отображаются все в таблице)
- **Функциональность**: 
  - Заголовок, статус, приоритет и ID заявки в первой строке
  - Информация об отделе, рекрутере, количестве кандидатов, дате и предупреждениях во второй строке
  - Кнопка разворота для отображения детальной таблицы (если есть данные)
  - Кнопки действий: просмотр и редактирование
  - Развернутая таблица с детальной информацией (для одной заявки или группы заявок)
- **Особенности**: 
  - Поддержка группировки нескольких заявок в один элемент списка
  - Таблица развернута по умолчанию для группы заявок
  - Кнопка разворота показывается только если есть данные для таблицы
  - Использует `RequestTableRowExpanded` для отображения строк таблицы
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: используется в режиме отображения "Список"

### 5. RequestsTable
- **Файл**: `RequestsTable.tsx`
- **Назначение**: Компонент таблицы заявок на найм (режим "Таблица")
- **Пропсы**:
  - `requests`: массив заявок для отображения (Request[])
  - `onView`: обработчик просмотра заявки ((id: number) => void, опционально)
  - `onEdit`: обработчик редактирования заявки ((id: number) => void, опционально)
- **Функциональность**: 
  - Отображение заявок в таблице
  - Сортировка заявок по дате создания (от новых к старым)
  - Колонки: Вакансия / Грейд, Проект, Рекрутер, Статус, Сроки, Факт/SLA, T2H | SLA, Кандидат, Действия
  - Использует `RequestTableRow` для отображения строк
- **Особенности**: 
  - Сортировка по id в обратном порядке (больший id = новее)
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: используется в режиме отображения "Таблица"

### 6. RequestTableRow
- **Файл**: `RequestTableRow.tsx`
- **Назначение**: Компонент строки таблицы заявки на найм
- **Пропсы**:
  - `request`: данные заявки для отображения (Request)
  - `onView`: обработчик просмотра заявки ((id: number) => void, опционально)
  - `onEdit`: обработчик редактирования заявки ((id: number) => void, опционально)
- **Функциональность**: 
  - Отображение всех полей заявки в ячейках таблицы
  - Цветовая индикация статуса и SLA статуса
  - Кнопки действий: просмотр и редактирование
- **Особенности**: 
  - Функции форматирования: `getStatusLabel`, `getStatusColor`, `getSlaStatusLabel`, `getSlaStatusColor`
  - Отображение грейда в виде тега
  - Отображение кандидата с ID (если есть)
- **Используется в**: 
  - `RequestsTable`: для отображения строк таблицы

### 7. RequestTableRowExpanded
- **Файл**: `RequestTableRowExpanded.tsx`
- **Назначение**: Компонент строки развернутой таблицы заявки на найм
- **Пропсы**:
  - `request`: данные заявки для отображения (Request)
  - `onView`: обработчик просмотра заявки ((id: number) => void, опционально)
  - `onEdit`: обработчик редактирования заявки ((id: number) => void, опционально)
- **Функциональность**: 
  - Аналогична `RequestTableRow`, но без названия вакансии (только грейд)
  - Используется в развернутых таблицах внутри `RequestListItem`
- **Особенности**: 
  - Отображает только грейд (без названия вакансии)
  - Те же функции форматирования, что и в `RequestTableRow`
- **Используется в**: 
  - `RequestListItem`: для отображения строк в развернутой таблице

### 8. CreateRequestModal
- **Файл**: `CreateRequestModal.tsx`
- **Назначение**: Модальное окно создания заявки на найм
- **Пропсы**:
  - `isOpen`: флаг открытости модального окна (boolean)
  - `onClose`: обработчик закрытия модального окна (() => void)
  - `onSave`: обработчик успешного сохранения ((data: any) => void)
- **Функциональность**: 
  - Основная информация: вакансия, грейд, проект, приоритет, причина открытия
  - Даты: дата открытия, дедлайн (автоматический расчет на основе SLA), рекрутер
  - Заметки: дополнительная информация по заявке
  - Автоматический расчет дедлайна на основе SLA
  - Валидация обязательных полей
- **Моковые данные**:
  - `mockVacancies`: список вакансий
  - `mockGrades`: список грейдов
  - `mockPriorities`: список приоритетов
  - `mockReasons`: список причин открытия
  - `mockRecruiters`: список рекрутеров
- **Особенности**: 
  - Автоматическое форматирование даты открытия (ДД.ММ.ГГГГ)
  - Автоматический расчет дедлайна на основе SLA (моковая логика, 30 дней)
  - Сброс формы при закрытии
  - Валидация обязательных полей перед сохранением
- **Используется в**: 
  - `/app/hiring-requests/page.tsx`: открывается при клике на "Создать заявку"

## Интерфейсы и типы

### Request (types.ts)
```typescript
export interface Request {
  id: number                                    // Уникальный идентификатор заявки
  title: string                                 // Название заявки
  status: 'planned' | 'in_process' | 'cancelled' | 'closed'  // Статус заявки
  department: string                            // Отдел
  recruiter: string                             // Имя рекрутера
  priority: 'high' | 'medium' | 'low'          // Приоритет заявки
  technologies: string[]                        // Массив технологий
  candidates: number                            // Количество кандидатов
  date: string | null                           // Дата заявки (опционально)
  hasWarning: boolean                           // Флаг наличия предупреждения
  warningText?: string                          // Текст предупреждения (опционально)
  // Дополнительные поля для таблицы (опционально)
  grade?: string                                // Грейд
  project?: string | null                       // Проект
  recruiterDays?: number                        // Количество дней у рекрутера
  statusDate?: string                           // Дата статуса
  startDate?: string                            // Дата начала
  endDate?: string                              // Дата окончания
  isOverdue?: boolean                           // Флаг просрочки
  factDays?: number                             // Фактические дни
  slaDays?: number                              // SLA дни
  slaStatus?: 'normal' | 'risk' | 'overdue' | 'on_time'  // Статус SLA
  t2hDays?: number                              // T2H дни
  t2hSlaDays?: number                           // T2H SLA дни
  candidate?: {                                 // Кандидат (опционально)
    name: string
    id: string
  }
}
```

### RequestsStatsProps
```typescript
interface RequestsStatsProps {
  total: number          // Общее количество заявок
  planned: number       // Количество заявок со статусом "planned"
  inProcess: number     // Количество заявок со статусом "in_process"
  cancelled: number     // Количество заявок со статусом "cancelled"
  closed: number        // Количество заявок со статусом "closed"
}
```

### RequestsSearchFiltersProps
```typescript
interface RequestsSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedRecruiter: string
  onRecruiterChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedPriority: string
  onPriorityChange: (value: string) => void
}
```

### RequestCardProps
```typescript
interface RequestCardProps {
  request: Request
  onClick?: () => void
}
```

### RequestListItemProps
```typescript
interface RequestListItemProps {
  request: Request
  onClick?: () => void
  requestsCount?: number
  requests?: Request[]
}
```

### RequestsTableProps
```typescript
interface RequestsTableProps {
  requests: Request[]
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}
```

### RequestTableRowProps
```typescript
interface RequestTableRowProps {
  request: Request
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}
```

### RequestTableRowExpandedProps
```typescript
interface RequestTableRowExpandedProps {
  request: Request
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}
```

### CreateRequestModalProps
```typescript
interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
}
```

## Функции и обработчики

### RequestCard

#### getStatusLabel
- **Назначение**: Получение текстового представления статуса
- **Параметры**: `status: string`
- **Возвращает**: текстовое представление статуса
- **Логика**: Преобразует код статуса в читаемый текст

#### getPriorityLabel
- **Назначение**: Получение текстового представления приоритета
- **Параметры**: `priority: string`
- **Возвращает**: текстовое представление приоритета
- **Логика**: Преобразует код приоритета в читаемый текст

### RequestListItem

#### getStatusLabel, getPriorityLabel
- Аналогичны функциям в `RequestCard`

#### hasTableData
- **Назначение**: Проверка наличия данных для детальной таблицы
- **Вычисление**: `request.grade && request.startDate && request.endDate && request.factDays && request.slaDays`
- **Логика**: Проверяет наличие всех необходимых полей для отображения детальной таблицы

#### shouldShowExpandButton
- **Назначение**: Определение необходимости показа кнопки разворота
- **Вычисление**: `hasTableData || (hasMultipleRequests && requests && requests.some(r => r.grade && r.startDate && r.endDate && r.factDays && r.slaDays))`
- **Логика**: Показываем кнопку разворота если есть данные для таблицы (для одиночных заявок) или если это группа заявок и хотя бы у одной есть данные для таблицы

### RequestTableRow / RequestTableRowExpanded

#### getStatusLabel
- **Назначение**: Получение текстового представления статуса
- **Параметры**: `status: string`
- **Возвращает**: текстовое представление статуса

#### getStatusColor
- **Назначение**: Получение цвета для статуса
- **Параметры**: `status: string`
- **Возвращает**: цвет ('blue', 'orange', 'red', 'teal', 'gray')

#### getSlaStatusLabel
- **Назначение**: Получение текстового представления SLA статуса
- **Параметры**: `status: string`
- **Возвращает**: текстовое представление SLA статуса

#### getSlaStatusColor
- **Назначение**: Получение цвета для SLA статуса
- **Параметры**: `status: string`
- **Возвращает**: цвет ('gray', 'orange', 'red', 'teal')

### CreateRequestModal

#### handleChange
- **Назначение**: Обработка изменения полей формы
- **Параметры**: `field: string`, `value: string`
- **Логика**: Обновляет formData при изменении поля

#### handleSave
- **Назначение**: Обработка сохранения заявки
- **Логика**: 
  - Валидация обязательных полей
  - Создание объекта данных заявки
  - Вызов onSave с данными
  - Закрытие модального окна

#### useEffect: сброс формы
- **Назначение**: Сброс формы при закрытии модального окна
- **Зависимости**: `isOpen`

#### useEffect: расчет дедлайна
- **Назначение**: Расчет дедлайна на основе SLA
- **Логика**: 
  - Проверяет наличие вакансии, грейда и даты открытия
  - Использует моковые данные SLA (30 дней)
  - Рассчитывает дедлайн и обновляет calculatedDeadline
- **Зависимости**: `formData.vacancy`, `formData.grade`, `formData.openingDate`

## Стили

### RequestsStats.module.css
- `.statsContainer`: контейнер карточек статистики
- `.statCard`: карточка статистики

### RequestsSearchFilters.module.css
- `.searchFiltersContainer`: контейнер поиска и фильтров
- `.filtersRow`: строка с полем поиска и фильтрами
- `.searchInput`: поле поиска
- `.filterSelect`: выпадающий список фильтра
- `.searchButton`: кнопка поиска

### RequestCard.module.css
- `.requestCard`: карточка заявки
- `.statusTag`: тег статуса
- `.statusPlanned`, `.statusInProcess`, `.statusCancelled`, `.statusClosed`, `.statusPending`: классы для разных статусов
- `.priorityTag`: тег приоритета
- `.priorityHigh`, `.priorityMedium`, `.priorityLow`: классы для разных приоритетов
- `.actionButtons`: контейнер кнопок действий
- `.actionButton`: кнопка действия
- `.techTag`: тег технологии

### RequestListItem.module.css
- `.requestListItem`: элемент списка заявки
- `.statusTag`, `.priorityTag`: теги статуса и приоритета
- `.actionButtons`: контейнер кнопок действий
- `.actionButton`: кнопка действия
- `.expandedTable`: развернутая таблица

### RequestsTable.module.css
- `.tableContainer`: контейнер таблицы
- `.tableRow`: строка таблицы
- `.gradeTag`: тег грейда
- `.statusTag`: тег статуса
- `.statusblue`, `.statusorange`, `.statusred`, `.statusteal`, `.statusgray`: классы для разных статусов
- `.slaTag`: тег SLA статуса
- `.slagray`, `.slaorange`, `.slared`, `.slateal`: классы для разных SLA статусов
- `.actionButton`: кнопка действия

### CreateRequestModal.module.css
- `.sectionCard`: карточка секции формы
- `.sectionIcon`: иконка секции
- `.dotIcon`: точка иконки
- `.deadlineInfo`: блок информации о дедлайне

## Использование

### Пример использования RequestsStats:
```tsx
<RequestsStats 
  total={totalRequests}
  planned={plannedRequests}
  inProcess={inProcessRequests}
  cancelled={cancelledRequests}
  closed={closedRequests}
/>
```

### Пример использования RequestsSearchFilters:
```tsx
<RequestsSearchFilters 
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  selectedRecruiter={selectedRecruiter}
  onRecruiterChange={setSelectedRecruiter}
  selectedStatus={selectedStatus}
  onStatusChange={setSelectedStatus}
  selectedPriority={selectedPriority}
  onPriorityChange={setSelectedPriority}
/>
```

### Пример использования RequestCard:
```tsx
<RequestCard 
  request={request}
  onClick={() => router.push(`/hiring-requests/${request.id}`)}
/>
```

### Пример использования RequestListItem:
```tsx
<RequestListItem 
  request={request}
  onClick={() => router.push(`/hiring-requests/${request.id}`)}
  requests={groupedRequests}
  requestsCount={groupedRequests.length}
/>
```

### Пример использования RequestsTable:
```tsx
<RequestsTable 
  requests={requests}
  onView={(id) => router.push(`/hiring-requests/${id}`)}
  onEdit={(id) => router.push(`/hiring-requests/${id}/edit`)}
/>
```

### Пример использования CreateRequestModal:
```tsx
<CreateRequestModal 
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSave={(data) => {
    // Создание заявки через API
  }}
/>
```

## TODO: Интеграция с API

1. ❌ Загрузка статистики из API
   - GET `/api/hiring-requests/stats/`
   - Возвращает: объект с количеством заявок по статусам

2. ❌ Загрузка списка рекрутеров из API
   - GET `/api/recruiters/`
   - Возвращает: массив рекрутеров
   - Используется в `RequestsSearchFilters` для фильтра по рекрутеру

3. ❌ Поиск и фильтрация заявок через API
   - GET `/api/hiring-requests/?q={query}&recruiter={recruiter}&status={status}&priority={priority}`
   - Параметры: поисковый запрос, рекрутер, статус, приоритет
   - Возвращает: массив заявок

4. ❌ Создание заявки через API
   - POST `/api/hiring-requests/`
   - Параметры: все поля формы создания заявки
   - Возвращает: созданную заявку

5. ❌ Получение SLA для расчета дедлайна
   - GET `/api/sla/?vacancy={vacancy}&grade={grade}`
   - Параметры: вакансия и грейд
   - Возвращает: количество дней SLA
   - Используется в `CreateRequestModal` для автоматического расчета дедлайна

6. ❌ Загрузка списка вакансий из API
   - GET `/api/vacancies/`
   - Возвращает: массив вакансий
   - Используется в `CreateRequestModal` для выбора вакансии

7. ❌ Загрузка списка грейдов из API
   - GET `/api/grades/`
   - Возвращает: массив грейдов
   - Используется в `CreateRequestModal` для выбора грейда

8. ❌ Обновление заявки через API
   - PUT/PATCH `/api/hiring-requests/{id}/`
   - Параметры: обновленные поля заявки
   - Возвращает: обновленную заявку

9. ❌ Удаление заявки через API
   - DELETE `/api/hiring-requests/{id}/`
   - Возвращает: статус удаления

10. ❌ Навигация к детальной странице заявки
    - Реализовать переход на `/hiring-requests/{id}` при клике на заявку
    - Реализовать переход на `/hiring-requests/{id}/edit` при клике на редактирование

## Связи с другими компонентами

- Используется в `/app/hiring-requests/page.tsx` - основная страница управления заявками
- Использует `useRouter` из `next/navigation` для навигации
- Использует `useToast` из `@/components/Toast/ToastContext` для уведомлений (в `CreateRequestModal`)
- `RequestListItem` использует `RequestTableRowExpanded` для отображения строк развернутой таблицы
- `RequestsTable` использует `RequestTableRow` для отображения строк таблицы
- Связан с типами из `types.ts` для единообразного представления данных
