import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Shield, ZoomIn } from 'lucide-react';
import SurvivorMatchCard from './SurvivorMatchCard';
import ImageLightbox from './ImageLightbox';
import { useAssets } from '@/lib/AssetsContext';
import { WIN_CONDITIONS } from '../../data/dbdData';

export default function SurvivorPhase({ state, onSaveBuild, onWin, onStartKiller, onUploadImage, onToggleExpand }) {
  const { findChar } = useAssets();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  
  const matches = state.survivor_matches || [];
  const images = state.survivor_match_images || [];
  const expanded = state.survivor_expanded || [];
  const escapes = WIN_CONDITIONS[state.difficulty]?.[state.num_players];

  const poolData = state.survivor_pool || [];
  // Verificamos si hay fotos O supervivientes añadidos manualmente
  const hasPools = poolData.some(p => p?.image || (p?.faced && p.faced.some(f => f?.characterId)));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          <span className="text-red-500">Ronda de Supervivientes</span> · Ciclo {state.cycle}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Juega como equipo de supervivientes. Cada victoria guarda el Killer enfrentado.
          {' '}Deben escapar <span className="text-red-400 font-semibold">{escapes}</span> de {state.num_players}.
        </p>
      </motion.div>

      {/* Cuadrícula de la Pool de Supervivientes (Visualiza Fotos y Nombres Manuales) */}
      {hasPools && (
        <div className="mb-8 space-y-3">
          <h3 className="text-xs font-semibold text-blue-400 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Pool de Supervivientes (Ciclo Anterior)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.player_names.map((pName, pi) => {
              const pool = poolData[pi];
              // Ignorar si el jugador no subió foto ni rellenó el manual
              if (!pool || (!pool.image && (!pool.faced || !pool.faced.some(f => f?.characterId)))) return null;

              return (
                <div key={pi} className="bg-blue-950/20 border border-blue-900/40 rounded-xl overflow-hidden flex flex-col shadow-lg shadow-blue-900/5">
                  <div className="px-3 py-2 bg-blue-900/30 border-b border-blue-800/40">
                    <span className="text-sm font-semibold text-blue-200">{pName || `Jugador ${pi + 1}`}</span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-3">
                    
                    {/* Renderizar Imagen si existe */}
                    {pool.image && (
                      <div
                        className="rounded-lg overflow-hidden border border-blue-800/50 cursor-zoom-in group/pi relative"
                        onClick={() => setLightboxSrc(pool.image)}
                      >
                        <img src={pool.image} alt={`Pool de ${pName}`} className="w-full h-24 object-cover transition-transform duration-300 group-hover/pi:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover/pi:bg-transparent transition-colors" />
                        <div className="absolute top-2 left-2 opacity-0 group-hover/pi:opacity-100 transition-opacity pointer-events-none">
                          <span className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
                            <ZoomIn className="w-3 h-3" /> Ver
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Renderizar Selección Manual si existe */}
                    {pool.faced && pool.faced.some(f => f?.characterId) && (
                      <div className="bg-blue-950/50 border border-blue-900/30 rounded-lg p-2">
                        <p className="text-[10px] text-zinc-500 uppercase border-b border-blue-900/40 pb-1 mb-1.5">
                          Selección Manual:
                        </p>
                        <div className="space-y-1">
                          {pool.faced.filter(f => f?.characterId).map((f, i) => (
                            <div key={i} className="text-xs text-blue-300 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                              <span className="truncate">{findChar(f.characterId)?.nombre || 'Desconocido'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((match, idx) => (
          <SurvivorMatchCard
            key={idx}
            index={idx}
            match={match}
            imageUrl={images[idx]}
            expanded={!!expanded[idx]}
            onToggleExpand={onToggleExpand}
            onUploadImage={onUploadImage}
            onSaveBuild={onSaveBuild}
            onWin={onWin}
          />
        ))}
      </div>

      {(() => {
        const allWon = matches.length > 0 && matches.every(m => m?.result === 'win');
        return (
          <div className="mt-8 flex justify-end">
            <button
              onClick={onStartKiller}
              disabled={!allWon}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${allWon
                  ? 'bg-red-800/80 hover:bg-red-700/80 text-red-100 border border-red-700/50 shadow-lg shadow-red-900/20'
                  : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-700/30'}`}
            >
              <Users className="w-4 h-4" />
              {allWon ? 'Ir a la Ronda de Killers' : `Faltan victorias (${matches.filter(m => m?.result === 'win').length}/${matches.length})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      })()}
    </div>
  );
}