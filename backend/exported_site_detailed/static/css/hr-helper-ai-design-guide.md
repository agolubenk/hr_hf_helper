# 🎨 HR Helper Design System - ИИ ИНСТРУКЦИЯ

## 📋 ОБЗОР СИСТЕМЫ ТЕМ

HR Helper использует **двухтемную систему дизайна** с автоматическим переключением между светлой и тёмной темами:

### 🌞 СВЕТЛАЯ ТЕМА: "ЛАЙМ + ВОДА"
```css
:root {
    --primary: #2d7e2d;      /* Тёмный лайм (7.19:1 контраст) */
    --secondary: #0f4c75;    /* Глубокая вода (8.55:1 контраст) */
    --accent: #66bb6a;       /* Светлый лайм */
    --accent-water: #bbe1fa; /* Светлая вода */
}
```
**Визуальные характеристики:**
- 🟢 **Основной цвет**: Насыщенный зелёный лайм
- 🔵 **Вторичный цвет**: Глубокий синий воды
- ⚪ **Фон**: Чистый белый (#ffffff)
- 🌱 **Ощущение**: Свежесть, природа, чистота

### 🌙 ТЁМНАЯ ТЕМА: "ЛУНА + РОЗОВЫЙ"
```css
[data-theme="dark"] {
    --primary: #ff6b9d;      /* Светло-розовый (4.56:1 контраст) */
    --secondary: #f0f8ff;    /* Светлая луна (15.79:1 контраст) */
    --accent: #ffb3c6;       /* Акцентный розовый */
    --accent-water: #c7ebff; /* Акцентная луна */
}
```
**Визуальные характеристики:**
- 🌸 **Основной цвет**: Мягкий розовый
- 🌙 **Вторичный цвет**: Лунно-белый
- ⚫ **Фон**: Тёмный космический (#0d1117)
- ✨ **Ощущение**: Элегантность, современность, комфорт

## 🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ

### 1. **Accessibility First (Доступность)**
- ✅ Все цветовые сочетания соответствуют **WCAG AA** стандарту
- ✅ Минимальный контраст 4.5:1 для обычного текста
- ✅ Минимальный контраст 3:1 для крупного текста
- ✅ Поддержка `prefers-color-scheme` и `prefers-reduced-motion`

### 2. **Градиенты как основа дизайна**
```css
/* Светлая тема */
--gradient: linear-gradient(135deg, #2d7e2d 0%, #0f4c75 100%);

/* Тёмная тема */
--gradient: linear-gradient(135deg, #ff6b9d 0%, #f0f8ff 100%);
```

### 3. **Семантические цвета**
```css
--success: #2e7d32 / #3fb950;   /* светлая / тёмная */
--warning: #ef6c00 / #d29922;   
--danger: #d32f2f / #f85149;    
--info: secondary colors;
```

## 🏗️ АРХИТЕКТУРА ФАЙЛОВ

### Основные стилевые файлы:
1. **`hr-helper-main-themed.css`** - Основа всей системы
2. **`finance-app-hr-helper-themed.css`** - Финансовые компоненты
3. **`clickup-app-hr-helper-themed.css`** - ClickUp интеграция
4. **`vacancies-app-hr-helper-themed.css`** - Управление вакансиями
5. **`social-account-app-hr-helper-themed.css`** - OAuth и социальные аккаунты
6. **`google-oauth-g-data-themed.css`** - Google интеграции и автоматизация

### Порядок подключения:
```html
<!-- Основа -->
<link rel="stylesheet" href="hr-helper-main-themed.css">
<!-- Модули по потребности -->
<link rel="stylesheet" href="finance-app-hr-helper-themed.css">
<link rel="stylesheet" href="clickup-app-hr-helper-themed.css">
<!-- ... остальные по потребности -->
```

## 🎨 КОМПОНЕНТНАЯ СИСТЕМА

### Карточки (Cards)
```css
.card {
    border: 2px solid var(--border-light);
    border-radius: 15px;
    box-shadow: 0 4px 6px var(--shadow);
    background: var(--card-bg);
    transition: all 0.3s ease;
}
.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px var(--shadow-hover);
    border-color: var(--primary);
}
```

### Кнопки (Buttons)
```css
.btn-primary {
    background: var(--gradient);
    border: 2px solid var(--primary);
    color: white;
    transition: all 0.3s ease;
}
.btn-primary:hover {
    background: var(--gradient-hover);
    transform: translateY(-1px);
}
```

### Формы (Forms)
```css
.form-control {
    border: 2px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
}
.form-control:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem var(--focus-shadow);
}
```

## 🔄 СИСТЕМА ПЕРЕКЛЮЧЕНИЯ ТЕМ

### HTML атрибут:
```html
<html data-theme="light">  <!-- по умолчанию -->
<html data-theme="dark">   <!-- тёмная тема -->
```

### JavaScript переключение:
```javascript
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

## 🎯 СПЕЦИАЛИЗИРОВАННЫЕ КОМПОНЕНТЫ

### Sidebar Navigation
- **Градиентный фон** с полупрозрачными элементами
- **Hover эффекты** с `translateX(5px)`
- **Active состояния** с увеличенной непрозрачностью

### Chat Interface (Gemini)
- **User messages**: градиентный фон темы
- **Assistant messages**: фон карточки
- **Typing indicators**: muted цвета

### Financial Components
- **Salary ranges**: специальные карточки с акцентами
- **Currency tables**: hover эффекты на строках
- **Statistics**: gradient карточки с крупными числами

### Calendar Integration
- **Event items**: border-left акценты
- **Time slots**: цветовое кодирование
- **Copy buttons**: круглые кнопки с tooltip'ами

## 🎨 АНИМАЦИИ И ПЕРЕХОДЫ

### Стандартные transitions:
```css
transition: all 0.3s ease;
```

### Ключевые анимации:
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### Hover эффекты:
- **translateY(-5px)** для карточек
- **scale(1.1)** для кнопок
- **translateX(5px)** для sidebar элементов

## 📱 RESPONSIVE DESIGN

### Breakpoints:
```css
@media (max-width: 768px) {
    /* Мобильные стили */
}
```

### Адаптивные элементы:
- **Grid системы** с `auto-fit` и `minmax()`
- **Flexible typography** с относительными размерами
- **Touch-friendly** размеры (минимум 44px)

## ♿ ДОСТУПНОСТЬ

### Focus states:
```css
*:focus-visible {
    outline: 3px solid var(--focus-color);
    outline-offset: 2px;
}
```

### High contrast режим:
```css
@media (prefers-contrast: high) {
    .card { border-width: 3px; }
}
```

### Reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
    * { 
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🔧 ИНСТРУКЦИИ ДЛЯ ИИ

### При создании новых компонентов:
1. **ВСЕГДА** используйте CSS переменные темы
2. **НИКОГДА** не используйте hardcoded цвета
3. **ОБЯЗАТЕЛЬНО** добавляйте hover эффекты
4. **ВСЕГДА** проверяйте контрастность
5. **ВКЛЮЧАЙТЕ** поддержку обеих тем

### Пример правильного компонента:
```css
.new-component {
    background: var(--component-card-bg);
    color: var(--component-text);
    border: 2px solid var(--component-border-light);
    border-radius: 15px;
    transition: all 0.3s ease;
}
.new-component:hover {
    border-color: var(--component-primary);
    box-shadow: 0 4px 15px var(--component-shadow-hover);
    transform: translateY(-2px);
}
```

### Naming convention:
```css
--{app-name}-primary: цвет;
--{app-name}-secondary: цвет;
--{app-name}-card-bg: цвет;
--{app-name}-text: цвет;
--{app-name}-gradient: градиент;
```

## ✅ ЧЕКЛИСТ ДЛЯ ИИ

Перед созданием компонента убедитесь:
- [ ] Использованы переменные темы
- [ ] Добавлена поддержка тёмной темы
- [ ] Проверен контраст (минимум 4.5:1)
- [ ] Добавлены hover эффекты
- [ ] Включены transitions (0.3s ease)
- [ ] Протестирована адаптивность
- [ ] Добавлены focus states
- [ ] Поддержка reduced-motion

## 🎨 ЦВЕТОВЫЕ ПАЛИТРЫ

### Светлая тема: "ЛАЙМ + ВОДА"
- 🟢 Primary: `#2d7e2d` 
- 🔵 Secondary: `#0f4c75`
- 🌱 Accent: `#66bb6a`
- 💧 Water: `#bbe1fa`
- ⚪ Background: `#ffffff`

### Тёмная тема: "ЛУНА + РОЗОВЫЙ" 
- 🌸 Primary: `#ff6b9d`
- 🌙 Secondary: `#f0f8ff` 
- 💕 Accent: `#ffb3c6`
- ❄️ Luna: `#c7ebff`
- ⚫ Background: `#0d1117`

---

**Создано для HR Helper Design System v2.0**  
*Система тем "Лайм + Вода" | "Луна + Розовый"*