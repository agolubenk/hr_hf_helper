/**
 * IntegrationScopeModal (app/company-settings/integrations/IntegrationScopeModal.tsx) - Модальное окно выбора области применения интеграции
 * 
 * Назначение:
 * - Выбор режима хранения учетных данных интеграции (общий/у каждого свой/оба)
 * - Настройка API-ключей и токенов для интеграции
 * - Управление настройками интеграции на уровне компании
 * 
 * Функциональность:
 * - Выбор режима учетных данных: общий, у каждого свой, оба
 * - Форма настройки API-ключей и токенов (через IntegrationSettingsForm)
 * - Сохранение настроек в localStorage
 * - Инструкции для пользователей при режиме "у каждого свой"
 * - Отправка email с инструкциями (в разработке)
 * 
 * Связи:
 * - company-settings/integrations/page.tsx: открывается при клике на кнопку настройки интеграции
 * - IntegrationSettingsForm: компонент формы настройки API-ключей
 * - useToast: для отображения уведомлений
 * - localStorage: сохранение выбранного режима и настроек
 * 
 * Поведение:
 * - При открытии загружает сохраненный режим из localStorage
 * - При выборе режима обновляет форму настроек
 * - При режиме "у каждого свой" не сохраняет ключи компании
 * - При режиме "общий" или "оба" сохраняет ключи компании
 * - При сохранении вызывает onSave с выбранным режимом
 */
'use client'

import { Dialog, Flex, Text, Button, Select, Box } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast/ToastContext'
import IntegrationSettingsForm, { type IntegrationFormSettings } from '@/components/profile/IntegrationSettingsForm'

/**
 * IntegrationCredentialScope - тип области применения учетных данных интеграции
 * 
 * Варианты:
 * - 'common': общий набор ключей на всю компанию
 * - 'per_user': у каждого пользователя свои ключи (настраиваются в профиле)
 * - 'both': допускаются и общие ключи компании, и личные ключи пользователей
 */
export type IntegrationCredentialScope = 'common' | 'per_user' | 'both'

/**
 * SCOPE_OPTIONS - опции выбора режима учетных данных
 * 
 * Используется для:
 * - Заполнения выпадающего списка выбора режима
 */
const SCOPE_OPTIONS: { value: IntegrationCredentialScope; label: string }[] = [
  { value: 'common', label: 'Общий' },
  { value: 'per_user', label: 'У каждого свой' },
  { value: 'both', label: 'Оба' },
]

/**
 * STORAGE_KEY - ключ для хранения выбранного режима в localStorage
 * 
 * Формат ключа: `${STORAGE_KEY}_${integrationId}`
 */
const STORAGE_KEY = 'integrationScope'

/**
 * COMPANY_SETTINGS_KEY - ключ для хранения настроек интеграции компании в localStorage
 * 
 * Формат ключа: `${COMPANY_SETTINGS_KEY}_${integrationId}`
 */
const COMPANY_SETTINGS_KEY = 'integration_company_settings'

/**
 * ID_TO_FORM_NAME - маппинг ID интеграции на название для формы
 * 
 * Используется для:
 * - Преобразования ID интеграции (из company-settings) в название (как в профиле)
 * - Отображения правильного названия в форме IntegrationSettingsForm
 */
const ID_TO_FORM_NAME: Record<string, string> = {
  google: 'Google',
  telegram: 'Telegram',
  hh: 'hh.ru / rabota.by',
  huntflow: 'Huntflow',
  gemini: 'Gemini AI',
  openai: 'OpenAI',
  'cloud-ai': 'Cloud AI',
  clickup: 'ClickUp',
  notion: 'Notion',
  n8n: 'n8n',
}

/**
 * IntegrationScopeModalProps - интерфейс пропсов компонента IntegrationScopeModal
 * 
 * Структура:
 * - open: флаг открытости модального окна
 * - onOpenChange: обработчик изменения открытости
 * - integrationId: ID интеграции
 * - integrationName: название интеграции
 * - onSave: обработчик сохранения (опционально)
 */
