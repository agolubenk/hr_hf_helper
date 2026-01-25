'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Dialog, Tabs } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, CheckIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import styles from './RecruitingStagesSettings.module.css'

interface RejectionReason {
  id: string
  name: string
  description?: string
}

interface HiringStage {
  id: string
  name: string
  order: number
  color: string
  description?: string
  autoTransition?: boolean
  rejectionReasonIds?: string[]
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
  const [activeTab, setActiveTab] = useState<'stages' | 'reasons'>('stages')
  
  // Состояние для этапов
  const [stages, setStages] = useState<HiringStage[]>(mockStages)
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<HiringStage | null>(null)
  const [stageFormData, setStageFormData] = useState<Partial<HiringStage>>({
    name: '',
    color: defaultColors[0],
    description: '',
    rejectionReasonIds: []
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
      rejectionReasonIds: []
    })
    setIsStageDialogOpen(true)
  }

  const handleEditStage = (stage: HiringStage) => {
    setEditingStage(stage)
    setStageFormData({
      name: stage.name,
      color: stage.color,
      description: stage.description,
      rejectionReasonIds: stage.rejectionReasonIds || []
    })
    setIsStageDialogOpen(true)
  }

  const handleDeleteStage = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот этап?')) {
      setStages(stages.filter(s => s.id !== id).map((s, index) => ({ ...s, order: index + 1 })))
    }
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
          ? { ...s, ...rest, rejectionReasonIds: stageFormData.rejectionReasonIds || [] }
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
        rejectionReasonIds: stageFormData.rejectionReasonIds || []
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
    if (confirm('Вы уверены, что хотите удалить эту причину отказа?')) {
      setRejectionReasons(rejectionReasons.filter(r => r.id !== id))
      // Также удаляем из всех этапов
      setStages(stages.map(s => ({
        ...s,
        rejectionReasonIds: s.rejectionReasonIds?.filter(rid => rid !== id) || []
      })))
    }
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
              <Button onClick={handleAddStage}>
                <PlusIcon width={16} height={16} />
                Добавить этап
              </Button>
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
                      <Table.Cell>
                        <Flex gap="2">
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => handleEditStage(stage)}
                          >
                            <Pencil2Icon width={14} height={14} />
                          </Button>
                          <Button
                            size="1"
                            variant="soft"
                            color="red"
                            onClick={() => handleDeleteStage(stage.id)}
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
