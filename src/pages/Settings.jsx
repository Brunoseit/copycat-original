// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Trophy, RefreshCw, Database, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import useGameState from '../hooks/useGameState';
import { useAssets } from '../lib/AssetsContext';
import ConfirmDialog from '../components/dbd/ConfirmDialog';

export default function Settings() {
  const g = useGameState();
  const { state } = g;
  const { assets, addAsset, removeAsset } = useAssets();
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  
  // Estados para el nuevo formulario avanzado
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('character');
  const [newRole, setNewRole] = useState('killer');
  const [newImage, setNewImage] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    addAsset({ name: newName, type: newType, role: newRole, imageUrl: newImage });
    setNewName('');
    setNewImage('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/60 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-red-500" /> Ajustes
          </h1>
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-600" /> Récord y sesión</h2>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-zinc-500">Récord actual</div>
              <div className="text-2xl font-bold text-yellow-400 tabular-nums">{state?.high_score ?? 0}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-red-900/30 border border-red-700/30 text-red-300 hover:bg-red-900/50">
                Resetear récord
              </button>
              <button onClick={() => setConfirmNew(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800">
                Nueva configuración
              </button>
            </div>
          </div>
        </div>

        {/* BASE DE DATOS AVANZADA */}
        <div className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-red-500" /> Gestor de Base de Datos
          </h2>
          
          <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
            <div className="flex gap-3">
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-red-500 outline-none">
                <option value="character">Personaje</option>
                <option value="perk">Perk</option>
              </select>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-red-500 outline-none">
                <option value="killer">Killer</option>
                <option value="survivor">Superviviente</option>
              </select>
            </div>
            <input 
              type="text" placeholder="Nombre..." required value={newName} onChange={(e) => setNewName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-red-500 outline-none"
            />
            <input 
              type="url" placeholder="URL de la imagen (Opcional)..." value={newImage} onChange={(e) => setNewImage(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-red-500 outline-none"
            />
            <button type="submit" className="bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 mt-1">
              <Plus className="w-4 h-4" /> Añadir a la base de datos
            </button>
          </form>

          {/* Lista de elementos guardados */}
          <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 max-h-60 overflow-y-auto bg-zinc-950/50">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  {asset.imageUrl ? (
                    <img src={asset.imageUrl} alt={asset.name} className="w-8 h-8 rounded bg-zinc-800 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-zinc-500"/></div>
                  )}
                  <div>
                    <div className="text-zinc-200 font-medium">{asset.name}</div>
                    <div className="text-xs text-zinc-500 capitalize">{asset.type} • {asset.role}</div>
                  </div>
                </div>
                <button type="button" onClick={() => removeAsset(asset.id)} className="text-zinc-500 hover:text-red-400 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirmReset} onOpenChange={setConfirmReset} title="¿Resetear récord?" confirmText="Resetear" onConfirm={() => { g.resetHighScore(); setConfirmReset(false); }} />
      <ConfirmDialog open={confirmNew} onOpenChange={setConfirmNew} title="¿Nueva configuración?" confirmText="Reiniciar" onConfirm={() => { g.newSession(); setConfirmNew(false); }} />
    </div>
  );
}