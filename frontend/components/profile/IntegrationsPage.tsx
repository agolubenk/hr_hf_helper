/**
 * IntegrationsPage (components/profile/IntegrationsPage.tsx) - Страница интеграций и API
 * 
 * Назначение:
 * - Отображение статуса всех доступных интеграций
 * - Настройка API ключей и токенов для интеграций
 * - Управление подключениями к внешним сервисам
 * 
 * Функциональность:
 * - Сетка карточек интеграций (3 колонки)
 * - Отображение статуса каждой интеграции (настроена/не настроена)
 * - Модальное окно для настройки каждой интеграции
 * - Специальная обработка Huntflow (локальные настройки пользователя)
 * - Информационная секция с инструкциями
 * 
 * Поддерживаемые интеграции:
 * - Gemini AI - AI сервис от Google
 * - Huntflow - ATS система (с поддержкой песочницы и продакшн)
 * - ClickUp - система управления проектами
 * - Notion - система документов и баз знаний
 * - Telegram - мессенджер
 * - Google - OAuth и API сервисы Google
 * - hh.ru / rabota.by - платформы для поиска работы
 * - OpenAI - AI сервис
 * - Cloud AI - облачный AI сервис
 * - n8n - автоматизация и интеграции
 * 
 * Связи:
 * - IntegrationSettingsModal: модальное окно для настройки интеграций
 * - huntflowUserSettings: локальные настройки пользователя для Huntflow
 * - ProfilePage: используется на вкладке 'integrations' страницы профиля
 * 
 * Поведение:
 * - При загрузке читает локальные настройки Huntflow из localStorage
 * - При клике на иконку настроек открывает модальное окно для выбранной интеграции
 * - После сохранения настроек обновляет статус интеграции
 * - Для Huntflow показывает детальный статус (система, токены, ключи)
 * 
 * TODO: Замена моковых данных на API
 * - Загружать статус интеграций из API: GET /api/user/integrations/status
 * - Сохранять настройки через API: PUT /api/user/integrations/{name}
 * - Тестировать подключения через API: POST /api/user/integrations/{name}/test
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Text, Flex, Grid } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { LightningBoltIcon, GearIcon, CheckIcon } from "@radix-ui/react-icons"
// Импорты хуков React для управления состоянием и жизненным циклом
import { useState, useEffect } from "react"
// Импорт модального окна настроек интеграции
import IntegrationSettingsModal from "./IntegrationSettingsModal"
// Импорт функций для работы с локальными настройками Huntflow
import { getHuntflowUserSettings, type HuntflowUserSettings } from "@/lib/huntflowUserSettings"
// Импорт CSS модуля для стилизации компонента
import styles from './IntegrationsPage.module.css'

/**
 * IntegrationCardProps - пропсы компонента карточки интеграции
 * 
 * Параметры:
 * - name: название интеграции (например, "Huntflow", "Google")
 * - logo: React компонент или элемент для отображения логотипа
 * - status: React компонент или элемент для отображения статуса интеграции
 * - onConfigure: обработчик клика на кнопку настроек (открывает модальное окно)
 * 
 * Использование: Передаются в IntegrationCard для отображения карточки интеграции
 */
interface IntegrationCardProps {
  name: string
  logo: React.ReactNode
  status: React.ReactNode
  onConfigure: () => void
}

/**
 * IntegrationCard - компонент карточки интеграции
 * 
 * Функциональность:
 * - Отображает логотип и название интеграции
 * - Показывает статус интеграции (настроена/не настроена)
 * - Кнопка настроек для открытия модального окна
 * 
 * Структура:
 * - Заголовок: логотип, название, иконка галочки, кнопка настроек
 * - Содержимое: статус интеграции (детальная информация)
 * 
 * Поведение:
 * - При клике на кнопку настроек вызывает onConfigure
 * - Отображает статус интеграции в содержимом карточки
 * 
 * @param name - название интеграции
 * @param logo - логотип интеграции
 * @param status - статус интеграции
 * @param onConfigure - обработчик открытия настроек
 */
