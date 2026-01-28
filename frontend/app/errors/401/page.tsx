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
 * - При клике на "Войти" происходит переход на /account/login
 * - При клике на "На главную" происходит переход на /workflow
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Flex, Text, Button } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { 
  HomeIcon,
  ReloadIcon,
  LockClosedIcon,
  PersonIcon,
  CrossCircledIcon,
  InfoCircledIcon
} from "@radix-ui/react-icons"
// Импорты хуков Next.js для навигации и React для работы с компонентами
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
// Импорт компонента AppLayout для обертки страницы в общий layout
import AppLayout from "@/components/AppLayout"
// Импорт CSS модуля для стилизации страницы
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
    // AppLayout - обертка страницы в общий layout приложения
    // pageTitle - заголовок страницы в браузере (отображается во вкладке)
    <AppLayout pageTitle="401 - Требуется авторизация">
      {/* Основной контейнер страницы - занимает всю доступную высоту экрана
          styles.container - стили для позиционирования и центрирования контента */}
      <Box className={styles.container}>
        {/* Фон с плавающими иконками - 35 иконок, связанных с авторизацией
            styles.background - стили для фонового контейнера с анимацией
            Создает визуально привлекательный фон с плавающими иконками */}
        <Box className={styles.background}>
          {/* Генерируем 35 плавающих иконок
              Используем Array.from для создания массива нужной длины
              map создает компонент FloatingIcon для каждого элемента
              index используется для определения параметров анимации и выбора иконки */}
          {Array.from({ length: 35 }).map((_, index) => {
            // Выбираем иконку из массива циклически (используем остаток от деления)
            // Это позволяет повторять иконки, если их меньше 35
            const Icon = unauthorizedIcons[index % unauthorizedIcons.length]
            return <FloatingIcon key={index} Icon={Icon as React.ComponentType<{ width?: number; height?: number }>} index={index} />
          })}
        </Box>

        {/* Контент страницы - центрированный блок с информацией об ошибке
            styles.content - стили для контентного блока (полупрозрачный фон, размытие, тени)
            direction="column" - вертикальное расположение элементов
            align="center" - горизонтальное выравнивание по центру
            justify="center" - вертикальное выравнивание по центру */}
        <Flex direction="column" align="center" justify="center" className={styles.content}>
          {/* Код ошибки - крупный текст 401
              size="9" - максимальный размер текста в Radix UI
              weight="bold" - жирное начертание
              styles.errorCode - стили для кода ошибки (градиентная заливка, анимация пульсации) */}
          <Text size="9" weight="bold" className={styles.errorCode}>
            401
          </Text>
          {/* Заголовок с иконкой пользователя - подчеркивает тему авторизации
              align="center" - выравнивание элементов по центру
              gap="2" - отступ между иконкой и текстом
              mt="4" - отступ сверху */}
          <Flex align="center" gap="2" mt="4">
            {/* Иконка пользователя - визуально подчеркивает тему авторизации
                width={32} height={32} - размер иконки
                styles.personIcon - стили для иконки (цвет, анимация подпрыгивания) */}
            <PersonIcon width={32} height={32} className={styles.personIcon} />
            {/* Текст заголовка - название ошибки
                size="6" - крупный размер текста
                weight="bold" - жирное начертание
                styles.title - стили для заголовка */}
            <Text size="6" weight="bold" className={styles.title}>
              Требуется авторизация
            </Text>
          </Flex>
          {/* Описание ошибки для пользователя
              size="4" - средний размер текста
              color="gray" - серый цвет для визуального отличия от заголовка
              mt="3" - отступ сверху
              style - инлайн стили для центрирования текста и ограничения ширины */}
          <Text size="4" color="gray" mt="3" style={{ textAlign: 'center', maxWidth: '500px' }}>
            Для доступа к этой странице необходимо войти в систему. Пожалуйста, авторизуйтесь.
          </Text>
          {/* Кнопки навигации
              - "Войти": переход на /account/login (страница входа)
              - "На главную": переход на /workflow (главная рабочая страница) */}
          <Flex gap="3" mt="6">
            {/* Кнопка "Войти" - основной способ решения проблемы (переход на страницу авторизации)
                Использует router.push для программной навигации на /account/login */}
            <Button size="3" onClick={() => router.push('/account/login')}>
              <LockClosedIcon width={16} height={16} />
              Войти
            </Button>
            {/* Кнопка "На главную" - альтернативный способ навигации (переход на главную страницу)
                Использует variant="soft" для визуального отличия от основной кнопки
                Использует router.push для программной навигации на /workflow */}
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
