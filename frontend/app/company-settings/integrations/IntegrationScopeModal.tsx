'use client'

import { Dialog, Flex, Text, Button, Select, Box } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/Toast/ToastContext'
import IntegrationSettingsForm, { type IntegrationFormSettings } from '@/components/profile/IntegrationSettingsForm'

export type IntegrationCredentialScope = 'common' | 'per_user' | 'both'

const SCOPE_OPTIONS: { value: IntegrationCredentialScope; label: string }[] = [
  { value: 'common', label: 'Общий' },
  { value: 'per_user', label: 'У каждого свой' },
  { value: 'both', label: 'Оба' },
]

const STORAGE_KEY = 'integrationScope'
const COMPANY_SETTINGS_KEY = 'integration_company_settings'

/** integrationId (company-settings) -> integrationName для формы (как в профиле) */
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

interface IntegrationScopeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationId: string
  integrationName: string
  onSave?: (scope: IntegrationCredentialScope) => void
}

export function getStoredScope(integrationId: string): IntegrationCredentialScope | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(`${STORAGE_KEY}_${integrationId}`)
  if (raw === 'common' || raw === 'per_user' || raw === 'both') return raw
  return null
}

const HUNTFLOW_DEFAULTS: IntegrationFormSettings = {
  activeSystem: 'prod',
  sandboxUrl: '',
  sandboxApiKey: '',
  prodUrl: 'https://api.huntflow.ru',
  accessToken: '',
  refreshToken: '',
}

function getCompanySettings(integrationId: string): IntegrationFormSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${COMPANY_SETTINGS_KEY}_${integrationId}`)
    if (!raw) return null
    const o = JSON.parse(raw)
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
    return { apiKey: o.apiKey, integrationToken: o.integrationToken }
  } catch {
    return null
  }
}

function saveCompanySettings(integrationId: string, data: IntegrationFormSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${COMPANY_SETTINGS_KEY}_${integrationId}`, JSON.stringify(data))
}

export default function IntegrationScopeModal({
  open,
  onOpenChange,
  integrationId,
  integrationName,
  onSave,
}: IntegrationScopeModalProps) {
  const toast = useToast()
  const [scope, setScope] = useState<IntegrationCredentialScope>('common')
  const [formSettings, setFormSettings] = useState<IntegrationFormSettings>({ apiKey: '', integrationToken: '' })

  const formName = ID_TO_FORM_NAME[integrationId] || integrationName

  useEffect(() => {
    if (open) {
      const stored = getStoredScope(integrationId)
      setScope((stored as IntegrationCredentialScope) || 'common')
    }
  }, [open, integrationId])

  useEffect(() => {
    if (!open) return
    if (integrationId === 'huntflow' && scope === 'per_user') {
      setFormSettings({ apiKey: '', integrationToken: '' })
    } else {
      const company = getCompanySettings(integrationId)
      setFormSettings(company || (integrationId === 'huntflow' ? HUNTFLOW_DEFAULTS : { apiKey: '', integrationToken: '' }))
    }
  }, [open, integrationId, scope])

  const persistScope = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${integrationId}`, scope)
    }
    onSave?.(scope)
  }

  const handleSave = () => {
    persistScope()
    if (scope === 'common' || scope === 'both') {
      saveCompanySettings(integrationId, formSettings)
    }
    onOpenChange(false)
  }

  const handlePerUserSendEmail = () => {
    persistScope()
    if (scope === 'both') saveCompanySettings(integrationId, formSettings)
    toast.showToast({ type: 'info', title: 'Отправка в разработке', message: 'Функция отправки email с инструкциями будет доступна в следующих версиях.' })
    onOpenChange(false)
  }

  const handlePerUserSkip = () => {
    persistScope()
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
            <Link href="/profile?tab=integrations" style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}>
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
