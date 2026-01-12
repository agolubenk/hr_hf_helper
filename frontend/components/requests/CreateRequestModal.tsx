'use client'

import { Box, Flex, Text, Button, Dialog, TextField, TextArea, Select, Card } from "@radix-ui/themes"
import { PlusIcon, InfoCircledIcon, CalendarIcon, FileTextIcon, PersonIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import styles from './CreateRequestModal.module.css'

interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
}

// Моковые данные для выпадающих списков
const mockVacancies = [
  'Backend Engineer (Java)',
  'Frontend Engineer (React)',
  'DevOps Engineer',
  'QA Engineer',
  'Backend Engineer (Python)',
  'Mobile Developer (iOS)',
  'Mobile Developer (Android)',
  'Data Engineer',
  'Security Engineer'
]

const mockGrades = [
  'Junior',
  'Junior+',
  'Middle',
  'Middle+',
  'Senior',
  'Lead',
  'Head'
]

const mockPriorities = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
]

const mockReasons = [
  { value: 'new', label: 'Новая' },
  { value: 'replacement', label: 'Замена' },
  { value: 'expansion', label: 'Расширение' },
  { value: 'project', label: 'Проект' }
]

const mockRecruiters = [
  'Golubenko A.',
  'Chernomordin A.',
  'Andrei Golubenko',
  'Иванов И.И.',
  'Петров П.П.'
]

