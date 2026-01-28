/**
 * StatusBar (components/StatusBar.tsx) - Статусная панель для страницы recr-chat
 * 
 * Назначение:
 * - Отображение статусов кандидатов по выбранной вакансии
 * - Фильтрация кандидатов по статусам
 * - Выбор вакансии для отображения статусов
 * - Группировка неактивных статусов (без кандидатов)
 * 
 * Функциональность:
 * - Выбор вакансии: выпадающий список с вакансиями (Мои, Все, конкретные вакансии)
 * - Статусы: горизонтальный скролл со статусами кандидатов
 * - Группировка: неактивные статусы группируются в "N этапов без кандидатов"
 * - Раскрытие групп: клик по группе раскрывает все статусы в группе
 * - Статус "Все": показывает всех кандидатов независимо от статуса
 * - Добавление вакансии: кнопка "Добавить вакансию" в выпадающем списке
 * - Общие настройки: переход к общим настройкам
 * 
 * Связи:
 * - AppLayout: отображается только на странице recr-chat (isRecrChatPage)
 * - AddVacancyModal: модальное окно добавления новой вакансии
 * - vacancies/page.tsx: страница вакансий, откуда может происходить добавление
 * 
 * Поведение:
 * - Показывается только на странице /recr-chat
 * - Фиксированная позиция под Header (top: 64px)
 * - Высота 48px
 * - При выборе вакансии фильтрует кандидатов по статусам
 * - При клике на статус фильтрует кандидатов по выбранному статусу
 * - Неактивные статусы (count === 0 или undefined) группируются
 * 
 * TODO: Реализовать реальную фильтрацию кандидатов по статусам
 */

'use client'

import { Box, Flex, Text, Badge, DropdownMenu, Button } from "@radix-ui/themes"
import { useState, useMemo } from "react"
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import AddVacancyModal, { type AddVacancyFormData } from "./vacancies/AddVacancyModal"
import styles from './StatusBar.module.css'

/**
 * StatusBarProps - интерфейс пропсов компонента StatusBar
 * 
 * Структура:
 * - vacancies: массив вакансий для выбора (опционально)
 * - myVacancyIds: ID вакансий в блоке "Мои" (опционально, по умолчанию первые 2)
 * - statuses: массив статусов кандидатов (опционально)
 * - onGeneralSettingsClick: обработчик клика на "Общие настройки" (опционально)
 * - onAddVacancy: обработчик добавления новой вакансии (опционально)
 */
interface StatusBarProps {
  vacancies?: Array<{ id: string; title: string }>
  /** ID вакансий в блоке «Мои»; если не задано, берутся первые 2 из vacancies */
  myVacancyIds?: string[]
  statuses?: Array<{ id: string; label: string; color: string; count?: number }>
  onGeneralSettingsClick?: () => void
  onAddVacancy?: (data: AddVacancyFormData) => void
}

/**
 * StatusGroup - интерфейс группы неактивных статусов
 * 
 * Структура:
 * - type: 'group' - тип элемента (группа)
 * - statuses: массив статусов в группе
 * - groupId: уникальный идентификатор группы
 */
interface StatusGroup {
  type: 'group'
  statuses: Array<{ id: string; label: string; color: string; count?: number }>
  groupId: string
}

/**
 * StatusItem - интерфейс активного статуса
 * 
 * Структура:
 * - type: 'status' - тип элемента (статус)
 * - status: объект статуса с id, label, color, count
 */
interface StatusItem {
  type: 'status'
  status: { id: string; label: string; color: string; count?: number }
}

/**
 * defaultStatuses - статусы кандидатов по умолчанию
 * 
 * Структура каждого статуса:
 * - id: уникальный идентификатор статуса
 * - label: отображаемое название статуса
 * - color: цвет статуса (hex)
 * - count: количество кандидатов в статусе (опционально, undefined означает неактивный статус)
 * 
 * TODO: Загружать из API или настроек компании
 */
