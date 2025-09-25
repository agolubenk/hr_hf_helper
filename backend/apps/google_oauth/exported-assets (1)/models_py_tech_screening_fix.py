
# ДОБАВЛЕНИЕ в models.py в класс Invite

def update_candidate_status_to_tech_screening(self):
    """Обновление статуса кандидата на Tech Screening в Huntflow"""
    try:
        from apps.huntflow.services import HuntflowService
        from apps.vacancies.models import Vacancy
        from datetime import datetime, timezone, timedelta
        import re

        print(f"[TECH_SCREENING] Обновляем статус кандидата {self.candidate_id}")

        # Получаем account_id пользователя
        account_id = self.get_user_account_id()
        if not account_id:
            print("[TECH_SCREENING] Не удалось получить account_id")
            return False

        # ID статуса Tech Screening (нужно получить через Huntflow API или настройки)
        # TODO: Получить актуальный ID статуса Tech Screening через API
        tech_screening_status_id = 3459  # Замените на актуальный ID

        # Формируем комментарий в формате "Четверг, 25 сентября⋅11:00–11:45"
        comment = self.get_formatted_interview_datetime()
        print(f"[TECH_SCREENING] Кандидат: {self.candidate_id} -> Tech Screening")
        print(f"[TECH_SCREENING] Комментарий: {comment}")

        service = HuntflowService(self.user)
        result = service.update_applicant_status(
            account_id=account_id,
            applicant_id=int(self.candidate_id),
            status_id=tech_screening_status_id,
            comment=comment,
            vacancy_id=int(self.vacancy_id) if self.vacancy_id else None
        )

        if result:
            print(f"[TECH_SCREENING] Успешно обновлен статус на Tech Screening")
            return True
        else:
            print(f"[TECH_SCREENING] Ошибка при обновлении статуса")
            return False

    except Exception as e:
        print(f"[TECH_SCREENING] Исключение: {str(e)}")
        return False

# ИЗМЕНЕНИЕ в методе create_google_drive_structure:
# После строки:
# calendar_success = self.create_calendar_event()
# print(f"[CALENDAR_SUCCESS] {calendar_success}")

# ДОБАВИТЬ:
if calendar_success:
    # Обновляем статус на Tech Screening при создании инвайта со scorecard
    tech_screening_success = self.update_candidate_status_to_tech_screening()
    print(f"[TECH_SCREENING_UPDATE] Статус обновлен: {tech_screening_success}")

# self.update_candidate_status_to_tech_screening()
return True, f"Создана структура: {folder_path}. Scorecard и событие созданы."
