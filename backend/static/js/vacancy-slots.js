// =============================================================================
// VACANCY AND SLOTS FUNCTIONALITY (адаптировано из gdata_automation.html)
// =============================================================================

// Данные событий из Django контекста
console.log('🔍 DEBUG: Начинаем загрузку событий...');

// Переменные будут объявлены в шаблоне
let vacancyData = {};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: Количество событий в контексте:', calendarEvents ? calendarEvents.length : 0);
    
    // Загружаем данные вакансии из JSON script
    const vacancyDataElement = document.getElementById('vacancy-data');
    if (vacancyDataElement) {
        try {
            vacancyData = JSON.parse(vacancyDataElement.textContent);
            console.log('🔍 DEBUG: Данные вакансии загружены:', vacancyData);
        } catch (e) {
            console.error('❌ Ошибка парсинга данных вакансии:', e);
        }
    }
    
    console.log('🔍 DEBUG: Загружены реальные события, количество:', calendarEvents.length);
    console.log('🔍 DEBUG: Настройки слотов:', slotsSettings);
    console.log('🔍 DEBUG: Данные вакансии:', vacancyData);
    
    // Проверяем наличие предрассчитанных слотов
    console.log('🔍 DEBUG: Слоты для скринингов:', window.screeningSlots);
    console.log('🔍 DEBUG: Слоты для интервью:', window.interviewSlots);
    
    // Настраиваем обработчики для кнопок сворачивания
    setupCollapseButtons();
    
    // Если есть предрассчитанные слоты, используем их, иначе генерируем на клиенте
    if (window.screeningSlots && window.screeningSlots.length > 0) {
        console.log('✅ [SLOTS] Используем предрассчитанные слоты с backend');
        window.switchSlotsByMeetingType('screening');
    } else {
        console.log('⚠️ [SLOTS] Предрассчитанные слоты не найдены, генерируем на клиенте');
        initializeSlots();
    }
});

// Настройка обработчиков для кнопок сворачивания
function setupCollapseButtons() {
    console.log('🔧 Настройка кнопок сворачивания...');
    
    // Обработчики для всех кнопок сворачивания
    const collapseButtons = document.querySelectorAll('.btn-collapse');
    collapseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Обновляем aria-expanded при изменении состояния
                const isExpanded = targetElement.classList.contains('show');
                this.setAttribute('aria-expanded', !isExpanded);
                
                console.log(`🔄 ${targetId} ${isExpanded ? 'сворачивается' : 'разворачивается'}`);
            }
        });
    });
    
    console.log('✅ Кнопки сворачивания настроены');
}

// Функция копирования ссылок на вакансии в буфер обмена
window.copyVacancyLink = function(country) {
    let vacancyLink = '';
    let buttonClass = '';
    let countryName = '';
    
    if (country === 'belarus') {
        vacancyLink = vacancyData.vacancy_link_belarus || window.vacancyLinkBelarus || '';
        buttonClass = 'btn-copy-vacancy-link-belarus';
        countryName = 'Беларуси';
    } else if (country === 'poland') {
        vacancyLink = vacancyData.vacancy_link_poland || window.vacancyLinkPoland || '';
        buttonClass = 'btn-copy-vacancy-link-poland';
        countryName = 'Польши';
    }
    
    if (!vacancyLink || vacancyLink.trim() === '') {
        showNotification('Ссылка на вакансию для ' + countryName + ' не настроена', 'warning');
        return;
    }
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(vacancyLink).then(function() {
        // Показываем успешное уведомление
        showNotification('Ссылка на вакансию для ' + countryName + ' скопирована в буфер обмена!', 'success');
        
        // Визуальная обратная связь
        const button = document.querySelector('.' + buttonClass);
        if (button) {
            const originalClass = button.className;
            button.className = originalClass + ' copy-success';
            
            setTimeout(function() {
                button.className = originalClass;
            }, 2000);
        }
        
    }).catch(function(err) {
        console.error('Ошибка копирования: ', err);
        showNotification('Ошибка копирования в буфер обмена', 'error');
    });
};

