/**
 * RequestsSearchFilters (components/requests/RequestsSearchFilters.tsx) - Компонент поиска и фильтров для заявок на найм
 * 
 * Назначение:
 * - Поиск заявок по названию, ID или отделу
 * - Фильтрация заявок по рекрутеру
 * - Фильтрация заявок по статусу
 * - Фильтрация заявок по приоритету
 * 
 * Функциональность:
 * - Поле поиска: поиск по названию заявки, ID или отделу
 * - Фильтр по рекрутеру: выбор рекрутера из списка (или "Все рекрутеры")
 * - Фильтр по статусу: выбор статуса (Все, Планируется, В процессе, Отменена, Закрыта)
 * - Фильтр по приоритету: выбор приоритета (Все, Высокий, Средний, Низкий)
 * - Кнопка поиска: выполнение поиска с применением фильтров
 * 
 * Связи:
 * - hiring-requests/page.tsx: используется на странице управления заявками
 * - Передает изменения фильтров через пропсы (onSearchChange, onRecruiterChange, onStatusChange, onPriorityChange)
 * 
 * Поведение:
 * - При изменении поискового запроса вызывает onSearchChange
 * - При изменении рекрутера вызывает onRecruiterChange
 * - При изменении статуса вызывает onStatusChange
 * - При изменении приоритета вызывает onPriorityChange
 * 
 * TODO: Реализовать функциональность кнопки "Поиск" (сейчас она не выполняет действий)
 */
'use client'

import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './RequestsSearchFilters.module.css'

/**
 * RequestsSearchFiltersProps - интерфейс пропсов компонента RequestsSearchFilters
 * 
 * Структура:
 * - searchQuery: текущий поисковый запрос
 * - onSearchChange: обработчик изменения поискового запроса
 * - selectedRecruiter: выбранный рекрутер ('all' - все рекрутеры)
 * - onRecruiterChange: обработчик изменения выбранного рекрутера
 * - selectedStatus: выбранный статус ('all' - все, 'planned' - планируется, и т.д.)
 * - onStatusChange: обработчик изменения выбранного статуса
 * - selectedPriority: выбранный приоритет ('all' - все, 'high' - высокий, и т.д.)
 * - onPriorityChange: обработчик изменения выбранного приоритета
 */
interface RequestsSearchFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedRecruiter: string
  onRecruiterChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedPriority: string
  onPriorityChange: (value: string) => void
}

/**
 * RequestsSearchFilters - компонент поиска и фильтров для заявок на найм
 * 
 * Функциональность:
 * - Отображает поле поиска и фильтры
 * - Управляет состоянием фильтров через пропсы
 */
export default function RequestsSearchFilters({
  searchQuery,
  onSearchChange,
  selectedRecruiter,
  onRecruiterChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange
}: RequestsSearchFiltersProps) {
  return (
    <Box className={styles.searchFiltersContainer}>
      {/* Заголовок секции поиска и фильтров */}
      <Flex align="center" gap="2" mb="3">
        <MagnifyingGlassIcon width={20} height={20} />
        <Text size="5" weight="bold">Поиск и фильтры</Text>
      </Flex>
      
      {/* Строка с полем поиска и фильтрами */}
      <Flex gap="3" align="center" wrap="wrap" className={styles.filtersRow}>
        {/* Поле поиска по названию, ID или отделу
            - Иконка поиска слева
            - Обновляет searchQuery при вводе текста */}
        <TextField.Root
          placeholder="Поиск по названию, ID или отделу..."
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
            - Опции: Все, Планируется, В процессе, Отменена, Закрыта */}
        <Select.Root value={selectedStatus} onValueChange={onStatusChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все статусы</Select.Item>
            <Select.Item value="planned">Планируется</Select.Item>
            <Select.Item value="in_process">В процессе</Select.Item>
            <Select.Item value="cancelled">Отменена</Select.Item>
            <Select.Item value="closed">Закрыта</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* Фильтр по приоритету
            - Выпадающий список с приоритетами
            - Опции: Все, Высокий, Средний, Низкий */}
        <Select.Root value={selectedPriority} onValueChange={onPriorityChange}>
          <Select.Trigger className={styles.filterSelect} />
          <Select.Content>
            <Select.Item value="all">Все приоритеты</Select.Item>
            <Select.Item value="high">Высокий</Select.Item>
            <Select.Item value="medium">Средний</Select.Item>
            <Select.Item value="low">Низкий</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* Кнопка "Поиск"
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
