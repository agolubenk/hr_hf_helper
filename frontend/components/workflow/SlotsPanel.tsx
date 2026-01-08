'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { CalendarIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './SlotsPanel.module.css'

interface WeekSlot {
  date: string
  dayOfWeek: string
  slots: string[]
  count: number
}

interface WeekSection {
  title: string
  slots: WeekSlot[]
}

export default function SlotsPanel() {
  const [currentWeekExpanded, setCurrentWeekExpanded] = useState(true)
  const [nextWeekExpanded, setNextWeekExpanded] = useState(true)

  // Моковые данные для демонстрации
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

  const renderWeekSection = (section: WeekSection, expanded: boolean, onToggle: () => void) => (
    <Box className={styles.weekSection}>
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
        <Box style={{ marginLeft: 'auto' }}>
          <ChevronUpIcon
            width={16}
            height={16}
            style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Box>
      </Flex>

      {expanded && (
        <Flex gap="3" wrap="wrap" className={styles.slotsGrid}>
          {section.slots.map((slot, index) => (
            <Box key={index} className={styles.slotCard}>
              <Flex align="center" justify="between" className={styles.slotCardHeader}>
                <Flex align="center" gap="2">
                  <Text size="3" weight="bold" style={{ textTransform: 'uppercase', color: '#ffffff' }}>
                    {slot.dayOfWeek}
                  </Text>
                  <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
                    {slot.date}
                  </Text>
                </Flex>
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
              
              <Box style={{ padding: '12px 16px' }}>
                {slot.count > 0 ? (
                  <Text size="2" color="gray">
                    {slot.slots.join(', ')}
                  </Text>
                ) : (
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
