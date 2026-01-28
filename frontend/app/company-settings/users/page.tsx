/**
 * UsersPage (company-settings/users/page.tsx) - Страница управления пользователями компании
 * 
 * Назначение:
 * - Управление пользователями системы
 * - Добавление новых пользователей
 * - Редактирование существующих пользователей
 * - Удаление пользователей
 * - Управление правами доступа пользователей
 * - Поиск пользователей
 * 
 * Функциональность:
 * - Список всех пользователей компании
 * - Поиск пользователей по email, имени, фамилии, должности
 * - Форма добавления нового пользователя
 * - Форма редактирования пользователя
 * - Управление группами пользователя
 * - Управление правами доступа через UserAccessModal
 * - Активация/деактивация пользователей
 * - Отображение информации о последнем входе
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - UserAccessModal: модальное окно управления правами доступа
 * - useToast: для отображения уведомлений (подтверждение удаления)
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * 
 * Поведение:
 * - При загрузке загружает список пользователей
 * - При поиске фильтрует пользователей по введенному запросу
 * - При добавлении пользователя показывает форму, при сохранении скрывает её
 * - При редактировании пользователя открывает форму редактирования
 * - При удалении показывает подтверждение через toast
 * - При клике на "Права доступа" открывает UserAccessModal
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Select, Badge, Table, Avatar } from "@radix-ui/themes"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import UserAccessModal, { type AccessRights } from "@/components/company-settings/UserAccessModal"
import { useToast } from "@/components/Toast/ToastContext"

/**
 * User - интерфейс пользователя
 * 
 * Структура:
 * - id: уникальный идентификатор пользователя
 * - email: email пользователя
 * - first_name, last_name: имя и фамилия
 * - position: должность
 * - groups: массив групп пользователя
 * - is_active: флаг активности пользователя
 * - last_login: дата последнего входа (может быть null)
 * - created_at: дата создания учетной записи
 * - access: права доступа пользователя (опционально)
 */
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
  access?: AccessRights
}

/**
 * UsersPage - компонент страницы управления пользователями
 * 
 * Состояние:
 * - users: массив всех пользователей
 * - loading: флаг загрузки данных
 * - saving: флаг сохранения данных
 * - searchTerm: поисковый запрос для фильтрации пользователей
 * - editingUser: редактируемый пользователь (null если не редактируется)
 * - accessModalOpen: флаг открытия модального окна прав доступа
 * - showAddForm: флаг отображения формы добавления пользователя
 * - newUser: данные нового пользователя для формы добавления
 * - availableGroups: список доступных групп пользователей
 */
