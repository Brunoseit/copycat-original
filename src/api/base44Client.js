// Simulamos un cliente API que siempre responde "OK"
const mockClient = {
    get: async () => ({ data: [] }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
    patch: async () => ({ data: {} }),
    delete: async () => ({ data: {} }),
};

// Exportamos el mock con todos los nombres posibles que el código original pueda buscar
export const base44 = mockClient;
export const base44Client = mockClient;
export default mockClient;