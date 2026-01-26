'use client'

import { useState } from 'react'
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card, Table, Select, Badge, Dialog, Separator } from "@radix-ui/themes"
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  PersonIcon,
  VideoIcon,
  BoxIcon,
  ReloadIcon,
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './calendar.module.css'

interface Attendee {
  email: string
  name?: string
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  organizer?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'interview' | 'screening' | 'meeting' | 'other'
  candidate?: string
  interviewer?: string
  format?: 'online' | 'office'
  vacancy?: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
  location?: string
  description?: string
  meetLink?: string
  creatorEmail?: string
  creatorName?: string
  attendees?: Attendee[]
  allDay?: boolean
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedOffice, setSelectedOffice] = useState<'minsk' | 'warsaw' | 'gomel'>('minsk')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const toast = useToast()

  // Моковые данные событий
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Интервью: Иван Иванов',
      start: new Date(2026, 0, 26, 14, 0),
      end: new Date(2026, 0, 26, 15, 30),
      type: 'interview',
      candidate: 'Иван Иванов',
      interviewer: 'Андрей Голубенко',
      format: 'online',
      vacancy: 'Frontend Engineer (React)',
      status: 'confirmed',
      location: 'Google Meet',
      description: 'Техническое интервью с кандидатом на позицию Frontend Engineer. Обсуждение опыта работы с React, TypeScript, и архитектурой приложений.',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      creatorEmail: 'andrey@example.com',
      creatorName: 'Андрей Голубенко',
      attendees: [
        { email: 'andrey@example.com', name: 'Андрей Голубенко', responseStatus: 'accepted', organizer: true },
        { email: 'ivan@example.com', name: 'Иван Иванов', responseStatus: 'accepted' },
        { email: 'maria@example.com', name: 'Мария Сидорова', responseStatus: 'tentative' }
      ],
      allDay: false
    },
    {
      id: '2',
      title: 'HR-скрининг: Мария Козлова',
      start: new Date(2026, 0, 26, 10, 0),
      end: new Date(2026, 0, 26, 10, 30),
      type: 'screening',
      candidate: 'Мария Козлова',
      interviewer: 'Андрей Голубенко',
      format: 'online',
      vacancy: 'Fullstack Engineer',
      status: 'confirmed',
      location: 'Google Meet',
      description: 'HR-скрининг кандидата. Проверка мотивации, ожиданий по зарплате, готовности к работе.',
      meetLink: 'https://meet.google.com/xyz-uvw-rst',
      creatorEmail: 'andrey@example.com',
      creatorName: 'Андрей Голубенко',
      attendees: [
        { email: 'andrey@example.com', name: 'Андрей Голубенко', responseStatus: 'accepted', organizer: true },
        { email: 'maria.koz@example.com', name: 'Мария Козлова', responseStatus: 'accepted' }
      ],
      allDay: false
    },
    {
      id: '3',
      title: 'Интервью: Егор Говсь',
      start: new Date(2026, 0, 27, 16, 0),
      end: new Date(2026, 0, 27, 17, 30),
      type: 'interview',
      candidate: 'Егор Говсь',
      interviewer: 'Иван Петров',
      format: 'office',
      vacancy: 'Backend Engineer (Python)',
      status: 'tentative',
      location: 'Офис, ул. Ленина, 10, каб. 205',
      description: 'Очное техническое интервью. Обсуждение опыта работы с Python, Django, базами данных.',
      creatorEmail: 'ivan@example.com',
      creatorName: 'Иван Петров',
      attendees: [
        { email: 'ivan@example.com', name: 'Иван Петров', responseStatus: 'accepted', organizer: true },
        { email: 'egor@example.com', name: 'Егор Говсь', responseStatus: 'tentative' }
      ],
      allDay: false
    },
  ]

  const offices = [
    { id: 'minsk', label: 'Минск' },
    { id: 'warsaw', label: 'Варшава' },
    { id: 'gomel', label: 'Гомель' },
  ]

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview':
        return '#8B5CF6'
      case 'screening':
        return '#A855F7'
      case 'meeting':
        return '#3B82F6'
      default:
        return '#6B7280'
    }
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'interview':
        return 'Интервью'
      case 'screening':
        return 'HR-скрининг'
      case 'meeting':
        return 'Встреча'
      default:
        return 'Событие'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Корректировка для понедельника как первого дня недели
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
    
    const days: (Date | null)[] = []
    
    // Пустые ячейки для дней до начала месяца
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push(null)
    }
    
    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return mockEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setEventModalOpen(true)
  }

  const handleSyncCalendar = async () => {
    setIsSyncing(true)
    try {
      // Имитация синхронизации
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.showSuccess('Календарь синхронизирован', 'События успешно обновлены из Google Calendar')
    } catch (error) {
      toast.showError('Ошибка синхронизации', 'Не удалось синхронизировать календарь')
    } finally {
      setIsSyncing(false)
    }
  }

  const getDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))
    
    if (durationMinutes < 60) {
      return `${durationMinutes} мин`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      if (minutes === 0) {
        return `${hours}ч`
      } else if (minutes === 30) {
        return `${hours},5ч`
      } else {
        return `${hours}ч ${minutes}мин`
      }
    }
  }

  const getAttendeeStatusBadge = (status: Attendee['responseStatus']) => {
    switch (status) {
      case 'accepted':
        return { color: '#10b981', label: 'Принял', icon: CheckIcon }
      case 'declined':
        return { color: '#ef4444', label: 'Отклонил', icon: Cross2Icon }
      case 'tentative':
        return { color: '#f59e0b', label: 'Возможно', icon: ExclamationTriangleIcon }
      default:
        return { color: '#6b7280', label: 'Не ответил', icon: ClockIcon }
    }
  }

  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const days = getDaysInMonth(currentDate)

  return (
    <AppLayout pageTitle="Календарь">
      <Box className={styles.calendarContainer}>
        {/* Заголовок с навигацией */}
        <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <Button
              variant="soft"
              size="2"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeftIcon width={16} height={16} />
            </Button>
            <Text size="5" weight="bold">
              {monthName}
            </Text>
            <Button
              variant="soft"
              size="2"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRightIcon width={16} height={16} />
            </Button>
            <Button
              variant="soft"
              size="2"
              onClick={goToToday}
            >
              Сегодня
            </Button>
          </Flex>

          <Flex align="center" gap="3">
            {/* Кнопка синхронизации */}
            <Button
              variant="soft"
              size="2"
              onClick={handleSyncCalendar}
              disabled={isSyncing}
              style={{ backgroundColor: isSyncing ? 'var(--gray-4)' : 'var(--accent-9)', color: '#ffffff' }}
            >
              <ReloadIcon width={16} height={16} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <Text size="2">{isSyncing ? 'Синхронизация...' : 'Синхронизировать'}</Text>
            </Button>

            {/* Тогглер выбора офиса */}
            {/* Тогглер выбора офиса */}
            <Flex gap="1" align="center" className={styles.officeToggle}>
              {offices.map(office => (
                <Box
                  key={office.id}
                  className={styles.officeButton}
                  data-selected={selectedOffice === office.id}
                  onClick={() => setSelectedOffice(office.id)}
                >
                  <Text size="1" weight={selectedOffice === office.id ? "medium" : "regular"}>
                    {office.label}
                  </Text>
                </Box>
              ))}
            </Flex>

            {/* Переключатель вида */}
            <Select.Root value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
              <Select.Trigger style={{ minWidth: '120px' }} />
              <Select.Content>
                <Select.Item value="month">Месяц</Select.Item>
                <Select.Item value="week">Неделя</Select.Item>
                <Select.Item value="day">День</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        {/* Календарь */}
        {viewMode === 'month' && (
          <Card>
            <Box className={styles.calendarGrid}>
              {/* Заголовки дней недели */}
              {weekDays.map(day => (
                <Box key={day} className={styles.weekDayHeader}>
                  <Text size="2" weight="bold">{day}</Text>
                </Box>
              ))}

              {/* Дни месяца */}
              {days.map((date, index) => {
                const events = getEventsForDate(date)
                const isToday = date && date.toDateString() === new Date().toDateString()
                const isCurrentMonth = date && date.getMonth() === currentDate.getMonth()

                return (
                  <Box
                    key={index}
                    className={styles.calendarDay}
                    data-today={isToday}
                    data-other-month={!isCurrentMonth}
                  >
                    {date && (
                      <>
                        <Text size="2" weight={isToday ? "bold" : "regular"} mb="1">
                          {date.getDate()}
                        </Text>
                        <Flex direction="column" gap="1" style={{ width: '100%' }}>
                          {events.length > 0 && (
                            <Badge 
                              style={{ 
                                backgroundColor: 'var(--accent-9)', 
                                color: '#ffffff',
                                alignSelf: 'flex-start',
                                marginBottom: '4px'
                              }}
                            >
                              {events.length}
                            </Badge>
                          )}
                          {events.slice(0, 3).map(event => (
                            <Box
                              key={event.id}
                              className={styles.eventBadge}
                              style={{ 
                                backgroundColor: event.status === 'confirmed' 
                                  ? getEventTypeColor(event.type) 
                                  : event.status === 'tentative'
                                  ? '#f59e0b'
                                  : '#ef4444',
                                cursor: 'pointer'
                              }}
                              title={`${getEventTypeLabel(event.type)}: ${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`}
                              onClick={() => handleEventClick(event)}
                            >
                              <Text size="1" style={{ color: '#ffffff' }}>
                                {formatTime(event.start)} {event.title.split(':')[0]}
                              </Text>
                            </Box>
                          ))}
                          {events.length > 3 && (
                            <Text size="1" style={{ color: 'var(--gray-11)' }}>
                              +{events.length - 3} еще
                            </Text>
                          )}
                        </Flex>
                      </>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Card>
        )}

        {/* Список событий для недели/дня */}
        {(viewMode === 'week' || viewMode === 'day') && (
          <Card>
            <Box p="4">
              <Text size="4" weight="bold" mb="4">
                {viewMode === 'week' ? 'Неделя' : 'День'} - {formatDate(currentDate)}
              </Text>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Время</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Событие</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Интервьюер</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Формат</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {mockEvents.map(event => (
                    <Table.Row 
                      key={event.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEventClick(event)}
                    >
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <ClockIcon width={14} height={14} />
                          <Text size="2">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge style={{ backgroundColor: getEventTypeColor(event.type) }}>
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{event.candidate || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{event.interviewer || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap="1">
                          {event.format === 'online' ? (
                            <VideoIcon width={14} height={14} />
                          ) : (
                            <BoxIcon width={14} height={14} />
                          )}
                          <Text size="2">{event.format === 'online' ? 'Онлайн' : 'Офис'}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{event.vacancy || '-'}</Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card>
        )}

        {/* Модальное окно для детального просмотра события */}
        <Dialog.Root open={eventModalOpen} onOpenChange={setEventModalOpen}>
          <Dialog.Content style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            {selectedEvent && (
              <>
                <Dialog.Title>{selectedEvent.title}</Dialog.Title>
                
                <Box mt="4">
                  <Flex direction="column" gap="4">
                    {/* Время и длительность */}
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <ClockIcon width={16} height={16} />
                        <Text size="3" weight="bold">Время</Text>
                      </Flex>
                      <Text size="2">
                        {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                        {!selectedEvent.allDay && ` (${getDuration(selectedEvent.start, selectedEvent.end)})`}
                      </Text>
                      {selectedEvent.allDay && (
                        <Badge style={{ backgroundColor: '#3b82f6', marginTop: '8px' }}>
                          Весь день
                        </Badge>
                      )}
                    </Box>

                    {/* Место */}
                    {selectedEvent.location && (
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <BoxIcon width={16} height={16} />
                          <Text size="3" weight="bold">Место</Text>
                        </Flex>
                        <Text size="2">{selectedEvent.location}</Text>
                      </Box>
                    )}

                    {/* Статус */}
                    <Box>
                      <Flex align="center" gap="2" mb="2">
                        <Text size="3" weight="bold">Статус</Text>
                      </Flex>
                      <Badge 
                        style={{ 
                          backgroundColor: selectedEvent.status === 'confirmed' 
                            ? '#10b981' 
                            : selectedEvent.status === 'tentative'
                            ? '#f59e0b'
                            : '#ef4444'
                        }}
                      >
                        {selectedEvent.status === 'confirmed' 
                          ? 'Подтверждено' 
                          : selectedEvent.status === 'tentative'
                          ? 'Предварительно'
                          : 'Отменено'}
                      </Badge>
                    </Box>

                    {/* Создатель */}
                    {(selectedEvent.creatorName || selectedEvent.creatorEmail) && (
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <PersonIcon width={16} height={16} />
                          <Text size="3" weight="bold">Создатель</Text>
                        </Flex>
                        <Text size="2">
                          {selectedEvent.creatorName || selectedEvent.creatorEmail}
                        </Text>
                      </Box>
                    )}

                    {/* Участники */}
                    {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <PersonIcon width={16} height={16} />
                          <Text size="3" weight="bold">Участники</Text>
                        </Flex>
                        <Flex direction="column" gap="2">
                          {selectedEvent.attendees.map((attendee, idx) => {
                            const statusBadge = getAttendeeStatusBadge(attendee.responseStatus)
                            const StatusIcon = statusBadge.icon
                            return (
                              <Flex key={idx} align="center" justify="between">
                                <Flex align="center" gap="2">
                                  <Text size="2" weight={attendee.organizer ? "bold" : "regular"}>
                                    {attendee.name || attendee.email}
                                  </Text>
                                  {attendee.organizer && (
                                    <Badge style={{ backgroundColor: 'var(--accent-9)' }}>
                                      Организатор
                                    </Badge>
                                  )}
                                </Flex>
                                <Badge style={{ backgroundColor: statusBadge.color, color: '#ffffff' }}>
                                  <StatusIcon width={12} height={12} />
                                  <Text size="1" style={{ color: '#ffffff', marginLeft: '4px' }}>
                                    {statusBadge.label}
                                  </Text>
                                </Badge>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Box>
                    )}

                    {/* Google Meet */}
                    {selectedEvent.meetLink && (
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <VideoIcon width={16} height={16} />
                          <Text size="3" weight="bold">Google Meet</Text>
                        </Flex>
                        <Button
                          variant="soft"
                          size="2"
                          onClick={() => window.open(selectedEvent.meetLink, '_blank')}
                          style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
                        >
                          <ExternalLinkIcon width={14} height={14} />
                          <Text size="2" style={{ color: '#ffffff', marginLeft: '4px' }}>
                            Присоединиться к встрече
                          </Text>
                        </Button>
                      </Box>
                    )}

                    {/* Описание */}
                    {selectedEvent.description && (
                      <>
                        <Separator size="4" />
                        <Box>
                          <Text size="3" weight="bold" mb="2">Описание</Text>
                          <Box 
                            p="3" 
                            style={{ 
                              backgroundColor: 'var(--gray-2)', 
                              borderRadius: '6px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            <Text size="2">{selectedEvent.description}</Text>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Flex>
                </Box>

                <Flex gap="3" justify="end" mt="4">
                  <Button variant="soft" onClick={() => setEventModalOpen(false)}>
                    Закрыть
                  </Button>
                </Flex>
              </>
            )}
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </AppLayout>
  )
}
