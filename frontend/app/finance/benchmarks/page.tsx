/**
 * BenchmarksPage (finance/benchmarks/page.tsx) - Страница управления бенчмарками зарплат
 * 
 * Назначение:
 * - Управление бенчмарками зарплат из вакансий и кандидатов
 * - Создание, редактирование и удаление бенчмарков
 * - Фильтрация и поиск бенчмарков
 * - Статистика по бенчмаркам
 * 
 * Функциональность:
 * - Список всех бенчмарков в таблице
 * - Поиск бенчмарков по вакансии, грейду, локации
 * - Фильтрация по типу (кандидат/вакансия), грейду, вакансии, статусу
 * - Статистика: всего бенчмарков, активных, по типам, по грейдам
 * - Форма добавления нового бенчмарка
 * - Форма редактирования бенчмарка
 * - Удаление бенчмарка
 * - Активация/деактивация бенчмарка
 * - Ссылки на вакансии в HeadHunter
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений
 * - Sidebar: содержит ссылку на эту страницу в разделе "Финансы"
 * - finance/page.tsx: страница финансов, откуда может происходить переход
 * 
 * Поведение:
 * - При загрузке загружает список бенчмарков
 * - При поиске фильтрует бенчмарки по введенному запросу
 * - При добавлении бенчмарка показывает форму, при сохранении скрывает её
 * - При редактировании бенчмарка открывает форму редактирования
 * - При удалении показывает подтверждение
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, TextField, Table, Badge, Select, Card } from "@radix-ui/themes"
import { PlusIcon, MagnifyingGlassIcon, ReloadIcon, EyeOpenIcon, Pencil2Icon, TrashIcon, ExternalLinkIcon, CalendarIcon, SewingPinFilledIcon, BackpackIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { Benchmark, BenchmarkStats, BenchmarkSettings, Grade, Vacancy } from "@/lib/api"
import styles from './benchmarks.module.css'

/**
 * MOCK_BENCHMARKS - моковые данные бенчмарков зарплат
 * 
 * Структура бенчмарка:
 * - id: уникальный идентификатор бенчмарка
 * - type: тип бенчмарка ('candidate' - от кандидата, 'vacancy' - от вакансии)
 * - vacancy, vacancy_name: ID и название вакансии
 * - grade, grade_name: ID и название грейда
 * - salary_from, salary_to: минимальная и максимальная зарплата
 * - salary_display: отформатированная строка зарплаты
 * - location: локация
 * - work_format: формат работы (гибрид, удаленка, офис)
 * - compensation: компенсации (ДМС, спортзал и т.д.)
 * - benefits: бенефиты (обеды, корпоративы и т.д.)
 * - development: возможности развития (конференции, курсы и т.д.)
 * - technologies: технологии
 * - domain, domain_display: домен (fintech, ecommerce и т.д.)
 * - hh_vacancy_id: ID вакансии в HeadHunter (опционально)
 * - date_added: дата добавления бенчмарка
 * - is_active: флаг активности бенчмарка
 * - created_at, updated_at: даты создания и обновления
 * 
 * TODO: Заменить на реальные данные из API
 */
