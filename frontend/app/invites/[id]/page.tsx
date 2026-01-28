/**
 * InviteDetailPage (invites/[id]/page.tsx) - Страница детального просмотра инвайта
 * 
 * Назначение:
 * - Отображение полной информации об инвайте на интервью
 * - Просмотр данных кандидата, вакансии, времени интервью
 * - Управление инвайтом (копирование текста, пересоздание scorecard, удаление)
 * - Переход к редактированию инвайта
 * 
 * Функциональность:
 * - Загрузка данных инвайта по ID из URL
 * - Отображение информации о кандидате (имя, email, грейд, ссылка в Huntflow)
 * - Отображение информации о вакансии
 * - Отображение времени и формата интервью
 * - Отображение ссылок на Google Meet и Google Calendar
 * - Отображение ссылки на Scorecard в Google Drive
 * - Кнопка копирования текста инвайта
 * - Кнопка пересоздания Scorecard
 * - Кнопка редактирования инвайта
 * - Кнопка удаления инвайта
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useParams: получение ID инвайта из URL
 * - useRouter: для навигации после удаления
 * - useToast: для отображения уведомлений
 * - invitesApi: API для работы с инвайтами
 * - invites/[id]/edit/page.tsx: страница редактирования инвайта
 * - invites/page.tsx: страница списка инвайтов, откуда происходит переход
 * 
 * Поведение:
 * - При загрузке загружает данные инвайта по ID из URL
 * - Если ID отсутствует - перенаправляет на список инвайтов
 * - При копировании текста инвайта получает текст через API и копирует в буфер обмена
 * - При пересоздании Scorecard отправляет запрос на сервер
 * - При удалении показывает подтверждение и удаляет инвайт
 * - После удаления возвращается на страницу списка инвайтов
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card, Badge, Separator } from "@radix-ui/themes"
import { 
  ArrowLeftIcon,
  PlusIcon,
  CopyIcon,
  Pencil1Icon,
  TrashIcon,
  ReloadIcon,
  ExternalLinkIcon,
  CalendarIcon,
  VideoIcon,
  FileTextIcon,
  BoxIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  CrossCircledIcon
} from "@radix-ui/react-icons"
import { invitesApi, Invite } from "@/lib/api"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './invite-detail.module.css'

/**
 * STATUS_COLORS - маппинг статусов инвайта на цвета для Badge
 * 
 * Используется для:
 * - Отображения статуса инвайта с соответствующим цветом
 * 
 * Статусы:
 * - pending: ожидает отправки (желтый)
 * - sent: отправлен (синий)
 * - completed: завершен (зеленый)
 * - cancelled: отменен (серый)
 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  sent: 'blue',
  completed: 'green',
  cancelled: 'gray',
}

/**
 * InviteDetailPage - компонент страницы детального просмотра инвайта
 * 
 * Состояние:
 * - invite: данные инвайта для отображения
 * - loading: флаг загрузки данных
 */
