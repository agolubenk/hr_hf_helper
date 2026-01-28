# HRM Frontend: Интегрированная система управления кандидатами, чатом и вакансиями

Одностраничный интерфейс с двухколоночной раскладкой: слева колонка с табированным контентом (кандидаты/чат/вакансии), справа — карточка кандидата с полной историей, всё без переходов на другие экраны.

---

## 1. Общая архитектура

### 1.1 Макет страницы

```
┌────────────────────────────────────────────────────────────┐
│                    Header / Topbar                         │
│  Logo  [Global Search] [Filters] [Current Vacancy/Pool]   │
│                                                            │
├─────────────────────────────────┬────────────────────────┤
│                                 │                        │
│   LEFT COLUMN                   │  RIGHT COLUMN          │
│   (Tabbed Content)              │  (Candidate Details)   │
│                                 │                        │
│  ┌──Candidates────┐             │  ┌──────────────────┐  │
│  │ [Search/Filter]│             │  │ John Doe         │  │
│  │ [Candidate List]│             │  │ Senior Dev       │  │
│  │                │             │  │                  │  │
│  ├──Chat──────────┤             │  │ Status: [▼]      │  │
│  │ [Search/Filter]│             │  │                  │  │
│  │ [Messages List]│             │  │ ┌──Info─────────┐│  │
│  │                │             │  │ │ ...           ││  │
│  ├──Vacancies─────┤             │  │ ├──History─────┐││  │
│  │ [Search/Filter]│             │  │ │ ...           ││  │
│  │ [Vacancies]    │             │  │ ├──Activity────┐││  │
│  │                │             │  │ │ ...           ││  │
│  └────────────────┘             │  │ └──────────────┘│  │
│                                 │  └──────────────────┘  │
│                                 │                        │
└─────────────────────────────────┴────────────────────────┘
```

**Колонка слева (Left Column)**
- Ширина: 380–420px (адаптивная)
- Состояние: 3 таба (Candidates / Chat / Vacancies)
- Каждый таб имеет собственный заголовок (вместо отдельной tab-bar)
- Содержимое каждого таба в этой же колонке

**Колонка справа (Right Column)**
- Ширина: 340–380px (адаптивная)
- Всегда показывает детали выбранного кандидата
- Внутри: 4 под-таба (Info / History / Activity / Documents)
- Скролл внутри панели для истории

**Топбар**
- Фиксированная высота 60px
- Логотип, глобальный поиск, фильтры, текущий контекст (вакансия/пул)

---

## 2. Левая колонка: табированный контент

### 2.1 Структура табов

Каждый таб представлен заголовком **внутри левой колонки**. При клике на заголовок содержимое меняется.

```
╔════════════════════════════════╗
║  Candidates (42)  👥           ║  ← Заголовок таба (кликабельный)
╠════════════════════════════════╣
║                                ║
║  [Search box]                  ║
║  [Filters toggle]              ║
║                                ║
║  ┌────────────────────────────┐║
║  │ Avatar | John Doe          ││
║  │        | Senior Dev        ││
║  │        | Interview  ✓✓     ││
║  │        | 2 days ago        ││
║  └────────────────────────────┘║
║                                ║
║  ┌────────────────────────────┐║
║  │ Avatar | Jane Smith        ││
║  │        | Product Manager   ││
║  │        | New               ││
║  │        | 5 hours ago       ││
║  └────────────────────────────┘║
║                                ║
║  ┌────────────────────────────┐║
║  │ Avatar | Mike Chen         ││
║  │        | Designer          ││
║  │        | Rejected          ││
║  │        | 1 day ago         ││
║  └────────────────────────────┘║
║                                ║
║  [Load more...]                ║
╚════════════════════════════════╝
```

Над содержимым — **горизонтальные кнопки** или **компактный сегмент** для переключения табов:

```
┌────────────────────────────────────┐
│ [● Candidates] [○ Chat] [○ Vacancies] │  ← Сегмент-переключатель (опция 1)
└────────────────────────────────────┘
```

Или более минималистично (подчеркивание):

