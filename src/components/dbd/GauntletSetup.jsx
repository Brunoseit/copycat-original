import { useState } from 'react';
import { survivors as dbdSurvivors } from '../../data/dbdData'; // Asumiendo que tienes una lista de supervivientes en tu data

export default function GauntletSetup({ onConfigure, onCancel }) {
  // Por defecto marcamos todos
  const [selectedRoster, setSelectedRoster] = useState(dbdSurvivors.map(s => s.name));
  const [isSWF, setIsSWF] = useState(false);
  const [penalty, setPenalty] = useState('reset');

  const toggleSurvivor = (name) => {
    setSelectedRoster(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleStart = () => {
    if (selectedRoster.length < 2) return alert('Debes seleccionar al menos 2 supervivientes.');
    onConfigure(selectedRoster, isSWF, penalty);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-orange-500 mb-6">Configurar Gauntlet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="font-bold mb-4">Ajustes de Partida</h3>
          <label className="flex items-center gap-3 mb-3 cursor-pointer">
            <input type="checkbox" checked={isSWF} onChange={(e) => setIsSWF(e.target.checked)} className="w-5 h-5 accent-orange-500" />
            <span>Jugar con SWF (Amigos)</span>
          </label>
          
          <h3 className="font-bold mt-6 mb-2">Penalización por Muerte</h3>
          <select value={penalty} onChange={(e) => setPenalty(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white">
            <option value="reset">Hard Reset (Racha a 0 y mezclar roster)</option>
            <option value="queue">Checkpoint (Volver al último múltiplo de 10 y mandar al fondo de la fila)</option>
          </select>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Tu Roster ({selectedRoster.length})</h3>
            <button onClick={() => setSelectedRoster([])} className="text-sm text-zinc-400 hover:text-white">Desmarcar Todos</button>
          </div>
          <div className="overflow-y-auto space-y-2 pr-2">
            {dbdSurvivors.map(surv => (
              <label key={surv.name} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedRoster.includes(surv.name)} 
                  onChange={() => toggleSurvivor(surv.name)}
                  className="accent-orange-500"
                />
                <span>{surv.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-bold transition-colors">Volver</button>
        <button onClick={handleStart} className="flex-1 bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-bold transition-colors">Iniciar Gauntlet</button>
      </div>
    </div>
  );
}