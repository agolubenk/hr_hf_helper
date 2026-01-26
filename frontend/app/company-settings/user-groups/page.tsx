'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Select, Badge, Table } from "@radix-ui/themes"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon, GearIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import GroupAccessModal, { type AccessRights } from "@/components/company-settings/GroupAccessModal"

interface UserGroup {
  id: string
  name: string
  description: string
  user_count?: number
  permissions: string[]
  applications?: string[]
  access_rights?: AccessRights
  created_at: string
  updated_at: string
}

export default function UserGroupsPage() {
  const toast = useToast()
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [accessModalOpen, setAccessModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [newGroup, setNewGroup] = useState<Partial<UserGroup>>({
    name: '',
    description: '',
    permissions: [],
    applications: [],
    access_rights: {},
  })

  useEffect(() => {
    loadGroups()
  }, [])

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

  const handleOpenAccessModal = (group: UserGroup) => {
    setSelectedGroup(group)
    setAccessModalOpen(true)
  }

  const handleApplyAccess = (applications: string[], access: AccessRights) => {
    if (!selectedGroup) return
    
    const updatedGroup: UserGroup = {
      ...selectedGroup,
      applications,
      access_rights: access,
    }
    
    setGroups(prev => prev.map(g => g.id === selectedGroup.id ? updatedGroup : g))
    toast.showSuccess('Успешно', 'Доступы и приложения обновлены')
  }

  const handleDeleteGroup = (id: string) => {
    toast.showWarning('Удалить группу?', 'Вы уверены, что хотите удалить эту группу?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteGroup(id), variant: 'solid', color: 'red' },
      ],
    })
  }

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
            onApply={handleApplyAccess}
          />
        )}
      </Flex>
    </AppLayout>
  )
}