// Функция копирования вопросов в буфер обмена
window.copyQuestions = function(country) {
    let questions = '';
    let buttonClass = '';
    let countryName = '';
    
    if (country === 'belarus') {
        questions = vacancyData.questions_belarus || window.questionsBelarus || '';
        buttonClass = 'btn-copy-belarus';
        countryName = 'Беларуси';
    } else if (country === 'poland') {
        questions = vacancyData.questions_poland || window.questionsPoland || '';
        buttonClass = 'btn-copy-poland';
        countryName = 'Польши';
    }
    
    if (!questions || questions.trim() === '') {
        showNotification('Вопросы для ' + countryName + ' не настроены', 'warning');
        return;
    }
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(questions).then(function() {
        // Показываем успешное уведомление
        showNotification('Вопросы для ' + countryName + ' скопированы в буфер обмена!', 'success');
        
        // Визуальная обратная связь
        const button = document.querySelector('.' + buttonClass);
        if (button) {
            const originalClass = button.className;
            button.className = originalClass + ' copy-success';
            
            setTimeout(function() {
                button.className = originalClass;
            }, 2000);
        }
        
    }).catch(function(err) {
        console.error('Ошибка копирования: ', err);
        showNotification('Ошибка копирования в буфер обмена', 'error');
    });
};

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления с правильными стилями
    const notification = document.createElement('div');
    notification.className = `toast-notification alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'bottom: 20px; left: 20px; z-index: 9999; max-width: 280px; width: 280px;';
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Получаем все существующие тосты
    const existingToasts = document.querySelectorAll('.toast-notification');
    let currentBottom = 20;
    
    // Сдвигаем существующие тосты вверх
    existingToasts.forEach((toast) => {
        const toastHeight = toast.offsetHeight;
        const margin = 10;
        currentBottom += toastHeight + margin;
        toast.style.bottom = `${currentBottom}px`;
    });
    
    // Устанавливаем позицию для нового тоста
    notification.style.bottom = `${currentBottom}px`;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Обработчик для кнопки закрытия
    const closeBtn = notification.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            // Пересчитываем позиции оставшихся тостов
            const remainingToasts = document.querySelectorAll('.toast-notification');
            let newBottom = 20;
            remainingToasts.forEach((toast) => {
                if (toast !== notification) {
                    const toastHeight = toast.offsetHeight;
                    const margin = 10;
                    newBottom += toastHeight + margin;
                    toast.style.bottom = `${newBottom}px`;
                }
            });
        });
    }
    
    // Автоматически удаляем через 5 секунд
    setTimeout(function() {
        if (notification.parentNode) {
            // Пересчитываем позиции оставшихся тостов
            const remainingToasts = document.querySelectorAll('.toast-notification');
            let newBottom = 20;
            remainingToasts.forEach((toast) => {
                if (toast !== notification) {
                    const toastHeight = toast.offsetHeight;
                    const margin = 10;
                    newBottom += toastHeight + margin;
                    toast.style.bottom = `${newBottom}px`;
                }
            });
            
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Функции для генерации слотов (адаптированы из calendar_events.html)
function calculateAvailableSlots(dayEvents, date) {
    // Определяем рабочие часы из настроек пользователя или используем значения по умолчанию
    const workStartHour = window.userWorkHours ? window.userWorkHours.startHour : 11;
    const workEndHour = window.userWorkHours ? window.userWorkHours.endHour : 18;
    
    // Получаем время между встречами из настроек пользователя (в минутах)
    const meetingIntervalMinutes = window.userMeetingInterval || 15; // По умолчанию 15 минут
    
    console.log(`🕐 Рабочие часы: ${workStartHour}:00 - ${workEndHour}:00`);
    console.log(`⏱️ Время между встречами: ${meetingIntervalMinutes} минут`);
    
    // Создаем массив занятых интервалов с учетом времени между встречами
    const occupiedIntervals = [];
    
    dayEvents.forEach(event => {
        // Пропускаем события на весь день
        if (event.is_all_day || event.isallday) {
            return;
        }
        
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // Расширяем интервал события на время между встречами
        const extendedStart = new Date(eventStart.getTime() - meetingIntervalMinutes * 60 * 1000);
        const extendedEnd = new Date(eventEnd.getTime() + meetingIntervalMinutes * 60 * 1000);
        
        // Проверяем, пересекается ли расширенный интервал с рабочими часами
        const workStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workStartHour, 0, 0);
        const workEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workEndHour, 0, 0);
        
        if (extendedStart < workEnd && extendedEnd > workStart) {
            // Ограничиваем интервал рабочими часами
            const intervalStart = new Date(Math.max(extendedStart.getTime(), workStart.getTime()));
            const intervalEnd = new Date(Math.min(extendedEnd.getTime(), workEnd.getTime()));
            
            occupiedIntervals.push({
                start: intervalStart,
                end: intervalEnd
            });
            
            console.log(`🚫 Занятый интервал: ${formatTime(intervalStart)} - ${formatTime(intervalEnd)} (событие: ${formatTime(eventStart)} - ${formatTime(eventEnd)})`);
        }
    });
    
    // Сортируем занятые интервалы по времени начала
    occupiedIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Объединяем пересекающиеся интервалы
    const mergedIntervals = [];
    occupiedIntervals.forEach(interval => {
        if (mergedIntervals.length === 0) {
            mergedIntervals.push(interval);
        } else {
            const lastInterval = mergedIntervals[mergedIntervals.length - 1];
            if (interval.start <= lastInterval.end) {
                // Интервалы пересекаются, объединяем их
                lastInterval.end = new Date(Math.max(lastInterval.end.getTime(), interval.end.getTime()));
            } else {
                // Интервалы не пересекаются, добавляем новый
                mergedIntervals.push(interval);
            }
        }
    });
    
    // Формируем свободные интервалы
    const freeIntervals = [];
    let currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workStartHour, 0, 0);
    
    mergedIntervals.forEach(interval => {
        if (currentTime < interval.start) {
            // Есть свободный интервал перед занятым
            freeIntervals.push({
                start: new Date(currentTime),
                end: new Date(interval.start)
            });
        }
        currentTime = new Date(Math.max(currentTime.getTime(), interval.end.getTime()));
    });
    
    // Проверяем, есть ли свободное время после последнего занятого интервала
    const workEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workEndHour, 0, 0);
    if (currentTime < workEnd) {
        freeIntervals.push({
            start: new Date(currentTime),
            end: new Date(workEnd)
        });
    }
    
    // Получаем требуемую продолжительность встречи
    const requiredDuration = getMeetingDuration();
    console.log(`⏱️ Требуемая продолжительность встречи: ${requiredDuration} минут`);
    console.log(`🔍 [SLOTS] Проверяем window.vacancyData:`, window.vacancyData);
    console.log(`🔍 [SLOTS] Текущий тип встречи:`, window.getCurrentMeetingType ? window.getCurrentMeetingType() : 'не определен');
    
    // Формируем строку доступных слотов
    const availableRanges = [];
    freeIntervals.forEach(interval => {
        const duration = interval.end.getTime() - interval.start.getTime();
        const durationMinutes = Math.floor(duration / (60 * 1000));
        
        // Показываем интервал только если он длится больше 15 минут И больше или равен требуемой продолжительности
        if (durationMinutes >= 15 && durationMinutes >= requiredDuration) {
            const startTime = formatTime(interval.start);
            const endTime = formatTime(interval.end);
            
            if (startTime === endTime) {
                availableRanges.push(startTime);
            } else {
                availableRanges.push(`${startTime}-${endTime}`);
            }
            
            console.log(`✅ Свободный интервал: ${startTime} - ${endTime} (${durationMinutes} мин) - подходит для встречи ${requiredDuration} мин`);
        } else if (durationMinutes >= 15) {
            const startTime = formatTime(interval.start);
            const endTime = formatTime(interval.end);
            console.log(`❌ Свободный интервал: ${startTime} - ${endTime} (${durationMinutes} мин) - слишком короткий для встречи ${requiredDuration} мин`);
        }
    });
    
    return availableRanges.length > 0 ? availableRanges.join(', ') : 'Нет свободных слотов';
}

// Вспомогательная функция для форматирования времени
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}.${minutes.toString().padStart(2, '0')}`;
}

