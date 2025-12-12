"""
URLs для приложения отчетности
"""
from django.urls import path
from . import views

app_name = 'reporting'

urlpatterns = [
    path('', views.report_dashboard, name='dashboard'),
    path('company/', views.company_report, name='company_report'),
    path('recruiters/summary/', views.recruiters_summary_report, name='recruiters_summary_report'),
    path('recruiter/', views.recruiter_report, name='recruiter_list'),
    path('recruiter/<int:recruiter_id>/', views.recruiter_report, name='recruiter_report'),
    path('vacancy/', views.vacancy_report, name='vacancy_list'),
    path('vacancy/<int:vacancy_id>/', views.vacancy_report, name='vacancy_report'),
    path('interviewer/', views.interviewer_report, name='interviewer_list'),
    path('interviewer/<int:interviewer_id>/', views.interviewer_report, name='interviewer_report'),
    path('api/data/', views.api_report_data, name='api_report_data'),
    path('api/sync/', views.sync_calendar_events, name='api_sync_events'),
]

