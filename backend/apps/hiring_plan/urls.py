from django.urls import path
from . import views

app_name = 'hiring_plan'

urlpatterns = [
    # Основная страница - список всех заявок
    path('', views.HiringRequestsListView.as_view(), name='hiring_requests_list'),
    
    # Детальный просмотр и редактирование заявки
    path('requests/<int:pk>/', views.HiringRequestDetailView.as_view(), name='hiring_request_detail'),
    path('requests/create/', views.HiringRequestCreateView.as_view(), name='hiring_request_create'),
    path('requests/<int:pk>/edit/', views.HiringRequestUpdateView.as_view(), name='hiring_request_update'),
    
    # SLA управление (оставляем для настройки SLA)
    path('sla/', views.VacancySLAListView.as_view(), name='sla_list'),
    path('sla/create/', views.VacancySLACreateView.as_view(), name='sla_create'),
    path('sla/<int:pk>/edit/', views.VacancySLAUpdateView.as_view(), name='sla_update'),
    path('sla/get-available-grades/', views.get_available_grades, name='get_available_grades'),
    
    # Метрики и KPI
    path('metrics/', views.MetricsDashboardView.as_view(), name='metrics_dashboard'),
    path('metrics/list/', views.MetricsListView.as_view(), name='metrics_list'),
    path('forecasts/', views.ForecastsListView.as_view(), name='forecasts_list'),
    path('capacity/', views.RecruiterCapacityListView.as_view(), name='recruiter_capacity_list'),
    
    # Годовая таблица заявок
    path('yearly/', views.YearlyHiringPlanView.as_view(), name='yearly_hiring_plan'),
    
    # HuntFlow webhook
    path('huntflow/webhook/', views.huntflow_webhook, name='huntflow_webhook'),
    
    # HuntFlow импорт
    path('huntflow/import/', views.HuntflowImportView.as_view(), name='huntflow_import'),
    path('huntflow/import/applicant/', views.huntflow_import_applicant, name='huntflow_import_applicant'),
    path('huntflow/vacancies/', views.huntflow_get_vacancies, name='huntflow_get_vacancies'),
    path('huntflow/vacancies/<int:vacancy_id>/applicants/', views.huntflow_get_applicants, name='huntflow_get_applicants'),
]

app_name = 'hiring_plan'

urlpatterns = [
    # Основная страница - список всех заявок
    path('', views.HiringRequestsListView.as_view(), name='hiring_requests_list'),
    
    # Детальный просмотр и редактирование заявки
    path('requests/<int:pk>/', views.HiringRequestDetailView.as_view(), name='hiring_request_detail'),
    path('requests/create/', views.HiringRequestCreateView.as_view(), name='hiring_request_create'),
    path('requests/<int:pk>/edit/', views.HiringRequestUpdateView.as_view(), name='hiring_request_update'),
    
    # SLA управление (оставляем для настройки SLA)
    path('sla/', views.VacancySLAListView.as_view(), name='sla_list'),
    path('sla/create/', views.VacancySLACreateView.as_view(), name='sla_create'),
    path('sla/<int:pk>/edit/', views.VacancySLAUpdateView.as_view(), name='sla_update'),
    path('sla/get-available-grades/', views.get_available_grades, name='get_available_grades'),
    
    # Метрики и KPI
    path('metrics/', views.MetricsDashboardView.as_view(), name='metrics_dashboard'),
    path('metrics/list/', views.MetricsListView.as_view(), name='metrics_list'),
    path('forecasts/', views.ForecastsListView.as_view(), name='forecasts_list'),
    path('capacity/', views.RecruiterCapacityListView.as_view(), name='recruiter_capacity_list'),
    
    # Годовая таблица заявок
    path('yearly/', views.YearlyHiringPlanView.as_view(), name='yearly_hiring_plan'),
    
    # HuntFlow webhook
    path('huntflow/webhook/', views.huntflow_webhook, name='huntflow_webhook'),
    
    # HuntFlow импорт
    path('huntflow/import/', views.HuntflowImportView.as_view(), name='huntflow_import'),
    path('huntflow/import/applicant/', views.huntflow_import_applicant, name='huntflow_import_applicant'),
    path('huntflow/vacancies/', views.huntflow_get_vacancies, name='huntflow_get_vacancies'),
    path('huntflow/vacancies/<int:vacancy_id>/applicants/', views.huntflow_get_applicants, name='huntflow_get_applicants'),
]