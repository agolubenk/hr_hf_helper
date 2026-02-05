# Performance & Scalability Specification

## Общее описание

Документ описывает требования к производительности и масштабируемости системы HR Helper, включая пагинацию, rate limiting, кэширование, оптимизацию базы данных и обработку конкурентных запросов.

## 1. Pagination (Пагинация)

### 1.1 Стратегия пагинации

**Используется:** Offset-based pagination (для простоты и совместимости)

**Альтернатива:** Cursor-based pagination (для больших наборов данных, планируется)

### 1.2 Параметры пагинации

**Query параметры:**
- `page` (integer, опционально) - номер страницы (начиная с 1)
- `page_size` (integer, опционально) - количество элементов на странице

**Значения по умолчанию:**
- `page`: 1
- `page_size`: 20

**Ограничения:**
- Минимальный `page_size`: 1
- Максимальный `page_size`: 100
- Если указан `page_size` > 100 → возвращается ошибка `INVALID_PARAMETER`

### 1.3 Формат ответа

**Структура:**
```json
{
  "results": [
    // Массив элементов
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

**Пример запроса:**
```http
GET /api/vacancies/?page=2&page_size=50
```

**Пример ответа:**
```json
{
  "results": [
    {
      "id": "vac_1",
      "title": "Senior Developer"
    },
    // ... еще 48 элементов
  ],
  "pagination": {
    "page": 2,
    "page_size": 50,
    "total_count": 150,
    "total_pages": 3,
    "has_next": true,
    "has_previous": true
  }
}
```

### 1.4 Cursor-based pagination (будущее)

**Для больших наборов данных (>10,000 записей):**

```json
{
  "results": [...],
  "pagination": {
    "cursor": "eyJpZCI6InZhY18xMjMifQ==",
    "has_next": true,
    "next_cursor": "eyJpZCI6InZhY18xMjQifQ=="
  }
}
```

## 2. Rate Limiting

### 2.1 Лимиты по пользователю

**Общий лимит:**
- **1000 запросов в час** на пользователя
- **100 запросов в минуту** на пользователя

**Исключения:**
- Admin: без ограничений
- HR Manager: 2000 запросов в час

### 2.2 Лимиты по эндпоинту

**Строгие лимиты (критичные операции):**

| Эндпоинт | Лимит | Период |
|----------|-------|--------|
| `POST /api/auth/login` | 5 | 1 минута |
| `POST /api/auth/verify-2fa` | 10 | 1 минута |
| `POST /api/candidates/` | 50 | 1 минута |
| `POST /api/vacancies/` | 20 | 1 минута |
| `PUT /api/vacancies/{id}/` | 30 | 1 минута |

**Мягкие лимиты (обычные операции):**

| Эндпоинт | Лимит | Период |
|----------|-------|--------|
| `GET /api/vacancies/` | 200 | 1 минута |
| `GET /api/candidates/` | 200 | 1 минута |
| `GET /api/interviews/` | 100 | 1 минута |

### 2.3 Backoff стратегия

**При превышении лимита:**

**HTTP Headers:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995260
```

**Ответ:**
```json
{
  "status": 429,
  "error_code": "RATE_LIMITED",
  "message": "Rate limit exceeded. Please try again later.",
  "retry_after": 60,
  "rate_limit_info": {
    "limit": 1000,
    "remaining": 0,
    "reset_at": "2026-01-28T19:01:00Z"
  }
}
```

**Клиентская обработка:**
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await delay(parseInt(retryAfter) * 1000);
  return retryRequest();
}
```

## 3. Caching (Кэширование)

### 3.1 Что кэшируется

**Списки (TTL: 5 минут):**
- Список вакансий (с фильтрами)
- Список кандидатов (с фильтрами)
- Список интервьюеров
- Список отделов

**Детальные данные (TTL: 10 минут):**
- Детали вакансии
- Детали кандидата
- Детали пользователя

**Справочники (TTL: 1 час):**
- Список этапов workflow
- Причины отказа
- Настройки компании

**Данные профиля пользователя (TTL: 10–15 минут):**
- Профиль пользователя (`user:{id}`)
- Список быстрых кнопок (`user_quick_buttons:{user_id}`)
- Статус интеграций пользователя (`user_integrations_status:{user_id}`)
- При изменении профиля/быстрых кнопок/интеграций — инвалидация по ключу пользователя. Детальная логика страницы профиля — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) (раздел 10.26).

**Статические данные (TTL: 24 часа):**
- Список грейдов
- Список локаций
- Список навыков

### 3.2 Стратегия кэширования

**Используется:** Redis

**Ключи кэша:**
```
vacancy:{id}
vacancy_list:{company_id}:{filters_hash}
candidate:{id}
candidate_list:{vacancy_id}:{filters_hash}
user:{id}
stages:{company_id}
```

**Пример:**
```python
def get_vacancy(vacancy_id):
    cache_key = f"vacancy:{vacancy_id}"
    
    # Попытка получить из кэша
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Получение из БД
    vacancy = Vacancy.objects.get(id=vacancy_id)
    
    # Сохранение в кэш
    redis.setex(cache_key, 600, json.dumps(vacancy.to_dict()))
    
    return vacancy
