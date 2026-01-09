'use client'

import { Box, Flex, Text, Table, TextField, Button } from "@radix-ui/themes"
import { Pencil1Icon } from "@radix-ui/react-icons"
import styles from './SalaryRangesEditSection.module.css'

interface SalaryRange {
  id: number
  grade: string
  minSalary: string
  maxSalary: string
  status: 'active' | 'inactive'
}

interface SalaryRangesEditSectionProps {
  salaryRanges: SalaryRange[]
  onChange: (ranges: SalaryRange[]) => void
}

export default function SalaryRangesEditSection({ salaryRanges, onChange }: SalaryRangesEditSectionProps) {
  const updateRange = (id: number, field: keyof SalaryRange, value: string) => {
    onChange(
      salaryRanges.map(range =>
        range.id === id ? { ...range, [field]: value } : range
      )
    )
  }

  return (
    <Box id="salary-ranges" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="4" className={styles.header}>
        <Box style={{ fontSize: '20px', lineHeight: 1 }}>💰</Box>
        <Text size="5" weight="bold">Зарплатные вилки</Text>
      </Flex>

      <Box className={styles.tableContainer}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Минимальная зарплата (USD)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Максимальная зарплата (USD)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {salaryRanges.map((range) => (
              <Table.Row key={range.id}>
                <Table.Cell>
                  <Box className={styles.gradeTag}>
                    <Text size="2">{range.grade}</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">${range.minSalary}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">${range.maxSalary}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.statusTag}>
                    <Text size="1" weight="bold">
                      {range.status === 'active' ? 'Активна' : 'Неактивна'}
                    </Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="2"
                    variant="soft"
                    className={styles.editButton}
                    onClick={() => {
                      updateRange(
                        range.id,
                        'status',
                        range.status === 'active' ? 'inactive' : 'active'
                      )
                    }}
                  >
                    <Pencil1Icon width={14} height={14} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  )
}
