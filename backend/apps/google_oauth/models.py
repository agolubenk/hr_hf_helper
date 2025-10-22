from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
import json

User = get_user_model()


class GoogleOAuthAccount(models.Model):
    """Модель для хранения Google OAuth аккаунтов"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_oauth_account')
    
    # Google аккаунт данные
    google_id = models.CharField(max_length=100, unique=True, verbose_name="Google ID")
    email = models.EmailField(verbose_name="Email")
    name = models.CharField(max_length=200, verbose_name="Имя")
    picture_url = models.URLField(blank=True, null=True, verbose_name="URL фото")
    
    # OAuth токены
    access_token = models.TextField(verbose_name="Access Token")
    refresh_token = models.TextField(blank=True, null=True, verbose_name="Refresh Token")
    token_expires_at = models.DateTimeField(verbose_name="Токен истекает")
    
    # Разрешения (scopes)
    scopes = models.JSONField(default=list, verbose_name="Разрешения")
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")
    last_sync_at = models.DateTimeField(blank=True, null=True, verbose_name="Последняя синхронизация")
    
    class Meta:
        verbose_name = "Google OAuth аккаунт"
        verbose_name_plural = "Google OAuth аккаунты"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    def is_token_valid(self):
        """Проверяет, действителен ли токен"""
        if not self.token_expires_at:
            return False
        
        # Если token_expires_at - строка, конвертируем в datetime
        if isinstance(self.token_expires_at, str):
            try:
                parsed_time = timezone.datetime.fromisoformat(self.token_expires_at.replace('Z', '+00:00'))
                # Сохраняем преобразованное время
                self.token_expires_at = parsed_time
                self.save(update_fields=['token_expires_at'])
            except:
                return False
        
        return timezone.now() < self.token_expires_at
    
    def needs_refresh(self):
        """Проверяет, нужно ли обновить токен"""
        if not self.token_expires_at:
            return True
        
        # Если token_expires_at - строка, конвертируем в datetime
        if isinstance(self.token_expires_at, str):
            try:
                self.token_expires_at = timezone.datetime.fromisoformat(self.token_expires_at.replace('Z', '+00:00'))
            except:
                return True
        
        # Обновляем токен за 5 минут до истечения
        return timezone.now() > (self.token_expires_at - timedelta(minutes=5))
    
    def has_scope(self, scope):
        """Проверяет, есть ли у аккаунта определенное разрешение"""
        return scope in self.scopes
    
    def get_available_services(self):
        """Возвращает список доступных Google сервисов"""
        services = []
        
        if self.has_scope('https://www.googleapis.com/auth/userinfo.email'):
            services.append('userinfo')
        if self.has_scope('https://www.googleapis.com/auth/calendar'):
            services.append('calendar')
        if self.has_scope('https://www.googleapis.com/auth/drive'):
            services.append('drive')
        if self.has_scope('https://www.googleapis.com/auth/spreadsheets'):
            services.append('sheets')
        
        return services


# Модели для хранения API данных удалены - теперь данные кэшируются в Redis
# GoogleCalendarEvent, GoogleDriveFile, GoogleSheet больше не нужны


class SyncSettings(models.Model):
    """Модель для настроек синхронизации"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='sync_settings',
        verbose_name='Пользователь'
    )
    
    auto_sync_calendar = models.BooleanField(
        default=False,
        verbose_name='Автоматическая синхронизация календаря'
    )
    
    auto_sync_drive = models.BooleanField(
        default=False,
        verbose_name='Автоматическая синхронизация Drive'
    )
    
    sync_interval = models.IntegerField(
        default=60,
        verbose_name='Интервал синхронизации (минуты)',
        help_text='Интервал синхронизации в минутах'
    )
    
    max_events = models.IntegerField(
        default=100,
        verbose_name='Максимум событий',
        help_text='Максимальное количество событий для синхронизации'
    )
    
    max_files = models.IntegerField(
        default=100,
        verbose_name='Максимум файлов',
        help_text='Максимальное количество файлов для синхронизации'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Настройки синхронизации'
        verbose_name_plural = 'Настройки синхронизации'
    
    def __str__(self):
        return f"Настройки синхронизации для {self.user.username}"


class Invite(models.Model):
    """Модель для хранения информации об инвайтах кандидатов"""
    
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('sent', 'Отправлен'),
        ('completed', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]
    
    # Основная информация
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name=_("Пользователь"),
        related_name='invites'
    )
    
    # Информация о кандидате
    candidate_url = models.URLField(
        _("Ссылка на кандидата"),
        help_text=_("Ссылка на кандидата в Huntflow")
    )
    candidate_id = models.CharField(
        _("ID кандидата"),
        max_length=50,
        blank=True
    )
    candidate_name = models.CharField(
        _("Имя кандидата"),
        max_length=255,
        blank=True
    )
    candidate_grade = models.CharField(
        _("Уровень кандидата"),
        max_length=100,
        blank=True
    )
    
    # Информация о вакансии
    vacancy_id = models.CharField(
        _("ID вакансии"),
        max_length=50,
        blank=True
    )
    vacancy_title = models.CharField(
        _("Название вакансии"),
        max_length=255,
        blank=True
    )
    
    # Дата и время интервью
    interview_datetime = models.DateTimeField(
        _("Дата и время интервью")
    )
    
    # Кастомная длительность встречи (в минутах)
    custom_duration_minutes = models.PositiveIntegerField(
        _("Кастомная длительность встречи (минуты)"),
        null=True,
        blank=True,
        help_text=_("Если указано, будет использоваться вместо стандартной длительности из вакансии")
    )
    
    # Email авторизованного пользователя
    user_email = models.EmailField(
        _("Email пользователя"),
        blank=True,
        help_text=_("Email авторизованного пользователя, создавшего инвайт")
    )
    
    # Статус и результаты
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Google Drive информация
    google_drive_folder_id = models.CharField(
        _("ID папки в Google Drive"),
        max_length=255,
        blank=True
    )
    google_drive_file_id = models.CharField(
        _("ID файла scorecard в Google Drive"),
        max_length=255,
        blank=True
    )
    google_drive_file_url = models.URLField(
        _("Ссылка на scorecard файл"),
        blank=True
    )
    
    # Google Calendar информация
    calendar_event_id = models.CharField(
        _("ID события в Google Calendar"),
        max_length=255,
        blank=True
    )
    calendar_event_url = models.URLField(
        _("Ссылка на событие в Google Calendar"),
        blank=True
    )
    google_meet_url = models.URLField(
        _("Ссылка на Google Meet"),
        blank=True
    )
    
    # Ссылка на шаблон scorecard
    scorecard_template_url = models.URLField(
        _("Ссылка на шаблон scorecard"),
        blank=True,
        help_text=_("Ссылка на шаблон scorecard для вакансии")
    )
    
    # Исходные данные из формы
    original_form_data = models.TextField(
        _("Исходные данные из формы"),
        blank=True,
        help_text=_("Весь текст, введенный пользователем в комбинированную форму")
    )
    
    # Выбранный интервьюер
    interviewer = models.ForeignKey(
        'interviewers.Interviewer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Интервьюер"),
        help_text=_("Интервьюер, назначенный для проведения интервью")
    )
    
    # Данные от Gemini AI
    gemini_suggested_datetime = models.CharField(
        _("Предложенное время от Gemini"),
        max_length=50,
        blank=True,
        help_text=_("Время интервью, определенное Gemini AI на основе анализа исходного текста и слотов")
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        _("Создано"),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _("Обновлено"),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _("Инвайт")
        verbose_name_plural = _("Инвайты")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Инвайт для {self.candidate_name} на {self.interview_datetime.strftime('%d.%m.%Y %H:%M')}"
    
    def _normalize_level(self, level_value):
        """Нормализует значение уровня на основе грейдов из @finance/"""
        if not level_value:
            return None
        
        # Получаем все доступные грейды из системы
        from apps.finance.models import Grade
        available_grades = list(Grade.objects.values_list('name', flat=True))
        
        level = str(level_value).strip()
        
        # 1. Точное совпадение (регистр не важен)
        for grade in available_grades:
            if level.lower() == grade.lower():
                return grade
        
        # 2. Маппинг различных вариантов на доступные грейды
        level_mapping = {
            'junior': 'Junior',
            'junior+': 'Junior+',
            'junior +': 'Junior+',
            'middle': 'Middle', 
            'middle+': 'Middle+',
            'middle +': 'Middle+',
            'senior': 'Senior',
            'lead': 'Lead',
            'architect': 'Architect',
            'младший': 'Junior',
            'средний': 'Middle',
            'старший': 'Senior',
        }
        
        normalized = level_mapping.get(level.lower())
        
        # 3. Проверяем, что нормализованный грейд существует в системе
        if normalized and normalized in available_grades:
            return normalized
        
        # 4. Если не нашли точного совпадения, возвращаем None
        return None
    
    def _find_candidate_level(self, questionary, account_id):
        """Находит уровень кандидата с строгой проверкой против грейдов из @finance/"""
        try:
            from apps.huntflow.services import HuntflowService
            from apps.finance.models import Grade
            
            # Получаем все доступные грейды из системы
            available_grades = list(Grade.objects.values_list('name', flat=True))
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Доступные грейды в системе: {available_grades}")
            
            service = HuntflowService(self.user)
            
            # 1. Сначала пытаемся получить схему анкеты
            try:
                schema = service.get_applicant_questionary_schema(account_id, int(self.vacancy_id))
                if schema and 'fields' in schema:
                    # Ищем поле с уровнем по названию
                    for field in schema['fields']:
                        field_title = field.get('title', '').lower()
                        if 'уровень' in field_title or 'level' in field_title or 'грейд' in field_title:
                            field_id = field.get('id')
                            if field_id in questionary:
                                level = self._normalize_level(questionary[field_id])
                                if level and level in available_grades:
                                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Найден уровень по схеме: {level} (поле: {field_id})")
                                    return level, field_id
            except Exception as e:
                print(f"РЕАЛЬНЫЕ ДАННЫЕ: Не удалось получить схему анкеты: {e}")
            
            # 2. Если не нашли по схеме, ищем по значениям
            for field_id, value in questionary.items():
                if value:
                    level = self._normalize_level(value)
                    if level and level in available_grades:
                        print(f"РЕАЛЬНЫЕ ДАННЫЕ: Найден уровень по значению: {level} (поле: {field_id})")
                        return level, field_id
            
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Уровень не найден среди доступных грейдов: {available_grades}")
            return None, None
            
        except Exception as e:
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Ошибка при поиске уровня: {e}")
            return None, None
    
    def parse_candidate_url(self):
        """Парсит URL кандидата и извлекает ID вакансии, кандидата и аккаунта"""
        try:
            import re
            
            # Проверяем, что URL содержит /vacancy/
            if '/vacancy/' not in self.candidate_url:
                return False, "URL должен содержать /vacancy/"
            
            # Ищем паттерн vacancy/[id]/filter/.../id/[candidate_id]
            # Поддерживаем различные форматы:
            # /vacancy/4/filter/workon/id/13
            # /vacancy/3936868/filter/186503/id/73349542
            pattern = r'/vacancy/(\d+)/filter/(?:workon|\d+)/id/(\d+)'
            match = re.search(pattern, self.candidate_url)
            
            if not match:
                return False, "Неверный формат URL. Ожидается формат: .../vacancy/[id]/filter/[status]/id/[candidate_id]"
            
            vacancy_id = match.group(1)
            candidate_id = match.group(2)
            
            # Получаем account_id из настроек пользователя, а не из URL
            # URL может содержать любой org_id, но мы используем настроенный аккаунт
            account_id = None
            try:
                from apps.huntflow.services import HuntflowService
                service = HuntflowService(self.user)
                accounts = service.get_accounts()
                if accounts and 'items' in accounts and len(accounts['items']) > 0:
                    account_id = accounts['items'][0]['id']
                    print(f"🔍 PARSE_URL: Используем первый доступный account_id: {account_id}")
                else:
                    return False, "Не удалось получить список аккаунтов из Huntflow API"
            except Exception as e:
                print(f"❌ PARSE_URL: Ошибка получения account_id из API: {e}")
                return False, f"Не удалось получить account_id из API: {str(e)}"
            
            self.vacancy_id = vacancy_id
            self.candidate_id = candidate_id
            # Сохраняем account_id в поле, если оно есть в модели
            if hasattr(self, 'account_id'):
                self.account_id = account_id
            
            return True, f"URL успешно распарсен. Account ID: {account_id}"
            
        except Exception as e:
            return False, f"Ошибка парсинга URL: {str(e)}"
    
    def get_candidate_info(self):
        """Получает информацию о кандидате из Huntflow API"""
        try:
            from apps.huntflow.services import HuntflowService
            
            # Сначала парсим URL, если это еще не сделано
            if not self.candidate_id:
                success, message = self.parse_candidate_url()
                if not success:
                    return False, f"Ошибка парсинга URL: {message}"
            
            # Проверяем, что у нас есть необходимые данные
            if not self.candidate_id:
                return False, "ID кандидата не найден"
            
            # Получаем account_id из настроек пользователя
            try:
                from apps.huntflow.services import HuntflowService
                service = HuntflowService(self.user)
                accounts = service.get_accounts()
                if accounts and 'items' in accounts and len(accounts['items']) > 0:
                    account_id = accounts['items'][0]['id']
                    print(f"🔍 GET_CANDIDATE_INFO: Автоматически получен account_id: {account_id}")
                else:
                    return False, "Не удалось получить список аккаунтов из Huntflow API"
            except Exception as e:
                print(f"❌ GET_CANDIDATE_INFO: Ошибка получения account_id: {e}")
                return False, f"Не удалось получить account_id: {str(e)}"
            
            # Проверяем настройки пользователя
            if not self.user.huntflow_sandbox_api_key and not self.user.huntflow_prod_api_key:
                # Если API ключи не настроены, останавливаем процесс
                error_msg = f"КРИТИЧЕСКАЯ ОШИБКА: API ключи Huntflow не настроены. Настройте API ключи в профиле пользователя."
                print(f"РЕАЛЬНЫЕ ДАННЫЕ: ❌ {error_msg}")
                return False, error_msg
            
            # Пытаемся получить реальную информацию
            try:
                service = HuntflowService(self.user)
                candidate_info = service.get_applicant(account_id, int(self.candidate_id))
                
                if candidate_info:
                    # Извлекаем имя кандидата
                    first_name = candidate_info.get('first_name', '')
                    last_name = candidate_info.get('last_name', '')
                    self.candidate_name = f"{last_name} {first_name}".strip()
                    
                    # Извлекаем уровень кандидата из анкеты (необязательно)
                    self.candidate_grade = "Не указан"
                    try:
                        # Получаем анкету кандидата
                        questionary = service.get_applicant_questionary(account_id, int(self.candidate_id))
                        if questionary:
                            # Ищем уровень с строгой проверкой
                            level, field_id = self._find_candidate_level(questionary, account_id)
                            if level:
                                self.candidate_grade = level
                                print(f"РЕАЛЬНЫЕ ДАННЫЕ: ✅ Найден уровень в анкете: {level} (поле: {field_id})")
                            else:
                                print(f"РЕАЛЬНЫЕ ДАННЫЕ: ⚠️ Уровень кандидата не найден в анкете, используем 'Не указан'")
                        else:
                            print(f"РЕАЛЬНЫЕ ДАННЫЕ: ⚠️ Анкета кандидата {self.candidate_id} пуста, используем 'Не указан'")
                    except Exception as e:
                        print(f"РЕАЛЬНЫЕ ДАННЫЕ: ⚠️ Ошибка при получении анкеты: {e}, используем 'Не указан'")
                    
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Получена информация о кандидате {self.candidate_id}")
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Имя: {self.candidate_name}")
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Уровень: {self.candidate_grade}")
                    
                    return True, "Информация о кандидате получена из Huntflow API"
                else:
                    # Если не удалось получить данные, останавливаем процесс
                    error_msg = f"КРИТИЧЕСКАЯ ОШИБКА: Кандидат {self.candidate_id} не найден в аккаунте {account_id}"
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: ❌ {error_msg}")
                    return False, error_msg
                    
            except Exception as api_error:
                # Если ошибка API, останавливаем процесс
                error_msg = f"КРИТИЧЕСКАЯ ОШИБКА: Ошибка API Huntflow для аккаунта {account_id}: {str(api_error)}"
                print(f"РЕАЛЬНЫЕ ДАННЫЕ: ❌ {error_msg}")
                return False, error_msg
                
        except Exception as e:
            return False, f"Ошибка получения информации о кандидате: {str(e)}"
    
    def extract_custom_duration(self, text):
        """Извлекает кастомную длительность из текста в скобках"""
        import re
        
        if not text:
            return None
        
        # Сначала пытаемся исправить распространенные опечатки
        corrected_text = text
        
        # Исправляем основные опечатки с раскладкой клавиатуры
        corrections = [
            ('xfc', 'час'),      # xfc -> час (раскладка)
            ('vfc', 'час'),      # vfc -> час
            ('vf', 'час'),       # vf -> час
        ]
        
        for typo, correct in corrections:
            if typo in corrected_text.lower():
                corrected_text = corrected_text.replace(typo, correct)
                print(f"🔧 Исправлена опечатка: '{typo}' -> '{correct}'")
        
        # Паттерны для поиска длительности в скобках
        patterns = [
            r'\((\d+)\s*час[а-я]*\)',  # (1 час), (2 часа)
            r'\((\d+)\s*минут\)',      # (30 минут)
            r'\((\d+)\s*мин\)',        # (45 мин)
            r'\((\d+)\s*ч\)',          # (1 ч), (2 ч)
            r'\((\d+)\s*м\)',          # (30 м), (45 м)
            r'\(полчаса\)',            # (полчаса)
        ]
        
        # Сначала пробуем исправленный текст
        for pattern in patterns:
            match = re.search(pattern, corrected_text, re.IGNORECASE)
            if match:
                if 'полчаса' in match.group(0).lower():
                    duration = 30
                    print(f"✅ Извлечена длительность: полчаса = {duration} минут")
                    return duration
                else:
                    duration = int(match.group(1))
                    if 'час' in match.group(0).lower() or 'ч' in match.group(0).lower():
                        duration *= 60  # Конвертируем часы в минуты
                    print(f"✅ Извлечена длительность: {match.group(0)} = {duration} минут")
                    return duration
        
        # Если не нашли в исправленном тексте, пробуем оригинальный
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if 'полчаса' in match.group(0).lower():
                    duration = 30
                    print(f"✅ Извлечена длительность: полчаса = {duration} минут")
                    return duration
                else:
                    duration = int(match.group(1))
                    if 'час' in match.group(0).lower() or 'ч' in match.group(0).lower():
                        duration *= 60  # Конвертируем часы в минуты
                    print(f"✅ Извлечена длительность: {match.group(0)} = {duration} минут")
                    return duration
        
        return None
    
    def get_screening_duration(self):
        """Получает длительность скринингов для данной вакансии"""
        try:
            # Если указана кастомная длительность, используем её
            if self.custom_duration_minutes:
                print(f"✅ Используем кастомную длительность: {self.custom_duration_minutes} минут")
                return self.custom_duration_minutes
            
            from apps.vacancies.models import Vacancy
            
            # Проверяем, что у нас есть ID вакансии
            if not self.vacancy_id:
                print("⚠️ ID вакансии не найден, используем длительность по умолчанию: 45 минут")
                return 45
            
            # Пытаемся найти вакансию в локальной базе данных
            try:
                local_vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                duration = local_vacancy.screening_duration
                print(f"✅ Найдена длительность скринингов для вакансии '{local_vacancy.name}': {duration} минут")
                return duration
                
            except Vacancy.DoesNotExist:
                print(f"⚠️ Вакансия {self.vacancy_id} не найдена в локальной БД, используем длительность по умолчанию: 45 минут")
                return 45
                
        except Exception as e:
            print(f"❌ Ошибка получения длительности скринингов: {e}, используем длительность по умолчанию: 45 минут")
            return 45

    def get_vacancy_info(self):
        """Получает информацию о вакансии из локальной базы данных и Huntflow API"""
        try:
            from apps.huntflow.services import HuntflowService
            from apps.vacancies.models import Vacancy
            
            # Проверяем, что у нас есть необходимые данные
            if not self.vacancy_id:
                return False, "ID вакансии не найден"
            
            # Сначала пытаемся найти вакансию в локальной базе данных
            try:
                local_vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                self.vacancy_title = local_vacancy.name
                
                # Если есть ссылка на scorecard в локальной базе, используем её
                if local_vacancy.scorecard_link and not self.scorecard_template_url:
                    self.scorecard_template_url = local_vacancy.scorecard_link
                
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Найдена вакансия в локальной БД: {self.vacancy_title}")
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Шаблон scorecard: {self.scorecard_template_url}")
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Длительность скринингов: {local_vacancy.screening_duration} минут")
                
                return True, f"Информация о вакансии получена из локальной БД: {self.vacancy_title}"
                
            except Vacancy.DoesNotExist:
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Вакансия {self.vacancy_id} не найдена в локальной БД, пробуем Huntflow API")
            
            # Если не найдена в локальной БД, пробуем Huntflow API
            # Получаем account_id автоматически из Huntflow API
            try:
                service = HuntflowService(self.user)
                accounts = service.get_accounts()
                if accounts and 'items' in accounts and len(accounts['items']) > 0:
                    account_id = accounts['items'][0]['id']
                    print(f"🔍 GET_VACANCY_INFO: Автоматически получен account_id: {account_id}")
                else:
                    self.vacancy_title = f"Вакансия {self.vacancy_id}"
                    return True, "Информация о вакансии получена (заглушка - не удалось получить список аккаунтов)"
            except Exception as e:
                print(f"❌ GET_VACANCY_INFO: Ошибка получения account_id: {e}")
                self.vacancy_title = f"Вакансия {self.vacancy_id}"
                return True, f"Информация о вакансии получена (заглушка - ошибка получения account_id: {str(e)})"
            
            # Проверяем настройки пользователя
            if not self.user.huntflow_sandbox_api_key and not self.user.huntflow_prod_api_key:
                # Если API ключи не настроены, используем заглушку
                self.vacancy_title = f"Вакансия {self.vacancy_id}"
                return True, "Информация о вакансии получена (заглушка - API ключи не настроены)"
            
            # Получаем реальный account_id пользователя для fallback
            user_account_id = self._get_user_account_id()
            # Убираем проверку на соответствие account_id - нам не важно, какой там ID, главное получить данные
            
            # Пытаемся получить реальную информацию из Huntflow API
            try:
                service = HuntflowService(self.user)
                vacancy_info = None
                
                # Сначала пробуем с переданным account_id
                try:
                    vacancy_info = service.get_vacancy(account_id, int(self.vacancy_id))
                    print(f"🔍 Попытка получить вакансию {self.vacancy_id} из аккаунта {account_id}")
                except Exception as e:
                    print(f"🔍 Не удалось получить вакансию из аккаунта {account_id}: {e}")
                    vacancy_info = None
                
                # Если не получилось, пробуем с user_account_id
                if not vacancy_info and user_account_id != account_id:
                    try:
                        vacancy_info = service.get_vacancy(int(user_account_id), int(self.vacancy_id))
                        print(f"🔍 Fallback: получена вакансия {self.vacancy_id} из аккаунта {user_account_id}")
                    except Exception as e:
                        print(f"🔍 Fallback тоже не сработал для аккаунта {user_account_id}: {e}")
                        vacancy_info = None
                
                if vacancy_info:
                    # Извлекаем название вакансии
                    self.vacancy_title = vacancy_info.get('position', f"Вакансия {self.vacancy_id}")
                    
                    # Извлекаем ссылку на шаблон scorecard (если есть)
                    # Пока используем заглушку, так как в API может не быть этого поля
                    # НЕ перезаписываем, если уже установлена реальная ссылка
                    if not self.scorecard_template_url:
                        self.scorecard_template_url = "https://docs.google.com/spreadsheets/d/1ABC123.../edit"  # Заглушка
                    
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Получена информация о вакансии {self.vacancy_id} из Huntflow API")
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Название: {self.vacancy_title}")
                    print(f"РЕАЛЬНЫЕ ДАННЫЕ: Шаблон scorecard: {self.scorecard_template_url}")
                    
                    return True, "Информация о вакансии получена из Huntflow API"
                else:
                    # Если не удалось получить данные, используем заглушку
                    self.vacancy_title = f"Вакансия {self.vacancy_id}"
                    return True, "Информация о вакансии получена (заглушка - данные не найдены в API)"
                    
            except Exception as api_error:
                # Если ошибка API, используем заглушку
                print(f"Ошибка API Huntflow: {api_error}")
                self.vacancy_title = f"Вакансия {self.vacancy_id}"
                return True, f"Информация о вакансии получена (заглушка - ошибка API: {str(api_error)})"
                
        except Exception as e:
            return False, f"Ошибка получения информации о вакансии: {str(e)}"
    
    def create_google_drive_structure(self):
        """Создает структуру папок в Google Drive и копирует scorecard"""
        try:
            from apps.google_oauth.services import GoogleOAuthService, GoogleDriveService
            from apps.vacancies.models import Vacancy
            
            # Проверяем, есть ли у пользователя настроенный Google OAuth
            oauth_service = GoogleOAuthService(self.user)
            oauth_account = oauth_service.get_oauth_account()
            
            if not oauth_account:
                # Если Google OAuth не настроен, используем заглушку
                return self._create_google_drive_structure_stub()
            
            # Получаем информацию о вакансии из локальной БД для scorecard
            scorecard_title = "Scorecard"  # По умолчанию
            scorecard_template_url = self.scorecard_template_url  # По умолчанию из формы
            
            try:
                local_vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                scorecard_title = local_vacancy.scorecard_title
                if local_vacancy.scorecard_link:
                    scorecard_template_url = local_vacancy.scorecard_link
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Используем scorecard из локальной БД: {scorecard_title}")
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Ссылка на шаблон: {scorecard_template_url}")
            except Vacancy.DoesNotExist:
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ: Вакансия {self.vacancy_id} не найдена в локальной БД, используем данные из формы")
            
            # Получаем настройки структуры папок пользователя
            try:
                from django.apps import apps
                ScorecardPathSettings = apps.get_model('google_oauth', 'ScorecardPathSettings')
                path_settings = ScorecardPathSettings.objects.get(user=self.user)
                
                # Подготавливаем данные для генерации пути
                sample_data = self._prepare_sample_data_for_path_generation()
                
                # Генерируем структуру папок и название файла отдельно
                folder_path, filename_base = path_settings.generate_folder_structure_and_filename(sample_data)
                print(f"НАСТРОЙКИ ПАПОК: Структура папок: {folder_path}")
                print(f"НАСТРОЙКИ ПАПОК: База названия файла: {filename_base}")
            except apps.get_model('google_oauth', 'ScorecardPathSettings').DoesNotExist:
                # Если настройки не найдены, используем старую структуру
                folder_path, filename_base = self._generate_fallback_path_structure()
                print(f"НАСТРОЙКИ ПАПОК: Настройки не найдены, используем старую структуру: {folder_path}")
            
            # Создаем структуру папок в Google Drive
            drive_service = GoogleDriveService(oauth_service)
            folder_id = drive_service.create_folder_structure(folder_path)
            
            if not folder_id:
                return False, "Не удалось создать структуру папок в Google Drive"
            
            # Проверяем, есть ли ссылка на шаблон scorecard
            if not scorecard_template_url:
                return False, "Не указана ссылка на шаблон scorecard"
            
            # Извлекаем ID файла из ссылки на шаблон
            template_file_id = self._extract_file_id_from_url(scorecard_template_url)
            if not template_file_id:
                return False, "Не удалось извлечь ID файла из ссылки на шаблон"
            
            # Формируем название для копии файла: [Фамилия Имя кандидата] [Заголовок Scorecard]
            new_file_name = f"{filename_base} {scorecard_title}"
            
            # Копируем файл в созданную папку
            copied_file_id = drive_service.copy_file(template_file_id, new_file_name, folder_id)
            
            if not copied_file_id:
                return False, "Не удалось скопировать файл scorecard"
            
            # Сохраняем информацию
            self.google_drive_folder_id = folder_id
            self.google_drive_file_id = copied_file_id
            self.google_drive_file_url = f"https://docs.google.com/spreadsheets/d/{copied_file_id}/edit"
            
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Создана структура папок: {folder_path}")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: ID папки: {folder_id}")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: ID файла: {copied_file_id}")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Ссылка: {self.google_drive_file_url}")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Название файла: {new_file_name}")
            
            # Обновляем поле "Scorecard" в Huntflow со ссылкой на scorecard
            self._update_huntflow_scorecard_field()
            
            # Создаем календарное событие
            print("🔍 Создаем календарное событие...")
            calendar_success = self._create_calendar_event()
            print(f"🔍 Результат создания календарного события: {calendar_success}")
            
            # Обновляем статус на Tech Screening при создании инвайта со scorecard
            if calendar_success:
                print(f"[TECH_SCREENING_UPDATE] Календарное событие создано успешно, обновляем статус...")
                try:
                    tech_screening_success = self.update_candidate_status_to_tech_screening()
                    print(f"[TECH_SCREENING_UPDATE] Статус обновлен: {tech_screening_success}")
                except Exception as e:
                    print(f"[TECH_SCREENING_UPDATE] Ошибка при обновлении статуса: {str(e)}")
            else:
                print(f"[TECH_SCREENING_UPDATE] Календарное событие НЕ создано, пропускаем обновление статуса")
            
            return True, f"Структура создана: {folder_path}. Scorecard скопирован и готов к обработке."
            
        except Exception as e:
            return False, f"Ошибка создания структуры Google Drive: {str(e)}"
    
    def _create_google_drive_structure_stub(self):
        """Создает заглушку для структуры Google Drive (когда OAuth не настроен)"""
        try:
            from apps.vacancies.models import Vacancy
            
            # Получаем информацию о вакансии из локальной БД для scorecard
            scorecard_title = "Scorecard"  # По умолчанию
            
            try:
                local_vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                scorecard_title = local_vacancy.scorecard_title
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ (заглушка): Используем scorecard из локальной БД: {scorecard_title}")
            except Vacancy.DoesNotExist:
                print(f"ЛОКАЛЬНЫЕ ДАННЫЕ (заглушка): Вакансия {self.vacancy_id} не найдена в локальной БД, используем по умолчанию")
            
            # Получаем настройки структуры папок пользователя
            try:
                from django.apps import apps
                ScorecardPathSettings = apps.get_model('google_oauth', 'ScorecardPathSettings')
                path_settings = ScorecardPathSettings.objects.get(user=self.user)
                
                # Подготавливаем данные для генерации пути
                sample_data = self._prepare_sample_data_for_path_generation()
                
                # Генерируем структуру папок и название файла отдельно
                folder_path, filename_base = path_settings.generate_folder_structure_and_filename(sample_data)
                print(f"НАСТРОЙКИ ПАПОК (заглушка): Структура папок: {folder_path}")
                print(f"НАСТРОЙКИ ПАПОК (заглушка): База названия файла: {filename_base}")
            except apps.get_model('google_oauth', 'ScorecardPathSettings').DoesNotExist:
                # Если настройки не найдены, используем старую структуру
                folder_path, filename_base = self._generate_fallback_path_structure()
                print(f"НАСТРОЙКИ ПАПОК (заглушка): Настройки не найдены, используем старую структуру: {folder_path}")
            
            # Формируем название для копии файла: [Фамилия Имя кандидата] [Заголовок Scorecard]
            new_file_name = f"{filename_base} {scorecard_title}"
            
            # ЗАГЛУШКА: Не создаем реальные файлы, только сохраняем информацию
            import uuid
            folder_id = f"folder_{uuid.uuid4().hex[:8]}"
            file_id = f"file_{uuid.uuid4().hex[:8]}"
            
            self.google_drive_folder_id = folder_id
            self.google_drive_file_id = file_id
            # НЕ создаем фейковую ссылку - оставляем пустой
            self.google_drive_file_url = ""
            
            print(f"ЗАГЛУШКА: Подготовлена структура папок: {folder_path}")
            print(f"ЗАГЛУШКА: ID папки: {folder_id}")
            print(f"ЗАГЛУШКА: ID файла: {file_id}")
            print(f"ЗАГЛУШКА: Название файла: {new_file_name}")
            print(f"ЗАГЛУШКА: Ссылка НЕ создана (требуется настройка Google OAuth)")
            
            # Календарное событие не создается без Google OAuth
            print("❌ Календарное событие не создано - требуется настройка Google OAuth")
            calendar_success = False
            
            # Статус не обновляется без календарного события
            print("❌ Статус не обновлен - требуется календарное событие")
            
            return True, f"Структура подготовлена (заглушка): {folder_path}. Требуется настройка Google OAuth для создания реальных файлов."
            
        except Exception as e:
            return False, f"Ошибка создания заглушки структуры Google Drive: {str(e)}"
    
    def _extract_file_id_from_url(self, url):
        """Извлекает ID файла из URL Google Docs/Sheets"""
        try:
            import re
            # Паттерн для извлечения ID файла из URL Google Docs/Sheets
            # https://docs.google.com/spreadsheets/d/1ABC123.../edit
            pattern = r'/d/([a-zA-Z0-9-_]+)'
            match = re.search(pattern, url)
            if match:
                return match.group(1)
            return None
        except Exception as e:
            print(f"Ошибка извлечения ID файла из URL: {e}")
            return None
    
    def _prepare_sample_data_for_path_generation(self):
        """Подготавливает данные для генерации пути папок"""
        print(f"🔍 SAMPLE_DATA: Подготавливаем данные для генерации пути папок")
        print(f"🔍 SAMPLE_DATA: candidate_name = '{self.candidate_name}'")
        print(f"🔍 SAMPLE_DATA: vacancy_title = '{self.vacancy_title}'")
        print(f"🔍 SAMPLE_DATA: interview_datetime = '{self.interview_datetime}'")
        
        year = self.interview_datetime.year
        month_num = self.interview_datetime.month
        day = self.interview_datetime.day
        weekday = self.interview_datetime.strftime('%A')
        
        # Русские названия месяцев
        months_ru = {
            1: 'январь', 2: 'февраль', 3: 'март', 4: 'апрель',
            5: 'май', 6: 'июнь', 7: 'июль', 8: 'август',
            9: 'сентябрь', 10: 'октябрь', 11: 'ноябрь', 12: 'декабрь'
        }
        
        # Русские сокращения дней недели
        weekdays_ru = {
            'Monday': 'ПН', 'Tuesday': 'ВТ', 'Wednesday': 'СР',
            'Thursday': 'ЧТ', 'Friday': 'ПТ', 'Saturday': 'СБ', 'Sunday': 'ВС'
        }
        
        month_name = months_ru.get(month_num, '')
        weekday_name = weekdays_ru.get(weekday, '')
        
        # Вычисляем номер недели в году (ISO 8601 формат)
        week_number = self.interview_datetime.isocalendar()[1]
        
        sample_data = {
            'date': self.interview_datetime.strftime('%d.%m.%Y'),
            'day': self.interview_datetime.strftime('%d'),
            'week_number': str(week_number),  # Номер недели в году (1-53)
            'week_short_en': f"W{week_number}",  # Короткий формат: W42
            'week_short_ru': f"Н{week_number}",  # Короткий формат: Н42
            'week_full_en': f"Week {week_number}",  # Полный формат: Week 42
            'week_full_ru': f"Неделя {week_number}",  # Полный формат: Неделя 42
            'month_num': self.interview_datetime.strftime('%m'),
            'month_short_ru': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][month_num-1],
            'month_short_en': self.interview_datetime.strftime('%b'),
            'month_full_ru': month_name,
            'month_full_en': self.interview_datetime.strftime('%B'),
            'weekday_short_ru': weekdays_ru.get(weekday, ''),
            'weekday_short_en': self.interview_datetime.strftime('%a'),
            'weekday_full_ru': ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][self.interview_datetime.weekday()],
            'weekday_full_en': self.interview_datetime.strftime('%A'),
            'year_short': self.interview_datetime.strftime('%y'),
            'year_full': str(year),
            'candidate_first_name': self._extract_candidate_first_name(),
            'candidate_last_name': self._extract_candidate_last_name(),
            'candidate_middle_name': self._extract_candidate_middle_name(),
            'candidate_id': self.candidate_id or '',
            'vacancy_title': self.vacancy_title or '',
            'vacancy_id': self.vacancy_id or ''
        }
        
        print(f"🔍 SAMPLE_DATA: Подготовленные данные:")
        for key, value in sample_data.items():
            print(f"🔍 SAMPLE_DATA:   {key} = '{value}'")
        
        return sample_data
    
    def _extract_candidate_first_name(self):
        """Извлекает имя кандидата из полного имени"""
        if not self.candidate_name:
            return ''
        
        name_parts = self.candidate_name.strip().split()
        if len(name_parts) >= 2:
            # Если есть минимум 2 части, то вторая часть - это имя
            return name_parts[1]
        elif len(name_parts) == 1:
            # Если только одна часть, то это может быть как имя, так и фамилия
            # Возвращаем как есть
            return name_parts[0]
        else:
            return ''
    
    def _extract_candidate_last_name(self):
        """Извлекает фамилию кандидата из полного имени"""
        if not self.candidate_name:
            return 'Кандидат'
        
        name_parts = self.candidate_name.strip().split()
        if len(name_parts) >= 1:
            # Первая часть - это фамилия
            return name_parts[0]
        else:
            return 'Кандидат'
    
    def _extract_candidate_middle_name(self):
        """Извлекает отчество кандидата из полного имени"""
        if not self.candidate_name:
            return ''
        
        name_parts = self.candidate_name.strip().split()
        if len(name_parts) >= 3:
            # Если есть минимум 3 части, то третья часть - это отчество
            return name_parts[2]
        else:
            return ''
    
    def _generate_fallback_path_structure(self):
        """Генерирует структуру папок по умолчанию, если настройки не найдены"""
        year = self.interview_datetime.year
        month_num = self.interview_datetime.month
        day = self.interview_datetime.day
        weekday = self.interview_datetime.strftime('%A')
        
        # Русские названия месяцев
        months_ru = {
            1: 'январь', 2: 'февраль', 3: 'март', 4: 'апрель',
            5: 'май', 6: 'июнь', 7: 'июль', 8: 'август',
            9: 'сентябрь', 10: 'октябрь', 11: 'ноябрь', 12: 'декабрь'
        }
        
        # Русские сокращения дней недели
        weekdays_ru = {
            'Monday': 'ПН', 'Tuesday': 'ВТ', 'Wednesday': 'СР',
            'Thursday': 'ЧТ', 'Friday': 'ПТ', 'Saturday': 'СБ', 'Sunday': 'ВС'
        }
        
        month_name = months_ru.get(month_num, '')
        weekday_name = weekdays_ru.get(weekday, '')
        
        folder_path = f"{self.vacancy_title}/{year}/{month_num:02d} {month_name}/{day:02d} {month_name} ({weekday_name})"
        filename_base = self.candidate_name
        
        return folder_path, filename_base
    
    def process_scorecard(self):
        """Обрабатывает scorecard файл - удаляет лишние листы"""
        try:
            from apps.google_oauth.services import GoogleOAuthService, GoogleSheetsService
            
            # Проверяем, есть ли у пользователя настроенный Google OAuth
            oauth_service = GoogleOAuthService(self.user)
            oauth_account = oauth_service.get_oauth_account()
            
            if not oauth_account:
                # Если Google OAuth не настроен, используем заглушку
                return self._process_scorecard_stub()
            
            # Проверяем, что у нас есть ID файла
            if not self.google_drive_file_id:
                return False, "ID файла scorecard не найден"
            
            # Создаем сервис для работы с Google Sheets
            sheets_service = GoogleSheetsService(oauth_service)
            
            # Получаем список всех листов в таблице
            sheets = sheets_service.get_sheets(self.google_drive_file_id)
            
            if not sheets:
                return False, "Не удалось получить список листов в таблице"
            
            # Определяем листы для сохранения
            sheets_to_keep = ['all', 'score']
            
            # Добавляем лист с уровнем кандидата, если он есть
            if self.candidate_grade and self.candidate_grade != "Не указан":
                sheets_to_keep.append(self.candidate_grade)
            else:
                # Если уровень не указан, оставляем лист по умолчанию (например, Middle)
                # или не удаляем листы с уровнями вообще
                print(f"РЕАЛЬНЫЕ ДАННЫЕ: Уровень кандидата не указан, оставляем все листы с уровнями")
                # Не добавляем лист по умолчанию, чтобы сохранить все листы с уровнями
            
            # Удаляем лишние листы, но оставляем хотя бы один
            deleted_sheets = []
            sheets_to_delete = []
            
            for sheet in sheets:
                sheet_title = sheet.get('properties', {}).get('title', '')
                sheet_id = sheet.get('properties', {}).get('sheetId')
                
                # Пропускаем листы, которые нужно сохранить
                if sheet_title.lower() in [s.lower() for s in sheets_to_keep]:
                    continue
                
                # Если уровень не указан, не удаляем листы с уровнями
                if not self.candidate_grade or self.candidate_grade == "Не указан":
                    # Проверяем, является ли лист листом с уровнем
                    level_sheets = ['junior', 'junior+', 'middle', 'middle+', 'senior']
                    if sheet_title.lower() in level_sheets:
                        print(f"РЕАЛЬНЫЕ ДАННЫЕ: Сохраняем лист с уровнем: {sheet_title}")
                        continue
                
                sheets_to_delete.append((sheet_title, sheet_id))
            
            # Удаляем листы, но оставляем хотя бы один
            if len(sheets_to_delete) < len(sheets):
                for sheet_title, sheet_id in sheets_to_delete:
                    if sheets_service.delete_sheet(self.google_drive_file_id, sheet_id):
                        deleted_sheets.append(sheet_title)
                        print(f"РЕАЛЬНЫЕ ДАННЫЕ: Удален лист: {sheet_title}")
                    else:
                        print(f"РЕАЛЬНЫЕ ДАННЫЕ: Не удалось удалить лист: {sheet_title}")
            else:
                print(f"РЕАЛЬНЫЕ ДАННЫЕ: Не удаляем листы - нужно оставить хотя бы один")
            
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Обработка scorecard завершена")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Сохранены листы: {', '.join(sheets_to_keep)}")
            print(f"РЕАЛЬНЫЕ ДАННЫЕ: Удалены листы: {', '.join(deleted_sheets)}")
            
            return True, f"Scorecard обработан. Сохранены листы: {', '.join(sheets_to_keep)}. Удалены листы: {', '.join(deleted_sheets)}"
            
        except Exception as e:
            return False, f"Ошибка обработки scorecard: {str(e)}"
    
    def _process_scorecard_stub(self):
        """Создает заглушку для обработки scorecard (когда OAuth не настроен)"""
        try:
            # Определяем листы для удаления (оставляем только all, score и лист с уровнем кандидата)
            sheets_to_keep = ['all', 'score', self.candidate_grade]
            
            print(f"ЗАГЛУШКА: Обработка scorecard для файла {self.google_drive_file_id}")
            print(f"ЗАГЛУШКА: Листы для сохранения: {sheets_to_keep}")
            print(f"ЗАГЛУШКА: Уровень кандидата: {self.candidate_grade}")
            
            return True, f"Scorecard обработан (заглушка). Сохранены листы: {', '.join(sheets_to_keep)}"
            
        except Exception as e:
            return False, f"Ошибка обработки заглушки scorecard: {str(e)}"
    
    def _update_huntflow_scorecard_field(self):
        """Обновляет поле 'Scorecard' в Huntflow со ссылкой на scorecard"""
        try:
            from apps.huntflow.services import HuntflowService
            
            # Проверяем, что у нас есть ссылка на scorecard
            if not self.google_drive_file_url:
                print("❌ Нет ссылки на scorecard для обновления Huntflow")
                return False
            
            # Получаем account_id из Huntflow API
            service = HuntflowService(self.user)
            accounts = service.get_accounts()
            if not accounts or 'items' not in accounts or len(accounts['items']) == 0:
                print("❌ Не удалось получить account_id для обновления Huntflow")
                return False
            
            account_id = accounts['items'][0]['id']
            
            # Обновляем поле Scorecard со ссылкой на scorecard
            result = service.update_applicant_scorecard_field(
                account_id=account_id,
                applicant_id=int(self.candidate_id),
                scorecard_url=self.google_drive_file_url
            )
            
            if result:
                print(f"✅ Поле 'Scorecard' в Huntflow обновлено со ссылкой на scorecard")
                return True
            else:
                print(f"❌ Не удалось обновить поле 'Scorecard' в Huntflow")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка обновления поля 'Scorecard' в Huntflow: {str(e)}")
            return False
    
    def _create_calendar_event(self):
        """Создает календарное событие с длительностью из настроек вакансии"""
        try:
            from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
            from apps.huntflow.services import HuntflowService
            from datetime import timedelta
            
            # Проверяем, есть ли у пользователя настроенный Google OAuth
            oauth_service = GoogleOAuthService(self.user)
            oauth_account = oauth_service.get_oauth_account()
            
            if not oauth_account:
                print("❌ Google OAuth не настроен, невозможно создать календарное событие")
                return False
            
            # Создаем сервис для работы с Google Calendar
            calendar_service = GoogleCalendarService(oauth_service)
            
            # Получаем email кандидата из Huntflow
            candidate_email = None
            try:
                huntflow_service = HuntflowService(self.user)
                accounts = huntflow_service.get_accounts()
                if accounts and 'items' in accounts and len(accounts['items']) > 0:
                    account_id = accounts['items'][0]['id']
                    candidate_info = huntflow_service.get_applicant(account_id, int(self.candidate_id))
                    if candidate_info and candidate_info.get('email'):
                        candidate_email = candidate_info['email']
                        print(f"📧 Найден email кандидата: {candidate_email}")
                    else:
                        print(f"❌ Email кандидата не найден в Huntflow")
                else:
                    print(f"❌ Не удалось получить account_id для поиска email кандидата")
            except Exception as e:
                print(f"❌ Ошибка получения email кандидата: {e}")
            
            # Формируем название события на основе настроек пути + заголовок Scorecard
            event_title = self._generate_calendar_event_title()
            
            # Время начала - время интервью
            start_time = self.interview_datetime
            
            # Получаем длительность скринингов из настроек вакансии
            screening_duration = self.get_screening_duration()
            print(f"⏱️ Используем длительность скринингов: {screening_duration} минут")
            
            # Время окончания - через указанное количество минут
            end_time = start_time + timedelta(minutes=screening_duration)
            
            # Получаем сопроводительный текст из вакансии
            invite_text = ""
            try:
                if self.vacancy_id:
                    from apps.vacancies.models import Vacancy
                    import re
                    
                    vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                    invite_text = vacancy.invite_text
                    
                    # Обрезаем текст после --- (для интервьюеров)
                    if '---' in invite_text:
                        invite_text = invite_text.split('---')[0].strip()
                    
                    # Получаем телеграм рекрутера и заменяем плейсхолдер
                    if vacancy.recruiter and vacancy.recruiter.telegram_username:
                        telegram_username = vacancy.recruiter.telegram_username
                        # Убираем @ если есть
                        if telegram_username.startswith('@'):
                            telegram_username = telegram_username[1:]
                        telegram_link = f"https://t.me/{telegram_username}"
                        
                        # Заменяем [телеграм рекрутера] на прямую ссылку
                        invite_text = re.sub(
                            r'\[телеграм рекрутера\]', 
                            telegram_link, 
                            invite_text, 
                            flags=re.IGNORECASE
                        )
                        
                        print(f"📝 Найден телеграм рекрутера: {telegram_username}")
                        print(f"📝 Ссылка на телеграм: {telegram_link}")
                    else:
                        print("⚠️ Телеграм рекрутера не найден")
                        
                    print(f"📝 Сопроводительный текст: {invite_text[:100]}...")
                    
            except Exception as e:
                print(f"⚠️ Ошибка получения данных вакансии: {e}")
            
            # Описание события - сопроводительный текст + ссылка на Huntflow
            description = invite_text if invite_text else f"Интервью с кандидатом: {self.candidate_name} - {self.vacancy_title}"
            
            # Добавляем ссылку на Huntflow кандидата
            huntflow_link = self._generate_huntflow_candidate_link()
            if huntflow_link:
                description += f"\n\nДля интервьюеров:\n{huntflow_link}"
            
            # Подготавливаем участников
            attendees = []
            if candidate_email:
                attendees.append(candidate_email)
                print(f"👥 Добавляем кандидата в участники: {candidate_email}")
            
            # Добавляем email пользователя в участники
            if self.user_email:
                attendees.append(self.user_email)
                print(f"👥 Добавляем пользователя в участники: {self.user_email}")
            elif self.user and hasattr(self.user, 'email') and self.user.email:
                attendees.append(self.user.email)
                print(f"👥 Добавляем пользователя в участники: {self.user.email}")
            
            # Добавляем email интервьюера в участники
            if self.interviewer and self.interviewer.email:
                attendees.append(self.interviewer.email)
                print(f"👥 Добавляем интервьюера в участники: {self.interviewer.email}")
            
            # Создаем событие
            created_event = calendar_service.create_event(
                title=event_title,
                start_time=start_time,
                end_time=end_time,
                description=description,
                location="",  # Можно добавить местоположение позже
                attendees=attendees if attendees else None,
                calendar_id='primary'
            )
            
            if created_event:
                # Сохраняем информацию о событии
                self.calendar_event_id = created_event.get('id', '')
                self.calendar_event_url = created_event.get('htmlLink', '')
                
                # Получаем Google Meet ссылку
                conference_data = created_event.get('conferenceData', {})
                entry_points = conference_data.get('entryPoints', [])
                meet_url = None
                for entry_point in entry_points:
                    if entry_point.get('entryPointType') == 'video':
                        meet_url = entry_point.get('uri')
                        break
                
                if meet_url:
                    self.google_meet_url = meet_url
                    print(f"🔗 Google Meet ссылка: {meet_url}")
                else:
                    print(f"❌ Google Meet ссылка не найдена")
                
                self.save()  # Сохраняем изменения в БД
                
                print(f"✅ Календарное событие создано: {event_title}")
                print(f"🔗 Ссылка на событие: {self.calendar_event_url}")
                return True
            else:
                print(f"❌ Не удалось создать календарное событие")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка создания календарного события: {str(e)}")
            return False
    
    def get_formatted_interview_datetime(self):
        """Возвращает отформатированную дату и время интервью в формате 'Вторник, 9 сентября⋅11:00–11:45'"""
        try:
            from datetime import timedelta, timezone
            
            # Русские названия дней недели
            weekdays_ru = {
                0: 'Понедельник', 1: 'Вторник', 2: 'Среда', 3: 'Четверг',
                4: 'Пятница', 5: 'Суббота', 6: 'Воскресенье'
            }
            
            # Русские названия месяцев
            months_ru = {
                1: 'января', 2: 'февраля', 3: 'марта', 4: 'апреля',
                5: 'мая', 6: 'июня', 7: 'июля', 8: 'августа',
                9: 'сентября', 10: 'октября', 11: 'ноября', 12: 'декабря'
            }
            
            # Время сохранено в базе данных в часовом поясе Minsk
            # Конвертируем его в локальное время для отображения
            import pytz
            
            # Если время с timezone, конвертируем в Minsk для отображения
            if self.interview_datetime.tzinfo is not None:
                minsk_tz = pytz.timezone('Europe/Minsk')
                start_time = self.interview_datetime.astimezone(minsk_tz)
            else:
                # Если время без timezone, считаем его уже в Minsk
                start_time = self.interview_datetime
            
            # Получаем длительность скринингов из настроек вакансии
            screening_duration = self.get_screening_duration()
            end_time = start_time + timedelta(minutes=screening_duration)
            
            # Форматируем дату и время
            weekday = weekdays_ru.get(start_time.weekday(), '')
            day = start_time.day
            month = months_ru.get(start_time.month, '')
            start_time_str = start_time.strftime('%H:%M')
            end_time_str = end_time.strftime('%H:%M')
            
            return f"{weekday}, {day} {month}⋅{start_time_str}–{end_time_str}"
            
        except Exception as e:
            print(f"❌ Ошибка форматирования даты: {e}")
            return f"{self.interview_datetime.strftime('%d.%m.%Y %H:%M')}"
    
    def get_candidate_system_url(self):
        """Возвращает ссылку на кандидата в нашей системе"""
        try:
            account_id = self._get_user_account_id()
            if account_id and self.candidate_id:
                return f"http://127.0.0.1:8000/huntflow/accounts/{account_id}/applicants/{self.candidate_id}/"
            return None
        except Exception as e:
            print(f"❌ Ошибка получения ссылки на кандидата: {e}")
            return None
    
    def _generate_calendar_event_title(self):
        """Генерирует название календарного события: [Заголовок инвайтов] [Фамилия Имя]"""
        try:
            from apps.vacancies.models import Vacancy
            
            # Получаем заголовок инвайтов из вакансии
            invite_title = ""
            if self.vacancy_id:
                try:
                    vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                    invite_title = vacancy.invite_title
                except Vacancy.DoesNotExist:
                    pass
            
            # Если заголовок инвайтов не найден, используем название вакансии
            if not invite_title:
                invite_title = self.vacancy_title or "Интервью"
            
            # Убираем лишние символы | из заголовка
            invite_title = invite_title.strip().rstrip('|').strip()
            
            # Формируем название события: [Заголовок инвайтов] | [Фамилия Имя]
            event_title = f"{invite_title} | {self.candidate_name}"
            
            print(f"📅 Сгенерировано название события: {event_title}")
            return event_title
            
        except Exception as e:
            print(f"❌ Ошибка генерации названия события: {e}")
            # Fallback к простому названию
            return f"Интервью: {self.candidate_name} - {self.vacancy_title}"
    
    def _get_user_account_id(self):
        """Получает реальный account_id пользователя из Huntflow"""
        try:
            # Сначала пытаемся извлечь account_id из URL кандидата
            if self.candidate_url:
                import re
                # Ищем org{account_id} в URL
                org_match = re.search(r'/my/org(\d+)#/', self.candidate_url)
                if org_match:
                    account_id = org_match.group(1)
                    print(f"🔍 Извлечен account_id из URL кандидата: {account_id}")
                    return account_id
            
            # Если не удалось извлечь из URL, получаем из API
            from apps.huntflow.services import HuntflowService
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if accounts and 'items' in accounts and accounts['items']:
                account_id = accounts['items'][0]['id']
                print(f"🔍 Получен account_id из API: {account_id}")
                return account_id
            else:
                print(f"⚠️ Не удалось получить account_id, используем fallback")
                return '694'  # Fallback
                
        except Exception as e:
            print(f"❌ Ошибка получения account_id: {e}")
            return '694'  # Fallback

    def _generate_huntflow_candidate_link(self):
        """Генерирует ссылку на кандидата в Huntflow"""
        try:
            if not self.candidate_url:
                return None
            
            # Парсим URL кандидата для извлечения параметров
            # Формат prod: https://huntflow.ru/my/{account_nick}#/vacancy/[vacancy_id]/filter/[status]/id/[candidate_id]
            # Формат sandbox: https://sandbox.huntflow.dev/my/org{account_id}#/vacancy/[vacancy_id]/filter/[status]/id/[candidate_id]
            import re
            
            # Извлекаем vacancy_id и candidate_id из URL
            vacancy_match = re.search(r'/vacancy/(\d+)/', self.candidate_url)
            candidate_match = re.search(r'/id/(\d+)', self.candidate_url)
            
            if vacancy_match and candidate_match:
                vacancy_id = vacancy_match.group(1)
                candidate_id = candidate_match.group(1)
                
                # Получаем данные аккаунта пользователя из API
                from apps.huntflow.services import HuntflowService
                huntflow_service = HuntflowService(self.user)
                accounts = huntflow_service.get_accounts()
                
                if accounts and 'items' in accounts and accounts['items']:
                    account_data = accounts['items'][0]
                    account_id = account_data.get('id')
                    account_nick = account_data.get('nick', '')
                    
                    # Формируем ссылку в зависимости от активной системы
                    if self.user.active_system == 'prod':
                        # Для прода используем nickname
                        huntflow_link = f"https://huntflow.ru/my/{account_nick}#/vacancy/{vacancy_id}/filter/workon/id/{candidate_id}"
                    else:
                        # Для sandbox используем account_id
                        huntflow_link = f"https://sandbox.huntflow.dev/my/org{account_id}#/vacancy/{vacancy_id}/filter/workon/id/{candidate_id}"
                    
                    print(f"🔗 Сгенерирована ссылка на Huntflow ({self.user.active_system}): {huntflow_link}")
                    return huntflow_link
                else:
                    print(f"⚠️ Не удалось получить данные аккаунта из API")
                    return None
            else:
                print(f"⚠️ Не удалось извлечь параметры из URL кандидата: {self.candidate_url}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка генерации ссылки на Huntflow: {e}")
            return None
    
    def delete_calendar_event(self):
        """Удаляет событие из Google Calendar"""
        try:
            if not self.calendar_event_id:
                print("⚠️ ID события календаря не найден, пропускаем удаление")
                return True
            
            from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
            
            # Проверяем, есть ли у пользователя настроенный Google OAuth
            oauth_service = GoogleOAuthService(self.user)
            oauth_account = oauth_service.get_oauth_account()
            
            if not oauth_account:
                print("❌ Google OAuth не настроен, не можем удалить событие из календаря")
                return False
            
            # Создаем сервис для работы с Google Calendar
            calendar_service = GoogleCalendarService(oauth_service)
            
            # Удаляем событие
            success = calendar_service.delete_event(self.calendar_event_id)
            
            if success:
                print(f"✅ Событие календаря удалено: {self.calendar_event_id}")
            else:
                print(f"❌ Не удалось удалить событие календаря: {self.calendar_event_id}")
            
            return success
            
        except Exception as e:
            print(f"❌ Ошибка удаления события календаря: {str(e)}")
            return False
    
    
    def update_candidate_status_to_tech_screening(self):
        """Обновление статуса кандидата на Tech Screening в Huntflow"""
        try:
            print(f"[TECH_SCREENING] Начинаем обновление статуса кандидата {self.candidate_id}")
            
            from apps.huntflow.services import HuntflowService
            from apps.vacancies.models import Vacancy
            from datetime import datetime, timezone, timedelta
            import re

            print(f"[TECH_SCREENING] Импорты выполнены успешно")

            # Получаем account_id из Huntflow API
            service = HuntflowService(self.user)
            accounts = service.get_accounts()
            if not accounts or 'items' not in accounts or len(accounts['items']) == 0:
                print("[TECH_SCREENING] Не удалось получить account_id")
                return False
            
            account_id = accounts['items'][0]['id']
            print(f"[TECH_SCREENING] Получен account_id: {account_id}")

            # Получаем статус из настроек вакансии
            tech_screening_status_id = None
            
            try:
                # Пытаемся получить вакансию из локальной БД
                vacancy = Vacancy.objects.filter(external_id=str(self.vacancy_id)).first()
                
                if vacancy and vacancy.tech_screening_stage:
                    tech_screening_status_id = int(vacancy.tech_screening_stage)
                    print(f"🔍 TECH_SCREENING: Используем статус из вакансии: {tech_screening_status_id}")
                else:
                    print(f"⚠️ TECH_SCREENING: Этап не настроен в вакансии, ищем по названию")
                    
                    # Fallback: ищем по названию "Tech Screening"
                    print(f"[TECH_SCREENING] Запрашиваем статусы вакансий...")
                    statuses = service.get_vacancy_statuses(account_id)
                    print(f"[TECH_SCREENING] Получены статусы: {statuses}")
                    
                    if statuses and 'items' in statuses:
                        print(f"[TECH_SCREENING] Ищем статус Tech Screening среди {len(statuses['items'])} статусов")
                        for status in statuses['items']:
                            status_name = status.get('name', '')
                            print(f"[TECH_SCREENING] Проверяем статус: '{status_name}'")
                            if status_name.lower() == 'tech screening':
                                tech_screening_status_id = status.get('id')
                                print(f"🔍 TECH_SCREENING: Найден статус Tech Screening с ID {tech_screening_status_id}")
                                break
            except Exception as e:
                print(f"⚠️ TECH_SCREENING: Ошибка получения этапа из вакансии: {e}")
                # Fallback к старой логике
                statuses = service.get_vacancy_statuses(account_id)
                if statuses and 'items' in statuses:
                    for status in statuses['items']:
                        if status.get('name', '').lower() == 'tech screening':
                            tech_screening_status_id = status.get('id')
                            break
            
            if not tech_screening_status_id:
                print(f"⚠️ TECH_SCREENING: Статус Tech Screening не найден, используем fallback ID")
                tech_screening_status_id = 3459  # Fallback ID

            # Формируем комментарий в формате "Четверг, 25 сентября⋅11:00–11:45"
            comment = self.get_formatted_interview_datetime()
            print(f"[TECH_SCREENING] Кандидат: {self.candidate_id} -> Tech Screening")
            print(f"[TECH_SCREENING] Комментарий: {comment}")
            print(f"[TECH_SCREENING] Используем статус ID: {tech_screening_status_id}")

            print(f"[TECH_SCREENING] Вызываем update_applicant_status...")
            result = service.update_applicant_status(
                account_id=account_id,
                applicant_id=int(self.candidate_id),
                status_id=tech_screening_status_id,
                comment=comment,
                vacancy_id=int(self.vacancy_id) if self.vacancy_id else None
            )
            print(f"[TECH_SCREENING] Результат update_applicant_status: {result}")

            if result:
                print(f"[TECH_SCREENING] Успешно обновлен статус на Tech Screening")
                return True
            else:
                print(f"[TECH_SCREENING] Ошибка при обновлении статуса")
                return False

        except Exception as e:
            print(f"[TECH_SCREENING] Исключение: {str(e)}")
            import traceback
            print(f"[TECH_SCREENING] Traceback: {traceback.format_exc()}")
            return False

    def _update_candidate_status_to_tech_screening(self):
        """Обновляет статус кандидата на Tech Screening и добавляет комментарий с датой/временем"""
        try:
            from apps.huntflow.services import HuntflowService
            from apps.vacancies.models import Vacancy
            from datetime import datetime, timezone, timedelta
            import re
            
            # Получаем account_id из Huntflow API
            service = HuntflowService(self.user)
            accounts = service.get_accounts()
            if not accounts or 'items' not in accounts or len(accounts['items']) == 0:
                print("❌ Не удалось получить account_id для обновления статуса")
                return False
            
            account_id = accounts['items'][0]['id']
            
            # ID статуса Tech Screening
            tech_screening_status_id = 3459
            
            # Формируем комментарий с красиво отформатированной датой/временем проведения встречи
            comment = self.get_formatted_interview_datetime()
            
            print(f"📝 Обновляем статус кандидата {self.candidate_id} на Tech Screening")
            print(f"📝 Комментарий: {comment}")
            
            # Обновляем статус кандидата
            result = service.update_applicant_status(
                account_id=account_id,
                applicant_id=int(self.candidate_id),
                status_id=tech_screening_status_id,
                comment=comment,
                vacancy_id=int(self.vacancy_id) if self.vacancy_id else None
            )
            
            if result:
                print(f"✅ Статус кандидата обновлен на Tech Screening")
                return True
            else:
                print(f"❌ Не удалось обновить статус кандидата")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка обновления статуса кандидата: {str(e)}")
            return False
    
    def get_google_drive_folder_url(self):
        """Возвращает ссылку на папку в Google Drive"""
        if not self.google_drive_folder_id:
            return None
        return f"https://drive.google.com/drive/folders/{self.google_drive_folder_id}"
    
    def get_google_drive_file_path(self):
        """Возвращает полный путь к файлу в Google Drive"""
        if not self.google_drive_folder_id or not self.google_drive_file_id:
            return None
        
        try:
            # Получаем настройки структуры папок пользователя
            from django.apps import apps
            ScorecardPathSettings = apps.get_model('google_oauth', 'ScorecardPathSettings')
            path_settings = ScorecardPathSettings.objects.get(user=self.user)
            
            # Подготавливаем данные для генерации пути
            sample_data = self._prepare_sample_data_for_path_generation()
            
            # Генерируем структуру папок и название файла
            folder_path, filename_base = path_settings.generate_folder_structure_and_filename(sample_data)
            
            # Получаем название scorecard из вакансии
            scorecard_title = "Scorecard"  # По умолчанию
            try:
                from apps.vacancies.models import Vacancy
                local_vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                scorecard_title = local_vacancy.scorecard_title
            except Vacancy.DoesNotExist:
                pass
            
            # Формируем полный путь к файлу
            full_filename = f"{filename_base} {scorecard_title}"
            full_path = f"{folder_path}/{full_filename}" if folder_path else full_filename
            
            return full_path
            
        except Exception as e:
            print(f"❌ Ошибка генерации пути к файлу: {e}")
            return f"Файл {self.google_drive_file_id}"
    
    def get_invitation_text(self):
        """Генерирует текст приглашения для копирования в буфер обмена"""
        try:
            # Получаем заголовок инвайтов из вакансии
            invite_title = ""
            if self.vacancy_id:
                try:
                    from apps.vacancies.models import Vacancy
                    vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                    invite_title = vacancy.invite_title
                except Vacancy.DoesNotExist:
                    pass
            
            # Если заголовок инвайтов не найден, используем название вакансии
            if not invite_title:
                invite_title = self.vacancy_title or "Tech Screening"
            
            # Убираем лишние символы | из заголовка
            invite_title = invite_title.strip().rstrip('|').strip()
            
            # Формируем название события: [Заголовок инвайтов] | [Фамилия Имя]
            event_title = f"{invite_title} | {self.candidate_name}"
            
            # Форматируем дату и время
            formatted_datetime = self.get_formatted_interview_datetime()
            
            # Получаем Google Meet ссылку
            meet_link = self.google_meet_url or ""
            
            # Получаем сопроводительный текст из вакансии
            invite_text = ""
            try:
                if self.vacancy_id:
                    from apps.vacancies.models import Vacancy
                    import re
                    
                    vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                    invite_text = vacancy.invite_text
                    
                    # Обрезаем текст после --- (для интервьюеров)
                    if '---' in invite_text:
                        invite_text = invite_text.split('---')[0].strip()
                    
                    # Получаем телеграм рекрутера и заменяем плейсхолдер
                    if vacancy.recruiter and vacancy.recruiter.telegram_username:
                        telegram_username = vacancy.recruiter.telegram_username
                        # Убираем @ если есть
                        if telegram_username.startswith('@'):
                            telegram_username = telegram_username[1:]
                        telegram_link = f"https://t.me/{telegram_username}"
                        
                        # Заменяем [телеграм рекрутера] на прямую ссылку
                        invite_text = re.sub(
                            r'\[телеграм рекрутера\]', 
                            telegram_link, 
                            invite_text, 
                            flags=re.IGNORECASE
                        )
            except Exception as e:
                print(f"⚠️ Ошибка получения данных вакансии для приглашения: {e}")
            
            # Формируем полный текст приглашения
            invitation_parts = [
                event_title,
                formatted_datetime,
                "Часовой пояс: Europe/Minsk"
            ]
            
            if meet_link:
                invitation_parts.append(meet_link)
            
            if invite_text:
                invitation_parts.append("")
                invitation_parts.append(invite_text)
            
            return "\n".join(invitation_parts)
            
        except Exception as e:
            print(f"❌ Ошибка генерации текста приглашения: {e}")
            return f"Ошибка генерации приглашения: {str(e)}"
    
    def analyze_time_with_gemini(self):
        """
        Анализирует время встречи с помощью Gemini AI на основе исходного текста и слотов календаря
        """
        try:
            from apps.gemini.logic.services import GeminiService
            from apps.vacancies.models import Vacancy
            from apps.google_oauth.services import GoogleCalendarService, GoogleOAuthService
            import json
            import re
            from datetime import datetime, timedelta
            import pytz
            
            # Проверяем, что у нас есть API ключ Gemini
            if not self.user.gemini_api_key:
                return False, "API ключ Gemini не настроен в профиле пользователя"
            
            # Проверяем, что есть исходные данные
            if not self.original_form_data:
                return False, "Нет исходных данных из формы для анализа"
            
            # Получаем промпт из приложения vacancies
            try:
                vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
                # Поле invite_prompt удалено из модели Vacancy
                return False, f"Метод analyze_time_with_gemini устарел - поле invite_prompt удалено из модели Vacancy"
            except Vacancy.DoesNotExist:
                return False, f"Вакансия с ID {self.vacancy_id} не найдена в локальной базе данных"
            
            # Убираем URL из исходного текста
            text_without_url = self._remove_url_from_text(self.original_form_data)
            
            # Получаем временные слоты используя существующую логику календаря
            try:
                oauth_service = GoogleOAuthService(self.user)
                calendar_service = GoogleCalendarService(oauth_service)
                events_data = calendar_service.get_events(days_ahead=15)  # 2 недели + 1 день для безопасности
                
                print(f"🤖 CALENDAR_DEBUG: Получено событий календаря: {len(events_data) if events_data else 0}")
                if events_data:
                    print(f"🤖 CALENDAR_DEBUG: Первые 3 события: {events_data[:3]}")
                
                if not events_data:
                    print(f"🤖 CALENDAR_DEBUG: События календаря не получены - используем fallback логику")
                    events_data = []
                
                # Формируем временные слоты в простом JSON формате
                time_slots = self._calculate_time_slots(events_data)
                print(f"🤖 GEMINI_SLOTS: Временные слоты для Gemini: {time_slots}")
                
            except Exception as e:
                print(f"🤖 CALENDAR_DEBUG: Ошибка получения событий: {e}")
                time_slots = {}
            
            # Проверяем, есть ли в тексте временные указания
            if not self._has_time_indicators(text_without_url):
                print(f"🤖 TIME_CHECK: В тексте нет временных указаний - используем автоматический выбор ближайшего слота")
                # Если нет временных указаний, автоматически выбираем ближайший доступный слот
                fallback_time = self._get_fallback_time(time_slots, current_date)
                if fallback_time:
                    self.gemini_suggested_datetime = fallback_time
                    print(f"🤖 AUTO_SLOT: Автоматически выбран слот: {fallback_time}")
                    return True, "Время автоматически выбрано из доступных слотов"
                else:
                    return False, "Нет доступных временных слотов в календаре"
            
            # Получаем текущую дату
            minsk_tz = pytz.timezone('Europe/Minsk')
            current_date = datetime.now(minsk_tz)
            
            # Формируем промпт для Gemini (метод устарел)
            system_prompt = f"""
Метод analyze_time_with_gemini устарел - поле invite_prompt удалено из модели Vacancy

Данные для анализа:
- user_text: "{text_without_url}"
- current_datetime: "{current_date.strftime('%d.%m.%Y %H:%M')}"
- specialist_slots: {json.dumps(time_slots, ensure_ascii=False, indent=2)}

ВАЖНО: Если в user_text нет явных указаний времени, выбери наиболее подходящее время из доступных слотов специалиста, начиная с ближайшей даты.

КРИТИЧЕСКИ ВАЖНО: 
1. Верни ТОЛЬКО JSON в формате {{"suggested_datetime": "DD.MM.YYYY HH:MM"}}
2. Дата должна быть в формате ДД.ММ.ГГГГ (например: 25.09.2025)
3. Время должно быть в формате ЧЧ:ММ (например: 14:30)
4. НЕ добавляй никаких объяснений, комментариев или дополнительного текста
5. НЕ используй markdown форматирование
6. НЕ заключай ответ в блоки кода
7. Если нет подходящих слотов, верни {{"suggested_datetime": "None"}}

Пример правильного ответа:
{{"suggested_datetime": "25.09.2025 14:30"}}
"""
            
            print(f"🤖 GEMINI_PROMPT: Полный промпт для Gemini:")
            print(f"🤖 GEMINI_PROMPT: {system_prompt}")
            print(f"🤖 GEMINI_PROMPT: Конец промпта")
            
            # Отправляем запрос к Gemini
            gemini_service = GeminiService(self.user.gemini_api_key)
            success, response, metadata = gemini_service.generate_content(system_prompt)
            
            if not success:
                return False, f"Ошибка Gemini AI: {response}"
            
            print(f"🤖 GEMINI_RESPONSE: Ответ от Gemini:")
            print(f"🤖 GEMINI_RESPONSE: {response}")
            print(f"🤖 GEMINI_RESPONSE: Конец ответа")
            
            # Очищаем ответ от возможных markdown блоков и лишних символов
            if response:
                # Убираем markdown блоки кода
                response = re.sub(r'```json\s*', '', response)
                response = re.sub(r'```\s*', '', response)
                response = re.sub(r'`\s*', '', response)
                # Убираем лишние пробелы и переносы строк
                response = response.strip()
                print(f"🤖 GEMINI_RESPONSE_CLEANED: Очищенный ответ: {response}")
            
            # Парсим ответ от Gemini
            try:
                print(f"🤖 GEMINI_PARSE_DEBUG: Начинаем парсинг ответа длиной {len(response)} символов")
                print(f"🤖 GEMINI_PARSE_DEBUG: Первые 200 символов ответа: {response[:200]}")
                
                # Очищаем ответ от лишних символов
                cleaned_response = response.strip()
                
                # Пытаемся найти время в разных форматах
                datetime_patterns = [
                    # JSON формат с кавычками
                    r'"suggested_datetime":\s*"(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})"',
                    # JSON формат без кавычек
                    r'suggested_datetime["\s]*:\s*["\s]*(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})',
                    # Просто дата и время в формате DD.MM.YYYY HH:MM
                    r'(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})',
                    # Альтернативные форматы даты
                    r'(\d{1,2}\.\d{1,2}\.\d{4}\s+\d{1,2}:\d{2})',
                    # Формат с тире
                    r'(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})',
                    # Формат с слешами
                    r'(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2})',
                ]
                
                suggested_datetime = None
                matched_pattern = None
                
                for i, pattern in enumerate(datetime_patterns):
                    print(f"🤖 GEMINI_PARSE_DEBUG: Проверяем паттерн {i+1}: {pattern}")
                    datetime_match = re.search(pattern, cleaned_response)
                    if datetime_match:
                        suggested_datetime = datetime_match.group(1)
                        matched_pattern = pattern
                        print(f"🤖 GEMINI_PARSE_DEBUG: Найдено совпадение с паттерном {i+1}: {suggested_datetime}")
                        
                        # Проверяем, не вернул ли Gemini "None"
                        if suggested_datetime is None or suggested_datetime == "None" or suggested_datetime == "null":
                            print(f"🤖 GEMINI_PARSE_INFO: Gemini вернул None - нет подходящих временных слотов")
                            return False, "Gemini не смог найти подходящее время для встречи в доступных слотах"
                        
                        break
                
                if not suggested_datetime:
                    print(f"🤖 GEMINI_PARSE_ERROR: Не удалось найти время в ответе")
                    print(f"🤖 GEMINI_PARSE_ERROR: Полный ответ: {response}")
                    print(f"🤖 GEMINI_PARSE_ERROR: Очищенный ответ: {cleaned_response}")
                    
                    # Попробуем парсить как JSON
                    try:
                        import json
                        json_data = json.loads(cleaned_response)
                        if isinstance(json_data, dict) and 'suggested_datetime' in json_data:
                            suggested_datetime = json_data['suggested_datetime']
                            print(f"🤖 GEMINI_PARSE_DEBUG: Найдено время через JSON парсинг: {suggested_datetime}")
                            
                            # Проверяем, не вернул ли Gemini "None"
                            if suggested_datetime is None or suggested_datetime == "None" or suggested_datetime == "null":
                                print(f"🤖 GEMINI_PARSE_INFO: Gemini вернул None - пробуем fallback логику")
                                # Пробуем fallback - выбираем ближайший доступный слот
                                fallback_time = self._get_fallback_time(time_slots, current_date)
                                if fallback_time:
                                    suggested_datetime = fallback_time
                                    print(f"🤖 GEMINI_FALLBACK: Выбран fallback слот: {suggested_datetime}")
                                else:
                                    return False, "Gemini не смог найти подходящее время для встречи в доступных слотах"
                        else:
                            print(f"🤖 GEMINI_PARSE_ERROR: JSON не содержит поле suggested_datetime: {json_data}")
                    except json.JSONDecodeError as e:
                        print(f"🤖 GEMINI_PARSE_ERROR: Не удалось распарсить как JSON: {e}")
                    
                    # Если JSON парсинг не помог, попробуем найти любые цифры, которые могут быть датой
                    if not suggested_datetime:
                        all_numbers = re.findall(r'\d+', cleaned_response)
                        print(f"🤖 GEMINI_PARSE_ERROR: Все числа в ответе: {all_numbers}")
                        
                        # Попробуем найти дату в формате YYYY-MM-DD или DD.MM.YYYY
                        date_candidates = re.findall(r'\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}|\d{1,2}\.\d{1,2}\.\d{4}', cleaned_response)
                        time_candidates = re.findall(r'\d{1,2}:\d{2}', cleaned_response)
                        print(f"🤖 GEMINI_PARSE_ERROR: Кандидаты на дату: {date_candidates}")
                        print(f"🤖 GEMINI_PARSE_ERROR: Кандидаты на время: {time_candidates}")
                        
                        if date_candidates and time_candidates:
                            # Попробуем скомбинировать дату и время
                            candidate_datetime = f"{date_candidates[0]} {time_candidates[0]}"
                            print(f"🤖 GEMINI_PARSE_DEBUG: Попытка использовать комбинацию: {candidate_datetime}")
                            suggested_datetime = candidate_datetime
                    
                    if not suggested_datetime:
                        return False, "Gemini не вернул время в требуемом формате"
                
                # Валидируем найденную дату
                try:
                    from datetime import datetime
                    parsed_date = None
                    
                    # Список возможных форматов даты
                    date_formats = [
                        '%d.%m.%Y %H:%M',      # 25.09.2025 14:30
                        '%d-%m-%Y %H:%M',      # 25-09-2025 14:30
                        '%d/%m/%Y %H:%M',      # 25/09/2025 14:30
                        '%Y-%m-%d %H:%M',      # 2025-09-25 14:30
                        '%d.%m.%Y %H:%M:%S',   # 25.09.2025 14:30:00
                        '%d-%m-%Y %H:%M:%S',   # 25-09-2025 14:30:00
                        '%d/%m/%Y %H:%M:%S',   # 25/09/2025 14:30:00
                        '%Y-%m-%d %H:%M:%S',   # 2025-09-25 14:30:00
                    ]
                    
                    for date_format in date_formats:
                        try:
                            parsed_date = datetime.strptime(suggested_datetime, date_format)
                            print(f"🤖 GEMINI_PARSE_DEBUG: Дата распарсена с форматом {date_format}: {parsed_date}")
                            break
                        except ValueError:
                            continue
                    
                    if not parsed_date:
                        print(f"🤖 GEMINI_PARSE_ERROR: Не удалось распарсить дату: {suggested_datetime}")
                        return False, f"Неверный формат даты в ответе Gemini: {suggested_datetime}"
                    
                    # Проверяем, что дата не в прошлом
                    current_time = datetime.now()
                    if parsed_date < current_time:
                        print(f"🤖 GEMINI_PARSE_WARNING: Предложенная дата в прошлом: {parsed_date}")
                        # Не возвращаем ошибку, просто предупреждаем
                    
                except Exception as e:
                    print(f"🤖 GEMINI_PARSE_ERROR: Ошибка валидации даты: {str(e)}")
                    return False, f"Ошибка валидации даты: {str(e)}"
                
                # Сохраняем результат
                self.gemini_suggested_datetime = suggested_datetime
                print(f"🤖 GEMINI_PARSE_SUCCESS: Время сохранено: {suggested_datetime}")
                return True, "Время успешно проанализировано с помощью Gemini AI"
                
            except Exception as e:
                print(f"🤖 GEMINI_PARSE_ERROR: Ошибка парсинга ответа: {str(e)}")
                print(f"🤖 GEMINI_PARSE_ERROR: Ответ, вызвавший ошибку: {response}")
                return False, f"Ошибка обработки ответа от Gemini: {str(e)}"
                
        except Exception as e:
            return False, f"Ошибка анализа времени с Gemini: {str(e)}"
    
    def analyze_time_with_parser(self):
        """
        Расширенный анализ времени с помощью улучшенного парсера
        Возвращает (success: bool, message: str)
        
        Особенности:
        - Поддержка всех форматов из библиотеки date-time-formats.md
        - Автоматическое исправление опечаток и раскладки
        - Многоуровневая валидация
        - Интеграция с промптом из вакансии
        - Генерация альтернативных слотов
        """
        try:
            # Импорт расширенного парсера
            from .enhanced_datetime_parser import parse_datetime_with_validation
            from datetime import datetime
            import pytz

            print(f"🔍 [ENHANCED_PARSER] Анализируем текст пользователя {self.user.username}")

            # Проверяем наличие исходных данных
            if not self.original_form_data:
                return False, "Отсутствуют исходные данные для анализа"

            # Очищаем текст от URL
            text_without_url = self._remove_url_from_text(self.original_form_data)
            print(f"🔍 [ENHANCED_PARSER] Текст для анализа: {text_without_url[:100]}...")

            # Получаем существующие бронирования из календаря
            existing_bookings = self._get_existing_bookings()

            # Используем расширенный парсер с валидацией (БЕЗ промпта из вакансии)
            result = parse_datetime_with_validation(
                text=text_without_url,
                user=self.user,  # Передаем пользователя для получения рабочих часов
                existing_bookings=existing_bookings,
                vacancy_prompt=None,  # Промпт НЕ используется в парсере
                timezone_name='Europe/Minsk'
            )

            if result['success']:
                # Сохраняем результат парсинга
                self.gemini_suggested_datetime = result['parsed_datetime']
                
                # Логируем детальную информацию
                print(f"✅ [ENHANCED_PARSER] Определена дата/время: {self.gemini_suggested_datetime}")
                print(f"📊 [ENHANCED_PARSER] Уверенность: {result['confidence']:.2f}")
                print(f"🔧 [ENHANCED_PARSER] Исправлений: {len(result['corrections'])}")
                print(f"✔️ [ENHANCED_PARSER] Валидация: {'Пройдена' if result['validation']['is_valid'] else 'Не пройдена'}")
                
                # Выводим исправления
                for correction in result['corrections']:
                    print(f"  🔧 {correction['type']}: {correction['original']} → {correction['corrected']}")
                
                # Выводим предупреждения
                for warning in result['validation'].get('warnings', []):
                    print(f"  ⚠️ {warning['description']}")
                
                # Выводим альтернативы
                if result['alternatives']:
                    print(f"📅 [ENHANCED_PARSER] Альтернативные слоты:")
                    for alt in result['alternatives'][:3]:
                        print(f"  - {alt['datetime']} (уверенность: {alt['confidence']:.2f})")
                
                return True, f"Дата и время успешно определены (уверенность: {result['confidence']:.0%})"
            else:
                print(f"❌ [ENHANCED_PARSER] Парсер не смог определить время, пробуем fallback")
                # Пытаемся найти fallback время из календаря
                fallback_time = self._get_fallback_time_from_calendar()
                if fallback_time:
                    self.gemini_suggested_datetime = fallback_time
                    print(f"✅ [ENHANCED_PARSER] Использовано резервное время: {fallback_time}")
                    return True, "Использовано резервное время из календаря"
                else:
                    return False, f"Парсер не смог определить дату/время: {result.get('error', 'Неизвестная ошибка')}"

        except Exception as e:
            print(f"❌ [ENHANCED_PARSER] Ошибка: {str(e)}")
            import traceback
            traceback.print_exc()
            return False, f"Ошибка парсера: {str(e)}"
    
    def _get_existing_bookings(self):
        """Получение существующих бронирований из календаря"""
        try:
            from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
            
            print("📅 [BOOKINGS] Получаем существующие бронирования...")
            
            oauth_service = GoogleOAuthService(self.user)
            calendar_service = GoogleCalendarService(oauth_service)
            events_data = calendar_service.get_events(days_ahead=30)
            
            if events_data:
                print(f"✅ [BOOKINGS] Найдено событий: {len(events_data)}")
                return events_data
            else:
                print("⚠️ [BOOKINGS] Нет событий в календаре")
                return []
                
        except Exception as e:
            print(f"⚠️ [BOOKINGS] Ошибка получения бронирований: {e}")
            return []

    def _get_fallback_time_from_calendar(self):
        """
        Получение резервного времени из календарных слотов
        """
        try:
            from apps.google_oauth.services import GoogleOAuthService, GoogleCalendarService
            from datetime import datetime, timedelta
            import pytz

            print("[FALLBACK DEBUG] Получаем события календаря...")

            # Получаем события календаря
            oauth_service = GoogleOAuthService(self.user)
            calendar_service = GoogleCalendarService(oauth_service)
            events_data = calendar_service.get_events(days_ahead=15)

            if not events_data:
                print("[FALLBACK DEBUG] Нет событий в календаре")
                return None

            # Вычисляем доступные слоты
            time_slots = self._calculate_time_slots(events_data)
            print(f"[FALLBACK DEBUG] Найдено слотов: {len(time_slots)}")

            if not time_slots:
                return None

            # Берем первый доступный слот
            minsk_tz = pytz.timezone('Europe/Minsk')
            current_date = datetime.now(minsk_tz)

            for i in range(14):  # Проверяем 2 недели вперед
                check_date = current_date + timedelta(days=i)
                if check_date.weekday() < 5:  # Только будни
                    date_str = check_date.strftime("%d.%m.%Y")
                    if date_str in time_slots and time_slots[date_str] != "—":
                        # Находим первое доступное время
                        available_slots = self._parse_available_slots(time_slots[date_str])
                        if available_slots:
                            fallback_time = f"{date_str} {available_slots[0]}"
                            print(f"[FALLBACK SUCCESS] Найден слот: {fallback_time}")
                            return fallback_time

            return None

        except Exception as e:
            print(f"[FALLBACK ERROR] {str(e)}")
            return None

    def _parse_available_slots(self, slots_text):
        """
        Парсинг доступных временных слотов из текста
        """
        import re

        if not slots_text or slots_text == "—":
            return []

        # Ищем время в формате HH:MM
        time_matches = re.findall(r'(\d{1,2}:\d{2})', slots_text)

        # Ищем время в формате HHMM или диапазоны HH-HH
        if not time_matches:
            hour_matches = re.findall(r'(\d{1,2})(?=\s*[-–]|\s*$)', slots_text)
            time_matches = [f"{hour}:00" for hour in hour_matches if 8 <= int(hour) <= 18]

        return time_matches[:3]  # Возвращаем максимум 3 слота
    
    def _remove_url_from_text(self, text):
        """Убирает URL из текста, оставляя только текст с временем"""
        import re
        # Убираем URL (http/https ссылки)
        text_without_url = re.sub(r'https?://[^\s]+', '', text)
        # Убираем лишние пробелы и переносы строк
        text_without_url = re.sub(r'\s+', ' ', text_without_url).strip()
        return text_without_url
    
    def _has_time_indicators(self, text):
        """Проверяет, есть ли в тексте указания времени для встречи"""
        import re
        
        # Паттерны для поиска дат, дней недели и времени
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # 2025-09-15
            r'\d{2}\.\d{2}\.\d{4}',  # 15.09.2025
            r'\d{2}/\d{2}/\d{4}',   # 15/09/2025
        ]
        
        time_patterns = [
            r'\d{1,2}:\d{2}',  # 14:00, 9:30
            r'\d{1,2}:\d{2}:\d{2}',  # 14:00:00
        ]
        
        weekdays = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
                    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                    'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
        
        meeting_indicators = [
            'встреча', 'интервью', 'собеседование', 'скрининг', 'время', 'дата',
            'когда', 'встретимся', 'поговорим', 'созвонимся', 'созвон',
            'встречаемся', 'договоримся', 'назначим', 'планируем',
            'meeting', 'interview', 'call', 'schedule'
        ]
        
        # Проверяем наличие дат
        has_date = any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)
        
        # Проверяем наличие времени
        has_time = any(re.search(pattern, text, re.IGNORECASE) for pattern in time_patterns)
        
        # Проверяем наличие дней недели
        has_weekday = any(day.lower() in text.lower() for day in weekdays)
        
        # Проверяем наличие индикаторов встречи
        has_meeting_indicators = any(indicator.lower() in text.lower() for indicator in meeting_indicators)
        
        print(f"🤖 TIME_CHECK: has_date = {has_date}, has_time = {has_time}, has_weekday = {has_weekday}, has_meeting_indicators = {has_meeting_indicators}")
        
        return has_date or has_time or has_weekday or has_meeting_indicators
    
    def _get_fallback_time(self, time_slots, current_date):
        """Выбирает ближайший доступный временной слот"""
        from datetime import datetime, timedelta
        import re
        
        if not time_slots:
            return None
        
        # Сортируем даты по возрастанию
        sorted_dates = sorted(time_slots.keys())
        
        for date_str in sorted_dates:
            # Пропускаем даты в прошлом
            try:
                slot_date = datetime.strptime(date_str, '%d.%m.%Y').date()
                if slot_date < current_date.date():
                    continue
            except ValueError:
                continue
            
            # Парсим временные слоты для этой даты
            slots_text = time_slots[date_str]
            print(f"🤖 FALLBACK_DEBUG: Анализируем слоты для {date_str}: {slots_text}")
            
            # Ищем первый доступный час (например, "11-17" -> 11:00)
            time_match = re.search(r'(\d{1,2})', slots_text)
            if time_match:
                hour = int(time_match.group(1))
                # Формируем время в формате DD.MM.YYYY HH:MM
                fallback_time = f"{date_str} {hour:02d}:00"
                print(f"🤖 FALLBACK_SUCCESS: Выбран слот {fallback_time}")
                return fallback_time
        
        return None
    
    def _calculate_time_slots(self, events_data):
        """
        Вычисляет временные слоты в формате: дата -> день недели, слоты
        """
        from datetime import datetime, timedelta
        import pytz
        
        minsk_tz = pytz.timezone('Europe/Minsk')
        now = datetime.now(minsk_tz)
        
        # Словарь для хранения слотов по датам
        time_slots = {}
        weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
        
        # Начинаем с завтрашнего дня (исключаем сегодня)
        start_date = now + timedelta(days=1)
        
        # Генерируем слоты на 2 недели (14 дней) начиная с завтрашнего дня
        for i in range(14):
            current_date = start_date + timedelta(days=i)
            
            # Пропускаем выходные
            if current_date.weekday() >= 5:  # 5=суббота, 6=воскресенье
                continue
            
            weekday = weekdays[current_date.weekday()]
            date_str = current_date.strftime('%d.%m.%Y')
            
            # Вычисляем доступные слоты для этого дня
            available_slots = self._calculate_available_slots_for_day(events_data, current_date)
            
            if available_slots and available_slots != 'Нет свободных слотов':
                time_slots[date_str] = f"{weekday}: {available_slots}"
        
        return time_slots
    
    def _calculate_available_slots_for_day(self, events_data, date):
        """Вычисляет доступные слоты для дня используя логику из calendar_events.html"""
        from datetime import datetime
        import pytz
        
        # Рабочие часы из настроек пользователя
        if hasattr(self.user, 'interview_start_time') and hasattr(self.user, 'interview_end_time'):
            if self.user.interview_start_time and self.user.interview_end_time:
                start_time = self.user.interview_start_time
                end_time = self.user.interview_end_time
                
                if isinstance(start_time, str):
                    # Если это строка, парсим её
                    from datetime import time
                    work_start_hour = time.fromisoformat(start_time).hour
                    work_end_hour = time.fromisoformat(end_time).hour
                else:
                    # Если это time объект
                    work_start_hour = start_time.hour
                    work_end_hour = end_time.hour
            else:
                # Fallback к захардкоженным значениям
                work_start_hour = 11
                work_end_hour = 18
        else:
            # Fallback к захардкоженным значениям
            work_start_hour = 11
            work_end_hour = 18
        
        # Создаем массив слотов по часам
        slots = []
        for hour in range(work_start_hour, work_end_hour):
            slots.append({
                'hour': hour,
                'is_occupied': False
            })
        
        # Получаем события на этот день
        day_events = [event for event in events_data if self._is_event_on_date(event, date)]
        print(f"🤖 SLOTS_DEBUG: Дата {date.strftime('%d.%m.%Y')}: найдено {len(day_events)} событий")
        for event in day_events:
            print(f"🤖 SLOTS_DEBUG: Событие: {event.get('summary', 'Без названия')} с {event.get('start', {}).get('dateTime', 'Нет времени')}")
        
        # Отмечаем занятые слоты
        for event in day_events:
            if event.get('start', {}).get('date'):  # Событие на весь день
                continue
            
            try:
                start_data = event.get('start', {})
                end_data = event.get('end', {})
                
                if 'dateTime' in start_data and 'dateTime' in end_data:
                    start_time_str = start_data['dateTime']
                    end_time_str = end_data['dateTime']
                    
                    # События уже в правильном часовом поясе (+03:00), не нужно конвертировать
                    event_start = datetime.fromisoformat(start_time_str)
                    event_end = datetime.fromisoformat(end_time_str)
                    
                    # Если событие в UTC (заканчивается на Z), конвертируем в Minsk
                    if start_time_str.endswith('Z'):
                        event_start = event_start.replace(tzinfo=pytz.UTC).astimezone(pytz.timezone('Europe/Minsk'))
                    if end_time_str.endswith('Z'):
                        event_end = event_end.replace(tzinfo=pytz.UTC).astimezone(pytz.timezone('Europe/Minsk'))
                    
                    print(f"🤖 SLOTS_DEBUG: Обрабатываем событие {event.get('summary', 'Без названия')} с {event_start.time()} до {event_end.time()}")
                    
                    # Отмечаем занятые слоты
                    for slot in slots:
                        slot_start = datetime(date.year, date.month, date.day, slot['hour'], 0, 0)
                        slot_end = datetime(date.year, date.month, date.day, slot['hour'] + 1, 0, 0)
                        
                        # Проверяем пересечение (минимум 30 минут)
                        overlap_start = max(slot_start, event_start.replace(tzinfo=None))
                        overlap_end = min(slot_end, event_end.replace(tzinfo=None))
                        overlap_duration = (overlap_end - overlap_start).total_seconds()
                        
                        if overlap_duration >= 30 * 60:  # 30 минут
                            slot['is_occupied'] = True
                            print(f"🤖 SLOTS_DEBUG: Слот {slot['hour']}:00-{slot['hour']+1}:00 занят событием {event.get('summary', 'Без названия')}")
            except Exception as e:
                continue
        
        # Формируем строку доступных слотов (как в JavaScript коде)
        available_ranges = []
        current_range_start = None
        
        for i, slot in enumerate(slots):
            if not slot['is_occupied']:
                if current_range_start is None:
                    current_range_start = slot['hour']
            else:
                if current_range_start is not None:
                    # Завершаем текущий диапазон
                    if current_range_start == slot['hour'] - 1:
                        available_ranges.append(str(current_range_start))
                    else:
                        # Добавляем +1 к последнему часу диапазона, так как слот означает время до следующего часа
                        available_ranges.append(f"{current_range_start}-{slot['hour']}")
                    current_range_start = None
        
        # Завершаем последний диапазон, если он есть
        if current_range_start is not None:
            last_slot = slots[-1]
            if current_range_start == last_slot['hour']:
                available_ranges.append(str(current_range_start))
            else:
                # Добавляем +1 к последнему часу, так как слот 17 означает время 17:00-18:00
                available_ranges.append(f"{current_range_start}-{last_slot['hour'] + 1}")
        
        if available_ranges:
            return ', '.join(available_ranges)
        else:
            # Если нет событий календаря, показываем все рабочие часы
            return f"{work_start_hour}-{work_end_hour - 1}"
    
    def _is_event_on_date(self, event, target_date):
        """Проверяет, происходит ли событие в указанную дату"""
        from datetime import datetime
        import pytz
        
        try:
            start_data = event.get('start', {})
            if 'dateTime' in start_data:
                start_time_str = start_data['dateTime']
                
                if start_time_str.endswith('Z'):
                    start_time_str = start_time_str[:-1] + '+00:00'
                
                event_start = datetime.fromisoformat(start_time_str)
                if event_start.tzinfo is None:
                    # Если нет информации о часовом поясе, считаем что это Minsk
                    event_start = pytz.timezone('Europe/Minsk').localize(event_start)
                else:
                    event_start = event_start.astimezone(pytz.timezone('Europe/Minsk'))
                
                return event_start.date() == target_date.date()
            elif 'date' in start_data:
                event_date = datetime.fromisoformat(start_data['date']).date()
                return event_date == target_date.date()
        except Exception as e:
            pass
        return False
    