```

### 3.3 Инвалидация кэша

**Автоматическая инвалидация при изменении:**

```python
def update_vacancy(vacancy_id, data):
    # Обновление в БД
    vacancy = Vacancy.objects.get(id=vacancy_id)
    vacancy.update(data)
    
    # Инвалидация кэша
    cache_key = f"vacancy:{vacancy_id}"
    redis.delete(cache_key)
    
    # Инвалидация списков
    pattern = f"vacancy_list:{vacancy.company_id}:*"
    for key in redis.scan_iter(match=pattern):
        redis.delete(key)
```

**Ручная инвалидация:**
- Через административную панель
- При изменении настроек компании

## 4. Database Optimization

### 4.1 Ожидаемые объемы данных

**Оценка на 1 год работы:**

| Таблица | Ожидаемое количество записей |
|---------|------------------------------|
| `users` | 10,000 |
| `companies` | 100 |
| `vacancies` | 5,000 |
| `candidates` | 50,000 |
| `interviews` | 20,000 |
| `telegram_messages` | 1,000,000 |
| `audit_logs` | 500,000 |

### 4.2 Целевые показатели производительности

**Query Performance Targets:**

| Тип запроса | Целевое время | Максимальное время |
|-------------|---------------|-------------------|
| Простой SELECT (по индексу) | <10ms | <50ms |
| SELECT с JOIN (2-3 таблицы) | <50ms | <200ms |
| SELECT с агрегацией | <100ms | <500ms |
| INSERT/UPDATE | <20ms | <100ms |
| DELETE | <30ms | <150ms |

### 4.3 Индексы

**Критичные индексы (уже созданы в схеме):**

```sql
-- Часто используемые запросы
CREATE INDEX idx_candidates_vacancy_stage ON candidates(vacancy_id, current_stage_id);
CREATE INDEX idx_interviews_date_status ON interviews(scheduled_date, status);
CREATE INDEX idx_vacancies_company_status ON vacancies(company_id, status);
CREATE INDEX idx_telegram_messages_chat_date ON telegram_messages(chat_id, created_at DESC);
```

**Дополнительные индексы для оптимизации:**

```sql
-- Поиск кандидатов по email
CREATE INDEX idx_candidates_email_vacancy ON candidates(email, vacancy_id);

-- Поиск интервью по интервьюеру и дате
CREATE INDEX idx_interviews_interviewer_date ON interviews(interviewer_id, scheduled_date);

-- Поиск вакансий по владельцу и статусу
CREATE INDEX idx_vacancies_owner_status ON vacancies(owner_id, status);

-- Аудит по типу сущности и дате
CREATE INDEX idx_audit_logs_entity_date ON audit_logs(entity_type, entity_id, created_at DESC);
```

### 4.4 Оптимизация запросов

**Избегать N+1 запросов:**

**Плохо:**
```python
vacancies = Vacancy.objects.all()
for vacancy in vacancies:
    candidates = Candidate.objects.filter(vacancy_id=vacancy.id)  # N+1
```

**Хорошо:**
```python
vacancies = Vacancy.objects.prefetch_related('candidates').all()
for vacancy in vacancies:
    candidates = vacancy.candidates.all()  # Уже загружено
```

**Использование select_related для JOIN:**

```python
# Плохо
candidates = Candidate.objects.all()
for candidate in candidates:
    vacancy = Vacancy.objects.get(id=candidate.vacancy_id)  # N+1

# Хорошо
candidates = Candidate.objects.select_related('vacancy').all()
for candidate in candidates:
    vacancy = candidate.vacancy  # Уже загружено
```

## 5. Concurrency (Конкурентность)

### 5.1 Ожидаемая нагрузка

**Одновременные пользователи:**
- **Нормальная нагрузка:** 100 пользователей
- **Пиковая нагрузка:** 500 пользователей
- **Максимальная нагрузка:** 1,000 пользователей

**Одновременные API запросы:**
- **Нормальная нагрузка:** 50 запросов/сек
- **Пиковая нагрузка:** 200 запросов/сек
- **Максимальная нагрузка:** 500 запросов/сек

### 5.2 Connection Pool

**Настройки пула соединений:**

```python
DATABASE_POOL = {
    'min_connections': 5,
    'max_connections': 20,
    'connection_timeout': 30,
    'idle_timeout': 300
}
```

**Redis Connection Pool:**

```python
REDIS_POOL = {
    'max_connections': 50,
    'retry_on_timeout': True,
    'socket_keepalive': True
}
```

### 5.3 Обработка конкурентных изменений

**Optimistic Locking (оптимистическая блокировка):**

```python
class Vacancy(models.Model):
    version = models.IntegerField(default=0)
    
    def update(self, data):
        # Проверка версии
        current_version = self.version
        self.refresh_from_db()
        
        if self.version != current_version:
            raise ConflictError("Vacancy was modified by another user")
        
        # Обновление
        for key, value in data.items():
            setattr(self, key, value)
        self.version += 1
        self.save()
