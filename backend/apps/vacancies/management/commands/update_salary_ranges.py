from django.core.management.base import BaseCommand
from apps.vacancies.models import SalaryRange


class Command(BaseCommand):
    help = "Обновляет зарплатные вилки при изменении курсов валют"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Принудительное обновление всех зарплатных вилок',
        )

    def handle(self, *args, **options):
        self.stdout.write("🔄 Начинаю обновление зарплатных вилок...")
        
        try:
            # Получаем все активные зарплатные вилки
            salary_ranges = SalaryRange.objects.filter(is_active=True)
            
            if not salary_ranges.exists():
                self.stdout.write("ℹ️  Активные зарплатные вилки не найдены")
                return
            
            updated_count = 0
            error_count = 0
            
            for salary_range in salary_ranges:
                try:
                    # Сохраняем объект, что автоматически пересчитает валюты
                    salary_range.save()
                    updated_count += 1
                    
                    self.stdout.write(
                        f"✅ Обновлена зарплатная вилка для грейда: {salary_range.grade.name}"
                    )
                    
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f"❌ Ошибка при обновлении зарплатной вилки для грейда {salary_range.grade.name}: {e}"
                        )
                    )
            
            # Выводим итоговую статистику
            self.stdout.write("\n" + "="*50)
            self.stdout.write(f"📊 Статистика обновления:")
            self.stdout.write(f"   ✅ Успешно обновлено: {updated_count}")
            if error_count > 0:
                self.stdout.write(f"   ❌ Ошибок: {error_count}")
            
            if updated_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"🎉 Обновление зарплатных вилок завершено! Обновлено {updated_count} вилок."
                    )
                )
            else:
                self.stdout.write("ℹ️  Нет зарплатных вилок для обновления")
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"💥 Критическая ошибка: {e}")
            )
            if not options['force']:
                raise

