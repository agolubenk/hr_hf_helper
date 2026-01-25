'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Card, Button, Select } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import Link from 'next/link'
import styles from './yearly.module.css'

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

// Мок: строки годовой таблицы
function buildMonths(active: number[], color: string, days: Record<number, number> = {}) {
  const m: Record<number, { color: string; active: boolean; days: number }> = {}
  for (let i = 1; i <= 12; i++) {
    m[i] = { color: active.includes(i) ? color : 'transparent', active: active.includes(i), days: days[i] || 0 }
  }
  return m
}

const MOCK_TABLE: {
  request_id: number
  vacancy: string
  grade: string
  grade_short: string
  project: string
  sla_days: number | string
  sla_time2hire: number | string
  status: string
  days_in_year: number
  time2hire: number | null
  months: Record<number, { color: string; active: boolean; days: number }>
  recruiter: string | null
  closed_date: string | null
}[] = [
  { request_id: 1, vacancy: 'Frontend Engineer (React)', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', sla_days: 35, sla_time2hire: 48, status: 'in_progress', days_in_year: 26, time2hire: null, months: buildMonths([12], 'blue', { 12: 15 }), recruiter: 'Голубенко А.', closed_date: null },
  { request_id: 2, vacancy: 'DevOps Engineer', grade: 'Middle+', grade_short: 'M+', project: '—', sla_days: 40, sla_time2hire: 56, status: 'closed', days_in_year: 26, time2hire: 67, months: buildMonths([12, 1], 'green', { 12: 21, 1: 6 }), recruiter: 'Голубенко А.', closed_date: '2026-01-06' },
  { request_id: 3, vacancy: 'Backend Engineer', grade: 'Middle', grade_short: 'M', project: '—', sla_days: 35, sla_time2hire: 38, status: 'planned', days_in_year: 0, time2hire: null, months: buildMonths([1], 'lightblue', {}), recruiter: 'Голубенко А.', closed_date: null },
  { request_id: 4, vacancy: 'Support Engineer', grade: 'Junior+', grade_short: 'J+', project: '—', sla_days: 30, sla_time2hire: 38, status: 'in_progress', days_in_year: 28, time2hire: null, months: buildMonths([12], 'blue', { 12: 17 }), recruiter: 'Черномордин А.', closed_date: null },
  { request_id: 5, vacancy: 'QA Engineer', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', sla_days: 35, sla_time2hire: 38, status: 'cancelled', days_in_year: 22, time2hire: null, months: buildMonths([12, 1], 'gray', { 12: 27, 1: 10 }), recruiter: 'Голубенко А.', closed_date: '2026-01-10' },
]

const MOCK_MEDIANS = {
  grade: 'M',
  monthly_days: { 1: 12, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 18 } as Record<number, number>,
  sla: '35д',
  work_days: '24д',
  time2hire: '67д',
  sla_time2hire: '38д',
  closed_percentage: '31.6%',
  averages: {
    grade: 'M',
    monthly_days: { 1: 10, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 16 } as Record<number, number>,
    sla: '35д',
    work_days: '20д',
    time2hire: '67д',
    sla_time2hire: '44д',
  },
}

const AVAILABLE_YEARS = [2026, 2025, 2024]

function fmt(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

function statusLabel(s: string) {
  const v: Record<string, string> = { planned: 'Планируется', in_progress: 'В работе', closed: 'Закрыто', cancelled: 'Отменено' }
  return v[s] || s
}

function cellClass(c: string) {
  const map: Record<string, string> = { green: styles.cellGreen, red: styles.cellRed, blue: styles.cellBlue, yellow: styles.cellYellow, lightblue: styles.cellLightblue, gray: styles.cellGray, transparent: styles.cellTransparent }
  return map[c] || ''
}

export default function YearlyHiringPlanPage() {
  const [year, setYear] = useState(2026)
  const med = MOCK_MEDIANS
  const av = med.averages

  return (
    <AppLayout pageTitle={`План найма '${String(year).slice(2)}`}>
      <Box className={styles.container}>
        <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
          {/* Легенда */}
          <Flex className={styles.legend} gap="2">
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellGreen}`} /><span>Закрыто в срок</span></div>
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellRed}`} /><span>Закрыто с просрочкой</span></div>
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellBlue}`} /><span>В работе</span></div>
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellYellow}`} /><span>Просрочено</span></div>
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellLightblue}`} /><span>Планируется</span></div>
            <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellGray}`} /><span>Отменено</span></div>
          </Flex>
          <Flex gap="2" align="center">
            <Link href="/reporting/hiring-plan">
              <Button size="2" variant="soft" color="gray">
                <ArrowLeftIcon width={16} height={16} />
                К заявкам
              </Button>
            </Link>
            <Button size="2" variant="soft" color="green" disabled title="Скоро">Excel</Button>
            <Select.Root value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <Select.Trigger style={{ minWidth: 140 }} />
              <Select.Content>
                {AVAILABLE_YEARS.map((y) => <Select.Item key={y} value={String(y)}>{y} год</Select.Item>)}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        <Box className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.vacancyCol}>Вакансия</th>
                <th>Грейд</th>
                <th>Проект</th>
                {MONTHS.map((m, i) => <th key={i} className={styles.monthCell}>{m}</th>)}
                <th>SLA</th>
                <th>Факт</th>
                <th>T2H | SLA</th>
                <th>Рекрутер</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TABLE.map((row) => (
                <tr key={row.request_id}>
                  <td className={styles.vacancyCol} title={row.vacancy}><Text weight="medium" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.vacancy}</Text></td>
                  <td>{row.grade_short}</td>
                  <td>{row.project}</td>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => {
                    const d = row.months[i]
                    const c = d?.color || 'transparent'
                    return (
                      <td key={i} className={`${styles.monthCell} ${cellClass(c)}`}>
                        {d?.active && d.days > 0 ? d.days : (d?.active ? '' : null)}
                      </td>
                    )
                  })}
                  <td>{row.sla_days === '-' ? '—' : `${row.sla_days}д`}</td>
                  <td>{row.status === 'planned' ? '—' : `${row.days_in_year}д`}</td>
                  <td>
                    <Flex direction="column" gap="1" align="center">
                      {row.time2hire != null ? <span className={styles.badge} style={{ background: 'var(--blue-4)', color: 'var(--blue-11)' }}>{row.time2hire} дн.</span> : (row.status === 'closed' ? '—' : '—')}
                      {row.sla_time2hire !== '-' && row.status !== 'planned' && <span className={styles.badge} style={{ background: 'var(--gray-5)', color: 'var(--gray-11)' }}>{row.sla_time2hire} дн.</span>}
                    </Flex>
                  </td>
                  <td>{row.recruiter || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${row.status === 'planned' ? styles.badgePlanned : row.status === 'in_progress' ? styles.badgeProgress : row.status === 'closed' ? styles.badgeClosed : styles.badgeCancelled}`}>
                      {statusLabel(row.status)}
                    </span>
                    {row.closed_date ? <><br /><Text size="1" color="gray">{fmt(row.closed_date)}</Text></> : null}
                  </td>
                </tr>
              ))}

              {/* Медианы */}
              <tr className={styles.rowMedians}>
                <td className={styles.vacancyCol}><Text weight="bold">Медианы</Text></td>
                <td><Text weight="bold">{med.grade}</Text></td>
                <td>—</td>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                  <td key={i} className={styles.monthCell}>{med.monthly_days[i] > 0 ? `${med.monthly_days[i]}д` : '—'}</td>
                ))}
                <td><Text weight="bold">{med.sla}</Text></td>
                <td><Text weight="bold">{med.work_days}</Text></td>
                <td><Flex direction="column" gap="1"><Text weight="bold">{med.time2hire}</Text><Text weight="bold">{med.sla_time2hire}</Text></Flex></td>
                <td colSpan={2}><Text weight="bold">{med.closed_percentage}</Text><br /><Text size="1" color="gray">закрыто</Text></td>
              </tr>

              {/* Средние */}
              <tr className={styles.rowAverages}>
                <td className={styles.vacancyCol}><Text weight="bold">Средние</Text></td>
                <td><Text weight="bold">{av.grade}</Text></td>
                <td>—</td>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                  <td key={i} className={styles.monthCell}>{av.monthly_days[i] > 0 ? `${av.monthly_days[i]}д` : '—'}</td>
                ))}
                <td><Text weight="bold">{av.sla}</Text></td>
                <td><Text weight="bold">{av.work_days}</Text></td>
                <td><Flex direction="column" gap="1"><Text weight="bold">{av.time2hire}</Text><Text weight="bold">{av.sla_time2hire}</Text></Flex></td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </Box>
      </Box>
    </AppLayout>
  )
}
