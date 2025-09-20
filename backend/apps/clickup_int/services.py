import requests
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from django.conf import settings
from django.utils import timezone as django_timezone
import logging

logger = logging.getLogger(__name__)


class ClickUpAPIError(Exception):
    """Исключение для ошибок ClickUp API"""
    pass


class ClickUpService:
    """Сервис для работы с ClickUp API"""
    
    BASE_URL = "https://api.clickup.com/api/v2"
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.headers = {
            'Authorization': api_token,
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method: str, endpoint: str, params: Dict = None, data: Dict = None) -> Dict:
        """Выполняет запрос к ClickUp API"""
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        
        try:
            logger.info(f"ClickUp API запрос: {method} {url}")
            
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=data,
                timeout=30
            )
            
            logger.info(f"ClickUp API ответ: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                raise ClickUpAPIError("Неверный API токен")
            elif response.status_code == 403:
                raise ClickUpAPIError("Недостаточно прав доступа")
            elif response.status_code == 404:
                raise ClickUpAPIError("Ресурс не найден")
            elif response.status_code == 429:
                raise ClickUpAPIError("Превышен лимит запросов")
            else:
                error_msg = f"Ошибка API: {response.status_code}"
                try:
                    error_data = response.json()
                    if 'err' in error_data:
                        error_msg += f" - {error_data['err']}"
                except:
                    error_msg += f" - {response.text}"
                
                raise ClickUpAPIError(error_msg)
                
        except requests.exceptions.Timeout:
            raise ClickUpAPIError("Таймаут запроса к ClickUp API")
        except requests.exceptions.ConnectionError:
            raise ClickUpAPIError("Ошибка подключения к ClickUp API")
        except requests.exceptions.RequestException as e:
            raise ClickUpAPIError(f"Ошибка запроса: {str(e)}")
    
    def test_connection(self) -> bool:
        """Тестирует подключение к ClickUp API"""
        try:
            response = self._make_request('GET', '/user')
            return 'user' in response
        except ClickUpAPIError:
            return False
    
    def get_user_info(self) -> Dict:
        """Получает информацию о пользователе"""
        return self._make_request('GET', '/user')
    
    def get_teams(self) -> List[Dict]:
        """Получает список команд"""
        response = self._make_request('GET', '/team')
        return response.get('teams', [])
    
    def get_spaces(self, team_id: str = None) -> List[Dict]:
        """Получает список пространств команды или все пространства пользователя"""
        if team_id:
            response = self._make_request('GET', f'/team/{team_id}/space')
        else:
            # Получаем все пространства пользователя
            response = self._make_request('GET', '/space')
        return response.get('spaces', [])
    
    def get_folders(self, space_id: str) -> List[Dict]:
        """Получает список папок пространства"""
        response = self._make_request('GET', f'/space/{space_id}/folder')
        return response.get('folders', [])
    
    def get_lists(self, folder_id: str = None, space_id: str = None) -> List[Dict]:
        """Получает список списков задач"""
        if folder_id:
            response = self._make_request('GET', f'/folder/{folder_id}/list')
        elif space_id:
            response = self._make_request('GET', f'/space/{space_id}/list')
        else:
            raise ClickUpAPIError("Необходимо указать folder_id или space_id")
        
        return response.get('lists', [])
    
    def get_tasks(self, list_id: str, include_closed: bool = False, page: int = 0) -> List[Dict]:
        """Получает список задач из списка"""
        params = {
            'include_closed': include_closed,
            'page': page,
            'order_by': 'updated',
            'reverse': True,
            'subtasks': True
        }
        
        response = self._make_request('GET', f'/list/{list_id}/task', params=params)
        return response.get('tasks', [])
    
    def get_task(self, task_id: str) -> Dict:
        """Получает детальную информацию о задаче"""
        return self._make_request('GET', f'/task/{task_id}')
    
    def get_task_attachments(self, task_id: str) -> List[Dict]:
        """Получает вложения задачи"""
        try:
            # Сначала пробуем получить вложения из отдельного endpoint'а
            response = self._make_request('GET', f'/task/{task_id}/attachment')
            return response.get('attachments', [])
        except ClickUpAPIError:
            # Если отдельный endpoint не работает, получаем вложения из информации о задаче
            try:
                task_info = self._make_request('GET', f'/task/{task_id}')
                return task_info.get('attachments', [])
            except ClickUpAPIError as e:
                logger.warning(f"Не удалось получить вложения для задачи {task_id}: {e}")
                return []
    
    def get_task_comments(self, task_id: str) -> List[Dict]:
        """Получает комментарии к задаче"""
        response = self._make_request('GET', f'/task/{task_id}/comment')
        comments = response.get('comments', [])
        
        # Парсим комментарии для читаемого отображения
        parsed_comments = []
        for comment in comments:
            parsed_comment = self._parse_comment(comment)
            parsed_comments.append(parsed_comment)
        
        return parsed_comments
    
    def _parse_comment(self, comment_data: Dict) -> Dict:
        """Парсит структуру комментария для читаемого отображения"""
        if not comment_data:
            return comment_data
        
        # Копируем базовые данные
        parsed = comment_data.copy()
        
        # Парсим содержимое комментария
        comment_text = comment_data.get('comment', '')
        if isinstance(comment_text, list):
            # Это структурированный комментарий с блоками
            parsed_text = self._parse_comment_blocks(comment_text)
            parsed['comment'] = parsed_text
            parsed['comment_raw'] = comment_text  # Сохраняем оригинал
        elif isinstance(comment_text, str):
            parsed['comment'] = comment_text
            parsed['comment_raw'] = comment_text
        
        # Парсим дату
        date_value = comment_data.get('date', '')
        if date_value:
            parsed_date = self._parse_datetime(date_value)
            parsed['date'] = parsed_date
            parsed['date_raw'] = date_value
        
        return parsed
    
    def _parse_comment_blocks(self, blocks: List[Dict]) -> str:
        """Парсит блоки комментария в читаемый текст"""
        if not blocks:
            return ''
        
        result = []
        for block in blocks:
            text = block.get('text', '')
            attributes = block.get('attributes', {})
            
            if text:
                # Обрабатываем специальные атрибуты
                if attributes.get('bold'):
                    text = f'**{text}**'
                elif attributes.get('italic'):
                    text = f'*{text}*'
                elif attributes.get('underline'):
                    text = f'<u>{text}</u>'
                elif attributes.get('strikethrough'):
                    text = f'~~{text}~~'
                elif attributes.get('link'):
                    link_url = attributes.get('link')
                    text = f'[{text}]({link_url})'
                
                result.append(text)
        
        # Объединяем результат и применяем дополнительное форматирование
        combined_text = ''.join(result)
        
        # Обрабатываем Markdown-подобное форматирование
        combined_text = self._apply_markdown_formatting(combined_text)
        
        return combined_text
    
    def _apply_markdown_formatting(self, text: str) -> str:
        """Применяет Markdown-подобное форматирование к тексту"""
        if not text:
            return text
        
        # Обрабатываем жирный текст (**текст**)
        import re
        text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
        
        # Обрабатываем курсив (*текст*)
        text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
        
        # Обрабатываем подчеркивание (__текст__)
        text = re.sub(r'__(.*?)__', r'<u>\1</u>', text)
        
        # Обрабатываем зачеркивание (~~текст~~)
        text = re.sub(r'~~(.*?)~~', r'<del>\1</del>', text)
        
        # Обрабатываем ссылки [текст](url)
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank">\1</a>', text)
        
        return text
    
    def parse_task_data(self, task_data: Dict) -> Dict:
        """Парсит данные задачи из ClickUp API в формат для сохранения"""
        if not task_data:
            raise ClickUpAPIError("Данные задачи пусты")
        
        try:
            # Основные поля
            task_id = task_data.get('id', '')
            if not task_id:
                raise ClickUpAPIError("ID задачи не найден")
            
            name = task_data.get('name', '')
            description = task_data.get('description', '')
            
            # Статус и приоритет
            status = ''
            if task_data.get('status'):
                status = task_data['status'].get('status', '') if isinstance(task_data['status'], dict) else str(task_data['status'])
            
            priority = ''
            if task_data.get('priority'):
                priority = task_data['priority'].get('priority', '') if isinstance(task_data['priority'], dict) else str(task_data['priority'])
            
            # Даты
            date_created = self._parse_datetime(task_data.get('date_created'))
            date_updated = self._parse_datetime(task_data.get('date_updated'))
            due_date = self._parse_datetime(task_data.get('due_date'))
            
            # Ссылка
            url = task_data.get('url', '')
            
            # Исполнители
            assignees = task_data.get('assignees', [])
            if assignees and isinstance(assignees, list):
                assignees = [assignee.get('username', '') for assignee in assignees if isinstance(assignee, dict)]
            
            # Теги
            tags = task_data.get('tags', [])
            if tags and isinstance(tags, list):
                tags = [tag.get('name', '') for tag in tags if isinstance(tag, dict)]
            
            # Вложения (получаем отдельно)
            attachments = []
            try:
                attachments_data = self.get_task_attachments(task_id)
                if attachments_data:
                    attachments = [{
                        'id': att.get('id', ''),
                        'name': att.get('name', ''),
                        'url': att.get('url', ''),
                        'size': att.get('size', 0)
                    } for att in attachments_data if isinstance(att, dict)]
            except ClickUpAPIError as e:
                logger.warning(f"Не удалось получить вложения для задачи {task_id}: {e}")
            
            # Дополнительные поля (custom fields)
            custom_fields = {}
            if task_data.get('custom_fields'):
                try:
                    for field in task_data['custom_fields']:
                        if isinstance(field, dict):
                            field_id = field.get('id', '')
                            field_name = field.get('name', '')
                            field_type = field.get('type', 'text')
                            field_value = field.get('value', '')
                            
                            if field_id:
                                custom_fields[field_id] = {
                                    'name': field_name,
                                    'type': field_type,
                                    'value': field_value
                                }
                except Exception as e:
                    logger.warning(f"Ошибка обработки custom fields для задачи {task_id}: {e}")
            
            return {
                'task_id': task_id,
                'name': name,
                'description': description,
                'status': status,
                'priority': priority,
                'date_created': date_created,
                'date_updated': date_updated,
                'due_date': due_date,
                'url': url,
                'assignees': assignees,
                'tags': tags,
                'attachments': attachments,
                'custom_fields': custom_fields
            }
            
        except Exception as e:
            logger.error(f"Ошибка парсинга данных задачи: {e}")
            raise ClickUpAPIError(f"Ошибка парсинга данных задачи: {str(e)}")
    
    def _parse_datetime(self, date_string) -> Optional[datetime]:
        """Парсит дату из строки ClickUp API"""
        if not date_string:
            return None
        
        try:
            # Если это уже datetime объект
            if isinstance(date_string, datetime):
                return date_string
            
            # Если это timestamp (число)
            if isinstance(date_string, (int, float)):
                # ClickUp использует timestamp в миллисекундах
                # Проверяем, если число больше 1e12, то это точно миллисекунды
                if date_string > 1e12:  # Если больше 10^12, то это миллисекунды
                    date_string = date_string / 1000
                
                # Проверяем, что timestamp разумный (не в далеком будущем)
                # 1e10 = 2001-09-09, 2e10 = 2033-05-18
                if date_string > 2e10:  # Если все еще очень большое число
                    logger.warning(f"Timestamp слишком большой: {date_string}")
                    return None
                    
                return datetime.fromtimestamp(date_string, tz=timezone.utc)
            
            # Если это строка
            if isinstance(date_string, str):
                # ClickUp использует формат ISO 8601
                if date_string.endswith('Z'):
                    date_string = date_string.replace('Z', '+00:00')
                dt = datetime.fromisoformat(date_string)
                return dt
            
            logger.warning(f"Неизвестный формат даты: {date_string} (тип: {type(date_string)})")
            return None
            
        except (ValueError, AttributeError, TypeError) as e:
            logger.warning(f"Не удалось распарсить дату: {date_string} (ошибка: {e})")
            return None
    
    def sync_tasks(self, list_id: str, user, max_pages: int = 10) -> Tuple[int, int, int]:
        """Синхронизирует задачи из списка"""
        from .models import ClickUpTask, ClickUpSyncLog, ClickUpSettings
        
        start_time = django_timezone.now()
        tasks_processed = 0
        tasks_created = 0
        tasks_updated = 0
        
        try:
            # Получаем все задачи из списка (с пагинацией)
            for page in range(max_pages):
                tasks_data = self.get_tasks(list_id, include_closed=False, page=page)
                
                if not tasks_data:
                    break
                
                for task_data in tasks_data:
                    if not task_data:
                        logger.warning("Получены пустые данные задачи, пропускаем")
                        continue
                        
                    try:
                        parsed_data = self.parse_task_data(task_data)
                        
                        # Проверяем обязательные поля
                        if not parsed_data.get('task_id'):
                            logger.warning(f"Задача без ID, пропускаем: {task_data}")
                            continue
                        
                        # Проверяем, существует ли задача
                        task, created = ClickUpTask.objects.get_or_create(
                            task_id=parsed_data['task_id'],
                            user=user,
                            defaults=parsed_data
                        )
                        
                        if created:
                            tasks_created += 1
                        else:
                            # Обновляем существующую задачу
                            for field, value in parsed_data.items():
                                setattr(task, field, value)
                            task.save()
                            tasks_updated += 1
                        
                        tasks_processed += 1
                        
                    except Exception as e:
                        task_id = task_data.get('id', 'unknown') if isinstance(task_data, dict) else 'unknown'
                        logger.error(f"Ошибка обработки задачи {task_id}: {e}")
                        continue
            
            # Создаем лог синхронизации
            sync_duration = (django_timezone.now() - start_time).total_seconds()
            
            ClickUpSyncLog.objects.create(
                user=user,
                status='success',
                tasks_processed=tasks_processed,
                tasks_created=tasks_created,
                tasks_updated=tasks_updated,
                sync_duration=sync_duration
            )
            
            # Обновляем время последней синхронизации в настройках
            settings_obj = ClickUpSettings.get_or_create_for_user(user)
            settings_obj.last_sync_at = django_timezone.now()
            settings_obj.save()
            
            return tasks_processed, tasks_created, tasks_updated
            
        except Exception as e:
            # Создаем лог ошибки
            sync_duration = (django_timezone.now() - start_time).total_seconds()
            
            ClickUpSyncLog.objects.create(
                user=user,
                status='error',
                tasks_processed=tasks_processed,
                error_message=str(e),
                sync_duration=sync_duration
            )
            
            raise ClickUpAPIError(f"Ошибка синхронизации: {str(e)}")


class ClickUpCacheService:
    """Сервис для кэширования данных ClickUp"""
    
    @staticmethod
    def get_cached_tasks(user, limit: int = 50) -> List[Dict]:
        """Получает кэшированные задачи пользователя"""
        from .models import ClickUpTask
        
        tasks = ClickUpTask.objects.filter(user=user).order_by('-date_updated')[:limit]
        
        return [
            {
                'id': task.task_id,
                'name': task.name,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'date_created': task.date_created,
                'date_updated': task.date_updated,
                'due_date': task.due_date,
                'url': task.url,
                'assignees': task.get_assignees_display(),
                'tags': task.get_tags_display(),
                'attachments': task.get_attachments_display(),
            }
            for task in tasks
        ]
    
    @staticmethod
    def clear_user_cache(user):
        """Очищает кэш задач пользователя"""
        from .models import ClickUpTask
        
        ClickUpTask.objects.filter(user=user).delete()
        logger.info(f"Кэш задач очищен для пользователя {user.username}")
    
    def get_tasks_from_list(self, list_id: str) -> List[Dict[str, Any]]:
        """
        Получает все задачи из указанного списка
        
        Args:
            list_id: ID списка ClickUp
            
        Returns:
            Список задач из API
        """
        try:
            print(f"🔍 Получаем задачи из списка {list_id}")
            
            all_tasks = []
            page = 0
            
            while True:
                # Получаем задачи постранично
                endpoint = f"/list/{list_id}/task"
                params = {
                    'page': page,
                    'include_closed': 'true',  # Включаем закрытые задачи
                    'subtasks': 'true',        # Включаем подзадачи
                }
                
                response_data = self._make_request('GET', endpoint, params=params)
                
                if not response_data or 'tasks' not in response_data:
                    break
                
                tasks = response_data['tasks']
                if not tasks:
                    break
                
                all_tasks.extend(tasks)
                page += 1
                
                # Ограничиваем количество страниц для безопасности
                if page > 100:  # Максимум 100 страниц
                    print(f"⚠️ Достигнут лимит страниц (100), останавливаемся")
                    break
            
            print(f"✅ Получено {len(all_tasks)} задач из списка {list_id}")
            return all_tasks
            
        except Exception as e:
            print(f"❌ Ошибка при получении задач из списка {list_id}: {e}")
            return []
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Получает данные одной задачи по ID
        
        Args:
            task_id: ID задачи ClickUp
            
        Returns:
            Данные задачи или None
        """
        try:
            endpoint = f"/task/{task_id}"
            response_data = self._make_request('GET', endpoint)
            return response_data
            
        except Exception as e:
            print(f"❌ Ошибка при получении задачи {task_id}: {e}")
            return None
