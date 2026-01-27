/**
 * SLASettingsPage (company-settings/sla/page.tsx) - Страница настройки SLA для вакансий
 * 
 * Назначение:
 * - Управление SLA (Service Level Agreement) для вакансий
 * - Настройка временных рамок для этапов найма
 * - Определение сроков выполнения задач по подбору
 * 
 * Функциональность:
 * - SLASettings: компонент управления SLA
 *   - Список SLA правил для разных типов вакансий/грейдов
 *   - Создание нового SLA правила
 *   - Редактирование существующего SLA
 *   - Удаление SLA правила
 *   - Настройка временных рамок для каждого этапа найма
 *   - Настройка приоритетов и условий применения SLA
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - SLASettings: компонент с формой управления SLA
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * - Заявки на найм: SLA используются для отслеживания сроков выполнения заявок
 * - Отчетность: SLA используются для расчета метрик и KPI
 * 
 * Поведение:
 * - При загрузке отображает форму управления SLA
 * - Является частью раздела настроек рекрутинга
 * - SLA применяются автоматически при создании новых заявок на найм
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import SLASettings from "@/components/company-settings/SLASettings"
import styles from '../company-settings.module.css'

/**
 * SLASettingsPage - компонент страницы настройки SLA для вакансий
 * 
 * Функциональность:
 * - Отображает заголовок "SLA для вакансий"
 * - Рендерит компонент SLASettings с формой управления SLA
 */
export default function SLASettingsPage() {
  return (
    <AppLayout pageTitle="SLA для вакансий">
      <Box className={styles.container}>
        {/* Заголовок страницы настройки SLA */}
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          SLA для вакансий
        </Text>

        {/* Компонент управления SLA
            - Содержит форму для создания, редактирования и удаления SLA правил
            - Настройка временных рамок для этапов найма
            - Управление приоритетами и условиями применения */}
        <SLASettings />
      </Box>
    </AppLayout>
  )
}
