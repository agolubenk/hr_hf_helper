# Архитектурная документация

## LOGIC/ МОДУЛИ

### Base (logic/base/)

#### adapters.py
- **DeprecatedServiceAdapter**: Адаптер для плавной миграции существующих сервисов с предупреждениями об устаревании
  - **__init__**: Инициализация адаптера с сервисом и сообщением об устаревании
  - **__call__**: Вызов метода сервиса с предупреждением об устаревании

#### api_client.py
- **APIResponse**: Dataclass для стандартизированных ответов API
- **BaseAPIClient**: Базовый клиент для взаимодействия с внешними API
  - **__init__**: Инициализация клиента с параметрами подключения
  - **_setup_session**: Настройка HTTP сессии с заголовками
  - **_setup_auth**: Настройка аутентификации
  - **make_request**: Выполнение HTTP запроса
  - **get/post/put/delete**: Методы для различных типов запросов
  - **test_connection**: Тестирование подключения к API

#### api_views.py
- **BaseAPIViewSet**: Базовый класс для API ViewSets с унифицированными ответами
  - **handle_exception**: Обработка исключений с логированием
  - **create/update/destroy/list/retrieve**: Стандартные CRUD операции
- **FinanceAPIViewSet**: Специализированный ViewSet для финансовых данных

#### currency_service.py
- **UnifiedCurrencyService**: Унифицированный сервис для работы с курсами валют
  - **__init__**: Инициализация сервиса с API ключом
  - **_setup_auth**: Настройка аутентификации для NBRB API
  - **get_currency_rate**: Получение курса конкретной валюты
  - **get_all_rates**: Получение всех курсов валют
  - **test_connection**: Тестирование подключения к NBRB API
  - **update_currency_rates_in_db**: Обновление курсов валют в базе данных

#### exceptions.py
- **LogicBaseException**: Базовое исключение для логики
- **APIClientException**: Исключение для ошибок API клиента
- **ValidationException**: Исключение для ошибок валидации
- **SyncException**: Исключение для ошибок синхронизации
- **AnalysisException**: Исключение для ошибок анализа

#### response_handler.py
- **UnifiedResponseHandler**: Унифицированный обработчик ответов для всех приложений
  - **success_response**: Создание успешного ответа
  - **error_response**: Создание ответа с ошибкой
  - **validation_error_response**: Создание ответа с ошибкой валидации
  - **api_response**: Создание API ответа
  - **json_response**: Создание JSON ответа

#### view_adapters.py
- **legacy_view_adapter**: Адаптер для устаревших представлений
- **deprecated_view_wrapper**: Обертка для устаревших представлений с предупреждениями
- **finance_view_adapter**: Адаптер для финансовых представлений

### Integration Shared (logic/integration/shared/)

#### auth_manager.py
- **AuthManager**: Централизованный менеджер аутентификации для всех интеграций
  - **__init__**: Инициализация менеджера с параметрами
  - **authenticate**: Аутентификация в интеграции по типу
  - **_authenticate_huntflow**: Аутентификация в Huntflow
  - **_authenticate_clickup**: Аутентификация в ClickUp
  - **_authenticate_notion**: Аутентификация в Notion
  - **_authenticate_google**: Аутентификация в Google
  - **refresh_token**: Обновление токена доступа
  - **invalidate_token**: Инвалидация токена
  - **test_connection**: Тестирование соединения с интеграцией

#### base_integration.py
- **BaseIntegration**: Базовый класс для всех интеграций с внешними системами
  - **__init__**: Инициализация базовой интеграции
  - **authenticate**: Абстрактный метод аутентификации
  - **test_connection**: Абстрактный метод тестирования подключения
  - **sync_data**: Абстрактный метод синхронизации данных
  - **get_integration_info**: Получение информации об интеграции
  - **get_sync_status**: Получение статуса синхронизации
  - **validate_credentials**: Валидация учетных данных
  - **handle_api_error**: Обработка ошибок API
  - **log_operation**: Логирование операций интеграции
  - **get_rate_limit_info**: Получение информации о лимитах запросов
  - **check_rate_limit**: Проверка лимитов запросов
  - **retry_request**: Повторные попытки выполнения запроса

#### candidate_operations.py
- **BaseCandidateOperations**: Базовый класс для операций с кандидатами
  - **create_candidate**: Абстрактный метод создания кандидата
  - **update_candidate**: Абстрактный метод обновления кандидата
  - **get_candidate**: Абстрактный метод получения кандидата
  - **delete_candidate**: Абстрактный метод удаления кандидата
  - **search_candidates**: Поиск кандидатов (базовая реализация)
  - **link_candidate_to_vacancy**: Привязка кандидата к вакансии (базовая реализация)

#### comment_operations.py
- **BaseCommentOperations**: Базовый класс для операций с комментариями
  - **add_comment**: Абстрактный метод добавления комментария
  - **update_comment**: Абстрактный метод обновления комментария
  - **delete_comment**: Абстрактный метод удаления комментария
  - **get_comments**: Абстрактный метод получения комментариев
  - **bulk_add_comments**: Массовое добавление комментариев (базовая реализация)

#### field_operations.py
- **BaseFieldOperations**: Базовый класс для операций с дополнительными полями
  - **add_custom_field**: Абстрактный метод добавления кастомного поля
  - **update_custom_field**: Абстрактный метод обновления кастомного поля
  - **delete_custom_field**: Абстрактный метод удаления кастомного поля
  - **get_custom_fields**: Абстрактный метод получения кастомных полей
  - **bulk_add_custom_fields**: Массовое добавление кастомных полей (базовая реализация)

#### gemini_operations.py
- **BaseGeminiOperations**: Базовый класс для операций с Gemini AI
  - **__init__**: Инициализация базовых операций с Gemini AI
  - **_setup_auth**: Настройка аутентификации для Gemini API
  - **test_connection**: Тест подключения к Gemini API
  - **direct_analysis**: Прямой анализ данных без промптов

#### status_operations.py
- **BaseStatusOperations**: Базовый класс для операций со статусами
  - **change_status**: Абстрактный метод изменения статуса
  - **get_status_history**: Абстрактный метод получения истории статусов
  - **get_available_statuses**: Абстрактный метод получения доступных статусов
  - **get_current_status**: Получение текущего статуса (базовая реализация)
  - **bulk_change_status**: Массовое изменение статуса (базовая реализация)

### ClickUp Integration (logic/integration/clickup/)

#### clickup_service.py
- **dashboard**: Главная страница интеграции с ClickUp
- **settings**: Страница настроек ClickUp
- **tasks_list**: Список задач ClickUp
- **task_detail**: Детальная информация о задаче ClickUp
- **test_connection**: Тестирование подключения к ClickUp API

#### clickup_api.py
- **ClickUpSettingsViewSet**: ViewSet для управления настройками ClickUp
  - **get_queryset**: Фильтрация queryset по пользователю
  - **create**: Создание настроек ClickUp

#### clickup_candidates.py
- **ClickUpCandidateOperations**: Операции с кандидатами в ClickUp
  - Наследует от BaseCandidateOperations
  - Реализует создание, обновление, получение кандидатов

### Huntflow Integration (logic/integration/huntflow/)

#### huntflow_service.py
- **get_correct_account_id**: Получает правильный account_id пользователя из Huntflow API
- **huntflow_dashboard**: Главная страница интеграции с Huntflow
- **vacancies_list**: Список вакансий для организации
- **candidates_list**: Список кандидатов для организации
- **huntflow_settings**: Настройки интеграции с Huntflow
- **huntflow_sync**: Синхронизация данных с Huntflow
- **huntflow_test_connection**: Тестирование подключения к Huntflow API
- **huntflow_clear_cache**: Очистка кэша Huntflow

#### huntflow_api.py
- **HuntflowCacheViewSet**: ViewSet для просмотра кэша Huntflow
  - **clear_cache**: Очистка кэша
  - **expired**: Получение истекших записей кэша
- **HuntflowLogViewSet**: ViewSet для просмотра логов Huntflow
  - **stats**: Статистика по логам
  - **errors**: Получение логов с ошибками
- **HuntflowApiRequestViewSet**: ViewSet для выполнения API запросов к Huntflow
  - **test_connection**: Тестирование подключения к Huntflow API
  - **get_accounts**: Получение списка организаций
  - **get_vacancies**: Получение списка вакансий
  - **get_candidates**: Получение списка кандидатов

#### huntflow_candidates.py
- **HuntflowCandidateService**: Сервис для работы с кандидатами Huntflow
  - **__init__**: Инициализация сервиса кандидатов Huntflow
  - **_setup_auth**: Настройка аутентификации для Huntflow API
  - **create_candidate**: Создание кандидата в Huntflow
  - **update_candidate**: Обновление кандидата в Huntflow
  - **add_comment**: Добавление комментария к кандидату
  - **update_candidate_status**: Обновление статуса кандидата
  - **test_connection**: Тестирование подключения к Huntflow API

### Compatibility (logic/compatibility_huntflow.py)

#### compatibility_huntflow.py
- **get_huntflow_views**: Получить views для Huntflow (новые или старые)
  - Экспорт основных функций для совместимости

### Notion Integration (logic/integration/notion/)

#### notion_service.py
- **settings**: Страница настроек Notion
- **dashboard**: Главная страница интеграции с Notion
- **pages_list**: Список страниц Notion
- **page_detail**: Детальная информация о странице Notion
- **test_connection**: Тестирование подключения к Notion API

#### notion_api.py
- **NotionSettingsViewSet**: ViewSet для управления настройками Notion
- **NotionPageViewSet**: ViewSet для работы со страницами Notion

#### notion_candidates.py
- **NotionCandidateOperations**: Операции с кандидатами в Notion
  - Наследует от BaseCandidateOperations
  - Реализует создание, обновление, получение кандидатов

## APPS/ACCOUNTS

### apps/accounts/views.py

#### components_template_handler(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request
- **ИСТОЧНИКИ**: ProfileEditForm, IntegrationSettingsForm, демонстрационные данные
- **ОБРАБОТКА**: Создание форм и демонстрационных данных для UI компонентов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → accounts/components_demo.html
- **СВЯЗИ**: ProfileEditForm, IntegrationSettingsForm
- **ФОРМАТ**: HTML render

### apps/accounts/views_api.py

#### UserViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы (GET, POST, PUT, DELETE, PATCH), request.user
- **ИСТОЧНИКИ**: User.objects, UserSerializer, UserCreateSerializer, UserProfileSerializer
- **ОБРАБОТКА**: Наследование от LogicUserViewSet, управление пользователями
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными пользователей
- **СВЯЗИ**: LogicUserViewSet, UserSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

#### profile_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: request.user, UserService
- **ОБРАБОТКА**: Получение данных профиля, формирование дашборда
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными профиля
- **СВЯЗИ**: UserService, UnifiedResponseHandler
- **ФОРМАТ**: DRF Response

#### update_api_keys(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST (gemini_api_key, huntflow_prod_url, huntflow_sandbox_url, clickup_api_key, notion_api_key, telegram_bot_token)
- **ИСТОЧНИКИ**: POST данные формы
- **ОБРАБОТКА**: Валидация и сохранение API ключей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с результатом
- **СВЯЗИ**: UserService, UnifiedResponseHandler
- **ФОРМАТ**: DRF Response

#### test_integration(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST (integration_type, api_key)
- **ИСТОЧНИКИ**: POST данные формы
- **ОБРАБОТКА**: Тестирование интеграции через UserService
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с результатом теста
- **СВЯЗИ**: UserService, UnifiedResponseHandler
- **ФОРМАТ**: DRF Response

#### GroupViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы (GET, POST, PUT, DELETE, PATCH), request.user
- **ИСТОЧНИКИ**: Group.objects, GroupSerializer
- **ОБРАБОТКА**: Управление группами пользователей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными групп
- **СВЯЗИ**: GroupSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

#### users(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.GET (search, group), request.user
- **ИСТОЧНИКИ**: User.objects, Group.objects
- **ОБРАБОТКА**: Фильтрация пользователей по группе, поиск
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с отфильтрованными пользователями
- **СВЯЗИ**: UserSerializer, GroupSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF Response

### apps/accounts/serializers.py

#### UserSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: username, email, first_name, last_name, full_name, telegram_username, is_active
- **ИСТОЧНИКИ**: User модель, Group модель
- **ОБРАБОТКА**: Сериализация полей пользователя, вычисляемые поля groups
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с полями пользователя
- **СВЯЗИ**: User модель, Group модель
- **ФОРМАТ**: DRF API responses

#### UserCreateSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: username, email, password, first_name, last_name, full_name, telegram_username
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Создание пользователя, хеширование пароля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными созданного пользователя
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### UserProfileSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: first_name, last_name, full_name, email, telegram_username
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Сериализация профиля пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными профиля
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### UserChangePasswordSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: old_password, new_password, confirm_password
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Валидация паролей, изменение пароля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с результатом изменения пароля
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### UserSettingsSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: gemini_api_key, huntflow_prod_url, huntflow_sandbox_url, clickup_api_key, notion_api_key, telegram_bot_token, active_system
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Сериализация настроек пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с настройками
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### GroupSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: name, permissions
- **ИСТОЧНИКИ**: Group модель
- **ОБРАБОТКА**: Сериализация групп пользователей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными группы
- **СВЯЗИ**: Group модель
- **ФОРМАТ**: DRF API responses

#### UserStatsSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: User модель, связанные модели
- **ОБРАБОТКА**: Подсчет статистики пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект со статистикой
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### IntegrationStatusSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: integration_type, status, last_sync, error_message
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Сериализация статуса интеграций
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект со статусом интеграций
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

#### ApiKeyTestSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: integration_type, api_key
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Тестирование API ключей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с результатом теста
- **СВЯЗИ**: User модель
- **ФОРМАТ**: DRF API responses

### apps/accounts/forms.py

#### ProfileEditForm
- **ВХОДЯЩИЕ ДАННЫЕ**: first_name, last_name, full_name, email, telegram_username
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Настройка полей для редактирования профиля, удаление поля пароля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для редактирования профиля
- **СВЯЗИ**: User модель
- **ФОРМАТ**: Django форма

#### IntegrationSettingsForm
- **ВХОДЯЩИЕ ДАННЫЕ**: gemini_api_key, huntflow_prod_url, huntflow_sandbox_url, clickup_api_key, notion_api_key, telegram_bot_token
- **ИСТОЧНИКИ**: User модель
- **ОБРАБОТКА**: Настройка полей для интеграций, валидация API ключей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для настроек интеграций
- **СВЯЗИ**: User модель
- **ФОРМАТ**: Django форма

## APPS/HUNTFLOW

### apps/huntflow/views.py

#### get_correct_account_id(user, fallback_account_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: user (пользователь Django), fallback_account_id (резервный ID)
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение списка аккаунтов, извлечение первого доступного account_id
- **ВЫХОДЯЩИЕ ДАННЫЕ**: account_id для работы с Huntflow API
- **СВЯЗИ**: HuntflowService, Huntflow API
- **ФОРМАТ**: int

#### huntflow_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user с настройками Huntflow
- **ИСТОЧНИКИ**: request.user.huntflow_prod_url, request.user.huntflow_sandbox_url, HuntflowService
- **ОБРАБОТКА**: Проверка настроек, тестирование подключения, получение статистики
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/dashboard.html
- **СВЯЗИ**: HuntflowService, messages
- **ФОРМАТ**: HTML render

#### vacancies_list(request, account_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, request.GET (page, count, state), request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение правильного account_id, фильтрация вакансий, получение статусов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/vacancies_list.html
- **СВЯЗИ**: HuntflowService, get_correct_account_id
- **ФОРМАТ**: HTML render

#### vacancy_detail(request, account_id, vacancy_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, vacancy_id, request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение информации о вакансии, дополнительных полей, информации об организации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/vacancy_detail.html
- **СВЯЗИ**: HuntflowService, get_correct_account_id
- **ФОРМАТ**: HTML render

#### applicants_list(request, account_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, request.GET (page, count, status, vacancy), request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Фильтрация кандидатов, получение статусов и вакансий, обогащение данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/applicants_list.html
- **СВЯЗИ**: HuntflowService, get_correct_account_id
- **ФОРМАТ**: HTML render

#### applicant_detail(request, account_id, applicant_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, applicant_id, request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение информации о кандидате, анкете, логах, обогащение данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/applicant_detail.html
- **СВЯЗИ**: HuntflowService, get_correct_account_id
- **ФОРМАТ**: HTML render

#### applicant_edit(request, account_id, applicant_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, applicant_id, request.user, request.POST (данные для обновления)
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение текущих данных, обработка POST запроса, обновление данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → huntflow/applicant_edit.html или redirect
- **СВЯЗИ**: HuntflowService, get_correct_account_id
- **ФОРМАТ**: HTML render или HTTP redirect

#### test_connection_ajax(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: HuntflowService
- **ОБРАБОТКА**: Тестирование подключения к Huntflow API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с результатом тестирования
- **СВЯЗИ**: HuntflowService
- **ФОРМАТ**: JSON

#### create_comment_ajax(request, account_id, applicant_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, applicant_id, request.POST (comment), request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Валидация комментария, получение информации о кандидате, создание комментария
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с результатом создания комментария
- **СВЯЗИ**: HuntflowService
- **ФОРМАТ**: JSON

#### get_vacancies_ajax(request, account_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, request.GET (page, count, state), request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение параметров фильтрации, получение списка вакансий
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с данными вакансий
- **СВЯЗИ**: HuntflowService
- **ФОРМАТ**: JSON

#### get_applicants_ajax(request, account_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: account_id, request.GET (page, count, status, vacancy), request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Получение параметров фильтрации, получение списка кандидатов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с данными кандидатов
- **СВЯЗИ**: HuntflowService
- **ФОРМАТ**: JSON

### apps/huntflow/serializers.py

#### HuntflowCacheSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: cache_key, data, expires_at
- **ИСТОЧНИКИ**: HuntflowCache модель
- **ОБРАБОТКА**: Сериализация полей кэша, вычисляемые поля is_expired, age_minutes
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с полями кэша и статусом
- **СВЯЗИ**: HuntflowCache модель
- **ФОРМАТ**: DRF API responses

#### HuntflowLogSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: log_type, endpoint, method, status_code, request_data, response_data, error_message, user
- **ИСТОЧНИКИ**: HuntflowLog модель, User модель
- **ОБРАБОТКА**: Сериализация полей лога, вычисляемые поля user_username, is_success, is_error
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с полями лога и статусом
- **СВЯЗИ**: HuntflowLog модель, User модель
- **ФОРМАТ**: DRF API responses

#### HuntflowLogCreateSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: log_type, endpoint, method, status_code, request_data, response_data, error_message
- **ИСТОЧНИКИ**: HuntflowLog модель
- **ОБРАБОТКА**: Создание нового лога Huntflow, валидация данных лога
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными созданного лога
- **СВЯЗИ**: HuntflowLog модель
- **ФОРМАТ**: DRF API responses

#### HuntflowStatsSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: total_logs, success_logs, error_logs, logs_by_type, logs_by_user, recent_logs, cache_stats
- **ИСТОЧНИКИ**: HuntflowLog модель, HuntflowCache модель
- **ОБРАБОТКА**: Агрегация статистики по логам и кэшу, подсчет количества логов по типам и пользователям
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект со статистикой Huntflow
- **СВЯЗИ**: HuntflowLog модель, HuntflowCache модель
- **ФОРМАТ**: DRF API responses

#### HuntflowApiRequestSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint, method, data, params, use_cache, cache_timeout
- **ИСТОЧНИКИ**: Пользовательский ввод для API запросов
- **ОБРАБОТКА**: Валидация параметров API запроса, настройка кэширования
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с параметрами API запроса
- **СВЯЗИ**: данные пользователя
- **ФОРМАТ**: DRF API responses

### apps/huntflow/views_api.py

#### HuntflowCacheViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: HuntflowCache.objects, HuntflowCacheSerializer
- **ОБРАБОТКА**: Наследование от LogicHuntflowCacheViewSet, фильтрация по cache_key, поиск, сортировка
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными кэша
- **СВЯЗИ**: LogicHuntflowCacheViewSet, HuntflowCacheSerializer
- **ФОРМАТ**: DRF API responses

#### HuntflowLogViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: HuntflowLog.objects, HuntflowLogSerializer, HuntflowLogCreateSerializer
- **ОБРАБОТКА**: Наследование от LogicHuntflowLogViewSet, фильтрация, поиск, сортировка
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными логов
- **СВЯЗИ**: LogicHuntflowLogViewSet, HuntflowLogSerializer
- **ФОРМАТ**: DRF API responses

#### HuntflowApiRequestViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user, request.data (параметры API запроса)
- **ИСТОЧНИКИ**: HuntflowApiRequestSerializer, HuntflowService
- **ОБРАБОТКА**: Наследование от LogicHuntflowApiRequestViewSet, валидация, выполнение запросов, кэширование
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с результатами API запросов
- **СВЯЗИ**: LogicHuntflowApiRequestViewSet, HuntflowApiRequestSerializer
- **ФОРМАТ**: DRF API responses

## APPS/GOOGLE_OAUTH

### apps/google_oauth/views.py

#### determine_action_type_from_text(text)
- **ВХОДЯЩИЕ ДАННЫЕ**: text (текст для анализа)
- **ИСТОЧНИКИ**: Переданный текст
- **ОБРАБОТКА**: Анализ текста на наличие паттернов дат, времени, дней недели
- **ВЫХОДЯЩИЕ ДАННЫЕ**: str (тип действия)
- **СВЯЗИ**: регулярные выражения для анализа текста
- **ФОРМАТ**: string

#### format_file_size(size_bytes)
- **ВХОДЯЩИЕ ДАННЫЕ**: size_bytes (размер файла в байтах)
- **ИСТОЧНИКИ**: Переданный размер файла
- **ОБРАБОТКА**: Конвертация байтов в читаемый формат (KB, MB, GB)
- **ВЫХОДЯЩИЕ ДАННЫЕ**: str (отформатированный размер файла)
- **СВЯЗИ**: математические операции для конвертации
- **ФОРМАТ**: string

#### dashboard_redirect(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос)
- **ИСТОЧНИКИ**: request.user (текущий пользователь)
- **ОБРАБОТКА**: Проверка аутентификации пользователя, перенаправление на дашборд
- **ВЫХОДЯЩИЕ ДАННЫЕ**: redirect на google_oauth:dashboard
- **СВЯЗИ**: request.user
- **ФОРМАТ**: HTTP redirect

#### google_oauth_start(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос)
- **ИСТОЧНИКИ**: request.user, GoogleOAuthService
- **ОБРАБОТКА**: Создание GoogleOAuthService, генерация URL для авторизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: redirect на Google OAuth authorization URL
- **СВЯЗИ**: GoogleOAuthService
- **ФОРМАТ**: HTTP redirect

## APPS/CLICKUP_INT

### apps/clickup_int/views.py

#### dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: ClickUpSettings.objects, ClickUpTask.objects, ClickUpSyncLog.objects
- **ОБРАБОТКА**: Получение настроек пользователя, проверка конфигурации, подсчет статистики
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → clickup_int/dashboard.html
- **СВЯЗИ**: ClickUpSettings, ClickUpTask, ClickUpSyncLog модели
- **ФОРМАТ**: HTML render

#### settings_view(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.POST (данные формы настроек)
- **ИСТОЧНИКИ**: ClickUpSettings.objects, ClickUpSettingsForm
- **ОБРАБОТКА**: Получение/создание настроек, обработка POST запроса, валидация формы
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → clickup_int/settings.html
- **СВЯЗИ**: ClickUpSettings модель, ClickUpSettingsForm
- **ФОРМАТ**: HTML render

#### test_connection(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.POST (данные формы тестирования)
- **ИСТОЧНИКИ**: ClickUpService, ClickUpTestConnectionForm
- **ОБРАБОТКА**: Создание ClickUpService, тестирование подключения, проверка доступности
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → clickup_int/test_connection.html
- **СВЯЗИ**: ClickUpService, ClickUpTestConnectionForm
- **ФОРМАТ**: HTML render

## APPS/NOTION_INT

### apps/notion_int/views.py

#### settings(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: NotionSettings.objects, NotionSettingsForm
- **ОБРАБОТКА**: Получение/создание настроек, проверка очистки настроек, создание формы
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → notion_int/settings.html
- **СВЯЗИ**: NotionSettings модель, NotionSettingsForm
- **ФОРМАТ**: HTML render

#### dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: NotionSettings.objects, NotionPage.objects, NotionSyncLog.objects
- **ОБРАБОТКА**: Получение настроек, проверка конфигурации, подсчет статистики
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → notion_int/dashboard.html
- **СВЯЗИ**: NotionSettings, NotionPage, NotionSyncLog модели
- **ФОРМАТ**: HTML render

#### pages_list(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.GET (параметры фильтрации и поиска)
- **ИСТОЧНИКИ**: NotionPage.objects, NotionSettings.objects
- **ОБРАБОТКА**: Получение страниц, применение фильтров и поиска, пагинация
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → notion_int/pages_list.html
- **СВЯЗИ**: NotionPage, NotionSettings модели
- **ФОРМАТ**: HTML render

## APPS/TELEGRAM

### apps/telegram/views.py

#### TelegramAuthView
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: TelegramUser.objects, AuthAttempt.objects
- **ОБРАБОТКА**: Получение/создание TelegramUser, проверка авторизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → telegram/auth.html
- **СВЯЗИ**: TelegramUser, AuthAttempt модели
- **ФОРМАТ**: HTML render

#### TelegramDashboardView
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: TelegramUser.objects, AuthAttempt.objects
- **ОБРАБОТКА**: Получение данных Telegram пользователя, проверка авторизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → telegram/dashboard.html
- **СВЯЗИ**: TelegramUser, AuthAttempt модели
- **ФОРМАТ**: HTML render

## APPS/COMMON

### apps/common/views_api.py

#### health_check(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос)
- **ИСТОЧНИКИ**: Django database connection, Redis connection, Django cache
- **ОБРАБОТКА**: Проверка подключения к базе данных, Redis, кэшу, формирование статуса
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Response с данными о состоянии системы
- **СВЯЗИ**: Django database, Redis, cache
- **ФОРМАТ**: DRF Response

## ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ

### apps/google_oauth/views.py (дополнительные функции)

#### get_file_type_display(mime_type)
- **ВХОДЯЩИЕ ДАННЫЕ**: mime_type (MIME тип файла)
- **ИСТОЧНИКИ**: Переданный MIME тип
- **ОБРАБОТКА**: Маппинг MIME типов на читаемые названия типов файлов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: str (читаемое название типа файла)
- **СВЯЗИ**: словарь маппинга MIME типов
- **ФОРМАТ**: string

#### google_oauth_callback(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос с кодом авторизации), request.GET (code, state, error)
- **ИСТОЧНИКИ**: Google OAuth API, GoogleOAuthService
- **ОБРАБОТКА**: Получение кода авторизации, обмен кода на токен, сохранение токенов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: redirect на google_oauth:dashboard или error page
- **СВЯЗИ**: GoogleOAuthService, Google OAuth API
- **ФОРМАТ**: HTTP redirect

#### dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ**: GoogleOAuthAccount.objects, Google сервисы
- **ОБРАБОТКА**: Получение аккаунтов Google, проверка авторизации, получение данных из сервисов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/dashboard.html
- **СВЯЗИ**: GoogleOAuthAccount, Google сервисы
- **ФОРМАТ**: HTML render

### apps/google_oauth/serializers.py

#### GoogleOAuthAccountSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: google_id, email, name, picture_url, scopes
- **ИСТОЧНИКИ**: GoogleOAuthAccount модель
- **ОБРАБОТКА**: Сериализация полей аккаунта Google, вычисляемые поля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными Google OAuth аккаунта
- **СВЯЗИ**: GoogleOAuthAccount модель
- **ФОРМАТ**: DRF API responses

#### SyncSettingsSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: auto_sync, sync_interval, sync_calendar, sync_drive, sync_sheets
- **ИСТОЧНИКИ**: SyncSettings модель
- **ОБРАБОТКА**: Сериализация настроек синхронизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с настройками синхронизации
- **СВЯЗИ**: SyncSettings модель
- **ФОРМАТ**: DRF API responses

### apps/finance/views_api.py

#### GradeViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: Grade.objects, GradeSerializer
- **ОБРАБОТКА**: Наследование от FinanceAPIViewSet, управление грейдами
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными грейдов
- **СВЯЗИ**: FinanceAPIViewSet, GradeSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

#### stats(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Grade.objects, Vacancy.objects, SalaryRange.objects, Benchmark.objects
- **ОБРАБОТКА**: Подсчет статистики по грейдам, вакансиям, зарплатным вилкам, бенчмаркам
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response со статистикой по грейдам
- **СВЯЗИ**: Grade, Vacancy, SalaryRange, Benchmark модели
- **ФОРМАТ**: DRF Response

### apps/google_oauth/views.py (дополнительные функции - продолжение)

#### disconnect(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleOAuthAccount.objects, GoogleOAuthService
- **ОБРАБОТКА**: Получение OAuth аккаунта, отзыв токенов, удаление аккаунта
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:dashboard
- **СВЯЗИ**: GoogleOAuthAccount, GoogleOAuthService
- **ФОРМАТ**: HTTP redirect

#### calendar_view(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleCalendarService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Получение OAuth аккаунта, получение календарей и событий
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/calendar.html
- **СВЯЗИ**: GoogleCalendarService, GoogleOAuthAccount
- **ФОРМАТ**: HTML render

#### sync_calendar(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleCalendarService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Проверка доступа, синхронизация данных календаря
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:calendar
- **СВЯЗИ**: GoogleCalendarService, GoogleOAuthAccount
- **ФОРМАТ**: HTTP redirect

#### invite_list(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Invite.objects, Vacancy.objects
- **ОБРАБОТКА**: Получение приглашений, фильтрация по статусу и вакансии
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/invite_list.html
- **СВЯЗИ**: Invite, Vacancy модели
- **ФОРМАТ**: HTML render

#### invite_create(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы, Vacancy.objects, User.objects
- **ОБРАБОТКА**: Валидация данных, создание приглашения, отправка через Google Calendar
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:invite_list
- **СВЯЗИ**: Invite.objects.create(), Vacancy, User модели
- **ФОРМАТ**: HTTP redirect

### apps/google_oauth/serializers.py (дополнительные сериализаторы)

#### InviteSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: candidate_email, candidate_name, vacancy, scheduled_time, status
- **ИСТОЧНИКИ**: Invite модель, Vacancy модель
- **ОБРАБОТКА**: Сериализация полей приглашения, вычисляемые поля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными приглашения
- **СВЯЗИ**: Invite модель, Vacancy модель
- **ФОРМАТ**: DRF API responses

#### HRScreeningSerializer
- **ВХОДЯЩИЕ ДАННЫЕ**: candidate_name, candidate_email, vacancy, screening_date, notes
- **ИСТОЧНИКИ**: HRScreening модель, Vacancy модель
- **ОБРАБОТКА**: Сериализация полей HR-скрининга, вычисляемые поля
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON объект с данными HR-скрининга
- **СВЯЗИ**: HRScreening модель, Vacancy модель
- **ФОРМАТ**: DRF API responses

### apps/finance/views_api.py (дополнительные ViewSet)

#### CurrencyRateViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: CurrencyRate.objects, CurrencyRateSerializer
- **ОБРАБОТКА**: Наследование от FinanceAPIViewSet, управление курсами валют
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными курсов валют
- **СВЯЗИ**: FinanceAPIViewSet, CurrencyRateSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

#### SalaryRangeViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: SalaryRange.objects, SalaryRangeSerializer, Vacancy.objects, Grade.objects
- **ОБРАБОТКА**: Наследование от FinanceAPIViewSet, управление зарплатными вилками
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными зарплатных вилок
- **СВЯЗИ**: FinanceAPIViewSet, SalaryRangeSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

#### BenchmarkViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: Benchmark.objects, BenchmarkSerializer, Vacancy.objects, Grade.objects
- **ОБРАБОТКА**: Наследование от FinanceAPIViewSet, управление бенчмарками
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными бенчмарков
- **СВЯЗИ**: FinanceAPIViewSet, BenchmarkSerializer, UnifiedResponseHandler
- **ФОРМАТ**: DRF API responses

### apps/google_oauth/views.py (дополнительные функции - продолжение 2)

#### drive_view(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleDriveService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Получение OAuth аккаунта, получение списка файлов из Google Drive
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/drive.html
- **СВЯЗИ**: GoogleDriveService, GoogleOAuthAccount
- **ФОРМАТ**: HTML render

#### sheets_view(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleSheetsService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Получение OAuth аккаунта, получение списка таблиц из Google Sheets
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/sheets.html
- **СВЯЗИ**: GoogleSheetsService, GoogleOAuthAccount
- **ФОРМАТ**: HTML render

#### sync_drive(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleDriveService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Проверка доступа, синхронизация данных Google Drive
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:drive
- **СВЯЗИ**: GoogleDriveService, GoogleOAuthAccount
- **ФОРМАТ**: HTTP redirect

#### sync_sheets(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: GoogleSheetsService, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Проверка доступа, синхронизация данных Google Sheets
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:sheets
- **СВЯЗИ**: GoogleSheetsService, GoogleOAuthAccount
- **ФОРМАТ**: HTTP redirect

#### sync_all(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Google сервисы, GoogleOAuthAccount.objects
- **ОБРАБОТКА**: Проверка доступа ко всем сервисам, последовательная синхронизация
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:dashboard
- **СВЯЗИ**: Google сервисы, GoogleOAuthAccount
- **ФОРМАТ**: HTTP redirect

#### invite_detail(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.user
- **ИСТОЧНИКИ**: Invite.objects, Vacancy.objects
- **ОБРАБОТКА**: Получение приглашения по ID, проверка прав доступа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → google_oauth/invite_detail.html
- **СВЯЗИ**: Invite, Vacancy модели
- **ФОРМАТ**: HTML render

#### invite_update(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы, Invite.objects, Vacancy.objects
- **ОБРАБОТКА**: Получение приглашения, валидация данных, обновление
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:invite_detail
- **СВЯЗИ**: Invite.objects.get(), Vacancy модели
- **ФОРМАТ**: HTTP redirect

#### invite_delete(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.user
- **ИСТОЧНИКИ**: Invite.objects
- **ОБРАБОТКА**: Получение приглашения по ID, проверка прав, удаление
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на google_oauth:invite_list
- **СВЯЗИ**: Invite.objects.get()
- **ФОРМАТ**: HTTP redirect

## APPS/INTERVIEWERS

### apps/interviewers/forms.py

#### InterviewerForm
- **ВХОДЯЩИЕ ДАННЫЕ**: first_name, last_name, middle_name, email, calendar_link, is_active
- **ИСТОЧНИКИ**: Interviewer модель из apps.interviewers.models
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для создания/редактирования интервьюера
- **СВЯЗИ**: Interviewer модель
- **ФОРМАТ**: Django форма

#### InterviewerSearchForm
- **ВХОДЯЩИЕ ДАННЫЕ**: search, is_active
- **ИСТОЧНИКИ**: GET параметры запроса
- **ОБРАБОТКА**: Валидация параметров поиска, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для поиска интервьюеров
- **СВЯЗИ**: GET параметры
- **ФОРМАТ**: Django форма

#### InterviewRuleForm
- **ВХОДЯЩИЕ ДАННЫЕ**: name, description, duration_minutes, is_active
- **ИСТОЧНИКИ**: InterviewRule модель из apps.interviewers.models
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для создания/редактирования правил интервью
- **СВЯЗИ**: InterviewRule модель
- **ФОРМАТ**: Django форма

#### InterviewRuleSearchForm
- **ВХОДЯЩИЕ ДАННЫЕ**: search, is_active
- **ИСТОЧНИКИ**: GET параметры запроса
- **ОБРАБОТКА**: Валидация параметров поиска, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для поиска правил интервью
- **СВЯЗИ**: GET параметры
- **ФОРМАТ**: Django форма

## APPS/GOOGLE_OAUTH

### apps/google_oauth/forms.py

#### SyncSettingsForm
- **ВХОДЯЩИЕ ДАННЫЕ**: auto_sync_calendar, auto_sync_drive, sync_interval, max_events, max_files
- **ИСТОЧНИКИ**: SyncSettings модель из apps.google_oauth.models
- **ОБРАБОТКА**: Валидация параметров синхронизации, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для настройки синхронизации
- **СВЯЗИ**: SyncSettings модель
- **ФОРМАТ**: Django форма

#### InviteForm
- **ВХОДЯЩИЕ ДАННЫЕ**: candidate_name, candidate_email, interview_date, interview_time, vacancy, notes
- **ИСТОЧНИКИ**: Invite модель, Vacancy модель
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для создания приглашения
- **СВЯЗИ**: Invite модель, Vacancy модель
- **ФОРМАТ**: Django форма

#### HRScreeningForm
- **ВХОДЯЩИЕ ДАННЫЕ**: candidate_name, candidate_email, screening_date, vacancy, notes
- **ИСТОЧНИКИ**: HRScreening модель, Vacancy модель
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для HR-скрининга
- **СВЯЗИ**: HRScreening модель, Vacancy модель
- **ФОРМАТ**: Django форма

## APPS/CLICKUP_INT

### apps/clickup_int/forms.py

#### ClickUpSettingsForm
- **ВХОДЯЩИЕ ДАННЫЕ**: team_id, space_id, folder_id, list_id, auto_sync, sync_interval
- **ИСТОЧНИКИ**: ClickUpSettings модель, ClickUp API
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI, динамическое заполнение выборов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для настройки ClickUp интеграции
- **СВЯЗИ**: ClickUpSettings модель, ClickUp API
- **ФОРМАТ**: Django форма

## APPS/NOTION_INT

### apps/notion_int/forms.py

#### NotionSettingsForm
- **ВХОДЯЩИЕ ДАННЫЕ**: database_id, auto_sync, sync_interval
- **ИСТОЧНИКИ**: NotionSettings модель, Notion API
- **ОБРАБОТКА**: Валидация обязательных полей, настройка виджетов для UI, динамическое заполнение выборов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django форма для настройки Notion интеграции
- **СВЯЗИ**: NotionSettings модель, Notion API
- **ФОРМАТ**: Django форма

## APPS/TELEGRAM

### apps/telegram/views_api.py

#### TelegramUserViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: TelegramUser.objects, TelegramUserSerializer
- **ОБРАБОТКА**: Наследование от LogicTelegramUserViewSet, фильтрация по статусу авторизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными пользователей Telegram
- **СВЯЗИ**: LogicTelegramUserViewSet, TelegramUserSerializer
- **ФОРМАТ**: DRF API responses

#### AuthAttemptViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, request.user
- **ИСТОЧНИКИ**: AuthAttempt.objects, AuthAttemptSerializer
- **ОБРАБОТКА**: Наследование от LogicAuthAttemptViewSet, фильтрация по статусу авторизации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с данными попыток авторизации
- **СВЯЗИ**: LogicAuthAttemptViewSet, AuthAttemptSerializer
- **ФОРМАТ**: DRF API responses

#### TelegramWebhookViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP POST запросы с данными webhook, Telegram webhook данные
- **ИСТОЧНИКИ**: Telegram webhook API, TelegramUser.objects
- **ОБРАБОТКА**: Наследование от LogicTelegramWebhookViewSet, обработка входящих webhook
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response с результатом обработки webhook
- **СВЯЗИ**: LogicTelegramWebhookViewSet, Telegram webhook API
- **ФОРМАТ**: DRF API responses

## APPS/COMMON

### apps/common/context_processors.py

#### sidebar_menu_context(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request, request.user
- **ИСТОЧНИКИ**: HuntflowService, Huntflow API
- **ОБРАБОТКА**: Проверка аутентификации, получение данных организаций, обработка ошибок
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context с данными для сайдбара
- **СВЯЗИ**: HuntflowService, Huntflow API
- **ФОРМАТ**: Django template context

## APPS/FINANCE

### apps/finance/management/commands/hh_search_config.py

#### hh_search_config.py
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (конфигурационный файл)
- **ИСТОЧНИКИ**: hh.ru API (коды локаций, специализаций и ключевые слова)
- **ОБРАБОТКА**: Определение локаций, специализаций, ключевых слов и параметров поиска
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Константы для использования в management командах и задачах
- **СВЯЗИ**: apps.finance.tasks, management команды
- **ФОРМАТ**: Python константы

