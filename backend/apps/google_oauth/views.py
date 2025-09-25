from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext as _
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model, login
from django import forms
import json

from .models import GoogleOAuthAccount, ScorecardPathSettings, SlotsSettings
from .services import (
    GoogleOAuthService, 
    GoogleCalendarService, 
    GoogleDriveService, 
    GoogleSheetsService
)


def determine_action_type_from_text(text):
    """
    Определяет тип действия на основе текста сообщения
    """
    if not text:
        return 'hr_screening'
    
    # Паттерны для поиска дат, дней недели и времени
    import re
    
    # Паттерны дат
    date_patterns = [
        r'\d{4}-\d{2}-\d{2}',  # 2025-09-15
        r'\d{2}\.\d{2}\.\d{4}',  # 15.09.2025
        r'\d{2}/\d{2}/\d{4}',   # 15/09/2025
    ]
    
    # Паттерны времени (более строгие, чтобы не ловить зарплатные цифры)
    time_patterns = [
        r'\b\d{1,2}:\d{2}\b',  # 14:00, 9:30 (с границами слов)
        r'\b\d{1,2}:\d{2}:\d{2}\b',  # 14:00:00 (с границами слов)
    ]
    
    # Дни недели
    weekdays = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

    # Слова-индикаторы встречи/интервью
    meeting_indicators = [
        'встреча', 'интервью', 'собеседование', 'скрининг', 'время', 'дата',
        'когда', 'встретимся', 'поговорим', 'созвонимся', 'созвон',
        'встречаемся', 'договоримся', 'назначим', 'планируем',
        'meeting', 'interview', 'call', 'schedule', 'time', 'date'
    ]

    # Слова-индикаторы HR-скрининга (информация о кандидате)
    # ИСКЛЮЧАЕМ дни недели - они относятся к инвайтам
    hr_indicators = [
        'опыт', 'стаж', 'работал', 'работаю', 'компания', 'проект',
        'технологии', 'навыки', 'знаю', 'умею', 'зарплата', 'зарплату',
        'оклад', 'деньги', 'рублей', 'долларов', 'евро', 'byn', 'usd',
        'локация', 'место', 'удаленка', 'офис', 'гибрид', 'минск',
        'возраст', 'лет', 'военник', 'стабильное', 'недель', 'месяцев',
        'senior', 'junior', 'middle', 'lead', 'head', 'главный', 'ведущий',
        'сеньор', 'джуниор', 'мидл', 'лид', 'хеда', 'должности',
        'комфортно', 'ищу', 'стабильное', 'локация', 'текущая', 'идеале'
    ]
    
    # Проверяем наличие дат
    has_date = any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)
    
    # Проверяем наличие времени
    has_time = any(re.search(pattern, text, re.IGNORECASE) for pattern in time_patterns)
    
    # Проверяем наличие дней недели
    has_weekday = any(day.lower() in text.lower() for day in weekdays)
    
    # Проверяем наличие индикаторов встречи
    has_meeting_indicators = any(indicator.lower() in text.lower() for indicator in meeting_indicators)
    
    # Проверяем наличие индикаторов HR-скрининга (с границами слов для точности)
    has_hr_indicators = any(re.search(r'\b' + re.escape(indicator.lower()) + r'\b', text.lower()) for indicator in hr_indicators)
    
    # Проверяем длину текста
    text_length = len(text.strip())
    
    # Улучшенная логика определения с приоритетом HR-индикаторов
    # ПРИОРИТЕТ 1: Если есть явные индикаторы HR-скрининга - это HR-скрининг (даже если есть время)
    if has_hr_indicators:
        return 'hr_screening'
    
    # ПРИОРИТЕТ 2: Если есть ключевые слова о кандидате - это HR-скрининг (с границами слов)
    elif any(re.search(r'\b' + re.escape(keyword.lower()) + r'\b', text.lower()) for keyword in ['от', 'комфортно', 'готов', 'опыт', 'работаю', 'технологии', 'middle', 'senior', 'junior', 'хеда', 'сеньор', 'возраст', 'военник', 'стабильное', 'недель', 'локация', 'минск', 'гибрид', 'ищу', 'стабильное', 'должности', 'текущая', 'идеале']):
        return 'hr_screening'
    
    # ПРИОРИТЕТ 3: Если есть явные временные указания (дата/время/день недели) - это инвайт
    elif has_date or has_time or has_weekday:
        return 'invite'
    
    # ПРИОРИТЕТ 4: Если есть индикаторы встречи И нет индикаторов HR-скрининга - это инвайт
    elif has_meeting_indicators and not has_hr_indicators:
        return 'invite'
    
    # ПРИОРИТЕТ 5: Если текст длинный и нет явных индикаторов - по умолчанию HR-скрининг
    elif text_length > 100:
        return 'hr_screening'
    
    # По умолчанию HR-скрининг
    else:
        return 'hr_screening'
    
    # ВАЖНО: Никогда не возвращаем 'both' - это создает и HR-скрининг, и инвайт одновременно!
    # HR-скрининг и инвайт должны создаваться отдельно

User = get_user_model()


def format_file_size(size_bytes):
    """Форматирует размер файла в читаемый вид"""
    if size_bytes is None:
        return "-"
    
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def get_file_type_display(mime_type):
    """Возвращает понятное название типа файла"""
    type_mapping = {
        'application/vnd.google-apps.folder': 'Папка',
        'application/vnd.google-apps.document': 'Google Документ',
        'application/vnd.google-apps.spreadsheet': 'Google Таблица',
        'application/vnd.google-apps.presentation': 'Google Презентация',
        'application/vnd.google-apps.form': 'Google Форма',
        'application/vnd.google-apps.drawing': 'Google Рисунок',
        'application/pdf': 'PDF',
        'application/msword': 'Word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
        'application/vnd.ms-excel': 'Excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
        'application/vnd.ms-powerpoint': 'PowerPoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
        'text/plain': 'Текстовый файл',
        'text/csv': 'CSV',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/gif': 'GIF',
        'image/svg+xml': 'SVG',
        'video/mp4': 'MP4',
        'video/avi': 'AVI',
        'video/quicktime': 'MOV',
        'audio/mp3': 'MP3',
        'audio/wav': 'WAV',
        'application/zip': 'ZIP',
        'application/x-rar-compressed': 'RAR',
    }
    
    return type_mapping.get(mime_type, mime_type.split('/')[-1].upper())


@login_required
def dashboard_redirect(request):
    """Перенаправление на объединенный дашборд профиля"""
    return redirect('accounts:profile')


def google_oauth_start(request):
    """Начало OAuth процесса"""
    print(f"=== OAUTH START DEBUG ===")
    print(f"User authenticated: {request.user.is_authenticated}")
    
    # Если пользователь уже авторизован, перенаправляем на дашборд
    if request.user.is_authenticated:
        return redirect('accounts:profile')
    
    oauth_service = GoogleOAuthService(request.user)
    
    try:
        auth_url, state = oauth_service.get_authorization_url()
        request.session['google_oauth_state'] = state
        print(f"✅ Auth URL created: {auth_url[:100]}...")
        print(f"✅ State saved: {state[:20]}...")
        return redirect(auth_url)
    except Exception as e:
        print(f"❌ Error creating OAuth URL: {e}")
        import traceback
        traceback.print_exc()
        messages.error(request, f'Ошибка при создании OAuth URL: {str(e)}')
        return redirect('accounts:account_login')


def google_oauth_callback(request):
    """Callback от Google OAuth"""
    print(f"=== OAUTH CALLBACK DEBUG ===")
    print(f"GET params: {request.GET}")
    print(f"Session state: {request.session.get('google_oauth_state')}")
    
    # Проверяем state
    state = request.session.get('google_oauth_state')
    if not state:
        print("❌ State not found in session")
        messages.error(request, 'Ошибка авторизации: неверный state')
        return redirect('accounts:account_login')
    
    # Получаем код авторизации
    code = request.GET.get('code')
    if not code:
        print("❌ Code not found in GET params")
        messages.error(request, 'Ошибка авторизации: код не получен')
        return redirect('accounts:account_login')
    
    print(f"✅ Code received: {code[:20]}...")
    print(f"✅ State: {state[:20]}...")
    
    try:
        # Создаем временного пользователя для получения токенов
        temp_user, created = User.objects.get_or_create(
            username='temp_oauth_user',
            defaults={
                'email': 'temp@oauth.com',
                'is_active': True,
            }
        )
        
        oauth_service = GoogleOAuthService(temp_user)
        
        # Обрабатываем callback
        authorization_response = request.build_absolute_uri()
        print(f"🔄 Processing callback with URL: {authorization_response}")
        
        oauth_account = oauth_service.handle_callback(authorization_response, state)
        print(f"✅ OAuth account created: {oauth_account.id}")
        print(f"   - Access Token: {'Есть' if oauth_account.access_token else 'Нет'}")
        print(f"   - Refresh Token: {'Есть' if oauth_account.refresh_token else 'Нет'}")
        
        # Получаем данные пользователя из Google
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        
        credentials = Credentials(
            token=oauth_account.access_token,
            refresh_token=oauth_account.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            scopes=oauth_account.scopes
        )
        
        # Получаем информацию о пользователе
        service = build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()
        
        google_email = user_info.get('email')
        google_name = user_info.get('name', '')
        
        print(f"✅ User info received:")
        print(f"   - Email: {google_email}")
        print(f"   - Name: {google_name}")
        
        # Создаем или находим пользователя по email
        if google_email:
            # Сначала ищем по email
            try:
                user = User.objects.get(email=google_email)
                print(f"✅ Найден существующий пользователь: {user.username}")
            except User.DoesNotExist:
                # Создаем нового пользователя
                username = google_email.split('@')[0]
                # Проверяем, что username уникален
                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}_{counter}"
                    counter += 1
                
                user = User.objects.create(
                    username=username,
                    email=google_email,
                    first_name=google_name.split(' ')[0] if google_name else '',
                    last_name=' '.join(google_name.split(' ')[1:]) if len(google_name.split(' ')) > 1 else '',
                    is_active=True,
                )
                print(f"✅ Создан новый пользователь: {user.username}")
        else:
            # Если email не получен, создаем пользователя с временным именем
            username = f'google_user_{oauth_account.id}'
            user = User.objects.create(
                username=username,
                email=f'user_{oauth_account.id}@google.com',
                first_name=google_name.split(' ')[0] if google_name else 'Google',
                last_name=' '.join(google_name.split(' ')[1:]) if len(google_name.split(' ')) > 1 else 'User',
                is_active=True,
            )
            print(f"✅ Создан пользователь без email: {user.username}")
        
        # Переносим OAuth аккаунт на правильного пользователя
        oauth_account.user = user
        oauth_account.save()
        
        # Удаляем временного пользователя
        if temp_user.username == 'temp_oauth_user':
            temp_user.delete()
        
        # Удаляем state из сессии
        if 'google_oauth_state' in request.session:
            del request.session['google_oauth_state']
        
        # Авторизуем пользователя
        login(request, user)
        
        print(f"✅ User logged in: {user.username}")
        print(f"✅ Redirecting to dashboard")
        
        messages.success(request, f'Добро пожаловать, {user.first_name}! Google аккаунт {google_email} успешно подключен!')
        return redirect('accounts:profile')
        
    except Exception as e:
        print(f"❌ Error in callback: {e}")
        import traceback
        traceback.print_exc()
        messages.error(request, f'Ошибка при подключении Google аккаунта: {str(e)}')
        return redirect('accounts:account_login')


