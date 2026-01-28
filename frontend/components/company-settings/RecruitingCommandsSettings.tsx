/**
 * RecruitingCommandsSettings - компонент управления командами для workflow чата
 * 
 * Назначение:
 * - Отображение списка команд
 * - Создание, редактирование и удаление команд
 * - Связывание команд с этапами найма и типами действий
 * - Настройка цветов и описаний команд
 * 
 * Функциональность:
 * - Список команд с возможностью редактирования и удаления
 * - Форма создания/редактирования команды
 * - Выбор этапа найма или типа действия для команды
 * - Настройка цвета команды (для отображения в чате)
 * - Валидация уникальности команд
 * 
 * Особенности:
 * - Команды /add и /del не отображаются в списке (системные)
 * - Команды должны начинаться с "/"
 * - Каждая команда связана с одним этапом найма или типом действия
 * 
 * TODO:
 * - Загружать список этапов найма из API
 * - Сохранять команды через API
 * - Валидация уникальности команд на сервере
 */

'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Dialog, Select } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './RecruitingCommandsSettings.module.css'

/**
 * Command - интерфейс команды
 * 
 * @property id - уникальный идентификатор команды
 * @property command - текст команды (например, "/s", "/t", "/in")
 * @property actionType - тип действия, связанный с командой
 * @property stageId - ID этапа найма (опционально, если команда связана с этапом)
 * @property color - цвет команды для отображения в чате (hex)
 * @property description - описание команды
 * @property order - порядок отображения команды
 */
interface Command {
  id: string
  command: string // Например, "/s", "/t", "/in"
  actionType: string // Например, "hrscreening", "tech_screening", "final_interview"
  stageId?: string // ID этапа найма (опционально)
  color: string // Цвет для отображения в чате
  description?: string
  order: number
}

/**
 * ActionType - тип действия в workflow
 * 
 * Типы действий:
 * - hrscreening: HR скрининг
 * - tech_screening: Технический скрининг
 * - final_interview: Финальное интервью
 * - invite: Приглашение на интервью
 */
type ActionType = 'hrscreening' | 'tech_screening' | 'final_interview' | 'invite'

/**
 * Моковые данные этапов найма
 * TODO: Загружать из API или из настроек этапов
 */
const mockStages = [
  { id: 'hr-screening', name: 'HR Screening', description: 'HR скрининг' },
  { id: 'tech-screening', name: 'Tech Screening', description: 'Технический скрининг' },
  { id: 'final-interview', name: 'Final Interview', description: 'Финальное интервью' },
  { id: 'interview', name: 'Interview', description: 'Интервью' },
  { id: 'offer', name: 'Offer', description: 'Предложение' },
]

/**
 * Моковые данные команд
 * TODO: Загружать из API
 */
const mockCommands: Command[] = [
  {
    id: '1',
    command: '/s',
    actionType: 'hrscreening',
    stageId: 'hr-screening',
    color: '#22C55E',
    description: 'HR скрининг кандидата',
    order: 1,
  },
  {
    id: '2',
    command: '/t',
    actionType: 'tech_screening',
    stageId: 'tech-screening',
    color: '#F97316',
    description: 'Технический скрининг',
    order: 2,
  },
  {
    id: '3',
    command: '/in',
    actionType: 'final_interview',
    stageId: 'final-interview',
    color: '#6366F1',
    description: 'Финальное интервью',
    order: 3,
  },
]

/**
 * Типы действий с описаниями
 */
const actionTypes: { value: ActionType; label: string; description: string }[] = [
  { value: 'hrscreening', label: 'HR скрининг', description: 'Скрининг кандидата HR-менеджером' },
  { value: 'tech_screening', label: 'Технический скрининг', description: 'Техническая оценка кандидата' },
  { value: 'final_interview', label: 'Финальное интервью', description: 'Финальное интервью с кандидатом' },
  { value: 'invite', label: 'Приглашение', description: 'Приглашение на интервью' },
]

/**
 * RecruitingCommandsSettings - компонент управления командами
 * 
 * Состояние:
 * - commands: список всех команд
 * - editingCommand: команда, которая редактируется (null если создается новая)
 * - showDialog: флаг отображения диалога создания/редактирования
 * - formData: данные формы для создания/редактирования команды
 */
