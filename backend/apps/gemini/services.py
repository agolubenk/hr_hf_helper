import requests
import json
import time
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.core.exceptions import ValidationError


class GeminiService:
    """
    Сервис для работы с Google Gemini API
    """
    
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
    MODEL = "gemini-2.0-flash"
    
    def __init__(self, api_key: str):
        """
        Инициализация сервиса с API ключом
        
        Args:
            api_key: API ключ для доступа к Gemini API
        """
        if not api_key:
            raise ValidationError("API ключ не может быть пустым")
        
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
        })
    
    def _make_request(self, endpoint: str, data: Dict, max_retries: int = 2) -> Tuple[bool, Dict, Optional[str]]:
        """
        Выполняет запрос к Gemini API с повторными попытками
        
        Args:
            endpoint: Конечная точка API
            data: Данные для отправки
            max_retries: Максимальное количество повторных попыток
            
        Returns:
            Tuple[bool, Dict, Optional[str]]: (успех, ответ, ошибка)
        """
        url = f"{self.BASE_URL}/{endpoint}?key={self.api_key}"
        
        for attempt in range(max_retries + 1):
            try:
                start_time = time.time()
                response = self.session.post(url, json=data, timeout=30)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    response_data = response.json()
                    return True, response_data, None
                else:
                    # Обработка специфических ошибок
                    try:
                        error_data = response.json()
                        if response.status_code == 503:
                            if attempt < max_retries:
                                # Ждем перед повторной попыткой
                                wait_time = (attempt + 1) * 2  # 2, 4 секунды
                                time.sleep(wait_time)
                                continue
                            else:
                                return False, {}, "Модель Gemini перегружена. Пожалуйста, попробуйте позже."
                        elif response.status_code == 429:
                            if attempt < max_retries:
                                # Ждем перед повторной попыткой
                                wait_time = (attempt + 1) * 3  # 3, 6 секунд
                                time.sleep(wait_time)
                                continue
                            else:
                                return False, {}, "Превышен лимит запросов. Пожалуйста, подождите немного."
                        elif response.status_code == 400:
                            error_message = error_data.get('error', {}).get('message', 'Неверный запрос')
                            return False, {}, f"Ошибка запроса: {error_message}"
                        else:
                            error_message = error_data.get('error', {}).get('message', response.text)
                            return False, {}, f"Ошибка API ({response.status_code}): {error_message}"
                    except json.JSONDecodeError:
                        error_msg = f"Ошибка API: {response.status_code} - {response.text}"
                        return False, {}, error_msg
                        
            except requests.exceptions.Timeout:
                if attempt < max_retries:
                    time.sleep(2)
                    continue
                return False, {}, "Превышено время ожидания запроса"
            except requests.exceptions.ConnectionError:
                if attempt < max_retries:
                    time.sleep(2)
                    continue
                return False, {}, "Ошибка подключения к API"
            except requests.exceptions.RequestException as e:
                if attempt < max_retries:
                    time.sleep(2)
                    continue
                return False, {}, f"Ошибка запроса: {str(e)}"
            except json.JSONDecodeError:
                return False, {}, "Ошибка декодирования JSON ответа"
        
        # Если все попытки исчерпаны
        return False, {}, "Превышено максимальное количество попыток"
    
    def generate_content(self, prompt: str, history: List[Dict] = None) -> Tuple[bool, str, Dict]:
        """
        Генерирует контент с помощью Gemini API
        
        Args:
            prompt: Текст запроса пользователя
            history: История предыдущих сообщений
            
        Returns:
            Tuple[bool, str, Dict]: (успех, ответ, метаданные)
        """
        if not prompt.strip():
            return False, "Запрос не может быть пустым", {}
        
        # Формируем содержимое для API
        contents = []
        
        # Добавляем историю сообщений
        if history:
            for msg in history:
                if msg.get('role') in ['user', 'assistant']:
                    contents.append({
                        "role": msg['role'],
                        "parts": [{"text": msg['content']}]
                    })
        
        # Добавляем текущий запрос
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })
        
        # Данные для API
        data = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        # Выполняем запрос
        success, response_data, error = self._make_request(
            f"models/{self.MODEL}:generateContent", 
            data
        )
        
        if not success:
            return False, error, {}
        
        # Извлекаем ответ
        try:
            if 'candidates' in response_data and response_data['candidates']:
                candidate = response_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    response_text = candidate['content']['parts'][0]['text']
                    
                    # Метаданные
                    metadata = {
                        'response_time': response_data.get('response_time', 0),
                        'usage_metadata': response_data.get('usageMetadata', {}),
                        'finish_reason': candidate.get('finishReason', ''),
                        'safety_ratings': candidate.get('safetyRatings', [])
                    }
                    
                    return True, response_text, metadata
                else:
                    return False, "Не удалось извлечь ответ из API", {}
            else:
                return False, "API не вернул кандидатов", {}
                
        except (KeyError, IndexError, TypeError) as e:
            return False, f"Ошибка обработки ответа: {str(e)}", {}
    
    def test_connection(self) -> Tuple[bool, str]:
        """
        Тестирует подключение к Gemini API
        
        Returns:
            Tuple[bool, str]: (успех, сообщение)
        """
        test_prompt = "Привет! Это тестовое сообщение. Ответь коротко."
        
        success, response, metadata = self.generate_content(test_prompt)
        
        if success:
            return True, "Подключение к Gemini API успешно установлено"
        else:
            return False, f"Ошибка подключения: {response}"
    
    def get_available_models(self) -> Tuple[bool, List[str], Optional[str]]:
        """
        Получает список доступных моделей
        
        Returns:
            Tuple[bool, List[str], Optional[str]]: (успех, модели, ошибка)
        """
        success, response_data, error = self._make_request("models", {})
        
        if not success:
            return False, [], error
        
        try:
            models = []
            if 'models' in response_data:
                for model in response_data['models']:
                    if 'name' in model:
                        models.append(model['name'])
            return True, models, None
        except (KeyError, TypeError) as e:
            return False, [], f"Ошибка обработки списка моделей: {str(e)}"
