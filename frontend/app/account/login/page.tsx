/**
 * LoginPage (login/page.tsx) - Страница входа в систему
 * 
 * Назначение:
 * - Авторизация пользователя в приложении
 * - Поддержка двух методов входа: email/пароль и Google OAuth
 * - Переключение темы интерфейса
 * - Переход на страницу восстановления пароля
 * 
 * Функциональность:
 * - Форма входа с полями email и пароль
 * - Валидация полей формы
 * - Кнопка входа через Google
 * - Кнопка переключения темы (светлая/темная)
 * - Ссылка на восстановление пароля
 * - Индикатор загрузки при отправке формы
 * 
 * Связи:
 * - useTheme: получает текущую тему и функцию переключения из ThemeProvider
 * - useRouter: для навигации на страницу восстановления пароля
 * - FloatingLabelInput: кастомный компонент поля ввода с плавающей меткой
 * - AppLayout не используется - страница имеет собственный layout
 * 
 * Поведение:
 * - При отправке формы показывает индикатор загрузки
 * - После успешной авторизации должен происходить редирект на главную страницу
 * - При клике на "Забыли пароль?" происходит переход на /account/forgot-password
 * - Кнопка темы доступна в двух местах: для десктопа (справа от формы) и мобильных (в углу формы)
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Flex, Text, Button, Box, Separator } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { SunIcon, MoonIcon, PersonIcon, LockClosedIcon } from "@radix-ui/react-icons"
// Импорты хуков React для управления состоянием
import { useState } from "react"
// Импорт хука Next.js для программной навигации
import { useRouter } from "next/navigation"
// Импорт хука для работы с темой (получение темы и функции переключения)
import { useTheme } from "@/components/ThemeProvider"
// Импорт кастомного компонента поля ввода с плавающей меткой
import FloatingLabelInput from "@/components/FloatingLabelInput"
// Импорт CSS модуля для стилизации страницы
import styles from './login.module.css'

/**
 * LoginPage - компонент страницы входа
 * 
 * Состояние:
 * - email: значение поля email
 * - password: значение поля пароля
 * - isLoading: флаг загрузки (показывает индикатор при отправке формы)
 */
