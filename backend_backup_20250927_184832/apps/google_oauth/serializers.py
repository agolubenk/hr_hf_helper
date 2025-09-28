from rest_framework import serializers
from .models import (
    GoogleOAuthAccount, SyncSettings, ScorecardPathSettings, 
    SlotsSettings, Invite, HRScreening, QuestionTemplate
)
from apps.accounts.models import User


class GoogleOAuthAccountSerializer(serializers.ModelSerializer):
    """Сериализатор для Google OAuth аккаунтов"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    is_token_valid = serializers.SerializerMethodField()

    class Meta:
        model = GoogleOAuthAccount
        fields = [
            'id', 'user', 'user_username', 'google_id', 'email', 'name',
            'picture_url', 'scopes', 'is_token_valid', 'created_at',
            'updated_at', 'last_sync_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_token_valid']
        extra_kwargs = {
            'access_token': {'write_only': True},
            'refresh_token': {'write_only': True},
            'token_expires_at': {'write_only': True},
        }

    def get_is_token_valid(self, obj):
        """Проверяет, действителен ли токен"""
        return obj.is_token_valid()


class SyncSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для настроек синхронизации"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SyncSettings
        fields = [
            'id', 'user', 'user_username', 'auto_sync_calendar', 'auto_sync_drive',
            'sync_interval', 'max_events', 'max_files', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ScorecardPathSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для настроек структуры папок scorecard"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    path_preview = serializers.SerializerMethodField()

    class Meta:
        model = ScorecardPathSettings
        fields = [
            'id', 'user', 'user_username', 'folder_structure', 'path_preview',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'path_preview']

    def get_path_preview(self, obj):
        """Возвращает предварительный просмотр пути"""
        return obj.generate_path_preview()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SlotsSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для настроек слотов календаря"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SlotsSettings
        fields = [
            'id', 'user', 'user_username', 'current_week_prefix', 'next_week_prefix',
            'all_slots_prefix', 'separator_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InviteSerializer(serializers.ModelSerializer):
    """Сериализатор для инвайтов на интервью"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Invite
        fields = [
            'id', 'user', 'user_username', 'candidate_url', 'candidate_name',
            'vacancy_title', 'interview_datetime', 'status',
            'google_calendar_event_id', 'google_calendar_event_url',
            'google_meet_url', 'google_drive_folder_id', 'google_drive_file_id',
            'google_drive_file_url', 'gemini_suggested_datetime',
            'original_form_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HRScreeningSerializer(serializers.ModelSerializer):
    """Сериализатор для HR-скринингов"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = HRScreening
        fields = [
            'id', 'user', 'user_username', 'candidate_name', 'vacancy_name',
            'resume_text', 'gemini_analysis', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuestionTemplateSerializer(serializers.ModelSerializer):
    """Сериализатор для шаблонов вопросов"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = QuestionTemplate
        fields = [
            'id', 'user', 'user_username', 'name', 'questions', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoogleOAuthCallbackSerializer(serializers.Serializer):
    """Сериализатор для callback Google OAuth"""
    authorization_response = serializers.CharField(required=True)
    state = serializers.CharField(required=False)


class GoogleSyncRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса синхронизации Google сервисов"""
    service = serializers.ChoiceField(
        choices=['calendar', 'drive', 'sheets'],
        required=True
    )


class GoogleCalendarEventSerializer(serializers.Serializer):
    """Сериализатор для событий Google Calendar (временный)"""
    id = serializers.CharField()
    summary = serializers.CharField()
    start = serializers.DictField()
    end = serializers.DictField()
    description = serializers.CharField(required=False)
    location = serializers.CharField(required=False)
    attendees = serializers.ListField(required=False)


class GoogleDriveFileSerializer(serializers.Serializer):
    """Сериализатор для файлов Google Drive (временный)"""
    id = serializers.CharField()
    name = serializers.CharField()
    mimeType = serializers.CharField()
    size = serializers.CharField(required=False)
    createdTime = serializers.CharField()
    modifiedTime = serializers.CharField()
    webViewLink = serializers.CharField(required=False)


class GoogleSheetSerializer(serializers.Serializer):
    """Сериализатор для Google Sheets (временный)"""
    id = serializers.CharField()
    name = serializers.CharField()
    createdTime = serializers.CharField()
    modifiedTime = serializers.CharField()
    webViewLink = serializers.CharField(required=False)


class GoogleStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики Google интеграции"""
    oauth_accounts = serializers.IntegerField()
    invites = serializers.IntegerField()
    hr_screenings = serializers.IntegerField()
    question_templates = serializers.IntegerField()