@login_required
def dashboard(request):
    """Главная страница Google OAuth"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    context = {
        'oauth_account': oauth_account,
        'is_connected': bool(oauth_account and oauth_account.is_token_valid()),
        'available_services': oauth_account.get_available_services() if oauth_account else [],
    }
    
    return render(request, 'google_oauth/dashboard.html', context)


@login_required
def disconnect(request):
    """Отключить Google аккаунт"""
    oauth_service = GoogleOAuthService(request.user)
    
    try:
        success = oauth_service.revoke_access()
        if success:
            messages.success(request, 'Google аккаунт успешно отключен!')
        else:
            messages.warning(request, 'Google аккаунт не был подключен.')
    except Exception as e:
        messages.error(request, f'Ошибка при отключении: {str(e)}')
    
    return redirect('google_oauth:dashboard')


@login_required
def calendar_view(request):
    """Просмотр календаря"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/calendar'):
        messages.error(request, 'Нет доступа к Google Calendar')
        return redirect('accounts:profile')
    
    # Получаем параметры для календаря
    import calendar
    
    # Получаем месяц и год из параметров или используем текущий
    year = int(request.GET.get('year', timezone.now().year))
    month = int(request.GET.get('month', timezone.now().month))
    
    # Создаем даты начала и конца месяца
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = datetime(year, month + 1, 1) - timedelta(days=1)
    
    # Получаем события за месяц из кэша через API
    calendar_service = GoogleCalendarService(oauth_service)
    events_data = calendar_service.get_events(days_ahead=100)
    
    # Фильтруем события за нужный месяц
    month_events = []
    for event_data in events_data:
        try:
            # Парсим время начала
            start_time = None
            if 'dateTime' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = start_time.astimezone(minsk_tz)
            elif 'date' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
            
            if start_time and month_start <= start_time <= month_end:
                month_events.append({
                    'id': event_data['id'],
                    'title': event_data.get('summary', 'Без названия'),
                    'start_time': start_time,
                    'location': event_data.get('location', ''),
                    'description': event_data.get('description', ''),
                })
        except Exception as e:
            print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем события по времени начала
    month_events.sort(key=lambda x: x['start_time'])
    
    # Группируем события по дням
    events_by_day = {}
    for event in month_events:
        day_key = event['start_time'].date()
        if day_key not in events_by_day:
            events_by_day[day_key] = []
        events_by_day[day_key].append(event)
    
    # Создаем календарь
    cal = calendar.monthcalendar(year, month)
    
    # Навигация по месяцам
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1
    
    # Подготавливаем данные участников для JavaScript
    import json
    attendees_data = {}
    for event in month_events:
        if 'attendees' in event:
            attendees_data[event['title']] = event['attendees']
    
    context = {
        'oauth_account': oauth_account,
        'events': month_events,
        'events_by_day': events_by_day,
        'calendar': cal,
        'year': year,
        'month': month,
        'month_name': calendar.month_name[month],
        'prev_month': prev_month,
        'prev_year': prev_year,
        'next_month': next_month,
        'next_year': next_year,
        'today': timezone.now().date(),
        'attendees_data_json': json.dumps(attendees_data),
    }
    
    return render(request, 'google_oauth/calendar.html', context)


