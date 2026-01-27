/**
 * Error500Page (error-500/page.tsx) - Страница ошибки 500 (внутренняя ошибка сервера)
 * 
 * Назначение:
 * - Отображение страницы ошибки 500 при внутренней ошибке сервера
 * - Предоставление навигации обратно в приложение
 * - Визуально привлекательное отображение ошибки с анимацией
 * 
 * Функциональность:
 * - Анимированный фон с плавающими иконками (предупреждения, ошибки, вопросы)
 * - Крупный код ошибки (500)
 * - Описание ошибки для пользователя
 * - Кнопка перехода на главную страницу
 * - Кнопка обновления страницы
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации на главную страницу
 * - FloatingIcon: компонент плавающей иконки с анимацией (аналогичен not-found.tsx)
 * 
 * Поведение:
 * - При загрузке создает анимированный фон с 35 плавающими иконками
 * - Каждая иконка имеет случайные параметры анимации
 * - При клике на "На главную" происходит переход на /workflow
 * - При клике на "Обновить" происходит перезагрузка страницы (window.location.reload())
 */

'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  HomeIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import AppLayout from "@/components/AppLayout"
import styles from './error-500.module.css'

/**
 * errorIcons - массив иконок, связанных с ошибками и предупреждениями
 * 
 * Используется для:
 * - Создания визуального фона, подчеркивающего тему ошибки
 * - Иконки: предупреждения, кресты, вопросы, информация
 * - Создания динамичного визуального эффекта
 */
const errorIcons = [
  ExclamationTriangleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
]

interface FloatingIconProps {
  Icon: React.ComponentType<{ width?: number; height?: number }>
  index: number
}

function FloatingIcon({ Icon, index }: FloatingIconProps) {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iconRef.current) return

    const speedGroups = [
      { min: 8, max: 12 },
      { min: 12, max: 18 },
      { min: 18, max: 25 },
    ]
    const speedGroup = speedGroups[index % speedGroups.length]
    const duration = speedGroup.min + Math.random() * (speedGroup.max - speedGroup.min)
    
    const delay = Math.random() * 2
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    const amplitudeX = 50 + Math.random() * 70
    const amplitudeY = 50 + Math.random() * 70
    const size = 32 + Math.random() * 21
    const opacity = 0.25 + Math.random() * 0.3

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
 * Error500Page - компонент страницы ошибки 500
 * 
 * Функциональность:
 * - Отображает код ошибки 500
 * - Показывает сообщение о внутренней ошибке сервера
 * - Предоставляет кнопки навигации на главную и обновления страницы
 * - Создает анимированный фон с плавающими иконками
 * 
 * Поведение:
 * - При загрузке создает 35 плавающих иконок с анимацией
 * - Отображает код ошибки и описание
 * - Предоставляет два способа действия: переход на главную и обновление страницы
 */
export default function Error500Page() {
  // Хук Next.js для программной навигации
  const router = useRouter()

  return (
    <AppLayout pageTitle="500 - Ошибка сервера">
      <Box className={styles.container}>
        {/* Фон с плавающими иконками - 35 иконок, связанных с ошибками */}
        <Box className={styles.background}>
          {Array.from({ length: 35 }).map((_, index) => {
            const Icon = errorIcons[index % errorIcons.length]
            return <FloatingIcon key={index} Icon={Icon as React.ComponentType<{ width?: number; height?: number }>} index={index} />
          })}
        </Box>

        {/* Контент страницы - центрированный блок с информацией об ошибке */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          {/* Код ошибки - крупный текст 500 */}
          <Text size="9" weight="bold" className={styles.errorCode}>
            500
          </Text>
          {/* Заголовок с иконкой предупреждения - подчеркивает тему ошибки */}
          <Flex align="center" gap="2" mt="4">
            <ExclamationTriangleIcon width={32} height={32} className={styles.errorIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Ошибка сервера
            </Text>
          </Flex>
          {/* Описание ошибки для пользователя */}
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Произошла внутренняя ошибка сервера. Мы уже работаем над её устранением. Попробуйте обновить страницу через несколько минут.
          </Text>
          {/* Кнопки навигации
              - "На главную": переход на /workflow (главная рабочая страница)
              - "Обновить": перезагрузка текущей страницы (window.location.reload()) */}
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/workflow')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            <Button size="3" variant="soft" onClick={() => window.location.reload()}>
              <ReloadIcon width={16} height={16} />
              Обновить
            </Button>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
