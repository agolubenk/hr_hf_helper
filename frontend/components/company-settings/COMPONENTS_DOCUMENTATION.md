# Документация компонентов: company-settings

## Общее описание

Директория `components/company-settings` содержит компоненты для управления настройками компании. Компоненты обеспечивают конфигурацию различных аспектов компании: общие настройки, грейды, этапы найма, SLA, поля кандидатов, промпты для вакансий, scorecard, жизненный цикл сотрудников, команды рекрутинга и доступы пользователей.

**Расположение**: `@/components/company-settings`

## Компоненты

### 1. GeneralSettings
- **Файл**: `GeneralSettings.tsx`
- **Назначение**: Компонент общих настроек компании
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Настройка названия компании
  - Настройка ссылки на календарь
  - Загрузка и отображение логотипа компании
  - Управление офисами компании:
    - Добавление нового офиса
    - Редактирование существующего офиса
    - Удаление офиса
    - Установка главного офиса
  - Inline редактирование офисов
- **Интерфейс Office**:
  - `id`: уникальный идентификатор
  - `address`: адрес офиса
  - `mapLink`: ссылка на карту
  - `country`: страна
  - `directions`: указания как добраться
  - `isMain`: главный офис
- **Особенности**: 
  - Загрузка логотипа через file input
  - Inline редактирование офисов (без модального окна)
  - Валидация обязательных полей при добавлении офиса
- **Используется в**: 
  - `/app/company-settings/page.tsx`: основная страница настроек компании

### 2. GradesSettings
- **Файл**: `GradesSettings.tsx`
- **Назначение**: Компонент управления грейдами компании
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение списка грейдов в таблице
  - Создание нового грейда
  - Редактирование существующего грейда
  - Удаление грейда
  - Изменение порядка грейдов (перемещение вверх/вниз)
  - Управление дополнительными полями грейдов
  - Добавление новых дополнительных полей
- **Интерфейс Grade**:
  - `id`: уникальный идентификатор
  - `order`: порядок отображения
  - `name`: название грейда
  - `category`: категория (опционально)
  - `level`: уровень (опционально)
  - `comment`: комментарий (опционально)
  - `additionalFields`: дополнительные поля (опционально)
- **Особенности**: 
  - Использует GradeForm для создания/редактирования
  - Кнопки перемещения вверх/вниз для изменения порядка
  - Управление дополнительными полями
- **Используется в**: 
  - `/app/company-settings/grades/page.tsx`: страница управления грейдами

### 3. GradeForm
- **Файл**: `GradeForm.tsx`
- **Назначение**: Форма создания/редактирования грейда
- **Пропсы**:
  - `initialData`: начальные данные грейда (Grade | null)
  - `additionalFields`: массив дополнительных полей (AdditionalField[])
  - `onSave`: обработчик сохранения ((data: Grade) => void)
  - `onCancel`: обработчик отмены (() => void)
  - `isCreating`: флаг создания нового грейда (boolean)
- **Функциональность**: 
  - Поля формы:
    - Название грейда (TextField)
    - Категория (TextField, опционально)
    - Уровень (TextField, опционально)
    - Комментарий (TextArea, опционально)
    - Дополнительные поля (динамические TextField)
  - Валидация обязательных полей
  - Сохранение через onSave
- **Используется в**: 
  - GradesSettings: для создания/редактирования грейдов

### 4. RecruitingStagesSettings
- **Файл**: `RecruitingStagesSettings.tsx`
- **Назначение**: Компонент управления этапами найма
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение списка этапов найма в таблице
  - Создание нового этапа
  - Редактирование существующего этапа
  - Удаление этапа (кнопки удаления убраны из таблицы этапов найма)
  - Управление причинами отказа:
    - Создание новой причины отказа
    - Редактирование причины отказа
    - Удаление причины отказа
  - Связывание этапов с причинами отказа
  - Настройка автоматического перехода
  - Настройка цвета этапа
  - **Настройка этапов-встреч**:
    - Метка "встреча" (`isMeeting`): чекбокс в модальном окне редактирования этапа
    - Если чекбокс "встреча" активен, появляется дополнительная карточка "Настройки встречи"
    - В карточке "Настройки встречи":
      - "Отображать офисы?" (да/нет) - настройка `showOffices`
        - Если "Да", то в панели настроек встречи будет выбор формата (Онлайн/Офис) и выбор офиса при выборе "Офис"
        - Если "Нет", то по определению используется только онлайн
      - "Отображать интервьюеров?" (да/нет) - настройка `showInterviewers`
        - Если "Да", то в панели настроек встречи будет выбор интервьюеров
- **Интерфейс HiringStage**:
  - `id`: уникальный идентификатор
  - `name`: название этапа
  - `order`: порядок отображения
  - `color`: цвет этапа (hex)
  - `description`: описание (опционально)
  - `autoTransition`: автоматический переход (опционально)
  - `rejectionReasonIds`: массив ID причин отказа (опционально)
  - `isMeeting`: метка "встреча" - этап используется в тогглере на странице `/workflow` и `/recr-chat` (опционально)
  - `showOffices`: отображать офисы для этапа-встречи (да/нет) (опционально)
  - `showInterviewers`: отображать интервьюеров для этапа-встречи (да/нет) (опционально)