@login_required
def drive_view(request):
    """Просмотр Google Drive"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/drive'):
        messages.error(request, 'Нет доступа к Google Drive')
        return redirect('accounts:profile')
    
    # Получаем файлы из кэша через API
    drive_service = GoogleDriveService(oauth_service)
    files_data = drive_service.get_files(max_results=50)
    
    # Преобразуем файлы в нужный формат
    files = []
    for file_data in files_data:
        try:
            modified_time = datetime.fromisoformat(file_data['modifiedTime'].replace('Z', '+00:00'))
            files.append({
                'id': file_data['id'],
                'name': file_data['name'],
                'mime_type': file_data['mimeType'],
                'size': int(file_data.get('size', 0)) if file_data.get('size') else None,
                'modified_time': modified_time,
                'web_view_link': file_data.get('webViewLink', ''),
                'web_content_link': file_data.get('webContentLink', ''),
            })
        except Exception as e:
            print(f"Ошибка обработки файла {file_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем файлы по времени изменения
    files.sort(key=lambda x: x['modified_time'], reverse=True)
    
    context = {
        'oauth_account': oauth_account,
        'files': files,
    }
    
    return render(request, 'google_oauth/drive.html', context)


@login_required
def sheets_view(request):
    """Просмотр Google Sheets"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/spreadsheets'):
        messages.error(request, 'Нет доступа к Google Sheets')
        return redirect('accounts:profile')
    
    # Получаем таблицы из кэша через API
    sheets_service = GoogleSheetsService(oauth_service)
    sheets_data = sheets_service.get_spreadsheets(max_results=50)
    
    # Преобразуем таблицы в нужный формат
    sheets = []
    for sheet_data in sheets_data:
        try:
            modified_time = datetime.fromisoformat(sheet_data['modifiedTime'].replace('Z', '+00:00'))
            sheets.append({
                'id': sheet_data['id'],
                'title': sheet_data['name'],
                'modified_time': modified_time,
                'web_view_link': sheet_data.get('webViewLink', ''),
            })
        except Exception as e:
            print(f"Ошибка обработки таблицы {sheet_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем таблицы по времени изменения
    sheets.sort(key=lambda x: x['modified_time'], reverse=True)
    
    context = {
        'oauth_account': oauth_account,
        'sheets': sheets,
    }
    
    return render(request, 'google_oauth/sheets.html', context)


@login_required
@require_POST
def sync_calendar(request):
    """Синхронизация календаря"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/calendar'):
        return JsonResponse({'success': False, 'message': 'Нет доступа к Google Calendar'})
    
    try:
        calendar_service = GoogleCalendarService(oauth_service)
        calendar_service.sync_events(oauth_account)
        
        # Обновляем время последней синхронизации
        oauth_account.last_sync_at = timezone.now()
        oauth_account.save()
        
        return JsonResponse({'success': True, 'message': 'Календарь успешно синхронизирован!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка синхронизации: {str(e)}'})

@login_required
@require_POST
def sync_drive(request):
    """Синхронизация Google Drive"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/drive'):
        return JsonResponse({'success': False, 'message': 'Нет доступа к Google Drive'})
    
    try:
        drive_service = GoogleDriveService(oauth_service)
        drive_service.sync_files(oauth_account)
        
        # Обновляем время последней синхронизации
        oauth_account.last_sync_at = timezone.now()
        oauth_account.save()
        
        return JsonResponse({'success': True, 'message': 'Google Drive успешно синхронизирован!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка синхронизации: {str(e)}'})

@login_required
@require_POST
def sync_sheets(request):
    """Синхронизация Google Sheets"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/spreadsheets'):
        return JsonResponse({'success': False, 'message': 'Нет доступа к Google Sheets'})
    
    try:
        sheets_service = GoogleSheetsService(oauth_service)
        sheets_service.sync_spreadsheets(oauth_account)
        
        # Обновляем время последней синхронизации
        oauth_account.last_sync_at = timezone.now()
        oauth_account.save()
        
        return JsonResponse({'success': True, 'message': 'Google Sheets успешно синхронизированы!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка синхронизации: {str(e)}'})

@login_required
@require_POST
def sync_all(request):
    """Синхронизация всех сервисов"""
    oauth_service = GoogleOAuthService(request.user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account:
        return JsonResponse({'success': False, 'message': 'Google аккаунт не подключен'})
    
    results = []
    
    # Синхронизируем календарь
    if oauth_account.has_scope('https://www.googleapis.com/auth/calendar'):
        try:
            calendar_service = GoogleCalendarService(oauth_service)
            calendar_service.sync_events(oauth_account)
            results.append('Календарь: ✅')
        except Exception as e:
            results.append(f'Календарь: ❌ {str(e)}')
    
    # Синхронизируем Drive
    if oauth_account.has_scope('https://www.googleapis.com/auth/drive'):
        try:
            drive_service = GoogleDriveService(oauth_service)
            drive_service.sync_files(oauth_account)
            results.append('Drive: ✅')
        except Exception as e:
            results.append(f'Drive: ❌ {str(e)}')
    
    # Синхронизируем Sheets
    if oauth_account.has_scope('https://www.googleapis.com/auth/spreadsheets'):
        try:
            sheets_service = GoogleSheetsService(oauth_service)
            sheets_service.sync_spreadsheets(oauth_account)
            results.append('Sheets: ✅')
        except Exception as e:
            results.append(f'Sheets: ❌ {str(e)}')
    
    # Обновляем время последней синхронизации
    oauth_account.last_sync_at = timezone.now()
    oauth_account.save()
    
    return JsonResponse({
        'success': True, 
        'message': 'Синхронизация завершена!',
        'results': results
    })


# Views для Google OAuth
from django.core.paginator import Paginator
from django.db.models import Q
from .models import SyncSettings, Invite, HRScreening
from .forms import SyncSettingsForm, InviteForm, InviteUpdateForm, InviteCombinedForm, HRScreeningForm, CombinedForm


@login_required
def dashboard(request):
    """Дашборд Google автоматизации"""
    user = request.user
    
    # Получаем Google OAuth аккаунт
    oauth_service = GoogleOAuthService(user)
    oauth_account = oauth_service.get_oauth_account()
    
    # Проверяем, подключен ли аккаунт (аккаунт считается подключенным, даже если токен истек)
    is_connected = oauth_account is not None
    token_valid = oauth_account.is_token_valid() if oauth_account else False
    
    # Отладочная информация
    if oauth_account:
        print(f"🔍 DEBUG: OAuth account found: {oauth_account.email}")
        print(f"🔍 DEBUG: Token valid: {oauth_account.is_token_valid()}")
        print(f"🔍 DEBUG: Token expires at: {oauth_account.token_expires_at}")
        print(f"🔍 DEBUG: Current time: {timezone.now()}")
    else:
        print("🔍 DEBUG: No OAuth account found")
    
    # Получаем данные из кэша через API
    now = timezone.now()
    future_limit = now + timedelta(days=100)  # События на ближайшие 100 дней
    
    # Инициализируем сервисы
    calendar_service = GoogleCalendarService(oauth_service)
    drive_service = GoogleDriveService(oauth_service)
    
    # Получаем события календаря
    events_data = calendar_service.get_events(days_ahead=100)
    
    # Фильтруем только будущие события
    future_events = []
    for event_data in events_data:
        try:
            # Парсим время начала и окончания
            start_time = None
            end_time = None
            
            if 'dateTime' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = start_time.astimezone(minsk_tz)
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = start_time.astimezone(minsk_tz)
            elif 'date' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
            
            if 'dateTime' in event_data['end']:
                end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                end_time = end_time.astimezone(minsk_tz)
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                end_time = end_time.astimezone(minsk_tz)
            elif 'date' in event_data['end']:
                end_time = datetime.fromisoformat(event_data['end']['date'] + 'T00:00:00+00:00')
            
            if start_time and now <= start_time <= future_limit:
                # Извлекаем участников
                attendees = []
                if 'attendees' in event_data:
                    for attendee in event_data['attendees']:
                        attendees.append({
                            'email': attendee.get('email', ''),
                            'name': attendee.get('displayName', ''),
                            'response_status': attendee.get('responseStatus', 'needsAction'),
                        })
                
                # Извлекаем ссылку на Google Meet
                meet_link = None
                if 'hangoutLink' in event_data and event_data['hangoutLink']:
                    meet_link = event_data['hangoutLink']
                elif 'conferenceData' in event_data:
                    if 'entryPoints' in event_data['conferenceData']:
                        for entry_point in event_data['conferenceData']['entryPoints']:
                            if entry_point.get('entryPointType') == 'video':
                                meet_link = entry_point.get('uri')
                                break
                
                # Извлекаем информацию о создателе
                creator_email = ''
                creator_name = ''
                if 'creator' in event_data:
                    creator_email = event_data['creator'].get('email', '')
                    creator_name = event_data['creator'].get('displayName', '')
                
                future_events.append({
                    'id': event_data['id'],
                    'title': event_data.get('summary', 'Без названия'),
                    'description': event_data.get('description', ''),
                    'start_datetime': start_time,  # Для совместимости с шаблоном
                    'end_datetime': end_time,      # Для совместимости с шаблоном
                    'start_time': start_time,      # Дублируем для обратной совместимости
                    'end_time': end_time,          # Дублируем для обратной совместимости
                    'is_all_day': 'date' in event_data['start'],
                    'all_day': 'date' in event_data['start'],  # Дублируем для обратной совместимости
                    'location': event_data.get('location', ''),
                    'status': event_data.get('status', 'confirmed'),
                    'attendees': attendees,
                    'meet_link': meet_link,
                    'creator_email': creator_email,
                    'creator_name': creator_name,
                    'calendar_id': event_data.get('calendar_id', 'primary'),
                    'html_link': event_data.get('htmlLink', ''),  # Ссылка на событие в Google Calendar
                    'google_created_at': datetime.fromisoformat(event_data['created'].replace('Z', '+00:00')) if 'created' in event_data else None,
                    'google_updated_at': datetime.fromisoformat(event_data['updated'].replace('Z', '+00:00')) if 'updated' in event_data else None,
                })
        except Exception as e:
            print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем события по времени начала
    future_events.sort(key=lambda x: x['start_time'])
    
    # Получаем файлы Drive
    files_data = drive_service.get_files(max_results=100)
    
    # Преобразуем файлы в нужный формат
    recent_files = []
    for file_data in files_data[:5]:  # Берем первые 5 файлов
        try:
            created_time = datetime.fromisoformat(file_data['createdTime'].replace('Z', '+00:00'))
            modified_time = datetime.fromisoformat(file_data['modifiedTime'].replace('Z', '+00:00')) if 'modifiedTime' in file_data else created_time
            
            # Добавляем методы для размера и типа файла
            size = file_data.get('size', 0)
            if isinstance(size, str):
                try:
                    size = int(size)
                except (ValueError, TypeError):
                    size = 0
            
            file_obj = {
                'id': file_data['id'],
                'name': file_data['name'],
                'mime_type': file_data['mimeType'],
                'created_time': created_time,
                'modified_time': modified_time,
                'web_view_link': file_data.get('webViewLink', ''),
                'is_folder': file_data['mimeType'] == 'application/vnd.google-apps.folder',
                'is_shared': file_data.get('shared', False),
                'shared_with_me': file_data.get('sharedWithMe', False),
                'size': size,
            }
            
            # Добавляем методы для отображения размера и типа
            file_obj['get_size_display'] = lambda: format_file_size(file_obj['size'])
            file_obj['get_file_type_display'] = lambda: get_file_type_display(file_obj['mime_type'])
            
            recent_files.append(file_obj)
        except Exception as e:
            print(f"Ошибка обработки файла {file_data.get('id', 'unknown')}: {e}")
            continue
    
    # Статистика
    calendar_events_count = len(future_events)
    drive_files_count = len(files_data)
    recent_events = future_events[:5]  # Берем первые 5 событий
    
    # Отладочная информация
    print(f"🔍 DEBUG: Found {calendar_events_count} upcoming events (from cache/API)")
    print(f"🔍 DEBUG: Found {drive_files_count} files (from cache/API)")
    for event in recent_events:
        print(f"🔍 DEBUG: Event: {event['title']} at {event['start_time']}")
    
    context = {
        'integration': oauth_account,  # Для совместимости
        'oauth_account': oauth_account,
        'is_connected': is_connected,
        'token_valid': token_valid,
        'total_events': calendar_events_count,  # Для совместимости с шаблоном
        'total_files': drive_files_count,  # Для совместимости с шаблоном
        'calendar_events_count': calendar_events_count,
        'drive_files_count': drive_files_count,
        'recent_events': recent_events,
        'recent_files': recent_files,
    }
    
    return render(request, 'google_oauth/dashboard.html', context)






@login_required
@require_POST
def disconnect_google(request):
    """Отключение Google интеграции"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    
    try:
        oauth_service.disconnect()
        messages.success(request, 'Google интеграция успешно отключена!')
    except Exception as e:
        messages.error(request, f'Ошибка отключения: {str(e)}')
    
    return redirect('google_oauth:dashboard')


@login_required
def calendar_events(request):
    """Список событий календаря"""
    user = request.user
    
    # Проверяем OAuth аккаунт
    oauth_service = GoogleOAuthService(user)
    integration = oauth_service.get_oauth_account()
    
    # Отладочная информация для calendar_events
    if integration:
        print(f"🔍 DEBUG CALENDAR: OAuth account found: {integration.email}")
        print(f"🔍 DEBUG CALENDAR: Token valid: {integration.is_token_valid()}")
        print(f"🔍 DEBUG CALENDAR: Token expires at: {integration.token_expires_at}")
        print(f"🔍 DEBUG CALENDAR: Current time: {timezone.now()}")
    else:
        print("🔍 DEBUG CALENDAR: No OAuth account found")
    
    # Временно отключаем проверку токена для диагностики
    if not integration:
        messages.warning(request, 'Необходимо подключить Google аккаунт для просмотра событий календаря.')
        return redirect('google_oauth:dashboard')
    
    # Проверяем токен, но не перенаправляем, если он истек
    if not integration.is_token_valid():
        print(f"🔍 DEBUG CALENDAR: Token expired, but continuing anyway for debugging")
        messages.warning(request, 'Токен Google истек. Рекомендуется переподключить аккаунт.')
    
    # Получаем события из кэша через API
    calendar_service = GoogleCalendarService(oauth_service)
    events_data = calendar_service.get_events(days_ahead=100)
    
    # Преобразуем данные API в формат для шаблона
    events = []
    for event_data in events_data:
        try:
            # Парсим время начала
            start_time = None
            if 'dateTime' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = start_time.astimezone(minsk_tz)
            elif 'date' in event_data['start']:
                start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
            
            # Парсим время окончания
            end_time = None
            if 'dateTime' in event_data['end']:
                end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
                # Конвертируем в локальный часовой пояс Minsk
                import pytz
                minsk_tz = pytz.timezone('Europe/Minsk')
                end_time = end_time.astimezone(minsk_tz)
            elif 'date' in event_data['end']:
                end_time = datetime.fromisoformat(event_data['end']['date'] + 'T23:59:59+00:00')
            
            # Извлекаем участников
            attendees = []
            if 'attendees' in event_data:
                for attendee in event_data['attendees']:
                    attendee_info = {
                        'email': attendee.get('email', ''),
                        'name': attendee.get('displayName', ''),
                        'response_status': attendee.get('responseStatus', 'needsAction'),
                        'organizer': attendee.get('organizer', False),
                    }
                    attendees.append(attendee_info)
            
            # Извлекаем ссылку на Google Meet
            meet_link = None
            # Сначала проверяем hangoutLink (более простой способ)
            if 'hangoutLink' in event_data and event_data['hangoutLink']:
                meet_link = event_data['hangoutLink']
            # Если нет hangoutLink, проверяем conferenceData
            elif 'conferenceData' in event_data:
                if 'entryPoints' in event_data['conferenceData']:
                    for entry_point in event_data['conferenceData']['entryPoints']:
                        if entry_point.get('entryPointType') == 'video':
                            meet_link = entry_point.get('uri')
                            break
            
            # Извлекаем информацию о создателе
            creator_email = None
            creator_name = None
            if 'creator' in event_data:
                creator_email = event_data['creator'].get('email')
                creator_name = event_data['creator'].get('displayName')
            
            # Создаем объект события для шаблона
            event_obj = {
                'id': event_data['id'],
                'title': event_data.get('summary', 'Без названия'),
                'description': event_data.get('description', ''),
                'start_datetime': start_time,  # Для совместимости с шаблоном
                'end_datetime': end_time,      # Для совместимости с шаблоном
                'start_time': start_time,      # Дублируем для обратной совместимости
                'end_time': end_time,          # Дублируем для обратной совместимости
                'is_all_day': 'date' in event_data['start'],
                'all_day': 'date' in event_data['start'],  # Дублируем для обратной совместимости
                'location': event_data.get('location', ''),
                'status': event_data.get('status', 'confirmed'),
                'attendees': attendees,
                'meet_link': meet_link,
                'creator_email': creator_email,
                'creator_name': creator_name,
                'calendar_id': event_data.get('calendar_id', 'primary'),
                'html_link': event_data.get('htmlLink', ''),  # Ссылка на событие в Google Calendar
                'google_created_at': datetime.fromisoformat(event_data['created'].replace('Z', '+00:00')) if 'created' in event_data else None,
                'google_updated_at': datetime.fromisoformat(event_data['updated'].replace('Z', '+00:00')) if 'updated' in event_data else None,
            }
            events.append(event_obj)
        except Exception as e:
            print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем события по времени начала
    events.sort(key=lambda x: x['start_time'] if x['start_time'] else datetime.min)
    
    # Отладочная информация
    print(f"🔍 DEBUG: Found {len(events)} total events for calendar page (from cache/API)")
    for event in events[:5]:  # Показываем первые 5 событий
        print(f"🔍 DEBUG: Event: {event['title']} at {event['start_time']}")
    
    # Поиск и фильтрация
    from .forms import CalendarEventSearchForm
    search_form = CalendarEventSearchForm(request.GET)
    if search_form.is_valid():
        search = search_form.cleaned_data.get('search')
        date_from = search_form.cleaned_data.get('date_from')
        date_to = search_form.cleaned_data.get('date_to')
        
        # Фильтруем события в памяти
        filtered_events = []
        for event in events:
            # Поиск по названию и описанию
            if search:
                if not (search.lower() in event['title'].lower() or 
                       search.lower() in event['description'].lower()):
                    continue
            
            # Фильтр по дате начала
            if date_from and event['start_time']:
                if event['start_time'].date() < date_from:
                    continue
            
            # Фильтр по дате окончания
            if date_to and event['start_time']:
                if event['start_time'].date() > date_to:
                    continue
            
            
            filtered_events.append(event)
        
        events = filtered_events
    
    # Пагинация (для списка объектов)
    from django.core.paginator import Paginator
    paginator = Paginator(events, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Получаем настройки слотов для пользователя
    slots_settings = SlotsSettings.get_or_create_for_user(user)
    print(f"🔍 DEBUG SLOTS: Настройки для пользователя {user.username}: {slots_settings.to_dict()}")
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'integration': integration,
        'total_count': len(events),
        'slots_settings': slots_settings,
    }
    
    return render(request, 'google_oauth/calendar_events.html', context)


@login_required
def drive_files(request):
    """Список файлов Google Drive"""
    user = request.user
    
    # Проверяем OAuth аккаунт
    oauth_service = GoogleOAuthService(user)
    integration = oauth_service.get_oauth_account()
    
    # Временно отключаем проверку токена для диагностики
    if not integration:
        messages.warning(request, 'Необходимо подключить Google аккаунт для просмотра файлов Drive.')
        return redirect('google_oauth:dashboard')
    
    # Проверяем токен, но не перенаправляем, если он истек
    if not integration.is_token_valid():
        print(f"🔍 DEBUG DRIVE: Token expired, but continuing anyway for debugging")
        messages.warning(request, 'Токен Google истек. Рекомендуется переподключить аккаунт.')
    
    # Получаем файлы из кэша через API
    drive_service = GoogleDriveService(oauth_service)
    files_data = drive_service.get_files(max_results=100)
    
    # Преобразуем данные API в формат для шаблона
    files = []
    for file_data in files_data:
        try:
            # Парсим даты
            created_time = datetime.fromisoformat(file_data['createdTime'].replace('Z', '+00:00'))
            modified_time = datetime.fromisoformat(file_data['modifiedTime'].replace('Z', '+00:00'))
            
            # Создаем объект файла для шаблона
            file_size = int(file_data.get('size', 0)) if file_data.get('size') else None
            file_mime_type = file_data['mimeType']
            
            file_obj = {
                'id': file_data['id'],
                'name': file_data['name'],
                'mime_type': file_mime_type,
                'size': file_size,
                'created_time': created_time,
                'modified_time': modified_time,
                'web_view_link': file_data.get('webViewLink', ''),
                'web_content_link': file_data.get('webContentLink', ''),
                'parents': file_data.get('parents', []),
                'is_folder': file_mime_type == 'application/vnd.google-apps.folder',
                'is_shared': False,  # Пока не реализовано в API
                'get_size_display': lambda: format_file_size(file_size),
                'get_file_type_display': lambda: get_file_type_display(file_mime_type),
            }
            files.append(file_obj)
        except Exception as e:
            print(f"Ошибка обработки файла {file_data.get('id', 'unknown')}: {e}")
            continue
    
    # Сортируем файлы по времени изменения
    files.sort(key=lambda x: x['modified_time'], reverse=True)
    
    # Поиск и фильтрация
    from .forms import DriveFileSearchForm
    search_form = DriveFileSearchForm(request.GET)
    if search_form.is_valid():
        search = search_form.cleaned_data.get('search')
        is_shared = search_form.cleaned_data.get('is_shared')
        shared_with_me = search_form.cleaned_data.get('shared_with_me')
        
        # Фильтруем файлы в памяти
        filtered_files = []
        for file_obj in files:
            # Поиск по названию
            if search:
                if search.lower() not in file_obj['name'].lower():
                    continue
            
            # Фильтр по общему доступу (пока не реализовано)
            if is_shared == 'true' and not file_obj['is_shared']:
                continue
            elif is_shared == 'false' and file_obj['is_shared']:
                continue
            
            # Фильтр по "поделились со мной" (пока не реализовано)
            if shared_with_me == 'true' and not file_obj.get('shared_with_me', False):
                continue
            elif shared_with_me == 'false' and file_obj.get('shared_with_me', False):
                continue
            
            filtered_files.append(file_obj)
        
        files = filtered_files
    
    # Пагинация
    paginator = Paginator(files, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'integration': integration,
    }
    
    return render(request, 'google_oauth/drive_files.html', context)


@login_required
@require_POST
def sync_calendar(request):
    """Синхронизация календаря"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/calendar'):
        return JsonResponse({'success': False, 'message': 'Нет доступа к Google Calendar'})
    
    try:
        from .services import GoogleCalendarService
        calendar_service = GoogleCalendarService(oauth_service)
        calendar_service.sync_events(oauth_account)
        
        # Обновляем время последней синхронизации
        oauth_account.last_sync_at = timezone.now()
        oauth_account.save()
        
        return JsonResponse({
            'success': True,
            'message': 'События календаря успешно синхронизированы!'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка синхронизации календаря: {str(e)}'
        })


@login_required
@require_POST
def sync_drive(request):
    """Синхронизация Google Drive"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    oauth_account = oauth_service.get_oauth_account()
    
    if not oauth_account or not oauth_account.has_scope('https://www.googleapis.com/auth/drive'):
        return JsonResponse({'success': False, 'message': 'Нет доступа к Google Drive'})
    
    try:
        from .services import GoogleDriveService
        drive_service = GoogleDriveService(oauth_service)
        drive_service.sync_files(oauth_account)
        
        # Обновляем время последней синхронизации
        oauth_account.last_sync_at = timezone.now()
        oauth_account.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Файлы Google Drive успешно синхронизированы!'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка синхронизации Drive: {str(e)}'
        })




