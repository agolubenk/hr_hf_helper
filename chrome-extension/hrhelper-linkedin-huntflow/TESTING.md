## Тестирование расширения HRHelper LinkedIn → Huntflow

### Подготовка

1. **Backend запущен** на `http://localhost:8000`
2. **Залогинен** в HRHelper в том же профиле Chrome
3. **API Token** получен и указан в настройках расширения:
   ```
   http://localhost:8000/api/v1/accounts/users/token/
   ```
4. **Расширение загружено** через `chrome://extensions` (Developer mode → Load unpacked)

### Сценарий 1: Профиль LinkedIn (новый кандидат)

1. Открой любой профиль LinkedIn: `https://www.linkedin.com/in/username/`
2. **Ожидаемый результат**:
   - Рядом с кнопкой "Ещё" (More) появляется **инпут** + кнопка "Сохранить"
   - Placeholder: "Ссылка на кандидата в Huntflow"
3. Вставь ссылку на кандидата (например, `http://localhost:8000/huntflow/accounts/123/applicants/456/`)
4. Нажми **Сохранить**
5. **Ожидаемый результат**:
   - Инпут исчезает
   - Появляется кнопка **"Huntflow"** (синяя)
   - При клике открывается карточка кандидата в новой вкладке

### Сценарий 2: Профиль LinkedIn (существующий кандидат)

1. Открой профиль, для которого уже сохранена связка в БД
2. **Ожидаемый результат**:
   - Сразу появляется кнопка **"Huntflow"** (без инпута)
   - При клике открывается карточка кандидата

### Сценарий 3: Страница сообщений LinkedIn (thread mapping)

**Подготовка:**
1. Открой профиль кандидата: `https://www.linkedin.com/in/username/`
2. Расширение автоматически сохранит `thread_id` (если есть кнопка "Message")
3. Проверь консоль (F12): должно быть `[HRHelper] Found thread: 2-ABC...`

**Тест:**
1. Открой переписку с этим кандидатом: `https://www.linkedin.com/messaging/thread/2-ABC.../`
2. **Ожидаемый результат**:
   - **Над формой ввода сообщения** (там, где пишешь текст) появляется блок с кнопкой/инпутом
   - Блок имеет светло-серый фон (`#f3f6f8`) и отделён бордером снизу
   - Расширение находит `profile_url` через сохранённый `thread_id`
   - Показывает ту же кнопку/инпут, что и на профиле
   - Консоль: `[HRHelper] Profile from cache: https://linkedin.com/in/username/` или `[HRHelper] Profile from backend: ...`
3. Если кандидат есть в базе — кнопка **"Huntflow"** (клик открывает карточку)
4. Если кандидата нет — инпут + кнопка "Сохранить"

### Сценарий 4: Ошибка авторизации

1. Удали API Token из настроек расширения
2. Открой любой профиль LinkedIn
3. **Ожидаемый результат**:
   - Появляется **инпут** (disabled)
   - Placeholder: "Нужна авторизация (проверь API Token в настройках расширения)"
   - Кнопка "Сохранить" неактивна (opacity: 0.6)

### Проверка производительности

1. Открой консоль (F12) → Network
2. Открой профиль LinkedIn
3. **Ожидаемый результат**:
   - Максимум **1 запрос** к `/api/v1/huntflow/linkedin-applicants/status/`
   - Никаких повторных запросов при скролле/мутациях DOM
4. Открой консоль → Console
5. **НЕ должно быть**:
   - Ошибок `chrome-extension://invalid/`
   - Бесконечных циклов MutationObserver
   - Множественных запросов к API

### Проверка thread mapping (backend)

**Через Django shell:**
```python
python3 manage.py shell

from apps.huntflow.models import LinkedInThreadProfile
from apps.accounts.models import User

user = User.objects.first()
LinkedInThreadProfile.objects.filter(user=user)
# Должны быть записи с thread_id и profile_url
```

**Через API (curl):**
```bash
# Сохранить маппинг
curl -X POST http://localhost:8000/api/v1/linkedin/thread-mapping/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"thread_id": "2-ABC123", "profile_url": "https://linkedin.com/in/test/"}'

# Получить маппинг
curl http://localhost:8000/api/v1/linkedin/thread-mapping/?thread_id=2-ABC123 \
  -H "Authorization: Token YOUR_TOKEN"
```

### Troubleshooting

**Кнопки не появляются:**
- Проверь консоль на ошибки
- Убедись, что API Token указан
- Перезагрузи расширение: `chrome://extensions` → Reload
- Проверь, что backend доступен: `curl http://localhost:8000/api/v1/accounts/users/token/`

**Thread mapping не работает:**
- Открой профиль кандидата (не /messaging/)
- Убедись, что есть кнопка "Message" на странице
- Проверь консоль: должно быть `[HRHelper] Found thread: ...`
- Проверь localStorage: `localStorage.getItem('hrhelper_thread_profile_map')`

**LinkedIn блокирует/тормозит:**
- Это было исправлено в последней версии (throttle 3 сек, DOM создаётся один раз)
- Если проблема осталась — сообщи в issue с логами консоли
