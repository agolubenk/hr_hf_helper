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

const NAV_DELAY_MS = 900;
const TOUR_STORAGE_KEY_STEP = "hrhelper-tour-last-step";
const TOUR_STORAGE_KEY_URL = "hrhelper-tour-last-url";

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('Выход из системы');
  };

  const handleWelcomeTour = () => {
    const steps = [
        { element: "[data-tour='header-menu']", popover: { title: "Меню", description: "Иконка ⚡ — боковое меню с разделами приложения." } },
        { element: "[data-tour='header-theme']", popover: { title: "Смена темы", description: "Переключение светлой и тёмной темы." } },
        { element: "[data-tour='header-profile']", popover: { title: "Профиль", description: "Ваш профиль и настройки учётной записи." } },
        { element: "[data-tour='header-logout']", popover: { title: "Выход", description: "Выход из учётной записи." } },
        { element: "[data-tour='blocks-wrap']", popover: { title: "Разделы приложения", description: "Ниже — карточки разделов. Нажмите на карточку для перехода." } },
        { element: "[data-tour='block-chat']", popover: { title: "Чат", description: "Чат и workflow по подбору. Нажмите «Далее» — откроем страницу и проведём тур.", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/workflow"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        {
          element: "[data-tour='workflow-page']",
          popover: {
            title: "Страница Чат (Workflow)",
            description: "Автоматическое назначение встреч и внесение/обработка данных. Кнопки копирования слотов и базовых данных по вакансии: вопросы и ссылка («Вакансия»), слоты («слоты»).",
            onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); },
          },
        },
        { element: "[data-tour='workflow-vacancy-buttons']", popover: { title: "Выбор вакансии и кнопки", description: "Выпадающий список вакансии, Календарь, Вакансия (вопросы и ссылка по вакансии), слоты (копирование слотов), Обновить." } },
        { element: "[data-tour='workflow-toggle']", popover: { title: "Тогглер: Скрининг / Интервью", description: "Переключение этапа — Скрининг (30 мин) или Интервью (90 мин)." } },
        { element: "[data-tour='workflow-interview']", popover: { title: "Назначение интервью", description: "Выберите «Интервью» — ниже появятся формат (онлайн/офис) и интервьюеры для назначения встреч." } },
        { element: "[data-tour='workflow-chat']", popover: { title: "Внесение данных по кандидатам", description: "Данные в чате используются для автоматизации: назначение встреч, заполнение базы кандидатов." } },
        {
          element: "[data-tour='workflow-sidebar']",
          popover: {
            title: "Боковая панель",
            description: "Отчёты последних недель — по этапам подбора (текущая/предыдущая неделя). Вики — ведёт на подробное описание команд и работы чата. Быстрые действия (в шапке слева) — переход по ссылке для коммуникации с кандидатом (Telegram, WhatsApp и др.). «Далее» — вернёмся на главную.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); },
          },
        },
        {
          element: "[data-tour='block-settings']",
          popover: {
            title: "Настройки",
            description: "Настройки компании и рекрутинга. Нажмите «Далее» — перейдём в настройки и пройдём по пунктам меню.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/company-settings"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); },
          },
        },
        { element: "[data-tour='sidebar-company-settings-general']", popover: { title: "Общие", description: "Логотип, офисы, календарь компании.", onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-company-settings-org-structure']", popover: { title: "Оргструктура", description: "Организационная структура компании." } },
        { element: "[data-tour='sidebar-company-settings-grades']", popover: { title: "Грейды", description: "Грейды и уровни." } },
        { element: "[data-tour='sidebar-company-settings-finance']", popover: { title: "Финансы", description: "Финансовые настройки." } },
        { element: "[data-tour='sidebar-company-settings-lifecycle']", popover: { title: "Жизненный цикл сотрудников", description: "Этапы и статусы в жизненном цикле." } },
        { element: "[data-tour='sidebar-company-settings-integrations']", popover: { title: "Интеграции", description: "Интеграции с внешними системами." } },
        { element: "[data-tour='sidebar-company-settings-user-groups']", popover: { title: "Группы пользователей", description: "Группы и права доступа." } },
        { element: "[data-tour='sidebar-company-settings-users']", popover: { title: "Пользователи", description: "Пользователи и доступ. «Далее» — откроем раздел «Настройки рекрутинга».", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/company-settings/recruiting/stages"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-recruiting-settings-stages']", popover: { title: "Этапы найма и причины отказа", description: "Этапы воронки и причины отказа.", onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push("/company-settings"); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); } } },
        { element: "[data-tour='sidebar-recruiting-settings-candidate-fields']", popover: { title: "Дополнительные поля кандидатов", description: "Кастомные поля в карточке кандидата." } },
        { element: "[data-tour='sidebar-recruiting-settings-scorecard']", popover: { title: "Scorecard", description: "Критерии оценки кандидатов." } },
        { element: "[data-tour='sidebar-recruiting-settings-sla']", popover: { title: "SLA", description: "Сроки и SLA по этапам подбора." } },
        { element: "[data-tour='sidebar-recruiting-settings-vacancy-prompt']", popover: { title: "Единый промпт для вакансий", description: "Промпт для генерации описаний вакансий." } },
        { element: "[data-tour='sidebar-recruiting-settings-offer-template']", popover: { title: "Шаблон оффера", description: "Шаблон оффера. «Далее» — на главную.", onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push("/"); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
        { element: "[data-tour='block-recruiting']", popover: { title: "Рекрутинг", description: "Workflow и процессы рекрутинга." } },
        {
          element: "[data-tour='block-vacancies']",
          popover: {
            title: "Вакансии",
            description: "Список вакансий. Нажмите «Далее» — перейдём на страницу вакансий.",
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => {
              router.push("/vacancies");
              setTimeout(() => d.moveNext(), NAV_DELAY_MS);
            },
          },
        },
        {
          element: "[data-tour='vacancies-page']",
          popover: {
            title: "Страница вакансий",
            description: "Список вакансий, фильтры, карточки и сетка. «Далее» — на главную.",
            onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => {
              router.push("/");
              setTimeout(() => d.movePrevious(), NAV_DELAY_MS);
            },
            onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => {
              router.push("/");
              setTimeout(() => d.moveNext(), NAV_DELAY_MS);
            },
          },
        },
        { element: "[data-tour='block-hiring-requests']", popover: { title: "Заявки на подбор", description: "Заявки на подбор персонала." } },
        { element: "[data-tour='block-salary']", popover: { title: "ЗП вилки", description: "Зарплатные вилки по вакансиям." } },
        { element: "[data-tour='block-benchmarks']", popover: { title: "Бенчмарки", description: "Бенчмарки и финансовая аналитика." } },
        { element: "[data-tour='block-interviewers']", popover: { title: "Интервьюеры", description: "База интервьюеров." } },
        { element: "[data-tour='block-aichat']", popover: { title: "ИИ чат", description: "ИИ-ассистент для HR." } },
        { element: "[data-tour='block-wiki']", popover: { title: "Вики", description: "Внутренняя база знаний." } },
        { element: "[data-tour='block-reporting']", popover: { title: "Отчетность", description: "Отчёты и аналитика." } },
        { popover: { title: "Тур завершён", description: "Вы познакомились с разделами HR Helper. Меню, профиль и карточки на главной помогут быстро перейти в нужный раздел." } },
      ];

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
      onDestroyed: (_el, _step, opts) => {
        const idx = opts?.state?.activeIndex;
        const len = opts?.config?.steps?.length;
        // Тур завершён — очищаем
        if (typeof idx === "number" && typeof len === "number" && idx === len - 1) {
          localStorage.removeItem(TOUR_STORAGE_KEY_STEP);
          localStorage.removeItem(TOUR_STORAGE_KEY_URL);
          return;
        }
        // Выход/прерывание — запоминаем последний достигнутый шаг (только если прошли дальше шага 1)
        if (typeof idx === "number" && idx > 0) {
          localStorage.setItem(TOUR_STORAGE_KEY_STEP, String(idx));
          localStorage.setItem(TOUR_STORAGE_KEY_URL, typeof window !== "undefined" ? window.location.pathname : "/");
        }
      },
    });

    const savedStep = typeof window !== "undefined" ? localStorage.getItem(TOUR_STORAGE_KEY_STEP) : null;
    const savedUrl = typeof window !== "undefined" ? localStorage.getItem(TOUR_STORAGE_KEY_URL) : null;
    const stepIndex = savedStep ? parseInt(savedStep, 10) : -1;
    const hasValidResume = stepIndex > 0 && savedUrl && !isNaN(stepIndex) && stepIndex < steps.length;

    // Очистка устаревших или невалидных данных
    if ((savedStep != null || savedUrl != null) && !hasValidResume) {
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP);
      localStorage.removeItem(TOUR_STORAGE_KEY_URL);
    }

    if (hasValidResume) {
      const resume = window.confirm(
        `Тур был прерван. Вернуться к последнему достигнутому шагу (шаг ${stepIndex + 1} из ${steps.length})?\n\n«OK» — продолжить с этого места\n«Отмена» — начать тур сначала`
      );
      if (resume) {
        if (typeof window !== "undefined" && window.location.pathname !== savedUrl) {
          router.push(savedUrl);
          setTimeout(() => driverObj.drive(stepIndex), NAV_DELAY_MS);
        } else {
          driverObj.drive(stepIndex);
        }
        return;
      }
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP);
      localStorage.removeItem(TOUR_STORAGE_KEY_URL);
    }
    driverObj.drive(0);
  };

  return (
    <AppLayout
      pageTitle="HR Helper"
      userName="Голубенко Андрей"
      onLogout={handleLogout}
    >
      <Flex direction="column" gap="5" align="center">
        <Box data-tour="welcome-title">
          <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
        </Box>
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

        <Text size="4" color="gray">
          Выберите раздел для перехода
        </Text>

        <Flex data-tour="blocks-wrap" gap="4" wrap="wrap" justify="center" className={styles.blocksWrap}>
          {BLOCKS.map((b) => {
            const Icon = b.icon;
            return (
              <Link key={b.id} href={b.href} className={styles.blockCardLink} data-tour={`block-${b.id}`}>
                <Card size="2" className={styles.blockCard} style={{ width: 'max-content' }}>
                  <Flex direction="column" gap="2" align="center">
                    <Box style={{ color: 'var(--accent-9)' }}>
                      <Icon width={28} height={28} />
                    </Box>
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