export default function UsersPage() {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Массив всех пользователей компании
  const [users, setUsers] = useState<User[]>([])
  // Флаг загрузки данных пользователей
  const [loading, setLoading] = useState(true)
  // Флаг сохранения данных (показывает индикатор при создании/редактировании)
  const [saving, setSaving] = useState(false)
  // Поисковый запрос для фильтрации пользователей
  const [searchTerm, setSearchTerm] = useState('')
  // Редактируемый пользователь: null если не редактируется, иначе - объект пользователя
  const [editingUser, setEditingUser] = useState<User | null>(null)
  // Флаг открытия модального окна управления правами доступа
  const [accessModalOpen, setAccessModalOpen] = useState(false)
  // Флаг отображения формы добавления нового пользователя
  const [showAddForm, setShowAddForm] = useState(false)
  // Данные нового пользователя для формы добавления
  const [newUser, setNewUser] = useState<Partial<User>>({
    email: '',
    first_name: '',
    last_name: '',
    position: '',
    groups: [],
    is_active: true,
  })

  /**
   * availableGroups - список доступных групп пользователей
   * 
   * Используется для:
   * - Выбора группы при создании/редактировании пользователя
   * - Отображения групп пользователя в списке
   * 
   * TODO: Загружать из API или настроек компании
   */
  const [availableGroups] = useState<string[]>([
    'Администраторы',
    'Рекрутеры',
    'Менеджеры',
  ])

  /**
   * useEffect - загрузка пользователей при монтировании компонента
   * 
   * Функциональность:
   * - Вызывает loadUsers() при монтировании компонента
   * 
   * Поведение:
   * - Выполняется один раз при загрузке страницы
   * - Загружает список всех пользователей компании
   */
  useEffect(() => {
    loadUsers()
  }, [])

  /**
   * loadUsers - загрузка списка пользователей
   * 
   * Функциональность:
   * - Загружает список всех пользователей компании
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * 
   * Поведение:
   * - Вызывается при монтировании компонента
   * - Показывает индикатор загрузки
   * - В текущей реализации использует моковые данные
   * 
   * Связи:
   * - API: должен вызывать endpoint для получения списка пользователей
   * 
   * TODO: Заменить на реальный API вызов
   */
  const loadUsers = async () => {
    setLoading(true) // Показываем индикатор загрузки
    try {
      // TODO: Заменить на реальный API вызов
      // const data = await api.getUsers()
      
      /**
       * Демо данные для примера
       * 
       * Структура каждого пользователя:
       * - id: уникальный идентификатор
       * - email: email пользователя
       * - first_name, last_name: имя и фамилия
       * - position: должность
       * - groups: массив групп пользователя
       * - is_active: флаг активности
       * - last_login: дата последнего входа
       * - created_at: дата создания учетной записи
       */
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

  /**
   * handleAddUser - обработчик добавления нового пользователя
   * 
   * Функциональность:
   * - Валидирует обязательные поля (email, имя, фамилия)
   * - Создает нового пользователя через API
   * - Скрывает форму добавления после успешного создания
   * - Очищает форму и обновляет список пользователей
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Сохранить" в форме добавления
   * - Показывает alert при отсутствии обязательных полей
   * - Показывает индикатор сохранения (saving)
   * - После успешного создания скрывает форму и обновляет список
   * 
   * Связи:
   * - newUser: данные нового пользователя из формы
   * - setShowAddForm: скрывает форму после создания
   * - loadUsers: обновляет список пользователей
   * 
   * TODO: Заменить на реальный API вызов
   */
  const handleAddUser = async () => {
    // Валидация обязательных полей
    if (!newUser.email || !newUser.first_name || !newUser.last_name) {
      alert('Заполните обязательные поля: Email, Имя, Фамилия')
      return
    }

    setSaving(true) // Показываем индикатор сохранения
    try {
      // TODO: Заменить на реальный API вызов
      // await api.createUser(newUser)
      
      console.log('Creating user:', newUser)
      
      // Симуляция создания (в реальном приложении будет API вызов)
      setTimeout(() => {
        setShowAddForm(false) // Скрываем форму добавления
        // Очищаем форму
        setNewUser({
          email: '',
          first_name: '',
          last_name: '',
          position: '',
          groups: [],
          is_active: true,
        })
        loadUsers() // Обновляем список пользователей
      }, 500)
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Ошибка при создании пользователя')
    } finally {
      setSaving(false) // Скрываем индикатор сохранения
    }
  }

  /**
   * handleEditUser - обработчик редактирования пользователя
   * 
   * Функциональность:
   * - Обновляет данные пользователя через API
   * - Закрывает режим редактирования после успешного обновления
   * - Обновляет список пользователей
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Сохранить" в режиме редактирования
   * - Показывает индикатор сохранения (saving)
   * - После успешного обновления закрывает режим редактирования
   * 
   * Связи:
   * - editingUser: редактируемый пользователь
   * - setEditingUser: закрывает режим редактирования
   * - loadUsers: обновляет список пользователей
   * 
   * @param user - пользователь с обновленными данными
   * 
   * TODO: Заменить на реальный API вызов
   */
  const handleEditUser = async (user: User) => {
    setSaving(true) // Показываем индикатор сохранения
    try {
      // TODO: Заменить на реальный API вызов
      // await api.updateUser(user.id, user)
      
      console.log('Updating user:', user)
      
      // Симуляция обновления (в реальном приложении будет API вызов)
      setTimeout(() => {
        setEditingUser(null) // Закрываем режим редактирования
        loadUsers() // Обновляем список пользователей
      }, 500)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Ошибка при обновлении пользователя')
    } finally {
      setSaving(false) // Скрываем индикатор сохранения
    }
  }

  /**
   * handleDeleteUser - обработчик удаления пользователя (показывает подтверждение)
   * 
   * Функциональность:
   * - Показывает модальное окно подтверждения удаления через toast
   * - При подтверждении вызывает performDeleteUser
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления пользователя
   * - Показывает toast с предупреждением и кнопками "Отмена" и "Удалить"
   * - При клике на "Удалить" вызывает performDeleteUser
   * 
   * Связи:
   * - toast.showWarning: показывает модальное окно подтверждения
   * - performDeleteUser: выполняет фактическое удаление
   * 
   * @param id - ID пользователя для удаления
   */
  const handleDeleteUser = (id: string) => {
    toast.showWarning('Удалить пользователя?', 'Вы уверены, что хотите удалить этого пользователя?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteUser(id), variant: 'solid', color: 'red' },
      ],
    })
  }

  /**
   * performDeleteUser - выполнение удаления пользователя
   * 
   * Функциональность:
   * - Удаляет пользователя через API
   * - Удаляет пользователя из локального состояния
   * - Обрабатывает ошибки удаления
   * 
   * Поведение:
   * - Вызывается из handleDeleteUser после подтверждения
   * - Удаляет пользователя из массива users
   * - Показывает toast-уведомление об ошибке при неудаче
   * 
   * Связи:
   * - setUsers: обновляет список пользователей (удаляет пользователя)
   * - toast.showError: показывает ошибку при неудаче
   * 
   * @param id - ID пользователя для удаления
   * 
   * TODO: Заменить на реальный API вызов
   */
  const performDeleteUser = async (id: string) => {
    try {
      // TODO: Заменить на реальный API вызов
      // await api.deleteUser(id)
      console.log('Deleting user:', id)
      // Удаляем пользователя из локального состояния
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.showError('Ошибка', 'Ошибка при удалении пользователя')
    }
  }

  /**
   * filteredUsers - отфильтрованный список пользователей по поисковому запросу
   * 
   * Функциональность:
   * - Фильтрует пользователей по поисковому запросу
   * - Ищет по email, имени, фамилии и должности
   * 
   * Поведение:
   * - Вычисляется при каждом рендере компонента
   * - Используется для отображения в таблице
   * - Поиск нечувствителен к регистру
   * 
   * Используется для:
   * - Отображения отфильтрованного списка в таблице
   * 
   * Связи:
   * - searchTerm: поисковый запрос для фильтрации
   * - users: исходный массив всех пользователей
   */
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    // Поиск по email, имени, фамилии и должности
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.position.toLowerCase().includes(searchLower)
    )
  })

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует ISO строку даты в читаемый формат
   * - Возвращает "Никогда" если дата отсутствует
   * 
   * Используется для:
   * - Отображения даты последнего входа пользователя
   * - Отображения даты создания учетной записи
   * 
   * @param dateString - дата в формате ISO строки или null
   * @returns отформатированная дата в формате DD.MM.YYYY HH:MM или "Никогда"
   */
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

  /**
   * getInitials - получение инициалов пользователя для аватара
   * 
   * Функциональность:
   * - Извлекает первые буквы имени и фамилии
   * - Преобразует в верхний регистр
   * 
   * Используется для:
   * - Отображения инициалов в Avatar компоненте
   * - Fallback для аватара, если изображение отсутствует
   * 
   * @param firstName - имя пользователя
   * @param lastName - фамилия пользователя
   * @returns строку с инициалами (например, "ИИ" для "Иван Иванов")
   */
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
                  <Table.ColumnHeaderCell>{editingUser ? 'Доступы' : 'Последний вход'}</Table.ColumnHeaderCell>
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
                            <Text size="2" color="gray">{user.email}</Text>
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
                              <Select.Trigger />
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
                              <Select.Trigger />
                              <Select.Content>
                                <Select.Item value="active">Активен</Select.Item>
                                <Select.Item value="inactive">Неактивен</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => setAccessModalOpen(true)}
                            >
                              Доступы
                            </Button>
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
                            {editingUser ? (
                              <Text size="1" color="gray">—</Text>
                            ) : (
                              <Text size="1" color="gray">
                                {formatDate(user.last_login)}
                              </Text>
                            )}
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

        <UserAccessModal
          open={accessModalOpen}
          onOpenChange={setAccessModalOpen}
          userName={editingUser ? `${editingUser.first_name} ${editingUser.last_name}` : ''}
          initialAccess={editingUser?.access}
          onApply={(access) => setEditingUser((prev) => (prev ? { ...prev, access } : null))}
        />
      </Flex>
    </AppLayout>
  )
}
