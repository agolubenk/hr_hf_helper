document.addEventListener('DOMContentLoaded', () => {
    /**
     * Поведение команд в чате
     *
     * Правила:
     * 1) Явной командой считается только ввод с клавиатуры: 
     *    "/s ", "/hr ", "/in ", "/invite " — строго с пробелом или Enter после.
     *    Фрагменты внутри URL (например, "/s" в ссылке) игнорируются.
     * 2) После ввода команды (и пробела/Enter) команда сохраняется в скрытом поле actionType
     *    и отображается бейджем слева, а из textarea сама команда удаляется. Это состояние
     *    фиксируется и НЕ меняется при дальнейшем вводе произвольного текста.
     * 3) Состояние меняется только при новом ручном вводе команды (с клавиатуры) — 
     *    снова "/s ", "/in ", "/hr ", "/invite ", после чего обновляются actionType и бейдж.
     * 4) Команда, вставленная через копирование/вставку, НЕ считается введённой — 
     *    требуется именно набор с клавиатуры.
     */
    
    // Переменные состояния для отслеживания команд
    let pendingCommandStart = -1;
    let actionLocked = false;
    const textarea = document.getElementById('id_message');
    const tagLabel = document.getElementById('selectedTag');
    const actionTypeInput = document.getElementById('actionType');
    const sendButton = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');
    
    // Проверяем что форма найдена
    if (!chatForm) {
        return;
    }
    
    // Передаем переменную sessionId из шаблона в глобальный scope
    const sessionId = window.sessionId;

    // Сопоставление команды → action_type
    const COMMANDS = {
        '/s':      'hrscreening',
        '/hr':     'hrscreening',
        '/screen': 'hrscreening',
        '/in':     'invite',
        '/invite': 'invite',
        '/inv':    'invite'
    };

    /**
     * Добавляет новое сообщение в чат без перезагрузки страницы
     * @param {string} messageHtml - HTML-код сообщения
     */
    function addMessageToChat(messageHtml) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            return;
        }
        
        const typingIndicator = document.getElementById('typing-indicator');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml.trim();
        const messageElement = tempDiv.firstElementChild;
        
        if (!messageElement) {
            return;
        }
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        scrollToBottom();
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
     * @param {string} text - Текст сообщения
     * @param {string} actionType - Тип действия (hrscreening/invite)
     * @param {string} commandUsed - Использованная команда (/s, /in и т.д.)
     */
    function addUserMessageToChat(text, actionType, commandUsed) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            return;
        }
        
        // Формируем метку команды в левом нижнем углу
        let commandBadge = '';
        if (commandUsed && commandUsed !== null && commandUsed !== '') {
            let badgeClass = 'bg-secondary';
            const cmd = String(commandUsed).toLowerCase();
            if (cmd === '/s' || cmd === '/hr') {
                badgeClass = 'bg-success';
            } else if (cmd === '/in' || cmd === '/invite') {
                badgeClass = 'bg-warning';
            }
            commandBadge = `<span class="command-indicator badge ${badgeClass}" style="position: absolute; bottom: 4px; left: 4px; font-size: 0.7em; z-index: 10;">${commandUsed}</span>`;
        }
        
        // Создаем HTML для пользовательского сообщения с меткой команды
        const messageHtml = `
            <div class="message mb-3 user-message">
                <div class="d-flex justify-content-end">
                    <div class="message-bubble user-bubble" style="position: relative;">
                        <div class="message-content">${text}</div>
                        ${commandBadge}
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
        }
    }


    // Обработчик ввода в textarea (только UX: авто-высота и т.п.)
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            
            // Проверяем, начинается ли текст с команды (простая логика из оригинальной версии)
            const match = val.match(/^\/\w+/);
            if (match) {
                const cmd = match[0].toLowerCase();
                const action = COMMANDS[cmd];
                
                if (action && actionTypeInput && tagLabel) {
                    // Показываем метку
                    tagLabel.textContent = `#${action}`;
                    tagLabel.style.display = 'inline-block';
                    
                    // Меняем цвет метки в зависимости от типа
                    if (action === 'hrscreening') {
                        tagLabel.className = 'tag-label badge bg-success me-2';
                    } else if (action === 'invite') {
                        tagLabel.className = 'tag-label badge bg-warning me-2';
                    } else {
                        tagLabel.className = 'tag-label badge bg-info me-2';
                    }
                    
                    // Заполняем скрытое поле
                    actionTypeInput.value = action;
                    
                    // Удаляем команду из текста, оставляя только остальной контент
                    textarea.value = val.slice(cmd.length).trimStart();
                    return;
                }
            }
        });

        // Ловим начало потенциальной команды при вводе '/'
        textarea.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                // фиксируем индекс начала возможной команды
                pendingCommandStart = textarea.selectionStart; // позиция ДО вставки '/'
                actionLocked = false; // откроем возможность переключения при подтверждении
            }

            // Подтверждение команды пробелом
            if (e.key === ' ' && pendingCommandStart !== -1) {
                e.preventDefault(); // Предотвращаем вставку пробела до обработки команды
                
                const cursorPos = textarea.selectionStart; // позиция ДО вставки пробела
                const text = textarea.value;
                // Команда должна быть сразу после pendingCommandStart и до cursorPos: 
                // например "/s" или "/in" и т.п.
                const raw = text.substring(pendingCommandStart, cursorPos).toLowerCase();
                const cmdMatch = raw.match(/^\/(s|hr|in|invite)$/);
                if (cmdMatch) {
                    const token = '/' + cmdMatch[1];
                    const action = COMMANDS[token];
                    if (action) {
                        // Применяем команду: устанавливаем скрытое поле и бейдж
                        actionTypeInput.value = action;
                        tagLabel.textContent = `#${action}`;
                        tagLabel.style.display = 'inline-block';
                        tagLabel.className = action === 'hrscreening'
                            ? 'tag-label badge bg-success me-2'
                            : (action === 'invite' ? 'tag-label badge bg-warning me-2' : 'tag-label badge bg-info me-2');

                        // Удаляем команду из текста, оставляя контент
                        const before = text.substring(0, pendingCommandStart);
                        const after = text.substring(cursorPos); // текст после команды
                        // Соединяем части, убирая лишние пробелы
                        const parts = [before.trimEnd(), after.trimStart()].filter(p => p);
                        const newValue = parts.join(' ');
                        textarea.value = newValue;
                        
                        // Ставим курсор в конец
                        const end = textarea.value.length;
                        textarea.selectionStart = textarea.selectionEnd = end;

                        actionLocked = true;           // команда зафиксирована
                        pendingCommandStart = -1;       // сброс
                        return false; // предотвращаем дальнейшую обработку
                    }
                }
                // Если не распознали — сбрасываем ожидание
                pendingCommandStart = -1;
            }
            
            // Обработка Enter для отправки формы
            if (e.key === 'Enter' && !e.shiftKey) {
                // Если есть активная команда, обрабатываем её
                if (pendingCommandStart !== -1) {
                    const cursorPos = textarea.selectionStart;
                    const text = textarea.value;
                    const raw = text.substring(pendingCommandStart, cursorPos).toLowerCase();
                    const cmdMatch = raw.match(/^\/(s|hr|in|invite)$/);
                    if (cmdMatch) {
                        const token = '/' + cmdMatch[1];
                        const action = COMMANDS[token];
                        if (action) {
                            e.preventDefault();
                            // Применяем команду
                            actionTypeInput.value = action;
                            tagLabel.textContent = `#${action}`;
                            tagLabel.style.display = 'inline-block';
                            tagLabel.className = action === 'hrscreening'
                                ? 'tag-label badge bg-success me-2'
                                : (action === 'invite' ? 'tag-label badge bg-warning me-2' : 'tag-label badge bg-info me-2');

                            // Удаляем команду из текста
                            const before = text.substring(0, pendingCommandStart);
                            const after = text.substring(cursorPos);
                            const parts = [before.trimEnd(), after.trimStart()].filter(p => p);
                            textarea.value = parts.join(' ');
                            
                            const end = textarea.value.length;
                            textarea.selectionStart = textarea.selectionEnd = end;
                            actionLocked = true;
                            pendingCommandStart = -1;
                            // После обработки команды отправляем форму
                            if (textarea.value.trim()) {
                                submitChatForm();
                            }
                            return false;
                        }
                    }
                    pendingCommandStart = -1;
                }
                
                // Если команды нет или она обработана, отправляем форму
                if (textarea.value.trim()) {
                    e.preventDefault();
                    submitChatForm();
                }
            }
        });
    }

    // Функция отправки сообщения
    function submitChatForm() {
        if (!chatForm || !textarea) {
            console.error('❌ SUBMIT: chatForm или textarea не найдены');
            return;
        }
        
        if (!sessionId) {
            console.error('❌ SUBMIT: sessionId не определён:', sessionId);
            alert('Ошибка: ID сессии чата не найден. Перезагрузите страницу.');
            return;
        }
        
        console.log('✅ SUBMIT: Handler triggered, sessionId:', sessionId);
        
        const actionType = actionTypeInput ? actionTypeInput.value : '';
        let text = textarea.value.trim();
        console.log('✅ SUBMIT: actionType:', actionType, 'text:', text);
        
        if (!text) {
            console.warn('⚠️ SUBMIT: Пустой текст сообщения');
            return;
        }
        
        // Определяем, какая команда будет использована
        let commandUsed = null;
        let finalActionType = actionType;
        
        // Сначала проверяем, есть ли команда в самом тексте
        const cmdMatchStart = text.match(/^\/(s|hr|in|invite)(?=\s|$)/i);
        const cmdMatchSpace = text.match(/(^|\s)\/(s|hr|in|invite)(?=\s|$)/i);
        const cmdMatch = cmdMatchStart || cmdMatchSpace;
        
        if (cmdMatch) {
            // Команда найдена в тексте — определяем её
            const cmdToken = '/' + (cmdMatch[1] || cmdMatch[2]).toLowerCase();
            commandUsed = cmdToken;
            // Обновляем actionType на основе найденной команды
            if (cmdToken === '/s' || cmdToken === '/hr') {
                finalActionType = 'hrscreening';
            } else if (cmdToken === '/in' || cmdToken === '/invite') {
                finalActionType = 'invite';
            }
            
            // Обновляем скрытое поле, если оно не совпадает
            if (actionTypeInput && actionTypeInput.value !== finalActionType) {
                actionTypeInput.value = finalActionType;
            }
        } else if (actionType) {
            // Команды нет в тексте, но есть в скрытом поле — добавляем команду в текст
            if (actionType === 'hrscreening') {
                text = '/s ' + text;
                commandUsed = '/s';
            } else if (actionType === 'invite') {
                text = '/in ' + text;
                commandUsed = '/in';
            }
            finalActionType = actionType;
        }
        
        // Добавляем сообщение пользователя (без команды для UX)
        const displayText = textarea.value.trim();
        addUserMessageToChat(displayText, finalActionType, commandUsed);
        
        // Блокируем кнопки
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
        }
        textarea.disabled = true;
        
        // AJAX запрос
        const payload = {
            'action_type': finalActionType || actionType,
            'text': text,
            'session_id': sessionId
        };
        console.log('✅ SUBMIT: Sending payload:', payload);
        
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            console.error('❌ SUBMIT: CSRF токен не найден');
            alert('Ошибка: CSRF токен не найден. Перезагрузите страницу.');
            // Разблокируем кнопки
            if (sendButton) {
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
            }
            textarea.disabled = false;
            return;
        }
        
        const url = `/google-oauth/chat/${sessionId}/ajax/`;
        console.log('✅ SUBMIT: URL:', url);
        console.log('✅ SUBMIT: CSRF токен:', csrfToken ? 'найден' : 'не найден');
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(payload),
            credentials: 'same-origin'
        })
        .then(response => {
            console.log('✅ SUBMIT: Response status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('❌ SUBMIT: Response error:', text);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ SUBMIT: Response data:', data);
            if (data.success) {
                // Очищаем поле
                textarea.value = '';
                if (tagLabel) {
                    tagLabel.style.display = 'none';
                }
                textarea.style.height = '48px';
                // Сбрасываем команду
                if (actionTypeInput) {
                    actionTypeInput.value = '';
                }
                actionLocked = false;
                pendingCommandStart = -1;
                
                // Добавляем ответ
                if (data.message_html) {
                    addMessageToChat(data.message_html);
                }
            } else {
                const errorMsg = data.error || 'Ошибка отправки';
                console.error('❌ SUBMIT: Server error:', errorMsg);
                alert(errorMsg);
            }
            
            // Разблокируем кнопки
            if (sendButton) {
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
            }
            textarea.disabled = false;
        })
        .catch(error => {
            console.error('❌ SUBMIT: Catch error:', error);
            let errorMsg = 'Ошибка отправки сообщения';
            if (error.message) {
                errorMsg += ': ' + error.message;
            }
            alert(errorMsg);
            
            if (sendButton) {
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendButton.disabled = false;
            }
            textarea.disabled = false;
        });
    }

    // ЕДИНСТВЕННЫЙ обработчик submit
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitChatForm();
        });
    }
    
    // Обработчик клика на кнопку отправки
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            submitChatForm();
        });
    }
});

// Функция для получения CSRF токена
function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        return csrfToken.value;
    }
    return '';
}