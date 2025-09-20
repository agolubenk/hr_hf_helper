from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport
from .serializers import (
    NotionSettingsSerializer, NotionPageSerializer, 
    NotionSyncLogSerializer, NotionBulkImportSerializer,
    NotionBulkImportCreateSerializer, NotionStatsSerializer,
    NotionApiRequestSerializer
)
from .services import NotionService
from .tasks import bulk_import_notion_pages, retry_failed_pages

User = get_user_model()


class NotionSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для управления настройками Notion"""
    
    serializer_class = NotionSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return NotionSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = NotionSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        """Тестировать подключение к Notion"""
        try:
            notion_service = NotionService(request.user)
            result = notion_service.test_connection()
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        """Синхронизация данных Notion"""
        try:
            notion_service = NotionService(request.user)
            result = notion_service.sync_pages()
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class NotionPageViewSet(viewsets.ModelViewSet):
    """ViewSet для управления страницами Notion"""
    
    serializer_class = NotionPageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority']
    search_fields = ['title', 'content']
    ordering_fields = ['date_created', 'date_updated', 'due_date']
    ordering = ['-date_updated']
    
    def get_queryset(self):
        return NotionPage.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def sync_page(self, request, pk=None):
        """Синхронизировать конкретную страницу"""
        page = self.get_object()
        try:
            notion_service = NotionService(request.user)
            result = notion_service.sync_single_page(page.page_id)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Получить страницы по статусу"""
        status = request.query_params.get('status')
        if status:
            pages = self.get_queryset().filter(status=status)
        else:
            pages = self.get_queryset()
        
        serializer = self.get_serializer(pages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_pages(self, request):
        """Получить страницы текущего пользователя"""
        pages = self.get_queryset().order_by('-date_updated')
        serializer = self.get_serializer(pages, many=True)
        return Response(serializer.data)


class NotionSyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для просмотра логов синхронизации Notion"""
    
    serializer_class = NotionSyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return NotionSyncLog.objects.filter(user=self.request.user)


class NotionBulkImportViewSet(viewsets.ModelViewSet):
    """ViewSet для управления массовым импортом Notion"""
    
    serializer_class = NotionBulkImportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return NotionBulkImport.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return NotionBulkImportCreateSerializer
        return NotionBulkImportSerializer
    
    def perform_create(self, serializer):
        import_params = serializer.validated_data
        bulk_import = serializer.save(user=self.request.user)
        
        # Запускаем Celery задачу
        task = bulk_import_notion_pages.delay(
            bulk_import.id,
            sync_settings=import_params.get('sync_settings', True),
            delay_between_pages=import_params.get('delay_between_pages', 8),
            max_pages=import_params.get('max_pages', 100)
        )
        
        bulk_import.celery_task_id = task.id
        bulk_import.save()
    
    @action(detail=True, methods=['post'])
    def retry_failed(self, request, pk=None):
        """Повторить импорт неудачных страниц"""
        bulk_import = self.get_object()
        if not bulk_import.failed_page_ids:
            return Response(
                {'error': 'No failed pages to retry'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Запускаем задачу повторного импорта
            task = retry_failed_pages.delay(bulk_import.id)
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
            'processed_pages': bulk_import.processed_pages,
            'total_pages': bulk_import.total_pages,
            'successful_pages': bulk_import.successful_pages,
            'failed_pages': bulk_import.failed_pages,
        })


class NotionApiViewSet(viewsets.ViewSet):
    """ViewSet для работы с Notion API"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def make_request(self, request):
        """Выполнить произвольный запрос к Notion API"""
        serializer = NotionApiRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                notion_service = NotionService(request.user)
                result = notion_service.make_api_request(
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
        """Получить статистику Notion интеграции"""
        try:
            pages = NotionPage.objects.filter(user=request.user)
            total_pages = pages.count()
            
            # Статистика по статусам
            pages_by_status = {}
            for status_choice in NotionPage.STATUS_CHOICES:
                status_code = status_choice[0]
                count = pages.filter(status=status_code).count()
                pages_by_status[status_code] = count
            
            # Статистика по пользователям
            pages_by_user = {}
            for page in pages:
                for assignee in page.get_assignees_display():
                    if assignee not in pages_by_user:
                        pages_by_user[assignee] = 0
                    pages_by_user[assignee] += 1
            
            # Последние логи синхронизации
            recent_sync_logs = NotionSyncLog.objects.filter(
                user=request.user
            ).order_by('-created_at')[:5]
            
            # Активные массовые импорты
            active_bulk_imports = NotionBulkImport.objects.filter(
                user=request.user,
                status__in=['pending', 'running']
            )
            
            # Количество настроек
            sync_settings_count = NotionSettings.objects.filter(user=request.user).count()
            
            stats = {
                'total_pages': total_pages,
                'pages_by_status': pages_by_status,
                'pages_by_user': pages_by_user,
                'recent_sync_logs': NotionSyncLogSerializer(recent_sync_logs, many=True).data,
                'active_bulk_imports': NotionBulkImportSerializer(active_bulk_imports, many=True).data,
                'sync_settings_count': sync_settings_count,
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
