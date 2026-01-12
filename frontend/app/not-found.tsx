'use client'

import { Box, Flex, Text, Button } from "@radix-ui/themes"
import { 
  HomeIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  ListBulletIcon,
  PlusIcon,
  ClockIcon,
  ClipboardIcon,
  BarChartIcon,
  DashboardIcon,
  PersonIcon,
  FileTextIcon,
  GearIcon,
  StarIcon,
  ReloadIcon,
  MixerHorizontalIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import AppLayout from "@/components/AppLayout"
import styles from './not-found.module.css'

// Иконки из меню для анимации
const menuIcons = [
  HomeIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  ListBulletIcon,
  PlusIcon,
  ClockIcon,
  ClipboardIcon,
  BarChartIcon,
  DashboardIcon,
  PersonIcon,
  FileTextIcon,
  GearIcon,
  StarIcon,
  ReloadIcon,
  MixerHorizontalIcon,
  CheckIcon,
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
    // Создаем 3 группы скоростей: быстрая, средняя, медленная
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
    const size = 32 + Math.random() * 21 // Размер иконки 32-53px (уменьшено в 1.5 раза)
    const opacity = 0.25 + Math.random() * 0.3 // Прозрачность 0.25-0.55 (более заметные)

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

export default function NotFound() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="404 - Страница не найдена">
      <Box className={styles.container}>
      {/* Фон с плавающими иконками */}
      <Box className={styles.background}>
        {Array.from({ length: 40 }).map((_, index) => {
          const Icon = menuIcons[index % menuIcons.length]
          return <FloatingIcon key={index} Icon={Icon} index={index} />
        })}
      </Box>

        {/* Контент страницы */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          <Text size="9" weight="bold" className={styles.errorCode}>
            404
          </Text>
          <Flex align="center" gap="2" mt="4">
            <Box className={styles.searchIconWrapper}>
              <MagnifyingGlassIcon width={32} height={32} className={styles.searchIcon} />
            </Box>
            <Text size="6" weight="bold" className={styles.title}>
              Страница не найдена
            </Text>
          </Flex>
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </Text>
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
