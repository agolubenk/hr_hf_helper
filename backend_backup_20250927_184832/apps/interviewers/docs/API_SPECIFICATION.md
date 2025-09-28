# API Спецификация приложения Interviewers

## 🎯 Обзор

Данный документ содержит полную спецификацию API для приложения `interviewers`, включая REST API endpoints, JSON API, веб-интерфейс, модели данных, сериализаторы и интеграции с другими приложениями.

**Версия API:** 1.0  
**Дата обновления:** 2024-01-20

---

## 📊 **АРХИТЕКТУРА ПРИЛОЖЕНИЯ**

### Структура приложения:
```
apps/interviewers/
├── models.py                    # Модели данных
├── views.py                     # Веб-интерфейс
├── views_api.py                 # REST API ViewSets
├── forms.py                     # Django формы
├── admin.py                     # Админ-панель
├── urls.py                      # URL маршруты
├── logic/                       # Бизнес-логика
│   ├── serializers.py           # DRF сериализаторы
│   ├── services.py              # Сервисы
│   ├── interviewers_handlers.py # Обработчики интервьюеров
│   ├── rules_handlers.py        # Обработчики правил
│   └── calendar_handlers.py     # Обработчики календарей
└── docs/                        # Документация
```

### Архитектурные принципы:
- ✅ **Модульная архитектура** - четкое разделение ответственности
- ✅ **DRY принцип** - отсутствие дублирования кода
- ✅ **SOLID принципы** - следование лучшим практикам
- ✅ **Service Layer** - бизнес-логика в отдельных сервисах
- ✅ **Handler Pattern** - обработчики для общей логики

---

## 🔗 **REST API ENDPOINTS**

### Базовый URL: `/api/interviewers/`

### 1. **InterviewerViewSet** - Управление интервьюерами

#### **Стандартные CRUD операции:**

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| `GET` | `/api/interviewers/` | Список всех интервьюеров | ✅ |
| `POST` | `/api/interviewers/` | Создание нового интервьюера | ✅ |
| `GET` | `/api/interviewers/{id}/` | Детали интервьюера | ✅ |
| `PUT` | `/api/interviewers/{id}/` | Полное обновление интервьюера | ✅ |
| `PATCH` | `/api/interviewers/{id}/` | Частичное обновление интервьюера | ✅ |
| `DELETE` | `/api/interviewers/{id}/` | Удаление интервьюера | ✅ |

#### **Кастомные действия:**

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| `POST` | `/api/interviewers/{id}/toggle-active/` | Переключение активности | ✅ |
| `GET` | `/api/interviewers/active/` | Только активные интервьюеры | ✅ |
| `GET` | `/api/interviewers/with-calendar/` | Интервьюеры с календарем | ✅ |
| `GET` | `/api/interviewers/stats/` | Статистика по интервьюерам | ✅ |
| `GET` | `/api/interviewers/search/` | Поиск интервьюеров | ✅ |

### 2. **InterviewRuleViewSet** - Управление правилами

#### **Стандартные CRUD операции:**

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| `GET` | `/api/interview-rules/` | Список всех правил | ✅ |
| `POST` | `/api/interview-rules/` | Создание нового правила | ✅ |
| `GET` | `/api/interview-rules/{id}/` | Детали правила | ✅ |
| `PUT` | `/api/interview-rules/{id}/` | Полное обновление правила | ✅ |
| `PATCH` | `/api/interview-rules/{id}/` | Частичное обновление правила | ✅ |
| `DELETE` | `/api/interview-rules/{id}/` | Удаление правила | ✅ |

#### **Кастомные действия:**

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| `POST` | `/api/interview-rules/{id}/activate/` | Активация правила | ✅ |
| `GET` | `/api/interview-rules/active/` | Активное правило | ✅ |
| `POST` | `/api/interview-rules/{id}/check-grade/` | Проверка грейда | ✅ |
| `GET` | `/api/interview-rules/stats/` | Статистика по правилам | ✅ |

---

## 📝 **МОДЕЛИ ДАННЫХ**

