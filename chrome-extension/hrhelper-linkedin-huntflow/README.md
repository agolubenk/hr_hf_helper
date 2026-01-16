## HRHelper LinkedIn → Huntflow (Chrome extension)

Расширение добавляет кнопку **Huntflow** на страницах LinkedIn:

- **Профили** (`/in/...`): рядом с кнопкой "More" — если кандидат есть в базе, показывается кнопка **Открыть в Huntflow**, если нет — инпут для сохранения ссылки
- **Сообщения** (`/messaging/thread/...`): **над формой ввода сообщения** — автоматически определяет профиль кандидата через сохранённый маппинг `thread_id → profile_url` и показывает ту же кнопку/инпут

### Как это работает

1. **На странице профиля** (`/in/username/`):
   - Расширение автоматически извлекает `thread_id` из кнопки "Message" (без кликов!)
   - Сохраняет маппинг `thread_id → profile_url` в localStorage и на backend
   - Проверяет, есть ли кандидат в базе через API `/api/v1/huntflow/linkedin-applicants/status/`
   - **Если кандидат найден:**
     - Показывает кнопку **"Huntflow"** (открыть в Huntflow)
     - Показывает **красную кнопку ✏️** (редактировать ссылку)
   - **Если кандидата нет:**
     - Показывает инпут для ввода ссылки на Huntflow

2. **На странице сообщений** (`/messaging/thread/...`):
   - Расширение извлекает `thread_id` из URL
   - Ищет `profile_url` в localStorage или запрашивает с backend `/api/v1/linkedin/thread-mapping/`
   - Показывает ту же кнопку/инпут, что и на профиле

3. **Редактирование ссылки:**
   - Нажмите на **красную кнопку ✏️** рядом с кнопкой "Huntflow"
   - Появится поле ввода с текущей ссылкой + кнопки "Сохранить" и "Отмена"
   - Измените ссылку и нажмите **"Сохранить"** (backend автоматически определит последнюю вакансию)
   - Или нажмите **"Отмена"** для возврата без изменений

### Установка (локально, без Chrome Web Store)

- Открой `chrome://extensions`
- Включи **Developer mode**
- Нажми **Load unpacked**
- Выбери папку `chrome-extension/hrhelper-linkedin-huntflow`

### Настройка

- Открой **Details** → **Extension options**
- Укажи **Base URL HRHelper** (например `http://localhost:8000`)
- Укажи **API Token (DRF)**:
  - открой в браузере (будучи залогиненным в HRHelper): `http://localhost:8000/api/v1/accounts/users/token/`
  - скопируй `token` и вставь в настройки расширения

Важно: расширение использует **токен**, потому что cookies из LinkedIn часто не отправляются (SameSite/third‑party).

### Backend endpoints

**Huntflow integration:**
- `GET /api/v1/huntflow/linkedin-applicants/status/?linkedin_url=...` — проверка, есть ли кандидат в базе
- `POST /api/v1/huntflow/linkedin-applicants/set-link/` — сохранение связки LinkedIn → Huntflow URL
  - **Автоматическая обработка Huntflow URL**: если вставить `https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055`, backend сам определит последнюю вакансию и вернёт `https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055`

**Thread mapping (для /messaging/):**
- `POST /api/v1/linkedin/thread-mapping/` — сохранение `thread_id → profile_url` (автоматически)
- `GET /api/v1/linkedin/thread-mapping/?thread_id=...` — получение `profile_url` по `thread_id`

### Оптимизации

- **Без кликов**: `thread_id` извлекается из DOM, не требуется переход на страницу сообщений
- **Throttling**: максимум 1 API запрос на профиль (кэширование 30 сек)
- **DOM performance**: виджеты создаются один раз, обновляются через `display: block/none`
- **Локальный кэш**: маппинги хранятся в localStorage для оффлайн-работы

### Troubleshooting

Если кнопки не появляются:
1. Проверь консоль браузера (F12) на ошибки
2. Убедись, что API Token указан в настройках расширения
3. Проверь, что backend доступен по указанному URL
4. Перезагрузи расширение: `chrome://extensions` → **Reload**
