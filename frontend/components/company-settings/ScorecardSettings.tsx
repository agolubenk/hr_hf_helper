'use client'

import { Box, Flex, Text, Button, Card, TextField, Dialog, Callout } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import { PlusIcon, TrashIcon, Cross2Icon, InfoCircledIcon, ListBulletIcon, FileTextIcon, GearIcon, ArrowRightIcon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from './ScorecardSettings.module.css'

interface ScorecardCriteria {
  id: string
  name: string
  description?: string
  order: number
  children?: ScorecardCriteria[]
  parentId?: string
}

// Доступные паттерны для вставки
interface Pattern {
  id: string
  label: string
  value: string
  icon?: React.ReactNode
  category: string
}

const AVAILABLE_PATTERNS: Pattern[] = [
  // Текст
  { id: 'text', label: 'T Текст/Text', value: '[text]', category: 'Текст' },
  
  // Вакансия
  { id: 'vacancy_title', label: 'Вакансия', value: '[vacancy_title]', category: 'Вакансия' },
  { id: 'vacancy_id', label: '# ID вакансии', value: '[vacancy_id]', category: 'Вакансия' },
  
  // Кандидат
  { id: 'candidate_lastname', label: 'Фамилия', value: '[candidate_lastname]', category: 'Кандидат' },
  { id: 'candidate_firstname', label: 'Имя', value: '[candidate_firstname]', category: 'Кандидат' },
  { id: 'candidate_patronymic', label: 'Отчество', value: '[candidate_patronymic]', category: 'Кандидат' },
  { id: 'candidate_id', label: 'ID кандидата', value: '[candidate_id]', category: 'Кандидат' },
  
  // Грейд
  { id: 'grade', label: 'Senior', value: '[grade]', category: 'Грейд' },
  
  // Дата и время
  { id: 'date_day', label: 'День (08)', value: '[date_day]', category: 'Дата и время' },
  { id: 'date_full', label: 'Дата (08.09.2025)', value: '[date_full]', category: 'Дата и время' },
  { id: 'month_num', label: 'Месяц (09)', value: '[month_num]', category: 'Дата и время' },
  { id: 'month_short_ru', label: 'Месяц (сен)', value: '[month_short_ru]', category: 'Дата и время' },
  { id: 'month_full_ru', label: 'Месяц (сентябрь)', value: '[month_full_ru]', category: 'Дата и время' },
  { id: 'month_short_en', label: 'Месяц (Sep)', value: '[month_short_en]', category: 'Дата и время' },
  { id: 'month_full_en', label: 'Месяц (September)', value: '[month_full_en]', category: 'Дата и время' },
  { id: 'year_short', label: 'Год (25)', value: '[year_short]', category: 'Дата и время' },
  { id: 'year_full', label: 'Год (2025)', value: '[year_full]', category: 'Дата и время' },
  
  // День недели
  { id: 'weekday_short_ru', label: 'День недели (ПН)', value: '[weekday_short_ru]', category: 'День недели' },
  { id: 'weekday_short_en', label: 'День недели (Mon)', value: '[weekday_short_en]', category: 'День недели' },
  { id: 'weekday_short_mn', label: 'День недели (MN)', value: '[weekday_short_mn]', category: 'День недели' },
  { id: 'weekday_short_ru_full', label: 'День недели (ПОН)', value: '[weekday_short_ru_full]', category: 'День недели' },
  { id: 'weekday_full_ru', label: 'День недели (Понедельник)', value: '[weekday_full_ru]', category: 'День недели' },
  { id: 'weekday_full_en', label: 'День недели (Monday)', value: '[weekday_full_en]', category: 'День недели' },
  
  // Интервьюер
  { id: 'interviewer_name', label: 'Имя интервьюера', value: '[interviewer_name]', category: 'Интервьюер' },
]

// Моковые данные
const mockCriteria: ScorecardCriteria[] = [
  {
    id: '1',
    name: 'Технические навыки',
    description: '[candidate_firstname] [candidate_lastname] [vacancy_title]',
    order: 1,
    children: [
      {
        id: '1-1',
        name: 'Знание технологий',
        description: '[vacancy_title]',
        order: 1,
        parentId: '1',
      },
      {
        id: '1-2',
        name: 'Опыт работы',
        description: '[grade]',
        order: 2,
        parentId: '1',
      },
    ],
  },
  {
    id: '2',
    name: 'Коммуникативные навыки',
    description: '[candidate_firstname] [candidate_lastname]',
    order: 2,
  },
  {
    id: '3',
    name: 'Дата интервью',
    description: '[month_num] [month_full_ru] [date_day] ([weekday_short_ru])',
    order: 3,
  },
]

export default function ScorecardSettings() {
  const toast = useToast()
  const [criteria, setCriteria] = useState<ScorecardCriteria[]>(mockCriteria)
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState('')
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false)
  const [protectedSheets, setProtectedSheets] = useState<string>('')

  // Получить все критерии в плоском списке с учетом вложенности
  const getAllCriteria = (items: ScorecardCriteria[], level = 0): Array<ScorecardCriteria & { level: number }> => {
    const result: Array<ScorecardCriteria & { level: number }> = []
    items.forEach(item => {
      result.push({ ...item, level })
      if (item.children && item.children.length > 0) {
        result.push(...getAllCriteria(item.children, level + 1))
      }
    })
    return result
  }

  const flatCriteria = getAllCriteria(criteria)

  const handleAddCriteria = (parentId?: string) => {
    const newId = `criteria-${Date.now()}`
    const newCriteria: ScorecardCriteria = {
      id: newId,
      name: '',
      description: '',
      order: parentId 
        ? (criteria.find(c => c.id === parentId)?.children?.length || 0) + 1
        : criteria.length + 1,
      parentId,
    }

    if (parentId) {
      // Добавляем как дочерний элемент
      setCriteria(prev => prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newCriteria],
          }
        }
        return item
      }))
    } else {
      // Добавляем как корневой элемент
      setCriteria(prev => [...prev, newCriteria])
    }
    
    setSelectedCriteriaId(newId)
  }

  const handleDeleteCriteria = (id: string, parentId?: string) => {
    // Проверяем, не является ли критерий защищенным листом
    const criteriaToDelete = flatCriteria.find(c => c.id === id)
    if (criteriaToDelete && criteriaToDelete.name) {
      const protectedList = protectedSheets
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      if (protectedList.includes(criteriaToDelete.name)) {
        toast.showError('Защищённый критерий', `Критерий "${criteriaToDelete.name}" защищен от удаления. Удалите его из списка защищенных листов.`)
        return
      }
    }

    toast.showWarning('Удалить критерий?', 'Вы уверены, что хотите удалить этот критерий?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            if (parentId) {
              setCriteria(prev => prev.map(item => {
                if (item.id === parentId) {
                  return {
                    ...item,
                    children: item.children?.filter(c => c.id !== id) || [],
                  }
                }
                return item
              }))
            } else {
              setCriteria(prev => prev.filter(item => item.id !== id))
            }
            setSelectedCriteriaId(prev => prev === id ? null : prev)
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleUpdateCriteria = (id: string, field: 'name' | 'description', value: string, parentId?: string) => {
    if (parentId) {
      setCriteria(prev => prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: item.children?.map(c => 
              c.id === id ? { ...c, [field]: value } : c
            ) || [],
          }
        }
        return item
      }))
    } else {
      setCriteria(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ))
    }
  }

  const handleInsertPattern = (pattern: string) => {
    if (!selectedCriteriaId) {
      alert('Выберите критерий для вставки паттерна')
      return
    }

    const selectedCriteria = flatCriteria.find(c => c.id === selectedCriteriaId)
    if (selectedCriteria) {
      const currentDescription = selectedCriteria.description || ''
      // Паттерны добавляются к существующему содержимому через пробел
      const newDescription = currentDescription + (currentDescription ? ' ' : '') + pattern
      handleUpdateCriteria(
        selectedCriteriaId,
        'description',
        newDescription,
        selectedCriteria.parentId
      )
    }
  }

  const generatePreview = () => {
    // Генерируем предпросмотр на основе выбранного критерия или первого с примерами значений
    const targetCriteria = selectedCriteriaId 
      ? flatCriteria.find(c => c.id === selectedCriteriaId)
      : criteria[0]
    
    if (!targetCriteria || !targetCriteria.description) {
      setPreviewText('Выберите критерий и заполните описание для предпросмотра')
      return
    }

    // Заменяем все паттерны на примеры значений
    let preview = targetCriteria.description
      // Кандидат
      .replace(/\[candidate_firstname\]/g, 'Иван')
      .replace(/\[candidate_lastname\]/g, 'Иванов')
      .replace(/\[candidate_patronymic\]/g, 'Иванович')
      .replace(/\[candidate_id\]/g, '12345')
      // Вакансия
      .replace(/\[vacancy_title\]/g, 'Frontend Engineer (React)')
      .replace(/\[vacancy_id\]/g, '456')
      // Грейд
      .replace(/\[grade\]/g, 'Senior')
      // Дата и время
      .replace(/\[date_day\]/g, '15')
      .replace(/\[date_full\]/g, '15.09.2025')
      .replace(/\[month_num\]/g, '09')
      .replace(/\[month_short_ru\]/g, 'сен')
      .replace(/\[month_full_ru\]/g, 'сентябрь')
      .replace(/\[month_short_en\]/g, 'Sep')
      .replace(/\[month_full_en\]/g, 'September')
      .replace(/\[year_short\]/g, '25')
      .replace(/\[year_full\]/g, '2025')
      // День недели
      .replace(/\[weekday_short_ru\]/g, 'ПН')
      .replace(/\[weekday_short_en\]/g, 'Mon')
      .replace(/\[weekday_short_mn\]/g, 'MN')
      .replace(/\[weekday_short_ru_full\]/g, 'ПОН')
      .replace(/\[weekday_full_ru\]/g, 'Понедельник')
      .replace(/\[weekday_full_en\]/g, 'Monday')
      // Интервьюер
      .replace(/\[interviewer_name\]/g, 'Алексей Петров')
      // Текст
      .replace(/\[text\]/g, 'текст')

    setPreviewText(preview)
  }

  // Автоматически обновляем предпросмотр при изменении выбранного критерия
  useEffect(() => {
    if (selectedCriteriaId) {
      generatePreview()
    }
  }, [selectedCriteriaId, criteria])

  const selectedCriteria = flatCriteria.find(c => c.id === selectedCriteriaId)
  const patternsByCategory = AVAILABLE_PATTERNS.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = []
    }
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<string, Pattern[]>)

  return (
    <Flex direction="column" gap="4">
      {/* Верхняя секция предварительного просмотра */}
      <Card className={styles.card}>
        <Flex justify="between" align="start" mb="3">
          <Box style={{ flex: 1 }}>
            <Text size="4" weight="bold" mb="2" style={{ display: 'block' }}>
              Предварительный просмотр:
            </Text>
            <Box 
              p="3" 
              style={{ 
                border: '1px solid var(--gray-a6)', 
                borderRadius: '6px',
                background: 'var(--gray-2)',
                minHeight: '60px',
              }}
            >
              <Text size="3" style={{ whiteSpace: 'pre-wrap' }}>
                {previewText || 'Выберите критерий и нажмите "Обновить предпросмотр"'}
              </Text>
            </Box>
            <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
              Описание критерия с подставленными примерами значений. Паттерны заменяются реальными данными автоматически.
            </Text>
          </Box>
          <Flex gap="2" ml="4">
            <Button variant="soft" size="2" onClick={generatePreview}>
              <InfoCircledIcon width={16} height={16} />
              Обновить предпросмотр
            </Button>
            <Button variant="soft" size="2" onClick={() => setIsExampleModalOpen(true)}>
              <ListBulletIcon width={16} height={16} />
              Пример
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Основной контент: левая и правая панели */}
      <Flex gap="4" align="start">
        {/* Левая панель: Структура критериев */}
        <Card className={styles.card} style={{ flex: 1 }}>
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            Критерии оценки:
          </Text>
          <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
            Создайте иерархию критериев. Каждый элемент создает отдельный критерий. 
            Для комбинирования добавляйте несколько паттернов в одной строке через пробел или разделители. 
            Можно вводить несколько паттернов в одну строку через пробел.
          </Text>

          <Flex direction="column" gap="3">
            {flatCriteria.map((item, index) => {
              // Для первого корневого элемента всегда показываем "G-Drive"
              let displayValue = ''
              if (index === 0 && item.level === 0) {
                displayValue = 'G-Drive'
              } else {
                // Функция для генерации примера из описания
                const generateExample = (description: string) => {
                  return description
                    .replace(/\[candidate_firstname\]/g, 'Иван')
                    .replace(/\[candidate_lastname\]/g, 'Иванов')
                    .replace(/\[vacancy_title\]/g, 'Frontend Engineer')
                    .replace(/\[grade\]/g, 'Senior')
                    .replace(/\[date_day\]/g, '08')
                    .replace(/\[month_full_ru\]/g, 'сентябрь')
                    .replace(/\[year_full\]/g, '2025')
                    .replace(/\[weekday_short_ru\]/g, 'ПН')
                    .replace(/\[weekday_full_ru\]/g, 'Понедельник')
                }
                
                // Для вложенных элементов: если есть собственное описание - показываем его пример, иначе пример из родителя
                if (item.level > 0) {
                  // Находим родительский элемент
                  const parentItem = item.parentId 
                    ? flatCriteria.find(c => c.id === item.parentId)
                    : null
                  
                  if (item.description && item.description.trim()) {
                    // Если у элемента есть описание, показываем пример из него
                    displayValue = generateExample(item.description)
                    if (displayValue.length > 60) displayValue = displayValue.substring(0, 60) + '...'
                  } else if (parentItem && parentItem.description && parentItem.description.trim()) {
                    // Если у элемента нет описания, но есть у родителя - показываем пример из родителя
                    displayValue = generateExample(parentItem.description)
                    if (displayValue.length > 60) displayValue = displayValue.substring(0, 60) + '...'
                  } else {
                    // Если ни у элемента, ни у родителя нет описания - показываем прочерк
                    displayValue = '-'
                  }
                } else {
                  // Для корневых элементов (не первого) показываем пример из собственного описания
                  if (item.description && item.description.trim()) {
                    displayValue = generateExample(item.description)
                    if (displayValue.length > 60) displayValue = displayValue.substring(0, 60) + '...'
                  } else {
                    displayValue = '-'
                  }
                }
              }

              // Вычисляем размеры в зависимости от уровня вложенности
              const fontSize = item.level > 0 ? 12 : 13
              const paddingSize = item.level > 0 ? 1.5 : 2
              const iconSize = item.level > 0 ? 12 : 14
              const textSize = item.level > 0 ? '1' : '2'
              
              // Вычисляем ширину и отступы для эффекта "лестницы"
              // Каждый последующий элемент уменьшается на 16px по ширине
              // marginLeft компенсирует уменьшение, чтобы правый край был выровнен
              const baseWidth = 680
              const widthReduction = index * 16
              const itemWidth = Math.max(baseWidth - widthReduction, 200) // Минимальная ширина 200px
              // marginLeft только для компенсации уменьшения ширины (чтобы правый край был выровнен)
              const marginLeft = index * 16
              // paddingLeft для визуального отступа вложенности
              const paddingLeft = item.level * 16
              
              return (
                <Box
                  key={item.id}
                  className={styles.criteriaItem}
                  style={{
                    marginLeft: `${marginLeft}px`,
                    paddingLeft: `${paddingLeft}px`,
                    width: `${itemWidth}px`,
                    maxWidth: `${itemWidth}px`,
                    border: selectedCriteriaId === item.id 
                      ? '2px solid var(--accent-9)' 
                      : '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--color-panel)',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                  }}
                  onClick={() => setSelectedCriteriaId(item.id)}
                >
                  {/* Серый тег с примером значения (всегда показывается) */}
                  <Flex
                    align="center"
                    justify="between"
                    style={{
                      background: 'var(--gray-4)',
                      borderBottom: '1px solid var(--gray-a6)',
                      minHeight: item.level > 0 ? '28px' : '32px',
                      padding: `${paddingSize * 4}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                      <svg 
                        width={iconSize} 
                        height={iconSize} 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: 'var(--gray-11)', flexShrink: 0 }}
                      >
                        <path 
                          d="M1 4.5C1 4.22386 1.22386 4 1.5 4H6.08579C6.21839 4 6.34557 4.05268 6.43934 4.14645L7.85355 5.56066C7.94732 5.65443 8 5.78161 8 5.91421V12.5C8 12.7761 7.77614 13 7.5 13H1.5C1.22386 13 1 12.7761 1 12.5V4.5ZM2 5V12H7V6H5.5C5.22386 6 5 5.77614 5 5.5V5H2ZM6 5.70711L6.79289 5H6V5.70711Z" 
                          fill="currentColor" 
                          fillRule="evenodd" 
                          clipRule="evenodd"
                        />
                      </svg>
                      <Text 
                        size={textSize as any} 
                        weight="medium" 
                        style={{ 
                          color: 'var(--gray-12)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: `${fontSize}px`,
                        }}
                        title={displayValue || item.name || 'Новый критерий'}
                      >
                        {displayValue || item.name || 'Новый критерий'}
                      </Text>
                    </Flex>
                    <Button
                      variant="ghost"
                      size="1"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCriteria(item.id, item.parentId)
                      }}
                      title="Удалить"
                      style={{ 
                        padding: item.level > 0 ? '2px' : '4px', 
                        minWidth: 'auto', 
                        marginLeft: '8px',
                        height: item.level > 0 ? '20px' : '24px',
                      }}
                    >
                      <TrashIcon width={iconSize} height={iconSize} />
                    </Button>
                  </Flex>

                  {/* Поле ввода с паттернами */}
                  <Box style={{ background: 'var(--color-panel)', padding: `${paddingSize * 4}px` }}>
                    <Flex gap="2" align="center" style={{ position: 'relative' }}>
                      <Box style={{ flex: 1, position: 'relative' }}>
                        <TextField.Root
                          value={item.description || ''}
                          onChange={(e) => {
                            handleUpdateCriteria(item.id, 'description', e.target.value, item.parentId)
                            setSelectedCriteriaId(item.id)
                          }}
                          placeholder="Введите паттерны через пробел (например: [candidate_firstname] [candidate_lastname] [grade])"
                          size={item.level > 0 ? "1" : "2"}
                          onFocus={() => setSelectedCriteriaId(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: `${fontSize}px`, width: '100%' }}
                        />
                      </Box>
                      {item.description && (
                        <Button
                          variant="ghost"
                          size={item.level > 0 ? "1" : "2"}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateCriteria(item.id, 'description', '', item.parentId)
                            setSelectedCriteriaId(item.id)
                          }}
                          title="Очистить"
                          style={{ 
                            padding: '0 4px', 
                            minWidth: 'auto', 
                            flexShrink: 0,
                            border: '1px solid var(--red-9)',
                            borderRadius: '4px',
                            height: item.level > 0 ? '20px' : '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--red-3)',
                          }}
                        >
                          <svg 
                            width={iconSize} 
                            height={iconSize} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: 'var(--red-11)' }}
                          >
                            <path 
                              d="M8 19L3 12L8 5" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                            <line 
                              x1="3" 
                              y1="12" 
                              x2="21" 
                              y2="12" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round"
                            />
                          </svg>
                        </Button>
                      )}
                    </Flex>
                    
                    {/* Поле названия критерия (если нет названия, показываем отдельно) */}
                    {!item.name && (
                      <Box mt="2">
                        <TextField.Root
                          value={item.name || ''}
                          onChange={(e) => {
                            handleUpdateCriteria(item.id, 'name', e.target.value, item.parentId)
                            setSelectedCriteriaId(item.id)
                          }}
                          placeholder="Название критерия (опционально)"
                          size={item.level > 0 ? "1" : "2"}
                          onFocus={() => setSelectedCriteriaId(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: `${fontSize}px`, width: '100%' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            })}

            <Button 
              variant="soft" 
              size="2" 
              onClick={() => handleAddCriteria()}
              style={{ marginTop: '8px' }}
            >
              <PlusIcon width={16} height={16} />
              Добавить критерий
            </Button>
            
            {/* Дополнительные настройки */}
            <Button 
              variant="ghost" 
              size="2" 
              mt="4"
              style={{ alignSelf: 'flex-start' }}
            >
              <GearIcon width={16} height={16} />
              Дополнительные настройки
            </Button>
          </Flex>
        </Card>

        {/* Правая панель: Доступные паттерны */}
        <Card className={styles.card} style={{ width: '400px', flexShrink: 0 }}>
          <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
            Доступные паттерны:
          </Text>
          <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
            Нажмите на паттерн, чтобы добавить его в описание выбранного критерия. 
            Паттерны будут добавляться к существующему содержимому!
          </Text>

          <Flex direction="column" gap="4">
            {Object.entries(patternsByCategory).map(([category, patterns]) => (
              <Box key={category}>
                <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                  {category}
                </Text>
                <Flex wrap="wrap" gap="2">
                  {patterns.map(pattern => (
                    <Button
                      key={pattern.id}
                      variant="soft"
                      size="1"
                      onClick={() => handleInsertPattern(pattern.value)}
                      title={pattern.value}
                      style={{ fontSize: '11px' }}
                    >
                      {pattern.label}
                    </Button>
                  ))}
                </Flex>
              </Box>
            ))}
          </Flex>
        </Card>
      </Flex>

      {/* Модальное окно с примером структуры */}
      <Dialog.Root open={isExampleModalOpen} onOpenChange={setIsExampleModalOpen}>
        <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
          <Dialog.Title>Пример структуры критериев Scorecard (из реальных данных)</Dialog.Title>

          <Box p="4">
            {/* Информационное сообщение */}
            <Callout.Root mb="4" color="blue">
              <Callout.Icon>
                <InfoCircledIcon width={16} height={16} />
              </Callout.Icon>
              <Callout.Text size="2">
                Это пример реальной структуры критериев Scorecard. Ваши текущие данные не изменятся.
              </Callout.Text>
            </Callout.Root>

            {/* Пример структуры */}
            <Box mb="4">
              <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
                Пример структуры:
              </Text>

              <Flex direction="column" gap="3">
                {/* Пример 1: Технические навыки */}
                <Box
                  p="3"
                  style={{
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--gray-2)',
                  }}
                >
                  <Flex align="center" gap="3" mb="2">
                    <Box
                      p="2"
                      style={{
                        background: 'var(--gray-4)',
                        borderRadius: '4px',
                        border: '1px solid var(--gray-a6)',
                      }}
                    >
                      <Text size="2" weight="medium">Технические навыки</Text>
                    </Box>
                    <ArrowRightIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                    <Text size="2" color="gray" style={{ flex: 1 }}>
                      ← редактируемый критерий (вводится вручную)
                    </Text>
                  </Flex>
                  <Box
                    p="2"
                    style={{
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-a6)',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                      [candidate_firstname] [candidate_lastname] [vacancy_title]
                    </Text>
                  </Box>
                </Box>

                {/* Пример 2: Знание технологий */}
                <Box
                  p="3"
                  style={{
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--gray-2)',
                    marginLeft: '24px',
                  }}
                >
                  <Flex align="center" gap="3" mb="2">
                    <Box
                      p="2"
                      style={{
                        background: 'var(--gray-4)',
                        borderRadius: '4px',
                        border: '1px solid var(--gray-a6)',
                      }}
                    >
                      <Text size="2" weight="medium">Знание технологий</Text>
                    </Box>
                    <ArrowRightIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                    <Text size="2" color="gray" style={{ flex: 1 }}>
                      ← Вакансия
                    </Text>
                  </Flex>
                  <Box
                    p="2"
                    style={{
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-a6)',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                      [vacancy_title]
                    </Text>
                  </Box>
                </Box>

                {/* Пример 3: Дата интервью */}
                <Box
                  p="3"
                  style={{
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--gray-2)',
                  }}
                >
                  <Flex align="center" gap="3" mb="2">
                    <Box
                      p="2"
                      style={{
                        background: 'var(--gray-4)',
                        borderRadius: '4px',
                        border: '1px solid var(--gray-a6)',
                      }}
                    >
                      <Text size="2" weight="medium">09 сентябрь</Text>
                    </Box>
                    <ArrowRightIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                    <Text size="2" color="gray" style={{ flex: 1 }}>
                      ← Месяц (09) + Месяц (сентябрь)
                    </Text>
                  </Flex>
                  <Box
                    p="2"
                    style={{
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-a6)',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                      [month_num] [month_full_ru]
                    </Text>
                  </Box>
                </Box>

                {/* Пример 4: Дата с днем недели */}
                <Box
                  p="3"
                  style={{
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--gray-2)',
                  }}
                >
                  <Flex align="center" gap="3" mb="2">
                    <Box
                      p="2"
                      style={{
                        background: 'var(--gray-4)',
                        borderRadius: '4px',
                        border: '1px solid var(--gray-a6)',
                      }}
                    >
                      <Text size="2" weight="medium">09 сентябрь 15 (ПН)</Text>
                    </Box>
                    <ArrowRightIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                    <Text size="2" color="gray" style={{ flex: 1 }}>
                      ← -//- + День (15) + text → "(" + День недели (ПН) + ")"
                    </Text>
                  </Flex>
                  <Box
                    p="2"
                    style={{
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-a6)',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                      [month_num] [month_full_ru] [date_day] ([weekday_short_ru])
                    </Text>
                  </Box>
                </Box>

                {/* Пример 5: Кандидат и Scorecard */}
                <Box
                  p="3"
                  style={{
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                    background: 'var(--gray-2)',
                  }}
                >
                  <Flex align="center" gap="3" mb="2">
                    <Box
                      p="2"
                      style={{
                        background: 'var(--gray-4)',
                        borderRadius: '4px',
                        border: '1px solid var(--gray-a6)',
                      }}
                    >
                      <Text size="2" weight="medium">Иванов Иван</Text>
                    </Box>
                    <ArrowRightIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
                    <Text size="2" color="gray" style={{ flex: 1 }}>
                      ← автоматически
                    </Text>
                  </Flex>
                  <Box
                    p="2"
                    style={{
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-a6)',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                      [candidate_lastname] [candidate_firstname]
                    </Text>
                  </Box>
                </Box>
              </Flex>
            </Box>

            {/* Итоговый пример */}
            <Box mb="4">
              <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
                Итоговый пример:
              </Text>
              <Box
                p="3"
                style={{
                  background: 'var(--blue-3)',
                  borderRadius: '6px',
                  border: '1px solid var(--blue-6)',
                }}
              >
                <Text size="3" style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  Технические навыки: Иван Иванов Frontend Engineer (React) | Знание технологий: Frontend Engineer (React) | Дата: 09 сентябрь 15 (ПН) | Кандидат: Иванов Иван
                </Text>
              </Box>
            </Box>

            {/* Как это работает */}
            <Box mb="4">
              <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
                Как это работает:
              </Text>
              <ul style={{ paddingLeft: '20px', margin: 0, listStyle: 'disc' }}>
                <li style={{ marginBottom: '8px' }}>
                  <Text size="2" color="gray">
                    <Text weight="bold">[candidate_firstname] [candidate_lastname] [vacancy_title]</Text> - редактируемый критерий (вводится вручную), подставляется из кандидата и вакансии (авто)
                  </Text>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Text size="2" color="gray">
                    <Text weight="bold">[vacancy_title]</Text> - подставляется из вакансии (авто)
                  </Text>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Text size="2" color="gray">
                    <Text weight="bold">[month_num] [month_full_ru]</Text> - номер месяца и название месяца интервью (авто)
                  </Text>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Text size="2" color="gray">
                    <Text weight="bold">[month_num] [month_full_ru] [date_day] ([weekday_short_ru])</Text> - номер месяца, название и день месяца, день недели (авто), скобки вручную
                  </Text>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Text size="2" color="gray">
                    <Text weight="bold">[candidate_lastname] [candidate_firstname]</Text> - фамилия и имя кандидата (авто)
                  </Text>
                </li>
              </ul>
            </Box>

            <Flex justify="end" gap="2" pt="3" style={{ borderTop: '1px solid var(--gray-a6)' }}>
              <Button variant="soft" onClick={() => setIsExampleModalOpen(false)}>
                Закрыть
              </Button>
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      {/* Поле для защищенных листов */}
      <Card className={styles.card} style={{ width: '100%' }}>
        <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
          Защищенные листы (нельзя удалять):
        </Text>
        <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
          Укажите через запятую названия критериев, которые нельзя удалять
        </Text>
        <TextField.Root
          value={protectedSheets}
          onChange={(e) => setProtectedSheets(e.target.value)}
          placeholder="Например: Технические навыки, Коммуникативные навыки"
          size="2"
          style={{ width: '100%' }}
        />
      </Card>
    </Flex>
  )
}
