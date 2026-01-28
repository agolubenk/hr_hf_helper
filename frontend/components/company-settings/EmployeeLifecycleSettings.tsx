'use client'

import { Box, Flex, Text, Card, Button, TextField, Dialog } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import Link from "next/link"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import styles from './EmployeeLifecycleSettings.module.css'

interface LifecycleStage {
  id: string
  name: string
  blockId: string
  order: number
  isSystem: boolean
}

interface LifecycleBlock {
  id: string
  name: string
}

const BLOCKS: LifecycleBlock[] = [
  { id: 'recruiting', name: 'Рекрутинг' },
  { id: 'onboarding', name: 'Онбординг' },
  { id: 'employee', name: 'Работник' },
  { id: 'blacklist', name: 'ЧС' },
]

const INITIAL_STAGES: LifecycleStage[] = [
  { id: 'lc-1', name: 'Новый', blockId: 'recruiting', order: 1, isSystem: true },
  { id: 'lc-2', name: 'Оффер', blockId: 'recruiting', order: 2, isSystem: true },
  { id: 'lc-3', name: 'Оффер принят', blockId: 'recruiting', order: 3, isSystem: true },
  { id: 'lc-4', name: 'Онбординг', blockId: 'onboarding', order: 1, isSystem: true },
  { id: 'lc-5', name: 'Работник', blockId: 'employee', order: 1, isSystem: true },
  { id: 'lc-6', name: 'Оффбординг', blockId: 'employee', order: 2, isSystem: true },
  { id: 'lc-7', name: 'Черный список', blockId: 'blacklist', order: 1, isSystem: true },
]

function getStagesInBlock(stages: LifecycleStage[], blockId: string) {
  return stages
    .filter(s => s.blockId === blockId)
    .sort((a, b) => a.order - b.order)
}

/** Нумерация сквозная по блокам: 1,2,3…; в блоке ЧС всегда 0 */
function getGlobalOrderMap(stages: LifecycleStage[]): Record<string, number> {
  const map: Record<string, number> = {}
  let counter = 1
  for (const block of BLOCKS) {
    const blockStages = getStagesInBlock(stages, block.id)
    for (const s of blockStages) {
      map[s.id] = block.id === 'blacklist' ? 0 : counter++
    }
  }
  return map
}

function GripIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="4" cy="4" r="1.25" fill="currentColor" />
      <circle cx="8" cy="4" r="1.25" fill="currentColor" />
      <circle cx="4" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="4" cy="12" r="1.25" fill="currentColor" />
      <circle cx="8" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

interface SortableStageRowProps {
  stage: LifecycleStage
  orderIndex: number
  isEditing: boolean
  editingName: string
  onEditingNameChange: (v: string) => void
  onStartRename: () => void
  onSaveRename: () => void
  onCancelRename: () => void
  onDelete: () => void
}

function SortableStageRow({
  stage,
  orderIndex,
  isEditing,
  editingName,
  onEditingNameChange,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
}: SortableStageRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stage.id,
    disabled: { draggable: stage.isSystem, droppable: false },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Flex
      ref={setNodeRef}
      align="center"
      gap="2"
      className={`${styles.stageRow} ${isDragging ? styles.stageRowDragging : ''}`}
      style={style}
    >
      <Box
        className={`${styles.dragHandle} ${stage.isSystem ? styles.dragHandleDisabled : ''}`}
        {...(stage.isSystem ? {} : { ...attributes, ...listeners })}
        title={stage.isSystem ? 'Порядок обязательных этапов зафиксирован' : 'Перетащите для изменения порядка'}
      >
        <GripIcon />
      </Box>
      <Text size="2" weight="medium" className={styles.orderBadge}>
        {orderIndex}
      </Text>
      {isEditing ? (
        <TextField.Root
          value={editingName}
          onChange={e => onEditingNameChange(e.target.value)}
          onBlur={onSaveRename}
          onKeyDown={e => {
            if (e.key === 'Enter') onSaveRename()
            if (e.key === 'Escape') onCancelRename()
          }}
          placeholder="Название этапа"
          autoFocus
          style={{ flex: 1, maxWidth: 320 }}
        />
      ) : (
        <>
          <Text
            size="2"
            className={styles.stageName}
            onClick={onStartRename}
          >
            {stage.name}
          </Text>
          {stage.isSystem && (
            <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
              обязательный
            </Text>
          )}
          <Box style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button size="1" variant="ghost" onClick={onStartRename} title="Переименовать">
              <Pencil2Icon width={14} height={14} />
            </Button>
            {!stage.isSystem && (
              <Button size="1" variant="ghost" color="red" onClick={onDelete} title="Удалить">
                <TrashIcon width={14} height={14} />
              </Button>
            )}
          </Box>
        </>
      )}
    </Flex>
  )
}

