/**
 * ProfilePage (profile/page.tsx) - Страница профиля пользователя
 * 
 * Назначение:
 * - Управление профилем пользователя
 * - Редактирование личных данных
 * - Настройка интеграций и API
 * - Управление быстрыми кнопками
 * - Настройка акцентного цвета темы
 * 
 * Функциональность:
 * - UserCard: карточка пользователя с основной информацией
 * - ProfileNavigation: навигация между вкладками профиля
 * - ProfileInfo: просмотр информации о пользователе
 * - ProfileEditForm: редактирование данных пользователя
 * - IntegrationsPage: настройка интеграций и API
 * - QuickButtonsPage: управление быстрыми кнопками
 * - AccentColorSettings: настройка акцентного цвета темы
 * - Синхронизация активной вкладки через localStorage и URL параметры
 * - Синхронизация между вкладками браузера через события
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useTheme: получение и установка акцентных цветов темы
 * - Sidebar: может открывать страницу профиля с определенной вкладкой через localStorage
 * - Header: при клике на имя пользователя происходит переход на эту страницу
 * 
 * Поведение:
 * - При загрузке определяет активную вкладку из URL (?tab=) или localStorage
 * - Сохраняет активную вкладку в localStorage при изменении
 * - Синхронизирует вкладку между вкладками браузера через события storage
 * - Поддерживает глубокие ссылки на конкретные вкладки через URL параметры
 * - При переходе из Sidebar на "Интеграции и API" открывает вкладку integrations
 */

'use client'

// Импорт компонента AppLayout для обертки страницы в общий layout
import AppLayout from "@/components/AppLayout"
// Импорты компонентов Radix UI для создания интерфейса
import { Flex, Box } from "@radix-ui/themes"
// Импорты компонентов профиля для отображения различных вкладок
import UserCard from "@/components/profile/UserCard"
import ProfileNavigation from "@/components/profile/ProfileNavigation"
import ProfileInfo from "@/components/profile/ProfileInfo"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import IntegrationsPage from "@/components/profile/IntegrationsPage"
import AccentColorSettings from "@/components/profile/AccentColorSettings"
import QuickButtonsPage from "@/components/profile/QuickButtonsPage"
// Импорт хука для работы с темой (получение и установка акцентных цветов)
import { useTheme } from "@/components/ThemeProvider"
// Импорты хуков React для управления состоянием и жизненным циклом
import { useState, useEffect } from "react"
// Импорт CSS модуля для стилизации страницы
import styles from './profile.module.css'

/**
 * TabType - тип вкладки профиля
 * 
 * Возможные значения:
 * - 'profile': просмотр информации о пользователе
 * - 'edit': редактирование данных пользователя
 * - 'integrations': настройка интеграций и API
 * - 'quick-buttons': управление быстрыми кнопками
 */
type TabType = 'profile' | 'edit' | 'integrations' | 'quick-buttons'

/**
 * ProfilePage - компонент страницы профиля
 * 
 * Состояние:
 * - activeTab: текущая активная вкладка профиля
 */