// Функция для получения продолжительности встречи
function getMeetingDuration() {
    console.log('🔍 [DURATION] Получаем длительность встречи...');
    
    // Сначала проверяем новую глобальную переменную
    if (typeof window !== 'undefined' && window.currentMeetingDuration) {
        console.log(`✅ [DURATION] Используем window.currentMeetingDuration: ${window.currentMeetingDuration}`);
        return window.currentMeetingDuration;
    }
    
    // Затем проверяем глобальную переменную window.vacancyData
    if (typeof window !== 'undefined' && window.vacancyData && window.vacancyData.duration) {
        console.log(`✅ [DURATION] Используем window.vacancyData.duration: ${window.vacancyData.duration}`);
        return window.vacancyData.duration;
    }
    
    // Затем проверяем локальную переменную vacancyData
    if (typeof vacancyData !== 'undefined' && vacancyData) {
        console.log('🔍 [DURATION] vacancyData найден:', vacancyData);
        
        // Пытаемся получить продолжительность из данных вакансии
        // Это может быть поле duration, meeting_duration или аналогичное
        if (vacancyData.duration) {
            console.log(`✅ [DURATION] Используем vacancyData.duration: ${vacancyData.duration}`);
            return vacancyData.duration;
        }
        if (vacancyData.meeting_duration) {
            console.log(`✅ [DURATION] Используем vacancyData.meeting_duration: ${vacancyData.meeting_duration}`);
            return vacancyData.meeting_duration;
        }
    }
    
    // Если нет данных о продолжительности, используем значение по умолчанию
    console.log('⚠️ [DURATION] Данные не найдены, используем значение по умолчанию: 60 мин');
    return 60; // 60 минут по умолчанию
}

