import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ThemeSelector from '../components/ThemeSelector';
import QuickPanel from '../components/QuickPanel';
import CopyFloatingGroup from '../components/CopyFloatingGroup';
import LanguageSelector from '../components/LanguageSelector';
import UserDropdown from '../components/UserDropdown';
import ToastContainer from '../components/ToastContainer';
import type { CopyFloatingAction } from '../components/CopyFloatingGroup';
import { showNotImplementedToast } from '../utils/showNotImplementedToast';
import './UICheatsheet.css';

const UICheatsheet: React.FC = () => {
  const [quickPanelOpen, setQuickPanelOpen] = useState(false);
  
  const floatingActions: CopyFloatingAction[] = [
    {
      id: 'copy',
      icon: 'bi-copy',
      label: 'Копировать',
      color: 'primary',
      onClick: showNotImplementedToast,
    },
    {
      id: 'save',
      icon: 'bi-check-lg',
      label: 'Сохранить',
      color: 'success',
      onClick: showNotImplementedToast,
    },
    {
      id: 'info',
      icon: 'bi-info-circle',
      label: 'Информация',
      color: 'info',
      onClick: showNotImplementedToast,
    },
    {
      id: 'warning',
      icon: 'bi-exclamation-triangle',
      label: 'Предупреждение',
      color: 'warning',
      onClick: showNotImplementedToast,
    },
    {
      id: 'delete',
      icon: 'bi-trash',
      label: 'Удалить',
      color: 'danger',
      onClick: showNotImplementedToast,
    },
  ];


  useEffect(() => {
    // Инициализация Bootstrap компонентов
    const initBootstrap = async () => {
      // Используем window.bootstrap если доступен, иначе импортируем
      let bootstrap: any;
      if (typeof window !== 'undefined' && (window as any).bootstrap) {
        bootstrap = (window as any).bootstrap;
      } else {
        // @ts-ignore - Bootstrap types may not be available
        bootstrap = await import('bootstrap');
      }
      
      // Используем setTimeout чтобы убедиться, что DOM полностью готов
      setTimeout(() => {
        // Инициализация всех dropdowns - используем более надежный способ
        const initDropdown = (element: Element) => {
          try {
            const existingDropdown = bootstrap.Dropdown.getInstance(element);
            if (existingDropdown) {
              existingDropdown.dispose();
            }
            const dropdown = new bootstrap.Dropdown(element, {
              boundary: 'viewport'
            });
            return dropdown;
          } catch (e) {
            console.warn('Failed to initialize dropdown:', e);
            return null;
          }
        };
        
        const dropdownList: any[] = [];
        
        // Инициализируем все dropdowns на странице (включая Header)
        const dropdownElementList = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        dropdownElementList.forEach(dropdownToggleEl => {
          const dropdown = initDropdown(dropdownToggleEl);
          if (dropdown) {
            dropdownList.push(dropdown);
          }
        });
        
        // Инициализация всех popovers
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
        const popoverList: any[] = [];
        popoverTriggerList.forEach(popoverTriggerEl => {
          try {
            const popover = new bootstrap.Popover(popoverTriggerEl);
            popoverList.push(popover);
          } catch (e) {
            console.warn('Failed to initialize popover:', e);
          }
        });
        
        // Инициализация всех tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList: any[] = [];
        tooltipTriggerList.forEach(tooltipTriggerEl => {
          try {
            const tooltip = new bootstrap.Tooltip(tooltipTriggerEl);
            tooltipList.push(tooltip);
          } catch (e) {
            console.warn('Failed to initialize tooltip:', e);
          }
        });
        
        // Инициализация Scrollspy
        const scrollSpyElements = document.querySelectorAll('[data-bs-spy="scroll"]');
        const scrollSpyList: any[] = [];
        scrollSpyElements.forEach(scrollSpyEl => {
          try {
            const scrollSpy = new bootstrap.ScrollSpy(scrollSpyEl);
            scrollSpyList.push(scrollSpy);
          } catch (e) {
            console.warn('Failed to initialize scrollspy:', e);
          }
        });
        
        // Инициализация табов (для Activity Log и других)
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tabEl => {
          tabEl.addEventListener('shown.bs.tab', (e: any) => {
            // Обновляем активные табы
            const targetId = e.target.getAttribute('data-bs-target');
            if (targetId) {
              const targetPane = document.querySelector(targetId);
              if (targetPane) {
                // Можно добавить дополнительную логику при переключении табов
              }
            }
          });
        });
        
        // Инициализация всех toasts
        const toastElements = document.querySelectorAll('.toast');
        const toastList: any[] = [];
        toastElements.forEach(toastEl => {
          try {
            const existingToast = bootstrap.Toast.getInstance(toastEl);
            if (existingToast) {
              existingToast.dispose();
            }
            const toast = new bootstrap.Toast(toastEl, { autohide: false });
            toastList.push(toast);
          } catch (e) {
            console.warn('Failed to initialize toast:', e);
          }
        });
        
        // Обработчики для кнопок показа toast
        document.querySelectorAll('[data-bs-toggle="toast"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-bs-target');
            if (targetId) {
              const targetEl = document.querySelector(targetId);
              if (targetEl) {
                const toastInstance = bootstrap.Toast.getInstance(targetEl) || new bootstrap.Toast(targetEl);
                toastInstance.show();
              }
            }
          });
        });
        
        // Обработчики для Range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach((rangeInput: any) => {
          const rangeId = rangeInput.id;
          if (rangeId === 'customRange2') {
            const valueSpan = document.getElementById('rangeValue1');
            if (valueSpan) {
              valueSpan.textContent = rangeInput.value;
              rangeInput.addEventListener('input', (e: any) => {
                valueSpan.textContent = e.target.value;
              });
            }
          } else if (rangeId === 'customRange4') {
            const valueSpan = document.getElementById('rangeValue2');
            if (valueSpan) {
              valueSpan.textContent = rangeInput.value;
              rangeInput.addEventListener('input', (e: any) => {
                valueSpan.textContent = e.target.value;
              });
            }
          }
        });
        
        // Повторная инициализация dropdowns через небольшую задержку (для динамически добавленных элементов)
        setTimeout(() => {
          const lateDropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]:not([data-bs-dropdown-initialized])');
          lateDropdowns.forEach(dropdownEl => {
            try {
              if (!bootstrap.Dropdown.getInstance(dropdownEl)) {
                const dropdown = new bootstrap.Dropdown(dropdownEl, {
                  boundary: 'viewport'
                });
                dropdownList.push(dropdown);
                dropdownEl.setAttribute('data-bs-dropdown-initialized', 'true');
              }
            } catch (e) {
              console.warn('Failed to initialize late dropdown:', e);
            }
          });
        }, 300);
        
        // Дополнительная инициализация через MutationObserver для динамически добавленных элементов
        const observer = new MutationObserver(() => {
          const newDropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]:not([data-bs-dropdown-initialized])');
          newDropdowns.forEach(dropdownEl => {
            try {
              if (!bootstrap.Dropdown.getInstance(dropdownEl)) {
                const dropdown = new bootstrap.Dropdown(dropdownEl, {
                  boundary: 'viewport'
                });
                dropdownList.push(dropdown);
                dropdownEl.setAttribute('data-bs-dropdown-initialized', 'true');
              }
            } catch (e) {
              console.warn('Failed to initialize observed dropdown:', e);
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        return () => {
          // Cleanup
          observer.disconnect();
          dropdownList.forEach(dropdown => dropdown?.dispose());
          popoverList.forEach(popover => popover?.dispose());
          tooltipList.forEach(tooltip => tooltip?.dispose());
          scrollSpyList.forEach(scrollSpy => scrollSpy?.dispose());
          toastList.forEach(toast => toast?.dispose());
        };
      }, 100);
    };
    
    initBootstrap();
  }, []);

  return (
    <div className="cheatsheet-page">
      {/* Header */}
      <header className="cheatsheet-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="display-4">UI Components Cheatsheet</h1>
              <p className="lead text-muted">
                Полный каталог UI компонентов HRM Pro
              </p>
            </div>
            <div>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="cheatsheet-sidebar">
        <nav className="sticky-top">
          <h6 className="sidebar-heading">Содержание</h6>
          <ul className="nav flex-column">
            <li className="nav-item">
              <button type="button" className="btn d-inline-flex align-items-center border-0 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#contents-collapse" aria-expanded="true">
                <i className="bi bi-file-text me-2"></i>
                Contents
              </button>
              <ul className="list-unstyled ps-3 collapse show" id="contents-collapse">
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#typography">Typography</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#images">Images</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#tables">Tables</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#figures">Figures</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <button type="button" className="btn d-inline-flex align-items-center border-0 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#forms-collapse" aria-expanded="true">
                <i className="bi bi-input-cursor-text me-2"></i>
                Forms
              </button>
              <ul className="list-unstyled ps-3 collapse show" id="forms-collapse">
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#overview">Overview</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#disabled-forms">Disabled forms</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#sizing">Sizing</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#input-group">Input group</a></li>
                    <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#floating-labels">Floating labels</a></li>
                    <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#range">Range</a></li>
                    <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#validation">Validation</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <button type="button" className="btn d-inline-flex align-items-center border-0 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#components-collapse" aria-expanded="true">
                <i className="bi bi-puzzle me-2"></i>
                Components
              </button>
              <ul className="list-unstyled ps-3 collapse show" id="components-collapse">
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#accordion">Accordion</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#alerts">Alerts</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#badge">Badge</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#breadcrumb">Breadcrumb</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#buttons">Buttons</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#button-group">Button group</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#card">Card</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#carousel">Carousel</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#dropdowns">Dropdowns</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#list-group">List group</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#modal">Modal</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#navs">Navs</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#navbar">Navbar</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#pagination">Pagination</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#popovers">Popovers</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#progress">Progress</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#scrollspy">Scrollspy</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#spinners">Spinners</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#toasts">Toasts</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#tooltips">Tooltips</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <button type="button" className="btn d-inline-flex align-items-center border-0 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#hrm-components-collapse" aria-expanded="true">
                <i className="bi bi-hexagon-fill me-2"></i>
                HRM Pro Components
              </button>
              <ul className="list-unstyled ps-3 collapse show" id="hrm-components-collapse">
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#command-center">Command Center</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#stat-widgets">Stat Widgets</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#module-grid">Module Grid</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#data-table">Data Table</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#detail-view">Detail View</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#form-builder">Form Builder</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#bulk-actions">Bulk Actions</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#quick-panel">Quick Panel</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#floating-actions">Floating Actions</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#context-menu">Context Menu</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#tray-badges">Tray Badges</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#login-page">Login Page</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#register-modal">Register Modal</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#standalone-controls">Standalone Controls</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#activity-log">Activity Log</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#profile-page">Profile Page</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#settings-page">Settings Page</a></li>
                <li><a className="d-inline-flex align-items-center rounded text-decoration-none nav-link" href="#side-action-menu">Side Action Menu</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#custom-components">
                <i className="bi bi-box-seam me-2"></i>
                Наши компоненты
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="cheatsheet-main">
        <div className="container">
          
          {/* Секция: Contents */}
          <section id="content">
            <h2>Contents</h2>
            
            {/* Typography */}
            <article id="typography">
              <div className="bd-heading">
                <h3>Typography</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Display headings</h4>
                  <div className="component-preview">
                    <p className="display-1">Display 1</p>
                    <p className="display-2">Display 2</p>
                    <p className="display-3">Display 3</p>
                    <p className="display-4">Display 4</p>
                    <p className="display-5">Display 5</p>
                    <p className="display-6">Display 6</p>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Headings</h4>
                  <div className="component-preview">
                    <p className="h1">Heading 1</p>
                    <p className="h2">Heading 2</p>
                    <p className="h3">Heading 3</p>
                    <p className="h4">Heading 4</p>
                    <p className="h5">Heading 5</p>
                    <p className="h6">Heading 6</p>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Lead paragraph</h4>
                  <div className="component-preview">
                    <p className="lead">
                      This is a lead paragraph. It stands out from regular paragraphs.
                    </p>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Inline text elements</h4>
                  <div className="component-preview">
                    <p>You can use the mark tag to <mark>highlight</mark> text.</p>
                    <p><del>This line of text is meant to be treated as deleted text.</del></p>
                    <p><s>This line of text is meant to be treated as no longer accurate.</s></p>
                    <p><ins>This line of text is meant to be treated as an addition to the document.</ins></p>
                    <p><u>This line of text will render as underlined.</u></p>
                    <p><small>This line of text is meant to be treated as fine print.</small></p>
                    <p><strong>This line rendered as bold text.</strong></p>
                    <p><em>This line rendered as italicized text.</em></p>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Blockquote</h4>
                  <div className="component-preview">
                    <blockquote className="blockquote">
                      <p>A well-known quote, contained in a blockquote element.</p>
                      <footer className="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>
                    </blockquote>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Lists</h4>
                  <div className="component-preview">
                    <ul className="list-unstyled">
                      <li>This is a list.</li>
                      <li>It appears completely unstyled.</li>
                      <li>Structurally, it's still a list.</li>
                      <li>However, this style only applies to immediate child elements.</li>
                      <li>Nested lists:
                        <ul>
                          <li>are unaffected by this style</li>
                          <li>will still show a bullet</li>
                          <li>and have appropriate left margin</li>
                        </ul>
                      </li>
                      <li>This may still come in handy in some situations.</li>
                    </ul>
                    <ul className="list-inline">
                      <li className="list-inline-item">This is a list item.</li>
                      <li className="list-inline-item">And another one.</li>
                      <li className="list-inline-item">But they're displayed inline.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* Images */}
            <article id="images">
              <div className="bd-heading">
                <h3>Images</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Responsive image</h4>
                  <div className="component-preview">
                    <svg aria-label="Placeholder: Responsive image" className="bd-placeholder-img bd-placeholder-img-lg img-fluid" height="250" preserveAspectRatio="xMidYMid slice" role="img" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <title>Placeholder</title>
                      <rect width="100%" height="100%" fill="#868e96"></rect>
                      <text x="50%" y="50%" fill="#dee2e6" dy=".3em">Responsive image</text>
                    </svg>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Thumbnail</h4>
                  <div className="component-preview">
                    <svg aria-label="A generic square placeholder image" className="bd-placeholder-img img-thumbnail" height="200" preserveAspectRatio="xMidYMid slice" role="img" width="200" xmlns="http://www.w3.org/2000/svg">
                      <title>Placeholder</title>
                      <rect width="100%" height="100%" fill="#868e96"></rect>
                      <text x="50%" y="50%" fill="#dee2e6" dy=".3em">200x200</text>
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            {/* Tables */}
            <article id="tables">
              <div className="bd-heading">
                <h3>Tables</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Striped table</h4>
                  <div className="component-preview">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">First</th>
                          <th scope="col">Last</th>
                          <th scope="col">Handle</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>Mark</td>
                          <td>Otto</td>
                          <td>@mdo</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>Jacob</td>
                          <td>Thornton</td>
                          <td>@fat</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>John</td>
                          <td>Doe</td>
                          <td>@social</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Dark table</h4>
                  <div className="component-preview">
                    <table className="table table-dark table-borderless">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">First</th>
                          <th scope="col">Last</th>
                          <th scope="col">Handle</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>Mark</td>
                          <td>Otto</td>
                          <td>@mdo</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>Jacob</td>
                          <td>Thornton</td>
                          <td>@fat</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>John</td>
                          <td>Doe</td>
                          <td>@social</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Hoverable rows</h4>
                  <div className="component-preview">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Class</th>
                          <th scope="col">Heading</th>
                          <th scope="col">Heading</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Default</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-primary">
                          <th scope="row">Primary</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-secondary">
                          <th scope="row">Secondary</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-success">
                          <th scope="row">Success</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-danger">
                          <th scope="row">Danger</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-warning">
                          <th scope="row">Warning</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-info">
                          <th scope="row">Info</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-light">
                          <th scope="row">Light</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                        <tr className="table-dark">
                          <th scope="row">Dark</th>
                          <td>Cell</td>
                          <td>Cell</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Small table</h4>
                  <div className="component-preview">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">First</th>
                          <th scope="col">Last</th>
                          <th scope="col">Handle</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>Mark</td>
                          <td>Otto</td>
                          <td>@mdo</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>Jacob</td>
                          <td>Thornton</td>
                          <td>@fat</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>John</td>
                          <td>Doe</td>
                          <td>@social</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>

            {/* Figures */}
            <article id="figures">
              <div className="bd-heading">
                <h3>Figures</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Figure with caption</h4>
                  <div className="component-preview">
                    <figure className="figure">
                      <svg aria-label="Placeholder: 400x300" className="bd-placeholder-img figure-img img-fluid rounded" height="300" preserveAspectRatio="xMidYMid slice" role="img" width="400" xmlns="http://www.w3.org/2000/svg">
                        <title>Placeholder</title>
                        <rect width="100%" height="100%" fill="#868e96"></rect>
                        <text x="50%" y="50%" fill="#dee2e6" dy=".3em">400x300</text>
                      </svg>
                      <figcaption className="figure-caption">A caption for the above image.</figcaption>
                    </figure>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* Секция: Forms */}
          <section id="forms">
            <h2 className="sticky-xl-top fw-bold pt-3 pt-xl-5 pb-2 pb-xl-3">Forms</h2>
            
            {/* Overview */}
            <article id="overview">
              <div className="bd-heading">
                <h3>Overview</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Basic form</h4>
                  <div className="component-preview">
                    <form style={{ maxWidth: '500px' }}>
                      <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="exampleSelect" className="form-label">Select menu</label>
                        <select className="form-select" id="exampleSelect">
                          <option>Open this select menu</option>
                          <option value="1">One</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                        </select>
                      </div>
                      <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                      </div>
                      <fieldset className="mb-3">
                        <legend>Radios buttons</legend>
                        <div className="form-check">
                          <input type="radio" name="radios" className="form-check-input" id="exampleRadio1" />
                          <label className="form-check-label" htmlFor="exampleRadio1">Default radio</label>
                        </div>
                        <div className="mb-3 form-check">
                          <input type="radio" name="radios" className="form-check-input" id="exampleRadio2" />
                          <label className="form-check-label" htmlFor="exampleRadio2">Another radio</label>
                        </div>
                      </fieldset>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="customFile">Upload</label>
                        <input type="file" className="form-control" id="customFile" />
                      </div>
                      <div className="mb-3 form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" defaultChecked />
                        <label className="form-check-label" htmlFor="switchCheckChecked">Checked switch checkbox input</label>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="customRange3" className="form-label">Example range</label>
                        <input type="range" className="form-range" min="0" max="5" step="0.5" id="customRange3" />
                      </div>
                      <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </article>

            {/* Disabled forms */}
            <article id="disabled-forms">
              <div className="bd-heading">
                <h3>Disabled forms</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Disabled fieldset</h4>
                  <div className="component-preview">
                    <form style={{ maxWidth: '500px' }}>
                      <fieldset disabled aria-label="Disabled fieldset example">
                        <div className="mb-3">
                          <label htmlFor="disabledTextInput" className="form-label">Disabled input</label>
                          <input type="text" id="disabledTextInput" className="form-control" placeholder="Disabled input" />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="disabledSelect" className="form-label">Disabled select menu</label>
                          <select id="disabledSelect" className="form-select">
                            <option>Disabled select</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="disabledFieldsetCheck" disabled />
                            <label className="form-check-label" htmlFor="disabledFieldsetCheck">
                              Can't check this
                            </label>
                          </div>
                        </div>
                        <fieldset className="mb-3">
                          <legend>Disabled radios buttons</legend>
                          <div className="form-check">
                            <input type="radio" name="radios" className="form-check-input" id="disabledRadio1" disabled />
                            <label className="form-check-label" htmlFor="disabledRadio1">Disabled radio</label>
                          </div>
                          <div className="mb-3 form-check">
                            <input type="radio" name="radios" className="form-check-input" id="disabledRadio2" disabled />
                            <label className="form-check-label" htmlFor="disabledRadio2">Another radio</label>
                          </div>
                        </fieldset>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="disabledCustomFile">Upload</label>
                          <input type="file" className="form-control" id="disabledCustomFile" disabled />
                        </div>
                        <div className="mb-3 form-check form-switch">
                          <input className="form-check-input" type="checkbox" role="switch" id="disabledSwitchCheckChecked" defaultChecked disabled />
                          <label className="form-check-label" htmlFor="disabledSwitchCheckChecked">Disabled checked switch checkbox input</label>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="disabledRange" className="form-label">Disabled range</label>
                          <input type="range" className="form-range" min="0" max="5" step="0.5" id="disabledRange" />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </article>

            {/* Sizing */}
            <article id="sizing">
              <div className="bd-heading">
                <h3>Sizing</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Large</h4>
                  <div className="component-preview">
                    <div className="mb-3">
                      <input className="form-control form-control-lg" type="text" placeholder=".form-control-lg" aria-label=".form-control-lg example" />
                    </div>
                    <div className="mb-3">
                      <select className="form-select form-select-lg" aria-label=".form-select-lg example">
                        <option>Open this select menu</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <input type="file" className="form-control form-control-lg" aria-label="Large file input example" />
                    </div>
                  </div>
                </div>
                <div className="component-group">
                  <h4>Small</h4>
                  <div className="component-preview">
                    <div className="mb-3">
                      <input className="form-control form-control-sm" type="text" placeholder=".form-control-sm" aria-label=".form-control-sm example" />
                    </div>
                    <div className="mb-3">
                      <select className="form-select form-select-sm" aria-label=".form-select-sm example">
                        <option>Open this select menu</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <input type="file" className="form-control form-control-sm" aria-label="Small file input example" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Input group */}
            <article id="input-group">
              <div className="bd-heading">
                <h3>Input group</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Basic examples</h4>
                  <div className="component-preview">
                    <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
                      <span className="input-group-text" id="basic-addon1">@</span>
                      <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
                    </div>
                    <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
                      <input type="text" className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                      <span className="input-group-text" id="basic-addon2">@example.com</span>
                    </div>
                    <label htmlFor="basic-url" className="form-label">Your vanity URL</label>
                    <div className="input-group mb-3" style={{ maxWidth: '500px' }}>
                      <span className="input-group-text" id="basic-addon3">https://example.com/users/</span>
                      <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" />
                    </div>
                    <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
                      <span className="input-group-text">$</span>
                      <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)" />
                      <span className="input-group-text">.00</span>
                    </div>
                    <div className="input-group" style={{ maxWidth: '400px' }}>
                      <span className="input-group-text">With textarea</span>
                      <textarea className="form-control" aria-label="With textarea"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Floating labels */}
            <article id="floating-labels">
              <div className="bd-heading">
                <h3>Floating labels</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Floating labels example</h4>
                  <div className="component-preview">
                    <form style={{ maxWidth: '400px' }}>
                      <div className="form-floating mb-3">
                        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" defaultValue="test@example.com" />
                        <label htmlFor="floatingInput">Email address</label>
                      </div>
                      <div className="form-floating">
                        <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                        <label htmlFor="floatingPassword">Password</label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </article>

            {/* Range */}
            <article id="range">
              <div className="bd-heading">
                <h3>Range</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Range input examples</h4>
                  <div className="component-preview">
                    <form style={{ maxWidth: '500px' }}>
                      <div className="mb-3">
                        <label htmlFor="customRange1" className="form-label">Default range</label>
                        <input type="range" className="form-range" id="customRange1" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="customRange2" className="form-label">Range with value: <span id="rangeValue1">50</span></label>
                        <input type="range" className="form-range" id="customRange2" min="0" max="100" defaultValue="50" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="customRange3" className="form-label">Disabled range</label>
                        <input type="range" className="form-range" id="customRange3" disabled />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="customRange4" className="form-label">Range with steps: <span id="rangeValue2">25</span></label>
                        <input type="range" className="form-range" id="customRange4" min="0" max="100" step="5" defaultValue="25" />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </article>

            {/* Validation */}
            <article id="validation">
              <div className="bd-heading">
                <h3>Validation</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Validation example</h4>
                  <div className="component-preview">
                    <form className="row g-3" style={{ maxWidth: '800px' }}>
                      <div className="col-md-4">
                        <label htmlFor="validationServer01" className="form-label">First name</label>
                        <input type="text" className="form-control is-valid" id="validationServer01" defaultValue="Mark" required />
                        <div className="valid-feedback">
                          Looks good!
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="validationServer02" className="form-label">Last name</label>
                        <input type="text" className="form-control is-valid" id="validationServer02" defaultValue="Otto" required />
                        <div className="valid-feedback">
                          Looks good!
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="validationServerUsername" className="form-label">Username</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text" id="inputGroupPrepend3">@</span>
                          <input type="text" className="form-control is-invalid" id="validationServerUsername" aria-describedby="inputGroupPrepend3" required />
                          <div className="invalid-feedback">
                            Please choose a username.
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="validationServer03" className="form-label">City</label>
                        <input type="text" className="form-control is-invalid" id="validationServer03" required />
                        <div className="invalid-feedback">
                          Please provide a valid city.
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="validationServer04" className="form-label">State</label>
                        <select className="form-select is-invalid" id="validationServer04" required>
                          <option selected disabled value="">Choose...</option>
                          <option>...</option>
                        </select>
                        <div className="invalid-feedback">
                          Please select a valid state.
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="validationServer05" className="form-label">Zip</label>
                        <input type="text" className="form-control is-invalid" id="validationServer05" required />
                        <div className="invalid-feedback">
                          Please provide a valid zip.
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input className="form-check-input is-invalid" type="checkbox" value="" id="invalidCheck3" required />
                          <label className="form-check-label" htmlFor="invalidCheck3">
                            Agree to terms and conditions
                          </label>
                          <div className="invalid-feedback">
                            You must agree before submitting.
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary" type="submit">Submit form</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* Секция: Components */}
          <section id="components">
            <h2>Components</h2>
            
          {/* Buttons */}
          <article className="my-3" id="buttons">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Buttons</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Button variants</h4>
                <div className="component-preview">
                  <button type="button" className="btn btn-primary">Primary</button>
                  <button type="button" className="btn btn-secondary">Secondary</button>
                  <button type="button" className="btn btn-success">Success</button>
                  <button type="button" className="btn btn-danger">Danger</button>
                  <button type="button" className="btn btn-warning">Warning</button>
                  <button type="button" className="btn btn-info">Info</button>
                  <button type="button" className="btn btn-light">Light</button>
                  <button type="button" className="btn btn-dark">Dark</button>
                  <button type="button" className="btn btn-link">Link</button>
                </div>
              </div>
              <div className="component-group">
                <h4>Outline buttons</h4>
                <div className="component-preview">
                  <button type="button" className="btn btn-outline-primary">Primary</button>
                  <button type="button" className="btn btn-outline-secondary">Secondary</button>
                  <button type="button" className="btn btn-outline-success">Success</button>
                  <button type="button" className="btn btn-outline-danger">Danger</button>
                  <button type="button" className="btn btn-outline-warning">Warning</button>
                  <button type="button" className="btn btn-outline-info">Info</button>
                  <button type="button" className="btn btn-outline-light">Light</button>
                  <button type="button" className="btn btn-outline-dark">Dark</button>
                </div>
              </div>
              <div className="component-group">
                <h4>Button sizes</h4>
                <div className="component-preview">
                  <button type="button" className="btn btn-primary btn-sm">Small button</button>
                  <button type="button" className="btn btn-primary">Standard button</button>
                  <button type="button" className="btn btn-primary btn-lg">Large button</button>
                </div>
              </div>
            </div>
          </article>

          {/* Button group */}
          <article className="my-3" id="button-group">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Button group</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Button toolbar</h4>
                <div className="component-preview">
                  <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                    <div className="btn-group me-2" role="group" aria-label="First group">
                      <button type="button" className="btn btn-secondary">1</button>
                      <button type="button" className="btn btn-secondary">2</button>
                      <button type="button" className="btn btn-secondary">3</button>
                      <button type="button" className="btn btn-secondary">4</button>
                    </div>
                    <div className="btn-group me-2" role="group" aria-label="Second group">
                      <button type="button" className="btn btn-secondary">5</button>
                      <button type="button" className="btn btn-secondary">6</button>
                      <button type="button" className="btn btn-secondary">7</button>
                    </div>
                    <div className="btn-group" role="group" aria-label="Third group">
                      <button type="button" className="btn btn-secondary">8</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Accordion */}
          <article id="accordion">
            <div className="bd-heading">
              <h3>Accordion</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Basic accordion</h4>
                <div className="component-preview">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                          Accordion Item #1
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          <strong>This is the first item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                          Accordion Item #2
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          <strong>This is the second item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                          Accordion Item #3
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Alerts */}
          <article className="my-3" id="alerts">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Alerts</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Alert variants</h4>
                <div className="component-preview">
                  <div className="alert alert-primary alert-dismissible fade show" role="alert">
                    A simple primary alert with <a href="#" className="alert-link">an example link</a>. Give it a click if you like.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-secondary alert-dismissible fade show" role="alert">
                    A simple secondary alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    A simple success alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    A simple danger alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    A simple warning alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-info alert-dismissible fade show" role="alert">
                    A simple info alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-light alert-dismissible fade show" role="alert">
                    A simple light alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                  <div className="alert alert-dark alert-dismissible fade show" role="alert">
                    A simple dark alert with <a href="#" className="alert-link">an example link</a>.
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                </div>
              </div>
              <div className="component-group">
                <h4>Alert with heading</h4>
                <div className="component-preview">
                  <div className="alert alert-success" role="alert">
                    <h4 className="alert-heading">Well done!</h4>
                    <p>Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
                    <hr />
                    <p className="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Badge */}
          <article className="my-3" id="badge">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Badge</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Badge with headings</h4>
                <div className="component-preview">
                  <p className="h1">Example heading <span className="badge bg-primary">New</span></p>
                  <p className="h2">Example heading <span className="badge bg-secondary">New</span></p>
                  <p className="h3">Example heading <span className="badge bg-success">New</span></p>
                  <p className="h4">Example heading <span className="badge bg-danger">New</span></p>
                  <p className="h5">Example heading <span className="badge text-bg-warning">New</span></p>
                  <p className="h6">Example heading <span className="badge text-bg-info">New</span></p>
                  <p className="h6">Example heading <span className="badge text-bg-light">New</span></p>
                  <p className="h6">Example heading <span className="badge bg-dark">New</span></p>
                </div>
              </div>
              <div className="component-group">
                <h4>Pill badges</h4>
                <div className="component-preview">
                  <span className="badge rounded-pill bg-primary">Primary</span>
                  <span className="badge rounded-pill bg-secondary">Secondary</span>
                  <span className="badge rounded-pill bg-success">Success</span>
                  <span className="badge rounded-pill bg-danger">Danger</span>
                  <span className="badge rounded-pill text-bg-warning">Warning</span>
                  <span className="badge rounded-pill text-bg-info">Info</span>
                  <span className="badge rounded-pill text-bg-light">Light</span>
                  <span className="badge rounded-pill bg-dark">Dark</span>
                </div>
              </div>
            </div>
          </article>

          {/* Breadcrumb */}
          <article id="breadcrumb">
            <div className="bd-heading">
              <h3>Breadcrumb</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Basic breadcrumb</h4>
                <div className="component-preview">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#">Home</a>
                      </li>
                      <li className="breadcrumb-item">
                        <a href="#">Library</a>
                      </li>
                      <li className="breadcrumb-item active" aria-current="page">Data</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </article>

          {/* Card */}
          <article className="my-3" id="card">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Card</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Card examples</h4>
                <div className="component-preview">
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    <div className="col">
                      <div className="card">
                        <svg aria-label="Placeholder: Image cap" className="bd-placeholder-img card-img-top" height="180" preserveAspectRatio="xMidYMid slice" role="img" width="100%" xmlns="http://www.w3.org/2000/svg">
                          <title>Placeholder</title>
                          <rect width="100%" height="100%" fill="#868e96"></rect>
                          <text x="50%" y="50%" fill="#dee2e6" dy=".3em">Image cap</text>
                        </svg>
                        <div className="card-body">
                          <h5 className="card-title">Card title</h5>
                          <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          <a href="#" className="btn btn-primary">Go somewhere</a>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card">
                        <div className="card-header">
                          Featured
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">Card title</h5>
                          <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          <a href="#" className="btn btn-primary">Go somewhere</a>
                        </div>
                        <div className="card-footer text-body-secondary">
                          2 days ago
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Card title</h5>
                          <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                        </div>
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item">An item</li>
                          <li className="list-group-item">A second item</li>
                          <li className="list-group-item">A third item</li>
                        </ul>
                        <div className="card-body">
                          <a href="#" className="card-link">Card link</a>
                          <a href="#" className="card-link">Another link</a>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card">
                        <div className="row g-0">
                          <div className="col-md-4">
                            <svg aria-label="Placeholder: Image" className="bd-placeholder-img" height="250" preserveAspectRatio="xMidYMid slice" role="img" width="100%" xmlns="http://www.w3.org/2000/svg">
                              <title>Placeholder</title>
                              <rect width="100%" height="100%" fill="#868e96"></rect>
                              <text x="50%" y="50%" fill="#dee2e6" dy=".3em">Image</text>
                            </svg>
                          </div>
                          <div className="col-md-8">
                            <div className="card-body">
                              <h5 className="card-title">Card title</h5>
                              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                              <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Carousel */}
          <article className="my-3" id="carousel">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Carousel</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Basic carousel</h4>
                <div className="component-preview">
                  <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                      <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-label="Slide 1" aria-current="true"></button>
                      <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                      <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    </div>
                    <div className="carousel-inner">
                      <div className="carousel-item active">
                        <svg aria-label="Placeholder: First slide" className="bd-placeholder-img bd-placeholder-img-lg d-block w-100" height="400" preserveAspectRatio="xMidYMid slice" role="img" width="800" xmlns="http://www.w3.org/2000/svg">
                          <title>Placeholder</title>
                          <rect width="100%" height="100%" fill="#777"></rect>
                          <text x="50%" y="50%" fill="#555" dy=".3em">First slide</text>
                        </svg>
                        <div className="carousel-caption d-none d-md-block">
                          <h5>First slide label</h5>
                          <p>Some representative placeholder content for the first slide.</p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <svg aria-label="Placeholder: Second slide" className="bd-placeholder-img bd-placeholder-img-lg d-block w-100" height="400" preserveAspectRatio="xMidYMid slice" role="img" width="800" xmlns="http://www.w3.org/2000/svg">
                          <title>Placeholder</title>
                          <rect width="100%" height="100%" fill="#666"></rect>
                          <text x="50%" y="50%" fill="#444" dy=".3em">Second slide</text>
                        </svg>
                        <div className="carousel-caption d-none d-md-block">
                          <h5>Second slide label</h5>
                          <p>Some representative placeholder content for the second slide.</p>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <svg aria-label="Placeholder: Third slide" className="bd-placeholder-img bd-placeholder-img-lg d-block w-100" height="400" preserveAspectRatio="xMidYMid slice" role="img" width="800" xmlns="http://www.w3.org/2000/svg">
                          <title>Placeholder</title>
                          <rect width="100%" height="100%" fill="#555"></rect>
                          <text x="50%" y="50%" fill="#333" dy=".3em">Third slide</text>
                        </svg>
                        <div className="carousel-caption d-none d-md-block">
                          <h5>Third slide label</h5>
                          <p>Some representative placeholder content for the third slide.</p>
                        </div>
                      </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Dropdowns */}
          <article id="dropdowns">
            <div className="bd-heading">
              <h3>Dropdowns</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Dropdown buttons</h4>
                <div className="component-preview">
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <div className="dropdown">
                      <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown button
                      </button>
                      <ul className="dropdown-menu">
                        <li><h6 className="dropdown-header">Dropdown header</h6></li>
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Separated link</a></li>
                      </ul>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown button
                      </button>
                      <ul className="dropdown-menu">
                        <li><h6 className="dropdown-header">Dropdown header</h6></li>
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Separated link</a></li>
                      </ul>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-secondary btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown button
                      </button>
                      <ul className="dropdown-menu">
                        <li><h6 className="dropdown-header">Dropdown header</h6></li>
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Separated link</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* List group */}
          <article className="my-3" id="list-group">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>List group</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Basic list group</h4>
                <div className="component-preview">
                  <ul className="list-group">
                    <li className="list-group-item disabled" aria-disabled="true">A disabled item</li>
                    <li className="list-group-item">A second item</li>
                    <li className="list-group-item">A third item</li>
                    <li className="list-group-item">A fourth item</li>
                    <li className="list-group-item">And a fifth one</li>
                  </ul>
                </div>
              </div>
              <div className="component-group">
                <h4>Flush list group</h4>
                <div className="component-preview">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">An item</li>
                    <li className="list-group-item">A second item</li>
                    <li className="list-group-item">A third item</li>
                    <li className="list-group-item">A fourth item</li>
                    <li className="list-group-item">And a fifth one</li>
                  </ul>
                </div>
              </div>
              <div className="component-group">
                <h4>List group with actions</h4>
                <div className="component-preview">
                  <div className="list-group">
                    <a href="#" className="list-group-item list-group-item-action">A simple default list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-primary">A simple primary list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-secondary">A simple secondary list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-success">A simple success list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-danger">A simple danger list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-warning">A simple warning list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-info">A simple info list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-light">A simple light list group item</a>
                    <a href="#" className="list-group-item list-group-item-action list-group-item-dark">A simple dark list group item</a>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Modal */}
          <article className="my-3" id="modal">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Modal</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Modal examples</h4>
                <div className="component-preview">
                  <div className="d-flex justify-content-between flex-wrap">
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalDefault">
                      Launch demo modal
                    </button>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdropLive">
                      Launch static backdrop modal
                    </button>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalCenteredScrollable">
                      Vertically centered scrollable modal
                    </button>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalFullscreen">
                      Full screen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Navs */}
          <article className="my-3" id="navs">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Navs</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Basic nav</h4>
                <div className="component-preview">
                  <nav className="nav">
                    <a className="nav-link active" aria-current="page" href="#">Active</a>
                    <a className="nav-link" href="#">Link</a>
                    <a className="nav-link" href="#">Link</a>
                    <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                  </nav>
                </div>
              </div>
              <div className="component-group">
                <h4>Tabs</h4>
                <div className="component-preview">
                  <nav>
                    <div className="nav nav-tabs mb-3" id="nav-tab" role="tablist">
                      <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Home</button>
                      <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</button>
                      <button className="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
                    </div>
                  </nav>
                  <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                      <p>This is some placeholder content the <strong>Home tab's</strong> associated content.</p>
                    </div>
                    <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                      <p>This is some placeholder content the <strong>Profile tab's</strong> associated content.</p>
                    </div>
                    <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
                      <p>This is some placeholder content the <strong>Contact tab's</strong> associated content.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="component-group">
                <h4>Pills</h4>
                <div className="component-preview">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <a className="nav-link active" aria-current="page" href="#">Active</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">Link</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">Link</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          {/* Navbar */}
          <article id="navbar">
            <div className="bd-heading">
              <h3>Navbar</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>HRM Pro Header (Navbar)</h4>
                <div className="component-preview" style={{ padding: 0, overflow: 'visible' }}>
                  <div style={{ position: 'relative', width: '100%', minHeight: '70px' }}>
                    <Header />
                  </div>
                </div>
                <p className="text-muted mt-2">
                  <small>Это наш реальный Header компонент из <code>./components/Header.tsx</code></small>
                </p>
              </div>
              <div className="component-group">
                <h4>Bootstrap Navbar example</h4>
                <div className="component-preview">
                  <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                      <a className="navbar-brand" href="#">Navbar</a>
                      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                          <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#">Home</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link" href="#">Link</a>
                          </li>
                          <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Dropdown
                            </a>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#">Action</a></li>
                              <li><a className="dropdown-item" href="#">Another action</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                          </li>
                        </ul>
                        <form className="d-flex" role="search">
                          <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                          <button className="btn btn-outline-dark" type="submit">Search</button>
                        </form>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </article>

          {/* Pagination */}
          <article className="my-3" id="pagination">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Pagination</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Small pagination</h4>
                <div className="component-preview">
                  <nav aria-label="Pagination example">
                    <ul className="pagination pagination-sm">
                      <li className="page-item"><a className="page-link" href="#">1</a></li>
                      <li className="page-item active" aria-current="page">
                        <a className="page-link" href="#">2</a>
                      </li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="component-group">
                <h4>Standard pagination</h4>
                <div className="component-preview">
                  <nav aria-label="Standard pagination example">
                    <ul className="pagination">
                      <li className="page-item">
                        <a className="page-link" href="#" aria-label="Previous">
                          <span aria-hidden="true">«</span>
                        </a>
                      </li>
                      <li className="page-item"><a className="page-link" href="#">1</a></li>
                      <li className="page-item"><a className="page-link" href="#">2</a></li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                      <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                          <span aria-hidden="true">»</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="component-group">
                <h4>Large pagination</h4>
                <div className="component-preview">
                  <nav aria-label="Another pagination example">
                    <ul className="pagination pagination-lg flex-wrap">
                      <li className="page-item disabled">
                        <a className="page-link">Previous</a>
                      </li>
                      <li className="page-item"><a className="page-link" href="#">1</a></li>
                      <li className="page-item active" aria-current="page">
                        <a className="page-link" href="#">2</a>
                      </li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                      <li className="page-item">
                        <a className="page-link" href="#">Next</a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </article>

          {/* Popovers */}
          <article className="my-3" id="popovers">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Popovers</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Popover examples</h4>
                <div className="component-preview">
                  <button type="button" className="btn btn-lg btn-danger" data-bs-toggle="popover" data-bs-content="And here's some amazing content. It's very engaging. Right?" data-bs-title="Popover title">Click to toggle popover</button>
                  <button type="button" className="btn btn-secondary" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
                    Popover on top
                  </button>
                  <button type="button" className="btn btn-secondary" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
                    Popover on end
                  </button>
                  <button type="button" className="btn btn-secondary" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="bottom" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
                    Popover on bottom
                  </button>
                  <button type="button" className="btn btn-secondary" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="left" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
                    Popover on start
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Progress */}
          <article id="progress">
            <div className="bd-heading">
              <h3>Progress</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Progress bars</h4>
                <div className="component-preview">
                  <div className="progress mb-3" role="progressbar" aria-label="Example with label" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar" style={{ width: '0%' }}>0%</div>
                  </div>
                  <div className="progress mb-3" role="progressbar" aria-label="Success example with label" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar bg-success" style={{ width: '25%' }}>25%</div>
                  </div>
                  <div className="progress mb-3" role="progressbar" aria-label="Info example with label" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar text-bg-info" style={{ width: '50%' }}>50%</div>
                  </div>
                  <div className="progress mb-3" role="progressbar" aria-label="Warning example with label" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar text-bg-warning" style={{ width: '75%' }}>75%</div>
                  </div>
                  <div className="progress" role="progressbar" aria-label="Danger example with label" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar bg-danger" style={{ width: '100%' }}>100%</div>
                  </div>
                </div>
              </div>
              <div className="component-group">
                <h4>Stacked progress</h4>
                <div className="component-preview">
                  <div className="progress-stacked">
                    <div className="progress" role="progressbar" aria-label="Segment one" style={{ width: '15%' }} aria-valuenow={15} aria-valuemin={0} aria-valuemax={100}>
                      <div className="progress-bar" style={{ width: '100%' }}></div>
                    </div>
                    <div className="progress" role="progressbar" aria-label="Segment two" style={{ width: '40%' }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Scrollspy */}
          <article id="scrollspy">
            <div className="bd-heading">
              <h3>Scrollspy</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Scrollspy example</h4>
                <div className="component-preview">
                  <nav id="navbar-example2" className="navbar bg-body-tertiary px-3 mb-2">
                    <a className="navbar-brand" href="#">Navbar</a>
                    <ul className="nav nav-pills">
                      <li className="nav-item">
                        <a className="nav-link active" href="#scrollspyHeading1">First</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#scrollspyHeading2">Second</a>
                      </li>
                    </ul>
                  </nav>
                  <div data-bs-spy="scroll" data-bs-target="#navbar-example2" data-bs-offset="0" className="scrollspy-example position-relative overflow-auto" style={{ height: '200px' }} tabIndex={0}>
                    <h4 id="scrollspyHeading1">First heading</h4>
                    <p>This is some placeholder content for the scrollspy page.</p>
                    <h4 id="scrollspyHeading2">Second heading</h4>
                    <p>This is some placeholder content for the scrollspy page.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Spinners */}
          <article className="my-3" id="spinners">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Spinners</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Border spinners</h4>
                <div className="component-preview">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
              <div className="component-group">
                <h4>Grow spinners</h4>
                <div className="component-preview">
                  <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Toasts */}
          <article id="toasts">
            <div className="bd-heading">
              <h3>Toasts</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>HRM Pro Toast Container</h4>
                <div className="component-preview" style={{ minHeight: '200px', position: 'relative' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('success', 'Успех', 'Операция выполнена успешно');
                        }
                      }}
                    >
                      Success Toast
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('error', 'Ошибка', 'Ошибка при сохранении данных');
                        }
                      }}
                    >
                      Error Toast
                    </button>
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('info', 'Информация', 'Важная информация для вас');
                        }
                      }}
                    >
                      Info Toast
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('warning', 'Предупреждение', 'Требуется ваше внимание');
                        }
                      }}
                    >
                      Warning Toast
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('message', 'Новое сообщение', 'Новое сообщение от Ивана Петрова');
                        }
                      }}
                    >
                      Message Toast
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('document', 'Документ', 'Новый документ готов к просмотру');
                        }
                      }}
                    >
                      Document Toast
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('task', 'Задача', 'Новая задача назначена вам');
                        }
                      }}
                    >
                      Task Toast
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('calendar', 'Календарь', 'Встреча запланирована на завтра');
                        }
                      }}
                    >
                      Calendar Toast
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).addToast) {
                          (window as any).addToast('mention', 'Упоминание', 'Вас упомянули в комментарии');
                        }
                      }}
                    >
                      Mention Toast
                    </button>
                  </div>
                  <ToastContainer position="bottom-left" />
                  {/* Старые примеры для справки */}
                  <div className="toast-container" id="toastContainer" style={{ position: 'relative', width: '100%', minHeight: '200px', display: 'none' }}>
                    {/* Toast examples from index.html */}
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-success">
                        <i className="bi bi-check-circle-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Успех</div>
                          <p className="toast-message-text">Операция выполнена успешно</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-error">
                        <i className="bi bi-x-circle-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Ошибка</div>
                          <p className="toast-message-text">Ошибка при сохранении данных</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-message">
                        <i className="bi bi-chat-dots-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Новое сообщение</div>
                          <p className="toast-message-text">Новое сообщение от Ивана Петрова</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-task">
                        <i className="bi bi-list-check toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Задача</div>
                          <p className="toast-message-text">Новая задача назначена вам</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-mention">
                        <i className="bi bi-at toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Упоминание</div>
                          <p className="toast-message-text">Вас упомянули в комментарии</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-calendar">
                        <i className="bi bi-calendar-event-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Календарь</div>
                          <p className="toast-message-text">Встреча запланирована на завтра</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show" style={{ marginBottom: '0.5rem' }}>
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-info">
                        <i className="bi bi-info-circle-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Информация</div>
                          <p className="toast-message-text">Важная информация для вас</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="toast-wrapper show">
                      <div className="toast-header">
                        <i className="bi bi-hexagon-fill toast-logo"></i>
                        <span className="toast-title">HRM Pro</span>
                        <button className="toast-action-btn" title="Закрепить">
                          <i className="bi bi-pin-angle-fill"></i>
                        </button>
                        <button className="toast-close-btn" title="Закрыть">&times;</button>
                      </div>
                      <div className="toast-body type-warning">
                        <i className="bi bi-exclamation-triangle-fill toast-body-icon"></i>
                        <div className="toast-message-content">
                          <div className="toast-message-title">Предупреждение</div>
                          <p className="toast-message-text">Требуется ваше внимание</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-muted mt-2">
                  <small>Это кастомные Toasts из <code>index.html</code> с различными типами: success, error, message, task, mention, calendar, info, warning</small>
                </p>
              </div>
            </div>
          </article>

          {/* Tooltips */}
          <article className="my-3" id="tooltips">
            <div className="bd-heading sticky-xl-top align-self-start mt-5 mb-3 mt-xl-0 mb-xl-2">
              <h3>Tooltips</h3>
            </div>
            <div>
              <div className="component-group">
                <h4>Tooltip examples</h4>
                <div className="component-preview">
                  <button type="button" className="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top">Tooltip on top</button>
                  <button type="button" className="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="right" title="Tooltip on end">Tooltip on end</button>
                  <button type="button" className="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tooltip on bottom">Tooltip on bottom</button>
                  <button type="button" className="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="left" title="Tooltip on start">Tooltip on start</button>
                  <button type="button" className="btn btn-secondary" data-bs-toggle="tooltip" data-bs-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>">Tooltip with HTML</button>
                </div>
              </div>
            </div>
          </article>
          </section>

          {/* Секция: HRM Pro Components */}
          <section id="hrm-components">
            <h2>HRM Pro Components</h2>

            {/* Command Center */}
            <article id="command-center">
              <div className="bd-heading">
                <h3>Command Center</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Action Cards</h4>
                  <div className="component-preview">
                    <section className="command-center">
                      <h1 className="greeting">Добро пожаловать! 👋</h1>
                      <p className="subtitle">Сегодня понедельник, 28 мая. Вот что происходит в компании:</p>
                      
                      <div className="action-cards">
                        <a href="#" className="action-card">
                          <div className="action-icon primary">
                            <i className="bi bi-person-plus"></i>
                          </div>
                          <div className="action-content">
                            <div className="action-title">Новый сотрудник</div>
                            <div className="action-desc">Оформить прием на работу</div>
                          </div>
                        </a>
                        
                        <a href="#" className="action-card">
                          <div className="action-icon success">
                            <i className="bi bi-calendar-check"></i>
                          </div>
                          <div className="action-content">
                            <div className="action-title">Собеседования сегодня</div>
                            <div className="action-desc">3 кандидата ожидают</div>
                          </div>
                        </a>
                        
                        <a href="#" className="action-card">
                          <div className="action-icon warning">
                            <i className="bi bi-exclamation-triangle"></i>
                          </div>
                          <div className="action-content">
                            <div className="action-title">Требуют внимания</div>
                            <div className="action-desc">5 заявок на одобрение</div>
                          </div>
                        </a>
                        
                        <a href="#" className="action-card">
                          <div className="action-icon info">
                            <i className="bi bi-graph-up-arrow"></i>
                          </div>
                          <div className="action-content">
                            <div className="action-title">Отчеты</div>
                            <div className="action-desc">Сформировать аналитику</div>
                          </div>
                        </a>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Stat Widgets */}
            <article id="stat-widgets">
              <div className="bd-heading">
                <h3>Stat Widgets</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Statistics widgets with trends</h4>
                  <div className="component-preview">
                    <section className="stat-widgets-container">
                      <div className="stat-widget">
                        <div className="stat-main">
                          <div className="stat-value">245</div>
                          <div className="stat-label">Всего сотрудников</div>
                        </div>
                        <div className="stat-trend-wrapper">
                          <span className="stat-trend up">
                            <i className="bi bi-arrow-up"></i>12% за месяц
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-widget">
                        <div className="stat-main">
                          <div className="stat-value">89%</div>
                          <div className="stat-label">Присутствуют сегодня</div>
                        </div>
                        <div className="stat-trend-wrapper">
                          <span className="stat-trend up">
                            <i className="bi bi-arrow-up"></i>2% выше нормы
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-widget">
                        <div className="stat-main">
                          <div className="stat-value">18</div>
                          <div className="stat-label">Открытых вакансий</div>
                        </div>
                        <div className="stat-trend-wrapper">
                          <span className="stat-trend down">
                            <i className="bi bi-arrow-down"></i>3 закрыто
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-widget">
                        <div className="stat-main">
                          <div className="stat-value">4.8</div>
                          <div className="stat-label">Средняя оценка</div>
                        </div>
                        <div className="stat-trend-wrapper">
                          <span className="stat-trend up">
                            <i className="bi bi-arrow-up"></i>0.3 пункта
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Module Grid */}
            <article id="module-grid">
              <div className="bd-heading">
                <h3>Module Grid</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Module cards grid</h4>
                  <div className="component-preview">
                    <section className="module-grid">
                      <a href="#" className="module-card active" data-module="dashboard">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-speedometer2 module-icon text-primary"></i>
                        </div>
                        <div className="module-name">Дашборд</div>
                        <div className="module-count">Обзор</div>
                      </a>
                      
                      <a href="#" className="module-card" data-module="employees">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-people module-icon text-info"></i>
                        </div>
                        <div className="module-name">Сотрудники</div>
                        <div className="module-count">245 человек</div>
                      </a>
                      
                      <a href="#" className="module-card" data-module="recruiting">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-person-plus module-icon text-success"></i>
                        </div>
                        <div className="module-name">Рекрутинг</div>
                        <div className="module-count">18 вакансий</div>
                        <i className="bi bi-star-fill favorite-star"></i>
                      </a>
                      
                      <a href="#" className="module-card" data-module="adaptation">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-person-check module-icon text-warning"></i>
                        </div>
                        <div className="module-name">Адаптация</div>
                        <div className="module-count">7 новичков</div>
                        <i className="bi bi-star-fill favorite-star"></i>
                      </a>
                      
                      <a href="#" className="module-card" data-module="cb">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-cash-stack module-icon text-danger"></i>
                        </div>
                        <div className="module-name">C&B</div>
                        <div className="module-count">Компенсации</div>
                      </a>
                      
                      <a href="#" className="module-card" data-module="hrops">
                        <div className="module-icon-wrapper">
                          <i className="bi bi-gear-wide-connected module-icon text-secondary"></i>
                        </div>
                        <div className="module-name">HR Ops</div>
                        <div className="module-count">Процессы</div>
                      </a>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Data Table */}
            <article id="data-table">
              <div className="bd-heading">
                <h3>Data Table</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Table with toolbar, filters and pagination</h4>
                  <div className="component-preview">
                    <section className="data-table-container">
                      {/* Панель инструментов */}
                      <div className="table-toolbar">
                        <div className="toolbar-left">
                          <div className="search-box">
                            <i className="bi bi-search search-icon"></i>
                            <input 
                              type="text" 
                              placeholder="Поиск..." 
                              className="search-input" 
                            />
                          </div>
                        </div>
                        <div className="toolbar-right">
                          <button className="btn btn-sm btn-primary">
                            <i className="bi bi-plus-lg me-1"></i>Добавить
                          </button>
                          <button className="btn btn-sm btn-secondary">
                            <i className="bi bi-download me-1"></i>Экспорт
                          </button>
                        </div>
                      </div>

                      {/* Фильтры */}
                      <div className="table-filters">
                        <div className="filter-item">
                          <input 
                            type="text" 
                            placeholder="Фильтр по имени" 
                            className="filter-input"
                            data-filter="name"
                          />
                        </div>
                        <div className="filter-item">
                          <input 
                            type="text" 
                            placeholder="Фильтр по должности" 
                            className="filter-input"
                            data-filter="position"
                          />
                        </div>
                        <div className="filter-item">
                          <select className="filter-input" data-filter="status">
                            <option value="">Все статусы</option>
                            <option value="active">Активный</option>
                            <option value="inactive">Неактивный</option>
                            <option value="on_leave">В отпуске</option>
                          </select>
                        </div>
                      </div>

                      {/* Таблица */}
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>
                                <input type="checkbox" className="form-check-input" id="selectAll" />
                              </th>
                              <th className="sortable" data-column="name">
                                Имя <i className="bi bi-arrow-down-up sort-icon"></i>
                              </th>
                              <th className="sortable" data-column="position">
                                Должность <i className="bi bi-arrow-down-up sort-icon"></i>
                              </th>
                              <th className="sortable" data-column="department">
                                Отдел <i className="bi bi-arrow-down-up sort-icon"></i>
                              </th>
                              <th className="sortable" data-column="status">
                                Статус <i className="bi bi-arrow-down-up sort-icon"></i>
                              </th>
                              <th>Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr data-id="1">
                              <td><input type="checkbox" className="form-check-input row-checkbox" /></td>
                              <td>Иван Петров</td>
                              <td>Senior Developer</td>
                              <td>IT</td>
                              <td><span className="badge status-active">Активный</span></td>
                              <td>
                                <button className="btn btn-sm btn-link p-0"><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link p-0 text-danger"><i className="bi bi-trash"></i></button>
                              </td>
                            </tr>
                            <tr data-id="2">
                              <td><input type="checkbox" className="form-check-input row-checkbox" /></td>
                              <td>Мария Сидорова</td>
                              <td>HR Manager</td>
                              <td>HR</td>
                              <td><span className="badge status-active">Активный</span></td>
                              <td>
                                <button className="btn btn-sm btn-link p-0"><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link p-0 text-danger"><i className="bi bi-trash"></i></button>
                              </td>
                            </tr>
                            <tr data-id="3">
                              <td><input type="checkbox" className="form-check-input row-checkbox" /></td>
                              <td>Алексей Иванов</td>
                              <td>Product Manager</td>
                              <td>Product</td>
                              <td><span className="badge status-inactive">Неактивный</span></td>
                              <td>
                                <button className="btn btn-sm btn-link p-0"><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-sm btn-link p-0 text-danger"><i className="bi bi-trash"></i></button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Пагинация */}
                      <div className="table-pagination">
                        <div className="pagination-info">
                          Показано 1-5 из 25
                        </div>
                        <div className="pagination-controls">
                          <button className="btn btn-sm" disabled>←</button>
                          <button className="btn btn-sm active">1</button>
                          <button className="btn btn-sm">2</button>
                          <button className="btn btn-sm">3</button>
                          <button className="btn btn-sm">→</button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Detail View */}
            <article id="detail-view">
              <div className="bd-heading">
                <h3>Detail View</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Detail view with tabs</h4>
                  <div className="component-preview">
                    <section className="detail-view">
                      {/* Заголовок */}
                      <div className="detail-header">
                        <div className="detail-title">
                          <h2>Профиль: Иван Петров</h2>
                          <button className="close-button" aria-label="Закрыть">×</button>
                        </div>
                        <div className="detail-actions">
                          <button className="btn btn-primary">
                            <i className="bi bi-pencil me-1"></i>Редактировать
                          </button>
                          <button className="btn btn-danger">
                            <i className="bi bi-trash me-1"></i>Удалить
                          </button>
                        </div>
                      </div>

                      {/* Табы */}
                      <div className="detail-tabs">
                        <button className="tab-button active" data-tab="general">Общая информация</button>
                        <button className="tab-button" data-tab="history">История</button>
                        <button className="tab-button" data-tab="documents">Документы</button>
                      </div>

                      {/* Контент табов */}
                      <div className="detail-content">
                        {/* Таб: Общая информация */}
                        <div className="tab-content active" id="tab-general">
                          <div className="detail-row">
                            <div className="detail-label">Имя</div>
                            <div className="detail-value">Иван Петров</div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-label">Email</div>
                            <div className="detail-value">ivan.petrov@company.com</div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-label">Должность</div>
                            <div className="detail-value">Senior Developer</div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-label">Отдел</div>
                            <div className="detail-value">IT</div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-label">Статус</div>
                            <div className="detail-value"><span className="badge status-active">Активный</span></div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-label">Дата найма</div>
                            <div className="detail-value">15.03.2022</div>
                          </div>
                        </div>

                        {/* Таб: История */}
                        <div className="tab-content" id="tab-history" style={{ display: 'none' }}>
                          <div className="history-item">
                            <div className="history-date">28.05.2024</div>
                            <div className="history-text">Изменена должность на Senior Developer</div>
                          </div>
                          <div className="history-item">
                            <div className="history-date">15.03.2022</div>
                            <div className="history-text">Принят на работу</div>
                          </div>
                        </div>

                        {/* Таб: Документы */}
                        <div className="tab-content" id="tab-documents" style={{ display: 'none' }}>
                          <div className="document-item">
                            <i className="bi bi-file-earmark-pdf text-danger"></i>
                            <div className="document-info">
                              <div className="document-name">Трудовой договор</div>
                              <div className="document-date">15.03.2022</div>
                            </div>
                            <button className="btn btn-sm btn-link">
                              <i className="bi bi-download"></i>
                            </button>
                          </div>
                          <div className="document-item">
                            <i className="bi bi-file-earmark-word text-primary"></i>
                            <div className="document-info">
                              <div className="document-name">Резюме</div>
                              <div className="document-date">10.03.2022</div>
                            </div>
                            <button className="btn btn-sm btn-link">
                              <i className="bi bi-download"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Form Builder */}
            <article id="form-builder">
              <div className="bd-heading">
                <h3>Form Builder</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Advanced form with all field types</h4>
                  <div className="component-preview">
                    <section className="form-builder">
                      <div className="form-header">
                        <h3>Добавить сотрудника</h3>
                      </div>

                      <form className="form">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Имя <span className="required">*</span>
                          </label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            className="form-control" 
                            placeholder="Введите имя"
                            required
                          />
                          <div className="error-message" style={{ display: 'none' }}></div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email <span className="required">*</span>
                          </label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="form-control" 
                            placeholder="email@example.com"
                            required
                          />
                          <div className="error-message" style={{ display: 'none' }}></div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="position" className="form-label">
                            Должность <span className="required">*</span>
                          </label>
                          <select id="position" name="position" className="form-control" required>
                            <option value="">Выберите должность...</option>
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                            <option value="designer">Designer</option>
                            <option value="qa">QA Engineer</option>
                          </select>
                          <div className="error-message" style={{ display: 'none' }}></div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="department" className="form-label">
                            Отдел
                          </label>
                          <select id="department" name="department" className="form-control">
                            <option value="">Выберите отдел...</option>
                            <option value="it">IT</option>
                            <option value="hr">HR</option>
                            <option value="design">Design</option>
                            <option value="product">Product</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="hireDate" className="form-label">
                            Дата найма
                          </label>
                          <input 
                            type="date" 
                            id="hireDate" 
                            name="hireDate" 
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="workTime" className="form-label">
                            Время начала работы
                          </label>
                          <input 
                            type="time" 
                            id="workTime" 
                            name="workTime" 
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="themeColor" className="form-label">
                            Цвет темы
                          </label>
                          <input 
                            type="color" 
                            id="themeColor" 
                            name="themeColor" 
                            className="form-control form-control-color"
                            defaultValue="#0d6efd"
                            title="Выберите цвет"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="salary" className="form-label">
                            Зарплата
                          </label>
                          <input 
                            type="number" 
                            id="salary" 
                            name="salary" 
                            className="form-control" 
                            placeholder="0"
                            min="0"
                            step="1000"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="description" className="form-label">
                            Описание
                          </label>
                          <textarea 
                            id="description" 
                            name="description" 
                            className="form-control" 
                            rows={4}
                            placeholder="Дополнительная информация..."
                          />
                        </div>

                        <div className="form-group">
                          <div className="checkbox-wrapper">
                            <input 
                              type="checkbox" 
                              id="active" 
                              name="active" 
                              className="form-check-input"
                              defaultChecked
                            />
                            <label htmlFor="active" className="form-label">Активный сотрудник</label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Тип договора</label>
                          <div className="radio-group">
                            <div className="radio-wrapper">
                              <input 
                                type="radio" 
                                id="contract-full" 
                                name="contractType" 
                                value="full"
                                defaultChecked
                              />
                              <label htmlFor="contract-full">Полная занятость</label>
                            </div>
                            <div className="radio-wrapper">
                              <input 
                                type="radio" 
                                id="contract-part" 
                                name="contractType" 
                                value="part"
                              />
                              <label htmlFor="contract-part">Частичная занятость</label>
                            </div>
                            <div className="radio-wrapper">
                              <input 
                                type="radio" 
                                id="contract-temp" 
                                name="contractType" 
                                value="temp"
                              />
                              <label htmlFor="contract-temp">Временный</label>
                            </div>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary">
                            <i className="bi bi-check-lg me-1"></i>Сохранить
                          </button>
                          <button type="button" className="btn btn-secondary">
                            Отмена
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Bulk Actions */}
            <article id="bulk-actions">
              <div className="bd-heading">
                <h3>Bulk Actions</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Bulk actions toolbar</h4>
                  <div className="component-preview">
                    <section className="bulk-actions-container">
                      <div className="bulk-info">
                        <span className="selected-count">
                          Выбрано: <strong>3</strong> из 25
                        </span>
                        <div className="selection-controls">
                          <button className="btn btn-sm btn-link">
                            Выбрать все
                          </button>
                          <button className="btn btn-sm btn-link">
                            Снять выделение
                          </button>
                        </div>
                      </div>
                      <div className="bulk-actions-list">
                        <button className="btn btn-sm btn-primary">
                          <i className="bi bi-check-circle me-1"></i>Активировать
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <i className="bi bi-envelope me-1"></i>Отправить email
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <i className="bi bi-download me-1"></i>Экспорт
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="bi bi-trash me-1"></i>Удалить
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            {/* Quick Panel */}
            <article id="quick-panel">
              <div className="bd-heading">
                <h3>Quick Panel</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Side panel with collapsible sections</h4>
                  <div className="component-preview" style={{ minHeight: '500px', position: 'relative' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setQuickPanelOpen(true)}
                      >
                        <i className="bi bi-lightning-charge me-2"></i>
                        Открыть Quick Panel
                      </button>
                    </div>
                    <QuickPanel 
                      isOpen={quickPanelOpen} 
                      onClose={() => setQuickPanelOpen(false)} 
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* Floating Actions */}
            <article id="floating-actions">
              <div className="bd-heading">
                <h3>Floating Actions</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Floating action buttons</h4>
                  <div className="component-preview" style={{ minHeight: '200px', position: 'relative' }}>
                    <div className="floating-actions" style={{ position: 'relative' }}>
                      <button className="fab secondary">
                        <i className="bi bi-arrow-up"></i>
                      </button>
                      <button className="fab">
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Context Menu */}
            <article id="context-menu">
              <div className="bd-heading">
                <h3>Context Menu</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Context menu example</h4>
                  <div className="component-preview" style={{ minHeight: '200px', position: 'relative' }}>
                    <div className="context-menu" style={{ position: 'relative', display: 'block' }}>
                      <a href="#" className="context-menu-item">
                        <i className="bi bi-star"></i>
                        <span>Добавить в избранное</span>
                      </a>
                      <a href="#" target="_blank" rel="noopener noreferrer" className="context-menu-item">
                        <i className="bi bi-box-arrow-up-right"></i>
                        <span>Открыть в новой вкладке</span>
                      </a>
                      <div className="context-menu-divider"></div>
                      <a href="#" className="context-menu-item">
                        <i className="bi bi-pin-angle"></i>
                        <span>Закрепить внизу</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Tray Badges */}
            <article id="tray-badges">
              <div className="bd-heading">
                <h3>Tray Badges</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Notification badges in tray</h4>
                  <div className="component-preview">
                    <footer className="tray">
                      <div className="tray-items-container">
                        <button className="tray-badge type-notification" title="Настройки успешно сохранены. часовой пояс из…">
                          <i className="bi bi-bell-fill tray-badge-icon"></i>
                          <span className="tray-badge-text">Настройки успешно сохранены. часовой пояс из…</span>
                          <span className="tray-badge-close">×</span>
                        </button>
                        <button className="tray-badge type-notification" title="Настройки успешно сохранены. язык по умолчан…">
                          <i className="bi bi-bell-fill tray-badge-icon"></i>
                          <span className="tray-badge-text">Настройки успешно сохранены. язык по умолчан…</span>
                          <span className="tray-badge-close">×</span>
                        </button>
                        <button className="tray-badge type-notification" title="Тестовое уведомление для трея">
                          <i className="bi bi-bell-fill tray-badge-icon"></i>
                          <span className="tray-badge-text">Тестовое уведомление для трея</span>
                          <span className="tray-badge-close">×</span>
                        </button>
                      </div>
                      <div className="tray-more-container" style={{ display: 'none' }}>
                        <button className="tray-more-btn">
                          <i className="bi bi-three-dots"></i>
                          <span className="tray-more-count">+0</span>
                        </button>
                      </div>
                    </footer>
                  </div>
                </div>
              </div>
            </article>

            {/* Login Page */}
            <article id="login-page">
              <div className="bd-heading">
                <h3>Login Page</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Login page example</h4>
                  <div className="component-preview" style={{ minHeight: '500px', position: 'relative', background: 'var(--bs-secondary-bg)', padding: '2rem' }}>
                    <div className="login-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
                      <div className="login-card" style={{ background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius-lg)', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                          <div className="login-logo" style={{ fontSize: '3rem', color: 'var(--bs-primary)', marginBottom: '1rem' }}>
                            <i className="bi bi-hexagon-fill"></i>
                          </div>
                          <h1 className="login-title" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Вход в систему</h1>
                          <p className="login-subtitle" style={{ color: 'var(--bs-secondary-color)' }}>Добро пожаловать! Пожалуйста, войдите в свой аккаунт.</p>
                        </div>
                        <form>
                          <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="demoFloatingInput" placeholder="name@example.com" />
                            <label htmlFor="demoFloatingInput">Электронная почта</label>
                          </div>
                          <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="demoFloatingPassword" placeholder="Password" />
                            <label htmlFor="demoFloatingPassword">Пароль</label>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id="demoRememberMe" />
                              <label className="form-check-label" htmlFor="demoRememberMe">
                                Запомнить меня
                              </label>
                            </div>
                            <a href="#" className="text-decoration-none">Забыли пароль?</a>
                          </div>
                          <button type="submit" className="btn btn-primary w-100">Войти</button>
                        </form>
                        <div className="login-divider my-4" style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                          <div style={{ flex: 1, height: '1px', background: 'var(--bs-border-color)' }}></div>
                          <span style={{ padding: '0 1rem', color: 'var(--bs-secondary-color)', fontSize: '0.875rem' }}>или</span>
                          <div style={{ flex: 1, height: '1px', background: 'var(--bs-border-color)' }}></div>
                        </div>
                        <div className="login-social mb-3" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" className="btn btn-outline-danger flex-fill" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <i className="bi bi-google"></i>
                            <span>Google</span>
                          </button>
                          <button type="button" className="btn btn-outline-info flex-fill" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <i className="bi bi-telegram"></i>
                            <span>Telegram</span>
                          </button>
                        </div>
                        <div className="login-footer mt-4">
                          <button type="button" className="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#registerModalDemo">
                            Регистрация
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Register Modal */}
            <article id="register-modal">
              <div className="bd-heading">
                <h3>Register Modal</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Registration modal with password validation</h4>
                  <div className="component-preview">
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModalDemo">
                      Открыть модальное окно регистрации
                    </button>
                    
                    {/* Register Modal */}
                    <div className="modal fade" id="registerModalDemo" tabIndex={-1} aria-labelledby="registerModalLabel" aria-hidden="true">
                      <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title" id="registerModalLabel">Регистрация</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <form className="register-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                              <div className="form-floating">
                                <input type="text" className="form-control" id="demoFirstName" placeholder="Имя" />
                                <label htmlFor="demoFirstName">Имя</label>
                              </div>
                              <div className="form-floating">
                                <input type="text" className="form-control" id="demoLastName" placeholder="Фамилия" />
                                <label htmlFor="demoLastName">Фамилия</label>
                              </div>
                              <div className="form-floating" style={{ gridColumn: 'span 2' }}>
                                <input type="email" className="form-control" id="demoRegisterEmail" placeholder="Email"/>
                                <label htmlFor="demoRegisterEmail">Email</label>
                              </div>
                              <div className="form-floating" style={{ gridColumn: 'span 2' }}>
                                <input type="tel" className="form-control" id="demoPhone" placeholder="Телефон" />
                                <label htmlFor="demoPhone">Телефон</label>
                              </div>
                              
                              {/* Password section */}
                              <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <div className="form-floating mb-3">
                                      <input type="password" className="form-control" id="demoRegisterPassword" placeholder="Пароль" />
                                      <label htmlFor="demoRegisterPassword">Пароль</label>
                                    </div>
                                    <div className="password-requirements" style={{ fontSize: '0.875rem' }}>
                                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                          <i className="bi bi-check-circle text-success"></i>
                                          <span>Минимум 12 символов</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                          <i className="bi bi-x-circle text-muted"></i>
                                          <span>Минимум 1 заглавная буква</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                          <i className="bi bi-check-circle text-success"></i>
                                          <span>Минимум 1 строчная буква</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                          <i className="bi bi-x-circle text-muted"></i>
                                          <span>Минимум 1 цифра</span>
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <i className="bi bi-x-circle text-muted"></i>
                                          <span>Минимум 1 спец. символ</span>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="form-floating mb-3">
                                      <input type="password" className="form-control" id="demoConfirmPassword" placeholder="Подтвердите пароль" />
                                      <label htmlFor="demoConfirmPassword">Подтвердите пароль</label>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bs-success)' }}>
                                        <i className="bi bi-check-circle"></i>
                                        <span>Пароли совпадают</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Сложность пароля</div>
                                      <div className="progress" style={{ height: '8px', marginBottom: '0.5rem' }}>
                                        <div className="progress-bar bg-warning" style={{ width: '60%' }}></div>
                                      </div>
                                      <div style={{ fontSize: '0.875rem', color: 'var(--bs-warning)' }}>Средний</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="form-check" style={{ gridColumn: 'span 2' }}>
                                <input className="form-check-input" type="checkbox" id="demoTerms"/>
                                <label className="form-check-label" htmlFor="demoTerms">
                                  Я согласен с <a href="/#">условиями использования</a>
                                </label>
                              </div>
                            </form>
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-primary w-100">Зарегистрироваться</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Standalone Page Controls */}
            <article id="standalone-controls">
              <div className="bd-heading">
                <h3>Standalone Page Controls</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Controls for standalone pages</h4>
                  <div className="component-preview" style={{ minHeight: '100px', position: 'relative', background: 'var(--bs-secondary-bg)', padding: '1rem' }}>
                    <div className="standalone-controls" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <LanguageSelector />
                      <ThemeSelector />
                      <UserDropdown />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Activity Log */}
            <article id="activity-log">
              <div className="bd-heading">
                <h3>Activity Log</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Activity log with tabs (Timeline, Table, Terminal)</h4>
                  <div className="component-preview" style={{ minHeight: '400px' }}>
                    <div className="activity-log-page">
                      {/* Filters */}
                      <div className="activity-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <input type="date" className="form-control form-control-sm" style={{ maxWidth: '200px' }} placeholder="Фильтр по дате" />
                        <select className="form-select form-select-sm" style={{ maxWidth: '150px' }}>
                          <option value="">Все типы</option>
                          <option value="login">Вход</option>
                          <option value="edit">Редактирование</option>
                          <option value="delete">Удаление</option>
                          <option value="create">Создание</option>
                        </select>
                        <select className="form-select form-select-sm" style={{ maxWidth: '150px' }}>
                          <option value="">Все статусы</option>
                          <option value="success">Успех</option>
                          <option value="error">Ошибка</option>
                        </select>
                        <input type="text" className="form-control form-control-sm" style={{ maxWidth: '200px' }} placeholder="Поиск..." />
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-download me-1"></i>Экспорт Excel
                        </button>
                      </div>

                      {/* Tabs */}
                      <ul className="nav nav-tabs mb-3" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button className="nav-link active" id="timeline-tab" data-bs-toggle="tab" data-bs-target="#timeline-pane" type="button" role="tab">
                            <i className="bi bi-clock-history me-1"></i>Timeline
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button className="nav-link" id="table-tab" data-bs-toggle="tab" data-bs-target="#table-pane" type="button" role="tab">
                            <i className="bi bi-table me-1"></i>Table
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button className="nav-link" id="terminal-tab" data-bs-toggle="tab" data-bs-target="#terminal-pane" type="button" role="tab">
                            <i className="bi bi-terminal me-1"></i>Terminal
                          </button>
                        </li>
                      </ul>

                      {/* Tab Content */}
                      <div className="tab-content">
                        {/* Timeline Tab */}
                        <div className="tab-pane fade show active" id="timeline-pane" role="tabpanel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <div className="activity-timeline position-relative p-3">
                            <div className="timeline-item">
                              <div className="timeline-dot"><i className="bi bi-box-arrow-in-right timeline-icon-info"></i></div>
                              <div className="timeline-card">
                                <div className="d-flex justify-content-between align-items-start w-100">
                                  <div>
                                    <span className="timeline-action">Вход в систему</span>
                                    <span className="timeline-status-success">Успех</span>
                                  </div>
                                  <div className="timeline-date">2024-06-10 14:23</div>
                                </div>
                                <div className="text-muted">192.168.1.10 (Chrome, macOS)</div>
                              </div>
                            </div>
                            <div className="timeline-item">
                              <div className="timeline-dot"><i className="bi bi-pencil-square timeline-icon-warning"></i></div>
                              <div className="timeline-card">
                                <div className="d-flex justify-content-between align-items-start w-100">
                                  <div>
                                    <span className="timeline-action">Изменение профиля</span>
                                    <span className="timeline-status-success">Успех</span>
                                  </div>
                                  <div className="timeline-date">2024-06-10 14:25</div>
                                </div>
                                <div className="text-muted">192.168.1.10 (Chrome, macOS)</div>
                              </div>
                            </div>
                            <div className="timeline-item">
                              <div className="timeline-dot"><i className="bi bi-trash timeline-icon-error"></i></div>
                              <div className="timeline-card">
                                <div className="d-flex justify-content-between align-items-start w-100">
                                  <div>
                                    <span className="timeline-action">Удаление заявки</span>
                                    <span className="timeline-status-error">Ошибка</span>
                                  </div>
                                  <div className="timeline-date">2024-06-10 14:30</div>
                                </div>
                                <div className="text-muted">192.168.1.10 (Chrome, macOS)</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Table Tab */}
                        <div className="tab-pane fade" id="table-pane" role="tabpanel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <div className="activity-table">
                            <table className="table align-middle mb-0">
                              <thead>
                                <tr>
                                  <th><input type="checkbox" className="form-check-input" /></th>
                                  <th>Дата и время</th>
                                  <th>Действие</th>
                                  <th>Результат</th>
                                  <th>IP / Устройство</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td><input type="checkbox" className="form-check-input" /></td>
                                  <td>2024-06-10 14:23</td>
                                  <td><i className="bi bi-box-arrow-in-right text-info me-1"></i>Вход в систему</td>
                                  <td className="status-success">Успех</td>
                                  <td>192.168.1.10 (Chrome, macOS)</td>
                                </tr>
                                <tr>
                                  <td><input type="checkbox" className="form-check-input" /></td>
                                  <td>2024-06-10 14:25</td>
                                  <td><i className="bi bi-pencil-square text-warning me-1"></i>Изменение профиля</td>
                                  <td className="status-success">Успех</td>
                                  <td>192.168.1.10 (Chrome, macOS)</td>
                                </tr>
                                <tr>
                                  <td><input type="checkbox" className="form-check-input" /></td>
                                  <td>2024-06-10 14:30</td>
                                  <td><i className="bi bi-trash text-danger me-1"></i>Удаление заявки</td>
                                  <td className="status-error">Ошибка</td>
                                  <td>192.168.1.10 (Chrome, macOS)</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Terminal Tab */}
                        <div className="tab-pane fade" id="terminal-pane" role="tabpanel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <div className="activity-terminal-wrapper" style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: 'var(--border-radius)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`[2024-06-10 14:23] Вход в систему [Успех] 192.168.1.10 (Chrome, macOS)
