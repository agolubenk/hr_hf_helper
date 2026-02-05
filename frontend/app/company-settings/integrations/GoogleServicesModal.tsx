'use client'

import { Dialog, Flex, Text, Button, Box, Checkbox } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * GoogleServicesModal — модальное окно включения/отключения сервисов Google
 *
 * Назначение:
 * - Включение/отключение интеграции Google на уровне компании
 * - Выбор сервисов Google через галочки (Календарь, Диск, Таблицы, Документы, Презентации и др.)
 *
 * По умолчанию все сервисы включены (статус «да»).
 * Часть сервисов может быть недоступна в тестовой версии.
 */
const STORAGE_KEY = 'integration_google_services'

export type GoogleServiceId =
  | 'calendar'
  | 'drive'
  | 'sheets'
  | 'documents'
  | 'presentations'
  | 'profile'
  | 'meet'
  | 'gmail'
  | 'other'

const GOOGLE_SERVICES: { id: GoogleServiceId; label: string; unavailableInTest?: boolean }[] = [
  { id: 'calendar', label: 'Календарь' },
  { id: 'drive', label: 'Диск' },
  { id: 'sheets', label: 'Таблицы' },
  { id: 'documents', label: 'Документы' },
  { id: 'presentations', label: 'Презентации' },
  { id: 'profile', label: 'Личные данные (профиль, email)' },
  { id: 'meet', label: 'Meet (видеозвонки)', unavailableInTest: true },
  { id: 'gmail', label: 'Почта (Gmail)', unavailableInTest: true },
  { id: 'other', label: 'Остальные сервисы', unavailableInTest: true },
]

export interface GoogleServicesState {
  enabled: boolean
  services: Record<GoogleServiceId, boolean>
}

function getAllServiceIds(): GoogleServiceId[] {
  return GOOGLE_SERVICES.map((s) => s.id)
}

function getStored(): GoogleServicesState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<GoogleServicesState>
    const ids = getAllServiceIds()
    const services = {} as Record<GoogleServiceId, boolean>
    ids.forEach((id) => {
      services[id] = parsed.services?.[id] ?? true
    })
    return {
      enabled: parsed.enabled ?? true,
      services,
    }
  } catch {
    return defaultState()
  }
}

/** По умолчанию все сервисы включены (статус «да»). */
function defaultState(): GoogleServicesState {
  const ids = getAllServiceIds()
  const services = {} as Record<GoogleServiceId, boolean>
  ids.forEach((id) => {
    services[id] = true
  })
  return {
    enabled: true,
    services,
  }
}

interface GoogleServicesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (state: GoogleServicesState) => void
}

export function GoogleServicesModal({ open, onOpenChange, onSave }: GoogleServicesModalProps) {
  const [enabled, setEnabled] = useState(false)
  const [services, setServices] = useState<Record<GoogleServiceId, boolean>>(defaultState().services)

  useEffect(() => {
    if (open) {
      const stored = getStored()
      setEnabled(stored.enabled)
      setServices(stored.services)
    }
  }, [open])

  const handleServiceChange = (id: GoogleServiceId, checked: boolean) => {
    setServices((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSave = () => {
    const state: GoogleServicesState = { enabled, services }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
    onSave?.(state)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 440, overflowY: 'auto' }}>
        <Dialog.Title>Подключение Google</Dialog.Title>
        <Dialog.Description size="2" color="gray" mt="2" mb="4">
          Включите интеграцию и отметьте сервисы Google, которые будут доступны в HR Helper.
        </Dialog.Description>

        <Flex direction="column" gap="3" mb="4">
          <Flex align="center" gap="2">
            <Checkbox
              checked={enabled}
              onCheckedChange={(checked) => setEnabled(checked === true)}
            />
            <Text size="2" weight="medium">Включить интеграцию Google</Text>
          </Flex>

          {enabled && (
            <Box pt="2" pl="4" style={{ borderLeft: '2px solid var(--gray-6)' }}>
              <Text size="2" weight="medium" color="gray" mb="2" style={{ display: 'block' }}>
                Сервисы
              </Text>
              <Flex direction="column" gap="2">
                {GOOGLE_SERVICES.map((s) => (
                  <Flex key={s.id} align="center" gap="2">
                    <Checkbox
                      checked={services[s.id] ?? true}
                      onCheckedChange={(checked) => handleServiceChange(s.id, checked === true)}
                    />
                    <Text size="2">{s.label}</Text>
                    {s.unavailableInTest && (
                      <Text size="1" color="gray">(может быть недоступно в тестовой версии)</Text>
                    )}
                  </Flex>
                ))}
              </Flex>
              <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                Часть сервисов может быть недоступна в тестовой версии.
              </Text>
            </Box>
          )}
        </Flex>

        <Text size="1" color="gray" mb="4" style={{ display: 'block' }}>
          OAuth и ключи настраиваются в личном профиле каждого пользователя.
        </Text>
        <Link
          href="/account/profile?tab=integrations"
          style={{ color: 'var(--accent-9)', textDecoration: 'underline', fontSize: 14 }}
        >
          Перейти в профиль: Интеграции и API
        </Link>

        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft">Отмена</Button>
          </Dialog.Close>
          <Button onClick={handleSave}>Сохранить</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
