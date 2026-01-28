/**
 * RecruitingStagesSettings - компонент управления этапами найма и причинами отказа
 * 
 * Назначение:
 * - Управление этапами найма (воронка подбора)
 * - Управление причинами отказа на каждом этапе
 * - Настройка структуры pipeline для ATS и отчётов
 * - Настройка этапов-встреч для использования в workflow
 * 
 * Функциональность:
 * - Список этапов найма с возможностью редактирования
 * - Создание и редактирование этапов найма
 * - Управление причинами отказа для каждого этапа
 * - Порядок этапов в воронке
 * - Настройка этапов-встреч:
 *   - Метка "встреча" (isMeeting): отмечает этап как встречу
 *   - Отображать офисы (showOffices): настройка отображения выбора офисов в workflow
 *   - Отображать интервьюеров (showInterviewers): настройка отображения выбора интервьюеров в workflow
 * 
 * Особенности этапов-встреч:
 * - Этапы с isMeeting = true используются в тогглере на странице /workflow
 * - Названия этапов-встреч становятся названиями кнопок в тогглере
 * - Количество кнопок в тогглере: 0 и более (зависит от количества этапов с isMeeting = true)
 * - Настройки showOffices и showInterviewers определяют, какие элементы отображаются в панели настроек встречи
 * 
 * Связи:
 * - /workflow: этапы-встречи используются для формирования тогглера типа процесса
 * - WorkflowHeader: использует этапы-встречи для динамического формирования кнопок
 * - /company-settings/recruiting/stages: страница настроек этапов найма
 * 
 * Поведение:
 * - При редактировании этапа с isMeeting = true появляется карточка "Настройки встречи"
 * - В карточке можно выбрать: отображать ли офисы и интервьюеров (да/нет)
 * - Эти настройки влияют на отображение элементов в панели настроек встречи на странице /workflow
 */

'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Dialog, Tabs, Checkbox, Select } from "@radix-ui/themes"
import * as Tooltip from '@radix-ui/react-tooltip'
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon, MixerHorizontalIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './RecruitingStagesSettings.module.css'

/**
 * RejectionReason - интерфейс причины отказа
 * 
 * @property id - уникальный идентификатор причины отказа
 * @property name - название причины отказа
 * @property description - описание причины отказа (опционально)
 */
interface RejectionReason {
  id: string
  name: string
  description?: string
}

/**
 * HiringStage - интерфейс этапа найма
 * 
 * @property id - уникальный идентификатор этапа
 * @property name - название этапа
 * @property order - порядок отображения этапа в воронке
 * @property color - цвет этапа (hex)
 * @property description - описание этапа (опционально)
 * @property autoTransition - автоматический переход на следующий этап (опционально)
 * @property rejectionReasonIds - массив ID причин отказа для этого этапа (опционально)
 * @property isMeeting - метка "встреча": если true, этап используется в тогглере на странице /workflow
 * @property showOffices - отображать ли выбор офисов для этапа-встречи (да/нет)
 * @property showInterviewers - отображать ли выбор интервьюеров для этапа-встречи (да/нет)
 * 
 * Особенности:
 * - Этапы с isMeeting = true становятся кнопками в тогглере на странице /workflow
 * - Названия этапов-встреч используются как названия кнопок в тогглере
 * - Настройки showOffices и showInterviewers определяют содержимое панели настроек встречи
 */
interface HiringStage {
  id: string
  name: string
  order: number
  color: string
  description?: string
  autoTransition?: boolean
  rejectionReasonIds?: string[]
  isMeeting?: boolean // Метка "встреча" - этап используется в тогглере на странице /workflow
  showOffices?: boolean // Отображать офисы для этапа-встречи (да/нет)
  showInterviewers?: boolean // Отображать интервьюеров для этапа-встречи (да/нет)
}

