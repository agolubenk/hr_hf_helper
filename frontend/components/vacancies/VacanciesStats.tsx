'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { 
  FileTextIcon, 
  CheckIcon, 
  StopwatchIcon 
} from "@radix-ui/react-icons"
import styles from './VacanciesStats.module.css'

interface VacanciesStatsProps {
  total: number
  active: number
  inactive: number
}

export default function VacanciesStats({ total, active, inactive }: VacanciesStatsProps) {
  return (
    <Flex data-tour="vacancies-stats" gap="3" className={styles.statsContainer}>
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{total} Всего вакансий</Text>
          <FileTextIcon width={20} height={20} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{active} Активных</Text>
          <CheckIcon width={20} height={20} style={{ color: '#10b981' }} />
        </Flex>
      </Box>
      
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{inactive} Неактивных</Text>
          <StopwatchIcon width={20} height={20} />
        </Flex>
      </Box>
    </Flex>
  )
}
