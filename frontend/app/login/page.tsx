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
 * - При клике на "Забыли пароль?" происходит переход на /forgot-password
 * - Кнопка темы доступна в двух местах: для десктопа (справа от формы) и мобильных (в углу формы)
 */

'use client'

import { Flex, Text, Button, Box, Separator } from "@radix-ui/themes"
import { SunIcon, MoonIcon, PersonIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import FloatingLabelInput from "@/components/FloatingLabelInput"
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
      <Box
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Кнопка смены темы - справа от формы на десктопе */}
        <Box
          style={{
            position: 'absolute',
            top: '0',
            right: '-56px',
            zIndex: 10,
          }}
          className={styles.themeButtonDesktop}
        >
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
          {/* Кнопка смены темы в правом верхнем углу формы для мобильных */}
          <Box
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
            }}
            className={styles.themeButtonMobile}
          >
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
        <Flex direction="column" gap="6" align="center">
          {/* Заголовок */}
          <Flex direction="column" gap="2" align="center">
            <Text size="7" weight="bold">
              aichat
            </Text>
            <Text size="3" color="gray">
              Войдите в свой аккаунт
            </Text>
          </Flex>

          {/* Форма авторизации */}
          <Flex direction="column" gap="4" width="100%">
            <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
              <Flex direction="column" gap="4" width="100%">
                {/* Поле Email с плавающим лейблом */}
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

                {/* Поле Пароль с плавающим лейблом */}
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

                {/* Кнопка входа */}
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

            {/* Разделитель */}
            <Flex align="center" gap="3" width="100%">
              <Separator size="4" style={{ flex: 1 }} />
              <Text size="2" color="gray">
                или
              </Text>
              <Separator size="4" style={{ flex: 1 }} />
            </Flex>

            {/* Кнопка авторизации через Google */}
            <Button
              size="3"
              variant="outline"
              style={{ width: '100%' }}
              onClick={handleGoogleLogin}
            >
              <Flex align="center" gap="2" justify="center">
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

          {/* Дополнительные ссылки */}
          <Flex direction="column" gap="2" align="center" width="100%">
            <Button
              variant="ghost"
              size="2"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/forgot-password')}
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
