/**
 * HiringRequestsPage (hiring-requests/page.tsx) - Страница управления заявками на подбор
 * 
 * Назначение:
 * - Управление заявками на подбор персонала
 * - Фильтрация и поиск заявок
 * - Отображение заявок в двух режимах: таблица и блоки
 * - Создание новых заявок
 * - Импорт/экспорт заявок в Excel
 * 
 * Функциональность:
 * - RequestsSearchFilters: поиск и фильтры по рекрутеру, статусу, приоритету
 * - RequestsStats: статистика по заявкам (всего, запланировано, в процессе, отменено, закрыто)
 * - RequestsTable: таблица заявок (режим "Все")
 * - RequestListItem: элемент списка заявок (режим "Блоками")
 * - CreateRequestModal: модальное окно создания новой заявки
 * - Переключатель режима отображения: "Все" (таблица) / "Блоками" (группировка по названию)
 * - Группировка заявок по названию вакансии в режиме "Блоками"
 * - Импорт/экспорт Excel через выпадающее меню
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации к детальной странице заявки или редактированию
 * - Компоненты заявок: RequestsSearchFilters, RequestsStats, RequestsTable, RequestListItem, CreateRequestModal
 * 
 * Поведение:
 * - При загрузке отображает все заявки
 * - Фильтрует заявки по поисковому запросу, рекрутеру, статусу и приоритету
 * - В режиме "Блоками" группирует заявки с одинаковым названием вакансии
 * - При клике на заявку происходит переход на детальную страницу
 * - При клике на редактирование происходит переход на страницу редактирования
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, SegmentedControl, DropdownMenu } from "@radix-ui/themes"
import { useState } from "react"
import RequestsSearchFilters from "@/components/requests/RequestsSearchFilters"
import RequestsStats from "@/components/requests/RequestsStats"
import RequestListItem from "@/components/requests/RequestListItem"
import RequestsTable from "@/components/requests/RequestsTable"
import CreateRequestModal from "@/components/requests/CreateRequestModal"
import { HamburgerMenuIcon, DownloadIcon, UploadIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import styles from './hiring-requests.module.css'

/**
 * mockRequests - моковые данные заявок на подбор
 * 
 * Структура заявки:
 * - id: уникальный идентификатор заявки
 * - title: название вакансии
 * - grade: грейд (Junior+, Middle, Middle+)
 * - project: проект (может быть null)
 * - recruiter: рекрутер, ведущий заявку
 * - recruiterDays: количество дней работы рекрутера над заявкой
 * - status: статус заявки ('planned', 'in_process', 'closed', 'cancelled')
 * - statusDate: дата изменения статуса (для закрытых/отмененных)
 * - startDate, endDate: даты начала и окончания подбора
 * - isOverdue: флаг просрочки заявки
 * - factDays: фактическое количество дней подбора
 * - slaDays: SLA по количеству дней
 * - slaStatus: статус SLA ('normal', 'risk', 'overdue', 'on_time')
 * - t2hDays: время до найма в днях (опционально)
 * - t2hSlaDays: SLA по времени до найма
 * - candidate: информация о найденном кандидате (опционально)
 * - department: отдел/департамент
 * - priority: приоритет ('high', 'medium', 'low')
 * - technologies: массив технологий
 * - candidates: количество кандидатов
 * - date: дата создания заявки
 * - hasWarning: флаг наличия предупреждения
 * 
 * TODO: Заменить на реальные данные из API
 */
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

/**
 * HiringRequestsPage - компонент страницы заявок на подбор
 * 
 * Состояние:
 * - displayMode: режим отображения ('all' - таблица, 'blocks' - блоки)
 * - searchQuery: поисковый запрос
 * - selectedRecruiter: выбранный рекрутер для фильтрации ('all' - все)
 * - selectedStatus: выбранный статус для фильтрации ('all' - все)
 * - selectedPriority: выбранный приоритет для фильтрации ('all' - все)
 * - isCreateModalOpen: флаг открытия модального окна создания заявки
 */
