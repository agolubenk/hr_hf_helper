import os
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .models import GoogleOAuthAccount
from .cache_service import GoogleAPICache


class GoogleOAuthService:
    """Сервис для работы с Google OAuth и API"""
    
    # Области доступа для Google API
    SCOPES = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
    ]
    
    def __init__(self, user):
        self.user = user
        self.credentials = None
    
    def get_oauth_account(self):
        """Получить Google OAuth аккаунт пользователя"""
        try:
            return GoogleOAuthAccount.objects.get(user=self.user)
        except GoogleOAuthAccount.DoesNotExist:
            return None
    
    def create_oauth_flow(self):
        """Создать OAuth flow для авторизации"""
        # Используем все доступные redirect URIs
        redirect_uris = getattr(settings, 'GOOGLE_OAUTH_REDIRECT_URIS', [settings.GOOGLE_OAUTH_REDIRECT_URI])
        
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": redirect_uris
            }
        }
        
        flow = Flow.from_client_config(
            client_config,
            scopes=self.SCOPES,
            redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI
        )
        
        # Отключаем проверку HTTPS для разработки
        import os
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        
        return flow
    
    def get_authorization_url(self):
        """Получить URL для авторизации"""
        flow = self.create_oauth_flow()
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return auth_url, state
    
    def handle_callback(self, authorization_response, state):
        """Обработать callback от Google OAuth"""
        flow = self.create_oauth_flow()
        
        # Получаем токены, игнорируем предупреждения о scopes
        import warnings
        import logging
        
        # Отключаем предупреждения о scopes
        warnings.filterwarnings("ignore", message="Scope has changed")
        logging.getLogger('oauthlib').setLevel(logging.ERROR)
        
        try:
            flow.fetch_token(authorization_response=authorization_response)
            credentials = flow.credentials
        except Exception as e:
            # Если ошибка связана с scopes, пробуем без проверки
            if "Scope has changed" in str(e):
                print(f"⚠️ Scope warning ignored: {e}")
                # Создаем credentials вручную из response
                from urllib.parse import parse_qs, urlparse
                parsed_url = urlparse(authorization_response)
                query_params = parse_qs(parsed_url.query)
                
                # Получаем токены из callback
                code = query_params.get('code', [None])[0]
                if code:
                    # Создаем новый flow для получения токенов
                    flow = self.create_oauth_flow()
                    flow.fetch_token(code=code)
                    credentials = flow.credentials
                else:
                    raise e
            else:
                raise e
        
        # Получаем информацию о пользователе
        user_info = self._get_user_info(credentials)
        
        # Создаем или обновляем аккаунт
        oauth_account, created = GoogleOAuthAccount.objects.get_or_create(
            user=self.user,
            defaults={
                'google_id': user_info['id'],
                'email': user_info['email'],
                'name': user_info['name'],
                'picture_url': user_info.get('picture', ''),
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expires_at': timezone.now() + timedelta(seconds=credentials.expires_in),
                'scopes': credentials.scopes,
            }
        )
        
        if not created:
            # Обновляем существующий аккаунт
            oauth_account.google_id = user_info['id']
            oauth_account.email = user_info['email']
            oauth_account.name = user_info['name']
            oauth_account.picture_url = user_info.get('picture', '')
            oauth_account.access_token = credentials.token
            oauth_account.refresh_token = credentials.refresh_token
            oauth_account.token_expires_at = timezone.now() + timedelta(seconds=credentials.expires_in)
            oauth_account.scopes = credentials.scopes
            oauth_account.save()
        
        return oauth_account
    
    def _get_user_info(self, credentials):
        """Получить информацию о пользователе"""
        service = build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()
        return user_info
    
    def get_credentials(self):
        """Получить действительные credentials"""
        oauth_account = self.get_oauth_account()
        if not oauth_account:
            return None
        
        # Проверяем, нужно ли обновить токен
        if oauth_account.needs_refresh() and oauth_account.refresh_token:
            self._refresh_token(oauth_account)
        
        # Создаем credentials
        self.credentials = Credentials(
            token=oauth_account.access_token,
            refresh_token=oauth_account.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            scopes=oauth_account.scopes
        )
        
        return self.credentials
    
    def _refresh_token(self, oauth_account):
        """Обновить токен доступа"""
        credentials = Credentials(
            token=oauth_account.access_token,
            refresh_token=oauth_account.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            scopes=oauth_account.scopes
        )
        
        # Обновляем токен
        credentials.refresh(Request())
        
        # Сохраняем новый токен
        oauth_account.access_token = credentials.token
        # Google access token обычно действителен 1 час (3600 секунд)
        oauth_account.token_expires_at = timezone.now() + timedelta(seconds=3600)
        oauth_account.save()
    
    def revoke_access(self):
        """Отозвать доступ к Google аккаунту"""
        oauth_account = self.get_oauth_account()
        if not oauth_account:
            return False
        
        try:
            credentials = Credentials(token=oauth_account.access_token)
            credentials.revoke(Request())
        except:
            pass  # Игнорируем ошибки при отзыве
        
        # Удаляем аккаунт
        oauth_account.delete()
        return True


