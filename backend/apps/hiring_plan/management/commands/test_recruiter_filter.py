from django.core.management.base import BaseCommand
from apps.hiring_plan.models import HiringRequest
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Тестирование фильтра по рекрутерам'
    
    def handle(self, *args, **options):
        self.stdout.write('=== Тестирование фильтра по рекрутерам ===\n')
        
        # Получаем всех рекрутеров, которые закрывали заявки
        recruiters = HiringRequest.objects.filter(
            closed_by__isnull=False
        ).values_list('closed_by__id', 'closed_by__username').distinct().order_by('closed_by__username')
        
        self.stdout.write(f'Найдено рекрутеров: {recruiters.count()}\n')
        
        for recruiter_id, username in recruiters:
            # Считаем заявки для каждого рекрутера
            requests_count = HiringRequest.objects.filter(closed_by_id=recruiter_id).count()
            self.stdout.write(f'Рекрутер: {username} (ID: {recruiter_id}) - закрыл {requests_count} заявок')
        
        # Тестируем фильтрацию
        if recruiters.exists():
            first_recruiter_id = recruiters.first()[0]
            filtered_requests = HiringRequest.objects.filter(closed_by_id=first_recruiter_id)
            
            self.stdout.write(f'\nТест фильтрации по рекрутеру ID {first_recruiter_id}:')
            self.stdout.write(f'Найдено заявок: {filtered_requests.count()}')
            
            for request in filtered_requests[:3]:  # Показываем первые 3
                self.stdout.write(f'  - {request.vacancy.name} (статус: {request.status})')
        
        self.stdout.write('\n=== Тест завершен ===')
