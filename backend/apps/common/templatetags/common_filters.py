from django import template
from django.utils.safestring import mark_safe
import re

register = template.Library()


@register.filter
def format_clickup_text(text):
    """
    Форматирует текст ClickUp с поддержкой ссылок и базового форматирования
    """
    if not text:
        return text
    
    # Сначала обрабатываем обычные URL (http/https), но не те, что уже в Markdown-ссылках
    text = re.sub(
        r'(?<!\]\()(https?://[^\s<>"{}|\\^`\[\]]+)(?!\))', 
        r'<a href="\1" target="_blank" class="text-decoration-none">\1</a>', 
        text
    )
    
    # Затем обрабатываем Markdown ссылки [текст](url)
    text = re.sub(
        r'\[([^\]]+)\]\(([^)]+)\)', 
        r'<a href="\2" target="_blank" class="text-decoration-none">\1</a>', 
        text
    )
    
    # Обрабатываем email-адреса
    text = re.sub(
        r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 
        r'<a href="mailto:\1" class="text-decoration-none">\1</a>', 
        text
    )
    
    # Обрабатываем жирный текст (**текст**)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Обрабатываем курсив (*текст*)
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    
    # Обрабатываем подчеркивание (__текст__)
    text = re.sub(r'__(.*?)__', r'<u>\1</u>', text)
    
    # Обрабатываем зачеркивание (~~текст~~)
    text = re.sub(r'~~(.*?)~~', r'<del>\1</del>', text)
    
    # Обрабатываем переносы строк
    text = text.replace('\n', '<br>')
    
    return mark_safe(text)


@register.filter
def get_contrast_color(hex_color):
    """
    Определяет контрастный цвет текста (белый или черный) для заданного hex цвета
    """
    if not hex_color:
        return '#000000'
    
    # Убираем # если есть
    hex_color = hex_color.lstrip('#')
    
    # Проверяем, что это валидный hex цвет
    if len(hex_color) != 6:
        return '#000000'
    
    try:
        # Конвертируем hex в RGB
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        
        # Вычисляем яркость по формуле W3C
        # https://www.w3.org/WAI/ER/WD-AERT/#color-contrast
        brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
        
        # Если яркость больше 128, используем черный текст, иначе белый
        return '#000000' if brightness > 128 else '#ffffff'
        
    except (ValueError, IndexError):
        return '#000000'


@register.filter
def get_country(location):
    """Извлекает название страны из локации (последняя часть после запятой)"""
    if not location:
        return ""
    
    # Разделяем по запятой и берем последнюю часть
    parts = location.split(',')
    if len(parts) > 1:
        return parts[-1].strip()
    return location.strip()


@register.simple_tag(takes_context=True)
def simple_sidebar_test(context):
    """
    Простой тест для проверки работы template tag
    """
    request = context['request']
    # Получаем полное имя URL с namespace (например, 'google_oauth:calendar_events')
    if request.resolver_match:
        namespace = request.resolver_match.namespace
        url_name = request.resolver_match.url_name
        if namespace:
            full_url_name = f"{namespace}:{url_name}"
        else:
            full_url_name = url_name
    else:
        full_url_name = 'unknown'
    return f"URL: {full_url_name} | User: {request.user.username if request.user.is_authenticated else 'Anonymous'}"


