'use client'

import { Box, Flex, Text, Button, Card, Table, TextField, Select, Dialog } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, Cross2Icon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './CandidateFieldsSettings.module.css'

interface CandidateField {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'url'
  required: boolean
  order: number
  options?: string[] // Для типа select
  placeholder?: string
}

// Моковые данные
const mockFields: CandidateField[] = [
  {
    id: '1',
    name: 'Возраст',
    type: 'number',
    required: false,
    order: 1,
    placeholder: 'Введите возраст'
  },
  {
    id: '2',
    name: 'Пол',
    type: 'select',
    required: false,
    order: 2,
    options: ['Мужской', 'Женский', 'Не указано']
  },
  {
    id: '3',
    name: 'Зарплатные ожидания',
    type: 'text',
    required: false,
    order: 3,
    placeholder: 'Введите зарплатные ожидания'
  },
  {
    id: '4',
    name: 'Опыт работы',
    type: 'number',
    required: false,
    order: 4,
    placeholder: 'Введите опыт работы в годах'
  },
  {
    id: '5',
    name: 'LinkedIn профиль',
    type: 'url',
    required: false,
    order: 5,
    placeholder: 'https://linkedin.com/in/username'
  },
]

const fieldTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выпадающий список' },
  { value: 'date', label: 'Дата' },
  { value: 'textarea', label: 'Многострочный текст' },
  { value: 'url', label: 'Ссылка' },
]

export default function CandidateFieldsSettings() {
  const toast = useToast()
  const [fields, setFields] = useState<CandidateField[]>(mockFields)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<CandidateField | null>(null)
  const [formData, setFormData] = useState<Partial<CandidateField>>({
    name: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: []
  })
  const [newOption, setNewOption] = useState('')

  const handleAddField = () => {
    setEditingField(null)
    setFormData({
      name: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    })
    setNewOption('')
    setIsDialogOpen(true)
  }

  const handleEditField = (field: CandidateField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
      options: field.options || []
    })
    setNewOption('')
    setIsDialogOpen(true)
  }

  const handleDeleteField = (id: string) => {
    toast.showWarning('Удалить поле?', 'Вы уверены, что хотите удалить это поле?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setFields(prev => prev.filter(f => f.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleMoveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id)
    if (index === -1) return

    const newFields = [...fields]
    if (direction === 'up' && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
      newFields[index - 1].order = index
      newFields[index].order = index + 1
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]]
      newFields[index].order = index + 1
      newFields[index + 1].order = index + 2
    }
    setFields(newFields)
  }

  const handleSaveField = () => {
    if (!formData.name) {
      alert('Пожалуйста, введите название поля')
      return
    }

    if (editingField) {
      // Редактирование существующего поля
      setFields(fields.map(f => 
        f.id === editingField.id 
          ? { ...f, ...formData, options: formData.type === 'select' ? formData.options : undefined }
          : f
      ))
    } else {
      // Добавление нового поля
      const newField: CandidateField = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type as CandidateField['type'],
        required: formData.required || false,
        order: fields.length + 1,
        placeholder: formData.placeholder,
        options: formData.type === 'select' ? formData.options : undefined
      }
      setFields([...fields, newField])
    }

    setIsDialogOpen(false)
  }

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()]
      })
      setNewOption('')
    }
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(formData.options || [])]
    newOptions.splice(index, 1)
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="3" color="gray">
          Управляйте дополнительными полями, которые будут отображаться в профилях кандидатов
        </Text>
        <Button onClick={handleAddField}>
          <PlusIcon width={16} height={16} />
          Добавить поле
        </Button>
      </Flex>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell style={{ width: '50px' }}>Порядок</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Обязательное</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ width: '200px' }}>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => (
              <Table.Row key={field.id}>
                <Table.Cell>
                  <Flex gap="1">
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => handleMoveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUpIcon width={12} height={12} />
                    </Button>
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => handleMoveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDownIcon width={12} height={12} />
                    </Button>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text weight="medium">{field.name}</Text>
                  {field.placeholder && (
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                      {field.placeholder}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text>{fieldTypes.find(t => t.value === field.type)?.label || field.type}</Text>
                  {field.type === 'select' && field.options && (
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
                      {field.options.length} вариантов
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {field.required ? (
                    <Text color="green">Да</Text>
                  ) : (
                    <Text color="gray">Нет</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => handleEditField(field)}
                    >
                      <Pencil2Icon width={14} height={14} />
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => handleDeleteField(field.id)}
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

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content style={{ maxWidth: '600px' }}>
          <Dialog.Title>
            {editingField ? 'Редактировать поле' : 'Добавить поле'}
          </Dialog.Title>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Название поля *
              </Text>
              <TextField.Root
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Возраст"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Тип поля *
              </Text>
              <Select.Root
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    type: value as CandidateField['type'],
                    options: value === 'select' ? (formData.options || []) : undefined
                  })
                }}
              >
                <Select.Trigger />
                <Select.Content>
                  {fieldTypes.map(type => (
                    <Select.Item key={type.value} value={type.value}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {formData.type === 'select' && (
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Варианты выбора
                </Text>
                <Flex gap="2" mb="2">
                  <TextField.Root
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Добавить вариант"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddOption()
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={handleAddOption}>
                    <PlusIcon width={16} height={16} />
                  </Button>
                </Flex>
                {formData.options && formData.options.length > 0 && (
                  <Flex direction="column" gap="1">
                    {formData.options.map((option, index) => (
                      <Flex key={index} align="center" gap="2" style={{ padding: '8px', backgroundColor: 'var(--gray-2)', borderRadius: '4px' }}>
                        <Text size="2" style={{ flex: 1 }}>{option}</Text>
                        <Button
                          size="1"
                          variant="ghost"
                          color="red"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <TrashIcon width={12} height={12} />
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>
            )}

            {(formData.type === 'text' || formData.type === 'number' || formData.type === 'textarea' || formData.type === 'url') && (
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Placeholder
                </Text>
                <TextField.Root
                  value={formData.placeholder || ''}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder={formData.type === 'url' ? 'Например: https://example.com' : 'Подсказка для поля'}
                />
              </Box>
            )}

            <Flex align="center" gap="2">
              <input
                type="checkbox"
                checked={formData.required || false}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                id="required-field"
              />
              <Text size="2" as="label" htmlFor="required-field" style={{ cursor: 'pointer' }}>
                Обязательное поле
              </Text>
            </Flex>
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveField}>
              <CheckIcon width={16} height={16} />
              Сохранить
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
