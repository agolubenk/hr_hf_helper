# Отчет о связях приложения Accounts с другими приложениями

## 📋 **Обзор**

Данный документ описывает выявленные связи и зависимости приложения `Accounts` с другими приложениями в рамках проекта HR Helper. Цель - обеспечить понимание архитектурных взаимодействий и потенциальных точек влияния при изменениях.

## 🔗 **Выявленные связи**

### 1. **apps.google_oauth**
- **Тип связи**: Прямая зависимость через модель `GoogleOAuthAccount`.
- **Детали**: Модель `User` имеет `OneToOneField` связь с `GoogleOAuthAccount` через поле `google_oauth_account`. Это позволяет пользователям аутентифицироваться через Google OAuth.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        google_oauth_account = models.OneToOneField(
            'google_oauth.GoogleOAuthAccount',
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name='user_account',
            verbose_name='Google OAuth аккаунт'
        )
        ```
    - `apps/accounts/logic/oauth_service.py`: Использует `GoogleOAuthAccount` для управления OAuth интеграцией
    - `apps/accounts/logic/auth_adapters.py`: Кастомные адаптеры для OAuth аутентификации
- **Влияние**: Корректная работа Google OAuth полностью зависит от наличия и правильной настройки `apps.google_oauth`.

### 2. **apps.telegram**
- **Тип связи**: Прямая зависимость через модель `TelegramUser`.
- **Детали**: Модель `User` имеет `OneToOneField` связь с `TelegramUser` через поле `telegram_user`. Это позволяет пользователям получать уведомления через Telegram.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        telegram_user = models.OneToOneField(
            'telegram.TelegramUser',
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name='user_account',
            verbose_name='Telegram пользователь'
        )
        ```
    - `apps/accounts/logic/user_service.py`: Использует `TelegramUser` для управления уведомлениями
- **Влияние**: Функциональность Telegram уведомлений зависит от корректной работы `apps.telegram`.

### 3. **apps.interviewers**
- **Тип связи**: Прямая зависимость через систему групп Django.
- **Детали**: Пользователи в группе 'Интервьюер' могут быть привязаны к интервьюерам в приложении `apps.interviewers`. Модель `Interviewer` ссылается на `User` через `ForeignKey`.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/logic/role_service.py`: Управление ролями и группами пользователей
    - `apps/interviewers/models.py`: Модель `Interviewer` ссылается на `User`
    - `apps/accounts/management/commands/assign_role.py`: Команда для назначения ролей
- **Влияние**: Создание и управление интервьюерами зависит от корректной работы системы групп в `apps.accounts`.

### 4. **apps.vacancies**
- **Тип связи**: Прямая зависимость через модель `Vacancy`.
- **Детали**: Модель `Vacancy` имеет `ForeignKey` поле `recruiter`, которое ссылается на модель `User`. Пользователи в группе 'Рекрутер' могут быть назначены рекрутерами для вакансий.
- **Файлы, где обнаружена связь**:
    - `apps/vacancies/models.py`:
        ```python
        recruiter = models.ForeignKey(
            User,
            on_delete=models.CASCADE,
            related_name='vacancies',
            verbose_name='Ответственный рекрутер',
            help_text='Рекрутер, ответственный за вакансию',
            limit_choices_to={'groups__name': 'Рекрутер'}
        )
        ```
    - `apps/accounts/logic/role_service.py`: Управление группой 'Рекрутер'
    - `apps/vacancies/forms.py`: Формы используют `User` для выбора рекрутеров
- **Влияние**: Функциональность вакансий полностью зависит от наличия пользователей в группе 'Рекрутер'.

### 5. **apps.huntflow**
- **Тип связи**: Косвенная зависимость через API ключи пользователя.
- **Детали**: Модель `User` содержит поле `huntflow_api_key` для хранения API ключа Huntflow. Это позволяет пользователям интегрироваться с системой Huntflow.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        huntflow_api_key = models.CharField(
            max_length=255,
            blank=True,
            null=True,
            verbose_name='Huntflow API ключ',
            help_text='API ключ для интеграции с Huntflow'
        )
        ```
    - `apps/huntflow/services.py`: Использует `user.huntflow_api_key` для API запросов
- **Влияние**: Интеграция с Huntflow зависит от наличия корректных API ключей у пользователей.

