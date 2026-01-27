/**
 * VacancyDetailHeader (components/vacancies/VacancyDetailHeader.tsx) - Заголовок страницы детального просмотра вакансии
 * 
 * Назначение:
 * - Отображение заголовка страницы детального просмотра вакансии
 * - Навигация: возврат к списку вакансий и переход к редактированию
 * 
 * Функциональность:
 * - Заголовок: название вакансии с иконкой
 * - Кнопка "Редактировать": переход к редактированию вакансии
 * - Кнопка "Назад к списку": возврат к списку вакансий
 * 
 * Связи:
 * - vacancies/[id]/page.tsx: используется на странице детального просмотра вакансии
 * - vacancies/[id]/edit/page.tsx: переход к редактированию при клике на "Редактировать"
 * - vacancies/page.tsx: возврат к списку при клике на "Назад к списку"
 * 
 * Поведение:
 * - При клике на "Редактировать" - переход к редактированию вакансии
 * - При клике на "Назад к списку" - возврат к списку вакансий
 */
'use client'

import { Flex, Text, Button } from "@radix-ui/themes"
import { FileTextIcon, Pencil1Icon, ArrowLeftIcon } from "@radix-ui/react-icons"
import styles from './VacancyDetailHeader.module.css'

/**
 * VacancyDetailHeaderProps - интерфейс пропсов компонента VacancyDetailHeader
 * 
 * Структура:
 * - title: название вакансии для отображения в заголовке
 * - onBack: обработчик возврата к списку вакансий
 * - onEdit: обработчик перехода к редактированию вакансии
 */
interface VacancyDetailHeaderProps {
  title: string
  onBack: () => void
  onEdit: () => void
}

/**
 * VacancyDetailHeader - компонент заголовка страницы детального просмотра вакансии
 * 
 * Функциональность:
 * - Отображает название вакансии и кнопки навигации
 */
export default function VacancyDetailHeader({ title, onBack, onEdit }: VacancyDetailHeaderProps) {
  return (
    <Flex justify="between" align="center" className={styles.header}>
      {/* Левая часть: иконка и название вакансии */}
      <Flex align="center" gap="3">
        <FileTextIcon width={24} height={24} />
        <Text size="6" weight="bold">{title}</Text>
      </Flex>
      
      {/* Правая часть: кнопки действий */}
      <Flex align="center" gap="3">
        {/* Кнопка "Редактировать"
            - Переход к редактированию вакансии */}
        <Button size="3" variant="soft" onClick={onEdit} className={styles.editButton}>
          <Pencil1Icon width={16} height={16} />
          Редактировать
        </Button>
        {/* Кнопка "Назад к списку"
            - Возврат к списку вакансий */}
        <Button size="3" variant="ghost" onClick={onBack} className={styles.backButton}>
          <ArrowLeftIcon width={16} height={16} />
          Назад к списку
        </Button>
      </Flex>
    </Flex>
  )
}
