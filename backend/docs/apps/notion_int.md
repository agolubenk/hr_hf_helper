# Notion Integration App Documentation

## Обзор

Приложение `notion_int` обеспечивает интеграцию с Notion API для синхронизации страниц, баз данных и управления контентом. Включает кэширование данных, логирование операций и веб-интерфейс для работы со страницами Notion.

## Основные функции

- Интеграция с Notion API
- Синхронизация страниц и баз данных
- Кэширование данных для оптимизации производительности
- Логирование всех операций с API
- Веб-интерфейс для просмотра и управления страницами
- Массовый импорт страниц
- Перенос данных Notion страниц в Huntflow
- Обработка различных типов контента (текст, файлы, изображения, видео)
- Управление настройками синхронизации

## Модели данных

### NotionSettings (Настройки Notion)
Модель для хранения пользовательских настроек интеграции с Notion.

**Поля:**
- `user` (OneToOneField к `User`): Пользователь, которому принадлежат настройки.
- `database_id` (CharField): ID базы данных в Notion для синхронизации.
- `auto_sync` (BooleanField): Включена ли автоматическая синхронизация.
- `sync_interval` (PositiveIntegerField): Интервал синхронизации в минутах (по умолчанию 30).
- `created_at` (DateTimeField): Дата и время создания записи.
- `updated_at` (DateTimeField): Дата и время последнего обновления записи.
- `last_sync_at` (DateTimeField): Дата и время последней синхронизации.

**Методы:**
- `get_integration_token()`: Получает integration токен из профиля пользователя.
- `get_database_description()`: Возвращает описание базы данных.
- `get_or_create_for_user(user)`: Получает или создает настройки для пользователя.

### NotionPage (Страница Notion)
Модель для кэширования страниц из Notion.

**Поля:**
- `page_id` (CharField): Уникальный ID страницы в Notion.
- `title` (CharField): Название страницы.
- `content` (TextField): Содержимое страницы в HTML формате.
- `comments` (JSONField): Комментарии к странице.
- `status` (CharField): Статус страницы.
- `priority` (CharField): Приоритет.
- `date_created` (DateTimeField): Дата создания в Notion.
- `date_updated` (DateTimeField): Дата обновления в Notion.
- `due_date` (DateTimeField): Срок выполнения.
- `url` (URLField): Ссылка на страницу в Notion.
- `attachments` (JSONField): Список вложений в формате JSON.
- `assignees` (JSONField): Список исполнителей в формате JSON.
- `tags` (JSONField): Список тегов в формате JSON.
- `custom_properties` (JSONField): Дополнительные свойства страницы.
- `user` (ForeignKey к `User`): Пользователь, которому принадлежит страница.
- `created_at` (DateTimeField): Дата создания записи в системе.
- `updated_at` (DateTimeField): Дата обновления записи в системе.

**Методы:**
- `get_assignees_display()`: Возвращает список исполнителей для отображения.
- `get_tags_display()`: Возвращает список тегов для отображения.
- `get_comments_display()`: Возвращает список комментариев для отображения.
- `get_attachments_display()`: Возвращает список вложений для отображения.
- `get_custom_properties_display()`: Возвращает дополнительные свойства для отображения.

### NotionSyncLog (Лог синхронизации)
Модель для логирования операций синхронизации с Notion.

**Поля:**
- `user` (ForeignKey к `User`): Пользователь, выполнивший синхронизацию.
- `status` (CharField): Статус синхронизации (success, error, partial).
- `pages_processed` (PositiveIntegerField): Количество обработанных страниц.
- `pages_created` (PositiveIntegerField): Количество созданных страниц.
- `pages_updated` (PositiveIntegerField): Количество обновленных страниц.
- `error_message` (TextField): Сообщение об ошибке.
- `sync_duration` (FloatField): Длительность синхронизации в секундах.
- `created_at` (DateTimeField): Время синхронизации.

### NotionBulkImport (Массовый импорт)
Модель для отслеживания массового импорта страниц Notion.

