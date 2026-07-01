import { Skull, Trophy } from 'lucide-react';

export default function GauntletActive({ state, onWin, onLose, onReset }) {
  // Cálculo de los slots de perks permitidos según la regla del Checkpoint System
  const allowedPerks = Math.max(0, 4 - Math.floor(state.gauntlet_wins / 10));
  const nextCheckpoint = (Math.floor(state.gauntlet_wins / 10) + 1) * 10;

  if (!state.gauntlet_current) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
        <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
        <h1 className="text-5xl font-black text-center">¡GAUNTLET COMPLETADO!</h1>
        <p className="text-xl text-zinc-400 mt-4">Escapaste con los {state.gauntlet_roster.length} supervivientes.</p>
        <button onClick={onReset} className="mt-8 bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-lg font-bold">Volver al Lobby</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div className="text-lg">
          <span className="text-zinc-400">Racha: </span>
          <span className="font-black text-3xl text-orange-500">{state.gauntlet_wins}</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Próximo Checkpoint en: {nextCheckpoint} wins</p>
          <p className="text-xs text-zinc-500 mt-1">Faltan {state.gauntlet_remaining.length} en la fila</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-2xl w-full max-w-2xl text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 to-yellow-500" />
        
        <h2 className="text-xl text-zinc-400 font-bold tracking-widest uppercase mb-2">Turno Actual</h2>
        <h1 className="text-6xl font-black text-white mb-8">{state.gauntlet_current}</h1>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold text-zinc-300 mb-2">Restricción de Perks</h3>
          <div className="flex justify-center gap-4 mt-4">
            {[1, 2, 3, 4].map(slot => (
              <div 
                key={slot} 
                className={`w-16 h-16 transform rotate-45 border-2 flex items-center justify-center
                  ${slot <= allowedPerks ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/50 opacity-30'}
                `}
              >
                {slot > allowedPerks && <div className="w-1 h-full bg-red-600/50 absolute -rotate-45" />}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            {allowedPerks > 0 
              ? `Tienes derecho a usar ${allowedPerks} Perk(s). Al menos uno debe ser ÚNICO de este superviviente.`
              : `¡NO PERK RUN! Has superado las 40 victorias. Juegas sin nada.`}
          </p>
        </div>

        <div className="flex gap-4">
          <button onClick={onLose} className="flex-1 bg-red-900/30 border border-red-900 hover:bg-red-900/60 text-red-500 py-4 rounded-xl font-black text-xl transition-all flex justify-center items-center gap-2">
            <Skull className="w-6 h-6" /> Morí
          </button>
          <button onClick={onWin} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black text-xl transition-all">
            ¡Escapé!
          </button>
        </div>
      </div>
      
      <button onClick={onReset} className="mt-12 text-sm text-zinc-600 hover:text-zinc-400 underline">Abandonar Reto</button>
    </div>
  );
}