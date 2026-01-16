## Быстрая диагностика: почему не отображается кнопка

### Шаг 1: Проверь консоль браузера (F12)

Открой LinkedIn профиль и смотри на ошибки:

**Хорошие логи:**
```
[HRHelper] Profile: john-doe
[HRHelper] Found thread: 2-ABC...
```

**Плохие логи (ошибки):**
```
❌ Failed to load resource: net::ERR_FAILED
❌ Uncaught TypeError: ...
❌ 401 Unauthorized
❌ 403 Forbidden
```

---

### Шаг 2: Проверь API Token

1. Открой настройки расширения: `chrome://extensions` → **Details** → **Extension options**
2. Проверь, что **API Token** указан
3. Если нет — получи токен:
   ```
   http://localhost:8000/api/v1/accounts/users/token/
   ```

---

### Шаг 3: Проверь backend API вручную

#### 3.1 Проверка токена

```bash
curl http://localhost:8000/api/v1/accounts/users/token/ \
  -H "Cookie: sessionid=YOUR_SESSION"

# Должен вернуть:
{"token": "abc123..."}
```

#### 3.2 Проверка status endpoint

```bash
curl "http://localhost:8000/api/v1/huntflow/linkedin-applicants/status/?linkedin_url=https://linkedin.com/in/test/" \
  -H "Authorization: Token YOUR_TOKEN"

# Должен вернуть:
{"success": true, "exists": false, "linkedin_url": "https://linkedin.com/in/test/"}
# ИЛИ
{"success": true, "exists": true, "app_url": "https://huntflow.ru/..."}
```

#### 3.3 Проверка set-link endpoint

```bash
curl -X POST http://localhost:8000/api/v1/huntflow/linkedin-applicants/set-link/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin_url": "https://linkedin.com/in/test/",
    "target_url": "https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055"
  }'

# Должен вернуть:
{"success": true, "exists": true, "app_url": "https://huntflow.ru/..."}
```

---

### Шаг 4: Проверь STATE расширения

В консоли браузера (на странице LinkedIn):

```javascript
// Проверь глобальный STATE (если доступен)
console.log('Show:', STATE?.current?.show);
console.log('Mode:', STATE?.current?.mode);
console.log('App URL:', STATE?.current?.appUrl);
console.log('Buttons:', STATE?.buttons?.size);

// Должно быть:
// Show: true
// Mode: "open" или "input"
// Buttons: 1 или 2
```

---

### Шаг 5: Проверь DOM

В консоли браузера:

```javascript
// Есть ли наш виджет в DOM?
document.querySelectorAll('[data-hrhelper-huntflow="1"]').length
// Должно быть: 1 или 2

// Есть ли кнопка?
document.querySelectorAll('.hrhelper-action-btn').length
// Должно быть: 1 или 2

// Есть ли инпут?
document.querySelectorAll('.hrhelper-input').length
// Должно быть: 1 или 2 (если mode="input")
```

---

### Шаг 6: Проверь Network (F12 → Network)

При загрузке профиля LinkedIn должен быть **1 запрос**:

```
GET /api/v1/huntflow/linkedin-applicants/status/?linkedin_url=...
Status: 200 OK
Response: {"success": true, "exists": false, ...}
```

**Если запроса нет:**
- API Token не указан в настройках
- Расширение не запустилось (перезагрузи: `chrome://extensions` → Reload)

**Если статус 401/403:**
- API Token неверный или истёк
- Получи новый токен: `http://localhost:8000/api/v1/accounts/users/token/`

---

### Шаг 7: Проверь backend логи

```bash
# Django logs
tail -f backend/logs/django.log

# Или runserver output
cd backend && python3 manage.py runserver
```

**Ищи ошибки:**
```
❌ AttributeError: ...
❌ KeyError: ...
❌ Exception in _get_latest_vacancy_for_applicant: ...
```

---

### Частые проблемы

#### Проблема 1: Кнопка не появляется вообще

**Причина:** `STATE.current.show = false`

**Решение:**
1. Проверь, что API вернул `exists: true` или `exists: false` (а не ошибку)
2. Проверь консоль на ошибки API
3. Перезагрузи расширение

---

#### Проблема 2: Кнопка появляется, но не кликабельна

**Причина:** `STATE.current.disabled = true`

**Решение:**
1. Проверь `STATE.current.title` — там должна быть причина
2. Обычно это "Нужна авторизация" → проверь API Token

---

#### Проблема 3: Кнопка появляется медленно (>5 сек)

**Причина:** Медленный API или Huntflow

**Решение:**
1. Проверь Network tab — запрос должен занимать <2 сек
2. Если >2 сек — проблема в backend (Huntflow API медленный)
3. Проверь кэш: повторные загрузки должны быть быстрее

---

#### Проблема 4: После сохранения кнопка не переключается в "open"

**Причина:** Backend вернул ошибку или `app_url` пустой

**Решение:**
1. Проверь консоль: `[HRHelper] Saved! Final URL: ...`
2. Если нет — проверь Network tab на ошибки POST `/set-link/`
3. Проверь backend логи на ошибки

---

### Быстрый фикс

Если ничего не помогает:

1. **Перезагрузи расширение**:
   ```
   chrome://extensions → Reload
   ```

2. **Очисти кэш**:
   ```javascript
   // В консоли браузера
   localStorage.removeItem('hrhelper_thread_profile_map');
   ```

3. **Hard reload LinkedIn**:
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

4. **Проверь версию расширения**:
   - Должна быть v0.2.2 (с автоматической обработкой Huntflow URL)
   - Проверь `manifest.json`: `"version": "0.2.0"`

5. **Проверь, что backend запущен**:
   ```bash
   curl http://localhost:8000/api/health/
   # Должен вернуть 200 OK
   ```
