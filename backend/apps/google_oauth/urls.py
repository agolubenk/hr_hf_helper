from django.urls import path
from . import views
from . import views_simple

app_name = 'google_oauth'

urlpatterns = [
    # Основные страницы
    path('', views.dashboard, name='dashboard'),
    
    # OAuth
    path('oauth/start/', views.google_oauth_start, name='oauth_start'),
    path('oauth/callback/', views.google_oauth_callback, name='oauth_callback'),
    path('disconnect/', views.disconnect_google, name='disconnect'),
    
    # Календарь и Drive
    path('calendar/', views.calendar_events, name='calendar_events'),
    path('drive/', views.drive_files, name='drive_files'),
    
    # Синхронизация
    path('sync/calendar/', views.sync_calendar, name='sync_calendar'),
    path('sync/drive/', views.sync_drive, name='sync_drive'),
    
    # Тестирование
    path('test/oauth/', views.test_oauth, name='test_oauth'),
    path('test/oauth-url/', views.test_oauth_url, name='test_oauth_url'),
    path('test/check-integration/', views.check_integration, name='check_integration'),
    
    # API endpoints
    path('api/event/<str:event_id>/', views.get_event_details, name='get_event_details'),
    path('api/meetings-count/', views.get_meetings_count, name='get_meetings_count'),
    path('api/slots-settings/', views.api_slots_settings, name='api_slots_settings'),
    path('api/calendar-events/', views.api_calendar_events, name='api_calendar_events'),
    path('debug/cache/', views.debug_cache, name='debug_cache'),
    
    # Инвайты
    path('invites/', views.invite_dashboard, name='invite_dashboard'),
    path('invites/list/', views.invite_list, name='invite_list'),
    path('invites/create/', views.invite_create, name='invite_create'),
    path('invites/create/combined/', views.invite_create_combined, name='invite_create_combined'),
    path('invites/<int:pk>/', views.invite_detail, name='invite_detail'),
    path('invites/<int:pk>/edit/', views.invite_update, name='invite_update'),
    path('invites/<int:pk>/delete/', views.invite_delete, name='invite_delete'),
    path('invites/<int:pk>/regenerate-scorecard/', views.invite_regenerate_scorecard, name='invite_regenerate_scorecard'),
    path('invites/<int:pk>/invitation-text/', views.get_invitation_text, name='get_invitation_text'),
    path('invites/<int:pk>/parser-time-analysis/', views.get_parser_time_analysis, name='get_parser_time_analysis'),
    
    # Настройки структуры папок
    path('invites/settings/', views.scorecard_path_settings, name='scorecard_path_settings'),
    path('api/scorecard-path-settings/', views.api_scorecard_path_settings, name='api_scorecard_path_settings'),
    
    # HR-скрининг
    path('hr-screening/', views.hr_screening_list, name='hr_screening_list'),
    path('hr-screening/create/', views.hr_screening_create, name='hr_screening_create'),
    path('hr-screening/<int:pk>/', views.hr_screening_detail, name='hr_screening_detail'),
    path('hr-screening/<int:pk>/delete/', views.hr_screening_delete, name='hr_screening_delete'),
    path('hr-screening/<int:pk>/retry-analysis/', views.hr_screening_retry_analysis, name='hr_screening_retry_analysis'),
    
    # Объединенный рабочий процесс
    path('combined-workflow/', views.combined_workflow, name='combined_workflow'),
    
    # Чат-интерфейс
    path('chat/', views.chat_workflow, name='chat_workflow'),
    path('chat/<int:session_id>/', views.chat_workflow, name='chat_workflow_session'),
    
    # G-данные и автоматизация
    path('gdata-automation/', views.gdata_automation, name='gdata_automation'),
    
    # Старые маршруты для совместимости
    path('start/', views.google_oauth_start, name='oauth_start_old'),
    path('callback/', views_simple.google_oauth_callback_simple, name='oauth_callback_old'),
    path('calendar-view/', views.calendar_view, name='calendar_view'),
    path('drive-view/', views.drive_view, name='drive_view'),
    path('sheets/', views.sheets_view, name='sheets'),
    path('sync/sheets/', views.sync_sheets, name='sync_sheets'),
    path('sync/all/', views.sync_all, name='sync_all'),
]