const MOCK_BENCHMARKS: Benchmark[] = [
  {
    id: 1,
    type: 'candidate',
    vacancy: 1,
    vacancy_name: 'Frontend Developer',
    grade: 1,
    grade_name: 'Middle',
    salary_from: '200000',
    salary_to: '300000',
    salary_display: '200 000 - 300 000 ₽',
    location: 'Москва',
    work_format: 'гибрид',
    compensation: 'ДМС, спортзал',
    benefits: 'Обеды, корпоративы',
    development: 'Конференции, курсы',
    technologies: 'React, TypeScript, Next.js',
    domain: 'fintech',
    domain_display: 'FinTech',
    hh_vacancy_id: '12345678',
    date_added: '2026-01-20T10:00:00Z',
    is_active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 2,
    type: 'vacancy',
    vacancy: 2,
    vacancy_name: 'Backend Developer',
    grade: 2,
    grade_name: 'Senior',
    salary_from: '300000',
    salary_to: '450000',
    salary_display: '300 000 - 450 000 ₽',
    location: 'Санкт-Петербург',
    work_format: 'удаленка',
    compensation: 'ДМС',
    benefits: 'Обеды',
    development: 'Курсы',
    technologies: 'Python, Django, PostgreSQL',
    domain: 'ecommerce',
    domain_display: 'E-commerce',
    hh_vacancy_id: '87654321',
    date_added: '2026-01-19T14:30:00Z',
    is_active: true,
    created_at: '2026-01-19T14:30:00Z',
    updated_at: '2026-01-19T14:30:00Z',
  },
  {
    id: 3,
    type: 'candidate',
    vacancy: 3,
    vacancy_name: 'DevOps Engineer',
    grade: 1,
    grade_name: 'Middle',
    salary_from: '250000',
    salary_to: '350000',
    salary_display: '250 000 - 350 000 ₽',
    location: 'Казань',
    work_format: 'офис',
    compensation: 'ДМС, спортзал',
    benefits: 'Обеды, корпоративы',
    development: 'Конференции',
    technologies: 'Kubernetes, Docker, AWS',
    domain: 'saas',
    domain_display: 'SaaS',
    date_added: '2026-01-18T09:15:00Z',
    is_active: true,
    created_at: '2026-01-18T09:15:00Z',
    updated_at: '2026-01-18T09:15:00Z',
  },
  {
    id: 4,
    type: 'vacancy',
    vacancy: 1,
    vacancy_name: 'Frontend Developer',
    grade: 3,
    grade_name: 'Lead',
    salary_from: '400000',
    salary_to: '600000',
    salary_display: '400 000 - 600 000 ₽',
    location: 'Москва',
    work_format: 'гибрид',
    compensation: 'ДМС, спортзал, парковка',
    benefits: 'Обеды, корпоративы, тимбилдинги',
    development: 'Конференции, курсы, менторинг',
    technologies: 'React, TypeScript, Next.js, GraphQL',
    domain: 'fintech',
    domain_display: 'FinTech',
    hh_vacancy_id: '11223344',
    date_added: '2026-01-17T16:45:00Z',
    is_active: false,
    created_at: '2026-01-17T16:45:00Z',
    updated_at: '2026-01-17T16:45:00Z',
  },
  {
    id: 5,
    type: 'candidate',
    vacancy: 4,
    vacancy_name: 'QA Engineer',
    grade: 1,
    grade_name: 'Junior',
    salary_from: '120000',
    salary_to: '180000',
    salary_display: '120 000 - 180 000 ₽',
    location: 'Новосибирск',
    work_format: 'удаленка',
    compensation: 'ДМС',
    benefits: 'Обеды',
    development: 'Курсы',
    technologies: 'Selenium, Python, Postman',
    domain: 'gaming',
    domain_display: 'Gaming',
    date_added: '2026-01-16T11:20:00Z',
    is_active: true,
    created_at: '2026-01-16T11:20:00Z',
    updated_at: '2026-01-16T11:20:00Z',
  },
]

const MOCK_STATS: BenchmarkStats = {
  total_benchmarks: 5,
  active_benchmarks: 4,
  type_stats: [
    { type: 'candidate', count: 3, avg_salary_from: '190000', avg_salary_to: '276667' },
    { type: 'vacancy', count: 2, avg_salary_from: '350000', avg_salary_to: '525000' },
  ],
  grade_stats: [
    { grade__name: 'Middle', count: 2, avg_salary_from: '225000', avg_salary_to: '325000' },
    { grade__name: 'Senior', count: 1, avg_salary_from: '300000', avg_salary_to: '450000' },
    { grade__name: 'Lead', count: 1, avg_salary_from: '400000', avg_salary_to: '600000' },
    { grade__name: 'Junior', count: 1, avg_salary_from: '120000', avg_salary_to: '180000' },
  ],
}