### 6. **apps.gemini**
- **Тип связи**: Косвенная зависимость через API ключи пользователя.
- **Детали**: Модель `User` содержит поле `gemini_api_key` для хранения API ключа Gemini. Это позволяет пользователям использовать AI функциональность Gemini.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        gemini_api_key = models.CharField(
            max_length=255,
            blank=True,
            null=True,
            verbose_name='Gemini API ключ',
            help_text='API ключ для интеграции с Gemini AI'
        )
        ```
    - `apps/gemini/services.py`: Использует `user.gemini_api_key` для AI запросов
- **Влияние**: AI функциональность зависит от наличия корректных API ключей Gemini у пользователей.

### 7. **apps.clickup_int**
- **Тип связи**: Косвенная зависимость через API ключи пользователя.
- **Детали**: Модель `User` содержит поле `clickup_api_key` для хранения API ключа ClickUp. Это позволяет пользователям интегрироваться с системой управления задачами ClickUp.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        clickup_api_key = models.CharField(
            max_length=255,
            blank=True,
            null=True,
            verbose_name='ClickUp API ключ',
            help_text='API ключ для интеграции с ClickUp'
        )
        ```
    - `apps/clickup_int/services.py`: Использует `user.clickup_api_key` для API запросов
- **Влияние**: Интеграция с ClickUp зависит от наличия корректных API ключей у пользователей.

### 8. **apps.notion_int**
- **Тип связи**: Косвенная зависимость через API ключи пользователя.
- **Детали**: Модель `User` содержит поле `notion_integration_token` для хранения интеграционного токена Notion. Это позволяет пользователям интегрироваться с системой управления знаниями Notion.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/models.py`:
        ```python
        notion_integration_token = models.CharField(
            max_length=255,
            blank=True,
            null=True,
            verbose_name='Notion Integration Token',
            help_text='Интеграционный токен для Notion'
        )
        ```
    - `apps/notion_int/services.py`: Использует `user.notion_integration_token` для API запросов
- **Влияние**: Интеграция с Notion зависит от наличия корректных интеграционных токенов у пользователей.

### 9. **apps.finance**
- **Тип связи**: Косвенная зависимость через систему групп пользователей.
- **Детали**: Пользователи могут иметь различные роли в финансовой системе (например, доступ к зарплатной информации). Система групп Django позволяет управлять правами доступа к финансовым данным.
- **Файлы, где обнаружена связь**:
    - `apps/accounts/logic/role_service.py`: Управление финансовыми ролями
    - `apps/finance/views.py`: Проверка прав доступа пользователей
- **Влияние**: Доступ к финансовой информации зависит от корректной настройки ролей пользователей.

## 📊 **Схема связей**

```
┌─────────────────────────────────────────────────────────────┐
│                    Accounts Application                     │
├─────────────────────────────────────────────────────────────┤
│  User Model (Central Hub)                                  │
│  ├── OneToOne → GoogleOAuthAccount (google_oauth)          │
│  ├── OneToOne → TelegramUser (telegram)                    │
│  ├── Groups → Interviewer (interviewers)                   │
│  ├── Groups → Recruiter (vacancies)                        │
│  ├── API Keys → Huntflow Integration                       │
│  ├── API Keys → Gemini AI Integration                      │
│  ├── API Keys → ClickUp Integration                        │
│  ├── API Keys → Notion Integration                         │
│  └── Groups → Finance Access (finance)                     │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── UserService (Core user management)                    │
│  ├── RoleService (Group and permission management)         │
│  ├── OAuthService (Google OAuth integration)               │
│  └── AuthAdapters (Custom authentication)                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (Foreign Key / OneToOne)**
- `GoogleOAuthAccount` ← OneToOne → `User`
- `TelegramUser` ← OneToOne → `User`
- `Interviewer` ← ForeignKey → `User`
- `Vacancy.recruiter` ← ForeignKey → `User`

### 2. **Косвенные связи (API ключи)**
- `User.huntflow_api_key` → Huntflow API calls
- `User.gemini_api_key` → Gemini AI API calls
- `User.clickup_api_key` → ClickUp API calls
- `User.notion_integration_token` → Notion API calls

### 3. **Системные связи (Groups)**
- Django Groups → Role-based access control
- Group 'Рекрутер' → Vacancy management
- Group 'Интервьюер' → Interviewer management
- Group 'Администратор' → System administration

## ⚠️ **Критические зависимости**