**Поля:**
- `user` (ForeignKey к `User`): Пользователь, выполнивший импорт.
- `status` (CharField): Статус импорта (running, completed, failed, cancelled, stopped).
- `total_pages` (PositiveIntegerField): Общее количество страниц для импорта.
- `processed_pages` (PositiveIntegerField): Количество обработанных страниц.
- `successful_pages` (PositiveIntegerField): Количество успешно импортированных страниц.
- `failed_pages` (PositiveIntegerField): Количество неудачных импортов.
- `failed_page_ids` (JSONField): Список ID неудачных страниц.
- `error_message` (TextField): Сообщение об ошибке.
- `celery_task_id` (CharField): ID задачи Celery.
- `created_at` (DateTimeField): Дата создания.
- `updated_at` (DateTimeField): Дата обновления.
- `completed_at` (DateTimeField): Дата завершения.

**Свойства:**
- `progress_percentage`: Возвращает процент выполнения импорта.
- `success_rate`: Возвращает процент успешных импортов.

## API Endpoints

API для приложения `notion_int` предоставляет следующие конечные точки:

### Настройки
- `GET /notion/settings/`: Страница настроек Notion.
- `POST /notion/settings/save/`: Сохранение настроек Notion.
- `POST /notion/settings/test/`: Тестирование подключения к Notion.
- `POST /notion/settings/databases/`: Получение списка доступных баз данных.

### Страницы
- `GET /notion/pages/`: Список страниц Notion с фильтрацией и поиском.
- `GET /notion/pages/<str:page_id>/`: Детальная информация о странице.

### API операции
- `POST /notion/api/sync/`: Запуск синхронизации страниц.
- `POST /notion/api/clear-cache/`: Очистка кэша страниц.
- `POST /notion/api/transfer-to-huntflow/`: Перенос данных Notion страницы в Huntflow.

### Логи
- `GET /notion/logs/`: Список логов синхронизации.

## Веб-интерфейс (Views)

Приложение предоставляет следующие веб-страницы:

- `/notion/`: Дашборд интеграции с Notion.
- `/notion/settings/`: Настройки интеграции с Notion.
- `/notion/pages/`: Список страниц с возможностью поиска и фильтрации.
- `/notion/pages/<page_id>/`: Детальная информация о странице.
- `/notion/logs/`: Логи синхронизации.

## Сервисы

### NotionService
Основной сервис для работы с Notion API.

**Ключевые методы:**
- `test_connection()`: Тестирует подключение к Notion API.
- `get_user_info()`: Получает информацию о пользователе.
- `get_databases()`: Получает список доступных баз данных.
- `get_database(database_id)`: Получает информацию о базе данных.
- `query_database(database_id, filter_dict, sorts, page_size)`: Запрашивает страницы из базы данных.
- `get_page(page_id)`: Получает информацию о странице.
- `get_page_content(page_id)`: Получает содержимое страницы (блоки).
- `get_page_comments(page_id)`: Получает комментарии к странице.
- `parse_page_content(blocks)`: Парсит блоки страницы в HTML.
- `parse_page_data(page_data)`: Парсит данные страницы из Notion API в формат для сохранения.
- `create_page(database_id, properties)`: Создает новую страницу в базе данных.
- `update_page(page_id, properties)`: Обновляет страницу.
- `sync_pages(database_id, user, max_pages)`: Синхронизирует страницы из базы данных.

**Поддерживаемые типы блоков контента:**
- `paragraph`: Параграфы текста
- `heading_1`, `heading_2`, `heading_3`: Заголовки
- `bulleted_list_item`, `numbered_list_item`: Списки
- `to_do`: Чекбоксы
- `code`: Блоки кода
- `quote`: Цитаты
- `divider`: Разделители
- `image`: Изображения
- `file`: Файлы
- `pdf`: PDF документы
- `video`: Видео
- `audio`: Аудио
- `bookmark`: Закладки
- `embed`: Встроенный контент
- `table`: Таблицы
- `callout`: Выделенные блоки
- `toggle`: Сворачиваемые блоки

