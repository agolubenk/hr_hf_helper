/**
 * ResetPasswordPage (reset-password/page.tsx) - Страница сброса пароля
 * 
 * Назначение:
 * - Сброс пароля пользователя по токену из email
 * - Валидация нового пароля и подтверждения
 * - Отображение результата операции (успех/ошибка)
 * - Переключение темы интерфейса
 * - Возврат на страницу входа
 * 
 * Функциональность:
 * - Получение токена сброса из URL параметра ?token
 * - Форма с двумя полями: новый пароль и подтверждение пароля
 * - Валидация пароля (минимум 8 символов, совпадение полей)
 * - Индикатор загрузки при отправке запроса
 * - Сообщение об успешном изменении пароля
 * - Отображение ошибок валидации
 * - Кнопка возврата на страницу входа
 * - Кнопка переключения темы (для десктопа и мобильных)
 * 
 * Связи:
 * - useSearchParams: получение токена из URL (?token=...)
 * - useTheme: получение темы и функции переключения из ThemeProvider
 * - useRouter: для навигации на страницу входа (/account/login)
 * - FloatingLabelInput: кастомный компонент поля ввода с плавающей меткой
 * 
 * Поведение:
 * - При загрузке проверяет наличие токена в URL
 * - Если токена нет - показывает ошибку и блокирует форму
 * - При отправке формы валидирует пароль и отправляет запрос на сервер
 * - После успешного сброса показывает сообщение об успехе
 * - При клике на "Войти в систему" происходит переход на /login
 */

'use client'

// Импорт Suspense для обертки компонента с асинхронными операциями (useSearchParams)
import { Suspense } from "react"
// Импорты компонентов Radix UI для создания интерфейса
import { Flex, Text, Button, Box } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { SunIcon, MoonIcon, LockClosedIcon, CheckIcon } from "@radix-ui/react-icons"
// Импорты хуков React для управления состоянием и жизненным циклом
import { useState, useEffect } from "react"
// Импорты хуков Next.js для навигации и получения параметров URL
import { useRouter, useSearchParams } from "next/navigation"
// Импорт хука для работы с темой (получение темы и функции переключения)
import { useTheme } from "@/components/ThemeProvider"
// Импорт кастомного компонента поля ввода с плавающей меткой
import FloatingLabelInput from "@/components/FloatingLabelInput"
// Импорт CSS модуля для стилизации страницы
import styles from './reset-password.module.css'

/**
 * ResetPasswordPageContent - основной компонент содержимого страницы сброса пароля
 * 
 * Состояние:
 * - password: значение поля нового пароля
 * - confirmPassword: значение поля подтверждения пароля
 * - isLoading: флаг загрузки (показывает индикатор при отправке запроса)
 * - isSuccess: флаг успешного сброса (показывает сообщение об успехе)
 * - error: текст ошибки валидации или запроса
 * - token: токен сброса пароля из URL параметра
 */
