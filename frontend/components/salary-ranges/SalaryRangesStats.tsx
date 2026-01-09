'use client'

import { Box, Flex, Text, SegmentedControl } from "@radix-ui/themes"
import { CheckIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangesStats.module.css'

interface SalaryRangesStatsProps {
  total: number
  active: number
  inactive: number
  activeTab: 'active' | 'inactive' | 'all'
  onTabChange: (tab: 'active' | 'inactive' | 'all') => void
  onListViewClick?: () => void
}

export default function SalaryRangesStats({
  total,
  active,
  inactive,
  activeTab,
  onTabChange,
  onListViewClick
}: SalaryRangesStatsProps) {
  return (
    <Flex justify="between" align="center" className={styles.statsContainer}>
      <Flex align="center" gap="3" className={styles.statsLeft}>
        <Text size="3" weight="medium">
          Всего вилок {total}
        </Text>
        {onListViewClick && (
          <Box className={styles.listIcon} onClick={onListViewClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="7" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="11" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="13.5" width="6" height="1.5" fill="currentColor" />
            </svg>
          </Box>
        )}
      </Flex>

      <Box className={styles.statsRight}>
        <SegmentedControl.Root value={activeTab} onValueChange={(value) => onTabChange(value as 'active' | 'inactive' | 'all')}>
          <SegmentedControl.Item value="active">
            <Flex align="center" gap="1">
              <CheckIcon width={14} height={14} />
              <Text>
                <span className={styles.textDesktop}>Активных {active}</span>
                <span className={styles.textMobile}>Акт. {active}</span>
              </Text>
            </Flex>
          </SegmentedControl.Item>
          <SegmentedControl.Item value="inactive">
            <Text>
              <span className={styles.textDesktop}>Неактивных {inactive}</span>
              <span className={styles.textMobile}>Неакт. {inactive}</span>
            </Text>
          </SegmentedControl.Item>
          <SegmentedControl.Item value="all">
            <Text>
              <span className={styles.textDesktop}>Все {total}</span>
              <span className={styles.textMobile}>Все {total}</span>
            </Text>
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Box>
    </Flex>
  )
}
