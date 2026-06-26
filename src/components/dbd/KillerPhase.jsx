import { motion } from 'framer-motion';
import { ArrowRight, Skull } from 'lucide-react';
import KillerMatchCard from './KillerMatchCard';
import { useAssets } from '@/lib/AssetsContext';
import { getPlayerName, KILLER_WIN_KILLS } from '../../data/dbdData';

export default function KillerPhase({ state, onUpdateAssignment, onSaveFaced, onWin, onLose, onCompleteCycle, onUploadKillerImage, onUploadSurvivorImage, onReassign }) {
  const { findChar, killers } = useAssets();
  const assignments = state.killer_assignments || [];
  const matches = state.killer_matches || [];
  const killerImages = state.killer_match_images || [];       // survivors faced (uploadable)
  const survivorImages = state.prev_survivor_images || [];   // killer screenshots from survi round (read-only, per card)

  const killsNeeded = KILLER_WIN_KILLS[state.difficulty] || 3;
  const facedCount = state.num_players;

  const poolIds = [...new Set((state.killer_pool || []).map(p => p.characterId).filter(Boolean))];
  const poolKillerOptions = poolIds.map(findChar).filter(Boolean);
  const options = poolKillerOptions.length > 0 ? poolKillerOptions : killers;

  const allDecided = matches.length > 0 && matches.every(m => m?.result);
  const allWon = allDecided && matches.every(m => m?.result === 'win');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          <span className="text-red-500">Ronda de Killers</span> · Ciclo {state.cycle}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Cada jugador juega su partida de Killer. Si <span className="text-red-400 font-semibold">uno pierde, se reinicia todo</span>.
        </p>
      </motion.div>

      {/* Killer match cards - each with its own survivor round screenshot */}
      <div className="space-y-4">
        {assignments.map((assignment, idx) => {
          const playerIdx = assignment?.playerIndex ?? idx;
          return (
            <KillerMatchCard
              key={idx}
              index={idx}
              killsNeeded={killsNeeded}
              facedCount={facedCount}
              poolKillerOptions={options}
              allPlayerNames={state.player_names?.map((n, i) => n || getPlayerName([], i))}
              assignedPlayerIndex={playerIdx}
              assignment={assignment}
              match={matches[idx]}
              killerImageUrl={survivorImages[playerIdx] || ''}
              survivorImageUrl={killerImages[idx] || ''}
              onUploadKillerImage={onUploadKillerImage}
              onUploadSurvivorImage={onUploadSurvivorImage}
              onUpdateAssignment={onUpdateAssignment}
              onSaveFaced={onSaveFaced}
              onWin={onWin}
              onLose={onLose}
              onReassign={onReassign}
            />
          );
        })}
      </div>

      {/* Complete cycle */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onCompleteCycle}
          disabled={!allWon}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200
            ${allWon
              ? 'bg-green-800/80 hover:bg-green-700/80 text-green-100 border border-green-700/50 shadow-lg shadow-green-900/20'
              : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-700/30'}`}
        >
          <Skull className="w-4 h-4" />
          ¡Todos ganaron! Continuar ciclo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}