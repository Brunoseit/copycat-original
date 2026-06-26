import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Shield, ZoomIn } from 'lucide-react';
import SurvivorMatchCard from './SurvivorMatchCard';
import ImageLightbox from './ImageLightbox';
import { useAssets } from '@/lib/AssetsContext';
import { getPlayerName, WIN_CONDITIONS } from '../../data/dbdData';

export default function SurvivorPhase({ state, onSaveBuild, onWin, onStartKiller, onUploadImage, onToggleExpand }) {
  const { findChar, findPerk } = useAssets();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const matches = state.survivor_matches || [];
  const images = state.survivor_match_images || [];
  const expanded = state.survivor_expanded || [];
  const escapes = WIN_CONDITIONS[state.difficulty]?.[state.num_players];

  // Individual pools (survivor builds from each player's killer match in previous cycle)
  const pools = state.individual_pools || {};
  const hasPools = Object.keys(pools).length > 0;

  // Per-player killer match screenshots from previous cycle (survivors faced)
  const prevKillerImages = state.prev_killer_images || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          <span className="text-red-500">Ronda de Supervivientes</span> · Ciclo {state.cycle}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Juega como equipo de supervivientes. Cada victoria guarda el Killer enfrentado en la pool.
          {' '}Deben escapar <span className="text-red-400 font-semibold">{escapes}</span> de {state.num_players}.
        </p>
      </motion.div>

      {/* Individual pools with per-player image from previous killer round */}
      {hasPools && (
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Pool individual de survis (ciclo anterior)
          </h3>
          {Object.entries(pools).map(([pIdx, builds]) => {
            const pi = Number(pIdx);
            const pName = getPlayerName(state.player_names, pi);
            const prevImg = prevKillerImages[pi];
            return (
              <div key={pIdx} className="bg-zinc-900/70 border border-zinc-800/60 rounded-xl overflow-hidden">
                {/* Player name header */}
                <div className="px-4 py-2.5 bg-zinc-800/50 border-b border-zinc-700/30">
                  <span className="text-sm font-semibold text-zinc-200">{pName}</span>
                </div>

                <div className="p-3 space-y-3">
                  {/* Previous cycle killer match screenshot - square, with lightbox */}
                  {prevImg ? (
                    <div
                      className="rounded-lg overflow-hidden border border-zinc-700/50 cursor-zoom-in group/pi relative"
                      onClick={() => setLightboxSrc(prevImg)}
                    >
                      <div className="aspect-square w-full">
                        <img src={prevImg} alt={`Survis de ${pName}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-2 left-2 opacity-0 group-hover/pi:opacity-100 transition-opacity pointer-events-none">
                        <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Ver
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 px-2 py-1">Survis enfrentados (ciclo anterior)</p>
                    </div>
                  ) : (
                    <div className="w-full h-16 rounded-lg border border-dashed border-zinc-700/40 bg-zinc-800/20 flex items-center justify-center text-xs text-zinc-600">
                      Sin screenshot del ciclo anterior
                    </div>
                  )}

                  {/* Survivor builds (manual, if set) */}
                  {(builds || []).some(b => b?.characterId) && (
                    <div className="space-y-1">
                      {(builds || []).filter(b => b?.characterId).map((b, i) => (
                        <div key={i} className="text-[11px] text-blue-300/90 truncate px-1">
                          {findChar(b.characterId)?.nombre || '—'} · {(b.perkIds || []).map(id => findPerk(id)?.nombre).filter(Boolean).join(', ') || 'sin perks'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match cards */}
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

      {/* Advance to killer phase — requires all matches won */}
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