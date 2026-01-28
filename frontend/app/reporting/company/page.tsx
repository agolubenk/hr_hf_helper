/**
 * CompanyReportPage (reporting/company/page.tsx) - Страница отчета по компании
 * 
 * Назначение:
 * - Отображение отчетов по скринингам и интервью компании
 * - Метрики по скринингам и интервью
 * - Графики по периодам (месяцы, недели, дни)
 * - Фильтрация по вакансиям и рекрутерам
 * - Таблица данных по периодам
 * - Экспорт отчета в Excel
 * 
 * Функциональность:
 * - Метрики: всего скринингов, всего интервью, конверсия, суммарное время
 * - График с настройками:
 *   - Период графика: месяцы, недели, дни
 *   - Единица измерения: часы, количество
 *   - Фильтр: по вакансиям, по рекрутерам
 * - Чекбоксы для выбора вакансий на графике
 * - Таблица данных по периодам с количеством скринингов, интервью и временем
 * - Настройка периода отчета (ежедневная, понедельная, помесячная, поквартальная, годовая)
 * - Настройка дат начала и окончания периода
 * - Экспорт отчета в Excel
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - Sidebar: содержит ссылку на эту страницу в разделе "Отчетность"
 * 
 * Поведение:
 * - При загрузке отображает метрики и график за выбранный период
 * - При изменении периода отчета обновляет данные
 * - При изменении настроек графика обновляет график
 * - При выборе/снятии вакансий обновляет график
 * - При экспорте создает Excel файл с данными отчета
 * 
 * TODO: Заменить моковые данные на реальные из API
 * TODO: Реализовать реальный график (сейчас только заглушка)
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button, Table, TextField, Select } from "@radix-ui/themes"
import { BarChartIcon, CalendarIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './company-report.module.css'

/**
 * CompanyReportPage - компонент страницы отчета по компании
 * 
 * Состояние:
 * - period: тип периода отчета ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
 * - startDate, endDate: даты начала и окончания периода отчета
 * - graphPeriod: период графика ('months', 'weeks', 'days')
 * - graphUnit: единица измерения графика ('hours', 'count')
 * - graphFilter: фильтр графика ('vacancies', 'recruiters')
 */
