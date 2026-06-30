import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Usamos let para permitir limpieza si fuera necesario
let roomData = {}; 

const getPublicRooms = () => {
    const publicRooms = [];
    for (const [name, data] of Object.entries(roomData)) {
        // Protección: Si la sala está corrupta, la ignoramos
        if (!name || !data) continue; 
        
        const currentPlayers = io.sockets.adapter.rooms.get(name)?.size || 0;
        publicRooms.push({
            name: name,
            hasPassword: !!data.password,
            maxPlayers: data.maxPlayers || 4,
            currentPlayers: currentPlayers,
            mode: data.mode || null
        });
    }
    return publicRooms;
};

io.on('connection', (socket) => {
    
    socket.on('get-rooms', () => {
        socket.emit('room-list', getPublicRooms());
    });

    socket.on('create-room', (payload, callback) => {
        // Si por algún motivo no hay callback, cancelamos para no romper el server
        if (!callback) return; 
        
        const room = payload?.room;
        const password = payload?.password || '';
        const maxPlayers = parseInt(payload?.maxPlayers) || 4;

        if (!room) return callback({ success: false, message: 'Nombre de sala inválido.' });
        if (roomData[room]) return callback({ success: false, message: 'El nombre de la sala ya está en uso.' });
        
        roomData[room] = {
            creator: socket.id,
            password: password,
            maxPlayers: maxPlayers,
            mode: null,
            gameState: null
        };

        socket.rooms.forEach((r) => { if (r !== socket.id) socket.leave(r); });
        socket.join(room);
        
        io.emit('room-list', getPublicRooms()); 
        callback({ success: true, isCreator: true });
    });

    socket.on('join-room', (payload, callback) => {
        // Creamos un callback vacío por si es una reconexión automática sin callback
        const cb = callback || function() {};
        
        // Soportar el formato antiguo (string) y el nuevo (objeto)
        const room = typeof payload === 'string' ? payload : payload?.room;
        const password = typeof payload === 'string' ? '' : payload?.password;

        if (!room) return cb({ success: false, message: 'Nombre de sala inválido.' });

        const targetRoom = roomData[room];
        if (!targetRoom) return cb({ success: false, message: 'La sala ya no existe o fue borrada.' });
        
        if (targetRoom.password && targetRoom.password !== password) {
            return cb({ success: false, message: 'Contraseña incorrecta.' });
        }

        const currentPlayers = io.sockets.adapter.rooms.get(room)?.size || 0;
        if (currentPlayers >= targetRoom.maxPlayers) {
            return cb({ success: false, message: 'La sala está llena.' });
        }

        socket.rooms.forEach((r) => { if (r !== socket.id) socket.leave(r); });
        socket.join(room);

        socket.emit('room-info', { mode: targetRoom.mode, isCreator: targetRoom.creator === socket.id });
        if (targetRoom.gameState) {
            socket.emit('update-state', { room, gameState: targetRoom.gameState });
        }
        
        io.emit('room-list', getPublicRooms()); 
        cb({ success: true, isCreator: targetRoom.creator === socket.id });
    });

    socket.on('delete-room', (room, callback) => {
        const cb = callback || function() {};
        const targetRoom = roomData[room];
        
        if (targetRoom) {
            const currentPlayers = io.sockets.adapter.rooms.get(room)?.size || 0;
            // Solo borra si la sala está vacía O si el que hace clic es el creador original
            if (currentPlayers === 0 || targetRoom.creator === socket.id) {
                io.in(room).socketsLeave(room); // Expulsa a todos si había alguien
                delete roomData[room];
                io.emit('room-list', getPublicRooms());
                cb({ success: true });
            } else {
                cb({ success: false, message: 'No se puede borrar: hay jugadores dentro y no eres el creador.' });
            }
        } else {
            cb({ success: false, message: 'La sala no existe.' });
        }
    });

    socket.on('set-mode', ({ room, mode }) => {
        if (roomData[room] && roomData[room].creator === socket.id) {
            roomData[room].mode = mode;
            io.to(room).emit('room-info', { mode, isCreator: false }); 
            io.emit('room-list', getPublicRooms());
        }
    });

    socket.on('game-update', (data) => {
        const { room, gameState } = data;
        if (roomData[room]) {
            roomData[room].gameState = gameState;
            io.to(room).emit('update-state', { room, gameState });
        }
    });

    socket.on('leave-room', (room) => {
        socket.leave(room);
        io.emit('room-list', getPublicRooms());
    });

    socket.on('disconnect', () => {
        setTimeout(() => { io.emit('room-list', getPublicRooms()); }, 500);
    });
});

httpServer.listen(3000, () => console.log('Servidor blindado listo en el puerto 3000'));