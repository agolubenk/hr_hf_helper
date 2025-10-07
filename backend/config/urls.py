from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls import handler404, handler500, handler403
from django.conf.urls.static import static
# from django_telethon.urls import django_telethon_urls  # Отключено

def redirect_to_chat(request):
    return redirect('/google-oauth/chat/')

urlpatterns = [
    # API endpoints
    path('', include('config.api_urls')),
    
    # Simple API endpoints (без CSRF) - теперь в основном urls.py
    # path('simple-api/', include('apps.accounts.urls_simple')),  # Удалено - объединено в accounts/urls.py
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # Главная страница
    path('', redirect_to_chat, name='home'),
    
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
    # path('telegram-api/', django_telethon_urls()),  # Отключено
    
    # Test page
    path('test-telegram/', lambda request: HttpResponse(open('/Users/agolubenko/hrhelper/fullstack/backend/test_simple_telegram.html').read(), content_type='text/html'), name='test_telegram'),
    
    # Common URLs (обработчики ошибок)
    path('common/', include('apps.common.urls')),
]

# Обработчики ошибок
handler404 = 'apps.common.views.custom_404_view'
handler500 = 'apps.common.views.custom_500_view'
handler403 = 'apps.common.views.custom_403_view'

# Обслуживание статических файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
