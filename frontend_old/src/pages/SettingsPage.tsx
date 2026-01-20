import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSelectedWidgets, saveSelectedWidgets } from '../utils/userStorage';
import { toastSuccess, toastInfo, toastWarning, toastError, toastConfirm } from '../utils/toastHelper';
import { api } from '../utils/api';
import { themes, type ThemeName, getThemeFruitImageUrl } from '../utils/themeManager';
import { languages, type LanguageCode } from '../components/LanguageSelector';
import './SettingsPage.css';

interface Widget {
    id: string;
    title: string;
    icon: string;
    color: string;
}

interface QuickCopyButton {
    id: string;
    name: string;
    content: string;
    color: string;
    icon: string;
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

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const initialSelectedWidgets = getSelectedWidgets();
    
    const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>(initialSelectedWidgets);
    const [profile, setProfile] = useState<any>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [bio, setBio] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Быстрые кнопки копирования
    const [quickCopyButtons, setQuickCopyButtons] = useState<QuickCopyButton[]>(() => {
        const saved = localStorage.getItem('quickCopyButtons');
        return saved ? JSON.parse(saved) : [];
    });
    const [editingButton, setEditingButton] = useState<QuickCopyButton | null>(null);
    const [showAddButtonForm, setShowAddButtonForm] = useState(false);

