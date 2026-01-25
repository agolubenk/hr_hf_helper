'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, TextField, Select, Button } from "@radix-ui/themes"
import { useState } from "react"
import VacanciesSearchFilters from "@/components/vacancies/VacanciesSearchFilters"
import VacanciesStats from "@/components/vacancies/VacanciesStats"
import VacancyCard from "@/components/vacancies/VacancyCard"
import VacancyListItem from "@/components/vacancies/VacancyListItem"
import { GridIcon, ListBulletIcon } from "@radix-ui/react-icons"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './vacancies.module.css'

// Моковые данные вакансий
const mockVacancies = [
  {
    id: 4090046,
    title: 'AQA Engineer (TS)',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    technologies: ['JavaScript', 'TypeScript', 'Selenium', 'Postman'],
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
    technologies: [],
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
    technologies: [],
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
    technologies: [],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3979419,
    title: 'DevOps Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    technologies: [],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3936534,
    title: 'Project Manager',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    technologies: [],
    interviewers: 2,
    date: null,
    hasWarning: false
  },
  {
    id: 4090047,
    title: 'Frontend Engineer',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    technologies: ['React', 'TypeScript', 'Next.js'],
    interviewers: 1,
    date: '26.10.2025',
    hasWarning: false
  },
  {
    id: 4090048,
    title: 'Backend Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    technologies: ['Python', 'Django', 'PostgreSQL'],
    interviewers: 0,
    date: '20.10.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  }
] as { id: number; title: string; status: 'active' | 'inactive'; recruiter: string; technologies: string[]; interviewers: number; date: string | null; hasWarning: boolean; warningText?: string }[]

export default function VacanciesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const totalVacancies = mockVacancies.length
  const activeVacancies = mockVacancies.filter(v => v.status === 'active').length
  const inactiveVacancies = mockVacancies.filter(v => v.status === 'inactive').length

  // Фильтрация вакансий
  const filteredVacancies = mockVacancies.filter(vacancy => {
    const matchesSearch = !searchQuery || 
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.id.toString().includes(searchQuery)
    const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
    const matchesStatus = selectedStatus === 'all' || vacancy.status === selectedStatus
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
                vacancy={vacancy}
                onClick={() => router.push(`/vacancies/${vacancy.id}`)}
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.listContainer}>
            {filteredVacancies.map(vacancy => (
              <VacancyListItem 
                key={vacancy.id} 
                vacancy={vacancy}
                onClick={() => router.push(`/vacancies/${vacancy.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>
    </AppLayout>
  )
}
