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
    
    /**
     * Проверяет состояние кнопки отправки в зависимости от команды и типа встречи
     * Блокирует кнопку отправки, если выбрана команда /in, но не выбран тип встречи "Интервью"
     */
    function updateSendButtonState() {
        if (!sendButton || !actionTypeInput) {
            return;
        }
        
        const actionType = actionTypeInput.value;
        const interviewButton = document.getElementById('btnInterview');
        const isInterviewSelected = interviewButton && interviewButton.classList.contains('active');
        
        // Если выбрана команда /in (final_interview), но не выбран тип встречи "Интервью"
        if (actionType === 'final_interview' && !isInterviewSelected) {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.5';
            sendButton.style.cursor = 'not-allowed';
            sendButton.title = 'Для отправки команды /in необходимо выбрать тип встречи "Интервью"';
        } else {
            // Разблокируем кнопку, если команда не /in или тип встречи выбран
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
            sendButton.style.cursor = 'pointer';
            sendButton.title = '';
        }
    }
    
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
        '/inv':    'final_interview',
        '/add':    'add_candidate'
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
     * Обновляет контактную информацию кандидата на странице
     * @param {Object} contactInfo - Объект с контактной информацией
     */
    function updateCandidateContactInfo(contactInfo) {
        // Находим контейнер для контактной информации (под блоком отчетов)
        // Ищем блок с отчетами и следующий за ним контейнер
        const reportsCard = document.querySelector('#weeklyReportsCardBody');
        if (!reportsCard) {
            console.warn('⚠️ UPDATE_CONTACT_INFO: Блок отчетов не найден');
            return;
        }
        
        // Находим родительский контейнер отчетов
        const reportsCardParent = reportsCard.closest('.card');
        if (!reportsCardParent) {
            console.warn('⚠️ UPDATE_CONTACT_INFO: Родительский контейнер отчетов не найден');
            return;
        }
        
        // Ищем следующий элемент после карточки отчетов
        let contactContainer = reportsCardParent.nextElementSibling;
        
        // Если контейнера нет, создаем его
        if (!contactContainer || !contactContainer.classList.contains('mt-3')) {
            contactContainer = document.createElement('div');
            contactContainer.className = 'mt-3';
            reportsCardParent.parentNode.insertBefore(contactContainer, reportsCardParent.nextSibling);
        }

        // Проверяем, есть ли данные для отображения
        const hasData = contactInfo.communication_where || contactInfo.telegram || 
                       contactInfo.linkedin || contactInfo.email;
        
        if (!hasData) {
            console.log('ℹ️ UPDATE_CONTACT_INFO: Нет данных для отображения');
            return;
        }

        // Формируем HTML для контактной информации
        let contactHtml = '<div class="mt-3">';
        
        // Если заполнено "Где ведется коммуникация", показываем только его
        if (contactInfo.communication_where) {
            const isLink = contactInfo.communication_where.toLowerCase().includes('http');
            if (isLink) {
                // Если это ссылка, показываем как кнопку-ссылку
                contactHtml += `
                    <a href="${contactInfo.communication_where}" target="_blank" rel="noopener noreferrer"
                       class="btn btn-outline-primary w-100 mb-2" 
                       style="border-color: #0088cc; color: #0088cc;">
                        <i class="fas fa-comments me-2"></i>Где ведется коммуникация: ${contactInfo.communication_where}
                    </a>
                `;
            } else {
                // Если не ссылка, показываем как карточку
                contactHtml += `
                    <div class="card mb-2" style="border: 1px solid #0088cc; border-radius: 8px;">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-comments me-2" style="color: #0088cc;"></i>
                                <div>
                                    <strong style="color: #0088cc;">Где ведется коммуникация:</strong>
                                    <div>${contactInfo.communication_where}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Если "Где ведется коммуникация" не заполнено, показываем остальные поля
            
            // Telegram
            if (contactInfo.telegram) {
                contactHtml += `
                    <a href="https://t.me/${contactInfo.telegram}" target="_blank" rel="noopener noreferrer"
                       class="btn btn-outline-primary w-100 mb-2" 
                       style="border-color: #0088cc; color: #0088cc;">
                        <i class="fab fa-telegram me-2"></i>Telegram: ${contactInfo.telegram}
                    </a>
                `;
            }
            
            // LinkedIn
            if (contactInfo.linkedin) {
                const linkedinUrl = contactInfo.linkedin.includes('http') ? 
                    contactInfo.linkedin : `https://${contactInfo.linkedin}`;
                contactHtml += `
                    <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer"
                       class="btn btn-outline-info w-100 mb-2" 
                       style="border-color: #0077B5; color: #0077B5;">
                        <i class="fab fa-linkedin me-2"></i>LinkedIn: ${contactInfo.linkedin}
                    </a>
                `;
            }
            
            // Email
            if (contactInfo.email) {
                contactHtml += `
                    <a href="mailto:${contactInfo.email}" 
                       class="btn btn-outline-secondary w-100 mb-2" 
                       style="border-color: #6c757d; color: #6c757d;">
                        <i class="fas fa-envelope me-2"></i>Email: ${contactInfo.email}
                    </a>
                `;
            }
        }
        
        contactHtml += '</div>';
        
        // Обновляем контейнер
        contactContainer.innerHTML = contactHtml;
        console.log('✅ UPDATE_CONTACT_INFO: Контактная информация обновлена');
        
        // Сохраняем в историю и обновляем отображение
        if (hasData) {
            saveContactToHistory(contactInfo);
            renderContactHistory();
        }
    }

    /**
     * Сохраняет контактную информацию в историю (localStorage)
     * @param {Object} contactInfo - Объект с контактной информацией
     */
    function saveContactToHistory(contactInfo) {
        try {
            const storageKey = `contact_history_${sessionId}`;
            let history = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Добавляем новую запись в начало (последняя будет первой)
            const historyEntry = {
                timestamp: new Date().toISOString(),
                communication_where: contactInfo.communication_where || null,
                telegram: contactInfo.telegram || null,
                linkedin: contactInfo.linkedin || null,
                email: contactInfo.email || null
            };
            
            // Проверяем, не является ли это дубликатом последней записи
            if (history.length > 0) {
                const lastEntry = history[0];
                if (JSON.stringify(lastEntry) === JSON.stringify(historyEntry)) {
                    console.log('ℹ️ CONTACT_HISTORY: Пропускаем дубликат');
                    return;
                }
            }
            
            history.unshift(historyEntry);
            
            // Ограничиваем до 50 записей
            if (history.length > 50) {
                history = history.slice(0, 50);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(history));
            console.log(`✅ CONTACT_HISTORY: Сохранено в историю (всего: ${history.length})`);
        } catch (e) {
            console.error('❌ CONTACT_HISTORY: Ошибка сохранения:', e);
        }
    }

    /**
     * Отображает историю контактной информации
     * Объединяет данные из localStorage и бэкенда
     */
    function renderContactHistory() {
        try {
            const historyList = document.getElementById('contactHistoryList');
            const historyCount = document.getElementById('contactHistoryCount');
            
            if (!historyList) {
                console.warn('⚠️ CONTACT_HISTORY: Контейнер истории не найден');
                return;
            }
            
            // Получаем историю из localStorage
            const storageKey = `contact_history_${sessionId}`;
            const localStorageHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Получаем историю из бэкенда (если есть в DOM)
            let backendHistory = [];
            try {
                // Пытаемся получить данные из скрытого элемента или глобальной переменной
                const backendHistoryScript = document.getElementById('backendContactHistory');
                if (backendHistoryScript) {
                    backendHistory = JSON.parse(backendHistoryScript.textContent || '[]');
                } else if (window.contactHistory) {
                    backendHistory = window.contactHistory;
                }
            } catch (e) {
                console.warn('⚠️ CONTACT_HISTORY: Не удалось получить историю с бэкенда:', e);
            }
            
            // Объединяем истории (приоритет у localStorage, так как там более свежие данные)
            // Создаем Map для дедупликации по timestamp
            const historyMap = new Map();
            
            // Сначала добавляем из localStorage (более свежие)
            localStorageHistory.forEach(entry => {
                const key = entry.timestamp;
                if (!historyMap.has(key)) {
                    historyMap.set(key, entry);
                }
            });
            
            // Затем добавляем из бэкенда (если нет в localStorage)
            backendHistory.forEach(entry => {
                const key = entry.timestamp;
                if (!historyMap.has(key)) {
                    historyMap.set(key, entry);
                }
            });
            
            // Сортируем по timestamp (от последнего к старому)
            const history = Array.from(historyMap.values()).sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            }).slice(0, 50); // Ограничиваем до 50 записей
            
            // Обновляем счетчик
            if (historyCount) {
                historyCount.textContent = history.length;
            }
            
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-history fa-2x mb-2"></i>
                        <p class="mb-0 small">История контактов появится здесь</p>
                    </div>
                `;
                return;
            }
            
            // Формируем HTML для истории (от последнего к старому)
            let historyHtml = '';
            history.forEach((entry, index) => {
                const date = new Date(entry.timestamp);
                const dateStr = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                historyHtml += `<div class="contact-history-item mb-2" style="opacity: ${Math.max(0.3, 1 - index * 0.02)}; border-left: 3px solid #0088cc; padding-left: 8px;">`;
                historyHtml += `<small class="text-muted d-block mb-1">${dateStr}</small>`;
                
                // Если заполнено "Где ведется коммуникация", показываем только его
                if (entry.communication_where) {
                    const isLink = entry.communication_where.toLowerCase().includes('http');
                    if (isLink) {
                        historyHtml += `
                            <a href="${entry.communication_where}" target="_blank" rel="noopener noreferrer"
                               class="btn btn-outline-primary btn-sm w-100" 
                               style="border-color: #0088cc; color: #0088cc; font-size: 0.85rem;">
                                <i class="fas fa-comments me-1"></i>${entry.communication_where}
                            </a>
                        `;
                    } else {
                        historyHtml += `
                            <div class="small text-muted">
                                <i class="fas fa-comments me-1"></i>${entry.communication_where}
                            </div>
                        `;
                    }
                } else {
                    // Если "Где ведется коммуникация" не заполнено, показываем остальные поля
                    if (entry.telegram) {
                        historyHtml += `
                            <a href="https://t.me/${entry.telegram}" target="_blank" rel="noopener noreferrer"
                               class="btn btn-outline-primary btn-sm w-100 mb-1" 
                               style="border-color: #0088cc; color: #0088cc; font-size: 0.85rem;">
                                <i class="fab fa-telegram me-1"></i>${entry.telegram}
                            </a>
                        `;
                    }
                    if (entry.linkedin) {
                        const linkedinUrl = entry.linkedin.includes('http') ? 
                            entry.linkedin : `https://${entry.linkedin}`;
                        historyHtml += `
                            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer"
                               class="btn btn-outline-info btn-sm w-100 mb-1" 
                               style="border-color: #0077B5; color: #0077B5; font-size: 0.85rem;">
                                <i class="fab fa-linkedin me-1"></i>${entry.linkedin.length > 30 ? entry.linkedin.substring(0, 30) + '...' : entry.linkedin}
                            </a>
                        `;
                    }
                    if (entry.email) {
                        historyHtml += `
                            <a href="mailto:${entry.email}" 
                               class="btn btn-outline-secondary btn-sm w-100 mb-1" 
                               style="border-color: #6c757d; color: #6c757d; font-size: 0.85rem;">
                                <i class="fas fa-envelope me-1"></i>${entry.email}
                            </a>
                        `;
                    }
                }
                
                historyHtml += `</div>`;
            });
            
            historyList.innerHTML = historyHtml;
            console.log(`✅ CONTACT_HISTORY: Отображено ${history.length} записей`);
        } catch (e) {
            console.error('❌ CONTACT_HISTORY: Ошибка отображения:', e);
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
                    
                    // Обновляем состояние кнопки отправки
                    updateSendButtonState();
                    
                    // Удаляем команду из текста, оставляя только остальной контент
                    textarea.value = val.slice(cmd.length).trimStart();
                    return;
                }
            } else {
                // Если команда удалена из текста, но была установлена ранее через скрытое поле,
                // проверяем, нужно ли сбросить состояние
                if (actionTypeInput && actionTypeInput.value && !val.trim()) {
                    // Если поле пустое и команда была установлена, сбрасываем её
                    actionTypeInput.value = '';
                    if (tagLabel) {
                        tagLabel.style.display = 'none';
                    }
                    updateSendButtonState();
                } else if (actionTypeInput && actionTypeInput.value) {
                    // Если команда установлена в скрытом поле, но не в тексте, обновляем состояние кнопки
                    updateSendButtonState();
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

                        // Обновляем состояние кнопки отправки
                        updateSendButtonState();

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

                            // Обновляем состояние кнопки отправки
                            updateSendButtonState();

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
        
        // Проверка: команда /in требует выбранной кнопки "Интервью"
        if (finalActionType === 'final_interview' || commandUsed === '/in') {
            const interviewButton = document.getElementById('btnInterview');
            const isInterviewSelected = interviewButton && interviewButton.classList.contains('active');
            
            if (!isInterviewSelected) {
                console.warn('⚠️ SUBMIT: Команда /in требует выбора типа встречи "Интервью"');
                alert('Для отправки команды /in необходимо выбрать тип встречи "Интервью" в свитчере выше.');
                // Разблокируем кнопки, если они были заблокированы
                if (sendButton) {
                    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                    sendButton.disabled = false;
                }
                textarea.disabled = false;
                return;
            }
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
        
        // Получаем формат интервью (онлайн/офис)
        let interviewFormat = 'online'; // По умолчанию онлайн
        const formatInput = document.getElementById('interviewFormatInput');
        if (formatInput) {
            interviewFormat = formatInput.value || 'online';
            console.log('✅ SUBMIT: Формат интервью:', interviewFormat);
        }
        
        // AJAX запрос
        const payload = {
            'action_type': finalActionType || actionType,
            'text': text,
            'session_id': sessionId,
            'interview_format': interviewFormat
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
        
        const url = `/google-oauth/api/send-message/`;
        console.log('✅ SUBMIT: URL:', url);
        console.log('✅ SUBMIT: CSRF токен:', csrfToken ? 'найден' : 'не найден');
        
        // Обновляем payload для send_chat_message
        const sendMessagePayload = {
            'message': text,
            'session_id': sessionId
        };
        
        // Если есть распарсенные данные файла, добавляем их
        if (window.parsedFileData) {
            sendMessagePayload.parsed_file_data = window.parsedFileData;
            console.log('✅ SUBMIT: Добавляем распарсенные данные файла');
        }
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(sendMessagePayload),
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
                
                // Обновляем состояние кнопки отправки после очистки
                updateSendButtonState();
                
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
                
                // Обновляем контактную информацию кандидата, если она пришла в ответе
                if (data.candidate_contact_info) {
                    console.log('✅ SUBMIT: Обновляем контактную информацию:', data.candidate_contact_info);
                    updateCandidateContactInfo(data.candidate_contact_info);
                }
                
                // Обновляем страницу после создания кандидата
                if (data.reload_page) {
                    console.log('🔄 SUBMIT: Обновляем страницу после создания кандидата');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000); // Небольшая задержка, чтобы пользователь увидел сообщение
                    return;
                }
                
                // Обрабатываем переадресацию, если вакансия изменилась
                if (data.redirect_url) {
                    if (data.session_id && data.session_id !== sessionId) {
                        console.log('🔄 SUBMIT: Переключаемся на другой чат (сессия изменилась):', data.redirect_url);
                    } else {
                        console.log('🔄 SUBMIT: Переключаемся на другой чат (вакансия определена из сообщения):', data.redirect_url);
                    }
                    // Небольшая задержка перед переадресацией, чтобы пользователь увидел ответ
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 500);
                }
            } else {
                const errorMsg = data.error || 'Ошибка отправки';
                console.error('❌ SUBMIT: Server error:', errorMsg);
                alert(errorMsg);
            }
            
            // Разблокируем кнопки только если не происходит переадресация
            if (!data.redirect_url || (data.session_id && data.session_id === sessionId)) {
                if (sendButton) {
                    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
                    sendButton.disabled = false;
                }
                textarea.disabled = false;
            }
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
    
    // Экспортируем функцию для использования в других скриптах
    window.updateSendButtonState = updateSendButtonState;
    
    // Инициализируем состояние кнопки при загрузке
    updateSendButtonState();
    
    // Загружаем историю контактов при загрузке страницы
    if (typeof renderContactHistory === 'function') {
        renderContactHistory();
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