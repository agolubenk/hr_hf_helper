/**
 * RequestCard (components/requests/RequestCard.tsx) - Компонент карточки заявки на найм (режим "Карточки")
 * 
 * Назначение:
 * - Отображение информации о заявке на найм в виде карточки
 * - Используется в режиме отображения "Карточки" на странице заявок
 * 
 * Функциональность:
 * - Заголовок и ID заявки
 * - Статус заявки (планируется, в процессе, отменена, закрыта) с цветовой индикацией
 * - Приоритет заявки (высокий, средний, низкий) с цветовой индикацией
 * - Информация об отделе
 * - Информация о рекрутере
 * - Список технологий
 * - Количество кандидатов
 * - Дата заявки
 * - Предупреждения (если есть)
 * - Кнопки действий: просмотр и редактирование
 * 
 * Связи:
 * - hiring-requests/page.tsx: используется в режиме отображения "Карточки"
 * - hiring-requests/[id]/page.tsx: переход к детальному просмотру при клике
 * - hiring-requests/[id]/edit/page.tsx: переход к редактированию при клике на кнопку редактирования
 * 
 * Поведение:
 * - При клике на карточку (если передан onClick) - переход к детальному просмотру
 * - При клике на кнопку просмотра - переход к детальному просмотру
 * - При клике на кнопку редактирования - переход к редактированию
 * 
 * Дизайн:
 * - Карточка с информацией о заявке
 * - Цветовая индикация статуса и приоритета
 * - Иконки для визуального различия информации
 */
'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon } from "@radix-ui/react-icons"
import styles from './RequestCard.module.css'

/**
 * Request - интерфейс данных заявки на найм
 * 
 * Структура:
 * - id: уникальный идентификатор заявки
 * - title: название заявки
 * - status: статус заявки ('planned', 'in_process', 'cancelled', 'closed')
 * - department: отдел
 * - recruiter: имя рекрутера
 * - priority: приоритет заявки ('high', 'medium', 'low')
 * - technologies: массив технологий
 * - candidates: количество кандидатов
 * - date: дата заявки (опционально)
 * - hasWarning: флаг наличия предупреждения
 * - warningText: текст предупреждения (опционально)
 * - Дополнительные поля для таблицы (опционально): grade, project, recruiterDays, statusDate, startDate, endDate, isOverdue, factDays, slaDays, slaStatus, t2hDays, t2hSlaDays, candidate
 */
interface Request {
  id: number
  title: string
  status: 'planned' | 'in_process' | 'cancelled' | 'closed'
  department: string
  recruiter: string
  priority: 'high' | 'medium' | 'low'
  technologies: string[]
  candidates: number
  date: string | null
  hasWarning: boolean
  warningText?: string
  // Дополнительные поля для таблицы
  grade?: string
  project?: string | null
  recruiterDays?: number
  statusDate?: string
  startDate?: string
  endDate?: string
  isOverdue?: boolean
  factDays?: number
  slaDays?: number
  slaStatus?: 'normal' | 'risk' | 'overdue' | 'on_time'
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: {
    name: string
    id: string
  }
}

/**
 * RequestCardProps - интерфейс пропсов компонента RequestCard
 * 
 * Структура:
 * - request: данные заявки для отображения
 * - onClick: обработчик клика на карточку (переход к детальному просмотру)
 */
interface RequestCardProps {
  request: Request
  onClick?: () => void
}

/**
 * RequestCard - компонент карточки заявки на найм
 * 
 * Функциональность:
 * - Отображает информацию о заявке в виде карточки
 * - Форматирует статус и приоритет для отображения
 */
