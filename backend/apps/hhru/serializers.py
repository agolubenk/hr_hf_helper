"""
Сериализаторы для HeadHunter.ru API

ВХОДЯЩИЕ ДАННЫЕ: Модели HHRUAccount, HHRUConfiguration, HHRUAPILog
ИСТОЧНИКИ ДАННЫХ: Django модели
ОБРАБОТКА: Сериализация данных для API
ВЫХОДЯЩИЕ ДАННЫЕ: JSON объекты для DRF API
СВЯЗИ: Модели из apps.hhru.models
ФОРМАТ: DRF сериализаторы
"""
from rest_framework import serializers
from .models import HHRUAccount, HHRUConfiguration, HHRUAPILog


class HHRUAccountSerializer(serializers.ModelSerializer):
    """
    Сериализатор для HH.ru аккаунта
    
    ВХОДЯЩИЕ ДАННЫЕ: HHRUAccount модель
    ИСТОЧНИКИ ДАННЫХ: apps.hhru.models.HHRUAccount
    ОБРАБОТКА: Сериализация данных аккаунта (без токенов для безопасности)
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON объект с данными аккаунта
    СВЯЗИ: HHRUAccount модель
    ФОРМАТ: DRF сериализатор
    """
    is_token_valid = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = HHRUAccount
        fields = [
            'id', 'user', 'user_username',
            'hh_user_id', 'email', 'first_name', 'last_name', 'middle_name',
            'is_employer', 'is_admin', 'profile_data',
            'created_at', 'updated_at', 'last_sync_at',
            'is_token_valid'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'last_sync_at',
            'is_token_valid', 'user_username'
        ]


class HHRUAccountDetailSerializer(serializers.ModelSerializer):
    """
    Детальный сериализатор для HH.ru аккаунта (включает токены для администратора)
    
    ВХОДЯЩИЕ ДАННЫЕ: HHRUAccount модель
    ИСТОЧНИКИ ДАННЫХ: apps.hhru.models.HHRUAccount
    ОБРАБОТКА: Сериализация всех данных аккаунта включая токены
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON объект с полными данными аккаунта
    СВЯЗИ: HHRUAccount модель
    ФОРМАТ: DRF сериализатор
    """
    is_token_valid = serializers.ReadOnlyField()
    needs_refresh = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = HHRUAccount
        fields = [
            'id', 'user', 'user_username',
            'access_token', 'refresh_token', 'token_expires_at',
            'hh_user_id', 'email', 'first_name', 'last_name', 'middle_name',
            'is_employer', 'is_admin', 'profile_data',
            'created_at', 'updated_at', 'last_sync_at',
            'is_token_valid', 'needs_refresh'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'last_sync_at',
            'is_token_valid', 'needs_refresh', 'user_username'
        ]


class HHRUConfigurationSerializer(serializers.ModelSerializer):
    """
    Сериализатор для конфигурации HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: HHRUConfiguration модель
    ИСТОЧНИКИ ДАННЫХ: apps.hhru.models.HHRUConfiguration
    ОБРАБОТКА: Сериализация настроек OAuth
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON объект с настройками
    СВЯЗИ: HHRUConfiguration модель
    ФОРМАТ: DRF сериализатор
    """
    user_username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = HHRUConfiguration
        fields = [
            'id', 'name', 'client_id', 'client_secret', 'redirect_uri',
            'user', 'user_username', 'is_active', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_username']
    
    def validate(self, data):
        """Валидация данных конфигурации"""
        # Если это конфигурация по умолчанию, снимаем флаг с других
        if data.get('is_default', False):
            HHRUConfiguration.objects.filter(
                user=data.get('user'),
                is_default=True
            ).exclude(id=self.instance.id if self.instance else None).update(is_default=False)
        
        return data


class HHRUAPILogSerializer(serializers.ModelSerializer):
    """
    Сериализатор для логов HH.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: HHRUAPILog модель
    ИСТОЧНИКИ ДАННЫХ: apps.hhru.models.HHRUAPILog
    ОБРАБОТКА: Сериализация логов запросов
    ВЫХОДЯЩИЕ ДАННЫЕ: JSON объект с данными лога
    СВЯЗИ: HHRUAPILog модель
    ФОРМАТ: DRF сериализатор
    """
    is_success = serializers.ReadOnlyField()
    is_error = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = HHRUAPILog
        fields = [
            'id', 'log_type', 'endpoint', 'method', 'status_code',
            'request_data', 'response_data', 'error_message',
            'user', 'user_username', 'account', 'created_at',
            'is_success', 'is_error'
        ]
        read_only_fields = [
            'id', 'created_at', 'is_success', 'is_error', 'user_username'
        ]


class HHRUOAuthCallbackSerializer(serializers.Serializer):
    """
    Сериализатор для OAuth callback
    
    ВХОДЯЩИЕ ДАННЫЕ: authorization_code, state, error
    ИСТОЧНИКИ ДАННЫХ: HeadHunter.ru OAuth callback
    ОБРАБОТКА: Валидация данных callback
    ВЫХОДЯЩИЕ ДАННЫЕ: Валидированные данные callback
    СВЯЗИ: HHRUOAuthService
    ФОРМАТ: DRF сериализатор
    """
    code = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    error = serializers.CharField(required=False, allow_blank=True)
    error_description = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Валидация данных callback"""
        if data.get('error'):
            raise serializers.ValidationError(
                data.get('error_description', data.get('error'))
            )
        
        if not data.get('code'):
            raise serializers.ValidationError('Код авторизации не получен')
        
        return data


class HHRUTestConnectionSerializer(serializers.Serializer):
    """
    Сериализатор для тестирования подключения
    
    ВХОДЯЩИЕ ДАННЫЕ: Нет (использует текущего пользователя)
    ИСТОЧНИКИ ДАННЫХ: HHRUService.test_connection()
    ОБРАБОТКА: Тестирование подключения к HH.ru API
    ВЫХОДЯЩИЕ ДАННЫЕ: Результат тестирования
    СВЯЗИ: HHRUService
    ФОРМАТ: DRF сериализатор
    """
    success = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)

