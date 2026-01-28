/**
 * UserGroupsPage (company-settings/user-groups/page.tsx) - Страница управления группами пользователей
 * 
 * Назначение:
 * - Управление группами пользователей компании
 * - Настройка прав доступа для групп
 * - Управление приложениями, доступными группам
 * - Создание, редактирование и удаление групп
 * 
 * Функциональность:
 * - Список всех групп пользователей
 * - Поиск групп по названию и описанию
 * - Форма добавления новой группы
 * - Форма редактирования группы (inline в таблице)
 * - Управление правами доступа через GroupAccessModal
 * - Управление приложениями для групп
 * - Отображение количества пользователей в группе
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - GroupAccessModal: модальное окно управления правами доступа и приложениями
 * - useToast: для отображения уведомлений (подтверждение удаления, успешное сохранение)
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * 
 * Поведение:
 * - При загрузке загружает список групп пользователей
 * - При поиске фильтрует группы по введенному запросу
 * - При добавлении группы показывает форму, при сохранении скрывает её
 * - При редактировании группы открывает inline-редактирование в таблице
 * - При удалении показывает подтверждение через toast
 * - При клике на "Настроить доступы" открывает GroupAccessModal
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Select, Badge, Table } from "@radix-ui/themes"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon, GearIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import GroupAccessModal, { type AccessRights, type ATSAccessRights, type RecruitingSettingsAccessRights } from "@/components/company-settings/GroupAccessModal"

/**
 * UserGroup - интерфейс группы пользователей
 * 
 * Структура:
 * - id: уникальный идентификатор группы
 * - name: название группы
 * - description: описание группы
 * - user_count: количество пользователей в группе (опционально)
 * - permissions: массив разрешений группы
 * - applications: массив приложений, доступных группе (опционально)
 * - access_rights: права доступа к разделам приложения (опционально)
 * - ats_access: детальные права доступа для ATS (блок Рекрутинг) (опционально)
 * - recruiting_settings_access: детальные права доступа для настроек рекрутинга (опционально)
 * - created_at, updated_at: даты создания и обновления
 */
interface UserGroup {
  id: string
  name: string
  description: string
  user_count?: number
  permissions: string[]
  applications?: string[]
  access_rights?: AccessRights
  ats_access?: ATSAccessRights
  recruiting_settings_access?: RecruitingSettingsAccessRights
  created_at: string
  updated_at: string
}

/**
 * UserGroupsPage - компонент страницы управления группами пользователей
 * 
 * Состояние:
 * - groups: массив всех групп пользователей
 * - loading: флаг загрузки данных
 * - saving: флаг сохранения данных
 * - searchTerm: поисковый запрос для фильтрации групп
 * - editingGroup: редактируемая группа (null если не редактируется)
 * - showAddForm: флаг отображения формы добавления группы
 * - accessModalOpen: флаг открытия модального окна прав доступа
 * - selectedGroup: группа, для которой открыто модальное окно прав доступа
 * - newGroup: данные новой группы для формы добавления
 */
