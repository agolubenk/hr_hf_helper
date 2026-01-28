/**
 * ProfileEditForm (components/profile/ProfileEditForm.tsx) - Форма редактирования профиля пользователя
 * 
 * Назначение:
 * - Редактирование личных данных пользователя
 * - Настройка рабочего времени (общее или по дням недели)
 * - Управление контактами (Telegram, LinkedIn)
 * - Настройка интервала между встречами
 * 
 * Функциональность:
 * - Поля редактирования: Telegram, LinkedIn, рабочее время, интервал встреч
 * - Переключение между режимами рабочего времени (все дни одинаково / каждый день отдельно)
 * - Валидация полей формы
 * - Сохранение изменений через callback onSave
 * - Отмена редактирования через callback onCancel
 * 
 * Особенности:
 * - Имя, фамилия и email отключены (disabled) - редактируются только через администратора
 * - Кастомная реализация полей Telegram и LinkedIn с плавающими метками
 * - Toggle для выбора режима рабочего времени
 * - Условный рендеринг полей в зависимости от режима рабочего времени
 * 
 * Связи:
 * - ProfilePage: используется на вкладке 'edit' страницы профиля
 * - FloatingLabelInput: используется для стандартных полей формы
 * - ThemeProvider: использует CSS переменные для цветов темы
 * 
 * Поведение:
 * - При загрузке инициализирует форму данными из initialData
 * - При переключении toggle синхронизирует данные между режимами
 * - При сохранении передает данные в onSave с учетом выбранного режима
 * - При отмене вызывает onCancel для возврата на вкладку просмотра
 * 
 * TODO: Замена моковых данных на API
 * - Реализовать сохранение через API: PUT /api/user/profile
 * - Валидация данных на сервере
 * - Обработка ошибок сохранения
 * - Показ индикатора загрузки при сохранении
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Text, Flex, Button, Grid, Switch } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { PersonIcon, EnvelopeClosedIcon, PaperPlaneIcon, ClockIcon, Pencil1Icon, ChevronLeftIcon } from "@radix-ui/react-icons"
// Импорт кастомного компонента поля ввода с плавающей меткой
import FloatingLabelInput from "@/components/FloatingLabelInput"
// Импорты хуков React для управления состоянием
import { useState } from "react"
// Импорт CSS модуля для стилизации компонента
import styles from './ProfileEditForm.module.css'

/**
 * LinkedInIcon - SVG иконка LinkedIn
 * 
 * Назначение: Отображение иконки LinkedIn в поле ввода
 * 
 * Параметры:
 * - width: ширина иконки (по умолчанию 16)
 * - height: высота иконки (по умолчанию 16)
 * 
 * Использование: Используется в поле ввода LinkedIn для визуального обозначения
 */
const LinkedInIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.2857 0H1.71429C0.767857 0 0 0.767857 0 1.71429V14.2857C0 15.2321 0.767857 16 1.71429 16H14.2857C15.2321 16 16 15.2321 16 14.2857V1.71429C16 0.767857 15.2321 0 14.2857 0ZM4.85714 13.7143H2.28571V6H4.85714V13.7143ZM3.57143 4.85714C2.71429 4.85714 2 4.14286 2 3.28571C2 2.42857 2.71429 1.71429 3.57143 1.71429C4.42857 1.71429 5.14286 2.42857 5.14286 3.28571C5.14286 4.14286 4.42857 4.85714 3.57143 4.85714ZM13.7143 13.7143H11.1429V9.71429C11.1429 8.71429 11.1429 7.42857 9.71429 7.42857C8.28571 7.42857 8.14286 8.57143 8.14286 9.57143V13.7143H5.57143V6H8V7.14286H8.14286C8.42857 6.57143 9.28571 5.85714 10.5714 5.85714C13.1429 5.85714 13.7143 7.57143 13.7143 10.2857V13.7143Z"
      fill="currentColor"
    />
  </svg>
)

