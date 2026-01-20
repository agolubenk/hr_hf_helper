import React, { useState } from 'react';
import '../components.css';

interface FieldOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  validation?: {
    pattern?: string;
    message?: string;
  };
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  initialData?: any;
  title?: string;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  initialData = {},
  title
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || value === '')) {
      return `${field.label} обязательно для заполнения`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Введите корректный email';
      }
    }

    if (field.type === 'number' && value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Введите корректное число';
      }
      if (field.min !== undefined && numValue < field.min) {
        return `Минимальное значение: ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `Максимальное значение: ${field.max}`;
      }
    }

    if (field.validation?.pattern && value) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return field.validation.message || 'Неверный формат';
      }
    }

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      className: `form-control ${error ? 'error' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 4}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Выберите...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className={error ? 'error' : ''}
            />
            <label htmlFor={field.name}>{field.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map(option => (
              <div key={option.value} className="radio-wrapper">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className={error ? 'error' : ''}
                />
                <label htmlFor={`${field.name}-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }
  };

  return (
    <div className="form-builder">
      {title && (
        <div className="form-header">
          <h3>{title}</h3>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        {fields.map(field => (
          <div key={field.name} className="form-group">
            {field.type !== 'checkbox' && field.type !== 'radio' && (
              <label htmlFor={field.name} className="form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
            )}
            
            {renderField(field)}
            
            {errors[field.name] && (
              <div className="error-message">
                {errors[field.name]}
              </div>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormBuilder; 