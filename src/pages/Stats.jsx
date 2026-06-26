// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Flame, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/dbd/ConfirmDialog';

export default function Stats() {
  const [matches, setMatches] = useState([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dbd_match_history');
    if (saved) setMatches(JSON.parse(saved));
  }, []);

  const handleResetStats = () => {
    localStorage.removeItem('dbd_match_history');
    setMatches([]);
    setConfirmReset(false);
  };

  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result === 'win').length;
  const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/60 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" /> Estadísticas Locales
          </h1>
          <div className="flex items-center gap-2">
            {totalMatches > 0 && (
              <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-950/50 border border-red-800/40 text-red-400 hover:bg-red-900/50">
                <Trash2 className="w-3.5 h-3.5" /> Resetear
              </button>
            )}
            <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {totalMatches === 0 ? (
          <div className="text-center text-zinc-500 py-20">Aún no hay partidas registradas en el historial local.</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-400 tabular-nums">{winRate}%</div>
              <div className="text-xs text-zinc-500 mt-1">Porcentaje de Victorias</div>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-green-400 tabular-nums">{wins}</div>
              <div className="text-xs text-zinc-500 mt-1">Partidas Ganadas</div>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-zinc-300 tabular-nums">{totalMatches}</div>
              <div className="text-xs text-zinc-500 mt-1">Total Jugadas</div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="¿Resetear el historial?"
        description="Se borrarán los registros gráficos de victorias locales."
        confirmText="Sí, borrar todo"
        onConfirm={handleResetStats}
        destructive
      />
    </div>
  );
}