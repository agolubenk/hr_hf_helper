# Документация компонентов: candidate-responses

## Общее описание

Директория `components/candidate-responses` содержит компоненты для управления шаблонами ответов кандидатам. Компоненты обеспечивают создание, редактирование и управление шаблонами отказов, а также настройку текста для слотов интервью.

**Расположение**: `@/components/candidate-responses`

## Компоненты

### 1. GeneralTemplatesTab
- **Файл**: `GeneralTemplatesTab.tsx`
- **Назначение**: Компонент управления общими шаблонами отказов
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение шаблонов отказов, сгруппированных по типам отказов
  - Раскрывающиеся секции (аккордеон) для каждого типа отказа
  - Создание нового шаблона для выбранного типа
  - Редактирование существующего шаблона
  - Удаление шаблона с подтверждением
  - Переключение активности шаблона
  - Использование RejectionTemplateForm для создания/редактирования
- **Типы отказов**:
  - `office_format`: Офисный формат
  - `finance`: Финансы
  - `finance_more`: Финансы - больше
  - `finance_less`: Финансы - меньше
  - `general`: Общий отказ
- **Особенности**: 
  - Использует Toast для подтверждения удаления
  - Раскрывающиеся секции для каждого типа отказа
  - Кнопка "Создать шаблон" в каждой секции
- **Используется в**: 
  - `/app/candidate-responses/page.tsx`: вкладка "Общие шаблоны"

### 2. GradeTemplatesTab
- **Файл**: `GradeTemplatesTab.tsx`
- **Назначение**: Компонент управления шаблонами отказов для конкретных грейдов
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение шаблонов отказов, сгруппированных по грейдам
  - Раскрывающиеся секции (аккордеон) для каждого грейда
  - Создание нового шаблона для выбранного грейда
  - Редактирование существующего шаблона
  - Удаление шаблона с подтверждением
  - Переключение активности шаблона
  - Использование RejectionTemplateForm для создания/редактирования
- **Особенности**: 
  - Шаблоны привязаны к конкретному грейду (grade_id)
  - Использует Toast для подтверждения удаления
  - Раскрывающиеся секции для каждого грейда
- **Используется в**: 
  - `/app/candidate-responses/page.tsx`: вкладка "Шаблоны по грейдам"

### 3. RejectionTemplateForm
- **Файл**: `RejectionTemplateForm.tsx`
- **Назначение**: Форма создания/редактирования шаблона отказа
- **Пропсы**:
  - `template`: существующий шаблон для редактирования (RejectionTemplate | null)
  - `rejectionType`: тип отказа (string)
  - `gradeId`: ID грейда (number | null, опционально)
  - `onSave`: обработчик сохранения (() => void)
  - `onCancel`: обработчик отмены (() => void)
- **Функциональность**: 
  - Поля формы:
    - Тип отказа (Select, только для общих шаблонов)
    - Грейд (Select, только для шаблонов по грейдам)
    - Название шаблона (TextField)
    - Текст сообщения (TextArea)
    - Активность шаблона (Switch)
  - Валидация полей
  - Сохранение через API (TODO)
  - Отображение в Card с заголовком
- **Особенности**: 
  - Разные поля в зависимости от типа (общий или по грейду)
  - Валидация обязательных полей
  - Индикатор загрузки при сохранении
- **Используется в**: 
  - GeneralTemplatesTab: для создания/редактирования общих шаблонов
  - GradeTemplatesTab: для создания/редактирования шаблонов по грейдам

### 4. SlotsTab
- **Файл**: `SlotsTab.tsx`
- **Назначение**: Компонент настройки текста для слотов интервью
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Настройка текста перед списком слотов
  - Настройка текста после списка слотов
  - Отображение примера результата
  - Сохранение настроек
  - Отмена изменений
  - Индикатор несохраненных изменений
- **Особенности**: 
  - Простая форма с двумя полями TextArea
  - Показывает пример результата в реальном времени
  - Отслеживание изменений (hasChanges)
- **Используется в**: 
  - `/app/candidate-responses/page.tsx`: вкладка "Настройки слотов"

## Интерфейсы и типы

### RejectionTemplate
```typescript
interface RejectionTemplate {
  id: number                    // Уникальный идентификатор шаблона
  rejection_type: string        // Тип отказа (office_format, finance, и т.д.)
  rejection_type_display: string // Отображаемое название типа отказа
  title: string                 // Название шаблона
  message: string               // Текст сообщения отказа
  is_active: boolean            // Активен ли шаблон
  grade_id?: number | null      // ID грейда (для шаблонов по грейдам)
  grade_name?: string | null    // Название грейда (для шаблонов по грейдам)
}
```

### Grade
```typescript
interface Grade {
  id: number                    // Уникальный идентификатор грейда
  name: string                  // Название грейда
}
```

### SlotsSettings
```typescript
interface SlotsSettings {
  textBefore: string            // Текст перед списком слотов
  textAfter: string            // Текст после списка слотов
}
```

### RejectionTemplateFormProps
```typescript
interface RejectionTemplateFormProps {
  template: RejectionTemplate | null  // Шаблон для редактирования
  rejectionType: string               // Тип отказа
  gradeId?: number | null             // ID грейда (для шаблонов по грейдам)
  onSave: () => void                  // Обработчик сохранения
  onCancel: () => void                // Обработчик отмены
}
```

## Константы

### REJECTION_TYPES (GeneralTemplatesTab)
```typescript
const REJECTION_TYPES = [
  { value: 'office_format', label: 'Офисный формат' },
  { value: 'finance', label: 'Финансы' },
  { value: 'finance_more', label: 'Финансы - больше' },
  { value: 'finance_less', label: 'Финансы - меньше' },
  { value: 'general', label: 'Общий отказ' },
]
```

