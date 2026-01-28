/**
 * SalaryRangesSearchFilters (components/salary-ranges/SalaryRangesSearchFilters.tsx) - Компонент поиска и фильтров для зарплатных вилок
 * 
 * Назначение:
 * - Поиск зарплатных вилок по вакансии, грейду, ID или значению
 * - Фильтрация вилок по вакансии
 * - Фильтрация вилок по грейду
 * - Сброс всех фильтров
 * 
 * Функциональность:
 * - Поле поиска: поиск по вакансии, грейду, ID или значению зарплаты
 * - Фильтр по вакансии: выбор вакансии из списка (или "Все вакансии")
 * - Фильтр по грейду: выбор грейда из списка (или "Все грейды")
 * - Кнопка "Поиск": выполнение поиска с применением фильтров
 * - Кнопка "Сбросить": сброс всех фильтров и поискового запроса
 * 
 * Связи:
 * - vacancies/salary-ranges/page.tsx: используется на странице управления зарплатными вилками
 * - Передает изменения фильтров через пропсы (onSearchChange, onVacancyChange, onGradeChange, onReset)
 * 
 * Поведение:
 * - При изменении поискового запроса вызывает onSearchChange
 * - При изменении вакансии вызывает onVacancyChange
 * - При изменении грейда вызывает onGradeChange
 * - При клике на "Сбросить" вызывает onReset
 * 
 * TODO: Реализовать функциональность кнопки "Поиск" (сейчас она не выполняет действий)
 */
'use client'

import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangesSearchFilters.module.css'

/**
 * SalaryRangesSearchFiltersProps - интерфейс пропсов компонента SalaryRangesSearchFilters
 * 
 * Структура:
 * - searchQuery: текущий поисковый запрос
 * - onSearchChange: обработчик изменения поискового запроса
 * - selectedVacancy: выбранная вакансия ('all' - все вакансии)
 * - onVacancyChange: обработчик изменения выбранной вакансии
 * - selectedGrade: выбранный грейд ('all' - все грейды)
 * - onGradeChange: обработчик изменения выбранного грейда
 * - onReset: обработчик сброса всех фильтров
 */
interface SalaryRangesSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedVacancy: string
  onVacancyChange: (value: string) => void
  selectedGrade: string
  onGradeChange: (value: string) => void
  onReset: () => void
}

/**
 * SalaryRangesSearchFilters - компонент поиска и фильтров для зарплатных вилок
 * 
 * Функциональность:
 * - Отображает поле поиска и фильтры
 * - Управляет состоянием фильтров через пропсы
 */
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
      {/* Заголовок секции поиска и фильтров */}
      <Flex align="center" gap="2" mb="3">
        <MagnifyingGlassIcon width={20} height={20} />
        <Text size="5" weight="bold">Поиск и фильтры</Text>
      </Flex>
      
      {/* Строка с полем поиска и фильтрами */}
      <Flex gap="3" align="center" wrap="wrap" className={styles.filtersRow}>
        {/* Поле поиска по вакансии, грейду, ID или значению
            - Иконка поиска слева
            - Обновляет searchQuery при вводе текста */}
        <TextField.Root
          placeholder="Поиск по вакансии, грейду, ID или значению..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)} // Обновляем поисковый запрос
          className={styles.searchInput}
          size="2"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        {/* Фильтр по вакансии
            - Выпадающий список с вакансиями
            - Опция "Все вакансии" для сброса фильтра */}
        <Select.Root value={selectedVacancy} onValueChange={onVacancyChange}>
          <Select.Trigger className={styles.filterSelect} placeholder="Вакансия" />
          <Select.Content>
            <Select.Item value="all">Все вакансии</Select.Item>
            <Select.Item value="DevOps Engineer">DevOps Engineer</Select.Item>
            <Select.Item value="Frontend Engineer (React)">Frontend Engineer (React)</Select.Item>
            <Select.Item value="Backend Engineer (Java)">Backend Engineer (Java)</Select.Item>
            <Select.Item value="QA Engineer">QA Engineer</Select.Item>
            {/* TODO: Загружать список вакансий из API */}
          </Select.Content>
        </Select.Root>

        {/* Фильтр по грейду
            - Выпадающий список с грейдами
            - Опции: Все грейды, Junior, Junior+, Middle, Middle+, Senior, Senior+, Lead */}
        <Select.Root value={selectedGrade} onValueChange={onGradeChange}>
          <Select.Trigger className={styles.filterSelect} placeholder="Грейд" />
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

        {/* Кнопка "Поиск"
            - Выполняет поиск с применением фильтров
            - TODO: Реализовать функциональность */}
        <Button size="2" variant="solid" className={styles.searchButton}>
          <MagnifyingGlassIcon height="16" width="16" />
          Поиск
        </Button>

        {/* Кнопка "Сбросить"
            - Сбрасывает все фильтры и поисковый запрос */}
        <Button size="2" variant="soft" onClick={onReset}>
          Сбросить
        </Button>
      </Flex>
    </Box>
  )
}
