# Руководство по унификации UI компонентов в HRM Pro

**Проект:** HRM Pro (Vite + React + TypeScript + Bootstrap 5.3.8)  
**Дата создания:** 18 ноября 2025  
**Автор:** Для барана, который хочет порядка в коде

---

## 📋 Оглавление

1. [Анализ текущего состояния проекта](#1-анализ-текущего-состояния-проекта)
2. [Подготовка инфраструктуры](#2-подготовка-инфраструктуры)
3. [Создание страницы UI Cheatsheet](#3-создание-страницы-ui-cheatsheet)
4. [Извлечение компонентов из внешнего приложения](#4-извлечение-компонентов-из-внешнего-приложения)
5. [Создание библиотеки UI компонентов](#5-создание-библиотеки-ui-компонентов)
6. [Унификация стилей](#6-унификация-стилей)
7. [Миграция существующего кода](#7-миграция-существующего-кода)
8. [Автоматизация и проверки](#8-автоматизация-и-проверки)
9. [Документация компонентов](#9-документация-компонентов)
10. [Финальная проверка и оптимизация](#10-финальная-проверка-и-оптимизация)

---

## 1. Анализ текущего состояния проекта

### 1.1. Что у нас уже есть

#### Технологический стек:
```json
{
  "frontend": "React 19.2.0 + TypeScript",
  "bundler": "Vite (rolldown-vite 7.2.2)",
  "ui-framework": "Bootstrap 5.3.8",
  "icons": "Bootstrap Icons 1.13.1",
  "styling": "CSS + CSS Variables"
}
```

#### Структура проекта:
```
frontend/
├── src/
│   ├── App.tsx                 # Главный компонент
│   ├── App.css                 # Стили App (почти пустой)
│   ├── main.tsx                # Точка входа
│   ├── index.css               # Глобальные стили (9882 символа!)
│   └── components/
│       ├── Header.tsx          # Навигация с темой, поиском, профилем
│       └── Footer.tsx          # Футер (заглушка)
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

#### Существующие CSS переменные (из `index.css`):

**Цвета Bootstrap:**
```css
--bs-primary: #0d6efd;
--bs-secondary: #6c757d;
--bs-success: #198754;
--bs-danger: #dc3545;
--bs-warning: #ffc107;
--bs-info: #0dcaf0;
```

**Кастомные переменные:**
```css
--nav-height: 70px;
--footer-height: 60px;
--border-radius: 0.75rem;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--animation-duration: 0.3s;
```

**Темная тема:**
```css
[data-bs-theme="dark"] {
  --bs-body-color: #dee2e6;
  --bs-body-bg: #212529;
  /* ... */
}
```

### 1.2. Что нужно улучшить

- [ ] **Файл `index.css` слишком большой** (9882 символа) — нужно разбить на модули
- [ ] **Нет библиотеки переиспользуемых компонентов** — каждый раз пишем заново
- [ ] **Нет централизованной документации UI** — не видно, что уже есть
- [ ] **Смешаны глобальные стили и стили компонентов** — трудно поддерживать
- [ ] **Нет типизированных пропсов для UI компонентов** — TypeScript не используется на 100%

### 1.3. Проверка текущего состояния

#### Шаг 1.3.1: Запуск проекта

```bash
# Убедись, что находишься в папке frontend/
cd frontend

# Установи зависимости (если ещё не установлены)
npm install

# Запусти dev-сервер
npm run dev
```

**Ожидаемый результат:**
```
VITE v7.2.2  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Открой `http://localhost:5173/` — должна отображаться страница с хедером, футером и заглушкой контента.

#### Шаг 1.3.2: Инспекция существующих компонентов

**Header.tsx содержит:**
- Logo с градиентом
- Поиск с шорткатом ⌘K
- Кнопки быстрых действий (theme toggle, language selector, profile menu)
- Мобильный поиск
- Dropdown меню (profile, language)

**Footer.tsx:**
- Пока заглушка (будет tray с задачами/уведомлениями)

**Вывод:** Уже есть примеры кнопок, инпутов, dropdown — их можно использовать как базу.

---

## 2. Подготовка инфраструктуры

### 2.1. Создание структуры папок

#### Шаг 2.1.1: Создай новые папки

```bash
# Находясь в frontend/
mkdir -p src/pages
mkdir -p src/components/ui
mkdir -p src/styles/modules
mkdir -p src/utils
mkdir -p src/types
mkdir -p scripts
```

**Итоговая структура:**
```
src/
├── components/
│   ├── ui/              # ← Библиотека UI компонентов
│   ├── Header.tsx
│   └── Footer.tsx
├── pages/               # ← Страницы приложения
├── styles/
│   └── modules/         # ← Модульные CSS файлы
├── utils/               # ← Утилиты
├── types/               # ← TypeScript типы
└── App.tsx
```

### 2.2. Разделение глобальных стилей

Сейчас весь CSS (9882 символа) находится в `index.css`. Нужно разбить на модули.

#### Шаг 2.2.1: Создай файл переменных

**`src/styles/modules/variables.css`:**

```css
/* ============================================
   CSS ПЕРЕМЕННЫЕ - ЕДИНАЯ СИСТЕМА ДИЗАЙНА
   ============================================ */

:root {
  /* === Цвета Bootstrap === */
  --bs-primary: #0d6efd;
  --bs-primary-rgb: 13, 110, 253;
  --bs-secondary: #6c757d;
  --bs-secondary-rgb: 108, 117, 125;
  --bs-success: #198754;
  --bs-success-rgb: 25, 135, 84;
  --bs-info: #0dcaf0;
  --bs-info-rgb: 13, 202, 240;
  --bs-warning: #ffc107;
  --bs-warning-rgb: 255, 193, 7;
  --bs-danger: #dc3545;
  --bs-danger-rgb: 220, 53, 69;
  --bs-light: #f8f9fa;
  --bs-light-rgb: 248, 249, 250;
  --bs-dark: #212529;
  --bs-dark-rgb: 33, 37, 41;
  
  /* === Семантические цвета === */
  --bs-body-color: #212529;
  --bs-body-bg: #fff;
  --bs-body-bg-rgb: 255, 255, 255;
  --bs-secondary-color: #6c757d;
  --bs-secondary-bg: #f8f9fa;
  --bs-tertiary-bg: #f8f9fa;
  --bs-border-color: #dee2e6;
  --bs-border-color-translucent: rgba(0, 0, 0, 0.175);
  
  /* === Градиенты === */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  
  /* === Размеры и отступы === */
  --grid-spacing: 1rem;
  --grid-gap: 1.5rem;
  --card-padding: 1.5rem;
  --section-margin: 2rem;
  
  /* === Типографика === */
  --font-size-base: 1rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --line-height-base: 1.5;
  
  /* === Скругления === */
  --border-radius: 0.75rem;
  --bs-border-radius: 0.75rem;
  --border-radius-sm: 0.5rem;
  --border-radius-lg: 1rem;
  
  /* === Высоты компонентов === */
  --nav-height: 70px;
  --submenu-height: 50px;
  --footer-height: 60px;
  --quick-panel-width: 280px;
  
  /* === Анимации === */
  --animation-duration: 0.3s;
  --transition-duration: 0.2s;
  --animation-enabled: 1;
  --transition-enabled: 1;
}

/* === Темная тема === */
[data-bs-theme="dark"] {
  --bs-body-color: #dee2e6;
  --bs-body-bg: #212529;
  --bs-body-bg-rgb: 33, 37, 41;
  --bs-secondary-color: #adb5bd;
  --bs-secondary-bg: #343a40;
  --bs-tertiary-bg: #2b3035;
  --bs-border-color: #495057;
  --bs-border-color-translucent: rgba(255, 255, 255, 0.175);
}
```

#### Шаг 2.2.2: Создай файл базовых стилей

**`src/styles/modules/base.css`:**

```css
/* ============================================
   БАЗОВЫЕ СТИЛИ
   ============================================ */

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  overflow-x: hidden;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-top: var(--nav-height);
  padding-bottom: var(--footer-height);
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
}
```

#### Шаг 2.2.3: Создай файл для компонентов кнопок

**`src/styles/modules/buttons.css`:**

```css
/* ============================================
   КНОПКИ
   ============================================ */

/* Глобальные компактные стили для всех кнопок */
.btn {
  padding: 6px 16px;
  font-size: 0.95rem;
  min-height: 32px;
  border-radius: var(--border-radius);
  transition: all var(--transition-duration) ease;
}

.btn-sm, .btn.btn-sm {
  padding: 3px 10px;
  font-size: 0.85rem;
  min-height: 26px;
  border-radius: var(--border-radius-sm);
}

.btn-lg, .btn.btn-lg {
  padding: 10px 24px;
  font-size: 1.125rem;
  min-height: 42px;
  border-radius: var(--border-radius-lg);
}

/* Кнопки быстрых действий (из Header) */
.quick-action-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--border-radius);
  border: 2px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.quick-action-btn:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
  transform: translateY(-2px);
}
```

#### Шаг 2.2.4: Создай файл для навигации

**`src/styles/modules/navigation.css`:**

```css
/* ============================================
   НАВИГАЦИЯ
   ============================================ */

.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: var(--bs-body-bg);
  border-bottom: 1px solid var(--bs-border-color);
  z-index: 1030;
  backdrop-filter: blur(10px);
  background-color: rgba(var(--bs-body-bg-rgb, 255, 255, 255), 0.95);
}

.nav-container {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  gap: 1.5rem;
  position: relative;
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Остальные стили навигации... */
/* (скопируй из index.css секцию навигации) */
```

#### Шаг 2.2.5: Создай файл для футера

**`src/styles/modules/footer.css`:**

```css
/* ============================================
   ФУТЕР / TRAY
   ============================================ */

.tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bs-tertiary-bg);
  border-top: 1px solid var(--bs-border-color);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1020;
  gap: 0.5rem;
  min-height: var(--footer-height);
}

.tray-empty {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  z-index: 1020;
  background-color: var(--bs-tertiary-bg);
  border-top: 1px solid var(--bs-border-color);
  min-height: var(--footer-height);
}

/* Остальные стили tray... */
/* (скопируй из index.css секцию tray) */
```

#### Шаг 2.2.6: Создай файл для утилит

**`src/styles/modules/utilities.css`:**

```css
/* ============================================
   УТИЛИТЫ
   ============================================ */

/* Утилиты для скрытия/показа */
.d-none {
  display: none !important;
}

.d-md-block {
  display: none !important;
}

@media (min-width: 768px) {
  .d-md-block {
    display: block !important;
  }
  
  .d-md-none {
    display: none !important;
  }
}

@media (max-width: 767.98px) {
  .d-md-none {
    display: block !important;
  }
}
```

#### Шаг 2.2.7: Обновлённый `index.css`

Теперь `index.css` станет "импортером":

**`src/index.css`:**

```css
/* ============================================
   ГЛАВНЫЙ ФАЙЛ СТИЛЕЙ
   Импортирует все модули
   ============================================ */

/* Bootstrap (подключается через package.json) */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

/* Наши модули */
@import './styles/modules/variables.css';
@import './styles/modules/base.css';
@import './styles/modules/buttons.css';
@import './styles/modules/navigation.css';
@import './styles/modules/footer.css';
@import './styles/modules/utilities.css';
```

#### Шаг 2.2.8: Проверь, что всё работает

```bash
npm run dev
```

Открой `http://localhost:5173/` — если стили применились корректно, переходи дальше.

**Возможные проблемы:**

- **Ошибка импорта:** Проверь, что пути к файлам правильные
- **Стили не применились:** Проверь, что `index.css` импортируется в `main.tsx`
- **Дублирование стилей:** Убери повторяющиеся стили из старого `index.css`

---

## 3. Создание страницы UI Cheatsheet

Теперь создадим страницу-витрину всех UI компонентов (аналог Bootstrap Cheatsheet).

### 3.1. Создание страницы

#### Шаг 3.1.1: Создай файл страницы

**`src/pages/UICheatsheet.tsx`:**

```tsx
import React from 'react';
import './UICheatsheet.css';

const UICheatsheet: React.FC = () => {
  return (
    <div className="cheatsheet-page">
      {/* Header */}
      <header className="cheatsheet-header">
        <div className="container">
          <h1 className="display-4">UI Components Cheatsheet</h1>
          <p className="lead text-muted">
            Полный каталог UI компонентов HRM Pro
          </p>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="cheatsheet-sidebar">
        <nav className="sticky-top">
          <h6 className="sidebar-heading">Компоненты</h6>
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link" href="#buttons">Кнопки</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#forms">Формы</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#cards">Карточки</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#modals">Модальные окна</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#tables">Таблицы</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#alerts">Алерты</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#badges">Бейджи</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#spinners">Спиннеры</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="cheatsheet-main">
        <div className="container">
          
          {/* Секция: Кнопки */}
          <section id="buttons" className="component-section">
            <h2 className="section-title">
              <i className="bi bi-cursor-fill"></i> Кнопки
            </h2>
            
            <div className="component-group">
              <h3>Варианты цветов</h3>
              <div className="component-preview">
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-success">Success</button>
                <button className="btn btn-danger">Danger</button>
                <button className="btn btn-warning">Warning</button>
                <button className="btn btn-info">Info</button>
                <button className="btn btn-light">Light</button>
                <button className="btn btn-dark">Dark</button>
              </div>
            </div>

            <div className="component-group">
              <h3>Размеры</h3>
              <div className="component-preview">
                <button className="btn btn-primary btn-sm">Small</button>
                <button className="btn btn-primary">Medium</button>
                <button className="btn btn-primary btn-lg">Large</button>
              </div>
            </div>

            <div className="component-group">
              <h3>Outline варианты</h3>
              <div className="component-preview">
                <button className="btn btn-outline-primary">Primary</button>
                <button className="btn btn-outline-secondary">Secondary</button>
                <button className="btn btn-outline-success">Success</button>
                <button className="btn btn-outline-danger">Danger</button>
              </div>
            </div>

            <div className="component-group">
              <h3>Состояния</h3>
              <div className="component-preview">
                <button className="btn btn-primary">Normal</button>
                <button className="btn btn-primary" disabled>Disabled</button>
                <button className="btn btn-primary">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Loading
                </button>
              </div>
            </div>
          </section>

          {/* Секция: Формы */}
          <section id="forms" className="component-section">
            <h2 className="section-title">
              <i className="bi bi-input-cursor-text"></i> Формы
            </h2>
            
            <div className="component-group">
              <h3>Text Inputs</h3>
              <div className="component-preview">
                <div className="mb-3" style={{ maxWidth: '400px' }}>
                  <label htmlFor="input-text" className="form-label">Text Input</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="input-text" 
                    placeholder="Введите текст"
                  />
                </div>

                <div className="mb-3" style={{ maxWidth: '400px' }}>
                  <label htmlFor="input-email" className="form-label">Email Input</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="input-email" 
                    placeholder="name@example.com"
                  />
                </div>

                <div className="mb-3" style={{ maxWidth: '400px' }}>
                  <label htmlFor="input-password" className="form-label">Password Input</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="input-password" 
                    placeholder="Пароль"
                  />
                </div>
              </div>
            </div>

            <div className="component-group">
              <h3>Select & Textarea</h3>
              <div className="component-preview">
                <div className="mb-3" style={{ maxWidth: '400px' }}>
                  <label htmlFor="select" className="form-label">Select</label>
                  <select className="form-select" id="select">
                    <option>Выберите опцию</option>
                    <option value="1">Опция 1</option>
                    <option value="2">Опция 2</option>
                    <option value="3">Опция 3</option>
                  </select>
                </div>

                <div className="mb-3" style={{ maxWidth: '400px' }}>
                  <label htmlFor="textarea" className="form-label">Textarea</label>
                  <textarea 
                    className="form-control" 
                    id="textarea" 
                    rows={3}
                    placeholder="Введите текст..."
                  />
                </div>
              </div>
            </div>

            <div className="component-group">
              <h3>Checkboxes & Radios</h3>
              <div className="component-preview">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="check1"
                  />
                  <label className="form-check-label" htmlFor="check1">
                    Checkbox 1
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="check2"
                  />
                  <label className="form-check-label" htmlFor="check2">
                    Checkbox 2
                  </label>
                </div>

                <div className="form-check mt-3">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="radioGroup" 
                    id="radio1"
                  />
                  <label className="form-check-label" htmlFor="radio1">
                    Radio 1
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="radioGroup" 
                    id="radio2"
                  />
                  <label className="form-check-label" htmlFor="radio2">
                    Radio 2
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Секция: Карточки */}
          <section id="cards" className="component-section">
            <h2 className="section-title">
              <i className="bi bi-card-heading"></i> Карточки
            </h2>
            
            <div className="component-group">
              <h3>Базовые карточки</h3>
              <div className="component-preview">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Card Title</h5>
                        <p className="card-text">
                          Some quick example text to build on the card title.
                        </p>
                        <button className="btn btn-primary">Action</button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        Featured
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">Special Title</h5>
                        <p className="card-text">
                          With supporting text below.
                        </p>
                        <button className="btn btn-primary">Go somewhere</button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="bi bi-star-fill text-warning"></i> Icon Card
                        </h5>
                        <p className="card-text">
                          Card with icon in title.
                        </p>
                        <button className="btn btn-outline-primary">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Добавь остальные секции аналогично */}
          {/* Modals, Tables, Alerts, Badges, Spinners */}

        </div>
      </main>
    </div>
  );
};

export default UICheatsheet;
```

#### Шаг 3.1.2: Создай стили для Cheatsheet

**`src/pages/UICheatsheet.css`:**

```css
/* ============================================
   UI CHEATSHEET PAGE
   ============================================ */

.cheatsheet-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background-color: var(--bs-secondary-bg);
}

/* Header */
.cheatsheet-header {
  grid-column: 1 / -1;
  background: var(--primary-gradient);
  color: white;
  padding: 3rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cheatsheet-header h1 {
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.cheatsheet-header .lead {
  color: rgba(255, 255, 255, 0.9);
}

/* Sidebar */
.cheatsheet-sidebar {
  background-color: var(--bs-body-bg);
  border-right: 1px solid var(--bs-border-color);
  padding: 2rem 1rem;
  overflow-y: auto;
  max-height: calc(100vh - var(--nav-height));
  position: sticky;
  top: var(--nav-height);
}

.sidebar-heading {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bs-secondary-color);
  margin-bottom: 1rem;
  padding-left: 1rem;
}

.cheatsheet-sidebar .nav-link {
  padding: 0.5rem 1rem;
  color: var(--bs-body-color);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.cheatsheet-sidebar .nav-link:hover {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-primary);
}

/* Main Content */
.cheatsheet-main {
  padding: 2rem;
  overflow-y: auto;
}

/* Component Sections */
.component-section {
  background-color: var(--bs-body-bg);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--bs-border-color);
  color: var(--bs-body-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: var(--bs-primary);
}

/* Component Groups */
.component-group {
  margin-bottom: 2rem;
}

.component-group:last-child {
  margin-bottom: 0;
}

.component-group h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--bs-secondary-color);
}

.component-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: var(--bs-secondary-bg);
  border-radius: var(--border-radius);
  border: 1px solid var(--bs-border-color);
  align-items: flex-start;
}

/* Responsive */
@media (max-width: 992px) {
  .cheatsheet-page {
    grid-template-columns: 1fr;
  }
  
  .cheatsheet-sidebar {
    display: none;
  }
}
```

### 3.2. Добавление роутинга

#### Шаг 3.2.1: Установи React Router (если ещё не установлен)

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

#### Шаг 3.2.2: Обнови `App.tsx`

**`src/App.tsx`:**

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import UICheatsheet from './pages/UICheatsheet';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={
              <div className="container py-5">
                <h1>Добро пожаловать в HRM Pro!</h1>
                <p className="lead">Базовая структура готова. Здесь будет основной контент приложения.</p>
                <Link to="/ui-cheatsheet" className="btn btn-primary">
                  Открыть UI Cheatsheet
                </Link>
              </div>
            } />
            
            {/* Страница UI Cheatsheet */}
            <Route path="/ui-cheatsheet" element={<UICheatsheet />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

#### Шаг 3.2.3: Проверь работу

```bash
npm run dev
```

1. Открой `http://localhost:5173/`
2. Кликни на кнопку "Открыть UI Cheatsheet"
3. Должна открыться страница с каталогом компонентов

**Если всё работает — збс, идём дальше!**

---

## 4. Извлечение компонентов из внешнего приложения

Теперь задача: взять UI элементы из "левого" (внешнего) приложения и добавить их в Cheatsheet.

### 4.1. Инспекция внешнего приложения

#### Шаг 4.1.1: Открой внешнее приложение в браузере

Запусти их приложение или открой production URL.

#### Шаг 4.1.2: Открой DevTools

- **Chrome/Edge:** `F12` или `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox:** `F12`

#### Шаг 4.1.3: Найди интересующие компоненты

Используй инструмент **Element Inspector** (иконка курсора в DevTools).

**Что искать:**

1. **Кнопки** — все варианты (primary, secondary, success, danger, outline, sizes)
2. **Инпуты** — text, email, password, number, date, select, textarea, checkbox, radio
3. **Карточки** — разные варианты (с хедером, футером, изображением)
4. **Модальные окна** — диалоги, алерты
5. **Таблицы** — обычные, с сортировкой, пагинацией
6. **Алерты/тосты** — уведомления
7. **Бейджи** — статусы, счётчики
8. **Спиннеры** — загрузка
9. **Навигация** — меню, табы, breadcrumbs
10. **Формы** — validation, группировка

#### Шаг 4.1.4: Копируй HTML

Для каждого элемента:

1. Правой кнопкой на элементе → **Copy** → **Copy element**
2. Вставь в блокнот или в файл

**Пример копирования кнопки:**

```html
<!-- Скопировано из внешнего приложения -->
<button class="btn-custom btn-custom--primary" type="button">
  <svg class="icon" width="16" height="16">...</svg>
  <span>Сохранить</span>
</button>
```

#### Шаг 4.1.5: Копируй CSS

1. В DevTools выбери элемент
2. Правой кнопкой в панели **Styles** → **Copy all declarations**
3. Вставь в блокнот

**Пример скопированных стилей:**

```css
.btn-custom {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-custom--primary {
  background-color: #3b82f6;
  color: white;
}

.btn-custom--primary:hover {
  background-color: #2563eb;
}
```

### 4.2. Создание файла с внешними стилями

#### Шаг 4.2.1: Создай файл для внешних CSS

**`src/styles/external-app.css`:**

```css
/* ============================================
   СТИЛИ ИЗ ВНЕШНЕГО ПРИЛОЖЕНИЯ
   Источник: [URL или название приложения]
   Дата импорта: 18.11.2025
   ============================================ */

/* === КНОПКИ === */

.btn-custom {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-custom--primary {
  background-color: #3b82f6;
  color: white;
}

.btn-custom--primary:hover {
  background-color: #2563eb;
}

.btn-custom--secondary {
  background-color: #6b7280;
  color: white;
}

/* === ИНПУТЫ === */

.input-custom {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.input-custom:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* === КАРТОЧКИ === */

.card-custom {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-custom__header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}

.card-custom__body {
  padding: 1.5rem;
}

/* Добавляй сюда остальные скопированные стили */
```

#### Шаг 4.2.2: Импортируй в `index.css`

**`src/index.css`:**

```css
/* ... остальные импорты ... */
@import './styles/external-app.css';
```

### 4.3. Добавление компонентов в Cheatsheet

Теперь добавь скопированные компоненты в `UICheatsheet.tsx`.

#### Пример добавления секции "Внешние кнопки":

```tsx
<section id="external-buttons" className="component-section">
  <h2 className="section-title">
    <i className="bi bi-download"></i> Кнопки из внешнего приложения
  </h2>
  
  <div className="component-group">
    <h3>Custom Button Variants</h3>
    <div className="component-preview">
      <button className="btn-custom btn-custom--primary">
        Primary Button
      </button>
      <button className="btn-custom btn-custom--secondary">
        Secondary Button
      </button>
    </div>
  </div>
</section>
```

---

## 5. Создание библиотеки UI компонентов

Теперь создадим переиспользуемые React компоненты на основе собранных элементов.

### 5.1. Создание типов для компонентов

#### Шаг 5.1.1: Создай файл типов

**`src/types/ui.types.ts`:**

```typescript
/* ============================================
   ТИПЫ ДЛЯ UI КОМПОНЕНТОВ
   ============================================ */

// Размеры компонентов
export type ComponentSize = 'sm' | 'md' | 'lg';

// Варианты цветов
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark';

// Пропсы кнопки
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ColorVariant;
  size?: ComponentSize;
  outline?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Пропсы инпута
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

// Пропсы карточки
export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Добавляй остальные типы по мере создания компонентов
```

### 5.2. Создание компонента Button

#### Шаг 5.2.1: Создай компонент

**`src/components/ui/Button.tsx`:**

```tsx
import React from 'react';
import { ButtonProps } from '../../types/ui.types';
import './Button.css';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  outline = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
```

#### Шаг 5.2.2: Создай стили (если нужны дополнительные)

**`src/components/ui/Button.css`:**

```css
/* Дополнительные стили для кнопок (если нужны) */

.btn-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
}

.btn-icon svg {
  width: 1em;
  height: 1em;
}
```

#### Шаг 5.2.3: Создай index для экспорта

**`src/components/ui/index.ts`:**

```typescript
export { default as Button } from './Button';
// Здесь будут экспорты других компонентов
```

### 5.3. Создание компонента Input

**`src/components/ui/Input.tsx`:**

```tsx
import React from 'react';
import { InputProps } from '../../types/ui.types';
import './Input.css';

const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`form-control ${hasError ? 'is-invalid' : ''} ${icon ? 'with-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {helpText && !error && (
        <small className="form-text text-muted">{helpText}</small>
      )}
      
      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default Input;
```

**`src/components/ui/Input.css`:**

```css
.form-group {
  margin-bottom: 1rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bs-secondary-color);
  pointer-events: none;
}

.form-control.with-icon {
  padding-left: 2.5rem;
}
```

### 5.4. Создание компонента Card

**`src/components/ui/Card.tsx`:**

```tsx
import React from 'react';
import { CardProps } from '../../types/ui.types';
import './Card.css';

const Card: React.FC<CardProps> = ({
  header,
  footer,
  children,
  className = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {header && (
        <div className="card-header">{header}</div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">{footer}</div>
      )}
    </div>
  );
};

export default Card;
```

**`src/components/ui/Card.css`:**

```css
/* Дополнительные стили для карточек (если нужны) */

.card {
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### 5.5. Обновление экспорта компонентов

**`src/components/ui/index.ts`:**

```typescript
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
```

### 5.6. Добавление компонентов в Cheatsheet

Обнови `UICheatsheet.tsx`, чтобы показывать новые компоненты:

```tsx
import { Button, Input, Card } from '../components/ui';

// В секции "Наши компоненты":
<section id="custom-components" className="component-section">
  <h2 className="section-title">
    <i className="bi bi-box-seam"></i> Наши переиспользуемые компоненты
  </h2>
  
  <div className="component-group">
    <h3>Button Component</h3>
    <div className="component-preview">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary" size="sm">Small Secondary</Button>
      <Button variant="success" outline>Outline Success</Button>
      <Button variant="danger" loading>Loading...</Button>
    </div>
  </div>

  <div className="component-group">
    <h3>Input Component</h3>
    <div className="component-preview">
      <div style={{ maxWidth: '400px' }}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com"
          helpText="We'll never share your email."
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="Enter password"
          error="Password is required"
          required
        />
      </div>
    </div>
  </div>

  <div className="component-group">
    <h3>Card Component</h3>
    <div className="component-preview">
      <div style={{ maxWidth: '400px' }}>
        <Card 
          header="Card Header"
          footer={<Button variant="primary" size="sm">Action</Button>}
        >
          <h5>Card Title</h5>
          <p>Some quick example text to build on the card title.</p>
        </Card>
      </div>
    </div>
  </div>
</section>
```

---

## 6. Унификация стилей

### 6.1. Аудит CSS переменных

#### Шаг 6.1.1: Создай список всех используемых цветов

Открой DevTools на любой странице и в консоли выполни:

```javascript
// Найти все уникальные цвета в CSS
const styles = Array.from(document.styleSheets)
  .flatMap(sheet => {
    try {
      return Array.from(sheet.cssRules);
    } catch {
      return [];
    }
  })
  .map(rule => rule.cssText)
  .join(' ');

const colors = styles.match(/#[0-9a-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/gi);
const uniqueColors = [...new Set(colors)];
console.log(uniqueColors);
```

Запиши все найденные цвета.

#### Шаг 6.1.2: Сравни с CSS переменными

Проверь, все ли цвета есть в `variables.css`. Если нет — добавь.

### 6.2. Замена хардкодных значений на переменные

#### Шаг 6.2.1: Найди хардкодные цвета в коде

```bash
# В папке frontend/
grep -rn "#[0-9a-f]\{3,6\}" src/ --include="*.css" --include="*.tsx"
```

Для каждого найденного — замени на CSS переменную.

**Пример:**

```css
/* БЫЛО */
.my-element {
  background-color: #0d6efd;
  color: #ffffff;
}

/* СТАЛО */
.my-element {
  background-color: var(--bs-primary);
  color: var(--bs-body-bg);
}
```

### 6.3. Унификация отступов и размеров

#### Шаг 6.3.1: Создай spacing-систему

Добавь в `variables.css`:

```css
:root {
  /* Spacing Scale (8px базовая единица) */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

#### Шаг 6.3.2: Замени магические числа

```css
/* БЫЛО */
.my-element {
  padding: 15px 20px;
  margin-bottom: 25px;
}

/* СТАЛО */
.my-element {
  padding: var(--space-3) var(--space-5);
  margin-bottom: var(--space-6);
}
```

---

## 7. Миграция существующего кода

### 7.1. План миграции

1. **Найти все места использования старых элементов** (кнопки, инпуты, карточки)
2. **Заменить на новые компоненты** постепенно (по 5-10 файлов в день)
3. **Удалить старые CSS файлы** после миграции

### 7.2. Миграция компонента Header

#### Шаг 7.2.1: Найди кнопки в Header.tsx

Открой `src/components/Header.tsx` и найди все кнопки.

**Пример миграции:**

```tsx
// БЫЛО
<button 
  className="quick-action-btn" 
  onClick={toggleTheme}
>
  <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun'}-fill`}></i>
</button>

// СТАЛО (используем наш Button компонент)
import { Button } from './ui';

<Button 
  variant="secondary"
  outline
  className="quick-action-btn"
  onClick={toggleTheme}
  aria-label="Toggle theme"
>
  <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun'}-fill`}></i>
</Button>
```

**Примечание:** Возможно, для специфичных кнопок (как `quick-action-btn`) лучше оставить нативный `<button>`, но использовать унифицированные CSS переменные.

### 7.3. Создание скрипта для поиска миграций

#### Шаг 7.3.1: Создай скрипт

**`scripts/find-old-components.js`:**

```javascript
const fs = require('fs');
const path = require('path');

const findOldComponents = (dir) => {
  const findings = {
    buttons: [],
    inputs: [],
    cards: []
  };

  const walk = (currentPath) => {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walk(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Ищем старые кнопки (без импорта Button)
        if (content.includes('<button') && !content.includes("import { Button }") && !content.includes("import Button")) {
          findings.buttons.push(filePath);
        }

        // Ищем старые инпуты
        if (content.includes('<input') && !content.includes("import { Input }") && !content.includes("import Input")) {
          findings.inputs.push(filePath);
        }

        // Ищем старые карточки
        if (content.includes('className="card"') && !content.includes("import { Card }") && !content.includes("import Card")) {
          findings.cards.push(filePath);
        }
      }
    });
  };

  walk(dir);
  return findings;
};

console.log('🔍 Поиск компонентов для миграции...\n');

const findings = findOldComponents('./src');

console.log('📌 Кнопки для миграции:');
findings.buttons.forEach(file => console.log(`  - ${file}`));

console.log('\n📌 Инпуты для миграции:');
findings.inputs.forEach(file => console.log(`  - ${file}`));

console.log('\n📌 Карточки для миграции:');
findings.cards.forEach(file => console.log(`  - ${file}`));

console.log(`\n✅ Найдено: ${findings.buttons.length} кнопок, ${findings.inputs.length} инпутов, ${findings.cards.length} карточек`);
```

#### Шаг 7.3.2: Добавь скрипт в package.json

```json
{
  "scripts": {
    "find-old-components": "node scripts/find-old-components.js"
  }
}
```

#### Шаг 7.3.3: Запусти

```bash
npm run find-old-components
```

**Результат:** Список файлов, которые нужно мигрировать.

---

## 8. Автоматизация и проверки

### 8.1. ESLint правила для унификации

#### Шаг 8.1.1: Создай кастомное правило

**`eslint.config.js` (добавь правила):**

```javascript
export default [
  // ... существующие правила ...
  {
    rules: {
      // Запретить использование <button> без импорта Button
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXElement[openingElement.name.name="button"]',
          message: 'Используй компонент <Button> из ./components/ui вместо <button>'
        }
      ]
    }
  }
];
```

**Примечание:** Это базовый пример. Для более сложных правил потребуется кастомный ESLint плагин.

### 8.2. Pre-commit хук для проверки

#### Шаг 8.2.1: Установи Husky

```bash
npm install --save-dev husky lint-staged
```

#### Шаг 8.2.2: Инициализируй Husky

```bash
npx husky init
```

#### Шаг 8.2.3: Создай pre-commit хук

**`.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

#### Шаг 8.2.4: Настрой lint-staged

**`package.json` (добавь):**

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.css": [
      "prettier --write"
    ]
  }
}
```

### 8.3. CI/CD проверка

Если используешь GitHub Actions / GitLab CI:

**`.github/workflows/check-ui.yml`:**

```yaml
name: UI Components Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run find-old-components
```

---

## 9. Документация компонентов

### 9.1. Создание Storybook-подобной документации

#### Шаг 9.1.1: Создай компонент CodeBlock

**`src/components/ui/CodeBlock.tsx`:**

```tsx
import React, { useState } from 'react';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'tsx' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-language">{language}</span>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <i className="bi bi-check2"></i> Скопировано!
            </>
          ) : (
            <>
              <i className="bi bi-clipboard"></i> Копировать
            </>
          )}
        </button>
      </div>
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
```

**`src/components/ui/CodeBlock.css`:**

```css
.code-block {
  background-color: var(--bs-secondary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  margin: 1rem 0;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
}

.code-language {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
}

.code-block-content {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-block-content code {
  color: var(--bs-body-color);
}
```

#### Шаг 9.1.2: Обнови Cheatsheet с примерами кода

```tsx
import CodeBlock from '../components/ui/CodeBlock';

<div className="component-group">
  <h3>Button Component</h3>
  <div className="component-preview">
    <Button variant="primary">Primary Button</Button>
  </div>
  
  <CodeBlock 
    code={`import { Button } from './components/ui';

<Button variant="primary">Primary Button</Button>`}
    language="tsx"
  />
</div>
```

### 9.2. Создание README для компонентов

**`src/components/ui/README.md`:**

```markdown
# UI Components Library

Библиотека переиспользуемых UI компонентов для HRM Pro.

## Компоненты

### Button

Универсальная кнопка с поддержкой различных вариантов, размеров и состояний.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ColorVariant` | `'primary'` | Цветовой вариант кнопки |
| `size` | `ComponentSize` | `'md'` | Размер кнопки |
| `outline` | `boolean` | `false` | Использовать outline стиль |
| `loading` | `boolean` | `false` | Показать индикатор загрузки |
| `icon` | `ReactNode` | - | Иконка перед текстом |
| `disabled` | `boolean` | `false` | Отключить кнопку |

#### Примеры использования

\`\`\`tsx
import { Button } from './components/ui';

// Базовое использование
<Button variant="primary">Сохранить</Button>

// С иконкой
<Button variant="success" icon={<i className="bi bi-check" />}>
  Готово
</Button>

// Состояние загрузки
<Button variant="primary" loading>
  Загрузка...
</Button>

// Outline вариант
<Button variant="danger" outline>
  Удалить
</Button>
\`\`\`

---

### Input

Универсальный инпут с поддержкой лейбла, ошибок и подсказок.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Текст лейбла |
| `error` | `string` | - | Текст ошибки |
| `helpText` | `string` | - | Текст подсказки |
| `icon` | `ReactNode` | - | Иконка внутри инпута |
| `required` | `boolean` | `false` | Обязательное поле |

#### Примеры использования

\`\`\`tsx
import { Input } from './components/ui';

// Базовое использование
<Input 
  label="Email" 
  type="email" 
  placeholder="name@example.com"
/>

// С ошибкой
<Input 
  label="Password" 
  type="password" 
  error="Пароль должен содержать минимум 8 символов"
  required
/>

// С подсказкой
<Input 
  label="Username" 
  type="text" 
  helpText="Только латинские буквы и цифры"
/>
\`\`\`

---

### Card

Универсальная карточка с опциональными header и footer.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | - | Контент для header |
| `footer` | `ReactNode` | - | Контент для footer |
| `children` | `ReactNode` | - | Основной контент |
| `className` | `string` | `''` | Дополнительные CSS классы |

#### Примеры использования

\`\`\`tsx
import { Card } from './components/ui';

// Базовое использование
<Card>
  <h5>Заголовок карточки</h5>
  <p>Текст карточки</p>
</Card>

// С header и footer
<Card 
  header="Header"
  footer={<Button variant="primary">Action</Button>}
>
  <p>Контент карточки</p>
</Card>
\`\`\`

---

## Добавление новых компонентов

1. Создай файл компонента в `src/components/ui/`
2. Создай типы в `src/types/ui.types.ts`
3. Экспортируй в `src/components/ui/index.ts`
4. Добавь примеры в `UICheatsheet.tsx`
5. Обнови эту документацию

## Правила разработки

- ✅ Используй TypeScript для всех компонентов
- ✅ Используй CSS переменные из `variables.css`
- ✅ Добавляй aria-атрибуты для доступности
- ✅ Документируй все props
- ✅ Добавляй примеры использования
- ❌ Не используй хардкодные цвета
- ❌ Не используй inline-стили (только через CSS классы)
```

---

## 10. Финальная проверка и оптимизация

### 10.1. Чек-лист финальной проверки

#### Шаг 10.1.1: Проверь все страницы

- [ ] Главная страница загружается без ошибок
- [ ] UI Cheatsheet отображает все компоненты
- [ ] Header работает корректно (theme toggle, search, profile)
- [ ] Footer отображается правильно
- [ ] Все стили применяются (light/dark mode)
- [ ] Нет console ошибок

#### Шаг 10.1.2: Проверь производительность

```bash
npm run build
npm run preview
```

Открой DevTools → Lighthouse → Run audit

**Проверь:**
- Performance > 90
- Accessibility > 90
- Best Practices > 90

#### Шаг 10.1.3: Проверь типы

```bash
npm run build
```

Не должно быть TypeScript ошибок.

#### Шаг 10.1.4: Проверь линтер

```bash
npm run lint
```

Исправь все warnings и errors.

### 10.2. Оптимизация бандла

#### Шаг 10.2.1: Анализ размера

Установи плагин:

```bash
npm install --save-dev rollup-plugin-visualizer
```

**`vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
});
```

Запусти:

```bash
npm run build
```

Откроется страница с визуализацией бандла.

#### Шаг 10.2.2: Lazy loading для страниц

**`src/App.tsx`:**

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy loading для тяжёлых страниц
const UICheatsheet = lazy(() => import('./pages/UICheatsheet'));

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Suspense fallback={<div>Загрузка...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ui-cheatsheet" element={<UICheatsheet />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

### 10.3. Создание финального документа

#### Шаг 10.3.1: Создай MIGRATION.md

**`docs/MIGRATION.md`:**

```markdown
# Migration Guide

## Статус миграции

**Текущий прогресс:** XX% завершено

### ✅ Завершено

- [x] Создание UI Cheatsheet
- [x] Разделение CSS на модули
- [x] Создание библиотеки компонентов (Button, Input, Card)
- [x] Документация компонентов

### 🚧 В процессе

- [ ] Миграция Header.tsx
- [ ] Миграция Footer.tsx
- [ ] Создание остальных компонентов (Modal, Table, Alert, Badge, Spinner)

### 📋 Запланировано

- [ ] Миграция всех страниц
- [ ] Удаление старых CSS файлов
- [ ] Финальный рефакторинг

## Как мигрировать компонент

1. Открой файл компонента
2. Найди все `<button>`, `<input>`, `<div className="card">` и т.д.
3. Замени на `<Button>`, `<Input>`, `<Card>` из `./components/ui`
4. Проверь, что компонент работает
5. Удали неиспользуемые CSS файлы
6. Commit

## Помощь

Если застрял — пиши в чат или смотри примеры в `UICheatsheet.tsx`.
```

---

## 📝 Финальный чек-лист

Распечатай и повесь на стену:

### Инфраструктура
- [ ] Создана папка `src/components/ui/`
- [ ] Создана папка `src/styles/modules/`
- [ ] Создана папка `src/pages/`
- [ ] Создана папка `src/types/`
- [ ] Создана папка `scripts/`

### Стили
- [ ] Разделён `index.css` на модули
- [ ] Создан `variables.css` с CSS переменными
- [ ] Создан `base.css` с базовыми стилями
- [ ] Создан `buttons.css`, `navigation.css`, `footer.css`, `utilities.css`
- [ ] Создан `external-app.css` для стилей из внешнего приложения

### UI Cheatsheet
- [ ] Создана страница `UICheatsheet.tsx`
- [ ] Добавлен роутинг для `/ui-cheatsheet`
- [ ] Добавлены секции: Buttons, Forms, Cards, Modals, Tables, Alerts, Badges, Spinners
- [ ] Добавлена sidebar навигация
- [ ] Добавлен компонент `CodeBlock` для показа примеров

### Компоненты
- [ ] Создан `Button.tsx` с типами и стилями
- [ ] Создан `Input.tsx` с типами и стилями
- [ ] Создан `Card.tsx` с типами и стилями
- [ ] Создан файл экспорта `ui/index.ts`
- [ ] Добавлены типы в `ui.types.ts`

### Документация
- [ ] Создан `README.md` для компонентов
- [ ] Создан `MIGRATION.md` с планом миграции
- [ ] Обновлён главный `README.md` проекта

### Автоматизация
- [ ] Создан скрипт `find-old-components.js`
- [ ] Настроен ESLint для проверки компонентов
- [ ] Настроен Husky + lint-staged (опционально)

### Миграция
- [ ] Найдены все файлы для миграции
- [ ] Мигрировано 10% файлов
- [ ] Мигрировано 50% файлов
- [ ] Мигрировано 100% файлов
- [ ] Удалены старые CSS файлы

### Финал
- [ ] Запущен `npm run build` без ошибок
- [ ] Lighthouse audit > 90 по всем метрикам
- [ ] Нет TypeScript ошибок
- [ ] Нет ESLint warnings
- [ ] Документация актуальна
- [ ] Выпито пиво 🍺

---

## 🎯 Полезные команды

```bash
# Разработка
npm run dev                    # Запуск dev-сервера

# Проверки
npm run lint                   # ESLint проверка
npm run find-old-components    # Поиск компонентов для миграции
npm run build                  # Проверка сборки

# Продакшн
npm run build                  # Сборка для продакшна
npm run preview                # Предпросмотр собранной версии
```

---

## 🐑 Финальные советы для барана

1. **Не торопись** — делай по 5-10 компонентов в день
2. **Тестируй каждое изменение** — запускай `npm run dev` после каждого шага
3. **Коммить часто** — после каждой завершённой секции делай commit
4. **Используй UI Cheatsheet** — это твоя библиотека компонентов
5. **Не удаляй старые файлы сразу** — удаляй только после 100% миграции
6. **Проси помощи** — если застрял, пиши в чат

---

## 📚 Ресурсы

- [Bootstrap 5.3 Docs](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite Docs](https://vitejs.dev/)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Удачи, баран! 🐑 Ты справишься!**