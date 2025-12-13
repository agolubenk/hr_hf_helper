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
    const allButtons = document.querySelectorAll('.btn-meeting-type');
    console.log(`🔍 [SWITCHER] Найдено кнопок: ${allButtons.length}`);
    
    allButtons.forEach((btn, index) => {
        btn.classList.remove('active');
        console.log(`🔍 [SWITCHER] Кнопка ${index + 1}: убран класс active`);
    });
    
    // Добавляем активный класс к выбранной кнопке
    const activeBtn = document.getElementById(`btn${newType.charAt(0).toUpperCase() + newType.slice(1)}`);
    console.log(`🔍 [SWITCHER] Ищем кнопку: btn${newType.charAt(0).toUpperCase() + newType.slice(1)}`);
    
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log(`✅ [SWITCHER] Кнопка найдена и класс active добавлен`);
        
        // Визуальная проверка - добавляем временный стиль
        activeBtn.style.border = '5px solid #ff0000';
        activeBtn.style.background = 'linear-gradient(135deg, #ff0000, #ff6666)';
        setTimeout(() => {
            activeBtn.style.border = '';
            activeBtn.style.background = '';
        }, 1000);
    } else {
        console.error(`❌ [SWITCHER] Кнопка не найдена!`);
        alert(`Кнопка btn${newType.charAt(0).toUpperCase() + newType.slice(1)} не найдена!`);
    }
    
    // Показываем/скрываем расширяющееся полотно для настроек интервью
    const interviewOptionsPanel = document.getElementById('interviewOptionsPanel');
    if (interviewOptionsPanel) {
        if (newType === 'interview') {
            interviewOptionsPanel.style.display = 'block';
            // Плавное появление
            interviewOptionsPanel.style.opacity = '0';
            setTimeout(() => {
                interviewOptionsPanel.style.transition = 'opacity 0.3s ease-in-out';
                interviewOptionsPanel.style.opacity = '1';
            }, 10);
            console.log('✅ [SWITCHER] Панель настроек интервью показана');
        } else {
            // Плавное скрытие
            interviewOptionsPanel.style.transition = 'opacity 0.3s ease-in-out';
            interviewOptionsPanel.style.opacity = '0';
            setTimeout(() => {
                interviewOptionsPanel.style.display = 'none';
            }, 300);
            console.log('✅ [SWITCHER] Панель настроек интервью скрыта');
        }
    } else {
        console.warn('⚠️ [SWITCHER] Панель настроек интервью не найдена');
    }
    
    currentMeetingType = newType;
    const conf = MEETING_CONFIG[newType];
    
    if (window.vacancyData) {
        console.log(`🔄 [SWITCHER] Обновляем длительность: ${window.vacancyData.duration} -> ${conf.defaultDuration}`);
        window.vacancyData.duration = conf.defaultDuration;
        console.log(`✅ [SWITCHER] Новая длительность установлена: ${window.vacancyData.duration}`);
    } else {
        console.warn('⚠️ [SWITCHER] window.vacancyData не найден! Создаем...');
        window.vacancyData = {
            duration: conf.defaultDuration
        };
        console.log(`✅ [SWITCHER] Создан window.vacancyData с длительностью: ${conf.defaultDuration}`);
    }
    
    // Принудительно обновляем глобальную переменную
    window.currentMeetingDuration = conf.defaultDuration;
    console.log(`✅ [SWITCHER] Установлена глобальная переменная: window.currentMeetingDuration = ${conf.defaultDuration}`);
    
    // Обновляем отображение слотов с использованием предрассчитанных данных
    if (typeof window.switchSlotsByMeetingType === 'function') {
        console.log('🔄 [SWITCHER] Обновление отображения слотов для типа:', newType);
        window.switchSlotsByMeetingType(newType);
        console.log('✅ [SWITCHER] Слоты обновлены');
    } else {
        console.error('❌ [SWITCHER] switchSlotsByMeetingType функция не найдена!');
    }
    
    // Проверяем, загружена ли третья неделя, и если да - перезагружаем слоты
    const thirdWeekSection = document.getElementById('thirdWeekSection');
    if (thirdWeekSection && thirdWeekSection.style.display !== 'none') {
        console.log('🔄 [SWITCHER] Перезагрузка слотов третьей недели для типа:', newType);
        reloadThirdWeekSlots();
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

// Функция для загрузки событий календаря с учетом типа встречи
function loadCalendarEventsForMeetingType(meetingType, callback) {
    console.log(`🔍 [SWITCHER] Загрузка событий для типа: ${meetingType}`);
    
    // Получаем URL с параметрами
    const urlParams = new URLSearchParams(window.location.search);
    const vacancyId = urlParams.get('vacancy_id');
    const sessionId = urlParams.get('session_id') || window.sessionId;
    
    if (!vacancyId) {
        console.warn('⚠️ [SWITCHER] vacancy_id не найден в URL, события не загружены');
        if (callback) callback();
        return;
    }
    
    // Формируем URL для API
    const apiUrl = `/google-oauth/api/calendar-events/?vacancy_id=${vacancyId}&meeting_type=${meetingType}`;
    console.log(`🔍 [SWITCHER] Запрос к API: ${apiUrl}`);
    
    // Запрашиваем данные с сервера
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log(`🔍 [SWITCHER] Ответ от API, status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log(`🔍 [SWITCHER] Данные от API:`, data);
        if (data.success && data.events) {
            console.log(`✅ [SWITCHER] Получено ${data.events.length} событий от API`);
            // Обновляем глобальную переменную calendarEvents
            window.calendarEvents = data.events;
            console.log(`🔍 [SWITCHER] Обновлена переменная calendarEvents, количество: ${window.calendarEvents.length}`);
            if (callback) callback();
        } else {
            console.error('❌ [SWITCHER] Ошибка загрузки событий:', data.message || data);
            if (callback) callback();
        }
    })
    .catch(error => {
        console.error('❌ [SWITCHER] Ошибка при запросе к API:', error);
        if (callback) callback();
    });
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
    window.loadCalendarEventsForMeetingType = loadCalendarEventsForMeetingType;
    
    console.log('✅ [SWITCHER] Инициализация завершена');
});
