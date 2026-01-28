/**
 * AttractionRulesPage (company-settings/recruiting/rules/page.tsx) - Страница управления правилами привлечения кандидатов
 * 
 * Назначение:
 * - Управление правилами привлечения кандидатов из различных источников
 * - Настройка бонусов за привлечение кандидатов
 * - Определение условий применения правил
 * 
 * Функциональность:
 * - Список всех правил привлечения
 * - Поиск правил по названию, описанию, источнику
 * - Форма добавления нового правила
 * - Форма редактирования правила (inline в таблице)
 * - Управление бонусами (размер, валюта)
 * - Управление приоритетами правил
 * - Активация/деактивация правил
 * - Настройка условий применения правил
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений (подтверждение удаления, ошибки)
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * - Заявки на найм: правила применяются при создании заявок
 * - Отчетность: правила используются для расчета бонусов
 * 
 * Поведение:
 * - При загрузке загружает список правил привлечения
 * - При поиске фильтрует правила по введенному запросу
 * - При добавлении правила показывает форму, при сохранении скрывает её
 * - При редактировании правила открывает inline-редактирование в таблице
 * - При удалении показывает подтверждение через toast
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Select, Badge, Table, TextArea } from "@radix-ui/themes"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useToast } from "@/components/Toast/ToastContext"

/**
 * AttractionRule - интерфейс правила привлечения кандидатов
 * 
 * Структура:
 * - id: уникальный идентификатор правила
 * - name: название правила
 * - description: описание правила
 * - source: источник кандидата (hh.ru, LinkedIn, Рекомендации и т.д.)
 * - bonus_amount: размер бонуса (может быть null)
 * - bonus_currency: валюта бонуса (RUB, USD, EUR)
 * - is_active: флаг активности правила
 * - priority: приоритет правила (чем меньше число, тем выше приоритет)
 * - conditions: условия применения правила (текстовое описание)
 * - created_at, updated_at: даты создания и обновления
 */
interface AttractionRule {
  id: string
  name: string
  description: string
  source: string
  bonus_amount: number | null
  bonus_currency: string
  is_active: boolean
  priority: number
  conditions: string
  created_at: string
  updated_at: string
}

/**
 * AttractionRulesPage - компонент страницы управления правилами привлечения
 * 
 * Состояние:
 * - rules: массив всех правил привлечения
 * - loading: флаг загрузки данных
 * - saving: флаг сохранения данных
 * - searchTerm: поисковый запрос для фильтрации правил
 * - editingRule: редактируемое правило (null если не редактируется)
 * - showAddForm: флаг отображения формы добавления правила
 * - newRule: данные нового правила для формы добавления
 * - availableSources: список доступных источников кандидатов
 * - availableCurrencies: список доступных валют для бонусов
 */