function ResetPasswordPageContent() {
  // Состояние формы: новый пароль пользователя
  const [password, setPassword] = useState('')
  // Состояние формы: подтверждение нового пароля
  const [confirmPassword, setConfirmPassword] = useState('')
  // Состояние загрузки: true во время отправки запроса, false в остальное время
  const [isLoading, setIsLoading] = useState(false)
  // Состояние успеха: true после успешного сброса пароля, false до отправки
  const [isSuccess, setIsSuccess] = useState(false)
  // Состояние ошибки: текст ошибки валидации или запроса, пустая строка если ошибок нет
  const [error, setError] = useState('')
  // Токен сброса пароля из URL параметра ?token=...
  const [token, setToken] = useState<string | null>(null)
  // Получение темы и функции переключения из ThemeProvider
  const { theme, toggleTheme } = useTheme()
  // Хук Next.js для программной навигации
  const router = useRouter()
  // Получение параметров из URL
  const searchParams = useSearchParams()

  /**
   * useEffect - получение токена сброса пароля из URL параметров
   * 
   * Функциональность:
   * - Читает параметр 'token' из URL
   * - Сохраняет токен в состоянии
   * - Если токена нет - устанавливает ошибку и блокирует форму
   * 
   * Поведение:
   * - Выполняется при монтировании компонента и при изменении searchParams
   * - Позволяет открывать страницу с токеном через URL: /account/reset-password?token=...
   * - Без токена форма недоступна для использования
   * 
   * Связи:
   * - Используется для глубоких ссылок из email с токеном сброса пароля
   */
  useEffect(() => {
    // Получаем токен из URL параметров
    const tokenParam = searchParams.get('token')
    setToken(tokenParam)
    
    // Если токена нет - показываем ошибку
    if (!tokenParam) {
      setError('Недействительная ссылка для сброса пароля')
    }
  }, [searchParams])

  /**
   * handleSubmit - обработчик отправки формы сброса пароля
   * 
   * Функциональность:
   * - Очищает предыдущие ошибки
   * - Валидирует поля формы (заполненность, длина пароля, совпадение паролей)
   * - Проверяет наличие токена
   * - Отправляет запрос на сервер для сброса пароля
   * - Обрабатывает ответ и показывает результат
   * 
   * Валидация:
   * 1. Проверка заполненности полей
   * 2. Проверка минимальной длины пароля (8 символов)
   * 3. Проверка совпадения пароля и подтверждения
   * 4. Проверка наличия токена
   * 
   * Поведение:
   * - При ошибке валидации показывает сообщение об ошибке
   * - При успешной валидации отправляет запрос на сервер
   * - Показывает индикатор загрузки на кнопке
   * - В текущей реализации только логирует данные (TODO: реализовать реальный запрос)
   * 
   * Связи:
   * - Должен вызывать API endpoint для сброса пароля с токеном
   * - При успехе должен показывать сообщение об успешном сбросе
   * - При ошибке должен показывать сообщение об ошибке
   * 
   * TODO: Реализовать реальную отправку запроса на сервер
   */
  const handleSubmit = async () => {
    setError('') // Очищаем предыдущие ошибки
    
    // Валидация: проверка заполненности полей
    if (!password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    // Валидация: проверка минимальной длины пароля
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    // Валидация: проверка совпадения паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    // Валидация: проверка наличия токена
    if (!token) {
      setError('Недействительная ссылка для сброса пароля')
      return
    }

    setIsLoading(true) // Показываем индикатор загрузки
    
    // TODO: Реализовать сброс пароля через API
    // Здесь должен быть вызов API для сброса пароля с токеном
    console.log('Password reset with token:', token, 'new password:', password)
    
    // Симуляция отправки запроса (в реальной реализации убрать)
    setTimeout(() => {
      setIsLoading(false) // Скрываем индикатор загрузки
      setIsSuccess(true) // Показываем сообщение об успехе
    }, 1500)
  }

  /**
   * handleBackToLogin - обработчик возврата на страницу входа
   * 
   * Функциональность:
   * - Выполняет переход на страницу входа (/account/login)
   * 
   * Поведение:
   * - Вызывается при клике на кнопку "Вернуться к входу" или "Войти в систему"
   * - Использует router.push для клиентской навигации
   */
  const handleBackToLogin = () => {
    router.push('/account/login')
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

        {/* Карточка формы - основной контейнер с формой сброса пароля
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
              {/* Основной заголовок - название страницы
                  size="7" - крупный размер текста
                  weight="bold" - жирное начертание */}
              <Text size="7" weight="bold">
                Новый пароль
              </Text>
              {/* Подзаголовок - описание действия (меняется в зависимости от состояния)
                  size="3" - средний размер текста
                  color="gray" - серый цвет для визуального отличия
                  textAlign: 'center' - выравнивание по центру
                  Условный текст: "Пароль успешно изменен" при успехе, иначе "Введите новый пароль..." */}
              <Text size="3" color="gray" style={{ textAlign: 'center' }}>
                {isSuccess 
                  ? 'Пароль успешно изменен'
                  : 'Введите новый пароль для вашего аккаунта'
                }
              </Text>
            </Flex>

            {/* Условный рендеринг: форма или сообщение об успехе
                isSuccess === true: показываем сообщение об успешном изменении пароля
                isSuccess === false: показываем форму ввода нового пароля */}
            {isSuccess ? (
              /* Сообщение об успешном изменении пароля
                  Отображается после успешного сброса пароля */
              <Flex direction="column" gap="4" width="100%" align="center">
                {/* Блок с сообщением об успехе
                    padding: '24px' - внутренние отступы
                    backgroundColor: 'var(--green-a3)' - светло-зеленый фон
                    border: '1px solid var(--green-a6)' - зеленая граница
                    borderRadius: '8px' - скругление углов
                    display: 'flex' flexDirection: 'column' - вертикальное расположение
                    alignItems: 'center' - выравнивание по центру
                    gap: '12px' - отступы между элементами */}
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
                  {/* Иконка успеха - зеленая круглая иконка с галочкой
                      width: '48px' height: '48px' - размер иконки
                      borderRadius: '50%' - круглая форма
                      backgroundColor: 'var(--green-9)' - зеленый фон
                      CheckIcon - иконка галочки белого цвета */}
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
                  {/* Заголовок сообщения об успехе
                      size="3" - средний размер текста
                      weight="bold" - жирное начертание
                      textAlign: 'center' - выравнивание по центру */}
                  <Text size="3" weight="bold" style={{ textAlign: 'center' }}>
                    Пароль успешно изменен!
                  </Text>
                  {/* Описание следующего шага
                      size="2" - маленький размер текста
                      color="gray" - серый цвет для визуального отличия
                      textAlign: 'center' - выравнивание по центру */}
                  <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                    Теперь вы можете войти в систему с новым паролем
                  </Text>
                </Box>

                {/* Кнопка перехода на страницу входа
                    size="3" - средний размер
                    style={{ width: '100%' }} - полная ширина
                    onClick={handleBackToLogin} - обработчик перехода на страницу входа */}
                <Button
                  size="3"
                  style={{ width: '100%' }}
                  onClick={handleBackToLogin}
                >
                  Войти в систему
                </Button>
              </Flex>
            ) : (
              // Форма ввода нового пароля - отображается до отправки формы или при ошибке
              <Flex direction="column" gap="4" width="100%">
                {/* Сообщение об ошибке валидации или запроса
                    Отображается только если error не пустая строка
                    padding: '12px' - внутренние отступы
                    backgroundColor: 'var(--red-a3)' - светло-красный фон
                    border: '1px solid var(--red-a6)' - красная граница
                    borderRadius: '6px' - скругление углов */}
                {error && (
                  <Box
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--red-a3)',
                      border: '1px solid var(--red-a6)',
                      borderRadius: '6px',
                    }}
                  >
                    {/* Текст ошибки
                        size="2" - маленький размер текста
                        color: 'var(--red-11)' - красный цвет для визуального выделения */}
                    <Text size="2" style={{ color: 'var(--red-11)' }}>
                      {error}
                    </Text>
                  </Box>
                )}

                {/* Поле нового пароля с плавающим лейблом
                    id="password" - идентификатор поля
                    label="Новый пароль" - текст метки
                    type="password" - тип поля (скрывает ввод)
                    value={password} - значение поля (контролируемый компонент)
                    onChange={(e) => setPassword(e.target.value)} - обработчик изменения
                    placeholder - подсказка в пустом поле
                    required - обязательное поле
                    icon - иконка замка слева от поля
                    disabled={!token} - блокировка если токен отсутствует */}
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

                {/* Поле подтверждения пароля с плавающим лейблом
                    id="confirmPassword" - идентификатор поля
                    label="Подтвердите пароль" - текст метки
                    type="password" - тип поля (скрывает ввод)
                    value={confirmPassword} - значение поля (контролируемый компонент)
                    onChange={(e) => setConfirmPassword(e.target.value)} - обработчик изменения
                    placeholder - подсказка в пустом поле
                    required - обязательное поле
                    icon - иконка замка слева от поля
                    disabled={!token} - блокировка если токен отсутствует */}
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

                {/* Блок с требованиями к паролю
                    padding: '12px' - внутренние отступы
                    backgroundColor: 'var(--gray-a3)' - светло-серый фон
                    border: '1px solid var(--gray-a6)' - серая граница
                    borderRadius: '6px' - скругление углов
                    Информирует пользователя о требованиях к паролю */}
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--gray-a3)',
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '6px',
                  }}
                >
                  {/* Заголовок требований
                      size="1" - очень маленький размер текста
                      color="gray" - серый цвет
                      display: 'block' - блочный элемент
                      marginBottom: '4px' - отступ снизу */}
                  <Text size="1" color="gray" style={{ display: 'block', marginBottom: '4px' }}>
                    Требования к паролю:
                  </Text>
                  {/* Список требований - каждый пункт на отдельной строке
                      size="1" - очень маленький размер текста
                      color="gray" - серый цвет
                      display: 'block' - блочный элемент */}
                  <Text size="1" color="gray" style={{ display: 'block' }}>
                    • Минимум 8 символов
                  </Text>
                  <Text size="1" color="gray" style={{ display: 'block' }}>
                    • Рекомендуется использовать буквы, цифры и символы
                  </Text>
                </Box>

                {/* Кнопка сохранения нового пароля
                    size="3" - средний размер
                    style={{ width: '100%' }} - полная ширина
                    disabled={isLoading || !token} - блокировка во время загрузки или при отсутствии токена
                    onClick={handleSubmit} - обработчик отправки формы
                    Текст меняется на "Сохранение..." во время загрузки */}
                <Button
                  size="3"
                  style={{ width: '100%' }}
                  disabled={isLoading || !token}
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Сохранение...' : 'Изменить пароль'}
                </Button>

                {/* Кнопка возврата на страницу входа
                    size="3" - средний размер
                    variant="soft" - мягкий стиль
                    style={{ width: '100%' }} - полная ширина
                    onClick={handleBackToLogin} - обработчик возврата */}
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

/**
 * ResetPasswordPage - обертка компонента страницы сброса пароля
 * 
 * Функциональность:
 * - Оборачивает ResetPasswordPageContent в Suspense для работы с useSearchParams
 * - Отображает fallback во время загрузки параметров из URL
 * 
 * Поведение:
 * - useSearchParams требует обертки в Suspense в Next.js 14+
 * - Показывает "Загрузка…" во время получения параметров из URL
 * - После загрузки отображает ResetPasswordPageContent
 * 
 * Связи:
 * - Next.js App Router: требует Suspense для useSearchParams
 * - ResetPasswordPageContent: основной компонент страницы
 */
export default function ResetPasswordPage() {
  // Suspense - обертка для компонента с асинхронными операциями
  // fallback - компонент, отображаемый во время загрузки
  // Необходим для useSearchParams в Next.js 14+
  return (
    <Suspense fallback={
      <Flex width="100vw" height="100vh" align="center" justify="center">
        <Text>Загрузка…</Text>
      </Flex>
    }>
      {/* Основной компонент содержимого страницы сброса пароля
          Использует useSearchParams для получения токена из URL */}
      <ResetPasswordPageContent />
    </Suspense>
  )
}
