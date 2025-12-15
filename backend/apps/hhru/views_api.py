"""
API представления для HeadHunter.ru интеграции

ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы, request.user
ИСТОЧНИКИ ДАННЫХ: DRF ViewSets, HHRUService, HHRUOAuthService
ОБРАБОТКА: Обработка API запросов для работы с HH.ru
ВЫХОДЯЩИЕ ДАННЫЕ: DRF Response с данными
СВЯЗИ: HHRUService, HHRUOAuthService, сериализаторы
ФОРМАТ: DRF ViewSets
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import HHRUAccount, HHRUConfiguration, HHRUAPILog
from .serializers import (
    HHRUAccountSerializer, HHRUAccountDetailSerializer,
    HHRUConfigurationSerializer, HHRUAPILogSerializer,
    HHRUOAuthCallbackSerializer, HHRUTestConnectionSerializer
)
from .services import HHRUService, HHRUOAuthService


class HHRUAccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с HH.ru аккаунтами
    
    ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    ИСТОЧНИКИ ДАННЫХ: HHRUAccount модель, HHRUService
    ОБРАБОТКА: CRUD операции с аккаунтами, тестирование подключения
    ВЫХОДЯЩИЕ ДАННЫЕ: DRF Response с данными аккаунтов
    СВЯЗИ: HHRUAccount модель, HHRUService
    ФОРМАТ: DRF ViewSet
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HHRUAccountSerializer
    
    def get_queryset(self):
        """Возвращает queryset аккаунтов для текущего пользователя"""
        return HHRUAccount.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Возвращает класс сериализатора в зависимости от действия"""
        if self.action == 'retrieve' or self.action == 'update':
            return HHRUAccountDetailSerializer
        return HHRUAccountSerializer
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """
        Тестирует подключение к HH.ru API
        
        Returns:
            Результат тестирования подключения
        """
        account = self.get_object()
        service = HHRUService(account.user)
        service.account = account
        
        success, message = service.test_connection()
        
        return Response({
            'success': success,
            'message': message
        })
    
    @action(detail=True, methods=['post'])
    def refresh_token(self, request, pk=None):
        """
        Обновляет токен доступа
        
        Returns:
            Результат обновления токена
        """
        account = self.get_object()
        service = HHRUService(account.user)
        service.account = account
        
        new_token = service.refresh_access_token()
        
        if new_token:
            account.refresh_from_db()
            serializer = self.get_serializer(account)
            return Response({
                'success': True,
                'message': 'Токен успешно обновлен',
                'account': serializer.data
            })
        else:
            return Response({
                'success': False,
                'error': 'Не удалось обновить токен'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_profile(self, request, pk=None):
        """
        Получает данные профиля из HH.ru
        
        Returns:
            Данные профиля пользователя
        """
        account = self.get_object()
        service = HHRUService(account.user)
        service.account = account
        
        result = service.get_me()
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def get_vacancies(self, request, pk=None):
        """
        Получает список вакансий работодателя
        
        Returns:
            Список вакансий
        """
        account = self.get_object()
        service = HHRUService(account.user)
        service.account = account
        
        params = request.query_params.dict()
        result = service.get_vacancies(params=params)
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def get_responses(self, request, pk=None):
        """
        Получает список откликов
        
        Returns:
            Список откликов
        """
        account = self.get_object()
        service = HHRUService(account.user)
        service.account = account
        
        vacancy_id = request.query_params.get('vacancy_id')
        params = request.query_params.dict()
        if 'vacancy_id' in params:
            del params['vacancy_id']
        
        result = service.get_responses(vacancy_id=vacancy_id, params=params)
        return Response(result)


class HHRUConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с конфигурациями HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы (GET, POST, PUT, DELETE, PATCH)
    ИСТОЧНИКИ ДАННЫХ: HHRUConfiguration модель
    ОБРАБОТКА: CRUD операции с конфигурациями OAuth
    ВЫХОДЯЩИЕ ДАННЫЕ: DRF Response с данными конфигураций
    СВЯЗИ: HHRUConfiguration модель
    ФОРМАТ: DRF ViewSet
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HHRUConfigurationSerializer
    
    def get_queryset(self):
        """Возвращает queryset конфигураций"""
        # Показываем глобальные конфигурации и конфигурации текущего пользователя
        return HHRUConfiguration.objects.filter(
            Q(user__isnull=True) | Q(user=self.request.user)
        )
    
    @action(detail=False, methods=['get'])
    def get_default(self, request):
        """
        Получает конфигурацию по умолчанию
        
        Returns:
            Конфигурация по умолчанию
        """
        config = HHRUConfiguration.get_default(request.user)
        if config:
            serializer = self.get_serializer(config)
            return Response(serializer.data)
        else:
            return Response({
                'error': 'Конфигурация по умолчанию не найдена'
            }, status=status.HTTP_404_NOT_FOUND)


class HHRUAPILogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для просмотра логов HH.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы (GET)
    ИСТОЧНИКИ ДАННЫХ: HHRUAPILog модель
    ОБРАБОТКА: Просмотр логов API запросов
    ВЫХОДЯЩИЕ ДАННЫЕ: DRF Response с данными логов
    СВЯЗИ: HHRUAPILog модель
    ФОРМАТ: DRF ViewSet
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HHRUAPILogSerializer
    
    def get_queryset(self):
        """Возвращает queryset логов для текущего пользователя"""
        return HHRUAPILog.objects.filter(user=self.request.user)


class HHRUOAuthView(APIView):
    """
    API представление для OAuth авторизации
    
    ВХОДЯЩИЕ ДАННЫЕ: HTTP запросы для авторизации
    ИСТОЧНИКИ ДАННЫХ: HHRUOAuthService
    ОБРАБОТКА: Получение URL авторизации, обработка callback
    ВЫХОДЯЩИЕ ДАННЫЕ: DRF Response с URL авторизации или результатом callback
    СВЯЗИ: HHRUOAuthService
    ФОРМАТ: DRF APIView
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Получает URL для авторизации пользователя
        
        Returns:
            URL для авторизации
        """
        redirect_uri = request.query_params.get('redirect_uri')
        result = HHRUOAuthService.get_authorization_url(
            request.user,
            redirect_uri=redirect_uri
        )
        
        if result.get('success'):
            return Response(result)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        """
        Обрабатывает OAuth callback и обменивает код на токены
        
        Request body:
            - code: Код авторизации
            - state: State параметр (опционально)
            - redirect_uri: URI для перенаправления (опционально)
        
        Returns:
            Результат обмена токенов
        """
        serializer = HHRUOAuthCallbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        redirect_uri = request.data.get('redirect_uri')
        
        result = HHRUOAuthService.exchange_code_for_tokens(
            request.user,
            code,
            redirect_uri=redirect_uri
        )
        
        if result.get('success'):
            account_serializer = HHRUAccountSerializer(result['account'])
            return Response({
                'success': True,
                'message': 'Авторизация успешна',
                'account': account_serializer.data
            })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class HHRUTestConnectionView(APIView):
    """
    API представление для тестирования подключения к HH.ru API
    
    ВХОДЯЩИЕ ДАННЫЕ: HTTP GET запрос
    ИСТОЧНИКИ ДАННЫХ: HHRUService
    ОБРАБОТКА: Тестирование подключения к API
    ВЫХОДЯЩИЕ ДАННЫЕ: Результат тестирования
    СВЯЗИ: HHRUService
    ФОРМАТ: DRF APIView
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Тестирует подключение к HH.ru API для текущего пользователя
        
        Returns:
            Результат тестирования подключения
        """
        try:
            account = HHRUAccount.objects.get(user=request.user)
            service = HHRUService(request.user)
            service.account = account
            
            success, message = service.test_connection()
            
            return Response({
                'success': success,
                'message': message
            })
        except HHRUAccount.DoesNotExist:
            return Response({
                'success': False,
                'error': 'HH.ru аккаунт не подключен'
            }, status=status.HTTP_404_NOT_FOUND)

