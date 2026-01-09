'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ClockIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangeListItem.module.css'

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

interface SalaryRangeListItemProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}

export default function SalaryRangeListItem({ salaryRange, onClick, onToggleActive }: SalaryRangeListItemProps) {
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
    <Box className={styles.salaryRangeListItem} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Десктопная версия */}
      <Flex justify="between" align="center" gap="4" className={styles.desktopLayout}>
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="3">
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {salaryRange.vacancyName}
            </Text>
            <Box 
              className={`${styles.statusTag} ${salaryRange.isActive ? styles.statusActive : styles.statusInactive}`}
            >
              <Text size="1" weight="bold">
                {salaryRange.isActive ? 'Активна' : 'Неактивна'}
              </Text>
            </Box>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              {salaryRange.grade}
            </Text>
            <Flex align="center" gap="1">
              <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
              <Text size="2" style={{ color: 'var(--gray-10)' }}>
                {formatDate(salaryRange.updatedAt)}
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap="4" wrap="wrap">
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                $ USD:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
              </Text>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                ₽ BYN:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
              </Text>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                zł PLN:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
              </Text>
            </Flex>

            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                € EUR:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center" gap="1" className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
          {onToggleActive && (
            <Button 
              variant="ghost" 
              size="1" 
              className={styles.actionButton}
              title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleActive(salaryRange.id)
              }}
              type="button"
            >
              {salaryRange.isActive ? (
                <Box style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* Мобильная версия */}
      <Flex direction="column" gap="2" className={styles.mobileLayout}>
        {/* Первая строка - название вакансии */}
        <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
          {salaryRange.vacancyName}
        </Text>

        {/* Вторая строка - статус и грейд */}
        <Flex align="center" gap="2">
          <Box 
            className={`${styles.statusTag} ${salaryRange.isActive ? styles.statusActive : styles.statusInactive}`}
          >
            <Text size="1" weight="bold">
              {salaryRange.isActive ? 'Активна' : 'Неактивна'}
            </Text>
          </Box>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            {salaryRange.grade}
          </Text>
        </Flex>

        {/* Третья строка - зарплаты */}
        <Flex align="center" gap="4" wrap="wrap">
          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              $ USD:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              ₽ BYN:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              zł PLN:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              € EUR:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
            </Text>
          </Flex>
        </Flex>

        {/* Четвертая строка - дата слева, кнопки справа */}
        <Flex justify="between" align="center" gap="2" className={styles.mobileActionsRow} onClick={(e) => e.stopPropagation()}>
          {/* Дата слева */}
          <Flex align="center" gap="1">
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
            <Text size="2" style={{ color: 'var(--gray-10)' }}>
              {formatDate(salaryRange.updatedAt)}
            </Text>
          </Flex>

          {/* Кнопки справа */}
          <Flex align="center" gap="1">
            {onToggleActive && (
              <Button 
                variant="ghost" 
                size="1" 
                className={styles.actionButton}
                title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleActive(salaryRange.id)
                }}
                type="button"
              >
                {salaryRange.isActive ? (
                  <Box style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
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
      </Flex>
    </Box>
  )
}
