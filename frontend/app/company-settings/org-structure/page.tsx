/**
 * OrgStructurePage (company-settings/org-structure/page.tsx) - Страница управления организационной структурой
 * 
 * Назначение:
 * - Управление организационной структурой компании
 * - Создание и редактирование департаментов
 * - Построение иерархической структуры департаментов
 * - Управление подчиненностью департаментов
 * 
 * Функциональность:
 * - Древовидная структура департаментов с возможностью раскрытия/сворачивания
 * - Поиск департаментов по названию и описанию
 * - Форма добавления нового департамента
 * - Форма редактирования департамента (inline)
 * - Удаление департаментов
 * - Отображение количества сотрудников в департаменте
 * - Управление родительскими департаментами
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений (подтверждение удаления)
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * 
 * Поведение:
 * - При загрузке загружает иерархическую структуру департаментов
 * - При поиске фильтрует департаменты по введенному запросу
 * - При добавлении департамента показывает форму, при сохранении скрывает её
 * - При редактировании департамента открывает inline-редактирование
 * - При удалении показывает подтверждение через toast
 * - Все узлы дерева разворачиваются по умолчанию
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, TextArea, Select, Badge } from "@radix-ui/themes"
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './org-structure.module.css'

/**
 * Department - интерфейс департамента
 * 
 * Структура:
 * - id: уникальный идентификатор департамента
 * - name: название департамента
 * - slug: URL-дружественный идентификатор
 * - short_name: краткое название
 * - parent: ID родительского департамента (null для корневых)
 * - description: описание департамента
 * - manager: ID менеджера департамента (опционально)
 * - location: местоположение департамента (опционально)
 * - created_at, updated_at: даты создания и обновления
 * - employee_count: количество сотрудников в департаменте (опционально)
 * - children: массив дочерних департаментов (для иерархической структуры)
 */
interface Department {
  id: string
  name: string
  slug: string
  short_name: string
  parent: string | null
  description: string
  manager: string | null
  location: string | null
  created_at: string
  updated_at: string
  employee_count?: number
  children?: Department[]
}

/**
 * OrgStructurePage - компонент страницы управления организационной структурой
 * 
 * Состояние:
 * - departments: массив департаментов (иерархическая структура)
 * - loading: флаг загрузки данных
 * - saving: флаг сохранения данных
 * - searchTerm: поисковый запрос для фильтрации департаментов
 * - expandedNodes: множество ID развернутых узлов дерева
 * - editingDepartment: редактируемый департамент (null если не редактируется)
 * - showAddForm: флаг отображения формы добавления департамента
 * - newDepartment: данные нового департамента для формы добавления
 */
