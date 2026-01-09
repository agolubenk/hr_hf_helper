'use client'

import { Box, Flex, Text, TextField, TextArea, Button } from "@radix-ui/themes"
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"

interface AdditionalField {
  id: string
  name: string
}

interface Grade {
  id?: number
  order?: number
  name: string
  category?: string
  level?: string
  comment?: string
  additionalFields?: { [fieldId: string]: string }
}

interface GradeFormProps {
  initialData?: Partial<Grade> | null
  additionalFields?: AdditionalField[]
  onSave: (data: Partial<Grade>) => void
  onCancel: () => void
  isCreating: boolean
}

export default function GradeForm({ initialData, additionalFields = [], onSave, onCancel, isCreating }: GradeFormProps) {
  const [formData, setFormData] = useState<Partial<Grade>>({
    name: '',
    category: '',
    level: '',
    comment: '',
    additionalFields: {},
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        level: initialData.level || '',
        comment: initialData.comment || '',
        additionalFields: initialData.additionalFields || {},
      })
    } else {
      // Для нового грейда инициализируем дополнительные поля пустыми значениями
      const emptyAdditionalFields: { [key: string]: string } = {}
      additionalFields.forEach(field => {
        emptyAdditionalFields[field.id] = ''
      })
      setFormData({
        name: '',
        category: '',
        level: '',
        comment: '',
        additionalFields: emptyAdditionalFields,
      })
    }
  }, [initialData, additionalFields])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      alert('Название грейда обязательно для заполнения')
      return
    }

    onSave(formData)
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleAdditionalFieldChange = (fieldId: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [fieldId]: e.target.value
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        {/* Название (обязательное) */}
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
            Название *
          </Text>
          <TextField.Root
            value={formData.name || ''}
            onChange={handleChange('name')}
            placeholder="Введите название грейда"
            style={{ width: '100%' }}
            required
          />
        </Box>

        {/* Категория (необязательное) */}
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
            Категория
          </Text>
          <TextField.Root
            value={formData.category || ''}
            onChange={handleChange('category')}
            placeholder="Введите категорию (например, Разработка)"
            style={{ width: '100%' }}
          />
        </Box>

        {/* Уровень (необязательное) */}
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
            Уровень
          </Text>
          <TextField.Root
            value={formData.level || ''}
            onChange={handleChange('level')}
            placeholder="Введите уровень (например, L1, L2, L3)"
            style={{ width: '100%' }}
          />
        </Box>

        {/* Комментарий (необязательное) */}
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
            Комментарий
          </Text>
          <TextArea
            value={formData.comment || ''}
            onChange={handleChange('comment')}
            placeholder="Введите комментарий"
            style={{ width: '100%' }}
            rows={3}
          />
        </Box>

        {/* Дополнительные поля */}
        {additionalFields.length > 0 && (
          <>
            <Text size="2" weight="bold" mt="2" mb="2" style={{ display: 'block' }}>
              Дополнительные поля
            </Text>
            {additionalFields.map(field => (
              <Box key={field.id}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  {field.name}
                </Text>
                <TextField.Root
                  value={formData.additionalFields?.[field.id] || ''}
                  onChange={handleAdditionalFieldChange(field.id)}
                  placeholder={`Введите значение для "${field.name}"`}
                  style={{ width: '100%' }}
                />
              </Box>
            ))}
          </>
        )}

        {/* Кнопки */}
        <Flex gap="2" justify="end" mt="2">
          <Button variant="soft" onClick={onCancel} type="button">
            <Cross2Icon width={16} height={16} />
            Отмена
          </Button>
          <Button type="submit">
            <CheckIcon width={16} height={16} />
            Сохранить
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}
