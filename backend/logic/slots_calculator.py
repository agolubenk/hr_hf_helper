"""
Модуль для расчета доступных слотов на основе событий календаря
"""
from datetime import datetime, timedelta, time
from typing import List, Dict, Optional, Any
import pytz


class SlotsCalculator:
    """Класс для расчета доступных временных слотов"""
    
    def __init__(self, work_start_hour: int = 11, work_end_hour: int = 18, 
                 meeting_interval_minutes: int = 15):
        """
        Инициализация калькулятора слотов
        
        Args:
            work_start_hour: Час начала рабочего дня (по умолчанию 11)
            work_end_hour: Час окончания рабочего дня (по умолчанию 18)
            meeting_interval_minutes: Время между встречами в минутах (по умолчанию 15)
        """
        self.work_start_hour = work_start_hour
        self.work_end_hour = work_end_hour
        self.meeting_interval_minutes = meeting_interval_minutes
        self.minsk_tz = pytz.timezone('Europe/Minsk')
    
    def calculate_slots_for_week(self, events_data: List[Dict], 
                                  required_duration_minutes: int = 45,
                                  week_offset: int = 0) -> List[Dict]:
        """
        Вычисляет доступные слоты для недели
        
        Args:
            events_data: Список событий календаря в формате API
            required_duration_minutes: Требуемая продолжительность встречи в минутах
            week_offset: Смещение недели (0 - текущая, 1 - следующая и т.д.)
        
        Returns:
            Список словарей с информацией о слотах для каждого дня
        """
        today = datetime.now(self.minsk_tz)
        
        # Вычисляем начало недели (понедельник)
        days_since_monday = today.weekday()
        start_of_week = today - timedelta(days=days_since_monday)
        
        # Добавляем смещение недели
        start_of_week = start_of_week + timedelta(weeks=week_offset)
        
        # Генерируем слоты для каждого рабочего дня (пн-пт)
        slots = []
        weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
        
        for i in range(5):
            date = start_of_week + timedelta(days=i)
            
            # Пропускаем прошедшие дни и текущий день
            today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
            if date < today_start:
                print(f"⏭️ Пропускаем прошедший день: {date.strftime('%d.%m.%Y')}")
                continue
            
            # Получаем события для этого дня
            day_events = self._filter_events_for_date(events_data, date)
            
            # Подсчитываем количество встреч (исключая обеды и события на весь день)
            meetings_count = len([e for e in day_events if self._is_meeting(e)])
            
            # Вычисляем доступные слоты
            available_slots = self._calculate_available_slots_for_day(
                day_events, date, required_duration_minutes
            )
            
            slots.append({
                'date': date.isoformat(),
                'dateStr': date.strftime('%d.%m.%Y'),
                'weekday': weekdays[i],
                'meetingsCount': meetings_count,
                'availableSlots': available_slots
            })
            
            print(f"📅 День {weekdays[i]} {date.strftime('%d.%m.%Y')}: {meetings_count} встреч, слоты: {available_slots}")
        
        print(f"📅 Итого дней со слотами в неделе: {len(slots)}")
        return slots
    
    def calculate_slots_for_two_weeks(self, events_data: List[Dict], 
                                      required_duration_minutes: int = 45) -> List[Dict]:
        """
        Вычисляет доступные слоты на 2 недели (текущая + следующая)
        Всегда возвращает 10 дней: оставшиеся дни текущей недели + полная следующая неделя
        Прошедшие дни и текущий день пропускаются
        
        Args:
            events_data: Список событий календаря в формате API
            required_duration_minutes: Требуемая продолжительность встречи в минутах
        
        Returns:
            Список словарей с информацией о слотах для каждого дня (до 10 дней)
        """
        # Получаем слоты для текущей недели (с пропуском прошедших дней)
        current_week_slots = self.calculate_slots_for_week(
            events_data, required_duration_minutes, week_offset=0
        )
        
        # Всегда добавляем слоты для следующей недели
        next_week_slots = self.calculate_slots_for_week(
            events_data, required_duration_minutes, week_offset=1
        )
        
        # Объединяем слоты
        all_slots = current_week_slots + next_week_slots
        
        return all_slots[:10]  # Возвращаем максимум 10 дней
    
    def _filter_events_for_date(self, events_data: List[Dict], date: datetime) -> List[Dict]:
        """
        Фильтрует события для определенной даты
        
        Args:
            events_data: Список событий
            date: Дата для фильтрации
        
        Returns:
            Отфильтрованные события
        """
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        day_events = []
        for event in events_data:
            event_start = self._parse_event_start(event)
            if event_start and date_start <= event_start <= date_end:
                day_events.append(event)
        
        return day_events
    
    def _is_meeting(self, event: Dict) -> bool:
        """
        Проверяет, является ли событие встречей (не обедом, не на весь день и т.д.)
        
        Args:
            event: Событие календаря
        
        Returns:
            True если это встреча, False иначе
        """
        # Проверяем, не является ли событие на весь день
        if event.get('is_all_day') or event.get('isallday'):
            return False
        
        # Проверяем название события
        title = event.get('title', '').lower()
        
        # Исключаем обеды
        if 'обед' in title or 'lunch' in title:
            return False
        
        # Исключаем нерабочие события
        if any(word in title for word in ['отпуск', 'vacation', 'выходной', 'day off']):
            return False
        
        return True
    
    def _calculate_available_slots_for_day(self, day_events: List[Dict], 
                                           date: datetime, 
                                           required_duration_minutes: int) -> str:
        """
        Вычисляет доступные слоты для дня
        
        Args:
            day_events: События дня
            date: Дата
            required_duration_minutes: Требуемая продолжительность встречи в минутах
        
        Returns:
            Строка с доступными слотами или "Нет свободных слотов"
        """
        # Создаем массив занятых интервалов
        occupied_intervals = []
        
        for event in day_events:
            # Пропускаем события на весь день
            if event.get('is_all_day') or event.get('isallday'):
                continue
            
            event_start = self._parse_event_start(event)
            event_end = self._parse_event_end(event)
            
            if not event_start or not event_end:
                continue
            
            # Расширяем интервал события на время между встречами
            extended_start = event_start - timedelta(minutes=self.meeting_interval_minutes)
            extended_end = event_end + timedelta(minutes=self.meeting_interval_minutes)
            
            # Проверяем, пересекается ли расширенный интервал с рабочими часами
            work_start = date.replace(hour=self.work_start_hour, minute=0, second=0, microsecond=0)
            work_end = date.replace(hour=self.work_end_hour, minute=0, second=0, microsecond=0)
            
            if extended_start < work_end and extended_end > work_start:
                # Ограничиваем интервал рабочими часами
                interval_start = max(extended_start, work_start)
                interval_end = min(extended_end, work_end)
                
                occupied_intervals.append({
                    'start': interval_start,
                    'end': interval_end
                })
        
        # Сортируем занятые интервалы по времени начала
        occupied_intervals.sort(key=lambda x: x['start'])
        
        # Объединяем пересекающиеся интервалы
        merged_intervals = []
        for interval in occupied_intervals:
            if not merged_intervals:
                merged_intervals.append(interval)
            else:
                last_interval = merged_intervals[-1]
                if interval['start'] <= last_interval['end']:
                    # Интервалы пересекаются, объединяем их
                    last_interval['end'] = max(last_interval['end'], interval['end'])
                else:
                    # Интервалы не пересекаются, добавляем новый
                    merged_intervals.append(interval)
        
        # Формируем свободные интервалы
        free_intervals = []
        
        # Определяем время начала поиска слотов
        # Если это текущий день - начинаем с текущего момента, иначе с начала рабочего дня
        today = datetime.now(self.minsk_tz)
        work_start = date.replace(hour=self.work_start_hour, minute=0, second=0, microsecond=0)
        
        if date.date() == today.date():
            # Если это сегодня - начинаем с текущего момента
            # Округляем до следующего интервала
            current_minute = today.minute
            rounded_minute = ((current_minute // 15) + 1) * 15
            if rounded_minute >= 60:
                current_time = today.replace(hour=today.hour + 1, minute=0, second=0, microsecond=0)
            else:
                current_time = today.replace(minute=rounded_minute, second=0, microsecond=0)
            current_time = max(current_time, work_start)
        else:
            # Если это будущий день - начинаем с начала рабочего дня
            current_time = work_start
        
        for interval in merged_intervals:
            if current_time < interval['start']:
                # Есть свободный интервал перед занятым
                free_intervals.append({
                    'start': current_time,
                    'end': interval['start']
                })
            current_time = max(current_time, interval['end'])
        
        # Проверяем, есть ли свободное время после последнего занятого интервала
        work_end = date.replace(hour=self.work_end_hour, minute=0, second=0, microsecond=0)
        if current_time < work_end:
            free_intervals.append({
                'start': current_time,
                'end': work_end
            })
        
        # Формируем строку доступных слотов
        available_ranges = []
        for interval in free_intervals:
            duration_minutes = int((interval['end'] - interval['start']).total_seconds() / 60)
            
            # Показываем интервал только если он длится больше 15 минут И больше или равен требуемой продолжительности
            # Если required_duration_minutes не указан, используем только проверку на 15 минут
            if required_duration_minutes is None or required_duration_minutes <= 0:
                min_duration = 15
            else:
                min_duration = max(15, required_duration_minutes)
            
            if duration_minutes >= min_duration:
                start_time = self._format_time(interval['start'])
                end_time = self._format_time(interval['end'])
                
                if start_time == end_time:
                    available_ranges.append(start_time)
                else:
                    available_ranges.append(f"{start_time}-{end_time}")
        
        return ', '.join(available_ranges) if available_ranges else 'Нет свободных слотов'
    
    def _parse_event_start(self, event: Dict) -> Optional[datetime]:
        """
        Парсит время начала события
        
        Args:
            event: Событие календаря
        
        Returns:
            datetime объект или None
        """
        start_str = event.get('start')
        if not start_str:
            return None
        
        try:
            if isinstance(start_str, datetime):
                return start_str
            
            # Парсим ISO формат
            if 'T' in start_str:
                dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                # Конвертируем в Minsk timezone если необходимо
                if dt.tzinfo is None:
                    dt = pytz.UTC.localize(dt)
                dt = dt.astimezone(self.minsk_tz)
                return dt
        except Exception as e:
            print(f"Ошибка парсинга времени начала события: {e}")
        
        return None
    
    def _parse_event_end(self, event: Dict) -> Optional[datetime]:
        """
        Парсит время окончания события
        
        Args:
            event: Событие календаря
        
        Returns:
            datetime объект или None
        """
        end_str = event.get('end')
        if not end_str:
            return None
        
        try:
            if isinstance(end_str, datetime):
                return end_str
            
            # Парсим ISO формат
            if 'T' in end_str:
                dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                # Конвертируем в Minsk timezone если необходимо
                if dt.tzinfo is None:
                    dt = pytz.UTC.localize(dt)
                dt = dt.astimezone(self.minsk_tz)
                return dt
        except Exception as e:
            print(f"Ошибка парсинга времени окончания события: {e}")
        
        return None
    
    def _format_time(self, dt: datetime) -> str:
        """
        Форматирует время в формат "H.MM"
        
        Args:
            dt: datetime объект
        
        Returns:
            Отформатированная строка времени
        """
        hours = dt.hour
        minutes = dt.minute
        return f"{hours}.{minutes:02d}"

