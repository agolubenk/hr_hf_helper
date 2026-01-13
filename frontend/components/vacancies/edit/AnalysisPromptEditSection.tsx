'use client'

import { Box, Flex, Text, TextArea, Switch, Callout } from "@radix-ui/themes"
import { ClipboardIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { vacancyPromptApi } from "@/lib/api"
import styles from './AnalysisPromptEditSection.module.css'

interface AnalysisPromptEditSectionProps {
  prompt: string
  useCommonPrompt?: boolean
  onChange: (prompt: string) => void
  onUseCommonPromptChange?: (useCommon: boolean) => void
}

export default function AnalysisPromptEditSection({ 
  prompt, 
  useCommonPrompt = false,
  onChange,
  onUseCommonPromptChange
}: AnalysisPromptEditSectionProps) {
  const [commonPrompt, setCommonPrompt] = useState<string | null>(null)
  const [hasActiveCommonPrompt, setHasActiveCommonPrompt] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCommonPrompt = async () => {
      try {
        const response = await vacancyPromptApi.get()
        if (response.data && response.data.is_active) {
          setCommonPrompt(response.data.prompt)
          setHasActiveCommonPrompt(true)
        }
      } catch (error) {
        console.error('Ошибка при загрузке общего промпта:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCommonPrompt()
  }, [])

  const handleUseCommonPromptChange = (checked: boolean) => {
    if (onUseCommonPromptChange) {
      onUseCommonPromptChange(checked)
    }
  }

  return (
    <Box id="analysis-prompt" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <ClipboardIcon width={20} height={20} />
        <Text size="5" weight="bold">Промпт для анализа после скрининга</Text>
      </Flex>

      <Flex direction="column" gap="3">
        {!loading && hasActiveCommonPrompt && (
          <>
            <Flex align="center" gap="3">
              <Switch
                checked={useCommonPrompt}
                onCheckedChange={handleUseCommonPromptChange}
                size="2"
              />
              <Text size="2" weight="medium">
                Использовать общий промпт
              </Text>
            </Flex>
            <Text size="1" style={{ color: 'var(--gray-11)', marginTop: '-8px', marginLeft: '32px' }}>
              Если включено, используется единый промпт из настроек компании. Если выключено, используется индивидуальный промпт.
            </Text>

            {useCommonPrompt && commonPrompt && (
              <Callout.Root color="blue">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                    Используется общий промпт:
                  </Text>
                  <Text 
                    size="1" 
                    style={{ 
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      display: 'block',
                      padding: '8px',
                      backgroundColor: 'var(--gray-2)',
                      borderRadius: '4px'
                    }}
                  >
                    {commonPrompt}
                  </Text>
                </Callout.Text>
              </Callout.Root>
            )}
          </>
        )}

        <Flex direction="column" gap="1" style={{ display: hasActiveCommonPrompt && useCommonPrompt ? 'none' : 'flex' }}>
          <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
            Промпт для обновления кандидата
          </Text>
          <TextArea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ты - HR-аналитик..."
            rows={10}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            disabled={hasActiveCommonPrompt && useCommonPrompt}
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Промпт для обновления информации о кандидате
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
