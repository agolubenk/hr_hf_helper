"""
Management команда для экспорта Django-сайта в статические HTML файлы
"""
import os
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.test import Client
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Экспорт всего сайта в статические HTML-файлы с демонстрационными данными'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='exported_site',
            help='Директория для экспорта (по умолчанию: exported_site)'
        )
        parser.add_argument(
            '--skip-accounts',
            action='store_true',
            help='Пропустить страницы аккаунтов (логин, регистрация)'
        )
        parser.add_argument(
            '--include-admin',
            action='store_true',
            help='Включить админ-панель (требует суперпользователя)'
        )

    def handle(self, *args, **options):
        output_dir = Path(options['output_dir'])
        skip_accounts = options['skip_accounts']
        include_admin = options['include_admin']
        
        self.stdout.write(
            self.style.SUCCESS(f'🚀 Начинаем экспорт статического сайта в {output_dir}')
        )
        
        # Создаем директории
        self._create_directories(output_dir)
        
        # Собираем статические файлы
        self._collect_static_files(output_dir)
        
        # Создаем демонстрационные данные
        self._create_demo_data()
        
        # Экспортируем HTML страницы
        self._export_html_pages(output_dir, skip_accounts, include_admin)
        
        # Создаем index.html для корневой директории
        self._create_index_file(output_dir)
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Экспорт завершен! Статический сайт находится в {output_dir}')
        )
        self.stdout.write(
            self.style.WARNING('📁 Структура:')
        )
        self.stdout.write(f'   {output_dir}/ - HTML файлы')
        self.stdout.write(f'   {output_dir}/static/ - CSS, JS, изображения')

    def _create_directories(self, output_dir):
        """Создаем необходимые директории"""
        output_dir.mkdir(exist_ok=True)
        (output_dir / 'static').mkdir(exist_ok=True)
        self.stdout.write('📁 Созданы директории для экспорта')

    def _collect_static_files(self, output_dir):
        """Собираем все статические файлы"""
        self.stdout.write('📦 Собираем статические файлы...')
        
        # Копируем статические файлы из STATIC_ROOT
        static_root = Path(settings.STATIC_ROOT)
        static_dest = output_dir / 'static'
        
        if static_root.exists():
            # Удаляем старую папку static если есть
            if static_dest.exists():
                shutil.rmtree(static_dest)
            
            # Копируем все статические файлы
            shutil.copytree(static_root, static_dest)
            self.stdout.write(f'✅ Скопированы статические файлы из {static_root}')
        else:
            self.stdout.write(
                self.style.WARNING('⚠️  STATIC_ROOT не найден, запускаем collectstatic...')
            )
            call_command('collectstatic', '--noinput')
            if static_root.exists():
                shutil.copytree(static_root, static_dest)
                self.stdout.write('✅ Статические файлы собраны и скопированы')

    def _create_demo_data(self):
        """Создаем демонстрационные данные"""
        self.stdout.write('🎭 Создаем демонстрационные данные...')
        
        with transaction.atomic():
            # Создаем демо-пользователя если его нет
            demo_user, created = User.objects.get_or_create(
                email='demo@hrhelper.com',
                defaults={
                    'first_name': 'Демо',
                    'last_name': 'Пользователь',
                    'is_staff': True,
                    'is_active': True,
                }
            )
            
            if created:
                demo_user.set_password('demo123')
                demo_user.save()
                self.stdout.write('✅ Создан демо-пользователь')
            else:
                self.stdout.write('ℹ️  Демо-пользователь уже существует')
            
            # Создаем суперпользователя для админки если нужно
            if not User.objects.filter(is_superuser=True).exists():
                superuser = User.objects.create_superuser(
                    email='admin@hrhelper.com',
                    password='admin123',
                    first_name='Админ',
                    last_name='Системы'
                )
                self.stdout.write('✅ Создан суперпользователь для админки')
            
            # Создаем детальные демо-данные
            self._create_finance_demo_data()
            self._create_vacancies_demo_data()
            self._create_huntflow_demo_data()
            self._create_interviewers_demo_data()
            self._create_google_oauth_demo_data()
            self._create_telegram_demo_data()
            self._create_clickup_demo_data()
            self._create_notion_demo_data()
            self._create_gemini_demo_data()

    def _export_html_pages(self, output_dir, skip_accounts, include_admin):
        """Экспортируем HTML страницы"""
        self.stdout.write('📄 Экспортируем HTML страницы...')
        
        client = Client()
        
        # Авторизуемся как демо-пользователь
        demo_user = User.objects.get(email='demo@hrhelper.com')
        client.force_login(demo_user)
        
        # Список URL для экспорта
        urls_to_export = [
            # Основные страницы
            ('/', 'index.html'),
            ('/huntflow/', 'huntflow.html'),
            ('/finance/', 'finance.html'),
            ('/gemini/', 'gemini.html'),
            ('/interviewers/', 'interviewers.html'),
            ('/vacancies/', 'vacancies.html'),
            ('/clickup/', 'clickup.html'),
            ('/notion/', 'notion.html'),
            ('/telegram/', 'telegram.html'),
            
            # Детализированные страницы Huntflow
            ('/huntflow/accounts/1/vacancies/', 'huntflow_vacancies.html'),
            ('/huntflow/accounts/1/vacancies/1/', 'huntflow_vacancy_detail.html'),
            ('/huntflow/accounts/1/applicants/', 'huntflow_applicants.html'),
            ('/huntflow/accounts/1/applicants/1/', 'huntflow_applicant_detail.html'),
            
            # Детализированные страницы Finance
            ('/finance/salary-ranges/', 'finance_salary_ranges.html'),
            ('/finance/benchmarks/', 'finance_benchmarks.html'),
            ('/finance/pln-taxes/', 'finance_pln_taxes.html'),
            
            # Детализированные страницы Vacancies
            ('/vacancies/list/', 'vacancies_list.html'),
            ('/vacancies/1/', 'vacancy_detail.html'),
            ('/vacancies/salary-ranges/', 'vacancies_salary_ranges.html'),
            
            # Детализированные страницы Interviewers
            ('/interviewers/list/', 'interviewers_list.html'),
            ('/interviewers/1/', 'interviewer_detail.html'),
            
            # Детализированные страницы Google OAuth
            ('/google-oauth/calendar/', 'google_oauth_calendar.html'),
            ('/google-oauth/invites/', 'google_oauth_invites.html'),
            ('/google-oauth/invites/list/', 'google_oauth_invites_list.html'),
            
            # Детализированные страницы ClickUp
            ('/clickup/tasks/', 'clickup_tasks.html'),
            ('/clickup/task/demo_task_1/', 'clickup_task_detail.html'),
            ('/clickup/settings/', 'clickup_settings.html'),
            
            # Детализированные страницы Notion
            ('/notion/pages/', 'notion_pages.html'),
            ('/notion/pages/demo_page_1/', 'notion_page_detail.html'),
            ('/notion/settings/', 'notion_settings.html'),
            
            # Детализированные страницы Telegram
            ('/telegram/chats/', 'telegram_chats.html'),
            ('/telegram/settings/', 'telegram_settings.html'),
        ]
        
        # Добавляем страницы аккаунтов если не пропускаем
        if not skip_accounts:
            urls_to_export.extend([
                ('/accounts/login/', 'accounts_login.html'),
                ('/accounts/', 'accounts_profile.html'),
            ])
        
        # Добавляем админку если нужно
        if include_admin:
            urls_to_export.append(('/admin/', 'admin.html'))
        
        exported_count = 0
        failed_count = 0
        
        for url_path, filename in urls_to_export:
            try:
                response = client.get(url_path)
                
                if response.status_code == 200:
                    file_path = output_dir / filename
                    
                    # Записываем HTML с исправленными путями к статическим файлам
                    content = self._fix_static_paths(response.content.decode('utf-8'))
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    self.stdout.write(f'✅ {url_path} → {filename}')
                    exported_count += 1
                    
                elif response.status_code == 302:
                    # Редирект - создаем страницу с информацией о редиректе
                    redirect_url = response.get('Location', '')
                    content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Редирект</title>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url={redirect_url}">
