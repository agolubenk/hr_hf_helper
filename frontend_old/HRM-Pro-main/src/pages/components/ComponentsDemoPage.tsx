import React, { useState } from 'react';
import './ComponentsDemoPage.css';

// Импорты для компонентов
import DataTable from '../../components/DataTable/DataTable';
import DetailView from '../../components/DetailView/DetailView';
import FormBuilder from '../../components/FormBuilder/FormBuilder';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  hireDate: string;
  salary: string;
  manager: string;
}

interface Vacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: 'open' | 'closed' | 'draft';
  candidates: number;
  createdAt: string;
  experience: string;
  type: string;
}

const ComponentsDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formType, setFormType] = useState<'employee' | 'vacancy'>('employee');

  // Расширенные моковые данные
  const employees: Employee[] = [
    {
      id: 1,
      name: 'Иван Петров',
      position: 'Frontend Developer',
      department: 'IT',
      email: 'ivan.petrov@company.com',
      phone: '+7 (999) 123-45-67',
      status: 'active',
      hireDate: '2023-01-15',
      salary: '150,000 ₽',
      manager: 'Анна Сидорова'
    },
    {
      id: 2,
      name: 'Мария Сидорова',
      position: 'HR Manager',
      department: 'HR',
      email: 'maria.sidorova@company.com',
      phone: '+7 (999) 234-56-78',
      status: 'active',
      hireDate: '2022-08-20',
      salary: '180,000 ₽',
      manager: 'Петр Иванов'
    },
    {
      id: 3,
      name: 'Алексей Козлов',
      position: 'Project Manager',
      department: 'PMO',
      email: 'alexey.kozlov@company.com',
      phone: '+7 (999) 345-67-89',
      status: 'inactive',
      hireDate: '2021-12-10',
      salary: '200,000 ₽',
      manager: 'Елена Петрова'
    },
    {
      id: 4,
      name: 'Елена Петрова',
      position: 'UX/UI Designer',
      department: 'Design',
      email: 'elena.petrova@company.com',
      phone: '+7 (999) 456-78-90',
      status: 'active',
      hireDate: '2023-03-05',
      salary: '140,000 ₽',
      manager: 'Анна Сидорова'
    },
    {
      id: 5,
      name: 'Дмитрий Волков',
      position: 'Backend Developer',
      department: 'IT',
      email: 'dmitry.volkov@company.com',
      phone: '+7 (999) 567-89-01',
      status: 'active',
      hireDate: '2022-11-12',
      salary: '160,000 ₽',
      manager: 'Анна Сидорова'
    }
  ];

  const vacancies: Vacancy[] = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'IT',
      location: 'Москва',
      salary: '150,000 - 200,000 ₽',
      status: 'open',
      candidates: 12,
      createdAt: '2024-01-10',
      experience: '3+ лет',
      type: 'Полная занятость'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Санкт-Петербург',
      salary: '120,000 - 160,000 ₽',
      status: 'open',
      candidates: 8,
      createdAt: '2024-01-08',
      experience: '2+ лет',
      type: 'Полная занятость'
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'Product',
      location: 'Москва',
      salary: '180,000 - 250,000 ₽',
      status: 'closed',
      candidates: 15,
      createdAt: '2023-12-20',
      experience: '4+ лет',
      type: 'Полная занятость'
    },
    {
      id: 4,
      title: 'QA Engineer',
      department: 'IT',
      location: 'Москва',
      salary: '100,000 - 140,000 ₽',
      status: 'draft',
      candidates: 0,
      createdAt: '2024-01-15',
      experience: '2+ лет',
      type: 'Полная занятость'
    },
    {
      id: 5,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Удаленно',
      salary: '80,000 - 120,000 ₽',
      status: 'open',
      candidates: 6,
      createdAt: '2024-01-12',
      experience: '1+ лет',
      type: 'Полная занятость'
    }
  ];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Выполняется массовое действие: ${action} для элементов:`, selectedItems);
    // Здесь будет логика массовых операций
    alert(`Выполняется действие "${action}" для ${selectedItems.length} элементов`);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Данные формы:', data);
    alert('Форма успешно отправлена!');
    setShowForm(false);
  };

  const handleDetailAction = (action: string) => {
    console.log('Действие в детальной карточке:', action);
    if (action === 'edit') {
      setFormType(selectedItem?.department === 'IT' ? 'employee' : 'vacancy');
      setShowForm(true);
      setShowDetail(false);
    } else if (action === 'delete') {
      if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
        alert('Элемент удален!');
        setShowDetail(false);
      }
    }
  };

  const renderEmployeesTable = () => (
    <div className="demo-section">
      <div className="section-header">
        <h3>Сотрудники</h3>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormType('employee');
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus"></i> Добавить сотрудника
        </button>
      </div>
      
      <DataTable
        data={employees}
        columns={[
          { key: 'name', label: 'Имя', sortable: true },
          { key: 'position', label: 'Должность', sortable: true },
          { key: 'department', label: 'Отдел', sortable: true },
          { key: 'email', label: 'Email' },
          { key: 'salary', label: 'Зарплата', sortable: true },
          { key: 'manager', label: 'Руководитель' },
          { key: 'status', label: 'Статус', sortable: true },
          { key: 'hireDate', label: 'Дата найма', sortable: true }
        ]}
        onRowClick={handleRowClick}
        selectable={true}
        onSelectionChange={setSelectedItems}
        bulkActions={[
          { label: 'Активировать', action: 'activate', variant: 'primary' },
          { label: 'Деактивировать', action: 'deactivate', variant: 'secondary' },
          { label: 'Удалить', action: 'delete', variant: 'danger' }
        ]}
        onBulkAction={handleBulkAction}
        pageSize={3}
      />
    </div>
  );

  const renderVacanciesTable = () => (
    <div className="demo-section">
      <div className="section-header">
        <h3>Вакансии</h3>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormType('vacancy');
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus"></i> Создать вакансию
        </button>
      </div>
      
      <DataTable
        data={vacancies}
        columns={[
          { key: 'title', label: 'Название', sortable: true },
          { key: 'department', label: 'Отдел', sortable: true },
          { key: 'location', label: 'Локация', sortable: true },
          { key: 'salary', label: 'Зарплата' },
          { key: 'experience', label: 'Опыт' },
          { key: 'type', label: 'Тип занятости' },
          { key: 'status', label: 'Статус', sortable: true },
          { key: 'candidates', label: 'Кандидаты', sortable: true },
          { key: 'createdAt', label: 'Дата создания', sortable: true }
        ]}
        onRowClick={handleRowClick}
        selectable={true}
        onSelectionChange={setSelectedItems}
        bulkActions={[
          { label: 'Открыть', action: 'open', variant: 'primary' },
          { label: 'Закрыть', action: 'close', variant: 'secondary' },
          { label: 'Удалить', action: 'delete', variant: 'danger' }
        ]}
        onBulkAction={handleBulkAction}
        pageSize={3}
      />
    </div>
  );

  const renderFormDemo = () => {
    const employeeFields = [
      {
        name: 'name',
        label: 'Имя',
        type: 'text' as const,
        required: true,
        placeholder: 'Введите полное имя'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        required: true,
        placeholder: 'example@company.com'
      },
      {
        name: 'position',
        label: 'Должность',
        type: 'select' as const,
        options: [
          { value: 'developer', label: 'Разработчик' },
          { value: 'designer', label: 'Дизайнер' },
          { value: 'manager', label: 'Менеджер' },
          { value: 'hr', label: 'HR специалист' }
        ],
        required: true
      },
      {
        name: 'department',
        label: 'Отдел',
        type: 'select' as const,
        options: [
          { value: 'it', label: 'IT' },
          { value: 'hr', label: 'HR' },
          { value: 'marketing', label: 'Маркетинг' },
          { value: 'design', label: 'Дизайн' }
        ],
        required: true
      },
      {
        name: 'salary',
        label: 'Зарплата',
        type: 'number' as const,
        required: true,
        placeholder: 'Введите сумму',
        min: 30000,
        max: 500000
      },
      {
        name: 'hireDate',
        label: 'Дата найма',
        type: 'date' as const,
        required: true
      },
      {
        name: 'notes',
        label: 'Примечания',
        type: 'textarea' as const,
        placeholder: 'Дополнительная информация',
        rows: 3
      }
    ];

    const vacancyFields = [
      {
        name: 'title',
        label: 'Название вакансии',
        type: 'text' as const,
        required: true,
        placeholder: 'Введите название вакансии'
      },
      {
        name: 'department',
        label: 'Отдел',
        type: 'select' as const,
        options: [
          { value: 'it', label: 'IT' },
          { value: 'hr', label: 'HR' },
          { value: 'marketing', label: 'Маркетинг' },
          { value: 'design', label: 'Дизайн' }
        ],
        required: true
      },
      {
        name: 'location',
        label: 'Локация',
        type: 'select' as const,
        options: [
          { value: 'moscow', label: 'Москва' },
          { value: 'spb', label: 'Санкт-Петербург' },
          { value: 'remote', label: 'Удаленно' }
        ],
        required: true
      },
      {
        name: 'salary',
        label: 'Зарплата',
        type: 'text' as const,
        required: true,
        placeholder: 'Например: 100,000 - 150,000 ₽'
      },
      {
        name: 'experience',
        label: 'Требуемый опыт',
        type: 'select' as const,
        options: [
          { value: '0', label: 'Без опыта' },
          { value: '1', label: '1+ лет' },
          { value: '2', label: '2+ лет' },
          { value: '3', label: '3+ лет' },
          { value: '5', label: '5+ лет' }
        ],
        required: true
      },
      {
        name: 'type',
        label: 'Тип занятости',
        type: 'select' as const,
        options: [
          { value: 'full', label: 'Полная занятость' },
          { value: 'part', label: 'Частичная занятость' },
          { value: 'contract', label: 'Контракт' }
        ],
        required: true
      },
      {
        name: 'description',
        label: 'Описание вакансии',
        type: 'textarea' as const,
        placeholder: 'Подробное описание требований и обязанностей',
        rows: 4
      }
    ];

    return (
      <div className="demo-section">
        <h3>Универсальный конструктор форм</h3>
        <FormBuilder
          fields={formType === 'employee' ? employeeFields : vacancyFields}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          submitLabel="Сохранить"
          cancelLabel="Отмена"
          title={formType === 'employee' ? 'Добавление сотрудника' : 'Создание вакансии'}
        />
      </div>
    );
  };

  const renderDetailDemo = () => {
    const isEmployee = selectedItem?.email;
    
    const tabs = [
      {
        id: 'general',
        label: 'Общая информация',
        content: (
          <div className="detail-content">
            <div className="detail-row">
              <span className="label">Имя:</span>
              <span className="value">{selectedItem?.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">{isEmployee ? 'Должность:' : 'Название:'}</span>
              <span className="value">{selectedItem?.position || selectedItem?.title}</span>
            </div>
            <div className="detail-row">
              <span className="label">Отдел:</span>
              <span className="value">{selectedItem?.department}</span>
            </div>
            {isEmployee ? (
              <>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedItem?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Телефон:</span>
                  <span className="value">{selectedItem?.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Зарплата:</span>
                  <span className="value">{selectedItem?.salary}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Руководитель:</span>
                  <span className="value">{selectedItem?.manager}</span>
                </div>
              </>
            ) : (
              <>
                <div className="detail-row">
                  <span className="label">Локация:</span>
                  <span className="value">{selectedItem?.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Зарплата:</span>
                  <span className="value">{selectedItem?.salary}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Опыт:</span>
                  <span className="value">{selectedItem?.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Тип занятости:</span>
                  <span className="value">{selectedItem?.type}</span>
                </div>
              </>
            )}
            <div className="detail-row">
              <span className="label">Статус:</span>
              <span className="value">
                <span className={`status-badge ${selectedItem?.status === 'active' || selectedItem?.status === 'open' ? 'status-active' : 'status-inactive'}`}>
                  {selectedItem?.status}
                </span>
              </span>
            </div>
          </div>
        )
      },
      {
        id: 'history',
        label: 'История',
        content: (
          <div className="detail-content">
            <p>История изменений и активности</p>
            <div className="detail-row">
              <span className="label">Дата создания:</span>
              <span className="value">{selectedItem?.hireDate || selectedItem?.createdAt}</span>
            </div>
            {!isEmployee && (
              <div className="detail-row">
                <span className="label">Кандидатов:</span>
                <span className="value">{selectedItem?.candidates}</span>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'documents',
        label: 'Документы',
        content: (
          <div className="detail-content">
            <p>Список связанных документов</p>
            <div className="detail-row">
              <span className="label">Договор:</span>
              <span className="value">Договор №{selectedItem?.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Резюме:</span>
              <span className="value">Резюме_{selectedItem?.name?.replace(' ', '_')}.pdf</span>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="demo-section">
        <h3>Детальная карточка</h3>
        <DetailView
          data={selectedItem}
          tabs={tabs}
          actions={[
            { label: 'Редактировать', action: 'edit', variant: 'primary' },
            { label: 'Удалить', action: 'delete', variant: 'danger' }
          ]}
          onAction={handleDetailAction}
          onClose={() => setShowDetail(false)}
          title={isEmployee ? `Профиль: ${selectedItem?.name}` : `Вакансия: ${selectedItem?.title}`}
        />
      </div>
    );
  };

  return (
    <div className="components-demo-page">
      <div className="demo-header">
        <h1>Демонстрация переиспользуемых компонентов</h1>
        <p>Примеры CRUD-операций и универсальных компонентов для HRM-системы</p>
      </div>

      <div className="demo-tabs">
        <button 
          className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <i className="bi bi-people"></i> Сотрудники
        </button>
        <button 
          className={`tab-button ${activeTab === 'vacancies' ? 'active' : ''}`}
          onClick={() => setActiveTab('vacancies')}
        >
          <i className="bi bi-briefcase"></i> Вакансии
        </button>
        <button 
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <i className="bi bi-file-earmark-text"></i> Формы
        </button>
        <button 
          className={`tab-button ${activeTab === 'detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('detail')}
        >
          <i className="bi bi-card-text"></i> Детали
        </button>
      </div>

      <div className="demo-content">
        {activeTab === 'employees' && renderEmployeesTable()}
        {activeTab === 'vacancies' && renderVacanciesTable()}
        {activeTab === 'form' && renderFormDemo()}
        {activeTab === 'detail' && selectedItem && renderDetailDemo()}
      </div>

      {/* Модальные окна */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {renderFormDemo()}
          </div>
        </div>
      )}

      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {renderDetailDemo()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsDemoPage; 