```

**Pessimistic Locking (пессимистическая блокировка) для критичных операций:**

```python
def change_candidate_stage(candidate_id, new_stage_id):
    with transaction.atomic():
        candidate = Candidate.objects.select_for_update().get(id=candidate_id)
        # Изменение этапа
        candidate.current_stage_id = new_stage_id
        candidate.save()
```

## 6. Мониторинг производительности

### 6.1 Метрики

**Отслеживаемые метрики:**

1. **Response Time:**
   - Среднее время ответа
   - P50, P95, P99 перцентили
   - Максимальное время ответа

2. **Throughput:**
   - Запросов в секунду
   - Успешных запросов
   - Неудачных запросов

3. **Database:**
   - Время выполнения запросов
   - Количество медленных запросов (>500ms)
   - Использование connection pool

4. **Cache:**
   - Hit rate (процент попаданий в кэш)
   - Miss rate (процент промахов)
   - Использование памяти Redis

### 6.2 Алерты

**Критичные алерты:**

- Response time P95 > 1 секунда
- Error rate > 5%
- Database connection pool exhaustion
- Redis memory usage > 80%
- CPU usage > 80% (более 5 минут)

**Предупреждающие алерты:**

- Response time P95 > 500ms
- Error rate > 2%
- Cache hit rate < 70%
- Database slow queries > 10 в минуту

## 7. Масштабирование

### 7.1 Горизонтальное масштабирование

**Архитектура:**
- Stateless API серверы (можно масштабировать горизонтально)
- Load balancer для распределения нагрузки
- Shared database и Redis

**Автомасштабирование:**
- Минимум: 2 инстанса
- Максимум: 10 инстансов
- Триггер: CPU > 70% или Response time > 500ms

### 7.2 Вертикальное масштабирование

**Рекомендуемые конфигурации:**

**Минимальная (до 100 пользователей):**
- CPU: 2 cores
- RAM: 4 GB
- Database: 2 cores, 8 GB RAM

**Средняя (100-500 пользователей):**
- CPU: 4 cores
- RAM: 8 GB
- Database: 4 cores, 16 GB RAM

**Высокая (500+ пользователей):**
- CPU: 8 cores
- RAM: 16 GB
- Database: 8 cores, 32 GB RAM

## Обновления (версия 1.1.0)

### Новые требования к производительности:

**Загрузка этапов найма:**
- Запрос этапов с настройками встреч должен быть оптимизирован (использовать JOIN или prefetch)
- Кэширование этапов-встреч (TTL: 10 минут)
- Индекс на `is_meeting` для быстрого фильтрования (`idx_recruiting_stages_is_meeting`)
- Оптимизированный запрос для получения только этапов-встреч:
  ```sql
  SELECT ls.*, rs.is_meeting, rs.show_offices, rs.show_interviewers
  FROM lifecycle_stages ls
  JOIN recruiting_stages rs ON ls.id = rs.lifecycle_stage_id
  WHERE ls.company_id = ? AND ls.block_id = 'recruiting' AND rs.is_meeting = true
  ORDER BY ls.order_index;
  ```

**Команды рекрутинга:**
- Кэширование списка команд для компании (TTL: 15 минут)
- Индексы на `company_id`, `stage_id`, `command` для быстрого поиска
- Проверка уникальности команд с учетом раскладки должна быть оптимизирована (использовать индексы)

**Настройки вакансии по странам:**
- Загрузка настроек вакансии по странам должна быть оптимизирована (batch loading)
- Кэширование настроек вакансии по странам (TTL: 5 минут)
- Ключи кэша:
  - `vacancy_country_settings:{vacancy_id}` - все настройки по странам
  - `vacancy_country_text:{vacancy_id}:{country_code}` - текст для конкретной страны
  - `vacancy_office_settings:{vacancy_id}` - настройки по офисам
- Индексы на `vacancy_id`, `country_code`, `office_id` для быстрого поиска
- При изменении активности страны инвалидировать кэш для всех связанных офисов

## 8. Связь с другими спецификациями

- Бизнес-логика страниц и сценарии использования кэша (профиль, этапы, команды, вакансии по странам) — [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md).
- Схема БД и индексы — [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-01-28  
**Автор:** HR Helper Development Team
