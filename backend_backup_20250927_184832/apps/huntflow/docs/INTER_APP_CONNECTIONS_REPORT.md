# Отчет о связях приложения Huntflow с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Huntflow` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.accounts (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модель `User` и API ключи.
- **Детали**: 
  - Модель `User` содержит поля для хранения Huntflow API ключей и URL
  - `HuntflowService` использует данные пользователя для аутентификации в Huntflow API
  - Все операции с Huntflow требуют аутентифицированного пользователя
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        class User(AbstractUser):
            huntflow_api_key = models.CharField(
                max_length=255,
                blank=True,
                null=True,
                verbose_name='Huntflow API ключ',
                help_text='API ключ для интеграции с Huntflow'
            )
            huntflow_prod_url = models.URLField(
                blank=True,
                null=True,
                verbose_name='Huntflow PROD URL'
            )
            huntflow_sandbox_url = models.URLField(
                blank=True,
                null=True,
                verbose_name='Huntflow SANDBOX URL'
            )
            active_system = models.CharField(
                max_length=10,
                choices=[('PROD', 'Production'), ('SANDBOX', 'Sandbox')],
                default='SANDBOX'
            )
        ```
    - `apps/huntflow/services.py`: Использует `user.huntflow_api_key` и другие поля
    - `apps/huntflow/views.py`: Проверка аутентификации пользователя
- **Влияние**: Без приложения `apps.accounts` и API ключей пользователей функциональность Huntflow полностью неработоспособна.

### 2. **apps.finance (ИНТЕГРАЦИОННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модели `Grade` и `CurrencyRate`.
- **Детали**: Приложение `apps.huntflow` использует финансовые данные для синхронизации зарплатной информации, грейдов кандидатов и валютных курсов с системой Huntflow.
- **Файлы, где обнаружена связь**:
    - `apps/huntflow/services.py`: Импорт и использование финансовых моделей
    - `apps/huntflow/views.py`: Отображение финансовых данных в интерфейсе
    - `apps/huntflow/serializers.py`: Сериализация финансовых данных
    - `apps/finance/models.py`: Модели `Grade` и `CurrencyRate` используются в Huntflow
- **Влияние**: Синхронизация финансовых данных с Huntflow зависит от корректной работы приложения `apps.finance`.

### 3. **apps.common (СИСТЕМНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через навигацию и UI компоненты.
- **Детали**: Приложение `apps.common` предоставляет общие компоненты интерфейса, включая сайдбар с навигацией к Huntflow функциональности и отображение данных организаций.
- **Файлы, где обнаружена связь**:
    - `apps/common/templates/common/sidebar_menu.html`: Ссылка на Huntflow
    - `apps/common/templatetags/sidebar_tags.py`: Генерация меню навигации
    - `apps/huntflow/urls.py`: URL маршруты для Huntflow
    - `apps/huntflow/views.py`: Предоставление данных для сайдбара
- **Влияние**: Навигация к Huntflow функциональности и отображение данных организаций зависит от корректной работы `apps.common`.

### 4. **apps.vacancies (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через синхронизацию вакансий.
- **Детали**: Приложение `apps.vacancies` может использовать данные из Huntflow для синхронизации локальных вакансий с внешними вакансиями в системе Huntflow.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/vacancies/views.py`: Потенциальная синхронизация с Huntflow
    - `apps/vacancies/logic/vacancy_handlers.py`: Потенциальная интеграция с Huntflow API
    - `apps/huntflow/services.py`: Готовность к интеграции с вакансиями
- **Влияние**: Потенциальная синхронизация вакансий между локальной системой и Huntflow.

