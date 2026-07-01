import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, RefreshCw, Lock, Unlock, AlertTriangle, Trash2, PlusCircle, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocket } from '@/lib/SocketContext';

export default function Lobby() {
  const navigate = useNavigate();
  const { socket, createRoom, joinRoom, requestDeleteRoom } = useSocket();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario de creación
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Formulario de unirse
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [joinPass, setJoinPass] = useState('');

  // Expandir fila del Top 5
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (!socket) return;
    
    // Pedir listas iniciales
    socket.emit('get-rooms');
    socket.emit('get-leaderboard');
    
    // Escuchar actualizaciones
    socket.on('room-list', (rooms) => setAvailableRooms(rooms));
    socket.on('leaderboard-update', (lb) => setLeaderboard(lb));
    
    return () => {
      socket.off('room-list');
      socket.off('leaderboard-update');
    };
  }, [socket]);

  const handleCreate = async () => {
    setErrorMsg('');
    if (!newRoomName.trim()) return setErrorMsg('El nombre de la sala es obligatorio.');
    
    const res = await createRoom(newRoomName, newRoomPass, maxPlayers);
    if (res.success) {
      navigate('/game');
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

  // Función para asignar colores a las medallas del Top 3
  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-400'; // Oro
    if (index === 1) return 'text-zinc-300';   // Plata
    if (index === 2) return 'text-amber-600';  // Bronce
    return 'text-zinc-500';                    // Resto
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL 1: Crear Sala */}
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
                placeholder="Ej: Sala de Bruno..."
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

        {/* PANEL 2: Lista de Salas */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col min-h-[600px] shadow-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
              <Users className="w-6 h-6" /> Salas Activas
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
                <p className="text-lg">No hay salas activas.</p>
              </div>
            ) : (
              availableRooms.map((room) => (
                <div key={room.name} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-4 flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {room.hasPassword ? <Lock className="w-5 h-5 text-red-400" /> : <Unlock className="w-5 h-5 text-green-400" />}
                      <span className="font-bold text-lg text-white truncate max-w-[120px]" title={room.name}>{room.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {room.currentPlayers === 0 && (
                        <button onClick={() => handleDelete(room.name)} className="bg-red-900/30 hover:bg-red-900/60 text-red-400 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      {selectedRoom !== room.name && (
                        <button 
                          onClick={() => handleJoin(room)}
                          disabled={room.currentPlayers >= room.maxPlayers}
                          className="bg-zinc-800 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                        >
                          {room.currentPlayers >= room.maxPlayers ? 'Llena' : 'Entrar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedRoom === room.name && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
                      <input 
                        type="password"
                        placeholder="Contraseña..."
                        value={joinPass}
                        onChange={(e) => setJoinPass(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 outline-none focus:border-blue-500 text-sm"
                      />
                      <button onClick={() => handleJoin(room)} className="bg-blue-600 hover:bg-blue-500 font-bold px-3 py-1 rounded-lg text-sm">
                        Ir
                      </button>
                      <button onClick={() => setSelectedRoom(null)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg text-sm text-zinc-400">
                        X
                      </button>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL 3: TOP 5 LEADERBOARD */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col min-h-[600px] shadow-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
              <Trophy className="w-6 h-6" /> Top 5 Récords
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {leaderboard.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <Trophy className="w-16 h-16 opacity-20" />
                <p className="text-center text-lg">Aún no hay récords.<br/><span className="text-sm">¡Juega para ser el primero!</span></p>
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-4 flex flex-col">
                  {/* Fila principal clickeable */}
                  <div 
                    className="flex justify-between items-center cursor-pointer select-none" 
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-xl w-6 ${getRankColor(idx)}`}>#{idx + 1}</span>
                      <span className="font-bold text-white truncate max-w-[120px]" title={entry.teamName}>
                        {entry.teamName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full font-black tracking-wider">
                        {entry.score}
                      </span>
                      {expandedRow === idx ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                    </div>
                  </div>

                  {/* Fila expandida con detalles */}
                  <AnimatePresence>
                    {expandedRow === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-zinc-800/50 text-sm text-zinc-400 space-y-3 overflow-hidden"
                      >
                        <div className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg">
                          <span>Dificultad: <span className="text-white capitalize font-medium">{entry.difficulty}</span></span>
                          <span>Jugadores: <span className="text-white font-medium">{entry.numPlayers}</span></span>
                        </div>
                        <div>
                          <span className="block mb-2 text-xs uppercase tracking-wider font-bold">Equipo:</span>
                          <div className="flex flex-wrap gap-2">
                            {entry.playerNames.map((p, i) => (
                              <span key={i} className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md text-xs text-white shadow-sm">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}