'use client'

import {
  Box,
  Flex,
  Text,
  Button,
  Dialog,
  TextArea,
  Select,
  Card,
  Checkbox,
  Switch,
} from '@radix-ui/themes'
import { PlusIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import BasicInfoEditSection from './edit/BasicInfoEditSection'
import styles from './AddVacancyModal.module.css'

// Типы для данных формы
export interface AddVacancyFormData {
  basicInfo: {
    title: string
    status: 'active' | 'inactive'
    recruiter: string
    technologies: string
    huntflowId: string
  }
  text: {
    departmentId: string
    header: string
  }
  recruiters: {
    selectedIds: string[]
    mainId: string | null
  }
}

type AddVacancyTab = 'basic' | 'text' | 'recruiters'

// Моковые отделы (упрощённая иерархия)
interface Department {
  id: string
  name: string
  parent: string | null
  children?: Department[]
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'IT Департамент',
    parent: null,
    children: [
      {
        id: '2',
        name: 'Отдел разработки',
        parent: '1',
        children: [
          { id: '5', name: 'Frontend команда', parent: '2', children: [] },
          { id: '6', name: 'Backend команда', parent: '2', children: [] },
        ],
      },
      { id: '3', name: 'Отдел тестирования', parent: '1', children: [] },
    ],
  },
  { id: '4', name: 'HR Департамент', parent: null, children: [] },
]

function getAllDepartmentsFlat(
  departments: Department[],
  level = 0
): Array<{ id: string; name: string; level: number }> {
  const result: Array<{ id: string; name: string; level: number }> = []
  departments.forEach((dept) => {
    result.push({ id: dept.id, name: dept.name, level })
    if (dept.children?.length) {
      result.push(...getAllDepartmentsFlat(dept.children, level + 1))
    }
  })
  return result
}

const flatDepartments = getAllDepartmentsFlat(mockDepartments)

// Моковые рекрутеры
const mockRecruiters = [
  { id: '1', name: 'Иван Иванов', email: 'ivan@company.com', phone: '+7 (999) 111-22-33', position: 'Senior Recruiter' },
  { id: '2', name: 'Петр Петров', email: 'petr@company.com', phone: '+7 (999) 222-33-44', position: 'Recruiter' },
  { id: '3', name: 'Мария Сидорова', email: 'maria@company.com', phone: '+7 (999) 333-44-55', position: 'Lead Recruiter' },
  { id: '4', name: 'Анна Смирнова', email: 'anna@company.com', phone: '+7 (999) 444-55-66', position: 'Recruiter' },
  { id: '5', name: 'Дмитрий Козлов', email: 'dmitry@company.com', phone: '+7 (999) 555-66-77', position: 'Junior Recruiter' },
]

const initialFormData: AddVacancyFormData = {
  basicInfo: {
    title: '',
    status: 'active',
    recruiter: '',
    technologies: '',
    huntflowId: '',
  },
  text: {
    departmentId: '',
    header: '',
  },
  recruiters: {
    selectedIds: [],
    mainId: null,
  },
}

interface AddVacancyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AddVacancyFormData) => void
}

