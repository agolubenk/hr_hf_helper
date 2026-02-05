'use client'

import { Fragment } from 'react'
import { Dialog, Flex, Text, Button, Checkbox, ScrollArea, Table, Card, Box } from '@radix-ui/themes'
import { Cross2Icon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'

/**
 * AccessRights - базовые права доступа к модулям приложения
 * 
 * Структура: Record<moduleId, { view: boolean, edit: boolean }>
 * - moduleId: идентификатор модуля (например, 'recruiting', 'vacancies', 'company-settings')
 * - view: право на просмотр модуля
 * - edit: право на редактирование модуля
 * 
 * Используется для управления доступом к основным разделам приложения.
 */
export type AccessRights = Record<string, { view: boolean; edit: boolean }>

/**
 * ATSAccessRights - права доступа для ATS (блок Рекрутинг)
 * 
 * Детальные настройки доступа к функциям ATS:
 * - viewOfferConditions: видеть условия оффера
 * - editOfferConditions: редактировать условия оффера
 * - viewSalaryConditions: видеть условия ЗП
 * - editSalaryConditions: редактировать условия ЗП
 * - viewAdditionalFields: видеть дополнительные поля
 * - editAdditionalFields: редактировать дополнительные поля
 * - viewSocialMedia: видеть соцсети и мессенджеры
 * - editSocialMedia: редактировать соцсети и мессенджеры
 * - viewTags: видеть метки
 * - editTags: редактировать метки
 * - viewHistory: видеть историю
 * - editHistory: редактировать историю
 * - viewSource: видеть источник
 * - editSource: редактировать источник
 * - viewStatus: видеть статусы кандидатов
 * - changeStatus: изменять статусы кандидатов
 * - viewComment: видеть комментарии
 * - comment: комментировать кандидатов
 */
export type ATSAccessRights = {
  viewOfferConditions: boolean      // Видеть условия оффера
  editOfferConditions: boolean       // Редактировать условия оффера
  viewSalaryConditions: boolean      // Видеть условия ЗП
  editSalaryConditions: boolean       // Редактировать условия ЗП
  viewAdditionalFields: boolean      // Видеть дополнительные поля
  editAdditionalFields: boolean       // Редактировать дополнительные поля
  viewSocialMedia: boolean            // Видеть соцсети и мессенджеры
  editSocialMedia: boolean            // Редактировать соцсети и мессенджеры
  viewTags: boolean                   // Видеть метки
  editTags: boolean                   // Редактировать метки
  viewHistory: boolean                // Видеть историю
  editHistory: boolean                // Редактировать историю
  viewSource: boolean                 // Видеть источник
  editSource: boolean                 // Редактировать источник
  viewStatus: boolean                 // Видеть статусы кандидатов
  changeStatus: boolean               // Изменять статусы кандидатов
  viewComment: boolean                // Видеть комментарии
  comment: boolean                    // Комментировать кандидатов
}

/**
 * RecruitingSettingsAccessRights - права доступа для настроек рекрутинга
 * 
 * Детальные настройки доступа к функциям настроек рекрутинга:
 * - viewRules: видеть правила привлечения
 * - editRules: редактировать правила привлечения
 * - viewStages: видеть этапы найма и причины отказа
 * - editStages: редактировать этапы найма и причины отказа
 * - viewCommands: видеть команды workflow
 * - editCommands: редактировать команды workflow
 * - viewCandidateFields: видеть дополнительные поля кандидатов
 * - editCandidateFields: редактировать дополнительные поля кандидатов
 * - viewScorecard: видеть scorecard
 * - editScorecard: редактировать scorecard
 * - viewSLA: видеть SLA
 * - editSLA: редактировать SLA
 * - viewVacancyPrompt: видеть единый промпт для вакансий
 * - editVacancyPrompt: редактировать единый промпт для вакансий
 * - viewOfferTemplate: видеть шаблон оффера
 * - editOfferTemplate: редактировать шаблон оффера
 * - viewCandidateResponses: видеть ответы кандидатам
 * - editCandidateResponses: редактировать ответы кандидатам
 */
export type RecruitingSettingsAccessRights = {
  viewRules: boolean                 // Видеть правила привлечения
  editRules: boolean                  // Редактировать правила привлечения
  viewStages: boolean                 // Видеть этапы найма и причины отказа
  editStages: boolean                 // Редактировать этапы найма и причины отказа
  viewCommands: boolean               // Видеть команды workflow
  editCommands: boolean               // Редактировать команды workflow
  viewCandidateFields: boolean        // Видеть дополнительные поля кандидатов
  editCandidateFields: boolean        // Редактировать дополнительные поля кандидатов
  viewScorecard: boolean               // Видеть scorecard
  editScorecard: boolean              // Редактировать scorecard
  viewSLA: boolean                     // Видеть SLA
  editSLA: boolean                    // Редактировать SLA
  viewVacancyPrompt: boolean           // Видеть единый промпт для вакансий
  editVacancyPrompt: boolean          // Редактировать единый промпт для вакансий
  viewOfferTemplate: boolean           // Видеть шаблон оффера
  editOfferTemplate: boolean          // Редактировать шаблон оффера
  viewCandidateResponses: boolean      // Видеть ответы кандидатам
  editCandidateResponses: boolean    // Редактировать ответы кандидатам
}

/**
 * Application - интерфейс приложения/интеграции
 * 
 * Описывает внешнее приложение или интеграцию, доступную для группы пользователей.
 * 
 * @property {string} id - Уникальный идентификатор приложения (например, 'huntflow', 'telegram')
 * @property {string} name - Название приложения для отображения
 * @property {string} [description] - Описание приложения (опционально)
 */
export interface Application {
  id: string
  name: string
  description?: string
}

/**
 * ModuleItem - интерфейс модуля приложения
 * 
 * Описывает модуль или раздел приложения с возможными подразделами.
 * 
 * @property {string} id - Уникальный идентификатор модуля (например, 'recruiting', 'vacancies')
 * @property {string} label - Название модуля для отображения
 * @property {Array<{id: string, label: string}>} [children] - Массив подразделов модуля (опционально)
 */
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
      { id: 'cs-users', label: 'Пользователи и группы пользователей' },
      { id: 'cs-recruiting', label: 'Настройки рекрутинга' },
    ],
  },
]

