/**
 * VacanciesPage (vacancies/page.tsx) - Страница управления вакансиями
 * 
 * Назначение:
 * - Отображение списка всех вакансий компании
 * - Фильтрация и поиск вакансий
 * - Переключение между видами отображения (карточки/список)
 * - Создание, просмотр и редактирование вакансий
 * - Управление статусами вакансий (активная/неактивная)
 * 
 * Функциональность:
 * - VacanciesSearchFilters: поиск по названию/ID и фильтры по рекрутеру/статусу
 * - VacanciesStats: статистика по вакансиям (всего/активные/неактивные)
 * - VacancyCard: карточка вакансии для вида "карточки"
 * - VacancyListItem: элемент списка для вида "список"
 * - VacancyEditModal: модальное окно для просмотра и редактирования вакансии
 * - Переключатель вида отображения (сетка/список)
 * - Кнопка добавления новой вакансии
 * 
 * Связи:
 * - AppLayout: общий layout с Header и Sidebar
 * - useSearchParams: чтение параметра ?edit из URL для открытия редактирования
 * - Компоненты вакансий: VacancyCard, VacancyListItem, VacancyEditModal
 * 
 * Поведение:
 * - При загрузке проверяет URL параметр ?edit для открытия редактирования
 * - Фильтрация вакансий происходит в реальном времени при изменении фильтров
 * - Статусы вакансий могут быть переопределены локально (statusOverrides)
 * - При клике на вакансию открывается модальное окно просмотра/редактирования
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { useState, useEffect, Suspense } from "react"
import VacanciesSearchFilters from "@/components/vacancies/VacanciesSearchFilters"
import VacanciesStats from "@/components/vacancies/VacanciesStats"
import VacancyCard from "@/components/vacancies/VacancyCard"
import VacancyListItem from "@/components/vacancies/VacancyListItem"
import VacancyEditModal from "@/components/vacancies/VacancyEditModal"
import { GridIcon, ListBulletIcon } from "@radix-ui/react-icons"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { useSearchParams } from "next/navigation"
import styles from './vacancies.module.css'

/**
 * mockVacancies - моковые данные вакансий для демонстрации
 * 
 * Структура вакансии:
 * - id: уникальный идентификатор вакансии
 * - title: название вакансии
 * - status: статус ('active' - активная, 'inactive' - неактивная)
 * - recruiter: имя рекрутера, ведущего вакансию
 * - locations: массив локаций (города, удаленная работа)
 * - interviewers: количество назначенных интервьюеров
 * - date: дата создания/обновления (может быть null)
 * - hasWarning: флаг наличия предупреждения
 * - warningText: текст предупреждения (например, "Зарплатные вилки не установлены")
 * 
 * TODO: Заменить на реальные данные из API
 */
const mockVacancies = [
  {
    id: 4090046,
    title: 'AQA Engineer (TS)',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо'],
    interviewers: 0,
    date: '25.10.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 3993218,
    title: 'UX/UI Designer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: [],
    interviewers: 0,
    date: '22.09.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 4020335,
    title: 'System Administrator',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Гомель'],
    interviewers: 0,
    date: '22.09.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  },
  {
    id: 4092269,
    title: 'Manual QA Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: [],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3979419,
    title: 'DevOps Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо', 'Польша'],
    interviewers: 0,
    date: null,
    hasWarning: false
  },
  {
    id: 3936534,
    title: 'Project Manager',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск'],
    interviewers: 2,
    date: null,
    hasWarning: false
  },
  {
    id: 4090047,
    title: 'Frontend Engineer',
    status: 'active',
    recruiter: 'Andrei Golubenko',
    locations: ['Минск', 'Удалённо'],
    interviewers: 1,
    date: '26.10.2025',
    hasWarning: false
  },
  {
    id: 4090048,
    title: 'Backend Engineer',
    status: 'inactive',
    recruiter: 'Andrei Golubenko',
    locations: ['Варшава', 'Удалённо'],
    interviewers: 0,
    date: '20.10.2025',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены'
  }
] as { id: number; title: string; status: 'active' | 'inactive'; recruiter: string; locations: string[]; interviewers: number; date: string | null; hasWarning: boolean; warningText?: string }[]

