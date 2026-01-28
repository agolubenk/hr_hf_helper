"""
Сервис для получения и обработки данных кандидатов из Huntflow
"""
import logging
from typing import Dict, Any, Optional, List
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.huntflow.services import HuntflowService
from .models import HuntflowCandidateUpdate, HuntflowSyncLog

User = get_user_model()
logger = logging.getLogger(__name__)


class HuntflowUpdatesService:
    """
    Сервис для синхронизации данных кандидатов из Huntflow
    """
    
    def __init__(self, user: User):
        """
        Инициализация сервиса
        
        Args:
            user: Пользователь Django
        """
        self.user = user
        self.huntflow_service = HuntflowService(user)
    
    def extract_candidate_data(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Извлечение данных кандидата из ответа Huntflow API
        
        Args:
            candidate_data: Словарь с данными кандидата из Huntflow API
            
        Returns:
            Словарь с извлеченными данными для модели
        """
        extracted = {
            'huntflow_candidate_id': candidate_data.get('id'),
            'raw_data': candidate_data,
        }
        
        # Извлекаем персональные данные
        if 'last_name' in candidate_data:
            extracted['last_name'] = candidate_data.get('last_name')
        if 'first_name' in candidate_data:
            extracted['first_name'] = candidate_data.get('first_name')
        if 'middle_name' in candidate_data:
            extracted['middle_name'] = candidate_data.get('middle_name')
        if 'birthday' in candidate_data:
            extracted['birth_date'] = candidate_data.get('birthday')
        
        # Извлекаем контактную информацию
        if 'phones' in candidate_data and candidate_data['phones']:
            # Берем первый телефон
            extracted['phone'] = candidate_data['phones'][0].get('value', '')
        
        if 'email' in candidate_data:
            extracted['email'] = candidate_data.get('email')
        
        # Извлекаем telegram из социальных сетей или дополнительных полей
        if 'social' in candidate_data:
            for social in candidate_data['social']:
                if social.get('type') == 'telegram' or 'telegram' in social.get('value', '').lower():
                    extracted['telegram'] = social.get('value', '')
                    break
        
        # Извлекаем данные из questionary (анкеты)
        questionary = candidate_data.get('questionary', {})
        if isinstance(questionary, dict):
            # Проходим по полям анкеты
            for field_name, field_value in questionary.items():
                field_name_lower = field_name.lower()
                
                # Источник
                if 'источник' in field_name_lower or 'source' in field_name_lower:
                    extracted['source'] = self._extract_field_value(field_value)
                
                # Зарплатные ожидания
                if 'зарплат' in field_name_lower or 'salary' in field_name_lower or 'ожидан' in field_name_lower:
                    extracted['salary_expectations'] = self._extract_field_value(field_value)
                
                # Резюме
                if 'резюме' in field_name_lower or 'resume' in field_name_lower or 'cv' in field_name_lower:
                    extracted['resume'] = self._extract_field_value(field_value)
                
                # Уровень
                if 'уровен' in field_name_lower or 'level' in field_name_lower or 'grade' in field_name_lower:
                    extracted['level'] = self._extract_field_value(field_value)
                
                # Scorecard
                if 'scorecard' in field_name_lower:
                    extracted['scorecard'] = self._extract_field_value(field_value)
                
                # Офисный формат
                if 'офисный формат' in field_name_lower or 'office format' in field_name_lower:
                    extracted['office_format'] = self._extract_field_value(field_value)
                
                # Офис
                if field_name_lower == 'офис' or field_name_lower == 'office':
                    extracted['office'] = self._extract_field_value(field_value)
                
                # Полный рабочий день
                if 'полный рабочий день' in field_name_lower or 'full time' in field_name_lower:
                    extracted['full_time'] = self._extract_field_value(field_value)
                
                # Распределение
                if 'распределен' in field_name_lower or 'distribution' in field_name_lower:
                    extracted['distribution'] = self._extract_field_value(field_value)
                
                # Армия
                if 'армия' in field_name_lower or 'army' in field_name_lower or 'военн' in field_name_lower:
                    extracted['army'] = self._extract_field_value(field_value)
                
                # Релокация
                if 'релокац' in field_name_lower or 'relocation' in field_name_lower:
                    extracted['relocation'] = self._extract_field_value(field_value)
                
                # Причина смены работы
                if 'причина смен' in field_name_lower or 'job change' in field_name_lower or 'смен' in field_name_lower:
                    extracted['job_change_reason'] = self._extract_field_value(field_value)
                
                # Сроки выхода
                if 'срок' in field_name_lower and 'выход' in field_name_lower or 'start date' in field_name_lower:
                    extracted['start_date'] = self._extract_field_value(field_value)
                
                # Где ведется коммуникация
                if 'коммуникац' in field_name_lower or 'communication' in field_name_lower:
                    extracted['communication_channel'] = self._extract_field_value(field_value)
                
                # Для PL - UoP/B2B?
                if 'uop' in field_name_lower or 'b2b' in field_name_lower or 'pl' in field_name_lower:
                    if '?' in field_name or 'uop' in field_name_lower or 'b2b' in field_name_lower:
                        extracted['pl_contract_type'] = self._extract_field_value(field_value)
        
        return extracted
    
    def _extract_field_value(self, field_value: Any) -> Optional[str]:
        """
        Извлечение значения из поля анкеты
        
        Args:
            field_value: Значение поля (может быть строкой, словарем, списком)
            
        Returns:
            Строковое представление значения или None
        """
        if field_value is None:
            return None
        
        if isinstance(field_value, str):
            return field_value.strip() if field_value.strip() else None
        
        if isinstance(field_value, dict):
            # Если это словарь, пытаемся найти значение
            if 'value' in field_value:
                return str(field_value['value']).strip() if field_value['value'] else None
            if 'name' in field_value:
                return str(field_value['name']).strip() if field_value['name'] else None
            # Возвращаем первое непустое значение
            for key, val in field_value.items():
                if val and str(val).strip():
                    return str(val).strip()
            return None
        
        if isinstance(field_value, list):
            # Если это список, объединяем значения
            values = [str(v).strip() for v in field_value if v and str(v).strip()]
            return ', '.join(values) if values else None
        
        return str(field_value).strip() if field_value else None
    
    def sync_candidates(
        self,
        account_id: int,
        start_from_id: Optional[int] = None,
        limit: int = 100
    ) -> HuntflowSyncLog:
        """
        Синхронизация кандидатов из Huntflow
        
        Args:
            account_id: ID аккаунта в Huntflow
            start_from_id: ID кандидата, с которого начинать синхронизацию (для продолжения)
            limit: Количество кандидатов для обработки за раз
            
        Returns:
            HuntflowSyncLog объект с результатами синхронизации
        """
        # Создаем лог синхронизации
        sync_log = HuntflowSyncLog.objects.create(
            user=self.user,
            status='started',
            last_processed_candidate_id=start_from_id
        )
        
        try:
            sync_log.status = 'in_progress'
            sync_log.save()
            
            # Получаем список кандидатов из Huntflow
            # Используем метод из HuntflowService для получения кандидатов
            # Предполагаем, что есть метод get_applicants или аналогичный
            
            candidates_processed = 0
            candidates_created = 0
            candidates_updated = 0
            errors_count = 0
            last_processed_id = start_from_id
            
            # Здесь будет логика получения кандидатов из Huntflow
            # Пока заглушка - нужно будет реализовать метод получения кандидатов
            # с поддержкой пагинации и фильтрации по ID
            
            # Пример структуры:
            # candidates = self.huntflow_service.get_applicants(
            #     account_id=account_id,
            #     start_from_id=start_from_id,
            #     limit=limit
            # )
            
            # for candidate_data in candidates:
            #     try:
            #         extracted_data = self.extract_candidate_data(candidate_data)
            #         candidate_id = extracted_data.get('huntflow_candidate_id')
            #         
            #         if not candidate_id:
            #             continue
            #         
            #         # Создаем или обновляем запись
            #         candidate_update, created = HuntflowCandidateUpdate.objects.update_or_create(
            #             user=self.user,
            #             huntflow_candidate_id=candidate_id,
            #             defaults=extracted_data
            #         )
            #         
            #         if created:
            #             candidates_created += 1
            #         else:
            #             candidates_updated += 1
            #         
            #         candidates_processed += 1
            #         last_processed_id = candidate_id
            #         
            #     except Exception as e:
            #         logger.error(f"Ошибка обработки кандидата: {e}")
            #         errors_count += 1
            
            # Обновляем лог
            sync_log.status = 'completed'
            sync_log.completed_at = timezone.now()
            sync_log.candidates_processed = candidates_processed
            sync_log.candidates_created = candidates_created
            sync_log.candidates_updated = candidates_updated
            sync_log.errors_count = errors_count
            sync_log.last_processed_candidate_id = last_processed_id
            sync_log.save()
            
            logger.info(
                f"Синхронизация завершена для пользователя {self.user.username}: "
                f"обработано {candidates_processed}, создано {candidates_created}, "
                f"обновлено {candidates_updated}, ошибок {errors_count}"
            )
            
            return sync_log
            
        except Exception as e:
            logger.error(f"Ошибка синхронизации кандидатов: {e}")
            sync_log.status = 'error'
            sync_log.completed_at = timezone.now()
            sync_log.error_message = str(e)
            sync_log.errors_count += 1
            sync_log.save()
            
            return sync_log
    
    def get_last_sync_log(self) -> Optional[HuntflowSyncLog]:
        """
        Получение последнего лога синхронизации
        
        Returns:
            Последний HuntflowSyncLog или None
        """
        return HuntflowSyncLog.objects.filter(
            user=self.user
        ).order_by('-started_at').first()
