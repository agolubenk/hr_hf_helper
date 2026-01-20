import { useEffect, useRef } from 'react';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';

const FloatingActions: React.FC = () => {
  const scrollTopBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = scrollTopBtnRef.current;
    if (!btn) return;

    const handleScrollToTop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };

    btn.addEventListener('click', handleScrollToTop, { capture: true });

    return () => {
      btn.removeEventListener('click', handleScrollToTop, { capture: true });
    };
  }, []);

  return (
    <div className="floating-actions">
      {/* Кнопка "Вверх" - всегда видна */}
      <button 
        ref={scrollTopBtnRef}
        className="fab secondary"
        title="Прокрутить вверх"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }}
      >
        <i className="bi bi-arrow-up"></i>
      </button>
      
      {/* Кнопка "+" - всегда видна */}
      <button 
        className="fab"
        onClick={showNotImplementedToast}
        title="Добавить"
        type="button"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  );
};

export default FloatingActions;

