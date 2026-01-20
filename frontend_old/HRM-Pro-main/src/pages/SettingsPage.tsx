import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import './SettingsPage.css';

interface Widget {
    id: string;
    title: string;
    icon: string;
    color: string;
}

const allWidgets: Widget[] = [
    { id: 'salary', title: 'Моя зарплата', icon: 'bi-cash-stack', color: '#5e81f4' },
    { id: 'vacation', title: 'Мой отпуск', icon: 'bi-airplane', color: '#2ec9c9' },
    { id: 'courses', title: 'Мои курсы', icon: 'bi-mortarboard', color: '#4caf50' },
    { id: 'projects', title: 'Проекты', icon: 'bi-kanban', color: '#ffc107' },
    { id: 'wiki', title: 'Wiki', icon: 'bi-book', color: '#6c757d' },
    { id: 'reports', title: 'Отчеты', icon: 'bi-file-earmark-bar-graph', color: '#fd7e14' },
    { id: 'portal', title: 'Портал', icon: 'bi-globe', color: '#0dcaf0' },
    { id: 'kpi', title: 'KPI', icon: 'bi-graph-up-arrow', color: '#d63384' },
    { id: 'okr', title: 'OKR', icon: 'bi-bullseye', color: '#dc3545' },
];

const SortableItem: React.FC<{ widget: Widget }> = ({ widget }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="widget-card" title={widget.title}>
            <div className="widget-icon" style={{ backgroundColor: `${widget.color}20`, color: widget.color }}>
                <i className={`bi ${widget.icon}`}></i>
            </div>
            <span className="widget-title">{widget.title}</span>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser, selectedWidgetIds } = state;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const selectedWidgets = useMemo(() => 
        selectedWidgetIds.map((id: any) => allWidgets.find(w => w.id === id)!).filter(Boolean), 
        [selectedWidgetIds]
    );

    const availableWidgets = useMemo(() => 
        allWidgets.filter(w => !selectedWidgetIds.includes(w.id)), 
        [selectedWidgetIds]
    );
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
    
        const activeId = active.id as string;
        const overId = over.id as string;
    
        const isActiveInSelected = selectedWidgetIds.includes(activeId);
        const isOverSelected = selectedWidgetIds.includes(overId);
    
        let newSelectedWidgetIds = [...selectedWidgetIds];
    
        if (isActiveInSelected) {
            if (isOverSelected) { // Re-order within selected
                const oldIndex = newSelectedWidgetIds.findIndex(id => id === activeId);
                const newIndex = newSelectedWidgetIds.findIndex(id => id === overId);
                newSelectedWidgetIds = arrayMove(newSelectedWidgetIds, oldIndex, newIndex);
            } else { // Move from selected to available
                newSelectedWidgetIds = newSelectedWidgetIds.filter(id => id !== activeId);
            }
        } else { // From available to selected
            if (isOverSelected) {
                const newIndex = newSelectedWidgetIds.findIndex(id => id === overId);
                newSelectedWidgetIds.splice(newIndex, 0, activeId);
            } else { // Add to the end of selected
                newSelectedWidgetIds.push(activeId);
            }
        }
    
        dispatch({ type: 'SET_SELECTED_WIDGETS', payload: newSelectedWidgetIds });
    };
    
    const handleSaveChanges = () => {
        // Here you would typically send data to a server
        console.log('Saving changes:', { selectedWidgetIds });
        addToast('Настройки успешно сохранены!', { type: 'success' });
    };

    const handleAvatarUpload = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                // В реальном приложении здесь будет отправка файла на сервер
                // и обновление currentUser в AppContext
                // dispatch({ type: 'UPDATE_USER_AVATAR', payload: reader.result as string });
            };
            reader.readAsDataURL(file);
            addToast('Аватар готов к сохранению.', { type: 'info' });
        }
    };

    const handleAvatarRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        addToast('Аватар будет удален после сохранения.', { type: 'warning' });
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="settings-page">
                <div className="settings-header">
                    <div className="title-section">
                        <h1 className="settings-title">Настройки</h1>
                        <p className="settings-subtitle">Управляйте своим профилем и виджетами</p>
                    </div>
                    <div className="actions-section">
                        <Link to="/account/profile" className="btn btn-outline">
                            <i className="bi bi-arrow-left me-2"></i>
                            Отмена
                        </Link>
                        <button className="btn btn-save" onClick={handleSaveChanges}>
                            <i className="bi bi-check-lg me-2"></i>
                            Сохранить
                        </button>
                    </div>
                </div>

                <div className="settings-grid">
                    {/* Personal Info Card */}
                    <div className="settings-card">
                        <h2 className="card-title">{currentUser?.firstName} {currentUser?.lastName}</h2>
                        <p className="card-description">Обновите свои контактные данные и аватар.</p>
                        
                        <div className="avatar-section">
                            <div className="avatar-upload-wrapper">
                                <div className="avatar-preview" onClick={handleAvatarUpload}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" />
                                    ) : (
                                        <span className="icon-placeholder">
                                            <i className="bi bi-camera"></i>
                                        </span>
                                    )}
                                    <div className="avatar-upload-overlay">
                                        <i className="bi bi-pencil"></i>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                {avatarPreview && (
                                    <button className="avatar-remove-btn" onClick={handleAvatarRemove} title="Удалить фото">
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                )}
                            </div>
                            <div className="avatar-actions">
                                <p className="card-description" style={{ margin: 0, lineHeight: 1.4, textAlign: 'left' }}>
                                    Нажмите на фото, чтобы <br /> загрузить новое изображение.
                                </p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="phone">Телефон</label>
                                <input type="tel" id="phone" defaultValue={currentUser?.phone || ''} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telegram">Telegram</label>
                                <input type="text" id="telegram" defaultValue={currentUser?.telegram || ''} />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="bio">О себе</label>
                                <textarea id="bio" rows={4} defaultValue={currentUser?.bio || ""}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="settings-card">
                        <h2 className="card-title">Смена пароля</h2>
                        <p className="card-description">Для безопасности используйте сложный пароль.</p>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label htmlFor="currentPassword">Текущий пароль</label>
                                <input type="password" id="currentPassword" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">Новый пароль</label>
                                <input type="password" id="newPassword" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                                <input type="password" id="confirmPassword" />
                            </div>
                        </div>
                    </div>

                    {/* Widgets Management Card */}
                    <div className="settings-card full-width-card">
                        <h2 className="card-title">Управление виджетами</h2>
                        <p className="card-description">Перетащите виджеты, чтобы настроить главную страницу.</p>

                        <h3 className="drop-zone-title">Активные виджеты</h3>
                        <div className="drop-zone selected-widgets" id="selected">
                            <SortableContext items={selectedWidgetIds} strategy={horizontalListSortingStrategy}>
                                {selectedWidgets.map(widget => <SortableItem key={widget.id} widget={widget} />)}
                            </SortableContext>
                            {selectedWidgets.length === 0 && <div className="placeholder">Перетащите сюда виджеты</div>}
                        </div>
                        
                        <h3 className="drop-zone-title">Доступные виджеты</h3>
                        <div className="drop-zone available-widgets" id="available">
                             <SortableContext items={availableWidgets.map(w => w.id)} strategy={horizontalListSortingStrategy}>
                                {availableWidgets.map(widget => <SortableItem key={widget.id} widget={widget} />)}
                            </SortableContext>
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
};

export default SettingsPage;