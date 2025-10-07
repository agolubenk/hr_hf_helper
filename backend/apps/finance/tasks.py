"""
Celery задачи для анализа данных с hh.ru
"""
import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Benchmark, BenchmarkSettings, Grade, BenchmarkType, HHVacancyTemp
# Импорт HHVacancyService временно отключен
# from .logic.services import HHVacancyService
from apps.vacancies.models import Vacancy
import time

logger = logging.getLogger('apps.finance')


def _is_valid_vacancy(vacancy_item: dict) -> bool:
    """
    Проверяет, соответствует ли вакансия нашим критериям
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - vacancy_item: словарь с данными вакансии из hh.ru API
    
    ИСТОЧНИКИ ДАННЫХ:
    - hh.ru API: данные вакансии (area, professional_roles, salary, name)
    
    ОБРАБОТКА:
    - Проверка локации (только Беларусь и Польша)
    - Исключение российских городов
    - Проверка профессиональных ролей (только IT)
    - Фильтрация по названию (исключение не-IT)
    - Проверка наличия зарплаты и минимальных порогов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - bool: True если вакансия подходит, False если нет
    
    СВЯЗИ:
    - Использует: hh.ru API данные
    - Передает: результат валидации в fetch_hh_vacancies_task
    - Может вызываться из: fetch_hh_vacancies_task
    """
    # Проверяем локацию
    area = vacancy_item.get('area', {})
    area_id = area.get('id')
    area_name = area.get('name', '').lower()
    
    # Только Беларусь и Польша (но города могут иметь свои ID)
    # Проверяем по названию области, так как города имеют свои ID
    if not any(country in area_name for country in ['беларусь', 'минск', 'гомель', 'могилев', 'витебск', 'гродно', 'брест', 'польша']):
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - неподходящая локация: {area_name} (ID: {area_id})")
        return False
    
    # Дополнительная проверка по названию области (исключаем Россию)
    russian_cities = ['москва', 'санкт-петербург', 'нижний новгород', 'екатеринбург', 'новосибирск', 'казань', 'челябинск', 'омск', 'самара', 'ростов-на-дону', 'уфа', 'красноярск', 'пермь', 'волгоград', 'воронеж', 'саратов', 'краснодар', 'тольятти', 'барнаул', 'ижевск', 'ульяновск', 'владивосток', 'ярославль', 'иркутск', 'тюмень', 'хабаровск', 'новокузнецк', 'оренбург', 'кемерово', 'рязань', 'томск', 'астрахань', 'пенза', 'липецк', 'тула', 'киров', 'чебоксары', 'калининград', 'брянск', 'курск', 'иваново', 'магнитогорск', 'тверь', 'ставрополь', 'белгород', 'архангельск', 'владимир', 'сочи', 'курган', 'смоленск', 'калуга', 'чита', 'орел', 'волжский', 'череповец', 'мурманск', 'сургут', 'вологда', 'владикавказ', 'саранск', 'тамбов', 'стерлитамак', 'грозный', 'якутск', 'кострома', 'комсомольск-на-амуре', 'петрозаводск', 'таганрог', 'нижневартовск', 'йошкар-ола', 'братск', 'новороссийск', 'шахты', 'дзержинск', 'орск', 'сыктывкар', 'ангарск', 'благовещенск', 'прокопьевск', 'бийск', 'псков', 'энгельс', 'рыбинск', 'балашиха', 'северодвинск', 'подольск', 'королев', 'сызрань', 'норильск', 'златоуст', 'каменск-уральский', 'мытищи', 'люберцы', 'волгодонск', 'новочеркасск', 'абакан', 'находка', 'уссурийск', 'березники', 'салават', 'электросталь', 'мичуринск', 'первоуральск', 'рубцовск', 'альметьевск', 'петропавловск-камчатский', 'лысьва', 'серпухов', 'чайковский', 'муром', 'ессентуки', 'новошахтинск', 'железногорск', 'зеленодольск', 'киселевск', 'новокуйбышевск', 'сергиев посад', 'армавир', 'балаково', 'северск', 'петропавловск', 'камышин', 'минеральные воды', 'кызыл', 'новотроицк', 'жуковский', 'елец', 'азов', 'бердск', 'элиста', 'новоалтайск', 'качканар', 'усть-илимск', 'серов', 'зеленогорск', 'соликамск', 'мелеуз', 'кирово-чепецк', 'кропоткин', 'новоуральск', 'железногорск', 'чистополь', 'первомайск', 'димитровград', 'красногорск', 'каспийск', 'губкин', 'каменск-шахтинский', 'наро-фоминск', 'кубань', 'егорьевск', 'батайск', 'копейск', 'железнодорожный', 'мурманск', 'пятигорск', 'коломна', 'реутов', 'керчь', 'североморск', 'каменск-уральский', 'ачинск', 'ессентуки', 'новошахтинск', 'железногорск', 'зеленодольск', 'киселевск', 'новокуйбышевск', 'сергиев посад', 'армавир', 'балаково', 'северск', 'петропавловск', 'камышин', 'минеральные воды', 'кызыл', 'новотроицк', 'жуковский', 'елец', 'азов', 'бердск', 'элиста', 'новоалтайск', 'качканар', 'усть-илимск', 'серов', 'зеленогорск', 'соликамск', 'мелеуз', 'кирово-чепецк', 'кропоткин', 'новоуральск', 'железногорск', 'чистополь', 'первомайск', 'димитровград', 'красногорск', 'каспийск', 'губкин', 'каменск-шахтинский', 'наро-фоминск', 'кубань', 'егорьевск', 'батайск', 'копейск', 'железнодорожный', 'мурманск', 'пятигорск', 'коломна', 'реутов', 'керчь', 'североморск', 'ачинск']
    
    if any(city in area_name for city in russian_cities):
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - российский город: {area_name}")
        return False
    
    # Проверяем специализацию (professional_roles)
    professional_roles = vacancy_item.get('professional_roles', [])
    if not professional_roles:
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - нет профессиональных ролей")
        return False
    
    # Разрешенные IT роли (по ID)
    allowed_role_ids = ['96', '34', '160', '73', '107', '112', '113', '121', '124']
    
    role_ids = [role.get('id') for role in professional_roles]
    if not any(role_id in allowed_role_ids for role_id in role_ids):
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - неподходящая роль ID: {role_ids}")
        return False
    
    # Дополнительная проверка по названию вакансии (исключаем явно не-IT)
    vacancy_name = vacancy_item.get('name', '').lower()
    excluded_keywords = [
        'бухгалтер', 'кассир', 'продавец', 'менеджер по продажам',
        'водитель', 'грузчик', 'уборщик', 'охранник', 'секретарь',
        'оператор', 'консультант', 'администратор ресепшн'
    ]
    
    if any(keyword in vacancy_name for keyword in excluded_keywords):
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - не-IT название: {vacancy_name}")
        return False
    
    # Проверяем наличие зарплаты
    salary = vacancy_item.get('salary')
    if not salary or (not salary.get('from') and not salary.get('to')):
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - отсутствует информация о зарплате")
        return False
    
    # Проверяем минимальные пороги зарплат
    salary_from = salary.get('from')
    salary_to = salary.get('to')
    min_salary = salary_from or salary_to
    currency = salary.get('currency', '')
    
    # Минимальные пороги по валютам (чтобы исключить стажировки и низкооплачиваемые позиции)
    min_thresholds = {
        'USD': 500,   # Минимум $500
        'EUR': 450,   # Минимум €450
        'PLN': 3000,  # Минимум 3000 PLN
        'BYN': 1500,  # Минимум 1500 BYN
        'RUB': 50000, # Минимум 50000 RUB
    }
    
    threshold = min_thresholds.get(currency, 0)
    if threshold and min_salary < threshold:
        logger.debug(f"Пропускаем вакансию {vacancy_item.get('id')} - зарплата {min_salary} {currency} ниже порога {threshold}")
        return False
    
    return True


