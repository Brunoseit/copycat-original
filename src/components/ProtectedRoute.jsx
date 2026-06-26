import React from 'react';

export default function ProtectedRoute({ children }) {
    // Apagamos la seguridad y dejamos pasar todo directamente
    return <>{children}</>;
}