function IntegrationCard({ name, logo, status, onConfigure }: IntegrationCardProps) {
  return (
    <Box className={styles.integrationCard}>
      {/* Заголовок карточки интеграции
          styles.cardHeader - стили для заголовка (отступы, граница снизу)
          justify="between" - элементы по краям (логотип/название слева, статус/настройки справа)
          align="center" - вертикальное выравнивание по центру */}
      <Flex justify="between" align="center" className={styles.cardHeader}>
        {/* Левая часть заголовка: логотип и название интеграции
            align="center" - выравнивание по центру
            gap="2" - отступ между логотипом и названием */}
        <Flex align="center" gap="2">
          {/* Логотип интеграции - передается как React компонент или элемент */}
          {logo}
          {/* Название интеграции
              size="3" - средний размер текста
              weight="medium" - средняя жирность */}
          <Text size="3" weight="medium">
            {name}
          </Text>
        </Flex>
        {/* Правая часть заголовка: иконка статуса и кнопка настроек
            align="center" - выравнивание по центру
            gap="2" - отступ между элементами */}
        <Flex align="center" gap="2">
          {/* Иконка галочки - индикатор того, что интеграция настроена
              width={16} height={16} - размер иконки
              color: 'var(--green-9)' - зеленый цвет для визуального обозначения успеха
              flexShrink: 0 - предотвращает сжатие иконки */}
          <CheckIcon width={16} height={16} style={{ color: 'var(--green-9)', flexShrink: 0 }} />
          {/* Кнопка настроек - открывает модальное окно для настройки интеграции
              className={styles.gearButton} - стили для кнопки (курсор, hover эффекты)
              onClick={onConfigure} - обработчик открытия модального окна
              title - подсказка при наведении */}
          <Box
            className={styles.gearButton}
            onClick={onConfigure}
            title="Настроить API ключи"
          >
            <GearIcon width={16} height={16} />
          </Box>
        </Flex>
      </Flex>

      {/* Содержимое карточки - статус интеграции
          styles.cardContent - стили для содержимого (отступы)
          Отображает детальную информацию о статусе интеграции (передается через пропс status) */}
      <Box className={styles.cardContent}>
        {status}
      </Box>
    </Box>
  )
}

/**
 * Логотипы интеграций
 * 
 * Назначение: Компоненты для отображения логотипов различных интеграций
 * 
 * Структура:
 * - Каждый логотип обернут в Box с классом styles.logoContainer
 * - Содержит текст или SVG иконку с белым цветом
 * - Используется в карточках интеграций для визуального обозначения
 * 
 * Использование: Передаются в IntegrationCard как пропс logo
 */

/**
 * GeminiLogo - логотип Gemini AI
 * 
 * Отображает текст "AI" на цветном фоне
 */
const GeminiLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      AI
    </Text>
  </Box>
)

const HuntflowLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      X
    </Text>
  </Box>
)

const ClickUpLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      C
    </Text>
  </Box>
)

const NotionLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      N
    </Text>
  </Box>
)

const TelegramLogo = () => (
  <Box className={styles.logoContainer}>
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM17.67 8.01L15.63 16.53C15.48 17.22 15.09 17.4 14.49 17.04L11.97 15.19L10.71 16.41C10.53 16.59 10.38 16.74 10.05 16.74L10.29 14.14L15.63 9.39C15.93 9.12 15.57 8.97 15.18 9.24L8.67 13.45L6.09 12.66C5.52 12.5 5.5 12.03 6.18 11.76L17.01 7.62C17.48 7.44 17.9 7.73 17.67 8.01Z"
        fill="white"
      />
    </svg>
  </Box>
)

const GoogleLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      G
    </Text>
  </Box>
)

const HHLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      HH
    </Text>
  </Box>
)

const OpenAILogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      O
    </Text>
  </Box>
)

const CloudAILogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      AI
    </Text>
  </Box>
)

const N8nLogo = () => (
  <Box className={styles.logoContainer}>
    <Text size="2" weight="bold" style={{ color: 'white' }}>
      n8n
    </Text>
  </Box>
)

/**
 * IntegrationsPage - компонент страницы интеграций и API
 * 
 * Состояние:
 * - selectedIntegration: название выбранной интеграции для настройки (null если ничего не выбрано)
 * - isModalOpen: флаг открытости модального окна настроек
 * - huntflowUserSettings: локальные настройки пользователя для Huntflow (из localStorage)
 * 
 * Поведение:
 * - При загрузке читает локальные настройки Huntflow из localStorage
 * - При клике на кнопку настроек открывает модальное окно для выбранной интеграции
 * - После сохранения настроек обновляет статус интеграции (для Huntflow перечитывает настройки)
 * - Для Huntflow показывает детальный статус на основе локальных настроек пользователя
 */
