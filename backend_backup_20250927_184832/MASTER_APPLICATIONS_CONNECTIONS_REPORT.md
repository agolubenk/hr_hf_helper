# Мастер-отчет о связях между всеми приложениями HR Helper

## 📋 **Обзор системы**

Данный документ представляет комплексный анализ всех связей и зависимостей между приложениями в системе HR Helper. Система состоит из 11 основных приложений, каждое из которых выполняет специфическую роль в общей архитектуре.

## 🏗️ **Архитектурная схема системы**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HR Helper System                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Core Applications (Центральные приложения)                                     │
│  ├── 🏠 accounts/          - Управление пользователями и аутентификация         │
│  ├── 💰 finance/           - Финансовая логика (зарплаты, налоги, валюты)       │
│  ├── 🔗 google_oauth/      - Google OAuth и Calendar интеграция                 │
│  ├── 🧭 common/            - Общие компоненты (навигация, UI)                   │
│  └── 👥 interviewers/      - Управление интервьюерами                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Business Applications (Бизнес-приложения)                                      │
│  ├── 💼 vacancies/         - Управление вакансиями                            │
│  ├── 🔍 huntflow/          - Интеграция с HR системой Huntflow                │
│  └── 🤖 gemini/            - AI сервисы (Gemini)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Integration Applications (Интеграционные приложения)                           │
│  ├── 📋 clickup_int/       - ClickUp интеграция                               │
│  ├── 📝 notion_int/        - Notion интеграция                                │
│  └── 💬 telegram/          - Telegram интеграция                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 **Матрица связей между приложениями**

| Приложение | Accounts | Finance | Common | Interviewers | Vacancies | Huntflow | Gemini | Google OAuth | ClickUp | Notion | Telegram |
|------------|----------|---------|--------|--------------|-----------|----------|--------|--------------|---------|--------|----------|
| **Accounts** | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Finance** | ✅ | - | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Common** | ✅ | ❌ | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Interviewers** | ✅ | ✅ | ✅ | - | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Vacancies** | ✅ | ✅ | ✅ | ✅ | - | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Huntflow** | ✅ | ✅ | ✅ | ❌ | ❌ | - | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Gemini** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | - | ❌ | ❌ | ❌ | ❌ |
| **Google OAuth** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | - | ❌ | ❌ | ❌ |
| **ClickUp** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | - | ❌ | ❌ |
| **Notion** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - | ❌ |
| **Telegram** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - |

**Легенда:**
- ✅ **Есть связь** - Приложения взаимодействуют напрямую
- ❌ **Нет связи** - Приложения не взаимодействуют напрямую

## 📊 **Детальный анализ связей**

### 1. **🏠 ACCOUNTS - Центральное приложение**

**Роль:** Центральный узел системы управления пользователями и аутентификации.

#### **Прямые связи:**
- **Google OAuth** - `OneToOneField` связь с `GoogleOAuthAccount`
- **Telegram** - `OneToOneField` связь с `TelegramUser`
- **Interviewers** - Связь через Django Groups
- **Vacancies** - Связь через поле `recruiter` в модели `Vacancy`

#### **Косвенные связи (API ключи):**
- **Huntflow** - `huntflow_api_key` поле в модели `User`
- **Gemini** - `gemini_api_key` поле в модели `User`
- **ClickUp** - `clickup_api_key` поле в модели `User`
- **Notion** - `notion_integration_token` поле в модели `User`

#### **Примеры использования в views:**

```python
# apps/accounts/views.py - Использование Google OAuth связи
@login_required
def profile_template_handler(request):
    """Обработчик профиля пользователя с OAuth данными"""
    context = UserService.get_profile_context(request.user)
    
    # Использование Google OAuth связи
    google_oauth_account = getattr(request.user, 'google_oauth_account', None)
    if google_oauth_account:
        context['google_connected'] = True
        context['google_email'] = google_oauth_account.email
    else:
        context['google_connected'] = False
    
    # Использование Telegram связи
    telegram_user = getattr(request.user, 'telegram_user', None)
    if telegram_user:
        context['telegram_connected'] = True
        context['telegram_username'] = telegram_user.username
    else:
        context['telegram_connected'] = False
    
    return context

# apps/accounts/views.py - Тестирование API ключей
def test_huntflow_api_handler(data, request):
    """Тест Huntflow API используя API ключ пользователя"""
    if not request.user.huntflow_api_key:
        return {'success': False, 'message': 'Huntflow API ключ не настроен'}
    
    try:
        from apps.huntflow.services import HuntflowService
        huntflow_service = HuntflowService(request.user)
        result = huntflow_service.test_connection()
        return {'success': result['success'], 'message': result['message']}
    except Exception as e:
        return {'success': False, 'message': str(e)}
```