class ScorecardPathSettings(models.Model):
    """Модель для настроек структуры папок при создании scorecard"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='scorecard_path_settings',
        verbose_name='Пользователь'
    )
    
    # Структура папок в JSON формате
    # Пример: [
    #   {"type": "text", "value": "scorecards"},
    #   {"type": "vacancy_title", "value": ""},
    #   {"type": "year_full", "value": ""},
    #   {"type": "month_num", "value": ""},
    #   {"type": "month_short_ru", "value": ""},
    #   {"type": "date", "value": ""},
    #   {"type": "month_full_ru", "value": ""},
    #   {"type": "weekday_short_ru", "value": ""},
    #   {"type": "candidate_last_name", "value": ""},
    #   {"type": "candidate_first_name", "value": ""},
    #   {"type": "candidate_middle_name", "value": ""}
    # ]
    folder_structure = models.JSONField(
        default=list,
        verbose_name='Структура папок',
        help_text='JSON структура папок для создания scorecard'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Настройки структуры папок scorecard'
        verbose_name_plural = 'Настройки структуры папок scorecard'
    
    def __str__(self):
        return f"Настройки структуры папок для {self.user.username}"
    
    def _parse_mixed_content(self, mixed_content, sample_data):
        """Парсит содержимое mixed типа и заменяет паттерны на реальные данные"""
        import re
        
        # Список доступных паттернов (поддерживаем и русские, и английские названия)
        pattern_mapping = {
            # Русские названия
            '[Название вакансии]': 'vacancy_title',
            '[ID вакансии]': 'vacancy_id', 
            '[Год (полный)]': 'year_full',
            '[Год (сокращенный)]': 'year_short',
            '[Месяц (номер)]': 'month_num',
            '[Месяц (полное название)]': 'month_full_ru',
            '[Месяц (сокращенное название)]': 'month_short_ru',
            '[День недели (полное название)]': 'weekday_full_ru',
            '[День недели (сокращение)]': 'weekday_short_ru',
            '[Дата]': 'date',
            '[День]': 'day',
            '[Фамилия кандидата]': 'candidate_last_name',
            '[Имя кандидата]': 'candidate_first_name',
            '[Отчество кандидата]': 'candidate_middle_name',
            '[ID кандидата]': 'candidate_id',
            # Английские названия (для совместимости)
            '[vacancy_title]': 'vacancy_title',
            '[vacancy_id]': 'vacancy_id',
            '[year_full]': 'year_full',
            '[year_short]': 'year_short',
            '[month_num]': 'month_num',
            '[month_full_ru]': 'month_full_ru',
            '[month_short_ru]': 'month_short_ru',
            '[month_short_en]': 'month_short_en',
            '[month_full_en]': 'month_full_en',
            '[weekday_full_ru]': 'weekday_full_ru',
            '[weekday_short_ru]': 'weekday_short_ru',
            '[weekday_short_en]': 'weekday_short_en',
            '[weekday_full_en]': 'weekday_full_en',
            '[week_short_ru]': 'week_short_ru',
            '[week_short_en]': 'week_short_en',
            '[week_full_ru]': 'week_full_ru',
            '[week_full_en]': 'week_full_en',
            '[date]': 'date',
            '[day]': 'day',
            '[candidate_last_name]': 'candidate_last_name',
            '[candidate_first_name]': 'candidate_first_name',
            '[candidate_middle_name]': 'candidate_middle_name',
            '[candidate_id]': 'candidate_id',
        }
        
        if not mixed_content or not mixed_content.strip():
            return ''
        
        # Сначала заменяем все паттерны в тексте
        result = mixed_content.strip()
        
        # Сортируем паттерны по длине (от длинных к коротким), чтобы избежать проблем с частичным совпадением
        sorted_patterns = sorted(pattern_mapping.keys(), key=len, reverse=True)
        
        for pattern in sorted_patterns:
            if pattern in result:
                pattern_type = pattern_mapping[pattern]
                pattern_value = sample_data.get(pattern_type, '')
                if pattern_value:
                    result = result.replace(pattern, str(pattern_value))
                else:
                    # Если значение не найдено, оставляем паттерн как есть
                    print(f"⚠️ PATTERN_REPLACE: Значение для паттерна '{pattern}' не найдено в sample_data")
        
        return result
    
    def get_default_structure(self):
        """Возвращает структуру папок по умолчанию"""
        return [
            {"type": "text", "value": "scorecards"},
            {"type": "vacancy_title", "value": ""},
            {"type": "year_full", "value": ""},
            {"type": "month_full_ru", "value": ""},
            {"type": "day", "value": ""},
            {"type": "weekday_full_ru", "value": ""},
            {"type": "candidate_first_name", "value": ""},
            {"type": "candidate_last_name", "value": ""}
        ]
    
    def get_available_patterns(self):
        """Возвращает список доступных паттернов"""
        return [
            {"type": "text", "label": "Произвольный текст", "example": "scorecards", "input_required": True},
            {"type": "date", "label": "Дата", "example": "08.09.2025", "input_required": False},
            {"type": "day", "label": "Только дата", "example": "08", "input_required": False},
            {"type": "week_short_en", "label": "Неделя сокращенно EN", "example": "Mon", "input_required": False},
            {"type": "week_short_ru", "label": "Неделя сокращенно RU", "example": "ПН", "input_required": False},
            {"type": "week_full_en", "label": "Неделя полностью EN", "example": "Monday", "input_required": False},
            {"type": "week_full_ru", "label": "Неделя полностью RU", "example": "Понедельник", "input_required": False},
            {"type": "month_num", "label": "Месяц числом", "example": "09", "input_required": False},
            {"type": "month_short_ru", "label": "Месяц сокращенно RU", "example": "сен", "input_required": False},
            {"type": "month_short_en", "label": "Месяц сокращенно EN", "example": "Sep", "input_required": False},
            {"type": "month_full_ru", "label": "Месяц полностью RU", "example": "сентябрь", "input_required": False},
            {"type": "month_full_en", "label": "Месяц полностью EN", "example": "September", "input_required": False},
            {"type": "weekday_short_ru", "label": "День недели сокращенный RU", "example": "ПН", "input_required": False},
            {"type": "weekday_short_en", "label": "День недели сокращенный EN", "example": "Mon", "input_required": False},
            {"type": "weekday_full_ru", "label": "День недели полный RU", "example": "Понедельник", "input_required": False},
            {"type": "weekday_full_en", "label": "День недели полный EN", "example": "Monday", "input_required": False},
            {"type": "year_short", "label": "Год сокращенный", "example": "25", "input_required": False},
            {"type": "year_full", "label": "Год полный", "example": "2025", "input_required": False},
            {"type": "candidate_last_name", "label": "Фамилия", "example": "Иванов", "input_required": False},
            {"type": "candidate_first_name", "label": "Имя", "example": "Иван", "input_required": False},
            {"type": "candidate_middle_name", "label": "Отчество", "example": "Иванович", "input_required": False},
            {"type": "candidate_id", "label": "ID кандидата", "example": "12345", "input_required": False},
            {"type": "vacancy_title", "label": "Вакансия", "example": "Frontend Engineer", "input_required": False},
            {"type": "vacancy_id", "label": "ID вакансии", "example": "3", "input_required": False}
        ]
    
    def generate_path_preview(self, sample_data=None):
        """Генерирует предварительный просмотр пути на основе текущей структуры"""
        if not self.folder_structure:
            return "Структура не определена"
        
        if not sample_data:
            # Используем данные по умолчанию для примера
            from datetime import datetime
            now = datetime.now()
            sample_data = {
                'date': now.strftime('%d.%m.%Y'),
                'day': now.strftime('%d'),
                'week_short_en': now.strftime('%a'),
                'week_short_ru': ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][now.weekday()],
                'week_full_en': now.strftime('%A'),
                'week_full_ru': ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][now.weekday()],
                'month_num': now.strftime('%m'),
                'month_short_ru': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][now.month-1],
                'month_short_en': now.strftime('%b'),
                'month_full_ru': ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][now.month-1],
                'month_full_en': now.strftime('%B'),
                'weekday_short_ru': ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][now.weekday()],
                'weekday_short_en': now.strftime('%a'),
                'weekday_full_ru': ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][now.weekday()],
                'weekday_full_en': now.strftime('%A'),
                'year_short': now.strftime('%y'),
                'year_full': now.strftime('%Y'),
                'candidate_last_name': 'Иванов',
                'candidate_first_name': 'Иван',
                'candidate_middle_name': 'Иванович',
                'candidate_id': '12345',
                'vacancy_title': 'Frontend Engineer (React)',
                'vacancy_id': '3'
            }
        
        path_parts = []
        for item in self.folder_structure:
            # Пропускаем элементы с данными кандидата - они не должны быть папками
            if item['type'] in ['candidate_last_name', 'candidate_first_name', 'candidate_middle_name', 'candidate_id']:
                continue
            if item['type'] == 'text':
                path_parts.append(item.get('value', ''))
            elif item['type'] == 'mixed':
                # Для mixed типов парсим содержимое
                mixed_content = item.get('value', '')
                if mixed_content:
                    # Проверяем, содержит ли mixed контент данные кандидата
                    if any(candidate_field in mixed_content for candidate_field in ['[candidate_last_name]', '[candidate_first_name]', '[candidate_middle_name]', '[candidate_id]']):
                        # Если содержит данные кандидата, пропускаем этот элемент
                        continue
                    parsed_value = self._parse_mixed_content(mixed_content, sample_data)
                    if parsed_value:
                        path_parts.append(parsed_value)
            else:
                # Для обычных типов (не text и не mixed) получаем значение из sample_data
                value = sample_data.get(item['type'], '')
                if value:
                    path_parts.append(str(value))
        
        return '/'.join(path_parts) if path_parts else "Путь не определен"
    
    def generate_folder_structure_and_filename(self, sample_data=None):
        """Генерирует структуру папок и название файла отдельно"""
        if not self.folder_structure:
            return "", "Файл не определен"
        
        if not sample_data:
            # Используем данные по умолчанию для примера
            from datetime import datetime
            now = datetime.now()
            sample_data = {
                'date': now.strftime('%d.%m.%Y'),
                'day': now.strftime('%d'),
                'week_short_en': now.strftime('%a'),
                'week_short_ru': ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][now.weekday()],
                'week_full_ru': ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][now.weekday()],
                'month_num': now.strftime('%m'),
                'month_short_ru': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][now.month-1],
                'month_short_en': now.strftime('%b'),
                'month_full_ru': ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][now.month-1],
                'month_full_en': now.strftime('%B'),
                'weekday_short_ru': ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][now.weekday()],
                'weekday_short_en': now.strftime('%a'),
                'weekday_full_ru': ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][now.weekday()],
                'weekday_full_en': now.strftime('%A'),
                'year_short': now.strftime('%y'),
                'year_full': now.strftime('%Y'),
                'candidate_last_name': 'Иванов',
                'candidate_first_name': 'Иван',
                'candidate_middle_name': 'Иванович',
                'candidate_id': '12345',
                'vacancy_title': 'Frontend Engineer (React)',
                'vacancy_id': '3'
            }
        
        folder_parts = []
        
        # ВСЕ элементы структуры папок - это папки, название файла генерируется отдельно
        # Исключаем элементы с данными кандидата из структуры папок
        for item in self.folder_structure:
            print(f"🔍 FOLDER_GEN: Обрабатываем элемент: type={item.get('type')}, value='{item.get('value')}'")
            
            # Пропускаем элементы с данными кандидата - они не должны быть папками
            if item['type'] in ['candidate_last_name', 'candidate_first_name', 'candidate_middle_name', 'candidate_id']:
                print(f"🔍 FOLDER_GEN: Пропускаем элемент с данными кандидата: {item['type']}")
                continue
                
            if item['type'] == 'text':
                value = item.get('value', '').strip()
                print(f"🔍 FOLDER_GEN: Text элемент: '{value}'")
            elif item['type'] == 'mixed':
                # Для mixed типов парсим содержимое
                mixed_content = item.get('value', '').strip()
                if mixed_content:
                    # Проверяем, содержит ли mixed контент данные кандидата
                    candidate_fields = ['[candidate_last_name]', '[candidate_first_name]', '[candidate_middle_name]', '[candidate_id]']
                    if any(candidate_field in mixed_content for candidate_field in candidate_fields):
                        # Если содержит данные кандидата, пропускаем этот элемент
                        print(f"🔍 FOLDER_GEN: Пропускаем mixed элемент с данными кандидата: '{mixed_content}'")
                        continue
                    value = self._parse_mixed_content(mixed_content, sample_data)
                    print(f"🔍 FOLDER_GEN: Mixed элемент: '{mixed_content}' -> '{value}'")
                else:
                    value = ''
                    print(f"🔍 FOLDER_GEN: Mixed элемент пустой")
            else:
                # Для обычных типов (не text и не mixed) получаем значение из sample_data
                value = sample_data.get(item['type'], '')
                if value:
                    value = str(value).strip()
                else:
                    value = ''
                print(f"🔍 FOLDER_GEN: Обычный элемент {item['type']}: '{value}'")
            
            if value:
                folder_parts.append(value)
                print(f"🔍 FOLDER_GEN: Добавлена папка: '{value}'")
            else:
                print(f"🔍 FOLDER_GEN: Пропускаем пустое значение")
        
        # Генерируем название файла отдельно на основе данных кандидата
        filename_parts = []
        
        # Добавляем фамилию и имя кандидата
        candidate_last_name = sample_data.get('candidate_last_name', '')
        candidate_first_name = sample_data.get('candidate_first_name', '')
        
        if candidate_last_name and candidate_first_name:
            filename_parts.append(f"{candidate_last_name} {candidate_first_name}")
        elif candidate_last_name:
            filename_parts.append(candidate_last_name)
        elif candidate_first_name:
            filename_parts.append(candidate_first_name)
        else:
            filename_parts.append("Кандидат")
        
        folder_path = '/'.join(folder_parts) if folder_parts else ""
        filename_base = ' '.join(filename_parts) if filename_parts else "Кандидат"
        
        return folder_path, filename_base
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Получает или создает настройки для пользователя"""
        settings, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'folder_structure': [
                    {"type": "text", "value": "scorecards"},
                    {"type": "vacancy_title", "value": ""},
                    {"type": "year_full", "value": ""},
                    {"type": "month_num", "value": ""},
                    {"type": "date", "value": ""},
                    {"type": "candidate_last_name", "value": ""},
                    {"type": "candidate_first_name", "value": ""}
                ]
            }
        )
        return settings
    
    def get_path_preview(self):
        """Возвращает предварительный просмотр пути папки"""
        try:
            folder_path, filename_base = self.generate_folder_and_filename_path({
                'vacancy_title': 'Название вакансии',
                'year_full': '2025',
                'month_num': '09',
                'date': '15',
                'candidate_last_name': 'Фамилия',
                'candidate_first_name': 'Имя'
            })
            return folder_path if folder_path else "scorecards/Название вакансии/2025/09/15/Фамилия Имя"
        except Exception:
            return "scorecards/Название вакансии/2025/09/15/Фамилия Имя"


