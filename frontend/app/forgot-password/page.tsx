'use client'

import { Flex, Text, Button, Box } from "@radix-ui/themes"
import { SunIcon, MoonIcon, EnvelopeClosedIcon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import FloatingLabelInput from "@/components/FloatingLabelInput"
import styles from './forgot-password.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!email) return
    
    setIsLoading(true)
    
    // TODO: Реализовать отправку письма для восстановления пароля
    console.log('Password reset requested for:', email)
    
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
                Восстановление пароля
              </Text>
              <Text size="3" color="gray" style={{ textAlign: 'center' }}>
                {isSuccess 
                  ? 'Проверьте вашу почту'
                  : 'Введите email для восстановления доступа'
                }
              </Text>
            </Flex>

            {isSuccess ? (
              /* Сообщение об успешной отправке */
              <Flex direction="column" gap="4" width="100%" align="center">
                <Box
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--green-a3)',
                    border: '1px solid var(--green-a6)',
                    borderRadius: '8px',
                    width: '100%',
                  }}
                >
                  <Text size="2" style={{ textAlign: 'center', display: 'block' }}>
                    Мы отправили инструкции по восстановлению пароля на адрес{' '}
                    <Text weight="bold">{email}</Text>
                  </Text>
                </Box>

                <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                  Не получили письмо? Проверьте папку "Спам" или попробуйте еще раз через несколько минут.
                </Text>

                <Button
                  size="3"
                  variant="soft"
                  style={{ width: '100%' }}
                  onClick={handleBackToLogin}
                >
                  <Flex align="center" gap="2" justify="center">
                    <ArrowLeftIcon width="16" height="16" />
                    <Text>Вернуться к входу</Text>
                  </Flex>
                </Button>
              </Flex>
            ) : (
              /* Форма ввода email */
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
                  icon={<EnvelopeClosedIcon width="16" height="16" />}
                />

                {/* Кнопка отправки */}
                <Button
                  size="3"
                  style={{ width: '100%' }}
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Отправка...' : 'Отправить инструкции'}
                </Button>

                {/* Кнопка возврата */}
                <Button
                  size="3"
                  variant="soft"
                  style={{ width: '100%' }}
                  onClick={handleBackToLogin}
                >
                  <Flex align="center" gap="2" justify="center">
                    <ArrowLeftIcon width="16" height="16" />
                    <Text>Вернуться к входу</Text>
                  </Flex>
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
