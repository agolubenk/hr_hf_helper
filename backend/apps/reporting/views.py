"""
Views для отчетности
"""
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from apps.reporting.services import ReportGenerator
from apps.vacancies.models import Vacancy
from apps.interviewers.models import Interviewer
from apps.reporting.models import CalendarEvent
from apps.google_oauth.models import GoogleOAuthAccount
from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService

User = get_user_model()


def parse_date_range(request, period='monthly'):
    """
    Вспомогательная функция для парсинга диапазона дат из запроса
    
    Returns:
        tuple: (start_date, end_date) - оба datetime с timezone
    """
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    
    # Если даты не указаны, используем текущий период
    if not start_date_str or not end_date_str:
        end_date = timezone.now()
        if period == 'daily':
            start_date = end_date - timedelta(days=30)
        elif period == 'weekly':
            start_date = end_date - timedelta(weeks=12)
        elif period == 'monthly':
            start_date = end_date - relativedelta(months=12)
        elif period == 'quarterly':
            start_date = end_date - relativedelta(months=12)
        elif period == 'yearly':
            start_date = end_date - relativedelta(years=5)
        else:
            start_date = end_date - relativedelta(months=12)
    else:
        try:
            # Парсим даты и конвертируем в aware datetime
            start_date_naive = datetime.fromisoformat(start_date_str)
            end_date_naive = datetime.fromisoformat(end_date_str)
            
            # Если datetime naive, добавляем timezone
            if timezone.is_naive(start_date_naive):
                start_date = timezone.make_aware(start_date_naive)
            else:
                start_date = start_date_naive
            
            if timezone.is_naive(end_date_naive):
                end_date = timezone.make_aware(end_date_naive)
            else:
                end_date = end_date_naive
            
            # Устанавливаем время начала дня для start_date и конец дня для end_date
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        except:
            end_date = timezone.now()
            start_date = end_date - relativedelta(months=12)
    
    return start_date, end_date


@login_required
def report_dashboard(request):
    """Главная страница отчетности"""
    return render(request, 'reporting/dashboard.html')


@login_required
def company_report(request):
    """Отчет по компании"""
    # Получаем параметры фильтров
    period = request.GET.get('period', 'monthly')  # daily, weekly, monthly, quarterly, yearly
    
    # Парсим диапазон дат
    start_date, end_date = parse_date_range(request, period)
    
    # Генерируем отчет
    generator = ReportGenerator(request.user)
    report_data = generator.generate_company_report(start_date, end_date, period)
    
    context = {
        'report_data': report_data,
        'period': period,
        'start_date': start_date.date(),
        'end_date': end_date.date(),
    }
    
    return render(request, 'reporting/company_report.html', context)


@login_required
def recruiters_summary_report(request):
    """Сводный отчет по всем рекрутерам с разбивкой по скринингам и интервью"""
    # Получаем параметры фильтров
    period = request.GET.get('period', 'monthly')
    
    # Парсим диапазон дат
    start_date, end_date = parse_date_range(request, period)
    
    # Генерируем отчет
    generator = ReportGenerator(request.user)
    report_data = generator.generate_recruiters_summary_report(start_date, end_date, period)
    
    context = {
        'report_data': report_data,
        'period': period,
        'start_date': start_date.date(),
        'end_date': end_date.date(),
    }
    
    return render(request, 'reporting/recruiters_summary_report.html', context)


@login_required
def recruiter_report(request, recruiter_id=None):
    """Отчет по рекрутеру"""
    # Если ID не указан, показываем список рекрутеров
    if not recruiter_id:
        recruiters = User.objects.filter(groups__name='Рекрутер').distinct()
        return render(request, 'reporting/recruiter_list.html', {'recruiters': recruiters})
    
    recruiter = get_object_or_404(User, id=recruiter_id, groups__name='Рекрутер')
    
    # Получаем параметры фильтров
    period = request.GET.get('period', 'monthly')
    
    # Парсим диапазон дат
    start_date, end_date = parse_date_range(request, period)
    
    # Генерируем отчет
    generator = ReportGenerator(request.user)
    report_data = generator.generate_recruiter_report(recruiter, start_date, end_date, period)
    
    context = {
        'report_data': report_data,
        'recruiter': recruiter,
        'period': period,
        'start_date': start_date.date(),
        'end_date': end_date.date(),
    }
    
    return render(request, 'reporting/recruiter_report.html', context)