- **Интерфейс RejectionReason**:
  - `id`: уникальный идентификатор
  - `name`: название причины
  - `description`: описание (опционально)
- **Особенности**: 
  - Две вкладки: "Этапы найма" и "Причины отказа"
  - Цветовая индикация этапов
  - Связывание этапов с причинами отказа через чекбоксы
  - Кнопка "Добавить этап" убрана (создание этапов происходит на другой странице)
  - Кнопки "Удалить" убраны из таблицы этапов найма (удаление происходит на другой странице)
  - Этапы с `isMeeting = true` используются в тогглере на странице `/workflow` и `/recr-chat`
  - Названия этапов-встреч становятся названиями кнопок в тогглере
  - Настройки `showOffices` и `showInterviewers` определяют содержимое панели настроек встречи
- **Связи**:
  - `/workflow`: этапы-встречи используются для формирования тогглера типа процесса
  - `/recr-chat`: этапы-встречи используются для формирования тогглера типа процесса
  - WorkflowHeader: использует этапы-встречи для динамического формирования кнопок
  - VacancyEditModal: использует настройки этапов для управления форматом встречи
- **Используется в**: 
  - `/app/company-settings/recruiting/stages/page.tsx`: страница управления этапами найма

### 5. RecruitingCommandsSettings
- **Файл**: `RecruitingCommandsSettings.tsx`
- **Назначение**: Компонент управления командами для workflow чата
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - **Просмотр команд**: Отображение списка всех настроенных команд в таблице с индикатором загрузки
  - **Создание команды**: Диалог с формой для создания новой команды
  - **Редактирование команды**: Диалог с предзаполненной формой для редактирования существующей команды
  - **Удаление команды**: Удаление с подтверждением через showWarning с действиями
  - **Связывание с этапами**: Выбор этапа найма из блока "Рекрутинг" (загружается из API)
  - **Выбор типа действия**: Выбор из предопределенных типов действий (hrscreening, tech_screening, final_interview, invite)
  - **Настройка цвета**: Выбор цвета команды через color picker и текстовое поле (hex формат)
  - **Настройка описания**: Опциональное описание команды для справки
  - **Валидация**: Проверка уникальности команды, обязательных полей, формата команды
- **Состояние компонента**:
  - `commands: Command[]` - список всех команд компании (загружается из API)
  - `stages: Stage[]` - список этапов найма из блока "Рекрутинг" (загружается из API)
  - `loading: boolean` - флаг загрузки команд (показывается индикатор загрузки)
  - `editingCommand: Command | null` - команда для редактирования (null при создании новой)
  - `showDialog: boolean` - флаг отображения диалога создания/редактирования
  - `formData: Partial<Command>` - данные формы для создания/редактирования
- **Обработчики событий**:
  - `handleCreate()` - открытие диалога создания новой команды, сброс формы
  - `handleEdit(command)` - открытие диалога редактирования, заполнение формы данными команды
  - `handleDelete(commandId)` - удаление команды с подтверждением через showWarning
  - `handleSave()` - валидация и сохранение команды (создание или обновление)
  - `handleCancel()` - отмена редактирования, закрытие диалога, сброс формы
- **Жизненный цикл**:
  - При монтировании: загружаются этапы найма (useEffect)
  - При монтировании: загружаются команды (useEffect)
  - При изменении формы: обновляется formData
  - При сохранении: обновляется commands
- **Валидация**:
  - Команда должна начинаться с "/"
  - Команда должна быть уникальной в рамках компании
  - Тип действия обязателен
  - Цвет обязателен
- **API интеграция (TODO)**:
  - `GET /api/company-settings/employee-lifecycle/stages/?block_id=recruiting` - загрузка этапов
  - `GET /api/company-settings/recruiting/commands/` - загрузка команд
  - `POST /api/company-settings/recruiting/commands/` - создание команды
  - `PUT /api/company-settings/recruiting/commands/{id}/` - обновление команды
  - `DELETE /api/company-settings/recruiting/commands/{id}/` - удаление команды
- **Интерфейс Command**:
  - `id`: уникальный идентификатор
  - `command`: текст команды (например, "/s", "/t", "/in")
  - `actionType`: тип действия (hrscreening, tech_screening, final_interview, invite)
  - `stageId`: ID этапа найма (опционально)
  - `color`: цвет команды (hex)
  - `description`: описание (опционально)
  - `order`: порядок отображения
- **Типы действий**:
  - `hrscreening`: HR скрининг
  - `tech_screening`: Технический скрининг
  - `final_interview`: Финальное интервью
  - `invite`: Приглашение на интервью
