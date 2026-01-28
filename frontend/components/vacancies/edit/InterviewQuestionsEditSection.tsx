'use client'

import { Box, Flex, Text, TextArea } from "@radix-ui/themes"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import styles from './InterviewQuestionsEditSection.module.css'

interface InterviewQuestionsEditSectionProps {
  questions: {
    belarus: string
    poland: string
  }
  onChange: (questions: InterviewQuestionsEditSectionProps['questions']) => void
}

export default function InterviewQuestionsEditSection({ questions, onChange }: InterviewQuestionsEditSectionProps) {
  return (
    <Box id="interview-questions" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <QuestionMarkCircledIcon width={20} height={20} />
        <Text size="5" weight="bold">Вопросы для интервью</Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex align="center" gap="2" mb="1">
            <Text size="2" style={{ fontSize: '16px' }}>🇧🇾</Text>
            <Text size="3" weight="bold">Вопросы Беларусь</Text>
          </Flex>
          <TextArea
            value={questions.belarus}
            onChange={(e) => onChange({ ...questions, belarus: e.target.value })}
            placeholder="Вопросы для интервью в Беларуси"
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Вопросы для интервью в Беларуси
          </Text>
        </Flex>

        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Flex align="center" gap="2" mb="1">
            <Text size="2" style={{ fontSize: '16px' }}>🇵🇱</Text>
            <Text size="3" weight="bold">Вопросы Польша</Text>
          </Flex>
          <TextArea
            value={questions.poland}
            onChange={(e) => onChange({ ...questions, poland: e.target.value })}
            placeholder="Вопросы для интервью в Польше"
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Вопросы для интервью в Польше
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
