document.addEventListener('DOMContentLoaded', () => {
    /**
     * Поведение команд в чате
     *
     * Правила:
     * 1) Явной командой считается только ввод с клавиатуры: 
     *    "/s ", "/hr ", "/t ", "/in ", "/invite " — строго с пробелом или Enter после.
     *    Фрагменты внутри URL (например, "/s" в ссылке) игнорируются.
     * 2) После ввода команды (и пробела/Enter) команда сохраняется в скрытом поле actionType
     *    и отображается бейджем слева, а из textarea сама команда удаляется. Это состояние
     *    фиксируется и НЕ меняется при дальнейшем вводе произвольного текста.
     * 3) Состояние меняется только при новом ручном вводе команды (с клавиатуры) — 
     *    снова "/s ", "/t ", "/in ", "/hr ", "/invite ", после чего обновляются actionType и бейдж.
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
        '/t':      'tech_screening',
        '/in':     'final_interview',
        '/invite': 'final_interview',
        '/inv':    'final_interview'
    };

    /**
     * Добавляет новое сообщение в чат без перезагрузки страницы
     * @param {string} messageHtml - HTML-код сообщения
     */
    function addMessageToChat(messageHtml) {
        console.log('🔍 addMessageToChat: Вызвана с HTML длиной:', messageHtml ? messageHtml.length : 0);
        
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ addMessageToChat: chat-messages не найден');
            return;
        }
        
        const typingIndicator = document.getElementById('typing-indicator');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHtml.trim();
        const messageElement = tempDiv.firstElementChild;
        
        if (!messageElement) {
            console.error('❌ addMessageToChat: Не удалось распарсить HTML');
            console.log('🔍 addMessageToChat: HTML:', messageHtml.substring(0, 500));
            return;
        }
        
        console.log('✅ addMessageToChat: Элемент успешно создан:', messageElement.tagName, messageElement.className);
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
            console.log('✅ addMessageToChat: Сообщение добавлено перед typing-indicator');
        } else {
            chatMessages.appendChild(messageElement);
            console.log('✅ addMessageToChat: Сообщение добавлено в конец');
        }
        
        scrollToBottom();
        console.log('✅ addMessageToChat: Скролл выполнен');
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
     * @param {string} commandUsed - Использованная команда (/s, /t и т.д.)
     */
    function addUserMessageToChat(text, actionType, commandUsed) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            return;
        }
        
        // Убираем команды из начала текста
        let cleanedText = text.trim();
        if (cleanedText.startsWith('/s ')) {
            cleanedText = cleanedText.substring(3).trim();
        } else if (cleanedText.startsWith('/hr ')) {
            cleanedText = cleanedText.substring(4).trim();
        } else if (cleanedText.startsWith('/t ')) {
            cleanedText = cleanedText.substring(3).trim();
        } else if (cleanedText.startsWith('/in ')) {
            cleanedText = cleanedText.substring(4).trim();
        } else if (cleanedText.startsWith('/invite ')) {
            cleanedText = cleanedText.substring(8).trim();
        } else if (cleanedText.startsWith('/inv ')) {
            cleanedText = cleanedText.substring(5).trim();
        } else if (cleanedText.startsWith('/screen ')) {
            cleanedText = cleanedText.substring(8).trim();
        }
        
        // Обрабатываем переносы строк: заменяем \n на <br>
        const processedText = cleanedText.replace(/\n/g, '<br>');
        
        // Формируем метку команды в левом нижнем углу
        let commandBadge = '';
        if (commandUsed && commandUsed !== null && commandUsed !== '') {
            let badgeClass = 'bg-secondary';
            const cmd = String(commandUsed).toLowerCase();
            if (cmd === '/s' || cmd === '/hr') {
                badgeClass = 'bg-success';
            } else if (cmd === '/t') {
                badgeClass = 'bg-warning';
            } else if (cmd === '/in' || cmd === '/invite') {
                badgeClass = 'bg-info';
            }
            // Определяем хэштег для отображения
            let hashtag = '';
            if (cmd === '/s' || cmd === '/hr') {
                hashtag = '#hrscreening';
            } else if (cmd === '/t') {
                hashtag = '#tech_screening';
            } else if (cmd === '/in' || cmd === '/invite') {
                hashtag = '#final_interview';
            } else {
                hashtag = commandUsed;
            }
            commandBadge = `<span class="command-indicator badge ${badgeClass}" style="position: absolute; bottom: -10px; right: 26px; font-size: 0.7em; z-index: 10; border: 1px solid #6c757d;">${hashtag}</span>`;
        }
        
        // Получаем URL фото пользователя (если доступен)
        const userPhotoUrl = window.userPhotoUrl || null;
        
        // Формируем HTML для аватара
        let avatarHtml = '';
        if (userPhotoUrl) {
            avatarHtml = `<img src="${userPhotoUrl}" alt="User Avatar" class="rounded-circle">`;
        } else {
            avatarHtml = `<i class="fas fa-user"></i>`;
        }
        
        // Создаем HTML для пользовательского сообщения с меткой команды
        const messageHtml = `
            <div class="message mb-3 user-message">
                <div class="d-flex justify-content-end align-items-end">
                    <div class="message-bubble user-bubble" style="position: relative;">
                        <div class="message-content user-content">${processedText}</div>
                        ${commandBadge}
                        <div class="message-footer">
                            <small class="text-muted">${new Date().toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</small>
                        </div>
                    </div>
                    <div class="message-avatar ms-2" style="margin-bottom: -18px; position: relative; z-index: 100;">
                        ${avatarHtml}
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
                    } else if (action === 'tech_screening') {
                        tagLabel.className = 'tag-label badge bg-warning me-2';
                    } else if (action === 'final_interview') {
                        tagLabel.className = 'tag-label badge bg-info me-2';
                    } else {
                        tagLabel.className = 'tag-label badge bg-secondary me-2';
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
                // например "/s" или "/t" и т.п.
                const raw = text.substring(pendingCommandStart, cursorPos).toLowerCase();
                const cmdMatch = raw.match(/^\/(s|hr|t|in|invite)$/);
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
                            : (action === 'tech_screening' ? 'tag-label badge bg-warning me-2' 
                            : (action === 'final_interview' ? 'tag-label badge bg-info me-2' : 'tag-label badge bg-secondary me-2'));

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
                    const cmdMatch = raw.match(/^\/(s|hr|t|in|invite)$/);
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
                                : (action === 'tech_screening' ? 'tag-label badge bg-warning me-2' 
                                : (action === 'final_interview' ? 'tag-label badge bg-info me-2' : 'tag-label badge bg-secondary me-2'));

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
        const cmdMatchStart = text.match(/^\/(s|hr|t|in|invite)(?=\s|$)/i);
        const cmdMatchSpace = text.match(/(^|\s)\/(s|hr|t|in|invite)(?=\s|$)/i);
        const cmdMatch = cmdMatchStart || cmdMatchSpace;
        
        if (cmdMatch) {
            // Команда найдена в тексте — определяем её
            const cmdToken = '/' + (cmdMatch[1] || cmdMatch[2]).toLowerCase();
            commandUsed = cmdToken;
            // Обновляем actionType на основе найденной команды
            if (cmdToken === '/s' || cmdToken === '/hr') {
                finalActionType = 'hrscreening';
            } else if (cmdToken === '/t') {
                finalActionType = 'tech_screening';
            } else if (cmdToken === '/in' || cmdToken === '/invite') {
                finalActionType = 'final_interview';
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
            } else if (actionType === 'tech_screening') {
                text = '/t ' + text;
                commandUsed = '/t';
            } else if (actionType === 'final_interview') {
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
                    console.log('✅ SUBMIT: Добавляем HTML сообщение, длина:', data.message_html.length);
                    console.log('✅ SUBMIT: Тип сообщения:', data.message_type);
                    console.log('✅ SUBMIT: HTML превью:', data.message_html.substring(0, 200));
                    addMessageToChat(data.message_html);
                } else {
                    console.warn('⚠️ SUBMIT: message_html отсутствует в ответе');
                    console.log('✅ SUBMIT: Полный ответ:', JSON.stringify(data, null, 2));
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