- **Особенности**: 
  - Команды /add и /del не отображаются в списке (системные команды)
  - Команды должны начинаться с "/"
  - Каждая команда связана с типом действия (обязательно) и этапом найма (опционально)
  - Цвет команды используется для визуального отображения в workflow чате
  - Команды уникальны в рамках компании
  - Подтверждение удаления через showWarning с кнопками "Отмена" и "Удалить"
- **Используется в**: 
  - `/app/company-settings/recruiting/commands/page.tsx`: страница управления командами

### 6. SLASettings
- **Файл**: `SLASettings.tsx`
- **Назначение**: Компонент управления SLA (Service Level Agreement) для вакансий
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение списка SLA в таблице
  - Фильтрация по вакансии и грейду
  - Поиск по вакансии
  - Создание нового SLA
  - Редактирование существующего SLA
  - Удаление SLA
  - Пагинация для больших списков
  - Экспорт в Excel
  - Импорт из Excel
- **Интерфейс SLA**:
  - `id`: уникальный идентификатор
  - `vacancy`: название вакансии
  - `grade`: название грейда
  - `timeToOffer`: время до оффера (дни)
  - `timeToHire`: время до найма (дни)
  - `status`: статус (active | inactive)
  - `createdAt`: дата создания
- **Особенности**: 
  - Использует SLAEditModal для создания/редактирования
  - Пагинация с кнопками навигации
  - Фильтры по вакансии и грейду
  - Экспорт/импорт в Excel (TODO)
- **Используется в**: 
  - `/app/company-settings/sla/page.tsx`: страница управления SLA

### 7. SLAEditModal
- **Файл**: `SLAEditModal.tsx`
- **Назначение**: Модальное окно создания/редактирования SLA
- **Пропсы**:
  - `sla`: существующий SLA для редактирования (SLA | null)
  - `isOpen`: флаг открытости (boolean)
  - `onClose`: обработчик закрытия (() => void)
  - `onSave`: обработчик сохранения ((sla: SLA) => void)
- **Функциональность**: 
  - Поля формы:
    - Вакансия (Select)
    - Грейд (Select)
    - Время до оффера (TextField, число)
    - Время до найма (TextField, число)
    - Статус (Switch)
  - Валидация полей
  - Сохранение через onSave
- **Используется в**: 
  - SLASettings: для создания/редактирования SLA

### 8. CandidateFieldsSettings
- **Файл**: `CandidateFieldsSettings.tsx`
- **Назначение**: Компонент управления дополнительными полями кандидатов
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение списка полей в таблице
  - Создание нового поля
  - Редактирование существующего поля
  - Удаление поля
  - Изменение порядка полей (перемещение вверх/вниз)
  - Настройка типа поля
  - Настройка обязательности поля
  - Настройка опций для select полей
- **Интерфейс CandidateField**:
  - `id`: уникальный идентификатор
  - `name`: название поля
  - `type`: тип поля (text, number, select, date, textarea, url)
  - `required`: обязательное поле (boolean)
  - `order`: порядок отображения
  - `options`: массив опций (для типа select)
  - `placeholder`: placeholder (опционально)
- **Типы полей**:
  - `text`: Текст
  - `number`: Число
  - `select`: Выпадающий список
  - `date`: Дата
  - `textarea`: Многострочный текст
  - `url`: Ссылка
- **Особенности**: 
  - Модальное окно для создания/редактирования
  - Управление опциями для select полей
  - Кнопки перемещения вверх/вниз
- **Используется в**: 
  - `/app/company-settings/candidate-fields/page.tsx`: страница управления полями кандидатов

### 9. VacancyPromptSettings
- **Файл**: `VacancyPromptSettings.tsx`
- **Назначение**: Компонент настройки промпта для анализа вакансий
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Редактирование промпта для AI анализа вакансий
  - Переключение активности промпта
  - Сохранение изменений
  - Отмена изменений
  - Отображение истории изменений промпта
  - Индикатор несохраненных изменений
- **Интерфейс PromptHistory**:
  - `id`: уникальный идентификатор
  - `prompt`: текст промпта
  - `isActive`: активен ли промпт
  - `updatedAt`: дата обновления
  - `updatedBy`: кто обновил
- **Особенности**: 
  - Отслеживание изменений (hasChanges)
  - История версий промпта
  - Форматирование даты обновления
- **Используется в**: 
  - `/app/company-settings/vacancy-prompt/page.tsx`: страница настройки промпта

### 10. ScorecardSettings
- **Файл**: `ScorecardSettings.tsx`
- **Назначение**: Компонент управления критериями scorecard
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение иерархической структуры критериев
  - Создание нового критерия
  - Редактирование существующего критерия
  - Удаление критерия
  - Изменение порядка критериев (перемещение вверх/вниз)
  - Создание вложенных критериев (дочерние элементы)
  - Управление описанием критерия с паттернами
  - Вставка паттернов в описание (переменные)
