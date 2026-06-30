import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuraciones para leer rutas de archivos en Node (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// --- ¡NUEVO! Servir el Frontend empaquetado ---
// Le decimos a Express que la carpeta 'dist' tiene los archivos públicos (tu app de React)
app.use(express.static(path.join(__dirname, 'dist')));

let roomData = {}; 

const getPublicRooms = () => {
    const publicRooms = [];
    for (const [name, data] of Object.entries(roomData)) {
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

const reassignCreator = (roomName, oldCreatorId) => {
    const targetRoom = roomData[roomName];
    if (targetRoom && targetRoom.creator === oldCreatorId) {
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
        if (socketsInRoom && socketsInRoom.size > 0) {
            const newCreator = Array.from(socketsInRoom)[0];
            targetRoom.creator = newCreator;
            io.to(newCreator).emit('room-info', { mode: targetRoom.mode, isCreator: true });
        }
    }
};

io.on('connection', (socket) => {
    socket.on('get-rooms', () => {
        socket.emit('room-list', getPublicRooms());
    });

    socket.on('create-room', (payload, callback) => {
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
        const cb = callback || function() {};
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

        if (!io.sockets.adapter.rooms.get(room)?.has(targetRoom.creator)) {
            targetRoom.creator = socket.id;
        }

        cb({ success: true, isCreator: targetRoom.creator === socket.id });
        io.emit('room-list', getPublicRooms()); 
    });

    socket.on('request-sync', (room, callback) => {
        const targetRoom = roomData[room];
        if (targetRoom && callback) {
            callback({
                mode: targetRoom.mode,
                isCreator: targetRoom.creator === socket.id,
                gameState: targetRoom.gameState
            });
        }
    });

    socket.on('delete-room', (room, callback) => {
        const cb = callback || function() {};
        const targetRoom = roomData[room];
        
        if (targetRoom) {
            const currentPlayers = io.sockets.adapter.rooms.get(room)?.size || 0;
            if (currentPlayers === 0 || targetRoom.creator === socket.id) {
                io.in(room).socketsLeave(room); 
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
        reassignCreator(room, socket.id);
        io.emit('room-list', getPublicRooms());
    });

    socket.on('disconnect', () => {
        for (const [roomName, data] of Object.entries(roomData)) {
            if (data.creator === socket.id) {
                reassignCreator(roomName, socket.id);
            }
        }
        setTimeout(() => { io.emit('room-list', getPublicRooms()); }, 500);
    });
});

// --- ¡NUEVO! Forzar a que cualquier ruta que no sea de sockets cargue React ---
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Ruta para SPA: Todo lo que no sea un archivo estático o una API 
// debe devolver el index.html para que React Router lo maneje.
app.get('*', (req, res, next) => {
    // Si la ruta contiene 'socket.io', dejamos que el servidor de sockets la maneje
    if (req.url.includes('socket.io')) return next();
    
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Levantar el servidor
httpServer.listen(3000, () => console.log('Servidor Unificado listo en el puerto 3000'));