'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Card, Button, TextField, Select } from '@radix-ui/themes'
import { ListBulletIcon, CalendarIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import Link from 'next/link'
import styles from './hiring-plan.module.css'

// Моковые данные (без API)
const LIMIT_OPTIONS = [5, 10, 15, 25, 50, 100] as const

const MOCK_REQUESTS = [
  { id: 1, vacancy: 'Frontend Engineer (React)', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 2, status: 'in_progress', opening_date: '2025-12-17', deadline: '2026-01-21', closed_date: null, days_in_progress: 26, sla_to_offer: 35, sla_status_display: 'Нормально', time2hire: null, recruiter: 'Голубенко А.', recruiter_work_days: 22, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 2, vacancy: 'DevOps Engineer', grade: 'Middle+', grade_short: 'M+', project: null, priority: 2, status: 'closed', opening_date: '2025-12-11', deadline: '2026-01-20', closed_date: '2026-01-06', days_in_progress: 26, sla_to_offer: 40, sla_status_display: 'В срок', time2hire: 67, recruiter: 'Голубенко А.', recruiter_work_days: 26, candidate_name: 'Aleksander Volvachev', candidate_id: '76779160', is_overdue: false },
  { id: 3, vacancy: 'Backend Engineer', grade: 'Middle', grade_short: 'M', project: null, priority: 3, status: 'planned', opening_date: '2025-12-01', deadline: '2026-01-15', closed_date: null, days_in_progress: 0, sla_to_offer: 35, sla_status_display: 'Нет SLA', time2hire: null, recruiter: 'Голубенко А.', recruiter_work_days: 0, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 4, vacancy: 'Support Engineer', grade: 'Junior+', grade_short: 'J+', project: null, priority: 3, status: 'in_progress', opening_date: '2025-12-15', deadline: '2026-01-14', closed_date: null, days_in_progress: 28, sla_to_offer: 30, sla_status_display: 'Риск просрочки', time2hire: null, recruiter: 'Черномордин А.', recruiter_work_days: 21, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 5, vacancy: 'QA Engineer', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 3, status: 'cancelled', opening_date: '2025-12-05', deadline: '2026-01-18', closed_date: '2026-01-10', days_in_progress: 22, sla_to_offer: 35, sla_status_display: 'Просрочено', time2hire: null, recruiter: 'Голубенко А.', recruiter_work_days: 18, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 6, vacancy: 'Data Engineer', grade: 'Senior', grade_short: 'S', project: 'Analytics', priority: 1, status: 'closed', opening_date: '2025-11-20', deadline: '2025-12-20', closed_date: '2025-12-15', days_in_progress: 25, sla_to_offer: 30, sla_status_display: 'В срок', time2hire: 25, recruiter: 'Черномордин А.', recruiter_work_days: 25, candidate_name: 'Иванов И.', candidate_id: '80001', is_overdue: false },
  { id: 7, vacancy: 'ML Engineer', grade: 'Middle+', grade_short: 'M+', project: 'Analytics', priority: 2, status: 'in_progress', opening_date: '2025-12-20', deadline: '2026-02-01', closed_date: null, days_in_progress: 36, sla_to_offer: 45, sla_status_display: 'Нормально', time2hire: null, recruiter: 'Петрова М.', recruiter_work_days: 28, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 8, vacancy: 'Product Manager', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 2, status: 'closed', opening_date: '2025-11-10', deadline: '2025-12-15', closed_date: '2025-12-01', days_in_progress: 21, sla_to_offer: 35, sla_status_display: 'В срок', time2hire: 21, recruiter: 'Петрова М.', recruiter_work_days: 21, candidate_name: 'Сидорова О.', candidate_id: '80002', is_overdue: false },
  { id: 9, vacancy: 'Designer', grade: 'Junior', grade_short: 'J', project: null, priority: 3, status: 'cancelled', opening_date: '2025-12-01', deadline: '2026-01-10', closed_date: '2025-12-28', days_in_progress: 20, sla_to_offer: 40, sla_status_display: 'В срок', time2hire: null, recruiter: 'Черномордин А.', recruiter_work_days: 20, candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 10, vacancy: 'Security Engineer', grade: 'Senior', grade_short: 'S', project: 'Analytics', priority: 1, status: 'in_progress', opening_date: '2025-12-22', deadline: '2026-02-15', closed_date: null, days_in_progress: 34, sla_to_offer: 50, sla_status_display: 'Нормально', time2hire: null, recruiter: 'Голубенко А.', recruiter_work_days: 24, candidate_name: null, candidate_id: null, is_overdue: false },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'planned', label: 'Планируется' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'closed', label: 'Закрыта' },
  { value: 'cancelled', label: 'Отменена' },
]

