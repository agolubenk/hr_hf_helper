# Отчет о связях приложения Google OAuth с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Google OAuth` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.accounts (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модель `User` и OAuth интеграцию.
- **Детали**: 
  - Модель `GoogleOAuthAccount` имеет `OneToOneField` связь с моделью `User`
  - Модель `User` имеет обратную связь `google_oauth_account` с `GoogleOAuthAccount`
  - OAuth процесс требует аутентифицированного пользователя
- **Файлы, где обнаружена связь**:
    - `apps/google_oauth/models.py`:
        ```python
        class GoogleOAuthAccount(models.Model):
            user = models.OneToOneField(
                User, 
                on_delete=models.CASCADE, 
                related_name='google_oauth_account'
            )
        ```
    - `apps/accounts/models.py`:
        ```python
        class User(AbstractUser):
            google_oauth_account = models.OneToOneField(
                'google_oauth.GoogleOAuthAccount',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                related_name='user_account',
                verbose_name='Google OAuth аккаунт'
            )
        ```
    - `apps/google_oauth/services.py`: Использует `user` для создания OAuth аккаунтов
    - `apps/google_oauth/views.py`: Проверка аутентификации пользователя
- **Влияние**: Без приложения `apps.accounts` и системы пользователей OAuth функциональность полностью неработоспособна.

### 2. **apps.finance (ИНТЕГРАЦИОННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модели `Grade` и `CurrencyRate`.
- **Детали**: Модели в `apps.google_oauth` ссылаются на финансовые данные для создания Google Calendar событий с информацией о зарплатах и грейдах.
- **Файлы, где обнаружена связь**:
    - `apps/google_oauth/models.py`:
        ```python
        class GoogleCalendarEvent(models.Model):
            grade = models.ForeignKey(
                'finance.Grade',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Грейд'
            )
            currency_rate = models.ForeignKey(
                'finance.CurrencyRate',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                verbose_name='Курс валюты'
            )
        ```
    - `apps/google_oauth/services.py`: Использует `Grade` и `CurrencyRate` для создания событий
    - `apps/google_oauth/views.py`: Отображение финансовых данных в календаре
- **Влияние**: Google Calendar интеграция использует финансовые данные для создания событий с информацией о зарплатах.

### 3. **apps.gemini (ИНТЕГРАЦИОННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через `GeminiService`.
- **Детали**: Приложение `apps.google_oauth` использует `GeminiService` для генерации AI контента в Google Calendar событиях, создания умных описаний и автоматической категоризации событий.
- **Файлы, где обнаружена связь**:
    - `apps/google_oauth/services.py`: Импорт `GeminiService`
    - `apps/google_oauth/views.py`: Использование AI для генерации контента
    - `apps/google_oauth/tasks.py`: Автоматическая обработка событий через AI
    - `apps/gemini/logic/services.py`: Предоставляет `GeminiService` для интеграций
- **Влияние**: AI функциональность в Google Calendar зависит от корректной работы `GeminiService`.

### 4. **apps.vacancies (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через Google Calendar события.
- **Детали**: Приложение `apps.vacancies` может использовать Google Calendar для создания событий интервью, уведомлений о вакансиях и синхронизации с рекрутерами.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/vacancies/views.py`: Потенциальное создание календарных событий
    - `apps/vacancies/logic/vacancy_handlers.py`: Потенциальная интеграция с календарем
    - `apps/google_oauth/services.py`: Готовность к интеграции с вакансиями
- **Влияние**: Потенциальная синхронизация вакансий с Google Calendar.

### 5. **apps.interviewers (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через Google Calendar события.
- **Детали**: Приложение `apps.interviewers` может использовать Google Calendar для создания событий интервью, синхронизации расписания интервьюеров и уведомлений.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/interviewers/views.py`: Потенциальное создание календарных событий
    - `apps/interviewers/logic/interviewer_handlers.py`: Потенциальная интеграция с календарем
    - `apps/google_oauth/services.py`: Готовность к интеграции с интервьюерами
- **Влияние**: Потенциальная синхронизация интервью с Google Calendar.

### 6. **apps.common (СИСТЕМНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через навигацию и UI компоненты.
- **Детали**: Приложение `apps.common` предоставляет общие компоненты интерфейса, включая сайдбар с навигацией к Google OAuth функциональности.
- **Файлы, где обнаружена связь**:
    - `apps/common/templates/common/sidebar_menu.html`: Ссылка на Google OAuth
    - `apps/common/templatetags/sidebar_tags.py`: Генерация меню навигации
    - `apps/google_oauth/urls.py`: URL маршруты для Google OAuth
