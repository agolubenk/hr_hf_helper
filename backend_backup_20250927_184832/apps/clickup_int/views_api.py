from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import ClickUpSettings, ClickUpTask, ClickUpSyncLog, ClickUpBulkImport
from .serializers import (
    ClickUpSettingsSerializer, ClickUpTaskSerializer, 
    ClickUpSyncLogSerializer, ClickUpBulkImportSerializer,
    ClickUpBulkImportCreateSerializer, ClickUpStatsSerializer,
    ClickUpApiRequestSerializer
)
from .services import ClickUpService
from .tasks import bulk_import_clickup_tasks, retry_failed_tasks

User = get_user_model()


class ClickUpSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для управления настройками ClickUp"""
    
    serializer_class = ClickUpSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ClickUpSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = ClickUpSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        """Тестировать подключение к ClickUp"""
        try:
            clickup_service = ClickUpService(request.user)
            result = clickup_service.test_connection()
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        """Синхронизация данных ClickUp"""
        try:
            clickup_service = ClickUpService(request.user)
            result = clickup_service.sync_tasks()
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ClickUpTaskViewSet(viewsets.ModelViewSet):
    """ViewSet для управления задачами ClickUp"""
    
    serializer_class = ClickUpTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority']
    search_fields = ['name', 'description']
    ordering_fields = ['date_created', 'date_updated', 'due_date']
    ordering = ['-date_updated']
    
    def get_queryset(self):
        return ClickUpTask.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def sync_task(self, request, pk=None):
        """Синхронизировать конкретную задачу"""
        task = self.get_object()
        try:
            clickup_service = ClickUpService(request.user)
            result = clickup_service.sync_single_task(task.task_id)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Получить задачи по статусу"""
        status = request.query_params.get('status')
        if status:
            tasks = self.get_queryset().filter(status=status)
        else:
            tasks = self.get_queryset()
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Получить задачи текущего пользователя"""
        tasks = self.get_queryset().order_by('-date_updated')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


class ClickUpSyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра логов синхронизации ClickUp"""
    
    serializer_class = ClickUpSyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ClickUpSyncLog.objects.filter(user=self.request.user)


class ClickUpBulkImportViewSet(viewsets.ModelViewSet):
    """ViewSet для управления массовым импортом ClickUp"""
    
    serializer_class = ClickUpBulkImportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ClickUpBulkImport.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClickUpBulkImportCreateSerializer
        return ClickUpBulkImportSerializer
    
    def perform_create(self, serializer):
        import_params = serializer.validated_data
        bulk_import = serializer.save(user=self.request.user)
        
        # Запускаем Celery задачу
        task = bulk_import_clickup_tasks.delay(
            bulk_import.id,
            sync_settings=import_params.get('sync_settings', True),
            delay_between_tasks=import_params.get('delay_between_tasks', 8),
            max_tasks=import_params.get('max_tasks', 100)
        )
        
        bulk_import.celery_task_id = task.id
        bulk_import.save()
    
    @action(detail=True, methods=['post'])
    def retry_failed(self, request, pk=None):
        """Повторить импорт неудачных задач"""
        bulk_import = self.get_object()
        if not bulk_import.failed_task_ids:
            return Response(
                {'error': 'No failed tasks to retry'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Запускаем задачу повторного импорта
            task = retry_failed_tasks.delay(bulk_import.id)
            bulk_import.celery_task_id = task.id
            bulk_import.save()
            
            return Response({'status': 'retry_started'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Получить прогресс импорта"""
        bulk_import = self.get_object()
        return Response({
            'progress_percentage': bulk_import.progress_percentage,
            'success_rate': bulk_import.success_rate,
            'status': bulk_import.status,
            'processed_tasks': bulk_import.processed_tasks,
            'total_tasks': bulk_import.total_tasks,
            'successful_tasks': bulk_import.successful_tasks,
            'failed_tasks': bulk_import.failed_tasks,
        })


class ClickUpApiViewSet(viewsets.ViewSet):
    """ViewSet для работы с ClickUp API"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def make_request(self, request):
        """Выполнить произвольный запрос к ClickUp API"""
        serializer = ClickUpApiRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                clickup_service = ClickUpService(request.user)
                result = clickup_service.make_api_request(
                    endpoint=serializer.validated_data['endpoint'],
                    method=serializer.validated_data['method'],
                    data=serializer.validated_data.get('data', {}),
                    params=serializer.validated_data.get('params', {}),
                    use_cache=serializer.validated_data.get('use_cache', True),
                    cache_timeout=serializer.validated_data.get('cache_timeout', 300)
                )
                return Response(result)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Получить статистику ClickUp интеграции"""
        try:
            tasks = ClickUpTask.objects.filter(user=request.user)
            total_tasks = tasks.count()
            
            # Статистика по статусам
            tasks_by_status = {}
            for status_choice in ClickUpTask.STATUS_CHOICES:
                status_code = status_choice[0]
                count = tasks.filter(status=status_code).count()
                tasks_by_status[status_code] = count
            
            # Статистика по пользователям
            tasks_by_user = {}
            for task in tasks:
                for assignee in task.get_assignees_display():
                    if assignee not in tasks_by_user:
                        tasks_by_user[assignee] = 0
                    tasks_by_user[assignee] += 1
            
            # Последние логи синхронизации
            recent_sync_logs = ClickUpSyncLog.objects.filter(
                user=request.user
            ).order_by('-created_at')[:5]
            
            # Активные массовые импорты
            active_bulk_imports = ClickUpBulkImport.objects.filter(
                user=request.user,
                status__in=['pending', 'running']
            )
            
            # Количество настроек
            sync_settings_count = ClickUpSettings.objects.filter(user=request.user).count()
            
            stats = {
                'total_tasks': total_tasks,
                'tasks_by_status': tasks_by_status,
                'tasks_by_user': tasks_by_user,
                'recent_sync_logs': ClickUpSyncLogSerializer(recent_sync_logs, many=True).data,
                'active_bulk_imports': ClickUpBulkImportSerializer(active_bulk_imports, many=True).data,
                'sync_settings_count': sync_settings_count,
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
