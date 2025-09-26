from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Универсальные шаблоны (HTML)
    path('', views.profile_template_handler, name='profile'),
    path('edit/', views.profile_edit_template_handler, name='profile_edit'),
    path('settings/', views.profile_settings_template_handler, name='profile_settings'),
    path('integrations/', views.integrations_template_handler, name='integrations'),
    path('api-keys/', views.api_keys_template_handler, name='api_keys'),
    path('components/', views.components_template_handler, name='components'),
    
    # Универсальные API (JSON)
    path('api/test-gemini/', lambda r: views.unified_api_view(r, views.test_gemini_api_handler), name='api_test_gemini'),
    path('api/test-clickup/', lambda r: views.unified_api_view(r, views.test_clickup_api_handler), name='api_test_clickup'),
    path('api/test-notion/', lambda r: views.unified_api_view(r, views.test_notion_api_handler), name='api_test_notion'),
    path('api/test-huntflow/', lambda r: views.unified_api_view(r, views.test_huntflow_api_handler), name='api_test_huntflow'),
    
    # API аутентификация (JSON)
    path('api/login/', lambda r: views.unified_api_view(r, views.login_api_handler), name='api_login'),
    path('api/logout/', lambda r: views.unified_api_view(r, views.logout_api_handler), name='api_logout'),
    
    # Google OAuth (специальные функции)
    path('google-oauth/', views.google_oauth_redirect, name='google_oauth_redirect'),
    path('google-oauth-callback/', views.google_oauth_callback, name='google_oauth_callback'),
    path('google-oauth-demo/', views.google_oauth_demo, name='google_oauth_demo'),
    path('google-oauth-test/', views.google_oauth_test, name='google_oauth_test'),
    path('oauth-debug/', views.oauth_debug, name='oauth_debug'),
    
    # Универсальная аутентификация (HTML + JSON)
    path('login/', views.unified_login, name='account_login'),
    path('logout/', views.unified_logout, name='account_logout'),
    path('unified-login/', views.unified_login, name='unified_login'),
    path('unified-logout/', views.unified_logout, name='unified_logout'),
]
