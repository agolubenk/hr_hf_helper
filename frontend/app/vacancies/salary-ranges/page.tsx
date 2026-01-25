'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card, Table } from "@radix-ui/themes"
import { useState, useEffect, Suspense, useRef } from "react"
import SalaryRangesSearchFilters from "@/components/salary-ranges/SalaryRangesSearchFilters"
import SalaryRangesStats from "@/components/salary-ranges/SalaryRangesStats"
import SalaryRangeCard from "@/components/salary-ranges/SalaryRangeCard"
import SalaryRangeListItem from "@/components/salary-ranges/SalaryRangeListItem"
import CreateSalaryRangeModal from "@/components/salary-ranges/CreateSalaryRangeModal"
import SalaryRangeDetailModal from "@/components/salary-ranges/SalaryRangeDetailModal"
import { GridIcon, ListBulletIcon, HamburgerMenuIcon, PlusIcon, TableIcon, DownloadIcon, UploadIcon } from "@radix-ui/react-icons"
import { useSearchParams } from "next/navigation"
import * as XLSX from 'xlsx'
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

function SalaryRangesPageContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVacancy, setSelectedVacancy] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [salaryRanges, setSalaryRanges] = useState(mockSalaryRanges)
  const [selectedRange, setSelectedRange] = useState<typeof mockSalaryRanges[0] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Открыть модалку по ?detail=id (редирект с /vacancies/salary-ranges/[id])
  useEffect(() => {
    const detailId = searchParams.get('detail')
    if (!detailId) return
    const id = parseInt(detailId, 10)
    if (isNaN(id)) return
    const r = salaryRanges.find((x) => x.id === id)
    if (r) setSelectedRange(r)
  }, [searchParams, salaryRanges])

  const handleToggleActive = (id: number) => {
    setSalaryRanges(prev => prev.map(range =>
      range.id === id ? { ...range, isActive: !range.isActive } : range
    ))
  }

  const handleDetailSave = (
    id: number,
    data: { vacancyName: string; grade: string; salaryUsd: { min: number; max: number }; salaryByn: { min: number; max: number }; salaryPln: { min: number; max: number }; salaryEur: { min: number; max: number }; updatedAt: string }
  ) => {
    setSalaryRanges(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)))
  }

  const handleDetailDelete = (id: number) => {
    setSalaryRanges(prev => prev.filter(r => r.id !== id))
    setSelectedRange(null)
  }

  const handleExport = () => {
    const headers = ['ID', 'ID вакансии', 'Вакансия', 'Грейд', 'USD min', 'USD max', 'BYN min', 'BYN max', 'PLN min', 'PLN max', 'EUR min', 'EUR max', 'Активна', 'Обновлено']
    const rows = salaryRanges.map(r => [
      r.id,
      r.vacancyId,
      r.vacancyName,
      r.grade,
      r.salaryUsd.min,
      r.salaryUsd.max,
      r.salaryByn.min,
      r.salaryByn.max,
      r.salaryPln.min,
      r.salaryPln.max,
      r.salaryEur.min,
      r.salaryEur.max,
      r.isActive ? 'Да' : 'Нет',
      r.updatedAt,
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Вилки')
    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `зарплатные-вилки-${date}.xlsx`)
  }

  const parseBool = (v: unknown): boolean => {
    if (v === true || v === 1) return true
    if (v === false || v === 0) return false
    const s = String(v || '').toLowerCase().trim()
    if (['да', 'yes', '1', 'активна', '+', 'true'].includes(s)) return true
    if (['нет', 'no', '0', 'неактивна', '-', 'false'].includes(s)) return false
    return true
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result
        if (!data || typeof data !== 'object') return
        const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })
        if (aoa.length < 2) {
          alert('В файле нет данных')
          e.target.value = ''
          return
        }
        const rows = aoa.slice(1) as (string | number)[][]
        const toUpdate = new Map<number, Partial<typeof mockSalaryRanges[0]>>()
        const toAdd: Omit<typeof mockSalaryRanges[0], 'id'>[] = []
        const existingIds = new Set(salaryRanges.map(r => r.id))

        for (const row of rows) {
          const vacancyName = String(row[2] ?? '').trim()
          const grade = String(row[3] ?? '').trim()
          if (!vacancyName && !grade) continue

          const payload = {
            vacancyId: Math.floor(Number(row[1]) || 0),
            vacancyName,
            grade,
            salaryUsd: { min: Math.floor(Number(row[4]) || 0), max: Math.floor(Number(row[5]) || 0) },
            salaryByn: { min: Math.floor(Number(row[6]) || 0), max: Math.floor(Number(row[7]) || 0) },
            salaryPln: { min: Math.floor(Number(row[8]) || 0), max: Math.floor(Number(row[9]) || 0) },
            salaryEur: { min: Math.floor(Number(row[10]) || 0), max: Math.floor(Number(row[11]) || 0) },
            isActive: parseBool(row[12]),
            updatedAt: (row[13] ? String(row[13]) : new Date().toISOString()).trim() || new Date().toISOString(),
          }
          const idVal = row[0]
          const id = typeof idVal === 'number' && !isNaN(idVal) ? Math.floor(idVal) : 0
          if (id > 0 && existingIds.has(id)) toUpdate.set(id, payload)
          else toAdd.push(payload)
        }

        setSalaryRanges(prev => {
          let arr = prev.map(r => (toUpdate.has(r.id) ? { ...r, ...toUpdate.get(r.id)! } : r))
          const maxId = arr.length ? Math.max(...arr.map(x => x.id)) : 0
          let nextId = maxId + 1
          for (const d of toAdd) arr = [...arr, { ...d, id: nextId++ } as typeof mockSalaryRanges[0]]
          return arr
        })

        const added = toAdd.length
        const updated = toUpdate.size
        const msg = [added > 0 && `Добавлено: ${added}`, updated > 0 && `Обновлено: ${updated}`].filter(Boolean).join('. ') || 'Нет новых или изменённых строк'
        alert(msg)
      } catch (err) {
        console.error(err)
        alert('Ошибка при чтении файла')
      }
      e.target.value = ''
    }
    reader.readAsArrayBuffer(file)
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

  const formatNumber = (n: number) => new Intl.NumberFormat('ru-RU').format(n)
  const formatTableDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

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
            <Flex gap="2" align="center" wrap="wrap" style={{ justifyContent: 'flex-end' }}>
              <Button variant="soft" size="2" onClick={handleExport} title="Скачать все вилки в Excel">
                <DownloadIcon width={16} height={16} />
                <span className={styles.buttonTextDesktop}>Экспорт</span>
              </Button>
              <Button
                variant="soft"
                size="2"
                onClick={() => fileInputRef.current?.click()}
                title="Загрузить вилки из Excel"
              >
                <UploadIcon width={16} height={16} />
                <span className={styles.buttonTextDesktop}>Импорт</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleImport}
              />
              <Button size="3" className={styles.addButton} style={{ marginTop: 0, paddingTop: 0 }} onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon width={16} height={16} />
                <span className={styles.buttonTextDesktop}>Добавить вилку</span>
                <span className={styles.buttonTextMobile}>Добавить</span>
              </Button>
            </Flex>
            <Text size="1" style={{ color: 'var(--gray-10)', marginTop: '6px', paddingTop: 0 }}>
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
                title="Карточки"
              >
                <GridIcon width={16} height={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('list')}
                className={styles.viewButton}
                title="Список"
              >
                <ListBulletIcon width={16} height={16} />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('table')}
                className={styles.viewButton}
                title="Таблица"
              >
                <TableIcon width={16} height={16} />
              </Button>
            </Flex>
          </Flex>
        </Flex>

        {/* Список зарплатных вилок */}
        {viewMode === 'cards' && (
          <Box className={styles.cardsGrid}>
            {filteredRanges.map(range => (
              <SalaryRangeCard 
                key={range.id} 
                salaryRange={range}
                onClick={() => setSelectedRange(range)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </Box>
        )}
        {viewMode === 'list' && (
          <Box className={styles.listContainer}>
            {filteredRanges.map(range => (
              <SalaryRangeListItem 
                key={range.id} 
                salaryRange={range}
                onClick={() => setSelectedRange(range)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </Box>
        )}
        {viewMode === 'table' && (
          <Card className={styles.tableCard}>
            <Box style={{ overflowX: 'auto' }}>
              <Table.Root size="2">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>$ USD</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>₽ BYN</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>zł PLN</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>€ EUR</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Обновлено</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: '70px' }} />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredRanges.map(range => (
                      <Table.Row
                        key={range.id}
                        onClick={() => setSelectedRange(range)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Table.Cell>
                          <Text weight="medium">{range.vacancyName}</Text>
                        </Table.Cell>
                        <Table.Cell>{range.grade}</Table.Cell>
                        <Table.Cell>
                          {formatNumber(range.salaryUsd.min)} – {formatNumber(range.salaryUsd.max)}
                        </Table.Cell>
                        <Table.Cell>
                          {formatNumber(range.salaryByn.min)} – {formatNumber(range.salaryByn.max)}
                        </Table.Cell>
                        <Table.Cell>
                          {formatNumber(range.salaryPln.min)} – {formatNumber(range.salaryPln.max)}
                        </Table.Cell>
                        <Table.Cell>
                          {formatNumber(range.salaryEur.min)} – {formatNumber(range.salaryEur.max)}
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="1" color={range.isActive ? 'green' : 'gray'}>
                            {range.isActive ? 'Активна' : 'Неактивна'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="1" color="gray">{formatTableDate(range.updatedAt)}</Text>
                        </Table.Cell>
                        <Table.Cell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="1"
                            title={range.isActive ? 'Деактивировать' : 'Активировать'}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleToggleActive(range.id)
                            }}
                          >
                            {range.isActive ? (
                              <Box style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                                <Box style={{ width: '3px', height: '10px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
                              </Box>
                            ) : (
                              <Box style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                            )}
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card>
        )}

        {/* Модальное окно создания */}
        <CreateSalaryRangeModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSave={(data) => {
            console.log('Создание зарплатной вилки:', data)
            setIsCreateModalOpen(false)
          }}
        />

        {/* Модальное окно просмотра/редактирования вилки */}
        <SalaryRangeDetailModal
          open={!!selectedRange}
          onOpenChange={(open) => { if (!open) setSelectedRange(null) }}
          salaryRange={selectedRange}
          onToggleActive={handleToggleActive}
          onSave={handleDetailSave}
          onDelete={handleDetailDelete}
        />
      </Box>
    </AppLayout>
  )
}

export default function SalaryRangesPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Зарплатные вилки"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <SalaryRangesPageContent />
    </Suspense>
  )
}
