# Документация страницы: Настройка Huntflow (huntflow/page.tsx)

## Общее описание

Страница настройки интеграции с Huntflow. Позволяет настроить маппинг (связь) данных между HR Helper и Huntflow для синхронизации заявок, кандидатов, этапов найма и других данных между системами.

**Путь**: `/huntflow`

## Компоненты страницы

### 1. HuntflowPage (основной компонент)
- **Расположение**: `@/app/huntflow/page.tsx`
- **Назначение**: Главный компонент страницы настройки интеграции с Huntflow
- **Функциональность**: 
  - Управление маппингами данных между HR Helper и Huntflow
  - Отображение статуса подключения интеграции
  - Быстрые ссылки на связанные страницы настроек
  - Сохранение маппингов на сервер
- **Связи**: 
  - AppLayout: оборачивает страницу в общий layout
  - useRouter: для навигации к страницам настроек
  - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"

### 2. Статус подключения
- **Компонент**: Card с иконкой CheckCircledIcon
- **Назначение**: Отображение статуса подключения интеграции с Huntflow
- **Функциональность**: 
  - Показывает статус "Подключение активно" с зеленой иконкой
  - Отображает URL API: https://api.huntflow.ru/v2
- **TODO**: Реализовать проверку статуса через API

### 3. Быстрые ссылки
- **Компонент**: Card с кнопками навигации
- **Назначение**: Быстрый переход к связанным страницам настроек
- **Ссылки**:
  - **Вакансии** (`/vacancies`): настройка вакансий
  - **Грейды** (`/company-settings/grades`): настройка грейдов
  - **Этапы найма и причины отказа** (`/company-settings/recruiting/stages`): настройка этапов найма
  - **Дополнительные поля кандидатов** (`/company-settings/candidate-fields`): настройка полей кандидатов
- **Логика**: При клике на кнопку происходит переход на соответствующую страницу через router.push()

### 4. Маппинг организаций
- **Компонент**: Flex с Select для каждой организации
- **Назначение**: Связь организаций Huntflow с офисами HR Helper
- **Функциональность**: 
  - Отображает список организаций Huntflow
  - Для каждой организации позволяет выбрать офис HR Helper
  - Отображает связь в формате: "Организация Huntflow → Офис HR Helper"
- **Связи**: 
  - Использует MOCK_HUNTFLOW_ORGS (организации Huntflow)
  - Использует MOCK_OUR_OFFICES (офисы HR Helper)
- **TODO**: Загружать данные из API

### 5. Маппинг этапов найма
- **Компонент**: Table с Select в каждой строке
- **Назначение**: Связь этапов найма HR Helper с этапами Huntflow
- **Функциональность**: 
  - Отображает таблицу с колонками: "Этап найма", "Этап найма в Huntflow", "ID этапа в Huntflow"
  - Для каждого этапа HR Helper позволяет выбрать этап Huntflow
  - Отображает ID выбранного этапа Huntflow
  - Опция "—" для сброса маппинга
- **Связи**: 
  - Использует MOCK_OUR_STAGES (этапы HR Helper)
  - Использует MOCK_HUNTFLOW_STAGES (этапы Huntflow)
- **TODO**: Загружать данные из API

### 6. Маппинг причин отказа
- **Компонент**: Table с Select в каждой строке
- **Назначение**: Связь причин отказа HR Helper с причинами Huntflow
- **Функциональность**: 
  - Отображает таблицу с колонками: "Причина отказа", "Причина в Huntflow", "ID в Huntflow"
  - Для каждой причины отказа HR Helper позволяет выбрать причину Huntflow
  - Отображает ID выбранной причины Huntflow
  - Опция "—" для сброса маппинга
- **Связи**: 
  - Использует MOCK_OUR_REJECTION_REASONS (причины отказа HR Helper)
  - Использует MOCK_HF_REJECTION_REASONS (причины отказа Huntflow)
- **TODO**: Загружать данные из API

