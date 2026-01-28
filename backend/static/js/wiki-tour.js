/**
 * Intro.js Tour для Wiki системы HR Helper
 * Путеводитель по основным разделам Wiki с открытием страниц в новой вкладке
 */

// Тур для списка страниц Wiki
function initWikiListTour() {
    var intro = introJs();
    
    var steps = [];
    
    // Шаг 1: Кнопки действий
    if (document.querySelector('#start-quick-tour-btn')) {
        steps.push({
            element: '#start-quick-tour-btn',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Быстрый старт</h4><p>Нажмите кнопку "Быстрый старт" для интерактивного тура по всей системе. Тур откроет примеры страниц и реальные настройки в новых вкладках.</p></div>',
            position: 'bottom'
        });
    }
    
    // Шаг 2: Поиск (если есть)
    if (document.querySelector('input[name="q"]')) {
        steps.push({
            element: 'input[name="q"]',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Поиск</h4><p>Используйте поиск для быстрого нахождения нужной информации по названию или содержимому страниц.</p></div>',
            position: 'bottom'
        });
    }
    
    // Шаг 3: Теги (если есть)
    var tagsCard = document.querySelector('.card .badge');
    if (tagsCard) {
        steps.push({
            element: '.card .badge',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Фильтрация по тегам</h4><p>Используйте теги для быстрой фильтрации страниц. Кликните на тег, чтобы увидеть все связанные страницы.</p></div>',
            position: 'bottom'
        });
    }
    
    // Шаг 4: Страницы
    var pageCard = document.querySelector('.card.h-100');
    if (pageCard) {
        steps.push({
            element: '.card.h-100',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Страницы Wiki</h4><p>Страницы организованы по категориям: Введение, Архитектура, Настройка, Использование, Интеграции.</p><p><strong>Рекомендация:</strong> Начните с раздела "Введение" и "Настройка".</p></div>',
            position: 'top'
        });
    }
    
    // Если нет шагов, создаем простой информационный тур
    if (steps.length === 0) {
        steps.push({
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Добро пожаловать в Wiki!</h4><p>Это раздел документации системы HR Helper. Здесь вы найдете все руководства и инструкции по работе с системой.</p></div>'
        });
    }
    
    intro.setOptions({
        tooltipClass: 'customIntrojsTooltip',
        steps: steps,
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: true,
        exitOnEsc: true,
        nextLabel: 'Далее →',
        prevLabel: '← Назад',
        skipLabel: 'Пропустить',
        doneLabel: 'Готово',
        tooltipPosition: 'bottom',
        positionPrecedence: ['bottom', 'top', 'right', 'left'],
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 50
    });
    
    // Обработка ошибок при запуске тура
    intro.onbeforechange(function(targetElement) {
        // Проверяем, что элемент существует перед переходом
        if (targetElement && !document.body.contains(targetElement)) {
            console.warn('Элемент тура не найден на странице, пропускаем шаг');
            return false;
        }
    });
    
    intro.oncomplete(function() {
        localStorage.setItem('wiki-list-tour-completed', 'true');
    });
    
    intro.onexit(function() {
        localStorage.setItem('wiki-list-tour-completed', 'true');
    });
    
    return intro;
}