#### **Критичность:** 🔴 **КРИТИЧЕСКАЯ**
Без Accounts система не может функционировать - это основа всей аутентификации и авторизации.

---

### 2. **💰 FINANCE - Финансовое ядро**

**Роль:** Центральный узел для всех финансовых операций, грейдов и валютных курсов.

#### **Прямые связи:**
- **Vacancies** - `SalaryRange` и `Benchmark` связаны с `Vacancy`
- **Interviewers** - `InterviewRule` связан с `Grade`
- **Google OAuth** - `GoogleCalendarEvent` использует `Grade` и `CurrencyRate`
- **Huntflow** - `HuntflowVacancy` и `HuntflowApplicant` используют `Grade`

#### **Модели, используемые другими приложениями:**
- `Grade` - используется в 4 приложениях
- `CurrencyRate` - используется в 2 приложениях
- `SalaryRange` - используется в Vacancies
- `Benchmark` - используется в Vacancies

#### **Примеры использования в views:**

```python
# apps/finance/views.py - Использование связей с Vacancies
@login_required
def benchmarks_dashboard(request):
    """Дашборд бенчмарков с фильтрацией по вакансиям и грейдам"""
    # Получаем фильтры из GET параметров
    grade_filter = request.GET.getlist('grades')
    vacancy_filter = request.GET.getlist('vacancies')
    
    # Базовый queryset с фильтрами
    base_queryset = Benchmark.objects.filter(is_active=True)
    
    # Фильтрация по грейдам (связь с Finance)
    if grade_filter:
        base_queryset = base_queryset.filter(grade_id__in=grade_filter)
    
    # Фильтрация по вакансиям (связь с Vacancies)
    if vacancy_filter:
        base_queryset = base_queryset.filter(vacancy_id__in=vacancy_filter)
    
    # Получаем грейды для фильтра (модель из Finance)
    grades = Grade.objects.filter(is_active=True).order_by('name')
    
    # Получаем вакансии для фильтра (модель из Vacancies)
    from apps.vacancies.models import Vacancy
    vacancies = Vacancy.objects.filter(is_active=True).order_by('name')
    
    context = {
        'benchmarks': base_queryset,
        'grades': grades,
        'vacancies': vacancies,
        'total_count': base_queryset.count(),
    }
    
    return render(request, 'finance/benchmarks_dashboard.html', context)

# apps/finance/views.py - Работа с валютными курсами
@login_required
def currency_rates_view(request):
    """Отображение валютных курсов для интеграций"""
    # Получаем активные курсы валют
    currency_rates = CurrencyRate.objects.filter(is_active=True).order_by('-created_at')
    
    # Используем TaxService для расчетов (связь с сервисным слоем)
    tax_service = TaxService()
    
    # Пример использования курса для расчета
    usd_rate = currency_rates.filter(currency='USD').first()
    if usd_rate:
        context = {
            'currency_rates': currency_rates,
            'usd_rate': usd_rate.rate,
            'sample_calculation': tax_service.calculate_with_currency(1000, 'USD', 'BYN')
        }
    else:
        context = {
            'currency_rates': currency_rates,
            'error': 'USD курс не найден'
        }
    
    return render(request, 'finance/currency_rates.html', context)
```

#### **Критичность:** 🔴 **КРИТИЧЕСКАЯ**
Модель `Grade` является центральной для всей системы HR.

---

### 3. **🧭 COMMON - Навигационный центр**

**Роль:** Обеспечивает единую навигацию и UI компоненты для всех приложений.

#### **Прямые связи:**
- **Huntflow** - Получение данных организаций для сайдбара
- **Accounts** - Проверка аутентификации пользователей

#### **Косвенные связи (навигация):**
- Все приложения - Генерация ссылок в сайдбаре
- Все приложения - Template tags и фильтры

#### **Примеры использования в views:**

```python
# apps/common/context_processors.py - Использование Huntflow связи
def sidebar_menu_context(request):
    """Контекстный процессор для сайдбара с данными Huntflow"""
    if not request.user.is_authenticated:
        return {}
    
    try:
        # Использование Huntflow связи для получения организаций
        from apps.huntflow.services import HuntflowService
        huntflow_service = HuntflowService(request.user)
        accounts_data = huntflow_service.get_accounts()
        
        if accounts_data and 'items' in accounts_data:
            accounts_list = accounts_data['items']
        else:
            accounts_list = []
            
    except Exception as e:
        logger.error(f"Ошибка получения данных Huntflow: {e}")
        accounts_list = []
    
    return {
        'accounts_for_menu': accounts_data,
        'accounts': accounts_list,
    }

# apps/common/templatetags/sidebar_tags.py - Генерация навигации
@register.simple_tag(takes_context=True)
def render_sidebar_menu(context):
    """Рендерит полное многоуровневое меню для всех приложений"""
    request = context['request']
    
    html = '<ul class="nav flex-column">'
    
    # Генерация ссылок для всех приложений
    for key, item in SIDEBAR_MENU.items():
        html += render_menu_item(request, key, item)
    
    html += '</ul>'
    
    return mark_safe(html)

# apps/common/views_api.py - Health check с проверкой связей
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Проверка здоровья API с тестированием связей между приложениями"""
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'services': {}
    }
    
    # Проверка базы данных (связь с Django ORM)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Проверка Redis (связь с Celery)
    try:
        redis_client = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        redis_client.ping()
        health_status['services']['redis'] = 'healthy'
    except Exception as e:
        health_status['services']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    return Response(health_status, status=200 if health_status['status'] == 'healthy' else 503)
```

