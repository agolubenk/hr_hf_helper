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
]