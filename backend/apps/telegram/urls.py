"""
URL patterns для Telegram приложения
"""
from django.urls import path
from . import views

app_name = 'telegram'

urlpatterns = [
    # Главная страница
    path('', views.TelegramIndexView.as_view(), name='index'),
    
    # API endpoints
    path('session/status/', views.SessionStatusView.as_view(), name='session_status'),
    path('auth/phone/', views.AuthPhoneView.as_view(), name='auth_phone'),
    path('auth/verify/', views.AuthVerifyView.as_view(), name='auth_verify'),
    path('auth/qr/', views.QRStartView.as_view(), name='qr_start'),
    path('auth/qr/status/', views.QRStatusView.as_view(), name='qr_status'),
    path('chats/', views.ChatsListView.as_view(), name='chats_list'),
    path('chats/<str:chat_id>/messages/', views.MessagesListView.as_view(), name='messages_list'),
    path('user/info/', views.UserInfoView.as_view(), name='user_info'),
    path('session/reset/', views.ResetSessionView.as_view(), name='reset_session'),
    path('session/info/', views.SessionInfoView.as_view(), name='session_info'),
]