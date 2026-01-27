/**
 * ScorecardSettingsPage (company-settings/scorecard/page.tsx) - Страница настроек Scorecard
 * 
 * Назначение:
 * - Управление шаблонами Scorecard для оценки кандидатов
 * - Настройка критериев оценки и вопросов для интервью
 * - Создание и редактирование шаблонов оценки
 * 
 * Функциональность:
 * - ScorecardSettings: компонент управления Scorecard
 *   - Список шаблонов Scorecard
 *   - Создание нового шаблона
 *   - Редактирование существующего шаблона
 *   - Удаление шаблона
 *   - Настройка критериев оценки и вопросов
 *   - Привязка шаблонов к вакансиям/грейдам
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - ScorecardSettings: компонент с формой управления Scorecard
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * - Интервью: Scorecard используется при проведении интервью для оценки кандидатов
 * 
 * Поведение:
 * - При загрузке отображает форму управления Scorecard
 * - Является частью раздела настроек рекрутинга
 * - Шаблоны используются при создании инвайтов и проведении интервью
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text } from "@radix-ui/themes"
import ScorecardSettings from "@/components/company-settings/ScorecardSettings"
import styles from '../company-settings.module.css'

/**
 * ScorecardSettingsPage - компонент страницы настроек Scorecard
 * 
 * Функциональность:
 * - Отображает заголовок "Настройки Scorecard"
 * - Рендерит компонент ScorecardSettings с формой управления шаблонами
 */
export default function ScorecardSettingsPage() {
  return (
    <AppLayout pageTitle="Настройки Scorecard">
      <Box className={styles.container}>
        {/* Заголовок страницы настроек Scorecard */}
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Настройки Scorecard
        </Text>

        {/* Компонент управления Scorecard
            - Содержит форму для создания, редактирования и удаления шаблонов
            - Настройка критериев оценки и вопросов
            - Привязка шаблонов к вакансиям/грейдам */}
        <ScorecardSettings />
      </Box>
    </AppLayout>
  )
}
