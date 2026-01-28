'use client'

import { Box, Table } from "@radix-ui/themes"
import RequestTableRow from "./RequestTableRow"
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

interface RequestsTableProps {
  requests: Request[]
  onView?: (id: number) => void
  onEdit?: (id: number) => void
}

export default function RequestsTable({ requests, onView, onEdit }: RequestsTableProps) {
  // Сортируем заявки по дате создания (от новых к старым)
  // Предполагаем, что id больше = новее, или используем date поле
  const sortedRequests = [...requests].sort((a, b) => {
    // Сортируем по id в обратном порядке (больший id = новее)
    return b.id - a.id
  })

  return (
    <Box className={styles.tableContainer}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Вакансия / Грейд</Table.ColumnHeaderCell>
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
          {sortedRequests.map((request) => (
            <RequestTableRow
              key={request.id}
              request={request}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