- **Влияние**: Навигация к Google OAuth функциональности зависит от корректной работы `apps.common`.

### 7. **apps.huntflow (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через Google Calendar события.
- **Детали**: Приложение `apps.huntflow` может использовать Google Calendar для создания событий интервью, синхронизации с кандидатами и уведомлений о статусе заявок.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/huntflow/views.py`: Потенциальное создание календарных событий
    - `apps/huntflow/services.py`: Потенциальная интеграция с календарем
    - `apps/google_oauth/services.py`: Готовность к интеграции с Huntflow
- **Влияние**: Потенциальная синхронизация Huntflow данных с Google Calendar.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                 Google OAuth Application                    │
├─────────────────────────────────────────────────────────────┤
│  Core Models                                               │
│  ├── GoogleOAuthAccount (OAuth аккаунты)                   │
│  │   └── → apps.accounts.User (OneToOne)                   │
│  ├── GoogleCalendarEvent (Календарные события)             │
│  │   ├── → apps.finance.Grade (ForeignKey)                 │
│  │   └── → apps.finance.CurrencyRate (ForeignKey)          │
│  └── GoogleDriveFile (Файлы Drive)                         │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── GoogleOAuthService (OAuth операции)                   │
│  ├── GoogleCalendarService (Календарные операции)          │
│  ├── GoogleDriveService (Drive операции)                   │
│  └── GeminiService (AI интеграция)                         │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├── Google API (Calendar, Drive, Sheets)                  │
│  ├── OAuth 2.0 Flow                                        │
│  └── AI Content Generation                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (Foreign Key / OneToOne)**
- `GoogleOAuthAccount.user` ← OneToOne → `User`
- `GoogleCalendarEvent.grade` ← ForeignKey → `Grade`
- `GoogleCalendarEvent.currency_rate` ← ForeignKey → `CurrencyRate`

### 2. **OAuth интеграция**
- Google OAuth 2.0 flow → User authentication
- Access tokens → Google API calls
- Refresh tokens → Token renewal

### 3. **Google API интеграции**
- Calendar API → Event creation and management
- Drive API → File operations
- Sheets API → Data synchronization

### 4. **AI интеграция**
- `GeminiService` → Content generation
- AI prompts → Smart event descriptions
- Automatic categorization → Event organization

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.accounts**: Критически важно для пользователей и OAuth процесса

### 2. **Интеграционные зависимости**
- **apps.finance**: Важно для создания событий с финансовой информацией
- **apps.gemini**: Важно для AI генерации контента

### 3. **Системные зависимости**
- **apps.common**: Навигация и UI компоненты

### 4. **Потенциальные зависимости**
- **apps.vacancies**: Потенциальная интеграция с календарем
- **apps.interviewers**: Потенциальная интеграция с календарем
- **apps.huntflow**: Потенциальная интеграция с календарем

## 🔧 **Рекомендации по управлению связями**

### 1. **OAuth токены и безопасность**
- Реализовать безопасное хранение OAuth токенов
- Добавить автоматическое обновление токенов
- Создать механизм обработки истекших токенов
- Ограничить доступ к OAuth данным

### 2. **Google API интеграции**
- Создать единый интерфейс для Google API
- Реализовать обработку ошибок API
- Добавить мониторинг использования API
- Создать систему кэширования данных

### 3. **Календарные события**
- Реализовать синхронизацию с Google Calendar
- Добавить обработку конфликтов событий
- Создать систему уведомлений
- Мониторить производительность синхронизации

### 4. **AI интеграции**
- Документировать все AI интеграции
- Создать стандартные промпты для событий
- Реализовать fallback механизмы
- Добавить мониторинг AI использования

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_google_oauth_account_user_relationship(self):
    """Тест связи GoogleOAuthAccount с пользователем"""
    user = User.objects.create_user(username='testuser')
    
    oauth_account = GoogleOAuthAccount.objects.create(
        user=user,
        google_id='123456789',
        email='test@example.com',
        name='Test User',
        access_token='test_token',
        token_expires_at=timezone.now() + timedelta(hours=1)
    )
    
    self.assertEqual(oauth_account.user, user)
    self.assertEqual(user.google_oauth_account, oauth_account)

def test_google_calendar_event_finance_integration(self):
    """Тест интеграции календарных событий с финансами"""
    user = User.objects.create_user(username='testuser')
    grade = Grade.objects.create(name='Senior')
    currency_rate = CurrencyRate.objects.create(
        currency='USD',
        rate=1.0,
        date=timezone.now().date()
    )
    
    event = GoogleCalendarEvent.objects.create(
        user=user,
        title='Interview Event',
        grade=grade,
        currency_rate=currency_rate
    )
    
    self.assertEqual(event.grade, grade)
    self.assertEqual(event.currency_rate, currency_rate)

def test_oauth_service_user_integration(self):
    """Тест интеграции OAuth сервиса с пользователем"""
    user = User.objects.create_user(username='testuser')
    
    service = GoogleOAuthService(user)
    oauth_account = service.get_oauth_account()
    
    self.assertIsNone(oauth_account)  # Пока не создан
    
    # Создание OAuth аккаунта
    oauth_account = GoogleOAuthAccount.objects.create(
        user=user,
        google_id='123456789',
        email='test@example.com',
        name='Test User',
        access_token='test_token',
        token_expires_at=timezone.now() + timedelta(hours=1)
    )
    
    service = GoogleOAuthService(user)
    retrieved_account = service.get_oauth_account()
    
    self.assertEqual(retrieved_account, oauth_account)
```

