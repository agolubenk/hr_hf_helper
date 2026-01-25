'use client'

import { Flex, Text, Card, Box, Button } from "@radix-ui/themes";
import Link from "next/link";
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
  { id: 'chat', label: 'Чат', href: '/recr-chat', icon: ChatBubbleIcon },
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

export default function Home() {
  const handleLogout = () => {
    console.log('Выход из системы');
  };

  const handleWelcomeTour = () => {
    // TODO: запуск приветственного тура
  };

  return (
    <AppLayout
      pageTitle="HR Helper"
      userName="Голубенко Андрей"
      onLogout={handleLogout}
    >
      <Flex direction="column" gap="5" align="center">
        <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
        <Button
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

        <Flex gap="4" wrap="wrap" justify="center" className={styles.blocksWrap}>
          {BLOCKS.map((b) => {
            const Icon = b.icon;
            return (
              <Link key={b.id} href={b.href} className={styles.blockCardLink}>
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
