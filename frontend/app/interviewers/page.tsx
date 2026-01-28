/**
 * InterviewersPage (interviewers/page.tsx) - Страница управления интервьюерами
 * 
 * Назначение:
 * - Управление базой интервьюеров компании
 * - Добавление, редактирование и удаление интервьюеров
 * - Активация/деактивация интервьюеров
 * - Просмотр календарей интервьюеров
 * - Поиск и фильтрация интервьюеров
 * - Пагинация списка интервьюеров
 * 
 * Функциональность:
 * - Список всех интервьюеров в таблице
 * - Поиск интервьюеров по имени, фамилии, email
 * - Пагинация с настраиваемым количеством элементов на странице
 * - Форма добавления нового интервьюера
 * - Форма редактирования интервьюера (inline в таблице)
 * - Удаление интервьюера с подтверждением
 * - Активация/деактивация интервьюера через Switch
 * - Копирование ссылки на календарь интервьюера
 * - Открытие календаря интервьюера в новой вкладке
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений (подтверждение удаления, успешное копирование)
 * - Sidebar: содержит ссылку на эту страницу в разделе "Рекрутинг"
 * - Google Calendar: ссылки на календари интервьюеров
 * 
 * Поведение:
 * - При загрузке загружает список интервьюеров
 * - При поиске фильтрует интервьюеров по введенному запросу
 * - При добавлении интервьюера показывает форму, при сохранении скрывает её
 * - При редактировании интервьюера открывает inline-редактирование в таблице
 * - При удалении показывает подтверждение через toast
 * - При копировании ссылки на календарь копирует в буфер обмена и показывает уведомление
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Table, TextField, SegmentedControl, Dialog, Card, Switch } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon, CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, PersonIcon, EnvelopeClosedIcon, CopyIcon, BarChartIcon, GearIcon, PlusIcon, ArrowLeftIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import styles from './interviewers.module.css'

/**
 * Interviewer - интерфейс интервьюера
 * 
 * Структура:
 * - id: уникальный идентификатор интервьюера
 * - firstName: имя интервьюера
 * - lastName: фамилия интервьюера
 * - middleName: отчество интервьюера (опционально)
 * - email: email интервьюера
 * - isActive: флаг активности интервьюера
 * - createdAt: дата добавления интервьюера
 * - calendarLink: ссылка на календарь интервьюера в Google Calendar (опционально)
 */
interface Interviewer {
  id: number
  firstName: string
  lastName: string
  middleName?: string
  email: string
  isActive: boolean
  createdAt: string
  calendarLink?: string
}

/**
 * mockInterviewers - моковые данные интервьюеров
 * 
 * Структура каждого интервьюера:
 * - id: уникальный идентификатор
 * - firstName, lastName, middleName: ФИО
 * - email: email интервьюера
 * - isActive: флаг активности
 * - createdAt: дата создания записи
 * - calendarLink: ссылка на Google Calendar интервьюера
 * 
 * TODO: Заменить на реальные данные из API
 */