### 7. Маппинг дополнительных полей кандидата
- **Компонент**: Две Table (маппинг и справочная)
- **Назначение**: Связь дополнительных полей кандидата HR Helper с полями Huntflow
- **Функциональность**: 
  - Первая таблица: маппинг полей
    - Колонки: "Наше поле", "Поле в Huntflow", "ID в Huntflow"
    - Для каждого поля HR Helper позволяет выбрать поле Huntflow
    - Отображает ID выбранного поля Huntflow
  - Вторая таблица: справочная информация
    - Колонки: "Поле в Huntflow", "ID в Huntflow"
    - Отображает все доступные поля Huntflow для справки
- **Связи**: 
  - Использует MOCK_OUR_FIELDS (поля HR Helper)
  - Использует MOCK_HF_FIELDS (поля Huntflow)
- **TODO**: Загружать данные из API

### 8. Маппинг источников кандидатов
- **Компонент**: Две Table (маппинг и справочная)
- **Назначение**: Связь источников кандидатов HR Helper с источниками Huntflow
- **Функциональность**: 
  - Первая таблица: маппинг источников
    - Колонки: "Наш источник", "Источник в Huntflow", "ID в Huntflow"
    - Для каждого источника HR Helper позволяет выбрать источник Huntflow
    - Отображает ID выбранного источника Huntflow
  - Вторая таблица: справочная информация
    - Колонки: "Источник в Huntflow", "ID в Huntflow"
    - Отображает все доступные источники Huntflow для справки
- **Связи**: 
  - Использует MOCK_OUR_SOURCES (источники HR Helper)
  - Использует MOCK_HF_SOURCES (источники Huntflow)
- **TODO**: Загружать данные из API

## Интерфейсы и типы

### Организация Huntflow
```typescript
interface HuntflowOrg {
  id: number                    // ID организации в Huntflow
  name: string                  // Название организации
}
```

### Офис HR Helper
```typescript
interface OurOffice {
  id: string                    // ID офиса в HR Helper
  name: string                  // Название офиса
}
```

### Этап найма
```typescript
interface Stage {
  id: string | number           // ID этапа (string для HR Helper, number для Huntflow)
  name: string                  // Название этапа
}
```

### Причина отказа
```typescript
interface RejectionReason {
  id: string | number           // ID причины (string для HR Helper, number для Huntflow)
  name: string                  // Название причины
}
```

### Дополнительное поле кандидата
```typescript
interface CandidateField {
  id: string | number           // ID поля (string для HR Helper, number для Huntflow)
  name: string                  // Название поля
}
```

### Источник кандидата
```typescript
interface Source {
  id: string | number           // ID источника (string для HR Helper, number для Huntflow)
  name: string                  // Название источника
}
```

## Состояние компонента

### State переменные:
- `orgMapping` (Record<number, string>): маппинг организаций Huntflow на офисы HR Helper
  - Ключ: ID организации в Huntflow (number)
  - Значение: ID офиса в HR Helper (string)
  - Инициализация: первый офис для первой организации
  - Обновление: при выборе офиса для организации
- `stageMapping` (Record<string, string>): маппинг этапов найма
  - Ключ: ID этапа в HR Helper (string)
  - Значение: ID этапа в Huntflow (string, может быть NONE)
  - Инициализация: первый этап Huntflow для всех этапов HR Helper
  - Обновление: при выборе этапа Huntflow для этапа HR Helper
- `rejectionMapping` (Record<string, string>): маппинг причин отказа
  - Ключ: ID причины в HR Helper (string)
  - Значение: ID причины в Huntflow (string, может быть NONE)
  - Инициализация: NONE (не выбрано) для всех причин
  - Обновление: при выборе причины Huntflow для причины HR Helper
- `fieldMapping` (Record<string, string>): маппинг дополнительных полей
  - Ключ: ID поля в HR Helper (string)
  - Значение: ID поля в Huntflow (string, может быть NONE)
  - Инициализация: NONE (не выбрано) для всех полей
  - Обновление: при выборе поля Huntflow для поля HR Helper
- `sourceMapping` (Record<string, string>): маппинг источников
  - Ключ: ID источника в HR Helper (string)
  - Значение: ID источника в Huntflow (string, может быть NONE)
  - Инициализация: NONE (не выбрано) для всех источников
  - Обновление: при выборе источника Huntflow для источника HR Helper

