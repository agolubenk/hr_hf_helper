'use client'

import { Fragment } from 'react'
import { Dialog, Flex, Text, Button, Checkbox, ScrollArea, Table } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'

export type AccessRights = Record<string, { view: boolean; edit: boolean }>

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

function getAllIds(): string[] {
  const ids: string[] = []
  for (const m of APP_MODULES) {
    ids.push(m.id)
    for (const c of m.children || []) ids.push(c.id)
  }
  return ids
}

const ALL_IDS = getAllIds()

interface UserAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  initialAccess: AccessRights | undefined
  onApply: (access: AccessRights) => void
}

export default function UserAccessModal({
  open,
  onOpenChange,
  userName,
  initialAccess,
  onApply,
}: UserAccessModalProps) {
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
      const a: AccessRights = {}
      for (const id of ALL_IDS) {
        const v = initialAccess?.[id]
        a[id] = { view: v?.view ?? false, edit: v?.edit ?? false }
      }
      setAccess(a)
    }
  }, [open, initialAccess])

  const setNode = (id: string, field: 'view' | 'edit', value: boolean) => {
    setAccess((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { view: false, edit: false }), [field]: value },
    }))
  }

  const handleApply = () => {
    onApply(access)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 560 }}>
        <Dialog.Title>Доступы: {userName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Возможность просмотра и редактирования по модулям приложения
        </Dialog.Description>

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
