'use client'

import { Box, Flex, Text, TextField } from "@radix-ui/themes"
import { ClipboardIcon } from "@radix-ui/react-icons"
import styles from './ScorecardEditSection.module.css'

interface ScorecardEditSectionProps {
  scorecard: {
    title: string
    link: string
  }
  onChange: (scorecard: ScorecardEditSectionProps['scorecard']) => void
}

export default function ScorecardEditSection({ scorecard, onChange }: ScorecardEditSectionProps) {
  return (
    <Box className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <ClipboardIcon width={20} height={20} />
        <Text size="5" weight="bold">Scorecard</Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
            Заголовок Scorecard <Text color="red">*</Text>
          </Text>
          <TextField.Root
            value={scorecard.title}
            onChange={(e) => onChange({ ...scorecard, title: e.target.value })}
            placeholder="| Scorecard FE"
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>Заголовок для Scorecard</Text>
        </Flex>

        <Flex direction="column" gap="1" style={{ flex: '1 1 calc(50% - 8px)', minWidth: '300px' }}>
          <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
            Ссылка на Scorecard
          </Text>
          <TextField.Root
            type="url"
            value={scorecard.link}
            onChange={(e) => onChange({ ...scorecard, link: e.target.value })}
            placeholder="https://docs.google.com/spreadsheets/..."
          />
          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            Ссылка на Scorecard для оценки кандидатов
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
