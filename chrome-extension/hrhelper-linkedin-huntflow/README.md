## HRHelper LinkedIn → Huntflow (Chrome extension)

Расширение добавляет кнопку **Huntflow** на страницах профиля LinkedIn (`/in/...`):

- если кандидат уже есть в Huntflow (через HRHelper API) — предлагает **Открыть в Huntflow**
- если кандидата нет — предлагает **Сохранить в Huntflow**

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

- `GET /api/v1/huntflow/linkedin-applicants/status/?linkedin_url=...`
- `POST /api/v1/huntflow/linkedin-applicants/create/`  (body: `linkedin_url`, `full_name`, `account_id?`)

