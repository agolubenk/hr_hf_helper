'use client'

import { Box, Flex, Text, TextArea } from "@radix-ui/themes"
import { ClipboardIcon } from "@radix-ui/react-icons"
import styles from './AnalysisPromptEditSection.module.css'

interface AnalysisPromptEditSectionProps {
  prompt: string
  onChange: (prompt: string) => void
}

export default function AnalysisPromptEditSection({ prompt, onChange }: AnalysisPromptEditSectionProps) {
  return (
    <Box id="analysis-prompt" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <ClipboardIcon width={20} height={20} />
        <Text size="5" weight="bold">Промпт для анализа после скрининга</Text>
      </Flex>

      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
            Промпт для обновления кандидата
          </Text>
          <TextArea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ты - HR-аналитик..."
            rows={10}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Промпт для обновления информации о кандидате
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
