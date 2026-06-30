import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(), []);
    
    const [room, setRoom] = useState(null);
    const [roomPass, setRoomPass] = useState(''); // Memoria para auto-reconexiones
    const [isCreator, setIsCreator] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
            // Si nos reconectamos automáticamente tras una caída, usamos la contraseña guardada
            if (room) {
                socket.emit('join-room', { room: room, password: roomPass });
            }
        };
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket, room, roomPass]); 

    const createRoom = (roomName, password = '', maxPlayers = 4) => {
        return new Promise((resolve) => {
            socket.emit('create-room', { room: roomName, password, maxPlayers }, (response) => {
                const res = response || { success: false, message: 'Error de red' };
                if (res.success) {
                    setRoom(roomName);
                    setRoomPass(password); // Guardamos la contraseña
                    setIsCreator(true);
                }
                resolve(res);
            });
        });
    };

    const joinRoom = (roomName, password = '') => {
        return new Promise((resolve) => {
            socket.emit('join-room', { room: roomName, password }, (response) => {
                const res = response || { success: false, message: 'Error de red' };
                if (res.success) {
                    setRoom(roomName);
                    setRoomPass(password); // Guardamos la contraseña
                    setIsCreator(res.isCreator);
                }
                resolve(res);
            });
        });
    };

    const leaveRoom = () => {
        if (room) socket.emit('leave-room', room);
        setRoom(null);
        setRoomPass('');
        setIsCreator(false);
    };

    const requestDeleteRoom = (roomNameToDelete) => {
        return new Promise((resolve) => {
            socket.emit('delete-room', roomNameToDelete, (response) => {
                resolve(response || { success: false });
            });
        });
    };

    return (
        <SocketContext.Provider value={{ 
            socket, room, isCreator, isConnected, 
            createRoom, joinRoom, leaveRoom, requestDeleteRoom 
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket debe ser usado dentro de un SocketProvider");
    return context;
};