#### hh_search_constants.py
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (конфигурационный файл)
- **ИСТОЧНИКИ**: hh.ru API (коды профессиональных ролей, локаций и ключевые слова)
- **ОБРАБОТКА**: Определение кодов профессиональных ролей, локаций, ключевых слов и параметров поиска
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Константы для использования в management командах и задачах
- **СВЯЗИ**: apps.finance.tasks, management команды
- **ФОРМАТ**: Python константы

### apps/finance/views_modules/analysis_views.py

#### FinanceAnalysisService
- **ВХОДЯЩИЕ ДАННЫЕ**: analysis_type, data
- **ИСТОЧНИКИ**: BaseGeminiOperations, Gemini AI API
- **ОБРАБОТКА**: Наследование от BaseGeminiOperations, формирование запроса, выполнение анализа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Результат анализа от Gemini AI
- **СВЯЗИ**: BaseGeminiOperations, Gemini AI API
- **ФОРМАТ**: Результат анализа

#### finance_dashboard_analysis(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: SalaryRange.objects, Benchmark.objects, FinanceAnalysisService
- **ОБРАБОТКА**: Сбор статистики, запуск AI анализа, обработка ошибок
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/analysis/dashboard.html
- **СВЯЗИ**: SalaryRange, Benchmark модели, FinanceAnalysisService
- **ФОРМАТ**: HTML render

#### salary_trends_analysis(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: SalaryRange.objects, FinanceAnalysisService
- **ОБРАБОТКА**: Сбор данных по зарплатам, анализ трендов через AI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/analysis/salary_trends.html
- **СВЯЗИ**: SalaryRange модель, FinanceAnalysisService
- **ФОРМАТ**: HTML render

#### benchmark_comparison_analysis(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Benchmark.objects, FinanceAnalysisService
- **ОБРАБОТКА**: Сбор данных по бенчмаркам, анализ сравнения через AI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/analysis/benchmark_comparison.html
- **СВЯЗИ**: Benchmark модель, FinanceAnalysisService
- **ФОРМАТ**: HTML render

#### custom_finance_analysis(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.POST
- **ИСТОЧНИКИ**: SalaryRange.objects, Benchmark.objects, FinanceAnalysisService
- **ОБРАБОТКА**: Получение параметров, сбор данных, выполнение кастомного анализа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/analysis/custom.html
- **СВЯЗИ**: SalaryRange, Benchmark модели, FinanceAnalysisService
- **ФОРМАТ**: HTML render

### apps/finance/views_modules/benchmark_views.py

#### BenchmarkGeminiService
- **ВХОДЯЩИЕ ДАННЫЕ**: benchmark_data, prompt_source
- **ИСТОЧНИКИ**: BaseGeminiOperations, GeminiPromptManager, Gemini AI API
- **ОБРАБОТКА**: Наследование от BaseGeminiOperations, получение промпта, выполнение анализа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Результат анализа от Gemini AI
- **СВЯЗИ**: BaseGeminiOperations, GeminiPromptManager, Gemini AI API
- **ФОРМАТ**: Результат анализа

#### benchmark_list(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Benchmark.objects
- **ОБРАБОТКА**: Получение всех бенчмарков, сортировка по дате создания
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/benchmark_list.html
- **СВЯЗИ**: Benchmark модель
- **ФОРМАТ**: HTML render

#### benchmark_detail(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.user
- **ИСТОЧНИКИ**: Benchmark.objects
- **ОБРАБОТКА**: Получение бенчмарка по ID, обработка ошибок
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/benchmark_detail.html
- **СВЯЗИ**: Benchmark модель
- **ФОРМАТ**: HTML render

#### benchmark_create(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы создания бенчмарка
- **ОБРАБОТКА**: Валидация данных формы, создание нового бенчмарка
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:benchmark_list
- **СВЯЗИ**: Benchmark.objects.create()
- **ФОРМАТ**: HTTP redirect

#### benchmark_update(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы обновления, Benchmark.objects
- **ОБРАБОТКА**: Получение бенчмарка по ID, валидация данных, обновление
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:benchmark_detail
- **СВЯЗИ**: Benchmark.objects.get()
- **ФОРМАТ**: HTTP redirect

#### benchmark_delete(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.user
- **ИСТОЧНИКИ**: Benchmark.objects
- **ОБРАБОТКА**: Получение бенчмарка по ID, удаление бенчмарка
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:benchmark_list
- **СВЯЗИ**: Benchmark.objects.get()
- **ФОРМАТ**: HTTP redirect

#### benchmark_ai_analysis(request, pk)
- **ВХОДЯЩИЕ ДАННЫЕ**: pk, request.user
- **ИСТОЧНИКИ**: Benchmark.objects, BenchmarkGeminiService
- **ОБРАБОТКА**: Получение бенчмарка по ID, запуск AI анализа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/benchmark_ai_analysis.html
- **СВЯЗИ**: Benchmark модель, BenchmarkGeminiService
- **ФОРМАТ**: HTML render

### apps/finance/views_modules/currency_views.py

#### update_currency_rates(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.headers
- **ИСТОЧНИКИ**: UnifiedCurrencyService, NBRB API
- **ОБРАБОТКА**: Вызов метода update_currency_rates_in_db(), обработка результата
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:dashboard или JSON response
- **СВЯЗИ**: UnifiedCurrencyService, NBRB API
- **ФОРМАТ**: HTTP redirect или JSON response

### apps/finance/views_modules/dashboard_views.py

#### benchmarks_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Benchmark.objects, Grade.objects, BenchmarkType.objects
- **ОБРАБОТКА**: Подсчет статистики по бенчмаркам, получение последних записей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/benchmarks_dashboard.html
- **СВЯЗИ**: Benchmark, Grade, BenchmarkType модели
- **ФОРМАТ**: HTML render

#### dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: Benchmark.objects, Grade.objects, SalaryRange.objects
- **ОБРАБОТКА**: Подсчет статистики по бенчмаркам, грейдам и зарплатным вилкам
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/dashboard.html
- **СВЯЗИ**: Benchmark, Grade, SalaryRange модели
- **ФОРМАТ**: HTML render

#### pln_taxes_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: PLNTax.objects
- **ОБРАБОТКА**: Получение всех польских налогов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/pln_taxes_dashboard.html
- **СВЯЗИ**: PLNTax модель
- **ФОРМАТ**: HTML render

#### hh_analysis_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: HHVacancyTemp.objects
- **ОБРАБОТКА**: Получение временных данных вакансий с HH.ru
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/hh_analysis_dashboard.html
- **СВЯЗИ**: HHVacancyTemp модель
- **ФОРМАТ**: HTML render

#### ai_analysis_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user
- **ИСТОЧНИКИ**: BenchmarkSettings.objects
- **ОБРАБОТКА**: Получение настроек бенчмарков
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → finance/ai_analysis_dashboard.html
- **СВЯЗИ**: BenchmarkSettings модель
- **ФОРМАТ**: HTML render

### apps/finance/views_modules/tax_views.py

#### add_pln_tax(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы создания польского налога
- **ОБРАБОТКА**: Валидация данных, проверка корректности ставки, создание налога
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:pln_taxes_dashboard
- **СВЯЗИ**: PLNTax.objects.create()
- **ФОРМАТ**: HTTP redirect

#### update_pln_tax(request, tax_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: tax_id, request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы обновления, PLNTax.objects
- **ОБРАБОТКА**: Получение налога по ID, валидация данных, обновление
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:pln_taxes_dashboard
- **СВЯЗИ**: PLNTax.objects.get()
- **ФОРМАТ**: HTTP redirect

#### delete_pln_tax(request, tax_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: tax_id, request.user
- **ИСТОЧНИКИ**: PLNTax.objects
- **ОБРАБОТКА**: Получение налога по ID, удаление налога
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:pln_taxes_dashboard
- **СВЯЗИ**: PLNTax.objects.get()
- **ФОРМАТ**: HTTP redirect

#### calculate_pln_taxes(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.POST, request.user
- **ИСТОЧНИКИ**: POST данные формы расчета, PLNTax.objects
- **ОБРАБОТКА**: Получение данных, валидация, расчет налоговых отчислений
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на finance:pln_taxes_dashboard
- **СВЯЗИ**: PLNTax.objects.get()
- **ФОРМАТ**: HTTP redirect

## LOGIC/AI_ANALYSIS

### logic/ai_analysis/gemini_api.py

#### ChatSessionViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы от аутентифицированных пользователей
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модели ChatSession, ChatMessage), Gemini API
- **ОБРАБОТКА**: CRUD операции с сессиями чата, отправка сообщений, управление историей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON ответы с данными сессий и сообщений
- **СВЯЗИ**: apps.gemini.models, apps.gemini.serializers, logic.ai_analysis.gemini_services
- **ФОРМАТ**: REST API endpoints с JSON сериализацией

#### ChatSessionViewSet.get_queryset()
- **ВХОДЯЩИЕ ДАННЫЕ**: self.request с аутентифицированным пользователем
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatSession)
- **ОБРАБОТКА**: Фильтрация сессий чата по текущему пользователю
- **ВЫХОДЯЩИЕ ДАННЫЕ**: QuerySet с отфильтрованными сессиями или пустой QuerySet
- **СВЯЗИ**: apps.gemini.models.ChatSession
- **ФОРМАТ**: Django QuerySet

#### ChatSessionViewSet.get_serializer_class()
- **ВХОДЯЩИЕ ДАННЫЕ**: self.action (тип действия ViewSet)
- **ИСТОЧНИКИ ДАННЫХ**: apps.gemini.serializers
- **ОБРАБОТКА**: Выбор подходящего сериализатора на основе типа действия
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Класс сериализатора
- **СВЯЗИ**: apps.gemini.serializers (ChatSessionDetailSerializer, ChatSessionCreateSerializer)
- **ФОРМАТ**: Python класс

#### ChatSessionViewSet.perform_create()
- **ВХОДЯЩИЕ ДАННЫЕ**: serializer с данными для создания сессии
- **ИСТОЧНИКИ ДАННЫХ**: self.request.user (текущий пользователь)
- **ОБРАБОТКА**: Сохранение сессии с привязкой к текущему пользователю
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Созданная сессия чата
- **СВЯЗИ**: apps.gemini.models.ChatSession
- **ФОРМАТ**: Django модель

