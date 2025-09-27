# Отчет о связях приложения Gemini с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Gemini` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.accounts (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модель `User` и API ключи.
- **Детали**: 
  - Модель `User` содержит поле `gemini_api_key` для хранения API ключа Gemini
  - Модель `ChatSession` имеет `ForeignKey` к модели `User`
  - Модель `ChatMessage` связана с пользователем через сессию
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        class User(AbstractUser):
            gemini_api_key = models.CharField(
                max_length=255,
                blank=True,
                null=True,
                verbose_name='Gemini API ключ',
                help_text='API ключ для интеграции с Gemini AI'
            )
        ```
    - `apps/gemini/models.py`:
        ```python
        class ChatSession(models.Model):
            user = models.ForeignKey(
                User,
                on_delete=models.CASCADE,
                related_name='gemini_chat_sessions',
                verbose_name='Пользователь'
            )
        ```
    - `apps/gemini/logic/services.py`: Использует `user.gemini_api_key` для API запросов
    - `apps/gemini/views.py`: Проверка наличия API ключа у пользователя
- **Влияние**: Без приложения `apps.accounts` и API ключей пользователей функциональность Gemini полностью неработоспособна.

### 2. **apps.finance (ИНТЕГРАЦИОННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через `GeminiService`.
- **Детали**: Приложение `apps.finance` использует `GeminiService` для AI анализа финансовых данных, генерации отчетов и рекомендаций по зарплатным вилкам.
- **Файлы, где обнаружена связь**:
    - `apps/finance/logic/salary_service.py`: Импорт `GeminiService`
    - `apps/finance/views.py`: Использование AI для анализа зарплат
    - `apps/finance/tasks.py`: Автоматическая генерация отчетов через AI
    - `apps/gemini/logic/services.py`: Предоставляет `GeminiService` для других приложений
- **Влияние**: AI функциональность в финансовом приложении зависит от корректной работы `GeminiService`.

### 3. **apps.google_oauth (ИНТЕГРАЦИОННАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через `GeminiService`.
- **Детали**: Приложение `apps.google_oauth` использует `GeminiService` для генерации AI контента в Google Calendar событиях, создания умных описаний и автоматической категоризации событий.
- **Файлы, где обнаружена связь**:
    - `apps/google_oauth/services.py`: Импорт `GeminiService`
    - `apps/google_oauth/views.py`: Использование AI для генерации контента
    - `apps/google_oauth/tasks.py`: Автоматическая обработка событий через AI
    - `apps/gemini/logic/services.py`: Предоставляет `GeminiService` для интеграций
- **Влияние**: AI функциональность в Google OAuth приложении зависит от корректной работы `GeminiService`.

### 4. **apps.common (СИСТЕМНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через навигацию и UI компоненты.
- **Детали**: Приложение `apps.common` предоставляет общие компоненты интерфейса, включая сайдбар с навигацией к Gemini чату.
- **Файлы, где обнаружена связь**:
    - `apps/common/templates/common/sidebar_menu.html`: Ссылка на Gemini чат
    - `apps/common/templatetags/sidebar_tags.py`: Генерация меню навигации
    - `apps/gemini/urls.py`: URL маршруты для Gemini
- **Влияние**: Навигация к Gemini функциональности зависит от корректной работы `apps.common`.

### 5. **apps.vacancies (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через AI анализ.
- **Детали**: Приложение `apps.vacancies` может использовать `GeminiService` для AI анализа вакансий, генерации описаний, автоматической категоризации и рекомендаций по улучшению.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/vacancies/views.py`: Потенциальное использование AI для анализа вакансий
    - `apps/vacancies/logic/vacancy_handlers.py`: Потенциальная AI обработка
    - `apps/gemini/logic/services.py`: Готовность к интеграции с вакансиями
- **Влияние**: Потенциальная AI функциональность в управлении вакансиями.

