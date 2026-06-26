//@ts-nocheck
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Trophy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import BuildEditor from './BuildEditor';
import ImageUploadButton from './ImageUploadButton';
import { useAssets } from '@/lib/AssetsContext';

export default function SurvivorMatchCard({
  index, match, imageUrl, expanded, onToggleExpand,
  onUploadImage, onSaveBuild, onWin,
}) {
  const { killers, perks } = useAssets();
  const killerPerks = (perks|| []).filter(p => p.rol === 'killer');
  const won = match?.result === 'win';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900/70 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300
        ${won ? 'border-green-800/50 ring-1 ring-green-900/30' : 'border-zinc-800/60 hover:border-zinc-700/60'}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Skull className="w-4 h-4 text-red-500 shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-300 truncate">Partida {index + 1}</h3>
        </div>

        {won && (
          <span className="flex items-center gap-1 text-xs text-green-400 ml-auto shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Killer guardado
          </span>
        )}

        {!won && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onWin(index)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-green-800/70 hover:bg-green-700/70 text-green-100 border border-green-700/50 transition-all"
            >
              <Trophy className="w-3.5 h-3.5" /> Victoria
            </button>
            <button
              onClick={() => onToggleExpand(index)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Image area */}
      <div className="px-4 pb-1">
        <ImageUploadButton
          onUpload={(url) => onUploadImage(index, url)}
          onDelete={() => onUploadImage(index, '')}
          currentImage={imageUrl}
          disabled={won}
          compact
        />
      </div>

      {/* Expandable manual editor */}
      <AnimatePresence>
        {expanded && !won && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-zinc-800/60 mt-2">
              <BuildEditor
                role="killer"
                characters={killers}
                perks={killerPerks}
                value={{ characterId: match?.characterId, perkIds: match?.perkIds }}
                onChange={(b) => onSaveBuild(index, b)}
                disabled={won}
                characterLabel="Killer enfrentado"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}