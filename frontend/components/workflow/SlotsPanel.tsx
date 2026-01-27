/**
 * SlotsPanel (components/workflow/SlotsPanel.tsx) - Панель свободных слотов для интервью
 * 
 * Назначение:
 * - Отображение свободных слотов для интервью по неделям
 * - Управление расписанием интервьюеров
 * - Планирование интервью на свободные слоты
 * 
 * Функциональность:
 * - Текущая неделя: отображение свободных слотов на текущей неделе
 * - Следующая неделя: отображение свободных слотов на следующей неделе
 * - Раскрытие/сворачивание секций недель
 * - Карточки слотов: дата, день недели, список временных слотов, количество слотов
 * 
 * Связи:
 * - workflow/page.tsx: открывается при клике на кнопку "слоты" в WorkflowHeader
 * - WorkflowHeader: управляет открытием/закрытием панели
 * - Google Calendar: слоты синхронизируются с календарем интервьюеров
 * 
 * Поведение:
 * - При открытии показывает текущую и следующую неделю (раскрыты по умолчанию)
 * - При клике на заголовок недели раскрывает/сворачивает секцию
 * - Отображает карточки слотов с датой, днем недели и временными интервалами
 * - Если слотов нет - показывает "Нет свободных слотов"
 * 
 * TODO: Загружать данные слотов из API (синхронизация с Google Calendar)
 */
'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { CalendarIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './SlotsPanel.module.css'

/**
 * WeekSlot - интерфейс слота на день
 * 
 * Структура:
 * - date: дата слота (DD.MM.YYYY)
 * - dayOfWeek: день недели (сокращенный, например "Пн", "Вт")
 * - slots: массив временных интервалов (например, ['12.00-12.45', '15.45-18.00'])
 * - count: количество свободных слотов
 */
interface WeekSlot {
  date: string
  dayOfWeek: string
  slots: string[]
  count: number
}

/**
 * WeekSection - интерфейс секции недели
 * 
 * Структура:
 * - title: название секции (например, "Текущая неделя")
 * - slots: массив слотов на неделю
 */
interface WeekSection {
  title: string
  slots: WeekSlot[]
}

/**
 * SlotsPanel - компонент панели свободных слотов
 * 
 * Состояние:
 * - currentWeekExpanded: флаг раскрытости секции "Текущая неделя"
 * - nextWeekExpanded: флаг раскрытости секции "Следующая неделя"
 * 
 * Функциональность:
 * - Отображает свободные слоты по неделям
 * - Управляет раскрытием/сворачиванием секций
 */