function generateWeekSlots(weekOffset) {
    const today = new Date();
    const startOfWeek = new Date(today);
    
    // Находим начало недели (понедельник)
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + daysToMonday + (weekOffset * 7));
    
    console.log(`📅 Генерация слотов для недели ${weekOffset}, начало недели:`, startOfWeek.toDateString());
    
    const slots = [];
    const weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    
    // Генерируем слоты для рабочих дней (понедельник-пятница)
    for (let i = 0; i < 5; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        
        // Пропускаем прошедшие дни для текущей недели (включая сегодня)
        if (weekOffset === 0) {
            const now = new Date();
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);
            const nowStart = new Date(now);
            nowStart.setHours(0, 0, 0, 0);
            
            // Пропускаем сегодняшний день и все прошедшие дни
            if (dateStart <= nowStart) {
                console.log(`🚫 Пропускаем день ${dateStr} (сегодня или прошедший)`);
                continue;
            }
        }
        
        let meetingsCount = 0;
        let availableSlots = '';
        
        if (typeof calendarEvents !== 'undefined' && Array.isArray(calendarEvents)) {
            console.log(`🔍 Поиск событий для даты ${dateStr} (${date.toDateString()})`);
            
            const dayEvents = calendarEvents.filter(event => {
                const eventDate = new Date(event.start);
                const isMatch = eventDate.toDateString() === date.toDateString();
                if (isMatch) {
                    console.log(`  ✅ Найдено событие: "${event.title}" на ${eventDate.toDateString()}`);
                }
                return isMatch;
            });
            
            // ПРАВИЛЬНАЯ ФИЛЬТРАЦИЯ встреч
            const meetingsWithoutLunch = dayEvents.filter(event => {
                const title = (event.title || '').toLowerCase();
                
                // Исключаем обеды
                if (title.includes('обед') || title.includes('lunch')) {
                    console.log(`  🍽️ Исключаем обед: "${event.title}"`);
                    return false;
                }
                
                // Исключаем события "весь день"
                if (event.is_all_day === true || event.isallday === true) {
                    console.log(`  📅 Исключаем событие "весь день": "${event.title}"`);
                    return false;
                }
                
                // Исключаем нерабочие события
                if (title.includes('отпуск') || title.includes('vacation') || 
                    title.includes('выходной') || title.includes('day off')) {
                    console.log(`  🏖️ Исключаем нерабочее событие: "${event.title}"`);
                    return false;
                }
                
                return true;
            });
            
            meetingsCount = meetingsWithoutLunch.length; // ПРАВИЛЬНЫЙ ПОДСЧЕТ
            
            // Вычисляем доступные слоты времени (11-18, исключая обед и события на весь день)
            // Используем все dayEvents для расчета занятых интервалов
            availableSlots = calculateAvailableSlots(dayEvents, date);
            
            console.log(`📅 Дата ${dateStr}: ${meetingsWithoutLunch.length} встреч (исключая обед из ${dayEvents.length} общих), слоты: ${availableSlots}`);
        } else {
            console.log(`⚠️ calendarEvents не доступен для даты ${dateStr}`);
            // Если нет данных о событиях, показываем все слоты как доступные
            const defaultStart = window.userWorkHours ? window.userWorkHours.startHour : 11;
            const defaultEnd = window.userWorkHours ? window.userWorkHours.endHour : 18;
            availableSlots = `${defaultStart}-${defaultEnd}`;
        }
        
        slots.push({
            date: date,
            dateStr: dateStr,
            weekday: weekdays[i],
            meetingsCount: meetingsCount,
            availableSlots: availableSlots
        });
    }
    
    console.log(`📅 Итого слотов для недели ${weekOffset}: ${slots.length}`);
    return slots;
}

/**
 * Инициализация системы слотов с полной валидацией
 */
function initializeSlots() {
    console.log('📊 [SLOTS] ===== ИНИЦИАЛИЗАЦИЯ =====');
    
    // 1. ПРОВЕРКА calendarEvents
    if (!window.calendarEvents) {
        console.warn('⚠️ [SLOTS] calendarEvents undefined, создаём []');
        window.calendarEvents = [];
    }
    if (!Array.isArray(window.calendarEvents)) {
        console.error('❌ [SLOTS] calendarEvents не массив!', typeof window.calendarEvents);
        window.calendarEvents = [];
    }
    console.log(`✅ [SLOTS] calendarEvents: ${window.calendarEvents.length} событий`);
    
    // 2. ПРОВЕРКА DOM элементов
    const currentSection = document.querySelector('.week-section.current-week .collapse .row');
    const nextSection = document.querySelector('.week-section.next-week .collapse .row');
    
    if (!currentSection || !nextSection) {
        console.error('❌ [SLOTS] Секции слотов не найдены в DOM!');
        console.error('   .current-week:', !!currentSection);
        console.error('   .next-week:', !!nextSection);
        return;
    }
    
    // 3. ГЕНЕРАЦИЯ СЛОТОВ
    console.log('⚙️ [SLOTS] Генерация слотов текущей недели...');
    const currentSlots = generateWeekSlots(0);
    console.log(`✅ [SLOTS] Текущая неделя: ${currentSlots.length} дней`);
    
    console.log('⚙️ [SLOTS] Генерация слотов следующей недели...');
    const nextSlots = generateWeekSlots(1);
    console.log(`✅ [SLOTS] Следующая неделя: ${nextSlots.length} дней`);
    
    // 4. ОТОБРАЖЕНИЕ
    updateSlotsDisplay(currentSlots, nextSlots);
    updateLastUpdateTime();
    
    console.log('✅ [SLOTS] ===== ГОТОВО =====');
}

// Функция обновления времени последнего обновления
function updateLastUpdateTime() {
    const timestampElement = document.getElementById('update-timestamp');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        timestampElement.textContent = timeString;
        console.log(`🕐 Время обновления: ${timeString}`);
    }
}

