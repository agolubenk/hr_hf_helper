/**
 * RecruitingCommandsSettings - компонент управления командами для workflow чата
 * 
 * Назначение:
 * - Отображение списка команд
 * - Создание, редактирование и удаление команд
 * - Связывание команд с этапами найма и типами команд (анализ/событие)
 * - Настройка цветов и описаний команд
 * - Управление режимом работы команд (строгое совпадение/любая раскладка)
 * 
 * Функциональность:
 * - Список команд с возможностью редактирования и удаления
 * - Форма создания/редактирования команды
 * - Выбор типа команды (анализ или событие)
 * - Выбор этапа найма (обязательно)
 * - Тогглер режима раскладки (строгое совпадение/любая раскладка)
 * - Настройка цвета команды (для отображения в чате)
 * - Валидация уникальности команд с учетом раскладки
 * - Описание системных команд /add и /del
 * 
 * Особенности:
 * - Команды /add и /del не отображаются в списке (системные), но описаны в интерфейсе
 * - Команды должны начинаться с "/"
 * - Каждая команда связана с одним этапом найма (обязательно)
 * - Команды не могут повторяться (одну и ту же или подобную, но с другой раскладкой, если включен тогглер "любая раскладка")
 * - Типы команд: анализ (analysis) и событие (event)
 * 
 * TODO:
 * - Загружать список этапов найма из API
 * - Сохранять команды через API
 * - Валидация уникальности команд на сервере
 */

'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Dialog, Select, Switch } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './RecruitingCommandsSettings.module.css'

/**
 * Command - интерфейс команды
 * 
 * @property id - уникальный идентификатор команды
 * @property command - текст команды (например, "/s", "/t", "/in")
 * @property commandType - тип команды: "analysis" (анализ) или "event" (событие)
 * @property stageId - ID этапа найма (обязательно)
 * @property allowAnyLayout - разрешить работу команды в любой раскладке клавиатуры
 * @property color - цвет команды для отображения в чате (hex)
 * @property description - описание команды
 * @property order - порядок отображения команды
 */
interface Command {
  id: string
  command: string // Например, "/s", "/t", "/in"
  commandType: 'analysis' | 'event' // Тип команды: анализ или событие
  stageId: string // ID этапа найма (обязательно)
  allowAnyLayout: boolean // Разрешить работу в любой раскладке
  color: string // Цвет для отображения в чате
  description?: string
  order: number
}

/**
 * Stage - интерфейс этапа найма
 */
interface Stage {
  id: string
  name: string
  description?: string
}


/**
 * Типы команд с описаниями
 */
const commandTypes: { value: 'analysis' | 'event'; label: string; description: string }[] = [
  { value: 'analysis', label: 'Анализ', description: 'Команда для анализа кандидата (например, HR скрининг)' },
  { value: 'event', label: 'Событие', description: 'Команда для создания события (например, интервью, приглашение)' },
]

/**
 * Маппинг раскладок клавиатуры (русская <-> английская)
 * Используется для проверки уникальности команд с учетом раскладки
 */
const layoutMap: Record<string, string> = {
  // Русские -> Английские
  'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
  'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
  'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
  'б': ',', 'ю': '.',
  // Английские -> Русские
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
  '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
  'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
  ',': 'б', '.': 'ю',
}

/**
 * convertToOtherLayout - конвертирует строку в другую раскладку клавиатуры
 * 
 * @param text - текст для конвертации
 * @returns текст в другой раскладке
 */
function convertToOtherLayout(text: string): string {
  return text
    .split('')
    .map(char => {
      const lower = char.toLowerCase()
      if (layoutMap[lower]) {
        return char === lower ? layoutMap[lower] : layoutMap[lower].toUpperCase()
      }
      return char
    })
    .join('')
}

