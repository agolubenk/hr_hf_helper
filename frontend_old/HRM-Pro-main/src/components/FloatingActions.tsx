import React, { useState, useEffect } from 'react';

const FloatingActions: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className="floating-actions">
            <button className={`fab secondary ${isVisible ? 'visible' : ''}`} style={{opacity: isVisible ? 1: 0}} onClick={scrollToTop}>
                <i className="bi bi-arrow-up"></i>
            </button>
            <button className="fab">
                <i className="bi bi-plus-lg"></i>
            </button>
        </div>
    );
};

export default FloatingActions;
