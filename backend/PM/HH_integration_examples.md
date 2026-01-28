# Практическая интеграция HH.ru откликов в Huntflow

## Быстрый старт (5 минут)

### Шаг 1: Установка зависимостей

```bash
pip install requests  # Уже включен в Django
```

### Шаг 2: Создание файла `apps/huntflow/hh_integration.py`

Скопировать код из основной документации

### Шаг 3: Обновление `huntflow_operations.py`

Добавить метод `get_and_import_hh_responses()`

### Шаг 4: Обновление `huntflow_api.py`

Добавить endpoint `/api/huntflow/import-hh-responses/`

### Шаг 5: Первый запрос

```python
from apps.huntflow.hh_integration import HHResponsesHandler

handler = HHResponsesHandler(request.user)
result = handler.filter_and_import_responses(
    responses=['...'],
    account_id=123,
    vacancy_id=456,
    filters={'min_age': 25, 'max_age': 50}
)
```

---

## Расширенные сценарии использования

### Сценарий 1: Синхронизация по расписанию

```python
# apps/huntflow/tasks.py

from celery import shared_task
from celery.utils.log import get_task_logger
from apps.huntflow.hh_integration import HHResponsesHandler
from apps.huntflow.models import HuntflowSync
from django.contrib.auth import get_user_model

logger = get_task_logger(__name__)
User = get_user_model()

@shared_task(bind=True, max_retries=3)
def sync_hh_responses_scheduled(
    self,
    user_id,
    account_id,
    vacancy_id,
    hh_vacancy_id
):
    """
    Синхронизация откликов из HH.ru по расписанию (каждый час)
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - user_id: ID пользователя Django
    - account_id: ID организации в Huntflow
    - vacancy_id: ID вакансии в Huntflow
    - hh_vacancy_id: ID вакансии на HH.ru
    
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API
    
    ОБРАБОТКА:
    1. Получение откликов из HH.ru
    2. Фильтрация по критериям
    3. Импорт в Huntflow
    4. Сохранение статистики
    5. Отправка уведомления пользователю
    
    ВЫХОДЯЩИЕ ДАННЫЕ: Результаты синхронизации в базе данных
    
    СВЯЗИ: HHResponsesHandler, HuntflowSync модель, Celery
    
    ФОРМАТ: Celery задача
    """
    
    try:
        user = User.objects.get(id=user_id)
        handler = HHResponsesHandler(user)
        
        logger.info(
            f"Начало синхронизации откликов для пользователя {user.username}, "
            f"вакансия {hh_vacancy_id}"
        )
        
        # Получаем отклики
        responses = handler.get_responses_from_hh(hh_vacancy_id)
        
        if not responses['success']:
            logger.error(f"Ошибка получения откликов: {responses['message']}")
            # Повторная попытка через 5 минут
            raise self.retry(countdown=300)
        
        # Используем сохраненные фильтры
        sync_config = HuntflowSync.objects.get(
            user=user,
            account_id=account_id,
            vacancy_id=vacancy_id
        )
        
        filters = sync_config.get_filters()
        
        # Фильтруем и импортируем
        result = handler.filter_and_import_responses(
            responses['items'],
            account_id,
            vacancy_id,
            filters
        )
        
        # Сохраняем результаты
        sync_config.last_sync = timezone.now()
        sync_config.last_sync_total = result['imported']
        sync_config.last_sync_status = 'success'
        sync_config.save()
        
        logger.info(
            f"Синхронизация завершена: "
            f"импортировано {result['imported']}, "
            f"отфильтровано {result['filtered_out']}"
        )
        
        # Отправляем уведомление
        send_sync_notification(
            user=user,
            account_id=account_id,
            result=result
        )
        
        return {
            'status': 'success',
            'imported': result['imported'],
            'filtered_out': result['filtered_out']
        }
        
    except Exception as exc:
        logger.error(f"Ошибка синхронизации: {exc}")
        # Максимум 3 попытки с интервалом 5 минут
        raise self.retry(countdown=300, exc=exc)


@shared_task
def send_sync_notification(user, account_id, result):
    """Отправляет уведомление пользователю о результатах синхронизации"""
    
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    
    context = {
        'user': user,
        'imported': result['imported'],
        'filtered_out': result['filtered_out'],
        'errors': result['errors'],
        'rejection_stats': result['filter_results']['rejected']
    }
    
    html_message = render_to_string(
        'huntflow/emails/sync_notification.html',
        context
    )
    
    send_mail(
        subject='Результаты синхронизации откликов из HH.ru',
        message='',
        from_email='noreply@hr-system.ru',
        recipient_list=[user.email],
        html_message=html_message
    )
```

