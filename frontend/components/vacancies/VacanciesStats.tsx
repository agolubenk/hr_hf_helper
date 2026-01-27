/**
 * VacanciesStats (components/vacancies/VacanciesStats.tsx) - Компонент статистики по вакансиям
 * 
 * Назначение:
 * - Отображение статистики по вакансиям
 * - Визуализация количества вакансий по статусам
 * 
 * Функциональность:
 * - Всего вакансий: общее количество всех вакансий
 * - Активных: количество активных вакансий (status === 'active')
 * - Неактивных: количество неактивных вакансий (status === 'inactive')
 * 
 * Связи:
 * - vacancies/page.tsx: отображается на странице управления вакансиями
 * - Использует данные из API или моковых данных
 * 
 * Поведение:
 * - Отображает 3 карточки со статистикой
 * - Каждая карточка содержит число и иконку
 * - data-tour атрибут для тура по приложению
 * 
 * Дизайн:
 * - Простые карточки с текстом и иконками
 * - Зеленая иконка для активных вакансий
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { 
  FileTextIcon, 
  CheckIcon, 
  StopwatchIcon 
} from "@radix-ui/react-icons"
import styles from './VacanciesStats.module.css'

/**
 * VacanciesStatsProps - интерфейс пропсов компонента VacanciesStats
 * 
 * Структура:
 * - total: общее количество вакансий
 * - active: количество активных вакансий
 * - inactive: количество неактивных вакансий
 */
interface VacanciesStatsProps {
  total: number
  active: number
  inactive: number
}

/**
 * VacanciesStats - компонент статистики по вакансиям
 * 
 * Функциональность:
 * - Отображает 3 карточки со статистикой по вакансиям
 * - Каждая карточка содержит число и иконку
 */
export default function VacanciesStats({ total, active, inactive }: VacanciesStatsProps) {
  return (
    <Flex data-tour="vacancies-stats" gap="3" className={styles.statsContainer}>
      {/* Карточка "Всего вакансий"
          - Отображает общее количество всех вакансий
          - Иконка: FileTextIcon */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{total} Всего вакансий</Text>
          <FileTextIcon width={20} height={20} />
        </Flex>
      </Box>
      
      {/* Карточка "Активных"
          - Отображает количество активных вакансий
          - Иконка: CheckIcon (зеленого цвета) */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{active} Активных</Text>
          <CheckIcon width={20} height={20} style={{ color: '#10b981' }} />
        </Flex>
      </Box>
      
      {/* Карточка "Неактивных"
          - Отображает количество неактивных вакансий
          - Иконка: StopwatchIcon */}
      <Box className={styles.statCard}>
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{inactive} Неактивных</Text>
          <StopwatchIcon width={20} height={20} />
        </Flex>
      </Box>
    </Flex>
  )
}
