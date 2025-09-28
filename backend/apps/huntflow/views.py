# Импорты из новых модулей
from logic.integration.huntflow.huntflow_service import (
    huntflow_dashboard, vacancies_list, candidates_list,
    huntflow_settings, huntflow_sync, huntflow_test_connection,
    huntflow_clear_cache
)
from logic.base.response_handler import UnifiedResponseHandler

# Старые импорты (для совместимости)
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

from .services import HuntflowService


def get_correct_account_id(user, fallback_account_id=None):
    """
    Получает правильный account_id пользователя из Huntflow API
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - user: пользователь Django
    - fallback_account_id: резервный account_id если не удалось получить из API
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение списка аккаунтов пользователя
    
    ОБРАБОТКА:
    - Создание HuntflowService для пользователя
    - Получение списка аккаунтов из API
    - Извлечение первого доступного account_id
    - Обработка ошибок с fallback значением
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - account_id: правильный ID аккаунта для работы с Huntflow API
    
    СВЯЗИ:
    - Использует: HuntflowService, Huntflow API
    - Передает: account_id для использования в других функциях
    - Может вызываться из: huntflow views, services
    """
    try:
        huntflow_service = HuntflowService(user)
        accounts = huntflow_service.get_accounts()
        
        if accounts and 'items' in accounts and accounts['items']:
            account_id = accounts['items'][0]['id']
            print(f"🔍 Получен account_id из API: {account_id}")
            return account_id
        else:
            print(f"⚠️ Не удалось получить account_id из API, используем fallback: {fallback_account_id}")
            return fallback_account_id
            
    except Exception as e:
        print(f"❌ Ошибка получения account_id: {e}")
        return fallback_account_id


