# Диагностика: Huntflow URL не обрабатывается

## Проблема

Вставляешь:
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

Сохраняется:
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

Ожидается:
```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

---

## Шаг 1: Проверь backend логи

### Запусти backend с выводом логов:

```bash
cd backend
python3 manage.py runserver
```

### Вставь ссылку в расширении и смотри логи

Должно быть примерно так:

```
INFO Huntflow URL detected: account=softnetix, applicant=79149055
INFO Getting vacancy for account=softnetix, applicant=79149055
INFO Found 1 accounts
INFO Account ID: 123
INFO Found 3 vacancies for applicant
INFO Found 1 vacancies with status 'workon'
INFO Latest vacancy (workon): 3936868
INFO Vacancy ID determined: 3936868
INFO Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

---

## Возможные проблемы

### ❌ Проблема 1: Account не найден

```
WARNING Account 'softnetix' not found
WARNING Vacancy ID is None, using original URL
```

**Причина:** Имя аккаунта в Huntflow отличается от того, что в URL

**Решение:**
1. Проверь имя аккаунта в Huntflow (должно совпадать с URL)
2. Или вставь полный URL с vacancy_id:
   ```
   https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
   ```

---

### ❌ Проблема 2: Applicant не найден

```
WARNING Applicant 79149055 not found
WARNING Vacancy ID is None, using original URL
```

**Причина:** Кандидат не существует в Huntflow или ID неверный

**Решение:**
1. Проверь ID кандидата в Huntflow
2. Убедись, что у тебя есть доступ к этому аккаунту

---

### ❌ Проблема 3: Нет вакансий

```
INFO Found 0 vacancies for applicant
WARNING No vacancies found
WARNING Vacancy ID is None, using original URL
```

**Причина:** У кандидата нет вакансий (ещё не добавлен ни на одну)

**Решение:**
- Добавь кандидата на вакансию в Huntflow
- Или используй исходный URL (он сохранится как есть)

---

### ❌ Проблема 4: Ошибка API

```
ERROR Error getting vacancy for applicant 79149055: ...
WARNING Could not determine vacancy for applicant 79149055: ...
```

**Причина:** Huntflow API недоступен или вернул ошибку

**Решение:**
1. Проверь, что Huntflow API токены настроены в базе
2. Проверь логи на полный traceback ошибки
3. Попробуй позже (Huntflow API может быть временно недоступен)

---

### ❌ Проблема 5: URL не распознан как Huntflow

```
(нет логов "Huntflow URL detected")
```

**Причина:** URL не соответствует ожидаемому формату

**Решение:**
Проверь формат URL. Должен быть:
```
https://huntflow.ru/my/{account}#/applicants/filter/{status}/{applicant_id}
```

Примеры правильных URL:
```
✅ https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
✅ https://huntflow.ru/my/company#/applicants/filter/hired/12345
❌ https://huntflow.ru/applicants/79149055 (неправильный формат)
❌ https://huntflow.com/my/softnetix#/... (неправильный домен)
```

---

## Шаг 2: Проверь Django shell

```python
python3 manage.py shell

from apps.huntflow.models import LinkedInHuntflowLink
from apps.accounts.models import User

user = User.objects.first()

# Найди последнюю сохранённую ссылку
link = LinkedInHuntflowLink.objects.filter(user=user).order_by('-created_at').first()

print(f"LinkedIn: {link.linkedin_url}")
print(f"Target: {link.target_url}")

# Должно быть:
# Target: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

---

## Шаг 3: Ручной тест API

```bash
curl -X POST http://localhost:8000/api/v1/huntflow/linkedin-applicants/set-link/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin_url": "https://linkedin.com/in/test/",
    "target_url": "https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055"
  }'
```

**Ожидаемый response:**
```json
{
  "success": true,
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

**Если app_url совпадает с target_url:**
- Проверь backend логи (см. Шаг 1)
- Вакансия не определилась

---

## Шаг 4: Проверь Huntflow API токены

```python
python3 manage.py shell

from apps.accounts.models import User
from logic.integration.huntflow.huntflow_api import HuntflowAPI

user = User.objects.first()
api = HuntflowAPI(user=user)

# Проверь, что API работает
accounts = api.get_accounts()
print(f"Accounts: {len(accounts)}")

# Проверь конкретный аккаунт
account = next((a for a in accounts if a.get('name') == 'softnetix'), None)
print(f"Account: {account}")

# Проверь кандидата
if account:
    applicant = api.get_applicant(account['id'], 79149055)
    print(f"Applicant: {applicant.get('id') if applicant else None}")
    print(f"Vacancies: {len(applicant.get('vacancy_statuses', []))}")
```

---

## Быстрый фикс

Если ничего не помогает, используй **полный URL с vacancy_id**:

```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

Такой URL сохранится как есть (без обработки).

---

## Отправь мне логи

Скопируй **backend логи** (из `python3 manage.py runserver`) после вставки ссылки:

```
INFO Huntflow URL detected: ...
INFO Getting vacancy for account=...
...
```

Также отправь:
- URL который вставляешь
- URL который сохранился
- Имя аккаунта в Huntflow
- ID кандидата