/**
 * WorkTimeByDay - интерфейс для рабочего времени по дням недели
 * 
 * Структура:
 * - Каждый день недели (monday-friday) содержит объект с полями start и end
 * - start: время начала рабочего дня (формат HH:mm, например "09:00")
 * - end: время окончания рабочего дня (формат HH:mm, например "18:00")
 * 
 * Использование: Используется для хранения индивидуального рабочего времени для каждого дня недели
 */
interface WorkTimeByDay {
  monday?: { start: string; end: string }
  tuesday?: { start: string; end: string }
  wednesday?: { start: string; end: string }
  thursday?: { start: string; end: string }
  friday?: { start: string; end: string }
}

/**
 * ProfileEditFormProps - пропсы компонента ProfileEditForm
 * 
 * Параметры:
 * - initialData: начальные данные профиля для заполнения формы
 *   - firstName, lastName, email: обязательные поля (отключены для редактирования)
 *   - telegram, linkedin: опциональные контакты
 *   - workStartTime, workEndTime: общее рабочее время (если все дни одинаковые)
 *   - workTimeByDay: рабочее время по дням недели (если каждый день отдельно)
 *   - meetingInterval: интервал между встречами в минутах
 * - onCancel: обработчик отмены редактирования (возврат на вкладку просмотра)
 * - onSave: обработчик сохранения данных (принимает обновленные данные профиля)
 * 
 * Использование: Передаются из ProfilePage при рендеринге вкладки 'edit'
 */
interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    telegram?: string
    linkedin?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkTimeByDay
    meetingInterval?: string
  }
  onCancel: () => void
  onSave: (data: ProfileEditFormProps['initialData']) => void
}

/**
 * ProfileEditForm - компонент формы редактирования профиля
 * 
 * Состояние:
 * - formData: данные формы (синхронизируется с initialData при инициализации)
 * - telegramFocused: флаг фокуса на поле Telegram (для анимации метки)
 * - linkedinFocused: флаг фокуса на поле LinkedIn (для анимации метки)
 * - isAllDaysSame: режим рабочего времени (true = все дни одинаково, false = каждый день отдельно)
 * - workTimeByDay: рабочее время по дням недели (используется когда isAllDaysSame === false)
 * 
 * Поведение:
 * - При монтировании инициализирует форму данными из initialData
 * - Определяет начальный режим рабочего времени на основе наличия workTimeByDay
 * - При переключении toggle синхронизирует данные между режимами
 * - При сохранении передает данные в onSave с учетом выбранного режима
 */
