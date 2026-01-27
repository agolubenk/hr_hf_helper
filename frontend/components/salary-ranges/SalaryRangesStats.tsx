/**
 * SalaryRangesStats (components/salary-ranges/SalaryRangesStats.tsx) - Компонент статистики по зарплатным вилкам
 * 
 * Назначение:
 * - Отображение статистики по зарплатным вилкам
 * - Фильтрация вилок по статусу (активные/неактивные/все)
 * - Переключение режима отображения (карточки/список/таблица)
 * 
 * Функциональность:
 * - Всего вилок: общее количество всех зарплатных вилок
 * - Иконка списка: переключение режима отображения (если передана onListViewClick)
 * - SegmentedControl: фильтрация по статусу (Активных, Неактивных, Все)
 * - Адаптивный текст: разные тексты для десктопа и мобильных
 * 
 * Связи:
 * - vacancies/salary-ranges/page.tsx: используется на странице управления зарплатными вилками
 * - Передает изменения фильтра через onTabChange
 * - Переключает режим отображения через onListViewClick
 * 
 * Поведение:
 * - При изменении вкладки (activeTab) вызывает onTabChange
 * - При клике на иконку списка вызывает onListViewClick
 * - Адаптивные тексты для мобильных устройств (сокращенные версии)
 */
'use client'

import { Box, Flex, Text, SegmentedControl } from "@radix-ui/themes"
import { CheckIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangesStats.module.css'

/**
 * SalaryRangesStatsProps - интерфейс пропсов компонента SalaryRangesStats
 * 
 * Структура:
 * - total: общее количество зарплатных вилок
 * - active: количество активных вилок
 * - inactive: количество неактивных вилок
 * - activeTab: активная вкладка фильтра ('active', 'inactive', 'all')
 * - onTabChange: обработчик изменения активной вкладки
 * - onListViewClick: обработчик клика на иконку списка (переключение режима отображения)
 */
interface SalaryRangesStatsProps {
  total: number
  active: number
  inactive: number
  activeTab: 'active' | 'inactive' | 'all'
  onTabChange: (tab: 'active' | 'inactive' | 'all') => void
  onListViewClick?: () => void
}

/**
 * SalaryRangesStats - компонент статистики по зарплатным вилкам
 * 
 * Функциональность:
 * - Отображает общее количество вилок
 * - Предоставляет переключатель режима отображения
 * - Предоставляет фильтр по статусу
 */
export default function SalaryRangesStats({
  total,
  active,
  inactive,
  activeTab,
  onTabChange,
  onListViewClick
}: SalaryRangesStatsProps) {
  return (
    <Flex justify="between" align="center" className={styles.statsContainer}>
      {/* Левая часть: общее количество вилок и иконка переключения режима */}
      <Flex align="center" gap="3" className={styles.statsLeft}>
        <Text size="3" weight="medium">
          Всего вилок {total}
        </Text>
        {/* Иконка списка для переключения режима отображения
            - Показывается только если передан onListViewClick
            - SVG иконка списка */}
        {onListViewClick && (
          <Box className={styles.listIcon} onClick={onListViewClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="7" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="11" width="12" height="1.5" fill="currentColor" />
              <rect x="2" y="13.5" width="6" height="1.5" fill="currentColor" />
            </svg>
          </Box>
        )}
      </Flex>

      {/* Правая часть: SegmentedControl для фильтрации по статусу */}
      <Box className={styles.statsRight}>
        <SegmentedControl.Root value={activeTab} onValueChange={(value) => onTabChange(value as 'active' | 'inactive' | 'all')}>
          {/* Вкладка "Активных"
              - Иконка галочки и количество активных вилок
              - Адаптивный текст: полный для десктопа, сокращенный для мобильных */}
          <SegmentedControl.Item value="active">
            <Flex align="center" gap="1">
              <CheckIcon width={14} height={14} />
              <Text>
                <span className={styles.textDesktop}>Активных {active}</span>
                <span className={styles.textMobile}>Акт. {active}</span>
              </Text>
            </Flex>
          </SegmentedControl.Item>
          {/* Вкладка "Неактивных"
              - Количество неактивных вилок
              - Адаптивный текст: полный для десктопа, сокращенный для мобильных */}
          <SegmentedControl.Item value="inactive">
            <Text>
              <span className={styles.textDesktop}>Неактивных {inactive}</span>
              <span className={styles.textMobile}>Неакт. {inactive}</span>
            </Text>
          </SegmentedControl.Item>
          {/* Вкладка "Все"
              - Общее количество всех вилок
              - Адаптивный текст: одинаковый для десктопа и мобильных */}
          <SegmentedControl.Item value="all">
            <Text>
              <span className={styles.textDesktop}>Все {total}</span>
              <span className={styles.textMobile}>Все {total}</span>
            </Text>
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Box>
    </Flex>
  )
}
