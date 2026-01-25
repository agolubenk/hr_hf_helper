'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button, Badge, Grid } from "@radix-ui/themes"
import { useRouter } from "next/navigation"
import { LightningBoltIcon } from "@radix-ui/react-icons"
import styles from '../company-settings.module.css'
import integrationsStyles from './integrations.module.css'

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

interface Integration {
  id: IntegrationId
  name: string
  shortName?: string
  active: boolean
  href?: string
}

const INTEGRATIONS: Integration[] = [
  { id: 'google', name: 'Google', shortName: 'G', active: false },
  { id: 'telegram', name: 'Telegram', shortName: 'T', active: false },
  { id: 'hh', name: 'hh.ru / rabota.by', shortName: 'HH', active: false },
  { id: 'huntflow', name: 'Huntflow', shortName: 'H', active: true, href: '/huntflow' },
  { id: 'gemini', name: 'Gemini', shortName: 'G', active: false },
  { id: 'openai', name: 'OpenAI', shortName: 'O', active: false },
  { id: 'cloud-ai', name: 'Cloud AI', shortName: 'AI', active: false },
  { id: 'clickup', name: 'ClickUp', shortName: 'C', active: false },
  { id: 'notion', name: 'Notion', shortName: 'N', active: false },
  { id: 'n8n', name: 'n8n', shortName: 'n8n', active: false },
]

function IntegrationCard({ item }: { item: Integration }) {
  const router = useRouter()
  const isAi = ['gemini', 'openai', 'cloud-ai', 'n8n'].includes(item.id)

  const handleAction = () => {
    if (item.href) router.push(item.href)
    else if (item.active) { /* настроить: пока нет страницы */ }
    else { /* подключить: скоро */ }
  }

  return (
    <Card className={integrationsStyles.card}>
      <Flex direction="column" gap="3" style={{ height: '100%' }}>
        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Flex align="center" gap="3">
            <Box
              className={integrationsStyles.iconBox}
              style={{
                backgroundColor: item.active ? 'var(--green-3)' : 'var(--gray-4)',
                color: item.active ? 'var(--green-11)' : 'var(--gray-11)',
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
          <Badge
            color={item.active ? 'green' : 'gray'}
            variant="soft"
            size="1"
          >
            {item.active ? 'Активна' : 'Не подключена'}
          </Badge>
        </Flex>
        <Box style={{ flex: 1 }} />
        <Button
          size="2"
          variant={item.active ? 'soft' : 'outline'}
          onClick={handleAction}
          style={{ alignSelf: 'flex-start' }}
        >
          {item.active && item.href ? 'Настроить' : item.active ? 'Настроить' : 'Подключить'}
        </Button>
      </Flex>
    </Card>
  )
}

export default function IntegrationsSettingsPage() {
  return (
    <AppLayout pageTitle="Интеграции">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="2" style={{ display: 'block' }}>
          Интеграции
        </Text>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Подключайте сервисы и настраивайте обмен данными с HR Helper.
        </Text>

        <Grid
          columns={{ initial: '1', sm: '2', md: '3' }}
          gap="4"
          mb="5"
        >
          {INTEGRATIONS.map(item => (
            <IntegrationCard key={item.id} item={item} />
          ))}
        </Grid>

        <Box className={integrationsStyles.moreMessage}>
          <Text size="2" color="gray">
            Скоро появятся другие интеграции.
          </Text>
        </Box>
      </Box>
    </AppLayout>
  )
}
