from django.urls import path
from . import views

app_name = 'hiring_plan'

urlpatterns = [
    # Список планов
    path('', views.PlanListView.as_view(), name='plan_list'),
    
    # Создание плана
    path('create/', views.PlanCreateView.as_view(), name='plan_create'),
    
    # Детальный просмотр плана
    path('<int:pk>/', views.PlanDetailView.as_view(), name='plan_detail'),
    
    # Редактирование плана
    path('<int:pk>/edit/', views.PlanUpdateView.as_view(), name='plan_update'),
    
    # Удаление плана
    path('<int:pk>/delete/', views.PlanDeleteView.as_view(), name='plan_delete'),
    
    # Дашборд плана
    path('<int:pk>/dashboard/', views.plan_dashboard, name='plan_dashboard'),
    
    # Добавление позиции
    path('<int:plan_pk>/positions/add/', 
         views.PositionCreateView.as_view(), name='position_add'),
    
    # Редактирование позиции
    path('positions/<int:pk>/edit/', 
         views.PositionUpdateView.as_view(), name='position_update'),
    
    # Удаление позиции
    path('positions/<int:pk>/delete/', 
         views.PositionDeleteView.as_view(), name='position_delete'),
    
    # AJAX обновление количества
    path('positions/<int:pk>/update-headcount/', 
         views.update_position_headcount, name='position_update_headcount'),
]
