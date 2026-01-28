/**
 * HuntflowPage (huntflow/page.tsx) - Страница настройки интеграции с Huntflow
 * 
 * Назначение:
 * - Настройка маппинга данных между HR Helper и Huntflow
 * - Маппинг организаций Huntflow на офисы HR Helper
 * - Маппинг этапов найма
 * - Маппинг причин отказа
 * - Маппинг дополнительных полей кандидатов
 * - Маппинг источников кандидатов
 * 
 * Функциональность:
 * - Маппинг организаций: связь организаций Huntflow с офисами HR Helper
 * - Маппинг этапов найма: связь этапов HR Helper с этапами Huntflow
 * - Маппинг причин отказа: связь причин отказа HR Helper с причинами Huntflow
 * - Маппинг полей кандидатов: связь дополнительных полей HR Helper с полями Huntflow
 * - Маппинг источников: связь источников HR Helper с источниками Huntflow
 * - Быстрые ссылки на связанные страницы настроек
 * - Отображение статуса подключения интеграции
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации к страницам настроек
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * - Страницы настроек: вакансии, грейды, этапы найма, поля кандидатов
 * 
 * Поведение:
 * - При загрузке отображает текущие маппинги
 * - При изменении маппинга обновляет состояние
 * - При сохранении отправляет маппинги на сервер
 * - Маппинги используются при синхронизации данных с Huntflow
 * 
 * TODO: Реализовать сохранение маппингов на сервер
 * TODO: Заменить моковые данные на реальные из API
 */

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

/**
 * MOCK_HUNTFLOW_ORGS - моковые данные организаций Huntflow
 * 
 * Используется для:
 * - Маппинга организаций Huntflow на офисы HR Helper
 * - Отображения списка доступных организаций
 * 
 * TODO: Загружать из API Huntflow
 */
const MOCK_HUNTFLOW_ORGS = [
  { id: 291341, name: 'Softnetix' },
]

/**
 * MOCK_OUR_OFFICES - моковые данные офисов HR Helper
 * 
 * Используется для:
 * - Маппинга офисов HR Helper на организации Huntflow
 * - Отображения списка доступных офисов
 * 
 * TODO: Загружать из настроек компании
 */
const MOCK_OUR_OFFICES = [
  { id: '1', name: 'Офис Минск' },
  { id: '2', name: 'Офис Варшава' },
]

/**
 * MOCK_OUR_STAGES - этапы найма в HR Helper (строки таблицы маппинга)
 * 
 * Используется для:
 * - Отображения этапов HR Helper в таблице маппинга
 * - Связи этапов HR Helper с этапами Huntflow
 * 
 * TODO: Загружать из настроек компании (company-settings/recruiting/stages)
 */
const MOCK_OUR_STAGES = [
  { id: '1', name: 'Заявка' },
  { id: '2', name: 'Скрининг' },
  { id: '3', name: 'Интервью' },
  { id: '4', name: 'Оффер' },
  { id: '5', name: 'Принят' },
  { id: '6', name: 'Отказ' },
]

/**
 * MOCK_HUNTFLOW_STAGES - этапы найма в Huntflow (варианты выбора для маппинга)
 * 
 * Используется для:
 * - Отображения доступных этапов Huntflow для маппинга
 * - Выбора этапа Huntflow для связи с этапом HR Helper
 * 
 * TODO: Загружать из API Huntflow
 */
const MOCK_HUNTFLOW_STAGES = [
  { id: 101, name: 'Новый' },
  { id: 102, name: 'Скрининг' },
  { id: 103, name: 'Интервью' },
  { id: 104, name: 'Оффер' },
  { id: 105, name: 'Принят' },
  { id: 106, name: 'Отказ' },
  { id: 107, name: 'Архив' },
]

/**
 * MOCK_OUR_REJECTION_REASONS - причины отказа в HR Helper
 * 
 * Используется для:
 * - Отображения причин отказа HR Helper в таблице маппинга
 * - Связи причин отказа HR Helper с причинами Huntflow
 * 
 * TODO: Загружать из настроек компании (company-settings/recruiting/stages)
 */
const MOCK_OUR_REJECTION_REASONS = [
  { id: 'r1', name: 'Не подходит по опыту' },
  { id: 'r2', name: 'Зарплатные ожидания' },
  { id: 'r3', name: 'Другая причина' },
]

/**
 * MOCK_HF_REJECTION_REASONS - причины отказа в Huntflow
 * 
 * Используется для:
 * - Отображения доступных причин отказа Huntflow для маппинга
 * - Выбора причины отказа Huntflow для связи с причиной HR Helper
 * 
 * TODO: Загружать из API Huntflow
 */
