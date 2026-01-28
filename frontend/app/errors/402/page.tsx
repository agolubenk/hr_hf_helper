/**
 * Error402Page (error-402/page.tsx) - Страница ошибки 402 (требуется оплата)
 * 
 * Назначение:
 * - Отображение страницы ошибки 402 при попытке доступа к платному контенту
 * - Предоставление навигации обратно в приложение
 * - Визуально привлекательное отображение ошибки с анимацией
 * 
 * Функциональность:
 * - Анимированный фон с плавающими иконками (звезды, галочки, запреты)
 * - Крупный код ошибки (402)
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

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Flex, Text, Button } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления (звезды, галочки, запреты)
import { 
  HomeIcon,
  ReloadIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon
} from "@radix-ui/react-icons"
// Импорты хуков Next.js для навигации и React для работы с компонентами
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
// Импорт компонента AppLayout для обертки страницы в общий layout
import AppLayout from "@/components/AppLayout"
// Импорт CSS модуля для стилизации страницы
import styles from './error-402.module.css'

/**
 * paymentIcons - массив иконок, связанных с оплатой и статусами
 * 
 * Используется для:
 * - Создания визуального фона, подчеркивающего тему оплаты
 * - Иконки: звезды, галочки, запреты, информация
 * - Создания динамичного визуального эффекта
 */
const paymentIcons = [
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  StarIcon,
  CheckCircledIcon,
  CrossCircledIcon,
]

/**
 * FloatingIconProps - пропсы компонента плавающей иконки
 * 
 * @param Icon - компонент иконки из Radix UI
 * @param index - индекс иконки для определения параметров анимации
 */
interface FloatingIconProps {
  Icon: React.ComponentType<{ width?: number; height?: number }>
  index: number
}

/**
 * FloatingIcon - компонент плавающей иконки с анимацией
 * 
 * Функциональность:
 * - Создает анимированную иконку, плавающую по экрану
 * - Генерирует случайные параметры анимации для каждой иконки
 * - Применяет CSS переменные для управления анимацией через CSS
 * 
 * Параметры анимации:
 * - duration: длительность одного цикла анимации (8-25 секунд, зависит от группы скорости)
 * - delay: задержка перед началом анимации (0-2 секунды)
 * - startX/startY: начальная позиция иконки (0-100%)
 * - amplitudeX/amplitudeY: амплитуда движения (50-120px)
 * - size: размер иконки (32-53px)
 * - opacity: прозрачность иконки (0.25-0.55)
 * 
 * Группы скоростей:
 * - Быстрая: 8-12 секунд (индексы 0, 3, 6, ...)
 * - Средняя: 12-18 секунд (индексы 1, 4, 7, ...)
 * - Медленная: 18-25 секунд (индексы 2, 5, 8, ...)
 * 
 * Поведение:
 * - При монтировании компонента генерирует случайные параметры
 * - Устанавливает CSS переменные для анимации
 * - CSS анимация управляется через класс styles.floatingIcon
 * 
 * Связи:
 * - Использует CSS переменные для передачи параметров в CSS анимацию
 * - CSS класс styles.floatingIcon определяет ключевые кадры анимации
 */
