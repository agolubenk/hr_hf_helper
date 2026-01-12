'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Button, Card } from "@radix-ui/themes"
import { CheckCircledIcon, HomeIcon, LightningBoltIcon, PlusIcon, PersonIcon, FileTextIcon } from "@radix-ui/react-icons"
import styles from './huntflow.module.css'

interface Organization {
  id: number
  name: string
}

// Моковые данные
const mockOrganizations: Organization[] = [
  {
    id: 291341,
    name: 'Softnetix'
  }
]

export default function HuntflowPage() {
  const isConnected = true
  const system = 'prod'
  const apiUrl = 'https://api.huntflow.ru/v2'
  const organizationsCount = mockOrganizations.length

  return (
    <AppLayout pageTitle="Huntflow">
      <Box className={styles.container}>
        {/* Статус подключения и организации */}
        <Flex gap="4" mb="4" wrap="wrap">
          {/* Карточка статуса подключения */}
          <Card className={styles.statusCard} style={{ flex: 1, minWidth: '300px' }}>
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <CheckCircledIcon width={24} height={24} style={{ color: '#10b981' }} />
                <Text size="4" weight="bold">Подключение активно</Text>
              </Flex>
              <Box>
                <Text size="2" color="gray" mb="1" style={{ display: 'block' }}>
                  Система: {system}
                </Text>
                <Text size="2" color="gray" mb="1" style={{ display: 'block' }}>
                  URL: <Text style={{ color: 'var(--accent-9)' }}>{apiUrl}</Text>
                </Text>
              </Box>
            </Flex>
          </Card>

          {/* Карточка организаций */}
          <Card className={styles.statusCard} style={{ flex: 1, minWidth: '300px' }}>
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <HomeIcon width={24} height={24} style={{ color: 'var(--accent-9)' }} />
                <Text size="4" weight="bold">Организации</Text>
              </Flex>
              <Text size="3" weight="medium">
                Доступно: {organizationsCount} {organizationsCount === 1 ? 'организация' : organizationsCount < 5 ? 'организации' : 'организаций'}
              </Text>
            </Flex>
          </Card>
        </Flex>

        {/* Быстрые действия */}
        <Card className={styles.actionsCard} mb="4">
          <Flex align="center" gap="2" mb="3">
            <LightningBoltIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
            <Text size="4" weight="bold">Быстрые действия</Text>
          </Flex>
          <Button
            size="3"
            variant="solid"
            onClick={() => {
              // TODO: Реализовать создание кандидата
              alert('Создание кандидата будет реализовано')
            }}
          >
            <Flex align="center" gap="2">
              <PlusIcon width={16} height={16} />
              <PersonIcon width={16} height={16} />
            </Flex>
            Создать кандидата
          </Button>
        </Card>

        {/* Доступные организации */}
        <Box>
          <Box className={styles.organizationsHeader}>
            <Flex align="center" gap="2">
              <HomeIcon width={20} height={20} style={{ color: '#ffffff' }} />
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>
                Доступные организации
              </Text>
            </Flex>
          </Box>

          {mockOrganizations.map(org => (
            <Card key={org.id} className={styles.organizationCard}>
              <Flex direction="column" gap="3">
                <Flex direction="column" gap="1">
                  <Text size="5" weight="bold">{org.name}</Text>
                  <Text size="2" color="gray">ID: {org.id}</Text>
                </Flex>
                <Flex direction="column" gap="2">
                  <Button
                    size="3"
                    variant="solid"
                    onClick={() => {
                      // TODO: Реализовать переход к вакансиям
                      alert(`Вакансии организации ${org.name}`)
                    }}
                  >
                    <FileTextIcon width={16} height={16} />
                    Вакансии
                  </Button>
                  <Button
                    size="3"
                    variant="soft"
                    onClick={() => {
                      // TODO: Реализовать переход к кандидатам
                      alert(`Кандидаты организации ${org.name}`)
                    }}
                  >
                    <PersonIcon width={16} height={16} />
                    Кандидаты
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Box>
      </Box>
    </AppLayout>
  )
}
