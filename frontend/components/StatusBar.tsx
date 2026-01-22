'use client'

import { Box, Flex, Text, Select, Badge } from "@radix-ui/themes"
import { useState } from "react"
import { PlusIcon } from "@radix-ui/react-icons"
import styles from './StatusBar.module.css'

interface StatusBarProps {
  vacancies?: Array<{ id: string; title: string }>
  statuses?: Array<{ id: string; label: string; color: string; count?: number }>
}

const defaultStatuses = [
  { id: 'new', label: 'New', color: '#2180A0', count: 5 },
  { id: 'under-review', label: 'Under Review', color: '#3B82F6', count: 3 },
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

  const handleAddVacancy = () => {
    // TODO: Implement add vacancy functionality
    console.log('Add new vacancy')
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
        <Flex align="center" gap="2" className={styles.statusesContainer}>
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
          {statuses.map((status) => (
            <Box
              key={status.id}
              className={styles.statusItem}
              style={{
                borderColor: status.color,
              }}
            >
              <Badge
                size="2"
                style={{
                  backgroundColor: status.color,
                  color: 'white',
                  cursor: 'pointer',
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
          ))}
        </Flex>
      </Box>
    </Box>
  )
}
