'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, SegmentedControl, DropdownMenu } from "@radix-ui/themes"
import { useState } from "react"
import RequestsSearchFilters from "@/components/requests/RequestsSearchFilters"
import RequestsStats from "@/components/requests/RequestsStats"
import RequestListItem from "@/components/requests/RequestListItem"
import RequestsTable from "@/components/requests/RequestsTable"
import { HamburgerMenuIcon, DownloadIcon, UploadIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './hiring-requests.module.css'

// Моковые данные заявок (расширенные для таблицы)
const mockRequests = [
  {
    id: 1001,
    title: 'Frontend Engineer (React)',
    grade: 'Middle',
    project: 'PUI Skins',
    recruiter: 'Golubenko A.',
    recruiterDays: 27,
    status: 'in_process' as const,
    startDate: '17.12.2025',
    endDate: '21.01.2026',
    isOverdue: false,
    factDays: 26,
    slaDays: 35,
    slaStatus: 'normal' as const,
    t2hDays: undefined,
    t2hSlaDays: 48,
    department: 'Разработка',
    priority: 'high' as const,
    technologies: ['React', 'TypeScript', 'Next.js'],
    candidates: 5,
    date: '25.10.2025',
    hasWarning: false
  },
  {
    id: 1002,
    title: 'Support Engineer (Service ...)',
    grade: 'Junior+',
    project: null,
    recruiter: 'Chernomordin A.',
    recruiterDays: 21,
    status: 'in_process' as const,
    startDate: '15.12.2025',
    endDate: '14.01.2026',
    isOverdue: false,
    factDays: 28,
    slaDays: 30,
    slaStatus: 'risk' as const,
    t2hDays: undefined,
    t2hSlaDays: 38,
    department: 'Поддержка',
    priority: 'medium' as const,
    technologies: [],
    candidates: 0,
    date: '22.09.2025',
    hasWarning: false
  },
  {
    id: 1003,
    title: 'DevOps Engineer',
    grade: 'Middle+',
    project: null,
    recruiter: 'Golubenko A.',
    recruiterDays: 32,
    status: 'closed' as const,
    statusDate: '06.01.2026',
    startDate: '11.12.2025',
    endDate: '20.01.2026',
    isOverdue: false,
    factDays: 26,
    slaDays: 40,
    slaStatus: 'on_time' as const,
    t2hDays: 67,
    t2hSlaDays: 56,
    candidate: {
      name: 'Aleksander Volvachev',
      id: '76779160'
    },
    department: 'Инфраструктура',
    priority: 'high' as const,
    technologies: ['Docker', 'Kubernetes', 'AWS'],
    candidates: 1,
    date: '20.09.2025',
    hasWarning: false
  },
  {
    id: 1004,
    title: 'Frontend Engineer (React)',
    grade: 'Junior+',
    project: 'PUI Skins',
    recruiter: 'Golubenko A.',
    recruiterDays: 33,
    status: 'in_process' as const,
    startDate: '10.12.2025',
    endDate: '09.01.2026',
    isOverdue: true,
    factDays: 33,
    slaDays: 30,
    slaStatus: 'overdue' as const,
    t2hDays: undefined,
    t2hSlaDays: 38,
    department: 'Разработка',
    priority: 'high' as const,
    technologies: ['React', 'TypeScript'],
    candidates: 0,
    date: '18.09.2025',
    hasWarning: false
  },
  {
    id: 1005,
    title: 'Backend Engineer',
    status: 'planned' as const,
    statusDate: '01.02.2026',
    grade: 'Middle',
    project: null,
    recruiter: 'Andrei Golubenko',
    recruiterDays: 15,
    startDate: '01.12.2025',
    endDate: '15.01.2026',
    isOverdue: false,
    factDays: 20,
    slaDays: 35,
    slaStatus: 'normal' as const,
    t2hDays: undefined,
    t2hSlaDays: 38,
    department: 'Разработка',
    priority: 'medium' as const,
    technologies: ['Python', 'Django', 'PostgreSQL'],
    candidates: 3,
    date: '22.09.2025',
    hasWarning: false
  },
  {
    id: 1006,
    title: 'QA Engineer',
    status: 'cancelled' as const,
    statusDate: '10.01.2026',
    grade: 'Middle',
    project: 'PUI Skins',
    recruiter: 'Andrei Golubenko',
    recruiterDays: 18,
    startDate: '05.12.2025',
    endDate: '18.01.2026',
    isOverdue: false,
    factDays: 22,
    slaDays: 30,
    slaStatus: 'normal' as const,
    t2hDays: undefined,
    t2hSlaDays: 38,
    department: 'Тестирование',
    priority: 'medium' as const,
    technologies: ['Selenium', 'Postman'],
    candidates: 4,
    date: '15.09.2025',
    hasWarning: false
  }
]

export default function HiringRequestsPage() {
  const router = useRouter()
  const [displayMode, setDisplayMode] = useState<'all' | 'blocks'>('blocks')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  const totalRequests = mockRequests.length
  const plannedRequests = mockRequests.filter(r => r.status === 'planned').length
  const inProcessRequests = mockRequests.filter(r => r.status === 'in_process').length
  const cancelledRequests = mockRequests.filter(r => r.status === 'cancelled').length
  const closedRequests = mockRequests.filter(r => r.status === 'closed').length

  // Фильтрация заявок
  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toString().includes(searchQuery) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRecruiter = selectedRecruiter === 'all' || request.recruiter === selectedRecruiter
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority
    return matchesSearch && matchesRecruiter && matchesStatus && matchesPriority
  })

  // Группировка заявок по названию вакансии для режима "Блоками"
  const groupedRequests = displayMode === 'blocks' 
    ? filteredRequests.reduce((acc, request) => {
        const key = request.title
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(request)
        return acc
      }, {} as Record<string, typeof filteredRequests>)
    : {}

  return (
    <AppLayout pageTitle="Заявки">
      <Box className={styles.requestsContainer}>
        {/* Поиск и фильтры */}
        <RequestsSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRecruiter={selectedRecruiter}
          onRecruiterChange={setSelectedRecruiter}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
        />

        {/* Статистика */}
        <RequestsStats
          total={totalRequests}
          planned={plannedRequests}
          inProcess={inProcessRequests}
          cancelled={cancelledRequests}
          closed={closedRequests}
        />

        {/* Заголовок секции с переключателем вида */}
        <Flex justify="between" align="center" className={styles.sectionHeader}>
          <Flex align="center" gap="2">
            <HamburgerMenuIcon width={20} height={20} />
            <Text size="5" weight="bold">Заявки</Text>
          </Flex>
          <Flex align="center" gap="3">
            {/* Кнопка импорта/экспорта Excel */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button 
                  size="2" 
                  variant="soft"
                  className={styles.excelButton}
                >
                  <Flex align="center" gap="2">
                    <DotsHorizontalIcon width={16} height={16} />
                    <Text>Excel</Text>
                  </Flex>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onSelect={() => {
                    // TODO: Реализовать импорт Excel
                    alert('Импорт Excel будет реализован')
                  }}
                >
                  <Flex align="center" gap="2">
                    <UploadIcon width={16} height={16} />
                    <Text>Импорт Excel</Text>
                  </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => {
                    // TODO: Реализовать экспорт Excel
                    alert('Экспорт Excel будет реализован')
                  }}
                >
                  <Flex align="center" gap="2">
                    <DownloadIcon width={16} height={16} />
                    <Text>Экспорт Excel</Text>
                  </Flex>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            {/* Свитчер "Все" / "Блоками" */}
            <SegmentedControl.Root 
              value={displayMode} 
              onValueChange={(value) => setDisplayMode(value as 'all' | 'blocks')}
            >
              <SegmentedControl.Item value="all">
                <Text>Все</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="blocks">
                <Text>Блоками</Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            
            <Button size="3" className={styles.addButton}>
              + Добавить заявку
            </Button>
          </Flex>
        </Flex>

        {/* Отображение заявок */}
        {displayMode === 'all' ? (
          <RequestsTable 
            requests={filteredRequests}
            onView={(id) => router.push(`/hiring-requests/${id}`)}
            onEdit={(id) => router.push(`/hiring-requests/${id}/edit`)}
          />
        ) : (
          <Box className={styles.listContainer}>
            {Object.entries(groupedRequests).map(([title, requests]) => (
              <RequestListItem 
                key={title} 
                request={requests[0]}
                requests={requests}
                requestsCount={requests.length}
                onClick={() => router.push(`/hiring-requests/${requests[0].id}`)}
              />
            ))}
          </Box>
        )}
      </Box>
    </AppLayout>
  )
}