- **Интерфейс ScorecardCriteria**:
  - `id`: уникальный идентификатор
  - `name`: название критерия
  - `description`: описание с паттернами (опционально)
  - `order`: порядок отображения
  - `children`: массив дочерних критериев (опционально)
  - `parentId`: ID родительского критерия (опционально)
- **Паттерны для вставки**:
  - Текст: `[text]`
  - Вакансия: `[vacancy_title]`, `[vacancy_id]`
  - Кандидат: `[candidate_lastname]`, `[candidate_firstname]`, `[candidate_patronymic]`, `[candidate_id]`
  - Грейд: `[grade]`
  - Дата и время: множество вариантов (день, месяц, год, день недели)
  - Интервьюер: `[interviewer_name]`
- **Особенности**: 
  - Иерархическая структура критериев
  - Вставка паттернов через Popover
  - Перемещение критериев вверх/вниз
  - Модальное окно для создания/редактирования
- **Используется в**: 
  - `/app/company-settings/scorecard/page.tsx`: страница управления scorecard

### 11. EmployeeLifecycleSettings
- **Файл**: `EmployeeLifecycleSettings.tsx`
- **Назначение**: Компонент управления жизненным циклом сотрудников
- **Пропсы**: Нет (использует внутреннее состояние)
- **Функциональность**: 
  - Отображение этапов жизненного цикла, сгруппированных по блокам
  - Создание нового этапа
  - Редактирование названия этапа (inline)
  - Удаление этапа
  - Перемещение этапов между блоками (drag-and-drop)
  - Изменение порядка этапов внутри блока (drag-and-drop)
  - Управление порядком этапов (глобальная нумерация)
- **Интерфейс LifecycleStage**:
  - `id`: уникальный идентификатор
  - `name`: название этапа
  - `blockId`: ID блока (recruiting, onboarding, employee, blacklist)
  - `order`: порядок внутри блока
  - `isSystem`: системный этап (нельзя удалить)
- **Интерфейс LifecycleBlock**:
  - `id`: уникальный идентификатор блока
  - `name`: название блока
- **Блоки**:
  - `recruiting`: Рекрутинг
  - `onboarding`: Онбординг
  - `employee`: Работник
  - `blacklist`: ЧС (Черный список)
- **Особенности**: 
  - Использует @dnd-kit для drag-and-drop
  - Глобальная нумерация этапов (сквозная по блокам)
  - В блоке "ЧС" порядок всегда 0
  - Системные этапы нельзя удалить
  - Inline редактирование названий
- **Используется в**: 
  - `/app/company-settings/employee-lifecycle/page.tsx`: страница управления жизненным циклом

### 12. UserAccessModal
- **Файл**: `UserAccessModal.tsx`
- **Назначение**: Модальное окно управления доступом пользователя
- **Пропсы**:
  - `userId`: ID пользователя (string)
  - `isOpen`: флаг открытости (boolean)
  - `onClose`: обработчик закрытия (() => void)
- **Функциональность**: 
  - Отображение модулей приложения с чекбоксами
  - Управление доступом к модулям
  - Управление доступом к приложениям внутри модулей
  - Сохранение настроек доступа
- **Структура модулей**:
  - Модули приложения (например, "Рекрутинг", "Финансы", и т.д.)
  - Приложения внутри модулей (подмодули)
- **Особенности**: 
  - Иерархическая структура модулей и приложений
  - Чекбоксы для включения/отключения доступа
  - Сохранение через API (TODO)
- **Используется в**: 
  - Страницы управления пользователями: для настройки доступа конкретного пользователя

### 13. GroupAccessModal
- **Файл**: `GroupAccessModal.tsx`
- **Назначение**: Модальное окно управления доступом группы пользователей
- **Пропсы**:
  - `open`: флаг открытости модального окна (boolean)
  - `onOpenChange`: обработчик изменения состояния открытости ((open: boolean) => void)
  - `groupName`: название группы пользователей для отображения в заголовке (string)
  - `initialApplications`: начальный список доступных приложений (string[], опционально)
  - `initialAccess`: начальные права доступа к модулям приложения (AccessRights | undefined)
  - `initialATSAccess`: начальные детальные права доступа для ATS (ATSAccessRights, опционально)
  - `initialRecruitingSettingsAccess`: начальные детальные права доступа для настроек рекрутинга (RecruitingSettingsAccessRights, опционально)
  - `onApply`: обработчик применения изменений ((applications: string[], access: AccessRights, atsAccess?: ATSAccessRights, recruitingSettingsAccess?: RecruitingSettingsAccessRights) => void)