#### **Критичность:** 🟡 **ВАЖНАЯ**
Без Common сайдбар не работает, но система может функционировать.

---

### 4. **👥 INTERVIEWERS - Управление интервьюерами**

**Роль:** Управление интервьюерами, календарями и правилами интервью.

#### **Прямые связи:**
- **Accounts** - Связь через Django Groups
- **Finance** - `InterviewRule` использует модель `Grade`
- **Google OAuth** - Синхронизация календарей
- **Vacancies** - Связь через модель `Vacancy`

#### **Примеры использования в views:**

```python
# apps/interviewers/views.py - Использование связей с Finance и Vacancies
@login_required
def interviewer_list(request):
    """Список интервьюеров с фильтрацией"""
    # Базовый queryset
    interviewers = Interviewer.objects.all()
    
    # Применяем фильтры через общий обработчик
    filter_q = InterviewerHandler.search_interviewers_logic(search_query, status_filter)
    interviewers = interviewers.filter(filter_q)
    
    # Использование связи с Accounts через Django Groups
    # Проверяем, является ли пользователь интервьюером
    if request.user.groups.filter(name='Интервьюер').exists():
        # Показываем только связанных интервьюеров
        interviewers = interviewers.filter(user=request.user)
    
    context = {
        'page_obj': page_obj,
        'total_count': interviewers.count(),
        'active_count': interviewers.filter(is_active=True).count(),
    }
    
    return render(request, 'interviewers/interviewer_list.html', context)

# apps/interviewers/views.py - Работа с правилами интервью (связь с Finance)
@login_required
def interview_rules_list(request):
    """Список правил интервью с грейдами из Finance"""
    # Получаем правила интервью
    rules = InterviewRule.objects.select_related('grade').all()
    
    # Используем связь с Finance для получения грейдов
    from apps.finance.models import Grade
    grades = Grade.objects.filter(is_active=True).order_by('name')
    
    # Фильтрация по грейдам (связь с Finance)
    grade_filter = request.GET.get('grade')
    if grade_filter:
        rules = rules.filter(grade_id=grade_filter)
    
    context = {
        'rules': rules,
        'grades': grades,
        'selected_grade': grade_filter,
    }
    
    return render(request, 'interviewers/interview_rules_list.html', context)

# apps/interviewers/views.py - Синхронизация с Google OAuth
@login_required
def sync_calendar(request):
    """Синхронизация календаря интервьюера с Google"""
    try:
        # Использование связи с Google OAuth
        google_oauth_account = request.user.google_oauth_account
        if not google_oauth_account:
            messages.error(request, 'Google OAuth не настроен')
            return redirect('interviewers:interviewer_list')
        
        # Использование сервиса календаря
        calendar_service = InterviewerCalendarService()
        result = calendar_service.sync_interviewer_calendar(request.user)
        
        if result['success']:
            messages.success(request, f"Синхронизировано {result['events_count']} событий")
        else:
            messages.error(request, f"Ошибка синхронизации: {result['message']}")
            
    except Exception as e:
        messages.error(request, f"Ошибка: {str(e)}")
    
    return redirect('interviewers:interviewer_list')
```

#### **Критичность:** 🟡 **ВАЖНАЯ**
Важно для HR процессов, но не критично для базовой функциональности.

---

### 5. **💼 VACANCIES - Управление вакансиями**

**Роль:** Управление вакансиями, зарплатными вилками и связанными данными.

#### **Прямые связи:**
- **Accounts** - Поле `recruiter` ссылается на `User`
- **Finance** - `ManyToManyField` с `Grade`, `SalaryRange` и `Benchmark`
- **Interviewers** - Связь через модель `Vacancy`

#### **Примеры использования в views:**

