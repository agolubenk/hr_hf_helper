document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('id_message');
    const tagLabel = document.getElementById('selectedTag');
    const actionTypeInput = document.getElementById('actionType');
    const sendButton = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');
    
    console.log('🔍 DOM Elements found:');
    console.log('  - textarea:', textarea);
    console.log('  - tagLabel:', tagLabel);
    console.log('  - actionTypeInput:', actionTypeInput);
    console.log('  - sendButton:', sendButton);
    console.log('  - chatForm:', chatForm);
    
    // Проверяем что форма найдена
    if (!chatForm) {
        console.error('❌ Chat form not found! Cannot add event listener.');
        return;
    }
    
    // Передаем переменную sessionId из шаблона в глобальный scope
    const sessionId = window.sessionId;
    console.log('🔍 Session ID from window:', sessionId);

    // Сопоставление команды → action_type
    const COMMANDS = {
        '/s':      'hrscreening',
        '/hr':     'hrscreening',
        '/in':     'invite',
        '/invite': 'invite'
    };

    /**
     * Добавляет новое сообщение в чат без перезагрузки страницы
     * @param {string} messageHtml - HTML-код сообщения
     */
    function addMessageToChat(messageHtml) {
        console.log('📨 Добавление нового сообщения в чат');
        
        // Находим контейнер с сообщениями
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ Контейнер chat-messages не найден!');
            return;
        }
        
        // Находим индикатор печати (typing-indicator)
        const typingIndicator = document.getElementById('typing-indicator');
        
        // Создаём временный контейнер для HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml.trim();
        
        // Извлекаем элемент сообщения
        const messageElement = tempDiv.firstElementChild;
        
        if (!messageElement) {
            console.error('❌ Не удалось создать элемент сообщения из HTML');
            return;
        }
        
        // Вставляем сообщение перед индикатором печати (если есть) или в конец
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        // Прокручиваем чат вниз
        scrollToBottom();
        
        console.log('✅ Сообщение успешно добавлено');
    }

    /**
     * Прокручивает чат вниз
     */
    function scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    /**
     * Добавляет пользовательское сообщение в чат
     */
    function addUserMessageToChat(text, actionType) {
        console.log('👤 Добавление пользовательского сообщения в чат');
        
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ Контейнер chat-messages не найден!');
            return;
        }
        
        // Создаем HTML для пользовательского сообщения
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
        
        // Создаем временный контейнер для парсинга HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml;
        
        // Получаем первое дочернее сообщение
        const messageElement = tempDiv.firstElementChild;
        
        if (messageElement) {
            // Добавляем сообщение в чат
            chatMessages.appendChild(messageElement);
            
            // Прокручиваем вниз
            scrollToBottom();
            
            console.log('✅ Пользовательское сообщение добавлено');
        } else {
            console.error('❌ Не удалось создать элемент пользовательского сообщения');
        }
    }

    // Обработчик ввода в textarea
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            console.log('🔍 TEXTAREA INPUT: Value:', val);
            
            // Проверяем команды
            const match = val.match(/^\/(\w+)/);
            if (match) {
                const cmd = match[0].toLowerCase().trim();
                const action = COMMANDS[cmd];
                console.log('🔍 COMMAND DETECTED: Command:', cmd, 'Action:', action);
                
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
                    
                    // Устанавливаем action_type
                    actionTypeInput.value = action;
                    console.log('🔍 ACTION TYPE SET:', action);
                    
                    // Убираем команду из текста для лучшего UX (пользователь видит только текст)
                    const textAfterCommand = val.replace(/^\/(\w+)\s*/, '').trim();
                    if (textAfterCommand !== val) {
                        // Удаляем команду если она найдена (даже если текст пустой)
                        textarea.value = textAfterCommand;
                    }
                } else {
                    console.log('🔍 UNKNOWN COMMAND, using default');
                    // Скрываем метку для неизвестных команд
                    tagLabel.style.display = 'none';
                }
            } else {
                console.log('🔍 NO COMMAND, using default');
                // Скрываем метку, если нет команды
                tagLabel.style.display = 'none';
            }
        });
    }

    // ЕДИНСТВЕННЫЙ обработчик submit
    if (chatForm) {
        console.log('🔍 Chat form found:', chatForm);
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const actionType = actionTypeInput.value;
            let text = textarea.value.trim();
            
            if (!text) {
                return;
            }
            
            // Восстанавливаем команду в тексте для отправки на backend
            // если была выбрана команда через actionType
            if (actionType === 'hrscreening' && !text.startsWith('/s')) {
                text = '/s ' + text;
            } else if (actionType === 'invite' && !text.startsWith('/in')) {
                text = '/in ' + text;
            }
            
            // Добавляем сообщение пользователя (без команды для UX)
            const displayText = textarea.value.trim();
            addUserMessageToChat(displayText, actionType);
            
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
                    'text': text, // Текст с командой для backend
                    'session_id': sessionId
                })
            })
            .then(response => response.json())
            .then(data => {
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
                    alert(data.error || 'Ошибка отправки');
                }
                
                // Разблокируем кнопки
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
                textarea.disabled = false;
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка отправки сообщения');
                
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
                textarea.disabled = false;
            });
        });
    }
});

// Функция для получения CSRF токена
function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        console.log('🔍 CSRF Token element:', csrfToken);
        console.log('🔍 CSRF Token value:', csrfToken.value);
        return csrfToken.value;
    }
    return '';
}