class SlotsSettings(models.Model):
    """Модель для настроек дополнительного текста к слотам"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='slots_settings',
        verbose_name='Пользователь'
    )
    
    # Тексты перед слотами
    current_week_prefix = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Текст перед слотами текущей недели',
        help_text='Дополнительный текст, добавляемый перед слотами текущей недели при копировании'
    )
    
    next_week_prefix = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Текст перед слотами следующей недели',
        help_text='Дополнительный текст, добавляемый перед слотами следующей недели при копировании'
    )
    
    all_slots_prefix = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Текст перед всеми слотами',
        help_text='Дополнительный текст, добавляемый в начало при копировании всех слотов'
    )
    
    separator_text = models.CharField(
        max_length=50,
        default='---',
        verbose_name='Разделитель между неделями',
        help_text='Текст, который разделяет текущую и следующую неделю при копировании всех слотов'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'Настройки слотов'
        verbose_name_plural = 'Настройки слотов'
    
    def __str__(self):
        return f"Настройки слотов для {self.user.username}"
    
    def to_dict(self):
        """Возвращает настройки в виде словаря для JavaScript"""
        return {
            'currentWeekPrefix': self.current_week_prefix or '',
            'nextWeekPrefix': self.next_week_prefix or '',
            'allSlotsPrefix': self.all_slots_prefix or '',
            'separatorText': self.separator_text or '---'
        }
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Получает или создает настройки для пользователя"""
        settings, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'current_week_prefix': '',
                'next_week_prefix': '',
                'all_slots_prefix': '',
                'separator_text': '---'
            }
        )
        return settings


