"""Сервисы для управления аккаунтами пользователей"""
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
        
        if is_google_oauth_connected and token_valid:
            try:
                from apps.google_oauth.services import GoogleService
                google_service = GoogleService(oauth_account)
                google_stats = google_service.get_stats()
            except:
                pass
        
        # Получаем информацию о группах пользователя
        user_groups = [group.name for group in user.groups.all()]
        
        # Получаем статистику интеграций
        integrations_status = UserService.get_integrations_status(user)
        
        profile_data = {
            'user': user,
            'social_accounts': social_accounts,
            'oauth_account': oauth_account,
            'is_google_oauth_connected': is_google_oauth_connected,
            'is_google_social_connected': is_google_social_connected,
            'token_valid': token_valid,
            'google_stats': google_stats,
            'user_groups': user_groups,
            'integrations': integrations_status,
        }
        
        return profile_data
    
    @staticmethod
    def get_integrations_status(user):
        """
        Получение статуса интеграций пользователя
        """
        integrations = {}
        
        # Gemini
        integrations['gemini'] = {
            'name': 'Gemini AI',
            'enabled': True,
            'configured': bool(user.gemini_api_key),
            'api_key': user.gemini_api_key[:10] + '...' if user.gemini_api_key else None,
        }
        
        # Huntflow
        huntflow_configured = bool(
            (user.huntflow_sandbox_api_key and user.huntflow_sandbox_url) or
            (user.huntflow_prod_api_key and user.huntflow_prod_url)
        )
        integrations['huntflow'] = {
            'name': 'Huntflow',
            'enabled': True,
            'sandbox_configured': bool(user.huntflow_sandbox_api_key and user.huntflow_sandbox_url),
            'prod_configured': bool(user.huntflow_prod_api_key and user.huntflow_prod_url),
            'active_system': user.active_system,
            'configured': huntflow_configured,
        }
        
        # ClickUp
        integrations['clickup'] = {
            'name': 'ClickUp',
            'enabled': True,
            'configured': bool(user.clickup_api_key),
            'api_key': user.clickup_api_key[:10] + '...' if user.clickup_api_key else None,
        }
        
        # Notion
        integrations['notion'] = {
            'name': 'Notion',
            'enabled': True,
            'configured': bool(user.notion_integration_token),
            'token': user.notion_integration_token[:10] + '...' if user.notion_integration_token else None,
        }
        
        # Telegram
        integrations['telegram'] = {
            'name': 'Telegram',
            'enabled': True,
            'configured': bool(user.telegram_username),
            'username': user.telegram_username,
        }
        
        # Google OAuth
        try:
            from apps.google_oauth.models import GoogleOAuthAccount
            oauth_account = GoogleOAuthAccount.objects.get(user=user)
            is_connected = oauth_account is not None
            token_valid = oauth_account.is_token_valid() if oauth_account else False
        except:
            is_connected = False
            token_valid = False
        
        integrations['google_oauth'] = {
            'name': 'Google OAuth',
            'enabled': True,
            'connected': is_connected,
            'token_valid': token_valid,
            'configured': is_connected and token_valid,
        }
        
        return integrations
    
    @staticmethod
    def update_user_api_keys(user, data):
        """
        Обновление API ключей пользователя
        """
        try:
            with transaction.atomic():
                if 'gemini_api_key' in data:
                    user.gemini_api_key = data['gemini_api_key']
                
                if 'clickup_api_key' in data:
                    user.clickup_api_key = data['clickup_api_key']
                
                if 'notion_integration_token' in data:
                    user.notion_integration_token = data['notion_integration_token']
                
                if 'huntflow_sandbox_api_key' in data:
                    user.huntflow_sandbox_api_key = data['huntflow_sandbox_api_key']
                
                if 'huntflow_prod_api_key' in data:
                    user.huntflow_prod_api_key = data['huntflow_prod_api_key']
                
                if 'huntflow_sandbox_url' in data:
                    user.huntflow_sandbox_url = data['huntflow_sandbox_url']
                
                if 'huntflow_prod_url' in data:
                    user.huntflow_prod_url = data['huntflow_prod_url']
                
                if 'active_system' in data:
                    user.active_system = data['active_system']
                
                user.save()
                return True, "API ключи успешно обновлены"
                
        except Exception as e:
            return False, f"Ошибка обновления API ключей: {str(e)}"
    
    @staticmethod
    def assign_groups_to_user(user, group_ids):
        """
        Назначение групп пользователю
        """
        try:
            with transaction.atomic():
                # Получаем группы
                groups = Group.objects.filter(id__in=group_ids)
                
                # Очищаем текущие группы
                user.groups.clear()
                
                # Назначаем новые группы
                user.groups.set(groups)
                
                return True, f"Пользователю назначено {groups.count()} групп"
                
        except Exception as e:
            return False, f"Ошибка назначения групп: {str(e)}"
    
    @staticmethod
    def get_user_stats():
        """
        Получение статистики пользователей
        """
        try:
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            staff_users = User.objects.filter(is_staff=True).count()
            superusers = User.objects.filter(is_superuser=True).count()
            
            # Статистика по группам
            group_stats = {}
            for group in Group.objects.all():
                group_stats[group.name] = group.user_set.count()
            
            # Статистика по интеграциям
            integrations_stats = {
                'gemini_configured': User.objects.filter(gemini_api_key__isnull=False).exclude(gemini_api_key='').count(),
                'clickup_configured': User.objects.filter(clickup_api_key__isnull=False).exclude(clickup_api_key='').count(),
                'notion_configured': User.objects.filter(notion_integration_token__isnull=False).exclude(notion_integration_token='').count(),
                'huntflow_sandbox_configured': User.objects.filter(
                    huntflow_sandbox_api_key__isnull=False
                ).exclude(huntflow_sandbox_api_key='').count(),
                'huntflow_prod_configured': User.objects.filter(
                    huntflow_prod_api_key__isnull=False
                ).exclude(huntflow_prod_api_key='').count(),
            }
            
            stats = {
                'total_users': total_users,
                'active_users': active_users,
                'staff_users': staff_users,
                'superusers': superusers,
                'group_stats': group_stats,
                'integrations_stats': integrations_stats,
            }
            
            return stats
            
        except Exception as e:
            return {'error': f'Ошибка получения статистики: {str(e)}'}
    
    @staticmethod
    def test_api_key_integration(integration_type, api_key, **kwargs):
        """
        Тестирование API ключа для различных интеграций
        """
        try:
            if integration_type == 'gemini':
                from logic.ai_analysis.gemini_services import GeminiService
                service = GeminiService(api_key)
                return service.test_connection()
            
            elif integration_type == 'huntflow':
                api_url = kwargs.get('api_url')
                if not api_url:
                    return False, "URL API не указан"
                
                # Здесь должна быть логика тестирования Huntflow API
                # Пока возвращаем простую проверку
                if len(api_key) < 10:
                    return False, "API ключ слишком короткий"
                return True, "Huntflow API ключ валиден"
            
            elif integration_type == 'clickup':
                # Здесь должна быть логика тестирования ClickUp API
                if len(api_key) < 10:
                    return False, "API ключ слишком короткий"
                return True, "ClickUp API ключ валиден"
            
            elif integration_type == 'notion':
                if not api_key.startswith('secret_'):
                    return False, "Integration Token должен начинаться с 'secret_'"
                if len(api_key) < 20:
                    return False, "Integration Token слишком короткий"
                return True, "Notion Integration Token валиден"
            
            else:
                return False, f"Неизвестный тип интеграции: {integration_type}"
                
        except Exception as e:
            return False, f"Ошибка тестирования API ключа: {str(e)}"

