'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Card, Button, Select, Table, Callout } from "@radix-ui/themes"
import { useRouter } from "next/navigation"
import {
  CheckCircledIcon,
  FileTextIcon,
  PersonIcon,
  Link2Icon,
  StarIcon,
  MixerHorizontalIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './huntflow.module.css'

// Мок: организации Huntflow
const MOCK_HUNTFLOW_ORGS = [
  { id: 291341, name: 'Softnetix' },
]
// Мок: подразделения/офисы в HR Helper
const MOCK_OUR_OFFICES = [
  { id: '1', name: 'Офис Минск' },
  { id: '2', name: 'Офис Варшава' },
]

// —— Этапы найма ——
// Наши этапы (строки таблицы)
const MOCK_OUR_STAGES = [
  { id: '1', name: 'Заявка' },
  { id: '2', name: 'Скрининг' },
  { id: '3', name: 'Интервью' },
  { id: '4', name: 'Оффер' },
  { id: '5', name: 'Принят' },
  { id: '6', name: 'Отказ' },
]
// Этапы в Huntflow (варианты выбора)
const MOCK_HUNTFLOW_STAGES = [
  { id: 101, name: 'Новый' },
  { id: 102, name: 'Скрининг' },
  { id: 103, name: 'Интервью' },
  { id: 104, name: 'Оффер' },
  { id: 105, name: 'Принят' },
  { id: 106, name: 'Отказ' },
  { id: 107, name: 'Архив' },
]

// —— Причины отказа ——
const MOCK_OUR_REJECTION_REASONS = [
  { id: 'r1', name: 'Не подходит по опыту' },
  { id: 'r2', name: 'Зарплатные ожидания' },
  { id: 'r3', name: 'Другая причина' },
]
const MOCK_HF_REJECTION_REASONS = [
  { id: 201, name: 'Опыт не подходит' },
  { id: 202, name: 'ЗП' },
  { id: 203, name: 'Кандидат отказался' },
  { id: 204, name: 'Прочее' },
]

// —— Доп. поля кандидата (разное кол-во: у нас 4, в Huntflow 6) ——
const MOCK_OUR_FIELDS = [
  { id: 'f1', name: 'Ожидания по ЗП' },
  { id: 'f2', name: 'Источник' },
  { id: 'f3', name: 'Готовность к релокации' },
  { id: 'f4', name: 'Грейд' },
]
const MOCK_HF_FIELDS = [
  { id: 301, name: 'Ожидания по ЗП' },
  { id: 302, name: 'Источник' },
  { id: 303, name: 'Релокация' },
  { id: 304, name: 'Уровень' },
  { id: 305, name: 'Ссылка на портфолио' },
  { id: 306, name: 'Комментарий рекрутера' },
]

// —— Источники (у нас 3, в Huntflow 5) ——
const MOCK_OUR_SOURCES = [
  { id: 's1', name: 'hh.ru' },
  { id: 's2', name: 'Рекомендация' },
  { id: 's3', name: 'Прямой отклик' },
]
const MOCK_HF_SOURCES = [
  { id: 401, name: 'HeadHunter' },
  { id: 402, name: 'Рекомендация сотрудника' },
  { id: 403, name: 'Сайт компании' },
  { id: 404, name: 'LinkedIn' },
  { id: 405, name: 'Другое' },
]

const QUICK_LINKS = [
  { label: 'Вакансии', href: '/vacancies', icon: FileTextIcon },
  { label: 'Грейды', href: '/company-settings/grades', icon: StarIcon },
  { label: 'Этапы найма и причины отказа', href: '/company-settings/recruiting/stages', icon: MixerHorizontalIcon },
  { label: 'Дополнительные поля кандидатов', href: '/company-settings/candidate-fields', icon: PersonIcon },
] as const

// Нельзя использовать '' для Select.Item: Radix резервирует пустую строку для сброса
const NONE = '__none__'

export default function HuntflowPage() {
  const router = useRouter()
  const [orgMapping, setOrgMapping] = useState<Record<number, string>>({ [MOCK_HUNTFLOW_ORGS[0].id]: MOCK_OUR_OFFICES[0].id })

  // Этапы: наш этап -> id этапа в Huntflow (строка для Select, '' = не выбрано)
  const [stageMapping, setStageMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_STAGES.map(s => [s.id, String(MOCK_HUNTFLOW_STAGES[0]?.id ?? NONE)]))
  )
  // Причины отказа: наша причина -> id в Huntflow
  const [rejectionMapping, setRejectionMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_REJECTION_REASONS.map(r => [r.id, NONE]))
  )
  // Доп. поля: наше поле -> id в Huntflow
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_FIELDS.map(f => [f.id, NONE]))
  )
  // Источники: наш источник -> id в Huntflow
  const [sourceMapping, setSourceMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_SOURCES.map(s => [s.id, NONE]))
  )

  const isEmpty = (v: string | undefined) => !v || v === NONE || v === ''

  const getHfStageId = (ourId: string) => {
    const v = stageMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }
  const getHfRejectionId = (ourId: string) => {
    const v = rejectionMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }
  const getHfFieldId = (ourId: string) => {
    const v = fieldMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }
  const getHfSourceId = (ourId: string) => {
    const v = sourceMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }

  return (
    <AppLayout pageTitle="Huntflow">
      <Box className={styles.container}>
        {/* Статус и быстрые ссылки */}
        <Flex gap="4" wrap="wrap" className={styles.topRow}>
          <Card className={styles.statusCard} style={{ flex: 1, minWidth: '260px' }}>
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <CheckCircledIcon width={24} height={24} style={{ color: 'var(--green-9)' }} />
                <Text size="4" weight="bold">Подключение активно</Text>
              </Flex>
              <Text size="2" color="gray">API: https://api.huntflow.ru/v2</Text>
            </Flex>
          </Card>
          <Card className={styles.quickLinksCard} style={{ flex: 2, minWidth: '320px' }}>
            <Flex align="center" gap="2" mb="3">
              <ExternalLinkIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
              <Text size="4" weight="bold">Быстрые ссылки</Text>
            </Flex>
            <Flex gap="2" wrap="wrap">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Button key={href} size="2" variant="soft" onClick={() => router.push(href)}>
                  <Icon width={16} height={16} />
                  {label}
                </Button>
              ))}
            </Flex>
          </Card>
        </Flex>

        <Card className={styles.formCard}>
          <Flex align="center" gap="2" mb="4">
            <Link2Icon width={22} height={22} style={{ color: 'var(--accent-9)' }} />
            <Text size="4" weight="bold">Связи Huntflow ↔ HR Helper</Text>
          </Flex>

          {/* 1. Организация ↔ Офис */}
          <Box mb="5">
            <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
              Организация Huntflow → Подразделение / офис в HR Helper
            </Text>
            <Flex gap="3" wrap="wrap" align="end">
              {MOCK_HUNTFLOW_ORGS.map(org => (
                <Flex key={org.id} align="center" gap="2">
                  <Text size="2" color="gray">{org.name}</Text>
                  <span style={{ color: 'var(--gray-8)' }}>→</span>
                  <Select.Root value={orgMapping[org.id] || ''} onValueChange={v => setOrgMapping(m => ({ ...m, [org.id]: v }))}>
                    <Select.Trigger placeholder="Выберите офис" style={{ minWidth: 180 }} />
                    <Select.Content>
                      {MOCK_OUR_OFFICES.map(o => (
                        <Select.Item key={o.id} value={o.id}>{o.name}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* 2. Этапы найма: Этап найма | Этап в Huntflow (выбор) | ID этапа в Huntflow */}
          <Box mb="5">
            <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
              Этапы найма → Этапы в Huntflow
            </Text>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Этап найма</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Этап найма в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID этапа в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_OUR_STAGES.map(s => {
                  const hfId = getHfStageId(s.id)
                  return (
                    <Table.Row key={s.id}>
                      <Table.Cell>{s.name}</Table.Cell>
                      <Table.Cell>
                        <Select.Root
                          value={stageMapping[s.id] || NONE}
                          onValueChange={v => setStageMapping(m => ({ ...m, [s.id]: v }))}
                        >
                          <Select.Trigger placeholder="—" style={{ minWidth: 180 }} />
                          <Select.Content>
                            <Select.Item value={NONE}>—</Select.Item>
                            {MOCK_HUNTFLOW_STAGES.map(h => (
                              <Select.Item key={h.id} value={String(h.id)}>{h.name}</Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* 3. Причины отказа: Причина отказа | Причина в Huntflow (выбор) | ID в Huntflow */}
          <Box mb="5">
            <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
              Причины отказа → Причины в Huntflow
            </Text>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Причина отказа</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Причина в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_OUR_REJECTION_REASONS.map(r => {
                  const hfId = getHfRejectionId(r.id)
                  return (
                    <Table.Row key={r.id}>
                      <Table.Cell>{r.name}</Table.Cell>
                      <Table.Cell>
                        <Select.Root
                          value={rejectionMapping[r.id] || NONE}
                          onValueChange={v => setRejectionMapping(m => ({ ...m, [r.id]: v }))}
                        >
                          <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                          <Select.Content>
                            <Select.Item value={NONE}>—</Select.Item>
                            {MOCK_HF_REJECTION_REASONS.map(h => (
                              <Select.Item key={h.id} value={String(h.id)}>{h.name}</Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* 4. Доп. поля: все наши + все Huntflow */}
          <Box mb="5">
            <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
              Дополнительные поля кандидата: наши поля → Huntflow
            </Text>
            <Table.Root size="1" mb="4">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Наше поле</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Поле в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_OUR_FIELDS.map(f => {
                  const hfId = getHfFieldId(f.id)
                  return (
                    <Table.Row key={f.id}>
                      <Table.Cell>{f.name}</Table.Cell>
                      <Table.Cell>
                        <Select.Root value={fieldMapping[f.id] || NONE} onValueChange={v => setFieldMapping(m => ({ ...m, [f.id]: v }))}>
                          <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                          <Select.Content>
                            <Select.Item value={NONE}>—</Select.Item>
                            {MOCK_HF_FIELDS.map(h => (
                              <Select.Item key={h.id} value={String(h.id)}>{h.name}</Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
            <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
              Все поля в Huntflow (справочно)
            </Text>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Поле в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_HF_FIELDS.map(h => (
                  <Table.Row key={h.id}>
                    <Table.Cell>{h.name}</Table.Cell>
                    <Table.Cell>{h.id}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* 5. Источники: наш источник | источник в Huntflow (выбор) | ID в Huntflow + все в Huntflow */}
          <Box mb="5">
            <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
              Источники: наши → Huntflow
            </Text>
            <Table.Root size="1" mb="4">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Наш источник</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Источник в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_OUR_SOURCES.map(s => {
                  const hfId = getHfSourceId(s.id)
                  return (
                    <Table.Row key={s.id}>
                      <Table.Cell>{s.name}</Table.Cell>
                      <Table.Cell>
                        <Select.Root value={sourceMapping[s.id] || NONE} onValueChange={v => setSourceMapping(m => ({ ...m, [s.id]: v }))}>
                          <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                          <Select.Content>
                            <Select.Item value={NONE}>—</Select.Item>
                            {MOCK_HF_SOURCES.map(h => (
                              <Select.Item key={h.id} value={String(h.id)}>{h.name}</Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
            <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
              Все источники в Huntflow (справочно)
            </Text>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Источник в Huntflow</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MOCK_HF_SOURCES.map(h => (
                  <Table.Row key={h.id}>
                    <Table.Cell>{h.name}</Table.Cell>
                    <Table.Cell>{h.id}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Callout.Root size="1" variant="soft" color="blue">
            <Callout.Text>
              Настройте грейды, этапы найма, причины отказа, доп. поля и источники в соответствующих разделах, если нужных значений ещё нет.
            </Callout.Text>
          </Callout.Root>
          <Flex justify="end" mt="4">
            <Button size="3" onClick={() => { /* TODO: сохранить на бэк */ }}>Сохранить связи</Button>
          </Flex>
        </Card>
      </Box>
    </AppLayout>
  )
}
