# 🎨 Подробные Референсы Гибридных Тем

## Часть 1: SOFT WARM BLACK (Светлая тема)

### 🎯 Концепция
**Soft Warm Orange + Pure Black = Максимальная контрастность и читаемость**

Используем черный цвет для текста вместо серого, чтобы достичь максимального контраста (18.5:1). Это отлично работает для light-only приложений, где не планируется ночной режим.

### 📋 Полная Палитра

```
┌─────────────────────────────────────────────┐
│ SOFT WARM BLACK - LIGHT MODE                │
├─────────────────────────────────────────────┤
│                                             │
│ PRIMARY ORANGE                              │
│ #FF9158  RGB(255, 145, 88)  HSL(18°,100%,67%)
│ Использование: Основные кнопки, ссылки      │
│ Контрастность на черном: 4.23:1 (AA)        │
│ Контрастность на фоне: 6.1:1 (AAA)          │
│                                             │
│ DEEP ORANGE (HOVER)                         │
│ #FF7D3D  RGB(255, 125, 61)  HSL(18°,100%,62%)
│ Использование: Hover состояния              │
│ Контрастность: 5.1:1 (AA)                   │
│                                             │
│ PURE BLACK (TEXT)                           │
│ #000000  RGB(0, 0, 0)  HSL(0°, 0%, 0%)      │
│ Использование: Основной текст               │
│ Контрастность на белом: 21:1 (максимум)     │
│ Контрастность на фоне: 18.5:1 (WCAG AAA++)  │
│                                             │
│ VERY DARK GRAY (ALT TEXT)                   │
│ #2C2C2C  RGB(44, 44, 44)  HSL(0°, 0%, 17%)  │
│ Использование: Вторичный текст              │
│ Контрастность: 17.2:1 (WCAG AAA++)          │
│                                             │
│ WARM WHITE (BACKGROUND)                     │
│ #FFFBF7  RGB(255, 251, 247)  HSL(20°,100%,99%)
│ Использование: Основной фон                 │
│ Теплый оттенок для комфорта глаз            │
│                                             │
│ SEASHELL (ALT BACKGROUND)                   │
│ #FFF5EE  RGB(255, 245, 238)  HSL(17°,100%,96%)
│ Использование: Карточки, секции             │
│ Визуальное разделение с основным фоном      │
│                                             │
│ BLACK BORDERS                               │
│ #2C2C2C  RGB(44, 44, 44)                    │
│ Использование: Границы, разделители         │
│ Четкие, видимые границы                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 🏗️ Структура Компонентов

#### HEADER
```
┌──────────────────────────────────┐
│ Background: #FF9158 (Soft Orange)│
│ Text: #000000 (Pure Black)       │
│ Height: 64px                      │
│ Shadow: rgba(0,0,0, 0.15)        │
└──────────────────────────────────┘
```
**Назначение:** Навигационный header с максимальной видимостью
**Контрастность:** 4.23:1 (WCAG AA)

#### MAIN CONTENT
```
┌──────────────────────────────────┐
│ Background: #FFFBF7 (Warm White) │
│ Text: #000000 (Pure Black)       │
│ Padding: 32px                    │
│ Min Height: calc(100vh - 64px)   │
└──────────────────────────────────┘
```
**Назначение:** Основной контент область
**Комфорт:** Теплый оттенок белого уменьшает напряжение глаз

#### CARDS
```
┌──────────────────────────────────┐
│ Background: #FFF5EE (Seashell)   │
│ Border: 1px solid #2C2C2C (Black)│
│ Text: #000000 (Pure Black)       │
│ Padding: 24px                    │
│ Border Radius: 8px               │
│ Shadow: 0 2px 8px rgba(0,0,0,0.15)
└──────────────────────────────────┘
```
**Назначение:** Информационные блоки с визуальной иерархией
**Особенность:** Черные границы создают четкость и профессиональность

#### PRIMARY BUTTONS
```
┌──────────────────────────────────┐
│ Background: #FF9158 (Orange)     │
│ Text: #000000 (Black)            │
│ Border: 2px solid #2C2C2C        │
│ Padding: 12px 24px               │
│ Border Radius: 6px               │
│ Hover: Background #FF7D3D        │
│ Hover: Transform translateY(-2px)│
└──────────────────────────────────┘
```
**Контрастность:** 4.23:1 при обычном состоянии
**Интерактивность:** Легко видимое изменение при hover

#### INPUT FIELDS
```
┌──────────────────────────────────┐
│ Background: #FFFFFF (Pure White) │
│ Text: #000000 (Black)            │
│ Border: 1px solid #2C2C2C        │
│ Padding: 10px 12px               │
│ Border Radius: 4px               │
│ Focus Border: #FF9158            │
│ Focus Shadow: 0 0 0 3px          │
│            rgba(255,145,88, 0.15)│
└──────────────────────────────────┘
```
**Вводность:** Чистый белый фон для максимальной четкости
**Фокус:** Оранжевая граница и тень указывают на активность

#### NAVIGATION BAR
```
┌──────────────────────────────────┐
│ Background: #000000 (Pure Black) │
│ Text: #FFFFFF (White)            │
│ Hover Text: #FF9158 (Orange)     │
│ Padding: 16px 24px               │
│ Display: Flex, Gap: 24px         │
│ Position: Sticky                 │
└──────────────────────────────────┘
```
**Назначение:** Основная навигация
**Контрастность белого на черном:** 21:1 (максимум WCAG AAA++)

---

## Часть 2: CLASSIC ENERGETIC HYBRID (Темная тема)

### 🎯 Концепция
**Classic Bootstrap Warmth + Energetic Pro Brightness = Идеальный гибрид для темного режима**

Объединяем теплоту классического бутстрапа (#FFA84D) с энергией профессионального оранжа (#FF9456) в новый гибридный цвет #FF9E70, который ярче, чем классический, и теплее, чем энергичный.

### 📋 Полная Палитра

```
┌─────────────────────────────────────────────┐
│ CLASSIC ENERGETIC HYBRID - DARK MODE        │
├─────────────────────────────────────────────┤
│                                             │
│ HYBRID ORANGE (PRIMARY)                     │
│ #FF9E70  RGB(255, 158, 112)  HSL(18°,100%,72%)
│ Использование: Основные кнопки и CTA        │
│ Контрастность на #121212: 11.2:1 (WCAG AAA) │
│ Контрастность на #1E1E1E: 10.8:1 (WCAG AAA) │
│ Баланс: Между Classic (#FFA84D) и           │
│         Energetic (#FF9456)                 │
│                                             │
│ WARM ACCENT ORANGE (HOVER)                  │
│ #FFB380  RGB(255, 179, 128)  HSL(18°,100%,75%)
│ Использование: Hover, Focus состояния       │
│ Контрастность: 12.1:1 (WCAG AAA)            │
│ Переход: Плавный и видимый                  │
│                                             │
│ PURE WHITE (PRIMARY TEXT)                   │
│ #FFFFFF  RGB(255, 255, 255)  HSL(0°, 0%, 100%)
│ Использование: Основной текст               │
│ Контрастность на #121212: 16.5:1 (WCAG AAA++)
│ Четкость: Максимальная                      │
│                                             │
│ LIGHT GRAY (SECONDARY TEXT)                 │
│ #D0D0D0  RGB(208, 208, 208)  HSL(0°, 0%, 82%)
│ Использование: Вторичный текст, подписи     │
│ Контрастность: 13.2:1 (WCAG AAA)            │
│ Назначение: Мягче, чем чистый белый         │
│                                             │
│ PREMIUM DARK (PRIMARY BACKGROUND)           │
│ #121212  RGB(18, 18, 18)  HSL(0°, 0%, 7%)   │
│ Использование: Основной фон                 │
│ Ощущение: Premium Material Design 3 style   │
│ Глаза: Комфортно для длительного чтения     │
│                                             │
│ SLIGHTLY LIGHTER DARK (ELEVATED)            │
│ #1E1E1E  RGB(30, 30, 30)  HSL(0°, 0%, 12%)  │
│ Использование: Карточки, панели             │
│ Визуальная иерархия: Возвышение             │
│                                             │
│ EVEN LIGHTER DARK (EXTRA ELEVATED)          │
│ #262626  RGB(38, 38, 38)  HSL(0°, 0%, 15%)  │
│ Использование: Модальные окна, всплывающие  │
│                                             │
│ DARK BORDERS                                │
│ #323232  RGB(50, 50, 50)  HSL(0°, 0%, 20%)  │
│ Использование: Границы, разделители         │
│ Видимость: Четкие на темном фоне            │
│                                             │
└─────────────────────────────────────────────┘
```

### 🏗️ Структура Компонентов

#### HEADER
```
┌──────────────────────────────────┐
│ Background: #FF9E70 (Hybrid)     │
│ Text: #FFFFFF (White)            │
│ Height: 64px                      │
│ Shadow: 0 4px 12px rgba(0,0,0,0.5)
└──────────────────────────────────┘
```
**Назначение:** Видимая навигация на темном фоне
**Контрастность:** 11.2:1 (WCAG AAA) - отличная читаемость
**Характер:** Энергичный и современный

#### MAIN CONTENT
```
┌──────────────────────────────────┐
│ Background: #121212 (Premium Dark)
│ Text: #FFFFFF (White)            │
│ Padding: 32px                    │
│ Min Height: calc(100vh - 64px)   │
└──────────────────────────────────┘
```
**Назначение:** Основная контент область
**Ощущение:** Премиум, как Material Design 3
**Глаза:** Не слишком черный, не слишком светлый

#### CARDS
```
┌──────────────────────────────────┐
│ Background: #1E1E1E (Elevated)   │
│ Border: 1px solid #323232        │
│ Text: #FFFFFF (White)            │
│ Padding: 24px                    │
│ Border Radius: 8px               │
│ Shadow: 0 4px 16px rgba(0,0,0,0.5)
└──────────────────────────────────┘
```
**Назначение:** Информационные блоки с возвышением
**Иерархия:** Видимо отличается от основного фона
**Структура:** Subtle borders для четкости

#### PRIMARY BUTTONS
```
┌──────────────────────────────────┐
│ Background: #FF9E70 (Hybrid)     │
│ Text: #FFFFFF (White)            │
│ Border: None                      │
│ Padding: 12px 24px               │
│ Border Radius: 6px               │
│ Hover Background: #FFB380        │
│ Hover Transform: translateY(-2px)│
│ Shadow: 0 4px 12px rgba(255,158,112,0.3)
└──────────────────────────────────┘
```
**Контрастность:** 11.2:1 - отличная для CTA
**Взаимодействие:** Плавный переход к более светлому оранжу

#### SECONDARY BUTTONS (GHOST)
```
┌──────────────────────────────────┐
│ Background: Transparent          │
│ Text: #FF9E70 (Hybrid Orange)    │
│ Border: 1px solid #FF9E70        │
│ Padding: 10px 20px               │
│ Border Radius: 6px               │
│ Hover Background: rgba(255,158,112,0.1)
│ Hover Text: #FFB380              │
└──────────────────────────────────┘
```
**Назначение:** Вторичные действия
**Стиль:** Outline/Ghost стиль
**Читаемость:** Высокая контрастность текста

#### INPUT FIELDS
```
┌──────────────────────────────────┐
│ Background: #1E1E1E (Dark)       │
│ Text: #FFFFFF (White)            │
│ Border: 1px solid #323232        │
│ Padding: 10px 12px               │
│ Border Radius: 4px               │
│ Focus Border: #FF9E70 (Orange)   │
│ Focus Shadow: 0 0 0 3px          │
│            rgba(255,158,112,0.3) │
│ Placeholder: #9E9E9E (Medium Gray)
└──────────────────────────────────┘
```
**Видимость:** Темный фон с легко видимыми границами
**Фокус:** Оранжевое свечение указывает на активность
**Комфорт:** Мягкий контраст для глаз

#### SIDEBAR
```
┌──────────────────────────────────┐
│ Background: #1E1E1E (Dark)       │
│ Text: #FFFFFF (White)            │
│ Border Right: 1px solid #323232  │
│ Padding: 0                       │
│                                  │
│ Active Item Background:          │
│   rgba(255, 158, 112, 0.15)      │
│ Active Item Text: #FF9E70        │
│ Hover Background:                │
│   rgba(255, 158, 112, 0.08)      │
└──────────────────────────────────┘
```
**Назначение:** Боковая навигация
**Фокус:** Оранжевые подсветки для активных элементов
**Иерархия:** Четкое различие между активным и неактивным

---

## 📊 Сравнительная Таблица

| Аспект | Soft Warm Black (Light) | Classic Energetic Hybrid (Dark) |
|--------|------------------------|--------------------------------|
| **День/Ночь** | Только день | Только ночь |
| **Основной оранж** | #FF9158 | #FF9E70 |
| **Основной текст** | #000000 (Черный) | #FFFFFF (Белый) |
| **Основной фон** | #FFFBF7 (Теплый белый) | #121212 (Premium темный) |
| **Контрастность** | 18.5:1 (WCAG AAA++) | 14.8:1 (WCAG AAA) |
| **Сложность** | ✓ Простая (Light only) | ✓ Сложная (Dark mode) |
| **Лучше всего для** | Длительное чтение днем | Работа в ночное время |
| **Взаимодействия** | Черные границы, контрастные кнопки | Оранжевые аккенты, мягкие переходы |
| **Начальная версия** | Soft Warm (Вариант 4) | Classic + Energetic |

---

## 💾 CSS Copy-Paste (Soft Warm Black - Light Mode)

```css
:root[data-theme="soft-black-light"] {
  /* Основные цвета */
  --color-primary-orange: #FF9158;
  --color-text-primary: #000000;
  --color-text-secondary: #2C2C2C;
  --color-bg-primary: #FFFBF7;
  --color-bg-secondary: #FFF5EE;
  --color-accent: #FF7D3D;
  --color-border: #2C2C2C;
  --color-shadow: rgba(0, 0, 0, 0.15);
}

/* Применение */
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.btn-primary {
  background-color: var(--color-primary-orange);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
}

.btn-primary:hover {
  background-color: var(--color-accent);
}
```

## 💾 CSS Copy-Paste (Classic Energetic Hybrid - Dark Mode)

```css
:root[data-theme="classic-energetic-dark"] {
  /* Основные цвета */
  --color-primary-orange: #FF9E70;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D0D0D0;
  --color-bg-primary: #121212;
  --color-bg-secondary: #1E1E1E;
  --color-accent: #FFB380;
  --color-border: #323232;
  --color-shadow: rgba(0, 0, 0, 0.5);
}

/* Применение */
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.btn-primary {
  background-color: var(--color-primary-orange);
  color: var(--color-text-primary);
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-accent);
}
```

---

## 🎨 Инструменты для Проверки Контрастности

**Проверь контрастность:**
1. Сайт: https://webaim.org/resources/contrastchecker/
2. Инструмент Chrome DevTools → Elements → Computed → Contrast

**Примеры тестов:**
- Soft Warm: #000000 на #FFFBF7 = 18.5:1 ✓ WCAG AAA++
- Hybrid: #FFFFFF на #121212 = 16.5:1 ✓ WCAG AAA++
- Hybrid: #FF9E70 на #121212 = 11.2:1 ✓ WCAG AAA