### Hooks:
- `useRouter()`: программная навигация
  - Используется для: перехода на страницы настроек через быстрые ссылки

### Константы:
- `NONE = '__none__'`: константа для обозначения "не выбрано" в Select
  - Используется для: обозначения отсутствия маппинга
  - Причина: Radix UI Select не позволяет использовать пустую строку для сброса

## Функции и обработчики

### isEmpty(v)
- **Назначение**: Проверка, является ли значение пустым или "не выбрано"
- **Параметры**: 
  - `v`: string | undefined - значение для проверки
- **Возвращает**: boolean - true если значение пустое или NONE, иначе false
- **Логика**: 
  - Проверяет, является ли значение пустой строкой, undefined или NONE
- **Используется для**: 
  - Определения, установлен ли маппинг
  - Валидации маппингов перед отправкой на сервер

### getHfStageId(ourId)
- **Назначение**: Получение ID этапа Huntflow для этапа HR Helper
- **Параметры**: 
  - `ourId`: string - ID этапа в HR Helper
- **Возвращает**: number | null - ID этапа в Huntflow или null
- **Логика**: 
  1. Получает ID этапа Huntflow из stageMapping
  2. Проверяет, не пустое ли значение (isEmpty)
  3. Преобразует строку в число
  4. Возвращает null если маппинг не установлен
- **Используется для**: 
  - Синхронизации этапов при отправке данных в Huntflow
  - Отображения ID этапа в таблице маппинга

### getHfRejectionId(ourId)
- **Назначение**: Получение ID причины отказа Huntflow для причины HR Helper
- **Параметры**: 
  - `ourId`: string - ID причины отказа в HR Helper
- **Возвращает**: number | null - ID причины отказа в Huntflow или null
- **Логика**: 
  1. Получает ID причины отказа Huntflow из rejectionMapping
  2. Проверяет, не пустое ли значение (isEmpty)
  3. Преобразует строку в число
  4. Возвращает null если маппинг не установлен
- **Используется для**: 
  - Синхронизации причин отказа при отправке данных в Huntflow
  - Отображения ID причины в таблице маппинга

### getHfFieldId(ourId)
- **Назначение**: Получение ID поля Huntflow для поля HR Helper
- **Параметры**: 
  - `ourId`: string - ID поля в HR Helper
- **Возвращает**: number | null - ID поля в Huntflow или null
- **Логика**: 
  1. Получает ID поля Huntflow из fieldMapping
  2. Проверяет, не пустое ли значение (isEmpty)
  3. Преобразует строку в число
  4. Возвращает null если маппинг не установлен
- **Используется для**: 
  - Синхронизации полей кандидата при отправке данных в Huntflow
  - Отображения ID поля в таблице маппинга

### getHfSourceId(ourId)
- **Назначение**: Получение ID источника Huntflow для источника HR Helper
- **Параметры**: 
  - `ourId`: string - ID источника в HR Helper
- **Возвращает**: number | null - ID источника в Huntflow или null
- **Логика**: 
  1. Получает ID источника Huntflow из sourceMapping
  2. Проверяет, не пустое ли значение (isEmpty)
  3. Преобразует строку в число
  4. Возвращает null если маппинг не установлен
- **Используется для**: 
  - Синхронизации источников кандидатов при отправке данных в Huntflow
  - Отображения ID источника в таблице маппинга

### Обработчики изменения маппингов
- **orgMapping**: `setOrgMapping(m => ({ ...m, [org.id]: v }))`
  - Обновляет маппинг организации при выборе офиса
- **stageMapping**: `setStageMapping(m => ({ ...m, [s.id]: v }))`
  - Обновляет маппинг этапа при выборе этапа Huntflow
- **rejectionMapping**: `setRejectionMapping(m => ({ ...m, [r.id]: v }))`
  - Обновляет маппинг причины отказа при выборе причины Huntflow
- **fieldMapping**: `setFieldMapping(m => ({ ...m, [f.id]: v }))`
  - Обновляет маппинг поля при выборе поля Huntflow