```python
# apps/vacancies/views.py - Использование связей с Accounts и Finance
@login_required
def vacancy_list(request):
    """Список вакансий с фильтрацией по рекрутерам и грейдам"""
    # Получаем параметры поиска
    search_form = VacancySearchForm(request.GET)
    search_query = request.GET.get('search', '')
    recruiter_filter = request.GET.get('recruiter', '')
    
    # Используем обработчик поиска
    search_params = {
        'query': search_query,
        'recruiter_id': recruiter_filter,
    }
    vacancies = VacancyHandler.search_logic(search_params)
    
    # Используем связь с Finance для получения грейдов
    from apps.finance.models import Grade
    grades = Grade.objects.filter(is_active=True).order_by('name')
    
    # Используем связь с Accounts для получения рекрутеров
    from django.contrib.auth import get_user_model
    User = get_user_model()
    recruiters = User.objects.filter(groups__name='Рекрутер').order_by('username')
    
    context = {
        'page_obj': page_obj,
        'search_form': search_form,
        'grades': grades,
        'recruiters': recruiters,
        'search_query': search_query,
        'recruiter_filter': recruiter_filter,
    }
    
    return render(request, 'vacancies/vacancy_list.html', context)

# apps/vacancies/views.py - Дашборд с использованием связей
@login_required
def dashboard(request):
    """Дашборд локальных данных по вакансиям"""
    # Получаем статистику по вакансиям
    vacancy_stats = VacancyHandler.calculate_stats(request.user)
    
    # Получаем статистику по зарплатным вилкам (связь с Finance)
    salary_range_stats = SalaryRangeHandler.calculate_stats()
    
    # Общее количество грейдов (связь с Finance)
    from apps.finance.models import Grade
    total_grades = Grade.objects.count()
    
    context = {
        **vacancy_stats,
        **salary_range_stats,
        'total_grades': total_grades,
    }
    
    return render(request, 'vacancies/dashboard.html', context)

# apps/vacancies/views_api.py - API с использованием связей
@action(detail=True, methods=['post'], url_path='assign-grades')
def assign_grades(self, request, pk=None):
    """Назначение грейдов вакансии (связь с Finance)"""
    result = VacancyApiHandler.assign_grades_handler(
        {'pk': pk, 'grade_ids': request.data.get('grade_ids', [])}, request
    )
    
    if result['success']:
        vacancy = result['vacancy']
        # Используем связь с Finance для сериализации
        serializer = VacancySerializer(vacancy)
        return Response(serializer.data)
    else:
        return ResponseHandler.api_error_response(result['message'])
```

#### **Критичность:** 🟡 **ВАЖНАЯ**
Основная бизнес-логика, но может работать без некоторых интеграций.

---

### 6. **🔍 HUNTFLOW - HR интеграция**

**Роль:** Интеграция с внешней HR системой Huntflow.

#### **Прямые связи:**
- **Accounts** - Использует `huntflow_api_key`
- **Finance** - Использует модели `Grade` и `CurrencyRate`
- **Google OAuth** - Использует `HuntflowAPICache`
- **ClickUp** - Передача задач
- **Notion** - Передача страниц

#### **Примеры использования в views:**

```python
# apps/huntflow/views.py - Использование API ключа из Accounts
@login_required
def huntflow_dashboard(request):
    """Главная страница интеграции с Huntflow"""
    try:
        # Проверяем, настроен ли Huntflow у пользователя (связь с Accounts)
        if not request.user.huntflow_prod_url and not request.user.huntflow_sandbox_url:
            messages.warning(request, 'Huntflow не настроен. Обратитесь к администратору.')
            return render(request, 'huntflow/dashboard.html', {
                'huntflow_configured': False
            })
        
        # Используем API ключ пользователя (связь с Accounts)
        huntflow_service = HuntflowService(request.user)
        
        # Получаем данные организаций
        accounts_data = huntflow_service.get_accounts()
        
        if accounts_data and 'items' in accounts_data:
            accounts = accounts_data['items']
            # Используем первую организацию по умолчанию
            default_account = accounts[0] if accounts else None
        else:
            accounts = []
            default_account = None
        
        context = {
            'huntflow_configured': True,
            'accounts': accounts,
            'default_account': default_account,
        }
        
        return render(request, 'huntflow/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка подключения к Huntflow: {str(e)}')
        return render(request, 'huntflow/dashboard.html', {
            'huntflow_configured': False,
            'error': str(e)
        })

# apps/huntflow/views.py - Синхронизация с Finance данными
@login_required
def vacancy_detail(request, account_id, vacancy_id):
    """Детали вакансии с финансовыми данными"""
    try:
        huntflow_service = HuntflowService(request.user)
        vacancy_data = huntflow_service.get_vacancy(account_id, vacancy_id)
        
        # Используем связь с Finance для получения грейдов
        from apps.finance.models import Grade, CurrencyRate
        grades = Grade.objects.filter(is_active=True).order_by('name')
        currency_rates = CurrencyRate.objects.filter(is_active=True).order_by('-created_at')
        
        # Попытка сопоставить грейд из Huntflow с локальным грейдом
        matched_grade = None
        if vacancy_data.get('grade'):
            try:
                matched_grade = Grade.objects.get(name__icontains=vacancy_data['grade'])
            except Grade.DoesNotExist:
                pass
        
        context = {
            'vacancy': vacancy_data,
            'account_id': account_id,
            'grades': grades,
            'currency_rates': currency_rates,
            'matched_grade': matched_grade,
        }
        
        return render(request, 'huntflow/vacancy_detail.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка получения данных вакансии: {str(e)}')
        return redirect('huntflow:vacancies_list', account_id=account_id)
```