### Конфигурация Celery Beat

```python
# myproject/celery.py

from celery.schedules import crontab

app.conf.beat_schedule = {
    'sync-hh-responses-hourly': {
        'task': 'apps.huntflow.tasks.sync_hh_responses_scheduled',
        'schedule': crontab(minute=0),  # Каждый час в 00 минут
        'args': (user_id, account_id, vacancy_id, hh_vacancy_id)
    },
}
```

---

### Сценарий 2: Автоматическое добавление в проект

```python
# apps/huntflow/hh_auto_process.py

from apps.huntflow.hh_integration import HHResponsesHandler
from apps.projects.models import ProjectCandidate

class HHAutoProcessor:
    """
    Автоматическая обработка откликов из HH.ru
    
    ВХОДЯЩИЕ ДАННЫЕ: responses (список откликов), project_id
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, параметры обработки
    ОБРАБОТКА: Импорт кандидатов и их связь с проектом
    ВЫХОДЯЩИЕ ДАННЫЕ: Обновленные кандидаты в проекте
    СВЯЗИ: HHResponsesHandler, ProjectCandidate модель
    ФОРМАТ: Класс с методами автоматизации
    """
    
    def __init__(self, user):
        self.user = user
        self.handler = HHResponsesHandler(user)
    
    def process_and_add_to_project(
        self,
        hh_vacancy_id: str,
        account_id: int,
        vacancy_id: int,
        project_id: int,
        filters: Dict = None
    ) -> Dict:
        """
        Импортирует откликов из HH.ru и добавляет в проект
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - hh_vacancy_id: ID вакансии на HH.ru
        - account_id: ID организации в Huntflow
        - vacancy_id: ID вакансии в Huntflow
        - project_id: ID проекта для добавления кандидатов
        - filters: критерии фильтрации
        
        ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API
        
        ОБРАБОТКА:
        1. Получение откликов из HH.ru
        2. Фильтрация откликов
        3. Импорт в Huntflow
        4. Добавление в проект
        5. Логирование результатов
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Результаты обработки с IDs проектных кандидатов
        
        СВЯЗИ: HHResponsesHandler, ProjectCandidate
        
        ФОРМАТ: Dict с результатами
        """
        
        # Получаем отклики
        responses = self.handler.get_responses_from_hh(hh_vacancy_id)
        
        if not responses['success']:
            return {'success': False, 'message': responses['message']}
        
        # Фильтруем и импортируем
        result = self.handler.filter_and_import_responses(
            responses['items'],
            account_id,
            vacancy_id,
            filters
        )
        
        # Добавляем в проект
        project_candidates = []
        
        for candidate in result['imported_candidates']:
            try:
                project_candidate = ProjectCandidate.objects.create(
                    project_id=project_id,
                    candidate_id=candidate['id'],
                    source='HH.ru',
                    status='imported'
                )
                project_candidates.append(project_candidate)
            except Exception as e:
                logger.error(f"Ошибка добавления в проект: {e}")
        
        result['project_candidates'] = project_candidates
        result['project_id'] = project_id
        
        return result
```

---

### Сценарий 3: Массовая обработка нескольких вакансий

