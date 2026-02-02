/**
 * Admin Users — список пользователей из API в стиле Radix UI.
 * Данные: GET /api/v1/accounts/users/
 */

'use client'

import { Box, Card, Flex, Text, Table, Badge, Button, Section, Callout } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/api'
import { ReloadIcon, PersonIcon } from '@radix-ui/react-icons'

interface ApiUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
  groups: string[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = getApiUrl('accounts/users/')
      const res = await fetch(url, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.message || json?.error || `Ошибка ${res.status}`)
        setUsers([])
        return
      }
      const list = Array.isArray(json?.data) ? json.data : json?.data?.results ?? []
      setUsers(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const formatDate = (s: string | null) => {
    if (!s) return '—'
    try {
      return new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return s
    }
  }

  if (loading) {
    return (
      <Section size="2">
        <Flex align="center" gap="3" py="6">
          <ReloadIcon width={20} height={20} style={{ color: 'var(--gray-9)' }} />
          <Text size="2" color="gray">Загрузка пользователей…</Text>
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
        <Button variant="soft" onClick={loadUsers}>
          <ReloadIcon /> Повторить
        </Button>
      </Section>
    )
  }

  return (
    <Section size="2">
      <Flex justify="between" align="center" mb="4" wrap="wrap" gap="3">
        <Text size="6" weight="bold">Пользователи</Text>
        <Button variant="soft" size="2" onClick={loadUsers} disabled={loading}>
          <ReloadIcon /> Обновить
        </Button>
      </Flex>
      <Card size="2">
        {users.length === 0 ? (
          <Flex direction="column" align="center" gap="3" py="8" px="4">
            <Box style={{ color: 'var(--gray-8)' }}>
              <PersonIcon width={40} height={40} />
            </Box>
            <Text size="2" color="gray">Нет пользователей</Text>
            <Text size="1" color="gray">Данные загружаются из API /api/v1/accounts/users/</Text>
          </Flex>
        ) : (
          <Table.Root size="2">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Пользователь / Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Имя</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Активен</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Роль</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Последний вход</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((u) => (
                <Table.Row key={u.id}>
                  <Table.Cell>
                    <Text weight="medium">{u.username}</Text>
                    <br />
                    <Text size="1" color="gray">{u.email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                  </Table.Cell>
                  <Table.Cell>
                    {u.is_active ? (
                      <Badge color="green">Да</Badge>
                    ) : (
                      <Badge color="gray">Нет</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {u.is_superuser ? (
                      <Badge color="red">Суперпользователь</Badge>
                    ) : u.is_staff ? (
                      <Badge color="blue">Персонал</Badge>
                    ) : (
                      <Text size="1" color="gray">{u.groups?.join(', ') || '—'}</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="1">{formatDate(u.last_login)}</Text>
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