export default function CompanyReportPage() {
  // Тип периода отчета: ежедневная, понедельная, помесячная, поквартальная, годовая
  const [period, setPeriod] = useState('monthly')
  // Дата начала периода отчета (формат DD.MM.YYYY)
  const [startDate, setStartDate] = useState('12.01.2025')
  // Дата окончания периода отчета (формат DD.MM.YYYY)
  const [endDate, setEndDate] = useState('12.01.2026')
  // Период графика: 'months' - месяцы, 'weeks' - недели, 'days' - дни
  const [graphPeriod, setGraphPeriod] = useState('months')
  // Единица измерения графика: 'hours' - часы, 'count' - количество
  const [graphUnit, setGraphUnit] = useState('hours')
  // Фильтр графика: 'vacancies' - по вакансиям, 'recruiters' - по рекрутерам
  const [graphFilter, setGraphFilter] = useState('vacancies')

  // Моковые данные метрик
  const metrics = {
    totalScreenings: 1807,
    totalInterviews: 335,
    conversion: 18.54,
    totalTime: '2146 ч 41 мин'
  }

  const periodOptions = [
    { value: 'daily', label: 'Ежедневная' },
    { value: 'weekly', label: 'Понедельная' },
    { value: 'monthly', label: 'Помесячная' },
    { value: 'quarterly', label: 'Поквартальная' },
    { value: 'yearly', label: 'Годовая' }
  ]

  // Моковые данные вакансий для графика
  const vacancies = [
    { id: 1, name: 'AQA Engineer (TS)', checked: true, color: '#06b6d4' },
    { id: 2, name: 'Backend Engineer (Java)', checked: true, color: '#10b981' },
    { id: 3, name: 'DevOps Engineer', checked: true, color: '#f97316' },
    { id: 4, name: 'Frontend Engineer (React)', checked: true, color: '#8b5cf6' },
    { id: 5, name: 'Manual QA Engineer', checked: true, color: '#ec4899' },
    { id: 6, name: 'Project Manager', checked: true, color: '#eab308' },
    { id: 7, name: 'Support Engineer (Service Manager/Sport Analyst)', checked: true, color: '#6b7280' },
    { id: 8, name: 'System Administrator', checked: true, color: '#3b82f6' },
    { id: 9, name: 'UX/UI Designer', checked: true, color: '#14b8a6' }
  ]

  // Моковые данные для таблицы
  const tableData = [
    { period: '2025-01', screenings: 64, interviews: 36, total: 100, time: '83 ч 55 мин' },
    { period: '2025-02', screenings: 114, interviews: 24, total: 138, time: '117 ч 40 мин' },
    { period: '2025-03', screenings: 123, interviews: 27, total: 150, time: '134 ч 55 мин' },
    { period: '2025-04', screenings: 115, interviews: 18, total: 133, time: '426 ч 5 мин' },
    { period: '2025-05', screenings: 156, interviews: 28, total: 184, time: '187 ч 10 мин' },
    { period: '2025-06', screenings: 159, interviews: 23, total: 182, time: '157 ч 30 мин' },
    { period: '2025-07', screenings: 148, interviews: 28, total: 176, time: '149 ч 26 мин' },
    { period: '2025-08', screenings: 203, interviews: 29, total: 232, time: '227 ч 5 мин' },
    { period: '2025-09', screenings: 171, interviews: 30, total: 201, time: '171 ч' },
    { period: '2025-10', screenings: 193, interviews: 29, total: 222, time: '185 ч 25 мин' },
    { period: '2025-11', screenings: 159, interviews: 34, total: 193, time: '153 ч 15 мин' }
  ]

  return (
    <AppLayout pageTitle="Отчет по компании">
      <Box style={{ padding: '24px' }}>
        <Flex align="center" style={{ justifyContent: 'space-between' }} mb="4">
          <Flex align="center" gap="2">
            <BarChartIcon width={24} height={24} />
            <Text size="6" weight="bold">Отчет по компании</Text>
          </Flex>
          <Button size="3" variant="solid" style={{ background: 'var(--green-9)' }}>
            Экспорт в Excel
          </Button>
        </Flex>

        {/* Метрики */}
        <Flex gap="4" mb="4" wrap="wrap">
          <Card className={styles.metricCard} style={{ flex: 1, minWidth: '200px' }}>
            <Text size="5" weight="bold" style={{ color: 'var(--accent-9)', marginBottom: '8px', display: 'block' }}>
              {metrics.totalScreenings}
            </Text>
            <Box style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
              <Text size="2" color="gray">Всего скринингов</Text>
            </Box>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: '200px' }}>
            <Text size="5" weight="bold" style={{ color: 'var(--accent-9)', marginBottom: '8px', display: 'block' }}>
              {metrics.totalInterviews}
            </Text>
            <Box style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
              <Text size="2" color="gray">Всего интервью</Text>
            </Box>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: '200px' }}>
            <Text size="5" weight="bold" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}>
              {metrics.conversion}%
            </Text>
            <Box style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
              <Text size="2" color="gray">Конверсия (скрининги → интервью)</Text>
            </Box>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: '200px' }}>
            <Text size="5" weight="bold" style={{ color: 'var(--accent-9)', marginBottom: '8px', display: 'block' }}>
              {metrics.totalTime}
            </Text>
            <Box style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
              <Text size="2" color="gray">Суммарное время</Text>
            </Box>
          </Card>
        </Flex>

        {/* График */}
        <Card mb="4" className={styles.graphCard}>
          <Flex direction="column" gap="4">
            {/* Заголовок и фильтры графика: слева «График», справа — Месяцы, Часы, По вакансиям в одну строку */}
            <Flex align="center" className={styles.graphHeader}>
              <Text size="4" weight="bold">График</Text>
              <Flex gap="2" wrap="nowrap" align="center" className={styles.graphControls}>
                <Select.Root value={graphPeriod} onValueChange={setGraphPeriod}>
                  <Select.Trigger style={{ minWidth: '120px' }} placeholder="Месяцы" />
                  <Select.Content>
                    <Select.Item value="months">Месяцы</Select.Item>
                    <Select.Item value="weeks">Недели</Select.Item>
                    <Select.Item value="days">Дни</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={graphUnit} onValueChange={setGraphUnit}>
                  <Select.Trigger style={{ minWidth: '120px' }} placeholder="Часы" />
                  <Select.Content>
                    <Select.Item value="hours">Часы</Select.Item>
                    <Select.Item value="count">Количество</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={graphFilter} onValueChange={setGraphFilter}>
                  <Select.Trigger style={{ minWidth: '150px' }} placeholder="По вакансиям" />
                  <Select.Content>
                    <Select.Item value="recruiters">По рекрутерам</Select.Item>
                    <Select.Item value="vacancies">По вакансиям</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>

            {/* Чекбоксы и легенда */}
            <Box>
              <Flex gap="3" wrap="wrap" mb="3">
                {vacancies.map((item) => (
                  <Flex key={item.id} align="center" gap="2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      style={{ cursor: 'pointer' }}
                    />
                    <Text size="2">{item.name}</Text>
                  </Flex>
                ))}
              </Flex>
              
              {/* Легенда */}
              <Flex gap="3" wrap="wrap" mt="2">
                {vacancies.map((item) => (
                  <Flex key={item.id} align="center" gap="2">
                    <Box
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }}
                    />
                    <Text size="1" color="gray">
                      {item.name} ({graphUnit === 'hours' ? 'часы' : 'количество'})
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>

            {/* Область графика */}
            <Box className={styles.graphArea}>
              <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                График будет отображаться здесь
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Таблица детализации */}
        <Card>
          <Box className={styles.tableHeader}>
            <Text size="3" weight="bold" style={{ color: 'white' }}>
              Детализация по периодам
            </Text>
          </Box>
          <Table.Root size="2" variant="ghost">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Период</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Скрининги</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Интервью</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Всего</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Время</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.map((row, index) => (
                <Table.Row 
                  key={row.period}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'var(--gray-2)' : 'var(--color-panel)'
                  }}
                >
                  <Table.Cell>{row.period}</Table.Cell>
                  <Table.Cell>{row.screenings}</Table.Cell>
                  <Table.Cell>{row.interviews}</Table.Cell>
                  <Table.Cell>
                    <Text weight="bold">{row.total}</Text>
                  </Table.Cell>
                  <Table.Cell>{row.time}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Box>
    </AppLayout>
  )
}
