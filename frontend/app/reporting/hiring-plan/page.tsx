/**
 * HiringPlanPage (reporting/hiring-plan/page.tsx) - Страница плана найма (заявки на найм)
 * 
 * Назначение:
 * - Отображение заявок на найм с фильтрацией и поиском
 * - Статистика по заявкам (всего, планируется, в процессе, закрыто, отменено)
 * - Метрики SLA и Time-to-Hire
 * - Переход к годовой таблице плана найма
 * 
 * Функциональность:
 * - Список заявок на найм в таблице
 * - Поиск по вакансии, кандидату, проекту
 * - Фильтрация по статусу, периоду, вакансии, рекрутеру
 * - Пагинация с настраиваемым лимитом записей
 * - Статистика: всего заявок, планируется, в процессе, закрыто, отменено
 * - Метрики: выполнение (%), среднее SLA (план/факт), средний Time-to-Hire
 * - Переход к годовой таблице плана найма
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - Link: навигация к годовой таблице плана найма
 * - reporting/hiring-plan/yearly/page.tsx: годовая таблица плана найма
 * - hiring-requests/page.tsx: страница управления заявками на найм
 * 
 * Поведение:
 * - При загрузке отображает все заявки
 * - Фильтрует заявки по поисковому запросу, статусу, периоду, вакансии, рекрутеру
 * - Сортирует заявки по дате открытия (новые сверху)
 * - Ограничивает количество отображаемых заявок через пагинацию
 * - При клике на "Годовая таблица" переходит к годовой таблице
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Card, Button, TextField, Select } from '@radix-ui/themes'
import { ListBulletIcon, CalendarIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useState } from 'react'
import Link from 'next/link'
import styles from './hiring-plan.module.css'

/**
 * LIMIT_OPTIONS - опции лимита записей на странице для пагинации
 * 
 * Используется для:
 * - Выбора количества отображаемых заявок на странице
 * - Настройки пагинации
 */
const LIMIT_OPTIONS = [5, 10, 15, 25, 50, 100] as const

/**
 * MOCK_REQUESTS - моковые данные заявок на найм
 * 
 * Структура заявки:
 * - id: уникальный идентификатор заявки
 * - vacancy: название вакансии
 * - grade, grade_short: грейд (полный и сокращенный)
 * - project: проект (может быть null)
 * - priority: приоритет (1 - высокий, 2 - средний, 3 - низкий)
 * - status: статус ('planned', 'in_progress', 'closed', 'cancelled')
 * - opening_date, deadline, closed_date: даты открытия, дедлайна, закрытия
 * - days_in_progress: количество дней в работе
 * - sla_to_offer: SLA по времени до оффера (в днях)
 * - sla_status_display: статус SLA ('В срок', 'Просрочено', 'Риск просрочки', 'Нормально', 'Нет SLA')
 * - time2hire: время до найма в днях (может быть null)
 * - recruiters: массив рекрутеров с количеством дней работы каждого
 * - candidate_name, candidate_id: информация о найденном кандидате (может быть null)
 * - is_overdue: флаг просрочки заявки
 * 
 * TODO: Заменить на реальные данные из API
 */