interface IntegrationScopeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationId: string
  integrationName: string
  onSave?: (scope: IntegrationCredentialScope) => void
}

/**
 * getStoredScope - получение сохраненного режима учетных данных из localStorage
 * 
 * Функциональность:
 * - Читает сохраненный режим для указанной интеграции
 * - Возвращает null если режим не сохранен или некорректен
 * 
 * Используется для:
 * - Восстановления выбранного режима при открытии модального окна
 * 
 * @param integrationId - ID интеграции
 * @returns сохраненный режим или null
 */
export function getStoredScope(integrationId: string): IntegrationCredentialScope | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(`${STORAGE_KEY}_${integrationId}`)
  if (raw === 'common' || raw === 'per_user' || raw === 'both') return raw
  return null
}

/**
 * HUNTFLOW_DEFAULTS - значения по умолчанию для настройки Huntflow
 * 
 * Используется для:
 * - Инициализации формы настроек Huntflow при отсутствии сохраненных настроек
 */
const HUNTFLOW_DEFAULTS: IntegrationFormSettings = {
  activeSystem: 'prod',
  sandboxUrl: '',
  sandboxApiKey: '',
  prodUrl: 'https://api.huntflow.ru',
  accessToken: '',
  refreshToken: '',
}

/**
 * getCompanySettings - получение настроек интеграции компании из localStorage
 * 
 * Функциональность:
 * - Читает сохраненные настройки интеграции для компании
 * - Обрабатывает специальный случай для Huntflow (prod/sandbox)
 * - Возвращает null если настройки не сохранены
 * 
 * Используется для:
 * - Восстановления настроек API-ключей при открытии модального окна
 * 
 * @param integrationId - ID интеграции
 * @returns настройки интеграции или null
 */
function getCompanySettings(integrationId: string): IntegrationFormSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${COMPANY_SETTINGS_KEY}_${integrationId}`)
    if (!raw) return null
    const o = JSON.parse(raw)
    // Специальная обработка для Huntflow (prod/sandbox системы)
    if (integrationId === 'huntflow') {
      return {
        activeSystem: o.activeSystem === 'sandbox' || o.activeSystem === 'prod' ? o.activeSystem : 'prod',
        sandboxUrl: o.sandboxUrl ?? '',
        sandboxApiKey: o.sandboxApiKey ?? '',
        prodUrl: o.prodUrl ?? 'https://api.huntflow.ru',
        accessToken: o.accessToken ?? '',
        refreshToken: o.refreshToken ?? '',
      }
    }
    // Для других интеграций: apiKey и integrationToken
    return { apiKey: o.apiKey, integrationToken: o.integrationToken }
  } catch {
    return null
  }
}

/**
 * saveCompanySettings - сохранение настроек интеграции компании в localStorage
 * 
 * Функциональность:
 * - Сохраняет настройки API-ключей и токенов для компании
 * - Используется только для режимов 'common' и 'both'
 * 
 * Используется для:
 * - Сохранения настроек при выборе режима "общий" или "оба"
 * 
 * @param integrationId - ID интеграции
 * @param data - настройки интеграции для сохранения
 */
function saveCompanySettings(integrationId: string, data: IntegrationFormSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${COMPANY_SETTINGS_KEY}_${integrationId}`, JSON.stringify(data))
}

/**
 * IntegrationScopeModal - компонент модального окна выбора области применения интеграции
 * 
 * Состояние:
 * - scope: выбранный режим учетных данных ('common', 'per_user', 'both')
 * - formSettings: настройки API-ключей и токенов для формы
 * 
 * Функциональность:
 * - Управление выбором режима учетных данных
 * - Настройка API-ключей и токенов
 * - Сохранение настроек в localStorage
 */