```
┌────────────────────────────────────┐
│ Candidates    Chat    Vacancies     │  ← Текстовые кнопки с underline
│ ────────────                         │
└────────────────────────────────────┘
```

### 2.2 Таб "Candidates"

#### Заголовок + счётчик
```
Candidates (42)
```
Кликабельный заголовок, рядом иконка (👥 или 📋) для визуальной идентификации.

#### Поле поиска
```
[🔍 Search candidates...] [×]
```
- Поиск по имени, email, номеру телефона
- Real-time фильтрация
- Кнопка очистки (×)

#### Фильтры (collapsible)
```
[▼ Filters]
├─ Status:     [All ▼]      (New, Interview, Offer, Rejected, etc.)
├─ Vacancy:    [All ▼]      (Frontend, Backend, Design, etc.)
├─ Source:     [All ▼]      (LinkedIn, Referral, Direct, Job Board)
├─ Date:       [All ▼]      (Last 7 days, Last 30 days, etc.)
├─ Rating:     [☆ ▼]       (Any, 4+, 5)
└─ [Clear all]
```

#### Список кандидатов
Компактный список-карточек:

```
┌────────────────────────────────────┐
│ [👤] John Doe                      │
│      Senior Developer              │
│      🏷 Interview  · 2 days ago    │
│      📨 2 unread                   │
└────────────────────────────────────┘
```

**Item структура:**
- **Аватар** (инициалы или фото, 40px)
- **Имя** (bold, 14px)
- **Должность** (серый текст, 12px)
- **Статус** (цветной badge: `#2180A0` для Interview, `#22C55E` для Offer, `#EF4444` для Rejected)
- **Время** (серый текст, 11px)
- **Unread badge** (красный кружок с числом, если есть новые сообщения)

**Hover стиль:**
- Подложка: `background: rgba(33, 128, 160, 0.08)`
- Тень: `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- Быстрые иконки (на hover): ✏️ (редакт), 💬 (чат), ↗️ (открыть вакансию)

**Selection:**
- Выбранный кандидат: более яркая подложка + слева цветная полоса (`border-left: 3px solid #2180A0`)

#### Pagination
```
[← Prev] [1 2 3 ... 10] [Next →]
или
[Load 20 more...]
```

---

### 2.3 Таб "Chat" (Единый чат)

#### Заголовок
```
Messages (5 unread)
```

#### Поле поиска + фильтры
```
[🔍 Search conversations...] [×]

[▼ Filter]
├─ Unread only
├─ Awaiting response (1)
├─ Favourites
└─ By vacancy
```

#### Список диалогов
Каждый диалог = one conversation:

```
┌────────────────────────────────────┐
│ [👤] John Doe                      │
│      "Sure, let me check..."       │
│      Today 3:45 PM  [3 unread]     │
│      📧 Email  ⭐ (favourite)      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ [👤] Jane Smith                    │
│      "Thanks for the update!"      │
│      Today 1:20 PM                 │
│      💬 Telegram                    │
└────────────────────────────────────┘
```

**Item структура:**
- **Аватар** (40px)
- **Имя кандидата** (bold)
- **Preview последнего сообщения** (серый, truncated, 1 строка, 12px)
- **Timestamp** (серый, 11px)
- **Unread badge** (красный, только если есть непрочитанные)
- **Иконка канала** (📧, 💬, 📱)
- **Иконка favourite** (⭐, опционально)

**Hover:**
- Подложка highlight
- Иконки контекстного меню (pin, mute, delete)

---

### 2.4 Таб "Vacancies" (Вакансии)

#### Заголовок
```
Vacancies (8 open)
```

#### Поиск + фильтры
```
[🔍 Search vacancies...] [×]

[▼ Filter]
├─ Status:      [All ▼]  (Open, Paused, Closed)
├─ Department:  [All ▼]  (Engineering, Design, HR)
├─ Priority:    [All ▼]  (High, Medium, Low)
└─ Candidates:  [0+ ▼]
```