### 6. **apps.interviewers (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через AI анализ интервью.
- **Детали**: Приложение `apps.interviewers` может использовать `GeminiService` для AI анализа интервью, генерации вопросов, автоматической оценки кандидатов и рекомендаций по улучшению процесса.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/interviewers/views.py`: Потенциальное использование AI для анализа интервью
    - `apps/interviewers/logic/interviewer_handlers.py`: Потенциальная AI обработка
    - `apps/gemini/logic/services.py`: Готовность к интеграции с интервьюерами
- **Влияние**: Потенциальная AI функциональность в управлении интервьюерами.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                    Gemini Application                       │
├─────────────────────────────────────────────────────────────┤
│  Core Models                                               │
│  ├── ChatSession (Сессии чата)                             │
│  │   └── → apps.accounts.User (ForeignKey)                 │
│  ├── ChatMessage (Сообщения чата)                          │
│  │   └── → ChatSession (ForeignKey)                        │
│  └── GeminiService (AI сервис)                             │
│      ├── → apps.accounts.User.gemini_api_key               │
│      ├── → apps.finance (интеграция)                       │
│      └── → apps.google_oauth (интеграция)                  │
├─────────────────────────────────────────────────────────────┤
│  Logic Layer                                                │
│  ├── MessageHandler (Обработка сообщений)                  │
│  ├── ApiKeyHandler (Управление API ключами)                │
│  ├── StatsHandler (Статистика)                             │
│  ├── GeminiService (Основной AI сервис)                    │
│  └── ResponseHandler (Обработка ответов)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (Foreign Key)**
- `ChatSession.user` ← ForeignKey → `User`
- `ChatMessage.session` ← ForeignKey → `ChatSession`

### 2. **API ключи и аутентификация**
- `User.gemini_api_key` → Gemini API calls
- API ключ используется для аутентификации в Google Gemini API

### 3. **Сервисные интеграции**
- `GeminiService` → Finance AI analysis
- `GeminiService` → Google OAuth AI content generation

### 4. **UI и навигация**
- `apps.common` → Gemini navigation
- Sidebar menu → Gemini chat interface

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.accounts**: Критически важно для пользователей и API ключей

### 2. **Интеграционные зависимости**
- **apps.finance**: Важно для AI анализа финансовых данных
- **apps.google_oauth**: Важно для AI генерации контента

### 3. **Системные зависимости**
- **apps.common**: Навигация и UI компоненты

### 4. **Потенциальные зависимости**
- **apps.vacancies**: Потенциальная AI интеграция
- **apps.interviewers**: Потенциальная AI интеграция

## 🔧 **Рекомендации по управлению связями**

### 1. **API ключи и безопасность**
- Реализовать безопасное хранение API ключей Gemini
- Добавить валидацию API ключей
- Создать механизм ротации ключей
- Ограничить доступ к API ключам

### 2. **Сервисные интеграции**
- Создать единый интерфейс для AI сервисов
- Реализовать обработку ошибок API
- Добавить мониторинг использования API
- Создать систему кэширования ответов

### 3. **Масштабирование**
- Реализовать rate limiting для API запросов
- Добавить очередь для обработки запросов
- Создать систему приоритизации запросов
- Мониторить использование токенов

### 4. **Интеграции с другими приложениями**
- Документировать все AI интеграции
- Создать стандартные промпты для разных типов задач
- Реализовать версионирование AI моделей
- Добавить fallback механизмы

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_gemini_service_user_integration(self):
    """Тест интеграции GeminiService с пользователем"""
    user = User.objects.create_user(
        username='testuser',
        gemini_api_key='test_api_key'
    )
    
    service = GeminiService(user.gemini_api_key)
    
    self.assertEqual(service.api_key, user.gemini_api_key)
    self.assertIsNotNone(service.session)

def test_chat_session_user_relationship(self):
    """Тест связи сессии чата с пользователем"""
    user = User.objects.create_user(username='testuser')
    
    session = ChatSession.objects.create(
        user=user,
        title='Test Session'
    )
    
    self.assertEqual(session.user, user)
    self.assertIn(session, user.gemini_chat_sessions.all())

def test_finance_gemini_integration(self):
    """Тест интеграции Finance с Gemini"""
    from apps.gemini.logic.services import GeminiService
    
    user = User.objects.create_user(
        username='testuser',
        gemini_api_key='test_api_key'
    )
    
    # Тест использования GeminiService в Finance
    service = GeminiService(user.gemini_api_key)
    
    # Проверка доступности сервиса
    self.assertIsNotNone(service)
```

### 2. **Integration тесты**
```python
def test_full_gemini_workflow(self):
    """Тест полного рабочего процесса Gemini"""
    # Создание пользователя с API ключом
    user = User.objects.create_user(
        username='testuser',
        gemini_api_key='test_api_key'
    )
    
    # Создание сессии чата
    session = ChatSession.objects.create(
        user=user,
        title='Test Session'
    )
    
    # Создание сообщения
    message = ChatMessage.objects.create(
        session=session,
        role='user',
        content='Test message'
    )
    
    # Проверка связей
    self.assertEqual(session.user, user)
    self.assertEqual(message.session, session)
    self.assertIn(message, session.messages.all())
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики использования**
- Количество активных сессий чата
- Количество сообщений в день
- Использование токенов API
- Время ответа Gemini API

### 2. **Метрики интеграций**
- Использование GeminiService в Finance
- Использование GeminiService в Google OAuth
- Количество AI запросов от других приложений
- Успешность интеграций

### 3. **Алерты**
- Ошибки API Gemini
- Превышение лимитов токенов
- Проблемы с аутентификацией
- Сбои в интеграциях

## 🔄 **Сервисный слой и изоляция**

### 1. **Изоляция сервисов**
- Все бизнес-логика вынесена в `logic/` папку
- `GeminiService` доступен для других приложений
- Модели и views изолированы от других приложений

### 2. **Сервисы Gemini**
- `GeminiService` - основной AI сервис
- `MessageHandler` - обработка сообщений чата
- `ApiKeyHandler` - управление API ключами
- `StatsHandler` - статистика использования

### 3. **Зависимости сервисов**
```python
GeminiService
    ├── User.gemini_api_key (внешняя зависимость)
    ├── Google Gemini API (внешний сервис)
    └── Requests library (HTTP клиент)

MessageHandler
    ├── ChatSession (внутренняя модель)
    ├── ChatMessage (внутренняя модель)
    └── GeminiService (внутренний сервис)

ApiKeyHandler
    ├── User (внешняя модель)
    └── GeminiService (внутренний сервис)
```

## 📝 **Выводы**

Приложение `Gemini` является AI-центром системы HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Критические связи**: Accounts (пользователи и API ключи)
2. **Интеграционные связи**: Finance, Google OAuth
3. **Системные связи**: Common (навигация)
4. **Потенциальные связи**: Vacancies, Interviewers

### **Критические моменты:**
- API ключи Gemini критически важны для функциональности
- `GeminiService` используется другими приложениями
- AI интеграции требуют мониторинга и ограничений
- Безопасность API ключей критически важна

### **Рекомендации:**
- Регулярно тестировать все AI интеграции
- Мониторить использование API и токенов
- Документировать все AI промпты и модели
- Создать систему резервного копирования AI данных

Все связи архитектурно обоснованы и обеспечивают необходимую AI функциональность системы HR Helper. Приложение `Gemini` служит центральным узлом для AI возможностей, используемых во всей системе.
