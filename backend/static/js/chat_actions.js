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
    
    // Передаем переменную sessionId из шаблона в глобальный scope
    const sessionId = window.sessionId;
    console.log('🔍 Session ID from window:', sessionId);

    // Сопоставление команды → action_type
    const COMMANDS = {
        '/s':      'hrscreening',
        '/hr':     'hrscreening',
        '/screen': 'hrscreening',
        '/in':     'invite',
        '/inv':    'invite',
        '/prigl':  'invite',
        '/пригл':  'invite'
    };

    // Функция для получения CSRF токена
    function getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        console.log('🔍 CSRF Token element:', csrfToken);
        console.log('🔍 CSRF Token value:', csrfToken ? csrfToken.value : 'NOT FOUND');
        return csrfToken ? csrfToken.value : '';
    }

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
            console.error('❌ Не удалось создать элемент сообщения');
            return;
        }
        
        // Вставляем сообщение ПЕРЕД индикатором печати (если он есть)
        // или в конец контейнера
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

    // Обработчик ввода в textarea
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            console.log('🔍 TEXTAREA INPUT: Value:', val);
            
            const match = val.match(/^\/\w+\s*/);
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
                    
                    // Устанавливаем значение в скрытое поле
                    actionTypeInput.value = action;
                    console.log('🔍 ACTION TYPE SET:', action);
                    
                    // Удаляем команду из поля ввода, оставляя только текст после команды
                    const textAfterCommand = val.substring(match[0].length);
                    textarea.value = textAfterCommand;
                    
                    // Устанавливаем курсор в конец
                    const cursorPos = textAfterCommand.length;
                    textarea.setSelectionRange(cursorPos, cursorPos);
                    
                    console.log('🔍 COMMAND REMOVED: Text after command:', textAfterCommand);
                } else {
                    // Скрываем метку для неизвестных команд
                    tagLabel.style.display = 'none';
                    actionTypeInput.value = 'hrscreening'; // По умолчанию
                    console.log('🔍 UNKNOWN COMMAND, using default');
                }
            } else {
                // Скрываем метку, если команда не начинается с /
                tagLabel.style.display = 'none';
                actionTypeInput.value = 'hrscreening'; // По умолчанию
                console.log('🔍 NO COMMAND, using default');
            }
        });
    }

    // Перехватываем отправку формы для AJAX запроса
    if (chatForm) {
        console.log('🔍 Chat form found:', chatForm);
        chatForm.addEventListener('submit', (e) => {
            console.log('🔍 FORM SUBMIT: Event triggered');
            e.preventDefault();
            e.stopPropagation();
            console.log('🔍 FORM SUBMIT: PreventDefault and stopPropagation called');
            
            const actionType = actionTypeInput.value;
            const text = textarea.value.trim();
            
            console.log('🔍 FORM SUBMIT: Action type:', actionType);
            console.log('🔍 FORM SUBMIT: Text:', text);
            console.log('🔍 FORM SUBMIT: Session ID:', sessionId);
            console.log('🔍 FORM SUBMIT: ActionTypeInput element:', actionTypeInput);
            console.log('🔍 FORM SUBMIT: Textarea element:', textarea);
            
            if (!text) {
                console.log('🔍 FORM SUBMIT: Empty text, returning');
                return;
            }
            
            // Показываем индикатор загрузки
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
            textarea.disabled = true;
            
            // Отправляем AJAX запрос
            console.log(`🔍 JS: Отправляем AJAX запрос на /google-oauth/chat/${sessionId}/ajax/`);
            fetch(`/google-oauth/chat/${sessionId}/ajax/`, {
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
            .then(response => {
                console.log('🔍 AJAX RESPONSE: Status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('🔍 AJAX RESPONSE: Data:', data);
                
                if (data.success) {
                    console.log('✅ Сообщение успешно отправлено');
                    console.log('🔍 RESPONSE: message_html present:', !!data.message_html);
                    console.log('🔍 RESPONSE: message_type:', data.message_type);
                    console.log('🔍 RESPONSE: message_id:', data.message_id);
                    
                    // Очищаем поле ввода
                    textarea.value = '';
                    
                    // Скрываем тег
                    tagLabel.style.display = 'none';
                    
                    // Сбрасываем высоту textarea
                    textarea.style.height = 'auto';
                    textarea.style.height = '48px';
                    
                    // Если сервер вернул HTML сообщения - добавляем его в чат
                    if (data.message_html) {
                        console.log('📨 Получен HTML сообщения, добавляем в чат');
                        console.log('🔍 HTML LENGTH:', data.message_html.length);
                        addMessageToChat(data.message_html);
                    } else {
                        console.warn('⚠️ Сервер не вернул HTML сообщения');
                    }
                } else {
                    console.error('❌ Ошибка сервера:', data.error);
                    alert(`Ошибка: ${data.error || 'Неизвестная ошибка'}`);
                }
                
                // Восстанавливаем кнопку
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
                textarea.disabled = false;
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