/**
 * CompanySettingsPage (company-settings/page.tsx) - Главная страница настроек компании
 * 
 * Назначение:
 * - Отображение общих настроек компании
 * - Управление базовыми параметрами компании (логотип, офисы, календарь)
 * 
 * Функциональность:
 * - GeneralSettings: компонент общих настроек компании
 *   - Логотип компании
 *   - Офисы и локации
 *   - Календарь (рабочие дни, праздники)
 *   - Базовые параметры компании
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - GeneralSettings: компонент с формой общих настроек
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * 
 * Поведение:
 * - При загрузке отображает форму общих настроек
 * - data-tour="company-settings-page": используется в приветственном туре
 * - Является точкой входа в раздел настроек компании
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import GeneralSettings from "@/components/company-settings/GeneralSettings"
import styles from './company-settings.module.css'

/**
 * CompanySettingsPage - компонент главной страницы настроек компании
 * 
 * Функциональность:
 * - Отображает заголовок "Общие настройки"
 * - Рендерит компонент GeneralSettings с формой настроек
 */
export default function CompanySettingsPage() {
  return (
    <AppLayout pageTitle="Общие настройки компании">
      <Box data-tour="company-settings-page" className={styles.container}>
        {/* Заголовок страницы настроек компании
            - data-tour: используется в приветственном туре для описания раздела */}
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Общие настройки
        </Text>

        {/* Компонент общих настроек компании
            - Содержит форму для редактирования базовых параметров
            - Логотип, офисы, календарь, рабочие дни */}
        <GeneralSettings />
      </Box>
    </AppLayout>
  )
}
