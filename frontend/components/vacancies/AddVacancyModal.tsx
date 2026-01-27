/**
 * AddVacancyModal (components/vacancies/AddVacancyModal.tsx) - Модальное окно добавления новой вакансии
 * 
 * Назначение:
 * - Создание новой вакансии с настройкой всех параметров
 * - Многошаговая форма с вкладками для разных разделов настроек
 * - Адаптивная верстка для мобильных устройств (overlay режим)
 * 
 * Функциональность:
 * - 12 вкладок настроек: Основная информация, Текст вакансии, Рекрутеры, Заказчики и интервьюеры,
 *   Вопросы и ссылки, Связи и интеграции, Статусы, Зарплатные вилки, Встречи и интервью,
 *   Scorecard, Обработка данных, История правок
 * - Боковая панель с навигацией по вкладкам
 * - Адаптивный режим overlay для мобильных устройств (< 800px)
 * - Валидация обязательных полей перед сохранением
 * - Управление рекрутерами (выбор нескольких, назначение главного)
 * 
 * Связи:
 * - vacancies/page.tsx: открывается при клике на "Добавить вакансию"
 * - BasicInfoEditSection: компонент редактирования основной информации
 * - Использует моковые данные для департаментов и рекрутеров
 * 
 * Поведение:
 * - При открытии показывает первую вкладку "Основная информация"
 * - При закрытии сбрасывает форму и активную вкладку
 * - На мобильных устройствах открывает overlay для контента вкладки
 * - При сохранении валидирует обязательные поля и вызывает onSave
 * 
 * TODO: Реализовать все вкладки настроек
 * TODO: Заменить моковые данные на реальные из API
 */
'use client'

import {
  Box,
  Flex,
  Text,
  Button,
  Dialog,
  TextArea,
  Select,
  Card,
  Checkbox,
  Switch,
  Separator,
} from '@radix-ui/themes'
import { PlusIcon, InfoCircledIcon, ChevronLeftIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import BasicInfoEditSection from './edit/BasicInfoEditSection'
import styles from './AddVacancyModal.module.css'

/**
 * AddVacancyFormData - интерфейс данных формы добавления вакансии
 * 
 * Структура:
 * - basicInfo: основная информация (название, статус, рекрутер, технологии, Huntflow ID)
 * - text: текст вакансии (департамент, заголовок)
 * - recruiters: рекрутеры (выбранные ID, главный рекрутер)
 */
export interface AddVacancyFormData {
  basicInfo: {
    title: string
    status: 'active' | 'inactive'
    recruiter: string
    technologies: string
    huntflowId: string
  }
  text: {
    departmentId: string
    header: string
  }
  recruiters: {
    selectedIds: string[]
    mainId: string | null
  }
}

/**
 * AddVacancyTab - тип вкладки настроек вакансии
 * 
 * Вкладки:
 * - basic: Основная информация
 * - text: Текст вакансии
 * - recruiters: Рекрутеры
 * - customers: Заказчики и интервьюеры
 * - questions: Вопросы и ссылки
 * - integrations: Связи и интеграции
 * - statuses: Статусы
 * - salary: Зарплатные вилки
 * - interviews: Встречи и интервью
 * - scorecard: Scorecard
 * - dataProcessing: Обработка данных
 * - history: История правок
 */
type AddVacancyTab =
  | 'basic'
  | 'text'
  | 'recruiters'
  | 'customers'
  | 'questions'
  | 'integrations'
  | 'statuses'
  | 'salary'
  | 'interviews'
  | 'scorecard'
  | 'dataProcessing'
  | 'history'

/**
 * Department - интерфейс департамента (упрощённая иерархия)
 * 
 * Структура:
 * - id: уникальный идентификатор департамента
 * - name: название департамента
 * - parent: ID родительского департамента (null для корневых)
 * - children: массив дочерних департаментов (опционально)
 */
interface Department {
  id: string
  name: string
  parent: string | null
  children?: Department[]
}

/**
 * mockDepartments - моковые данные департаментов
 * 
 * Используется для:
 * - Выбора департамента при создании вакансии
 * 
 * TODO: Загружать из API
 */
const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'IT Департамент',
    parent: null,
    children: [
      {
        id: '2',
        name: 'Отдел разработки',
        parent: '1',
        children: [
          { id: '5', name: 'Frontend команда', parent: '2', children: [] },
          { id: '6', name: 'Backend команда', parent: '2', children: [] },
        ],
      },
      { id: '3', name: 'Отдел тестирования', parent: '1', children: [] },
    ],
  },
  { id: '4', name: 'HR Департамент', parent: null, children: [] },
]

