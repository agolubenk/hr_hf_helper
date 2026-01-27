/**
 * WorkflowPage (workflow/page.tsx) - Основная рабочая страница для работы с кандидатами
 * 
 * Назначение:
 * - Центральный хаб для работы рекрутера с кандидатами
 * - Чат для общения и внесения данных по кандидатам
 * - Управление вакансиями и этапами найма
 * - Назначение интервью и управление слотами
 * 
 * Функциональность:
 * - WorkflowHeader: заголовок с выбором вакансии и кнопками управления
 * - WorkflowChat: чат для работы с кандидатами, отправки сообщений, прикрепления файлов
 * - WorkflowSidebar: боковая панель с информацией о кандидате и статистикой
 * - SlotsPanel: панель слотов для быстрого копирования доступного времени
 * - Управление состоянием открытия/закрытия панели слотов
 * - Специальные отступы контента для этой страницы
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - WorkflowHeader: управляет выбором вакансии и открытием панели слотов
 * - WorkflowChat: основной интерфейс для работы с кандидатами
 * - WorkflowSidebar: отображает информацию о текущем кандидате
 * - SlotsPanel: показывает доступные слоты для копирования
 * 
 * Поведение:
 * - При монтировании устанавливает специальный padding для контента (8px сверху)
 * - При размонтировании восстанавливает оригинальный padding
 * - Панель слотов открывается/закрывается по клику на кнопку в WorkflowHeader
 * - Контент страницы разделен на две колонки: чат слева, сайдбар справа
 */

'use client'

import AppLayout from "@/components/AppLayout"
import WorkflowHeader from "@/components/workflow/WorkflowHeader"
import WorkflowChat from "@/components/workflow/WorkflowChat"
import WorkflowSidebar from "@/components/workflow/WorkflowSidebar"
import SlotsPanel from "@/components/workflow/SlotsPanel"
import { Box, Flex } from "@radix-ui/themes"
import { useState, useEffect } from "react"
import styles from './workflow.module.css'

/**
 * WorkflowPage - компонент основной рабочей страницы
 * 
 * Состояние:
 * - slotsOpen: флаг открытия/закрытия панели слотов
 */
export default function WorkflowPage() {
  // Состояние панели слотов: true - открыта, false - закрыта
  // Управляется кнопкой в WorkflowHeader
  const [slotsOpen, setSlotsOpen] = useState(false)

  /**
   * useEffect - устанавливает специальный верхний padding для контента AppLayout
   * 
   * Функциональность:
   * - Находит элемент контента AppLayout через CSS селектор
   * - Устанавливает padding-top: 8px для этой страницы
   * - Сохраняет оригинальное значение padding для восстановления
   * 
   * Поведение:
   * - Выполняется при монтировании компонента
   * - Восстанавливает оригинальный padding при размонтировании
   * - Используется только на этой странице для особого отступа
   * 
   * Причина:
   * - Workflow страница требует меньший верхний отступ для более компактного размещения элементов
   */
  useEffect(() => {
    // Находим элемент контента AppLayout по классу
    const contentElement = document.querySelector('.rt-Box.AppLayout_content__XSUzC') as HTMLElement
    if (contentElement) {
      // Сохраняем оригинальное значение padding для восстановления
      const originalPaddingTop = contentElement.style.paddingTop
      // Устанавливаем специальный padding для этой страницы
      contentElement.style.paddingTop = '8px'
      
      // Функция очистки: восстанавливает оригинальный padding при размонтировании
      return () => {
        // Восстанавливаем оригинальный padding при размонтировании
        if (originalPaddingTop) {
          contentElement.style.paddingTop = originalPaddingTop
        } else {
          // Если оригинального значения не было - очищаем inline стиль
          contentElement.style.paddingTop = ''
        }
      }
    }
  }, []) // Пустой массив зависимостей - выполняется только при монтировании

  /**
   * Рендер компонента Workflow страницы
   * 
   * Структура:
   * - AppLayout: общий layout с Header и Sidebar
   * - WorkflowHeader: заголовок с управлением вакансией и слотами
   * - SlotsPanel: условно рендерится при открытии панели слотов
   * - Основной контент в две колонки:
   *   - WorkflowChat: чат для работы с кандидатами (левая колонка)
   *   - WorkflowSidebar: информация о кандидате (правая колонка)
   */
  return (
    <AppLayout pageTitle="Workflow">
      {/* Контейнер страницы workflow с data-tour атрибутом для приветственного тура */}
      <Box data-tour="workflow-page" className={styles.workflowContainer}>
        {/* Заголовок workflow страницы
            - onSlotsClick: переключает состояние панели слотов (открыть/закрыть)
            - slotsOpen: передает текущее состояние панели для отображения активного состояния кнопки */}
        <WorkflowHeader 
          onSlotsClick={() => setSlotsOpen(!slotsOpen)}
          slotsOpen={slotsOpen}
        />
        
        {/* Условный рендеринг панели слотов
            - Отображается только когда slotsOpen === true
            - Содержит SlotsPanel компонент для отображения доступных слотов
            - Позволяет быстро копировать доступное время для отправки кандидату */}
        {slotsOpen && (
          <Box className={styles.slotsContainer}>
            <SlotsPanel />
          </Box>
        )}

        {/* Основной контент страницы в две колонки
            - gap="4": отступ между колонками
            - chatColumn: левая колонка с чатом
            - sidebarColumn: правая колонка с информацией о кандидате */}
        <Flex gap="4" className={styles.mainContent}>
          {/* Левая колонка: чат для работы с кандидатами
              - data-tour="workflow-chat": используется в приветственном туре
              - WorkflowChat: компонент чата с сообщениями, вводом и прикреплением файлов */}
          <Box data-tour="workflow-chat" className={styles.chatColumn}>
            <WorkflowChat />
          </Box>
          
          {/* Правая колонка: боковая панель с информацией о кандидате
              - data-tour="workflow-sidebar": используется в приветственном туре
              - WorkflowSidebar: компонент с детальной информацией о кандидате, статистикой и быстрыми действиями */}
          <Box data-tour="workflow-sidebar" className={styles.sidebarColumn}>
            <WorkflowSidebar />
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