@login_required
def vacancy_report(request, vacancy_id=None):
    """Отчет по вакансии"""
    # Если ID не указан, показываем список вакансий (активные и неактивные)
    if not vacancy_id:
        vacancies = Vacancy.objects.all().select_related('recruiter').order_by('-is_active', '-created_at')
        return render(request, 'reporting/vacancy_list.html', {'vacancies': vacancies})
    
    vacancy = get_object_or_404(Vacancy, id=vacancy_id)
    
    # Получаем параметры фильтров
    period = request.GET.get('period', 'monthly')
    
    # Парсим диапазон дат
    start_date, end_date = parse_date_range(request, period)
    
    # Генерируем отчет
    generator = ReportGenerator(request.user)
    report_data = generator.generate_vacancy_report(vacancy, start_date, end_date, period)
    
    context = {
        'report_data': report_data,
        'vacancy': vacancy,
        'period': period,
        'start_date': start_date.date(),
        'end_date': end_date.date(),
    }
    
    return render(request, 'reporting/vacancy_report.html', context)


@login_required
def interviewer_report(request, interviewer_id=None):
    """Отчет по интервьюеру"""
    # Если ID не указан, показываем список интервьюеров со статистикой
    if not interviewer_id:
        interviewers = Interviewer.objects.filter(is_active=True).order_by('last_name', 'first_name')
        
        # Получаем параметры фильтров для общей статистики
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        
        # Парсим диапазон дат
        if start_date_str and end_date_str:
            try:
                start_date_naive = datetime.fromisoformat(start_date_str)
                end_date_naive = datetime.fromisoformat(end_date_str)
                
                if timezone.is_naive(start_date_naive):
                    start_date = timezone.make_aware(start_date_naive)
                else:
                    start_date = start_date_naive
                
                if timezone.is_naive(end_date_naive):
                    end_date = timezone.make_aware(end_date_naive)
                else:
                    end_date = end_date_naive
                
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            except:
                # Если ошибка парсинга, используем значения по умолчанию
                end_date = timezone.now()
                start_date = end_date - relativedelta(months=12)
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        else:
            # Используем значения по умолчанию - последние 12 месяцев
            end_date = timezone.now()
            start_date = end_date - relativedelta(months=12)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Получаем все события за период
        all_events = CalendarEvent.objects.filter(
            start_time__gte=start_date,
            start_time__lte=end_date
        ).select_related('vacancy').order_by('start_time')
        
        # Собираем статистику по каждому интервьюеру
        interviewer_stats = []
        for interviewer in interviewers:
            interviewer_email_lower = interviewer.email.lower()
            
            # Фильтруем события, где интервьюер является участником
            interviewer_events = []
            for event in all_events:
                attendees = event.attendees or []
                is_participant = False
                
                for attendee in attendees:
                    if isinstance(attendee, dict):
                        attendee_email = attendee.get('email', '').lower()
                        if attendee_email == interviewer_email_lower:
                            is_participant = True
                            break
                    elif isinstance(attendee, str):
                        if attendee.lower() == interviewer_email_lower:
                            is_participant = True
                            break
                
                if is_participant:
                    interviewer_events.append(event)
            
            # Подсчитываем статистику
            screenings = sum(1 for e in interviewer_events if e.event_type == 'screening')
            interviews = sum(1 for e in interviewer_events if e.event_type == 'interview')
            total_time_minutes = sum(e.duration_minutes or 0 for e in interviewer_events)
            
            interviewer_stats.append({
                'interviewer': interviewer,
                'screenings': screenings,
                'interviews': interviews,
                'total_time_minutes': total_time_minutes,
            })
        
        # Получаем параметр сортировки
        sort_by = request.GET.get('sort', 'total_desc')
        
        # Применяем сортировку
        if sort_by == 'name_asc':
            interviewer_stats.sort(key=lambda x: x['interviewer'].get_full_name().lower())
        elif sort_by == 'name_desc':
            interviewer_stats.sort(key=lambda x: x['interviewer'].get_full_name().lower(), reverse=True)
        elif sort_by == 'screenings_asc':
            interviewer_stats.sort(key=lambda x: x['screenings'])
        elif sort_by == 'screenings_desc':
            interviewer_stats.sort(key=lambda x: x['screenings'], reverse=True)
        elif sort_by == 'interviews_asc':
            interviewer_stats.sort(key=lambda x: x['interviews'])
        elif sort_by == 'interviews_desc':
            interviewer_stats.sort(key=lambda x: x['interviews'], reverse=True)
        elif sort_by == 'time_asc':
            interviewer_stats.sort(key=lambda x: x['total_time_minutes'])
        elif sort_by == 'time_desc':
            interviewer_stats.sort(key=lambda x: x['total_time_minutes'], reverse=True)
        else:
            # По умолчанию сортируем по общему количеству встреч (скрининги + интервью)
            interviewer_stats.sort(key=lambda x: x['screenings'] + x['interviews'], reverse=True)
        
        context = {
            'interviewers': interviewers,
            'interviewer_stats': interviewer_stats,
            'start_date': start_date.date(),
            'end_date': end_date.date(),
            'sort_by': sort_by,
        }
        return render(request, 'reporting/interviewer_list.html', context)
    
    interviewer = get_object_or_404(Interviewer, id=interviewer_id)
    
    # Получаем параметры фильтров
    period = request.GET.get('period', 'monthly')
    
    # Парсим диапазон дат
    start_date, end_date = parse_date_range(request, period)
    
    # Генерируем отчет
    generator = ReportGenerator(request.user)
    report_data = generator.generate_interviewer_report(interviewer, start_date, end_date, period)
    
    context = {
        'report_data': report_data,
        'interviewer': interviewer,
        'period': period,
        'start_date': start_date.date(),
        'end_date': end_date.date(),
    }
    
    return render(request, 'reporting/interviewer_report.html', context)


