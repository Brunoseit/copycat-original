import { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Users, Shield, HelpCircle } from 'lucide-react';
import { DIFFICULTY_LABELS, WIN_CONDITIONS, DIFFICULTIES, getPlayerName, KILLER_WIN_KILLS } from '../../data/dbdData';

export default function GameSetup({ onConfigure, onShowRules }) {
  const [numPlayers, setNumPlayers] = useState(3);
  const [difficulty, setDifficulty] = useState('normal');
  const [names, setNames] = useState(['', '', '', '']);

  const winCount = WIN_CONDITIONS[difficulty]?.[numPlayers];
  const killCount = KILLER_WIN_KILLS[difficulty] || numPlayers;

  const setName = (i, v) => {
    const next = [...names];
    next[i] = v;
    setNames(next);
  };

  const handleStart = () => {
    onConfigure(numPlayers, difficulty, names.slice(0, numPlayers).map((n, i) => n.trim() || getPlayerName([], i)));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-950/40 border border-red-800/30 mb-6">
            <Skull className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">DBD <span className="text-red-500">Copycat</span></h1>
          <p className="text-zinc-500 text-sm">Challenge interactivo para tu grupo</p>
          <button
            onClick={onShowRules}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo se juega?
          </button>
        </div>

        <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3"><Users className="w-3.5 h-3.5" /> Jugadores</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => setNumPlayers(n)}
                  className={`py-3 rounded-xl text-lg font-bold transition-all duration-200
                    ${numPlayers === n ? 'bg-red-800/60 border-2 border-red-600/50 text-red-200' : 'bg-zinc-800/60 border-2 border-zinc-700/40 text-zinc-400 hover:border-zinc-600/50'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombres</label>
            {Array.from({ length: numPlayers }).map((_, i) => (
              <input
                key={i}
                value={names[i]}
                onChange={(e) => setName(i, e.target.value)}
                placeholder={`Jugador ${i + 1}`}
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-red-800/50"
              />
            ))}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3"><Shield className="w-3.5 h-3.5" /> Dificultad</label>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${difficulty === d ? 'bg-red-800/60 border-2 border-red-600/50 text-red-200' : 'bg-zinc-800/60 border-2 border-zinc-700/40 text-zinc-400 hover:border-zinc-600/50'}`}>
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-lg px-4 py-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 text-center">Condición de Victoria</p>
            <p className="text-zinc-200 text-xs">
              <span className="text-blue-400 font-semibold">Supervivientes:</span> <span className="text-red-400 font-bold">{winCount}</span> deben escapar
            </p>
            <p className="text-zinc-200 text-xs mt-1">
              <span className="text-red-400 font-semibold">Killer:</span> <span className="text-red-400 font-bold">{killCount}</span> deben ser asesinados
            </p>
          </div>

          <button onClick={handleStart}
            className="w-full py-3.5 rounded-xl bg-red-800 hover:bg-red-700 text-red-100 font-bold text-sm border border-red-700/50 shadow-lg shadow-red-900/30 transition-all duration-200 active:scale-[0.98]">
            Comenzar Challenge
          </button>
        </div>
      </div>
    </motion.div>
  );
}