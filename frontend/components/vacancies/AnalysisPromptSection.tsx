'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { ClipboardIcon } from "@radix-ui/react-icons"
import styles from './AnalysisPromptSection.module.css'

interface AnalysisPromptSectionProps {
  prompt: string
}

export default function AnalysisPromptSection({ prompt }: AnalysisPromptSectionProps) {
  return (
    <Box id="analysis-prompt" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
        <ClipboardIcon width={20} height={20} />
        <Text size="5" weight="bold">Промпт для анализа после скрининга</Text>
      </Flex>
      <Box className={styles.promptContent}>
        <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{prompt}</Text>
      </Box>
    </Box>
  )
}