export default function EmployeeLifecycleSettings() {
  const toast = useToast()
  const [stages, setStages] = useState<LifecycleStage[]>(INITIAL_STAGES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addBlockId, setAddBlockId] = useState<string>('')
  const [newStageName, setNewStageName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const startRename = (s: LifecycleStage) => {
    setEditingId(s.id)
    setEditingName(s.name)
  }

  const saveRename = () => {
    if (editingId && editingName.trim()) {
      setStages(prev =>
        prev.map(x => (x.id === editingId ? { ...x, name: editingName.trim() } : x))
      )
    }
    setEditingId(null)
    setEditingName('')
  }

  const handleAddClick = (blockId: string) => {
    setAddBlockId(blockId)
    setNewStageName('')
    setAddDialogOpen(true)
  }

  const handleAddSave = () => {
    if (!newStageName.trim()) return
    const blockStages = getStagesInBlock(stages, addBlockId)
    const maxOrder = blockStages.length ? Math.max(...blockStages.map(s => s.order)) : 0
    const newStage: LifecycleStage = {
      id: `lc-c-${Date.now()}`,
      name: newStageName.trim(),
      blockId: addBlockId,
      order: maxOrder + 1,
      isSystem: false,
    }
    setStages(prev => [...prev, newStage])
    setAddDialogOpen(false)
    setNewStageName('')
  }

  const handleDelete = (id: string) => {
    const s = stages.find(x => x.id === id)
    if (s?.isSystem) return
    toast.showWarning('Удалить этап?', 'Вы уверены, что хотите удалить этот этап?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setStages(prev => prev.filter(x => x.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const globalOrderMap = getGlobalOrderMap(stages)

  const handleDragEnd = (blockId: string) => (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const blockStages = getStagesInBlock(stages, blockId)
    const draggedStage = blockStages.find(s => s.id === active.id)
    if (draggedStage?.isSystem) return // обязательные этапы не перетаскиваются

    const fromIndex = blockStages.findIndex(s => s.id === active.id)
    const toIndex = blockStages.findIndex(s => s.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return

    const reordered = arrayMove(blockStages, fromIndex, toIndex)
    const withNewOrder = reordered.map((s, i) => ({ ...s, order: i + 1 }))
    setStages(prev =>
      prev.map(x => {
        const found = withNewOrder.find(n => n.id === x.id)
        return found ? { ...x, order: found.order } : x
      })
    )
  }

  return (
    <Box>
      <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
        Обязательные этапы можно переименовать. Дополнительные этапы можно создавать и удалять (в блоке ЧС только этап «Черный список», его можно переименовать). Порядок можно менять перетаскиванием за ручку слева. Обязательные этапы нельзя перемещать — их относительный порядок зафиксирован.
      </Text>

      <Flex direction="column" gap="4">
        {BLOCKS.map(block => {
          const blockStages = getStagesInBlock(stages, block.id)
          return (
            <Card key={block.id} className={styles.blockCard}>
              <Flex align="center" justify="between" mb="3">
                <Text size="4" weight="bold">
                  {block.name}
                </Text>
                {block.id === 'recruiting' && (
                  <Link href="/company-settings/recruiting/stages">
                    <Button size="2" variant="soft" title="Настройка этапов найма и причин отказа">
                      Далее причины отказа...
                    </Button>
                  </Link>
                )}
              </Flex>
              <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd(block.id)}
              >
                <SortableContext
                  items={blockStages.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Flex direction="column" gap="2">
                    {blockStages.map((s) => (
                      <SortableStageRow
                        key={s.id}
                        stage={s}
                        orderIndex={globalOrderMap[s.id] ?? 0}
                        isEditing={editingId === s.id}
                        editingName={editingName}
                        onEditingNameChange={setEditingName}
                        onStartRename={() => startRename(s)}
                        onSaveRename={saveRename}
                        onCancelRename={() => { setEditingId(null); setEditingName('') }}
                        onDelete={() => handleDelete(s.id)}
                      />
                    ))}
                    {block.id !== 'blacklist' && (
                      <Button
                        size="2"
                        variant="soft"
                        onClick={() => handleAddClick(block.id)}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <PlusIcon width={16} height={16} />
                        Добавить этап
                      </Button>
                    )}
                  </Flex>
                </SortableContext>
              </DndContext>
            </Card>
          )
        })}
      </Flex>

      <Dialog.Root open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>Новый этап</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            Этап будет добавлен в блок «{BLOCKS.find(b => b.id === addBlockId)?.name}».
          </Dialog.Description>
          <TextField.Root
            value={newStageName}
            onChange={e => setNewStageName(e.target.value)}
            placeholder="Название этапа"
            mb="3"
          />
          <Flex gap="2" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Отмена</Button>
            </Dialog.Close>
            <Button onClick={handleAddSave} disabled={!newStageName.trim()}>
              Добавить
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
