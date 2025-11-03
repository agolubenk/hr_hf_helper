from django.urls import path
from . import views

app_name = 'company_settings'

urlpatterns = [
    path('', views.company_settings_view, name='company_settings'),
    path('api/', views.company_settings_api, name='company_settings_api'),
    path('rejection-templates/api/', views.rejection_templates_api, name='rejection_templates_api'),
    path('active-grades/api/', views.active_grades_api, name='active_grades_api'),
]

