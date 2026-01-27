/**
 * Error401Page (error-401/page.tsx) - Страница ошибки 401 (требуется авторизация)
 * 
 * Назначение:
 * - Отображение страницы ошибки 401 при попытке доступа без авторизации
 * - Предоставление навигации на страницу входа
 * - Визуально привлекательное отображение ошибки с анимацией
 * 
 * Функциональность:
 * - Анимированный фон с плавающими иконками (замки, пользователи, запреты)
 * - Крупный код ошибки (401)
 * - Описание ошибки для пользователя
 * - Кнопка перехода на страницу входа
 * - Кнопка перехода на главную страницу
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useRouter: для навигации на страницу входа и главную
 * - FloatingIcon: компонент плавающей иконки с анимацией (аналогичен not-found.tsx)
 * 
 * Поведение:
 * - При загрузке создает анимированный фон с 35 плавающими иконками
 * - Каждая иконка имеет случайные параметры анимации
 * - При клике на "Войти" происходит переход на /login
 * - При клике на "На главную" происходит переход на /workflow
 */

'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  HomeIcon,
  ReloadIcon,
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
  InfoCircledIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import AppLayout from "@/components/AppLayout"
import styles from './error-401.module.css'

/**
 * unauthorizedIcons - массив иконок, связанных с авторизацией и доступом
 * 
 * Используется для:
 * - Создания визуального фона, подчеркивающего тему авторизации
 * - Иконки: замки, пользователи, запреты, информация
 * - Создания динамичного визуального эффекта
 */
const unauthorizedIcons = [
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
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
 * Error401Page - компонент страницы ошибки 401
 * 
 * Функциональность:
 * - Отображает код ошибки 401
 * - Показывает сообщение о необходимости авторизации
 * - Предоставляет кнопки навигации на страницу входа и главную
 * - Создает анимированный фон с плавающими иконками
 * 
 * Поведение:
 * - При загрузке создает 35 плавающих иконок с анимацией
 * - Отображает код ошибки и описание
 * - Предоставляет два способа навигации: вход и главная
 */
export default function Error401Page() {
  // Хук Next.js для программной навигации
  const router = useRouter()

  return (
    <AppLayout pageTitle="401 - Требуется авторизация">
      <Box className={styles.container}>
        {/* Фон с плавающими иконками - 35 иконок, связанных с авторизацией */}
        <Box className={styles.background}>
          {Array.from({ length: 35 }).map((_, index) => {
            const Icon = unauthorizedIcons[index % unauthorizedIcons.length]
            return <FloatingIcon key={index} Icon={Icon as React.ComponentType<{ width?: number; height?: number }>} index={index} />
          })}
        </Box>

        {/* Контент страницы - центрированный блок с информацией об ошибке */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          {/* Код ошибки - крупный текст 401 */}
          <Text size="9" weight="bold" className={styles.errorCode}>
            401
          </Text>
          {/* Заголовок с иконкой пользователя - подчеркивает тему авторизации */}
          <Flex align="center" gap="2" mt="4">
            <PersonIcon width={32} height={32} className={styles.personIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Требуется авторизация
            </Text>
          </Flex>
          {/* Описание ошибки для пользователя */}
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этой странице необходимо войти в систему. Пожалуйста, авторизуйтесь.
          </Text>
          {/* Кнопки навигации
              - "Войти": переход на /login (страница входа)
              - "На главную": переход на /workflow (главная рабочая страница) */}
          <Flex gap="3" mt="6">
            <Button size="3" onClick={() => router.push('/login')}>
              <LockClosedIcon width={16} height={16} />
              Войти
            </Button>
            <Button size="3" variant="soft" onClick={() => router.push('/workflow')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  )
}
