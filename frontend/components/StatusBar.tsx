'use client'

import { Box, Flex, Text, Select, Badge } from "@radix-ui/themes"
import { useState, useMemo } from "react"
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import styles from './StatusBar.module.css'

interface StatusBarProps {
  vacancies?: Array<{ id: string; title: string }>
  statuses?: Array<{ id: string; label: string; color: string; count?: number }>
}

interface StatusGroup {
  type: 'group'
  statuses: Array<{ id: string; label: string; color: string; count?: number }>
  groupId: string
}

interface StatusItem {
  type: 'status'
  status: { id: string; label: string; color: string; count?: number }
}

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

const defaultVacancies = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
  { id: '3', title: 'Product Designer' },
  { id: '4', title: 'DevOps Engineer' },
]

export default function StatusBar({ 
  vacancies = defaultVacancies,
  statuses = defaultStatuses 
}: StatusBarProps) {
  const [selectedVacancy, setSelectedVacancy] = useState(vacancies[0]?.id || '')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
  const handleAddVacancy = () => {
    // TODO: Implement add vacancy functionality
    console.log('Add new vacancy')
  }
  
  // Группируем неактивные статусы
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
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  return (
    <Box className={styles.statusBar}>
      {/* Неподвижный выпадающий список с вакансиями */}
      <Box className={styles.vacancySelector}>
        <Select.Root
          value={selectedVacancy}
          onValueChange={(value) => {
            if (value === 'add-new') {
              handleAddVacancy()
              // Не меняем selectedVacancy, чтобы оставалась выбранной текущая вакансия
            } else {
              setSelectedVacancy(value)
            }
          }}
        >
          <Select.Trigger 
            className={styles.selectTrigger}
            placeholder="Выберите вакансию"
          />
          <Select.Content>
            {vacancies.map((vacancy) => (
              <Select.Item key={vacancy.id} value={vacancy.id}>
                {vacancy.title}
              </Select.Item>
            ))}
            <Select.Item value="add-new" className={styles.addVacancyItem}>
              <Flex align="center" gap="2">
                <PlusIcon width={14} height={14} />
                <Text size="2">Добавить вакансию</Text>
              </Flex>
            </Select.Item>
          </Select.Content>
        </Select.Root>
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
    </Box>
  )
}
