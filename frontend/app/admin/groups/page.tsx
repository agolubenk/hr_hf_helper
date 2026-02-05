/**
 * Admin Groups — список групп из API в стиле Radix UI.
 * Данные: GET /api/v1/accounts/groups/
 */

'use client'

import { Box, Card, Flex, Text, Table, Button, Section, Callout } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/api'
import { ReloadIcon, GearIcon } from '@radix-ui/react-icons'

interface ApiGroup {
  id: number
  name: string
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGroups = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = getApiUrl('accounts/groups/')
      const res = await fetch(url, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.message || json?.error || `Ошибка ${res.status}`)
        setGroups([])
        return
      }
      const list = Array.isArray(json?.data) ? json.data : json?.data?.results ?? []
      setGroups(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  if (loading) {
    return (
      <Section size="2">
        <Flex align="center" gap="3" py="6">
          <ReloadIcon width={20} height={20} style={{ color: 'var(--gray-9)' }} />
          <Text size="2" color="gray">Загрузка групп…</Text>
        </Flex>
      </Section>
    )
  }

  if (error) {
    return (
      <Section size="2">
        <Callout.Root color="red" size="2" mb="4">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
        <Button variant="soft" onClick={loadGroups}>
          <ReloadIcon /> Повторить
        </Button>
      </Section>
    )
  }

  return (
    <Section size="2">
      <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
        <Text size="6" weight="bold">Группы</Text>
        <Button variant="soft" size="2" onClick={loadGroups} disabled={loading}>
          <ReloadIcon /> Обновить
        </Button>
      </Flex>
      <Card size="2">
        {groups.length === 0 ? (
          <Flex direction="column" align="center" gap="3" py="8" px="4">
            <Box style={{ color: 'var(--gray-8)' }}>
              <GearIcon width={40} height={40} />
            </Box>
            <Text size="2" color="gray">Групп пока нет</Text>
            <Text size="1" color="gray">Данные из API /api/v1/accounts/groups/. Группы можно создать в Django admin (backend) или через API.</Text>
          </Flex>
        ) : (
          <Table.Root size="2">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((g) => (
                <Table.Row key={g.id}>
                  <Table.Cell>{g.id}</Table.Cell>
                  <Table.Cell>
                    <Text weight="medium">{g.name}</Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Card>
    </Section>
  )
}
