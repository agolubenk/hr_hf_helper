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
     * @param {string} text - Текст сообщения
     * @param {string} actionType - Тип действия (hrscreening/invite)
     * @param {string} commandUsed - Использованная команда (/s, /in и т.д.)
     */
    function addUserMessageToChat(text, actionType, commandUsed) {
        console.log('👤 Добавление пользовательского сообщения в чат');
        console.log('👤 Text:', text);
        console.log('👤 ActionType:', actionType);
        console.log('👤 Command used:', commandUsed);
        console.log('👤 Command used type:', typeof commandUsed);
        console.log('👤 Command used truthy?', !!commandUsed);
        
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ Контейнер chat-messages не найден!');
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
            console.log('👤 Command badge created:', commandBadge);
        } else {
            console.log('👤 No command badge - commandUsed is falsy');
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
            
            console.log('✅ Пользовательское сообщение добавлено');
        } else {
            console.error('❌ Не удалось создать элемент пользовательского сообщения');
        }
    }


    // Обработчик ввода в textarea (только UX: авто-высота и т.п.)
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            console.log('🔍 TEXTAREA INPUT: Value:', val);
            
            // Проверяем, начинается ли текст с команды (простая логика из оригинальной версии)
            const match = val.match(/^\/\w+/);
            if (match) {
                const cmd = match[0].toLowerCase();
                const action = COMMANDS[cmd];
                
                if (action && actionTypeInput && tagLabel) {
                    console.log('🔍 TEXTAREA INPUT: Command detected:', cmd, '→ action:', action);
                    
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
                    console.log('🔍 TEXTAREA INPUT: actionTypeInput.value set to:', action);
                    
                    // Удаляем команду из текста, оставляя только остальной контент
                    textarea.value = val.slice(cmd.length).trimStart();
                    console.log('🔍 TEXTAREA INPUT: Command removed from textarea, new value:', textarea.value);
                    return;
                }
            }
            // Если команда не найдена, метка остается без изменений
        });

        // Ловим начало потенциальной команды при вводе '/'
        textarea.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                // фиксируем индекс начала возможной команды
                pendingCommandStart = textarea.selectionStart; // позиция ДО вставки '/'
                actionLocked = false; // откроем возможность переключения при подтверждении
                console.log('🔍 KEYDOWN: Slash detected, pendingCommandStart set to:', pendingCommandStart);
            }

            // Подтверждение команды пробелом или Enter
            if ((e.key === ' ' || e.key === 'Enter') && pendingCommandStart !== -1) {
                e.preventDefault(); // Предотвращаем вставку пробела/Enter до обработки команды
                
                const cursorPos = textarea.selectionStart; // позиция ДО вставки пробела/Enter
                const text = textarea.value;
                // Команда должна быть сразу после pendingCommandStart и до cursorPos: 
                // например "/s" или "/in" и т.п.
                const raw = text.substring(pendingCommandStart, cursorPos).toLowerCase();
                console.log('🔍 KEYDOWN: Checking command from position', pendingCommandStart, 'to', cursorPos, 'raw:', raw);
                const cmdMatch = raw.match(/^\/(s|hr|in|invite)$/);
                if (cmdMatch) {
                    const token = '/' + cmdMatch[1];
                    const action = COMMANDS[token];
                    console.log('🔍 KEYDOWN: Command matched:', token, '→ action:', action);
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
                        const after = text.substring(cursorPos); // текст после команды (пробел/enter уже предотвращен через preventDefault)
                        // Соединяем части, убирая лишние пробелы
                        const parts = [before.trimEnd(), after.trimStart()].filter(p => p);
                        const newValue = parts.join(' ');
                        textarea.value = newValue;
                        
                        // Ставим курсор в конец
                        const end = textarea.value.length;
                        textarea.selectionStart = textarea.selectionEnd = end;
                        
                        console.log('🔍 KEYDOWN: Command processed. New value:', newValue, 'actionType:', actionTypeInput.value);

                        actionLocked = true;           // команда зафиксирована
                        pendingCommandStart = -1;       // сброс
                        return false; // предотвращаем дальнейшую обработку
                    }
                } else {
                    console.log('🔍 KEYDOWN: No command match. Resetting pendingCommandStart');
                }
                // Если не распознали — сбрасываем ожидание
                pendingCommandStart = -1;
            }
        });
    }

    // ЕДИНСТВЕННЫЙ обработчик submit
    if (chatForm) {
        console.log('🔍 Chat form found:', chatForm);
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const actionType = actionTypeInput ? actionTypeInput.value : '';
            let text = textarea.value.trim();
            
            console.log('🔍 SUBMIT: actionType from hidden input:', actionType);
            console.log('🔍 SUBMIT: textarea value:', text);
            
            if (!text) {
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
                console.log('🔍 SUBMIT: Command found in text:', commandUsed, '→ actionType:', finalActionType);
                
                // Обновляем скрытое поле, если оно не совпадает
                if (actionTypeInput && actionTypeInput.value !== finalActionType) {
                    actionTypeInput.value = finalActionType;
                    console.log('🔍 SUBMIT: Updated actionTypeInput.value to:', finalActionType);
                }
            } else if (actionType) {
                // Команды нет в тексте, но есть в скрытом поле — добавляем команду в текст
                if (actionType === 'hrscreening') {
                    text = '/s ' + text;
                    commandUsed = '/s';
                    console.log('🔍 SUBMIT: Command added from actionType (hrscreening):', commandUsed);
                } else if (actionType === 'invite') {
                    text = '/in ' + text;
                    commandUsed = '/in';
                    console.log('🔍 SUBMIT: Command added from actionType (invite):', commandUsed);
                }
                finalActionType = actionType;
            } else {
                console.log('🔍 SUBMIT: No command found and no actionType set');
            }
            
            console.log('🔍 SUBMIT: Final text with command:', text);
            console.log('🔍 SUBMIT: Command used for badge:', commandUsed);
            console.log('🔍 SUBMIT: Final actionType to send:', finalActionType);
            
            // Добавляем сообщение пользователя (без команды для UX)
            const displayText = textarea.value.trim();
            addUserMessageToChat(displayText, finalActionType, commandUsed);
            
            // Блокируем кнопки
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
            textarea.disabled = true;
            
            // Простая логика: отправляем actionType из скрытого поля (если есть)
            console.log('🔍 SUBMIT: Sending payload - action_type:', finalActionType, 'text:', text);
            
            // AJAX запрос
            fetch(`/google-oauth/chat/${sessionId}/ajax/`, {
                method: ' FewPOST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    'action_type': finalActionType || actionType, // Используем finalActionType или просто actionType
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