'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Select, Badge, Table, Avatar } from "@radix-ui/themes"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  position: string
  groups: string[]
  is_active: boolean
  last_login: string | null
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState<Partial<User>>({
    email: '',
    first_name: '',
    last_name: '',
    position: '',
    groups: [],
    is_active: true,
  })

  const [availableGroups] = useState<string[]>([
    'Администраторы',
    'Рекрутеры',
    'Менеджеры',
  ])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // TODO: Заменить на реальный API вызов
      // const data = await api.getUsers()
      
      // Демо данные для примера
      const demoData: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          first_name: 'Иван',
          last_name: 'Иванов',
          position: 'Администратор',
          groups: ['Администраторы'],
          is_active: true,
          last_login: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: '2',
          email: 'recruiter1@example.com',
          first_name: 'Мария',
          last_name: 'Петрова',
          position: 'Рекрутер',
          groups: ['Рекрутеры'],
          is_active: true,
          last_login: new Date(Date.now() - 7200000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        },
        {
          id: '3',
          email: 'manager1@example.com',
          first_name: 'Алексей',
          last_name: 'Сидоров',
          position: 'Менеджер',
          groups: ['Менеджеры'],
          is_active: true,
          last_login: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        },
        {
          id: '4',
          email: 'recruiter2@example.com',
          first_name: 'Елена',
          last_name: 'Козлова',
          position: 'Старший рекрутер',
          groups: ['Рекрутеры'],
          is_active: false,
          last_login: new Date(Date.now() - 86400000 * 7).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
        },
      ]
      
      setUsers(demoData)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name) {
      alert('Заполните обязательные поля: Email, Имя, Фамилия')
      return
    }

    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.createUser(newUser)
      
      console.log('Creating user:', newUser)
      
      // Симуляция создания
      setTimeout(() => {
        setShowAddForm(false)
        setNewUser({
          email: '',
          first_name: '',
          last_name: '',
          position: '',
          groups: [],
          is_active: true,
        })
        loadUsers()
      }, 500)
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Ошибка при создании пользователя')
    } finally {
      setSaving(false)
    }
  }

  const handleEditUser = async (user: User) => {
    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.updateUser(user.id, user)
      
      console.log('Updating user:', user)
      
      // Симуляция обновления
      setTimeout(() => {
        setEditingUser(null)
        loadUsers()
      }, 500)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Ошибка при обновлении пользователя')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return
    }

    try {
      // TODO: Заменить на реальный API вызов
      // await api.deleteUser(id)
      
      console.log('Deleting user:', id)
      
      // Симуляция удаления
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Ошибка при удалении пользователя')
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.position.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда'
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <AppLayout pageTitle="Пользователи">
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
            <Text size="8" weight="bold">Пользователи</Text>
          </Flex>
          <Text size="3" color="gray">
            Управление пользователями системы: добавление, редактирование и удаление учетных записей
          </Text>
        </Box>

        {/* Панель поиска и кнопка добавления */}
        <Flex gap="3" align="center">
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <TextField.Root
              size="3"
              placeholder="Поиск пользователей..."
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
            Добавить пользователя
          </Button>
        </Flex>

        {/* Форма добавления нового пользователя */}
        {showAddForm && (
          <Box
            style={{
              padding: '20px',
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              backgroundColor: 'var(--gray-2)',
            }}
          >
            <Flex direction="column" gap="3">
              <Text size="5" weight="bold">Добавить пользователя</Text>
              
              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Email *</Text>
                  <TextField.Root
                    size="2"
                    placeholder="email@example.com"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </Box>
                
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Имя *</Text>
                  <TextField.Root
                    size="2"
                    placeholder="Имя"
                    value={newUser.first_name || ''}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  />
                </Box>
                
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Фамилия *</Text>
                  <TextField.Root
                    size="2"
                    placeholder="Фамилия"
                    value={newUser.last_name || ''}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  />
                </Box>
                
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Должность</Text>
                  <TextField.Root
                    size="2"
                    placeholder="Должность"
                    value={newUser.position || ''}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                  />
                </Box>
              </Flex>

              <Flex gap="2" align="center">
                <Button
                  size="2"
                  onClick={handleAddUser}
                  disabled={saving}
                >
                  <CheckIcon width={16} height={16} />
                  Сохранить
                </Button>
                <Button
                  size="2"
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewUser({
                      email: '',
                      first_name: '',
                      last_name: '',
                      position: '',
                      groups: [],
                      is_active: true,
                    })
                  }}
                >
                  <Cross2Icon width={16} height={16} />
                  Отмена
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Таблица пользователей */}
        {loading ? (
          <Box>
            <Text>Загрузка...</Text>
          </Box>
        ) : (
          <Box
            style={{
              border: '1px solid var(--gray-6)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Пользователь</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Должность</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Группы</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Последний вход</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '100px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredUsers.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={7}>
                      <Text align="center" color="gray">
                        {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredUsers.map((user) => (
                    <Table.Row key={user.id}>
                      {editingUser?.id === user.id ? (
                        <>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <Avatar
                                size="2"
                                fallback={getInitials(user.first_name, user.last_name)}
                              />
                              <Flex direction="column" gap="1">
                                <TextField.Root
                                  size="1"
                                  placeholder="Имя"
                                  value={user.first_name}
                                  onChange={(e) => setEditingUser({ ...user, first_name: e.target.value })}
                                />
                                <TextField.Root
                                  size="1"
                                  placeholder="Фамилия"
                                  value={user.last_name}
                                  onChange={(e) => setEditingUser({ ...user, last_name: e.target.value })}
                                />
                              </Flex>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root
                              size="1"
                              placeholder="Email"
                              value={user.email}
                              onChange={(e) => setEditingUser({ ...user, email: e.target.value })}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root
                              size="1"
                              placeholder="Должность"
                              value={user.position}
                              onChange={(e) => setEditingUser({ ...user, position: e.target.value })}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Select.Root
                              value={user.groups[0] || 'none'}
                              onValueChange={(value) => setEditingUser({ ...user, groups: value === 'none' ? [] : [value] })}
                            >
                              <Select.Trigger size="1" />
                              <Select.Content>
                                <Select.Item value="none">Без группы</Select.Item>
                                {availableGroups.map((group) => (
                                  <Select.Item key={group} value={group}>
                                    {group}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <Select.Root
                              value={user.is_active ? 'active' : 'inactive'}
                              onValueChange={(value) => setEditingUser({ ...user, is_active: value === 'active' })}
                            >
                              <Select.Trigger size="1" />
                              <Select.Content>
                                <Select.Item value="active">Активен</Select.Item>
                                <Select.Item value="inactive">Неактивен</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="1" color="gray">
                              {formatDate(user.last_login)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                color="green"
                                onClick={() => handleEditUser(editingUser)}
                                disabled={saving}
                              >
                                <CheckIcon width={12} height={12} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                color="gray"
                                onClick={() => setEditingUser(null)}
                              >
                                <Cross2Icon width={12} height={12} />
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </>
                      ) : (
                        <>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <Avatar
                                size="2"
                                fallback={getInitials(user.first_name, user.last_name)}
                              />
                              <Text size="2">
                                {user.first_name} {user.last_name}
                              </Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{user.email}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{user.position || '-'}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1" wrap="wrap">
                              {user.groups.length > 0 ? (
                                user.groups.map((group) => (
                                  <Badge key={group} size="1" variant="soft">
                                    {group}
                                  </Badge>
                                ))
                              ) : (
                                <Text size="1" color="gray">Без группы</Text>
                              )}
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="1"
                              color={user.is_active ? 'green' : 'red'}
                              variant="soft"
                            >
                              {user.is_active ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="1" color="gray">
                              {formatDate(user.last_login)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => setEditingUser(user)}
                              >
                                <Pencil1Icon width={12} height={12} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                color="red"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <TrashIcon width={12} height={12} />
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </>
                      )}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Flex>
    </AppLayout>
  )
}