function updateSlotsDisplay(currentWeekSlots, nextWeekSlots) {
    console.log('🔄 Обновление отображения слотов...');
    
    // Обновляем текущую неделю
    const currentWeekSection = document.querySelector('.week-section.current-week');
    if (currentWeekSection && currentWeekSlots.length > 0) {
        const slotsRow = currentWeekSection.querySelector('.row');
        if (slotsRow) {
            slotsRow.innerHTML = '';
            currentWeekSlots.forEach(slot => {
                const slotHtml = createSlotCard(slot);
                slotsRow.insertAdjacentHTML('beforeend', slotHtml);
            });
        }
    }
    
    // Обновляем следующую неделю
    const nextWeekSection = document.querySelector('.week-section.next-week');
    if (nextWeekSection && nextWeekSlots.length > 0) {
        const slotsRow = nextWeekSection.querySelector('.row');
        if (slotsRow) {
            slotsRow.innerHTML = '';
            nextWeekSlots.forEach(slot => {
                const slotHtml = createSlotCard(slot);
                slotsRow.insertAdjacentHTML('beforeend', slotHtml);
            });
        }
    }
    
    // Проверяем наличие слотов и деактивируем кнопки при необходимости
    updateSlotButtons(currentWeekSlots, nextWeekSlots);
}

// Новая функция для переключения между предрассчитанными слотами
function switchSlotsByMeetingType(meetingType) {
    console.log(`🔄 [SLOTS] Переключение на слоты для типа: ${meetingType}`);
    
    // Определяем какие слоты использовать
    let slots = [];
    if (meetingType === 'screening' && window.screeningSlots) {
        slots = window.screeningSlots;
        console.log(`✅ [SLOTS] Используем слоты для скринингов: ${slots.length} дней`);
    } else if (meetingType === 'interview' && window.interviewSlots) {
        slots = window.interviewSlots;
        console.log(`✅ [SLOTS] Используем слоты для интервью: ${slots.length} дней`);
    } else {
        console.warn(`⚠️ [SLOTS] Слоты для типа ${meetingType} не найдены, используем пустой массив`);
        slots = [];
    }
    
    // Обновляем отображение
    // Разделяем слоты на текущую и следующую неделю
    // Используем дату, чтобы определить, где заканчивается текущая неделя
    if (slots.length > 0) {
        const today = new Date();
        const currentWeekSlots = [];
        const nextWeekSlots = [];
        
        // Определяем начало следующей недели (следующий понедельник)
        const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (7 - dayOfWeek + 1); // Количество дней до следующего понедельника
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        
        // Разделяем слоты по неделям
        slots.forEach(slot => {
            const slotDate = new Date(slot.date);
            if (slotDate < nextMonday) {
                currentWeekSlots.push(slot);
            } else {
                nextWeekSlots.push(slot);
            }
        });
        
        console.log(`📅 Разделение слотов: текущая неделя = ${currentWeekSlots.length} дней, следующая = ${nextWeekSlots.length} дней`);
        updateSlotsDisplay(currentWeekSlots, nextWeekSlots);
    } else {
        // Если слотов нет, очищаем отображение
        updateSlotsDisplay([], []);
    }
}

// Экспортируем функцию в глобальную область
window.switchSlotsByMeetingType = switchSlotsByMeetingType;

// Функция обновления состояния кнопок слотов
function updateSlotButtons(currentWeekSlots, nextWeekSlots) {
    console.log('🔘 Обновление состояния кнопок слотов...');
    
    // Проверяем, есть ли доступные слоты в текущей неделе
    const currentWeekHasSlots = currentWeekSlots && currentWeekSlots.length > 0 && 
        currentWeekSlots.some(slot => slot.availableSlots !== 'Нет свободных слотов');
    
    // Проверяем, есть ли доступные слоты в следующей неделе
    const nextWeekHasSlots = nextWeekSlots && nextWeekSlots.length > 0 && 
        nextWeekSlots.some(slot => slot.availableSlots !== 'Нет свободных слотов');
    
    console.log(`📅 Текущая неделя имеет слоты: ${currentWeekHasSlots}`);
    console.log(`📅 Следующая неделя имеет слоты: ${nextWeekHasSlots}`);
    
    // Кнопка копирования слотов текущей недели
    const currentWeekBtn = document.querySelector('.btn-copy-current-week');
    if (currentWeekBtn) {
        if (currentWeekHasSlots) {
            currentWeekBtn.disabled = false;
            currentWeekBtn.classList.remove('disabled');
            currentWeekBtn.title = 'Скопировать слоты текущей недели';
        } else {
            currentWeekBtn.disabled = true;
            currentWeekBtn.classList.add('disabled');
            currentWeekBtn.title = 'Нет доступных слотов на текущей неделе';
        }
    }
    
    // Кнопка копирования слотов следующей недели
    const nextWeekBtn = document.querySelector('.btn-copy-next-week');
    if (nextWeekBtn) {
        if (nextWeekHasSlots) {
            nextWeekBtn.disabled = false;
            nextWeekBtn.classList.remove('disabled');
            nextWeekBtn.title = 'Скопировать слоты следующей недели';
        } else {
            nextWeekBtn.disabled = true;
            nextWeekBtn.classList.add('disabled');
            nextWeekBtn.title = 'Нет доступных слотов на следующей неделе';
        }
    }
    
    // Кнопка копирования всех слотов (деактивируется, если хотя бы одна неделя не имеет слотов)
    const allSlotsBtn = document.querySelector('.btn-copy-all-slots');
    if (allSlotsBtn) {
        if (currentWeekHasSlots && nextWeekHasSlots) {
            allSlotsBtn.disabled = false;
            allSlotsBtn.classList.remove('disabled');
            allSlotsBtn.title = 'Скопировать все слоты';
        } else {
            allSlotsBtn.disabled = true;
            allSlotsBtn.classList.add('disabled');
            allSlotsBtn.title = 'Не все недели имеют доступные слоты';
        }
    }
    
    console.log('✅ Состояние кнопок слотов обновлено');
}

