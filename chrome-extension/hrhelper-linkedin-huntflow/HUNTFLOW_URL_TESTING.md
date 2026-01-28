## Тестирование автоматической обработки Huntflow URL

### Подготовка

1. **Backend запущен** на `http://localhost:8000`
2. **Huntflow API настроен** (токены в базе)
3. **Расширение загружено** и настроено (API Token указан)

---

### Тест 1: URL без вакансии (автоматическое определение)

**Шаги:**
1. Открой профиль LinkedIn: `https://www.linkedin.com/in/username/`
2. Скопируй ссылку из Huntflow (без вакансии):
   ```
   https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
   ```
3. Вставь в инпут расширения
4. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Кнопка меняется на "Сохранение..." (disabled)
- Через 1-2 сек появляется кнопка **"Huntflow"** (синяя)
- Консоль (F12):
  ```
  [HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
  ```
- При клике на кнопку открывается **правильная ссылка с вакансией**

---

### Тест 2: URL с вакансией (без изменений)

**Шаги:**
1. Открой профиль LinkedIn
2. Вставь ссылку с вакансией:
   ```
   https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
   ```
3. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Кнопка **"Huntflow"** появляется сразу
- Консоль:
  ```
  [HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
  ```
- URL **не изменился** (уже правильный)

---

### Тест 3: Кандидат с несколькими вакансиями

**Подготовка:**
- Кандидат должен быть в работе по 2+ вакансиям в Huntflow

**Шаги:**
1. Вставь URL без вакансии:
   ```
   https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
   ```
2. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Backend выбирает **последнюю** вакансию по дате изменения статуса
- Консоль:
  ```
  [HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
  ```

---

### Тест 4: Кандидат без вакансий "в работе"

**Подготовка:**
- Кандидат имеет вакансии, но все со статусом "hired" или "rejected"

**Шаги:**
1. Вставь URL без вакансии
2. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Backend берёт **последнюю вакансию** (любой статус)
- Консоль:
  ```
  [HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/hired/id/79149055
  ```

---

### Тест 5: HRHelper URL (без изменений)

**Шаги:**
1. Вставь внутреннюю ссылку:
   ```
   http://localhost:8000/huntflow/accounts/123/applicants/456/
   ```
2. Нажми **"Сохранить"**

**Ожидаемый результат:**
- URL **не изменился**
- Консоль:
  ```
  [HRHelper] Saved! Final URL: http://localhost:8000/huntflow/accounts/123/applicants/456/
  ```

---

### Тест 6: Ошибка API (Huntflow недоступен)

**Подготовка:**
- Отключи Huntflow API (удали токены или заблокируй сеть)

**Шаги:**
1. Вставь URL без вакансии
2. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Кнопка "Сохранение..." → "Huntflow"
- URL сохраняется **как есть** (без определения вакансии)
- Консоль:
  ```
  [HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
  ```
- Backend логирует ошибку (не падает)

---

### Тест 7: Страница /messaging/

**Шаги:**
1. Открой профиль кандидата (сохрани thread mapping)
2. Открой `/messaging/thread/...`
3. Вставь Huntflow URL без вакансии
4. Нажми **"Сохранить"**

**Ожидаемый результат:**
- Всё работает так же, как на странице профиля
- Кнопка появляется **над формой ввода**

---

## Проверка backend

### Django shell

```python
python3 manage.py shell

from apps.huntflow.models import LinkedInHuntflowLink
from apps.accounts.models import User

user = User.objects.first()
links = LinkedInHuntflowLink.objects.filter(user=user)

for link in links:
    print(f"{link.linkedin_url} -> {link.target_url}")

# Должны быть URL с вакансиями:
# https://linkedin.com/in/john-doe/ -> https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

### API curl

```bash
# Сохранить ссылку без вакансии
curl -X POST http://localhost:8000/api/v1/huntflow/linkedin-applicants/set-link/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin_url": "https://linkedin.com/in/test/",
    "target_url": "https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055"
  }'

# Response:
{
  "success": true,
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

---

## Troubleshooting

### Вакансия не определяется

**Проблема:** Backend возвращает URL без изменений

**Решение:**
1. Проверь, что Huntflow API настроен (токены в базе)
2. Проверь, что кандидат существует в Huntflow
3. Проверь логи Django:
   ```
   tail -f backend/logs/django.log
   ```
4. Проверь консоль браузера на ошибки API

### Неправильная вакансия

**Проблема:** Backend возвращает не ту вакансию

**Решение:**
1. Проверь статусы кандидата в Huntflow (должен быть "в работе")
2. Проверь дату изменения статуса (берётся последняя)
3. Если нужна конкретная вакансия — вставь полный URL с `vacancy_id`

### Медленное сохранение

**Проблема:** Кнопка "Сохранение..." висит долго

**Решение:**
1. Huntflow API может быть медленным (особенно при первом запросе)
2. Проверь Network tab (F12) — запрос должен занимать <3 сек
3. Backend кэширует результаты Huntflow API (следующие запросы быстрее)
