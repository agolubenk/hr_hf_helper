# Документация компонента: AccentColorSettings

## Общее описание

Компонент настройки акцентного цвета темы. Позволяет выбрать акцентный цвет для светлой и темной темы из предустановленной палитры Radix UI.

**Расположение**: `components/profile/AccentColorSettings.tsx`  
**Использование**: Вкладка "Редактирование" страницы профиля (`/account/profile?tab=edit`)

## Функциональность

### Выбор цвета

- **Светлая тема**: выбор акцентного цвета для светлой темы
- **Темная тема**: выбор акцентного цвета для темной темы
- **Превью цветов**: цветные квадраты в выпадающем списке Select
- **21 доступный цвет**: из палитры Radix UI

### Доступные цвета

1. blue - Синий
2. tomato - Томатный
3. red - Красный
4. ruby - Рубин
5. crimson - Малиновый
6. pink - Розовый
7. plum - Сливовый
8. purple - Фиолетовый
9. violet - Фиалковый
10. iris - Ирис
11. indigo - Индиго
12. cyan - Бирюзовый
13. teal - Тиффани
14. jade - Нефрит
15. green - Зеленый
16. grass - Трава
17. lime - Лайм
18. yellow - Желтый
19. amber - Янтарный
20. orange - Оранжевый
21. brown - Коричневый

## Состояние компонента

### Пропсы (нет внутреннего состояния)

- `lightThemeColor`: текущий акцентный цвет для светлой темы
- `darkThemeColor`: текущий акцентный цвет для темной темы
- `onLightThemeColorChange`: обработчик изменения цвета светлой темы
- `onDarkThemeColorChange`: обработчик изменения цвета темной темы

## Функции и обработчики

### onLightThemeColorChange(color: AccentColorValue)

**Назначение**: Обработчик изменения акцентного цвета светлой темы

**Поведение**:
- Вызывается при изменении значения в Select для светлой темы
- Передает новый цвет в ThemeProvider через callback

### onDarkThemeColorChange(color: AccentColorValue)

**Назначение**: Обработчик изменения акцентного цвета темной темы

**Поведение**:
- Вызывается при изменении значения в Select для темной темы
- Передает новый цвет в ThemeProvider через callback

## Интерфейсы

### AccentColorSettingsProps

```typescript
interface AccentColorSettingsProps {
  lightThemeColor: AccentColorValue
  darkThemeColor: AccentColorValue
  onLightThemeColorChange: (color: AccentColorValue) => void
  onDarkThemeColorChange: (color: AccentColorValue) => void
}
```

### AccentColorValue

```typescript
type AccentColorValue = typeof ACCENT_COLORS[number]['value']
// 'blue' | 'tomato' | 'red' | ... | 'brown'
```

## Константы

### ACCENT_COLORS

Массив объектов с `value` (внутреннее имя) и `label` (отображаемое название на русском)

### COLOR_PREVIEWS

Маппинг цветов на hex коды (9-й оттенок из Radix UI цветовой палитры)

## TODO: Интеграция с API

1. ❌ Сохранение акцентных цветов через API
   - PUT `/api/user/theme` с `{ lightThemeColor, darkThemeColor }`
   - Сохранение в настройках пользователя

2. ❌ Загрузка сохраненных цветов
   - GET `/api/user/theme`
   - Загрузка при инициализации ThemeProvider

## Стили

- **Файл**: `AccentColorSettings.module.css`
- **Основные классы**:
  - `.accentColorBlock` - основной контейнер блока
  - `.header` - заголовок блока
  - `.content` - содержимое блока
  - `.grid` - сетка двух колонок
  - `.colorPreview` - превью цвета (цветной квадрат)

## Связи с другими компонентами

- **ThemeProvider**: использует акцентные цвета для применения к теме
- **ProfilePage**: используется на вкладке 'edit' страницы профиля
- **ACCENT_COLORS**: экспортируется для использования в других компонентах
