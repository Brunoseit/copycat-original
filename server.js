import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

let gameState = {
    configured: false,
    num_players: 3,
    phase: 'survivor',
    survivor_matches: [{}, {}, {}],
};

io.on('connection', (socket) => {
  console.log('Jugador conectado: ' + socket.id);
  socket.emit('game-update', gameState);

  socket.on('game-update', (data) => {
    gameState = data;
    io.emit('game-update', gameState);
  });
});

httpServer.listen(3000, () => console.log('Servidor multijugador en puerto 3000'));