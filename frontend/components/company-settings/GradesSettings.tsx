'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Dialog } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, Pencil2Icon, TrashIcon, Cross2Icon, CheckIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import GradeForm from "./GradeForm"
import styles from './GradesSettings.module.css'

interface AdditionalField {
  id: string
  name: string
}

interface Grade {
  id: number
  order: number
  name: string
  category?: string
  level?: string
  comment?: string
  additionalFields?: { [fieldId: string]: string }
}

// Моковые данные
const mockGrades: Grade[] = [
  {
    id: 1,
    order: 1,
    name: 'Junior',
    category: 'Разработка',
    level: 'L1',
    comment: 'Начальный уровень',
    additionalFields: {
      'field1': 'Джуниор',
      'field2': 'Junior Developer',
    },
  },
  {
    id: 2,
    order: 2,
    name: 'Middle',
    category: 'Разработка',
    level: 'L2',
    comment: 'Средний уровень',
    additionalFields: {
      'field1': 'Мидл',
      'field2': 'Middle Developer',
    },
  },
  {
    id: 3,
    order: 3,
    name: 'Senior',
    category: 'Разработка',
    level: 'L3',
    comment: 'Высокий уровень',
    additionalFields: {
      'field1': 'Сеньор',
      'field2': 'Senior Developer',
    },
  },
]

const mockAdditionalFields: AdditionalField[] = [
  { id: 'field1', name: 'Альтернативное название' },
  { id: 'field2', name: 'Связь с системой' },
]

