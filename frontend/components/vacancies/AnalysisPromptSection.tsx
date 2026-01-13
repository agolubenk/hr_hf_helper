'use client'

import { Box, Flex, Text, Button, Callout } from "@radix-ui/themes"
import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './AnalysisPromptSection.module.css'

interface AnalysisPromptSectionProps {
  prompt: string
  useCommonPrompt?: boolean
  commonPrompt?: string
}

export default function AnalysisPromptSection({ 
  prompt, 
  useCommonPrompt = false, 
  commonPrompt 
}: AnalysisPromptSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Box id="analysis-prompt" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
        <ClipboardIcon width={20} height={20} />
        <Text size="5" weight="bold">Промпт для анализа после скрининга</Text>
      </Flex>

      {useCommonPrompt && commonPrompt ? (
        <>
          <Callout.Root color="blue" mb="3">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Используется общий промпт из настроек компании
            </Callout.Text>
          </Callout.Root>

          <Flex direction="column" gap="2">
            <Button
              variant="soft"
              size="2"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ alignSelf: 'flex-start' }}
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon width={16} height={16} />
                  Скрыть текст промпта
                </>
              ) : (
                <>
                  <ChevronDownIcon width={16} height={16} />
                  Показать текст промпта
                </>
              )}
            </Button>

            {isExpanded && (
              <Box className={styles.promptContent}>
                <Text 
                  size="2" 
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                    fontSize: '13px'
                  }}
                >
                  {commonPrompt}
                </Text>
              </Box>
            )}
          </Flex>
        </>
      ) : (
        <Box className={styles.promptContent}>
          <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {prompt || 'Не указан'}
          </Text>
        </Box>
      )}
    </Box>
  )
}
