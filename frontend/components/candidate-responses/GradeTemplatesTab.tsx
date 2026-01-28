'use client'

import { Box, Flex, Text, Card, Button, Badge, Callout } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, StarIcon, InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import RejectionTemplateForm from "./RejectionTemplateForm"
import styles from './GradeTemplatesTab.module.css'

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

// Моковые данные шаблонов по грейдам
const mockTemplates: Record<number, RejectionTemplate[]> = {
  1: [], // Junior
  2: [], // Junior+
  3: [], // Middle
  4: [], // Middle+
  5: [], // Senior
}

export default function GradeTemplatesTab() {
  const toast = useToast()
  const [grades] = useState<Grade[]>(mockGrades)
  const [templates, setTemplates] = useState<Record<number, RejectionTemplate[]>>(mockTemplates)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<RejectionTemplate | null>(null)
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)

  const toggleSection = (gradeId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gradeId)) {
        newSet.delete(gradeId)
      } else {
        newSet.add(gradeId)
      }
      return newSet
    })
  }

  const handleCreate = (gradeId: number) => {
    setSelectedGradeId(gradeId)
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEdit = (template: RejectionTemplate) => {
    setEditingTemplate(template)
    setSelectedGradeId(template.grade_id || null)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    toast.showWarning('Удалить шаблон?', 'Вы уверены, что хотите удалить этот шаблон?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            const updatedTemplates: Record<number, RejectionTemplate[]> = {}
            for (const gradeId in templates) {
              updatedTemplates[parseInt(gradeId)] = templates[parseInt(gradeId)].filter(t => t.id !== id)
            }
            setTemplates(updatedTemplates)
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTemplate(null)
    setSelectedGradeId(null)
  }

  const handleFormSave = () => {
    // TODO: Обновить моковые данные после сохранения
    handleFormClose()
  }

  if (showForm) {
    return (
      <RejectionTemplateForm
        template={editingTemplate}
        rejectionType="grade"
        gradeId={selectedGradeId}
        onSave={handleFormSave}
        onCancel={handleFormClose}
      />
    )
  }

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="3">
        {grades.map((grade) => {
          const gradeTemplates = templates[grade.id] || []
          const isExpanded = expandedSections.has(grade.id)

          return (
            <Card key={grade.id} className={styles.accordionItem}>
              <Box 
                className={styles.accordionHeader}
                onClick={() => toggleSection(grade.id)}
                style={{ cursor: 'pointer' }}
              >
                <Flex align="center" justify="between">
                  <Flex align="center" gap="2">
                    <StarIcon width={16} height={16} style={{ color: 'white' }} />
                    <Text size="4" weight="bold" style={{ color: 'white' }}>
                      {grade.name}
                    </Text>
                  </Flex>
                  {isExpanded ? (
                    <ChevronUpIcon width={16} height={16} style={{ color: 'white' }} />
                  ) : (
                    <ChevronDownIcon width={16} height={16} style={{ color: 'white' }} />
                  )}
                </Flex>
              </Box>
              
              {isExpanded && (
                <Box className={styles.accordionContent}>
                  {gradeTemplates.length === 0 ? (
                    <Callout.Root color="gray" size="2">
                      <Callout.Icon>
                        <InfoCircledIcon />
                      </Callout.Icon>
                      <Callout.Text>
                        Нет шаблонов для грейда "{grade.name}"
                      </Callout.Text>
                    </Callout.Root>
                  ) : (
                    <Flex direction="column" gap="3">
                      {gradeTemplates.map((template) => (
                        <Card key={template.id} className={styles.templateCard}>
                          <Flex direction="column" gap="3">
                            <Flex justify="between" align="start">
                              <Flex direction="column" gap="1">
                                <Flex align="center" gap="2">
                                  <Text size="4" weight="bold">{template.title}</Text>
                                  <Badge color={template.is_active ? 'green' : 'gray'}>
                                    {template.is_active ? 'Активен' : 'Неактивен'}
                                  </Badge>
                                </Flex>
                              </Flex>
                              <Flex gap="2">
                                <Button
                                  size="2"
                                  variant="soft"
                                  color="green"
                                  onClick={() => handleEdit(template)}
                                >
                                  <Pencil2Icon width={14} height={14} />
                                  Редактировать
                                </Button>
                                <Button
                                  size="2"
                                  variant="soft"
                                  color="red"
                                  onClick={() => handleDelete(template.id)}
                                >
                                  <TrashIcon width={14} height={14} />
                                  Удалить
                                </Button>
                              </Flex>
                            </Flex>
                            <Box className={styles.messageBox}>
                              <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                                {template.message}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  )}
                  <Flex justify="end" mt="4">
                    <Button
                      size="3"
                      onClick={() => handleCreate(grade.id)}
                    >
                      <PlusIcon width={16} height={16} />
                      Создать шаблон
                    </Button>
                  </Flex>
                </Box>
              )}
            </Card>
          )
        })}
      </Flex>
    </Box>
  )
}
