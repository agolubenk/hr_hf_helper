import requests
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from django.conf import settings
from django.utils import timezone as django_timezone
import logging

logger = logging.getLogger(__name__)


class NotionAPIError(Exception):
    """Исключение для ошибок Notion API"""
    pass


class NotionService:
    """Сервис для работы с Notion API"""
    
    BASE_URL = "https://api.notion.com/v1"
    NOTION_VERSION = "2022-06-28"
    
    def __init__(self, integration_token: str):
        self.integration_token = integration_token
        self.headers = {
            'Authorization': f'Bearer {integration_token}',
            'Content-Type': 'application/json',
            'Notion-Version': self.NOTION_VERSION
        }
    
    def _make_request(self, method: str, endpoint: str, params: Dict = None, data: Dict = None) -> Dict:
        """Выполняет запрос к Notion API"""
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        
        try:
            logger.info(f"Notion API запрос: {method} {url}")
            
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=data,
                timeout=30
            )
            
            logger.info(f"Notion API ответ: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                raise NotionAPIError("Неверный integration токен")
            elif response.status_code == 403:
                raise NotionAPIError("Недостаточно прав доступа")
            elif response.status_code == 404:
                raise NotionAPIError("Ресурс не найден")
            elif response.status_code == 429:
                raise NotionAPIError("Превышен лимит запросов")
            else:
                error_msg = f"Ошибка API: {response.status_code}"
                try:
                    error_data = response.json()
                    if 'message' in error_data:
                        error_msg += f" - {error_data['message']}"
                except:
                    error_msg += f" - {response.text}"
                
                raise NotionAPIError(error_msg)
                
        except requests.exceptions.Timeout:
            raise NotionAPIError("Таймаут запроса к Notion API")
        except requests.exceptions.ConnectionError:
            raise NotionAPIError("Ошибка подключения к Notion API")
        except requests.exceptions.RequestException as e:
            raise NotionAPIError(f"Ошибка запроса: {str(e)}")
    
    def test_connection(self) -> bool:
        """Тестирует подключение к Notion API"""
        try:
            response = self._make_request('GET', '/users/me')
            return 'object' in response and response['object'] == 'user'
        except NotionAPIError:
            return False
    
    def get_user_info(self) -> Dict:
        """Получает информацию о пользователе"""
        return self._make_request('GET', '/users/me')
    
    def get_databases(self) -> List[Dict]:
        """Получает список доступных баз данных"""
        response = self._make_request('POST', '/search', data={'filter': {'value': 'database', 'property': 'object'}})
        return response.get('results', [])
    
    def get_database(self, database_id: str) -> Dict:
        """Получает информацию о базе данных"""
        return self._make_request('GET', f'/databases/{database_id}')
    
    def query_database(self, database_id: str, filter_dict: Dict = None, sorts: List[Dict] = None, page_size: int = 100) -> List[Dict]:
        """Запрашивает страницы из базы данных"""
        data = {}
        
        if filter_dict:
            data['filter'] = filter_dict
        
        if sorts:
            data['sorts'] = sorts
        
        data['page_size'] = page_size
        
        response = self._make_request('POST', f'/databases/{database_id}/query', data=data)
        return response.get('results', [])
    
    def get_page(self, page_id: str) -> Dict:
        """Получает информацию о странице"""
        return self._make_request('GET', f'/pages/{page_id}')
    
    def get_page_content(self, page_id: str) -> List[Dict]:
        """Получает содержимое страницы (блоки) включая дочерние блоки"""
        response = self._make_request('GET', f'/blocks/{page_id}/children')
        blocks = response.get('results', [])
        
        # Рекурсивно получаем дочерние блоки
        all_blocks = []
        for block in blocks:
            all_blocks.append(block)
            
            # Если блок имеет дочерние элементы, получаем их
            if block.get('has_children'):
                try:
                    child_blocks = self.get_page_content(block.get('id'))
                    all_blocks.extend(child_blocks)
                except Exception as e:
                    logger.warning(f"Не удалось получить дочерние блоки для {block.get('id')}: {e}")
        
        return all_blocks
    
    def get_user_info(self, user_id: str) -> Dict:
        """Получает информацию о пользователе по ID"""
        try:
            response = self._make_request('GET', f'/users/{user_id}')
            return response
        except Exception as e:
            logger.warning(f"Не удалось получить информацию о пользователе {user_id}: {e}")
            return {}
    
    def get_page_comments(self, page_id: str) -> List[Dict]:
        """Получает комментарии к странице"""
        try:
            response = self._make_request('GET', f'/comments?block_id={page_id}')
            comments = response.get('results', [])
            
            # Обрабатываем комментарии
            processed_comments = []
            for comment in comments:
                # Извлекаем информацию об авторе
                created_by = comment.get('created_by', {})
                author_name = ''
                author_email = ''
                author_id = ''
                
                if isinstance(created_by, dict):
                    # Notion API возвращает объект пользователя
                    author_id = created_by.get('id', '')
                    
                    # Пытаемся извлечь имя из объекта created_by
                    if created_by.get('name'):
                        author_name = created_by['name']
                    elif created_by.get('object') == 'user':
                        # Если это user объект, может быть имя в person или bot
                        person = created_by.get('person', {})
                        if person:
                            author_email = person.get('email', '')
                            if author_email:
                                # Пытаемся извлечь имя из email или использовать часть email
                                author_name = author_email.split('@')[0]
                        
                        # Если имя все еще пустое, пытаемся получить через API
                        if not author_name and author_id:
                            try:
                                user_info = self.get_user_info(author_id)
                                logger.debug(f"🔍 USER INFO для {author_id}: {user_info}")
                                if user_info.get('name'):
                                    author_name = user_info['name']
                                elif user_info.get('person', {}).get('email'):
                                    author_email = user_info['person']['email']
                                    author_name = author_email.split('@')[0]
                            except Exception as e:
                                logger.debug(f"⚠️ Не удалось получить информацию о пользователе {author_id}: {e}")
                                pass
                    
                    # Если имя все еще пустое, используем email или ID (но скрываем UUID)
                    if not author_name:
                        if author_email:
                            author_name = author_email.split('@')[0]
                        elif author_id:
                            # Если это UUID (36 символов с дефисами), не показываем его
                            if len(author_id) > 20:
                                author_name = 'Пользователь'
                            else:
                                author_name = author_id
                        else:
                            author_name = 'Неизвестно'
                
                # Извлекаем дату и время
                created_time_str = comment.get('created_time', '')
                created_time_dt = None
                if created_time_str:
                    try:
                        created_time_dt = self._parse_datetime(created_time_str)
                    except Exception as e:
                        logger.warning(f"Не удалось распарсить дату комментария: {created_time_str}, ошибка: {e}")
                
                # Извлекаем текст из rich_text
                comment_text = ''
                if comment.get('rich_text'):
                    text_parts = []
                    for text_item in comment['rich_text']:
                        if text_item.get('plain_text'):
                            text_parts.append(text_item['plain_text'])
                    comment_text = ''.join(text_parts)
                
                processed_comment = {
                    'id': comment.get('id', ''),
                    'text': comment_text,
                    'author': {
                        'id': author_id,
                        'name': author_name,
                        'email': author_email
                    },
                    'author_name': author_name,  # Для удобства доступа
                    'author_email': author_email,  # Для удобства доступа
                    'created_time': created_time_str,
                    'created_time_dt': created_time_dt,  # Parsed datetime объект
                    'rich_text': comment.get('rich_text', [])
                }
                
                processed_comments.append(processed_comment)
            
            return processed_comments
        except Exception as e:
            logger.warning(f"Не удалось получить комментарии к странице {page_id}: {e}")
            return []
    
    def parse_page_content(self, blocks: List[Dict]) -> str:
        """Парсит блоки страницы в HTML"""
        if not blocks:
            return ''
        
        html_content = []
        
        for block in blocks:
            block_type = block.get('type', '')
            
            if block_type == 'paragraph':
                text = self._extract_rich_text(block.get('paragraph', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<p>{text}</p>')
            
            elif block_type == 'heading_1':
                text = self._extract_rich_text(block.get('heading_1', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<h1>{text}</h1>')
            
            elif block_type == 'heading_2':
                text = self._extract_rich_text(block.get('heading_2', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<h2>{text}</h2>')
            
            elif block_type == 'heading_3':
                text = self._extract_rich_text(block.get('heading_3', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<h3>{text}</h3>')
            
            elif block_type == 'bulleted_list_item':
                text = self._extract_rich_text(block.get('bulleted_list_item', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<li>{text}</li>')
            
            elif block_type == 'numbered_list_item':
                text = self._extract_rich_text(block.get('numbered_list_item', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<li>{text}</li>')
            
            elif block_type == 'to_do':
                text = self._extract_rich_text(block.get('to_do', {}).get('rich_text', []))
                checked = block.get('to_do', {}).get('checked', False)
                checkbox = '☑' if checked else '☐'
                if text:
                    html_content.append(f'<p>{checkbox} {text}</p>')
            
            elif block_type == 'code':
                text = self._extract_rich_text(block.get('code', {}).get('rich_text', []))
                language = block.get('code', {}).get('language', '')
                if text:
                    html_content.append(f'<pre><code class="language-{language}">{text}</code></pre>')
            
            elif block_type == 'quote':
                text = self._extract_rich_text(block.get('quote', {}).get('rich_text', []))
                if text:
                    html_content.append(f'<blockquote>{text}</blockquote>')
            
            elif block_type == 'divider':
                html_content.append('<hr>')
            
            elif block_type == 'image':
                image_data = block.get('image', {})
                image_type = image_data.get('type', '')
                
                # Извлекаем URL в зависимости от типа изображения
                image_url = ''
                if image_type == 'external' and image_data.get('external'):
                    image_url = image_data['external'].get('url', '')
                elif image_type == 'file' and image_data.get('file'):
                    image_url = image_data['file'].get('url', '')
                
                if image_url:
                    html_content.append(f'<img src="{image_url}" alt="Изображение" style="max-width: 100%;">')
            
            elif block_type == 'file':
                file_data = block.get('file', {})
                file_name = file_data.get('name', 'Файл')
                file_type = file_data.get('type', '')
                
                # Извлекаем URL в зависимости от типа файла
                file_url = ''
                if file_type == 'external' and file_data.get('external'):
                    file_url = file_data['external'].get('url', '')
                elif file_type == 'file' and file_data.get('file'):
                    file_url = file_data['file'].get('url', '')
                
                if file_url:
                    # Определяем иконку в зависимости от расширения файла
                    file_extension = file_name.split('.')[-1].lower() if '.' in file_name else ''
                    icon_class = 'fas fa-file'
                    if file_extension in ['pdf']:
                        icon_class = 'fas fa-file-pdf'
                    elif file_extension in ['doc', 'docx']:
                        icon_class = 'fas fa-file-word'
                    elif file_extension in ['xls', 'xlsx']:
                        icon_class = 'fas fa-file-excel'
                    elif file_extension in ['ppt', 'pptx']:
                        icon_class = 'fas fa-file-powerpoint'
                    elif file_extension in ['zip', 'rar', '7z']:
                        icon_class = 'fas fa-file-archive'
                    elif file_extension in ['jpg', 'jpeg', 'png', 'gif', 'svg']:
                        icon_class = 'fas fa-file-image'
                    
                    html_content.append(f'<div class="file-attachment"><a href="{file_url}" target="_blank" class="file-link"><i class="{icon_class}"></i> {file_name}</a></div>')
            
            elif block_type == 'pdf':
                pdf_data = block.get('pdf', {})
                pdf_url = pdf_data.get('external', {}).get('url') or pdf_data.get('file', {}).get('url')
                if pdf_url:
                    html_content.append(f'<div class="file-attachment"><a href="{pdf_url}" target="_blank" class="file-link"><i class="fas fa-file-pdf"></i> PDF документ</a></div>')
            
            elif block_type == 'video':
                video_data = block.get('video', {})
                video_url = video_data.get('external', {}).get('url') or video_data.get('file', {}).get('url')
                if video_url:
                    html_content.append(f'<div class="video-attachment"><video controls style="max-width: 100%;"><source src="{video_url}" type="video/mp4">Ваш браузер не поддерживает видео.</video></div>')
            
            elif block_type == 'audio':
                audio_data = block.get('audio', {})
                audio_url = audio_data.get('external', {}).get('url') or audio_data.get('file', {}).get('url')
                if audio_url:
                    html_content.append(f'<div class="audio-attachment"><audio controls style="width: 100%;"><source src="{audio_url}" type="audio/mpeg">Ваш браузер не поддерживает аудио.</audio></div>')
            
            elif block_type == 'bookmark':
                bookmark_data = block.get('bookmark', {})
                bookmark_url = bookmark_data.get('url', '')
                bookmark_caption = bookmark_data.get('caption', [])
                caption_text = self._extract_rich_text(bookmark_caption) if bookmark_caption else ''
                if bookmark_url:
                    html_content.append(f'<div class="bookmark-attachment"><a href="{bookmark_url}" target="_blank" class="bookmark-link"><i class="fas fa-bookmark"></i> {bookmark_url}</a>{f"<p class=\"bookmark-caption\">{caption_text}</p>" if caption_text else ""}</div>')
            
            elif block_type == 'embed':
                embed_data = block.get('embed', {})
                embed_url = embed_data.get('url', '')
                if embed_url:
                    html_content.append(f'<div class="embed-attachment"><iframe src="{embed_url}" style="width: 100%; height: 400px; border: none;"></iframe></div>')
            
            elif block_type == 'table':
                table_data = block.get('table', {})
                table_width = table_data.get('table_width', 0)
                has_column_header = table_data.get('has_column_header', False)
                has_row_header = table_data.get('has_row_header', False)
                # Для таблиц нужно получать дочерние блоки, но пока просто добавим заглушку
                html_content.append('<div class="table-placeholder"><i class="fas fa-table"></i> Таблица (требует дополнительной обработки)</div>')
            
            elif block_type == 'callout':
                callout_data = block.get('callout', {})
                callout_text = self._extract_rich_text(callout_data.get('rich_text', []))
                callout_icon = callout_data.get('icon', {})
                icon_emoji = callout_icon.get('emoji', '💡') if callout_icon.get('type') == 'emoji' else '💡'
                if callout_text:
                    html_content.append(f'<div class="callout-block"><span class="callout-icon">{icon_emoji}</span><div class="callout-content">{callout_text}</div></div>')
            
            elif block_type == 'toggle':
                toggle_data = block.get('toggle', {})
                toggle_text = self._extract_rich_text(toggle_data.get('rich_text', []))
                if toggle_text:
                    html_content.append(f'<details class="toggle-block"><summary>{toggle_text}</summary><div class="toggle-content">Содержимое скрыто (требует дополнительной обработки)</div></details>')
        
        return '\n'.join(html_content)
    
    def _extract_rich_text(self, rich_text: List[Dict]) -> str:
        """Извлекает текст из rich_text блока"""
        if not rich_text:
            return ''
        
        text_parts = []
        for text_obj in rich_text:
            text = text_obj.get('plain_text', '')
            if text:
                # Обрабатываем форматирование
                if text_obj.get('annotations', {}).get('bold'):
                    text = f'<strong>{text}</strong>'
                if text_obj.get('annotations', {}).get('italic'):
                    text = f'<em>{text}</em>'
                if text_obj.get('annotations', {}).get('strikethrough'):
                    text = f'<del>{text}</del>'
                if text_obj.get('annotations', {}).get('underline'):
                    text = f'<u>{text}</u>'
                if text_obj.get('annotations', {}).get('code'):
                    text = f'<code>{text}</code>'
                
                # Обрабатываем ссылки
                if text_obj.get('href'):
                    text = f'<a href="{text_obj["href"]}">{text}</a>'
                
                text_parts.append(text)
        
        return ''.join(text_parts)
    
    def create_page(self, database_id: str, properties: Dict) -> Dict:
        """Создает новую страницу в базе данных"""
        data = {
            'parent': {'database_id': database_id},
            'properties': properties
        }
        return self._make_request('POST', '/pages', data=data)
    
    def update_page(self, page_id: str, properties: Dict) -> Dict:
        """Обновляет страницу"""
        data = {'properties': properties}
        return self._make_request('PATCH', f'/pages/{page_id}', data=data)
    
    def parse_page_data(self, page_data: Dict) -> Dict:
        """Парсит данные страницы из Notion API в формат для сохранения"""
        if not page_data:
            raise NotionAPIError("Данные страницы пусты")
        
        try:
            # Основные поля
            page_id = page_data.get('id', '')
            if not page_id:
                raise NotionAPIError("ID страницы не найден")
            
            # Извлекаем заголовок из properties
            title = self._extract_title_from_properties(page_data.get('properties', {}))
            
            # Извлекаем URL
            url = page_data.get('url', '')
            
            # Извлекаем даты
            date_created = self._parse_datetime(page_data.get('created_time'))
            date_updated = self._parse_datetime(page_data.get('last_edited_time'))
            
            # Извлекаем дополнительные свойства
            properties = page_data.get('properties', {})
            logger.info(f"🔍 NOTION PARSE: Доступные свойства: {list(properties.keys())}")
            
            # Логируем все поля типа select и status для отладки
            select_fields = []
            status_fields = []
            for prop_name, prop_data in properties.items():
                prop_type = prop_data.get('type', 'unknown')
                logger.debug(f"  - {prop_name}: тип={prop_type}")
                if prop_type == 'status':
                    # Статус - это специальный тип в Notion API
                    status_value = prop_data.get('status', {})
                    status_name = status_value.get('name', '') if status_value else ''
                    logger.info(f"  🎯 STATUS поле: '{prop_name}' = '{status_name}'")
                    status_fields.append({
                        'name': prop_name,
                        'value': status_name,
                        'full_data': prop_data
                    })
                elif prop_type == 'select':
                    select_value = prop_data.get('select', {})
                    select_name = select_value.get('name', '') if select_value else ''
                    logger.info(f"  📌 SELECT поле: '{prop_name}' = '{select_name}'")
                    select_fields.append({
                        'name': prop_name,
                        'value': select_name,
                        'full_data': prop_data
                    })
            
            # Пробуем разные варианты названия поля Status (точное совпадение)
            logger.info(f"🔍 NOTION PARSE: Ищем статус по точному названию...")
            status = self._extract_property_value(properties, 'Status')
            if status:
                logger.info(f"✅ NOTION PARSE: Статус найден в поле 'Status': '{status}'")
            else:
                status = self._extract_property_value(properties, 'Статус')
                if status:
                    logger.info(f"✅ NOTION PARSE: Статус найден в поле 'Статус': '{status}'")
                else:
                    status = self._extract_property_value(properties, 'status')
                    if status:
                        logger.info(f"✅ NOTION PARSE: Статус найден в поле 'status': '{status}'")
                    else:
                        logger.warning(f"⚠️ NOTION PARSE: Статус не найден по точным названиям (Status, Статус, status)")
            
            # Если статус все еще не найден, ищем поле типа "status" (специальный тип в Notion)
            if not status:
                logger.info(f"🔍 NOTION PARSE: Ищем поле типа 'status' (специальный тип Notion)...")
                # Сначала ищем поле типа "status" (это правильный тип для статусов в Notion)
                for prop_name, prop_data in properties.items():
                    prop_type = prop_data.get('type', '')
                    if prop_type == 'status' and prop_data.get('status'):
                        status = prop_data['status'].get('name', '')
                        if status:
                            logger.info(f"✅ NOTION PARSE: Найден статус в поле типа 'status' '{prop_name}': '{status}'")
                            break
                
                # Если все еще не найден, ищем поле типа select (fallback)
                if not status:
                    logger.info(f"🔍 NOTION PARSE: Ищем поле типа 'select' как fallback...")
                    # Список полей, которые точно НЕ являются статусом
                    excluded_fields = [
                        'priority', 'приоритет', 'assignee', 'tags', 'interviewer', 'интервьюер',
                        'owner', 'screening owner', 'screening_owner', 'screeningowner',
                        'due date', 'due_date', 'duedate', 'срок',
                        'date', 'дата', 'created', 'updated', 'created_at', 'updated_at',
                        'created time', 'updated time', 'created_time', 'updated_time',
                        'interview date', 'interview_date', 'дата интервью'
                    ]
                    
                    # Список ключевых слов, которые могут указывать на статус
                    status_keywords = ['status', 'state', 'stage', 'phase']
                    
                    # Сначала пытаемся найти по ключевым словам в названии
                    for prop_name, prop_data in properties.items():
                        prop_type = prop_data.get('type', '')
                        prop_name_lower = prop_name.lower().replace(' ', '_').replace('-', '_')
                        
                        # Ищем только поля типа select
                        if prop_type == 'select' and prop_data.get('select'):
                            # Проверяем, не является ли это исключенным полем
                            is_excluded = any(
                                excluded in prop_name_lower 
                                for excluded in excluded_fields
                            )
                            
                            # Проверяем, содержит ли название ключевые слова статуса
                            is_status_like = any(
                                keyword in prop_name_lower 
                                for keyword in status_keywords
                            )
                            
                            # Если это НЕ исключенное поле И похоже на статус, берем его
                            if not is_excluded and is_status_like:
                                status = prop_data['select'].get('name', '')
                                if status:
                                    logger.info(f"🔍 NOTION PARSE: Найден статус в поле 'select' '{prop_name}': '{status}' (по ключевым словам в названии)")
                                    break
                    
                    # Если все еще не найден, берем первое поле типа select, которое не исключено
                    # (это может быть поле статуса с другим названием)
                    if not status:
                        for prop_name, prop_data in properties.items():
                            prop_type = prop_data.get('type', '')
                            prop_name_lower = prop_name.lower().replace(' ', '_').replace('-', '_')
                            
                            # Ищем только поля типа select
                            if prop_type == 'select' and prop_data.get('select'):
                                # Проверяем, не является ли это исключенным полем
                                is_excluded = any(
                                    excluded in prop_name_lower 
                                    for excluded in excluded_fields
                                )
                                
                                # Если это НЕ исключенное поле, берем его как статус
                                if not is_excluded:
                                    status = prop_data['select'].get('name', '')
                                    if status:
                                        logger.info(f"🔍 NOTION PARSE: Найден статус в поле 'select' '{prop_name}': '{status}' (первое доступное поле select, не исключенное)")
                                        break
            
            if not status:
                logger.error(f"❌ NOTION PARSE: Статус НЕ найден!")
                if status_fields:
                    logger.error(f"❌ NOTION PARSE: Доступные STATUS поля: {[f['name'] for f in status_fields]} с значениями: {[(f['name'], f['value']) for f in status_fields]}")
                if select_fields:
                    logger.error(f"❌ NOTION PARSE: Доступные SELECT поля: {[f['name'] for f in select_fields]} с значениями: {[(f['name'], f['value']) for f in select_fields]}")
                if not status_fields and not select_fields:
                    logger.error(f"❌ NOTION PARSE: Нет ни STATUS, ни SELECT полей в свойствах страницы!")
            else:
                logger.info(f"✅ NOTION PARSE: Извлечен Status: '{status}' (из {len(properties)} свойств)")
                logger.info(f"✅ NOTION PARSE: Статус будет сохранен в parsed_data['status'] = '{status}'")
            
            priority = self._extract_property_value(properties, 'Priority')
            due_date = self._extract_date_property(properties, 'Due Date')
            
            # Извлекаем поля Interviewer и Interview Date (пробуем разные варианты названий)
            interviewer = self._extract_people_property(properties, 'Interviewer')
            if not interviewer:
                interviewer = self._extract_people_property(properties, 'Интервьюер')
            if not interviewer:
                interviewer = self._extract_people_property(properties, 'interviewer')
            
            logger.info(f"🔍 NOTION PARSE: Interviewer (raw): {interviewer}")
            
            # Если Interviewer - это single person, берем первого
            if interviewer and len(interviewer) > 0:
                interviewer = interviewer[0]  # Берем первого интервьюера как строку
            else:
                interviewer = ''
            
            logger.info(f"🔍 NOTION PARSE: Извлечен Interviewer: '{interviewer}'")
            
            # Пробуем разные варианты названия поля Interview Date
            interview_date = self._extract_date_property(properties, 'Interview Date')
            if not interview_date:
                interview_date = self._extract_date_property(properties, 'Дата интервью')
            if not interview_date:
                interview_date = self._extract_date_property(properties, 'Interview date')
            
            logger.info(f"🔍 NOTION PARSE: Извлечен Interview Date: {interview_date}")
            
            # Извлекаем исполнителей
            assignees = self._extract_people_property(properties, 'Assignee')
            
            # Извлекаем теги
            tags = self._extract_multi_select_property(properties, 'Tags')
            
            # Извлекаем вложения (ищем все файловые поля)
            attachments = []
            for prop_name, prop_data in properties.items():
                if prop_data.get('type') == 'files' and prop_data.get('files'):
                    file_attachments = self._extract_files_property(properties, prop_name)
                    attachments.extend(file_attachments)
            
            # Извлекаем содержимое и файлы из содержимого страницы
            page_content_html = ''
            try:
                page_content = self.get_page_content(page_id)
                if page_content:
                    page_content_html = self.parse_page_content(page_content)
                    content_files = self._extract_files_from_content(page_content)
                    attachments.extend(content_files)
            except Exception as e:
                logger.warning(f"Не удалось извлечь содержимое и файлы из страницы {page_id}: {e}")
            
            # Извлекаем комментарии к странице
            page_comments = []
            try:
                page_comments = self.get_page_comments(page_id)
            except Exception as e:
                logger.warning(f"Не удалось извлечь комментарии к странице {page_id}: {e}")
            
            # Обрабатываем дополнительные свойства
            custom_properties = {}
            for prop_name, prop_data in properties.items():
                # Исключаем основные поля, но включаем файловые поля в дополнительные свойства
                excluded_fields = ['Status', 'Priority', 'Due Date', 'Assignee', 'Tags', 'Interviewer', 'Interview Date']
                if prop_name not in excluded_fields:
                    prop_type = prop_data.get('type', 'text')
                    
                    # Для multi_select полей сохраняем массив, а не строку
                    if prop_type == 'multi_select' and prop_data.get('multi_select'):
                        value = [item.get('name', '') for item in prop_data['multi_select']]
                    else:
                        value = self._extract_property_value(properties, prop_name)
                    
                    custom_properties[prop_name] = {
                        'name': prop_name,
                        'type': prop_type,
                        'value': value
                    }
            
            return {
                'page_id': page_id,
                'title': title,
                'content': page_content_html,  # Содержимое страницы в HTML формате
                'comments': page_comments,  # Комментарии к странице
                'status': status,
                'priority': priority,
                'date_created': date_created,
                'date_updated': date_updated,
                'due_date': due_date,
                'url': url,
                'assignees': assignees,
                'tags': tags,
                'attachments': attachments,
                'custom_properties': custom_properties,
                # Новые поля
                'interviewer': interviewer,
                'interview_date': interview_date
            }
            
        except Exception as e:
            logger.error(f"Ошибка парсинга данных страницы: {e}")
            raise NotionAPIError(f"Ошибка парсинга данных страницы: {str(e)}")
    
    def _extract_title_from_properties(self, properties: Dict) -> str:
        """Извлекает заголовок из свойств страницы"""
        # Ищем поле title в различных форматах
        title_fields = ['title', 'Name', 'Task', 'Page', 'Title']
        
        for field in title_fields:
            if field in properties:
                prop = properties[field]
                if prop.get('type') == 'title' and prop.get('title'):
                    return ''.join([text.get('plain_text', '') for text in prop['title']])
                elif prop.get('type') == 'rich_text' and prop.get('rich_text'):
                    return ''.join([text.get('plain_text', '') for text in prop['rich_text']])
        
        return 'Без названия'
    
    def _extract_property_value(self, properties: Dict, property_name: str) -> str:
        """Извлекает значение свойства"""
        if property_name not in properties:
            logger.debug(f"  ⚠️ Поле '{property_name}' отсутствует в свойствах")
            return ''
        
        prop = properties[property_name]
        prop_type = prop.get('type', '')
        
        logger.debug(f"  🔍 Извлекаем '{property_name}': тип={prop_type}")
        
        if prop_type == 'rich_text' and prop.get('rich_text'):
            return ''.join([text.get('plain_text', '') for text in prop['rich_text']])
        elif prop_type == 'status':
            # Статус - это специальный тип в Notion API (не select!)
            status_data = prop.get('status')
            if status_data:
                status_name = status_data.get('name', '')
                logger.debug(f"  ✅ Status '{property_name}': значение='{status_name}'")
                return status_name
            else:
                logger.debug(f"  ⚠️ Status '{property_name}': значение пустое (null)")
                return ''
        elif prop_type == 'select':
            select_data = prop.get('select')
            if select_data:
                select_name = select_data.get('name', '')
                logger.debug(f"  ✅ Select '{property_name}': значение='{select_name}'")
                return select_name
            else:
                logger.debug(f"  ⚠️ Select '{property_name}': значение пустое (null)")
                return ''
        elif prop_type == 'multi_select' and prop.get('multi_select'):
            return ', '.join([item.get('name', '') for item in prop['multi_select']])
        elif prop_type == 'number' and prop.get('number') is not None:
            return str(prop['number'])
        elif prop_type == 'checkbox' and prop.get('checkbox') is not None:
            return 'Да' if prop['checkbox'] else 'Нет'
        elif prop_type == 'url' and prop.get('url'):
            return prop['url']
        elif prop_type == 'email' and prop.get('email'):
            return prop['email']
        elif prop_type == 'phone_number' and prop.get('phone_number'):
            return prop['phone_number']
        
        return ''
    
    def _extract_date_property(self, properties: Dict, property_name: str) -> Optional[datetime]:
        """Извлекает дату из свойства"""
        if property_name not in properties:
            return None
        
        prop = properties[property_name]
        if prop.get('type') == 'date' and prop.get('date'):
            date_str = prop['date'].get('start')
            if date_str:
                return self._parse_datetime(date_str)
        
        return None
    
    def _extract_people_property(self, properties: Dict, property_name: str) -> List[str]:
        """Извлекает список людей из свойства"""
        if property_name not in properties:
            return []
        
        prop = properties[property_name]
        if prop.get('type') == 'people' and prop.get('people'):
            return [person.get('name', person.get('email', 'Неизвестно')) for person in prop['people']]
        
        return []
    
    def _extract_multi_select_property(self, properties: Dict, property_name: str) -> List[str]:
        """Извлекает список значений из multi-select свойства"""
        if property_name not in properties:
            return []
        
        prop = properties[property_name]
        if prop.get('type') == 'multi_select' and prop.get('multi_select'):
            return [item.get('name', '') for item in prop['multi_select']]
        
        return []
    
    def _extract_files_property(self, properties: Dict, property_name: str) -> List[Dict]:
        """Извлекает список файлов из свойства"""
        if property_name not in properties:
            return []
        
        prop = properties[property_name]
        if prop.get('type') == 'files' and prop.get('files'):
            files = []
            for file in prop['files']:
                # Извлекаем URL в зависимости от типа файла
                file_url = ''
                if file.get('type') == 'external' and file.get('external'):
                    file_url = file['external'].get('url', '')
                elif file.get('type') == 'file' and file.get('file'):
                    file_url = file['file'].get('url', '')
                
                files.append({
                    'name': file.get('name', 'Файл'),
                    'url': file_url,
                    'type': file.get('type', 'unknown')
                })
            
            return files
        
        return []
    
    def _extract_files_from_content(self, blocks: List[Dict]) -> List[Dict]:
        """Извлекает файлы из блоков содержимого страницы"""
        files = []
        
        for block in blocks:
            block_type = block.get('type', '')
            
            if block_type == 'file':
                file_data = block.get('file', {})
                file_name = file_data.get('name', 'Файл')
                file_type = file_data.get('type', '')
                
                # Извлекаем URL в зависимости от типа файла
                file_url = ''
                if file_type == 'external' and file_data.get('external'):
                    file_url = file_data['external'].get('url', '')
                elif file_type == 'file' and file_data.get('file'):
                    file_url = file_data['file'].get('url', '')
                
                if file_url:
                    files.append({
                        'name': file_name,
                        'url': file_url,
                        'type': 'file'
                    })
            
            elif block_type == 'image':
                image_data = block.get('image', {})
                image_type = image_data.get('type', '')
                
                # Извлекаем URL в зависимости от типа изображения
                image_url = ''
                if image_type == 'external' and image_data.get('external'):
                    image_url = image_data['external'].get('url', '')
                elif image_type == 'file' and image_data.get('file'):
                    image_url = image_data['file'].get('url', '')
                
                if image_url:
                    files.append({
                        'name': f"Изображение {len(files) + 1}",
                        'url': image_url,
                        'type': 'image'
                    })
            
            elif block_type == 'pdf':
                pdf_data = block.get('pdf', {})
                pdf_url = pdf_data.get('external', {}).get('url') or pdf_data.get('file', {}).get('url')
                if pdf_url:
                    files.append({
                        'name': f"PDF документ {len(files) + 1}",
                        'url': pdf_url,
                        'type': 'pdf'
                    })
            
            elif block_type == 'video':
                video_data = block.get('video', {})
                video_url = video_data.get('external', {}).get('url') or video_data.get('file', {}).get('url')
                if video_url:
                    files.append({
                        'name': f"Видео {len(files) + 1}",
                        'url': video_url,
                        'type': 'video'
                    })
            
            elif block_type == 'audio':
                audio_data = block.get('audio', {})
                audio_url = audio_data.get('external', {}).get('url') or audio_data.get('file', {}).get('url')
                if audio_url:
                    files.append({
                        'name': f"Аудио {len(files) + 1}",
                        'url': audio_url,
                        'type': 'audio'
                    })
        
        return files
    
    def _parse_datetime(self, date_string) -> Optional[datetime]:
        """Парсит дату из строки Notion API"""
        if not date_string:
            return None
        
        try:
            # Если это уже datetime объект
            if isinstance(date_string, datetime):
                return date_string
            
            # Notion использует формат ISO 8601
            if isinstance(date_string, str):
                if date_string.endswith('Z'):
                    date_string = date_string.replace('Z', '+00:00')
                dt = datetime.fromisoformat(date_string)
                return dt
            
            logger.warning(f"Неизвестный формат даты: {date_string} (тип: {type(date_string)})")
            return None
            
        except (ValueError, AttributeError, TypeError) as e:
            logger.warning(f"Не удалось распарсить дату: {date_string} (ошибка: {e})")
            return None
    
    def sync_pages(self, database_id: str, user, max_pages: int = 100) -> Tuple[int, int, int]:
        """Синхронизирует страницы из базы данных"""
        from .models import NotionPage, NotionSyncLog, NotionSettings
        
        start_time = django_timezone.now()
        pages_processed = 0
        pages_created = 0
        pages_updated = 0
        
        try:
            # Получаем все страницы из базы данных
            all_pages = []
            has_more = True
            start_cursor = None
            
            while has_more and len(all_pages) < max_pages:
                data = {'page_size': 100}
                if start_cursor:
                    data['start_cursor'] = start_cursor
                
                response = self._make_request('POST', f'/databases/{database_id}/query', data=data)
                pages = response.get('results', [])
                all_pages.extend(pages)
                
                has_more = response.get('has_more', False)
                start_cursor = response.get('next_cursor')
            
            # Обрабатываем каждую страницу
            for page_data in all_pages:
                if not page_data:
                    logger.warning("Получены пустые данные страницы, пропускаем")
                    continue
                    
                try:
                    parsed_data = self.parse_page_data(page_data)
                    
                    # Проверяем обязательные поля
                    if not parsed_data.get('page_id'):
                        logger.warning(f"Страница без ID, пропускаем: {page_data}")
                        continue
                    
                    # Проверяем, существует ли страница
                    page, created = NotionPage.objects.get_or_create(
                        page_id=parsed_data['page_id'],
                        user=user,
                        defaults=parsed_data
                    )
                    
                    if created:
                        pages_created += 1
                    else:
                        # Обновляем существующую страницу
                        for field, value in parsed_data.items():
                            setattr(page, field, value)
                        page.save()
                        pages_updated += 1
                    
                    pages_processed += 1
                    
                except Exception as e:
                    page_id = page_data.get('id', 'unknown') if isinstance(page_data, dict) else 'unknown'
                    logger.error(f"Ошибка обработки страницы {page_id}: {e}")
                    continue
            
            # Создаем лог синхронизации
            sync_duration = (django_timezone.now() - start_time).total_seconds()
            
            NotionSyncLog.objects.create(
                user=user,
                status='success',
                pages_processed=pages_processed,
                pages_created=pages_created,
                pages_updated=pages_updated,
                sync_duration=sync_duration
            )
            
            # Обновляем время последней синхронизации в настройках
            settings_obj = NotionSettings.get_or_create_for_user(user)
            settings_obj.last_sync_at = django_timezone.now()
            settings_obj.save()
            
            return pages_processed, pages_created, pages_updated
            
        except Exception as e:
            # Создаем лог ошибки
            sync_duration = (django_timezone.now() - start_time).total_seconds()
            
            NotionSyncLog.objects.create(
                user=user,
                status='error',
                pages_processed=pages_processed,
                error_message=str(e),
                sync_duration=sync_duration
            )
            
            raise NotionAPIError(f"Ошибка синхронизации: {str(e)}")


class NotionCacheService:
    """Сервис для кэширования данных Notion"""
    
    @staticmethod
    def get_cached_pages(user, limit: int = 50) -> List[Dict]:
        """Получает кэшированные страницы пользователя"""
        from .models import NotionPage
        
        pages = NotionPage.objects.filter(user=user).order_by('-date_updated')[:limit]
        
        return [
            {
                'id': page.page_id,
                'title': page.title,
                'content': page.content,
                'status': page.status,
                'priority': page.priority,
                'date_created': page.date_created,
                'date_updated': page.date_updated,
                'due_date': page.due_date,
                'url': page.url,
                'assignees': page.get_assignees_display(),
                'tags': page.get_tags_display(),
                'attachments': page.get_attachments_display(),
            }
            for page in pages
        ]
    
    @staticmethod
    def clear_user_cache(user):
        """Очищает кэш страниц пользователя"""
        from .models import NotionPage
        
        NotionPage.objects.filter(user=user).delete()
        logger.info(f"Кэш страниц очищен для пользователя {user.username}")
