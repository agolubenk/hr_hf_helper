'use client'

import { Box, Table, Text, Button, Flex } from "@radix-ui/themes"
import { EyeOpenIcon, Pencil1Icon } from "@radix-ui/react-icons"
import styles from './RequestsTable.module.css'

interface Request {
  id: number
  title: string
  grade: string
  project: string | null
  recruiter: string
  recruiterDays: number
  status: 'planned' | 'in_process' | 'cancelled' | 'closed'
  statusDate?: string
  startDate: string
  endDate: string
  isOverdue?: boolean
  factDays: number
  slaDays: number
  slaStatus: 'normal' | 'risk' | 'overdue' | 'on_time'
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: {
    name: string
    id: string
  }
}

interface RequestTableRowExpandedProps {
  request: Request
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}

export default function RequestTableRowExpanded({ request, onView, onEdit }: RequestTableRowExpandedProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Планируется'
      case 'in_process': return 'В процессе'
      case 'cancelled': return 'Отменена'
      case 'closed': return 'Закрыта'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'blue'
      case 'in_process': return 'orange'
      case 'cancelled': return 'red'
      case 'closed': return 'teal'
      default: return 'gray'
    }
  }

  const getSlaStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return 'Нормально'
      case 'risk': return 'Риск просрочки'
      case 'overdue': return 'Просрочено'
      case 'on_time': return 'В срок'
      default: return status
    }
  }

  const getSlaStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'gray'
      case 'risk': return 'orange'
      case 'overdue': return 'red'
      case 'on_time': return 'teal'
      default: return 'gray'
    }
  }

  return (
    <Table.Row className={styles.tableRow}>
      <Table.Cell>
        <Box className={styles.gradeTag}>
          <Text size="1">{request.grade}</Text>
        </Box>
      </Table.Cell>
      <Table.Cell>
        <Text size="2">{request.project || '—'}</Text>
      </Table.Cell>
      <Table.Cell>
        <Flex direction="column" gap="1">
          <Text size="2">{request.recruiter}</Text>
          <Text size="1" color="gray">{request.recruiterDays} дн.</Text>
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Flex direction="column" gap="1">
          <Box className={`${styles.statusTag} ${styles[`status${getStatusColor(request.status)}`]}`}>
            <Text size="1" weight="bold">{getStatusLabel(request.status)}</Text>
          </Box>
          {request.status !== 'in_process' && request.statusDate && (
            <Text size="1" color="gray">{request.statusDate}</Text>
          )}
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Text size="2">
          {request.startDate} - {request.endDate}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Flex direction="column" gap="1">
          <Text size="2">{request.factDays}/{request.slaDays}д</Text>
          <Box className={`${styles.slaTag} ${styles[`sla${getSlaStatusColor(request.slaStatus)}`]}`}>
            <Text size="1" weight="bold">{getSlaStatusLabel(request.slaStatus)}</Text>
          </Box>
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Text size="2">
          {request.t2hDays ? `${request.t2hDays}` : '—'}/{request.t2hSlaDays || '—'}д
        </Text>
      </Table.Cell>
      <Table.Cell>
        {request.candidate ? (
          <Flex direction="column" gap="1">
            <Text size="2">{request.candidate.name}</Text>
            <Text size="1" color="gray">ID: {request.candidate.id}</Text>
          </Flex>
        ) : (
          <Text size="2">—</Text>
        )}
      </Table.Cell>
      <Table.Cell>
        <Flex gap="2">
          <Button
            variant="ghost"
            size="1"
            onClick={(e) => {
              e.stopPropagation()
              onView?.(request.id)
            }}
            className={styles.actionButton}
          >
            <EyeOpenIcon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="1"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(request.id)
            }}
            className={styles.actionButton}
          >
            <Pencil1Icon width={14} height={14} />
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  )
}