export default function IntegrationsPage() {
  // Состояние: название выбранной интеграции для настройки
  // null если модальное окно закрыто, иначе название интеграции (например, "Huntflow", "Google")
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  
  // Состояние: флаг открытости модального окна настроек интеграции
  // true когда модальное окно открыто, false когда закрыто
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  /**
   * huntflowUserSettings - локальные настройки пользователя для Huntflow
   * 
   * Назначение:
   * - Хранит персональные настройки пользователя для Huntflow (источник ключей, активная система)
   * - Используется для отображения детального статуса интеграции Huntflow
   * - Обновляется после сохранения настроек в модальном окне
   * 
   * Структура (HuntflowUserSettings):
   * - credentialSource: источник ключей ('mine' | 'company' | 'disabled')
   * - activeSystem: активная система ('prod' | 'sandbox')
   * - и другие настройки
   * 
   * Источник: localStorage через getHuntflowUserSettings()
   */
  const [huntflowUserSettings, setHuntflowUserSettings] = useState<HuntflowUserSettings | null>(null)

  /**
   * useEffect - загрузка локальных настроек Huntflow при монтировании компонента
   * 
   * Функциональность:
   * - Читает локальные настройки Huntflow из localStorage
   * - Сохраняет настройки в состоянии для отображения статуса
   * 
   * Поведение:
   * - Выполняется один раз при монтировании компонента (пустой массив зависимостей)
   * - Используется для инициализации статуса интеграции Huntflow
   * 
   * Связи:
   * - getHuntflowUserSettings() из @/lib/huntflowUserSettings - читает настройки из localStorage
   */
  useEffect(() => {
    setHuntflowUserSettings(getHuntflowUserSettings())
  }, [])

  /**
   * handleConfigure - обработчик открытия модального окна настроек интеграции
   * 
   * Функциональность:
   * - Устанавливает выбранную интеграцию
   * - Открывает модальное окно настроек
   * 
   * Поведение:
   * - Вызывается при клике на кнопку настроек (иконка шестеренки) в карточке интеграции
   * - Устанавливает selectedIntegration и isModalOpen в true
   * 
   * @param integrationName - название интеграции для настройки (например, "Huntflow", "Google")
   */
  const handleConfigure = (integrationName: string) => {
    setSelectedIntegration(integrationName)
    setIsModalOpen(true)
  }

  /**
   * handleCloseModal - обработчик закрытия модального окна настроек
   * 
   * Функциональность:
   * - Закрывает модальное окно
   * - Сбрасывает выбранную интеграцию
   * 
   * Поведение:
   * - Вызывается при закрытии модального окна (клик вне окна, кнопка закрытия)
   * - Устанавливает isModalOpen в false и selectedIntegration в null
   */
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedIntegration(null)
  }

  /**
   * handleSave - обработчик сохранения настроек интеграции
   * 
   * Функциональность:
   * - Обновляет статус интеграции после сохранения настроек
   * - Для Huntflow перечитывает локальные настройки из localStorage
   * - Закрывает модальное окно
   * 
   * Поведение:
   * - Вызывается при сохранении настроек в IntegrationSettingsModal
   * - Для Huntflow обновляет huntflowUserSettings для отображения актуального статуса
   * - Закрывает модальное окно после сохранения
   * 
   * TODO: Реализовать сохранение через API
   * - PUT /api/user/integrations/{integrationName} с настройками
   * - Обновление статуса интеграции после успешного сохранения
   * - Обработка ошибок сохранения
   * 
   * @param data - данные настроек интеграции (зависит от типа интеграции)
   */
  const handleSave = (data: any) => {
    // Для Huntflow перечитываем локальные настройки после сохранения
    // Это необходимо, так как настройки сохраняются в localStorage через IntegrationSettingsModal
    if (selectedIntegration === 'Huntflow') {
      setHuntflowUserSettings(getHuntflowUserSettings())
    }
    // Закрываем модальное окно после сохранения
    handleCloseModal()
  }

  /**
   * Рендер компонента страницы интеграций
   * 
   * Структура:
   * - Заголовок с иконкой молнии
   * - Сетка карточек интеграций (3 колонки)
   * - Информационная секция с инструкциями
   * - Модальное окно настроек (условный рендеринг)
   */
  return (
    <Box className={styles.integrationsBlock}>
      {/* Заголовок блока интеграций
          styles.header - стили для заголовка (отступы, граница снизу)
          Содержит иконку молнии и текст "Статус интеграций" */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          {/* Иконка молнии - визуально обозначает тему интеграций/API
              width="20" height="20" - размер иконки */}
          <LightningBoltIcon width="20" height="20" />
          {/* Текст заголовка - название блока
              size="4" - средний размер текста
              weight="bold" - жирное начертание */}
          <Text size="4" weight="bold">
            Статус интеграций
          </Text>
        </Flex>
      </Box>

      {/* Сетка интеграций - отображение всех доступных интеграций
          styles.content - стили для контента (отступы, расположение)
          Grid columns="3" - три колонки для карточек интеграций
          gap="4" - отступ между карточками
          styles.grid - стили для сетки (адаптивность на мобильных) */}
      <Box className={styles.content}>
        <Grid columns="3" gap="4" width="100%" className={styles.grid}>
          <IntegrationCard
            name="Gemini AI"
            logo={<GeminiLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Gemini AI')}
          />

          <IntegrationCard
            name="Huntflow"
            logo={<HuntflowLogo />}
            status={
              (() => {
                const src = huntflowUserSettings?.credentialSource ?? 'mine'
                if (src === 'disabled') {
                  return (
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Интеграция:</Text>
                      <Text size="2">Выключено (подтверждено)</Text>
                    </Flex>
                  )
                }
                if (src === 'company') {
                  return (
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Ключи:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Ключи компании</Text>
                    </Flex>
                  )
                }
                const sys = huntflowUserSettings?.activeSystem ?? 'prod'
                return (
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Текущая система:</Text>
                      <Text size="2">{sys === 'prod' ? 'prod' : 'sandbox'}</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Access Token:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Валидный</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text size="2" color="gray">Refresh Token:</Text>
                      <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                      <Text size="2">Валидный</Text>
                    </Flex>
                    {sys === 'sandbox' && (
                      <Flex align="center" gap="2">
                        <Text size="2" color="gray">API Песочницы:</Text>
                        <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                        <Text size="2">Настроен</Text>
                      </Flex>
                    )}
                  </Flex>
                )
              })()
            }
            onConfigure={() => handleConfigure('Huntflow')}
          />

          <IntegrationCard
            name="ClickUp"
            logo={<ClickUpLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('ClickUp')}
          />

          <IntegrationCard
            name="Notion"
            logo={<NotionLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Integration Token:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Notion')}
          />

          <IntegrationCard
            name="Telegram"
            logo={<TelegramLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Username:</Text>
                <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                <Text size="2">talent_softnetix</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Telegram')}
          />

          <IntegrationCard
            name="Google"
            logo={<GoogleLogo />}
            status={
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">OAuth:</Text>
                  <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  <Text size="2">Подключен</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Text size="2" color="gray">Токен:</Text>
                  <CheckIcon width="14" height="14" style={{ color: 'var(--green-9)' }} />
                  <Text size="2">Валидный</Text>
                </Flex>
              </Flex>
            }
            onConfigure={() => handleConfigure('Google')}
          />

          <IntegrationCard
            name="hh.ru / rabota.by"
            logo={<HHLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">OAuth/API:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('hh.ru / rabota.by')}
          />

          <IntegrationCard
            name="OpenAI"
            logo={<OpenAILogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('OpenAI')}
          />

          <IntegrationCard
            name="Cloud AI"
            logo={<CloudAILogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">API ключ:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('Cloud AI')}
          />

          <IntegrationCard
            name="n8n"
            logo={<N8nLogo />}
            status={
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Webhook/API:</Text>
                <CheckIcon width={14} height={14} style={{ color: 'var(--green-9)' }} />
                <Text size="2">Настроен</Text>
              </Flex>
            }
            onConfigure={() => handleConfigure('n8n')}
          />
        </Grid>
      </Box>

      {/* Информационное сообщение о будущих интеграциях
          marginTop: '16px' - отступ сверху от сетки интеграций
          Текст информирует пользователя о том, что скоро появятся новые интеграции */}
      <Box style={{ marginTop: '16px' }}>
        <Text size="2" color="gray">
          Скоро появятся другие интеграции.
        </Text>
      </Box>

      {/* Информационная секция с инструкциями
          marginTop: '24px' - отступ сверху
          padding: '16px' - внутренние отступы
          backgroundColor: 'var(--blue-2)' - светло-синий фон для визуального выделения
          borderRadius: '8px' - скругление углов
          border: '1px solid var(--blue-6)' - синяя граница
          Содержит заголовок "Нужна помощь?" и текст с рекомендациями */}
      <Box style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--blue-2)', borderRadius: '8px', border: '1px solid var(--blue-6)' }}>
        {/* Заголовок информационной секции
            size="3" - средний размер текста
            weight="medium" - средняя жирность
            display: 'block' - блочный элемент
            marginBottom: '8px' - отступ снизу */}
        <Text size="3" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
          Нужна помощь?
        </Text>
        {/* Текст с рекомендациями по решению проблем
            size="2" - маленький размер текста
            color="gray" - серый цвет для визуального отличия */}
        <Text size="2" color="gray">
          Если у вас возникли проблемы с настройкой интеграций, обратитесь к администратору системы или проверьте документацию соответствующих сервисов.
        </Text>
      </Box>

      {/* Модальное окно настроек интеграции (условный рендеринг)
          Отображается только если selectedIntegration не null (выбрана интеграция для настройки)
          IntegrationSettingsModal - компонент модального окна для настройки интеграции */}
      {selectedIntegration && (
        <IntegrationSettingsModal
          integrationName={selectedIntegration}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          // Для Huntflow передаем начальную активную систему из локальных настроек
          // Это позволяет модальному окну открыться с правильной системой (prod/sandbox)
          initialActiveSystem={selectedIntegration === 'Huntflow' ? (huntflowUserSettings?.activeSystem ?? 'prod') : undefined}
        />
      )}
    </Box>
  )
}