def _should_fetch_vacancies() -> bool:
    """
    Определяет, нужно ли собирать вакансии на основе умной логики
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - Нет параметров (использует глобальные данные)
    
    ИСТОЧНИКИ ДАННЫХ:
    - HHVacancyTemp.objects: необработанные вакансии
    - HHVacancyTemp.objects: последние сборы вакансий
    
    ОБРАБОТКА:
    - Проверка наличия необработанных вакансий
    - Анализ времени последнего сбора
    - Проверка результативности последнего сбора
    - Применение умной логики (20 минут интервал)
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - bool: True если нужно собирать, False если пропустить
    
    СВЯЗИ:
    - Использует: HHVacancyTemp.objects
    - Передает: результат в fetch_hh_vacancies_task
    - Может вызываться из: fetch_hh_vacancies_task
    """
    from datetime import datetime, timedelta
    
    # Проверяем, есть ли необработанные вакансии
    unprocessed_count = HHVacancyTemp.objects.filter(processed=False).count()
    if unprocessed_count > 0:
        logger.info(f"Пропускаем сбор - есть {unprocessed_count} необработанных вакансий")
        return False
    
    # Проверяем последний сбор вакансий
    last_fetch = HHVacancyTemp.objects.filter(
        created_at__gte=datetime.now() - timedelta(hours=2)  # Последние 2 часа
    ).order_by('-created_at').first()
    
    if not last_fetch:
        # Если не было сборов за последние 2 часа - собираем
        logger.info("Нет данных о последнем сборе - начинаем сбор")
        return True
    
    time_since_last_fetch = datetime.now() - last_fetch.created_at.replace(tzinfo=None)
    
    # Если прошло меньше 20 минут - проверяем результат последнего сбора
    if time_since_last_fetch < timedelta(minutes=20):
        # Считаем количество вакансий, собранных в последний раз
        last_fetch_time = last_fetch.created_at
        next_fetch_time = last_fetch_time + timedelta(minutes=5)  # +5 минут для погрешности
        
        last_batch_count = HHVacancyTemp.objects.filter(
            created_at__gte=last_fetch_time,
            created_at__lt=next_fetch_time
        ).count()
        
        if last_batch_count == 0:
            logger.info(f"Последний сбор был {time_since_last_fetch} назад и принес 0 вакансий - пропускаем")
            return False
        else:
            logger.info(f"Последний сбор был {time_since_last_fetch} назад и принес {last_batch_count} вакансий - собираем")
            return True
    else:
        # Прошло больше 20 минут - собираем
        logger.info(f"Прошло {time_since_last_fetch} с последнего сбора - собираем")
        return True