// Тур для детальной страницы Wiki
function initWikiDetailTour() {
    var intro = introJs();
    
    // Проверяем наличие элементов перед созданием тура
    var hasBadges = document.querySelector('.card-body .badge') !== null;
    var relatedPagesCard = Array.from(document.querySelectorAll('.card')).find(function(card) {
        var h6 = card.querySelector('h6');
        return h6 && h6.textContent.includes('Связанные страницы');
    });
    var hasRelatedPages = relatedPagesCard !== undefined;
    
    var steps = [];
    
    // Шаг 1: Заголовок и кнопки действий (если есть)
    if (document.querySelector('.card-header .d-flex')) {
        steps.push({
            element: '.card-header .d-flex',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Навигация по странице</h4><p>Здесь вы можете:</p><ul><li>Запустить тур "Быстрый старт" для знакомства с системой</li><li>Использовать "Путеводитель" для изучения текущей страницы</li><li>Редактировать страницу (если у вас есть права)</li></ul></div>',
            position: 'bottom'
        });
    }
    
    // Шаг 2: Теги и категории (если есть)
    if (hasBadges) {
        steps.push({
            element: '.card-body .badge:first-of-type',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Теги и категории</h4><p>Теги помогают найти связанные материалы. Кликните на тег, чтобы увидеть все страницы с этим тегом.</p><p><strong>Совет:</strong> Используйте теги для быстрой навигации по документации.</p></div>',
            position: 'bottom'
        });
    }
    
    // Шаг 3: Основное содержимое
    if (document.querySelector('#wiki-content-md')) {
        steps.push({
            element: '#wiki-content-md',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Содержимое страницы</h4><p>Здесь отображается основное содержание страницы с Markdown разметкой.</p><p><strong>Полезно знать:</strong></p><ul><li>Ссылки в тексте ведут на другие страницы Wiki</li><li>Вы можете использовать поиск для быстрого нахождения информации</li><li>Все страницы организованы по категориям</li></ul></div>',
            position: 'top'
        });
    } else if (document.querySelector('.card-body')) {
        steps.push({
            element: '.card-body',
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Содержимое страницы</h4><p>Здесь отображается основное содержание страницы. Используйте ссылки для перехода к связанным разделам.</p></div>',
            position: 'top'
        });
    }
    
    // Шаг 4: Связанные страницы (если есть)
    if (hasRelatedPages && relatedPagesCard) {
        // Используем ID или класс для точного нахождения элемента
        var relatedCardId = relatedPagesCard.id || null;
        var selector = relatedCardId ? '#' + relatedCardId : '.col-lg-3 .card:last-of-type';
        
        steps.push({
            element: selector,
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Связанные страницы</h4><p>В боковой панели вы найдете ссылки на связанные страницы, которые могут быть полезны для изучения системы.</p><p><strong>Совет:</strong> Изучайте связанные страницы для полного понимания функциональности.</p></div>',
            position: 'left'
        });
    }
    
    // Если нет шагов, создаем простой информационный тур
    if (steps.length === 0) {
        steps.push({
            intro: '<div style="text-align: left;"><h4 style="margin-top: 0;">Добро пожаловать!</h4><p>Это страница документации Wiki. Здесь вы найдете всю информацию о системе HR Helper.</p><p>Используйте навигацию выше для перехода между разделами.</p></div>'
        });
    }
    
    intro.setOptions({
        tooltipClass: 'customIntrojsTooltip',
        steps: steps,
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: true, // Разрешаем выход по клику на overlay
        exitOnEsc: true,
        nextLabel: 'Далее →',
        prevLabel: '← Назад',
        skipLabel: 'Пропустить',
        doneLabel: 'Готово',
        tooltipPosition: 'bottom',
        positionPrecedence: ['bottom', 'top', 'right', 'left'],
        disableInteraction: false, // Разрешаем взаимодействие с элементами
        scrollToElement: true, // Автоматически прокручиваем к элементу
        scrollPadding: 50 // Отступ при прокрутке
    });
    
    // Обработка ошибок при запуске тура
    intro.onbeforechange(function(targetElement) {
        // Проверяем, что элемент существует перед переходом
        if (targetElement && !document.body.contains(targetElement)) {
            console.warn('Элемент тура не найден на странице, пропускаем шаг');
            return false;
        }
    });
    
    intro.oncomplete(function() {
        localStorage.setItem('wiki-detail-tour-completed', 'true');
    });
    
    intro.onexit(function() {
        localStorage.setItem('wiki-detail-tour-completed', 'true');
    });
    
    return intro;
}

