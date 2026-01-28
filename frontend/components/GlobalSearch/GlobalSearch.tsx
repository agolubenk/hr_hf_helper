/**
 * GlobalSearch (components/GlobalSearch/GlobalSearch.tsx) - Компонент глобального поиска
 * 
 * Назначение:
 * - Глобальный поиск по приложению (вакансии, кандидаты, компании)
 * - Автодополнение запросов
 * - Предложения сущностей (вакансии, кандидаты, компании)
 * - Предложения изменения области поиска (scope)
 * - История поиска
 * - Популярные запросы
 * 
 * Функциональность:
 * - Поле ввода с автодополнением
 * - Выпадающий список с предложениями:
 *   - Запросы (query): история, популярные, автодополнение
 *   - Сущности (entity): вакансии, кандидаты, компании
 *   - Области поиска (scope): изменение области поиска
 * - Поддержка горячих клавиш (Cmd+K / Ctrl+K) для фокуса
 * - Выделение совпадающего префикса в предложениях
 * 
 * Связи:
 * - Header: отображается в верхней панели
 * - useRouter: для навигации к результатам поиска (TODO)
 * - useToast: для отображения уведомлений (в разработке)
 * 
 * Поведение:
 * - При вводе текста показывает предложения
 * - При выборе запроса выполняет поиск (TODO)
 * - При выборе сущности переходит к детальной странице (TODO)
 * - При выборе области поиска изменяет область поиска
 * - Минимальная длина запроса для поиска сущностей: 2 символа
 * 
 * TODO: Реализовать реальный поиск через API
 * TODO: Реализовать навигацию к результатам поиска
 */

'use client'

import { Box, TextField } from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  Cross2Icon,
  PersonIcon,
  FileTextIcon,
  HomeIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import styles from './GlobalSearch.module.css'

// --- Типы ---

/**
 * ScopeType - тип области поиска
 * 
 * Варианты:
 * - 'all': поиск во всех данных
 * - 'vacancies': поиск только в вакансиях
 * - 'candidates': поиск только в кандидатах
 * - 'companies': поиск только в компаниях
 */
export type ScopeType = 'all' | 'vacancies' | 'candidates' | 'companies'

/**
 * EntityData - интерфейс данных сущности (вакансия, кандидат, компания)
 * 
 * Структура:
 * - id: уникальный идентификатор сущности
 * - entityType: тип сущности ('vacancy', 'candidate', 'company')
 * - title: заголовок сущности
 * - subtitle: подзаголовок (опционально)
 * - meta: дополнительная информация (опционально)
 */
export interface EntityData {
  id: string
  entityType: 'vacancy' | 'candidate' | 'company'
  title: string
  subtitle?: string
  meta?: string
}

/**
 * SuggestionType - тип предложения в автодополнении
 * 
 * Варианты:
 * - 'query': предложение запроса (из истории, популярных или автодополнения)
 * - 'entity': предложение сущности (вакансия, кандидат, компания)
 * - 'scope': предложение изменения области поиска
 */
export type SuggestionType = 'query' | 'entity' | 'scope'

/**
 * Suggestion - интерфейс предложения в автодополнении
 * 
 * Структура:
 * - type: тип предложения
 * - label: отображаемый текст предложения
 * - query: текст запроса для поиска
 * - scope: область поиска (опционально, только для type === 'scope')
 * - entity: данные сущности (опционально, только для type === 'entity')
 * - matchPrefix: совпадающий префикс для выделения (опционально, только для type === 'query')
 */
export interface Suggestion {
  type: SuggestionType
  label: string
  query: string
  scope?: ScopeType
  entity?: EntityData
  /** для query: совпадающий префикс (выделяем жирным), остальное серым */
  matchPrefix?: string
}

/**
 * SCOPE_LABELS - маппинг типов областей поиска на отображаемые названия
 * 
 * Используется для:
 * - Отображения названий областей поиска в предложениях
 */
const SCOPE_LABELS: Record<ScopeType, string> = {
  all: 'Во всех данных',
  vacancies: 'Вакансии',
  candidates: 'Кандидаты',
  companies: 'Компании',
}

/**
 * SCOPES - массив всех доступных областей поиска
 * 
 * Используется для:
 * - Генерации предложений изменения области поиска
 */
const SCOPES: ScopeType[] = ['vacancies', 'candidates', 'companies', 'all']