/**
 * getAllDepartmentsFlat - преобразование иерархической структуры департаментов в плоский список
 * 
 * Функциональность:
 * - Рекурсивно обходит дерево департаментов
 * - Создает плоский список с указанием уровня вложенности
 * 
 * Используется для:
 * - Отображения департаментов в выпадающем списке с отступами
 * 
 * @param departments - массив департаментов (иерархическая структура)
 * @param level - текущий уровень вложенности (по умолчанию 0)
 * @returns плоский массив департаментов с уровнями
 */
function getAllDepartmentsFlat(
  departments: Department[],
  level = 0
): Array<{ id: string; name: string; level: number }> {
  const result: Array<{ id: string; name: string; level: number }> = []
  departments.forEach((dept) => {
    result.push({ id: dept.id, name: dept.name, level })
    if (dept.children?.length) {
      result.push(...getAllDepartmentsFlat(dept.children, level + 1))
    }
  })
  return result
}

/**
 * flatDepartments - плоский список всех департаментов с уровнями
 * 
 * Используется для:
 * - Отображения в выпадающем списке с отступами в зависимости от уровня
 */
const flatDepartments = getAllDepartmentsFlat(mockDepartments)

/**
 * mockRecruiters - моковые данные рекрутеров
 * 
 * Используется для:
 * - Выбора рекрутеров при создании вакансии
 * 
 * TODO: Загружать из API
 */
const mockRecruiters = [
  { id: '1', name: 'Иван Иванов', email: 'ivan@company.com', phone: '+7 (999) 111-22-33', position: 'Senior Recruiter' },
  { id: '2', name: 'Петр Петров', email: 'petr@company.com', phone: '+7 (999) 222-33-44', position: 'Recruiter' },
  { id: '3', name: 'Мария Сидорова', email: 'maria@company.com', phone: '+7 (999) 333-44-55', position: 'Lead Recruiter' },
  { id: '4', name: 'Анна Смирнова', email: 'anna@company.com', phone: '+7 (999) 444-55-66', position: 'Recruiter' },
  { id: '5', name: 'Дмитрий Козлов', email: 'dmitry@company.com', phone: '+7 (999) 555-66-77', position: 'Junior Recruiter' },
]

/**
 * initialFormData - начальные данные формы
 * 
 * Используется для:
 * - Инициализации формы при открытии модального окна
 * - Сброса формы при закрытии
 */
const initialFormData: AddVacancyFormData = {
  basicInfo: {
    title: '',
    status: 'active',
    recruiter: '',
    technologies: '',
    huntflowId: '',
  },
  text: {
    departmentId: '',
    header: '',
  },
  recruiters: {
    selectedIds: [],
    mainId: null,
  },
}

/**
 * AddVacancyModalProps - интерфейс пропсов компонента AddVacancyModal
 * 
 * Структура:
 * - isOpen: флаг открытости модального окна
 * - onClose: обработчик закрытия модального окна
 * - onSave: обработчик сохранения вакансии
 */
interface AddVacancyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AddVacancyFormData) => void
}