#### Список вакансий
```
┌────────────────────────────────────┐
│ 🎯 Frontend Senior                 │
│    Engineering · Priority: High    │
│                                    │
│    📊 Pipeline:                    │
│    New: 5  Interview: 3  Offer: 1  │
│    👤 Recruiter: Alice             │
│    📅 Deadline: Jan 30             │
│    Status: [Open ▼]                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🎨 Product Designer                │
│    Design · Priority: Medium       │
│    Status: [Paused ▼]              │
└────────────────────────────────────┘
```

**Item структура:**
- **Название вакансии** (bold, 14px)
- **Департамент / клиент** (серый, 12px)
- **Приоритет** (цветной чип)
- **Pipeline счётчик** (мини-барчик: New · Interview · Offer)
- **Ответственный рекрутер** (аватар + имя, 12px)
- **Дедлайн** (если есть)
- **Статус** (dropdown: Open / Paused / Closed)

**Клик по вакансии:**
- Фокусирует вакансию в контексте правой панели (если открыт кандидат из этой вакансии)
- В центральной части (когда левая колонка сужена или в modal) показывает карточку вакансии и список кандидатов по ней

---

## 3. Средняя зона (опционально, при полном экране)

При достаточной ширине экрана (> 1400px) может быть **третья колонка** между левой и правой:

```
LEFT (Tabs)  |  CENTER (Optional)  |  RIGHT (Details)
```

Но дефолт: **две колонки** (LEFT + RIGHT), CENTER скрыт.

Если нужна центральная колонка для дополнительного контента:
- Карточка/канбан кандидатов по выбранной вакансии
- Полная история сообщений в широком формате
- Детали вакансии перед выбором кандидата

---

## 4. Правая колонка: детали кандидата

### 4.1 Header правой панели

```
╔═══════════════════════════════════╗
║ [←] John Doe              [⋯] [×] ║  ← Верхняя строка
║     Senior Developer              ║
║     john@example.com              ║
║                                   ║
║ Status: [Interview ▼]             ║  ← Статус и вакансии
║ Rating:  ⭐⭐⭐⭐ (4/5)            ║
║                                   ║
║ 🎯 Frontend Senior · Interview    ║  ← Текущая вакансия (чип)
║ 🎯 Backend Mid · New              ║  ← Другая вакансия (если есть)
║                                   ║
║ [+ Add to vacancy]                ║  ← Кнопка добавления
╠═══════════════════════════════════╣
║                                   ║
║  Содержимое табов (скролл)        ║
║                                   ║
╚═══════════════════════════════════╝
```

**Header структура:**

1. **Верхняя строка:**
   - Back button ([←]) — закрыть/вернуться
   - Имя и должность
   - Menu button ([⋯]) — Actions (Edit, Archive, Delete, Export, etc.)
   - Close button ([×]) — минимизировать/закрыть панель

2. **Контакты:**
   - Email (кликабельный, копируемый)
   - Phone (кликабельный для вызова)
   - LinkedIn / Portfolio ссылки

3. **Статус и вакансии:**
   - **Статус** — большой цветной чип с dropdown (New → Interview → Offer → Accepted / Rejected)
   - **Rating** — звёзды (кликабельно редактируемые)
   - **Текущие вакансии** — чипы `[Вакансия · Этап]` с иконкой 🎯 или 📋
   - Клик на вакансию-чип:
     - Подсвечивает эту вакансию в левой колонке (если открыт таб Vacancies)
     - В контексте правой панели показывает статус именно по этой вакансии
     - Может открыть modal с деталями связки кандидат↔вакансия

4. **Кнопка "+ Add to vacancy"** — открывает modal для добавления кандидата на другую вакансию

### 4.2 Табы внутри правой панели

Под header — **4 таба** (Info / History / Activity / Documents):

```
┌─────────────────────────────────────┐
│ Info    History    Activity    Docs  │  ← Tab bar внутри панели
├─────────────────────────────────────┤
│                                     │
│  Содержимое активного таба          │
│  (скролл вниз)                      │
│                                     │
└─────────────────────────────────────┘
```

#### Tab 1: Info (Информация о кандидате)