    // Настройки отображения
    const [defaultLanguage, setDefaultLanguage] = useState<LanguageCode>(() => {
        const saved = localStorage.getItem('hrm_default_language');
        return (saved && languages.some(l => l.code === saved)) ? saved as LanguageCode : 'ru';
    });
    const [defaultLightTheme, setDefaultLightTheme] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('hrm_default_light_theme');
        const lightThemes = themes.filter(t => t.mode === 'light');
        return (saved && lightThemes.some(t => t.id === saved)) ? saved as ThemeName : 'light';
    });
    const [defaultDarkTheme, setDefaultDarkTheme] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('hrm_default_dark_theme');
        const darkThemes = themes.filter(t => t.mode === 'dark');
        return (saved && darkThemes.some(t => t.id === saved)) ? saved as ThemeName : 'dark';
    });
    const [activeLanguages, setActiveLanguages] = useState<LanguageCode[]>(() => {
        const saved = localStorage.getItem('hrm_active_languages');
        return saved ? JSON.parse(saved) : ['ru', 'en'];
    });
    const [activeThemes, setActiveThemes] = useState<ThemeName[]>(() => {
        const saved = localStorage.getItem('hrm_active_themes');
        return saved ? JSON.parse(saved) : ['light', 'dark'];
    });

    const selectedWidgets = useMemo(() => 
        selectedWidgetIds.map(id => allWidgets.find(w => w.id === id)!).filter(Boolean), 
        [selectedWidgetIds]
    );

    const availableWidgets = useMemo(() => 
        allWidgets.filter(w => !selectedWidgetIds.includes(w.id)), 
        [selectedWidgetIds]
    );

    const [isSaving, setIsSaving] = useState(false);


    // Инициализация Bootstrap dropdown для кастомных селектов тем
    useEffect(() => {
        const initDropdowns = async () => {
            if (typeof window !== 'undefined' && (window as any).bootstrap) {
                const bootstrap = (window as any).bootstrap;
                const lightDropdown = document.getElementById('defaultLightThemeDropdown');
                const darkDropdown = document.getElementById('defaultDarkThemeDropdown');
                
                if (lightDropdown) {
                    new bootstrap.Dropdown(lightDropdown);
                }
                if (darkDropdown) {
                    new bootstrap.Dropdown(darkDropdown);
                }
            }
        };
        
        initDropdowns();
    }, []);

    useEffect(() => {
        // Загружаем профиль при монтировании
        const loadProfile = async () => {
            try {
                const profileData = await api.getProfile();
                console.log('📥 SettingsPage: Profile data loaded:', profileData);
                if (profileData) {
                    setProfile(profileData);
                    setPhone(profileData.phone || '');
                    setTelegram(profileData.telegram || '');
                    setBio(profileData.notes || '');
                    if (profileData.avatar) {
                        setAvatarPreview(profileData.avatar);
                    }
                }
            } catch (error) {
                console.error('❌ SettingsPage: Failed to load profile:', error);
                // Пытаемся загрузить текущего пользователя
                try {
                    const currentUserData = await api.getCurrentUser();
                    console.log('📥 SettingsPage: Current user data loaded:', currentUserData);
                    if (currentUserData) {
                        setProfile(currentUserData);
                        setPhone(currentUserData.phone || '');
                        setTelegram(currentUserData.telegram || '');
                        setBio(currentUserData.notes || '');
                        if (currentUserData.avatar) {
                            setAvatarPreview(currentUserData.avatar);
                        }
                    }
                } catch (e) {
                    console.error('❌ SettingsPage: Failed to load current user:', e);
                }
            }
        };
        loadProfile();
    }, []);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // Обновляем профиль через API
            const updateData: any = {};
            // Добавляем данные из профиля, если они есть
            if (profile?.first_name) updateData.first_name = profile.first_name;
            if (profile?.last_name) updateData.last_name = profile.last_name;
            if (profile?.middle_name) updateData.middle_name = profile.middle_name;
            if (phone) updateData.phone = phone;
            if (telegram) updateData.telegram = telegram;
            if (bio) updateData.notes = bio;
            if (avatarPreview) updateData.avatar = avatarPreview;

            console.log('📤 SettingsPage: Sending update data:', updateData);
            const updatedProfile = await api.updateProfile(updateData);
            console.log('📥 SettingsPage: Received updated profile:', updatedProfile);
            
            // Обновляем локальное состояние профиля
            setProfile(updatedProfile);
            
            // Сохраняем виджеты локально
        saveSelectedWidgets(selectedWidgetIds);
        
        toastSuccess('Настройки успешно сохранены!', 'Сохранено');
        
        // Перенаправляем на профиль
        setTimeout(() => {
            navigate('/account/profile');
        }, 1000);
        } catch (error: any) {
            toastError(error.message || 'Ошибка при сохранении настроек', 'Ошибка');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                toastInfo('Аватар готов к сохранению.', 'Аватар');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toastWarning('Аватар будет удален после сохранения.', 'Удаление аватара');
    };

    const handleAddWidget = (widgetId: string) => {
        setSelectedWidgetIds([...selectedWidgetIds, widgetId]);
    };

    const handleRemoveWidget = (widgetId: string) => {
        setSelectedWidgetIds(selectedWidgetIds.filter(id => id !== widgetId));
    };

    const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
        const index = selectedWidgetIds.indexOf(widgetId);
        if (index === -1) return;
        
        const newIds = [...selectedWidgetIds];
        if (direction === 'up' && index > 0) {
            [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
        } else if (direction === 'down' && index < newIds.length - 1) {
            [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
        }
        setSelectedWidgetIds(newIds);
    };

    // Функции для работы с быстрыми кнопками копирования
    const saveQuickCopyButtons = (buttons: QuickCopyButton[]) => {
        localStorage.setItem('quickCopyButtons', JSON.stringify(buttons));
        setQuickCopyButtons(buttons);
    };

    const handleAddQuickCopyButton = () => {
        const newButton: QuickCopyButton = {
            id: Date.now().toString(),
            name: '',
            content: '',
            color: '#667eea',
            icon: 'bi-clipboard'
        };
        setEditingButton(newButton);
        setShowAddButtonForm(true);
    };

    const handleEditQuickCopyButton = (button: QuickCopyButton) => {
        setEditingButton({ ...button });
        setShowAddButtonForm(true);
    };

    const handleSaveQuickCopyButton = () => {
        if (!editingButton) return;
        
        if (!editingButton.name.trim() || !editingButton.content.trim()) {
            toastError('Заполните название и содержимое кнопки', 'Ошибка');
            return;
        }

        const updatedButtons = editingButton.id && quickCopyButtons.find(b => b.id === editingButton.id)
            ? quickCopyButtons.map(b => b.id === editingButton.id ? editingButton : b)
            : [...quickCopyButtons, editingButton];
        
        saveQuickCopyButtons(updatedButtons);
        setShowAddButtonForm(false);
        setEditingButton(null);
        toastSuccess('Кнопка сохранена', 'Успешно');
    };

    const handleDeleteQuickCopyButton = (id: string) => {
        toastConfirm(
            'Вы уверены, что хотите удалить эту кнопку?',
            () => {
                const updatedButtons = quickCopyButtons.filter(b => b.id !== id);
                saveQuickCopyButtons(updatedButtons);
                toastSuccess('Кнопка удалена', 'Успешно');
            },
            undefined,
            'Подтверждение удаления'
        );
    };

    const handleCopyContent = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            toastSuccess('Скопировано в буфер обмена', 'Успешно');
        }).catch(() => {
            toastError('Не удалось скопировать', 'Ошибка');
        });
    };

    // Популярные Bootstrap Icons
    const popularIcons = [
        'bi-clipboard', 'bi-clipboard-check', 'bi-clipboard-data', 'bi-file-text',
        'bi-envelope', 'bi-telephone', 'bi-person', 'bi-person-badge',
        'bi-calendar', 'bi-clock', 'bi-geo-alt', 'bi-link-45deg',
        'bi-code', 'bi-terminal', 'bi-hash', 'bi-at',
        'bi-check-circle', 'bi-x-circle', 'bi-info-circle', 'bi-exclamation-circle',
        'bi-star', 'bi-heart', 'bi-bookmark', 'bi-tag'
    ];

    // Цветовая палитра
    const colorPalette = [
        { name: 'Синий', value: '#667eea' },
        { name: 'Зеленый', value: '#4caf50' },
        { name: 'Красный', value: '#dc3545' },
        { name: 'Оранжевый', value: '#fd7e14' },
        { name: 'Желтый', value: '#ffc107' },
        { name: 'Фиолетовый', value: '#6f42c1' },
        { name: 'Розовый', value: '#d63384' },
        { name: 'Бирюзовый', value: '#0dcaf0' },
        { name: 'Серый', value: '#6c757d' },
        { name: 'Темно-синий', value: '#0d6efd' }
    ];

    return (
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
                    <button 
                        className="btn btn-save" 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Сохранение...
                            </>
                        ) : (
                            <>
                        <i className="bi bi-check-lg me-2"></i>
                        Сохранить
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="settings-grid">
                {/* Personal Info Card */}
                <div className="settings-card">
                    <h2 className="card-title">
                        {(() => {
                            // Пытаемся получить имя из профиля
                            if (profile?.full_name) {
                                return profile.full_name;
                            }
                            if (profile?.first_name || profile?.last_name) {
                                const parts = [
                                    profile.last_name,
                                    profile.first_name,
                                    profile.middle_name
                                ].filter(Boolean);
                                return parts.join(' ') || 'Пользователь';
                            }
                            return 'Пользователь';
                        })()}
                    </h2>
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
                            <input 
                                type="tel" 
                                id="phone" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telegram">Telegram</label>
                            <input 
                                type="text" 
                                id="telegram" 
                                value={telegram}
                                onChange={(e) => setTelegram(e.target.value)}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="bio">О себе</label>
                            <textarea 
                                id="bio" 
                                rows={4} 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            ></textarea>
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
                            <input 
                                type="password" 
                                id="currentPassword" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">Новый пароль</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтвердите пароль</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group full-width">
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    if (newPassword !== confirmPassword) {
                                        toastError('Пароли не совпадают', 'Ошибка');
                                        return;
                                    }
                                    if (newPassword.length < 6) {
                                        toastError('Пароль должен быть не менее 6 символов', 'Ошибка');
                                        return;
                                    }
                                    setIsChangingPassword(true);
                                    try {
                                        await api.changePassword(currentPassword, newPassword);
                                        toastSuccess('Пароль успешно изменен', 'Сохранено');
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    } catch (error: any) {
                                        toastError(error.message || 'Ошибка при смене пароля', 'Ошибка');
                                    } finally {
                                        setIsChangingPassword(false);
                                    }
                                }}
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                            >
                                {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Настройки языка и темы */}
                    {/* Настройки языка */}
                    <div className="settings-card">
                            <h2 className="card-title">
                                <i className="bi bi-globe2 me-2"></i>
                                Настройки языка
                            </h2>
                            <p className="card-description">Настройте язык интерфейса по умолчанию и доступные варианты.</p>

                            <div className="row g-4">
                                {/* Язык по умолчанию */}
                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label">Язык по умолчанию</label>
                                        <select
                                            className="form-select"
                                            value={defaultLanguage}
                                            onChange={(e) => {
                                                const lang = e.target.value as LanguageCode;
                                                setDefaultLanguage(lang);
                                                localStorage.setItem('hrm_default_language', lang);
                                                // Автоматически добавляем выбранный язык в активные, если его там нет
                                                if (!activeLanguages.includes(lang)) {
                                                    const newActive = [...activeLanguages, lang];
                                                    setActiveLanguages(newActive);
                                                    localStorage.setItem('hrm_active_languages', JSON.stringify(newActive));
                                                }
                                            }}
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.nameNative} ({lang.abbreviation})
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted">Язык, который будет использоваться по умолчанию при первом входе</small>
                                    </div>
                                </div>

                                {/* Активные языки */}
                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label">Активные языки</label>
                                        <small className="text-muted d-block mb-3">Выберите языки, которые будут доступны для выбора в интерфейсе</small>
                                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                                            {languages.map(lang => (
                                                <div key={lang.code} style={{ whiteSpace: 'nowrap' }}>
                                                    <label 
                                                        className={`form-check ${lang.code === defaultLanguage ? 'text-muted' : ''}`}
                                                        htmlFor={`lang-${lang.code}`}
                                                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`lang-${lang.code}`}
                                                            checked={activeLanguages.includes(lang.code)}
                                                            disabled={lang.code === defaultLanguage}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const newActive = [...activeLanguages, lang.code];
                                                                    setActiveLanguages(newActive);
                                                                    localStorage.setItem('hrm_active_languages', JSON.stringify(newActive));
                                                                } else {
                                                                    // Не позволяем убрать последний язык
                                                                    if (activeLanguages.length > 1) {
                                                                        const newActive = activeLanguages.filter(l => l !== lang.code);
                                                                        setActiveLanguages(newActive);
                                                                        localStorage.setItem('hrm_active_languages', JSON.stringify(newActive));
                                                                    } else {
                                                                        toastWarning('Должен быть выбран хотя бы один язык', 'Предупреждение');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <span>{lang.flag}</span>
                                                        <span>{lang.nameNative}</span>
                                                        {lang.code === defaultLanguage && (
                                                            <span className="badge bg-primary">По умолчанию</span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                    <div className="settings-card">
                    {/* Настройки темы */}
                            <h2 className="card-title">
                                <i className="bi bi-palette me-2"></i>
                                Настройки темы
                            </h2>
                            <p className="card-description">Настройте темы оформления по умолчанию и доступные варианты.</p>

                            <div className="row d-flex justify-content-center gap-3">
                                {/* Светлая тема по умолчанию */}
                                <div className="col-6">
                                    <div className="form-group">
                                        <label className="form-label">Светлая тема по умолчанию</label>
                                        <div className="dropdown">
                                            <button
                                                className="form-select text-start d-flex align-items-center"
                                                type="button"
                                                id="defaultLightThemeDropdown"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {(() => {
                                                    const selectedTheme = themes.find(t => t.id === defaultLightTheme && t.mode === 'light');
                                                    if (!selectedTheme) return <span>Выберите тему</span>;
                                                    const themeFruitImageUrl = selectedTheme.fruitImagePath ? getThemeFruitImageUrl(selectedTheme.fruitImagePath) : '';
                                                    const themeSecondaryImageUrl = selectedTheme.secondaryImagePath ? getThemeFruitImageUrl(selectedTheme.secondaryImagePath) : '';
                                                    return (
                                                        <>
                                                            {themeFruitImageUrl ? (
                                                                <span className={`me-2 d-inline-block ${selectedTheme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle', flexShrink: 0 }}>
                                                                    <img src={themeFruitImageUrl} alt={selectedTheme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                    {themeSecondaryImageUrl && (
                                                                        <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                            <img src={themeSecondaryImageUrl} alt={selectedTheme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="me-2">{selectedTheme.icon}</span>
                                                            )}
                                                            <span>{selectedTheme.name}</span>
                                                        </>
                                                    );
                                                })()}
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="defaultLightThemeDropdown">
                                                {themes.filter(t => t.mode === 'light').map(theme => {
                                                    const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
                                                    const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
                                                    return (
                                                        <li key={theme.id}>
                                                            <button
                                                                className={`dropdown-item ${defaultLightTheme === theme.id ? 'active' : ''}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setDefaultLightTheme(theme.id);
                                                                    localStorage.setItem('hrm_default_light_theme', theme.id);
                                                                    if (!activeThemes.includes(theme.id)) {
                                                                        const newActive = [...activeThemes, theme.id];
                                                                        setActiveThemes(newActive);
                                                                        localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                    }
                                                                }}
                                                            >
                                                                {themeFruitImageUrl ? (
                                                                    <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                                                                        <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                        {themeSecondaryImageUrl && (
                                                                            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                                <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="me-2">{theme.icon}</span>
                                                                )}
                                                                {theme.name}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <small className="text-muted">Светлая тема, которая будет использоваться по умолчанию</small>
                                    </div>
                                </div>

                                {/* Темная тема по умолчанию */}
                                <div className="col-6">
                                    <div className="form-group">
                                        <label className="form-label">Темная тема по умолчанию</label>
                                        <div className="dropdown">
                                            <button
                                                className="form-select text-start d-flex align-items-center"
                                                type="button"
                                                id="defaultDarkThemeDropdown"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {(() => {
                                                    const selectedTheme = themes.find(t => t.id === defaultDarkTheme && t.mode === 'dark');
                                                    if (!selectedTheme) return <span>Выберите тему</span>;
                                                    const themeFruitImageUrl = selectedTheme.fruitImagePath ? getThemeFruitImageUrl(selectedTheme.fruitImagePath) : '';
                                                    const themeSecondaryImageUrl = selectedTheme.secondaryImagePath ? getThemeFruitImageUrl(selectedTheme.secondaryImagePath) : '';
                                                    return (
                                                        <>
                                                            {themeFruitImageUrl ? (
                                                                <span className={`me-2 d-inline-block ${selectedTheme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle', flexShrink: 0 }}>
                                                                    <img src={themeFruitImageUrl} alt={selectedTheme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                    {themeSecondaryImageUrl && (
                                                                        <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                            <img src={themeSecondaryImageUrl} alt={selectedTheme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="me-2">{selectedTheme.icon}</span>
                                                            )}
                                                            <span>{selectedTheme.name}</span>
                                                        </>
                                                    );
                                                })()}
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="defaultDarkThemeDropdown">
                                                {themes.filter(t => t.mode === 'dark').map(theme => {
                                                    const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
                                                    const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
                                                    return (
                                                        <li key={theme.id}>
                                                            <button
                                                                className={`dropdown-item ${defaultDarkTheme === theme.id ? 'active' : ''}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setDefaultDarkTheme(theme.id);
                                                                    localStorage.setItem('hrm_default_dark_theme', theme.id);
                                                                    if (!activeThemes.includes(theme.id)) {
                                                                        const newActive = [...activeThemes, theme.id];
                                                                        setActiveThemes(newActive);
                                                                        localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                    }
                                                                }}
                                                            >
                                                                {themeFruitImageUrl ? (
                                                                    <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                                                                        <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                        {themeSecondaryImageUrl && (
                                                                            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                                <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="me-2">{theme.icon}</span>
                                                                )}
                                                                {theme.name}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <small className="text-muted">Темная тема, которая будет использоваться по умолчанию</small>
                                    </div>
                                </div>

                                {/* Активные темы */}
                                <div className="row">
                                    <div className="form-group">
                                        <label className="form-label d-flex justify-content-center">Активные темы</label>
                                        <small className="text-muted d-block mb-3 d-flex justify-content-center">Выберите темы, которые будут доступны для выбора в интерфейсе</small>
                                        <div className="row g-4  d-flex justify-content-center gap-3">
                                            {/* Светлые темы */}
                                            <div className="col-6 col-sm-12">
                                                <div className="d-flex flex-column gap-2">
                                                    {themes.filter(t => t.mode === 'light').map(theme => {
                                                        const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
                                                        const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
                                                        return (
                                                            <div key={theme.id} style={{ whiteSpace: 'nowrap' }}>
                                                                <label 
                                                                    className={`form-check ${theme.id === defaultLightTheme ? 'text-muted' : ''}`}
                                                                    htmlFor={`theme-${theme.id}`}
                                                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`theme-${theme.id}`}
                                                                        checked={activeThemes.includes(theme.id)}
                                                                        disabled={theme.id === defaultLightTheme}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                const newActive = [...activeThemes, theme.id];
                                                                                setActiveThemes(newActive);
                                                                                localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                            } else {
                                                                                // Не позволяем убрать последнюю тему
                                                                                if (activeThemes.length > 1) {
                                                                                    const newActive = activeThemes.filter(t => t !== theme.id);
                                                                                    setActiveThemes(newActive);
                                                                                    localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                                } else {
                                                                                    toastWarning('Должна быть выбрана хотя бы одна тема', 'Предупреждение');
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {themeFruitImageUrl ? (
                                                                        <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                                                                            <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                            {themeSecondaryImageUrl && (
                                                                                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                                    <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        <span>{theme.icon}</span>
                                                                    )}
                                                                    <span>{theme.name}</span>
                                                                    {theme.id === defaultLightTheme && (
                                                                        <span className="badge bg-warning text-dark">По умолчанию</span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Темные темы */}
                                            <div className="col-6 col-sm-12">
                                                <div className="d-flex flex-column gap-2">
                                                    {themes.filter(t => t.mode === 'dark').map(theme => {
                                                        const themeFruitImageUrl = theme.fruitImagePath ? getThemeFruitImageUrl(theme.fruitImagePath) : '';
                                                        const themeSecondaryImageUrl = theme.secondaryImagePath ? getThemeFruitImageUrl(theme.secondaryImagePath) : '';
                                                        return (
                                                            <div key={theme.id} style={{ whiteSpace: 'nowrap' }}>
                                                                <label 
                                                                    className={`form-check ${theme.id === defaultDarkTheme ? 'text-muted' : ''}`}
                                                                    htmlFor={`theme-${theme.id}`}
                                                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`theme-${theme.id}`}
                                                                        checked={activeThemes.includes(theme.id)}
                                                                        disabled={theme.id === defaultDarkTheme}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                const newActive = [...activeThemes, theme.id];
                                                                                setActiveThemes(newActive);
                                                                                localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                            } else {
                                                                                // Не позволяем убрать последнюю тему
                                                                                if (activeThemes.length > 1) {
                                                                                    const newActive = activeThemes.filter(t => t !== theme.id);
                                                                                    setActiveThemes(newActive);
                                                                                    localStorage.setItem('hrm_active_themes', JSON.stringify(newActive));
                                                                                } else {
                                                                                    toastWarning('Должна быть выбрана хотя бы одна тема', 'Предупреждение');
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {themeFruitImageUrl ? (
                                                                        <span className={`me-2 d-inline-block ${theme.id.includes('blackberry') ? 'theme-dropdown-icon-blackberry' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'visible', position: 'relative', verticalAlign: 'middle' }}>
                                                                            <img src={themeFruitImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                                            {themeSecondaryImageUrl && (
                                                                                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12.8px', height: '12.8px', backgroundColor: 'var(--bs-body-bg)', borderRadius: '50%', border: '1.5px solid var(--bs-border-color)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', zIndex: 2 }}>
                                                                                    <img src={themeSecondaryImageUrl} alt={theme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', transform: 'scale(1.22)' }} />
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        <span>{theme.icon}</span>
                                                                    )}
                                                                    <span>{theme.name}</span>
                                                                    {theme.id === defaultDarkTheme && (
                                                                        <span className="badge bg-dark">По умолчанию</span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        </div>
                    </div>
                </div>

                {/* Widgets Management Card */}
                <div className="settings-card full-width-card">
                    <h2 className="card-title">Управление виджетами</h2>
                    <p className="card-description">Выберите и упорядочьте виджеты для главной страницы.</p>

                    <h3 className="drop-zone-title">Активные виджеты</h3>
                    <div className="drop-zone selected-widgets">
                        {selectedWidgets.length > 0 ? (
                            selectedWidgets.map((widget, index) => (
                                <div key={widget.id} className="widget-card">
                                    <div className="widget-icon" style={{ backgroundColor: `${widget.color}20`, color: widget.color }}>
                                        <i className={`bi ${widget.icon}`}></i>
                                    </div>
                                    <span className="widget-title">{widget.title}</span>
                                    <div className="widget-actions">
                                        {index > 0 && (
                                            <button 
                                                className="widget-action-btn" 
                                                onClick={() => handleMoveWidget(widget.id, 'up')}
                                                title="Вверх"
                                            >
                                                <i className="bi bi-arrow-up"></i>
                                            </button>
                                        )}
                                        {index < selectedWidgets.length - 1 && (
                                            <button 
                                                className="widget-action-btn" 
                                                onClick={() => handleMoveWidget(widget.id, 'down')}
                                                title="Вниз"
                                            >
                                                <i className="bi bi-arrow-down"></i>
                                            </button>
                                        )}
                                        <button 
                                            className="widget-action-btn widget-action-btn-remove" 
                                            onClick={() => handleRemoveWidget(widget.id)}
                                            title="Удалить"
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="placeholder">Выберите виджеты из списка доступных</div>
                        )}
                    </div>
                    
                    <h3 className="drop-zone-title">Доступные виджеты</h3>
                    <div className="drop-zone available-widgets">
                        {availableWidgets.map(widget => (
                            <div key={widget.id} className="widget-card widget-card-addable" onClick={() => handleAddWidget(widget.id)}>
                                <div className="widget-icon" style={{ backgroundColor: `${widget.color}20`, color: widget.color }}>
                                    <i className={`bi ${widget.icon}`}></i>
                                </div>
                                <span className="widget-title">{widget.title}</span>
                                <button 
                                    className="widget-action-btn widget-action-btn-add" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddWidget(widget.id);
                                    }}
                                    title="Добавить"
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>
                        ))}
                        {availableWidgets.length === 0 && (
                            <div className="placeholder">Все виджеты добавлены</div>
                        )}
                    </div>
                </div>

                {/* Quick Copy Buttons Card */}
                <div className="settings-card full-width-card">
                    <h2 className="card-title">Быстрые кнопки копирования</h2>
                    <p className="card-description">Создайте кнопки для быстрого копирования часто используемого текста.</p>

                    {quickCopyButtons.length > 0 && (
                        <div className="quick-copy-buttons-grid">
                            {quickCopyButtons.map((button) => (
                                <div key={button.id} className="quick-copy-button-item">
                                    <button
                                        className="quick-copy-button"
                                        style={{ 
                                            backgroundColor: `${button.color}20`,
                                            borderColor: button.color,
                                            color: button.color
                                        }}
                                        onClick={() => handleCopyContent(button.content)}
                                        title={`Копировать: ${button.content}`}
                                    >
                                        <i className={`bi ${button.icon}`}></i>
                                        <span className="quick-copy-button-text">{button.name}</span>
                                        <div 
                                            className="quick-copy-button-actions"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                className="btn-icon-inline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditQuickCopyButton(button);
                                                }}
                                                title="Редактировать"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn-icon-inline btn-icon-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteQuickCopyButton(button.id);
                                                }}
                                                title="Удалить"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddButtonForm && editingButton && (
                        <div className="quick-copy-form">
                            <h3 className="form-title">{editingButton.id && quickCopyButtons.find(b => b.id === editingButton.id) ? 'Редактировать кнопку' : 'Добавить кнопку'}</h3>
                            
                            <div className="form-group">
                                <label>Название кнопки</label>
                                <input
                                    type="text"
                                    value={editingButton.name}
                                    onChange={(e) => setEditingButton({ ...editingButton, name: e.target.value })}
                                    placeholder="Например: Email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Содержимое для копирования</label>
                                <textarea
                                    value={editingButton.content}
                                    onChange={(e) => setEditingButton({ ...editingButton, content: e.target.value })}
                                    placeholder="Текст, который будет скопирован при нажатии"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Иконка (Bootstrap Icons)</label>
                                <div className="icon-selector">
                                    <div className="icon-preview">
                                        <i className={`bi ${editingButton.icon}`}></i>
                                    </div>
                                    <input
                                        type="text"
                                        value={editingButton.icon}
                                        onChange={(e) => setEditingButton({ ...editingButton, icon: e.target.value })}
                                        placeholder="bi-clipboard"
                                        className="icon-input"
                                        list="icon-suggestions"
                                    />
                                    <datalist id="icon-suggestions">
                                        {popularIcons.map(icon => (
                                            <option key={icon} value={icon} />
                                        ))}
                                    </datalist>
                                </div>
                                <small className="text-muted">Например: bi-clipboard, bi-envelope, bi-telephone</small>
                            </div>

                            <div className="form-group">
                                <label>Цвет</label>
                                <div className="color-selector">
                                    {colorPalette.map(color => (
                                        <button
                                            key={color.value}
                                            className={`color-option ${editingButton.color === color.value ? 'active' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => setEditingButton({ ...editingButton, color: color.value })}
                                            title={color.name}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={editingButton.color}
                                        onChange={(e) => setEditingButton({ ...editingButton, color: e.target.value })}
                                        className="color-picker"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveQuickCopyButton}
                                >
                                    <i className="bi bi-check-lg me-2"></i>
                                    Сохранить
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowAddButtonForm(false);
                                        setEditingButton(null);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}

                    {!showAddButtonForm && (
                        <button
                            className="btn btn-outline-primary mt-3"
                            onClick={handleAddQuickCopyButton}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Добавить кнопку
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

