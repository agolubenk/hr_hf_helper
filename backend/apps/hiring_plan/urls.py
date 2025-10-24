from django.urls import path
from . import views

app_name = 'hiring_plan'

urlpatterns = [
    # Основные CRUD операции для планов
    path('', views.HiringPlanListView.as_view(), name='plan_list'),
    path('create/', views.HiringPlanCreateView.as_view(), name='plan_create'),
    path('periodic/create/', views.PeriodicPlanCreateView.as_view(), name='periodic_plan_create'),
    path('<int:pk>/', views.HiringPlanDetailView.as_view(), name='plan_detail'),
    path('<int:pk>/edit/', views.HiringPlanUpdateView.as_view(), name='plan_update'),
    path('<int:pk>/delete/', views.HiringPlanDeleteView.as_view(), name='plan_delete'),
    
    # Дополнительные функции планов
    path('<int:pk>/dashboard/', views.HiringPlanDetailView.as_view(), name='plan_dashboard'),
    path('<int:pk>/sla-compliance/', views.PlanSLAComplianceView.as_view(), name='plan_sla_compliance'),
    path('<int:pk>/kpi-okr/', views.PlanKPIOKRDashboardView.as_view(), name='plan_kpi_okr'),
    path('<int:pk>/auto-move-positions/', views.auto_move_unfilled_positions, name='auto_move_unfilled'),
    path('<int:pk>/ajax-data/', views.plan_ajax_data, name='plan_ajax_data'),
    
    # Позиции в планах
    path('<int:plan_pk>/positions/add/', views.HiringPlanPositionCreateView.as_view(), name='position_add'),
    path('positions/<int:pk>/edit/', views.HiringPlanPositionUpdateView.as_view(), name='position_update'),
    path('positions/<int:pk>/delete/', views.HiringPlanPositionDeleteView.as_view(), name='position_delete'),
    path('positions/<int:pk>/update-headcount/', views.update_position_headcount, name='position_update_headcount'),
    
    # SLA управление
    path('sla/', views.PositionSLAListView.as_view(), name='sla_list'),
    path('sla/create/', views.PositionSLACreateView.as_view(), name='sla_create'),
    path('sla/<int:pk>/edit/', views.PositionSLAUpdateView.as_view(), name='sla_update'),
    path('<int:plan_pk>/sla/create/', views.PlanSLACreateView.as_view(), name='plan_sla_create'),
    
    # KPI/OKR управление
    path('<int:plan_pk>/kpi-okr/create/', views.PositionKPIOKRCreateView.as_view(), name='kpi_okr_create'),
    path('kpi-okr/<int:pk>/edit/', views.PositionKPIOKRUpdateView.as_view(), name='kpi_okr_update'),
    
    # Блоки KPI/OKR
    path('kpi-okr-blocks/', views.PlanKPIOKRBlockListView.as_view(), name='kpi_okr_block_list'),
    path('kpi-okr-blocks/create/', views.PlanKPIOKRBlockCreateView.as_view(), name='kpi_okr_block_create'),
    path('kpi-okr-blocks/<int:pk>/edit/', views.PlanKPIOKRBlockUpdateView.as_view(), name='kpi_okr_block_update'),
    
    # Применение блоков KPI/OKR к планам
    path('<int:plan_pk>/apply-kpi-okr-block/<int:block_pk>/', views.apply_kpi_okr_block_to_plan, name='apply_kpi_okr_block'),
]