#### **Критичность:** 🟢 **ОПЦИОНАЛЬНАЯ**
Внешняя интеграция, система может работать без неё.

---

### 7. **🤖 GEMINI - AI сервисы**

**Роль:** Предоставление AI функциональности через Gemini API.

#### **Прямые связи:**
- **Accounts** - Использует `gemini_api_key`

#### **Примеры использования в views:**

```python
# apps/gemini/views.py - Использование API ключа из Accounts
@login_required
def gemini_dashboard(request):
    """Дашборд Gemini AI с проверкой API ключа"""
    # Проверяем наличие API ключа (связь с Accounts)
    if not request.user.gemini_api_key:
        messages.warning(request, 'Gemini API ключ не настроен. Настройте его в профиле.')
        return render(request, 'gemini/dashboard.html', {
            'gemini_configured': False
        })
    
    try:
        # Используем Gemini сервис с API ключом пользователя
        from .logic.gemini_service import GeminiService
        gemini_service = GeminiService(request.user.gemini_api_key)
        
        # Тестируем соединение
        test_result = gemini_service.test_connection()
        
        context = {
            'gemini_configured': True,
            'test_result': test_result,
            'api_key_configured': bool(request.user.gemini_api_key),
        }
        
        return render(request, 'gemini/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка подключения к Gemini: {str(e)}')
        return render(request, 'gemini/dashboard.html', {
            'gemini_configured': False,
            'error': str(e)
        })

# apps/gemini/views.py - AI чат с использованием API ключа
@login_required
def chat_view(request):
    """AI чат с использованием Gemini API"""
    if not request.user.gemini_api_key:
        messages.error(request, 'Gemini API ключ не настроен')
        return redirect('gemini:dashboard')
    
    try:
        from .logic.gemini_service import GeminiService
        gemini_service = GeminiService(request.user.gemini_api_key)
        
        if request.method == 'POST':
            user_message = request.POST.get('message', '')
            if user_message:
                # Отправляем сообщение в Gemini API
                response = gemini_service.generate_response(user_message)
                
                # Сохраняем историю чата
                chat_session = ChatSession.objects.create(
                    user=request.user,
                    user_message=user_message,
                    ai_response=response['text']
                )
                
                return JsonResponse({
                    'success': True,
                    'response': response['text'],
                    'session_id': chat_session.id
                })
        
        # Получаем историю чатов пользователя
        recent_sessions = ChatSession.objects.filter(user=request.user).order_by('-created_at')[:10]
        
        context = {
            'recent_sessions': recent_sessions,
        }
        
        return render(request, 'gemini/chat.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка AI чата: {str(e)}')
        return render(request, 'gemini/chat.html', {'error': str(e)})
```

#### **Критичность:** 🟢 **ОПЦИОНАЛЬНАЯ**
AI функциональность, не критично для основной работы системы.

---

### 8. **🔗 GOOGLE OAUTH - Google интеграция**

**Роль:** Интеграция с Google сервисами (OAuth, Calendar).

#### **Прямые связи:**
- **Accounts** - `OneToOneField` связь с `User`
- **Finance** - Использует `Grade` и `CurrencyRate`
- **Interviewers** - Синхронизация календарей
- **Huntflow** - Предоставляет `HuntflowAPICache`

#### **Примеры использования в views:**

