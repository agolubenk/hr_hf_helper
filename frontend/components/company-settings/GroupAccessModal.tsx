'use client'

import { Fragment } from 'react'
import { Dialog, Flex, Text, Button, Checkbox, ScrollArea, Table, Card } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'

export type AccessRights = Record<string, { view: boolean; edit: boolean }>

export interface Application {
  id: string
  name: string
  description?: string
}

export interface ModuleItem {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

const APP_MODULES: ModuleItem[] = [
  { id: 'home', label: 'Главная', children: [] },
  {
    id: 'vacancies',
    label: 'Вакансии и финансы',
    children: [
      { id: 'vacancies-dashboard', label: 'Дашборд' },
      { id: 'vacancies-list', label: 'Вакансии' },
      { id: 'vacancies-requests', label: 'Заявки' },
      { id: 'vacancies-salary-ranges', label: 'Зарплатные вилки' },
      { id: 'vacancies-benchmarks', label: 'Бенчмарки' },
    ],
  },
  { id: 'recruiting', label: 'Рекрутинг', children: [] },
  { id: 'interviewers', label: 'Интервьюеры', children: [] },
  {
    id: 'integrations',
    label: 'Интеграции',
    children: [
      { id: 'integrations-huntflow', label: 'Huntflow' },
      { id: 'integrations-aichat', label: 'AI Chat' },
      { id: 'integrations-telegram', label: 'Telegram' },
    ],
  },
  { id: 'wiki', label: 'Вики', children: [] },
  {
    id: 'reporting',
    label: 'Отчетность',
    children: [
      { id: 'reporting-main', label: 'Главная' },
      { id: 'reporting-hiring-plan', label: 'План найма' },
      { id: 'reporting-company', label: 'По компании' },
    ],
  },
  {
    id: 'company-settings',
    label: 'Настройки компании',
    children: [
      { id: 'cs-general', label: 'Общие' },
      { id: 'cs-org', label: 'Оргструктура' },
      { id: 'cs-grades', label: 'Грейды' },
      { id: 'cs-finance', label: 'Финансы' },
      { id: 'cs-users', label: 'Пользователи' },
      { id: 'cs-recruiting', label: 'Настройки рекрутинга' },
    ],
  },
]

// Моковые данные приложений
const AVAILABLE_APPLICATIONS: Application[] = [
  { id: 'huntflow', name: 'Huntflow', description: 'ATS система для управления кандидатами' },
  { id: 'telegram', name: 'Telegram', description: 'Интеграция с Telegram для коммуникации' },
  { id: 'notion', name: 'Notion', description: 'Интеграция с Notion для документов' },
  { id: 'clickup', name: 'ClickUp', description: 'Интеграция с ClickUp для задач' },
  { id: 'hhru', name: 'HeadHunter.ru', description: 'Интеграция с HeadHunter' },
]

function getAllIds(): string[] {
  const ids: string[] = []
  for (const m of APP_MODULES) {
    ids.push(m.id)
    for (const c of m.children || []) ids.push(c.id)
  }
  return ids
}

const ALL_IDS = getAllIds()

interface GroupAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  initialApplications?: string[]
  initialAccess: AccessRights | undefined
  onApply: (applications: string[], access: AccessRights) => void
}

export default function GroupAccessModal({
  open,
  onOpenChange,
  groupName,
  initialApplications = [],
  initialAccess,
  onApply,
}: GroupAccessModalProps) {
  const [applications, setApplications] = useState<string[]>(initialApplications)
  const [access, setAccess] = useState<AccessRights>(() => {
    const a: AccessRights = {}
    for (const id of ALL_IDS) {
      const v = initialAccess?.[id]
      a[id] = { view: v?.view ?? false, edit: v?.edit ?? false }
    }
    return a
  })

  useEffect(() => {
    if (open) {
      setApplications(initialApplications)
      const a: AccessRights = {}
      for (const id of ALL_IDS) {
        const v = initialAccess?.[id]
        a[id] = { view: v?.view ?? false, edit: v?.edit ?? false }
      }
      setAccess(a)
    }
  }, [open, initialApplications, initialAccess])

  const toggleApplication = (appId: string) => {
    setApplications(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    )
  }

  const setNode = (id: string, field: 'view' | 'edit', value: boolean) => {
    setAccess((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { view: false, edit: false }), [field]: value },
    }))
  }

  const handleApply = () => {
    onApply(applications, access)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 800 }}>
        <Dialog.Title>Доступы и приложения: {groupName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Настройка доступных приложений и прав доступа по модулям для группы
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Доступные приложения */}
          <Card>
            <Text size="3" weight="bold" mb="3" as="div">Доступные приложения</Text>
            <Text size="2" color="gray" mb="3" as="div">
              Выберите приложения, к которым группа имеет доступ
            </Text>
            <Flex direction="column" gap="2">
              {AVAILABLE_APPLICATIONS.map((app) => (
                <Flex key={app.id} align="center" gap="3" p="2" style={{ 
                  borderRadius: '6px',
                  backgroundColor: applications.includes(app.id) ? 'var(--accent-3)' : 'transparent',
                  border: '1px solid var(--gray-6)'
                }}>
                  <Checkbox
                    checked={applications.includes(app.id)}
                    onCheckedChange={() => toggleApplication(app.id)}
                  />
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="2" weight="medium">{app.name}</Text>
                    {app.description && (
                      <Text size="1" color="gray">{app.description}</Text>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>

          {/* Права доступа */}
          <Card>
            <Text size="3" weight="bold" mb="3" as="div">Права доступа</Text>
            <Text size="2" color="gray" mb="3" as="div">
              Настройка прав просмотра и редактирования по модулям приложения
            </Text>
            <ScrollArea type="auto" style={{ maxHeight: 420 }}>
              <Table.Root size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Модуль / Подприложение</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: 120, textAlign: 'center' }}>Просмотр</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: 140, textAlign: 'center' }}>Редактирование</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {APP_MODULES.map((mod) => (
                    <Fragment key={mod.id}>
                      <Table.Row>
                        <Table.Cell>
                          <Text size="2" weight="medium">{mod.label}</Text>
                        </Table.Cell>
                        <Table.Cell style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={access[mod.id]?.view ?? false}
                            onCheckedChange={(c) => setNode(mod.id, 'view', c === true)}
                          />
                        </Table.Cell>
                        <Table.Cell style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={access[mod.id]?.edit ?? false}
                            onCheckedChange={(c) => setNode(mod.id, 'edit', c === true)}
                          />
                        </Table.Cell>
                      </Table.Row>
                      {(mod.children?.length ?? 0) > 0 &&
                        mod.children!.map((ch) => (
                          <Table.Row key={ch.id}>
                            <Table.Cell style={{ paddingLeft: 24 }}>
                              <Text size="2" color="gray">{ch.label}</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center' }}>
                              <Checkbox
                                checked={access[ch.id]?.view ?? false}
                                onCheckedChange={(c) => setNode(ch.id, 'view', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center' }}>
                              <Checkbox
                                checked={access[ch.id]?.edit ?? false}
                                onCheckedChange={(c) => setNode(ch.id, 'edit', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Fragment>
                  ))}
                </Table.Body>
              </Table.Root>
            </ScrollArea>
          </Card>
        </Flex>

        <Flex gap="2" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              <Cross2Icon width={14} height={14} />
              Отмена
            </Button>
          </Dialog.Close>
          <Button onClick={handleApply}>
            Применить
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
