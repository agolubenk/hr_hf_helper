/**
 * JavaScript для авторизации Telegram - ИСПРАВЛЕННАЯ ВЕРСИЯ
 */

let checkInterval;
let isChecking = false;

// Сокращаем интервал проверки с 5 секунд до 2 секунд
const CHECK_INTERVAL = 2000; // 2 секунды

async function generateQR() {
    try {
        console.log('Создание QR...');
        showStatus('Создание QR-кода...', 'info');
        
        const response = await fetch('/telegram/api/generate-qr/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        console.log('QR response:', data);
        
        if (data.success) {
            // Сервер уже возвращает data URL
            document.getElementById('qr-image').src = data.qr_image;
            showElement('qr-container');
            hideElement('step-initial');
            startAuthCheck();
            showStatus('QR-код создан. Отсканируйте его в Telegram', 'warning');
        } else if (data.redirect) {
            location.reload();
        } else {
            console.error('❌ Ошибка создания QR:', data);
            showError('Ошибка создания QR: ' + (data.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка generateQR:', error);
        showError('Ошибка сети: ' + error.message);
    }
}

function startAuthCheck() {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    
    isChecking = true;
    console.log('Начинаем проверку авторизации каждые', CHECK_INTERVAL, 'мс');
    
    // Делаем первую проверку сразу
    checkAuthStatus();
    
    // Затем проверяем каждые 2 секунды
    checkInterval = setInterval(() => {
        if (isChecking) {
            checkAuthStatus();
        }
    }, CHECK_INTERVAL);
}

async function checkAuthStatus() {
    try {
        console.log('Проверяем статус авторизации...');
        
        const response = await fetch('/telegram/api/check-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        console.log('Auth status response:', data);
        
        if (data.status === 'success') {
            console.log('✅ Авторизация успешна!', data.user);
            stopAuthCheck();
            showSuccess(data.user);
            
        } else if (data.status === '2fa_required') {
            console.log('🔐 Требуется 2FA');
            stopAuthCheck();
            show2FA();
            
        } else if (data.status === 'waiting' || data.status === 'timeout') {
            console.log('⏳ Ожидание авторизации...');
            showStatus('Ожидание сканирования QR-кода...', 'warning');
            
        } else if (data.status === 'error') {
            console.error('❌ Ошибка авторизации:', data.error);
            showStatus('Ошибка: ' + data.error, 'danger');
            
            // Если ошибка критическая, останавливаем проверку
            if (data.error.includes('не найден') || data.error.includes('не подключен')) {
                stopAuthCheck();
            }
        } else {
            console.log('❓ Неизвестный статус:', data.status);
            showStatus('Неизвестный статус: ' + data.status, 'warning');
        }
        
    } catch (error) {
        console.error('Ошибка проверки статуса:', error);
        showStatus('Ошибка сети: ' + error.message, 'danger');
    }
}

function stopAuthCheck() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
    isChecking = false;
    console.log('Остановили проверку авторизации');
}

function show2FA() {
    hideElement('qr-container');
    showElement('tfa-container');
    showStatus('Введите пароль двухфакторной аутентификации', 'info');
    
    const passwordField = document.getElementById('tfa-password');
    if (passwordField) {
        passwordField.focus();
    }
}

async function submit2FA(event) {
    event.preventDefault();
    
    const passwordField = document.getElementById('tfa-password');
    const password = passwordField.value.trim();
    
    if (!password) {
        showError('Введите пароль 2FA');
        passwordField.focus();
        return;
    }
    
    try {
        console.log('Отправляем 2FA...');
        showStatus('Проверка пароля 2FA...', 'info');
        
        const response = await fetch('/telegram/api/handle-2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({password: password})
        });
        
        const data = await response.json();
        console.log('2FA response:', data);
        
        if (data.success) {
            console.log('✅ 2FA успешно!', data.user);
            showSuccess(data.user);
        } else {
            console.error('❌ Ошибка 2FA:', data.error);
            showError('Ошибка 2FA: ' + data.error);
            passwordField.value = '';
            passwordField.focus();
        }
        
    } catch (error) {
        console.error('Ошибка submit2FA:', error);
        showError('Ошибка: ' + error.message);
        passwordField.focus();
    }
}

function showSuccess(user) {
    console.log('Показываем экран успеха для:', user);
    
    // Скрываем все остальные контейнеры
    hideElement('qr-container');
    hideElement('tfa-container');
    hideElement('step-initial');
    
    // Показываем успех
    showElement('success-container');
    
    // Обновляем информацию о пользователе
    const userDisplay = document.getElementById('user-info-display');
    if (userDisplay && user) {
        const displayName = user.first_name || 'Пользователь';
        const username = user.username ? `(@${user.username})` : '';
        userDisplay.innerHTML = `<strong>${displayName}</strong> ${username}`;
    }
    
    showStatus('Авторизация завершена успешно!', 'success');
    
            // Автоматическое перенаправление на дашборд через 2 секунды
            setTimeout(() => {
                console.log('Перенаправляем на дашборд...');
                window.location.href = '/telegram/dashboard/';
            }, 2000);
}

async function resetAuth() {
    if (!confirm('Вы уверены, что хотите сбросить авторизацию Telegram?')) {
        return;
    }
    
    try {
        console.log('Сбрасываем авторизацию...');
        
        const response = await fetch('/telegram/api/reset-auth/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Авторизация сброшена');
            alert('Авторизация сброшена');
            location.reload();
        } else {
            console.error('❌ Ошибка сброса:', data.error);
            showError('Ошибка сброса: ' + data.error);
        }
        
    } catch (error) {
        console.error('Ошибка resetAuth:', error);
        showError('Ошибка: ' + error.message);
    }
}

function cancelAuth() {
    console.log('Отменяем авторизацию');
    stopAuthCheck();
    
    // Скрываем все контейнеры
    hideElement('qr-container');
    hideElement('tfa-container');
    hideElement('success-container');
    
    // Показываем начальный экран
    showElement('step-initial');
    showStatus('Авторизация отменена', 'info');
}

function showQR() {
    hideElement('tfa-container');
    showElement('qr-container');
    showStatus('QR-код создан. Отсканируйте его в Telegram', 'warning');
    startAuthCheck();
}

async function recreateQR() {
    try {
        console.log('Пересоздание QR-кода...');
        showStatus('Пересоздание QR-кода...', 'info');
        
        const response = await fetch('/telegram/api/recreate-qr/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ QR-код пересоздан');
            document.getElementById('qr-image').src = data.qr_image;
            showElement('qr-container');
            hideElement('tfa-container');
            startAuthCheck();
            showStatus('QR-код пересоздан. Отсканируйте его в Telegram', 'warning');
        } else {
            console.error('❌ Ошибка пересоздания QR:', data.error);
            showError('Ошибка пересоздания QR: ' + data.error);
        }
        
    } catch (error) {
        console.error('Ошибка recreateQR:', error);
        showError('Ошибка: ' + error.message);
    }
}

// Вспомогательные функции
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('d-none');
    }
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('d-none');
    }
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-display');
    if (statusElement) {
        statusElement.className = `alert alert-${type} text-center`;
        
        let icon = 'fas fa-info-circle';
        if (type === 'warning') icon = 'fas fa-spinner fa-spin';
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'danger') icon = 'fas fa-exclamation-triangle';
        
        statusElement.innerHTML = `<i class="${icon}"></i> ${message}`;
    }
}

function showError(message) {
    console.error('Показываем ошибку:', message);
    alert('Ошибка: ' + message);
    showStatus(message, 'danger');
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Очистка при выходе со страницы
window.addEventListener('beforeunload', function() {
    stopAuthCheck();
});

// Дебаг информация
console.log('Telegram Auth JavaScript загружен');
console.log('Интервал проверки:', CHECK_INTERVAL, 'мс');