```python
# apps/huntflow/hh_bulk_processor.py

from typing import List, Dict
from apps.huntflow.hh_integration import HHResponsesHandler

class HHBulkProcessor:
    """
    Массовая обработка откликов из HH.ru для нескольких вакансий
    
    ВХОДЯЩИЕ ДАННЫЕ: user, список конфигураций вакансий
    ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API
    ОБРАБОТКА: Параллельный импорт откликов для нескольких вакансий
    ВЫХОДЯЩИЕ ДАННЫЕ: Результаты импорта для каждой вакансии
    СВЯЗИ: HHResponsesHandler, Celery
    ФОРМАТ: Класс для параллельной обработки
    """
    
    def __init__(self, user):
        self.user = user
        self.handler = HHResponsesHandler(user)
    
    def process_multiple_vacancies(
        self,
        vacancy_configs: List[Dict]
    ) -> Dict:
        """
        Обрабатывает отклики для нескольких вакансий одновременно
        
        ВХОДЯЩИЕ ДАННЫЕ:
        vacancy_configs = [
            {
                'account_id': 123,
                'vacancy_id': 456,
                'hh_vacancy_id': '789',
                'filters': {...}
            },
            {
                'account_id': 123,
                'vacancy_id': 457,
                'hh_vacancy_id': '790',
                'filters': {...}
            }
        ]
        
        ИСТОЧНИКИ ДАННЫХ: HH.ru API, Huntflow API, параметры
        
        ОБРАБОТКА:
        1. Для каждой вакансии получаются отклики
        2. Применяются фильтры
        3. Кандидаты импортируются в Huntflow
        4. Собирается статистика
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Агрегированная статистика импорта
        
        СВЯЗИ: HHResponsesHandler
        
        ФОРМАТ: Dict с результатами для каждой вакансии
        """
        
        results = {
            'total_vacancies': len(vacancy_configs),
            'successful': 0,
            'failed': 0,
            'total_imported': 0,
            'total_filtered': 0,
            'total_errors': 0,
            'vacancy_results': []
        }
        
        for config in vacancy_configs:
            try:
                result = self.handler.filter_and_import_responses(
                    account_id=config['account_id'],
                    vacancy_id=config['vacancy_id'],
                    hh_vacancy_id=config['hh_vacancy_id'],
                    filters=config.get('filters')
                )
                
                if result['success']:
                    results['successful'] += 1
                    results['total_imported'] += result['imported']
                    results['total_filtered'] += result['filtered_out']
                    results['total_errors'] += result['errors']
                else:
                    results['failed'] += 1
                
                results['vacancy_results'].append({
                    'vacancy_id': config['vacancy_id'],
                    'hh_vacancy_id': config['hh_vacancy_id'],
                    'result': result
                })
                
            except Exception as e:
                logger.error(f"Ошибка обработки вакансии {config['vacancy_id']}: {e}")
                results['failed'] += 1
                results['vacancy_results'].append({
                    'vacancy_id': config['vacancy_id'],
                    'error': str(e)
                })
        
        return results
```

---

### Сценарий 4: Умные фильтры с ML

