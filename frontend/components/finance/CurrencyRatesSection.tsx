'use client'

import { Box, Flex, Text, Button, Table, Badge, Callout } from "@radix-ui/themes"
import { ReloadIcon, CheckIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './CurrencyRatesSection.module.css'

interface CurrencyRate {
  id: number
  code: string
  rate: string
  scale: number
  fetched_at: string
  status_info?: string
  display_rate?: string
}

// Моковые данные
const mockRates: CurrencyRate[] = [
  {
    id: 1,
    code: 'BYN',
    rate: '1.000000',
    scale: 1,
    fetched_at: '2025-01-18T17:11:00Z',
    status_info: 'Базовая валюта',
    display_rate: '1.000000 BYN'
  },
  {
    id: 2,
    code: 'EUR',
    rate: '3.459900',
    scale: 1,
    fetched_at: '2026-01-08T12:16:00Z',
    status_info: 'Вчера',
    display_rate: '3.459900 BYN'
  },
  {
    id: 3,
    code: 'PLN',
    rate: '0.850000',
    scale: 10,
    fetched_at: '2026-01-08T12:16:00Z',
    status_info: 'Вчера',
    display_rate: '0.850000 BYN'
  },
  {
    id: 4,
    code: 'USD',
    rate: '3.250000',
    scale: 1,
    fetched_at: '2026-01-08T12:16:00Z',
    status_info: 'Вчера',
    display_rate: '3.250000 BYN'
  },
]

export default function CurrencyRatesSection() {
  const [rates, setRates] = useState<CurrencyRate[]>(mockRates)
  const [updating, setUpdating] = useState(false)

  const handleUpdateRates = () => {
    setUpdating(true)
    setTimeout(() => {
      // Имитация обновления - обновляем дату
      setRates(rates.map(rate => ({
        ...rate,
        fetched_at: new Date().toISOString(),
        status_info: rate.code === 'BYN' ? 'Базовая валюта' : 'Сегодня'
      })))
      setUpdating(false)
      alert('Курсы валют успешно обновлены')
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (rate: CurrencyRate) => {
    if (rate.code === 'BYN') {
      return <Badge color="blue">Базовая валюта</Badge>
    }
    
    const fetchedDate = new Date(rate.fetched_at)
    const now = new Date()
    const diffHours = (now.getTime() - fetchedDate.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return <Badge color="green">Сегодня</Badge>
    } else if (diffHours < 48) {
      return <Badge color="orange">Вчера</Badge>
    } else {
      return <Badge color="red">Устарело</Badge>
    }
  }

  return (
    <Box className={styles.section}>
      <Flex justify="between" align="center" className={styles.header}>
        <Flex align="center" gap="2">
          <ReloadIcon width={20} height={20} />
          <Text size="5" weight="bold">Курсы валют НБРБ</Text>
        </Flex>
        <Button
          size="2"
          onClick={handleUpdateRates}
          disabled={updating}
        >
          <ReloadIcon width={16} height={16} className={updating ? styles.spinning : ''} />
          {updating ? 'Обновление...' : 'Обновить валюты'}
        </Button>
      </Flex>

      <Table.Root className={styles.table}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Валюта</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Курс</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Масштаб</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Последнее обновление</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rates.map((rate) => (
            <Table.Row key={rate.id}>
              <Table.Cell>
                <Text weight="medium">{rate.code}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text>{rate.display_rate || `${rate.rate} BYN`}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text>{rate.scale}</Text>
              </Table.Cell>
              <Table.Cell>
                {getStatusBadge(rate)}
              </Table.Cell>
              <Table.Cell>
                <Text size="2" color="gray">
                  {formatDate(rate.fetched_at)}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Callout.Root className={styles.infoBox}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Flex direction="column" gap="3">
            <Flex gap="4" style={{ flexWrap: 'wrap' }}>
              {/* Левая колонка - Источник данных */}
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="bold" style={{ display: 'block', marginBottom: '8px' }}>
                  Источник данных:
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <CheckIcon width={16} height={16} color="var(--green-9)" />
                    <Text size="2">НБРБ (Национальный банк Республики Беларусь)</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <CheckIcon width={16} height={16} color="var(--green-9)" />
                    <Text size="2">Официальные курсы валют</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <CheckIcon width={16} height={16} color="var(--green-9)" />
                    <Text size="2">Автоматическое обновление</Text>
                  </Flex>
                </Flex>
              </Box>

              {/* Правая колонка - Поддерживаемые валюты */}
              <Box style={{ flex: '1 1 300px' }}>
                <Text size="2" weight="bold" style={{ display: 'block', marginBottom: '8px' }}>
                  Поддерживаемые валюты:
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <Text size="2" style={{ width: '16px', textAlign: 'center' }}>🪙</Text>
                    <Text size="2">BYN - Белорусский рубль (базовая валюта)</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Text size="2" style={{ width: '16px', textAlign: 'center' }}>$</Text>
                    <Text size="2">USD - Доллар США</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Text size="2" style={{ width: '16px', textAlign: 'center' }}>🪙</Text>
                    <Text size="2">PLN - Польский злотый</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            {/* Информация об обновлении */}
            <Box style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--gray-a6)' }}>
              <Flex align="center" gap="2">
                <ReloadIcon width={16} height={16} />
                <Text size="2">
                  Курсы валют обновляются автоматически из НБРБ. При недоступности НБРБ используются fallback значения. 
                  Вы также можете обновить курсы валют вручную, используя кнопку "Обновить валюты" выше.
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Callout.Text>
      </Callout.Root>
    </Box>
  )
}
