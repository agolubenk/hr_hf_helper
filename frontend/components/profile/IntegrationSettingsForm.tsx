'use client'

import { Box, Text, Flex, Button, Select } from '@radix-ui/themes'
import { CheckIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useState } from 'react'

export interface IntegrationFormSettings {
  apiKey?: string
  integrationToken?: string
  /** Huntflow: продакшн или песочница */
  activeSystem?: 'prod' | 'sandbox'
  sandboxUrl?: string
  sandboxApiKey?: string
  prodUrl?: string
  accessToken?: string
  refreshToken?: string
}

const inputStyle = {
  width: '100%' as const,
  padding: '8px 12px',
  paddingRight: '80px',
  fontSize: 14,
  borderRadius: 6,
  border: '1px solid var(--gray-a6)',
  backgroundColor: 'var(--color-panel)',
  color: 'var(--gray-12)',
  boxSizing: 'border-box' as const,
}

export type CredentialScope = 'common' | 'per_user' | 'both'

interface IntegrationSettingsFormProps {
  integrationName: string
  settings: IntegrationFormSettings
  onSettingsChange: (patch: Partial<IntegrationFormSettings>) => void
  /** Для Telegram: никнейм только при common/both, вход (QR) только при common */
  credentialScope?: CredentialScope
}

/** Поле пароль с показом/скрытием (без кнопки «Тестировать») */
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <Box>
      <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>{label}</Text>
      <Box style={{ position: 'relative', width: '100%' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <Box onClick={() => setShow((s) => !s)} onMouseDown={(e) => e.preventDefault()} style={{ cursor: 'pointer', padding: 4, position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} role="button" tabIndex={0} title={show ? 'Скрыть' : 'Показать'}>
          {show ? <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} /> : <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />}
        </Box>
      </Box>
    </Box>
  )
}

