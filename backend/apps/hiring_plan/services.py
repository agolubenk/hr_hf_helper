from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from .models import HiringPlan, HiringPlanPosition


class HiringPlanService:
    """Сервис для работы с планами найма"""
    
    @staticmethod
    def get_dashboard_data(hiring_plan):
        """Получить данные для дашборда плана"""
        positions = hiring_plan.positions.all()
        
        return {
            'overview': {
                'total_positions': hiring_plan.total_positions,
                'total_needed': hiring_plan.total_headcount_needed,
                'total_hired': hiring_plan.total_headcount_hired,
                'total_in_progress': hiring_plan.total_headcount_in_progress,
                'completion_rate': hiring_plan.completion_rate,
            },
            'by_priority': {
                'critical': positions.filter(priority=1, is_active=True).count(),
                'high': positions.filter(priority=2, is_active=True).count(),
                'medium': positions.filter(priority=3, is_active=True).count(),
                'low': positions.filter(priority=4, is_active=True).count(),
            },
            'by_status': {
                'fulfilled': positions.filter(
                    is_active=True,
                    headcount_hired__gte=F('headcount_needed')
                ).count(),
                'in_progress': positions.filter(
                    is_active=True,
                    headcount_in_progress__gt=0,
                    headcount_hired__lt=F('headcount_needed')
                ).count(),
                'not_started': positions.filter(
                    is_active=True,
                    headcount_in_progress=0,
                    headcount_hired=0
                ).count(),
            },
            'overdue': positions.filter(
                urgency_deadline__lt=timezone.now().date(),
                headcount_hired__lt=F('headcount_needed'),
                is_active=True
            ).count(),
            'upcoming_deadlines': positions.filter(
                urgency_deadline__gte=timezone.now().date(),
                urgency_deadline__lte=timezone.now().date() + timezone.timedelta(days=7),
                headcount_hired__lt=F('headcount_needed'),
                is_active=True
            ).count(),
        }
    
    @staticmethod
    def get_plans_summary():
        """Получить summary всех планов"""
        active_plans = HiringPlan.objects.filter(status='active')
        
        return {
            'total_plans': HiringPlan.objects.count(),
            'active_plans': active_plans.count(),
            'total_positions': sum(p.total_positions for p in active_plans),
            'total_needed': sum(p.total_headcount_needed for p in active_plans),
            'total_hired': sum(p.total_headcount_hired for p in active_plans),
            'overall_completion_rate': HiringPlanService._calculate_overall_completion_rate(active_plans),
        }
    
    @staticmethod
    def _calculate_overall_completion_rate(plans):
        """Рассчитать общий процент выполнения по всем планам"""
        total_needed = sum(p.total_headcount_needed for p in plans)
        if total_needed == 0:
            return 0
        total_hired = sum(p.total_headcount_hired for p in plans)
        return round((total_hired / total_needed) * 100, 2)
    
    @staticmethod
    def get_priority_statistics():
        """Получить статистику по приоритетам"""
        positions = HiringPlanPosition.objects.filter(is_active=True)
        
        return {
            'critical': {
                'count': positions.filter(priority=1).count(),
                'fulfilled': positions.filter(priority=1, headcount_hired__gte=F('headcount_needed')).count(),
                'overdue': positions.filter(
                    priority=1, 
                    urgency_deadline__lt=timezone.now().date(),
                    headcount_hired__lt=F('headcount_needed')
                ).count(),
            },
            'high': {
                'count': positions.filter(priority=2).count(),
                'fulfilled': positions.filter(priority=2, headcount_hired__gte=F('headcount_needed')).count(),
                'overdue': positions.filter(
                    priority=2, 
                    urgency_deadline__lt=timezone.now().date(),
                    headcount_hired__lt=F('headcount_needed')
                ).count(),
            },
            'medium': {
                'count': positions.filter(priority=3).count(),
                'fulfilled': positions.filter(priority=3, headcount_hired__gte=F('headcount_needed')).count(),
                'overdue': positions.filter(
                    priority=3, 
                    urgency_deadline__lt=timezone.now().date(),
                    headcount_hired__lt=F('headcount_needed')
                ).count(),
            },
            'low': {
                'count': positions.filter(priority=4).count(),
                'fulfilled': positions.filter(priority=4, headcount_hired__gte=F('headcount_needed')).count(),
                'overdue': positions.filter(
                    priority=4, 
                    urgency_deadline__lt=timezone.now().date(),
                    headcount_hired__lt=F('headcount_needed')
                ).count(),
            },
        }
    
    @staticmethod
    def get_overdue_positions():
        """Получить просроченные позиции"""
        return HiringPlanPosition.objects.filter(
            urgency_deadline__lt=timezone.now().date(),
            headcount_hired__lt=F('headcount_needed'),
            is_active=True
        ).select_related('hiring_plan', 'vacancy').order_by('urgency_deadline')
    
    @staticmethod
    def get_upcoming_deadlines(days=7):
        """Получить позиции с приближающимися дедлайнами"""
        end_date = timezone.now().date() + timezone.timedelta(days=days)
        return HiringPlanPosition.objects.filter(
            urgency_deadline__gte=timezone.now().date(),
            urgency_deadline__lte=end_date,
            headcount_hired__lt=F('headcount_needed'),
            is_active=True
        ).select_related('hiring_plan', 'vacancy').order_by('urgency_deadline')
    
    @staticmethod
    def get_plans_by_recruiter(recruiter):
        """Получить планы по рекрутеру"""
        return HiringPlan.objects.filter(
            responsible_recruiter=recruiter
        ).order_by('-created_at')
    
    @staticmethod
    def get_plans_by_status(status):
        """Получить планы по статусу"""
        return HiringPlan.objects.filter(status=status).order_by('-created_at')
    
    @staticmethod
    def update_plan_status(plan, new_status):
        """Обновить статус плана"""
        plan.status = new_status
        plan.save()
        return plan
    
    @staticmethod
    def get_plan_progress_timeline(plan):
        """Получить временную линию прогресса плана"""
        # Это можно расширить для отслеживания изменений во времени
        return {
            'created_at': plan.created_at,
            'last_updated': plan.updated_at,
            'positions_added': plan.positions.count(),
            'current_completion_rate': plan.completion_rate,
        }