```
Personal Information
┌─────────────────────────────────┐
│ Email:      john@example.com    │
│             [Copy] [Email]      │
│                                 │
│ Phone:      +1 (555) 123-4567   │
│             [Copy] [Call]       │
│                                 │
│ Location:   New York, USA       │
│ LinkedIn:   /in/johndoe         │
│ Portfolio:  johndoe.dev         │
└─────────────────────────────────┘

Application Details
┌─────────────────────────────────┐
│ Position:       Senior Developer│
│ Applied:        Jan 15, 2026    │
│ Source:         LinkedIn        │
│ Referrer:       — (none)        │
│ Recruiter:      Alice Smith     │
│ Next Review:    Jan 25, 2026    │
└─────────────────────────────────┘

Compensation & Expectations
┌─────────────────────────────────┐
│ Expected Salary:  $120K–$150K   │
│ Notice Period:    2 weeks       │
│ Relocation:       Yes           │
│ Remote:           Preferred     │
└─────────────────────────────────┘

Custom Fields
┌─────────────────────────────────┐
│ Experience Level:  7+ years     │
│ Tech Stack:        React, Node  │
│ Visa Status:       Work Auth    │
└─────────────────────────────────┘
```

**Функциональность:**
- Все поля редактируемы (inline edit по клику или по иконке ✏️)
- Кнопки действий: Copy, Call, Email, Open link
- Add custom field
- Inline validation

#### Tab 2: History (История взаимодействия)

Timeline всех событий в хронологическом порядке (новые первыми):

```
📌 Jan 20, 2026 · 8:45 PM
You moved John to "Interview"
─────────────────────────────

💬 Jan 20, 2026 · 5:30 PM
Message from John:
"Thanks for the update! Looking forward to the interview."
[Reply] [Forward]
─────────────────────────────

📅 Jan 20, 2026 · 2:00 PM
Interview scheduled for Jan 25 at 3:00 PM
Location: Video call (Zoom)
Interviewer: Bob Johnson
[Edit] [Cancel] [Add reminder]
─────────────────────────────

📄 Jan 19, 2026 · 10:15 AM
CV downloaded (john_doe_cv.pdf)
by Alice Smith
─────────────────────────────

⭐ Jan 15, 2026 · 6:30 PM
Rating updated: 4 → 5 stars
─────────────────────────────

✉️ Jan 15, 2026 · 4:45 PM
Email sent: "Thank you for applying"
[Resend] [View template]
─────────────────────────────

📝 Jan 15, 2026 · 4:22 PM
John applied for "Frontend Senior"
Source: LinkedIn
─────────────────────────────
```

**Event типы:**
- 📌 Status changes
- 💬 Messages
- 📅 Interviews / Meetings scheduled
- 📄 Documents (uploaded/downloaded)
- ⭐ Rating changes
- ✉️ Emails sent/received
- 📝 Application events
- 🏷️ Tags/Labels added
- 👤 Assignments
- 💾 Custom events

**Функционал:**
- Кликабельные события (раскрытие деталей)
- Edit/Delete actions (для своих записей)
- Filters по типам событий
- Export timeline

#### Tab 3: Activity (Активность и заметки)

```
Notes & Comments
┌──────────────────────────────────┐
│ Your note (Jan 20, 8:30 PM)      │
│                                  │
│ "Good communication skills,      │
│  thorough understanding of       │
│  React. Schedule technical       │
│  interview."                     │
│                                  │
│ @mention Recruiter: Alice        │
│ [Edit] [Delete]                  │
└──────────────────────────────────┘

Add Note
┌──────────────────────────────────┐
│ [Add note...]                    │
│                                  │
│ Markdown support:                │
│ *italic*  **bold**  `code`       │
│                                  │
│ [@mention] [Attach] [Emoji]      │
│ [Save] [Cancel]                  │
└──────────────────────────────────┘

Task Checklist
┌──────────────────────────────────┐
│ ☑ Review CV                      │
│ ☑ Phone screening                │
│ ☐ Technical interview            │
│ ☐ Final interview                │
│ ☐ Make decision                  │
│                                  │
│ [+ Add task]                     │
└──────────────────────────────────┘

Email Log
┌──────────────────────────────────┐
│ ✉️ Jan 20, 5:30 PM               │
│ "Interview Scheduled"            │
│ Sent by: Alice Smith             │
│ Status: Delivered 📬             │
│ Opens: 1  Clicks: 2 🔗          │
│ [Resend] [Template]              │
│                                  │
│ ✉️ Jan 15, 4:45 PM               │
│ "Thank you for applying"         │
│ Status: Delivered 📬             │
│ Opens: 1  Clicks: 0              │
└──────────────────────────────────┘

Reminders
┌──────────────────────────────────┐
│ 🔔 Interview Jan 25, 3:00 PM     │
│ [Dismiss] [Edit] [Done]          │
│                                  │
│ [+ Set reminder]                 │
└──────────────────────────────────┘
```

