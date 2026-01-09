'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ClockIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangeCard.module.css'

interface SalaryRange {
  id: number
  vacancyId: number
  vacancyName: string
  grade: string
  salaryUsd: { min: number; max: number }
  salaryByn: { min: number; max: number }
  salaryPln: { min: number; max: number }
  salaryEur: { min: number; max: number }
  isActive: boolean
  updatedAt: string
}

interface SalaryRangeCardProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}

export default function SalaryRangeCard({ salaryRange, onClick, onToggleActive }: SalaryRangeCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <Box className={styles.salaryRangeCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок карточки (теал фон) */}
      <Box className={styles.cardHeader}>
        <Flex justify="between" align="center" gap="2">
          <Text size="4" weight="bold" style={{ color: 'white' }}>
            {salaryRange.vacancyName}
          </Text>
          <Text size="2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {salaryRange.grade}
          </Text>
        </Flex>
      </Box>

      {/* Детали карточки (белый фон) */}
      <Box className={styles.cardDetails}>
        <Flex direction="column" gap="2">
          {/* USD */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              $ USD
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
            </Text>
          </Flex>

          {/* BYN */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              ₽ BYN
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
            </Text>
          </Flex>

          {/* PLN */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              zł PLN
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
            </Text>
          </Flex>

          {/* EUR */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              € EUR
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
            </Text>
          </Flex>
        </Flex>

        {/* Дата и кнопки действий */}
        <Flex justify="between" align="center" gap="2" mt="3" pt="2" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          {/* Дата слева */}
          <Flex align="center" gap="1">
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
            <Text size="1" style={{ color: 'var(--gray-10)' }}>
              {formatDate(salaryRange.updatedAt)}
            </Text>
          </Flex>

          {/* Кнопки действий справа */}
          <Flex align="center" gap="1" onClick={(e) => e.stopPropagation()}>
            {onToggleActive && (
              <Button 
                variant="ghost" 
                size="1" 
                title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
                className={styles.actionButton}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleActive(salaryRange.id)
                }}
                type="button"
              >
                {salaryRange.isActive ? (
                  <Box style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                  </Box>
                ) : (
                  <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                )}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
