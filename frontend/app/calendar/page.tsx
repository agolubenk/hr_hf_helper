/**
 * CalendarPage (calendar/page.tsx) - Страница календаря событий
 * 
 * Назначение:
 * - Отображение календаря событий (интервью, скрининги, встречи)
 * - Управление событиями календаря
 * - Синхронизация с Google Calendar
 * - Просмотр событий в разных режимах (месяц, неделя, день, список)
 * - Управление слотами (свободное время)
 * 
 * Функциональность:
 * - Календарь в режиме месяца с сеткой дней
 * - Таблица событий для режима недели/дня
 * - Список всех событий с поиском
 * - Панель слотов для копирования свободного времени
 * - Модальное окно детального просмотра события
 * - Синхронизация с Google Calendar
 * - Фильтрация по офисам (Минск, Варшава, Гомель)
 * - Поиск событий по названию, кандидату, вакансии
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений (синхронизация, копирование ссылок)
 * - SlotsPanel: компонент для отображения свободных слотов
 * 
 * Поведение:
 * - При загрузке отображает текущий месяц
 * - При переключении режима отображения меняет вид календаря
 * - При клике на событие открывает модальное окно с деталями
 * - При синхронизации обновляет события из Google Calendar
 * - При выборе офиса фильтрует события (в будущей реализации)
 */

'use client'

import { useState } from 'react'
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card, Table, Select, Badge, Dialog, Separator, Tabs, TextField } from "@radix-ui/themes"
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
  ListBulletIcon,
  MagnifyingGlassIcon,
  CopyIcon
} from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import styles from './calendar.module.css'

/**
 * Attendee - интерфейс участника события
 * 
 * Структура:
 * - email: email участника
 * - name: имя участника (опционально)
 * - responseStatus: статус ответа на приглашение
 *   - 'accepted': принял приглашение
 *   - 'declined': отклонил приглашение
 *   - 'tentative': возможно придет
 *   - 'needsAction': не ответил
 * - organizer: флаг, является ли участник организатором события
 */
interface Attendee {
  email: string
  name?: string
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  organizer?: boolean
}

/**
 * CalendarEvent - интерфейс события календаря
 * 
 * Структура:
 * - id: уникальный идентификатор события
 * - title: название события
 * - start, end: дата и время начала и окончания
 * - type: тип события ('interview', 'screening', 'meeting', 'other')
 * - candidate: имя кандидата (опционально)
 * - interviewer: имя интервьюера (опционально)
 * - format: формат встречи ('online' - онлайн, 'office' - офис)
 * - vacancy: название вакансии (опционально)
 * - status: статус события ('confirmed', 'tentative', 'cancelled')
 * - location: место проведения (опционально)
 * - description: описание события (опционально)
 * - meetLink: ссылка на Google Meet (опционально)
 * - creatorEmail, creatorName: создатель события
 * - attendees: массив участников события
 * - allDay: флаг события на весь день
 */
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

/**
 * CalendarPage - компонент страницы календаря
 * 
 * Состояние:
 * - currentDate: текущая дата для отображения календаря
 * - viewMode: режим отображения ('month', 'week', 'day')
 * - selectedOffice: выбранный офис для фильтрации
 * - selectedEvent: выбранное событие для детального просмотра
 * - eventModalOpen: флаг открытия модального окна события
 * - isSyncing: флаг синхронизации с Google Calendar
 * - activeTab: активная вкладка ('calendar', 'list', 'slots')
 * - searchQuery: поисковый запрос для фильтрации событий
 */
