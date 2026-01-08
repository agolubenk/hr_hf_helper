'use client'

import { Box, Text, Flex, Separator } from "@radix-ui/themes"
import { PersonIcon, ClockIcon } from "@radix-ui/react-icons"
import styles from './WikiDetailHistory.module.css'

interface WikiDetailHistoryProps {
  author: string
  lastEditor: string
  lastEdited: string
  created: string
}

export default function WikiDetailHistory({
  author,
  lastEditor,
  lastEdited,
  created,
}: WikiDetailHistoryProps) {
  return (
    <Box className={styles.history}>
      <Text size="3" weight="bold" className={styles.historyTitle}>
        История изменений
      </Text>
      
      <Flex direction="column" gap="3" mt="3">
        <Box>
          <Flex align="center" gap="2" mb="1">
            <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
            <Text size="2" weight="medium" color="gray">
              Автор
            </Text>
          </Flex>
          <Text size="2" style={{ marginLeft: '22px' }}>
            {author}
          </Text>
          <Flex align="center" gap="2" mt="1" style={{ marginLeft: '22px' }}>
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} />
            <Text size="1" color="gray">
              {created}
            </Text>
          </Flex>
        </Box>
        
        <Separator size="2" />
        
        <Box>
          <Flex align="center" gap="2" mb="1">
            <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
            <Text size="2" weight="medium" color="gray">
              Последний редактор
            </Text>
          </Flex>
          <Text size="2" style={{ marginLeft: '22px' }}>
            {lastEditor}
          </Text>
          <Flex align="center" gap="2" mt="1" style={{ marginLeft: '22px' }}>
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} />
            <Text size="1" color="gray">
              {lastEdited}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
