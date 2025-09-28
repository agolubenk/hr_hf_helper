# Архитектура и оптимизация - Vacancies Application

## 📋 Обзор

Данный документ описывает архитектуру приложения `@vacancies/`, принципы оптимизации, паттерны проектирования и рекомендации по развитию.

## 🏗️ Архитектурные принципы

### 1. **Separation of Concerns (Разделение ответственности)**
- **Models**: Определение структуры данных и бизнес-логики
- **Views**: Обработка HTTP запросов и формирование ответов
- **Logic Handlers**: Бизнес-логика, вынесенная в отдельные обработчики
- **Serializers**: Преобразование данных для API
- **Forms**: Валидация и обработка пользовательского ввода

### 2. **DRY (Don't Repeat Yourself)**
- Общие обработчики для переиспользования логики
- Универсальные обработчики ответов
- Базовые классы для сериализаторов
- Общие методы валидации

### 3. **Single Responsibility Principle (SRP)**
- Каждый обработчик отвечает за одну область функциональности
- Разделение логики по типам операций
- Изоляция API и Web логики

## 🏛️ Архитектурная схема

```
┌─────────────────────────────────────────────────────────────┐
│                    Vacancies Application                    │
├─────────────────────────────────────────────────────────────┤
│  Web Layer (Django Views)                                  │
│  ├── views.py (Web интерфейс)                              │
│  ├── views_api.py (REST API)                               │
│  └── forms.py (Валидация форм)                             │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer (Handlers)                           │
│  ├── vacancy_handlers.py                                   │
│  │   ├── VacancyHandler (Web логика)                       │
│  │   └── VacancyApiHandler (API логика)                    │
│  ├── salary_range_handlers.py                              │
│  │   └── SalaryRangeHandler                                │
│  └── response_handlers.py                                  │
│      └── ResponseHandler (Универсальные ответы)            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── models.py (Модели данных)                             │
│  ├── serializers.py (DRF сериализаторы)                    │
│  └── admin.py (Админ-панель)                               │
├─────────────────────────────────────────────────────────────┤
│  External Dependencies                                     │
│  ├── apps.finance (Грейды)                                 │
│  ├── apps.interviewers (Интервьюеры)                       │
│  ├── apps.accounts (Пользователи)                          │
│  └── apps.google_oauth (Интеграции)                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Компоненты архитектуры

### 1. **Business Logic Handlers**

#### VacancyHandler
**Назначение**: Основная бизнес-логика для работы с вакансиями

```python
class VacancyHandler:
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """Логика переключения статуса активности"""
        
    @staticmethod
    def search_logic(search_params):
        """Логика поиска и фильтрации"""
        
    @staticmethod
    def calculate_stats(user=None):
        """Логика расчета статистики"""
        
    @staticmethod
    def assign_grades_logic(vacancy_pk, grade_ids, user=None):
        """Логика назначения грейдов"""
        
    @staticmethod
    def get_my_vacancies_logic(user):
        """Логика получения вакансий пользователя"""
```

**Преимущества:**
- Единое место для бизнес-логики
- Легкое тестирование
- Переиспользование в разных слоях
- Изоляция от представлений

#### VacancyApiHandler
**Назначение**: API-специфичная логика

```python
class VacancyApiHandler:
    @staticmethod
    def toggle_active_handler(params, request):
        """API обработчик переключения активности"""
        
    @staticmethod
    def search_handler(params, request):
        """API обработчик поиска"""
        
    @staticmethod
    def stats_handler(params, request):
        """API обработчик статистики"""
```

**Преимущества:**
- Разделение Web и API логики
- Специфичная обработка для API
- Единообразные ответы

#### SalaryRangeHandler
**Назначение**: Логика работы с зарплатными вилками

```python
class SalaryRangeHandler:
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """Логика переключения статуса активности"""
        
    @staticmethod
    def search_logic(search_params):
        """Логика поиска и фильтрации"""
        
    @staticmethod
    def calculate_stats():
        """Логика расчета статистики"""
```

#### ResponseHandler
**Назначение**: Универсальные обработчики ответов

```python
class ResponseHandler:
    @staticmethod
    def success_response(data=None, message=None, status_code=200):
        """Успешный ответ для Django views"""
        
    @staticmethod
    def error_response(message, status_code=400, data=None):
        """Ответ об ошибке для Django views"""
        
    @staticmethod
    def api_success_response(data=None, message=None, status_code=200):
        """Успешный ответ для DRF API"""
        
    @staticmethod
    def pagination_context(page_obj, search_form=None, original_queryset=None, **filters):
        """Контекст для пагинации"""
