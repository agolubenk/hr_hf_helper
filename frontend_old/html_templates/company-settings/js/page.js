// Общие функции для всех приложений
        function showLoading(element) {
            element.innerHTML = '<span class="loading-spinner"></span> Загрузка...';
            element.disabled = true;
        }
        
        function hideLoading(element, originalText) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
        
        function showAlert(message, type = 'info') {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            const container = document.querySelector('.container-fluid');
            container.insertBefore(alertDiv, container.firstChild);
            
            // Автоматически скрыть через 5 секунд
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
        
        // Функциональность многоуровневого сайдбара
        document.addEventListener('DOMContentLoaded', function() {
            // === АДАПТИВНОЕ ОТОБРАЖЕНИЕ ПОЛЬЗОВАТЕЛЯ ===
            const userProfileBtn = document.getElementById('user-profile-btn');
            const userFullText = document.querySelector('.user-full-text');
            const userShortText = document.querySelector('.user-short-text');
            
            if (userProfileBtn && userFullText && userShortText) {
                const fullEmail = userFullText.textContent.trim();
                
                // Извлекаем имя до первой точки или @
                let shortName = fullEmail;
                const dotIndex = fullEmail.indexOf('.');
                const atIndex = fullEmail.indexOf('@');
                
                if (dotIndex > 0 && (atIndex === -1 || dotIndex < atIndex)) {
                    shortName = fullEmail.substring(0, dotIndex);
                } else if (atIndex > 0) {
                    shortName = fullEmail.substring(0, atIndex);
                }
                
                // Капитализируем первую букву
                shortName = shortName.charAt(0).toUpperCase() + shortName.slice(1).toLowerCase();
                
                userShortText.textContent = shortName;
                
                console.log('👤 Адаптивное отображение пользователя:', {
                    fullEmail,
                    shortName
                });
            }
            
            // Проверяем, находимся ли мы на странице "Главная" (чат-помощник)
            const isMainPage = window.location.pathname.includes('/google-oauth/chat/');
            
            // Сначала сворачиваем ВСЕ меню
            const allCollapseElements = document.querySelectorAll('.sidebar .collapse');
            allCollapseElements.forEach(element => {
                element.classList.remove('show');
                const toggle = document.querySelector(`[data-bs-target="#${element.id}"]`);
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Если мы на главной странице (чат-помощник), не разворачиваем никаких меню
            if (isMainPage) {
                // Убираем класс active со всех элементов на главной странице, кроме самой главной
                const allNavLinks = document.querySelectorAll('.sidebar .nav-link');
                allNavLinks.forEach(link => {
                    // Проверяем, не является ли это ссылкой на главную страницу
                    const href = link.getAttribute('href');
                    if (href && !href.includes('/google-oauth/chat/')) {
                        link.classList.remove('active');
                    }
                });
                console.log('🏠 Главная страница: убран класс active со всех элементов, кроме главной');
                return; // Выходим из функции, оставляя все меню свернутыми
            }
            
            // Находим все активные элементы меню
            const activeMenuItems = document.querySelectorAll('.sidebar .nav-link.active');
            
            // Для каждого активного элемента, разворачиваем только родительские меню
            activeMenuItems.forEach(function(activeItem) {
                let currentItem = activeItem.closest('.nav-item');
                
                // Поднимаемся по иерархии и разворачиваем только родительские меню
                while (currentItem) {
                    const parentToggle = currentItem.querySelector('.menu-toggle');
                    if (parentToggle) {
                        const targetId = parentToggle.getAttribute('data-bs-target');
                        const targetElement = document.querySelector(targetId);
                        
                        if (targetElement) {
                            targetElement.classList.add('show');
                            parentToggle.setAttribute('aria-expanded', 'true');
                        }
                    }
                    
                    // Переходим к следующему родительскому элементу
                    currentItem = currentItem.parentElement.closest('.nav-item');
                }
            });
            
            // Обработка кликов по многоуровневому меню
            const sidebarToggles = document.querySelectorAll('.menu-toggle');
            
            sidebarToggles.forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    // Если это ссылка с подменю - предотвратить переход
                    if (this.dataset.bsToggle === 'collapse') {
                        e.preventDefault();
                        
                        // Определяем уровень текущего элемента
                        const currentNavItem = this.closest('.nav-item');
                        const currentLevel = currentNavItem.classList.contains('ms-1') ? 1 : 
                                           currentNavItem.classList.contains('ms-2') ? 2 : 0;
                        
                        // Сворачиваем только меню того же уровня
                        const allCollapses = document.querySelectorAll('.sidebar .collapse');
                        allCollapses.forEach(collapse => {
                            if (collapse.id !== this.dataset.bsTarget.replace('#', '')) {
                                const collapseToggle = document.querySelector(`[data-bs-target="#${collapse.id}"]`);
                                if (collapseToggle) {
                                    const collapseNavItem = collapseToggle.closest('.nav-item');
                                    const collapseLevel = collapseNavItem.classList.contains('ms-1') ? 1 : 
                                                        collapseNavItem.classList.contains('ms-2') ? 2 : 0;
                                    
                                    // Сворачиваем только если это тот же уровень
                                    if (collapseLevel === currentLevel) {
                                        collapse.classList.remove('show');
                                        collapseToggle.setAttribute('aria-expanded', 'false');
                                    }
                                }
                            }
                        });
                        
                        // Переключаем текущее меню
                        const targetId = this.dataset.bsTarget.replace('#', '');
                        const targetElement = document.querySelector(this.dataset.bsTarget);
                        const isExpanded = this.getAttribute('aria-expanded') === 'true';
                        
                        if (isExpanded) {
                            // Сворачиваем
                            targetElement.classList.remove('show');
                            this.setAttribute('aria-expanded', 'false');
                        } else {
                            // Разворачиваем
                            targetElement.classList.add('show');
                            this.setAttribute('aria-expanded', 'true');
                        }
                    }
                });
            });
        });
        
        // ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ - теперь работает везде:
        
        // Функция для обновления favicon в зависимости от темы
        function updateFavicon(theme) {
            const favicon = document.getElementById('favicon');
            if (favicon) {
                // Используем отдельные файлы для каждой темы
                if (theme === 'dark') {
                    // Темная тема: используем светлый логотип
                    favicon.href = '/static/img/logo-light.png';
                } else {
                    // Светлая тема: используем темный логотип
                    favicon.href = '/static/img/logo-dark.png';
                }
            }
        }
        
        // Функция для переключения темы
        function toggleTheme() {
            console.log('🎨 Переключение темы...');
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            console.log('📊 Текущая тема:', currentTheme);
            console.log('🎯 Новая тема:', newTheme);
            
            // Устанавливаем новую тему
            html.setAttribute('data-theme', newTheme);
            console.log('✅ Атрибут data-theme установлен:', html.getAttribute('data-theme'));
            
            // Проверяем, что атрибут действительно установлен
            setTimeout(() => {
                console.log('🔍 Проверка после переключения:', html.getAttribute('data-theme'));
            }, 100);
            
            // Принудительно обновляем CSS переменные
            const root = document.documentElement;
            if (newTheme === 'dark') {
                root.style.setProperty('--color-background', '#0d1117');
                root.style.setProperty('--color-surface', '#161b22');
                root.style.setProperty('--color-text', 'var(--color-luna-400)');
                root.style.setProperty('--color-primary', 'var(--color-pink-400)');
                console.log('🌙 Принудительно установлены темные цвета');
            } else {
                root.style.setProperty('--color-background', '#ffffff');
                root.style.setProperty('--color-surface', '#ffffff');
                root.style.setProperty('--color-text', '#13343b');
                root.style.setProperty('--color-primary', 'var(--color-lime-500)'); // Теперь синий
                console.log('☀️ Принудительно установлены светлые цвета (лайм теперь синий)');
            }
            
            // Сохраняем в localStorage
            localStorage.setItem('theme', newTheme);
            console.log('💾 Тема сохранена в localStorage:', localStorage.getItem('theme'));
            
            // Обновляем иконку
            updateThemeIcon(newTheme);
            
            // Обновляем favicon
            updateFavicon(newTheme);
            
            // Показываем уведомление
            showThemeNotification(newTheme);
        }
        
        // Функция для обновления иконки темы
        function updateThemeIcon(theme) {
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.className = 'fas fa-moon';
                } else {
                    themeIcon.className = 'fas fa-sun';
                }
                console.log('🎨 Иконка обновлена для темы:', theme);
            }
        }
        
        // Функция для показа уведомления о смене темы
        function showThemeNotification(theme) {
            const themeName = theme === 'dark' ? 'Тёмная' : 'Светлая';
            
            // Создаем уведомление
            const notification = document.createElement('div');
            notification.className = 'alert alert-info alert-dismissible fade show position-fixed toast-notification';
            notification.style.cssText = 'bottom: 20px; left: 20px; z-index: 9999; transition: all 0.3s ease;';
            
            notification.innerHTML = `
                <i class="fas fa-${theme === 'dark' ? 'moon' : 'sun'} me-2"></i>
                Переключено на ${themeName} тему
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Добавляем обработчик для кнопки закрытия
            const closeButton = notification.querySelector('.btn-close');
            closeButton.addEventListener('click', function() {
                // Удаляем тост
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    
                    // Пересчитываем позиции оставшихся тостов на основе их реальной высоты
                    const remainingToasts = document.querySelectorAll('.toast-notification');
                    let currentBottom = 20;
                    remainingToasts.forEach((toast) => {
                        toast.style.bottom = `${currentBottom}px`;
                        const toastHeight = toast.offsetHeight;
                        const margin = 10; // отступ между тостами
                        currentBottom += toastHeight + margin;
                    });
                }
            });
            
            // Подсчитываем существующие тосты
            const existingToasts = document.querySelectorAll('.toast-notification');
            
            // Добавляем на страницу сначала
            document.body.appendChild(notification);
            
            // Позиционируем новый тост в самом низу
            notification.style.bottom = '20px';
            
            // Поднимаем все существующие тосты вверх на основе их реальной высоты
            let currentBottom = 20;
            existingToasts.forEach((toast) => {
                const toastHeight = toast.offsetHeight;
                const margin = 10; // отступ между тостами
                currentBottom += toastHeight + margin;
                toast.style.bottom = `${currentBottom}px`;
            });
            
            // Автоматически удаляем через 3 секунды
            setTimeout(function() {
                if (notification.parentNode) {
                    // Удаляем тост
                    notification.parentNode.removeChild(notification);
                    
                    // Пересчитываем позиции оставшихся тостов на основе их реальной высоты
                    const remainingToasts = document.querySelectorAll('.toast-notification');
                    let currentBottom = 20;
                    remainingToasts.forEach((toast) => {
                        toast.style.bottom = `${currentBottom}px`;
                        const toastHeight = toast.offsetHeight;
                        const margin = 10; // отступ между тостами
                        currentBottom += toastHeight + margin;
                    });
                }
            }, 3000);
        }

        // Функция для очистки всех тостов
        function clearAllToasts() {
            const existingToasts = document.querySelectorAll('.toast-notification');
            existingToasts.forEach(toast => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        }

        // Инициализация темы при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Инициализация переключателя темы...');
            
            // Очищаем все старые тосты при загрузке страницы
            clearAllToasts();
            
            // Получаем сохраненную тему или используем системную
            const savedTheme = localStorage.getItem('theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const theme = savedTheme || systemTheme;
            
            console.log('💾 Сохраненная тема:', savedTheme);
            console.log('🖥️ Системная тема:', systemTheme);
            console.log('🎯 Выбранная тема:', theme);
            
            // Устанавливаем тему
            document.documentElement.setAttribute('data-theme', theme);
            console.log('✅ Атрибут data-theme установлен при загрузке:', document.documentElement.getAttribute('data-theme'));
            
            // Проверяем, что атрибут действительно установлен
            setTimeout(() => {
                console.log('🔍 Проверка через 100ms:', document.documentElement.getAttribute('data-theme'));
            }, 100);
            
            // Принудительно обновляем CSS переменные при загрузке
            const root = document.documentElement;
            if (theme === 'dark') {
                root.style.setProperty('--color-background', '#0d1117');
                root.style.setProperty('--color-surface', '#161b22');
                root.style.setProperty('--color-text', 'var(--color-luna-400)');
                root.style.setProperty('--color-primary', 'var(--color-pink-400)');
                console.log('🌙 Принудительно установлены темные цвета при загрузке');
            } else {
                root.style.setProperty('--color-background', '#ffffff');
                root.style.setProperty('--color-surface', '#ffffff');
                root.style.setProperty('--color-text', '#13343b');
                root.style.setProperty('--color-primary', 'var(--color-lime-500)'); // Теперь синий
                console.log('☀️ Принудительно установлены светлые цвета при загрузке (лайм теперь синий)');
            }
            
            // Обновляем иконку
            updateThemeIcon(theme);
            
            // Обновляем favicon
            updateFavicon(theme);
            
            // Добавляем обработчик клика на кнопку переключения темы
            const themeToggle = document.getElementById('themeToggle');
            console.log('🔘 Кнопка переключения темы найдена:', themeToggle);
            if (themeToggle) {
                // Удаляем старые обработчики, если они есть
                themeToggle.removeEventListener('click', toggleTheme);
                // Добавляем новый обработчик
                themeToggle.addEventListener('click', toggleTheme);
                console.log('✅ Обработчик клика добавлен');
                
                // Тестируем клик программно
                console.log('🧪 Тестируем программный клик...');
                setTimeout(() => {
                    console.log('🎯 Атрибут data-theme перед тестом:', document.documentElement.getAttribute('data-theme'));
                }, 500);
            } else {
                console.error('❌ Кнопка переключения темы не найдена!');
            }
            
            // Слушаем изменения системной темы
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                if (!localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    updateThemeIcon(newTheme);
                    updateFavicon(newTheme);
                }
            });
            
            console.log('✅ Инициализация переключателя темы завершена');
            
            // Глобальная функция для тестирования
            window.testThemeToggle = function() {
                console.log('🧪 Тестируем переключение темы...');
                toggleTheme();
            };
        });

document.addEventListener('DOMContentLoaded', function() {
        // Находим кнопку переключения сайдбара (теперь она в HTML)
        function getSidebarToggle() {
            const toggleBtn = document.getElementById('sidebarToggle');
            if (!toggleBtn) {
                console.warn('Кнопка переключения сайдбара не найдена');
            }
            return toggleBtn;
        }
        
        // Создаем кнопку закрытия сайдбара (только для мобильных)
        function createSidebarClose(sidebar) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'sidebar-close';
            closeBtn.innerHTML = '<i class="fas fa-caret-square-left"></i>';
            closeBtn.setAttribute('aria-label', 'Закрыть сайдбар');
            // Добавляем кнопку закрытия только на мобильных устройствах
            if (window.innerWidth <= 992) {
                sidebar.appendChild(closeBtn);
            }
            return closeBtn;
        }
        
        // Создаем overlay для мобильных
        function createSidebarOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            return overlay;
        }
        
        // Применяем классы к существующим элементам
        function setupSidebarStructure() {
            const sidebar = document.querySelector('.col-md-3:first-child') || 
                           document.querySelector('.sidebar') ||
                           document.querySelector('[class*="sidebar"]');
                           
            const mainContent = document.querySelector('.col-md-9:last-child') || 
                               document.querySelector('.main-content') ||
                               document.querySelector('[class*="main"]');
            
            if (sidebar) {
                sidebar.classList.add('sidebar-container');
                
                // На мобильных по умолчанию скрыт
                if (window.innerWidth <= 992) {
                    sidebar.classList.add('hidden');
                }
            }
            
            if (mainContent) {
                mainContent.classList.add('main-content');
            }
            
            return { sidebar, mainContent };
        }
        
        // Передаем текущий namespace в JavaScript
        window.currentNamespace = 'company_settings';
        
        // Инициализация hover меню (версия 2.0 - исправлена логика скрытия)
        function initHoverMenu() {
            const sidebarToggle = document.getElementById('sidebarToggle');
            const hoverMenu = document.getElementById('sidebarHoverMenu');
            const hoverMenuContent = document.getElementById('hoverMenuContent');
            
            if (!sidebarToggle || !hoverMenu || !hoverMenuContent) return;
            
            // Проверяем, является ли устройство мобильным
            function isMobileDevice() {
                return window.innerWidth <= 992; // Bootstrap lg breakpoint
            }
            
            // Если мобильное устройство, отключаем hover меню
            if (isMobileDevice()) {
                console.log('📱 Мобильное устройство обнаружено - hover меню отключено');
                hoverMenu.style.display = 'none';
                hoverMenu.style.pointerEvents = 'none';
                return;
            }
            
            // Проверяем при изменении размера окна
            window.addEventListener('resize', function() {
                if (isMobileDevice()) {
                    hoverMenu.style.display = 'none';
                    hoverMenu.style.pointerEvents = 'none';
                    console.log('📱 Переключение на мобильный режим - hover меню отключено');
                } else {
                    hoverMenu.style.display = 'block';
                    hoverMenu.style.pointerEvents = 'auto';
                    console.log('💻 Переключение на десктопный режим - hover меню включено');
                }
            });
            
            // Создаем структуру hover меню с нуля
            function createHoverMenuStructure() {
                // Очищаем содержимое
                hoverMenuContent.innerHTML = '';
                
                // Создаем основное меню
                const mainNav = document.createElement('ul');
                mainNav.className = 'nav flex-column hover-menu-nav';
                mainNav.style.margin = '0';
                mainNav.style.padding = '0';
                
                // Данные меню (упрощенная версия)
                const menuData = [
                    { title: 'Главная', icon: 'hrhelper-logo', url: '/google-oauth/chat/' },
                    { title: 'Huntflow', icon: 'fas fa-users', url: '/huntflow/' },
                    { 
                        title: 'Google OAuth', 
                        icon: 'fab fa-google', 
                        url: '/google-oauth/',
                        submenu: [
                            { title: 'Календарь', icon: 'fas fa-calendar', url: '/google-oauth/calendar/' },
                            { title: 'Инвайты', icon: 'fas fa-envelope', url: '/google-oauth/invites/' },
                            { title: 'Настройки Scorecard', icon: 'fas fa-folder-tree', url: '/google-oauth/invites/settings/' }
                        ]
                    },
                    { title: 'Gemini AI', icon: 'fas fa-robot', url: '/gemini/' },
                    { 
                        title: 'Вакансии и финансы', 
                        icon: 'fas fa-briefcase', 
                        url: '/vacancies/',
                        submenu: [
                            { title: 'Дашборд', icon: 'fas fa-tachometer-alt', url: '/vacancies/' },
                            { title: 'Вакансии', icon: 'fas fa-list', url: '/vacancies/list/' },
                            { title: 'План найма', icon: 'fas fa-clipboard-list', url: '/hiring-plans/' },
                            { title: 'Зарплатные вилки', icon: 'fas fa-money-bill-wave', url: '/vacancies/salary-ranges/' },
                            { title: 'Грейды, налоги и курсы', icon: 'fas fa-chart-line', url: '/finance/' },
                            { 
                                title: 'Бенчмарки', 
                                icon: 'fas fa-chart-bar', 
                                url: '/finance/benchmarks/',
                                submenu: [
                                    { title: 'Dashboard', icon: 'fas fa-tachometer-alt', url: '/finance/benchmarks/' },
                                    { title: 'Все бенчмарки', icon: 'fas fa-list', url: '/finance/benchmarks/list/' },
                                    { title: 'Настройки', icon: 'fas fa-cog', url: '/finance/benchmarks/settings/' }
                                ]
                            }
                        ]
                    },
                    { 
                        title: 'Интервьюеры', 
                        icon: 'fas fa-user-tie', 
                        url: '/interviewers/',
                        submenu: [
                            { title: 'Интервьюеры', icon: 'fas fa-users', url: '/interviewers/list/' },
                            { title: 'Правила привлечения', icon: 'fas fa-gavel', url: '/interviewers/rules/' }
                        ]
                    },
                    { 
                        title: 'Интеграции', 
                        icon: 'fas fa-plug', 
                        url: '/clickup/',
                        submenu: [
                            { 
                                title: 'ClickUp', 
                                icon: 'fas fa-tasks', 
                                url: '/clickup/',
                                submenu: [
                                    { title: 'Главная', icon: 'fas fa-tachometer-alt', url: '/clickup/' },
                                    { title: 'Списки', icon: 'fas fa-list', url: '/clickup/lists/' },
                                    { title: 'Импорт', icon: 'fas fa-upload', url: '/clickup/import/' },
                                    { title: 'Логи', icon: 'fas fa-history', url: '/clickup/logs/' },
                                    { title: 'Настройки', icon: 'fas fa-cog', url: '/clickup/settings/' }
                                ]
                            },
                            { 
                                title: 'Notion', 
                                icon: 'fas fa-sticky-note', 
                                url: '/notion/',
                                submenu: [
                                    { title: 'Главная', icon: 'fas fa-tachometer-alt', url: '/notion/' },
                                    { title: 'Списки', icon: 'fas fa-list', url: '/notion/lists/' },
                                    { title: 'Импорт', icon: 'fas fa-upload', url: '/notion/import/' },
                                    { title: 'Логи', icon: 'fas fa-history', url: '/notion/logs/' },
                                    { title: 'Настройки', icon: 'fas fa-cog', url: '/notion/settings/' }
                                ]
                            }
                        ]
                    },
                    { title: 'Вики', icon: 'fas fa-book', url: '/wiki/' }
                ];
                
                // Создаем элементы меню
                menuData.forEach((item, index) => {
                    const menuItem = createMenuItem(item, index);
                    mainNav.appendChild(menuItem);
                });
                
                hoverMenuContent.appendChild(mainNav);
                
                // Добавляем разделитель
                const separator = document.createElement('hr');
                separator.style.margin = '16px 0';
                separator.style.borderColor = 'var(--hr-border)';
                separator.style.opacity = '0.5';
                hoverMenuContent.appendChild(separator);
                
                // Добавляем дополнительные ссылки
                const additionalNav = document.createElement('ul');
                additionalNav.className = 'nav flex-column hover-menu-nav';
                additionalNav.style.margin = '0';
                additionalNav.style.padding = '0';
                
                // Определяем URL для админки текущего приложения
                const currentNamespace = window.currentNamespace || '';
                const namespaceToAdmin = {
                    'wiki': 'wiki',
                    'company_settings': 'company_settings',
                    'finance': 'finance',
                    'vacancies': 'vacancies',
                    'hiring_plan': 'hiring_plan',
                    'google_oauth': 'google_oauth',
                    'gemini': 'gemini',
                    'interviewers': 'interviewers',
                    'accounts': 'accounts',
                    'clickup_int': 'clickup_int',
                    'notion_int': 'notion_int',
                    'huntflow': 'huntflow',
                };
                
                const adminAppUrl = currentNamespace && namespaceToAdmin[currentNamespace] 
                    ? `/admin/${namespaceToAdmin[currentNamespace]}/` 
                    : '/admin/';
                
                const additionalItems = [
                    { title: 'Профиль', icon: 'fas fa-user', url: '/accounts/' },
                    { title: 'Интеграции', icon: 'fas fa-plug', url: '/accounts/integrations/' },
                    { title: 'Настройки компании', icon: 'fas fa-building', url: '/company-settings/' },
                    { title: 'Admin-панель', icon: 'fas fa-cog', url: adminAppUrl, isAdmin: true }
                ];
                
                additionalItems.forEach(item => {
                    const menuItem = item.isAdmin ? createAdminMenuItem(item) : createMenuItem(item);
                    additionalNav.appendChild(menuItem);
                });
                
                hoverMenuContent.appendChild(additionalNav);
                
                // Убираем дублирующиеся стрелочки
                removeDuplicateArrows();
                
                console.log('✅ Hover меню создано с нуля');
            }
            
            // Убираем дублирующиеся стрелочки
            function removeDuplicateArrows() {
                const links = hoverMenuContent.querySelectorAll('.nav-link');
                links.forEach(link => {
                    const arrows = link.querySelectorAll('.submenu-arrow');
                    if (arrows.length > 1) {
                        // Оставляем только первую стрелочку
                        for (let i = 1; i < arrows.length; i++) {
                            arrows[i].remove();
                        }
                    }
                    
                    // Также проверяем на дублирующиеся классы chevron
                    const chevrons = link.querySelectorAll('.fa-chevron-down, .fa-chevron-up');
                    if (chevrons.length > 1) {
                        // Оставляем только первую стрелочку
                        for (let i = 1; i < chevrons.length; i++) {
                            chevrons[i].remove();
                        }
                    }
                });
                
                // Дополнительная проверка - убираем все стрелочки кроме первой в каждом элементе
                const allArrows = hoverMenuContent.querySelectorAll('[class*="chevron"]');
                const processedLinks = new Set();
                
                allArrows.forEach(arrow => {
                    const link = arrow.closest('.nav-link');
                    if (link && !processedLinks.has(link)) {
                        processedLinks.add(link);
                        const linkArrows = link.querySelectorAll('[class*="chevron"]');
                        if (linkArrows.length > 1) {
                            // Оставляем только первую стрелочку
                            for (let i = 1; i < linkArrows.length; i++) {
                                linkArrows[i].remove();
                            }
                        }
                    }
                });
                
                console.log('✅ Дублирующиеся стрелочки удалены');
            }
            
            // Создаем элемент меню
            function createMenuItem(item, index = 0) {
                const li = document.createElement('li');
                li.className = 'nav-item';
                
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const submenuId = hasSubmenu ? `hover-submenu-${index}` : '';
                
                const a = document.createElement('a');
                a.className = 'nav-link';
                a.href = item.url;
                
                if (hasSubmenu) {
                    a.setAttribute('data-bs-toggle', 'collapse');
                    a.setAttribute('data-bs-target', `#${submenuId}`);
                    a.setAttribute('aria-expanded', 'false');
                    a.style.cursor = 'pointer';
                }
                
                // Иконка
                if (item.icon === 'hrhelper-logo') {
                    const logo = document.createElement('div');
                    logo.className = 'hrhelper-logo-adaptive';
                    logo.style.width = '20px';
                    logo.style.height = '20px';
                    logo.style.marginRight = '12px';
                    logo.style.flexShrink = '0';
                    a.appendChild(logo);
                } else {
                    const icon = document.createElement('i');
                    icon.className = item.icon + ' me-2';
                    icon.style.width = '20px';
                    icon.style.textAlign = 'center';
                    icon.style.fontSize = '0.875rem';
                    icon.style.marginRight = '12px';
                    icon.style.flexShrink = '0';
                    a.appendChild(icon);
                }
                
                // Текст
                const text = document.createTextNode(item.title);
                a.appendChild(text);
                
                // Стрелочка для подменю
                if (hasSubmenu) {
                    const arrow = document.createElement('i');
                    arrow.className = 'fas fa-chevron-down submenu-arrow ms-auto';
                    arrow.style.fontSize = '0.75rem';
                    arrow.style.transition = 'transform 0.2s ease';
                    a.appendChild(arrow);
                }
                
                li.appendChild(a);
                
                // Подменю
                if (hasSubmenu) {
                    const submenu = document.createElement('div');
                    submenu.className = 'collapse hover-submenu';
                    submenu.id = submenuId;
                    
                    const submenuUl = document.createElement('ul');
                    submenuUl.className = 'nav flex-column';
                    submenuUl.style.margin = '0';
                    submenuUl.style.padding = '0';
                    
                    item.submenu.forEach((subItem, subIndex) => {
                        const subMenuItem = createSubMenuItem(subItem, subIndex);
                        submenuUl.appendChild(subMenuItem);
                    });
                    
                    submenu.appendChild(submenuUl);
                    li.appendChild(submenu);
                }
                
                return li;
            }
            
            // Создаем элемент меню для админ-панели с дополнительной кнопкой
            function createAdminMenuItem(item) {
                const li = document.createElement('li');
                li.className = 'nav-item';
                
                // Обёртка nav-link
                const navLinkWrapper = document.createElement('div');
                navLinkWrapper.className = 'nav-link d-flex align-items-center justify-content-between';
                
                // Основная ссылка для перехода на админку приложения
                const mainLink = document.createElement('a');
                mainLink.href = item.url;
                mainLink.target = '_blank';
                mainLink.className = 'd-flex align-items-center flex-grow-1';
                mainLink.style.color = 'inherit';
                mainLink.style.textDecoration = 'none';
                mainLink.style.minWidth = '0';
                
                // Иконка
                const icon = document.createElement('i');
                icon.className = item.icon + ' me-2';
                icon.style.width = '20px';
                icon.style.textAlign = 'center';
                icon.style.fontSize = '0.875rem';
                icon.style.marginRight = '12px';
                icon.style.flexShrink = '0';
                mainLink.appendChild(icon);
                
                // Текст
                const textSpan = document.createElement('span');
                textSpan.textContent = item.title;
                textSpan.style.whiteSpace = 'nowrap';
                textSpan.style.overflow = 'hidden';
                textSpan.style.textOverflow = 'ellipsis';
                mainLink.appendChild(textSpan);
                
                navLinkWrapper.appendChild(mainLink);
                
                // Кнопка для открытия главной страницы админки (выравнивается как стрелки)
                const adminMainBtn = document.createElement('a');
                adminMainBtn.href = '/admin/';
                adminMainBtn.target = '_blank';
                adminMainBtn.className = 'admin-main-link';
                adminMainBtn.style.zIndex = '1000';
                adminMainBtn.style.color = 'inherit';
                adminMainBtn.style.textDecoration = 'none';
                adminMainBtn.style.display = 'inline-flex';
                adminMainBtn.style.alignItems = 'center';
                adminMainBtn.style.justifyContent = 'center';
                adminMainBtn.style.width = '20px';
                adminMainBtn.style.height = '20px';
                adminMainBtn.style.border = '1px solid rgba(0,0,0,0.2)';
                adminMainBtn.style.borderRadius = '4px';
                adminMainBtn.style.padding = '0';
                adminMainBtn.style.transition = 'all 0.2s';
                adminMainBtn.style.opacity = '0.7';
                adminMainBtn.style.backgroundColor = 'rgba(0,0,0,0.02)';
                adminMainBtn.style.flexShrink = '0';
                adminMainBtn.style.marginLeft = '8px';
                adminMainBtn.title = 'Открыть главную страницу админки в новой вкладке';
                adminMainBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                adminMainBtn.addEventListener('mouseenter', function() {
                    this.style.opacity = '1';
                    this.style.borderColor = 'rgba(0,0,0,0.4)';
                    this.style.backgroundColor = 'rgba(0,0,0,0.05)';
                });
                adminMainBtn.addEventListener('mouseleave', function() {
                    this.style.opacity = '0.7';
                    this.style.borderColor = 'rgba(0,0,0,0.2)';
                    this.style.backgroundColor = 'rgba(0,0,0,0.02)';
                });
                
                const externalIcon = document.createElement('i');
                externalIcon.className = 'fas fa-external-link-alt';
                externalIcon.style.fontSize = '0.65rem';
                externalIcon.style.lineHeight = '1';
                externalIcon.style.margin = '0';
                externalIcon.style.padding = '0';
                externalIcon.style.display = 'block';
                adminMainBtn.appendChild(externalIcon);
                
                navLinkWrapper.appendChild(adminMainBtn);
                li.appendChild(navLinkWrapper);
                
                return li;
            }
            
            // Создаем элемент подменю
            function createSubMenuItem(item, index = 0, level = 1) {
                const li = document.createElement('li');
                li.className = 'nav-item';
                
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const submenuId = hasSubmenu ? `hover-submenu-${index}-${Math.random().toString(36).substr(2, 9)}` : '';
                
                const a = document.createElement('a');
                a.className = 'nav-link';
                a.href = item.url;
                
                // Отступы в зависимости от уровня вложенности
                if (level === 1) {
                    a.style.padding = '10px 20px 10px 40px';
                } else {
                    a.style.padding = '8px 20px 8px 60px';
                }
                
                a.style.fontSize = level === 1 ? '0.8rem' : '0.75rem';
                a.style.color = 'var(--hr-text-muted)';
                a.style.borderLeft = '3px solid transparent';
                a.style.position = 'relative';
                
                if (hasSubmenu) {
                    a.setAttribute('data-bs-toggle', 'collapse');
                    a.setAttribute('data-bs-target', `#${submenuId}`);
                    a.setAttribute('aria-expanded', 'false');
                    a.style.cursor = 'pointer';
                }
                
                // Иконка
                const icon = document.createElement('i');
                icon.className = item.icon;
                icon.style.width = '16px';
                icon.style.marginRight = '8px';
                icon.style.fontSize = '0.75rem';
                a.appendChild(icon);
                
                // Текст
                const text = document.createTextNode(item.title);
                a.appendChild(text);
                
                // Стрелочка для подменю (только если есть подменю)
                if (hasSubmenu) {
                    const arrow = document.createElement('i');
                    arrow.className = 'fas fa-chevron-down submenu-arrow ms-auto';
                    arrow.style.fontSize = '0.75rem';
                    arrow.style.transition = 'transform 0.2s ease';
                    a.appendChild(arrow);
                }
                
                li.appendChild(a);
                
                // Подменю
                if (hasSubmenu) {
                    const submenu = document.createElement('div');
                    submenu.className = 'collapse hover-submenu';
                    submenu.id = submenuId;
                    
                    const submenuUl = document.createElement('ul');
                    submenuUl.className = 'nav flex-column';
                    submenuUl.style.margin = '0';
                    submenuUl.style.padding = '0';
                    
                    item.submenu.forEach((subSubItem, subSubIndex) => {
                        const subSubMenuItem = createSubMenuItem(subSubItem, subSubIndex, level + 1);
                        submenuUl.appendChild(subSubMenuItem);
                    });
                    
                    submenu.appendChild(submenuUl);
                    li.appendChild(submenu);
                }
                
                return li;
            }
            
            // Инициализируем обработчики событий для hover меню
            function initHoverMenuEvents() {
                // Удаляем старые обработчики событий
                const existingElements = hoverMenuContent.querySelectorAll('[data-bs-toggle="collapse"]');
                existingElements.forEach(element => {
                    element.replaceWith(element.cloneNode(true));
                });
                
                // Добавляем новые обработчики событий
                const collapseElements = hoverMenuContent.querySelectorAll('[data-bs-toggle="collapse"]');
                collapseElements.forEach(element => {
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const targetId = this.getAttribute('data-bs-target');
                        const target = document.querySelector(targetId);
                        if (target) {
                            const isCollapsed = target.classList.contains('show');
                            const arrow = this.querySelector('.submenu-arrow');
                            
                            if (isCollapsed) {
                                // Закрываем подменю
                                target.classList.remove('show');
                                this.setAttribute('aria-expanded', 'false');
                                
                                // Поворачиваем стрелочку
                                if (arrow) {
                                    arrow.style.transform = 'rotate(0deg)';
                                }
                                
                                // Закрываем все вложенные подменю
                                const nestedSubmenus = target.querySelectorAll('.hover-submenu.show');
                                nestedSubmenus.forEach(nestedSubmenu => {
                                    nestedSubmenu.classList.remove('show');
                                    const nestedToggle = target.querySelector(`[data-bs-target="#${nestedSubmenu.id}"]`);
                                    if (nestedToggle) {
                                        nestedToggle.setAttribute('aria-expanded', 'false');
                                        const nestedArrow = nestedToggle.querySelector('.submenu-arrow');
                                        if (nestedArrow) {
                                            nestedArrow.style.transform = 'rotate(0deg)';
                                        }
                                    }
                                });
                            } else {
                                // Открываем подменю
                                target.classList.add('show');
                                this.setAttribute('aria-expanded', 'true');
                                
                                // Поворачиваем стрелочку
                                if (arrow) {
                                    arrow.style.transform = 'rotate(180deg)';
                                }
                            }
                        }
                    });
                });
                
                console.log('✅ Обработчики событий инициализированы для', collapseElements.length, 'элементов');
            }
            
            // Синхронизируем активные состояния с основным сайдбаром
            function syncActiveStates() {
                const originalSidebar = document.querySelector('.sidebar');
                if (!originalSidebar) return;
                
                // Получаем текущий URL
                const currentPath = window.location.pathname;
                
                // Находим активные элементы в основном сайдбаре
                const activeLinks = originalSidebar.querySelectorAll('.nav-link.active');
                
                // Синхронизируем активные состояния в hover меню
                const hoverLinks = hoverMenuContent.querySelectorAll('.nav-link');
                hoverLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && currentPath.includes(href.replace(/\/$/, ''))) {
                        link.classList.add('active');
                        
                        // Если это подменю, открываем родительское меню
                        const parentSubmenu = link.closest('.hover-submenu');
                        if (parentSubmenu) {
                            parentSubmenu.classList.add('show');
                            const parentToggle = hoverMenuContent.querySelector(`[data-bs-target="#${parentSubmenu.id}"]`);
                            if (parentToggle) {
                                parentToggle.setAttribute('aria-expanded', 'true');
                            }
                        }
                    } else {
                        link.classList.remove('active');
                    }
                });
                
                console.log('✅ Активные состояния синхронизированы');
            }
            
            // Функция для закрытия всех подменю (для тестирования)
            function closeAllSubmenus() {
                const allSubmenus = hoverMenuContent.querySelectorAll('.hover-submenu.show');
                allSubmenus.forEach(submenu => {
                    submenu.classList.remove('show');
                });
                
                const allToggles = hoverMenuContent.querySelectorAll('[data-bs-toggle="collapse"]');
                allToggles.forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                    const arrow = toggle.querySelector('.submenu-arrow');
                    if (arrow) {
                        arrow.style.transform = 'rotate(0deg)';
                    }
                });
                
                console.log('✅ Все подменю закрыты');
            }
            
                // Создаем структуру при инициализации
                createHoverMenuStructure();
                
                // Инициализируем обработчики событий
                initHoverMenuEvents();
                
                // Синхронизируем активные состояния
                syncActiveStates();
                
                // Добавляем глобальные функции для тестирования
                window.hoverMenuTest = {
                    closeAll: closeAllSubmenus,
                    toggle: function(targetId) {
                        const target = document.querySelector(targetId);
                        if (target) {
                            target.classList.toggle('show');
                            console.log('Подменю', targetId, 'переключено');
                        }
                    },
                    getOpenMenus: function() {
                        const openMenus = hoverMenuContent.querySelectorAll('.hover-submenu.show');
                        console.log('Открытые подменю:', Array.from(openMenus).map(m => m.id));
                        return openMenus;
                    }
                };
            
            // Функция для принудительного закрытия всех подменю в hover меню
            function closeAllHoverSubmenus() {
                const hoverSubmenus = hoverMenuContent.querySelectorAll('.hover-submenu');
                hoverSubmenus.forEach(submenu => {
                    submenu.classList.remove('show');
                });
                
                const hoverToggles = hoverMenuContent.querySelectorAll('[data-bs-toggle="collapse"]');
                hoverToggles.forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                });
            }
            
            // Обновляем hover меню при изменении сайдбара
            const observer = new MutationObserver(function(mutations) {
                let shouldUpdate = false;
                let shouldCheckVisibility = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes') {
                        if (mutation.attributeName === 'class') {
                            // Проверяем изменения классов show/hidden на сайдбаре
                            if (mutation.target.classList.contains('sidebar')) {
                                shouldCheckVisibility = true;
                            }
                            shouldUpdate = true;
                        } else if (mutation.attributeName === 'aria-expanded') {
                            shouldUpdate = true;
                        }
                    }
                });
                
                if (shouldCheckVisibility) {
                    checkSidebarVisibility();
                }
                
                if (shouldUpdate) {
                    setTimeout(() => {
                        // Обновляем только активные состояния, так как структура создается с нуля
                        syncActiveStates();
                    }, 100);
                }
            });
            
            // Наблюдаем за изменениями в сайдбаре
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                observer.observe(sidebar, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['class', 'aria-expanded']
                });
            }
            
            // Синхронизируем состояния при инициализации
            setTimeout(syncActiveStates, 200);
            
            // Принудительно скрываем hover меню при загрузке
            setTimeout(() => {
                if (isSidebarVisible()) {
                    forceHideHoverMenu();
                    console.log('🚀 При загрузке страницы - основной сайдбар видим, скрываем hover меню');
                }
            }, 500);
            
            // Добавляем слушатель на клик по кнопке переключения сайдбара
            const mainToggleBtn = document.getElementById('sidebarToggle');
            if (mainToggleBtn) {
                mainToggleBtn.addEventListener('click', function() {
                    // Задержка для того, чтобы сайдбар успел переключиться
                    setTimeout(() => {
                        checkSidebarVisibility();
                    }, 100);
                });
            }
            
            // Добавляем глобальный слушатель для отслеживания изменений видимости сайдбара
            let lastSidebarState = null;
            
            function checkSidebarVisibility() {
                // Не проверяем на мобильных устройствах
                if (isMobileDevice()) {
                    return;
                }
                
                const isVisible = isSidebarVisible();
                
                // Проверяем только если состояние изменилось
                if (lastSidebarState !== isVisible) {
                    lastSidebarState = isVisible;
                    
                    if (isVisible) {
                        forceHideHoverMenu();
                        console.log('🔄 Основной сайдбар стал видимым - скрываем hover меню');
                    } else {
                        console.log('✅ Показываем hover меню - основной сайдбар скрыт');
                    }
                }
            }
            
            // Принудительная функция скрытия hover меню
            function forceHideHoverMenu() {
                hoverMenu.classList.remove('show');
                hoverMenu.style.display = 'none';
                console.log('🚫 Принудительно скрываем hover меню');
            }
            
            // Проверяем каждые 1000ms (реже, чтобы избежать спама)
            setInterval(checkSidebarVisibility, 1000);
            
            // Также проверяем при изменении размера окна
            window.addEventListener('resize', checkSidebarVisibility);
            
            let hoverTimeout;
            
            // Функция проверки видимости основного сайдбара
            function isSidebarVisible() {
                const sidebar = document.querySelector('.sidebar');
                if (!sidebar) return false;
                
                // Проверяем состояние сайдбара через классы show/hidden
                const isShow = sidebar.classList.contains('show');
                const isHidden = sidebar.classList.contains('hidden');
                const hasWidth = sidebar.offsetWidth > 50; // Минимальная ширина для видимости
                const isInViewport = sidebar.getBoundingClientRect().width > 50;
                
                // На десктопе (ширина > 992px) сайдбар видим по умолчанию, если не скрыт
                const isDesktop = window.innerWidth > 992;
                const isVisibleOnDesktop = isDesktop && !isHidden && hasWidth;
                
                // На мобильных сайдбар видим только если есть класс show
                const isVisibleOnMobile = !isDesktop && isShow && hasWidth;
                
                const isVisible = isVisibleOnDesktop || isVisibleOnMobile;
                
                return isVisible;
            }
            
            // Показываем меню при наведении на кнопку
            sidebarToggle.addEventListener('mouseenter', function() {
                // Не работаем на мобильных устройствах
                if (isMobileDevice()) {
                    return;
                }
                
                clearTimeout(hoverTimeout);
                
                // Принудительно скрываем hover меню
                hoverMenu.classList.remove('show');
                hoverMenu.style.display = 'none';
                
                // Проверяем видимость основного сайдбара
                if (!isSidebarVisible()) {
                    console.log('✅ Показываем hover меню - основной сайдбар скрыт');
                    hoverMenu.style.display = 'block';
                    hoverMenu.classList.add('show');
                } else {
                    console.log('❌ Скрываем hover меню - основной сайдбар видим');
                    forceHideHoverMenu();
                }
            });
            
            // Скрываем меню при уходе с кнопки (с задержкой)
            sidebarToggle.addEventListener('mouseleave', function() {
                // Не работаем на мобильных устройствах
                if (isMobileDevice()) {
                    return;
                }
                
                hoverTimeout = setTimeout(() => {
                    hoverMenu.classList.remove('show');
                }, 100);
            });
            
            // Показываем меню при наведении на само меню
            hoverMenu.addEventListener('mouseenter', function() {
                // Не работаем на мобильных устройствах
                if (isMobileDevice()) {
                    return;
                }
                
                clearTimeout(hoverTimeout);
                
                // Проверяем видимость основного сайдбара
                if (!isSidebarVisible()) {
                    hoverMenu.classList.add('show');
                } else {
                    hoverMenu.classList.remove('show');
                }
            });
            
            // Скрываем меню при уходе с меню
            hoverMenu.addEventListener('mouseleave', function() {
                // Не работаем на мобильных устройствах
                if (isMobileDevice()) {
                    return;
                }
                
                hoverTimeout = setTimeout(() => {
                    hoverMenu.classList.remove('show');
                }, 100);
            });
            
            // Скрываем меню при клике вне его
            document.addEventListener('click', function(event) {
                if (!sidebarToggle.contains(event.target) && !hoverMenu.contains(event.target)) {
                    hoverMenu.classList.remove('show');
                }
            });
            
            // Кнопка раскрытия основного сайдбара
            const expandSidebarBtn = document.getElementById('expandSidebarBtn');
            if (expandSidebarBtn) {
                expandSidebarBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Раскрываем основной сайдбар
                    const mainSidebar = document.querySelector('.sidebar');
                    if (mainSidebar) {
                        mainSidebar.classList.remove('hidden');
                        mainSidebar.classList.add('show');
                        
                        // Обновляем стили основного контента
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            mainContent.classList.remove('sidebar-hidden');
                            mainContent.style.marginLeft = '240px';
                            mainContent.style.width = 'calc(100% - 240px)';
                        }
                        
                        // Устанавливаем состояние "unpinned" и показываем иконку pin
                        localStorage.setItem('sidebarState', 'unpinned');
                        const toggleBtn = document.getElementById('sidebarToggle');
                        if (toggleBtn) {
                            toggleBtn.className = 'fas fa-map-pin sidebar-toggle';
                            toggleBtn.setAttribute('title', 'Закрепить сайдбар');
                        }
                        
                        console.log('📂 Раскрытие основного сайдбара из hover меню (незакреплен)');
                    }
                    
                    // Скрываем hover меню
                    forceHideHoverMenu();
                });
            }
        }
        
        // Инициализация
        const { sidebar, mainContent } = setupSidebarStructure();
        
        if (!sidebar) {
            console.warn('Сайдбар не найден');
            return;
        }
        
        // Инициализируем hover меню
        initHoverMenu();
        
        // Находим элементы управления
        const toggleBtn = getSidebarToggle();
        const closeBtn = createSidebarClose(sidebar);
        const overlay = createSidebarOverlay();
        
        // Проверяем, что кнопка переключения найдена
        if (!toggleBtn) {
            console.warn('Кнопка переключения сайдбара не найдена, функциональность отключена');
            return;
        }
        
        // Состояние сайдбара
        let sidebarVisible = window.innerWidth > 992;
        let isToggling = false; // Флаг для предотвращения конфликтов
        
        // Инициализируем состояние на основе сохраненных данных
        function initializeSidebarState() {
            const savedState = localStorage.getItem('sidebarState');
            if (savedState) {
                sidebarVisible = savedState === 'visible';
                console.log('🔍 Инициализация состояния сайдбара из localStorage:', savedState);
            } else {
                console.log('🔍 Используем состояние сайдбара по умолчанию для размера экрана:', window.innerWidth > 992 ? 'visible' : 'hidden');
            }
        }
        
        // Вызываем инициализацию
        initializeSidebarState();
        
        // Обновленная функция переключения сайдбара
        function toggleSidebar() {
            if (isToggling) return; // Предотвращаем повторные вызовы
            isToggling = true;
            
            // Проверяем, если текущая иконка - pin (fa-map-pin), то фиксируем сайдбар
            if (toggleBtn.classList.contains('fa-map-pin')) {
                // Фиксируем сайдбар
                sidebarVisible = true;
                localStorage.setItem('sidebarState', 'visible');
                toggleBtn.className = 'fas fa-caret-square-left sidebar-toggle';
                toggleBtn.setAttribute('title', 'Свернуть сайдбар');
                console.log('📌 Сайдбар закреплен');
                isToggling = false;
                return;
            }
            
            sidebarVisible = !sidebarVisible;
            
            // Сохраняем состояние сайдбара в localStorage
            localStorage.setItem('sidebarState', sidebarVisible ? 'visible' : 'hidden');
            console.log('💾 Состояние сайдбара сохранено:', sidebarVisible ? 'visible' : 'hidden');
            
            if (sidebarVisible) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('show');
                if (mainContent) {
                    mainContent.classList.remove('sidebar-hidden');
                    // Принудительно устанавливаем стили
                    mainContent.style.marginLeft = '240px';
                    mainContent.style.width = 'calc(100% - 240px)';
                }
                
                // На мобильных показываем overlay
                if (window.innerWidth <= 992) {
                    overlay.classList.add('show');
                }
                
                toggleBtn.className = 'fas fa-caret-square-left sidebar-toggle';
                toggleBtn.setAttribute('title', 'Свернуть сайдбар');
            } else {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('show');
                if (mainContent) {
                    mainContent.classList.add('sidebar-hidden');
                    // Принудительно устанавливаем стили
                    mainContent.style.marginLeft = '0';
                    mainContent.style.width = '100%';
                }
                
                overlay.classList.remove('show');
                toggleBtn.className = 'fas fa-caret-square-right sidebar-toggle';
                toggleBtn.setAttribute('title', 'Развернуть сайдбар');
            }
            
            // Принудительно перерисовываем layout
            setTimeout(() => {
                // Просто принудительно обновляем стили без вызова resize
                if (mainContent) {
                    mainContent.style.display = 'none';
                    mainContent.offsetHeight; // Принудительная перерисовка
                    mainContent.style.display = '';
                }
                isToggling = false; // Сбрасываем флаг
            }, 300);
        }
        
        // Функция скрытия сайдбара
        function hideSidebar() {
            if (isToggling) return; // Предотвращаем повторные вызовы
            isToggling = true;
            
            sidebarVisible = false;
            
            // Сохраняем состояние сайдбара в localStorage
            localStorage.setItem('sidebarState', 'hidden');
            console.log('💾 Состояние сайдбара сохранено: hidden');
            sidebar.classList.add('hidden');
            sidebar.classList.remove('show');
            if (mainContent) {
                mainContent.classList.add('sidebar-hidden');
                // Принудительно устанавливаем стили
                mainContent.style.marginLeft = '0';
                mainContent.style.width = '100%';
            }
            overlay.classList.remove('show');
            toggleBtn.className = 'fas fa-caret-square-right sidebar-toggle';
            toggleBtn.setAttribute('title', 'Развернуть сайдбар');
            
            // Принудительно перерисовываем layout
            setTimeout(() => {
                // Просто принудительно обновляем стили без вызова resize
                if (mainContent) {
                    mainContent.style.display = 'none';
                    mainContent.offsetHeight; // Принудительная перерисовка
                    mainContent.style.display = '';
                }
                isToggling = false; // Сбрасываем флаг
            }, 300);
        }
        
        // Функция восстановления состояния сайдбара
        function restoreSidebarState() {
            const savedState = localStorage.getItem('sidebarState');
            if (savedState) {
                console.log('🔄 Восстанавливаем состояние сайдбара:', savedState);
                
                if (savedState === 'hidden') {
                    sidebarVisible = false;
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('show');
                    if (mainContent) {
                        mainContent.classList.add('sidebar-hidden');
                        mainContent.style.marginLeft = '0';
                        mainContent.style.width = '100%';
                    }
                    overlay.classList.remove('show');
                    toggleBtn.className = 'fas fa-caret-square-right sidebar-toggle';
                    toggleBtn.setAttribute('title', 'Развернуть сайдбар');
                } else if (savedState === 'visible') {
                    sidebarVisible = true;
                    sidebar.classList.remove('hidden');
                    sidebar.classList.add('show');
                    if (mainContent) {
                        mainContent.classList.remove('sidebar-hidden');
                        mainContent.style.marginLeft = '240px';
                        mainContent.style.width = 'calc(100% - 240px)';
                    }
                    toggleBtn.className = 'fas fa-caret-square-left sidebar-toggle';
                    toggleBtn.setAttribute('title', 'Свернуть сайдбар');
                } else if (savedState === 'unpinned') {
                    sidebarVisible = true;
                    sidebar.classList.remove('hidden');
                    sidebar.classList.add('show');
                    if (mainContent) {
                        mainContent.classList.remove('sidebar-hidden');
                        mainContent.style.marginLeft = '240px';
                        mainContent.style.width = 'calc(100% - 240px)';
                    }
                    toggleBtn.className = 'fas fa-map-pin sidebar-toggle';
                    toggleBtn.setAttribute('title', 'Закрепить сайдбар');
                }
            } else {
                console.log('🆕 Нет сохраненного состояния сайдбара, используем значение по умолчанию');
            }
        }
        
        // События
        toggleBtn.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', hideSidebar);
        overlay.addEventListener('click', hideSidebar);
        
        // Восстанавливаем состояние сайдбара при загрузке
        restoreSidebarState();
        
        // Добавляем глобальные функции для управления состоянием сайдбара
        window.sidebarState = {
            reset: function() {
                localStorage.removeItem('sidebarState');
                console.log('🗑️ Состояние сайдбара сброшено');
                // Перезагружаем страницу для применения состояния по умолчанию
                location.reload();
            },
            get: function() {
                return localStorage.getItem('sidebarState');
            },
            set: function(state) {
                if (state === 'visible' || state === 'hidden') {
                    localStorage.setItem('sidebarState', state);
                    console.log('💾 Состояние сайдбара установлено:', state);
                } else {
                    console.warn('❌ Неверное состояние сайдбара. Используйте "visible" или "hidden"');
                }
            }
        };
        
        // Обработка изменения размера окна
        window.addEventListener('resize', function() {
            if (isToggling) return; // Предотвращаем конфликты во время переключения
            
            if (window.innerWidth > 992) {
                // Десктоп: восстанавливаем сохраненное состояние сайдбара
                const savedState = localStorage.getItem('sidebarState');
                if (savedState === 'hidden') {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('show');
                    if (mainContent) {
                        mainContent.classList.add('sidebar-hidden');
                        mainContent.style.marginLeft = '0';
                        mainContent.style.width = '100%';
                    }
                    sidebarVisible = false;
                    toggleBtn.className = 'fas fa-caret-square-right sidebar-toggle';
                    toggleBtn.setAttribute('title', 'Развернуть сайдбар');
                } else {
                    sidebar.classList.remove('hidden');
                    sidebar.classList.add('show');
                    if (mainContent) {
                        mainContent.classList.remove('sidebar-hidden');
                        mainContent.style.marginLeft = '240px';
                        mainContent.style.width = 'calc(100% - 240px)';
                    }
                    sidebarVisible = true;
                    // Проверяем состояние, чтобы показать правильную иконку
                    const savedState = localStorage.getItem('sidebarState');
                    if (savedState === 'unpinned') {
                        toggleBtn.className = 'fas fa-map-pin sidebar-toggle';
                        toggleBtn.setAttribute('title', 'Закрепить сайдбар');
                    } else {
                        toggleBtn.className = 'fas fa-caret-square-left sidebar-toggle';
                        toggleBtn.setAttribute('title', 'Свернуть сайдбар');
                    }
                }
                overlay.classList.remove('show');
                
                // Убираем кнопку закрытия на десктопе
                const existingCloseBtn = sidebar.querySelector('.sidebar-close');
                if (existingCloseBtn) {
                    existingCloseBtn.remove();
                }
            } else {
                // Мобильный: скрываем сайдбар
                if (sidebarVisible) {
                    overlay.classList.add('show');
                    sidebar.classList.add('show');
                } else {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                }
                
                if (mainContent) {
                    mainContent.classList.add('sidebar-hidden');
                    // Принудительно устанавливаем стили
                    mainContent.style.marginLeft = '0';
                    mainContent.style.width = '100%';
                }
                
                // Добавляем кнопку закрытия на мобильных
                const existingCloseBtn = sidebar.querySelector('.sidebar-close');
                if (!existingCloseBtn) {
                    const newCloseBtn = createSidebarClose(sidebar);
                    newCloseBtn.addEventListener('click', hideSidebar);
                }
            }
        });
        
        // Устанавливаем правильное начальное состояние
        if (window.innerWidth <= 992) {
            hideSidebar();
        } else {
            toggleBtn.className = 'fas fa-caret-square-left sidebar-toggle';
            toggleBtn.setAttribute('title', 'Свернуть сайдбар');
            // Принудительно устанавливаем стили для десктопа
            if (mainContent) {
                mainContent.style.marginLeft = '240px';
                mainContent.style.width = 'calc(100% - 240px)';
            }
        }
    });
