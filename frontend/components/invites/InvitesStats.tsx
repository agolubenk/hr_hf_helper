'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { CalendarIcon, ClockIcon, PaperPlaneIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import styles from './InvitesStats.module.css'

interface InvitesStatsProps {
  total: number
  pending: number
  sent: number
  completed: number
}

export default function InvitesStats({ total, pending, sent, completed }: InvitesStatsProps) {
  return (
    <Flex gap="3" className={styles.statsContainer}>
      {/* Всего инвайтов */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #3b82f6',
        borderBottom: '2px solid #10b981',
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ВСЕГО ИНВАЙТОВ
            </Text>
            <CalendarIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {total}
          </Text>
        </Flex>
      </Box>

      {/* Ожидают */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #f97316',
        borderBottom: '2px solid #ea580c',
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ОЖИДАЮТ
            </Text>
            <ClockIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {pending}
          </Text>
        </Flex>
      </Box>

      {/* Отправлены */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #3b82f6',
        borderBottom: '2px solid #2563eb',
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ОТПРАВЛЕНЫ
            </Text>
            <PaperPlaneIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {sent}
          </Text>
        </Flex>
      </Box>

      {/* Завершены */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #10b981',
        borderBottom: '2px solid #059669',
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ЗАВЕРШЕНЫ
            </Text>
            <CheckCircledIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {completed}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}