**Компоненты:**
- Rich text editor для заметок (markdown)
- @mentions для assignees
- Task list с checkboxes
- Email history с tracking
- Reminders и notifications

#### Tab 4: Documents

```
Resume & Files
┌──────────────────────────────────┐
│ 📄 john_doe_cv.pdf              │
│ Uploaded: Jan 15, 2026          │
│ Size: 450 KB                    │
│ [Download] [Preview] [Delete]   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 🎨 portfolio.zip                │
│ Uploaded: Jan 15, 2026          │
│ Size: 2.3 MB                    │
│ [Download] [Delete]             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 📝 cover_letter.docx            │
│ Uploaded: Jan 15, 2026          │
│ [Download] [Preview] [Delete]   │
└──────────────────────────────────┘

[+ Upload document]
```

---

## 5. Управление статусами: UX/UI подход

### 5.1 Где отображаются статусы

**Везде, где виден кандидат:**

1. **Левая колонка (таб Candidates):**
   - Item кандидата: цветной чип рядом с должностью
   - Пример: `🏷 Interview`

2. **Левая колонка (таб Chat):**
   - Мини-инфо о кандидате: статус + вакансия в виде чипа

3. **Правая колонка (Header):**
   - Большой чип статуса (`Status: Interview ▼`)
   - + Чипы вакансий с этапами (`Frontend Senior · Interview`)

4. **Канбан (если есть):**
   - Колонки = статусы, карточки = кандидаты

### 5.2 Комфортное изменение статуса

#### Метод 1: Dropdown селектор

Клик по чипу статуса → открывается dropdown:

```
┌─────────────────────────────┐
│ Status                      │  ← Header
├─────────────────────────────┤
│ 🟦 New                      │  ← Текущий статус (выделен)
│ 🟦 Under Review             │
│ 🟦 Interview Scheduled      │
│ 🟦 Interview Completed      │
│ 🟦 Offer Sent               │
├─────────────────────────────┤
│ 🟥 Rejected                 │
│ 🟥 Declined                 │
├─────────────────────────────┤
│ [Quick actions:] [← Back]   │
│ [✓ Accept]  [→ Next Stage]  │
└─────────────────────────────┘
```

**Структура:**
- Группировка статусов по стадиям (Funnel stages)
- Текущий статус выделен галочкой или подложкой
- Быстрые кнопки: "Move forward", "Reject", "Back"
- Иконки и цвета для каждого статуса

#### Метод 2: Kanban drag-and-drop

В режиме Kanban:
- Перетаскивание карточки между колонками
- Автоматическое сохранение статуса
- Confirmation toast: "John moved to Interview"

#### Метод 3: Bulk status change

В таблице Candidates:
- Выбрать чекбоксы (multiple select)
- Над таблицей появляется toolbar: `[Change status ▼] [Add tag ▼] [Assign ▼]`
- Клик на "Change status" → открывается dropdown

```
Selected 5 candidates
┌────────────────────────────────┐
│ [Change status ▼]              │
│ [Add tag ▼]                    │
│ [Assign to ▼]                  │
│ [Send message]                 │
│ [Export]                       │
└────────────────────────────────┘
```

### 5.3 Status flow и валидация

