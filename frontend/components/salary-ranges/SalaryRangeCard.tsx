/**
 * SalaryRangeCard (components/salary-ranges/SalaryRangeCard.tsx) - Компонент карточки зарплатной вилки (режим "Карточки")
 * 
 * Назначение:
 * - Отображение информации о зарплатной вилке в виде карточки
 * - Используется в режиме отображения "Карточки" на странице зарплатных вилок
 * 
 * Функциональность:
 * - Заголовок карточки: название вакансии и грейд (на цветном фоне)
 * - Детали: зарплатные вилки в разных валютах (USD, BYN, PLN, EUR)
 * - Дата обновления
 * - Кнопка активации/деактивации вилки
 * 
 * Связи:
 * - vacancies/salary-ranges/page.tsx: используется в режиме отображения "Карточки"
 * - vacancies/salary-ranges/page.tsx: переход к детальному просмотру при клике
 * 
 * Поведение:
 * - При клике на карточку (если передан onClick) - переход к детальному просмотру
 * - При клике на кнопку активации/деактивации - изменение статуса вилки
 * - stopPropagation предотвращает всплытие событий от кнопки к карточке
 * 
 * Дизайн:
 * - Карточка с цветным заголовком (teal фон)
 * - Белый фон для деталей
 * - Форматирование чисел через Intl.NumberFormat
 * - Визуальная индикация статуса (активна/неактивна) через иконку кнопки
 */
'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { ClockIcon } from "@radix-ui/react-icons"
import styles from './SalaryRangeCard.module.css'

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
 * SalaryRangeCardProps - интерфейс пропсов компонента SalaryRangeCard
 * 
 * Структура:
 * - salaryRange: данные зарплатной вилки для отображения
 * - onClick: обработчик клика на карточку (переход к детальному просмотру)
 * - onToggleActive: обработчик переключения активности вилки
 */
interface SalaryRangeCardProps {
  salaryRange: SalaryRange
  onClick?: () => void
  onToggleActive?: (id: number) => void
}

/**
 * SalaryRangeCard - компонент карточки зарплатной вилки
 * 
 * Функциональность:
 * - Отображает информацию о зарплатной вилке в виде карточки
 * - Форматирует числа и даты для отображения
 */
export default function SalaryRangeCard({ salaryRange, onClick, onToggleActive }: SalaryRangeCardProps) {
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
   * Рендер компонента SalaryRangeCard
   * 
   * Структура:
   * - Заголовок карточки: название вакансии и грейд (на цветном фоне)
   * - Детали карточки: зарплатные вилки в разных валютах, дата, кнопка активации/деактивации
   */
  return (
    <Box className={styles.salaryRangeCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок карточки (teal фон)
          - Название вакансии и грейд
          - Белый текст на цветном фоне */}
      <Box className={styles.cardHeader}>
        <Flex justify="between" align="center" gap="2">
          <Text size="4" weight="bold" style={{ color: 'white' }}>
            {salaryRange.vacancyName}
          </Text>
          <Text size="2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {salaryRange.grade}
          </Text>
        </Flex>
      </Box>

      {/* Детали карточки (белый фон)
          - Зарплатные вилки в разных валютах
          - Дата обновления и кнопка активации/деактивации */}
      <Box className={styles.cardDetails}>
        <Flex direction="column" gap="2">
          {/* Зарплатная вилка в USD
              - Формат: net (чистая зарплата) */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              $ USD
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryUsd.min)} - {formatNumber(salaryRange.salaryUsd.max)} net
            </Text>
          </Flex>

          {/* Зарплатная вилка в BYN
              - Формат: net (чистая зарплата) */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              ₽ BYN
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryByn.min)} - {formatNumber(salaryRange.salaryByn.max)} net
            </Text>
          </Flex>

          {/* Зарплатная вилка в PLN
              - Формат: gross (грязная зарплата) */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              zł PLN
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryPln.min)} - {formatNumber(salaryRange.salaryPln.max)} gross
            </Text>
          </Flex>

          {/* Зарплатная вилка в EUR
              - Формат: gross (грязная зарплата) */}
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              € EUR
            </Text>
            <Text size="2" weight="medium">
              {formatNumber(salaryRange.salaryEur.min)} - {formatNumber(salaryRange.salaryEur.max)} gross
            </Text>
          </Flex>
        </Flex>

        {/* Дата и кнопки действий
            - Разделительная линия сверху
            - Дата слева, кнопка активации/деактивации справа */}
        <Flex justify="between" align="center" gap="2" mt="3" pt="2" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          {/* Дата последнего обновления
              - Иконка часов и отформатированная дата */}
          <Flex align="center" gap="1">
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-10)' }} />
            <Text size="1" style={{ color: 'var(--gray-10)' }}>
              {formatDate(salaryRange.updatedAt)}
            </Text>
          </Flex>

          {/* Кнопка активации/деактивации вилки
              - stopPropagation предотвращает всплытие события к карточке
              - Визуальная индикация: две вертикальные линии для активной, круг для неактивной */}
          <Flex align="center" gap="1" onClick={(e) => e.stopPropagation()}>
            {onToggleActive && (
              <Button 
                variant="ghost" 
                size="1" 
                title={salaryRange.isActive ? "Деактивировать" : "Активировать"}
                className={styles.actionButton}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleActive(salaryRange.id) // Переключаем активность вилки
                }}
                type="button"
              >
                {/* Визуальная индикация статуса: две вертикальные линии для активной, круг для неактивной */}
                {salaryRange.isActive ? (
                  <Box style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
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
      </Box>
    </Box>
  )
}