const MOCK_HF_REJECTION_REASONS = [
  { id: 201, name: 'Опыт не подходит' },
  { id: 202, name: 'ЗП' },
  { id: 203, name: 'Кандидат отказался' },
  { id: 204, name: 'Прочее' },
]

/**
 * MOCK_OUR_FIELDS - дополнительные поля кандидата в HR Helper
 * 
 * Используется для:
 * - Отображения полей HR Helper в таблице маппинга
 * - Связи полей HR Helper с полями Huntflow
 * 
 * TODO: Загружать из настроек компании (company-settings/candidate-fields)
 */
const MOCK_OUR_FIELDS = [
  { id: 'f1', name: 'Ожидания по ЗП' },
  { id: 'f2', name: 'Источник' },
  { id: 'f3', name: 'Готовность к релокации' },
  { id: 'f4', name: 'Грейд' },
]

/**
 * MOCK_HF_FIELDS - дополнительные поля кандидата в Huntflow
 * 
 * Используется для:
 * - Отображения доступных полей Huntflow для маппинга
 * - Выбора поля Huntflow для связи с полем HR Helper
 * 
 * TODO: Загружать из API Huntflow
 */
const MOCK_HF_FIELDS = [
  { id: 301, name: 'Ожидания по ЗП' },
  { id: 302, name: 'Источник' },
  { id: 303, name: 'Релокация' },
  { id: 304, name: 'Уровень' },
  { id: 305, name: 'Ссылка на портфолио' },
  { id: 306, name: 'Комментарий рекрутера' },
]

/**
 * MOCK_OUR_SOURCES - источники кандидатов в HR Helper
 * 
 * Используется для:
 * - Отображения источников HR Helper в таблице маппинга
 * - Связи источников HR Helper с источниками Huntflow
 * 
 * TODO: Загружать из настроек компании
 */
const MOCK_OUR_SOURCES = [
  { id: 's1', name: 'hh.ru' },
  { id: 's2', name: 'Рекомендация' },
  { id: 's3', name: 'Прямой отклик' },
]

/**
 * MOCK_HF_SOURCES - источники кандидатов в Huntflow
 * 
 * Используется для:
 * - Отображения доступных источников Huntflow для маппинга
 * - Выбора источника Huntflow для связи с источником HR Helper
 * 
 * TODO: Загружать из API Huntflow
 */
const MOCK_HF_SOURCES = [
  { id: 401, name: 'HeadHunter' },
  { id: 402, name: 'Рекомендация сотрудника' },
  { id: 403, name: 'Сайт компании' },
  { id: 404, name: 'LinkedIn' },
  { id: 405, name: 'Другое' },
]

/**
 * QUICK_LINKS - быстрые ссылки на связанные страницы настроек
 * 
 * Используется для:
 * - Быстрого перехода к страницам, связанным с настройкой маппинга
 * - Удобной навигации между настройками
 */
const QUICK_LINKS = [
  { label: 'Вакансии', href: '/vacancies', icon: FileTextIcon },
  { label: 'Грейды', href: '/company-settings/grades', icon: StarIcon },
  { label: 'Этапы найма и причины отказа', href: '/company-settings/recruiting/stages', icon: MixerHorizontalIcon },
  { label: 'Дополнительные поля кандидатов', href: '/company-settings/candidate-fields', icon: PersonIcon },
] as const

/**
 * NONE - константа для обозначения "не выбрано" в Select
 * 
 * Используется для:
 * - Обозначения отсутствия маппинга
 * - Radix UI Select не позволяет использовать пустую строку для сброса
 * 
 * Причина:
 * - Radix UI резервирует пустую строку для сброса значения Select
 * - Используем специальное значение '__none__' для обозначения "не выбрано"
 */
const NONE = '__none__'

/**
 * HuntflowPage - компонент страницы настройки интеграции с Huntflow
 * 
 * Состояние:
 * - orgMapping: маппинг организаций Huntflow на офисы HR Helper (ключ - ID организации, значение - ID офиса)
 * - stageMapping: маппинг этапов найма (ключ - ID этапа HR Helper, значение - ID этапа Huntflow)
 * - rejectionMapping: маппинг причин отказа (ключ - ID причины HR Helper, значение - ID причины Huntflow)
 * - fieldMapping: маппинг дополнительных полей (ключ - ID поля HR Helper, значение - ID поля Huntflow)
 * - sourceMapping: маппинг источников (ключ - ID источника HR Helper, значение - ID источника Huntflow)
 */
