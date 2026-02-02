/**
 * InvitesPage (invites/page.tsx) - Страница управления инвайтами на интервью
 * 
 * Назначение:
 * - Управление инвайтами на интервью
 * - Создание новых инвайтов
 * - Просмотр и редактирование существующих инвайтов
 * - Фильтрация и поиск инвайтов
 * 
 * Функциональность:
 * - InvitesStats: статистика по инвайтам (всего, ожидает, отправлен, завершен)
 * - Список всех инвайтов в таблице
 * - Поиск инвайтов по имени кандидата, вакансии
 * - Фильтрация по статусу
 * - CreateInviteModal: модальное окно создания нового инвайта
 * - Переход к детальному просмотру инвайта
 * - Переход к редактированию инвайта
 * - Удаление инвайта
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации к детальной странице или редактированию
 * - useToast: для отображения уведомлений
 * - invitesApi: API для работы с инвайтами
 * - invites/[id]/page.tsx: страница детального просмотра инвайта
 * - invites/[id]/edit/page.tsx: страница редактирования инвайта
 * 
 * Поведение:
 * - При загрузке загружает список инвайтов
 * - При поиске фильтрует инвайты по введенному запросу
 * - При фильтрации по статусу показывает только инвайты с выбранным статусом
 * - При клике на инвайт происходит переход на детальную страницу
 * - При клике на редактирование происходит переход на страницу редактирования
 * - При создании инвайта открывает модальное окно
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, TextField, Button, Table, Select, Badge, Card } from "@radix-ui/themes"
import { 
  MagnifyingGlassIcon, 
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
  FileTextIcon,
  PlusIcon,
  ReloadIcon,
  CalendarIcon
} from "@radix-ui/react-icons"
import { invitesApi, Invite } from "@/lib/api"
import { useToast } from "@/components/Toast/ToastContext"
import InvitesStats from "@/components/invites/InvitesStats"
import CreateInviteModal from "@/components/invites/CreateInviteModal"
import styles from './invites.module.css'

/**
 * STATUS_OPTIONS - опции статусов инвайта для фильтрации
 * 
 * Используется для:
 * - Выбора статуса при фильтрации инвайтов
 * - Отображения текущего фильтра
 */
const STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
]

/**
 * STATUS_COLORS - маппинг статусов инвайта на цвета для Badge
 * 
 * Используется для:
 * - Отображения статуса инвайта с цветовой индикацией
 * - Визуального различия статусов
 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  sent: 'blue',
  completed: 'green',
  cancelled: 'gray',
}

/**
 * MOCK_STATS - моковые данные статистики по инвайтам
 * 
 * Используется для:
 * - Отображения статистики в компоненте InvitesStats
 * 
 * TODO: Загружать из API
 */
const MOCK_STATS = {
  total: 563,
  pending: 13,
  sent: 550,
  completed: 0,
}

/**
 * MOCK_INVITES - моковые данные инвайтов
 * 
 * Структура инвайта:
 * - id: уникальный идентификатор инвайта
 * - candidate_name: имя кандидата
 * - candidate_email: email кандидата
 * - candidate_url: ссылка на кандидата в Huntflow
 * - vacancy_title: название вакансии
 * - interview_datetime: дата и время интервью (ISO строка)
 * - interview_datetime_formatted: отформатированная дата и время
 * - status: статус инвайта
 * - status_display: отображаемое название статуса
 * - interview_format: формат интервью ('online' или 'office')
 * - google_meet_url: ссылка на Google Meet (для онлайн интервью)
 * - google_drive_file_url: ссылка на файл в Google Drive (опционально)
 * - created_at, updated_at: даты создания и обновления
 * 
 * TODO: Заменить на реальные данные из API
 */