function createSlotCard(slot) {
    const slotsCount = slot.availableSlots === 'Нет свободных слотов' ? 0 : slot.availableSlots.split(',').length;
    const badgeClass = slotsCount > 0 ? 'bg-primary' : 'bg-secondary';
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="slot-card card h-100">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="fw-bold">${slot.dateStr}</span>
                        <span class="badge ${badgeClass} rounded-pill">${slotsCount}</span>
                    </div>
                    <div class="text-muted small mb-2">${slot.weekday}</div>
                    <div class="text-primary small">${slot.availableSlots}</div>
                </div>
            </div>
        </div>
    `;
}

// Функции копирования слотов (адаптированы из calendar_events.html)
window.copyAllSlots = function() {
    console.log('📋 Копирование всех слотов...');
    
    const currentWeekSlots = [];
    const nextWeekSlots = [];
    const thirdWeekSlots = [];
    
    // Копируем слоты из текущей недели
    const currentWeekSection = document.querySelector('.week-section.current-week');
    if (currentWeekSection) {
        currentWeekSection.querySelectorAll('.slot-card').forEach(card => {
            const slotData = extractSlotData(card);
            if (slotData) {
                currentWeekSlots.push(slotData);
            }
        });
    }
    
    // Копируем слоты из следующей недели
    const nextWeekSection = document.querySelector('.week-section.next-week');
    if (nextWeekSection) {
        nextWeekSection.querySelectorAll('.slot-card').forEach(card => {
            const slotData = extractSlotData(card);
            if (slotData) {
                nextWeekSlots.push(slotData);
            }
        });
    }
    
    // Копируем слоты из третьей недели, если она загружена
    const thirdWeekSection = document.querySelector('.week-section.third-week');
    if (thirdWeekSection && thirdWeekSection.style.display !== 'none') {
        thirdWeekSection.querySelectorAll('.slot-card').forEach(card => {
            const slotData = extractSlotData(card);
            if (slotData) {
                thirdWeekSlots.push(slotData);
            }
        });
    }
    
    if (currentWeekSlots.length === 0 && nextWeekSlots.length === 0 && thirdWeekSlots.length === 0) {
        showNotification('Нет слотов для копирования', 'warning');
        return;
    }
    
    // Формируем текст для копирования с использованием настроек
    let text = '';
    
    // Добавляем общий префикс, если настроен
    if (slotsSettings.allSlotsPrefix) {
        text += `${slotsSettings.allSlotsPrefix}\n`;
    }
    
    if (currentWeekSlots.length > 0) {
        // Добавляем только слоты текущей недели с доступными временами
        currentWeekSlots.forEach(slot => {
            // Пропускаем дни без свободных слотов
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} ${slot.slots}\n`;
            }
        });
    }
    
    if (nextWeekSlots.length > 0) {
        // Добавляем разделяющий текст между неделями, если настроен
        if (slotsSettings.separatorText) {
            text += `\n${slotsSettings.separatorText}\n`;
        } else {
            text += '\n';
        }
        
        // Добавляем только слоты следующей недели с доступными временами
        nextWeekSlots.forEach(slot => {
            // Пропускаем дни без свободных слотов
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} (${slot.date}) ${slot.slots}\n`;
            }
        });
    }
    
    // Добавляем слоты третьей недели, если они есть
    if (thirdWeekSlots.length > 0) {
        // Добавляем разделяющий текст между неделями, если настроен
        if (slotsSettings.separatorText) {
            text += `\n${slotsSettings.separatorText}\n`;
        } else {
            text += '\n';
        }
        
        // Добавляем только слоты третьей недели с доступными временами
        thirdWeekSlots.forEach(slot => {
            // Пропускаем дни без свободных слотов
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} (${slot.date}) ${slot.slots}\n`;
            }
        });
    }
    
    // Добавляем информацию о продолжительности встречи
    const meetingDuration = getMeetingDuration();
    if (meetingDuration) {
        text += `\n\nПо времени нужно будет примерно ${meetingDuration} минут.\nКогда комфортнее?`;
    }
    
    copySlotsToClipboard(text.trim());
};

