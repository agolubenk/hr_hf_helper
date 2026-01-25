'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, TextArea, Select, Badge } from "@radix-ui/themes"
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './org-structure.module.css'

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

export default function OrgStructurePage() {
  const toast = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    short_name: '',
    parent: null,
    description: '',
    location: '',
  })

  useEffect(() => {
    loadDepartments()
  }, [])

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

  const removeDepartmentFromTree = (list: Department[], removeId: string): Department[] =>
    list.filter(d => d.id !== removeId).map(d => ({
      ...d,
      children: d.children ? removeDepartmentFromTree(d.children, removeId) : undefined
    }))

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

  const filterDepartments = (depts: Department[]): Department[] => {
    if (!searchTerm) {
      return depts
    }
    
    const searchLower = searchTerm.toLowerCase()
    const filtered: Department[] = []
    
    depts.forEach(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchLower) ||
                           dept.short_name?.toLowerCase().includes(searchLower)
      
      const filteredChildren = dept.children ? filterDepartments(dept.children) : []
      
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