class HRScreening(models.Model):
    """Модель для хранения данных HR-скрининга"""
    
    # Основная информация
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='hr_screenings',
        verbose_name='Пользователь'
    )
    
    # Исходные данные
    input_data = models.TextField(
        verbose_name='Исходные данные',
        help_text='Текст, введенный пользователем для HR-скрининга'
    )
    
    # Извлеченная информация из URL
    candidate_url = models.URLField(
        blank=True,
        verbose_name='Ссылка на кандидата',
        help_text='Ссылка на кандидата в Huntflow'
    )
    candidate_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='ID кандидата'
    )
    vacancy_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='ID вакансии'
    )
    
    # Информация о кандидате и вакансии
    candidate_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Имя кандидата'
    )
    candidate_grade = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Уровень кандидата'
    )
    vacancy_title = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Название вакансии'
    )
    
    # Данные от Gemini AI
    gemini_analysis = models.TextField(
        blank=True,
        verbose_name='Анализ от Gemini AI',
        help_text='JSON ответ от Gemini AI с данными для обновления кандидата'
    )
    
    # Извлеченная информация о зарплате
    extracted_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Извлеченная зарплата',
        help_text='Первое числовое значение из поля Зарплата'
    )
    salary_currency = models.CharField(
        max_length=3,
        default='USD',
        verbose_name='Валюта зарплаты',
        help_text='Валюта зарплаты (по умолчанию USD)'
    )
    
    # Определенный грейд
    determined_grade = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Определенный грейд',
        help_text='Грейд, определенный на основе зарплатных вилок'
    )
    huntflow_grade_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='ID уровня в Huntflow',
        help_text='ID уровня в системе Huntflow (соответствует грейду)'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'HR-скрининг'
        verbose_name_plural = 'HR-скрининги'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"HR-скрининг для {self.candidate_name} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"
    
    def _extract_url_from_text(self):
        """Извлекает URL кандидата из текста"""
        import re
        
        if not self.input_data:
            return False, "Исходные данные не найдены"
        
        # Паттерн для поиска URL
        url_pattern = r'https?://[^\s]+'
        urls = re.findall(url_pattern, self.input_data)
        
        # Ищем URL с huntflow и /vacancy/
        for url in urls:
            if 'huntflow' in url.lower() and '/vacancy/' in url:
                self.candidate_url = url
                return True, "URL успешно извлечен"
        
        return False, "URL кандидата не найден в тексте"
    
    def parse_candidate_url(self):
        """Извлекает ID кандидата и вакансии из URL"""
        import re
        
        if not self.candidate_url:
            return False, "URL кандидата не найден"
        
        # Паттерн для извлечения ID из URL
        # https://sandbox.huntflow.dev/my/org499#/vacancy/3/filter/workon/id/17
        # или https://huntflow.ru/my/org#/vacancy/123/filter/456/id/789
        pattern = r'/vacancy/(\d+)/.*?/id/(\d+)'
        match = re.search(pattern, self.candidate_url)
        
        if match:
            self.vacancy_id = match.group(1)
            self.candidate_id = match.group(2)
            return True, "URL успешно распарсен"
        else:
            return False, "Не удалось извлечь ID из URL"
    
    def get_candidate_info(self):
        """Получает информацию о кандидате из Huntflow API"""
        try:
            from apps.huntflow.services import HuntflowService
            
            print(f"🔍 HR_SCREENING_GET_CANDIDATE_INFO: Начинаем получение информации о кандидате {self.candidate_id}")
            
            # Получаем аккаунты пользователя
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if not accounts or 'items' not in accounts or not accounts['items']:
                print(f"❌ HR_SCREENING_GET_CANDIDATE_INFO: Нет доступных аккаунтов Huntflow")
                return False, "Нет доступных аккаунтов Huntflow"
            
            # Используем первый доступный аккаунт
            account_id = accounts['items'][0]['id']
            print(f"🔍 HR_SCREENING_GET_CANDIDATE_INFO: Используем аккаунт {account_id}")
            
            # Получаем информацию о кандидате (используем get_applicant)
            print(f"🔍 HR_SCREENING_GET_CANDIDATE_INFO: Запрашиваем данные кандидата {self.candidate_id} из аккаунта {account_id}")
            candidate_data = huntflow_service.get_applicant(account_id, int(self.candidate_id))
            
            print(f"🔍 HR_SCREENING_GET_CANDIDATE_INFO: Получены данные кандидата: {candidate_data}")
            
            if candidate_data:
                self.candidate_name = f"{candidate_data.get('first_name', '')} {candidate_data.get('last_name', '')}".strip()
                self.candidate_grade = self._normalize_level(candidate_data.get('grade', {}).get('name', ''))
                print(f"✅ HR_SCREENING_GET_CANDIDATE_INFO: Информация о кандидате получена: {self.candidate_name}")
                return True, "Информация о кандидате получена"
            else:
                print(f"❌ HR_SCREENING_GET_CANDIDATE_INFO: Не удалось получить информацию о кандидате")
                return False, "Не удалось получить информацию о кандидате"
                
        except Exception as e:
            print(f"❌ HR_SCREENING_GET_CANDIDATE_INFO: Ошибка при получении информации о кандидате: {str(e)}")
            return False, f"Ошибка при получении информации о кандидате: {str(e)}"
    
    def get_vacancy_info(self):
        """Получает информацию о вакансии из Huntflow API"""
        try:
            from apps.huntflow.services import HuntflowService
            
            print(f"🔍 HR_SCREENING_GET_VACANCY_INFO: Начинаем получение информации о вакансии {self.vacancy_id}")
            
            # Получаем аккаунты пользователя
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if not accounts or 'items' not in accounts or not accounts['items']:
                print(f"❌ HR_SCREENING_GET_VACANCY_INFO: Нет доступных аккаунтов Huntflow")
                return False, "Нет доступных аккаунтов Huntflow"
            
            # Используем первый доступный аккаунт
            account_id = accounts['items'][0]['id']
            print(f"🔍 HR_SCREENING_GET_VACANCY_INFO: Используем аккаунт {account_id}")
            
            # Получаем информацию о вакансии
            print(f"🔍 HR_SCREENING_GET_VACANCY_INFO: Запрашиваем данные вакансии {self.vacancy_id} из аккаунта {account_id}")
            vacancy_data = huntflow_service.get_vacancy(account_id, int(self.vacancy_id))
            
            print(f"🔍 HR_SCREENING_GET_VACANCY_INFO: Получены данные вакансии: {vacancy_data}")
            
            if vacancy_data:
                self.vacancy_title = vacancy_data.get('position', '')
                print(f"✅ HR_SCREENING_GET_VACANCY_INFO: Информация о вакансии получена: {self.vacancy_title}")
                return True, "Информация о вакансии получена"
            else:
                print(f"❌ HR_SCREENING_GET_VACANCY_INFO: Не удалось получить информацию о вакансии")
                return False, "Не удалось получить информацию о вакансии"
                
        except Exception as e:
            print(f"❌ HR_SCREENING_GET_VACANCY_INFO: Ошибка при получении информации о вакансии: {str(e)}")
            return False, f"Ошибка при получении информации о вакансии: {str(e)}"
    
    def get_candidate_fields_schema(self):
        """Получает схему полей кандидата из Huntflow API"""
        try:
            from apps.huntflow.services import HuntflowService
            
            print(f"🔍 HR_SCREENING_GET_FIELDS_SCHEMA: Получаем схему полей кандидата")
            
            # Получаем аккаунты пользователя
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if not accounts or 'items' not in accounts or not accounts['items']:
                print(f"❌ HR_SCREENING_GET_FIELDS_SCHEMA: Нет доступных аккаунтов Huntflow")
                return False, "Нет доступных аккаунтов Huntflow"
            
            # Используем первый доступный аккаунт
            account_id = accounts['items'][0]['id']
            print(f"🔍 HR_SCREENING_GET_FIELDS_SCHEMA: Используем аккаунт {account_id}")
            
            # Получаем схему анкеты кандидата
            questionary_schema = huntflow_service.get_applicant_questionary_schema(account_id)
            
            if questionary_schema:
                print(f"✅ HR_SCREENING_GET_FIELDS_SCHEMA: Схема полей получена: {len(questionary_schema)} полей")
                return True, questionary_schema
            else:
                print(f"❌ HR_SCREENING_GET_FIELDS_SCHEMA: Не удалось получить схему полей")
                return False, "Не удалось получить схему полей"
                
        except Exception as e:
            print(f"❌ HR_SCREENING_GET_FIELDS_SCHEMA: Ошибка при получении схемы полей: {str(e)}")
            return False, f"Ошибка при получении схемы полей: {str(e)}"
    
    def analyze_with_gemini(self):
        """Анализирует данные с помощью Gemini AI"""
        try:
            from apps.gemini.logic.services import GeminiService
            
            # Проверяем, есть ли API ключ у пользователя
            if not self.user.gemini_api_key:
                return False, "У пользователя не настроен API ключ Gemini"
            
            # Создаем сервис Gemini
            gemini_service = GeminiService(self.user.gemini_api_key)
            
            # Подготавливаем промпт
            prompt_success, prompt = self._prepare_gemini_prompt()
            if not prompt_success:
                return False, prompt  # prompt содержит сообщение об ошибке
            
            # Отправляем запрос к Gemini
            success, response_text, metadata = gemini_service.generate_content(prompt)
            
            if success and response_text:
                # Очищаем ответ от markdown блоков
                cleaned_response = response_text.strip()
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]  # Убираем ```json
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]  # Убираем ```
                cleaned_response = cleaned_response.strip()
                
                self.gemini_analysis = cleaned_response
                
                # Извлекаем зарплату и определяем грейд
                print(f"🔍 HR_SCREENING_ANALYSIS: Вызываем _extract_salary_and_determine_grade")
                try:
                    self._extract_salary_and_determine_grade(cleaned_response)
                    print(f"🔍 HR_SCREENING_ANALYSIS: Метод _extract_salary_and_determine_grade завершен успешно")
                except Exception as e:
                    print(f"❌ HR_SCREENING_ANALYSIS: Ошибка в _extract_salary_and_determine_grade: {e}")
                    import traceback
                    traceback.print_exc()
                
                return True, "Анализ завершен успешно"
            else:
                return False, f"Ошибка Gemini API: {metadata.get('error', 'Неизвестная ошибка')}"
                
        except Exception as e:
            return False, f"Ошибка при анализе с Gemini: {str(e)}"
    
    def _get_user_account_id(self):
        """Получает реальный account_id пользователя из Huntflow"""
        try:
            # Сначала пытаемся извлечь account_id из URL кандидата
            if self.candidate_url:
                import re
                # Ищем org{account_id} в URL
                org_match = re.search(r'/my/org(\d+)#/', self.candidate_url)
                if org_match:
                    account_id = org_match.group(1)
                    print(f"🔍 Извлечен account_id из URL кандидата: {account_id}")
                    return account_id
            
            # Если не удалось извлечь из URL, получаем из API
            from apps.huntflow.services import HuntflowService
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if accounts and 'items' in accounts and accounts['items']:
                account_id = accounts['items'][0]['id']
                print(f"🔍 Получен account_id из API: {account_id}")
                return account_id
            else:
                print(f"⚠️ Не удалось получить account_id, используем fallback")
                return '694'  # Fallback
                
        except Exception as e:
            print(f"❌ Ошибка получения account_id: {e}")
            return '694'  # Fallback

    def _prepare_gemini_prompt(self):
        """Подготавливает промпт для Gemini AI"""
        try:
            # Получаем промпт из вакансии
            from apps.vacancies.models import Vacancy
            vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
            base_prompt = vacancy.candidate_update_prompt
            
            if not base_prompt:
                return False, f"Промпт для обновления кандидата не настроен для вакансии {vacancy.name}"
            
            # Получаем account_id для формирования ссылки
            account_id = self._get_user_account_id()
            
            candidate_system_url = f"http://127.0.0.1:8000/huntflow/accounts/{account_id}/applicants/{self.candidate_id}/"
            
            # Получаем шаблоны вопросов для разных стран
            belarus_template = QuestionTemplate.objects.filter(country='belarus').first()
            poland_template = QuestionTemplate.objects.filter(country='poland').first()
            
            # Получаем схему полей кандидата из Huntflow
            fields_schema_success, fields_schema = self.get_candidate_fields_schema()
            fields_info = ""
            if fields_schema_success and fields_schema:
                fields_info = "\n\nПОЛЯ КАНДИДАТА В HUNTFLOW:\n"
                for field_key, field_data in fields_schema.items():
                    field_title = field_data.get('title', field_key)
                    field_type = field_data.get('type', 'unknown')
                    field_required = field_data.get('required', False)
                    field_options = field_data.get('options', field_data.get('choices', field_data.get('values', [])))
                    
                    fields_info += f"- {field_key}: {field_title} (тип: {field_type}"
                    if field_required:
                        fields_info += ", обязательное"
                    if field_options:
                        fields_info += f", варианты: {', '.join(map(str, field_options))}"
                    fields_info += ")\n"
            else:
                fields_info = "\n\nПОЛЯ КАНДИДАТА В HUNTFLOW:\nНе удалось получить схему полей"
            
            # Формируем финальный промпт, заменяя плейсхолдеры
            prompt = base_prompt.replace('{answers}', self.input_data)
            
            # Подставляем вопросы для Беларуси
            if belarus_template:
                prompt = prompt.replace('{questions_belarus}', belarus_template.questions)
            else:
                prompt = prompt.replace('{questions_belarus}', 'ДЛЯ БЕЛАРУСИ:\nШаблон вопросов не найден')
            
            # Подставляем вопросы для Польши
            if poland_template:
                prompt = prompt.replace('{questions_poland}', poland_template.questions)
            else:
                prompt = prompt.replace('{questions_poland}', 'ДЛЯ ПОЛЬШИ:\nШаблон вопросов не найден')
            
            # Добавляем информацию о полях Huntflow
            prompt += fields_info
            
            # Добавляем ссылку на кандидата
            prompt += f"\n\nСсылка на кандидата в системе: {candidate_system_url}"
            return True, prompt
            
        except Vacancy.DoesNotExist:
            return False, f"Вакансия с ID {self.vacancy_id} не найдена в локальной базе данных"
        except Exception as e:
            return False, f"Ошибка при подготовке промпта: {str(e)}"
    
    def _extract_salary_and_determine_grade(self, gemini_response):
        """Извлекает зарплату из ответа Gemini и определяет грейд"""
        try:
            import json
            import re
            from decimal import Decimal
            
            # Парсим JSON ответ от Gemini
            try:
                analysis_data = json.loads(gemini_response)
            except json.JSONDecodeError:
                print(f"❌ Не удалось распарсить JSON ответ от Gemini: {gemini_response}")
                return
            
            # Извлекаем зарплату из поля "money", "Зарплата" или "salary"
            salary_text = ""
            if isinstance(analysis_data, dict):
                # Сначала ищем в поле money (как возвращает Gemini)
                money_field = analysis_data.get('money', {})
                if isinstance(money_field, dict):
                    salary_text = money_field.get('value', '')
                elif isinstance(money_field, str):
                    salary_text = money_field
                
                # Если не найдено, ищем в других полях
                if not salary_text:
                    salary_text = analysis_data.get('Зарплата', analysis_data.get('salary', ''))
            
            if not salary_text:
                print("❌ Поле с зарплатой не найдено в ответе Gemini")
                return
            
            # Извлекаем первое числовое значение
            salary_match = re.search(r'(\d+(?:\.\d+)?)', str(salary_text))
            if salary_match:
                salary_value = Decimal(salary_match.group(1))
                self.extracted_salary = salary_value
                print(f"✅ Извлечена зарплата: {salary_value}")
            else:
                print(f"❌ Не удалось извлечь числовое значение из: {salary_text}")
                return
            
            # Определяем валюту
            currency = self._detect_currency(str(salary_text))
            self.salary_currency = currency
            print(f"✅ Определена валюта: {currency}")
            
            # Определяем грейд на основе зарплатных вилок в исходной валюте
            print(f"🔍 HR_SCREENING_GRADE: Определяем грейд для зарплаты {salary_value} {currency}")
            grade = self._determine_grade_by_salary(salary_value, currency)
            if grade:
                self.determined_grade = grade
                print(f"✅ Определен грейд: {grade}")
                
                # Получаем ID уровня из Huntflow
                print(f"🔍 HR_SCREENING_LEVEL: Получаем ID уровня для грейда '{grade}'")
                huntflow_level_id = self._get_huntflow_level_id(grade)
                if huntflow_level_id:
                    self.huntflow_grade_id = huntflow_level_id
                    print(f"✅ ID уровня в Huntflow: {huntflow_level_id}")
                    print(f"🔍 HR_SCREENING_LEVEL: ID уровня сохранен, обновление произойдет в update_candidate_in_huntflow")
                else:
                    print("❌ Не удалось получить ID уровня из Huntflow")
            else:
                print("❌ Не удалось определить грейд по зарплате")
            
            # Сохраняем изменения
            self.save()
            
        except Exception as e:
            print(f"❌ Ошибка при извлечении зарплаты и определении грейда: {e}")
    
    def _detect_currency(self, salary_text):
        """Определяет валюту из текста зарплаты"""
        salary_text_lower = salary_text.lower()
        
        currency_mapping = {
            'usd': 'USD',
            '$': 'USD',
            'доллар': 'USD',
            'dollar': 'USD',
            'eur': 'EUR',
            '€': 'EUR',
            'евро': 'EUR',
            'euro': 'EUR',
            'rub': 'RUB',
            '₽': 'RUB',
            'рубль': 'RUB',
            'ruble': 'RUB',
            'byn': 'BYN',
            'бел.руб': 'BYN',
            'белорусский рубль': 'BYN',
            'pln': 'PLN',
            'злотый': 'PLN',
            'zloty': 'PLN'
        }
        
        for key, currency in currency_mapping.items():
            if key in salary_text_lower:
                return currency
        
        # По умолчанию USD
        return 'USD'
    
    def _convert_to_usd(self, amount, currency):
        """Конвертирует сумму в USD"""
        if currency == 'USD':
            return amount
        
        try:
            from apps.finance.models import CurrencyRate
            
            # Получаем последний курс валюты
            rate = CurrencyRate.objects.filter(
                code=currency
            ).order_by('-fetched_at').first()
            
            if rate:
                return amount / rate.rate
            else:
                print(f"⚠️ Курс валюты {currency} не найден, используем 1:1")
                return amount
                
        except Exception as e:
            print(f"❌ Ошибка при конвертации валюты: {e}")
            return amount
    
    def _determine_grade_by_salary(self, salary_amount, currency):
        """Определяет грейд на основе зарплаты в указанной валюте"""
        try:
            from apps.vacancies.models import SalaryRange, Vacancy
            
            # Получаем вакансию
            vacancy = Vacancy.objects.get(external_id=str(self.vacancy_id))
            
            # Определяем поля для фильтрации в зависимости от валюты
            if currency == 'USD':
                min_field = 'salary_min_usd'
                max_field = 'salary_max_usd'
            elif currency == 'PLN':
                min_field = 'salary_min_pln'
                max_field = 'salary_max_pln'
            elif currency == 'BYN':
                min_field = 'salary_min_byn'
                max_field = 'salary_max_byn'
            else:
                print(f"❌ Неподдерживаемая валюта: {currency}")
                return None
            
            # Получаем зарплатные вилки для этой вакансии
            filter_kwargs = {
                'vacancy': vacancy,
                'is_active': True,
                f'{min_field}__lte': salary_amount,
                f'{max_field}__gte': salary_amount
            }
            
            salary_ranges = SalaryRange.objects.filter(**filter_kwargs).order_by(min_field)
            
            if salary_ranges.exists():
                # Берем первую подходящую зарплатную вилку
                salary_range = salary_ranges.first()
                print(f"✅ Найдена подходящая зарплатная вилка: {salary_range.grade.name} ({salary_amount} {currency})")
                return salary_range.grade.name
            else:
                print(f"❌ Не найдено подходящих зарплатных вилок для зарплаты {salary_amount} {currency}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при определении грейда: {e}")
            return None
    
    def _get_huntflow_level_id(self, grade_name):
        """Получает ID уровня из Huntflow по названию грейда"""
        try:
            from apps.huntflow.services import HuntflowService
            
            huntflow_service = HuntflowService(self.user)
            
            # Получаем схему полей кандидата
            accounts = huntflow_service.get_accounts()
            if not accounts or 'items' not in accounts or not accounts['items']:
                print("❌ Не удалось получить список аккаунтов")
                return None
            
            account_id = accounts['items'][0]['id']
            schema = huntflow_service.get_applicant_questionary_schema(account_id)
            
            if schema:
                # Ищем поле "Уровень" - схема содержит прямые ключи полей
                for field_id, field_data in schema.items():
                    title = field_data.get('title', '')
                    if title == 'Уровень':
                        # Получаем список доступных значений
                        values = field_data.get('values', [])
                        grade_name_lower = grade_name.lower()
                        
                        # Ищем точное совпадение
                        for index, value in enumerate(values):
                            if value.lower() == grade_name_lower:
                                print(f"✅ Найден точный уровень '{value}' в Huntflow (индекс: {index})")
                                return str(index)
                        
                        # Если точного совпадения нет, ищем частичное
                        for index, value in enumerate(values):
                            if grade_name_lower in value.lower() or value.lower() in grade_name_lower:
                                print(f"✅ Найден похожий уровень '{value}' для грейда '{grade_name}' (индекс: {index})")
                                return str(index)
                        
                        print(f"❌ Уровень '{grade_name}' не найден среди доступных: {values}")
                        return None
            
            print("❌ Поле 'Уровень' не найдено в схеме полей Huntflow")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка при получении ID уровня из Huntflow: {e}")
            return None
    
    def _update_huntflow_level(self, grade_id):
        """Обновляет уровень кандидата в Huntflow"""
        try:
            from apps.huntflow.services import HuntflowService
            
            huntflow_service = HuntflowService(self.user)
            
            # Получаем схему полей, чтобы найти правильное название поля для уровня
            accounts = huntflow_service.get_accounts()
            if not accounts or 'items' not in accounts or not accounts['items']:
                print("❌ Не удалось получить список аккаунтов")
                return False
            
            account_id = accounts['items'][0]['id']
            schema = huntflow_service.get_applicant_questionary_schema(account_id)
            
            if schema:
                # Ищем поле "Уровень" и получаем его search_field
                for field_id, field_data in schema.items():
                    if field_data.get('title') == 'Уровень':
                        search_field = field_data.get('search_field', '')
                        values = field_data.get('values', [])
                        
                        if search_field and values:
                            # Получаем значение по индексу (как для поля "Офис")
                            try:
                                grade_index = int(grade_id)
                                if 0 <= grade_index < len(values):
                                    grade_value = values[grade_index]
                                    print(f"🔍 HR_SCREENING_LEVEL_UPDATE: Индекс {grade_index} соответствует значению '{grade_value}'")
                                    
                                    # Обновляем поле уровня кандидата значением (как для поля "Офис")
                                    # Используем field_id (как для поля "Офис")
                                    update_data = {
                                        field_id: grade_value
                                    }
                                    
                                    print(f"🔍 HR_SCREENING_LEVEL_UPDATE: Обновляем поле {field_id} значением '{grade_value}'")
                                    
                                    success = huntflow_service.update_applicant_questionary(
                                        account_id,
                                        int(self.candidate_id),
                                        update_data
                                    )
                                    
                                    if success:
                                        print(f"✅ Уровень кандидата обновлен в Huntflow: {grade_value}")
                                        return True
                                    else:
                                        print(f"❌ Не удалось обновить уровень кандидата в Huntflow")
                                        return False
                                else:
                                    print(f"❌ Индекс {grade_index} выходит за границы списка значений {values}")
                                    return False
                            except ValueError:
                                print(f"❌ Неверный формат индекса: {grade_id}")
                                return False
                        else:
                            print("❌ Не найден search_field или values для поля 'Уровень'")
                            return False
            
            print("❌ Поле 'Уровень' не найдено в схеме полей")
            return False
                
        except Exception as e:
            print(f"❌ Ошибка при обновлении уровня в Huntflow: {e}")
            return False
    
    def _normalize_level(self, level_value):
        """Нормализует уровень кандидата"""
        if not level_value:
            return ""
        
        level_mapping = {
            'junior': 'Junior',
            'middle': 'Middle', 
            'senior': 'Senior',
            'lead': 'Lead',
            'jun': 'Junior',
            'mid': 'Middle',
            'sen': 'Senior'
        }
        
        level_lower = level_value.lower().strip()
        return level_mapping.get(level_lower, level_value)
    
    def get_parsed_analysis(self):
        """Возвращает распарсенный анализ от Gemini"""
        try:
            import json
            if self.gemini_analysis:
                parsed = json.loads(self.gemini_analysis)
                
                # Получаем схему полей для получения названий
                fields_schema_success, fields_schema = self.get_candidate_fields_schema()
                
                # Если это новая структура с value/quote, преобразуем для удобства отображения
                if isinstance(parsed, dict):
                    formatted_analysis = {}
                    for key, value in parsed.items():
                        if key == 'comment':
                            formatted_analysis[key] = value
                        elif isinstance(value, dict) and 'value' in value and 'quote' in value:
                            # Получаем название поля из схемы Huntflow
                            field_key = value.get('field_key', key)
                            field_title = field_key  # По умолчанию используем ключ
                            
                            if fields_schema_success and fields_schema and field_key in fields_schema:
                                field_title = fields_schema[field_key].get('title', field_key)
                            
                            # Новая структура с value, quote, field_key и title
                            formatted_analysis[key] = {
                                'value': value['value'],
                                'quote': value['quote'],
                                'field_key': field_key,
                                'field_title': field_title,
                                'display': f"{value['value']}" + (f" (\"{value['quote']}\")" if value['quote'] else "")
                            }
                        else:
                            # Старая структура
                            formatted_analysis[key] = value
                    
                    return formatted_analysis
                
                return parsed
            return None
        except json.JSONDecodeError:
            return None
    
    def get_candidate_system_url(self):
        """Возвращает ссылку на кандидата в нашей системе"""
        try:
            account_id = self._get_user_account_id()
            if account_id and self.candidate_id:
                return f"http://127.0.0.1:8000/huntflow/accounts/{account_id}/applicants/{self.candidate_id}/"
            return None
        except Exception as e:
            print(f"❌ Ошибка получения ссылки на кандидата: {e}")
            return None
    
    def update_candidate_in_huntflow(self):
        """Обновляет поля кандидата в Huntflow на основе анализа"""
        try:
            from apps.huntflow.services import HuntflowService
            from .state_snapshot_service import snapshot_service
            
            print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Начинаем обновление кандидата {self.candidate_id}")
            
            # Получаем аккаунты пользователя
            huntflow_service = HuntflowService(self.user)
            accounts = huntflow_service.get_accounts()
            
            if not accounts or 'items' not in accounts or not accounts['items']:
                print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Нет доступных аккаунтов Huntflow")
                return False, "Нет доступных аккаунтов Huntflow"
            
            # Используем первый доступный аккаунт
            account_id = accounts['items'][0]['id']
            print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Используем аккаунт {account_id}")
            
            # СОЗДАЕМ СНИМОК СОСТОЯНИЯ ПЕРЕД ОБНОВЛЕНИЕМ
            print(f"📸 HR_SCREENING_UPDATE_CANDIDATE: Создаем снимок состояния кандидата")
            snapshot_data = snapshot_service.create_candidate_snapshot_data(
                huntflow_service, account_id, self.candidate_id
            )
            
            # Сохраняем снимок в Redis
            snapshot_saved = snapshot_service.save_candidate_snapshot(
                self.user.id, 
                self.candidate_id, 
                'hrscreening', 
                snapshot_data
            )
            
            if snapshot_saved:
                print(f"✅ HR_SCREENING_UPDATE_CANDIDATE: Снимок состояния сохранен")
            else:
                print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Не удалось сохранить снимок состояния")
            
            # Получаем распарсенный анализ
            parsed_analysis = self.get_parsed_analysis()
            if not parsed_analysis:
                print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Нет анализа для обновления")
                return False, "Нет анализа для обновления"
            
            # Подготавливаем данные для обновления
            money_data = {}
            questionary_data = {}
            
            for key, value in parsed_analysis.items():
                if key != 'comment' and isinstance(value, dict):
                    field_key = value.get('field_key')
                    field_value = value.get('value')
                    
                    if field_key and field_value is not None:
                        # Для поля money используем отдельную структуру
                        if field_key == 'money':
                            money_data['money'] = field_value
                        else:
                            # Для дополнительных полей используем questionary
                            questionary_data[field_key] = field_value
                        
                        print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Добавляем поле {field_key} = {field_value}")
            
            # Обновляем основные поля (money) если есть
            if money_data:
                print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Обновляем основные поля")
                result = huntflow_service.update_applicant(account_id, int(self.candidate_id), money_data)
                if not result:
                    print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Ошибка при обновлении основных полей")
                    return False, "Ошибка при обновлении основных полей"
            
            # Обновляем дополнительные поля (questionary) если есть
            if questionary_data:
                print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Обновляем дополнительные поля")
                result = huntflow_service.update_applicant_questionary(account_id, int(self.candidate_id), questionary_data)
                if not result:
                    print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Ошибка при обновлении дополнительных полей")
                    return False, "Ошибка при обновлении дополнительных полей"
            
            # Обновляем уровень кандидата если он был определен
            if self.huntflow_grade_id:
                print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Обновляем уровень кандидата: {self.huntflow_grade_id}")
                level_result = self._update_huntflow_level(self.huntflow_grade_id)
                if level_result:
                    print(f"✅ HR_SCREENING_UPDATE_CANDIDATE: Уровень кандидата обновлен")
                else:
                    print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Не удалось обновить уровень кандидата")
            else:
                print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: ID уровня не определен, пропускаем обновление уровня")
            
            if not money_data and not questionary_data and not self.huntflow_grade_id:
                print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Нет данных для обновления")
                return False, "Нет данных для обновления"
            # Обновляем статус кандидата на "HR Screening" и добавляем комментарий
            print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Обновляем статус и добавляем комментарий")
            
            # Получаем статус из настроек вакансии
            hr_screening_status_id = None
            
            try:
                # Пытаемся получить вакансию из локальной БД
                from apps.vacancies.models import Vacancy
                vacancy = Vacancy.objects.filter(external_id=str(self.vacancy_id)).first()
                
                if vacancy and vacancy.hr_screening_stage:
                    hr_screening_status_id = int(vacancy.hr_screening_stage)
                    print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Используем статус из вакансии: {hr_screening_status_id}")
                else:
                    print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Этап не настроен в вакансии, ищем по названию")
                    
                    # Fallback: ищем по названию "HR Screening"
                    statuses = huntflow_service.get_vacancy_statuses(account_id)
                    if statuses and 'items' in statuses:
                        for status in statuses['items']:
                            if status.get('name', '').lower() == 'hr screening':
                                hr_screening_status_id = status.get('id')
                                print(f"🔍 HR_SCREENING_UPDATE_CANDIDATE: Найден статус HR Screening с ID {hr_screening_status_id}")
                                break
            except Exception as e:
                print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Ошибка получения этапа из вакансии: {e}")
                # Fallback к старой логике
                statuses = huntflow_service.get_vacancy_statuses(account_id)
                if statuses and 'items' in statuses:
                    for status in statuses['items']:
                        if status.get('name', '').lower() == 'hr screening':
                            hr_screening_status_id = status.get('id')
                            break
            
            if not hr_screening_status_id:
                print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Статус HR Screening не найден")
                status_result = None
            else:
                # Формируем комментарий из поля comment
                comment_text = ""
                if 'comment' in parsed_analysis and parsed_analysis['comment']:
                    comment_text = f"Доп. инфо: {parsed_analysis['comment']}"
                else:
                    comment_text = ""
                
                # Обновляем статус на "HR Screening"
                status_result = huntflow_service.update_applicant_status(
                    account_id, 
                    int(self.candidate_id), 
                    status_id=hr_screening_status_id,
                    comment=comment_text,
                    vacancy_id=int(self.vacancy_id) if self.vacancy_id else None
                )
            
            if status_result:
                print(f"✅ HR_SCREENING_UPDATE_CANDIDATE: Статус обновлен на HR Screening")
            else:
                print(f"⚠️ HR_SCREENING_UPDATE_CANDIDATE: Не удалось обновить статус")
            
            # Очищаем кэш для обновленного кандидата
            from apps.google_oauth.cache_service import HuntflowAPICache
            HuntflowAPICache.clear_candidate(self.user.id, account_id, int(self.candidate_id))
            print(f"🗑️ HR_SCREENING_UPDATE_CANDIDATE: Кэш очищен для кандидата {self.candidate_id}")
            
            print(f"✅ HR_SCREENING_UPDATE_CANDIDATE: Кандидат успешно обновлен")
            return True, "Кандидат успешно обновлен в Huntflow"
                
        except Exception as e:
            print(f"❌ HR_SCREENING_UPDATE_CANDIDATE: Ошибка при обновлении кандидата: {str(e)}")
            return False, f"Ошибка при обновлении кандидата: {str(e)}"