```

### 2. **Data Models**

#### Vacancy Model
```python
class Vacancy(models.Model):
    # Основные поля
    name = models.CharField(max_length=200)
    external_id = models.CharField(max_length=100, unique=True)
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Настройки инвайтов
    invite_title = models.CharField(max_length=200)
    invite_text = models.TextField()
    
    # Scorecard
    scorecard_title = models.CharField(max_length=200)
    scorecard_link = models.URLField(blank=True)
    
    # Вопросы для интервью
    questions_belarus = models.TextField(blank=True)
    questions_poland = models.TextField(blank=True)
    
    # Ссылки на вакансии
    vacancy_link_belarus = models.URLField(blank=True)
    vacancy_link_poland = models.URLField(blank=True)
    
    # Промпты для AI
    candidate_update_prompt = models.TextField(blank=True)
    invite_prompt = models.TextField(blank=True)
    
    # Настройки
    screening_duration = models.PositiveIntegerField(default=45)
    available_grades = models.ManyToManyField(Grade, blank=True)
    interviewers = models.ManyToManyField(Interviewer, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Временные метки
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Особенности:**
- Валидация через `clean()` метод
- Автоматическое управление временными метками
- Связи с внешними приложениями

#### SalaryRange Model
```python
class SalaryRange(models.Model):
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    
    # Зарплата в USD (базовая валюта)
    salary_min_usd = models.DecimalField(max_digits=10, decimal_places=2)
    salary_max_usd = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Автоматически рассчитываемые валюты
    salary_min_byn = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_max_byn = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_min_pln = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_max_pln = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Особенности:**
- Автоматический расчет валют в `save()` методе
- Валидация диапазонов зарплат
- Связь с вакансиями и грейдами

### 3. **Serializers**

#### VacancySerializer
```python
class VacancySerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    recruiter_username = serializers.CharField(source='recruiter.username', read_only=True)
    available_grades_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'name', 'external_id', 'recruiter', 'recruiter_name', 'recruiter_username',
            'invite_title', 'invite_text', 'scorecard_title', 'scorecard_text',
            'available_grades', 'available_grades_names', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'recruiter_name', 'recruiter_username', 'available_grades_names']
