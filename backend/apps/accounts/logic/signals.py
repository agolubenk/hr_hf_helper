"""
Сигналы для автоматической обработки событий пользователей
Объединяет логику из signals.py с использованием сервисного слоя
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from ..models import User
from .user_service import UserService


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Автоматическое создание профиля пользователя при создании
    """
    if created:
        # Автоматически назначаем роль наблюдателя новым пользователям
        from .role_service import RoleService
        if not instance.groups.filter(name='Наблюдатели').exists():
            success, message = RoleService.assign_role_to_user(instance, 'Наблюдатели')
            if success:
                print(f"✅ SIGNAL: Новому пользователю {instance.username} назначены права наблюдателя")
            else:
                print(f"⚠️ SIGNAL: Не удалось назначить права наблюдателя: {message}")


@receiver(pre_save, sender=User)
def update_user_full_name(sender, instance, **kwargs):
    """
    Автоматическое обновление full_name при изменении first_name или last_name
    """
    if instance.pk:  # Только для существующих пользователей
        try:
            old_instance = User.objects.get(pk=instance.pk)
            
            # Если изменились first_name или last_name, обновляем full_name
            if (old_instance.first_name != instance.first_name or 
                old_instance.last_name != instance.last_name):
                
                if instance.first_name and instance.last_name:
                    instance.full_name = f"{instance.first_name} {instance.last_name}"
                elif instance.first_name:
                    instance.full_name = instance.first_name
                elif instance.last_name:
                    instance.full_name = instance.last_name
                    
        except User.DoesNotExist:
            pass  # Пользователь не найден, пропускаем


@receiver(post_save, sender=User)
def log_user_activity(sender, instance, created, **kwargs):
    """
    Логирование активности пользователей
    """
    if created:
        print(f"📝 SIGNAL: Создан новый пользователь: {instance.username} ({instance.email})")
    else:
        print(f"📝 SIGNAL: Обновлен пользователь: {instance.username}")


@receiver(post_save, sender=User)
def sync_user_groups(sender, instance, **kwargs):
    """
    Синхронизация групп пользователя с флагами ролей
    """
    # Обновляем флаги ролей на основе групп
    instance.is_observer_active = instance.groups.filter(name='Наблюдатели').exists()
    
    # Сохраняем только если что-то изменилось
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            if old_instance.is_observer_active != instance.is_observer_active:
                instance.save(update_fields=['is_observer_active'])
        except User.DoesNotExist:
            pass