class GoogleCalendarService:
    """Сервис для работы с Google Calendar"""
    
    def __init__(self, oauth_service):
        self.oauth_service = oauth_service
        self.service = None
    
    def _get_service(self):
        """Получить сервис Google Calendar"""
        if not self.service:
            credentials = self.oauth_service.get_credentials()
            if not credentials:
                return None
            
            self.service = build('calendar', 'v3', credentials=credentials)
        
        return self.service
    
    def get_calendars(self):
        """Получить список календарей"""
        service = self._get_service()
        if not service:
            return []
        
        try:
            calendar_list = service.calendarList().list().execute()
            return calendar_list.get('items', [])
        except HttpError as e:
            print(f"Ошибка получения календарей: {e}")
            return []
    
    def get_calendar_public_link(self, calendar_id='primary'):
        """Получить публичную ссылку на календарь"""
        service = self._get_service()
        if not service:
            return None
        
        try:
            # Получаем информацию о календаре
            calendar = service.calendars().get(calendarId=calendar_id).execute()
            
            # Проверяем, есть ли публичная ссылка
            if 'id' in calendar:
                # Формируем публичную ссылку на календарь
                public_link = f"https://calendar.google.com/calendar/embed?src={calendar['id']}"
                return public_link
            
            return None
        except HttpError as e:
            print(f"Ошибка получения публичной ссылки на календарь: {e}")
            return None
    
    def get_calendar_by_email(self, email):
        """Найти календарь по email адресу"""
        service = self._get_service()
        if not service:
            return None
        
        try:
            # Получаем список всех календарей
            calendar_list = service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])
            
            # Ищем календарь с нужным email
            for calendar in calendars:
                if calendar.get('id') == email:
                    return calendar
            
            return None
        except HttpError as e:
            print(f"Ошибка поиска календаря по email: {e}")
            return None
    
    def get_events(self, calendar_id='primary', max_results=100, days_ahead=100):
        """Получить события календаря (ближайшие события на указанное количество дней вперед)"""
        # Сначала проверяем кэш
        user_id = self.oauth_service.user.id
        cached_events = GoogleAPICache.get_calendar_events(user_id, calendar_id, days_ahead)
        
        if cached_events is not None:
            print(f"📦 Получены события календаря из кэша: {len(cached_events)} событий")
            return cached_events
        
        # Если в кэше нет, получаем из API
        service = self._get_service()
        if not service:
            return []
        
        try:
            from datetime import timedelta
            
            # Время начала - сейчас
            now = datetime.utcnow()
            time_min = now.isoformat() + 'Z'
            
            # Время окончания - через указанное количество дней
            time_max = (now + timedelta(days=days_ahead)).isoformat() + 'Z'
            
            events_result = service.events().list(
                calendarId=calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            # Получаем полную информацию о каждом событии
            events = []
            for event in events_result.get('items', []):
                try:
                    # Запрашиваем полную информацию о событии
                    full_event = service.events().get(
                        calendarId=calendar_id,
                        eventId=event['id']
                    ).execute()
                    events.append(full_event)
                except Exception as e:
                    print(f"Ошибка получения полной информации о событии {event.get('id', 'unknown')}: {e}")
                    # Если не удалось получить полную информацию, используем базовую
                    events.append(event)
            
            # Сохраняем в кэш
            GoogleAPICache.set_calendar_events(user_id, events, calendar_id, days_ahead)
            print(f"💾 Сохранены события календаря в кэш: {len(events)} событий")
            
            return events
        except HttpError as e:
            print(f"Ошибка получения событий: {e}")
            return []
    
    def create_event(self, title, start_time, end_time, description='', location='', attendees=None, calendar_id='primary'):
        """
        Создает событие в Google Calendar
        
        Args:
            title: Название события
            start_time: Время начала (datetime объект)
            end_time: Время окончания (datetime объект)
            description: Описание события
            location: Местоположение
            attendees: Список email адресов участников
            calendar_id: ID календаря (по умолчанию 'primary')
            
        Returns:
            Созданное событие или None в случае ошибки
        """
        service = self._get_service()
        if not service:
            return None
        
        try:
            from django.utils import timezone
            import pytz
            
            # Форматируем время для Google Calendar API
            if start_time.tzinfo is None:
                # Если время без timezone, считаем его в часовом поясе Minsk
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = minsk_tz.localize(start_time)
                end_time = minsk_tz.localize(end_time)
                print(f"🔍 Время без timezone, локализовано в Minsk: {start_time}")
            else:
                print(f"🔍 Время с timezone: {start_time}")
            
            # Конвертируем в UTC для Google Calendar API
            start_time_utc = start_time.astimezone(pytz.UTC)
            end_time_utc = end_time.astimezone(pytz.UTC)
            
            # Форматируем для API (без 'Z' в конце, так как указываем timeZone отдельно)
            start_time_str = start_time_utc.strftime('%Y-%m-%dT%H:%M:%S')
            end_time_str = end_time_utc.strftime('%Y-%m-%dT%H:%M:%S')
            
            print(f"🔍 Время начала (UTC): {start_time_utc}")
            print(f"🔍 Время окончания (UTC): {end_time_utc}")
            print(f"🔍 Строка времени начала: {start_time_str}")
            print(f"🔍 Строка времени окончания: {end_time_str}")
            
            # Подготавливаем участников
            attendees_list = []
            if attendees:
                for email in attendees:
                    attendees_list.append({'email': email})
            
            # Создаем событие
            event = {
                'summary': title,
                'description': description,
                'location': location,
                'start': {
                    'dateTime': start_time_str,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time_str,
                    'timeZone': 'UTC',
                },
                'attendees': attendees_list,
                'conferenceData': {
                    'createRequest': {
                        'requestId': f"meet-{start_time.strftime('%Y%m%d%H%M')}",
                        'conferenceSolutionKey': {
                            'type': 'hangoutsMeet'
                        }
                    }
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # За день
                        {'method': 'popup', 'minutes': 10},       # За 10 минут
                    ],
                },
            }
            
            # Создаем событие в календаре
            print(f"📅 Создаем событие: {title}")
            print(f"📅 Время начала: {start_time_str}")
            print(f"📅 Время окончания: {end_time_str}")
            print(f"📅 Данные события: {event}")
            
            created_event = service.events().insert(
                calendarId=calendar_id,
                body=event,
                conferenceDataVersion=1
            ).execute()
            
            # Вычисляем длительность события
            duration_minutes = int((end_time - start_time).total_seconds() / 60)
            print(f"✅ Событие создано: {title} ({start_time} - {end_time})")
            print(f"⏱️ Длительность: {duration_minutes} минут")
            print(f"🔗 Ссылка на событие: {created_event.get('htmlLink', '')}")
            
            return created_event
            
        except HttpError as e:
            print(f"❌ Ошибка создания события: {e}")
            print(f"❌ Детали ошибки: {e.error_details}")
            print(f"❌ Код ошибки: {e.resp.status}")
            return None
        except Exception as e:
            print(f"❌ Неожиданная ошибка создания события: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def delete_event(self, event_id, calendar_id='primary'):
        """
        Удаляет событие из Google Calendar
        
        Args:
            event_id: ID события для удаления
            calendar_id: ID календаря (по умолчанию 'primary')
            
        Returns:
            True если событие удалено успешно, False в случае ошибки
        """
        service = self._get_service()
        if not service:
            return False
        
        try:
            print(f"🗑️ Удаляем событие: {event_id}")
            
            service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            print(f"✅ Событие успешно удалено: {event_id}")
            return True
            
        except HttpError as e:
            if e.resp.status == 410:  # Событие уже удалено
                print(f"⚠️ Событие уже удалено: {event_id}")
                return True
            else:
                print(f"❌ Ошибка удаления события: {e}")
                print(f"❌ Детали ошибки: {e.error_details}")
                print(f"❌ Код ошибки: {e.resp.status}")
                return False
        except Exception as e:
            print(f"❌ Неожиданная ошибка удаления события: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def sync_events(self, oauth_account, days_ahead=100):
        """Синхронизировать события календаря (данные кэшируются, не сохраняются в БД)"""
        events = self.get_events(days_ahead=days_ahead)
        print(f"🔄 Синхронизация событий календаря: {len(events)} событий (кэшированы)")
        return len(events)


class GoogleDriveService:
    """Сервис для работы с Google Drive"""
    
    def __init__(self, oauth_service):
        self.oauth_service = oauth_service
        self.service = None
    
    def _get_service(self):
        """Получить сервис Google Drive"""
        if not self.service:
            credentials = self.oauth_service.get_credentials()
            if not credentials:
                return None
            
            self.service = build('drive', 'v3', credentials=credentials)
        
        return self.service
    
    def get_files(self, max_results=100):
        """Получить список файлов"""
        # Сначала проверяем кэш
        user_id = self.oauth_service.user.id
        cached_files = GoogleAPICache.get_drive_files(user_id, max_results)
        
        if cached_files is not None:
            print(f"📦 Получены файлы Drive из кэша: {len(cached_files)} файлов")
            return cached_files
        
        # Если в кэше нет, получаем из API
        service = self._get_service()
        if not service:
            return []
        
        try:
            results = service.files().list(
                pageSize=max_results,
                fields="nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, parents)"
            ).execute()
            
            files = results.get('files', [])
            
            # Сохраняем в кэш
            GoogleAPICache.set_drive_files(user_id, files, max_results)
            print(f"💾 Сохранены файлы Drive в кэш: {len(files)} файлов")
            
            return files
        except HttpError as e:
            print(f"Ошибка получения файлов: {e}")
            return []
    
    def sync_files(self, oauth_account):
        """Синхронизировать файлы Google Drive (данные кэшируются, не сохраняются в БД)"""
        files = self.get_files()
        print(f"🔄 Синхронизация файлов Drive: {len(files)} файлов (кэшированы)")
        return len(files)
    
    def create_folder_structure(self, folder_path):
        """Создает структуру папок по заданному пути"""
        service = self._get_service()
        if not service:
            return None
        
        try:
            # Разбиваем путь на части
            path_parts = folder_path.split('/')
            current_parent_id = 'root'  # Начинаем с корневой папки
            
            for folder_name in path_parts:
                # Проверяем, существует ли папка с таким именем в текущей родительской папке
                existing_folders = service.files().list(
                    q=f"name='{folder_name}' and parents in '{current_parent_id}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                    fields="files(id, name)"
                ).execute()
                
                if existing_folders.get('files'):
                    # Папка уже существует, используем её ID
                    current_parent_id = existing_folders['files'][0]['id']
                else:
                    # Создаем новую папку
                    folder_metadata = {
                        'name': folder_name,
                        'mimeType': 'application/vnd.google-apps.folder',
                        'parents': [current_parent_id]
                    }
                    
                    folder = service.files().create(
                        body=folder_metadata,
                        fields='id'
                    ).execute()
                    
                    current_parent_id = folder.get('id')
            
            return current_parent_id
            
        except HttpError as e:
            print(f"Ошибка создания структуры папок: {e}")
            return None
    
    def copy_file(self, file_id, new_name, parent_folder_id=None):
        """Копирует файл с новым именем"""
        service = self._get_service()
        if not service:
            return None
        
        try:
            # Подготавливаем метаданные для копии
            copy_metadata = {
                'name': new_name
            }
            
            if parent_folder_id:
                copy_metadata['parents'] = [parent_folder_id]
            
            # Копируем файл
            copied_file = service.files().copy(
                fileId=file_id,
                body=copy_metadata,
                fields='id'
            ).execute()
            
            return copied_file.get('id')
            
        except HttpError as e:
            print(f"Ошибка копирования файла: {e}")
            return None


class GoogleSheetsService:
    """Сервис для работы с Google Sheets"""
    
    def __init__(self, oauth_service):
        self.oauth_service = oauth_service
        self.service = None
    
    def _get_service(self):
        """Получить сервис Google Sheets"""
        if not self.service:
            credentials = self.oauth_service.get_credentials()
            if not credentials:
                return None
            
            self.service = build('sheets', 'v4', credentials=credentials)
        
        return self.service
    
    def get_spreadsheets(self, max_results=100):
        """Получить список таблиц"""
        # Сначала проверяем кэш
        user_id = self.oauth_service.user.id
        cached_sheets = GoogleAPICache.get_sheets(user_id, max_results)
        
        if cached_sheets is not None:
            print(f"📦 Получены таблицы из кэша: {len(cached_sheets)} таблиц")
            return cached_sheets
        
        # Если в кэше нет, получаем из API
        # Используем Drive API для получения таблиц
        drive_service = GoogleDriveService(self.oauth_service)
        files = drive_service.get_files(max_results)
        
        # Фильтруем только Google Sheets
        spreadsheets = [f for f in files if f['mimeType'] == 'application/vnd.google-apps.spreadsheet']
        
        # Сохраняем в кэш
        GoogleAPICache.set_sheets(user_id, spreadsheets, max_results)
        print(f"💾 Сохранены таблицы в кэш: {len(spreadsheets)} таблиц")
        
        return spreadsheets
    
    def sync_spreadsheets(self, oauth_account):
        """Синхронизировать Google Sheets (данные кэшируются, не сохраняются в БД)"""
        spreadsheets = self.get_spreadsheets()
        print(f"🔄 Синхронизация таблиц: {len(spreadsheets)} таблиц (кэшированы)")
        return len(spreadsheets)
    
    def get_sheets(self, spreadsheet_id):
        """Получить список листов в таблице"""
        service = self._get_service()
        if not service:
            return []
        
        try:
            spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
            return spreadsheet.get('sheets', [])
        except HttpError as e:
            print(f"Ошибка получения листов таблицы: {e}")
            return []
    
    def delete_sheet(self, spreadsheet_id, sheet_id):
        """Удалить лист из таблицы"""
        service = self._get_service()
        if not service:
            return False
        
        try:
            # Создаем запрос на удаление листа
            request_body = {
                'requests': [{
                    'deleteSheet': {
                        'sheetId': sheet_id
                    }
                }]
            }
            
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body=request_body
            ).execute()
            
            return True
        except HttpError as e:
            print(f"Ошибка удаления листа: {e}")
            return False