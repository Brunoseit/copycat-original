import { motion } from 'framer-motion';
import { ArrowRight, Skull } from 'lucide-react';
import KillerMatchCard from './KillerMatchCard';
import { useAssets } from '@/lib/AssetsContext';
import { getPlayerName, KILLER_WIN_KILLS } from '../../data/dbdData';

export default function KillerPhase({ state, onUpdateAssignment, onSaveFaced, onWin, onLose, onCompleteCycle, onUploadKillerImage, onUploadSurvivorImage, onReassign }) {
  const { findChar, killers } = useAssets();
  
  // ¡CORRECCIÓN 1! Leer directamente de donde guardamos todo en useGameState
  const assignments = state.killer_assignments || [];
  
  // ¡CORRECCIÓN 2! Buscar las fotos en el lugar correcto de la Ronda 1
  const survivorImages = state.survivor_match_images || []; 

  const killsNeeded = KILLER_WIN_KILLS[state.difficulty] || 3;
  const facedCount = state.num_players;

  const poolIds = [...new Set((state.killer_pool || []).map(p => p.characterId).filter(Boolean))];
  const poolKillerOptions = poolIds.map(findChar).filter(Boolean);
  const options = poolKillerOptions.length > 0 ? poolKillerOptions : killers;

  // ¡CORRECCIÓN 3! Verificar las victorias directamente desde los assignments
  const allDecided = assignments.length > 0 && assignments.every(m => m?.result);
  const allWon = allDecided && assignments.every(m => m?.result === 'win');

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
              match={assignment} // Unificamos match y assignment para evitar bugs
              
              // ¡CORRECCIÓN 4! Asegurar que la foto pase sí o sí a la tarjeta
              killerImageUrl={survivorImages[playerIdx] || assignment.image || ''} 
              survivorImageUrl={assignment.survivorImage || ''} 
              
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