import React, { createContext, useContext, useState } from 'react';

// Creamos un contexto vacío
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // Simulamos que ya existe un usuario logueado y desactivamos la pantalla de carga
    const [user, setUser] = useState({ id: 'local-user', username: 'Jugador' });
    const [isLoading, setIsLoading] = useState(false);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {/* Como isLoading es false, esto dejará pasar el contenido visual de inmediato */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);