export default function CreateRequestModal({ isOpen, onClose, onSave }: CreateRequestModalProps) {
  const [formData, setFormData] = useState({
    vacancy: '',
    grade: '',
    project: '',
    priority: 'medium',
    reason: 'new',
    openingDate: '',
    deadline: '',
    recruiter: '',
    notes: ''
  })

  const [calculatedDeadline, setCalculatedDeadline] = useState<string | null>(null)

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        vacancy: '',
        grade: '',
        project: '',
        priority: 'medium',
        reason: 'new',
        openingDate: '',
        deadline: '',
        recruiter: '',
        notes: ''
      })
      setCalculatedDeadline(null)
    }
  }, [isOpen])

  // Расчет дедлайна на основе SLA (моковая логика)
  useEffect(() => {
    if (formData.vacancy && formData.grade && formData.openingDate && formData.openingDate.length === 10) {
      // В реальном приложении здесь будет запрос к API для получения SLA
      // Пока используем моковые данные
      const mockSlaDays = 30 // Пример: 30 дней из SLA
      const [day, month, year] = formData.openingDate.split('.')
      const openingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(openingDate.getTime())) {
        const deadlineDate = new Date(openingDate)
        deadlineDate.setDate(deadlineDate.getDate() + mockSlaDays)
        const deadlineDay = String(deadlineDate.getDate()).padStart(2, '0')
        const deadlineMonth = String(deadlineDate.getMonth() + 1).padStart(2, '0')
        const deadlineYear = deadlineDate.getFullYear()
        setCalculatedDeadline(`${deadlineDay}.${deadlineMonth}.${deadlineYear}`)
      }
    } else {
      setCalculatedDeadline(null)
    }
  }, [formData.vacancy, formData.grade, formData.openingDate])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Валидация обязательных полей
    if (!formData.vacancy || !formData.grade || !formData.priority || !formData.reason || !formData.openingDate) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    const requestData = {
      ...formData,
      deadline: calculatedDeadline || formData.deadline
    }

    onSave(requestData)
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <PlusIcon width={20} height={20} />
            Создание заявки
          </Flex>
        </Dialog.Title>

        <Flex gap="4" direction="column" mt="4">
          <Flex gap="4" style={{ flexWrap: 'wrap' }}>
            {/* Основная информация */}
            <Card className={styles.sectionCard} style={{ flex: 1, minWidth: '400px' }}>
              <Flex align="center" gap="2" mb="4">
                <Box className={styles.sectionIcon}>
                  <Box className={styles.dotIcon} />
                </Box>
                <Text size="4" weight="bold">Основная информация</Text>
              </Flex>

              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Вакансия <Text color="red">*</Text>
                  </Text>
                  <Select.Root
                    value={formData.vacancy}
                    onValueChange={(value) => handleChange('vacancy', value)}
                  >
                    <Select.Trigger style={{ width: '100%' }} placeholder="---------" />
                    <Select.Content>
                      {mockVacancies.map(vacancy => (
                        <Select.Item key={vacancy} value={vacancy}>
                          {vacancy}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Грейд <Text color="red">*</Text>
                  </Text>
                  <Select.Root
                    value={formData.grade}
                    onValueChange={(value) => handleChange('grade', value)}
                  >
                    <Select.Trigger style={{ width: '100%' }} placeholder="---------" />
                    <Select.Content>
                      {mockGrades.map(grade => (
                        <Select.Item key={grade} value={grade}>
                          {grade}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Проект
                  </Text>
                  <TextField.Root
                    value={formData.project}
                    onChange={(e) => handleChange('project', e.target.value)}
                    placeholder="Введите название проекта"
                    size="2"
                    style={{ width: '100%' }}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Приоритет <Text color="red">*</Text>
                  </Text>
                  <Select.Root
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {mockPriorities.map(priority => (
                        <Select.Item key={priority.value} value={priority.value}>
                          {priority.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Причина открытия <Text color="red">*</Text>
                  </Text>
                  <Select.Root
                    value={formData.reason}
                    onValueChange={(value) => handleChange('reason', value)}
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {mockReasons.map(reason => (
                        <Select.Item key={reason.value} value={reason.value}>
                          {reason.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>
            </Card>

            {/* Даты */}
            <Card className={styles.sectionCard} style={{ flex: 1, minWidth: '400px' }}>
              <Flex align="center" gap="2" mb="4">
                <CalendarIcon width={20} height={20} />
                <Text size="4" weight="bold">Даты</Text>
              </Flex>

              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Дата открытия <Text color="red">*</Text>
                  </Text>
                  <Flex align="center" gap="2">
                    <TextField.Root
                      type="text"
                      value={formData.openingDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length > 0) {
                          if (value.length <= 2) {
                            value = value
                          } else if (value.length <= 4) {
                            value = value.slice(0, 2) + '.' + value.slice(2)
                          } else {
                            value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4, 8)
                          }
                        }
                        handleChange('openingDate', value)
                      }}
                      placeholder="ДД.ММ.ГГГГ"
                      size="2"
                      style={{ flex: 1 }}
                      maxLength={10}
                    />
                    <CalendarIcon width={20} height={20} style={{ color: 'var(--gray-11)' }} />
                  </Flex>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Дедлайн
                  </Text>
                  <Box className={styles.deadlineInfo}>
                    <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                      Будет рассчитан автоматически на основе SLA
                    </Text>
                    <Text size="1" color="gray">
                      Автоматически рассчитывается из SLA при выборе вакансии и грейда
                    </Text>
                    {calculatedDeadline && (
                      <Text size="2" weight="bold" mt="2" style={{ display: 'block', color: 'var(--accent-9)' }}>
                        {calculatedDeadline}
                      </Text>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Рекрутер
                  </Text>
                  <Select.Root
                    value={formData.recruiter}
                    onValueChange={(value) => handleChange('recruiter', value)}
                  >
                    <Select.Trigger style={{ width: '100%' }} placeholder="Выберите рекрутера..." />
                    <Select.Content>
                      {mockRecruiters.map(recruiter => (
                        <Select.Item key={recruiter} value={recruiter}>
                          {recruiter}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Flex align="center" gap="2" mt="2">
                    <PersonIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                    <Text size="1" color="gray">
                      Ответственный рекрутер за данную заявку
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Card>
          </Flex>

          {/* Заметки */}
          <Card className={styles.sectionCard}>
            <Flex align="center" gap="2" mb="4">
              <FileTextIcon width={20} height={20} />
              <Text size="4" weight="bold">Заметки</Text>
            </Flex>

            <Box>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Введите заметки"
                rows={5}
                style={{ width: '100%', resize: 'vertical' }}
              />
              <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                Дополнительная информация по заявке
              </Text>
            </Box>
          </Card>
        </Flex>

        <Flex justify="end" gap="3" mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <Button variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Создать заявку
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
