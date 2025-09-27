# Отчет о связях приложения Telegram с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Telegram` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.accounts (КРИТИЧЕСКАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Прямая зависимость через модель `User` и Telegram интеграцию.
- **Детали**: 
  - Модель `TelegramUser` имеет `OneToOneField` связь с моделью `User`
  - Модель `User` имеет обратную связь `telegram_user` с `TelegramUser`
  - Telegram авторизация требует аутентифицированного пользователя
- **Файлы, где обнаружена связь**:
    - `apps/telegram/models.py`:
        ```python
        class TelegramUser(models.Model):
            user = models.OneToOneField(
                User,
                on_delete=models.CASCADE,
                related_name='telegram_user',
                verbose_name='Пользователь'
            )
            phone_number = models.CharField(max_length=20, blank=True, null=True)
            telegram_id = models.BigIntegerField(unique=True, blank=True, null=True)
            username = models.CharField(max_length=100, blank=True, null=True)
            first_name = models.CharField(max_length=100, blank=True, null=True)
            last_name = models.CharField(max_length=100, blank=True, null=True)
            session_string = models.TextField(blank=True, null=True)
            is_authorized = models.BooleanField(default=False)
            last_activity = models.DateTimeField(auto_now=True)
        ```
    - `apps/accounts/models.py`:
        ```python
        class User(AbstractUser):
            telegram_user = models.OneToOneField(
                'telegram.TelegramUser',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
                related_name='user_account',
                verbose_name='Telegram пользователь'
            )
        ```
    - `apps/telegram/views.py`: Проверка аутентификации пользователя
    - `apps/telegram/telegram_client.py`: Использование пользователя для авторизации
- **Влияние**: Без приложения `apps.accounts` и системы пользователей Telegram функциональность полностью неработоспособна.

### 2. **apps.common (СИСТЕМНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Косвенная зависимость через навигацию и UI компоненты.
- **Детали**: Приложение `apps.common` предоставляет общие компоненты интерфейса, включая сайдбар с навигацией к Telegram функциональности.
- **Файлы, где обнаружена связь**:
    - `apps/common/templates/common/sidebar_menu.html`: Ссылка на Telegram
    - `apps/common/templatetags/sidebar_tags.py`: Генерация меню навигации
    - `apps/telegram/urls.py`: URL маршруты для Telegram
- **Влияние**: Навигация к Telegram функциональности зависит от корректной работы `apps.common`.

### 3. **apps.vacancies (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через уведомления о вакансиях.
- **Детали**: Приложение `apps.vacancies` может использовать Telegram для отправки уведомлений о новых вакансиях, изменениях в статусе кандидатов, напоминаний о интервью и обновлениях в процессе рекрутинга.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/vacancies/views.py`: Потенциальная отправка Telegram уведомлений
    - `apps/vacancies/logic/vacancy_handlers.py`: Потенциальная интеграция с Telegram API
    - `apps/telegram/telegram_client.py`: Готовность к интеграции с уведомлениями
- **Влияние**: Потенциальная интеграция вакансий с Telegram для уведомлений.

### 4. **apps.interviewers (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через уведомления об интервью.
- **Детали**: Приложение `apps.interviewers` может использовать Telegram для отправки уведомлений о предстоящих интервью, изменениях в расписании интервьюеров, напоминаний о встречах и обновлениях в процессе интервью.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/interviewers/views.py`: Потенциальная отправка Telegram уведомлений
    - `apps/interviewers/logic/interviewer_handlers.py`: Потенциальная интеграция с Telegram API
    - `apps/telegram/telegram_client.py`: Готовность к интеграции с уведомлениями
- **Влияние**: Потенциальная интеграция интервью с Telegram для уведомлений.