/** Поле API-ключ с показом/скрытием и кнопкой «Тестировать» */
function ApiKeyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  const [testOk, setTestOk] = useState(false)
  const handleTest = () => {
    setTestOk(true)
    setTimeout(() => setTestOk(false), 2000)
  }
  return (
    <Box>
      <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
        {label}
      </Text>
      <Box style={{ position: 'relative', width: '100%' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
        <Flex gap="2" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
          <Box onClick={() => setShow((s) => !s)} onMouseDown={(e) => e.preventDefault()} style={{ cursor: 'pointer', padding: 4 }} role="button" tabIndex={0} title={show ? 'Скрыть' : 'Показать'}>
            {show ? <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} /> : <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />}
          </Box>
          <Button size="1" variant="soft" onClick={handleTest}>
            {testOk ? <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} /> : <CheckIcon width={14} height={14} />}
            Тестировать
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

/**
 * Форма API-ключей/токенов для интеграции. Идентична по полям настройкам в профиле.
 * Используется при режиме «Общий» и «Оба» в настройках компании.
 */
export default function IntegrationSettingsForm({ integrationName, settings, onSettingsChange, credentialScope }: IntegrationSettingsFormProps) {
  switch (integrationName) {
    case 'Google':
      return (
        <Box>
          <Text size="2" color="gray" style={{ marginBottom: 8, display: 'block' }}>
            OAuth Google настраивается в профиле пользователя при подключении интеграции.
          </Text>
          <Link href="/account/profile?tab=integrations" style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}>
            Профиль → Интеграции и API
          </Link>
        </Box>
      )
    case 'Telegram': {
      const scope = credentialScope || 'common'
      if (scope === 'per_user') {
        return (
          <Box>
            <Text size="2" color="gray" style={{ marginBottom: 8, display: 'block' }}>
              Никнейм и вход в чат настраиваются только при режиме «Общий» или «Оба». Выберите «Общий» или «Оба», чтобы указать никнейм; вход по QR — только при «Общий».
            </Text>
          </Box>
        )
      }
      return (
        <Flex direction="column" gap="4">
          {(scope === 'common' || scope === 'both') && (
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
                Никнейм Telegram (без @)
              </Text>
              <input
                type="text"
                value={settings.apiKey || ''}
                onChange={(e) => onSettingsChange({ apiKey: e.target.value })}
                placeholder="username"
                style={{ ...inputStyle, paddingRight: 12 }}
              />
            </Box>
          )}
          {scope === 'both' && (
            <Text size="1" color="gray">
              Вход в чат (QR) доступен только при режиме «Общий».
            </Text>
          )}
          {scope === 'common' && (
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
                Вход в чат (QR-код)
              </Text>
              <Text size="2" color="gray" style={{ marginBottom: 8, display: 'block' }}>
                Войдите в чат по QR-коду на отдельной странице.
              </Text>
              <Link href="/telegram" style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}>
                Перейти: Вход в Telegram
              </Link>
            </Box>
          )}
        </Flex>
      )
    }
    case 'Gemini AI':
      return (
        <ApiKeyField
          label="API ключ Gemini"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'OpenAI':
      return (
        <ApiKeyField
          label="API ключ OpenAI"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'Cloud AI':
      return (
        <ApiKeyField
          label="API ключ Cloud AI"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'ClickUp':
      return (
        <ApiKeyField
          label="API ключ ClickUp"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'Notion':
      return (
        <ApiKeyField
          label="Integration Token Notion"
          value={settings.integrationToken || ''}
          onChange={(v) => onSettingsChange({ integrationToken: v })}
        />
      )
    case 'n8n':
      return (
        <ApiKeyField
          label="Webhook URL / API ключ n8n"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'hh.ru / rabota.by':
      return (
        <ApiKeyField
          label="OAuth / API ключ hh.ru и rabota.by"
          value={settings.apiKey || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
    case 'Huntflow': {
      if (credentialScope === 'per_user') {
        return (
          <Box>
            <Text size="2" color="gray" style={{ marginBottom: 8, display: 'block' }}>
              При режиме «У каждого свой» Huntflow настраивается каждым пользователем в профиле. Форма данных компании не используется.
            </Text>
            <Link href="/account/profile?tab=integrations" style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}>
              Профиль → Интеграции и API
            </Link>
          </Box>
        )
      }
      const sys = settings.activeSystem || 'prod'
      return (
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
              Вариант
            </Text>
            <Select.Root
              value={sys}
              onValueChange={(v) => onSettingsChange({ activeSystem: v as 'prod' | 'sandbox' })}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value="prod">Продакшн</Select.Item>
                <Select.Item value="sandbox">Песочница</Select.Item>
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray" style={{ marginTop: 4, display: 'block' }}>
              Песочница — API-ключ; продакшн — access- и refresh-токены.
            </Text>
          </Box>

          {sys === 'sandbox' && (
            <>
              <Box>
                <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
                  Песочница: URL
                </Text>
                <input
                  type="text"
                  value={settings.sandboxUrl || ''}
                  onChange={(e) => onSettingsChange({ sandboxUrl: e.target.value })}
                  placeholder="https://sandbox-api.huntflow.dev"
                  style={{ ...inputStyle, paddingRight: 12 }}
                />
              </Box>
              <ApiKeyField
                label="Песочница: API-ключ"
                value={settings.sandboxApiKey || ''}
                onChange={(v) => onSettingsChange({ sandboxApiKey: v })}
              />
            </>
          )}

          {sys === 'prod' && (
            <>
              <Box>
                <Text size="2" weight="medium" color="gray" style={{ marginBottom: 8, display: 'block' }}>
                  Продакшн: URL
                </Text>
                <input
                  type="text"
                  value={settings.prodUrl || 'https://api.huntflow.ru'}
                  onChange={(e) => onSettingsChange({ prodUrl: e.target.value })}
                  placeholder="https://api.huntflow.ru"
                  style={{ ...inputStyle, paddingRight: 12 }}
                />
              </Box>
              <ApiKeyField
                label="Продакшн: Access Token"
                value={settings.accessToken || ''}
                onChange={(v) => onSettingsChange({ accessToken: v })}
              />
              <PasswordField
                label="Продакшн: Refresh Token"
                value={settings.refreshToken || ''}
                onChange={(v) => onSettingsChange({ refreshToken: v })}
                placeholder="Вставьте refresh_token из Huntflow"
              />
            </>
          )}

          <Text size="1" color="gray">
            Маппинги этапов, причин, полей и источников — на странице{' '}
            <Link href="/huntflow" style={{ color: 'var(--accent-9)', textDecoration: 'underline' }}>
              Huntflow
            </Link>.
          </Text>
        </Flex>
      )
    }
    default:
      return (
        <ApiKeyField
          label="API ключ / токен"
          value={settings.apiKey || settings.integrationToken || ''}
          onChange={(v) => onSettingsChange({ apiKey: v })}
        />
      )
  }
}
