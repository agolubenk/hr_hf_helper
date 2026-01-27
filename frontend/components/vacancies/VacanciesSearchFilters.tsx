/**
 * VacanciesSearchFilters (components/vacancies/VacanciesSearchFilters.tsx) - Компонент поиска и фильтров для вакансий
 * 
 * Назначение:
 * - Поиск вакансий по названию или ID
 * - Фильтрация вакансий по рекрутеру
 * - Фильтрация вакансий по статусу (активные/неактивные)
 * 
 * Функциональность:
 * - Поле поиска: поиск по названию вакансии или ID
 * - Фильтр по рекрутеру: выбор рекрутера из списка (или "Все рекрутеры")
 * - Фильтр по статусу: выбор статуса (Все, Активные, Неактивные)
 * - Кнопка поиска: выполнение поиска с применением фильтров
 * 
 * Связи:
 * - vacancies/page.tsx: используется на странице управления вакансиями
 * - Передает изменения фильтров через пропсы (onSearchChange, onRecruiterChange, onStatusChange)
 * 
 * Поведение:
 * - При изменении поискового запроса вызывает onSearchChange
 * - При изменении рекрутера вызывает onRecruiterChange
 * - При изменении статуса вызывает onStatusChange
 * - Кнопка "Поиск" может использоваться для явного применения фильтров
 * 
 * TODO: Реализовать функциональность кнопки "Поиск" (сейчас она не выполняет действий)
 */
'use client'

import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './VacanciesSearchFilters.module.css'

/**
 * VacanciesSearchFiltersProps - интерфейс пропсов компонента VacanciesSearchFilters
 * 
 * Структура:
 * - searchQuery: текущий поисковый запрос
 * - onSearchChange: обработчик изменения поискового запроса
 * - selectedRecruiter: выбранный рекрутер ('all' - все рекрутеры)
 * - onRecruiterChange: обработчик изменения выбранного рекрутера
 * - selectedStatus: выбранный статус ('all' - все, 'active' - активные, 'inactive' - неактивные)
 * - onStatusChange: обработчик изменения выбранного статуса
 */
interface VacanciesSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedRecruiter: string
  onRecruiterChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
}

/**
 * VacanciesSearchFilters - компонент поиска и фильтров для вакансий
 * 
 * Функциональность:
 * - Отображает поле поиска и фильтры
 * - Управляет состоянием фильтров через пропсы
 */
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
      {/* Заголовок секции поиска и фильтров */}
      <Flex align="center" gap="2" mb="3">
        <MagnifyingGlassIcon width={20} height={20} />
        <Text size="5" weight="bold">Поиск и фильтры</Text>
      </Flex>
      
      {/* Строка с полем поиска и фильтрами */}
      <Flex gap="3" align="center" wrap="wrap" className={styles.filtersRow}>
        {/* Поле поиска по названию или ID вакансии
            - Иконка поиска слева
            - Обновляет searchQuery при вводе текста */}
        <TextField.Root
          placeholder="Поиск по названию или ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)} // Обновляем поисковый запрос
          className={styles.searchInput}
          size="2"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        {/* Фильтр по рекрутеру
            - Выпадающий список с рекрутерами
            - Опция "Все рекрутеры" для сброса фильтра */}
        <Select.Root value={selectedRecruiter} onValueChange={onRecruiterChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все рекрутеры</Select.Item>
            <Select.Item value="Andrei Golubenko">Andrei Golubenko</Select.Item>
            {/* TODO: Загружать список рекрутеров из API */}
          </Select.Content>
        </Select.Root>

        {/* Фильтр по статусу
            - Выпадающий список со статусами
            - Опции: Все, Активные, Неактивные */}
        <Select.Root value={selectedStatus} onValueChange={onStatusChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все</Select.Item>
            <Select.Item value="active">Активные</Select.Item>
            <Select.Item value="inactive">Неактивные</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* Кнопка поиска
            - Выполняет поиск с применением фильтров
            - TODO: Реализовать функциональность */}
        <Button size="2" variant="solid" className={styles.searchButton}>
          <MagnifyingGlassIcon height="16" width="16" />
          Поиск
        </Button>
      </Flex>
    </Box>
  )
}