@register.inclusion_tag('common/sidebar_menu.html', takes_context=True)
def common_sidebar_menu(context):
    """
    Универсальный template tag для отображения сайдбара
    """
    try:
        request = context['request']
        # Получаем полное имя URL с namespace (например, 'google_oauth:calendar_events')
        if request.resolver_match:
            namespace = request.resolver_match.namespace
            url_name = request.resolver_match.url_name
            if namespace:
                full_url_name = f"{namespace}:{url_name}"
            else:
                full_url_name = url_name
        else:
            full_url_name = 'unknown'
        url_kwargs = request.resolver_match.kwargs if request.resolver_match else {}
        
        menu_items = []
        
        # 1. Профиль пользователя с подменю
        profile_item = {
            'type': 'profile',
            'name': 'Профиль',
            'url': 'accounts:profile',
            'icon': 'fas fa-user',
            'active': full_url_name and full_url_name.startswith('accounts:'),
            'children': []
        }
        
        # Добавляем подменю для профиля - всегда показываем
        profile_item['children'].append({
            'type': 'profile_main',
            'name': 'Основная информация',
            'url': 'accounts:profile',
            'icon': 'fas fa-user',
            'active': full_url_name == 'accounts:profile',
            'children': []
        })
        
        profile_item['children'].append({
            'type': 'profile_edit',
            'name': 'Редактировать профиль',
            'url': 'accounts:profile_edit',
            'icon': 'fas fa-edit',
            'active': full_url_name == 'accounts:profile_edit',
            'children': []
        })
        
        profile_item['children'].append({
            'type': 'profile_settings',
            'name': 'Настройки',
            'url': 'accounts:profile_settings',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'accounts:profile_settings',
            'children': []
        })
        
        profile_item['children'].append({
            'type': 'profile_integrations',
            'name': 'Интеграции',
            'url': 'accounts:integrations',
            'icon': 'fas fa-plug',
            'active': full_url_name == 'accounts:integrations',
            'children': []
        })
        
        profile_item['children'].append({
            'type': 'profile_api_keys',
            'name': 'API ключи',
            'url': 'accounts:api_keys',
            'icon': 'fas fa-key',
            'active': full_url_name == 'accounts:api_keys',
            'children': []
        })
        
        menu_items.append(profile_item)
        
        # 3. Организации - всегда показываем, но с разной детализацией
        accounts = context.get('accounts_for_menu', context.get('accounts', []))
        if hasattr(accounts, 'get') and 'items' in accounts:
            accounts_list = accounts['items']
        else:
            accounts_list = accounts if isinstance(accounts, list) else []
        
        organization_item = {
            'type': 'organization',
            'name': 'Организации',
            'icon': 'fas fa-building',
            'active': full_url_name.startswith('huntflow:'),
            'children': []
        }
        
        # Добавляем Dashboard в меню организации
        organization_item['children'].append({
            'type': 'dashboard',
            'name': 'Дашборд',
            'url': 'huntflow:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'huntflow:dashboard',
            'children': []
        })
        
        for account in accounts_list:
            is_current = 'account_id' in url_kwargs and account['id'] == url_kwargs['account_id']
            
            account_item = {
                'type': 'account',
                'name': account.get('name', f'Организация {account["id"]}'),
                'icon': 'fas fa-briefcase',
                'active': is_current,
                'children': []
            }
            
            # Всегда добавляем URL для организаций
            account_item['url'] = 'huntflow:vacancies_list'
            account_item['url_kwargs'] = {'account_id': account['id']}
            
            organization_item['children'].append(account_item)
            
            if is_current and 'account_id' in url_kwargs:
                account_id = url_kwargs['account_id']
                
                account_item['children'].append({
                    'type': 'vacancies',
                    'name': 'Вакансии',
                    'url': 'huntflow:vacancies_list',
                    'url_kwargs': {'account_id': account_id},
                    'icon': 'fas fa-briefcase',
                    'active': full_url_name in ['huntflow:vacancies_list', 'huntflow:vacancy_detail'],
                    'children': []
                })
                
                account_item['children'].append({
                    'type': 'applicants',
                    'name': 'Кандидаты',
                    'url': 'huntflow:applicants_list',
                    'url_kwargs': {'account_id': account_id},
                    'icon': 'fas fa-users',
                    'active': full_url_name in ['huntflow:applicants_list', 'huntflow:applicant_detail', 'huntflow:applicant_edit'],
                    'children': []
                })
                
                if 'vacancy_id' in url_kwargs:
                    vacancy_id = url_kwargs['vacancy_id']
                    vacancy_name = context.get('vacancy_name', f'Вакансия {vacancy_id}')
                    
                    account_item['children'][-2]['children'].append({ # Accessing 'vacancies' item
                        'type': 'vacancy',
                        'name': vacancy_name,
                        'url': 'huntflow:vacancy_detail',
                        'url_kwargs': {'account_id': account_id, 'vacancy_id': vacancy_id},
                        'icon': 'fas fa-briefcase',
                        'active': full_url_name == 'huntflow:vacancy_detail',
                        'children': []
                    })
                
                if 'applicant_id' in url_kwargs:
                    applicant_id = url_kwargs['applicant_id']
                    applicant_name = context.get('applicant_name', f'Кандидат {applicant_id}')
                    
                    account_item['children'][-1]['children'].append({ # Accessing 'applicants' item
                        'type': 'applicant',
                        'name': applicant_name,
                        'url': 'huntflow:applicant_detail',
                        'url_kwargs': {'account_id': account_id, 'applicant_id': applicant_id},
                        'icon': 'fas fa-user',
                        'active': full_url_name in ['huntflow:applicant_detail', 'huntflow:applicant_edit'],
                        'children': []
                    })
        
        menu_items.append(organization_item)
        
        # 3. Интервьюеры с подменю
        interviewers_item = {
            'type': 'interviewers',
            'name': 'Интервьюеры',
            'url': 'interviewers:dashboard',
            'icon': 'fas fa-users',
            'active': full_url_name and full_url_name.startswith('interviewers:'),
            'children': []
        }
        
        # Добавляем подменю для интервьюеров - всегда показываем
        interviewers_item['children'].append({
            'type': 'interviewers_dashboard',
            'name': 'Дашборд',
            'url': 'interviewers:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'interviewers:dashboard',
            'children': []
        })
        
        interviewers_item['children'].append({
            'type': 'interviewers_list',
            'name': 'Список интервьюеров',
            'url': 'interviewers:interviewer_list',
            'icon': 'fas fa-list',
            'active': full_url_name == 'interviewers:interviewer_list',
            'children': []
        })
        
        interviewers_item['children'].append({
            'type': 'interviewers_add',
            'name': 'Добавить интервьюера',
            'url': 'interviewers:interviewer_create',
            'icon': 'fas fa-plus',
            'active': full_url_name == 'interviewers:interviewer_create',
            'children': []
        })
        
        menu_items.append(interviewers_item)
        
        # 4. Локальные данные с подменю
        vacancies_item = {
            'type': 'vacancies',
            'name': 'Локальные данные',
            'url': 'vacancies:dashboard',
            'icon': 'fas fa-database',
            'active': full_url_name and (full_url_name.startswith('vacancies:') or full_url_name.startswith('finance:')),
            'children': []
        }
        
        # Добавляем подменю для локальных данных - всегда показываем
        # 1. Дашборд
        vacancies_item['children'].append({
            'type': 'vacancies_dashboard',
            'name': 'Дашборд',
            'url': 'vacancies:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'vacancies:dashboard',
            'children': []
        })
        
        # 2. Вакансии
        vacancies_item['children'].append({
            'type': 'vacancies_list',
            'name': 'Вакансии',
            'url': 'vacancies:vacancy_list',
            'icon': 'fas fa-list',
            'active': full_url_name == 'vacancies:vacancy_list',
            'children': []
        })
        
        # 3. Грейды и курсы валют
        vacancies_item['children'].append({
            'type': 'finance_dashboard',
            'name': 'Грейды и курсы валют',
            'url': 'finance:dashboard',
            'icon': 'fas fa-chart-line',
            'active': full_url_name and full_url_name.startswith('finance:') and not full_url_name.startswith('finance:benchmarks'),
            'children': []
        })
        
        # 4. Бенчмарки с подменю
        benchmarks_item = {
            'type': 'benchmarks',
            'name': 'Бенчмарки',
            'icon': 'fas fa-chart-bar',
            'active': full_url_name and full_url_name.startswith('finance:benchmarks'),
            'children': []
        }
        
        # Подменю бенчмарков
        benchmarks_item['children'].append({
            'type': 'benchmarks_dashboard',
            'name': 'Дашборд',
            'url': 'finance:benchmarks_dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'finance:benchmarks_dashboard',
            'children': []
        })
        
        benchmarks_item['children'].append({
            'type': 'benchmarks_list',
            'name': 'Все бенчмарки',
            'url': 'finance:benchmarks_list',
            'icon': 'fas fa-list',
            'active': full_url_name == 'finance:benchmarks_list',
            'children': []
        })
        
        benchmarks_item['children'].append({
            'type': 'benchmarks_settings',
            'name': 'Настройки',
            'url': 'finance:benchmark_settings',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'finance:benchmark_settings',
            'children': []
        })
        
        vacancies_item['children'].append(benchmarks_item)
        
        menu_items.append(vacancies_item)
        
        # 5. G-данные и автоматизации с иерархическим меню
        google_oauth_item = {
            'type': 'google_oauth',
            'name': 'G-данные и автоматизации',
            'url': 'google_oauth:dashboard',
            'icon': 'fas fa-google',
            'active': full_url_name and full_url_name.startswith('google_oauth:'),
            'children': []
        }
        
        # Добавляем подменю для Google OAuth - всегда показываем
        google_oauth_item['children'].append({
            'type': 'google_oauth_dashboard',
            'name': 'Дашборд',
            'url': 'google_oauth:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'google_oauth:dashboard',
            'children': []
        })
        
        # G-данные и автоматизация
        google_oauth_item['children'].append({
            'type': 'google_oauth_gdata',
            'name': 'G-данные и автоматизация',
            'url': 'google_oauth:gdata_automation',
            'icon': 'fas fa-robot',
            'active': full_url_name == 'google_oauth:gdata_automation',
            'children': []
        })
        
        google_oauth_item['children'].append({
            'type': 'google_oauth_calendar',
            'name': 'Календарь',
            'url': 'google_oauth:calendar_events',
            'icon': 'fas fa-calendar',
            'active': full_url_name == 'google_oauth:calendar_events',
            'children': []
        })
        
        google_oauth_item['children'].append({
            'type': 'google_oauth_drive',
            'name': 'Google Drive',
            'url': 'google_oauth:drive_files',
            'icon': 'fas fa-folder',
            'active': full_url_name == 'google_oauth:drive_files',
            'children': []
        })
        
        
        google_oauth_item['children'].append({
            'type': 'google_oauth_invites',
            'name': 'Инвайты и Scorecard',
            'url': 'google_oauth:invite_dashboard',
            'icon': 'fas fa-user-plus',
            'active': full_url_name and full_url_name.startswith('google_oauth:invite'),
            'children': []
        })
        
        google_oauth_item['children'].append({
            'type': 'google_oauth_hr_screening',
            'name': 'HR-скрининг',
            'url': 'google_oauth:hr_screening_list',
            'icon': 'fas fa-clipboard-list',
            'active': full_url_name and full_url_name.startswith('google_oauth:hr_screening'),
            'children': []
        })
        
        menu_items.append(google_oauth_item)
        
        # 6. Gemini AI с иерархическим меню
        gemini_item = {
            'type': 'gemini',
            'name': 'Gemini AI',
            'url': 'gemini:dashboard',
            'icon': 'fas fa-robot',
            'active': full_url_name and full_url_name.startswith('gemini:'),
            'children': []
        }
        
        # Добавляем подменю для Gemini - всегда показываем
        gemini_item['children'].append({
            'type': 'gemini_dashboard',
            'name': 'Дашборд',
            'url': 'gemini:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'gemini:dashboard',
            'children': []
        })
        
        gemini_item['children'].append({
            'type': 'gemini_settings',
            'name': 'Настройки',
            'url': 'gemini:settings',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'gemini:settings',
            'children': []
        })
        
        # Добавляем чаты, если есть активная сессия
        if full_url_name in ['gemini:chat_session', 'gemini:send_message']:
            gemini_item['children'].append({
                'type': 'gemini_chat',
                'name': 'Активный чат',
                'url': 'gemini:new_chat',
                'icon': 'fas fa-comments',
                'active': full_url_name == 'gemini:chat_session',
                'children': []
            })
        
        menu_items.append(gemini_item)
        
        # 7. ClickUp интеграция с иерархическим меню
        clickup_item = {
            'type': 'clickup_int',
            'name': 'ClickUp интеграция',
            'url': 'clickup_int:dashboard',
            'icon': 'fas fa-tasks',
            'active': full_url_name and full_url_name.startswith('clickup_int:'),
            'children': []
        }
        
        # Добавляем подменю для ClickUp - всегда показываем
        clickup_item['children'].append({
            'type': 'clickup_dashboard',
            'name': 'Дашборд',
            'url': 'clickup_int:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'clickup_int:dashboard',
            'children': []
        })
        
        clickup_item['children'].append({
            'type': 'clickup_settings',
            'name': 'Настройки',
            'url': 'clickup_int:settings',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'clickup_int:settings',
            'children': []
        })
        
        clickup_item['children'].append({
            'type': 'clickup_tasks',
            'name': 'Задачи',
            'url': 'clickup_int:tasks_list',
            'icon': 'fas fa-list',
            'active': full_url_name == 'clickup_int:tasks_list',
            'children': []
        })
        
        clickup_item['children'].append({
            'type': 'clickup_sync_logs',
            'name': 'Логи синхронизации',
            'url': 'clickup_int:sync_logs',
            'icon': 'fas fa-history',
            'active': full_url_name == 'clickup_int:sync_logs',
            'children': []
        })
        
        menu_items.append(clickup_item)
        
        # 8. Notion интеграция с иерархическим меню
        notion_item = {
            'type': 'notion_int',
            'name': 'Notion интеграция',
            'url': 'notion_int:dashboard',
            'icon': 'fas fa-file-alt',
            'active': full_url_name and full_url_name.startswith('notion_int:'),
            'children': []
        }
        
        # Добавляем подменю для Notion - всегда показываем
        notion_item['children'].append({
            'type': 'notion_dashboard',
            'name': 'Дашборд',
            'url': 'notion_int:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'notion_int:dashboard',
            'children': []
        })
        
        notion_item['children'].append({
            'type': 'notion_settings',
            'name': 'Настройки',
            'url': 'notion_int:settings',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'notion_int:settings',
            'children': []
        })
        
        notion_item['children'].append({
            'type': 'notion_pages',
            'name': 'Страницы',
            'url': 'notion_int:pages_list',
            'icon': 'fas fa-list',
            'active': full_url_name == 'notion_int:pages_list',
            'children': []
        })
        
        notion_item['children'].append({
            'type': 'notion_sync_logs',
            'name': 'Логи синхронизации',
            'url': 'notion_int:sync_logs',
            'icon': 'fas fa-history',
            'active': full_url_name == 'notion_int:sync_logs',
            'children': []
        })
        
        menu_items.append(notion_item)
        
        # 9. Telegram интеграция с иерархическим меню
        telegram_item = {
            'type': 'telegram',
            'name': 'Telegram',
            'icon': 'fab fa-telegram',
            'active': full_url_name and full_url_name.startswith('telegram:'),
            'children': []
        }
        
        # Добавляем подменю для Telegram - всегда показываем
        telegram_item['children'].append({
            'type': 'telegram_dashboard',
            'name': 'Дашборд',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-tachometer-alt',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_chats',
            'name': 'Чаты',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-comments',
            'active': full_url_name in ['telegram:dashboard'],
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_contacts',
            'name': 'Контакты',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-address-book',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_automation',
            'name': 'Автоматизация',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-robot',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_sessions',
            'name': 'Сессии',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-key',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_logs',
            'name': 'Логи',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-file-alt',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        telegram_item['children'].append({
            'type': 'telegram_settings',
            'name': 'Настройки',
            'url': 'telegram:dashboard',
            'icon': 'fas fa-cog',
            'active': full_url_name == 'telegram:dashboard',
            'children': []
        })
        
        menu_items.append(telegram_item)
        
        # 10. Админ панель - всегда последний элемент
        menu_items.append({
            'type': 'admin',
            'name': 'Админ панель',
            'url': 'admin:index',
            'icon': 'fas fa-cog',
            'active': False,
            'children': []
        })
        
        print(f"DEBUG template_tag: full_url_name = {full_url_name}")
        print(f"DEBUG template_tag: accounts = {accounts}")
        print(f"DEBUG template_tag: menu_items count = {len(menu_items)}")
        
        return {
            'menu_items': menu_items,
            'current_full_url_name': full_url_name
        }
    
    except Exception as e:
        print(f"ERROR in common_sidebar_menu: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Возвращаем минимальный набор элементов в случае ошибки
        return {
            'menu_items': [
                {
                    'type': 'dashboard',
                    'name': 'Дашборд',
                    'url': 'huntflow:dashboard',
                    'icon': 'fas fa-tachometer-alt',
                    'active': False,
                    'children': []
                },
                {
                    'type': 'gemini',
                    'name': 'Gemini AI',
                    'url': 'gemini:dashboard',
                    'icon': 'fas fa-robot',
                    'active': True,
                    'children': []
                }
            ],
            'current_full_url_name': 'error'
        }
