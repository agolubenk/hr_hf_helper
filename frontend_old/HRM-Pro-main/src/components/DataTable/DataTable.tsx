import React, { useState, useMemo } from 'react';
import '../components.css';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface BulkAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: number[]) => void;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onRowClick,
  selectable = false,
  onSelectionChange,
  bulkActions = [],
  onBulkAction,
  pageSize = 10,
  searchable = true,
  filterable = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let result = data;

    // Поиск
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Фильтры по колонкам
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return result;
  }, [data, searchTerm, filters]);

  // Сортировка
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  // Обработчики
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (rowId: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map(row => row.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleBulkAction = (action: string) => {
    onBulkAction?.(action, Array.from(selectedRows));
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  };

  const renderCell = (row: any, column: Column) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }

    // Специальная обработка для статусов
    if (column.key === 'status') {
      const statusClass = value === 'active' || value === 'open' ? 'status-active' : 'status-inactive';
      return <span className={`status-badge ${statusClass}`}>{value}</span>;
    }

    return value;
  };

  return (
    <div className="data-table-container">
      {/* Панель инструментов */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          {searchable && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}
        </div>

        <div className="toolbar-right">
          {bulkActions.length > 0 && selectedRows.size > 0 && (
            <div className="bulk-actions">
              {bulkActions.map((action) => (
                <button
                  key={action.action}
                  className={`btn btn-sm ${action.variant || 'secondary'}`}
                  onClick={() => handleBulkAction(action.action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Фильтры */}
      {filterable && (
        <div className="table-filters">
          {columns.map((column) => (
            <div key={column.key} className="filter-item">
              <input
                type="text"
                placeholder={`Фильтр ${column.label}`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilterChange(column.key, e.target.value)}
                className="filter-input"
              />
            </div>
          ))}
        </div>
      )}

      {/* Таблица */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <span className={`sort-icon ${sortDirection}`}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? 'clickable' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key}>
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Показано {startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} из {sortedData.length}
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ←
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 