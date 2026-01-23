'use client'

import { Flex, Text, Button, Box } from "@radix-ui/themes"
import { SunIcon, MoonIcon, LockClosedIcon, CheckIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import FloatingLabelInput from "@/components/FloatingLabelInput"
import styles from './reset-password.module.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Получаем токен из URL параметров
    const tokenParam = searchParams.get('token')
    setToken(tokenParam)
    
    if (!tokenParam) {
      setError('Недействительная ссылка для сброса пароля')
    }
  }, [searchParams])

  const handleSubmit = async () => {
    setError('')
    
    if (!password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (!token) {
      setError('Недействительная ссылка для сброса пароля')
      return
    }

    setIsLoading(true)
    
    // TODO: Реализовать сброс пароля через API
    console.log('Password reset with token:', token, 'new password:', password)
    
    // Симуляция отправки запроса
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1500)
  }

  const handleBackToLogin = () => {
    router.push('/login')
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
                Новый пароль
              </Text>
              <Text size="3" color="gray" style={{ textAlign: 'center' }}>
                {isSuccess 
                  ? 'Пароль успешно изменен'
                  : 'Введите новый пароль для вашего аккаунта'
                }
              </Text>
            </Flex>

            {isSuccess ? (
              /* Сообщение об успешном изменении пароля */
              <Flex direction="column" gap="4" width="100%" align="center">
                <Box
                  style={{
                    padding: '24px',
                    backgroundColor: 'var(--green-a3)',
                    border: '1px solid var(--green-a6)',
                    borderRadius: '8px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--green-9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon width="24" height="24" style={{ color: 'white' }} />
                  </Box>
                  <Text size="3" weight="bold" style={{ textAlign: 'center' }}>
                    Пароль успешно изменен!
                  </Text>
                  <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                    Теперь вы можете войти в систему с новым паролем
                  </Text>
                </Box>

                <Button
                  size="3"
                  style={{ width: '100%' }}
                  onClick={handleBackToLogin}
                >
                  Войти в систему
                </Button>
              </Flex>
            ) : (
              /* Форма ввода нового пароля */
              <Flex direction="column" gap="4" width="100%">
                {/* Сообщение об ошибке */}
                {error && (
                  <Box
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--red-a3)',
                      border: '1px solid var(--red-a6)',
                      borderRadius: '6px',
                    }}
                  >
                    <Text size="2" style={{ color: 'var(--red-11)' }}>
                      {error}
                    </Text>
                  </Box>
                )}

                {/* Поле нового пароля */}
                <FloatingLabelInput
                  id="password"
                  label="Новый пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  required
                  icon={<LockClosedIcon width="16" height="16" />}
                  disabled={!token}
                />

                {/* Поле подтверждения пароля */}
                <FloatingLabelInput
                  id="confirmPassword"
                  label="Подтвердите пароль"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  icon={<LockClosedIcon width="16" height="16" />}
                  disabled={!token}
                />

                {/* Требования к паролю */}
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--gray-a3)',
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                  }}
                >
                  <Text size="1" color="gray" style={{ display: 'block', marginBottom: '4px' }}>
                    Требования к паролю:
                  </Text>
                  <Text size="1" color="gray" style={{ display: 'block' }}>
                    • Минимум 8 символов
                  </Text>
                  <Text size="1" color="gray" style={{ display: 'block' }}>
                    • Рекомендуется использовать буквы, цифры и символы
                  </Text>
                </Box>

                {/* Кнопка сохранения */}
                <Button
                  size="3"
                  style={{ width: '100%' }}
                  disabled={isLoading || !token}
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Сохранение...' : 'Изменить пароль'}
                </Button>

                {/* Кнопка возврата */}
                <Button
                  size="3"
                  variant="soft"
                  style={{ width: '100%' }}
                  onClick={handleBackToLogin}
                >
                  Вернуться к входу
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
