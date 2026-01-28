'use client'

import { Box, Flex, Text, Button, TextField, Table, Badge, Callout, Select } from "@radix-ui/themes"
import { StarIcon, PlusIcon, TrashIcon, Pencil2Icon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './GradesSection.module.css'

interface Grade {
  id: number
  name: string
}

// Все возможные грейды
const ALL_POSSIBLE_GRADES = [
  'Trainee',
  'Junior-',
  'Junior',
  'Junior+',
  'Middle-',
  'Middle',
  'Middle+',
  'Senior-',
  'Senior',
  'Senior+',
  'Lead',
  'Lead+',
  'Head',
  'C-Level',
]

// Моковые данные (начальные грейды)
const mockGrades: Grade[] = [
  { id: 1, name: 'Junior' },
  { id: 2, name: 'Junior+' },
  { id: 3, name: 'Middle' },
  { id: 4, name: 'Middle+' },
  { id: 5, name: 'Senior' },
]

export default function GradesSection() {
  const toast = useToast()
  const [grades, setGrades] = useState<Grade[]>(mockGrades)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedGradeName, setSelectedGradeName] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  // Получаем доступные грейды (те, которых еще нет в списке)
  const availableGrades = ALL_POSSIBLE_GRADES.filter(
    gradeName => !grades.some(g => g.name === gradeName)
  )

  const handleAdd = () => {
    if (!selectedGradeName) {
      alert('Выберите грейд')
      return
    }

    const newGrade: Grade = {
      id: Math.max(...grades.map(g => g.id), 0) + 1,
      name: selectedGradeName
    }
    setGrades([...grades, newGrade])
    setSelectedGradeName('')
    setIsAdding(false)
  }

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id)
    setEditingName(grade.name)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) {
      alert('Введите название грейда')
      return
    }

    setGrades(grades.map(g => 
      g.id === editingId ? { ...g, name: editingName.trim() } : g
    ))
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = (id: number) => {
    toast.showWarning('Удалить грейд?', 'Вы уверены, что хотите удалить этот грейд?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setGrades(prev => prev.filter(g => g.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  return (
    <Box className={styles.section}>
      <Flex justify="between" align="center" className={styles.header}>
        <Flex align="center" gap="2">
          <StarIcon width={20} height={20} />
          <Text size="5" weight="bold">Грейды сотрудников</Text>
        </Flex>
        <Button
          size="2"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <PlusIcon width={16} height={16} />
          Добавить грейд
        </Button>
      </Flex>

      <Callout.Root className={styles.infoBox} mb="4">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Создайте все необходимые грейды в настройках компании и выберите те, которые используются в вашем процессе
        </Callout.Text>
      </Callout.Root>

      {isAdding && (
        <Box className={styles.addForm}>
          <Flex gap="2" align="center">
            <Select.Root
              value={selectedGradeName}
              onValueChange={setSelectedGradeName}
            >
              <Select.Trigger 
                placeholder="Выберите грейд"
                style={{ flex: 1 }}
              />
              <Select.Content>
                {availableGrades.length > 0 ? (
                  availableGrades.map((gradeName) => (
                    <Select.Item key={gradeName} value={gradeName}>
                      {gradeName}
                    </Select.Item>
                  ))
                ) : (
                  <Select.Item value="none" disabled>
                    Все грейды уже добавлены
                  </Select.Item>
                )}
              </Select.Content>
            </Select.Root>
            <Button 
              onClick={handleAdd}
              disabled={!selectedGradeName || availableGrades.length === 0}
            >
              Сохранить
            </Button>
            <Button variant="soft" onClick={() => {
              setIsAdding(false)
              setSelectedGradeName('')
            }}>
              Отмена
            </Button>
          </Flex>
        </Box>
      )}

      <Box className={styles.gradesGrid}>
          {grades.map((grade) => (
            <Box key={grade.id} className={styles.gradeCard}>
              {editingId === grade.id ? (
                <Flex gap="2" align="center" style={{ width: '100%' }}>
                  <TextField.Root
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') {
                        setEditingId(null)
                        setEditingName('')
                      }
                    }}
                  />
                  <Button size="1" onClick={handleSaveEdit}>Сохранить</Button>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                  >
                    Отмена
                  </Button>
                </Flex>
              ) : (
                <>
                  <Flex align="center" gap="2" justify="between" style={{ width: '100%' }}>
                    <Flex align="center" gap="2">
                      <StarIcon width={16} height={16} color="var(--red-9)" />
                      <Text weight="medium">{grade.name}</Text>
                    </Flex>
                    <Flex gap="1">
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleEdit(grade)}
                      >
                        <Pencil2Icon width={14} height={14} />
                      </Button>
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => handleDelete(grade.id)}
                      >
                        <TrashIcon width={14} height={14} />
                      </Button>
                    </Flex>
                  </Flex>
                  <Text size="1" color="gray">Грейд сотрудника</Text>
                </>
              )}
            </Box>
          ))}
        </Box>
    </Box>
  )
}
