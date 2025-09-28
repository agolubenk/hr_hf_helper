from rest_framework import serializers
from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport
from apps.accounts.models import User


class NotionSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для настроек Notion"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    database_description = serializers.SerializerMethodField()
    
    class Meta:
        model = NotionSettings
        fields = [
            'id', 'user', 'user_username', 'database_id', 'auto_sync',
            'sync_interval', 'database_description', 'created_at',
            'updated_at', 'last_sync_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'database_description']
    
    def get_database_description(self, obj):
        """Возвращает описание базы данных"""
        return obj.get_database_description()


class NotionPageSerializer(serializers.ModelSerializer):
    """Сериализатор для страниц Notion"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    assignees_display = serializers.SerializerMethodField()
    tags_display = serializers.SerializerMethodField()
    comments_display = serializers.SerializerMethodField()
    attachments_display = serializers.SerializerMethodField()
    custom_properties_display = serializers.SerializerMethodField()
    
    class Meta:
        model = NotionPage
        fields = [
            'id', 'page_id', 'title', 'content', 'comments', 'comments_display',
            'status', 'priority', 'date_created', 'date_updated', 'due_date',
            'url', 'assignees', 'assignees_display', 'tags', 'tags_display',
            'attachments', 'attachments_display', 'custom_properties',
            'custom_properties_display', 'user', 'user_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'assignees_display', 'tags_display', 'comments_display', 'attachments_display', 'custom_properties_display']
    
    def get_assignees_display(self, obj):
        """Возвращает список исполнителей для отображения"""
        return obj.get_assignees_display()
    
    def get_tags_display(self, obj):
        """Возвращает список тегов для отображения"""
        return obj.get_tags_display()
    
    def get_comments_display(self, obj):
        """Возвращает список комментариев для отображения"""
        return obj.get_comments_display()
    
    def get_attachments_display(self, obj):
        """Возвращает список вложений для отображения"""
        return obj.get_attachments_display()
    
    def get_custom_properties_display(self, obj):
        """Возвращает дополнительные свойства для отображения"""
        return obj.get_custom_properties_display()


class NotionSyncLogSerializer(serializers.ModelSerializer):
    """Сериализатор для логов синхронизации Notion"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = NotionSyncLog
        fields = [
            'id', 'user', 'user_username', 'status', 'pages_processed',
            'pages_created', 'pages_updated', 'error_message',
            'sync_duration', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotionBulkImportSerializer(serializers.ModelSerializer):
    """Сериализатор для массового импорта Notion"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = NotionBulkImport
        fields = [
            'id', 'user', 'user_username', 'status', 'total_pages',
            'processed_pages', 'successful_pages', 'failed_pages',
            'failed_page_ids', 'error_message', 'celery_task_id',
            'progress_percentage', 'success_rate', 'created_at',
            'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at', 'progress_percentage', 'success_rate']


class NotionBulkImportCreateSerializer(serializers.Serializer):
    """Сериализатор для создания массового импорта Notion"""
    sync_settings = serializers.BooleanField(default=True, help_text="Синхронизировать настройки перед импортом")
    delay_between_pages = serializers.IntegerField(default=5, min_value=1, max_value=30, help_text="Задержка между страницами в секундах")
    max_pages = serializers.IntegerField(default=100, min_value=1, max_value=500, help_text="Максимальное количество страниц для импорта")
    
    def validate(self, attrs):
        """Валидация параметров импорта"""
        if attrs['delay_between_pages'] < 1:
            raise serializers.ValidationError("Задержка между страницами должна быть не менее 1 секунды")
        
        if attrs['max_pages'] < 1:
            raise serializers.ValidationError("Максимальное количество страниц должно быть не менее 1")
        
        return attrs


class NotionStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики Notion"""
    total_pages = serializers.IntegerField()
    pages_by_status = serializers.DictField()
    pages_by_user = serializers.DictField()
    recent_sync_logs = NotionSyncLogSerializer(many=True)
    active_bulk_imports = NotionBulkImportSerializer(many=True)
    sync_settings_count = serializers.IntegerField()


class NotionApiRequestSerializer(serializers.Serializer):
    """Сериализатор для API запросов Notion"""
    endpoint = serializers.CharField(max_length=500)
    method = serializers.ChoiceField(choices=['GET', 'POST', 'PATCH', 'DELETE'])
    data = serializers.JSONField(required=False, default=dict)
    params = serializers.JSONField(required=False, default=dict)
    use_cache = serializers.BooleanField(default=True)
    cache_timeout = serializers.IntegerField(default=300, min_value=0)