// Моковые данные причин отказа
const mockRejectionReasons: RejectionReason[] = [
  {
    id: '1',
    name: 'Не подходит по опыту',
    description: 'Кандидат не имеет достаточного опыта работы'
  },
  {
    id: '2',
    name: 'Не подходит по навыкам',
    description: 'Отсутствуют необходимые технические навыки'
  },
  {
    id: '3',
    name: 'Зарплатные ожидания слишком высокие',
    description: 'Запрашиваемая зарплата превышает бюджет'
  },
  {
    id: '4',
    name: 'Не подходит по локации',
    description: 'Кандидат не может работать в требуемой локации'
  },
  {
    id: '5',
    name: 'Другая причина',
    description: 'Прочие причины отказа'
  },
]

// Моковые данные этапов
const mockStages: HiringStage[] = [
  {
    id: '1',
    name: 'New',
    order: 1,
    color: '#2180A0',
    description: 'Новый кандидат',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '2',
    name: 'Under Review',
    order: 2,
    color: '#3B82F6',
    description: 'На рассмотрении',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '3',
    name: 'Interview',
    order: 3,
    color: '#8B5CF6',
    description: 'Интервью',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '4',
    name: 'Offer',
    order: 4,
    color: '#22C55E',
    description: 'Предложение',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '5',
    name: 'Accepted',
    order: 5,
    color: '#10B981',
    description: 'Принят',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '6',
    name: 'Rejected',
    order: 6,
    color: '#EF4444',
    description: 'Отказ',
    autoTransition: false,
    rejectionReasonIds: ['1', '2', '3', '4', '5']
  },
  {
    id: '7',
    name: 'Declined',
    order: 7,
    color: '#F59E0B',
    description: 'Отклонено кандидатом',
    autoTransition: false,
    rejectionReasonIds: []
  },
  {
    id: '8',
    name: 'Archived',
    order: 8,
    color: '#6B7280',
    description: 'Архив',
    autoTransition: false,
    rejectionReasonIds: []
  },
]

const defaultColors = [
  '#2180A0', '#3B82F6', '#8B5CF6', '#22C55E', '#10B981',
  '#EF4444', '#F59E0B', '#6B7280', '#EC4899', '#14B8A6'
]

