'use client'

import { Box, Flex, Text, Table } from "@radix-ui/themes"
import styles from './SalaryRangesSection.module.css'

interface SalaryRangesSectionProps {
  salaryRanges: Array<{
    grade: string
    usd: string
    byn: string
    pln: string
    eur: string
    status: string
  }>
}

export default function SalaryRangesSection({ salaryRanges }: SalaryRangesSectionProps) {
  return (
    <Box id="salary-ranges" className={styles.sectionCard}>
      <Flex align="center" gap="2" mb="3" className={styles.sectionHeader}>
        <Box style={{ fontSize: '20px', lineHeight: 1 }}>💰</Box>
        <Text size="5" weight="bold">Зарплатные вилки</Text>
      </Flex>
      <Box className={styles.tableContainer}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Зарплата (USD)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Зарплата (BYN)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Зарплата (PLN)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Зарплата (EUR)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {salaryRanges.map((range, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Box className={styles.gradeTag}>
                    <Text size="2">{range.grade}</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell><Text size="2">{range.usd}</Text></Table.Cell>
                <Table.Cell><Text size="2">{range.byn}</Text></Table.Cell>
                <Table.Cell><Text size="2">{range.pln}</Text></Table.Cell>
                <Table.Cell><Text size="2">{range.eur}</Text></Table.Cell>
                <Table.Cell>
                  <Box className={styles.statusTag}>
                    <Text size="1" weight="bold">{range.status === 'active' ? 'Активна' : 'Неактивна'}</Text>
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  )
}