### REJECTION_TYPE_OPTIONS (RejectionTemplateForm)
```typescript
const REJECTION_TYPE_OPTIONS = [
  { value: 'office_format', label: 'Офисный формат' },
  { value: 'finance', label: 'Финансы' },
  { value: 'finance_more', label: 'Финансы - больше' },
  { value: 'finance_less', label: 'Финансы - меньше' },
  { value: 'general', label: 'Общий отказ' },
]
```

## Функции и обработчики

### GeneralTemplatesTab

#### toggleSection
- **Назначение**: Переключение раскрытости секции типа отказа
- **Параметры**: `type: string` - тип отказа
- **Логика**: Добавляет/удаляет тип из Set expandedSections

#### handleCreate
- **Назначение**: Открытие формы создания нового шаблона
- **Параметры**: `type: string` - тип отказа
- **Логика**: Устанавливает formType, очищает editingTemplate, открывает форму

#### handleEdit
- **Назначение**: Открытие формы редактирования шаблона
- **Параметры**: `template: RejectionTemplate` - шаблон для редактирования
- **Логика**: Устанавливает editingTemplate и formType, открывает форму

#### handleDelete
- **Назначение**: Удаление шаблона с подтверждением
- **Параметры**: `id: number`, `rejectionType?: string`
- **Логика**: Показывает Toast с подтверждением, при подтверждении удаляет шаблон из состояния

#### handleFormClose
- **Назначение**: Закрытие формы
- **Логика**: Закрывает форму, очищает editingTemplate и formType

#### handleFormSave
- **Назначение**: Сохранение шаблона после создания/редактирования
- **Логика**: Закрывает форму, обновляет список шаблонов (TODO: через API)

### GradeTemplatesTab

#### toggleSection
- **Назначение**: Переключение раскрытости секции грейда
- **Параметры**: `gradeId: number` - ID грейда
- **Логика**: Аналогично GeneralTemplatesTab

#### handleCreate, handleEdit, handleDelete, handleFormClose, handleFormSave
- **Логика**: Аналогично GeneralTemplatesTab, но для шаблонов по грейдам

### RejectionTemplateForm

#### handleSubmit
- **Назначение**: Обработка отправки формы
- **Параметры**: `e: React.FormEvent`
- **Логика**: 
  - Предотвращает стандартную отправку формы
  - Устанавливает loading в true
  - TODO: Отправка данных на сервер
  - Вызывает onSave после сохранения

#### handleChange
- **Назначение**: Обработка изменения полей формы
- **Логика**: Обновляет formData при изменении полей

### SlotsTab

#### handleChange
- **Назначение**: Обработка изменения полей настроек
- **Параметры**: `field: 'textBefore' | 'textAfter'`, `value: string`
- **Логика**: Обновляет settings и устанавливает hasChanges в true

#### handleSave
- **Назначение**: Сохранение настроек слотов
- **Логика**: 
  - TODO: Отправка на сервер
  - Устанавливает hasChanges в false
  - Показывает Toast с подтверждением

#### handleCancel
- **Назначение**: Отмена изменений
- **Логика**: Восстанавливает оригинальные настройки, устанавливает hasChanges в false

## Стили

### GeneralTemplatesTab.module.css
- Стили для секций, карточек шаблонов, кнопок

### GradeTemplatesTab.module.css
- Стили для секций, карточек шаблонов, кнопок

### RejectionTemplateForm.module.css
- `.formCard`: карточка формы
- `.formHeader`: заголовок формы
- Стили для полей формы, кнопок

### SlotsTab.module.css
- Стили для формы настроек, примера результата

## Использование

### Пример использования GeneralTemplatesTab:
```tsx
<GeneralTemplatesTab />
```

### Пример использования GradeTemplatesTab:
```tsx
<GradeTemplatesTab />
```

### Пример использования RejectionTemplateForm:
```tsx
<RejectionTemplateForm 
  template={editingTemplate}
  rejectionType="office_format"
  onSave={() => {
    // Обработка сохранения
  }}
  onCancel={() => {
    // Обработка отмены
  }}
/>
```

### Пример использования SlotsTab:
```tsx
<SlotsTab />
```

## TODO: Интеграция с API

1. ❌ Загрузка общих шаблонов из API
   - GET `/api/candidate-responses/templates/general/`
   - Возвращает: массив общих шаблонов

2. ❌ Загрузка шаблонов по грейдам из API
   - GET `/api/candidate-responses/templates/grades/`
   - Возвращает: массив шаблонов по грейдам

3. ❌ Создание шаблона через API
   - POST `/api/candidate-responses/templates/`
   - Параметры: rejection_type, grade_id (опционально), title, message, is_active

4. ❌ Обновление шаблона через API
   - PUT/PATCH `/api/candidate-responses/templates/{id}/`
   - Параметры: все поля шаблона

5. ❌ Удаление шаблона через API
   - DELETE `/api/candidate-responses/templates/{id}/`

6. ❌ Загрузка настроек слотов из API
   - GET `/api/candidate-responses/slots-settings/`
   - Возвращает: textBefore, textAfter

7. ❌ Сохранение настроек слотов через API
   - PUT `/api/candidate-responses/slots-settings/`
   - Параметры: textBefore, textAfter

8. ❌ Загрузка списка грейдов из API
   - GET `/api/grades/`
   - Использовать в RejectionTemplateForm

## Связи с другими компонентами

- Используется в `/app/candidate-responses/page.tsx` - основная страница управления шаблонами ответов
- Использует `useToast` из `@/components/Toast/ToastContext` для уведомлений
- RejectionTemplateForm используется в GeneralTemplatesTab и GradeTemplatesTab