@login_required
def test_oauth(request):
    """Страница тестирования OAuth"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    integration = oauth_service.get_oauth_account()
    
    context = {
        'integration': integration,
    }
    
    return render(request, 'google_oauth/test_oauth.html', context)


@login_required
def test_oauth_url(request):
    """API для тестирования создания OAuth URL"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    
    try:
        oauth_url = oauth_service.get_oauth_url()
        return JsonResponse({
            'success': True,
            'oauth_url': oauth_url
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })


# Views для инвайтов
@login_required
def invite_list(request):
    """Список всех инвайтов пользователя"""
    invites = Invite.objects.filter(user=request.user)
    
    # Фильтрация
    status_filter = request.GET.get('status')
    if status_filter:
        invites = invites.filter(status=status_filter)
    
    # Поиск
    search_query = request.GET.get('search')
    if search_query:
        invites = invites.filter(
            Q(candidate_name__icontains=search_query) |
            Q(vacancy_title__icontains=search_query)
        )
    
    # Пагинация
    paginator = Paginator(invites, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'status_filter': status_filter,
        'search_query': search_query,
        'status_choices': Invite.STATUS_CHOICES,
    }
    
    return render(request, 'google_oauth/invite_list.html', context)


@login_required
def invite_create(request):
    """Создание нового инвайта"""
    print(f"🔍 INVITE_CREATE: Метод запроса: {request.method}")
    print(f"🔍 INVITE_CREATE: Пользователь: {request.user}")
    
    if request.method == 'POST':
        print(f"🔍 INVITE_CREATE: POST запрос получен!")
        print(f"🔍 INVITE_CREATE: POST данные: {request.POST}")
        print(f"🔍 INVITE_CREATE: Пользователь: {request.user}")
        
        form = InviteForm(request.POST, user=request.user)
        print(f"🔍 INVITE_CREATE: Форма создана")
        
        is_valid = form.is_valid()
        print(f"🔍 INVITE_CREATE: Форма валидна: {is_valid}")
        
        if not is_valid:
            print(f"❌ INVITE_CREATE: Ошибки формы: {form.errors}")
            print(f"❌ INVITE_CREATE: Ошибки полей: {form.errors.as_data()}")
        
        if is_valid:
            try:
                print(f"🔍 INVITE_CREATE: Начинаем сохранение формы...")
                invite = form.save()
                print(f"🔍 INVITE_CREATE: Инвайт сохранен с ID: {invite.id}")
                messages.success(
                    request, 
                    f'Инвайт успешно создан! Scorecard доступен по ссылке: {invite.google_drive_file_url}'
                )
                print(f"🔍 INVITE_CREATE: Перенаправляем на детальную страницу...")
                return redirect('google_oauth:invite_detail', pk=invite.pk)
            except Exception as e:
                print(f"❌ INVITE_CREATE: Ошибка при сохранении: {e}")
                import traceback
                traceback.print_exc()
                messages.error(request, f'Ошибка создания инвайта: {str(e)}')
        else:
            print(f"❌ INVITE_CREATE: Форма не валидна, показываем ошибки")
    else:
        print(f"🔍 INVITE_CREATE: GET запрос, создаем пустую форму")
        form = InviteForm(user=request.user)
    
    # Получаем настройки структуры папок для отображения
    try:
        path_settings = ScorecardPathSettings.objects.get(user=request.user)
        path_preview = path_settings.generate_path_preview()
    except ScorecardPathSettings.DoesNotExist:
        path_preview = "Настройки структуры папок не найдены"
    
    context = {
        'form': form,
        'title': 'Создать инвайт',
        'path_preview': path_preview
    }
    
    return render(request, 'google_oauth/invite_form.html', context)


@login_required
def invite_detail(request, pk):
    """Детальная информация об инвайте"""
    invite = get_object_or_404(Invite, pk=pk, user=request.user)
    
    context = {
        'invite': invite,
    }
    
    return render(request, 'google_oauth/invite_detail.html', context)


@login_required
def invite_update(request, pk):
    """Обновление инвайта"""
    invite = get_object_or_404(Invite, pk=pk, user=request.user)
    
    if request.method == 'POST':
        form = InviteUpdateForm(request.POST, instance=invite)
        if form.is_valid():
            form.save()
            messages.success(request, 'Инвайт успешно обновлен!')
            return redirect('google_oauth:invite_detail', pk=invite.pk)
    else:
        form = InviteUpdateForm(instance=invite)
    
    context = {
        'form': form,
        'invite': invite,
        'title': _('Редактировать инвайт')
    }
    
    return render(request, 'google_oauth/invite_form.html', context)


@login_required
def invite_delete(request, pk):
    """Удаление инвайта"""
    invite = get_object_or_404(Invite, pk=pk, user=request.user)
    
    if request.method == 'POST':
        # Удаляем событие из Google Calendar перед удалением инвайта
        try:
            calendar_deleted = invite.delete_calendar_event()
            if calendar_deleted:
                print(f"✅ Событие календаря удалено для инвайта {invite.pk}")
            else:
                print(f"⚠️ Не удалось удалить событие календаря для инвайта {invite.pk}")
        except Exception as e:
            print(f"❌ Ошибка при удалении события календаря: {e}")
        
        # Удаляем инвайт
        invite.delete()
        messages.success(request, 'Инвайт успешно удален!')
        return redirect('google_oauth:invite_list')
    
    context = {
        'invite': invite,
    }
    
    return render(request, 'google_oauth/invite_confirm_delete.html', context)


