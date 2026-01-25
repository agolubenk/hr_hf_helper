'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { useState, useEffect, Suspense } from "react"
import VacanciesSearchFilters from "@/components/vacancies/VacanciesSearchFilters"
import VacanciesStats from "@/components/vacancies/VacanciesStats"
import VacancyCard from "@/components/vacancies/VacancyCard"
import VacancyListItem from "@/components/vacancies/VacancyListItem"
import VacancyEditModal from "@/components/vacancies/VacancyEditModal"
import { GridIcon, ListBulletIcon } from "@radix-ui/react-icons"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { useSearchParams } from "next/navigation"
import styles from './vacancies.module.css'

// Моковые данные вакансий
const mockVacancies = [
  {
    id: 4090046,
    title: 'AQA Engineer (TS)',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо'],
    interviewers: 0,
    date: '25.10.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 3993218,
    title: 'UX/UI Designer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: [],
    interviewers: 0,
    date: '22.09.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 4020335,
    title: 'System Administrator',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Гомель'],
    interviewers: 0,
    date: '22.09.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 4092269,
    title: 'Manual QA Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: [],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3979419,
    title: 'DevOps Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо', 'Польша'],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3936534,
    title: 'Project Manager',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск'],
    interviewers: 2,
    date: null,
    hasWarning: false
  },
  {
    id: 4090047,
    title: 'Frontend Engineer',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо'],
    interviewers: 1,
    date: '26.10.2025',
    hasWarning: false
  },
  {
    id: 4090048,
    title: 'Backend Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Варшава', 'Удалённо'],
    interviewers: 0,
    date: '20.10.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  }
] as { id: number; title: string; status: 'active' | 'inactive'; recruiter: string; locations: string[]; interviewers: number; date: string | null; hasWarning: boolean; warningText?: string }[]

function VacanciesPageContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewVacancyId, setViewVacancyId] = useState<number | null>(null)
  const [editVacancyId, setEditVacancyId] = useState<number | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<number, 'active' | 'inactive'>>({})

  const getStatus = (v: (typeof mockVacancies)[0]) => statusOverrides[v.id] ?? v.status

  useEffect(() => {
    const id = searchParams.get('edit')
    if (!id) return
    const n = parseInt(id, 10)
    if (!isNaN(n)) { setEditVacancyId(n); setViewVacancyId(null) }
  }, [searchParams])

  const totalVacancies = mockVacancies.length
  const activeVacancies = mockVacancies.filter(v => getStatus(v) === 'active').length
  const inactiveVacancies = mockVacancies.filter(v => getStatus(v) === 'inactive').length

  // Фильтрация вакансий
  const filteredVacancies = mockVacancies.filter(vacancy => {
    const status = getStatus(vacancy)
    const matchesSearch = !searchQuery || 
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.id.toString().includes(searchQuery)
    const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    return matchesSearch && matchesRecruiter && matchesStatus
  })

  return (
    <AppLayout pageTitle="Вакансии">
      <Box className={styles.vacanciesContainer}>
        {/* Поиск и фильтры */}
        <VacanciesSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRecruiter={selectedRecruiter}
          onRecruiterChange={setSelectedRecruiter}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Статистика */}
        <VacanciesStats
          total={totalVacancies}
          active={activeVacancies}
          inactive={inactiveVacancies}
        />

        {/* Заголовок секции с переключателем вида */}
        <Flex justify="between" align="center" className={styles.sectionHeader}>
          <Flex align="center" gap="2">
            <HamburgerMenuIcon width={20} height={20} />
            <Text size="5" weight="bold">Вакансии</Text>
          </Flex>
          <Flex align="center" gap="3">
            {/* Переключатель вида */}
            <Flex gap="1" className={styles.viewToggle}>
              <Button
                variant={viewMode === 'cards' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('cards')}
                className={styles.viewButton}
              >
                <GridIcon width={16} height={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('list')}
                className={styles.viewButton}
              >
                <ListBulletIcon width={16} height={16} />
              </Button>
            </Flex>
            <Button size="3" className={styles.addButton}>
              + Добавить вакансию
            </Button>
          </Flex>
        </Flex>

        {/* Список вакансий */}
        {viewMode === 'cards' ? (
          <Box className={styles.cardsGrid}>
            {filteredVacancies.map(vacancy => (
              <VacancyCard 
                key={vacancy.id} 
                vacancy={{ ...vacancy, status: getStatus(vacancy) }}
                onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
                onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
                onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.listContainer}>
            {filteredVacancies.map(vacancy => (
              <VacancyListItem 
                key={vacancy.id} 
                vacancy={{ ...vacancy, status: getStatus(vacancy) }}
                onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
                onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
                onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
              />
            ))}
          </Box>
        )}

        <VacancyEditModal
          open={!!(editVacancyId || viewVacancyId)}
          onOpenChange={(open) => { if (!open) { setEditVacancyId(null); setViewVacancyId(null) } }}
          vacancyId={editVacancyId ?? viewVacancyId}
          mode={viewVacancyId ? 'view' : 'edit'}
          vacancy={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? { ...v, status: statusOverrides[v.id] ?? v.status } : null })()}
          vacancyStatus={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? (statusOverrides[v.id] ?? v.status) : undefined })()}
          onVacancyStatusChange={(status) => { const id = editVacancyId ?? viewVacancyId; if (id != null) setStatusOverrides(prev => ({ ...prev, [id]: status })) }}
          onSwitchToEdit={viewVacancyId != null ? () => { setEditVacancyId(viewVacancyId); setViewVacancyId(null) } : undefined}
          vacancyTitle={mockVacancies.find(v => v.id === (editVacancyId ?? viewVacancyId))?.title}
        />
      </Box>
    </AppLayout>
  )
}

export default function VacanciesPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Вакансии"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <VacanciesPageContent />
    </Suspense>
  )
}
