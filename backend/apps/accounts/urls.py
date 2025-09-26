from django.urls import path
from . import views, views_simple

app_name = 'accounts'

urlpatterns = [
    # Веб-интерфейс (HTML)
    path('', views.profile_view, name='profile'),
    path('edit/', views.profile_edit, name='profile_edit'),
    path('settings/', views.profile_settings, name='profile_settings'),
    path('integrations/', views.integrations_view, name='integrations'),
    path('api-keys/', views.api_keys_view, name='api_keys'),
    path('components/', views.components_view, name='components'),
    
    # Тестирование API
    path('test-gemini-api/', views.test_gemini_api, name='test_gemini_api'),
    path('test-clickup-api/', views.test_clickup_api, name='test_clickup_api'),
    path('test-notion-api/', views.test_notion_api, name='test_notion_api'),
    path('test-huntflow-api/', views.test_huntflow_api, name='test_huntflow_api'),
    
    # Google OAuth
    path('google-oauth/', views.google_oauth_redirect, name='google_oauth_redirect'),
    path('google-oauth-callback/', views.google_oauth_callback, name='google_oauth_callback'),
    path('google-oauth-demo/', views.google_oauth_demo, name='google_oauth_demo'),
    path('google-oauth-test/', views.google_oauth_test, name='google_oauth_test'),
    path('oauth-debug/', views.oauth_debug, name='oauth_debug'),
    
    # Веб-аутентификация (HTML формы)
    path('login/', views.account_login, name='account_login'),
    path('logout/', views.account_logout, name='account_logout'),
    
    # Универсальная аутентификация (HTML + JSON)
    path('unified-login/', views.unified_login, name='unified_login'),
    path('unified-logout/', views.unified_logout, name='unified_logout'),
    
    # API аутентификация (JSON) - для обратной совместимости
    path('api/login/', views_simple.simple_api_login, name='api_login'),
    path('api/logout/', views_simple.simple_api_logout, name='api_logout'),
]
