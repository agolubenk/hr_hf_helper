## Обработка Huntflow URL

### Проблема

Пользователь копирует ссылку из Huntflow в формате:
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

Но нам нужна ссылка с вакансией:
```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

### Решение

Backend **автоматически определяет последнюю вакансию** кандидата и возвращает правильную ссылку.

---

## Как это работает

### 1. Frontend (расширение)

Пользователь вставляет любую ссылку Huntflow:
```javascript
// Пример 1: без вакансии
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055

// Пример 2: с вакансией (уже правильная)
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

Расширение отправляет её на backend **как есть**.

---

### 2. Backend (API)

#### Шаг 1: Парсинг URL

```python
def _extract_huntflow_ids(self, url: str) -> dict:
    # Формат 1: /my/{account}#/applicants/filter/all/{applicant_id}
    # Формат 2: /my/{account}#/vacancy/{vacancy_id}/filter/{status}/id/{applicant_id}
    
    return {
        "account_name": "softnetix",
        "applicant_id": 79149055,
        "vacancy_id": None  # Нет вакансии!
    }
```

#### Шаг 2: Определение вакансии

Если `vacancy_id` отсутствует, запрашиваем Huntflow API:

```python
def _get_latest_vacancy_for_applicant(self, account_name: str, applicant_id: int):
    # 1. Получаем account_id по имени
    accounts = api.get_accounts()
    account = next((a for a in accounts if a.get('name') == account_name), None)
    
    # 2. Получаем статусы кандидата
    applicant_data = api.get_applicant(account_id, applicant_id)
    vacancies = applicant_data.get('vacancy_statuses', [])
    
    # 3. Фильтруем по статусу "в работе" (workon)
    vacancies_in_work = [
        v for v in vacancies 
        if v.get('status', {}).get('type') == 'workon'
    ]
    
    # 4. Берём последнюю по дате
    latest = sorted(vacancies_in_work, key=lambda x: x.get('changed', ''), reverse=True)[0]
    return latest.get('vacancy')  # 3936868
```

#### Шаг 3: Формирование правильного URL

```python
final_url = (
    f"https://huntflow.ru/my/{account_name}#/"
    f"vacancy/{vacancy_id}/filter/workon/id/{applicant_id}"
)
# https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

#### Шаг 4: Сохранение в БД

```python
LinkedInHuntflowLink.objects.update_or_create(
    user=request.user,
    linkedin_url=linkedin_url,
    defaults={"target_url": final_url}
)
```

---

### 3. Frontend (результат)

Backend возвращает:
```json
{
  "success": true,
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

Расширение:
1. Переключается в режим `"open"`
2. Показывает кнопку **"Huntflow"**
3. При клике открывает **правильную ссылку с вакансией**

---

## Поддерживаемые форматы URL

### Huntflow URL (автоматическая обработка):

✅ **Без вакансии** (определяется автоматически):
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
https://huntflow.ru/my/company#/applicants/filter/hired/12345
```

✅ **С вакансией** (используется как есть):
```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
https://huntflow.ru/my/company#/vacancy/123/filter/hired/id/456
```

### HRHelper URL (без изменений):

✅ **Внутренние ссылки**:
```
http://localhost:8000/huntflow/accounts/123/applicants/456/
/huntflow/accounts/123/applicants/456/
```

---

## Логика определения вакансии

### Приоритет 1: Вакансии со статусом "в работе" (workon)

```python
vacancies_in_work = [v for v in vacancies if v['status']['type'] == 'workon']
latest = sorted(vacancies_in_work, key=lambda x: x['changed'], reverse=True)[0]
```

### Приоритет 2: Любая последняя вакансия

Если нет вакансий "в работе", берём просто последнюю:
```python
latest = sorted(vacancies, key=lambda x: x['changed'], reverse=True)[0]
```

---

## Пример работы

### Сценарий 1: Кандидат в работе по одной вакансии

**Input:**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

**Backend:**
- Находит 1 вакансию со статусом "workon": `3936868`
- Формирует URL: `https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055`

**Output:**
```json
{
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

---

### Сценарий 2: Кандидат в работе по нескольким вакансиям

**Input:**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

**Backend:**
- Находит 3 вакансии со статусом "workon"
- Сортирует по дате изменения статуса
- Берёт последнюю: `3936868` (changed: 2026-01-15)

**Output:**
```json
{
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055"
}
```

---

### Сценарий 3: Кандидат нанят (hired)

**Input:**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
```

**Backend:**
- Нет вакансий со статусом "workon"
- Берёт последнюю вакансию (любой статус): `3936868` (hired)

**Output:**
```json
{
  "app_url": "https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/hired/id/79149055"
}
```

---

## Обработка ошибок

### Ошибка 1: Кандидат не найден

```python
applicant_data = api.get_applicant(account_id, applicant_id)
if not applicant_data:
    return None  # Вакансия не определена
```

**Результат**: Сохраняется исходный URL без изменений.

---

### Ошибка 2: Нет вакансий

```python
vacancies = applicant_data.get('vacancy_statuses', [])
if not vacancies:
    return None
```

**Результат**: Сохраняется исходный URL без изменений.

---

### Ошибка 3: API недоступен

```python
try:
    vacancy_id = self._get_latest_vacancy_for_applicant(...)
except Exception as e:
    logging.error(f"Error: {e}")
    return None
```

**Результат**: Сохраняется исходный URL без изменений.

---

## UI/UX

### Индикатор загрузки

При клике на "Сохранить":
```
[Сохранение...] (disabled)
```

### Успешное сохранение

После обработки backend:
```
[Huntflow] ← кнопка (синяя)
```

Console:
```
[HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

---

## Тестирование

### 1. Вставить URL без вакансии

```
Input: https://huntflow.ru/my/softnetix#/applicants/filter/all/79149055
Expected: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```

### 2. Вставить URL с вакансией

```
Input: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
Expected: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
(без изменений)
```

### 3. Вставить HRHelper URL

```
Input: http://localhost:8000/huntflow/accounts/123/applicants/456/
Expected: http://localhost:8000/huntflow/accounts/123/applicants/456/
(без изменений)
```

### 4. Проверить консоль

```
[HRHelper] Saved! Final URL: https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79149055
```
