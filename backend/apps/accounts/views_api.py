from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import Group
from .models import User
from .logic.serializers import (
    UserSerializer, UserCreateSerializer, UserProfileSerializer,
    UserChangePasswordSerializer, UserSettingsSerializer, GroupSerializer,
    UserStatsSerializer
)
from .logic.user_service import UserService


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для управления пользователями"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'full_name']
    ordering_fields = ['username', 'email', 'date_joined', 'last_login']
    ordering = ['username']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['profile', 'update_profile']:
            return UserProfileSerializer
        elif self.action == 'change_password':
            return UserChangePasswordSerializer
        elif self.action == 'settings':
            return UserSettingsSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Фильтрация queryset в зависимости от прав пользователя"""
        user = self.request.user
        queryset = super().get_queryset()
        
        # Если пользователь не админ, показываем только себя
        if not user.is_superuser and not user.is_staff:
            queryset = queryset.filter(pk=user.pk)
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='profile')
    def profile(self, request):
        """Получение профиля текущего пользователя"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], url_path='profile')
    def update_profile(self, request):
        """Обновление профиля текущего пользователя"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """Смена пароля текущего пользователя"""
        serializer = UserChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Пароль успешно изменен'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='settings')
    def settings(self, request):
        """Получение настроек текущего пользователя"""
        serializer = UserSettingsSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], url_path='settings')
    def update_settings(self, request):
        """Обновление настроек текущего пользователя"""
        serializer = UserSettingsSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='assign-groups')
    def assign_groups(self, request, pk=None):
        """Назначение групп пользователю"""
        user = self.get_object()
        group_ids = request.data.get('group_ids', [])
        
        # Используем сервисный слой для назначения групп
        success, message = UserService.assign_groups_to_user(user, group_ids)
        
        if success:
            return Response({'message': message})
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика пользователей"""
        # Используем сервисный слой для получения статистики
        stats_data = UserService.get_user_stats()
        return Response(stats_data)


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра групп пользователей"""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


# Дублированные функции api_login и api_logout удалены
# Теперь используются универсальные функции из views.py:
# - unified_api_view + login_api_handler
# - unified_api_view + logout_api_handler