/**
 * AVAILABLE_APPLICATIONS - список доступных приложений/интеграций
 * 
 * Содержит все внешние приложения и интеграции, которые могут быть доступны группам пользователей.
 * Используется для отображения списка приложений в модальном окне настроек доступа.
 * 
 * TODO: Заменить на загрузку из API
 * - GET /api/company-settings/integrations/available/ - получение списка доступных интеграций
 */
const AVAILABLE_APPLICATIONS: Application[] = [
  { id: 'huntflow', name: 'Huntflow', description: 'ATS система для управления кандидатами' },
  { id: 'telegram', name: 'Telegram', description: 'Интеграция с Telegram для коммуникации' },
  { id: 'notion', name: 'Notion', description: 'Интеграция с Notion для документов' },
  { id: 'clickup', name: 'ClickUp', description: 'Интеграция с ClickUp для задач' },
  { id: 'hhru', name: 'HeadHunter.ru', description: 'Интеграция с HeadHunter' },
]

/**
 * getAllIds - функция получения всех идентификаторов модулей и подразделов
 * 
 * Рекурсивно собирает все идентификаторы из APP_MODULES, включая идентификаторы подразделов.
 * Используется для инициализации состояния доступа для всех модулей.
 * 
 * @returns {string[]} Массив всех идентификаторов модулей и подразделов
 */
function getAllIds(): string[] {
  const ids: string[] = []
  for (const m of APP_MODULES) {
    ids.push(m.id)
    for (const c of m.children || []) ids.push(c.id)
  }
  return ids
}

/**
 * ALL_IDS - массив всех идентификаторов модулей и подразделов
 * 
 * Вычисляется один раз при загрузке модуля и используется для инициализации
 * состояния доступа (AccessRights) для всех модулей приложения.
 */
const ALL_IDS = getAllIds()

/**
 * GroupAccessModalProps - пропсы компонента GroupAccessModal
 * 
 * @property {boolean} open - Флаг открытости модального окна
 * @property {(open: boolean) => void} onOpenChange - Обработчик изменения состояния открытости
 * @property {string} groupName - Название группы пользователей для отображения в заголовке
 * @property {string[]} [initialApplications] - Начальный список доступных приложений (опционально)
 * @property {AccessRights | undefined} initialAccess - Начальные права доступа к модулям приложения
 * @property {ATSAccessRights} [initialATSAccess] - Начальные детальные права доступа для ATS (блок Рекрутинг) (опционально)
 * @property {RecruitingSettingsAccessRights} [initialRecruitingSettingsAccess] - Начальные детальные права доступа для настроек рекрутинга (опционально)
 * @property {(applications: string[], access: AccessRights, atsAccess?: ATSAccessRights, recruitingSettingsAccess?: RecruitingSettingsAccessRights) => void} onApply - Обработчик применения изменений. Вызывается при нажатии кнопки "Применить" с обновленными данными доступа.
 */
