'use client'

import { Box, Flex, Text, Checkbox } from "@radix-ui/themes"
import { PersonIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import styles from './InterviewersEditSection.module.css'

interface Interviewer {
  id: number
  name: string
  email: string
  selected: boolean
}

interface InterviewersEditSectionProps {
  interviewers: Interviewer[]
  title: string
  subtitle?: string
  helpText?: string
  onChange: (interviewers: Interviewer[]) => void
}

export default function InterviewersEditSection({ 
  interviewers, 
  title, 
  subtitle,
  helpText,
  onChange 
}: InterviewersEditSectionProps) {
  const handleToggle = (id: number) => {
    onChange(
      interviewers.map(interviewer =>
        interviewer.id === id
          ? { ...interviewer, selected: !interviewer.selected }
          : interviewer
      )
    )
  }

  // Разделяем на 3 колонки
  const column1 = interviewers.filter((_, index) => index % 3 === 0)
  const column2 = interviewers.filter((_, index) => index % 3 === 1)
  const column3 = interviewers.filter((_, index) => index % 3 === 2)

  return (
    <Box id={title.includes('Обязательные') ? 'mandatory-participants' : 'interviewers'} className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
        <PersonIcon width={20} height={20} />
        <Text size="5" weight="bold">{title}</Text>
      </Flex>
      
      {subtitle && (
        <Text size="2" weight="bold" mb="3" style={{ color: 'var(--gray-11)' }}>{subtitle}</Text>
      )}

      <Flex gap="4" wrap="wrap" className={styles.interviewersContainer}>
        <Flex direction="column" gap="2" style={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
          {column1.map((interviewer) => (
            <Flex key={interviewer.id} align="center" gap="2">
              <Checkbox
                checked={interviewer.selected}
                onCheckedChange={() => handleToggle(interviewer.id)}
              />
              <Text size="2">
                {interviewer.name} ({interviewer.email})
              </Text>
            </Flex>
          ))}
        </Flex>

        <Flex direction="column" gap="2" style={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
          {column2.map((interviewer) => (
            <Flex key={interviewer.id} align="center" gap="2">
              <Checkbox
                checked={interviewer.selected}
                onCheckedChange={() => handleToggle(interviewer.id)}
              />
              <Text size="2">
                {interviewer.name} ({interviewer.email})
              </Text>
            </Flex>
          ))}
        </Flex>

        <Flex direction="column" gap="2" style={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
          {column3.map((interviewer) => (
            <Flex key={interviewer.id} align="center" gap="2">
              <Checkbox
                checked={interviewer.selected}
                onCheckedChange={() => handleToggle(interviewer.id)}
              />
              <Text size="2">
                {interviewer.name} ({interviewer.email})
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      {helpText && (
        <Flex align="center" gap="2" mt="3">
          <InfoCircledIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            {title.includes('Обязательные') 
              ? 'Выберите интервьюеров, которые обязательно должны участвовать в техническом интервью'
              : helpText}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
