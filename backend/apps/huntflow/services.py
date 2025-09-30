import requests
from typing import Dict, Any, List, Optional
from django.conf import settings
from apps.google_oauth.cache_service import HuntflowAPICache
from .token_service import HuntflowTokenService
import logging

logger = logging.getLogger(__name__)


class HuntflowService:
    """Сервис для работы с Huntflow API с поддержкой токенной аутентификации"""
    
    def __init__(self, user):
        """
        Инициализация сервиса с данными пользователя
        
        Args:
            user: Пользователь с настройками Huntflow
        """
        self.user = user
        self.token_service = HuntflowTokenService(user)
    
    def _get_base_url(self) -> str:
        """Получает базовый URL для API запросов"""
        if self.user.active_system == 'prod':
            return self.user.huntflow_prod_url
        else:
            return self.user.huntflow_sandbox_url
    
    def _get_api_key(self) -> str:
        """Получает API ключ для аутентификации (fallback для старой системы)"""
        if self.user.active_system == 'prod':
            return self.user.huntflow_prod_api_key
        else:
            return self.user.huntflow_sandbox_api_key
    
    def _get_headers(self):
        """Получает заголовки для API запросов с валидным токеном"""
        # Сначала проверяем, есть ли API ключ для текущей системы
        api_key = self._get_api_key()
        
        # Если есть API ключ, используем его (приоритет для стабильности)
        if api_key:
            return {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        
        # Если нет API ключа, пробуем токены
        if self.user.huntflow_access_token:
            # Получаем валидный токен
            access_token = self.token_service.ensure_valid_token()
            if access_token:
                return {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
        
        # Если ничего не работает, выбрасываем исключение
        raise Exception("Не настроена аутентификация для текущей системы")
    
    def _extract_name_from_task_title(self, task_name: str) -> Dict[str, str]:
        """
        Извлекает имя, фамилию и отчество из названия задачи ClickUp
        
        Args:
            task_name: Название задачи
            
        Returns:
            Словарь с ключами 'first_name', 'last_name', 'middle_name'
        """
        if not task_name:
            return {'first_name': '', 'last_name': '', 'middle_name': ''}
        
        # Очищаем название от лишних символов и приводим к нормальному виду
        import re
        cleaned_name = re.sub(r'[^\w\s\-\.]', ' ', task_name)  # Убираем спецсимволы кроме пробелов, дефисов и точек
        cleaned_name = re.sub(r'\s+', ' ', cleaned_name).strip()  # Убираем лишние пробелы
        
        # Разбиваем на слова
        words = cleaned_name.split()
        
        if len(words) == 0:
            return {'first_name': '', 'last_name': '', 'middle_name': ''}
        elif len(words) == 1:
            # Только одно слово - считаем его фамилией
            return {'first_name': '', 'last_name': words[0], 'middle_name': ''}
        elif len(words) == 2:
            # Два слова - фамилия и имя
            return {'first_name': words[1], 'last_name': words[0], 'middle_name': ''}
        elif len(words) == 3:
            # Три слова - фамилия, имя, отчество
            return {'first_name': words[1], 'last_name': words[0], 'middle_name': words[2]}
        else:
            # Больше трех слов - пытаемся определить, где заканчивается имя
            # Ищем паттерны типа "Имя Фамилия - Должность" или "Фамилия Имя - Должность"
            first_word = words[0]
            second_word = words[1]
            
            # Если первое слово начинается с заглавной буквы и второе тоже - это скорее всего "Имя Фамилия"
            if first_word[0].isupper() and second_word[0].isupper():
                # Проверяем, есть ли дефис или тире в названии (указывает на должность)
                if '-' in task_name or '–' in task_name:
                    # Оставляем только имя и фамилию, остальное игнорируем
                    return {'first_name': first_word, 'last_name': second_word, 'middle_name': ''}
                else:
                    # Нет дефиса - возможно это "Фамилия Имя Отчество"
                    return {'first_name': second_word, 'last_name': first_word, 'middle_name': ' '.join(words[2:])}
            else:
                # Стандартная логика - фамилия, имя, все остальное в отчество
                middle_name = ' '.join(words[2:])
                return {'first_name': words[1], 'last_name': words[0], 'middle_name': middle_name}
    
    def _create_clickup_comment(self, task_description: str = None, task_comments: List[Dict[str, Any]] = None, task_status: str = None) -> str:
        """
        Создает личные заметки для Huntflow на основе данных из ClickUp
        
        Args:
            task_description: Описание задачи ClickUp
            task_comments: Комментарии к задаче ClickUp
            task_status: Статус задачи ClickUp
            
        Returns:
            Форматированные личные заметки для Huntflow
        """
        import re
        
        print(f"🔍 Создаем личные заметки из ClickUp:")
        print(f"  - Описание: {task_description[:100] if task_description else 'Нет описания'}...")
        print(f"  - Комментарии: {len(task_comments) if task_comments else 0}")
        print(f"  - Статус: {task_status if task_status else 'Нет статуса'}")
        
        comment_parts = []
        
        # Добавляем статус задачи, если есть
        if task_status and task_status.strip():
            comment_parts.append("📊 Статус задачи:")
            comment_parts.append(task_status.strip())
            comment_parts.append("")  # Пустая строка
        
        # Добавляем описание задачи, если есть
        if task_description and task_description.strip():
            # Очищаем описание от HTML тегов и лишних символов
            clean_description = re.sub(r'<[^>]+>', '', task_description)  # Убираем HTML теги
            clean_description = re.sub(r'\s+', ' ', clean_description).strip()  # Убираем лишние пробелы
            
            if clean_description:
                comment_parts.append("📋 Описание задачи:")
                comment_parts.append(clean_description)
                comment_parts.append("")  # Пустая строка
        
        # Добавляем комментарии, если есть
        if task_comments and len(task_comments) > 0:
            comment_parts.append("💬 Комментарии:")
            
            for comment in task_comments:
                # Извлекаем дату комментария
                comment_date = comment.get('date', '')
                if comment_date:
                    try:
                        from datetime import datetime
                        # Пытаемся распарсить дату в разных форматах
                        if isinstance(comment_date, str):
                            # Если это строка, пытаемся распарсить
                            try:
                                dt = datetime.fromisoformat(comment_date.replace('Z', '+00:00'))
                                formatted_date = dt.strftime('%d.%m.%Y %H:%M')
                            except Exception as e:
                                formatted_date = str(comment_date)
                        elif isinstance(comment_date, (int, float)):
                            # Если это timestamp (число)
                            try:
                                # Проверяем, в миллисекундах ли timestamp
                                if comment_date > 1e12:  # Больше 1 триллиона = миллисекунды
                                    comment_date = comment_date / 1000
                                
                                dt = datetime.fromtimestamp(comment_date)
                                formatted_date = dt.strftime('%d.%m.%Y %H:%M')
                            except Exception as e:
                                formatted_date = str(comment_date)
                        else:
                            formatted_date = str(comment_date)
                    except Exception as e:
                        formatted_date = str(comment_date)
                else:
                    formatted_date = 'Дата неизвестна'
                
                # Извлекаем текст комментария
                comment_text = comment.get('comment', '')
                if comment_text:
                    # Очищаем текст от HTML тегов
                    clean_text = re.sub(r'<[^>]+>', '', comment_text)
                    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                    
                    if clean_text:
                        comment_parts.append(f"{formatted_date}: {clean_text}")
                        comment_parts.append("")  # Пустая строка после каждого комментария
        
        # Объединяем все части
        if comment_parts:
            result = '\n'.join(comment_parts)
            print(f"✅ Созданы личные заметки из ClickUp ({len(result)} символов):")
            print(f"  {result[:200]}...")
            return result
        else:
            print("⚠️ Личные заметки из ClickUp пустые")
            return ""
    
    def _create_notion_comment(self, page_title: str = None, page_content: str = None, page_status: str = None, page_priority: str = None, assignees: List[str] = None, tags: List[str] = None, custom_properties: Dict[str, Any] = None, attachments: List[Dict[str, Any]] = None, due_date: str = None, comments: List[Dict[str, Any]] = None) -> str:
        """
        Создает личные заметки для Huntflow на основе данных из Notion
        
        Args:
            page_title: Название страницы Notion
            page_content: Содержимое страницы Notion
            page_status: Статус страницы Notion
            page_priority: Приоритет страницы Notion
            assignees: Исполнители страницы Notion
            tags: Теги страницы Notion
            custom_properties: Дополнительные свойства страницы Notion
            attachments: Вложения страницы Notion
            due_date: Срок выполнения страницы Notion
            
        Returns:
            Форматированные личные заметки для Huntflow
        """
        import re
        from datetime import datetime
        
        print(f"🔍 Создаем личные заметки из Notion:")
        print(f"  - Название: {page_title[:100] if page_title else 'Нет названия'}...")
        print(f"  - Содержимое: {len(page_content) if page_content else 0} символов")
        print(f"  - Статус: {page_status if page_status else 'Нет статуса'}")
        print(f"  - Приоритет: {page_priority if page_priority else 'Нет приоритета'}")
        print(f"  - Исполнители: {len(assignees) if assignees else 0}")
        print(f"  - Теги: {len(tags) if tags else 0}")
        print(f"  - Дополнительные свойства: {len(custom_properties) if custom_properties else 0}")
        print(f"  - Вложения: {len(attachments) if attachments else 0}")
        
        comment_parts = []
        
        # Добавляем заголовок
        comment_parts.append("📄 ИНФОРМАЦИЯ ИЗ NOTION")
        comment_parts.append("=" * 50)
        comment_parts.append("")
        
        # Добавляем основную информацию
        if page_title and page_title.strip():
            comment_parts.append("📋 Название страницы:")
            comment_parts.append(page_title.strip())
            comment_parts.append("")
        
        # Добавляем статус и приоритет
        if page_status and page_status.strip():
            comment_parts.append("📊 Статус:")
            comment_parts.append(page_status.strip())
            comment_parts.append("")
        
        if page_priority and page_priority.strip():
            comment_parts.append("⚡ Приоритет:")
            comment_parts.append(page_priority.strip())
            comment_parts.append("")
        
        # Добавляем срок выполнения
        if due_date and due_date.strip():
            comment_parts.append("📅 Срок выполнения:")
            comment_parts.append(due_date.strip())
            comment_parts.append("")
        
        # Добавляем исполнителей
        if assignees and len(assignees) > 0:
            comment_parts.append("👥 Исполнители:")
            for assignee in assignees:
                comment_parts.append(f"  • {assignee}")
            comment_parts.append("")
        
        # Добавляем теги
        if tags and len(tags) > 0:
            comment_parts.append("🏷️ Теги:")
            for tag in tags:
                comment_parts.append(f"  • {tag}")
            comment_parts.append("")
        
        # Добавляем содержимое страницы
        if page_content and page_content.strip():
            print(f"🔍 Обрабатываем содержимое страницы Notion: {len(page_content)} символов")
            # Очищаем содержимое от HTML тегов и лишних символов
            clean_content = re.sub(r'<[^>]+>', '', page_content)  # Убираем HTML теги
            clean_content = re.sub(r'\s+', ' ', clean_content).strip()  # Убираем лишние пробелы
            
            print(f"🔍 Очищенное содержимое: {len(clean_content)} символов")
            
            if clean_content:
                comment_parts.append("📝 Содержимое страницы:")
                # Ограничиваем длину содержимого
                if len(clean_content) > 2000:
                    clean_content = clean_content[:2000] + "... (содержимое обрезано)"
                comment_parts.append(clean_content)
                comment_parts.append("")
                print(f"✅ Содержимое страницы добавлено в заметки: {len(clean_content)} символов")
            else:
                print("⚠️ Содержимое страницы пустое после очистки")
        else:
            print("⚠️ Содержимое страницы Notion пустое или отсутствует")
        
        # Добавляем комментарии к странице
        if comments and len(comments) > 0:
            print(f"🔍 Обрабатываем комментарии Notion: {len(comments)} комментариев")
            comment_parts.append("💬 Комментарии к странице:")
            for comment in comments:
                author = comment.get('author', 'Неизвестно')
                text = comment.get('text', '')
                created_time = comment.get('created_time', '')
                
                if text.strip():
                    comment_parts.append(f"  • {author}: {text.strip()}")
                    if created_time:
                        comment_parts.append(f"    (дата: {created_time})")
            comment_parts.append("")
            print(f"✅ Комментарии добавлены в заметки: {len(comments)} комментариев")
        else:
            print("⚠️ Комментарии к странице Notion отсутствуют")
        
        # Добавляем дополнительные свойства
        if custom_properties and len(custom_properties) > 0:
            comment_parts.append("🔧 Дополнительные свойства:")
            for key, value in custom_properties.items():
                if value:  # Показываем только непустые значения
                    if isinstance(value, (list, dict)):
                        value_str = str(value)
                    else:
                        value_str = str(value)
                    comment_parts.append(f"  • {key}: {value_str}")
            comment_parts.append("")
        
        # Добавляем информацию о вложениях
        if attachments and len(attachments) > 0:
            comment_parts.append("📎 Вложения:")
            for attachment in attachments:
                name = attachment.get('name', 'Неизвестный файл')
                file_type = attachment.get('type', 'unknown')
                size = attachment.get('size', 0)
                if size > 0:
                    size_mb = size / (1024 * 1024)
                    comment_parts.append(f"  • {name} ({file_type}, {size_mb:.1f} MB)")
                else:
                    comment_parts.append(f"  • {name} ({file_type})")
            comment_parts.append("")
        
        # Добавляем дату создания заметки
        current_time = datetime.now().strftime("%d.%m.%Y %H:%M")
        comment_parts.append(f"🕒 Заметка создана: {current_time}")
        
        # Объединяем все части
        result = "\n".join(comment_parts)
        
        if result.strip():
            print(f"✅ Созданы личные заметки из Notion ({len(result)} символов)")
            print(f"  {result[:200]}...")
            return result
        else:
            print("⚠️ Личные заметки из Notion пустые")
            return ""
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Выполняет HTTP запрос к Huntflow API с автоматическим обновлением токенов
        
        Args:
            method: HTTP метод (GET, POST, etc.)
            endpoint: Endpoint API
            **kwargs: Дополнительные параметры запроса
            
        Returns:
            Ответ API или None в случае ошибки
        """
        try:
            # Получаем актуальные заголовки
            headers = self._get_headers()
            kwargs['headers'] = headers
            
            # Формируем URL
            base_url = self._get_base_url()
            if base_url.endswith('/v2'):
                url = f"{base_url}{endpoint}"
            else:
                url = f"{base_url}/v2{endpoint}"
                
            print(f"🔍 API запрос: {method} {url}")
            if 'json' in kwargs:
                print(f"📤 JSON данные: {kwargs['json']}")
            if 'data' in kwargs:
                print(f"📤 Form данные: {kwargs['data']}")
            
            # Подготавливаем данные для логирования
            request_data = {}
            if 'json' in kwargs:
                request_data = kwargs['json']
            elif 'data' in kwargs:
                request_data = kwargs['data']
            
            # Выполняем запрос
            response = requests.request(
                method=method,
                url=url,
                timeout=30,
                **kwargs
            )
            
            # Если получили 401 и используем токенную систему, пробуем обновить токен
            if response.status_code == 401 and self.user.huntflow_access_token:
                logger.warning("Получен 401, пробуем обновить токен")
                
                if self.token_service.refresh_access_token():
                    # Обновляем заголовки с новым токеном
                    headers = self._get_headers()
                    kwargs['headers'] = headers
                    
                    # Повторяем запрос
                    response = requests.request(
                        method=method,
                        url=url,
                        timeout=30,
                        **kwargs
                    )
            
            print(f"📥 Ответ API: {response.status_code}")
            print(f"📥 Тело ответа: {response.text[:500]}...")
            
            # Логируем запрос в базу данных
            self._log_request(method, endpoint, response.status_code, request_data, response.text)
            
            # Обрабатываем ответ
            if response.status_code in [200, 201]:
                try:
                    return response.json()
                except ValueError as e:
                    print(f"❌ Ошибка парсинга JSON: {e}")
                    print(f"📥 Сырой ответ: {response.text}")
                    return None
            else:
                logger.error(f"Ошибка API: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            print(f"❌ Ошибка запроса к Huntflow: {e}")
            # Логируем ошибку
            self._log_request(method, endpoint, None, request_data, str(e), is_error=True)
            return None
        except Exception as e:
            logger.error(f"Ошибка запроса: {e}")
            return None
    
    def get_accounts(self) -> Optional[List[Dict[str, Any]]]:
        """
        Получает список доступных организаций
        
        Returns:
            Список организаций или None
        """
        return self._make_request('GET', '/accounts')
    
    def get_vacancies(self, account_id: int, **params) -> Optional[Dict[str, Any]]:
        """
        Получает список вакансий
        
        Args:
            account_id: ID организации
            **params: Дополнительные параметры (count, page, state, etc.)
            
        Returns:
            Список вакансий или None
        """
        query_params = '&'.join([f"{k}={v}" for k, v in params.items() if v is not None])
        endpoint = f"/accounts/{account_id}/vacancies"
        if query_params:
            endpoint += f"?{query_params}"
        
        return self._make_request('GET', endpoint)
    
    def get_vacancy(self, account_id: int, vacancy_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает информацию о конкретной вакансии
        
        Args:
            account_id: ID организации
            vacancy_id: ID вакансии
            
        Returns:
            Информация о вакансии или None
        """
        # Сначала проверяем кэш
        user_id = self.user.id
        cached_vacancy = HuntflowAPICache.get_vacancy(user_id, account_id, vacancy_id)
        
        if cached_vacancy is not None:
            print(f"📦 Получены данные вакансии из кэша: {vacancy_id}")
            return cached_vacancy
        
        # Если в кэше нет, получаем из API
        vacancy_data = self._make_request('GET', f"/accounts/{account_id}/vacancies/{vacancy_id}")
        
        if vacancy_data:
            # Сохраняем в кэш
            HuntflowAPICache.set_vacancy(user_id, vacancy_data, account_id, vacancy_id)
            print(f"💾 Сохранены данные вакансии в кэш: {vacancy_id}")
        
        return vacancy_data
    
    def get_vacancy_statuses(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает список статусов вакансий
        
        Args:
            account_id: ID организации
            
        Returns:
            Список статусов или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/vacancies/statuses")
    
    def get_vacancy_additional_fields(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает схему дополнительных полей вакансий
        
        Args:
            account_id: ID организации
            
        Returns:
            Схема полей или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/vacancies/additional_fields")
    
    def update_vacancy(self, account_id: int, vacancy_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Обновляет данные вакансии
        
        Args:
            account_id: ID организации
            vacancy_id: ID вакансии
            data: Данные для обновления
            
        Returns:
            Обновленные данные вакансии или None
        """
        # Обновляем данные через API
        result = self._make_request('PATCH', f"/accounts/{account_id}/vacancies/{vacancy_id}", json=data)
        
        if result:
            # Сбрасываем кэш для этой вакансии
            user_id = self.user.id
            HuntflowAPICache.clear_vacancy(user_id, account_id, vacancy_id)
            print(f"🗑️ Сброшен кэш для вакансии: {vacancy_id}")
            
            # Получаем обновленные данные и сохраняем в кэш
            updated_data = self._make_request('GET', f"/accounts/{account_id}/vacancies/{vacancy_id}")
            if updated_data:
                HuntflowAPICache.set_vacancy(user_id, updated_data, account_id, vacancy_id)
                print(f"💾 Обновлены данные вакансии в кэше: {vacancy_id}")
                return updated_data
        
        return result
    
    def get_applicant_questionary_schema(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает схему анкеты кандидата
        
        Args:
            account_id: ID организации
            
        Returns:
            Схема анкеты или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/applicants/questionary")
    
    def get_applicants(self, account_id: int, **params) -> Optional[Dict[str, Any]]:
        """
        Получает список кандидатов
        
        Args:
            account_id: ID организации
            **params: Дополнительные параметры (count, page, status, vacancy, etc.)
            
        Returns:
            Список кандидатов или None
        """
        query_params = '&'.join([f"{k}={v}" for k, v in params.items() if v is not None])
        endpoint = f"/accounts/{account_id}/applicants"
        if query_params:
            endpoint += f"?{query_params}"
        
        return self._make_request('GET', endpoint)
    
    def get_applicant(self, account_id: int, applicant_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает информацию о конкретном кандидате
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            
        Returns:
            Информация о кандидате или None
        """
        # Сначала проверяем кэш
        user_id = self.user.id
        cached_candidate = HuntflowAPICache.get_candidate(user_id, account_id, applicant_id)
        
        if cached_candidate is not None:
            print(f"📦 Получены данные кандидата из кэша: {applicant_id}")
            return cached_candidate
        
        # Если в кэше нет, получаем из API
        candidate_data = self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}")
        
        if candidate_data:
            # Сохраняем в кэш
            HuntflowAPICache.set_candidate(user_id, candidate_data, account_id, applicant_id)
            print(f"💾 Сохранены данные кандидата в кэш: {applicant_id}")
        
        return candidate_data
    
    def get_applicant_questionary(self, account_id: int, applicant_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает анкету конкретного кандидата
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            
        Returns:
            Анкета кандидата или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}/questionary")
    
    def get_applicant_logs(self, account_id: int, applicant_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает логи кандидата (включая комментарии)
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            
        Returns:
            Логи кандидата или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}/logs")
    
    def get_tags(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        Получает список меток организации
        
        Args:
            account_id: ID организации
            
        Returns:
            Список меток или None
        """
        return self._make_request('GET', f"/accounts/{account_id}/tags")
    
    def update_applicant(self, account_id: int, applicant_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Обновляет данные кандидата
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            data: Данные для обновления
            
        Returns:
            Обновленные данные кандидата или None
        """
        # Обновляем данные через API
        result = self._make_request('PATCH', f"/accounts/{account_id}/applicants/{applicant_id}", json=data)
        
        if result:
            # Сбрасываем кэш для этого кандидата
            user_id = self.user.id
            HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
            print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
            
            # Получаем обновленные данные и сохраняем в кэш
            updated_data = self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}")
            if updated_data:
                HuntflowAPICache.set_candidate(user_id, updated_data, account_id, applicant_id)
                print(f"💾 Обновлены данные кандидата в кэше: {applicant_id}")
                return updated_data
        
        return result
    
    def update_applicant_status(self, account_id: int, applicant_id: int, status_id: int, comment: str = None, vacancy_id: int = None) -> Optional[Dict[str, Any]]:
        """
        Обновляет статус кандидата через добавление на вакансию с привязкой к вакансии и статусу
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            status_id: ID нового статуса
            comment: Комментарий к изменению статуса
            vacancy_id: ID вакансии (если не указан, получаем из данных кандидата)
            
        Returns:
            Результат обновления или None
        """
        # Получаем информацию о кандидате для получения вакансии
        applicant_data = self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}")
        if not applicant_data:
            print(f"DEBUG: Не удалось получить данные кандидата {applicant_id}")
            return None
        
        # Определяем вакансию
        if not vacancy_id and applicant_data.get('links'):
            vacancy_id = applicant_data['links'][0].get('vacancy')
        
        if not vacancy_id:
            print(f"DEBUG: У кандидата {applicant_id} нет привязанной вакансии ({vacancy_id})")
            return None
        
        print(f"DEBUG: Обновляем статус кандидата {applicant_id} на статус {status_id} для вакансии {vacancy_id} с комментарием: {comment}")
        
        # Используем проверенный эндпоинт с множественным числом
        endpoint = f"/accounts/{account_id}/applicants/{applicant_id}/vacancy"
        
        # Формируем данные для обновления статуса
        data = {
            'vacancy': vacancy_id,
            'status': status_id
        }
        
        if comment:
            data['comment'] = comment
        
        print(f"DEBUG: Пробуем эндпоинт {endpoint} с данными {data}")
        
        result = self._make_request('POST', endpoint, json=data)
        if result:
            print(f"DEBUG: Статус успешно обновлен через {endpoint}")
            
            # Сбрасываем кэш для этого кандидата
            user_id = self.user.id
            HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
            print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
            
            return result
        
        print(f"DEBUG: Не удалось обновить статус через {endpoint}")
        return None
    
    def update_applicant_tags(self, account_id: int, applicant_id: int, tag_ids: List[int]) -> Optional[Dict[str, Any]]:
        """
        Обновляет метки кандидата
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            tag_ids: Список ID меток
            
        Returns:
            Результат обновления или None
        """
        # Пробуем разные эндпоинты и форматы для меток
        endpoints = [
            f"/accounts/{account_id}/applicants/{applicant_id}/tags",  # Специальный эндпоинт для меток
            f"/accounts/{account_id}/applicants/{applicant_id}",  # Основной эндпоинт
        ]
        
        data_variants = [
            {'tags': tag_ids},  # Простой массив ID
            {'tag_ids': tag_ids},  # Альтернативное поле
            {'tags': [{'id': tag_id} for tag_id in tag_ids]},  # Массив объектов с id
            {'tags': [{'tag': tag_id} for tag_id in tag_ids]},  # Массив объектов с tag
            {'tags': [{'tag_id': tag_id} for tag_id in tag_ids]},  # Массив объектов с tag_id
            tag_ids,  # Прямая передача массива
        ]
        
        for endpoint in endpoints:
            for data in data_variants:
                print(f"DEBUG: Пробуем обновить метки через {endpoint} с данными {data}")
                result = self._make_request('PATCH', endpoint, json=data)
                if result:
                    # Сбрасываем кэш для этого кандидата
                    user_id = self.user.id
                    HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
                    print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
                    return result
                    
                # Также пробуем POST для специального эндпоинта
                if endpoint.endswith('/tags'):
                    result = self._make_request('POST', endpoint, json=data)
                    if result:
                        # Сбрасываем кэш для этого кандидата
                        user_id = self.user.id
                        HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
                        print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
                        return result
        
        return None
    
    def update_applicant_questionary(self, account_id: int, applicant_id: int, questionary_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Обновляет анкету кандидата
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            questionary_data: Данные анкеты для обновления
            
        Returns:
            Результат обновления или None
        """
        # Пробуем разные эндпоинты и форматы для анкеты
        endpoints = [
            f"/accounts/{account_id}/applicants/{applicant_id}/questionary",  # Специальный эндпоинт для анкеты
            f"/accounts/{account_id}/applicants/{applicant_id}",  # Основной эндпоинт
        ]
        
        data_variants = [
            questionary_data,  # Прямая передача данных
            {'questionary': questionary_data},  # Стандартный формат
            {'additional_fields': questionary_data},  # Альтернативное поле
            {'questionary_fields': questionary_data},  # Другой вариант
        ]
        
        for endpoint in endpoints:
            for data in data_variants:
                print(f"DEBUG: Пробуем обновить анкету через {endpoint} с данными {data}")
                result = self._make_request('PATCH', endpoint, json=data)
                if result:
                    # Сбрасываем кэш для этого кандидата
                    user_id = self.user.id
                    HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
                    print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
                    return result
                    
                # Также пробуем POST для специального эндпоинта
                if endpoint.endswith('/questionary'):
                    result = self._make_request('POST', endpoint, json=data)
                    if result:
                        # Сбрасываем кэш для этого кандидата
                        user_id = self.user.id
                        HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
                        print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
                        return result
        
        return None
    
    def update_applicant_scorecard_field(self, account_id: int, applicant_id: int, scorecard_url: str) -> Optional[Dict[str, Any]]:
        """
        Обновляет поле "Scorecard" кандидата ссылкой на scorecard
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            scorecard_url: Ссылка на scorecard файл
            
        Returns:
            Результат обновления или None
        """
        # Получаем схему анкеты для поиска поля Scorecard
        questionary_schema = self.get_applicant_questionary_schema(account_id)
        if not questionary_schema:
            print(f"❌ Не удалось получить схему анкеты для организации {account_id}")
            return None
        
        # Ищем поле Scorecard в схеме анкеты
        scorecard_field_id = None
        for field_id, field_info in questionary_schema.items():
            field_title = field_info.get('title', '').lower()
            field_type = field_info.get('type', '')
            
            # Ищем поле с названием "scorecard" или "scorecard" в названии
            if 'scorecard' in field_title or (field_type == 'url' and 'scorecard' in field_title):
                scorecard_field_id = field_id
                print(f"🔍 Найдено поле Scorecard в схеме: {field_id} = {field_info.get('title')} (тип: {field_type})")
                break
        
        if not scorecard_field_id:
            print(f"❌ Не найдено поле Scorecard в схеме анкеты для организации {account_id}")
            print(f"📋 Доступные поля в схеме: {[(k, v.get('title', '')) for k, v in questionary_schema.items()]}")
            return None
        
        # Обновляем поле Scorecard со ссылкой
        questionary_data = {
            scorecard_field_id: scorecard_url
        }
        
        print(f"📝 Обновляем поле Scorecard {scorecard_field_id} со ссылкой: {scorecard_url}")
        result = self.update_applicant_questionary(account_id, applicant_id, questionary_data)
        
        if result:
            print(f"✅ Поле Scorecard обновлено со ссылкой на scorecard")
        else:
            print(f"❌ Не удалось обновить поле Scorecard со ссылкой на scorecard")
        
        return result
    
    def create_applicant_comment(self, account_id: int, applicant_id: int, comment: str, vacancy_id: int = None, status_id: int = None) -> Optional[Dict[str, Any]]:
        """
        Создает комментарий для кандидата с привязкой к вакансии и статусу
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            comment: Текст комментария
            vacancy_id: ID вакансии (если не указан, получаем из данных кандидата)
            status_id: ID статуса (если не указан, получаем из данных кандидата)
            
        Returns:
            Созданный комментарий или None
        """
        # Очищаем комментарий от лишних символов
        clean_comment = comment.strip()
        if not clean_comment:
            return None
        
        # Получаем информацию о кандидате для получения вакансии и статуса
        applicant_data = self._make_request('GET', f"/accounts/{account_id}/applicants/{applicant_id}")
        if not applicant_data:
            print(f"DEBUG: Не удалось получить данные кандидата {applicant_id} для создания комментария")
            return None
        
        # Определяем вакансию и статус
        if not vacancy_id and applicant_data.get('links'):
            vacancy_id = applicant_data['links'][0].get('vacancy')
        
        if not status_id and applicant_data.get('links'):
            status_id = applicant_data['links'][0].get('status')
        
        if not vacancy_id or not status_id:
            print(f"DEBUG: У кандидата {applicant_id} нет привязанной вакансии ({vacancy_id}) или статуса ({status_id}) для создания комментария")
            return None
        
        print(f"DEBUG: Создаем комментарий для кандидата {applicant_id}, вакансия {vacancy_id}, статус {status_id}")
        
        # Используем эндпоинт для обновления статуса с комментарием
        # Это обеспечивает консистентность данных
        data = {
            'vacancy': vacancy_id,
            'status': status_id,
            'comment': clean_comment
        }
        
        endpoint = f"/accounts/{account_id}/applicants/{applicant_id}/vacancy"
        print(f"DEBUG: Создаем комментарий через {endpoint} с данными {data}")
        
        result = self._make_request('POST', endpoint, json=data)
        if result:
            print(f"DEBUG: Комментарий успешно создан через обновление статуса")
            
            # Сбрасываем кэш для этого кандидата
            user_id = self.user.id
            HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
            print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
            
            return result
        
        # Если не получилось через обновление статуса, пробуем обычные эндпоинты
        print(f"DEBUG: Пробуем альтернативные эндпоинты для комментария")
        data_variants = [
            {'comment': clean_comment},  # Стандартный формат
            {'text': clean_comment},  # Альтернативное поле
            {'message': clean_comment},  # Другой вариант
            {'body': clean_comment},  # Еще один вариант
        ]
        
        endpoints = [
            f"/accounts/{account_id}/applicants/{applicant_id}/logs",  # Основной эндпоинт для логов/комментариев
            f"/accounts/{account_id}/applicants/{applicant_id}/comments",  # Альтернативный
            f"/accounts/{account_id}/applicants/{applicant_id}/notes",  # Еще один вариант
        ]
        
        for endpoint in endpoints:
            for data in data_variants:
                print(f"DEBUG: Пробуем создать комментарий через {endpoint} с данными {data}")
                result = self._make_request('POST', endpoint, json=data)
                if result:
                    # Сбрасываем кэш для этого кандидата
                    user_id = self.user.id
                    HuntflowAPICache.clear_candidate(user_id, account_id, applicant_id)
                    print(f"🗑️ Сброшен кэш для кандидата: {applicant_id}")
                    return result
        
        return None
    
    def test_connection(self) -> bool:
        """
        Тестирует подключение к Huntflow API
        
        Returns:
            True если подключение успешно, False иначе
        """
        try:
            # Пробуем получить информацию о текущем пользователе
            response = self._make_request('GET', '/me')
            if response:
                print(f"✅ Подключение к Huntflow успешно!")
                print(f"👤 Пользователь: {response.get('name', 'Неизвестно')}")
                print(f"📧 Email: {response.get('email', 'Неизвестно')}")
                return True
            else:
                print("❌ Не удалось подключиться к Huntflow API")
                return False
        except Exception as e:
            print(f"❌ Ошибка при тестировании подключения: {e}")
            return False
    
    def _log_request(self, method: str, endpoint: str, status_code: int, request_data: dict, response_text: str, is_error: bool = False):
        """
        Логирует запрос к Huntflow API в базу данных
        """
        try:
            from .models import HuntflowLog
            
            # Определяем тип лога
            log_type = 'ERROR' if is_error else method
            
            # Парсим ответ если это JSON
            response_data = {}
            if response_text and not is_error:
                try:
                    import json
                    response_data = json.loads(response_text)
                except:
                    response_data = {'raw_response': response_text[:1000]}  # Ограничиваем размер
            
            # Создаем лог
            HuntflowLog.objects.create(
                log_type=log_type,
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                request_data=request_data,
                response_data=response_data,
                error_message=response_text if is_error else '',
                user=self.user
            )
        except Exception as e:
            print(f"⚠️ Не удалось сохранить лог: {e}")
    
    def upload_file(self, account_id: int, file_data: bytes, file_name: str, parse_file: bool = True) -> Optional[Dict[str, Any]]:
        """
        Загружает файл в Huntflow и парсит его для извлечения данных кандидата
        
        Args:
            account_id: ID организации
            file_data: Данные файла резюме
            file_name: Имя файла резюме
            parse_file: Парсить ли файл для извлечения данных (по умолчанию True)
            
        Returns:
            Результат загрузки с распарсенными данными или None
        """
        try:
            # Подготавливаем файл
            files = {
                'file': (file_name, file_data, 'application/pdf')
            }
            
            # Подготавливаем заголовки
            headers = {k: v for k, v in self.headers.items() if k.lower() != 'content-type'}
            if parse_file:
                headers['X-File-Parse'] = 'true'
            
            # Формируем URL
            base_url = self._get_base_url()
            if base_url.endswith('/v2'):
                url = f"{base_url}/accounts/{account_id}/upload"
            else:
                url = f"{base_url}/v2/accounts/{account_id}/upload"
            
            print(f"🔍 API запрос: POST {url}")
            print(f"📤 Файл: {file_name} ({len(file_data)} байт)")
            
            response = requests.post(
                url=url,
                headers=headers,
                files=files,
                timeout=60  # Увеличиваем таймаут для парсинга
            )
            
            print(f"📥 Ответ API: {response.status_code}")
            print(f"📥 Тело ответа: {response.text[:500]}...")
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"❌ Ошибка загрузки файла: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при загрузке файла: {e}")
            return None
    
    def create_applicant_from_parsed_data(self, account_id: int, parsed_data: Dict[str, Any], vacancy_id: int = None, task_name: str = None, task_description: str = None, task_comments: List[Dict[str, Any]] = None, assignees: List[Dict[str, Any]] = None, task_status: str = None, notion_data: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """
        Создает кандидата в Huntflow на основе распарсенных данных
        
        Args:
            account_id: ID организации
            parsed_data: Распарсенные данные из файла
            vacancy_id: ID вакансии для привязки (опционально)
            task_name: Название задачи ClickUp для извлечения имени (опционально)
            task_description: Описание задачи ClickUp (опционально)
            task_comments: Комментарии к задаче ClickUp (опционально)
            assignees: Исполнители задачи ClickUp для создания метки (опционально)
            task_status: Статус задачи ClickUp (опционально)
            notion_data: Данные из Notion для создания заметок (опционально)
            
        Returns:
            Созданный кандидат или None
        """
        try:
            print(f"🔍 Начинаем создание кандидата из данных: {parsed_data}")
            
            # Проверяем, что parsed_data - это словарь
            if isinstance(parsed_data, str):
                print(f"❌ parsed_data является строкой, а не словарем: {parsed_data}")
                return None
            
            # Подготавливаем данные кандидата согласно официальной документации Huntflow API
            # Безопасно извлекаем данные имени
            name_data = parsed_data.get('fields', {}).get('name') or {}
            
            # ПРИОРИТЕТ: Сначала пытаемся извлечь имя из названия задачи ClickUp
            first_name = ''
            last_name = ''
            middle_name = ''
            
            if task_name:
                print(f"🔍 Извлекаем ФИО из названия задачи: '{task_name}'")
                task_name_data = self._extract_name_from_task_title(task_name)
                first_name = task_name_data['first_name']
                last_name = task_name_data['last_name']
                middle_name = task_name_data['middle_name']
                print(f"✅ ФИО из названия задачи: {last_name} {first_name} {middle_name}")
            
            # Fallback: Если из названия задачи ничего не извлекли, пытаемся из резюме
            if not first_name and not last_name:
                print("🔍 ФИО из названия задачи не найдены, пытаемся извлечь из резюме")
                
                # Пытаемся извлечь имя из полей резюме
                name_data = parsed_data.get('fields', {}).get('name') or {}
                first_name = name_data.get('first', '')
                last_name = name_data.get('last', '')
                middle_name = name_data.get('middle', '')
                
                # Если имя не извлечено из полей, пытаемся извлечь из текста резюме
                if not first_name and not last_name:
                    text = parsed_data.get('text', '')
                    if text:
                        lines = text.split('\n')
                        if lines:
                            first_line = lines[0].strip()
                            # Умное извлечение имени (первая строка должна содержать только имя)
                            if first_line and len(first_line.split()) >= 2:
                                name_parts = first_line.split()
                                # Проверяем, что первая строка не содержит служебных слов
                                service_words = ['this', 'is', 'a', 'resume', 'cv', 'curriculum', 'vitae', 'the', 'document']
                                if not any(word.lower() in service_words for word in name_parts[:2]):
                                    first_name = name_parts[0]
                                    last_name = name_parts[1]
                                    if len(name_parts) >= 3:
                                        middle_name = name_parts[2]
                                    print(f"✅ ФИО из резюме: {last_name} {first_name} {middle_name}")
            
            # Если имя все еще не найдено, используем значения по умолчанию
            if not first_name:
                first_name = 'Из ClickUp'
            if not last_name:
                last_name = 'Кандидат'
            
            # Создаем личные заметки из данных ClickUp
            clickup_notes = self._create_clickup_comment(task_description, task_comments, task_status)
            
            # Создаем личные заметки из данных Notion, если они переданы
            notion_notes = ""
            if notion_data:
                notion_notes = self._create_notion_comment(
                    page_title=notion_data.get('title'),
                    page_content=notion_data.get('content'),
                    page_status=notion_data.get('status'),
                    page_priority=notion_data.get('priority'),
                    assignees=notion_data.get('assignees'),
                    tags=notion_data.get('tags'),
                    custom_properties=notion_data.get('custom_properties'),
                    attachments=notion_data.get('attachments'),
                    due_date=notion_data.get('due_date'),
                    comments=notion_data.get('comments')
                )
            
            # Объединяем заметки ClickUp и Notion
            combined_notes = ""
            if clickup_notes and notion_notes:
                combined_notes = f"{clickup_notes}\n\n{notion_notes}"
            elif clickup_notes:
                combined_notes = clickup_notes
            elif notion_notes:
                combined_notes = notion_notes
            
            # Текст резюме остается в externals
            resume_text = parsed_data.get('text', '')
            
            applicant_data = {
                'last_name': last_name,
                'first_name': first_name,
                'externals': [
                    {
                        'auth_type': 'NATIVE',
                        'data': {
                            'body': resume_text
                        }
                    }
                ]
            }
            
            # Сохраняем объединенные заметки для добавления после создания кандидата
            # (Huntflow API позволяет только 1 элемент в externals)
            print(f"📝 Подготовлены объединенные заметки для добавления после создания кандидата ({len(combined_notes) if combined_notes else 0} символов)")
            
            print(f"🔍 Базовые данные кандидата: {applicant_data}")
            
            # Добавляем дополнительные поля согласно документации Huntflow API
            if middle_name:
                applicant_data['middle_name'] = middle_name
            
            if parsed_data.get('fields', {}).get('email'):
                applicant_data['email'] = parsed_data.get('fields', {}).get('email')
            
            if parsed_data.get('fields', {}).get('phones') and len(parsed_data.get('fields', {}).get('phones', [])) > 0:
                applicant_data['phone'] = parsed_data.get('fields', {}).get('phones')[0]
            
            if parsed_data.get('fields', {}).get('position'):
                applicant_data['position'] = parsed_data.get('fields', {}).get('position')
            
            if parsed_data.get('fields', {}).get('salary'):
                applicant_data['money'] = parsed_data.get('fields', {}).get('salary')
            
            # Обработка даты рождения (должна быть в формате YYYY-MM-DD)
            birthdate = parsed_data.get('fields', {}).get('birthdate')
            if birthdate and birthdate.get('year') and birthdate.get('month') and birthdate.get('day'):
                try:
                    birthday = f"{birthdate['year']:04d}-{birthdate['month']:02d}-{birthdate['day']:02d}"
                    applicant_data['birthday'] = birthday
                except (ValueError, TypeError):
                    pass  # Пропускаем некорректные даты
            
            # Skype (deprecated, но добавляем если есть)
            if parsed_data.get('fields', {}).get('skype'):
                applicant_data['skype'] = parsed_data.get('fields', {}).get('skype')
            
            # Telegram через social (рекомендуемый способ)
            if parsed_data.get('fields', {}).get('telegram'):
                if 'social' not in applicant_data:
                    applicant_data['social'] = []
                applicant_data['social'].append({
                    'social_type': 'TELEGRAM',
                    'value': parsed_data.get('fields', {}).get('telegram')
                })
            
            # Фото (ID файла)
            if parsed_data.get('photo', {}).get('id'):
                applicant_data['photo'] = parsed_data.get('photo', {}).get('id')
            
            # Файлы (список ID файлов)
            if parsed_data.get('id'):  # ID загруженного файла
                if 'files' not in applicant_data:
                    applicant_data['files'] = []
                applicant_data['files'].append(parsed_data.get('id'))
            
            # Убираем пустые поля
            applicant_data = {k: v for k, v in applicant_data.items() if v is not None and v != ''}
            
            # Сохраняем vacancy_id для отдельной привязки после создания кандидата
            target_vacancy_id = None
            if vacancy_id and vacancy_id != '' and str(vacancy_id).lower() != 'none':
                try:
                    target_vacancy_id = int(vacancy_id) if isinstance(vacancy_id, str) and vacancy_id.isdigit() else vacancy_id
                    print(f"🔍 Сохраняем vacancy_id для отдельной привязки: {target_vacancy_id}")
                except (ValueError, TypeError):
                    print(f"⚠️ Неверный формат vacancy_id: {vacancy_id}")
                    target_vacancy_id = None
            else:
                print(f"⚠️ Вакансия не указана: vacancy_id='{vacancy_id}'")
            
            # НЕ добавляем vacancy в данные создания кандидата, так как это может не работать
            # Будем привязывать отдельным запросом после создания
            
            # Сохраняем информацию об исполнителе для добавления тега после создания кандидата
            assignee_info = None
            if assignees and len(assignees) > 0:
                # Берем первого исполнителя
                assignee = assignees[0]
                
                # Обрабатываем разные форматы данных исполнителя
                if isinstance(assignee, dict):
                    assignee_name = assignee.get('username', assignee.get('email', 'Неизвестно'))
                elif isinstance(assignee, str):
                    assignee_name = assignee
                else:
                    assignee_name = str(assignee)
                
                assignee_info = assignee_name
                print(f"🏷️ Сохранили информацию об исполнителе для добавления тега: {assignee_name}")
            
            print(f"📤 Финальные данные кандидата: {applicant_data}")
            print(f"📝 External источник: {applicant_data.get('externals', [{}])[0].get('data', {}).get('body', '')[:100]}...")
            print(f"🔗 Вакансия в финальных данных: {applicant_data.get('vacancy', 'НЕ УКАЗАНА')}")
            
            # Создаем кандидата
            print(f"🔍 Отправляем запрос на создание кандидата с данными: {applicant_data}")
            result = self._make_request('POST', f"/accounts/{account_id}/applicants", json=applicant_data)
            print(f"🔍 Результат _make_request: {result}")
            
            if result:
                print(f"✅ Кандидат успешно создан: {result}")
                applicant_id = result.get('id')
                
                # Привязываем кандидата к вакансии, если указана
                if applicant_id and target_vacancy_id:
                    print(f"🔗 Привязываем кандидата {applicant_id} к вакансии {target_vacancy_id}")
                    binding_result = self._bind_applicant_to_vacancy(account_id, applicant_id, target_vacancy_id)
                    if binding_result:
                        print(f"✅ Кандидат успешно привязан к вакансии")
                    else:
                        print(f"❌ Не удалось привязать кандидата к вакансии")
                
                # Добавляем теги
                if applicant_id:
                    # Добавляем метку clickup-new
                    print(f"🏷️ Добавляем метку clickup-new")
                    clickup_tag_added = self._add_tag_to_applicant(account_id, applicant_id, "clickup-new")
                    if clickup_tag_added:
                        print(f"✅ Метка clickup-new добавлена к кандидату")
                    else:
                        print(f"❌ Не удалось добавить метку clickup-new к кандидату")
                    
                    # Добавляем тег с исполнителем, если есть
                    if assignee_info:
                        print(f"🏷️ Добавляем тег для исполнителя: {assignee_info}")
                        tag_added = self._add_tag_to_applicant(account_id, applicant_id, assignee_info)
                        if tag_added:
                            print(f"✅ Тег исполнителя добавлен к кандидату")
                        else:
                            print(f"❌ Не удалось добавить тег исполнителя к кандидату")
                
                # Добавляем комментарий с объединенными данными, если есть
                if combined_notes and applicant_id:
                    print(f"🔍 Добавляем комментарий с объединенными данными к кандидату {applicant_id}")
                    
                    comment_result = self.add_applicant_comment(
                        account_id=account_id,
                        applicant_id=applicant_id,
                        comment=combined_notes,
                        vacancy_id=vacancy_id
                    )
                    
                    if comment_result:
                        print(f"✅ Комментарий с объединенными данными успешно добавлен")
                    else:
                        print(f"⚠️ Кандидат создан, но не удалось добавить комментарий с объединенными данными")
                
                return result
            else:
                print(f"❌ _make_request вернул None для создания кандидата")
                return None
            
        except Exception as e:
            print(f"❌ Ошибка при создании кандидата: {e}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            return None
    
    def add_applicant_comment(self, account_id: int, applicant_id: int, comment: str, vacancy_id: int = None) -> Optional[Dict[str, Any]]:
        """
        Добавляет комментарий к кандидату в Huntflow
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            comment: Текст комментария
            vacancy_id: ID вакансии (опционально, если не указан - добавляется в личные заметки)
            
        Returns:
            Результат добавления комментария или None
        """
        try:
            print(f"🔍 Добавляем комментарий к кандидату {applicant_id}")
            
            comment_data = {
                'comment': comment
            }
            
            # Если указана вакансия, добавляем её
            if vacancy_id and vacancy_id != '':
                comment_data['vacancy'] = vacancy_id
                print(f"📝 Комментарий будет добавлен к вакансии {vacancy_id}")
            else:
                print(f"📝 Комментарий будет добавлен в личные заметки")
            
            print(f"📤 Данные комментария: {comment_data}")
            
            result = self._make_request('POST', f"/accounts/{account_id}/applicants/{applicant_id}/logs", json=comment_data)
            
            if result:
                print(f"✅ Комментарий успешно добавлен: {result}")
                return result
            else:
                print(f"❌ Не удалось добавить комментарий")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при добавлении комментария: {e}")
            return None
    
    def create_linkedin_profile_data(self, linkedin_url: str, task_name: str = None, task_description: str = None) -> Optional[Dict[str, Any]]:
        """
        Создает данные профиля на основе LinkedIn ссылки
        
        Args:
            linkedin_url: Ссылка на LinkedIn профиль
            task_name: Название задачи из ClickUp
            task_description: Описание задачи из ClickUp
            
        Returns:
            Данные профиля в формате Huntflow или None
        """
        try:
            print(f"🔍 Создаем данные LinkedIn профиля для: {linkedin_url}")
            
            # Извлекаем имя из названия задачи
            name_data = self._extract_name_from_task_title(task_name) if task_name else {}
            
            # Создаем базовые данные профиля в формате Huntflow
            profile_data = {
                'id': None,  # Будет создан Huntflow
                'url': linkedin_url,
                'content_type': 'text/html',
                'name': 'LinkedIn Profile',
                'text': f"LinkedIn профиль: {linkedin_url}",
                'fields': {
                    'name': {
                        'first': name_data.get('first_name', ''),
                        'last': name_data.get('last_name', ''),
                        'middle': name_data.get('middle_name', '')
                    },
                    'email': '',
                    'phones': [],
                    'position': '',
                    'experience': [],
                    'skills': [],
                    'education': []
                },
                'parsing_meta': {
                    'last_names_ignored': False,
                    'emails_ignored': False,
                    'phones_ignored': False
                }
            }
            
            # Если есть описание задачи, пытаемся извлечь дополнительную информацию
            if task_description:
                # Простой парсинг описания для извлечения email и телефона
                import re
                
                # Ищем email
                email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', task_description)
                if email_match:
                    profile_data['fields']['email'] = email_match.group()
                
                # Ищем телефоны
                phone_patterns = [
                    r'\+?[1-9]\d{1,14}',  # Международный формат
                    r'\+?7\s?\(?\d{3}\)?\s?\d{3}[- ]?\d{2}[- ]?\d{2}',  # Российский формат
                    r'\+?375\s?\(?\d{2}\)?\s?\d{3}[- ]?\d{2}[- ]?\d{2}',  # Белорусский формат
                ]
                
                phones = []
                for pattern in phone_patterns:
                    matches = re.findall(pattern, task_description)
                    phones.extend(matches)
                
                if phones:
                    profile_data['fields']['phones'] = list(set(phones))  # Убираем дубликаты
            
            print(f"✅ Созданы данные LinkedIn профиля:")
            print(f"  - Имя: {profile_data['fields']['name']['first']} {profile_data['fields']['name']['last']}")
            print(f"  - Email: {profile_data['fields']['email']}")
            print(f"  - Телефоны: {profile_data['fields']['phones']}")
            
            return profile_data
            
        except Exception as e:
            print(f"❌ Ошибка создания данных LinkedIn профиля: {e}")
            return None
    
    def create_rabota_by_profile_data(self, rabota_url: str, task_name: str = None, task_description: str = None) -> Optional[Dict[str, Any]]:
        """
        Создает данные профиля на основе rabota.by ссылки
        
        Args:
            rabota_url: Ссылка на rabota.by профиль
            task_name: Название задачи из ClickUp
            task_description: Описание задачи из ClickUp
            
        Returns:
            Данные профиля в формате Huntflow или None
        """
        try:
            print(f"🔍 Создаем данные rabota.by профиля для: {rabota_url}")
            
            # Извлекаем имя из названия задачи
            name_data = self._extract_name_from_task_title(task_name) if task_name else {}
            
            # Создаем базовые данные профиля в формате Huntflow
            profile_data = {
                'id': None,  # Будет создан Huntflow
                'url': rabota_url,
                'content_type': 'text/html',
                'name': 'Rabota.by Profile',
                'text': f"Rabota.by профиль: {rabota_url}",
                'fields': {
                    'name': {
                        'first': name_data.get('first_name', ''),
                        'last': name_data.get('last_name', ''),
                        'middle': name_data.get('middle_name', '')
                    },
                    'email': '',
                    'phones': [],
                    'position': '',
                    'experience': [],
                    'skills': [],
                    'education': []
                },
                'parsing_meta': {
                    'last_names_ignored': False,
                    'emails_ignored': False,
                    'phones_ignored': False
                }
            }
            
            print(f"✅ Созданы данные rabota.by профиля:")
            print(f"  - Имя: {name_data.get('first_name', '')} {name_data.get('last_name', '')}")
            print(f"  - Email: {profile_data['fields']['email']}")
            print(f"  - Телефоны: {profile_data['fields']['phones']}")
            
            return profile_data
            
        except Exception as e:
            print(f"❌ Ошибка создания данных rabota.by профиля: {e}")
            return None
    
    def _get_or_create_tag(self, account_id: int, tag_name: str) -> Optional[int]:
        """
        Получает существующий тег или создает новый
        
        Args:
            account_id: ID организации
            tag_name: Название тега
            
        Returns:
            ID тега или None
        """
        try:
            print(f"🔍 Ищем тег: {tag_name}")
            
            # Сначала пытаемся найти существующий тег
            tags_response = self._make_request('GET', f"/accounts/{account_id}/tags")
            
            if tags_response and 'items' in tags_response:
                for tag in tags_response['items']:
                    if tag.get('name') == tag_name:
                        print(f"✅ Найден существующий тег: {tag_name} (ID: {tag['id']})")
                        return tag['id']
            
            # Если тег не найден, создаем новый
            print(f"🔍 Создаем новый тег: {tag_name}")
            tag_data = {
                'name': tag_name,
                'color': '30b25b'  # Зеленый цвет по умолчанию
            }
            new_tag = self._make_request('POST', f"/accounts/{account_id}/tags", json=tag_data)
            
            if new_tag and 'id' in new_tag:
                print(f"✅ Создан новый тег: {tag_name} (ID: {new_tag['id']})")
                return new_tag['id']
            else:
                print(f"❌ Не удалось создать тег: {tag_name}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при работе с тегами: {e}")
            return None
    
    def _find_tag_by_name(self, account_id: int, assignee_name: str) -> Optional[int]:
        """
        Ищет существующий тег по имени исполнителя
        
        Args:
            account_id: ID организации
            assignee_name: Имя исполнителя из ClickUp
            
        Returns:
            ID найденного тега или None
        """
        try:
            print(f"🔍 Ищем тег для исполнителя: {assignee_name}")
            
            # Получаем все теги из Huntflow
            tags_response = self._make_request('GET', f"/accounts/{account_id}/tags")
            
            if tags_response and 'items' in tags_response:
                print(f"📋 Найдено тегов: {len(tags_response['items'])}")
                
                # Ищем тег по точному совпадению имени
                for tag in tags_response['items']:
                    tag_name = tag.get('name', '')
                    print(f"  - Проверяем тег: '{tag_name}'")
                    
                    if tag_name == assignee_name:
                        print(f"✅ Найден точный тег: {tag_name} (ID: {tag['id']})")
                        return tag['id']
                
                # Если точного совпадения нет, ищем по частичному совпадению
                print(f"🔍 Точного совпадения нет, ищем частичное совпадение...")
                for tag in tags_response['items']:
                    tag_name = tag.get('name', '')
                    
                    # Проверяем, содержит ли имя тега имя исполнителя
                    if assignee_name.lower() in tag_name.lower() or tag_name.lower() in assignee_name.lower():
                        print(f"✅ Найден частичный тег: {tag_name} (ID: {tag['id']})")
                        return tag['id']
                
                # Если это тег clickup-new, пытаемся создать его
                if assignee_name == "clickup-new":
                    print(f"🔍 Тег clickup-new не найден, создаем его...")
                    return self._create_tag(account_id, "clickup-new", "#FF6B35")  # Оранжевый цвет для ClickUp
                
                print(f"❌ Тег для исполнителя '{assignee_name}' не найден")
                return None
            else:
                print(f"❌ Не удалось получить список тегов")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при поиске тега: {e}")
            return None
    
    def _create_tag(self, account_id: int, tag_name: str, color: str = "#007BFF") -> Optional[int]:
        """
        Создает новый тег в Huntflow
        
        Args:
            account_id: ID организации
            tag_name: Название тега
            color: Цвет тега в формате HEX
            
        Returns:
            ID созданного тега или None
        """
        try:
            print(f"🔍 Создаем тег: {tag_name} (цвет: {color})")
            
            tag_data = {
                'name': tag_name,
                'color': color
            }
            
            result = self._make_request('POST', f"/accounts/{account_id}/tags", json=tag_data)
            
            if result and 'id' in result:
                print(f"✅ Тег {tag_name} создан с ID: {result['id']}")
                return result['id']
            else:
                print(f"❌ Не удалось создать тег {tag_name}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка при создании тега {tag_name}: {e}")
            return None
    
    def _bind_applicant_to_vacancy(self, account_id: int, applicant_id: int, vacancy_id: int) -> bool:
        """
        Привязывает кандидата к вакансии
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            vacancy_id: ID вакансии
            
        Returns:
            True если привязка успешна, False иначе
        """
        try:
            print(f"🔗 Привязываем кандидата {applicant_id} к вакансии {vacancy_id}")
            
            # Сначала получаем информацию о вакансии для получения статуса по умолчанию
            vacancy_data = self.get_vacancy(account_id, vacancy_id)
            if not vacancy_data:
                print(f"❌ Не удалось получить данные вакансии {vacancy_id}")
                return False
            
            # Получаем статусы вакансии
            statuses = self.get_vacancy_statuses(account_id)
            if not statuses or 'items' not in statuses:
                print(f"❌ Не удалось получить статусы вакансии")
                return False
            
            # Находим статус по умолчанию (обычно первый в списке)
            default_status = None
            for status in statuses['items']:
                if status.get('order', 0) == 1 or status.get('name', '').lower() in ['новая', 'new', 'отклик', 'response']:
                    default_status = status['id']
                    break
            
            if not default_status and statuses['items']:
                default_status = statuses['items'][0]['id']  # Берем первый статус
            
            if not default_status:
                print(f"❌ Не удалось найти статус по умолчанию для вакансии")
                return False
            
            print(f"🎯 Используем статус {default_status} для привязки к вакансии")
            
            # Привязываем кандидата к вакансии с статусом
            endpoint = f"/accounts/{account_id}/applicants/{applicant_id}/vacancy"
            data = {
                'vacancy': vacancy_id,
                'status': default_status,
                'comment': 'Автоматически добавлен из ClickUp'
            }
            
            result = self._make_request('POST', endpoint, json=data)
            
            if result:
                print(f"✅ Кандидат {applicant_id} успешно привязан к вакансии {vacancy_id} со статусом {default_status}")
                return True
            else:
                print(f"❌ Не удалось привязать кандидата к вакансии")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка при привязке кандидата к вакансии: {e}")
            return False
    
    def _add_tag_to_applicant(self, account_id: int, applicant_id: int, assignee_name: str) -> bool:
        """
        Добавляет тег к кандидату после его создания
        
        Args:
            account_id: ID организации
            applicant_id: ID кандидата
            assignee_name: Имя исполнителя из ClickUp
            
        Returns:
            True если тег добавлен успешно, False иначе
        """
        try:
            print(f"🔍 Добавляем тег к кандидату {applicant_id} для исполнителя: {assignee_name}")
            
            # Ищем существующий тег по имени исполнителя
            tag_id = self._find_tag_by_name(account_id, assignee_name)
            
            if not tag_id:
                print(f"❌ Тег для исполнителя '{assignee_name}' не найден")
                return False
            
            # Добавляем тег к кандидату через специальный эндпоинт
            tag_data = {'tags': [tag_id]}
            result = self._make_request('POST', f"/accounts/{account_id}/applicants/{applicant_id}/tags", json=tag_data)
            
            if result:
                print(f"✅ Тег {tag_id} успешно добавлен к кандидату {applicant_id}")
                return True
            else:
                print(f"❌ Не удалось добавить тег к кандидату")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка при добавлении тега к кандидату: {e}")
            return False
    
    def create_applicant_from_clickup_task(self, clickup_task) -> Dict[str, Any]:
        """
        Создает кандидата в Huntflow из задачи ClickUp
        Работает точно так же, как transfer_to_huntflow в views.py
        
        Args:
            clickup_task: Объект ClickUpTask
            
        Returns:
            Результат создания кандидата
        """
        try:
            print(f"🔄 Создаем кандидата в Huntflow из задачи {clickup_task.task_id}")
            
            # Получаем account_id
            accounts = self.get_accounts()
            if not accounts or not accounts.get('items'):
                return {
                    'success': False,
                    'error': 'Не удалось получить список организаций'
                }
            account_id = accounts['items'][0]['id']
            
            # Получаем вложения и комментарии через ClickUp API
            from apps.clickup_int.services import ClickUpService
            clickup_service = ClickUpService(clickup_task.user.clickup_api_key)
            attachments = clickup_service.get_task_attachments(clickup_task.task_id)
            comments = clickup_service.get_task_comments(clickup_task.task_id)
            
            print(f"🔍 Данные задачи для переноса:")
            print(f"  - Название: {clickup_task.name}")
            print(f"  - Описание: {clickup_task.description[:100] if clickup_task.description else 'Нет описания'}...")
            print(f"  - Комментарии: {len(comments) if comments else 0}")
            print(f"  - Вложения: {len(attachments) if attachments else 0}")
            
            # Проверяем, есть ли PDF файлы для парсинга
            pdf_attachments = [att for att in attachments if att.get('extension', '').lower() == 'pdf']
            linkedin_url = None
            rabota_url = None
            
            if not pdf_attachments:
                # Если нет PDF файлов, ищем LinkedIn ссылку в custom fields
                custom_fields = clickup_task.get_custom_fields_display()
                for field in custom_fields:
                    field_name = field.get('name', '').lower()
                    field_value = field.get('value', '')
                    
                    # Ищем LinkedIn ссылки
                    if field_name in ['linkedin', 'linkedin profile', 'linkedin url']:
                        linkedin_url = field_value
                        break
                    
                    # Ищем rabota.by ссылки
                    if field_name in ['rabota', 'rabota.by', 'rabota url', 'resume', 'резюме'] or 'rabota.by' in field_value.lower():
                        rabota_url = field_value
                        break
                
                # Если не нашли ни LinkedIn, ни rabota.by
                if not linkedin_url and not rabota_url:
                    return {
                        'success': False,
                        'error': 'У задачи нет PDF файлов, LinkedIn или rabota.by ссылок для переноса'
                    }
            
            parsed_data = None
            
            if pdf_attachments:
                # Обрабатываем PDF файлы
                # Сортируем по дате (самый старый первый)
                oldest_attachment = min(pdf_attachments, key=lambda x: x.get('date', 0))
                
                # Скачиваем файл
                import requests
                file_response = requests.get(oldest_attachment['url'], timeout=30)
                if file_response.status_code != 200:
                    return {
                        'success': False,
                        'error': 'Не удалось скачать файл из ClickUp'
                    }
                
                # Загружаем файл в Huntflow с парсингом
                parsed_data = self.upload_file(
                    account_id=account_id,
                    file_data=file_response.content,
                    file_name=oldest_attachment.get('title', 'resume.pdf'),
                    parse_file=True
                )
                
                if not parsed_data:
                    return {
                        'success': False,
                        'error': 'Не удалось загрузить файл в Huntflow'
                    }
            
            elif linkedin_url:
                # Обрабатываем LinkedIn ссылку
                print(f"🔍 Обрабатываем LinkedIn ссылку: {linkedin_url}")
                
                # Создаем данные для LinkedIn профиля
                parsed_data = self.create_linkedin_profile_data(
                    linkedin_url=linkedin_url,
                    task_name=clickup_task.name,
                    task_description=clickup_task.description
                )
                
                if not parsed_data:
                    return {
                        'success': False,
                        'error': 'Не удалось обработать LinkedIn профиль'
                    }
            
            elif rabota_url:
                # Обрабатываем rabota.by ссылку
                print(f"🔍 Обрабатываем rabota.by ссылку: {rabota_url}")
                
                # Создаем данные для rabota.by профиля
                parsed_data = self.create_rabota_by_profile_data(
                    rabota_url=rabota_url,
                    task_name=clickup_task.name,
                    task_description=clickup_task.description
                )
                
                if not parsed_data:
                    return {
                        'success': False,
                        'error': 'Не удалось обработать rabota.by профиль'
                    }
            
            # Создаем кандидата на основе распарсенных данных
            print(f"🔍 Создаем кандидата с данными: account_id={account_id}, task_name='{clickup_task.name}'")
            applicant = self.create_applicant_from_parsed_data(
                account_id=account_id,
                parsed_data=parsed_data,
                vacancy_id=None,  # Без привязки к вакансии
                task_name=clickup_task.name,
                task_description=clickup_task.description,
                task_comments=comments,
                assignees=clickup_task.assignees,
                task_status=clickup_task.status
            )
            print(f"🔍 Результат создания кандидата: {applicant}")
            
            if not applicant:
                return {
                    'success': False,
                    'error': 'Не удалось создать кандидата в Huntflow'
                }
            
            return {
                'success': True,
                'applicant_id': applicant.get('id'),
                'message': f'Кандидат успешно создан в Huntflow (ID: {applicant.get("id")})'
            }
            
        except Exception as e:
            print(f"❌ Ошибка при создании кандидата из задачи ClickUp: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_candidate_field(self, candidate_id: str, field_data: Dict[str, Any]) -> bool:
        """
        Обновляет поле кандидата в Huntflow
        
        Args:
            candidate_id: ID кандидата в Huntflow
            field_data: Словарь с данными для обновления
            
        Returns:
            bool: True если обновление прошло успешно, False в противном случае
        """
        try:
            # Получаем account_id
            accounts = self.get_accounts()
            if not accounts or 'items' not in accounts or not accounts['items']:
                print("❌ Не удалось получить список аккаунтов")
                return False
            
            account_id = accounts['items'][0]['id']
            
            # Определяем, какие поля являются дополнительными (string_field_*, custom_field_*)
            additional_fields = {}
            main_fields = {}
            
            for field_name, field_value in field_data.items():
                if field_name.startswith('string_field_') or field_name.startswith('custom_field_'):
                    additional_fields[field_name] = field_value
                else:
                    main_fields[field_name] = field_value
            
            success = True
            
            # Обновляем основные поля
            if main_fields:
                url = f"{self._get_base_url()}/v2/accounts/{account_id}/applicants/{candidate_id}"
                print(f"🔍 Обновляем основные поля кандидата {candidate_id}")
                print(f"📤 Данные для обновления: {main_fields}")
                
                response = requests.patch(
                    url,
                    headers=self.headers,
                    json=main_fields,
                    timeout=30
                )
                
                print(f"📥 Ответ API: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"✅ Основные поля кандидата {candidate_id} успешно обновлены")
                else:
                    print(f"❌ Ошибка при обновлении основных полей: {response.status_code}")
                    print(f"📥 Тело ответа: {response.text}")
                    success = False
            
            # Обновляем дополнительные поля
            if additional_fields:
                url = f"{self._get_base_url()}/v2/accounts/{account_id}/applicants/{candidate_id}/questionary"
                print(f"🔍 Обновляем дополнительные поля кандидата {candidate_id}")
                print(f"📤 Данные для обновления: {additional_fields}")
                
                response = requests.patch(
                    url,
                    headers=self.headers,
                    json=additional_fields,
                    timeout=30
                )
                
                print(f"📥 Ответ API: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"✅ Дополнительные поля кандидата {candidate_id} успешно обновлены")
                else:
                    print(f"❌ Ошибка при обновлении дополнительных полей: {response.status_code}")
                    print(f"📥 Тело ответа: {response.text}")
                    success = False
            
            return success
                
        except Exception as e:
            print(f"❌ Ошибка при обновлении поля кандидата: {e}")
            return False
    