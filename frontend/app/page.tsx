'use client'

import { Flex, Text, Button, Box } from "@radix-ui/themes";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActions from "@/components/FloatingActions";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    console.log('Выход из системы');
    // Здесь будет логика выхода
  };

  return (
    <>
      <Header
        pageTitle="HR Helper"
        userEmail="andrei.golubenko@softnetix.io"
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        onThemeToggle={toggleTheme}
        currentTheme={theme}
        menuOpen={menuOpen}
        onLogout={handleLogout}
      />
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <FloatingActions />
      
      <Box 
        style={{ 
          marginTop: '64px', 
          padding: '24px',
          marginLeft: menuOpen ? '280px' : '0',
          transition: 'margin-left 0.2s ease-in-out',
          borderTop: '1px solid var(--gray-a6)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Flex direction="column" gap="4" align="center">
          <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
          <Text size="4" color="gray">
            Используйте меню для навигации по приложению
          </Text>
          <Button size="3">Начать работу</Button>
        </Flex>
      </Box>
    </>
  );
}
