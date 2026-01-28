/**
 * SalaryRangeListItem (components/salary-ranges/SalaryRangeListItem.tsx) - Компонент элемента списка зарплатной вилки (режим "Список")
 * 
 * Назначение:
 * - Отображение информации о зарплатной вилке в виде элемента списка
 * - Используется в режиме отображения "Список" на странице зарплатных вилок
 * 
 * Функциональность:
 * - Название вакансии, статус, грейд и дата в первой строке
 * - Зарплатные вилки в разных валютах во второй строке
 * - Кнопка активации/деактивации вилки
 * - Адаптивная верстка: разные layout для десктопа и мобильных
 * 
 * Связи:
 * - vacancies/salary-ranges/page.tsx: используется в режиме отображения "Список"
 * - vacancies/salary-ranges/page.tsx: переход к детальному просмотру при клике
 * 
 * Поведение:
 * - При клике на элемент списка (если передан onClick) - переход к детальному просмотру
 * - При клике на кнопку активации/деактивации - изменение статуса вилки
 * - stopPropagation предотвращает всплытие событий от кнопки к элементу списка
 * 
 * Адаптивность:
 * - Десктопная версия: горизонтальное расположение информации
 * - Мобильная версия: вертикальное расположение информации
 * 
 * Отличия от SalaryRangeCard:
 * - Горизонтальное расположение информации (вместо вертикального)
 * - Компактное отображение (все в одной строке)
 * - Адаптивная верстка для мобильных устройств
 */
'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ClockIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangeListItem.module.css'

/**
 * SalaryRange - интерфейс данных зарплатной вилки
 * 
 * Структура:
 * - id: уникальный идентификатор вилки
 * - vacancyId: ID вакансии в Huntflow
 * - vacancyName: название вакансии
 * - grade: грейд (Junior, Middle, Senior и т.д.)
 * - salaryUsd, salaryByn, salaryPln, salaryEur: зарплатные вилки в разных валютах (min, max)
 * - isActive: флаг активности вилки
 * - updatedAt: дата последнего обновления
 */
interface SalaryRange {
  id: number
  vacancyId: number
  vacancyName: string
  grade: string
  salaryUsd: { min: number; max: number }
  salaryByn: { min: number; max: number }
  salaryPln: { min: number; max: number }
  salaryEur: { min: number; max: number }
  isActive: boolean
  updatedAt: string
}

/**
 * SalaryRangeListItemProps - интерфейс пропсов компонента SalaryRangeListItem
 * 
 * Структура:
 * - salaryRange: данные зарплатной вилки для отображения
 * - onClick: обработчик клика на элемент списка (переход к детальному просмотру)
 * - onToggleActive: обработчик переключения активности вилки
 */
interface SalaryRangeListItemProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}

/**
 * SalaryRangeListItem - компонент элемента списка зарплатной вилки
 * 
 * Функциональность:
 * - Отображает информацию о зарплатной вилке в виде элемента списка
 * - Адаптивная верстка для десктопа и мобильных
 * - Форматирует числа и даты для отображения
 */