const mockInterviewers: Interviewer[] = [
  {
    id: 1,
    firstName: 'Artur',
    lastName: 'Akimau',
    email: 'arthur.akimov@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:16',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=arthur.akimov@softnetix.io'
  },
  {
    id: 2,
    firstName: 'Yauheni',
    lastName: 'Baber',
    email: 'yauheni.baber@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:15',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=yauheni.baber@softnetix.io'
  },
  {
    id: 3,
    firstName: 'Anton',
    lastName: 'Babrou',
    email: 'anton.babrou@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:14',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=anton.babrou@softnetix.io'
  },
  {
    id: 4,
    firstName: 'Roman',
    lastName: 'Berezavik',
    email: 'roman.berezavik@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:13',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=roman.berezavik@softnetix.io'
  },
  {
    id: 5,
    firstName: 'Aleksei',
    lastName: 'Bondarenko',
    email: 'aleksei.bondarenko@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:12',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=aleksei.bondarenko@softnetix.io'
  },
  {
    id: 6,
    firstName: 'Aleh',
    lastName: 'Borykau',
    email: 'aleh.borykau@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:11',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=aleh.borykau@softnetix.io'
  },
  {
    id: 7,
    firstName: 'Uladzislau',
    lastName: 'Churyla',
    email: 'uladzislau.churyla@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:10',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=uladzislau.churyla@softnetix.io'
  },
  {
    id: 8,
    firstName: 'Anton',
    lastName: 'Dubrouski',
    email: 'anton.dubrouski@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:09',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=anton.dubrouski@softnetix.io'
  },
  {
    id: 9,
    firstName: 'Yauheni',
    lastName: 'Hamza',
    email: 'yauheni.hamza@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:08',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=yauheni.hamza@softnetix.io'
  },
  {
    id: 10,
    firstName: 'Pavel',
    lastName: 'Haponau',
    email: 'pavel.haponau@softnetix.io',
    isActive: true,
    createdAt: '17.11.2025 16:07',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=pavel.haponau@softnetix.io'
  },
  {
    id: 11,
    firstName: 'Ivan',
    lastName: 'Ivanov',
    email: 'ivan.ivanov@softnetix.io',
    isActive: true,
    createdAt: '16.11.2025 15:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=ivan.ivanov@softnetix.io'
  },
  {
    id: 12,
    firstName: 'Petr',
    lastName: 'Petrov',
    email: 'petr.petrov@softnetix.io',
    isActive: true,
    createdAt: '16.11.2025 14:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=petr.petrov@softnetix.io'
  },
  {
    id: 13,
    firstName: 'Sergey',
    lastName: 'Sidorov',
    email: 'sergey.sidorov@softnetix.io',
    isActive: false,
    createdAt: '15.11.2025 13:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=sergey.sidorov@softnetix.io'
  },
  {
    id: 14,
    firstName: 'Anna',
    lastName: 'Kozlova',
    email: 'anna.kozlova@softnetix.io',
    isActive: true,
    createdAt: '15.11.2025 12:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=anna.kozlova@softnetix.io'
  },
  {
    id: 15,
    firstName: 'Maria',
    lastName: 'Novikova',
    email: 'maria.novikova@softnetix.io',
    isActive: true,
    createdAt: '14.11.2025 11:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=maria.novikova@softnetix.io'
  },
  {
    id: 16,
    firstName: 'Dmitry',
    lastName: 'Volkov',
    email: 'dmitry.volkov@softnetix.io',
    isActive: true,
    createdAt: '14.11.2025 10:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=dmitry.volkov@softnetix.io'
  },
  {
    id: 17,
    firstName: 'Elena',
    lastName: 'Morozova',
    email: 'elena.morozova@softnetix.io',
    isActive: true,
    createdAt: '13.11.2025 09:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=elena.morozova@softnetix.io'
  },
  {
    id: 18,
    firstName: 'Alexey',
    lastName: 'Sokolov',
    email: 'alexey.sokolov@softnetix.io',
    isActive: true,
    createdAt: '13.11.2025 08:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=alexey.sokolov@softnetix.io'
  },
  {
    id: 19,
    firstName: 'Olga',
    lastName: 'Lebedeva',
    email: 'olga.lebedeva@softnetix.io',
    isActive: true,
    createdAt: '12.11.2025 17:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=olga.lebedeva@softnetix.io'
  },
  {
    id: 20,
    firstName: 'Nikolay',
    lastName: 'Kuznetsov',
    email: 'nikolay.kuznetsov@softnetix.io',
    isActive: true,
    createdAt: '12.11.2025 16:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=nikolay.kuznetsov@softnetix.io'
  },
  {
    id: 21,
    firstName: 'Tatiana',
    lastName: 'Popova',
    email: 'tatiana.popova@softnetix.io',
    isActive: true,
    createdAt: '11.11.2025 15:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=tatiana.popova@softnetix.io'
  },
  {
    id: 22,
    firstName: 'Vladimir',
    lastName: 'Fedorov',
    email: 'vladimir.fedorov@softnetix.io',
    isActive: true,
    createdAt: '11.11.2025 14:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=vladimir.fedorov@softnetix.io'
  },
  {
    id: 23,
    firstName: 'Svetlana',
    lastName: 'Mikhailova',
    email: 'svetlana.mikhailova@softnetix.io',
    isActive: true,
    createdAt: '10.11.2025 13:00',
    calendarLink: 'https://calendar.google.com/calendar/u/0?cid=svetlana.mikhailova@softnetix.io'
  }
]

