'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon } from "@radix-ui/react-icons"
import styles from './RequestCard.module.css'

interface Request {
  id: number
  title: string
  status: 'planned' | 'in_process' | 'cancelled' | 'closed'
  department: string
  recruiter: string
  priority: 'high' | 'medium' | 'low'
  technologies: string[]
  candidates: number
  date: string | null
  hasWarning: boolean
  warningText?: string
  // Дополнительные поля для таблицы
  grade?: string
  project?: string | null
  recruiterDays?: number
  statusDate?: string
  startDate?: string
  endDate?: string
  isOverdue?: boolean
  factDays?: number
  slaDays?: number
  slaStatus?: 'normal' | 'risk' | 'overdue' | 'on_time'
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: {
    name: string
    id: string
  }
}

interface RequestCardProps {
  request: Request
  onClick?: () => void
}

export default function RequestCard({ request, onClick }: RequestCardProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Планируется'
      case 'in_process': return 'В процессе'
      case 'cancelled': return 'Отменена'
      case 'closed': return 'Закрыта'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  return (
    <Box className={styles.requestCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок и статус */}
      <Flex justify="between" align="start" mb="2">
        <Box>
          <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
            {request.title}
            <br></br>
            {/* ID */}
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              # {request.id}
            </Text>
            <br></br>
          </Text>
          {/* Отдел */}
          <Text size="2" style={{ color: 'var(--gray-11)' }} mb="1">
            {request.department}
          </Text>
          {/* Рекрутер */}
          <Flex align="center" gap="2" mb="2">
            <PersonIcon width={16} height={16} />
            <Text size="2">{request.recruiter}</Text>
          </Flex>
        </Box>
        <Flex direction="column" align="end" gap="1">
          <Box 
            className={`${styles.statusTag} ${
              request.status === 'planned' ? styles.statusPlanned :
              request.status === 'in_process' ? styles.statusInProcess :
              request.status === 'cancelled' ? styles.statusCancelled :
              request.status === 'closed' ? styles.statusClosed :
              styles.statusPending
            }`}
          >
            <Text size="1" weight="bold">
              {getStatusLabel(request.status)}
            </Text>
          </Box>
          <Box 
            className={`${styles.priorityTag} ${
              request.priority === 'high' ? styles.priorityHigh :
              request.priority === 'medium' ? styles.priorityMedium :
              styles.priorityLow
            }`}
          >
            <Text size="1" weight="bold">
              {getPriorityLabel(request.priority)}
            </Text>
          </Box>
          <Flex className={styles.actionButtons}>
            <Button variant="ghost" size="1" className={styles.actionButton}>
              <EyeOpenIcon width={16} height={16} />
            </Button>
            <Button variant="ghost" size="1" className={styles.actionButton}>
              <Pencil1Icon width={16} height={16} />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Технологии */}
      {request.technologies.length > 0 && (
        <Flex direction="column" gap="1" mb="2">
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            {'</>'} Технологии:
          </Text>
          <Flex gap="1" wrap="wrap">
            {request.technologies.map((tech, index) => (
              <Box key={index} className={styles.techTag}>
                <Text size="1">{tech}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      )}

      {/* Кандидаты */}
      <Flex align="center" gap="2" mb="2">
        <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👥
        </Box>
        <Text size="2">{request.candidates} кандидатов</Text>
      </Flex>

      {/* Дата */}
      {request.date && (
        <Text size="2" style={{ color: 'var(--gray-11)' }} mb="2">
          Дата: {request.date}
        </Text>
      )}

      {/* Предупреждение */}
      {request.hasWarning && (
        <Flex align="center" gap="2" mb="3">
          <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
          <Text size="2" style={{ color: '#f59e0b' }}>
            {request.warningText}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
