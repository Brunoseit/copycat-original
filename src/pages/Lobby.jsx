import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, Wifi, RefreshCw } from 'lucide-react';
import { useSocket } from '@/lib/SocketContext';

export default function Lobby() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const { socket, joinRoom } = useSocket();

  // Pedir lista de salas al cargar
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('get-rooms');
    socket.on('room-list', (rooms) => setAvailableRooms(rooms));
    
    return () => socket.off('room-list');
  }, [socket]);

  const handleConnect = (name) => {
    if (!name.trim()) return;
    joinRoom(name);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Centro: Lista de Challenges */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold border-b border-zinc-800 pb-4">Desafíos DBD</h1>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center cursor-pointer hover:border-red-900 transition-all"
            onClick={() => navigate('/game')}
          >
            <div>
              <h2 className="text-xl font-bold text-red-500">Copycat</h2>
              <p className="text-zinc-400 text-sm">Sincronización en tiempo real por sala.</p>
            </div>
            <Play className="w-8 h-8 text-zinc-600" />
          </motion.div>
        </div>

        {/* Lateral: Salas activas y creación */}
        <div className="space-y-6">
          {/* Crear sala */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-400">
              <Users className="w-5 h-5" /> Crear nueva sala
            </h3>
            <input 
              type="text" 
              placeholder="Nombre de sala..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button 
              onClick={() => handleConnect(roomName)}
              className="w-full flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800/50 py-2 rounded-lg text-sm transition-all"
            >
              <Wifi className="w-4 h-4" /> Crear / Unirse
            </button>
          </div>

          {/* Lista de salas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-300">Salas activas</h3>
              <button onClick={() => socket.emit('get-rooms')}><RefreshCw className="w-4 h-4 text-zinc-500 hover:text-white" /></button>
            </div>
            {availableRooms.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-2">No hay salas activas</p>
            ) : (
              availableRooms.map(room => (
                <button 
                  key={room} 
                  onClick={() => handleConnect(room)}
                  className="w-full text-left bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-sm transition-colors"
                >
                  {room}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}