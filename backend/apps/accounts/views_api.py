from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import Group
from django.contrib.auth import authenticate, login
from django.db.models import Q
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, UserProfileSerializer,
    UserChangePasswordSerializer, UserSettingsSerializer, GroupSerializer
)


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
        
        try:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)
            return Response({'message': 'Группы успешно назначены'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика пользователей"""
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        
        # Статистика по группам
        groups_stats = {}
        for group in Group.objects.all():
            groups_stats[group.name] = User.objects.filter(groups=group).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'staff_users': staff_users,
            'groups_stats': groups_stats
        })


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра групп пользователей"""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.http import JsonResponse
import json

@csrf_exempt
def api_login(request):
    """API endpoint для входа в систему"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный JSON'}, status=400)
    
    if not username or not password:
        return JsonResponse(
            {'error': 'Имя пользователя и пароль обязательны'}, 
            status=400
        )
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.is_active:
            login(request, user)
            serializer = UserSerializer(user)
            return JsonResponse({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': serializer.data
            }, status=200)
        else:
            return JsonResponse(
                {'error': 'Аккаунт деактивирован'}, 
                status=400
            )
    else:
        return JsonResponse(
            {'error': 'Неверное имя пользователя или пароль'}, 
            status=401
        )


@csrf_exempt
def api_logout(request):
    """API endpoint для выхода из системы"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Пользователь не авторизован'}, status=401)
    
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Выход выполнен успешно'
    }, status=200)
