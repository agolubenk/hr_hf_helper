/**
 * ForbiddenPage (forbidden/page.tsx) - Страница ошибки 403 (доступ запрещен)
 * 
 * Назначение:
 * - Отображение страницы ошибки 403 при попытке доступа без необходимых прав
 * - Предоставление навигации обратно в приложение
 * - Визуально привлекательное отображение ошибки с анимацией
 * 
 * Функциональность:
 * - Анимированный фон с плавающими иконками (замки, кресты, запреты)
 * - Крупный код ошибки (403)
 * - Описание ошибки для пользователя
 * - Кнопка перехода на главную страницу
 * - Кнопка возврата назад в истории браузера
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации на главную страницу и назад
 * - FloatingIcon: компонент плавающей иконки с анимацией (аналогичен not-found.tsx)
 * 
 * Поведение:
 * - При загрузке создает анимированный фон с 35 плавающими иконками
 * - Каждая иконка имеет случайные параметры анимации
 * - При клике на "На главную" происходит переход на /workflow
 * - При клике на "Назад" происходит возврат в истории браузера
 */

'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  HomeIcon,
  LockClosedIcon,
  CrossCircledIcon,
  Cross2Icon,
  ReloadIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import AppLayout from "@/components/AppLayout"
import styles from './forbidden.module.css'

/**
 * forbiddenIcons - массив иконок, связанных с запретом доступа
 * 
 * Используется для:
 * - Создания визуального фона, подчеркивающего тему запрета доступа
 * - Иконки: замки, кресты, запреты, предупреждения, информация
 * - Создания динамичного визуального эффекта
 */
const forbiddenIcons = [
  LockClosedIcon,
  CrossCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  LockClosedIcon,
  CrossCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  LockClosedIcon,
  CrossCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
]

interface FloatingIconProps {
  Icon: React.ComponentType<{ width?: number; height?: number }>
  index: number
}

function FloatingIcon({ Icon, index }: FloatingIconProps) {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iconRef.current) return

    // Разные скорости для разных иконок (быстрее чем раньше)
    const speedGroups = [
      { min: 8, max: 12 },   // Быстрая группа: 8-12 секунд
      { min: 12, max: 18 },  // Средняя группа: 12-18 секунд
      { min: 18, max: 25 }, // Медленная группа: 18-25 секунд
    ]
    const speedGroup = speedGroups[index % speedGroups.length]
    const duration = speedGroup.min + Math.random() * (speedGroup.max - speedGroup.min)
    
    const delay = Math.random() * 2 // Задержка до 2 секунд
    const startX = Math.random() * 100 // Начальная позиция X в процентах
    const startY = Math.random() * 100 // Начальная позиция Y в процентах
    const amplitudeX = 50 + Math.random() * 70 // Амплитуда движения по X (50-120px)
    const amplitudeY = 50 + Math.random() * 70 // Амплитуда движения по Y (50-120px)
    const size = 32 + Math.random() * 21 // Размер иконки 32-53px
    const opacity = 0.25 + Math.random() * 0.3 // Прозрачность 0.25-0.55

    iconRef.current.style.setProperty('--duration', `${duration}s`)
    iconRef.current.style.setProperty('--delay', `${delay}s`)
    iconRef.current.style.setProperty('--start-x', `${startX}%`)
    iconRef.current.style.setProperty('--start-y', `${startY}%`)
    iconRef.current.style.setProperty('--amplitude-x', `${amplitudeX}px`)
    iconRef.current.style.setProperty('--amplitude-y', `${amplitudeY}px`)
    iconRef.current.style.setProperty('--size', `${size}px`)
    iconRef.current.style.setProperty('--opacity', `${opacity}`)
  }, [index])

  return (
    <div ref={iconRef} className={styles.floatingIcon}>
      <Icon width={32} height={32} />
    </div>
  )
}

/**
 * ForbiddenPage - компонент страницы ошибки 403
 * 
 * Функциональность:
 * - Отображает код ошибки 403
 * - Показывает сообщение о запрете доступа
 * - Предоставляет кнопки навигации на главную и назад
 * - Создает анимированный фон с плавающими иконками
 * 
 * Поведение:
 * - При загрузке создает 35 плавающих иконок с анимацией
 * - Отображает код ошибки и описание
 * - Предоставляет два способа навигации: главная и назад
 */
export default function ForbiddenPage() {
  // Хук Next.js для программной навигации
  const router = useRouter()

  return (
    <AppLayout pageTitle="403 - Доступ запрещен">
      <Box className={styles.container}>
        {/* Фон с плавающими иконками - 35 иконок, связанных с запретом доступа */}
        <Box className={styles.background}>
          {Array.from({ length: 35 }).map((_, index) => {
            const Icon = forbiddenIcons[index % forbiddenIcons.length]
            return <FloatingIcon key={index} Icon={Icon as React.ComponentType<{ width?: number; height?: number }>} index={index} />
          })}
        </Box>

        {/* Контент страницы - центрированный блок с информацией об ошибке */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          {/* Код ошибки - крупный текст 403 */}
          <Text size="9" weight="bold" className={styles.errorCode}>
            403
          </Text>
          {/* Заголовок с иконкой замка - подчеркивает тему запрета доступа */}
          <Flex align="center" gap="2" mt="4">
            <LockClosedIcon width={32} height={32} className={styles.lockIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Доступ запрещен
            </Text>
          </Flex>
          {/* Описание ошибки для пользователя */}
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            У вас нет прав для доступа к этой странице. Обратитесь к администратору, если считаете, что это ошибка.
          </Text>
          {/* Кнопки навигации
              - "На главную": переход на /workflow (главная рабочая страница)
              - "Назад": возврат в истории браузера (router.back()) */}
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/workflow')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            <Button size="3" variant="soft" onClick={() => router.back()}>
              <ReloadIcon width={16} height={16} />
              Назад
            </Button>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
