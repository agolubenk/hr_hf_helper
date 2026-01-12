export interface Request {
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
