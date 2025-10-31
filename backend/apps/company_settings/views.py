from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import PermissionDenied
import json

from .models import CompanySettings
from .forms import CompanySettingsForm


@login_required
@require_http_methods(["GET", "POST"])
def company_settings_view(request):
    """Страница настроек компании"""
    # Проверяем права доступа (можем добавить проверку на суперпользователя или группу)
    if not request.user.is_staff:
        raise PermissionDenied("Только сотрудники могут изменять настройки компании")
    
    # Получаем или создаем настройки
    settings_obj = CompanySettings.get_settings()
    
    if request.method == 'POST':
        form = CompanySettingsForm(request.POST, instance=settings_obj)
        
        if form.is_valid():
            form.save()
            messages.success(request, 'Настройки компании успешно сохранены')
            return redirect('company_settings:company_settings')
        else:
            messages.error(request, 'Ошибка при сохранении настроек. Проверьте введенные данные.')
    else:
        form = CompanySettingsForm(instance=settings_obj)
    
    # Получаем список доступных календарей для выбора
    available_calendars = []
    available_calendar_ids = []
    if hasattr(request.user, 'google_oauth_account'):
        try:
            from apps.google_oauth.models import GoogleOAuthAccount
            from apps.google_oauth.services import GoogleCalendarService
            
            oauth_account = GoogleOAuthAccount.objects.filter(user=request.user).first()
            if oauth_account and oauth_account.is_token_valid():
                calendar_service = GoogleCalendarService(oauth_account)
                calendars = calendar_service.get_calendar_list()
                
                if calendars and 'items' in calendars:
                    available_calendars = [
                        {
                            'id': cal.get('id'),
                            'name': cal.get('summary', cal.get('id')),
                            'description': cal.get('description', '')
                        }
                        for cal in calendars['items']
                    ]
                    available_calendar_ids = [cal.get('id') for cal in calendars['items']]
        except Exception as e:
            print(f"Ошибка получения календарей: {e}")
    
    # Проверяем, есть ли сохраненный ID календаря в списке доступных
    calendar_id_in_list = settings_obj.main_calendar_id in available_calendar_ids if settings_obj.main_calendar_id else False
    
    context = {
        'form': form,
        'settings': settings_obj,
        'available_calendars': available_calendars,
        'calendar_id_in_list': calendar_id_in_list,
        'org_structure_json': json.dumps(settings_obj.org_structure, ensure_ascii=False, indent=2) if settings_obj.org_structure else '{}'
    }
    
    return render(request, 'company_settings/settings.html', context)


@login_required
@require_http_methods(["POST"])
def company_settings_api(request):
    """API для сохранения настроек компании через AJAX"""
    if not request.user.is_staff:
        return JsonResponse({'success': False, 'error': 'Недостаточно прав'})
    
    try:
        data = json.loads(request.body)
        settings_obj = CompanySettings.get_settings()
        
        # Обновляем поля
        if 'company_name' in data:
            settings_obj.company_name = data['company_name']
        if 'theme' in data:
            settings_obj.theme = data['theme']
        if 'main_calendar_id' in data:
            settings_obj.main_calendar_id = data['main_calendar_id']
        if 'org_structure' in data:
            settings_obj.org_structure = data['org_structure']
        
        settings_obj.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Настройки сохранены успешно'
        })
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Неверный формат JSON'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

