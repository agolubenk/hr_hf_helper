from django.urls import path
from . import views

app_name = 'telegram'

urlpatterns = [
    # Основные страницы
    path('', views.TelegramAuthView.as_view(), name='auth'),
    path('dashboard/', views.TelegramDashboardView.as_view(), name='dashboard'),
    
    # API endpoints для AJAX
    path('api/generate-qr/', views.GenerateQRView.as_view(), name='generate_qr'),
    path('api/check-auth/', views.CheckAuthStatusView.as_view(), name='check_auth'),
    path('api/handle-2fa/', views.Handle2FAView.as_view(), name='handle_2fa'),
    path('api/recreate-qr/', views.RecreateQRView.as_view(), name='recreate_qr'),
    
    # Дополнительные API
    path('api/auth-attempts/', views.get_auth_attempts, name='auth_attempts'),
    path('api/reset-auth/', views.reset_telegram_auth, name='reset_auth'),
    
    # API для чатов и сообщений
    path('api/chats/', views.ChatsListView.as_view(), name='chats_list'),
    path('api/messages/<str:chat_id>/', views.MessagesListView.as_view(), name='messages_list'),
]