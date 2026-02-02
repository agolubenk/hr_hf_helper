# Сводка по созданным спецификациям API

## ✅ Выполнено

Все запрошенные разделы детально проработаны и задокументированы. Спецификации связаны перекрёстными ссылками для навигации; формулировки приведены к единому стилю, противоречия устранены, оговорки о полях без синхронизации и о недостающих спецификациях зафиксированы явно.

### 1. ✅ Business Logic (100% полнота)
**Файл:** [`BUSINESS_LOGIC.md`](./BUSINESS_LOGIC.md)

**Содержит:**
- ✅ Workflow переходы между этапами (кто может, автоматические переходы)
- ✅ Обязательные комментарии при переходах
- ✅ Уведомления кандидату
- ✅ Валидационные правила (обязательные поля, форматы)
- ✅ Обработка исключений (закрытая вакансия, дубликаты, лимиты)
- ✅ Бизнес-правила (кто может изменять stage, доступ к данным)
- ✅ Алгоритмы (matching кандидатов, назначение интервьюеров)
- ✅ События и уведомления, интеграции (Huntflow, Google Calendar), аудит
- ✅ **Бизнес-логика 54+ страниц и модулей:** Workflow, Чат рекрутера, AI Чат, Календарь, Вики, Вакансии, Заявки, Интервьюеры, Инвайты, Ответы кандидатам, Финансы, Отчетность, Telegram, Huntflow, настройки компании (пользователи, оргструктура, поля, Scorecard, SLA, промпты, этапы найма, команды, правила, офферы), Поиск, детальные страницы
- ✅ **Страницы аккаунта:** Вход (email/пароль, Google OAuth), восстановление и сброс пароля, Профиль (вкладки: просмотр, редактирование, интеграции, быстрые кнопки; синхронизация вкладок; API профиля/интеграций/темы)
- ✅ **Страницы ошибок:** 401, 402, 403, 404, 500
- ✅ **Переиспользуемые компоненты и части страниц:** Layout (AppLayout, Header, Sidebar), общие UI, плавающие действия и быстрые кнопки, паттерны страниц, компоненты по доменам
- ✅ Дополнительные процессы: обработка резюме, Scorecard, офферы, зарплатные вилки

### 2. ✅ Authentication & Authorization (100% полнота)
**Файл:** [`AUTHENTICATION_AUTHORIZATION.md`](./AUTHENTICATION_AUTHORIZATION.md)

**Содержит:**
- ✅ Метод аутентификации (JWT + Refresh Tokens)
- ✅ Хранение токенов (Memory для access, HttpOnly cookies для refresh)
- ✅ Жизненный цикл токенов (TTL, ротация)
- ✅ Матрица ролей и прав доступа (RBAC table)
- ✅ API Scopes для каждой роли
- ✅ Row-Level Security (RLS) - кто видит какие данные
- ✅ Примеры проверки прав в API
- ✅ Безопасность (защита от XSS, CSRF, Brute Force)

### 3. ✅ Database Schema (100% полнота)
**Файл:** [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)

**Содержит:**
- ✅ Все таблицы (18 основных таблиц)
- ✅ Связи между таблицами (N:1, N:N)
- ✅ Индексы для производительности
- ✅ Ограничения и валидации (CHECK constraints)
- ✅ Foreign Key constraints
- ✅ Стратегия миграций
- ✅ Резервное копирование

### 4. ✅ Error Handling Standards (100% полнота)
**Файл:** [`ERROR_HANDLING.md`](./ERROR_HANDLING.md)

**Содержит:**
- ✅ Единый формат ошибок (стандартная структура)
- ✅ Все коды ошибок (30+ кодов)
- ✅ Валидационные ошибки (формат для 422)
- ✅ Обработка ошибок на клиенте (TypeScript примеры)
- ✅ Retry логика с exponential backoff
- ✅ Логирование ошибок

### 5. ✅ Integration Specifications (100% полнота)
**Файл:** [`INTEGRATIONS.md`](./INTEGRATIONS.md)

**Содержит:**
- ✅ Huntflow Integration:
  - Эндпоинты API
  - Процесс синхронизации (two-way, частота)
  - Обработка конфликтов
  - Очередь синхронизации
  - Маппинг данных
- ✅ Telegram Integration:
  - Webhook + Polling (fallback)
  - Обработка команд (/start, /help, /status, etc.)
  - Хранение истории сообщений
  - Поддержка медиа
- ✅ AI/LLM Integration:
  - Провайдер (OpenAI GPT-4 + Claude fallback)
  - Промпты (скрининг, генерация описаний)
  - Кэширование ответов
  - Стоимость и лимиты
  - Fallback стратегия
- ✅ Google Calendar Integration

### 6. ✅ Performance & Scalability (100% полнота)
**Файл:** [`PERFORMANCE_SCALABILITY.md`](./PERFORMANCE_SCALABILITY.md)