### 5. **apps.interviewers (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через управление интервьюерами.
- **Детали**: Приложение `apps.interviewers` может использовать данные из Huntflow для синхронизации интервьюеров, их расписания и статусов с системой Huntflow.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/interviewers/views.py`: Потенциальная синхронизация с Huntflow
    - `apps/interviewers/logic/interviewer_handlers.py`: Потенциальная интеграция с Huntflow API
    - `apps/huntflow/services.py`: Готовность к интеграции с интервьюерами
- **Влияние**: Потенциальная синхронизация интервьюеров между локальной системой и Huntflow.

### 6. **apps.google_oauth (КОСВЕННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через кэширование API.
- **Детали**: Приложение `apps.huntflow` использует `HuntflowAPICache` из `apps.google_oauth` для кэширования данных Huntflow API и улучшения производительности.
- **Файлы, где обнаружена связь**:
    - `apps/huntflow/services.py`: Импорт `HuntflowAPICache`
    - `apps/google_oauth/cache_service.py`: Предоставляет `HuntflowAPICache`
- **Влияние**: Кэширование данных Huntflow API зависит от корректной работы кэш-сервиса.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                   Huntflow Application                      │
├─────────────────────────────────────────────────────────────┤
│  Core Models                                               │
│  ├── HuntflowCache (Кэширование данных)                    │
│  ├── HuntflowLog (Логирование операций)                    │
│  └── HuntflowService (API сервис)                         │
│      ├── → apps.accounts.User (API ключи и настройки)      │
│      ├── → apps.finance.Grade (Грейды кандидатов)          │
│      ├── → apps.finance.CurrencyRate (Валютные курсы)      │
│      └── → HuntflowAPI (внешний API)                      │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── HuntflowService (Основной API сервис)                │
│  ├── Cache Management (Управление кэшем)                   │
│  └── Logging Service (Логирование операций)               │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├── Huntflow API (Production/Sandbox)                     │
│  ├── API Authentication (Bearer Token)                     │
│  └── Data Synchronization                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **API ключи и аутентификация**
- `User.huntflow_api_key` → Huntflow API authentication
- `User.huntflow_prod_url` → Production API endpoint
- `User.huntflow_sandbox_url` → Sandbox API endpoint
- `User.active_system` → System selection (PROD/SANDBOX)

### 2. **Финансовые данные**
- `Grade` → Candidate grade synchronization
- `CurrencyRate` → Salary currency conversion
- Financial data → Huntflow candidate profiles

### 3. **Кэширование**
- `HuntflowAPICache` → API response caching
- Cache management → Performance optimization
- Data persistence → Reduced API calls

### 4. **UI и навигация**
- `apps.common` → Huntflow navigation
- Sidebar menu → Huntflow dashboard
- Organization data → Common sidebar display

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.accounts**: Критически важно для пользователей и API ключей

### 2. **Интеграционные зависимости**
- **apps.finance**: Важно для синхронизации финансовых данных
- **apps.google_oauth**: Важно для кэширования API данных

### 3. **Системные зависимости**
- **apps.common**: Навигация и UI компоненты

### 4. **Потенциальные зависимости**
- **apps.vacancies**: Потенциальная синхронизация вакансий
- **apps.interviewers**: Потенциальная синхронизация интервьюеров

## 🔧 **Рекомендации по управлению связями**

### 1. **API ключи и безопасность**
- Реализовать безопасное хранение Huntflow API ключей
- Добавить валидацию API ключей
- Создать механизм ротации ключей
- Ограничить доступ к API ключам

### 2. **Huntflow API интеграции**
- Создать единый интерфейс для Huntflow API
- Реализовать обработку ошибок API
- Добавить мониторинг использования API
- Создать систему кэширования данных

### 3. **Синхронизация данных**
- Реализовать синхронизацию с Huntflow
- Добавить обработку конфликтов данных
- Создать систему уведомлений о синхронизации
- Мониторить производительность синхронизации

### 4. **Кэширование**
- Оптимизировать кэширование API данных
- Реализовать автоматическое обновление кэша
- Добавить мониторинг эффективности кэша
- Создать систему очистки устаревших данных

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_huntflow_service_user_integration(self):
    """Тест интеграции HuntflowService с пользователем"""
    user = User.objects.create_user(
        username='testuser',
        huntflow_api_key='test_api_key',
        huntflow_prod_url='https://api.huntflow.ru',
        active_system='PROD'
    )
    
    service = HuntflowService(user)
    
    self.assertEqual(service.api_key, user.huntflow_api_key)
    self.assertEqual(service.base_url, user.huntflow_prod_url)
    self.assertIsNotNone(service.headers)

def test_huntflow_cache_integration(self):
    """Тест интеграции с кэшированием"""
    from apps.google_oauth.cache_service import HuntflowAPICache
    
    cache = HuntflowAPICache()
    cache_key = 'test_cache_key'
    test_data = {'test': 'data'}
    
    # Сохранение в кэш
    cache.set(cache_key, test_data, 3600)
    
    # Получение из кэша
    cached_data = cache.get(cache_key)
    
    self.assertEqual(cached_data, test_data)

def test_finance_data_integration(self):
    """Тест интеграции с финансовыми данными"""
    grade = Grade.objects.create(name='Senior')
    currency_rate = CurrencyRate.objects.create(
        currency='USD',
        rate=1.0,
        date=timezone.now().date()
    )
    
    # Тест использования финансовых данных в Huntflow
    huntflow_data = {
        'grade': grade.name,
        'currency_rate': currency_rate.rate
    }
    
    self.assertEqual(huntflow_data['grade'], 'Senior')
    self.assertEqual(huntflow_data['currency_rate'], 1.0)
```