function FloatingIcon({ Icon, index }: FloatingIconProps) {
  // Ref для доступа к DOM элементу иконки
  const iconRef = useRef<HTMLDivElement>(null)

  /**
   * useEffect - инициализация параметров анимации для иконки
   * 
   * Функциональность:
   * - Генерирует случайные параметры анимации на основе индекса
   * - Устанавливает CSS переменные для управления анимацией
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента
   * - Создает уникальные параметры для каждой иконки
   * - Параметры определяют траекторию и скорость движения иконки
   */
  useEffect(() => {
    if (!iconRef.current) return

    // Разные скорости для разных иконок
    // Создаем 3 группы скоростей: быстрая, средняя, медленная
    // Группа определяется остатком от деления индекса на 3
    const speedGroups = [
      { min: 8, max: 12 },   // Быстрая группа: 8-12 секунд
      { min: 12, max: 18 },  // Средняя группа: 12-18 секунд
      { min: 18, max: 25 }, // Медленная группа: 18-25 секунд
    ]
    const speedGroup = speedGroups[index % speedGroups.length]
    // Длительность анимации: случайное значение в пределах группы
    const duration = speedGroup.min + Math.random() * (speedGroup.max - speedGroup.min)
    
    // Случайные параметры анимации для создания уникального движения каждой иконки
    const delay = Math.random() * 2 // Задержка до 2 секунд перед началом анимации
    const startX = Math.random() * 100 // Начальная позиция X в процентах (0-100%)
    const startY = Math.random() * 100 // Начальная позиция Y в процентах (0-100%)
    const amplitudeX = 50 + Math.random() * 70 // Амплитуда движения по X (50-120px)
    const amplitudeY = 50 + Math.random() * 70 // Амплитуда движения по Y (50-120px)
    const size = 32 + Math.random() * 21 // Размер иконки 32-53px
    const opacity = 0.25 + Math.random() * 0.3 // Прозрачность 0.25-0.55

    // Устанавливаем CSS переменные для управления анимацией через CSS
    iconRef.current.style.setProperty('--duration', `${duration}s`)
    iconRef.current.style.setProperty('--delay', `${delay}s`)
    iconRef.current.style.setProperty('--start-x', `${startX}%`)
    iconRef.current.style.setProperty('--start-y', `${startY}%`)
    iconRef.current.style.setProperty('--amplitude-x', `${amplitudeX}px`)
    iconRef.current.style.setProperty('--amplitude-y', `${amplitudeY}px`)
    iconRef.current.style.setProperty('--size', `${size}px`)
    iconRef.current.style.setProperty('--opacity', `${opacity}`)
  }, [index]) // Зависимость от index - параметры генерируются один раз при монтировании

  return (
    <div ref={iconRef} className={styles.floatingIcon}>
      <Icon width={32} height={32} />
    </div>
  )
}

/**
 * Error402Page - компонент страницы ошибки 402
 * 
 * Функциональность:
 * - Отображает код ошибки 402
 * - Показывает сообщение о необходимости оплаты
 * - Предоставляет кнопки навигации на главную и назад
 * - Создает анимированный фон с плавающими иконками
 * 
 * Поведение:
 * - При загрузке создает 35 плавающих иконок с анимацией
 * - Отображает код ошибки и описание
 * - Предоставляет два способа навигации: главная и назад
 */
export default function Error402Page() {
  // Хук Next.js для программной навигации
  const router = useRouter()

  return (
    // AppLayout - обертка страницы в общий layout приложения
    // pageTitle - заголовок страницы в браузере (отображается во вкладке)
    <AppLayout pageTitle="402 - Требуется оплата">
      <Box className={styles.container}>
        {/* Фон с плавающими иконками - 35 иконок, связанных с оплатой */}
        <Box className={styles.background}>
          {Array.from({ length: 35 }).map((_, index) => {
            const Icon = paymentIcons[index % paymentIcons.length]
            return <FloatingIcon key={index} Icon={Icon as React.ComponentType<{ width?: number; height?: number }>} index={index} />
          })}
        </Box>

        {/* Контент страницы - центрированный блок с информацией об ошибке */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          {/* Код ошибки - крупный текст 402 */}
          <Text size="9" weight="bold" className={styles.errorCode}>
            402
          </Text>
          {/* Заголовок с иконкой звезды - подчеркивает тему оплаты/премиум */}
          <Flex align="center" gap="2" mt="4">
            <StarIcon width={32} height={32} className={styles.cardIcon} />
            <Text size="6" weight="bold" className={styles.title}>
              Требуется оплата
            </Text>
          </Flex>
          {/* Описание ошибки для пользователя */}
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этому контенту требуется оплата. Пожалуйста, выполните оплату для продолжения.
          </Text>
          {/* Кнопки навигации
              - "На главную": переход на /workflow (главная рабочая страница)
              - "Назад": возврат в истории браузера (router.back()) */}
          <Flex gap="3" mt="6">
            {/* Кнопка "На главную" - основной способ навигации (переход на главную страницу)
                Использует router.push для программной навигации на /workflow */}
            <Button size="3" onClick={() => router.push('/workflow')}>
              <HomeIcon width={16} height={16} />
              На главную
            </Button>
            {/* Кнопка "Назад" - альтернативный способ навигации (возврат в истории браузера)
                Использует variant="soft" для визуального отличия от основной кнопки
                Использует router.back() для возврата на предыдущую страницу в истории браузера */}
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
