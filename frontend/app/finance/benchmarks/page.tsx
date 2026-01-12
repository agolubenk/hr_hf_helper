'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, TextField, Table, Badge, Select, Card } from "@radix-ui/themes"
import { PlusIcon, MagnifyingGlassIcon, ReloadIcon, EyeOpenIcon, Pencil2Icon, TrashIcon, ExternalLinkIcon, CalendarIcon, PinIcon, BriefcaseIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { benchmarksApi, Benchmark, BenchmarkStats, BenchmarkSettings, gradesApi, Grade, vacanciesApi, Vacancy } from "@/lib/api"
import styles from './benchmarks.module.css'

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
    } catch (error) {
      console.error('Ошибка при загрузке бенчмарков:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await benchmarksApi.getStats()
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await benchmarksApi.getSettings()
      if (response.data) {
        setSettings(response.data)
        // Инициализируем видимость полей на основе настроек
        const enabledFields = response.data.vacancy_fields || []
        const initialVisibility: Record<string, boolean> = {}
        enabledFields.forEach((field: string) => {
          initialVisibility[field] = false
        })
        setVisibleFields(initialVisibility)
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error)
    }
  }

  const loadGrades = async () => {
    try {
      const response = await gradesApi.getAll()
      if (response.data) {
        setGrades(response.data)
      }
    } catch (error) {
      console.error('Ошибка при загрузке грейдов:', error)
    }
  }

  const loadVacancies = async () => {
    try {
      const response = await vacanciesApi.getAll()
      if (response.data) {
        setVacancies(response.data.map(v => ({
          id: v.id,
          name: v.name || v.title || `Вакансия ${v.id}`
        })))
      }
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

  const getWorkFormatBadge = (workFormat: string | null) => {
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
                <Select.Root value={typeFilter} onValueChange={setTypeFilter}>
                  <Select.Trigger placeholder="Тип" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="">Все типы</Select.Item>
                    <Select.Item value="candidate">Кандидат</Select.Item>
                    <Select.Item value="vacancy">Вакансия</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={vacancyFilter} onValueChange={setVacancyFilter}>
                  <Select.Trigger placeholder="Вакансия" style={{ minWidth: '150px' }} />
                  <Select.Content>
                    <Select.Item value="">Все вакансии</Select.Item>
                    {vacancies.map(v => (
                      <Select.Item key={v.id} value={v.id.toString()}>{v.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={gradeFilter} onValueChange={setGradeFilter}>
                  <Select.Trigger placeholder="Грейд" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="">Все грейды</Select.Item>
                    {grades.map(g => (
                      <Select.Item key={g.id} value={g.id.toString()}>{g.name}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
                  <Select.Trigger placeholder="Статус" style={{ minWidth: '120px' }} />
                  <Select.Content>
                    <Select.Item value="">Все</Select.Item>
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
                            <BriefcaseIcon width={12} height={12} style={{ marginRight: 4 }} />
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
                            <PinIcon width={12} height={12} />
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
