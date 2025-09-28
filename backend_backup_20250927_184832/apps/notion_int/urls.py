from django.urls import path
from . import views

app_name = 'notion_int'

urlpatterns = [
    # Главная страница
    path('', views.dashboard, name='dashboard'),
    
    # Настройки
    path('settings/', views.settings, name='settings'),
    path('settings/save/', views.save_settings, name='save_settings'),
    path('settings/test/', views.test_connection, name='test_connection'),
    path('settings/databases/', views.get_databases, name='get_databases'),
    
    # Страницы
    path('pages/', views.pages_list, name='pages_list'),
    path('pages/<str:page_id>/', views.page_detail, name='page_detail'),
    
    # API
    path('api/sync/', views.sync_pages, name='sync_pages'),
    path('api/clear-cache/', views.clear_cache, name='clear_cache'),
    path('api/transfer-to-huntflow/', views.transfer_to_huntflow, name='transfer_to_huntflow'),
    
    # Логи
    path('logs/', views.sync_logs, name='sync_logs'),
]
