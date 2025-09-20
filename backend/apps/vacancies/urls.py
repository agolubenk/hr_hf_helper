from django.urls import path
from . import views

app_name = 'vacancies'

urlpatterns = [
    # Дашборд
    path('', views.dashboard, name='dashboard'),
    
    # CRUD операции для вакансий
    path('list/', views.vacancy_list, name='vacancy_list'),
    path('create/', views.vacancy_create, name='vacancy_create'),
    path('<int:pk>/', views.vacancy_detail, name='vacancy_detail'),
    path('<int:pk>/edit/', views.vacancy_edit, name='vacancy_edit'),
    path('<int:pk>/delete/', views.vacancy_delete, name='vacancy_delete'),
    
    # AJAX операции для вакансий
    path('<int:pk>/toggle-active/', views.vacancy_toggle_active, name='vacancy_toggle_active'),
    
    # CRUD операции для зарплатных вилок
    path('salary-ranges/', views.salary_ranges_list, name='salary_ranges_list'),
    path('salary-ranges/create/', views.salary_range_create, name='salary_range_create'),
    path('salary-ranges/<int:pk>/', views.salary_range_detail, name='salary_range_detail'),
    path('salary-ranges/<int:pk>/edit/', views.salary_range_edit, name='salary_range_edit'),
    path('salary-ranges/<int:pk>/delete/', views.salary_range_delete, name='salary_range_delete'),
    
    # AJAX операции для зарплатных вилок
    path('salary-ranges/<int:pk>/toggle-active/', views.salary_range_toggle_active, name='salary_range_toggle_active'),
]
