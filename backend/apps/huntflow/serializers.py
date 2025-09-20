from rest_framework import serializers
from .models import HuntflowCache, HuntflowLog
from apps.accounts.models import User


class HuntflowCacheSerializer(serializers.ModelSerializer):
    """Сериализатор для кэша Huntflow"""
    is_expired = serializers.ReadOnlyField()
    age_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = HuntflowCache
        fields = [
            'id', 'cache_key', 'data', 'created_at', 'updated_at',
            'expires_at', 'is_expired', 'age_minutes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired', 'age_minutes']


class HuntflowLogSerializer(serializers.ModelSerializer):
    """Сериализатор для логов Huntflow"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    is_success = serializers.ReadOnlyField()
    is_error = serializers.ReadOnlyField()
    
    class Meta:
        model = HuntflowLog
        fields = [
            'id', 'log_type', 'endpoint', 'method', 'status_code',
            'request_data', 'response_data', 'error_message',
            'user', 'user_username', 'created_at', 'is_success', 'is_error'
        ]
        read_only_fields = ['id', 'created_at', 'is_success', 'is_error']


class HuntflowLogCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания логов Huntflow"""
    
    class Meta:
        model = HuntflowLog
        fields = [
            'log_type', 'endpoint', 'method', 'status_code',
            'request_data', 'response_data', 'error_message'
        ]


class HuntflowStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики Huntflow"""
    total_logs = serializers.IntegerField()
    success_logs = serializers.IntegerField()
    error_logs = serializers.IntegerField()
    logs_by_type = serializers.DictField()
    logs_by_user = serializers.DictField()
    recent_logs = HuntflowLogSerializer(many=True)
    cache_stats = serializers.DictField()


class HuntflowApiRequestSerializer(serializers.Serializer):
    """Сериализатор для API запросов Huntflow"""
    endpoint = serializers.CharField(max_length=500)
    method = serializers.ChoiceField(choices=['GET', 'POST', 'PATCH', 'DELETE'])
    data = serializers.JSONField(required=False, default=dict)
    params = serializers.JSONField(required=False, default=dict)
    use_cache = serializers.BooleanField(default=True)
    cache_timeout = serializers.IntegerField(default=300, min_value=0)
