'use client'

import { Box, Text, Flex, Button, Select } from "@radix-ui/themes"
import { CheckIcon, Cross2Icon, EyeOpenIcon, EyeClosedIcon, LightningBoltIcon, ReloadIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useState, useEffect, useMemo } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { useToast } from "@/components/Toast/ToastContext"
import { getHuntflowUserSettings, saveHuntflowUserSettings, type HuntflowCredentialSource } from "@/lib/huntflowUserSettings"
import styles from './IntegrationSettingsModal.module.css'

interface IntegrationSettingsModalProps {
  integrationName: string
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialActiveSystem?: 'prod' | 'sandbox'
}

interface SettingsData {
  // Общие поля
  apiKey?: string
  integrationToken?: string
  
  // Huntflow: источник ключей (мои / компании / выключено), остальное — локально на пользователя
  credentialSource?: HuntflowCredentialSource
  sandboxUrl?: string
  sandboxApiKey?: string
  prodUrl?: string
  activeSystem?: 'prod' | 'sandbox'
  accessToken?: string
  refreshToken?: string
  
  // Telegram специфичные
  username?: string
  
  // Google специфичные
  oauthConnected?: boolean
  tokenValid?: boolean
}

export default function IntegrationSettingsModal({
  integrationName,
  isOpen,
  onClose,
  onSave,
  initialActiveSystem
}: IntegrationSettingsModalProps) {
  // Загружаем: сначала huntflow_user_settings, иначе старый huntflowActiveSystem, иначе initialActiveSystem
  const getInitialActiveSystem = (): 'prod' | 'sandbox' => {
    if (initialActiveSystem) return initialActiveSystem
    const stored = getHuntflowUserSettings()
    if (stored?.activeSystem === 'sandbox' || stored?.activeSystem === 'prod') return stored.activeSystem
    if (typeof window !== 'undefined') {
      const old = localStorage.getItem('huntflowActiveSystem')
      if (old === 'sandbox' || old === 'prod') return old
    }
    return 'prod'
  }

  const [settings, setSettings] = useState<SettingsData>({
    apiKey: '••••••••••••••••••••••••••••••••••••••••',
    integrationToken: '••••••••••••••••••••••••••••••••••••••••',
    credentialSource: 'mine',
    sandboxUrl: 'https://sandbox-api.huntflow.dev/v2',
    sandboxApiKey: '••••••••••••••••••••••••••••••••••••••••',
    prodUrl: 'https://api.huntflow.ru',
    activeSystem: getInitialActiveSystem(),
    accessToken: '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••',
    refreshToken: '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••',
    username: 'talent_softnetix',
    oauthConnected: true,
    tokenValid: true,
  })

  const toast = useToast()

  // Обновляем состояние при изменении initialActiveSystem
  useEffect(() => {
    if (initialActiveSystem && settings.activeSystem !== initialActiveSystem) {
      setSettings(prev => ({ ...prev, activeSystem: initialActiveSystem }))
    }
  }, [initialActiveSystem, settings.activeSystem])

  // Huntflow: загрузка локальных настроек пользователя при открытии
  useEffect(() => {
    if (isOpen && integrationName === 'Huntflow') {
      const loaded = getHuntflowUserSettings()
      if (loaded) {
        setSettings(prev => ({
          ...prev,
          credentialSource: loaded.credentialSource ?? prev.credentialSource ?? 'mine',
          activeSystem: loaded.activeSystem ?? prev.activeSystem ?? 'prod',
          sandboxUrl: loaded.sandboxUrl ?? prev.sandboxUrl,
          sandboxApiKey: loaded.sandboxApiKey ?? prev.sandboxApiKey,
          prodUrl: loaded.prodUrl ?? prev.prodUrl,
          accessToken: loaded.accessToken ?? prev.accessToken,
          refreshToken: loaded.refreshToken ?? prev.refreshToken,
        }))
      }
    }
  }, [isOpen, integrationName])

  const [showApiKey, setShowApiKey] = useState(false)
  const [showIntegrationToken, setShowIntegrationToken] = useState(false)
  const [showSandboxApiKey, setShowSandboxApiKey] = useState(false)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)
  const [testStatus, setTestStatus] = useState<{ [key: string]: boolean }>({})
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false) // Свернуто по умолчанию на мобильных
  
  const { theme } = useTheme()
  
  // Определяем цвет фона для модального окна в зависимости от темы
  const modalBackgroundColor = useMemo(() => {
    return theme === 'dark' ? '#1c1c1f' : '#ffffff'
  }, [theme])

  if (!isOpen) return null

  const handleTest = (field: string) => {
    console.log(`Тестирование ${field}`)
    setTestStatus(prev => ({ ...prev, [field]: true }))
    // Здесь будет логика тестирования
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [field]: false }))
    }, 2000)
  }

  const handleSaveClick = () => {
    // Huntflow: сохраняем все настройки локально на пользователя
    if (integrationName === 'Huntflow') {
      saveHuntflowUserSettings({
        credentialSource: settings.credentialSource,
        activeSystem: settings.activeSystem,
        sandboxUrl: settings.sandboxUrl,
        sandboxApiKey: settings.sandboxApiKey,
        prodUrl: settings.prodUrl,
        accessToken: settings.accessToken,
        refreshToken: settings.refreshToken,
      })
    }
    onSave(settings)
    onClose()
  }

  // Функция-хелпер для обработки клика по иконке показа/скрытия
  const handleToggleVisibility = (
    e: React.MouseEvent,
    currentState: boolean,
    setter: (value: boolean) => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setter(!currentState)
  }

  // Функция для рендеринга инструкций для каждого сервиса
  const renderInstructions = () => {
    switch (integrationName) {
      case 'Gemini AI':
        return (
          <Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Ссылка для начала:
            </Text>
            <Box style={{ marginBottom: '16px' }}>
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'var(--accent-9)', 
                  textDecoration: 'underline',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}
              >
                Google AI Studio
              </a>
            </Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Пошаговая инструкция:
            </Text>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Войти в Google аккаунт - используйте ваш Google аккаунт</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Перейти в Google AI Studio - нажмите на ссылку выше</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Get API Key" - найдите кнопку на главной странице</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Create API key" - создайте новый ключ</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Выбрать проект или создать новый - выберите существующий проект Google Cloud или создайте новый</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Create API key in existing project" - подтвердите создание</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Скопировать ключ и сохранить - скопируйте полученный API ключ и вставьте в настройки профиля</Text>
              </li>
            </ol>
            <Box 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--yellow-3)', 
                borderRadius: '6px',
                marginTop: '12px'
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                Важно:
              </Text>
              <Text size="2">
                Сохраните API ключ в безопасном месте. Он больше не будет показан после закрытия страницы.
              </Text>
            </Box>
          </Box>
        )

      case 'Huntflow':
        return (
          <Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Где искать в интерфейсе:
            </Text>
            <Box style={{ marginBottom: '16px' }}>
              <Text size="2" style={{ display: 'block', marginBottom: '4px' }}>Правый верхний угол → Settings (шестеренка)</Text>
              <Text size="2" style={{ display: 'block', marginBottom: '4px' }}>Вкладка "Companies"</Text>
              <Text size="2" style={{ display: 'block' }}>Левое меню → "API"</Text>
            </Box>
            <Box 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--green-3)', 
                borderRadius: '6px',
                marginBottom: '16px'
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Рекомендуется:
              </Text>
              <Text size="2">
                Используйте новую токенную систему для более безопасной и надежной интеграции.
              </Text>
            </Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Пошаговая инструкция (Токенная система):
            </Text>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "+Add token" - найдите кнопку в разделе API</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Ввести название токена - например, "HR Helper Integration"</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Generate the key" - создайте новый токен</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Перейти по полученной ссылке в новой вкладке - откроется страница авторизации</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Receive token" - подтвердите получение токена</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Скопировать оба токена:</Text>
                <Box style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  <Text size="2" style={{ display: 'block' }}>• Access token - для API запросов (действует 7 дней)</Text>
                  <Text size="2" style={{ display: 'block' }}>• Refresh token - для обновления (действует 14 дней)</Text>
                </Box>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Перейти в HR Helper → Интеграции → Huntflow → Управление токенами</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Вставить оба токена и сохранить</Text>
              </li>
            </ol>
            <Box 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--green-3)', 
                borderRadius: '6px',
                marginTop: '12px'
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
                Преимущества токенной системы:
              </Text>
              <Text size="2">
                Автоматическое обновление токенов, повышенная безопасность, надежная работа без перерывов.
              </Text>
            </Box>
          </Box>
        )

      case 'ClickUp':
        return (
          <Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Где искать в интерфейсе:
            </Text>
            <Box style={{ marginBottom: '16px' }}>
              <Text size="2" style={{ display: 'block', marginBottom: '4px' }}>Правый верхний угол → аватар пользователя</Text>
              <Text size="2" style={{ display: 'block', marginBottom: '4px' }}>"Settings"</Text>
              <Text size="2" style={{ display: 'block' }}>Левый сайдбар → "Apps" или "ClickUp API"</Text>
            </Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Пошаговая инструкция:
            </Text>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "+ Create new App" или "Generate API Token" - найдите соответствующую кнопку</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Ввести название приложения - например, "HR Helper"</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Указать redirect URL (если нужен OAuth) - обычно не требуется для простой интеграции</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Create App" - создайте приложение</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Скопировать Client ID, Client Secret или API Token - скопируйте полученный API токен и вставьте в настройки профиля</Text>
              </li>
            </ol>
            <Box 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--blue-3)', 
                borderRadius: '6px',
                marginTop: '12px'
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                Примечание:
              </Text>
              <Text size="2">
                API ключ ClickUp позволяет интегрироваться с системой управления задачами для автоматизации процессов.
              </Text>
            </Box>
          </Box>
        )

      case 'hh.ru / rabota.by':
      case 'OpenAI':
      case 'Cloud AI':
      case 'n8n':
        return (
          <Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              В разработке
            </Text>
            <Text size="2" color="gray">
              Инструкция по настройке появится в ближайших обновлениях.
            </Text>
          </Box>
        )

      case 'Notion':
        return (
          <Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Ссылка для начала:
            </Text>
            <Box style={{ marginBottom: '16px' }}>
              <a 
                href="https://notion.so/my-integrations" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'var(--accent-9)', 
                  textDecoration: 'underline',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}
              >
                My Integrations - Notion
              </a>
            </Box>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block' }}>
              Пошаговая инструкция:
            </Text>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Войти в Notion аккаунт - используйте ваш аккаунт Notion</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "+ New integration" - создайте новую интеграцию</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Заполнить форму:</Text>
                <Box style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  <Text size="2" style={{ display: 'block' }}>• Название интеграции (например, "HR Helper")</Text>
                  <Text size="2" style={{ display: 'block' }}>• Выбрать рабочее пространство</Text>
                  <Text size="2" style={{ display: 'block' }}>• Выбрать тип "Internal"</Text>
                  <Text size="2" style={{ display: 'block' }}>• Настроить права доступа - выберите чтение/запись для нужных баз данных</Text>
                </Box>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "Submit" - создайте интеграцию</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Скопировать "Internal Integration Token" - сохраните токен и вставьте в настройки профиля</Text>
              </li>
            </ol>
            <Text size="2" weight="medium" style={{ marginBottom: '12px', display: 'block', marginTop: '16px' }}>
              Дополнительно - предоставить доступ к страницам:
            </Text>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Открыть нужную страницу в Notion - перейдите к странице, которую хотите синхронизировать</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Кликнуть "..." (три точки) - найдите меню страницы</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">"Add connections" - добавьте подключения</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">Выбрать созданную интеграцию - выберите "HR Helper" или название вашей интеграции</Text>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Text size="2">"Confirm" - подтвердите подключение</Text>
              </li>
            </ol>
            <Box 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--blue-3)', 
                borderRadius: '6px',
                marginTop: '12px'
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                Примечание:
              </Text>
              <Text size="2">
                Integration Token позволяет интегрироваться с Notion для синхронизации страниц и баз данных. Не забудьте предоставить доступ к нужным страницам.
              </Text>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  const renderSettings = () => {
    switch (integrationName) {
      case 'Gemini AI':
        return (
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              API ключ Gemini
            </Text>
            <Box style={{ position: 'relative', width: '100%' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '80px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  boxSizing: 'border-box',
                }}
              />
              <Flex
                gap="2"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <Box
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowApiKey(!showApiKey)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                  title={showApiKey ? 'Скрыть' : 'Показать'}
                  role="button"
                  tabIndex={0}
                >
                  {showApiKey ? (
                    <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  ) : (
                    <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  )}
                </Box>
                <Button
                  size="1"
                  variant="soft"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTest('apiKey')
                  }}
                >
                  {testStatus.apiKey ? (
                    <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  ) : (
                    <CheckIcon width="14" height="14" />
                  )}
                  Тестировать
                </Button>
              </Flex>
            </Box>
          </Box>
        )

      case 'ClickUp':
        return (
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              API ключ ClickUp
            </Text>
            <Box style={{ position: 'relative', width: '100%' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '80px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  boxSizing: 'border-box',
                }}
              />
              <Flex
                gap="2"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <Box
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowApiKey(!showApiKey)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                  title={showApiKey ? 'Скрыть' : 'Показать'}
                  role="button"
                  tabIndex={0}
                >
                  {showApiKey ? (
                    <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  ) : (
                    <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  )}
                </Box>
                <Button
                  size="1"
                  variant="soft"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTest('apiKey')
                  }}
                >
                  {testStatus.apiKey ? (
                    <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  ) : (
                    <CheckIcon width="14" height="14" />
                  )}
                  Тестировать
                </Button>
              </Flex>
            </Box>
          </Box>
        )

      case 'Notion':
        return (
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Integration Token Notion
            </Text>
            <Box style={{ position: 'relative', width: '100%' }}>
              <input
                type={showIntegrationToken ? 'text' : 'password'}
                value={settings.integrationToken || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, integrationToken: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '80px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  boxSizing: 'border-box',
                }}
              />
              <Flex
                gap="2"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                }}
              >
                <Box
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowIntegrationToken(!showIntegrationToken)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                  title={showIntegrationToken ? 'Скрыть' : 'Показать'}
                  role="button"
                  tabIndex={0}
                >
                  {showIntegrationToken ? (
                    <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  ) : (
                    <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                  )}
                </Box>
                <Button
                  size="1"
                  variant="soft"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTest('integrationToken')
                  }}
                >
                  {testStatus.integrationToken ? (
                    <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  ) : (
                    <CheckIcon width="14" height="14" />
                  )}
                  Тестировать
                </Button>
              </Flex>
            </Box>
          </Box>
        )

      case 'Huntflow':
        return (
          <Flex direction="column" gap="4">
            {/* Источник ключей: мои / компании / выключено. При выключено — подтверждение через тост. */}
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
                Источник ключей
              </Text>
              <Select.Root
                value={settings.credentialSource || 'mine'}
                onValueChange={(value) => {
                  if (value === 'disabled') {
                    toast.showToast({
                      type: 'warning',
                      title: 'Отключить интеграцию Huntflow?',
                      message: 'Подтвердите отключение. Ключи и токены использоваться не будут.',
                      duration: 5 * 60 * 1000,
                      actions: [
                        { label: 'Подтвердить', onClick: () => {
                          saveHuntflowUserSettings({ credentialSource: 'disabled' })
                          onSave({ ...settings, credentialSource: 'disabled' })
                          onClose()
                        }, variant: 'soft', color: 'gray' },
                        { label: 'Отклонить', onClick: () => {}, variant: 'solid', color: 'blue' },
                      ],
                    })
                    return
                  }
                  setSettings(prev => ({ ...prev, credentialSource: value as HuntflowCredentialSource }))
                }}
              >
                <Select.Trigger style={{ width: '100%', boxSizing: 'border-box' }} />
                <Select.Content>
                  <Select.Item value="mine">Мои ключи</Select.Item>
                  <Select.Item value="company">Ключи компании</Select.Item>
                  <Select.Item value="disabled">Выключено</Select.Item>
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                От этого зависит, чьи ключи и токены используются; при «Выключено» — после подтверждения в тосте не используются.
              </Text>
            </Box>

            {/* Активная система */}
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
                Активная система
              </Text>
              <Select.Root
                value={settings.activeSystem || 'prod'}
                onValueChange={(value) => setSettings(prev => ({ ...prev, activeSystem: (value === 'sandbox' || value === 'prod') ? value : 'prod' }))}
              >
                <Select.Trigger style={{ width: '100%', boxSizing: 'border-box' }} />
                <Select.Content>
                  <Select.Item value="sandbox">Песочница</Select.Item>
                  <Select.Item value="prod">Продакшн</Select.Item>
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                Выберите, какую систему использовать по умолчанию
              </Text>
            </Box>

            {/* Песочница (Sandbox) */}
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: '12px', display: 'block' }}>
                Песочница (Sandbox)
              </Text>
              
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="1" color="gray" style={{ marginBottom: '4px', display: 'block' }}>
                    URL
                  </Text>
                  <input
                    type="text"
                    value={settings.sandboxUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, sandboxUrl: e.target.value }))}
                    placeholder="https://sandbox-api.huntflow.dev"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '1px solid var(--gray-a6)',
                      backgroundColor: 'var(--color-panel)',
                      color: 'var(--gray-12)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                    URL API для песочницы Huntflow
                  </Text>
                </Box>

                <Box>
                  <Text size="1" color="gray" style={{ marginBottom: '4px', display: 'block' }}>
                    API ключ
                  </Text>
                  <Box style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showSandboxApiKey ? 'text' : 'password'}
                      value={settings.sandboxApiKey || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, sandboxApiKey: e.target.value }))}
                      placeholder="Введите API ключ песочницы"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '80px',
                        fontSize: '14px',
                        borderRadius: '6px',
                        border: '1px solid var(--gray-a6)',
                        backgroundColor: 'var(--color-panel)',
                        color: 'var(--gray-12)',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Flex
                      gap="2"
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                      }}
                    >
                      <Box
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowSandboxApiKey(!showSandboxApiKey)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          userSelect: 'none',
                        }}
                        title={showSandboxApiKey ? 'Скрыть' : 'Показать'}
                        role="button"
                        tabIndex={0}
                      >
                        {showSandboxApiKey ? (
                          <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                        ) : (
                          <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                        )}
                      </Box>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleTest('sandboxApiKey')
                        }}
                      >
                        {testStatus.sandboxApiKey ? (
                          <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                        ) : (
                          <CheckIcon width="14" height="14" />
                        )}
                        Тестировать
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              </Flex>
            </Box>

            {/* Продакшн */}
            <Box>
              <Text size="2" weight="medium" color="gray" style={{ marginBottom: '12px', display: 'block' }}>
                Продакшн
              </Text>
              
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="1" color="gray" style={{ marginBottom: '4px', display: 'block' }}>
                    URL
                  </Text>
                  <input
                    type="text"
                    value={settings.prodUrl || 'https://api.huntflow.ru'}
                    onChange={(e) => setSettings(prev => ({ ...prev, prodUrl: e.target.value }))}
                    placeholder="https://api.huntflow.ru"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '1px solid var(--gray-a6)',
                      backgroundColor: 'var(--color-panel)',
                      color: 'var(--gray-12)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                    URL API для продакшн Huntflow
                  </Text>
                </Box>

                {/* Access Token */}
                <Box>
                  <Text size="1" color="gray" style={{ marginBottom: '4px', display: 'block' }}>
                    Access Token
                  </Text>
                  <Box style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showAccessToken ? 'text' : 'password'}
                      value={settings.accessToken || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Вставьте access_token полученный из Huntflow"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '40px',
                        fontSize: '14px',
                        borderRadius: '6px',
                        border: '1px solid var(--gray-a6)',
                        backgroundColor: 'var(--color-panel)',
                        color: 'var(--gray-12)',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Box
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowAccessToken(!showAccessToken)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      style={{
                        cursor: 'pointer',
                        padding: '4px',
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                        zIndex: 10,
                      }}
                      title={showAccessToken ? 'Скрыть' : 'Показать'}
                      role="button"
                      tabIndex={0}
                    >
                      {showAccessToken ? (
                        <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                      ) : (
                        <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                      )}
                    </Box>
                  </Box>
                  <Text size="1" style={{ marginTop: '4px', display: 'block', color: 'var(--green-9)' }}>
                    Access token для API запросов (действует 7 дней, истекает: 15.01.2026, 14:22:50)
                  </Text>
                </Box>

                {/* Refresh Token */}
                <Box>
                  <Text size="1" color="gray" style={{ marginBottom: '4px', display: 'block' }}>
                    Refresh Token
                  </Text>
                  <Box style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showRefreshToken ? 'text' : 'password'}
                      value={settings.refreshToken || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, refreshToken: e.target.value }))}
                      placeholder="Вставьте refresh_token полученный из Huntflow"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '40px',
                        fontSize: '14px',
                        borderRadius: '6px',
                        border: '1px solid var(--gray-a6)',
                        backgroundColor: 'var(--color-panel)',
                        color: 'var(--gray-12)',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Box
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowRefreshToken(!showRefreshToken)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      style={{
                        cursor: 'pointer',
                        padding: '4px',
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                        zIndex: 10,
                      }}
                      title={showRefreshToken ? 'Скрыть' : 'Показать'}
                      role="button"
                      tabIndex={0}
                    >
                      {showRefreshToken ? (
                        <EyeClosedIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                      ) : (
                        <EyeOpenIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
                      )}
                    </Box>
                  </Box>
                  <Text size="1" style={{ marginTop: '4px', display: 'block', color: 'var(--green-9)' }}>
                    Refresh token для обновления access token (действует 14 дней, истекает: 22.01.2026, 14:22:50)
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Кнопки действий */}
            <Flex gap="3" justify="end">
              <Button
                variant="soft"
                onClick={() => handleTest('connection')}
              >
                <ReloadIcon width="14" height="14" />
                Обновить токен
              </Button>
              <Button
                variant="solid"
                style={{ backgroundColor: 'var(--accent-9)' }}
                onClick={() => handleTest('connection')}
              >
                <LightningBoltIcon width="14" height="14" />
                Тест подключения
              </Button>
            </Flex>
          </Flex>
        )

      case 'Telegram':
        return (
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Username
            </Text>
            <input
              type="text"
              value={settings.username || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid var(--gray-a6)',
                backgroundColor: 'var(--color-panel)',
                color: 'var(--gray-12)',
                boxSizing: 'border-box',
              }}
            />
            <Text size="1" color="gray" style={{ marginTop: '8px', display: 'block' }}>
              Введите ваш Telegram username без @
            </Text>
          </Box>
        )

      case 'Google':
        return (
          <Box>
            <Text size="2" color="gray" style={{ marginBottom: '16px', display: 'block' }}>
              Google OAuth уже подключен. Вы можете переподключить интеграцию, нажав кнопку ниже.
            </Text>
            <Button
              variant="solid"
              style={{ backgroundColor: 'var(--accent-9)' }}
              onClick={() => handleTest('oauth')}
            >
              Переподключить Google
            </Button>
          </Box>
        )

      case 'hh.ru / rabota.by':
      case 'OpenAI':
      case 'Cloud AI':
      case 'n8n':
        return (
          <Box>
            <Text size="2" color="gray" style={{ marginBottom: '16px', display: 'block' }}>
              Настройка в разработке. Скоро здесь можно будет указать API ключи и параметры подключения.
            </Text>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box className={styles.modalOverlay} onClick={onClose}>
      <Box 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: modalBackgroundColor,
          background: modalBackgroundColor,
          opacity: 1,
        }}
      >
        {/* Заголовок */}
        <Flex justify="between" align="center" className={styles.modalHeader}>
          <Text size="4" weight="bold">
            {integrationName}
          </Text>
          <Box
            onClick={onClose}
            style={{
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
            }}
            title="Закрыть"
          >
            <Cross2Icon width="20" height="20" />
          </Box>
        </Flex>

        {/* Содержимое */}
        <Flex 
          className={styles.modalContentWrapper}
          style={{
            backgroundColor: modalBackgroundColor,
            background: modalBackgroundColor,
            opacity: 1,
          }}
        >
          <Box 
            className={styles.settingsContent}
            style={{
              backgroundColor: modalBackgroundColor,
              background: modalBackgroundColor,
              opacity: 1,
            }}
          >
            {renderSettings()}
          </Box>
          <Box 
            className={`${styles.instructionsWrapper} ${isInstructionsExpanded ? styles.instructionsWrapperExpanded : ''}`}
            style={isInstructionsExpanded ? {
              backgroundColor: modalBackgroundColor,
              background: modalBackgroundColor,
              opacity: 1,
            } : {}}
          >
            {/* Кнопка разворачивания/сворачивания для мобильных */}
            <Box className={styles.instructionsToggle}>
              <Button
                variant="ghost"
                size="2"
                onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  boxSizing: 'border-box',
                  margin: 0,
                }}
              >
                <Text size="3" weight="medium" style={{ flex: 1, textAlign: 'left' }}>
                  Инструкция по настройке
                </Text>
                <Box style={{ flexShrink: 0, marginLeft: '8px' }}>
                  {isInstructionsExpanded ? (
                    <ChevronUpIcon width={16} height={16} />
                  ) : (
                    <ChevronDownIcon width={16} height={16} />
                  )}
                </Box>
              </Button>
            </Box>
            <Box 
              className={`${styles.instructions} ${!isInstructionsExpanded ? styles.instructionsCollapsed : styles.instructionsExpanded}`}
              style={isInstructionsExpanded ? {
                backgroundColor: modalBackgroundColor,
                background: modalBackgroundColor,
                opacity: 1,
              } : {}}
            >
              {renderInstructions()}
            </Box>
          </Box>
        </Flex>

        {/* Кнопки */}
        <Flex justify="end" gap="3" className={styles.modalFooter}>
          <Button variant="soft" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="solid"
            style={{ backgroundColor: 'var(--accent-9)' }}
            onClick={handleSaveClick}
          >
            Сохранить
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