```python
# apps/google_oauth/views.py - Использование связи с Accounts
@login_required
def dashboard(request):
    """Дашборд Google OAuth интеграции"""
    # Проверяем связь с Accounts (OneToOneField)
    google_oauth_account = getattr(request.user, 'google_oauth_account', None)
    
    if not google_oauth_account:
        messages.info(request, 'Google OAuth не подключен. Подключите аккаунт для полной функциональности.')
        return render(request, 'google_oauth/dashboard.html', {
            'google_connected': False
        })
    
    try:
        # Используем Google OAuth сервисы
        oauth_service = GoogleOAuthService(google_oauth_account)
        calendar_service = GoogleCalendarService(google_oauth_account)
        
        # Получаем информацию о календарях
        calendars = calendar_service.get_calendars()
        
        # Получаем ближайшие события
        upcoming_events = calendar_service.get_upcoming_events(limit=10)
        
        context = {
            'google_connected': True,
            'google_email': google_oauth_account.email,
            'calendars': calendars,
            'upcoming_events': upcoming_events,
        }
        
        return render(request, 'google_oauth/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка получения данных Google: {str(e)}')
        return render(request, 'google_oauth/dashboard.html', {
            'google_connected': False,
            'error': str(e)
        })

# apps/google_oauth/views.py - Использование связи с Finance
@login_required
def calendar_events(request):
    """События календаря с финансовыми данными"""
    google_oauth_account = request.user.google_oauth_account
    if not google_oauth_account:
        messages.error(request, 'Google OAuth не подключен')
        return redirect('google_oauth:dashboard')
    
    try:
        calendar_service = GoogleCalendarService(google_oauth_account)
        
        # Используем связь с Finance для получения грейдов и валют
        from apps.finance.models import Grade, CurrencyRate
        grades = Grade.objects.filter(is_active=True).order_by('name')
        currency_rates = CurrencyRate.objects.filter(is_active=True).order_by('-created_at')
        
        # Получаем события календаря
        events = calendar_service.get_events()
        
        # Обогащаем события финансовыми данными
        enriched_events = []
        for event in events:
            # Попытка извлечь грейд из описания события
            event_grade = None
            if event.get('description'):
                for grade in grades:
                    if grade.name.lower() in event['description'].lower():
                        event_grade = grade
                        break
            
            enriched_event = {
                **event,
                'grade': event_grade,
                'currency_rate': currency_rates.first() if currency_rates else None
            }
            enriched_events.append(enriched_event)
        
        context = {
            'events': enriched_events,
            'grades': grades,
            'currency_rates': currency_rates,
        }
        
        return render(request, 'google_oauth/calendar_events.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка получения событий: {str(e)}')
        return render(request, 'google_oauth/calendar_events.html', {'error': str(e)})
```

#### **Критичность:** 🟡 **ВАЖНАЯ**
Важно для календарной интеграции и OAuth.

---

### 9. **📋 CLICKUP INT - ClickUp интеграция**

**Роль:** Интеграция с системой управления задачами ClickUp.

#### **Прямые связи:**
- **Accounts** - Использует `clickup_api_key`
- **Huntflow** - Передача задач

#### **Примеры использования в views:**

```python
# apps/clickup_int/views.py - Использование API ключа из Accounts
@login_required
def dashboard(request):
    """Дашборд ClickUp интеграции"""
    # Проверяем наличие API ключа (связь с Accounts)
    if not request.user.clickup_api_key:
        messages.warning(request, 'ClickUp API ключ не настроен. Настройте его в профиле.')
        return render(request, 'clickup_int/dashboard.html', {
            'clickup_configured': False
        })
    
    try:
        from .services import ClickUpService
        clickup_service = ClickUpService(request.user.clickup_api_key)
        
        # Получаем информацию о команде
        team_info = clickup_service.get_team_info()
        
        # Получаем задачи пользователя
        user_tasks = clickup_service.get_user_tasks(request.user.email)
        
        context = {
            'clickup_configured': True,
            'team_info': team_info,
            'user_tasks': user_tasks,
        }
        
        return render(request, 'clickup_int/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка подключения к ClickUp: {str(e)}')
        return render(request, 'clickup_int/dashboard.html', {
            'clickup_configured': False,
            'error': str(e)
        })
```

#### **Критичность:** 🟢 **ОПЦИОНАЛЬНАЯ**
Внешняя интеграция, не критично для основной работы.

---

### 10. **📝 NOTION INT - Notion интеграция**

**Роль:** Интеграция с системой управления знаниями Notion.

#### **Прямые связи:**
- **Accounts** - Использует `notion_integration_token`
- **Huntflow** - Передача страниц

#### **Примеры использования в views:**

```python
# apps/notion_int/views.py - Использование токена из Accounts
@login_required
def dashboard(request):
    """Дашборд Notion интеграции"""
    # Проверяем наличие интеграционного токена (связь с Accounts)
    if not request.user.notion_integration_token:
        messages.warning(request, 'Notion Integration Token не настроен. Настройте его в профиле.')
        return render(request, 'notion_int/dashboard.html', {
            'notion_configured': False
        })
    
    try:
        from .services import NotionService
        notion_service = NotionService(request.user.notion_integration_token)
        
        # Получаем базы данных пользователя
        databases = notion_service.get_databases()
        
        # Получаем недавние страницы
        recent_pages = notion_service.get_recent_pages(limit=10)
        
        context = {
            'notion_configured': True,
            'databases': databases,
            'recent_pages': recent_pages,
        }
        
        return render(request, 'notion_int/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка подключения к Notion: {str(e)}')
        return render(request, 'notion_int/dashboard.html', {
            'notion_configured': False,
            'error': str(e)
        })
```

