import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Trophy, X, ChevronDown, ChevronUp, CheckCircle2, Users, Camera, ZoomIn } from 'lucide-react';
import BuildEditor from './BuildEditor';
import ImageUploadButton from './ImageUploadButton';
import ImageLightbox from './ImageLightbox';
import { useAssets } from '@/lib/AssetsContext';

export default function KillerMatchCard({
  index, killsNeeded, facedCount,
  poolKillerOptions, allPlayerNames, assignedPlayerIndex,
  assignment, match, killerImageUrl, survivorImageUrl,
  onUploadKillerImage, onUploadSurvivorImage, onUpdateAssignment,
  onSaveFaced, onWin, onLose, onReassign,
}) {
  const { perks, survivors } = useAssets();
  const killerPerks = perks.filter(p => p.rol === 'killer');
  const survivorPerks = perks.filter(p => p.rol === 'survivor');
  const [buildOpen, setBuildOpen] = useState(false);
  const [surviOpen, setSurviOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const result = match?.result;
  const faced = match?.faced || Array.from({ length: facedCount }, () => ({ characterId: null, perkIds: ['', '', '', ''] }));
  const playerName = allPlayerNames?.[index] || `Jugador ${index + 1}`;

  const setFaced = (i, build) => {
    const next = [...faced];
    next[i] = { ...next[i], ...build };
    onSaveFaced(index, next);
  };

  const completedFaced = faced.filter(b => b?.characterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900/70 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300
        ${result === 'win' ? 'border-green-800/50 ring-1 ring-green-900/30'
          : result === 'loss' ? 'border-red-800/60 ring-1 ring-red-900/40'
          : 'border-zinc-800/60'}`}
    >
      {/* Header: player name dropdown as title + result badge */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Skull className="w-4 h-4 text-red-500 shrink-0" />
        {result ? (
          <h3 className="text-sm font-semibold text-zinc-300">{playerName}</h3>
        ) : (
          <select
            value={assignedPlayerIndex ?? index}
            onChange={(e) => onReassign(index, Number(e.target.value))}
            className="text-sm font-semibold bg-zinc-900 border border-zinc-700/50 rounded-lg px-2 py-1 text-zinc-200 outline-none cursor-pointer hover:border-zinc-600/60 transition-colors"
          >
            {(allPlayerNames || []).map((n, i) => (
              <option key={i} value={i} className="bg-zinc-800 text-zinc-200">{n}</option>
            ))}
          </select>
        )}
        {result && (
          <span className={`flex items-center gap-1 text-xs ml-auto ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
            {result === 'win' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Victoria</> : <><X className="w-3.5 h-3.5" /> Derrota</>}
          </span>
        )}
      </div>

      <p className="px-4 text-[11px] text-zinc-500 mb-3">
        Objetivo: matar <span className="text-red-400 font-semibold">{killsNeeded}</span> superviviente(s)
      </p>

      {/* Two screenshots side by side */}
      <div className="px-4 pb-3 space-y-3">
        {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

        {/* Screenshot 1: Killer a jugar (from survivor round) */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Camera className="w-3 h-3" /> Killer que debes jugar
          </p>
          {killerImageUrl ? (
            <div
              className="rounded-lg overflow-hidden border border-zinc-700/50 cursor-zoom-in group/ki relative"
              onClick={() => setLightboxSrc(killerImageUrl)}
            >
              <img src={killerImageUrl} alt="Killer a jugar" className="w-full h-44 sm:h-52 object-cover" />
              <div className="absolute top-2 left-2 opacity-0 group-hover/ki:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Ver
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-20 rounded-lg border border-dashed border-zinc-700/40 bg-zinc-800/30 flex items-center justify-center text-xs text-zinc-600">
              Sin screenshot del killer a jugar
            </div>
          )}
        </div>

        {/* Screenshot 2: Survivors faced (uploadable) */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Camera className="w-3 h-3" /> Screenshot supervivientes enfrentados
          </p>
          <ImageUploadButton
            onUpload={(url) => onUploadSurvivorImage(index, url)}
            onDelete={survivorImageUrl ? () => onUploadSurvivorImage(index, '') : undefined}
            currentImage={survivorImageUrl}
            disabled={!!result}
          />
        </div>
      </div>

      {/* Expandable sections only when not yet decided */}
      {!result && (
        <>
          {/* Faced survivors collapsible */}
          <button
            onClick={() => setSurviOpen(!surviOpen)}
            className="mx-4 w-[calc(100%-2rem)] flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-300 text-xs font-semibold"
          >
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Supervivientes enfrentados (manual) ({completedFaced.length}/{facedCount})</span>
            {surviOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {surviOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 pt-2 space-y-3">
                  {Array.from({ length: facedCount }).map((_, i) => (
                    <div key={i} className="border border-zinc-800/60 rounded-lg p-3 bg-zinc-950/40">
                      <div className="text-[10px] text-zinc-500 uppercase mb-2">Superviviente #{i + 1}</div>
                      <BuildEditor
                        role="survivor"
                        characters={survivors}
                        perks={survivorPerks}
                        value={faced[i]}
                        onChange={(b) => setFaced(i, b)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Killer build: expandable */}
          <button
            onClick={() => setBuildOpen(!buildOpen)}
            className="mt-2 mx-4 w-[calc(100%-2rem)] flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 text-xs font-medium hover:bg-zinc-800/70 transition-all"
          >
            <span className="flex items-center gap-1.5"><Skull className="w-3 h-3 text-red-500" /> Build del Killer (manual)</span>
            {buildOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {buildOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pt-3 pb-1">
                  <BuildEditor
                    role="killer"
                    characters={poolKillerOptions}
                    perks={killerPerks}
                    value={assignment}
                    onChange={(b) => onUpdateAssignment(index, b)}
                    characterLabel="Killer asignado"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Win/Lose buttons */}
      {!result && (
        <div className="px-4 pb-4 pt-3 flex gap-2">
          <button
            onClick={() => onWin(index, faced)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              bg-green-800/70 hover:bg-green-700/70 text-green-100 border border-green-700/50"
          >
            <Trophy className="w-4 h-4" /> Victoria
          </button>
          <button
            onClick={() => onLose(index)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
              bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition-all duration-200"
          >
            <X className="w-4 h-4" /> Derrota
          </button>
        </div>
      )}
    </motion.div>
  );
}