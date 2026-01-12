'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button, Table, TextField, Select } from "@radix-ui/themes"
import { BarChartIcon, CalendarIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './company-report.module.css'

export default function CompanyReportPage() {
  const [period, setPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState('12.01.2025')
  const [endDate, setEndDate] = useState('12.01.2026')

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