/**
 * checkCommandUniqueness - проверяет уникальность команды с учетом раскладки
 * 
 * Если allowAnyLayout = true, то команда должна быть уникальной
 * как в текущей раскладке, так и в другой раскладке.
 * 
 * @param command - текст команды
 * @param allowAnyLayout - разрешить работу в любой раскладке
 * @param existingCommands - существующие команды
 * @param excludeId - ID команды, которую нужно исключить из проверки (при редактировании)
 * @returns true если команда уникальна, false если есть дубликат
 */
function checkCommandUniqueness(
  command: string,
  allowAnyLayout: boolean,
  existingCommands: Command[],
  excludeId?: string
): { isUnique: boolean; duplicateCommand?: Command } {
  // Проверка точного совпадения
  const exactMatch = existingCommands.find(
    cmd => cmd.command === command && cmd.id !== excludeId
  )
  if (exactMatch) {
    return { isUnique: false, duplicateCommand: exactMatch }
  }

  // Если включен режим "любая раскладка", проверяем также другую раскладку
  if (allowAnyLayout) {
    const otherLayoutCommand = convertToOtherLayout(command)
    const otherLayoutMatch = existingCommands.find(
      cmd => cmd.command === otherLayoutCommand && cmd.id !== excludeId
    )
    if (otherLayoutMatch) {
      return { isUnique: false, duplicateCommand: otherLayoutMatch }
    }

    // Также проверяем, нет ли существующих команд с allowAnyLayout=true,
    // которые совпадают с нашей командой в любой раскладке
    for (const existingCmd of existingCommands) {
      if (existingCmd.id === excludeId) continue
      if (!existingCmd.allowAnyLayout) continue

      const existingOtherLayout = convertToOtherLayout(existingCmd.command)
      if (existingCmd.command === command || existingOtherLayout === command) {
        return { isUnique: false, duplicateCommand: existingCmd }
      }
    }
  } else {
    // Если режим "строгое совпадение", проверяем, нет ли команды с allowAnyLayout=true,
    // которая совпадает с нашей в любой раскладке
    for (const existingCmd of existingCommands) {
      if (existingCmd.id === excludeId) continue
      if (!existingCmd.allowAnyLayout) continue

      const existingOtherLayout = convertToOtherLayout(existingCmd.command)
      if (existingCmd.command === command || existingOtherLayout === command) {
        return { isUnique: false, duplicateCommand: existingCmd }
      }
    }
  }

  return { isUnique: true }
}

/**
 * RecruitingCommandsSettings - компонент управления командами для workflow чата
 * 
 * Компонент предоставляет полный функционал для управления командами, используемыми
 * в workflow чате для создания различных действий (HR скрининг, технический скрининг,
 * интервью, приглашения).
 * 
 * Основные возможности:
 * - Просмотр списка всех настроенных команд
 * - Создание новых команд с настройкой параметров
 * - Редактирование существующих команд
 * - Удаление команд с подтверждением
 * - Связывание команд с этапами найма из жизненного цикла
 * - Настройка цветов команд для визуального отображения в чате
 * 
 * Состояние компонента:
 * - commands: массив всех команд компании (загружается из API)
 * - stages: массив этапов найма из блока "Рекрутинг" (загружается из API)
 * - loading: флаг загрузки данных (true во время загрузки команд)
 * - editingCommand: команда, которая редактируется (null если создается новая)
 * - showDialog: флаг отображения диалога создания/редактирования
 * - formData: данные формы для создания/редактирования команды
 * 
 * Жизненный цикл:
 * 1. При монтировании компонента загружаются этапы найма (useEffect)
 * 2. При монтировании компонента загружаются команды (useEffect)
 * 3. При изменении данных формы обновляется состояние formData
 * 4. При сохранении команды обновляется список commands
 * 
 * Валидация:
 * - Команда должна начинаться с "/"
 * - Команда должна быть уникальной в рамках компании
 * - Тип действия обязателен
 * - Цвет обязателен
 * 
 * API интеграция (TODO):
 * - GET /api/company-settings/employee-lifecycle/stages/?block_id=recruiting - загрузка этапов
 * - GET /api/company-settings/recruiting/commands/ - загрузка команд
 * - POST /api/company-settings/recruiting/commands/ - создание команды
 * - PUT /api/company-settings/recruiting/commands/{id}/ - обновление команды
 * - DELETE /api/company-settings/recruiting/commands/{id}/ - удаление команды
 * 
 * Использование:
 * Компонент используется на странице /company-settings/recruiting/commands
 * для настройки команд workflow чата.
 */