[2024-06-10 14:25] Изменение профиля [Успех] 192.168.1.10 (Chrome, macOS)
[2024-06-10 14:30] Удаление заявки [Ошибка] 192.168.1.10 (Chrome, macOS)
[2024-06-10 15:00] Создание задачи [Успех] 192.168.1.10 (Chrome, macOS)`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Profile Page */}
            <article id="profile-page">
              <div className="bd-heading">
                <h3>Profile Page</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>User profile page with widgets</h4>
                  <div className="component-preview" style={{ minHeight: '600px', background: 'var(--bs-secondary-bg)', padding: '2rem' }}>
                    <div className="profile-page">
                      <div className="profile-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {/* Profile Header */}
                        <div className="profile-header" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--bs-border-color)' }}>
                          <div className="profile-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bs-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', flexShrink: 0 }}>
                            <i className="bi bi-person"></i>
                          </div>
                          <div className="profile-info" style={{ flex: 1 }}>
                            <h1 className="profile-name" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                              Админ Иванов <span style={{ color: 'var(--bs-secondary-color)' }}>|</span> <span style={{ color: 'var(--bs-secondary-color)', fontWeight: 400 }}>HR Generalist</span>
                            </h1>
                            <div className="profile-position" style={{ color: 'var(--bs-secondary-color)', marginBottom: '1rem', fontStyle: 'italic' }}>
                              Главный по тарелочкам в этой компании
                            </div>
                            <div className="profile-stats" style={{ display: 'flex', gap: '2rem' }}>
                              <div className="stat-item">
                                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>7</div>
                                <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)' }}>лет в компании</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>24</div>
                                <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)' }}>достижения</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</div>
                                <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)' }}>сертификаты</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profile Sections */}
                        <div className="profile-sections">
                          {/* About Section */}
                          <div className="profile-section" style={{ background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>О себе</h2>
                              <a href="#" className="section-action" style={{ color: 'var(--bs-primary)', textDecoration: 'none' }}>Редактировать</a>
                            </div>
                            <ul className="info-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              <li className="info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <div className="info-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bs-primary-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bs-primary)' }}>
                                  <i className="bi bi-envelope"></i>
                                </div>
                                <div className="info-content">
                                  <div className="info-value">
                                    <a href="mailto:ivan.petrov@company.com" style={{ color: 'var(--bs-primary)', textDecoration: 'none' }}>ivan.petrov@company.com</a>
                                  </div>
                                </div>
                              </li>
                              <li className="info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <div className="info-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bs-primary-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bs-primary)' }}>
                                  <i className="bi bi-telephone"></i>
                                </div>
                                <div className="info-content">
                                  <div className="info-value">
                                    <a href="tel:+79991234567" style={{ color: 'var(--bs-primary)', textDecoration: 'none' }}>+7 (999) 123-45-67</a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>

                          {/* Widgets Grid */}
                          <div className="profile-section" style={{ background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
                            <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Виджеты</h2>
                            <div className="widgets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                              <a href="#" className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--bs-body-color)', transition: 'all 0.2s ease' }}>
                                <div className="widget-icon" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(13, 110, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--bs-primary)', fontSize: '1.5rem' }}>
                                  <i className="bi bi-cash-stack"></i>
                                </div>
                                <div className="widget-title" style={{ fontWeight: 600, textAlign: 'center' }}>Моя зарплата</div>
                                <div className="widget-desc" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)', textAlign: 'center', marginTop: '0.5rem' }}>Зарплата и бонусы</div>
                              </a>
                              <a href="#" className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--bs-body-color)', transition: 'all 0.2s ease' }}>
                                <div className="widget-icon" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(13, 202, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--bs-info)', fontSize: '1.5rem' }}>
                                  <i className="bi bi-airplane"></i>
                                </div>
                                <div className="widget-title" style={{ fontWeight: 600, textAlign: 'center' }}>Мой отпуск</div>
                                <div className="widget-desc" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)', textAlign: 'center', marginTop: '0.5rem' }}>График отпусков</div>
                              </a>
                              <a href="#" className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--bs-body-color)', transition: 'all 0.2s ease' }}>
                                <div className="widget-icon" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(25, 135, 84, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--bs-success)', fontSize: '1.5rem' }}>
                                  <i className="bi bi-mortarboard"></i>
                                </div>
                                <div className="widget-title" style={{ fontWeight: 600, textAlign: 'center' }}>Мои курсы</div>
                                <div className="widget-desc" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)', textAlign: 'center', marginTop: '0.5rem' }}>Обучение</div>
                              </a>
                              <a href="#" className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--bs-body-color)', transition: 'all 0.2s ease' }}>
                                <div className="widget-icon" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--bs-warning)', fontSize: '1.5rem' }}>
                                  <i className="bi bi-plus-circle"></i>
                                </div>
                                <div className="widget-title" style={{ fontWeight: 600, textAlign: 'center' }}>Создать заявку</div>
                                <div className="widget-desc" style={{ fontSize: '0.875rem', color: 'var(--bs-secondary-color)', textAlign: 'center', marginTop: '0.5rem' }}>Новая заявка</div>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Settings Page */}
            <article id="settings-page">
              <div className="bd-heading">
                <h3>Settings Page</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Settings page with drag-and-drop widgets</h4>
                  <div className="component-preview" style={{ minHeight: '600px', background: 'var(--bs-secondary-bg)', padding: '2rem' }}>
                    <div className="settings-page">
                      <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                          <h1 className="settings-title" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Настройки</h1>
                          <p className="settings-subtitle" style={{ color: 'var(--bs-secondary-color)' }}>Управляйте своим профилем и виджетами</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline-secondary">Отмена</button>
                          <button className="btn btn-primary">
                            <i className="bi bi-check-lg me-1"></i>Сохранить
                          </button>
                        </div>
                      </div>

                      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Personal Info Card */}
                        <div className="settings-card" style={{ background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
                          <h2 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Админ Иванов</h2>
                          <p className="card-description" style={{ color: 'var(--bs-secondary-color)', marginBottom: '1.5rem' }}>Обновите свои контактные данные и аватар.</p>
                          
                          <div className="avatar-section" style={{ marginBottom: '1.5rem' }}>
                            <div className="avatar-upload-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <div className="avatar-preview" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bs-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', cursor: 'pointer', position: 'relative' }}>
                                <i className="bi bi-camera"></i>
                                <div className="avatar-upload-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                  <i className="bi bi-pencil text-white"></i>
                                </div>
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bs-secondary-color)' }}>
                                  Нажмите на фото, чтобы <br /> загрузить новое изображение.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label htmlFor="demoPhone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Телефон</label>
                              <input type="tel" id="demoPhone" className="form-control" defaultValue="+7 (999) 123-45-67" />
                            </div>
                            <div className="form-group">
                              <label htmlFor="demoTelegram" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telegram</label>
                              <input type="text" id="demoTelegram" className="form-control" defaultValue="@ivanov_admin" />
                            </div>
                            <div className="form-group">
                              <label htmlFor="demoBio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>О себе</label>
                              <textarea id="demoBio" className="form-control" rows={4} defaultValue="Опытный HR специалист"></textarea>
                            </div>
                          </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="settings-card" style={{ background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
                          <h2 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Смена пароля</h2>
                          <p className="card-description" style={{ color: 'var(--bs-secondary-color)', marginBottom: '1.5rem' }}>Для безопасности используйте сложный пароль.</p>
                          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label htmlFor="demoCurrentPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Текущий пароль</label>
                              <input type="password" id="demoCurrentPassword" className="form-control" />
                            </div>
                            <div className="form-group">
                              <label htmlFor="demoNewPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Новый пароль</label>
                              <input type="password" id="demoNewPassword" className="form-control" />
                            </div>
                            <div className="form-group">
                              <label htmlFor="demoConfirmPasswordSettings" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Подтвердите пароль</label>
                              <input type="password" id="demoConfirmPasswordSettings" className="form-control" />
                            </div>
                          </div>
                        </div>

                        {/* Widgets Management Card */}
                        <div className="settings-card" style={{ gridColumn: 'span 2', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', padding: '1.5rem' }}>
                          <h2 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Управление виджетами</h2>
                          <p className="card-description" style={{ color: 'var(--bs-secondary-color)', marginBottom: '1.5rem' }}>Перетащите виджеты, чтобы настроить главную страницу.</p>

                          <h3 className="drop-zone-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Активные виджеты</h3>
                          <div className="drop-zone selected-widgets" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', marginBottom: '2rem', minHeight: '100px', flexWrap: 'wrap' }}>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(13, 110, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-primary)' }}>
                                <i className="bi bi-cash-stack"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Моя зарплата</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(13, 202, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-info)' }}>
                                <i className="bi bi-airplane"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Мой отпуск</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(25, 135, 84, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-success)' }}>
                                <i className="bi bi-mortarboard"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Мои курсы</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--bs-secondary-color)', fontSize: '0.875rem', padding: '1rem' }}>
                              Перетащите сюда виджеты
                            </div>
                          </div>
                          
                          <h3 className="drop-zone-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Доступные виджеты</h3>
                          <div className="drop-zone available-widgets" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bs-secondary-bg)', borderRadius: 'var(--border-radius)', flexWrap: 'wrap' }}>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-warning)' }}>
                                <i className="bi bi-kanban"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Проекты</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(108, 117, 125, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-secondary)' }}>
                                <i className="bi bi-book"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Wiki</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(253, 126, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: '#fd7e14' }}>
                                <i className="bi bi-file-earmark-bar-graph"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Отчеты</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(13, 202, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-info)' }}>
                                <i className="bi bi-globe"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Портал</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(214, 51, 132, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: '#d63384' }}>
                                <i className="bi bi-graph-up-arrow"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>KPI</span>
                            </div>
                            <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--border-radius)', minWidth: '120px', cursor: 'grab' }}>
                              <div className="widget-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(220, 53, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--bs-danger)' }}>
                                <i className="bi bi-bullseye"></i>
                              </div>
                              <span className="widget-title" style={{ fontSize: '0.875rem', textAlign: 'center' }}>OKR</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Side Action Menu */}
            <article id="side-action-menu">
              <div className="bd-heading">
                <h3>Side Action Menu (Copy Floating Group)</h3>
              </div>
              <div>
                <div className="component-group">
                  <h4>Floating menu with round buttons, hover and pin functionality</h4>
                  <div className="component-preview" style={{ minHeight: '400px', position: 'relative', background: 'var(--bs-secondary-bg)', padding: '2rem' }}>
                    <CopyFloatingGroup actions={floatingActions} />
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bs-body-bg)', borderRadius: 'var(--bs-border-radius)', border: '1px solid var(--bs-border-color)' }}>
                      <p className="text-muted mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Наведите на иконку спидометра слева или зафиксируйте меню кликом
                      </p>
                    </div>
                  </div>
                  <p className="text-muted mt-2">
                    <small>Боковое меню с круглыми кнопками разных цветов. Тултипы отображаются справа от кнопок при наведении. Меню можно зафиксировать кликом на иконку спидометра.</small>
                  </p>
                </div>
              </div>
            </article>
          </section>

          {/* Секция: Наши переиспользуемые компоненты */}
          <section id="custom-components" className="component-section">
            <h2 className="section-title">
              <i className="bi bi-box-seam"></i> Наши переиспользуемые компоненты
            </h2>
            
            <div className="component-group">
              <h3>Button Component</h3>
              <div className="component-preview">
                <button className="btn btn-primary">Primary Button</button>
                <button className="btn btn-secondary btn-sm">Small Secondary</button>
                <button className="btn btn-outline-success">Outline Success</button>
                <button className="btn btn-danger">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Loading...
                </button>
              </div>
              <p className="text-muted mt-2">
                <small>Используй компонент <code>&lt;Button&gt;</code> из <code>./components/ui</code></small>
              </p>
            </div>

            <div className="component-group">
              <h3>Input Component</h3>
              <div className="component-preview">
                <div style={{ maxWidth: '400px' }}>
                  <div className="mb-3">
                    <label htmlFor="demo-email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="demo-email" 
                      placeholder="name@example.com"
                    />
                    <small className="form-text text-muted">We'll never share your email.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="demo-password" className="form-label">Password <span className="text-danger">*</span></label>
                    <input 
                      type="password" 
                      className="form-control is-invalid" 
                      id="demo-password" 
                      placeholder="Enter password"
                    />
                    <div className="invalid-feedback d-block">Password is required</div>
                  </div>
                </div>
              </div>
              <p className="text-muted mt-2">
                <small>Используй компонент <code>&lt;Input&gt;</code> из <code>./components/ui</code></small>
              </p>
            </div>

            <div className="component-group">
              <h3>Card Component</h3>
              <div className="component-preview">
                <div style={{ maxWidth: '400px' }}>
                  <div className="card">
                    <div className="card-header">Card Header</div>
                    <div className="card-body">
                      <h5>Card Title</h5>
                      <p>Some quick example text to build on the card title.</p>
                    </div>
                    <div className="card-footer">
                      <button className="btn btn-primary btn-sm">Action</button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-muted mt-2">
                <small>Используй компонент <code>&lt;Card&gt;</code> из <code>./components/ui</code></small>
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Modal dialogs */}
      <div className="modal fade" id="exampleModalDefault" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>Modal body text goes here.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="staticBackdropLive" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLiveLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLiveLabel">Modal title</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>I will not close if you click outside me. Don't even try to press escape key.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Understood</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="exampleModalCenteredScrollable" tabIndex={-1} aria-labelledby="exampleModalCenteredScrollableTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalCenteredScrollableTitle">Modal title</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>This is some placeholder content to show the scrolling behavior for modals.</p>
              <p>When content becomes longer than the predefined max-height of modal, content will be cropped and scrollable within the modal.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="exampleModalFullscreen" tabIndex={-1} aria-labelledby="exampleModalFullscreenLabel" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-4" id="exampleModalFullscreenLabel">Full screen modal</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>Full screen modal content goes here.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UICheatsheet;