const defaultStatuses = [
  { id: 'new', label: 'New', color: '#2180A0', count: 5 },
  { id: 'under-review', label: 'Under Review', color: '#3B82F6', count: 3 },
  { id: 'message', label: 'Message', color: '#6366F1', count: undefined },
  { id: 'contact', label: 'Contact', color: '#8B5CF6', count: undefined },
  { id: 'hr-screening', label: 'HR Screening', color: '#A855F7', count: undefined },
  { id: 'test-task', label: 'Test Task', color: '#C084FC', count: undefined },
  { id: 'final-interview', label: 'Final Interview', color: '#D946EF', count: undefined },
  { id: 'decision', label: 'Decision', color: '#EC4899', count: undefined },
  { id: 'interview', label: 'Interview', color: '#8B5CF6', count: 8 },
  { id: 'offer', label: 'Offer', color: '#22C55E', count: 2 },
  { id: 'accepted', label: 'Accepted', color: '#10B981', count: 1 },
  { id: 'rejected', label: 'Rejected', color: '#EF4444', count: 4 },
  { id: 'declined', label: 'Declined', color: '#F59E0B', count: 2 },
  { id: 'archived', label: 'Archived', color: '#6B7280', count: 12 },
]

/**
 * defaultVacancies - вакансии по умолчанию
 * 
 * Используется для:
 * - Отображения списка вакансий в выпадающем списке
 * 
 * TODO: Загружать из API
 */
const defaultVacancies = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
  { id: '3', title: 'Product Designer' },
  { id: '4', title: 'DevOps Engineer' },
  { id: '5', title: 'Data Engineer' },
  { id: '6', title: 'QA Lead' },
]

/**
 * StatusBar - компонент статусной панели
 * 
 * Состояние:
 * - selectedVacancy: выбранная вакансия (ID или '__my__' / '__all__')
 * - viewMode: режим просмотра вакансий ('my' - мои, 'all' - все)
 * - expandedGroups: множество ID раскрытых групп статусов
 * - addVacancyOpen: флаг открытия модального окна добавления вакансии
 * 
 * Функциональность:
 * - Выбор вакансии для фильтрации статусов
 * - Группировка неактивных статусов
 * - Раскрытие/сворачивание групп статусов
 * - Добавление новой вакансии
 */
