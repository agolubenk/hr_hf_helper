from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_api, views

app_name = 'hhru'

# Создание роутера для API
router = DefaultRouter()
router.register(r'accounts', views_api.HHRUAccountViewSet, basename='hhru-account')
router.register(r'configurations', views_api.HHRUConfigurationViewSet, basename='hhru-configuration')
router.register(r'logs', views_api.HHRUAPILogViewSet, basename='hhru-log')

urlpatterns = [
    # Веб-страницы
    path('', views.dashboard, name='dashboard'),
    path('accounts/', views.accounts_list, name='accounts_list'),
    path('accounts/<int:account_id>/', views.account_detail, name='account_detail'),
    path('configurations/', views.configurations_list, name='configurations_list'),
    path('configurations/create/', views.configuration_create, name='configuration_create'),
    path('configurations/<int:config_id>/edit/', views.configuration_edit, name='configuration_edit'),
    path('configurations/<int:config_id>/delete/', views.configuration_delete, name='configuration_delete'),
    path('oauth/', views.oauth_authorize, name='oauth_authorize'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback'),
    path('logs/', views.logs_list, name='logs_list'),
    
    # AJAX endpoints
    path('ajax/test-connection/', views.test_connection_ajax, name='test_connection_ajax'),
    path('ajax/refresh-token/', views.refresh_token_ajax, name='refresh_token_ajax'),
    
    # API endpoints через роутер
    path('api/', include(router.urls)),
    
    # API OAuth endpoints
    path('api/oauth/', views_api.HHRUOAuthView.as_view(), name='api-oauth'),
    path('api/oauth/callback/', views_api.HHRUOAuthView.as_view(), name='api-oauth-callback'),
    
    # API тестирование подключения
    path('api/test-connection/', views_api.HHRUTestConnectionView.as_view(), name='api-test-connection'),
]

