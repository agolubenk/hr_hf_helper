import React, { useState, useEffect, useRef } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import { useAppContext } from '../context/AppContext';
import { Language } from '../types';

const languages: { key: Language; name: string; flag: string }[] = [
    { key: 'ru', name: 'Русский', flag: '🇷🇺' },
    { key: 'en', name: 'English', flag: '🇬🇧' },
];

const LanguageSwitcher: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { x, y, strategy, refs } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom-end',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
        ],
    });

    const handleLanguageChange = (lang: Language) => {
        dispatch({ type: 'CHANGE_LANGUAGE', payload: lang });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const currentLanguage = languages.find(lang => lang.key === state.language) || languages[0];

    return (
        <div className="position-relative" ref={containerRef}>
            <button
                ref={refs.setReference}
                className="quick-action-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Сменить язык"
            >
                <i className="bi bi-globe2"></i>
                <span className="language-indicator">{currentLanguage.flag}</span>
            </button>

            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        zIndex: 1060,
                    }}
                    className="language-menu"
                >
                    {languages.map(lang => (
                        <a
                            href="/#"
                            key={lang.key}
                            className={`language-item ${state.language === lang.key ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleLanguageChange(lang.key);
                            }}
                        >
                            <span className="language-flag">{lang.flag}</span>
                            <span>{lang.name}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher; 