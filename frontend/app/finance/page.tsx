/**
 * FinancePage (finance/page.tsx) - Страница финансовых настроек
 * 
 * Назначение:
 * - Управление финансовыми настройками компании
 * - Настройка грейдов и зарплатных вилок
 * - Управление курсами валют
 * - Настройка налогов
 * 
 * Функциональность:
 * - GradesSection: настройка грейдов и уровней сотрудников
 * - CurrencyRatesSection: управление курсами валют
 * - TaxesSection: настройка налогов (особенно для PLN)
 * - Вкладки для переключения между разделами
 * - Синхронизация активной вкладки с URL параметром ?tab=
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useSearchParams: получение параметра ?tab= из URL
 * - useRouter: обновление URL при переключении вкладок
 * - Компоненты финансовых разделов: GradesSection, CurrencyRatesSection, TaxesSection
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
import { StarIcon, ReloadIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import GradesSection from "@/components/finance/GradesSection"
import CurrencyRatesSection from "@/components/finance/CurrencyRatesSection"
import TaxesSection from "@/components/finance/TaxesSection"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from './finance.module.css'

/**
 * FinancePageContent - основной компонент содержимого страницы финансов
 * 
 * Состояние:
 * - activeTab: текущая активная вкладка ('grades', 'currencies', 'taxes')
 */
function FinancePageContent() {
  // Получение параметров из URL
  const searchParams = useSearchParams()
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Параметр вкладки из URL (?tab=)
  const tabParam = searchParams.get('tab')
  // Активная вкладка: определяется из URL параметра или по умолчанию 'grades'
  const [activeTab, setActiveTab] = useState<'grades' | 'currencies' | 'taxes'>(
    (tabParam === 'grades' || tabParam === 'currencies' || tabParam === 'taxes') 
      ? tabParam 
      : 'grades'
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
   * - Пример: /finance?tab=currencies откроет вкладку "Курсы валют"
   */
  useEffect(() => {
    if (tabParam && (tabParam === 'grades' || tabParam === 'currencies' || tabParam === 'taxes')) {
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
   * @param value - значение новой вкладки ('grades', 'currencies', 'taxes')
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'grades' | 'currencies' | 'taxes')
    // Обновляем URL параметр для синхронизации и возможности делиться ссылками
    router.push(`/finance?tab=${value}`, { scroll: false })
  }

  /**
   * Рендер компонента страницы финансов
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Tabs: вкладки для переключения между разделами
   *   - Грейды: GradesSection
   *   - Курсы валют: CurrencyRatesSection
   *   - Налоги PLN: TaxesSection
   */
  return (
    <AppLayout pageTitle="Финансы и грейды">
      <Box className={styles.container}>
        <Flex direction="column" gap="4">
          {/* Компонент вкладок для переключения между разделами финансов
              - value: текущая активная вкладка
              - onValueChange: обработчик переключения вкладки
              - При переключении обновляет URL параметр ?tab= */}
          <Tabs.Root value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
            {/* Список вкладок
                - Каждая вкладка имеет иконку и название
                - При клике вызывается handleTabChange */}
            <Tabs.List className={styles.tabList}>
              {/* Вкладка "Грейды": настройка грейдов и уровней сотрудников */}
              <Tabs.Trigger value="grades" className={styles.tab}>
                <StarIcon width={16} height={16} />
                Грейды
              </Tabs.Trigger>
              {/* Вкладка "Курсы валют": управление курсами валют */}
              <Tabs.Trigger value="currencies" className={styles.tab}>
                <ReloadIcon width={16} height={16} />
                Курсы валют
              </Tabs.Trigger>
              {/* Вкладка "Налоги PLN": настройка налогов для польского злотого */}
              <Tabs.Trigger value="taxes" className={styles.tab}>
                <MixerHorizontalIcon width={16} height={16} />
                Налоги PLN
              </Tabs.Trigger>
            </Tabs.List>

            {/* Контент вкладок: отображается содержимое активной вкладки */}
            <Box className={styles.tabContent}>
              {/* Вкладка "Грейды": компонент настройки грейдов */}
              <Tabs.Content value="grades">
                <GradesSection />
              </Tabs.Content>

              {/* Вкладка "Курсы валют": компонент управления курсами валют */}
              <Tabs.Content value="currencies">
                <CurrencyRatesSection />
              </Tabs.Content>

              {/* Вкладка "Налоги PLN": компонент настройки налогов */}
              <Tabs.Content value="taxes">
                <TaxesSection />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Box>
    </AppLayout>
  )
}

/**
 * FinancePage - обертка для FinancePageContent с Suspense
 * 
 * Функциональность:
 * - Оборачивает FinancePageContent в Suspense для обработки асинхронной загрузки
 * - Показывает fallback (загрузку) пока компонент загружается
 * - Необходимо для использования useSearchParams() внутри компонента
 * 
 * Поведение:
 * - При загрузке показывает индикатор загрузки
 * - После загрузки отображает FinancePageContent
 * 
 * Причина использования Suspense:
 * - useSearchParams() требует обертки в Suspense для корректной работы с серверным рендерингом
 */
export default function FinancePage() {
  return (
    <Suspense fallback={<AppLayout pageTitle="Финансы и грейды"><Box p="4"><Text>Загрузка…</Text></Box></AppLayout>}>
      <FinancePageContent />
    </Suspense>
  )
}