```python
# apps/huntflow/hh_smart_filters.py

import re
from typing import Dict, List
from apps.huntflow.hh_integration import HHResponsesFilter

class SmartHHFilter(HHResponsesFilter):
    """
    Расширенные фильтры для откликов HH.ru с использованием ML
    
    ВХОДЯЩИЕ ДАННЫЕ: responses, filters, job_description
    ИСТОЧНИКИ ДАННЫХ: HH.ru API response, описание вакансии
    ОБРАБОТКА: Умная фильтрация с анализом навыков и опыта
    ВЫХОДЯЩИЕ ДАННЫЕ: Отсортированные по релевантности отклики
    СВЯЗИ: HHResponsesFilter (базовый класс)
    ФОРМАТ: Класс с методами умной фильтрации
    """
    
    def filter_with_skill_matching(
        self,
        responses: List[Dict],
        required_skills: List[str],
        filters: Dict = None
    ) -> Dict:
        """
        Фильтрует отклики с учетом совпадения требуемых навыков
        
        ВХОДЯЩИЕ ДАННЫЕ:
        - responses: отклики из HH.ru
        - required_skills: список требуемых навыков ['Python', 'Django', 'PostgreSQL']
        - filters: базовые критерии фильтрации
        
        ИСТОЧНИКИ ДАННЫХ: responses, required_skills
        
        ОБРАБОТКА:
        1. Применяются базовые фильтры
        2. Анализируются навыки в резюме
        3. Рассчитывается процент совпадения
        4. Отклики сортируются по релевантности
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Отсортированные отклики с оценками совпадения
        
        СВЯЗИ: методы базового класса, analize_skills
        
        ФОРМАТ: Dict с filtered и scored responses
        """
        
        # Базовая фильтрация
        filtered, rejected = self.filter_responses(responses, filters or {})
        
        # Анализируем навыки
        scored_candidates = []
        
        for response in filtered:
            resume = response.get('resume', {})
            skills = resume.get('skills', [])
            skill_names = [s.get('name', '').lower() for s in skills]
            
            # Рассчитываем совпадение
            match_count = 0
            for req_skill in required_skills:
                for skill in skill_names:
                    if self._skills_match(req_skill, skill):
                        match_count += 1
            
            match_percentage = (match_count / len(required_skills)) * 100 if required_skills else 0
            
            scored_candidates.append({
                'response': response,
                'match_percentage': match_percentage,
                'matched_skills': match_count,
                'total_skills': len(skill_names)
            })
        
        # Сортируем по совпадению (в обратном порядке)
        scored_candidates.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return {
            'candidates': scored_candidates,
            'total': len(filtered),
            'average_match': sum(c['match_percentage'] for c in scored_candidates) / len(scored_candidates) if scored_candidates else 0,
            'rejected': rejected
        }
    
    def _skills_match(self, required: str, candidate: str) -> bool:
        """Проверяет совпадение навыков (с учетом синонимов)"""
        
        required = required.lower().strip()
        candidate = candidate.lower().strip()
        
        # Точное совпадение
        if required == candidate:
            return True
        
        # Синонимы
        synonyms = {
            'python': ['python3', 'python2', 'python'],
            'javascript': ['js', 'javascript', 'nodejs', 'node.js'],
            'react': ['react', 'reactjs', 'react.js'],
            'django': ['django', 'django rest', 'drf'],
            'sql': ['sql', 'postgresql', 'mysql', 'sqlite'],
            'rest api': ['rest', 'restful', 'api', 'rest api'],
        }
        
        for key, values in synonyms.items():
            if required in values and candidate in values:
                return True
        
        # Содержание (если требуемый навык частично совпадает)
        if len(required) > 3 and required in candidate:
            return True
        
        return False
    
    def filter_with_experience_matching(
        self,
        responses: List[Dict],
        required_experience: Dict,
        filters: Dict = None
    ) -> Dict:
        """
        Фильтрует отклики по соответствию опыта работы требуемым должностям
        
        ВХОДЯЩИЕ ДАННЫЕ:
        required_experience = {
            'positions': ['Менеджер по продажам', 'Sales Manager'],
            'industries': ['IT', 'Финансы'],
            'min_years': 2
        }
        
        ИСТОЧНИКИ ДАННЫХ: responses, required_experience
        
        ОБРАБОТКА:
        1. Анализируются должности в резюме
        2. Проверяется соответствие требуемым должностям
        3. Проверяются отрасли работы
        4. Отклики сортируются по релевантности опыта
        
        ВЫХОДЯЩИЕ ДАННЫЕ: Отклики с оценками релевантности опыта
        
        СВЯЗИ: методы базового класса, analyze_experience
        
        ФОРМАТ: Dict с scored responses
        """
        
        # Базовая фильтрация
        filtered, rejected = self.filter_responses(responses, filters or {})
        
        # Анализируем опыт
        scored_candidates = []
        
        for response in filtered:
            resume = response.get('resume', {})
            experience = resume.get('experience', [])
            
            # Рассчитываем соответствие опыта
            position_match_score = 0
            industry_match_score = 0
            
            for exp in experience:
                position = exp.get('position', '').lower()
                
                # Проверяем совпадение должностей
                for req_pos in required_experience.get('positions', []):
                    if self._positions_match(req_pos, position):
                        position_match_score += 1
            
            # Определяем стаж
            years_experience = self._calculate_experience(resume)
            
            # Проверяем минимальный стаж
            min_years = required_experience.get('min_years', 0)
            meets_min_years = years_experience >= min_years
            
            overall_score = position_match_score * 50 + (20 if meets_min_years else 0)
            
            scored_candidates.append({
                'response': response,
                'position_match': position_match_score,
                'years_experience': years_experience,
                'meets_requirements': meets_min_years,
                'overall_score': overall_score
            })
        
        # Сортируем по оценке
        scored_candidates.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return {
            'candidates': scored_candidates,
            'total': len(filtered),
            'meets_requirements': sum(1 for c in scored_candidates if c['meets_requirements']),
            'rejected': rejected
        }
    
    def _positions_match(self, required: str, candidate: str) -> bool:
        """Проверяет совпадение должностей"""
        
        required = required.lower().strip()
        candidate = candidate.lower().strip()
        
        # Точное совпадение
        if required == candidate:
            return True
        
        # Частичное совпадение
        if len(required) > 4:
            if required in candidate or candidate in required:
                return True
        
        # Синонимы должностей
        position_synonyms = {
            'менеджер по продажам': ['sales manager', 'менеджер продаж', 'менеджер по продажам'],
            'разработчик': ['developer', 'программист', 'разработчик', 'software engineer'],
            'дизайнер': ['designer', 'ui designer', 'ux designer', 'дизайнер'],
        }
        
        for key, values in position_synonyms.items():
            if required in values and candidate in values:
                return True
        
        return False
```