const MOCK_SETTINGS: BenchmarkSettings = {
  id: 1,
  vacancy_fields: ['work_format', 'compensation', 'benefits', 'development', 'technologies', 'domain'],
  candidate_fields: ['work_format', 'compensation', 'benefits'],
}

const MOCK_GRADES: Grade[] = [
  { id: 1, name: 'Junior' },
  { id: 2, name: 'Middle' },
  { id: 3, name: 'Senior' },
  { id: 4, name: 'Lead' },
  { id: 5, name: 'Principal' },
]

const MOCK_VACANCIES: Vacancy[] = [
  { id: 1, name: 'Frontend Developer', title: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer', title: 'Backend Developer' },
  { id: 3, name: 'DevOps Engineer', title: 'DevOps Engineer' },
  { id: 4, name: 'QA Engineer', title: 'QA Engineer' },
  { id: 5, name: 'Project Manager', title: 'Project Manager' },
]

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [stats, setStats] = useState<BenchmarkStats | null>(null)
  const [settings, setSettings] = useState<BenchmarkSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [vacancyFilter, setVacancyFilter] = useState<string>('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [grades, setGrades] = useState<Grade[]>([])
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    work_format: false,
    compensation: false,
    benefits: false,
    development: false,
    technologies: false,
    domain: false,
  })

  const loadBenchmarks = async () => {
    setLoading(true)
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Фильтрация моковых данных
      let filteredBenchmarks = [...MOCK_BENCHMARKS]
      
      // Фильтр по поиску
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredBenchmarks = filteredBenchmarks.filter(b => 
          b.vacancy_name?.toLowerCase().includes(query) ||
          b.grade_name?.toLowerCase().includes(query) ||
          b.location?.toLowerCase().includes(query) ||
          b.technologies?.toLowerCase().includes(query)
        )
      }
      
      // Фильтр по типу
      if (typeFilter) {
        filteredBenchmarks = filteredBenchmarks.filter(b => b.type === typeFilter)
      }
      
      // Фильтр по вакансии
      if (vacancyFilter) {
        filteredBenchmarks = filteredBenchmarks.filter(b => b.vacancy === parseInt(vacancyFilter))
      }
      
      // Фильтр по грейду
      if (gradeFilter) {
        filteredBenchmarks = filteredBenchmarks.filter(b => b.grade === parseInt(gradeFilter))
      }
      
      // Фильтр по статусу
      if (statusFilter === 'true') {
        filteredBenchmarks = filteredBenchmarks.filter(b => b.is_active === true)
      } else if (statusFilter === 'false') {
        filteredBenchmarks = filteredBenchmarks.filter(b => b.is_active === false)
      }
      
      // Пагинация
      const pageSize = 15
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedBenchmarks = filteredBenchmarks.slice(startIndex, endIndex)
      
      setBenchmarks(paginatedBenchmarks)
      setTotalCount(filteredBenchmarks.length)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const params: any = {
        page,
        page_size: 15,
      }
      if (searchQuery) params.search = searchQuery
      if (typeFilter) params.type = typeFilter
      if (vacancyFilter) params.vacancy = parseInt(vacancyFilter)
      if (gradeFilter) params.grade = parseInt(gradeFilter)
      if (statusFilter === 'true') params.is_active = true
      if (statusFilter === 'false') params.is_active = false

      const response = await benchmarksApi.getAll(params)
      if (response.data) {
        setBenchmarks(response.data.results || [])
        setTotalCount(response.data.count || 0)
      } else if (response.error) {
        console.error('Ошибка загрузки бенчмарков:', response.error)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке бенчмарков:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setStats(MOCK_STATS)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await benchmarksApi.getStats()
      if (response.data) {
        setStats(response.data)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error)
    }
  }

  const loadSettings = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setSettings(MOCK_SETTINGS)
      
      // Инициализируем видимость полей на основе настроек
      const enabledFields = MOCK_SETTINGS.vacancy_fields || []
      const initialVisibility: Record<string, boolean> = {}
      enabledFields.forEach((field: string) => {
        initialVisibility[field] = false
      })
      setVisibleFields(initialVisibility)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await benchmarksApi.getSettings()
      if (response.data) {
        setSettings(response.data)
        const enabledFields = response.data.vacancy_fields || []
        const initialVisibility: Record<string, boolean> = {}
        enabledFields.forEach((field: string) => {
          initialVisibility[field] = false
        })
        setVisibleFields(initialVisibility)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error)
    }
  }

  const loadGrades = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setGrades(MOCK_GRADES)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await gradesApi.getAll()
      if (response.data) {
        setGrades(response.data)
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке грейдов:', error)
    }
  }

  const loadVacancies = async () => {
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setVacancies(MOCK_VACANCIES)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await vacanciesApi.getAll()
      if (response.data) {
        setVacancies(response.data.map(v => ({
          id: v.id,
          name: v.name || v.title || `Вакансия ${v.id}`
        })))
      }
      */
    } catch (error) {
      console.error('Ошибка при загрузке вакансий:', error)
    }
  }

  useEffect(() => {
    loadBenchmarks()
    loadStats()
    loadSettings()
    loadGrades()
    loadVacancies()
  }, [page])

  useEffect(() => {
    loadBenchmarks()
  }, [searchQuery, typeFilter, vacancyFilter, gradeFilter, statusFilter])

  const handleSearch = () => {
    setPage(1)
    loadBenchmarks()
  }

  const handleReset = () => {
    setSearchQuery('')
    setTypeFilter('')
    setVacancyFilter('')
    setGradeFilter('')
    setStatusFilter('')
    setPage(1)
    setTimeout(() => {
      loadBenchmarks()
    }, 100)
  }

  const toggleFieldVisibility = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getTypeBadgeColor = (type: string) => {
    return type === 'candidate' ? 'green' : 'blue'
  }

  const getTypeLabel = (type: string) => {
    return type === 'candidate' ? 'Кандидат' : 'Вакансия'
  }

  const getWorkFormatBadge = (workFormat: string | null | undefined) => {
    if (!workFormat) return <Text size="2" color="gray">—</Text>
    const formatMap: Record<string, { label: string; color: string }> = {
      'офис': { label: 'Офис', color: 'blue' },
      'гибрид': { label: 'Гибрид', color: 'green' },
      'удаленка': { label: 'Удаленка', color: 'orange' },
      'all world': { label: 'All World', color: 'purple' },
    }
    const format = formatMap[workFormat] || { label: workFormat, color: 'gray' }
    return <Badge color={format.color as any}>{format.label}</Badge>
  }

  const totalPages = Math.ceil(totalCount / 15)
  const pageNumbers = []
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i)
  }

  const enabledFields = settings?.vacancy_fields || []

  return (
    <AppLayout pageTitle="Бенчмарки зарплат">
      <Box className={styles.container}>
        <Flex direction="column" gap="4">
          {/* Заголовок */}
          <Flex justify="between" align="center">
            <Box>
              <Text size="6" weight="bold">Бенчмарки зарплат</Text>
              <Text size="2" color="gray" mt="1">
                Анализ рынка зарплат по вакансиям и грейдам
              </Text>
            </Box>
            <Button size="3" onClick={() => {}}>
              <PlusIcon width={16} height={16} />
              Добавить бенчмарк
            </Button>
          </Flex>

          {/* Статистика */}
          {stats && (
            <Flex gap="3" className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <Text size="2" color="gray">Всего бенчмарков</Text>
                <Text size="6" weight="bold" mt="2" style={{ color: 'var(--accent-9)' }}>
                  {stats.total_benchmarks}
                </Text>
              </Card>
              <Card className={styles.statCard}>
                <Text size="2" color="gray">Кандидаты</Text>
                <Text size="6" weight="bold" mt="2" style={{ color: 'var(--gray-9)' }}>
                  {stats.type_stats.find(s => s.type === 'candidate')?.count || 0}
                </Text>
              </Card>
              <Card className={styles.statCard}>
                <Text size="2" color="gray">Вакансии</Text>
                <Text size="6" weight="bold" mt="2" style={{ color: 'var(--accent-9)' }}>
                  {stats.type_stats.find(s => s.type === 'vacancy')?.count || 0}
                </Text>
              </Card>
            </Flex>
          )}

          {/* Фильтры */}
          <Card className={styles.filtersCard}>
            <Flex direction="column" gap="3">
              <Flex gap="3" align="center" wrap="wrap">
                <Box style={{ flex: 1, minWidth: '200px' }}>
                  <TextField.Root
                    placeholder="Поиск по вакансии, грейду, локации..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
                <Select.Root value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Тип" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все типы</Select.Item>
                    <Select.Item value="candidate">Кандидат</Select.Item>
                    <Select.Item value="vacancy">Вакансия</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={vacancyFilter || 'all'} onValueChange={(value) => setVacancyFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Вакансия" style={{ minWidth: '150px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все вакансии</Select.Item>
                    {vacancies.map(v => (
                      <Select.Item key={v.id} value={v.id.toString()}>{v.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={gradeFilter || 'all'} onValueChange={(value) => setGradeFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Грейд" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все грейды</Select.Item>
                    {grades.map(g => (
                      <Select.Item key={g.id} value={g.id.toString()}>{g.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                  <Select.Trigger placeholder="Статус" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="all">Все</Select.Item>
                    <Select.Item value="true">Активные</Select.Item>
                    <Select.Item value="false">Неактивные</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Button onClick={handleSearch}>
                  <MagnifyingGlassIcon width={16} height={16} />
                  Поиск
                </Button>
                <Button variant="soft" onClick={handleReset}>
                  <ReloadIcon width={16} height={16} />
                  Сброс
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* Дополнительные поля */}
          {enabledFields.length > 0 && (
            <Box className={styles.additionalFields}>
              <Text size="2" color="gray" mr="3">Дополнительные поля:</Text>
              <Flex gap="2" wrap="wrap">
                {enabledFields.map((field: string) => (
                  <Button
                    key={field}
                    size="1"
                    variant={visibleFields[field] ? 'solid' : 'soft'}
                    onClick={() => toggleFieldVisibility(field)}
                    className={styles.fieldToggle}
                  >
                    {field === 'work_format' && 'Формат работы'}
                    {field === 'compensation' && 'Компенсации'}
                    {field === 'benefits' && 'Бенефиты'}
                    {field === 'development' && 'Развитие'}
                    {field === 'technologies' && 'Технологии'}
                    {field === 'domain' && 'Домен'}
                  </Button>
                ))}
              </Flex>
            </Box>
          )}

          {/* Таблица бенчмарков */}
          <Card>
            {loading ? (
              <Box p="6" style={{ textAlign: 'center' }}>
                <Text color="gray">Загрузка...</Text>
              </Box>
            ) : benchmarks.length === 0 ? (
              <Box p="6" style={{ textAlign: 'center' }}>
                <Text color="gray" size="3">Бенчмарки не найдены</Text>
                <Text color="gray" size="2" mt="2">
                  Попробуйте изменить фильтры или добавьте первый бенчмарк
                </Text>
              </Box>
            ) : (
              <Box className={styles.tableContainer}>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Сумма</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Локация</Table.ColumnHeaderCell>
                      {visibleFields.work_format && enabledFields.includes('work_format') && (
                        <Table.ColumnHeaderCell>Формат работы</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.compensation && enabledFields.includes('compensation') && (
                        <Table.ColumnHeaderCell>Компенсации</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.benefits && enabledFields.includes('benefits') && (
                        <Table.ColumnHeaderCell>Бенефиты</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.development && enabledFields.includes('development') && (
                        <Table.ColumnHeaderCell>Развитие</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.technologies && enabledFields.includes('technologies') && (
                        <Table.ColumnHeaderCell>Технологии</Table.ColumnHeaderCell>
                      )}
                      {visibleFields.domain && enabledFields.includes('domain') && (
                        <Table.ColumnHeaderCell>Домен</Table.ColumnHeaderCell>
                      )}
                      <Table.ColumnHeaderCell>Дата</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {benchmarks.map((benchmark) => (
                      <Table.Row key={benchmark.id}>
                        <Table.Cell>
                          <Badge color={getTypeBadgeColor(benchmark.type)}>
                            <BackpackIcon width={12} height={12} style={{ marginRight: 4 }} />
                            {getTypeLabel(benchmark.type)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text weight="medium">{benchmark.vacancy_name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge>{benchmark.grade_name}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{benchmark.salary_display}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="1">
                            <SewingPinFilledIcon width={12} height={12} />
                            <Text size="2">{benchmark.location}</Text>
                          </Flex>
                        </Table.Cell>
                        {visibleFields.work_format && enabledFields.includes('work_format') && (
                          <Table.Cell>
                            {getWorkFormatBadge(benchmark.work_format)}
                          </Table.Cell>
                        )}
                        {visibleFields.compensation && enabledFields.includes('compensation') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.compensation || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.benefits && enabledFields.includes('benefits') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.benefits || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.development && enabledFields.includes('development') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.development || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.technologies && enabledFields.includes('technologies') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.technologies || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        {visibleFields.domain && enabledFields.includes('domain') && (
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {benchmark.domain_display || benchmark.domain || '—'}
                            </Text>
                          </Table.Cell>
                        )}
                        <Table.Cell>
                          <Flex align="center" gap="1">
                            <CalendarIcon width={12} height={12} />
                            <Text size="2" color="gray">
                              {new Date(benchmark.date_added).toLocaleDateString('ru-RU')}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={benchmark.is_active ? 'green' : 'gray'}>
                            {benchmark.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="1">
                            {benchmark.hh_vacancy_id && (
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => window.open(`https://hh.ru/vacancy/${benchmark.hh_vacancy_id}`, '_blank')}
                                title="Открыть на hh.ru"
                              >
                                <ExternalLinkIcon width={14} height={14} />
                              </Button>
                            )}
                            <Button size="1" variant="soft" title="Просмотр">
                              <EyeOpenIcon width={14} height={14} />
                            </Button>
                            <Button size="1" variant="soft" title="Редактировать">
                              <Pencil2Icon width={14} height={14} />
                            </Button>
                            <Button size="1" variant="soft" color="red" title="Удалить">
                              <TrashIcon width={14} height={14} />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Card>

          {/* Пагинация */}
          {totalPages > 1 && (
            <Flex justify="center" align="center" className={styles.pagination}>
              <Button
                variant="soft"
                size="2"
                disabled={page === 1}
                onClick={() => setPage(1)}
                style={{ borderRadius: '6px 0 0 6px' }}
              >
                Первая
              </Button>
              <Button
                variant="soft"
                size="2"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{ borderRadius: 0, borderLeft: '1px solid var(--gray-6)' }}
              >
                Предыдущая
              </Button>
              {pageNumbers.map((num) => (
                <Button
                  key={num}
                  variant={num === page ? 'solid' : 'soft'}
                  size="2"
                  onClick={() => setPage(num)}
                  style={{
                    borderRadius: 0,
                    borderLeft: '1px solid var(--gray-6)',
                    minWidth: '40px'
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="soft"
                size="2"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{ borderRadius: 0, borderLeft: '1px solid var(--gray-6)' }}
              >
                Следующая
              </Button>
              <Button
                variant="soft"
                size="2"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                style={{ borderRadius: '0 6px 6px 0', borderLeft: '1px solid var(--gray-6)' }}
              >
                Последняя
              </Button>
            </Flex>
          )}
        </Flex>
      </Box>
    </AppLayout>
  )
}