window.copyWeekSlots = function(weekType) {
    console.log(`📋 Копирование слотов ${weekType} недели...`);
    
    // Находим секцию недели по типу
    let weekSection;
    if (weekType === 'current') {
        weekSection = document.querySelector('.week-section.current-week');
    } else if (weekType === 'next') {
        weekSection = document.querySelector('.week-section.next-week');
    } else if (weekType === 'third') {
        weekSection = document.querySelector('.week-section.third-week');
    }
    
    console.log('🔍 Найденная секция недели:', weekSection);
    
    if (!weekSection) {
        console.error('❌ Секция недели не найдена');
        showNotification('Секция недели не найдена', 'error');
        return;
    }
    
    const slotCards = weekSection.querySelectorAll('.slot-card');
    console.log('🔍 Найдено карточек слотов:', slotCards.length);
    
    const slots = [];
    slotCards.forEach((card, index) => {
        console.log(`🔍 Обрабатываем карточку ${index + 1}:`, card);
        const slotData = extractSlotData(card);
        console.log(`🔍 Данные слота ${index + 1}:`, slotData);
        if (slotData) {
            slots.push(slotData);
        }
    });
    
    console.log('🔍 Итого слотов для копирования:', slots.length);
    
    if (slots.length === 0) {
        console.warn('⚠️ Нет слотов для копирования в этой неделе');
        showNotification('Нет слотов для копирования в этой неделе', 'warning');
        return;
    }
    
    // Формируем текст для копирования с использованием настроек
    let text = '';
    if (weekType === 'current') {
        // Добавляем префикс текущей недели, если настроен
        if (slotsSettings.currentWeekPrefix) {
            text += `${slotsSettings.currentWeekPrefix}\n`;
        }
        // Формат для текущей недели: ПН 12-15, 17
        // Пропускаем дни без свободных слотов
        slots.forEach(slot => {
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} ${slot.slots}\n`;
            }
        });
    } else if (weekType === 'next') {
        // Добавляем префикс следующей недели, если настроен
        if (slotsSettings.nextWeekPrefix) {
            text += `${slotsSettings.nextWeekPrefix}\n`;
        }
        // Формат для следующей недели: ПН (15.09) 11-14, 15
        // Пропускаем дни без свободных слотов
        slots.forEach(slot => {
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} (${slot.date}) ${slot.slots}\n`;
            }
        });
    } else if (weekType === 'third') {
        // Для третьей недели используем тот же формат, что и для следующей
        slots.forEach(slot => {
            if (slot.slots && slot.slots !== 'Нет свободных слотов') {
                text += `${slot.weekday} (${slot.date}) ${slot.slots}\n`;
            }
        });
    }
    
    // Добавляем информацию о продолжительности встречи
    const meetingDuration = getMeetingDuration();
    if (meetingDuration) {
        text += `\n\nПо времени нужно будет примерно ${meetingDuration} минут.\nКогда комфортнее?`;
    }
    
    copySlotsToClipboard(text.trim());
};

function extractSlotData(card) {
    try {
        console.log('🔍 Извлекаем данные из карточки:', card);
        
        const dateElement = card.querySelector('.fw-bold');
        const weekdayElement = card.querySelector('.text-muted');
        const slotsElement = card.querySelector('.text-primary');
        
        console.log('🔍 Найденные элементы:');
        console.log('  - dateElement:', dateElement);
        console.log('  - weekdayElement:', weekdayElement);
        console.log('  - slotsElement:', slotsElement);
        
        if (!dateElement || !weekdayElement || !slotsElement) {
            console.warn('⚠️ Не все элементы найдены в карточке слота');
            console.warn('  - dateElement:', !!dateElement);
            console.warn('  - weekdayElement:', !!weekdayElement);
            console.warn('  - slotsElement:', !!slotsElement);
            return null;
        }
        
        const slotData = {
            date: dateElement.textContent.trim(),
            weekday: weekdayElement.textContent.trim(),
            slots: slotsElement.textContent.trim()
        };
        
        console.log('🔍 Извлеченные данные слота:', slotData);
        return slotData;
    } catch (e) {
        console.error('Ошибка извлечения данных слота:', e);
        return null;
    }
}

function copySlotsToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Используем современный API
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Слоты скопированы в буфер обмена!', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            fallbackCopySlotsToClipboard(text);
        });
    } else {
        // Fallback для старых браузеров
        fallbackCopySlotsToClipboard(text);
    }
}

function fallbackCopySlotsToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Слоты скопированы в буфер обмена!', 'success');
    } catch (err) {
        console.error('Ошибка fallback копирования:', err);
        showNotification('Ошибка копирования. Попробуйте выделить текст вручную.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Функция для обновления слотов
window.refreshSlots = function() {
    console.log('🔄 Обновление слотов...');
    // Перезагружаем слоты
    initializeSlots();
    showNotification('Слоты обновлены', 'success');
};

// Функция для добавления третьей недели
window.addThirdWeek = function() {
    console.log('➕ Добавление третьей недели...');
    
    // Находим ВСЕ кнопки +
    const btnAdds = document.querySelectorAll('.btn-add-week');
    console.log('🔍 Найдено кнопок +:', btnAdds.length);
    
    if (btnAdds.length === 0) {
        console.error('❌ Не найдена кнопка добавления недели');
        return;
    }
    
    // Берем первую кнопку
    const btnAdd = btnAdds[0];
    console.log('🔍 btnAdd:', btnAdd);
    
    // Проверяем, не скрыта ли уже кнопка
    if (btnAdd.style.display === 'none') {
        console.log('⚠️ Кнопка + уже скрыта');
        return;
    }
    
    // Находим контейнер, в котором находится кнопка +
    const copyButtonsContainer = btnAdd.parentElement;
    console.log('🔍 copyButtonsContainer:', copyButtonsContainer);
    
    if (!copyButtonsContainer) {
        console.error('❌ Не найден контейнер для кнопки добавления недели');
        return;
    }
    
    // Создаем кнопку копирования третьей недели ДО скрытия кнопки +
    const thirdWeekBtn = document.createElement('button');
    thirdWeekBtn.className = 'btn-copy btn-copy-third-week btn-loading';
    thirdWeekBtn.disabled = true;
    thirdWeekBtn.setAttribute('onclick', 'window.copyWeekSlots(\'third\')');
    thirdWeekBtn.title = 'Копировать слоты третьей недели';
    thirdWeekBtn.innerHTML = `
        <i class="fas fa-calendar-check"></i>
        <div class="copy-tooltip">Копировать слоты третьей недели</div>
    `;
    
    // Вставляем кнопку перед кнопкой +
    console.log('📥 Вставляем кнопку перед btnAdd');
    copyButtonsContainer.insertBefore(thirdWeekBtn, btnAdd);
    
    // Только ПОСЛЕ вставки скрываем все кнопки +
    console.log('🙈 Скрываем все кнопки +');
    btnAdds.forEach(btn => {
        btn.style.setProperty('display', 'none', 'important');
    });
    console.log('✅ Все кнопки + скрыты');
    
    // Показываем секцию третьей недели
    const thirdWeekSection = document.getElementById('thirdWeekSection');
    if (thirdWeekSection) {
        thirdWeekSection.style.display = 'block';
    }
    
    // Получаем параметры для запроса
    const meetingType = document.querySelector('.btn-meeting-type.active')?.id === 'btnInterview' ? 'interview' : 'screening';
    const vacancyId = new URLSearchParams(window.location.search).get('vacancy_id');
    
    console.log(`📡 Запрос слотов третьей недели: meetingType=${meetingType}, vacancyId=${vacancyId}`);
    
    // Делаем AJAX запрос на бэкенд
    fetch(`/google-oauth/api/third-week-slots/?vacancy_id=${vacancyId}&meeting_type=${meetingType}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Получены слоты третьей недели:', data);
            
            if (data.slots && data.slots.length > 0) {
                // Очищаем анимацию загрузки
                setTimeout(() => {
                    thirdWeekBtn.classList.remove('btn-loading');
                    thirdWeekBtn.classList.add('btn-copy-fade-in');
                }, 100);
                
                // Делаем кнопку активной через секунду
                setTimeout(() => {
                    thirdWeekBtn.disabled = false;
                }, 1000);
                
                // Отображаем слоты
                displayThirdWeekSlots(data.slots);
                
                showNotification('Слоты третьей недели загружены', 'success');
            } else {
                showNotification('Нет доступных слотов на третьей неделе', 'info');
                thirdWeekBtn.disabled = true;
                thirdWeekBtn.classList.remove('btn-loading');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка при загрузке слотов третьей недели:', error);
            showNotification('Ошибка при загрузке слотов', 'error');
            
            // Убираем кнопку, если была ошибка
            thirdWeekBtn.remove();
            
            // Показываем все кнопки + снова
            btnAdds.forEach(btn => {
                btn.style.removeProperty('display');
            });
            
            // Скрываем секцию третьей недели
            if (thirdWeekSection) {
                thirdWeekSection.style.display = 'none';
            }
        });
};

// Функция для отображения слотов третьей недели
function displayThirdWeekSlots(slots) {
    console.log('📅 Отображение слотов третьей недели:', slots);
    
    const thirdWeekSection = document.querySelector('.week-section.third-week #thirdWeekSlots .row');
    if (!thirdWeekSection) {
        console.error('❌ Секция третьей недели не найдена');
        return;
    }
    
    // Очищаем существующие слоты
    thirdWeekSection.innerHTML = '';
    
    // Отображаем слоты
    slots.forEach(slot => {
        const slotHtml = createSlotCard(slot);
        thirdWeekSection.insertAdjacentHTML('beforeend', slotHtml);
    });
    
    console.log(`✅ Отображено ${slots.length} слотов третьей недели`);
}

// Функция для перезагрузки слотов третьей недели при смене типа встречи
function reloadThirdWeekSlots() {
    const meetingType = document.querySelector('.btn-meeting-type.active')?.id === 'btnInterview' ? 'interview' : 'screening';
    const vacancyId = new URLSearchParams(window.location.search).get('vacancy_id');
    
    console.log(`📡 Перезагрузка слотов третьей недели: meetingType=${meetingType}, vacancyId=${vacancyId}`);
    
    // Делаем AJAX запрос на бэкенд
    fetch(`/google-oauth/api/third-week-slots/?vacancy_id=${vacancyId}&meeting_type=${meetingType}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Получены слоты третьей недели:', data);
            
            if (data.slots && data.slots.length > 0) {
                // Отображаем слоты
                displayThirdWeekSlots(data.slots);
            }
        })
        .catch(error => {
            console.error('❌ Ошибка при перезагрузке слотов третьей недели:', error);
        });
}