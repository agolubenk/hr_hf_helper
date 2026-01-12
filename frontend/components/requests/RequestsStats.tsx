'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { 
  ClipboardIcon, 
  ClockIcon, 
  CheckIcon,
  CrossCircledIcon,
  CalendarIcon
} from "@radix-ui/react-icons"
import styles from './RequestsStats.module.css'

interface RequestsStatsProps {
  total: number
  planned: number
  inProcess: number
  cancelled: number
  closed: number
}

export default function RequestsStats({ total, planned, inProcess, cancelled, closed }: RequestsStatsProps) {
  return (
    <Flex gap="3" className={styles.statsContainer}>
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{total} Всего заявок</Text>
          <ClipboardIcon width={20} height={20} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{planned} Планируется</Text>
          <CalendarIcon width={20} height={20} style={{ color: '#3b82f6' }} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{inProcess} В процессе</Text>
          <ClockIcon width={20} height={20} style={{ color: '#f59e0b' }} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{cancelled} Отменена</Text>
          <CrossCircledIcon width={20} height={20} style={{ color: '#ef4444' }} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{closed} Закрыта</Text>
          <CheckIcon width={20} height={20} style={{ color: '#12a594' }} />
        </Flex>
      </Box>
    </Flex>
  )
}
