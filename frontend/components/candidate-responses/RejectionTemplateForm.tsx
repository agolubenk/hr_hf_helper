'use client'

import { Box, Flex, Text, TextField, TextArea, Button, Card, Select, Switch } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import styles from './RejectionTemplateForm.module.css'

interface RejectionTemplate {
  id: number
  rejection_type: string
  rejection_type_display: string
  grade_id: number | null
  grade_name: string | null
  title: string
  message: string
  is_active: boolean
}

interface Grade {
  id: number
  name: string
}

// Моковые данные грейдов
const mockGrades: Grade[] = [
  { id: 1, name: 'Junior' },
  { id: 2, name: 'Junior+' },
  { id: 3, name: 'Middle' },
  { id: 4, name: 'Middle+' },
  { id: 5, name: 'Senior' },
]

interface RejectionTemplateFormProps {
  template: RejectionTemplate | null
  rejectionType: string
  gradeId?: number | null
  onSave: () => void
  onCancel: () => void
}

const REJECTION_TYPE_OPTIONS = [
  { value: 'office_format', label: 'Офисный формат' },
  { value: 'finance', label: 'Финансы' },
  { value: 'finance_more', label: 'Финансы - больше' },
  { value: 'finance_less', label: 'Финансы - меньше' },
  { value: 'general', label: 'Общий отказ' },
]

export default function RejectionTemplateForm({
  template,
  rejectionType,
  gradeId,
  onSave,
  onCancel
}: RejectionTemplateFormProps) {
  const [grades] = useState<Grade[]>(mockGrades)
  const [formData, setFormData] = useState({
    rejection_type: rejectionType,
    grade_id: gradeId || null,
    title: '',
    message: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData({
        rejection_type: template.rejection_type,
        grade_id: template.grade_id,
        title: template.title,
        message: template.message,
        is_active: template.is_active,
      })
    }
  }, [template])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Сохранение через API
    console.log('Сохранение шаблона:', formData)
    
    setTimeout(() => {
      setLoading(false)
      onSave()
    }, 300)
  }

  const isGradeType = rejectionType === 'grade'

  return (
    <Card className={styles.formCard}>
      <Box className={styles.formHeader}>
        <Text size="5" weight="bold">
          {template ? 'Редактировать шаблон' : 'Создать новый шаблон отказа'}
        </Text>
      </Box>

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          {!isGradeType && (
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Тип отказа *
              </Text>
              <Select.Root
                value={formData.rejection_type}
                onValueChange={(value) => setFormData({ ...formData, rejection_type: value })}
              >
                <Select.Trigger placeholder="Выберите тип отказа" />
                <Select.Content>
                  {REJECTION_TYPE_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}

          {isGradeType && (
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                Грейд *
              </Text>
              <Select.Root
                value={formData.grade_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, grade_id: parseInt(value) })}
              >
                <Select.Trigger placeholder="Выберите грейд" />
                <Select.Content>
                  {grades.map((grade) => (
                    <Select.Item key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}

          <Box>
            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Название шаблона *
            </Text>
            <TextField.Root
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название шаблона"
              required
            />
          </Box>

          <Box>
            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Текст ответа *
            </Text>
            <TextArea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Введите текст ответа для отказа"
              rows={8}
              required
            />
          </Box>

          <Flex align="center" gap="3">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              size="2"
            />
            <Text size="2">Активен</Text>
          </Flex>

          <Flex justify="end" gap="3" pt="3" style={{ borderTop: '1px solid var(--gray-6)' }}>
            <Button
              type="button"
              variant="soft"
              size="3"
              onClick={onCancel}
              disabled={loading}
            >
              <Cross2Icon width={16} height={16} />
              Отмена
            </Button>
            <Button
              type="submit"
              size="3"
              disabled={loading || !formData.title || !formData.message || (isGradeType && !formData.grade_id)}
            >
              <CheckIcon width={16} height={16} />
              {template ? 'Сохранить изменения' : 'Создать шаблон'}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  )
}
