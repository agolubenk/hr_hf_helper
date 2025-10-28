/**
 * Свитчер Интервью/Скрининг
 */

let currentMeetingType = 'screening';

// Конфигурация будет загружена из вакансии
let MEETING_CONFIG = {
    screening: {
        defaultDuration: 45, // Будет обновлено из вакансии
        info: 'Скрининг'
    },
    interview: {
        defaultDuration: 90, // Будет обновлено из вакансии
        info: 'Интервью'
    }
};

// Глобальная функция для переключения типа встречи
window.switchMeetingType = function(newType) {
    console.log(`🔄 [SWITCHER] Переключение на: ${newType}`);
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.btn-meeting-type').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавляем активный класс к выбранной кнопке
    const activeBtn = document.getElementById(`btn${newType.charAt(0).toUpperCase() + newType.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    currentMeetingType = newType;
    const conf = MEETING_CONFIG[newType];
    
    if (window.vacancyData) {
        window.vacancyData.duration = conf.defaultDuration;
    }
    
    // Пересчитать слоты
    if (typeof initializeSlots === 'function') {
        console.log('🔄 [SWITCHER] Пересчет слотов...');
        initializeSlots();
    }
    
    console.log(`✅ [SWITCHER] Тип: ${newType}, длительность: ${conf.defaultDuration} мин`);
};

// Функция для загрузки конфигурации из вакансии
function loadMeetingConfigFromVacancy() {
    if (window.vacancyData) {
        // Обновляем конфигурацию из данных вакансии
        MEETING_CONFIG.screening.defaultDuration = window.vacancyData.screening_duration || 45;
        MEETING_CONFIG.interview.defaultDuration = window.vacancyData.tech_interview_duration || 90;
        
        console.log('✅ [SWITCHER] Конфигурация загружена из вакансии:');
        console.log(`  - Скрининг: ${MEETING_CONFIG.screening.defaultDuration} мин`);
        console.log(`  - Интервью: ${MEETING_CONFIG.interview.defaultDuration} мин`);
    } else {
        console.warn('⚠️ [SWITCHER] Данные вакансии не найдены, используем значения по умолчанию');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 [SWITCHER] Инициализация');
    
    const screeningBtn = document.getElementById('btnScreening');
    const interviewBtn = document.getElementById('btnInterview');
    
    if (!screeningBtn || !interviewBtn) {
        console.log('ℹ️ [SWITCHER] Кнопки свитчера не найдены');
        return;
    }
    
    // Загружаем конфигурацию из вакансии
    loadMeetingConfigFromVacancy();
    
    // Устанавливаем активное состояние по умолчанию
    screeningBtn.classList.add('active');
    
    // Экспорт в глобальную область
    window.getCurrentMeetingType = () => currentMeetingType;
    window.getCurrentMeetingConfig = () => MEETING_CONFIG[currentMeetingType];
    
    console.log('✅ [SWITCHER] Инициализация завершена');
});
