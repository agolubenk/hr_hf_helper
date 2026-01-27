/**
 * YearlyHiringPlanPage (reporting/hiring-plan/yearly/page.tsx) - Страница годового плана найма
 * 
 * Назначение:
 * - Отображение годового плана найма в виде таблицы
 * - Визуализация заявок на найм по месяцам года
 * - Отслеживание статусов заявок и сроков выполнения
 * - Расчет медиан и средних значений
 * 
 * Функциональность:
 * - Таблица заявок на найм с разбивкой по месяцам
 * - Цветовая индикация статусов заявок в ячейках месяцев
 * - Отображение количества дней работы над заявкой в каждом месяце
 * - Расчет и отображение медиан и средних значений
 * - Фильтрация по году
 * - Экспорт/импорт в Excel
 * - Ссылки на вакансии и кандидатов в Huntflow
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - Link: навигация к странице плана найма
 * - reporting/hiring-plan/page.tsx: страница плана найма, откуда происходит переход
 * 
 * Поведение:
 * - При загрузке отображает таблицу заявок за выбранный год
 * - При изменении года обновляет данные таблицы
 * - Цвет ячеек месяцев зависит от статуса заявки в этом месяце
 * - При клике на ссылки открываются вакансии/кандидаты в Huntflow
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button, Select, DropdownMenu } from '@radix-ui/themes'
import { ArrowLeftIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import Link from 'next/link'
import styles from './yearly.module.css'

/**
 * MONTHS - массив сокращенных названий месяцев
 * 
 * Используется для:
 * - Отображения заголовков колонок таблицы
 * - Форматирования дат
 */
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

/**
 * buildMonths - функция построения объекта месяцев для заявки
 * 
 * Функциональность:
 * - Создает объект с данными для каждого месяца (1-12)
 * - Устанавливает цвет и активность для месяцев, указанных в active
 * - Устанавливает количество дней работы над заявкой в каждом месяце
 * 
 * Параметры:
 * - active: массив номеров активных месяцев (месяцы, когда работали над заявкой)
 * - color: цвет для активных месяцев (зависит от статуса заявки)
 * - days: объект с количеством дней работы в каждом месяце
 * 
 * Возвращает:
 * - Объект Record<number, { color, active, days }> для всех 12 месяцев
 * 
 * Используется для:
 * - Построения данных для отображения в таблице
 * - Определения цвета ячеек месяцев
 * - Отображения количества дней работы
 */