// --- Мок-данные ---

/**
 * MOCK_HISTORY - история поисковых запросов
 * 
 * Используется для:
 * - Отображения недавних запросов в предложениях
 * 
 * TODO: Загружать из localStorage или API
 */
const MOCK_HISTORY = [
  'Python разработчик middle',
  'Backend Java',
  'Frontend React',
  'Data engineer',
]

/**
 * MOCK_POPULAR - популярные поисковые запросы
 * 
 * Используется для:
 * - Отображения популярных запросов в предложениях
 * 
 * TODO: Загружать из API или аналитики
 */
const MOCK_POPULAR = [
  'Python backend удалённо',
  'senior python data',
  'React TypeScript',
]

/**
 * MOCK_SUGGESTS - автодополнение запросов по префиксу
 * 
 * Структура:
 * - Ключ: префикс запроса (например, 'py', 'python', 're', 'java')
 * - Значение: массив предложений для этого префикса
 * 
 * Используется для:
 * - Автодополнения при вводе текста
 * 
 * TODO: Загружать из API или генерировать динамически
 */
const MOCK_SUGGESTS: Record<string, string[]> = {
  py: ['Python разработчик', 'Python backend', 'Python data'],
  python: ['Python разработчик middle', 'Python backend удалённо', 'senior python data'],
  re: ['React разработчик', 'React TypeScript', 'Backend Java'],
  java: ['Backend Java', 'Java developer'],
}

/**
 * MOCK_ENTITIES - моковые данные сущностей для поиска
 * 
 * Используется для:
 * - Отображения предложений сущностей в автодополнении
 * 
 * TODO: Загружать из API при вводе текста
 */
const MOCK_ENTITIES: EntityData[] = [
  { id: 'v1', entityType: 'vacancy', title: 'Python Backend Developer', subtitle: 'ACME Corp', meta: 'Минск' },
  { id: 'c1', entityType: 'candidate', title: 'Иван Петров', subtitle: 'Python разработчик', meta: 'Москва' },
  { id: 'co1', entityType: 'company', title: 'ACME Corp', subtitle: '24 вакансии', meta: '' },
  { id: 'v2', entityType: 'vacancy', title: 'Frontend Senior', subtitle: 'Tech Co', meta: 'Минск' },
  { id: 'c2', entityType: 'candidate', title: 'Мария Сидорова', subtitle: 'Frontend', meta: 'Гомель' },
]

/**
 * filterEntities - фильтрация сущностей по поисковому запросу
 * 
 * Функциональность:
 * - Фильтрует сущности по заголовку, подзаголовку и мета-информации
 * - Возвращает ограниченное количество результатов
 * 
 * Используется для:
 * - Поиска сущностей при вводе текста
 * 
 * @param q - поисковый запрос
 * @param limit - максимальное количество результатов
 * @returns массив отфильтрованных сущностей
 */
function filterEntities(q: string, limit: number): EntityData[] {
  if (!q || q.length < 2) return [] // Минимальная длина запроса: 2 символа
  const lower = q.toLowerCase()
  // Фильтруем по заголовку, подзаголовку и мета-информации
  const out = MOCK_ENTITIES.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      (e.subtitle && e.subtitle.toLowerCase().includes(lower)) ||
      (e.meta && e.meta.toLowerCase().includes(lower))
  )
  return out.slice(0, limit) // Ограничиваем количество результатов
}

/**
 * getQueries - получение предложений запросов для автодополнения
 * 
 * Функциональность:
 * - Генерирует предложения запросов на основе введенного текста
 * - Использует автодополнение по префиксу (MOCK_SUGGESTS)
 * - Добавляет популярные запросы, если они содержат введенный текст
 * - Добавляет запросы из истории, если они содержат введенный текст
 * 
 * Логика:
 * - Сначала проверяет автодополнение по префиксу (если введенный текст начинается с ключа)
 * - Затем добавляет популярные запросы, содержащие введенный текст
 * - Затем добавляет запросы из истории, содержащие введенный текст
 * - Удаляет дубликаты
 * - Ограничивает количество результатов
 * 
 * @param value - введенный текст
 * @param limit - максимальное количество предложений
 * @returns массив предложений запросов
 */
