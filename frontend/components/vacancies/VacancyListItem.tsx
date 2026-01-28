/**
 * VacancyListItem (components/vacancies/VacancyListItem.tsx) - Компонент элемента списка вакансии (режим "Список")
 * 
 * Назначение:
 * - Отображение информации о вакансии в виде элемента списка
 * - Используется в режиме отображения "Список" на странице вакансий
 * 
 * Функциональность:
 * - Заголовок, ID и статус вакансии в одной строке
 * - Информация о рекрутере, локациях, интервьюерах и предупреждениях
 * - Кнопки действий: редактирование и просмотр
 * - Компактное горизонтальное отображение
 * 
 * Связи:
 * - vacancies/page.tsx: используется в режиме отображения "Список"
 * - vacancies/[id]/page.tsx: переход к детальному просмотру при клике
 * - vacancies/[id]/edit/page.tsx: переход к редактированию при клике на кнопку редактирования
 * 
 * Поведение:
 * - При клике на элемент списка (если передан onClick) - переход к детальному просмотру
 * - При клике на статус (если передан onStatusClick) - изменение статуса вакансии
 * - При клике на кнопку редактирования - переход к редактированию
 * - При клике на кнопку просмотра - переход к детальному просмотру
 * - stopPropagation предотвращает всплытие событий от кнопок к элементу списка
 * 
 * Отличия от VacancyCard:
 * - Горизонтальное расположение информации (вместо вертикального)
 * - Компактное отображение (все в одной строке)
 * - Информация о рекрутере, локациях и интервьюерах в одной строке
 */
'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { PersonIcon, ExclamationTriangleIcon, EyeOpenIcon, Pencil1Icon, SewingPinFilledIcon } from "@radix-ui/react-icons"
import styles from './VacancyListItem.module.css'

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
 * VacancyListItemProps - интерфейс пропсов компонента VacancyListItem
 * 
 * Структура:
 * - vacancy: данные вакансии для отображения
 * - onClick: обработчик клика на элемент списка (переход к детальному просмотру)
 * - onEditClick: обработчик клика на кнопку редактирования
 * - onStatusClick: обработчик клика на статус (изменение статуса)
 */
interface VacancyListItemProps {
  vacancy: Vacancy
  onClick?: () => void
  onEditClick?: () => void
  onStatusClick?: () => void
}

/**
 * VacancyListItem - компонент элемента списка вакансии
 * 
 * Функциональность:
 * - Отображает информацию о вакансии в виде элемента списка
 * - Компактное горизонтальное расположение информации
 * - Поддерживает клики для навигации и редактирования
 */
export default function VacancyListItem({ vacancy, onClick, onEditClick, onStatusClick }: VacancyListItemProps) {
  return (
    <Box className={styles.vacancyListItem} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Flex justify="between" align="center" gap="4">
        {/* Левая часть - информация о вакансии
            - Заголовок, статус и ID в первой строке
            - Рекрутер, локации, интервьюеры и предупреждения во второй строке */}
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          {/* Первая строка: название, статус, ID */}
          <Flex align="center" gap="3">
            {/* Название вакансии */}
            <Text size="4" weight="bold" style={{ color: 'var(--accent-11)' }}>
              {vacancy.title}
            </Text>
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
            {/* ID вакансии */}
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              # {vacancy.id}
            </Text>
          </Flex>

          {/* Вторая строка: рекрутер, локации, интервьюеры, предупреждения */}
          <Flex align="center" gap="4" wrap="wrap">
            {/* Рекрутер
                - Иконка человека и имя рекрутера */}
            <Flex align="center" gap="2">
              <PersonIcon width={16} height={16} />
              <Text size="2">• {vacancy.recruiter}</Text>
            </Flex>

            {/* Локации
                - Показывается только если есть локации
                - Отображается в виде тегов */}
            {vacancy.locations.length > 0 && (
              <Flex align="center" gap="2">
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
            <Flex align="center" gap="2">
              <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👥
              </Box>
              <Text size="2">{vacancy.interviewers} интервьюеров</Text>
            </Flex>

            {/* Предупреждение
                - Показывается только если hasWarning === true
                - Оранжевая иконка и текст */}
            {vacancy.hasWarning && (
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
                <Text size="2" style={{ color: '#f59e0b' }}>
                  {vacancy.warningText}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Правая часть - кнопки действий
            - Редактирование и просмотр */}
        <Flex gap="2" className={styles.actionButtons}>
          <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onEditClick?.() }} title="Редактировать">
            <Pencil1Icon width={16} height={16} />
          </Button>
          <Button variant="ghost" size="1" className={styles.actionButton} onClick={(e) => { e.stopPropagation(); onClick?.() }} title="Просмотр">
            <EyeOpenIcon width={16} height={16} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
