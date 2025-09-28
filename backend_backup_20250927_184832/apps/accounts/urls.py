from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Основные маршруты профиля
    path('', views.unified_template_view, {'template_name': 'profile/profile.html', 'handler_func': views.profile_template_handler}, name='profile'),
    path('edit/', views.unified_template_view, {'template_name': 'profile/profile_edit.html', 'handler_func': views.profile_edit_template_handler}, name='profile_edit'),
    path('settings/', views.unified_template_view, {'template_name': 'profile/profile_settings.html', 'handler_func': views.profile_settings_template_handler}, name='profile_settings'),
    
    # Интеграции
    path('integrations/', views.unified_template_view, {'template_name': 'profile/integrations.html', 'handler_func': views.integrations_template_handler}, name='integrations'),
    path('api-keys/', views.unified_template_view, {'template_name': 'profile/api_keys.html', 'handler_func': views.api_keys_template_handler}, name='api_keys'),
    path('components/', views.unified_template_view, {'template_name': 'account/test_google_oauth.html', 'handler_func': views.components_template_handler}, name='components'),
    
    # Аутентификация
    path('login/', views.unified_login, name='account_login'),
    path('logout/', views.unified_logout, name='account_logout'),
    
    # Google OAuth
    path('google-oauth/', views.google_oauth_redirect, name='google_oauth_redirect'),
    path('google-oauth-callback/', views.google_oauth_callback, name='google_oauth_callback'),
    
    # API тестирование
    path('test-gemini/', views.unified_api_view, {'handler_func': views.test_gemini_api_handler}, name='test_gemini_api'),
    path('test-huntflow/', views.unified_api_view, {'handler_func': views.test_huntflow_api_handler}, name='test_huntflow_api'),
    path('test-clickup/', views.unified_api_view, {'handler_func': views.test_clickup_api_handler}, name='test_clickup_api'),
    path('test-notion/', views.unified_api_view, {'handler_func': views.test_notion_api_handler}, name='test_notion_api'),
]