### 1. **Interviewer** - Модель интервьюера

```python
class Interviewer(models.Model):
    # Основные поля
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    last_name = models.CharField(max_length=50, verbose_name="Фамилия")
    middle_name = models.CharField(max_length=50, blank=True, verbose_name="Отчество")
    email = models.EmailField(unique=True, verbose_name="Email")
    
    # Дополнительные поля
    calendar_link = models.URLField(blank=True, null=True, verbose_name="Ссылка на календарь")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    # Методы
    def get_full_name(self):
        """Возвращает полное имя"""
        
    def get_short_name(self):
        """Возвращает краткое имя"""
```

### 2. **InterviewRule** - Модель правил привлечения

```python
class InterviewRule(models.Model):
    # Основные поля
    name = models.CharField(max_length=100, verbose_name="Название правила")
    description = models.TextField(blank=True, verbose_name="Описание")
    
    # Лимиты
    daily_limit = models.PositiveIntegerField(verbose_name="Лимит в день")
    weekly_limit = models.PositiveIntegerField(verbose_name="Лимит в неделю")
    
    # Грейды
    min_grade = models.ForeignKey('finance.Grade', on_delete=models.CASCADE, 
                                 related_name='min_interview_rules', verbose_name="Минимальный грейд")
    max_grade = models.ForeignKey('finance.Grade', on_delete=models.CASCADE, 
                                 related_name='max_interview_rules', verbose_name="Максимальный грейд")
    
    # Статус
    is_active = models.BooleanField(default=False, verbose_name="Активно")
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    # Методы
    def get_grade_range(self):
        """Возвращает диапазон грейдов"""
        
    def is_grade_in_range(self, grade):
        """Проверяет, входит ли грейд в диапазон"""
        
    @classmethod
    def get_active_rule(cls):
        """Возвращает активное правило"""
        
    @classmethod
    def activate_rule(cls, rule_id):
        """Активирует правило"""
```

---

## 🔄 **СЕРИАЛИЗАТОРЫ**

### 1. **InterviewerSerializer** - Полный сериализатор интервьюера

```python
class InterviewerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    short_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Interviewer
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 'email',
            'calendar_link', 'is_active', 'full_name', 'short_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name', 'short_name']
```

### 2. **InterviewRuleSerializer** - Полный сериализатор правила

```python
class InterviewRuleSerializer(serializers.ModelSerializer):
    min_grade_name = serializers.CharField(source='min_grade.name', read_only=True)
    max_grade_name = serializers.CharField(source='max_grade.name', read_only=True)
    grade_range = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewRule
        fields = [
            'id', 'name', 'description', 'daily_limit', 'weekly_limit',
            'min_grade', 'min_grade_name', 'max_grade', 'max_grade_name',
            'grade_range', 'is_active', 'created_at', 'updated_at'
        ]
```

### 3. **Специализированные сериализаторы**

- **InterviewerCreateSerializer** - Для создания интервьюеров
- **InterviewerListSerializer** - Упрощенный для списков
- **InterviewRuleCreateSerializer** - Для создания правил
- **InterviewerStatsSerializer** - Для статистики

---

## 🌐 **ВЕБ-ИНТЕРФЕЙС**

### URL маршруты:

| URL | View | Описание | Аутентификация |
|-----|------|----------|----------------|
| `/interviewers/` | `interviewer_list` | Список интервьюеров | ✅ |
| `/interviewers/dashboard/` | `interviewer_dashboard` | Дашборд | ✅ |
| `/interviewers/create/` | `interviewer_create` | Создание интервьюера | ✅ |
| `/interviewers/{id}/` | `interviewer_detail` | Детали интервьюера | ✅ |
| `/interviewers/{id}/edit/` | `interviewer_edit` | Редактирование | ✅ |
| `/interviewers/rules/` | `rule_list` | Список правил | ✅ |
| `/interviewers/rules/create/` | `rule_create` | Создание правила | ✅ |
| `/interviewers/rules/{id}/` | `rule_detail` | Детали правила | ✅ |

