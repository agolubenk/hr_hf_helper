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
  FolderIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  CrossCircledIcon
} from "@radix-ui/react-icons"
import { invitesApi, Invite } from "@/lib/api"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './invite-detail.module.css'

const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  sent: 'blue',
  completed: 'green',
  cancelled: 'gray',
}

export default function InviteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const inviteId = params?.id ? parseInt(params.id as string, 10) : null
  
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (!inviteId) {
      router.push('/invites')
      return
    }

    loadInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteId])

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
                    <Badge color={STATUS_COLORS[invite.status] || 'gray'} mb="3">
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
