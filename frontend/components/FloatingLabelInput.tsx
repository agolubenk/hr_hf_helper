/**
 * FloatingLabelInput (components/FloatingLabelInput.tsx) - Поле ввода с плавающей меткой
 * 
 * Назначение:
 * - Поле ввода с меткой, которая "всплывает" при фокусе или наличии значения
 * - Улучшенный UX по сравнению с обычными полями ввода
 * - Поддержка иконок и обязательных полей
 * 
 * Функциональность:
 * - Плавающая метка: метка перемещается вверх при фокусе или наличии значения
 * - Иконка: опциональная иконка слева от поля ввода
 * - Обязательное поле: отображение звездочки для обязательных полей
 * - Отключенное состояние: визуальная индикация отключенного поля
 * - Адаптивные стили: изменение стилей при фокусе и заполнении
 * 
 * Связи:
 * - Используется в формах по всему приложению
 * - Radix UI Text: для отображения метки
 * 
 * Поведение:
 * - При фокусе: метка перемещается вверх, показывается placeholder (если есть)
 * - При вводе текста: метка остается вверху
 * - При потере фокуса без значения: метка возвращается в центр
 * - При потере фокуса со значением: метка остается вверху
 * - При фокусе: граница и тень меняют цвет на акцентный
 */

'use client'

import { Box, Text } from "@radix-ui/themes"
import { useState, ReactNode } from "react"

/**
 * FloatingLabelInputProps - интерфейс пропсов компонента FloatingLabelInput
 * 
 * Структура:
 * - id: уникальный идентификатор поля (для связи с label)
 * - label: текст метки поля
 * - type: тип поля ввода (text, email, password и т.д.)
 * - value: значение поля
 * - onChange: обработчик изменения значения
 * - placeholder: текст плейсхолдера (показывается когда метка "всплыла")
 * - required: флаг обязательности поля (показывает звездочку)
 * - icon: иконка слева от поля (опционально)
 * - disabled: флаг отключенного состояния
 */
interface FloatingLabelInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  icon?: ReactNode
  disabled?: boolean
}

/**
 * FloatingLabelInput - компонент поля ввода с плавающей меткой
 * 
 * Состояние:
 * - isFocused: флаг фокуса на поле ввода
 * 
 * Функциональность:
 * - Управление позицией метки в зависимости от фокуса и значения
 * - Адаптивные стили при фокусе и заполнении
 */
export default function FloatingLabelInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  disabled = false,
}: FloatingLabelInputProps) {
  // Флаг фокуса на поле ввода (для управления позицией метки)
  const [isFocused, setIsFocused] = useState(false)

  /**
   * isFloating - флаг "всплытия" метки
   * 
   * Логика:
   * - true если поле в фокусе ИЛИ есть введенное значение
   * - false если поле не в фокусе И значение пустое
   * 
   * Используется для:
   * - Определения позиции метки (вверху или в центре)
   * - Определения размера метки
   * - Определения отображения placeholder
   */
  const isFloating = isFocused || value.length > 0

  /**
   * Рендер компонента FloatingLabelInput
   * 
   * Структура:
   * - Box контейнер с relative позицией
   * - Иконка (если есть) - абсолютное позиционирование слева
   * - input поле ввода
   * - Text метка - абсолютное позиционирование, перемещается в зависимости от isFloating
   */
  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      {/* Иконка поля ввода (если передана)
          - Абсолютное позиционирование слева
          - Позиция зависит от isFloating (вверху или в центре)
          - Цвет зависит от фокуса и состояния disabled
          - Плавные переходы при изменении позиции */}
      {icon && (
        <Box
          style={{
            position: 'absolute',
            left: '12px',
            top: isFloating ? '20px' : '50%', // Вверху если метка "всплыла", иначе в центре
            transform: isFloating ? 'none' : 'translateY(-50%)', // Центрирование если не "всплыла"
            zIndex: 2, // Поверх метки
            color: disabled ? 'var(--gray-10)' : (isFocused ? 'var(--accent-9)' : 'var(--gray-11)'), // Адаптивный цвет
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease-in-out', // Плавные переходы
            pointerEvents: 'none', // Не перехватывает события мыши
          }}
        >
          {icon}
        </Box>
      )}
      {/* Поле ввода
          - Адаптивные отступы в зависимости от isFloating
          - Адаптивные стили при фокусе (граница и тень)
          - Поддержка disabled состояния */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={isFloating ? placeholder : ''} // Placeholder показывается только когда метка "всплыла"
        style={{
          width: '100%',
          paddingTop: isFloating ? '20px' : '12px', // Больше отступ сверху если метка "всплыла"
          paddingBottom: isFloating ? '8px' : '12px', // Меньше отступ снизу если метка "всплыла"
          paddingLeft: icon ? '44px' : '12px', // Отступ слева учитывает иконку
          paddingRight: '12px',
          fontSize: '15px',
          lineHeight: '20px',
          borderRadius: '6px',
          border: '1px solid var(--gray-a6)',
          backgroundColor: disabled ? 'var(--gray-a3)' : 'var(--color-panel)', // Адаптивный фон
          color: disabled ? 'var(--gray-10)' : 'var(--gray-12)', // Адаптивный цвет текста
          outline: 'none',
          transition: 'all 0.2s ease-in-out', // Плавные переходы
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'text', // Курсор зависит от состояния
          opacity: disabled ? 0.7 : 1, // Прозрачность для disabled
        }}
        onFocus={(e) => {
          // При фокусе: устанавливаем флаг и меняем стили границы
          if (!disabled) {
            setIsFocused(true)
            e.currentTarget.style.borderColor = 'var(--accent-9)' // Акцентный цвет границы
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)' // Акцентная тень
          }
        }}
        onBlur={(e) => {
          // При потере фокуса: сбрасываем флаг и возвращаем обычные стили
          if (!disabled) {
            setIsFocused(false)
            e.currentTarget.style.borderColor = 'var(--gray-a6)' // Обычный цвет границы
            e.currentTarget.style.boxShadow = 'none' // Убираем тень
          }
        }}
      />
      {/* Плавающая метка
          - Абсолютное позиционирование
          - Позиция и размер зависят от isFloating
          - Цвет зависит от фокуса
          - Фон для перекрытия границы поля когда "всплыла" */}
      <Text
        as="label"
        htmlFor={id}
        size={isFloating ? "1" : "3"} // Меньший размер когда "всплыла"
        style={{
          position: 'absolute',
          left: icon ? '44px' : '12px', // Отступ слева учитывает иконку
          top: isFloating ? '8px' : '50%', // Вверху если "всплыла", иначе в центре
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)', // Центрирование если не "всплыла"
          color: isFocused ? 'var(--accent-9)' : 'var(--gray-11)', // Акцентный цвет при фокусе
          pointerEvents: 'none', // Не перехватывает события мыши
          transition: 'all 0.2s ease-in-out', // Плавные переходы
          backgroundColor: isFloating ? 'var(--color-panel)' : 'transparent', // Фон для перекрытия границы когда "всплыла"
          padding: isFloating ? '0 4px' : '0', // Отступы для фона когда "всплыла"
          zIndex: 1, // Поверх поля ввода, но под иконкой
          fontWeight: isFloating ? 500 : 400, // Жирнее когда "всплыла"
        }}
      >
        {label}
        {/* Звездочка для обязательных полей */}
        {required && <span style={{ color: 'var(--red-9)' }}> *</span>}
      </Text>
    </Box>
  )
}
