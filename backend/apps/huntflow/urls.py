from django.urls import path
from . import views, views_token

app_name = 'huntflow'

urlpatterns = [
    # Главная страница интеграции
    path('', views.huntflow_dashboard, name='dashboard'),
    
    # Вакансии
    path('accounts/<int:account_id>/vacancies/', views.vacancies_list, name='vacancies_list'),
    path('accounts/<int:account_id>/vacancies/<int:vacancy_id>/', views.vacancy_detail, name='vacancy_detail'),
    
    # Кандидаты
    path('accounts/<int:account_id>/applicants/', views.applicants_list, name='applicants_list'),
    path('accounts/<int:account_id>/applicants/<int:applicant_id>/', views.applicant_detail, name='applicant_detail'),
    path('accounts/<int:account_id>/applicants/<int:applicant_id>/edit/', views.applicant_edit, name='applicant_edit'),
    
    # AJAX endpoints
    path('test-connection/', views.test_connection_ajax, name='test_connection_ajax'),
    path('accounts/<int:account_id>/vacancies/ajax/', views.get_vacancies_ajax, name='get_vacancies_ajax'),
    path('accounts/<int:account_id>/applicants/ajax/', views.get_applicants_ajax, name='get_applicants_ajax'),
    path('accounts/<int:account_id>/applicants/<int:applicant_id>/comment/', views.create_comment_ajax, name='create_comment_ajax'),
    
    # API для управления токенами
    path('tokens/api/', views_token.HuntflowTokenAPIView.as_view(), name='huntflow_tokens'),
    path('tokens/refresh/', views_token.refresh_huntflow_token_view, name='huntflow_refresh_token'),
    path('tokens/test/', views_token.test_huntflow_connection_view, name='huntflow_test_connection'),
    
    # HH.ru интеграция
    path('accounts/<int:account_id>/hh/vacancies/', views.hh_vacancy_select, name='hh_vacancy_select'),
    path('accounts/<int:account_id>/hh/vacancies/<int:vacancy_id>/responses/', views.hh_responses_list, name='hh_responses_list'),
    path('accounts/<int:account_id>/hh/vacancies/<int:vacancy_id>/import/', views.hh_import_responses_ajax, name='hh_import_responses_ajax'),
    path('accounts/<int:account_id>/hh/vacancies/<int:vacancy_id>/reject/', views.hh_reject_response_ajax, name='hh_reject_response_ajax'),
    path('accounts/<int:account_id>/hh/vacancies/<int:vacancy_id>/archive/', views.hh_archive_response_ajax, name='hh_archive_response_ajax'),
    path('accounts/<int:account_id>/hh/vacancies/<int:vacancy_id>/mark-viewed/', views.hh_mark_viewed_ajax, name='hh_mark_viewed_ajax'),
]
