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

    // Служебные флаги для фиксации/переключения команды
    let actionLocked = false;              // Команда зафиксирована до явного ввода новой
    let pendingCommandStart = -1;          // Индекс начала потенциальной новой команды ('/' введён с клавиатуры)

    // Обработчик ввода в textarea (только UX: авто-высота и т.п.)
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            console.log('🔍 TEXTAREA INPUT: Value:', val);
            // Здесь БОЛЬШЕ НЕ парсим команды — логика перенесена в keydown, чтобы
            // реагировать только на ввод с клавиатуры. Это сохраняет команду зафиксированной,
            // пока пользователь явно не введёт новую.
        });

        // Ловим начало потенциальной команды при вводе '/'
        textarea.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                // фиксируем индекс начала возможной команды
                pendingCommandStart = textarea.selectionStart; // позиция ДО вставки '/'
                actionLocked = false; // откроем возможность переключения при подтверждении
            }

            // Подтверждение команды пробелом или Enter
            if ((e.key === ' ' || e.key === 'Enter') && pendingCommandStart !== -1) {
                const cursorPos = textarea.selectionStart; // позиция ДО вставки пробела/Enter
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
                        const after = text.substring(cursorPos); // пробел/enter будет обработан самим браузером
                        textarea.value = (before + after).replace(/[ \t]+/g, ' ').replace(/^\s+/, '');
                        // Ставим курсор в конец
                        const end = textarea.value.length;
                        textarea.selectionStart = textarea.selectionEnd = end;

                        actionLocked = true;           // команда зафиксирована
                        pendingCommandStart = -1;       // сброс
                        return; // не препятствуем вставке пробела/Enter — уже удалили команду
                    }
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
            const explicitCmdRe = /(^|\s)\/(s|hr|in|invite)(?=\s|$)/i;
            const cmdMatch = text.match(/^\/(s|hr|in|invite)(?=\s|$)/i) || text.match(/(^|\s)\/(s|hr|in|invite)(?=\s|$)/i);
            
            if (cmdMatch) {
                // Команда найдена в тексте
                commandUsed = '/' + (cmdMatch[1] || cmdMatch[2]).toLowerCase();
                console.log('🔍 SUBMIT: Command found in text:', commandUsed);
            } else {
                // Команды нет в тексте — добавляем из actionType
                if (actionType === 'hrscreening') {
                    text = '/s ' + text;
                    commandUsed = '/s';
                    console.log('🔍 SUBMIT: Command added from actionType (hrscreening):', commandUsed);
                } else if (actionType === 'invite') {
                    text = '/in ' + text;
                    commandUsed = '/in';
                    console.log('🔍 SUBMIT: Command added from actionType (invite):', commandUsed);
                } else {
                    console.log('🔍 SUBMIT: No command found and no actionType set');
                }
            }
            
            console.log('🔍 SUBMIT: Final text with command:', text);
            console.log('🔍 SUBMIT: Command used for badge:', commandUsed);
            
            // Добавляем сообщение пользователя (без команды для UX)
            const displayText = textarea.value.trim();
            addUserMessageToChat(displayText, actionType, commandUsed);
            
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
                    'action_type': actionType || (commandUsed ? (commandUsed === '/s' || commandUsed === '/hr' ? 'hrscreening' : (commandUsed === '/in' || commandUsed === '/invite' ? 'invite' : '')) : ''),
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