- **Функциональность**: 
  - Управление доступными приложениями/интеграциями для группы
  - Настройка прав доступа к модулям приложения (просмотр/редактирование)
  - Детальная настройка прав доступа для ATS (блок Рекрутинг):
    - Условия оффера (просмотр/редактирование)
    - Условия ЗП (просмотр/редактирование)
    - Дополнительные поля (просмотр/редактирование)
    - Соцсети и мессенджеры (просмотр/редактирование)
    - Метки (просмотр/редактирование)
    - История (просмотр/редактирование)
    - Источник (просмотр/редактирование)
    - Статусы (просмотр/изменение)
    - Комментарии (просмотр/комментирование)
  - Детальная настройка прав доступа для настроек рекрутинга:
    - Правила привлечения (просмотр/редактирование)
    - Этапы найма и причины отказа (просмотр/редактирование)
    - Команды workflow (просмотр/редактирование)
    - Дополнительные поля кандидатов (просмотр/редактирование)
    - Scorecard (просмотр/редактирование)
    - SLA (просмотр/редактирование)
    - Единый промпт для вакансий (просмотр/редактирование)
    - Шаблон оффера (просмотр/редактирование)
    - Ответы кандидатам (просмотр/редактирование)
  - Автоматическое включение просмотра при включении редактирования
  - Автоматическое раскрытие детальных настроек при наличии доступа к соответствующему модулю
- **Состояние компонента**:
  - `applications`: массив идентификаторов доступных приложений
  - `access`: права доступа к модулям приложения (AccessRights)
  - `atsAccess`: детальные права доступа для ATS (ATSAccessRights)
  - `recruitingSettingsAccess`: детальные права доступа для настроек рекрутинга (RecruitingSettingsAccessRights)
  - `showATSAccess`: флаг отображения детальных настроек ATS
  - `showRecruitingSettingsAccess`: флаг отображения детальных настроек рекрутинга
- **Обработчики событий**:
  - `toggleApplication`: переключение доступности приложения для группы
  - `setNode`: установка права доступа для модуля
  - `handleApply`: применение изменений и закрытие модального окна
  - `setATSAccessField`: установка значения поля детальных прав доступа для ATS с автоматическим включением просмотра
  - `setRecruitingSettingsAccessField`: установка значения поля детальных прав доступа для настроек рекрутинга с автоматическим включением просмотра
- **Жизненный цикл**:
  1. При открытии модального окна (open = true) инициализируются все состояния из initial* пропсов
  2. Автоматически раскрываются детальные настройки, если есть соответствующий доступ
  3. При изменении прав доступа применяется логика автоматического включения просмотра при включении редактирования
  4. При нажатии "Применить" вызывается onApply с обновленными данными
- **Логика автоматического включения просмотра**:
  - При включении любого `edit*` поля автоматически включается соответствующее `view*` поле
  - При включении `changeStatus` автоматически включается `viewStatus`
  - При включении `comment` автоматически включается `viewComment`
- **Особенности**: 
  - Все чекбоксы доступны для взаимодействия (нет disabled состояний)
  - Детальные настройки ATS раскрываются кнопкой рядом с модулем "Рекрутинг"
  - Детальные настройки рекрутинга раскрываются кнопкой рядом с подразделом "Настройки рекрутинга"
  - При включении доступа к модулю "Рекрутинг" автоматически раскрываются детальные настройки ATS
  - При включении доступа к "Настройкам рекрутинга" автоматически раскрываются детальные настройки рекрутинга
- **Используется в**: 
  - `/app/company-settings/user-groups/page.tsx`: страница управления группами пользователей для настройки прав доступа групп

## Интерфейсы и типы

### Office (GeneralSettings)
```typescript
interface Office {
  id: number
  address: string
  mapLink: string
  country: string
  directions: string
  isMain: boolean
}
```

### Grade (GradesSettings, GradeForm)
```typescript
interface Grade {
  id: number
  order: number
  name: string
  category?: string
  level?: string
  comment?: string
  additionalFields?: { [fieldId: string]: string }
}
```

### AdditionalField (GradesSettings)
```typescript
interface AdditionalField {
  id: string
  name: string
}
```

### HiringStage (RecruitingStagesSettings)
```typescript
interface HiringStage {
  id: string
  name: string
  order: number
  color: string
  description?: string
  autoTransition?: boolean
  rejectionReasonIds?: string[]
}
```

### RejectionReason (RecruitingStagesSettings)
```typescript
interface RejectionReason {
  id: string
  name: string
  description?: string
}
```

### Command (RecruitingCommandsSettings)
```typescript
interface Command {
  id: string
  command: string              // Например, "/s", "/t", "/in"
  actionType: string           // hrscreening, tech_screening, final_interview, invite
  stageId?: string             // ID этапа найма (опционально)
  color: string                // Цвет команды (hex)
  description?: string
  order: number
}
```

### ActionType (RecruitingCommandsSettings)
```typescript
type ActionType = 'hrscreening' | 'tech_screening' | 'final_interview' | 'invite'
```

### AccessRights (GroupAccessModal)
```typescript
type AccessRights = Record<string, { view: boolean; edit: boolean }>
```
Базовые права доступа к модулям приложения. Ключ - идентификатор модуля, значение - объект с правами просмотра и редактирования.