### AJAX endpoints:

| URL | View | Описание | Метод |
|-----|------|----------|-------|
| `/interviewers/{id}/toggle-active/` | `interviewer_toggle_active` | Переключение активности | POST |
| `/interviewers/rules/{id}/toggle-active/` | `rule_toggle_active` | Переключение активности правила | POST |
| `/interviewers/auto-fill-calendar/` | `auto_fill_calendar` | Автозаполнение календаря | POST |
| `/interviewers/auto-fill-all-calendars/` | `auto_fill_all_calendars` | Автозаполнение всех календарей | POST |

---

## 🔧 **ОБРАБОТЧИКИ И СЕРВИСЫ**

### 1. **InterviewerHandler** - Обработчик интервьюеров

```python
class InterviewerHandler:
    @staticmethod
    def search_interviewers_logic(query, is_active, has_calendar)
    @staticmethod
    def toggle_active_logic(interviewer_id, user)
    @staticmethod
    def calculate_interviewer_stats()
    @staticmethod
    def get_active_interviewers()
    @staticmethod
    def get_interviewers_with_calendar()
    @staticmethod
    def get_recent_interviewers(limit)
```

### 2. **RuleHandler** - Обработчик правил

```python
class RuleHandler:
    @staticmethod
    def search_rules_logic(query, is_active, min_grade)
    @staticmethod
    def toggle_active_logic(rule_id, user)
    @staticmethod
    def activate_rule_logic(rule_id)
    @staticmethod
    def calculate_rule_stats()
    @staticmethod
    def get_active_rule()
    @staticmethod
    def check_grade_in_range_logic(rule_id, grade_id)
```

### 3. **CalendarHandler** - Обработчик календарей

```python
class CalendarHandler:
    @staticmethod
    def auto_fill_calendar_logic(interviewer_id, interviewer_email, user)
    @staticmethod
    def auto_fill_all_calendars_logic(user)
    @staticmethod
    def get_available_calendars_logic(user)
    @staticmethod
    def suggest_calendar_logic(interviewer_email, user)
```

### 4. **InterviewerCalendarService** - Сервис календарей

```python
class InterviewerCalendarService:
    def __init__(self, user)
    def get_calendar_link_for_interviewer(self, interviewer_email)
    def auto_fill_calendar_links(self)
    def get_available_calendars(self)
    def suggest_calendar_for_interviewer(self, interviewer_email)
```

---

## 📊 **ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ**

### 1. **Получение списка интервьюеров**

```bash
GET /api/interviewers/
Authorization: Token your_token_here
```

**Ответ:**
```json
{
    "count": 25,
    "next": "http://example.com/api/interviewers/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "first_name": "Иван",
            "last_name": "Иванов",
            "middle_name": "Иванович",
            "email": "ivan.ivanov@example.com",
            "calendar_link": "https://calendar.google.com/...",
            "is_active": true,
            "full_name": "Иванов Иван Иванович",
            "short_name": "И.И. Иванов",
            "created_at": "2024-01-20T10:00:00Z",
            "updated_at": "2024-01-20T10:00:00Z"
        }
    ]
}
```

### 2. **Создание нового интервьюера**

```bash
POST /api/interviewers/
Authorization: Token your_token_here
Content-Type: application/json

{
    "first_name": "Петр",
    "last_name": "Петров",
    "middle_name": "Петрович",
    "email": "petr.petrov@example.com",
    "calendar_link": "",
    "is_active": true
}
```

### 3. **Поиск интервьюеров**

```bash
GET /api/interviewers/search/?q=Иван&is_active=true&has_calendar=true
Authorization: Token your_token_here
```

### 4. **Переключение активности**

```bash
POST /api/interviewers/1/toggle-active/
Authorization: Token your_token_here
```

### 5. **Получение статистики**

```bash
GET /api/interviewers/stats/
Authorization: Token your_token_here
```