export default function InviteDetailPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Получение динамических параметров из URL
  const params = useParams()
  // Хук для отображения уведомлений
  const toast = useToast()
  // ID инвайта из URL параметра [id] (преобразуется в число)
  const inviteId = params?.id ? parseInt(params.id as string, 10) : null
  
  // Данные инвайта для отображения
  const [invite, setInvite] = useState<Invite | null>(null)
  // Флаг загрузки данных инвайта
  const [loading, setLoading] = useState(true)

  /**
   * loadInvite - загрузка данных инвайта для детального просмотра
   * 
   * Функциональность:
   * - Загружает данные инвайта по ID из URL
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * - Перенаправляет на список инвайтов при ошибке
   * 
   * Поведение:
   * - Вызывается при монтировании компонента или изменении inviteId
   * - В текущей реализации использует моковые данные
   * - В будущем будет использовать API для загрузки данных
   * 
   * Связи:
   * - invitesApi.getById: API для получения инвайта по ID
   * 
   * TODO: Заменить моковые данные на реальный API вызов
   */
  const loadInvite = async () => {
    if (!inviteId) return

    setLoading(true)
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Моковые данные для тестирования
      // Генерируем разные данные в зависимости от ID для разнообразия
      const mockInvites: Record<number, Invite> = {
        1: {
          id: 1,
          candidate_name: 'Иванов Иван Иванович',
          candidate_email: 'ivanov@example.com',
          candidate_url: 'https://huntflow.ru/candidates/123',
          candidate_id: '123',
          candidate_grade: 'Middle',
          vacancy_id: '456',
          vacancy_title: 'Frontend Developer',
          interview_datetime: '2026-01-30T14:00:00Z',
          interview_datetime_formatted: '30.01.2026 14:00',
          status: 'pending',
          status_display: 'Ожидает',
          interview_format: 'online',
          google_meet_url: 'https://meet.google.com/abc-defg-hij',
          calendar_event_url: 'https://calendar.google.com/event?eid=xyz',
          calendar_event_id: 'event_123',
          google_drive_file_url: 'https://drive.google.com/file/d/123',
          google_drive_file_id: 'file_123',
          created_at: '2026-01-26T10:00:00Z',
          updated_at: '2026-01-26T10:00:00Z',
        },
        2: {
          id: 2,
          candidate_name: 'Петрова Мария Сергеевна',
          candidate_email: 'petrova@example.com',
          candidate_url: 'https://huntflow.ru/candidates/124',
          candidate_id: '124',
          candidate_grade: 'Senior',
          vacancy_id: '789',
          vacancy_title: 'Backend Developer',
          interview_datetime: '2026-01-31T15:30:00Z',
          interview_datetime_formatted: '31.01.2026 15:30',
          status: 'sent',
          status_display: 'Отправлен',
          interview_format: 'office',
          google_drive_file_url: 'https://drive.google.com/file/d/456',
          google_drive_file_id: 'file_456',
          created_at: '2026-01-25T09:00:00Z',
          updated_at: '2026-01-25T09:00:00Z',
        },
        3: {
          id: 3,
          candidate_name: 'Сидоров Алексей Викторович',
          candidate_email: 'sidorov@example.com',
          candidate_url: 'https://huntflow.ru/candidates/125',
          candidate_id: '125',
          candidate_grade: 'Junior',
          vacancy_id: '321',
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
      }
      
      const mockInvite = mockInvites[inviteId] || mockInvites[1]
      mockInvite.id = inviteId
      setInvite(mockInvite)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      const response = await invitesApi.getById(inviteId)
      
      if (response.error) {
        toast.showError('Ошибка загрузки', response.error)
        router.push('/invites')
        return
      }

      if (response.data) {
        setInvite(response.data)
      }
      */
    } catch (error) {
      toast.showError('Ошибка загрузки', 'Не удалось загрузить инвайт')
      console.error('Error loading invite:', error)
      router.push('/invites')
    } finally {
      setLoading(false)
    }
  }

  /**
   * useEffect - загрузка инвайта при монтировании компонента
   * 
   * Функциональность:
   * - Проверяет наличие inviteId в URL
   * - Перенаправляет на список инвайтов, если ID отсутствует
   * - Загружает данные инвайта при наличии ID
   * 
   * Поведение:
   * - Выполняется при монтировании компонента
   * - Выполняется при изменении inviteId (изменение URL)
   */
  useEffect(() => {
    if (!inviteId) {
      router.push('/invites')
      return
    }

    loadInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteId])

  /**
   * handleCopyInvitation - обработчик копирования текста инвайта в буфер обмена
   * 
   * Функциональность:
   * - Получает текст инвайта через API
   * - Копирует текст в буфер обмена браузера
   * - Показывает уведомление об успехе или ошибке
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Копировать приглашение"
   * - Запрашивает текст инвайта через invitesApi.getInvitationText
   * - Использует Clipboard API для копирования
   * - Обрабатывает ошибки получения или копирования текста
   * 
   * Связи:
   * - invitesApi.getInvitationText: API для получения текста инвайта
   * - navigator.clipboard: API браузера для работы с буфером обмена
   */
  const handleCopyInvitation = async () => {
    if (!inviteId) return

    try {
      const response = await invitesApi.getInvitationText(inviteId)
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
   * handleRegenerateScorecard - обработчик пересоздания Scorecard
   * 
   * Функциональность:
   * - Показывает подтверждение пересоздания Scorecard
   * - Отправляет запрос на пересоздание файла Scorecard в Google Drive
   * - Обновляет данные инвайта после пересоздания
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Пересоздать Scorecard"
   * - Показывает confirm диалог для подтверждения действия
   * - При подтверждении отправляет POST запрос на сервер
   * - После успешного пересоздания обновляет данные инвайта
   * 
   * Внимание:
   * - Пересоздание удаляет текущий файл Scorecard и создает новый
   * - Действие необратимо
   * 
   * TODO: Реализовать API endpoint для пересоздания Scorecard
   * - POST /api/v1/invites/{id}/regenerate-scorecard/
   * - Обработка ответа и обновление данных инвайта
   */
  const handleRegenerateScorecard = async () => {
    if (!inviteId) return

    if (!confirm('Вы уверены, что хотите пересоздать scorecard? Это удалит текущий файл и создаст новый.')) {
      return
    }

    try {
      // TODO: Когда будет готов API endpoint
      toast.showInfo('В разработке', 'Функция пересоздания scorecard будет доступна в ближайшее время')
      // const response = await fetch(`/google-oauth/invites/${inviteId}/regenerate-scorecard/`, {
      //   method: 'POST',
      //   headers: {
      //     'X-CSRFToken': getCsrfToken() || '',
      //     'Content-Type': 'application/json',
      //   },
      //   credentials: 'include',
      // })
      
      // if (!response.ok) {
      //   throw new Error('Ошибка пересоздания scorecard')
      // }
      
      // toast.showSuccess('Успешно', 'Scorecard успешно пересоздан')
      // loadInvite()
    } catch (error) {
      toast.showError('Ошибка', 'Не удалось пересоздать scorecard')
      console.error('Error regenerating scorecard:', error)
    }
  }

  /**
   * handleDelete - обработчик удаления инвайта
   * 
   * Функциональность:
   * - Показывает подтверждение удаления
   * - Удаляет инвайт через API
   * - Перенаправляет на список инвайтов после успешного удаления
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Удалить инвайт"
   * - Показывает confirm диалог для подтверждения
   * - При подтверждении отправляет DELETE запрос через invitesApi.delete
   * - После успешного удаления показывает уведомление и перенаправляет
   * - Обрабатывает ошибки удаления
   * 
   * Связи:
   * - invitesApi.delete: API для удаления инвайта
   * - router.push: навигация на список инвайтов
   */
  const handleDelete = async () => {
    if (!inviteId) return

    if (!confirm('Вы уверены, что хотите удалить этот инвайт?')) {
      return
    }

    try {
      const response = await invitesApi.delete(inviteId)
      if (response.error) {
        toast.showError('Ошибка удаления', response.error)
        return
      }
      toast.showSuccess('Успешно', 'Инвайт успешно удален')
      router.push('/invites')
    } catch (error) {
      toast.showError('Ошибка удаления', 'Не удалось удалить инвайт')
      console.error('Error deleting invite:', error)
    }
  }

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует ISO строку даты в читаемый формат
   * - Обрабатывает ошибки парсинга даты
   * 
   * Формат вывода:
   * - DD.MM.YYYY HH:MM (например, "26.01.2026 10:00")
   * 
   * Используется для:
   * - Отображения дат создания и обновления инвайта
   * - Отображения времени интервью в метаданных
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
      return dateString
    }
  }

  if (loading) {
    return (
      <AppLayout pageTitle="Загрузка...">
        <Box className={styles.inviteDetailContainer}>
          <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
            <Text size="3" color="gray">Загрузка...</Text>
          </Flex>
        </Box>
      </AppLayout>
    )
  }

  if (!invite) {
    return (
      <AppLayout pageTitle="Инвайт не найден">
        <Box className={styles.inviteDetailContainer}>
          <Flex direction="column" justify="center" align="center" style={{ minHeight: '400px' }} gap="4">
            <Text size="4" weight="medium" color="gray">Инвайт не найден</Text>
            <Button onClick={() => router.push('/invites')}>
              <ArrowLeftIcon />
              Вернуться к списку
            </Button>
          </Flex>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle={`Инвайт: ${invite.candidate_name || 'Не указано'}`}>
      <Box className={styles.inviteDetailContainer}>
        {/* Заголовок и действия */}
        <Flex justify="between" align="center" mb="4">
          <Text size="6" weight="bold">
            Инвайт: {invite.candidate_name || 'Не указано'}
          </Text>
          <Flex gap="2">
            <Button variant="soft" onClick={() => router.push('/invites')}>
              <ArrowLeftIcon />
              Назад к списку
            </Button>
            <Button onClick={() => router.push('/invites?create=true')}>
              <PlusIcon />
              Создать новый
            </Button>
          </Flex>
        </Flex>

        <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
          {/* Основной контент */}
          <Box style={{ flex: 2 }}>
            {/* Основная информация */}
            <Card mb="4">
              <Box p="4">
                <Text size="4" weight="bold" mb="4" as="div">Основная информация</Text>
                <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
                  <Box style={{ flex: 1 }}>
                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      Кандидат:
                    </Text>
                    <Text size="3" mb="3" as="div">
                      {invite.candidate_name || 'Не указано'}
                    </Text>

                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      ID кандидата:
                    </Text>
                    <Text size="2" color="gray" mb="3" as="div">
                      {invite.candidate_id || 'Не указано'}
                    </Text>

                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      Уровень кандидата:
                    </Text>
                    <Text size="2" color="gray" mb="3" as="div">
                      {invite.candidate_grade || 'Не указано'}
                    </Text>

                    {invite.candidate_url && (
                      <>
                        <Text size="2" weight="medium" mb="2" as="div" color="gray">
                          Ссылка на кандидата:
                        </Text>
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => window.open(invite.candidate_url!, '_blank')}
                        >
                          <ExternalLinkIcon />
                          Открыть в Huntflow
                        </Button>
                      </>
                    )}
                  </Box>

                  <Box style={{ flex: 1 }}>
                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      Вакансия:
                    </Text>
                    <Text size="3" mb="3" as="div">
                      {invite.vacancy_title || 'Не указано'}
                    </Text>

                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      ID вакансии:
                    </Text>
                    <Text size="2" color="gray" mb="3" as="div">
                      {invite.vacancy_id || 'Не указано'}
                    </Text>

                    <Text size="2" weight="medium" mb="2" as="div" color="gray">
                      Статус:
                    </Text>
                    <Badge color={(STATUS_COLORS[invite.status] || 'gray') as any} mb="3">
                      {invite.status_display || invite.status}
                    </Badge>
                  </Box>
                </Flex>
              </Box>
            </Card>

            {/* Google сервисы */}
            <Flex gap="4" direction={{ initial: 'column', md: 'row' }} mb="4">
              {/* Google Drive */}
              <Card style={{ flex: 1 }}>
                <Box p="4">
                  <Text size="4" weight="bold" mb="4" as="div">Google Drive</Text>
                  
                  {invite.google_drive_file_url ? (
                    <>
                      <Text size="2" weight="medium" mb="2" as="div" color="gray">
                        Scorecard:
                      </Text>
                      <Button
                        size="3"
                        variant="solid"
                        color="green"
                        onClick={() => window.open(invite.google_drive_file_url!, '_blank')}
                        style={{ width: '100%' }}
                        mb="3"
                      >
                        <FileTextIcon />
                        Открыть Scorecard
                      </Button>
                    </>
                  ) : invite.google_drive_file_id ? (
                    <Box mb="3">
                      <Badge color="yellow" mb="2">
                        <InfoCircledIcon />
                        Scorecard подготовлен, но не создан
                      </Badge>
                      <Text size="2" color="gray" as="div">
                        Для создания реального scorecard файла необходимо настроить Google OAuth интеграцию.
                      </Text>
                    </Box>
                  ) : (
                    <Box mb="3">
                      <Badge color="blue">
                        <InfoCircledIcon />
                        Scorecard не создан
                      </Badge>
                      <Text size="2" color="gray" mt="2" as="div">
                        Scorecard будет создан автоматически при настройке Google OAuth интеграции.
                      </Text>
                    </Box>
                  )}
                </Box>
              </Card>

              {/* Google Calendar */}
              <Card style={{ flex: 1 }}>
                <Box p="4">
                  <Text size="4" weight="bold" mb="4" as="div">Google Calendar</Text>
                  
                  {invite.calendar_event_url ? (
                    <>
                      <Text size="2" weight="medium" mb="2" as="div" color="gray">
                        Дата и время интервью:
                      </Text>
                      <Text size="3" weight="bold" color="blue" mb="3" as="div">
                        {invite.interview_datetime_formatted || formatDate(invite.interview_datetime)}
                      </Text>

                      <Text size="2" weight="medium" mb="2" as="div" color="gray">
                        Календарное событие:
                      </Text>
                      <Button
                        size="3"
                        variant="solid"
                        color="blue"
                        onClick={() => window.open(invite.calendar_event_url!, '_blank')}
                        style={{ width: '100%' }}
                        mb="3"
                      >
                        <CalendarIcon />
                        Открыть в календаре
                      </Button>

                      {invite.google_meet_url && (
                        <>
                          <Text size="2" weight="medium" mb="2" as="div" color="gray">
                            Google Meet:
                          </Text>
                          <Button
                            size="3"
                            variant="solid"
                            color="green"
                            onClick={() => window.open(invite.google_meet_url!, '_blank')}
                            style={{ width: '100%' }}
                            mb="3"
                          >
                            <VideoIcon />
                            Присоединиться к встрече
                          </Button>
                        </>
                      )}

                      {invite.calendar_event_id && (
                        <>
                          <Text size="2" weight="medium" mb="2" as="div" color="gray">
                            ID события:
                          </Text>
                          <Text size="1" color="gray" as="div" style={{ fontFamily: 'monospace' }}>
                            {invite.calendar_event_id}
                          </Text>
                        </>
                      )}

                      <Badge color="green" mt="3">
                        <CheckCircledIcon />
                        Событие создано
                      </Badge>
                    </>
                  ) : (
                    <Box>
                      <Badge color="yellow" mb="2">
                        <InfoCircledIcon />
                        Календарное событие не создано
                      </Badge>
                      <Text size="2" color="gray" mt="2" as="div">
                        Для создания календарного события необходимо настроить Google OAuth интеграцию.
                      </Text>
                    </Box>
                  )}
                </Box>
              </Card>
            </Flex>
          </Box>

          {/* Боковая панель */}
          <Box style={{ flex: 1 }}>
            {/* Действия */}
            <Card mb="4">
              <Box p="4">
                <Text size="4" weight="bold" mb="4" as="div">Действия</Text>
                <Flex direction="column" gap="2">
                  <Button
                    size="3"
                    variant="solid"
                    onClick={handleCopyInvitation}
                    style={{ width: '100%' }}
                  >
                    <CopyIcon />
                    Копировать приглашение
                  </Button>
                  
                  <Button
                    size="3"
                    variant="soft"
                    onClick={() => router.push(`/invites/${inviteId}/edit`)}
                    style={{ width: '100%' }}
                  >
                    <Pencil1Icon />
                    Редактировать
                  </Button>
                  
                  {invite.google_drive_file_url && (
                    <Button
                      size="3"
                      variant="soft"
                      onClick={handleRegenerateScorecard}
                      style={{ width: '100%' }}
                    >
                      <ReloadIcon />
                      Пересоздать Scorecard
                    </Button>
                  )}
                  
                  <Button
                    size="3"
                    variant="soft"
                    color="red"
                    onClick={handleDelete}
                    style={{ width: '100%' }}
                  >
                    <TrashIcon />
                    Удалить инвайт
                  </Button>
                </Flex>
              </Box>
            </Card>

            {/* Метаданные */}
            <Card>
              <Box p="4">
                <Text size="4" weight="bold" mb="4" as="div">Метаданные</Text>
                <Flex direction="column" gap="3">
                  <Box>
                    <Text size="2" weight="medium" mb="1" as="div" color="gray">
                      Создан:
                    </Text>
                    <Text size="2" color="gray" as="div">
                      {formatDate(invite.created_at)}
                    </Text>
                  </Box>
                  
                  <Separator />
                  
                  <Box>
                    <Text size="2" weight="medium" mb="1" as="div" color="gray">
                      Обновлен:
                    </Text>
                    <Text size="2" color="gray" as="div">
                      {formatDate(invite.updated_at)}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Card>
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
