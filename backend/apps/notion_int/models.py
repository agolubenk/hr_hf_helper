from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import json

User = get_user_model()


class NotionSettings(models.Model):
    """Настройки интеграции с Notion для пользователя"""
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        verbose_name='Пользователь',
        related_name='notion_settings'
    )
    
    # API настройки (используем из профиля пользователя)
    # integration_token теперь берется из user.notion_integration_token
    
    # Настройки базы данных
    database_id = models.CharField(
        max_length=100,
        verbose_name='ID базы данных',
        help_text='ID базы данных в Notion'
    )
    
    # Дополнительные настройки
    auto_sync = models.BooleanField(
        default=True,
        verbose_name='Автоматическая синхронизация',
        help_text='Автоматически синхронизировать страницы'
    )
    
    sync_interval = models.PositiveIntegerField(
        default=30,
        verbose_name='Интервал синхронизации (минуты)',
        help_text='Интервал автоматической синхронизации в минутах'
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    last_sync_at = models.DateTimeField(null=True, blank=True, verbose_name='Последняя синхронизация')
    
    class Meta:
        verbose_name = 'Настройки Notion'
        verbose_name_plural = 'Настройки Notion'
        db_table = 'notion_settings'
    
    def __str__(self):
        return f'Notion настройки для {self.user.username}'
    
    def clean(self):
        """Валидация настроек"""
        # Проверяем, что пользователь установлен
        if not hasattr(self, 'user') or not self.user:
            return
            
        if not self.user.notion_integration_token:
            raise ValidationError('Integration токен Notion не настроен в профиле пользователя')
        
        if not self.database_id:
            raise ValidationError('ID базы данных обязателен')
    
    def get_integration_token(self):
        """Получает integration токен из профиля пользователя"""
        if hasattr(self, 'user') and self.user:
            return self.user.notion_integration_token
        return None
    
    def get_database_description(self):
        """Возвращает описание базы данных"""
        return f"База данных: {self.database_id}"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Получить или создать настройки для пользователя"""
        settings, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'database_id': '',
            }
        )
        return settings


class NotionPage(models.Model):
    """Кэшированные страницы из Notion"""
    
    # Основные поля страницы
    page_id = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='ID страницы',
        help_text='Уникальный ID страницы в Notion'
    )
    
    title = models.CharField(
        max_length=500,
        verbose_name='Название страницы'
    )
    
    content = models.TextField(
        blank=True,
        verbose_name='Содержимое страницы'
    )
    
    comments = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Комментарии к странице'
    )
    
    status = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Статус страницы'
    )
    
    priority = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Приоритет'
    )
    
    # Даты
    date_created = models.DateTimeField(null=True, blank=True, verbose_name='Дата создания')
    date_updated = models.DateTimeField(null=True, blank=True, verbose_name='Дата обновления')
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='Срок выполнения')
    
    # Ссылки и файлы
    url = models.URLField(verbose_name='Ссылка на страницу')
    attachments = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Вложения',
        help_text='Список вложений в формате JSON'
    )
    
    # Дополнительные данные
    assignees = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Исполнители',
        help_text='Список исполнителей в формате JSON'
    )
    
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Теги',
        help_text='Список тегов в формате JSON'
    )
    
    # Дополнительные поля (custom properties)
    custom_properties = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Дополнительные свойства',
        help_text='Дополнительные свойства страницы в формате JSON'
    )
    
    # Метаданные
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='notion_pages'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано в системе')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено в системе')
    
    class Meta:
        verbose_name = 'Страница Notion'
        verbose_name_plural = 'Страницы Notion'
        db_table = 'notion_pages'
        ordering = ['-date_updated']
    
    def __str__(self):
        return f'{self.title} ({self.page_id})'
    
    def get_assignees_display(self):
        """Возвращает список исполнителей для отображения"""
        if not self.assignees:
            return []
        
        try:
            if isinstance(self.assignees, str):
                assignees = json.loads(self.assignees)
            else:
                assignees = self.assignees
            
            result = []
            for assignee in assignees:
                if isinstance(assignee, dict):
                    # Если исполнитель - это словарь, извлекаем имя или email
                    result.append(assignee.get('name', assignee.get('email', 'Неизвестно')))
                else:
                    # Если исполнитель - это строка или другой тип, используем как есть
                    result.append(str(assignee))
            
            return result
        except (json.JSONDecodeError, TypeError):
            return []
    
    def get_tags_display(self):
        """Возвращает список тегов для отображения"""
        if not self.tags:
            return []
        
        try:
            if isinstance(self.tags, str):
                tags = json.loads(self.tags)
            else:
                tags = self.tags
            
            result = []
            for tag in tags:
                if isinstance(tag, dict):
                    # Если тег - это словарь, извлекаем имя
                    result.append(tag.get('name', str(tag)))
                else:
                    # Если тег - это строка или другой тип, используем как есть
                    result.append(str(tag))
            
            return result
        except (json.JSONDecodeError, TypeError):
            return []
    
    def get_comments_display(self):
        """Возвращает список комментариев для отображения"""
        if not self.comments:
            return []
        
        try:
            if isinstance(self.comments, str):
                comments = json.loads(self.comments)
            else:
                comments = self.comments
            
            result = []
            for comment in comments:
                if isinstance(comment, dict):
                    # Если комментарий - это словарь, извлекаем данные
                    result.append({
                        'id': comment.get('id', ''),
                        'text': comment.get('text', ''),
                        'author': comment.get('author', {}).get('name', 'Неизвестно'),
                        'created_time': comment.get('created_time', ''),
                        'rich_text': comment.get('rich_text', [])
                    })
                else:
                    # Если комментарий - это строка или другой тип, создаем базовую структуру
                    result.append({
                        'id': '',
                        'text': str(comment),
                        'author': 'Неизвестно',
                        'created_time': '',
                        'rich_text': []
                    })
            
            return result
        except (json.JSONDecodeError, TypeError):
            return []
    
    def get_attachments_display(self):
        """Возвращает список вложений для отображения"""
        if not self.attachments:
            return []
        
        try:
            if isinstance(self.attachments, str):
                attachments = json.loads(self.attachments)
            else:
                attachments = self.attachments
            
            result = []
            for att in attachments:
                if isinstance(att, dict):
                    # Если вложение - это словарь, извлекаем данные
                    result.append({
                        'name': att.get('name', att.get('title', 'Файл')),
                        'url': att.get('url', ''),
                        'size': att.get('size', 0),
                        'type': att.get('type', 'unknown')
                    })
                else:
                    # Если вложение - это строка или другой тип, создаем базовую структуру
                    result.append({
                        'name': str(att),
                        'url': '',
                        'size': 0,
                        'type': 'unknown'
                    })
            
            return result
        except (json.JSONDecodeError, TypeError):
            return []
    
    def get_custom_properties_display(self):
        """Возвращает дополнительные свойства для отображения (только с заполненными значениями)"""
        if not self.custom_properties:
            return []
        
        try:
            if isinstance(self.custom_properties, str):
                custom_properties = json.loads(self.custom_properties)
            else:
                custom_properties = self.custom_properties
            
            # Преобразуем в список для удобного отображения
            properties_list = []
            for property_id, property_data in custom_properties.items():
                if isinstance(property_data, dict):
                    property_name = property_data.get('name', f'Свойство {property_id}')
                    property_value = property_data.get('value', '')
                    property_type = property_data.get('type', 'text')
                    
                    # Пропускаем свойства без значений
                    if not property_value:
                        continue
                    
                    # Проверяем, что это строка, и она не пустая
                    if isinstance(property_value, str) and property_value.strip() == '':
                        continue
                    
                    # Если это список, проверяем, что он не пустой
                    if isinstance(property_value, list) and len(property_value) == 0:
                        continue
                    
                    properties_list.append({
                        'id': property_id,
                        'name': property_name,
                        'value': property_value,
                        'type': property_type
                    })
                else:
                    # Если данные в простом формате
                    property_value = str(property_data)
                    if property_value and property_value.strip() != '':
                        properties_list.append({
                            'id': property_id,
                            'name': f'Свойство {property_id}',
                            'value': property_value,
                            'type': 'text'
                        })
            
            return properties_list
        except (json.JSONDecodeError, TypeError):
            return []


class NotionSyncLog(models.Model):
    """Лог синхронизации с Notion"""
    
    SYNC_STATUS_CHOICES = [
        ('success', 'Успешно'),
        ('error', 'Ошибка'),
        ('partial', 'Частично'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='notion_sync_logs'
    )
    
    status = models.CharField(
        max_length=20,
        choices=SYNC_STATUS_CHOICES,
        verbose_name='Статус синхронизации'
    )
    
    pages_processed = models.PositiveIntegerField(
        default=0,
        verbose_name='Обработано страниц'
    )
    
    pages_created = models.PositiveIntegerField(
        default=0,
        verbose_name='Создано страниц'
    )
    
    pages_updated = models.PositiveIntegerField(
        default=0,
        verbose_name='Обновлено страниц'
    )
    
    error_message = models.TextField(
        blank=True,
        verbose_name='Сообщение об ошибке'
    )
    
    sync_duration = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Длительность синхронизации (секунды)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Время синхронизации')
    
    class Meta:
        verbose_name = 'Лог синхронизации Notion'
        verbose_name_plural = 'Логи синхронизации Notion'
        db_table = 'notion_sync_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Синхронизация {self.user.username} - {self.get_status_display()} ({self.created_at})'


class NotionBulkImport(models.Model):
    """Модель для отслеживания массового импорта страниц Notion"""
    
    STATUS_CHOICES = [
        ('running', 'Выполняется'),
        ('completed', 'Завершен'),
        ('failed', 'Ошибка'),
        ('cancelled', 'Отменен'),
        ('stopped', 'Остановлен'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='notion_bulk_imports'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='running',
        verbose_name='Статус'
    )
    
    total_pages = models.PositiveIntegerField(
        default=0,
        verbose_name='Всего страниц'
    )
    
    processed_pages = models.PositiveIntegerField(
        default=0,
        verbose_name='Обработано страниц'
    )
    
    successful_pages = models.PositiveIntegerField(
        default=0,
        verbose_name='Успешно импортировано'
    )
    
    failed_pages = models.PositiveIntegerField(
        default=0,
        verbose_name='Неудачных импортов'
    )
    
    failed_page_ids = models.JSONField(
        default=list,
        blank=True,
        verbose_name='ID неудачных страниц',
        help_text='Список ID страниц, которые не удалось импортировать'
    )
    
    error_message = models.TextField(
        blank=True,
        verbose_name='Сообщение об ошибке'
    )
    
    celery_task_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='ID задачи Celery'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершено')
    
    class Meta:
        verbose_name = 'Массовый импорт Notion'
        verbose_name_plural = 'Массовые импорты Notion'
        db_table = 'notion_bulk_imports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Массовый импорт {self.user.username} - {self.get_status_display()}'
    
    @property
    def progress_percentage(self):
        """Возвращает процент выполнения"""
        if self.total_pages == 0:
            return 0
        return round((self.processed_pages / self.total_pages) * 100, 1)
    
    @property
    def success_rate(self):
        """Возвращает процент успешных импортов"""
        if self.processed_pages == 0:
            return 0
        return round((self.successful_pages / self.processed_pages) * 100, 1)