#### ChatSessionViewSet.send_message()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP POST запрос с данными сообщения
- **ИСТОЧНИКИ ДАННЫХ**: request.data (содержимое сообщения), pk (ID сессии)
- **ОБРАБОТКА**: Создание сообщения пользователя и получение ответа от Gemini AI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с сообщениями пользователя и ассистента
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.MessageApiHandler, apps.gemini.models.ChatMessage
- **ФОРМАТ**: JSON ответ с данными сообщений

#### ChatSessionViewSet.messages()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP GET запрос с pk сессии
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatMessage через сессию)
- **ОБРАБОТКА**: Получение всех сообщений сессии, отсортированных по времени
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с массивом сообщений
- **СВЯЗИ**: apps.gemini.models.ChatMessage, apps.gemini.serializers.ChatMessageSerializer
- **ФОРМАТ**: JSON ответ с данными сообщений

#### ChatSessionViewSet.clear_history()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP POST запрос с pk сессии
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatMessage через сессию)
- **ОБРАБОТКА**: Удаление всех сообщений сессии
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с подтверждением очистки
- **СВЯЗИ**: apps.gemini.models.ChatMessage
- **ФОРМАТ**: JSON ответ с статусом операции

#### ChatSessionViewSet.stats()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP GET запрос от аутентифицированного пользователя
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модели ChatSession, ChatMessage)
- **ОБРАБОТКА**: Получение статистики по чатам пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON со статистикой чатов
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.StatsApiHandler
- **ФОРМАТ**: JSON ответ со статистическими данными

#### ChatMessageViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы от аутентифицированных пользователей
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatMessage)
- **ОБРАБОТКА**: Просмотр сообщений чата пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON ответы с данными сообщений
- **СВЯЗИ**: apps.gemini.models.ChatMessage, apps.gemini.serializers.ChatMessageSerializer
- **ФОРМАТ**: REST API endpoints с JSON сериализацией

#### ChatMessageViewSet.get_queryset()
- **ВХОДЯЩИЕ ДАННЫЕ**: self.request с аутентифицированным пользователем
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatMessage)
- **ОБРАБОТКА**: Фильтрация сообщений по сессиям текущего пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: QuerySet с отфильтрованными сообщениями или пустой QuerySet
- **СВЯЗИ**: apps.gemini.models.ChatMessage
- **ФОРМАТ**: Django QuerySet

#### ChatMessageViewSet.recent()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP GET запрос от аутентифицированного пользователя
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модель ChatMessage через get_queryset)
- **ОБРАБОТКА**: Получение 20 последних сообщений пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с массивом последних сообщений
- **СВЯЗИ**: apps.gemini.serializers.ChatMessageSerializer
- **ФОРМАТ**: JSON ответ с данными сообщений

#### GeminiApiViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы от аутентифицированных пользователей
- **ИСТОЧНИКИ ДАННЫХ**: Gemini API, пользовательские API ключи
- **ОБРАБОТКА**: Анализ текста, генерация ответов, получение статистики
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON ответы с результатами анализа и генерации
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, logic.ai_analysis.gemini_handlers.StatsApiHandler
- **ФОРМАТ**: REST API endpoints с JSON сериализацией

#### GeminiApiViewSet.analyze_text()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP POST запрос с текстом для анализа
- **ИСТОЧНИКИ ДАННЫХ**: request.data (текст, тип анализа, max_tokens), request.user.gemini_api_key
- **ОБРАБОТКА**: Отправка текста в Gemini API для анализа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с результатами анализа
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, apps.gemini.serializers.GeminiApiRequestSerializer
- **ФОРМАТ**: JSON ответ с результатами анализа

#### GeminiApiViewSet.generate_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP POST запрос с текстом и контекстом для генерации
- **ИСТОЧНИКИ ДАННЫХ**: request.data (текст, контекст, max_tokens), request.user.gemini_api_key
- **ОБРАБОТКА**: Отправка запроса в Gemini API для генерации ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON с сгенерированным ответом
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, apps.gemini.serializers.GeminiApiRequestSerializer
- **ФОРМАТ**: JSON ответ с сгенерированным текстом

#### GeminiApiViewSet.stats()
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP GET запрос от аутентифицированного пользователя
- **ИСТОЧНИКИ ДАННЫХ**: База данных (модели ChatSession, ChatMessage, GeminiApiRequest)
- **ОБРАБОТКА**: Получение статистики использования Gemini API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JSON со статистикой API
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.StatsApiHandler
- **ФОРМАТ**: JSON ответ со статистическими данными

### logic/ai_analysis/gemini_handlers.py

#### MessageApiHandler
- **ВХОДЯЩИЕ ДАННЫЕ**: Данные сообщений, HTTP запросы
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage), Gemini API
- **ОБРАБОТКА**: Отправка сообщений, создание ответов, управление сессиями
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Результаты обработки сообщений
- **СВЯЗИ**: apps.gemini.models, logic.ai_analysis.gemini_services.GeminiService
- **ФОРМАТ**: Словари с результатами операций

#### MessageApiHandler.send_message_api_handler()
- **ВХОДЯЩИЕ ДАННЫЕ**: data (session_id, content), request.user
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage), Gemini API
- **ОБРАБОТКА**: Валидация данных, создание сообщения, отправка в Gemini AI
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом операции и ID сообщений
- **СВЯЗИ**: apps.gemini.models, logic.ai_analysis.gemini_services.GeminiService
- **ФОРМАТ**: Словарь с ключами success, user_message_id, assistant_message_id

#### MessageApiHandler.send_message_viewset_handler()
- **ВХОДЯЩИЕ ДАННЫЕ**: session (ChatSession), content (текст), user (пользователь)
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatMessage), Gemini API
- **ОБРАБОТКА**: Создание сообщения пользователя, отправка в Gemini AI, создание ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом операции и ID сообщений
- **СВЯЗИ**: apps.gemini.models.ChatMessage, logic.ai_analysis.gemini_services.GeminiService
- **ФОРМАТ**: Словарь с ключами success, user_message_id, assistant_message_id

#### ApiKeyApiHandler
- **ВХОДЯЩИЕ ДАННЫЕ**: API ключи, HTTP запросы
- **ИСТОЧНИКИ ДАННЫХ**: Gemini API, база данных (User)
- **ОБРАБОТКА**: Тестирование API ключей, сохранение в профиле пользователя
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Результаты тестирования и сохранения ключей
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, User модель
- **ФОРМАТ**: Словари с результатами операций

#### ApiKeyApiHandler.test_api_key_handler()
- **ВХОДЯЩИЕ ДАННЫЕ**: data (api_key), request.user
- **ИСТОЧНИКИ ДАННЫХ**: Gemini API, база данных (User)
- **ОБРАБОТКА**: Валидация ключа, тестирование подключения, сохранение в профиле
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом тестирования
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, User модель
- **ФОРМАТ**: Словарь с ключами success, message/error

#### StatsApiHandler
- **ВХОДЯЩИЕ ДАННЫЕ**: HTTP запросы, данные пользователя
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage)
- **ОБРАБОТКА**: Агрегация статистики по сессиям и сообщениям
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Статистические данные и контекст для дашборда
- **СВЯЗИ**: apps.gemini.models (ChatSession, ChatMessage)
- **ФОРМАТ**: Словари со статистическими данными

#### StatsApiHandler.get_dashboard_handler()
- **ВХОДЯЩИЕ ДАННЫЕ**: data, request.user
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage)
- **ОБРАБОТКА**: Получение статистики сессий и сообщений, последние записи
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Контекст для отображения дашборда
- **СВЯЗИ**: apps.gemini.models (ChatSession, ChatMessage)
- **ФОРМАТ**: Словарь с контекстом дашборда

#### StatsApiHandler.get_stats_handler()
- **ВХОДЯЩИЕ ДАННЫЕ**: data, request.user
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage)
- **ОБРАБОТКА**: Агрегация статистики по сессиям, сообщениям, активности
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Подробная статистика использования
- **СВЯЗИ**: apps.gemini.models (ChatSession, ChatMessage)
- **ФОРМАТ**: Словарь со статистическими данными

### logic/ai_analysis/gemini_management.py

#### gemini_dashboard(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user (аутентифицированный пользователь)
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage), logic.ai_analysis.gemini_handlers.StatsApiHandler
- **ОБРАБОТКА**: Получение контекста для дашборда через StatsApiHandler
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → gemini/dashboard.html
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.StatsApiHandler, apps.gemini.models
- **ФОРМАТ**: HTML render

#### chat_session(request, session_id=None)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, session_id (опционально)
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession, ChatMessage), request.user.gemini_api_key
- **ОБРАБОТКА**: Получение/создание сессии чата, получение сообщений, проверка API ключа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → gemini/chat.html
- **СВЯЗИ**: apps.gemini.models (ChatSession, ChatMessage)
- **ФОРМАТ**: HTML render

#### settings(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.user, request.POST (api_key)
- **ИСТОЧНИКИ ДАННЫХ**: request.user.gemini_api_key, logic.ai_analysis.gemini_services.GeminiService
- **ОБРАБОТКА**: Валидация API ключа, тестирование подключения, сохранение в профиле
- **ВЫХОДЯЩИЕ ДАННЫЕ**: context → gemini/settings.html или redirect
- **СВЯЗИ**: logic.ai_analysis.gemini_services.GeminiService, User модель
- **ФОРМАТ**: HTML render или HTTP redirect

#### send_message(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.body (JSON с session_id, content)
- **ИСТОЧНИКИ ДАННЫХ**: logic.ai_analysis.gemini_handlers.MessageApiHandler
- **ОБРАБОТКА**: Парсинг JSON, отправка сообщения через MessageApiHandler
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с результатом операции
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.MessageApiHandler
- **ФОРМАТ**: JSON response

#### delete_session(request, session_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: session_id, request.user
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession)
- **ОБРАБОТКА**: Получение сессии по ID, деактивация сессии
- **ВЫХОДЯЩИЕ ДАННЫЕ**: messages → redirect на gemini:dashboard
- **СВЯЗИ**: apps.gemini.models.ChatSession
- **ФОРМАТ**: HTTP redirect

#### test_api_key(request)
- **ВХОДЯЩИЕ ДАННЫЕ**: request.body (JSON с api_key)
- **ИСТОЧНИКИ ДАННЫХ**: logic.ai_analysis.gemini_handlers.ApiKeyApiHandler
- **ОБРАБОТКА**: Парсинг JSON, тестирование API ключа через ApiKeyApiHandler
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с результатом тестирования
- **СВЯЗИ**: logic.ai_analysis.gemini_handlers.ApiKeyApiHandler
- **ФОРМАТ**: JSON response

