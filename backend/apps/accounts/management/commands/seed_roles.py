from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.apps import apps

ROLE_NAMES = ["Администраторы", "Наблюдатели", "Рекрутеры", "Интервьюеры"]


class Command(BaseCommand):
    help = "Создаёт группы ролей и назначает права доступа"

    def handle(self, *args, **options):
        # Создаём группы
        groups = {name: Group.objects.get_or_create(name=name)[0] for name in ROLE_NAMES}

        # Все доступные права
        all_perms = Permission.objects.all()

        # Администраторы и Рекрутеры — все права
        groups["Администраторы"].permissions.set(all_perms)
        groups["Рекрутеры"].permissions.set(all_perms)

        # Наблюдатели — только view_* для всех моделей
        view_perms = Permission.objects.filter(codename__startswith="view_")
        groups["Наблюдатели"].permissions.set(view_perms)

        # Интервьюеры — видеть всё + редактировать только себя (на уровне view пермишены глобально)
        groups["Интервьюеры"].permissions.set(view_perms)

        self.stdout.write(self.style.SUCCESS("Группы и права настроены."))