export default function AddVacancyModal({ isOpen, onClose, onSave }: AddVacancyModalProps) {
  const [activeTab, setActiveTab] = useState<AddVacancyTab>('basic')
  const [formData, setFormData] = useState<AddVacancyFormData>(initialFormData)

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setActiveTab('basic')
    }
  }, [isOpen])

  const handleBasicInfoChange = (data: Partial<AddVacancyFormData['basicInfo']>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }))
  }

  const handleRecruiterToggle = (id: string) => {
    setFormData((prev) => {
      const next = new Set(prev.recruiters.selectedIds)
      if (next.has(id)) {
        next.delete(id)
        const mainId = prev.recruiters.mainId === id ? null : prev.recruiters.mainId
        return { ...prev, recruiters: { selectedIds: [...next], mainId } }
      }
      next.add(id)
      return { ...prev, recruiters: { ...prev.recruiters, selectedIds: [...next] } }
    })
  }

  const handleMainRecruiterToggle = (id: string) => {
    setFormData((prev) => {
      if (!prev.recruiters.selectedIds.includes(id)) return prev
      const mainId = prev.recruiters.mainId === id ? null : id
      return { ...prev, recruiters: { ...prev.recruiters, mainId } }
    })
  }

  const handleSave = () => {
    if (!formData.basicInfo.title?.trim()) {
      alert('Заполните название вакансии')
      return
    }
    if (!formData.basicInfo.recruiter) {
      alert('Выберите ответственного рекрутера')
      return
    }
    onSave(formData)
    onClose()
  }

  const tabs: { id: AddVacancyTab; label: string }[] = [
    { id: 'basic', label: 'Основная информация' },
    { id: 'text', label: 'Текст вакансии' },
    { id: 'recruiters', label: 'Рекрутеры' },
  ]

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className={styles.modalContent}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <PlusIcon width={20} height={20} />
            Добавить вакансию
          </Flex>
        </Dialog.Title>

        <Flex className={styles.layout}>
          <Box className={styles.tabsColumn}>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Разделы
            </Text>
            <Flex direction="column" gap="1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'solid' : 'soft'}
                  size="2"
                  className={styles.tabButton}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box className={styles.contentColumn}>
            {activeTab === 'basic' && (
              <BasicInfoEditSection
                data={formData.basicInfo}
                onChange={handleBasicInfoChange}
              />
            )}

            {activeTab === 'text' && (
              <Box className={styles.sectionCard}>
                <Flex align="center" gap="2" mb="4" className={styles.header}>
                  <Box className={styles.iconCircle}>
                    <InfoCircledIcon width={16} height={16} />
                  </Box>
                  <Text size="5" weight="bold">
                    Текст вакансии
                  </Text>
                </Flex>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Отдел
                    </Text>
                    <Select.Root
                      value={formData.text.departmentId}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          text: { ...prev.text, departmentId: v },
                        }))
                      }
                    >
                      <Select.Trigger placeholder="Выберите отдел" style={{ width: '100%' }} />
                      <Select.Content>
                        {flatDepartments.map((d) => (
                          <Select.Item key={d.id} value={d.id}>
                            {'  '.repeat(d.level)}
                            {d.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Шапка
                    </Text>
                    <TextArea
                      value={formData.text.header}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          text: { ...prev.text, header: e.target.value },
                        }))
                      }
                      placeholder="Введите текст шапки вакансии"
                      rows={6}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </Box>
                </Flex>
              </Box>
            )}

            {activeTab === 'recruiters' && (
              <Box className={styles.sectionCard}>
                <Text size="5" weight="bold" mb="4" style={{ display: 'block' }}>
                  Рекрутеры
                </Text>
                <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                  Выберите рекрутеров, которые будут работать с вакансией. Отметьте главного рекрутера.
                </Text>
                <Flex direction="column" gap="3">
                  {mockRecruiters.map((r) => {
                    const isSelected = formData.recruiters.selectedIds.includes(r.id)
                    const isMain = formData.recruiters.mainId === r.id
                    return (
                      <Card key={r.id} className={styles.recruiterCard}>
                        <Flex align="center" gap="3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRecruiterToggle(r.id)}
                          />
                          <Flex direction="column" gap="1" style={{ flex: 1 }}>
                            <Flex align="center" gap="2">
                              <Text size="3" weight="medium">
                                {r.name}
                              </Text>
                              {isMain && (
                                <Text size="1" color="blue" weight="medium">
                                  Главный
                                </Text>
                              )}
                            </Flex>
                            <Text size="2" color="gray">
                              {r.position}
                            </Text>
                            <Text size="1" color="gray">
                              {r.email}
                            </Text>
                          </Flex>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                              Главный
                            </Text>
                            <Switch
                              checked={isMain}
                              disabled={!isSelected}
                              onCheckedChange={() => handleMainRecruiterToggle(r.id)}
                            />
                          </Box>
                        </Flex>
                      </Card>
                    )
                  })}
                </Flex>
              </Box>
            )}
          </Box>
        </Flex>

        <Flex justify="end" gap="3" className={styles.footer}>
          <Button size="3" variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button size="3" variant="solid" onClick={handleSave}>
            Создать вакансию
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