@login_required
@require_POST
def invite_regenerate_scorecard(request, pk):
    """Пересоздание scorecard для инвайта"""
    invite = get_object_or_404(Invite, pk=pk, user=request.user)
    
    try:
        # Удаляем старую структуру (если есть)
        if invite.google_drive_folder_id:
            # TODO: Реализовать удаление папки из Google Drive
            pass
        
        # Создаем новую структуру
        success, message = invite.create_google_drive_structure()
        if not success:
            return JsonResponse({'success': False, 'message': message})
        
        # Обрабатываем scorecard
        success, message = invite.process_scorecard()
        if not success:
            return JsonResponse({'success': False, 'message': message})
        
        invite.save()
        
        return JsonResponse({
            'success': True, 
            'message': 'Scorecard успешно пересоздан',
            'file_url': invite.google_drive_file_url
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Ошибка: {str(e)}'})


@login_required
def invite_dashboard(request):
    """Дашборд инвайтов"""
    user = request.user
    
    # Статистика
    total_invites = Invite.objects.filter(user=user).count()
    pending_invites = Invite.objects.filter(user=user, status='pending').count()
    sent_invites = Invite.objects.filter(user=user, status='sent').count()
    completed_invites = Invite.objects.filter(user=user, status='completed').count()
    
    # Последние инвайты
    recent_invites = Invite.objects.filter(user=user).order_by('-created_at')[:5]
    
    # Предстоящие интервью
    upcoming_interviews = Invite.objects.filter(
        user=user,
        interview_datetime__gte=timezone.now(),
        status__in=['pending', 'sent']
    ).order_by('interview_datetime')[:5]
    
    context = {
        'total_invites': total_invites,
        'pending_invites': pending_invites,
        'sent_invites': sent_invites,
        'completed_invites': completed_invites,
        'recent_invites': recent_invites,
        'upcoming_interviews': upcoming_interviews,
    }
    
    return render(request, 'google_oauth/invite_dashboard.html', context)


@login_required
def check_integration(request):
    """API для проверки состояния интеграции"""
    user = request.user
    oauth_service = GoogleOAuthService(user)
    
    try:
        integration = oauth_service.get_oauth_account()
        return JsonResponse({
            'success': True,
            'connected': integration.is_token_valid if integration else False,
            'expires_at': integration.expires_at.isoformat() if integration and integration.expires_at else None
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })


@login_required
def get_event_details(request, event_id):
    """API для получения детальной информации о событии календаря"""
    user = request.user
    
    # Проверяем OAuth аккаунт
    oauth_service = GoogleOAuthService(user)
    integration = oauth_service.get_oauth_account()
    
    if not integration:
        return JsonResponse({
            'success': False,
            'message': 'Google аккаунт не подключен'
        })
    
    try:
        # Получаем события из кэша через API
        calendar_service = GoogleCalendarService(oauth_service)
        events_data = calendar_service.get_events(days_ahead=100)
        
        # Ищем нужное событие
        event_data = None
        for event in events_data:
            if event['id'] == event_id:
                event_data = event
                break
        
        if not event_data:
            return JsonResponse({
                'success': False,
                'message': 'Событие не найдено'
            })
        
        # Парсим время начала и окончания
        start_time = None
        end_time = None
        
        if 'dateTime' in event_data['start']:
            start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
        elif 'date' in event_data['start']:
            start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
        
        if 'dateTime' in event_data['end']:
            end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
        elif 'date' in event_data['end']:
            end_time = datetime.fromisoformat(event_data['end']['date'] + 'T23:59:59+00:00')
        
        # Извлекаем участников
        attendees = []
        if 'attendees' in event_data:
            for attendee in event_data['attendees']:
                attendee_info = {
                    'email': attendee.get('email', ''),
                    'name': attendee.get('displayName', ''),
                    'response_status': attendee.get('responseStatus', 'needsAction'),
                    'organizer': attendee.get('organizer', False),
                }
                attendees.append(attendee_info)
        
        # Извлекаем ссылку на Google Meet
        meet_link = None
        if 'hangoutLink' in event_data and event_data['hangoutLink']:
            meet_link = event_data['hangoutLink']
        elif 'conferenceData' in event_data:
            if 'entryPoints' in event_data['conferenceData']:
                for entry_point in event_data['conferenceData']['entryPoints']:
                    if entry_point.get('entryPointType') == 'video':
                        meet_link = entry_point.get('uri')
                        break
        
        # Извлекаем информацию о создателе
        creator_email = None
        creator_name = None
        if 'creator' in event_data:
            creator_email = event_data['creator'].get('email')
            creator_name = event_data['creator'].get('displayName')
        
        # Формируем ответ
        event_details = {
            'id': event_data['id'],
            'title': event_data.get('summary', 'Без названия'),
            'description': event_data.get('description', ''),
            'start_time': start_time.isoformat() if start_time else None,
            'end_time': end_time.isoformat() if end_time else None,
            'is_all_day': 'date' in event_data['start'],
            'location': event_data.get('location', ''),
            'status': event_data.get('status', 'confirmed'),
            'attendees': attendees,
            'meet_link': meet_link,
            'creator_email': creator_email,
            'creator_name': creator_name,
            'calendar_id': event_data.get('calendar_id', 'primary'),
            'html_link': event_data.get('htmlLink', ''),
            'created': event_data.get('created'),
            'updated': event_data.get('updated'),
        }
        
        return JsonResponse({
            'success': True,
            'event': event_details
        })
        
    except Exception as e:
        print(f"Ошибка получения деталей события {event_id}: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f'Ошибка получения деталей события: {str(e)}'
        })


@login_required
def scorecard_path_settings(request):
    """Страница настроек структуры папок для scorecard"""
    try:
        # Получаем или создаем настройки для пользователя
        settings_obj, created = ScorecardPathSettings.objects.get_or_create(
            user=request.user,
            defaults={'folder_structure': []}
        )
        
        # Если настройки только что созданы, устанавливаем структуру по умолчанию
        if created or not settings_obj.folder_structure:
            settings_obj.folder_structure = settings_obj.get_default_structure()
            settings_obj.save()
        
        # Отладка: выводим структуру папок
        print(f"🔍 DEBUG: folder_structure = {settings_obj.folder_structure}")
        
        # Получаем доступные паттерны
        available_patterns = settings_obj.get_available_patterns()
        
        # Генерируем предварительный просмотр
        path_preview = settings_obj.generate_path_preview()
        print(f"🔍 DEBUG: path_preview = {path_preview}")
        
        # Получаем информацию о вакансиях пользователя для примера
        from apps.vacancies.models import Vacancy
        user_vacancies = Vacancy.objects.filter(recruiter=request.user)[:5]
        
        # Конвертируем паттерны в JSON для JavaScript
        import json
        available_patterns_json = json.dumps(available_patterns, ensure_ascii=False)
        
        context = {
            'settings': settings_obj,
            'available_patterns': available_patterns_json,
            'path_preview': path_preview,
            'user_vacancies': user_vacancies,
        }
        
        return render(request, 'google_oauth/scorecard_path_settings.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка загрузки настроек: {str(e)}')
        return redirect('google_oauth:invite_dashboard')



@login_required
@require_POST
def api_scorecard_path_settings(request):
    """API для сохранения настроек структуры папок"""
    try:
        import json
        
        # Получаем данные из запроса
        data = json.loads(request.body)
        folder_structure = data.get('folder_structure', [])
        
        print(f"🔍 DEBUG: Received folder_structure: {folder_structure}")
        for i, item in enumerate(folder_structure):
            print(f"🔍 DEBUG: Item {i}: type={item.get('type')}, value='{item.get('value')}', isEmpty={not item.get('value') or item.get('value').strip() == ''}")
        
        # Валидация структуры
        if not isinstance(folder_structure, list):
            return JsonResponse({
                'success': False,
                'message': 'Структура папок должна быть массивом'
            })
        
        # Парсим и валидируем каждый элемент
        parsed_structure = []
        for item in folder_structure:
            if not isinstance(item, dict):
                return JsonResponse({
                    'success': False,
                    'message': 'Каждый элемент структуры должен быть объектом'
                })
            
            if 'type' not in item:
                return JsonResponse({
                    'success': False,
                    'message': 'Каждый элемент должен содержать поле "type"'
                })
            
            # Если это смешанный тип (множественные паттерны), сохраняем как есть
            if item['type'] == 'mixed':
                # Для mixed-типа сохраняем весь элемент как есть, не разбивая на части
                parsed_structure.append({
                    'type': 'mixed',
                    'value': item.get('value', ''),
                    'patterns': item.get('patterns', [])  # Сохраняем массив паттернов
                })
            else:
                # Обычная валидация для одиночных паттернов
                if item['type'] == 'text':
                    print(f"🔍 DEBUG: Validating text field: value='{item.get('value')}', hasValue={'value' in item}, isEmpty={not item.get('value') or not item.get('value').strip()}")
                    if 'value' not in item or not item['value'].strip():
                        print(f"❌ DEBUG: Text field validation failed for item: {item}")
                        return JsonResponse({
                            'success': False,
                            'message': 'Текстовые поля не могут быть пустыми'
                        })
                    
                    # Проверка на недопустимые символы в именах папок
                    value = item['value'].strip()
                    invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
                    for char in invalid_chars:
                        if char in value:
                            return JsonResponse({
                                'success': False,
                                'message': f'Недопустимый символ "{char}" в текстовом поле'
                            })
                else:
                    # Для паттернов (не text) значение может быть пустым
                    # Проверяем только, что поле value существует
                    if 'value' not in item:
                        item['value'] = ''
                
                parsed_structure.append(item)
        
        # Используем распарсенную структуру
        folder_structure = parsed_structure
        
        # Проверяем, что у нас есть хотя бы один элемент
        if not folder_structure:
            return JsonResponse({
                'success': False,
                'message': 'Структура папок не может быть пустой'
            })
        
        # Получаем или создаем настройки
        settings_obj, created = ScorecardPathSettings.objects.get_or_create(
            user=request.user,
            defaults={'folder_structure': folder_structure}
        )
        
        # Обновляем структуру
        settings_obj.folder_structure = folder_structure
        settings_obj.save()
        
        # Генерируем новый предварительный просмотр
        path_preview = settings_obj.generate_path_preview()
        
        return JsonResponse({
            'success': True,
            'message': 'Настройки сохранены успешно',
            'path_preview': path_preview
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Неверный формат JSON'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка сохранения настроек: {str(e)}'
        })


@login_required
@require_POST
def get_invitation_text(request, pk):
    """API для получения текста приглашения"""
    try:
        invite = get_object_or_404(Invite, pk=pk, user=request.user)
        
        # Генерируем текст приглашения
        invitation_text = invite.get_invitation_text()
        
        return JsonResponse({
            'success': True,
            'invitation_text': invitation_text
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка получения текста приглашения: {str(e)}'
        })


@login_required
@require_POST
def get_meetings_count(request):
    """Получает количество встреч для указанных дат из Redis кэша"""
    try:
        import json
        from datetime import datetime, timedelta
        import pytz
        
        data = json.loads(request.body)
        dates = data.get('dates', [])
        
        if not dates:
            return JsonResponse({
                'success': False,
                'message': 'Не указаны даты'
            })
        
        from apps.google_oauth.services import GoogleOAuthService
        from apps.google_oauth.cache_service import GoogleAPICache
        
        oauth_service = GoogleOAuthService(request.user)
        oauth_account = oauth_service.get_oauth_account()
        
        if not oauth_account:
            return JsonResponse({
                'success': False,
                'message': 'Google OAuth не настроен'
            })
        
        # Получаем все события из кэша
        cached_events = GoogleAPICache.get_calendar_events(
            user_id=request.user.id,
            calendar_id='primary',
            days_ahead=100
        )
        
        print(f"🔍 DEBUG: Получено {len(cached_events) if cached_events else 0} событий из кэша")
        
        if not cached_events:
            print("⚠️ Нет кэшированных событий календаря")
            # Возвращаем нули для всех дат
            meetings_count = {date_str: 0 for date_str in dates}
            return JsonResponse({
                'success': True,
                'meetings_count': meetings_count,
                'debug': 'Нет кэшированных событий'
            })
        
        meetings_count = {}
        
        # Обрабатываем каждую дату
        for date_str in dates:
            try:
                # Парсим дату (формат: DD.MM)
                day, month = date_str.split('.')
                current_year = datetime.now().year
                target_date = datetime(current_year, int(month), int(day)).date()
                
                # Подсчитываем события на эту дату
                day_events_count = 0
                for event in cached_events:
                    try:
                        # Получаем дату начала события
                        start_data = event.get('start', {})
                        if 'dateTime' in start_data:
                            # Событие с конкретным временем
                            start_time_str = start_data['dateTime']
                            if start_time_str.endswith('Z'):
                                start_time_str = start_time_str[:-1] + '+00:00'
                            event_start = datetime.fromisoformat(start_time_str)
                            # Конвертируем из UTC в локальное время
                            minsk_tz = pytz.timezone('Europe/Minsk')
                            event_start = event_start.replace(tzinfo=pytz.UTC).astimezone(minsk_tz)
                            event_date = event_start.date()
                        elif 'date' in start_data:
                            # Событие на весь день
                            event_date = datetime.fromisoformat(start_data['date']).date()
                        else:
                            continue
                        
                        # Проверяем, совпадает ли дата
                        if event_date == target_date:
                            day_events_count += 1
                            
                    except Exception as e:
                        print(f"❌ Ошибка обработки события {event.get('id', 'unknown')}: {e}")
                        continue
                
                meetings_count[date_str] = day_events_count
                print(f"📅 Дата {date_str}: {day_events_count} событий")
                
            except Exception as e:
                print(f"❌ Ошибка обработки даты {date_str}: {e}")
                meetings_count[date_str] = 0
        
        print(f"✅ Получено количество встреч из кэша: {meetings_count}")
        
        return JsonResponse({
            'success': True,
            'meetings_count': meetings_count,
            'debug': f'Обработано {len(cached_events)} событий из кэша'
        })
        
    except Exception as e:
        print(f"❌ Ошибка получения количества встреч: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка получения количества встреч: {str(e)}'
        })


