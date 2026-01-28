/**
 * Home (page.tsx) - Главная страница приложения HR Helper
 * 
 * Назначение:
 * - Точка входа в приложение после авторизации
 * - Навигационный хаб с карточками быстрого доступа к разделам
 * - Приветственный тур по приложению с использованием driver.js
 * 
 * Функциональность:
 * - Отображение приветственного сообщения
 * - Кнопка запуска приветственного тура
 * - Карточки навигации по разделам приложения
 * - Сохранение прогресса тура в localStorage
 * - Восстановление тура с последнего шага
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout с Header и Sidebar
 * - useRouter: для программной навигации между страницами во время тура
 * - driver.js: библиотека для создания интерактивного тура
 * - BLOCKS: массив разделов приложения для отображения карточек
 * 
 * Поведение:
 * - При первом посещении показывает приветствие и карточки разделов
 * - При клике на "Приветственный тур" запускается интерактивный тур
 * - Тур сохраняет прогресс в localStorage и может быть продолжен позже
 * - При клике на карточку раздела происходит переход на соответствующую страницу
 */

'use client'

import { Flex, Text, Card, Box, Button } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour-overrides.css";
import AppLayout from "@/components/AppLayout";
import styles from "./page.module.css";
import {
  ChatBubbleIcon,
  MixerHorizontalIcon,
  ListBulletIcon,
  ClipboardIcon,
  StarIcon,
  BarChartIcon,
  PersonIcon,
  LightningBoltIcon,
  FileTextIcon,
  DashboardIcon,
  GearIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

/**
 * BLOCKS - массив разделов приложения для отображения на главной странице
 * Каждый блок содержит:
 * - id: уникальный идентификатор для data-tour атрибута
 * - label: название раздела, отображаемое на карточке
 * - href: URL для перехода при клике на карточку
 * - icon: иконка из Radix UI для визуального представления раздела
 * 
 * Используется для:
 * - Рендеринга карточек навигации
 * - Создания шагов в приветственном туре
 */
const BLOCKS = [
  { id: 'chat', label: 'Чат', href: '/workflow', icon: ChatBubbleIcon },
  { id: 'recruiting', label: 'Рекрутинг', href: '/workflow', icon: MixerHorizontalIcon },
  { id: 'vacancies', label: 'Вакансии', href: '/vacancies', icon: ListBulletIcon },
  { id: 'hiring-requests', label: 'Заявки на подбор', href: '/hiring-requests', icon: ClipboardIcon },
  { id: 'salary', label: 'ЗП вилки', href: '/vacancies/salary-ranges', icon: StarIcon },
  { id: 'benchmarks', label: 'Бенчмарки', href: '/finance/benchmarks', icon: BarChartIcon },
  { id: 'interviewers', label: 'Интервьюеры', href: '/interviewers', icon: PersonIcon },
  { id: 'aichat', label: 'ИИ чат', href: '/aichat', icon: LightningBoltIcon },
  { id: 'wiki', label: 'Вики', href: '/wiki', icon: FileTextIcon },
  { id: 'reporting', label: 'Отчетность', href: '/reporting', icon: DashboardIcon },
  { id: 'settings', label: 'Настройки', href: '/company-settings', icon: GearIcon },
] as const;

// Задержка навигации в миллисекундах - используется для плавного перехода между страницами во время тура
// Необходима, чтобы страница успела загрузиться перед переходом к следующему шагу тура
const NAV_DELAY_MS = 900;

// Ключи для сохранения прогресса тура в localStorage
// TOUR_STORAGE_KEY_STEP: номер последнего пройденного шага тура
// TOUR_STORAGE_KEY_URL: URL страницы, на которой был прерван тур
const TOUR_STORAGE_KEY_STEP = "hrhelper-tour-last-step";
const TOUR_STORAGE_KEY_URL = "hrhelper-tour-last-url";

/**
 * Home - главный компонент страницы
 * 
 * Функциональность:
 * - Отображает приветственное сообщение
 * - Предоставляет кнопку запуска приветственного тура
 * - Рендерит карточки навигации по разделам
 * - Управляет логикой восстановления тура
 */
export default function Home() {
  // useRouter: хук Next.js для программной навигации
  // Используется для перехода между страницами во время тура
  const router = useRouter();

  /**
   * handleLogout - обработчик выхода из системы
   * 
   * Функциональность:
   * - Выполняет выход пользователя из системы
   * - Передает обработчик в AppLayout для использования в Header
   * 
   * Поведение:
   * - В текущей реализации только логирует действие
   * - Должен быть расширен для реальной логики выхода (очистка токенов, редирект на login)
   * 
   * Связи:
   * - Передается в AppLayout как onLogout prop
   * - AppLayout передает его в Header компонент
   */
  const handleLogout = () => {
    console.log('Выход из системы');
  };

  /**
   * handleWelcomeTour - обработчик запуска приветственного тура
   * 
   * Функциональность:
   * - Создает массив шагов тура с описаниями элементов интерфейса
   * - Инициализирует driver.js с настройками тура
   * - Сохраняет прогресс тура в localStorage при каждом шаге
   * - Восстанавливает тур с последнего шага, если он был прерван
   * - Управляет навигацией между страницами во время тура
   * 
   * Логика работы:
   * 1. Определяет массив шагов тура (steps) с описаниями элементов
   * 2. Создает экземпляр driver.js с настройками
   * 3. Проверяет localStorage на наличие сохраненного прогресса
   * 4. Если тур был прерван - предлагает продолжить или начать заново
   * 5. Запускает тур с начала или с сохраненного шага
   * 
   * Связи:
   * - Использует router для навигации между страницами во время тура
   * - Сохраняет прогресс в localStorage для восстановления
   * - Взаимодействует с элементами через data-tour атрибуты
   * 
   * Поведение:
   * - При первом запуске начинает тур с первого шага
   * - При прерванном туре показывает диалог с предложением продолжить
   * - При завершенном туре предлагает показать итоговый экран или начать заново
   * - Автоматически переключается между страницами при необходимости
   */
  const handleWelcomeTour = () => {
    /**
     * steps - массив шагов приветственного тура
     * 
     * Каждый шаг содержит:
     * - element: CSS селектор элемента для подсветки (data-tour атрибут)
     * - popover: объект с информацией для отображения в подсказке
     *   - title: заголовок подсказки
     *   - description: описание элемента и его функциональности
     *   - onNextClick: (опционально) обработчик клика "Далее" - для навигации между страницами
     *   - onPrevClick: (опционально) обработчик клика "Назад" - для возврата на предыдущую страницу
     * 
     * Тур проходит по следующим разделам:
     * 1. Элементы Header (меню, тема, профиль, выход)
     * 2. Карточки разделов на главной странице
     * 3. Страница Workflow (Чат) с детальным описанием элементов
     * 4. Страница настроек компании с описанием подразделов
     * 5. Страница вакансий с описанием фильтров и статистики
     * 6. Остальные разделы приложения
     */
    const steps = [
        { element: "[data-tour='header-menu']", popover: { title: "Меню", description: "Иконка ⚡ открывает боковое меню со всеми разделами: Чат, Вакансии, Заявки, Настройки, Отчётность и др. На мобильных меню разворачивается поверх экрана." } },
        { element: "[data-tour='header-theme']", popover: { title: "Смена темы", description: "Переключатель светлой и тёмной темы. Подстраивайте интерфейс под освещение и привычки." } },
        { element: "[data-tour='header-profile']", popover: { title: "Профиль", description: "Профиль пользователя, настройки аккаунта, интеграции и быстрые действия. Здесь же — доступ к смене акцентного цвета." } },
        { element: "[data-tour='header-logout']", popover: { title: "Выход", description: "Выход из учётной записи. Сессия завершается, для входа потребуется авторизация снова." } },
        { element: "[data-tour='blocks-wrap']", popover: { title: "Разделы приложения", description: "Карточки быстрого перехода в основные разделы. Нажмите на карточку — откроется нужная страница. Ниже пройдём по Чату, Настройкам и Вакансиям подробнее." } },
        { element: "[data-tour='block-chat']", popover: { title: "Чат (Workflow)", description: "Основной workflow: подбор, назначение встреч, внесение данных по кандидатам. Нажмите «Далее» — откроем страницу Чат и покажем все элементы по шагам.", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/workflow"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        {
          element: "[data-tour='workflow-page']",
          popover: {
            title: "Страница Чат (Workflow)",
            description: "Центр подбора: автоматическое назначение встреч и обработка данных по кандидатам. Слева в шапке — быстрые кнопки для ссылок (Telegram, WhatsApp и др.) и кандидатские данные. Справа — выбор вакансии и кнопки: Календарь, Вакансия, слоты, Обновить. Ниже — тогглер этапа и чат с кандидатами.",
            onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); },
          },
        },
        {
          element: "[data-tour='workflow-vacancy-buttons']",
          popover: {
            title: "Вакансия и кнопки управления",
            description: "Выпадающий список — выбор вакансии по текущему кандидату. Календарь — шаринг слотов и просмотр. «Вакансия» — вопросы и ссылка на вакансию для копирования. «слоты» — копирование свободных слотов в буфер. Круглая кнопка — обновление данных. Все кнопки помогают быстро переносить данные в переписку с кандидатом.",
          },
        },
        {
          element: "[data-tour='workflow-toggle']",
          popover: {
            title: "Этап: Скрининг / Интервью",
            description: "Скрининг — короткая встреча 30 минут, первичный отбор. Интервью — полноценная встреча 90 минут. От выбора этапа зависят длительность слотов и блок «Назначение интервью» справа.",
          },
        },
        {
          element: "[data-tour='workflow-interview']",
          popover: {
            title: "Назначение интервью",
            description: "При выборе «Интервью» здесь появляются: формат (онлайн/офис) и список интервьюеров. Отметьте интервьюеров — их слоты можно копировать и отправлять кандидату. Удобно согласовывать время без переключения в календарь.",
          },
        },
        {
          element: "[data-tour='workflow-chat']",
          popover: {
            title: "Чат с данными по кандидатам",
            description: "В чате вносятся и хранятся данные по кандидатам: этапы, даты встреч, комментарии. Всё используется для автоматизации: назначение встреч, заполнение ATS, отчёты. Сообщения можно дополнять вручную — система подхватывает структурированные данные.",
          },
        },
        {
          element: "[data-tour='workflow-sidebar']",
          popover: {
            title: "Боковая панель Workflow",
            description: "Сверху — отчёты по этапам подбора за текущую и предыдущую неделю. Вики — подробное описание команд и логики чата. В шапке слева — быстрые действия: переход по ссылке для коммуникации (Telegram, WhatsApp и др.) с кандидатом. «Далее» — вернёмся на главную и перейдём к Настройкам.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); },
          },
        },
        {
          element: "[data-tour='block-settings']",
          popover: {
            title: "Настройки",
            description: "Настройки компании и рекрутинга: от логотипа и офисов до этапов воронки, полей кандидатов, SLA и интеграций. Нажмите «Далее» — перейдём в настройки и пройдём по пунктам левого меню.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/company-settings"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); },
          },
        },
        { element: "[data-tour='sidebar-company-settings-general']", popover: { title: "Общие", description: "Логотип компании, офисы, календарь (рабочие дни, праздники). Базовые параметры, от которых зависят расчёты и отображение в других разделах.", onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-company-settings-org-structure']", popover: { title: "Оргструктура", description: "Организационная структура: подразделения, отделы, должности. Используется в вакансиях, отчётах и при согласовании." } },
        { element: "[data-tour='sidebar-company-settings-grades']", popover: { title: "Грейды", description: "Грейды и уровни сотрудников. Связь с зарплатными вилками и бенчмарками. Нужны для единой системы грейдирования." } },
        { element: "[data-tour='sidebar-company-settings-finance']", popover: { title: "Финансы", description: "Финансовые настройки: налоги, курсы валют, коэффициенты. Влияют на расчёт вилок, бенчмарков и отчёты." } },
        { element: "[data-tour='sidebar-company-settings-lifecycle']", popover: { title: "Жизненный цикл сотрудников", description: "Этапы и статусы в жизненном цикле: от найма до увольнения. Используются в кадровом учёте и отчётности." } },
        { element: "[data-tour='sidebar-company-settings-integrations']", popover: { title: "Интеграции", description: "Подключение внешних систем: ATS, календари, мессенджеры, почта. Настройка API и маршрутов данных." } },
        { element: "[data-tour='sidebar-company-settings-user-groups']", popover: { title: "Группы пользователей", description: "Группы и роли: настройка прав доступа по разделам и действиям. Ограничение доступа к финансам, настройкам и т.п." } },
        { element: "[data-tour='sidebar-company-settings-users']", popover: { title: "Пользователи", description: "Список пользователей, приглашения, роли. «Далее» — откроем раздел «Настройки рекрутинга»: этапы найма, поля кандидатов, scorecard, SLA и др.", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/company-settings/recruiting/stages"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-recruiting-settings-stages']", popover: { title: "Этапы найма и причины отказа", description: "Этапы воронки подбора и причины отказа на каждом. Задают структуру pipeline в ATS и в отчётах. Важно настроить до начала активного подбора.", onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/company-settings"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-recruiting-settings-candidate-fields']", popover: { title: "Дополнительные поля кандидатов", description: "Кастомные поля в карточке кандидата: даты, чекбоксы, справочники. Расширяют стандартный набор данных под процессы компании." } },
        { element: "[data-tour='sidebar-recruiting-settings-scorecard']", popover: { title: "Scorecard", description: "Критерии и шкалы оценки кандидатов на интервью. Единые шаблоны для всех вакансий или настраиваемые под роль." } },
        { element: "[data-tour='sidebar-recruiting-settings-sla']", popover: { title: "SLA", description: "Сроки по этапам подбора: целевое время на переход между этапами. Нужны для контроля скорости закрытия вакансий и отчётов по KPI." } },
        { element: "[data-tour='sidebar-recruiting-settings-vacancy-prompt']", popover: { title: "Единый промпт для вакансий", description: "Промпт для генерации описаний вакансий. Задаёт тон, структуру и обязательные блоки — все новые вакансии можно собирать по одному шаблону." } },
        { element: "[data-tour='sidebar-recruiting-settings-offer-template']", popover: { title: "Шаблон оффера", description: "Шаблон оффера: условия, форматы, подписи. «Далее» — вернёмся на главную и перейдём к разделу Вакансии.", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        { element: "[data-tour='block-recruiting']", popover: { title: "Рекрутинг", description: "Раздел рекрутинга: workflow, воронки, процессы. Связан с Чат и Настройками рекрутинга." } },
        {
          element: "[data-tour='block-vacancies']",
          popover: {
            title: "Вакансии",
            description: "Список вакансий, создание и редактирование. Нажмите «Далее» — перейдём на страницу вакансий и пройдём по фильтрам, статистике и карточкам.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => {
              router.push("/vacancies");
              setTimeout(() => d.moveNext(), NAV_DELAY_MS);
            },
          },
        },
        {
          element: "[data-tour='vacancies-page']",
          popover: {
            title: "Страница вакансий — обзор",
            description: "Контейнер страницы: сверху — блок поиска и фильтров, ниже — статистика (всего / активные / неактивные), затем панель с переключателем вида (сетка/список) и кнопкой «Добавить вакансию». Внизу — карточки или список вакансий. Пройдём по каждому блоку подробнее.",
            onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => {
              router.push("/");
              setTimeout(() => d.movePrevious(), NAV_DELAY_MS);
            },
          },
        },
        {
          element: "[data-tour='vacancies-filters']",
          popover: {
            title: "Поиск и фильтры вакансий",
            description: "Поиск по названию или ID вакансии. Фильтр по рекрутеру — кто ведёт подбор. Фильтр по статусу: все / активные / неактивные. Кнопка «Поиск» применяет условия. Удобно сужать список при большом количестве вакансий.",
          },
        },
        {
          element: "[data-tour='vacancies-stats']",
          popover: {
            title: "Статистика по вакансиям",
            description: "Три счётчика: всего вакансий, активных (в наборе) и неактивных (на паузе или закрытых). Быстрая оценка загрузки и статуса пула.",
          },
        },
        {
          element: "[data-tour='vacancies-toolbar']",
          popover: {
            title: "Вид и добавление вакансии",
            description: "Переключатель: сетка карточек или список. Кнопка «+ Добавить вакансию» — создание новой вакансии. «Далее» — вернёмся на главную.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => {
              router.push("/");
              setTimeout(() => d.moveNext(), NAV_DELAY_MS);
            },
          },
        },
        { element: "[data-tour='block-hiring-requests']", popover: { title: "Заявки на подбор", description: "Заявки на подбор: заявки от руководителей, приоритеты, связь с вакансиями. Управление воронкой заявок." } },
        { element: "[data-tour='block-salary']", popover: { title: "ЗП вилки", description: "Зарплатные вилки по вакансиям и грейдам. Настройка вилок, учёт валют и грейдов. Связь с бенчмарками и финансами." } },
        { element: "[data-tour='block-benchmarks']", popover: { title: "Бенчмарки", description: "Бенчмарки и финансовая аналитика: сравнение с рынком, отчёты по ЗП. Опираются на вилки и настройки финансов." } },
        { element: "[data-tour='block-interviewers']", popover: { title: "Интервьюеры", description: "База интервьюеров: кто может проводить встречи. Используется при назначении интервью в Workflow и при настройке вакансий." } },
        { element: "[data-tour='block-aichat']", popover: { title: "ИИ чат", description: "ИИ-ассистент для HR: ответы на вопросы, помощь в формулировках, генерация текстов. Отдельный раздел от основного чата по кандидатам." } },
        { element: "[data-tour='block-wiki']", popover: { title: "Вики", description: "Внутренняя база знаний: процессы, инструкции, описание команд и сценариев. Доступна и из Workflow для быстрых подсказок." } },
        { element: "[data-tour='block-reporting']", popover: { title: "Отчетность", description: "Отчёты и аналитика: по вакансиям, рекрутерам, этапам, срокам. Планирование найма и контроль KPI." } },
        { popover: { title: "Тур завершён", description: "Вы познакомились с разделами HR Helper: шапка, главная, Чат (Workflow), Настройки, Вакансии и остальные блоки. Меню, профиль и карточки на главной помогут быстро перейти в нужный раздел." } },
      ];

    /**
     * driverObj - экземпляр driver.js для управления туром
     * 
     * Настройки:
     * - showProgress: отображать прогресс-бар тура
     * - progressText: текст прогресса с плейсхолдерами {{current}} и {{total}}
     * - nextBtnText/prevBtnText/doneBtnText: тексты кнопок навигации
     * - overlayOpacity/overlayColor: стили затемнения фона
     * - stagePadding/stageRadius: отступы и скругление подсвечиваемой области
     * - popoverClass: CSS класс для кастомизации подсказок
     * - popoverOffset: отступ подсказки от элемента
     * - smoothScroll: плавная прокрутка к элементам
     * 
     * Обработчики событий:
     * - onPopoverRender: создает кастомный прогресс-бар в подсказке
     * - onHighlighted: сохраняет текущий шаг в localStorage при подсветке элемента
     * - onDestroyed: сохраняет финальный шаг при завершении тура
     */
    const driverObj = driver({
      showProgress: true,
      progressText: "Шаг {{current}} из {{total}}",
      nextBtnText: "Далее",
      prevBtnText: "Назад",
      doneBtnText: "Готово",
      overlayOpacity: 0.82,
      overlayColor: "#000",
      stagePadding: 14,
      stageRadius: 10,
      popoverClass: "hrhelper-tour-popover",
      popoverOffset: 14,
      smoothScroll: true,
      steps,
      /**
       * onPopoverRender - вызывается при рендеринге подсказки тура
       * 
       * Функциональность:
       * - Создает кастомный прогресс-бар в верхней части подсказки
       * - Вычисляет процент прогресса (текущий шаг / общее количество шагов)
       * - Обновляет ширину прогресс-бара в зависимости от прогресса
       * 
       * Поведение:
       * - Проверяет наличие элемента прогресс-бара, создает если отсутствует
       * - Устанавливает ширину прогресс-бара в процентах
       */
      onPopoverRender: (popover, opts) => {
        const cur = (opts?.driver?.getActiveIndex?.() ?? 0) + 1;
        const total = opts?.config?.steps?.length ?? 1;
        const pct = Math.min(100, Math.round((cur / total) * 100));
        let bar = popover?.wrapper?.querySelector?.(".hrhelper-tour-progress-bar");
        if (!bar) {
          bar = document.createElement("div");
          bar.className = "hrhelper-tour-progress-bar";
          popover?.wrapper?.insertBefore?.(bar, popover.wrapper.firstChild);
        }
        if (bar) (bar as HTMLElement).style.width = `${pct}%`;
      },
      /**
       * onHighlighted - вызывается при подсветке элемента тура
       * 
       * Функциональность:
       * - Сохраняет текущий индекс шага в localStorage
       * - Сохраняет текущий URL страницы
       * - Позволяет восстановить тур с того же места при следующем запуске
       * 
       * Поведение:
       * - Вызывается при каждом переходе к новому шагу
       * - Сохраняет только валидные индексы (>= 0 и < длины массива шагов)
       */
      onHighlighted: (_el, _step, opts) => {
        const idx = opts?.driver?.getActiveIndex?.() ?? opts?.state?.activeIndex;
        if (typeof idx !== "number" || idx < 0) return;
        const len = opts?.config?.steps?.length;
        if (typeof len !== "number" || idx >= len) return;
        localStorage.setItem(TOUR_STORAGE_KEY_STEP, String(idx));
        localStorage.setItem(TOUR_STORAGE_KEY_URL, typeof window !== "undefined" ? window.location.pathname : "/");
      },
      /**
       * onDestroyed - вызывается при завершении или уничтожении тура
       * 
       * Функциональность:
       * - Сохраняет финальный шаг тура в localStorage
       * - Сохраняет URL страницы, на которой завершился тур
       * - Позволяет определить, был ли тур завершен полностью
       * 
       * Поведение:
       * - Вызывается при закрытии тура или его завершении
       * - Сохраняет последний шаг только если это был финальный шаг
       */
      onDestroyed: (_el, step, opts) => {
        const arr = opts?.config?.steps ?? [];
        const i = arr.findIndex((s) => s === step);
        if (i === arr.length - 1 && arr.length > 0) {
          localStorage.setItem(TOUR_STORAGE_KEY_STEP, String(arr.length - 1));
          localStorage.setItem(TOUR_STORAGE_KEY_URL, typeof window !== "undefined" ? window.location.pathname : "/");
        }
      },
    });

    /**
     * Логика восстановления тура из localStorage
     * 
     * Функциональность:
     * - Проверяет наличие сохраненного прогресса тура
     * - Валидирует сохраненные данные (индекс шага и URL)
     * - Предлагает продолжить тур или начать заново
     * - Очищает невалидные данные из localStorage
     * 
     * Поведение:
     * - Если тур был завершен: предлагает показать итоговый экран или начать заново
     * - Если тур был прерван: предлагает продолжить с последнего шага или начать сначала
     * - Если сохраненные данные невалидны: очищает их и начинает тур с начала
     * - Если пользователь отказывается продолжать: очищает сохраненные данные и начинает с начала
     */
    const savedStep = typeof window !== "undefined" ? localStorage.getItem(TOUR_STORAGE_KEY_STEP) : null;
    const savedUrl = typeof window !== "undefined" ? localStorage.getItem(TOUR_STORAGE_KEY_URL) : null;
    const stepIndex = savedStep ? parseInt(savedStep, 10) : -1;
    // Проверка валидности сохраненных данных: индекс должен быть > 0, валидным числом и в пределах массива шагов
    const hasValidResume = stepIndex > 0 && savedUrl && !isNaN(stepIndex) && stepIndex < steps.length;

    // Очистка устаревших или невалидных данных из localStorage
    // Выполняется если есть сохраненные данные, но они невалидны
    if ((savedStep != null || savedUrl != null) && !hasValidResume) {
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP);
      localStorage.removeItem(TOUR_STORAGE_KEY_URL);
    }

    // Если есть валидный сохраненный прогресс - предлагаем восстановить тур
    if (hasValidResume) {
      // Проверяем, был ли тур завершен полностью (последний шаг)
      const isCompleted = stepIndex === steps.length - 1;
      // Формируем сообщение в зависимости от статуса тура
      const msg = isCompleted
        ? "Тур уже пройден. Показать итоговый экран или пройти с начала?\n\n«OK» — итог\n«Отмена» — с начала"
        : `Тур был прерван. Вернуться к последнему достигнутому шагу (шаг ${stepIndex + 1} из ${steps.length})?\n\n«OK» — продолжить с этого места\n«Отмена» — начать тур сначала`;
      // Показываем диалог подтверждения
      const resume = window.confirm(msg);
      if (resume) {
        // Если пользователь согласился продолжить
        // Проверяем, нужно ли перейти на другую страницу
        if (typeof window !== "undefined" && window.location.pathname !== savedUrl) {
          // Переходим на сохраненную страницу и запускаем тур с задержкой
          router.push(savedUrl);
          setTimeout(() => driverObj.drive(stepIndex), NAV_DELAY_MS);
        } else {
          // Если уже на нужной странице - сразу запускаем тур с сохраненного шага
          driverObj.drive(stepIndex);
        }
        return; // Выходим из функции, не запуская тур с начала
      }
      // Если пользователь отказался продолжать - очищаем сохраненные данные
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP);
      localStorage.removeItem(TOUR_STORAGE_KEY_URL);
    }
    // Запускаем тур с начала (шаг 0)
    driverObj.drive(0);
  };

  /**
   * Рендер компонента главной страницы
   * 
   * Структура:
   * - AppLayout: оборачивает страницу в общий layout
   * - Приветственное сообщение с data-tour атрибутом для тура
   * - Кнопка запуска приветственного тура
   * - Текст-подсказка для пользователя
   * - Карточки навигации по разделам приложения
   * 
   * Связи:
   * - AppLayout получает pageTitle, userName и onLogout для отображения в Header
   * - Каждая карточка - это Link компонент Next.js для клиентской навигации
   * - data-tour атрибуты используются для идентификации элементов в туре
   */
  return (
    <AppLayout
      pageTitle="HR Helper"
      userName="Голубенко Андрей"
      onLogout={handleLogout}
    >
      <Flex direction="column" gap="5" align="center">
        {/* Приветственное сообщение - используется в туре как первый элемент */}
        <Box data-tour="welcome-title">
          <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
        </Box>
        
        {/* Кнопка запуска приветственного тура
            - При клике вызывает handleWelcomeTour
            - Иконка ракеты для визуального обозначения
            - data-tour атрибут для идентификации в туре */}
        <Button
          data-tour="welcome-tour-btn"
          size="3"
          variant="soft"
          onClick={handleWelcomeTour}
          className={styles.welcomeTourBtn}
        >
          <RocketIcon width={18} height={18} />
          Приветственный тур
        </Button>

        {/* Текст-подсказка для пользователя */}
        <Text size="4" color="gray">
          Выберите раздел для перехода
        </Text>

        {/* Контейнер карточек разделов приложения
            - data-tour="blocks-wrap" используется в туре для описания всего блока
            - gap="4": отступ между карточками
            - wrap="wrap": перенос карточек на новую строку при нехватке места
            - justify="center": центрирование карточек */}
        <Flex data-tour="blocks-wrap" gap="4" wrap="wrap" justify="center" className={styles.blocksWrap}>
          {/* Маппинг массива BLOCKS в карточки навигации
              - Каждая карточка - это Link компонент Next.js для клиентской навигации
              - href ведет на соответствующую страницу раздела
              - data-tour атрибут формируется как "block-{id}" для идентификации в туре
              - Иконка и название отображаются внутри Card компонента */}
          {BLOCKS.map((b) => {
            const Icon = b.icon;
            return (
              <Link key={b.id} href={b.href} className={styles.blockCardLink} data-tour={`block-${b.id}`}>
                <Card size="2" className={styles.blockCard} style={{ width: 'max-content' }}>
                  <Flex direction="column" gap="2" align="center">
                    {/* Иконка раздела с акцентным цветом */}
                    <Box style={{ color: 'var(--accent-9)' }}>
                      <Icon width={28} height={28} />
                    </Box>
                    {/* Название раздела */}
                    <Text size="3" weight="medium" style={{ whiteSpace: 'nowrap' }}>{b.label}</Text>
                  </Flex>
                </Card>
              </Link>
            );
          })}
        </Flex>
      </Flex>
    </AppLayout>
  );
}
