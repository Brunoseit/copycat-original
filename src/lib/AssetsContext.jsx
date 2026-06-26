// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';

const AssetsContext = createContext(null);

export const AssetsProvider = ({ children }) => {
    const [customAssets, setCustomAssets] = useState(() => {
        const saved = localStorage.getItem('local_dbd_assets');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('local_dbd_assets', JSON.stringify(customAssets));
    }, [customAssets]);

    const addAsset = (assetData) => {
        // ¡CORRECCIÓN! Usar 'nombre' en lugar de 'name' para que el juego lo reconozca
        if (!assetData.nombre.trim()) return;
        const newAsset = { ...assetData, id: Date.now().toString() };
        setCustomAssets(prev => [...prev, newAsset]);
    };

    const removeAsset = (id) => {
        setCustomAssets(prev => prev.filter(a => a.id !== id));
    };

    // ¡NUEVO! Función para cargar una base de datos desde un archivo
    const importAssets = (importedList) => {
        setCustomAssets(importedList);
    };

    const killers = customAssets.filter(a => a.type === 'character' && a.role === 'killer');
    const survivors = customAssets.filter(a => a.type === 'character' && a.role === 'survivor');
    const perks = customAssets.filter(a => a.type === 'perk');

    const findChar = (id) => customAssets.find(a => a.id === id) || { nombre: 'Desconocido', imageUrl: '' };
    const findPerk = (id) => customAssets.find(a => a.id === id) || { nombre: 'Perk Desconocida', imageUrl: '' };

    return (
        <AssetsContext.Provider value={{ 
            assets: customAssets, 
            isLoadingAssets: false, 
            refreshAssets: () => {},
            killers,
            survivors,
            perks,
            addAsset,
            removeAsset,
            importAssets,
            findChar,
            findPerk
        }}>
            {children}
        </AssetsContext.Provider>
    );
};

export const useAssets = () => useContext(AssetsContext);