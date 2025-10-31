from django.urls import path
from . import views

app_name = 'company_settings'

urlpatterns = [
    path('', views.company_settings_view, name='company_settings'),
    path('api/', views.company_settings_api, name='company_settings_api'),
]

