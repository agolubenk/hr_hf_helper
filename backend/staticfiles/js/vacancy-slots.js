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
    
    // Настраиваем обработчики для кнопок сворачивания
    setupCollapseButtons();
    
    // Инициализируем слоты
    initializeSlots();
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
        if (event.is_all_day) {
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
    
    // Формируем строку доступных слотов
    const availableRanges = [];
    freeIntervals.forEach(interval => {
        const duration = interval.end.getTime() - interval.start.getTime();
        const durationMinutes = Math.floor(duration / (60 * 1000));
        
        // Показываем интервал только если он длится больше 15 минут
        if (durationMinutes >= 15) {
            const startTime = formatTime(interval.start);
            const endTime = formatTime(interval.end);
            
            if (startTime === endTime) {
                availableRanges.push(startTime);
            } else {
                availableRanges.push(`${startTime}-${endTime}`);
            }
            
            console.log(`✅ Свободный интервал: ${startTime} - ${endTime} (${durationMinutes} мин)`);
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
            
            // Исключаем встречи с названием "Обед" для подсчета встреч
            const meetingsWithoutLunch = dayEvents.filter(event => {
                const title = event.title.toLowerCase();
                const isLunch = title.includes('обед') || title.includes('lunch');
                if (isLunch) {
                    console.log(`  🍽️ Исключаем обед: "${event.title}"`);
                }
                return !isLunch;
            });
            
            meetingsCount = meetingsWithoutLunch.length;
            
            // Вычисляем доступные слоты времени (11-18, исключая обед)
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

function initializeSlots() {
    console.log('🎯 Инициализация слотов...');
    console.log('📊 Доступные данные календаря:', typeof calendarEvents, calendarEvents ? calendarEvents.length : 'не определено');
    
    // Проверяем наличие контейнеров
    const currentWeekSection = document.querySelector('.week-section.current-week');
    const nextWeekSection = document.querySelector('.week-section.next-week');
    console.log('📅 Секция текущей недели:', currentWeekSection);
    console.log('📅 Секция следующей недели:', nextWeekSection);
    
    if (!currentWeekSection || !nextWeekSection) {
        console.error('❌ Секции недель не найдены!');
        return;
    }
    
    // Проверяем наличие calendarEvents
    if (!calendarEvents || !Array.isArray(calendarEvents)) {
        console.error('❌ calendarEvents не определен или не является массивом!');
        return;
    }
    
    console.log('📊 calendarEvents содержит', calendarEvents.length, 'событий');
    
    // Генерируем слоты для текущей и следующей недели
    console.log('🔄 Генерируем слоты для текущей недели...');
    const currentWeekSlots = generateWeekSlots(0);
    console.log('🔄 Генерируем слоты для следующей недели...');
    const nextWeekSlots = generateWeekSlots(1);
    
    console.log('📅 Сгенерированные слоты для текущей недели:', currentWeekSlots);
    console.log('📅 Сгенерированные слоты для следующей недели:', nextWeekSlots);
    
    // Обновляем DOM с данными слотов
    console.log('🔄 Обновляем отображение слотов...');
    updateSlotsDisplay(currentWeekSlots, nextWeekSlots);
    
    console.log('✅ Слоты инициализированы');
    
    // Обновляем время последнего обновления
    updateLastUpdateTime();
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
    
    if (currentWeekSlots.length === 0 && nextWeekSlots.length === 0) {
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
    }
    
    if (!weekSection) {
        showNotification('Секция недели не найдена', 'error');
        return;
    }
    
    const slots = [];
    weekSection.querySelectorAll('.slot-card').forEach(card => {
        const slotData = extractSlotData(card);
        if (slotData) {
            slots.push(slotData);
        }
    });
    
    if (slots.length === 0) {
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
    }
    
    copySlotsToClipboard(text.trim());
};

function extractSlotData(card) {
    try {
        const dateElement = card.querySelector('.fw-bold');
        const weekdayElement = card.querySelector('.text-muted');
        const slotsElement = card.querySelector('.text-primary, .text-info');
        
        if (!dateElement || !weekdayElement || !slotsElement) {
            console.warn('⚠️ Не все элементы найдены в карточке слота');
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