### 2. **Integration тесты**
```python
def test_full_google_oauth_workflow(self):
    """Тест полного рабочего процесса Google OAuth"""
    # Создание пользователя
    user = User.objects.create_user(username='testuser')
    
    # Создание OAuth аккаунта
    oauth_account = GoogleOAuthAccount.objects.create(
        user=user,
        google_id='123456789',
        email='test@example.com',
        name='Test User',
        access_token='test_token',
        token_expires_at=timezone.now() + timedelta(hours=1)
    )
    
    # Создание календарного события
    grade = Grade.objects.create(name='Senior')
    event = GoogleCalendarEvent.objects.create(
        user=user,
        title='Interview Event',
        grade=grade
    )
    
    # Проверка связей
    self.assertEqual(oauth_account.user, user)
    self.assertEqual(event.user, user)
    self.assertEqual(event.grade, grade)
    self.assertIn(event, user.google_calendar_events.all())
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики OAuth**
- Количество активных OAuth аккаунтов
- Количество успешных авторизаций
- Количество ошибок OAuth
- Время жизни токенов

### 2. **Метрики календаря**
- Количество созданных событий
- Количество синхронизированных событий
- Количество конфликтов событий
- Производительность синхронизации

### 3. **Метрики интеграций**
- Использование финансовых данных в событиях
- Использование AI для генерации контента
- Количество API запросов к Google
- Успешность интеграций

### 4. **Алерты**
- Ошибки OAuth авторизации
- Проблемы с Google API
- Сбои в синхронизации календаря
- Истечение токенов

## 🔄 **Сервисный слой и изоляция**

### 1. **Изоляция сервисов**
- Все бизнес-логика вынесена в сервисы
- Сервисы изолированы от других приложений
- Модели доступны для внешнего использования

### 2. **Сервисы Google OAuth**
- `GoogleOAuthService` - OAuth операции
- `GoogleCalendarService` - календарные операции
- `GoogleDriveService` - Drive операции
- `GoogleSheetsService` - Sheets операции

### 3. **Зависимости сервисов**
```python
GoogleOAuthService
    ├── User (внешняя модель)
    ├── GoogleOAuthAccount (внутренняя модель)
    └── Google API (внешний сервис)

GoogleCalendarService
    ├── GoogleOAuthAccount (внутренняя модель)
    ├── GoogleCalendarEvent (внутренняя модель)
    ├── Grade (внешняя модель)
    ├── CurrencyRate (внешняя модель)
    └── Google Calendar API (внешний сервис)

GoogleDriveService
    ├── GoogleOAuthAccount (внутренняя модель)
    ├── GoogleDriveFile (внутренняя модель)
    └── Google Drive API (внешний сервис)
```

## 📝 **Выводы**

Приложение `Google OAuth` является интеграционным центром для Google сервисов в системе HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Критические связи**: Accounts (пользователи и OAuth)
2. **Интеграционные связи**: Finance, Gemini
3. **Системные связи**: Common (навигация)
4. **Потенциальные связи**: Vacancies, Interviewers, Huntflow

### **Критические моменты:**
- OAuth токены критически важны для функциональности
- Google API интеграции требуют мониторинга и ограничений
- Календарные события зависят от финансовых данных
- AI интеграция используется для генерации контента

### **Рекомендации:**
- Регулярно тестировать все Google API интеграции
- Мониторить состояние OAuth токенов
- Документировать все календарные интеграции
- Создать систему резервного копирования OAuth данных

Все связи архитектурно обоснованы и обеспечивают необходимую интеграцию с Google сервисами в системе HR Helper. Приложение `Google OAuth` служит мостом между системой HR Helper и экосистемой Google.
