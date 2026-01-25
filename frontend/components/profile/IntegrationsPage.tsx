'use client'

import { Box, Text, Flex, Grid } from "@radix-ui/themes"
import { LightningBoltIcon, GearIcon, CheckIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import IntegrationSettingsModal from "./IntegrationSettingsModal"
import { getHuntflowUserSettings, type HuntflowUserSettings } from "@/lib/huntflowUserSettings"
import styles from './IntegrationsPage.module.css'

interface IntegrationCardProps {
  name: string
  logo: React.ReactNode
  status: React.ReactNode
  onConfigure: () => void
}

function IntegrationCard({ name, logo, status, onConfigure }: IntegrationCardProps) {
  return (
    <Box className={styles.integrationCard}>
      {/* Заголовок карточки */}
      <Flex justify="between" align="center" className={styles.cardHeader}>
        <Flex align="center" gap="2">
          {logo}
          <Text size="3" weight="medium">
            {name}
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <CheckIcon width={16} height={16} style={{ color: 'var(--green-9)', flexShrink: 0 }} />
          <Box
            className={styles.gearButton}
            onClick={onConfigure}
            title="Настроить API ключи"
          >
            <GearIcon width={16} height={16} />
          </Box>
        </Flex>
      </Flex>

      {/* Содержимое */}
      <Box className={styles.cardContent}>
        {status}
      </Box>
    </Box>
  )
}

// Логотипы интеграций
const GeminiLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      AI
    </Text>
  </Box>
)

const HuntflowLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      X
    </Text>
  </Box>
)

const ClickUpLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      C
    </Text>
  </Box>
)

const NotionLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      N
    </Text>
  </Box>
)

const TelegramLogo = () => (
  <Box className={styles.logoContainer}>
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM17.67 8.01L15.63 16.53C15.48 17.22 15.09 17.4 14.49 17.04L11.97 15.19L10.71 16.41C10.53 16.59 10.38 16.74 10.05 16.74L10.29 14.14L15.63 9.39C15.93 9.12 15.57 8.97 15.18 9.24L8.67 13.45L6.09 12.66C5.52 12.5 5.5 12.03 6.18 11.76L17.01 7.62C17.48 7.44 17.9 7.73 17.67 8.01Z"
        fill="white"
      />
    </svg>
  </Box>
)

const GoogleLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      G
    </Text>
  </Box>
)

const HHLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      HH
    </Text>
  </Box>
)

const OpenAILogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      O
    </Text>
  </Box>
)

const CloudAILogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      AI
    </Text>
  </Box>
)

const N8nLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      n8n
    </Text>
  </Box>
)

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Huntflow: локальные настройки пользователя (пер-юзер); после сохранения в модалке — перечитываем
  const [huntflowUserSettings, setHuntflowUserSettings] = useState<HuntflowUserSettings | null>(null)

  useEffect(() => {
    setHuntflowUserSettings(getHuntflowUserSettings())
  }, [])

  const handleConfigure = (integrationName: string) => {
    setSelectedIntegration(integrationName)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedIntegration(null)
  }

  const handleSave = (data: any) => {
    if (selectedIntegration === 'Huntflow') {
      setHuntflowUserSettings(getHuntflowUserSettings())
    }
    handleCloseModal()
  }

  return (
    <Box className={styles.integrationsBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <LightningBoltIcon width="20" height="20" />
          <Text size="4" weight="bold">
            Статус интеграций
          </Text>
        </Flex>
      </Box>

      {/* Сетка интеграций */}
      <Box className={styles.content}>
        <Grid columns="3" gap="4" width="100%" className={styles.grid}>
          <IntegrationCard
            name="Gemini AI"
            logo={<GeminiLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Gemini AI')}
          />

          <IntegrationCard
            name="Huntflow"
            logo={<HuntflowLogo />}
            status={
              (() => {
                const src = huntflowUserSettings?.credentialSource ?? 'mine'
                if (src === 'disabled') {
                  return (
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Интеграция:</Text>
                      <Text size="2">Выключено (подтверждено)</Text>
                    </Flex>
                  )
                }
                if (src === 'company') {
                  return (
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Ключи:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Ключи компании</Text>
                    </Flex>
                  )
                }
                const sys = huntflowUserSettings?.activeSystem ?? 'prod'
                return (
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Текущая система:</Text>
                      <Text size="2">{sys === 'prod' ? 'prod' : 'sandbox'}</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Access Token:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Валидный</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Refresh Token:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Валидный</Text>
                    </Flex>
                    {sys === 'sandbox' && (
                      <Flex align="center" gap="2">
                        <Text size="2" color="gray">API Песочницы:</Text>
                        <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                        <Text size="2">Настроен</Text>
                      </Flex>
                    )}
                  </Flex>
                )
              })()
            }
            onConfigure={() => handleConfigure('Huntflow')}
          />

          <IntegrationCard
            name="ClickUp"
            logo={<ClickUpLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('ClickUp')}
          />

          <IntegrationCard
            name="Notion"
            logo={<NotionLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Integration Token:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Notion')}
          />

          <IntegrationCard
            name="Telegram"
            logo={<TelegramLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Username:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">talent_softnetix</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Telegram')}
          />

          <IntegrationCard
            name="Google"
            logo={<GoogleLogo />}
            status={
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">OAuth:</Text>
                  <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  <Text size="2">Подключен</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">Токен:</Text>
                  <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  <Text size="2">Валидный</Text>
                </Flex>
              </Flex>
            }
            onConfigure={() => handleConfigure('Google')}
          />

          <IntegrationCard
            name="hh.ru / rabota.by"
            logo={<HHLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">OAuth/API:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('hh.ru / rabota.by')}
          />

          <IntegrationCard
            name="OpenAI"
            logo={<OpenAILogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('OpenAI')}
          />

          <IntegrationCard
            name="Cloud AI"
            logo={<CloudAILogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Cloud AI')}
          />

          <IntegrationCard
            name="n8n"
            logo={<N8nLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Webhook/API:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('n8n')}
          />
        </Grid>
      </Box>

      {/* Скоро появятся */}
      <Box style={{ marginTop: '16px' }}>
        <Text size="2" color="gray">
          Скоро появятся другие интеграции.
        </Text>
      </Box>

      {/* Общая инструкция */}
      <Box style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--blue-2)', borderRadius: '8px', border: '1px solid var(--blue-6)' }}>
        <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
          Нужна помощь?
        </Text>
        <Text size="2" color="gray">
          Если у вас возникли проблемы с настройкой интеграций, обратитесь к администратору системы или проверьте документацию соответствующих сервисов.
        </Text>
      </Box>

      {/* Модальное окно настроек */}
      {selectedIntegration && (
        <IntegrationSettingsModal
          integrationName={selectedIntegration}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialActiveSystem={selectedIntegration === 'Huntflow' ? (huntflowUserSettings?.activeSystem ?? 'prod') : undefined}
        />
      )}
    </Box>
  )
}