export default function StatusBar({ 
  vacancies = defaultVacancies,
  myVacancyIds,
  statuses = defaultStatuses,
  onGeneralSettingsClick,
  onAddVacancy,
}: StatusBarProps) {
  // Выбранная вакансия: ID вакансии, '__my__' (мои вакансии) или '__all__' (все вакансии)
  const [selectedVacancy, setSelectedVacancy] = useState(vacancies[0]?.id || '__my__')
  // Режим просмотра вакансий: 'my' - мои вакансии, 'all' - все вакансии
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my')
  // Множество ID раскрытых групп статусов (для управления раскрытием/сворачиванием)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  // Флаг открытия модального окна добавления новой вакансии
  const [addVacancyOpen, setAddVacancyOpen] = useState(false)

  /**
   * myVacancies - список "моих" вакансий
   * 
   * Логика:
   * - Если передан myVacancyIds - фильтрует вакансии по этим ID
   * - Иначе - берет первые 2 вакансии из списка
   * 
   * Используется для:
   * - Отображения в разделе "Мои" выпадающего списка
   */
  const myVacancies = myVacancyIds
    ? vacancies.filter((v) => myVacancyIds.includes(v.id))
    : vacancies.slice(0, 2)

  /**
   * triggerLabel - текст для кнопки выбора вакансии
   * 
   * Логика:
   * - '__all__' -> 'Все'
   * - '__my__' -> 'Мои'
   * - ID вакансии -> название вакансии
   * - Иначе -> 'Выберите вакансию'
   * 
   * Используется для:
   * - Отображения выбранной вакансии в кнопке выпадающего списка
   */
  const triggerLabel =
    selectedVacancy === '__all__'
      ? 'Все'
      : selectedVacancy === '__my__'
        ? 'Мои'
        : vacancies.find((v) => v.id === selectedVacancy)?.title ?? 'Выберите вакансию'
  
  /**
   * handleAddVacancy - обработчик добавления новой вакансии
   * 
   * Функциональность:
   * - Открывает модальное окно добавления вакансии
   * 
   * Поведение:
   * - Вызывается при клике на "Добавить вакансию" в выпадающем списке
   * - Открывает AddVacancyModal
   */
  const handleAddVacancy = () => {
    setAddVacancyOpen(true)
  }
  
  /**
   * groupedStatuses - сгруппированные статусы (активные отдельно, неактивные группами)
   * 
   * Функциональность:
   * - Группирует неактивные статусы (count === undefined || count === 0) в группы
   * - Активные статусы (count > 0) остаются отдельными элементами
   * 
   * Логика:
   * - Проходит по всем статусам
   * - Если статус неактивный - добавляет в текущую группу
   * - Если статус активный - сохраняет предыдущую группу (если есть) и добавляет активный статус
   * - В конце сохраняет оставшуюся группу (если есть)
   * 
   * Используется для:
   * - Отображения статусов в горизонтальном скролле
   * - Группировки неактивных статусов для экономии места
   * 
   * useMemo:
   * - Пересчитывается только при изменении statuses
   * - Оптимизирует производительность при частых рендерах
   */
  const groupedStatuses = useMemo(() => {
    const result: Array<StatusGroup | StatusItem> = []
    let currentGroup: Array<{ id: string; label: string; color: string; count?: number }> = []
    
    statuses.forEach((status, index) => {
      const isActive = status.count !== undefined && status.count > 0
      
      if (!isActive) {
        // Добавляем в текущую группу
        currentGroup.push(status)
      } else {
        // Если есть группа - сохраняем её и начинаем новую
        if (currentGroup.length > 0) {
          result.push({
            type: 'group',
            statuses: [...currentGroup],
            groupId: `group-${index - currentGroup.length}`
          })
          currentGroup = []
        }
        // Добавляем активный статус
        result.push({
          type: 'status',
          status
        })
      }
    })
    
    // Обрабатываем оставшуюся группу в конце
    if (currentGroup.length > 0) {
      result.push({
        type: 'group',
        statuses: currentGroup,
        groupId: `group-${statuses.length - currentGroup.length}`
      })
    }
    
    return result
  }, [statuses])
  
  /**
   * toggleGroup - переключение раскрытости группы статусов
   * 
   * Функциональность:
   * - Добавляет/удаляет groupId из множества раскрытых групп
   * 
   * Поведение:
   * - Вызывается при клике на группу статусов
   * - Если группа раскрыта - сворачивает её
   * - Если группа свернута - раскрывает её
   * 
   * @param groupId - ID группы для переключения
   */
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId) // Удаляем из множества (сворачиваем)
      } else {
        newSet.add(groupId) // Добавляем в множество (раскрываем)
      }
      return newSet
    })
  }

  return (
    <Box className={styles.statusBar}>
      {/* Неподвижный выпадающий список с вакансиями */}
      <Box className={styles.vacancySelector}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              className={styles.selectTrigger}
              variant="soft"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <Text size="2" truncate style={{ flex: 1, textAlign: 'left' }}>{triggerLabel}</Text>
              <ChevronDownIcon width={14} height={14} style={{ flexShrink: 0, marginLeft: 4 }} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ minWidth: 200 }}>
            <DropdownMenu.Item className={styles.addVacancyItemFirst} onSelect={() => handleAddVacancy()}>
              <Flex align="center" gap="2">
                <PlusIcon width={14} height={14} />
                <Text size="2">Добавить вакансию</Text>
              </Flex>
            </DropdownMenu.Item>

            {viewMode === 'my' ? (
              <>
                <DropdownMenu.Group>
                  <DropdownMenu.Label className={styles.sectionLabel}>Мои</DropdownMenu.Label>
                  {myVacancies.map((vacancy) => (
                    <DropdownMenu.Item
                      key={vacancy.id}
                      onSelect={() => setSelectedVacancy(vacancy.id)}
                    >
                      {vacancy.title}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
                <DropdownMenu.Item
                  className={styles.allVacanciesItem}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('all')
                    setSelectedVacancy('__all__')
                  }}
                >
                  <Text size="2">Все</Text>
                </DropdownMenu.Item>
              </>
            ) : (
              <>
                <DropdownMenu.Item
                  className={styles.allHeaderInAllMode}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('all')
                    setSelectedVacancy('__all__')
                  }}
                >
                  <Text size="2">Все</Text>
                </DropdownMenu.Item>
                {vacancies.map((vacancy) => (
                  <DropdownMenu.Item
                    key={vacancy.id}
                    onSelect={() => setSelectedVacancy(vacancy.id)}
                  >
                    {vacancy.title}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Item
                  className={styles.mySwitchItem}
                  onSelect={(e) => {
                    e.preventDefault()
                    setViewMode('my')
                    setSelectedVacancy('__my__')
                  }}
                >
                  <Text size="2">Мои</Text>
                </DropdownMenu.Item>
              </>
            )}

            <DropdownMenu.Item
              className={styles.generalSettingsItem}
              onSelect={() => onGeneralSettingsClick?.()}
            >
              <Text size="2">Общие настройки</Text>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>

      {/* Горизонтальный скролл со статусами */}
      <Box className={styles.statusesScroll}>
        <Flex align="center" gap="1" className={styles.statusesContainer}>
          {/* Статус "Все" */}
          <Box
            className={styles.statusItem}
            style={{
              borderColor: '#6B7280',
            }}
          >
            <Badge
              size="2"
              style={{
                backgroundColor: '#6B7280',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Все
            </Badge>
          </Box>
          {groupedStatuses.map((item, index) => {
            if (item.type === 'group') {
              const isExpanded = expandedGroups.has(item.groupId)
              const count = item.statuses.length
              const countText = count === 1 ? 'этап' : count < 5 ? 'этапа' : 'этапов'
              
              // Если группа раскрыта, показываем все статусы
              if (isExpanded) {
                return (
                  <Box key={item.groupId} style={{ display: 'contents' }}>
                    {item.statuses.map((status) => (
                      <Box
                        key={status.id}
                        className={`${styles.statusItem} ${styles.statusItemDisabled}`}
                        style={{
                          borderColor: status.color,
                          opacity: 0.5,
                          cursor: 'not-allowed',
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          return false
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <Badge
                          size="2"
                          style={{
                            backgroundColor: status.color,
                            color: 'white',
                            cursor: 'not-allowed',
                            opacity: 0.6,
                          }}
                        >
                          {status.label}
                        </Badge>
                      </Box>
                    ))}
                    {/* Кнопка для сворачивания группы */}
                    <Box
                      className={styles.statusItem}
                      style={{
                        borderColor: '#9CA3AF',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleGroup(item.groupId)}
                    >
                      <Badge
                        size="2"
                        style={{
                          backgroundColor: '#9CA3AF',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronUpIcon 
                          width={12} 
                          height={12} 
                          style={{ 
                            transform: 'rotate(-90deg)',
                            display: 'inline-block'
                          }} 
                        />
                      </Badge>
                    </Box>
                  </Box>
                )
              }
              
              // Если группа не раскрыта, показываем кнопку группы
              return (
                <Box
                  key={item.groupId}
                  className={styles.statusItem}
                  style={{
                    borderColor: '#9CA3AF',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleGroup(item.groupId)}
                >
                  <Badge
                    size="2"
                    style={{
                      backgroundColor: '#9CA3AF',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {count} {countText} без кандидатов
                  </Badge>
                </Box>
              )
            } else {
              // Обычный активный статус
              const status = item.status
              const isActive = status.count !== undefined && status.count > 0
              
              return (
                <Box
                  key={status.id}
                  className={`${styles.statusItem} ${!isActive ? styles.statusItemDisabled : ''}`}
                  style={{
                    borderColor: status.color,
                    opacity: isActive ? 1 : 0.5,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                  }}
                  onClick={(e) => {
                    if (!isActive) {
                      e.preventDefault()
                      e.stopPropagation()
                      return false
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!isActive) {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }}
                >
                  <Badge
                    size="2"
                    style={{
                      backgroundColor: status.color,
                      color: 'white',
                      cursor: isActive ? 'pointer' : 'not-allowed',
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {status.label}
                    {status.count !== undefined && (
                      <Text size="1" style={{ marginLeft: '4px', opacity: 0.9 }}>
                        ({status.count})
                      </Text>
                    )}
                  </Badge>
                </Box>
              )
            }
          })}
        </Flex>
      </Box>

      <AddVacancyModal
        isOpen={addVacancyOpen}
        onClose={() => setAddVacancyOpen(false)}
        onSave={(data) => {
          onAddVacancy?.(data)
        }}
      />
    </Box>
  )
}