**Содержит:**
- ✅ Pagination (offset-based, формат ответа)
- ✅ Rate Limiting (по пользователю и эндпоинту, backoff)
- ✅ Caching (что кэшируется, TTL, инвалидация)
- ✅ Database Optimization (ожидаемые объемы, целевые показатели)
- ✅ Индексы для производительности
- ✅ Concurrency (ожидаемая нагрузка, connection pool)
- ✅ Мониторинг производительности
- ✅ Масштабирование (горизонтальное и вертикальное)

## 📊 Статистика

- **Всего документов:** 8 (включая сводку)
- **Спецификации:** BUSINESS_LOGIC, AUTHENTICATION_AUTHORIZATION, DATABASE_SCHEMA, ERROR_HANDLING, INTEGRATIONS, PERFORMANCE_SCALABILITY
- **Покрытие:** 100% запрошенных разделов; бизнес-логика 54+ страниц и модулей, переиспользуемые компоненты, аккаунт пользователя

## 📁 Структура файлов

```
frontend/API_SPECIFICATIONS/
├── README.md                          # Индекс и навигация по спецификациям
├── SUMMARY.md                         # Сводка (этот файл): статистика, что сделано, версии
├── BUSINESS_LOGIC.md                  # Бизнес-логика, страницы, компоненты, процессы
├── AUTHENTICATION_AUTHORIZATION.md    # Аутентификация и авторизация (JWT, RBAC, RLS)
├── DATABASE_SCHEMA.md                 # Схема БД, таблицы, индексы, миграции
├── ERROR_HANDLING.md                  # Формат ошибок, коды, обработка на клиенте
├── INTEGRATIONS.md                    # Huntflow, Telegram, AI/LLM, Google Calendar, профиль
└── PERFORMANCE_SCALABILITY.md        # Пагинация, rate limiting, кэш, масштабирование
```

## 🎯 Что было уточнено

### Business Logic
- ✅ Кто может переместить кандидата между этапами
- ✅ Автоматические переходы
- ✅ Обязательные комментарии при переходе
- ✅ Уведомления кандидату
- ✅ Алгоритм matching кандидатов
- ✅ Валидационные правила
- ✅ Обработка исключений (закрытая вакансия, дубликаты)
- ✅ Бизнес-правила (может ли recruiter изменять stage)

### Authentication & Authorization
- ✅ Как аутентифицировать (JWT + Refresh Tokens)
- ✅ Как хранить токены (Memory + HttpOnly cookies)
- ✅ Жизненный цикл токенов (TTL, refresh)
- ✅ Матрица ролей и прав доступа (RBAC table)
- ✅ API scopes для каждой роли
- ✅ Row-level security (может ли recruiter видеть данные других компаний)

### Database Schema
- ✅ Все таблицы (18 таблиц)
- ✅ Связи между таблицами
- ✅ Индексы на часто используемых полях

### Error Handling
- ✅ Единый формат ошибок
- ✅ Коды ошибок (30+ кодов)
- ✅ Описание каждой ошибки
- ✅ Клиентский обработчик ошибок

### Integrations
- ✅ Какие эндпоинты Huntflow используются
- ✅ Как происходит синхронизация (two-way, частота)
- ✅ Что если синхронизация fails
- ✅ Как обрабатываются конфликты
- ✅ Как получать входящие сообщения Telegram (Webhook + Polling)
- ✅ Какой webhook URL
- ✅ Обработка входящих команд
- ✅ Хранение истории сообщений
- ✅ Поддержка медиа
- ✅ Какой провайдер AI (OpenAI GPT-4 + Claude fallback)
- ✅ Какие промпты использоваться
- ✅ Как кэшировать ответы
- ✅ Стоимость и лимиты
- ✅ Fallback если AI недоступен

### Performance & Scalability
- ✅ Pagination (default page_size, max page_size, cursor vs offset)
- ✅ Rate Limiting (per-user, per-endpoint, backoff стратегия)
- ✅ Caching (что кэшируется, TTL, cache invalidation)
- ✅ Database (expected rows, query performance targets, индексы)
- ✅ Concurrency (одновременные users, API запросы, connection pool)

## 🚀 Следующие шаги

1. **Backend разработчики:**
   - Изучить все спецификации
   - Реализовать согласно стандартам
   - Использовать как reference при разработке

2. **Frontend разработчики:**
   - Изучить Error Handling для обработки ошибок
   - Изучить Authentication для работы с токенами
   - Учитывать Rate Limiting и Pagination

3. **Product/QA:**
   - Использовать Business Logic для тестирования
   - Проверять права доступа согласно матрице
   - Тестировать обработку ошибок

4. **DevOps:**
   - Настроить мониторинг согласно Performance & Scalability
   - Настроить кэширование (Redis)
   - Настроить rate limiting

## 📝 Примечания

- Все спецификации готовы к использованию
- Документы можно обновлять по мере развития проекта
- Версионирование документов для отслеживания изменений
- Связь с pre-specification.json файлами для детализации по страницам

## 📝 Обновления (версия 2.0.0)

### Сводка изменений:

