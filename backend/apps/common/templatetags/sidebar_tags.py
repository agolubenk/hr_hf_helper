from django import template
from django.urls import reverse, NoReverseMatch
from django.utils.safestring import mark_safe

register = template.Library()

# Конфигурация многоуровневого меню
SIDEBAR_MENU = {
    'chat_helper': {
        'title': 'Главная',
        'icon': 'hrhelper-logo',
        'url': 'google_oauth:chat_workflow',
        'submenu': {}
    },
    'huntflow': {
        'title': 'Huntflow',
        'icon': 'fas fa-users',
        'url': 'huntflow:dashboard',
        'submenu': {}
    },
    'google_oauth': {
        'title': 'Google OAuth', 
        'icon': 'fab fa-google',
        'url': 'google_oauth:dashboard',
        'submenu': {
            'calendar': {
                'title': 'Календарь',
                'icon': 'fas fa-calendar',
                'url': 'google_oauth:calendar_events'
            },
            'invites': {
                'title': 'Инвайты',
                'icon': 'fas fa-envelope',
                'url': 'google_oauth:invite_dashboard',
                'submenu': {
                    'list': {
                        'title': 'Список инвайтов',
                        'icon': 'fas fa-list',
                        'url': 'google_oauth:invite_list'
                    },
                    'create': {
                        'title': 'Создать инвайт',
                        'icon': 'fas fa-plus',
                        'url': 'google_oauth:invite_create'
                    }
                }
            },
            'scorecard_settings': {
                'title': 'Настройки Scorecard',
                'icon': 'fas fa-folder-tree',
                'url': 'google_oauth:scorecard_path_settings'
            }
        }
    },
    'gemini': {
        'title': 'Gemini AI',
        'icon': 'fas fa-robot',
        'url': 'gemini:dashboard',
        'submenu': {}
    },
    'vacancies_finance': {
        'title': 'Вакансии и финансы',
        'icon': 'fas fa-briefcase',
        'url': 'vacancies:dashboard',
        'submenu': {
            'dashboard': {
                'title': 'Дашборд',
                'icon': 'fas fa-tachometer-alt',
                'url': 'vacancies:dashboard'
            },
            'vacancies': {
                'title': 'Вакансии',
                'icon': 'fas fa-list',
                'url': 'vacancies:vacancy_list'
            },
            'salary_ranges': {
                'title': 'Зарплатные вилки',
                'icon': 'fas fa-money-bill-wave',
                'url': 'vacancies:salary_ranges_list'
            },
            'grades_currency': {
                'title': 'Грейды, налоги и курсы',
                'icon': 'fas fa-chart-line',
                'url': 'finance:dashboard'
            },
            'benchmarks': {
                'title': 'Бенчмарки',
                'icon': 'fas fa-chart-bar',
                'url': 'finance:benchmarks_dashboard',
                'submenu': {
                    'dashboard': {
                        'title': 'Dashboard',
                        'icon': 'fas fa-tachometer-alt',
                        'url': 'finance:benchmarks_dashboard'
                    },
                    'list': {
                        'title': 'Все бенчмарки',
                        'icon': 'fas fa-list',
                        'url': 'finance:benchmarks_list'
                    },
                    'settings': {
                        'title': 'Настройки',
                        'icon': 'fas fa-cog',
                        'url': 'finance:benchmark_settings'
                    }
                }
            }
        }
    },
    'interviewers': {
        'title': 'Интервьюеры',
        'icon': 'fas fa-user-tie',
        'url': 'interviewers:interviewer_dashboard',
        'submenu': {
            'list': {
                'title': 'Интервьюеры',
                'icon': 'fas fa-users',
                'url': 'interviewers:interviewer_list'
            },
            'rules': {
                'title': 'Правила привлечения',
                'icon': 'fas fa-gavel',
                'url': 'interviewers:rule_list'
            }
        }
    },
    'clickup_int': {
        'title': 'ClickUp',
        'icon': 'fas fa-tasks',
        'url': 'clickup_int:dashboard',
        'submenu': {
            'dashboard': {
                'title': 'Главная',
                'icon': 'fas fa-tachometer-alt',
                'url': 'clickup_int:dashboard'
            },
            'lists': {
                'title': 'Списки',
                'icon': 'fas fa-list',
                'url': 'clickup_int:tasks_list'
            },
            'import': {
                'title': 'Импорт',
                'icon': 'fas fa-upload',
                'url': 'clickup_int:bulk_import'
            },
            'logs': {
                'title': 'Логи',
                'icon': 'fas fa-history',
                'url': 'clickup_int:sync_logs'
            },
            'settings': {
                'title': 'Настройки',
                'icon': 'fas fa-cog',
                'url': 'clickup_int:settings'
            }
        }
    },
    'notion_int': {
        'title': 'Notion',
        'icon': 'fas fa-sticky-note',
        'url': 'notion_int:dashboard',
        'submenu': {
            'dashboard': {
                'title': 'Главная',
                'icon': 'fas fa-tachometer-alt',
                'url': 'notion_int:dashboard'
            },
            'lists': {
                'title': 'Списки',
                'icon': 'fas fa-list',
                'url': 'notion_int:pages_list'
            },
            'import': {
                'title': 'Импорт',
                'icon': 'fas fa-upload',
                'url': 'notion_int:bulk_import'
            },
            'logs': {
                'title': 'Логи',
                'icon': 'fas fa-history',
                'url': 'notion_int:sync_logs'
            },
            'settings': {
                'title': 'Настройки',
                'icon': 'fas fa-cog',
                'url': 'notion_int:settings'
            }
        }
    },
    'telegram': {
        'title': 'Telegram',
        'icon': 'fab fa-telegram',
        'url': 'telegram:dashboard',
        'submenu': {
            'chats': {
                'title': 'Чаты',
                'icon': 'fas fa-comments',
                'url': 'telegram:dashboard'
            },
            'contacts': {
                'title': 'Контакты',
                'icon': 'fas fa-address-book',
                'url': 'telegram:dashboard'
            },
            'automation': {
                'title': 'Автоматизация',
                'icon': 'fas fa-robot',
                'url': 'telegram:dashboard'
            }
        }
    }
}

