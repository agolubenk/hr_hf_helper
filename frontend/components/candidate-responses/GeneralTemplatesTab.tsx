'use client'

import { Box, Flex, Text, Card, Button, Badge, Callout } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon, Pencil2Icon, TrashIcon, InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import RejectionTemplateForm from "./RejectionTemplateForm"
import styles from './GeneralTemplatesTab.module.css'

interface RejectionTemplate {
  id: number
  rejection_type: string
  rejection_type_display: string
  title: string
  message: string
  is_active: boolean
}

const REJECTION_TYPES = [
  { value: 'office_format', label: 'Офисный формат' },
  { value: 'finance', label: 'Финансы' },
  { value: 'finance_more', label: 'Финансы - больше' },
  { value: 'finance_less', label: 'Финансы - меньше' },
  { value: 'general', label: 'Общий отказ' },
]

// Моковые данные
const mockTemplates: Record<string, RejectionTemplate[]> = {
  office_format: [
    {
      id: 1,
      rejection_type: 'office_format',
      rejection_type_display: 'Офисный формат',
      title: 'Отказ по офису',
      message: 'Хочу отметить, что у нас строго офисный формат, поэтому, к сожалению, не сможем пока что поработать вместе. Если что-то изменится у вас, то предлагаю сохранить контакт и не теряться, а также буду рад порекомендовать вас другим компаниям.',
      is_active: true,
    },
  ],
  finance: [],
  finance_more: [],
  finance_less: [],
  general: [],
}

export default function GeneralTemplatesTab() {
  const toast = useToast()
  const [templates, setTemplates] = useState<Record<string, RejectionTemplate[]>>(mockTemplates)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['office_format']))
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<RejectionTemplate | null>(null)
  const [formType, setFormType] = useState<string>('')

  const toggleSection = (type: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const handleCreate = (type: string) => {
    setFormType(type)
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEdit = (template: RejectionTemplate) => {
    setEditingTemplate(template)
    setFormType(template.rejection_type)
    setShowForm(true)
  }

  const handleDelete = (id: number, rejectionType?: string) => {
    const type = rejectionType || editingTemplate?.rejection_type || formType
    toast.showWarning('Удалить шаблон?', 'Вы уверены, что хотите удалить этот шаблон?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            if (type) {
              setTemplates(prev => ({
                ...prev,
                [type]: prev[type].filter(t => t.id !== id)
              }))
            } else {
              setTemplates(prev => {
                const updated: Record<string, RejectionTemplate[]> = {}
                for (const key in prev) {
                  updated[key] = prev[key].filter(t => t.id !== id)
                }
                return updated
              })
            }
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
    setFormType('')
  }

  const handleFormSave = () => {
    // TODO: Обновить моковые данные после сохранения
    handleFormClose()
  }

  if (showForm) {
    return (
      <RejectionTemplateForm
        template={editingTemplate ? { ...editingTemplate, grade_id: null, grade_name: null } : null}
        rejectionType={formType}
        onSave={handleFormSave}
        onCancel={handleFormClose}
      />
    )
  }

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="3">
        {REJECTION_TYPES.map((type) => {
          const typeTemplates = templates[type.value] || []
          const isExpanded = expandedSections.has(type.value)

          return (
            <Card key={type.value} className={styles.accordionItem}>
              <Box 
                className={styles.accordionHeader}
                onClick={() => toggleSection(type.value)}
                style={{ cursor: 'pointer' }}
              >
                <Flex align="center" justify="between">
                  <Text size="4" weight="bold" style={{ color: 'white' }}>
                    {type.label}
                  </Text>
                  {isExpanded ? (
                    <ChevronUpIcon width={16} height={16} style={{ color: 'white' }} />
                  ) : (
                    <ChevronDownIcon width={16} height={16} style={{ color: 'white' }} />
                  )}
                </Flex>
              </Box>
              
              {isExpanded && (
                <Box className={styles.accordionContent}>
                  {typeTemplates.length === 0 ? (
                    <Callout.Root color="gray" size="2">
                      <Callout.Icon>
                        <InfoCircledIcon />
                      </Callout.Icon>
                      <Callout.Text>
                        Нет шаблонов для {type.label.toLowerCase()}
                      </Callout.Text>
                    </Callout.Root>
                  ) : (
                    <Flex direction="column" gap="3">
                      {typeTemplates.map((template) => (
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
                                  onClick={() => handleDelete(template.id, template.rejection_type)}
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
                      onClick={() => handleCreate(type.value)}
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