@login_required
def huntflow_dashboard(request):
    """
    Главная страница интеграции с Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь с настройками Huntflow
    
    ИСТОЧНИКИ ДАННЫЕ:
    - request.user.huntflow_prod_url, request.user.huntflow_sandbox_url
    - HuntflowService для получения данных из API
    
    ОБРАБОТКА:
    - Проверка настройки Huntflow у пользователя
    - Получение статистики из Huntflow API
    - Обработка ошибок и отображение соответствующих сообщений
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с данными Huntflow и статистикой
    - render: HTML страница 'huntflow/dashboard.html'
    
    СВЯЗИ:
    - Использует: HuntflowService, messages
    - Передает данные в: huntflow/dashboard.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Проверяем, настроен ли Huntflow у пользователя
        if not request.user.huntflow_prod_url and not request.user.huntflow_sandbox_url:
            messages.warning(request, 'Huntflow не настроен. Обратитесь к администратору.')
            return render(request, 'huntflow/dashboard.html', {
                'huntflow_configured': False
            })
        
        # Создаем сервис Huntflow
        huntflow_service = HuntflowService(request.user)
        
        # Тестируем подключение
        connection_test = huntflow_service.test_connection()
        
        if not connection_test:
            messages.error(request, 'Не удалось подключиться к Huntflow API. Проверьте настройки.')
            return render(request, 'huntflow/dashboard.html', {
                'huntflow_configured': True,
                'connection_test': False
            })
        
        # Получаем список организаций
        accounts = huntflow_service.get_accounts()
        
        # Извлекаем список организаций из ответа API
        accounts_list = accounts.get('items', []) if accounts else []
        
        context = {
            'huntflow_configured': True,
            'connection_test': True,
            'accounts': accounts_list,  # Для dashboard.html
            'accounts_for_menu': {'items': accounts_list},  # Для template tag
            'active_system': request.user.active_system,
            'base_url': huntflow_service.base_url
        }
        
        return render(request, 'huntflow/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке данных Huntflow: {str(e)}')
        return render(request, 'huntflow/dashboard.html', {
            'huntflow_configured': True,
            'connection_test': False,
            'error': str(e)
        })


@login_required
def vacancies_list(request, account_id):
    """
    Список вакансий для организации
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - request.GET: page, count, state (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение списка вакансий и статусов
    
    ОБРАБОТКА:
    - Получение правильного account_id через get_correct_account_id
    - Фильтрация вакансий по статусу
    - Получение статусов для фильтрации
    - Получение информации об организации
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с вакансиями, статусами и информацией об организации
    - render: HTML страница 'huntflow/vacancies_list.html'
    
    СВЯЗИ:
    - Использует: HuntflowService, get_correct_account_id
    - Передает данные в: huntflow/vacancies_list.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Получаем правильный account_id
        correct_account_id = get_correct_account_id(request.user, account_id)
        
        huntflow_service = HuntflowService(request.user)
        
        # Получаем параметры фильтрации
        page = request.GET.get('page', 1)
        count = request.GET.get('count', 30)
        state = request.GET.get('state', '')
        
        # Получаем вакансии с правильным account_id
        vacancies = huntflow_service.get_vacancies(
            account_id=correct_account_id,
            page=page,
            count=count,
            state=state if state else None
        )
        
        # Получаем статусы для фильтрации
        statuses = huntflow_service.get_vacancy_statuses(correct_account_id)
        
        # Получаем информацию об организации для хлебных крошек
        accounts = huntflow_service.get_accounts()
        account_name = f'Организация {account_id}'
        if accounts and 'items' in accounts:
            for account in accounts['items']:
                if account['id'] == account_id:
                    account_name = account.get('name', account_name)
                    break
        
        context = {
            'account_id': correct_account_id,  # Используем правильный account_id
            'account_name': account_name,
            'accounts': accounts,  # Добавляем для sidebar menu
            'vacancies': vacancies,
            'statuses': statuses,
            'current_page': int(page),
            'current_count': int(count),
            'current_state': state
        }
        
        return render(request, 'huntflow/vacancies_list.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке вакансий: {str(e)}')
        return redirect('huntflow:dashboard')


@login_required
def vacancy_detail(request, account_id, vacancy_id):
    """
    Детальная информация о вакансии
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - vacancy_id: ID вакансии
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение информации о вакансии и дополнительных полей
    
    ОБРАБОТКА:
    - Получение правильного account_id через get_correct_account_id
    - Получение информации о вакансии
    - Получение дополнительных полей вакансии
    - Получение информации об организации
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с данными вакансии и дополнительными полями
    - render: HTML страница 'huntflow/vacancy_detail.html'
    
    СВЯЗИ:
    - Использует: HuntflowService, get_correct_account_id
    - Передает данные в: huntflow/vacancy_detail.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Получаем правильный account_id
        correct_account_id = get_correct_account_id(request.user, account_id)
        
        huntflow_service = HuntflowService(request.user)
        
        # Получаем информацию о вакансии с правильным account_id
        vacancy = huntflow_service.get_vacancy(correct_account_id, vacancy_id)
        
        if not vacancy:
            messages.error(request, 'Вакансия не найдена')
            return redirect('huntflow:vacancies_list', account_id=correct_account_id)
        
        # Получаем дополнительные поля
        additional_fields = huntflow_service.get_vacancy_additional_fields(correct_account_id)
        
        # Получаем информацию об организации для хлебных крошек
        accounts = huntflow_service.get_accounts()
        account_name = f'Организация {account_id}'
        if accounts and 'items' in accounts:
            for account in accounts['items']:
                if account['id'] == account_id:
                    account_name = account.get('name', account_name)
                    break
        
        context = {
            'account_id': correct_account_id,  # Используем правильный account_id
            'account_name': account_name,
            'accounts': accounts,  # Добавляем для sidebar menu
            'vacancy': vacancy,
            'vacancy_name': vacancy.get('position', f'Вакансия {vacancy_id}') if vacancy else f'Вакансия {vacancy_id}',
            'additional_fields': additional_fields
        }
        
        return render(request, 'huntflow/vacancy_detail.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке вакансии: {str(e)}')
        return redirect('huntflow:vacancies_list', account_id=account_id)


@login_required
def applicants_list(request, account_id):
    """
    Список кандидатов для организации
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - request.GET: page, count, status, vacancy (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение списка кандидатов, статусов и вакансий
    
    ОБРАБОТКА:
    - Получение правильного account_id через get_correct_account_id
    - Фильтрация кандидатов по статусу и вакансии
    - Получение статусов и вакансий для фильтрации
    - Обогащение данных кандидатов информацией о статусах и вакансиях
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с кандидатами, статусами и вакансиями
    - render: HTML страница 'huntflow/applicants_list.html'
    
    СВЯЗИ:
    - Использует: HuntflowService, get_correct_account_id
    - Передает данные в: huntflow/applicants_list.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Получаем правильный account_id
        correct_account_id = get_correct_account_id(request.user, account_id)
        
        huntflow_service = HuntflowService(request.user)
        
        # Получаем параметры фильтрации
        page = request.GET.get('page', 1)
        count = request.GET.get('count', 30)
        status = request.GET.get('status', '')
        vacancy = request.GET.get('vacancy', '')
        
        # Получаем кандидатов с правильным account_id
        applicants = huntflow_service.get_applicants(
            account_id=correct_account_id,
            page=page,
            count=count,
            status=status if status else None,
            vacancy=vacancy if vacancy else None
        )
        
        # Получаем статусы для фильтрации
        statuses = huntflow_service.get_vacancy_statuses(correct_account_id)
        
        # Получаем вакансии для фильтрации
        vacancies = huntflow_service.get_vacancies(correct_account_id, count=100)
        
        # Создаем словари для быстрого поиска
        statuses_dict = {}
        if statuses and 'items' in statuses:
            for status_item in statuses['items']:
                statuses_dict[status_item['id']] = status_item
        
        vacancies_dict = {}
        if vacancies and 'items' in vacancies:
            for vacancy_item in vacancies['items']:
                vacancies_dict[vacancy_item['id']] = vacancy_item
        
        # Обогащаем данные кандидатов
        if applicants and 'items' in applicants:
            for applicant in applicants['items']:
                if applicant.get('links') and len(applicant['links']) > 0:
                    link = applicant['links'][0]
                    if 'status' in link and link['status'] in statuses_dict:
                        applicant['status_info'] = statuses_dict[link['status']]
                    if 'vacancy' in link and link['vacancy'] in vacancies_dict:
                        applicant['vacancy_info'] = vacancies_dict[link['vacancy']]
        
        # Получаем информацию об организации для хлебных крошек
        accounts = huntflow_service.get_accounts()
        account_name = f'Организация {account_id}'
        if accounts and 'items' in accounts:
            for account in accounts['items']:
                if account['id'] == account_id:
                    account_name = account.get('name', account_name)
                    break
        
        context = {
            'account_id': correct_account_id,  # Используем правильный account_id
            'account_name': account_name,
            'accounts': accounts,  # Добавляем для sidebar menu
            'applicants': applicants,
            'statuses': statuses,
            'vacancies': vacancies,
            'current_page': int(page),
            'current_count': int(count),
            'current_status': status,
            'current_vacancy': vacancy
        }
        
        return render(request, 'huntflow/applicants_list.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке кандидатов: {str(e)}')
        return redirect('huntflow:dashboard')


@login_required
def applicant_detail(request, account_id, applicant_id):
    """
    Детальная информация о кандидате
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - applicant_id: ID кандидата
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение информации о кандидате, анкете, логах, статусах, вакансиях и метках
    
    ОБРАБОТКА:
    - Получение правильного account_id через get_correct_account_id
    - Получение информации о кандидате и его анкете
    - Получение схемы анкеты
    - Получение логов кандидата для поиска комментариев
    - Обогащение данных кандидата информацией о статусах, вакансиях и метках
    - Обработка логов для отображения истории изменений
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с данными кандидата, анкетой, логами и комментариями
    - render: HTML страница 'huntflow/applicant_detail.html'
    
    СВЯЗИ:
    - Использует: HuntflowService, get_correct_account_id
    - Передает данные в: huntflow/applicant_detail.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Получаем правильный account_id
        correct_account_id = get_correct_account_id(request.user, account_id)
        
        huntflow_service = HuntflowService(request.user)
        
        # Получаем информацию о кандидате с правильным account_id
        applicant = huntflow_service.get_applicant(correct_account_id, applicant_id)
        
        if not applicant:
            messages.error(request, 'Кандидат не найден')
            return redirect('huntflow:applicants_list', account_id=correct_account_id)
        
        # Получаем анкету кандидата
        questionary = huntflow_service.get_applicant_questionary(correct_account_id, applicant_id)
        
        # Получаем схему анкеты
        questionary_schema = huntflow_service.get_applicant_questionary_schema(correct_account_id)
        
        # Получаем логи кандидата для поиска комментариев
        applicant_logs = huntflow_service.get_applicant_logs(correct_account_id, applicant_id)
        # print(f"DEBUG: Получены логи кандидата {applicant_id}: {applicant_logs}")
        
        # Получаем статусы, вакансии и метки для обогащения данных
        statuses = huntflow_service.get_vacancy_statuses(correct_account_id)
        vacancies = huntflow_service.get_vacancies(correct_account_id, count=100)
        tags = huntflow_service.get_tags(correct_account_id)
        
        # Создаем словари для быстрого поиска
        statuses_dict = {}
        if statuses and 'items' in statuses:
            for status_item in statuses['items']:
                statuses_dict[status_item['id']] = status_item
        
        vacancies_dict = {}
        if vacancies and 'items' in vacancies:
            for vacancy_item in vacancies['items']:
                vacancies_dict[vacancy_item['id']] = vacancy_item
        
        tags_dict = {}
        if tags and 'items' in tags:
            for tag_item in tags['items']:
                tags_dict[tag_item['id']] = tag_item
        
        # Извлекаем логи кандидата (все типы)
        applicant_logs_processed = []
        if applicant_logs and 'items' in applicant_logs:
            for log in applicant_logs['items']:
                # Получаем информацию о статусе, если есть
                status_info = None
                if log.get('status') and log['status'] in statuses_dict:
                    status_info = statuses_dict[log['status']]
                
                # Получаем информацию о вакансии, если есть
                vacancy_info = None
                if log.get('vacancy') and log['vacancy'] in vacancies_dict:
                    vacancy_info = vacancies_dict[log['vacancy']]
                
                # Определяем тип лога для отображения
                log_type_display = {
                    'ADD': 'Создан',
                    'UPDATE': 'Обновлен',
                    'VACANCY-ADD': 'Добавлен к вакансии',
                    'STATUS': 'Изменен статус',
                    'COMMENT': 'Комментарий',
                    'DOUBLE': 'Дублирование',
                    'AGREEMENT': 'Согласие',
                    'MAIL': 'Письмо',
                    'RESPONSE': 'Ответ'
                }.get(log.get('type'), log.get('type', 'Неизвестно'))
                
                # Обрабатываем комментарий - убираем префикс "Изменение статуса:"
                comment_text = log.get('comment', '')
                if comment_text and comment_text.startswith('Изменение статуса:'):
                    comment_text = comment_text.replace('Изменение статуса:', '').strip()
                
                # Создаем объект лога для отображения
                log_item = {
                    'type': log.get('type'),
                    'type_display': log_type_display,
                    'created': log.get('created'),
                    'author': log.get('account_info', {}).get('name') or log.get('account_info', {}).get('email', 'Неизвестно'),
                    'status': status_info,
                    'vacancy': vacancy_info,
                    'vacancy_id': log.get('vacancy'),
                    'comment': comment_text,
                    'files': log.get('files', []),
                    'email': log.get('email'),
                    'im': log.get('im'),
                    'sms': log.get('sms')
                }
                
                # Если это лог изменения статуса, но нет комментария, создаем его из статуса
                if log.get('type') == 'STATUS' and not log.get('comment') and status_info:
                    log_item['comment'] = f"Статус изменен на: {status_info['name']}"
                
                applicant_logs_processed.append(log_item)
        
        # Отдельно извлекаем комментарии для карточки комментариев
        comments = [log for log in applicant_logs_processed if log['comment']]
        
        # Подсчитываем количество комментариев с содержимым
        comments_count = len(comments)
        
        # Обогащаем данные кандидата
        if applicant.get('links') and len(applicant['links']) > 0:
            link = applicant['links'][0]
            if 'status' in link and link['status'] in statuses_dict:
                applicant['status_info'] = statuses_dict[link['status']]
            if 'vacancy' in link and link['vacancy'] in vacancies_dict:
                applicant['vacancy_info'] = vacancies_dict[link['vacancy']]
        
        # Обогащаем метки кандидата
        if applicant.get('tags'):
            enriched_tags = []
            for tag in applicant['tags']:
                if isinstance(tag, dict) and 'tag' in tag:
                    tag_id = tag['tag']
                    if tag_id in tags_dict:
                        enriched_tags.append(tags_dict[tag_id])
                    else:
                        # Если метка не найдена в словаре, создаем базовую структуру
                        enriched_tags.append({
                            'id': tag_id,
                            'name': f'Метка {tag_id}',
                            'color': '#6c757d'
                        })
                else:
                    # Если метка уже в правильном формате
                    enriched_tags.append(tag)
            applicant['enriched_tags'] = enriched_tags
        
        # Объединяем данные анкеты со схемой
        enriched_questionary = {}
        if questionary and questionary_schema:
            for field_key, field_value in questionary.items():
                if field_key in questionary_schema:
                    enriched_questionary[field_key] = {
                        'title': questionary_schema[field_key].get('title', field_key),
                        'value': field_value,
                        'type': questionary_schema[field_key].get('type', 'unknown'),
                        'required': questionary_schema[field_key].get('required', False),
                        'options': questionary_schema[field_key].get('options', questionary_schema[field_key].get('choices', questionary_schema[field_key].get('values', []))),  # Добавляем опции для select полей
                        'schema': questionary_schema[field_key]  # Передаем полную схему поля
                    }
                else:
                    enriched_questionary[field_key] = {
                        'title': field_key,
                        'value': field_value,
                        'type': 'unknown',
                        'required': False,
                        'options': [],
                        'schema': {}
                    }
        elif questionary:
            # Если нет схемы, создаем простую структуру
            for field_key, field_value in questionary.items():
                enriched_questionary[field_key] = {
                    'title': field_key,
                    'value': field_value,
                    'type': 'unknown',
                    'required': False
                }
        
        # Получаем информацию об организации для хлебных крошек
        accounts = huntflow_service.get_accounts()
        account_name = f'Организация {account_id}'
        if accounts and 'items' in accounts:
            for account in accounts['items']:
                if account['id'] == account_id:
                    account_name = account.get('name', account_name)
                    break
        
        # Формируем имя кандидата для хлебных крошек
        applicant_name = f'Кандидат {applicant_id}'
        if applicant.get('first_name') or applicant.get('last_name'):
            applicant_name = f"{applicant.get('first_name', '')} {applicant.get('last_name', '')}".strip()
        
        context = {
            'account_id': correct_account_id,  # Используем правильный account_id
            'account_name': account_name,
            'accounts': accounts,  # Добавляем для sidebar menu
            'applicant': applicant,
            'applicant_name': applicant_name,
            'questionary': enriched_questionary,
            'questionary_schema': questionary_schema,
            'applicant_logs': applicant_logs_processed,
            'comments': comments,
            'comments_count': comments_count
        }
        
        
        # print(f"DEBUG: Финальные данные кандидата для отображения: {applicant}")
        # print(f"DEBUG: Количество логов: {len(applicant_logs_processed)}")
        # print(f"DEBUG: Количество комментариев: {comments_count}")
        
        return render(request, 'huntflow/applicant_detail.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке кандидата: {str(e)}')
        return redirect('huntflow:applicants_list', account_id=account_id)


@login_required
def applicant_edit(request, account_id, applicant_id):
    """
    Редактирование кандидата
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - applicant_id: ID кандидата
    - request.user: аутентифицированный пользователь
    - request.POST: данные для обновления кандидата (first_name, last_name, email, phone, tags, status_id, status_comment, questionary_*)
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение и обновление информации о кандидате
    
    ОБРАБОТКА:
    - Получение правильного account_id через get_correct_account_id
    - Получение текущих данных кандидата
    - Обработка POST запроса для обновления данных
    - Обновление основных полей кандидата
    - Обновление меток кандидата
    - Обновление анкеты кандидата
    - Обновление статуса кандидата с комментарием
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - context: словарь с данными кандидата для редактирования
    - render: HTML страница 'huntflow/applicant_edit.html'
    - redirect: на страницу детальной информации о кандидате после успешного обновления
    
    СВЯЗИ:
    - Использует: HuntflowService, get_correct_account_id
    - Передает данные в: huntflow/applicant_edit.html
    - Может вызываться из: huntflow/ URL patterns
    """
    try:
        # Получаем правильный account_id
        correct_account_id = get_correct_account_id(request.user, account_id)
        
        huntflow_service = HuntflowService(request.user)
        
        # Получаем информацию о кандидате с правильным account_id
        applicant = huntflow_service.get_applicant(correct_account_id, applicant_id)
        
        if not applicant:
            messages.error(request, 'Кандидат не найден')
            return redirect('huntflow:applicants_list', account_id=correct_account_id)
        
        # Получаем анкету кандидата
        questionary = huntflow_service.get_applicant_questionary(correct_account_id, applicant_id)
        
        # Получаем схему анкеты
        questionary_schema = huntflow_service.get_applicant_questionary_schema(correct_account_id)
        
        # Получаем статусы, вакансии и метки для обогащения данных
        statuses = huntflow_service.get_vacancy_statuses(correct_account_id)
        vacancies = huntflow_service.get_vacancies(correct_account_id, count=100)
        tags = huntflow_service.get_tags(correct_account_id)
        
        # Создаем словари для быстрого поиска
        statuses_dict = {}
        if statuses and 'items' in statuses:
            for status_item in statuses['items']:
                statuses_dict[status_item['id']] = status_item
        
        vacancies_dict = {}
        if vacancies and 'items' in vacancies:
            for vacancy_item in vacancies['items']:
                vacancies_dict[vacancy_item['id']] = vacancy_item
        
        tags_dict = {}
        if tags and 'items' in tags:
            for tag_item in tags['items']:
                tags_dict[tag_item['id']] = tag_item
        
        # Обогащаем данные кандидата
        if applicant.get('links') and len(applicant['links']) > 0:
            link = applicant['links'][0]
            if 'status' in link and link['status'] in statuses_dict:
                applicant['status_info'] = statuses_dict[link['status']]
            if 'vacancy' in link and link['vacancy'] in vacancies_dict:
                applicant['vacancy_info'] = vacancies_dict[link['vacancy']]
        
        # Обогащаем метки кандидата
        if applicant.get('tags'):
            enriched_tags = []
            for tag in applicant['tags']:
                if isinstance(tag, dict) and 'tag' in tag:
                    tag_id = tag['tag']
                    if tag_id in tags_dict:
                        enriched_tags.append(tags_dict[tag_id])
                    else:
                        # Если метка не найдена в словаре, создаем базовую структуру
                        enriched_tags.append({
                            'id': tag_id,
                            'name': f'Метка {tag_id}',
                            'color': '#6c757d'
                        })
                else:
                    # Если метка уже в правильном формате
                    enriched_tags.append(tag)
            applicant['enriched_tags'] = enriched_tags
        
        # Объединяем данные анкеты со схемой
        enriched_questionary = {}
        if questionary and questionary_schema:
            for field_key, field_value in questionary.items():
                if field_key in questionary_schema:
                    enriched_questionary[field_key] = {
                        'title': questionary_schema[field_key].get('title', field_key),
                        'value': field_value,
                        'type': questionary_schema[field_key].get('type', 'unknown'),
                        'required': questionary_schema[field_key].get('required', False),
                        'options': questionary_schema[field_key].get('options', questionary_schema[field_key].get('choices', questionary_schema[field_key].get('values', []))),  # Добавляем опции для select полей
                        'schema': questionary_schema[field_key]  # Передаем полную схему поля
                    }
                else:
                    enriched_questionary[field_key] = {
                        'title': field_key,
                        'value': field_value,
                        'type': 'unknown',
                        'required': False,
                        'options': [],
                        'schema': {}
                    }
        elif questionary:
            # Если нет схемы, создаем простую структуру
            for field_key, field_value in questionary.items():
                enriched_questionary[field_key] = {
                    'title': field_key,
                    'value': field_value,
                    'type': 'unknown',
                    'required': False
                }
        elif questionary_schema:
            # Если есть схема, но нет данных анкеты, создаем пустые поля
            for field_key, field_info in questionary_schema.items():
                enriched_questionary[field_key] = {
                    'title': field_info.get('title', field_key),
                    'value': None,
                    'type': field_info.get('type', 'unknown'),
                    'required': field_info.get('required', False),
                    'options': field_info.get('options', field_info.get('choices', field_info.get('values', []))),
                    'schema': field_info
                }
        
        if request.method == 'POST':
            # Обработка формы редактирования
            try:
                print(f"DEBUG: POST данные: {dict(request.POST)}")
                success_messages = []
                error_messages = []
                
                # 1. Собираем все данные для обновления в один запрос
                update_data = {}
                
                # Основные поля - всегда отправляем, даже если пустые
                if 'first_name' in request.POST:
                    update_data['first_name'] = request.POST['first_name'].strip() or None
                if 'last_name' in request.POST:
                    update_data['last_name'] = request.POST['last_name'].strip() or None
                if 'middle_name' in request.POST:
                    update_data['middle_name'] = request.POST['middle_name'].strip() or None
                if 'email' in request.POST:
                    update_data['email'] = request.POST['email'].strip() or None
                if 'phone' in request.POST:
                    update_data['phone'] = request.POST['phone'].strip() or None
                if 'money' in request.POST:
                    update_data['money'] = request.POST['money'].strip() or None
                if 'telegram' in request.POST:
                    # Обновляем Telegram в социальных сетях
                    telegram_value = request.POST['telegram'].strip()
                    if telegram_value:
                        # Если есть существующие социальные сети, обновляем Telegram
                        if 'social' not in update_data:
                            update_data['social'] = applicant.get('social', [])
                        
                        # Ищем существующий Telegram
                        telegram_found = False
                        for social in update_data['social']:
                            if social.get('social_type') == 'TELEGRAM':
                                social['value'] = telegram_value
                                telegram_found = True
                                break
                        
                        # Если Telegram не найден, добавляем новый
                        if not telegram_found:
                            update_data['social'].append({
                                'social_type': 'TELEGRAM',
                                'value': telegram_value
                            })
                    else:
                        # Если поле пустое, удаляем Telegram
                        if 'social' not in update_data:
                            update_data['social'] = applicant.get('social', [])
                        update_data['social'] = [s for s in update_data['social'] if s.get('social_type') != 'TELEGRAM']
                
                # Добавляем метки в общий запрос (пробуем разные форматы)
                if 'tags' in request.POST:
                    tag_ids = [int(tag_id) for tag_id in request.POST.getlist('tags') if tag_id]
                    # Пробуем разные форматы для меток
                    # Формат 1: [{"tag": id}] - простой формат
                    # Формат 2: [{"tag": id, "id": internal_id}] - с внутренним ID
                    # Формат 3: просто массив ID
                    update_data['tags'] = [{'tag': tag_id} for tag_id in tag_ids]
                    # Также добавляем альтернативные форматы
                    update_data['tag_ids'] = tag_ids
                    update_data['tags_simple'] = tag_ids
                    print(f"DEBUG: Добавлены метки в общий запрос - Формат объектов: {update_data['tags']}")
                    print(f"DEBUG: Альтернативные форматы меток: tag_ids={tag_ids}, tags_simple={tag_ids}")
                
                # Собираем данные анкеты для отдельного обновления
                questionary_data = {}
                for key, value in request.POST.items():
                    if key.startswith('questionary_'):
                        field_key = key.replace('questionary_', '')
                        if value.strip():  # Только непустые значения
                            questionary_data[field_key] = value.strip()
                
                if questionary_data:
                    print(f"DEBUG: Данные анкеты для отдельного обновления: {questionary_data}")
                
                # Выполняем общий запрос обновления
                if update_data:
                    print(f"DEBUG: Общий запрос обновления - Данные: {update_data}")
                    print(f"DEBUG: Количество полей для обновления: {len(update_data)}")
                    for key, value in update_data.items():
                        print(f"DEBUG: Поле '{key}': '{value}'")
                    
                    updated_applicant = huntflow_service.update_applicant(correct_account_id, applicant_id, update_data)
                    print(f"DEBUG: Результат общего обновления: {updated_applicant}")
                    
                    if updated_applicant:
                        success_messages.append('Данные обновлены')
                    else:
                        error_messages.append('Ошибка при обновлении данных')
                else:
                    print("DEBUG: Нет данных для обновления в основном запросе")
                
                # 2. Обновляем метки отдельно
                if 'tags' in request.POST:
                    tag_ids = [int(tag_id) for tag_id in request.POST.getlist('tags') if tag_id]
                    tags_result = huntflow_service.update_applicant_tags(
                        correct_account_id, applicant_id, tag_ids
                    )
                    if tags_result:
                        success_messages.append('Метки обновлены')
                    else:
                        error_messages.append('Ошибка при обновлении меток')
                
                # 3. Обновляем анкету отдельно
                if questionary_data:
                    questionary_result = huntflow_service.update_applicant_questionary(
                        correct_account_id, applicant_id, questionary_data
                    )
                    if questionary_result:
                        success_messages.append('Анкета обновлена')
                    else:
                        error_messages.append('Ошибка при обновлении анкеты')
                
                # 4. Обновляем статус с привязкой к вакансии
                if 'status_id' in request.POST and request.POST['status_id']:
                    status_id = int(request.POST['status_id'])
                    status_comment = request.POST.get('status_comment', '')
                    
                    # Получаем текущую вакансию из данных кандидата
                    vacancy_id = None
                    if applicant.get('links'):
                        vacancy_id = applicant['links'][0].get('vacancy')
                    
                    # Отладочная информация
                    print(f"DEBUG: Обновление статуса - ID: {status_id}, Вакансия: {vacancy_id}, Комментарий: {status_comment}")
                    
                    # Обновляем статус с комментарием и привязкой к вакансии
                    status_result = huntflow_service.update_applicant_status(
                        account_id, applicant_id, status_id, 
                        status_comment.strip() if status_comment.strip() else None,
                        vacancy_id
                    )
                    print(f"DEBUG: Результат обновления статуса: {status_result}")
                    
                    if status_result:
                        success_messages.append('Статус обновлен')
                    else:
                        error_messages.append('Ошибка при обновлении статуса')
                
                
                # Показываем результаты
                if success_messages:
                    for msg in success_messages:
                        messages.success(request, msg)
                if error_messages:
                    for msg in error_messages:
                        messages.error(request, msg)
                
                # Если есть успешные обновления, перенаправляем
                if success_messages:
                    # Принудительно обновляем данные кандидата после изменений
                    print(f"DEBUG: Принудительно обновляем данные кандидата {applicant_id}")
                    # Добавляем небольшую задержку для синхронизации с Huntflow
                    import time
                    time.sleep(1)
                    return redirect('huntflow:applicant_detail', account_id=correct_account_id, applicant_id=applicant_id)
                    
            except Exception as e:
                messages.error(request, f'Ошибка при обновлении: {str(e)}')
        
        # Получаем информацию об организации для хлебных крошек
        accounts = huntflow_service.get_accounts()
        account_name = f'Организация {correct_account_id}'
        if accounts and 'items' in accounts:
            for account in accounts['items']:
                if account['id'] == correct_account_id:
                    account_name = account.get('name', account_name)
                    break
        
        # Формируем имя кандидата для хлебных крошек
        applicant_name = f'Кандидат {applicant_id}'
        if applicant.get('first_name') or applicant.get('last_name'):
            applicant_name = f"{applicant.get('first_name', '')} {applicant.get('last_name', '')}".strip()
        
        context = {
            'account_id': correct_account_id,  # Используем правильный account_id
            'account_name': account_name,
            'accounts': accounts,  # Добавляем для sidebar menu
            'applicant': applicant,
            'applicant_name': applicant_name,
            'questionary': enriched_questionary,
            'questionary_schema': questionary_schema,
            'statuses': statuses,
            'vacancies': vacancies,
            'tags': tags
        }
        
        return render(request, 'huntflow/applicant_edit.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка при загрузке кандидата: {str(e)}')
        return redirect('huntflow:applicants_list', account_id=correct_account_id)


@login_required
@require_http_methods(["POST"])
@csrf_exempt
def test_connection_ajax(request):
    """
    AJAX endpoint для тестирования подключения к Huntflow
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    
    ОБРАБОТКА:
    - Создание HuntflowService для пользователя
    - Тестирование подключения к Huntflow API
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - JsonResponse с результатом тестирования подключения
    
    СВЯЗИ:
    - Использует: HuntflowService
    - Передает: JsonResponse
    - Может вызываться из: AJAX запросы
    """
    try:
        huntflow_service = HuntflowService(request.user)
        connection_success = huntflow_service.test_connection()
        
        return JsonResponse({
            'success': connection_success,
            'message': 'Подключение успешно' if connection_success else 'Ошибка подключения'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
@require_http_methods(["POST"])
def create_comment_ajax(request, account_id, applicant_id):
    """
    AJAX endpoint для создания комментария к кандидату
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - applicant_id: ID кандидата
    - request.POST: comment (текст комментария)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫЕ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение информации о кандидате и создание комментария
    
    ОБРАБОТКА:
    - Валидация текста комментария
    - Получение информации о кандидате
    - Извлечение текущей вакансии и статуса из данных кандидата
    - Создание комментария с привязкой к вакансии и статусу
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - JsonResponse с результатом создания комментария
    
    СВЯЗИ:
    - Использует: HuntflowService
    - Передает: JsonResponse
    - Может вызываться из: AJAX запросы
    """
    try:
        huntflow_service = HuntflowService(request.user)
        
        # Получаем данные из запроса
        comment_text = request.POST.get('comment', '').strip()
        
        if not comment_text:
            return JsonResponse({
                'success': False,
                'message': 'Комментарий не может быть пустым'
            })
        
        # Получаем информацию о кандидате для получения вакансии и статуса
        applicant = huntflow_service.get_applicant(account_id, applicant_id)
        if not applicant:
            return JsonResponse({
                'success': False,
                'message': 'Кандидат не найден'
            })
        
        # Получаем текущую вакансию и статус из данных кандидата
        vacancy_id = None
        status_id = None
        if applicant.get('links'):
            vacancy_id = applicant['links'][0].get('vacancy')
            status_id = applicant['links'][0].get('status')
        
        if not vacancy_id or not status_id:
            return JsonResponse({
                'success': False,
                'message': 'У кандидата нет привязанной вакансии или статуса'
            })
        
        # Создаем комментарий с привязкой к вакансии и статусу
        result = huntflow_service.create_applicant_comment(
            account_id, applicant_id, comment_text, vacancy_id, status_id
        )
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Комментарий успешно добавлен',
                'comment_id': result.get('id'),
                'created': result.get('created')
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Ошибка при создании комментария'
            })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
@require_http_methods(["GET"])
def get_vacancies_ajax(request, account_id):
    """
    AJAX endpoint для получения вакансий
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - request.GET: page, count, state (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение списка вакансий
    
    ОБРАБОТКА:
    - Получение параметров фильтрации из GET запроса
    - Получение списка вакансий через HuntflowService
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - JsonResponse с данными вакансий
    
    СВЯЗИ:
    - Использует: HuntflowService
    - Передает: JsonResponse
    - Может вызываться из: AJAX запросы
    """
    try:
        huntflow_service = HuntflowService(request.user)
        
        # Получаем параметры
        page = request.GET.get('page', 1)
        count = request.GET.get('count', 30)
        state = request.GET.get('state', '')
        
        # Получаем вакансии
        vacancies = huntflow_service.get_vacancies(
            account_id=account_id,
            page=page,
            count=count,
            state=state if state else None
        )
        
        return JsonResponse({
            'success': True,
            'data': vacancies
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })


@login_required
@require_http_methods(["GET"])
def get_applicants_ajax(request, account_id):
    """
    AJAX endpoint для получения кандидатов
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - account_id: ID организации
    - request.GET: page, count, status, vacancy (параметры фильтрации)
    - request.user: аутентифицированный пользователь
    
    ИСТОЧНИКИ ДАННЫХ:
    - HuntflowService: сервис для работы с Huntflow API
    - Huntflow API: получение списка кандидатов
    
    ОБРАБОТКА:
    - Получение параметров фильтрации из GET запроса
    - Получение списка кандидатов через HuntflowService
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - JsonResponse с данными кандидатов
    
    СВЯЗИ:
    - Использует: HuntflowService
    - Передает: JsonResponse
    - Может вызываться из: AJAX запросы
    """
    try:
        huntflow_service = HuntflowService(request.user)
        
        # Получаем параметры
        page = request.GET.get('page', 1)
        count = request.GET.get('count', 30)
        status = request.GET.get('status', '')
        vacancy = request.GET.get('vacancy', '')
        
        # Получаем кандидатов
        applicants = huntflow_service.get_applicants(
            account_id=account_id,
            page=page,
            count=count,
            status=status if status else None,
            vacancy=vacancy if vacancy else None
        )
        
        return JsonResponse({
            'success': True,
            'data': applicants
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        })