def is_menu_active(request, menu_config):
    """Проверяет, активен ли пункт меню - точное совпадение или начало пути"""
    try:
        # Проверка точного совпадения URL
        try:
            menu_url = reverse(menu_config['url'])
            if request.path == menu_url:
                return True
        except NoReverseMatch:
            pass
            
        # Проверка по началу пути для вложенных страниц
        try:
            menu_url = reverse(menu_config['url'])
            if request.path.startswith(menu_url.rstrip('/')):
                return True
        except NoReverseMatch:
            pass
            
    except Exception:
        pass
    
    return False

def has_active_submenu(request, submenu):
    """Проверяет, есть ли активные пункты в подменю"""
    for key, item in submenu.items():
        if is_menu_active(request, item):
            return True
        if 'submenu' in item and has_active_submenu(request, item['submenu']):
            return True
    return False

def render_menu_item(request, key, item, level=0):
    """Рендерит пункт меню"""
    try:
        url = reverse(item['url'])
    except NoReverseMatch:
        url = '#'
    
    is_active = is_menu_active(request, item)
    has_submenu = 'submenu' in item and item['submenu']
    has_active_child = has_submenu and has_active_submenu(request, item['submenu'])
    should_expand = is_active or has_active_child
    
    # CSS классы
    nav_classes = ['nav-link']
    # Добавляем active для активного элемента ИЛИ если есть активный дочерний элемент
    if is_active or has_active_child:
        nav_classes.append('active')
    if has_submenu:
        nav_classes.append('menu-toggle')
    
    # Отступы для вложенности
    margin_class = f'ms-{level}' if level > 0 else ''
    
    # ID для collapse
    submenu_id = f"{key}-submenu-{level}" if has_submenu else ""
    
    html = f'''
    <li class="nav-item {margin_class} {'has-submenu' if has_submenu else ''}">
        <a class="{' '.join(nav_classes)}" 
           href="{url}"
           {'data-bs-toggle="collapse"' if has_submenu else ''}
           {'data-bs-target="#' + submenu_id + '"' if has_submenu else ''}
           {'aria-expanded="' + ('true' if should_expand else 'false') + '"' if has_submenu else ''}>
            {f'<div class="hrhelper-logo-adaptive" style="width: 38px; height: 38px; margin-top: -12px; margin-left: -11px; margin-bottom: -12px; margin-right: -4px;"></div>' if item['icon'] == 'hrhelper-logo' else f'<i class="{item["icon"]} me-2"></i>'}
            {item['title']}
            {'<i class="fas fa-chevron-down submenu-arrow ms-auto"></i>' if has_submenu else ''}
        </a>'''
    
    if has_submenu:
        html += f'''
        <div class="collapse {'show' if should_expand else ''}" id="{submenu_id}">
            <ul class="nav flex-column">'''
        
        for sub_key, sub_item in item['submenu'].items():
            html += render_menu_item(request, sub_key, sub_item, level + 1)
        
        html += '''
            </ul>
        </div>'''
    
    html += '</li>'
    return html

@register.simple_tag(takes_context=True)
def render_sidebar_menu(context):
    """Рендерит полное многоуровневое меню"""
    request = context['request']
    
    html = '<ul class="nav flex-column">'
    
    for key, item in SIDEBAR_MENU.items():
        html += render_menu_item(request, key, item)
    
    html += '</ul>'
    
    return mark_safe(html)