### ATSAccessRights (GroupAccessModal)
```typescript
type ATSAccessRights = {
  viewOfferConditions: boolean      // Видеть условия оффера
  editOfferConditions: boolean       // Редактировать условия оффера
  viewSalaryConditions: boolean      // Видеть условия ЗП
  editSalaryConditions: boolean       // Редактировать условия ЗП
  viewAdditionalFields: boolean      // Видеть дополнительные поля
  editAdditionalFields: boolean       // Редактировать дополнительные поля
  viewSocialMedia: boolean            // Видеть соцсети и мессенджеры
  editSocialMedia: boolean            // Редактировать соцсети и мессенджеры
  viewTags: boolean                   // Видеть метки
  editTags: boolean                   // Редактировать метки
  viewHistory: boolean                // Видеть историю
  editHistory: boolean                // Редактировать историю
  viewSource: boolean                 // Видеть источник
  editSource: boolean                 // Редактировать источник
  viewStatus: boolean                 // Видеть статусы кандидатов
  changeStatus: boolean               // Изменять статусы кандидатов
  viewComment: boolean                // Видеть комментарии
  comment: boolean                    // Комментировать кандидатов
}
```
Детальные права доступа для ATS (блок Рекрутинг). При включении редактирования автоматически включается просмотр.

### RecruitingSettingsAccessRights (GroupAccessModal)
```typescript
type RecruitingSettingsAccessRights = {
  viewRules: boolean                 // Видеть правила привлечения
  editRules: boolean                  // Редактировать правила привлечения
  viewStages: boolean                 // Видеть этапы найма и причины отказа
  editStages: boolean                 // Редактировать этапы найма и причины отказа
  viewCommands: boolean               // Видеть команды workflow
  editCommands: boolean               // Редактировать команды workflow
  viewCandidateFields: boolean        // Видеть дополнительные поля кандидатов
  editCandidateFields: boolean        // Редактировать дополнительные поля кандидатов
  viewScorecard: boolean               // Видеть scorecard
  editScorecard: boolean              // Редактировать scorecard
  viewSLA: boolean                     // Видеть SLA
  editSLA: boolean                    // Редактировать SLA
  viewVacancyPrompt: boolean           // Видеть единый промпт для вакансий
  editVacancyPrompt: boolean          // Редактировать единый промпт для вакансий
  viewOfferTemplate: boolean           // Видеть шаблон оффера
  editOfferTemplate: boolean          // Редактировать шаблон оффера
  viewCandidateResponses: boolean      // Видеть ответы кандидатам
  editCandidateResponses: boolean    // Редактировать ответы кандидатам
}
```
Детальные права доступа для настроек рекрутинга. При включении редактирования автоматически включается просмотр.

### Application (GroupAccessModal)
```typescript
interface Application {
  id: string                          // Уникальный идентификатор приложения
  name: string                        // Название приложения
  description?: string                // Описание приложения (опционально)
}
```
Интерфейс приложения/интеграции, доступной для группы пользователей.

### ModuleItem (GroupAccessModal)
```typescript
interface ModuleItem {
  id: string                          // Уникальный идентификатор модуля
  label: string                       // Название модуля для отображения
  children?: { id: string; label: string }[]  // Массив подразделов модуля (опционально)
}
```
Интерфейс модуля приложения с возможными подразделами.

### SLA (SLASettings, SLAEditModal)
```typescript
interface SLA {
  id: string
  vacancy: string
  grade: string
  timeToOffer: number          // дни
  timeToHire: number           // дни
  status: 'active' | 'inactive'
  createdAt: string
}
```

### CandidateField (CandidateFieldsSettings)
```typescript
interface CandidateField {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'url'
  required: boolean
  order: number
  options?: string[]           // Для типа select
  placeholder?: string
}
```

### PromptHistory (VacancyPromptSettings)
```typescript
interface PromptHistory {
  id: number
  prompt: string
  isActive: boolean
  updatedAt: string
  updatedBy: string
}
```

### ScorecardCriteria (ScorecardSettings)
```typescript
interface ScorecardCriteria {
  id: string
  name: string
  description?: string
  order: number
  children?: ScorecardCriteria[]
  parentId?: string
}
```

### Pattern (ScorecardSettings)
```typescript
interface Pattern {
  id: string
  label: string
  value: string                // Например, "[candidate_firstname]"
  icon?: React.ReactNode
  category: string
}
```

### LifecycleStage (EmployeeLifecycleSettings)
```typescript
interface LifecycleStage {
  id: string
  name: string
  blockId: string              // recruiting, onboarding, employee, blacklist
  order: number
  isSystem: boolean
}
```

### LifecycleBlock (EmployeeLifecycleSettings)
```typescript
interface LifecycleBlock {
  id: string
  name: string
}
```

## Функции и обработчики

### GeneralSettings

#### handleSetMainOffice
- **Назначение**: Установка главного офиса
- **Параметры**: `id: number`
- **Логика**: Устанавливает isMain=true для выбранного офиса, false для остальных

#### handleAddOffice
- **Назначение**: Добавление нового офиса
- **Логика**: 
  - Валидация обязательных полей (address, mapLink)
  - Создание нового офиса с уникальным ID
  - Если нет главного офиса - устанавливает новый как главный
  - Очищает форму