```

**Особенности:**
- Вычисляемые поля для удобства API
- Валидация уникальности external_id
- Различные сериализаторы для разных операций

### 4. **Views Architecture**

#### Web Views (views.py)
```python
@login_required
def vacancy_list(request):
    """Список вакансий"""
    # Получение параметров
    search_form = VacancySearchForm(request.GET)
    search_query = request.GET.get('search', '')
    
    # Использование обработчика
    search_params = {
        'query': search_query,
        'user': request.user
    }
    vacancies = VacancyHandler.search_logic(search_params)
    
    # Пагинация
    paginator = Paginator(vacancies, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    
    # Формирование контекста
    context = ResponseHandler.pagination_context(
        page_obj, search_form, original_queryset=vacancies
    )
    
    return render(request, 'vacancies/vacancy_list.html', context)
```

**Принципы:**
- Делегирование логики обработчикам
- Использование универсальных обработчиков ответов
- Минимальная логика в представлениях

#### API Views (views_api.py)
```python
class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Переключение активности вакансии"""
        result = VacancyApiHandler.toggle_active_handler({'pk': pk}, request)
        
        if result['success']:
            vacancy = result['vacancy']
            serializer = VacancySerializer(vacancy)
            return Response(serializer.data)
        else:
            return ResponseHandler.api_error_response(result['message'])
```

**Принципы:**
- Использование ViewSets для стандартных операций
- Кастомные действия через декораторы
- Делегирование логики API обработчикам

## ⚡ Оптимизация производительности

### 1. **Database Optimization**

#### Query Optimization
```python
# Плохо - N+1 запросы
vacancies = Vacancy.objects.all()
for vacancy in vacancies:
    print(vacancy.recruiter.name)  # Отдельный запрос для каждого

# Хорошо - один запрос с select_related
vacancies = Vacancy.objects.select_related('recruiter').all()
for vacancy in vacancies:
    print(vacancy.recruiter.name)  # Данные уже загружены
```

#### Prefetch Related для ManyToMany
```python
# Оптимизированный запрос в обработчиках
queryset = Vacancy.objects.select_related('recruiter').prefetch_related(
    'available_grades', 'interviewers'
).all()
```

#### Database Indexes
```python
class Vacancy(models.Model):
    # Автоматические индексы для ForeignKey и unique поля
    external_id = models.CharField(max_length=100, unique=True)  # Индекс
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE)  # Индекс
    
    class Meta:
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['recruiter', 'is_active']),
        ]
```

### 2. **Caching Strategy**

#### Template Fragment Caching
```html
<!-- Кэширование списка вакансий на 5 минут -->
{% load cache %}
{% cache 300 vacancy_list request.user.id request.GET %}
    <!-- Содержимое списка вакансий -->
{% endcache %}
```

#### Query Caching
```python
from django.core.cache import cache

def get_vacancy_stats(user):
    cache_key = f'vacancy_stats_{user.id}'
    stats = cache.get(cache_key)
    
    if stats is None:
        stats = VacancyHandler.calculate_stats(user)
        cache.set(cache_key, stats, 300)  # 5 минут
    
    return stats
```

### 3. **Pagination Optimization**

#### Правильная пагинация
```python
def vacancy_list(request):
    # Получаем queryset до пагинации
    vacancies = VacancyHandler.search_logic(search_params)
    
    # Пагинация
    paginator = Paginator(vacancies, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    
    # Передаем оригинальный queryset для статистики
    context = ResponseHandler.pagination_context(
        page_obj, search_form, original_queryset=vacancies
    )
```

### 4. **Response Optimization**

#### Сжатие ответов
```python
# В settings.py
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    # ...
]
```

#### Минимизация данных
```python
class VacancyListSerializer(serializers.ModelSerializer):
    """Упрощенный сериализатор для списков"""
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    available_grades_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'name', 'external_id', 'recruiter_name',
            'available_grades_count', 'is_active', 'created_at'
        ]
```

## 🔄 Паттерны проектирования

### 1. **Handler Pattern**
```python
class VacancyHandler:
    """Централизованная логика для работы с вакансиями"""
    
    @staticmethod
    def toggle_active_logic(pk, request=None):
        """Единая логика переключения активности"""
        try:
            vacancy = Vacancy.objects.get(pk=pk)
            vacancy.is_active = not vacancy.is_active
            vacancy.save()
            
            if request:
                messages.success(request, f'Вакансия {vacancy.name} {"активирована" if vacancy.is_active else "деактивирована"}')
            
            return {
                'success': True,
                'is_active': vacancy.is_active,
                'vacancy': vacancy
            }
        except Vacancy.DoesNotExist:
            return {'success': False, 'message': 'Вакансия не найдена'}
```

**Преимущества:**
- Единое место для бизнес-логики
- Легкое тестирование
- Переиспользование в разных слоях

### 2. **Response Handler Pattern**
```python
class ResponseHandler:
    """Универсальные обработчики ответов"""
    
    @staticmethod
    def success_response(data=None, message=None, status_code=200):
        """Стандартизированный успешный ответ"""
        response_data = {'success': True}
        
        if data is not None:
            response_data.update(data)
        
        if message:
            response_data['message'] = message
        
        return JsonResponse(response_data, status=status_code)
    
    @staticmethod
    def pagination_context(page_obj, search_form=None, original_queryset=None, **filters):
        """Стандартизированный контекст пагинации"""
        context = {
            'page_obj': page_obj,
            'total_count': page_obj.paginator.count,
        }
        
        if search_form:
            context['search_form'] = search_form
        
        context.update(filters)
        
        # Статистика из оригинального queryset
        if original_queryset is not None:
            context['active_count'] = original_queryset.filter(is_active=True).count()
            context['inactive_count'] = original_queryset.filter(is_active=False).count()
        
        return context
```

**Преимущества:**
- Единообразие ответов
- Упрощение кода представлений
- Легкая модификация форматов ответов

### 3. **Service Layer Pattern**
```python
class VacancyService:
    """Сервисный слой для сложной бизнес-логики"""
    
    @staticmethod
    def create_vacancy_with_grades(data, grade_ids=None):
        """Создание вакансии с назначением грейдов"""
        vacancy = Vacancy.objects.create(**data)
        
        if grade_ids:
            grades = Grade.objects.filter(id__in=grade_ids)
            vacancy.available_grades.set(grades)
        
        return vacancy
    
    @staticmethod
    def bulk_update_vacancy_status(vacancy_ids, is_active):
        """Массовое обновление статуса вакансий"""
        return Vacancy.objects.filter(id__in=vacancy_ids).update(is_active=is_active)
```

### 4. **Repository Pattern** (для будущего развития)
```python
class VacancyRepository:
    """Репозиторий для работы с данными вакансий"""
    
    @staticmethod
    def get_active_vacancies():
        return Vacancy.objects.filter(is_active=True)
    
    @staticmethod
    def get_vacancies_by_recruiter(recruiter_id):
        return Vacancy.objects.filter(recruiter_id=recruiter_id)
    
    @staticmethod
    def search_vacancies(query):
        return Vacancy.objects.filter(
            Q(name__icontains=query) |
            Q(external_id__icontains=query)
        )
```

## 🧪 Тестирование архитектуры

### 1. **Unit Tests для обработчиков**
```python
class TestVacancyHandler(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
        self.vacancy = Vacancy.objects.create(
            name='Test Vacancy',
            external_id='TEST001',
            recruiter=self.user,
            invite_title='Test Invite',
            invite_text='Test Text',
            scorecard_title='Test Scorecard'
        )
    
    def test_toggle_active_logic(self):
        # Тест переключения активности
        result = VacancyHandler.toggle_active_logic(self.vacancy.pk)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['is_active'], not self.vacancy.is_active)
    
    def test_search_logic(self):
        # Тест логики поиска
        search_params = {'query': 'Test', 'user': self.user}
        vacancies = VacancyHandler.search_logic(search_params)
        
        self.assertEqual(vacancies.count(), 1)
        self.assertEqual(vacancies.first(), self.vacancy)
    
    def test_calculate_stats(self):
        # Тест расчета статистики
        stats = VacancyHandler.calculate_stats(self.user)
        
        self.assertEqual(stats['total_vacancies'], 1)
        self.assertEqual(stats['active_vacancies'], 1)
        self.assertEqual(stats['inactive_vacancies'], 0)
```

### 2. **Integration Tests**
```python
class TestVacancyIntegration(TestCase):
    def test_vacancy_creation_flow(self):
        # Тест полного потока создания вакансии
        data = {
            'name': 'Integration Test Vacancy',
            'external_id': 'INT001',
            'recruiter': self.user.id,
            'invite_title': 'Test Invite',
            'invite_text': 'Test Text',
            'scorecard_title': 'Test Scorecard'
        }
        
        response = self.client.post('/api/vacancies/', data)
        self.assertEqual(response.status_code, 201)
        
        vacancy = Vacancy.objects.get(external_id='INT001')
        self.assertEqual(vacancy.name, 'Integration Test Vacancy')
```

## 📊 Мониторинг и метрики

### 1. **Performance Metrics**
```python
import time
from django.db import connection

class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        start_queries = len(connection.queries)
        
        response = self.get_response(request)
        
        end_time = time.time()
        end_queries = len(connection.queries)
        
        # Логирование метрик
        if request.path.startswith('/vacancies/'):
            logger.info(f"Vacancy request: {request.path} - {end_time - start_time:.3f}s - {end_queries - start_queries} queries")
        
        return response
```

### 2. **Error Tracking**
```python
import logging

logger = logging.getLogger('vacancies')

class VacancyHandler:
    @staticmethod
    def toggle_active_logic(pk, request=None):
        try:
            # ... логика ...
            logger.info(f"Vacancy {pk} status toggled successfully")
            return {'success': True, ...}
        except Exception as e:
            logger.error(f"Error toggling vacancy {pk}: {str(e)}")
            return {'success': False, 'message': str(e)}
```

## 🔮 Рекомендации по развитию

### 1. **Краткосрочные улучшения (1-3 месяца)**
- ✅ Добавить comprehensive test suite
- ✅ Реализовать кэширование для часто запрашиваемых данных
- ✅ Добавить валидацию входных параметров в обработчики
- ✅ Создать документацию по использованию обработчиков

### 2. **Среднесрочные улучшения (3-6 месяцев)**
- 🔄 Реализовать Repository Pattern для работы с данными
- 🔄 Добавить event-driven архитектуру для интеграций
- 🔄 Создать API версионирование
- 🔄 Добавить bulk операции для массовых изменений

### 3. **Долгосрочные улучшения (6+ месяцев)**
- 🔄 Микросервисная архитектура для высоконагруженных частей
- 🔄 GraphQL API для гибких запросов
- 🔄 Real-time обновления через WebSockets
- 🔄 Машинное обучение для рекомендаций

### 4. **Архитектурные принципы для будущего**
```python
# Пример будущей архитектуры с событиями
from django.dispatch import Signal

vacancy_created = Signal()
vacancy_updated = Signal()
vacancy_deleted = Signal()

class Vacancy(models.Model):
    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)
        
        if created:
            vacancy_created.send(sender=self.__class__, instance=self)
        else:
            vacancy_updated.send(sender=self.__class__, instance=self)

# Обработчики событий
@receiver(vacancy_created)
def notify_external_systems(sender, instance, **kwargs):
    """Уведомление внешних систем о создании вакансии"""
    pass

@receiver(vacancy_updated)
def update_cache(sender, instance, **kwargs):
    """Обновление кэша при изменении вакансии"""
    cache.delete(f'vacancy_{instance.pk}')
```

## 📝 Заключение

Архитектура приложения `@vacancies/` построена на принципах:

1. **Модульности** - четкое разделение ответственности
2. **Переиспользования** - общие обработчики и компоненты
3. **Тестируемости** - изолированная бизнес-логика
4. **Производительности** - оптимизированные запросы и кэширование
5. **Расширяемости** - готовность к будущему развитию

Текущая архитектура обеспечивает:
- ✅ Высокую производительность
- ✅ Легкость тестирования
- ✅ Простоту поддержки
- ✅ Возможность масштабирования
- ✅ Готовность к интеграциям

Рекомендуется продолжать развитие в направлении event-driven архитектуры и микросервисов для обеспечения высокой производительности и масштабируемости системы.