export default function RecruitingCommandsSettings() {
  /**
   * commands - список всех команд компании
   * 
   * Загружается из API при монтировании компонента.
   * Обновляется при создании, редактировании или удалении команд.
   * Используется для отображения в таблице команд.
   */
  const [commands, setCommands] = useState<Command[]>([])

  /**
   * stages - список этапов найма из блока "Рекрутинг"
   * 
   * Загружается из API при монтировании компонента.
   * Используется для выбора этапа при создании/редактировании команды.
   * Этапы берутся из lifecycle_stages с block_id='recruiting'.
   */
  const [stages, setStages] = useState<Stage[]>([])

  /**
   * loading - состояние загрузки команд
   * 
   * true: данные загружаются, показывается индикатор загрузки
   * false: данные загружены, отображается таблица команд или сообщение об отсутствии команд
   */
  const [loading, setLoading] = useState(true)

  /**
   * editingCommand - команда, которая редактируется
   * 
   * null: создается новая команда
   * Command: редактируется существующая команда
   * Используется для определения режима работы диалога (создание/редактирование)
   */
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)

  /**
   * showDialog - флаг отображения диалога создания/редактирования
   * 
   * true: диалог открыт
   * false: диалог закрыт
   */
  const [showDialog, setShowDialog] = useState(false)

  /**
   * formData - данные формы для создания/редактирования команды
   * 
   * Содержит все поля команды:
   * - command: текст команды (например, "/s")
   * - commandType: тип команды (analysis или event)
   * - stageId: ID этапа найма (обязательно)
   * - allowAnyLayout: разрешить работу в любой раскладке
   * - color: цвет команды в hex формате
   * - description: описание команды (опционально)
   */
  const [formData, setFormData] = useState<Partial<Command>>({
    command: '',
    commandType: 'analysis',
    stageId: undefined,
    allowAnyLayout: false,
    color: '#3B82F6',
    description: '',
  })

  /**
   * Toast уведомления
   * 
   * showSuccess: показ успешного уведомления (зеленое)
   * showError: показ ошибки (красное)
   * showWarning: показ предупреждения с действиями (желтое, с кнопками)
   */
  const { showSuccess, showError, showWarning } = useToast()

  /**
   * useEffect для загрузки этапов рекрутинга
   * 
   * Выполняется один раз при монтировании компонента.
   * Загружает этапы жизненного цикла из блока "Рекрутинг" для использования
   * в выпадающем списке при создании/редактировании команды.
   * 
   * Зависимости: [showError] - для показа ошибок при загрузке
   * 
   * TODO: Заменить моковые данные на реальный API вызов:
   * GET /api/company-settings/employee-lifecycle/stages/?block_id=recruiting
   * 
   * Ожидаемый формат ответа:
   * [
   *   { id: string, name: string, description?: string },
   *   ...
   * ]
   */
  useEffect(() => {
    const loadStages = async () => {
      try {
        // TODO: Заменить на реальный API вызов
        // const response = await fetch('/api/company-settings/employee-lifecycle/stages/?block_id=recruiting')
        // if (!response.ok) throw new Error('Failed to load stages')
        // const data = await response.json()
        // setStages(data)
        
        // Временные моковые данные для разработки
        const mockStages: Stage[] = [
          { id: 'hr-screening', name: 'HR Screening', description: 'HR скрининг' },
          { id: 'tech-screening', name: 'Tech Screening', description: 'Технический скрининг' },
          { id: 'final-interview', name: 'Final Interview', description: 'Финальное интервью' },
          { id: 'interview', name: 'Interview', description: 'Интервью' },
          { id: 'offer', name: 'Offer', description: 'Предложение' },
        ]
        setStages(mockStages)
      } catch (error) {
        console.error('Ошибка загрузки этапов:', error)
        showError('Ошибка', 'Не удалось загрузить этапы найма')
      }
    }

    loadStages()
  }, [showError])

  /**
   * useEffect для загрузки команд
   * 
   * Выполняется один раз при монтировании компонента.
   * Загружает список всех команд для текущей компании из API.
   * 
   * Процесс:
   * 1. Устанавливает loading в true (показывается индикатор загрузки)
   * 2. Выполняет запрос к API
   * 3. Обновляет состояние commands с полученными данными
   * 4. Устанавливает loading в false (скрывается индикатор загрузки)
   * 
   * Зависимости: [showError] - для показа ошибок при загрузке
   * 
   * TODO: Заменить моковые данные на реальный API вызов:
   * GET /api/company-settings/recruiting/commands/
   * 
   * Ожидаемый формат ответа:
   * [
   *   {
   *     id: string,
   *     command: string,
   *     actionType: string,
   *     stageId?: string,
   *     color: string,
   *     description?: string,
   *     order: number
   *   },
   *   ...
   * ]
   */
  useEffect(() => {
    const loadCommands = async () => {
      try {
        setLoading(true)
        // TODO: Заменить на реальный API вызов
        // const response = await fetch('/api/company-settings/recruiting/commands/')
        // if (!response.ok) throw new Error('Failed to load commands')
        // const data = await response.json()
        // setCommands(data)
        
        // Временные моковые данные для разработки
        const mockCommands: Command[] = [
          {
            id: '1',
            command: '/s',
            commandType: 'analysis',
            stageId: 'hr-screening',
            allowAnyLayout: false,
            color: '#22C55E',
            description: 'HR скрининг кандидата',
            order: 1,
          },
          {
            id: '2',
            command: '/t',
            commandType: 'event',
            stageId: 'tech-screening',
            allowAnyLayout: false,
            color: '#F97316',
            description: 'Технический скрининг',
            order: 2,
          },
          {
            id: '3',
            command: '/in',
            commandType: 'event',
            stageId: 'final-interview',
            allowAnyLayout: false,
            color: '#6366F1',
            description: 'Финальное интервью',
            order: 3,
          },
        ]
        setCommands(mockCommands)
      } catch (error) {
        console.error('Ошибка загрузки команд:', error)
        showError('Ошибка', 'Не удалось загрузить команды')
      } finally {
        setLoading(false)
      }
    }

    loadCommands()
  }, [showError])

  /**
   * handleCreate - обработчик создания новой команды
   * 
   * Функциональность:
   * - Сбрасывает форму
   * - Открывает диалог создания
   */
  const handleCreate = () => {
    setEditingCommand(null)
    setFormData({
      command: '',
      commandType: 'analysis',
      stageId: stages.length > 0 ? stages[0].id : undefined,
      allowAnyLayout: false,
      color: '#3B82F6',
      description: '',
    })
    setShowDialog(true)
  }

  /**
   * handleEdit - обработчик редактирования команды
   * 
   * @param command - команда для редактирования
   */
  const handleEdit = (command: Command) => {
    setEditingCommand(command)
    setFormData({
      command: command.command,
      commandType: command.commandType,
      stageId: command.stageId,
      allowAnyLayout: command.allowAnyLayout,
      color: command.color,
      description: command.description || '',
    })
    setShowDialog(true)
  }

  /**
   * handleDelete - обработчик удаления команды
   * 
   * @param commandId - ID команды для удаления
   */
  const handleDelete = (commandId: string) => {
    const command = commands.find(cmd => cmd.id === commandId)
    if (!command) return

    showWarning(
      'Удалить команду?',
      `Вы уверены, что хотите удалить команду "${command.command}"? Это действие нельзя отменить.`,
      {
        actions: [
          {
            label: 'Отмена',
            onClick: () => {},
            variant: 'soft',
            color: 'gray',
          },
          {
            label: 'Удалить',
            onClick: async () => {
              try {
                // TODO: Заменить на реальный API вызов
                // DELETE /api/company-settings/recruiting/commands/{id}/
                setCommands(commands.filter(cmd => cmd.id !== commandId))
                showSuccess('Команда удалена', 'Команда успешно удалена из списка')
              } catch (error) {
                console.error('Ошибка удаления команды:', error)
                showError('Ошибка', 'Не удалось удалить команду')
              }
            },
            variant: 'solid',
            color: 'red',
          },
        ],
      }
    )
  }

  /**
   * handleSave - обработчик сохранения команды
   * 
   * Выполняет полный цикл сохранения команды:
   * 1. Валидация данных формы
   * 2. Проверка уникальности команды
   * 3. Отправка запроса на сервер (создание или обновление)
   * 4. Обновление локального состояния
   * 5. Показ уведомления об успехе
   * 6. Закрытие диалога
   * 
   * Валидация:
   * - Команда должна начинаться с "/"
   * - Тип действия обязателен
   * - Команда должна быть уникальной (не должна совпадать с существующими)
   * 
   * Режимы работы:
   * - Если editingCommand !== null: обновление существующей команды
   * - Если editingCommand === null: создание новой команды
   * 
   * TODO: Заменить локальное обновление на реальные API вызовы:
   * - PUT /api/company-settings/recruiting/commands/{id}/ (для обновления)
   * - POST /api/company-settings/recruiting/commands/ (для создания)
   * 
   * Ожидаемый формат запроса:
   * {
   *   command: string,
   *   actionType: string,
   *   stageId?: string,
   *   color: string,
   *   description?: string
   * }
   * 
   * Ожидаемый формат ответа:
   * {
   *   id: string,
   *   command: string,
   *   actionType: string,
   *   stageId?: string,
   *   color: string,
   *   description?: string,
   *   order: number
   * }
   */
  const handleSave = () => {
    // Валидация: команда должна начинаться с "/"
    if (!formData.command || !formData.command.startsWith('/')) {
      showError('Ошибка валидации', 'Команда должна начинаться с "/"')
      return
    }

    // Валидация: тип команды обязателен
    if (!formData.commandType) {
      showError('Ошибка валидации', 'Выберите тип команды')
      return
    }

    // Валидация: этап найма обязателен
    if (!formData.stageId) {
      showError('Ошибка валидации', 'Выберите этап найма')
      return
    }

    // Проверка уникальности команды с учетом раскладки
    const uniquenessCheck = checkCommandUniqueness(
      formData.command,
      formData.allowAnyLayout || false,
      commands,
      editingCommand?.id
    )
    if (!uniquenessCheck.isUnique) {
      const duplicate = uniquenessCheck.duplicateCommand!
      const layoutInfo = duplicate.allowAnyLayout ? ' (с учетом любой раскладки)' : ''
      showError(
        'Ошибка валидации',
        `Команда "${duplicate.command}" уже существует${layoutInfo}. Команды не могут повторяться.`
      )
      return
    }

    // Сохранение команды
    try {
      if (editingCommand) {
        // Режим редактирования: обновление существующей команды
        // TODO: Заменить на реальный API вызов
        // const response = await fetch(`/api/company-settings/recruiting/commands/${editingCommand.id}/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     command: formData.command,
        //     actionType: formData.actionType,
        //     stageId: formData.stageId,
        //     color: formData.color,
        //     description: formData.description,
        //   }),
        // })
        // if (!response.ok) throw new Error('Failed to update command')
        // const updatedCommand = await response.json()
        
        // Временное локальное обновление для разработки
        const updatedCommand: Command = {
          ...editingCommand,
          command: formData.command!,
          commandType: formData.commandType!,
          stageId: formData.stageId!,
          allowAnyLayout: formData.allowAnyLayout || false,
          color: formData.color!,
          description: formData.description,
        }
        setCommands(
          commands.map(cmd =>
            cmd.id === editingCommand.id ? updatedCommand : cmd
          )
        )
        showSuccess('Команда обновлена', 'Команда успешно обновлена')
      } else {
        // Режим создания: создание новой команды
        // TODO: Заменить на реальный API вызов
        // const response = await fetch('/api/company-settings/recruiting/commands/', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     command: formData.command,
        //     actionType: formData.actionType,
        //     stageId: formData.stageId,
        //     color: formData.color,
        //     description: formData.description,
        //   }),
        // })
        // if (!response.ok) throw new Error('Failed to create command')
        // const newCommand = await response.json()
        
        // Временное локальное создание для разработки
        const newCommand: Command = {
          id: Date.now().toString(), // Временный ID, на сервере будет UUID
          command: formData.command!,
          commandType: formData.commandType!,
          stageId: formData.stageId!,
          allowAnyLayout: formData.allowAnyLayout || false,
          color: formData.color!,
          description: formData.description,
          order: commands.length + 1, // Порядок определяется на сервере
        }
        setCommands([...commands, newCommand])
        showSuccess('Команда создана', 'Команда успешно создана')
      }
    } catch (error) {
      console.error('Ошибка сохранения команды:', error)
      showError('Ошибка', 'Не удалось сохранить команду')
      return
    }

    // Закрытие диалога после успешного сохранения
    setShowDialog(false)
  }

  /**
   * handleCancel - обработчик отмены редактирования команды
   * 
   * Функциональность:
   * - Закрывает диалог создания/редактирования
   * - Сбрасывает состояние редактирования
   * - Очищает форму
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Отмена"
   * - Закрывает диалог
   * - Сбрасывает editingCommand в null
   * - Очищает formData до значений по умолчанию
   */
  const handleCancel = () => {
    setShowDialog(false)
    setEditingCommand(null)
    setFormData({
      command: '',
      commandType: 'analysis',
      stageId: stages.length > 0 ? stages[0].id : undefined,
      allowAnyLayout: false,
      color: '#3B82F6',
      description: '',
    })
  }

  return (
    <Box>
      {/* Заголовок и кнопка создания */}
      <Flex justify="between" align="center" mb="4">
        <Text size="3" color="gray">
          Настройте команды для workflow чата. Команды /add и /del являются системными.
        </Text>
        <Button onClick={handleCreate}>
          <PlusIcon width="16" height="16" />
          Создать команду
        </Button>
      </Flex>

      {/* Описание системных команд */}
      <Card mb="4">
        <Flex direction="column" gap="3">
          <Text size="3" weight="bold">Системные команды</Text>
          <Box>
            <Text size="2" weight="bold" style={{ fontFamily: 'monospace' }}>/add</Text>
            <Text size="2" color="gray" ml="2">
              Автоматически добавляется при прикреплении файла. Используется для добавления кандидата из файла.
              Команда работает только с прикрепленным файлом.
            </Text>
          </Box>
          <Box>
            <Text size="2" weight="bold" style={{ fontFamily: 'monospace' }}>/del</Text>
            <Text size="2" color="gray" ml="2">
              Команда удаления последнего действия. Используется для отката последнего действия в чате.
              Работает только как команда (без дополнительного сообщения).
            </Text>
          </Box>
        </Flex>
      </Card>

      {/* Таблица команд */}
      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Команда</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Тип команды</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Этап найма</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Раскладка</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Цвет</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="100">Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                  <Text color="gray">Загрузка команд...</Text>
                </Table.Cell>
              </Table.Row>
            ) : commands.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                  <Text color="gray">Нет команд. Создайте первую команду.</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              commands.map(command => (
                <Table.Row key={command.id}>
                  <Table.Cell>
                    <Text weight="bold" style={{ fontFamily: 'monospace' }}>
                      {command.command}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {commandTypes.find(ct => ct.value === command.commandType)?.label || command.commandType}
                  </Table.Cell>
                  <Table.Cell>
                    {stages.find(s => s.id === command.stageId)?.name || command.stageId}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color={command.allowAnyLayout ? 'green' : 'gray'}>
                      {command.allowAnyLayout ? 'Любая раскладка' : 'Строгое совпадение'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <Box
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          backgroundColor: command.color,
                          border: '1px solid var(--gray-6)',
                        }}
                      />
                      <Text size="1" style={{ fontFamily: 'monospace' }}>
                        {command.color}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">
                      {command.description || '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleEdit(command)}
                      >
                        <Pencil2Icon width="14" height="14" />
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => handleDelete(command.id)}
                      >
                        <TrashIcon width="14" height="14" />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Диалог создания/редактирования команды */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>
            {editingCommand ? 'Редактировать команду' : 'Создать команду'}
          </Dialog.Title>

          <Flex direction="column" gap="4" mt="4">
            {/* Поле команды */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Команда *
              </Text>
              <TextField.Root
                value={formData.command || ''}
                onChange={e => setFormData({ ...formData, command: e.target.value })}
                placeholder="/s"
                style={{ fontFamily: 'monospace' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Команда должна начинаться с "/"
              </Text>
            </Box>

            {/* Выбор типа команды */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Тип команды *
              </Text>
              <Select.Root
                value={formData.commandType}
                onValueChange={value => setFormData({ ...formData, commandType: value as 'analysis' | 'event' })}
              >
                <Select.Trigger />
                <Select.Content>
                  {commandTypes.map(commandType => (
                    <Select.Item key={commandType.value} value={commandType.value}>
                      {commandType.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                {commandTypes.find(ct => ct.value === formData.commandType)?.description}
              </Text>
            </Box>

            {/* Выбор этапа найма */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Этап найма *
              </Text>
              {stages.length === 0 ? (
                <Text size="2" color="gray">
                  Загрузка этапов...
                </Text>
              ) : (
                <Select.Root
                  value={formData.stageId || stages[0].id}
                  onValueChange={value => setFormData({ ...formData, stageId: value })}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {stages.map(stage => (
                      <Select.Item key={stage.id} value={stage.id}>
                        {stage.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Свяжите команду с этапом найма для автоматического перехода
              </Text>
            </Box>

            {/* Тогглер раскладки */}
            <Box>
              <Flex align="center" gap="2" mb="2">
                <Switch
                  checked={formData.allowAnyLayout || false}
                  onCheckedChange={checked => setFormData({ ...formData, allowAnyLayout: checked })}
                />
                <Text size="2" weight="bold">
                  Любая раскладка
                </Text>
              </Flex>
              <Text size="1" color="gray" mt="1" style={{ display: 'block', marginLeft: '28px' }}>
                {formData.allowAnyLayout
                  ? 'Команда будет работать независимо от раскладки клавиатуры (например, /s и /ы будут считаться одной командой)'
                  : 'Команда будет работать только при точном совпадении (например, /s и /ы будут разными командами)'}
              </Text>
            </Box>

            {/* Выбор цвета */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Цвет *
              </Text>
              <Flex gap="2" align="center">
                <input
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: '50px',
                    height: '40px',
                    border: '1px solid var(--gray-6)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
                <TextField.Root
                  value={formData.color || '#3B82F6'}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  style={{ fontFamily: 'monospace', flex: 1 }}
                />
              </Flex>
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Цвет для отображения команды в чате
              </Text>
            </Box>

            {/* Описание */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextField.Root
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="HR скрининг кандидата"
              />
            </Box>
          </Flex>

          {/* Кнопки действий */}
          <Flex gap="3" mt="6" justify="end">
            <Button variant="soft" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <CheckIcon width="16" height="16" />
              {editingCommand ? 'Сохранить' : 'Создать'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