@shared_task(bind=True, max_retries=3)
def analyze_hh_vacancies_automatic(self):
    """
    Автоматический анализ вакансий с hh.ru используя фиксированные конфигурации
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - self: Celery task объект для retry логики
    
    ИСТОЧНИКИ ДАННЫХ:
    - Временно отключена (возвращает сообщение об отключении)
    
    ОБРАБОТКА:
    - Проверка статуса задачи (временно отключена)
    - Логирование информации о статусе
    - Обработка ошибок с retry механизмом
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с результатами анализа (временно отключена)
    
    СВЯЗИ:
    - Использует: Celery shared_task декоратор
    - Передает: результат выполнения задачи
    - Может вызываться из: Celery worker, cron jobs
    """
    try:
        logger.info("Задача analyze_hh_vacancies_automatic временно отключена")
        logger.info("Используйте fetch_hh_vacancies_task для сбора вакансий")
        
        return {
            'success': True,
            'message': 'Задача временно отключена',
            'created_benchmarks': 0,
            'total_vacancies': 0,
            'search_config': 'отключено'
        }
        
    except Exception as e:
        error_msg = f"Ошибка при автоматическом анализе: {e}"
        logger.error(error_msg)
        
        # Повторяем задачу при ошибке
        if self.request.retries < self.max_retries:
            logger.info(f"Повторяем задачу (попытка {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(countdown=60 * (2 ** self.request.retries))  # Экспоненциальная задержка
        
        return {'success': False, 'message': error_msg}


@shared_task(bind=True, max_retries=3)
def analyze_hh_vacancies_batch(self, vacancy_grade_pairs: list, search_queries: dict = None):
    """
    Массовый анализ вакансий с hh.ru
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - self: Celery task объект для retry логики
    - vacancy_grade_pairs: список кортежей (vacancy_id, grade_id)
    - search_queries: словарь с поисковыми запросами {vacancy_id: query}
    
    ИСТОЧНИКИ ДАННЫХ:
    - vacancy_grade_pairs: пары вакансия-грейд для анализа
    - search_queries: поисковые запросы для каждой вакансии
    
    ОБРАБОТКА:
    - Обработка каждой пары вакансия-грейд
    - Запуск анализа для каждой пары
    - Сбор статистики по всем анализам
    - Обработка ошибок с retry механизмом
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с результатами массового анализа
    
    СВЯЗИ:
    - Использует: Celery shared_task декоратор
    - Передает: результат выполнения задачи
    - Может вызываться из: Celery worker, cron jobs
    """
    try:
        logger.info(f"Начинаем массовый анализ hh.ru для {len(vacancy_grade_pairs)} пар вакансия-грейд")
        
        results = []
        total_created = 0
        total_processed = 0
        
        for vacancy_id, grade_id in vacancy_grade_pairs:
            try:
                # Получаем поисковый запрос для этой вакансии
                search_query = search_queries.get(vacancy_id) if search_queries else None
                
                # Запускаем анализ для пары вакансия-грейд (старая логика отключена)
                logger.warning("Старая логика анализа отключена. Используйте автоматический анализ.")
                continue
                
                results.append({
                    'vacancy_id': vacancy_id,
                    'grade_id': grade_id,
                    'result': task_result
                })
                
                if task_result.get('success'):
                    total_created += task_result.get('created_benchmarks', 0)
                    total_processed += task_result.get('total_vacancies', 0)
                
            except Exception as e:
                logger.error(f"Ошибка при обработке пары {vacancy_id}-{grade_id}: {e}")
                results.append({
                    'vacancy_id': vacancy_id,
                    'grade_id': grade_id,
                    'result': {'success': False, 'message': str(e)}
                })
        
        summary = f"Массовый анализ завершен: обработано {total_processed} вакансий, создано {total_created} бенчмарков"
        logger.info(summary)
        
        return {
            'success': True,
            'message': summary,
            'total_created': total_created,
            'total_processed': total_processed,
            'results': results
        }
        
    except Exception as e:
        error_msg = f"Ошибка при массовом анализе hh.ru: {str(e)}"
        logger.error(error_msg)
        
        # Повторяем задачу при ошибке
        if self.request.retries < self.max_retries:
            logger.info(f"Повторяем массовую задачу (попытка {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        return {'success': False, 'message': error_msg}


@shared_task
def cleanup_old_benchmarks():
    """
    Очистка старых бенчмарков (старше определенного периода)
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - Нет параметров (использует настройки)
    
    ИСТОЧНИКИ ДАННЫХ:
    - BenchmarkSettings.load(): настройки периода хранения
    - Benchmark.objects: старые неактивные бенчмарки
    
    ОБРАБОТКА:
    - Получение настроек периода хранения
    - Вычисление даты отсечения (удвоенный период)
    - Поиск старых неактивных бенчмарков
    - Удаление найденных записей
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с результатами очистки
    
    СВЯЗИ:
    - Использует: BenchmarkSettings, Benchmark.objects
    - Передает: результат выполнения задачи
    - Может вызываться из: Celery worker, cron jobs
    """
    try:
        settings = BenchmarkSettings.load()
        cutoff_date = timezone.now() - timedelta(days=settings.average_calculation_period_days * 2)
        
        old_benchmarks = Benchmark.objects.filter(
            date_added__lt=cutoff_date,
            is_active=False
        )
        
        count = old_benchmarks.count()
        old_benchmarks.delete()
        
        logger.info(f"Удалено {count} старых бенчмарков")
        
        return {
            'success': True,
            'message': f"Удалено {count} старых бенчмарков",
            'deleted_count': count
        }
        
    except Exception as e:
        error_msg = f"Ошибка при очистке старых бенчмарков: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'message': error_msg}


@shared_task
def generate_benchmark_statistics():
    """
    Генерация статистики по бенчмаркам
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - Нет параметров (использует все активные бенчмарки)
    
    ИСТОЧНИКИ ДАННЫХ:
    - Benchmark.objects: все активные бенчмарки
    - Django ORM агрегации: Avg, Count, Min, Max
    
    ОБРАБОТКА:
    - Статистика по типам бенчмарков
    - Статистика по грейдам
    - Статистика по локациям
    - Подсчет общего количества бенчмарков
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с детальной статистикой по бенчмаркам
    
    СВЯЗИ:
    - Использует: Benchmark.objects, Django ORM агрегации
    - Передает: результат выполнения задачи
    - Может вызываться из: Celery worker, cron jobs
    """
    try:
        from django.db.models import Avg, Count, Min, Max
        
        # Статистика по типам бенчмарков
        type_stats = Benchmark.objects.filter(is_active=True).values('type').annotate(
            count=Count('id'),
            avg_salary_from=Avg('salary_from'),
            avg_salary_to=Avg('salary_to'),
            min_salary_from=Min('salary_from'),
            max_salary_to=Max('salary_to')
        )
        
        # Статистика по грейдам
        grade_stats = Benchmark.objects.filter(is_active=True).select_related('grade').values(
            'grade__name'
        ).annotate(
            count=Count('id'),
            avg_salary_from=Avg('salary_from'),
            avg_salary_to=Avg('salary_to')
        )
        
        # Статистика по локациям
        location_stats = Benchmark.objects.filter(is_active=True).values('location').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        statistics = {
            'type_stats': list(type_stats),
            'grade_stats': list(grade_stats),
            'location_stats': list(location_stats),
            'total_benchmarks': Benchmark.objects.filter(is_active=True).count(),
            'generated_at': timezone.now().isoformat()
        }
        
        logger.info(f"Сгенерирована статистика по {statistics['total_benchmarks']} бенчмаркам")
        
        return {
            'success': True,
            'message': 'Статистика успешно сгенерирована',
            'statistics': statistics
        }
        
    except Exception as e:
        error_msg = f"Ошибка при генерации статистики: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'message': error_msg}


@shared_task(bind=True, max_retries=3)
def fetch_hh_vacancies_task(self):
    """Временно отключена из-за отсутствия HHVacancyService"""
    return {"success": False, "message": "Задача временно отключена"}
    
def _fetch_hh_vacancies_task_disabled(self):
    """
    Задача сбора вакансий с hh.ru с умной логикой
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - self: Celery task объект для retry логики
    
    ИСТОЧНИКИ ДАННЫХ:
    - hh.ru API через HHVacancyService
    - BenchmarkSettings для конфигурации
    - HH_PROFESSIONAL_ROLES, HH_LOCATIONS, ALL_KEYWORDS константы
    
    ОБРАБОТКА:
    - Проверка активности канала hh.ru
    - Умная логика определения необходимости сбора
    - Поиск по ключевым словам, локациям и ролям
    - Фильтрация и дедупликация вакансий
    - Сохранение в HHVacancyTemp
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с результатами сбора и количеством найденных вакансий
    
    СВЯЗИ:
    - Использует: HHVacancyService, BenchmarkSettings, HHVacancyTemp
    - Передает: результат сбора в Celery
    - Может вызываться из: Celery worker, cron jobs
    """
    try:
        from .management.commands.hh_search_constants import HH_PROFESSIONAL_ROLES, HH_LOCATIONS, ALL_KEYWORDS
        from datetime import datetime, timedelta
        
        settings = BenchmarkSettings.load()
        if not settings.hh_channel_active:
            logger.info("Канал hh.ru отключен")
            return {"success": False, "message": "Канал hh.ru отключен"}
        
        # Проверяем, нужно ли собирать вакансии
        if not _should_fetch_vacancies():
            logger.info("Пропускаем сбор вакансий - очередь еще не обработана или недавно собирали")
            return {"success": True, "message": "Сбор пропущен по умной логике", "fetched": 0}
        
        # hh_service = HHVacancyService()  # Временно отключено
        total_fetched = 0
        
        # Получаем все профессиональные роли и локации
        all_professional_role_ids = list(HH_PROFESSIONAL_ROLES.values())
        all_location_codes = list(HH_LOCATIONS.values())
        
        logger.info(f"🎯 Будем искать по {len(ALL_KEYWORDS)} ключевым словам")
        logger.info(f"📍 Профессиональные роли: {len(all_professional_role_ids)}, Локации: {len(all_location_codes)}")
        
        # Проходим по каждому ключевому слову
        for keyword in ALL_KEYWORDS:
            logger.info(f"🔍 Ищем по ключевому слову: '{keyword}'")
            
            # Проходим по каждой локации отдельно (API не поддерживает комбинации)
            for location_code in all_location_codes:
                location_name = next((name for name, code in HH_LOCATIONS.items() if code == location_code), location_code)
                logger.info(f"  📍 Локация: {location_name} ({location_code})")
                
                # Проходим по каждой профессиональной роли отдельно (API не поддерживает комбинации)
                for role_id in all_professional_role_ids:
                    role_name = next((name for name, code in HH_PROFESSIONAL_ROLES.items() if code == role_id), role_id)
                    logger.info(f"    👤 Роль: {role_name} ({role_id})")
                    
                    # Параметры поиска для одной локации и одной роли
                    params = {
                        "text": keyword,
                        "area": location_code,
                        "professional_role": role_id,
                        "per_page": "100"
                    }
                
                    result = hh_service.fetch_vacancies(params)
                    
                    role_fetched = 0
                    for item in result.get('items', []):
                        hh_id = item.get('id')
                        
                        # Дедупликация - пропускаем если уже есть
                        if HHVacancyTemp.objects.filter(hh_id=hh_id).exists():
                            continue
                        
                        # Дополнительная фильтрация на нашей стороне
                        if not _is_valid_vacancy(item):
                            continue
                        
                        # Сохраняем временную запись
                        HHVacancyTemp.objects.create(
                            hh_id=hh_id,
                            raw_data=item,
                            processed=False
                        )
                        role_fetched += 1
                        total_fetched += 1
                    
                    logger.info(f"      ✅ Найдено {role_fetched} новых вакансий для '{keyword}' в {location_name} ({role_name})")
                    
                # Рандомная пауза между запросами к hh.ru (12-37 секунд)
                import random
                delay = random.uniform(12, 37)
                time.sleep(delay)
        
        logger.info(f"Собрано {total_fetched} новых вакансий с hh.ru")
        
        # Сохраняем информацию о результате сбора для умной логики
        if total_fetched > 0:
            logger.info(f"✅ Успешно собрано {total_fetched} вакансий - запускаем обработку")
            # Запускаем обработку с лимитом
            process_hh_queue_with_limit.delay()
        else:
            logger.info("ℹ️ Новых вакансий не найдено - очередь обработки не запускаем")
        
        return {"success": True, "fetched": total_fetched, "message": f"Собрано {total_fetched} вакансий"}
        
    except Exception as e:
        logger.error(f"Ошибка при сборе вакансий hh.ru: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        return {"success": False, "message": str(e)}


@shared_task
def process_hh_queue_with_limit():
    """
    Обработка очереди hh.ru с лимитом задач в сутки
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - Нет параметров (использует настройки и очередь)
    
    ИСТОЧНИКИ ДАННЫЕ:
    - BenchmarkSettings.load(): максимальное количество задач в день
    - HHVacancyTemp.objects: необработанные вакансии
    
    ОБРАБОТКА:
    - Проверка дневного лимита задач
    - Получение необработанных вакансий в рамках лимита
    - Предобработка данных через HHVacancyService
    - Отправка на AI анализ
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с количеством обработанных вакансий
    
    СВЯЗИ:
    - Использует: BenchmarkSettings, HHVacancyTemp, HHVacancyService
    - Передает: вакансии на AI анализ
    - Может вызываться из: fetch_hh_vacancies_task
    """
    from datetime import date
    
    settings = BenchmarkSettings.load()
    max_tasks = settings.max_daily_hh_tasks
    
    today = date.today()
    processed_today = HHVacancyTemp.objects.filter(
        created_at__date=today,
        processed=True
    ).count()
    
    remaining = max_tasks - processed_today
    if remaining <= 0:
        logger.info("Достигнут дневной лимит задач hh.ru")
        return {"message": "Лимит достигнут"}
    
    # Берем необработанные записи
    unprocessed = HHVacancyTemp.objects.filter(
        processed=False
    ).order_by('created_at')[:remaining]
    
    hh_service = HHVacancyService()
    processed_count = 0
    
    for temp_record in unprocessed:
        try:
            # Предобработка данных
            preprocessed = hh_service.preprocess_salary(temp_record.raw_data)
            vacancy_text = hh_service.format_for_ai_analysis_with_vacancies(
                temp_record.raw_data
            )
            
            # Отправляем в AI анализ (синхронно)
            analyze_hh_vacancy_with_ai({
                'hh_id': temp_record.hh_id,
                'vacancy_text': vacancy_text,
                'preprocessed_salary': preprocessed,
                'raw_data': temp_record.raw_data
            })
            
            # НЕ помечаем как обработанную здесь - это сделает save_hh_analysis_result после успешного AI анализа
            processed_count += 1
            
        except Exception as e:
            logger.error(f"Ошибка при обработке вакансии {temp_record.hh_id}: {e}")
            continue
    
    logger.info(f"Отправлено {processed_count} вакансий на AI анализ")
    return {"processed": processed_count}


@shared_task
def analyze_hh_vacancy_with_ai(vacancy_data: dict):
    """
    AI анализ вакансии с hh.ru
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - vacancy_data: словарь с данными вакансии (hh_id, vacancy_text, preprocessed_salary, raw_data)
    
    ИСТОЧНИКИ ДАННЫЕ:
    - vacancy_data: данные вакансии для анализа
    - User.objects: пользователи с Gemini API ключами
    - GeminiService: сервис для работы с Gemini API
    
    ОБРАБОТКА:
    - Рандомная задержка для соблюдения лимитов API
    - Получение списка вакансий и грейдов для унификации
    - Создание улучшенного промпта
    - Отправка запроса в Gemini API
    - Парсинг JSON ответа
    - Сохранение результата через save_hh_analysis_result
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Нет прямого возврата (сохраняет результат в БД)
    
    СВЯЗИ:
    - Использует: GeminiService, User.objects, Grade.objects
    - Передает: результат в save_hh_analysis_result
    - Может вызываться из: process_hh_queue_with_limit
    """
    try:
        import json
        import time
        
        # Рандомная задержка для соблюдения лимитов Gemini API (13-48 секунд)
        import random
        delay = random.uniform(13, 48)
        time.sleep(delay)
        
        settings = BenchmarkSettings.load()
        
        # Получаем список наших вакансий для унификации
        # hh_service = HHVacancyService()  # Временно отключено
        our_vacancies_list = hh_service.get_our_vacancies_list()
        our_vacancies_text = "\n".join([f"- {vacancy}" for vacancy in our_vacancies_list])
        
        # Получаем список наших грейдов для унификации
        from .models import Grade
        our_grades_list = list(Grade.objects.values_list('name', flat=True))
        our_grades_text = "\n".join([f"- {grade}" for grade in our_grades_list])
        
        # Получаем улучшенный промпт
        prompt = get_enhanced_ai_prompt(
            vacancy_data['vacancy_text'], 
            our_vacancies_text, 
            our_grades_text
        )
        
        # Получаем API ключ из профиля пользователя
        # Используем пользователя andrei.golubenko (ID: 3) с новым API ключом
        from django.contrib.auth import get_user_model
        User = get_user_model()
        default_user = User.objects.filter(id=3, gemini_api_key__isnull=False).first()
        
        # Если пользователь ID: 3 не найден, берем первого доступного
        if not default_user:
            default_user = User.objects.filter(gemini_api_key__isnull=False).first()
        
        if not default_user or not default_user.gemini_api_key:
            logger.error("API ключ Gemini не настроен ни у одного пользователя")
            return
        
        api_key = default_user.gemini_api_key
        
        # Создаем сервис Gemini
        from apps.gemini.logic.services import GeminiService
        gemini_service = GeminiService(api_key)
        
        # Отправляем запрос в Gemini
        success, response, metadata = gemini_service.generate_content(prompt)
        
        if success:
            try:
                # Извлекаем JSON из markdown блока, если он есть
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    json_text = json_match.group(1)
                else:
                    json_text = response
                
                # Парсим JSON ответ
                ai_response = json.loads(json_text)
                logger.info(f"✅ JSON успешно распарсен для вакансии {vacancy_data['hh_id']}")
                logger.info(f"📋 Structured benchmarks: {len(ai_response.get('structured_benchmarks', []))}")
            except json.JSONDecodeError as e:
                logger.error(f"Ошибка парсинга JSON ответа Gemini: {e}")
                logger.error(f"Ответ: {response}")
                return
        else:
            logger.error(f"Ошибка Gemini API: {response}")
            return
        
        # Сохраняем результат в Benchmark
        logger.info(f"🚀 Сохраняем результат для вакансии {vacancy_data['hh_id']}")
        save_hh_analysis_result(ai_response, vacancy_data)
        
        logger.info(f"AI анализ завершен для вакансии {vacancy_data['hh_id']}")
        
    except Exception as e:
        logger.error(f"Ошибка AI анализа для {vacancy_data.get('hh_id')}: {e}")




def _find_best_vacancy_match(ai_vacancy_name: str):
    """
    Находит лучшее соответствие вакансии из наших данных
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - ai_vacancy_name: строка с названием вакансии от AI
    
    ИСТОЧНИКИ ДАННЫЕ:
    - Vacancy.objects: все активные вакансии из базы данных
    
    ОБРАБОТКА:
    - Точное совпадение по названию
    - Умное сопоставление по сходству (SequenceMatcher)
    - Дополнительная проверка по ключевым словам
    - Комбинированный скор схожести
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Vacancy объект или None если соответствие не найдено
    
    СВЯЗИ:
    - Использует: Vacancy.objects, SequenceMatcher
    - Передает: найденную вакансию в save_hh_analysis_result
    - Может вызываться из: save_hh_analysis_result
    """
    from apps.vacancies.models import Vacancy
    from difflib import SequenceMatcher
    
    if not ai_vacancy_name or ai_vacancy_name.strip() == '':
        return None
    
    # Сначала точное совпадение
    exact_match = Vacancy.objects.filter(name__iexact=ai_vacancy_name.strip()).first()
    if exact_match:
        logger.info(f"🎯 Точное совпадение найдено: {exact_match.name}")
        return exact_match
    
    # Умное сопоставление по сходству
    all_vacancies = Vacancy.objects.filter(is_active=True).values_list('id', 'name')
    best_match = None
    best_score = 0.7  # Минимальный порог схожести
    
    ai_name_lower = ai_vacancy_name.lower().strip()
    
    for vacancy_id, vacancy_name in all_vacancies:
        # Рассчитываем схожесть строк
        similarity = SequenceMatcher(None, ai_name_lower, vacancy_name.lower()).ratio()
        
        # Дополнительные проверки по ключевым словам
        ai_words = set(ai_name_lower.split())
        vacancy_words = set(vacancy_name.lower().split())
        word_overlap = len(ai_words.intersection(vacancy_words)) / len(ai_words.union(vacancy_words))
        
        # Комбинированный скор
        combined_score = (similarity * 0.7) + (word_overlap * 0.3)
        
        if combined_score > best_score:
            best_score = combined_score
            best_match = vacancy_id
    
    if best_match:
        matched_vacancy = Vacancy.objects.get(id=best_match)
        logger.info(f"🎯 Найдено лучшее соответствие: '{ai_vacancy_name}' -> '{matched_vacancy.name}' (score: {best_score:.2f})")
        return matched_vacancy
    
    logger.warning(f"❌ Соответствие не найдено для: '{ai_vacancy_name}'")
    return None


def _find_best_grade_match(ai_grade_name: str):
    """
    Находит лучшее соответствие грейда из наших данных
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - ai_grade_name: строка с названием грейда от AI
    
    ИСТОЧНИКИ ДАННЫЕ:
    - Grade.objects: все грейды из базы данных
    - grade_mapping: словарь с синонимами грейдов
    
    ОБРАБОТКА:
    - Точное совпадение по названию
    - Нормализация грейдов через синонимы
    - Поиск по маппингу синонимов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Grade объект или None если соответствие не найдено
    
    СВЯЗИ:
    - Использует: Grade.objects, grade_mapping
    - Передает: найденный грейд в save_hh_analysis_result
    - Может вызываться из: save_hh_analysis_result
    """
    from .models import Grade
    from difflib import SequenceMatcher
    
    if not ai_grade_name or ai_grade_name.strip() == '':
        return None
    
    # Сначала точное совпадение
    exact_match = Grade.objects.filter(name__iexact=ai_grade_name.strip()).first()
    if exact_match:
        logger.info(f"🎯 Точный грейд найден: {exact_match.name}")
        return exact_match
    
    # Нормализация грейдов (маппинг синонимов)
    grade_mapping = {
        'junior': ['Junior', 'junior', 'jun', 'младший'],
        'junior+': ['Junior+', 'junior+', 'jun+'],
        'middle': ['Middle', 'middle', 'mid', 'средний'],
        'middle+': ['Middle+', 'middle+', 'mid+'],
        'senior': ['Senior', 'senior', 'sen', 'старший', 'ведущий'],
        'senior+': ['Senior+', 'senior+', 'sen+'],
        'lead': ['Lead', 'lead', 'лид', 'тимлид', 'руководитель'],
        'head': ['Head', 'head', 'начальник', 'заведующий']
    }
    
    ai_name_lower = ai_grade_name.lower().strip()
    
    # Поиск по синонимам
    for canonical_grade, synonyms in grade_mapping.items():
        if ai_name_lower in [s.lower() for s in synonyms]:
            # Находим соответствующий грейд в БД
            for synonym in synonyms:
                grade = Grade.objects.filter(name__iexact=synonym).first()
                if grade:
                    logger.info(f"🎯 Найден грейд через синоним: '{ai_grade_name}' -> '{grade.name}'")
                    return grade
    
    logger.warning(f"❌ Грейд не найден: '{ai_grade_name}'")
    return None


def get_enhanced_ai_prompt(benchmark_data, our_vacancies_text, our_grades_text):
    """
    Возвращает улучшенный промпт для ИИ анализа
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - benchmark_data: данные вакансии для анализа
    - our_vacancies_text: список наших вакансий
    - our_grades_text: список наших грейдов
    
    ИСТОЧНИКИ ДАННЫЕ:
    - benchmark_data: обработанные данные вакансии
    - our_vacancies_text: вакансии из нашей базы
    - our_grades_text: грейды из нашей базы
    
    ОБРАБОТКА:
    - Формирование структурированного промпта для AI
    - Добавление правил сопоставления вакансий и грейдов
    - Указание формата ответа (JSON)
    - Добавление критических требований
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Строка с полным промптом для AI анализа
    
    СВЯЗИ:
    - Использует: входные данные для формирования промпта
    - Передает: промпт в analyze_hh_vacancy_with_ai
    - Может вызываться из: analyze_hh_vacancy_with_ai
    """
    return f"""Ты - эксперт по анализу рынка труда и зарплат в IT-сфере. Проанализируй предоставленную ВАКАНСИЮ и верни структурированные данные.

⚠️ КРИТИЧЕСКИ ВАЖНО: 
- В поле vacancy_name используй ТОЛЬКО названия из списка наших вакансий ИЛИ "skip"
- В поле grade используй ТОЛЬКО названия из списка наших грейдов ИЛИ "skip"
- ЗАПРЕЩЕНО создавать новые названия вакансий и грейдов!

ДАННЫЕ ВАКАНСИИ (уже с обработанной зарплатой в USD):
{benchmark_data}

НАШИ ВАКАНСИИ ДЛЯ СОПОСТАВЛЕНИЯ (используй ТОЛЬКО эти):
{our_vacancies_text}

НАШИ ГРЕЙДЫ ДЛЯ СОПОСТАВЛЕНИЯ (используй ТОЛЬКО эти):
{our_grades_text}

ЗАДАЧИ:
1. Проанализируй ОДНУ вакансию из данных
2. Сопоставь с НАШИМИ вакансиями по технологиям и обязанностям
3. Сопоставь с НАШИМИ грейдами по требованиям к опыту
4. Извлеки дополнительную информацию

ПРАВИЛА СОПОСТАВЛЕНИЯ ВАКАНСИЙ:
- Backend Engineer (Java) ← только если в стеке есть Java/Spring/Kotlin
- Frontend Engineer (React) ← только если в стеке есть React/JavaScript/TypeScript
- QA Engineer ← только тестировщики, QA, автотестирование
- DevOps Engineer ← только DevOps, SRE, инфраструктура, Docker, Kubernetes
- Project Manager ← только PM, управление проектами
- System Administrator ← только администрирование систем
- UX/UI Designer ← только дизайнеры интерфейсов
- Support Engineer ← только техподдержка

ПРАВИЛА СОПОСТАВЛЕНИЯ ГРЕЙДОВ:
- Junior ← 0-2 года опыта, базовые требования
- Junior+ ← 1-3 года опыта, расширенные базовые требования  
- Middle ← 2-4 года опыта, самостоятельная работа
- Middle+ ← 3-5 лет опыта, ментoring, архитектурные решения
- Senior ← 4+ лет опыта, экспертиза, техлидство
- Senior+ ← 6+ лет опыта, высокая экспертиза
- Lead ← управление командой, техническое лидерство
- Head ← управление департаментом, стратегические решения

ФОРМАТ ОТВЕТА (строго JSON):
{{
    "analysis_metadata": {{
        "analysis_date": "2025-01-22 15:30:00",
        "total_processed": 1,
        "data_source": "hh.ru"
    }},
    "structured_benchmarks": [
        {{
            "type": "vacancy",
            "vacancy_id": "ID_из_поля_ID_вакансии",
            "vacancy_name": "ТОЧНОЕ_название_из_списка_наших_вакансий_ИЛИ_skip",
            "grade": "ТОЧНОЕ_название_из_списка_наших_грейдов_ИЛИ_skip", 
            "salary_from": число_в_USD_уже_обработано,
            "salary_to": число_в_USD_уже_обработано,
            "location": "город, страна",
            "work_format": "remote/office/hybrid/all world",
            "compensation": "дополнительные компенсации",
            "benefits": "социальные льготы", 
            "development": "обучение и развитие",
            "technologies": "технологии через запятую",
            "domain": "один_домен_из_списка",
            "notes": "краткие заметки",
            "skip_reason": "причина_пропуска_если_vacancy_name_или_grade=skip"
        }}
    ]
}}

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
- Если вакансия НЕ соответствует НАШИМ по технологиям → vacancy_name = "skip"
- Если грейд неопределим → grade = "skip"  
- Зарплаты уже обработаны в USD - используй как есть
- domain только из списка: retail/fintech/gaming/gambling/betting/medtech/telecom/edtech/agritech/proptech/legaltech/govtech/logistics/foodtech/insurtech/martech/adtech/cybersecurity/cleantech/hrtech/traveltech/sporttech/entertainment/ecommerce/blockchain/aiml/iot/cloud
- При skip обязательно заполни skip_reason

Отвечай ТОЛЬКО JSON, без дополнительных комментариев."""
@shared_task
def update_currency_rates():
    """
    Периодическая задача для обновления курсов валют НБРБ
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - Нет параметров (использует глобальный сервис валют)
    
    ИСТОЧНИКИ ДАННЫЕ:
    - НБРБ API через UnifiedCurrencyService
    - CurrencyRate модель для сохранения
    
    ОБРАБОТКА:
    - Тестирование подключения к НБРБ API
    - Получение актуальных курсов валют
    - Обновление записей в базе данных
    - Логирование результатов
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Словарь с результатами обновления курсов
    
    СВЯЗИ:
    - Использует: UnifiedCurrencyService, CurrencyRate модель
    - Передает: результат выполнения задачи
    - Может вызываться из: Celery Beat (11:00 и 16:00 в будние дни)
    """
    try:
        from logic.base.currency_service import currency_service
        
        logger.info("🔄 Запуск автоматического обновления курсов валют НБРБ...")
        
        # Тестируем подключение к API
        logger.info("🔍 Проверяем подключение к НБРБ API...")
        test_response = currency_service.test_connection()
        
        if not test_response.success:
            error_msg = f"❌ Ошибка подключения к НБРБ API: {test_response.error}"
            logger.error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'updated_count': 0
            }
        
        logger.info("✅ Подключение к НБРБ API успешно")
        
        # Обновляем курсы в базе данных
        logger.info("💱 Обновляем курсы валют в базе данных...")
        result = currency_service.update_currency_rates_in_db()
        
        if result['updated_count'] > 0:
            success_msg = f"✅ Успешно обновлено {result['updated_count']} курсов валют"
            logger.info(success_msg)
            
            # Логируем детали по каждой валюте
            for currency, data in result['results'].items():
                if data['success']:
                    status = "создан" if data['created'] else "обновлен"
                    logger.info(f"  💰 {currency}: {data['rate']} BYN ({status})")
                else:
                    logger.warning(f"  ⚠️ {currency}: ошибка - {data['error']}")
            
            return {
                'success': True,
                'message': success_msg,
                'updated_count': result['updated_count'],
                'results': result['results']
            }
        else:
            warning_msg = "⚠️ Курсы валют не были обновлены"
            logger.warning(warning_msg)
            return {
                'success': True,
                'message': warning_msg,
                'updated_count': 0
            }
            
    except Exception as e:
        error_msg = f"❌ Ошибка при обновлении курсов валют: {e}"
        logger.error(error_msg)
        return {
            'success': False,
            'message': error_msg,
            'updated_count': 0
        }


@shared_task
def save_hh_analysis_result(ai_response: dict, vacancy_data: dict):
    """
    Сохраняет результат AI анализа в Benchmark с умным сопоставлением
    
    ВХОДЯЩИЕ ДАННЫЕ:
    - ai_response: словарь с ответом AI анализа
    - vacancy_data: словарь с данными вакансии
    
    ИСТОЧНИКИ ДАННЫЕ:
    - ai_response: структурированные данные от AI
    - vacancy_data: исходные данные вакансии
    - Benchmark, HHVacancyTemp, BenchmarkType, Grade, Domain модели
    
    ОБРАБОТКА:
    - Извлечение structured_benchmarks из AI ответа
    - Умное сопоставление вакансий и грейдов
    - Проверка валидности данных
    - Создание Benchmark записей
    - Помечание временной вакансии как обработанной
    
    ВЫХОДЯЩИЕ ДАННЫЕ:
    - Нет прямого возврата (сохраняет в БД)
    
    СВЯЗИ:
    - Использует: Benchmark, HHVacancyTemp, Grade, Vacancy модели
    - Передает: результат в БД (Benchmark записи)
    - Может вызываться из: analyze_hh_vacancy_with_ai
    """
    from .models import HHVacancyTemp, BenchmarkType, Grade, Domain
    from apps.vacancies.models import Vacancy
    
    try:
        logger.info(f"💾 Начинаем сохранение для вакансии {vacancy_data['hh_id']}")
        
        benchmarks_data = ai_response.get('structured_benchmarks', [])
        saved_count = 0
        skipped_count = 0
        
        for benchmark_data in benchmarks_data:
            # Извлекаем Vacancy_ID
            vacancy_id = benchmark_data.get('vacancy_id')
            if vacancy_id != vacancy_data['hh_id']:
                logger.error(f"ID mismatch: {vacancy_id} != {vacancy_data['hh_id']}")
                continue
            
            # Проверяем, нужно ли пропустить вакансию
            vacancy_name = benchmark_data.get('vacancy_name', '').strip()
            if vacancy_name == 'skip':
                skip_reason = benchmark_data.get('skip_reason', 'Не указана причина')
                logger.info(f"⏭️ Пропускаем вакансию {vacancy_id}: {skip_reason}")
                skipped_count += 1
                continue
            
            # Умное сопоставление вакансии
            matched_vacancy = _find_best_vacancy_match(vacancy_name)
            if not matched_vacancy:
                logger.warning(f"❌ Не найдено соответствие для вакансии: '{vacancy_name}'")
                skipped_count += 1
                continue
                
            # Умное сопоставление грейда
            grade_name = benchmark_data.get('grade', '').strip()
            if grade_name == 'skip':
                logger.info(f"⏭️ Пропускаем грейд для вакансии {vacancy_id}")
                skipped_count += 1
                continue
                
            matched_grade = _find_best_grade_match(grade_name)
            if not matched_grade:
                logger.warning(f"❌ Не найден грейд: '{grade_name}'")
                skipped_count += 1
                continue
            
            # Проверяем, что зарплаты не null (если не skip)
            salary_from = benchmark_data.get('salary_from')
            salary_to = benchmark_data.get('salary_to')
            
            if not salary_from or not salary_to:
                logger.warning(f"❌ Отсутствуют зарплаты для вакансии {vacancy_id}")
                skipped_count += 1
                continue
            
            # Создаем Benchmark
            benchmark = Benchmark.objects.create(
                type=BenchmarkType.VACANCY,
                hh_vacancy_id=vacancy_data['hh_id'],
                vacancy=matched_vacancy,
                grade=matched_grade,
                salary_from=salary_from,
                salary_to=salary_to,
                location=benchmark_data.get('location', ''),
                work_format=benchmark_data.get('work_format', ''),
                compensation=benchmark_data.get('compensation', ''),
                benefits=benchmark_data.get('benefits', ''),
                development=benchmark_data.get('development', ''),
                technologies=benchmark_data.get('technologies', ''),
                domain=benchmark_data.get('domain'),
                notes=f"Источник: hh.ru. Компания: {vacancy_data['raw_data'].get('employer', {}).get('name', '')}",
                is_active=True
            )
            
            saved_count += 1
            logger.info(f"✅ Создан Benchmark ID {benchmark.id} для вакансии {matched_vacancy.name} ({matched_grade.name})")
        
        # Помечаем временную вакансию как обработанную
        temp_vacancy = HHVacancyTemp.objects.get(hh_id=vacancy_data['hh_id'])
        temp_vacancy.processed = True
        temp_vacancy.save()
        
        logger.info(f"🎉 Обработка завершена: сохранено {saved_count}, пропущено {skipped_count}")
        
    except Exception as e:
        logger.error(f"❌ Ошибка при сохранении результата анализа: {e}")
