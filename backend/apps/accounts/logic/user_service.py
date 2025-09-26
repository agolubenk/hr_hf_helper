"""
Сервисный слой для работы с пользователями
Содержит всю бизнес-логику, которая используется как в API, так и в веб-интерфейсе
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction

User = get_user_model()


class UserService:
    """Сервис для работы с пользователями"""
    
    @staticmethod
    def get_user_profile_data(user):
        """
        Получение данных профиля пользователя
        Используется как в API, так и в веб-интерфейсе
        """
        # Получаем информацию о социальных аккаунтах
        social_accounts = []
        if hasattr(user, 'socialaccount_set'):
            for account in user.socialaccount_set.all():
                social_accounts.append({
                    'provider': account.provider,
                    'uid': account.uid,
                    'extra_data': account.extra_data,
                    'date_joined': account.date_joined,
                })
        
        # Получаем информацию о Google OAuth аккаунте
        oauth_account = None
        is_google_oauth_connected = False
        is_google_social_connected = any(acc['provider'] == 'google' for acc in social_accounts)
        
        try:
            from apps.google_oauth.models import GoogleOAuthAccount
            oauth_account = GoogleOAuthAccount.objects.get(user=user)
            is_google_oauth_connected = oauth_account is not None
            token_valid = oauth_account.is_token_valid() if oauth_account else False
        except:
            token_valid = False
        
        # Получаем статистику Google сервисов
        google_stats = {
            'calendar_events': 0,
            'drive_files': 0,
            'sheets': 0,
        }
        
        if oauth_account:
            try:
                from apps.google_oauth.models import GoogleCalendarEvent, GoogleDriveFile, GoogleSheet
                google_stats['calendar_events'] = GoogleCalendarEvent.objects.filter(google_account=oauth_account).count()
                google_stats['drive_files'] = GoogleDriveFile.objects.filter(google_account=oauth_account).count()
                google_stats['sheets'] = GoogleSheet.objects.filter(google_account=oauth_account).count()
            except:
                pass
        
        return {
            'user': user,
            'social_accounts': social_accounts,
            'is_google_connected': any(acc['provider'] == 'google' for acc in social_accounts),
            'is_google_social_connected': is_google_social_connected,
            'oauth_account': oauth_account,
            'is_google_oauth_connected': is_google_oauth_connected,
            'token_valid': token_valid,
            'google_stats': google_stats,
        }
    
    @staticmethod
    def get_integrations_status(user):
        """
        Получение статуса интеграций пользователя
        """
        return {
            'huntflow': {
                'name': 'Huntflow',
                'enabled': bool(user.huntflow_sandbox_api_key or user.huntflow_prod_api_key),
                'sandbox_configured': bool(user.huntflow_sandbox_api_key),
                'prod_configured': bool(user.huntflow_prod_api_key),
                'active_system': user.active_system,
            },
            'gemini': {
                'name': 'Gemini AI',
                'enabled': bool(user.gemini_api_key),
                'configured': bool(user.gemini_api_key),
            },
            'clickup': {
                'name': 'ClickUp',
                'enabled': bool(user.clickup_api_key),
                'configured': bool(user.clickup_api_key),
            },
            'telegram': {
                'name': 'Telegram',
                'enabled': bool(user.telegram_username),
                'configured': bool(user.telegram_username),
            },
            'notion': {
                'name': 'Notion',
                'enabled': bool(user.notion_integration_token),
                'configured': bool(user.notion_integration_token),
            }
        }
    
    @staticmethod
    def update_user_api_keys(user, data):
        """
        Обновление API ключей пользователя
        """
        with transaction.atomic():
            user.gemini_api_key = data.get('gemini_api_key', user.gemini_api_key)
            user.clickup_api_key = data.get('clickup_api_key', user.clickup_api_key)
            user.notion_integration_token = data.get('notion_integration_token', user.notion_integration_token)
            user.huntflow_sandbox_api_key = data.get('huntflow_sandbox_api_key', user.huntflow_sandbox_api_key)
            user.huntflow_prod_api_key = data.get('huntflow_prod_api_key', user.huntflow_prod_api_key)
            user.huntflow_sandbox_url = data.get('huntflow_sandbox_url', user.huntflow_sandbox_url)
            user.huntflow_prod_url = data.get('huntflow_prod_url', user.huntflow_prod_url)
            user.active_system = data.get('active_system', user.active_system)
            user.save()
        
        return user
    
    @staticmethod
    def get_user_stats():
        """
        Получение статистики пользователей
        """
        from .role_service import RoleService
        
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        
        # Статистика по группам (оптимизированная версия)
        groups_stats = {}
        for group in Group.objects.all():
            groups_stats[group.name] = group.user_set.count()
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'staff_users': staff_users,
            'groups_stats': groups_stats
        }
    
    @staticmethod
    def assign_groups_to_user(user, group_ids):
        """
        Назначение групп пользователю
        """
        try:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)
            return True, "Группы успешно назначены"
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def create_user_with_observer_role(user_data):
        """
        Создание пользователя с автоматическим назначением роли наблюдателя
        """
        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            
            # Назначаем роль наблюдателя
            try:
                observer_group = Group.objects.get(name='Наблюдатели')
                user.groups.add(observer_group)
                user.is_observer_active = True
                user.save()
            except Group.DoesNotExist:
                pass  # Группа не найдена, но пользователь создан
            
            return user
    
    @staticmethod
    def link_social_account_to_existing_user(sociallogin, email):
        """
        Связывание социального аккаунта с существующим пользователем
        """
        try:
            existing_user = User.objects.get(email=email)
            sociallogin.connect(None, existing_user)
            return existing_user
        except User.DoesNotExist:
            return None
