'use client'

import { Flex, Box, Text, Button, Select, Checkbox, Separator } from "@radix-ui/themes"
import {
  CalendarIcon,
  ReloadIcon,
  OpenInNewWindowIcon,
  BoxIcon,
  ClockIcon,
  CheckIcon,
  PersonIcon,
  ClipboardIcon,
  VideoIcon,
  Link2Icon,
} from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './WorkflowHeader.module.css'

interface WorkflowHeaderProps {
  onSlotsClick: () => void
  slotsOpen: boolean
}

type WorkflowType = 'screening' | 'interview'
type InterviewFormat = 'online' | 'office'

interface Interviewer {
  id: string
  name: string
}

export default function WorkflowHeader({ onSlotsClick, slotsOpen }: WorkflowHeaderProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  const [selectedVacancy, setSelectedVacancy] = useState('frontend-react')
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat>('online')
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])

  // Моковые данные интервьюеров
  const interviewers: Interviewer[] = [
    { id: '1', name: 'Иван Петров' },
    { id: '2', name: 'Мария Сидорова' },
    { id: '3', name: 'Алексей Иванов' },
  ]

  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers(prev =>
      prev.includes(interviewerId)
        ? prev.filter(id => id !== interviewerId)
        : [...prev, interviewerId]
    )
  }

  return (
    <Box className={styles.header}>
      {/* Основной контейнер: левая часть (кнопки + тогглеры) и правая часть (выпадающий список + кнопки управления) */}
      <Flex 
        align="center" 
        justify="between" 
        width="100%" 
        gap="4"
        className={styles.headerRow}
        wrap="wrap"
      >
        {/* Левая часть: быстрые кнопки и тогглеры в один ряд */}
        <Flex 
          gap="3" 
          align="center" 
          className={styles.leftSection}
          wrap="wrap"
        >
          {/* Быстрые кнопки — переход по ссылке для коммуникации */}
          <Flex gap="2" align="center" className={styles.quickButtonsGroup}>
            <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#f97316', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#3b82f6', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4' }}>
              <CalendarIcon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#6b7280' }}>
              <Text size="3" weight="bold" style={{ color: '#ffffff' }}>📄</Text>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#10b981' }}>
              <Text size="5" weight="bold" style={{ color: '#ffffff' }}>+</Text>
            </Box>
          </Flex>

          {/* Тогглер этапов процесса: Скрининг / Интервью */}
          <Flex data-tour="workflow-toggle" gap="3" align="center" className={styles.workflowToggle}>
            <Box
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'screening'}
              onClick={() => setSelectedWorkflow('screening')}
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <ClipboardIcon width={18} height={18} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                    Скрининг
                  </Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                    30 мин
                  </Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'screening' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
            
            <Box
              data-tour="workflow-interview"
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'interview'}
              onClick={() => setSelectedWorkflow('interview')}
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <PersonIcon width={18} height={18} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                    Интервью
                  </Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                    90 мин
                  </Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'interview' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>

        {/* Правая часть: выбор вакансии, кнопки Календарь, Вакансия (вопросы и ссылка), слоты, Обновить */}
        <Box data-tour="workflow-vacancy-buttons" className={styles.rightSection}>
          <Select.Root value={selectedVacancy} onValueChange={setSelectedVacancy}>
            <Select.Trigger className={styles.vacancySelect} />
            <Select.Content className={styles.selectContent}>
              <Select.Item value="frontend-react" className={styles.selectItem}>
                Frontend Engineer (React)
              </Select.Item>
              <Select.Item value="backend-python" className={styles.selectItem}>
                Backend Engineer (Python)
              </Select.Item>
              <Select.Item value="fullstack" className={styles.selectItem}>
                Fullstack Developer
              </Select.Item>
            </Select.Content>
          </Select.Root>
          
          {/* Кнопки управления строго под выпадающим списком */}
          <Flex gap="2" align="center" justify="end" className={styles.controlsRow}>
            {/* Кнопка 1: Календарь с иконкой "Поделиться" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ backgroundColor: 'var(--gray-3)' }}
            >
              <CalendarIcon width={12} height={12} />
              <Text size="1" className={styles.calendarText}>Календарь</Text>
              <OpenInNewWindowIcon width={10} height={10} />
            </Button>
            
            {/* Кнопка 3: "Вакансия" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ backgroundColor: 'var(--gray-3)' }}
            >
              <Text size="1">Вакансия</Text>
            </Button>
            
            {/* Кнопка 4: "Свободные слоты" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              onClick={onSlotsClick}
              style={{
                backgroundColor: slotsOpen ? 'var(--accent-9)' : 'var(--accent-3)',
                color: slotsOpen ? '#ffffff' : 'var(--accent-11)',
              }}
            >
              <ClockIcon width={12} height={12} />
              <Text size="1">слоты</Text>
            </Button>
            
            {/* Кнопка 5: Обновить (круглая) */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ 
                backgroundColor: 'var(--accent-9)', 
                color: '#ffffff',
                borderRadius: '50%',
                width: '27px',
                height: '27px',
                padding: 0,
                minWidth: '27px'
              }}
            >
              <ReloadIcon width={12} height={12} />
            </Button>
          </Flex>
        </Box>
      </Flex>

      {/* Блок настроек интервью (показывается только при выборе "Интервью") */}
      {selectedWorkflow === 'interview' && (
        <Box className={styles.interviewOptionsPanel}>
          <Flex gap="4" align="center" wrap="wrap">
            {/* Тогглер формата интервью */}
            <Flex gap="2" align="center">
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'online'}
                onClick={() => setInterviewFormat('online')}
              >
                <VideoIcon width={16} height={16} />
                <Text size="2" weight="medium">Онлайн</Text>
              </Box>
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'office'}
                onClick={() => setInterviewFormat('office')}
              >
                <BoxIcon width={16} height={16} />
                <Text size="2" weight="medium">Офис</Text>
              </Box>
            </Flex>

            {/* Вертикальная линия-разделитель */}
            <Separator orientation="vertical" style={{ height: '24px' }} />

            {/* Чекбоксы интервьюеров */}
            <Flex gap="3" align="center" wrap="wrap">
              {interviewers.map(interviewer => (
                <Flex key={interviewer.id} align="center" gap="2">
                  <Checkbox
                    checked={selectedInterviewers.includes(interviewer.id)}
                    onCheckedChange={() => handleInterviewerToggle(interviewer.id)}
                  />
                  <Text size="2">{interviewer.name}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