#### handleEditOffice
- **Назначение**: Начало редактирования офиса
- **Параметры**: `id: number`
- **Логика**: Устанавливает editingOfficeId

#### handleSaveOffice
- **Назначение**: Сохранение изменений офиса
- **Параметры**: `id: number`, `updatedOffice: Partial<Office>`
- **Логика**: Обновляет офис в массиве offices

#### handleDeleteOffice
- **Назначение**: Удаление офиса
- **Параметры**: `id: number`
- **Логика**: Удаляет офис из массива offices

#### handleFileChange
- **Назначение**: Обработка загрузки логотипа
- **Логика**: 
  - Читает файл через FileReader
  - Устанавливает logo как data URL
  - TODO: Загрузка на сервер

#### handleSaveAll
- **Назначение**: Сохранение всех настроек
- **Логика**: 
  - TODO: Отправка на сервер
  - Показывает Toast с подтверждением

### GradesSettings

#### handleMoveUp, handleMoveDown
- **Назначение**: Изменение порядка грейдов
- **Логика**: Перемещает грейд вверх/вниз и обновляет order

#### handleAddField
- **Назначение**: Добавление нового дополнительного поля
- **Логика**: Добавляет поле в массив additionalFields

#### handleDeleteField
- **Назначение**: Удаление дополнительного поля
- **Параметры**: `id: string`
- **Логика**: Удаляет поле из массива additionalFields

### RecruitingStagesSettings

#### handleAddStage, handleEditStage, handleDeleteStage
- **Логика**: Аналогично другим компонентам управления списками

#### handleAddRejectionReason, handleEditRejectionReason, handleDeleteRejectionReason
- **Логика**: Управление причинами отказа

### RecruitingCommandsSettings

#### handleAddCommand, handleEditCommand, handleDeleteCommand
- **Логика**: Управление командами
- **Особенности**: 
  - Валидация уникальности команд
  - Команды должны начинаться с "/"

### SLASettings

#### handleFilterChange
- **Назначение**: Изменение фильтров
- **Логика**: Обновляет filteredSLAs на основе фильтров

#### handlePageChange
- **Назначение**: Изменение страницы пагинации
- **Логика**: Обновляет currentPage и пересчитывает отображаемые SLA

### CandidateFieldsSettings

#### handleMoveUp, handleMoveDown
- **Назначение**: Изменение порядка полей
- **Логика**: Аналогично GradesSettings

#### handleAddOption, handleRemoveOption
- **Назначение**: Управление опциями для select полей
- **Логика**: Добавляет/удаляет опции в массив options

### VacancyPromptSettings

#### handleSave
- **Назначение**: Сохранение промпта
- **Логика**: 
  - Добавляет новую запись в историю
  - TODO: Отправка на сервер
  - Устанавливает hasChanges в false

#### handleCancel
- **Назначение**: Отмена изменений
- **Логика**: Восстанавливает оригинальные значения

### ScorecardSettings

#### handleAddCriteria, handleEditCriteria, handleDeleteCriteria
- **Логика**: Управление критериями
- **Особенности**: 
  - Поддержка иерархической структуры
  - Управление дочерними критериями

#### handleInsertPattern
- **Назначение**: Вставка паттерна в описание
- **Логика**: Вставляет значение паттерна в текущую позицию курсора

### EmployeeLifecycleSettings

#### handleDragEnd
- **Назначение**: Обработка завершения drag-and-drop
- **Логика**: 
  - Определяет новый блок и порядок этапа
  - Обновляет stages с новым порядком
  - Пересчитывает глобальный порядок

#### handleStartRename, handleSaveRename, handleCancelRename
- **Назначение**: Inline редактирование названия этапа
- **Логика**: Управление состоянием редактирования

## Стили

### GeneralSettings.module.css
- Стили для формы, карточек офисов, кнопок

### GradesSettings.module.css
- Стили для таблицы грейдов, кнопок перемещения

### RecruitingStagesSettings.module.css
- Стили для таблиц этапов и причин отказа

### RecruitingCommandsSettings.module.css
- Стили для таблицы команд

### SLASettings.module.css
- Стили для таблицы SLA, фильтров, пагинации

### SLAEditModal.module.css
- Стили для модального окна SLA

### CandidateFieldsSettings.module.css
- Стили для таблицы полей

### VacancyPromptSettings.module.css
- Стили для формы промпта, истории

### ScorecardSettings.module.css
- Стили для иерархического списка критериев

### EmployeeLifecycleSettings.module.css
- Стили для блоков этапов, drag-and-drop

## Использование

### Пример использования GeneralSettings:
```tsx
<GeneralSettings />
```

### Пример использования GradesSettings:
```tsx
<GradesSettings />
```

### Пример использования RecruitingCommandsSettings:
```tsx
<RecruitingCommandsSettings />
```

## TODO: Интеграция с API

