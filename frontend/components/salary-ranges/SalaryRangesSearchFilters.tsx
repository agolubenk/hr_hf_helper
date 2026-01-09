'use client'

import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangesSearchFilters.module.css'

interface SalaryRangesSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedVacancy: string
  onVacancyChange: (value: string) => void
  selectedGrade: string
  onGradeChange: (value: string) => void
  onReset: () => void
}

export default function SalaryRangesSearchFilters({
  searchQuery,
  onSearchChange,
  selectedVacancy,
  onVacancyChange,
  selectedGrade,
  onGradeChange,
  onReset
}: SalaryRangesSearchFiltersProps) {
  return (
    <Box className={styles.searchFiltersContainer}>
      <Flex align="center" gap="2" mb="3">
        <MagnifyingGlassIcon width={20} height={20} />
        <Text size="5" weight="bold">Поиск и фильтры</Text>
      </Flex>
      
      <Flex gap="3" align="center" wrap="wrap" className={styles.filtersRow}>
        <TextField.Root
          placeholder="Поиск по вакансии, грейду, ID или значению..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          size="2"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        <Select.Root value={selectedVacancy} onValueChange={onVacancyChange}>
          <Select.Trigger className={styles.filterSelect} size="2" placeholder="Вакансия" />
          <Select.Content>
            <Select.Item value="all">Все вакансии</Select.Item>
            <Select.Item value="DevOps Engineer">DevOps Engineer</Select.Item>
            <Select.Item value="Frontend Engineer (React)">Frontend Engineer (React)</Select.Item>
            <Select.Item value="Backend Engineer (Java)">Backend Engineer (Java)</Select.Item>
            <Select.Item value="QA Engineer">QA Engineer</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root value={selectedGrade} onValueChange={onGradeChange}>
          <Select.Trigger className={styles.filterSelect} size="2" placeholder="Грейд" />
          <Select.Content>
            <Select.Item value="all">Все грейды</Select.Item>
            <Select.Item value="Junior">Junior</Select.Item>
            <Select.Item value="Junior+">Junior+</Select.Item>
            <Select.Item value="Middle">Middle</Select.Item>
            <Select.Item value="Middle+">Middle+</Select.Item>
            <Select.Item value="Senior">Senior</Select.Item>
            <Select.Item value="Senior+">Senior+</Select.Item>
            <Select.Item value="Lead">Lead</Select.Item>
          </Select.Content>
        </Select.Root>

        <Button size="2" variant="solid" className={styles.searchButton}>
          <MagnifyingGlassIcon height="16" width="16" />
          Поиск
        </Button>

        <Button size="2" variant="soft" onClick={onReset}>
          Сбросить
        </Button>
      </Flex>
    </Box>
  )
}