function buildMonths(active: number[], color: string, days: Record<number, number> = {}) {
  const m: Record<number, { color: string; active: boolean; days: number }> = {}
  for (let i = 1; i <= 12; i++) {
    // Если месяц в списке активных - используем указанный цвет, иначе прозрачный
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
  recruiters: { name: string; days: number }[]
  closed_date: string | null
  candidate_name: string | null
  candidate_id: string | null
  vacancy_external_url: string | null
  candidate_external_url: string | null
  planned_date: string | null
}[] = [
  { request_id: 1, vacancy: 'Frontend Engineer (React)', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', sla_days: 35, sla_time2hire: 48, status: 'in_progress', days_in_year: 26, time2hire: null, months: buildMonths([12], 'blue', { 12: 15 }), recruiters: [{ name: 'Голубенко А.', days: 26 }], closed_date: null, candidate_name: null, candidate_id: null, vacancy_external_url: 'https://app.huntflow.ru/vacancy/1', candidate_external_url: null, planned_date: null },
  { request_id: 2, vacancy: 'DevOps Engineer', grade: 'Middle+', grade_short: 'M+', project: '—', sla_days: 40, sla_time2hire: 56, status: 'closed', days_in_year: 26, time2hire: 67, months: buildMonths([12, 1], 'green', { 12: 21, 1: 6 }), recruiters: [{ name: 'Голубенко А.', days: 15 }, { name: 'Черномордин А.', days: 6 }, { name: 'Петрова М.', days: 5 }], closed_date: '2026-01-06', candidate_name: 'Aleksander Volvachev', candidate_id: '76779160', vacancy_external_url: 'https://app.huntflow.ru/vacancy/2', candidate_external_url: 'https://app.huntflow.ru/candidate/76779160', planned_date: null },
  { request_id: 3, vacancy: 'Backend Engineer', grade: 'Middle', grade_short: 'M', project: '—', sla_days: 35, sla_time2hire: 38, status: 'planned', days_in_year: 0, time2hire: null, months: buildMonths([1], 'lightblue', {}), recruiters: [{ name: 'Голубенко А.', days: 0 }], closed_date: null, candidate_name: null, candidate_id: null, vacancy_external_url: 'https://app.huntflow.ru/vacancy/3', candidate_external_url: null, planned_date: '2026-01-15' },
  { request_id: 4, vacancy: 'Support Engineer', grade: 'Junior+', grade_short: 'J+', project: '—', sla_days: 30, sla_time2hire: 38, status: 'in_progress', days_in_year: 28, time2hire: null, months: buildMonths([12], 'blue', { 12: 17 }), recruiters: [{ name: 'Черномордин А.', days: 28 }], closed_date: null, candidate_name: null, candidate_id: null, vacancy_external_url: 'https://app.huntflow.ru/vacancy/4', candidate_external_url: null, planned_date: null },
  { request_id: 5, vacancy: 'QA Engineer', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', sla_days: 35, sla_time2hire: 38, status: 'cancelled', days_in_year: 22, time2hire: null, months: buildMonths([12, 1], 'gray', { 12: 27, 1: 10 }), recruiters: [{ name: 'Голубенко А.', days: 22 }], closed_date: '2026-01-10', candidate_name: null, candidate_id: null, vacancy_external_url: 'https://app.huntflow.ru/vacancy/5', candidate_external_url: null, planned_date: null },
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
        <Flex justify="between" align="center" mb="2" wrap="nowrap" gap="3">
          <Button size="2" variant="soft" color="gray" asChild style={{ flexShrink: 0 }}>
            <Link href="/reporting/hiring-plan">
              <ArrowLeftIcon width={16} height={16} />
              К заявкам
            </Link>
          </Button>
          <Flex className={styles.topRowRight} gap="2" align="center" wrap="nowrap">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button size="2" variant="soft" color="green">
                  Excel
                  <ChevronDownIcon width={14} height={14} />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => {}}>Импорт</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => {}}>Экспорт</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Select.Root value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <Select.Trigger style={{ minWidth: 140, flexShrink: 0 }} />
              <Select.Content>
                {AVAILABLE_YEARS.map((y) => <Select.Item key={y} value={String(y)}>{y} год</Select.Item>)}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
        <Flex className={styles.legend} gap="2" mb="4" wrap="wrap">
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellGreen}`} /><span>Закрыто в срок</span></div>
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellRed}`} /><span>Закрыто с просрочкой</span></div>
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellBlue}`} /><span>В работе</span></div>
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellYellow}`} /><span>Просрочено</span></div>
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellLightblue}`} /><span>Планируется</span></div>
          <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.cellGray}`} /><span>Отменено</span></div>
        </Flex>

        <Box className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.vacancyCol}>Вакансия</th>
                <th>Грейд</th>
                <th>Проект</th>
                <th>Рекрутер</th>
                {MONTHS.map((m, i) => <th key={i} className={styles.monthCell}>{m}</th>)}
                <th>Факт | SLA</th>
                <th>T2H | SLA</th>
                <th className={styles.candidateCol}>Кандидат</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TABLE.map((row) => (
                <tr key={row.request_id}>
                  <td className={styles.vacancyCol} title={row.vacancy}>
                    <span className={styles.cellOneLine}>
                      <Text weight="medium" as="span" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.vacancy}</Text>
                      {row.vacancy_external_url && (
                        <a href={row.vacancy_external_url} target="_blank" rel="noopener noreferrer" title="Открыть в новой вкладке" className={styles.extLink}>↗</a>
                      )}
                    </span>
                  </td>
                  <td>{row.grade_short}</td>
                  <td>{row.project}</td>
                  <td>{row.recruiters?.length ? row.recruiters.map((re) => `${re.name} (${re.days} дн.)`).join(' → ') : '—'}</td>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => {
                    const d = row.months[i]
                    const c = d?.color || 'transparent'
                    return (
                      <td key={i} className={`${styles.monthCell} ${cellClass(c)}`}>
                        {d?.active && d.days > 0 ? d.days : (d?.active ? '' : null)}
                      </td>
                    )
                  })}
                  <td>
                    <span className={styles.cellTwoLines}>
                      {row.status === 'planned' ? '—' : `${row.days_in_year}д`}
                      {row.sla_days !== '-' && <><br /><span className={styles.badge} style={{ background: 'var(--gray-5)', color: 'var(--gray-11)' }}>{row.sla_days}д</span></>}
                    </span>
                  </td>
                  <td>
                    <span className={styles.cellTwoLines}>
                      {row.time2hire != null ? <span className={styles.badge} style={{ background: 'var(--blue-4)', color: 'var(--blue-11)' }}>{row.time2hire} дн.</span> : (row.status === 'closed' ? '—' : '—')}
                      {row.sla_time2hire !== '-' && row.status !== 'planned' && <><br /><span className={styles.badge} style={{ background: 'var(--gray-5)', color: 'var(--gray-11)' }}>{row.sla_time2hire} дн.</span></>}
                    </span>
                  </td>
                  <td className={styles.candidateCol}>
                    <span className={styles.cellOneLine}>
                      {row.status === 'closed' && row.candidate_name && row.candidate_external_url ? (
                        <a href={row.candidate_external_url} target="_blank" rel="noopener noreferrer" title="Кандидат в базе" className={styles.candidateLink} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.candidate_name}</a>
                      ) : row.status === 'closed' && row.candidate_name ? (
                        <Text as="span" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.candidate_name}</Text>
                      ) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.cellTwoLines}>
                      <span className={`${styles.badge} ${row.status === 'planned' ? styles.badgePlanned : row.status === 'in_progress' ? styles.badgeProgress : row.status === 'closed' ? styles.badgeClosed : styles.badgeCancelled}`}>
                        {statusLabel(row.status)}
                      </span>
                      <br />
                      <Text size="1" color="gray" as="span">
                        {row.status === 'closed' || row.status === 'cancelled' ? (row.closed_date ? fmt(row.closed_date) : '—') : row.status === 'planned' ? (row.planned_date ? fmt(row.planned_date) : '—') : '—'}
                      </Text>
                    </span>
                  </td>
                </tr>
              ))}

              {/* Медианы */}
              <tr className={styles.rowMedians}>
                <td className={styles.vacancyCol}><Text weight="bold">Медианы</Text></td>
                <td><Text weight="bold">{med.grade}</Text></td>
                <td>—</td>
                <td>—</td>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                  <td key={i} className={styles.monthCell}>{med.monthly_days[i] > 0 ? `${med.monthly_days[i]}д` : '—'}</td>
                ))}
                <td><span className={styles.cellTwoLines}><Text weight="bold" as="span">{med.work_days}</Text><br /><Text weight="bold" as="span">{med.sla}</Text></span></td>
                <td><span className={styles.cellTwoLines}><Text weight="bold" as="span">{med.time2hire}</Text><br /><Text weight="bold" as="span">{med.sla_time2hire}</Text></span></td>
                <td className={styles.candidateCol}>—</td>
                <td><Text weight="bold">{med.closed_percentage}</Text><br /><Text size="1" color="gray">закрыто</Text></td>
              </tr>

              {/* Средние */}
              <tr className={styles.rowAverages}>
                <td className={styles.vacancyCol}><Text weight="bold">Средние</Text></td>
                <td><Text weight="bold">{av.grade}</Text></td>
                <td>—</td>
                <td />
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                  <td key={i} className={styles.monthCell}>{av.monthly_days[i] > 0 ? `${av.monthly_days[i]}д` : '—'}</td>
                ))}
                <td><span className={styles.cellTwoLines}><Text weight="bold" as="span">{av.work_days}</Text><br /><Text weight="bold" as="span">{av.sla}</Text></span></td>
                <td><span className={styles.cellTwoLines}><Text weight="bold" as="span">{av.time2hire}</Text><br /><Text weight="bold" as="span">{av.sla_time2hire}</Text></span></td>
                <td className={styles.candidateCol} />
                <td />
              </tr>
            </tbody>
          </table>
        </Box>
      </Box>
    </AppLayout>
  )
}