export default function SalaryRangeListItem({ salaryRange, onClick, onToggleActive }: SalaryRangeListItemProps) {
  /**
   * formatNumber - форматирование числа для отображения
   * 
   * Функциональность:
   * - Форматирует число с разделителями тысяч (пробелы)
   * 
   * Используется для:
   * - Отображения зарплатных вилок в читаемом формате
   * 
   * @param num - число для форматирования
   * @returns отформатированная строка (например, "1 000 000")
   */
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует ISO строку даты в формат DD.MM.YYYY
   * 
   * Используется для:
   * - Отображения даты последнего обновления вилки
   * 
   * @param dateString - дата в формате ISO строки
   * @returns отформатированная дата в формате DD.MM.YYYY
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  /**
   * Рендер компонента SalaryRangeListItem
   * 
   * Структура:
   * - Десктопная версия: горизонтальное расположение информации
   * - Мобильная версия: вертикальное расположение информации
   * 
   * Адаптивность:
   * - CSS классы desktopLayout и mobileLayout управляют видимостью версий
   */
  return (
    <Box className={styles.salaryRangeListItem} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Десктопная версия
          - Горизонтальное расположение: информация слева, кнопка справа
          - Первая строка: название, статус, грейд, дата
          - Вторая строка: зарплатные вилки в разных валютах */}
      <Flex justify="between" align="center" gap="4" className={styles.desktopLayout}>
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          {/* Первая строка: название вакансии, статус, грейд, дата */}
          <Flex align="center" gap="3">
            {/* Название вакансии */}
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {salaryRange.vacancyName}
            </Text>
            {/* Тег статуса вилки
                - Цветовая индикация (зеленый для активных, серый для неактивных) */}
            <Box 
              className={`${styles.statusTag} ${salaryRange.isActive ? styles.statusActive : styles.statusInactive}`}
            >
              <Text size="1" weight="bold">
                {salaryRange.isActive ? 'Активна' : 'Неактивна'}
              </Text>
            </Box>
            {/* Грейд */}
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              {salaryRange.grade}
            </Text>
            {/* Дата последнего обновления */}
            <Flex align="center" gap="1">
              <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
              <Text size="2" style={{ color: 'var(--gray-10)' }}>
                {formatDate(salaryRange.updatedAt)}
              </Text>
            </Flex>
          </Flex>

          {/* Вторая строка: зарплатные вилки в разных валютах */}
          <Flex align="center" gap="4" wrap="wrap">
            {/* USD */}
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                $ USD:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
              </Text>
            </Flex>

            {/* BYN */}
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                ₽ BYN:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
              </Text>
            </Flex>

            {/* PLN */}
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                zł PLN:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
              </Text>
            </Flex>

            {/* EUR */}
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                € EUR:
              </Text>
              <Text size="2">
                {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Кнопка активации/деактивации вилки
            - stopPropagation предотвращает всплытие события к элементу списка */}
        <Flex align="center" gap="1" className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
          {onToggleActive && (
            <Button 
              variant="ghost" 
              size="1" 
              className={styles.actionButton}
              title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleActive(salaryRange.id) // Переключаем активность вилки
              }}
              type="button"
            >
              {/* Визуальная индикация статуса: две вертикальные линии для активной, круг для неактивной */}
              {salaryRange.isActive ? (
                <Box style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
                  <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                  <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                </Box>
              ) : (
                <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
              )}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Мобильная версия
          - Вертикальное расположение информации
          - Адаптируется для маленьких экранов */}
      <Flex direction="column" gap="2" className={styles.mobileLayout}>
        {/* Первая строка - название вакансии */}
        <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
          {salaryRange.vacancyName}
        </Text>

        {/* Вторая строка - статус и грейд */}
        <Flex align="center" gap="2">
          <Box 
            className={`${styles.statusTag} ${salaryRange.isActive ? styles.statusActive : styles.statusInactive}`}
          >
            <Text size="1" weight="bold">
              {salaryRange.isActive ? 'Активна' : 'Неактивна'}
            </Text>
          </Box>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            {salaryRange.grade}
          </Text>
        </Flex>

        {/* Третья строка - зарплаты */}
        <Flex align="center" gap="4" wrap="wrap">
          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              $ USD:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              ₽ BYN:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              zł PLN:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              € EUR:
            </Text>
            <Text size="2">
              {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
            </Text>
          </Flex>
        </Flex>

        {/* Четвертая строка - дата слева, кнопки справа */}
        <Flex justify="between" align="center" gap="2" className={styles.mobileActionsRow} onClick={(e) => e.stopPropagation()}>
          {/* Дата слева */}
          <Flex align="center" gap="1">
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
            <Text size="2" style={{ color: 'var(--gray-10)' }}>
              {formatDate(salaryRange.updatedAt)}
            </Text>
          </Flex>

          {/* Кнопки справа */}
          <Flex align="center" gap="1">
            {onToggleActive && (
              <Button 
                variant="ghost" 
                size="1" 
                className={styles.actionButton}
                title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleActive(salaryRange.id)
                }}
                type="button"
              >
                {salaryRange.isActive ? (
                  <Box style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                    <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                  </Box>
                ) : (
                  <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                )}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
