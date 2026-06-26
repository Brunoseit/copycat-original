import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, Wifi, ChevronRight } from 'lucide-react';

export default function Lobby() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');

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
              <p className="text-zinc-400 text-sm">El reto de supervivencia y killer rotativo.</p>
            </div>
            <Play className="w-8 h-8 text-zinc-600" />
          </motion.div>
        </div>

        {/* Lateral: Sala grupal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-blue-400">
            <Users className="w-5 h-5" /> Sala Grupal
          </h3>
          <input 
            type="text" 
            placeholder="Nombre de sala..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button className="w-full flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800/50 py-2 rounded-lg text-sm transition-all">
            <Wifi className="w-4 h-4" /> Conectar al lobby
          </button>
        </div>
      </div>
    </div>
  );
}