export default function AttractionRulesPage() {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Массив всех правил привлечения кандидатов
  const [rules, setRules] = useState<AttractionRule[]>([])
  // Флаг загрузки данных правил
  const [loading, setLoading] = useState(true)
  // Флаг сохранения данных (показывает индикатор при создании/редактировании)
  const [saving, setSaving] = useState(false)
  // Поисковый запрос для фильтрации правил
  const [searchTerm, setSearchTerm] = useState('')
  // Редактируемое правило: null если не редактируется, иначе - объект правила
  const [editingRule, setEditingRule] = useState<AttractionRule | null>(null)
  // Флаг отображения формы добавления нового правила
  const [showAddForm, setShowAddForm] = useState(false)
  // Данные нового правила для формы добавления
  const [newRule, setNewRule] = useState<Partial<AttractionRule>>({
    name: '',
    description: '',
    source: '',
    bonus_amount: null,
    bonus_currency: 'RUB',
    is_active: true,
    priority: 0,
    conditions: '',
  })

  const [availableSources] = useState<string[]>([
    'hh.ru',
    'LinkedIn',
    'Рекомендации',
    'Сайт компании',
    'Социальные сети',
    'Другое',
  ])

  const [availableCurrencies] = useState<string[]>([
    'RUB',
    'USD',
    'EUR',
  ])

  /**
   * useEffect - загрузка правил при монтировании компонента
   * 
   * Функциональность:
   * - Вызывает loadRules() при монтировании компонента
   * 
   * Поведение:
   * - Выполняется один раз при загрузке страницы
   * - Загружает список всех правил привлечения кандидатов
   */
  useEffect(() => {
    loadRules()
  }, [])

  /**
   * loadRules - загрузка списка правил привлечения кандидатов
   * 
   * Функциональность:
   * - Загружает список всех правил привлечения кандидатов
   * - Устанавливает состояние loading во время загрузки
   * - Обрабатывает ошибки загрузки
   * 
   * Поведение:
   * - Вызывается при монтировании компонента
   * - Показывает индикатор загрузки
   * - В текущей реализации использует моковые данные
   * 
   * Связи:
   * - API: должен вызывать endpoint для получения списка правил
   * 
   * TODO: Заменить на реальный API вызов
   * - GET /api/company-settings/recruiting/rules/ - получение правил привлечения
   */
  const loadRules = async () => {
    setLoading(true)
    try {
      // TODO: Заменить на реальный API вызов
      // const data = await api.getAttractionRules()
      
      // Демо данные для примера
      const demoData: AttractionRule[] = [
        {
          id: '1',
          name: 'Бонус за рекомендацию',
          description: 'Бонус за привлечение кандидата по рекомендации',
          source: 'Рекомендации',
          bonus_amount: 10000,
          bonus_currency: 'RUB',
          is_active: true,
          priority: 1,
          conditions: 'Кандидат должен быть принят на работу и проработать не менее 3 месяцев',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '2',
          name: 'Бонус за hh.ru',
          description: 'Бонус за привлечение кандидата с hh.ru',
          source: 'hh.ru',
          bonus_amount: 5000,
          bonus_currency: 'RUB',
          is_active: true,
          priority: 2,
          conditions: 'Кандидат должен быть принят на работу',
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
        {
          id: '3',
          name: 'Бонус за LinkedIn',
          description: 'Бонус за привлечение кандидата с LinkedIn',
          source: 'LinkedIn',
          bonus_amount: 8000,
          bonus_currency: 'RUB',
          is_active: false,
          priority: 3,
          conditions: 'Кандидат должен быть принят на работу и проработать не менее 6 месяцев',
          created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        },
      ]
      
      setRules(demoData)
    } catch (error) {
      console.error('Error loading rules:', error)
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * handleAddRule - обработчик добавления нового правила привлечения
   * 
   * Функциональность:
   * - Валидирует данные нового правила
   * - Создает новое правило привлечения
   * - Обновляет список правил
   * - Очищает форму добавления
   * 
   * Валидация:
   * - name: обязательное поле (не пустое)
   * - source: обязательное поле (выбран источник)
   * 
   * Поведение:
   * - Проверяет заполненность обязательных полей
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После создания перезагружает список правил
   * - Закрывает форму добавления
   * 
   * Используется для:
   * - Добавления нового правила при клике на "Добавить правило"
   * 
   * TODO: Реализовать создание через API
   * - POST /api/company-settings/recruiting/rules/ - создание правила привлечения
   */
  const handleAddRule = async () => {
    if (!newRule.name || !newRule.source) {
      alert('Заполните обязательные поля: Название, Источник')
      return
    }

    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.createAttractionRule(newRule)
      
      console.log('Creating rule:', newRule)
      
      // Симуляция создания
      setTimeout(() => {
        setShowAddForm(false)
        setNewRule({
          name: '',
          description: '',
          source: '',
          bonus_amount: null,
          bonus_currency: 'RUB',
          is_active: true,
          priority: 0,
          conditions: '',
        })
        loadRules()
      }, 500)
    } catch (error) {
      console.error('Error creating rule:', error)
      alert('Ошибка при создании правила')
    } finally {
      setSaving(false)
    }
  }

  /**
   * handleEditRule - обработчик сохранения изменений правила привлечения
   * 
   * Функциональность:
   * - Сохраняет изменения отредактированного правила
   * - Обновляет правило в списке
   * - Закрывает режим редактирования
   * 
   * Поведение:
   * - Показывает индикатор сохранения
   * - В текущей реализации использует моковые данные
   * - После сохранения перезагружает список правил
   * - Закрывает режим редактирования
   * 
   * Используется для:
   * - Сохранения изменений правила при клике на "Сохранить"
   * 
   * @param rule - отредактированное правило для сохранения
   * 
   * TODO: Реализовать обновление через API
   * - PUT /api/company-settings/recruiting/rules/{id}/ - обновление правила привлечения
   */
  const handleEditRule = async (rule: AttractionRule) => {
    setSaving(true)
    try {
      // TODO: Заменить на реальный API вызов
      // await api.updateAttractionRule(rule.id, rule)
      
      console.log('Updating rule:', rule)
      
      // Симуляция обновления
      setTimeout(() => {
        setEditingRule(null)
        loadRules()
      }, 500)
    } catch (error) {
      console.error('Error updating rule:', error)
      alert('Ошибка при обновлении правила')
    } finally {
      setSaving(false)
    }
  }

  /**
   * handleDeleteRule - обработчик удаления правила привлечения
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - При подтверждении вызывает performDeleteRule
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления правила
   * - Показывает toast-уведомление с вопросом
   * - При подтверждении удаляет правило
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * - performDeleteRule: выполняет фактическое удаление
   * 
   * @param id - ID правила для удаления
   */
  const handleDeleteRule = (id: string) => {
    toast.showWarning('Удалить правило?', 'Вы уверены, что хотите удалить это правило?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteRule(id), variant: 'solid', color: 'red' },
      ],
    })
  }

  /**
   * performDeleteRule - выполнение удаления правила привлечения
   * 
   * Функциональность:
   * - Удаляет правило из списка правил
   * - Обрабатывает ошибки удаления
   * 
   * Поведение:
   * - Вызывается после подтверждения удаления
   * - В текущей реализации использует моковые данные
   * - Удаляет правило из состояния rules
   * - Показывает ошибку при неудачном удалении
   * 
   * Используется для:
   * - Фактического удаления правила после подтверждения
   * 
   * @param id - ID правила для удаления
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/company-settings/recruiting/rules/{id}/ - удаление правила привлечения
   */
  const performDeleteRule = async (id: string) => {
    try {
      // TODO: Заменить на реальный API вызов
      // await api.deleteAttractionRule(id)
      console.log('Deleting rule:', id)
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast.showError('Ошибка', 'Ошибка при удалении правила')
    }
  }

  /**
   * filteredRules - отфильтрованный список правил по поисковому запросу
   * 
   * Логика фильтрации:
   * - Проверяет наличие поискового запроса в названии, описании или источнике (без учета регистра)
   * - Если поисковый запрос пустой - возвращает все правила
   * 
   * Поведение:
   * - Поиск выполняется без учета регистра
   * - Проверяет три поля: name, description, source
   * - Результат используется для отображения в таблице
   */
  const filteredRules = rules.filter(rule => {
    const searchLower = searchTerm.toLowerCase()
    return (
      rule.name.toLowerCase().includes(searchLower) ||
      rule.description.toLowerCase().includes(searchLower) ||
      rule.source.toLowerCase().includes(searchLower)
    )
  })

  /**
   * formatDate - форматирование даты для отображения
   * 
   * Функциональность:
   * - Преобразует ISO строку даты в читаемый формат
   * - Формат: "DD.MM.YYYY, HH:MM"
   * 
   * Используется для:
   * - Отображения дат создания и обновления правил в таблице
   * 
   * @param dateString - ISO строка даты
   * @returns отформатированная дата в формате "DD.MM.YYYY, HH:MM"
   */
  const formatDate = (dateString: string) => {
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
   * formatBonus - форматирование бонуса для отображения
   * 
   * Функциональность:
   * - Форматирует размер бонуса с валютой
   * - Если бонус null - возвращает "-"
   * - Форматирует число с разделителями тысяч
   * 
   * Формат:
   * - "10,000 RUB" (с разделителями тысяч)
   * - "-" (если бонус не установлен)
   * 
   * Используется для:
   * - Отображения размера бонуса в таблице правил
   * 
   * @param amount - размер бонуса (может быть null)
   * @param currency - валюта бонуса (RUB, USD, EUR)
   * @returns отформатированная строка с бонусом или "-"
   */
  const formatBonus = (amount: number | null, currency: string) => {
    if (amount === null) return '-'
    return `${amount.toLocaleString('ru-RU')} ${currency}`
  }

  return (
    <AppLayout pageTitle="Правила привлечения">
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
            <Text size="2">📋</Text>
            <Text size="8" weight="bold">Правила привлечения</Text>
          </Flex>
          <Text size="3" color="gray">
            Управление правилами привлечения кандидатов: настройка бонусов и условий для различных источников
          </Text>
        </Box>

        {/* Панель поиска и кнопка добавления */}
        <Flex gap="3" align="center">
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <TextField.Root
              size="3"
              placeholder="Поиск правил..."
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
            Добавить правило
          </Button>
        </Flex>

        {/* Форма добавления нового правила */}
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
              <Text size="5" weight="bold">Добавить правило привлечения</Text>
              
              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Название *</Text>
                  <TextField.Root
                    size="2"
                    placeholder="Название правила"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </Box>
                
                <Box style={{ flex: '1 1 300px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Источник *</Text>
                  <Select.Root
                    value={newRule.source || ''}
                    onValueChange={(value) => setNewRule({ ...newRule, source: value })}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {availableSources.map((source) => (
                        <Select.Item key={source} value={source}>
                          {source}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              <Box>
                <Text size="2" weight="medium" mb="1" as="div">Описание</Text>
                <TextArea
                  size="2"
                  placeholder="Описание правила"
                  value={newRule.description || ''}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  rows={3}
                />
              </Box>

              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 200px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Размер бонуса</Text>
                  <TextField.Root
                    size="2"
                    type="number"
                    placeholder="0"
                    value={newRule.bonus_amount?.toString() || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      bonus_amount: e.target.value ? parseInt(e.target.value) : null 
                    })}
                  />
                </Box>
                
                <Box style={{ flex: '1 1 150px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Валюта</Text>
                  <Select.Root
                    value={newRule.bonus_currency || 'RUB'}
                    onValueChange={(value) => setNewRule({ ...newRule, bonus_currency: value })}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {availableCurrencies.map((currency) => (
                        <Select.Item key={currency} value={currency}>
                          {currency}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                
                <Box style={{ flex: '1 1 150px' }}>
                  <Text size="2" weight="medium" mb="1" as="div">Приоритет</Text>
                  <TextField.Root
                    size="2"
                    type="number"
                    placeholder="0"
                    value={newRule.priority?.toString() || '0'}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      priority: parseInt(e.target.value) || 0 
                    })}
                  />
                </Box>
              </Flex>

              <Box>
                <Text size="2" weight="medium" mb="1" as="div">Условия</Text>
                <TextArea
                  size="2"
                  placeholder="Условия применения правила"
                  value={newRule.conditions || ''}
                  onChange={(e) => setNewRule({ ...newRule, conditions: e.target.value })}
                  rows={3}
                />
              </Box>

              <Flex gap="2" align="center">
                <Button
                  size="2"
                  onClick={handleAddRule}
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
                    setNewRule({
                      name: '',
                      description: '',
                      source: '',
                      bonus_amount: null,
                      bonus_currency: 'RUB',
                      is_active: true,
                      priority: 0,
                      conditions: '',
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

        {/* Таблица правил */}
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
                  <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Источник</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Бонус</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Приоритет</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Условия</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ width: '100px' }}>Действия</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredRules.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={7}>
                      <Text align="center" color="gray">
                        {searchTerm ? 'Правила не найдены' : 'Нет правил'}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredRules.map((rule) => (
                    <Table.Row key={rule.id}>
                      {editingRule?.id === rule.id ? (
                        <>
                          <Table.Cell>
                            <TextField.Root
                              size="1"
                              placeholder="Название"
                              value={rule.name}
                              onChange={(e) => setEditingRule({ ...rule, name: e.target.value })}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Select.Root
                              value={rule.source}
                              onValueChange={(value) => setEditingRule({ ...rule, source: value })}
                            >
                              <Select.Trigger />
                              <Select.Content>
                                {availableSources.map((source) => (
                                  <Select.Item key={source} value={source}>
                                    {source}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <TextField.Root
                                size="1"
                                type="number"
                                placeholder="0"
                                value={rule.bonus_amount?.toString() || ''}
                                onChange={(e) => setEditingRule({ 
                                  ...rule, 
                                  bonus_amount: e.target.value ? parseInt(e.target.value) : null 
                                })}
                                style={{ width: '100px' }}
                              />
                              <Select.Root
                                value={rule.bonus_currency}
                                onValueChange={(value) => setEditingRule({ ...rule, bonus_currency: value })}
                              >
                                <Select.Trigger style={{ width: '80px' }} />
                                <Select.Content>
                                  {availableCurrencies.map((currency) => (
                                    <Select.Item key={currency} value={currency}>
                                      {currency}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root
                              size="1"
                              type="number"
                              placeholder="0"
                              value={rule.priority.toString()}
                              onChange={(e) => setEditingRule({ 
                                ...rule, 
                                priority: parseInt(e.target.value) || 0 
                              })}
                              style={{ width: '80px' }}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Select.Root
                              value={rule.is_active ? 'active' : 'inactive'}
                              onValueChange={(value) => setEditingRule({ ...rule, is_active: value === 'active' })}
                            >
                              <Select.Trigger />
                              <Select.Content>
                                <Select.Item value="active">Активно</Select.Item>
                                <Select.Item value="inactive">Неактивно</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <TextArea
                              size="1"
                              placeholder="Условия"
                              value={rule.conditions}
                              onChange={(e) => setEditingRule({ ...rule, conditions: e.target.value })}
                              rows={2}
                              style={{ minWidth: '200px' }}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                color="green"
                                onClick={() => handleEditRule(editingRule)}
                                disabled={saving}
                              >
                                <CheckIcon width={12} height={12} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                color="gray"
                                onClick={() => setEditingRule(null)}
                              >
                                <Cross2Icon width={12} height={12} />
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </>
                      ) : (
                        <>
                          <Table.Cell>
                            <Text size="2" weight="medium">{rule.name}</Text>
                            {rule.description && (
                              <Text size="1" color="gray" as="div">
                                {rule.description}
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge size="1" variant="soft">
                              {rule.source}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">
                              {formatBonus(rule.bonus_amount, rule.bonus_currency)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2">{rule.priority}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="1"
                              color={rule.is_active ? 'green' : 'red'}
                              variant="soft"
                            >
                              {rule.is_active ? 'Активно' : 'Неактивно'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="1" color="gray" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {rule.conditions || '-'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="1">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => setEditingRule(rule)}
                              >
                                <Pencil1Icon width={12} height={12} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                color="red"
                                onClick={() => handleDeleteRule(rule.id)}
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