interface GroupAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  initialApplications?: string[]
  initialAccess: AccessRights | undefined
  initialATSAccess?: ATSAccessRights
  initialRecruitingSettingsAccess?: RecruitingSettingsAccessRights
  onApply: (applications: string[], access: AccessRights, atsAccess?: ATSAccessRights, recruitingSettingsAccess?: RecruitingSettingsAccessRights) => void
}

/**
 * GroupAccessModal - модальное окно управления доступом группы пользователей
 * 
 * Компонент предоставляет полный функционал для настройки прав доступа группы пользователей:
 * - Управление доступными приложениями/интеграциями
 * - Настройка прав доступа к модулям приложения (просмотр/редактирование)
 * - Детальная настройка прав доступа для ATS (блок Рекрутинг)
 * - Детальная настройка прав доступа для настроек рекрутинга
 * 
 * Основные возможности:
 * - Выбор приложений, доступных группе
 * - Настройка прав просмотра и редактирования для каждого модуля
 * - Детальная настройка доступа к полям и функциям ATS (условия оффера, ЗП, поля, метки, история, источник, статусы, комментарии)
 * - Детальная настройка доступа к разделам настроек рекрутинга (правила, этапы, команды, поля, scorecard, SLA, промпты, шаблоны, ответы)
 * - Автоматическое включение просмотра при включении редактирования
 * - Автоматическое раскрытие детальных настроек при наличии доступа к соответствующему модулю
 * 
 * Состояние компонента:
 * - applications: массив идентификаторов доступных приложений
 * - access: права доступа к модулям приложения (AccessRights)
 * - atsAccess: детальные права доступа для ATS (ATSAccessRights)
 * - recruitingSettingsAccess: детальные права доступа для настроек рекрутинга (RecruitingSettingsAccessRights)
 * - showATSAccess: флаг отображения детальных настроек ATS
 * - showRecruitingSettingsAccess: флаг отображения детальных настроек рекрутинга
 * 
 * Жизненный цикл:
 * 1. При открытии модального окна (open = true) инициализируются все состояния из initial* пропсов
 * 2. Автоматически раскрываются детальные настройки, если есть соответствующий доступ
 * 3. При изменении прав доступа применяется логика автоматического включения просмотра при включении редактирования
 * 4. При нажатии "Применить" вызывается onApply с обновленными данными
 * 
 * Логика автоматического включения просмотра:
 * - При включении любого edit* поля автоматически включается соответствующее view* поле
 * - При включении changeStatus автоматически включается viewStatus
 * - При включении comment автоматически включается viewComment
 * 
 * Использование:
 * Компонент используется на странице /company-settings/user-groups для настройки прав доступа групп пользователей.
 * 
 * @param {GroupAccessModalProps} props - Пропсы компонента
 * @returns {JSX.Element} Модальное окно управления доступом
 */
