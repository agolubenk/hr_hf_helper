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

export type ScopeType = 'all' | 'vacancies' | 'candidates' | 'companies'

export interface EntityData {
  id: string
  entityType: 'vacancy' | 'candidate' | 'company'
  title: string
  subtitle?: string
  meta?: string
}

export type SuggestionType = 'query' | 'entity' | 'scope'

export interface Suggestion {
  type: SuggestionType
  label: string
  query: string
  scope?: ScopeType
  entity?: EntityData
  /** для query: совпадающий префикс (выделяем жирным), остальное серым */
  matchPrefix?: string
}

const SCOPE_LABELS: Record<ScopeType, string> = {
  all: 'Во всех данных',
  vacancies: 'Вакансии',
  candidates: 'Кандидаты',
  companies: 'Компании',
}

const SCOPES: ScopeType[] = ['vacancies', 'candidates', 'companies', 'all']

// --- Мок-данные ---

const MOCK_HISTORY = [
  'Python разработчик middle',
  'Backend Java',
  'Frontend React',
  'Data engineer',
]

const MOCK_POPULAR = [
  'Python backend удалённо',
  'senior python data',
  'React TypeScript',
]

const MOCK_SUGGESTS: Record<string, string[]> = {
  py: ['Python разработчик', 'Python backend', 'Python data'],
  python: ['Python разработчик middle', 'Python backend удалённо', 'senior python data'],
  re: ['React разработчик', 'React TypeScript', 'Backend Java'],
  java: ['Backend Java', 'Java developer'],
}

const MOCK_ENTITIES: EntityData[] = [
  { id: 'v1', entityType: 'vacancy', title: 'Python Backend Developer', subtitle: 'ACME Corp', meta: 'Минск' },
  { id: 'c1', entityType: 'candidate', title: 'Иван Петров', subtitle: 'Python разработчик', meta: 'Москва' },
  { id: 'co1', entityType: 'company', title: 'ACME Corp', subtitle: '24 вакансии', meta: '' },
  { id: 'v2', entityType: 'vacancy', title: 'Frontend Senior', subtitle: 'Tech Co', meta: 'Минск' },
  { id: 'c2', entityType: 'candidate', title: 'Мария Сидорова', subtitle: 'Frontend', meta: 'Гомель' },
]

function filterEntities(q: string, limit: number): EntityData[] {
  if (!q || q.length < 2) return []
  const lower = q.toLowerCase()
  const out = MOCK_ENTITIES.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      (e.subtitle && e.subtitle.toLowerCase().includes(lower)) ||
      (e.meta && e.meta.toLowerCase().includes(lower))
  )
  return out.slice(0, limit)
}

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

function getScopedSuggestions(query: string, currentScope: ScopeType | null, limit: number): Suggestion[] {
  const q = query.trim()
  if (!q) return [] // «Искать во всех» по пустому не показываем
  const out: Suggestion[] = []
  for (const sc of SCOPES) {
    if (out.length >= limit) break
    // текущий скоуп можно не предлагать (только альтернативные)
    if (sc === currentScope) continue
    const label = sc === 'all' ? `Найти «${q}» во всех данных` : `Найти «${q}» среди ${SCOPE_LABELS[sc].toLowerCase()}`
    out.push({ type: 'scope', label, query: q, scope: sc })
  }
  return out
}

// --- Компонент ---

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

const ENTITY_ICONS = {
  vacancy: FileTextIcon,
  candidate: PersonIcon,
  company: HomeIcon,
}

const ENTITY_LIMIT = 4
const QUERY_LIMIT = 5
const SCOPE_LIMIT = 4

