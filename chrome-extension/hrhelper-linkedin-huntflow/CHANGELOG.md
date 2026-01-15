## Changelog

### v0.2.0 - Поддержка страниц /messaging/ (2026-01-15)

**Новые возможности:**

- ✅ **Работа на страницах сообщений** (`/messaging/thread/...`)
  - Кнопка/инпут отображается **над формой ввода сообщения** (перед текстовым полем чата)
  - Автоматическое определение профиля кандидата через маппинг `thread_id → profile_url`
  - Без кликов и переходов — `thread_id` извлекается из DOM на странице профиля
  - Локальный кэш (localStorage) + backend для надёжности

- ✅ **Backend API для thread mapping**
  - `POST /api/v1/linkedin/thread-mapping/` — сохранение маппинга
  - `GET /api/v1/linkedin/thread-mapping/?thread_id=...` — получение профиля по thread_id
  - Новая модель `LinkedInThreadProfile` с индексами

- ✅ **Оптимизации производительности**
  - Throttle увеличен до 3 сек (LinkedIn менее раздражён)
  - DOM виджеты создаются **один раз**, обновляются через `display: block/none`
  - Event listeners добавляются один раз при создании (не пересоздаются)
  - `requestAnimationFrame` вместо `setTimeout` для подавления MutationObserver
  - Убраны циклы и избыточные DOM-операции

**Исправления:**

- 🐛 Исправлены бесконечные циклы MutationObserver
- 🐛 Убраны множественные API запросы (max 1 status GET + 1 set-link POST на профиль)
- 🐛 Исправлены ошибки `chrome-extension://invalid/` (LinkedIn больше не блокирует)

**Технические детали:**

- Миграция: `0005_linkedin_thread_profile.py`
- ViewSet: `LinkedInThreadMappingViewSet`
- Модель: `LinkedInThreadProfile` (user, thread_id, profile_url, timestamps)
- Маппинг сохраняется автоматически при посещении профиля (если есть кнопка "Message")

---

### v0.1.0 - Первая версия (2026-01-14)

**Возможности:**

- ✅ Кнопка "Huntflow" на страницах профилей LinkedIn (`/in/...`)
- ✅ Проверка наличия кандидата в базе через API
- ✅ Сохранение связки LinkedIn → Huntflow URL
- ✅ Токен-based аутентификация (DRF Token)
- ✅ Настройки расширения (Base URL + API Token)

**Известные проблемы (исправлены в v0.2.0):**

- ⚠️ Множественные API запросы при мутациях DOM
- ⚠️ LinkedIn иногда блокировал из-за избыточных DOM-операций
- ⚠️ Не работало на страницах /messaging/
