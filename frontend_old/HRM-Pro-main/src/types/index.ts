export interface Task {
  id: number;
  text: string;
}

export interface SubmenuItem {
  icon: string;
  text: string;
  active?: boolean;
}

export interface Module {
  key: string;
  name: string;
  icon: string;
  count: string;
  color: string;
  submenu?: SubmenuItem[];
}

export type Language = 'ru' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  position: string;
  role: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  telegram?: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
}

export interface ActionCard {
    icon: string;
    title: string;
    description: string;
    color: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'message' | 'mention' | 'task' | 'calendar';

export interface Toast {
    id: string;
    message: string;
    type?: ToastType;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  title: string;
}

export interface StatWidget {
  value: string | number;
  label: string;
  trend: {
    direction: 'up' | 'down';
    value: string;
  };
}

export interface ThemeSettings {
  accentColor: string;
  animations: 'enabled' | 'reduced' | 'disabled';
  gridDisplay: 'auto' | 'compact' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadows: boolean;
  transitions: boolean;
} 