- **sourceMapping**: `setSourceMapping(m => ({ ...m, [s.id]: v }))`
  - Обновляет маппинг источника при выборе источника Huntflow

### handleSaveMappings() (TODO)
- **Назначение**: Сохранение всех маппингов на сервер
- **Параметры**: Нет
- **Логика**: 
  1. Собирает все маппинги в один объект
  2. Отправляет на сервер через API
  3. Показывает toast об успехе/ошибке
- **Поведение**: 
  - Вызывается при клике на кнопку "Сохранить связи"
  - В текущей реализации не выполняет действий (TODO)
- **TODO**: Реализовать реальный API вызов

## Структура JSX

### HuntflowPage
- **AppLayout**: обертка страницы в общий layout
  - `pageTitle="Huntflow"`
- **Box.container**: основной контейнер страницы
- **Flex.topRow**: верхняя строка со статусом и быстрыми ссылками
  - **Card.statusCard**: карточка статуса подключения
    - Иконка CheckCircledIcon (зеленая)
    - Текст "Подключение активно"
    - URL API: https://api.huntflow.ru/v2
  - **Card.quickLinksCard**: карточка быстрых ссылок
    - Иконка ExternalLinkIcon и текст "Быстрые ссылки"
    - Кнопки навигации на связанные страницы
- **Card.formCard**: карточка с формой маппингов
  - Иконка Link2Icon и заголовок "Связи Huntflow ↔ HR Helper"
  - **Маппинг организаций**:
    - Заголовок: "Организация Huntflow → Подразделение / офис в HR Helper"
    - Для каждой организации: название организации, стрелка "→", Select для выбора офиса
  - **Маппинг этапов найма**:
    - Заголовок: "Этапы найма → Этапы в Huntflow"
    - Table с колонками: "Этап найма", "Этап найма в Huntflow", "ID этапа в Huntflow"
    - Для каждого этапа: название, Select для выбора этапа Huntflow, ID выбранного этапа
  - **Маппинг причин отказа**:
    - Заголовок: "Причины отказа → Причины в Huntflow"
    - Table с колонками: "Причина отказа", "Причина в Huntflow", "ID в Huntflow"
    - Для каждой причины: название, Select для выбора причины Huntflow, ID выбранной причины
  - **Маппинг дополнительных полей**:
    - Заголовок: "Дополнительные поля кандидата: наши поля → Huntflow"
    - Первая Table: маппинг полей
      - Колонки: "Наше поле", "Поле в Huntflow", "ID в Huntflow"
    - Вторая Table: справочная информация
      - Заголовок: "Все поля в Huntflow (справочно)"
      - Колонки: "Поле в Huntflow", "ID в Huntflow"
  - **Маппинг источников**:
    - Заголовок: "Источники: наши → Huntflow"
    - Первая Table: маппинг источников
      - Колонки: "Наш источник", "Источник в Huntflow", "ID в Huntflow"
    - Вторая Table: справочная информация
      - Заголовок: "Все источники в Huntflow (справочно)"
      - Колонки: "Источник в Huntflow", "ID в Huntflow"
  - **Callout**: информационное сообщение
    - Текст о настройке грейдов, этапов, причин отказа, полей и источников
  - **Button**: кнопка "Сохранить связи"
    - При клике: TODO - сохранить маппинги на сервер

## Маппинги данных

### 1. Маппинг организаций (orgMapping)
- **Назначение**: Связь организаций Huntflow с офисами HR Helper
- **Структура**: Record<number, string>
  - Ключ: ID организации в Huntflow (number)
  - Значение: ID офиса в HR Helper (string)
- **Использование**: 
  - При синхронизации заявок определяет, в какой офис HR Helper попадет заявка из Huntflow
  - При отправке заявок в Huntflow определяет, в какую организацию отправить заявку

### 2. Маппинг этапов найма (stageMapping)
- **Назначение**: Связь этапов найма HR Helper с этапами Huntflow
- **Структура**: Record<string, string>
  - Ключ: ID этапа в HR Helper (string)
  - Значение: ID этапа в Huntflow (string, может быть NONE)
