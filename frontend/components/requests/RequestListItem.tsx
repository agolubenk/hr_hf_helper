'use client'

import { Box, Flex, Text, Button, Table } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import RequestTableRowExpanded from "./RequestTableRowExpanded"
import styles from './RequestListItem.module.css'

interface Request {
  id: number
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'closed' | 'in_process'
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

interface RequestListItemProps {
  request: Request
  onClick?: () => void
  requestsCount?: number
  requests?: Request[]
}

export default function RequestListItem({ request, onClick, requestsCount, requests }: RequestListItemProps) {
  const router = useRouter()
  // Если переданы несколько заявок, показываем их в таблице (развернута по умолчанию)
  const hasMultipleRequests = requests && requests.length > 1
  const [isExpanded, setIsExpanded] = useState(hasMultipleRequests || false)

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

  const hasTableData = request.grade && request.startDate && request.endDate && request.factDays && request.slaDays
  // Показываем кнопку разворота если есть данные для таблицы (для одиночных заявок) или если это группа заявок
  const shouldShowExpandButton = hasTableData || (hasMultipleRequests && requests && requests.some(r => r.grade && r.startDate && r.endDate && r.factDays && r.slaDays))

  return (
    <Box className={styles.requestListItem}>
      <Flex justify="between" align="center" gap="4">
        {/* Левая часть - информация */}
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="3">
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {request.title}
            </Text>
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
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              # {request.id}
            </Text>
          </Flex>

          <Flex align="center" gap="4" wrap="wrap">
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              {request.department}
            </Text>
            <Flex align="center" gap="2">
              <PersonIcon width={16} height={16} />
              <Text size="2">• {request.recruiter}</Text>
            </Flex>

            {requestsCount !== undefined && (
              <Flex align="center" gap="2">
                <Text size="2" style={{ color: 'var(--gray-11)' }}>
                  Заявок: {requestsCount}
                </Text>
              </Flex>
            )}

            <Flex align="center" gap="2">
              <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👥
              </Box>
              <Text size="2">{request.candidates} кандидатов</Text>
            </Flex>

            {request.date && (
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                Дата: {request.date}
              </Text>
            )}

            {request.hasWarning && (
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
                <Text size="2" style={{ color: '#f59e0b' }}>
                  {request.warningText}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Правая часть - кнопки действий */}
        <Flex gap="2" className={styles.actionButtons}>
          {shouldShowExpandButton && (
            <Button 
              variant="ghost" 
              size="1" 
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronUpIcon width={16} height={16} />
              ) : (
                <ChevronDownIcon width={16} height={16} />
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="1" 
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            <EyeOpenIcon width={16} height={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="1" 
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            <Pencil1Icon width={16} height={16} />
          </Button>
        </Flex>
      </Flex>

      {/* Развернутая таблица - для одной заявки (с кнопкой развернуть) */}
      {!hasMultipleRequests && isExpanded && hasTableData && (
        <Box mt="3" className={styles.expandedTable}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Проект</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Рекрутер</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Сроки</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Факт/SLA</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>T2H | SLA</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <RequestTableRowExpanded 
                request={request as any}
                onView={onClick}
                onEdit={onClick}
              />
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Таблица для нескольких заявок (разворачивается/сворачивается) */}
      {hasMultipleRequests && requests && isExpanded && (
        <Box mt="3" className={styles.expandedTable}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Проект</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Рекрутер</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Сроки</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Факт/SLA</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>T2H | SLA</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((req) => (
                <RequestTableRowExpanded 
                  key={req.id}
                  request={req as any}
                  onView={() => router.push(`/hiring-requests/${req.id}`)}
                  onEdit={() => router.push(`/hiring-requests/${req.id}/edit`)}
                />
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  )
}