export default function ProfilePage() {
  /**
   * getInitialTab - определение начальной активной вкладки
   * 
   * Логика определения:
   * 1. Проверяет URL параметр ?tab= (приоритет)
   * 2. Если параметр 'integrations' - возвращает 'integrations'
   * 3. Проверяет localStorage на наличие сохраненной вкладки
   * 4. Если сохраненная вкладка валидна - возвращает её
   * 5. По умолчанию возвращает 'profile'
   * 
   * Используется для:
   * - Восстановления активной вкладки при перезагрузке страницы
   * - Открытия конкретной вкладки через URL параметры
   * - Синхронизации с Sidebar (при клике на "Интеграции и API")
   * 
   * @returns начальная активная вкладка
   */
  const getInitialTab = (): TabType => {
    if (typeof window !== 'undefined') {
      // Проверяем URL параметр ?tab= (высший приоритет)
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'integrations') return 'integrations'
      // Проверяем localStorage на наличие сохраненной вкладки
      const saved = localStorage.getItem('profileActiveTab')
      // Валидируем сохраненное значение перед использованием
      if (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons') {
        return saved as TabType
      }
    }
    // По умолчанию возвращаем вкладку профиля
    return 'profile'
  }

  // Состояние активной вкладки: инициализируется из URL или localStorage
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab)

  /**
   * useEffect - сохранение активной вкладки в localStorage
   * 
   * Функциональность:
   * - Сохраняет текущую активную вкладку в localStorage при каждом изменении
   * - Позволяет восстановить вкладку при следующем посещении страницы
   * 
   * Поведение:
   * - Выполняется при каждом изменении activeTab
   * - Сохраняет значение в localStorage с ключом 'profileActiveTab'
   * - Используется для синхронизации между вкладками браузера
   * 
   * Связи:
   * - Синхронизируется с Sidebar: при клике на "Интеграции и API" Sidebar сохраняет 'integrations'
   * - Восстанавливается при следующем открытии страницы профиля
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab)
    }
  }, [activeTab])

  /**
   * useEffect - синхронизация активной вкладки между вкладками браузера
   * 
   * Функциональность:
   * - Слушает изменения localStorage из других вкладок браузера (storage event)
   * - Слушает кастомные события localStorageChange в той же вкладке
   * - Проверяет изменения при фокусе на окне
   * - Периодически проверяет localStorage для надежной синхронизации
   * 
   * Механизмы синхронизации:
   * 1. storage event: срабатывает при изменении localStorage в другой вкладке
   * 2. localStorageChange: кастомное событие для синхронизации в той же вкладке
   * 3. focus event: проверка при возврате фокуса на окно
   * 4. setInterval: периодическая проверка каждые 200мс для надежности
   * 
   * Поведение:
   * - При изменении activeTab в другой вкладке - обновляет текущую вкладку
   * - При клике на "Интеграции и API" в Sidebar - открывает вкладку integrations
   * - При возврате фокуса на окно - проверяет актуальное значение
   * - Периодическая проверка обеспечивает надежную синхронизацию
   * 
   * Связи:
   * - Sidebar: при клике на "Интеграции и API" сохраняет 'integrations' в localStorage
   * - Header: при клике на имя пользователя может устанавливать активную вкладку
   * 
   * Очистка:
   * - Удаляет все обработчики событий при размонтировании компонента
   * - Очищает интервал периодической проверки
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    /**
     * handleStorageChange - обработчик изменения localStorage из другой вкладки
     * 
     * Функциональность:
     * - Срабатывает при изменении localStorage в другой вкладке браузера
     * - Обновляет активную вкладку, если изменился 'profileActiveTab'
     * 
     * Поведение:
     * - Валидирует новое значение перед установкой
     * - Обновляет activeTab только если значение валидно
     */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileActiveTab' && e.newValue) {
        const newTab = e.newValue as TabType
        if (newTab === 'profile' || newTab === 'edit' || newTab === 'integrations' || newTab === 'quick-buttons') {
          setActiveTab(newTab)
        }
      }
    }

    /**
     * handleCustomStorageChange - обработчик кастомного события для синхронизации в той же вкладке
     * 
     * Функциональность:
     * - Срабатывает при отправке кастомного события 'localStorageChange'
     * - Используется для синхронизации в той же вкладке (storage event не срабатывает)
     * 
     * Поведение:
     * - Обрабатывает события с detail.key === 'profileActiveTab'
     * - Валидирует и обновляет activeTab
     * 
     * Связи:
     * - Sidebar отправляет это событие при клике на "Интеграции и API"
     */
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'profileActiveTab' && e.detail?.value) {
        const newTab = e.detail.value as TabType
        if (newTab === 'profile' || newTab === 'edit' || newTab === 'integrations' || newTab === 'quick-buttons') {
          setActiveTab(newTab)
        }
      }
    }

    /**
     * handleFocus - обработчик фокуса на окне
     * 
     * Функциональность:
     * - Проверяет актуальное значение в localStorage при возврате фокуса
     * - Синхронизирует activeTab с localStorage
     * 
     * Поведение:
     * - Срабатывает при возврате фокуса на окно браузера
     * - Полезно, если пользователь переключился между вкладками браузера
     */
    const handleFocus = () => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons')) {
        setActiveTab(saved as TabType)
      }
    }

    // Подписываемся на события для синхронизации
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener)
    window.addEventListener('focus', handleFocus)

    /**
     * Периодическая проверка localStorage для надежной синхронизации
     * 
     * Функциональность:
     * - Проверяет значение в localStorage каждые 200мс
     * - Обновляет activeTab, если значение изменилось
     * 
     * Поведение:
     * - Обеспечивает надежную синхронизацию даже если события не сработали
     * - Обновляет только если значение действительно изменилось
     * 
     * Причина использования:
     * - Некоторые браузеры могут не всегда корректно обрабатывать storage events
     * - Дополнительная гарантия синхронизации между вкладками
     */
    const intervalId = setInterval(() => {
      const saved = localStorage.getItem('profileActiveTab')
      if (saved && (saved === 'profile' || saved === 'edit' || saved === 'integrations' || saved === 'quick-buttons')) {
        const newTab = saved as TabType
        setActiveTab(prev => {
          // Обновляем только если значение изменилось
          if (prev !== newTab) {
            return newTab
          }
          return prev
        })
      }
    }, 200)

    // Очистка: удаляем все обработчики событий и интервал при размонтировании
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, []) // Пустой массив зависимостей - выполняется только при монтировании
  // Получение акцентных цветов темы и функций их изменения из ThemeProvider
  const { lightThemeAccentColor, darkThemeAccentColor, setLightThemeAccentColor, setDarkThemeAccentColor } = useTheme()

  /**
   * userData - моковые данные пользователя
   * 
   * Структура:
   * - firstName, lastName: имя и фамилия
   * - email: электронная почта
   * - telegram, linkedin: контакты в социальных сетях
   * - registrationDate, lastLoginDate: даты регистрации и последнего входа
   * - workSchedule, workStartTime, workEndTime: рабочий график (если все дни одинаковые)
   * - workTimeByDay: рабочий график по дням недели (если каждый день отдельно)
   * - meetingInterval: интервал встреч в минутах
   * - activeEnvironment: активное окружение (Прод/Тест)
   * 
   * TODO: Заменить на реальные данные из API
   */
  const [userData, setUserData] = useState({
    firstName: 'Andrei',
    lastName: 'Golubenko',
    email: 'andrei.golubenko@softnetix.io',
    telegram: 'talent_softnetix',
    linkedin: 'andrei-golubenko',
    registrationDate: '05.09.2025 15:03',
    lastLoginDate: '08.01.2026 10:57',
    workSchedule: '11:00 - 18:30',
    workStartTime: '11:00',
    workEndTime: '18:30',
    meetingInterval: '15',
    activeEnvironment: 'Прод',
  } as {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    registrationDate: string
    lastLoginDate: string
    workSchedule?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: {
      monday?: { start: string; end: string }
      tuesday?: { start: string; end: string }
      wednesday?: { start: string; end: string }
      thursday?: { start: string; end: string }
      friday?: { start: string; end: string }
    }
    meetingInterval: string
    activeEnvironment: string
  })

  /**
   * handleSave - обработчик сохранения данных пользователя
   * 
   * Функциональность:
   * - Сохраняет отредактированные данные пользователя
   * - Отправляет данные на сервер через API
   * - Обрабатывает результат сохранения
   * 
   * Поведение:
   * - Вызывается из ProfileEditForm при нажатии кнопки "Сохранить"
   * - В текущей реализации только логирует данные
   * - После успешного сохранения можно вернуться на вкладку профиля
   * 
   * Связи:
   * - ProfileEditForm: вызывает эту функцию при сохранении
   * - API: должен отправлять данные на сервер для сохранения
   * 
   * @param data - объект с данными пользователя для сохранения
   * 
   * TODO: Реализовать реальное сохранение через API
   */
  const handleSave = (data: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: {
      monday?: { start: string; end: string }
      tuesday?: { start: string; end: string }
      wednesday?: { start: string; end: string }
      thursday?: { start: string; end: string }
      friday?: { start: string; end: string }
    }
    meetingInterval?: string
  }) => {
    console.log('Сохранение данных:', data)
    // Обновляем userData для отображения (в реальном приложении это будет через API)
    setUserData(prev => {
      const updated = { ...prev, ...data }
      if (data.workStartTime && data.workEndTime) {
        updated.workSchedule = `${data.workStartTime} - ${data.workEndTime}`
        updated.workStartTime = data.workStartTime
        updated.workEndTime = data.workEndTime
        updated.workTimeByDay = undefined
      } else if (data.workTimeByDay) {
        updated.workTimeByDay = data.workTimeByDay
        updated.workSchedule = undefined
        updated.workStartTime = undefined
        updated.workEndTime = undefined
      }
      return updated
    })
    // Здесь будет логика сохранения через API
    // После успешного сохранения можно вернуться на вкладку профиля
    // setActiveTab('profile')
  }

  /**
   * handleCancel - обработчик отмены редактирования
   * 
   * Функциональность:
   * - Отменяет редактирование и возвращает на вкладку просмотра профиля
   * 
   * Поведение:
   * - Вызывается из ProfileEditForm при нажатии кнопки "Отмена"
   * - Переключает активную вкладку на 'profile'
   * 
   * Связи:
   * - ProfileEditForm: вызывает эту функцию при отмене
   */
  const handleCancel = () => {
    setActiveTab('profile')
  }

  /**
   * renderContent - функция рендеринга содержимого в зависимости от активной вкладки
   * 
   * Функциональность:
   * - Определяет, какой компонент отображать в зависимости от activeTab
   * - Передает необходимые пропсы в каждый компонент
   * 
   * Вкладки:
   * - 'profile': ProfileInfo - просмотр информации о пользователе
   * - 'edit': ProfileEditForm + AccentColorSettings - редактирование данных и настройка цвета
   * - 'integrations': IntegrationsPage - настройка интеграций и API
   * - 'quick-buttons': QuickButtonsPage - управление быстрыми кнопками
   * 
   * Поведение:
   * - Возвращает соответствующий компонент в зависимости от activeTab
   * - На вкладке 'edit' отображает форму редактирования и настройки цвета
   * 
   * @returns JSX компонент для отображения в правой колонке
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        // Вкладка просмотра: отображает информацию о пользователе
        return <ProfileInfo userData={userData} />
      case 'edit':
        // Вкладка редактирования: форма редактирования + настройки цвета
        return (
          <Flex direction="column" gap="4">
            {/* Форма редактирования данных пользователя
                - initialData: начальные данные для заполнения формы
                - onCancel: обработчик отмены (возврат на вкладку профиля)
                - onSave: обработчик сохранения (отправка данных на сервер) */}
            <ProfileEditForm
              initialData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                telegram: userData.telegram,
                linkedin: userData.linkedin,
                workStartTime: userData.workStartTime,
                workEndTime: userData.workEndTime,
                workTimeByDay: userData.workTimeByDay,
                meetingInterval: userData.meetingInterval,
              }}
              onCancel={handleCancel}
              onSave={handleSave}
            />
            {/* Настройки акцентного цвета под карточкой редактирования
                - lightThemeColor: акцентный цвет для светлой темы
                - darkThemeColor: акцентный цвет для темной темы
                - onLightThemeColorChange: обработчик изменения цвета светлой темы
                - onDarkThemeColorChange: обработчик изменения цвета темной темы
                - При изменении цвета остаемся на вкладке редактирования */}
            <AccentColorSettings
              lightThemeColor={lightThemeAccentColor}
              darkThemeColor={darkThemeAccentColor}
              onLightThemeColorChange={(color) => {
                setLightThemeAccentColor(color)
                // Остаемся на вкладке редактирования
              }}
              onDarkThemeColorChange={(color) => {
                setDarkThemeAccentColor(color)
                // Остаемся на вкладке редактирования
              }}
            />
          </Flex>
        )
      case 'integrations':
        // Вкладка интеграций: настройка интеграций и API
        return <IntegrationsPage />
      case 'quick-buttons':
        // Вкладка быстрых кнопок: управление быстрыми кнопками
        return <QuickButtonsPage />
      default:
        return null
    }
  }

  /**
   * Рендер компонента страницы профиля
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Двухколоночная раскладка:
   *   - Левая колонка: карточка пользователя и навигация
   *   - Правая колонка: содержимое активной вкладки
   */
  // AppLayout - обертка страницы в общий layout приложения
  // pageTitle - заголовок страницы в браузере (отображается во вкладке)
  return (
    <AppLayout pageTitle="Профиль">
      {/* Основной контейнер страницы профиля
          id="main-content-start" - идентификатор для навигации с клавиатуры (accessibility)
          styles.profileWrapper - стили для основного контейнера */}
      <Box id="main-content-start" className={styles.profileWrapper}>
        {/* Двухколоночная раскладка профиля
            gap="4" - отступ между колонками
            styles.profileLayout - стили для раскладки (flex, gap, адаптивность) */}
        <Flex gap="4" className={styles.profileLayout}>
          {/* Левая колонка: карточка пользователя и навигация по вкладкам
              styles.leftColumn - стили для левой колонки (ширина, отступы)
              Содержит:
              - UserCard: отображает основную информацию о пользователе (имя, email, telegram)
              - ProfileNavigation: навигация между вкладками профиля */}
          <Box className={styles.leftColumn}>
            {/* Карточка пользователя - отображает основную информацию
                firstName, lastName - имя и фамилия пользователя
                email - электронная почта
                telegram - никнейм в Telegram
                TODO: Заменить на реальные данные из API */}
            <UserCard 
              firstName={userData.firstName}
              lastName={userData.lastName}
              email={userData.email}
              telegram={userData.telegram}
            />
            {/* Навигация между вкладками профиля
                activeTab - текущая активная вкладка для подсветки
                onTabChange={setActiveTab} - обработчик изменения вкладки
                При клике на вкладку обновляет activeTab и сохраняет в localStorage */}
            <ProfileNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
          </Box>

          {/* Правая колонка: содержимое активной вкладки
              styles.rightColumn - стили для правой колонки (flex, ширина)
              renderContent() - возвращает соответствующий компонент в зависимости от activeTab
              Может быть:
              - ProfileInfo: просмотр информации о пользователе (activeTab === 'profile')
              - ProfileEditForm + AccentColorSettings: редактирование данных и настройка цвета (activeTab === 'edit')
              - IntegrationsPage: настройка интеграций и API (activeTab === 'integrations')
              - QuickButtonsPage: управление быстрыми кнопками (activeTab === 'quick-buttons') */}
          <Box className={styles.rightColumn}>
            {renderContent()}
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}
