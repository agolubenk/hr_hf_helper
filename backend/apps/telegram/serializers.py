from rest_framework import serializers
from .models import TelegramUser, AuthAttempt


class TelegramUserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователей Telegram"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TelegramUser
        fields = [
            'id', 'user', 'telegram_id', 'username', 'first_name', 'last_name',
            'phone', 'session_name', 'is_authorized', 'full_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']
    
    def get_full_name(self, obj):
        """Возвращает полное имя пользователя Telegram"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        elif obj.username:
            return f"@{obj.username}"
        else:
            return f"User {obj.telegram_id}" if obj.telegram_id else "Unknown User"


class AuthAttemptSerializer(serializers.ModelSerializer):
    """Сериализатор для попыток авторизации Telegram"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuthAttempt
        fields = [
            'id', 'user', 'user_username', 'phone', 'code', 'status',
            'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'user_username']


class TelegramStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики Telegram"""
    total_users = serializers.IntegerField()
    authorized_users = serializers.IntegerField()
    unauthorized_users = serializers.IntegerField()
    total_attempts = serializers.IntegerField()
    successful_attempts = serializers.IntegerField()
    failed_attempts = serializers.IntegerField()
    recent_users = TelegramUserSerializer(many=True)
    recent_attempts = AuthAttemptSerializer(many=True)
