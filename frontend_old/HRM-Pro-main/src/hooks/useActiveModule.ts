import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MODULES } from '../constants';

export const useActiveModule = () => {
  const { state, dispatch } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Определяем активный модуль на основе URL
    let activeModule: string | null = null;
    
    if (path.startsWith('/cb')) {
      activeModule = MODULES.CB;
    } else if (path.startsWith('/settings')) {
      activeModule = MODULES.SETTINGS;
    } else if (path.startsWith('/employees')) {
      activeModule = MODULES.EMPLOYEES;
    } else if (path.startsWith('/recruiting')) {
      activeModule = MODULES.RECRUITING;
    } else if (path.startsWith('/adaptation')) {
      activeModule = MODULES.ADAPTATION;
    } else if (path.startsWith('/hrops')) {
      activeModule = MODULES.HROPS;
    } else if (path.startsWith('/ld')) {
      activeModule = MODULES.LD;
    } else if (path.startsWith('/performance')) {
      activeModule = MODULES.PERFORMANCE;
    } else if (path.startsWith('/okr')) {
      activeModule = MODULES.OKR;
    } else if (path.startsWith('/time')) {
      activeModule = MODULES.TIME;
    } else if (path.startsWith('/projects')) {
      activeModule = MODULES.PROJECTS;
    } else if (path.startsWith('/wiki')) {
      activeModule = MODULES.WIKI;
    } else if (path.startsWith('/corporate')) {
      activeModule = MODULES.CORPORATE;
    } else if (path.startsWith('/reports')) {
      activeModule = MODULES.REPORTS;
    } else if (path === '/') {
      activeModule = MODULES.DASHBOARD;
    }
    
    // Устанавливаем активный модуль только если он изменился
    if (activeModule !== state.activeModule) {
      dispatch({ type: 'SET_ACTIVE_MODULE', payload: activeModule });
    }
  }, [location.pathname, state.activeModule, dispatch]);

  return state.activeModule;
};

/**
 * Хук для применения настроек анимаций к элементу
 * @param elementRef - ссылка на DOM элемент
 * @param animationType - тип анимации ('transition' | 'animation')
 */
export const useAnimationSettings = (
  elementRef: React.RefObject<HTMLElement>,
  animationType: 'transition' | 'animation' = 'transition'
) => {
  const { state } = useAppContext();
  const { animations, transitions } = state.themeSettings;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (animationType === 'transition') {
      if (!transitions) {
        element.style.transition = 'none';
      } else if (animations === 'reduced') {
        element.style.transition = 'all 0.75s ease';
      } else {
        element.style.transition = 'all 0.3s ease';
      }
    } else {
      if (animations === 'disabled') {
        element.style.animation = 'none';
      } else if (animations === 'reduced') {
        // Уменьшаем длительность анимаций
        const computedStyle = window.getComputedStyle(element);
        const animationName = computedStyle.animationName;
        if (animationName && animationName !== 'none') {
          element.style.animation = `${animationName} 5s ease`;
        }
      }
    }
  }, [elementRef, animations, transitions, animationType]);
};

/**
 * Хук для получения CSS классов в зависимости от настроек анимаций
 */
export const useAnimationClasses = () => {
  const { state } = useAppContext();
  const { animations, transitions } = state.themeSettings;

  const getTransitionClass = (baseClass: string) => {
    if (!transitions) return `${baseClass} no-transitions`;
    if (animations === 'reduced') return `${baseClass} reduced-animations`;
    return baseClass;
  };

  const getAnimationClass = (baseClass: string) => {
    if (animations === 'disabled') return `${baseClass} no-animations`;
    if (animations === 'reduced') return `${baseClass} reduced-animations`;
    return baseClass;
  };

  return {
    getTransitionClass,
    getAnimationClass,
    animationsEnabled: animations !== 'disabled',
    transitionsEnabled: transitions,
    isReducedMotion: animations === 'reduced'
  };
}; 