export default function LoginPage() {
  // Состояние формы: email пользователя
  const [email, setEmail] = useState('')
  // Состояние формы: пароль пользователя
  const [password, setPassword] = useState('')
  // Состояние загрузки: true во время отправки формы, false в остальное время
  const [isLoading, setIsLoading] = useState(false)
  // Получение темы и функции переключения из ThemeProvider
  const { theme, toggleTheme } = useTheme()
  // Хук Next.js для программной навигации
  const router = useRouter()

  /**
   * handleEmailLogin - обработчик входа через email/пароль
   * 
   * Функциональность:
   * - Предотвращает стандартное поведение формы (перезагрузка страницы)
   * - Устанавливает состояние загрузки
   * - Отправляет данные авторизации на сервер
   * - Обрабатывает ответ и выполняет редирект при успехе
   * 
   * Поведение:
   * - Вызывается при submit формы
   * - Показывает индикатор загрузки на кнопке
   * - В текущей реализации только логирует данные (TODO: реализовать реальную авторизацию)
   * 
   * Связи:
   * - Должен вызывать API endpoint для авторизации
   * - При успехе должен сохранять токен и редиректить на главную страницу
   * - При ошибке должен показывать сообщение об ошибке
   * 
   * @param e - событие submit формы
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Предотвращаем стандартную отправку формы
    setIsLoading(true) // Показываем индикатор загрузки
    // TODO: Реализовать авторизацию через email/пароль
    // Здесь должен быть вызов API для авторизации
    console.log('Email login:', { email, password })
    // Имитация задержки запроса (в реальной реализации убрать)
    setTimeout(() => {
      setIsLoading(false) // Скрываем индикатор загрузки
      // После успешной авторизации должен быть редирект: router.push('/')
    }, 1000)
  }

  /**
   * handleGoogleLogin - обработчик входа через Google OAuth
   * 
   * Функциональность:
   * - Перенаправляет пользователя на страницу авторизации Google
   * - После успешной авторизации Google перенаправляет обратно с токеном
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Войти через Google"
   * - Выполняет полный редирект на OAuth endpoint
   * 
   * Связи:
   * - Должен указывать на реальный OAuth endpoint: /api/auth/google
   * - После авторизации Google должен вернуть пользователя с токеном
   * 
   * TODO: Реализовать реальную интеграцию с Google OAuth
   */
  const handleGoogleLogin = () => {
    // TODO: Реализовать авторизацию через Google
    console.log('Google login')
    // Перенаправление на OAuth endpoint Google
    // В реальной реализации должен быть правильный URL OAuth провайдера
    window.location.href = '/api/auth/google' // Пример URL
  }

  // Основной контейнер страницы - занимает весь экран
  // width="100vw" height="100vh" - полная ширина и высота экрана
  // align="center" justify="center" - центрирование содержимого
  // backgroundColor - фон страницы (адаптируется к теме)
  // position: 'relative' - для позиционирования дочерних элементов
  // padding: '20px' - отступы для мобильных устройств
  return (
    <Flex
      width="100vw"
      height="100vh"
      align="center"
      justify="center"
      style={{
        backgroundColor: 'var(--color-background)',
        position: 'relative',
        padding: '20px',
      }}
    >
      {/* Контейнер формы - ограничивает максимальную ширину формы
          position: 'relative' - для позиционирования кнопки темы
          maxWidth: '400px' - максимальная ширина формы для удобства чтения */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Кнопка смены темы - справа от формы на десктопе
            position: 'absolute' - абсолютное позиционирование
            right: '-56px' - расположение справа от формы
            zIndex: 10 - поверх других элементов
            styles.themeButtonDesktop - CSS класс для скрытия на мобильных */}
        <Box
          style={{
            position: 'absolute',
            top: '0',
            right: '-56px',
            zIndex: 10,
          }}
          className={styles.themeButtonDesktop}
        >
          {/* Кнопка переключения темы
              variant="ghost" - прозрачный фон
              size="2" - маленький размер
              onClick={toggleTheme} - обработчик переключения темы
              title - подсказка при наведении
              Отображает MoonIcon для светлой темы, SunIcon для темной */}
          <Button
            variant="ghost"
            size="2"
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-panel)',
              border: '1px solid var(--gray-a6)',
            }}
            title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
          >
            {theme === 'light' ? (
              <MoonIcon width="18" height="18" style={{ color: 'var(--gray-12)' }} />
            ) : (
              <SunIcon width="18" height="18" style={{ color: 'var(--gray-12)' }} />
            )}
          </Button>
        </Box>

        {/* Карточка формы - основной контейнер с формой входа
            padding: '32px' - внутренние отступы
            backgroundColor - фон карточки (адаптируется к теме)
            border - граница карточки
            borderRadius: '12px' - скругление углов
            boxShadow - тень для визуального выделения
            position: 'relative' - для позиционирования кнопки темы на мобильных */}
        <Box
          style={{
            width: '100%',
            padding: '32px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            position: 'relative',
          }}
        >
          {/* Кнопка смены темы в правом верхнем углу формы для мобильных
              position: 'absolute' - абсолютное позиционирование
              top: '16px' right: '16px' - расположение в правом верхнем углу
              zIndex: 10 - поверх других элементов
              styles.themeButtonMobile - CSS класс для скрытия на десктопе */}
          <Box
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
            }}
            className={styles.themeButtonMobile}
          >
            {/* Кнопка переключения темы для мобильных
                Аналогична кнопке для десктопа, но с прозрачным фоном */}
            <Button
              variant="ghost"
              size="2"
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: '1px solid var(--gray-a6)',
              }}
              title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? (
                <MoonIcon width="18" height="18" style={{ color: 'var(--gray-12)' }} />
              ) : (
                <SunIcon width="18" height="18" style={{ color: 'var(--gray-12)' }} />
              )}
            </Button>
          </Box>
        {/* Контейнер содержимого формы
            direction="column" - вертикальное расположение элементов
            gap="6" - отступы между элементами
            align="center" - горизонтальное выравнивание по центру */}
        <Flex direction="column" gap="6" align="center">
          {/* Заголовок страницы
              direction="column" - вертикальное расположение
              gap="2" - отступ между заголовком и подзаголовком */}
          <Flex direction="column" gap="2" align="center">
            {/* Название приложения - крупный текст */}
            <Text size="7" weight="bold">
              aichat
            </Text>
            {/* Подзаголовок - описание действия */}
            <Text size="3" color="gray">
              Войдите в свой аккаунт
            </Text>
          </Flex>

          {/* Форма авторизации
              direction="column" - вертикальное расположение полей
              gap="4" - отступы между полями
              width="100%" - полная ширина контейнера */}
          <Flex direction="column" gap="4" width="100%">
            {/* HTML форма для входа через email/пароль
                onSubmit={handleEmailLogin} - обработчик отправки формы
                style={{ width: '100%' }} - полная ширина */}
            <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
              <Flex direction="column" gap="4" width="100%">
                {/* Поле Email с плавающим лейблом
                    id="email" - идентификатор поля
                    label="Email" - текст метки
                    type="email" - тип поля (валидация email)
                    value={email} - значение поля (контролируемый компонент)
                    onChange={(e) => setEmail(e.target.value)} - обработчик изменения
                    placeholder - подсказка в пустом поле
                    required - обязательное поле
                    icon - иконка пользователя слева от поля */}
                <FloatingLabelInput
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  icon={<PersonIcon width="16" height="16" />}
                />

                {/* Поле Пароль с плавающим лейблом
                    id="password" - идентификатор поля
                    label="Пароль" - текст метки
                    type="password" - тип поля (скрывает ввод)
                    value={password} - значение поля (контролируемый компонент)
                    onChange={(e) => setPassword(e.target.value)} - обработчик изменения
                    placeholder - подсказка в пустом поле
                    required - обязательное поле
                    icon - иконка замка слева от поля */}
                <FloatingLabelInput
                  id="password"
                  label="Пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  icon={<LockClosedIcon width="16" height="16" />}
                />

                {/* Кнопка входа
                    type="submit" - кнопка отправки формы
                    size="3" - средний размер
                    style={{ width: '100%' }} - полная ширина
                    disabled={isLoading} - блокировка во время загрузки
                    Текст меняется на "Вход..." во время загрузки */}
                <Button
                  type="submit"
                  size="3"
                  style={{ width: '100%' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Вход...' : 'Войти'}
                </Button>
              </Flex>
            </form>

            {/* Разделитель между формой email и кнопкой Google
                align="center" - выравнивание элементов по центру
                gap="3" - отступы между элементами
                Separator - визуальный разделитель (линия)
                Текст "или" между разделителями */}
            <Flex align="center" gap="3" width="100%">
              <Separator size="4" style={{ flex: 1 }} />
              <Text size="2" color="gray">
                или
              </Text>
              <Separator size="4" style={{ flex: 1 }} />
            </Flex>

            {/* Кнопка авторизации через Google
                size="3" - средний размер
                variant="outline" - контурный стиль
                style={{ width: '100%' }} - полная ширина
                onClick={handleGoogleLogin} - обработчик клика
                Внутри: иконка Google (градиентный фон с буквой G) и текст */}
            <Button
              size="3"
              variant="outline"
              style={{ width: '100%' }}
              onClick={handleGoogleLogin}
            >
              <Flex align="center" gap="2" justify="center">
                {/* Иконка Google - градиентный квадрат с буквой G
                    Градиент: синий (#4285F4) -> зеленый (#34A853) -> желтый (#FBBC05) -> красный (#EA4335)
                    borderRadius: '4px' - скругление углов
                    Цвета соответствуют официальной палитре Google */}
                <Box
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: 'white',
                  }}
                >
                  G
                </Box>
                <Text>Войти через Google</Text>
              </Flex>
            </Button>
          </Flex>

          {/* Дополнительные ссылки
              direction="column" - вертикальное расположение
              gap="2" - отступы между ссылками
              align="center" - выравнивание по центру
              width="100%" - полная ширина */}
          <Flex direction="column" gap="2" align="center" width="100%">
            {/* Кнопка "Забыли пароль?"
                variant="ghost" - прозрачный фон
                size="2" - маленький размер
                style={{ cursor: 'pointer' }} - указатель при наведении
                onClick={() => router.push('/account/forgot-password')} - переход на страницу восстановления пароля */}
            <Button
              variant="ghost"
              size="2"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/account/forgot-password')}
            >
              <Text size="2" color="gray">
                Забыли пароль?
              </Text>
            </Button>
          </Flex>
        </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