export default function RequestCard({ request, onClick }: RequestCardProps) {
  /**
   * getStatusLabel - получение текстового представления статуса
   * 
   * Функциональность:
   * - Преобразует код статуса в читаемый текст
   * 
   * @param status - код статуса
   * @returns текстовое представление статуса
   */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Планируется'
      case 'in_process': return 'В процессе'
      case 'cancelled': return 'Отменена'
      case 'closed': return 'Закрыта'
      default: return status
    }
  }

  /**
   * getPriorityLabel - получение текстового представления приоритета
   * 
   * Функциональность:
   * - Преобразует код приоритета в читаемый текст
   * 
   * @param priority - код приоритета
   * @returns текстовое представление приоритета
   */
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  /**
   * Рендер компонента RequestCard
   * 
   * Структура:
   * - Заголовок и статус: название, ID, отдел, рекрутер, статус, приоритет, кнопки действий
   * - Технологии: список технологий в виде тегов
   * - Кандидаты: количество кандидатов
   * - Дата: дата заявки (если есть)
   * - Предупреждение: предупреждение (если есть)
   */
  return (
    <Box className={styles.requestCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок и статус
          - Левая часть: название, ID, отдел, рекрутер
          - Правая часть: статус, приоритет, кнопки действий */}
      <Flex justify="between" align="start" mb="2">
        <Box>
          {/* Название заявки */}
          <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
            {request.title}
            <br></br>
            {/* ID заявки */}
            <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
              # {request.id}
            </Text>
            <br></br>
          </Text>
          {/* Отдел */}
          <Text size="2" style={{ color: 'var(--gray-11)' }} mb="1">
            {request.department}
          </Text>
          {/* Рекрутер
              - Иконка человека и имя рекрутера */}
          <Flex align="center" gap="2" mb="2">
            <PersonIcon width={16} height={16} />
            <Text size="2">{request.recruiter}</Text>
          </Flex>
        </Box>
        {/* Правая часть: статус, приоритет, кнопки действий */}
        <Flex direction="column" align="end" gap="1">
          {/* Тег статуса заявки
              - Цветовая индикация в зависимости от статуса */}
          <Box 
            className={`${styles.statusTag} ${
              request.status === 'planned' ? styles.statusPlanned :
              request.status === 'in_process' ? styles.statusInProcess :
              request.status === 'cancelled' ? styles.statusCancelled :
              request.status === 'closed' ? styles.statusClosed :
              styles.statusPending
            }`}
          >
            <Text size="1" weight="bold">
              {getStatusLabel(request.status)}
            </Text>
          </Box>
          {/* Тег приоритета заявки
              - Цветовая индикация в зависимости от приоритета */}
          <Box 
            className={`${styles.priorityTag} ${
              request.priority === 'high' ? styles.priorityHigh :
              request.priority === 'medium' ? styles.priorityMedium :
              styles.priorityLow
            }`}
          >
            <Text size="1" weight="bold">
              {getPriorityLabel(request.priority)}
            </Text>
          </Box>
          {/* Кнопки действий: просмотр и редактирование */}
          <Flex className={styles.actionButtons}>
            <Button variant="ghost" size="1" className={styles.actionButton}>
              <EyeOpenIcon width={16} height={16} />
            </Button>
            <Button variant="ghost" size="1" className={styles.actionButton}>
              <Pencil1Icon width={16} height={16} />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Технологии заявки
          - Показывается только если есть технологии
          - Отображается в виде тегов */}
      {request.technologies.length > 0 && (
        <Flex direction="column" gap="1" mb="2">
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            {'</>'} Технологии:
          </Text>
          <Flex gap="1" wrap="wrap">
            {request.technologies.map((tech, index) => (
              <Box key={index} className={styles.techTag}>
                <Text size="1">{tech}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      )}

      {/* Количество кандидатов
          - Иконка людей и количество */}
      <Flex align="center" gap="2" mb="2">
        <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👥
        </Box>
        <Text size="2">{request.candidates} кандидатов</Text>
      </Flex>

      {/* Дата заявки
          - Показывается только если есть дата */}
      {request.date && (
        <Text size="2" style={{ color: 'var(--gray-11)' }} mb="2">
          Дата: {request.date}
        </Text>
      )}

      {/* Предупреждение
          - Показывается только если hasWarning === true
          - Оранжевая иконка и текст */}
      {request.hasWarning && (
        <Flex align="center" gap="2" mb="3">
          <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
          <Text size="2" style={{ color: '#f59e0b' }}>
            {request.warningText}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