export default function GradesSettings() {
  const toast = useToast()
  const [grades, setGrades] = useState<Grade[]>(mockGrades)
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>(mockAdditionalFields)
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isAddingField, setIsAddingField] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')

  const handleMoveUp = (id: number) => {
    setGrades(prev => {
      const index = prev.findIndex(g => g.id === id)
      if (index <= 0) return prev
      
      const newGrades = [...prev]
      const temp = newGrades[index]
      newGrades[index] = newGrades[index - 1]
      newGrades[index - 1] = temp
      
      // Обновляем порядок
      return newGrades.map((g, i) => ({ ...g, order: i + 1 }))
    })
  }

  const handleMoveDown = (id: number) => {
    setGrades(prev => {
      const index = prev.findIndex(g => g.id === id)
      if (index >= prev.length - 1) return prev
      
      const newGrades = [...prev]
      const temp = newGrades[index]
      newGrades[index] = newGrades[index + 1]
      newGrades[index + 1] = temp
      
      // Обновляем порядок
      return newGrades.map((g, i) => ({ ...g, order: i + 1 }))
    })
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingGradeId(null)
  }

  const handleEdit = (id: number) => {
    setEditingGradeId(id)
    setIsCreating(false)
  }

  const handleSave = (gradeData: Partial<Grade>) => {
    if (isCreating) {
      // Создаем новый грейд с пустыми дополнительными полями
      const newAdditionalFields: { [key: string]: string } = {}
      additionalFields.forEach(field => {
        newAdditionalFields[field.id] = gradeData.additionalFields?.[field.id] || ''
      })
      
      const newGrade: Grade = {
        id: Date.now(),
        order: grades.length + 1,
        name: gradeData.name || '',
        category: gradeData.category,
        level: gradeData.level,
        comment: gradeData.comment,
        additionalFields: newAdditionalFields,
      }
      setGrades(prev => [...prev, newGrade])
      setIsCreating(false)
    } else if (editingGradeId) {
      // Обновляем существующий грейд
      setGrades(prev => prev.map(g => {
        if (g.id === editingGradeId) {
          return {
            ...g,
            name: gradeData.name || g.name,
            category: gradeData.category,
            level: gradeData.level,
            comment: gradeData.comment,
            additionalFields: {
              ...g.additionalFields,
              ...gradeData.additionalFields,
            }
          }
        }
        return g
      }))
      setEditingGradeId(null)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingGradeId(null)
  }

  const handleDelete = (id: number) => {
    toast.showWarning('Удалить грейд?', 'Вы уверены, что хотите удалить этот грейд?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setGrades(prev => {
            const filtered = prev.filter(g => g.id !== id)
            return filtered.map((g, i) => ({ ...g, order: i + 1 }))
          }),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleAddAdditionalField = () => {
    if (!newFieldName.trim()) {
      alert('Введите название поля')
      return
    }

    const fieldId = `field_${Date.now()}`
    const newField: AdditionalField = {
      id: fieldId,
      name: newFieldName.trim(),
    }

    // Добавляем поле ко всем грейдам
    setGrades(prev => prev.map(grade => ({
      ...grade,
      additionalFields: {
        ...grade.additionalFields,
        [fieldId]: '',
      }
    })))

    setAdditionalFields(prev => [...prev, newField])
    setNewFieldName('')
    setIsAddingField(false)
  }

  const handleDeleteAdditionalField = (fieldId: string) => {
    toast.showWarning('Удалить поле?', 'Вы уверены, что хотите удалить это дополнительное поле? Оно будет удалено для всех грейдов.', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setGrades(prev => prev.map(grade => {
              const { [fieldId]: _removed, ...rest } = grade.additionalFields || {}
              return { ...grade, additionalFields: rest }
            }))
            setAdditionalFields(prev => prev.filter(f => f.id !== fieldId))
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const currentGrade = editingGradeId ? grades.find(g => g.id === editingGradeId) : null

  return (
    <Flex direction="column" gap="4">
      <Card className={styles.card}>
        <Flex justify="between" align="center" mb="4">
          <Text size="4" weight="bold">
            Грейды компании
          </Text>
          <Flex gap="2">
            {!isCreating && !editingGradeId && (
              <>
                <Button variant="soft" size="2" onClick={() => setIsAddingField(true)}>
                  <PlusIcon width={16} height={16} />
                  Добавить поле
                </Button>
                <Button size="2" onClick={handleCreate}>
                  <PlusIcon width={16} height={16} />
                  Создать грейд
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        {/* Список грейдов */}
        {grades.length > 0 ? (
          <Box style={{ overflowX: 'auto' }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ width: '60px' }}>Порядок</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Название *</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Категория</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Уровень</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Комментарий</Table.ColumnHeaderCell>
                  {additionalFields.map(field => (
                    <Table.ColumnHeaderCell key={field.id}>
                      <Flex align="center" gap="2" justify="between">
                        <Text size="2">{field.name}</Text>
                        <Button
                          variant="ghost"
                          size="1"
                          color="red"
                          onClick={() => handleDeleteAdditionalField(field.id)}
                          title="Удалить поле"
                        >
                          <TrashIcon width={12} height={12} />
                        </Button>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  ))}
                  <Table.ColumnHeaderCell style={{ width: '150px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {grades
                  .sort((a, b) => a.order - b.order)
                  .map((grade, index) => (
                    <Table.Row key={grade.id}>
                      <Table.Cell>
                        <Flex gap="1" align="center">
                          <Text size="2" weight="medium">
                            {grade.order}
                          </Text>
                          <Flex direction="column" gap="0">
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={() => handleMoveUp(grade.id)}
                              disabled={index === 0}
                              title="Вверх"
                              className={styles.orderButton}
                            >
                              <ChevronUpIcon width={12} height={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={() => handleMoveDown(grade.id)}
                              disabled={index === grades.length - 1}
                              title="Вниз"
                              className={styles.orderButton}
                            >
                              <ChevronDownIcon width={12} height={12} />
                            </Button>
                          </Flex>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" weight="medium">
                          {grade.name}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {grade.category || '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {grade.level || '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {grade.comment || '-'}
                        </Text>
                      </Table.Cell>
                      {additionalFields.map(field => (
                        <Table.Cell key={field.id}>
                          <Text size="2" color="gray">
                            {grade.additionalFields?.[field.id] || '-'}
                          </Text>
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <Flex gap="1">
                          <Button
                            variant="ghost"
                            size="1"
                            onClick={() => handleEdit(grade.id)}
                            title="Редактировать"
                            className={styles.actionButton}
                          >
                            <Pencil2Icon width={14} height={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="1"
                            color="red"
                            onClick={() => handleDelete(grade.id)}
                            title="Удалить"
                            className={styles.actionButton}
                          >
                            <TrashIcon width={14} height={14} />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <Box p="4" style={{ textAlign: 'center', border: '1px solid var(--gray-a6)', borderRadius: '8px', background: 'var(--gray-2)' }}>
            <Text size="3" color="gray">
              Нет грейдов. Создайте первый грейд.
            </Text>
          </Box>
        )}
      </Card>

      {/* Модальное окно для создания/редактирования грейда */}
      <Dialog.Root open={isCreating || editingGradeId !== null} onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}>
        <Dialog.Content style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
          <Dialog.Title>
            {isCreating ? 'Создание грейда' : 'Редактирование грейда'}
          </Dialog.Title>
          <Box p="4">
            <GradeForm
              initialData={currentGrade}
              additionalFields={additionalFields}
              onSave={(data) => {
                handleSave(data)
              }}
              onCancel={handleCancel}
              isCreating={isCreating}
            />
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      {/* Диалог для добавления дополнительного поля */}
      <Dialog.Root open={isAddingField} onOpenChange={setIsAddingField}>
        <Dialog.Content style={{ maxWidth: '400px' }}>
          <Dialog.Title>Добавить дополнительное поле</Dialog.Title>
          <Box p="4">
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Название поля
            </Text>
            <TextField.Root
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Введите название поля (например, Альтернативное название)"
              style={{ width: '100%' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddAdditionalField()
                }
              }}
            />
            <Flex gap="2" justify="end" mt="4">
              <Button variant="soft" onClick={() => {
                setIsAddingField(false)
                setNewFieldName('')
              }}>
                <Cross2Icon width={16} height={16} />
                Отмена
              </Button>
              <Button onClick={handleAddAdditionalField}>
                <CheckIcon width={16} height={16} />
                Добавить
              </Button>
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
