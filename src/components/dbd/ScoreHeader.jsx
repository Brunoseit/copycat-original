import { motion } from 'framer-motion';
import { Flame, Trophy, Skull, BarChart3, Settings, RotateCcw, Wrench, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DIFFICULTY_LABELS } from '../../data/dbdData';

export default function ScoreHeader({ state, winCondition, onDefeat, onReset, onShowRules }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/60 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.div key={state.streak} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <Flame className={`w-6 h-6 ${state.streak > 0 ? 'text-orange-500' : 'text-zinc-600'}`} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Racha</div>
                <div className={`text-xl font-bold tabular-nums ${state.streak > 0 ? 'text-orange-400' : 'text-zinc-400'}`}>{state.streak}</div>
              </div>
            </motion.div>

            <div className="w-px h-8 bg-zinc-800" />

            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Récord</div>
                <div className="text-xl font-bold text-yellow-400 tabular-nums">{state.high_score}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{state.num_players} jugadores</span>
            <span className="text-zinc-700">•</span>
            <span>{DIFFICULTY_LABELS[state.difficulty]}</span>
            <span className="text-zinc-700">•</span>
            <span>Escapan: {winCondition}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onShowRules}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Reglas
            </button>
            <Link to="/stats" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800 transition-all">
              <BarChart3 className="w-3.5 h-3.5" /> Stats
            </Link>
            <Link to="/settings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800 transition-all">
              <Settings className="w-3.5 h-3.5" /> Ajustes
            </Link>
            <button
              onClick={onDefeat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-900/30 border border-red-700/30 text-red-300 hover:bg-red-900/50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Derrota
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-900/30 border border-yellow-700/30 text-yellow-300 hover:bg-yellow-900/50 transition-all"
              >
                <Wrench className="w-3.5 h-3.5" /> Cambiar configuración
              </button>
            )}
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mt-3 flex items-center gap-2">
          {[
            { key: 'survivor', label: 'Supervivientes', icon: Flame },
            { key: 'killer', label: 'Killers', icon: Skull },
          ].map((p) => (
            <div
              key={p.key}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300
                ${state.phase === p.key ? 'bg-red-800/70 text-red-100 ring-1 ring-red-600/40' : 'bg-zinc-800/60 text-zinc-500'}`}
            >
              <p.icon className="w-3.5 h-3.5" /> {p.label}
            </div>
          ))}
          <span className="ml-2 text-xs text-zinc-500">Ciclo #{state.cycle}</span>
        </div>
      </div>
    </div>
  );
}