export default function SlotsPanel() {
  // Флаг раскрытости секции "Текущая неделя" (по умолчанию раскрыта)
  const [currentWeekExpanded, setCurrentWeekExpanded] = useState(true)
  // Флаг раскрытости секции "Следующая неделя" (по умолчанию раскрыта)
  const [nextWeekExpanded, setNextWeekExpanded] = useState(true)

  /**
   * currentWeek - данные текущей недели
   * 
   * Используется для:
   * - Отображения свободных слотов на текущей неделе
   * 
   * TODO: Загружать из API (синхронизация с Google Calendar)
   */
  const currentWeek: WeekSection = {
    title: 'Текущая неделя',
    slots: [
      {
        date: '08.01.2026',
        dayOfWeek: 'Чт',
        slots: [],
        count: 0,
      },
      {
        date: '09.01.2026',
        dayOfWeek: 'Пт',
        slots: [],
        count: 0,
      },
    ],
  }

  /**
   * nextWeek - данные следующей недели
   * 
   * Используется для:
   * - Отображения свободных слотов на следующей неделе
   * 
   * TODO: Загружать из API (синхронизация с Google Calendar)
   */
  const nextWeek: WeekSection = {
    title: 'Следующая неделя',
    slots: [
      {
        date: '12.01.2026',
        dayOfWeek: 'Пн',
        slots: ['12.00-12.45', '15.45-18.00'],
        count: 2,
      },
      {
        date: '13.01.2026',
        dayOfWeek: 'Вт',
        slots: ['11.00-18.00'],
        count: 1,
      },
      {
        date: '14.01.2026',
        dayOfWeek: 'Ср',
        slots: ['12.15-13.45', '15.45-18.00'],
        count: 2,
      },
      {
        date: '15.01.2026',
        dayOfWeek: 'Чт',
        slots: ['11.05-18.00'],
        count: 1,
      },
      {
        date: '16.01.2026',
        dayOfWeek: 'Пт',
        slots: ['11.15-14.45', '15.45-18.00'],
        count: 2,
      },
    ],
  }

  /**
   * renderWeekSection - рендеринг секции недели
   * 
   * Функциональность:
   * - Отображает заголовок секции с иконкой календаря
   * - Показывает/скрывает карточки слотов в зависимости от expanded
   * - Рендерит карточки слотов с датой, днем недели и временными интервалами
   * 
   * @param section - данные секции недели
   * @param expanded - флаг раскрытости секции
   * @param onToggle - обработчик переключения раскрытости
   * @returns JSX элемент секции недели
   */
  const renderWeekSection = (section: WeekSection, expanded: boolean, onToggle: () => void) => (
    <Box className={styles.weekSection}>
      {/* Заголовок секции недели
          - Кликабельный для раскрытия/сворачивания
          - Иконка календаря, название, иконка chevron */}
      <Flex
        align="center"
        gap="2"
        className={styles.weekHeader}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <CalendarIcon width={16} height={16} />
        <Text size="3" weight="bold">
          {section.title}
        </Text>
        {/* Иконка chevron для индикации раскрытости
            - Поворачивается в зависимости от expanded */}
        <Box style={{ marginLeft: 'auto' }}>
          <ChevronUpIcon
            width={16}
            height={16}
            style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)', // Поворот в зависимости от expanded
              transition: 'transform 0.2s ease-in-out', // Плавный поворот
            }}
          />
        </Box>
      </Flex>

      {/* Карточки слотов
          - Показываются только если секция раскрыта (expanded === true)
          - Сетка карточек с адаптивным расположением */}
      {expanded && (
        <Flex gap="3" wrap="wrap" className={styles.slotsGrid}>
          {section.slots.map((slot, index) => (
            <Box key={index} className={styles.slotCard}>
              {/* Заголовок карточки слота
                  - День недели и дата слева
                  - Бейдж с количеством слотов справа */}
              <Flex align="center" justify="between" className={styles.slotCardHeader}>
                <Flex align="center" gap="2">
                  {/* День недели (заглавными буквами) */}
                  <Text size="3" weight="bold" style={{ textTransform: 'uppercase', color: '#ffffff' }}>
                    {slot.dayOfWeek}
                  </Text>
                  {/* Дата */}
                  <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
                    {slot.date}
                  </Text>
                </Flex>
                {/* Бейдж с количеством слотов
                    - Цвет зависит от наличия слотов (если есть - акцентный, если нет - серый) */}
                <Box
                  className={styles.badge}
                  style={{
                    backgroundColor: slot.count > 0 ? 'var(--gray-2)' : 'var(--gray-5)',
                    color: slot.count > 0 ? 'var(--accent-9)' : 'var(--gray-11)',
                  }}
                >
                  <Text size="1" weight="bold">
                    {slot.count}
                  </Text>
                </Box>
              </Flex>
              
              {/* Содержимое карточки: временные интервалы или сообщение об отсутствии слотов */}
              <Box style={{ padding: '12px 16px' }}>
                {slot.count > 0 ? (
                  // Если есть слоты - показываем временные интервалы через запятую
                  <Text size="2" color="gray">
                    {slot.slots.join(', ')}
                  </Text>
                ) : (
                  // Если слотов нет - показываем сообщение
                  <Text size="2" color="gray">
                    Нет свободных слотов
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )

  return (
    <Box className={styles.slotsPanel}>
      {renderWeekSection(currentWeek, currentWeekExpanded, () => setCurrentWeekExpanded(!currentWeekExpanded))}
      {renderWeekSection(nextWeek, nextWeekExpanded, () => setNextWeekExpanded(!nextWeekExpanded))}
    </Box>
  )
}
