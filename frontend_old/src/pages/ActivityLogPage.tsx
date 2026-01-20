import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toastSuccess, toastError, toastWarning, toastInfo } from '../utils/toastHelper';
import { api } from '../utils/api';
import './ActivityLogPage.css';

// Data structure from activity-log.html
interface LogEntry {
  date: string;
  type: 'login' | 'edit' | 'delete' | 'create';
  action: string;
  icon: string;
  status: 'success' | 'error';
  statusText: 'Успех' | 'Ошибка';
  ip: string;
}

// Mock data generation logic from activity-log.html
const generateMockLogs = (): LogEntry[] => {
  const allLogs: LogEntry[] = [
    {date: '2024-06-10 14:23', type: 'login', action: 'Вход в систему', icon: 'bi-box-arrow-in-right text-info', status: 'success', statusText: 'Успех', ip: '192.168.1.10 (Chrome, macOS)'},
    {date: '2024-06-10 14:25', type: 'edit', action: 'Изменение профиля', icon: 'bi-pencil-square text-warning', status: 'success', statusText: 'Успех', ip: '192.168.1.10 (Chrome, macOS)'},
    {date: '2024-06-10 14:30', type: 'delete', action: 'Удаление заявки', icon: 'bi-trash text-danger', status: 'error', statusText: 'Ошибка', ip: '192.168.1.10 (Chrome, macOS)'},
    {date: '2024-06-10 15:00', type: 'create', action: 'Создание задачи', icon: 'bi-plus-circle text-success', status: 'success', statusText: 'Успех', ip: '192.168.1.10 (Chrome, macOS)'},
  ];

  while (allLogs.length < 100) {
      const i = allLogs.length + 1;
      const hour = 15 + Math.floor(i / 10);
      const min = (10 + i) % 60;
      const type = (['login','edit','delete','create'] as const)[i%4];
      const action = { login: 'Вход в систему', edit: 'Изменение профиля', delete: 'Удаление заявки', create: 'Создание задачи' }[type];
      const icon = { login: 'bi-box-arrow-in-right text-info', edit: 'bi-pencil-square text-warning', delete: 'bi-trash text-danger', create: 'bi-plus-circle text-success'}[type];
      const status = (i % 7 === 0 ? 'error' : 'success') as 'error' | 'success';
      const statusText = (status === 'success' ? 'Успех' : 'Ошибка') as 'Успех' | 'Ошибка';
      allLogs.push({
          date: `2024-06-10 ${hour.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`,
          type, action, icon, status, statusText,
          ip: `192.168.1.${10+i} (Chrome, macOS)`
      });
  }
  return allLogs;
};

const allLogs = generateMockLogs();

type ActiveTab = 'timeline' | 'table' | 'terminal';

const ActivityLogPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('table');
    const terminalRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<LogEntry[]>(allLogs);
    const [loading, setLoading] = useState(false);
    
    // State for selected rows in the table
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    
    // State for Excel export loading
    const [isExporting, setIsExporting] = useState(false);

    // State for filters
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSearch, setFilterSearch] = useState('');

    // Загружаем логи из API при монтировании
    useEffect(() => {
        const loadLogs = async () => {
            setLoading(true);
            try {
                const data = await api.getActivityLog(1, 100);
                if (data.logs && Array.isArray(data.logs)) {
                    // Преобразуем данные API в формат LogEntry
                    const apiLogs: LogEntry[] = data.logs.map((log: any) => ({
                        date: log.date || log.created_at || '',
                        type: log.type || 'edit',
                        action: log.action || log.description || '',
                        icon: log.icon || 'bi-info-circle text-info',
                        status: log.status || 'success',
                        statusText: log.status === 'error' ? 'Ошибка' : 'Успех',
                        ip: log.ip || log.ip_address || '',
                    }));
                    setLogs(apiLogs);
                }
            } catch (error) {
                console.error('Failed to load activity logs:', error);
                // Используем моковые данные при ошибке
                setLogs(allLogs);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            return (!filterDate || log.date.startsWith(filterDate)) &&
                (!filterType || log.type === filterType) &&
                (!filterStatus || log.status === filterStatus) &&
                (!filterSearch || log.action.toLowerCase().includes(filterSearch.toLowerCase()));
        });
    }, [logs, filterDate, filterType, filterStatus, filterSearch]);

    useEffect(() => {
        // Auto-scroll terminal on view change or data change
        if (activeTab === 'terminal' && terminalRef.current) {
            setTimeout(() => {
                if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                }
            }, 0);
        }
    }, [activeTab, filteredLogs]);

    const handleCopy = () => {
        if (terminalRef.current) {
            const terminalPre = terminalRef.current.querySelector('pre');
            if (!terminalPre) return;

            const selection = window.getSelection();
            let textToCopy = '';
            let lineCount = 0;

            // Check if there's a selection and it's within our terminal
            if (selection && selection.toString().length > 0 && terminalPre.contains(selection.anchorNode)) {
                textToCopy = selection.toString();
                lineCount = textToCopy.split('\n').filter(line => line.trim()).length;
            } else {
                // If no selection, copy the last 100 lines
                const lines = terminalPre.textContent?.split('\n') || [];
                textToCopy = lines.slice(-100).join('\n');
                lineCount = 100;
            }
            
            if (textToCopy) {
                 navigator.clipboard.writeText(textToCopy).then(() => {
                    toastSuccess(`Скопировано ${lineCount} строк из терминала`, 'Буфер обмена');
                }).catch(err => {
                    console.error('Не удалось скопировать логи: ', err);
                    toastError('Не удалось получить доступ к буферу обмена', 'Ошибка копирования');
                });
            }
        }
    };

    const handleDownloadExcel = async () => {
        setIsExporting(true);
        try {
            // Фиктивный экспорт в Excel - функция не реализована
            // В будущем можно добавить реальный экспорт
            await new Promise(resolve => setTimeout(resolve, 500)); // Имитация загрузки
            
            toastInfo('Экспорт в Excel временно недоступен. Используйте копирование данных из таблицы.', 'Информация');
        } catch (error: any) {
            console.error('Ошибка при экспорте в Excel:', error);
            toastError('Не удалось экспортировать файл Excel', 'Ошибка экспорта');
        } finally {
            setIsExporting(false);
        }
    };

    const handleToggleAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allRowIds = new Set(filteredLogs.map((_, index) => index));
            setSelectedRows(allRowIds);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleToggleRow = (index: number) => {
        setSelectedRows(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
            return newSelected;
        });
    };
    
    const handleCopyTable = () => {
        const count = selectedRows.size;
        if (count > 0) {
            const selectedLogs = filteredLogs.filter((_, index) => selectedRows.has(index));
            const textToCopy = selectedLogs.map(log => 
                `${log.date}\t${log.action}\t${log.statusText}\t${log.ip}`
            ).join('\n');
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                toastSuccess(`Скопировано ${count} строк из таблицы`, 'Буфер обмена');
            }).catch(err => {
                console.error('Не удалось скопировать строки: ', err);
                toastError('Не удалось получить доступ к буферу обмена', 'Ошибка копирования');
            });
        } else {
            toastWarning('Не выбрано ни одной строки', 'Буфер обмена');
        }
    };

    const renderContent = () => {
        const logsToRender = filteredLogs.slice().reverse();
        switch (activeTab) {
            case 'terminal':
                return (
                    <div className="activity-terminal-wrapper" ref={terminalRef}>
                        <pre id="terminalLog">
                            {allLogs.map((log, index) => `[${log.date}] ${log.action} [${log.statusText}] ${log.ip}`).join('\n')}
                        </pre>
                    </div>
                );
            case 'table':
                return (
                    <>
                        {selectedRows.size > 0 && (
                            <div className="table-actions-toolbar">
                                <span className="selection-count">{selectedRows.size} строк выбрано</span>
                                <button className="btn btn-sm btn-outline-primary" onClick={handleCopyTable}>
                                    <i className="bi bi-clipboard me-2"></i>
                                    Копировать
                                </button>
                            </div>
                        )}
                        <div className="tab-scroll-window">
                            <div className="activity-table">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input"
                                                    onChange={handleToggleAllRows}
                                                    checked={selectedRows.size === filteredLogs.length && filteredLogs.length > 0}
                                                />
                                            </th>
                                            <th>Дата и время</th>
                                            <th>Действие</th>
                                            <th>Результат</th>
                                            <th>IP / Устройство</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logsToRender.map((log, index) => (
                                            <tr key={index} className={selectedRows.has(index) ? 'selected' : ''}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input"
                                                        checked={selectedRows.has(index)}
                                                        onChange={() => handleToggleRow(index)}
                                                    />
                                                </td>
                                                <td>{log.date}</td>
                                                <td><i className={`bi ${log.icon} me-1`}></i> {log.action}</td>
                                                <td className={`status-${log.status}`}>{log.statusText}</td>
                                                <td>{log.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                );
            case 'timeline':
            default:
                return (
                    <div className="tab-scroll-window">
                        <div className="activity-timeline position-relative p-3">
                            {logsToRender.map((log, index) => {
                                 let iconClass = '';
                                 if (log.type === 'login') iconClass = 'timeline-icon-info';
                                 else if (log.type === 'edit') iconClass = 'timeline-icon-warning';
                                 else if (log.type === 'delete') iconClass = 'timeline-icon-error';
                                 else if (log.type === 'create') iconClass = 'timeline-icon-success';
                                 else iconClass = 'timeline-icon-primary';
                                return (
                                    <div className="timeline-item" key={index}>
                                        <div className="timeline-dot"><i className={`bi ${log.icon} ${iconClass}`}></i></div>
                                        <div className="timeline-card">
                                            <div className="d-flex justify-content-between align-items-start w-100">
                                                <div>
                                                    <span className="timeline-action">{log.action}</span>
                                                    <span className={`timeline-status-${log.status}`}>{log.statusText}</span>
                                                </div>
                                                <div className="timeline-date">{log.date}</div>
                                            </div>
                                            <div className="text-muted">{log.ip}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="activity-log-page">
            <div className="container" style={{maxWidth: '1100px'}}>
                 <Link to="/account/profile" className="btn btn-outline-secondary btn-profile-back">
                    <i className="bi bi-arrow-left me-2"></i>
                    Вернуться к профилю
                </Link>
            </div>
            <div className="activity-card">
                <div className="activity-header">
                    <h2 className="activity-title">
                        <i className="bi bi-clock-history"></i>
                        Логи и история действий
                    </h2>
                     <div className="filter-bar">
                        <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">Все действия</option>
                            <option value="login">Вход</option>
                            <option value="edit">Изменение</option>
                            <option value="delete">Удаление</option>
                            <option value="create">Создание</option>
                        </select>
                        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">Все статусы</option>
                            <option value="success">Успех</option>
                            <option value="error">Ошибка</option>
                        </select>
                        <input type="text" className="form-control" placeholder="Поиск по действию..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                        <button className="btn btn-primary" type="button" id="filterBtn"><i className="bi bi-funnel"></i></button>
                    </div>
                </div>

                <ul className="nav nav-tabs">
                    <div className="d-flex flex-row flex-grow-1">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>График-история</button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Таблица</button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'terminal' ? 'active' : ''}`} onClick={() => setActiveTab('terminal')}>Терминал</button>
                        </li>
                    </div>
                    <div className="tab-action-btns">
                        {activeTab === 'terminal' && (
                            <button className="btn-copy" title="Скопировать логи" onClick={handleCopy}>
                                <i className="bi bi-clipboard"></i>
                            </button>
                        )}
                        {activeTab !== 'terminal' && (
                            <button 
                                className="btn-excel" 
                                title="Скачать в формате Excel" 
                                onClick={handleDownloadExcel}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <>
                                        <i className="bi bi-arrow-clockwise spin"></i>
                                        <span className="ms-1">Экспорт...</span>
                                    </>
                                ) : (
                                    <i className="bi bi-file-earmark-excel"></i>
                                )}
                            </button>
                        )}
                    </div>
                </ul>

                <div className="tab-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogPage;

