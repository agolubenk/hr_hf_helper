document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('id_message');
    const tagLabel = document.getElementById('selectedTag');
    const actionTypeInput = document.getElementById('actionType');
    const sendButton = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');
    
    // Передаем переменную sessionId из шаблона в глобальный scope
    const sessionId = window.sessionId;

    // Сопоставление команды → action_type
    const COMMANDS = {
        '/s':      'hrscreening',
        '/hr':     'hrscreening',
        '/screen': 'hrscreening',
        '/ы':      'hrscreening',
        '/in':     'invite',
        '/inv':    'invite',
        '/prigl':  'invite',
        '/пригл':  'invite',
        '/шт':     'invite'
    };

    // Функция для получения CSRF токена
    function getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    // Функция для перезагрузки чата
    function reloadChat() {
        // Простая перезагрузка страницы для обновления чата
        window.location.reload();
    }

    // Обработчик ввода в textarea
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            const match = val.match(/^\/[a-zA-Zа-яё]+/);
            if (match) {
                const cmd = match[0].toLowerCase();
                const action = COMMANDS[cmd];
                if (action) {
                    // Показываем метку рядом
                    tagLabel.textContent = `#${action}`;
                    tagLabel.style.display = 'inline-block';
                    
                    // Меняем цвет метки в зависимости от типа
                    if (action === 'hrscreening') {
                        tagLabel.className = 'tag-label badge bg-success me-2';
                    } else if (action === 'invite') {
                        tagLabel.className = 'tag-label badge bg-warning me-2';
                    }
                    
                    // Заполняем скрытое поле
                    actionTypeInput.value = action;
                    
                    // Удаляем команду из текста, оставляя только URL и остальной контент
                    textarea.value = val.slice(cmd.length).trimStart();
                    return;
                }
            }
            // НЕ скрываем метку, если она уже установлена
            // Метка остается до отправки сообщения
        });
    }

    // Перехватываем отправку формы для AJAX запроса
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const actionType = actionTypeInput.value;
            const text = textarea.value.trim();
            
            if (!text) {
                return;
            }
            
            // Показываем индикатор загрузки
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
            textarea.disabled = true;
            
            // Отправляем AJAX запрос
            fetch(`/google-oauth/chat/${sessionId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ 
                    action_type: actionType, 
                    text: text,
                    session_id: sessionId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Очистка поля и метки
                    textarea.value = '';
                    tagLabel.style.display = 'none';
                    
                    // Перезагрузка чата
                    reloadChat();
                } else {
                    alert(`Ошибка: ${data.error || 'Неизвестная ошибка'}`);
                    
                    // Восстанавливаем кнопку
                    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                    sendButton.disabled = false;
                    textarea.disabled = false;
                }
            })
            .catch(error => {
                console.error('Ошибка отправки сообщения:', error);
                alert('Ошибка отправки сообщения. Попробуйте еще раз.');
                
                // Восстанавливаем кнопку
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
                textarea.disabled = false;
            });
        });
    }
});