export default function OrgStructurePage() {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Массив департаментов в иерархической структуре (с вложенными children)
  const [departments, setDepartments] = useState<Department[]>([])
  // Флаг загрузки данных департаментов
  const [loading, setLoading] = useState(true)
  // Флаг сохранения данных (показывает индикатор при создании/редактировании)
  const [saving, setSaving] = useState(false)
  // Поисковый запрос для фильтрации департаментов
  const [searchTerm, setSearchTerm] = useState('')
  // Множество ID развернутых узлов дерева (для управления раскрытием/сворачиванием)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  // Редактируемый департамент: null если не редактируется, иначе - объект департамента
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  // Флаг отображения формы добавления нового департамента
  const [showAddForm, setShowAddForm] = useState(false)
  // Данные нового департамента для формы добавления
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    short_name: '',
    parent: null,
    description: '',
    location: '',
  })

  /**
   * useEffect - загрузка департаментов при монтировании компонента
   * 
   * Функциональность:
   * - Вызывает loadDepartments() при монтировании компонента
   * 
   * Поведение:
   * - Выполняется один раз при загрузке страницы
   * - Загружает иерархическую структуру всех департаментов компании
   */
  useEffect(() => {
    loadDepartments()
  }, [])

  /**
   * loadDepartments - загрузка иерархической структуры департаментов
   * 
   * Функциональность:
   * - Загружает иерархическую структуру всех департаментов компании
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * - Разворачивает все узлы дерева по умолчанию
   * 
   * Поведение:
   * - Вызывается при монтировании компонента
   * - Показывает индикатор загрузки
   * - В текущей реализации использует моковые данные
   * - После загрузки разворачивает все узлы дерева (expandedNodes)
   * 
   * Структура данных:
   * - Департаменты организованы в иерархическую структуру
   * - Каждый департамент может иметь дочерние департаменты (children)
   * - Корневые департаменты имеют parent === null
   * 
   * Связи:
   * - API: должен вызывать endpoint для получения оргструктуры
   * 
   * TODO: Заменить на реальный API вызов
   * - GET /api/company-settings/org-structure/ - получение оргструктуры
   */
  const loadDepartments = async () => {
    setLoading(true)
    try {
      // TODO: Заменить на реальный API вызов
      // const data = await api.getOrgStructure()
      
      // Демо данные для примера
      const demoData: Department[] = [
        {
          id: '1',
          name: 'IT Департамент',
          slug: 'it-department',
          short_name: 'IT',
          parent: null,
          description: 'Информационные технологии и разработка',
          manager: null,
          location: 'Главный офис',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          employee_count: 25,
          children: [
            {
              id: '2',
              name: 'Отдел разработки',
              slug: 'development',
              short_name: 'DEV',
              parent: '1',
              description: 'Разработка программного обеспечения',
              manager: null,
              location: 'Главный офис',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              employee_count: 15,
              children: []
            },
            {
              id: '3',
              name: 'Отдел тестирования',
              slug: 'qa',
              short_name: 'QA',
              parent: '1',
              description: 'Контроль качества',
              manager: null,
              location: 'Главный офис',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              employee_count: 10,
              children: []
            }
          ]
        },
        {
          id: '4',
          name: 'HR Департамент',
          slug: 'hr-department',
          short_name: 'HR',
          parent: null,
          description: 'Управление персоналом',
          manager: null,
          location: 'Главный офис',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          employee_count: 8,
          children: []
        }
      ]
      
      setDepartments(demoData)
      
      // Разворачиваем все узлы по умолчанию
      const allIds = new Set<string>()
      const collectIds = (depts: Department[]) => {
        depts.forEach(dept => {
          allIds.add(dept.id)
          if (dept.children) {
            collectIds(dept.children)
          }
        })
      }
      collectIds(demoData)
      setExpandedNodes(allIds)
    } catch (error) {
      console.error('Error loading departments:', error)
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * getAllDepartmentsFlat - преобразование иерархической структуры в плоский список
   * 
   * Функциональность:
   * - Преобразует иерархическую структуру департаментов в плоский массив
   * - Рекурсивно обходит все узлы дерева
   * 
   * Алгоритм:
   * - Рекурсивно обходит дерево департаментов
   * - Добавляет каждый департамент в результирующий массив
   * - Обрабатывает дочерние департаменты рекурсивно
   * 
   * Используется для:
   * - Отображения всех департаментов в выпадающем списке выбора родителя
   * - Фильтрации и поиска по всем департаментам
   * 
   * @param tree - иерархическая структура департаментов
   * @returns плоский массив всех департаментов
   */
  const getAllDepartmentsFlat = (tree: Department[]): Department[] => {
    const result: Department[] = []
    const traverse = (nodes: Department[]) => {
      nodes.forEach(node => {
        result.push(node)
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(tree)
    return result
  }

  /**
   * getFullPath - получение полного пути к департаменту в иерархии
   * 
   * Функциональность:
   * - Находит департамент по ID в иерархической структуре
   * - Возвращает полный путь от корня до департамента
   * 
   * Алгоритм:
   * - Рекурсивно ищет департамент по ID
   * - Собирает путь из названий всех родительских департаментов
   * - Форматирует путь через " → " (например, "IT Департамент → Отдел разработки")
   * 
   * Используется для:
   * - Отображения полного пути к департаменту в выпадающем списке
   * - Показывает иерархию департамента в читаемом формате
   * 
   * @param dept - департамент для получения пути
   * @param tree - иерархическая структура департаментов
   * @returns полный путь к департаменту в формате "Департамент1 → Департамент2" или название департамента, если не найден путь
   */
  const getFullPath = (dept: Department, tree: Department[]): string => {
    const findPath = (nodes: Department[], targetId: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.name]
        if (node.id === targetId) {
          return currentPath
        }
        if (node.children) {
          const found = findPath(node.children, targetId, currentPath)
          if (found) return found
        }
      }
      return null
    }
    
    const path = findPath(tree, dept.id)
    return path ? path.join(' → ') : dept.name
  }

  /**
   * toggleNode - переключение состояния развернутости узла дерева
   * 
   * Функциональность:
   * - Переключает состояние развернутости/свернутости узла дерева
   * - Если узел развернут - сворачивает его
   * - Если узел свернут - разворачивает его
   * 
   * Поведение:
   * - Вызывается при клике на кнопку раскрытия/сворачивания
   * - Обновляет множество expandedNodes
   * - Влияет на отображение дочерних департаментов
   * 
   * Используется для:
   * - Управления видимостью дочерних департаментов в дереве
   * - Раскрытия/сворачивания узлов дерева
   * 
   * @param id - ID департамента для переключения
   */
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /**
   * handleAddDepartment - обработчик добавления нового департамента
   * 
   * Функциональность:
   * - Валидирует данные нового департамента
   * - Создает новый департамент
   * - Обновляет иерархическую структуру
   * - Очищает форму добавления
   * 
   * Валидация:
   * - name: обязательное поле (не пустое)
   * 
   * Поведение:
   * - Проверяет наличие названия департамента
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После создания перезагружает список департаментов
   * - Закрывает форму добавления
   * 
   * Используется для:
   * - Добавления нового департамента при клике на "Добавить департамент"
   * 
   * TODO: Реализовать создание через API
   * - POST /api/company-settings/org-structure/departments/ - создание департамента
   */
  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      alert('Введите название департамента')
      return
    }

    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.createDepartment(newDepartment)
      
      console.log('Creating department:', newDepartment)
      
      // Симуляция создания
      setTimeout(() => {
        setShowAddForm(false)
        setNewDepartment({
          name: '',
          short_name: '',
          parent: null,
          description: '',
          location: '',
        })
        setSaving(false)
        loadDepartments()
      }, 500)
    } catch (error: any) {
      console.error('Error creating department:', error)
      setSaving(false)
    }
  }

  /**
   * handleEditDepartment - обработчик сохранения изменений департамента
   * 
   * Функциональность:
   * - Сохраняет изменения отредактированного департамента
   * - Обновляет департамент в иерархической структуре
   * - Закрывает режим редактирования
   * 
   * Поведение:
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После сохранения перезагружает список департаментов
   * - Закрывает режим редактирования
   * 
   * Используется для:
   * - Сохранения изменений департамента при клике на "Сохранить"
   * 
   * @param department - отредактированный департамент для сохранения
   * 
   * TODO: Реализовать обновление через API
   * - PUT /api/company-settings/org-structure/departments/{id}/ - обновление департамента
   */
  const handleEditDepartment = async (department: Department) => {
    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.updateDepartment(department.id, department)
      
      console.log('Updating department:', department)
      
      // Симуляция обновления
      setTimeout(() => {
        setEditingDepartment(null)
        setSaving(false)
        loadDepartments()
      }, 500)
    } catch (error: any) {
      console.error('Error updating department:', error)
      setSaving(false)
    }
  }

  /**
   * removeDepartmentFromTree - удаление департамента из иерархической структуры
   * 
   * Функциональность:
   * - Рекурсивно удаляет департамент и все его дочерние департаменты из дерева
   * - Сохраняет структуру остальных департаментов
   * 
   * Алгоритм:
   * - Фильтрует департаменты верхнего уровня, удаляя департамент с указанным ID
   * - Рекурсивно обрабатывает дочерние департаменты
   * - Удаляет департамент из всех уровней вложенности
   * 
   * Используется для:
   * - Удаления департамента из иерархической структуры
   * - Обработки каскадного удаления (удаление родителя удаляет всех детей)
   * 
   * @param list - массив департаментов для обработки
   * @param removeId - ID департамента для удаления
   * @returns массив департаментов без удаленного департамента и его детей
   */
  const removeDepartmentFromTree = (list: Department[], removeId: string): Department[] =>
    list.filter(d => d.id !== removeId).map(d => ({
      ...d,
      children: d.children ? removeDepartmentFromTree(d.children, removeId) : undefined
    }))

  /**
   * handleDeleteDepartment - обработчик удаления департамента
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - Удаляет департамент и все его дочерние департаменты из структуры
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления департамента
   * - Показывает toast-уведомление с вопросом
   * - При подтверждении удаляет департамент через removeDepartmentFromTree
   * - Показывает индикатор сохранения во время удаления
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * - removeDepartmentFromTree: использует для удаления из структуры
   * 
   * @param id - ID департамента для удаления
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/company-settings/org-structure/departments/{id}/ - удаление департамента
   */
  const handleDeleteDepartment = (id: string) => {
    toast.showWarning('Удалить департамент?', 'Вы уверены, что хотите удалить этот департамент?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setSaving(true)
            try {
              console.log('Deleting department:', id)
              setDepartments(prev => removeDepartmentFromTree(prev, id))
            } catch (e) {
              toast.showError('Ошибка', 'Ошибка при удалении департамента')
            } finally {
              setSaving(false)
            }
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  /**
   * renderDepartment - рекурсивный рендеринг департамента в дереве
   * 
   * Функциональность:
   * - Рендерит департамент с учетом уровня вложенности
   * - Поддерживает режим редактирования (inline)
   * - Отображает дочерние департаменты при развернутом состоянии
   * 
   * Поведение:
   * - Определяет, развернут ли узел (isExpanded)
   * - Определяет, редактируется ли департамент (isEditing)
   * - Отображает кнопку раскрытия/сворачивания для департаментов с детьми
   * - В режиме редактирования показывает форму редактирования
   * - В обычном режиме показывает информацию о департаменте
   * - Рекурсивно рендерит дочерние департаменты при развернутом состоянии
   * 
   * Визуальные элементы:
   * - Иконка типа департамента (📦 для корневых, 📁 для с детьми, 📄 для листьев)
   * - Название, сокращение, локация, описание
   * - Количество сотрудников (если указано)
   * - Кнопки редактирования и удаления
   * 
   * @param dept - департамент для рендеринга
   * @param level - уровень вложенности (0 для корневых, увеличивается для детей)
   * @returns React элемент департамента с возможными дочерними элементами
   */
  const renderDepartment = (dept: Department, level: number = 0): React.ReactNode => {
    const hasChildren = dept.children && dept.children.length > 0
    const isExpanded = expandedNodes.has(dept.id)
    const isEditing = editingDepartment?.id === dept.id

    return (
      <Box key={dept.id} style={{ marginLeft: `${level * 24}px`, marginBottom: '8px' }}>
        <Box
          className={styles.departmentItem}
          style={{
            padding: '12px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '8px',
          }}
        >
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2" style={{ flex: 1 }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="1"
                  onClick={() => toggleNode(dept.id)}
                  style={{ 
                    minWidth: '24px', 
                    width: '24px', 
                    height: '24px',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  {isExpanded ? (
                    <ChevronDownIcon width={16} height={16} />
                  ) : (
                    <ChevronRightIcon width={16} height={16} />
                  )}
                </Button>
              )}
              {!hasChildren && <Box style={{ width: '24px' }} />}
              
              <Text size="2">
                {!dept.parent ? '📦' : (!hasChildren ? '📄' : '📁')}
              </Text>
              
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                {isEditing ? (
                  <Flex direction="column" gap="2" style={{ width: '100%' }}>
                    <Flex gap="2" wrap="wrap">
                      <TextField.Root
                        size="2"
                        value={editingDepartment.name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                        placeholder="Название *"
                        style={{ minWidth: '200px', flex: 1 }}
                      />
                      <TextField.Root
                        size="2"
                        value={editingDepartment.short_name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, short_name: e.target.value })}
                        placeholder="Сокращение"
                        style={{ minWidth: '120px', maxWidth: '150px' }}
                      />
                      <TextField.Root
                        size="2"
                        value={editingDepartment.location || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, location: e.target.value })}
                        placeholder="Локация/офис"
                        style={{ minWidth: '150px', maxWidth: '200px' }}
                      />
                    </Flex>
                    <Select.Root
                      size="2"
                      value={editingDepartment.parent || 'none'}
                      onValueChange={(value) => setEditingDepartment({ ...editingDepartment, parent: value === 'none' ? null : value })}
                    >
                      <Select.Trigger style={{ width: '100%', maxWidth: '400px' }} />
                      <Select.Content>
                        <Select.Item value="none">— Без родителя (корневой)</Select.Item>
                        {getAllDepartmentsFlat(departments)
                          .filter(d => d.id !== editingDepartment.id)
                          .map(dept => (
                            <Select.Item key={dept.id} value={dept.id}>
                              {getFullPath(dept, departments)}
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                    <TextArea
                      size="2"
                      value={editingDepartment.description || ''}
                      onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                      placeholder="Описание"
                      rows={2}
                      style={{ width: '100%' }}
                    />
                  </Flex>
                ) : (
                  <Flex direction="column" gap="1">
                    <Flex align="center" gap="2" wrap="wrap">
                      <Text size="3" weight="bold">{dept.name}</Text>
                      {dept.short_name && (
                        <Badge color="gray" size="1">{dept.short_name}</Badge>
                      )}
                    </Flex>
                    {dept.location && (
                      <Text size="1" color="gray">
                        📍 {dept.location}
                      </Text>
                    )}
                    {dept.description && (
                      <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                        {dept.description}
                      </Text>
                    )}
                  </Flex>
                )}
              </Flex>
            </Flex>
            
            <Flex align="center" gap="2">
              {dept.employee_count !== undefined && (
                <Badge color="blue" size="1">
                  👥 {dept.employee_count}
                </Badge>
              )}
              {isEditing ? (
                <>
                  <Button
                    size="2"
                    variant="soft"
                    color="green"
                    onClick={() => handleEditDepartment(editingDepartment)}
                    disabled={saving}
                  >
                    <CheckIcon width={16} height={16} />
                  </Button>
                  <Button
                    size="2"
                    variant="soft"
                    color="gray"
                    onClick={() => setEditingDepartment(null)}
                  >
                    <Cross2Icon width={16} height={16} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={() => {
                      const location = dept.location !== null && dept.location !== undefined ? dept.location : ''
                      setEditingDepartment({ 
                        ...dept, 
                        location: location,
                        description: dept.description || '',
                        short_name: dept.short_name || '',
                      })
                    }}
                  >
                    <Pencil1Icon width={16} height={16} />
                  </Button>
                  <Button
                    size="2"
                    variant="soft"
                    color="red"
                    onClick={() => handleDeleteDepartment(dept.id)}
                  >
                    <TrashIcon width={16} height={16} />
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Box>
        
        {isExpanded && hasChildren && (
          <Box style={{ marginTop: '8px' }}>
            {dept.children!.map(child => renderDepartment(child, level + 1))}
          </Box>
        )}
      </Box>
    )
  }

  /**
   * filterDepartments - рекурсивная фильтрация департаментов по поисковому запросу
   * 
   * Функциональность:
   * - Фильтрует департаменты по поисковому запросу
   * - Сохраняет иерархическую структуру
   * - Показывает родительские департаменты, если найдены дочерние
   * 
   * Алгоритм:
   * 1. Если поисковый запрос пустой - возвращает все департаменты
   * 2. Для каждого департамента:
   *    - Проверяет совпадение в названии или сокращении (без учета регистра)
   *    - Рекурсивно фильтрует дочерние департаменты
   *    - Если департамент или его дети совпадают - добавляет в результат
   * 3. Сохраняет структуру: если найдены дочерние - показывает родителя
   * 
   * Поведение:
   * - Поиск выполняется без учета регистра
   * - Проверяет название (name) и сокращение (short_name)
   * - Если родитель не совпадает, но совпадают дети - показывает родителя с детьми
   * - Если родитель совпадает - показывает его со всеми детьми
   * 
   * Используется для:
   * - Фильтрации департаментов при вводе поискового запроса
   * - Отображения только релевантных департаментов
   * 
   * @param depts - массив департаментов для фильтрации
   * @returns отфильтрованный массив департаментов с сохраненной иерархией
   */
  const filterDepartments = (depts: Department[]): Department[] => {
    if (!searchTerm) {
      return depts
    }
    
    const searchLower = searchTerm.toLowerCase()
    const filtered: Department[] = []
    
    depts.forEach(dept => {
      // Поиск: проверяет название или сокращение (без учета регистра)
      const matchesSearch = dept.name.toLowerCase().includes(searchLower) ||
                           dept.short_name?.toLowerCase().includes(searchLower)
      
      // Рекурсивно фильтруем дочерние департаменты
      const filteredChildren = dept.children ? filterDepartments(dept.children) : []
      
      // Добавляем департамент, если он сам совпадает или найдены дочерние
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children
        })
      }
    })
    
    return filtered
  }

  const filteredDepartments = filterDepartments(departments)

  if (loading) {
    return (
      <AppLayout pageTitle="Оргструктура">
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
              <Text size="2">📊</Text>
              <Text size="8" weight="bold">Оргструктура</Text>
            </Flex>
            <Text size="3" color="gray">
              Настройка организационной структуры компании
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
    <AppLayout pageTitle="Оргструктура">
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
          <Text size="2">📊</Text>
          <Text size="8" weight="bold">Оргструктура</Text>
        </Flex>
        <Text size="3" color="gray">
          Управление организационной структурой компании: департаменты, отделы и подразделения
        </Text>
      </Box>

      {/* Панель поиска и кнопка добавления */}
      <Flex gap="3" align="center">
        <Box style={{ flex: 1, maxWidth: '400px' }}>
          <TextField.Root
            size="3"
            placeholder="Поиск департаментов..."
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
          Добавить департамент
        </Button>
      </Flex>

      {/* Форма добавления нового департамента */}
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
            Новый департамент
          </Text>
          
          <Flex direction="column" gap="4">
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '250px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Название *
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.name || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Например: Отдел разработки"
                />
              </Box>
              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Сокращенное название
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.short_name || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, short_name: e.target.value })}
                  placeholder="Например: DEV"
                />
              </Box>
            </Flex>
            
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '300px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Родительский департамент
                </Text>
                <Select.Root
                  size="2"
                  value={newDepartment.parent || 'none'}
                  onValueChange={(value) => setNewDepartment({ ...newDepartment, parent: value === 'none' ? null : value })}
                >
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="none">— Без родителя (корневой)</Select.Item>
                    {getAllDepartmentsFlat(departments).map(dept => (
                      <Select.Item key={dept.id} value={dept.id}>
                        {getFullPath(dept, departments)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box style={{ flex: 1, minWidth: '250px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Локация/офис
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.location || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, location: e.target.value })}
                  placeholder="Например: Главный офис"
                />
              </Box>
            </Flex>
            
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextArea
                size="2"
                value={newDepartment.description || ''}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                placeholder="Описание задач и зоны ответственности департамента"
                rows={3}
                style={{ width: '100%' }}
              />
            </Box>
            
            <Flex gap="2">
              <Button
                size="3"
                onClick={handleAddDepartment}
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
                  setNewDepartment({
                    name: '',
                    short_name: '',
                    parent: null,
                    description: '',
                    location: '',
                  })
                }}
              >
                Отмена
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Дерево департаментов */}
      <Box>
        {filteredDepartments.length === 0 ? (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            gap="3"
            style={{ padding: '100px 20px' }}
          >
            <Text size="8" style={{ opacity: 0.3 }}>📦</Text>
            <Text size="4" color="gray">Нет департаментов</Text>
            <Text size="2" color="gray">Добавьте первый департамент для начала работы</Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="2">
            {filteredDepartments.map(dept => renderDepartment(dept))}
          </Flex>
        )}
      </Box>
    </Flex>
    </AppLayout>
  )
}
