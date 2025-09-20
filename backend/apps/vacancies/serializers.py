from rest_framework import serializers
from .models import Vacancy
from apps.finance.models import Grade


class VacancySerializer(serializers.ModelSerializer):
    """Сериализатор для вакансий"""
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    recruiter_username = serializers.CharField(source='recruiter.username', read_only=True)
    available_grades_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'name', 'external_id', 'recruiter', 'recruiter_name', 'recruiter_username',
            'invite_title', 'invite_text', 'scorecard_title', 'scorecard_text',
            'available_grades', 'available_grades_names', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'recruiter_name', 'recruiter_username', 'available_grades_names']
    
    def get_available_grades_names(self, obj):
        """Возвращает список названий доступных грейдов"""
        return [grade.name for grade in obj.available_grades.all()]
    
    def validate_external_id(self, value):
        """Валидация уникальности external_id"""
        if Vacancy.objects.filter(external_id=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Вакансия с таким внешним ID уже существует")
        return value


class VacancyCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания вакансии"""
    
    class Meta:
        model = Vacancy
        fields = [
            'name', 'external_id', 'recruiter', 'invite_title', 'invite_text',
            'scorecard_title', 'scorecard_text', 'available_grades', 'is_active'
        ]
    
    def validate_external_id(self, value):
        """Валидация уникальности external_id"""
        if Vacancy.objects.filter(external_id=value).exists():
            raise serializers.ValidationError("Вакансия с таким внешним ID уже существует")
        return value


class VacancyListSerializer(serializers.ModelSerializer):
    """Упрощенный сериализатор для списка вакансий"""
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    available_grades_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'name', 'external_id', 'recruiter_name',
            'available_grades_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_available_grades_count(self, obj):
        """Возвращает количество доступных грейдов"""
        return obj.available_grades.count()


class VacancyStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики вакансий"""
    total_vacancies = serializers.IntegerField()
    active_vacancies = serializers.IntegerField()
    inactive_vacancies = serializers.IntegerField()
    vacancies_by_recruiter = serializers.DictField()
    vacancies_by_grade = serializers.DictField()
    recent_vacancies = VacancyListSerializer(many=True)
