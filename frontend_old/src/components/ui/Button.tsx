import React from 'react';
import { ButtonProps } from '../../types/ui.types';
import './Button.css';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  outline = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