- **Использование**: 
  - При синхронизации кандидатов определяет, на какой этап HR Helper попадет кандидат из Huntflow
  - При отправке данных в Huntflow определяет, на какой этап отправить кандидата

### 3. Маппинг причин отказа (rejectionMapping)
- **Назначение**: Связь причин отказа HR Helper с причинами Huntflow
- **Структура**: Record<string, string>
  - Ключ: ID причины в HR Helper (string)
  - Значение: ID причины в Huntflow (string, может быть NONE)
- **Использование**: 
  - При синхронизации отказов определяет, какую причину отказа HR Helper использовать для отказа из Huntflow
  - При отправке отказов в Huntflow определяет, какую причину отказа отправить

### 4. Маппинг дополнительных полей (fieldMapping)
- **Назначение**: Связь дополнительных полей кандидата HR Helper с полями Huntflow
- **Структура**: Record<string, string>
  - Ключ: ID поля в HR Helper (string)
  - Значение: ID поля в Huntflow (string, может быть NONE)
- **Использование**: 
  - При синхронизации кандидатов определяет, в какое поле HR Helper попадет значение из поля Huntflow
  - При отправке данных в Huntflow определяет, в какое поле отправить значение

### 5. Маппинг источников (sourceMapping)
- **Назначение**: Связь источников кандидатов HR Helper с источниками Huntflow
- **Структура**: Record<string, string>
  - Ключ: ID источника в HR Helper (string)
  - Значение: ID источника в Huntflow (string, может быть NONE)
- **Использование**: 
  - При синхронизации кандидатов определяет, какой источник HR Helper использовать для кандидата из Huntflow
  - При отправке данных в Huntflow определяет, какой источник отправить

## Моковые данные

### MOCK_HUNTFLOW_ORGS
- **Тип**: Array<{ id: number, name: string }>
- **Структура**: массив организаций Huntflow
- **Пример**: 
  ```typescript
  [
    { id: 291341, name: 'Softnetix' },
  ]
  ```
- **TODO**: Загружать из API Huntflow

### MOCK_OUR_OFFICES
- **Тип**: Array<{ id: string, name: string }>
- **Структура**: массив офисов HR Helper
- **Пример**: 
  ```typescript
  [
    { id: '1', name: 'Офис Минск' },
    { id: '2', name: 'Офис Варшава' },
  ]
  ```
- **TODO**: Загружать из настроек компании

### MOCK_OUR_STAGES
- **Тип**: Array<{ id: string, name: string }>
- **Структура**: массив этапов найма HR Helper
- **Пример**: 
  ```typescript
  [
    { id: '1', name: 'Заявка' },
    { id: '2', name: 'Скрининг' },
    { id: '3', name: 'Интервью' },
    { id: '4', name: 'Оффер' },
    { id: '5', name: 'Принят' },
    { id: '6', name: 'Отказ' },
  ]
  ```
- **TODO**: Загружать из `/company-settings/recruiting/stages`

### MOCK_HUNTFLOW_STAGES
- **Тип**: Array<{ id: number, name: string }>
- **Структура**: массив этапов найма Huntflow
- **Пример**: 
  ```typescript
  [
    { id: 101, name: 'Новый' },
    { id: 102, name: 'Скрининг' },
    { id: 103, name: 'Интервью' },
    { id: 104, name: 'Оффер' },
    { id: 105, name: 'Принят' },
    { id: 106, name: 'Отказ' },
    { id: 107, name: 'Архив' },
  ]
  ```
- **TODO**: Загружать из API Huntflow

### MOCK_OUR_REJECTION_REASONS
- **Тип**: Array<{ id: string, name: string }>
- **Структура**: массив причин отказа HR Helper
- **Пример**: 
  ```typescript
  [
    { id: 'r1', name: 'Не подходит по опыту' },
    { id: 'r2', name: 'Зарплатные ожидания' },
    { id: 'r3', name: 'Другая причина' },
  ]
  ```
- **TODO**: Загружать из `/company-settings/recruiting/stages`

