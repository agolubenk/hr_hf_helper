import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop: React.FC = () => {
  // State: показывать ли кнопку
  const [isVisible, setIsVisible] = useState(false);

  // Функция для скролла вверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // useEffect: добавляем слушатель на событие "scroll"
  useEffect(() => {
    // Функция для проверки скролла (порог: 600px)
    const checkScroll = () => {
      // Получаем позицию скролла
      const scrollY = window.pageYOffset || 
                      document.documentElement.scrollTop || 
                      document.body.scrollTop || 
                      0;
      
      // Обновляем видимость кнопки
      setIsVisible(scrollY > 600);
    };

    // Проверяем начальное состояние сразу после монтирования
    checkScroll();

    // Добавляем слушатель при монтировании компонента
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    window.addEventListener('load', checkScroll);

    // Cleanup: удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('load', checkScroll);
    };
  }, []);

  // Если isVisible === false, не рендеримся вообще (оптимизация)
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
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