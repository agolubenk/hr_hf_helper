'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card, TextField, Select, Separator } from "@radix-ui/themes"
import { 
  ArrowLeftIcon,
  CheckIcon,
  ReloadIcon,
  InfoCircledIcon,
  ExternalLinkIcon
} from "@radix-ui/react-icons"
import { invitesApi, Invite, vacanciesApi, Vacancy } from "@/lib/api"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './invite-edit.module.css'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
]

const INTERVIEW_FORMAT_OPTIONS = [
  { value: 'online', label: 'Онлайн' },
  { value: 'office', label: 'Офис' },
]

const CANDIDATE_GRADE_OPTIONS = [
  { value: 'Intern', label: 'Intern' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Middle', label: 'Middle' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Principal', label: 'Principal' },
]

export default function InviteEditPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const inviteId = params?.id ? parseInt(params.id as string, 10) : null
  
  const [invite, setInvite] = useState<Invite | null>(null)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [offices, setOffices] = useState<Array<{ id: number; name: string; address?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    interview_datetime: '',
    status: 'pending',
    interview_format: 'online',
    custom_duration_minutes: '',
    candidate_grade: '',
    candidate_url: '',
    vacancy_id: '',
    scorecard_template_url: '',
    office_id: '',
  })

  useEffect(() => {
    if (!inviteId) {
      router.push('/invites')
      return
    }

    loadData()
  }, [inviteId])

  const loadData = async () => {
    if (!inviteId) return

    setLoading(true)
    try {
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Моковые данные для тестирования
      const mockInvite: Invite = {
        id: inviteId,
        candidate_name: 'Иванов Иван Иванович',
        candidate_email: 'ivanov@example.com',
        candidate_url: 'https://huntflow.ru/my/org#/vacancy/456/filter/789/id/123',
        candidate_id: '123',
        candidate_grade: 'Middle',
        vacancy_id: '456',
        vacancy_title: 'Frontend Developer',
        interview_datetime: '2026-01-30T14:00:00Z',
        interview_datetime_formatted: '30.01.2026 14:00',
        status: 'pending',
        status_display: 'Ожидает',
        interview_format: 'online',
        custom_duration_minutes: 60,
        google_meet_url: 'https://meet.google.com/abc-defg-hij',
        calendar_event_url: 'https://calendar.google.com/event?eid=xyz',
        calendar_event_id: 'event_123',
        google_drive_file_url: 'https://drive.google.com/file/d/123',
        google_drive_file_id: 'file_123',
        created_at: '2026-01-26T10:00:00Z',
        updated_at: '2026-01-26T10:00:00Z',
      }
      
      setInvite(mockInvite)

      // Заполняем форму данными инвайта
      const interviewDate = new Date(mockInvite.interview_datetime)
      const localDateTime = new Date(interviewDate.getTime() - interviewDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      setFormData({
        candidate_name: mockInvite.candidate_name || '',
        interview_datetime: localDateTime,
        status: mockInvite.status || 'pending',
        interview_format: mockInvite.interview_format || 'online',
        custom_duration_minutes: mockInvite.custom_duration_minutes?.toString() || '',
        candidate_grade: mockInvite.candidate_grade || '',
        candidate_url: mockInvite.candidate_url || '',
        vacancy_id: mockInvite.vacancy_id || '',
        scorecard_template_url: 'https://docs.google.com/spreadsheets/d/123',
        office_id: '', // Будет заполняться только для офисных интервью
      })

      // Моковые данные для вакансий
      const mockVacancies: Vacancy[] = [
        { id: 1, name: 'Frontend Developer', title: 'Frontend Developer' },
        { id: 2, name: 'Backend Developer', title: 'Backend Developer' },
        { id: 3, name: 'DevOps Engineer', title: 'DevOps Engineer' },
        { id: 4, name: 'QA Engineer', title: 'QA Engineer' },
        { id: 5, name: 'Project Manager', title: 'Project Manager' },
      ]
      setVacancies(mockVacancies)

      // Моковые данные для офисов
      const mockOffices = [
        { id: 1, name: 'Москва, офис на Тверской', address: 'г. Москва, ул. Тверская, д. 10' },
        { id: 2, name: 'Санкт-Петербург, офис на Невском', address: 'г. Санкт-Петербург, Невский проспект, д. 28' },
        { id: 3, name: 'Казань, офис в центре', address: 'г. Казань, ул. Баумана, д. 58' },
        { id: 4, name: 'Новосибирск, офис на Ленина', address: 'г. Новосибирск, ул. Ленина, д. 12' },
      ]
      setOffices(mockOffices)
      
      // TODO: Когда будет готов API, раскомментировать:
      /*
      // Загружаем инвайт
      const inviteResponse = await invitesApi.getById(inviteId)
      
      if (inviteResponse.error || !inviteResponse.data) {
        toast.showError('Ошибка загрузки', inviteResponse.error || 'Не удалось загрузить инвайт')
        router.push('/invites')
        return
      }

      const inviteData = inviteResponse.data
      setInvite(inviteData)

      // Заполняем форму данными инвайта
      const interviewDate = new Date(inviteData.interview_datetime)
      const localDateTime = new Date(interviewDate.getTime() - interviewDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      setFormData({
        candidate_name: inviteData.candidate_name || '',
        interview_datetime: localDateTime,
        status: inviteData.status || 'pending',
        interview_format: inviteData.interview_format || 'online',
        custom_duration_minutes: inviteData.custom_duration_minutes?.toString() || '',
        candidate_grade: inviteData.candidate_grade || '',
        candidate_url: inviteData.candidate_url || '',
        vacancy_id: inviteData.vacancy_id || '',
        scorecard_template_url: '',
      })

      // Загружаем список вакансий
      const vacanciesResponse = await vacanciesApi.getAll()
      if (vacanciesResponse.data) {
        setVacancies(vacanciesResponse.data)
      }
      */
    } catch (error) {
      toast.showError('Ошибка загрузки', 'Не удалось загрузить данные')
      console.error('Error loading data:', error)
      router.push('/invites')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!inviteId) return

    // Валидация
    if (!formData.interview_datetime) {
      toast.showError('Ошибка', 'Укажите дату и время интервью')
      return
    }

    setSaving(true)
    try {
      // Форматируем дату для отправки
      const interviewDate = new Date(formData.interview_datetime)
      const isoString = interviewDate.toISOString()

      const updateData = {
        interview_datetime: isoString,
        status: formData.status,
        interview_format: formData.interview_format,
        custom_duration_minutes: formData.custom_duration_minutes ? parseInt(formData.custom_duration_minutes, 10) : null,
        candidate_name: formData.candidate_name,
        candidate_grade: formData.candidate_grade,
        candidate_url: formData.candidate_url,
        vacancy_id: formData.vacancy_id,
        scorecard_template_url: formData.scorecard_template_url,
        office_id: formData.interview_format === 'office' && formData.office_id ? parseInt(formData.office_id, 10) : null,
      }

      // TODO: Когда будет готов API endpoint для обновления, раскомментировать:
      /*
      const response = await invitesApi.update(inviteId, updateData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      */

      // Имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.showSuccess('Успешно', 'Инвайт успешно обновлен')
      router.push(`/invites/${inviteId}`)
    } catch (error) {
      toast.showError('Ошибка', 'Не удалось обновить инвайт')
      console.error('Error updating invite:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateScorecard = async () => {
    if (!inviteId) return

    toast.showWarning('Пересоздать Scorecard?', 'Вы уверены, что хотите пересоздать scorecard? Это удалит текущий файл и создаст новый.', {
      actions: [
        { 
          label: 'Отмена', 
          onClick: () => {}, 
          variant: 'soft', 
          color: 'gray' 
        },
        { 
          label: 'Пересоздать', 
          onClick: async () => {
            try {
              // TODO: Когда будет готов API endpoint
              toast.showInfo('В разработке', 'Функция пересоздания scorecard будет доступна в ближайшее время')
            } catch (error) {
              toast.showError('Ошибка', 'Не удалось пересоздать scorecard')
              console.error('Error regenerating scorecard:', error)
            }
          }, 
          variant: 'solid', 
          color: 'yellow' 
        },
      ],
    })
  }

  if (loading) {
    return (
      <AppLayout pageTitle="Загрузка...">
        <Box className={styles.inviteEditContainer}>
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
        <Box className={styles.inviteEditContainer}>
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
    <AppLayout pageTitle={`Редактировать инвайт: ${invite.candidate_name || 'Не указано'}`}>
      <Box className={styles.inviteEditContainer}>
        {/* Заголовок и действия */}
        <Flex justify="between" align="center" mb="4">
          <Text size="6" weight="bold">
            Редактировать инвайт: {invite.candidate_name || 'Не указано'}
          </Text>
          <Button variant="soft" onClick={() => router.push(`/invites/${inviteId}`)}>
            <ArrowLeftIcon />
            Назад
          </Button>
        </Flex>

        <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
          {/* Основная форма */}
          <Box style={{ flex: 2 }}>
            <Card>
              <Box p="4">
                <Text size="4" weight="bold" mb="4" as="div">Информация об инвайте</Text>
                
                <Flex direction="column" gap="4">
                  {/* Название кандидата */}
                  <Box>
                    <Text size="2" weight="medium" mb="2" as="div">
                      Название кандидата:
                    </Text>
                    <TextField.Root
                      value={formData.candidate_name}
                      onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                      placeholder="Имя кандидата"
                    />
                  </Box>

                  {/* Дата и время интервью */}
                  <Box>
                    <Text size="2" weight="medium" mb="2" as="div">
                      Дата и время интервью: *
                    </Text>
                    <TextField.Root
                      type="datetime-local"
                      value={formData.interview_datetime}
                      onChange={(e) => setFormData({ ...formData, interview_datetime: e.target.value })}
                      required
                    />
                  </Box>

                  {/* Статус и формат */}
                  <Flex gap="3" direction={{ initial: 'column', md: 'row' }}>
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Статус:
                      </Text>
                      <Select.Root
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {STATUS_OPTIONS.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Формат интервью:
                      </Text>
                      <Select.Root
                        value={formData.interview_format}
                        onValueChange={(value) => {
                          const newFormat = value as 'online' | 'office'
                          setFormData({ 
                            ...formData, 
                            interview_format: newFormat,
                            // Сбрасываем офис при смене формата на онлайн
                            office_id: newFormat === 'online' ? '' : formData.office_id
                          })
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {INTERVIEW_FORMAT_OPTIONS.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Flex>

                  {/* Офис (только для офисного формата) */}
                  {formData.interview_format === 'office' && (
                    <Box>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Офис: *
                      </Text>
                      <Select.Root
                        value={formData.office_id || 'none'}
                        onValueChange={(value) => setFormData({ ...formData, office_id: value === 'none' ? '' : value })}
                      >
                        <Select.Trigger placeholder="Выберите офис" />
                        <Select.Content>
                          <Select.Item value="none">Не выбрано</Select.Item>
                          {offices.map((office) => (
                            <Select.Item key={office.id} value={office.id.toString()}>
                              {office.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  )}

                  {/* Длительность и уровень */}
                  <Flex gap="3" direction={{ initial: 'column', md: 'row' }}>
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Длительность (минуты):
                      </Text>
                      <TextField.Root
                        type="number"
                        value={formData.custom_duration_minutes}
                        onChange={(e) => setFormData({ ...formData, custom_duration_minutes: e.target.value })}
                        placeholder="Например: 60"
                        min="15"
                        step="15"
                      />
                      <Text size="1" color="gray" mt="1" as="div">
                        Оставьте пустым для значения по умолчанию
                      </Text>
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Уровень кандидата:
                      </Text>
                      <Select.Root
                        value={formData.candidate_grade || 'none'}
                        onValueChange={(value) => setFormData({ ...formData, candidate_grade: value === 'none' ? '' : value })}
                      >
                        <Select.Trigger placeholder="Выберите уровень" />
                        <Select.Content>
                          <Select.Item value="none">Не указано</Select.Item>
                          {CANDIDATE_GRADE_OPTIONS.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Flex>

                  {/* Ссылка на кандидата */}
                  <Box>
                    <Text size="2" weight="medium" mb="2" as="div">
                      Ссылка на кандидата (Huntflow):
                    </Text>
                    <TextField.Root
                      value={formData.candidate_url}
                      onChange={(e) => setFormData({ ...formData, candidate_url: e.target.value })}
                      placeholder="https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789"
                    />
                    <Text size="1" color="gray" mt="1" as="div">
                      Ссылка на кандидата в Huntflow
                    </Text>
                  </Box>

                  {/* Вакансия */}
                  <Box>
                    <Text size="2" weight="medium" mb="2" as="div">
                      Вакансия:
                    </Text>
                    <Select.Root
                      value={formData.vacancy_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, vacancy_id: value === 'none' ? '' : value })}
                    >
                      <Select.Trigger placeholder="Выберите вакансию" />
                      <Select.Content>
                        <Select.Item value="none">Не выбрано</Select.Item>
                        {vacancies.map((vacancy) => (
                          <Select.Item key={vacancy.id} value={vacancy.id.toString()}>
                            {vacancy.name || vacancy.title || `Вакансия #${vacancy.id}`}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  {/* Ссылка на шаблон scorecard */}
                  <Box>
                    <Text size="2" weight="medium" mb="2" as="div">
                      Ссылка на шаблон scorecard:
                    </Text>
                    <TextField.Root
                      value={formData.scorecard_template_url}
                      onChange={(e) => setFormData({ ...formData, scorecard_template_url: e.target.value })}
                      placeholder="https://docs.google.com/spreadsheets/..."
                    />
                    <Text size="1" color="gray" mt="1" as="div">
                      Ссылка на шаблон scorecard для вакансии
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Card>
          </Box>

          {/* Боковая панель */}
          <Box style={{ flex: 1 }}>
            {/* Информация */}
            <Card mb="4">
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <InfoCircledIcon width={16} height={16} />
                  <Text size="3" weight="bold">Информация</Text>
                </Flex>
                
                <Separator mb="3" />
                
                <Text size="2" weight="medium" mb="2" as="div">
                  Формат ссылки на кандидата:
                </Text>
                <Box style={{ 
                  backgroundColor: 'var(--gray-2)', 
                  padding: '12px', 
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  marginBottom: '16px'
                }}>
                  <Text size="1" as="div" mb="1">
                    <strong>Sandbox:</strong>
                  </Text>
                  <Text size="1" color="gray" as="div" mb="2">
                    https://sandbox.huntflow.dev/my/org694#/vacancy/[id вакансии]/filter/[id статуса]/id/[id кандидата]
                  </Text>
                  <Text size="1" as="div" mb="1">
                    <strong>Production:</strong>
                  </Text>
                  <Text size="1" color="gray" as="div">
                    https://huntflow.ru/my/[название_аккаунта]#/vacancy/[id вакансии]/filter/[id статуса]/id/[id кандидата]
                  </Text>
                </Box>

                <Text size="2" color="gray" as="div">
                  Система автоматически определит доступность аккаунта через API.
                </Text>
              </Box>
            </Card>

            {/* Действия */}
            <Card>
              <Box p="4">
                <Text size="3" weight="bold" mb="3" as="div">Действия</Text>
                <Flex direction="column" gap="2">
                  {invite.candidate_id && (
                    <Button
                      size="3"
                      variant="soft"
                      onClick={() => {
                        const candidateId = invite.candidate_id
                        if (candidateId) {
                          router.push(`/recr-chat?candidate_id=${encodeURIComponent(candidateId)}`)
                        } else {
                          toast.showError('Ошибка', 'ID кандидата не указан')
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      <ExternalLinkIcon />
                      Открыть в ATS
                    </Button>
                  )}
                  {invite.google_drive_file_url && (
                    <Button
                      size="3"
                      variant="soft"
                      color="yellow"
                      onClick={handleRegenerateScorecard}
                      style={{ width: '100%' }}
                    >
                      <ReloadIcon />
                      Пересоздать Scorecard
                    </Button>
                  )}
                </Flex>
              </Box>
            </Card>
          </Box>
        </Flex>

        {/* Кнопки сохранения */}
        <Flex justify="end" gap="3" mt="4">
          <Button
            variant="soft"
            onClick={() => router.push(`/invites/${inviteId}`)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.interview_datetime}
          >
            <CheckIcon />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Flex>
      </Box>
    </AppLayout>
  )
}
