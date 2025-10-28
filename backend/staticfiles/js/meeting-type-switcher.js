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
    
    // Пересчитать слоты
    if (typeof initializeSlots === 'function') {
        console.log('🔄 [SWITCHER] Пересчет слотов...');
        
        // Принудительно обновляем слоты
        setTimeout(() => {
            console.log('🔄 [SWITCHER] Принудительный пересчет слотов через 100ms...');
            
            // Показываем индикатор загрузки
            const switcher = document.querySelector('.meeting-type-switcher');
            if (switcher) {
                const loadingDiv = document.createElement('div');
                loadingDiv.innerHTML = '🔄 Пересчет слотов...';
                loadingDiv.style.cssText = 'position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                switcher.style.position = 'relative';
                switcher.appendChild(loadingDiv);
                
                setTimeout(() => {
                    if (loadingDiv.parentNode) {
                        loadingDiv.parentNode.removeChild(loadingDiv);
                    }
                }, 2000);
            }
            
            initializeSlots();
            
            // Дополнительно обновляем отображение
            if (typeof window.refreshSlots === 'function') {
                console.log('🔄 [SWITCHER] Вызываем refreshSlots...');
                window.refreshSlots();
            }
        }, 100);
        
        console.log('✅ [SWITCHER] Слоты пересчитаны');
    } else {
        console.error('❌ [SWITCHER] initializeSlots функция не найдена!');
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