export default function RecruitingCommandsSettings() {
  // Список команд
  const [commands, setCommands] = useState<Command[]>(mockCommands)
  // Команда для редактирования (null если создается новая)
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)
  // Флаг отображения диалога
  const [showDialog, setShowDialog] = useState(false)
  // Данные формы
  const [formData, setFormData] = useState<Partial<Command>>({
    command: '',
    actionType: 'hrscreening',
    stageId: undefined,
    color: '#3B82F6',
    description: '',
  })
  // Toast для уведомлений
  const { showSuccess, showError } = useToast()

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
      actionType: 'hrscreening',
      stageId: undefined,
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
      actionType: command.actionType as ActionType,
      stageId: command.stageId,
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
    // TODO: Показать подтверждение удаления через toast
    setCommands(commands.filter(cmd => cmd.id !== commandId))
    showSuccess('Команда удалена', 'Команда успешно удалена из списка')
  }

  /**
   * handleSave - обработчик сохранения команды
   * 
   * Функциональность:
   * - Валидирует данные формы
   * - Проверяет уникальность команды
   * - Сохраняет команду (создает новую или обновляет существующую)
   * - Закрывает диалог
   */
  const handleSave = () => {
    // Валидация
    if (!formData.command || !formData.command.startsWith('/')) {
      showError('Ошибка валидации', 'Команда должна начинаться с "/"')
      return
    }

    if (!formData.actionType) {
      showError('Ошибка валидации', 'Выберите тип действия')
      return
    }

    // Проверка уникальности команды
    const existingCommand = commands.find(
      cmd => cmd.command === formData.command && cmd.id !== editingCommand?.id
    )
    if (existingCommand) {
      showError('Ошибка валидации', 'Команда с таким названием уже существует')
      return
    }

    // Сохранение команды
    if (editingCommand) {
      // Обновление существующей команды
      setCommands(
        commands.map(cmd =>
          cmd.id === editingCommand.id
            ? {
                ...cmd,
                command: formData.command!,
                actionType: formData.actionType!,
                stageId: formData.stageId,
                color: formData.color!,
                description: formData.description,
              }
            : cmd
        )
      )
      showSuccess('Команда обновлена', 'Команда успешно обновлена')
    } else {
      // Создание новой команды
      const newCommand: Command = {
        id: Date.now().toString(),
        command: formData.command!,
        actionType: formData.actionType!,
        stageId: formData.stageId,
        color: formData.color!,
        description: formData.description,
        order: commands.length + 1,
      }
      setCommands([...commands, newCommand])
      showSuccess('Команда создана', 'Команда успешно создана')
    }

    // Закрытие диалога
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
      actionType: 'hrscreening',
      stageId: undefined,
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

      {/* Таблица команд */}
      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Команда</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Тип действия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Этап найма</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Цвет</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="100">Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {commands.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
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
                    {actionTypes.find(at => at.value === command.actionType)?.label || command.actionType}
                  </Table.Cell>
                  <Table.Cell>
                    {command.stageId
                      ? mockStages.find(s => s.id === command.stageId)?.name || command.stageId
                      : '-'}
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

            {/* Выбор типа действия */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Тип действия *
              </Text>
              <Select.Root
                value={formData.actionType}
                onValueChange={value => setFormData({ ...formData, actionType: value as ActionType })}
              >
                <Select.Trigger />
                <Select.Content>
                  {actionTypes.map(actionType => (
                    <Select.Item key={actionType.value} value={actionType.value}>
                      {actionType.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                {actionTypes.find(at => at.value === formData.actionType)?.description}
              </Text>
            </Box>

            {/* Выбор этапа найма (опционально) */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Этап найма (опционально)
              </Text>
              <Select.Root
                value={formData.stageId || ''}
                onValueChange={value => setFormData({ ...formData, stageId: value || undefined })}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="">Не выбран</Select.Item>
                  {mockStages.map(stage => (
                    <Select.Item key={stage.id} value={stage.id}>
                      {stage.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Свяжите команду с этапом найма для автоматического перехода
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
