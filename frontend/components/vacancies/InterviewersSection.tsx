'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { PersonIcon } from "@radix-ui/react-icons"
import styles from './InterviewersSection.module.css'

interface InterviewersSectionProps {
  interviewers: string[]
  title: string
  subtitle?: string
}

export default function InterviewersSection({ interviewers, title, subtitle }: InterviewersSectionProps) {
  const sectionId = title.includes('Обязательные') ? 'mandatory-participants' : 'interviewers'
  
  return (
    <Box id={sectionId} className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
        <PersonIcon width={20} height={20} />
        <Text size="5" weight="bold">{title}</Text>
      </Flex>
      {subtitle && (
        <Text size="2" mb="3" style={{ color: 'var(--gray-11)' }}>{subtitle}</Text>
      )}
      {interviewers.length > 0 ? (
        <Flex gap="2" wrap="wrap">
          {interviewers.map((interviewer, index) => (
            <Box key={index} className={styles.interviewerTag}>
              <PersonIcon width={14} height={14} />
              <Text size="2">{interviewer}</Text>
            </Box>
          ))}
        </Flex>
      ) : (
        <Text size="2" style={{ color: 'var(--gray-11)' }}>
          {title.includes('Обязательные') ? 'Обязательные участники не назначены' : 'Интервьюеры не назначены'}
        </Text>
      )}
    </Box>
  )
}