function fmt(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

function statusBadge(s: string) {
  const map: Record<string, string> = { planned: styles.badgePlanned, in_progress: styles.badgeProgress, closed: styles.badgeClosed, cancelled: styles.badgeCancelled }
  return map[s] || styles.badgePlanned
}

function slaBadge(s: string) {
  if (s === 'В срок') return styles.badgeSlaOk
  if (s === 'Просрочено') return styles.badgeSlaOver
  if (s === 'Риск просрочки') return styles.badgeSlaRisk
  return styles.badgeSlaNormal
}

export default function HiringPlanPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [period, setPeriod] = useState('')
  const [project, setProject] = useState('')
  const [recruiterSearch, setRecruiterSearch] = useState('')
  const [tableLimit, setTableLimit] = useState<number>(10)

  const filtered = MOCK_REQUESTS.filter((r) => {
    if (search && !(r.vacancy.toLowerCase().includes(search.toLowerCase()) || (r.candidate_name || '').toLowerCase().includes(search.toLowerCase()))) return false
    if (status && r.status !== status) return false
    if (period) {
      const [y, m] = period.split('-')
      const [ry, rm] = (r.opening_date || '').split('-')
      if (ry !== y || rm !== m) return false
    }
    if (project === '__none__' && r.project) return false
    if (project && project !== '__none__' && (r.project || '') !== project) return false
    if (recruiterSearch && !(r.recruiter || '').toLowerCase().includes(recruiterSearch.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => (b.opening_date || '').localeCompare(a.opening_date || ''))
  const tableRows = sorted.slice(0, tableLimit)

  const s = {
    total_requests: filtered.length,
    planned_requests: filtered.filter((r) => r.status === 'planned').length,
    in_progress_requests: filtered.filter((r) => r.status === 'in_progress').length,
    closed_requests: filtered.filter((r) => r.status === 'closed').length,
    cancelled_requests: filtered.filter((r) => r.status === 'cancelled').length,
  }
  const fulfillment = s.total_requests > 0 ? Math.round((s.closed_requests / s.total_requests) * 100) : 0

  const withSla = filtered.filter((r) => r.status !== 'planned' && r.sla_status_display !== 'Нет SLA')
  const avgSlaPlan = withSla.length > 0 ? Math.round(withSla.reduce((acc, r) => acc + (r.sla_to_offer || 0), 0) / withSla.length) : null
  const closedWithSla = filtered.filter((r) => r.status === 'closed')
  const avgSlaFact = closedWithSla.length > 0 ? Math.round(closedWithSla.reduce((acc, r) => acc + (r.days_in_progress || 0), 0) / closedWithSla.length) : null

  const closedWithT2H = filtered.filter((r) => r.status === 'closed' && r.time2hire != null)
  const avgT2H = closedWithT2H.length > 0 ? Math.round(closedWithT2H.reduce((acc, r) => acc + (r.time2hire || 0), 0) / closedWithT2H.length) : null

  const projects = [...new Set(MOCK_REQUESTS.map((r) => r.project).filter(Boolean))] as string[]

  return (
    <AppLayout pageTitle="План найма">
      <Box className={styles.container}>
        <Flex justify="between" align="center" mb="4" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            <ListBulletIcon width={24} height={24} />
            <Text size="6" weight="bold">Заявки на найм</Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            <Link href="/reporting/hiring-plan/yearly">
              <Button size="2" variant="soft" color="green">
                <CalendarIcon width={16} height={16} />
                Годовая таблица
              </Button>
            </Link>
          </Flex>
        </Flex>

        {/* Статистика */}
        <Flex gap="3" mb="4" wrap="wrap">
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <Text className={styles.statNumber}>{s.total_requests}</Text>
            <Text className={styles.statLabel}>Всего заявок</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
            <Text className={styles.statNumber}>{s.planned_requests}</Text>
            <Text className={styles.statLabel}>Планируется</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Text className={styles.statNumber}>{s.in_progress_requests}</Text>
            <Text className={styles.statLabel}>В процессе</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
            <Text className={styles.statNumber}>{s.closed_requests}</Text>
            <Text className={styles.statLabel}>Закрыто</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}>
            <Text className={styles.statNumber}>{s.cancelled_requests}</Text>
            <Text className={styles.statLabel}>Отменено</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <Text className={styles.statNumber}>{fulfillment}%</Text>
            <Text className={styles.statLabel}>Выполнение</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
            <Text className={styles.statNumber}>{avgSlaPlan != null ? `${avgSlaPlan} дн.` : '—'}</Text>
            <Text className={styles.statLabel}>Среднее SLA (план)</Text>
            <Text size="1" style={{ opacity: 0.9, marginTop: 2 }}>Факт: {avgSlaFact != null ? `${avgSlaFact} дн.` : '—'}</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
            <Text className={styles.statNumber}>{avgT2H != null ? `${avgT2H} дн.` : '—'}</Text>
            <Text className={styles.statLabel}>Средний T2H (факт)</Text>
          </Card>
        </Flex>

        {/* Фильтры */}
        <Card mb="4" style={{ padding: 16 }}>
          <Text size="2" weight="medium" mb="3" style={{ display: 'block' }}>Фильтры</Text>
          <Flex className={styles.filterRow} gap="3" wrap="wrap">
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Поиск</Text>
              <TextField.Root size="2" placeholder="Вакансия, кандидат…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Проект</Text>
              <Select.Root value={project || '__all__'} onValueChange={(v) => setProject(v === '__all__' ? '' : v)}>
                <Select.Trigger style={{ minWidth: 160 }} />
                <Select.Content>
                  <Select.Item value="__all__">Все проекты</Select.Item>
                  <Select.Item value="__none__">Без проекта</Select.Item>
                  {projects.map((p) => <Select.Item key={p} value={p}>{p}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Рекрутер</Text>
              <TextField.Root size="2" placeholder="Поиск по рекрутеру…" value={recruiterSearch} onChange={(e) => setRecruiterSearch(e.target.value)} />
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Статус</Text>
              <Select.Root value={status || '__all__'} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
                <Select.Trigger style={{ minWidth: 160 }} />
                <Select.Content>
                  {STATUS_OPTIONS.map((o) => <Select.Item key={o.value || 'all'} value={o.value || '__all__'}>{o.label}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Период</Text>
              <TextField.Root size="2" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </Box>
            <Button size="2" variant="soft" onClick={() => { setSearch(''); setStatus(''); setPeriod(''); setProject(''); setRecruiterSearch(''); setTableLimit(10); }}>Сбросить</Button>
          </Flex>
        </Card>

        {/* Таблица */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <Flex justify="between" align="center" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
            <Text size="2" color="gray">Показано: последние {tableRows.length} из {filtered.length} заявок</Text>
            <Flex align="center" gap="2">
              <Text size="2" color="gray">Показать:</Text>
              <Select.Root value={String(tableLimit)} onValueChange={(v) => setTableLimit(Number(v))}>
                <Select.Trigger style={{ minWidth: 90 }} />
                <Select.Content>
                  {LIMIT_OPTIONS.map((n) => <Select.Item key={n} value={String(n)}>{n} заявок</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          <Box className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Вакансия / Грейд</th>
                  <th>Проект</th>
                  <th>Рекрутер</th>
                  <th>Статус</th>
                  <th>Сроки</th>
                  <th>Факт / SLA</th>
                  <th>T2H | SLA</th>
                  <th>Кандидат</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-11)' }}>Заявки не найдены</td></tr>
                ) : (
                  tableRows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Text weight="medium" className={styles.vacancyName} title={r.vacancy}>{r.vacancy}</Text>
                        <br />
                        <span className={`${styles.badge} ${styles.badgeSlaNormal}`}>{r.grade_short}</span>
                      </td>
                      <td><Text className={styles.projectName} title={r.project || ''}>{r.project || '—'}</Text></td>
                      <td>{r.recruiter || '—'}{r.recruiter_work_days > 0 ? ` (${r.recruiter_work_days} дн.)` : ''}</td>
                      <td>
                        <span className={`${styles.badge} ${statusBadge(r.status)}`}>
                          {r.status === 'planned' && 'Планируется'}
                          {r.status === 'in_progress' && 'В процессе'}
                          {r.status === 'closed' && (r.closed_date ? `Закрыта ${fmt(r.closed_date)}` : 'Закрыта')}
                          {r.status === 'cancelled' && (r.closed_date ? `Отменена ${fmt(r.closed_date)}` : 'Отменена')}
                        </span>
                      </td>
                      <td>{fmt(r.opening_date)} — {r.deadline ? fmt(r.deadline) : 'нет SLA'}</td>
                      <td>
                        {r.status === 'planned' ? '—' : `${r.days_in_progress} / ${r.sla_to_offer}д`}
                        <br />
                        <span className={`${styles.badge} ${slaBadge(r.sla_status_display)}`}>{r.sla_status_display}</span>
                      </td>
                      <td>
                        {r.time2hire != null ? `${r.time2hire} дн.` : (r.status === 'closed' ? '—' : '—')}
                        <br />
                        {r.sla_status_display !== 'Нет SLA' && r.status !== 'planned' && <span className={`${styles.badge} ${slaBadge(r.sla_status_display)}`}>SLA</span>}
                      </td>
                      <td>{r.candidate_name ? <><Text weight="medium">{r.candidate_name}</Text>{r.candidate_id ? <><br /><Text size="1" color="gray">ID: {r.candidate_id}</Text></> : null}</> : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Box>
    </AppLayout>
  )
}
