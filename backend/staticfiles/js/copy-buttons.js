// =============================================================================
// COPY BUTTONS FUNCTIONALITY
// =============================================================================

// Функции для копирования вопросов
window.copyQuestions = function(country) {
    let text = country === 'belarus' ? window.questionsBelarus : window.questionsPoland;
    
    // Добавляем информацию о времени встречи
    if (text && window.vacancyData) {
        const duration = country === 'belarus' ? 
            (window.vacancyData.screening_duration || 45) : 
            (window.vacancyData.tech_interview_duration || 90);
        
        const timeInfo = country === 'belarus' ? 
            `\n\nПо времени нужно будет примерно ${duration} минут.\nКогда комфортнее?` :
            `\n\nThe interview will take approximately ${duration} minutes.\nWhen would be convenient for you?`;
        
        text = text + timeInfo;
    }
    
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess();
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    }
};

// Функция для показа уведомления об успешном копировании
window.showCopySuccess = function() {
    // Показываем уведомление об успешном копировании
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
    notification.innerHTML = '<i class="fas fa-check"></i> Скопировано в буфер обмена!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
};

// Глобальные функции для копирования ссылок на вакансии
window.copyVacancyLink = function(country) {
    const link = country === 'belarus' ? window.vacancyLinkBelarus : window.vacancyLinkPoland;
    if (link) {
        navigator.clipboard.writeText(link).then(() => {
            showCopySuccess();
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    }
};

// Функции для копирования слотов (будут реализованы в vacancy-slots.js)
window.copyWeekSlots = function(week) {
    // Эта функция будет реализована в vacancy-slots.js
    console.log('Копирование слотов недели:', week);
};

window.copyAllSlots = function() {
    // Эта функция будет реализована в vacancy-slots.js
    console.log('Копирование всех слотов');
};

window.refreshSlots = function() {
    // Эта функция будет реализована в vacancy-slots.js
    console.log('Обновление слотов');
};

// Функция для копирования текста инвайта
window.copyInvitationText = function(inviteId) {
    const btn = document.querySelector(`[data-invite-id="${inviteId}"]`);
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    fetch(`/google-oauth/invites/${inviteId}/invitation-text/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.invitation_text) {
            navigator.clipboard.writeText(data.invitation_text).then(() => {
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.classList.remove('btn-outline-warning');
                btn.classList.add('btn-success');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-warning');
                    btn.disabled = false;
                }, 1500);
            }).catch(err => {
                console.error('Clipboard error:', err);
                alert('Ошибка копирования в буфер обмена');
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        } else {
            alert('Ошибка получения текста инвайта');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Ошибка сети');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// Инициализация обработчиков событий для кнопок копирования инвайтов
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для кнопок копирования текста инвайта
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-invitation-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.copy-invitation-btn');
            const inviteId = btn.getAttribute('data-invite-id');
            copyInvitationText(inviteId);
        }
    });
});
