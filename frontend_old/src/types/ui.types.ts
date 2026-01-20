/* ============================================
   ТИПЫ ДЛЯ UI КОМПОНЕНТОВ
   ============================================ */

// Размеры компонентов
export type ComponentSize = 'sm' | 'md' | 'lg';

// Варианты цветов
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark';

// Пропсы кнопки
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ColorVariant;
  size?: ComponentSize;
  outline?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Пропсы инпута
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

// Пропсы карточки
export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Добавляй остальные типы по мере создания компонентов