1. ❌ Загрузка общих настроек компании из API
2. ❌ Сохранение общих настроек через API
3. ❌ Загрузка списка грейдов из API
4. ❌ Сохранение грейдов через API
5. ❌ Загрузка этапов найма из API
6. ❌ Сохранение этапов найма через API
7. ❌ Загрузка команд из API
8. ❌ Сохранение команд через API
9. ❌ Загрузка SLA из API
10. ❌ Сохранение SLA через API
11. ❌ Загрузка полей кандидатов из API
12. ❌ Сохранение полей кандидатов через API
13. ❌ Загрузка промпта вакансии из API
14. ❌ Сохранение промпта вакансии через API
15. ❌ Загрузка критериев scorecard из API
16. ❌ Сохранение критериев scorecard через API
17. ❌ Загрузка этапов жизненного цикла из API
18. ❌ Сохранение этапов жизненного цикла через API
19. ❌ Загрузка настроек доступа пользователя/группы из API
20. ❌ Сохранение настроек доступа через API

## Связи с другими компонентами

- Используется в различных страницах `/app/company-settings/*`
- Использует `useToast` из `@/components/Toast/ToastContext` для уведомлений
- Использует `@dnd-kit` для drag-and-drop в EmployeeLifecycleSettings
- GradeForm используется в GradesSettings
- SLAEditModal используется в SLASettings
- UserAccessModal и GroupAccessModal используются на страницах управления пользователями и группами

### AccessRights (GroupAccessModal)
```typescript
type AccessRights = Record<string, { view: boolean; edit: boolean }>
```
Базовые права доступа к модулям приложения. Ключ - идентификатор модуля, значение - объект с правами просмотра и редактирования.

### ATSAccessRights (GroupAccessModal)
```typescript
type ATSAccessRights = {
  viewOfferConditions: boolean      // Видеть условия оффера
  editOfferConditions: boolean       // Редактировать условия оффера
  viewSalaryConditions: boolean      // Видеть условия ЗП
  editSalaryConditions: boolean       // Редактировать условия ЗП
  viewAdditionalFields: boolean      // Видеть дополнительные поля
  editAdditionalFields: boolean       // Редактировать дополнительные поля
  viewSocialMedia: boolean            // Видеть соцсети и мессенджеры
  editSocialMedia: boolean            // Редактировать соцсети и мессенджеры
  viewTags: boolean                   // Видеть метки
  editTags: boolean                   // Редактировать метки
  viewHistory: boolean                // Видеть историю
  editHistory: boolean                // Редактировать историю
  viewSource: boolean                 // Видеть источник
  editSource: boolean                 // Редактировать источник
  viewStatus: boolean                 // Видеть статусы кандидатов
  changeStatus: boolean               // Изменять статусы кандидатов
  viewComment: boolean                // Видеть комментарии
  comment: boolean                    // Комментировать кандидатов
}
```
Детальные права доступа для ATS (блок Рекрутинг). При включении редактирования автоматически включается просмотр.

### RecruitingSettingsAccessRights (GroupAccessModal)
```typescript
type RecruitingSettingsAccessRights = {
  viewRules: boolean                 // Видеть правила привлечения
  editRules: boolean                  // Редактировать правила привлечения
  viewStages: boolean                 // Видеть этапы найма и причины отказа
  editStages: boolean                 // Редактировать этапы найма и причины отказа
  viewCommands: boolean               // Видеть команды workflow
  editCommands: boolean               // Редактировать команды workflow
  viewCandidateFields: boolean        // Видеть дополнительные поля кандидатов
  editCandidateFields: boolean        // Редактировать дополнительные поля кандидатов
  viewScorecard: boolean               // Видеть scorecard
  editScorecard: boolean              // Редактировать scorecard
  viewSLA: boolean                     // Видеть SLA
  editSLA: boolean                    // Редактировать SLA
  viewVacancyPrompt: boolean           // Видеть единый промпт для вакансий
  editVacancyPrompt: boolean          // Редактировать единый промпт для вакансий
  viewOfferTemplate: boolean           // Видеть шаблон оффера
  editOfferTemplate: boolean          // Редактировать шаблон оффера
  viewCandidateResponses: boolean      // Видеть ответы кандидатам
  editCandidateResponses: boolean    // Редактировать ответы кандидатам
}
```
Детальные права доступа для настроек рекрутинга. При включении редактирования автоматически включается просмотр.

### Application (GroupAccessModal)
```typescript
interface Application {
  id: string                          // Уникальный идентификатор приложения
  name: string                        // Название приложения
  description?: string                // Описание приложения (опционально)
}
```
Интерфейс приложения/интеграции, доступной для группы пользователей.

### ModuleItem (GroupAccessModal)
```typescript
interface ModuleItem {
  id: string                          // Уникальный идентификатор модуля
  label: string                       // Название модуля для отображения
  children?: { id: string; label: string }[]  // Массив подразделов модуля (опционально)
}
```
Интерфейс модуля приложения с возможными подразделами.