/**
 * useMatchMedia - хук для определения соответствия медиа-запросу
 * 
 * Функциональность:
 * - Определяет, соответствует ли текущий размер экрана медиа-запросу
 * - Обновляется при изменении размера окна
 * 
 * Используется для:
 * - Определения overlay режима на мобильных устройствах
 * 
 * @param query - медиа-запрос (например, '(max-width: 799px)')
 * @returns true если запрос соответствует, false иначе
 */
function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR: пропускаем
    const m = window.matchMedia(query)
    setMatches(m.matches) // Устанавливаем начальное значение
    const listener = () => setMatches(m.matches) // Обновляем при изменении
    m.addEventListener('change', listener)
    return () => m.removeEventListener('change', listener) // Cleanup
  }, [query])
  return matches
}

/**
 * AddVacancyModal - компонент модального окна добавления вакансии
 * 
 * Состояние:
 * - activeTab: активная вкладка настроек
 * - formData: данные формы
 * - isContentOverlayOpen: флаг открытости overlay контента (для мобильных)
 * - isOverlayMode: флаг overlay режима (определяется через useMatchMedia)
 * 
 * Функциональность:
 * - Управление вкладками настроек
 * - Управление данными формы
 * - Адаптивное поведение для мобильных устройств
 */
export default function AddVacancyModal({ isOpen, onClose, onSave }: AddVacancyModalProps) {
  // Активная вкладка настроек (по умолчанию 'basic' - Основная информация)
  const [activeTab, setActiveTab] = useState<AddVacancyTab>('basic')
  // Данные формы добавления вакансии
  const [formData, setFormData] = useState<AddVacancyFormData>(initialFormData)
  // Флаг открытости overlay контента (для мобильных устройств)
  const [isContentOverlayOpen, setContentOverlayOpen] = useState(false)
  // Определение overlay режима (для экранов < 800px)
  const isOverlayMode = useMatchMedia('(max-width: 799px)')

  /**
   * useEffect - сброс формы и управление overlay при открытии/закрытии модального окна
   * 
   * Функциональность:
   * - При закрытии: сбрасывает форму, активную вкладку и overlay
   * - При открытии на мобильных: открывает overlay для контента
   * 
   * Поведение:
   * - Выполняется при изменении isOpen или isOverlayMode
   * - Обеспечивает чистое состояние при каждом открытии
   */
  useEffect(() => {
    if (!isOpen) {
      // При закрытии: сбрасываем форму, активную вкладку и overlay
      setFormData(initialFormData)
      setActiveTab('basic')
      setContentOverlayOpen(false)
    } else if (isOverlayMode) {
      // При открытии на мобильных: открываем overlay для контента
      setContentOverlayOpen(true)
    }
  }, [isOpen, isOverlayMode])

  /**
   * handleBasicInfoChange - обработчик изменения основной информации
   * 
   * Функциональность:
   * - Обновляет данные основной информации в форме
   * 
   * Поведение:
   * - Вызывается из BasicInfoEditSection при изменении полей
   * - Обновляет только измененные поля (через spread)
   * 
   * @param data - частичные данные основной информации
   */
  const handleBasicInfoChange = (data: Partial<AddVacancyFormData['basicInfo']>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data }, // Объединяем с существующими данными
    }))
  }

  /**
   * handleRecruiterToggle - обработчик переключения выбора рекрутера
   * 
   * Функциональность:
   * - Добавляет/удаляет рекрутера из списка выбранных
   * - Если удаляется главный рекрутер - сбрасывает главного
   * 
   * Поведение:
   * - Если рекрутер уже выбран - удаляет его из списка
   * - Если рекрутер не выбран - добавляет его в список
   * - Если удаляется главный рекрутер - сбрасывает главного
   * 
   * @param id - ID рекрутера для переключения
   */
  const handleRecruiterToggle = (id: string) => {
    setFormData((prev) => {
      const next = new Set(prev.recruiters.selectedIds)
      if (next.has(id)) {
        // Если рекрутер уже выбран - удаляем его
        next.delete(id)
        // Если это был главный рекрутер - сбрасываем главного
        const mainId = prev.recruiters.mainId === id ? null : prev.recruiters.mainId
        return { ...prev, recruiters: { selectedIds: [...next], mainId } }
      }
      // Если рекрутер не выбран - добавляем его
      next.add(id)
      return { ...prev, recruiters: { ...prev.recruiters, selectedIds: [...next] } }
    })
  }

  /**
   * handleMainRecruiterToggle - обработчик переключения главного рекрутера
   * 
   * Функциональность:
   * - Устанавливает/снимает главного рекрутера
   * 
   * Поведение:
   * - Если рекрутер не выбран - не выполняет действий
   * - Если рекрутер уже главный - снимает его с главного
   * - Если рекрутер не главный - делает его главным
   * 
   * @param id - ID рекрутера для переключения главного статуса
   */
  const handleMainRecruiterToggle = (id: string) => {
    setFormData((prev) => {
      // Если рекрутер не выбран - не выполняем действий
      if (!prev.recruiters.selectedIds.includes(id)) return prev
      // Переключаем главного рекрутера
      const mainId = prev.recruiters.mainId === id ? null : id
      return { ...prev, recruiters: { ...prev.recruiters, mainId } }
    })
  }

  /**
   * handleSave - обработчик сохранения вакансии
   * 
   * Функциональность:
   * - Валидирует обязательные поля
   * - Сохраняет вакансию через onSave
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Проверяет наличие названия вакансии
   * - Проверяет наличие ответственного рекрутера
   * - При ошибке валидации показывает alert
   * - При успехе вызывает onSave и закрывает модальное окно
   */
  const handleSave = () => {
    // Валидация: проверяем наличие названия вакансии
    if (!formData.basicInfo.title?.trim()) {
      alert('Заполните название вакансии')
      return
    }
    // Валидация: проверяем наличие ответственного рекрутера
    if (!formData.basicInfo.recruiter) {
      alert('Выберите ответственного рекрутера')
      return
    }
    onSave(formData) // Сохраняем вакансию
    onClose() // Закрываем модальное окно
  }

  const tabs: { id: AddVacancyTab; label: string }[] = [
    { id: 'basic', label: 'Основная информация' },
    { id: 'text', label: 'Текст вакансии' },
    { id: 'recruiters', label: 'Рекрутеры' },
    { id: 'customers', label: 'Заказчики и интервьюеры' },
    { id: 'questions', label: 'Вопросы и ссылки' },
    { id: 'integrations', label: 'Связи и интеграции' },
    { id: 'statuses', label: 'Статусы' },
    { id: 'salary', label: 'Зарплатные вилки' },
    { id: 'interviews', label: 'Встречи и интервью' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'dataProcessing', label: 'Обработка данных' },
    { id: 'history', label: 'История правок' },
  ]

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className={styles.modalContent}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <PlusIcon width={20} height={20} />
            Добавить вакансию
          </Flex>
        </Dialog.Title>

        <Flex className={styles.layout}>
          <Card className={styles.tabsCard}>
            <Flex direction="column" gap="4">
              <Text size="4" weight="bold">Настройки вакансии</Text>
              <Separator size="4" />
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Разделы настроек
                </Text>
                <Flex direction="column" gap="1" className={styles.tabsButtons}>
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'solid' : 'soft'}
                      size="2"
                      className={styles.tabButton}
                      onClick={() => {
                      setActiveTab(tab.id)
                      if (isOverlayMode) setContentOverlayOpen(true)
                    }}
                    >
                      <Text size="2">{tab.label}</Text>
                    </Button>
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Card>

          {isOverlayMode && isContentOverlayOpen && (
            <Box
              className={styles.contentOverlay}
              onClick={() => setContentOverlayOpen(false)}
              onKeyDown={(e) => e.key === 'Enter' && setContentOverlayOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Закрыть"
            />
          )}

          <Card className={`${styles.contentCard} ${isOverlayMode && isContentOverlayOpen ? styles.contentCardOpen : ''}`}>
            <Box className={styles.contentColumn}>
            {isOverlayMode && (
              <Flex mb="3">
                <Button variant="ghost" size="2" onClick={() => setContentOverlayOpen(false)}>
                  <ChevronLeftIcon width={16} height={16} />
                  Назад
                </Button>
              </Flex>
            )}
            {activeTab === 'basic' && (
              <BasicInfoEditSection
                data={formData.basicInfo}
                onChange={handleBasicInfoChange}
              />
            )}

            {activeTab === 'text' && (
              <Box className={styles.sectionCard}>
                <Flex align="center" gap="2" mb="4" className={styles.header}>
                  <Box className={styles.iconCircle}>
                    <InfoCircledIcon width={16} height={16} />
                  </Box>
                  <Text size="5" weight="bold">
                    Текст вакансии
                  </Text>
                </Flex>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Отдел
                    </Text>
                    <Select.Root
                      value={formData.text.departmentId}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          text: { ...prev.text, departmentId: v },
                        }))
                      }
                    >
                      <Select.Trigger placeholder="Выберите отдел" style={{ width: '100%' }} />
                      <Select.Content>
                        {flatDepartments.map((d) => (
                          <Select.Item key={d.id} value={d.id}>
                            {'  '.repeat(d.level)}
                            {d.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Шапка
                    </Text>
                    <TextArea
                      value={formData.text.header}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          text: { ...prev.text, header: e.target.value },
                        }))
                      }
                      placeholder="Введите текст шапки вакансии"
                      rows={6}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </Box>
                </Flex>
              </Box>
            )}

            {activeTab === 'recruiters' && (
              <Box className={styles.sectionCard}>
                <Text size="5" weight="bold" mb="4" style={{ display: 'block' }}>
                  Рекрутеры
                </Text>
                <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
                  Выберите рекрутеров, которые будут работать с вакансией. Отметьте главного рекрутера.
                </Text>
                <Flex direction="column" gap="3">
                  {mockRecruiters.map((r) => {
                    const isSelected = formData.recruiters.selectedIds.includes(r.id)
                    const isMain = formData.recruiters.mainId === r.id
                    return (
                      <Card key={r.id} className={styles.recruiterCard}>
                        <Flex align="center" gap="3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRecruiterToggle(r.id)}
                          />
                          <Flex direction="column" gap="1" style={{ flex: 1 }}>
                            <Flex align="center" gap="2">
                              <Text size="3" weight="medium">
                                {r.name}
                              </Text>
                              {isMain && (
                                <Text size="1" color="blue" weight="medium">
                                  Главный
                                </Text>
                              )}
                            </Flex>
                            <Text size="2" color="gray">
                              {r.position}
                            </Text>
                            <Text size="1" color="gray">
                              {r.email}
                            </Text>
                          </Flex>
                          <Box>
                            <Text size="1" color="gray" mb="1" style={{ display: 'block', textAlign: 'right' }}>
                              Главный
                            </Text>
                            <Switch
                              checked={isMain}
                              disabled={!isSelected}
                              onCheckedChange={() => handleMainRecruiterToggle(r.id)}
                            />
                          </Box>
                        </Flex>
                      </Card>
                    )
                  })}
                </Flex>
              </Box>
            )}

            {['customers', 'questions', 'integrations', 'statuses', 'salary', 'interviews', 'scorecard', 'dataProcessing', 'history'].includes(activeTab) && (
              <Box className={styles.sectionCard}>
                <Text size="5" weight="bold" mb="2" style={{ display: 'block' }}>
                  {tabs.find((t) => t.id === activeTab)?.label}
                </Text>
                <Text size="2" color="gray">
                  Содержимое раздела будет доступно после создания вакансии.
                </Text>
              </Box>
            )}
            </Box>
          </Card>
        </Flex>

        <Flex justify="end" gap="3" className={styles.footer}>
          <Button size="3" variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button size="3" variant="solid" onClick={handleSave}>
            Создать вакансию
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
