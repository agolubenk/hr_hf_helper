from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
# from django_telethon.urls import django_telethon_urls  # Отключено

def redirect_to_huntflow(request):
    return redirect('/huntflow/')

urlpatterns = [
    # API endpoints
    path('', include('config.api_urls')),
    
    # Simple API endpoints (без CSRF)
    path('simple-api/', include('apps.accounts.urls_simple')),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # Главная страница
    path('', redirect_to_huntflow, name='home'),
    
    # Django Allauth (отдельный префикс)
    path('auth/', include('allauth.urls')),
    
    # Веб-интерфейс (старые URL)
    path('accounts/', include('apps.accounts.urls')),
    path('huntflow/', include('apps.huntflow.urls')),
    path('gemini/', include('apps.gemini.urls')),
    path('interviewers/', include('apps.interviewers.urls')),
    path('vacancies/', include('apps.vacancies.urls')),
    path('google-oauth/', include('apps.google_oauth.urls')),
    path('finance/', include('apps.finance.urls')),
    path('clickup/', include('apps.clickup_int.urls')),
    path('notion/', include('apps.notion_int.urls')),
    path('telegram/', include('apps.telegram.urls')),
    # path('telegram-api/', django_telethon_urls()),  # Отключено
]