const MOCK_INVITES: Invite[] = [
  {
    id: 1,
    candidate_name: 'Иванов Иван Иванович',
    candidate_email: 'ivanov@example.com',
    candidate_url: 'https://huntflow.ru/candidates/123',
    vacancy_title: 'Frontend Developer',
    interview_datetime: '2026-01-30T14:00:00Z',
    interview_datetime_formatted: '30.01.2026 14:00',
    status: 'pending',
    status_display: 'Ожидает',
    interview_format: 'online',
    google_meet_url: 'https://meet.google.com/abc-defg-hij',
    created_at: '2026-01-26T10:00:00Z',
    updated_at: '2026-01-26T10:00:00Z',
  },
  {
    id: 2,
    candidate_name: 'Петрова Мария Сергеевна',
    candidate_email: 'petrova@example.com',
    candidate_url: 'https://huntflow.ru/candidates/124',
    vacancy_title: 'Backend Developer',
    interview_datetime: '2026-01-31T15:30:00Z',
    interview_datetime_formatted: '31.01.2026 15:30',
    status: 'sent',
    status_display: 'Отправлен',
    interview_format: 'office',
    google_drive_file_url: 'https://drive.google.com/file/d/123',
    created_at: '2026-01-25T09:00:00Z',
    updated_at: '2026-01-25T09:00:00Z',
  },
  {
    id: 3,
    candidate_name: 'Сидоров Алексей Викторович',
    candidate_email: 'sidorov@example.com',
    candidate_url: 'https://huntflow.ru/candidates/125',
    vacancy_title: 'DevOps Engineer',
    interview_datetime: '2026-02-01T11:00:00Z',
    interview_datetime_formatted: '01.02.2026 11:00',
    status: 'pending',
    status_display: 'Ожидает',
    interview_format: 'online',
    google_meet_url: 'https://meet.google.com/xyz-uvw-rst',
    created_at: '2026-01-24T14:30:00Z',
    updated_at: '2026-01-24T14:30:00Z',
  },
]

/**
 * InvitesPage - компонент страницы управления инвайтами
 * 
 * Состояние:
 * - invites: массив всех инвайтов
 * - loading: флаг загрузки данных
 * - searchQuery: поисковый запрос для фильтрации инвайтов
 * - statusFilter: выбранный статус для фильтрации ('all' - все статусы)
 * - page: текущая страница пагинации
 * - totalCount: общее количество инвайтов
 * - hasNext: флаг наличия следующей страницы
 * - hasPrevious: флаг наличия предыдущей страницы
 * - isCreateModalOpen: флаг открытия модального окна создания инвайта
 */
function InvitesPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Хук для отображения уведомлений
  const toast = useToast()
  // Массив всех инвайтов
  const [invites, setInvites] = useState<Invite[]>(MOCK_INVITES)
  // Флаг загрузки данных инвайтов
  const [loading, setLoading] = useState(false)
  // Поисковый запрос для фильтрации инвайтов
  const [searchQuery, setSearchQuery] = useState('')
  // Выбранный статус для фильтрации ('all' - все статусы)
  const [statusFilter, setStatusFilter] = useState('all')
  // Текущая страница пагинации (начинается с 1)
  const [page, setPage] = useState(1)
  // Общее количество инвайтов (для пагинации)
  const [totalCount, setTotalCount] = useState(0)
  // Флаг наличия следующей страницы (для пагинации)
  const [hasNext, setHasNext] = useState(false)
  // Флаг наличия предыдущей страницы (для пагинации)
  const [hasPrevious, setHasPrevious] = useState(false)
  // Флаг открытия модального окна создания нового инвайта
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * loadInvites - загрузка списка инвайтов
   * 
   * Функциональность:
   * - Загружает список инвайтов с учетом фильтров
   * - Применяет поиск и фильтр по статусу
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * 
   * Поведение:
   * - Вызывается при изменении page или statusFilter
   * - В текущей реализации использует моковые данные с фильтрацией
   * - В будущем будет использовать API для загрузки данных
   * 
   * Связи:
   * - invitesApi: API для получения списка инвайтов
   * 
   * TODO: Заменить моковые данные на реальный API вызов
   */
  const loadInvites = async () => {
    // Пока используем моковые данные
    setLoading(true)
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Фильтрация моковых данных
      let filteredInvites = [...MOCK_INVITES]
      
      // Фильтр по поиску: проверяет имя кандидата и название вакансии
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredInvites = filteredInvites.filter(invite =>
          invite.candidate_name?.toLowerCase().includes(query) ||
          invite.vacancy_title?.toLowerCase().includes(query)
        )
      }
      
      // Фильтр по статусу: если выбран не 'all', фильтрует по статусу
      if (statusFilter && statusFilter !== 'all') {
        filteredInvites = filteredInvites.filter(invite => invite.status === statusFilter)
      }
      
      setInvites(filteredInvites)
      setTotalCount(filteredInvites.length)
      setHasNext(false)
      setHasPrevious(false)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await invitesApi.getAll({
        search: searchQuery || undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        page,
        page_size: 20,
      })

      if (response.error) {
        toast.showError('Ошибка загрузки', response.error)
        return
      }

      if (response.data) {
        setInvites(response.data.results)
        setTotalCount(response.data.count)
        setHasNext(!!response.data.next)
        setHasPrevious(!!response.data.previous)
      }
      */
    } catch (error) {
      toast.showError('Ошибка загрузки', 'Не удалось загрузить инвайты')
      console.error('Error loading invites:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * useEffect - загрузка инвайтов при изменении страницы или фильтра статуса
   * 
   * Функциональность:
   * - Вызывает loadInvites() при изменении page или statusFilter
   * 
   * Поведение:
   * - Выполняется при изменении page (переключение страниц пагинации)
   * - Выполняется при изменении statusFilter (изменение фильтра по статусу)
   * - Загружает инвайты с учетом текущих фильтров
   */
  useEffect(() => {
    loadInvites()
  }, [page, statusFilter])

  /**
   * useEffect - debounce для поиска
   * 
   * Функциональность:
   * - Задерживает загрузку инвайтов на 500мс после ввода поискового запроса
   * - Если текущая страница не первая - сбрасывает на первую страницу
   * 
   * Поведение:
   * - Выполняется при изменении searchQuery
   * - Использует debounce для уменьшения количества запросов при вводе
   * - Очищает таймер при размонтировании или изменении searchQuery
   * 
   * Причина debounce:
   * - Предотвращает избыточные запросы при быстром вводе текста
   * - Улучшает производительность и снижает нагрузку на сервер
   */
  useEffect(() => {
    // Debounce для поиска: задержка 500мс перед загрузкой
    const timer = setTimeout(() => {
      if (page === 1) {
        // Если уже на первой странице - просто загружаем
        loadInvites()
      } else {
        // Если не на первой странице - сбрасываем на первую
        setPage(1)
      }
    }, 500)

    // Очищаем таймер при размонтировании или изменении searchQuery
    return () => clearTimeout(timer)
  }, [searchQuery])

  /**
   * handleDelete - обработчик удаления инвайта
   * 
   * Функциональность:
   * - Показывает подтверждение удаления
   * - Удаляет инвайт через API
   * - Обновляет список инвайтов после удаления
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления
   * - Показывает confirm диалог для подтверждения
   * - При подтверждении отправляет запрос на удаление
   * - После успешного удаления обновляет список инвайтов
   * 
   * @param id - ID инвайта для удаления
   */
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот инвайт?')) {
      return
    }

    try {
      const response = await invitesApi.delete(id)
      if (response.error) {
        toast.showError('Ошибка удаления', response.error)
        return
      }
      toast.showSuccess('Успешно', 'Инвайт успешно удален')
      loadInvites() // Обновляем список после удаления
    } catch (error) {
      toast.showError('Ошибка удаления', 'Не удалось удалить инвайт')
      console.error('Error deleting invite:', error)
    }
  }

  /**
   * handleCopyInvitation - обработчик копирования текста инвайта
   * 
   * Функциональность:
   * - Получает текст инвайта через API
   * - Копирует текст в буфер обмена
   * - Показывает уведомление об успешном копировании
   * 
   * Поведение:
   * - Вызывается при клике на кнопку копирования текста инвайта
   * - Запрашивает текст инвайта через API
   * - Копирует текст в буфер обмена браузера
   * - Показывает toast-уведомление об успехе или ошибке
   * 
   * @param id - ID инвайта для копирования текста
   */
  const handleCopyInvitation = async (id: number) => {
    try {
      const response = await invitesApi.getInvitationText(id)
      if (response.error || !response.data?.success) {
        toast.showError('Ошибка', 'Не удалось получить текст инвайта')
        return
      }

      if (response.data.invitation_text) {
        await navigator.clipboard.writeText(response.data.invitation_text)
        toast.showSuccess('Успешно', 'Текст инвайта скопирован в буфер обмена')
      }
    } catch (error) {
      toast.showError('Ошибка', 'Не удалось скопировать текст инвайта')
      console.error('Error copying invitation:', error)
    }
  }

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует ISO строку даты в читаемый формат
   * - Обрабатывает ошибки парсинга даты
   * 
   * Используется для:
   * - Отображения дат создания и времени интервью в таблице
   * 
   * @param dateString - дата в формате ISO строки
   * @returns отформатированная дата в формате DD.MM.YYYY HH:MM или исходная строка при ошибке
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString // Возвращаем исходную строку при ошибке парсинга
    }
  }

  return (
    <AppLayout pageTitle="Интервью">
      <Box className={styles.invitesContainer}>
        {/* Заголовок и действия */}
        <Flex justify="between" align="center" mb="4">
          <Text size="6" weight="bold">Список инвайтов</Text>
          <Flex gap="2">
            <Button onClick={loadInvites} variant="soft" disabled={loading}>
              <ReloadIcon />
              Обновить
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon />
              Создать инвайт
            </Button>
          </Flex>
        </Flex>

        {/* Статистика */}
        <InvitesStats
          total={MOCK_STATS.total}
          pending={MOCK_STATS.pending}
          sent={MOCK_STATS.sent}
          completed={MOCK_STATS.completed}
        />

        {/* Фильтры и поиск */}
        <Card mb="4">
          <Box p="4">
            <Flex gap="3" align="end">
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  Поиск
                </Text>
                <TextField.Root
                  placeholder="Поиск по кандидату или вакансии"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                >
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Box>
              <Box style={{ width: '200px' }}>
                <Text size="2" weight="medium" mb="2" as="div">
                  Статус
                </Text>
                <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
                  <Select.Trigger placeholder="Все статусы" />
                  <Select.Content>
                    {STATUS_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Button
                variant="soft"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setPage(1)
                }}
              >
                Сбросить
              </Button>
            </Flex>
          </Box>
        </Card>

        {/* Список инвайтов */}
        <Card>
          <Box p="4">
            <Flex justify="between" align="center" mb="4">
              <Text size="4" weight="medium">
                Инвайты ({totalCount})
              </Text>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" py="8">
                <Text size="3" color="gray">
                  Загрузка...
                </Text>
              </Flex>
            ) : invites.length === 0 ? (
              <Flex direction="column" justify="center" align="center" py="8">
                <CalendarIcon width="48" height="48" style={{ opacity: 0.3, marginBottom: '16px' }} />
                <Text size="4" weight="medium" color="gray" mb="2">
                  Инвайты не найдены
                </Text>
                <Text size="2" color="gray" mb="4">
                  Создайте первый инвайт, чтобы начать работу
                </Text>
                <Button onClick={() => window.open('/google-oauth/invites/create/', '_blank')}>
                  <PlusIcon />
                  Создать инвайт
                </Button>
              </Flex>
            ) : (
              <>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Кандидат</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Вакансия</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Дата интервью</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Создан</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {invites.map((invite) => (
                      <Table.Row key={invite.id}>
                        <Table.Cell>
                          <Text
                            style={{ color: 'var(--accent-9)', cursor: 'pointer' }}
                            onClick={() => router.push(`/invites/${invite.id}`)}
                          >
                            {invite.candidate_name || 'Не указано'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{invite.vacancy_title || 'Не указано'}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <CalendarIcon width="14" height="14" />
                            <Text size="2">
                              {invite.interview_datetime_formatted || formatDate(invite.interview_datetime)}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={(STATUS_COLORS[invite.status] || 'gray') as any}>
                            {invite.status_display || invite.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {formatDate(invite.created_at)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => router.push(`/invites/${invite.id}`)}
                              title="Просмотр"
                            >
                              <EyeOpenIcon />
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => router.push(`/invites/${invite.id}/edit`)}
                              title="Редактировать"
                            >
                              <Pencil1Icon />
                            </Button>
                            {invite.google_drive_file_url && (
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => window.open(invite.google_drive_file_url!, '_blank')}
                                title="Открыть Scorecard"
                              >
                                <FileTextIcon />
                              </Button>
                            )}
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => handleCopyInvitation(invite.id)}
                              title="Копировать текст инвайта"
                            >
                              <FileTextIcon />
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={() => handleDelete(invite.id)}
                              title="Удалить"
                            >
                              <TrashIcon />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

                {/* Пагинация */}
                {(hasNext || hasPrevious) && (
                  <Flex justify="center" align="center" gap="3" mt="4">
                    <Button
                      variant="soft"
                      disabled={!hasPrevious || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Предыдущая
                    </Button>
                    <Text size="2" color="gray">
                      Страница {page} из {Math.ceil(totalCount / 20)}
                    </Text>
                    <Button
                      variant="soft"
                      disabled={!hasNext || loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Следующая
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Box>
        </Card>
      </Box>

      {/* Модальное окно создания инвайта */}
      <CreateInviteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(data) => {
          console.log('Invite created:', data)
          // Обновляем список инвайтов после создания
          loadInvites()
        }}
      />
    </AppLayout>
  )
}

export default InvitesPage