### 1. **Обязательные зависимости**
- **apps.google_oauth**: Требуется для OAuth аутентификации
- **apps.interviewers**: Требуется для системы интервьюеров
- **apps.vacancies**: Требуется для системы вакансий

### 2. **Опциональные зависимости**
- **apps.huntflow**: Опциональная интеграция с Huntflow
- **apps.gemini**: Опциональная AI интеграция
- **apps.clickup_int**: Опциональная интеграция с ClickUp
- **apps.notion_int**: Опциональная интеграция с Notion
- **apps.telegram**: Опциональная интеграция с Telegram

## 🔧 **Рекомендации по управлению связями**

### 1. **Миграции и изменения**
- При изменении модели `User` проверить все связанные приложения
- Обновить миграции во всех зависимых приложениях
- Протестировать интеграции после изменений

### 2. **API ключи и токены**
- Реализовать безопасное хранение API ключей
- Добавить валидацию API ключей
- Создать механизм ротации ключей

### 3. **Роли и права доступа**
- Централизовать управление ролями в `apps.accounts`
- Создать единую систему проверки прав доступа
- Документировать все роли и их права

### 4. **Интеграции**
- Создать единый интерфейс для внешних интеграций
- Реализовать обработку ошибок интеграций
- Добавить мониторинг состояния интеграций

## 🧪 **Тестирование связей**

### 1. **Unit тесты**
```python
def test_user_google_oauth_integration(self):
    """Тест интеграции пользователя с Google OAuth"""
    user = User.objects.create_user(username='testuser')
    google_account = GoogleOAuthAccount.objects.create(
        user_account=user,
        google_id='123456789'
    )
    
    self.assertEqual(user.google_oauth_account, google_account)
    self.assertEqual(google_account.user_account, user)

def test_user_vacancy_recruiter_relationship(self):
    """Тест связи пользователя с вакансиями как рекрутер"""
    recruiter = User.objects.create_user(username='recruiter')
    recruiter.groups.add(Group.objects.get(name='Рекрутер'))
    
    vacancy = Vacancy.objects.create(
        name='Test Vacancy',
        external_id='TEST001',
        recruiter=recruiter,
        invite_title='Test Invite',
        invite_text='Test Text',
        scorecard_title='Test Scorecard'
    )
    
    self.assertEqual(vacancy.recruiter, recruiter)
    self.assertIn(vacancy, recruiter.vacancies.all())
```

### 2. **Integration тесты**
```python
def test_full_user_workflow(self):
    """Тест полного рабочего процесса пользователя"""
    # Создание пользователя
    user = User.objects.create_user(username='testuser')
    
    # Назначение роли рекрутера
    recruiter_group = Group.objects.get(name='Рекрутер')
    user.groups.add(recruiter_group)
    
    # Создание вакансии
    vacancy = Vacancy.objects.create(
        name='Test Vacancy',
        external_id='TEST001',
        recruiter=user,
        invite_title='Test Invite',
        invite_text='Test Text',
        scorecard_title='Test Scorecard'
    )
    
    # Проверка связей
    self.assertTrue(user.groups.filter(name='Рекрутер').exists())
    self.assertEqual(vacancy.recruiter, user)
    self.assertIn(vacancy, user.vacancies.all())
```

## 📈 **Мониторинг и метрики**

### 1. **Метрики связей**
- Количество пользователей с Google OAuth
- Количество пользователей с Telegram
- Количество рекрутеров и интервьюеров
- Активность интеграций

### 2. **Алерты**
- Ошибки в OAuth интеграции
- Проблемы с API ключами
- Нарушения прав доступа
- Сбои в системе ролей

## 📝 **Выводы**

Приложение `Accounts` является центральным узлом системы HR Helper и имеет множественные связи с другими приложениями:

### **Основные связи:**
1. **Прямые связи**: Google OAuth, Telegram, Interviewers, Vacancies
2. **Косвенные связи**: Huntflow, Gemini, ClickUp, Notion через API ключи
3. **Системные связи**: Роли и права доступа через Django Groups

### **Критические моменты:**
- Изменения в модели `User` влияют на все связанные приложения
- API ключи требуют безопасного хранения и управления
- Система ролей должна быть централизованной и консистентной

### **Рекомендации:**
- Регулярно тестировать все интеграции
- Мониторить состояние связей между приложениями
- Документировать все изменения в связях
- Создать единую систему управления API ключами

Все связи архитектурно обоснованы и обеспечивают необходимую функциональность системы HR Helper.
