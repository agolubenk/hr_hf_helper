/**
 * WorkflowHeader (components/workflow/WorkflowHeader.tsx) - Заголовок страницы workflow (скрининг/интервью)
 * 
 * Назначение:
 * - Управление процессом скрининга и интервью
 * - Выбор типа процесса (динамические кнопки на основе этапов найма)
 * - Выбор вакансии
 * - Настройка параметров встреч (формат, интервьюеры, офис)
 * - Быстрые действия (ссылки на коммуникацию, календарь, вакансия, слоты)
 * 
 * Функциональность:
 * - Быстрые кнопки: ссылки на коммуникацию (Telegram, WhatsApp, Viber, LinkedIn, Email)
 * - Тогглер типа процесса: динамические кнопки на основе этапов найма с меткой "встреча"
 *   - Количество кнопок: 0 и более (зависит от количества этапов с isMeeting = true)
 *   - Названия кнопок: берутся из названий этапов найма, отмеченных чекбоксом "встреча"
 *   - Если этапов-встреч нет, тогглер может быть пустым или содержать только системные опции
 * - Выбор вакансии: выпадающий список с вакансиями
 * - Выбор офиса: тогглер офисов (Минск, Варшава, Гомель)
 * - Кнопки управления: Календарь, Вакансия, Свободные слоты, Обновить
 * - Настройки встречи (для этапов с isMeeting = true):
 *   - Формат встречи: Онлайн / Офис (отображается если showOffices = true)
 *   - Выбор интервьюеров: чекбоксы для выбора нескольких интервьюеров (отображается если showInterviewers = true)
 *   - Выбор офиса: появляется после выбора формата "Офис", если showOffices = true
 * 
 * Связи:
 * - workflow/page.tsx: используется на странице workflow
 * - SlotsPanel: открывается при клике на кнопку "слоты"
 * - Google Calendar: переход к календарю
 * - Huntflow: переход к вакансии
 * - /company-settings/recruiting/stages: этапы найма с настройками встреч
 * 
 * Поведение:
 * - При загрузке компонента загружаются этапы найма с isMeeting = true
 * - Тогглер типа процесса динамически формируется из этапов-встреч
 * - При выборе этапа-встречи показывается панель настроек встречи
 * - В зависимости от настроек этапа (showOffices, showInterviewers) отображаются соответствующие элементы
 * - При выборе формата "Офис" и showOffices = true показывается выбор офиса
 * - При клике на "слоты" открывает/закрывает панель слотов
 * - Быстрые кнопки открывают соответствующие сервисы в новой вкладке
 * 
 * Настройки этапов-встреч:
 * - isMeeting: метка "встреча" для этапа
 * - showOffices: отображать ли выбор офисов (да/нет)
 * - showInterviewers: отображать ли выбор интервьюеров (да/нет)
 * 
 * Эти настройки задаются на странице /company-settings/recruiting/stages в модальном окне редактирования этапа.
 */
'use client'

import { Flex, Box, Text, Button, Select, Checkbox, Separator } from "@radix-ui/themes"
import {
  CalendarIcon,
  ReloadIcon,
  OpenInNewWindowIcon,
  BoxIcon,
  ClockIcon,
  CheckIcon,
  PersonIcon,
  ClipboardIcon,
  VideoIcon,
  Link2Icon,
} from "@radix-ui/react-icons"
import { useState } from "react"
import styles from './WorkflowHeader.module.css'

/**
 * WorkflowHeaderProps - интерфейс пропсов компонента WorkflowHeader
 * 
 * Структура:
 * - onSlotsClick: обработчик клика на кнопку "слоты" (открытие/закрытие панели слотов)
 * - slotsOpen: флаг открытости панели слотов
 */
interface WorkflowHeaderProps {
  onSlotsClick: () => void
  slotsOpen: boolean
}

/**
 * WorkflowType - тип процесса workflow
 * 
 * Варианты:
 * - 'screening': скрининг (30 минут)
 * - 'interview': интервью (90 минут)
 */
type WorkflowType = 'screening' | 'interview'

/**
 * InterviewFormat - формат интервью
 * 
 * Варианты:
 * - 'online': онлайн интервью
 * - 'office': офисное интервью
 */
type InterviewFormat = 'online' | 'office'

/**
 * Interviewer - интерфейс интервьюера
 * 
 * Структура:
 * - id: уникальный идентификатор интервьюера
 * - name: имя интервьюера
 */
interface Interviewer {
  id: string
  name: string
}

/**
 * Office - тип офиса
 * 
 * Варианты:
 * - 'minsk': Минск
 * - 'warsaw': Варшава
 * - 'gomel': Гомель
 */
type Office = 'minsk' | 'warsaw' | 'gomel'