export default function GroupAccessModal({
  open,
  onOpenChange,
  groupName,
  initialApplications = [],
  initialAccess,
  initialATSAccess,
  initialRecruitingSettingsAccess,
  onApply,
}: GroupAccessModalProps) {
  /**
   * applications - массив идентификаторов доступных приложений/интеграций
   * 
   * Содержит список приложений, к которым группа пользователей имеет доступ.
   * Инициализируется из initialApplications при открытии модального окна.
   */
  const [applications, setApplications] = useState<string[]>(initialApplications)
  
  /**
   * access - права доступа к модулям приложения
   * 
   * Содержит права просмотра и редактирования для каждого модуля и подраздела приложения.
   * Инициализируется из initialAccess при открытии модального окна.
   * Для всех модулей из APP_MODULES создаются записи с правами view: false, edit: false, если они не указаны в initialAccess.
   */
  const [access, setAccess] = useState<AccessRights>(() => {
    const a: AccessRights = {}
    for (const id of ALL_IDS) {
      const v = initialAccess?.[id]
      a[id] = { view: v?.view ?? false, edit: v?.edit ?? false }
    }
    return a
  })
  
  /**
   * atsAccess - детальные права доступа для ATS (блок Рекрутинг)
   * 
   * Содержит детальные настройки доступа к полям и функциям ATS:
   * - Условия оффера (просмотр/редактирование)
   * - Условия ЗП (просмотр/редактирование)
   * - Дополнительные поля (просмотр/редактирование)
   * - Соцсети и мессенджеры (просмотр/редактирование)
   * - Метки (просмотр/редактирование)
   * - История (просмотр/редактирование)
   * - Источник (просмотр/редактирование)
   * - Статусы (просмотр/изменение)
   * - Комментарии (просмотр/комментирование)
   * 
   * Инициализируется из initialATSAccess при открытии модального окна.
   */
  const [atsAccess, setAtsAccess] = useState<ATSAccessRights>(() => ({
    viewOfferConditions: initialATSAccess?.viewOfferConditions ?? false,
    editOfferConditions: initialATSAccess?.editOfferConditions ?? false,
    viewSalaryConditions: initialATSAccess?.viewSalaryConditions ?? false,
    editSalaryConditions: initialATSAccess?.editSalaryConditions ?? false,
    viewAdditionalFields: initialATSAccess?.viewAdditionalFields ?? false,
    editAdditionalFields: initialATSAccess?.editAdditionalFields ?? false,
    viewSocialMedia: initialATSAccess?.viewSocialMedia ?? false,
    editSocialMedia: initialATSAccess?.editSocialMedia ?? false,
    viewTags: initialATSAccess?.viewTags ?? false,
    editTags: initialATSAccess?.editTags ?? false,
    viewHistory: initialATSAccess?.viewHistory ?? false,
    editHistory: initialATSAccess?.editHistory ?? false,
    viewSource: initialATSAccess?.viewSource ?? false,
    editSource: initialATSAccess?.editSource ?? false,
    viewStatus: initialATSAccess?.viewStatus ?? false,
    changeStatus: initialATSAccess?.changeStatus ?? false,
    viewComment: initialATSAccess?.viewComment ?? false,
    comment: initialATSAccess?.comment ?? false,
  }))
  /**
   * showATSAccess - флаг отображения детальных настроек доступа для ATS
   * 
   * Управляет видимостью развернутого списка детальных настроек доступа для блока "Рекрутинг".
   * Автоматически устанавливается в true при открытии модального окна, если у группы есть доступ к модулю "Рекрутинг".
   */
  const [showATSAccess, setShowATSAccess] = useState(false)
  
  /**
   * recruitingSettingsAccess - детальные права доступа для настроек рекрутинга
   * 
   * Содержит детальные настройки доступа к разделам настроек рекрутинга:
   * - Правила привлечения (просмотр/редактирование)
   * - Этапы найма и причины отказа (просмотр/редактирование)
   * - Команды workflow (просмотр/редактирование)
   * - Дополнительные поля кандидатов (просмотр/редактирование)
   * - Scorecard (просмотр/редактирование)
   * - SLA (просмотр/редактирование)
   * - Единый промпт для вакансий (просмотр/редактирование)
   * - Шаблон оффера (просмотр/редактирование)
   * - Ответы кандидатам (просмотр/редактирование)
   * 
   * Инициализируется из initialRecruitingSettingsAccess при открытии модального окна.
   */
  const [recruitingSettingsAccess, setRecruitingSettingsAccess] = useState<RecruitingSettingsAccessRights>(() => ({
    viewRules: initialRecruitingSettingsAccess?.viewRules ?? false,
    editRules: initialRecruitingSettingsAccess?.editRules ?? false,
    viewStages: initialRecruitingSettingsAccess?.viewStages ?? false,
    editStages: initialRecruitingSettingsAccess?.editStages ?? false,
    viewCommands: initialRecruitingSettingsAccess?.viewCommands ?? false,
    editCommands: initialRecruitingSettingsAccess?.editCommands ?? false,
    viewCandidateFields: initialRecruitingSettingsAccess?.viewCandidateFields ?? false,
    editCandidateFields: initialRecruitingSettingsAccess?.editCandidateFields ?? false,
    viewScorecard: initialRecruitingSettingsAccess?.viewScorecard ?? false,
    editScorecard: initialRecruitingSettingsAccess?.editScorecard ?? false,
    viewSLA: initialRecruitingSettingsAccess?.viewSLA ?? false,
    editSLA: initialRecruitingSettingsAccess?.editSLA ?? false,
    viewVacancyPrompt: initialRecruitingSettingsAccess?.viewVacancyPrompt ?? false,
    editVacancyPrompt: initialRecruitingSettingsAccess?.editVacancyPrompt ?? false,
    viewOfferTemplate: initialRecruitingSettingsAccess?.viewOfferTemplate ?? false,
    editOfferTemplate: initialRecruitingSettingsAccess?.editOfferTemplate ?? false,
    viewCandidateResponses: initialRecruitingSettingsAccess?.viewCandidateResponses ?? false,
    editCandidateResponses: initialRecruitingSettingsAccess?.editCandidateResponses ?? false,
  }))
  /**
   * showRecruitingSettingsAccess - флаг отображения детальных настроек доступа для настроек рекрутинга
   * 
   * Управляет видимостью развернутого списка детальных настроек доступа для подраздела "Настройки рекрутинга".
   * Автоматически устанавливается в true при открытии модального окна, если у группы есть доступ к "Настройкам рекрутинга".
   */
  const [showRecruitingSettingsAccess, setShowRecruitingSettingsAccess] = useState(false)

  /**
   * useEffect - инициализация состояния при открытии модального окна
   * 
   * Выполняется при изменении open, initialApplications, initialAccess, initialATSAccess, initialRecruitingSettingsAccess.
   * 
   * Функциональность:
   * - Инициализирует applications из initialApplications
   * - Инициализирует access для всех модулей из initialAccess (создает записи для всех модулей, если их нет)
   * - Инициализирует atsAccess из initialATSAccess
   * - Инициализирует recruitingSettingsAccess из initialRecruitingSettingsAccess
   * - Автоматически раскрывает детальные настройки ATS, если есть доступ к модулю "Рекрутинг"
   * - Автоматически раскрывает детальные настройки рекрутинга, если есть доступ к "Настройкам рекрутинга"
   * 
   * Зависимости: [open, initialApplications, initialAccess, initialATSAccess, initialRecruitingSettingsAccess]
   */
  useEffect(() => {
    if (open) {
      setApplications(initialApplications)
      const a: AccessRights = {}
      for (const id of ALL_IDS) {
        const v = initialAccess?.[id]
        a[id] = { view: v?.view ?? false, edit: v?.edit ?? false }
      }
      setAccess(a)
      setAtsAccess({
        viewOfferConditions: initialATSAccess?.viewOfferConditions ?? false,
        editOfferConditions: initialATSAccess?.editOfferConditions ?? false,
        viewSalaryConditions: initialATSAccess?.viewSalaryConditions ?? false,
        editSalaryConditions: initialATSAccess?.editSalaryConditions ?? false,
        viewAdditionalFields: initialATSAccess?.viewAdditionalFields ?? false,
        editAdditionalFields: initialATSAccess?.editAdditionalFields ?? false,
        viewSocialMedia: initialATSAccess?.viewSocialMedia ?? false,
        editSocialMedia: initialATSAccess?.editSocialMedia ?? false,
        viewTags: initialATSAccess?.viewTags ?? false,
        editTags: initialATSAccess?.editTags ?? false,
        viewHistory: initialATSAccess?.viewHistory ?? false,
        editHistory: initialATSAccess?.editHistory ?? false,
        viewSource: initialATSAccess?.viewSource ?? false,
        editSource: initialATSAccess?.editSource ?? false,
        viewStatus: initialATSAccess?.viewStatus ?? false,
        changeStatus: initialATSAccess?.changeStatus ?? false,
        viewComment: initialATSAccess?.viewComment ?? false,
        comment: initialATSAccess?.comment ?? false,
      })
      // Автоматически раскрывать настройки ATS, если есть доступ к Рекрутингу
      setShowATSAccess(initialAccess?.recruiting?.view === true || initialAccess?.recruiting?.edit === true)
      setRecruitingSettingsAccess({
        viewRules: initialRecruitingSettingsAccess?.viewRules ?? false,
        editRules: initialRecruitingSettingsAccess?.editRules ?? false,
        viewStages: initialRecruitingSettingsAccess?.viewStages ?? false,
        editStages: initialRecruitingSettingsAccess?.editStages ?? false,
        viewCommands: initialRecruitingSettingsAccess?.viewCommands ?? false,
        editCommands: initialRecruitingSettingsAccess?.editCommands ?? false,
        viewCandidateFields: initialRecruitingSettingsAccess?.viewCandidateFields ?? false,
        editCandidateFields: initialRecruitingSettingsAccess?.editCandidateFields ?? false,
        viewScorecard: initialRecruitingSettingsAccess?.viewScorecard ?? false,
        editScorecard: initialRecruitingSettingsAccess?.editScorecard ?? false,
        viewSLA: initialRecruitingSettingsAccess?.viewSLA ?? false,
        editSLA: initialRecruitingSettingsAccess?.editSLA ?? false,
        viewVacancyPrompt: initialRecruitingSettingsAccess?.viewVacancyPrompt ?? false,
        editVacancyPrompt: initialRecruitingSettingsAccess?.editVacancyPrompt ?? false,
        viewOfferTemplate: initialRecruitingSettingsAccess?.viewOfferTemplate ?? false,
        editOfferTemplate: initialRecruitingSettingsAccess?.editOfferTemplate ?? false,
        viewCandidateResponses: initialRecruitingSettingsAccess?.viewCandidateResponses ?? false,
        editCandidateResponses: initialRecruitingSettingsAccess?.editCandidateResponses ?? false,
      })
      // Автоматически раскрывать настройки рекрутинга, если есть доступ к Настройкам рекрутинга
      setShowRecruitingSettingsAccess(initialAccess?.['cs-recruiting']?.view === true || initialAccess?.['cs-recruiting']?.edit === true)
    }
  }, [open, initialApplications, initialAccess, initialATSAccess, initialRecruitingSettingsAccess])

  /**
   * toggleApplication - переключение доступности приложения для группы
   * 
   * Добавляет или удаляет приложение из списка доступных приложений группы.
   * 
   * @param {string} appId - Идентификатор приложения для переключения
   * 
   * Поведение:
   * - Если приложение уже в списке - удаляет его
   * - Если приложения нет в списке - добавляет его
   */
  const toggleApplication = (appId: string) => {
    setApplications(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    )
  }

  /**
   * setNode - установка права доступа для модуля
   * 
   * Обновляет право просмотра или редактирования для указанного модуля.
   * 
   * @param {string} id - Идентификатор модуля
   * @param {'view' | 'edit'} field - Тип права доступа (просмотр или редактирование)
   * @param {boolean} value - Значение права доступа
   * 
   * Поведение:
   * - Создает запись для модуля, если её нет
   * - Обновляет только указанное поле (view или edit), сохраняя значение другого поля
   */
  const setNode = (id: string, field: 'view' | 'edit', value: boolean) => {
    setAccess((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { view: false, edit: false }), [field]: value },
    }))
  }

  /**
   * handleApply - обработчик применения изменений
   * 
   * Вызывается при нажатии кнопки "Применить" в модальном окне.
   * Передает все обновленные данные доступа в родительский компонент через onApply
   * и закрывает модальное окно.
   * 
   * Передаваемые данные:
   * - applications: список доступных приложений
   * - access: права доступа к модулям
   * - atsAccess: детальные права доступа для ATS
   * - recruitingSettingsAccess: детальные права доступа для настроек рекрутинга
   */
  const handleApply = () => {
    onApply(applications, access, atsAccess, recruitingSettingsAccess)
    onOpenChange(false)
  }

  /**
   * setATSAccessField - установка значения поля детальных прав доступа для ATS
   * 
   * Обновляет значение указанного поля в atsAccess с автоматическим включением просмотра
   * при включении редактирования.
   * 
   * @param {keyof ATSAccessRights} field - Имя поля для обновления
   * @param {boolean} value - Новое значение поля
   * 
   * Логика автоматического включения просмотра:
   * - Если включается поле, начинающееся с 'edit', автоматически включается соответствующее поле 'view'
   * - Если включается 'changeStatus', автоматически включается 'viewStatus'
   * - Если включается 'comment', автоматически включается 'viewComment'
   * 
   * Примеры:
   * - setATSAccessField('editOfferConditions', true) → также установит viewOfferConditions = true
   * - setATSAccessField('changeStatus', true) → также установит viewStatus = true
   * - setATSAccessField('comment', true) → также установит viewComment = true
   */
  const setATSAccessField = (field: keyof ATSAccessRights, value: boolean) => {
    setAtsAccess(prev => {
      const updated = { ...prev, [field]: value }
      // Если включается редактирование, автоматически включаем просмотр
      if (value && field.startsWith('edit')) {
        const viewField = field.replace('edit', 'view') as keyof ATSAccessRights
        if (viewField in prev) {
          updated[viewField] = true
        }
      }
      // Если включается changeStatus, автоматически включаем viewStatus
      if (value && field === 'changeStatus') {
        updated.viewStatus = true
      }
      // Если включается comment, автоматически включаем viewComment
      if (value && field === 'comment') {
        updated.viewComment = true
      }
      return updated
    })
  }

  /**
   * setRecruitingSettingsAccessField - установка значения поля детальных прав доступа для настроек рекрутинга
   * 
   * Обновляет значение указанного поля в recruitingSettingsAccess с автоматическим включением просмотра
   * при включении редактирования.
   * 
   * @param {keyof RecruitingSettingsAccessRights} field - Имя поля для обновления
   * @param {boolean} value - Новое значение поля
   * 
   * Логика автоматического включения просмотра:
   * - Если включается поле, начинающееся с 'edit', автоматически включается соответствующее поле 'view'
   * 
   * Примеры:
   * - setRecruitingSettingsAccessField('editRules', true) → также установит viewRules = true
   * - setRecruitingSettingsAccessField('editStages', true) → также установит viewStages = true
   */
  const setRecruitingSettingsAccessField = (field: keyof RecruitingSettingsAccessRights, value: boolean) => {
    setRecruitingSettingsAccess(prev => {
      const updated = { ...prev, [field]: value }
      // Если включается редактирование, автоматически включаем просмотр
      if (value && field.startsWith('edit')) {
        const viewField = field.replace('edit', 'view') as keyof RecruitingSettingsAccessRights
        if (viewField in prev) {
          updated[viewField] = true
        }
      }
      return updated
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 800 }}>
        <Dialog.Title>Доступы и приложения: {groupName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Настройка доступных приложений и прав доступа по модулям для группы
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Доступные интеграции */}
          <Card>
            <Text size="3" weight="bold" mb="3" as="div">Доступные интеграции</Text>
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
                          <Flex align="center" gap="2">
                            <Text size="2" weight="medium">{mod.label}</Text>
                            {mod.id === 'recruiting' && (
                              <Button
                                size="1"
                                variant="ghost"
                                onClick={() => setShowATSAccess(!showATSAccess)}
                                style={{ padding: '2px 4px', minWidth: 'auto' }}
                              >
                                {showATSAccess ? (
                                  <ChevronUpIcon width="12" height="12" />
                                ) : (
                                  <ChevronDownIcon width="12" height="12" />
                                )}
                              </Button>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={access[mod.id]?.view ?? false}
                            onCheckedChange={(c) => {
                              setNode(mod.id, 'view', c === true)
                              if (mod.id === 'recruiting' && c === true) {
                                setShowATSAccess(true)
                              }
                            }}
                          />
                        </Table.Cell>
                        <Table.Cell style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={access[mod.id]?.edit ?? false}
                            onCheckedChange={(c) => {
                              setNode(mod.id, 'edit', c === true)
                              if (mod.id === 'recruiting' && c === true) {
                                setShowATSAccess(true)
                              }
                            }}
                          />
                        </Table.Cell>
                      </Table.Row>
                      {/* Детальные настройки доступа для ATS (Рекрутинг) */}
                      {mod.id === 'recruiting' && showATSAccess && (
                        <>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Условия оффера</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewOfferConditions}
                                onCheckedChange={(c) => setATSAccessField('viewOfferConditions', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editOfferConditions}
                                onCheckedChange={(c) => setATSAccessField('editOfferConditions', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Условия ЗП</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewSalaryConditions}
                                onCheckedChange={(c) => setATSAccessField('viewSalaryConditions', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editSalaryConditions}
                                onCheckedChange={(c) => setATSAccessField('editSalaryConditions', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Дополнительные поля</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewAdditionalFields}
                                onCheckedChange={(c) => setATSAccessField('viewAdditionalFields', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editAdditionalFields}
                                onCheckedChange={(c) => setATSAccessField('editAdditionalFields', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Соцсети и мессенджеры</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewSocialMedia}
                                onCheckedChange={(c) => setATSAccessField('viewSocialMedia', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editSocialMedia}
                                onCheckedChange={(c) => setATSAccessField('editSocialMedia', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Метки</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewTags}
                                onCheckedChange={(c) => setATSAccessField('viewTags', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editTags}
                                onCheckedChange={(c) => setATSAccessField('editTags', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">История</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewHistory}
                                onCheckedChange={(c) => setATSAccessField('viewHistory', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editHistory ?? false}
                                onCheckedChange={(c) => {
                                  setATSAccessField('editHistory', c === true)
                                  if (c === true) {
                                    setATSAccessField('viewHistory', true)
                                  }
                                }}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Источник</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewSource}
                                onCheckedChange={(c) => setATSAccessField('viewSource', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.editSource ?? false}
                                onCheckedChange={(c) => {
                                  setATSAccessField('editSource', c === true)
                                  if (c === true) {
                                    setATSAccessField('viewSource', true)
                                  }
                                }}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Статусы</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewStatus}
                                onCheckedChange={(c) => setATSAccessField('viewStatus', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.changeStatus}
                                onCheckedChange={(c) => setATSAccessField('changeStatus', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ paddingLeft: 32, backgroundColor: 'var(--gray-2)' }}>
                              <Text size="1" weight="medium" color="gray">Комментировать</Text>
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.viewComment ?? false}
                                onCheckedChange={(c) => setATSAccessField('viewComment', c === true)}
                              />
                            </Table.Cell>
                            <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                              <Checkbox
                                checked={atsAccess.comment}
                                onCheckedChange={(c) => setATSAccessField('comment', c === true)}
                              />
                            </Table.Cell>
                          </Table.Row>
                        </>
                      )}
                      {(mod.children?.length ?? 0) > 0 &&
                        mod.children!.map((ch) => (
                          <Fragment key={ch.id}>
                            <Table.Row>
                              <Table.Cell style={{ paddingLeft: 24 }}>
                                <Flex align="center" gap="2">
                                  <Text size="2" color="gray">{ch.label}</Text>
                                  {ch.id === 'cs-recruiting' && (
                                    <Button
                                      size="1"
                                      variant="ghost"
                                      onClick={() => setShowRecruitingSettingsAccess(!showRecruitingSettingsAccess)}
                                      style={{ padding: '2px 4px', minWidth: 'auto' }}
                                    >
                                      {showRecruitingSettingsAccess ? (
                                        <ChevronUpIcon width="12" height="12" />
                                      ) : (
                                        <ChevronDownIcon width="12" height="12" />
                                      )}
                                    </Button>
                                  )}
                                </Flex>
                              </Table.Cell>
                              <Table.Cell style={{ textAlign: 'center' }}>
                                <Checkbox
                                  checked={access[ch.id]?.view ?? false}
                                  onCheckedChange={(c) => {
                                    setNode(ch.id, 'view', c === true)
                                    if (ch.id === 'cs-recruiting' && c === true) {
                                      setShowRecruitingSettingsAccess(true)
                                    }
                                  }}
                                />
                              </Table.Cell>
                              <Table.Cell style={{ textAlign: 'center' }}>
                                <Checkbox
                                  checked={access[ch.id]?.edit ?? false}
                                  onCheckedChange={(c) => {
                                    setNode(ch.id, 'edit', c === true)
                                    if (ch.id === 'cs-recruiting' && c === true) {
                                      setShowRecruitingSettingsAccess(true)
                                    }
                                  }}
                                />
                              </Table.Cell>
                            </Table.Row>
                            {/* Детальные настройки доступа для Настроек рекрутинга */}
                            {ch.id === 'cs-recruiting' && showRecruitingSettingsAccess && (
                              <>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Правила привлечения</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewRules}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewRules', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editRules}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editRules', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Этапы найма и причины отказа</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewStages}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewStages', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editStages}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editStages', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Команды workflow</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewCommands}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewCommands', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editCommands}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editCommands', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Дополнительные поля кандидатов</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewCandidateFields}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewCandidateFields', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editCandidateFields}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editCandidateFields', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Scorecard</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewScorecard}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewScorecard', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editScorecard}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editScorecard', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">SLA</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewSLA}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewSLA', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editSLA}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editSLA', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Единый промпт для вакансий</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewVacancyPrompt}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewVacancyPrompt', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editVacancyPrompt}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editVacancyPrompt', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Шаблон оффера</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewOfferTemplate}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewOfferTemplate', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editOfferTemplate}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editOfferTemplate', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell style={{ paddingLeft: 40, backgroundColor: 'var(--gray-2)' }}>
                                    <Text size="1" weight="medium" color="gray">Ответы кандидатам</Text>
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.viewCandidateResponses}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('viewCandidateResponses', c === true)}
                                    />
                                  </Table.Cell>
                                  <Table.Cell style={{ textAlign: 'center', backgroundColor: 'var(--gray-2)' }}>
                                    <Checkbox
                                      checked={recruitingSettingsAccess.editCandidateResponses}
                                      onCheckedChange={(c) => setRecruitingSettingsAccessField('editCandidateResponses', c === true)}
                                    />
                                  </Table.Cell>
                                </Table.Row>
                              </>
                            )}
                          </Fragment>
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