#### update_session_title(request, session_id)
- **ВХОДЯЩИЕ ДАННЫЕ**: session_id, request.body (JSON с title)
- **ИСТОЧНИКИ ДАННЫХ**: База данных (ChatSession)
- **ОБРАБОТКА**: Получение сессии по ID, валидация названия, обновление
- **ВЫХОДЯЩИЕ ДАННЫЕ**: JsonResponse с результатом обновления
- **СВЯЗИ**: apps.gemini.models.ChatSession
- **ФОРМАТ**: JSON response

### logic/ai_analysis/gemini_services.py

#### GeminiService
- **ВХОДЯЩИЕ ДАННЫЕ**: API ключи, текстовые данные, сообщения
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Отправка запросов к Gemini API, генерация ответов, анализ текста
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Результаты генерации и анализа от Gemini AI
- **СВЯЗИ**: logic.base.api_client.BaseAPIClient, Google Gemini API
- **ФОРМАТ**: Словари с результатами операций

#### GeminiService.__init__()
- **ВХОДЯЩИЕ ДАННЫЕ**: api_key (строка с API ключом)
- **ИСТОЧНИКИ ДАННЫХ**: Переданный API ключ
- **ОБРАБОТКА**: Валидация ключа, настройка HTTP сессии
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Инициализированный сервис
- **СВЯЗИ**: logic.base.api_client.BaseAPIClient
- **ФОРМАТ**: Экземпляр класса GeminiService

#### GeminiService._make_request()
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint (строка), data (словарь), max_retries (число)
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Отправка HTTP запроса, обработка ошибок, повторные попытки
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Кортеж (успех, ответ, ошибка)
- **СВЯЗИ**: Google Gemini API
- **ФОРМАТ**: Tuple[bool, Dict, Optional[str]]

#### GeminiService.test_connection()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (использует self.api_key)
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Отправка тестового запроса для проверки подключения
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Кортеж (успех, сообщение)
- **СВЯЗИ**: Google Gemini API
- **ФОРМАТ**: Tuple[bool, str]

#### GeminiService.generate_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: prompt (строка), context (строка), max_tokens (число)
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Формирование запроса, отправка в Gemini API, извлечение ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом генерации
- **СВЯЗИ**: Google Gemini API
- **ФОРМАТ**: Словарь с ключами success, response, usage, raw_response

#### GeminiService.analyze_text()
- **ВХОДЯЩИЕ ДАННЫЕ**: text (строка), analysis_type (строка), max_tokens (число)
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Формирование промпта для анализа, отправка в Gemini API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом анализа
- **СВЯЗИ**: Google Gemini API, self.generate_response()
- **ФОРМАТ**: Словарь с результатом анализа

#### GeminiService.chat_completion()
- **ВХОДЯЩИЕ ДАННЫЕ**: messages (список словарей), max_tokens (число)
- **ИСТОЧНИКИ ДАННЫХ**: Google Gemini API
- **ОБРАБОТКА**: Преобразование сообщений в формат Gemini, отправка запроса
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатом завершения чата
- **СВЯЗИ**: Google Gemini API
- **ФОРМАТ**: Словарь с ключами success, response, usage, raw_response

## LOGIC/BASE

### logic/base/adapters.py

#### DeprecatedServiceAdapter
- **ВХОДЯЩИЕ ДАННЫЕ**: old_service_class, new_service_class (классы сервисов)
- **ИСТОЧНИКИ ДАННЫХ**: Переданные классы сервисов
- **ОБРАБОТКА**: Создание адаптера для плавной миграции с предупреждениями
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Экземпляр адаптера
- **СВЯЗИ**: warnings модуль
- **ФОРМАТ**: Экземпляр класса DeprecatedServiceAdapter

#### DeprecatedServiceAdapter.__init__()
- **ВХОДЯЩИЕ ДАННЫЕ**: old_service_class (старый класс), new_service_class (новый класс)
- **ИСТОЧНИКИ ДАННЫХ**: Переданные классы сервисов
- **ОБРАБОТКА**: Сохранение ссылок на старый и новый классы
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Инициализированный адаптер
- **СВЯЗИ**: Нет
- **ФОРМАТ**: Экземпляр класса

#### DeprecatedServiceAdapter.__call__()
- **ВХОДЯЩИЕ ДАННЫЕ**: *args, **kwargs (аргументы для создания сервиса)
- **ИСТОЧНИКИ ДАННЫХ**: self.old_service_class
- **ОБРАБОТКА**: Вывод предупреждения о deprecation, создание экземпляра старого сервиса
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Экземпляр старого сервиса
- **СВЯЗИ**: warnings.warn()
- **ФОРМАТ**: Экземпляр старого сервиса

### logic/base/api_client.py

#### APIResponse
- **ВХОДЯЩИЕ ДАННЫЕ**: success (bool), data (Any), error (str), status_code (int), headers (Dict)
- **ИСТОЧНИКИ ДАННЫХ**: HTTP ответы от внешних API
- **ОБРАБОТКА**: Стандартизация ответов API для унифицированной обработки
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Структурированный ответ API
- **СВЯЗИ**: Нет
- **ФОРМАТ**: dataclass с полями success, data, error, status_code, headers

#### BaseAPIClient
- **ВХОДЯЩИЕ ДАННЫЕ**: API ключи, URL, параметры конфигурации
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP запросы
- **ОБРАБОТКА**: Унифицированная работа с внешними API, обработка ошибок, повторные попытки
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Стандартизированные ответы API
- **СВЯЗИ**: requests библиотека, внешние API
- **ФОРМАТ**: APIResponse объекты

#### BaseAPIClient.__init__()
- **ВХОДЯЩИЕ ДАННЫЕ**: api_key (строка), base_url (строка), **kwargs (параметры)
- **ИСТОЧНИКИ ДАННЫХ**: Переданные параметры конфигурации
- **ОБРАБОТКА**: Настройка сессии, параметров таймаута и повторных попыток
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Инициализированный API клиент
- **СВЯЗИ**: requests.Session
- **ФОРМАТ**: Экземпляр класса BaseAPIClient

#### BaseAPIClient._setup_session()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (использует self.session)
- **ИСТОЧНИКИ ДАННЫХ**: requests.Session
- **ОБРАБОТКА**: Настройка заголовков HTTP сессии
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Настроенная HTTP сессия
- **СВЯЗИ**: self._setup_auth()
- **ФОРМАТ**: requests.Session

#### BaseAPIClient._setup_auth()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (абстрактный метод)
- **ИСТОЧНИКИ ДАННЫХ**: Нет (абстрактный метод)
- **ОБРАБОТКА**: Абстрактный метод для настройки аутентификации в наследниках
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Нет (абстрактный метод)
- **СВЯЗИ**: Нет (абстрактный метод)
- **ФОРМАТ**: Нет (абстрактный метод)

#### BaseAPIClient.make_request()
- **ВХОДЯЩИЕ ДАННЫЕ**: method (строка), endpoint (строка), data (словарь), params (словарь), **kwargs
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP запросы
- **ОБРАБОТКА**: Отправка HTTP запроса, обработка ошибок, повторные попытки при необходимости
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом запроса
- **СВЯЗИ**: requests библиотека, внешние API
- **ФОРМАТ**: APIResponse объект

#### BaseAPIClient.get()
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint (строка), params (словарь)
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP GET запросы
- **ОБРАБОТКА**: Вызов make_request с методом GET
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом GET запроса
- **СВЯЗИ**: self.make_request()
- **ФОРМАТ**: APIResponse объект

#### BaseAPIClient.post()
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint (строка), data (словарь)
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP POST запросы
- **ОБРАБОТКА**: Вызов make_request с методом POST
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом POST запроса
- **СВЯЗИ**: self.make_request()
- **ФОРМАТ**: APIResponse объект

#### BaseAPIClient.put()
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint (строка), data (словарь)
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP PUT запросы
- **ОБРАБОТКА**: Вызов make_request с методом PUT
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом PUT запроса
- **СВЯЗИ**: self.make_request()
- **ФОРМАТ**: APIResponse объект

#### BaseAPIClient.delete()
- **ВХОДЯЩИЕ ДАННЫЕ**: endpoint (строка)
- **ИСТОЧНИКИ ДАННЫХ**: Внешние API через HTTP DELETE запросы
- **ОБРАБОТКА**: Вызов make_request с методом DELETE
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом DELETE запроса
- **СВЯЗИ**: self.make_request()
- **ФОРМАТ**: APIResponse объект

#### BaseAPIClient.test_connection()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (абстрактный метод)
- **ИСТОЧНИКИ ДАННЫХ**: Нет (абстрактный метод)
- **ОБРАБОТКА**: Абстрактный метод для тестирования подключения в наследниках
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Нет (абстрактный метод)
- **СВЯЗИ**: Нет (абстрактный метод)
- **ФОРМАТ**: Нет (абстрактный метод)

### logic/base/api_views.py

#### BaseAPIViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: viewsets.ModelViewSet параметры
- **ИСТОЧНИКИ ДАННЫХ**: Django REST Framework viewsets
- **ОБРАБОТКА**: Унифицированная обработка CRUD операций с унифицированными ответами
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Стандартизированные API ответы
- **СВЯЗИ**: UnifiedResponseHandler, rest_framework
- **ФОРМАТ**: ModelViewSet с кастомными методами

#### BaseAPIViewSet.handle_exception()
- **ВХОДЯЩИЕ ДАННЫЕ**: exc (исключение)
- **ИСТОЧНИКИ ДАННЫХ**: Django REST Framework исключения
- **ОБРАБОТКА**: Логирование ошибки и возврат унифицированного ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 500 ответ с деталями ошибки
- **СВЯЗИ**: UnifiedResponseHandler.error_response()
- **ФОРМАТ**: Response с error_response

#### BaseAPIViewSet.create()
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос), *args, **kwargs
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework request данные
- **ОБРАБОТКА**: Валидация и создание объекта с унифицированным ответом
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 201 ответ с созданными данными
- **СВЯЗИ**: UnifiedResponseHandler.success_response()
- **ФОРМАТ**: Response с success_response или error_response

