from django.urls import path
from . import views

app_name = 'clickup_int'

urlpatterns = [
    # Основные страницы
    path('', views.dashboard, name='dashboard'),
    path('settings/', views.settings_view, name='settings'),
    path('tasks/', views.tasks_list, name='tasks_list'),
    path('task/<str:task_id>/', views.task_detail, name='task_detail'),
    path('task/<str:task_id>/transfer-to-huntflow/', views.transfer_to_huntflow, name='transfer_to_huntflow'),
    path('sync-logs/', views.sync_logs, name='sync_logs'),
    
    # Массовый импорт
    path('bulk-import/', views.bulk_import_view, name='bulk_import'),
    path('bulk-import/<int:import_id>/', views.bulk_import_progress, name='bulk_import_progress'),
    
    # API endpoints
    path('api/test-connection/', views.test_connection, name='test_connection'),
    path('api/path-options/', views.get_path_options, name='get_path_options'),
    path('api/spaces/', views.get_spaces, name='get_spaces'),
    path('api/folders/', views.get_folders, name='get_folders'),
    path('api/lists/', views.get_lists, name='get_lists'),
    path('api/sync-tasks/', views.sync_tasks, name='sync_tasks'),
    path('api/clear-cache/', views.clear_cache, name='clear_cache'),
    path('api/start-bulk-import/', views.start_bulk_import, name='start_bulk_import'),
    path('api/stop-bulk-import/<int:import_id>/', views.stop_bulk_import, name='stop_bulk_import'),
    path('api/bulk-import-progress/<int:import_id>/', views.get_bulk_import_progress, name='get_bulk_import_progress'),
    path('api/retry-failed-tasks/<int:import_id>/', views.retry_failed_tasks_view, name='retry_failed_tasks'),
]
