# ClickUp Integration App Documentation

## Обзор

Приложение `clickup_int` обеспечивает интеграцию с ClickUp API для синхронизации задач, управления проектами и автоматизации HR-процессов. Включает кэширование данных, логирование операций, массовый импорт и веб-интерфейс для работы с задачами ClickUp.

## Основные функции

- Интеграция с ClickUp API
- Синхронизация задач и проектов
- Кэширование данных для оптимизации производительности
- Логирование всех операций с API
- Веб-интерфейс для просмотра и управления задачами
- Массовый импорт задач с отслеживанием прогресса
- Перенос данных ClickUp задач в Huntflow
- Обработка различных типов контента (текст, файлы, вложения)
- Управление настройками синхронизации
- Автоматические ответы на основе ключевых слов

## Модели данных

### ClickUpSettings (Настройки ClickUp)
Модель для хранения пользовательских настроек интеграции с ClickUp.

**Поля:**
- `user` (OneToOneField к `User`): Пользователь, которому принадлежат настройки.
- `team_id` (CharField): ID команды в ClickUp.
- `space_id` (CharField): ID пространства в ClickUp.
- `folder_id` (CharField): ID папки в ClickUp (опционально).
- `list_id` (CharField): ID списка задач в ClickUp.
- `auto_sync` (BooleanField): Включена ли автоматическая синхронизация.
- `sync_interval` (PositiveIntegerField): Интервал синхронизации в минутах (по умолчанию 30).
- `created_at` (DateTimeField): Дата и время создания записи.
- `updated_at` (DateTimeField): Дата и время последнего обновления записи.
- `last_sync_at` (DateTimeField): Дата и время последней синхронизации.

**Методы:**
- `get_api_token()`: Получает API токен из профиля пользователя.
- `get_path_description()`: Возвращает описание пути к задачам.
- `get_or_create_for_user(user)`: Получает или создает настройки для пользователя.

### ClickUpTask (Задача ClickUp)
Модель для кэширования задач из ClickUp.

**Поля:**
- `task_id` (CharField): Уникальный ID задачи в ClickUp.
- `name` (CharField): Название задачи.
- `description` (TextField): Описание задачи.
- `status` (CharField): Статус задачи.
- `priority` (CharField): Приоритет задачи.
- `date_created` (DateTimeField): Дата создания в ClickUp.
- `date_updated` (DateTimeField): Дата обновления в ClickUp.
- `due_date` (DateTimeField): Срок выполнения.
- `url` (URLField): Ссылка на задачу в ClickUp.
- `attachments` (JSONField): Список вложений в формате JSON.
- `assignees` (JSONField): Список исполнителей в формате JSON.
- `tags` (JSONField): Список тегов в формате JSON.
- `custom_fields` (JSONField): Дополнительные поля задачи.
- `user` (ForeignKey к `User`): Пользователь, которому принадлежит задача.
- `created_at` (DateTimeField): Дата создания записи в системе.
- `updated_at` (DateTimeField): Дата обновления записи в системе.

**Методы:**
- `get_assignees_display()`: Возвращает список исполнителей для отображения.
- `get_tags_display()`: Возвращает список тегов для отображения.
- `get_attachments_display()`: Возвращает список вложений для отображения.
- `get_custom_fields_display()`: Возвращает дополнительные поля для отображения.

### ClickUpSyncLog (Лог синхронизации)
Модель для логирования операций синхронизации с ClickUp.

**Поля:**
- `user` (ForeignKey к `User`): Пользователь, выполнивший синхронизацию.
- `status` (CharField): Статус синхронизации (success, error, partial).
- `tasks_processed` (PositiveIntegerField): Количество обработанных задач.
- `tasks_created` (PositiveIntegerField): Количество созданных задач.
- `tasks_updated` (PositiveIntegerField): Количество обновленных задач.
- `error_message` (TextField): Сообщение об ошибке.
- `sync_duration` (FloatField): Длительность синхронизации в секундах.
- `created_at` (DateTimeField): Время синхронизации.

### ClickUpBulkImport (Массовый импорт)
Модель для отслеживания массового импорта задач ClickUp.

**Поля:**
- `user` (ForeignKey к `User`): Пользователь, выполнивший импорт.
- `status` (CharField): Статус импорта (running, completed, failed, cancelled, stopped).
- `total_tasks` (PositiveIntegerField): Общее количество задач для импорта.
- `processed_tasks` (PositiveIntegerField): Количество обработанных задач.
- `successful_tasks` (PositiveIntegerField): Количество успешно импортированных задач.
- `failed_tasks` (PositiveIntegerField): Количество неудачных импортов.
- `failed_task_ids` (JSONField): Список ID неудачных задач.
- `error_message` (TextField): Сообщение об ошибке.
- `celery_task_id` (CharField): ID задачи Celery.
- `created_at` (DateTimeField): Дата создания.
- `updated_at` (DateTimeField): Дата обновления.
- `completed_at` (DateTimeField): Дата завершения.