export default function InterviewersPage() {
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInterviewer, setEditingInterviewer] = useState<Interviewer | null>(null)
  const [returnToViewModal, setReturnToViewModal] = useState(false)
  const itemsPerPage = 10

  /**
   * filteredInterviewers - отфильтрованный список интервьюеров
   * 
   * Логика фильтрации:
   * 1. Поиск: проверяет наличие запроса в полном имени (имя + фамилия + отчество) или email (без учета регистра)
   * 2. Фильтр по статусу: если выбран 'all' - пропускает все, иначе проверяет совпадение статуса активности
   * 
   * Поведение:
   * - Все два условия должны выполняться одновременно (логическое И)
   * - Поиск выполняется без учета регистра
   * - Результат используется для отображения в таблице и пагинации
   */
  const filteredInterviewers = mockInterviewers.filter(interviewer => {
    // Поиск: проверяет полное имя (имя + фамилия + отчество) или email (без учета регистра)
    const matchesSearch = !searchQuery || 
      `${interviewer.firstName} ${interviewer.lastName} ${interviewer.middleName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Фильтр по статусу: 'all' пропускает все, иначе проверяет совпадение статуса активности
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && interviewer.isActive) ||
      (statusFilter === 'inactive' && !interviewer.isActive)
    
    // Все два условия должны выполняться
    return matchesSearch && matchesStatus
  })

  /**
   * Пагинация отфильтрованных интервьюеров
   * 
   * Вычисляемые значения:
   * - totalPages: общее количество страниц (округление вверх)
   * - startIndex: индекс первого элемента на текущей странице
   * - endIndex: индекс последнего элемента на текущей странице (не включительно)
   * - paginatedInterviewers: массив интервьюеров для текущей страницы
   * 
   * Поведение:
   * - Используется для отображения только части интервьюеров на странице
   * - itemsPerPage = 10 (количество элементов на странице)
   * - При изменении currentPage обновляется список отображаемых интервьюеров
   */
  const totalPages = Math.ceil(filteredInterviewers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInterviewers = filteredInterviewers.slice(startIndex, endIndex)

  /**
   * Статистика по интервьюерам
   * 
   * Вычисляемые значения:
   * - totalCount: общее количество интервьюеров
   * - activeCount: количество активных интервьюеров
   * - inactiveCount: количество неактивных интервьюеров
   * 
   * Используется для:
   * - Отображения статистики в кнопках фильтров
   * - Показывает общее количество, активных и неактивных интервьюеров
   */
  const totalCount = mockInterviewers.length
  const activeCount = mockInterviewers.filter(i => i.isActive).length
  const inactiveCount = mockInterviewers.filter(i => !i.isActive).length

  /**
   * getInitials - получение инициалов интервьюера для аватара
   * 
   * Функциональность:
   * - Извлекает первую букву имени и первую букву фамилии
   * - Преобразует в верхний регистр
   * 
   * Алгоритм:
   * - Берет первый символ firstName и преобразует в верхний регистр
   * - Берет первый символ lastName и преобразует в верхний регистр
   * - Объединяет их в строку (например, "Иван Петров" → "ИП")
   * 
   * Используется для:
   * - Отображения инициалов в аватаре интервьюера
   * - Генерации placeholder для аватара, если нет фото
   * 
   * @param interviewer - объект интервьюера
   * @returns строка с инициалами (2 заглавные буквы)
   */
  const getInitials = (interviewer: Interviewer) => {
    const first = interviewer.firstName.charAt(0).toUpperCase()
    const last = interviewer.lastName.charAt(0).toUpperCase()
    return `${first}${last}`
  }

  /**
   * getFullName - получение полного имени интервьюера в формате "Фамилия Имя"
   * 
   * Функциональность:
   * - Форматирует имя интервьюера в формате "Фамилия Имя"
   * - Используется для отображения в таблице и модальных окнах
   * 
   * Формат:
   * - "Фамилия Имя" (например, "Петров Иван")
   * - Отчество не включается
   * 
   * Используется для:
   * - Отображения полного имени в таблице интервьюеров
   * - Заголовков модальных окон
   * - Сообщений об удалении
   * 
   * @param interviewer - объект интервьюера
   * @returns строка с полным именем в формате "Фамилия Имя"
   */
  const getFullName = (interviewer: Interviewer) => {
    return `${interviewer.lastName} ${interviewer.firstName}`
  }

  /**
   * getShortName - получение короткого имени интервьюера (только имя)
   * 
   * Функциональность:
   * - Возвращает только имя интервьюера (firstName)
   * - Используется для отображения под полным именем
   * 
   * Используется для:
   * - Отображения короткого имени под полным именем в таблице
   * - Вторичной информации в модальных окнах
   * 
   * @param interviewer - объект интервьюера
   * @returns строка с именем интервьюера
   */
  const getShortName = (interviewer: Interviewer) => {
    return interviewer.firstName
  }

  /**
   * handleDeleteInterviewer - обработчик удаления интервьюера
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - Предоставляет кнопки "Отмена" и "Удалить"
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления
   * - Показывает toast-уведомление с вопросом и именем интервьюера
   * - При подтверждении удаления:
   *   - Если closeModal === true - закрывает модальное окно просмотра
   *   - Очищает selectedInterviewer
   *   - TODO: Реализовать удаление через API
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * - getFullName: использует для отображения имени в сообщении
   * 
   * @param interviewer - интервьюер для удаления
   * @param closeModal - флаг закрытия модального окна после удаления (по умолчанию false)
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/interviewers/{id}/ - удаление интервьюера
   * - Обновление списка интервьюеров после удаления
   */
  const handleDeleteInterviewer = (interviewer: Interviewer, closeModal = false) => {
    toast.showWarning('Удалить интервьюера?', `Вы уверены, что хотите удалить ${getFullName(interviewer)}?`, {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            // TODO: Реализовать удаление через API
            if (closeModal) {
              setIsModalOpen(false)
              setSelectedInterviewer(null)
            }
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  return (
    <AppLayout pageTitle="Интервьюеры">
      <Box className={styles.container}>
        {/* Поиск и фильтры */}
        <Flex gap="3" align="center" wrap="wrap">
          <Card className={styles.searchCard} style={{ flex: 1 }}>
            <Flex gap="3" align="center" wrap="wrap">
              <TextField.Root
                placeholder="Поиск по имени, фамилии или email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                style={{ flex: 1, minWidth: '300px' }}
                size="2"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon width={16} height={16} />
                </TextField.Slot>
              </TextField.Root>
              
              <Button 
                size="2" 
                variant="solid"
                onClick={() => {
                  // TODO: Реализовать поиск
                }}
              >
                <MagnifyingGlassIcon width={16} height={16} />
              </Button>

              <Flex gap="2" align="center" style={{ marginLeft: 'auto' }}>
                <Button
                  size="2"
                  variant={statusFilter === 'all' ? 'solid' : 'soft'}
                  color={statusFilter === 'all' ? 'blue' : 'gray'}
                  onClick={() => {
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                >
                  Всего: {totalCount}
                </Button>
                <Button
                  size="2"
                  variant={statusFilter === 'active' ? 'solid' : 'soft'}
                  color={statusFilter === 'active' ? 'blue' : 'gray'}
                  onClick={() => {
                    setStatusFilter('active')
                    setCurrentPage(1)
                  }}
                >
                  Активных: {activeCount}
                </Button>
                <Button
                  size="2"
                  variant={statusFilter === 'inactive' ? 'solid' : 'soft'}
                  color={statusFilter === 'inactive' ? 'blue' : 'gray'}
                  onClick={() => {
                    setStatusFilter('inactive')
                    setCurrentPage(1)
                  }}
                >
                  Неактивных: {inactiveCount}
                </Button>
              </Flex>
            </Flex>
          </Card>

          <Button
            size="3"
            variant="solid"
            onClick={() => {
              setEditingInterviewer(null)
              setIsEditModalOpen(true)
            }}
          >
            <PlusIcon width={16} height={16} />
            Добавить интервьюера
          </Button>
        </Flex>

        {/* Таблица интервьюеров */}
        <Box className={styles.tableContainer}>
          <Table.Root size="2" variant="ghost">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ФИО</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Календарь</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paginatedInterviewers.map(interviewer => (
                <Table.Row key={interviewer.id}>
                  <Table.Cell>
                    <Flex 
                      align="center" 
                      gap="3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedInterviewer(interviewer)
                        setIsModalOpen(true)
                      }}
                    >
                      <Box className={styles.avatar}>
                        <Text size="2" weight="bold" style={{ color: '#ffffff' }}>
                          {getInitials(interviewer)}
                        </Text>
                      </Box>
                      <Flex direction="column" gap="1">
                        <Text size="3" weight="bold">
                          {getFullName(interviewer)}
                        </Text>
                        <Text size="1" color="gray">
                          {getShortName(interviewer)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{interviewer.email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <CalendarIcon width={16} height={16} style={{ color: 'var(--accent-9)' }} />
                      <Text 
                        size="2" 
                        style={{ 
                          color: 'var(--accent-9)', 
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (interviewer.calendarLink) {
                            window.open(interviewer.calendarLink, '_blank')
                          }
                        }}
                      >
                        Календарь
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    {interviewer.isActive ? (
                      <Flex align="center" gap="2">
                        <CheckIcon width={16} height={16} style={{ color: '#10b981' }} />
                        <Box className={styles.statusBadgeActive}>
                          <Text size="1" weight="bold" style={{ color: '#10b981' }}>
                            Активен
                          </Text>
                        </Box>
                      </Flex>
                    ) : (
                      <Box className={styles.statusBadgeInactive}>
                        <Text size="1" weight="bold" style={{ color: 'var(--gray-11)' }}>
                          Неактивен
                        </Text>
                      </Box>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button
                        variant="ghost"
                        size="1"
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingInterviewer(interviewer)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Pencil1Icon width={16} height={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="1"
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteInterviewer(interviewer, false)
                        }}
                      >
                        <TrashIcon width={16} height={16} />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

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

        {/* Модальное окно информации об интервьюере */}
        {selectedInterviewer && (
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Content style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
              <Dialog.Title>
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <PersonIcon width={20} height={20} />
                    Информация об интервьюере
                  </Flex>
                  <Flex gap="2">
                    <Button
                      size="2"
                      variant="soft"
                      color="yellow"
                      onClick={() => {
                        setEditingInterviewer(selectedInterviewer)
                        setReturnToViewModal(true)
                        setIsModalOpen(false)
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Pencil1Icon width={16} height={16} />
                      Редактировать
                    </Button>
                    {selectedInterviewer.isActive && (
                      <Button
                        size="2"
                        variant="soft"
                        color="green"
                      >
                        <CheckIcon width={16} height={16} />
                        Активен
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Dialog.Title>

              <Flex gap="4" mt="4" style={{ flexWrap: 'wrap' }}>
                {/* Основная информация */}
                <Box style={{ flex: 1, minWidth: '400px' }}>
                  <Flex direction="column" gap="4">
                    {/* Аватар и имя */}
                    <Flex direction="column" align="center" gap="3">
                      <Box className={styles.avatar} style={{ width: '80px', height: '80px' }}>
                        <Text size="4" weight="bold" style={{ color: '#ffffff' }}>
                          {getInitials(selectedInterviewer)}
                        </Text>
                      </Box>
                      <Flex direction="column" align="center" gap="1">
                        <Text size="5" weight="bold">
                          {getFullName(selectedInterviewer)}
                        </Text>
                        <Text size="2" color="gray">
                          {getShortName(selectedInterviewer)}
                        </Text>
                      </Flex>
                    </Flex>

                    {/* Детали */}
                    <Flex gap="4" wrap="wrap">
                      <Box style={{ flex: 1, minWidth: '200px' }}>
                        <Flex direction="column" gap="3">
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Имя:
                            </Text>
                            <Text size="2" weight="medium">
                              {selectedInterviewer.firstName}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Email:
                            </Text>
                            <Text 
                              size="2" 
                              weight="medium"
                              style={{ 
                                color: 'var(--accent-9)', 
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                              onClick={() => {
                                window.location.href = `mailto:${selectedInterviewer.email}`
                              }}
                            >
                              {selectedInterviewer.email}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Дата создания:
                            </Text>
                            <Text size="2" weight="medium">
                              {selectedInterviewer.createdAt}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>

                      <Box style={{ flex: 1, minWidth: '200px' }}>
                        <Flex direction="column" gap="3">
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Фамилия:
                            </Text>
                            <Text size="2" weight="medium">
                              {selectedInterviewer.lastName}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Статус:
                            </Text>
                            {selectedInterviewer.isActive ? (
                              <Flex align="center" gap="2">
                                <CheckIcon width={16} height={16} style={{ color: '#10b981' }} />
                                <Box className={styles.statusBadgeActive}>
                                  <Text size="1" weight="bold" style={{ color: '#10b981' }}>
                                    Активен
                                  </Text>
                                </Box>
                              </Flex>
                            ) : (
                              <Box className={styles.statusBadgeInactive}>
                                <Text size="1" weight="bold" style={{ color: 'var(--gray-11)' }}>
                                  Неактивен
                                </Text>
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block' }}>
                              Последнее обновление:
                            </Text>
                            <Text size="2" weight="medium">
                              {selectedInterviewer.createdAt}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    </Flex>

                    {/* Ссылка на календарь */}
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                        Ссылка на календарь:
                      </Text>
                      <Flex gap="2">
                        <TextField.Root
                          value={selectedInterviewer.calendarLink || ''}
                          readOnly
                          style={{ flex: 1 }}
                          size="2"
                        />
                        <Button
                          variant="soft"
                          size="2"
                          onClick={() => {
                            if (selectedInterviewer.calendarLink) {
                              navigator.clipboard.writeText(selectedInterviewer.calendarLink)
                              alert('Ссылка скопирована в буфер обмена')
                            }
                          }}
                        >
                          <CopyIcon width={16} height={16} />
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>

                {/* Боковая панель */}
                <Box style={{ width: '250px', flexShrink: 0 }}>
                  <Flex direction="column" gap="4">
                    {/* Действия */}
                    <Card style={{ padding: '16px' }}>
                      <Flex align="center" gap="2" mb="3">
                        <GearIcon width={16} height={16} />
                        <Text size="3" weight="bold">Действия</Text>
                      </Flex>
                      <Flex direction="column" gap="2">
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => {
                            window.location.href = `mailto:${selectedInterviewer.email}`
                          }}
                        >
                          <EnvelopeClosedIcon width={16} height={16} />
                          Написать email
                        </Button>
                        <Button
                          size="3"
                          variant="solid"
                          color="blue"
                          onClick={() => {
                            if (selectedInterviewer.calendarLink) {
                              window.open(selectedInterviewer.calendarLink, '_blank')
                            }
                          }}
                          style={{ width: '100%' }}
                        >
                          <CalendarIcon width={16} height={16} />
                          Открыть календарь
                        </Button>
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => {
                            if (selectedInterviewer.calendarLink) {
                              window.open(selectedInterviewer.calendarLink, '_blank')
                            }
                          }}
                        >
                          <CalendarIcon width={16} height={16} />
                          Записаться на интервью
                        </Button>
                        <Button
                          size="2"
                          variant="soft"
                          color="red"
                          onClick={() => handleDeleteInterviewer(selectedInterviewer, true)}
                        >
                          <TrashIcon width={16} height={16} />
                          Удалить
                        </Button>
                      </Flex>
                    </Card>

                    {/* Статистика */}
                    <Card style={{ padding: '16px' }}>
                      <Flex align="center" gap="2" mb="3">
                        <BarChartIcon width={16} height={16} />
                        <Text size="3" weight="bold">Статистика</Text>
                      </Flex>
                      <Flex gap="4" justify="between">
                        <Box style={{ textAlign: 'center' }}>
                          <Text size="5" weight="bold" style={{ display: 'block' }}>
                            1
                          </Text>
                          <Text size="1" color="gray">
                            Интервью
                          </Text>
                        </Box>
                        <Box style={{ textAlign: 'center' }}>
                          <Text size="5" weight="bold" style={{ display: 'block' }}>
                            0
                          </Text>
                          <Text size="1" color="gray">
                            Завершено
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  </Flex>
                </Box>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        )}

        {/* Модальное окно редактирования/создания интервьюера */}
        <InterviewerEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingInterviewer(null)
            if (returnToViewModal && selectedInterviewer) {
              setIsModalOpen(true)
              setReturnToViewModal(false)
            }
          }}
          interviewer={editingInterviewer}
          returnToView={returnToViewModal}
          onSave={(data) => {
            // TODO: Реализовать сохранение
            console.log('Сохранение интервьюера:', data)
            if (editingInterviewer) {
              alert('Изменения сохранены')
              // Обновляем данные интервьюера
              const updatedInterviewer = { ...editingInterviewer, ...data }
              setSelectedInterviewer(updatedInterviewer)
            } else {
              alert('Интервьюер создан')
            }
            setIsEditModalOpen(false)
            setEditingInterviewer(null)
            if (returnToViewModal && selectedInterviewer) {
              setIsModalOpen(true)
              setReturnToViewModal(false)
            }
          }}
        />
      </Box>
    </AppLayout>
  )
}

// Компонент модального окна редактирования/создания интервьюера
interface InterviewerEditModalProps {
  isOpen: boolean
  onClose: () => void
  interviewer: Interviewer | null
  returnToView?: boolean
  onSave: (data: any) => void
}

function InterviewerEditModal({ isOpen, onClose, interviewer, returnToView = false, onSave }: InterviewerEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    isActive: true,
    calendarLink: ''
  })

  useEffect(() => {
    if (interviewer) {
      setFormData({
        firstName: interviewer.firstName,
        lastName: interviewer.lastName,
        middleName: interviewer.middleName || '',
        email: interviewer.email,
        isActive: interviewer.isActive,
        calendarLink: interviewer.calendarLink || ''
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        isActive: true,
        calendarLink: ''
      })
    }
  }, [interviewer, isOpen])

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    onSave(formData)
  }

  const handleAutofill = () => {
    if (formData.email) {
      const calendarLink = `https://calendar.google.com/calendar/embed?src=${formData.email}`
      setFormData({ ...formData, calendarLink })
    }
  }

  const isEditing = !!interviewer

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Box className={styles.modalHeader}>
          <Flex align="center" gap="2">
            <Box className={styles.modalHeaderIcon}>
              <Pencil1Icon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
            <Text size="5" weight="bold" style={{ color: '#ffffff' }}>
              {isEditing ? `Редактирование интервьюера ${interviewer.lastName} ${interviewer.firstName}` : 'Создание интервьюера'}
            </Text>
          </Flex>
        </Box>

        <Flex direction="column" gap="4" mt="4">
          {/* Имя, Фамилия, Отчество */}
          <Flex gap="4" wrap="wrap">
            <Box style={{ flex: 1, minWidth: '200px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Имя <Text color="red">*</Text>
              </Text>
              <TextField.Root
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Введите имя"
                size="2"
                style={{ width: '100%' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Имя интервьюера
              </Text>
            </Box>

            <Box style={{ flex: 1, minWidth: '200px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Фамилия <Text color="red">*</Text>
              </Text>
              <TextField.Root
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Введите фамилию"
                size="2"
                style={{ width: '100%' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Фамилия интервьюера
              </Text>
            </Box>

            <Box style={{ flex: 1, minWidth: '200px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Отчество
              </Text>
              <TextField.Root
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="Введите отчество (необязательно)"
                size="2"
                style={{ width: '100%' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Отчество интервьюера (необязательно)
              </Text>
            </Box>
          </Flex>

          {/* Email и Активен */}
          <Flex gap="4" wrap="wrap">
            <Box style={{ flex: 1, minWidth: '200px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Email <Text color="red">*</Text>
              </Text>
              <TextField.Root
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Введите email"
                size="2"
                style={{ width: '100%' }}
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Email адрес интервьюера
              </Text>
            </Box>

            <Box style={{ flex: 1, minWidth: '200px' }}>
              <Flex align="center" gap="2" mb="2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Text size="2" weight="medium">
                  Активен для проведения интервью
                </Text>
              </Flex>
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Активен ли интервьюер для проведения интервью
              </Text>
            </Box>
          </Flex>

          {/* Ссылка на календарь */}
          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Ссылка на календарь
            </Text>
            <Flex gap="2" align="center">
              <TextField.Root
                value={formData.calendarLink}
                onChange={(e) => setFormData({ ...formData, calendarLink: e.target.value })}
                placeholder="https://calendar.google.com/calendar/embed?src=..."
                size="2"
                style={{ flex: 1 }}
              />
              <Button
                size="2"
                variant="soft"
                onClick={handleAutofill}
                disabled={!formData.email}
              >
                <Pencil1Icon width={16} height={16} />
                Автозаполнить
              </Button>
            </Flex>
            <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
              Публичная ссылка на календарь (например, Calendly)
            </Text>
          </Box>
        </Flex>

        <Flex justify="between" gap="3" mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <Button variant="soft" onClick={onClose}>
            <ArrowLeftIcon width={16} height={16} />
            {returnToView ? 'Назад к интервьюеру' : (isEditing ? 'Назад к интервьюеру' : 'Отмена')}
          </Button>
          <Button onClick={handleSave} style={{ background: 'linear-gradient(135deg, var(--accent-9) 0%, var(--accent-10) 100%)' }}>
            <CheckCircledIcon width={16} height={16} />
            {isEditing ? 'Сохранить изменения' : 'Создать интервьюера'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
