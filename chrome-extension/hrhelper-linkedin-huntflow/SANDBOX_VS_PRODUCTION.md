# Sandbox vs Production: Почему не работает автоопределение вакансии

## Проблема

При вставке Huntflow URL сохраняется **оригинальный формат** вместо формата с вакансией:

**Вставляешь:**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79251855
```

**Ожидаешь:**
```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79251855
```

**Получаешь:**
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79251855  ← без изменений
```

## Причина

Твой backend использует **Sandbox API** (`sandbox-api.huntflow.dev`), а ID кандидата `79251855` существует только в **Production** Huntflow.

### Что происходит:

1. **Frontend** отправляет URL на backend
2. **Backend** извлекает `applicant_id = 79251855`
3. **Backend** пытается запросить кандидата из Huntflow API:
   ```
   GET https://sandbox-api.huntflow.dev/v2/accounts/659/applicants/79251855
   ```
4. **Huntflow API** возвращает **404 Not Found**
5. **Backend** не может определить вакансию
6. **Backend** сохраняет **оригинальный URL** без изменений

### Backend логи:

```
INFO Huntflow URL detected: account=softnetix, applicant=79251855
INFO Getting vacancy for account=softnetix, applicant=79251855
INFO Found 1 accounts
INFO Account ID: 659
WARNING Applicant 79251855 not found in Huntflow (404). Возможно, это ID из production, а используется sandbox.
WARNING Vacancy ID is None (кандидат не найден или нет вакансий), using original URL
```

## Решения

### **Решение 1: Используй ID из Sandbox** ✅ (Рекомендуется)

Найди реального кандидата в **sandbox** Huntflow:

1. Открой Huntflow sandbox: `https://huntflow.ru/my/softnetix` (с sandbox API ключом)
2. Найди любого кандидата
3. Скопируй его URL (например, `https://huntflow.ru/my/softnetix#/applicants/filter/all/12345`)
4. Вставь этот URL в расширение
5. Backend автоматически определит вакансию

**Преимущество:** Работает сразу, не нужно менять настройки.

---

### **Решение 2: Переключись на Production API** ✅

Если у тебя есть доступ к production Huntflow API:

#### Шаг 1: Проверь текущие настройки

```bash
cd backend
python3 manage.py shell
```

```python
from apps.accounts.models import User
user = User.objects.first()

# Проверь, какие поля есть у пользователя
print(dir(user))
# Ищи что-то вроде huntflow_prod_url, huntflow_sandbox_url, huntflow_active_system
```

#### Шаг 2: Найди, где переключается система

```bash
# Ищем в коде
grep -r "huntflow_active_system\|huntflow_prod_url" backend/apps/
```

#### Шаг 3: Переключи на production

Обычно это делается через:
- Настройки профиля в веб-интерфейсе
- Или напрямую в БД

**Преимущество:** Все ID из production Huntflow будут работать.

---

### **Решение 3: Вставляй готовый URL с вакансией** ✅

Вместо URL без вакансии:
```
https://huntflow.ru/my/softnetix#/applicants/filter/all/79251855
```

Вставляй сразу **полный URL** с вакансией:
```
https://huntflow.ru/my/softnetix#/vacancy/3936868/filter/workon/id/79251855
```

Backend увидит, что `vacancy_id` уже есть, и **не будет** пытаться определить вакансию автоматически.

**Как получить полный URL:**
1. Открой кандидата в Huntflow
2. Перейди на нужную вакансию
3. Скопируй URL из адресной строки
4. Вставь в расширение

**Преимущество:** Работает с любым API (sandbox или production).

---

## Как проверить, какой API используется

### Вариант 1: Через backend логи

Запусти backend:
```bash
cd backend
python3 manage.py runserver
```

Открой профиль в LinkedIn и посмотри логи. Будет видно:
```
🔍 API запрос: GET https://sandbox-api.huntflow.dev/v2/accounts
                        ^^^^^^^^^^^^^^^^^^^^^^^^
                        Это sandbox!
```

Или:
```
🔍 API запрос: GET https://api.huntflow.ru/v2/accounts
                        ^^^^^^^^^^^^^^^^^
                        Это production!
```

### Вариант 2: Через код

```bash
cd backend
python3 manage.py shell
```

```python
from apps.huntflow.services import HuntflowService
from apps.accounts.models import User

user = User.objects.first()
service = HuntflowService(user=user)

# Проверь базовый URL
print("Base URL:", service._get_base_url())

# Если содержит "sandbox" — это sandbox
# Если содержит "api.huntflow.ru" — это production
```

---

## Рекомендация

**Для разработки:** Используй **Решение 1** (ID из sandbox)
- Быстро
- Не нужно менять настройки
- Безопасно (не трогаешь production данные)

**Для production:** Используй **Решение 2** (переключись на production API)
- Все ID из реального Huntflow работают
- Автоопределение вакансии работает для всех кандидатов

**Временное решение:** Используй **Решение 3** (вставляй полный URL)
- Работает всегда
- Но нужно копировать полный URL вручную

---

## Итог

**Проблема не в коде!** ✅

Код работает правильно:
- ✅ Извлекает `applicant_id` из URL
- ✅ Запрашивает Huntflow API
- ✅ Определяет последнюю вакансию
- ✅ Формирует правильный URL

**Проблема в данных:**
- ❌ Кандидат `79251855` не существует в sandbox API
- ❌ Backend не может получить вакансии (404)
- ❌ Сохраняется оригинальный URL

**Решение:**
- Используй ID из sandbox
- Или переключись на production API
- Или вставляй полный URL с вакансией