function getQueries(value: string, limit: number): Suggestion[] {
  const lower = value.trim().toLowerCase()
  const list: Suggestion[] = []

  // suggest по подстроке
  for (const [key, phrases] of Object.entries(MOCK_SUGGESTS)) {
    if (!lower.startsWith(key)) continue
    for (const p of phrases) {
      const pre = p.substring(0, lower.length)
      const rest = p.substring(lower.length)
      list.push({
        type: 'query',
        label: p,
        query: p,
        matchPrefix: pre,
      })
    }
  }

  // популярные, если матч по слову
  for (const p of MOCK_POPULAR) {
    if (list.length >= limit) break
    if (list.some((s) => s.label === p)) continue
    if (!lower || p.toLowerCase().includes(lower)) {
      const idx = p.toLowerCase().indexOf(lower)
      const pre = idx >= 0 ? p.substring(idx, idx + lower.length) : undefined
      list.push({ type: 'query', label: p, query: p, matchPrefix: pre })
    }
  }

  // история
  for (const p of MOCK_HISTORY) {
    if (list.length >= limit) break
    if (list.some((s) => s.label === p)) continue
    if (!lower || p.toLowerCase().includes(lower)) {
      const idx = p.toLowerCase().indexOf(lower)
      const pre = idx >= 0 ? p.substring(idx, idx + lower.length) : undefined
      list.push({ type: 'query', label: p, query: p, matchPrefix: pre })
    }
  }

  return list.slice(0, limit)
}

/**
 * getScopedSuggestions - получение предложений изменения области поиска
 * 
 * Функциональность:
 * - Генерирует предложения для изменения области поиска
 * - Предлагает все области, кроме текущей
 * 
 * Логика:
 * - Если запрос пустой - не показывает предложения
 * - Пропускает текущую область поиска (не предлагает её)
 * - Генерирует предложения для всех остальных областей
 * 
 * Используется для:
 * - Предложения изменения области поиска в автодополнении
 * 
 * @param query - поисковый запрос
 * @param currentScope - текущая область поиска (опционально)
 * @param limit - максимальное количество предложений
 * @returns массив предложений изменения области поиска
 */
function getScopedSuggestions(query: string, currentScope: ScopeType | null, limit: number): Suggestion[] {
  const q = query.trim()
  if (!q) return [] // «Искать во всех» по пустому не показываем
  const out: Suggestion[] = []
  for (const sc of SCOPES) {
    if (out.length >= limit) break
    // текущий скоуп можно не предлагать (только альтернативные)
    if (sc === currentScope) continue
    // Генерируем текст предложения в зависимости от области
    const label = sc === 'all' ? `Найти «${q}» во всех данных` : `Найти «${q}» среди ${SCOPE_LABELS[sc].toLowerCase()}`
    out.push({ type: 'scope', label, query: q, scope: sc })
  }
  return out
}

// --- Компонент ---

/**
 * GlobalSearchProps - интерфейс пропсов компонента GlobalSearch
 * 
 * Структура:
 * - placeholder: текст плейсхолдера (по умолчанию 'Поиск...')
 * - shortcutHint: подсказка для горячей клавиши (например, '⌘K' или 'Ctrl+K')
 * - dark: темная тема для правого слота (опционально)
 * - onSearch: обработчик выполнения поиска (запрос + область поиска)
 * - onEntityClick: обработчик клика по сущности (вакансия, кандидат, компания)
 */
export interface GlobalSearchProps {
  /** Плейсхолдер */
  placeholder?: string
  /** Подсказка для горячей клавиши, напр. "⌘K" */
  shortcutHint?: string
  /** Тема для правого слота (не передаём — не показываем) */
  dark?: boolean
  /** Выполнить поиск (запрос + опциональный скоуп) */
  onSearch?: (query: string, scope: ScopeType | null) => void
  /** Переход по сущности (вакансия/кандидат/компания) */
  onEntityClick?: (entity: EntityData) => void
}

/**
 * ENTITY_ICONS - маппинг типов сущностей на иконки
 * 
 * Используется для:
 * - Отображения иконок сущностей в предложениях
 */
const ENTITY_ICONS = {
  vacancy: FileTextIcon, // Иконка файла для вакансий
  candidate: PersonIcon, // Иконка человека для кандидатов
  company: HomeIcon, // Иконка дома для компаний
}

/**
 * ENTITY_LIMIT - максимальное количество сущностей в предложениях
 */
const ENTITY_LIMIT = 4

