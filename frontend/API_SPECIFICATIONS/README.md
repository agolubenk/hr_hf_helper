# API Specifications Index

## Общее описание

Эта директория содержит детальные спецификации для различных аспектов API HR Helper, которые требуют уточнения и проработки.

## Структура документации

### 1. Business Logic
**Файл:** [`BUSINESS_LOGIC.md`](./BUSINESS_LOGIC.md)

**Содержание:**
- Workflow переходы между этапами
- Правила валидации
- Обработка исключений
- Бизнес-правила доступа
- Алгоритмы (matching кандидатов, назначение интервьюеров)
- События и уведомления

**Статус:** ✅ Полностью проработано

### 2. Authentication & Authorization
**Файл:** [`AUTHENTICATION_AUTHORIZATION.md`](./AUTHENTICATION_AUTHORIZATION.md)

**Содержание:**
- Метод аутентификации (JWT + Refresh Tokens)
- Хранение токенов (Memory + HttpOnly Cookies)
- Жизненный цикл токенов
- Матрица ролей и прав доступа (RBAC)
- API Scopes
- Row-Level Security (RLS)

**Статус:** ✅ Полностью проработано

### 3. Database Schema
**Файл:** [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)

**Содержание:**
- Все таблицы базы данных
- Связи между таблицами
- Индексы для производительности
- Ограничения и валидации
- Стратегия миграций

**Статус:** ✅ Полностью проработано

### 4. Error Handling Standards
**Файл:** [`ERROR_HANDLING.md`](./ERROR_HANDLING.md)

**Содержание:**
- Единый формат ошибок
- Коды ошибок (все типы)
- Обработка ошибок на клиенте
- Retry логика
- Логирование ошибок

**Статус:** ✅ Полностью проработано

### 5. Integration Specifications
**Файл:** [`INTEGRATIONS.md`](./INTEGRATIONS.md)

**Содержание:**
- Huntflow Integration (двусторонняя синхронизация)
- Telegram Integration (Webhook + Polling)
- AI/LLM Integration (OpenAI GPT-4 + Claude fallback)
- Google Calendar Integration

**Статус:** ✅ Полностью проработано

### 6. Performance & Scalability
**Файл:** [`PERFORMANCE_SCALABILITY.md`](./PERFORMANCE_SCALABILITY.md)

**Содержание:**
- Pagination (offset-based)
- Rate Limiting (по пользователю и эндпоинту)
- Caching стратегия (Redis)
- Database Optimization
- Concurrency handling
- Мониторинг и масштабирование

**Статус:** ✅ Полностью проработано

## Как использовать эти спецификации

### Для Backend разработчиков

1. **Изучите все документы** перед началом разработки
2. **Следуйте стандартам:**
   - Формат ошибок из `ERROR_HANDLING.md`
   - Структура БД из `DATABASE_SCHEMA.md`
   - Правила доступа из `AUTHENTICATION_AUTHORIZATION.md`
3. **Реализуйте бизнес-логику** согласно `BUSINESS_LOGIC.md`
4. **Настройте интеграции** по `INTEGRATIONS.md`
5. **Оптимизируйте производительность** согласно `PERFORMANCE_SCALABILITY.md`

### Для Frontend разработчиков

1. **Используйте спецификации** для понимания API
2. **Реализуйте обработку ошибок** по `ERROR_HANDLING.md`
3. **Следуйте правилам аутентификации** из `AUTHENTICATION_AUTHORIZATION.md`
4. **Учитывайте ограничения** из `PERFORMANCE_SCALABILITY.md` (rate limiting, pagination)

### Для Product/QA

1. **Используйте бизнес-логику** из `BUSINESS_LOGIC.md` для тестирования
2. **Проверяйте права доступа** согласно матрице в `AUTHENTICATION_AUTHORIZATION.md`
3. **Тестируйте обработку ошибок** по примерам из `ERROR_HANDLING.md`

## Связь с другими документами

- **pre-specification.json** - предварительные спецификации для каждой страницы/компонента
- **PAGE_DOCUMENTATION.md** - документация страниц
- **COMPONENTS_DOCUMENTATION.md** - документация компонентов

## Обновление спецификаций

При изменении спецификаций:

1. Обновите соответствующий документ
2. Обновите версию документа
3. Обновите дату последнего обновления
4. Уведомите команду об изменениях

## Версионирование

Все документы используют семантическое версионирование:
- **Major** (1.0.0) - критические изменения, ломающие обратную совместимость
- **Minor** (0.1.0) - новые функции, обратно совместимые
- **Patch** (0.0.1) - исправления ошибок, обратно совместимые

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
