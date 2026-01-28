/**
 * RequestsStats (components/requests/RequestsStats.tsx) - Компонент статистики по заявкам на найм
 * 
 * Назначение:
 * - Отображение статистики по заявкам на найм
 * - Визуализация количества заявок по статусам
 * 
 * Функциональность:
 * - Всего заявок: общее количество всех заявок
 * - Планируется: количество заявок со статусом "planned"
 * - В процессе: количество заявок со статусом "in_process"
 * - Отменена: количество заявок со статусом "cancelled"
 * - Закрыта: количество заявок со статусом "closed"
 * 
 * Связи:
 * - hiring-requests/page.tsx: отображается на странице управления заявками
 * - Использует данные из API или моковых данных
 * 
 * Поведение:
 * - Отображает 5 карточек со статистикой
 * - Каждая карточка содержит число и иконку
 * - Цветовые индикации для разных статусов
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { 
  ClipboardIcon, 
  ClockIcon, 
  CheckIcon,
  CrossCircledIcon,
  CalendarIcon
} from "@radix-ui/react-icons"
import styles from './RequestsStats.module.css'

/**
 * RequestsStatsProps - интерфейс пропсов компонента RequestsStats
 * 
 * Структура:
 * - total: общее количество заявок
 * - planned: количество заявок со статусом "planned"
 * - inProcess: количество заявок со статусом "in_process"
 * - cancelled: количество заявок со статусом "cancelled"
 * - closed: количество заявок со статусом "closed"
 */
interface RequestsStatsProps {
  total: number
  planned: number
  inProcess: number
  cancelled: number
  closed: number
}

/**
 * RequestsStats - компонент статистики по заявкам на найм
 * 
 * Функциональность:
 * - Отображает 5 карточек со статистикой по заявкам
 * - Каждая карточка содержит число и иконку с цветовой индикацией
 */
export default function RequestsStats({ total, planned, inProcess, cancelled, closed }: RequestsStatsProps) {
  return (
    <Flex gap="3" className={styles.statsContainer}>
      {/* Карточка "Всего заявок"
          - Отображает общее количество всех заявок
          - Иконка: ClipboardIcon */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{total} Всего заявок</Text>
          <ClipboardIcon width={20} height={20} />
        </Flex>
      </Box>
      
      {/* Карточка "Планируется"
          - Отображает количество заявок со статусом "planned"
          - Иконка: CalendarIcon (синий цвет) */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{planned} Планируется</Text>
          <CalendarIcon width={20} height={20} style={{ color: '#3b82f6' }} />
        </Flex>
      </Box>
      
      {/* Карточка "В процессе"
          - Отображает количество заявок со статусом "in_process"
          - Иконка: ClockIcon (оранжевый цвет) */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{inProcess} В процессе</Text>
          <ClockIcon width={20} height={20} style={{ color: '#f59e0b' }} />
        </Flex>
      </Box>
      
      {/* Карточка "Отменена"
          - Отображает количество заявок со статусом "cancelled"
          - Иконка: CrossCircledIcon (красный цвет) */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{cancelled} Отменена</Text>
          <CrossCircledIcon width={20} height={20} style={{ color: '#ef4444' }} />
        </Flex>
      </Box>
      
      {/* Карточка "Закрыта"
          - Отображает количество заявок со статусом "closed"
          - Иконка: CheckIcon (зеленый цвет) */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{closed} Закрыта</Text>
          <CheckIcon width={20} height={20} style={{ color: '#12a594' }} />
        </Flex>
      </Box>
    </Flex>
  )
}
