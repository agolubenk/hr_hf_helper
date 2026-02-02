'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button, Badge, Grid, Switch } from "@radix-ui/themes"
import { useRouter } from "next/navigation"
import { LightningBoltIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import styles from '../company-settings.module.css'
import integrationsStyles from './integrations.module.css'
import IntegrationScopeModal from './IntegrationScopeModal'
import { GoogleServicesModal } from './GoogleServicesModal'

/**
 * ACTIVE_STORAGE_KEY - ключ для хранения состояния активности интеграций в localStorage
 * 
 * Используется для:
 * - Сохранения состояния активности интеграций между сессиями
 * - Восстановления состояния при следующей загрузке страницы
 */
const ACTIVE_STORAGE_KEY = 'integrationActive'

/**
 * getIntegrationActive - получение состояния активности интеграции из localStorage
 * 
 * Функциональность:
 * - Читает состояние активности интеграции из localStorage
 * - Возвращает значение по умолчанию, если значение не найдено
 * - Безопасно работает на сервере (SSR) - возвращает fallback
 * 
 * Поведение:
 * - Проверяет наличие window (для SSR безопасности)
 * - Читает значение из localStorage по ключу `${ACTIVE_STORAGE_KEY}_${id}`
 * - Парсит строковое значение в boolean
 * - Если значение не найдено или некорректно - возвращает fallback
 * 
 * Используется для:
 * - Восстановления состояния активности интеграций при загрузке страницы
 * - Сохранения пользовательских настроек между сессиями
 * 
 * @param id - ID интеграции
 * @param fallback - значение по умолчанию, если в localStorage нет значения
 * @returns состояние активности интеграции (true/false)
 */
function getIntegrationActive(id: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(`${ACTIVE_STORAGE_KEY}_${id}`)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return fallback
}

/**
 * setIntegrationActive - сохранение состояния активности интеграции в localStorage
 * 
 * Функциональность:
 * - Сохраняет состояние активности интеграции в localStorage
 * - Безопасно работает на сервере (SSR) - ничего не делает
 * 
 * Поведение:
 * - Проверяет наличие window (для SSR безопасности)
 * - Сохраняет значение в localStorage по ключу `${ACTIVE_STORAGE_KEY}_${id}`
 * - Преобразует boolean в строку для хранения
 * 
 * Используется для:
 * - Сохранения состояния активности интеграций при переключении
 * - Сохранения пользовательских настроек между сессиями
 * 
 * @param id - ID интеграции
 * @param value - новое состояние активности (true/false)
 */
function setIntegrationActive(id: string, value: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${ACTIVE_STORAGE_KEY}_${id}`, String(value))
}

/**
 * IntegrationId - тип идентификатора интеграции
 * 
 * Используется для:
 * - Типизации ID интеграций в коде
 * - Обеспечения типобезопасности при работе с интеграциями
 * 
 * Значения:
 * - 'google': интеграция с Google (включение сервисов: календарь, Drive, таблицы, личные данные — в профиле, у каждого пользователя своё)
 * - 'telegram': интеграция с Telegram (мессенджер)
 * - 'hh': интеграция с hh.ru и rabota.by (job-сайты)
 * - 'huntflow': интеграция с Huntflow (ATS система)
 * - 'gemini': интеграция с Google Gemini (ИИ)
 * - 'openai': интеграция с OpenAI (ИИ)
 * - 'cloud-ai': интеграция с Cloud AI (ИИ)
 * - 'clickup': интеграция с ClickUp (task tracker)
 * - 'notion': интеграция с Notion (task tracker)
 * - 'n8n': интеграция с n8n (автоматизация)
 */
type IntegrationId =
  | 'google'
  | 'telegram'
  | 'hh'
  | 'huntflow'
  | 'gemini'
  | 'openai'
  | 'cloud-ai'
  | 'clickup'
  | 'notion'
  | 'n8n'

/**
 * IntegrationGroupId - тип идентификатора группы интеграций
 * 
 * Используется для:
 * - Группировки интеграций по категориям
 * - Фильтрации интеграций в интерфейсе
 * 
 * Значения:
 * - 'all': все интеграции (используется для фильтра "Все")
 * - 'ai': интеграции с ИИ сервисами (Gemini, OpenAI, Cloud AI, n8n)
 * - 'auth': интеграции для авторизации (Google — включение сервисов в профиле)
 * - 'messengers': мессенджеры (Telegram)
 * - 'job-sites': job-сайты (hh.ru, rabota.by)
 * - 'hrm-ats': HRM и ATS системы (Huntflow)
 * - 'task-trackers': системы управления задачами (ClickUp, Notion)
 */
type IntegrationGroupId =
  | 'all'
  | 'ai'
  | 'auth'
  | 'messengers'
  | 'job-sites'
  | 'hrm-ats'
  | 'task-trackers'

/**
 * Integration - интерфейс данных интеграции
 * 
 * Структура:
 * - id: уникальный идентификатор интеграции
 * - name: полное название интеграции
 * - shortName: короткое название (для отображения в компактном виде)
 * - active: флаг активности интеграции (включена/выключена)
 * - href: URL для перехода к настройкам интеграции (опционально)
 * - group: группа интеграции для фильтрации
 * - allowsScopeChoice: разрешает ли выбор области применения (общий/у каждого свой/оба)
 * - description: краткое описание для карточки (опционально)
 * 
 * Используется для:
 * - Хранения данных об интеграциях
 * - Отображения списка интеграций в интерфейсе
 * - Фильтрации интеграций по группам
 */
interface Integration {
  id: IntegrationId
  name: string
  shortName?: string
  active: boolean
  href?: string
  group: IntegrationGroupId
  /** Для интеграций, где можно выбрать общий / у каждого свой / оба. У Google выбора нет — всегда у каждого свой. */
  allowsScopeChoice?: boolean
  /** Краткое описание под названием (например, для Google — про включение в профиле). */
  description?: string
}

/**
 * INTEGRATION_GROUPS - массив групп интеграций для фильтрации
 * 
 * Используется для:
 * - Отображения списка групп в интерфейсе фильтрации
 * - Группировки интеграций по категориям
 * 
 * Структура каждой группы:
 * - id: идентификатор группы (IntegrationGroupId)
 * - label: отображаемое название группы
 */
const INTEGRATION_GROUPS: { id: IntegrationGroupId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ai', label: 'ИИ' },
  { id: 'auth', label: 'Вход' },
  { id: 'messengers', label: 'Мессенджеры' },
  { id: 'job-sites', label: 'Job-сайты' },
  { id: 'hrm-ats', label: 'HRM&ATS' },
  { id: 'task-trackers', label: "Task Tracker's" },
]

/**
 * INTEGRATIONS - массив всех доступных интеграций
 * 
 * Используется для:
 * - Отображения списка интеграций в интерфейсе
 * - Фильтрации интеграций по группам
 * - Управления активностью интеграций
 * 
 * Структура каждой интеграции:
 * - id: уникальный идентификатор (IntegrationId)
 * - name: полное название интеграции
 * - shortName: короткое название для компактного отображения
 * - active: флаг активности (true - включена, false - выключена)
 * - group: группа интеграции для фильтрации
 * - allowsScopeChoice: разрешает ли выбор области применения учетных данных
 * 
 * Примечания:
 * - active: true означает, что интеграция включена (по умолчанию)
 * - allowsScopeChoice: true означает, что можно выбрать режим хранения ключей (общий/у каждого свой/оба)
 * - href: опционально, используется для перехода к настройкам интеграции
 * 
 * TODO: Загружать из API вместо хардкода
 */
const INTEGRATIONS: Integration[] = [
  {
    id: 'google',
    name: 'Google',
    shortName: 'G',
    active: false,
    group: 'auth',
    allowsScopeChoice: false,
    description: 'Календарь, Диск, таблицы, личные данные. Включение сервисов — здесь; OAuth и ключи — в профиле.',
  },
  { id: 'telegram', name: 'Telegram', shortName: 'T', active: false, group: 'messengers', allowsScopeChoice: true },
  { id: 'hh', name: 'hh.ru / rabota.by', shortName: 'HH', active: false, group: 'job-sites', allowsScopeChoice: true },
  { id: 'huntflow', name: 'Huntflow', shortName: 'H', active: true, group: 'hrm-ats', allowsScopeChoice: true },
  { id: 'gemini', name: 'Gemini', shortName: 'G', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'openai', name: 'OpenAI', shortName: 'O', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'cloud-ai', name: 'Cloud AI', shortName: 'AI', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'n8n', name: 'n8n', shortName: 'n8n', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'clickup', name: 'ClickUp', shortName: 'C', active: false, group: 'task-trackers', allowsScopeChoice: true },
  { id: 'notion', name: 'Notion', shortName: 'N', active: false, group: 'task-trackers', allowsScopeChoice: true },
]

/**
 * filterByGroup - фильтрация интеграций по группе
 * 
 * Функциональность:
 * - Фильтрует массив интеграций по указанной группе
 * - Если группа 'all' - возвращает все интеграции без фильтрации
 * 
 * Поведение:
 * - Если group === 'all' - возвращает исходный массив
 * - Иначе фильтрует интеграции, оставляя только те, у которых group совпадает с указанным
 * 
 * Используется для:
 * - Отображения интеграций выбранной группы в интерфейсе
 * - Фильтрации при переключении между группами
 * 
 * @param items - массив интеграций для фильтрации
 * @param group - ID группы для фильтрации ('all' - все группы)
 * @returns отфильтрованный массив интеграций
 */
function filterByGroup(items: Integration[], group: IntegrationGroupId): Integration[] {
  if (group === 'all') return items
  return items.filter((i) => i.group === group)
}

/**
 * IntegrationCard - компонент карточки интеграции
 * 
 * Функциональность:
 * - Отображает информацию об интеграции
 * - Переключатель активности
 * - Кнопка настройки/подключения
 * 
 * Поведение:
 * - При клике на переключатель активности вызывает onActiveChange
 * - При клике на кнопку "Настроить"/"Подключить":
 *   - Для Google — открывает модальное окно включения/отключения сервисов Google (галочки)
 *   - Если есть href — переходит на страницу настройки
 *   - Если allowsScopeChoice — открывает модальное окно выбора области
 *   - Иначе показывает сообщение о разработке
 *
 * @param item - объект интеграции
 * @param isActive - текущее состояние активности
 * @param onActiveChange - обработчик изменения активности
 * @param onOpenScopeModal - обработчик открытия модального окна выбора области
 * @param onOpenGoogleServicesModal - обработчик открытия модального окна сервисов Google
 */
function IntegrationCard({
  item,
  isActive,
  onActiveChange,
  onOpenScopeModal,
  onOpenGoogleServicesModal,
}: {
  item: Integration
  isActive: boolean
  onActiveChange: (value: boolean) => void
  onOpenScopeModal: (item: Integration) => void
  onOpenGoogleServicesModal: () => void
}) {
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Флаг, является ли интеграция ИИ-интеграцией (для отображения специальной иконки)
  const isAi = ['gemini', 'openai', 'cloud-ai', 'n8n'].includes(item.id)

  /**
   * handleAction - обработчик клика на кнопку "Настроить"/"Подключить"
   *
   * - Для Google: открывает модальное окно включения/отключения сервисов (галочки), без редиректа на профиль
   * - Если есть href: переход на страницу настройки
   * - Если allowsScopeChoice: открывает модальное окно выбора области применения
   */
  const handleAction = () => {
    if (item.id === 'google') {
      // Модальное окно включения/отключения сервисов Google и выбора сервисов через галочки
      onOpenGoogleServicesModal()
    } else if (item.href) {
      router.push(item.href)
    } else if (item.allowsScopeChoice) {
      onOpenScopeModal(item)
    } else if (item.active) {
      /* настроить: пока нет страницы */
    } else {
      /* подключить: скоро */
    }
  }

  return (
    <Card className={integrationsStyles.card}>
      <Flex direction="column" gap="3" style={{ height: '100%' }}>
        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Flex align="center" gap="3">
            <Box
              className={integrationsStyles.iconBox}
              style={{
                backgroundColor: isActive ? 'var(--green-3)' : 'var(--gray-4)',
                color: isActive ? 'var(--green-11)' : 'var(--gray-11)',
              }}
            >
              {isAi ? (
                <LightningBoltIcon width={20} height={20} />
              ) : (
                <Text size="2" weight="bold">{item.shortName || item.name.slice(0, 2)}</Text>
              )}
            </Box>
            <Text size="3" weight="medium">{item.name}</Text>
          </Flex>
          {item.description && (
            <Text size="1" color="gray" style={{ lineHeight: 1.4 }}>
              {item.description}
            </Text>
          )}
          <Flex align="center" gap="2">
            <Badge color={isActive ? 'green' : 'gray'} variant="soft" size="1">
              {isActive ? 'Активна' : 'Неактивна'}
            </Badge>
            <Flex align="center" gap="2">
              <Switch checked={isActive} onCheckedChange={onActiveChange} />
              <Text size="1" color="gray">Активно</Text>
            </Flex>
          </Flex>
        </Flex>
        <Box style={{ flex: 1 }} />
        <Button
          size="2"
          variant={isActive ? 'soft' : 'outline'}
          onClick={handleAction}
          style={{ alignSelf: 'flex-start' }}
        >
          {item.id === 'google' ? (isActive ? 'Настроить' : 'Подключить') : isActive && item.href ? 'Настроить' : isActive ? 'Настроить' : 'Подключить'}
        </Button>
      </Flex>
    </Card>
  )
}

/**
 * IntegrationsSettingsPage - компонент страницы управления интеграциями
 * 
 * Состояние:
 * - scopeModalItem: интеграция, для которой открыто модальное окно выбора области
 * - integrationActive: объект с состоянием активности всех интеграций
 * - selectedGroup: выбранная группа интеграций для фильтрации
 */
export default function IntegrationsSettingsPage() {
  // Интеграция, для которой открыто модальное окно выбора области применения
  const [scopeModalItem, setScopeModalItem] = useState<Integration | null>(null)
  // Открыто ли модальное окно включения/отключения сервисов Google
  const [googleServicesModalOpen, setGoogleServicesModalOpen] = useState(false)
  // Объект с состоянием активности всех интеграций (ключ - ID интеграции, значение - активна/неактивна)
  const [integrationActive, setIntegrationActiveState] = useState<Record<string, boolean>>({})
  // Выбранная группа интеграций для фильтрации ('all' - все группы)
  const [selectedGroup, setSelectedGroup] = useState<IntegrationGroupId>('all')

  /**
   * useEffect - загрузка состояния активности интеграций из localStorage при монтировании
   * 
   * Функциональность:
   * - Загружает состояние активности каждой интеграции из localStorage
   * - Использует значение по умолчанию из INTEGRATIONS, если в localStorage нет значения
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Восстанавливает состояние активности всех интеграций
   */
  useEffect(() => {
    const next: Record<string, boolean> = {}
    INTEGRATIONS.forEach((i) => {
      // Загружаем состояние из localStorage или используем значение по умолчанию
      next[i.id] = getIntegrationActive(i.id, i.active)
    })
    setIntegrationActiveState(next)
  }, [])

  /**
   * handleActiveChange - обработчик изменения активности интеграции
   * 
   * Функциональность:
   * - Сохраняет новое состояние активности в localStorage
   * - Обновляет состояние компонента
   * 
   * Поведение:
   * - Вызывается при переключении Switch активности интеграции
   * - Сохраняет состояние для восстановления при следующей загрузке
   * 
   * @param id - ID интеграции
   * @param value - новое состояние активности (true/false)
   */
  const handleActiveChange = (id: string, value: boolean) => {
    // Сохраняем в localStorage для восстановления при следующей загрузке
    setIntegrationActive(id, value)
    // Обновляем состояние компонента
    setIntegrationActiveState((prev) => ({ ...prev, [id]: value }))
  }

  /**
   * filtered - отфильтрованный список интеграций по выбранной группе
   * 
   * Функциональность:
   * - Фильтрует интеграции по выбранной группе
   * - Если selectedGroup === 'all' - возвращает все интеграции
   * 
   * Используется для:
   * - Отображения только интеграций выбранной группы
   */
  const filtered = filterByGroup(INTEGRATIONS, selectedGroup)

  return (
    <AppLayout pageTitle="Интеграции">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="2" style={{ display: 'block' }}>
          Интеграции
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Подключайте сервисы и настраивайте обмен данными с HR Helper.
        </Text>

        <Flex className={integrationsStyles.groupTabs}>
          {INTEGRATION_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${integrationsStyles.groupTab} ${selectedGroup === g.id ? integrationsStyles.groupTabActive : ''}`}
              onClick={() => setSelectedGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </Flex>

        <Grid
          columns={{ initial: '1', sm: '2', md: '3' }}
          gap="4"
          mb="5"
        >
          {filtered.map((item) => (
            <IntegrationCard
              key={item.id}
              item={item}
              isActive={integrationActive[item.id] ?? item.active}
              onActiveChange={(v) => handleActiveChange(item.id, v)}
              onOpenScopeModal={setScopeModalItem}
              onOpenGoogleServicesModal={() => setGoogleServicesModalOpen(true)}
            />
          ))}
        </Grid>

        <Box className={integrationsStyles.moreMessage}>
          <Text size="2" color="gray">
            Скоро появятся другие интеграции.
          </Text>
        </Box>
      </Box>

      <IntegrationScopeModal
        open={scopeModalItem !== null}
        onOpenChange={(open) => !open && setScopeModalItem(null)}
        integrationId={scopeModalItem?.id ?? ''}
        integrationName={scopeModalItem?.name ?? ''}
      />

      <GoogleServicesModal
        open={googleServicesModalOpen}
        onOpenChange={setGoogleServicesModalOpen}
        onSave={(state) => {
          setIntegrationActive('google', state.enabled)
          setIntegrationActiveState((prev) => ({ ...prev, google: state.enabled }))
        }}
      />
    </AppLayout>
  )
}