**Стандартная воронка:**
```
New → Under Review → Interview → Offer → Accepted
                ↘         ↙ Rejected (на любом этапе)
                  Declined
```

**Правила:**
- Всегда можно вернуться на шаг назад
- Отклонение возможно из любого статуса
- Некоторые действия (например, "Schedule Interview") автоматически меняют статус на "Interview Scheduled"

### 5.4 Визуальное кодирование статусов

```
🟦 New              #2180A0 (teal)
🟦 Under Review     #3B82F6 (blue)
🟦 Interview        #8B5CF6 (purple)
🟩 Offer            #22C55E (green)
🟩 Accepted         #10B981 (emerald)
🟥 Rejected         #EF4444 (red)
🟨 Declined         #F59E0B (amber)
⚫ Archived         #6B7280 (gray)
```

---

## 6. Работа с вакансиями на одной странице

### 6.1 Контекст вакансии

Кандидат может быть связан с одной или несколькими вакансиями. При выборе кандидата система показывает:

```
🎯 Frontend Senior · Interview    ← Основная вакансия
🎯 Backend Mid · New              ← Дополнительная
```

**Клик на чип вакансии:**
- Делает эту вакансию активной
- Меняет статус на статус в контексте этой вакансии
- История отражает события по этой вакансии
- Левая колонка (таб Vacancies) подсвечивает выбранную вакансию

### 6.2 Просмотр и редактирование вакансий

#### В табе "Vacancies" левой колонки:

```
Frontend Senior
Engineering · Priority: High

📊 Pipeline:
┌─────────────────────────────┐
│ New: 5 │ Interview: 3 │ Offer: 1 │
└─────────────────────────────┘

👤 Recruiter: Alice
📅 Deadline: Jan 30
Status: [Open ▼]

[Click to expand]
```

**Клик на вакансию:**
- Может открыть modal/drawer с полными деталями:
  - Описание должности
  - Требования
  - Список кандидатов (list/kanban)
  - История изменений

#### Inline редактирование вакансии

В header правой панели (когда открыт кандидат) можно:

```
Position: [Frontend Senior ▼]
Status:   [Open ▼]
Priority: [High ▼]
Deadline: [Jan 30 ▼]
```

Клик на поле → editable mode → сохраняется автоматически

### 6.3 Pipeline view вакансии

Если есть достаточно пространства (wide screen), показывается карточка воронки:

```
Frontend Senior
┌──────────────┬──────────────┬──────────────┬──────────┐
│   New (5)    │Interview (3) │  Offer (1)   │ Closed   │
├──────────────┼──────────────┼──────────────┼──────────┤
│ [Candidate1] │ [Candidate1] │ [Candidate1] │          │
│ [Candidate2] │ [Candidate2] │              │          │
│ [Candidate3] │ [Candidate3] │              │          │
│ [Candidate4] │              │              │          │
│ [Candidate5] │              │              │          │
└──────────────┴──────────────┴──────────────┴──────────┘
```

**Функционал:**
- Drag-and-drop кандидатов между колонками (смена статуса)
- Клик на кандидата → фокус в правой панели
- Визуальный прогресс воронки

---

## 7. UX паттерны и взаимодействие

### 7.1 Workflow примеры

#### Scenario 1: Обзор кандидата и отправка сообщения

1. Рекрутер открывает приложение
2. Видит левый таб "Candidates" с списком
3. Кликает на "John Doe"
4. Правая панель заполняется его данными (Info таб)
5. Кликает на таб "History" — видит историю взаимодействия
6. Возвращается в левый таб "Chat"
7. Кликает на John Doe из списка диалогов
8. Центральная часть (если есть) или левая колонка показывает message thread
9. Пишет ответное сообщение
10. Возвращается в левый таб "Candidates"
11. Кликает по чипу статуса John Doe → меняет на "Interview"
12. Toast: "Status updated to Interview"

#### Scenario 2: Работа с вакансиями

1. Рекрутер кликает таб "Vacancies" в левой колонке
2. Видит список открытых позиций
3. Кликает на "Frontend Senior"
4. Может открыться modal с деталями вакансии и pipeline
5. В списке кандидатов видит: New (5), Interview (3), Offer (1)
6. Кликает на кандидата в Interview
7. Правая панель показывает его данные в контексте этой вакансии
8. Может изменить статус, добавить заметку, расписать интервью

