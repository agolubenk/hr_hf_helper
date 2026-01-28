/**
 * InvitesStats (components/invites/InvitesStats.tsx) - Компонент статистики по инвайтам
 * 
 * Назначение:
 * - Отображение статистики по инвайтам на интервью
 * - Визуализация количества инвайтов по статусам
 * 
 * Функциональность:
 * - Всего инвайтов: общее количество всех инвайтов
 * - Ожидают: количество инвайтов со статусом "pending" (ожидают отправки)
 * - Отправлены: количество инвайтов со статусом "sent" (отправлены кандидату)
 * - Завершены: количество инвайтов со статусом "completed" (интервью завершено)
 * 
 * Связи:
 * - invites/page.tsx: отображается на странице управления инвайтами
 * - Использует данные из API или моковых данных
 * 
 * Поведение:
 * - Отображает 4 карточки со статистикой
 * - Каждая карточка имеет цветовую индикацию (границы сверху и снизу)
 * - Иконки для визуального различия статусов
 * 
 * Дизайн:
 * - Карточки с цветными границами для визуального различия
 * - Иконки для каждого типа статистики
 * - Крупный шрифт для чисел
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { CalendarIcon, ClockIcon, PaperPlaneIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import styles from './InvitesStats.module.css'

/**
 * InvitesStatsProps - интерфейс пропсов компонента InvitesStats
 * 
 * Структура:
 * - total: общее количество инвайтов
 * - pending: количество инвайтов со статусом "pending" (ожидают)
 * - sent: количество инвайтов со статусом "sent" (отправлены)
 * - completed: количество инвайтов со статусом "completed" (завершены)
 */
interface InvitesStatsProps {
  total: number
  pending: number
  sent: number
  completed: number
}

/**
 * InvitesStats - компонент статистики по инвайтам
 * 
 * Функциональность:
 * - Отображает 4 карточки со статистикой по инвайтам
 * - Каждая карточка имеет уникальную цветовую схему
 * - Иконки для визуального различия статусов
 */
export default function InvitesStats({ total, pending, sent, completed }: InvitesStatsProps) {
  return (
    <Flex gap="3" className={styles.statsContainer}>
      {/* Карточка "Всего инвайтов"
          - Отображает общее количество всех инвайтов
          - Цветовая схема: синий сверху, зеленый снизу
          - Иконка: CalendarIcon */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #3b82f6', // Синяя граница сверху
        borderBottom: '2px solid #10b981', // Зеленая граница снизу
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ВСЕГО ИНВАЙТОВ
            </Text>
            <CalendarIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {total}
          </Text>
        </Flex>
      </Box>

      {/* Карточка "Ожидают"
          - Отображает количество инвайтов со статусом "pending"
          - Цветовая схема: оранжевый (сверху и снизу)
          - Иконка: ClockIcon */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #f97316', // Оранжевая граница сверху
        borderBottom: '2px solid #ea580c', // Темно-оранжевая граница снизу
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ОЖИДАЮТ
            </Text>
            <ClockIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {pending}
          </Text>
        </Flex>
      </Box>

      {/* Карточка "Отправлены"
          - Отображает количество инвайтов со статусом "sent"
          - Цветовая схема: синий (сверху и снизу)
          - Иконка: PaperPlaneIcon */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #3b82f6', // Синяя граница сверху
        borderBottom: '2px solid #2563eb', // Темно-синяя граница снизу
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ОТПРАВЛЕНЫ
            </Text>
            <PaperPlaneIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {sent}
          </Text>
        </Flex>
      </Box>

      {/* Карточка "Завершены"
          - Отображает количество инвайтов со статусом "completed"
          - Цветовая схема: зеленый (сверху и снизу)
          - Иконка: CheckCircledIcon */}
      <Box className={styles.statCard} style={{ 
        borderTop: '2px solid #10b981', // Зеленая граница сверху
        borderBottom: '2px solid #059669', // Темно-зеленая граница снизу
      }}>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" style={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ЗАВЕРШЕНЫ
            </Text>
            <CheckCircledIcon width={20} height={20} style={{ color: '#1e293b' }} />
          </Flex>
          <Text size="6" weight="bold" style={{ color: '#1e293b' }}>
            {completed}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}