**Ответ:**
```json
{
    "total_interviewers": 25,
    "active_interviewers": 20,
    "inactive_interviewers": 5,
    "interviewers_with_calendar": 15,
    "recent_interviewers": [
        {
            "id": 1,
            "full_name": "Иванов Иван Иванович",
            "email": "ivan.ivanov@example.com",
            "is_active": true
        }
    ]
}
```

---

## 🔗 **ИНТЕГРАЦИИ С ДРУГИМИ ПРИЛОЖЕНИЯМИ**

### 1. **Finance App** - Интеграция с грейдами
- **Модель:** `apps.finance.models.Grade`
- **Использование:** Правила привлечения интервьюеров по грейдам
- **API:** Проверка соответствия грейда правилу

### 2. **Google OAuth App** - Интеграция с календарями
- **Сервисы:** `GoogleOAuthService`, `GoogleCalendarService`
- **Функции:** Автозаполнение ссылок на календари
- **API:** Получение доступных календарей

### 3. **Accounts App** - Аутентификация
- **Модель:** `apps.accounts.models.User`
- **Использование:** Привязка интервьюеров к пользователям
- **API:** Аутентификация всех запросов

---

## ⚠️ **ОБРАБОТКА ОШИБОК**

### Стандартные HTTP коды:

| Код | Описание | Пример |
|-----|----------|--------|
| `200` | Успешный запрос | GET, PATCH |
| `201` | Ресурс создан | POST |
| `204` | Ресурс удален | DELETE |
| `400` | Неверный запрос | Неверные данные |
| `401` | Не авторизован | Отсутствует токен |
| `403` | Доступ запрещен | Недостаточно прав |
| `404` | Ресурс не найден | Неверный ID |
| `500` | Внутренняя ошибка | Ошибка сервера |

### Формат ошибок:

```json
{
    "error": "Описание ошибки",
    "details": {
        "field_name": ["Конкретная ошибка поля"]
    },
    "code": "ERROR_CODE"
}
```

---

## 🔒 **АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ**

### Методы аутентификации:
- **Token Authentication** - для API запросов
- **Session Authentication** - для веб-интерфейса
- **CSRF Protection** - для POST запросов

### Права доступа:
- **Аутентификация обязательна** для всех endpoints
- **Проверка прав** на уровне ViewSets
- **Валидация данных** на уровне сериализаторов

---

## 📈 **ПРОИЗВОДИТЕЛЬНОСТЬ**

### Оптимизации:
- **select_related** для связанных объектов
- **prefetch_related** для обратных связей
- **Пагинация** для больших списков
- **Кэширование** статистики

### Рекомендации:
- Используйте фильтры для ограничения результатов
- Применяйте пагинацию для больших списков
- Кэшируйте часто запрашиваемые данные

---

## 🧪 **ТЕСТИРОВАНИЕ**

### Типы тестов:
- **Unit тесты** для обработчиков и сервисов
- **Integration тесты** для API endpoints
- **Functional тесты** для веб-интерфейса

### Примеры тестов:
```python
# Тест создания интервьюера
def test_create_interviewer(self):
    data = {
        'first_name': 'Тест',
        'last_name': 'Тестов',
        'email': 'test@example.com'
    }
    response = self.client.post('/api/interviewers/', data)
    self.assertEqual(response.status_code, 201)
```

---

## 🎯 **ЗАКЛЮЧЕНИЕ**

### Ключевые особенности API:
- ✅ **RESTful архитектура** - стандартные HTTP методы
- ✅ **Модульная структура** - четкое разделение ответственности
- ✅ **Полная документация** - все endpoints задокументированы
- ✅ **Обработка ошибок** - стандартизированные ответы
- ✅ **Безопасность** - аутентификация и авторизация
- ✅ **Производительность** - оптимизированные запросы

### Готовность к использованию:
- **API полностью функционален** и готов к использованию
- **Документация актуальна** и содержит все необходимые детали
- **Интеграции работают** с другими приложениями системы
- **Тестирование покрывает** основные сценарии использования

**Приложение Interviewers готово к продуктивному использованию!** 🚀
