/**
 * Новый файл для обработки чата - чистый и простой
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [NEW CHAT] Инициализация нового чата');
    
    const textarea = document.getElementById('id_message');
    const tagLabel = document.getElementById('selectedTag');
    const actionTypeInput = document.getElementById('actionType');
    const sendButton = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');

    if (!chatForm) {
        console.error('❌ [NEW CHAT] Форма чата не найдена!');
        return;
    }

    const sessionId = window.sessionId;
    const COMMANDS = {
        '/s': 'hrscreening',
        '/hr': 'hrscreening', 
        '/i': 'invite',
        '/in': 'invite',
        '/d': 'delete',
        '/del': 'delete',
    };

    // Получение CSRF токена
    function getCSRFToken() {
        const csrfTokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfTokenElement ? csrfTokenElement.value : '';
    }

    // Добавление сообщения в чат
    function addMessageToChat(messageHtml) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ [NEW CHAT] Контейнер chat-messages не найден!');
            return;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml.trim();
        const messageElement = tempDiv.firstElementChild;

        if (messageElement) {
            chatMessages.appendChild(messageElement);
            scrollToBottom();
        }
    }

    // Добавление сообщения пользователя
    function addUserMessageToChat(text, actionType) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ [NEW CHAT] Контейнер chat-messages не найден!');
            return;
        }
        
        const messageHtml = `
            <div class="message mb-3 user-message">
                <div class="d-flex justify-content-end">
                    <div class="message-bubble user-bubble">
                        <div class="message-content">${text}</div>
                    </div>
                    <div class="message-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml;
        const messageElement = tempDiv.firstElementChild;

        if (messageElement) {
            chatMessages.appendChild(messageElement);
            scrollToBottom();
        }
    }

    // Прокрутка вниз
    function scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Обработчик ввода в textarea
    if (textarea) {
        textarea.addEventListener('input', function() {
            const val = textarea.value;
            const match = val.match(/^\/(\w+)/);

            if (match) {
                const cmd = match[0].toLowerCase().trim();
                const action = COMMANDS[cmd];

                if (action) {
                    tagLabel.textContent = `#${action}`;
                    tagLabel.style.display = 'inline-block';
                    actionTypeInput.value = action;

                    if (action === 'hrscreening') {
                        tagLabel.className = 'tag-label badge bg-success me-2';
                    } else if (action === 'invite') {
                        tagLabel.className = 'tag-label badge bg-warning me-2';
                    } else if (action === 'delete') {
                        tagLabel.className = 'tag-label badge bg-danger me-2';
                    }

                    // Удаляем команду из поля ввода
                    textarea.value = val.replace(cmd, '').trim();
                } else {
                    tagLabel.style.display = 'none';
                    actionTypeInput.value = '';
                }
            } else {
                tagLabel.style.display = 'none';
                actionTypeInput.value = '';
            }
            
            sendButton.disabled = textarea.value.trim() === '';
        });
    }

    // ЕДИНСТВЕННЫЙ обработчик submit
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('🚀 [NEW CHAT] Отправка сообщения');

        const actionType = actionTypeInput.value;
        const text = textarea.value.trim();

        if (!text) {
            console.log('⚠️ [NEW CHAT] Пустое сообщение, пропускаем');
            return;
        }

        // Добавляем сообщение пользователя
        addUserMessageToChat(text, actionType);

        // Блокируем кнопки
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        sendButton.disabled = true;
        textarea.disabled = true;

        // AJAX запрос
        fetch(`/google-oauth/chat/${sessionId}/ajax/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                'action_type': actionType,
                'text': text,
                'session_id': sessionId
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ [NEW CHAT] Ответ получен:', data);
            
            if (data.success) {
                // Очищаем поле
                textarea.value = '';
                tagLabel.style.display = 'none';
                textarea.style.height = '48px';

                // Добавляем ответ
                if (data.message_html) {
                    addMessageToChat(data.message_html);
                }
            } else {
                console.error('❌ [NEW CHAT] Ошибка:', data.error);
                alert(data.error || 'Ошибка отправки');
            }
        })
        .catch(error => {
            console.error('❌ [NEW CHAT] Ошибка запроса:', error);
            alert('Ошибка отправки сообщения');
        })
        .finally(() => {
            // Разблокируем кнопки
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.disabled = false;
            textarea.disabled = false;
        });
    });

    console.log('✅ [NEW CHAT] Инициализация завершена');
});

// Функция для переключения команд (если нужна)
function toggleCommands() {
    const commandsList = document.getElementById('commandsList');
    const toggleIcon = document.getElementById('commandsToggleIcon');
    
    if (commandsList && toggleIcon) {
        if (commandsList.classList.contains('show')) {
            commandsList.classList.remove('show');
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
        } else {
            commandsList.classList.add('show');
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        }
    }
}
