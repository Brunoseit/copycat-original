import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Wifi, RefreshCw, Lock, Unlock, AlertTriangle, Trash2, PlusCircle } from 'lucide-react';
import { useSocket } from '@/lib/SocketContext';

export default function Lobby() {
  const navigate = useNavigate();
  const { socket, createRoom, joinRoom, requestDeleteRoom } = useSocket();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario de creación
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Formulario de unirse
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinPass, setJoinPass] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.emit('get-rooms');
    socket.on('room-list', (rooms) => setAvailableRooms(rooms));
    return () => socket.off('room-list');
  }, [socket]);

  const handleCreate = async () => {
    setErrorMsg('');
    if (!newRoomName.trim()) return setErrorMsg('El nombre de la sala es obligatorio.');
    
    const res = await createRoom(newRoomName, newRoomPass, maxPlayers);
    if (res.success) {
      navigate('/game'); // Entra DE INMEDIATO
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleJoin = async (roomData) => {
    setErrorMsg('');
    if (roomData.hasPassword && selectedRoom !== roomData.name) {
      setSelectedRoom(roomData.name);
      setJoinPass('');
      return;
    }
    const res = await joinRoom(roomData.name, joinPass);
    if (res.success) {
      navigate('/game');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDelete = async (roomName) => {
    const res = await requestDeleteRoom(roomName);
    if (!res.success) setErrorMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: Crear Sala */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-5 shadow-xl">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-400 border-b border-zinc-800 pb-4">
            <PlusCircle className="w-6 h-6" /> Crear Sala
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase font-bold">Nombre de la sala *</label>
              <input 
                type="text" 
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Ej: Sala de dbd"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 mt-1 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-bold">Contraseña</label>
                <input 
                  type="password" 
                  placeholder="Opcional"
                  value={newRoomPass}
                  onChange={(e) => setNewRoomPass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 mt-1 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase font-bold">Jugadores</label>
                <input 
                  type="number" 
                  min="2" max="10"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 mt-1 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              onClick={handleCreate}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-2 transition-all flex items-center justify-center gap-2"
            >
              <Wifi className="w-5 h-5" /> Crear y Entrar
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: Lista de Salas (Más grande) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col min-h-[600px] shadow-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
              <Users className="w-6 h-6" /> Salas Disponibles
            </h2>
            <button onClick={() => socket.emit('get-rooms')} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
              <RefreshCw className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
          
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5" /> {errorMsg}
            </motion.div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {availableRooms.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <Users className="w-16 h-16 opacity-20" />
                <p className="text-lg">No hay salas activas. ¡Crea la primera!</p>
              </div>
            ) : (
              availableRooms.map((room) => (
                <div key={room.name} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-4 flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {room.hasPassword ? <Lock className="w-5 h-5 text-red-400" /> : <Unlock className="w-5 h-5 text-green-400" />}
                      <span className="font-bold text-xl text-white">{room.name}</span>
                      <span className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full text-zinc-300 font-medium tracking-wide">
                        {room.currentPlayers} / {room.maxPlayers} Jug.
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {room.currentPlayers === 0 && (
                        <button 
                          onClick={() => handleDelete(room.name)}
                          className="bg-red-900/30 hover:bg-red-900/60 text-red-400 p-2 rounded-lg transition-colors"
                          title="Borrar sala vacía"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      {selectedRoom !== room.name && (
                        <button 
                          onClick={() => handleJoin(room)}
                          disabled={room.currentPlayers >= room.maxPlayers}
                          className="bg-zinc-800 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:hover:bg-zinc-800"
                        >
                          {room.currentPlayers >= room.maxPlayers ? 'Llena' : 'Entrar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedRoom === room.name && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      className="mt-4 pt-4 border-t border-zinc-800 flex gap-2"
                    >
                      <input 
                        type="password"
                        placeholder="Ingresa la contraseña para unirte..."
                        value={joinPass}
                        onChange={(e) => setJoinPass(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                      />
                      <button 
                        onClick={() => handleJoin(room)}
                        className="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-2 rounded-lg transition-colors"
                      >
                        Confirmar
                      </button>
                      <button 
                        onClick={() => setSelectedRoom(null)}
                        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors font-bold text-zinc-400"
                      >
                        Cancelar
                      </button>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}