/**
 * WorkflowHeader - компонент заголовка страницы workflow
 * 
 * Состояние:
 * - selectedWorkflow: выбранный тип процесса (скрининг/интервью)
 * - selectedVacancy: выбранная вакансия
 * - interviewFormat: формат интервью (онлайн/офис)
 * - selectedInterviewers: массив ID выбранных интервьюеров
 * - selectedOffice: выбранный офис
 * 
 * Функциональность:
 * - Управление типом процесса и настройками
 */
export default function WorkflowHeader({ onSlotsClick, slotsOpen }: WorkflowHeaderProps) {
  // Выбранный тип процесса (по умолчанию 'screening' - скрининг)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  // Выбранная вакансия (по умолчанию 'frontend-react')
  const [selectedVacancy, setSelectedVacancy] = useState('frontend-react')
  // Формат интервью (по умолчанию 'online' - онлайн)
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat>('online')
  // Массив ID выбранных интервьюеров
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])
  // Выбранный офис (по умолчанию 'minsk' - Минск)
  const [selectedOffice, setSelectedOffice] = useState<Office>('minsk')

  /**
   * interviewers - моковые данные интервьюеров
   * 
   * Используется для:
   * - Выбора интервьюеров при настройке интервью
   * 
   * TODO: Загружать из API
   */
  const interviewers: Interviewer[] = [
    { id: '1', name: 'Иван Петров' },
    { id: '2', name: 'Мария Сидорова' },
    { id: '3', name: 'Алексей Иванов' },
  ]

  /**
   * offices - список офисов
   * 
   * Используется для:
   * - Выбора офиса при настройке интервью
   */
  const offices: { id: Office; label: string }[] = [
    { id: 'minsk', label: 'Минск' },
    { id: 'warsaw', label: 'Варшава' },
    { id: 'gomel', label: 'Гомель' },
  ]

  /**
   * handleInterviewerToggle - обработчик переключения выбора интервьюера
   * 
   * Функциональность:
   * - Добавляет/удаляет интервьюера из списка выбранных
   * 
   * Поведение:
   * - Если интервьюер уже выбран - удаляет его из списка
   * - Если интервьюер не выбран - добавляет его в список
   * 
   * @param interviewerId - ID интервьюера для переключения
   */
  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers(prev =>
      prev.includes(interviewerId)
        ? prev.filter(id => id !== interviewerId) // Удаляем если уже выбран
        : [...prev, interviewerId] // Добавляем если не выбран
    )
  }

  return (
    <Box className={styles.header}>
      {/* Основной контейнер: левая часть (кнопки + тогглеры) и правая часть (выпадающий список + кнопки управления) */}
      <Flex 
        align="center" 
        justify="between" 
        width="100%" 
        gap="4"
        className={styles.headerRow}
        wrap="wrap"
      >
        {/* Левая часть: быстрые кнопки и тогглеры в один ряд */}
        <Flex 
          gap="3" 
          align="center" 
          className={styles.leftSection}
          wrap="wrap"
        >
          {/* Быстрые кнопки — переход по ссылке для коммуникации */}
          <Flex gap="2" align="center" className={styles.quickButtonsGroup}>
            <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#f97316', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative' }}>
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#3b82f6', position: 'relative' }}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4' }}>
              <CalendarIcon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#6b7280' }}>
              <Text size="3" weight="bold" style={{ color: '#ffffff' }}>📄</Text>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#10b981' }}>
              <Text size="5" weight="bold" style={{ color: '#ffffff' }}>+</Text>
            </Box>
          </Flex>

          {/* Тогглер этапов процесса: динамические кнопки на основе этапов найма с меткой "встреча"
              - Количество кнопок: 0 и более (зависит от количества этапов с isMeeting = true)
              - Названия кнопок: берутся из названий этапов найма, отмеченных чекбоксом "встреча"
              - Если этапов-встреч нет, тогглер может быть пустым или содержать только системные опции
              TODO: Загружать этапы найма с isMeeting = true из API и формировать кнопки динамически */}
          <Flex data-tour="workflow-toggle" gap="3" align="center" className={styles.workflowToggle}>
            <Box
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'screening'}
              onClick={() => setSelectedWorkflow('screening')}
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <ClipboardIcon width={18} height={18} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                    Скрининг
                  </Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                    30 мин
                  </Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'screening' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
            
            <Box
              data-tour="workflow-interview"
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'interview'}
              onClick={() => setSelectedWorkflow('interview')}
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <PersonIcon width={18} height={18} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>
                    Интервью
                  </Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>
                    90 мин
                  </Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'interview' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>

        {/* Правая часть: выбор вакансии, кнопки Календарь, Вакансия (вопросы и ссылка), слоты, Обновить */}
        <Box data-tour="workflow-vacancy-buttons" className={styles.rightSection}>
          <Select.Root value={selectedVacancy} onValueChange={setSelectedVacancy}>
            <Select.Trigger className={styles.vacancySelect} />
            <Select.Content className={styles.selectContent}>
              <Select.Item value="frontend-react" className={styles.selectItem}>
                Frontend Engineer (React)
              </Select.Item>
              <Select.Item value="backend-python" className={styles.selectItem}>
                Backend Engineer (Python)
              </Select.Item>
              <Select.Item value="fullstack" className={styles.selectItem}>
                Fullstack Developer
              </Select.Item>
            </Select.Content>
          </Select.Root>
          
          {/* Кнопки управления строго под выпадающим списком */}
          <Flex gap="2" align="center" justify="end" className={styles.controlsRow}>
            {/* Кнопка 1: Календарь с иконкой "Поделиться" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ backgroundColor: 'var(--gray-3)' }}
            >
              <CalendarIcon width={12} height={12} />
              <Text size="1" className={styles.calendarText}>Календарь</Text>
              <OpenInNewWindowIcon width={10} height={10} />
            </Button>
            
            {/* Кнопка 3: "Вакансия" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ backgroundColor: 'var(--gray-3)' }}
            >
              <Text size="1">Вакансия</Text>
            </Button>
            
            {/* Кнопка 4: "Свободные слоты" */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              onClick={onSlotsClick}
              style={{
                backgroundColor: slotsOpen ? 'var(--accent-9)' : 'var(--accent-3)',
                color: slotsOpen ? '#ffffff' : 'var(--accent-11)',
              }}
            >
              <ClockIcon width={12} height={12} />
              <Text size="1">слоты</Text>
            </Button>
            
            {/* Кнопка 5: Обновить (круглая) */}
            <Button
              variant="soft"
              size="1"
              className={styles.controlButton}
              style={{ 
                backgroundColor: 'var(--accent-9)', 
                color: '#ffffff',
                borderRadius: '50%',
                width: '27px',
                height: '27px',
                padding: 0,
                minWidth: '27px'
              }}
            >
              <ReloadIcon width={12} height={12} />
            </Button>
          </Flex>
        </Box>
      </Flex>

      {/* Блок настроек встречи (показывается только при выборе этапа-встречи)
          - Отображается для этапов найма с isMeeting = true
          - Содержимое зависит от настроек этапа:
            - showOffices: если true, показывается выбор формата (Онлайн/Офис) и выбор офиса при выборе "Офис"
            - showInterviewers: если true, показывается выбор интервьюеров
          - Настройки этапа задаются на странице /company-settings/recruiting/stages
          TODO: Загружать настройки выбранного этапа из API и отображать элементы в зависимости от showOffices и showInterviewers */}
      {selectedWorkflow === 'interview' && (
        <Box className={styles.interviewOptionsPanel}>
          <Flex gap="4" align="center" wrap="wrap">
            {/* Тогглер формата встречи (отображается если showOffices = true для выбранного этапа)
                - Позволяет выбрать формат: Онлайн или Офис
                - При выборе "Офис" показывается дополнительная карточка с выбором офиса */}
            <Flex gap="2" align="center">
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'online'}
                onClick={() => setInterviewFormat('online')}
              >
                <VideoIcon width={16} height={16} />
                <Text size="2" weight="medium">Онлайн</Text>
              </Box>
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'office'}
                onClick={() => setInterviewFormat('office')}
              >
                <BoxIcon width={16} height={16} />
                <Text size="2" weight="medium">Офис</Text>
              </Box>
            </Flex>

            {/* Выбор офиса (отображается если выбран формат "Офис" и showOffices = true)
                - Показывается сразу после кнопки выбора формата "Офис"
                - Содержит список офисов для выбора */}
            {interviewFormat === 'office' && (
              <>
                <Separator orientation="vertical" style={{ height: '24px' }} />
                <Flex gap="1" align="center" className={styles.officeToggle}>
                  {offices.map(office => (
                    <Box
                      key={office.id}
                      className={styles.officeButton}
                      data-selected={selectedOffice === office.id}
                      onClick={() => setSelectedOffice(office.id)}
                    >
                      <Text size="1" weight={selectedOffice === office.id ? "medium" : "regular"}>
                        {office.label}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </>
            )}

            {/* Чекбоксы интервьюеров (отображается если showInterviewers = true для выбранного этапа)
                TODO: Загружать настройки выбранного этапа из API и проверять showInterviewers
                Сейчас отображается всегда для демонстрации функциональности */}
            <Separator orientation="vertical" style={{ height: '24px' }} />
            <Flex gap="3" align="center" wrap="wrap">
              {interviewers.map(interviewer => (
                <Flex key={interviewer.id} align="center" gap="2">
                  <Checkbox
                    checked={selectedInterviewers.includes(interviewer.id)}
                    onCheckedChange={() => handleInterviewerToggle(interviewer.id)}
                  />
                  <Text size="2">{interviewer.name}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