#### Scenario 3: Bulk операции

1. В табе "Candidates" переключается в mode "Select mode"
2. Выбирает несколько кандидатов чекбоксами
3. Над таблицей появляется toolbar
4. Кликает "Change status" → выбирает "Interview"
5. Все выбранные переходят в Interview
6. Или кликает "Schedule Interview" → открывается modal для выбора времени
7. Письма отправляются всем выбранным

### 7.2 Состояния и transitions

**Empty states:**
```
No candidates found.
Try adjusting your filters or search terms.
[Clear Filters] [New Candidate]
```

**Loading state:**
- Skeleton карточки в списке
- Плавный fade-in при загрузке

**Saving state:**
- Inline сохранение (no modal)
- Toast notification: "Saved successfully"
- Если ошибка: "Failed to save. Retry?" [Retry]

### 7.3 Keyboard shortcuts

```
Cmd/Ctrl + K        Global search
Cmd/Ctrl + N        New candidate
Cmd/Ctrl + Shift+M  Open messages
Esc                 Close/Minimize right panel
↑ ↓                 Navigate list
Enter               Open selected
Cmd/Ctrl + S        Save (inline edits)
```

### 7.4 Responsive design

**Desktop (1200px+):**
- LEFT: 380px | RIGHT: 360px | Content: flexible

**Tablet (768px–1199px):**
- LEFT sidebar может скрываться (hamburger menu)
- LEFT: 320px | RIGHT: drawer или off-canvas

**Mobile (<768px):**
- Полный stack-view
- Табы переключаются свайпом или кнопками
- LEFT: full width | RIGHT: overlay modal
- LEFT+RIGHT не видны одновременно

---

## 8. Технические рекомендации

### 8.1 Frontend Stack

```
Framework:       React 18+ или Vue 3+
State:           Zustand / Jotai (легко) или Redux Toolkit (мощно)
Real-time:       Socket.io / WebSocket для чата
Styling:         Tailwind CSS + CSS Modules
Components:      Radix UI / Headless UI
Forms:           React Hook Form
Data Fetch:      TanStack Query (React Query)
Build:           Vite
```

### 8.2 API Endpoints

```
# Candidates
GET    /api/candidates?page=1&limit=20
GET    /api/candidates/:id
POST   /api/candidates
PATCH  /api/candidates/:id
DELETE /api/candidates/:id

# Candidate Details
GET    /api/candidates/:id/timeline
GET    /api/candidates/:id/documents
POST   /api/candidates/:id/notes

# Chat
GET    /api/conversations
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages
PUT    /api/messages/:msgId
DELETE /api/messages/:msgId

# Vacancies
GET    /api/vacancies
GET    /api/vacancies/:id
PATCH  /api/vacancies/:id
GET    /api/vacancies/:id/pipeline

# Status changes
PATCH  /api/candidates/:id/status
PATCH  /api/candidates/:vacancyId/status  (в контексте вакансии)

# Bulk operations
POST   /api/candidates/bulk/status
POST   /api/candidates/bulk/tags
POST   /api/candidates/bulk/assign

# WebSocket
WS     /ws/chat/:conversationId
WS     /ws/notifications
```

### 8.3 Performance

- Virtual scrolling для длинных списков (react-window)
- Lazy loading карточек
- Debounce search/filter (300-500ms)
- Pagination или infinite scroll
- Image optimization (WebP, lazy loading)
- Code splitting by route
- Memoization (React.memo, useMemo)

### 8.4 Accessibility

```
WCAG 2.1 AA compliance:
- Semantic HTML (<button>, <input>, <label>)
- ARIA attributes (aria-label, aria-describedby, role)
- Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- Focus management (focus-visible outline)
- Color contrast (4.5:1 for normal text)
- Screen reader support
```

---

## 9. Дизайн система

### 9.1 Color Palette

