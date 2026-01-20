import { useState, useEffect, useRef } from 'react';

export interface CopyFloatingAction {
  id: string;
  icon: string;
  label: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  onClick: () => void;
}

interface CopyFloatingGroupProps {
  actions: CopyFloatingAction[];
  className?: string;
}

const CopyFloatingGroup = ({ actions, className = '' }: CopyFloatingGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обработка клика на иконку спидометра
  const handleTriggerClick = () => {
    if (isPinned) {
      // Если зафиксирован, убираем фиксацию и закрываем
      setIsPinned(false);
      setIsOpen(false);
    } else {
      // Если не зафиксирован, фиксируем и открываем
      setIsPinned(true);
      setIsOpen(true);
    }
  };

  // Обработка наведения мыши на триггер
  const handleTriggerMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  // Обработка ухода мыши с триггера
  const handleTriggerMouseLeave = () => {
    if (!isPinned) {
      // Небольшая задержка перед закрытием, чтобы можно было переместиться на меню
      timeoutRef.current = setTimeout(() => {
        if (!menuRef.current?.matches(':hover')) {
          setIsOpen(false);
        }
      }, 100);
    }
  };

  // Обработка наведения мыши на меню
  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  // Обработка ухода мыши с меню
  const handleMenuMouseLeave = () => {
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  // Инициализация tooltips для кнопок
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const initTooltips = async () => {
        let bootstrap: any;
        if (typeof window !== 'undefined' && (window as any).bootstrap) {
          bootstrap = (window as any).bootstrap;
        } else {
          bootstrap = await import('bootstrap');
        }

        const tooltipElements = menuRef.current?.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements?.forEach((element) => {
          try {
            const existingTooltip = bootstrap.Tooltip.getInstance(element);
            if (existingTooltip) {
              existingTooltip.dispose();
            }
            new bootstrap.Tooltip(element);
          } catch (e) {
            console.warn('Failed to initialize tooltip:', e);
          }
        });
      };

      setTimeout(() => {
        initTooltips();
      }, 100);
    }
  }, [isOpen]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Добавляем/убираем отступ для основного контента при фиксации
  // Только когда компонент зафиксирован (pinned), основное пространство сдвигается
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    
    if (isPinned && isOpen) {
      // Добавляем отступ слева для основного контента только при фиксации
      if (mainContent) {
        (mainContent as HTMLElement).style.marginLeft = '60px'; /* Ширина меню */
        (mainContent as HTMLElement).style.transition = 'margin-left 0.3s ease';
      }
    } else {
      // Убираем отступ, если не зафиксирован или закрыт
      if (mainContent) {
        (mainContent as HTMLElement).style.marginLeft = '0';
      }
    }

    return () => {
      // Очистка при размонтировании
      if (mainContent) {
        (mainContent as HTMLElement).style.marginLeft = '';
        (mainContent as HTMLElement).style.transition = '';
      }
    };
  }, [isPinned, isOpen]);

  return (
    <>
      {/* Триггер - полукруг с иконкой спидометра */}
      <div
        ref={containerRef}
        className={`copy-floating-group-trigger ${className}`}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
      >
        <button
          ref={triggerRef}
          className="copy-floating-trigger-btn"
          onClick={handleTriggerClick}
          aria-label="Открыть меню действий"
          aria-expanded={isOpen}
        >
          <i className="bi bi-speedometer2"></i>
        </button>
      </div>

      {/* Меню с кнопками */}
      <div
        ref={menuRef}
        className={`copy-floating-group-menu ${isOpen ? 'open' : ''} ${isPinned ? 'pinned' : ''}`}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
      >
        <div className="copy-floating-menu-content">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`copy-floating-action-btn btn-${action.color}`}
              onClick={() => {
                action.onClick();
                if (!isPinned) {
                  setIsOpen(false);
                }
              }}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title={action.label}
            >
              <i className={`bi ${action.icon}`}></i>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CopyFloatingGroup;

