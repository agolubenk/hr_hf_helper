from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import HuntflowCache, HuntflowLog
from .serializers import (
    HuntflowCacheSerializer, HuntflowLogSerializer, HuntflowLogCreateSerializer,
    HuntflowStatsSerializer, HuntflowApiRequestSerializer
)


class HuntflowCacheViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра кэша Huntflow"""
    queryset = HuntflowCache.objects.all()
    serializer_class = HuntflowCacheSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['cache_key']
    search_fields = ['cache_key']
    ordering_fields = ['created_at', 'updated_at', 'expires_at']
    ordering = ['-updated_at']
    
    @action(detail=False, methods=['post'], url_path='clear-cache')
    def clear_cache(self, request):
        """Очистка кэша"""
        try:
            HuntflowCache.objects.all().delete()
            return Response({'message': 'Кэш успешно очищен'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='expired')
    def expired(self, request):
        """Получение истекших записей кэша"""
        expired_cache = self.get_queryset().filter(
            expires_at__isnull=False,
            expires_at__lt=timezone.now()
        )
        serializer = HuntflowCacheSerializer(expired_cache, many=True)
        return Response(serializer.data)


class HuntflowLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра логов Huntflow"""
    queryset = HuntflowLog.objects.all()
    serializer_class = HuntflowLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['log_type', 'method', 'status_code', 'user']
    search_fields = ['endpoint', 'error_message']
    ordering_fields = ['created_at', 'status_code']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'], url_path='create-log')
    def create_log(self, request):
        """Создание лога"""
        serializer = HuntflowLogCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='errors')
    def errors(self, request):
        """Получение только логов с ошибками"""
        error_logs = self.get_queryset().filter(
            Q(log_type='ERROR') | Q(status_code__gte=400)
        )
        serializer = HuntflowLogSerializer(error_logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Статистика по логам"""
        total_logs = HuntflowLog.objects.count()
        success_logs = HuntflowLog.objects.filter(
            status_code__gte=200, status_code__lt=300
        ).count()
        error_logs = HuntflowLog.objects.filter(
            Q(log_type='ERROR') | Q(status_code__gte=400)
        ).count()
        
        # Статистика по типам
        type_stats = HuntflowLog.objects.values('log_type').annotate(
            count=Count('id')
        )
        
        # Статистика по пользователям
        user_stats = HuntflowLog.objects.values('user__username').annotate(
            count=Count('id')
        )
        
        # Последние логи
        recent_logs = HuntflowLog.objects.order_by('-created_at')[:10]
        recent_serializer = HuntflowLogSerializer(recent_logs, many=True)
        
        return Response({
            'total_logs': total_logs,
            'success_logs': success_logs,
            'error_logs': error_logs,
            'logs_by_type': {item['log_type']: item['count'] for item in type_stats},
            'logs_by_user': {item['user__username']: item['count'] for item in user_stats},
            'recent_logs': recent_serializer.data,
            'cache_stats': {
                'total_cache_entries': HuntflowCache.objects.count(),
                'expired_cache_entries': HuntflowCache.objects.filter(
                    expires_at__isnull=False,
                    expires_at__lt=timezone.now()
                ).count()
            }
        })


class HuntflowApiViewSet(viewsets.ViewSet):
    """ViewSet для API запросов Huntflow"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'], url_path='request')
    def request(self, request):
        """Выполнение API запроса к Huntflow"""
        serializer = HuntflowApiRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Здесь должна быть логика для выполнения запроса к Huntflow API
            # Пока возвращаем заглушку
            return Response({
                'message': 'API запрос к Huntflow выполнен',
                'request_data': serializer.validated_data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
