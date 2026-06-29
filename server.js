import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const roomStates = {}; // Persistencia en memoria

io.on('connection', (socket) => {
    
    // El cliente pide la lista de salas activas
    socket.on('get-rooms', () => {
        socket.emit('room-list', Object.keys(roomStates));
    });

    socket.on('join-room', (room) => {
        socket.rooms.forEach((r) => { if (r !== socket.id) socket.leave(r); });
        socket.join(room);
        
        // Si la sala no existe, la inicializamos vacía
        if (!roomStates[room]) {
            roomStates[room] = { configured: false, players: [] }; 
        }

        // Enviamos el estado guardado al que se une
        socket.emit('update-state', { room, gameState: roomStates[room] });
    });

    socket.on('game-update', (data) => {
        const { room, gameState } = data;
        roomStates[room] = gameState; // Guardamos el estado persistente
        io.to(room).emit('update-state', { room, gameState });
    });

    socket.on('leave-room', (room) => {
        socket.leave(room);
    });
});

httpServer.listen(3000, () => console.log('Servidor con salas persistentes listo'));