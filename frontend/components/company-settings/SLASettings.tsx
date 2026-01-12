'use client'

import { Box, Flex, Text, Button, Card, Table, Select, Callout } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { ClockIcon, CheckIcon, ArrowLeftIcon, MagnifyingGlassIcon, Cross2Icon, Pencil1Icon, DownloadIcon, UploadIcon, InfoCircledIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import SLAEditModal from "./SLAEditModal"
import styles from './SLASettings.module.css'

interface SLA {
  id: string
  vacancy: string
  grade: string
  timeToOffer: number // дни
  timeToHire: number // дни
  status: 'active' | 'inactive'
  createdAt: string
}

// Моковые данные SLA
const mockSLAs: SLA[] = [
  {
    id: '1',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Head',
    timeToOffer: 90,
    timeToHire: 120,
    status: 'active',
    createdAt: '24.10.2025'
  },
  {
    id: '2',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Junior',
    timeToOffer: 24,
    timeToHire: 30,
    status: 'active',
    createdAt: '24.10.2025'
  },
  {
    id: '3',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Junior+',
    timeToOffer: 30,
    timeToHire: 38,
    status: 'active',
    createdAt: '24.10.2025'
  },
  {
    id: '4',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Lead',
    timeToOffer: 80,
    timeToHire: 100,
    status: 'active',
    createdAt: '24.10.2025'
  },
  {
    id: '5',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Middle',
    timeToOffer: 35,
    timeToHire: 45,
    status: 'active',
    createdAt: '23.10.2025'
  },
  {
    id: '6',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Senior',
    timeToOffer: 50,
    timeToHire: 65,
    status: 'active',
    createdAt: '23.10.2025'
  },
  {
    id: '7',
    vacancy: 'DevOps Engineer',
    grade: 'Middle+',
    timeToOffer: 40,
    timeToHire: 55,
    status: 'active',
    createdAt: '22.10.2025'
  },
  {
    id: '8',
    vacancy: 'QA Engineer',
    grade: 'Junior',
    timeToOffer: 20,
    timeToHire: 28,
    status: 'active',
    createdAt: '21.10.2025'
  },
  {
    id: '9',
    vacancy: 'QA Engineer',
    grade: 'Middle',
    timeToOffer: 30,
    timeToHire: 40,
    status: 'active',
    createdAt: '21.10.2025'
  },
  {
    id: '10',
    vacancy: 'QA Engineer',
    grade: 'Senior',
    timeToOffer: 45,
    timeToHire: 60,
    status: 'active',
    createdAt: '20.10.2025'
  },
  {
    id: '11',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Middle',
    timeToOffer: 40,
    timeToHire: 50,
    status: 'active',
    createdAt: '20.10.2025'
  },
  {
    id: '12',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Middle+',
    timeToOffer: 50,
    timeToHire: 65,
    status: 'active',
    createdAt: '19.10.2025'
  },
  {
    id: '13',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Senior',
    timeToOffer: 60,
    timeToHire: 80,
    status: 'active',
    createdAt: '19.10.2025'
  },
  {
    id: '14',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Junior',
    timeToOffer: 25,
    timeToHire: 35,
    status: 'active',
    createdAt: '18.10.2025'
  },
  {
    id: '15',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Junior+',
    timeToOffer: 30,
    timeToHire: 40,
    status: 'active',
    createdAt: '18.10.2025'
  },
  {
    id: '16',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Middle+',
    timeToOffer: 45,
    timeToHire: 60,
    status: 'active',
    createdAt: '17.10.2025'
  },
  {
    id: '17',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Lead',
    timeToOffer: 70,
    timeToHire: 90,
    status: 'active',
    createdAt: '17.10.2025'
  },
  {
    id: '18',
    vacancy: 'DevOps Engineer',
    grade: 'Junior',
    timeToOffer: 28,
    timeToHire: 38,
    status: 'active',
    createdAt: '16.10.2025'
  },
  {
    id: '19',
    vacancy: 'DevOps Engineer',
    grade: 'Senior',
    timeToOffer: 55,
    timeToHire: 75,
    status: 'active',
    createdAt: '16.10.2025'
  },
  {
    id: '20',
    vacancy: 'DevOps Engineer',
    grade: 'Lead',
    timeToOffer: 75,
    timeToHire: 100,
    status: 'active',
    createdAt: '15.10.2025'
  },
  {
    id: '21',
    vacancy: 'Backend Engineer (Python)',
    grade: 'Junior',
    timeToOffer: 22,
    timeToHire: 30,
    status: 'active',
    createdAt: '15.10.2025'
  },
  {
    id: '22',
    vacancy: 'Backend Engineer (Python)',
    grade: 'Middle',
    timeToOffer: 35,
    timeToHire: 45,
    status: 'active',
    createdAt: '14.10.2025'
  },
  {
    id: '23',
    vacancy: 'Backend Engineer (Python)',
    grade: 'Senior',
    timeToOffer: 55,
    timeToHire: 70,
    status: 'active',
    createdAt: '14.10.2025'
  },
  {
    id: '24',
    vacancy: 'Backend Engineer (Python)',
    grade: 'Lead',
    timeToOffer: 75,
    timeToHire: 95,
    status: 'active',
    createdAt: '13.10.2025'
  },
  {
    id: '25',
    vacancy: 'Mobile Developer (iOS)',
    grade: 'Middle',
    timeToOffer: 38,
    timeToHire: 50,
    status: 'active',
    createdAt: '13.10.2025'
  },
  {
    id: '26',
    vacancy: 'Mobile Developer (iOS)',
    grade: 'Senior',
    timeToOffer: 52,
    timeToHire: 68,
    status: 'active',
    createdAt: '12.10.2025'
  },
  {
    id: '27',
    vacancy: 'Mobile Developer (Android)',
    grade: 'Middle',
    timeToOffer: 36,
    timeToHire: 48,
    status: 'active',
    createdAt: '12.10.2025'
  },
  {
    id: '28',
    vacancy: 'Mobile Developer (Android)',
    grade: 'Senior',
    timeToOffer: 50,
    timeToHire: 65,
    status: 'active',
    createdAt: '11.10.2025'
  },
  {
    id: '29',
    vacancy: 'Data Engineer',
    grade: 'Middle',
    timeToOffer: 42,
    timeToHire: 58,
    status: 'active',
    createdAt: '11.10.2025'
  },
  {
    id: '30',
    vacancy: 'Data Engineer',
    grade: 'Senior',
    timeToOffer: 60,
    timeToHire: 80,
    status: 'active',
    createdAt: '10.10.2025'
  },
  {
    id: '31',
    vacancy: 'Data Engineer',
    grade: 'Lead',
    timeToOffer: 80,
    timeToHire: 110,
    status: 'active',
    createdAt: '10.10.2025'
  },
  {
    id: '32',
    vacancy: 'Security Engineer',
    grade: 'Middle',
    timeToOffer: 45,
    timeToHire: 60,
    status: 'active',
    createdAt: '09.10.2025'
  },
  {
    id: '33',
    vacancy: 'Security Engineer',
    grade: 'Senior',
    timeToOffer: 65,
    timeToHire: 85,
    status: 'active',
    createdAt: '09.10.2025'
  },
  {
    id: '34',
    vacancy: 'Backend Engineer (Java)',
    grade: 'Head',
    timeToOffer: 90,
    timeToHire: 120,
    status: 'inactive',
    createdAt: '08.10.2025'
  },
  {
    id: '35',
    vacancy: 'Frontend Engineer (React)',
    grade: 'Junior',
    timeToOffer: 25,
    timeToHire: 35,
    status: 'inactive',
    createdAt: '08.10.2025'
  },
  {
    id: '36',
    vacancy: 'QA Engineer',
    grade: 'Lead',
    timeToOffer: 55,
    timeToHire: 75,
    status: 'active',
    createdAt: '07.10.2025'
  },
  {
    id: '37',
    vacancy: 'Backend Engineer (Python)',
    grade: 'Head',
    timeToOffer: 85,
    timeToHire: 115,
    status: 'active',
    createdAt: '07.10.2025'
  },
  {
    id: '38',
    vacancy: 'DevOps Engineer',
    grade: 'Head',
    timeToOffer: 88,
    timeToHire: 118,
    status: 'active',
    createdAt: '06.10.2025'
  }
]

// Моковые данные для фильтров
const mockVacancies = ['Все вакансии', 'Backend Engineer (Java)', 'Frontend Engineer (React)', 'DevOps Engineer']
const mockGrades = ['Все грейды', 'Head', 'Junior', 'Junior+', 'Middle', 'Middle+', 'Senior', 'Lead']

export default function SLASettings() {
  const router = useRouter()
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [selectedVacancy, setSelectedVacancy] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null)
  const [slas, setSlas] = useState<SLA[]>(mockSLAs)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Фильтрация SLA
  const filteredSLAs = slas.filter(sla => {
    const matchesVacancy = selectedVacancy === 'all' || sla.vacancy === selectedVacancy
    const matchesGrade = selectedGrade === 'all' || sla.grade === selectedGrade
    const matchesStatus = selectedStatus === 'all' || sla.status === selectedStatus
    return matchesVacancy && matchesGrade && matchesStatus
  })

  // Пагинация
  const totalPages = Math.ceil(filteredSLAs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSLAs = filteredSLAs.slice(startIndex, endIndex)

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedVacancy, selectedGrade, selectedStatus])

  // Вычисление метрик
  const totalSLAs = slas.length
  const activeSLAs = slas.filter(s => s.status === 'active').length
  const possibleSLAs = 15 // Моковое значение
  const coverage = possibleSLAs > 0 ? ((totalSLAs / possibleSLAs) * 100).toFixed(1) : '0'
  const allSLAsCreated = totalSLAs >= possibleSLAs

  const handleEdit = (sla: SLA) => {
    setSelectedSLA(sla)
    setIsEditModalOpen(true)
  }

  const handleSaveSLA = (updatedSLA: SLA) => {
    setSlas(prev => prev.map(s => s.id === updatedSLA.id ? updatedSLA : s))
  }

  return (
    <Box className={styles.container}>
      {/* Заголовок с кнопками */}
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <ClockIcon width={24} height={24} />
          <Text size="6" weight="bold">SLA для вакансий</Text>
        </Flex>
        <Flex gap="3">
          <Button 
            variant="soft" 
            color={allSLAsCreated ? 'green' : 'gray'}
            size="2"
          >
            <CheckIcon width={16} height={16} />
            Все SLA созданы
          </Button>
          <Button 
            variant="soft" 
            color="pink"
            size="2"
            onClick={() => router.push('/hiring-requests')}
          >
            <ArrowLeftIcon width={20} height={20} />
            К заявкам
          </Button>
        </Flex>
      </Flex>

      {/* Информационный баннер */}
      <Callout.Root color="blue" mb="4">
        <Callout.Icon>
          <InfoCircledIcon width={16} height={16} />
        </Callout.Icon>
        <Callout.Text>
          SLA (Service Level Agreement) определяет целевые сроки для закрытия вакансии конкретного грейда. 
          При создании заявки SLA автоматически подтягивается по паре Вакансия + Грейд.
        </Callout.Text>
      </Callout.Root>

      {/* Метрики */}
      <Flex gap="4" mb="4">
        <Card className={styles.metricCard} style={{ flex: 1 }}>
          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
            Покрытие SLA
          </Text>
          <Flex align="center" gap="3">
            <Text size="5" weight="bold">{coverage}%</Text>
            <Box style={{ flex: 1, background: 'var(--gray-4)', borderRadius: '4px', height: '8px', position: 'relative', overflow: 'hidden' }}>
              <Box 
                style={{ 
                  background: 'var(--accent-9)', 
                  height: '100%', 
                  width: `${Math.min(parseFloat(coverage), 100)}%`,
                  borderRadius: '4px'
                }} 
              />
            </Box>
          </Flex>
          <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
            {totalSLAs} из {possibleSLAs} возможных SLA
          </Text>
        </Card>

        <Card className={styles.metricCard} style={{ flex: 1 }}>
          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
            Статус системы
          </Text>
          <Flex gap="2">
            <Button 
              size="2" 
              variant="soft"
              onClick={() => {
                // TODO: Реализовать импорт Excel
                alert('Импорт Excel будет реализован')
              }}
            >
              <UploadIcon width={16} height={16} />
              Импорт Excel
            </Button>
            <Button 
              size="2" 
              variant="soft"
              onClick={() => {
                // TODO: Реализовать экспорт Excel
                alert('Экспорт Excel будет реализован')
              }}
            >
              <DownloadIcon width={16} height={16} />
              Экспорт Excel
            </Button>
          </Flex>
        </Card>
      </Flex>

      {/* Фильтры */}
      <Card className={styles.card} mb="4">
        <Flex justify="between" align="center" mb="3">
          <Text size="4" weight="bold">Фильтры</Text>
          <Button
            variant="ghost"
            size="1"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            {isFiltersOpen ? 'Свернуть' : 'Развернуть'}
          </Button>
        </Flex>

        {isFiltersOpen && (
          <Flex direction="column" gap="3">
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Вакансия
                </Text>
                <Select.Root value={selectedVacancy} onValueChange={setSelectedVacancy}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все вакансии</Select.Item>
                    {mockVacancies.filter(v => v !== 'Все вакансии').map(vacancy => (
                      <Select.Item key={vacancy} value={vacancy}>{vacancy}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Грейд
                </Text>
                <Select.Root value={selectedGrade} onValueChange={setSelectedGrade}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все грейды</Select.Item>
                    {mockGrades.filter(g => g !== 'Все грейды').map(grade => (
                      <Select.Item key={grade} value={grade}>{grade}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Статус
                </Text>
                <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="all">Все статусы</Select.Item>
                    <Select.Item value="active">Активен</Select.Item>
                    <Select.Item value="inactive">Неактивен</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Flex gap="3">
              <Button size="3" variant="solid" className={styles.applyButton}>
                <MagnifyingGlassIcon width={16} height={16} />
                Применить фильтры
              </Button>
              <Button size="3" variant="soft" onClick={() => {
                setSelectedVacancy('all')
                setSelectedGrade('all')
                setSelectedStatus('all')
              }}>
                <Cross2Icon width={16} height={16} />
                Сбросить
              </Button>
            </Flex>
          </Flex>
        )}
      </Card>

      {/* Таблица SLA */}
      <Card className={styles.card}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Time-to-Offer</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Time-to-Hire</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Создано</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedSLAs.map(sla => (
              <Table.Row key={sla.id}>
                <Table.Cell>
                  <Text size="2" weight="medium">{sla.vacancy}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.gradeTag}>
                    <Text size="1" weight="medium">{sla.grade}</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.timeTag}>
                    <Text size="1" weight="medium">{sla.timeToOffer} дней</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={styles.timeTag}>
                    <Text size="1" weight="medium">{sla.timeToHire} дней</Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Box className={`${styles.statusTag} ${sla.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    <Text size="1" weight="bold">
                      {sla.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Text>
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" color="gray">{sla.createdAt}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    variant="ghost"
                    size="1"
                    className={styles.actionButton}
                    onClick={() => handleEdit(sla)}
                  >
                    <Pencil1Icon width={14} height={14} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap="0" mt="4" className={styles.pagination}>
          <Button
            variant="soft"
            size="2"
            className={styles.paginationButton}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            <DoubleArrowLeftIcon width={16} height={16} />
          </Button>
          <Button
            variant="soft"
            size="2"
            className={styles.paginationButton}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeftIcon width={16} height={16} />
          </Button>
          <Box className={styles.paginationPageInfo}>
            <Text size="2" weight="medium" style={{ color: '#ffffff' }}>
              Страница {currentPage} из {totalPages}
            </Text>
          </Box>
          <Button
            variant="soft"
            size="2"
            className={styles.paginationButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            <ChevronRightIcon width={16} height={16} />
          </Button>
          <Button
            variant="soft"
            size="2"
            className={styles.paginationButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            <DoubleArrowRightIcon width={16} height={16} />
          </Button>
        </Flex>
      )}

      {/* Модальное окно редактирования SLA */}
      <SLAEditModal
        sla={selectedSLA}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSLA(null)
        }}
        onSave={handleSaveSLA}
      />
    </Box>
  )
}