### MOCK_HF_REJECTION_REASONS
- **Тип**: Array<{ id: number, name: string }>
- **Структура**: массив причин отказа Huntflow
- **Пример**: 
  ```typescript
  [
    { id: 201, name: 'Опыт не подходит' },
    { id: 202, name: 'ЗП' },
    { id: 203, name: 'Кандидат отказался' },
    { id: 204, name: 'Прочее' },
  ]
  ```
- **TODO**: Загружать из API Huntflow

### MOCK_OUR_FIELDS
- **Тип**: Array<{ id: string, name: string }>
- **Структура**: массив дополнительных полей кандидата HR Helper
- **Пример**: 
  ```typescript
  [
    { id: 'f1', name: 'Ожидания по ЗП' },
    { id: 'f2', name: 'Источник' },
    { id: 'f3', name: 'Готовность к релокации' },
    { id: 'f4', name: 'Грейд' },
  ]
  ```
- **TODO**: Загружать из `/company-settings/candidate-fields`

### MOCK_HF_FIELDS
- **Тип**: Array<{ id: number, name: string }>
- **Структура**: массив дополнительных полей кандидата Huntflow
- **Пример**: 
  ```typescript
  [
    { id: 301, name: 'Ожидания по ЗП' },
    { id: 302, name: 'Источник' },
    { id: 303, name: 'Релокация' },
    { id: 304, name: 'Уровень' },
    { id: 305, name: 'Ссылка на портфолио' },
    { id: 306, name: 'Комментарий рекрутера' },
  ]
  ```
- **TODO**: Загружать из API Huntflow

### MOCK_OUR_SOURCES
- **Тип**: Array<{ id: string, name: string }>
- **Структура**: массив источников кандидатов HR Helper
- **Пример**: 
  ```typescript
  [
    { id: 's1', name: 'hh.ru' },
    { id: 's2', name: 'Рекомендация' },
    { id: 's3', name: 'Прямой отклик' },
  ]
  ```
- **TODO**: Загружать из настроек компании

### MOCK_HF_SOURCES
- **Тип**: Array<{ id: number, name: string }>
- **Структура**: массив источников кандидатов Huntflow
- **Пример**: 
  ```typescript
  [
    { id: 401, name: 'HeadHunter' },
    { id: 402, name: 'Рекомендация сотрудника' },
    { id: 403, name: 'Сайт компании' },
    { id: 404, name: 'LinkedIn' },
    { id: 405, name: 'Другое' },
  ]
  ```
- **TODO**: Загружать из API Huntflow

### QUICK_LINKS
- **Тип**: Array<{ label: string, href: string, icon: IconComponent }>
- **Структура**: массив быстрых ссылок на связанные страницы
- **Значения**: 
  - { label: 'Вакансии', href: '/vacancies', icon: FileTextIcon }
  - { label: 'Грейды', href: '/company-settings/grades', icon: StarIcon }
  - { label: 'Этапы найма и причины отказа', href: '/company-settings/recruiting/stages', icon: MixerHorizontalIcon }
  - { label: 'Дополнительные поля кандидатов', href: '/company-settings/candidate-fields', icon: PersonIcon }

## TODO: Интеграция с API

1. ❌ Проверка статуса подключения через API
   - GET `/api/integrations/huntflow/status/` - проверка статуса подключения
   - Обновление статуса в карточке подключения

2. ❌ Загрузка организаций Huntflow из API
   - GET `/api/integrations/huntflow/organizations/` - получение списка организаций
   - Замена MOCK_HUNTFLOW_ORGS

3. ❌ Загрузка офисов HR Helper из API
   - GET `/api/company-settings/offices/` - получение списка офисов
   - Замена MOCK_OUR_OFFICES

4. ❌ Загрузка этапов найма HR Helper из API
   - GET `/api/company-settings/recruiting/stages/` - получение списка этапов
   - Замена MOCK_OUR_STAGES

5. ❌ Загрузка этапов найма Huntflow из API
   - GET `/api/integrations/huntflow/stages/` - получение списка этапов
   - Замена MOCK_HUNTFLOW_STAGES

6. ❌ Загрузка причин отказа HR Helper из API
   - GET `/api/company-settings/recruiting/rejection-reasons/` - получение списка причин
   - Замена MOCK_OUR_REJECTION_REASONS