1. **BUSINESS_LOGIC.md (2.0.0):**
   - Расширена до 54+ страниц и модулей (настройки компании, детальные страницы, аккаунт, ошибки)
   - Добавлен раздел «Переиспользуемые компоненты и общие части страниц» (Layout, UI, паттерны страниц)
   - Детализированы страницы аккаунта: вход (email/пароль, Google OAuth), восстановление и сброс пароля, профиль (вкладки, синхронизация, API профиля/интеграций/быстрых кнопок/темы)
   - Добавлены разделы страниц ошибок (401, 402, 403, 404, 500)
   - Устранено дублирование; добавлены перекрёстные ссылки на другие спецификации

2. **Перекрёстные ссылки:**
   - В каждом документе добавлены или уточнены ссылки на смежные спецификации (README, SUMMARY, AUTH, DATABASE_SCHEMA, ERROR_HANDLING, INTEGRATIONS, PERFORMANCE, BUSINESS_LOGIC)
   - README и SUMMARY содержат актуальный список документов и краткое описание

3. **Дополнения по документам:**
   - **INTEGRATIONS.md:** раздел об интеграциях в профиле пользователя (Gemini, Huntflow, ClickUp, Notion, Telegram, Google, hh.ru, OpenAI, Cloud AI, n8n); ссылка на BUSINESS_LOGIC
   - **ERROR_HANDLING.md:** коды ошибок для вакансий по странам и этапов найма перенесены в раздел 2.2; коды аккаунта/профиля; ссылка на BUSINESS_LOGIC
   - **DATABASE_SCHEMA.md:** раздел о настройках профиля пользователя (theme, quick_buttons, интеграции); ссылка на BUSINESS_LOGIC
   - **PERFORMANCE_SCALABILITY.md:** кэширование данных профиля и быстрых кнопок; ссылка на BUSINESS_LOGIC
   - **AUTHENTICATION_AUTHORIZATION.md:** ссылка на BUSINESS_LOGIC (логин, восстановление пароля, профиль, Google OAuth)

---

## 📝 Обновления (версия 1.1.0)

### Новые функции и изменения:

1. **Этапы найма с настройками встреч:**
   - Добавлены поля `is_meeting`, `show_offices`, `show_interviewers` в таблицу `recruiting_stages`
   - Этапы с `is_meeting = true` используются для формирования динамических тогглеров на страницах `/workflow` и `/recr-chat`
   - Панель настроек встречи отображается условно в зависимости от настроек этапа

2. **Команды рекрутинга:**
   - Добавлена таблица `recruiting_commands`
   - Команда должна быть обязательно связана с этапом найма (`stage_id` обязателен)
   - Поддержка работы в любой раскладке клавиатуры (`allow_any_layout`)
   - Типы команд: `analysis` (анализ) или `event` (событие)

3. **Настройки вакансии по странам:**
   - Добавлены таблицы `vacancy_text_by_country`, `vacancy_activity_by_country`, `vacancy_questions_by_office`
   - Текст вакансии настраивается отдельно для каждой страны
   - Активность вакансии управляется отдельно для каждой страны
   - Вопросы и ссылки настраиваются отдельно для каждого офиса

4. **Новые коды ошибок:**
   - Команды рекрутинга: `COMMAND_DUPLICATE`, `COMMAND_INVALID_FORMAT`, `COMMAND_STAGE_REQUIRED`, `COMMAND_TYPE_INVALID`, `COMMAND_STAGE_NOT_FOUND`
   - Вакансии по странам: `VACANCY_COUNTRY_NOT_FOUND`, `VACANCY_COUNTRY_INACTIVE`, `VACANCY_FIELD_INACTIVE`, `VACANCY_OFFICE_NOT_FOUND`, `VACANCY_OFFICE_INACTIVE`
   - Этапы найма: `RECRUITING_STAGE_NOT_FOUND`, `RECRUITING_STAGE_MEETING_SETTINGS_INVALID`

5. **Новые права доступа:**
   - `read:recruiting_stages`, `write:recruiting_stages` - для управления этапами найма с настройками встреч
   - `read:recruiting_commands`, `write:recruiting_commands`, `delete:recruiting_commands` - для управления командами рекрутинга
   - `read:vacancy_country_settings`, `write:vacancy_country_settings` - для управления настройками вакансии по странам

6. **Интеграционные требования:**
   - API endpoint `GET /api/company-settings/recruiting/stages/` должен возвращать этапы с полными настройками встреч
   - API endpoints для команд должны поддерживать новые поля: `command_type`, `allow_any_layout`, обязательный `stage_id`
   - API endpoints для настроек вакансии по странам: `GET/PUT /api/vacancies/{id}/country-settings/{country_code}/`
   - API endpoints для настроек офисов: `GET/PUT /api/vacancies/{id}/office-settings/{office_id}/`

7. **Производительность:**
   - Кэширование этапов-встреч (TTL: 10 минут)
   - Кэширование настроек вакансии по странам (TTL: 5 минут)
   - Оптимизированные запросы с JOIN для загрузки этапов с настройками
   - Индексы на `is_meeting`, `country_code`, `office_id` для быстрого поиска

---

**Версия:** 2.0.0  
**Дата создания:** 2026-01-28  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