export default function ProfileEditForm({
  initialData,
  onCancel,
  onSave
}: ProfileEditFormProps) {
  // Состояние формы: данные профиля для редактирования
  // Инициализируется из initialData при монтировании компонента
  const [formData, setFormData] = useState(initialData)
  
  // Состояние фокуса: Telegram поле (используется для анимации плавающей метки)
  // true когда поле в фокусе или содержит значение
  const [telegramFocused, setTelegramFocused] = useState(false)
  
  // Состояние фокуса: LinkedIn поле (используется для анимации плавающей метки)
  // true когда поле в фокусе или содержит значение
  const [linkedinFocused, setLinkedinFocused] = useState(false)
  
  /**
   * isAllDaysSame - режим рабочего времени
   * 
   * Определение начального режима:
   * - true: если есть workStartTime и workEndTime, но нет workTimeByDay
   * - false: если есть workTimeByDay (каждый день имеет свое время)
   * 
   * Использование: Определяет, какие поля отображать (общие или по дням)
   */
  const [isAllDaysSame, setIsAllDaysSame] = useState(
    !!(initialData.workStartTime && initialData.workEndTime) && !initialData.workTimeByDay
  )
  
  /**
   * workTimeByDay - рабочее время по дням недели
   * 
   * Инициализация:
   * - Если есть initialData.workTimeByDay - использует его
   * - Иначе создает объект с временем из workStartTime/workEndTime или значениями по умолчанию (09:00-18:00)
   * 
   * Использование: Используется когда isAllDaysSame === false (каждый день отдельно)
   */
  const [workTimeByDay, setWorkTimeByDay] = useState<WorkTimeByDay>(
    initialData.workTimeByDay || {
      monday: { start: initialData.workStartTime || '09:00', end: initialData.workEndTime || '18:00' },
      tuesday: { start: initialData.workStartTime || '09:00', end: initialData.workEndTime || '18:00' },
      wednesday: { start: initialData.workStartTime || '09:00', end: initialData.workEndTime || '18:00' },
      thursday: { start: initialData.workStartTime || '09:00', end: initialData.workEndTime || '18:00' },
      friday: { start: initialData.workStartTime || '09:00', end: initialData.workEndTime || '18:00' },
    }
  )

  /**
   * handleToggleChange - обработчик переключения режима рабочего времени
   * 
   * Функциональность:
   * - Переключает режим между "все дни одинаково" и "каждый день отдельно"
   * - Синхронизирует данные между режимами при переключении
   * 
   * Логика синхронизации:
   * - При переключении на "все дни одинаково" (checked === true):
   *   - Копирует время из первого дня (monday) в общие поля workStartTime и workEndTime
   * - При переключении на "каждый день отдельно" (checked === false):
   *   - Копирует общее время (workStartTime, workEndTime) во все дни недели
   * 
   * Поведение:
   * - Вызывается при изменении Switch "Все дни недели одинаково"
   * - Обновляет isAllDaysSame и синхронизирует данные
   * 
   * @param checked - новое состояние toggle (true = все дни одинаково, false = каждый день отдельно)
   */
  const handleToggleChange = (checked: boolean) => {
    setIsAllDaysSame(checked)
    // При переключении на "все дни одинаково" - копируем время из первого дня в общие поля
    if (checked && workTimeByDay.monday) {
      setFormData(prev => ({
        ...prev,
        workStartTime: workTimeByDay.monday!.start,
        workEndTime: workTimeByDay.monday!.end
      }))
    }
    // При переключении на "каждый день отдельно" - копируем общее время во все дни
    else if (!checked && formData.workStartTime && formData.workEndTime) {
      setWorkTimeByDay({
        monday: { start: formData.workStartTime, end: formData.workEndTime },
        tuesday: { start: formData.workStartTime, end: formData.workEndTime },
        wednesday: { start: formData.workStartTime, end: formData.workEndTime },
        thursday: { start: formData.workStartTime, end: formData.workEndTime },
        friday: { start: formData.workStartTime, end: formData.workEndTime },
      })
    }
  }

  /**
   * handleChange - фабрика обработчиков изменения полей формы
   * 
   * Функциональность:
   * - Создает обработчик для конкретного поля формы
   * - Обновляет formData при изменении значения поля
   * 
   * Использование:
   * - Используется для всех полей формы (firstName, lastName, email, telegram, linkedin, workStartTime, workEndTime, meetingInterval)
   * - Пример: onChange={handleChange('telegram')}
   * 
   * Поведение:
   * - Возвращает функцию-обработчик, которая обновляет указанное поле в formData
   * - Использует функциональное обновление состояния для избежания замыканий
   * 
   * @param field - имя поля для обновления (ключ из formData)
   * @returns обработчик события изменения поля
   */
  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  /**
   * handleSubmit - обработчик отправки формы
   * 
   * Функциональность:
   * - Предотвращает стандартную отправку формы (перезагрузка страницы)
   * - Подготавливает данные для сохранения с учетом выбранного режима рабочего времени
   * - Вызывает onSave с подготовленными данными
   * 
   * Подготовка данных:
   * - Если isAllDaysSame === true:
   *   - Включает workStartTime и workEndTime
   *   - Устанавливает workTimeByDay в undefined
   * - Если isAllDaysSame === false:
   *   - Включает workTimeByDay с временем по дням
   *   - Устанавливает workStartTime и workEndTime в undefined
   * 
   * Поведение:
   * - Вызывается при submit формы (нажатие Enter или кнопка "Сохранить")
   * - Передает данные в onSave для сохранения через API
   * - После сохранения остается на странице редактирования (не переходит на другую вкладку)
   * 
   * TODO: Реализовать сохранение через API
   * - PUT /api/user/profile с данными профиля
   * - Обработка ответа: успех или ошибка
   * - Показ индикатора загрузки при сохранении
   * - Отображение сообщений об ошибках
   * 
   * @param e - событие submit формы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Предотвращаем стандартную отправку формы
    
    // Подготавливаем данные для сохранения с учетом выбранного режима рабочего времени
    const dataToSave = {
      ...formData,
      // Если все дни одинаковые - используем общие поля, иначе - время по дням
      ...(isAllDaysSame 
        ? { 
            workStartTime: formData.workStartTime,
            workEndTime: formData.workEndTime,
            workTimeByDay: undefined // Очищаем время по дням, если используем общее время
          }
        : {
            workStartTime: undefined, // Очищаем общее время, если используем время по дням
            workEndTime: undefined,
            workTimeByDay: workTimeByDay // Используем время по дням недели
          }
      )
    }
    
    // Вызываем callback для сохранения данных
    onSave(dataToSave)
    // Остаемся на странице редактирования (не переходим на другую вкладку)
  }

  /**
   * handleWorkTimeByDayChange - обработчик изменения рабочего времени для конкретного дня
   * 
   * Функциональность:
   * - Обновляет время начала или окончания для указанного дня недели
   * - Сохраняет существующее время для другого поля дня (start или end)
   * 
   * Использование:
   * - Вызывается при изменении времени в полях "Начало" или "Конец" для конкретного дня
   * - Пример: onChange={(e) => handleWorkTimeByDayChange('monday', 'start', e.target.value)}
   * 
   * Поведение:
   * - Обновляет только указанное поле (start или end) для указанного дня
   * - Сохраняет значение другого поля дня без изменений
   * 
   * @param day - день недели (monday, tuesday, wednesday, thursday, friday)
   * @param field - поле для обновления ('start' | 'end')
   * @param value - новое значение времени (формат HH:mm)
   */
  const handleWorkTimeByDayChange = (day: keyof WorkTimeByDay, field: 'start' | 'end', value: string) => {
    setWorkTimeByDay(prev => ({
      ...prev,
      [day]: {
        ...prev[day], // Сохраняем существующее значение другого поля (start или end)
        [field]: value // Обновляем указанное поле
      }
    }))
  }

  /**
   * dayLabels - маппинг дней недели на русские названия
   * 
   * Использование: Отображается в метках полей времени для каждого дня недели
   * Пример: "Понедельник - Начало", "Вторник - Конец"
   */
  const dayLabels: Record<keyof WorkTimeByDay, string> = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница'
  }

  /**
   * Рендер компонента формы редактирования профиля
   * 
   * Структура:
   * - Заголовок с иконкой карандаша
   * - Форма с полями редактирования
   * - Кнопки действий (Отмена, Сохранить)
   */
  return (
    <Box className={styles.editBlock}>
      {/* Заголовок блока редактирования
          styles.header - стили для заголовка (отступы, граница снизу)
          Содержит иконку карандаша и текст "Редактирование профиля" */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          {/* Иконка карандаша - визуально обозначает режим редактирования
              width="20" height="20" - размер иконки */}
          <Pencil1Icon width="20" height="20" />
          {/* Текст заголовка - название блока
              size="4" - средний размер текста
              weight="bold" - жирное начертание */}
          <Text size="4" weight="bold">
            Редактирование профиля
          </Text>
        </Flex>
      </Box>

      {/* HTML форма для редактирования профиля
          onSubmit={handleSubmit} - обработчик отправки формы
          styles.form - стили для формы (отступы, расположение элементов)
          Предотвращает стандартную отправку формы (перезагрузка страницы) */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Содержимое формы - все поля редактирования
            styles.content - стили для контента (отступы, расположение) */}
        <Box className={styles.content}>
          {/* Сетка из двух колонок для имени и фамилии
              columns="2" - две колонки
              gap="4" - отступ между колонками
              styles.grid - стили для сетки (адаптивность на мобильных) */}
          <Grid columns="2" gap="4" width="100%" className={styles.grid}>
            {/* Левая колонка: Поле имени
                disabled - поле отключено, редактируется только администратором
                required - обязательное поле (валидация)
                icon - иконка пользователя слева от поля */}
            <Box>
              <FloatingLabelInput
                id="firstName"
                label="Имя"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                disabled
                icon={<PersonIcon width={16} height={16} />}
              />
            </Box>

            {/* Правая колонка: Поле фамилии
                disabled - поле отключено, редактируется только администратором
                required - обязательное поле (валидация)
                icon - иконка пользователя слева от поля */}
            <Box>
              <FloatingLabelInput
                id="lastName"
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                disabled
                icon={<PersonIcon width={16} height={16} />}
              />
            </Box>
          </Grid>

          {/* Поле Email - на всю ширину
              marginTop: '16px' - отступ сверху от предыдущих полей
              disabled - поле отключено, редактируется только администратором
              type="email" - тип поля для валидации email формата
              icon - иконка конверта слева от поля */}
          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled
              icon={<EnvelopeClosedIcon width={16} height={16} />}
            />
          </Box>

          {/* Поле Telegram - кастомная реализация с плавающей меткой
              marginTop: '16px' - отступ сверху
              position: 'relative' - для позиционирования иконки и префикса @
              Кастомная реализация вместо FloatingLabelInput для поддержки префикса @ */}
          <Box style={{ marginTop: '16px' }}>
            <Box style={{ position: 'relative' }}>
              {/* Иконка Telegram (самолетик) - слева от поля
                  position: 'absolute' - абсолютное позиционирование
                  left: '12px' - отступ слева
                  top - позиция по вертикали зависит от состояния (фокус/значение)
                  transform - центрирование по вертикали когда метка внизу
                  zIndex: 2 - поверх поля ввода
                  color - цвет иконки меняется при фокусе (accent-9) или серый (gray-11)
                  transition - плавная анимация перемещения */}
              <Box
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'none' : 'translateY(-50%)',
                  zIndex: 2,
                  color: telegramFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  pointerEvents: 'none',
                }}
              >
                <PaperPlaneIcon width={16} height={16} />
              </Box>
              {/* Префикс @ - между иконкой и полем ввода
                  position: 'absolute' - абсолютное позиционирование
                  left: '44px' - отступ слева (после иконки)
                  top - позиция по вертикали зависит от состояния (фокус/значение)
                  transform - центрирование по вертикали когда метка внизу
                  zIndex: 3 - поверх иконки
                  color - серый цвет для визуального отличия
                  transition - плавная анимация перемещения */}
              <Box
                style={{
                  position: 'absolute',
                  left: '44px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'none' : 'translateY(-50%)',
                  color: 'var(--gray-11)',
                  pointerEvents: 'none',
                  zIndex: 3,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                @
              </Box>
              {/* Поле ввода Telegram username
                  type="text" - текстовое поле
                  value - значение из formData.telegram или пустая строка
                  onChange - обработчик изменения через handleChange('telegram')
                  paddingTop/paddingBottom - динамические отступы в зависимости от состояния метки
                  paddingLeft: '60px' - отступ слева для иконки и префикса @
                  border - граница поля (меняется при фокусе)
                  backgroundColor - фон поля (адаптируется к теме)
                  transition - плавная анимация всех изменений */}
              <input
                id="telegram"
                type="text"
                value={formData.telegram || ''}
                onChange={handleChange('telegram')}
                style={{
                  width: '100%',
                  paddingTop: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '20px' : '12px',
                  paddingBottom: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '8px' : '12px',
                  paddingLeft: '60px',
                  paddingRight: '12px',
                  fontSize: '15px',
                  lineHeight: '20px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  setTelegramFocused(true) // Устанавливаем фокус для анимации метки
                  e.currentTarget.style.borderColor = 'var(--accent-9)' // Подсветка границы при фокусе
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)' // Тень для визуального выделения
                }}
                onBlur={(e) => {
                  setTelegramFocused(false) // Снимаем фокус
                  e.currentTarget.style.borderColor = 'var(--gray-a6)' // Возвращаем стандартную границу
                  e.currentTarget.style.boxShadow = 'none' // Убираем тень
                }}
              />
              {/* Плавающая метка "Telegram username"
                  as="label" - семантический label для поля
                  htmlFor="telegram" - связь с полем ввода
                  size - размер текста меняется в зависимости от состояния (1 когда вверху, 3 когда внизу)
                  position: 'absolute' - абсолютное позиционирование
                  left: '60px' - отступ слева (после иконки и префикса @)
                  top - позиция по вертикали зависит от состояния (8px когда вверху, 50% когда внизу)
                  transform - центрирование по вертикали когда метка внизу
                  color - цвет меняется при фокусе (accent-9) или серый (gray-11)
                  backgroundColor - фон метки когда она вверху (для перекрытия границы поля)
                  padding - отступы метки когда она вверху
                  fontWeight - жирность меняется в зависимости от состояния
                  transition - плавная анимация перемещения и изменения размера */}
              <Text
                as="label"
                htmlFor="telegram"
                size={(telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? "1" : "3"}
                style={{
                  position: 'absolute',
                  left: '60px',
                  top: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '8px' : '50%',
                  transform: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'translateY(0)' : 'translateY(-50%)',
                  color: telegramFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 'var(--color-panel)' : 'transparent',
                  padding: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? '0 4px' : '0',
                  zIndex: 1,
                  fontWeight: (telegramFocused || formData.telegram) && formData.telegram && formData.telegram.length > 0 ? 500 : 400,
                }}
              >
                Telegram username
              </Text>
            </Box>
          </Box>

          <Box style={{ marginTop: '16px' }}>
            <Box style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '20px' : '50%',
                  transform: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'none' : 'translateY(-50%)',
                  zIndex: 2,
                  color: linkedinFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  pointerEvents: 'none',
                }}
              >
                <LinkedInIcon width={16} height={16} />
              </Box>
              <input
                id="linkedin"
                type="text"
                value={formData.linkedin || ''}
                onChange={handleChange('linkedin')}
                style={{
                  width: '100%',
                  paddingTop: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '20px' : '12px',
                  paddingBottom: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '8px' : '12px',
                  paddingLeft: '44px',
                  paddingRight: '12px',
                  fontSize: '15px',
                  lineHeight: '20px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-a6)',
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--gray-12)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  setLinkedinFocused(true)
                  e.currentTarget.style.borderColor = 'var(--accent-9)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
                }}
                onBlur={(e) => {
                  setLinkedinFocused(false)
                  e.currentTarget.style.borderColor = 'var(--gray-a6)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <Text
                as="label"
                htmlFor="linkedin"
                size={(linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? "1" : "3"}
                style={{
                  position: 'absolute',
                  left: '44px',
                  top: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '8px' : '50%',
                  transform: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'translateY(0)' : 'translateY(-50%)',
                  color: linkedinFocused ? 'var(--accent-9)' : 'var(--gray-11)',
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 'var(--color-panel)' : 'transparent',
                  padding: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? '0 4px' : '0',
                  zIndex: 1,
                  fontWeight: (linkedinFocused || formData.linkedin) && formData.linkedin && formData.linkedin.length > 0 ? 500 : 400,
                }}
              >
                LinkedIn username
              </Text>
            </Box>
          </Box>

          {/* Toggle для выбора режима рабочего времени
              marginTop: '16px' - отступ сверху от предыдущих полей
              Switch - переключатель между режимами "все дни одинаково" и "каждый день отдельно"
              Текст подсказки меняется в зависимости от выбранного режима */}
          <Box style={{ marginTop: '16px' }}>
            <Flex align="center" gap="2" mb="2">
              {/* Switch переключатель режима рабочего времени
                  checked={isAllDaysSame} - текущее состояние (true = все дни одинаково)
                  onCheckedChange={handleToggleChange} - обработчик переключения
                  При переключении синхронизирует данные между режимами */}
              <Switch
                checked={isAllDaysSame}
                onCheckedChange={handleToggleChange}
              />
              {/* Текст метки переключателя
                  size="2" - маленький размер текста
                  weight="medium" - средняя жирность */}
              <Text size="2" weight="medium">
                Все дни недели одинаково
              </Text>
            </Flex>
            {/* Подсказка под переключателем - объясняет текущий режим
                size="1" - очень маленький размер текста
                color="gray" - серый цвет для визуального отличия
                marginLeft: '28px' - отступ слева для выравнивания с текстом переключателя
                Условный текст в зависимости от isAllDaysSame */}
            <Text size="1" color="gray" style={{ marginLeft: '28px', display: 'block' }}>
              {isAllDaysSame 
                ? 'Одно и то же рабочее время для всех рабочих дней'
                : 'Настроить рабочее время для каждого дня недели отдельно'
              }
            </Text>
          </Box>

          {/* Условный рендеринг полей рабочего времени
              isAllDaysSame === true: отображаем общие поля (workStartTime, workEndTime)
              isAllDaysSame === false: отображаем поля для каждого дня недели отдельно */}
          {isAllDaysSame ? (
            /* Режим: все дни одинаковые
                Отображаем два поля: начало и конец рабочего времени
                Эти значения применяются ко всем рабочим дням недели */
            <Grid columns="2" gap="4" width="100%" style={{ marginTop: '16px' }} className={styles.grid}>
              {/* Левая колонка: Поле начала рабочего времени
                  type="time" - поле выбора времени (HTML5 time picker)
                  value - значение из formData.workStartTime
                  onChange - обработчик изменения через handleChange('workStartTime')
                  icon - иконка часов слева от поля
                  Подсказка под полем объясняет назначение */}
              <Box>
                <FloatingLabelInput
                  id="workStartTime"
                  label="Начало рабочего времени"
                  type="time"
                  value={formData.workStartTime || ''}
                  onChange={handleChange('workStartTime')}
                  icon={<ClockIcon width={16} height={16} />}
                />
                <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                  Время начала рабочего дня для планирования интервью
                </Text>
              </Box>

              {/* Правая колонка: Поле окончания рабочего времени
                  type="time" - поле выбора времени (HTML5 time picker)
                  value - значение из formData.workEndTime
                  onChange - обработчик изменения через handleChange('workEndTime')
                  icon - иконка часов слева от поля
                  Подсказка под полем объясняет назначение */}
              <Box>
                <FloatingLabelInput
                  id="workEndTime"
                  label="Конец рабочего времени"
                  type="time"
                  value={formData.workEndTime || ''}
                  onChange={handleChange('workEndTime')}
                  icon={<ClockIcon width={16} height={16} />}
                />
                <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                  Время окончания рабочего дня для планирования интервью
                </Text>
              </Box>
            </Grid>
          ) : (
            /* Режим: каждый день отдельно
                Отображаем поля для каждого дня недели (понедельник - пятница)
                Каждый день имеет два поля: начало и конец рабочего времени
                Используем map для генерации полей для всех дней */
            <Box style={{ marginTop: '16px' }}>
              {/* Генерируем поля для каждого дня недели
                  Используем массив ['monday', 'tuesday', ...] для итерации
                  key={day} - уникальный ключ для React
                  marginTop - отступ сверху только для дней после понедельника */}
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as Array<keyof WorkTimeByDay>).map((day) => (
                <Grid key={day} columns="2" gap="4" width="100%" style={{ marginTop: day !== 'monday' ? '16px' : '0' }} className={styles.grid}>
                  {/* Левая колонка: Поле начала рабочего времени для конкретного дня
                      id={`${day}-start`} - уникальный идентификатор (например, "monday-start")
                      label - метка с названием дня и "Начало" (например, "Понедельник - Начало")
                      type="time" - поле выбора времени
                      value - значение из workTimeByDay[day]?.start
                      onChange - обработчик изменения через handleWorkTimeByDayChange
                      icon - иконка часов */}
                  <Box>
                    <FloatingLabelInput
                      id={`${day}-start`}
                      label={`${dayLabels[day]} - Начало`}
                      type="time"
                      value={workTimeByDay[day]?.start || ''}
                      onChange={(e) => handleWorkTimeByDayChange(day, 'start', e.target.value)}
                      icon={<ClockIcon width={16} height={16} />}
                    />
                  </Box>

                  {/* Правая колонка: Поле окончания рабочего времени для конкретного дня
                      id={`${day}-end`} - уникальный идентификатор (например, "monday-end")
                      label - метка с названием дня и "Конец" (например, "Понедельник - Конец")
                      type="time" - поле выбора времени
                      value - значение из workTimeByDay[day]?.end
                      onChange - обработчик изменения через handleWorkTimeByDayChange
                      icon - иконка часов */}
                  <Box>
                    <FloatingLabelInput
                      id={`${day}-end`}
                      label={`${dayLabels[day]} - Конец`}
                      type="time"
                      value={workTimeByDay[day]?.end || ''}
                      onChange={(e) => handleWorkTimeByDayChange(day, 'end', e.target.value)}
                      icon={<ClockIcon width={16} height={16} />}
                    />
                  </Box>
                </Grid>
              ))}
            </Box>
          )}

          {/* Поле интервала между встречами
              marginTop: '16px' - отступ сверху
              type="number" - числовое поле для ввода минут
              value - значение из formData.meetingInterval
              onChange - обработчик изменения через handleChange('meetingInterval')
              icon - иконка часов слева от поля
              Подсказка под полем объясняет формат (кратно 5, от 0 до 60 минут) */}
          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="meetingInterval"
              label="Время между встречами"
              type="number"
              value={formData.meetingInterval || ''}
              onChange={handleChange('meetingInterval')}
              icon={<ClockIcon width={16} height={16} />}
            />
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Время между встречами в минутах (кратно 5, от 0 до 60)
            </Text>
          </Box>
        </Box>

        {/* Кнопки действий формы
            styles.actions - стили для контейнера кнопок (отступы, расположение)
            justify="between" - кнопки по краям (Отмена слева, Сохранить справа)
            align="center" - вертикальное выравнивание по центру */}
        <Flex justify="between" align="center" className={styles.actions}>
          {/* Кнопка "Отмена" - возврат на вкладку просмотра профиля
              type="button" - кнопка не отправляет форму
              variant="soft" - мягкий стиль (прозрачный фон)
              onClick={onCancel} - обработчик отмены (вызывает callback из ProfilePage)
              Внутри: иконка стрелки влево и текст */}
          <Button
            type="button"
            variant="soft"
            onClick={onCancel}
          >
            <ChevronLeftIcon width={16} height={16} />
            Отмена
          </Button>
          
          {/* Кнопка "Сохранить изменения" - отправка формы
              type="submit" - кнопка отправки формы (вызывает handleSubmit)
              className={styles.saveButton} - стили для кнопки сохранения (акцентный цвет)
              Внутри: иконка сохранения и текст */}
          <Button
            type="submit"
            className={styles.saveButton}
          >
            <SaveIcon width={16} height={16} />
            Сохранить изменения
          </Button>
        </Flex>
      </form>
    </Box>
  )
}

/**
 * SaveIcon - SVG иконка сохранения
 * 
 * Назначение: Отображение иконки сохранения на кнопке "Сохранить изменения"
 * 
 * Параметры:
 * - width: ширина иконки (по умолчанию 16)
 * - height: высота иконки (по умолчанию 16)
 * 
 * Использование: Используется в кнопке сохранения формы редактирования профиля
 */
const SaveIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 2.5C3 2.22386 3.22386 2 3.5 2H9.08579C9.351 2 9.60536 2.10536 9.79289 2.29289L12.7071 5.20711C12.8946 5.39464 13 5.649 13 5.91421V12.5C13 12.7761 12.7761 13 12.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5ZM4 3V12H12V5.91421L9.08579 3H4ZM5.5 3H8.5V5H5.5V3ZM5.5 6.5H9.5V7.5H5.5V6.5ZM5.5 9H9.5V10H5.5V9Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)
