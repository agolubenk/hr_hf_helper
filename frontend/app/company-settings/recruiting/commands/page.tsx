/**
 * RecruitingCommandsSettingsPage (company-settings/recruiting/commands/page.tsx) - Страница настроек команд
 * 
 * Назначение:
 * - Управление командами для workflow чата
 * - Связывание команд с этапами найма и типами действий
 * - Настройка команд для групп действий в рекрутинге
 * 
 * Функциональность:
 * - RecruitingCommandsSettings: компонент управления командами
 *   - Список команд
 *   - Создание новой команды
 *   - Редактирование существующей команды
 *   - Удаление команды
 *   - Связывание команды с этапом найма или типом действия
 *   - Настройка цвета и описания команды
 * 
 * Особенности:
 * - Команды /add и /del являются системными и не настраиваются
 * - Команды связаны с этапами найма или типами действий (action_type)
 * - Каждая команда имеет свой цвет для визуального отображения в чате
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - RecruitingCommandsSettings: компонент с формой управления командами
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * - WorkflowChat: использует настроенные команды для обработки сообщений
 * 
 * Поведение:
 * - При загрузке отображает список команд
 * - Позволяет создавать, редактировать и удалять команды
 * - Связывает команды с этапами найма из настроек этапов
 * - Команды используются в workflow чате для создания действий
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import RecruitingCommandsSettings from "@/components/company-settings/RecruitingCommandsSettings"
import styles from '../../company-settings.module.css'

/**
 * RecruitingCommandsSettingsPage - компонент страницы настроек команд
 * 
 * Функциональность:
 * - Отображает заголовок "Команды workflow"
 * - Рендерит компонент RecruitingCommandsSettings с формой управления командами
 */
export default function RecruitingCommandsSettingsPage() {
  return (
    <AppLayout pageTitle="Команды workflow">
      <Box className={styles.container}>
        {/* Заголовок страницы настроек команд
            - Описывает назначение страницы */}
        <Box mb="4">
          <Text size="6" weight="bold" style={{ display: 'block' }}>
            Команды workflow
          </Text>
          <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
            Настройте команды для workflow чата. Команды связаны с этапами найма и типами действий.
            Команды /add и /del являются системными и не настраиваются.
          </Text>
        </Box>

        {/* Компонент управления командами
            - Содержит форму для создания, редактирования и удаления команд
            - Связывание команд с этапами найма
            - Настройка цветов и описаний */}
        <RecruitingCommandsSettings />
      </Box>
    </AppLayout>
  )
}