@login_required
def debug_cache(request):
    """Отладочный endpoint для проверки кэша"""
    try:
        from apps.google_oauth.cache_service import GoogleAPICache
        
        cached_events = GoogleAPICache.get_calendar_events(
            user_id=request.user.id,
            calendar_id='primary',
            days_ahead=100
        )
        
        return JsonResponse({
            'success': True,
            'cached_events_count': len(cached_events) if cached_events else 0,
            'user_id': request.user.id,
            'has_oauth': bool(GoogleOAuthService(request.user).get_oauth_account())
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })


@login_required
@require_http_methods(["GET", "POST"])
def api_slots_settings(request):
    """API для получения и сохранения настроек слотов"""
    user = request.user
    
    if request.method == 'GET':
        # Получаем настройки
        settings = SlotsSettings.get_or_create_for_user(user)
        print(f"🔍 DEBUG API GET: Настройки для {user.username}: {settings.to_dict()}")
        return JsonResponse({
            'success': True,
            'settings': settings.to_dict()
        })
    
    elif request.method == 'POST':
        # Сохраняем настройки
        try:
            data = json.loads(request.body)
            print(f"🔍 DEBUG API POST: Получены данные: {data}")
            settings = SlotsSettings.get_or_create_for_user(user)
            print(f"🔍 DEBUG API POST: Текущие настройки: {settings.to_dict()}")
            
            # Обновляем поля
            settings.current_week_prefix = data.get('currentWeekPrefix', '')
            settings.next_week_prefix = data.get('nextWeekPrefix', '')
            settings.all_slots_prefix = data.get('allSlotsPrefix', '')
            settings.separator_text = data.get('separatorText', '---')
            
            print(f"🔍 DEBUG API POST: Новые настройки: {settings.to_dict()}")
            settings.save()
            print(f"🔍 DEBUG API POST: Настройки сохранены")
            
            return JsonResponse({
                'success': True,
                'message': 'Настройки слотов сохранены',
                'settings': settings.to_dict()
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Неверный JSON формат'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })


def invite_create_combined(request):
    """Создание нового инвайта с объединенной формой"""
    print(f"🔍 INVITE_CREATE_COMBINED: Метод запроса: {request.method}")
    print(f"🔍 INVITE_CREATE_COMBINED: Пользователь: {request.user}")
    
    if request.method == 'POST':
        print(f"🔍 INVITE_CREATE_COMBINED: POST запрос получен!")
        print(f"🔍 INVITE_CREATE_COMBINED: POST данные: {request.POST}")
        
        form = InviteCombinedForm(request.POST, user=request.user)
        print(f"🔍 INVITE_CREATE_COMBINED: Форма создана")
        
        is_valid = form.is_valid()
        print(f"🔍 INVITE_CREATE_COMBINED: Форма валидна: {is_valid}")
        
        if not is_valid:
            print(f"❌ INVITE_CREATE_COMBINED: Ошибки формы: {form.errors}")
            print(f"❌ INVITE_CREATE_COMBINED: Ошибки полей: {form.errors.as_data()}")
        
        if is_valid:
            print(f"✅ INVITE_CREATE_COMBINED: Форма валидна, сохраняем инвайт...")
            try:
                invite = form.save()
                print(f"✅ INVITE_CREATE_COMBINED: Инвайт сохранен с ID: {invite.id}")
                messages.success(request, f'Инвайт успешно создан! ID: {invite.id}')
                return redirect('google_oauth:invite_detail', pk=invite.id)
            except Exception as e:
                print(f"❌ INVITE_CREATE_COMBINED: Ошибка при сохранении: {e}")
                import traceback
                traceback.print_exc()
                messages.error(request, f'Ошибка при создании инвайта: {str(e)}')
        else:
            print(f"❌ INVITE_CREATE_COMBINED: Форма невалидна")
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        print(f"🔍 INVITE_CREATE_COMBINED: GET запрос, создаем пустую форму")
        form = InviteCombinedForm(user=request.user)
    
    # Получаем настройки структуры папок для отображения
    try:
        path_settings = ScorecardPathSettings.get_or_create_for_user(request.user)
        path_preview = path_settings.get_path_preview()
    except Exception as e:
        print(f"❌ INVITE_CREATE_COMBINED: Ошибка получения настроек пути: {e}")
        path_preview = "Ошибка получения настроек"
    
    context = {
        'form': form,
        'title': 'Создание инвайта (Объединенная форма)',
        'path_preview': path_preview,
    }
    
    return render(request, 'google_oauth/invite_combined_form.html', context)


@login_required
@require_POST
def get_parser_time_analysis(request, pk):
    """API для получения анализа времени от парсера"""
    try:
        invite = get_object_or_404(Invite, pk=pk, user=request.user)
        
        # Проверяем, есть ли уже проанализированное время
        if invite.gemini_suggested_datetime:
            return JsonResponse({
                'success': True,
                'suggested_datetime': invite.gemini_suggested_datetime,
                'cached': True
            })
        
        # Если нет, анализируем время
        success, message = invite.analyze_time_with_parser()
        
        if success:
            return JsonResponse({
                'success': True,
                'suggested_datetime': invite.gemini_suggested_datetime,
                'cached': False
            })
        else:
            return JsonResponse({
                'success': False,
                'error': message
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка анализа времени: {str(e)}'
        })


# Views для HR-скрининга
@login_required
def hr_screening_list(request):
    """Список HR-скринингов"""
    hr_screenings = HRScreening.objects.filter(user=request.user).order_by('-created_at')
    
    # Пагинация
    paginator = Paginator(hr_screenings, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'hr_screenings': page_obj,
    }
    
    return render(request, 'google_oauth/hr_screening_list.html', context)


@login_required
def hr_screening_create(request):
    """Создание нового HR-скрининга"""
    if request.method == 'POST':
        form = HRScreeningForm(request.POST, user=request.user)
        if form.is_valid():
            try:
                hr_screening = form.save()
                messages.success(request, 'HR-скрининг успешно создан и обработан!')
                return redirect('google_oauth:hr_screening_detail', pk=hr_screening.pk)
            except Exception as e:
                messages.error(request, f'Ошибка при создании HR-скрининга: {str(e)}')
    else:
        form = HRScreeningForm(user=request.user)
    
    context = {
        'form': form,
        'title': 'Создать HR-скрининг'
    }
    
    return render(request, 'google_oauth/hr_screening_form.html', context)


@login_required
def hr_screening_detail(request, pk):
    """Детали HR-скрининга"""
    hr_screening = get_object_or_404(HRScreening, pk=pk, user=request.user)
    
    # Парсим анализ от Gemini
    parsed_analysis = hr_screening.get_parsed_analysis()
    
    # Получаем информацию о поле "Уровень" из Huntflow
    level_field_info = None
    if hr_screening.determined_grade:
        try:
            fields_schema_success, fields_schema = hr_screening.get_candidate_fields_schema()
            if fields_schema_success and fields_schema:
                # Ищем поле "Уровень" в схеме
                for field_id, field_data in fields_schema.items():
                    if field_data.get('title') == 'Уровень':
                        # Получаем список доступных значений
                        values = field_data.get('values', [])
                        determined_grade = hr_screening.determined_grade
                        
                        # Ищем правильное значение из вариантов
                        selected_value = None
                        selected_index = None
                        if determined_grade and values:
                            grade_name_lower = determined_grade.lower()
                            
                            # Ищем точное совпадение
                            for index, value in enumerate(values):
                                if value.lower() == grade_name_lower:
                                    selected_value = value
                                    selected_index = index
                                    break
                            
                            # Если точного совпадения нет, ищем частичное
                            if not selected_value:
                                for index, value in enumerate(values):
                                    if grade_name_lower in value.lower() or value.lower() in grade_name_lower:
                                        selected_value = value
                                        selected_index = index
                                        break
                        
                        level_field_info = {
                            'field_key': field_id,  # Используем field_id вместо search_field
                            'field_title': field_data.get('title', 'Уровень'),
                            'field_id': field_id,
                            'search_field': field_data.get('search_field', 'string_field_1'),
                            'selected_value': selected_value,  # Выбранное значение из вариантов
                            'selected_index': selected_index,  # Индекс выбранного значения
                            'available_values': values  # Все доступные варианты
                        }
                        break
        except Exception as e:
            print(f"Ошибка при получении информации о поле уровня: {e}")
    
    # Получаем информацию о поле "money" из Huntflow
    money_field_info = None
    if hr_screening.extracted_salary:
        try:
            fields_schema_success, fields_schema = hr_screening.get_candidate_fields_schema()
            if fields_schema_success and fields_schema:
                # Ищем поле "money" в схеме
                for field_id, field_data in fields_schema.items():
                    if field_data.get('title') == 'Зарплата' or field_id == 'money':
                        money_field_info = {
                            'field_key': field_id,  # Используем field_id вместо 'money'
                            'field_title': field_data.get('title', 'Зарплата'),
                            'field_id': field_id,
                            'search_field': 'money'
                        }
                        break
        except Exception as e:
            print(f"Ошибка при получении информации о поле зарплаты: {e}")
    
    # Получаем реальный account_id пользователя
    account_id = hr_screening._get_user_account_id()
    
    context = {
        'hr_screening': hr_screening,
        'parsed_analysis': parsed_analysis,
        'level_field_info': level_field_info,
        'money_field_info': money_field_info,
        'account_id': account_id,
    }
    
    return render(request, 'google_oauth/hr_screening_detail.html', context)


@login_required
def hr_screening_delete(request, pk):
    """Удаление HR-скрининга"""
    hr_screening = get_object_or_404(HRScreening, pk=pk, user=request.user)
    
    if request.method == 'POST':
        hr_screening.delete()
        messages.success(request, 'HR-скрининг успешно удален!')
        return redirect('hr_screening_list')
    
    context = {
        'hr_screening': hr_screening,
    }
    
    return render(request, 'google_oauth/hr_screening_confirm_delete.html', context)


@login_required
@require_POST
def hr_screening_retry_analysis(request, pk):
    """Повторный анализ HR-скрининга с помощью Gemini"""
    hr_screening = get_object_or_404(HRScreening, pk=pk, user=request.user)
    
    try:
        success, message = hr_screening.analyze_with_gemini()
        
        if success:
            return JsonResponse({
                'success': True,
                'message': 'Анализ успешно выполнен',
                'analysis': hr_screening.gemini_analysis
            })
        else:
            return JsonResponse({
                'success': False,
                'error': message
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка анализа: {str(e)}'
        })


@login_required
def gdata_automation(request):
    """Страница G-данных и автоматизации с выбором вакансии"""
    from apps.vacancies.models import Vacancy
    from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
    from apps.google_oauth.cache_service import GoogleAPICache
    import json
    from datetime import datetime, timedelta
    import pytz
    
    # Получаем все активные вакансии
    active_vacancies = Vacancy.objects.filter(is_active=True).order_by('name')
    
    # Получаем выбранную вакансию из параметров
    selected_vacancy_id = request.GET.get('vacancy_id')
    selected_vacancy = None
    
    if selected_vacancy_id:
        try:
            selected_vacancy = Vacancy.objects.get(id=selected_vacancy_id, is_active=True)
        except Vacancy.DoesNotExist:
            messages.warning(request, 'Выбранная вакансия не найдена')
    
    # Если вакансия не выбрана, берем первую активную
    if not selected_vacancy and active_vacancies.exists():
        selected_vacancy = active_vacancies.first()
    
    # Получаем данные о событиях календаря для JavaScript (как на странице календаря)
    calendar_events_data = []
    try:
        oauth_service = GoogleOAuthService(request.user)
        oauth_account = oauth_service.get_oauth_account()
        
        if oauth_account:
            # Получаем события через GoogleCalendarService (как на странице календаря)
            calendar_service = GoogleCalendarService(oauth_service)
            events_data = calendar_service.get_events(days_ahead=14)
            
            print(f"🔍 DEBUG G-DATA: Получено {len(events_data)} событий из API")
            
            if events_data:
                # Преобразуем данные API в формат для JavaScript (как на странице календаря)
                for event_data in events_data:
                    try:
                        # Парсим время начала
                        start_time = None
                        if 'dateTime' in event_data['start']:
                            start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                            # Конвертируем в локальный часовой пояс Minsk
                            import pytz
                            minsk_tz = pytz.timezone('Europe/Minsk')
                            start_time = start_time.astimezone(minsk_tz)
                        elif 'date' in event_data['start']:
                            start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
                        
                        # Парсим время окончания
                        end_time = None
                        if 'dateTime' in event_data['end']:
                            end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
                            end_time = end_time.astimezone(minsk_tz)
                        elif 'date' in event_data['end']:
                            end_time = datetime.fromisoformat(event_data['end']['date'] + 'T23:59:59+00:00')
                        
                        if start_time:
                            # Очищаем description от HTML-тегов для безопасного использования в JavaScript
                            description = event_data.get('description', '')
                            if description:
                                import re
                                # Удаляем HTML-теги
                                description = re.sub(r'<[^>]+>', '', description)
                                # Заменяем кавычки на безопасные символы
                                description = description.replace('"', "'").replace("'", "'")
                            
                            calendar_events_data.append({
                                'id': event_data['id'],
                                'title': event_data.get('summary', 'Без названия'),
                                'start': start_time.isoformat(),
                                'end': end_time.isoformat() if end_time else start_time.isoformat(),
                                'is_all_day': 'date' in event_data['start'],
                                'location': event_data.get('location', ''),
                                'description': description,
                            })
                    except Exception as e:
                        print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
                        continue
    except Exception as e:
        print(f"Ошибка получения данных о событиях: {e}")
    
    # Получаем настройки слотов для пользователя
    slots_settings = SlotsSettings.get_or_create_for_user(request.user)
    print(f"🔍 DEBUG G-DATA: Настройки слотов для пользователя {request.user.username}: {slots_settings.to_dict()}")
    
    context = {
        'active_vacancies': active_vacancies,
        'selected_vacancy': selected_vacancy,
        'calendar_events_data': calendar_events_data,
        'slots_settings': slots_settings,
        'title': 'G-данные и автоматизация'
    }
    
    # Отладочная информация
    print(f"🔍 DEBUG G-DATA: Передаем {len(calendar_events_data)} событий в шаблон")
    for event in calendar_events_data[:3]:  # Показываем первые 3 события
        print(f"🔍 DEBUG G-DATA: Событие: {event['title']} в {event['start']}")
    
    return render(request, 'google_oauth/gdata_automation.html', context)


@login_required
@require_http_methods(["GET"])
def api_calendar_events(request):
    """API для получения событий календаря в JSON формате"""
    try:
        from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
        from apps.google_oauth.cache_service import GoogleAPICache
        import json
        from datetime import datetime, timedelta
        import pytz
        import re
        
        # Получаем OAuth аккаунт
        oauth_service = GoogleOAuthService(request.user)
        oauth_account = oauth_service.get_oauth_account()
        
        if not oauth_account:
            return JsonResponse({
                'success': False, 
                'message': 'Google OAuth аккаунт не подключен'
            })
        
        # Получаем события через GoogleCalendarService
        calendar_service = GoogleCalendarService(oauth_service)
        events_data = calendar_service.get_events(days_ahead=14)
        
        print(f"🔍 API CALENDAR EVENTS: Получено {len(events_data)} событий из API")
        
        # Преобразуем данные API в формат для JavaScript
        calendar_events_data = []
        for event_data in events_data:
            try:
                # Парсим время начала
                start_time = None
                if 'dateTime' in event_data['start']:
                    start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                    # Конвертируем в локальный часовой пояс Minsk
                    minsk_tz = pytz.timezone('Europe/Minsk')
                    start_time = start_time.astimezone(minsk_tz)
                elif 'date' in event_data['start']:
                    start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
                
                # Парсим время окончания
                end_time = None
                if 'dateTime' in event_data['end']:
                    end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
                    end_time = end_time.astimezone(minsk_tz)
                elif 'date' in event_data['end']:
                    end_time = datetime.fromisoformat(event_data['end']['date'] + 'T23:59:59+00:00')
                
                if start_time:
                    # Очищаем description от HTML-тегов для безопасного использования в JavaScript
                    description = event_data.get('description', '')
                    if description:
                        # Удаляем HTML-теги
                        description = re.sub(r'<[^>]+>', '', description)
                        # Заменяем кавычки на безопасные символы
                        description = description.replace('"', "'").replace("'", "'")
                    
                    calendar_events_data.append({
                        'id': event_data['id'],
                        'title': event_data.get('summary', 'Без названия'),
                        'start': start_time.isoformat(),
                        'end': end_time.isoformat() if end_time else start_time.isoformat(),
                        'is_all_day': 'date' in event_data['start'],
                        'location': event_data.get('location', ''),
                        'description': description,
                    })
            except Exception as e:
                print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
                continue
        
        print(f"🔍 API CALENDAR EVENTS: Передаем {len(calendar_events_data)} событий в ответе")
        
        return JsonResponse({
            'success': True,
            'events': calendar_events_data,
            'count': len(calendar_events_data)
        })
        
    except Exception as e:
        print(f"❌ API CALENDAR EVENTS: Ошибка получения событий: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f'Ошибка получения событий: {str(e)}'
        })


@login_required
def combined_workflow(request):
    """Объединенная страница для HR-скрининга и инвайтов"""
    print(f"🔍 COMBINED_WORKFLOW: Метод запроса: {request.method}")
    print(f"🔍 COMBINED_WORKFLOW: Пользователь: {request.user}")
    
    if request.method == 'POST':
        print(f"🔍 COMBINED_WORKFLOW: POST запрос получен!")
        print(f"🔍 COMBINED_WORKFLOW: POST данные: {request.POST}")
        
        form = CombinedForm(request.POST, user=request.user)
        print(f"🔍 COMBINED_WORKFLOW: Форма создана")
        
        is_valid = form.is_valid()
        print(f"🔍 COMBINED_WORKFLOW: Форма валидна: {is_valid}")
        
        if not is_valid:
            print(f"❌ COMBINED_WORKFLOW: Ошибки формы: {form.errors}")
            print(f"❌ COMBINED_WORKFLOW: Ошибки полей: {form.errors.as_data()}")
        
        if is_valid:
            print(f"✅ COMBINED_WORKFLOW: Форма валидна, обрабатываем...")
            try:
                combined_data = form.cleaned_data['combined_data']
                action_type = form.determine_action_type()
                
                print(f"🔍 COMBINED_WORKFLOW: Автоматически определен тип действия: {action_type}")
                
                hr_screening = None
                invite = None
                
                # Создаем HR-скрининг если нужно - используем существующую форму
                if action_type in ['hr_screening', 'both']:
                    print(f"🔍 COMBINED_WORKFLOW: Создаем HR-скрининг через HRScreeningForm...")
                    
                    # Создаем данные для HRScreeningForm
                    hr_form_data = {'input_data': combined_data}
                    hr_form = HRScreeningForm(hr_form_data, user=request.user)
                    
                    if hr_form.is_valid():
                        hr_screening = hr_form.save()
                        print(f"✅ COMBINED_WORKFLOW: HR-скрининг создан с ID: {hr_screening.id}")
                    else:
                        print(f"❌ COMBINED_WORKFLOW: Ошибки HR-скрининга: {hr_form.errors}")
                        raise forms.ValidationError(f'Ошибка создания HR-скрининга: {hr_form.errors}')
                
                # Создаем инвайт если нужно - используем InviteCombinedForm (полная функциональность)
                if action_type in ['invite', 'both']:
                    print(f"🔍 COMBINED_WORKFLOW: Создаем инвайт через InviteCombinedForm...")
                    
                    # Создаем данные для InviteCombinedForm
                    invite_form_data = {'combined_data': combined_data}
                    invite_form = InviteCombinedForm(invite_form_data, user=request.user)
                    
                    if invite_form.is_valid():
                        invite = invite_form.save()
                        print(f"✅ COMBINED_WORKFLOW: Инвайт создан с ID: {invite.id}")
                    else:
                        print(f"❌ COMBINED_WORKFLOW: Ошибки инвайта: {invite_form.errors}")
                        raise forms.ValidationError(f'Ошибка создания инвайта: {invite_form.errors}')
                
                # Формируем сообщение об успехе
                success_messages = []
                if hr_screening:
                    success_messages.append(f'HR-скрининг создан (ID: {hr_screening.id})')
                if invite:
                    success_messages.append(f'Инвайт создан (ID: {invite.id})')
                
                messages.success(request, ' | '.join(success_messages))
                
                # Перенаправляем на соответствующую страницу
                if action_type == 'hr_screening' and hr_screening:
                    return redirect('google_oauth:hr_screening_detail', pk=hr_screening.pk)
                elif action_type == 'invite' and invite:
                    return redirect('google_oauth:invite_detail', pk=invite.pk)
                elif action_type == 'both':
                    # Если созданы оба, перенаправляем на HR-скрининг
                    if hr_screening:
                        return redirect('google_oauth:hr_screening_detail', pk=hr_screening.pk)
                    elif invite:
                        return redirect('google_oauth:invite_detail', pk=invite.pk)
                
            except Exception as e:
                print(f"❌ COMBINED_WORKFLOW: Ошибка при обработке: {e}")
                import traceback
                traceback.print_exc()
                messages.error(request, f'Ошибка при обработке: {str(e)}')
        else:
            print(f"❌ COMBINED_WORKFLOW: Форма невалидна")
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        print(f"🔍 COMBINED_WORKFLOW: GET запрос, создаем пустую форму")
        form = CombinedForm(user=request.user)
    
    # Получаем настройки структуры папок для отображения
    try:
        from apps.google_oauth.models import ScorecardPathSettings
        path_settings = ScorecardPathSettings.get_or_create_for_user(request.user)
        path_preview = path_settings.get_path_preview()
    except Exception as e:
        print(f"❌ COMBINED_WORKFLOW: Ошибка получения настроек пути: {e}")
        path_preview = "Ошибка получения настроек"
    
    context = {
        'form': form,
        'title': 'Объединенный рабочий процесс',
        'path_preview': path_preview,
    }
    
    return render(request, 'google_oauth/combined_workflow.html', context)


@login_required
def chat_workflow(request, session_id=None):
    """Чат-воркфлоу для HR-скрининга и инвайтов"""
    from .models import ChatSession, ChatMessage
    from .forms import ChatForm, HRScreeningForm, InviteCombinedForm

    # Получаем или создаем сессию чата
    if session_id:
        try:
            chat_session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            # Если указанная сессия не найдена, берем последнюю сессию пользователя
            chat_session = ChatSession.objects.filter(user=request.user).order_by('-updated_at').first()
            if not chat_session:
                chat_session = ChatSession.objects.create(user=request.user)
    else:
        # Если session_id не указан, берем последнюю сессию пользователя
        chat_session = ChatSession.objects.filter(user=request.user).order_by('-updated_at').first()
        if not chat_session:
            chat_session = ChatSession.objects.create(user=request.user)

    # Получаем все сообщения в этой сессии
    messages = chat_session.messages.all().order_by('created_at')
    form = ChatForm(user=request.user)

    if request.method == 'POST':
        form = ChatForm(request.POST, user=request.user)
        if form.is_valid():
            message_text = form.cleaned_data['message']
            
            # Сохраняем пользовательское сообщение
            user_message = ChatMessage.objects.create(
                session=chat_session,
                message_type='user',
                content=message_text
            )

            # Определяем тип действия
            action_type = determine_action_type_from_text(message_text)
            print(f"🔍 CHAT: Определен тип действия: {action_type}")

            try:
                if action_type == 'hr_screening':
                    # Создаем HR-скрининг с ПРАВИЛЬНЫМИ данными
                    hr_form = HRScreeningForm({'input_data': message_text}, user=request.user)
                    
                    if hr_form.is_valid():
                        try:
                            hr_screening = hr_form.save()
                            
                            response_content = f"""**Кандидат:** {hr_screening.candidate_name or 'Не указан'}
**Вакансия:** {hr_screening.vacancy_title or 'Не указана'}
**Зарплата:** {hr_screening.extracted_salary or 'Не указана'} {hr_screening.salary_currency if hr_screening.extracted_salary else ''} {'' if hr_screening.extracted_salary else ''} | **Уровень:** {hr_screening.determined_grade or 'Не определен'}

✅ **Данные сохранены и переданы в Huntflow**"""
                            
                            ChatMessage.objects.create(
                                session=chat_session,
                                message_type='hr_screening',
                                content=response_content,
                                hr_screening=hr_screening,
                                metadata={
                                    'action_type': 'hr_screening',
                                    'hr_screening_id': hr_screening.id,
                                    'candidate_name': hr_screening.candidate_name,
                                    'vacancy_name': hr_screening.vacancy_title,
                                    'determined_grade': hr_screening.determined_grade,
                                    'candidate_url': hr_screening.candidate_url
                                }
                            )
                        except Exception as e:
                            print(f"🔍 CHAT: Ошибка сохранения HR: {str(e)}")
                            ChatMessage.objects.create(
                                session=chat_session,
                                message_type='system',
                                content=f"Ошибка при обработке HR-скрининга: {str(e)}"
                            )
                    else:
                        # Ошибки валидации
                        error_content = "Ошибка при обработке HR-скрининга:\n"
                        for field, errors in hr_form.errors.items():
                            error_content += f"- {field}: {', '.join(errors)}\n"
                        
                        ChatMessage.objects.create(
                            session=chat_session,
                            message_type='system',
                            content=error_content
                        )

                elif action_type == 'invite':
                    # Создаем инвайт с ПРАВИЛЬНЫМИ данными
                    invite_form = InviteCombinedForm({'combined_data': message_text}, user=request.user)
                    
                    if invite_form.is_valid():
                        try:
                            invite = invite_form.save()
                            
                            response_content = f"""**Инвайт создан**

**Кандидат:** {invite.candidate_name or 'Не указан'}
**Вакансия:** {invite.vacancy_title or 'Не указана'}
**Уровень:** {invite.candidate_grade or 'Не определен'}
**Scorecard:** {invite.google_drive_file_url or 'Создается...'}
**Дата интервью:** {invite.interview_datetime.strftime('%d.%m.%Y %H:%M') if invite.interview_datetime else 'Не указана'}
**Google Meet:** {invite.google_meet_url or 'Будет создана'}

✅ **Инвайт отправлен и добавлен в календарь**"""
                            
                            ChatMessage.objects.create(
                                session=chat_session,
                                message_type='invite',
                                content=response_content,
                                invite=invite,
                                metadata={
                                    'action_type': 'invite',
                                    'invite_id': invite.id,
                                    'candidate_name': invite.candidate_name,
                                    'vacancy_name': invite.vacancy_title,
                                    'determined_grade': invite.candidate_grade,
                                    'interview_datetime': invite.interview_datetime.isoformat() if invite.interview_datetime else None,
                                    'candidate_url': invite.candidate_url
                                }
                            )
                        except Exception as e:
                            print(f"🔍 CHAT: Ошибка сохранения инвайта: {str(e)}")
                            ChatMessage.objects.create(
                                session=chat_session,
                                message_type='system',
                                content=f"Ошибка при обработке инвайта: {str(e)}"
                            )
                    else:
                        # Ошибки валидации
                        error_content = "Ошибка при обработке инвайта:\n"
                        for field, errors in invite_form.errors.items():
                            error_content += f"- {field}: {', '.join(errors)}\n"
                        
                        ChatMessage.objects.create(
                            session=chat_session,
                            message_type='system',
                            content=error_content
                        )

            except Exception as e:
                print(f"🔍 CHAT: Критическая ошибка: {str(e)}")
                import traceback
                traceback.print_exc()
                ChatMessage.objects.create(
                    session=chat_session,
                    message_type='system',
                    content=f"Ошибка при обработке: {str(e)}"
                )

            # Обновляем время сессии и перенаправляем
            chat_session.save()
            return redirect('google_oauth:chat_workflow_session', session_id=chat_session.id)

    print(f"🔍 DEBUG CHAT: Функция chat_workflow выполняется для пользователя: {request.user.username}")
    
    # Получаем все сессии пользователя для боковой панели
    all_sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')[:20]
    
    # Получаем все активные вакансии для выбора
    from apps.vacancies.models import Vacancy
    active_vacancies = Vacancy.objects.filter(is_active=True).order_by('name')
    
    # Получаем выбранную вакансию из параметров
    selected_vacancy_id = request.GET.get('vacancy_id')
    selected_vacancy = None
    
    if selected_vacancy_id:
        try:
            selected_vacancy = Vacancy.objects.get(id=selected_vacancy_id, is_active=True)
        except Vacancy.DoesNotExist:
            messages.warning(request, 'Выбранная вакансия не найдена')
    
    # Если вакансия не выбрана, берем первую активную
    if not selected_vacancy and active_vacancies.exists():
        selected_vacancy = active_vacancies.first()
    
    # Получаем данные о событиях календаря для JavaScript (как на странице gdata_automation)
    calendar_events_data = []
    try:
        from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
        import json
        from datetime import datetime, timedelta
        import pytz
        
        print(f"🔍 DEBUG CHAT: Получение событий для пользователя: {request.user.username}")
        oauth_service = GoogleOAuthService(request.user)
        oauth_account = oauth_service.get_oauth_account()
        
        if oauth_account:
            # Получаем события через GoogleCalendarService (как на странице gdata_automation)
            calendar_service = GoogleCalendarService(oauth_service)
            events_data = calendar_service.get_events(days_ahead=14)
            
            print(f"🔍 DEBUG CHAT: Получено {len(events_data)} событий из API")
            
            if events_data:
                # Преобразуем данные API в формат для JavaScript (как на странице gdata_automation)
                for event_data in events_data:
                    try:
                        # Парсим время начала
                        start_time = None
                        if 'dateTime' in event_data['start']:
                            start_time = datetime.fromisoformat(event_data['start']['dateTime'].replace('Z', '+00:00'))
                            # Конвертируем в локальный часовой пояс Minsk
                            import pytz
                            minsk_tz = pytz.timezone('Europe/Minsk')
                            start_time = start_time.astimezone(minsk_tz)
                        elif 'date' in event_data['start']:
                            start_time = datetime.fromisoformat(event_data['start']['date'] + 'T00:00:00+00:00')
                        
                        # Парсим время окончания
                        end_time = None
                        if 'dateTime' in event_data['end']:
                            end_time = datetime.fromisoformat(event_data['end']['dateTime'].replace('Z', '+00:00'))
                            end_time = end_time.astimezone(minsk_tz)
                        elif 'date' in event_data['end']:
                            end_time = datetime.fromisoformat(event_data['end']['date'] + 'T23:59:59+00:00')
                        
                        if start_time:
                            # Очищаем description от HTML-тегов для безопасного использования в JavaScript
                            description = event_data.get('description', '')
                            if description:
                                import re
                                # Удаляем HTML-теги
                                description = re.sub(r'<[^>]+>', '', description)
                                # Заменяем кавычки на безопасные символы
                                description = description.replace('"', "'").replace("'", "'")
                            
                            calendar_events_data.append({
                                'id': event_data['id'],
                                'title': event_data.get('summary', 'Без названия'),
                                'start': start_time.isoformat(),
                                'end': end_time.isoformat() if end_time else start_time.isoformat(),
                                'is_all_day': 'date' in event_data['start'],
                                'location': event_data.get('location', ''),
                                'description': description,
                            })
                    except Exception as e:
                        print(f"Ошибка обработки события {event_data.get('id', 'unknown')}: {e}")
                        continue
    except Exception as e:
        print(f"Ошибка получения данных о событиях: {e}")
    
    # Получаем настройки слотов для пользователя
    from apps.google_oauth.models import SlotsSettings
    slots_settings = SlotsSettings.get_or_create_for_user(request.user)
    
    context = {
        'form': form,
        'chat_session': chat_session,
        'messages': messages,
        'all_sessions': all_sessions,
        'active_vacancies': active_vacancies,
        'selected_vacancy': selected_vacancy,
        'calendar_events_data': calendar_events_data,
        'slots_settings': slots_settings,
        'title': 'Чат-помощник',
    }

    # Отладочная информация (как на странице gdata_automation)
    print(f"🔍 DEBUG CHAT: Передаем {len(calendar_events_data)} событий в шаблон")
    for event in calendar_events_data[:3]:  # Показываем первые 3 события
        print(f"🔍 DEBUG CHAT: Событие: {event['title']} в {event['start']}")

    return render(request, 'google_oauth/chat_workflow.html', context)