const MOCK_REQUESTS = [
  { id: 1, vacancy: 'Frontend Engineer (React)', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 2, status: 'in_progress', opening_date: '2025-12-17', deadline: '2026-01-21', closed_date: null, days_in_progress: 26, sla_to_offer: 35, sla_status_display: 'Нормально', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 22 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 2, vacancy: 'DevOps Engineer', grade: 'Middle+', grade_short: 'M+', project: null, priority: 2, status: 'closed', opening_date: '2025-12-11', deadline: '2026-01-20', closed_date: '2026-01-06', days_in_progress: 26, sla_to_offer: 40, sla_status_display: 'В срок', time2hire: 67, recruiters: [{ name: 'Голубенко А.', days: 15 }, { name: 'Черномордин А.', days: 6 }, { name: 'Петрова М.', days: 5 }], candidate_name: 'Aleksander Volvachev', candidate_id: '76779160', is_overdue: false },
  { id: 3, vacancy: 'Backend Engineer', grade: 'Middle', grade_short: 'M', project: null, priority: 3, status: 'planned', opening_date: '2025-12-01', deadline: '2026-01-15', closed_date: null, days_in_progress: 0, sla_to_offer: 35, sla_status_display: 'Нет SLA', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 0 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 4, vacancy: 'Support Engineer', grade: 'Junior+', grade_short: 'J+', project: null, priority: 3, status: 'in_progress', opening_date: '2025-12-15', deadline: '2026-01-14', closed_date: null, days_in_progress: 28, sla_to_offer: 30, sla_status_display: 'Риск просрочки', time2hire: null, recruiters: [{ name: 'Черномордин А.', days: 21 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 5, vacancy: 'QA Engineer', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 3, status: 'cancelled', opening_date: '2025-12-05', deadline: '2026-01-18', closed_date: '2026-01-10', days_in_progress: 22, sla_to_offer: 35, sla_status_display: 'Просрочено', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 18 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 6, vacancy: 'Data Engineer', grade: 'Senior', grade_short: 'S', project: 'Analytics', priority: 1, status: 'closed', opening_date: '2025-11-20', deadline: '2025-12-20', closed_date: '2025-12-15', days_in_progress: 25, sla_to_offer: 30, sla_status_display: 'В срок', time2hire: 25, recruiters: [{ name: 'Черномордин А.', days: 25 }], candidate_name: 'Иванов И.', candidate_id: '80001', is_overdue: false },
  { id: 7, vacancy: 'ML Engineer', grade: 'Middle+', grade_short: 'M+', project: 'Analytics', priority: 2, status: 'in_progress', opening_date: '2025-12-20', deadline: '2026-02-01', closed_date: null, days_in_progress: 36, sla_to_offer: 45, sla_status_display: 'Нормально', time2hire: null, recruiters: [{ name: 'Петрова М.', days: 28 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 8, vacancy: 'Product Manager', grade: 'Middle', grade_short: 'M', project: 'PUI Skins', priority: 2, status: 'closed', opening_date: '2025-11-10', deadline: '2025-12-15', closed_date: '2025-12-01', days_in_progress: 21, sla_to_offer: 35, sla_status_display: 'В срок', time2hire: 21, recruiters: [{ name: 'Петрова М.', days: 21 }], candidate_name: 'Сидорова О.', candidate_id: '80002', is_overdue: false },
  { id: 9, vacancy: 'Designer', grade: 'Junior', grade_short: 'J', project: null, priority: 3, status: 'cancelled', opening_date: '2025-12-01', deadline: '2026-01-10', closed_date: '2025-12-28', days_in_progress: 20, sla_to_offer: 40, sla_status_display: 'В срок', time2hire: null, recruiters: [{ name: 'Черномордин А.', days: 20 }], candidate_name: null, candidate_id: null, is_overdue: false },
  { id: 10, vacancy: 'Security Engineer', grade: 'Senior', grade_short: 'S', project: 'Analytics', priority: 1, status: 'in_progress', opening_date: '2025-12-22', deadline: '2026-02-15', closed_date: null, days_in_progress: 34, sla_to_offer: 50, sla_status_display: 'Нормально', time2hire: null, recruiters: [{ name: 'Голубенко А.', days: 24 }], candidate_name: null, candidate_id: null, is_overdue: false },
]

/**
 * STATUS_OPTIONS - опции статусов заявок для фильтрации
 * 
 * Используется для:
 * - Выбора статуса при фильтрации заявок
 * - Отображения текущего фильтра
 */
const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'planned', label: 'Планируется' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'closed', label: 'Закрыта' },
  { value: 'cancelled', label: 'Отменена' },
]

/**
 * fmt - форматирование даты из формата YYYY-MM-DD в DD.MM.YYYY
 * 
 * Функциональность:
 * - Преобразует дату из ISO формата (YYYY-MM-DD) в читаемый формат (DD.MM.YYYY)
 * - Возвращает '—' если дата отсутствует (null или пустая строка)
 * 
   * Алгоритм:
 * 1. Проверяет наличие даты
 * 2. Разбивает строку по разделителю '-'
 * 3. Переставляет части: год, месяц, день → день, месяц, год
 * 4. Объединяет через точку
 * 
 * Используется для:
 * - Отображения дат в таблице заявок
 * - Форматирования дат открытия, дедлайна, закрытия
 * 
 * Примеры:
 * - "2025-12-17" → "17.12.2025"
 * - null → "—"
 * 
 * @param d - дата в формате YYYY-MM-DD или null
 * @returns отформатированная дата в формате DD.MM.YYYY или '—'
 */
function fmt(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

/**
 * statusBadge - получение CSS класса для бейджа статуса заявки
 * 
 * Функциональность:
 * - Возвращает CSS класс для стилизации бейджа статуса заявки
 * - Используется для цветовой индикации статуса
 * 
 * Маппинг статусов на CSS классы:
 * - 'planned': styles.badgePlanned (планируется)
 * - 'in_progress': styles.badgeProgress (в процессе)
 * - 'closed': styles.badgeClosed (закрыта)
 * - 'cancelled': styles.badgeCancelled (отменена)
 * - другие: styles.badgePlanned (по умолчанию)
 * 
 * Используется для:
 * - Цветовой индикации статуса заявки в таблице
 * - Визуального различия статусов
 * 
 * @param s - статус заявки ('planned', 'in_progress', 'closed', 'cancelled')
 * @returns CSS класс для бейджа статуса
 */
function statusBadge(s: string) {
  const map: Record<string, string> = { planned: styles.badgePlanned, in_progress: styles.badgeProgress, closed: styles.badgeClosed, cancelled: styles.badgeCancelled }
  return map[s] || styles.badgePlanned
}

/**
 * slaBadge - получение CSS класса для бейджа статуса SLA
 * 
 * Функциональность:
 * - Возвращает CSS класс для стилизации бейджа статуса SLA
 * - Используется для цветовой индикации выполнения SLA
 * 
 * Маппинг статусов SLA на CSS классы:
 * - 'В срок': styles.badgeSlaOk (зеленый)
 * - 'Просрочено': styles.badgeSlaOver (красный)
 * - 'Риск просрочки': styles.badgeSlaRisk (желтый/оранжевый)
 * - другие: styles.badgeSlaNormal (серый, нормально)
 * 
 * Используется для:
 * - Цветовой индикации статуса SLA в таблице
 * - Визуального различия выполнения SLA (в срок, просрочено, риск)
 * 
 * @param s - статус SLA ('В срок', 'Просрочено', 'Риск просрочки', 'Нормально', 'Нет SLA')
 * @returns CSS класс для бейджа статуса SLA
 */
function slaBadge(s: string) {
  if (s === 'В срок') return styles.badgeSlaOk
  if (s === 'Просрочено') return styles.badgeSlaOver
  if (s === 'Риск просрочки') return styles.badgeSlaRisk
  return styles.badgeSlaNormal
}

/**
 * HiringPlanPage - компонент страницы плана найма
 * 
 * Состояние:
 * - search: поисковый запрос
 * - status: выбранный статус для фильтрации
 * - period: выбранный период для фильтрации (YYYY-MM)
 * - vacancy: выбранная вакансия для фильтрации
 * - recruiter: выбранный рекрутер для фильтрации
 * - tableLimit: лимит записей на странице для пагинации
 */
export default function HiringPlanPage() {
  // Поисковый запрос для фильтрации заявок
  const [search, setSearch] = useState('')
  // Выбранный статус для фильтрации (пустая строка - все статусы)
  const [status, setStatus] = useState('')
  // Выбранный период для фильтрации в формате YYYY-MM (пустая строка - все периоды)
  const [period, setPeriod] = useState('')
  // Выбранная вакансия для фильтрации (пустая строка - все вакансии)
  const [vacancy, setVacancy] = useState('')
  // Выбранный рекрутер для фильтрации (пустая строка - все рекрутеры)
  const [recruiter, setRecruiter] = useState('')
  // Лимит записей на странице для пагинации (по умолчанию 10)
  const [tableLimit, setTableLimit] = useState<number>(10)

  /**
   * filtered - отфильтрованный список заявок на найм
   * 
   * Логика фильтрации:
   * 1. Поиск: проверяет наличие запроса в названии вакансии, имени кандидата или проекте (без учета регистра)
   * 2. Фильтр по вакансии: если выбрана вакансия - проверяет точное совпадение
   * 3. Фильтр по статусу: если выбран статус - проверяет совпадение
   * 4. Фильтр по периоду: если выбран период (YYYY-MM) - проверяет совпадение месяца открытия
   * 5. Фильтр по рекрутеру: если выбран рекрутер - проверяет наличие в массиве recruiters
   * 
   * Поведение:
   * - Все условия должны выполняться одновременно (логическое И)
   * - Поиск выполняется без учета регистра
   * - Результат используется для сортировки и отображения
   */
  const filtered = MOCK_REQUESTS.filter((r) => {
    const q = search.toLowerCase()
    // Поиск: проверяет вакансию, имя кандидата или проект (без учета регистра)
    if (search && !(r.vacancy.toLowerCase().includes(q) || (r.candidate_name || '').toLowerCase().includes(q) || (r.project || '').toLowerCase().includes(q))) return false
    // Фильтр по вакансии: проверяет точное совпадение
    if (vacancy && r.vacancy !== vacancy) return false
    // Фильтр по статусу: проверяет совпадение статуса
    if (status && r.status !== status) return false
    // Фильтр по периоду: проверяет совпадение месяца открытия (YYYY-MM)
    if (period) {
      const [y, m] = period.split('-')
      const [ry, rm] = (r.opening_date || '').split('-')
      if (ry !== y || rm !== m) return false
    }
    // Фильтр по рекрутеру: проверяет наличие рекрутера в массиве
    if (recruiter && !(r.recruiters || []).some((re) => re.name === recruiter)) return false
    return true
  })

  /**
   * sorted - отсортированный список заявок
   * 
   * Логика сортировки:
   * - Сортирует по дате открытия (opening_date) в порядке убывания (новые сверху)
   * - Использует localeCompare для сравнения дат в формате YYYY-MM-DD
   * 
   * Используется для:
   * - Отображения заявок в хронологическом порядке (новые первыми)
   */
  const sorted = [...filtered].sort((a, b) => (b.opening_date || '').localeCompare(a.opening_date || ''))
  
  /**
   * tableRows - список заявок для отображения в таблице (с учетом пагинации)
   * 
   * Функциональность:
   * - Ограничивает количество отображаемых заявок через tableLimit
   * - Используется для пагинации таблицы
   * 
   * Поведение:
   * - Берет первые tableLimit заявок из отсортированного списка
   * - При изменении tableLimit обновляется количество отображаемых заявок
   */
  const tableRows = sorted.slice(0, tableLimit)

  /**
   * Статистика по заявкам
   * 
   * Вычисляемые значения:
   * - total_requests: общее количество отфильтрованных заявок
   * - planned_requests: количество запланированных заявок
   * - in_progress_requests: количество заявок в процессе
   * - closed_requests: количество закрытых заявок
   * - cancelled_requests: количество отмененных заявок
   * 
   * Используется для:
   * - Отображения статистики в карточках метрик
   */
  const s = {
    total_requests: filtered.length,
    planned_requests: filtered.filter((r) => r.status === 'planned').length,
    in_progress_requests: filtered.filter((r) => r.status === 'in_progress').length,
    closed_requests: filtered.filter((r) => r.status === 'closed').length,
    cancelled_requests: filtered.filter((r) => r.status === 'cancelled').length,
  }
  
  /**
   * fulfillment - процент выполнения заявок (закрытые из общего числа)
   * 
   * Формула:
   * - (closed_requests / total_requests) * 100
   * - Округляется до целого числа
   * 
   * Используется для:
   * - Отображения метрики "Выполнение" в процентах
   */
  const fulfillment = s.total_requests > 0 ? Math.round((s.closed_requests / s.total_requests) * 100) : 0

  /**
   * Метрики SLA
   * 
   * Вычисляемые значения:
   * - withSla: заявки со SLA (исключая запланированные и без SLA)
   * - avgSlaPlan: среднее значение SLA плана (в днях) для заявок со SLA
   * - closedWithSla: закрытые заявки
   * - avgSlaFact: среднее фактическое время выполнения (в днях) для закрытых заявок
   * 
   * Используется для:
   * - Отображения метрик SLA в карточках
   */
  const withSla = filtered.filter((r) => r.status !== 'planned' && r.sla_status_display !== 'Нет SLA')
  const avgSlaPlan = withSla.length > 0 ? Math.round(withSla.reduce((acc, r) => acc + (r.sla_to_offer || 0), 0) / withSla.length) : null
  const closedWithSla = filtered.filter((r) => r.status === 'closed')
  const avgSlaFact = closedWithSla.length > 0 ? Math.round(closedWithSla.reduce((acc, r) => acc + (r.days_in_progress || 0), 0) / closedWithSla.length) : null

  /**
   * Метрики Time-to-Hire (T2H)
   * 
   * Вычисляемые значения:
   * - closedWithT2H: закрытые заявки с указанным временем до найма
   * - avgT2H: среднее время до найма (в днях) для закрытых заявок
   * 
   * Используется для:
   * - Отображения метрики "Средний T2H" в карточке
   */
  const closedWithT2H = filtered.filter((r) => r.status === 'closed' && r.time2hire != null)
  const avgT2H = closedWithT2H.length > 0 ? Math.round(closedWithT2H.reduce((acc, r) => acc + (r.time2hire || 0), 0) / closedWithT2H.length) : null

  /**
   * vacancies - массив уникальных названий вакансий
   * 
   * Функциональность:
   * - Извлекает все уникальные названия вакансий из MOCK_REQUESTS
   * - Используется для фильтрации по вакансиям
   * 
   * Используется для:
   * - Заполнения выпадающего списка фильтра по вакансиям
   */
  const vacancies = [...new Set(MOCK_REQUESTS.map((r) => r.vacancy).filter(Boolean))] as string[]
  
  /**
   * recruiters - массив уникальных имен рекрутеров
   * 
   * Функциональность:
   * - Извлекает все уникальные имена рекрутеров из всех заявок
   * - Использует flatMap для обработки массивов рекрутеров в каждой заявке
   * - Используется для фильтрации по рекрутерам
   * 
   * Используется для:
   * - Заполнения выпадающего списка фильтра по рекрутерам
   */
  const recruiters = [...new Set(MOCK_REQUESTS.flatMap((r) => (r.recruiters || []).map((re) => re.name)).filter(Boolean))] as string[]

  return (
    <AppLayout pageTitle="План найма">
      <Box className={styles.container}>
        <Flex justify="between" align="center" mb="4" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            <ListBulletIcon width={24} height={24} />
            <Text size="6" weight="bold">Заявки на найм</Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            <Link href="/reporting/hiring-plan/yearly">
              <Button size="2" variant="soft" color="green">
                <CalendarIcon width={16} height={16} />
                Годовая таблица
              </Button>
            </Link>
          </Flex>
        </Flex>

        {/* Статистика */}
        <Flex gap="3" mb="4" wrap="wrap">
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <Text className={styles.statNumber}>{s.total_requests}</Text>
            <Text className={styles.statLabel}>Всего заявок</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
            <Text className={styles.statNumber}>{s.planned_requests}</Text>
            <Text className={styles.statLabel}>Планируется</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Text className={styles.statNumber}>{s.in_progress_requests}</Text>
            <Text className={styles.statLabel}>В процессе</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
            <Text className={styles.statNumber}>{s.closed_requests}</Text>
            <Text className={styles.statLabel}>Закрыто</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}>
            <Text className={styles.statNumber}>{s.cancelled_requests}</Text>
            <Text className={styles.statLabel}>Отменено</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <Text className={styles.statNumber}>{fulfillment}%</Text>
            <Text className={styles.statLabel}>Выполнение</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
            <Text className={styles.statNumber}>{avgSlaPlan != null ? `${avgSlaPlan} дн.` : '—'}</Text>
            <Text className={styles.statLabel}>Среднее SLA (план)</Text>
            <Text size="1" style={{ opacity: 0.9, marginTop: 2 }}>Факт: {avgSlaFact != null ? `${avgSlaFact} дн.` : '—'}</Text>
          </Card>
          <Card className={styles.statCard} style={{ flex: 1, minWidth: 140, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
            <Text className={styles.statNumber}>{avgT2H != null ? `${avgT2H} дн.` : '—'}</Text>
            <Text className={styles.statLabel}>Средний T2H (факт)</Text>
          </Card>
        </Flex>

        {/* Фильтры */}
        <Card mb="4" style={{ padding: 16 }}>
          <Text size="2" weight="medium" mb="3" style={{ display: 'block' }}>Фильтры</Text>
          <Flex className={styles.filterRow} gap="2" wrap="nowrap" align="end">
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Поиск</Text>
              <TextField.Root size="2" placeholder="Вакансия, кандидат, проект…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Вакансия</Text>
              <Select.Root value={vacancy || '__all__'} onValueChange={(v) => setVacancy(v === '__all__' ? '' : v)}>
                <Select.Trigger style={{ minWidth: 150 }} />
                <Select.Content>
                  <Select.Item value="__all__">Все вакансии</Select.Item>
                  {vacancies.map((v) => <Select.Item key={v} value={v}>{v}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Рекрутер</Text>
              <Select.Root value={recruiter || '__all__'} onValueChange={(v) => setRecruiter(v === '__all__' ? '' : v)}>
                <Select.Trigger style={{ minWidth: 140 }} />
                <Select.Content>
                  <Select.Item value="__all__">Все рекрутеры</Select.Item>
                  {recruiters.map((r) => <Select.Item key={r} value={r}>{r}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={styles.filterField}>
              <Text size="1" color="gray" mb="1" as="div">Статус</Text>
              <Select.Root value={status || '__all__'} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
                <Select.Trigger style={{ minWidth: 140 }} />
                <Select.Content>
                  {STATUS_OPTIONS.map((o) => <Select.Item key={o.value || 'all'} value={o.value || '__all__'}>{o.label}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box className={`${styles.filterField} ${styles.filterFieldPeriod}`}>
              <Text size="1" color="gray" mb="1" as="div">Период</Text>
              <TextField.Root size="2" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </Box>
            <Button size="2" variant="soft" title="Сбросить" className={styles.resetBtn} onClick={() => { setSearch(''); setStatus(''); setPeriod(''); setVacancy(''); setRecruiter(''); setTableLimit(10); }}>
              <Cross2Icon width={16} height={16} className={styles.resetBtnIcon} />
              <span className={styles.resetBtnText}>Сбросить</span>
            </Button>
          </Flex>
        </Card>

        {/* Таблица */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <Flex justify="between" align="center" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
            <Text size="2" color="gray">Показано: последние {tableRows.length} из {filtered.length} заявок</Text>
            <Flex align="center" gap="2">
              <Text size="2" color="gray">Показать:</Text>
              <Select.Root value={String(tableLimit)} onValueChange={(v) => setTableLimit(Number(v))}>
                <Select.Trigger style={{ minWidth: 90 }} />
                <Select.Content>
                  {LIMIT_OPTIONS.map((n) => <Select.Item key={n} value={String(n)}>{n} заявок</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          <Box className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Вакансия / Грейд</th>
                  <th>Проект</th>
                  <th>Рекрутер</th>
                  <th>Статус</th>
                  <th>Сроки</th>
                  <th>Факт / SLA</th>
                  <th>T2H | SLA</th>
                  <th>Кандидат</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-11)' }}>Заявки не найдены</td></tr>
                ) : (
                  tableRows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className={styles.vacancyCell}>
                          <span className={`${styles.badge} ${styles.badgeSlaNormal}`}>{r.grade_short}</span>
                          {' '}
                          <a href={`https://app.huntflow.ru/vacancy/${r.id}`} target="_blank" rel="noopener noreferrer" className={styles.vacancyLink} title={r.vacancy}>{r.vacancy}</a>
                        </span>
                      </td>
                      <td><Text className={styles.projectName} title={r.project || ''}>{r.project || '—'}</Text></td>
                      <td className={styles.recruiterCell}>{r.recruiters?.length ? r.recruiters.map((re, i) => (
                        <span key={i} className={styles.recruiterLine}>{re.name} ({re.days} дн.)</span>
                      )) : '—'}</td>
                      <td className={styles.statusCell}>
                        <span className={`${styles.badge} ${statusBadge(r.status)}`}>
                          {r.status === 'planned' && 'Планируется'}
                          {r.status === 'in_progress' && 'В процессе'}
                          {r.status === 'closed' && (r.closed_date ? `Закрыта ${fmt(r.closed_date)}` : 'Закрыта')}
                          {r.status === 'cancelled' && (r.closed_date ? `Отменена ${fmt(r.closed_date)}` : 'Отменена')}
                        </span>
                      </td>
                      <td>{fmt(r.opening_date)} — {r.deadline ? fmt(r.deadline) : 'нет SLA'}</td>
                      <td className={styles.factSlaCell}>
                        {r.status === 'planned' ? '—' : `${r.days_in_progress} / ${r.sla_to_offer}д`}
                        <br />
                        <span className={`${styles.badge} ${slaBadge(r.sla_status_display)}`}>{r.sla_status_display}</span>
                      </td>
                      <td className={styles.t2hSlaCell}>
                        {r.time2hire != null ? `${r.time2hire} дн.` : (r.status === 'closed' ? '—' : '—')}
                        <br />
                        {r.sla_status_display !== 'Нет SLA' && r.status !== 'planned' && <span className={`${styles.badge} ${slaBadge(r.sla_status_display)}`}>SLA</span>}
                      </td>
                      <td>{r.candidate_name && r.candidate_id ? (
                <a href={`https://app.huntflow.ru/candidate/${r.candidate_id}`} target="_blank" rel="noopener noreferrer" className={styles.candidateLink}><Text weight="medium" as="span">{r.candidate_name}</Text></a>
              ) : r.candidate_name ? <Text weight="medium">{r.candidate_name}</Text> : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Box>
    </AppLayout>
  )
}
