/**
 * RecruitingStagesSettingsPage (company-settings/recruiting/stages/page.tsx) - Страница настроек этапов найма
 * 
 * Назначение:
 * - Управление этапами найма (воронка подбора)
 * - Управление причинами отказа на каждом этапе
 * - Настройка структуры pipeline для ATS и отчётов
 * 
 * Функциональность:
 * - RecruitingStagesSettings: компонент управления этапами найма
 *   - Список этапов найма
 *   - Создание нового этапа
 *   - Редактирование существующего этапа
 *   - Удаление этапа
 *   - Управление причинами отказа для каждого этапа
 *   - Порядок этапов в воронке
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - RecruitingStagesSettings: компонент с формой управления этапами
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * - Приветственный тур: используется data-tour="recruiting-settings-page"
 * 
 * Поведение:
 * - При загрузке отображает форму управления этапами найма
 * - Является частью раздела настроек рекрутинга
 * - Важно настроить до начала активного подбора
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import RecruitingStagesSettings from "@/components/company-settings/RecruitingStagesSettings"
import styles from '../../company-settings.module.css'

/**
 * RecruitingStagesSettingsPage - компонент страницы настроек этапов найма
 * 
 * Функциональность:
 * - Отображает заголовок "Этапы найма и причины отказа"
 * - Рендерит компонент RecruitingStagesSettings с формой управления этапами
 */
export default function RecruitingStagesSettingsPage() {
  return (
    <AppLayout pageTitle="Этапы найма и причины отказа">
      <Box data-tour="recruiting-settings-page" className={styles.container}>
        {/* Заголовок страницы настроек этапов найма
            - data-tour: используется в приветственном туре для описания раздела */}
        <Box mb="4">
          <Text size="6" weight="bold" style={{ display: 'block' }}>
            Этапы найма и причины отказа
          </Text>
        </Box>

        {/* Компонент управления этапами найма
            - Содержит форму для создания, редактирования и удаления этапов
            - Управление причинами отказа для каждого этапа
            - Порядок этапов в воронке подбора */}
        <RecruitingStagesSettings />
      </Box>
    </AppLayout>
  )
}