export default function GlobalSearch({
  placeholder = 'Поиск...',
  shortcutHint,
  dark = false,
  onSearch,
  onEntityClick,
}: GlobalSearchProps) {
  const [value, setValue] = useState('')
  const [scope, setScope] = useState<ScopeType | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // --- Сбор подсказок (блоки: сущности, запросы, скоуп) ---
  const { entities, queries, scoped, flat } = useMemo(() => {
    const q = value.trim()
    const hasInput = q.length >= 1

    const entities: Suggestion[] = hasInput
      ? filterEntities(q, ENTITY_LIMIT).map((e) => ({
          type: 'entity' as const,
          label: e.title,
          query: q,
          entity: e,
        }))
      : []

    const queries: Suggestion[] = hasInput ? getQueries(q, QUERY_LIMIT) : []
    // по фокусу с пустым: только история (без «во всех»). Упростим: при пустом queries = MOCK_HISTORY.slice(0,5)
    if (!hasInput && open) {
      MOCK_HISTORY.slice(0, 5).forEach((p) => {
        queries.push({ type: 'query', label: p, query: p })
      })
    }

    const scoped: Suggestion[] = hasInput ? getScopedSuggestions(q, scope, SCOPE_LIMIT) : []

    // Плоский список по порядку: entities → queries → scoped (для стрелок и Enter)
    const flat: Suggestion[] = [...entities, ...queries, ...scoped]

    return { entities, queries, scoped, flat }
  }, [value, scope, open])

  const showDropdown = open && (flat.length > 0 || value.length >= 1)

  // --- Клик вне ---
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // --- Клавиатура ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key === 'Enter') {
        if (showDropdown && flat.length > 0 && activeIndex >= 0 && activeIndex < flat.length) {
          e.preventDefault()
          const s = flat[activeIndex]
          if (s.type === 'entity' && s.entity) {
            onEntityClick?.(s.entity)
            setOpen(false)
            // текст в инпуте не меняем
          } else if (s.type === 'scope' && s.scope) {
            setScope(s.scope)
            onSearch?.(s.query, s.scope)
            setOpen(false)
          } else {
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
        e.preventDefault()
        if (flat.length === 0) return
        setActiveIndex((i) => (i + 1) % flat.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (flat.length === 0) return
        setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
        return
      }
    },
    [showDropdown, flat, activeIndex, value, scope, onSearch, onEntityClick]
  )

  // сброс activeIndex при смене flat
  useEffect(() => {
    setActiveIndex(0)
  }, [flat.length])

  // прокрутка активного элемента в видимую область при навигации клавиатурой
  useEffect(() => {
    if (!showDropdown || flat.length === 0) return
    const el = containerRef.current?.querySelector('[role="option"][data-active="true"]')
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, showDropdown, flat.length])

  const selectItem = useCallback(
    (s: Suggestion, index: number) => {
      setActiveIndex(index)
      if (s.type === 'entity' && s.entity) {
        onEntityClick?.(s.entity)
        setOpen(false)
      } else if (s.type === 'scope' && s.scope) {
        setScope(s.scope)
        onSearch?.(s.query, s.scope)
        setOpen(false)
      } else {
        setValue(s.query)
        onSearch?.(s.query, scope)
        setOpen(false)
      }
    },
    [onSearch, onEntityClick, scope]
  )

  const handleFocus = () => setOpen(true)
  const handleChange = (v: string) => {
    setValue(v)
    setOpen(true)
  }

  const clearScope = () => setScope(null)

  const scopeChipLabel = scope ? SCOPE_LABELS[scope] : null

  return (
    <Box ref={containerRef} className={styles.wrapper}>
      <TextField.Root
        value={value}
        onFocus={handleFocus}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="2"
        style={{ flex: 1, minWidth: 0 }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} />
        </TextField.Slot>
        {(scopeChipLabel || shortcutHint) && (
          <TextField.Slot side="right" style={{ paddingRight: 8, gap: 6 }}>
            {scopeChipLabel && (
              <span className={styles.scopeChip}>
                <MixerHorizontalIcon width={12} height={12} />
                {scopeChipLabel}
                <span className={styles.scopeChipRemove} onClick={clearScope} onMouseDown={(e) => e.preventDefault()} aria-label="Сбросить область">
                  <Cross2Icon width={12} height={12} />
                </span>
              </span>
            )}
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

      {showDropdown && (
        <div className={styles.dropdown} role="listbox">
          {entities.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Сущности</div>
              {entities.map((s, i) => {
                const e = s.entity!
                const Icon = ENTITY_ICONS[e.entityType]
                const idx = flat.indexOf(s)
                return (
                  <button
                    key={`entity-${e.id}`}
                    type="button"
                    className={styles.item}
                    role="option"
                    aria-selected={activeIndex === idx}
                    data-active={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectItem(s, idx)}
                  >
                    <span className={styles.entityIcon}>
                      <Icon width={14} height={14} />
                    </span>
                    <div className={styles.entityContent}>
                      <div className={styles.entityTitle}>{e.title}</div>
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
          {queries.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Запросы</div>
              {queries.map((s, i) => {
                const idx = flat.indexOf(s)
                const pre = s.matchPrefix ?? ''
                const rest = pre ? s.label.slice(pre.length) : s.label
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
          {scoped.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Искать в области…</div>
              {scoped.map((s, i) => {
                const idx = flat.indexOf(s)
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