### 5. **apps.huntflow (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через уведомления о кандидатах.
- **Детали**: Приложение `apps.huntflow` может использовать Telegram для отправки уведомлений о новых кандидатах, изменениях в статусе заявок, напоминаний о действиях и обновлениях в процессе рекрутинга.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/huntflow/views.py`: Потенциальная отправка Telegram уведомлений
    - `apps/huntflow/services.py`: Потенциальная интеграция с Telegram API
    - `apps/telegram/telegram_client.py`: Готовность к интеграции с уведомлениями
- **Влияние**: Потенциальная интеграция Huntflow с Telegram для уведомлений.

### 6. **apps.gemini (ПОТЕНЦИАЛЬНАЯ ЗАВИСИМОСТЬ)**
- **Тип связи**: Потенциальная интеграция через AI уведомления.
- **Детали**: Приложение `apps.gemini` может использовать Telegram для отправки AI-генерированных уведомлений, резюме анализов, рекомендаций и обновлений о статусе AI операций.
- **Файлы, где потенциально обнаружена связь**:
    - `apps/gemini/views.py`: Потенциальная отправка Telegram уведомлений
    - `apps/gemini/logic/gemini_service.py`: Потенциальная интеграция с Telegram API
    - `apps/telegram/telegram_client.py`: Готовность к интеграции с AI уведомлениями
- **Влияние**: Потенциальная интеграция AI функциональности с Telegram для уведомлений.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                   Telegram Application                      │
├─────────────────────────────────────────────────────────────┤
│  Core Models                                               │
│  ├── TelegramUser (Telegram пользователи)                  │
│  │   └── → apps.accounts.User (OneToOne)                   │
│  ├── AuthAttempt (Попытки авторизации)                     │
│  └── TelegramClient (Клиенты для авторизации)             │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── TelegramClient (Основной клиент)                      │
│  ├── QR Code Generator (Генерация QR кодов)               │
│  ├── Session Management (Управление сессиями)             │
│  └── Notification Service (Сервис уведомлений)            │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├── Telegram API (Telethon)                               │
│  ├── Phone Number Auth (Авторизация по номеру)            │
│  ├── QR Code Auth (Авторизация по QR коду)                │
│  └── Session Management (Управление сессиями)             │
├─────────────────────────────────────────────────────────────┤
│  Potential Integrations                                     │
│  ├── Vacancies (Recruitment Notifications)                │
│  ├── Interviewers (Interview Notifications)               │
│  ├── Huntflow (Candidate Notifications)                   │
│  └── Gemini (AI Notifications)                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (OneToOne)**
- `TelegramUser.user` ← OneToOne → `User`
- `User.telegram_user` ← OneToOne → `TelegramUser`

### 2. **Telegram авторизация**
- Phone number authentication → Telegram API
- QR code authentication → Telegram API
- Session management → Telegram sessions

### 3. **Потенциальные уведомления**
- Vacancy notifications → Telegram messages
- Interview notifications → Telegram messages
- Huntflow notifications → Telegram messages
- AI notifications → Telegram messages

### 4. **UI и навигация**
- `apps.common` → Telegram navigation
- Sidebar menu → Telegram dashboard
- Notification interface → User experience

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.accounts**: Критически важно для пользователей и Telegram интеграции

### 2. **Системные зависимости**
- **apps.common**: Навигация и UI компоненты

### 3. **Потенциальные зависимости**
- **apps.vacancies**: Потенциальные уведомления о вакансиях
- **apps.interviewers**: Потенциальные уведомления об интервью
- **apps.huntflow**: Потенциальные уведомления о кандидатах
- **apps.gemini**: Потенциальные AI уведомления

## 🔧 **Рекомендации по управлению связями**

### 1. **Telegram авторизация и безопасность**
- Реализовать безопасное хранение Telegram сессий
- Добавить валидацию Telegram токенов
- Создать механизм ротации сессий
- Ограничить доступ к Telegram данным

### 2. **Telegram API интеграции**
- Создать единый интерфейс для Telegram API
- Реализовать обработку ошибок API
- Добавить мониторинг использования API
- Создать систему кэширования данных

### 3. **Управление уведомлениями**
- Реализовать систему уведомлений
- Добавить обработку ошибок отправки
- Создать систему приоритизации уведомлений
- Мониторить доставляемость уведомлений

### 4. **Потенциальные интеграции**
- Документировать все потенциальные интеграции
- Создать API для отправки уведомлений
- Реализовать стандартные шаблоны уведомлений
- Добавить мониторинг интеграций

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_telegram_user_user_relationship(self):
    """Тест связи TelegramUser с пользователем"""
    user = User.objects.create_user(username='testuser')
    
    telegram_user = TelegramUser.objects.create(
        user=user,
        phone_number='+1234567890',
        telegram_id=123456789,
        username='testuser',
        first_name='Test',
        last_name='User',
        is_authorized=True
    )
    
    self.assertEqual(telegram_user.user, user)
    self.assertEqual(user.telegram_user, telegram_user)

def test_telegram_client_user_integration(self):
    """Тест интеграции Telegram клиента с пользователем"""
    user = User.objects.create_user(username='testuser')
    
    telegram_user = TelegramUser.objects.create(
        user=user,
        phone_number='+1234567890',
        is_authorized=True
    )
    
    # Тест создания клиента
    from apps.telegram.telegram_client import run_telegram_auth_sync
    
    result = run_telegram_auth_sync(
        telegram_user.id, 
        'get_qr_code'
    )
    
    self.assertIsNotNone(result)

def test_telegram_notification_potential(self):
    """Тест потенциальной функциональности уведомлений"""
    user = User.objects.create_user(username='testuser')
    
    telegram_user = TelegramUser.objects.create(
        user=user,
        phone_number='+1234567890',
        telegram_id=123456789,
        is_authorized=True
    )
    
    # Тест готовности к уведомлениям
    self.assertTrue(telegram_user.is_authorized)
    self.assertIsNotNone(telegram_user.telegram_id)
```

