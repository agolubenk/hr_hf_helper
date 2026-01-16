# Тестирование исправления Huntflow URL

## Проблема
При вставке Huntflow URL в формате `https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055` backend должен автоматически определить последнюю вакансию и сохранить правильный URL в формате `https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055`.

## Что исправлено

### Backend (`apps/huntflow/views_api.py`)

1. **`_get_latest_vacancy_for_applicant` теперь возвращает `(account_id, vacancy_id)`**
   - Раньше: возвращал только `vacancy_id`
   - Теперь: возвращает кортеж `(account_id, vacancy_id)`
   - Это позволяет сохранить `account_id` в БД

2. **`set_link` теперь извлекает `applicant_id` из Huntflow URL**
   - Раньше: `applicant_id` оставался `None` для Huntflow URL
   - Теперь: извлекается из `huntflow_ids["applicant_id"]`

3. **`set_link` теперь сохраняет `account_id` из API**
   - Раньше: `account_id` оставался `None`
   - Теперь: получается из `_get_latest_vacancy_for_applicant`

## Как протестировать

### Шаг 1: Перезапусти backend (если нужно)

```bash
cd backend
python3 manage.py runserver
```

### Шаг 2: Включи логирование

В консоли backend должны появляться логи:

```
INFO Huntflow URL detected: account=softnetix, applicant=79149055
INFO Getting vacancy for account=softnetix, applicant=79149055
INFO Found 1 accounts
INFO Account ID: 659
INFO Found 3 vacancies for applicant
INFO Found 1 vacancies with status 'workon'
INFO Latest vacancy (workon): 3936868
INFO Account ID: 659, Vacancy ID: 3936868
INFO Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

### Шаг 3: Перезагрузи расширение

```
chrome://extensions → Reload (⟳)
```

### Шаг 4: Открой профиль lesik507

```
https://www.linkedin.com/in/lesik507/
```

### Шаг 5: Нажми на кнопку редактирования ✏️

Должно появиться:

```
┌─────────────────────────────────────────┬──────────────┬──────────┐
│ https://huntflow.ru/my/softnetix#/...   │  Сохранить   │  Отмена  │
└─────────────────────────────────────────┴──────────────┴──────────┘
```

### Шаг 6: Вставь Huntflow URL (любой формат)

**Вариант 1: Формат без вакансии**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

**Вариант 2: Формат с вакансией (но неправильной)**
```
https://huntflow.ru/my/softnetix#/vacancy/1234567/filter/all/id/79149055
```

### Шаг 7: Нажми "Сохранить"

**Ожидаемое поведение:**

1. **Frontend:**
   - Кнопка "Сохранить" становится disabled
   - Текст меняется на "Сохранение..."

2. **Backend логи:**
   ```
   INFO Huntflow URL detected: account=softnetix, applicant=79149055
   INFO Getting vacancy for account=softnetix, applicant=79149055
   INFO Found 1 accounts
   INFO Account ID: 659
   INFO Found 3 vacancies for applicant
   INFO Found 1 vacancies with status 'workon'
   INFO Latest vacancy (workon): 3936868
   INFO Account ID: 659, Vacancy ID: 3936868
   INFO Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
   ```

3. **Frontend:**
   - Возвращается режим просмотра
   - Кнопка "Huntflow" + кнопка ✏️

4. **База данных:**
   - `target_url` = `https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055`
   - `account_id` = `659`
   - `applicant_id` = `79149055`

### Шаг 8: Проверь в базе данных

```bash
cd backend
python3 manage.py shell
```

```python
from apps.huntflow.models import LinkedInHuntflowLink
from apps.accounts.models import User

user = User.objects.first()
link = LinkedInHuntflowLink.objects.get(
    user=user, 
    linkedin_url="https://www.linkedin.com/in/lesik507/"
)

print(f"Target URL: {link.target_url}")
print(f"Account ID: {link.account_id}")
print(f"Applicant ID: {link.applicant_id}")
```

**Ожидаемый вывод:**
```
Target URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
Account ID: 659
Applicant ID: 79149055
```

## Возможные проблемы

### Проблема 1: Кандидат не найден в Huntflow

**Логи:**
```
ERROR Ошибка API: 404 - {"errors":[{"type":"not_found","title":"Applicant not found"}]}
WARNING Applicant 79149055 not found
```

**Причина:** ID кандидата `79149055` не существует в sandbox API.

**Решение:**
1. Используй production API (если у тебя есть доступ)
2. Или используй правильный ID из sandbox
3. Или вставь ссылку с правильным ID

### Проблема 2: Вакансия не определилась

**Логи:**
```
WARNING Vacancy ID is None, using original URL
```

**Причина:** У кандидата нет вакансий со статусом "workon" и нет вакансий вообще.

**Решение:** Это нормально, backend сохранит оригинальный URL.

### Проблема 3: Account не найден

**Логи:**
```
WARNING Account 'softnetix' not found
```

**Причина:** Неправильное имя аккаунта или нет доступа.

**Решение:** Проверь, что в Huntflow есть аккаунт с таким именем.

## Отладка

### Проверь API вручную

**1. Получи токен:**
```
http://localhost:8000/api/v1/accounts/users/token/
```

**2. Проверь статус:**
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/v1/huntflow/linkedin-applicants/status/?linkedin_url=https://www.linkedin.com/in/lesik507/"
```

**3. Сохрани ссылку:**
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"linkedin_url":"https://www.linkedin.com/in/lesik507/","target_url":"https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055"}' \
  http://localhost:8000/api/v1/huntflow/linkedin-applicants/set-link/
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "exists": true,
  "linkedin_url": "https://www.linkedin.com/in/lesik507/",
  "target_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055",
  "account_id": 659,
  "applicant_id": 79149055,
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

## Итог

После исправления:
- ✅ `applicant_id` извлекается из Huntflow URL
- ✅ `account_id` получается из Huntflow API
- ✅ `final_url` формируется с правильной вакансией
- ✅ Все данные сохраняются в БД