@login_required
def api_report_data(request):
    """API endpoint для получения данных отчета в JSON формате"""
    report_type = request.GET.get('type')  # company, recruiter, vacancy, interviewer
    period = request.GET.get('period', 'monthly')
    
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    
    if not start_date_str or not end_date_str:
        return JsonResponse({'error': 'start_date and end_date are required'}, status=400)
    
    try:
        # Парсим даты с правильной обработкой timezone
        start_date_naive = datetime.fromisoformat(start_date_str)
        end_date_naive = datetime.fromisoformat(end_date_str)
        
        # Если datetime naive, добавляем timezone
        if timezone.is_naive(start_date_naive):
            start_date = timezone.make_aware(start_date_naive)
        else:
            start_date = start_date_naive
        
        if timezone.is_naive(end_date_naive):
            end_date = timezone.make_aware(end_date_naive)
        else:
            end_date = end_date_naive
        
        # Устанавливаем время начала дня для start_date и конец дня для end_date
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    except Exception as e:
        return JsonResponse({'error': f'Invalid date format: {str(e)}'}, status=400)
    
    generator = ReportGenerator(request.user)
    
    try:
        if report_type == 'company':
            report_data = generator.generate_company_report(start_date, end_date, period)
        elif report_type == 'recruiters_summary':
            report_data = generator.generate_recruiters_summary_report(start_date, end_date, period)
        elif report_type == 'recruiter':
            recruiter_id = request.GET.get('recruiter_id')
            if not recruiter_id:
                return JsonResponse({'error': 'recruiter_id is required'}, status=400)
            recruiter = get_object_or_404(User, id=recruiter_id)
            report_data = generator.generate_recruiter_report(recruiter, start_date, end_date, period)
        elif report_type == 'vacancy':
            vacancy_id = request.GET.get('vacancy_id')
            if not vacancy_id:
                return JsonResponse({'error': 'vacancy_id is required'}, status=400)
            vacancy = get_object_or_404(Vacancy, id=vacancy_id)
            report_data = generator.generate_vacancy_report(vacancy, start_date, end_date, period)
        elif report_type == 'interviewer':
            interviewer_id = request.GET.get('interviewer_id')
            if not interviewer_id:
                return JsonResponse({'error': 'interviewer_id is required'}, status=400)
            interviewer = get_object_or_404(Interviewer, id=interviewer_id)
            report_data = generator.generate_interviewer_report(interviewer, start_date, end_date, period)
        else:
            return JsonResponse({'error': 'Invalid report type'}, status=400)
        
        # Преобразуем данные для JSON (убираем объекты моделей)
        json_data = {
            'period': report_data.get('period'),
            'start_date': report_data.get('start_date').isoformat() if isinstance(report_data.get('start_date'), datetime) else str(report_data.get('start_date')),
            'end_date': report_data.get('end_date').isoformat() if isinstance(report_data.get('end_date'), datetime) else str(report_data.get('end_date')),
            'total_screenings': report_data.get('total_screenings', 0),
            'total_interviews': report_data.get('total_interviews', 0),
            'grouped_data': report_data.get('grouped_data', {}),
        }
        
        # Для сводного отчета по рекрутерам добавляем дополнительную информацию
        if report_type == 'recruiters_summary':
            json_data['recruiters'] = []
            for recruiter_data in report_data.get('recruiters', []):
                recruiter = recruiter_data.get('recruiter')
                json_data['recruiters'].append({
                    'recruiter_id': recruiter.id if recruiter else None,
                    'recruiter_name': recruiter.get_full_name() or recruiter.username if recruiter else None,
                    'recruiter_email': recruiter.email if recruiter else None,
                    'screenings': recruiter_data.get('screenings', 0),
                    'interviews': recruiter_data.get('interviews', 0),
                    'total': recruiter_data.get('total', 0),
                    'vacancy_stats': [
                        {
                            'vacancy_id': vs.get('vacancy').id if vs.get('vacancy') else None,
                            'vacancy_name': vs.get('vacancy').name if vs.get('vacancy') else None,
                            'screenings': vs.get('screenings', 0),
                            'interviews': vs.get('interviews', 0),
                            'total': vs.get('total', 0),
                        }
                        for vs in recruiter_data.get('vacancy_stats', [])
                    ],
                })
            json_data['total_recruiters'] = report_data.get('total_recruiters', 0)
            json_data['total_events'] = report_data.get('total_events', 0)
        
        # Для отчета по рекрутеру добавляем статистику по вакансиям
        elif report_type == 'recruiter':
            recruiter_obj = report_data.get('recruiter')
            json_data['recruiter_id'] = recruiter_obj.id if recruiter_obj else None
            json_data['recruiter_name'] = (recruiter_obj.get_full_name() or recruiter_obj.username) if recruiter_obj else None
            json_data['total_events'] = report_data.get('total_events', 0)
            json_data['vacancy_stats'] = [
                {
                    'vacancy_id': vs.get('vacancy').id if vs.get('vacancy') else None,
                    'vacancy_name': vs.get('vacancy').name if vs.get('vacancy') else None,
                    'screenings': vs.get('screenings', 0),
                    'interviews': vs.get('interviews', 0),
                    'total': vs.get('total', 0),
                }
                for vs in report_data.get('vacancy_stats', [])
            ]
        
        # Для отчета по интервьюеру добавляем информацию об интервьюере
        elif report_type == 'interviewer':
            interviewer_obj = report_data.get('interviewer')
            json_data['interviewer_id'] = interviewer_obj.id if interviewer_obj else None
            json_data['interviewer_name'] = interviewer_obj.get_full_name() if interviewer_obj else None
            json_data['interviewer_email'] = interviewer_obj.email if interviewer_obj else None
            json_data['total_events'] = report_data.get('total_screenings', 0) + report_data.get('total_interviews', 0)
        
        return JsonResponse(json_data)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def sync_calendar_events(request):
    """API endpoint для синхронизации событий календаря"""
    try:
        from django.db.models import Max
        
        # Определяем период синхронизации из параметров запроса или используем значения по умолчанию
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        
        if start_date_str and end_date_str:
            # Парсим даты из параметров запроса
            try:
                start_date_naive = datetime.fromisoformat(start_date_str)
                end_date_naive = datetime.fromisoformat(end_date_str)
                
                if timezone.is_naive(start_date_naive):
                    start_date = timezone.make_aware(start_date_naive)
                else:
                    start_date = start_date_naive
                
                if timezone.is_naive(end_date_naive):
                    end_date = timezone.make_aware(end_date_naive)
                else:
                    end_date = end_date_naive
                
                # Устанавливаем время начала дня для start_date и конец дня для end_date
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                sync_end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            except Exception as e:
                print(f"⚠️ Ошибка парсинга дат из параметров: {e}. Используем значения по умолчанию.")
                # Используем значения по умолчанию при ошибке парсинга
                start_date = datetime(2024, 12, 12, 0, 0, 0)
                if timezone.is_naive(start_date):
                    start_date = timezone.make_aware(start_date)
                now = timezone.now()
                sync_end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        else:
            # Используем значения по умолчанию - за год с 12.12.2024 по сегодня
            start_date = datetime(2024, 12, 12, 0, 0, 0)
            if timezone.is_naive(start_date):
                start_date = timezone.make_aware(start_date)
            
            # Конец: сегодня (конец дня) - синхронизируем все события за год
            now = timezone.now()
            sync_end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Получаем всех рекрутеров (кроме admin)
        recruiters = User.objects.filter(
            groups__name='Рекрутер'
        ).exclude(username='admin').distinct()
        
        # Дополнительные календари для синхронизации (например, календарь компании)
        additional_calendars = [
            {
                'calendar_id': 'andrey.chernomordin@softnetix.io',
                'name': 'Календарь компании (Andrey Chernomordin)',
                'recruiter': None  # Будет определен автоматически или можно указать конкретного рекрутера
            }
        ]
        
        total_synced = 0
        total_errors = 0
        synced_recruiters = []
        skipped_recruiters = []
        
        print(f"🔄 Начинаем синхронизацию для {recruiters.count()} рекрутеров")
        print(f"📅 Период: {start_date.date()} - {sync_end_date.date()} (конец предыдущей недели)")
        
        # Функция для синхронизации календаря
        def sync_calendar_for_user(user, calendar_id, calendar_name='primary'):
            """Синхронизирует календарь для пользователя"""
            try:
                # Проверяем наличие Google OAuth аккаунта
                try:
                    oauth_account = GoogleOAuthAccount.objects.get(user=user)
                except GoogleOAuthAccount.DoesNotExist:
                    return 0, f'Нет Google OAuth аккаунта'
                
                if not oauth_account.is_token_valid():
                    return 0, f'Токен истек'
                
                # Создаем сервисы
                oauth_service = GoogleOAuthService(user)
                calendar_service = GoogleCalendarService(oauth_service)
                
                # Получаем события через API
                service = calendar_service._get_service()
                if not service:
                    return 0, f'Ошибка получения сервиса'
                
                # Формируем запрос
                time_min = start_date.isoformat()
                time_max = sync_end_date.isoformat()
                
                print(f"   📅 Запрашиваем события календаря '{calendar_name}' (ID: {calendar_id})...")
                events_result = service.events().list(
                    calendarId=calendar_id,
                    timeMin=time_min,
                    timeMax=time_max,
                    maxResults=2500,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()
                
                events = events_result.get('items', [])
                print(f"   📅 Получено {len(events)} событий из календаря '{calendar_name}'")
                
                # Сохраняем события в БД
                synced_count = 0
                for event in events:
                    try:
                        event_id = event.get('id')
                        if not event_id:
                            continue
                        
                        # Парсим время
                        start_time = _parse_event_time_for_sync(event.get('start'))
                        end_time = _parse_event_time_for_sync(event.get('end'))
                        
                        if not start_time or not end_time:
                            continue
                        
                        # Фильтруем по периоду
                        if start_time < start_date or start_time > sync_end_date:
                            continue
                        
                        # Извлекаем участников
                        attendees = []
                        for attendee in event.get('attendees', []):
                            attendees.append({
                                'email': attendee.get('email', ''),
                                'name': attendee.get('displayName', attendee.get('email', ''))
                            })
                        
                        # Получаем время обновления из Google
                        google_updated = None
                        if 'updated' in event:
                            try:
                                google_updated = datetime.fromisoformat(event['updated'].replace('Z', '+00:00'))
                            except:
                                pass
                        
                        # Определяем рекрутера для события
                        # Если это календарь компании, пытаемся определить рекрутера по участникам или используем первого рекрутера
                        event_recruiter = user
                        if not user.groups.filter(name='Рекрутер').exists():
                            # Если пользователь не рекрутер, пытаемся найти рекрутера по участникам
                            for attendee_email in [a.get('email', '') for a in attendees]:
                                recruiter_user = User.objects.filter(
                                    email=attendee_email,
                                    groups__name='Рекрутер'
                                ).first()
                                if recruiter_user:
                                    event_recruiter = recruiter_user
                                    break
                            
                            # Если не нашли, используем первого рекрутера
                            if not event_recruiter.groups.filter(name='Рекрутер').exists():
                                first_recruiter = recruiters.first()
                                if first_recruiter:
                                    event_recruiter = first_recruiter
                        
                        # Сохраняем событие
                        CalendarEvent.objects.update_or_create(
                            event_id=event_id,
                            defaults={
                                'recruiter': event_recruiter,
                                'title': event.get('summary', 'Без названия'),
                                'start_time': start_time,
                                'end_time': end_time,
                                'attendees': attendees,
                                'description': event.get('description', ''),
                                'location': event.get('location', ''),
                                'google_updated_at': google_updated,
                            }
                        )
                        
                        synced_count += 1
                        
                    except Exception as e:
                        print(f"   ❌ Ошибка сохранения события: {e}")
                
                return synced_count, None
                
            except Exception as e:
                error_msg = str(e)
                print(f"   ❌ Ошибка синхронизации календаря '{calendar_name}': {error_msg}")
                import traceback
                print(traceback.format_exc())
                return 0, error_msg
        
        # Синхронизируем календари рекрутеров
        for recruiter in recruiters:
            try:
                print(f"\n👤 Обработка рекрутера: {recruiter.get_full_name() or recruiter.username} ({recruiter.email})")
                
                recruiter_synced, error = sync_calendar_for_user(recruiter, 'primary', f'Рекрутер {recruiter.username}')
                
                if error:
                    skipped_recruiters.append({
                        'name': recruiter.get_full_name() or recruiter.username,
                        'reason': error
                    })
                    print(f"   ⚠️  Пропущен: {error}")
                else:
                    total_synced += recruiter_synced
                    if recruiter_synced > 0:
                        synced_recruiters.append({
                            'name': recruiter.get_full_name() or recruiter.username,
                            'count': recruiter_synced
                        })
                        print(f"   ✅ Синхронизировано {recruiter_synced} событий")
                    else:
                        print(f"   ℹ️  Новых событий не найдено")
                    
            except Exception as e:
                total_errors += 1
                error_msg = str(e)
                print(f"   ❌ Ошибка синхронизации для {recruiter.username}: {error_msg}")
                import traceback
                print(traceback.format_exc())
                skipped_recruiters.append({
                    'name': recruiter.get_full_name() or recruiter.username,
                    'reason': f'Ошибка: {error_msg[:100]}'
                })
        
        # Синхронизируем календари интервьюеров
        # Используем календарь пользователя andrei.golubenko для доступа
        print(f"\n👥 Синхронизация календарей интервьюеров за период {start_date.date()} - {sync_end_date.date()}...")
        interviewer_sync_enabled = request.GET.get('sync_interviewers', 'true').lower() == 'true'
        
        if interviewer_sync_enabled:
            try:
                # Получаем пользователя andrei.golubenko
                golubenko_user = User.objects.filter(email='andrei.golubenko@softnetix.io').first()
                if not golubenko_user:
                    golubenko_user = User.objects.filter(username='andrei.golubenko').first()
                
                if golubenko_user:
                    try:
                        golubenko_oauth = GoogleOAuthAccount.objects.get(user=golubenko_user)
                        if golubenko_oauth.is_token_valid():
                            # Создаем сервисы для доступа к календарям интервьюеров
                            golubenko_oauth_service = GoogleOAuthService(golubenko_user)
                            golubenko_calendar_service = GoogleCalendarService(golubenko_oauth_service)
                            golubenko_service = golubenko_calendar_service._get_service()
                            
                            if golubenko_service:
                                # Получаем всех активных интервьюеров
                                interviewers = Interviewer.objects.filter(is_active=True)
                                print(f"   📋 Найдено {interviewers.count()} активных интервьюеров")
                                
                                # Импортируем функцию извлечения calendar_id
                                from apps.google_oauth.views import _extract_calendar_id_from_link
                                
                                for interviewer in interviewers:
                                    try:
                                        print(f"\n   👤 Обработка интервьюера: {interviewer.get_full_name()} ({interviewer.email})")
                                        
                                        # Определяем calendar_id интервьюера
                                        calendar_id = None
                                        
                                        # Способ 1: Извлекаем из calendar_link
                                        if interviewer.calendar_link:
                                            calendar_id = _extract_calendar_id_from_link(interviewer.calendar_link)
                                            if calendar_id:
                                                print(f"      📅 Извлечен calendar_id из ссылки: {calendar_id}")
                                        
                                        # Способ 2: Ищем календарь по email
                                        if not calendar_id:
                                            try:
                                                calendar = golubenko_calendar_service.get_calendar_by_email(interviewer.email)
                                                if calendar:
                                                    calendar_id = calendar['id']
                                                    print(f"      📅 Найден календарь по email: {calendar_id}")
                                            except Exception as e:
                                                print(f"      ⚠️  Ошибка поиска календаря по email: {e}")
                                        
                                        # Способ 3: Используем email напрямую
                                        if not calendar_id:
                                            calendar_id = interviewer.email
                                            print(f"      📅 Используем email как calendar_id: {calendar_id}")
                                        
                                        if calendar_id:
                                            # Синхронизируем календарь интервьюера
                                            time_min = start_date.isoformat()
                                            time_max = sync_end_date.isoformat()
                                            
                                            print(f"      📅 Запрашиваем события календаря интервьюера (период: {start_date.date()} - {sync_end_date.date()})...")
                                            try:
                                                events_result = golubenko_service.events().list(
                                                    calendarId=calendar_id,
                                                    timeMin=time_min,
                                                    timeMax=time_max,
                                                    maxResults=2500,
                                                    singleEvents=True,
                                                    orderBy='startTime'
                                                ).execute()
                                                
                                                events = events_result.get('items', [])
                                                print(f"      📅 Получено {len(events)} событий из календаря интервьюера")
                                                
                                                # Сохраняем события в БД
                                                interviewer_synced = 0
                                                interviewer_updated = 0
                                                interviewer_created = 0
                                                
                                                for event in events:
                                                    try:
                                                        event_id = event.get('id')
                                                        if not event_id:
                                                            continue
                                                        
                                                        # Парсим время
                                                        start_time = _parse_event_time_for_sync(event.get('start'))
                                                        end_time = _parse_event_time_for_sync(event.get('end'))
                                                        
                                                        if not start_time or not end_time:
                                                            continue
                                                        
                                                        # Фильтруем по периоду
                                                        if start_time < start_date or start_time > sync_end_date:
                                                            continue
                                                        
                                                        # Извлекаем участников
                                                        attendees = []
                                                        for attendee in event.get('attendees', []):
                                                            attendees.append({
                                                                'email': attendee.get('email', ''),
                                                                'name': attendee.get('displayName', attendee.get('email', ''))
                                                            })
                                                        
                                                        # Получаем время обновления из Google
                                                        google_updated = None
                                                        if 'updated' in event:
                                                            try:
                                                                google_updated = datetime.fromisoformat(event['updated'].replace('Z', '+00:00'))
                                                            except:
                                                                pass
                                                        
                                                        # Определяем рекрутера для события интервьюера
                                                        # Пытаемся найти рекрутера по участникам
                                                        event_recruiter = None
                                                        for attendee_email in [a.get('email', '') for a in attendees]:
                                                            recruiter_user = User.objects.filter(
                                                                email=attendee_email,
                                                                groups__name='Рекрутер'
                                                            ).first()
                                                            if recruiter_user:
                                                                event_recruiter = recruiter_user
                                                                break
                                                        
                                                        # Если не нашли, используем первого рекрутера
                                                        if not event_recruiter:
                                                            event_recruiter = recruiters.first()
                                                        
                                                        if not event_recruiter:
                                                            print(f"      ⚠️  Не найден рекрутер для события {event.get('summary', 'Без названия')}. Пропускаем.")
                                                            continue
                                                        
                                                        # Сохраняем событие
                                                        calendar_event, created = CalendarEvent.objects.update_or_create(
                                                            event_id=event_id,
                                                            defaults={
                                                                'recruiter': event_recruiter,
                                                                'title': event.get('summary', 'Без названия'),
                                                                'start_time': start_time,
                                                                'end_time': end_time,
                                                                'attendees': attendees,
                                                                'description': event.get('description', ''),
                                                                'location': event.get('location', ''),
                                                                'google_updated_at': google_updated,
                                                            }
                                                        )
                                                        
                                                        if created:
                                                            interviewer_created += 1
                                                        else:
                                                            interviewer_updated += 1
                                                        
                                                        interviewer_synced += 1
                                                        total_synced += 1
                                                        
                                                    except Exception as e:
                                                        total_errors += 1
                                                        print(f"      ❌ Ошибка сохранения события: {e}")
                                                        import traceback
                                                        print(traceback.format_exc())
                                                
                                                if interviewer_synced > 0:
                                                    synced_recruiters.append({
                                                        'name': f'Интервьюер: {interviewer.get_full_name()} ({interviewer.email})',
                                                        'count': interviewer_synced,
                                                        'created': interviewer_created,
                                                        'updated': interviewer_updated
                                                    })
                                                    print(f"      ✅ Синхронизировано {interviewer_synced} событий (создано: {interviewer_created}, обновлено: {interviewer_updated})")
                                                else:
                                                    print(f"      ℹ️  Новых событий не найдено за указанный период")
                                                    
                                            except Exception as e:
                                                total_errors += 1
                                                error_msg = str(e)
                                                print(f"      ❌ Ошибка запроса событий календаря: {error_msg}")
                                                skipped_recruiters.append({
                                                    'name': f'Интервьюер: {interviewer.get_full_name()}',
                                                    'reason': f'Ошибка запроса: {error_msg[:100]}'
                                                })
                                        else:
                                            skipped_recruiters.append({
                                                'name': f'Интервьюер: {interviewer.get_full_name()}',
                                                'reason': 'Не удалось определить calendar_id'
                                            })
                                            print(f"      ⚠️  Не удалось определить calendar_id")
                                            
                                    except Exception as e:
                                        total_errors += 1
                                        error_msg = str(e)
                                        print(f"      ❌ Ошибка синхронизации для {interviewer.get_full_name()}: {error_msg}")
                                        import traceback
                                        print(traceback.format_exc())
                                        skipped_recruiters.append({
                                            'name': f'Интервьюер: {interviewer.get_full_name()}',
                                            'reason': f'Ошибка: {error_msg[:100]}'
                                        })
                            else:
                                print(f"   ⚠️  Не удалось получить сервис Google Calendar для пользователя andrei.golubenko")
                        else:
                            print(f"   ⚠️  Токен Google OAuth истек для пользователя andrei.golubenko")
                            skipped_recruiters.append({
                                'name': 'Синхронизация интервьюеров',
                                'reason': 'Токен Google OAuth истек для пользователя andrei.golubenko'
                            })
                    except GoogleOAuthAccount.DoesNotExist:
                        print(f"   ⚠️  У пользователя andrei.golubenko нет Google OAuth аккаунта")
                        skipped_recruiters.append({
                            'name': 'Синхронизация интервьюеров',
                            'reason': 'У пользователя andrei.golubenko нет Google OAuth аккаунта'
                        })
                else:
                    print(f"   ⚠️  Пользователь andrei.golubenko не найден")
                    skipped_recruiters.append({
                        'name': 'Синхронизация интервьюеров',
                        'reason': 'Пользователь andrei.golubenko не найден'
                    })
            except Exception as e:
                print(f"   ❌ Ошибка при синхронизации календарей интервьюеров: {e}")
                import traceback
                print(traceback.format_exc())
                skipped_recruiters.append({
                    'name': 'Синхронизация интервьюеров',
                    'reason': f'Ошибка: {str(e)[:100]}'
                })
        else:
            print(f"   ⏭️  Синхронизация интервьюеров пропущена (параметр sync_interviewers=false)")
        
        # Синхронизируем дополнительные календари (например, календарь компании)
        # Для этого используем первого рекрутера с валидным OAuth аккаунтом
        print(f"\n📅 Синхронизация дополнительных календарей...")
        for calendar_info in additional_calendars:
            calendar_id = calendar_info['calendar_id']
            calendar_name = calendar_info['name']
            
            # Находим первого рекрутера с валидным OAuth для доступа к календарю
            user_for_calendar = None
            for recruiter in recruiters:
                try:
                    oauth_account = GoogleOAuthAccount.objects.get(user=recruiter)
                    if oauth_account.is_token_valid():
                        user_for_calendar = recruiter
                        break
                except:
                    continue
            
            if not user_for_calendar:
                print(f"   ⚠️  Не найден рекрутер с валидным OAuth для доступа к календарю '{calendar_name}'. Пропускаем.")
                skipped_recruiters.append({
                    'name': calendar_name,
                    'reason': 'Нет рекрутера с валидным OAuth'
                })
                continue
            
            print(f"\n📅 Обработка календаря: {calendar_name}")
            calendar_synced, error = sync_calendar_for_user(user_for_calendar, calendar_id, calendar_name)
            
            if error:
                skipped_recruiters.append({
                    'name': calendar_name,
                    'reason': error
                })
                print(f"   ⚠️  Пропущен: {error}")
            else:
                total_synced += calendar_synced
                if calendar_synced > 0:
                    synced_recruiters.append({
                        'name': calendar_name,
                        'count': calendar_synced
                    })
                    print(f"   ✅ Синхронизировано {calendar_synced} событий")
                else:
                    print(f"   ℹ️  Новых событий не найдено")
        
        # Подсчитываем статистику по рекрутерам и интервьюерам
        recruiter_count = len([r for r in synced_recruiters if not r['name'].startswith('Интервьюер:')])
        interviewer_count = len([r for r in synced_recruiters if r['name'].startswith('Интервьюер:')])
        
        print(f"\n✅ Синхронизация завершена!")
        print(f"   Период: {start_date.date()} - {sync_end_date.date()}")
        print(f"   Всего синхронизировано: {total_synced} событий")
        print(f"   Ошибок: {total_errors}")
        print(f"   Обработано рекрутеров: {recruiter_count}")
        print(f"   Обработано интервьюеров: {interviewer_count}")
        print(f"   Всего обработано: {len(synced_recruiters)}")
        print(f"   Пропущено: {len(skipped_recruiters)}")
        
        return JsonResponse({
            'success': True,
            'message': f'Синхронизация завершена. Синхронизировано {total_synced} событий (рекрутеры: {recruiter_count}, интервьюеры: {interviewer_count})',
            'synced_count': total_synced,
            'errors': total_errors,
            'start_date': start_date.isoformat(),
            'end_date': sync_end_date.isoformat(),
            'recruiters': synced_recruiters,
            'skipped_recruiters': skipped_recruiters,
            'total_recruiters': recruiters.count(),
            'processed_recruiters': recruiter_count,
            'processed_interviewers': interviewer_count,
            'total_processed': len(synced_recruiters),
            'skipped_count': len(skipped_recruiters),
        })
        
    except Exception as e:
        import traceback
        return JsonResponse({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)


def _parse_event_time_for_sync(time_data):
    """Парсит время события из формата Google Calendar API"""
    if not time_data:
        return None
    
    if 'dateTime' in time_data:
        try:
            return datetime.fromisoformat(time_data['dateTime'].replace('Z', '+00:00'))
        except:
            pass
    
    if 'date' in time_data:
        try:
            dt = datetime.fromisoformat(time_data['date'])
            if timezone.is_naive(dt):
                return timezone.make_aware(dt)
            return dt
        except:
            pass
    
    return None