class QuestionTemplate(models.Model):
    """Модель для хранения шаблонов вопросов для разных стран"""
    
    COUNTRY_CHOICES = [
        ('belarus', _('Беларусь')),
        ('poland', _('Польша')),
    ]
    
    country = models.CharField(
        _('Страна'),
        max_length=20,
        choices=COUNTRY_CHOICES,
        unique=True
    )
    
    questions = models.TextField(
        _('Вопросы'),
        help_text=_('Вопросы для данной страны, разделенные переносами строк')
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Дата создания'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Дата обновления'))
    
    class Meta:
        verbose_name = _('Шаблон вопросов')
        verbose_name_plural = _('Шаблоны вопросов')
    
    def __str__(self):
        return f'Вопросы для {self.get_country_display()}'


class ChatSession(models.Model):
    """Модель для хранения сессий чата"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    vacancy = models.ForeignKey('vacancies.Vacancy', on_delete=models.CASCADE, related_name='chat_sessions', verbose_name="Вакансия", null=True, blank=True)
    title = models.CharField(max_length=200, blank=True, verbose_name="Название чата")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")
    
    class Meta:
        verbose_name = "Сессия чата"
        verbose_name_plural = "Сессии чата"
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.title:
            return f'{self.title} - {self.vacancy.name if self.vacancy else "Без вакансии"} (#{self.id})'
        return f'{self.vacancy.name if self.vacancy else "Без вакансии"} - Чат #{self.id} ({self.created_at.strftime("%d.%m.%Y %H:%M")})'


class ChatMessage(models.Model):
    """Модель для хранения сообщений в чате"""
    
    MESSAGE_TYPES = [
        ('user', 'Пользователь'),
        ('system', 'Система'),
        ('hr_screening', 'HR-скрининг'),
        ('invite', 'Инвайт'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, verbose_name="Тип сообщения")
    content = models.TextField(verbose_name="Содержимое")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Метаданные")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    
    # Связи с созданными объектами
    hr_screening = models.ForeignKey('HRScreening', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    invite = models.ForeignKey('Invite', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    
    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
        ordering = ['created_at']
    
    def __str__(self):
        return f'{self.get_message_type_display()} - {self.created_at.strftime("%d.%m.%Y %H:%M")}'