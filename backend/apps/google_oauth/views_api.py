from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import (
    GoogleOAuthAccount, SyncSettings, ScorecardPathSettings, 
    SlotsSettings, Invite, HRScreening, QuestionTemplate
)
from .serializers import (
    GoogleOAuthAccountSerializer, SyncSettingsSerializer,
    ScorecardPathSettingsSerializer, SlotsSettingsSerializer,
    InviteSerializer, HRScreeningSerializer, QuestionTemplateSerializer,
    GoogleOAuthCallbackSerializer, GoogleSyncRequestSerializer,
    GoogleCalendarEventSerializer, GoogleDriveFileSerializer,
    GoogleSheetSerializer, GoogleStatsSerializer
)
from .services import (
    GoogleOAuthService, GoogleCalendarService, 
    GoogleDriveService, GoogleSheetsService
)

User = get_user_model()


class GoogleOAuthAccountViewSet(viewsets.ModelViewSet):
    """ViewSet для управления Google OAuth аккаунтами"""
    
    serializer_class = GoogleOAuthAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GoogleOAuthAccount.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def disconnect(self, request):
        """Отключить Google аккаунт"""
        oauth_account = get_object_or_404(
            GoogleOAuthAccount, user=request.user
        )
        oauth_service = GoogleOAuthService(request.user)
        oauth_service.revoke_access()
        return Response({'status': 'disconnected'})


class SyncSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для управления настройками синхронизации"""
    
    serializer_class = SyncSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SyncSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = SyncSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ScorecardPathSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для управления настройками структуры папок scorecard"""
    
    serializer_class = ScorecardPathSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ScorecardPathSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = ScorecardPathSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def preview_path(self, request):
        """Предварительный просмотр пути"""
        settings = self.get_object()
        vacancy_name = request.data.get('vacancy_name', 'Python Developer')
        candidate_name = request.data.get('candidate_name', 'Иван Иванов')
        
        preview = settings.generate_path_preview(
            vacancy_name=vacancy_name,
            candidate_name=candidate_name
        )
        
        return Response({'path_preview': preview})


class SlotsSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для управления настройками слотов календаря"""
    
    serializer_class = SlotsSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SlotsSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = SlotsSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InviteViewSet(viewsets.ModelViewSet):
    """ViewSet для управления инвайтами на интервью"""
    
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Invite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def regenerate_scorecard(self, request, pk=None):
        """Пересоздать scorecard для инвайта"""
        invite = self.get_object()
        try:
            invite.process_scorecard()
            return Response({'status': 'scorecard_regenerated'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def invitation_text(self, request, pk=None):
        """Получить текст приглашения"""
        invite = self.get_object()
        text = invite.get_invitation_text()
        return Response({'invitation_text': text})
    
    @action(detail=True, methods=['post'])
    def analyze_time_with_gemini(self, request, pk=None):
        """Анализ времени с помощью Gemini AI"""
        invite = self.get_object()
        try:
            analysis = invite.analyze_time_with_gemini()
            return Response({'analysis': analysis})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class HRScreeningViewSet(viewsets.ModelViewSet):
    """ViewSet для управления HR-скринингами"""
    
    serializer_class = HRScreeningSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HRScreening.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def retry_analysis(self, request, pk=None):
        """Повторный анализ HR-скрининга"""
        screening = self.get_object()
        try:
            screening.analyze_with_gemini()
            return Response({'status': 'analysis_retried'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class QuestionTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet для управления шаблонами вопросов"""
    
    serializer_class = QuestionTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return QuestionTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoogleOAuthViewSet(viewsets.ViewSet):
    """ViewSet для Google OAuth операций"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def callback(self, request):
        """Обработка callback от Google OAuth"""
        serializer = GoogleOAuthCallbackSerializer(data=request.data)
        if serializer.is_valid():
            try:
                oauth_service = GoogleOAuthService(request.user)
                oauth_account = oauth_service.handle_callback(
                    serializer.validated_data['authorization_response'],
                    serializer.validated_data.get('state')
                )
                return Response({
                    'status': 'success',
                    'account': GoogleOAuthAccountSerializer(oauth_account).data
                })
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        """Синхронизация данных Google сервисов"""
        serializer = GoogleSyncRequestSerializer(data=request.data)
        if serializer.is_valid():
            service_type = serializer.validated_data['service']
            try:
                oauth_service = GoogleOAuthService(request.user)
                oauth_account = oauth_service.get_oauth_account()
                
                if service_type == 'calendar':
                    calendar_service = GoogleCalendarService(request.user)
                    calendar_service.sync_events(oauth_account)
                elif service_type == 'drive':
                    drive_service = GoogleDriveService(request.user)
                    drive_service.sync_files(oauth_account)
                elif service_type == 'sheets':
                    sheets_service = GoogleSheetsService(request.user)
                    sheets_service.sync_spreadsheets(oauth_account)
                
                return Response({'status': 'sync_completed'})
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def check_integration(self, request):
        """Проверить статус интеграции Google"""
        try:
            oauth_service = GoogleOAuthService(request.user)
            oauth_account = oauth_service.get_oauth_account()
            
            if oauth_account and oauth_account.is_token_valid():
                return Response({
                    'status': 'connected',
                    'account': GoogleOAuthAccountSerializer(oauth_account).data
                })
            else:
                return Response({'status': 'disconnected'})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Получить статистику Google интеграции"""
        try:
            stats = {
                'oauth_accounts': GoogleOAuthAccount.objects.filter(user=request.user).count(),
                'invites': Invite.objects.filter(user=request.user).count(),
                'hr_screenings': HRScreening.objects.filter(user=request.user).count(),
                'question_templates': QuestionTemplate.objects.filter(user=request.user).count(),
            }
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleCalendarViewSet(viewsets.ViewSet):
    """ViewSet для работы с Google Calendar"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def events(self, request):
        """Получить события календаря"""
        try:
            calendar_service = GoogleCalendarService(request.user)
            events = calendar_service.get_events(
                max_results=request.query_params.get('max_results', 100),
                days_ahead=request.query_params.get('days_ahead', 30)
            )
            return Response(events)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleDriveViewSet(viewsets.ViewSet):
    """ViewSet для работы с Google Drive"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def files(self, request):
        """Получить файлы Drive"""
        try:
            drive_service = GoogleDriveService(request.user)
            files = drive_service.get_files(
                max_results=request.query_params.get('max_results', 100)
            )
            return Response(files)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleSheetsViewSet(viewsets.ViewSet):
    """ViewSet для работы с Google Sheets"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def spreadsheets(self, request):
        """Получить Google Sheets"""
        try:
            sheets_service = GoogleSheetsService(request.user)
            spreadsheets = sheets_service.get_spreadsheets(
                max_results=request.query_params.get('max_results', 100)
            )
            return Response(spreadsheets)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