/**
 * VacanciesPageContent - основной компонент содержимого страницы вакансий
 * 
 * Состояние:
 * - viewMode: режим отображения ('cards' | 'list')
 * - searchQuery: поисковый запрос
 * - selectedRecruiter: выбранный рекрутер для фильтрации ('all' или имя рекрутера)
 * - selectedStatus: выбранный статус для фильтрации ('all' | 'active' | 'inactive')
 * - viewVacancyId: ID вакансии для просмотра в модальном окне
 * - editVacancyId: ID вакансии для редактирования в модальном окне
 * - statusOverrides: объект переопределений статусов вакансий (для временных изменений)
 */
function VacanciesPageContent() {
  // Получение параметров из URL (например, ?edit=123)
  const searchParams = useSearchParams()
  // Режим отображения: 'cards' - карточки, 'list' - список
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  // Поисковый запрос для фильтрации вакансий
  const [searchQuery, setSearchQuery] = useState('')
  // Выбранный рекрутер для фильтрации ('all' - все рекрутеры)
  const [selectedRecruiter, setSelectedRecruiter] = useState('all')
  // Выбранный статус для фильтрации ('all' - все статусы)
  const [selectedStatus, setSelectedStatus] = useState('all')
  // ID вакансии для просмотра (открывает модальное окно в режиме просмотра)
  const [viewVacancyId, setViewVacancyId] = useState<number | null>(null)
  // ID вакансии для редактирования (открывает модальное окно в режиме редактирования)
  const [editVacancyId, setEditVacancyId] = useState<number | null>(null)
  // Переопределения статусов вакансий: позволяет временно изменить статус без сохранения
  // Ключ - ID вакансии, значение - новый статус
  const [statusOverrides, setStatusOverrides] = useState<Record<number, 'active' | 'inactive'>>({})

  /**
   * getStatus - получение актуального статуса вакансии
   * 
   * Функциональность:
   * - Проверяет наличие переопределения статуса в statusOverrides
   * - Если переопределение есть - возвращает его, иначе возвращает оригинальный статус
   * 
   * Поведение:
   * - Используется для отображения актуального статуса с учетом временных изменений
   * - Позволяет изменять статус без немедленного сохранения на сервер
   * 
   * @param v - объект вакансии
   * @returns актуальный статус вакансии ('active' | 'inactive')
   */
  const getStatus = (v: (typeof mockVacancies)[0]) => statusOverrides[v.id] ?? v.status

  /**
   * useEffect - проверка URL параметра ?edit для открытия модального окна редактирования
   * 
   * Функциональность:
   * - Читает параметр 'edit' из URL
   * - Если параметр существует и валиден - открывает модальное окно редактирования
   * - Закрывает модальное окно просмотра, если оно было открыто
   * 
   * Поведение:
   * - Выполняется при монтировании компонента и при изменении searchParams
   * - Позволяет открывать страницу с модальным окном редактирования через URL
   * - Пример использования: /vacancies?edit=123
   * 
   * Связи:
   * - Используется для глубоких ссылок на редактирование вакансии
   */
  useEffect(() => {
    const id = searchParams.get('edit')
    if (!id) return
    const n = parseInt(id, 10)
    // Если ID валиден - открываем модальное окно редактирования и закрываем просмотр
    if (!isNaN(n)) { setEditVacancyId(n); setViewVacancyId(null) }
  }, [searchParams])

  /**
   * Вычисление статистики по вакансиям
   * - totalVacancies: общее количество вакансий
   * - activeVacancies: количество активных вакансий (с учетом переопределений статусов)
   * - inactiveVacancies: количество неактивных вакансий (с учетом переопределений статусов)
   * 
   * Используется для отображения в компоненте VacanciesStats
   */
  const totalVacancies = mockVacancies.length
  const activeVacancies = mockVacancies.filter(v => getStatus(v) === 'active').length
  const inactiveVacancies = mockVacancies.filter(v => getStatus(v) === 'inactive').length

  /**
   * filteredVacancies - отфильтрованный список вакансий
   * 
   * Логика фильтрации:
   * 1. Поиск по названию или ID: проверяет, содержит ли название или ID поисковый запрос (без учета регистра)
   * 2. Фильтр по рекрутеру: если выбран 'all' - пропускает все, иначе проверяет совпадение имени рекрутера
   * 3. Фильтр по статусу: если выбран 'all' - пропускает все, иначе проверяет совпадение статуса (с учетом переопределений)
   * 
   * Поведение:
   * - Все три условия должны выполняться одновременно (логическое И)
   * - Использует getStatus() для получения актуального статуса с учетом переопределений
   * - Результат используется для отображения в виде карточек или списка
   */
  const filteredVacancies = mockVacancies.filter(vacancy => {
    const status = getStatus(vacancy)
    // Поиск: проверяет название (без учета регистра) или ID вакансии
    const matchesSearch = !searchQuery || 
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.id.toString().includes(searchQuery)
    // Фильтр по рекрутеру: 'all' пропускает все, иначе проверяет точное совпадение
    const matchesRecruiter = selectedRecruiter === 'all' || vacancy.recruiter === selectedRecruiter
    // Фильтр по статусу: 'all' пропускает все, иначе проверяет совпадение статуса
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    // Все три условия должны выполняться
    return matchesSearch && matchesRecruiter && matchesStatus
  })

  return (
    <AppLayout pageTitle="Вакансии">
      <Box data-tour="vacancies-page" className={styles.vacanciesContainer}>
        {/* Компонент поиска и фильтров
            - searchQuery: текущий поисковый запрос
            - onSearchChange: обработчик изменения поискового запроса
            - selectedRecruiter: выбранный рекрутер для фильтрации
            - onRecruiterChange: обработчик изменения выбранного рекрутера
            - selectedStatus: выбранный статус для фильтрации
            - onStatusChange: обработчик изменения выбранного статуса */}
        <VacanciesSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRecruiter={selectedRecruiter}
          onRecruiterChange={setSelectedRecruiter}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Компонент статистики по вакансиям
            - total: общее количество вакансий
            - active: количество активных вакансий
            - inactive: количество неактивных вакансий */}
        <VacanciesStats
          total={totalVacancies}
          active={activeVacancies}
          inactive={inactiveVacancies}
        />

        {/* Заголовок секции с переключателем вида отображения
            - data-tour="vacancies-toolbar": используется в приветственном туре
            - Содержит название секции, переключатель вида (карточки/список) и кнопку добавления вакансии */}
        <Flex data-tour="vacancies-toolbar" justify="between" align="center" className={styles.sectionHeader}>
          <Flex align="center" gap="2">
            <HamburgerMenuIcon width={20} height={20} />
            <Text size="5" weight="bold">Вакансии</Text>
          </Flex>
          <Flex align="center" gap="3">
            {/* Переключатель вида отображения: карточки или список
                - Первая кнопка: вид карточек (GridIcon), активна когда viewMode === 'cards'
                - Вторая кнопка: вид списка (ListBulletIcon), активна когда viewMode === 'list'
                - При клике меняет viewMode и перерисовывает список вакансий */}
            <Flex gap="1" className={styles.viewToggle}>
              <Button
                variant={viewMode === 'cards' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('cards')}
                className={styles.viewButton}
              >
                <GridIcon width={16} height={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'soft'}
                size="2"
                onClick={() => setViewMode('list')}
                className={styles.viewButton}
              >
                <ListBulletIcon width={16} height={16} />
              </Button>
            </Flex>
            {/* Кнопка создания новой вакансии
                TODO: Добавить обработчик onClick для открытия модального окна создания */}
            <Button size="3" className={styles.addButton}>
              + Добавить вакансию
            </Button>
          </Flex>
        </Flex>

        {/* Условный рендеринг списка вакансий в зависимости от выбранного вида
            - viewMode === 'cards': отображает вакансии в виде карточек (VacancyCard)
            - viewMode === 'list': отображает вакансии в виде списка (VacancyListItem)
            - Оба варианта используют filteredVacancies для отображения отфильтрованных данных */}
        {viewMode === 'cards' ? (
          <Box className={styles.cardsGrid}>
            {filteredVacancies.map(vacancy => (
              <VacancyCard 
                key={vacancy.id} 
                vacancy={{ ...vacancy, status: getStatus(vacancy) }}
                // onClick: открывает модальное окно просмотра вакансии, закрывает редактирование
                onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
                // onEditClick: открывает модальное окно редактирования, закрывает просмотр
                onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
                // onStatusClick: переключает статус вакансии (active <-> inactive) в statusOverrides
                onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.listContainer}>
            {filteredVacancies.map(vacancy => (
              <VacancyListItem 
                key={vacancy.id} 
                vacancy={{ ...vacancy, status: getStatus(vacancy) }}
                // onClick: открывает модальное окно просмотра вакансии, закрывает редактирование
                onClick={() => { setViewVacancyId(vacancy.id); setEditVacancyId(null) }}
                // onEditClick: открывает модальное окно редактирования, закрывает просмотр
                onEditClick={() => { setEditVacancyId(vacancy.id); setViewVacancyId(null) }}
                // onStatusClick: переключает статус вакансии (active <-> inactive) в statusOverrides
                onStatusClick={() => { const s = getStatus(vacancy); setStatusOverrides(prev => ({ ...prev, [vacancy.id]: s === 'active' ? 'inactive' : 'active' })) }}
              />
            ))}
          </Box>
        )}

        {/* Модальное окно просмотра/редактирования вакансии
            - open: открыто, если есть viewVacancyId или editVacancyId
            - onOpenChange: закрывает модальное окно и очищает состояния при закрытии
            - vacancyId: ID вакансии для просмотра/редактирования
            - mode: 'view' если открыто для просмотра, 'edit' если для редактирования
            - vacancy: объект вакансии с актуальным статусом (с учетом переопределений)
            - vacancyStatus: актуальный статус вакансии
            - onVacancyStatusChange: обработчик изменения статуса (обновляет statusOverrides)
            - onSwitchToEdit: переключает модальное окно из режима просмотра в режим редактирования
            - vacancyTitle: название вакансии для отображения в заголовке модального окна */}
        <VacancyEditModal
          open={!!(editVacancyId || viewVacancyId)}
          onOpenChange={(open) => { if (!open) { setEditVacancyId(null); setViewVacancyId(null) } }}
          vacancyId={editVacancyId ?? viewVacancyId}
          mode={viewVacancyId ? 'view' : 'edit'}
          vacancy={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? { ...v, status: statusOverrides[v.id] ?? v.status } : null })()}
          vacancyStatus={(() => { const id = editVacancyId ?? viewVacancyId; const v = id != null ? mockVacancies.find(x => x.id === id) : undefined; return v ? (statusOverrides[v.id] ?? v.status) : undefined })()}
          onVacancyStatusChange={(status) => { const id = editVacancyId ?? viewVacancyId; if (id != null) setStatusOverrides(prev => ({ ...prev, [id]: status })) }}
          onSwitchToEdit={viewVacancyId != null ? () => { setEditVacancyId(viewVacancyId); setViewVacancyId(null) } : undefined}
          vacancyTitle={mockVacancies.find(v => v.id === (editVacancyId ?? viewVacancyId))?.title}
        />
      </Box>
    </AppLayout>
  )
}

/**
 * VacanciesPage - обертка для VacanciesPageContent с Suspense
 * 
 * Функциональность:
 * - Оборачивает VacanciesPageContent в Suspense для обработки асинхронной загрузки
 * - Показывает fallback (загрузку) пока компонент загружается
 * - Необходимо для использования useSearchParams() внутри компонента
 * 
 * Поведение:
 * - При загрузке показывает индикатор загрузки
 * - После загрузки отображает VacanciesPageContent
 * 
 * Причина использования Suspense:
 * - useSearchParams() требует обертки в Suspense для корректной работы с серверным рендерингом
 */
export default function VacanciesPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Вакансии"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <VacanciesPageContent />
    </Suspense>
  )
}