export default function HiringRequestsPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Режим отображения: 'all' - таблица всех заявок, 'blocks' - группировка по названию вакансии
  const [displayMode, setDisplayMode] = useState<'all' | 'blocks'>('blocks')
  // Поисковый запрос для фильтрации заявок
  const [searchQuery, setSearchQuery] = useState('')
  // Выбранный рекрутер для фильтрации ('all' - все рекрутеры)
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  // Выбранный статус для фильтрации ('all' - все статусы)
  const [selectedStatus, setSelectedStatus] = useState('all')
  // Выбранный приоритет для фильтрации ('all' - все приоритеты)
  const [selectedPriority, setSelectedPriority] = useState('all')
  // Флаг открытия модального окна создания заявки
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Вычисление статистики по заявкам
   * - totalRequests: общее количество заявок
   * - plannedRequests: количество запланированных заявок
   * - inProcessRequests: количество заявок в процессе
   * - cancelledRequests: количество отмененных заявок
   * - closedRequests: количество закрытых заявок
   * 
   * Используется для отображения в компоненте RequestsStats
   */
  const totalRequests = mockRequests.length
  const plannedRequests = mockRequests.filter(r => r.status === 'planned').length
  const inProcessRequests = mockRequests.filter(r => r.status === 'in_process').length
  const cancelledRequests = mockRequests.filter(r => r.status === 'cancelled').length
  const closedRequests = mockRequests.filter(r => r.status === 'closed').length

  /**
   * filteredRequests - отфильтрованный список заявок
   * 
   * Логика фильтрации:
   * 1. Поиск: проверяет наличие запроса в названии, ID или отделе (без учета регистра)
   * 2. Фильтр по рекрутеру: если выбран 'all' - пропускает все, иначе проверяет точное совпадение
   * 3. Фильтр по статусу: если выбран 'all' - пропускает все, иначе проверяет совпадение статуса
   * 4. Фильтр по приоритету: если выбран 'all' - пропускает все, иначе проверяет совпадение приоритета
   * 
   * Поведение:
   * - Все четыре условия должны выполняться одновременно (логическое И)
   * - Результат используется для отображения в таблице или блоках
   */
  const filteredRequests = mockRequests.filter(request => {
    // Поиск: проверяет название, ID или отдел (без учета регистра)
    const matchesSearch = !searchQuery || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toString().includes(searchQuery) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase())
    // Фильтр по рекрутеру: 'all' пропускает все, иначе проверяет точное совпадение
    const matchesRecruiter = selectedRecruiter === 'all' || request.recruiter === selectedRecruiter
    // Фильтр по статусу: 'all' пропускает все, иначе проверяет совпадение статуса
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    // Фильтр по приоритету: 'all' пропускает все, иначе проверяет совпадение приоритета
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority
    // Все четыре условия должны выполняться
    return matchesSearch && matchesRecruiter && matchesStatus && matchesPriority
  })

  /**
   * groupedRequests - объект сгруппированных заявок по названию вакансии
   * 
   * Функциональность:
   * - Группирует отфильтрованные заявки по названию вакансии (title)
   * - Используется только в режиме 'blocks'
   * - В режиме 'all' возвращает пустой объект
   * 
   * Структура:
   * - Ключ: название вакансии (например, 'Frontend Engineer (React)')
   * - Значение: массив заявок с этим названием
   * 
   * Поведение:
   * - Создает объект, где ключ - название вакансии, значение - массив заявок
   * - Используется для отображения в режиме "Блоками"
   * - Позволяет видеть все заявки на одну и ту же вакансию вместе
   */
  const groupedRequests = displayMode === 'blocks' 
    ? filteredRequests.reduce((acc, request) => {
        const key = request.title // Используем название вакансии как ключ группировки
        if (!acc[key]) {
          acc[key] = [] // Создаем массив для новой группы
        }
        acc[key].push(request) // Добавляем заявку в группу
        return acc
      }, {} as Record<string, typeof filteredRequests>)
    : {} // В режиме 'all' не группируем

  return (
    <AppLayout pageTitle="Заявки">
      <Box className={styles.requestsContainer}>
        {/* Компонент поиска и фильтров
            - searchQuery: текущий поисковый запрос
            - onSearchChange: обработчик изменения поискового запроса
            - selectedRecruiter: выбранный рекрутер
            - onRecruiterChange: обработчик изменения рекрутера
            - selectedStatus: выбранный статус
            - onStatusChange: обработчик изменения статуса
            - selectedPriority: выбранный приоритет
            - onPriorityChange: обработчик изменения приоритета */}
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

        {/* Компонент статистики по заявкам
            - total: общее количество заявок
            - planned: количество запланированных
            - inProcess: количество в процессе
            - cancelled: количество отмененных
            - closed: количество закрытых */}
        <RequestsStats
          total={totalRequests}
          planned={plannedRequests}
          inProcess={inProcessRequests}
          cancelled={cancelledRequests}
          closed={closedRequests}
        />

        {/* Заголовок секции с переключателем вида и действиями
            - Содержит название секции
            - Кнопка импорта/экспорта Excel
            - Переключатель режима отображения
            - Кнопка создания новой заявки */}
        <Flex justify="between" align="center" className={styles.sectionHeader}>
          <Flex align="center" gap="2">
            <HamburgerMenuIcon width={20} height={20} />
            <Text size="5" weight="bold">Заявки</Text>
          </Flex>
          <Flex align="center" gap="3">
            {/* Выпадающее меню импорта/экспорта Excel
                - Импорт Excel: загрузка заявок из Excel файла
                - Экспорт Excel: выгрузка заявок в Excel файл
                TODO: Реализовать импорт и экспорт */}
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

            {/* Переключатель режима отображения
                - "Все": отображает все заявки в таблице (RequestsTable)
                - "Блоками": группирует заявки по названию вакансии (RequestListItem)
                - При изменении режима перерисовывается список заявок */}
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
            
            {/* Кнопка создания новой заявки
                - При клике открывает модальное окно CreateRequestModal */}
            <Button 
              size="3" 
              className={styles.addButton}
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Добавить заявку
            </Button>
          </Flex>
        </Flex>

        {/* Условный рендеринг заявок в зависимости от режима отображения
            - displayMode === 'all': отображает все заявки в таблице (RequestsTable)
            - displayMode === 'blocks': отображает заявки, сгруппированные по названию (RequestListItem) */}
        {displayMode === 'all' ? (
          /* Режим "Все": таблица всех заявок
              - requests: отфильтрованный список заявок
              - onView: обработчик просмотра заявки (переход на детальную страницу)
              - onEdit: обработчик редактирования заявки (переход на страницу редактирования) */
          <RequestsTable 
            requests={filteredRequests}
            onView={(id) => router.push(`/hiring-requests/${id}`)}
            onEdit={(id) => router.push(`/hiring-requests/${id}/edit`)}
          />
        ) : (
          /* Режим "Блоками": группировка заявок по названию вакансии
              - Object.entries(groupedRequests): преобразует объект в массив [название, заявки]
              - Для каждой группы рендерится RequestListItem
              - request: первая заявка из группы (для отображения основной информации)
              - requests: все заявки группы
              - requestsCount: количество заявок в группе
              - onClick: переход на детальную страницу первой заявки группы */
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

        {/* Модальное окно создания заявки
            - isOpen: флаг открытия модального окна
            - onClose: обработчик закрытия модального окна
            - onSave: обработчик сохранения заявки
            TODO: Реализовать реальное сохранение через API */}
        <CreateRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(data) => {
            // TODO: Реализовать сохранение заявки
            console.log('Создание заявки:', data)
            alert('Заявка будет создана: ' + JSON.stringify(data, null, 2))
            setIsCreateModalOpen(false)
          }}
        />
      </Box>
    </AppLayout>
  )
}