#### **Критичность:** 🟢 **ОПЦИОНАЛЬНАЯ**
Внешняя интеграция, не критично для основной работы.

---

### 11. **💬 TELEGRAM - Telegram интеграция**

**Роль:** Интеграция с Telegram для уведомлений.

#### **Прямые связи:**
- **Accounts** - `OneToOneField` связь с `User`

#### **Примеры использования в views:**

```python
# apps/telegram/views.py - Использование связи с Accounts
@login_required
def telegram_dashboard(request):
    """Дашборд Telegram интеграции"""
    # Проверяем связь с Accounts (OneToOneField)
    telegram_user = getattr(request.user, 'telegram_user', None)
    
    if not telegram_user:
        messages.info(request, 'Telegram не подключен. Подключите аккаунт для получения уведомлений.')
        return render(request, 'telegram/dashboard.html', {
            'telegram_connected': False
        })
    
    try:
        # Получаем информацию о Telegram пользователе
        telegram_info = {
            'username': telegram_user.username,
            'first_name': telegram_user.first_name,
            'last_name': telegram_user.last_name,
            'phone': telegram_user.phone,
            'is_active': telegram_user.is_active,
        }
        
        # Получаем последние уведомления
        from .models import TelegramNotification
        recent_notifications = TelegramNotification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]
        
        context = {
            'telegram_connected': True,
            'telegram_info': telegram_info,
            'recent_notifications': recent_notifications,
        }
        
        return render(request, 'telegram/dashboard.html', context)
        
    except Exception as e:
        messages.error(request, f'Ошибка получения данных Telegram: {str(e)}')
        return render(request, 'telegram/dashboard.html', {
            'telegram_connected': False,
            'error': str(e)
        })

# apps/telegram/views.py - Отправка уведомлений
@login_required
@require_POST
def send_notification(request):
    """Отправка уведомления через Telegram"""
    telegram_user = request.user.telegram_user
    if not telegram_user:
        return JsonResponse({'success': False, 'message': 'Telegram не подключен'})
    
    try:
        message = request.POST.get('message', '')
        if not message:
            return JsonResponse({'success': False, 'message': 'Сообщение не может быть пустым'})
        
        # Используем Telegram клиент для отправки
        from .telegram_client import TelegramClient
        telegram_client = TelegramClient()
        
        result = telegram_client.send_message(telegram_user.telegram_id, message)
        
        if result['success']:
            # Сохраняем уведомление в базе
            TelegramNotification.objects.create(
                user=request.user,
                message=message,
                sent=True
            )
            return JsonResponse({'success': True, 'message': 'Уведомление отправлено'})
        else:
            return JsonResponse({'success': False, 'message': result['error']})
            
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})
```

#### **Критичность:** 🟢 **ОПЦИОНАЛЬНАЯ**
Система уведомлений, не критично для основной работы.

## 💡 **Общие паттерны использования связей в views**

### 1. **Проверка наличия связей**
```python
# Стандартный паттерн проверки OneToOneField связи
google_oauth_account = getattr(request.user, 'google_oauth_account', None)
if not google_oauth_account:
    messages.warning(request, 'Google OAuth не подключен')
    return redirect('accounts:profile')

# Проверка API ключей
if not request.user.huntflow_api_key:
    messages.error(request, 'Huntflow API ключ не настроен')
    return render(request, 'huntflow/dashboard.html', {'configured': False})
```

### 2. **Использование связанных моделей**
```python
# Получение данных из связанных приложений
from apps.finance.models import Grade
grades = Grade.objects.filter(is_active=True).order_by('name')

# Фильтрация по связанным объектам
vacancies = Vacancy.objects.filter(
    recruiter=request.user,
    available_grades__in=grades
).distinct()
```

### 3. **Обогащение данных из разных источников**
```python
# Обогащение событий календаря финансовыми данными
enriched_events = []
for event in events:
    # Поиск соответствующего грейда
    event_grade = None
    for grade in grades:
        if grade.name.lower() in event['description'].lower():
            event_grade = grade
            break
    
    enriched_event = {
        **event,
        'grade': event_grade,
        'currency_rate': currency_rates.first()
    }
    enriched_events.append(enriched_event)
```

### 4. **Обработка ошибок интеграций**
```python
try:
    # Использование внешнего сервиса
    service = ExternalService(user.api_key)
    result = service.get_data()
    
    context = {
        'data': result,
        'service_available': True
    }
    
except Exception as e:
    logger.error(f"Ошибка интеграции: {e}")
    context = {
        'error': str(e),
        'service_available': False
    }
    messages.error(request, f'Ошибка получения данных: {str(e)}')
```

## 🔄 **Типы взаимодействий**