**Свойства:**
- `progress_percentage`: Возвращает процент выполнения импорта.
- `success_rate`: Возвращает процент успешных импортов.

## API Endpoints

API для приложения `clickup_int` предоставляет следующие конечные точки:

### Настройки
- `GET /clickup/settings/`: Страница настроек ClickUp.
- `POST /clickup/settings/`: Сохранение настроек ClickUp.
- `POST /clickup/api/test-connection/`: Тестирование подключения к ClickUp.
- `GET /clickup/api/path-options/`: Получение вариантов пути в ClickUp.

### Путь к задачам
- `GET /clickup/api/spaces/`: Получение пространств команды.
- `GET /clickup/api/folders/`: Получение папок пространства.
- `GET /clickup/api/lists/`: Получение списков задач.

### Задачи
- `GET /clickup/tasks/`: Список задач ClickUp с фильтрацией и поиском.
- `GET /clickup/task/<str:task_id>/`: Детальная информация о задаче.
- `POST /clickup/task/<str:task_id>/transfer-to-huntflow/`: Перенос задачи в Huntflow.

### API операции
- `POST /clickup/api/sync-tasks/`: Запуск синхронизации задач.
- `POST /clickup/api/clear-cache/`: Очистка кэша задач.

### Массовый импорт
- `GET /clickup/bulk-import/`: Страница массового импорта задач.
- `GET /clickup/bulk-import/<int:import_id>/`: Отслеживание прогресса импорта.
- `POST /clickup/api/start-bulk-import/`: Запуск массового импорта.
- `POST /clickup/api/stop-bulk-import/<int:import_id>/`: Остановка массового импорта.
- `GET /clickup/api/bulk-import-progress/<int:import_id>/`: Получение прогресса импорта.
- `POST /clickup/api/retry-failed-tasks/<int:import_id>/`: Повторный импорт неудачных задач.

### Логи
- `GET /clickup/sync-logs/`: Список логов синхронизации.

## Веб-интерфейс (Views)

Приложение предоставляет следующие веб-страницы:

- `/clickup/`: Дашборд интеграции с ClickUp.
- `/clickup/settings/`: Настройки интеграции с ClickUp.
- `/clickup/tasks/`: Список задач с возможностью поиска и фильтрации.
- `/clickup/task/<task_id>/`: Детальная информация о задаче.
- `/clickup/bulk-import/`: Страница массового импорта задач.
- `/clickup/bulk-import/<import_id>/`: Отслеживание прогресса массового импорта.
- `/clickup/sync-logs/`: Логи синхронизации.

## Сервисы

### ClickUpService
Основной сервис для работы с ClickUp API.

**Ключевые методы:**
- `test_connection()`: Тестирует подключение к ClickUp API.
- `get_user_info()`: Получает информацию о пользователе.
- `get_teams()`: Получает список команд.
- `get_spaces(team_id)`: Получает список пространств команды.
- `get_folders(space_id)`: Получает список папок пространства.
- `get_lists(folder_id, space_id)`: Получает список задач.
- `get_task(task_id)`: Получает информацию о задаче.
- `get_task_attachments(task_id)`: Получает вложения задачи.
- `get_task_comments(task_id)`: Получает комментарии к задаче.
- `parse_task_data(task_data)`: Парсит данные задачи из ClickUp API в формат для сохранения.
- `sync_tasks(list_id, user, max_tasks)`: Синхронизирует задачи из списка.

### ClickUpCacheService
Сервис для кэширования данных ClickUp.

**Ключевые методы:**
- `get_cached_tasks(user, limit)`: Получает кэшированные задачи пользователя.
- `clear_user_cache(user)`: Очищает кэш задач пользователя.

## Формы

### ClickUpSettingsForm
Форма для управления настройками ClickUp.

**Поля:**
- `team_id`: Выбор команды из списка доступных.
- `space_id`: Выбор пространства команды.
- `folder_id`: Выбор папки в пространстве (опционально).
- `list_id`: Выбор списка задач.
- `auto_sync`: Включение автоматической синхронизации.
- `sync_interval`: Интервал синхронизации в минутах.

**Особенности:**
- Автоматически загружает список доступных команд, пространств, папок и списков.
- Валидация API токена.
- Проверка интервала синхронизации (1-1440 минут).
- Каскадная загрузка опций (команда → пространство → папка → список).

### ClickUpTestConnectionForm
Форма для тестирования подключения к ClickUp.

