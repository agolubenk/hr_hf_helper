/**
 * HR Helper - Fixed Layout JavaScript
 * Добавить в backend/static/js/layout.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ =====
    initThemeToggle();
    
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    initMobileMenu();
    
    // ===== TOAST УВЕДОМЛЕНИЯ =====
    initToastNotifications();
    
    // ===== УЛУЧШЕНИЯ UX =====
    initLayoutEnhancements();
});

/**
 * Инициализация переключателя темы
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    if (!themeToggle || !themeIcon) return;
    
    // Проверяем сохраненную тему или системную тему
    const savedTheme = localStorage.getItem('hrhelper-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    // Применяем тему
    setTheme(currentTheme);
    
    // Обработчик клика
    themeToggle.addEventListener('click', function() {
        const newTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('hrhelper-theme', newTheme);
        
        // Добавляем анимацию для кнопки
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
    
    // Слушаем изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('hrhelper-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        body.setAttribute('data-color-scheme', theme);
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Обновляем цвет meta theme-color для мобильных браузеров
        updateMetaThemeColor(theme);
    }
    
    function updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Используем цвета из CSS переменных
        const colors = {
            light: 'rgb(73, 141, 176)', // --color-lime-500
            dark: 'rgb(50, 184, 198)'   // --color-teal-300
        };
        
        metaThemeColor.content = colors[theme];
    }
}

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (!sidebarToggle || !sidebar || !sidebarOverlay) return;
    
    // Открытие/закрытие меню
    sidebarToggle.addEventListener('click', function() {
        const isOpen = sidebar.classList.contains('show');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Закрытие по клику на overlay
    sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('show')) {
            closeMobileMenu();
        }
    });
    
    // Закрытие при клике на ссылку в мобильном режиме
    const sidebarLinks = sidebar.querySelectorAll('.nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                // Добавляем небольшую задержку для визуального фидбека
                setTimeout(closeMobileMenu, 150);
            }
        });
    });
    
    // Закрытие при изменении размера экрана
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
            closeMobileMenu();
        }
    });
    
    function openMobileMenu() {
        sidebar.classList.add('show');
        sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Предотвращаем скролл фона
        
        // Фокус на первую ссылку для доступности
        const firstLink = sidebar.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
    
    function closeMobileMenu() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
        
        // Возвращаем фокус на кнопку меню
        sidebarToggle.focus();
    }
}

/**
 * Инициализация Toast уведомлений
 */
function initToastNotifications() {
    // Инициализируем существующие toast
    const toasts = document.querySelectorAll('.toast');
    const toastInstances = [];
    
    toasts.forEach((toastElement, index) => {
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        
        toastInstances.push(toast);
        
        // Показываем с небольшой задержкой для эффекта
        setTimeout(() => {
            toast.show();
        }, index * 200);
        
        // Добавляем обработчики для звуковых эффектов (опционально)
        toastElement.addEventListener('shown.bs.toast', function() {
            // Здесь можно добавить звуковой эффект
        });
    });
    
    // Функция для создания новых toast программно
    window.showToast = function(message, type = 'info', title = '', duration = 5000) {
        const toastContainer = document.querySelector('.toast-container') || createToastContainer();
        
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div class="toast toast-notification" id="${toastId}" role="alert" data-bs-autohide="true" data-bs-delay="${duration}">
                <div class="toast-header">
                    <i class="fas fa-${getToastIcon(type)} me-2"></i>
                    <strong class="me-auto">${title || getToastTitle(type)}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        
        toast.show();
        
        // Удаляем элемент после скрытия
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
        
        return toast;
    };
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1045';
        document.body.appendChild(container);
        return container;
    }
    
    function getToastIcon(type) {
        const icons = {
            success: 'check-circle text-success',
            error: 'exclamation-circle text-danger',
            warning: 'exclamation-triangle text-warning',
            info: 'info-circle text-info'
        };
        return icons[type] || icons.info;
    }
    
    function getToastTitle(type) {
        const titles = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Предупреждение',
            info: 'Информация'
        };
        return titles[type] || titles.info;
    }
}

/**
 * Дополнительные улучшения UX
 */
function initLayoutEnhancements() {
    // Плавный скролл для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Автоматическое скрытие/показ header при скролле (опционально)
    if (window.innerWidth > 768) { // Только на десктопе
        initHeaderAutoHide();
    }
    
    // Улучшенное поведение dropdown в header
    initHeaderDropdowns();
    
    // Сохранение состояния sidebar (свернут/развернут) для будущих версий
    // initSidebarState();
}

/**
 * Автоматическое скрытие header при скролле вниз
 */
function initHeaderAutoHide() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollTop = 0;
    let isHeaderVisible = true;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Скролл вниз
            if (isHeaderVisible) {
                header.style.transform = 'translateY(-100%)';
                isHeaderVisible = false;
            }
        } else {
            // Скролл вверх
            if (!isHeaderVisible) {
                header.style.transform = 'translateY(0)';
                isHeaderVisible = true;
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
}

/**
 * Улучшенное поведение dropdown в header
 */
function initHeaderDropdowns() {
    const dropdowns = document.querySelectorAll('.header .dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        // Корректируем позицию dropdown menu если он выходит за экран
        toggle.addEventListener('shown.bs.dropdown', function() {
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            if (rect.right > viewportWidth) {
                menu.style.transform = `translateX(-${rect.right - viewportWidth + 10}px)`;
            }
        });
        
        // Сбрасываем позицию при скрытии
        toggle.addEventListener('hidden.bs.dropdown', function() {
            menu.style.transform = '';
        });
    });
}

/**
 * Утилиты для работы с layout
 */
window.HRHelper = window.HRHelper || {};
window.HRHelper.Layout = {
    // Показать/скрыть sidebar программно
    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        }
    },
    
    // Установить заголовок страницы
    setPageTitle: function(title) {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = title;
        }
        document.title = title + ' - HR Helper';
    },
    
    // Показать уведомление
    showNotification: function(message, type = 'info', title = '') {
        if (window.showToast) {
            return window.showToast(message, type, title);
        }
    }
};