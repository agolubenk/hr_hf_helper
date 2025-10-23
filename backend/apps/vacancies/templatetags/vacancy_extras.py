from django import template

register = template.Library()

@register.filter
def split(value, delimiter=','):
    """
    Разделяет строку по разделителю и возвращает список
    """
    if not value:
        return []
    return [item.strip() for item in str(value).split(delimiter) if item.strip()]

@register.filter
def strip(value):
    """
    Убирает пробелы в начале и конце строки
    """
    if not value:
        return ''
    return str(value).strip()

@register.filter
def get_stage_name(stage_id):
    """
    Получить название этапа по ID из Huntflow
    """
    print(f"DEBUG: get_stage_name called with stage_id={stage_id}")
    
    if not stage_id:
        print(f"DEBUG: Missing stage_id. stage_id={stage_id}")
        return "Не указан"
    
    # Создаем простой словарь с маппингом ID на названия
    # Это временное решение, пока не настроим полную интеграцию с Huntflow
    stage_mapping = {
        '186502': 'HR Screening',
        '186503': 'Tech Screening', 
        '186504': 'Tech Interview',
        '186505': 'Final Interview',
        '186506': 'Offer',
        '186507': 'Rejected',
        '186508': 'Hired',
        '186509': 'New',
        '186510': 'Phone Screen',
        '186511': 'On-site Interview',
        '186512': 'Technical Test',
        '186513': 'Reference Check',
        '186514': 'Background Check',
        '186515': 'Contract Signed',
    }
    
    # Возвращаем название этапа или ID, если не найдено
    stage_name = stage_mapping.get(str(stage_id), f"Этап {stage_id}")
    print(f"DEBUG: Returning stage name: {stage_name}")
    return stage_name


@register.simple_tag(takes_context=True)
def get_stage_name_from_huntflow(context, stage_id):
    """
    Получить название этапа по ID из Huntflow API
    """
    if not stage_id:
        return "Не указан"
    
    user = context.get('user')
    if not user:
        return f"Этап {stage_id}"
    
    try:
        from apps.huntflow.services import HuntflowService
        from apps.huntflow.utils import get_correct_account_id
        
        # Получаем правильный account_id
        account_id = get_correct_account_id(user, None)
        if not account_id:
            return f"Этап {stage_id}"
        
        # Получаем сервис Huntflow
        huntflow_service = HuntflowService(user)
        
        # Получаем статусы
        statuses = huntflow_service.get_vacancy_statuses(account_id)
        if not statuses or 'items' not in statuses:
            return f"Этап {stage_id}"
        
        # Ищем статус по ID
        for status in statuses['items']:
            if str(status['id']) == str(stage_id):
                return status.get('name', f"Этап {stage_id}")
        
        return f"Этап {stage_id}"
        
    except Exception as e:
        print(f"Ошибка при получении названия этапа {stage_id}: {e}")
        return f"Этап {stage_id}"
