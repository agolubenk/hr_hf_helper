/**
 * Показывает тост с предупреждением о том, что функциональность еще в разработке
 */
export const showNotImplementedToast = () => {
  if (typeof window !== 'undefined' && (window as any).addToast) {
    // Передаем useExplicit=true, чтобы гарантированно использовать именно это сообщение
    (window as any).addToast('warning', 'В разработке', 'Данная функциональность еще в разработке', true);
  } else {
    console.warn('Toast system not available');
  }
};