### ClickUpPathForm
Форма для выбора пути в ClickUp с динамической загрузкой опций.

## Интеграция с другими приложениями

### Huntflow
- Перенос данных ClickUp задач в Huntflow кандидатов.
- Обработка PDF файлов резюме.
- Извлечение LinkedIn и rabota.by ссылок из custom fields.
- Создание кандидатов на основе данных ClickUp.

### Accounts
- Использует модель `User` для привязки настроек и задач к пользователям.
- Получает API токен из профиля пользователя.

### Celery
- Используется для асинхронного выполнения массового импорта задач.
- Отслеживание прогресса выполнения задач.

## Безопасность и производительность

- **API токены**: Используются API токены ClickUp для безопасной авторизации.
- **Кэширование**: Значительно снижает количество запросов к ClickUp API.
- **Обработка ошибок**: Предусмотрена обработка различных типов ошибок API.
- **Таймауты**: Установлены таймауты для запросов к API.
- **Валидация данных**: Валидация всех входящих данных от пользователя.
- **Логирование**: Детальное логирование всех операций для отладки.
- **Массовый импорт**: Асинхронная обработка больших объемов данных через Celery.

## Примеры использования

### Синхронизация задач
```python
from apps.clickup_int.services import ClickUpService
from apps.clickup_int.models import ClickUpSettings

# Получаем настройки пользователя
settings = ClickUpSettings.objects.get(user=request.user)

# Создаем сервис
service = ClickUpService(request.user.clickup_api_key)

# Синхронизируем задачи
tasks_processed, tasks_created, tasks_updated = service.sync_tasks(
    settings.list_id, 
    request.user, 
    max_tasks=100
)
```

### Получение данных задачи
```python
# Получаем задачу
task_data = service.get_task(task_id)

# Парсим данные
parsed_data = service.parse_task_data(task_data)

# Получаем вложения и комментарии
attachments = service.get_task_attachments(task_id)
comments = service.get_task_comments(task_id)
```

### Перенос в Huntflow
```python
# Получаем задачу из кэша
task = ClickUpTask.objects.get(task_id=task_id, user=request.user)

# Получаем вложения
attachments = task.get_attachments_display()
pdf_attachments = [att for att in attachments if att.get('extension', '').lower() == 'pdf']

# Переносим в Huntflow
if pdf_attachments:
    # Обрабатываем PDF файлы
    oldest_attachment = min(pdf_attachments, key=lambda x: x.get('date', 0))
    file_response = requests.get(oldest_attachment['url'])
    parsed_data = huntflow_service.upload_file(
        account_id=account_id,
        file_data=file_response.content,
        file_name=oldest_attachment['title'],
        parse_file=True
    )
```

### Массовый импорт
```python
from apps.clickup_int.tasks import bulk_import_clickup_tasks

# Запуск массового импорта через Celery
task = bulk_import_clickup_tasks.apply_async(args=[user.id, bulk_import.id])

# Отслеживание прогресса
bulk_import = ClickUpBulkImport.objects.get(id=import_id)
progress = bulk_import.progress_percentage
success_rate = bulk_import.success_rate
```

## Обработка ошибок

### ClickUpAPIError
Основное исключение для ошибок ClickUp API:
- 401: Неверный API токен
- 403: Недостаточно прав доступа
- 404: Ресурс не найден
- 429: Превышен лимит запросов
- Таймауты и ошибки подключения

### Валидация данных
- Проверка обязательных полей
- Валидация форматов дат
- Проверка типов данных в JSON полях
- Валидация API токенов
- Проверка интервалов синхронизации

## Настройки и конфигурация

### Переменные окружения
- `CLICKUP_API_KEY`: API токен пользователя (хранится в профиле)
- `CLICKUP_API_URL`: Базовый URL API ClickUp (по умолчанию "https://api.clickup.com/api/v2")

### Настройки по умолчанию
- Интервал синхронизации: 30 минут
- Максимум задач за синхронизацию: 100
- Таймаут запросов: 30 секунд
- Размер страницы для пагинации: 20 элементов
- Задержка между задачами при массовом импорте: 8 секунд

## Массовый импорт

### Особенности
- Асинхронное выполнение через Celery
- Отслеживание прогресса в реальном времени
- Возможность остановки и возобновления
- Повторный импорт неудачных задач
- Логирование всех операций

### Статусы импорта
- `running`: Выполняется
- `completed`: Завершен
- `failed`: Ошибка
- `cancelled`: Отменен
- `stopped`: Остановлен

### Метрики
- Процент выполнения (`progress_percentage`)
- Процент успешных импортов (`success_rate`)
- Количество обработанных задач
- Список неудачных задач