export default function HuntflowPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()
  /**
   * orgMapping - маппинг организаций Huntflow на офисы HR Helper
   * 
   * Структура:
   * - Ключ: ID организации в Huntflow (number)
   * - Значение: ID офиса в HR Helper (string)
   * 
   * Инициализируется с первым офисом для первой организации
   */
  const [orgMapping, setOrgMapping] = useState<Record<number, string>>({ [MOCK_HUNTFLOW_ORGS[0].id]: MOCK_OUR_OFFICES[0].id })

  /**
   * stageMapping - маппинг этапов найма HR Helper на этапы Huntflow
   * 
   * Структура:
   * - Ключ: ID этапа в HR Helper (string)
   * - Значение: ID этапа в Huntflow (string, может быть NONE)
   * 
   * Инициализируется с первым этапом Huntflow для всех этапов HR Helper
   */
  const [stageMapping, setStageMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_STAGES.map(s => [s.id, String(MOCK_HUNTFLOW_STAGES[0]?.id ?? NONE)]))
  )
  /**
   * rejectionMapping - маппинг причин отказа HR Helper на причины Huntflow
   * 
   * Структура:
   * - Ключ: ID причины в HR Helper (string)
   * - Значение: ID причины в Huntflow (string, может быть NONE)
   * 
   * Инициализируется с NONE (не выбрано) для всех причин
   */
  const [rejectionMapping, setRejectionMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_REJECTION_REASONS.map(r => [r.id, NONE]))
  )
  /**
   * fieldMapping - маппинг дополнительных полей кандидата HR Helper на поля Huntflow
   * 
   * Структура:
   * - Ключ: ID поля в HR Helper (string)
   * - Значение: ID поля в Huntflow (string, может быть NONE)
   * 
   * Инициализируется с NONE (не выбрано) для всех полей
   */
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_FIELDS.map(f => [f.id, NONE]))
  )
  /**
   * sourceMapping - маппинг источников кандидатов HR Helper на источники Huntflow
   * 
   * Структура:
   * - Ключ: ID источника в HR Helper (string)
   * - Значение: ID источника в Huntflow (string, может быть NONE)
   * 
   * Инициализируется с NONE (не выбрано) для всех источников
   */
  const [sourceMapping, setSourceMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_SOURCES.map(s => [s.id, NONE]))
  )

  /**
   * isEmpty - проверка, является ли значение пустым или "не выбрано"
   * 
   * Функциональность:
   * - Проверяет, является ли значение пустой строкой, undefined или NONE
   * 
   * Используется для:
   * - Определения, установлен ли маппинг
   * - Валидации маппингов перед отправкой на сервер
   * 
   * @param v - значение для проверки
   * @returns true если значение пустое или NONE, иначе false
   */
  const isEmpty = (v: string | undefined) => !v || v === NONE || v === ''

  /**
   * getHfStageId - получение ID этапа Huntflow для этапа HR Helper
   * 
   * Функциональность:
   * - Получает ID этапа Huntflow из маппинга
   * - Преобразует строку в число
   * - Возвращает null если маппинг не установлен
   * 
   * Используется для:
   * - Синхронизации этапов при отправке данных в Huntflow
   * 
   * @param ourId - ID этапа в HR Helper
   * @returns ID этапа в Huntflow или null
   */
  const getHfStageId = (ourId: string) => {
    const v = stageMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }

  /**
   * getHfRejectionId - получение ID причины отказа Huntflow для причины HR Helper
   * 
   * Функциональность:
   * - Получает ID причины отказа Huntflow из маппинга
   * - Преобразует строку в число
   * - Возвращает null если маппинг не установлен
   * 
   * Используется для:
   * - Синхронизации причин отказа при отправке данных в Huntflow
   * 
   * @param ourId - ID причины отказа в HR Helper
   * @returns ID причины отказа в Huntflow или null
   */
  const getHfRejectionId = (ourId: string) => {
    const v = rejectionMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }

  /**
   * getHfFieldId - получение ID поля Huntflow для поля HR Helper
   * 
   * Функциональность:
   * - Получает ID поля Huntflow из маппинга
   * - Преобразует строку в число
   * - Возвращает null если маппинг не установлен
   * 
   * Используется для:
   * - Синхронизации полей кандидата при отправке данных в Huntflow
   * 
   * @param ourId - ID поля в HR Helper
   * @returns ID поля в Huntflow или null
   */
  const getHfFieldId = (ourId: string) => {
    const v = fieldMapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }

  /**
   * getHfSourceId - получение ID источника Huntflow для источника HR Helper
   * 
   * Функциональность:
   * - Получает ID источника Huntflow из маппинга
   * - Преобразует строку в число
   * - Возвращает null если маппинг не установлен
   * 
   * Используется для:
   * - Синхронизации источников кандидатов при отправке данных в Huntflow
   * 
   * @param ourId - ID источника в HR Helper
   * @returns ID источника в Huntflow или null
   */
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
