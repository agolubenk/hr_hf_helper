import React, { useEffect, useRef } from 'react';
import './ScrollToTop.css';

const ScrollToTop: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // useEffect: добавляем прямой обработчик через addEventListener
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

  // Функция для скролла вверх
    const scrollToTop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
      
      // Fallback для старых браузеров
      if (!('scrollBehavior' in document.documentElement.style)) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Добавляем нативный обработчик событий
    btn.addEventListener('click', scrollToTop, { capture: true });

    // Cleanup
    return () => {
      btn.removeEventListener('click', scrollToTop, { capture: true });
    };
  }, []);

  return (
        <button
      ref={buttonRef}
      className="scroll-to-top visible"
          aria-label="Scroll to top"
          type="button"
      title="Scroll to top"
        >
          <i className="bi bi-arrow-up"></i>
        </button>
  );
};

export default ScrollToTop;