// Главный тур для быстрого старта с открытием страниц
function initQuickStartTour() {
    var intro = introJs();
    var currentStep = 0;
    var openedPages = {}; // Отслеживаем открытые страницы, чтобы не открывать повторно
    
    intro.setOptions({
        tooltipClass: 'customIntrojsTooltip',
        steps: [
            {
                intro: '<div style="text-align: left; max-width: 100%;"><h4 style="margin-top: 0;">Добро пожаловать в HR Helper!</h4><p>Этот интерактивный тур поможет вам быстро начать работу с системой.</p><p><strong>Как это работает:</strong></p><ul style="margin: 10px 0;"><li>На каждом шаге вы увидите описание раздела</li><li>Автоматически откроется страница-пример с демонстрационными данными</li><li>Также откроется реальная страница настроек для работы</li><li>Все страницы открываются в новых вкладках</li></ul><p style="margin-bottom: 0;">Готовы начать? Нажмите "Далее"!</p></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>📚 Раздел Wiki</h4><p>В разделе Wiki вы найдете всю документацию по системе HR Helper.</p><p><strong>Рекомендации:</strong></p><ul><li>Начните с раздела "Введение"</li><li>Изучите раздел "Настройка" для первичной конфигурации</li><li>Используйте поиск для быстрого нахождения информации</li></ul><p><strong>Сейчас откроется список страниц Wiki в новой вкладке.</strong></p></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>🏢 Настройки компании</h4><p>Первым делом настройте базовую информацию о компании.</p><p><strong>Что нужно настроить:</strong></p><ul><li>Название компании</li><li>Основной календарь Google</li><li>Грейды (Junior, Middle, Senior, Lead)</li><li>Оргструктуру компании</li></ul><p><strong>Важно:</strong> Это основа для работы всех модулей системы.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример с демонстрационными данными</li><li>Реальная страница настроек компании</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>👤 Профиль пользователя</h4><p>Настройте свой профиль для полноценной работы с системой.</p><p><strong>Что нужно настроить:</strong></p><ul><li>Google OAuth для работы с календарем</li><li>Telegram для связи с кандидатами</li><li>API ключи для интеграций (Gemini, Huntflow и др.)</li></ul><p><strong>Важно:</strong> Без Google OAuth вы не сможете создавать инвайты и управлять календарем.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример профиля</li><li>Реальная страница настроек профиля</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>💰 Финансовый модуль</h4><p>Настройте финансовые параметры для работы с зарплатными вилками.</p><p><strong>Что нужно настроить:</strong></p><ul><li>Зарплатные вилки по грейдам и специализациям</li><li>Курсы валют (обновляются автоматически)</li><li>Настройки для расчета зарплат</li></ul><p><strong>Важно:</strong> Зарплатные вилки используются при создании вакансий.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример финансов</li><li>Реальная страница финансового модуля</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>💼 Вакансии</h4><p>Создайте вакансии для начала процесса найма.</p><p><strong>Что можно делать:</strong></p><ul><li>Создавать новые вакансии</li><li>Указывать зарплатные вилки из финансового модуля</li><li>Назначать рекрутеров</li><li>Синхронизировать с Huntflow</li></ul><p><strong>Важно:</strong> Вакансии - это центральный элемент системы найма.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример вакансий</li><li>Реальная страница управления вакансиями</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>📅 Google Calendar</h4><p>Используйте Google Calendar для автоматизации работы с кандидатами.</p><p><strong>Возможности:</strong></p><ul><li>Создание инвайтов для собеседований</li><li>Управление слотами для интервью</li><li>Автоматическая синхронизация с календарем</li><li>Работа через Chat-бота</li></ul><p><strong>Важно:</strong> Требуется подключение Google OAuth в профиле.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример календаря</li><li>Реальная страница управления календарем</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>👥 Интервьюеры</h4><p>Настройте базу интервьюеров для автоматизации процесса найма.</p><p><strong>Что нужно настроить:</strong></p><ul><li>Базу интервьюеров с их специализациями</li><li>Правила привлечения интервьюеров</li><li>Грейды, с которыми работает каждый интервьюер</li></ul><p><strong>Важно:</strong> Правила определяют, кто будет проводить интервью для каждой вакансии.</p><p><strong>Сейчас откроется:</strong></p><ul><li>Страница-пример интервьюеров</li><li>Реальная страница управления интервьюерами</li></ul></div>'
            },
            {
                intro: '<div style="text-align: left;"><h4>🎉 Поздравляем!</h4><p>Вы успешно прошли базовый тур по системе HR Helper.</p><p><strong>Что дальше?</strong></p><ul><li>Все примеры страниц и реальные настройки открыты в новых вкладках</li><li>Начните с настройки компании и профиля</li><li>Изучите документацию в Wiki</li><li>Создайте первую вакансию</li></ul><p><strong>Полезные ссылки:</strong></p><ul><li>Wiki - полная документация системы</li><li>Chat-бот - для работы с кандидатами через AI</li><li>Метрики - для отслеживания процесса найма</li></ul><p>Удачи в работе с HR Helper! 🚀</p></div>'
            }
        ],
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        nextLabel: 'Далее →',
        prevLabel: '← Назад',
        skipLabel: 'Пропустить тур',
        doneLabel: 'Завершить',
        tooltipPosition: 'bottom',
        positionPrecedence: ['bottom', 'top', 'right', 'left']
    });
    
    // Открываем страницы при переходе на соответствующие шаги с небольшой задержкой
    intro.onafterchange(function(targetElement) {
        currentStep = intro._currentStep;
        
        // Массив страниц-примеров для тура
        var tourExamplePages = [
            null, // Шаг 0 - приветствие
            '/wiki/', // Шаг 1 - Wiki (список страниц)
            '/wiki/tour/company-settings/', // Шаг 2 - пример настроек компании
            '/wiki/tour/user-profile/', // Шаг 3 - пример профиля пользователя
            '/wiki/tour/finance/', // Шаг 4 - пример финансов
            '/wiki/tour/vacancies/', // Шаг 5 - пример вакансий
            '/wiki/tour/google-oauth/', // Шаг 6 - пример Google Calendar
            '/wiki/tour/interviewers/', // Шаг 7 - пример интервьюеров
            null, // Шаг 8 - завершение
        ];
        
        // Массив реальных страниц настроек для открытия в новой вкладке
        var tourSettingsPages = [
            null, // Шаг 0 - приветствие
            null, // Шаг 1 - Wiki (не нужна реальная страница)
            '/company-settings/basic/', // Шаг 2 - настройки компании
            '/accounts/profile/', // Шаг 3 - профиль пользователя
            '/finance/', // Шаг 4 - финансы
            '/vacancies/list/', // Шаг 5 - вакансии
            '/google-oauth/', // Шаг 6 - Google Calendar
            '/interviewers/', // Шаг 7 - интервьюеры
            null, // Шаг 8 - завершение
        ];
        
        // Открываем страницы с небольшой задержкой, чтобы пользователь успел прочитать описание
        setTimeout(function() {
            // Открываем страницу-пример, если она есть
            if (tourExamplePages[currentStep] && !openedPages['example_' + currentStep]) {
                try {
                    window.open(tourExamplePages[currentStep], '_blank');
                    openedPages['example_' + currentStep] = true;
                } catch (e) {
                    console.warn('Не удалось открыть страницу-пример:', e);
                }
            }
            
            // Открываем реальную страницу настроек, если она есть
            if (tourSettingsPages[currentStep] && !openedPages['settings_' + currentStep]) {
                try {
                    window.open(tourSettingsPages[currentStep], '_blank');
                    openedPages['settings_' + currentStep] = true;
                } catch (e) {
                    console.warn('Не удалось открыть страницу настроек:', e);
                }
            }
        }, 500); // Задержка 500мс для чтения описания
    });
    
    intro.oncomplete(function() {
        localStorage.setItem('wiki-quick-start-tour-completed', 'true');
        // Скрываем информационный баннер, если он есть
        var banner = document.getElementById('quick-start-banner');
        if (banner) {
            banner.style.display = 'none';
        }
        // Показываем финальное сообщение
        setTimeout(function() {
            // Создаем красивое уведомление вместо alert
            var notification = document.createElement('div');
            notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
            notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
            notification.innerHTML = '<h5 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Тур завершен!</h5><p class="mb-0">Все страницы открыты в новых вкладках. Начните с настройки компании и профиля.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
            document.body.appendChild(notification);
            // Автоматически скрываем через 5 секунд
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.classList.remove('show');
                    setTimeout(function() {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, 5000);
        }, 300);
    });
    
    intro.onexit(function() {
        localStorage.setItem('wiki-quick-start-tour-completed', 'true');
        // Скрываем информационный баннер, если он есть
        var banner = document.getElementById('quick-start-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    });
    
    return intro;
}

// Инициализация туров при загрузке страницы
(function() {
    function initTours() {
        // Проверяем, нужно ли показывать тур автоматически
        var showTour = localStorage.getItem('show-wiki-tour') === 'true';
        
        if (showTour && typeof introJs !== 'undefined') {
            // Определяем, на какой странице мы находимся
            var path = window.location.pathname;
            
            if (path.includes('/wiki/page/')) {
                // Детальная страница
                if (!localStorage.getItem('wiki-detail-tour-completed')) {
                    setTimeout(function() {
                        initWikiDetailTour().start();
                    }, 500);
                }
            } else if (path.includes('/wiki')) {
                // Список страниц
                if (!localStorage.getItem('wiki-list-tour-completed')) {
                    setTimeout(function() {
                        initWikiListTour().start();
                    }, 500);
                }
            }
        }
    }
    
    // Используем нативный JavaScript вместо jQuery
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTours);
    } else {
        // DOM уже загружен
        initTours();
    }
    
    // Также поддерживаем jQuery, если он доступен
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(initTours);
    }
})();

// Функция для запуска тура из кнопки
function startWikiTour(tourName, event) {
    // Предотвращаем перезагрузку страницы
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('startWikiTour вызвана с параметром:', tourName);
    
    if (typeof introJs === 'undefined') {
        alert('Путеводитель не загружен. Пожалуйста, обновите страницу.');
        console.error('introJs не определен');
        return false;
    }
    
    var intro;
    switch(tourName) {
        case 'quick-start':
            console.log('Запуск быстрого старта');
            intro = initQuickStartTour();
            break;
        case 'list':
            console.log('Запуск тура списка');
            intro = initWikiListTour();
            break;
        case 'detail':
            console.log('Запуск тура детальной страницы');
            intro = initWikiDetailTour();
            break;
        default:
            console.log('Запуск тура по умолчанию (список)');
            intro = initWikiListTour();
    }
    
    if (intro) {
        console.log('Запуск intro.js');
        intro.start();
        return false; // Предотвращаем стандартное поведение
    } else {
        console.error('Не удалось создать тур');
        alert('Ошибка при создании тура. Пожалуйста, обновите страницу.');
        return false;
    }
}

// Экспортируем функции для использования в других скриптах
window.WikiTour = {
    startQuickStart: function(event) { 
        console.log('WikiTour.startQuickStart вызван');
        return startWikiTour('quick-start', event); 
    },
    startList: function(event) { 
        console.log('WikiTour.startList вызван');
        return startWikiTour('list', event); 
    },
    startDetail: function(event) { 
        console.log('WikiTour.startDetail вызван');
        return startWikiTour('detail', event); 
    }
};

// Делаем функцию startWikiTour доступной глобально
window.startWikiTour = startWikiTour;

console.log('WikiTour модуль загружен, функции доступны:', {
    startWikiTour: typeof window.startWikiTour,
    WikiTour: typeof window.WikiTour,
    introJs: typeof introJs
});