### 2. **Integration тесты**
```python
def test_full_telegram_workflow(self):
    """Тест полного рабочего процесса Telegram"""
    # Создание пользователя
    user = User.objects.create_user(username='testuser')
    
    # Создание Telegram пользователя
    telegram_user = TelegramUser.objects.create(
        user=user,
        phone_number='+1234567890',
        telegram_id=123456789,
        username='testuser',
        first_name='Test',
        last_name='User',
        is_authorized=True
    )
    
    # Создание попытки авторизации
    auth_attempt = AuthAttempt.objects.create(
        telegram_user=telegram_user,
        attempt_type='QR_CODE',
        status='SUCCESS'
    )
    
    # Проверка связей
    self.assertEqual(telegram_user.user, user)
    self.assertEqual(user.telegram_user, telegram_user)
    self.assertEqual(auth_attempt.telegram_user, telegram_user)
    self.assertIn(auth_attempt, telegram_user.auth_attempts.all())
    self.assertTrue(telegram_user.is_authorized)
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики авторизации**
- Количество успешных авторизаций
- Количество неудачных попыток авторизации
- Время авторизации
- Количество активных сессий

### 2. **Метрики уведомлений**
- Количество отправленных уведомлений
- Количество доставленных уведомлений
- Количество ошибок отправки
- Время доставки уведомлений

### 3. **Метрики API**
- Количество API запросов к Telegram
- Время ответа Telegram API
- Количество ошибок API
- Использование кэша

### 4. **Алерты**
- Ошибки Telegram авторизации
- Проблемы с отправкой уведомлений
- Сбои в API интеграции
- Превышение лимитов API

## 🔄 **Сервисный слой и изоляция**

### 1. **Изоляция сервисов**
- Все бизнес-логика вынесена в клиенты
- Клиенты изолированы от других приложений
- Модели доступны для внешнего использования

### 2. **Сервисы Telegram**
- `TelegramClient` - основной клиент для авторизации
- `QRCodeGenerator` - генерация QR кодов
- `SessionManager` - управление сессиями
- `NotificationService` - отправка уведомлений

### 3. **Зависимости сервисов**
```python
TelegramClient
    ├── User (внешняя модель)
    ├── TelegramUser (внутренняя модель)
    ├── Telegram API (внешний сервис)
    └── Session Management (внутренняя логика)

QRCodeGenerator
    ├── Telegram API (внешний сервис)
    └── QR Code generation (внутренняя логика)

SessionManager
    ├── TelegramUser (внутренняя модель)
    ├── Session storage (внутренняя логика)
    └── Session validation (внутренняя логика)

NotificationService
    ├── TelegramUser (внутренняя модель)
    ├── Telegram API (внешний сервис)
    └── Message templates (внутренняя логика)
```

## 📝 **Выводы**

Приложение `Telegram` является интеграционным центром для системы уведомлений Telegram в системе HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Критические связи**: Accounts (пользователи и Telegram интеграция)
2. **Системные связи**: Common (навигация)
3. **Потенциальные связи**: Vacancies, Interviewers, Huntflow, Gemini

### **Критические моменты:**
- Telegram авторизация критически важна для функциональности
- Управление сессиями требует безопасности и надежности
- Потенциальные уведомления требуют планирования
- API интеграция требует мониторинга

### **Рекомендации:**
- Регулярно тестировать все Telegram API интеграции
- Мониторить состояние авторизации и сессий
- Документировать все потенциальные интеграции
- Создать систему резервного копирования Telegram данных

Все связи архитектурно обоснованы и обеспечивают необходимую интеграцию с системой Telegram в системе HR Helper. Приложение `Telegram` служит мостом между системой HR Helper и платформой уведомлений Telegram.
