/**
 * GradesSettingsPage (company-settings/grades/page.tsx) - Страница настроек грейдов
 * 
 * Назначение:
 * - Управление грейдами и уровнями сотрудников компании
 * - Настройка системы грейдирования
 * 
 * Функциональность:
 * - GradesSettings: компонент управления грейдами
 *   - Список грейдов компании
 *   - Создание нового грейда
 *   - Редактирование существующего грейда
 *   - Удаление грейда
 *   - Управление уровнями и порядком грейдов
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - GradesSettings: компонент с формой управления грейдами
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * 
 * Поведение:
 * - При загрузке отображает форму управления грейдами
 * - Является частью раздела настроек компании
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import GradesSettings from "@/components/company-settings/GradesSettings"
import styles from '../company-settings.module.css'

/**
 * GradesSettingsPage - компонент страницы настроек грейдов
 * 
 * Функциональность:
 * - Отображает заголовок "Настройки грейдов"
 * - Рендерит компонент GradesSettings с формой управления грейдами
 */
export default function GradesSettingsPage() {
  return (
    <AppLayout pageTitle="Настройки грейдов">
      <Box className={styles.container}>
        {/* Заголовок страницы настроек грейдов */}
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки грейдов
        </Text>

        {/* Компонент управления грейдами
            - Содержит форму для создания, редактирования и удаления грейдов
            - Управление уровнями и порядком грейдов */}
        <GradesSettings />
      </Box>
    </AppLayout>
  )
}