### NotionCacheService
Сервис для кэширования данных Notion.

**Ключевые методы:**
- `get_cached_pages(user, limit)`: Получает кэшированные страницы пользователя.
- `clear_user_cache(user)`: Очищает кэш страниц пользователя.

## Формы

### NotionSettingsForm
Форма для управления настройками Notion.

**Поля:**
- `database_id`: Выбор базы данных из списка доступных.
- `auto_sync`: Включение автоматической синхронизации.
- `sync_interval`: Интервал синхронизации в минутах.

**Особенности:**
- Автоматически загружает список доступных баз данных.
- Валидация integration токена.
- Проверка интервала синхронизации (1-1440 минут).

### NotionTestConnectionForm
Форма для тестирования подключения к Notion.

## Интеграция с другими приложениями

### Huntflow
- Перенос данных Notion страниц в Huntflow кандидатов.
- Обработка PDF файлов резюме.
- Извлечение LinkedIn и rabota.by ссылок из содержимого.
- Создание кандидатов на основе данных Notion.

### Accounts
- Использует модель `User` для привязки настроек и страниц к пользователям.
- Получает integration токен из профиля пользователя.

## Безопасность и производительность

- **API токены**: Используются integration токены Notion для безопасной авторизации.
- **Кэширование**: Значительно снижает количество запросов к Notion API.
- **Обработка ошибок**: Предусмотрена обработка различных типов ошибок API.
- **Таймауты**: Установлены таймауты для запросов к API.
- **Валидация данных**: Валидация всех входящих данных от пользователя.
- **Логирование**: Детальное логирование всех операций для отладки.

## Примеры использования

### Синхронизация страниц
```python
from apps.notion_int.services import NotionService
from apps.notion_int.models import NotionSettings

# Получаем настройки пользователя
settings = NotionSettings.objects.get(user=request.user)

# Создаем сервис
service = NotionService(request.user.notion_integration_token)

# Синхронизируем страницы
pages_processed, pages_created, pages_updated = service.sync_pages(
    settings.database_id, 
    request.user, 
    max_pages=100
)
```

### Получение содержимого страницы
```python
# Получаем страницу
page_data = service.get_page(page_id)

# Парсим данные
parsed_data = service.parse_page_data(page_data)

# Получаем содержимое
content_blocks = service.get_page_content(page_id)
html_content = service.parse_page_content(content_blocks)
```

### Перенос в Huntflow
```python
# Получаем страницу из кэша
page = NotionPage.objects.get(page_id=page_id, user=request.user)

# Получаем вложения
attachments = page.get_attachments_display()
pdf_attachments = [att for att in attachments if att.get('name', '').lower().endswith('.pdf')]

# Переносим в Huntflow
if pdf_attachments:
    # Обрабатываем PDF файлы
    pdf_attachment = pdf_attachments[0]
    file_response = requests.get(pdf_attachment['url'])
    parsed_data = huntflow_service.upload_file(
        account_id=account_id,
        file_data=file_response.content,
        file_name=pdf_attachment['name'],
        parse_file=True
    )
```

## Обработка ошибок

### NotionAPIError
Основное исключение для ошибок Notion API:
- 401: Неверный integration токен
- 403: Недостаточно прав доступа
- 404: Ресурс не найден
- 429: Превышен лимит запросов
- Таймауты и ошибки подключения

### Валидация данных
- Проверка обязательных полей
- Валидация форматов дат
- Проверка типов данных в JSON полях
- Валидация integration токенов

## Настройки и конфигурация

### Переменные окружения
- `NOTION_INTEGRATION_TOKEN`: Integration токен пользователя (хранится в профиле)
- `NOTION_VERSION`: Версия API Notion (по умолчанию "2022-06-28")

### Настройки по умолчанию
- Интервал синхронизации: 30 минут
- Максимум страниц за синхронизацию: 100
- Таймаут запросов: 30 секунд
- Размер страницы для пагинации: 20 элементов