export default function RecruitingStagesSettings() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'stages' | 'reasons'>('stages')
  
  // Состояние для этапов
  const [stages, setStages] = useState<HiringStage[]>(mockStages)
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<HiringStage | null>(null)
  const [stageFormData, setStageFormData] = useState<Partial<HiringStage>>({
    name: '',
    color: defaultColors[0],
    description: '',
    rejectionReasonIds: [],
    isMeeting: false,
    showOffices: false,
    showInterviewers: false
  })
  
  // Состояние для причин отказа
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>(mockRejectionReasons)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<RejectionReason | null>(null)
  const [reasonFormData, setReasonFormData] = useState<Partial<RejectionReason>>({
    name: '',
    description: ''
  })

  // Обработчики для этапов
  const handleAddStage = () => {
    setEditingStage(null)
    setStageFormData({
      name: '',
      color: defaultColors[0],
      description: '',
      rejectionReasonIds: [],
      isMeeting: false,
      showOffices: false,
      showInterviewers: false
    })
    setIsStageDialogOpen(true)
  }

  const handleEditStage = (stage: HiringStage) => {
    setEditingStage(stage)
    setStageFormData({
      name: stage.name,
      color: stage.color,
      description: stage.description,
      rejectionReasonIds: stage.rejectionReasonIds || [],
      isMeeting: stage.isMeeting || false,
      showOffices: stage.showOffices || false,
      showInterviewers: stage.showInterviewers || false
    })
    setIsStageDialogOpen(true)
  }


  const handleSaveStage = () => {
    if (!editingStage && !stageFormData.name) {
      alert('Пожалуйста, введите название этапа')
      return
    }

    if (editingStage) {
      const { name: _n, ...rest } = stageFormData
      setStages(stages.map(s =>
        s.id === editingStage.id
          ? { 
              ...s, 
              ...rest, 
              rejectionReasonIds: stageFormData.rejectionReasonIds || [], 
              isMeeting: stageFormData.isMeeting || false,
              showOffices: stageFormData.showOffices || false,
              showInterviewers: stageFormData.showInterviewers || false
            }
          : s
      ))
    } else {
      const newStage: HiringStage = {
        id: Date.now().toString(),
        name: stageFormData.name!,
        order: stages.length + 1,
        color: stageFormData.color || defaultColors[0],
        description: stageFormData.description,
        autoTransition: false,
        rejectionReasonIds: stageFormData.rejectionReasonIds || [],
        isMeeting: stageFormData.isMeeting || false,
        showOffices: stageFormData.showOffices || false,
        showInterviewers: stageFormData.showInterviewers || false
      }
      setStages([...stages, newStage])
    }

    setIsStageDialogOpen(false)
  }

  const handleToggleRejectionReason = (reasonId: string) => {
    const currentIds = stageFormData.rejectionReasonIds || []
    const newIds = currentIds.includes(reasonId)
      ? currentIds.filter(id => id !== reasonId)
      : [...currentIds, reasonId]
    setStageFormData({ ...stageFormData, rejectionReasonIds: newIds })
  }

  // Обработчики для причин отказа
  const handleAddReason = () => {
    setEditingReason(null)
    setReasonFormData({
      name: '',
      description: ''
    })
    setIsReasonDialogOpen(true)
  }

  const handleEditReason = (reason: RejectionReason) => {
    setEditingReason(reason)
    setReasonFormData({
      name: reason.name,
      description: reason.description
    })
    setIsReasonDialogOpen(true)
  }

  const handleDeleteReason = (id: string) => {
    toast.showWarning('Удалить причину отказа?', 'Вы уверены, что хотите удалить эту причину отказа?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setRejectionReasons(prev => prev.filter(r => r.id !== id))
            setStages(prev => prev.map(s => ({
              ...s,
              rejectionReasonIds: s.rejectionReasonIds?.filter(rid => rid !== id) || []
            })))
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleSaveReason = () => {
    if (!reasonFormData.name) {
      alert('Пожалуйста, введите название причины отказа')
      return
    }

    if (editingReason) {
      setRejectionReasons(rejectionReasons.map(r => 
        r.id === editingReason.id 
          ? { ...r, ...reasonFormData }
          : r
      ))
    } else {
      const newReason: RejectionReason = {
        id: Date.now().toString(),
        name: reasonFormData.name!,
        description: reasonFormData.description
      }
      setRejectionReasons([...rejectionReasons, newReason])
    }

    setIsReasonDialogOpen(false)
  }

  return (
    <Box>
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'stages' | 'reasons')}>
        <Flex justify="between" align="center">
          <Tabs.List>
            <Tabs.Trigger value="stages">Этапы найма</Tabs.Trigger>
            <Tabs.Trigger value="reasons">Причины отказа</Tabs.Trigger>
          </Tabs.List>
          <Button variant="soft" size="2" asChild>
            <Link href="/company-settings/employee-lifecycle">
              <MixerHorizontalIcon width={16} height={16} />
              Жизненный цикл сотрудников
            </Link>
          </Button>
        </Flex>

        <Box mt="4">
          <Tabs.Content value="stages">
            <Flex justify="between" align="center" mb="4">
              <Text size="3" color="gray">
                Настройте этапы найма. Выберите доступные причины отказа для каждого этапа.
              </Text>
            </Flex>

            <Card>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell style={{ width: '40px' }}>№</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Цвет</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Причины отказа</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '80px', textAlign: 'center' }}>Встреча</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '150px' }}>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {stages.map((stage, index) => (
                    <Table.Row key={stage.id}>
                      <Table.Cell>
                        <Text size="2">{index + 1}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: stage.color
                            }}
                          />
                          <Text weight="medium">{stage.name}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="1" style={{ fontFamily: 'monospace' }}>{stage.color}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{stage.description || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        {stage.rejectionReasonIds && stage.rejectionReasonIds.length > 0 ? (
                          <Text size="1" color="gray">
                            {stage.rejectionReasonIds.length} причин
                          </Text>
                        ) : (
                          <Text size="1" color="gray">-</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell style={{ textAlign: 'center' }}>
                        {stage.isMeeting ? (
                          <CheckIcon width="16" height="16" color="var(--green-11)" />
                        ) : (
                          <Box style={{ width: '16px', height: '16px' }} />
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => handleEditStage(stage)}
                        >
                          <Pencil2Icon width={14} height={14} />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="reasons">
            <Flex justify="between" align="center" mb="4">
              <Text size="3" color="gray">
                Управляйте списком причин отказа, которые будут доступны при выборе этапа "Отказ"
              </Text>
              <Button onClick={handleAddReason}>
                <PlusIcon width={16} height={16} />
                Добавить причину
              </Button>
            </Flex>

            <Card>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '150px' }}>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rejectionReasons.map((reason) => (
                    <Table.Row key={reason.id}>
                      <Table.Cell>
                        <Text weight="medium">{reason.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">{reason.description || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => handleEditReason(reason)}
                          >
                            <Pencil2Icon width={14} height={14} />
                          </Button>
                          <Button
                            size="1"
                            variant="soft"
                            color="red"
                            onClick={() => handleDeleteReason(reason.id)}
                          >
                            <TrashIcon width={14} height={14} />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      {/* Диалог для этапа */}
      <Dialog.Root open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <Dialog.Content style={{ maxWidth: '700px' }}>
          <Dialog.Title>
            {editingStage ? 'Редактировать этап' : 'Добавить этап'}
          </Dialog.Title>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Flex align="center" gap="3">
                <Box style={{ flex: 1 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Название этапа {editingStage ? '' : '*'}
                  </Text>
                  {editingStage ? (
                    <Text size="2" color="gray">{editingStage.name}</Text>
                  ) : (
                    <TextField.Root
                      value={stageFormData.name || ''}
                      onChange={(e) => setStageFormData({ ...stageFormData, name: e.target.value })}
                      placeholder="Например: Interview"
                    />
                  )}
                </Box>
                <Flex align="center" gap="2" style={{ marginTop: editingStage ? '0' : '24px' }}>
                  <Checkbox
                    checked={stageFormData.isMeeting || false}
                    onCheckedChange={(checked) => setStageFormData({ ...stageFormData, isMeeting: checked as boolean })}
                  />
                  <Text size="2" weight="medium">Встреча</Text>
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Box
                          as="span"
                          style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}
                        >
                          <InfoCircledIcon width="14" height="14" color="var(--gray-9)" />
                        </Box>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          sideOffset={5}
                          style={{
                            backgroundColor: 'var(--gray-2)',
                            border: '1px solid var(--gray-6)',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            maxWidth: '300px',
                            fontSize: '12px',
                            lineHeight: '1.4',
                            color: 'var(--gray-12)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                          }}
                        >
                          Этапы-встречи используются в тогглере на странице /workflow. Названия этапов-встреч становятся названиями кнопок в тогглере. Настройки 'Отображать офисы' и 'Отображать интервьюеров' определяют, какие элементы отображаются в панели настроек встречи.
                          <Tooltip.Arrow style={{ fill: 'var(--gray-2)', stroke: 'var(--gray-6)' }} />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </Flex>
              </Flex>
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextField.Root
                value={stageFormData.description || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, description: e.target.value })}
                placeholder="Описание этапа"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Цвет
              </Text>
              <Flex gap="2" wrap="wrap">
                {defaultColors.map(color => (
                  <Button
                    key={color}
                    variant={stageFormData.color === color ? 'solid' : 'soft'}
                    onClick={() => setStageFormData({ ...stageFormData, color })}
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: stageFormData.color === color ? color : 'var(--gray-3)',
                      border: `2px solid ${stageFormData.color === color ? color : 'transparent'}`,
                      borderRadius: '4px',
                      padding: 0
                    }}
                  >
                    <Box
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color
                      }}
                    />
                  </Button>
                ))}
              </Flex>
              <TextField.Root
                value={stageFormData.color || ''}
                onChange={(e) => setStageFormData({ ...stageFormData, color: e.target.value })}
                placeholder="#000000"
                style={{ marginTop: '8px' }}
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Причины отказа (выберите доступные причины для этого этапа)
              </Text>
              <Flex direction="column" gap="2" style={{ maxHeight: '200px', overflowY: 'auto', padding: '8px', backgroundColor: 'var(--gray-2)', borderRadius: '4px' }}>
                {rejectionReasons.map((reason) => {
                  const isSelected = stageFormData.rejectionReasonIds?.includes(reason.id) || false
                  return (
                    <Flex key={reason.id} align="center" gap="2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRejectionReason(reason.id)}
                        id={`reason-${reason.id}`}
                      />
                      <Text size="2" as="label" htmlFor={`reason-${reason.id}`} style={{ cursor: 'pointer', flex: 1 }}>
                        {reason.name}
                      </Text>
                    </Flex>
                  )
                })}
                {rejectionReasons.length === 0 && (
                  <Text size="2" color="gray" style={{ padding: '8px' }}>
                    Нет доступных причин отказа. Добавьте их во вкладке "Причины отказа"
                  </Text>
                )}
              </Flex>
            </Box>

            {/* Карточка настроек встречи (отображается только если isMeeting = true)
                - Позволяет настроить, какие элементы будут отображаться в панели настроек встречи на странице /workflow
                - showOffices: если "Да", то в панели настроек встречи будет выбор формата (Онлайн/Офис) и выбор офиса при выборе "Офис"
                - showInterviewers: если "Да", то в панели настроек встречи будет выбор интервьюеров
                - Эти настройки влияют на отображение элементов в WorkflowHeader при выборе этапа-встречи */}
            {stageFormData.isMeeting && (
              <Card style={{ padding: '16px', backgroundColor: 'var(--gray-2)' }}>
                <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>
                  Настройки встречи
                </Text>
                <Text size="1" color="gray" mb="3" style={{ display: 'block' }}>
                  Настройте, какие элементы будут отображаться в панели настроек встречи на странице /workflow
                </Text>
                <Flex direction="column" gap="3">
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Отображать офисы?
                    </Text>
                    <Select.Root
                      value={stageFormData.showOffices ? 'yes' : 'no'}
                      onValueChange={(value) => setStageFormData({ ...stageFormData, showOffices: value === 'yes' })}
                    >
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        <Select.Item value="yes">Да</Select.Item>
                        <Select.Item value="no">Нет</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                      Если "Да", то в панели настроек встречи будет выбор формата (Онлайн/Офис) и выбор офиса при выборе "Офис". Если "Нет", то по определению используется только офис.
                    </Text>
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Отображать интервьюеров?
                    </Text>
                    <Select.Root
                      value={stageFormData.showInterviewers ? 'yes' : 'no'}
                      onValueChange={(value) => setStageFormData({ ...stageFormData, showInterviewers: value === 'yes' })}
                    >
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        <Select.Item value="yes">Да</Select.Item>
                        <Select.Item value="no">Нет</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                      Если "Да", то в панели настроек встречи будет выбор интервьюеров
                    </Text>
                  </Box>
                </Flex>
              </Card>
            )}
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setIsStageDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStage}>
              <CheckIcon width={16} height={16} />
              Сохранить
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Диалог для причины отказа */}
      <Dialog.Root open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <Dialog.Content style={{ maxWidth: '600px' }}>
          <Dialog.Title>
            {editingReason ? 'Редактировать причину отказа' : 'Добавить причину отказа'}
          </Dialog.Title>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Название причины отказа *
              </Text>
              <TextField.Root
                value={reasonFormData.name || ''}
                onChange={(e) => setReasonFormData({ ...reasonFormData, name: e.target.value })}
                placeholder="Например: Не подходит по опыту"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextField.Root
                value={reasonFormData.description || ''}
                onChange={(e) => setReasonFormData({ ...reasonFormData, description: e.target.value })}
                placeholder="Описание причины отказа"
              />
            </Box>
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setIsReasonDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveReason}>
              <CheckIcon width={16} height={16} />
              Сохранить
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