```
Primary:        #2180A0  (teal)
Primary Hover:  #1a6680  (dark teal)
Success:        #22C55E  (green)
Warning:        #F59E0B  (amber)
Error:          #EF4444  (red)
Info:           #3B82F6  (blue)

Background:     #F9FAFB  (off-white)
Surface:        #FFFFFF
Text Primary:   #1F2937  (dark gray)
Text Secondary: #6B7280  (medium gray)
Border:         #E5E7EB  (light gray)
```

### 9.2 Spacing Scale

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### 9.3 Typography

```
Heading 1:      24px, Bold (600), line-height 1.3
Heading 2:      20px, Semibold (600), line-height 1.4
Heading 3:      16px, Semibold (600), line-height 1.4
Body:           14px, Regular (400), line-height 1.5
Small:          12px, Regular (400), line-height 1.4
Caption:        11px, Regular (400), line-height 1.3

Font Family:    Inter, -apple-system, BlinkMacSystemFont
Mono Family:    Fira Code, SF Mono, Courier
```

### 9.4 Components Library

```
✓ Button (primary, secondary, danger, sizes)
✓ Input (text, email, tel, password)
✓ Textarea
✓ Select / Dropdown
✓ Checkbox / Radio
✓ Badge / Tag
✓ Chip
✓ Modal / Dialog
✓ Drawer / Slide-out Panel
✓ Toast / Notification
✓ Tooltip
✓ Spinner / Skeleton
✓ Tabs
✓ Accordion
✓ Avatar
✓ Pagination
✓ Breadcrumb
✓ Menu / Context menu
```

---

## 10. Security & Best Practices

### 10.1 Authentication & Authorization

- JWT tokens + refresh token rotation
- httpOnly cookies для токенов
- RBAC (Role-Based Access Control)
- Scope-based visibility (user может видеть только своих кандидатов)

### 10.2 Data Protection

- Input sanitization (XSS prevention)
- CSRF tokens на POST/PUT/DELETE
- Rate limiting на API
- Audit logs для sensitive actions (status change, delete)
- Encryption in transit (HTTPS only)

### 10.3 Performance Baseline

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3.5s

---

## 11. Интеграции и расширения

### 11.1 Внешние сервисы

```
✓ LinkedIn API (import profiles, job posting)
✓ Google Calendar (schedule interviews)
✓ Email providers (Gmail, Outlook integration)
✓ Telegram / Slack (notifications, bots)
✓ Zoom / Google Meet (video interviews)
✓ Stripe (для платных features)
```

### 11.2 Automations

```
✓ Auto-send email на status changes
✓ Scheduled reminders (interviews, follow-ups)
✓ Template-based emails
✓ Auto-archive старых кандидатов (>3 месяцев неактивности)
✓ Export reports (PDF, Excel)
```

---

## 12. Резюме: лучший UX/UI подход

### Принципы дизайна

1. **Единый контекст** — всё на одной странице, минум переходов
2. **Информационная иерархия** — слева быстрый доступ, справа детали
3. **Скорость** — действия выполняются inline (без модалок, где возможно)
4. **Видимость** — статусы, история, активность всегда видны
5. **Гибкость** — разные режимы просмотра (list, grid, kanban)
6. **Интеграция** — чат, вакансии, кандидаты в одном интерфейсе
7. **Мобильность** — адаптивный дизайн для всех устройств
8. **Доступность** — keyboard navigation, screen reader support

### Ключевые компоненты UX

- ✅ Tabbed left column (Candidates / Chat / Vacancies)
- ✅ Full candidate details on the right
- ✅ Quick status changes (dropdown, kanban, bulk)
- ✅ Unified chat with conversation history
- ✅ Vacancy management without leaving the screen
- ✅ Timeline of all interactions
- ✅ Inline editing and inline actions
- ✅ Real-time updates via WebSocket
- ✅ Responsive design for all devices
- ✅ Keyboard shortcuts for power users

Этот подход создает **интуитивный, быстрый и мощный интерфейс** для управления полным жизненным циклом рекрутмента: от поиска кандидата до отправки оффера, без переключений между экранами.
