/**
 * VacancyCard (components/vacancies/VacancyCard.tsx) - Компонент карточки вакансии (режим "Карточки")
 * 
 * Назначение:
 * - Отображение информации о вакансии в виде карточки
 * - Используется в режиме отображения "Карточки" на странице вакансий
 * 
 * Функциональность:
 * - Заголовок и ID вакансии
 * - Статус вакансии (активна/неактивна) с возможностью изменения
 * - Информация о рекрутере
 * - Список локаций вакансии
 * - Количество интервьюеров
 * - Предупреждения (если есть)
 * - Кнопки действий: редактирование и просмотр
 * 
 * Связи:
 * - vacancies/page.tsx: используется в режиме отображения "Карточки"
 * - vacancies/[id]/page.tsx: переход к детальному просмотру при клике
 * - vacancies/[id]/edit/page.tsx: переход к редактированию при клике на кнопку редактирования
 * 
 * Поведение:
 * - При клике на карточку (если передан onClick) - переход к детальному просмотру
 * - При клике на статус (если передан onStatusClick) - изменение статуса вакансии
 * - При клике на кнопку редактирования - переход к редактированию
 * - При клике на кнопку просмотра - переход к детальному просмотру
 * - stopPropagation предотвращает всплытие событий от кнопок к карточке
 * 
 * Дизайн:
 * - Карточка с информацией о вакансии
 * - Цветовая индикация статуса (зеленый для активных, серый для неактивных)
 * - Иконки для визуального различия информации
 */
'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon, SewingPinFilledIcon } from "@radix-ui/react-icons"
import styles from './VacancyCard.module.css'

/**
 * Vacancy - интерфейс данных вакансии
 * 
 * Структура:
 * - id: уникальный идентификатор вакансии
 * - title: название вакансии
 * - status: статус вакансии ('active' или 'inactive')
 * - recruiter: имя рекрутера
 * - locations: массив локаций вакансии
 * - interviewers: количество интервьюеров
 * - date: дата создания/обновления (опционально)
 * - hasWarning: флаг наличия предупреждения
 * - warningText: текст предупреждения (опционально)
 */
interface Vacancy {
  id: number
  title: string
  status: 'active' | 'inactive'
  recruiter: string
  locations: string[]
  interviewers: number
  date: string | null
  hasWarning: boolean
  warningText?: string
}

/**
 * VacancyCardProps - интерфейс пропсов компонента VacancyCard
 * 
 * Структура:
 * - vacancy: данные вакансии для отображения
 * - onClick: обработчик клика на карточку (переход к детальному просмотру)
 * - onEditClick: обработчик клика на кнопку редактирования
 * - onStatusClick: обработчик клика на статус (изменение статуса)
 */
interface VacancyCardProps {
  vacancy: Vacancy
  onClick?: () => void
  onEditClick?: () => void
  onStatusClick?: () => void
}

/**
 * VacancyCard - компонент карточки вакансии
 * 
 * Функциональность:
 * - Отображает информацию о вакансии в виде карточки
 * - Поддерживает клики для навигации и редактирования
 */
export default function VacancyCard({ vacancy, onClick, onEditClick, onStatusClick }: VacancyCardProps) {
  return (
    <Box className={styles.vacancyCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Заголовок и статус
          - Левая часть: название, ID, рекрутер
          - Правая часть: статус и кнопки действий */}
      <Flex justify="between" align="start" mb="2">
        <Box>
        {/* Название вакансии */}
        <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
          {vacancy.title}
          <br></br>
        {/* ID вакансии */}
        <Text size="2" weight="bold" style={{ color: 'var(--gray-11)' }}>
          # {vacancy.id}
        </Text>
        <br></br>
        </Text>
        {/* Рекрутер
            - Иконка человека и имя рекрутера */}
        <Flex align="center" gap="2" mb="2">
          <PersonIcon width={16} height={16} />
          <Text size="2">{vacancy.recruiter}</Text>
        </Flex>
        </Box>
        {/* Правая часть: статус и кнопки действий */}
        <Flex direction="column" align="end" gap="1">
          {/* Тег статуса вакансии
              - Кликабельный (если передан onStatusClick)
              - Цветовая индикация (зеленый для активных, серый для неактивных) */}
          <Box 
            className={`${styles.statusTag} ${vacancy.status === 'active' ? styles.statusActive : styles.statusInactive}`}
            onClick={(e) => { e.stopPropagation(); onStatusClick?.() }} // Предотвращаем всплытие события
            style={{ cursor: onStatusClick ? 'pointer' : undefined }}
            title={onStatusClick ? 'Нажмите, чтобы изменить статус' : undefined}
          >
            <Text size="1" weight="bold">
              {vacancy.status === 'active' ? 'Активна' : 'Неактивна'}
            </Text>
          </Box>
          {/* Кнопки действий: редактирование и просмотр */}
          <Flex className={styles.actionButtons}>
            <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onEditClick?.() }} title="Редактировать">
              <Pencil1Icon width={16} height={16} />
            </Button>
            <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onClick?.() }} title="Просмотр">
              <EyeOpenIcon width={16} height={16} />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Локации вакансии
          - Показывается только если есть локации
          - Отображается в виде тегов */}
      {vacancy.locations.length > 0 && (
        <Flex direction="column" gap="1" mb="2">
          <Flex align="center" gap="1">
            <SewingPinFilledIcon width={14} height={14} />
            <Text size="2" style={{ color: 'var(--gray-11)' }}>Локации:</Text>
          </Flex>
          <Flex gap="1" wrap="wrap">
            {vacancy.locations.map((loc, index) => (
              <Box key={index} className={styles.techTag}>
                <Text size="1">{loc}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      )}

      {/* Количество интервьюеров
          - Иконка людей и количество */}
      <Flex align="center" gap="2" mb="2">
        <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👥
        </Box>
        <Text size="2">{vacancy.interviewers} интервьюеров</Text>
      </Flex>


      {/* Предупреждение
          - Показывается только если hasWarning === true
          - Оранжевая иконка и текст */}
      {vacancy.hasWarning && (
        <Flex align="center" gap="2" mb="3">
          <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
          <Text size="2" style={{ color: '#f59e0b' }}>
            {vacancy.warningText}
          </Text>
        </Flex>
      )}

    </Box>
  )
}