/**
 * QUERY_LIMIT - максимальное количество запросов в предложениях
 */
const QUERY_LIMIT = 5

/**
 * SCOPE_LIMIT - максимальное количество предложений области поиска
 */
const SCOPE_LIMIT = 4

/**
 * GlobalSearch - компонент глобального поиска
 * 
 * Состояние:
 * - value: введенный текст поиска
 * - scope: выбранная область поиска (опционально)
 * - open: флаг открытости выпадающего списка предложений
 * - activeIndex: индекс активного предложения (для навигации клавиатурой)
 * 
 * Функциональность:
 * - Автодополнение запросов
 * - Поиск сущностей (вакансии, кандидаты, компании)
 * - Предложения изменения области поиска
 * - Навигация клавиатурой (стрелки, Enter, Escape)
 * - Выделение совпадающего префикса в предложениях
 */
export default function GlobalSearch({
  placeholder = 'Поиск...',
  shortcutHint,
  dark = false,
  onSearch,
  onEntityClick,
}: GlobalSearchProps) {
  // Введенный текст поиска
  const [value, setValue] = useState('')
  // Выбранная область поиска (null означает "во всех данных")
  const [scope, setScope] = useState<ScopeType | null>(null)
  // Флаг открытости выпадающего списка предложений
  const [open, setOpen] = useState(false)
  // Индекс активного предложения (для навигации клавиатурой)
  const [activeIndex, setActiveIndex] = useState(0)
  // Ref для контейнера поиска (для обработки кликов вне компонента)
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * useMemo - сбор всех подсказок для автодополнения
   * 
   * Функциональность:
   * - Генерирует предложения сущностей, запросов и областей поиска
   * - Объединяет их в плоский список для навигации клавиатурой
   * 
   * Логика:
   * - entities: сущности (только если введен текст, минимум 1 символ)
   * - queries: запросы (из автодополнения, популярных, истории)
   *   - Если пустой ввод и открыт список - показывает историю (первые 5)
   * - scoped: предложения изменения области поиска (только если введен текст)
   * - flat: плоский список всех предложений (entities → queries → scoped)
   * 
   * Порядок в flat:
   * - Сначала сущности (entities)
   * - Затем запросы (queries)
   * - В конце области поиска (scoped)
   * 
   * Используется для:
   * - Отображения предложений в выпадающем списке
   * - Навигации клавиатурой (стрелки, Enter)
   * 
   * Зависимости:
   * - value: пересчитывается при изменении введенного текста
   * - scope: пересчитывается при изменении области поиска
   * - open: пересчитывается при открытии/закрытии списка (для показа истории при пустом вводе)
   */
  const { entities, queries, scoped, flat } = useMemo(() => {
    const q = value.trim()
    const hasInput = q.length >= 1 // Есть ли введенный текст (минимум 1 символ)

    // Предложения сущностей (вакансии, кандидаты, компании)
    // Показываются только если введен текст
    const entities: Suggestion[] = hasInput
      ? filterEntities(q, ENTITY_LIMIT).map((e) => ({
          type: 'entity' as const,
          label: e.title,
          query: q,
          entity: e,
        }))
      : []

    // Предложения запросов (автодополнение, популярные, история)
    const queries: Suggestion[] = hasInput ? getQueries(q, QUERY_LIMIT) : []
    // По фокусу с пустым: только история (без «во всех»). Упростим: при пустом queries = MOCK_HISTORY.slice(0,5)
    if (!hasInput && open) {
      // Если ввода нет, но список открыт - показываем историю
      MOCK_HISTORY.slice(0, 5).forEach((p) => {
        queries.push({ type: 'query', label: p, query: p })
      })
    }

    // Предложения изменения области поиска
    // Показываются только если введен текст
    const scoped: Suggestion[] = hasInput ? getScopedSuggestions(q, scope, SCOPE_LIMIT) : []

    // Плоский список по порядку: entities → queries → scoped (для стрелок и Enter)
    // Используется для навигации клавиатурой и определения активного элемента
    const flat: Suggestion[] = [...entities, ...queries, ...scoped]

    return { entities, queries, scoped, flat }
  }, [value, scope, open])

  /**
   * showDropdown - флаг отображения выпадающего списка предложений
   * 
   * Логика:
   * - Показывается если список открыт (open === true) И (есть предложения ИЛИ введен текст)
   * 
   * Используется для:
   * - Условного рендеринга выпадающего списка
   */
  const showDropdown = open && (flat.length > 0 || value.length >= 1)

  /**
   * useEffect - обработка кликов вне компонента
   * 
   * Функциональность:
   * - Закрывает выпадающий список при клике вне компонента
   * 
   * Поведение:
   * - Выполняется только если список открыт (open === true)
   * - Проверяет, был ли клик вне контейнера поиска
   * - Если да - закрывает список
   * 
   * Причина:
   * - Улучшает UX: список закрывается при клике вне компонента
   */
  useEffect(() => {
    if (!open) return // Не обрабатываем, если список закрыт
    const onDoc = (e: MouseEvent) => {
      // Проверяем, был ли клик вне контейнера поиска
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false) // Закрываем список
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc) // Cleanup
  }, [open])

  /**
   * handleKeyDown - обработчик нажатий клавиш
   * 
   * Функциональность:
   * - Обрабатывает навигацию по предложениям (стрелки вверх/вниз)
   * - Обрабатывает выбор предложения (Enter)
   * - Обрабатывает закрытие списка (Escape)
   * 
   * Клавиши:
   * - Escape: закрывает список предложений
   * - Enter: выбирает активное предложение или выполняет поиск
   * - ArrowDown: переходит к следующему предложению
   * - ArrowUp: переходит к предыдущему предложению
   * 
   * Поведение:
   * - При Enter с активным предложением: выбирает его (сущность, запрос или область)
   * - При Enter без активного предложения: выполняет поиск с текущим текстом и областью
   * - При ArrowDown/ArrowUp: циклически переключает активное предложение
   * 
   * useCallback:
   * - Мемоизирует функцию для оптимизации производительности
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false) // Закрываем список
        return
      }
      if (e.key === 'Enter') {
        // Если есть активное предложение - выбираем его
        if (showDropdown && flat.length > 0 && activeIndex >= 0 && activeIndex < flat.length) {
          e.preventDefault() // Предотвращаем стандартное поведение (отправка формы)
          const s = flat[activeIndex] // Получаем активное предложение
          if (s.type === 'entity' && s.entity) {
            // Если это сущность - переходим к ней
            onEntityClick?.(s.entity)
            setOpen(false)
            // текст в инпуте не меняем
          } else if (s.type === 'scope' && s.scope) {
            // Если это область поиска - устанавливаем область и выполняем поиск
            setScope(s.scope)
            onSearch?.(s.query, s.scope)
            setOpen(false)
          } else {
            // Если это запрос - устанавливаем текст и выполняем поиск
            setValue(s.query)
            onSearch?.(s.query, scope)
            setOpen(false)
          }
          return
        }
        // Нет активного — обычный поиск «во всех»
        onSearch?.(value, scope)
        setOpen(false)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault() // Предотвращаем прокрутку страницы
        if (flat.length === 0) return
        // Переходим к следующему предложению (циклически)
        setActiveIndex((i) => (i + 1) % flat.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault() // Предотвращаем прокрутку страницы
        if (flat.length === 0) return
        // Переходим к предыдущему предложению (циклически)
        setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
        return
      }
    },
    [showDropdown, flat, activeIndex, value, scope, onSearch, onEntityClick]
  )

  /**
   * useEffect - сброс активного индекса при изменении списка предложений
   * 
   * Функциональность:
   * - Сбрасывает activeIndex в 0 при изменении количества предложений
   * 
   * Поведение:
   * - Выполняется при изменении flat.length
   * - Обеспечивает корректную навигацию при обновлении предложений
   */
  useEffect(() => {
    setActiveIndex(0) // Сбрасываем на первое предложение
  }, [flat.length])

  /**
   * useEffect - прокрутка активного элемента в видимую область
   * 
   * Функциональность:
   * - Прокручивает активное предложение в видимую область при навигации клавиатурой
   * 
   * Поведение:
   * - Выполняется при изменении activeIndex, showDropdown или flat.length
   * - Находит элемент с data-active="true" и прокручивает его в видимую область
   * - Использует smooth прокрутку для плавной анимации
   */
  useEffect(() => {
    if (!showDropdown || flat.length === 0) return
    // Находим активный элемент по атрибуту data-active
    const el = containerRef.current?.querySelector('[role="option"][data-active="true"]')
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, showDropdown, flat.length])

  /**
   * selectItem - выбор предложения из списка
   * 
   * Функциональность:
   * - Обрабатывает выбор предложения (клик или Enter)
   * - Выполняет соответствующее действие в зависимости от типа предложения
   * 
   * Поведение:
   * - Для сущности: вызывает onEntityClick и закрывает список
   * - Для области поиска: устанавливает область, выполняет поиск и закрывает список
   * - Для запроса: устанавливает текст запроса, выполняет поиск и закрывает список
   * 
   * @param s - выбранное предложение
   * @param index - индекс предложения в плоском списке
   * 
   * useCallback:
   * - Мемоизирует функцию для оптимизации производительности
   */
  const selectItem = useCallback(
    (s: Suggestion, index: number) => {
      setActiveIndex(index) // Устанавливаем активный индекс
      if (s.type === 'entity' && s.entity) {
        // Если это сущность - переходим к ней
        onEntityClick?.(s.entity)
        setOpen(false)
      } else if (s.type === 'scope' && s.scope) {
        // Если это область поиска - устанавливаем область и выполняем поиск
        setScope(s.scope)
        onSearch?.(s.query, s.scope)
        setOpen(false)
      } else {
        // Если это запрос - устанавливаем текст и выполняем поиск
        setValue(s.query)
        onSearch?.(s.query, scope)
        setOpen(false)
      }
    },
    [onSearch, onEntityClick, scope]
  )

  /**
   * handleFocus - обработчик фокуса на поле ввода
   * 
   * Функциональность:
   * - Открывает выпадающий список предложений
   * 
   * Поведение:
   * - Вызывается при фокусе на поле ввода
   * - Показывает список предложений (историю, если ввод пустой)
   */
  const handleFocus = () => setOpen(true)

  /**
   * handleChange - обработчик изменения текста в поле ввода
   * 
   * Функциональность:
   * - Обновляет значение поля ввода
   * - Открывает выпадающий список предложений
   * 
   * Поведение:
   * - Вызывается при вводе текста
   * - Обновляет value и открывает список для показа предложений
   * 
   * @param v - новое значение поля ввода
   */
  const handleChange = (v: string) => {
    setValue(v) // Обновляем значение
    setOpen(true) // Открываем список предложений
  }

  /**
   * clearScope - сброс выбранной области поиска
   * 
   * Функциональность:
   * - Сбрасывает область поиска в null (поиск "во всех данных")
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления области поиска
   */
  const clearScope = () => setScope(null)

  /**
   * scopeChipLabel - текст для отображения выбранной области поиска
   * 
   * Используется для:
   * - Отображения выбранной области в правом слоте поля ввода
   * - null если область не выбрана (поиск "во всех данных")
   */
  const scopeChipLabel = scope ? SCOPE_LABELS[scope] : null

  /**
   * Рендер компонента GlobalSearch
   * 
   * Структура:
   * - TextField с иконкой поиска, областью поиска (если выбрана) и подсказкой горячей клавиши
   * - Выпадающий список с предложениями (сущности, запросы, области поиска)
   */
  return (
    <Box ref={containerRef} className={styles.wrapper}>
      {/* Поле ввода поиска
          - value: введенный текст
          - onFocus: открывает список предложений
          - onChange: обновляет текст и открывает список
          - onKeyDown: обрабатывает навигацию клавиатурой
          - placeholder: текст плейсхолдера */}
      <TextField.Root
        value={value}
        onFocus={handleFocus} // При фокусе открываем список
        onChange={(e) => handleChange(e.target.value)} // При изменении текста обновляем значение и открываем список
        onKeyDown={handleKeyDown} // Обработка навигации клавиатурой
        placeholder={placeholder}
        size="2"
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* Левая иконка поиска */}
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} />
        </TextField.Slot>
        {/* Правый слот: область поиска (если выбрана) и подсказка горячей клавиши */}
        {(scopeChipLabel || shortcutHint) && (
          <TextField.Slot side="right" style={{ paddingRight: 8, gap: 6 }}>
            {/* Чип выбранной области поиска
                - Показывается только если область выбрана (scopeChipLabel !== null)
                - Содержит иконку, название области и кнопку удаления */}
            {scopeChipLabel && (
              <span className={styles.scopeChip}>
                <MixerHorizontalIcon width={12} height={12} />
                {scopeChipLabel}
                {/* Кнопка удаления области поиска
                    - onClick: сбрасывает область поиска
                    - onMouseDown: предотвращает потерю фокуса при клике */}
                <span className={styles.scopeChipRemove} onClick={clearScope} onMouseDown={(e) => e.preventDefault()} aria-label="Сбросить область">
                  <Cross2Icon width={12} height={12} />
                </span>
              </span>
            )}
            {/* Подсказка горячей клавиши (⌘K или Ctrl+K)
                - Показывается только если передан shortcutHint
                - Адаптивный фон в зависимости от темы */}
            {shortcutHint && (
              <span
                className={styles.shortcutSlot}
                style={{
                  backgroundColor: dark ? 'var(--gray-4)' : 'var(--gray-3)',
                  borderColor: 'var(--gray-a6)',
                }}
                title={`Нажмите ${shortcutHint} для поиска`}
              >
                {shortcutHint}
              </span>
            )}
          </TextField.Slot>
        )}
      </TextField.Root>

      {/* Выпадающий список предложений
          - Показывается только если showDropdown === true
          - role="listbox" для доступности */}
      {showDropdown && (
        <div className={styles.dropdown} role="listbox">
          {/* Секция сущностей (вакансии, кандидаты, компании)
              - Показывается только если есть предложения сущностей
              - Каждая сущность имеет иконку, заголовок, подзаголовок и мета-информацию */}
          {entities.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Сущности</div>
              {entities.map((s, i) => {
                const e = s.entity!
                const Icon = ENTITY_ICONS[e.entityType] // Иконка в зависимости от типа сущности
                const idx = flat.indexOf(s) // Индекс в плоском списке для навигации
                return (
                  <button
                    key={`entity-${e.id}`}
                    type="button"
                    className={styles.item}
                    role="option"
                    aria-selected={activeIndex === idx} // Для доступности
                    data-active={activeIndex === idx} // Для стилизации и прокрутки
                    onMouseEnter={() => setActiveIndex(idx)} // При наведении устанавливаем активный индекс
                    onClick={() => selectItem(s, idx)} // При клике выбираем предложение
                  >
                    <span className={styles.entityIcon}>
                      <Icon width={14} height={14} />
                    </span>
                    <div className={styles.entityContent}>
                      <div className={styles.entityTitle}>{e.title}</div>
                      {/* Подзаголовок и мета-информация (если есть) */}
                      {(e.subtitle || e.meta) && (
                        <div className={styles.entityMeta}>
                          {[e.subtitle, e.meta].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {/* Секция запросов (автодополнение, популярные, история)
              - Показывается только если есть предложения запросов
              - Выделяет совпадающий префикс жирным, остальное серым */}
          {queries.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Запросы</div>
              {queries.map((s, i) => {
                const idx = flat.indexOf(s) // Индекс в плоском списке
                const pre = s.matchPrefix ?? '' // Совпадающий префикс (для выделения)
                const rest = pre ? s.label.slice(pre.length) : s.label // Остальная часть
                return (
                  <button
                    key={`query-${i}-${s.label}`}
                    type="button"
                    className={styles.item}
                    role="option"
                    aria-selected={activeIndex === idx}
                    data-active={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectItem(s, idx)}
                  >
                    {/* Выделяем совпадающий префикс жирным, остальное серым */}
                    {pre ? (
                      <>
                        <span className={styles.queryMatch}>{pre}</span>
                        <span className={styles.queryRest}>{rest}</span>
                      </>
                    ) : (
                      s.label
                    )}
                  </button>
                )
              })}
            </div>
          )}
          {/* Секция предложений изменения области поиска
              - Показывается только если есть предложения
              - Каждое предложение содержит иконку, бейдж "Скоуп" и текст предложения */}
          {scoped.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Искать в области…</div>
              {scoped.map((s, i) => {
                const idx = flat.indexOf(s) // Индекс в плоском списке
                return (
                  <button
                    key={`scope-${s.scope}-${i}`}
                    type="button"
                    className={`${styles.item} ${styles.itemScope}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    data-active={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectItem(s, idx)}
                  >
                    <MixerHorizontalIcon width={16} height={16} className={styles.scopeIcon} />
                    <span className={styles.scopeBadge}>Скоуп</span>
                    <span className={styles.scopeLabel}>{s.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Box>
  )
}
