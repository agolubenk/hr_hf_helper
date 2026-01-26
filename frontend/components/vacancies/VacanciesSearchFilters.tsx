'use client'

import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './VacanciesSearchFilters.module.css'

interface VacanciesSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedRecruiter: string
  onRecruiterChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
}

export default function VacanciesSearchFilters({
  searchQuery,
  onSearchChange,
  selectedRecruiter,
  onRecruiterChange,
  selectedStatus,
  onStatusChange
}: VacanciesSearchFiltersProps) {
  return (
    <Box data-tour="vacancies-filters" className={styles.searchFiltersContainer}>
      <Flex align="center" gap="2" mb="3">
        <MagnifyingGlassIcon width={20} height={20} />
        <Text size="5" weight="bold">Поиск и фильтры</Text>
      </Flex>
      
      <Flex gap="3" align="center" wrap="wrap" className={styles.filtersRow}>
        <TextField.Root
          placeholder="Поиск по названию или ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          size="2"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        <Select.Root value={selectedRecruiter} onValueChange={onRecruiterChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все рекрутеры</Select.Item>
            <Select.Item value="Andrei Golubenko">Andrei Golubenko</Select.Item>
          </Select.Content>
        </Select.Root>

        <Select.Root value={selectedStatus} onValueChange={onStatusChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все</Select.Item>
            <Select.Item value="active">Активные</Select.Item>
            <Select.Item value="inactive">Неактивные</Select.Item>
          </Select.Content>
        </Select.Root>

        <Button size="2" variant="solid" className={styles.searchButton}>
          <MagnifyingGlassIcon height="16" width="16" />
          Поиск
        </Button>
      </Flex>
    </Box>
  )
}
