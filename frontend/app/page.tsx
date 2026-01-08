'use client'

import { Flex, Text, Button } from "@radix-ui/themes";
import AppLayout from "@/components/AppLayout";

export default function Home() {
  const handleLogout = () => {
    console.log('Выход из системы');
    // Здесь будет логика выхода
  };

  return (
    <AppLayout
      pageTitle="HR Helper"
      userName="Голубенко Андрей"
      onLogout={handleLogout}
    >
      <Flex direction="column" gap="4" align="center">
        <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
        <Text size="4" color="gray">
          Используйте меню для навигации по приложению
        </Text>
        <Button size="3">Начать работу</Button>
      </Flex>
    </AppLayout>
  );
}
