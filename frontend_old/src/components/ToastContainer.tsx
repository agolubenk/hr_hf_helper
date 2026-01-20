import { useState, useEffect, useRef } from 'react';
import Toast from './Toast';
import type { ToastMessage, ToastType, ToastAction } from './Toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'bottom-left',
  className = ''
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToastRef = useRef<(type: ToastType, title: string, message: string) => void>();

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const pinToast = (id: number) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, pinned: !toast.pinned } : toast
    ));
  };

  // Примеры сообщений с кодом (5-7 строк)
  const codeExamples = [
    {
      type: 'info' as ToastType,
      title: 'Пример кода',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Пример использования функции:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`function handleClick() {
  console.log('Clicked!');
  setState(prev => !prev);
  updateData();
  showNotification();
}`}
          </pre>
        </div>
      )
    },
    {
      type: 'document' as ToastType,
      title: 'Документация',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Синтаксис компонента:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`<Component
  prop1="value1"
  prop2={value2}
  onClick={handleClick}
  disabled={false}
/>`}
          </pre>
        </div>
      )
    },
    {
      type: 'error' as ToastType,
      title: 'Ошибка выполнения',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Ошибка в коде:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            color: 'var(--bs-danger)',
            maxHeight: '150px'
          }}>
{`TypeError: Cannot read property
  'value' of undefined
  at line 42:15
  at processData (utils.js:15)
  at handleSubmit (form.js:28)`}
          </pre>
        </div>
      )
    },
    {
      type: 'success' as ToastType,
      title: 'Код выполнен',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Успешное выполнение:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`const result = await fetch('/api/data');
const data = await result.json();
console.log(data);
updateUI(data);
notifyUser('Success');`}
          </pre>
        </div>
      )
    },
    {
      type: 'warning' as ToastType,
      title: 'Предупреждение кода',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Устаревший синтаксис:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`// Устаревший способ
var oldVar = 'value';
function oldFunction() {
  return oldVar;
}`}
          </pre>
        </div>
      )
    },
    {
      type: 'task' as ToastType,
      title: 'Задача с кодом',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Пример обработки задачи:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`async function processTask(id) {
  const task = await getTask(id);
  await updateStatus(task, 'done');
  notifyUser(task);
}`}
          </pre>
        </div>
      )
    },
    {
      type: 'message' as ToastType,
      title: 'Сообщение с кодом',
      message: (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Форматирование сообщения:</div>
          <pre style={{ 
            background: 'var(--bs-secondary-bg)', 
            padding: '0.5rem', 
            borderRadius: 'var(--bs-border-radius)', 
            fontSize: '0.75rem',
            overflow: 'auto',
            margin: 0,
            maxHeight: '150px'
          }}>
{`const message = formatMessage({
  user: currentUser,
  text: inputText,
  timestamp: Date.now()
});
sendMessage(message);`}
          </pre>
        </div>
      )
    }
  ];

  // Стандартные сообщения
  const standardMessages: Array<{type: ToastType, title: string, message: string, actions?: ToastAction[]}> = [
    { type: 'success', title: 'Успех', message: 'Операция выполнена успешно' },
    { type: 'error', title: 'Ошибка', message: 'Ошибка при сохранении данных' },
    { type: 'info', title: 'Информация', message: 'Важная информация для вас' },
    { type: 'warning', title: 'Предупреждение', message: 'Требуется ваше внимание' },
    { type: 'message', title: 'Новое сообщение', message: 'Новое сообщение от Ивана Петрова' },
    { type: 'task', title: 'Задача', message: 'Новая задача назначена вам' },
    { type: 'calendar', title: 'Календарь', message: 'Встреча запланирована на завтра' },
    { type: 'mention', title: 'Упоминание', message: 'Вас упомянули в комментарии' },
    { type: 'document', title: 'Документ', message: 'Новый документ готов к просмотру' },
    { 
      type: 'success', 
      title: 'Действие выполнено', 
      message: 'Файл успешно загружен',
      actions: [
        { label: 'Открыть', onClick: () => console.log('Открыть'), variant: 'primary' },
        { label: 'Закрыть', onClick: () => console.log('Закрыть'), variant: 'secondary' }
      ]
    },
    { 
      type: 'error', 
      title: 'Ошибка загрузки', 
      message: 'Не удалось загрузить файл. Попробуйте еще раз.',
      actions: [
        { label: 'Повторить', onClick: () => console.log('Повторить'), variant: 'primary' },
        { label: 'Отмена', onClick: () => console.log('Отмена'), variant: 'secondary' }
      ]
    },
    { 
      type: 'info', 
      title: 'Новое обновление', 
      message: 'Доступна новая версия приложения',
      actions: [
        { label: 'Обновить', onClick: () => console.log('Обновить'), variant: 'success' },
        { label: 'Позже', onClick: () => console.log('Позже'), variant: 'secondary' }
      ]
    }
  ];

  // Метод для добавления тоста
  // Если переданы явные параметры (не пустые), используем их напрямую
  // Иначе рандомно выбираем между стандартными и примерами с кодом
  const addToast = (type: ToastType, title: string, message: string, useExplicit: boolean = false) => {
    let newToast: ToastMessage;
    
    // Если это явный вызов (например, из showNotImplementedToast), всегда используем переданные параметры
    if (useExplicit || (title && message && title !== '' && message !== '')) {
      newToast = {
        id: Date.now(),
        type,
        title,
        message,
        pinned: false,
        minimized: false
      };
    } else {
      // Для демонстрационных целей: рандомно выбираем между стандартными и примерами с кодом
      // 30% вероятность показать пример с кодом
      const showCodeExample = Math.random() < 0.3;
      
      if (showCodeExample && codeExamples.length > 0) {
        // Выбираем случайный пример с кодом
        const randomExample = codeExamples[Math.floor(Math.random() * codeExamples.length)];
        newToast = {
          id: Date.now(),
          type: randomExample.type,
          title: randomExample.title,
          message: randomExample.message,
          pinned: false,
          minimized: false
        };
      } else {
        // Выбираем случайное стандартное сообщение
        const useRandom = Math.random() < 0.5 && standardMessages.length > 0;
        if (useRandom) {
          const randomMessage = standardMessages[Math.floor(Math.random() * standardMessages.length)];
          newToast = {
            id: Date.now(),
            type: randomMessage.type,
            title: randomMessage.title,
            message: randomMessage.message,
            actions: randomMessage.actions,
            pinned: false,
            minimized: false
          };
        } else {
          newToast = {
            id: Date.now(),
            type,
            title,
            message,
            pinned: false,
            minimized: false
          };
        }
      }
    }
    
    setToasts(prev => [...prev, newToast]);
  };

  // Метод для добавления тоста с actions
  const addToastWithActions = (
    type: ToastType,
    title: string,
    message: string,
    actions: ToastAction[] = [],
    useExplicit: boolean = false
  ) => {
    const newToast: ToastMessage = {
      id: Date.now(),
      type,
      title,
      message,
      actions,
      pinned: false,
      minimized: false
    };
    setToasts(prev => [...prev, newToast]);
  };

  addToastRef.current = addToast;

  // Экспортируем методы через window для глобального доступа
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).addToast = (type: ToastType, title: string, message: string, useExplicit?: boolean) => {
        if (addToastRef.current) {
          addToastRef.current(type, title, message, useExplicit);
        }
      };
      (window as any).addToastWithActions = (
        type: ToastType,
        title: string,
        message: string,
        actions: ToastAction[] = [],
        useExplicit?: boolean
      ) => {
        addToastWithActions(type, title, message, actions, useExplicit);
      };
    }
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  const positionClass = `toast-container-${position}`;

  // Сортируем тосты: новые снизу (в конце массива), старые сверху
  // При отображении используем reverse, чтобы новые были снизу
  const sortedToasts = [...toasts].reverse();

  return (
    <div className={`toast-container ${positionClass} ${className}`}>
      {sortedToasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
          onPin={pinToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

