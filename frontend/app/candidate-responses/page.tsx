/**
 * CandidateResponsesPage (candidate-responses/page.tsx) - Страница управления ответами кандидатам
 * 
 * Назначение:
 * - Управление шаблонами ответов кандидатам
 * - Настройка шаблонов по грейдам
 * - Управление слотами для быстрого копирования
 * 
 * Функциональность:
 * - GeneralTemplatesTab: общие шаблоны ответов (не привязанные к грейдам)
 * - GradeTemplatesTab: шаблоны ответов, привязанные к конкретным грейдам
 * - SlotsTab: управление слотами (шаблонами свободного времени)
 * - Вкладки для переключения между разделами
 * - Синхронизация активной вкладки с URL параметром ?tab=
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useSearchParams: получение параметра ?tab= из URL
 * - useRouter: обновление URL при переключении вкладок
 * - Компоненты шаблонов: GeneralTemplatesTab, GradeTemplatesTab, SlotsTab
 * - Sidebar: ссылка на эту страницу в разделе "Настройки рекрутинга"
 * 
 * Поведение:
 * - При загрузке определяет активную вкладку из URL параметра ?tab=
 * - При переключении вкладки обновляет URL параметр
 * - Поддерживает глубокие ссылки на конкретные вкладки через URL
 */

'use client'

import { Suspense } from "react"
import AppLayout from "@/components/AppLayout"
import { Box, Flex, Text, Tabs } from "@radix-ui/themes"
import { ChatBubbleIcon, StarIcon, CalendarIcon } from "@radix-ui/react-icons"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import GeneralTemplatesTab from "@/components/candidate-responses/GeneralTemplatesTab"
import GradeTemplatesTab from "@/components/candidate-responses/GradeTemplatesTab"
import SlotsTab from "@/components/candidate-responses/SlotsTab"
import styles from './candidate-responses.module.css'

/**
 * CandidateResponsesPageContent - основной компонент содержимого страницы ответов кандидатам
 * 
 * Состояние:
 * - activeTab: текущая активная вкладка ('general', 'grades', 'slots')
 */
function CandidateResponsesPageContent() {
  // Получение параметров из URL
  const searchParams = useSearchParams()
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Параметр вкладки из URL (?tab=)
  const tabParam = searchParams.get('tab')
  // Активная вкладка: определяется из URL параметра или по умолчанию 'general'
  const [activeTab, setActiveTab] = useState<'general' | 'grades' | 'slots'>(
    (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots') 
      ? tabParam 
      : 'general'
  )

  /**
   * useEffect - синхронизация активной вкладки с URL параметром
   * 
   * Функциональность:
   * - Обновляет activeTab при изменении tabParam в URL
   * - Валидирует значение tabParam перед установкой
   * 
   * Поведение:
   * - Выполняется при изменении tabParam
   * - Позволяет открывать страницу с конкретной вкладкой через URL
   * - Пример: /candidate-responses?tab=grades откроет вкладку "По грейдам"
   */
  useEffect(() => {
    if (tabParam && (tabParam === 'general' || tabParam === 'grades' || tabParam === 'slots')) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  /**
   * handleTabChange - обработчик переключения вкладки
   * 
   * Функциональность:
   * - Обновляет активную вкладку
   * - Обновляет URL параметр ?tab= для синхронизации
   * 
   * Поведение:
   * - Вызывается при клике на вкладку
   * - Обновляет URL без прокрутки страницы (scroll: false)
   * - Позволяет делиться ссылками на конкретные вкладки
   * 
   * @param value - значение новой вкладки ('general', 'grades', 'slots')
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'general' | 'grades' | 'slots')
    // Обновляем URL параметр для синхронизации и возможности делиться ссылками
    router.push(`/candidate-responses?tab=${value}`, { scroll: false })
  }

  /**
   * Рендер компонента страницы ответов кандидатам
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Заголовок страницы
   * - Tabs: вкладки для переключения между разделами
   *   - Общие: GeneralTemplatesTab
   *   - По грейдам: GradeTemplatesTab
   *   - Слоты: SlotsTab
   */
  return (
    <AppLayout pageTitle="Ответы кандидатам">
      <Box className={styles.container}>
        <Flex direction="column" gap="4">
          {/* Заголовок страницы */}
          <Text size="6" weight="bold">
            Ответы кандидатам
          </Text>

          {/* Компонент вкладок для переключения между разделами
              - value: текущая активная вкладка
              - onValueChange: обработчик переключения вкладки
              - При переключении обновляет URL параметр ?tab= */}
          <Tabs.Root value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
            {/* Список вкладок
                - Каждая вкладка имеет иконку и название
                - При клике вызывается handleTabChange */}
            <Tabs.List className={styles.tabList}>
              {/* Вкладка "Общие": общие шаблоны ответов (не привязанные к грейдам) */}
              <Tabs.Trigger value="general" className={styles.tab}>
                <ChatBubbleIcon width={16} height={16} />
                Общие
              </Tabs.Trigger>
              {/* Вкладка "По грейдам": шаблоны ответов, привязанные к конкретным грейдам */}
              <Tabs.Trigger value="grades" className={styles.tab}>
                <StarIcon width={16} height={16} />
                По грейдам
              </Tabs.Trigger>
              {/* Вкладка "Слоты": управление слотами (шаблонами свободного времени) */}
              <Tabs.Trigger value="slots" className={styles.tab}>
                <CalendarIcon width={16} height={16} />
                Слоты
              </Tabs.Trigger>
            </Tabs.List>

            {/* Контент вкладок: отображается содержимое активной вкладки */}
            <Box className={styles.tabContent}>
              {/* Вкладка "Общие": компонент общих шаблонов */}
              <Tabs.Content value="general">
                <GeneralTemplatesTab />
              </Tabs.Content>

              {/* Вкладка "По грейдам": компонент шаблонов по грейдам */}
              <Tabs.Content value="grades">
                <GradeTemplatesTab />
              </Tabs.Content>

              {/* Вкладка "Слоты": компонент управления слотами */}
              <Tabs.Content value="slots">
                <SlotsTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Box>
    </AppLayout>
  )
}

/**
 * CandidateResponsesPage - обертка для CandidateResponsesPageContent с Suspense
 * 
 * Функциональность:
 * - Оборачивает CandidateResponsesPageContent в Suspense для обработки асинхронной загрузки
 * - Показывает fallback (загрузку) пока компонент загружается
 * - Необходимо для использования useSearchParams() внутри компонента
 * 
 * Поведение:
 * - При загрузке показывает индикатор загрузки
 * - После загрузки отображает CandidateResponsesPageContent
 * 
 * Причина использования Suspense:
 * - useSearchParams() требует обертки в Suspense для корректной работы с серверным рендерингом
 */
export default function CandidateResponsesPage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Ответы кандидатам"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <CandidateResponsesPageContent />
    </Suspense>
  )
}
