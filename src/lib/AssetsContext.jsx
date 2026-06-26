// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';

const AssetsContext = createContext(null);

export const AssetsProvider = ({ children }) => {
    // La base de datos ahora guarda un array de objetos completos
    const [customAssets, setCustomAssets] = useState(() => {
        const saved = localStorage.getItem('local_dbd_assets');
        return saved ? JSON.parse(saved) : [
            { id: 'k1', type: 'character', role: 'killer', name: 'The Trapper', imageUrl: '' },
            { id: 's1', type: 'character', role: 'survivor', name: 'Dwight Fairfield', imageUrl: '' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('local_dbd_assets', JSON.stringify(customAssets));
    }, [customAssets]);

    const addAsset = (assetData) => {
        if (!assetData.name.trim()) return;
        const newAsset = { ...assetData, id: Date.now().toString() };
        setCustomAssets(prev => [...prev, newAsset]);
    };

    const removeAsset = (id) => {
        setCustomAssets(prev => prev.filter(a => a.id !== id));
    };

    // Separamos las listas para que los desplegables del juego las encuentren
    const killers = customAssets.filter(a => a.type === 'character' && a.role === 'killer');
    const survivors = customAssets.filter(a => a.type === 'character' && a.role === 'survivor');
    const perks = customAssets.filter(a => a.type === 'perk');

    // Funciones de búsqueda para que el juego pueda cargar las imágenes al seleccionar
    const findChar = (id) => customAssets.find(a => a.id === id) || { name: 'Desconocido', imageUrl: '' };
    const findPerk = (id) => customAssets.find(a => a.id === id) || { name: 'Perk Desconocida', imageUrl: '' };

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
            findChar,
            findPerk
        }}>
            {children}
        </AssetsContext.Provider>
    );
};

export const useAssets = () => useContext(AssetsContext);