7. ❌ Загрузка причин отказа Huntflow из API
   - GET `/api/integrations/huntflow/rejection-reasons/` - получение списка причин
   - Замена MOCK_HF_REJECTION_REASONS

8. ❌ Загрузка дополнительных полей HR Helper из API
   - GET `/api/company-settings/candidate-fields/` - получение списка полей
   - Замена MOCK_OUR_FIELDS

9. ❌ Загрузка дополнительных полей Huntflow из API
   - GET `/api/integrations/huntflow/fields/` - получение списка полей
   - Замена MOCK_HF_FIELDS

10. ❌ Загрузка источников HR Helper из API
    - GET `/api/company-settings/sources/` - получение списка источников
    - Замена MOCK_OUR_SOURCES

11. ❌ Загрузка источников Huntflow из API
    - GET `/api/integrations/huntflow/sources/` - получение списка источников
    - Замена MOCK_HF_SOURCES

12. ❌ Загрузка текущих маппингов из API
    - GET `/api/integrations/huntflow/mappings/` - получение всех маппингов
    - Инициализация состояния маппингов из API

13. ❌ Сохранение маппингов через API
    - PUT `/api/integrations/huntflow/mappings/` - сохранение всех маппингов
    - Параметры: объект со всеми маппингами
    - Обновление состояния после успешного сохранения

## Стили

### huntflow.module.css
- **Файл**: `@/app/huntflow/huntflow.module.css`
- **Основные классы**:
  - `.container` - основной контейнер страницы (flex, column, gap: 24px, padding: 0 24px)
  - `.topRow` - верхняя строка со статусом и быстрыми ссылками (gap: 24px)
  - `.statusCard` - карточка статуса подключения (background: gray-2, border-radius: 12px, padding: 20px, border)
  - `.quickLinksCard` - карточка быстрых ссылок (background: gray-2, border-radius: 12px, padding: 20px, border)
  - `.formCard` - карточка с формой маппингов (background: gray-2, border-radius: 12px, padding: 24px, border)
  - `.organizationCard` - карточка организации (background: gray-2, border-radius, padding, border)
  - `.organizationsHeader` - заголовок секции организаций (gradient фон, padding, border-radius)

## Связи с другими страницами

- `/vacancies` - настройка вакансий (быстрая ссылка)
- `/company-settings/grades` - настройка грейдов (быстрая ссылка)
- `/company-settings/recruiting/stages` - настройка этапов найма и причин отказа (быстрая ссылка)
- `/company-settings/candidate-fields` - настройка дополнительных полей кандидатов (быстрая ссылка)
- `/company-settings/integrations` - страница интеграций (содержит ссылку на эту страницу)

## Особенности

- Настройка маппинга данных между двумя системами (HR Helper и Huntflow)
- Пять типов маппингов: организации, этапы найма, причины отказа, дополнительные поля, источники
- Справочные таблицы для полей и источников Huntflow (показывают все доступные значения)
- Быстрые ссылки на связанные страницы настроек для удобной навигации
- Отображение статуса подключения интеграции
- Автоматическое отображение ID выбранных значений Huntflow
- Опция "—" для сброса маппинга (использует константу NONE)
- Маппинги используются при синхронизации данных с Huntflow
- Все маппинги сохраняются одной кнопкой "Сохранить связи"

## Безопасность

- Валидация маппингов на клиенте (проверка isEmpty)
- TODO: Валидация маппингов на сервере
- TODO: Проверка прав доступа к настройкам интеграции (только администраторы могут изменять)
- TODO: Защита от XSS в пользовательском вводе (санитизация HTML)
- TODO: Rate limiting для операций сохранения маппингов
- TODO: Аудит изменений маппингов (логирование всех изменений)## Производительность- Локальное состояние для управления маппингами (для моковых данных)
- TODO: Оптимизация загрузки данных (кэширование списков из Huntflow)
- TODO: Debounce для сохранения маппингов (автосохранение при изменении)
- TODO: Оптимизация рендеринга таблиц (виртуализация при большом количестве элементов)
