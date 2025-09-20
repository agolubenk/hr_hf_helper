from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User as DjangoUser
from .models import User

class TestUserViewSet(viewsets.ReadOnlyModelViewSet):
    """Простой тестовый ViewSet"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def list(self, request):
        """Список пользователей"""
        users = User.objects.all()[:5]  # Берем только первые 5
        data = []
        for user in users:
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
            })
        return Response(data)