</head>
<body>
    <p>Эта страница перенаправляет на: <a href="{redirect_url}">{redirect_url}</a></p>
</body>
</html>
"""
                    file_path = output_dir / filename
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    self.stdout.write(f'🔄 {url_path} → {filename} (редирект)')
                    exported_count += 1
                    
                else:
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  {url_path}: HTTP {response.status_code}')
                    )
                    failed_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ {url_path}: {str(e)}')
                )
                failed_count += 1
        
        self.stdout.write(f'📊 Экспортировано: {exported_count}, ошибок: {failed_count}')

    def _fix_static_paths(self, content):
        """Исправляем пути к статическим файлам в HTML"""
        # Заменяем Django static теги на относительные пути
        import re
        
        # Заменяем {% static 'path' %} на static/path
        content = re.sub(
            r'{% static [\'"]([^\'"]+)[\'"] %}',
            r'static/\1',
            content
        )
        
        # Заменяем /static/ на static/
        content = re.sub(r'/static/', 'static/', content)
        
        return content

    def _create_index_file(self, output_dir):
        """Создаем главный index.html"""
        index_content = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Helper - Статический сайт</title>
    <link rel="stylesheet" href="static/css/hrhelper.css">
    <style>
        .welcome-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        .nav-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .nav-link {
            display: block;
            padding: 20px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            text-decoration: none;
            color: #495057;
            transition: all 0.3s ease;
        }
        .nav-link:hover {
            background: #e9ecef;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .nav-link h3 {
            margin: 0 0 10px 0;
            color: #007bff;
        }
        .info-box {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="welcome-container">
        <h1>🎯 HR Helper - Статический сайт</h1>
        <p>Демонстрационная версия HR Helper системы</p>
        
        <div class="info-box">
            <h3>ℹ️ Информация</h3>
            <p>Это статическая версия сайта, экспортированная из Django-приложения.</p>
            <p>Все данные являются демонстрационными.</p>
        </div>
        
        <div class="nav-links">
            <a href="huntflow.html" class="nav-link">
                <h3>👥 Huntflow</h3>
                <p>Управление кандидатами и вакансиями</p>
                <small>📄 <a href="huntflow_vacancies.html">Вакансии</a> | 
                       <a href="huntflow_applicants.html">Кандидаты</a> | 
                       <a href="huntflow_vacancy_detail.html">Детали вакансии</a></small>
            </a>
            
            <a href="finance.html" class="nav-link">
                <h3>💰 Финансы</h3>
                <p>Финансовые отчеты и аналитика</p>
                <small>📄 <a href="finance_salary_ranges.html">Зарплатные вилки</a> | 
                       <a href="finance_benchmarks.html">Бенчмарки</a> | 
                       <a href="finance_pln_taxes.html">Налоги PLN</a></small>
            </a>
            
            <a href="gemini.html" class="nav-link">
                <h3>🤖 Gemini AI</h3>
                <p>ИИ анализ и автоматизация</p>
            </a>
            
            <a href="interviewers.html" class="nav-link">
                <h3>👨‍💼 Интервьюеры</h3>
                <p>Управление интервьюерами</p>
                <small>📄 <a href="interviewers_list.html">Список</a> | 
                       <a href="interviewer_detail.html">Детали</a></small>
            </a>
            
            <a href="vacancies.html" class="nav-link">
                <h3>📋 Вакансии</h3>
                <p>Управление вакансиями</p>
                <small>📄 <a href="vacancies_list.html">Список</a> | 
                       <a href="vacancy_detail.html">Детали</a> | 
                       <a href="vacancies_salary_ranges.html">Зарплатные вилки</a></small>
            </a>
            
            <a href="clickup.html" class="nav-link">
                <h3>📌 ClickUp</h3>
                <p>Интеграция с ClickUp</p>
                <small>📄 <a href="clickup_tasks.html">Задачи</a> | 
                       <a href="clickup_task_detail.html">Детали задачи</a> | 
                       <a href="clickup_settings.html">Настройки</a></small>
            </a>
            
            <a href="notion.html" class="nav-link">
                <h3>📝 Notion</h3>
                <p>Интеграция с Notion</p>
                <small>📄 <a href="notion_pages.html">Страницы</a> | 
                       <a href="notion_page_detail.html">Детали страницы</a> | 
                       <a href="notion_settings.html">Настройки</a></small>
            </a>
            
            <a href="telegram.html" class="nav-link">
                <h3>📱 Telegram</h3>
                <p>Telegram бот и уведомления</p>
                <small>📄 <a href="telegram_chats.html">Чаты</a> | 
                       <a href="telegram_settings.html">Настройки</a></small>
            </a>
        </div>
        
        <div class="info-box">
            <h3>🔗 Дополнительные страницы</h3>
            <p><strong>Google OAuth:</strong> 
               <a href="google_oauth_calendar.html">Календарь</a> | 
               <a href="google_oauth_invites.html">Инвайты</a> | 
               <a href="google_oauth_invites_list.html">Список инвайтов</a>
            </p>
        </div>
        
        <div class="info-box">
            <h3>🔧 Техническая информация</h3>
            <p><strong>Экспортировано:</strong> {date}</p>
            <p><strong>Статические файлы:</strong> static/</p>
            <p><strong>Демо-пользователь:</strong> demo@hrhelper.com / demo123</p>
        </div>
    </div>
</body>
</html>
"""
        
        # Заменяем плейсхолдер даты
        current_date = __import__('datetime').datetime.now().strftime('%d.%m.%Y %H:%M')
        index_content = index_content.replace('{date}', current_date)
        
        index_path = output_dir / 'index.html'
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        self.stdout.write('✅ Создан главный index.html')

    def _create_finance_demo_data(self):
        """Создаем демо-данные для финансового модуля"""
        try:
            from apps.finance.models import Grade, CurrencyRate, PLNTax, SalaryRange, Benchmark, BenchmarkSettings
            
            # Создаем грейды
            grades_data = [
                'Junior', 'Junior+', 'Middle', 'Middle+', 'Senior', 'Senior+', 'Lead', 'Head'
            ]
            for grade_name in grades_data:
                Grade.objects.get_or_create(name=grade_name)
            
            # Создаем курсы валют
            currency_rates = [
                ('USD', Decimal('3.25'), 1),
                ('PLN', Decimal('0.80'), 1),
                ('BYN', Decimal('1.00'), 1),
            ]
            for code, rate, scale in currency_rates:
                CurrencyRate.objects.get_or_create(
                    code=code,
                    defaults={'rate': rate, 'scale': scale}
                )
            
            # Создаем налоги PLN
            pln_taxes = [
                ('Подоходный налог', Decimal('17.00')),
                ('Социальные взносы', Decimal('19.48')),
                ('Медицинское страхование', Decimal('9.00')),
            ]
            for name, rate in pln_taxes:
                PLNTax.objects.get_or_create(
                    name=name,
                    defaults={'rate': rate, 'is_active': True}
                )
            
            # Создаем настройки бенчмарков
            BenchmarkSettings.load()
            
            self.stdout.write('✅ Созданы финансовые демо-данные')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания финансовых данных: {e}')

    def _create_vacancies_demo_data(self):
        """Создаем демо-данные для вакансий"""
        try:
            from apps.vacancies.models import Vacancy, SalaryRange
            from apps.finance.models import Grade
            
            # Создаем вакансии
            vacancies_data = [
                {
                    'name': 'Backend Engineer (Java)',
                    'external_id': 'BE_JAVA_001',
                    'invite_title': 'Приглашение на позицию Backend Engineer (Java)',
                    'invite_text': 'Мы ищем опытного Java разработчика для работы над высоконагруженными системами.',
                    'scorecard_title': 'Scorecard Backend Engineer (Java)',
                    'questions_belarus': '1. Опыт работы с Spring Framework\n2. Знание микросервисной архитектуры\n3. Опыт работы с базами данных',
                    'questions_poland': '1. Experience with Spring Framework\n2. Microservices architecture knowledge\n3. Database experience',
                },
                {
                    'name': 'Frontend Engineer (React)',
                    'external_id': 'FE_REACT_001',
                    'invite_title': 'Приглашение на позицию Frontend Engineer (React)',
                    'invite_text': 'Ищем талантливого React разработчика для создания современных пользовательских интерфейсов.',
                    'scorecard_title': 'Scorecard Frontend Engineer (React)',
                    'questions_belarus': '1. Опыт работы с React\n2. Знание TypeScript\n3. Опыт работы с Redux',
                    'questions_poland': '1. React experience\n2. TypeScript knowledge\n3. Redux experience',
                },
                {
                    'name': 'QA Engineer',
                    'external_id': 'QA_001',
                    'invite_title': 'Приглашение на позицию QA Engineer',
                    'invite_text': 'Ищем QA инженера для обеспечения качества наших продуктов.',
                    'scorecard_title': 'Scorecard QA Engineer',
                    'questions_belarus': '1. Опыт тестирования\n2. Знание автоматизации\n3. Опыт работы с API',
                    'questions_poland': '1. Testing experience\n2. Automation knowledge\n3. API testing experience',
                },
                {
                    'name': 'DevOps Engineer',
                    'external_id': 'DEVOPS_001',
                    'invite_title': 'Приглашение на позицию DevOps Engineer',
                    'invite_text': 'Ищем DevOps инженера для автоматизации процессов разработки и развертывания.',
                    'scorecard_title': 'Scorecard DevOps Engineer',
                    'questions_belarus': '1. Опыт работы с Docker\n2. Знание Kubernetes\n3. Опыт работы с CI/CD',
                    'questions_poland': '1. Docker experience\n2. Kubernetes knowledge\n3. CI/CD experience',
                },
                {
                    'name': 'Project Manager',
                    'external_id': 'PM_001',
                    'invite_title': 'Приглашение на позицию Project Manager',
                    'invite_text': 'Ищем Project Manager для управления IT проектами.',
                    'scorecard_title': 'Scorecard Project Manager',
                    'questions_belarus': '1. Опыт управления проектами\n2. Знание методологий\n3. Опыт работы с командами',
                    'questions_poland': '1. Project management experience\n2. Methodology knowledge\n3. Team management experience',
                },
            ]
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            grades = list(Grade.objects.all())
            
            for vacancy_data in vacancies_data:
                vacancy, created = Vacancy.objects.get_or_create(
                    external_id=vacancy_data['external_id'],
                    defaults={
                        'name': vacancy_data['name'],
                        'recruiter': demo_user,
                        'invite_title': vacancy_data['invite_title'],
                        'invite_text': vacancy_data['invite_text'],
                        'scorecard_title': vacancy_data['scorecard_title'],
                        'questions_belarus': vacancy_data['questions_belarus'],
                        'questions_poland': vacancy_data['questions_poland'],
                        'screening_duration': 45,
                        'is_active': True,
                    }
                )
                
                if created:
                    # Добавляем доступные грейды
                    vacancy.available_grades.set(grades[:5])  # Первые 5 грейдов
                    
                    # Создаем зарплатные вилки
                    for grade in grades[:5]:
                        salary_min = random.randint(2000, 8000)
                        salary_max = salary_min + random.randint(1000, 3000)
                        
                        SalaryRange.objects.get_or_create(
                            vacancy=vacancy,
                            grade=grade,
                            defaults={
                                'salary_min_usd': Decimal(str(salary_min)),
                                'salary_max_usd': Decimal(str(salary_max)),
                                'is_active': True,
                            }
                        )
            
            self.stdout.write('✅ Созданы демо-данные вакансий')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных вакансий: {e}')

    def _create_huntflow_demo_data(self):
        """Создаем демо-данные для Huntflow"""
        try:
            from apps.huntflow.models import HuntflowCache, HuntflowLog
            
            # Создаем кэш данные
            cache_data = [
                {
                    'cache_key': 'accounts_list',
                    'data': {
                        'accounts': [
                            {
                                'id': 1,
                                'name': 'Demo Company',
                                'subdomain': 'demo',
                                'active': True
                            }
                        ]
                    }
                },
                {
                    'cache_key': 'account_1_vacancies',
                    'data': {
                        'vacancies': [
                            {
                                'id': 1,
                                'position': 'Backend Engineer (Java)',
                                'state': 'OPEN',
                                'created': '2024-01-15T10:00:00Z'
                            },
                            {
                                'id': 2,
                                'position': 'Frontend Engineer (React)',
                                'state': 'OPEN',
                                'created': '2024-01-16T11:00:00Z'
                            }
                        ]
                    }
                },
                {
                    'cache_key': 'account_1_applicants',
                    'data': {
                        'applicants': [
                            {
                                'id': 1,
                                'first_name': 'Иван',
                                'last_name': 'Петров',
                                'email': 'ivan.petrov@example.com',
                                'position': 'Backend Engineer (Java)',
                                'status': 'NEW'
                            },
                            {
                                'id': 2,
                                'first_name': 'Мария',
                                'last_name': 'Сидорова',
                                'email': 'maria.sidorova@example.com',
                                'position': 'Frontend Engineer (React)',
                                'status': 'INTERVIEW'
                            }
                        ]
                    }
                }
            ]
            
            for cache_item in cache_data:
                HuntflowCache.objects.get_or_create(
                    cache_key=cache_item['cache_key'],
                    defaults={
                        'data': cache_item['data'],
                        'expires_at': timezone.now() + timezone.timedelta(hours=1)
                    }
                )
            
            # Создаем логи
            demo_user = User.objects.get(email='demo@hrhelper.com')
            log_data = [
                ('GET', '/v2/accounts', 200, 'Получение списка аккаунтов'),
                ('GET', '/v2/accounts/1/vacancies', 200, 'Получение вакансий'),
                ('GET', '/v2/accounts/1/applicants', 200, 'Получение кандидатов'),
            ]
            
            for method, endpoint, status_code, description in log_data:
                HuntflowLog.objects.create(
                    log_type='GET',
                    endpoint=endpoint,
                    method=method,
                    status_code=status_code,
                    user=demo_user,
                    request_data={},
                    response_data={'message': description}
                )
            
            self.stdout.write('✅ Созданы демо-данные Huntflow')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных Huntflow: {e}')

    def _create_interviewers_demo_data(self):
        """Создаем демо-данные для интервьюеров"""
        try:
            from apps.interviewers.models import Interviewer, InterviewRule
            
            # Создаем интервьюеров
            interviewers_data = [
                {
                    'name': 'Алексей Иванов',
                    'email': 'alexey.ivanov@company.com',
                    'telegram_username': '@alexey_ivanov',
                    'calendar_url': 'https://calendly.com/alexey-ivanov',
                    'is_active': True
                },
                {
                    'name': 'Елена Петрова',
                    'email': 'elena.petrova@company.com',
                    'telegram_username': '@elena_petrova',
                    'calendar_url': 'https://calendly.com/elena-petrova',
                    'is_active': True
                },
                {
                    'name': 'Дмитрий Сидоров',
                    'email': 'dmitry.sidorov@company.com',
                    'telegram_username': '@dmitry_sidorov',
                    'calendar_url': 'https://calendly.com/dmitry-sidorov',
                    'is_active': True
                }
            ]
            
            for interviewer_data in interviewers_data:
                interviewer, created = Interviewer.objects.get_or_create(
                    email=interviewer_data['email'],
                    defaults=interviewer_data
                )
                
                if created:
                    # Создаем правила привлечения
                    InterviewRule.objects.create(
                        interviewer=interviewer,
                        rule_name='Основное правило',
                        rule_description='Стандартное правило привлечения интервьюера',
                        is_active=True
                    )
            
            self.stdout.write('✅ Созданы демо-данные интервьюеров')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных интервьюеров: {e}')

    def _create_google_oauth_demo_data(self):
        """Создаем демо-данные для Google OAuth"""
        try:
            from apps.google_oauth.models import GoogleOAuthAccount, Invite, HRScreening
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            
            # Создаем Google OAuth аккаунт
            google_account, created = GoogleOAuthAccount.objects.get_or_create(
                user=demo_user,
                defaults={
                    'google_id': 'demo_google_id_123',
                    'email': 'demo@hrhelper.com',
                    'name': 'Demo User',
                    'access_token': 'demo_access_token',
                    'refresh_token': 'demo_refresh_token',
                    'is_active': True
                }
            )
            
            # Создаем инвайты
            invites_data = [
                {
                    'candidate_email': 'candidate1@example.com',
                    'candidate_name': 'Иван Петров',
                    'position': 'Backend Engineer (Java)',
                    'meeting_date': timezone.now() + timezone.timedelta(days=1),
                    'meeting_duration': 45,
                    'status': 'SENT'
                },
                {
                    'candidate_email': 'candidate2@example.com',
                    'candidate_name': 'Мария Сидорова',
                    'position': 'Frontend Engineer (React)',
                    'meeting_date': timezone.now() + timezone.timedelta(days=2),
                    'meeting_duration': 45,
                    'status': 'CONFIRMED'
                }
            ]
            
            for invite_data in invites_data:
                Invite.objects.get_or_create(
                    candidate_email=invite_data['candidate_email'],
                    defaults={
                        'user': demo_user,
                        'candidate_name': invite_data['candidate_name'],
                        'position': invite_data['position'],
                        'meeting_date': invite_data['meeting_date'],
                        'meeting_duration': invite_data['meeting_duration'],
                        'status': invite_data['status']
                    }
                )
            
            self.stdout.write('✅ Созданы демо-данные Google OAuth')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных Google OAuth: {e}')

    def _create_telegram_demo_data(self):
        """Создаем демо-данные для Telegram"""
        try:
            from apps.telegram.models import TelegramUser, TelegramChat, TelegramMessage
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            
            # Создаем Telegram пользователя
            telegram_user, created = TelegramUser.objects.get_or_create(
                user=demo_user,
                defaults={
                    'telegram_id': 123456789,
                    'username': 'demo_user',
                    'first_name': 'Demo',
                    'last_name': 'User',
                    'session_name': 'demo_session',
                    'is_authorized': True,
                    'auth_date': timezone.now()
                }
            )
            
            # Создаем чаты
            chats_data = [
                {
                    'chat_id': -1001234567890,
                    'title': 'HR Helper Demo Chat',
                    'chat_type': 'supergroup',
                    'is_active': True
                },
                {
                    'chat_id': -1001234567891,
                    'title': 'Recruitment Team',
                    'chat_type': 'supergroup',
                    'is_active': True
                }
            ]
            
            for chat_data in chats_data:
                chat, created = TelegramChat.objects.get_or_create(
                    chat_id=chat_data['chat_id'],
                    defaults=chat_data
                )
                
                if created:
                    # Создаем сообщения
                    messages_data = [
                        {
                            'message_id': 1,
                            'text': 'Добро пожаловать в HR Helper!',
                            'message_type': 'text',
                            'sender': telegram_user
                        },
                        {
                            'message_id': 2,
                            'text': 'Новый кандидат: Иван Петров',
                            'message_type': 'text',
                            'sender': telegram_user
                        }
                    ]
                    
                    for msg_data in messages_data:
                        TelegramMessage.objects.create(
                            chat=chat,
                            message_id=msg_data['message_id'],
                            text=msg_data['text'],
                            message_type=msg_data['message_type'],
                            sender=msg_data['sender'],
                            created_at=timezone.now()
                        )
            
            self.stdout.write('✅ Созданы демо-данные Telegram')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных Telegram: {e}')

    def _create_clickup_demo_data(self):
        """Создаем демо-данные для ClickUp"""
        try:
            from apps.clickup_int.models import ClickUpSettings, ClickUpTask
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            
            # Создаем настройки ClickUp
            clickup_settings, created = ClickUpSettings.objects.get_or_create(
                user=demo_user,
                defaults={
                    'api_key': 'demo_clickup_api_key',
                    'team_id': 'demo_team_id',
                    'space_id': 'demo_space_id',
                    'folder_id': 'demo_folder_id',
                    'list_id': 'demo_list_id',
                    'is_active': True
                }
            )
            
            # Создаем задачи
            tasks_data = [
                {
                    'task_id': 'demo_task_1',
                    'name': 'Найти кандидата на позицию Backend Engineer',
                    'description': 'Поиск и отбор кандидатов на позицию Java разработчика',
                    'status': 'in progress',
                    'priority': 'high',
                    'assignee': 'demo_user'
                },
                {
                    'task_id': 'demo_task_2',
                    'name': 'Провести интервью с кандидатом',
                    'description': 'Техническое интервью с кандидатом на позицию Frontend Engineer',
                    'status': 'completed',
                    'priority': 'medium',
                    'assignee': 'demo_user'
                }
            ]
            
            for task_data in tasks_data:
                ClickUpTask.objects.get_or_create(
                    task_id=task_data['task_id'],
                    defaults={
                        'user': demo_user,
                        'name': task_data['name'],
                        'description': task_data['description'],
                        'status': task_data['status'],
                        'priority': task_data['priority'],
                        'assignee': task_data['assignee'],
                        'created_at': timezone.now()
                    }
                )
            
            self.stdout.write('✅ Созданы демо-данные ClickUp')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных ClickUp: {e}')

    def _create_notion_demo_data(self):
        """Создаем демо-данные для Notion"""
        try:
            from apps.notion_int.models import NotionSettings, NotionPage
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            
            # Создаем настройки Notion
            notion_settings, created = NotionSettings.objects.get_or_create(
                user=demo_user,
                defaults={
                    'integration_token': 'demo_notion_token',
                    'database_id': 'demo_database_id',
                    'is_active': True
                }
            )
            
            # Создаем страницы
            pages_data = [
                {
                    'page_id': 'demo_page_1',
                    'title': 'Кандидат: Иван Петров',
                    'content': 'Резюме и информация о кандидате на позицию Backend Engineer',
                    'status': 'active'
                },
                {
                    'page_id': 'demo_page_2',
                    'title': 'Кандидат: Мария Сидорова',
                    'content': 'Резюме и информация о кандидате на позицию Frontend Engineer',
                    'status': 'active'
                }
            ]
            
            for page_data in pages_data:
                NotionPage.objects.get_or_create(
                    page_id=page_data['page_id'],
                    defaults={
                        'user': demo_user,
                        'title': page_data['title'],
                        'content': page_data['content'],
                        'status': page_data['status'],
                        'created_at': timezone.now()
                    }
                )
            
            self.stdout.write('✅ Созданы демо-данные Notion')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных Notion: {e}')

    def _create_gemini_demo_data(self):
        """Создаем демо-данные для Gemini"""
        try:
            from apps.gemini.models import ChatSession, ChatMessage
            
            demo_user = User.objects.get(email='demo@hrhelper.com')
            
            # Создаем чат-сессии
            sessions_data = [
                {
                    'title': 'Анализ кандидата: Иван Петров',
                    'session_type': 'candidate_analysis',
                    'is_active': True
                },
                {
                    'title': 'Анализ вакансии: Backend Engineer',
                    'session_type': 'vacancy_analysis',
                    'is_active': True
                }
            ]
            
            for session_data in sessions_data:
                session, created = ChatSession.objects.get_or_create(
                    user=demo_user,
                    title=session_data['title'],
                    defaults={
                        'session_type': session_data['session_type'],
                        'is_active': session_data['is_active'],
                        'created_at': timezone.now()
                    }
                )
                
                if created:
                    # Создаем сообщения
                    messages_data = [
                        {
                            'role': 'user',
                            'content': 'Проанализируй этого кандидата',
                            'message_type': 'text'
                        },
                        {
                            'role': 'assistant',
                            'content': 'Кандидат имеет хороший опыт работы с Java и Spring Framework. Рекомендую пригласить на техническое интервью.',
                            'message_type': 'text'
                        }
                    ]
                    
                    for msg_data in messages_data:
                        ChatMessage.objects.create(
                            session=session,
                            role=msg_data['role'],
                            content=msg_data['content'],
                            message_type=msg_data['message_type'],
                            created_at=timezone.now()
                        )
            
            self.stdout.write('✅ Созданы демо-данные Gemini')
        except Exception as e:
            self.stdout.write(f'⚠️  Ошибка создания данных Gemini: {e}')