#### BaseAPIViewSet.update()
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос), *args, **kwargs
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework request данные
- **ОБРАБОТКА**: Валидация и обновление объекта с унифицированным ответом
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 200 ответ с обновленными данными
- **СВЯЗИ**: UnifiedResponseHandler.success_response()
- **ФОРМАТ**: Response с success_response или error_response

#### BaseAPIViewSet.destroy()
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос), *args, **kwargs
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework request данные
- **ОБРАБОТКА**: Удаление объекта с унифицированным ответом
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 204 ответ об успешном удалении
- **СВЯЗИ**: UnifiedResponseHandler.success_response()
- **ФОРМАТ**: Response с success_response или error_response

#### BaseAPIViewSet.list()
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос), *args, **kwargs
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework request данные
- **ОБРАБОТКА**: Получение списка объектов с пагинацией и унифицированным ответом
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 200 ответ со списком данных
- **СВЯЗИ**: UnifiedResponseHandler.success_response()
- **ФОРМАТ**: Response с success_response или error_response

#### BaseAPIViewSet.retrieve()
- **ВХОДЯЩИЕ ДАННЫЕ**: request (HTTP запрос), *args, **kwargs
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework request данные
- **ОБРАБОТКА**: Получение одного объекта по ID с унифицированным ответом
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 200 ответ с данными объекта
- **СВЯЗИ**: UnifiedResponseHandler.success_response()
- **ФОРМАТ**: Response с success_response или error_response

#### FinanceAPIViewSet
- **ВХОДЯЩИЕ ДАННЫЕ**: BaseAPIViewSet параметры
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework viewsets
- **ОБРАБОТКА**: Специализированная обработка для Finance приложения
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Стандартизированные API ответы для Finance
- **СВЯЗИ**: UnifiedResponseHandler, logging
- **ФОРМАТ**: ModelViewSet с Finance-специфичной обработкой

#### FinanceAPIViewSet.handle_exception()
- **ВХОДЯЩИЕ ДАННЫЕ**: exc (исключение)
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework исключения
- **ОБРАБОТКА**: Логирование в Finance логгер и возврат унифицированного ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: HTTP 500 ответ с Finance-специфичным кодом ошибки
- **СВЯЗИ**: UnifiedResponseHandler.error_response(), logging
- **ФОРМАТ**: Response с error_response и FINANCE_API_ERROR кодом

### logic/base/currency_service.py

#### UnifiedCurrencyService
- **ВХОДЯЩИЕ ДАННЫЕ**: НБРБ API параметры
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API (api.nbrb.by)
- **ОБРАБОТКА**: Получение и обновление курсов валют через НБРБ API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Курсы валют в формате APIResponse
- **СВЯЗИ**: BaseAPIClient, НБРБ API
- **ФОРМАТ**: APIResponse объекты с данными о курсах валют

#### UnifiedCurrencyService.__init__()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет (для НБРБ API не нужен API ключ)
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API конфигурация
- **ОБРАБОТКА**: Настройка подключения к НБРБ API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Инициализированный сервис валют
- **СВЯЗИ**: BaseAPIClient
- **ФОРМАТ**: Экземпляр UnifiedCurrencyService

#### UnifiedCurrencyService._setup_auth()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API конфигурация
- **ОБРАБОТКА**: НБРБ API не требует аутентификации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Нет
- **СВЯЗИ**: Нет
- **ФОРМАТ**: Нет

#### UnifiedCurrencyService.get_currency_rate()
- **ВХОДЯЩИЕ ДАННЫЕ**: currency_code (строка кода валюты)
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API
- **ОБРАБОТКА**: Запрос курса валюты через НБРБ API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с курсом валюты
- **СВЯЗИ**: self.get()
- **ФОРМАТ**: APIResponse объект

#### UnifiedCurrencyService.get_all_rates()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API для USD и PLN
- **ОБРАБОТКА**: Получение курсов для всех поддерживаемых валют
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с курсами валют
- **СВЯЗИ**: self.get_currency_rate()
- **ФОРМАТ**: Dict[str, Any] с курсами валют

#### UnifiedCurrencyService.test_connection()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API
- **ОБРАБОТКА**: Тестовый запрос курса USD для проверки подключения
- **ВЫХОДЯЩИЕ ДАННЫЕ**: APIResponse с результатом теста
- **СВЯЗИ**: self.get()
- **ФОРМАТ**: APIResponse объект

#### UnifiedCurrencyService.update_currency_rates_in_db()
- **ВХОДЯЩИЕ ДАННЫЕ**: Нет
- **ИСТОЧНИКИ ДАННЫЕ**: НБРБ API, Django модель CurrencyRate
- **ОБРАБОТКА**: Получение курсов валют и сохранение в базу данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с результатами обновления
- **СВЯЗИ**: self.get_all_rates(), CurrencyRate модель
- **ФОРМАТ**: Dict[str, Any] с результатами обновления

### logic/base/exceptions.py

#### LogicBaseException
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка сообщения об ошибке)
- **ИСТОЧНИКИ ДАННЫЕ**: Python Exception класс
- **ОБРАБОТКА**: Базовое исключение для всех logic модулей
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Exception объект
- **СВЯЗИ**: Python Exception
- **ФОРМАТ**: Exception класс

#### APIClientException
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка сообщения об ошибке)
- **ИСТОЧНИКИ ДАННЫЕ**: LogicBaseException
- **ОБРАБОТКА**: Исключения при работе с внешними API
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Exception объект
- **СВЯЗИ**: LogicBaseException
- **ФОРМАТ**: Exception класс

#### ValidationException
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка сообщения об ошибке)
- **ИСТОЧНИКИ ДАННЫЕ**: LogicBaseException
- **ОБРАБОТКА**: Исключения при валидации данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Exception объект
- **СВЯЗИ**: LogicBaseException
- **ФОРМАТ**: Exception класс

#### SyncException
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка сообщения об ошибке)
- **ИСТОЧНИКИ ДАННЫЕ**: LogicBaseException
- **ОБРАБОТКА**: Исключения при синхронизации данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Exception объект
- **СВЯЗИ**: LogicBaseException
- **ФОРМАТ**: Exception класс

#### AnalysisException
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка сообщения об ошибке)
- **ИСТОЧНИКИ ДАННЫЕ**: LogicBaseException
- **ОБРАБОТКА**: Исключения при AI анализе данных
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Exception объект
- **СВЯЗИ**: LogicBaseException
- **ФОРМАТ**: Exception класс

### logic/base/response_handler.py

#### UnifiedResponseHandler
- **ВХОДЯЩИЕ ДАННЫЕ**: Данные ответа, сообщения, коды статуса
- **ИСТОЧНИКИ ДАННЫЕ**: Django views, API endpoints
- **ОБРАБОТКА**: Стандартизация ответов API и HTTP запросов
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Унифицированные ответы в JSON формате
- **СВЯЗИ**: Django JsonResponse, DRF Response
- **ФОРМАТ**: Dict[str, Any] или Response объекты

#### UnifiedResponseHandler.success_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: data (любые данные), message (строка), status_code (int)
- **ИСТОЧНИКИ ДАННЫЕ**: Успешные операции приложений
- **ОБРАБОТКА**: Формирование стандартизированного успешного ответа
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с success=True и данными
- **СВЯЗИ**: Нет
- **ФОРМАТ**: Dict[str, Any] с полями success, data, message

#### UnifiedResponseHandler.error_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: message (строка), error_code (строка), details (словарь), status_code (int)
- **ИСТОЧНИКИ ДАННЫЕ**: Ошибки приложений и API
- **ОБРАБОТКА**: Формирование стандартизированного ответа с ошибкой
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с success=False и деталями ошибки
- **СВЯЗИ**: Нет
- **ФОРМАТ**: Dict[str, Any] с полями success, error, error_code, details

#### UnifiedResponseHandler.validation_error_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: errors (словарь с ошибками валидации)
- **ИСТОЧНИКИ ДАННЫЕ**: Django serializers, формы валидации
- **ОБРАБОТКА**: Формирование стандартизированного ответа с ошибками валидации
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Словарь с success=False и validation_errors
- **СВЯЗИ**: Нет
- **ФОРМАТ**: Dict[str, Any] с полями success, error, validation_errors

#### UnifiedResponseHandler.api_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: data (словарь данных), status_code (int)
- **ИСТОЧНИКИ ДАННЫЕ**: Django REST Framework
- **ОБРАБОТКА**: Создание DRF Response объекта
- **ВЫХОДЯЩИЕ ДАННЫЕ**: DRF Response объект
- **СВЯЗИ**: rest_framework.response.Response
- **ФОРМАТ**: Response объект

#### UnifiedResponseHandler.json_response()
- **ВХОДЯЩИЕ ДАННЫЕ**: data (словарь данных), status_code (int)
- **ИСТОЧНИКИ ДАННЫЕ**: Django HTTP
- **ОБРАБОТКА**: Создание Django JsonResponse объекта
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Django JsonResponse объект
- **СВЯЗИ**: django.http.JsonResponse
- **ФОРМАТ**: JsonResponse объект

### logic/base/view_adapters.py

#### legacy_view_adapter()
- **ВХОДЯЩИЕ ДАННЫЕ**: new_view_func (функция view)
- **ИСТОЧНИКИ ДАННЫЕ**: Django views
- **ОБРАБОТКА**: Обертка view функции с обработкой ошибок
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Обернутая view функция
- **СВЯЗИ**: functools.wraps, UnifiedResponseHandler
- **ФОРМАТ**: Декоратор функции

#### deprecated_view_wrapper()
- **ВХОДЯЩИЕ ДАННЫЕ**: old_view_name (строка), new_view_name (строка)
- **ИСТОЧНИКИ ДАННЫЕ**: Deprecated views
- **ОБРАБОТКА**: Создание декоратора с предупреждением о deprecation
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Декоратор функции
- **СВЯЗИ**: warnings.warn
- **ФОРМАТ**: Декоратор функции

#### finance_view_adapter()
- **ВХОДЯЩИЕ ДАННЫЕ**: view_func (функция Finance view)
- **ИСТОЧНИКИ ДАННЫЕ**: Finance views
- **ОБРАБОТКА**: Обертка Finance view с логированием и обработкой ошибок
- **ВЫХОДЯЩИЕ ДАННЫЕ**: Обернутая Finance view функция
- **СВЯЗИ**: logging, UnifiedResponseHandler
- **ФОРМАТ**: Декоратор функции
