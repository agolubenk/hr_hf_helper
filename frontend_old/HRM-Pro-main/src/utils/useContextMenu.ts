import { useState } from 'react';
import { Module } from '../types';

export const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        selectedModule: Module | null;
        mouseX: number;
        mouseY: number;
    }>({ visible: false, selectedModule: null, mouseX: 0, mouseY: 0 });

    const handleContextMenu = (e: React.MouseEvent, module: Module) => {
        e.preventDefault();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        setContextMenu({
            visible: true,
            selectedModule: module,
            mouseX: e.clientX + scrollX,
            mouseY: e.clientY + scrollY
        });
    };

    const closeContextMenu = () => {
        setContextMenu(v => ({ ...v, visible: false, selectedModule: null }));
    };

    // Закрываем меню при скролле/resize/click вне
    // (обработчик click вне реализуется в компоненте)
    return {
        contextMenu,
        closeContextMenu,
        handleContextMenu
    };
}; 