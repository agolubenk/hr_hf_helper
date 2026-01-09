'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { useState } from "react"
import SalaryRangesSearchFilters from "@/components/salary-ranges/SalaryRangesSearchFilters"
import SalaryRangesStats from "@/components/salary-ranges/SalaryRangesStats"
import SalaryRangeCard from "@/components/salary-ranges/SalaryRangeCard"
import SalaryRangeListItem from "@/components/salary-ranges/SalaryRangeListItem"
import CreateSalaryRangeModal from "@/components/salary-ranges/CreateSalaryRangeModal"
import { GridIcon, ListBulletIcon, HamburgerMenuIcon, PlusIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './salary-ranges.module.css'

// Моковые данные зарплатных вилок
const mockSalaryRanges = [
  {
    id: 1,
    vacancyId: 3979419,
    vacancyName: 'DevOps Engineer',
    grade: 'Senior',
    salaryUsd: { min: 3500, max: 5000 },
    salaryByn: { min: 10336, max: 14766 },
    salaryPln: { min: 16794, max: 23992 },
    salaryEur: { min: 3983, max: 5690 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 2,
    vacancyId: 3936868,
    vacancyName: 'Frontend Engineer (React)',
    grade: 'Middle+',
    salaryUsd: { min: 2500, max: 3500 },
    salaryByn: { min: 7383, max: 10336 },
    salaryPln: { min: 11996, max: 16794 },
    salaryEur: { min: 2845, max: 3983 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 3,
    vacancyId: 3936534,
    vacancyName: 'Backend Engineer (Java)',
    grade: 'Middle',
    salaryUsd: { min: 1500, max: 2500 },
    salaryByn: { min: 4430, max: 7383 },
    salaryPln: { min: 7198, max: 11996 },
    salaryEur: { min: 1707, max: 2845 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 4,
    vacancyId: 4090047,
    vacancyName: 'QA Engineer',
    grade: 'Middle',
    salaryUsd: { min: 1900, max: 2500 },
    salaryByn: { min: 5611, max: 7383 },
    salaryPln: { min: 9117, max: 11996 },
    salaryEur: { min: 2162, max: 2845 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 5,
    vacancyId: 4090048,
    vacancyName: 'UX/UI Designer',
    grade: 'Junior+',
    salaryUsd: { min: 1500, max: 1900 },
    salaryByn: { min: 4430, max: 5611 },
    salaryPln: { min: 7198, max: 9117 },
    salaryEur: { min: 1707, max: 2162 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 6,
    vacancyId: 4020335,
    vacancyName: 'System Administrator',
    grade: 'Middle',
    salaryUsd: { min: 2000, max: 2800 },
    salaryByn: { min: 5906, max: 8269 },
    salaryPln: { min: 9597, max: 13436 },
    salaryEur: { min: 2276, max: 3186 },
    isActive: false,
    updatedAt: '2026-01-07T00:00:00Z',
  },
  {
    id: 7,
    vacancyId: 4092269,
    vacancyName: 'Project Manager',
    grade: 'Senior',
    salaryUsd: { min: 3000, max: 4500 },
    salaryByn: { min: 8860, max: 13290 },
    salaryPln: { min: 14397, max: 21595 },
    salaryEur: { min: 3414, max: 5121 },
    isActive: false,
    updatedAt: '2026-01-06T00:00:00Z',
  },
  {
    id: 8,
    vacancyId: 3993218,
    vacancyName: 'AQA Engineer (TS)',
    grade: 'Middle+',
    salaryUsd: { min: 2200, max: 3000 },
    salaryByn: { min: 6497, max: 8860 },
    salaryPln: { min: 10557, max: 14397 },
    salaryEur: { min: 2504, max: 3414 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 9,
    vacancyId: 4090046,
    vacancyName: 'Manual QA Engineer',
    grade: 'Junior',
    salaryUsd: { min: 1200, max: 1800 },
    salaryByn: { min: 3544, max: 5316 },
    salaryPln: { min: 5758, max: 8637 },
    salaryEur: { min: 1366, max: 2049 },
    isActive: true,
    updatedAt: '2026-01-08T00:00:00Z',
  },
]

export default function SalaryRangesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVacancy, setSelectedVacancy] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [salaryRanges, setSalaryRanges] = useState(mockSalaryRanges)

  const handleToggleActive = (id: number) => {
    setSalaryRanges(prev => prev.map(range => 
      range.id === id ? { ...range, isActive: !range.isActive } : range
    ))
  }

  // Фильтрация зарплатных вилок
  const filteredRanges = salaryRanges.filter(range => {
    // Поиск по тексту, ID или числовым значениям
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      range.vacancyName.toLowerCase().includes(searchLower) ||
      range.grade.toLowerCase().includes(searchLower) ||
      range.vacancyId.toString().includes(searchQuery) ||
      range.salaryUsd.min.toString().includes(searchQuery) ||
      range.salaryUsd.max.toString().includes(searchQuery) ||
      range.salaryByn.min.toString().includes(searchQuery) ||
      range.salaryByn.max.toString().includes(searchQuery) ||
      range.salaryPln.min.toString().includes(searchQuery) ||
      range.salaryPln.max.toString().includes(searchQuery) ||
      range.salaryEur.min.toString().includes(searchQuery) ||
      range.salaryEur.max.toString().includes(searchQuery)
    
    const matchesVacancy = selectedVacancy === 'all' || range.vacancyName === selectedVacancy
    const matchesGrade = selectedGrade === 'all' || range.grade === selectedGrade
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && range.isActive) ||
      (activeTab === 'inactive' && !range.isActive)
    
    return matchesSearch && matchesVacancy && matchesGrade && matchesTab
  })

  const totalRanges = salaryRanges.length
  const activeRanges = salaryRanges.filter(r => r.isActive).length
  const inactiveRanges = salaryRanges.filter(r => !r.isActive).length

  const handleReset = () => {
    setSearchQuery('')
    setSelectedVacancy('all')
    setSelectedGrade('all')
  }

  const getLastUpdateTime = () => {
    const now = new Date()
    return now.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <AppLayout pageTitle="Зарплатные вилки">
      <Box className={styles.salaryRangesContainer}>
        {/* Заголовок */}
        <Flex justify="between" align="start" mb="3">
          <Text size="5" weight="bold" style={{ lineHeight: '1.5', paddingTop: 0, marginTop: 0 }}>
            Зарплатные вилки
          </Text>
          <Flex direction="column" align="end" style={{ gap: 0, alignItems: 'flex-end' }}>
            <Button size="3" className={styles.addButton} style={{ marginTop: 0, paddingTop: 0 }} onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon width={16} height={16} />
              <span className={styles.buttonTextDesktop}>Добавить вилку</span>
              <span className={styles.buttonTextMobile}>Добавить</span>
            </Button>
            <Text size="1" style={{ color: 'var(--gray-10)', marginTop: '-12px', paddingTop: 0 }}>
              <span className={styles.updateTextDesktop}>Обновлено: </span>
              <span>{getLastUpdateTime()}</span>
            </Text>
          </Flex>
        </Flex>

        {/* Поиск и фильтры */}
        <SalaryRangesSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedVacancy={selectedVacancy}
          onVacancyChange={setSelectedVacancy}
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
          onReset={handleReset}
        />

        {/* Статистика и переключатель табов */}
        <SalaryRangesStats
          total={totalRanges}
          active={activeRanges}
          inactive={inactiveRanges}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onListViewClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
        />

        {/* Заголовок секции с переключателем вида */}
        <Flex justify="between" align="center" className={styles.sectionHeader}>
          <Flex align="center" gap="2">
            <HamburgerMenuIcon width={20} height={20} />
            <Text size="5" weight="bold">Зарплатные вилки</Text>
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
          </Flex>
        </Flex>

        {/* Список зарплатных вилок */}
        {viewMode === 'cards' ? (
          <Box className={styles.cardsGrid}>
            {filteredRanges.map(range => (
              <SalaryRangeCard 
                key={range.id} 
                salaryRange={range}
                onClick={() => router.push(`/vacancies/salary-ranges/${range.id}`)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.listContainer}>
            {filteredRanges.map(range => (
              <SalaryRangeListItem 
                key={range.id} 
                salaryRange={range}
                onClick={() => router.push(`/vacancies/salary-ranges/${range.id}`)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </Box>
        )}

        {/* Модальное окно создания */}
        <CreateSalaryRangeModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSave={(data) => {
            console.log('Создание зарплатной вилки:', data)
            // Здесь будет логика сохранения
            setIsCreateModalOpen(false)
          }}
        />
      </Box>
    </AppLayout>
  )
}
