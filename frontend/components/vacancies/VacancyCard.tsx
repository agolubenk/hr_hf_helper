'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon, SewingPinFilledIcon } from "@radix-ui/react-icons"
import styles from './VacancyCard.module.css'

interface Vacancy {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  locations: string[]
  interviewers: number
  date: string | null
  hasWarning: boolean
  warningText?: string
}

interface VacancyCardProps {
  vacancy: Vacancy
  onClick?: () => void
  onEditClick?: () => void
  onStatusClick?: () => void
}

export default function VacancyCard({ vacancy, onClick, onEditClick, onStatusClick }: VacancyCardProps) {
  return (
    <Box className={styles.vacancyCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок и статус */}
      <Flex justify="between" align="start" mb="2">
        <Box>
        <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
          {vacancy.title}
          <br></br>
        {/* ID */}
        <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
          # {vacancy.id}
        </Text>
        <br></br>
        </Text>
        {/* Рекрутер */}
        <Flex align="center" gap="2" mb="2">
          <PersonIcon width={16} height={16} />
          <Text size="2">{vacancy.recruiter}</Text>
        </Flex>
        </Box>
        <Flex direction="column" align="end" gap="1">
          <Box 
            className={`${styles.statusTag} ${vacancy.status === 'active' ? styles.statusActive : styles.statusInactive}`}
            onClick={(e) => { e.stopPropagation(); onStatusClick?.() }}
            style={{ cursor: onStatusClick ? 'pointer' : undefined }}
            title={onStatusClick ? 'Нажмите, чтобы изменить статус' : undefined}
          >
            <Text size="1" weight="bold">
              {vacancy.status === 'active' ? 'Активна' : 'Неактивна'}
            </Text>
          </Box>
          <Flex className={styles.actionButtons}>
            <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onEditClick?.() }} title="Редактировать">
              <Pencil1Icon width={16} height={16} />
            </Button>
            <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onClick?.() }} title="Просмотр">
              <EyeOpenIcon width={16} height={16} />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Локации */}
      {vacancy.locations.length > 0 && (
        <Flex direction="column" gap="1" mb="2">
          <Flex align="center" gap="1">
            <SewingPinFilledIcon width={14} height={14} />
            <Text size="2" style={{ color: 'var(--gray-11)' }}>Локации:</Text>
          </Flex>
          <Flex gap="1" wrap="wrap">
            {vacancy.locations.map((loc, index) => (
              <Box key={index} className={styles.techTag}>
                <Text size="1">{loc}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      )}

      {/* Интервьюеры */}
      <Flex align="center" gap="2" mb="2">
        <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👥
        </Box>
        <Text size="2">{vacancy.interviewers} интервьюеров</Text>
      </Flex>


      {/* Предупреждение */}
      {vacancy.hasWarning && (
        <Flex align="center" gap="2" mb="3">
          <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
          <Text size="2" style={{ color: '#f59e0b' }}>
            {vacancy.warningText}
          </Text>
        </Flex>
      )}

    </Box>
  )
}