### 2. **Integration тесты**
```python
def test_full_huntflow_workflow(self):
    """Тест полного рабочего процесса Huntflow"""
    # Создание пользователя с Huntflow настройками
    user = User.objects.create_user(
        username='testuser',
        huntflow_api_key='test_api_key',
        huntflow_prod_url='https://api.huntflow.ru',
        active_system='PROD'
    )
    
    # Создание финансовых данных
    grade = Grade.objects.create(name='Senior')
    currency_rate = CurrencyRate.objects.create(
        currency='USD',
        rate=1.0,
        date=timezone.now().date()
    )
    
    # Создание Huntflow сервиса
    service = HuntflowService(user)
    
    # Проверка инициализации
    self.assertEqual(service.user, user)
    self.assertEqual(service.api_key, user.huntflow_api_key)
    self.assertEqual(service.base_url, user.huntflow_prod_url)
    
    # Проверка использования финансовых данных
    candidate_data = {
        'grade': grade.name,
        'currency_rate': currency_rate.rate
    }
    
    self.assertIsNotNone(candidate_data['grade'])
    self.assertIsNotNone(candidate_data['currency_rate'])
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики API**
- Количество API запросов к Huntflow
- Время ответа Huntflow API
- Количество ошибок API
- Использование кэша

### 2. **Метрики синхронизации**
- Количество синхронизированных кандидатов
- Количество синхронизированных вакансий
- Количество конфликтов данных
- Производительность синхронизации

### 3. **Метрики кэширования**
- Эффективность кэширования
- Количество попаданий в кэш
- Размер кэша
- Время жизни кэша

### 4. **Алерты**
- Ошибки Huntflow API
- Проблемы с синхронизацией
- Истечение кэша
- Превышение лимитов API

## 🔄 **Сервисный слой и изоляция**

### 1. **Изоляция сервисов**
- Все бизнес-логика вынесена в сервисы
- Сервисы изолированы от других приложений
- Модели доступны для внешнего использования

### 2. **Сервисы Huntflow**
- `HuntflowService` - основной API сервис
- `HuntflowAPICache` - кэширование данных
- `HuntflowLogging` - логирование операций

### 3. **Зависимости сервисов**
```python
HuntflowService
    ├── User (внешняя модель)
    ├── HuntflowAPI (внешний сервис)
    ├── HuntflowAPICache (внешний сервис)
    └── Grade, CurrencyRate (внешние модели)

HuntflowAPICache
    ├── Cache backend (внешний сервис)
    └── JSON serialization (внутренняя логика)

HuntflowLogging
    ├── HuntflowLog (внутренняя модель)
    └── Logging backend (внешний сервис)
```

## 📝 **Выводы**

Приложение `Huntflow` является интеграционным центром для системы управления рекрутингом Huntflow в системе HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Критические связи**: Accounts (пользователи и API ключи)
2. **Интеграционные связи**: Finance (финансовые данные)
3. **Системные связи**: Common (навигация), Google OAuth (кэширование)
4. **Потенциальные связи**: Vacancies, Interviewers

### **Критические моменты:**
- API ключи Huntflow критически важны для функциональности
- Синхронизация финансовых данных с Huntflow
- Кэширование API данных для производительности
- Поддержка Production и Sandbox окружений

### **Рекомендации:**
- Регулярно тестировать все Huntflow API интеграции
- Мониторить состояние API ключей и подключений
- Документировать все синхронизации данных
- Создать систему резервного копирования Huntflow данных

Все связи архитектурно обоснованы и обеспечивают необходимую интеграцию с системой Huntflow в системе HR Helper. Приложение `Huntflow` служит мостом между системой HR Helper и внешней системой управления рекрутингом.
