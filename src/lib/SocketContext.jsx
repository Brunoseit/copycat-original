import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    // Inicializamos el socket dentro de useMemo para evitar recreaciones innecesarias
    const socket = useMemo(() => io('http://localhost:3000'), []);
    
    const [room, setRoom] = useState(localStorage.getItem('dbd_room_name') || null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        
        // Si hay una sala guardada, reconectamos
        if (room) {
            socket.emit('join-room', room);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket, room]); 

    const joinRoom = (newRoom) => {
        if (room) socket.emit('leave-room', room);
        setRoom(newRoom);
        localStorage.setItem('dbd_room_name', newRoom);
        socket.emit('join-room', newRoom);
    };

    const leaveRoom = () => {
        if (room) socket.emit('leave-room', room);
        setRoom(null);
        localStorage.removeItem('dbd_room_name');
    };

    return (
        <SocketContext.Provider value={{ socket, room, joinRoom, leaveRoom, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket debe ser usado dentro de un SocketProvider");
    }
    return context;
};