export default function IntegrationScopeModal({
  open,
  onOpenChange,
  integrationId,
  integrationName,
  onSave,
}: IntegrationScopeModalProps) {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Выбранный режим учетных данных (по умолчанию 'common')
  const [scope, setScope] = useState<IntegrationCredentialScope>('common')
  // Настройки API-ключей и токенов для формы
  const [formSettings, setFormSettings] = useState<IntegrationFormSettings>({ apiKey: '', integrationToken: '' })

  /**
   * formName - название интеграции для формы
   * 
   * Используется для:
   * - Отображения правильного названия в IntegrationSettingsForm
   * - Преобразования ID интеграции в название (через ID_TO_FORM_NAME)
   */
  const formName = ID_TO_FORM_NAME[integrationId] || integrationName

  /**
   * useEffect - загрузка сохраненного режима при открытии модального окна
   * 
   * Функциональность:
   * - Загружает сохраненный режим из localStorage
   * - Устанавливает режим по умолчанию 'common' если не сохранен
   * 
   * Поведение:
   * - Выполняется при открытии модального окна (open === true)
   * - Восстанавливает ранее выбранный режим для интеграции
   */
  useEffect(() => {
    if (open) {
      const stored = getStoredScope(integrationId)
      setScope((stored as IntegrationCredentialScope) || 'common')
    }
  }, [open, integrationId])

  /**
   * useEffect - загрузка настроек компании при изменении режима или открытии
   * 
   * Функциональность:
   * - Загружает настройки API-ключей компании из localStorage
   * - Обрабатывает специальный случай для Huntflow
   * - При режиме 'per_user' очищает настройки (не сохраняются)
   * 
   * Поведение:
   * - Выполняется при открытии модального окна или изменении режима
   * - Если режим 'per_user' - очищает настройки (не сохраняются для компании)
   * - Если режим 'common' или 'both' - загружает сохраненные настройки
   * - Для Huntflow использует HUNTFLOW_DEFAULTS если настройки не сохранены
   */
  useEffect(() => {
    if (!open) return
    // При режиме 'per_user' настройки компании не сохраняются
    if (integrationId === 'huntflow' && scope === 'per_user') {
      setFormSettings({ apiKey: '', integrationToken: '' })
    } else {
      // Загружаем сохраненные настройки или используем значения по умолчанию
      const company = getCompanySettings(integrationId)
      setFormSettings(company || (integrationId === 'huntflow' ? HUNTFLOW_DEFAULTS : { apiKey: '', integrationToken: '' }))
    }
  }, [open, integrationId, scope])

  /**
   * persistScope - сохранение выбранного режима в localStorage
   * 
   * Функциональность:
   * - Сохраняет выбранный режим для интеграции
   * - Вызывает onSave с выбранным режимом
   * 
   * Используется для:
   * - Сохранения выбранного режима при закрытии модального окна
   */
  const persistScope = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${integrationId}`, scope)
    }
    onSave?.(scope)
  }

  /**
   * handleSave - обработчик сохранения настроек
   * 
   * Функциональность:
   * - Сохраняет выбранный режим
   * - Сохраняет настройки API-ключей (если режим 'common' или 'both')
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Сохраняет режим через persistScope
   * - Если режим 'common' или 'both' - сохраняет настройки компании
   * - Если режим 'per_user' - не сохраняет настройки компании
   * - Закрывает модальное окно
   */
  const handleSave = () => {
    persistScope()
    // Сохраняем настройки компании только для режимов 'common' и 'both'
    if (scope === 'common' || scope === 'both') {
      saveCompanySettings(integrationId, formSettings)
    }
    onOpenChange(false)
  }

  /**
   * handlePerUserSendEmail - обработчик отправки email с инструкциями
   * 
   * Функциональность:
   * - Сохраняет выбранный режим
   * - Сохраняет настройки компании (если режим 'both')
   * - Показывает уведомление о том, что функция в разработке
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Вызывается при клике на "Да" в блоке "У каждого свой"
   * - В текущей реализации показывает toast о том, что функция в разработке
   * - TODO: Реализовать отправку email с инструкциями
   */
  const handlePerUserSendEmail = () => {
    persistScope()
    // Если режим 'both' - сохраняем настройки компании
    if (scope === 'both') saveCompanySettings(integrationId, formSettings)
    toast.showToast({ type: 'info', title: 'Отправка в разработке', message: 'Функция отправки email с инструкциями будет доступна в следующих версиях.' })
    onOpenChange(false)
  }

  /**
   * handlePerUserSkip - обработчик пропуска отправки email
   * 
   * Функциональность:
   * - Сохраняет выбранный режим
   * - Сохраняет настройки компании (если режим 'both')
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Вызывается при клике на "Нет" в блоке "У каждого свой"
   * - Сохраняет режим и настройки без отправки email
   */
  const handlePerUserSkip = () => {
    persistScope()
    // Если режим 'both' - сохраняем настройки компании
    if (scope === 'both') saveCompanySettings(integrationId, formSettings)
    onOpenChange(false)
  }

  const showFooterSave = scope === 'common' || scope === 'both'
  const showPerUserBlock = scope === 'per_user' || scope === 'both'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
        <Dialog.Title>Настройки: {integrationName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mt="2" mb="4">
          Выберите, как будут храниться ключи и настройки этой интеграции.
        </Dialog.Description>

        <Box mb="4">
          <Text size="2" weight="medium" color="gray" as="label" style={{ display: 'block', marginBottom: 8 }}>
            Режим учётных данных
          </Text>
          <Select.Root value={scope} onValueChange={(v) => setScope(v as IntegrationCredentialScope)}>
            <Select.Trigger style={{ width: '100%' }} />
            <Select.Content>
              {SCOPE_OPTIONS.map((o) => (
                <Select.Item key={o.value} value={o.value}>
                  {o.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Text size="1" color="gray" style={{ display: 'block', marginTop: 8 }}>
            {scope === 'common' && 'Один набор ключей на всю компанию. Укажите API-ключи и токены ниже.'}
            {scope === 'per_user' && 'Каждый пользователь задаёт свои ключи в профиле.'}
            {scope === 'both' && 'Допускаются и общие ключи компании, и личные ключи пользователей.'}
          </Text>
        </Box>

        {/* Форма API-ключей/токенов — всегда видна, идентична настройкам в профиле. При «У каждого свой» не сохраняется. */}
        <Box mb="4">
          <Text size="2" weight="medium" style={{ marginBottom: 12, display: 'block' }}>
            API-ключи и токены
          </Text>
          {scope === 'per_user' && (
            <Text size="1" color="gray" style={{ marginBottom: 8, display: 'block' }}>
              При режиме «У каждого свой» ключи компании не сохраняются. Переключите на «Общий» или «Оба», чтобы сохранить.
            </Text>
          )}
          <IntegrationSettingsForm
            integrationName={formName}
            settings={formSettings}
            onSettingsChange={(patch) => setFormSettings((s) => ({ ...s, ...patch }))}
            credentialScope={scope}
          />
        </Box>

        {/* У каждого свой: сообщение, инструкции, ссылка, Отправить email Да/Нет */}
        {showPerUserBlock && (
          <Box mb="4" style={{ padding: 12, backgroundColor: 'var(--blue-2)', borderRadius: 8, border: '1px solid var(--blue-6)' }}>
            <Text size="2" weight="medium" style={{ marginBottom: 8, display: 'block' }}>
              Осталось каждому настроить свои ключи!
            </Text>
            <Text size="2" color="gray" style={{ marginBottom: 8, display: 'block' }}>
              Инструкции по получению API-ключей и токенов — в профиле на вкладке «Интеграции и API» при настройке этой интеграции.
            </Text>
            <Link href="/account/profile?tab=integrations" style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}>
              Перейти на страницу настройки: Профиль → Интеграции и API
            </Link>
            <Text size="2" weight="medium" style={{ marginTop: 12, marginBottom: 8, display: 'block' }}>
              Отправить всем email с инструкциями?
            </Text>
            <Flex gap="2">
              <Button size="2" variant="soft" onClick={handlePerUserSendEmail}>
                Да
              </Button>
              <Button size="2" variant="outline" onClick={handlePerUserSkip}>
                Нет
              </Button>
            </Flex>
          </Box>
        )}

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft">Отмена</Button>
          </Dialog.Close>
          {showFooterSave && (
            <Button onClick={handleSave}>Сохранить</Button>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
