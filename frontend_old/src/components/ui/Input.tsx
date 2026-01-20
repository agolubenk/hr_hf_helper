import React from 'react';
import { InputProps } from '../../types/ui.types';
import './Input.css';

const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const hasError = Boolean(error);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`form-control ${hasError ? 'is-invalid' : ''} ${icon ? 'with-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {helpText && !error && (
        <small className="form-text text-muted">{helpText}</small>
      )}
      
      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default Input;