---

## Тестирование

### Unit тесты

```python
# tests/test_hh_integration.py

from django.test import TestCase
from apps.huntflow.hh_integration import HHResponsesHandler, HHResponsesFilter

class TestHHResponsesFilter(TestCase):
    """Тесты фильтров HH.ru откликов"""
    
    def setUp(self):
        self.filter = HHResponsesFilter()
    
    def test_location_filter(self):
        """Тест фильтрации по локации"""
        
        response = {
            'resume': {
                'area': {'id': '1', 'name': 'Москва'}
            }
        }
        
        filters = {
            'allowed_locations': ['1']
        }
        
        self.assertTrue(self.filter._check_location(response['resume'], filters))
    
    def test_age_filter(self):
        """Тест фильтрации по возрасту"""
        
        from datetime import datetime, timedelta
        
        birth_date = (datetime.now() - timedelta(days=30*365)).isoformat()
        
        response = {
            'resume': {
                'birth_date': birth_date
            }
        }
        
        filters = {
            'min_age': 18,
            'max_age': 65
        }
        
        self.assertTrue(self.filter._check_age(response['resume'], filters))
    
    def test_experience_filter(self):
        """Тест фильтрации по опыту работы"""
        
        response = {
            'resume': {
                'experience': [
                    {
                        'position': 'Менеджер',
                        'company': 'ООО Компания',
                        'start': '2020-01-01',
                        'end': '2024-12-01'
                    }
                ]
            }
        }
        
        filters = {
            'min_experience_years': 1,
            'max_experience_years': 50
        }
        
        self.assertTrue(self.filter._check_experience(response['resume'], filters))
```

---

## Мониторинг и логирование

```python
# apps/huntflow/monitoring.py

from django.db.models import Count
from apps.huntflow.models import HuntflowLog

class HHSyncMonitor:
    """Мониторинг синхронизации откликов из HH.ru"""
    
    @staticmethod
    def get_sync_statistics(user):
        """Получает статистику синхронизации"""
        
        logs = HuntflowLog.objects.filter(
            user=user,
            log_type__startswith='HH_'
        ).order_by('-created_at')
        
        total_logs = logs.count()
        success_count = logs.filter(status_code=200).count()
        error_count = logs.filter(status_code__gte=400).count()
        
        return {
            'total_syncs': total_logs,
            'successful': success_count,
            'failed': error_count,
            'success_rate': (success_count / total_logs * 100) if total_logs > 0 else 0,
            'last_sync': logs.first().created_at if logs.exists() else None
        }
    
    @staticmethod
    def get_sync_details(user, limit=10):
        """Получает детали последних синхронизаций"""
        
        logs = HuntflowLog.objects.filter(
            user=user,
            log_type__startswith='HH_'
        ).order_by('-created_at')[:limit]
        
        return [
            {
                'date': log.created_at,
                'type': log.log_type,
                'status': 'успешно' if log.status_code == 200 else 'ошибка',
                'details': log.response_data
            }
            for log in logs
        ]
```

---

## Заключение

Данные примеры показывают различные способы интеграции:

1. **Синхронизация по расписанию** - автоматические обновления каждый час
2. **Массовая обработка** - импорт откликов для нескольких вакансий
3. **Умные фильтры** - использование ML для лучшего соответствия
4. **Мониторинг** - отслеживание результатов синхронизации

Все компоненты легко расширяются и интегрируются в существующее решение.
