# Диагностика: Кнопка не отображается

## Шаг 1: Перезагрузи расширение

```
1. Открой chrome://extensions
2. Найди "HRHelper LinkedIn → Huntflow"
3. Нажми кнопку "Reload" (⟳)
```

## Шаг 2: Открой консоль

```
1. Открой любой профиль LinkedIn: https://www.linkedin.com/in/username/
2. Нажми F12 (DevTools)
3. Перейди на вкладку "Console"
```

## Шаг 3: Смотри логи

### ✅ Нормальные логи (всё работает):

```
[HRHelper] Content script loaded
[HRHelper] Starting initialization...
[HRHelper] Observer started
[HRHelper] IS_MESSAGING_PAGE: false
[HRHelper] IS_PROFILE_PAGE: true
[HRHelper] Location: https://www.linkedin.com/in/username/
[HRHelper] Found canonical URL on init: https://www.linkedin.com/in/username/
[HRHelper] refreshButtonForCurrentProfile called
[HRHelper] Canonical URL: https://www.linkedin.com/in/username/
[HRHelper] Fetching status from API...
[HRHelper] Status received: {success: true, exists: false, ...}
[HRHelper] Candidate not found, showing input
[HRHelper] ensureButtons called, show: true
[HRHelper] Creating/updating buttons...
```

### ❌ Проблема 1: Скрипт не загружается

```
(пусто, нет логов [HRHelper])
```

**Причина:** Расширение не загружено или не работает на этой странице

**Решение:**
1. Проверь `chrome://extensions` — расширение должно быть включено
2. Проверь, что ты на странице профиля: `/in/username/`
3. Перезагрузи расширение (кнопка Reload)
4. Hard reload страницы: Ctrl+Shift+R

---

### ❌ Проблема 2: Не определяется тип страницы

```
[HRHelper] IS_MESSAGING_PAGE: false
[HRHelper] IS_PROFILE_PAGE: false
[HRHelper] Unknown page type
```

**Причина:** Ты не на странице профиля или сообщений

**Решение:**
- Открой профиль: `https://www.linkedin.com/in/username/`
- Или сообщения: `https://www.linkedin.com/messaging/thread/...`

---

### ❌ Проблема 3: Не находится canonical URL

```
[HRHelper] Canonical URL: null
[HRHelper] No canonical URL, exiting
```

**Причина:** URL страницы не распознан как профиль LinkedIn

**Решение:**
- Убедись, что URL содержит `/in/username/`
- Не `/search/`, не `/jobs/`, не `/feed/`

---

### ❌ Проблема 4: Ошибка API

```
[HRHelper] Fetching status from API...
Failed to load resource: net::ERR_FAILED
```

**Причина:** Backend недоступен

**Решение:**
```bash
# Проверь, что backend запущен
curl http://localhost:8000/api/health/

# Если нет — запусти
cd backend && python3 manage.py runserver
```

---

### ❌ Проблема 5: Нет API Token

```
[HRHelper] Status received: {ok: false, status: 0, json: {message: "Нет API токена..."}}
[HRHelper] Auth required or error: Нет API токена...
```

**Причина:** API Token не указан в настройках

**Решение:**
1. Открой настройки расширения:
   ```
   chrome://extensions → Details → Extension options
   ```
2. Получи токен (будучи залогиненным в HRHelper):
   ```
   http://localhost:8000/api/v1/accounts/users/token/
   ```
3. Вставь токен в поле "API Token"
4. Нажми "Сохранить"
5. Перезагрузи LinkedIn

---

### ❌ Проблема 6: STATE.current.show = false

```
[HRHelper] ensureButtons called, show: false
[HRHelper] STATE.current.show is false, not showing buttons
```

**Причина:** Backend вернул ошибку или не вернул `exists: true/false`

**Решение:**
1. Проверь предыдущие логи — должен быть `[HRHelper] Status received: ...`
2. Если статус не пришёл — проверь Network tab (F12 → Network)
3. Должен быть запрос: `GET /api/v1/huntflow/linkedin-applicants/status/`
4. Проверь его Response

---

## Шаг 4: Проверь Network (F12 → Network)

### Фильтр: `linkedin-applicants`

Должен быть **1 запрос**:

```
GET /api/v1/huntflow/linkedin-applicants/status/?linkedin_url=https://linkedin.com/in/username/
Status: 200 OK
Response:
{
  "success": true,
  "exists": false,
  "linkedin_url": "https://linkedin.com/in/username/"
}
```

### Если запроса нет:

**Причина:** `checkStatus()` не вызывается

**Решение:**
- Проверь консоль — должен быть лог `[HRHelper] Fetching status from API...`
- Если нет — проблема в `refreshButtonForCurrentProfile()`

### Если статус 401/403:

**Причина:** API Token неверный

**Решение:**
- Получи новый токен: `http://localhost:8000/api/v1/accounts/users/token/`
- Обнови в настройках расширения

### Если статус 500:

**Причина:** Ошибка на backend

**Решение:**
- Проверь backend логи:
  ```bash
  tail -f backend/logs/django.log
  ```

---

## Шаг 5: Проверь DOM

В консоли браузера:

```javascript
// Есть ли виджет?
document.querySelectorAll('[data-hrhelper-huntflow="1"]').length
// Ожидается: 1 или 2

// Если 0 — виджет не создан
// Проверь: STATE.current.show должен быть true

// Проверь STATE
console.log({
  show: STATE?.current?.show,
  mode: STATE?.current?.mode,
  disabled: STATE?.current?.disabled,
  buttons: STATE?.buttons?.size
});

// Ожидается:
// {show: true, mode: "open" или "input", disabled: false, buttons: 1 или 2}
```

---

## Шаг 6: Ручная проверка API

```bash
# 1. Получи токен
curl http://localhost:8000/api/v1/accounts/users/token/ \
  -H "Cookie: sessionid=YOUR_SESSION"

# Response: {"token": "abc123..."}

# 2. Проверь status endpoint
curl "http://localhost:8000/api/v1/huntflow/linkedin-applicants/status/?linkedin_url=https://linkedin.com/in/test/" \
  -H "Authorization: Token YOUR_TOKEN"

# Response: {"success": true, "exists": false, ...}
```

---

## Быстрый фикс (если ничего не помогает)

```javascript
// В консоли браузера
// 1. Очисти кэш
localStorage.clear();

// 2. Перезагрузи STATE
location.reload();
```

```bash
# 3. Перезапусти backend
cd backend
python3 manage.py runserver
```

```
# 4. Перезагрузи расширение
chrome://extensions → Reload
```

---

## Отправь мне логи

Скопируй **ВСЕ** логи из консоли (F12 → Console) и отправь мне:

```
[HRHelper] Content script loaded
[HRHelper] Starting initialization...
[HRHelper] Observer started
...
(всё, что начинается с [HRHelper])
```

Также отправь:
- URL страницы LinkedIn
- Скриншот Network tab (запрос к API)
- Версию расширения (из manifest.json)
