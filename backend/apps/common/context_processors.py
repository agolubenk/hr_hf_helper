from django.conf import settings
from apps.huntflow.services import HuntflowService


def sidebar_menu_context(request):
    """
    Context processor для добавления данных сайдбара во все шаблоны
    """
    if not request.user.is_authenticated:
        return {}
    
    try:
        # Получаем данные организаций для сайдбара
        huntflow_service = HuntflowService(request.user)
        accounts = huntflow_service.get_accounts()
        accounts_list = accounts.get('items', []) if accounts else []
        
        print(f"DEBUG context_processor: accounts_list = {accounts_list}")
        
        return {
            'accounts_for_menu': {'items': accounts_list},
            'accounts': accounts_list,
        }
    except Exception as e:
        # В случае ошибки возвращаем пустые данные
        print(f"ERROR in sidebar_menu_context: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'accounts_for_menu': {'items': []},
            'accounts': [],
        }