### 1. **Прямые связи (Database Relations)**
- **OneToOneField** - Связь 1:1 между моделями
- **ForeignKey** - Связь многие-к-одному
- **ManyToManyField** - Связь многие-ко-многим

### 2. **Косвенные связи (API Integration)**
- **API ключи** - Хранение в модели `User`
- **Внешние сервисы** - Интеграция через API
- **Кэширование** - Обмен данными через кэш

### 3. **Системные связи (Django Framework)**
- **Django Groups** - Управление ролями
- **Template Tags** - Общие UI компоненты
- **Context Processors** - Глобальные данные

## ⚠️ **Критические зависимости**

### 🔴 **Критические (System Breaking)**
1. **Accounts** - Без него система не работает
2. **Finance** - Без грейдов большинство функций не работают

### 🟡 **Важные (Feature Breaking)**
3. **Common** - Без него нет навигации
4. **Interviewers** - Без него нет HR процессов
5. **Vacancies** - Без него нет основной бизнес-логики
6. **Google OAuth** - Без него нет календарной интеграции

### 🟢 **Опциональные (Enhancement)**
7. **Huntflow** - Внешняя интеграция
8. **Gemini** - AI функциональность
9. **ClickUp** - Управление задачами
10. **Notion** - Управление знаниями
11. **Telegram** - Уведомления

## 🔧 **Архитектурные принципы**

### 1. **Принцип единой ответственности (SRP)**
- Каждое приложение отвечает за свою область
- Четкое разделение обязанностей

### 2. **Принцип инверсии зависимостей (DIP)**
- Сервисы изолированы в `logic/` папках
- Только модели доступны для внешнего использования

### 3. **Принцип открытости/закрытости (OCP)**
- Легко добавлять новые интеграции
- Существующий код не изменяется

### 4. **Принцип подстановки Лисков (LSP)**
- Единые интерфейсы для похожих сервисов
- Совместимость между компонентами

## 🧪 **Стратегия тестирования связей**

### 1. **Unit тесты**
- Тестирование каждой связи отдельно
- Проверка корректности Foreign Key связей
- Валидация API интеграций

### 2. **Integration тесты**
- Тестирование полных рабочих процессов
- Проверка взаимодействия между приложениями
- Тестирование сценариев с ошибками

### 3. **End-to-End тесты**
- Тестирование полных пользовательских сценариев
- Проверка производительности системы
- Тестирование под нагрузкой

## 📈 **Мониторинг и метрики**

### 1. **Метрики связей**
- Количество активных связей между приложениями
- Производительность интеграций
- Частота использования API

### 2. **Метрики ошибок**
- Количество ошибок в связях
- Время восстановления после сбоев
- Доступность внешних сервисов

### 3. **Метрики бизнеса**
- Количество активных пользователей
- Использование функций по приложениям
- Эффективность HR процессов

## 🔄 **План развития связей**

### 1. **Краткосрочные цели (1-3 месяца)**
- Оптимизация существующих связей
- Улучшение обработки ошибок
- Добавление мониторинга

### 2. **Среднесрочные цели (3-6 месяцев)**
- Добавление новых интеграций
- Улучшение производительности
- Расширение тестового покрытия

### 3. **Долгосрочные цели (6+ месяцев)**
- Микросервисная архитектура
- API Gateway
- Event-driven архитектура

## 📝 **Рекомендации по управлению связями**

### 1. **Документирование**
- Поддерживать актуальную документацию связей
- Документировать все изменения
- Создать глоссарий терминов

### 2. **Версионирование**
- Версионировать API изменения
- Поддерживать обратную совместимость
- Планировать миграции

### 3. **Мониторинг**
- Настроить мониторинг всех связей
- Создать алерты для критических ошибок
- Регулярно проверять состояние системы

### 4. **Тестирование**
- Автоматизировать тестирование связей
- Создать тестовые данные
- Регулярно запускать интеграционные тесты

## 🎯 **Заключение**

Система HR Helper представляет собой хорошо структурированную архитектуру с четким разделением обязанностей между приложениями. Центральными узлами являются:

1. **Accounts** - для управления пользователями
2. **Finance** - для финансовых данных
3. **Common** - для навигации и UI

Большинство связей архитектурно обоснованы и обеспечивают необходимую функциональность. Критические зависимости минимальны, что обеспечивает стабильность системы.

### **Ключевые преимущества архитектуры:**
- ✅ Четкое разделение обязанностей
- ✅ Минимальные критические зависимости
- ✅ Легкость добавления новых интеграций
- ✅ Хорошая изоляция сервисов
- ✅ Гибкость в развитии

### **Области для улучшения:**
- 🔄 Автоматизация тестирования связей
- 📊 Расширение мониторинга
- 📚 Улучшение документации
- ⚡ Оптимизация производительности

Все связи между приложениями документированы, протестированы и готовы к продуктивному использованию.