export default function CalendarPage() {
  // Текущая дата для отображения календаря (по умолчанию - сегодня)
  const [currentDate, setCurrentDate] = useState(new Date())
  // Режим отображения: 'month' - месяц, 'week' - неделя, 'day' - день
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  // Выбранный офис для фильтрации событий
  const [selectedOffice, setSelectedOffice] = useState<'minsk' | 'warsaw' | 'gomel'>('minsk')
  // Выбранное событие для детального просмотра в модальном окне
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  // Флаг открытия модального окна детального просмотра события
  const [eventModalOpen, setEventModalOpen] = useState(false)
  // Флаг синхронизации с Google Calendar (показывает индикатор загрузки)
  const [isSyncing, setIsSyncing] = useState(false)
  // Активная вкладка: 'calendar' - календарь, 'list' - список событий, 'slots' - слоты
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'slots'>('calendar')
  // Поисковый запрос для фильтрации событий в списке
  const [searchQuery, setSearchQuery] = useState('')
  // Хук для отображения уведомлений
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

  /**
   * offices - список офисов для фильтрации событий
   * 
   * Используется для:
   * - Фильтрации событий по офису
   * - Отображения переключателя офисов в заголовке календаря
   * 
   * TODO: Загружать из API или настроек компании
   */
  const offices = [
    { id: 'minsk', label: 'Минск' },
    { id: 'warsaw', label: 'Варшава' },
    { id: 'gomel', label: 'Гомель' },
  ]

  /**
   * getEventTypeColor - получение цвета для типа события
   * 
   * Функциональность:
   * - Возвращает hex-код цвета в зависимости от типа события
   * 
   * Маппинг типов на цвета:
   * - 'interview': фиолетовый (#8B5CF6)
   * - 'screening': светло-фиолетовый (#A855F7)
   * - 'meeting': синий (#3B82F6)
   * - другие: серый (#6B7280)
   * 
   * Используется для:
   * - Отображения событий в календаре с цветовой индикацией
   * - Стилизации Badge компонентов
   * 
   * @param type - тип события календаря
   * @returns hex-код цвета для типа события
   */
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

  /**
   * getEventTypeLabel - получение отображаемого названия типа события
   * 
   * Функциональность:
   * - Преобразует внутренний тип события в читаемое название на русском языке
   * 
   * Маппинг типов:
   * - 'interview' → 'Интервью'
   * - 'screening' → 'HR-скрининг'
   * - 'meeting' → 'Встреча'
   * - другие → 'Событие'
   * 
   * Используется для:
   * - Отображения типа события в таблице и модальном окне
   * - Подсказок при наведении на события в календаре
   * 
   * @param type - тип события календаря
   * @returns отображаемое название типа на русском языке
   */
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

  /**
   * formatTime - форматирование времени для отображения
   * 
   * Функциональность:
   * - Преобразует объект Date в строку времени в формате HH:MM
   * - Использует локаль 'ru-RU' для форматирования
   * 
   * Используется для:
   * - Отображения времени начала и окончания событий
   * - Отображения времени в календаре и таблице
   * 
   * @param date - объект Date для форматирования
   * @returns строка времени в формате HH:MM (например, "14:00")
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует объект Date в строку даты в формате "день месяц год"
   * - Использует локаль 'ru-RU' для форматирования
   * 
   * Примеры:
   * - new Date(2026, 0, 26) → "26 января 2026 г."
   * 
   * Используется для:
   * - Отображения даты в заголовках таблиц
   * - Отображения даты в модальном окне события
   * 
   * @param date - объект Date для форматирования
   * @returns строка даты в формате "день месяц год"
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  /**
   * getDaysInMonth - получение массива дней месяца для отображения в календаре
   * 
   * Функциональность:
   * - Генерирует массив дней месяца с учетом пустых ячеек для выравнивания
   * - Корректирует первый день недели на понедельник (вместо воскресенья)
   * 
   * Алгоритм:
   * 1. Определяет первый и последний день месяца
   * 2. Вычисляет день недели первого дня месяца
   * 3. Корректирует для понедельника как первого дня недели
   * 4. Добавляет null для пустых ячеек до начала месяца
   * 5. Добавляет все дни месяца
   * 
   * Используется для:
   * - Построения сетки календаря в режиме месяца
   * - Отображения дней в правильном порядке (понедельник - первый день)
   * 
   * @param date - дата, для которой нужно получить дни месяца
   * @returns массив дней месяца (Date | null)[], где null - пустые ячейки
   */
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

  /**
   * getEventsForDate - получение событий для конкретной даты
   * 
   * Функциональность:
   * - Фильтрует события по дате начала
   * - Сравнивает только дату (без времени) для группировки событий по дням
   * 
   * Используется для:
   * - Отображения событий в ячейках календаря
   * - Подсчета количества событий на день
   * 
   * @param date - дата для фильтрации событий (может быть null для пустых ячеек)
   * @returns массив событий, которые происходят в указанную дату
   */
  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return mockEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  /**
   * navigateMonth - навигация по месяцам календаря
   * 
   * Функциональность:
   * - Переключает отображаемый месяц на предыдущий или следующий
   * - Обновляет состояние currentDate
   * 
   * Используется для:
   * - Кнопок "Предыдущий месяц" и "Следующий месяц" в заголовке календаря
   * 
   * @param direction - направление навигации: 'prev' (предыдущий) или 'next' (следующий)
   */
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

  /**
   * goToToday - переход к текущей дате
   * 
   * Функциональность:
   * - Устанавливает currentDate в текущую дату
   * - Обновляет отображение календаря на текущий месяц
   * 
   * Используется для:
   * - Кнопки "Сегодня" в заголовке календаря
   */
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  /**
   * handleEventClick - обработчик клика на событие в календаре
   * 
   * Функциональность:
   * - Устанавливает выбранное событие для детального просмотра
   * - Открывает модальное окно с деталями события
   * 
   * Используется для:
   * - Клика на событие в календаре (месяц, неделя, день)
   * - Клика на событие в таблице списка событий
   * 
   * @param event - событие календаря, на которое кликнули
   */
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setEventModalOpen(true)
  }

  /**
   * handleSyncCalendar - обработчик синхронизации календаря с Google Calendar
   * 
   * Функциональность:
   * - Имитирует синхронизацию событий из Google Calendar
   * - Показывает индикатор загрузки во время синхронизации
   * - Отображает уведомление об успехе или ошибке
   * 
   * Поведение:
   * - Устанавливает isSyncing в true перед началом
   * - Имитирует задержку API (1.5 секунды)
   * - Показывает toast-уведомление с результатом
   * - Сбрасывает isSyncing в false после завершения
   * 
   * TODO: Реализовать реальную синхронизацию через API
   * - GET /api/v1/calendar/sync - синхронизация событий
   * - Обновление mockEvents из ответа API
   * 
   * Используется для:
   * - Кнопки "Синхронизировать" в заголовке календаря
   */
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

  /**
   * getDuration - вычисление и форматирование длительности события
   * 
   * Функциональность:
   * - Вычисляет разницу между временем начала и окончания
   * - Форматирует длительность в читаемый формат
   * 
   * Форматы вывода:
   * - Менее 60 минут: "X мин" (например, "30 мин")
   * - Ровно N часов: "Nч" (например, "2ч")
   * - N часов 30 минут: "N,5ч" (например, "1,5ч")
   * - Другое: "Nч Mмин" (например, "2ч 15мин")
   * 
   * Используется для:
   * - Отображения длительности события в модальном окне
   * - Подсказок при наведении на события
   * 
   * @param start - дата и время начала события
   * @param end - дата и время окончания события
   * @returns отформатированная строка длительности события
   */
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

  /**
   * getAttendeeStatusBadge - получение данных для Badge статуса участника
   * 
   * Функциональность:
   * - Возвращает цвет, текст и иконку для отображения статуса участника
   * 
   * Маппинг статусов:
   * - 'accepted': зеленый (#10b981), "Принял", CheckIcon
   * - 'declined': красный (#ef4444), "Отклонил", Cross2Icon
   * - 'tentative': оранжевый (#f59e0b), "Возможно", ExclamationTriangleIcon
   * - другие: серый (#6b7280), "Не ответил", ClockIcon
   * 
   * Используется для:
   * - Отображения статуса участников в модальном окне события
   * 
   * @param status - статус ответа участника на приглашение
   * @returns объект с цветом, текстом и иконкой для Badge
   */
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

  // Фильтрация событий для списка
  const filteredEvents = mockEvents.filter(event => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      event.title.toLowerCase().includes(query) ||
      event.candidate?.toLowerCase().includes(query) ||
      event.vacancy?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  })

  /**
   * copyEventLink - копирование ссылки на событие в буфер обмена
   * 
   * Функциональность:
   * - Генерирует ссылку на событие в Google Calendar
   * - Копирует ссылку в буфер обмена браузера
   * - Показывает уведомление об успехе или ошибке
   * 
   * Поведение:
   * - Использует ID события для формирования ссылки
   * - Использует Clipboard API для копирования
   * - Обрабатывает ошибки копирования
   * 
   * TODO: Использовать реальную ссылку из API
   * - event.calendar_event_url если доступна
   * - Или генерировать через Google Calendar API
   * 
   * Используется для:
   * - Кнопки копирования ссылки в таблице списка событий
   * 
   * @param event - событие календаря, ссылку на которое нужно скопировать
   */
  const copyEventLink = (event: CalendarEvent) => {
    // В реальном приложении здесь будет ссылка на Google Calendar
    const link = `https://calendar.google.com/event?eid=${event.id}`
    navigator.clipboard.writeText(link).then(() => {
      toast.showSuccess('Ссылка скопирована', 'Ссылка на событие скопирована в буфер обмена')
    }).catch(() => {
      toast.showError('Ошибка', 'Не удалось скопировать ссылку')
    })
  }

  return (
    <AppLayout pageTitle="Календарь">
      <Box className={styles.calendarContainer}>
        {/* Вкладки */}
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'calendar' | 'list' | 'slots')}>
          <Tabs.List mb="4">
            <Tabs.Trigger value="calendar">
              <CalendarIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Календарь</Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="list">
              <ListBulletIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Список событий</Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="slots">
              <ClockIcon width={16} height={16} />
              <Text size="2" style={{ marginLeft: '8px' }}>Слоты</Text>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Вкладка: Календарь */}
          <Tabs.Content value="calendar">
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
                  onClick={() => setSelectedOffice(office.id as 'minsk' | 'warsaw' | 'gomel')}
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
          </Tabs.Content>

          {/* Вкладка: Список событий */}
          <Tabs.Content value="list">
            <Card>
              <Box p="4">
                {/* Поиск и фильтры */}
                <Flex direction="column" gap="4" mb="4">
                  <Flex align="center" gap="3" wrap="wrap">
                    <TextField.Root
                      placeholder="Поиск по названию, кандидату, вакансии..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ flex: 1, minWidth: '300px' }}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon width={16} height={16} />
                      </TextField.Slot>
                    </TextField.Root>
                    {searchQuery && (
                      <Button
                        variant="soft"
                        size="2"
                        onClick={() => setSearchQuery('')}
                      >
                        <Cross2Icon width={14} height={14} />
                        <Text size="2" style={{ marginLeft: '4px' }}>Очистить</Text>
                      </Button>
                    )}
                  </Flex>
                </Flex>

                {/* Таблица событий */}
                {filteredEvents.length > 0 ? (
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell style={{ width: '25%' }}>Название встречи</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '20%' }}>Дата и время</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '15%' }}>Google Meet</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '35%' }}>Описание</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell style={{ width: '5%' }}>Ссылка</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredEvents.map(event => (
                        <Table.Row 
                          key={event.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleEventClick(event)}
                        >
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              {event.status === 'confirmed' ? (
                                <CheckIcon width={16} height={16} style={{ color: '#10b981' }} />
                              ) : event.status === 'tentative' ? (
                                <ExclamationTriangleIcon width={16} height={16} style={{ color: '#f59e0b' }} />
                              ) : event.status === 'cancelled' ? (
                                <Cross2Icon width={16} height={16} style={{ color: '#ef4444' }} />
                              ) : (
                                <BoxIcon width={16} height={16} style={{ color: '#6b7280' }} />
                              )}
                              <Text size="2" weight="bold">{event.title}</Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">
                              {event.allDay 
                                ? `${event.start.toLocaleDateString('ru-RU')} (Весь день)`
                                : `${event.start.toLocaleDateString('ru-RU')} ${formatTime(event.start)} - ${formatTime(event.end)}`
                              }
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            {event.meetLink ? (
                              <Button
                                variant="soft"
                                size="1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(event.meetLink, '_blank')
                                }}
                                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                              >
                                <VideoIcon width={12} height={12} />
                                <Text size="1" style={{ color: '#ffffff', marginLeft: '4px' }}>
                                  Google Meet
                                  {event.attendees && event.attendees.length > 0 && (
                                    <Badge style={{ marginLeft: '4px', backgroundColor: '#ffffff', color: '#10b981' }}>
                                      {event.attendees.length}
                                    </Badge>
                                  )}
                                </Text>
                              </Button>
                            ) : (
                              <Text size="2" style={{ color: 'var(--gray-11)' }}>-</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {event.description ? (
                              <Text size="2" style={{ color: 'var(--gray-11)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.description}
                              </Text>
                            ) : (
                              <Text size="2" style={{ color: 'var(--gray-11)' }}>-</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              variant="soft"
                              size="1"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyEventLink(event)
                              }}
                              style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
                            >
                              <ExternalLinkIcon width={12} height={12} />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                ) : (
                  <Box style={{ textAlign: 'center', padding: '48px' }}>
                    <CalendarIcon width={48} height={48} style={{ color: 'var(--gray-11)', marginBottom: '16px' }} />
                    <Text size="4" weight="bold" style={{ color: 'var(--gray-11)', display: 'block', marginBottom: '8px' }}>
                      События не найдены
                    </Text>
                    <Text size="2" style={{ color: 'var(--gray-11)' }}>
                      {searchQuery 
                        ? 'Попробуйте изменить параметры поиска'
                        : 'События календаря не синхронизированы. Запустите синхронизацию.'
                      }
                    </Text>
                  </Box>
                )}
              </Box>
            </Card>
          </Tabs.Content>

          {/* Вкладка: Слоты */}
          <Tabs.Content value="slots">
            <Card>
              <Box p="4">
                <Flex align="center" justify="between" mb="4">
                  <Flex align="center" gap="2">
                    <ClockIcon width={20} height={20} style={{ color: '#10b981' }} />
                    <Text size="4" weight="bold">Свободные слоты</Text>
                  </Flex>
                  <Button
                    variant="soft"
                    size="2"
                    onClick={() => {
                      // Функция копирования всех слотов
                      toast.showInfo('Копирование', 'Функция копирования всех слотов в разработке')
                    }}
                    style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  >
                    <CopyIcon width={14} height={14} />
                    <Text size="2" style={{ color: '#ffffff', marginLeft: '4px' }}>Копировать все</Text>
                  </Button>
                </Flex>
                <SlotsPanel />
              </Box>
            </Card>
          </Tabs.Content>
        </Tabs.Root>

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