export default function UserGroupsPage() {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Массив всех групп пользователей компании
  const [groups, setGroups] = useState<UserGroup[]>([])
  // Флаг загрузки данных групп
  const [loading, setLoading] = useState(true)
  // Флаг сохранения данных (показывает индикатор при создании/редактировании)
  const [saving, setSaving] = useState(false)
  // Поисковый запрос для фильтрации групп
  const [searchTerm, setSearchTerm] = useState('')
  // Редактируемая группа: null если не редактируется, иначе - объект группы
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null)
  // Флаг отображения формы добавления новой группы
  const [showAddForm, setShowAddForm] = useState(false)
  // Флаг открытия модального окна управления правами доступа
  const [accessModalOpen, setAccessModalOpen] = useState(false)
  // Группа, для которой открыто модальное окно прав доступа
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  // Данные новой группы для формы добавления
  const [newGroup, setNewGroup] = useState<Partial<UserGroup>>({
    name: '',
    description: '',
    permissions: [],
    applications: [],
    access_rights: {},
  })

  /**
   * useEffect - загрузка групп при монтировании компонента
   * 
   * Функциональность:
   * - Вызывает loadGroups() при монтировании компонента
   * 
   * Поведение:
   * - Выполняется один раз при загрузке страницы
   * - Загружает список всех групп пользователей компании
   */
  useEffect(() => {
    loadGroups()
  }, [])

  /**
   * loadGroups - загрузка списка групп пользователей
   * 
   * Функциональность:
   * - Загружает список всех групп пользователей компании
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * 
   * Поведение:
   * - Вызывается при монтировании компонента
   * - Показывает индикатор загрузки
   * - В текущей реализации использует моковые данные
   * 
   * Структура данных:
   * - Каждая группа содержит информацию о правах доступа и приложениях
   * - Группы могут иметь разное количество пользователей
   * 
   * Связи:
   * - API: должен вызывать endpoint для получения списка групп
   * 
   * TODO: Заменить на реальный API вызов
   * - GET /api/company-settings/user-groups/ - получение групп пользователей
   */
  const loadGroups = async () => {
    setLoading(true)
    try {
      // TODO: Заменить на реальный API вызов
      // const data = await api.getUserGroups()
      
      // Демо данные для примера
      const demoData: UserGroup[] = [
        {
          id: '1',
          name: 'Администраторы',
          description: 'Полный доступ ко всем функциям системы',
          user_count: 3,
          permissions: ['all'],
          applications: ['huntflow', 'telegram', 'notion', 'clickup', 'hhru'],
          access_rights: {
            home: { view: true, edit: true },
            vacancies: { view: true, edit: true },
            'vacancies-list': { view: true, edit: true },
            recruiting: { view: true, edit: true },
            interviewers: { view: true, edit: true },
            integrations: { view: true, edit: true },
            wiki: { view: true, edit: true },
            reporting: { view: true, edit: true },
            'company-settings': { view: true, edit: true },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Рекрутеры',
          description: 'Доступ к работе с кандидатами и вакансиями',
          user_count: 12,
          permissions: ['candidates', 'vacancies', 'interviews'],
          applications: ['huntflow', 'telegram'],
          access_rights: {
            home: { view: true, edit: false },
            vacancies: { view: true, edit: true },
            'vacancies-list': { view: true, edit: true },
            recruiting: { view: true, edit: true },
            interviewers: { view: true, edit: false },
            integrations: { view: true, edit: false },
            'integrations-huntflow': { view: true, edit: true },
            'integrations-telegram': { view: true, edit: true },
            wiki: { view: true, edit: false },
            reporting: { view: true, edit: false },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Менеджеры',
          description: 'Просмотр отчетов и статистики',
          user_count: 5,
          permissions: ['reports', 'analytics'],
          applications: ['huntflow'],
          access_rights: {
            home: { view: true, edit: false },
            vacancies: { view: true, edit: false },
            recruiting: { view: true, edit: false },
            interviewers: { view: true, edit: false },
            integrations: { view: true, edit: false },
            wiki: { view: true, edit: false },
            reporting: { view: true, edit: false },
            'reporting-main': { view: true, edit: false },
            'reporting-hiring-plan': { view: true, edit: false },
            'reporting-company': { view: true, edit: false },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      
      setGroups(demoData)
    } catch (error) {
      console.error('Error loading groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * handleAddGroup - обработчик добавления новой группы пользователей
   * 
   * Функциональность:
   * - Валидирует данные новой группы
   * - Создает новую группу пользователей
   * - Обновляет список групп
   * - Очищает форму добавления
   * 
   * Валидация:
   * - name: обязательное поле (не пустое)
   * 
   * Поведение:
   * - Проверяет наличие названия группы
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После создания перезагружает список групп
   * - Закрывает форму добавления
   * 
   * Используется для:
   * - Добавления новой группы при клике на "Добавить группу"
   * 
   * TODO: Реализовать создание через API
   * - POST /api/company-settings/user-groups/ - создание группы пользователей
   */
  const handleAddGroup = async () => {
    if (!newGroup.name) {
      alert('Введите название группы')
      return
    }

    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.createUserGroup(newGroup)
      
      console.log('Creating group:', newGroup)
      
      // Симуляция создания
      setTimeout(() => {
        setShowAddForm(false)
        setNewGroup({
          name: '',
          description: '',
          permissions: [],
        })
        setSaving(false)
        loadGroups()
      }, 500)
    } catch (error: any) {
      console.error('Error creating group:', error)
      setSaving(false)
    }
  }

  /**
   * handleEditGroup - обработчик сохранения изменений группы пользователей
   * 
   * Функциональность:
   * - Сохраняет изменения отредактированной группы
   * - Обновляет группу в списке
   * - Закрывает режим редактирования
   * 
   * Поведение:
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После сохранения перезагружает список групп
   * - Закрывает режим редактирования
   * 
   * Используется для:
   * - Сохранения изменений группы при клике на "Сохранить"
   * 
   * @param group - отредактированная группа для сохранения
   * 
   * TODO: Реализовать обновление через API
   * - PUT /api/company-settings/user-groups/{id}/ - обновление группы пользователей
   */
  const handleEditGroup = async (group: UserGroup) => {
    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.updateUserGroup(group.id, group)
      
      console.log('Updating group:', group)
      
      // Симуляция обновления
      setTimeout(() => {
        setEditingGroup(null)
        setSaving(false)
        loadGroups()
      }, 500)
    } catch (error: any) {
      console.error('Error updating group:', error)
      setSaving(false)
    }
  }

  /**
   * handleOpenAccessModal - обработчик открытия модального окна управления правами доступа
   * 
   * Функциональность:
   * - Открывает модальное окно для настройки прав доступа и приложений группы
   * - Устанавливает выбранную группу
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Настроить доступы"
   * - Устанавливает selectedGroup в выбранную группу
   * - Открывает модальное окно (accessModalOpen = true)
   * 
   * Используется для:
   * - Открытия модального окна настройки прав доступа для группы
   * 
   * @param group - группа, для которой открывается модальное окно
   */
  const handleOpenAccessModal = (group: UserGroup) => {
    setSelectedGroup(group)
    setAccessModalOpen(true)
  }

  /**
   * handleApplyAccess - обработчик применения изменений прав доступа и приложений
   * 
   * Функциональность:
   * - Применяет изменения прав доступа и приложений к выбранной группе
   * - Обновляет группу в списке
   * - Показывает уведомление об успешном сохранении
   * 
   * Поведение:
   * - Вызывается из GroupAccessModal при сохранении изменений
   * - Проверяет наличие selectedGroup
   * - Обновляет applications, access_rights и ats_access группы
   * - Обновляет группу в массиве groups
   * - Показывает toast-уведомление об успехе
   * 
   * Используется для:
   * - Применения изменений прав доступа и приложений из модального окна
   * 
   * @param applications - массив приложений, доступных группе
   * @param access - права доступа к разделам приложения
   * @param atsAccess - детальные права доступа для ATS (блок Рекрутинг)
   * @param recruitingSettingsAccess - детальные права доступа для настроек рекрутинга
   * 
   * TODO: Реализовать сохранение через API
   * - PUT /api/company-settings/user-groups/{id}/access/ - обновление прав доступа группы
   */
  const handleApplyAccess = (applications: string[], access: AccessRights, atsAccess?: ATSAccessRights, recruitingSettingsAccess?: RecruitingSettingsAccessRights) => {
    if (!selectedGroup) return
    
    const updatedGroup: UserGroup = {
      ...selectedGroup,
      applications,
      access_rights: access,
      ats_access: atsAccess,
      recruiting_settings_access: recruitingSettingsAccess,
    }
    
    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? updatedGroup : g))
    toast.showSuccess('Успешно', 'Доступы и приложения обновлены')
  }

  /**
   * handleDeleteGroup - обработчик удаления группы пользователей
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - При подтверждении вызывает performDeleteGroup
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления группы
   * - Показывает toast-уведомление с вопросом
   * - При подтверждении удаляет группу
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * - performDeleteGroup: выполняет фактическое удаление
   * 
   * @param id - ID группы для удаления
   */
  const handleDeleteGroup = (id: string) => {
    toast.showWarning('Удалить группу?', 'Вы уверены, что хотите удалить эту группу?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteGroup(id), variant: 'solid', color: 'red' },
      ],
    })
  }

  /**
   * performDeleteGroup - выполнение удаления группы пользователей
   * 
   * Функциональность:
   * - Удаляет группу из списка групп
   * - Обрабатывает ошибки удаления
   * 
   * Поведение:
   * - Вызывается после подтверждения удаления
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - Удаляет группу из состояния groups
   * - Показывает ошибку при неудачном удалении
   * 
   * Используется для:
   * - Фактического удаления группы после подтверждения
   * 
   * @param id - ID группы для удаления
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/company-settings/user-groups/{id}/ - удаление группы пользователей
   */
  const performDeleteGroup = async (id: string) => {
    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.deleteUserGroup(id)
      console.log('Deleting group:', id)
      setGroups(prev => prev.filter(g => g.id !== id))
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.showError('Ошибка', 'Ошибка при удалении группы')
    } finally {
      setSaving(false)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AppLayout pageTitle="Группы пользователей">
        <Flex
          direction="column"
          gap="4"
          style={{
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <Box>
            <Flex align="center" gap="2" mb="2">
              <Text size="2">👥</Text>
              <Text size="8" weight="bold">Группы пользователей</Text>
            </Flex>
            <Text size="3" color="gray">
              Управление группами пользователей и правами доступа
            </Text>
          </Box>
          <Flex align="center" justify="center" style={{ padding: '100px' }}>
            <Text size="3" color="gray">Загрузка...</Text>
          </Flex>
        </Flex>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Группы пользователей">
      <Flex
        direction="column"
        gap="4"
        style={{
          padding: '24px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Заголовок */}
        <Box>
          <Flex align="center" gap="2" mb="2">
            <Text size="2">👥</Text>
            <Text size="8" weight="bold">Группы пользователей</Text>
          </Flex>
          <Text size="3" color="gray">
            Управление группами пользователей и настройка прав доступа
          </Text>
        </Box>

        {/* Панель поиска и кнопка добавления */}
        <Flex gap="3" align="center">
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <TextField.Root
              size="3"
              placeholder="Поиск групп..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon width={16} height={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Button
            size="3"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <PlusIcon width={16} height={16} />
            Добавить группу
          </Button>
        </Flex>

        {/* Форма добавления новой группы */}
        {showAddForm && (
          <Box
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-panel)',
              border: '1px solid var(--gray-a6)',
              borderRadius: '12px',
            }}
          >
            <Text size="5" weight="bold" mb="4" style={{ display: 'block' }}>
              Новая группа
            </Text>
            
            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Название *
                </Text>
                <TextField.Root
                  size="2"
                  value={newGroup.name || ''}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Например: Рекрутеры"
                />
              </Box>
              
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Описание
                </Text>
                <TextField.Root
                  size="2"
                  value={newGroup.description || ''}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Описание группы и её назначения"
                />
              </Box>
              
              <Flex gap="2">
                <Button
                  size="3"
                  onClick={handleAddGroup}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Создать'}
                </Button>
                <Button
                  size="3"
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewGroup({
                      name: '',
                      description: '',
                      permissions: [],
                    })
                  }}
                >
                  Отмена
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Таблица групп */}
        <Box>
          {filteredGroups.length === 0 ? (
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              gap="3"
              style={{ padding: '100px 20px' }}
            >
              <Text size="8" style={{ opacity: 0.3 }}>👥</Text>
              <Text size="4" color="gray">Нет групп</Text>
              <Text size="2" color="gray">Добавьте первую группу для начала работы</Text>
            </Flex>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Пользователей</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Приложения</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '180px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredGroups.map(group => {
                  const isEditing = editingGroup?.id === group.id
                  
                  return (
                    <Table.Row key={group.id}>
                      <Table.Cell>
                        {isEditing ? (
                          <TextField.Root
                            size="2"
                            value={editingGroup.name || ''}
                            onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                            placeholder="Название"
                          />
                        ) : (
                          <Text size="3" weight="medium">{group.name}</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {isEditing ? (
                          <TextField.Root
                            size="2"
                            value={editingGroup.description || ''}
                            onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                            placeholder="Описание"
                          />
                        ) : (
                          <Text size="2" color="gray">{group.description}</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {group.user_count !== undefined && (
                          <Badge color="blue" size="2">
                            👥 {group.user_count}
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {group.applications && group.applications.length > 0 ? (
                          <Flex gap="1" wrap="wrap">
                            {group.applications.slice(0, 3).map(app => (
                              <Badge key={app} size="1" color="green">
                                {app}
                              </Badge>
                            ))}
                            {group.applications.length > 3 && (
                              <Badge size="1" color="gray">
                                +{group.applications.length - 3}
                              </Badge>
                            )}
                          </Flex>
                        ) : (
                          <Text size="2" color="gray">—</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {isEditing ? (
                          <Flex gap="2">
                            <Button
                              size="2"
                              variant="soft"
                              color="green"
                              onClick={() => handleEditGroup(editingGroup)}
                              disabled={saving}
                            >
                              <CheckIcon width={14} height={14} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="gray"
                              onClick={() => setEditingGroup(null)}
                            >
                              <Cross2Icon width={14} height={14} />
                            </Button>
                          </Flex>
                        ) : (
                          <Flex gap="2">
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => handleOpenAccessModal(group)}
                              title="Настроить доступы и приложения"
                            >
                              <GearIcon width={14} height={14} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => setEditingGroup({ ...group })}
                            >
                              <Pencil1Icon width={14} height={14} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              color="red"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <TrashIcon width={14} height={14} />
                            </Button>
                          </Flex>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          )}
        </Box>

        {/* Модальное окно управления доступами */}
        {selectedGroup && (
          <GroupAccessModal
            open={accessModalOpen}
            onOpenChange={setAccessModalOpen}
            groupName={selectedGroup.name}
            initialApplications={selectedGroup.applications || []}
            initialAccess={selectedGroup.access_rights}
            initialATSAccess={selectedGroup.ats_access}
            initialRecruitingSettingsAccess={selectedGroup.recruiting_settings_access}
            onApply={handleApplyAccess}
          />
        )}
      </Flex>
    </AppLayout>
  )
}
